#main.py
from car_module import Toyota, MAN, Ferrari, Tesla

class Garage:
    def __init__(self):
        self.cars = []

    def add_car(self, car):
        self.cars.append(car)
        print(f"{car.brand} {car.model} гаражға қосылды.")

    def show_all(self):
        print("\n=== Гараждағы көліктер тізімі ===")
        for i, car in enumerate(self.cars, 1):
            print(f"{i}. {car.brand} {car.model} ({car.fuel})")

    def test_drive_all(self):
        print("\n=== Барлық көліктерді сынау ===")
        for car in self.cars:
            car.drive()


def main():
    print("=== Зертханалық жұмыс №7: Модульдер және Полиморфизм ===\n")
    print("1. Toyota\n2. MAN\n3. Ferrari\n4. Tesla\n5. Барлығын көру")

    choice = input("Нөмірін таңдаңыз (1-5): ")

    garage = Garage()
    car1 = Toyota("Toyota", "Camry", "Бензин")
    car2 = MAN("MAN", "TGS", "Дизель")
    car3 = Ferrari("Ferrari", "488", "Бензин")
    car4 = Tesla("Tesla", "Model S", "Электр")

    if choice == "1":
        garage.add_car(car1)
    elif choice == "2":
        garage.add_car(car2)
    elif choice == "3":
        garage.add_car(car3)
    elif choice == "4":
        garage.add_car(car4)
    elif choice == "5":
        garage.add_car(car1)
        garage.add_car(car2)
        garage.add_car(car3)
        garage.add_car(car4)
    else:
        print("Қате таңдау!")
        return

    garage.show_all()
    garage.test_drive_all()


if __name__ == "__main__":
    main()
