def build_prefix_sums(arr):
    prefix = [0] * (len(arr) + 1)
    for i in range(len(arr)):
        prefix[i + 1] = prefix[i] + arr[i]
    return prefix

p = build_prefix_sums([1, 2, 3, 4, 5])
# Range sum from index 1 to 3 inclusive (2 + 3 + 4 = 9)
range_sum = p[4] - p[1]
print("Prefix:", p, "RangeSum(1, 3):", range_sum)
