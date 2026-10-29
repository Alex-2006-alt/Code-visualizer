def append_to(element, target=[]):
    target.append(element)
    return target

r1 = append_to(1)
r2 = append_to(2)
print("r1:", r1, "r2:", r2, "same list:", r1 is r2)
