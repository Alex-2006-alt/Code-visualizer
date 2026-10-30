"""Rate limiting and concurrency control service.

Provides sliding-window rate limits per client IP and global concurrency caps
backed by Redis, with an in-memory fallback for local development and test environments.
"""

from __future__ import annotations

import asyncio
import time
from collections import defaultdict
from typing import Any

import structlog

from app.config import get_settings
from app.core.errors import ConcurrencyLimitError, RateLimitError

logger = structlog.stdlib.get_logger(__name__)
settings = get_settings()

try:
    import redis.asyncio as aioredis
except ImportError:
    aioredis = None  # type: ignore[assignment]


class RateLimiter:
    """Sliding-window rate limiter and concurrency control manager."""

    def __init__(
        self,
        redis_url: str = settings.redis_url,
        per_minute: int = settings.rate_limit_per_minute,
        per_day: int = settings.rate_limit_per_day,
        max_concurrent: int = settings.max_concurrent_runs,
    ) -> None:
        self.redis_url = redis_url
        self.per_minute = per_minute
        self.per_day = per_day
        self.max_concurrent = max_concurrent
        self._redis: Any = None
        self._redis_available: bool = False
        self._last_redis_try: float = 0.0

        # In-memory fallback data structures
        self._in_memory_requests: dict[str, list[float]] = defaultdict(list)
        self._in_memory_active_leases: dict[str, float] = {}
        self._lock = asyncio.Lock()

    async def get_redis(self) -> Any:
        """Lazily initialize and return Redis client if available."""
        if aioredis is None:
            return None

        if self._redis is None:
            now = time.time()
            # If Redis connection recently failed, back off for 30s to avoid blocking requests
            if now - self._last_redis_try < 30.0:
                return None
            self._last_redis_try = now

            try:
                self._redis = aioredis.from_url(
                    self.redis_url,
                    decode_responses=True,
                    socket_connect_timeout=1.0,
                )
                # Quick ping to test connection
                await asyncio.wait_for(self._redis.ping(), timeout=1.0)
                self._redis_available = True
                logger.info("redis_connected", url=self.redis_url)
            except Exception as e:
                logger.warning("redis_unavailable_fallback_to_memory", error=str(e))
                self._redis_available = False
                self._redis = None

        return self._redis

    async def check_rate_limit(self, client_ip: str) -> None:
        """Enforce rate limits per client IP (minute & day windows)."""
        redis_client = await self.get_redis()

        if redis_client and self._redis_available:
            try:
                await self._check_redis_rate_limit(redis_client, client_ip)
                return
            except RateLimitError:
                raise
            except Exception as e:
                logger.warning("redis_rate_limit_failed_falling_back", error=str(e))

        # In-memory sliding-window fallback
        await self._check_in_memory_rate_limit(client_ip)

    async def _check_redis_rate_limit(self, redis_client: Any, client_ip: str) -> None:
        now = time.time()
        minute_key = f"rl:min:{client_ip}"
        day_key = f"rl:day:{client_ip}"

        pipe = redis_client.pipeline()
        pipe.zadd(minute_key, {str(now): now})
        pipe.zremrangebyscore(minute_key, 0, now - 60)
        pipe.zcard(minute_key)
        pipe.expire(minute_key, 65)

        pipe.zadd(day_key, {str(now): now})
        pipe.zremrangebyscore(day_key, 0, now - 86400)
        pipe.zcard(day_key)
        pipe.expire(day_key, 86500)

        results = await pipe.execute()
        min_count = results[2]
        day_count = results[6]

        if min_count > self.per_minute:
            raise RateLimitError(
                detail=f"Rate limit exceeded: {self.per_minute} requests per minute limit reached."
            )
        if day_count > self.per_day:
            raise RateLimitError(
                detail=f"Daily limit exceeded: {self.per_day} requests per day limit reached."
            )

    async def _check_in_memory_rate_limit(self, client_ip: str) -> None:
        async with self._lock:
            now = time.time()
            timestamps = self._in_memory_requests[client_ip]

            # Prune older than 1 day
            timestamps = [ts for ts in timestamps if ts > now - 86400]
            self._in_memory_requests[client_ip] = timestamps

            # Check 1 minute window
            min_count = sum(1 for ts in timestamps if ts > now - 60)
            if min_count >= self.per_minute:
                raise RateLimitError(
                    detail=f"Rate limit exceeded: {self.per_minute} requests per minute limit reached."
                )

            # Check 1 day window
            if len(timestamps) >= self.per_day:
                raise RateLimitError(
                    detail=f"Daily limit exceeded: {self.per_day} requests per day limit reached."
                )

            timestamps.append(now)

    async def acquire_concurrency(self) -> str:
        """Acquire a slot under the global concurrency limit."""
        redis_client = await self.get_redis()

        if redis_client and self._redis_available:
            try:
                active = await redis_client.incr("concurrency:active_runs")
                if active > self.max_concurrent:
                    await redis_client.decr("concurrency:active_runs")
                    raise ConcurrencyLimitError()
                return str(time.time_ns())
            except ConcurrencyLimitError:
                raise
            except Exception as e:
                logger.warning("redis_concurrency_failed", error=str(e))

        # In-memory concurrency fallback with auto-expiring safety lease
        async with self._lock:
            now = time.time()
            # Prune any stale lease older than 15s to guarantee no permanent leak
            self._in_memory_active_leases = {
                k: ts for k, ts in self._in_memory_active_leases.items() if now - ts < 15.0
            }
            if len(self._in_memory_active_leases) >= self.max_concurrent:
                raise ConcurrencyLimitError()
            lease_id = str(time.time_ns())
            self._in_memory_active_leases[lease_id] = now
            return lease_id

    async def release_concurrency(self, lease_id: str | None = None) -> None:
        """Release an acquired concurrency slot."""
        redis_client = await self.get_redis()

        if redis_client and self._redis_available:
            try:
                await redis_client.decr("concurrency:active_runs")
                return
            except Exception as e:
                logger.warning("redis_concurrency_release_failed", error=str(e))

        # In-memory fallback
        async with self._lock:
            now = time.time()
            if lease_id and lease_id in self._in_memory_active_leases:
                del self._in_memory_active_leases[lease_id]
            elif self._in_memory_active_leases:
                # Pop the oldest lease
                oldest = min(self._in_memory_active_leases, key=self._in_memory_active_leases.get)
                del self._in_memory_active_leases[oldest]
            # Prune expired
            self._in_memory_active_leases = {
                k: ts for k, ts in self._in_memory_active_leases.items() if now - ts < 15.0
            }

    async def close(self) -> None:
        """Close Redis connection pool on application shutdown."""
        if self._redis is not None:
            try:
                await self._redis.aclose()
            except Exception as e:
                logger.warning("redis_close_failed", error=str(e))
            self._redis = None
            self._redis_available = False


# Module-level singleton
rate_limiter = RateLimiter()
