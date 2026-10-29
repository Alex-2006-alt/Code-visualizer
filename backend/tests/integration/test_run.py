"""Integration tests for the code execution endpoints (/run and /api/run)."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_run_success(client: AsyncClient) -> None:
    """Test successful execution of Python code returning steps."""
    payload = {
        "code": "total = 0\nfor i in range(3):\n    total += i\nprint(total)",
    }
    resp = await client.post("/run", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "steps" in data
    assert len(data["steps"]) > 0
    assert not data["truncated"]
    assert not data["step_limit_reached"]
    assert data["error"] is None

    # Verify last step output has "3\n"
    last_step = data["steps"][-1]
    assert "3" in last_step["output"]


@pytest.mark.asyncio
async def test_run_api_path(client: AsyncClient) -> None:
    """Test /api/run path works identically to /run."""
    payload = {"code": "x = 42\ny = x * 2"}
    resp = await client.post("/api/run", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["steps"]) >= 2


@pytest.mark.asyncio
async def test_run_empty_code(client: AsyncClient) -> None:
    """Test empty code returns 400 Bad Request."""
    resp = await client.post("/run", json={"code": "   "})
    assert resp.status_code == 400
    assert "empty" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_run_syntax_error(client: AsyncClient) -> None:
    """Test syntax error returns 400."""
    payload = {"code": "def broken(\n    pass"}
    resp = await client.post("/run", json=payload)
    assert resp.status_code == 400
    assert "SyntaxError" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_run_forbidden_import(client: AsyncClient) -> None:
    """Test importing unauthorized modules returns 400 FORBIDDEN_IMPORT."""
    payload = {"code": "import subprocess\nsubprocess.run('ls')"}
    resp = await client.post("/run", json=payload)
    assert resp.status_code == 400
    data = resp.json()
    assert data["error"] == "FORBIDDEN_IMPORT"


@pytest.mark.asyncio
async def test_run_code_too_large(client: AsyncClient) -> None:
    """Test code exceeding size limit returns 400 CODE_TOO_LARGE."""
    huge_code = "# Comment\n" + "x = 1\n" * 3000  # > 18 KB (limit 10 KB)
    resp = await client.post("/run", json={"code": huge_code})
    assert resp.status_code == 400
    data = resp.json()
    assert data["error"] == "CODE_TOO_LARGE"
