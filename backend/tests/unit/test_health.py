"""Unit tests for the health check endpoint."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient) -> None:
    """Test /health and /api/health return 200 with status ok."""
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}

    resp_api = await client.get("/api/health")
    assert resp_api.status_code == 200
    assert resp_api.json() == {"status": "ok"}

