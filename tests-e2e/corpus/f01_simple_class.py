class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    def distance_sq(self):
        return self.x * self.x + self.y * self.y

p = Point(3, 4)
print("Point dist^2:", p.distance_sq())
