def recursive_sum(arr):
    if not arr:
        return 0
    return arr[0] + recursive_sum(arr[1:])

print("Sum:", recursive_sum([1, 2, 3, 4, 5]))
