"""Complexity analysis routes (/complexity and /api/complexity)."""

from __future__ import annotations

import re
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.config import get_settings
from app.core.security import validate_code_size, validate_imports
from app.deps import check_rate_limit, concurrency_guard
from app.schemas import ComplexityRequest, ComplexityResponse
from app.services.complexity import ComplexityService
from app.services.sandbox import BaseSandboxRunner, get_sandbox_runner

router = APIRouter(tags=["Complexity"])
settings = get_settings()

_IDENTIFIER_REGEX = re.compile(r"^[a-zA-Z_][a-zA-Z0-9_]*$")


@router.post(
    "/complexity",
    response_model=ComplexityResponse,
    dependencies=[Depends(check_rate_limit), Depends(concurrency_guard)],
)
@router.post(
    "/api/complexity",
    response_model=ComplexityResponse,
    dependencies=[Depends(check_rate_limit), Depends(concurrency_guard)],
)
async def analyze_complexity(
    request: ComplexityRequest,
    runner: Annotated[BaseSandboxRunner, Depends(get_sandbox_runner)],
) -> ComplexityResponse:
    """Run code across multiple input sizes and estimate Big-O time complexity."""
    if not request.code.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Code cannot be empty.",
        )

    if not request.function_name.strip() or not _IDENTIFIER_REGEX.match(
        request.function_name.strip()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid function name '{request.function_name}'.",
        )

    # Validate code size and imports
    validate_code_size(request.code, settings.max_code_size_bytes)
    validate_imports(request.code)

    service = ComplexityService(runner=runner)
    return await service.analyze(
        code=request.code,
        function_name=request.function_name.strip(),
        sizes=request.sizes,
    )

