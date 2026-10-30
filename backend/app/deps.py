"""FastAPI dependency injection — DB sessions, Redis, rate limiter, and concurrency guards."""

from __future__ import annotations

from collections.abc import AsyncGenerator

from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import async_session_factory
from app.services.rate_limit import rate_limiter


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Yield an async database session, auto-closing on exit."""
    async with async_session_factory() as session:
        yield session


def get_client_ip(request: Request) -> str:
    """Extract client IP address considering proxy headers."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "127.0.0.1"


async def check_rate_limit(request: Request) -> None:
    """FastAPI dependency: enforce per-client sliding window rate limits."""
    client_ip = get_client_ip(request)
    await rate_limiter.check_rate_limit(client_ip)


async def concurrency_guard() -> AsyncGenerator[None, None]:
    """FastAPI dependency: guard execution under a global concurrency cap."""
    lease_id = await rate_limiter.acquire_concurrency()
    try:
        yield
    finally:
        await rate_limiter.release_concurrency(lease_id)
