"""CodeTrace execution tracer engine.

Executes Python code with sys.settrace, capturing step-by-step
line execution, call stacks, variable states, virtual heap objects,
and stdout output under strict security and resource limits.
"""

from __future__ import annotations

import builtins
import io
import json
import sys
import types
from typing import Any

# Allowed modules for user code imports
IMPORT_ALLOWLIST: frozenset[str] = frozenset({
    "math",
    "random",
    "collections",
    "itertools",
    "heapq",
    "bisect",
    "functools",
    "string",
    "re",
    "typing",
})

DEFAULT_MAX_STEPS = 2000
DEFAULT_MAX_OUTPUT_BYTES = 65536
MAX_COLLECTION_LEN = 50
MAX_DEPTH = 2
USER_FILENAME = "<user>"


class StepLimitExceeded(Exception):
    """Raised when execution exceeds the maximum allowed step count."""


def _safe_serialize(val: Any, depth: int = 0) -> Any:
    """Recursively snapshot an object up to depth limit with collection capping."""
    if depth > MAX_DEPTH:
        return "..."

    if val is None or isinstance(val, (int, float, bool, str)):
        return val

    if isinstance(val, list):
        items = val[:MAX_COLLECTION_LEN]
        serialized: list[Any] = [_safe_serialize(x, depth + 1) for x in items]
        if len(val) > MAX_COLLECTION_LEN:
            serialized.append(f"... ({len(val) - MAX_COLLECTION_LEN} more items)")
        return serialized

    if isinstance(val, tuple):
        items_tuple = val[:MAX_COLLECTION_LEN]
        serialized_tuple: list[Any] = [_safe_serialize(x, depth + 1) for x in items_tuple]
        if len(val) > MAX_COLLECTION_LEN:
            serialized_tuple.append(f"... ({len(val) - MAX_COLLECTION_LEN} more items)")
        return serialized_tuple

    if isinstance(val, dict):
        result: dict[str, Any] = {}
        for i, (k, v) in enumerate(val.items()):
            if i >= MAX_COLLECTION_LEN:
                result["..."] = f"({len(val) - MAX_COLLECTION_LEN} more keys)"
                break
            result[str(k)] = _safe_serialize(v, depth + 1)
        return result

    if isinstance(val, set):
        items_set = list(val)[:MAX_COLLECTION_LEN]
        return [_safe_serialize(x, depth + 1) for x in items_set]

    # Other objects
    try:
        return str(val)
    except Exception:
        return f"<{type(val).__name__} instance>"


def _is_reference_type(val: Any) -> bool:
    """Return True if the object should be visualized as a virtual heap object."""
    return isinstance(val, (list, dict, set)) or (
        hasattr(val, "__dict__") and not isinstance(val, (int, float, str, bool, type(None)))
    )


def _get_heap_type(val: Any) -> str:
    """Determine the heap object type name."""
    if isinstance(val, list):
        return "list"
    if isinstance(val, dict):
        return "dict"
    if isinstance(val, set):
        return "set"
    return "object"


def _build_heap_and_locals(
    raw_locals: dict[str, Any],
) -> tuple[dict[str, Any], list[dict[str, Any]], dict[str, Any]]:
    """Extract locals snapshot, structured heapObjects, and address heap mapping."""
    clean_locals: dict[str, Any] = {}
    heap_objects_map: dict[str, dict[str, Any]] = {}
    heap_mapping: dict[str, Any] = {}

    for name, val in raw_locals.items():
        if name.startswith("__") and name.endswith("__"):
            continue

        if _is_reference_type(val):
            addr = hex(id(val))
            heap_type = _get_heap_type(val)
            snap_val = _safe_serialize(val, depth=1)

            # Store pointer address in locals
            clean_locals[name] = addr

            if addr not in heap_objects_map:
                heap_objects_map[addr] = {
                    "id": f"heap-{addr}",
                    "type": heap_type,
                    "address": addr,
                    "value": snap_val,
                    "label": name,
                }
            heap_mapping[addr] = snap_val
        else:
            clean_locals[name] = _safe_serialize(val, depth=1)

    return clean_locals, list(heap_objects_map.values()), heap_mapping


def _build_stack(current_frame: types.FrameType) -> list[dict[str, Any]]:
    """Walk frame.f_back stack up to module scope for <user> frames."""
    stack: list[dict[str, Any]] = []
    frame: types.FrameType | None = current_frame

    while frame is not None:
        if frame.f_code.co_filename == USER_FILENAME:
            clean_locals, _, _ = _build_heap_and_locals(frame.f_locals)
            fn_name = frame.f_code.co_name
            if fn_name == "<module>":
                fn_name = "<module>"

            stack.append({
                "fn": fn_name,
                "line": max(1, frame.f_lineno),
                "locals": clean_locals,
            })
        frame = frame.f_back

    stack.reverse()
    return stack


def _secure_import(
    name: str,
    globals_dict: dict[str, Any] | None = None,
    locals_dict: dict[str, Any] | None = None,
    fromlist: tuple[str, ...] = (),
    level: int = 0,
) -> Any:
    """Guarded import function restricting imports to the allowlist."""
    try:
        caller = sys._getframe(1)
        # Enforce allowlist on user code frames
        if caller.f_code.co_filename == USER_FILENAME:
            top_level = name.split(".")[0]
            if top_level not in IMPORT_ALLOWLIST:
                raise ImportError(f"Importing '{name}' is forbidden for security reasons.")
    except (ValueError, AttributeError):
        top_level = name.split(".")[0]
        if top_level not in IMPORT_ALLOWLIST:
            raise ImportError(f"Importing '{name}' is forbidden for security reasons.") from None

    return orig_import(name, globals_dict, locals_dict, fromlist, level)


def _blocked_open(*args: Any, **kwargs: Any) -> Any:
    """Prohibit arbitrary filesystem access via open() in sandbox."""
    raise PermissionError("Direct file system access via open() is prohibited in the sandbox.")


orig_import = builtins.__import__
orig_open = builtins.open


def trace_code(
    code: str,
    stdin_content: str = "",
    max_steps: int = DEFAULT_MAX_STEPS,
    max_output_bytes: int = DEFAULT_MAX_OUTPUT_BYTES,
) -> dict[str, Any]:
    """Execute Python code with step-by-step tracing and return execution data."""
    steps: list[dict[str, Any]] = []
    truncated = False
    runtime_error: str | None = None

    # Capture stdout
    stdout_capture = io.StringIO()
    stdin_capture = io.StringIO(stdin_content)

    prev_top_locals: dict[str, Any] = {}

    def trace_dispatcher(frame: types.FrameType, event: str, arg: Any) -> Any:
        nonlocal truncated, prev_top_locals

        # Only trace user code
        if frame.f_code.co_filename != USER_FILENAME:
            return trace_dispatcher

        if len(steps) >= max_steps:
            truncated = True
            raise StepLimitExceeded()

        if event in ("line", "call", "return", "exception"):
            # Check output size
            current_output = stdout_capture.getvalue()
            if len(current_output.encode("utf-8")) > max_output_bytes:
                current_output = current_output[:max_output_bytes] + "\n[Output Truncated]"

            # Build stack
            stack = _build_stack(frame)

            # Build heap and locals from current frame
            _, heap_objects, heap_mapping = _build_heap_and_locals(frame.f_locals)

            # Detect mutated variable
            current_top_locals = stack[-1]["locals"] if stack else {}
            mutated_var: str | None = None
            for k, v in current_top_locals.items():
                if k in prev_top_locals and prev_top_locals[k] != v:
                    mutated_var = k
                    break
                if k not in prev_top_locals:
                    mutated_var = k
                    break
            prev_top_locals = dict(current_top_locals)

            step_data: dict[str, Any] = {
                "event": event,
                "line": max(1, frame.f_lineno),
                "stack": stack,
                "output": current_output,
                "heap": heap_mapping,
                "heapObjects": heap_objects,
            }

            if mutated_var:
                step_data["mutatedVariable"] = mutated_var

            if event == "return":
                step_data["ret"] = _safe_serialize(arg, depth=1)

            if event == "exception":
                exc_type, exc_val, _ = arg
                step_data["explanation"] = f"{exc_type.__name__}: {exc_val}"

            steps.append(step_data)

        return trace_dispatcher

    # Setup sandbox environment
    old_stdout = sys.stdout
    old_stdin = sys.stdin
    sys.stdout = stdout_capture
    sys.stdin = stdin_capture
    builtins.__import__ = _secure_import  # type: ignore[assignment]
    builtins.open = _blocked_open

    # Compile user code
    try:
        compiled = compile(code, USER_FILENAME, "exec")
    except SyntaxError as e:
        sys.stdout = old_stdout
        sys.stdin = old_stdin
        builtins.__import__ = orig_import
        builtins.open = orig_open
        return {
            "steps": [],
            "truncated": False,
            "step_limit_reached": False,
            "error": f"SyntaxError: {e.msg} on line {e.lineno}",
        }
    except Exception as e:
        sys.stdout = old_stdout
        sys.stdin = old_stdin
        builtins.__import__ = orig_import
        builtins.open = orig_open
        return {
            "steps": [],
            "truncated": False,
            "step_limit_reached": False,
            "error": f"CompileError: {e}",
        }

    # Execute with tracer
    global_namespace: dict[str, Any] = {
        "__name__": "__main__",
        "__builtins__": builtins,
    }

    sys.settrace(trace_dispatcher)
    try:
        exec(compiled, global_namespace)
    except StepLimitExceeded:
        truncated = True
    except Exception as e:
        runtime_error = f"{type(e).__name__}: {e}"
        # Ensure the final exception step is captured if not already present
        if not steps or steps[-1].get("event") != "exception":
            final_output = stdout_capture.getvalue()
            steps.append({
                "event": "exception",
                "line": steps[-1]["line"] if steps else 1,
                "stack": steps[-1]["stack"] if steps else [],
                "output": final_output,
                "explanation": runtime_error,
            })
    finally:
        sys.settrace(None)
        sys.stdout = old_stdout
        sys.stdin = old_stdin
        builtins.__import__ = orig_import
        builtins.open = orig_open

    return {
        "steps": steps,
        "truncated": truncated,
        "step_limit_reached": truncated,
        "error": runtime_error,
    }


def main() -> None:
    """CLI entry point for sandbox runner (reads JSON from stdin)."""
    try:
        raw_input = sys.stdin.read()
        if not raw_input.strip():
            print(json.dumps({"steps": [], "truncated": False, "error": "Empty input"}))
            return

        try:
            payload = json.loads(raw_input)
            code = payload.get("code", "")
            stdin_content = payload.get("stdin", "")
            max_steps = payload.get("max_steps", DEFAULT_MAX_STEPS)
            max_output_bytes = payload.get("max_output_bytes", DEFAULT_MAX_OUTPUT_BYTES)
        except json.JSONDecodeError:
            # Fallback to plain code text
            code = raw_input
            stdin_content = ""
            max_steps = DEFAULT_MAX_STEPS
            max_output_bytes = DEFAULT_MAX_OUTPUT_BYTES

        result = trace_code(
            code=code,
            stdin_content=stdin_content,
            max_steps=max_steps,
            max_output_bytes=max_output_bytes,
        )
        print(json.dumps(result))
    except Exception as err:
        print(json.dumps({"steps": [], "truncated": False, "error": str(err)}))


if __name__ == "__main__":
    main()
