# app/memory.py
import firebase_admin
from firebase_admin import credentials, firestore
import os
import json
import uuid
from datetime import datetime, timezone

# --- 1. INITIALIZE FIREBASE (Robust Setup) ---
def initialize_firebase():
    """
    Initializes Firebase Admin SDK.
    Checks if an app is already initialized to prevent hot-reload errors.
    """
    try:
        # Check if already initialized
        if firebase_admin._apps:
            return firestore.client()

        # A. Try Loading from Environment Variable (Render/Production)
        firebase_creds_json = os.getenv("FIREBASE_CREDENTIALS")
        
        if firebase_creds_json:
            print("🔥 Loading Firebase from Environment Variable...")
            cred_dict = json.loads(firebase_creds_json)
            cred = credentials.Certificate(cred_dict)
        
        # B. Try Loading from Local File (Local Development)
        elif os.path.exists("firebase_key.json"):
            print("🔥 Loading Firebase from local file 'firebase_key.json'...")
            cred = credentials.Certificate("firebase_key.json")
        
        else:
            # C. No Credentials Found - STOP HERE
            raise ValueError(
                "CRITICAL: No Firebase credentials found! \n"
                "1. For Local: Put 'firebase_key.json' in the root folder. \n"
                "2. For Render: Set 'FIREBASE_CREDENTIALS' env var with the JSON content."
            )

        # Initialize the App
        firebase_admin.initialize_app(cred)
        return firestore.client()

    except Exception as e:
        raise ValueError(f"Firebase Initialization Error: {str(e)}")

# Initialize DB Client immediately
# This will crash intentionally if creds are missing (so you know to fix it)
db = initialize_firebase()


# --- 2. DOCUMENT MEMORY (In-Memory) ---
document_store = {}

def save_document_context(text: str) -> str:
    doc_id = str(uuid.uuid4())
    document_store[doc_id] = text
    return doc_id

def get_document_context(doc_id: str) -> str:
    return document_store.get(doc_id, "")


# --- 3. CHAT HISTORY (FIRESTORE) ---
def get_chat_history(user_id: str, session_id: str = None) -> list:
    """
    Fetches chat history from Firestore.
    """
    if not session_id:
        return []

    try:
        doc_ref = db.collection("chats").document(f"{user_id}_{session_id}")
        doc = doc_ref.get()
        if doc.exists:
            return doc.to_dict().get("messages", [])
        return []
    except Exception as e:
        print(f"Error fetching history: {e}")
        return []

def save_chat_entry(user_id: str, role: str, message: str, session_id: str):
    """
    Appends a message to the Firestore document array.
    """
    if not session_id:
        return

    try:
        doc_ref = db.collection("chats").document(f"{user_id}_{session_id}")
        
        new_message = {
            "role": role,
            "content": message,
            "timestamp": datetime.now(timezone.utc)
        }

        if not doc_ref.get().exists:
            doc_ref.set({"messages": [new_message]})
        else:
            doc_ref.update({
                "messages": firestore.ArrayUnion([new_message])
            })
    except Exception as e:
        print(f"Error saving chat: {e}")

# --- 4. CONTEXT AGGREGATION (Bank Record) ---
def get_user_context(user_id: str, session_id: str = None) -> str:
    """
    Fetches a holistic view of the user's relationship with the bank.
    Includes: Profile Data, Active Application Status, and Verified Documents.
    """
    if not user_id:
        return "User: Guest (No Records)"

    context_str = f"USER ID: {user_id}\n"

    try:
        # A. Fetch Profile
        user_doc = db.collection("users").document(user_id).get()
        if user_doc.exists:
            u_data = user_doc.to_dict()
            context_str += f"PROFILE: Name={u_data.get('displayName', 'Unknown')}, " \
                           f"CreditScore={u_data.get('creditScore', 'N/A')}, " \
                           f"ActiveLoans={u_data.get('activeApplications', 0)}\n"
        else:
            context_str += "PROFILE: New Customer (No Profile)\n"

        # B. Fetch Active Application (if session exists)
        if session_id:
            app_doc = db.collection("applications").document(session_id).get()
            if app_doc.exists:
                a_data = app_doc.to_dict()
                context_str += f"CURRENT APPLICATION: Status='{a_data.get('status')}', " \
                               f"Type='{a_data.get('type')}', Amount={a_data.get('amount')}\n"
            else:
                context_str += "CURRENT APPLICATION: None (Conversation just started)\n"

        # C. Fetch Verified Docs
        docs = db.collection("users").document(user_id).collection("documents").stream()
        doc_names = [d.to_dict().get('type', 'Doc') for d in docs]
        if doc_names:
            context_str += f"VERIFIED VAULT: {', '.join(doc_names)}\n"
        else:
            context_str += "VERIFIED VAULT: Empty\n"

        # D. Fetch Loan History (Approved/Closed)
        loan_history = db.collection("users").document(user_id).collection("loans").order_by("date", direction=firestore.Query.DESCENDING).limit(5).stream()
        loans_str = []
        for l in loan_history:
            d = l.to_dict()
            loans_str.append(f"{d.get('type','Loan')} ({d.get('amount')}) - Status: {d.get('status')}")
        
        if loans_str:
            context_str += f"LOAN HISTORY: {'; '.join(loans_str)}\n"
            
        # E. Fetch Payment History
        pay_history = db.collection("users").document(user_id).collection("payments").order_by("date", direction=firestore.Query.DESCENDING).limit(3).stream()
        pay_str = []
        for p in pay_history:
            d = p.to_dict()
            pay_str.append(f"Paid {d.get('amount')} on {d.get('date').strftime('%Y-%m-%d') if d.get('date') else 'Unknown'}")
            
        if pay_str:
            context_str += f"RECENT PAYMENTS: {'; '.join(pay_str)}\n"
        else:
            context_str += "RECENT PAYMENTS: None recorded.\n"

    except Exception as e:
        context_str += f"Error fetching records: {str(e)}"
    
    return context_str