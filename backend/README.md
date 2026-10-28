# CodeTrace Backend

Python execution trace and visualization API service built with FastAPI, Python 3.12, and Pydantic v2.

## Quick Start (Local Development)

### 1. Requirements
- Python 3.12+
- Docker (optional for Docker sandbox, fallback subprocess runner available for development)

### 2. Setup Virtual Environment
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

pip install -r requirements-dev.txt
```

### 3. Run Development Server
```bash
uvicorn app.main:app --reload --port 8000
```
Open [http://localhost:8000/docs](http://localhost:8000/docs) for Swagger UI.

### 4. Run Tests
```bash
pytest
```

