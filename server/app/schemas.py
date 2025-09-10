from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Any, Dict

Role = Literal["system", "user", "assistant", "tool"]

class Message(BaseModel):
    role: Role
    content: str
    name: Optional[str] = None
    tool_call_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class ChatRequest(BaseModel):
    session_id: str = Field(..., description="Stable client session id")
    messages: List[Message]
    model: Optional[str] = None          # override default
    temperature: Optional[float] = 0.3
    top_p: Optional[float] = 1.0
    stream: Optional[bool] = False

class ChatChunk(BaseModel):
    session_id: str
    delta: str
    done: bool = False

class ChatResponse(BaseModel):
    session_id: str
    content: str