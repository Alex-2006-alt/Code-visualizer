def max_sub_array_of_size_k(k, arr):
    max_sum = 0
    window_sum = sum(arr[:k])
    max_sum = window_sum
    for i in range(len(arr) - k):
        window_sum = window_sum - arr[i] + arr[i + k]
        if window_sum > max_sum:
            max_sum = window_sum
    return max_sum

print("Max sum subarray k=3:", max_sub_array_of_size_k(3, [2, 1, 5, 1, 3, 2]))
