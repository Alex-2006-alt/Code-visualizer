"""Global error handling and structured error responses."""

from __future__ import annotations

from typing import Any

import structlog
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

logger = structlog.stdlib.get_logger(__name__)


class CodeTraceError(Exception):
    """Base error for the CodeTrace application."""

    def __init__(
        self,
        detail: str,
        status_code: int = 400,
        *,
        error_code: str | None = None,
        extra: dict[str, Any] | None = None,
    ) -> None:
        self.detail = detail
        self.status_code = status_code
        self.error_code = error_code or "CODETRACE_ERROR"
        self.extra = extra or {}
        super().__init__(detail)


class CodeTooLargeError(CodeTraceError):
    def __init__(self, size: int, limit: int) -> None:
        super().__init__(
            detail=f"Code size {size} bytes exceeds limit of {limit} bytes.",
            status_code=400,
            error_code="CODE_TOO_LARGE",
            extra={"size": size, "limit": limit},
        )


class SandboxTimeoutError(CodeTraceError):
    def __init__(self, timeout: int) -> None:
        super().__init__(
            detail=f"Execution timed out after {timeout} seconds.",
            status_code=408,
            error_code="SANDBOX_TIMEOUT",
            extra={"timeout_seconds": timeout},
        )


class RateLimitError(CodeTraceError):
    def __init__(self, detail: str = "Rate limit exceeded. Please try again later.") -> None:
        super().__init__(detail=detail, status_code=429, error_code="RATE_LIMITED")


class ConcurrencyLimitError(CodeTraceError):
    def __init__(self) -> None:
        super().__init__(
            detail="Server is at maximum capacity. Please try again shortly.",
            status_code=503,
            error_code="CONCURRENCY_LIMIT",
        )


class ForbiddenImportError(CodeTraceError):
    def __init__(self, module: str) -> None:
        super().__init__(
            detail=f"Import of '{module}' is not allowed for security reasons.",
            status_code=400,
            error_code="FORBIDDEN_IMPORT",
            extra={"module": module},
        )


class SandboxExecutionError(CodeTraceError):
    def __init__(self, detail: str = "Execution failed in sandbox.") -> None:
        super().__init__(detail=detail, status_code=400, error_code="EXECUTION_ERROR")


def register_error_handlers(app: FastAPI) -> None:
    """Register global exception handlers on the FastAPI app."""

    @app.exception_handler(CodeTraceError)
    async def _codetrace_error_handler(
        request: Request, exc: CodeTraceError
    ) -> JSONResponse:
        logger.warning(
            "codetrace_error",
            error_code=exc.error_code,
            detail=exc.detail,
            status_code=exc.status_code,
            path=str(request.url),
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": exc.error_code,
                "detail": exc.detail,
                **exc.extra,
            },
        )

    @app.exception_handler(Exception)
    async def _unhandled_error_handler(
        request: Request, exc: Exception
    ) -> JSONResponse:
        logger.error(
            "unhandled_error",
            error=str(exc),
            error_type=type(exc).__name__,
            path=str(request.url),
            exc_info=True,
        )
        return JSONResponse(
            status_code=500,
            content={
                "error": "INTERNAL_ERROR",
                "detail": "An unexpected error occurred.",
            },
        )
