# app/memory.py
import json
import os
import uuid

# --- DOCUMENT MEMORY ---
document_store = {}

def save_document_context(text: str) -> str:
    doc_id = str(uuid.uuid4())
    document_store[doc_id] = text
    return doc_id

def get_document_context(doc_id: str) -> str:
    return document_store.get(doc_id, "")

# --- CHAT HISTORY MEMORY ---
HISTORY_FILE = "chat_history_db.json"

def _load_db():
    if not os.path.exists(HISTORY_FILE):
        return {}
    try:
        with open(HISTORY_FILE, "r") as f:
            return json.load(f)
    except:
        return {}

def _save_db(data):
    with open(HISTORY_FILE, "w") as f:
        json.dump(data, f, indent=2)

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