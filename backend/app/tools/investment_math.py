# app/tools/investment_math.py

def calculate_sip(monthly_investment: float, rate_of_interest: float, years: int) -> dict:
    """
    Calculates the future value of a SIP (Systematic Investment Plan).
    """
    try:
        if monthly_investment <= 0 or rate_of_interest <= 0 or years <= 0:
            return {"error": "Values must be positive."}

        # Monthly rate (i) and Total months (n)
        i = rate_of_interest / (12 * 100)
        n = years * 12

        # SIP Formula: FV = P * [ (1+i)^n - 1 ] * (1+i) / i
        future_value = monthly_investment * ((((1 + i) ** n) - 1) * (1 + i)) / i
        total_invested = monthly_investment * n
        wealth_gained = future_value - total_invested

        return {
            "invested_amount": round(total_invested, 2),
            "wealth_gained": round(wealth_gained, 2),
            "total_maturity_value": round(future_value, 2),
            "currency": "INR"
        }
    except Exception as e:
        return {"error": str(e)}

def calculate_fd(principal: float, rate_of_interest: float, years: int) -> dict:
    """
    Calculates the maturity value of a Fixed Deposit (FD) with annual compounding.
    """
    try:
        # Compound Interest Formula: A = P(1 + r/100)^t
        amount = principal * ((1 + (rate_of_interest / 100)) ** years)
        interest_earned = amount - principal

        return {
            "principal": principal,
            "interest_earned": round(interest_earned, 2),
            "maturity_value": round(amount, 2),
            "currency": "INR"
        }
    except Exception as e:
        return {"error": str(e)}

# Registry list
investment_tools = [calculate_sip, calculate_fd]