d = {"a": 1, "b": 2}
d["c"] = 3
d["a"] = 10
del d["b"]
keys = sorted(list(d.keys()))
print("dict:", d, "keys:", keys)
