"""Curated code examples and algorithm presets for CodeTrace."""

from __future__ import annotations

from app.schemas import ExampleSchema

CURATED_EXAMPLES: list[ExampleSchema] = [
    ExampleSchema(
        id="bubble-sort",
        title="Bubble Sort",
        category="Sorting",
        difficulty="Easy",
        timeComplexity="O(n^2)",
        spaceComplexity="O(1)",
        code="""def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

numbers = [64, 34, 25, 12, 22]
sorted_numbers = bubble_sort(numbers)
print("Sorted:", sorted_numbers)
""",
    ),
    ExampleSchema(
        id="binary-search",
        title="Binary Search",
        category="Searching",
        difficulty="Easy",
        timeComplexity="O(log n)",
        spaceComplexity="O(1)",
        code="""def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

items = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
idx = binary_search(items, 23)
print("Found at index:", idx)
""",
    ),
    ExampleSchema(
        id="recursive-fibonacci",
        title="Recursive Fibonacci",
        category="Recursion",
        difficulty="Medium",
        timeComplexity="O(2^n)",
        spaceComplexity="O(n)",
        code="""def fibonacci(n):
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    return fibonacci(n - 1) + fibonacci(n - 2)

res = fibonacci(5)
print("Fibonacci(5) =", res)
""",
    ),
    ExampleSchema(
        id="depth-first-search",
        title="Depth-First Search (DFS)",
        category="Graphs",
        difficulty="Medium",
        timeComplexity="O(V + E)",
        spaceComplexity="O(V)",
        code="""def dfs(graph, node, visited=None):
    if visited is None:
        visited = []
    if node not in visited:
        visited.append(node)
        for neighbor in graph.get(node, []):
            dfs(graph, neighbor, visited)
    return visited

graph = {
    'A': ['B', 'C'],
    'B': ['D', 'E'],
    'C': ['F'],
    'D': [],
    'E': ['F'],
    'F': []
}

order = dfs(graph, 'A')
print("DFS Traversal:", order)
""",
    ),
    ExampleSchema(
        id="linked-list-reversal",
        title="Linked List Reversal",
        category="Data Structures",
        difficulty="Medium",
        timeComplexity="O(n)",
        spaceComplexity="O(1)",
        code="""class Node:
    def __init__(self, val, nxt=None):
        self.val = val
        self.next = nxt

def reverse_list(head):
    prev = None
    curr = head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev

head = Node(1, Node(2, Node(3, Node(4, None))))
reversed_head = reverse_list(head)
print("Reversed head value:", reversed_head.val)
""",
    ),
]


def get_curated_examples() -> list[ExampleSchema]:
    """Return all curated example programs."""
    return CURATED_EXAMPLES
