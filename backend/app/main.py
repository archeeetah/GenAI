# app/main.py
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from app.models import ChatRequest, ChatResponse
from app.agent import FinancialAgent
from app.memory import save_user_document, get_user_documents, get_user_profile, get_chat_history, save_chat_entry
from app.context import set_chat_context
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="FinBot Backend")
origins = [
    "http://localhost:3000",
    "https://genai-mjy8.vercel.app"
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
        # 0. Set Context for Tools
        set_chat_context(request.user_id, request.session_id)

        # 1. Fetch Context (Current Session History)
        raw_history = get_chat_history(request.user_id, request.session_id)
        
        # Convert to Gemini format
        gemini_history = []
        for msg in raw_history:
            role = "user" if msg["role"] == "user" else "model"
            gemini_history.append({"role": role, "parts": [msg["content"]]})

        # 2. Fetch User Profile & Documents (RAG/Context)
        user_profile = get_user_profile(request.user_id)
        user_docs = get_user_documents(request.user_id)

        context_data = {
            "profile": user_profile,
            "documents": user_docs
        }

        # 3. Call Agent (Get Response + Metadata)
        # We pass context_data to the agent
        bot_reply_text, agent_name, process_msg = agent.get_response(request.message, history=gemini_history, context_data=context_data)
        
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
async def upload_document_for_chat(file: UploadFile = File(...), user_id: str = Form(...)):
    """
    Uploads a doc, extracts text via Vision, saves to memory.
    """
    allowed_types = ["application/pdf", "image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type.")

    try:
        file_bytes = await file.read()
        extracted_text = agent.extract_content_from_file(file_bytes, file.content_type)
        
        # Save to User's History
        doc_id = save_user_document(user_id, file.filename, file_bytes, file.content_type, extracted_text)
        
        return {
            "status": "success",
            "doc_id": doc_id,
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