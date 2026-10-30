# CodeTrace Bug Log (Phases 0 – 6)

Comprehensive log of all defects, vulnerabilities, mismatches, and race conditions identified and resolved during end-to-end testing of CodeTrace.

---

### Bug 1: Unhandled Promise Rejection on 4xx/5xx API Errors in Frontend Store

- **Symptom:** When code execution triggered a backend validation error (400), rate limit (429), or security violation (e.g. forbidden import), an uncaught error was logged in the browser console, causing strict E2E test failures.
- **Cause:** `runCurrentCode` in [`frontend/src/store/useTraceStore.ts`](file:///e:/Code%20visualizer/frontend/src/store/useTraceStore.ts) called `executeCode(code)` without a `try...catch` block. When `executeCode` displayed a Toast notification and threw, the rejection went unhandled.
- **Fix:** Added a `try...catch` block around `executeCode(code)` in `runCurrentCode` to let the Toast notification service display user feedback cleanly.
- **Covering Test:** `tests-e2e/specs/corpus_runner.spec.ts` (`i09_forbidden_import`, `j06_empty_code`) and `frontend/src/test/apiErrors.test.ts`.

---

### Bug 2: Tracer String Variable Memory Bomb Vulnerability

- **Symptom:** Executing `j01_memory_bomb` (`blob = " " * (200 * 1024 * 1024)`) caused backend process memory to balloon to 1.57 GB, choking JSON serialization and exhausting RAM.
- **Cause:** `_safe_serialize()` in [`backend/sandbox/tracer.py`](file:///e:/Code%20visualizer/backend/sandbox/tracer.py) capped list, dict, and set collections, but returned `str` types unmodified without length bounds.
- **Fix:** Added a 1,000-character truncation ceiling for strings in `_safe_serialize()` (`val[:1000] + f"... ({len(val)} chars)"`).
- **Covering Test:** `tests-e2e/stress_test.py` (Sandbox Abuse suite: `j01_memory_bomb` 10/10 clean stops under 300ms).

---

### Bug 3: Windows Subprocess Deadlock on Timeout Termination

- **Symptom:** Long-running loops or timeouts caused subsequent requests to hang or return 503 capacity limit errors.
- **Cause:** In [`backend/app/services/sandbox.py`](file:///e:/Code%20visualizer/backend/app/services/sandbox.py), when `asyncio.wait_for()` raised `TimeoutError`, `proc.kill()` was followed by `await proc.wait()`. On Windows, if open I/O pipe handles were not closed, `await proc.wait()` blocked indefinitely.
- **Fix:** Explicitly closed `proc.stdin` before termination and bounded `proc.wait()` with `asyncio.wait_for(..., timeout=1.0)`.
- **Covering Test:** `tests-e2e/stress_test.py` (Sandbox Abuse suite: `i06_infinite_loop` and `j01_memory_bomb`).

---

### Bug 4: In-Memory Concurrency Slot Permanent Leak

- **Symptom:** After an aborted request or client disconnect, the backend permanently returned HTTP 503 (`CONCURRENCY_LIMIT`) for all subsequent requests.
- **Cause:** [`backend/app/services/rate_limit.py`](file:///e:/Code%20visualizer/backend/app/services/rate_limit.py) tracked concurrency using a raw integer counter (`_in_memory_concurrency`). If an unexpected exception occurred before `release_concurrency` or if a generator exited abnormally, the slot was permanently lost.
- **Fix:** Replaced the integer counter with an active lease dictionary (`_in_memory_active_leases`) that automatically purges stale leases older than 15 seconds on every acquire and release call.
- **Covering Test:** `tests-e2e/stress_test.py` (Concurrency 20 and 50 simultaneous runs).

---

### Bug 5: Pytest Cross-Test Rate Limit Contamination

- **Symptom:** Running `pytest backend/tests` resulted in `429 Too Many Requests` failures on integration tests.
- **Cause:** When 37 unit tests ran rapidly within the same process under 1 minute, they shared the same `127.0.0.1` / `testclient` IP address, triggering the 20-req/min rate limiter.
- **Fix:** Added an `autouse=True` fixture in [`backend/tests/conftest.py`](file:///e:/Code%20visualizer/backend/tests/conftest.py) to reset `_in_memory_requests` and `_in_memory_active_leases` between test functions.
- **Covering Test:** `pytest backend/tests` (37/37 passed).

---

### Bug 6: Compare Mode Dual-Solution UI Missing from Frontend

- **Symptom:** The frontend had a toggle for "Compare Mode", but selecting it did not present a second code editor or send execution requests to `/api/compare`.
- **Cause:** `frontend/src/routes/WorkspacePage.tsx` only rendered a single Monaco editor and single trace viewer; `compareCode` API was unimplemented in `frontend/src/lib/api.ts`.
- **Fix:** Implemented `compareCode` API client in `frontend/src/lib/api.ts`, added Solution A / Solution B dual Monaco editors in `frontend/src/routes/WorkspacePage.tsx`, and added a Compare Results Summary card with relative efficiency badges.
- **Covering Test:** `tests-e2e/specs/ui_flows.spec.ts` (UI Flow 3: Compare mode with two solutions).

---

### Bug 7: Tracer Step Cap Inconsistency

- **Symptom:** Large loops returned truncated steps at inconsistent thresholds.
- **Cause:** Default step limit in `tracer.py` was hardcoded to 1000 steps while backend configurations specified 2000 steps.
- **Fix:** Synchronized tracer limits to `DEFAULT_MAX_STEPS = 2000` and passed dynamic configuration from `SubprocessSandboxRunner`.
- **Covering Test:** `tests-e2e/run_api_corpus.py` (`i07_long_loop_over_2000`).
