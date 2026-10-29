moves = []
def hanoi(n, source, target, auxiliary):
    if n > 0:
        hanoi(n - 1, source, auxiliary, target)
        moves.append(f"{source}->{target}")
        hanoi(n - 1, auxiliary, target, source)

hanoi(3, 'A', 'C', 'B')
print("Moves count:", len(moves))
print("Moves:", moves)
