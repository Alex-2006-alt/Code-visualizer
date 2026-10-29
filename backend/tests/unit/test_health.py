"""Unit tests for the health check endpoint."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient) -> None:
    """Test /health and /api/health return 200 with status ok and request tracking headers."""
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}
    assert "x-request-id" in resp.headers
    assert "x-response-time-ms" in resp.headers

    # Custom request ID propagation
    custom_id = "test-custom-req-id-12345"
    resp_api = await client.get("/api/health", headers={"x-request-id": custom_id})
    assert resp_api.status_code == 200
    assert resp_api.json() == {"status": "ok"}
    assert resp_api.headers["x-request-id"] == custom_id
