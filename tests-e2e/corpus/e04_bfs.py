import collections
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
