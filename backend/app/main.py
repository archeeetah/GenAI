import logging
import sys
from fastapi import FastAPI, HTTPException, UploadFile, File, Request
from fastapi.responses import JSONResponse
from app.models import ChatRequest, ChatResponse
from app.agent import FinancialAgent
from app.memory import save_document_context, get_document_context, get_chat_history, save_chat_entry
from fastapi.middleware.cors import CORSMiddleware

# --- 1. Logging Configuration ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("FinBot-Backend")

app = FastAPI(title="FinBot Backend")

# --- 2. Global Exception Handler ---
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global Exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error", "detail": str(exc)},
    )

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
try:
    agent = FinancialAgent()
    logger.info("FinancialAgent initialized successfully.")
except Exception as e:
    logger.critical(f"Failed to initialize FinancialAgent: {e}")
    raise e

@app.get("/")
def health_check():
    logger.info("Health check endpoint called.")
    return {"status": "running", "service": "FinBot API"}

@app.get("/history/{user_id}")
def get_history_endpoint(user_id: str, session_id: str = None):
    """
    Fetch history for a user, optionally filtered by session_id.
    """
    logger.info(f"Fetching history for user: {user_id}, session: {session_id}")
    return {"history": get_chat_history(user_id, session_id)}

@app.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    logger.info(f"Chat Request - User: {request.user_id}, Session: {request.session_id}")
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
            logger.info(f"Fetching document context for doc_id: {request.doc_id}")
            stored_doc = get_document_context(request.doc_id)
            if stored_doc:
                doc_context = f"\n[CONTEXT FROM UPLOADED DOCUMENT]:\n{stored_doc}\n"

        # Combine Doc Context + User Message
        current_message = doc_context + request.message if doc_context else request.message

        # 3. Call Agent (Get Response + Metadata)
        bot_reply_text, agent_name, process_msg = agent.get_response(
            current_message, 
            history=gemini_history,
            user_id=request.user_id,
            session_id=request.session_id
        )
        
        # 4. Save to DB with Session ID
        save_chat_entry(request.user_id, "user", request.message, request.session_id)
        save_chat_entry(request.user_id, "model", bot_reply_text, request.session_id)
        
        logger.info(f"Agent Response - Agent: {agent_name}")
        
        return ChatResponse(
            response=bot_reply_text,
            agent_used=agent_name,
            process_log=process_msg
        )

    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-doc")
async def upload_document_for_chat(file: UploadFile = File(...)):
    """
    Uploads a doc, extracts text via Vision, saves to memory.
    """
    logger.info(f"Uploading document: {file.filename}")
    allowed_types = ["application/pdf", "image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type.")

    try:
        file_bytes = await file.read()
        extracted_text = agent.extract_content_from_file(file_bytes, file.content_type)
        new_doc_id = save_document_context(extracted_text)
        
        logger.info(f"Document uploaded and processed. Doc ID: {new_doc_id}")
        return {
            "status": "success",
            "doc_id": new_doc_id,
            "preview": extracted_text[:100] + "..."
        }
    except Exception as e:
        logger.error(f"Error uploading document: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-doc")
async def analyze_document(file: UploadFile = File(...)):
    """
    One-off Legal Audit endpoint.
    """
    logger.info(f"Analyzing document: {file.filename}")
    allowed_types = ["application/pdf", "image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type.")

    try:
        file_bytes = await file.read()
        analysis_result = agent.analyze_document(file_bytes, file.content_type)
        
        logger.info("Document analysis completed.")
        return {
            "filename": file.filename,
            "analysis": analysis_result
        }
    except Exception as e:
        logger.error(f"Error analyzing document: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)