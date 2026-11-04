"""Practice Mode API routes (/problems and /api/problems)."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.deps import check_rate_limit, concurrency_guard
from app.schemas import (
    ProblemDetailSchema,
    ProblemSubmitRequest,
    ProblemSubmitResponse,
    ProblemSummarySchema,
)
from app.services.problems import (
    evaluate_submission,
    get_all_problems,
    get_problem_detail,
)
from app.services.sandbox import BaseSandboxRunner, get_sandbox_runner

router = APIRouter(tags=["Practice"])


@router.get(
    "/problems",
    response_model=list[ProblemSummarySchema],
)
@router.get(
    "/api/problems",
    response_model=list[ProblemSummarySchema],
)
async def list_problems() -> list[ProblemSummarySchema]:
    """List all available algorithmic practice problems with metadata and test counts."""
    return get_all_problems()


@router.get(
    "/problems/{problem_id}",
    response_model=ProblemDetailSchema,
)
@router.get(
    "/api/problems/{problem_id}",
    response_model=ProblemDetailSchema,
)
async def get_problem(problem_id: str) -> ProblemDetailSchema:
    """Retrieve problem statement, starter code, and visible example tests only."""
    return get_problem_detail(problem_id)


@router.post(
    "/problems/{problem_id}/submit",
    response_model=ProblemSubmitResponse,
    dependencies=[Depends(check_rate_limit), Depends(concurrency_guard)],
)
@router.post(
    "/api/problems/{problem_id}/submit",
    response_model=ProblemSubmitResponse,
    dependencies=[Depends(check_rate_limit), Depends(concurrency_guard)],
)
async def submit_problem(
    problem_id: str,
    request: ProblemSubmitRequest,
    runner: Annotated[BaseSandboxRunner, Depends(get_sandbox_runner)],
) -> ProblemSubmitResponse:
    """Execute user submission against all problem tests inside the secure sandbox."""
    return await evaluate_submission(problem_id, request.code, runner)
