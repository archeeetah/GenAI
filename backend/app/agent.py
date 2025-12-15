# app/agent.py
import os
import google.generativeai as genai
from dotenv import load_dotenv
from app.tools.loan_math import banking_tools

load_dotenv()

class FinancialAgent:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY missing in .env")
            
        genai.configure(api_key=api_key)
        
        self.model = genai.GenerativeModel(
            model_name='gemini-1.5-flash',
            tools=banking_tools,
            system_instruction="""
                You are FinBot, a helpful banking assistant.
                - USE 'calculate_loan_emi' for ANY math queries regarding loans.
                - Do not hallucinate numbers.
                - Keep answers concise and strictly financial.
                - End with a disclaimer: "Consult your bank for final details."
            """
        )

    def get_response(self, user_text: str, chat_history: list = None):
        # Initialize chat (in a real app, you might rebuild history from Firebase here)
        chat = self.model.start_chat(enable_automatic_function_calling=True)
        
        # If you have history from Firebase, you would load it here
        # chat.history = chat_history 

        response = chat.send_message(user_text)
        return response.text