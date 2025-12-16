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

        # Atomic update (ArrayUnion)
        if not doc_ref.get().exists:
            doc_ref.set({"messages": [new_message]})
        else:
            doc_ref.update({
                "messages": firestore.ArrayUnion([new_message])
            })
    except Exception as e:
        print(f"Error saving chat: {e}")