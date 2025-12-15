# app/agent.py
import os
import google.generativeai as genai
from dotenv import load_dotenv

# --- Import Tools ---
from app.tools.loan_math import banking_tools 
from app.tools.investment_math import investment_tools
from app.tools.eligibility import eligibility_tools

load_dotenv()

# Define global tools
all_tools = banking_tools + investment_tools + eligibility_tools

class FinancialAgent:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY missing in .env file")

        genai.configure(api_key=self.api_key)

        self.system_instruction = self.system_instruction = """
        You are FinBot, a Full-Stack Banking Assistant (Sales & Underwriting).

        YOUR ROLES:
        1. SALES AGENT: Calculate EMIs and explaining returns. 
           - Use: 'calculate_loan_emi', 'calculate_sip', 'calculate_fd'
        
        2. APPROVAL AGENT (Underwriter): Check if the user qualifies for a loan.
           - Use: 'check_loan_eligibility'
           - logic: If user asks "Can I get this loan?" or "Am I eligible?", ask for their Salary and current EMIs.
        
        3. LEGAL AGENT: Analyze documents for risk.

        TONE:
        - When Selling: Be helpful and encouraging.
        - When Approving: Be strict, factual, and risk-aware.
        """

        self.model = genai.GenerativeModel(
            model_name='gemini-flash-latest', 
            tools=all_tools,
            system_instruction=self.system_instruction
        )

    def get_response(self, user_text: str):
        try:
            chat = self.model.start_chat(enable_automatic_function_calling=True)
            response = chat.send_message(user_text)
            return response.text
        except Exception as e:
            return f"AI Error: {str(e)}"

    def analyze_document(self, file_bytes: bytes, mime_type: str):
        """
        Sends the RAW file (Image or PDF) to Gemini Vision.
        This supports Scanned PDFs, JPGs, PNGs, and Native PDFs.
        """
        try:
            prompt = """
            ACT AS: Senior Legal Risk Analyst.
            TASK: Audit this uploaded document (which may be an image or scan).
            
            EXTRACT AND ANALYZE:
            1. Identify the Document Type (e.g., Loan Agreement, Bank Statement, Tax Invoice).
            2. OCR & Read specific numbers: Interest Rates, Penalty Percentages, Dates.
            3. FLAG RISKS:
               - Hidden Fees (Processing fees, upfront charges).
               - Variable Interest Rate clauses.
               - Strict Default/Foreclosure conditions.
            
            OUTPUT:
            Return a JSON structure with keys: "doc_type", "risk_level" (Low/Med/High), "summary", "flagged_clauses" (list).
            """

            content = [
                prompt,
                {
                    "mime_type": mime_type,
                    "data": file_bytes
                }
            ]
            
            response = self.model.generate_content(content)
            return response.text
            
        except Exception as e:
            return f"Vision Analysis Error: {str(e)}"