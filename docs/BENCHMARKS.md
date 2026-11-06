# CodeTrace Empirical Benchmarks & Resilience Report

This document records the empirical latency percentiles, concurrency throughput, rate-limiting enforcement, and abuse containment benchmarks for CodeTrace.

---

## 1. Latency Percentiles (p50 & p95)

Measured across 25 iterations per execution workload against the FastAPI execution endpoint (`POST /api/run`):

| Workload Profile | Average Steps | Min Latency | **p50 (Median)** | **p95 Latency** | Max Latency | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Small Script (~4 steps)** | 6.0 steps | 134.7 ms | **158.1 ms** | **174.6 ms** | 187.1 ms | Optimal |
| **Medium Script (~500 steps)** | 503.0 steps | 163.5 ms | **202.1 ms** | **254.3 ms** | 277.5 ms | Optimal |
| **Large Script (2,000 steps)** | 2,000.0 steps | 215.2 ms | **258.9 ms** | **303.4 ms** | 310.0 ms | Capped |

> [!NOTE]
> All executions complete in under 310 ms, with AST validation and module checks completing in <10 ms.

---

## 2. Concurrency & Isolation Benchmarks

Concurrently dispatched across simultaneous independent client sessions with parameterized user payloads ($x = \text{user\_id} \times 7$):

| Concurrency Level | Total Requests | 200 OK | 503 Capacity Cap | 429 Rate Limited | 500 Crashes | Cross-User Data Leaks | Total Duration |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **20 Simultaneous** | 20 | 20 | 0 | 0 | 0 | **0 (Zero)** | 1,284 ms |
| **50 Simultaneous** | 50 | 26 | 24 | 0 | 0 | **0 (Zero)** | 822 ms |

### Key Isolation Guarantees
1. **Zero Data Leakage**: In every concurrent 200 OK response, extracted stack variables strictly matched the caller's unique ID. No cross-session memory contamination occurred.
2. **Graceful Shedding**: When exceeding global worker concurrency capacity, excess requests return HTTP 503 Service Unavailable without crashing the server or exhausting host threads.
3. **Zero 500 Unhandled Exceptions**: All concurrent requests resolved cleanly to 200, 429, or 503 status codes.

---

## 3. Rate Limiting Enforced

- **Sliding Window Policy**: 20 executions per minute per client IP.
- **Bursty Traffic Test**: 30 rapid requests sent in immediate succession from a single IP.
- **Results**:
  - First 20 requests: **HTTP 200 OK**
  - Remaining 10 requests: **HTTP 429 Too Many Requests (`RATE_LIMITED`)**
- **Fallback**: When an external Redis instance is unavailable, CodeTrace automatically fails over to an in-memory sliding window cache.

---

## 4. Sandbox Abuse & Containment Matrix

Tested across 16 adversarial scripts, executed 10 times each (160 total runs):

| Adversarial Attack Vector | Attack Pattern | Guardrail | Clean Stops | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| `i01_syntax_error` | Malformed Python grammar | AST compile exception catch | 10 / 10 | **PASS** |
| `i02_name_error` | Accessing undefined variables | Trace exception handler | 10 / 10 | **PASS** |
| `i03_zero_division` | Division by zero (`1 / 0`) | Trace exception handler | 10 / 10 | **PASS** |
| `i04_index_error` | List index out of bounds | Trace exception handler | 10 / 10 | **PASS** |
| `i05_key_error` | Missing dictionary key lookup | Trace exception handler | 10 / 10 | **PASS** |
| `i06_infinite_loop` | `while True: pass` | Wall-clock execution timeout | 10 / 10 | **PASS** |
| `i07_long_loop_over_2000` | Loop iterating 100,000 times | Step limit cap (2,000 steps) | 10 / 10 | **PASS** |
| `i08_huge_output` | Printing megabytes of text | Output buffer cap (64 KB) | 10 / 10 | **PASS** |
| `i09_forbidden_import` | `import os`, `import socket` | 21-module allowlist security filter | 10 / 10 | **PASS** |
| `i10_open_file_access` | `open('/etc/passwd', 'r')` | Builtins file access override | 10 / 10 | **PASS** |
| `j01_memory_bomb` | `a = 'A' * (10**9)` | Process address space limit | 10 / 10 | **PASS** |
| `j02_fork_bomb` | Fork bomb / process exhaustion | Import block + pid quotas | 10 / 10 | **PASS** |
| `j03_deeply_nested` | Recursion bomb / deep AST | Recursion limit + step caps | 10 / 10 | **PASS** |
| `j04_size_limit_10kb` | Source code nearing 10 KB | Code size validator | 10 / 10 | **PASS** |
| `j05_size_limit_over_10kb` | Source code exceeding 10 KB | Pre-execution 400 Bad Request | 10 / 10 | **PASS** |
| `j06_empty_code` | Empty or whitespace-only code | Pre-execution validation | 10 / 10 | **PASS** |

**Summary**: 160 / 160 adversarial attacks successfully contained with 0 process leaks or zombie processes.
