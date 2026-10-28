"""Health check endpoints."""

from __future__ import annotations

from fastapi import APIRouter

from app.schemas import HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
@router.get("/api/health", response_model=HealthResponse)
async def get_health() -> HealthResponse:
    """Return system operational status."""
    return HealthResponse(status="ok")

