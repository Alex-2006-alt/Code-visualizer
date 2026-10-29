"""Docker container sandbox runner service.

Executes user code in a dedicated, isolated, throwaway Docker container
with strict security limits: no network, read-only root, dropped capabilities,
memory / CPU / pid caps, and guaranteed cleanup in finally blocks.
"""

from __future__ import annotations

import asyncio
import json
from typing import Any

import docker
import structlog
from docker.errors import DockerException
from docker.models.containers import Container

from app.config import get_settings
from app.core.errors import (
    SandboxExecutionError,
    SandboxTimeoutError,
)
from app.core.security import validate_code
from app.schemas import RunResponse

logger = structlog.stdlib.get_logger(__name__)
settings = get_settings()


class DockerSandboxRunner:
    """Production throwaway container sandbox runner."""

    def __init__(
        self,
        image: str = settings.sandbox_docker_image,
        timeout_seconds: int = settings.sandbox_timeout_seconds,
        max_steps: int = settings.sandbox_max_steps,
        max_output_bytes: int = settings.sandbox_max_output_bytes,
        max_code_size_bytes: int = settings.max_code_size_bytes,
        memory_limit_mb: int = settings.sandbox_memory_limit_mb,
        cpu_quota: float = settings.sandbox_cpu_quota,
        pids_limit: int = settings.sandbox_pids_limit,
    ) -> None:
        self.image = image
        self.timeout_seconds = timeout_seconds
        self.max_steps = max_steps
        self.max_output_bytes = max_output_bytes
        self.max_code_size_bytes = max_code_size_bytes
        self.memory_limit_mb = memory_limit_mb
        self.cpu_quota = cpu_quota
        self.pids_limit = pids_limit

    def _get_docker_client(self) -> Any:
        try:
            return docker.from_env()
        except DockerException as e:
            raise SandboxExecutionError(f"Cannot connect to Docker daemon: {e}") from e

    async def run(self, code: str, stdin: str | None = None) -> RunResponse:
        """Run code inside a throwaway container and return trace output."""
        validate_code(code, self.max_code_size_bytes)

        payload_bytes = json.dumps({
            "code": code,
            "stdin": stdin or "",
            "max_steps": self.max_steps,
            "max_output_bytes": self.max_output_bytes,
        }).encode("utf-8")

        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, self._run_sync, payload_bytes)

    def _run_sync(self, payload_bytes: bytes) -> RunResponse:
        client = self._get_docker_client()
        container: Container | None = None

        container_config: dict[str, Any] = {
            "image": self.image,
            "detach": True,
            "stdin_open": True,
            "network_disabled": True,
            "read_only": True,
            "tmpfs": {"/tmp": "size=16m,mode=1777"},
            "cap_drop": ["ALL"],
            "security_opt": ["no-new-privileges:true"],
            "mem_limit": f"{self.memory_limit_mb}m",
            "memswap_limit": f"{self.memory_limit_mb}m",
            "nano_cpus": int(self.cpu_quota * 1e9),
            "pids_limit": self.pids_limit,
        }

        try:
            container = client.containers.create(**container_config)
            container.start()

            socket = container.attach_socket(params={"stdin": 1, "stream": 1})
            try:
                # Send JSON input over container stdin socket
                socket._sock.sendall(payload_bytes)
                socket._sock.shutdown(1)
            finally:
                socket.close()

            # Wait for container execution with timeout
            try:
                result = container.wait(timeout=self.timeout_seconds)
                exit_code = result.get("StatusCode", 0)
            except Exception as e:
                # Docker timeout or wait failure
                logger.warning("docker_container_timeout", error=str(e))
                raise SandboxTimeoutError(timeout=self.timeout_seconds) from e

            # Collect stdout logs
            stdout_logs = container.logs(stdout=True, stderr=False).decode("utf-8", errors="replace").strip()
            stderr_logs = container.logs(stdout=False, stderr=True).decode("utf-8", errors="replace").strip()

            if exit_code == 137:
                raise SandboxExecutionError("Process killed (Out of Memory or SIGKILL).")

            if not stdout_logs and stderr_logs:
                raise SandboxExecutionError(detail=f"Execution error: {stderr_logs}")

            if not stdout_logs:
                raise SandboxExecutionError("Container produced empty trace output.")

            try:
                data = json.loads(stdout_logs)
                return RunResponse.model_validate(data)
            except json.JSONDecodeError as err:
                logger.error("docker_invalid_json", output=stdout_logs, error=str(err))
                raise SandboxExecutionError("Malformed JSON response from sandbox.") from err

        finally:
            if container:
                try:
                    container.remove(force=True)
                except Exception as cleanup_err:
                    logger.warning("docker_cleanup_failed", error=str(cleanup_err))
