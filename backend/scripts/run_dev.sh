#!/usr/bin/env bash
# Run CodeTrace backend in local development mode
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${BACKEND_DIR}"

export APP_ENV="development"
export APP_DEBUG="true"

echo "Starting CodeTrace backend development server on http://localhost:8000..."
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
