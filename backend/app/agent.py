# app/agent.py
import os
import google.generativeai as genai
from dotenv import load_dotenv

# --- Import Tools ---
from app.tools.loan_math import banking_tools 
from app.tools.investment_math import investment_tools
from app.tools.eligibility import eligibility_tools
from app.tools.bank_data import bank_comparison_tools  # <--- NEW IMPORT

load_dotenv()

# Combine ALL tools
all_tools = banking_tools + investment_tools + eligibility_tools + bank_comparison_tools

class FinancialAgent:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY missing in .env file")

        genai.configure(api_key=self.api_key)

        self.system_instruction = """
        You are FinBot, a Comprehensive Banking Assistant.

        YOUR CAPABILITIES & TOOLS:
        1. LOAN CALCULATOR: Use 'calculate_loan_emi' for math.
        2. APPROVAL AGENT: Use 'check_loan_eligibility' for risk checks.
        3. MARKET ANALYST: Use 'get_home_loan_offers' when asked "Which bank is best?" or "Compare rates".
        4. INVESTMENT ADVISOR: Use 'calculate_sip' / 'calculate_fd'.
        5. LEGAL ANALYST: Analyze uploaded documents (PDF/Images).

        BEHAVIOR GUIDELINES:
        - When asked for "Best Bank": ALWAYS call the 'get_home_loan_offers' tool. Do not hallucinate rates.
        - Present the comparison in a neat Markdown table.
        - Give reasoning based on the 'best_for' field in the data (e.g., "If you want speed, go for X. If you want low rates, go for Y").
        "**Note:** The above data is scraped and external API based. Please do check the banks and your legal advisor for the same."
        - Always remind the user that rates depend on their CIBIL score.
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
        # (Keep the existing Vision code here exactly as it was)
        try:
            prompt = """
            ACT AS: Senior Legal Risk Analyst.
            TASK: Audit this uploaded document.
            EXTRACT AND ANALYZE:
            1. Document Type.
            2. Key Numbers (Rates, Penalties).
            3. FLAG RISKS (Hidden fees, variable rates).
            OUTPUT: JSON structure with keys: "doc_type", "risk_level", "summary", "flagged_clauses".
            """
            content = [prompt, {"mime_type": mime_type, "data": file_bytes}]
            response = self.model.generate_content(content)
            return response.text
        except Exception as e:
            return f"Vision Analysis Error: {str(e)}"

    def extract_content_from_file(self, file_bytes: bytes, mime_type: str) -> str:
        # (Keep existing OCR code)
        try:
            prompt = "SYSTEM: OCR & DOCUMENT PARSER. Output COMPLETE raw text content."
            content = [prompt, {"mime_type": mime_type, "data": file_bytes}]
            response = self.model.generate_content(content)
            return response.text
        except Exception as e:
            return f"Error reading document: {str(e)}"