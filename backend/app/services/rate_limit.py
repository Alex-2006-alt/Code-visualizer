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

        # In-memory fallback data structures
        self._in_memory_requests: dict[str, list[float]] = defaultdict(list)
        self._in_memory_concurrency: int = 0
        self._lock = asyncio.Lock()

    async def get_redis(self) -> Any:
        """Lazily initialize and return the async Redis connection."""
        if aioredis is None:
            return None

        if self._redis is None:
            try:
                self._redis = aioredis.from_url(
                    self.redis_url,
                    encoding="utf-8",
                    decode_responses=True,
                    socket_connect_timeout=1.0,
                )
                await self._redis.ping()
                self._redis_available = True
                logger.info("redis_connected", url=self.redis_url)
            except Exception as e:
                logger.warning("redis_unavailable_fallback_to_memory", error=str(e))
                self._redis = None
                self._redis_available = False
        return self._redis

    async def check_rate_limit(self, client_ip: str) -> None:
        """Check if client IP is within rate limits. Raises RateLimitError (429) if exceeded."""
        redis_client = await self.get_redis()
        now = time.time()

        if redis_client and self._redis_available:
            try:
                minute_key = f"ratelimit:{client_ip}:min:{int(now // 60)}"
                pipe = redis_client.pipeline()
                pipe.incr(minute_key)
                pipe.expire(minute_key, 65)
                results = await pipe.execute()
                current_count = results[0]

                if current_count > self.per_minute:
                    raise RateLimitError(
                        detail=f"Rate limit exceeded: max {self.per_minute} requests per minute."
                    )
                return
            except RateLimitError:
                raise
            except Exception as e:
                logger.warning("redis_rate_limit_failed", error=str(e))

        # In-memory sliding window fallback
        async with self._lock:
            timestamps = self._in_memory_requests[client_ip]
            one_minute_ago = now - 60.0
            # Evict timestamps older than 60s
            timestamps = [t for t in timestamps if t > one_minute_ago]
            self._in_memory_requests[client_ip] = timestamps

            if len(timestamps) >= self.per_minute:
                raise RateLimitError(
                    detail=f"Rate limit exceeded: max {self.per_minute} requests per minute."
                )

            timestamps.append(now)

    async def acquire_concurrency(self) -> None:
        """Acquire a slot under the global concurrency cap. Raises ConcurrencyLimitError (503) if full."""
        redis_client = await self.get_redis()

        if redis_client and self._redis_available:
            try:
                curr = await redis_client.incr("concurrency:active_runs")
                if curr > self.max_concurrent:
                    await redis_client.decr("concurrency:active_runs")
                    raise ConcurrencyLimitError()
                return
            except ConcurrencyLimitError:
                raise
            except Exception as e:
                logger.warning("redis_concurrency_failed", error=str(e))

        # In-memory concurrency fallback
        async with self._lock:
            if self._in_memory_concurrency >= self.max_concurrent:
                raise ConcurrencyLimitError()
            self._in_memory_concurrency += 1

    async def release_concurrency(self) -> None:
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
            if self._in_memory_concurrency > 0:
                self._in_memory_concurrency -= 1


# Module-level singleton
rate_limiter = RateLimiter()

