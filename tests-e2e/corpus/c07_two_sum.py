def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        compl = target - num
        if compl in seen:
            return [seen[compl], i]
        seen[num] = i
    return []

print("Indices:", two_sum([2, 7, 11, 15], 9))
