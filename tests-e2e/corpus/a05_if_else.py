val = 42
result = ""
if val < 0:
    result = "negative"
elif val == 0:
    result = "zero"
elif val % 2 == 0:
    result = "positive even"
else:
    result = "positive odd"
print("Result:", result)
