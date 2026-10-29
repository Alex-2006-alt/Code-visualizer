"""Integration tests for compare and complexity endpoints."""

from __future__ import annotations

import pytest
from app.main import app
from httpx import ASGITransport, AsyncClient


@pytest.mark.asyncio
async def test_compare_endpoint_success() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        payload = {
            "code_a": "x = 1\ny = 2\nz = x + y",
            "code_b": "def f(): return 42\nval = f()",
        }
        res = await client.post("/compare", json=payload)
        assert res.status_code == 200
        data = res.json()

        assert "a" in data
        assert "b" in data
        assert "step_counts" in data
        assert data["step_counts"]["a"] > 0
        assert data["step_counts"]["b"] > 0
        assert len(data["a"]["steps"]) > 0
        assert len(data["b"]["steps"]) > 0


@pytest.mark.asyncio
async def test_compare_endpoint_validation_error() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        res = await client.post("/compare", json={"code_a": "x = 1", "code_b": "   "})
        assert res.status_code == 400
        assert "Both code_a and code_b must be non-empty" in res.json()["detail"]


@pytest.mark.asyncio
async def test_complexity_linear_endpoint() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        payload = {
            "code": "def count_up(n):\n    s = 0\n    for i in range(n):\n        s += 1\n    return s\n",
            "function_name": "count_up",
            "sizes": [5, 10, 15, 20],
        }
        res = await client.post("/complexity", json=payload)
        assert res.status_code == 200
        data = res.json()

        assert "points" in data
        assert "label" in data
        assert len(data["points"]) == 4
        # Verify ops scale with n
        assert data["points"][0]["n"] == 5
        assert data["points"][-1]["n"] == 20
        assert data["points"][-1]["ops"] > data["points"][0]["ops"]
        assert data["label"] == "O(n)"


@pytest.mark.asyncio
async def test_complexity_quadratic_endpoint() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        payload = {
            "code": "def nested_sq(n):\n    ops = 0\n    for i in range(n):\n        for j in range(n):\n            ops += 1\n    return ops\n",
            "function_name": "nested_sq",
            "sizes": [3, 6, 9, 12],
        }
        res = await client.post("/api/complexity", json=payload)
        assert res.status_code == 200
        data = res.json()

        assert len(data["points"]) == 4
        assert data["label"] == "O(n^2)"


@pytest.mark.asyncio
async def test_complexity_invalid_function_name() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        payload = {
            "code": "def f(n): return n",
            "function_name": "123invalid!",
            "sizes": [2, 4],
        }
        res = await client.post("/complexity", json=payload)
        assert res.status_code == 400
        assert "Invalid function name" in res.json()["detail"]


@pytest.mark.asyncio
async def test_complexity_ast_security_rejection() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        payload = {
            "code": "import os\ndef f(n): return n",
            "function_name": "f",
            "sizes": [2, 4],
        }
        res = await client.post("/complexity", json=payload)
        assert res.status_code == 400
        assert "Import of 'os' is not allowed" in res.json()["detail"]
