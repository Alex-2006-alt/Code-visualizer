numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
combined = sum(x * 2 for x in numbers if x % 2 == 0) + sum(x * 3 for x in numbers if x % 3 == 0)
print("Combined long calc:", combined)
