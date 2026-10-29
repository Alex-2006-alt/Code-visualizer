def permute(s):
    if len(s) <= 1:
        return [s]
    perms = []
    for i, c in enumerate(s):
        for p in permute(s[:i] + s[i+1:]):
            perms.append(c + p)
    return perms

print("Permutations of 'abc':", sorted(permute("abc")))
