class Animal:
    def sound(self):
        return "some sound"

class Dog(Animal):
    def sound(self):
        return "bark"

class Cat(Animal):
    def sound(self):
        return "meow"

d = Dog()
c = Cat()
print("Dog:", d.sound(), "Cat:", c.sound())
