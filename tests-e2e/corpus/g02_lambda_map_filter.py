nums = [1, 2, 3, 4, 5, 6]
evens = list(filter(lambda x: x % 2 == 0, nums))
squared = list(map(lambda x: x * x, evens))
print("Evens:", evens, "Squared:", squared)
