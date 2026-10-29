"""Dual-program execution comparison routes (/compare and /api/compare)."""

from __future__ import annotations

import asyncio
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.deps import check_rate_limit, concurrency_guard
from app.schemas import CompareRequest, CompareResponse, CompareRunResult
from app.services.sandbox import BaseSandboxRunner, get_sandbox_runner

router = APIRouter(tags=["Comparison"])


@router.post(
    "/compare",
    response_model=CompareResponse,
    dependencies=[Depends(check_rate_limit), Depends(concurrency_guard)],
)
@router.post(
    "/api/compare",
    response_model=CompareResponse,
    dependencies=[Depends(check_rate_limit), Depends(concurrency_guard)],
)
async def compare_code(
    request: CompareRequest,
    runner: Annotated[BaseSandboxRunner, Depends(get_sandbox_runner)],
) -> CompareResponse:
    """Execute two Python programs concurrently and compare their execution traces."""
    if not request.code_a.strip() or not request.code_b.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both code_a and code_b must be non-empty.",
        )

    # Run both programs concurrently
    run_a_task = runner.run(code=request.code_a, stdin=request.stdin)
    run_b_task = runner.run(code=request.code_b, stdin=request.stdin)

    result_a, result_b = await asyncio.gather(run_a_task, run_b_task)

    comp_a = CompareRunResult(
        steps=result_a.steps,
        truncated=result_a.truncated,
        error=result_a.error,
    )
    comp_b = CompareRunResult(
        steps=result_b.steps,
        truncated=result_b.truncated,
        error=result_b.error,
    )

    return CompareResponse(
        a=comp_a,
        b=comp_b,
        step_counts={
            "a": len(result_a.steps),
            "b": len(result_b.steps),
        },
    )
