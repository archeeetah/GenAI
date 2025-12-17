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

load_dotenv()

# --- Combine ALL tools into one global list ---
all_tools = banking_tools + investment_tools + eligibility_tools + bank_data_tools + kyc_tools + application_tools

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
        You are the **FinBot Virtual Banking Team**. You are not a single AI, but a coordinated team of specialists working in a real physical bank simulation.

        **YOUR TEAM & ROLES:**

        1.  **EVA (Receptionist)**:
            - **Tone**: Warm, welcoming, professional.
            - **Role**: Greets the user, asks for their name (if unknown), and identifies their need.
            - **Action**: Once the user expresses a specific need (e.g., "I need a loan"), **TRANSFER** them to the relevant officer.
            - **Quote**: "Welcome to FinBot Bank! I'm Eva. How can I help you today?"

        2.  **RAJ (Loan Advisor)**:
            - **Tone**: Analytical, helpful, knowledgeable.
            - **Role**: Discusses loan options, tailored advice, EMI calculations (`calculate_emi`, `calculate_sip`), and financial planning.
            - **Action**: Once the user agrees on a loan amount/type, use `update_application` to create the file, then **TRANSFER** to Verification.
            - **Quote**: "Hello, I'm Raj, your Loan Advisor. Let's look at the best rates for you."

        3.  **SAM (Verification Officer)**:
            - **Tone**: Strict, detail-oriented, formal but polite.
            - **Role**: Collects and validates documents.
            - **Rule**: STRICTLY comments on `DOCUMENT AWARENESS`. If a doc exists in history, acknowledge it. If not, ask for upload.
            - **Action**: When all docs are clear, forward the file to Sanctions.
            - **Quote**: "Hi, I'm Sam from Verification. I need to check your documents before we proceed."

        4.  **MAYA (Sanction Officer)**:
            - **Tone**: Authoritative, decisive, premium.
            - **Role**: Final approval and disbursement.
            - **Action**: Reviews the "Application File", confirms final details, and grants the loan.
            - **Quote**: "Good day, I'm Maya. I'm pleased to tell you your loan is sanctioned."

        **HANDOFF PROTOCOL (CRITICAL):**
        - You MUST simulate the transfer.
        - Example: "I'll connect you to Raj for the details... [Connection Sound]... Hello, Raj here!"
        - NEVER break character. One agent speaks at a time.
        
        **DOCUMENT AWARENESS RULE:**
        - Before asking the user for ANY document (e.g., PAN, Aadhaar), YOU MUST CHECK the "[UPLOADED DOCUMENTS HISTORY]" section.
        - If the document exists, say: "I see I already have your [Document Name] on file."
        - Only ask for documents that are missing.
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
                            if fname in ['calculate_emi', 'get_interest_rates', 'check_loan_eligibility']:
                                return "Raj (Loan Advisor)", "Analyzing finances..."
                            
                            elif fname in ['calculate_sip', 'calculate_fd']:
                                return "Raj (Loan Advisor)", "Projecting returns..."
                            
                            elif fname == 'update_application':
                                return "Eva/Raj", "Processing Application..."

                            elif fname in ['submit_kyc_application', 'verify_pan']:
                                return "Sam (Verification)", "Verifying documents..."
                            
                            elif fname == 'check_bank_health':
                                return "Risk & Audit Agent", "Scanning Solvency & NPA Reports..."
                            
                            elif fname in ['calculate_sip', 'calculate_fd']:
                                return "Investment Advisor Agent", "Projecting Future Returns..."
                            
                            elif fname == 'update_application':
                                return "Application Manager", "Updating your application record..."
                                
        except Exception:
            pass
            
        return "FinBot Team", "Processing..."

    def get_response(self, user_text: str, history: list = None, context_data: dict = None):
        """
        Main chat method.
        Returns: (Response Text, Agent Name, Process Log)
        """
        try:
            # 0. Construct Context String
            context_str = ""
            if context_data:
                profile = context_data.get("profile", {})
                docs = context_data.get("documents", [])
                
                # Format Profile
                if profile:
                    context_str += f"[USER PROFILE]\nName: {profile.get('displayName', 'Unknown')}\nUID: {profile.get('uid')}\nEmail: {profile.get('email')}\n\n"
                
                # Format Documents
                if docs:
                    doc_summaries = []
                    for d in docs:
                        doc_summaries.append(f"- {d.get('name')} (Type: {d.get('mimeType')}, Uploaded: {d.get('uploadedAt')})\n  Preview: {d.get('summary')}")
                    
                    context_str += "[UPLOADED DOCUMENTS HISTORY]\n" + "\n".join(doc_summaries) + "\n\n"
            
            # Combine Context + User Input (Hidden System Context)
            final_input = ""
            if context_str:
                final_input = f"""
                SYSTEM_CONTEXT:
                {context_str}
                
                USER_QUERY:
                {user_text}
                """
            else:
                final_input = user_text

            # Start chat with provided history
            chat = self.model.start_chat(
                history=history if history else [],
                enable_automatic_function_calling=True
            )
            
            # 1. Send Message
            response = chat.send_message(final_input)
            
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