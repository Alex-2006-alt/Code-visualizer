"""Generate the comprehensive 80-program test corpus for CodeTrace.

Generates:
- tests-e2e/corpus/<filename>.py
- tests-e2e/corpus/<filename>.json (with oracle stdout from local CPython)
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

CORPUS_DIR = Path(__file__).parent / "corpus"
CORPUS_DIR.mkdir(parents=True, exist_ok=True)

PROGRAMS: list[dict] = [
    # ─── Category A: Basics (8) ────────────────────────────────────────────────
    {
        "filename": "a01_variable_assignment",
        "category": "A_basics",
        "name": "Variable Assignment",
        "outcome": "ok",
        "code": """x = 10
y = 20
z = x + y
name = "CodeTrace"
is_active = True
print(f"x={x}, y={y}, z={z}, name={name}, is_active={is_active}")
""",
    },
    {
        "filename": "a02_arithmetic",
        "category": "A_basics",
        "name": "Arithmetic Operations",
        "outcome": "ok",
        "code": """a = 15
b = 4
sum_val = a + b
diff_val = a - b
prod_val = a * b
div_val = a / b
floor_val = a // b
mod_val = a % b
pow_val = b ** 3
print(sum_val, diff_val, prod_val, div_val, floor_val, mod_val, pow_val)
""",
    },
    {
        "filename": "a03_strings",
        "category": "A_basics",
        "name": "String Manipulations",
        "outcome": "ok",
        "code": """s = "hello world"
upper_s = s.upper()
sub = s[0:5]
rev = s[::-1]
words = s.split(" ")
joined = "-".join(words)
print(upper_s, sub, rev, joined)
""",
    },
    {
        "filename": "a04_fstrings",
        "category": "A_basics",
        "name": "f-Strings and Formatting",
        "outcome": "ok",
        "code": """name = "Alice"
score = 95.678
output = f"Player {name} scored {score:.1f}%"
calc = f"2 + 2 = {2 + 2}"
print(output)
print(calc)
""",
    },
    {
        "filename": "a05_if_else",
        "category": "A_basics",
        "name": "Branching Conditionals",
        "outcome": "ok",
        "code": """val = 42
result = ""
if val < 0:
    result = "negative"
elif val == 0:
    result = "zero"
elif val % 2 == 0:
    result = "positive even"
else:
    result = "positive odd"
print("Result:", result)
""",
    },
    {
        "filename": "a06_for_loop",
        "category": "A_basics",
        "name": "For Loop with Accumulator",
        "outcome": "ok",
        "code": """total = 0
for i in range(1, 6):
    total += i * i
print("Sum of squares:", total)
""",
    },
    {
        "filename": "a07_while_loop",
        "category": "A_basics",
        "name": "While Loop",
        "outcome": "ok",
        "code": """n = 16
steps = 0
while n > 1:
    if n % 2 == 0:
        n = n // 2
    else:
        n = 3 * n + 1
    steps += 1
print("Collatz steps to 1:", steps)
""",
    },
    {
        "filename": "a08_print_only",
        "category": "A_basics",
        "name": "Print Only Program",
        "outcome": "ok",
        "code": """print("Line 1: Welcome")
print("Line 2: To")
print("Line 3: CodeTrace")
""",
    },

    # ─── Category B: Data Structures (10) ──────────────────────────────────────
    {
        "filename": "b01_list_operations",
        "category": "B_data_structures",
        "name": "List Append Pop Insert Sort",
        "outcome": "ok",
        "code": """nums = [5, 2, 8]
nums.append(1)
nums.insert(1, 9)
popped = nums.pop()
nums.sort()
print("nums:", nums, "popped:", popped)
""",
    },
    {
        "filename": "b02_dict_operations",
        "category": "B_data_structures",
        "name": "Dictionary Operations",
        "outcome": "ok",
        "code": """d = {"a": 1, "b": 2}
d["c"] = 3
d["a"] = 10
del d["b"]
keys = sorted(list(d.keys()))
print("dict:", d, "keys:", keys)
""",
    },
    {
        "filename": "b03_set_operations",
        "category": "B_data_structures",
        "name": "Set Operations",
        "outcome": "ok",
        "code": """s1 = {1, 2, 3, 4}
s2 = {3, 4, 5, 6}
s1.add(10)
inter = sorted(list(s1 & s2))
union = sorted(list(s1 | s2))
print("Intersection:", inter)
print("Union:", union)
""",
    },
    {
        "filename": "b04_tuple_unpacking",
        "category": "B_data_structures",
        "name": "Tuple Packing and Unpacking",
        "outcome": "ok",
        "code": """point = (10, 20, 30)
x, y, z = point
first, *rest = [1, 2, 3, 4, 5]
print("x, y, z:", x, y, z)
print("first:", first, "rest:", rest)
""",
    },
    {
        "filename": "b05_nested_lists",
        "category": "B_data_structures",
        "name": "2D Nested Lists Grid",
        "outcome": "ok",
        "code": """grid = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]
grid[1][1] = 99
diag_sum = sum(grid[i][i] for i in range(3))
print("Modified grid[1][1]:", grid[1][1])
print("Diagonal sum:", diag_sum)
""",
    },
    {
        "filename": "b06_list_comprehension",
        "category": "B_data_structures",
        "name": "List Comprehensions with Filters",
        "outcome": "ok",
        "code": """evens = [x for x in range(10) if x % 2 == 0]
squares = [x * x for x in evens]
print("evens:", evens)
print("squares:", squares)
""",
    },
    {
        "filename": "b07_dict_comprehension",
        "category": "B_data_structures",
        "name": "Dict Comprehensions",
        "outcome": "ok",
        "code": """words = ["apple", "banana", "cherry"]
lengths = {w: len(w) for w in words}
print("lengths:", sorted(lengths.items()))
""",
    },
    {
        "filename": "b08_stack",
        "category": "B_data_structures",
        "name": "Stack via List (LIFO)",
        "outcome": "ok",
        "code": """stack = []
for item in ["first", "second", "third"]:
    stack.append(item)
popped1 = stack.pop()
popped2 = stack.pop()
print("popped1:", popped1, "popped2:", popped2, "remaining:", stack)
""",
    },
    {
        "filename": "b09_queue_deque",
        "category": "B_data_structures",
        "name": "Queue with collections.deque",
        "outcome": "ok",
        "code": """import collections
q = collections.deque()
q.append(1)
q.append(2)
q.append(3)
first = q.popleft()
print("first dequeued:", first, "remaining:", list(q))
""",
    },
    {
        "filename": "b10_heap_heapq",
        "category": "B_data_structures",
        "name": "Min-Heap with heapq",
        "outcome": "ok",
        "code": """import heapq
heap = []
for n in [34, 12, 5, 89, 1]:
    heapq.heappush(heap, n)
smallest = heapq.heappop(heap)
second = heapq.heappop(heap)
print("smallest:", smallest, "second:", second)
""",
    },

    # ─── Category C: Algorithms (12) ──────────────────────────────────────────
    {
        "filename": "c01_bubble_sort",
        "category": "C_algorithms",
        "name": "Bubble Sort",
        "outcome": "ok",
        "code": """def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

res = bubble_sort([5, 1, 4, 2, 8])
print("Sorted:", res)
""",
    },
    {
        "filename": "c02_selection_sort",
        "category": "C_algorithms",
        "name": "Selection Sort",
        "outcome": "ok",
        "code": """def selection_sort(arr):
    for i in range(len(arr)):
        min_idx = i
        for j in range(i + 1, len(arr)):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr

print("Sorted:", selection_sort([29, 10, 14, 37, 13]))
""",
    },
    {
        "filename": "c03_insertion_sort",
        "category": "C_algorithms",
        "name": "Insertion Sort",
        "outcome": "ok",
        "code": """def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and key < arr[j]:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr

print("Sorted:", insertion_sort([12, 11, 13, 5, 6]))
""",
    },
    {
        "filename": "c04_merge_sort",
        "category": "C_algorithms",
        "name": "Merge Sort",
        "outcome": "ok",
        "code": """def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    merged = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            j += 1
    merged.extend(left[i:])
    merged.extend(right[j:])
    return merged

print("Sorted:", merge_sort([38, 27, 43, 3, 9, 82, 10]))
""",
    },
    {
        "filename": "c05_quick_sort",
        "category": "C_algorithms",
        "name": "Quick Sort",
        "outcome": "ok",
        "code": """def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    mid = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + mid + quick_sort(right)

print("Sorted:", quick_sort([10, 7, 8, 9, 1, 5]))
""",
    },
    {
        "filename": "c06_binary_search",
        "category": "C_algorithms",
        "name": "Binary Search",
        "outcome": "ok",
        "code": """def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

items = [2, 5, 8, 12, 16, 23, 38, 56]
print("Index of 23:", binary_search(items, 23))
print("Index of 99:", binary_search(items, 99))
""",
    },
    {
        "filename": "c07_two_sum",
        "category": "C_algorithms",
        "name": "Two Sum with Dict",
        "outcome": "ok",
        "code": """def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        compl = target - num
        if compl in seen:
            return [seen[compl], i]
        seen[num] = i
    return []

print("Indices:", two_sum([2, 7, 11, 15], 9))
""",
    },
    {
        "filename": "c08_sliding_window",
        "category": "C_algorithms",
        "name": "Sliding Window Maximum Sum",
        "outcome": "ok",
        "code": """def max_sub_array_of_size_k(k, arr):
    max_sum = 0
    window_sum = sum(arr[:k])
    max_sum = window_sum
    for i in range(len(arr) - k):
        window_sum = window_sum - arr[i] + arr[i + k]
        if window_sum > max_sum:
            max_sum = window_sum
    return max_sum

print("Max sum subarray k=3:", max_sub_array_of_size_k(3, [2, 1, 5, 1, 3, 2]))
""",
    },
    {
        "filename": "c09_prefix_sum",
        "category": "C_algorithms",
        "name": "Prefix Sum Array",
        "outcome": "ok",
        "code": """def build_prefix_sums(arr):
    prefix = [0] * (len(arr) + 1)
    for i in range(len(arr)):
        prefix[i + 1] = prefix[i] + arr[i]
    return prefix

p = build_prefix_sums([1, 2, 3, 4, 5])
# Range sum from index 1 to 3 inclusive (2 + 3 + 4 = 9)
range_sum = p[4] - p[1]
print("Prefix:", p, "RangeSum(1, 3):", range_sum)
""",
    },
    {
        "filename": "c10_gcd",
        "category": "C_algorithms",
        "name": "GCD Euclidean Algorithm",
        "outcome": "ok",
        "code": """def gcd(a, b):
    while b:
        a, b = b, a % b
    return a

print("GCD(48, 18):", gcd(48, 18))
print("GCD(101, 10):", gcd(101, 10))
""",
    },
    {
        "filename": "c11_prime_sieve",
        "category": "C_algorithms",
        "name": "Sieve of Eratosthenes",
        "outcome": "ok",
        "code": """def sieve(n):
    is_prime = [True] * (n + 1)
    is_prime[0] = is_prime[1] = False
    for p in range(2, int(n**0.5) + 1):
        if is_prime[p]:
            for i in range(p * p, n + 1, p):
                is_prime[i] = False
    return [i for i in range(n + 1) if is_prime[i]]

print("Primes up to 30:", sieve(30))
""",
    },
    {
        "filename": "c12_matrix_traversal",
        "category": "C_algorithms",
        "name": "Matrix Spiral Traversal",
        "outcome": "ok",
        "code": """matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]
result = []
while matrix:
    result.extend(matrix.pop(0))
    if matrix and matrix[0]:
        for row in matrix:
            result.append(row.pop())
    if matrix:
        result.extend(matrix.pop()[::-1])
    if matrix and matrix[0]:
        for row in matrix[::-1]:
            result.append(row.pop(0))

print("Spiral traversal:", result)
""",
    },

    # ─── Category D: Recursion (8) ─────────────────────────────────────────────
    {
        "filename": "d01_factorial",
        "category": "D_recursion",
        "name": "Recursive Factorial",
        "outcome": "ok",
        "code": """def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print("5! =", factorial(5))
""",
    },
    {
        "filename": "d02_fibonacci",
        "category": "D_recursion",
        "name": "Recursive Fibonacci",
        "outcome": "ok",
        "code": """def fib(n):
    if n <= 0:
        return 0
    if n == 1:
        return 1
    return fib(n - 1) + fib(n - 2)

print("fib(7) =", fib(7))
""",
    },
    {
        "filename": "d03_power",
        "category": "D_recursion",
        "name": "Recursive Fast Power",
        "outcome": "ok",
        "code": """def fast_power(base, exp):
    if exp == 0:
        return 1
    if exp % 2 == 0:
        half = fast_power(base, exp // 2)
        return half * half
    return base * fast_power(base, exp - 1)

print("2^10 =", fast_power(2, 10))
""",
    },
    {
        "filename": "d04_sum_list",
        "category": "D_recursion",
        "name": "Recursive List Sum",
        "outcome": "ok",
        "code": """def recursive_sum(arr):
    if not arr:
        return 0
    return arr[0] + recursive_sum(arr[1:])

print("Sum:", recursive_sum([1, 2, 3, 4, 5]))
""",
    },
    {
        "filename": "d05_permutations",
        "category": "D_recursion",
        "name": "Recursive Permutations",
        "outcome": "ok",
        "code": """def permute(s):
    if len(s) <= 1:
        return [s]
    perms = []
    for i, c in enumerate(s):
        for p in permute(s[:i] + s[i+1:]):
            perms.append(c + p)
    return perms

print("Permutations of 'abc':", sorted(permute("abc")))
""",
    },
    {
        "filename": "d06_subsets",
        "category": "D_recursion",
        "name": "Recursive Subsets (Power Set)",
        "outcome": "ok",
        "code": """def subsets(nums):
    res = []
    def backtrack(start, curr):
        res.append(list(curr))
        for i in range(start, len(nums)):
            curr.append(nums[i])
            backtrack(i + 1, curr)
            curr.pop()
    backtrack(0, [])
    return res

print("Subsets count:", len(subsets([1, 2, 3])))
""",
    },
    {
        "filename": "d07_tower_of_hanoi",
        "category": "D_recursion",
        "name": "Tower of Hanoi",
        "outcome": "ok",
        "code": """moves = []
def hanoi(n, source, target, auxiliary):
    if n > 0:
        hanoi(n - 1, source, auxiliary, target)
        moves.append(f"{source}->{target}")
        hanoi(n - 1, auxiliary, target, source)

hanoi(3, 'A', 'C', 'B')
print("Moves count:", len(moves))
print("Moves:", moves)
""",
    },
    {
        "filename": "d08_recursion_depth_50",
        "category": "D_recursion",
        "name": "Recursion Depth ~45",
        "outcome": "ok",
        "code": """def countdown(n):
    if n == 0:
        return "Liftoff!"
    return countdown(n - 1)

print("Result:", countdown(45))
""",
    },

    # ─── Category E: Dynamic Programming & Graphs (6) ─────────────────────────
    {
        "filename": "e01_fibonacci_memo",
        "category": "E_dp_graphs",
        "name": "Fibonacci with Memoization",
        "outcome": "ok",
        "code": """memo = {}
def fib_memo(n):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fib_memo(n - 1) + fib_memo(n - 2)
    return memo[n]

print("fib_memo(12) =", fib_memo(12))
""",
    },
    {
        "filename": "e02_climbing_stairs",
        "category": "E_dp_graphs",
        "name": "Climbing Stairs DP",
        "outcome": "ok",
        "code": """def climb_stairs(n):
    if n <= 2:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    dp[2] = 2
    for i in range(3, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]

print("Ways to climb 8 stairs:", climb_stairs(8))
""",
    },
    {
        "filename": "e03_knapsack_small",
        "category": "E_dp_graphs",
        "name": "0/1 Knapsack Small",
        "outcome": "ok",
        "code": """weights = [2, 3, 4]
values = [3, 4, 5]
capacity = 5
n = len(weights)
dp = [[0] * (capacity + 1) for _ in range(n + 1)]

for i in range(1, n + 1):
    for w in range(capacity + 1):
        if weights[i - 1] <= w:
            dp[i][w] = max(dp[i - 1][w], dp[i - 1][w - weights[i - 1]] + values[i - 1])
        else:
            dp[i][w] = dp[i - 1][w]

print("Max knapsack value:", dp[n][capacity])
""",
    },
    {
        "filename": "e04_bfs",
        "category": "E_dp_graphs",
        "name": "Breadth-First Search (BFS)",
        "outcome": "ok",
        "code": """import collections
graph = {
    'A': ['B', 'C'],
    'B': ['D', 'E'],
    'C': ['F'],
    'D': [],
    'E': ['F'],
    'F': []
}

def bfs(start):
    visited = []
    queue = collections.deque([start])
    while queue:
        vertex = queue.popleft()
        if vertex not in visited:
            visited.append(vertex)
            for neighbor in graph[vertex]:
                queue.append(neighbor)
    return visited

print("BFS traversal:", bfs('A'))
""",
    },
    {
        "filename": "e05_dfs",
        "category": "E_dp_graphs",
        "name": "Depth-First Search (DFS)",
        "outcome": "ok",
        "code": """graph = {
    'A': ['B', 'C'],
    'B': ['D'],
    'C': ['E', 'F'],
    'D': [],
    'E': [],
    'F': []
}

def dfs(node, visited=None):
    if visited is None:
        visited = []
    visited.append(node)
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs(neighbor, visited)
    return visited

print("DFS order:", dfs('A'))
""",
    },
    {
        "filename": "e06_shortest_path_graph",
        "category": "E_dp_graphs",
        "name": "Shortest Path BFS Unweighted",
        "outcome": "ok",
        "code": """import collections
graph = {
    'A': ['B', 'C'],
    'B': ['A', 'D', 'E'],
    'C': ['A', 'F'],
    'D': ['B'],
    'E': ['B', 'F'],
    'F': ['C', 'E']
}

def shortest_path(start, end):
    queue = collections.deque([[start]])
    visited = {start}
    while queue:
        path = queue.popleft()
        node = path[-1]
        if node == end:
            return path
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(path + [neighbor])
    return []

print("Shortest path A->F:", shortest_path('A', 'F'))
""",
    },

    # ─── Category F: Classes & References (8) ─────────────────────────────────
    {
        "filename": "f01_simple_class",
        "category": "F_classes_references",
        "name": "Simple Point Class",
        "outcome": "ok",
        "code": """class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    def distance_sq(self):
        return self.x * self.x + self.y * self.y

p = Point(3, 4)
print("Point dist^2:", p.distance_sq())
""",
    },
    {
        "filename": "f02_linked_list_reverse",
        "category": "F_classes_references",
        "name": "Linked List Build and Reverse",
        "outcome": "ok",
        "code": """class Node:
    def __init__(self, val, nxt=None):
        self.val = val
        self.next = nxt

head = Node(1, Node(2, Node(3, None)))
prev = None
curr = head
while curr:
    nxt = curr.next
    curr.next = prev
    prev = curr
    curr = nxt

vals = []
while prev:
    vals.append(prev.val)
    prev = prev.next
print("Reversed list:", vals)
""",
    },
    {
        "filename": "f03_binary_tree_traversal",
        "category": "F_classes_references",
        "name": "Binary Tree Inorder Traversal",
        "outcome": "ok",
        "code": """class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

root = TreeNode(4, TreeNode(2, TreeNode(1), TreeNode(3)), TreeNode(5))
out = []
def inorder(node):
    if node:
        inorder(node.left)
        out.append(node.val)
        inorder(node.right)

inorder(root)
print("Inorder:", out)
""",
    },
    {
        "filename": "f04_shared_references",
        "category": "F_classes_references",
        "name": "Shared List Reference Aliasing",
        "outcome": "ok",
        "code": """a = [1, 2, 3]
b = a
b.append(99)
print("a:", a, "b:", b, "is same:", a is b)
""",
    },
    {
        "filename": "f05_mutable_default_arg",
        "category": "F_classes_references",
        "name": "Mutable Default Argument Behavior",
        "outcome": "ok",
        "code": """def append_to(element, target=[]):
    target.append(element)
    return target

r1 = append_to(1)
r2 = append_to(2)
print("r1:", r1, "r2:", r2, "same list:", r1 is r2)
""",
    },
    {
        "filename": "f06_nested_objects",
        "category": "F_classes_references",
        "name": "Nested Composite Objects",
        "outcome": "ok",
        "code": """class Engine:
    def __init__(self, horsepower):
        self.hp = horsepower

class Car:
    def __init__(self, model, engine):
        self.model = model
        self.engine = engine

car = Car("Roadster", Engine(500))
print(f"Car: {car.model}, HP: {car.engine.hp}")
""",
    },
    {
        "filename": "f07_repr_methods",
        "category": "F_classes_references",
        "name": "Object __repr__ and __str__",
        "outcome": "ok",
        "code": """class User:
    def __init__(self, name, uid):
        self.name = name
        self.uid = uid
    def __repr__(self):
        return f"User({self.name!r}, {self.uid})"

u = User("Grace", 101)
print(repr(u))
""",
    },
    {
        "filename": "f08_inheritance",
        "category": "F_classes_references",
        "name": "Inheritance and Super Calls",
        "outcome": "ok",
        "code": """class Animal:
    def sound(self):
        return "some sound"

class Dog(Animal):
    def sound(self):
        return "bark"

class Cat(Animal):
    def sound(self):
        return "meow"

d = Dog()
c = Cat()
print("Dog:", d.sound(), "Cat:", c.sound())
""",
    },

    # ─── Category G: Other Language Features (6) ──────────────────────────────
    {
        "filename": "g01_generator",
        "category": "G_other_features",
        "name": "Generator Function",
        "outcome": "ok",
        "code": """def count_up(n):
    for i in range(n):
        yield i * 2

gen = count_up(4)
items = list(gen)
print("Generator yield:", items)
""",
    },
    {
        "filename": "g02_lambda_map_filter",
        "category": "G_other_features",
        "name": "Lambda with Map and Filter",
        "outcome": "ok",
        "code": """nums = [1, 2, 3, 4, 5, 6]
evens = list(filter(lambda x: x % 2 == 0, nums))
squared = list(map(lambda x: x * x, evens))
print("Evens:", evens, "Squared:", squared)
""",
    },
    {
        "filename": "g03_try_except_finally",
        "category": "G_other_features",
        "name": "Try Except Finally Handling",
        "outcome": "ok",
        "code": """logs = []
try:
    logs.append("try start")
    res = 10 / 2
    logs.append(f"res={res}")
except ZeroDivisionError:
    logs.append("caught")
finally:
    logs.append("cleanup")

print("Execution logs:", logs)
""",
    },
    {
        "filename": "g04_closures",
        "category": "G_other_features",
        "name": "Closures and Scopes",
        "outcome": "ok",
        "code": """def make_multiplier(factor):
    def multiply(val):
        return val * factor
    return multiply

double = make_multiplier(2)
triple = make_multiplier(3)
print("Double 5:", double(5), "Triple 5:", triple(5))
""",
    },
    {
        "filename": "g05_global_vs_local",
        "category": "G_other_features",
        "name": "Global vs Local Variables",
        "outcome": "ok",
        "code": """counter = 0

def increment():
    global counter
    counter += 1

increment()
increment()
print("Counter:", counter)
""",
    },
    {
        "filename": "g06_string_formatting",
        "category": "G_other_features",
        "name": "String Format and Modulo",
        "outcome": "ok",
        "code": """fmt1 = "Hello, {}!".format("world")
fmt2 = "{a} + {b} = {c}".format(a=3, b=4, c=7)
fmt3 = "Hex: 0x%02x" % 255
print(fmt1)
print(fmt2)
print(fmt3)
""",
    },

    # ─── Category H: Student-Style Messy Code (6) ─────────────────────────────
    {
        "filename": "h01_bad_indentation",
        "category": "H_messy_code",
        "name": "Inconsistent Indentation Levels",
        "outcome": "ok",
        "code": """def calculate():
    x = 10
    if x > 5:
        y = 20
        z = x + y
        return z
    return 0

print("Calculated:", calculate())
""",
    },
    {
        "filename": "h02_unused_variables",
        "category": "H_messy_code",
        "name": "Multiple Unused Variables",
        "outcome": "ok",
        "code": """unused_a = 100
unused_b = "temporary"
unused_list = [1, 2, 3]
active_sum = 0
for i in range(5):
    active_sum += i
print("Final sum:", active_sum)
""",
    },
    {
        "filename": "h03_long_lines",
        "category": "H_messy_code",
        "name": "Very Long Line Expression",
        "outcome": "ok",
        "code": """numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
combined = sum(x * 2 for x in numbers if x % 2 == 0) + sum(x * 3 for x in numbers if x % 3 == 0)
print("Combined long calc:", combined)
""",
    },
    {
        "filename": "h04_unicode_emoji",
        "category": "H_messy_code",
        "name": "Unicode Strings and Emojis",
        "outcome": "ok",
        "code": """greeting = "こんにちは世界"
badge = "🚀 CodeTrace ⚡"
count = len(greeting)
print(greeting, badge, count)
""",
    },
    {
        "filename": "h05_tabs_vs_spaces",
        "category": "H_messy_code",
        "name": "Spaces Stylings",
        "outcome": "ok",
        "code": """def compute(n):
    total = 0
    for i in range(n):
        total += i
    return total

print("Result:", compute(6))
""",
    },
    {
        "filename": "h06_crlf_endings",
        "category": "H_messy_code",
        "name": "CRLF Windows Line Endings",
        "outcome": "ok",
        "code": "a = 10\r\nb = 20\r\nc = a * b\r\nprint('CRLF product:', c)\r\n",
    },

    # ─── Category I: Expected Failures (10) ───────────────────────────────────
    {
        "filename": "i01_syntax_error",
        "category": "I_expected_failures",
        "name": "Syntax Error",
        "outcome": "exception",
        "code": """def broken_function(:
    pass
""",
    },
    {
        "filename": "i02_name_error",
        "category": "I_expected_failures",
        "name": "NameError Undefined Variable",
        "outcome": "exception",
        "code": """x = 10
print(undefined_variable)
""",
    },
    {
        "filename": "i03_zero_division",
        "category": "I_expected_failures",
        "name": "ZeroDivisionError",
        "outcome": "exception",
        "code": """a = 50
b = 0
c = a / b
""",
    },
    {
        "filename": "i04_index_error",
        "category": "I_expected_failures",
        "name": "IndexError List Out of Bounds",
        "outcome": "exception",
        "code": """arr = [1, 2, 3]
val = arr[10]
""",
    },
    {
        "filename": "i05_key_error",
        "category": "I_expected_failures",
        "name": "KeyError Missing Dictionary Key",
        "outcome": "exception",
        "code": """d = {"name": "Alice"}
age = d["age"]
""",
    },
    {
        "filename": "i06_infinite_loop",
        "category": "I_expected_failures",
        "name": "Infinite While Loop",
        "outcome": "timeout",
        "code": """while True:
    pass
""",
    },
    {
        "filename": "i07_long_loop_over_2000",
        "category": "I_expected_failures",
        "name": "Loop Over 2000 Steps",
        "outcome": "truncated",
        "code": """x = 0
for i in range(2500):
    x += 1
print("Final:", x)
""",
    },
    {
        "filename": "i08_huge_output",
        "category": "I_expected_failures",
        "name": "Huge Stdout Print Loop",
        "outcome": "ok",
        "code": """for i in range(200):
    print("A" * 100)
""",
    },
    {
        "filename": "i09_forbidden_import",
        "category": "I_expected_failures",
        "name": "Forbidden OS Import",
        "outcome": "blocked",
        "code": """import os
print(os.getcwd())
""",
    },
    {
        "filename": "i10_file_open_access",
        "category": "I_expected_failures",
        "name": "Forbidden Open File Access",
        "outcome": "exception",
        "code": """f = open("sandbox_leak.txt", "w")
f.write("test")
f.close()
""",
    },

    # ─── Category J: Abuse & Limits (6) ───────────────────────────────────────
    {
        "filename": "j01_memory_bomb",
        "category": "J_abuse_limits",
        "name": "Memory Bomb String Allocation",
        "outcome": "exception",
        "code": """blob = " " * (200 * 1024 * 1024)
print(len(blob))
""",
    },
    {
        "filename": "j02_fork_bomb",
        "category": "J_abuse_limits",
        "name": "Fork Bomb Attempt",
        "outcome": "blocked",
        "code": """import os
while True:
    os.fork()
""",
    },
    {
        "filename": "j03_deeply_nested_data",
        "category": "J_abuse_limits",
        "name": "Deeply Nested 20-level List",
        "outcome": "ok",
        "code": """root = []
curr = root
for i in range(20):
    curr.append([i])
    curr = curr[-1]
print("Deep nesting depth:", len(root))
""",
    },
    {
        "filename": "j04_code_10kb_exact",
        "category": "J_abuse_limits",
        "name": "Code Exactly 10KB Limit",
        "outcome": "ok",
        "code": 'x = 42\nprint("Exactly 10KB:", x)\n' + '# ' + 'A' * (10240 - len('x = 42\nprint("Exactly 10KB:", x)\n') - 3) + '\n',
    },
    {
        "filename": "j05_code_over_10kb",
        "category": "J_abuse_limits",
        "name": "Code Exceeding 10KB Limit",
        "outcome": "blocked",
        "code": 'x = 1\n' + '# ' + 'B' * 10245,
    },
    {
        "filename": "j06_empty_code",
        "category": "J_abuse_limits",
        "name": "Empty / Whitespace Code",
        "outcome": "blocked",
        "code": "   \n\n   \t  \n",
    },
]


def run_cpython_oracle(code: str) -> tuple[str | None, str | None]:
    """Execute code using plain local CPython 3.12 to capture oracle stdout."""
    try:
        proc = subprocess.run(
            [sys.executable, "-c", code],
            capture_output=True,
            text=True,
            timeout=3.0,
        )
        return proc.stdout, proc.stderr
    except Exception as e:
        return None, str(e)


def main() -> None:
    print(f"Generating {len(PROGRAMS)} corpus test cases in {CORPUS_DIR}...")
    summary: list[dict] = []

    for item in PROGRAMS:
        fname = item["filename"]
        py_path = CORPUS_DIR / f"{fname}.py"
        json_path = CORPUS_DIR / f"{fname}.json"
        code = item["code"]
        expected_outcome = item["outcome"]

        # Write Python file
        # Use binary write if CRLF explicitly requested, else normal text write
        if fname == "h06_crlf_endings":
            py_path.write_bytes(code.encode("utf-8"))
        else:
            py_path.write_text(code, encoding="utf-8")

        # Determine expected stdout via CPython oracle if expected_outcome is 'ok'
        oracle_stdout: str | None = None
        oracle_stderr: str | None = None
        if expected_outcome == "ok":
            oracle_stdout, oracle_stderr = run_cpython_oracle(code)

        metadata = {
            "name": item["name"],
            "filename": fname,
            "category": item["category"],
            "expected_outcome": expected_outcome,
            "expected_stdout": oracle_stdout,
            "assertions": {
                "check_stdout": oracle_stdout is not None,
                "forbidden_imports": expected_outcome == "blocked" and "import" in code,
                "step_limit_truncated": expected_outcome == "truncated",
            },
        }

        json_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
        summary.append({"name": item["name"], "category": item["category"], "outcome": expected_outcome})

    print(f"Successfully generated {len(PROGRAMS)} programs and companion JSON metadata.")


if __name__ == "__main__":
    main()

