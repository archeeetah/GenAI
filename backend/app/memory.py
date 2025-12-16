# app/memory.py
import firebase_admin
from firebase_admin import credentials, firestore
import os
import json
import uuid

# --- 1. INITIALIZE FIREBASE ---
# We check if the app is already initialized to prevent errors on hot-reload
if not firebase_admin._apps:
    try:
        # Scenario A: On Render (Use Environment Variable)
        firebase_creds_json = os.getenv("FIREBASE_CREDENTIALS")
        
        if firebase_creds_json:
            # Parse the stringified JSON from env var
            cred_dict = json.loads(firebase_creds_json)
            cred = credentials.Certificate(cred_dict)
        else:
            # Scenario B: Local Testing (Use File)
            # Make sure 'firebase_key.json' is in your root folder
            cred = credentials.Certificate("firebase_key.json")

        firebase_admin.initialize_app(cred)
        print("✅ Firebase Initialized Successfully")
    except Exception as e:
        print(f"❌ Firebase Init Failed: {e}")

# Get DB Client
db = firestore.client()

# --- 2. DOCUMENT MEMORY (Still In-Memory for Speed) ---
# Keeping huge PDF text in memory is faster/cheaper than DB writes for temp context
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
    Structure: Collection 'chats' -> Doc '{user_id}_{session_id}' -> Field 'messages'
    """
    if not session_id:
        # If no session ID, we can't easily fetch mixed history in this simple schema.
        # Returning empty to encourage session usage.
        return []

    doc_ref = db.collection("chats").document(f"{user_id}_{session_id}")
    doc = doc_ref.get()

    if doc.exists:
        return doc.to_dict().get("messages", [])
    return []

def save_chat_entry(user_id: str, role: str, message: str, session_id: str):
    """
    Appends a message to the Firestore document array.
    """
    if not session_id:
        return

    doc_ref = db.collection("chats").document(f"{user_id}_{session_id}")
    
    new_message = {
        "role": role,
        "content": message,
        "timestamp": firestore.SERVER_TIMESTAMP
    }

    # Use ArrayUnion to append atomicly
    # If doc doesn't exist, set it with the first message
    if not doc_ref.get().exists:
        doc_ref.set({"messages": [new_message]})
    else:
        doc_ref.update({
            "messages": firestore.ArrayUnion([new_message])
        })