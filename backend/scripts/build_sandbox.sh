#!/usr/bin/env bash
# Build minimal unprivileged CodeTrace sandbox Docker image
set -euo pipefail

IMAGE_NAME="codetrace-sandbox:latest"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SANDBOX_DIR="$(cd "${SCRIPT_DIR}/../sandbox" && pwd)"

echo "Building CodeTrace sandbox container image: ${IMAGE_NAME}..."
docker build -t "${IMAGE_NAME}" -f "${SANDBOX_DIR}/Dockerfile" "${SANDBOX_DIR}"
echo "Sandbox image built successfully."
