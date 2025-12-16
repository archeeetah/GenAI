from firebase_admin import firestore
from app.memory import db

def check_available_documents(user_id: str) -> str:
    """
    Checks the user's 'vault' for already verified documents.
    Use this BEFORE asking the user to upload something.
    
    Args:
        user_id: The user's UID.
        
    Returns:
        String summary of available docs (e.g., "PAN Card, Salary Slip (Nov 2024)").
    """
    try:
        docs_ref = db.collection("users").document(user_id).collection("documents")
        docs = docs_ref.stream()
        
        doc_list = []
        for d in docs:
            data = d.to_dict()
            doc_list.append(f"{data.get('type', 'Unknown Doc')} (Verified: {data.get('verifiedAt', 'Unknown')})")
            
        if not doc_list:
            return "No verified documents found in vault."
            
        return "Available Documents: " + ", ".join(doc_list)
    except Exception as e:
        return f"Error checking docs: {str(e)}"

def save_verified_document(user_id: str, doc_type: str, notes: str = ""):
    """
    Saves a record that a document has been verified. 
    Call this AFTER the Vision/Legal agent has approved an upload.
    
    Args:
        user_id: User UID.
        doc_type: Type of doc (e.g., 'PAN Card', 'Aadhaar', 'Income Proof').
        notes: Any extra info (e.g., 'PAN Number: ABC...').
    """
    try:
        # We use doc_type as ID to prevent duplicates (one PAN per user)
        # Sanitizing ID slightly
        doc_id = doc_type.lower().replace(" ", "_")
        
        doc_ref = db.collection("users").document(user_id).collection("documents").document(doc_id)
        
        doc_ref.set({
            "type": doc_type,
            "notes": notes,
            "verifiedAt": firestore.SERVER_TIMESTAMP,
            "status": "Verified"
        })
        
        return f"Successfully saved verified {doc_type} to user vault."
    except Exception as e:
        return f"Error saving doc: {str(e)}"

document_tools = [check_available_documents, save_verified_document]
