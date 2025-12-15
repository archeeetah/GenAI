# app/main.py
from fastapi import FastAPI, HTTPException,  UploadFile, File
from app.models import ChatRequest, ChatResponse
from app.agent import FinancialAgent
from app.utils.doc_parser import extract_text_from_pdf

app = FastAPI(title="Financial Bot API")

# Initialize Agent once (or per request if needed)
agent = FinancialAgent()

@app.get("/")
def health_check():
    return {"status": "running", "service": "FinBot Backend"}

@app.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    try:
        # Call Gemini Agent
        bot_reply = agent.get_response(request.message)
        
        return ChatResponse(response=bot_reply)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/analyze-doc")
async def analyze_document(file: UploadFile = File(...)):  # <--- This will work now
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        contents = await file.read()
        doc_text = await extract_text_from_pdf(contents)
        
        if len(doc_text) < 50:
            return {"error": "Could not extract text. Is this a scanned image?"}

        analysis_result = agent.analyze_document(doc_text)
        
        return {
            "filename": file.filename,
            "analysis": analysis_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
if __name__ == "__main__":
    import uvicorn
    # Run on localhost:8000
    uvicorn.run(app, host="0.0.0.0", port=8000)