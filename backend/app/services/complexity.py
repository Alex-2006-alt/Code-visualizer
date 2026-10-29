"""Complexity analysis service.

Executes code across varying input sizes, counts line operations,
and estimates Big-O time complexity using least-squares curve fitting.
"""

from __future__ import annotations

import math

import structlog

from app.schemas import ComplexityPoint, ComplexityResponse
from app.services.sandbox import BaseSandboxRunner

logger = structlog.stdlib.get_logger(__name__)


def classify_complexity(points: list[ComplexityPoint]) -> str:
    """Classify Big-O complexity from (n, ops) measurement points."""
    if len(points) < 2:
        return "O(1)"

    ns = [float(p.n) for p in points]
    ops = [float(p.ops) for p in points]

    # Check if constant
    min_ops, max_ops = min(ops), max(ops)
    if min_ops > 0 and (max_ops - min_ops) / min_ops < 0.25:
        return "O(1)"

    # Compute correlation with candidate complexity models
    models: dict[str, list[float]] = {
        "O(1)": [1.0] * len(ns),
        "O(log n)": [math.log2(n) if n > 1 else 0.5 for n in ns],
        "O(n)": [n for n in ns],
        "O(n log n)": [n * math.log2(n) if n > 1 else n * 0.5 for n in ns],
        "O(n^2)": [n**2 for n in ns],
        "O(2^n)": [2.0 ** min(n, 20) for n in ns],
    }

    best_label = "O(n)"
    best_residual = float("inf")

    # Simple least-squares linear scaling: ops ≈ c * f(n)
    for label, expected in models.items():
        dot_product = sum(e * y for e, y in zip(expected, ops, strict=False))
        norm_sq = sum(e * e for e in expected)
        if norm_sq == 0:
            continue

        c = dot_product / norm_sq
        if c <= 0:
            continue

        # Normalized root-mean-square error
        residual = math.sqrt(
            sum((y - c * e) ** 2 for e, y in zip(expected, ops, strict=False)) / len(ops)
        ) / (max(ops) if max(ops) > 0 else 1.0)

        if residual < best_residual:
            best_residual = residual
            best_label = label

    return best_label


class ComplexityService:
    """Runs a function across multiple input sizes and calculates Big-O complexity."""

    def __init__(self, runner: BaseSandboxRunner) -> None:
        self.runner = runner

    async def analyze(
        self,
        code: str,
        function_name: str,
        sizes: list[int],
    ) -> ComplexityResponse:
        """Run function against multiple sizes, measure ops, and classify complexity."""
        # Clean and sort sizes
        clean_sizes = sorted(s for s in sizes if s > 0)[:6]
        if not clean_sizes:
            clean_sizes = [2, 4, 8, 16]

        points: list[ComplexityPoint] = []

        for n in clean_sizes:
            # Wrap code with invocation passing n or list(range(n))
            harness = f"""{code}

# Test invocation for size n = {n}
try:
    __ans__ = {function_name}({n})
except TypeError:
    __ans__ = {function_name}(list(range({n})))
"""
            try:
                result = await self.runner.run(code=harness)
                # Count line execution steps
                line_steps = [s for s in result.steps if s.event == "line"]
                ops = max(1, len(line_steps))
            except Exception as e:
                logger.warning("complexity_run_failed", n=n, error=str(e))
                ops = n

            points.append(ComplexityPoint(n=n, ops=ops))

        label = classify_complexity(points)
        return ComplexityResponse(points=points, label=label)
