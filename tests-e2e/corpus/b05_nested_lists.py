grid = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]
grid[1][1] = 99
diag_sum = sum(grid[i][i] for i in range(3))
print("Modified grid[1][1]:", grid[1][1])
print("Diagonal sum:", diag_sum)
