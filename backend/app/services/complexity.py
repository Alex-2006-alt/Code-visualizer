"""Complexity analysis service.

Executes code across varying input sizes, measures line operations,
heap container elements, and call-stack depth, then estimates Big-O
time and space complexity using normalized least-squares and log-log slope.
"""

from __future__ import annotations

import ast
import hashlib
import math
import random
from typing import Any

import structlog

from app.schemas import ComplexityPoint, ComplexityResponse
from app.services.sandbox import BaseSandboxRunner

logger = structlog.stdlib.get_logger(__name__)

# In-memory cache for complexity analysis
_COMPLEXITY_CACHE: dict[str, ComplexityResponse] = {}


def _analyze_ast_hints(code: str, function_name: str) -> dict[str, Any]:
    """Inspect function AST for loops, recursion, built-ins, and parameters."""
    hints = {
        "found": False,
        "param_count": 1,
        "param_names": [],
        "nested_loops": False,
        "loop_count": 0,
        "recursive_calls": 0,
        "uses_builtin_sort": False,
        "uses_linear_builtin": False,
        "notes": [],
    }

    try:
        tree = ast.parse(code)
    except Exception:
        return hints

    target_def: ast.FunctionDef | None = None
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef) and node.name == function_name:
            target_def = node
            break

    if not target_def:
        return hints

    hints["found"] = True
    hints["param_names"] = [a.arg for a in target_def.args.args]
    hints["param_count"] = len(hints["param_names"])

    # Check for loops and nested loops
    def check_loops(parent_node: ast.AST, depth: int = 0) -> int:
        max_depth = depth
        for child in ast.iter_child_nodes(parent_node):
            if isinstance(child, (ast.For, ast.While)):
                hints["loop_count"] += 1
                curr_depth = check_loops(child, depth + 1)
                max_depth = max(max_depth, curr_depth)
            else:
                curr_depth = check_loops(child, depth)
                max_depth = max(max_depth, curr_depth)
        return max_depth

    loop_nesting = check_loops(target_def, 0)
    if loop_nesting >= 2:
        hints["nested_loops"] = True

    # Check calls inside target function
    for node in ast.walk(target_def):
        if isinstance(node, ast.Call):
            # Recursion check
            if isinstance(node.func, ast.Name) and node.func.id == function_name:
                hints["recursive_calls"] += 1
            # Built-in sort check
            if isinstance(node.func, ast.Name) and node.func.id == "sorted":
                hints["uses_builtin_sort"] = True
            elif isinstance(node.func, ast.Attribute) and node.func.attr == "sort":
                hints["uses_builtin_sort"] = True
            # Other built-ins
            elif isinstance(node.func, ast.Name) and node.func.id in {"min", "max", "sum"}:
                hints["uses_linear_builtin"] = True

    if hints["uses_builtin_sort"]:
        hints["notes"].append("Uses built-in sort (actual time is at least O(n log n)).")
    if hints["recursive_calls"] > 1:
        hints["notes"].append("Multiple recursive calls detected (likely branching recursion).")

    return hints


def _generate_input_values(
    input_kind: str,
    n: int,
    case: str,
) -> tuple[Any, ...]:
    """Generate deterministic inputs for function execution."""
    rng = random.Random(42 + n)

    if input_kind == "string":
        return ("a" * n,)

    if input_kind == "int_n":
        return (n,)

    if input_kind == "sorted_int_list":
        return (list(range(n)),)

    if input_kind == "reversed_int_list":
        return (list(range(n - 1, -1, -1)),)

    if input_kind == "int_list_and_target":
        nums = list(range(n))
        if case == "best":
            target = 0
        elif case == "worst":
            target = -1
        else:
            target = n // 2
        return (nums, target)

    # default: int_list
    if case == "best":
        nums = list(range(n))
    elif case == "worst":
        nums = list(range(n - 1, -1, -1))
    else:
        nums = [rng.randint(0, max(100, n * 5)) for _ in range(n)]
    return (nums,)


def _fit_curve(
    ns: list[int],
    values: list[float],
    candidate_models: list[str] | None = None,
) -> tuple[str, float, str, float]:
    """Fit values against Big-O candidate models using normalized least-squares and log-log slope.

    Returns:
        (best_label, best_r2, next_best_label, next_best_r2)
    """
    if len(values) < 2:
        return "O(1)", 1.0, "O(n)", 0.0

    if candidate_models is None:
        candidate_models = ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n^2)", "O(n^3)", "O(2^n)"]

    n_float = [float(n) for n in ns]
    y_float = [float(v) for v in values]

    mean_y = sum(y_float) / len(y_float)
    ss_tot = sum((y - mean_y) ** 2 for y in y_float)

    # Check if nearly constant
    min_v, max_v = min(y_float), max(y_float)
    if ss_tot < 1e-4 or (min_v > 0 and (max_v - min_v) / min_v < 0.15):
        return "O(1)", 0.999, "O(log n)", 0.85

    # Compute log-log slope for polynomial check
    log_slope: float | None = None
    try:
        valid_pairs = [(math.log(n), math.log(y)) for n, y in zip(n_float, y_float) if n > 1 and y > 0]
        if len(valid_pairs) >= 2:
            mean_lx = sum(p[0] for p in valid_pairs) / len(valid_pairs)
            mean_ly = sum(p[1] for p in valid_pairs) / len(valid_pairs)
            denom = sum((p[0] - mean_lx) ** 2 for p in valid_pairs)
            if denom > 1e-6:
                log_slope = sum((p[0] - mean_lx) * (p[1] - mean_ly) for p in valid_pairs) / denom
    except Exception:
        log_slope = None

    scores: list[tuple[str, float]] = []

    for label in candidate_models:
        if label == "O(1)":
            expected = [1.0] * len(n_float)
        elif label == "O(log n)":
            expected = [math.log2(n) if n > 1 else 0.5 for n in n_float]
        elif label == "O(n)":
            expected = [n for n in n_float]
        elif label == "O(n log n)":
            expected = [n * math.log2(n) if n > 1 else n * 0.5 for n in n_float]
        elif label == "O(n^2)":
            expected = [n**2 for n in n_float]
        elif label == "O(n^3)":
            expected = [n**3 for n in n_float]
        elif label == "O(2^n)":
            expected = [2.0 ** min(n, 20) for n in n_float]
        else:
            continue

        dot = sum(e * y for e, y in zip(expected, y_float))
        norm_sq = sum(e * e for e in expected)
        if norm_sq == 0:
            continue

        c = dot / norm_sq
        if c <= 0:
            scores.append((label, 0.0))
            continue

        ss_res = sum((y - c * e) ** 2 for e, y in zip(expected, y_float))
        if ss_tot > 0:
            r2 = max(0.0, 1.0 - (ss_res / ss_tot))
        else:
            r2 = 1.0 if ss_res < 1e-4 else 0.0

        # Adjust score using log-log slope bonus/penalty if applicable
        if log_slope is not None:
            if label == "O(1)" and log_slope < 0.2:
                r2 += 0.05
            elif label == "O(log n)" and 0.1 <= log_slope <= 0.5:
                r2 += 0.05
            elif label == "O(n)" and 0.8 <= log_slope <= 1.25:
                r2 += 0.05
            elif label == "O(n log n)" and 1.1 <= log_slope <= 1.45:
                r2 += 0.05
            elif label == "O(n^2)" and 1.7 <= log_slope <= 2.3:
                r2 += 0.05
            elif label == "O(n^3)" and 2.7 <= log_slope <= 3.3:
                r2 += 0.05

        scores.append((label, min(0.999, round(r2, 3))))

    scores.sort(key=lambda s: s[1], reverse=True)
    best = scores[0] if scores else ("O(n)", 0.5)
    next_best = scores[1] if len(scores) > 1 else ("O(n)", 0.0)

    return best[0], best[1], next_best[0], next_best[1]


def classify_complexity(points: list[ComplexityPoint]) -> str:
    """Classify Big-O complexity from points for backward compatibility."""
    if len(points) < 2:
        return "O(1)"
    ns = [p.n for p in points]
    ops = [float(p.steps) for p in points]
    best_label, _, _, _ = _fit_curve(ns, ops)
    return best_label


class ComplexityService:
    """Runs a function across multiple input sizes and calculates Big-O complexity."""

    def __init__(self, runner: BaseSandboxRunner) -> None:
        self.runner = runner

    async def analyze(
        self,
        code: str,
        function_name: str,
        sizes: list[int] | None = None,
        input_kind: str = "int_list",
        case: str = "average",
    ) -> ComplexityResponse:
        """Run function against multiple sizes, measure time and space proxy, and classify complexity."""
        input_kind = input_kind.strip().lower()
        case = case.strip().lower()

        # Cache check
        cache_key = hashlib.sha256(
            f"{code.strip()}:{function_name}:{input_kind}:{case}:{sizes}".encode()
        ).hexdigest()
        if cache_key in _COMPLEXITY_CACHE:
            return _COMPLEXITY_CACHE[cache_key]

        ast_hints = _analyze_ast_hints(code, function_name)
        notes: list[str] = list(ast_hints["notes"])
        param_count = ast_hints.get("param_count", 1)
        param_names = ast_hints.get("param_names", [])

        # Determine safe sizes
        if sizes and len(sizes) > 0:
            clean_sizes = sorted(s for s in sizes if s > 0)[:7]
        else:
            if ast_hints["recursive_calls"] > 1:
                clean_sizes = [2, 4, 6, 8, 10, 12, 14]
            elif input_kind == "int_n":
                clean_sizes = [5, 10, 20, 40, 80]
            else:
                clean_sizes = [5, 10, 20, 40, 80]

        if not clean_sizes:
            clean_sizes = [5, 10, 20, 40]

        user_code_line_count = len(code.splitlines())
        points: list[ComplexityPoint] = []
        truncated = False

        for n in clean_sizes:
            args = _generate_input_values(input_kind, n, case)
            args_repr = ", ".join(repr(a) for a in args)

            # Determine primary call and fallback call based on param names / count
            if param_count == 1:
                if param_names and param_names[0] in {"n", "num", "size", "count"}:
                    primary_call = f"{function_name}({n})"
                    fallback_call = f"{function_name}({args_repr})"
                else:
                    primary_call = f"{function_name}({args_repr})"
                    fallback_call = f"{function_name}({n})"
            elif param_count == 2:
                if len(args) >= 2:
                    primary_call = f"{function_name}({args_repr})"
                    fallback_call = f"{function_name}({repr(args[0])}, {n})"
                else:
                    primary_call = f"{function_name}({args_repr}, {n})"
                    fallback_call = f"{function_name}({n}, {n})"
            else:
                primary_call = f"{function_name}({args_repr})"
                fallback_call = f"{function_name}({n})"

            # Build sandbox harness without forbidden imports
            harness = f"""{code}

# --- CodeTrace Complexity Harness ---
try:
    _ct_ans = {primary_call}
except TypeError:
    _ct_ans = {fallback_call}
"""
            try:
                result = await self.runner.run(code=harness)
                if result.truncated or result.step_limit_reached:
                    truncated = True

                # Count line execution steps belonging to user code functions
                fn_steps = [
                    s
                    for s in result.steps
                    if s.event == "line"
                    and s.line <= user_code_line_count
                    and any(f.fn == function_name or (f.fn != "<module>" and not f.fn.startswith("_ct_")) for f in s.stack)
                ]
                steps = max(1, len(fn_steps))

                # Identify initial input heap objects to separate auxiliary space
                initial_heap_ids: set[str] = set()
                first_fn_step = next(
                    (s for s in result.steps if any(f.fn == function_name for f in s.stack)),
                    None,
                )
                if first_fn_step:
                    if first_fn_step.heap_objects:
                        initial_heap_ids = {obj.id for obj in first_fn_step.heap_objects}
                    elif first_fn_step.heap:
                        initial_heap_ids = set(first_fn_step.heap.keys())

                # Measure space proxies: peak auxiliary container items & max stack depth
                peak_items = 0
                max_depth = 1

                for s in result.steps:
                    user_frames = [f for f in s.stack if f.fn != "<module>" and not f.fn.startswith("_ct_")]
                    if len(user_frames) > max_depth:
                        max_depth = len(user_frames)

                    curr_items = 0
                    if s.heap_objects:
                        for obj in s.heap_objects:
                            # Count auxiliary heap objects or growth
                            if obj.id not in initial_heap_ids:
                                val = obj.value
                                if isinstance(val, (list, dict, set)):
                                    curr_items += len(val)
                    elif s.heap:
                        for k, val in s.heap.items():
                            if k not in initial_heap_ids:
                                if isinstance(val, (list, dict, set)):
                                    curr_items += len(val)

                    if curr_items > peak_items:
                        peak_items = curr_items

            except Exception as e:
                logger.warning("complexity_run_failed", n=n, error=str(e))
                steps = n
                peak_items = 0
                max_depth = 1

            points.append(
                ComplexityPoint(
                    n=n,
                    steps=steps,
                    peak_items=peak_items,
                    depth=max_depth,
                )
            )

        # Fit time complexity
        ns = [p.n for p in points]
        step_vals = [float(p.steps) for p in points]
        time_label, time_r2, next_time, next_r2 = _fit_curve(ns, step_vals)

        # Fit auxiliary space complexity
        space_vals = [float(max(p.peak_items, p.depth)) for p in points]
        space_label, space_r2, _, _ = _fit_curve(
            ns, space_vals, candidate_models=["O(1)", "O(log n)", "O(n)", "O(n^2)"]
        )

        # If AST detects built-in sort and step count looks linear or constant:
        if ast_hints["uses_builtin_sort"] and time_label in {"O(1)", "O(log n)", "O(n)"}:
            time_label = "O(n log n)"
            confidence = "medium"
        elif time_r2 >= 0.95 and (time_r2 - next_r2 >= 0.04 or time_label == "O(1)"):
            confidence = "high"
        elif time_r2 >= 0.82:
            confidence = "medium"
        else:
            confidence = "low"

        fit_info = {
            "model": time_label,
            "r2": time_r2,
            "next_best": next_time,
            "next_r2": next_r2,
            "space_r2": space_r2,
        }

        response = ComplexityResponse(
            time_label=time_label,
            space_label=space_label,
            confidence=confidence,
            points=points,
            fit=fit_info,
            notes=notes,
            truncated=truncated,
            case=case,
        )

        # Cache result
        _COMPLEXITY_CACHE[cache_key] = response
        return response
