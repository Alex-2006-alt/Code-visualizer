"""Integration tests for Practice Mode endpoints and sandbox evaluation harness.

Verifies:
1. GET /api/problems lists all 20 curated problems with metadata.
2. GET /api/problems/{id} returns statement and visible tests without leaking hidden tests.
3. POST /api/problems/{id}/submit evaluates correct solution with 100% pass rate.
4. Hidden tests in submit response never expose input or expected values.
5. Wrong solution fails the correct tests.
6. Exceptions during execution are caught and labeled 'error'.
7. Forbidden imports (e.g. import os) are rejected with 400.
"""

from __future__ import annotations

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.mark.anyio
async def test_list_problems():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/problems")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 20
        first = data[0]
        assert "id" in first
        assert "title" in first
        assert "difficulty" in first
        assert "category" in first
        assert "test_count" in first
        assert first["test_count"] >= 8


@pytest.mark.anyio
async def test_get_problem_detail_hides_hidden_tests():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/problems/two-sum")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "two-sum"
        assert "starter_code" in data
        assert "statement" in data
        assert "constraints" in data
        assert len(data["constraints"]) > 0

        # Security check: MUST ONLY contain visible example tests
        examples = data["example_tests"]
        assert len(examples) >= 2
        for t in examples:
            assert t["visible"] is True
            assert "input" in t
            assert "expected" in t


@pytest.mark.anyio
async def test_get_problem_not_found():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/problems/non-existent-problem-xyz")
        assert response.status_code == 404


@pytest.mark.anyio
async def test_submit_correct_solution():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Load reference solution for binary-search
        correct_code = """def search(nums: list[int], target: int) -> int:
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
"""
        response = await client.post("/api/problems/binary-search/submit", json={"code": correct_code})
        assert response.status_code == 200
        data = response.json()
        assert data["problem_id"] == "binary-search"
        assert data["all_passed"] is True
        assert data["passed_count"] == data["total_count"]
        assert data["total_count"] >= 8

        # Security check: hidden tests must not leak input or expected
        for res in data["results"]:
            assert res["status"] == "passed"
            if not res["visible"]:
                assert res.get("input") is None
                assert res.get("expected") is None


@pytest.mark.anyio
async def test_submit_wrong_solution():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        wrong_code = """def search(nums: list[int], target: int) -> int:
    return -1
"""
        response = await client.post("/api/problems/binary-search/submit", json={"code": wrong_code})
        assert response.status_code == 200
        data = response.json()
        assert data["all_passed"] is False
        assert data["passed_count"] < data["total_count"]

        # Check failing tests
        failures = [r for r in data["results"] if r["status"] == "failed"]
        assert len(failures) > 0


@pytest.mark.anyio
async def test_submit_exception_in_solution():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        error_code = """def search(nums: list[int], target: int) -> int:
    raise RuntimeError("Intentional algorithm explosion")
"""
        response = await client.post("/api/problems/binary-search/submit", json={"code": error_code})
        assert response.status_code == 200
        data = response.json()
        assert data["all_passed"] is False
        error_results = [r for r in data["results"] if r["status"] == "error"]
        assert len(error_results) > 0
        assert "RuntimeError" in error_results[0]["error"]


@pytest.mark.anyio
async def test_submit_malicious_code_rejected():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        malicious_code = """import os
def search(nums: list[int], target: int) -> int:
    os.system("echo hacked")
    return 0
"""
        response = await client.post("/api/problems/binary-search/submit", json={"code": malicious_code})
        assert response.status_code == 400
        assert "FORBIDDEN_IMPORT" in response.text
