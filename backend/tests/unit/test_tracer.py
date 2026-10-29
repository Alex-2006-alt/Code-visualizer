"""Unit tests for the execution tracer engine (sandbox/tracer.py)."""

from __future__ import annotations

from sandbox.tracer import trace_code


def test_tracer_loops() -> None:
    """Test loop execution tracing."""
    code = """total = 0
for i in range(3):
    total += i
"""
    result = trace_code(code)
    assert not result["truncated"]
    assert result["error"] is None
    assert len(result["steps"]) > 0

    # Ensure total is tracked in locals
    last_step = result["steps"][-1]
    top_frame = last_step["stack"][-1]
    assert top_frame["locals"]["total"] == 3


def test_tracer_recursion() -> None:
    """Test recursive function call stack depth and return values."""
    code = """def fact(n):
    if n <= 1:
        return 1
    return n * fact(n - 1)

ans = fact(3)
"""
    result = trace_code(code)
    assert not result["truncated"]
    assert result["error"] is None

    # Check for call events
    call_steps = [s for s in result["steps"] if s["event"] == "call"]
    assert len(call_steps) >= 3  # fact(3), fact(2), fact(1)

    # Check for return events and return value
    return_steps = [s for s in result["steps"] if s["event"] == "return"]
    assert len(return_steps) >= 3

    # Check final answer
    last_step = result["steps"][-1]
    assert last_step["stack"][-1]["locals"]["ans"] == 6


def test_tracer_mutation() -> None:
    """Test detection of mutatedVariable when values change."""
    code = """x = 10
x = 20
y = 30
"""
    result = trace_code(code)
    steps = result["steps"]

    # Verify that mutation was flagged on x
    mutated_vars = [s.get("mutatedVariable") for s in steps if s.get("mutatedVariable")]
    assert "x" in mutated_vars
    assert "y" in mutated_vars


def test_tracer_shared_references() -> None:
    """Test shared heap reference between two variables."""
    code = """a = [10, 20]
b = a
b.append(30)
"""
    result = trace_code(code)
    assert result["error"] is None
    last_step = result["steps"][-1]
    top_locals = last_step["stack"][-1]["locals"]

    # Both a and b should reference the SAME pointer address
    addr_a = top_locals["a"]
    addr_b = top_locals["b"]
    assert addr_a.startswith("0x")
    assert addr_a == addr_b

    # Heap objects should contain this address with the updated value
    heap_objs = last_step["heapObjects"]
    assert len(heap_objs) >= 1
    obj = next(o for o in heap_objs if o["address"] == addr_a)
    assert obj["value"] == [10, 20, 30]


def test_tracer_exceptions() -> None:
    """Test capture of runtime exceptions."""
    code = """x = 10
y = 0
z = x / y
"""
    result = trace_code(code)
    assert result["error"] is not None
    assert "ZeroDivisionError" in result["error"]

    # Final step should be exception event
    exc_steps = [s for s in result["steps"] if s["event"] == "exception"]
    assert len(exc_steps) >= 1
    assert "ZeroDivisionError" in exc_steps[-1].get("explanation", "")


def test_tracer_step_cap() -> None:
    """Test that execution stops when max_steps is reached."""
    code = """while True:
    pass
"""
    result = trace_code(code, max_steps=25)
    assert result["truncated"] is True
    assert result["step_limit_reached"] is True
    assert len(result["steps"]) <= 30


def test_tracer_output_cap() -> None:
    """Test stdout capture and capping at max_output_bytes."""
    code = """for i in range(100):
    print("A" * 50)
"""
    result = trace_code(code, max_output_bytes=200)
    last_step = result["steps"][-1]
    assert "[Output Truncated]" in last_step["output"]


def test_tracer_forbidden_import() -> None:
    """Test that unauthorized imports are blocked at runtime."""
    code = """import os
os.listdir()
"""
    result = trace_code(code)
    assert result["error"] is not None
    assert "forbidden" in result["error"].lower()
