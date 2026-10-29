"""Snippet persistence and sharing routes (/snippets and /api/snippets)."""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.core.security import validate_code_size
from app.deps import check_rate_limit, get_db
from app.models import Snippet
from app.schemas import SnippetCreateRequest, SnippetCreateResponse, SnippetResponse

router = APIRouter(tags=["Snippets"])
settings = get_settings()


@router.post(
    "/snippets",
    response_model=SnippetCreateResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(check_rate_limit)],
)
@router.post(
    "/api/snippets",
    response_model=SnippetCreateResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(check_rate_limit)],
)
async def create_snippet(
    request: SnippetCreateRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SnippetCreateResponse:
    """Save a Python code snippet and return a unique share ID."""
    if not request.code.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Snippet code cannot be empty.",
        )

    validate_code_size(request.code, settings.max_code_size_bytes)

    snippet_id = str(uuid.uuid4())[:8]
    snippet = Snippet(
        id=snippet_id,
        code=request.code,
        title=request.title.strip() if request.title else None,
    )

    db.add(snippet)
    await db.commit()
    await db.refresh(snippet)

    return SnippetCreateResponse(id=snippet.id)


@router.get("/snippets/{id}", response_model=SnippetResponse)
@router.get("/api/snippets/{id}", response_model=SnippetResponse)
async def get_snippet(
    id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SnippetResponse:
    """Retrieve a previously saved code snippet by share ID."""
    result = await db.execute(select(Snippet).where(Snippet.id == id))
    snippet = result.scalar_one_or_none()

    if not snippet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Snippet with ID '{id}' was not found.",
        )

    return SnippetResponse(
        id=snippet.id,
        code=snippet.code,
        title=snippet.title,
        created_at=snippet.created_at,
    )
