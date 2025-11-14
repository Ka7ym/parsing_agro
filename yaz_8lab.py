import inspect

class BankAccount:
    def __init__(self, owner, balance=0.0):
        self.owner = owner
        self.balance = float(balance)

    def __add__(self, amount):
        self.balance += amount
        return self

    def __sub__(self, amount):
        if self.balance >= amount:
            self.balance -= amount
        else:
            print(f"{self.owner}: жеткілікті қаражат жоқ!")
        return self

    def __call__(self, percent):
        if percent < 0:
            print(f"{self.owner}: теріс пайыз енгізілмейді!")
            return
        profit = round(self.balance * percent / 100, 2)
        self.balance = round(self.balance + profit, 2)
        print(f"{self.owner}: {percent}% үстеме есептелді (+{profit:.2f}₸)")
        return self

    def __str__(self):
        return f"{self.owner} — шоттағы қалдық: {self.balance:.2f}₸"

    def empty_function(self):
        pass


def auto_ignore_useless_methods(cls):
    for name, method in inspect.getmembers(cls, inspect.isfunction):
        src = inspect.getsource(method).strip()
        if "pass" in src and len(src.splitlines()) <= 2:
            print(f"'{name}' функциясы анықталды, бірақ жұмыс істемейді — еленбейді.")
            setattr(cls, name, lambda self: print(f"'{name}' функциясы еленбейді."))
    print("Бос функциялар еленді, бағдарлама жалғасады.\n")


class BankAccountChecked(BankAccount):
    def __init__(self, owner, balance=0.0):
        auto_ignore_useless_methods(BankAccount)
        super().__init__(owner, balance)


def main():
    print("=== Банк жүйесіндегі операторлардың шамадан тыс жүктелуі ===\n")

    acc1 = BankAccountChecked("Айша", 50000)
    acc2 = BankAccountChecked("Тимур", 20000)

    acc1 + 10000
    acc2 - 5000

    acc1(5)
    acc2(3.5)

    print(acc1)
    print(acc2)

    acc1.empty_function()


if __name__ == "__main__":
    main()
