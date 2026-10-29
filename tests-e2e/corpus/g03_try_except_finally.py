logs = []
try:
    logs.append("try start")
    res = 10 / 2
    logs.append(f"res={res}")
except ZeroDivisionError:
    logs.append("caught")
finally:
    logs.append("cleanup")

print("Execution logs:", logs)
