"""Unit tests verifying that all 21 allowed standard library modules can be imported and executed,
and unauthorized modules remain blocked with a clear security error.
"""

from __future__ import annotations

import pytest
from app.config import ALLOWED_MODULES
from sandbox.tracer import IMPORT_ALLOWLIST, trace_code


def test_allowlist_count_and_synchronization() -> None:
    """Ensure exactly 21 modules are configured and synchronized."""
    assert len(ALLOWED_MODULES) == 21
    assert set(ALLOWED_MODULES) == set(IMPORT_ALLOWLIST)


@pytest.mark.parametrize(
    "module_name,code",
    [
        ("math", "import math\nres = math.sqrt(16)"),
        ("random", "import random\nres = random.choice([1, 2, 3])"),
        ("collections", "from collections import deque, Counter\nq = deque([1, 2])\nc = Counter('aab')"),
        ("itertools", "import itertools\nres = list(itertools.islice([1, 2, 3, 4], 2))"),
        ("heapq", "import heapq\nh = [3, 1, 2]\nheapq.heapify(h)\nres = heapq.heappop(h)"),
        ("bisect", "import bisect\na = [1, 3, 5]\nidx = bisect.bisect_left(a, 3)"),
        ("functools", "import functools\nres = functools.reduce(lambda x, y: x + y, [1, 2, 3])"),
        ("string", "import string\nres = string.ascii_lowercase[:5]"),
        ("re", "import re\nres = bool(re.match(r'\\d+', '12345'))"),
        ("typing", "from typing import List, Optional\nx: Optional[List[int]] = [1, 2]"),
        ("dataclasses", "from dataclasses import dataclass\n@dataclass\nclass Point:\n    x: int\n    y: int\np = Point(1, 2)"),
        ("copy", "import copy\na = [1, [2]]\nb = copy.deepcopy(a)"),
        ("json", "import json\nres = json.dumps({'key': 42})"),
        ("datetime", "import datetime\nd = datetime.date(2026, 11, 3)"),
        ("time", "import time\nt = time.struct_time((2026, 1, 1, 0, 0, 0, 0, 0, 0))"),
        ("enum", "from enum import Enum\nclass Color(Enum):\n    RED = 1\nc = Color.RED"),
        ("queue", "import queue\nq = queue.Queue()\nq.put(42)\nres = q.get()"),
        ("array", "import array\narr = array.array('i', [1, 2, 3])"),
        ("cmath", "import cmath\nres = cmath.sqrt(-1)"),
        ("fractions", "from fractions import Fraction\nf = Fraction(1, 3) + Fraction(1, 6)"),
        ("statistics", "import statistics\nres = statistics.mean([2, 4, 6])"),
    ],
)
def test_each_allowed_module_executes(module_name: str, code: str) -> None:
    """Verify that user code can import and use every allowed module without errors."""
    result = trace_code(code)
    assert result["error"] is None, f"Failed on module {module_name}: {result['error']}"
    assert len(result["steps"]) > 0


@pytest.mark.parametrize(
    "forbidden_module",
    [
        "os",
        "subprocess",
        "socket",
        "requests",
        "urllib",
        "shutil",
        "pathlib",
        "sqlite3",
        "pickle",
        "ctypes",
    ],
)
def test_disallowed_modules_are_rejected_with_allowed_list(forbidden_module: str) -> None:
    """Ensure disallowed modules raise informative error listing allowed modules."""
    code = f"import {forbidden_module}"
    result = trace_code(code)
    assert result["error"] is not None
    assert "Security Error" in result["error"]
    assert "forbidden" in result["error"].lower()
    assert "Allowed modules:" in result["error"]
