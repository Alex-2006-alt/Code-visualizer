"""Security utilities — AST-based import allowlist and code validation."""

from __future__ import annotations

import ast

from app.core.errors import CodeTooLargeError, ForbiddenImportError

# Modules allowed in user code
IMPORT_ALLOWLIST: frozenset[str] = frozenset({
    "math",
    "random",
    "collections",
    "itertools",
    "heapq",
    "bisect",
    "functools",
    "string",
    "re",
    "typing",
})


def validate_code_size(code: str, max_bytes: int) -> None:
    """Raise CodeTooLargeError if the code exceeds the byte limit."""
    size = len(code.encode("utf-8"))
    if size > max_bytes:
        raise CodeTooLargeError(size=size, limit=max_bytes)


def validate_imports(code: str) -> None:
    """Parse the code AST and reject any forbidden imports."""
    try:
        tree = ast.parse(code)
    except SyntaxError:
        # Let the sandbox handle syntax errors at runtime
        return

    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                _check_module(alias.name)
        elif isinstance(node, ast.ImportFrom) and node.module:
            _check_module(node.module)


def _check_module(module_name: str) -> None:
    """Check a module name against the allowlist."""
    top_level = module_name.split(".")[0]
    if top_level not in IMPORT_ALLOWLIST:
        raise ForbiddenImportError(module=module_name)


def validate_code(code: str, max_bytes: int) -> None:
    """Run all code validation checks."""
    validate_code_size(code, max_bytes)
    validate_imports(code)
