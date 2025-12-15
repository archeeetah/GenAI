import os
import google.generativeai as genai
from dotenv import load_dotenv

# --- Import Tools ---
from app.tools.loan_math import banking_tools 
from app.tools.investment_math import investment_tools
from app.tools.eligibility import eligibility_tools
from app.tools.bank_data import bank_data_tools 
from app.tools.kyc_tools import kyc_tools

load_dotenv()

# --- Combine ALL tools into one global list ---
all_tools = banking_tools + investment_tools + eligibility_tools + bank_data_tools + kyc_tools

class FinancialAgent:
    def __init__(self):
        # 1. Load API Key
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY missing in .env file")

        # 2. Configure Gemini
        genai.configure(api_key=self.api_key)

        # 3. Define the Master Persona (System Instructions)
        self.system_instruction = """
        You are FinBot, an Advanced Banking AI Assistant.

        YOUR AGENT PERSONAS & RESPONSIBILITIES:
        
        1. **KYC OFFICER** (Priority: High):
           - TRIGGER: User says "I want to do KYC" or "Verify my identity".
           - ACTION: Collect Name, PAN, Aadhaar, Mobile, DOB one by one.
           - TOOL: Use 'submit_kyc_application'.
           - SECURITY: Never show full Aadhaar numbers in chat.
        
        2. **MARKET ANALYST**:
           - TRIGGER: User asks "Which bank is best?", "Compare rates", "Is Bank X safe?".
           - ACTION: 
             a. Call 'query_best_loan_offers' for rates.
             b. Call 'check_bank_health' to verify safety/audit ratings.
           - REQUIRED DISCLAIMER: End with "Note: Data is sourced from internal datasets. Verify with legal advisors."

        3. **LOAN & APPROVAL AGENT**:
           - TRIGGER: User asks for EMI or "Can I get this loan?".
           - ACTION: Use 'calculate_loan_emi' for math. Use 'check_loan_eligibility' for risk assessment.
           - BEHAVIOR: Be strict about debt ratios (max 50% income).

        4. **INVESTMENT ADVISOR**:
           - TRIGGER: User asks about SIPs, FDs, or Returns.
           - TOOL: Use 'calculate_sip' or 'calculate_fd'.

        5. **LEGAL AUDITOR**:
           - TRIGGER: User uploads a document.
           - ACTION: Analyze for hidden fees and risks (handled via Vision capability).

        GENERAL RULES:
        - NEVER guess mathematical values. Always use the provided tools.
        - Be professional, concise, and trustworthy.
        """

        # 4. Initialize Model with all tools
        self.model = genai.GenerativeModel(
            model_name='gemini-flash-latest', 
            tools=all_tools,
            system_instruction=self.system_instruction
        )

    def _detect_agent_activity(self, chat_session):
        """
        Inspects the chat history to see which tool was called.
        Returns the 'Agent Name' and a 'Status Message' for the UI.
        """
        agent_name = "General Banking Agent"
        process_log = "Answering from general knowledge..."

        try:
            # Look at the last few messages for function calls
            recent_history = chat_session.history[-5:] 
            
            for part in recent_history:
                if hasattr(part, 'parts'):
                    for p in part.parts:
                        if p.function_call:
                            fname = p.function_call.name
                            
                            # Map Function Name -> Agent Persona
                            if fname == 'submit_kyc_application':
                                return "KYC Verification Agent", "Validating Identity Documents..."
                            
                            elif fname == 'calculate_loan_emi':
                                return "Loan Calculator Agent", "Executing EMI formulas..."
                            
                            elif fname == 'check_loan_eligibility':
                                return "Underwriting Agent", "Checking Salary vs. Debt Ratio..."
                            
                            elif fname == 'query_best_loan_offers':
                                return "Market Research Agent", "Querying Bank Rates Database..."
                            
                            elif fname == 'check_bank_health':
                                return "Risk & Audit Agent", "Scanning Solvency & NPA Reports..."
                            
                            elif fname in ['calculate_sip', 'calculate_fd']:
                                return "Investment Advisor Agent", "Projecting Future Returns..."
                                
        except Exception:
            pass
            
        return agent_name, process_log

    def get_response(self, user_text: str, history: list = None):
        """
        Main chat method.
        Returns: (Response Text, Agent Name, Process Log)
        """
        try:
            # Start chat with provided history
            chat = self.model.start_chat(
                history=history if history else [],
                enable_automatic_function_calling=True
            )
            
            # 1. Send Message
            response = chat.send_message(user_text)
            
            # 2. Detect which agent worked
            agent_name, log = self._detect_agent_activity(chat)
            
            return response.text, agent_name, log
            
        except Exception as e:
            return f"System Error: {str(e)}", "Error Handler", "Failed to process request"

    def analyze_document(self, file_bytes: bytes, mime_type: str):
        """
        Uses Gemini Vision to audit a document for risks.
        """
        try:
            prompt = """
            ACT AS: Senior Legal Risk Analyst.
            TASK: Audit this uploaded document (PDF/Image).
            
            EXTRACT AND ANALYZE:
            1. Document Type (Loan Agreement, Bank Statement, etc).
            2. Critical Numbers: Interest Rates, Penalties, Dates.
            3. RISK ASSESSMENT:
               - Look for "Hidden Fees" or "Processing Charges".
               - Look for "Floating/Variable Interest" clauses.
               - Look for strict "Foreclosure/Default" conditions.
            
            OUTPUT:
            Return a JSON-like text summary with keys: "doc_type", "risk_level" (Low/Med/High), "summary", "flagged_clauses".
            """
            
            content = [prompt, {"mime_type": mime_type, "data": file_bytes}]
            response = self.model.generate_content(content)
            return response.text
        except Exception as e:
            return f"Vision Analysis Error: {str(e)}"

    def extract_content_from_file(self, file_bytes: bytes, mime_type: str) -> str:
        """
        Uses Gemini Vision to OCR/Read a document for Context Chat.
        """
        try:
            prompt = """
            SYSTEM: OCR & DOCUMENT PARSER.
            TASK: Read this document and output its COMPLETE raw text content.
            - Preserve numbers, tables, and legal text exactly.
            - Do not summarize.
            """
            content = [prompt, {"mime_type": mime_type, "data": file_bytes}]
            response = self.model.generate_content(content)
            return response.text
        except Exception as e:
            return f"Error reading document: {str(e)}"