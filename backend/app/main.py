# app/main.py
from fastapi import FastAPI, HTTPException, UploadFile, File
from app.models import ChatRequest, ChatResponse
from app.agent import FinancialAgent
from app.memory import save_document_context, get_document_context, get_chat_history, save_chat_entry
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="FinBot Backend")
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the AI Agent
agent = FinancialAgent()

@app.get("/")
def health_check():
    return {"status": "running", "service": "FinBot API"}

@app.get("/history/{user_id}")
def get_history_endpoint(user_id: str, session_id: str = None):
    """
    Fetch history for a user, optionally filtered by session_id.
    """
    return {"history": get_chat_history(user_id, session_id)}

@app.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    try:
        # 1. Fetch Context (Current Session History)
        raw_history = get_chat_history(request.user_id, request.session_id)
        
        # Convert to Gemini format
        gemini_history = []
        for msg in raw_history:
            role = "user" if msg["role"] == "user" else "model"
            gemini_history.append({"role": role, "parts": [msg["content"]]})

        # 2. Check for Document Context
        doc_context = ""
        if request.doc_id:
            stored_doc = get_document_context(request.doc_id)
            if stored_doc:
                doc_context = f"\n[CONTEXT FROM UPLOADED DOCUMENT]:\n{stored_doc}\n"

        # Combine Doc Context + User Message
        current_message = doc_context + request.message if doc_context else request.message

        # 3. Call Agent (Get Response + Metadata)
        bot_reply_text, agent_name, process_msg = agent.get_response(current_message, history=gemini_history)
        
        # 4. Save to DB with Session ID
        save_chat_entry(request.user_id, "user", request.message, request.session_id)
        save_chat_entry(request.user_id, "model", bot_reply_text, request.session_id)
        
        return ChatResponse(
            response=bot_reply_text,
            agent_used=agent_name,
            process_log=process_msg
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-doc")
async def upload_document_for_chat(file: UploadFile = File(...)):
    """
    Uploads a doc, extracts text via Vision, saves to memory.
    """
    allowed_types = ["application/pdf", "image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type.")

    try:
        file_bytes = await file.read()
        extracted_text = agent.extract_content_from_file(file_bytes, file.content_type)
        new_doc_id = save_document_context(extracted_text)
        
        return {
            "status": "success",
            "doc_id": new_doc_id,
            "preview": extracted_text[:100] + "..."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-doc")
async def analyze_document(file: UploadFile = File(...)):
    """
    One-off Legal Audit endpoint.
    """
    allowed_types = ["application/pdf", "image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type.")

    try:
        file_bytes = await file.read()
        analysis_result = agent.analyze_document(file_bytes, file.content_type)
        
        return {
            "filename": file.filename,
            "analysis": analysis_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)