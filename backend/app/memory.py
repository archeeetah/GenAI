# app/memory.py
import json
import os
import uuid

# --- 1. DOCUMENT MEMORY (Existing) ---
document_store = {}

def save_document_context(text: str) -> str:
    doc_id = str(uuid.uuid4())
    document_store[doc_id] = text
    return doc_id

def get_document_context(doc_id: str) -> str:
    return document_store.get(doc_id, "")

# --- 2. CHAT HISTORY MEMORY (New) ---
HISTORY_FILE = "chat_history_db.json"

def _load_db():
    """Helper to load the JSON database."""
    if not os.path.exists(HISTORY_FILE):
        return {}
    try:
        with open(HISTORY_FILE, "r") as f:
            return json.load(f)
    except:
        return {}

def _save_db(data):
    """Helper to save to JSON database."""
    with open(HISTORY_FILE, "w") as f:
        json.dump(data, f, indent=2)

def get_chat_history(user_id: str) -> list:
    """Returns the list of messages for a specific user."""
    db = _load_db()
    return db.get(user_id, [])

def save_chat_entry(user_id: str, role: str, message: str):
    """Appends a new message (User or Model) to the history."""
    db = _load_db()
    
    if user_id not in db:
        db[user_id] = []
        
    # Append new message
    db[user_id].append({
        "role": role, # 'user' or 'model'
        "content": message
    })
    
    _save_db(db)