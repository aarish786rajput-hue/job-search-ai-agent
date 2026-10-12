from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any

from app.agent.career_agent import run_career_agent

router = APIRouter()

class AgentChatRequest(BaseModel):
    query: str
    role: Optional[str] = None
    location: Optional[str] = None

class AgentChatResponse(BaseModel):
    reply: str
    intent: Optional[str] = None
    target_role: Optional[str] = None
    tool_results: Dict[str, Any]

@router.post("/chat", response_model=AgentChatResponse)
def chat_with_agent(req: AgentChatRequest):
    """Interact with the LangGraph Career Planning AI Agent."""
    output = run_career_agent(req.query, req.role, req.location)
    return output
