# app/memory.py
import firebase_admin
from firebase_admin import credentials, firestore, storage
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
        firebase_admin.initialize_app(cred, {
            'storageBucket': 'genai-d1e91.firebasestorage.app' # Standard format: project-id.appspot.com usually, but let's check or assume default.
                                                               # Actually, for default bucket, we can just use storage.bucket() without args if config is right. 
                                                               # But explicit config is safer if env var missing.
                                                               # Let's try to get it from cred or assume standard.
            # Using 'genai-d1e91.appspot.com' (standard) or similar. 
            # Safest is to just init app and get bucket later.
        })
        return firestore.client()

    except Exception as e:
        raise ValueError(f"Firebase Initialization Error: {str(e)}")

# Initialize DB Client immediately
# This will crash intentionally if creds are missing (so you know to fix it)
db = initialize_firebase()


# --- 2. DOCUMENT MEMORY (Firestore + Storage) ---

def save_user_document(user_id: str, doc_name: str, file_bytes: bytes, mime_type: str, extracted_text: str) -> str:
    """
    1. Uploads file to Firebase Storage (users/{uid}/uploads/{filename}).
    2. Saves metadata & text to Firestore (users/{uid}/documents/{doc_id}).
    """
    doc_id = str(uuid.uuid4())
    
    # A. Upload to Storage
    try:
        bucket = storage.bucket(name="genai-d1e91.firebasestorage.app") # Hardcoded for now based on project ID
        blob = bucket.blob(f"users/{user_id}/uploads/{doc_name}")
        blob.upload_from_string(file_bytes, content_type=mime_type)
        storage_path = blob.name
    except Exception as e:
        print(f"Storage Upload Error: {e}")
        storage_path = "upload_failed"

    # B. Save metadata to Firestore
    try:
        user_doc_ref = db.collection("users").document(user_id)
        # Ensure user doc exists
        if not user_doc_ref.get().exists:
             user_doc_ref.set({"uid": user_id}, merge=True)

        doc_ref = user_doc_ref.collection("documents").document(doc_id)
        
        doc_data = {
            "id": doc_id,
            "name": doc_name,
            "storagePath": storage_path,
            "mimeType": mime_type,
            "uploadedAt": datetime.now(timezone.utc).isoformat(),
            "extractedText": extracted_text, # Save text for RAG/Context
            "summary": extracted_text[:200] + "..." # Quick preview
        }
        
        doc_ref.set(doc_data)
        return doc_id
    except Exception as e:
        print(f"Firestore Save Error: {e}")
        return ""

def get_user_documents(user_id: str) -> list:
    """
    Fetches all document summaries for a user to inject into context.
    """
    try:
        docs_ref = db.collection("users").document(user_id).collection("documents")
        docs = docs_ref.stream()
        return [d.to_dict() for d in docs]
    except Exception as e:
        print(f"Error getting docs: {e}")
        return []

def get_user_profile(user_id: str) -> dict:
    """
    Fetches user profile data.
    """
    try:
        doc = db.collection("users").document(user_id).get()
        if doc.exists:
            return doc.to_dict()
        return {}
    except Exception as e:
        return {}

def get_document_context(doc_id: str) -> str:
    # Legacy/Fallback if needed, or we can look it up in a global way if ID is unique
    # For now, let's just return empty as we are moving to user-centric
    return ""


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