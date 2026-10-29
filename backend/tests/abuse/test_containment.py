"""Abuse tests: network attempts, file write attempts, forbidden imports, and deeply nested data."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_abuse_network_call(client: AsyncClient) -> None:
    """Test that attempts to make network calls via socket/urllib are rejected."""
    payload = {
        "code": "import socket\ns = socket.socket()",
    }
    resp = await client.post("/run", json=payload)
    assert resp.status_code == 400
    data = resp.json()
    assert data["error"] == "FORBIDDEN_IMPORT"
    assert "socket" in data.get("module", "")


@pytest.mark.asyncio
async def test_abuse_urllib_import(client: AsyncClient) -> None:
    """Test that attempts to import urllib/http are blocked."""
    payload = {
        "code": "import urllib.request\nurllib.request.urlopen('http://evil.com')",
    }
    resp = await client.post("/run", json=payload)
    assert resp.status_code == 400
    data = resp.json()
    assert data["error"] == "FORBIDDEN_IMPORT"


@pytest.mark.asyncio
async def test_abuse_sys_import(client: AsyncClient) -> None:
    """Test that importing sys or os.path is blocked."""
    payload = {
        "code": "from sys import exit\nexit(1)",
    }
    resp = await client.post("/run", json=payload)
    assert resp.status_code == 400
    data = resp.json()
    assert data["error"] == "FORBIDDEN_IMPORT"


@pytest.mark.asyncio
async def test_abuse_file_write(client: AsyncClient) -> None:
    """Test that unauthorized file writes are blocked or caught safely."""
    # Attempting to use open() or import os to write files
    payload = {
        "code": "with open('/tmp/evil.txt', 'w') as f:\n    f.write('hacked')",
    }
    resp = await client.post("/run", json=payload)
    # Either blocked or fails cleanly with execution error
    assert resp.status_code in (200, 400)
    if resp.status_code == 200:
        data = resp.json()
        assert data["error"] is not None


@pytest.mark.asyncio
async def test_abuse_deeply_nested_data(client: AsyncClient) -> None:
    """Test that deeply nested recursive structures do not crash the tracer."""
    payload = {
        "code": "d = {}\ncurr = d\nfor i in range(100):\n    curr['child'] = {}\n    curr = curr['child']\nprint('done')",
    }
    resp = await client.post("/run", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["steps"]) > 0
    assert not data["error"]
