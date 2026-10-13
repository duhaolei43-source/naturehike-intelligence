from decimal import Decimal


def pounds_ounces_to_g(pounds: float, ounces: float = 0) -> float:
    if pounds < 0 or not 0 <= ounces < 16:
        raise ValueError("invalid imperial weight")
    return float((Decimal(str(pounds)) * 16 + Decimal(str(ounces))) * Decimal("28.349523125"))


def square_feet_to_m2(value: float) -> float:
    if value <= 0:
        raise ValueError("area must be positive")
    return float(Decimal(str(value)) * Decimal("0.09290304"))
