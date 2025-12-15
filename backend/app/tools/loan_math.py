# app/tools/loan_math.py

def calculate_loan_emi(principal: float, rate_of_interest: float, tenure_years: int) -> dict:
    """Calculates EMI. Params: principal (amount), rate_of_interest (annual %), tenure_years."""
    try:
        if principal <= 0 or rate_of_interest <= 0 or tenure_years <= 0:
            return {"error": "Values must be positive."}
        
        r = rate_of_interest / (12 * 100)
        n = tenure_years * 12
        emi = principal * r * ((1 + r)**n) / (((1 + r)**n) - 1)
        
        return {
            "monthly_emi": round(emi, 2),
            "total_payment": round(emi * n, 2),
            "total_interest": round((emi * n) - principal, 2),
            "currency": "INR"
        }
    except Exception as e:
        return {"error": str(e)}

banking_tools = [calculate_loan_emi]