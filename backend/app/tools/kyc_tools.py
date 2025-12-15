# app/tools/kyc_tools.py
import re

def submit_kyc_application(full_name: str, pan_number: str, aadhaar_number: str, mobile: str, dob: str) -> dict:
    """
    Submits a KYC Application.
    Triggers automatically when the user wants to complete verification.
    
    Args:
        full_name: Customer's legal name.
        pan_number: 10-character alphanumeric PAN (e.g., ABCDE1234F).
        aadhaar_number: 12-digit UIDAI number.
        mobile: 10-digit mobile number.
        dob: Date of birth (DD-MM-YYYY).
    """
    # --- VALIDATION LOGIC ---
    errors = []

    # 1. Validate PAN (5 Letters, 4 Digits, 1 Letter)
    pan_pattern = re.compile(r"[A-Z]{5}[0-9]{4}[A-Z]{1}")
    if not pan_pattern.fullmatch(pan_number.upper()):
        errors.append("Invalid PAN format. It should be 5 letters, 4 numbers, 1 letter (e.g., ABCDE1234F).")

    # 2. Validate Aadhaar (12 Digits)
    if not (aadhaar_number.isdigit() and len(aadhaar_number) == 12):
        errors.append("Invalid Aadhaar. It must be exactly 12 digits.")

    # 3. Validate Mobile (10 Digits)
    if not (mobile.isdigit() and len(mobile) == 10):
        errors.append("Invalid Mobile Number. It must be 10 digits.")

    # --- RETURN RESULT ---
    if errors:
        return {
            "status": "Validation Failed",
            "missing_fields": errors,
            "message": "Please correct the errors mentioned."
        }
    
    # If Success
    return {
        "status": "KYC Submitted",
        "application_id": f"KYC-{pan_number[:5]}-{mobile[-4:]}",
        "summary": {
            "Name": full_name,
            "PAN": pan_number.upper(),
            "Aadhaar": f"XXXXXXXX{aadhaar_number[-4:]}",
            "Verification": "Pending Backend Approval"
        },
        "message": "Your KYC application has been received successfully! Our team will verify it shortly."
    }

# Register the tool
kyc_tools = [submit_kyc_application]