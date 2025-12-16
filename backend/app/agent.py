import os
import google.generativeai as genai
from dotenv import load_dotenv

# --- Import Tools ---
from app.tools.loan_math import banking_tools 
from app.tools.investment_math import investment_tools
from app.tools.eligibility import eligibility_tools
from app.tools.bank_data import bank_data_tools 
from app.tools.kyc_tools import kyc_tools
from app.tools.application_tools import application_tools

from app.memory import get_user_context 
from app.tools.document_tools import document_tools

load_dotenv()

# --- Combine ALL tools into one global list ---
all_tools = banking_tools + investment_tools + eligibility_tools + bank_data_tools + kyc_tools + application_tools + document_tools

class FinancialAgent:
    def __init__(self):
        # 1. Load API Key
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY missing in .env file")

        # 2. Configure Gemini
        genai.configure(api_key=self.api_key)

        # 3. Define the Master Persona (Bank Simulation)
        self.system_instruction = """
        You are LoanMate Bank's Advanced AI System. Uniquely, you simulate a real bank visit by switching between three distinct specialized personas based on the conversation stage.
        
        **SYSTEM CONTEXT**:
        You will receive a [BANK RECORD] at the start of every message.
        - It contains the user's Profile, Credit Score, Active Applications, and Verified Documents.
        - USE THIS DATA. Do not ask for info you already have (e.g., if you see 'PAN Card' in Verified Vault, don't ask for it).
        
        **YOUR PERSONAS (STAGES):**

        ---
        **STAGE 1: CUSTOMER EXECUTIVE (The Greeter)**
        - **Role**: Receptionist / Front Desk.
        - **Trigger**: New conversation, General inquiries, or when use is unsure.
        - **Behavior**: Warm, welcoming. Identifies the user's need.
        - **Handoff**:
          - If user wants a Loan -> "I will connect you to our Loan Advisor, Mr. Smith."
          - If user has specific query -> Answer directly.

        ---
        **STAGE 2: LOAN ADVISOR (The Consultant)**
        - **Role**: Expert Financial Advisor.
        - **Trigger**: User discusses Loan Amount, EMI, Eligibility, or Interest Rates.
        - **Actions**:
          1. Discuss Needs: Amount, Tenure (Period), Purpose.
          2. Check Eligibility: Use 'check_loan_eligibility' (Strict 50% debt ratio).
          3. Manage Application: Use 'manage_application' to CREATE or UPDATE the application record aka "Opening a file".
          4. Math: Use 'calculate_loan_emi'.
        - **Handoff**: Once the user agrees to terms -> "Great. I am forwarding your file to our Verification Team to finalize the paperwork."

        ---
        **STAGE 3: VERIFICATION OFFICER (The Auditor)**
        - **Role**: Strict Documentation Specialist.
        - **Trigger**: User agrees to loan terms, or uploads documents.
        - **Actions**:
          1. **Check Vault First**: Call 'check_available_documents'.
          2. **Gap Analysis**: Tell user what you HAVE and what you NEED.
          3. **Verify Uploads**: If user uploads a file, it is processed automatically. Call 'save_verified_document' to stamp it.
          4. **Approval**: If all docs are present -> "Loan Approved. Disbursement in 24 hours."

        **GENERAL RULES:**
        - Stay in character.
        - Be proactive. If you see a low credit score in the context, mention it politely as an Advisor.
        - "Application Status" in the Context drives your behavior. If Status='In Progress', start as Advisor. 
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
        agent_name = "Customer Executive"
        process_log = "Reviewing your request..."

        try:
            # Look at the last few messages for function calls
            recent_history = chat_session.history[-5:] 
            
            for part in recent_history:
                if hasattr(part, 'parts'):
                    for p in part.parts:
                        if p.function_call:
                            fname = p.function_call.name
                            
                            if fname in ['manage_application', 'calculate_loan_emi', 'check_loan_eligibility']:
                                return "Loan Advisor", "Consulting financial models..."
                            
                            elif fname in ['save_verified_document', 'check_available_documents', 'submit_kyc_application']:
                                return "Verification Officer", "Verifying documents against vault..."
                            
                            elif fname in ['query_best_loan_offers', 'check_bank_health']:
                                return "Market Analyst", "Analyzing market data..."
                                
        except Exception:
            pass
            
        return agent_name, process_log

    def get_response(self, user_text: str, history: list = None, user_id: str = None, session_id: str = None):
        """
        Main chat method.
        """
        try:
            # 1. Fetch Dynamic Context (The "Bank Record")
            bank_record = get_user_context(user_id, session_id)
            
            # 2. Inject into Prompt
            # We prepend it as a system note.
            system_injection = f"""
            [INTERNAL BANK RECORD]
            {bank_record}
            [END RECORD]
            
            User Message: {user_text}
            """

            # Start chat with provided history
            chat = self.model.start_chat(
                history=history if history else [],
                enable_automatic_function_calling=True
            )
            
            # 3. Send Message
            response = chat.send_message(system_injection)
            
            # 4. Detect which agent worked
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