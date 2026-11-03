"""Unit tests for standard input (stdin) handling in the execution sandbox."""

from __future__ import annotations

from sandbox.tracer import trace_code


def test_stdin_input_builtin() -> None:
    """Test reading multiple lines with input()."""
    code = """line1 = input()
line2 = input()
print(f"Read: {line1} and {line2}")
"""
    result = trace_code(code, stdin_content="First Line\nSecond Line\n")
    assert result["error"] is None
    assert len(result["steps"]) > 0
    last_step = result["steps"][-1]
    assert "Read: First Line and Second Line" in last_step["output"]


def test_stdin_read_all() -> None:
    """Test reading entire stdin buffer via sys.stdin.read()."""
    code = """import sys
data = sys.stdin.read()
lines = data.strip().splitlines()
print(f"Total lines: {len(lines)}")
"""
    result = trace_code(code, stdin_content="10\n20\n30\n")
    assert result["error"] is None
    last_step = result["steps"][-1]
    assert "Total lines: 3" in last_step["output"]


def test_stdin_readline() -> None:
    """Test reading individual line via sys.stdin.readline()."""
    code = """import sys
first = sys.stdin.readline().strip()
second = sys.stdin.readline().strip()
print(f"{first} -> {second}")
"""
    result = trace_code(code, stdin_content="alpha\nbeta\n")
    assert result["error"] is None
    last_step = result["steps"][-1]
    assert "alpha -> beta" in last_step["output"]


def test_stdin_empty() -> None:
    """Test running code without stdin provided."""
    code = """x = 42
print(x)
"""
    result = trace_code(code, stdin_content="")
    assert result["error"] is None
    assert "42" in result["steps"][-1]["output"]


def test_stdin_eof_error() -> None:
    """Test that reading past the end of input raises EOFError cleanly without hanging."""
    code = """a = input()
b = input()  # No second line available in stdin
"""
    result = trace_code(code, stdin_content="single_line\n")
    assert result["error"] is not None
    assert "EOFError" in result["error"]
    last_step = result["steps"][-1]
    assert last_step["event"] == "exception"
    assert "EOFError" in last_step.get("explanation", "")
