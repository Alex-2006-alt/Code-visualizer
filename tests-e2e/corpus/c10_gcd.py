def gcd(a, b):
    while b:
        a, b = b, a % b
    return a

print("GCD(48, 18):", gcd(48, 18))
print("GCD(101, 10):", gcd(101, 10))
