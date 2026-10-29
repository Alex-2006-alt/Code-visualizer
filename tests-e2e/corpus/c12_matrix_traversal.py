matrix = [
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
