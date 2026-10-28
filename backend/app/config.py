"""Application configuration via pydantic-settings.

All limits and secrets are configurable through environment variables
or a .env file in the backend/ directory.
"""

from __future__ import annotations

import json
from typing import Any

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration loaded from environment / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── App ──
    app_env: str = "development"
    app_debug: bool = True
    app_host: str = "0.0.0.0"
    app_port: int = 8000

    # ── CORS ──
    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _parse_cors_origins(cls, v: Any) -> Any:
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return [str(item) for item in parsed]
            except (json.JSONDecodeError, TypeError):
                return [s.strip() for s in v.split(",") if s.strip()]
        return v

    # ── Database ──
    database_url: str = "sqlite+aiosqlite:///./codetrace.db"

    # ── Redis ──
    redis_url: str = "redis://localhost:6379/0"

    # ── Sandbox ──
    sandbox_backend: str = "subprocess"  # "subprocess" | "docker"
    sandbox_timeout_seconds: int = 5
    sandbox_max_steps: int = 2000
    sandbox_max_output_bytes: int = 65536
    sandbox_memory_limit_mb: int = 128
    sandbox_cpu_quota: float = 0.5
    sandbox_pids_limit: int = 64
    sandbox_docker_image: str = "codetrace-sandbox:latest"

    # ── Rate Limits ──
    rate_limit_per_minute: int = 20
    rate_limit_per_day: int = 500
    max_concurrent_runs: int = 5

    # ── Code Limits ──
    max_code_size_bytes: int = 10240

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"


def get_settings() -> Settings:
    """Return a cached Settings instance."""
    return Settings()
