"""FastAPI application entry point."""

from __future__ import annotations

import sys

# Ensure Windows uses ProactorEventLoop for asyncio subprocess support
if sys.platform == "win32":
    import asyncio
    if not isinstance(asyncio.get_event_loop_policy(), asyncio.WindowsProactorEventLoopPolicy):
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

import time
import uuid
from collections.abc import AsyncGenerator, Awaitable, Callable
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.core import setup_logging
from app.core.errors import register_error_handlers
from app.db import close_db, init_db
from app.routes.compare import router as compare_router
from app.routes.complexity import router as complexity_router
from app.routes.examples import router as examples_router
from app.routes.health import router as health_router
from app.routes.run import router as run_router
from app.routes.snippets import router as snippets_router
from app.services.rate_limit import rate_limiter

settings = get_settings()
setup_logging(debug=settings.app_debug)
logger = structlog.stdlib.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan manager with graceful startup and shutdown."""
    logger.info("codetrace_api_starting", version="0.1.0", env=settings.app_env)
    # Initialize database tables on startup (dev sqlite fallback)
    if "sqlite" in settings.database_url:
        await init_db()
    yield
    logger.info("codetrace_api_shutting_down")
    await rate_limiter.close()
    await close_db()
    logger.info("codetrace_api_stopped")


def create_app() -> FastAPI:
    """Build and configure the FastAPI application."""
    app = FastAPI(
        title="CodeTrace API",
        description="Python code execution trace visualizer backend",
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Request ID and execution timing middleware
    @app.middleware("http")
    async def request_middleware(
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
        start_time = time.perf_counter()

        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(
            request_id=request_id,
            path=request.url.path,
            method=request.method,
        )

        response = await call_next(request)

        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time-Ms"] = str(duration_ms)

        return response

    # Register error handlers
    register_error_handlers(app)

    # Include routes
    app.include_router(health_router)
    app.include_router(run_router)
    app.include_router(compare_router)
    app.include_router(complexity_router)
    app.include_router(examples_router)
    app.include_router(snippets_router)

    return app


app = create_app()
