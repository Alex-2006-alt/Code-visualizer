"""Sandbox runner service.

Executes user code in an isolated environment and returns structured
trace steps. Provides a local subprocess runner for development
and tests, and an interface for Docker containers in production.
"""

from __future__ import annotations

import asyncio
import contextlib
import json
import os
import sys
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any

import structlog

from app.config import get_settings
from app.core.errors import (
    SandboxExecutionError,
    SandboxTimeoutError,
)
from app.core.security import validate_code
from app.schemas import RunResponse
from app.services.docker_sandbox import DockerSandboxRunner

logger = structlog.stdlib.get_logger(__name__)
settings = get_settings()

TRACER_PATH = Path(__file__).resolve().parent.parent.parent / "sandbox" / "tracer.py"


class BaseSandboxRunner(ABC):
    """Abstract interface for code execution sandbox runners."""

    @abstractmethod
    async def run(self, code: str, stdin: str | None = None) -> RunResponse:
        """Execute user code and return a structured trace response."""


class SubprocessSandboxRunner(BaseSandboxRunner):
    """Development-only sandbox runner using isolated local subprocesses.

    WARNING: This runner is meant strictly for local development and unit tests.
    Production environments should use the DockerSandboxRunner with strict container limits.
    """

    def __init__(
        self,
        timeout_seconds: int = settings.sandbox_timeout_seconds,
        max_steps: int = settings.sandbox_max_steps,
        max_output_bytes: int = settings.sandbox_max_output_bytes,
        max_code_size_bytes: int = settings.max_code_size_bytes,
    ) -> None:
        self.timeout_seconds = timeout_seconds
        self.max_steps = max_steps
        self.max_output_bytes = max_output_bytes
        self.max_code_size_bytes = max_code_size_bytes

    async def run(self, code: str, stdin: str | None = None) -> RunResponse:
        """Run code via sandbox/tracer.py in a dedicated subprocess."""
        # 1. Security & size pre-flight checks
        validate_code(code, self.max_code_size_bytes)

        payload = json.dumps({
            "code": code,
            "stdin": stdin or "",
            "max_steps": self.max_steps,
            "max_output_bytes": self.max_output_bytes,
        }).encode("utf-8")

        logger.debug(
            "subprocess_runner_start",
            code_length=len(code),
            timeout=self.timeout_seconds,
        )

        runner_env = os.environ.copy()
        runner_env["PYTHONIOENCODING"] = "utf-8"
        runner_env["PYTHONUTF8"] = "1"

        proc: asyncio.subprocess.Process | None = None
        try:
            proc = await asyncio.create_subprocess_exec(
                sys.executable,
                str(TRACER_PATH),
                stdin=asyncio.subprocess.PIPE,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                env=runner_env,
            )

            stdout_bytes, stderr_bytes = await asyncio.wait_for(
                proc.communicate(input=payload),
                timeout=float(self.timeout_seconds),
            )
        except TimeoutError:
            if proc:
                with contextlib.suppress(ProcessLookupError):
                    proc.kill()
                    await proc.wait()
            logger.warning("subprocess_timeout", timeout=self.timeout_seconds)
            raise SandboxTimeoutError(timeout=self.timeout_seconds) from None
        except Exception as exc:
            if proc:
                with contextlib.suppress(ProcessLookupError):
                    proc.kill()
            logger.error("subprocess_spawn_failed", error=str(exc))
            raise SandboxExecutionError(detail=f"Failed to spawn runner process: {exc}") from exc

        # 2. Parse tracer JSON output
        stdout_text = stdout_bytes.decode("utf-8", errors="replace").strip()
        stderr_text = stderr_bytes.decode("utf-8", errors="replace").strip()

        if stderr_text:
            logger.warning("subprocess_stderr", stderr=stderr_text)

        if not stdout_text:
            raise SandboxExecutionError(detail="Runner produced empty output.")

        try:
            raw_data: dict[str, Any] = json.loads(stdout_text)
        except json.JSONDecodeError as err:
            logger.error("subprocess_invalid_json", output=stdout_text, error=str(err))
            raise SandboxExecutionError(detail="Malformed trace output from execution runner.") from err

        return RunResponse.model_validate(raw_data)


def get_sandbox_runner() -> BaseSandboxRunner:
    """Dependency provider returning the configured sandbox runner with automatic fallback."""
    if settings.sandbox_backend == "docker":
        try:
            return DockerSandboxRunner()  # type: ignore[return-value]
        except Exception as err:
            logger.warning("docker_runner_unavailable", error=str(err), fallback="subprocess")
            return SubprocessSandboxRunner()
    return SubprocessSandboxRunner()
