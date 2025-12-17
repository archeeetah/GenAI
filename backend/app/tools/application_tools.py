from app.context import get_chat_context
from app.memory import db
from datetime import datetime, timezone
from firebase_admin import firestore

def update_application(title: str, application_type: str, amount: float, status: str = "In Progress") -> dict:
    """
    Creates or updates the Loan Application record for the current session.
    Use this tool IMMEDIATELY when the user expresses intent for a specific loan type or amount.
    
    Args:
        title: A short descriptive title (e.g., "Home Loan Inquiry", "Car Loan Request").
        application_type: The category (e.g., "Home Loan", "Personal Loan", "Education Loan").
        amount: The loan amount requested by the user.
        status: Current status (default "In Progress", can be "submitted", "approved", "rejected").
    """
    user_id, session_id = get_chat_context()
    
    if not user_id or not session_id:
        return {"status": "error", "message": "Context missing. Cannot update application."}

    # Don't create applications for guests if you want to be strict, but for now we allow it implicitly 
    # as long as we have a session_id. However, persisting to a 'guest' user might clutter DB.
    # Assuming valid user_id is passed or 'guest' string.
    
    try:
        # 1. Update/Create Application Document
        doc_ref = db.collection("applications").document(session_id)
        doc_snapshot = doc_ref.get()
        is_new_application = not doc_snapshot.exists

        data = {
            "uid": user_id,
            "applicationId": session_id,
            "title": title,
            "type": application_type,
            "amount": amount,
            "status": status,
            "lastUpdated": datetime.now(timezone.utc).isoformat()
        }

        if is_new_application:
             data["date"] = datetime.now(timezone.utc).isoformat()

        doc_ref.set(data, merge=True)

        # 2. Update User Stats (Only if this is a NEW application)
        if is_new_application:
            user_ref = db.collection("users").document(user_id)
            user_ref.update({
                "loanApplications": firestore.Increment(1)
            })
        
        return {
            "status": "success", 
            "message": f"Application '{title}' {'created' if is_new_application else 'updated'} successfully.",
            "application_id": session_id
        }

    except Exception as e:
        print(f"Error updating application: {e}")
        return {"status": "error", "message": str(e)}

# Export tool list
application_tools = [update_application]
