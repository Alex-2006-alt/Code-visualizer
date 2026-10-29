"""Code execution routes (/run and /api/run) with rate limiting and concurrency control."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.deps import check_rate_limit, concurrency_guard
from app.schemas import RunRequest, RunResponse
from app.services.sandbox import BaseSandboxRunner, get_sandbox_runner

router = APIRouter(tags=["Execution"])


@router.post(
    "/run",
    response_model=RunResponse,
    dependencies=[Depends(check_rate_limit), Depends(concurrency_guard)],
)
@router.post(
    "/api/run",
    response_model=RunResponse,
    dependencies=[Depends(check_rate_limit), Depends(concurrency_guard)],
)
async def run_code(
    request: RunRequest,
    runner: Annotated[BaseSandboxRunner, Depends(get_sandbox_runner)],
) -> RunResponse:
    """Execute Python code and return the step-by-step trace."""
    if not request.code.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Code cannot be empty.",
        )

    result = await runner.run(code=request.code, stdin=request.stdin)

    # If compilation or syntax error occurred in user code, return 400
    if result.error and ("SyntaxError" in result.error or "CompileError" in result.error):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error,
        )

    return result
