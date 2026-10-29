stack = []
for item in ["first", "second", "third"]:
    stack.append(item)
popped1 = stack.pop()
popped2 = stack.pop()
print("popped1:", popped1, "popped2:", popped2, "remaining:", stack)
