# app/main.py
from fastapi import FastAPI, HTTPException
from app.models import ChatRequest, ChatResponse
from app.agent import FinancialAgent

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

if __name__ == "__main__":
    import uvicorn
    # Run on localhost:8000
    uvicorn.run(app, host="0.0.0.0", port=8000)