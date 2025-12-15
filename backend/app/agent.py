# app/agent.py
import os
import google.generativeai as genai
from dotenv import load_dotenv

# --- Import Tools ---
from app.tools.loan_math import banking_tools 
from app.tools.investment_math import investment_tools
from app.tools.eligibility import eligibility_tools
# FIX: Import 'bank_data_tools' (the new name), NOT 'bank_comparison_tools'
from app.tools.bank_data import bank_data_tools 

load_dotenv()

# Combine ALL tools
# FIX: Use 'bank_data_tools' here as well
all_tools = banking_tools + investment_tools + eligibility_tools + bank_data_tools

class FinancialAgent:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY missing in .env file")

        genai.configure(api_key=self.api_key)

        self.system_instruction = """
        You are FinBot, a Data-Driven Banking Analyst.

        YOUR TOOLS:
        1. 'query_best_loan_offers': Queries the CSV database for loan rates.
        2. 'check_bank_health': Queries the Audit database for safety ratings (NPA, Solvency).
        3. 'calculate_loan_emi', 'calculate_sip', 'check_loan_eligibility', 'analyze_document' (Standard tools).

        BEHAVIOR & LOGIC:
        - **Detail Oriented:** When a user asks for a bank recommendation, DO NOT just give the rate.
          1. First, call 'query_best_loan_offers' to get the rates.
          2. Then, for the top recommendation, call 'check_bank_health' to verify it is safe.
        - **Trust but Verify:** If a bank has "High Risk" in the audit data, WARN the user even if the rate is low.
        - **Disclaimer:** "Data sourced from internal datasets/Kaggle. Please verify with legal advisors."
        """

        self.model = genai.GenerativeModel(
            model_name='gemini-flash-latest', 
            tools=all_tools,
            system_instruction=self.system_instruction
        )

    def get_response(self, user_text: str, history: list = None):
        """
        Handles chat queries with history context.
        """
        try:
            chat = self.model.start_chat(
                history=history if history else [],
                enable_automatic_function_calling=True
            )
            response = chat.send_message(user_text)
            return response.text
        except Exception as e:
            return f"AI Error: {str(e)}"

    # app/agent.py
import os
import google.generativeai as genai
from dotenv import load_dotenv

# --- Import Tools ---
from app.tools.loan_math import banking_tools 
from app.tools.investment_math import investment_tools
from app.tools.eligibility import eligibility_tools
from app.tools.bank_data import bank_data_tools 

load_dotenv()

all_tools = banking_tools + investment_tools + eligibility_tools + bank_data_tools

class FinancialAgent:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY missing in .env file")

        genai.configure(api_key=self.api_key)

        self.system_instruction = """
        You are FinBot, a Data-Driven Banking Analyst.
        (Keep your existing system instructions here...)
        """

        self.model = genai.GenerativeModel(
            model_name='gemini-flash-latest', 
            tools=all_tools,
            system_instruction=self.system_instruction
        )

    def _detect_agent_activity(self, chat_session):
        """
        Inspects the last few messages in history to detect which tool was used.
        """
        # Default State
        used_agent = "General Banking Agent"
        process_log = "Answering from general knowledge base..."

        # Look backwards in history for Function Calls
        # History structure: User -> Model(FunctionCall) -> User(FunctionResponse) -> Model(Final Answer)
        try:
            # We look at the last 3-4 messages to find a function call
            recent_history = chat_session.history[-5:] 
            
            for part in recent_history:
                # Check if this part has a function call
                if hasattr(part, 'parts'):
                    for p in part.parts:
                        if p.function_call:
                            fname = p.function_call.name
                            
                            # Map Function Name -> Agent Name
                            if fname == 'calculate_loan_emi':
                                used_agent = "Loan Calculator Agent"
                                process_log = "Executing mathematical formulas for EMI..."
                            elif fname == 'check_loan_eligibility':
                                used_agent = "Underwriting & Approval Agent"
                                process_log = "Checking Debt-to-Income ratios & Salary logic..."
                            elif fname == 'query_best_loan_offers':
                                used_agent = "Market Research Agent"
                                process_log = "Querying 'bank_rates.csv' database..."
                            elif fname == 'check_bank_health':
                                used_agent = "Risk & Audit Agent"
                                process_log = "Scanning 'bank_health.csv' for NPA & Solvency data..."
                            elif fname in ['calculate_sip', 'calculate_fd']:
                                used_agent = "Investment Advisor Agent"
                                process_log = "Projecting future returns..."
                            
                            return used_agent, process_log
        except Exception:
            pass
            
        return used_agent, process_log

    def get_response(self, user_text: str, history: list = None):
        """
        Handles chat queries and returns (Response Text, Agent Name, Process Log).
        """
        try:
            chat = self.model.start_chat(
                history=history if history else [],
                enable_automatic_function_calling=True
            )
            
            # 1. Get Response
            response = chat.send_message(user_text)
            
            # 2. Spy on the process
            agent_name, log = self._detect_agent_activity(chat)
            
            # Return tuple: (Text, Agent, Log)
            return response.text, agent_name, log
            
        except Exception as e:
            return f"AI Error: {str(e)}", "System Error", "Failed to process"

    def analyze_document(self, file_bytes: bytes, mime_type: str):
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
        try:
            prompt = "SYSTEM: OCR & DOCUMENT PARSER. Output COMPLETE raw text content."
            content = [prompt, {"mime_type": mime_type, "data": file_bytes}]
            response = self.model.generate_content(content)
            return response.text
        except Exception as e:
            return f"Error reading document: {str(e)}"