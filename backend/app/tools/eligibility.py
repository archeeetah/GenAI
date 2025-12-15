def check_loan_eligibility(monthly_salary: float, current_emis: float, requested_loan_amount: float, tenure_years: int, rate_of_interest: float) -> dict:
    """
    Acts as an Approval Agent. Checks if a user is eligible based on FOIR (Fixed Obligation to Income Ratio).
    Standard Bank Rule: Total EMIs should not exceed 50% of monthly salary.
    """
    try:
        if monthly_salary <= 0:
            return {"status": "Rejected", "reason": "Invalid salary input."}

        # 1. Calculate the New EMI for the requested loan
        r = rate_of_interest / (12 * 100)
        n = tenure_years * 12
        new_emi = requested_loan_amount * r * ((1 + r)**n) / (((1 + r)**n) - 1)

        # 2. Calculate Total Obligations
        total_monthly_obligation = current_emis + new_emi
        
        # 3. Calculate Ratio (Debt / Income)
        debt_ratio = (total_monthly_obligation / monthly_salary) * 100

        # 4. Decision Logic (Bank Standard: Max 50-60%)
        max_allowed_ratio = 50.0 
        
        if debt_ratio <= max_allowed_ratio:
            return {
                "status": "Approved (In Principle)",
                "max_eligible_emi": round(monthly_salary * 0.5, 2),
                "your_total_emi": round(total_monthly_obligation, 2),
                "debt_ratio": f"{round(debt_ratio, 1)}% (Safe)",
                "message": "You are eligible! Your debt burden is within safe limits."
            }
        else:
            return {
                "status": "Rejected (High Risk)",
                "max_eligible_emi": round(monthly_salary * 0.5, 2),
                "your_total_emi": round(total_monthly_obligation, 2),
                "debt_ratio": f"{round(debt_ratio, 1)}% (Too High)",
                "message": f"Loan risky. Your total EMIs would be {round(debt_ratio, 1)}% of your salary. Banks usually limit this to 50%."
            }
            
    except Exception as e:
        return {"error": str(e)}

# Registry
eligibility_tools = [check_loan_eligibility]