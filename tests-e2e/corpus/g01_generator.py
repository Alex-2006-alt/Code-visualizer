def count_up(n):
    for i in range(n):
        yield i * 2

gen = count_up(4)
items = list(gen)
print("Generator yield:", items)
