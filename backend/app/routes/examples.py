"""Curated example algorithm routes (/examples and /api/examples)."""

from __future__ import annotations

from fastapi import APIRouter

from app.schemas import ExampleSchema
from app.services.examples import get_curated_examples

router = APIRouter(tags=["Examples"])


@router.get("/examples", response_model=list[ExampleSchema])
@router.get("/api/examples", response_model=list[ExampleSchema])
async def list_examples() -> list[ExampleSchema]:
    """Retrieve curated example programs for execution and visualization."""
    return get_curated_examples()
