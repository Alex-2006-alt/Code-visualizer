root = []
curr = root
for i in range(20):
    curr.append([i])
    curr = curr[-1]
print("Deep nesting depth:", len(root))
