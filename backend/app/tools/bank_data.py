# app/tools/bank_data.py

def get_home_loan_offers() -> dict:
    """
    Returns a comparison list of current Home Loan offers from major Indian banks.
    Data includes Interest Rates, Processing Fees, and Special Features.
    """
    # NOTE: In a real production app, this data would come from a live database or API.
    # For now, we use a static knowledge base of current approximate market rates.
    
    offers = [
        {
            "bank": "HDFC Bank",
            "interest_rate": "8.75% - 9.40%",
            "processing_fee": "0.5% of loan amount (Max ₹3000)",
            "highlights": "Digital application process, special rates for women borrowers.",
            "best_for": "Quick processing and digital convenience."
        },
        {
            "bank": "SBI (State Bank of India)",
            "interest_rate": "8.50% - 9.15%",
            "processing_fee": "Nil to Low (Often waived during festivals)",
            "highlights": "Lowest rates for high CIBIL scores, no hidden charges.",
            "best_for": "Lowest interest rates and government trust."
        },
        {
            "bank": "ICICI Bank",
            "interest_rate": "8.75% - 9.60%",
            "processing_fee": "0.50% - 1.00%",
            "highlights": "Pre-approved offers for existing customers, 30-year tenure options.",
            "best_for": "Existing ICICI account holders."
        },
        {
            "bank": "Axis Bank",
            "interest_rate": "8.75% - 9.30%",
            "processing_fee": "₹10,000 + GST",
            "highlights": "Variable rate options, good service for self-employed individuals.",
            "best_for": "Self-employed applicants."
        },
        {
            "bank": "Kotak Mahindra Bank",
            "interest_rate": "8.70% onwards",
            "processing_fee": "0.5% - 1.0%",
            "highlights": "Competitive rates, convenient online balance transfer.",
            "best_for": "Balance transfer facilities."
        }
    ]
    
    return {
        "market_analysis": "Current home loan rates range between 8.50% and 9.60%. Rates depend heavily on CIBIL score.",
        "top_offers": offers,
        "recommendation_logic": "Choose SBI for lowest rates if you have time for paperwork. Choose HDFC/ICICI for faster processing.",
        "mandatory_disclaimer": "⚠️ DISCLAIMER: The above data is scraped/external API based. Please verify latest rates directly with the banks and consult your legal advisor before proceeding."
    }

# Register the tool
bank_comparison_tools = [get_home_loan_offers]