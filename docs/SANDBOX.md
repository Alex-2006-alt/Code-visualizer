# CodeTrace Sandbox Security Model & Architecture

This document describes the isolation architecture, resource boundaries, and security model used by CodeTrace to execute untrusted Python code safely.

---

## 1. Dual-Tier Sandboxing Architecture

CodeTrace employs a defense-in-depth architecture consisting of two distinct execution tiers:

1. **Subprocess Development Runner (`app.services.sandbox.SubprocessSandboxRunner`)**:
   Used in local development and automated testing environments. Executes code via `sys.settrace` inside a local Python subprocess with language-level guardrails.
2. **Container Production Runner (`app.services.docker_sandbox.DockerSandboxRunner`)**:
   Used in production deployments. Spawns ephemeral, throwaway Docker containers with kernel-level isolation policies.

---

## 2. Production Container Security Guardrails

When running in production, each execution is placed in a single-use container configured with the following parameters:

| Security Parameter | Configuration | Threat Mitigated |
|---|---|---|
| **Network Access** | `network_disabled: true` | Prevents data exfiltration, port scanning, reverse shells, and external HTTP requests. |
| **Root Filesystem** | `read_only: true` | Prevents filesystem modification, rootkit installation, or persistent file creation. |
| **Temporary Files** | `tmpfs: {"/tmp": "size=16m,mode=1777"}` | Any scratch writes are confined to ephemeral RAM and discarded when the container terminates. |
| **Linux Capabilities** | `cap_drop: ["ALL"]` | Strips all Linux root capabilities (`CAP_NET_RAW`, `CAP_SYS_ADMIN`, `CAP_DAC_OVERRIDE`, etc.). |
| **Privilege Escalation** | `security_opt: ["no-new-privileges:true"]` | Blocks binaries with `setuid`/`setgid` bits from acquiring elevated permissions. |
| **Process Limits** | `pids_limit: 64` | Prevents fork bombs (`:(){ :\|:& };:`) and process table exhaustion. |
| **Memory Boundaries** | `mem_limit: "128m"`, `memswap_limit: "128m"` | Enforces strict cgroup memory quotas; kills processes that attempt OOM attacks. |
| **CPU Quotas** | `nano_cpus: 500000000` (0.5 vCPU) | Limits CPU usage to 50% of one core; prevents starvation of host services. |
| **Execution Timeout** | `timeout_seconds: 5` | Host kills unresponsive containers after 5 seconds via hard SIGKILL. |
| **Kernel Ulimits** | `RLIMIT_CPU`, `RLIMIT_AS` | Kernel-enforced limits on CPU time and virtual address space. |

---

## 3. Language-Level Sandbox Guardrails (CPython 3.12)

Inside the execution runner ([tracer.py](file:///e:/Code%20visualizer/backend/sandbox/tracer.py)), execution is monitored at the bytecode and source-line level:

1. **Strict 21-Module Allowlist**:
   Only the following 21 standard library modules may be imported by user code:
   `math`, `random`, `collections`, `itertools`, `heapq`, `bisect`, `functools`, `string`, `re`, `typing`, `dataclasses`, `copy`, `json`, `datetime`, `time`, `enum`, `queue`, `array`, `cmath`, `fractions`, `statistics`.
   All other imports (e.g., `os`, `subprocess`, `socket`, `requests`, `urllib`, `pickle`, `ctypes`) are intercepted by `_secure_import` and immediately rejected with a `Security Error`.
2. **Filesystem Blocking**:
   `builtins.open` is overridden by `_blocked_open`, raising `PermissionError` on any file access attempt.
3. **In-Memory I/O Virtualization**:
   `sys.stdout` and `sys.stdin` are backed by in-memory `io.StringIO` buffers. Reading from stdin past available input raises `EOFError` cleanly without hanging.
4. **Execution Step Cap**:
   Tracer enforces a strict upper bound of **2,000 steps** (`DEFAULT_MAX_STEPS = 2000`). Exceeding this cap raises `StepLimitExceeded`, setting `truncated = True`.
5. **Output Cap**:
   Standard output is capped at **64 KB** (`DEFAULT_MAX_OUTPUT_BYTES = 65536`). Any excess output is truncated with `[Output Truncated]`.
6. **Code Size Cap**:
   Input source code is limited to **10 KB** (`MAX_CODE_SIZE_BYTES = 10240`) before execution starts.

---

## 4. Why Container/Process Sandbox vs. WebAssembly (Pyodide)

CodeTrace intentionally uses a centralized server-side container sandbox rather than client-side WebAssembly (Pyodide/WASM):

1. **Exact CPython 3.12 Memory Semantics**:
   Pyodide runs Python in a JavaScript WebAssembly runtime, which alters garbage collection behavior, memory address structures (`hex(id(x))`), and recursion handling. CodeTrace requires native CPython memory addresses to accurately visualize object graphs and reference sharing.
2. **Instant Loading Performance**:
   Pyodide requires downloading a 15–30 MB WebAssembly bundle and standard library before running the first line of code. CodeTrace loads instantly (<50ms initial page load) and executes code remotely in milliseconds.
3. **Multi-Platform Consistency**:
   Executing on a standardized Linux container ensures identical step counts, execution timing, and complexity curves across mobile, tablet, and low-power devices without exhausting client battery.
4. **Shareable & Replayable Traces**:
   Server-side execution produces deterministic JSON traces that can be shared via short URLs, downloaded, or exported to Markdown.

---

## 5. Honest Boundaries & Known Limitations

- **Local Subprocess Runner**: In local development (`APP_ENV=development`), CodeTrace runs in subprocess mode. While `_secure_import` and `_blocked_open` block standard abuse vectors, true kernel-level isolation is provided by the Docker container runner in production.
- **No Third-Party Packages**: Modules outside the 21-module allowlist (such as NumPy, Pandas, or PyTorch) are not supported.
- **Synchronous Stdin**: Standard input must be provided upfront before execution; true asynchronous mid-execution terminal prompts are not currently modeled.
