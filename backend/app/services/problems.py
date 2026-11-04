"""Practice mode problems catalog and sandbox submission evaluator service."""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

from app.config import get_settings
from app.core.errors import NotFoundError, ValidationError
from app.core.security import validate_code
from app.schemas import (
    ProblemDetailSchema,
    ProblemSubmitResponse,
    ProblemSummarySchema,
    TestCaseResultSchema,
    VisibleTestCaseSchema,
)
from app.services.sandbox import BaseSandboxRunner

settings = get_settings()
PROBLEMS_DIR = Path(__file__).resolve().parent.parent.parent / "problems"


def get_all_problems() -> list[ProblemSummarySchema]:
    """Retrieve summarized list of all available algorithmic practice problems."""
    if not PROBLEMS_DIR.exists():
        return []

    problems: list[ProblemSummarySchema] = []
    for file_path in sorted(PROBLEMS_DIR.glob("*.json")):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            problems.append(
                ProblemSummarySchema(
                    id=data["id"],
                    title=data["title"],
                    difficulty=data["difficulty"],
                    category=data["category"],
                    test_count=len(data.get("tests", [])),
                )
            )
        except Exception:
            continue

    return problems


def get_problem_detail(problem_id: str) -> ProblemDetailSchema:
    """Retrieve full details of a specific problem with only visible tests exposed."""
    file_path = PROBLEMS_DIR / f"{problem_id}.json"
    if not file_path.exists():
        raise NotFoundError(message=f"Problem '{problem_id}' not found.")

    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Expose ONLY visible example test cases
    visible_tests = [
        VisibleTestCaseSchema(
            id=t["id"],
            input=t["input"],
            expected=t["expected"],
            visible=True,
        )
        for t in data.get("tests", [])
        if t.get("visible", False)
    ]

    return ProblemDetailSchema(
        id=data["id"],
        title=data["title"],
        difficulty=data["difficulty"],
        category=data["category"],
        statement=data["statement"],
        constraints=data["constraints"],
        function_name=data["function_name"],
        starter_code=data["starter_code"],
        example_tests=visible_tests,
    )


async def evaluate_submission(
    problem_id: str,
    user_code: str,
    runner: BaseSandboxRunner,
) -> ProblemSubmitResponse:
    """Execute user submission against all problem tests inside the secure sandbox."""
    file_path = PROBLEMS_DIR / f"{problem_id}.json"
    if not file_path.exists():
        raise NotFoundError(message=f"Problem '{problem_id}' not found.")

    with open(file_path, "r", encoding="utf-8") as f:
        problem_data = json.load(f)

    fn_name = problem_data["function_name"]
    all_tests = problem_data.get("tests", [])

    # 1. Pre-execution static validation
    validate_code(user_code, settings.max_code_size_bytes)

    # 2. Build test evaluation harness script
    serialized_tests = json.dumps(all_tests)
    harness_code = f"""import json
import time

{user_code}

__tests__ = {serialized_tests}
__results__ = []

for __t__ in __tests__:
    __tid__ = __t__["id"]
    __tvis__ = bool(__t__.get("visible", False))
    __inp__ = __t__["input"]
    __exp__ = __t__["expected"]
    
    __t0__ = time.perf_counter()
    try:
        if "{fn_name}" not in globals() or not callable(globals()["{fn_name}"]):
            raise NameError("Function '{fn_name}' is not defined.")
        
        __act__ = {fn_name}(**__inp__)
        __elapsed__ = round((time.perf_counter() - __t0__) * 1000, 3)
        
        if __act__ == __exp__:
            __entry__ = {{
                "test_id": __tid__,
                "visible": __tvis__,
                "status": "passed",
                "execution_time_ms": __elapsed__
            }}
            if __tvis__:
                __entry__["input"] = __inp__
                __entry__["expected"] = __exp__
                __entry__["actual"] = __act__
            __results__.append(__entry__)
        else:
            __entry__ = {{
                "test_id": __tid__,
                "visible": __tvis__,
                "status": "failed",
                "execution_time_ms": __elapsed__
            }}
            if __tvis__:
                __entry__["input"] = __inp__
                __entry__["expected"] = __exp__
                __entry__["actual"] = __act__
            __results__.append(__entry__)
    except Exception as __e__:
        __elapsed__ = round((time.perf_counter() - __t0__) * 1000, 3)
        __entry__ = {{
            "test_id": __tid__,
            "visible": __tvis__,
            "status": "error",
            "error": f"{{type(__e__).__name__}}: {{str(__e__)}}",
            "execution_time_ms": __elapsed__
        }}
        if __tvis__:
            __entry__["input"] = __inp__
            __entry__["expected"] = __exp__
        __results__.append(__entry__)

print("__PRACTICE_RESULTS__" + json.dumps(__results__))
"""

    # 3. Execute inside secure sandbox
    run_result = await runner.run(code=harness_code)

    if run_result.error:
        # Compilation or syntax error in user code
        results: list[TestCaseResultSchema] = []
        for t in all_tests:
            is_vis = bool(t.get("visible", False))
            res = TestCaseResultSchema(
                test_id=t["id"],
                visible=is_vis,
                status="error",
                error=run_result.error,
            )
            if is_vis:
                res.input = t["input"]
                res.expected = t["expected"]
            results.append(res)

        return ProblemSubmitResponse(
            problem_id=problem_id,
            all_passed=False,
            passed_count=0,
            total_count=len(all_tests),
            results=results,
        )

    # 4. Extract structured results from output terminal
    output = run_result.steps[-1].output if run_result.steps else ""
    marker_match = re.search(r"__PRACTICE_RESULTS__(.+)$", output, re.MULTILINE)

    if not marker_match:
        # Check if execution timed out or was truncated
        status_code = "timeout" if run_result.step_limit_reached or run_result.truncated else "error"
        error_msg = "Execution timed out or exceeded step limits." if status_code == "timeout" else "Harness failed to complete."
        results = [
            TestCaseResultSchema(
                test_id=t["id"],
                visible=bool(t.get("visible", False)),
                status=status_code,
                error=error_msg,
                input=t["input"] if t.get("visible") else None,
                expected=t["expected"] if t.get("visible") else None,
            )
            for t in all_tests
        ]
        return ProblemSubmitResponse(
            problem_id=problem_id,
            all_passed=False,
            passed_count=0,
            total_count=len(all_tests),
            results=results,
        )

    raw_results = json.loads(marker_match.group(1))
    test_results: list[TestCaseResultSchema] = [TestCaseResultSchema(**r) for r in raw_results]

    passed_count = sum(1 for r in test_results if r.status == "passed")
    all_passed = passed_count == len(test_results)

    return ProblemSubmitResponse(
        problem_id=problem_id,
        all_passed=all_passed,
        passed_count=passed_count,
        total_count=len(test_results),
        results=test_results,
    )
