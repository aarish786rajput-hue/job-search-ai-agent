from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional, Dict, Any

from app.agent.career_agent import run_career_agent
from app.services.career_apis import (
    fetch_live_jobs_with_fallback,
    fetch_company_intelligence_with_fallback,
    analyze_github_developer_profile,
    calculate_realtime_salary_benchmark
)

router = APIRouter()

class AgentChatRequest(BaseModel):
    query: str
    role: Optional[str] = None
    location: Optional[str] = None
    company: Optional[str] = None

class AgentChatResponse(BaseModel):
    reply: str
    intent: Optional[str] = None
    target_role: Optional[str] = None
    tool_results: Dict[str, Any]

@router.post("/chat", response_model=AgentChatResponse)
def chat_with_agent(req: AgentChatRequest):
    """Interact with the LangGraph Career Planning AI Agent."""
    output = run_career_agent(req.query, req.role, req.location, req.company)
    return output

@router.get("/github-portfolio")
def get_github_portfolio(username: str = Query(..., description="Candidate GitHub username")):
    """Analyze developer portfolio, public repositories, and language stats using GitHub API."""
    return analyze_github_developer_profile(username)

@router.get("/company-intel")
def get_company_intel(company: str = Query(..., description="Company name")):
    """Fetch company culture, AmbitionBox & Glassdoor ratings, tech stack, and notice period policies."""
    return fetch_company_intelligence_with_fallback(company)

@router.get("/salary-benchmark")
def get_salary_benchmark(
    role: str = Query("Software Engineer"),
    location: str = Query("Bengaluru")
):
    """Calculate real-time Indian LPA benchmark with Metro vs Tier-2 adjustment."""
    return calculate_realtime_salary_benchmark(role=role, location=location)

@router.get("/live-jobs")
def get_live_jobs(
    role: Optional[str] = Query(None),
    location: Optional[str] = Query(None)
):
    """Retrieve live jobs from API with fallback to Indian tech market database."""
    return fetch_live_jobs_with_fallback(role=role or "", location=location or "")
