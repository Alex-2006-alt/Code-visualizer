"""Integration tests for rate limiting (429) and concurrency limits (503)."""

from __future__ import annotations

import pytest
from app.services.rate_limit import rate_limiter
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_rate_limit_exceeded_429(client: AsyncClient) -> None:
    """Test that exceeding the per-minute rate limit returns 429 RATE_LIMITED."""
    # Temporarily set rate limit threshold low for test
    orig_limit = rate_limiter.per_minute
    rate_limiter.per_minute = 3
    client_ip = "192.168.1.100"

    try:
        # First 3 requests succeed
        for _ in range(3):
            resp = await client.post(
                "/run",
                json={"code": "x = 1"},
                headers={"x-forwarded-for": client_ip},
            )
            assert resp.status_code == 200

        # 4th request exceeds rate limit
        resp_blocked = await client.post(
            "/run",
            json={"code": "x = 1"},
            headers={"x-forwarded-for": client_ip},
        )
        assert resp_blocked.status_code == 429
        data = resp_blocked.json()
        assert data["error"] == "RATE_LIMITED"
        assert "Rate limit exceeded" in data["detail"]
    finally:
        rate_limiter.per_minute = orig_limit


@pytest.mark.asyncio
async def test_concurrency_limit_exceeded_503(client: AsyncClient) -> None:
    """Test that exceeding max concurrency slots returns 503 CONCURRENCY_LIMIT."""
    orig_concurrency = rate_limiter.max_concurrent
    rate_limiter.max_concurrent = 1

    try:
        # Artificially occupy all concurrency slots
        await rate_limiter.acquire_concurrency()

        resp = await client.post(
            "/run",
            json={"code": "x = 1"},
            headers={"x-forwarded-for": "10.0.0.5"},
        )
        assert resp.status_code == 503
        data = resp.json()
        assert data["error"] == "CONCURRENCY_LIMIT"
        assert "capacity" in data["detail"].lower()
    finally:
        await rate_limiter.release_concurrency()
        rate_limiter.max_concurrent = orig_concurrency

