"""Unit and integration tests for the real complexity estimator service."""

from __future__ import annotations

import pytest
from app.services.complexity import ComplexityService, _analyze_ast_hints, _fit_curve
from app.services.sandbox import SubprocessSandboxRunner


def test_analyze_ast_hints() -> None:
    code_sort = """
def my_sort(arr):
    return sorted(arr)
"""
    hints = _analyze_ast_hints(code_sort, "my_sort")
    assert hints["found"] is True
    assert hints["uses_builtin_sort"] is True
    assert any("built-in sort" in n for n in hints["notes"])

    code_fib = """
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)
"""
    hints_fib = _analyze_ast_hints(code_fib, "fib")
    assert hints_fib["found"] is True
    assert hints_fib["recursive_calls"] == 2
    assert any("Multiple recursive calls" in n for n in hints_fib["notes"])

    code_nested = """
def mult_table(n):
    for i in range(n):
        for j in range(n):
            pass
"""
    hints_nested = _analyze_ast_hints(code_nested, "mult_table")
    assert hints_nested["found"] is True
    assert hints_nested["nested_loops"] is True


def test_fit_curve_models() -> None:
    # Constant
    best, r2, _, _ = _fit_curve([10, 20, 30, 40], [5.0, 5.0, 5.0, 5.0])
    assert best == "O(1)"

    # Linear
    best, r2, _, _ = _fit_curve([10, 20, 40, 80], [10.0, 20.0, 40.0, 80.0])
    assert best == "O(n)"

    # Quadratic
    best, r2, _, _ = _fit_curve([5, 10, 15, 20], [25.0, 100.0, 225.0, 400.0])
    assert best == "O(n^2)"


@pytest.mark.asyncio
async def test_complexity_service_linear_and_caching() -> None:
    runner = SubprocessSandboxRunner()
    service = ComplexityService(runner=runner)

    code = """
def linear_search(nums, target):
    for i, x in enumerate(nums):
        if x == target:
            return i
    return -1
"""
    # Worst case: target not in list, scans full array
    res = await service.analyze(
        code=code,
        function_name="linear_search",
        sizes=[5, 10, 15, 20],
        input_kind="int_list_and_target",
        case="worst",
    )

    assert res.time_label == "O(n)"
    assert res.space_label in {"O(1)", "O(log n)"}
    assert len(res.points) == 4
    assert res.points[-1].steps > res.points[0].steps

    # Test cache: identical second call
    res_cached = await service.analyze(
        code=code,
        function_name="linear_search",
        sizes=[5, 10, 15, 20],
        input_kind="int_list_and_target",
        case="worst",
    )
    assert res_cached is res


@pytest.mark.asyncio
async def test_complexity_service_builtin_sort_note() -> None:
    runner = SubprocessSandboxRunner()
    service = ComplexityService(runner=runner)

    code = """
def do_sort(nums):
    return sorted(nums)
"""
    res = await service.analyze(
        code=code,
        function_name="do_sort",
        sizes=[5, 10, 15, 20],
        input_kind="int_list",
    )

    # Note about built-in sort must be present
    assert any("built-in sort" in n for n in res.notes)
    # The label should reflect at least O(n log n)
    assert res.time_label == "O(n log n)"
