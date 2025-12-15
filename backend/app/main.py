# app/main.py
from fastapi import FastAPI, HTTPException, UploadFile, File
from app.models import ChatRequest, ChatResponse
from app.agent import FinancialAgent

app = FastAPI(title="Financial Bot API")

# Initialize Agent
agent = FinancialAgent()

@app.get("/")
def health_check():
    return {"status": "running", "service": "FinBot Backend"}

@app.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    try:
        bot_reply = agent.get_response(request.message)
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