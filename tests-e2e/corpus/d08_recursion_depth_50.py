def countdown(n):
    if n == 0:
        return "Liftoff!"
    return countdown(n - 1)

print("Result:", countdown(45))
