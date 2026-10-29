s1 = {1, 2, 3, 4}
s2 = {3, 4, 5, 6}
s1.add(10)
inter = sorted(list(s1 & s2))
union = sorted(list(s1 | s2))
print("Intersection:", inter)
print("Union:", union)
