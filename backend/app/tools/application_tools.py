from firebase_admin import firestore
from app.memory import db

def manage_application(user_id: str, session_id: str, action: str, amount: int = 0, title: str = "New Application", status: str = "In Progress"):
    """
    Creates or updates a loan application in the database.
    
    Args:
        user_id: The unique ID of the user.
        session_id: The unique session ID for this chat/application.
        action: 'create' to start a new application, 'update' to modify details.
        amount: The loan amount requested.
        title: A descriptive title (e.g., 'Home Loan', 'Personal Loan').
        status: Status of the application (e.g., 'Draft', 'In Progress', 'Approved').
    """
    try:
        doc_ref = db.collection("applications").document(session_id)
        
        data = {
            "uid": user_id,
            "amount": amount,
            "type": title,
            "status": status,
            "updatedAt": firestore.SERVER_TIMESTAMP
        }
        
        if action.lower() == "create":
            # Check if exists to avoid double-incrementing stats if model retries
            if not doc_ref.get().exists:
                data["date"] = firestore.SERVER_TIMESTAMP
                doc_ref.set(data)
                
                # Increment user stats
                user_ref = db.collection("users").document(user_id)
                if user_ref.get().exists:
                    user_ref.update({
                        "loanApplications": firestore.Increment(1),
                        "activeApplications": firestore.Increment(1),
                        "activeSessionId": session_id  # SAVE SESSION ID FOR RESUMING
                    })
                else:
                    # Fallback for guest or missing profile
                    pass
            else:
                # If exists, treat as update
                doc_ref.update(data)
                
        elif action.lower() == "update":
            doc_ref.set(data, merge=True)
            
        return f"Application {action}d successfully. ID: {session_id}"

    except Exception as e:
        return f"Error managing application: {str(e)}"

application_tools = [manage_application]
