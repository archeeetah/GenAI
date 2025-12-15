# app/models.py
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class ChatRequest(BaseModel):
    user_id: str
    message: str
    doc_id: Optional[str] = None
    history: Optional[List[Dict[str, Any]]] = []

class ChatResponse(BaseModel):
    response: str
    doc_id: Optional[str] = None
    status: str = "success"
    agent_used: str = "General Banking Agent"   
    process_log: str = "Processing query..."     