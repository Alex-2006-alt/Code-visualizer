class User:
    def __init__(self, name, uid):
        self.name = name
        self.uid = uid
    def __repr__(self):
        return f"User({self.name!r}, {self.uid})"

u = User("Grace", 101)
print(repr(u))
