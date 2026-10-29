"""Integration tests for examples and snippets endpoints."""

from __future__ import annotations

import pytest
from app.db import init_db
from app.main import app
from httpx import ASGITransport, AsyncClient


@pytest.fixture(autouse=True)
async def setup_test_db() -> None:
    """Ensure database schema exists before tests run."""
    await init_db()


@pytest.mark.asyncio
async def test_get_examples_endpoint() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        res = await client.get("/examples")
        assert res.status_code == 200
        data = res.json()
        assert isinstance(data, list)
        assert len(data) >= 5

        ids = [item["id"] for item in data]
        assert "bubble-sort" in ids
        assert "binary-search" in ids
        assert "recursive-fibonacci" in ids
        assert "depth-first-search" in ids
        assert "linked-list-reversal" in ids

        first = data[0]
        assert "title" in first
        assert "category" in first
        assert "difficulty" in first
        assert "code" in first
        assert "timeComplexity" in first
        assert "spaceComplexity" in first


@pytest.mark.asyncio
async def test_get_examples_api_prefix() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        res = await client.get("/api/examples")
        assert res.status_code == 200
        assert isinstance(res.json(), list)


@pytest.mark.asyncio
async def test_snippet_create_and_get() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        payload = {
            "code": "def hello():\n    return 'world'\n",
            "title": "Hello Function",
        }
        create_res = await client.post("/snippets", json=payload)
        assert create_res.status_code == 201
        res_data = create_res.json()
        assert "id" in res_data
        snippet_id = res_data["id"]
        assert len(snippet_id) == 8

        # Retrieve snippet
        get_res = await client.get(f"/snippets/{snippet_id}")
        assert get_res.status_code == 200
        snippet_data = get_res.json()
        assert snippet_data["id"] == snippet_id
        assert snippet_data["code"] == payload["code"]
        assert snippet_data["title"] == payload["title"]
        assert "created_at" in snippet_data

        # Also verify via /api/snippets/{id}
        api_get_res = await client.get(f"/api/snippets/{snippet_id}")
        assert api_get_res.status_code == 200
        assert api_get_res.json()["id"] == snippet_id


@pytest.mark.asyncio
async def test_snippet_create_empty_code() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        res = await client.post("/snippets", json={"code": "   "})
        assert res.status_code == 400
        assert "Snippet code cannot be empty" in res.json()["detail"]


@pytest.mark.asyncio
async def test_snippet_get_not_found() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        res = await client.get("/snippets/nonexistent-id-999")
        assert res.status_code == 404
        assert "was not found" in res.json()["detail"]
