"""Regression tests verifying real dynamic execution and no canned traces in backend."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_different_programs_return_different_traces(client: AsyncClient) -> None:
    """Verify that different input programs execute independently and return distinct traces."""
    code_a = "val_a = 100\nprint('output_a:', val_a)"
    code_b = "val_b = 200\nprint('output_b:', val_b)"

    res_a = await client.post("/api/run", json={"code": code_a})
    assert res_a.status_code == 200
    data_a = res_a.json()

    res_b = await client.post("/api/run", json={"code": code_b})
    assert res_b.status_code == 200
    data_b = res_b.json()

    # Steps and outputs must differ completely
    assert data_a["steps"] != data_b["steps"]
    assert "output_a: 100" in data_a["steps"][-1]["output"]
    assert "output_b: 200" in data_b["steps"][-1]["output"]

    # Verify locals in call stacks
    locals_a = data_a["steps"][-1]["stack"][-1]["locals"]
    locals_b = data_b["steps"][-1]["stack"][-1]["locals"]
    assert "val_a" in locals_a
    assert "val_b" not in locals_a
    assert "val_b" in locals_b
    assert "val_a" not in locals_b


@pytest.mark.asyncio
async def test_same_program_twice_returns_identical_trace(client: AsyncClient) -> None:
    """Verify deterministic execution produces identical traces for identical code."""
    code = "sum_val = sum([1, 2, 3, 4, 5])\nprint('sum:', sum_val)"

    res_1 = await client.post("/api/run", json={"code": code})
    assert res_1.status_code == 200
    data_1 = res_1.json()

    res_2 = await client.post("/api/run", json={"code": code})
    assert res_2.status_code == 200
    data_2 = res_2.json()

    assert len(data_1["steps"]) == len(data_2["steps"])
    assert data_1["steps"][-1]["output"] == data_2["steps"][-1]["output"]
    assert data_1["steps"][-1]["stack"][-1]["locals"] == data_2["steps"][-1]["stack"][-1]["locals"]


@pytest.mark.asyncio
async def test_no_canned_responses_for_arbitrary_code(client: AsyncClient) -> None:
    """Verify execution of arbitrary custom code is never hijacked by presets like Two Sum."""
    salt = "custom_token_987654321"
    code = f'marker = "{salt}"\nprint("verified:", marker)'

    response = await client.post("/api/run", json={"code": code})
    assert response.status_code == 200
    data = response.json()

    steps = data["steps"]
    assert len(steps) > 0
    final_output = steps[-1]["output"]
    assert f"verified: {salt}" in final_output

    # Assert definitely not Two Sum or Bubble Sort
    top_locals = steps[-1]["stack"][-1]["locals"]
    assert "numbers" not in top_locals
    assert "res" not in top_locals
    assert "seen" not in top_locals
    assert "marker" in top_locals
    assert top_locals["marker"] == salt
