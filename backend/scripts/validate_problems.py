"""Validation script that runs every reference solution against every test.

Can be run locally or in CI:
    python backend/scripts/validate_problems.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

PROBLEMS_DIR = Path("backend/problems")


def validate_all_problems() -> bool:
    problem_files = sorted(PROBLEMS_DIR.glob("*.json"))
    if not problem_files:
        print(f"ERROR: No problem files found in {PROBLEMS_DIR}")
        return False

    print(f"Validating {len(problem_files)} algorithmic problems...")
    all_passed = True
    total_tests_run = 0

    for file_path in problem_files:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        pid = data.get("id")
        title = data.get("title")
        fn_name = data.get("function_name")
        ref_solution = data.get("reference_solution")
        tests = data.get("tests", [])

        # Validate metadata schema
        if not all([pid, title, fn_name, ref_solution, tests]):
            print(f"  [FAIL] {file_path.name}: Missing required metadata fields")
            all_passed = False
            continue

        if len(tests) < 8 or len(tests) > 15:
            print(f"  [FAIL] {pid}: Expected 8 to 15 tests, but found {len(tests)}")
            all_passed = False
            continue

        # Execute reference solution in clean isolated namespace
        local_env: dict = {}
        try:
            exec(ref_solution, {"__builtins__": __builtins__}, local_env)
        except Exception as e:
            print(f"  [FAIL] {pid}: Reference solution syntax or compile error: {e}")
            all_passed = False
            continue

        if fn_name not in local_env or not callable(local_env[fn_name]):
            print(f"  [FAIL] {pid}: Function '{fn_name}' not defined in reference solution")
            all_passed = False
            continue

        fn = local_env[fn_name]
        problem_tests_passed = True

        for test in tests:
            total_tests_run += 1
            test_id = test.get("id")
            inputs = test.get("input", {})
            expected = test.get("expected")

            try:
                # Call function with kwargs
                actual = fn(**inputs)
                if actual != expected:
                    print(
                        f"  [FAIL] {pid} Test #{test_id}: Expected {expected!r}, got {actual!r} for inputs {inputs}"
                    )
                    problem_tests_passed = False
                    all_passed = False
            except Exception as e:
                print(f"  [FAIL] {pid} Test #{test_id}: Exception during execution: {e}")
                problem_tests_passed = False
                all_passed = False

        if problem_tests_passed:
            print(f"  [PASS] {pid} ({title}) - {len(tests)}/{len(tests)} tests passed")

    print("\n" + "=" * 50)
    if all_passed:
        print(f"ALL {len(problem_files)} PROBLEMS VALIDATED CLEANLY! ({total_tests_run} total tests passed)")
        print("=" * 50)
        return True
    else:
        print("PROBLEMS VALIDATION ENCOUNTERED FAILURES!")
        print("=" * 50)
        return False


if __name__ == "__main__":
    success = validate_all_problems()
    if not success:
        sys.exit(1)
