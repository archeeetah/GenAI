# app/models.py
from pydantic import BaseModel
from typing import Optional, List

class ChatRequest(BaseModel):
    user_id: str             # To track who is asking (matches Firebase UID)
    message: str             # The user's question
    history: Optional[List] = [] # Optional: send previous context

class ChatResponse(BaseModel):
    response: str
    status: str = "success"