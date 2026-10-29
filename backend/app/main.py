"""FastAPI application entry point."""

from __future__ import annotations

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.core import setup_logging
from app.core.errors import register_error_handlers
from app.db import init_db
from app.routes.compare import router as compare_router
from app.routes.complexity import router as complexity_router
from app.routes.health import router as health_router
from app.routes.run import router as run_router

settings = get_settings()
setup_logging(debug=settings.app_debug)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan manager."""
    # Initialize database tables on startup (dev sqlite fallback)
    if "sqlite" in settings.database_url:
        await init_db()
    yield


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

    # Register error handlers
    register_error_handlers(app)

    # Include routes
    app.include_router(health_router)
    app.include_router(run_router)
    app.include_router(compare_router)
    app.include_router(complexity_router)

    return app


app = create_app()

