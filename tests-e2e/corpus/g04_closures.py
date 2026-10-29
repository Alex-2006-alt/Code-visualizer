def make_multiplier(factor):
    def multiply(val):
        return val * factor
    return multiply

double = make_multiplier(2)
triple = make_multiplier(3)
print("Double 5:", double(5), "Triple 5:", triple(5))
