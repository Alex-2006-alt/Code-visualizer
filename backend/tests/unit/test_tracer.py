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


def test_tracer_linked_structure_deep_traversal() -> None:
    """Test deep instance traversal beyond depth 2 up to depth 30 cap."""
    code = """class Node:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next

head = Node(0)
curr = head
for i in range(1, 40):
    curr.next = Node(i)
    curr = curr.next
"""
    result = trace_code(code)
    assert result["error"] is None
    last_step = result["steps"][-1]
    heap_objs = last_step["heapObjects"]
    assert len(heap_objs) == 31
    head_addr = last_step["stack"][-1]["locals"]["head"]
    head_obj = next(o for o in heap_objs if o["address"] == head_addr)
    assert head_obj["value"]["__class__"] == "Node"
    assert head_obj["value"]["fields"]["val"] == 0
    next_addr = head_obj["value"]["fields"]["next"]
    assert next_addr.startswith("0x")


def test_tracer_cyclic_references() -> None:
    """Test cycle detection in interconnected graph objects."""
    code = """class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

a = Node(1)
b = Node(2)
a.next = b
b.next = a
"""
    result = trace_code(code)
    assert result["error"] is None
    last_step = result["steps"][-1]
    heap_objs = last_step["heapObjects"]
    assert len(heap_objs) == 2
    a_obj = next(o for o in heap_objs if o["label"] == "a" or o["value"]["fields"]["val"] == 1)
    b_obj = next(o for o in heap_objs if o["label"] == "b" or o["value"]["fields"]["val"] == 2)
    assert a_obj["value"]["fields"]["next"] == b_obj["address"]
    assert b_obj["value"]["fields"]["next"] == a_obj["address"]


def test_tracer_binary_tree_structure() -> None:
    """Test binary tree node left and right pointer capturing."""
    code = """class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

root = TreeNode(10, TreeNode(5), TreeNode(15))
"""
    result = trace_code(code)
    assert result["error"] is None
    last_step = result["steps"][-1]
    heap_objs = last_step["heapObjects"]
    assert len(heap_objs) == 3
    root_addr = last_step["stack"][-1]["locals"]["root"]
    root_obj = next(o for o in heap_objs if o["address"] == root_addr)
    assert root_obj["value"]["fields"]["left"].startswith("0x")
    assert root_obj["value"]["fields"]["right"].startswith("0x")
