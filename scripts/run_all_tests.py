"""Master Test Suite Runner for CodeTrace.

Executes all verification phases in sequence:
1. Backend Unit & Security Tests (pytest)
2. Backend API Corpus Runner (80 programs against live API)
3. Frontend Unit & Contract Tests (Vitest)
4. Full Browser E2E Tests (Playwright)
5. Stress, Abuse & Concurrency Benchmarks

Usage:
  python scripts/run_all_tests.py
"""

from __future__ import annotations

import subprocess
import sys
import time
from pathlib import Path

# Ensure UTF-8 output on Windows
if sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

ROOT_DIR = Path(__file__).resolve().parent.parent


def run_command(desc: str, cmd: list[str] | str, cwd: Path = ROOT_DIR, shell: bool = False) -> tuple[bool, float]:
    print(f"\n{'='*70}\n[RUNNING] {desc}\n{'='*70}")
    start = time.perf_counter()
    try:
        proc = subprocess.run(
            cmd,
            cwd=str(cwd),
            shell=shell,
            text=True,
            check=False,
        )
        elapsed = time.perf_counter() - start
        success = (proc.returncode == 0)
        status = "PASSED" if success else f"FAILED (Exit Code {proc.returncode})"
        print(f"[{status}] {desc} in {elapsed:.1f}s")
        return success, elapsed
    except Exception as e:
        elapsed = time.perf_counter() - start
        print(f"[FAILED] {desc} with error: {e} in {elapsed:.1f}s")
        return False, elapsed


def main() -> None:
    print("=" * 70)
    print("           CODETRACE FULL VERIFICATION SUITE")
    print("=" * 70)

    overall_start = time.perf_counter()
    results: list[tuple[str, bool, float]] = []

    # 1. Backend Pytest
    ok, dur = run_command("1. Backend Unit Tests (pytest)", [sys.executable, "-m", "pytest", "backend/tests"])
    results.append(("Backend Unit Tests", ok, dur))

    # 2. Backend API Corpus (80 programs)
    ok, dur = run_command("2. Backend API Corpus Runner (80 programs)", [sys.executable, "tests-e2e/run_api_corpus.py"])
    results.append(("API Corpus Runner", ok, dur))

    # 3. Frontend Unit & Contract Tests (Vitest)
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    ok, dur = run_command("3. Frontend Contract Tests (Vitest)", [npm_cmd, "--prefix", "frontend", "test", "--", "--run"])
    results.append(("Frontend Contract Tests", ok, dur))

    # 4. Playwright Browser E2E Tests (36 tests)
    npx_cmd = "npx.cmd" if sys.platform == "win32" else "npx"
    ok, dur = run_command(
        "4. Full Browser E2E Tests (Playwright)",
        [npx_cmd, "playwright", "test", "--config", "playwright.config.ts"],
        cwd=ROOT_DIR / "tests-e2e",
    )
    results.append(("Playwright Browser E2E", ok, dur))

    # 5. Stress, Abuse & Concurrency Suite
    ok, dur = run_command("5. Stress, Abuse & Concurrency Suite", [sys.executable, "tests-e2e/stress_test.py"])
    results.append(("Stress & Abuse Suite", ok, dur))

    total_elapsed = time.perf_counter() - overall_start

    print("\n" + "=" * 70)
    print("                 FULL VERIFICATION SUMMARY")
    print("=" * 70)
    all_passed = True
    for name, success, dur in results:
        status_sym = "✅ PASS" if success else "❌ FAIL"
        if not success:
            all_passed = False
        print(f"  {status_sym:8s} | {name:32s} | {dur:6.1f}s")
    print("-" * 70)
    print(f"  Total Duration: {total_elapsed:.1f}s ({total_elapsed / 60:.1f} minutes)")
    print(f"  Overall Status: {'ALL SUITES PASSED' if all_passed else 'SOME SUITES FAILED'}")
    print("=" * 70)

    if not all_passed:
        sys.exit(1)


if __name__ == "__main__":
    main()
