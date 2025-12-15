import os
import google.generativeai as genai
from dotenv import load_dotenv

# --- Import Tools ---
# Ensure these files exist in app/tools/
from app.tools.loan_math import banking_tools 
from app.tools.investment_math import investment_tools

load_dotenv()

# Combine all tools into a single list for the model
all_tools = banking_tools + investment_tools

class FinancialAgent:
    def __init__(self):
        # 1. Load API Key
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY missing in .env file")

        # 2. Configure Gemini
        genai.configure(api_key=self.api_key)

        # 3. Define the Persona (System Instructions)
        self.system_instruction = """
        You are FinBot, an expert Banking & Financial Assistant.

        YOUR CAPABILITIES:
        1. LOAN ADVISOR: Calculate EMIs, explain interest rates. 
           - USE tool 'calculate_loan_emi' for math.
        2. INVESTMENT ADVISOR: Calculate returns on SIPs and FDs.
           - USE tool 'calculate_sip' for monthly investments.
           - USE tool 'calculate_fd' for one-time deposits.
        3. LEGAL ANALYST: You can analyze summary text of documents for risks.

        RULES:
        - NEVER guess mathematical values. Always use the provided tools.
        - If the user's query is vague (e.g., "I want a loan"), ask for details: Amount, Rate, Tenure.
        - Be concise, professional, and trustworthy.
        - ALWAYS end with a disclaimer: "Please consult your bank for the final offer."
        """

        # 4. Initialize Model
        # using 'gemini-flash-latest' for speed and stability
        self.model = genai.GenerativeModel(
            model_name='gemini-flash-latest', 
            tools=all_tools,
            system_instruction=self.system_instruction
        )

    def get_response(self, user_text: str):
        """
        Handles standard chat queries (Loans/Investments).
        """
        try:
            # Start a chat session with automatic function calling
            chat = self.model.start_chat(enable_automatic_function_calling=True)
            response = chat.send_message(user_text)
            return response.text
        except Exception as e:
            return f"AI Error: {str(e)}"

    def analyze_document(self, doc_text: str):
        """
        Specialized method for analyzing Legal/Loan documents.
        """
        try:
            analysis_prompt = f"""
            ACT AS: Senior Legal Risk Analyst.
            
            TASK: Analyze the extracted text from a loan/financial document below.
            
            LOOK FOR:
            1. Hidden Fees or Charges.
            2. Variable/Floating Interest Rate clauses.
            3. Strict Default/Foreclosure conditions.
            4. Pre-payment penalties.

            DOCUMENT TEXT:
            {doc_text[:30000]} 

            OUTPUT:
            Provide a structured summary pointing out 'High Risk', 'Medium Risk', or 'Safe' clauses.
            """
            
            # We generate content directly (no tools needed for text analysis)
            response = self.model.generate_content(analysis_prompt)
            return response.text
        except Exception as e:
            return f"Analysis Error: {str(e)}"