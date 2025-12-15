# app/agent.py
import os
import google.generativeai as genai
from dotenv import load_dotenv
from app.tools.loan_math import banking_tools as loan_tools
from app.tools.investment_math import investment_tools

load_dotenv()

all_tools = loan_tools + investment_tools

class FinancialAgent:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        genai.configure(api_key=api_key)
        
        self.model = genai.GenerativeModel(
            model_name='gemini-flash-latest', 
            tools=all_tools,  
            system_instruction="""
                You are FinBot, an expert banking assistant.
                
                YOUR TOOLS:
                1. Loans: Use 'calculate_loan_emi' for EMI queries.
                2. Investments: Use 'calculate_sip' for monthly investment queries.
                3. Fixed Deposits: Use 'calculate_fd' for one-time deposit queries.
                
                RULES:
                - Detect the user's intent carefully (Loan vs Investment).
                - Use the correct tool. Do not guess math.
                - Keep answers concise.
            """
        )

    def get_response(self, user_text: str, chat_history: list = None):
        # Initialize chat (in a real app, you might rebuild history from Firebase here)
        chat = self.model.start_chat(enable_automatic_function_calling=True)
        
        # If you have history from Firebase, you would load it here
        # chat.history = chat_history 

        response = chat.send_message(user_text)
        return response.text