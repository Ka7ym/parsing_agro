class Car:
    def __init__(self, brand, model, fuel):
        self.brand = brand
        self.model = model
        self.fuel = fuel

    def info(self):
        print(f"{self.brand} {self.model} — отын түрі: {self.fuel}")

    def drive(self):
        print(f"{self.brand} {self.model} қозғалып жатыр...")

class Toyota(Car):
    def drive(self):
        print(f"{self.brand} {self.model} қала ішінде баяу және үнемді жүреді.")

class MAN(Car):
    def drive(self):
        print(f"{self.brand} {self.model} ауыр жүкті тасымалдауда.")

class Ferrari(Car):
    def drive(self):
        print(f"{self.brand} {self.model} трассада 300 км/сағ жылдамдықпен зулап барады!")

class Tesla(Car):
    def drive(self):
        print(f"{self.brand} {self.model} үнсіз жүреді және энергияны үнемдейді.")
