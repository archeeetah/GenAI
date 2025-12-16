# app/memory.py
import pickle
import os
import uuid

# --- DOCUMENT MEMORY (In-Memory) ---
document_store = {}

def save_document_context(text: str) -> str:
    doc_id = str(uuid.uuid4())
    document_store[doc_id] = text
    return doc_id

def get_document_context(doc_id: str) -> str:
    return document_store.get(doc_id, "")

# --- CHAT HISTORY MEMORY (Using Pickle) ---
HISTORY_FILE = "chat_history_db.pkl"  # Changed extension to .pkl

def _load_db():
    """Loads chat history from a binary Pickle file."""
    if not os.path.exists(HISTORY_FILE):
        return {}
    try:
        with open(HISTORY_FILE, "rb") as f:  # Read Binary ('rb')
            return pickle.load(f)
    except (EOFError, pickle.UnpicklingError):
        # Handle empty or corrupted files by returning a fresh dict
        return {}

def _save_db(data):
    """Saves chat history to a binary Pickle file."""
    with open(HISTORY_FILE, "wb") as f:  # Write Binary ('wb')
        pickle.dump(data, f)

def get_chat_history(user_id: str, session_id: str = None) -> list:
    """
    Returns history. Filters by session_id if provided.
    """
    db = _load_db()
    user_history = db.get(user_id, [])
    
    if session_id:
        # Filter for specific session
        return [msg for msg in user_history if msg.get("session_id") == session_id]
    
    return user_history

def save_chat_entry(user_id: str, role: str, message: str, session_id: str):
    """
    Saves message with Session ID.
    """
    db = _load_db()
    
    if user_id not in db:
        db[user_id] = []
        
    db[user_id].append({
        "role": role,
        "content": message,
        "session_id": session_id
    })
    
    _save_db(db)