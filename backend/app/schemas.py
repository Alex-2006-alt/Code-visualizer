"""Pydantic v2 schemas for all API request and response models.

These are the source-of-truth for the backend contract and match
the frontend types in frontend/src/types/trace.ts exactly.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

# ──────────────────────────────────────────────────────────────
# Trace data models (match frontend/src/types/trace.ts)
# ──────────────────────────────────────────────────────────────

class FrameSchema(BaseModel):
    """A single call-stack frame."""
    fn: str
    line: int
    locals: dict[str, Any] = Field(default_factory=dict)


class HeapObjectSchema(BaseModel):
    """A reference-type object living on the virtual heap."""
    id: str
    type: str  # 'list' | 'dict' | 'set' | 'object'
    address: str
    value: Any  # list or dict
    target_index: int | None = Field(default=None, alias="targetIndex")
    label: str | None = None

    model_config = {"populate_by_name": True}


class TraceStepSchema(BaseModel):
    """One captured execution step from sys.settrace."""
    event: str  # 'line' | 'call' | 'return' | 'exception'
    line: int
    stack: list[FrameSchema]
    output: str = ""
    ret: Any | None = None
    heap: dict[str, Any] | None = None
    heap_objects: list[HeapObjectSchema] | None = Field(default=None, alias="heapObjects")
    mutated_variable: str | None = Field(default=None, alias="mutatedVariable")
    explanation: str | None = None

    model_config = {"populate_by_name": True}


# ──────────────────────────────────────────────────────────────
# /run
# ──────────────────────────────────────────────────────────────

class RunRequest(BaseModel):
    """POST /run request body."""
    code: str
    stdin: str | None = None


class RunResponse(BaseModel):
    """POST /run response body."""
    steps: list[TraceStepSchema]
    truncated: bool = False
    step_limit_reached: bool = Field(default=False, alias="step_limit_reached")
    error: str | None = None

    model_config = {"populate_by_name": True}


# ──────────────────────────────────────────────────────────────
# /compare
# ──────────────────────────────────────────────────────────────

class CompareRequest(BaseModel):
    code_a: str
    code_b: str
    stdin: str | None = None


class CompareRunResult(BaseModel):
    steps: list[TraceStepSchema]
    truncated: bool = False
    error: str | None = None


class CompareResponse(BaseModel):
    a: CompareRunResult
    b: CompareRunResult
    step_counts: dict[str, int]


# ──────────────────────────────────────────────────────────────
# /complexity
# ──────────────────────────────────────────────────────────────

class ComplexityRequest(BaseModel):
    code: str
    function_name: str
    sizes: list[int]


class ComplexityPoint(BaseModel):
    n: int
    ops: int


class ComplexityResponse(BaseModel):
    points: list[ComplexityPoint]
    label: str


# ──────────────────────────────────────────────────────────────
# /snippets
# ──────────────────────────────────────────────────────────────

class SnippetCreateRequest(BaseModel):
    code: str
    title: str | None = None


class SnippetCreateResponse(BaseModel):
    id: str


class SnippetResponse(BaseModel):
    id: str
    code: str
    title: str | None = None
    created_at: datetime


# ──────────────────────────────────────────────────────────────
# /examples
# ──────────────────────────────────────────────────────────────

class ExampleSchema(BaseModel):
    id: str
    title: str
    category: str
    difficulty: str
    code: str
    time_complexity: str = Field(alias="timeComplexity")
    space_complexity: str = Field(alias="spaceComplexity")

    model_config = {"populate_by_name": True}


# ──────────────────────────────────────────────────────────────
# /health
# ──────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str = "ok"
