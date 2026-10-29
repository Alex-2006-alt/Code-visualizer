"""Abuse tests: resource starvation, infinite loops, memory bombs, and fork bombs."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_abuse_infinite_loop(client: AsyncClient) -> None:
    """Test that an infinite loop is cleanly stopped by the step limit cap."""
    payload = {
        "code": "i = 0\nwhile True:\n    i += 1",
    }
    resp = await client.post("/run", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["truncated"] is True
    assert data["step_limit_reached"] is True
    assert len(data["steps"]) <= 2005


@pytest.mark.asyncio
async def test_abuse_fork_bomb(client: AsyncClient) -> None:
    """Test that attempts to fork processes via os or subprocess are blocked."""
    payload = {
        "code": "import os\nwhile True:\n    os.fork()",
    }
    resp = await client.post("/run", json=payload)
    assert resp.status_code == 400
    data = resp.json()
    assert data["error"] == "FORBIDDEN_IMPORT"


@pytest.mark.asyncio
async def test_abuse_huge_output(client: AsyncClient) -> None:
    """Test that printing huge output is capped at max_output_bytes without crashing."""
    payload = {
        "code": "for _ in range(500):\n    print('A' * 500)",
    }
    resp = await client.post("/run", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    last_step = data["steps"][-1]
    assert "[Output Truncated]" in last_step["output"]


@pytest.mark.asyncio
async def test_abuse_memory_bomb(client: AsyncClient) -> None:
    """Test that attempts to allocate excessive memory are capped or handled cleanly."""
    payload = {
        "code": "a = [0] * 1000000\nprint(len(a))",
    }
    resp = await client.post("/run", json=payload)
    # Either succeeds with serialized summary or is caught cleanly
    assert resp.status_code in (200, 400)
    if resp.status_code == 200:
        data = resp.json()
        assert len(data["steps"]) > 0
