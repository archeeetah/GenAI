# app/tools/bank_data.py
import pandas as pd
import os

# Define paths relative to this file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RATES_CSV = os.path.join(BASE_DIR, "../data/bank_rates.csv")
HEALTH_CSV = os.path.join(BASE_DIR, "../data/bank_health.csv")

def query_best_loan_offers(loan_amount: float = 0) -> dict:
    """
    Queries the 'bank_rates.csv' dataset to find banks that fit the user's loan amount.
    Returns detailed comparison data.
    """
    try:
        df = pd.read_csv(RATES_CSV)
        
        # Filter: If loan amount is provided, filter banks that support it
        if loan_amount > 0:
            df = df[(df['Min_Loan_Amount'] <= loan_amount) & (df['Max_Loan_Amount'] >= loan_amount)]
        
        # Sort by Interest Rate (Cheapest first)
        df = df.sort_values(by="Min_Interest_Rate")
        
        # Convert to dictionary format for Gemini
        offers = df.to_dict(orient="records")
        
        return {
            "count": len(offers),
            "filters_applied": f"Loan Amount: {loan_amount if loan_amount else 'Any'}",
            "offers": offers,
            "disclaimer": "Data sourced from 'bank_rates.csv'. Verify with bank branches."
        }
    except Exception as e:
        return {"error": f"Database Query Failed: {str(e)}"}

def check_bank_health(bank_name: str) -> dict:
    """
    Queries 'bank_health.csv' to perform an Audit/Risk check on a specific bank.
    Useful for detailed due diligence.
    """
    try:
        df = pd.read_csv(HEALTH_CSV)
        
        # Fuzzy match bank name (simple string contains)
        bank_data = df[df['Bank_Name'].str.contains(bank_name, case=False, na=False)]
        
        if bank_data.empty:
            return {"status": "Not Found", "message": f"No audit data found for {bank_name}"}
        
        # Get the first match
        record = bank_data.iloc[0].to_dict()
        
        return {
            "bank": record['Bank_Name'],
            "audit_rating": record['Audit_Rating'],
            "npa_level": f"{record['NPA_Percent']}% (Lower is better)",
            "risk_assessment": record['Risk_Status'],
            "solvency": f"{record['Solvency_Ratio']} (Financial Stability Score)",
            "message": f"Audit Result: This bank is marked as {record['Risk_Status']}."
        }
    except Exception as e:
        return {"error": f"Audit Query Failed: {str(e)}"}

# Register both tools
bank_data_tools = [query_best_loan_offers, check_bank_health]