class Engine:
    def __init__(self, horsepower):
        self.hp = horsepower

class Car:
    def __init__(self, model, engine):
        self.model = model
        self.engine = engine

car = Car("Roadster", Engine(500))
print(f"Car: {car.model}, HP: {car.engine.hp}")
