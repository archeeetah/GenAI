# app/main.py
from fastapi import FastAPI, HTTPException, UploadFile, File
from app.models import ChatRequest, ChatResponse
from app.agent import FinancialAgent
from app.memory import save_document_context, get_document_context, get_chat_history, save_chat_entry

app = FastAPI(title="Financial Bot API")

# Initialize Agent
agent = FinancialAgent()

@app.get("/history/{user_id}")

def get_history_endpoint(user_id: str):
    """Endpoint for Frontend to fetch past chats."""
    return {"history": get_chat_history(user_id)}

    
@app.get("/")
def health_check():
    return {"status": "running", "service": "FinBot Backend"}

@app.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    try:
        user_id = request.user_id
        
        # 1. Fetch Past History (for Context)
        raw_history = get_chat_history(user_id)
        
        # Convert to Gemini format: [{'role': 'user', 'parts': ['msg']}]
        gemini_history = []
        for msg in raw_history:
            # Map 'model' role to 'model' (Gemini uses 'model', our DB uses 'model')
            role = "user" if msg["role"] == "user" else "model"
            gemini_history.append({"role": role, "parts": [msg["content"]]})

        # 2. Check for Document Context (Chat with PDF)
        doc_context = ""
        if request.doc_id:
            stored_doc = get_document_context(request.doc_id)
            if stored_doc:
                doc_context = f"\n[DOCUMENT CONTEXT]: {stored_doc}\n"

        # 3. Construct the Message
        # If we have history, Gemini handles context via history list.
        # But we prepend doc_context to the CURRENT message if it exists.
        current_message = doc_context + request.message if doc_context else request.message

        # 4. Call Agent WITH History
        # We modify agent.get_response to accept history
        bot_reply = agent.get_response(current_message, history=gemini_history)
        
        # 5. Save the Conversation to DB
        save_chat_entry(user_id, "user", request.message) # Save original clean message
        save_chat_entry(user_id, "model", bot_reply)
        
        return ChatResponse(response=bot_reply)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-doc")
async def analyze_document(file: UploadFile = File(...)):
    # 1. Validate MIME Types (Now supports Images + PDF)
    allowed_types = ["application/pdf", "image/jpeg", "image/png", "image/webp"]
    
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file type. Allowed: {allowed_types}"
        )

    try:
        # 2. Read Raw Bytes
        file_bytes = await file.read()
        
        # 3. Send to Agent (Vision)
        # We pass bytes and mime_type directly. No pypdf needed.
        analysis_result = agent.analyze_document(file_bytes, file.content_type)
        
        return {
            "filename": file.filename,
            "content_type": file.content_type,
            "analysis": analysis_result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)