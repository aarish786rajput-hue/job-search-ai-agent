from typing import TypedDict, Annotated, List, Dict, Any, Optional
import operator
from langgraph.graph import StateGraph, END

# Career Tools
def search_jobs_tool(role: str = "", location: str = "") -> List[Dict[str, Any]]:
    from main import MOCK_JOBS
    results = MOCK_JOBS
    if role:
        results = [j for j in results if role.lower() in j.title.lower() or role.lower() in j.description.lower()]
    if location:
        results = [j for j in results if location.lower() in j.location.lower()]
    return [
        {
            "id": j.id,
            "title": j.title,
            "company": j.company,
            "location": j.location,
            "salary": j.salary,
            "experience": j.experience
        } for j in results[:4]
    ]

def salary_benchmark_tool(role: str) -> Dict[str, Any]:
    role_lower = role.lower()
    if "ai" in role_lower or "ml" in role_lower or "machine learning" in role_lower:
        return {"role": role, "fresher": "8-14 LPA", "mid": "18-28 LPA", "senior": "30-50+ LPA", "top_locations": "Bengaluru, Hyderabad, Pune"}
    elif "frontend" in role_lower or "react" in role_lower:
        return {"role": role, "fresher": "4.5-8 LPA", "mid": "10-18 LPA", "senior": "22-35 LPA", "top_locations": "Bengaluru, NCR, Mumbai"}
    elif "backend" in role_lower or "python" in role_lower or "fastapi" in role_lower:
        return {"role": role, "fresher": "5-9 LPA", "mid": "12-22 LPA", "senior": "25-40 LPA", "top_locations": "Bengaluru, Pune, Hyderabad"}
    elif "data" in role_lower:
        return {"role": role, "fresher": "6-10 LPA", "mid": "14-24 LPA", "senior": "28-45 LPA", "top_locations": "Bengaluru, Mumbai, Gurgaon"}
    else:
        return {"role": role or "Software Engineer", "fresher": "5-8 LPA", "mid": "12-18 LPA", "senior": "22-35 LPA", "top_locations": "Bengaluru, Hyderabad, Pune"}

def interview_prep_tool(role: str) -> Dict[str, Any]:
    role_lower = role.lower()
    if "frontend" in role_lower or "react" in role_lower:
        questions = [
            "Explain the Virtual DOM and React 19 / Next.js Server Components.",
            "How do you optimize Largest Contentful Paint (LCP) and web vitals?",
            "Difference between useMemo, useCallback, and React compiler."
        ]
        tips = "Emphasize responsive UI, state management patterns, and CSS architecture."
    elif "ai" in role_lower or "ml" in role_lower:
        questions = [
            "Explain RAG (Retrieval-Augmented Generation) pipeline architecture.",
            "How do LangGraph cyclic graphs differ from standard LangChain DAGs?",
            "What metrics do you use to evaluate LLM hallucination and latency?"
        ]
        tips = "Highlight practical deployments, embeddings choice, and agentic workflows."
    else:
        questions = [
            "Explain RESTful API design principles and idempotency.",
            "How do you handle database indexing and concurrency with SQLAlchemy?",
            "What strategies do you use for caching with Redis?"
        ]
        tips = "Demonstrate solid knowledge of asynchronous programming and database design."

    return {"questions": questions, "pro_tip": tips}

def resume_optimizer_tool(role: str) -> Dict[str, Any]:
    return {
        "focus_role": role or "Tech Professional",
        "key_keywords": ["FastAPI", "Next.js", "Docker", "CI/CD", "PostgreSQL", "LangGraph", "REST APIs"],
        "ats_structure_tip": "Keep a clear single-column layout with quantifiable metrics (e.g. 'Reduced latency by 35%').",
        "action_verbs": ["Architected", "Engineered", "Optimized", "Spearheaded", "Deployed"]
    }

# ─── LangGraph State Definition ───────────────────────────────────────────────
class CareerAgentState(TypedDict):
    user_query: str
    target_role: Optional[str]
    target_location: Optional[str]
    intent: Optional[str]
    tool_results: Dict[str, Any]
    final_reply: Optional[str]

# ─── Graph Nodes ──────────────────────────────────────────────────────────────
def intent_analyzer_node(state: CareerAgentState) -> CareerAgentState:
    query = state["user_query"].lower()
    intent = "general"
    role = state.get("target_role") or ""
    loc = state.get("target_location") or ""

    if any(k in query for k in ["salary", "package", "lpa", "earning", "compensation"]):
        intent = "salary"
    elif any(k in query for k in ["interview", "question", "prep", "round"]):
        intent = "interview"
    elif any(k in query for k in ["resume", "ats", "cv", "keyword"]):
        intent = "resume"
    elif any(k in query for k in ["job", "find", "search", "vacancy", "opening", "hire"]):
        intent = "jobs"

    # Infer role if not passed
    if not role:
        for possible in ["ai engineer", "frontend developer", "backend developer", "data scientist", "full stack"]:
            if possible in query:
                role = possible.title()
                break

    state["intent"] = intent
    if role:
        state["target_role"] = role
    if loc:
        state["target_location"] = loc

    return state

def tool_executor_node(state: CareerAgentState) -> CareerAgentState:
    intent = state.get("intent", "general")
    role = state.get("target_role") or "Software Engineer"
    loc = state.get("target_location") or ""
    results = {}

    if intent == "salary":
        results["salary_data"] = salary_benchmark_tool(role)
    elif intent == "interview":
        results["interview_data"] = interview_prep_tool(role)
    elif intent == "resume":
        results["resume_tips"] = resume_optimizer_tool(role)
    elif intent == "jobs":
        results["jobs_data"] = search_jobs_tool(role, loc)
    else:
        # Default comprehensive advisory
        results["jobs_data"] = search_jobs_tool(role, loc)
        results["salary_data"] = salary_benchmark_tool(role)

    state["tool_results"] = results
    return state

def response_synthesizer_node(state: CareerAgentState) -> CareerAgentState:
    intent = state.get("intent", "general")
    role = state.get("target_role") or "Software Developer"
    results = state.get("tool_results", {})

    if intent == "salary" and "salary_data" in results:
        sal = results["salary_data"]
        reply = (
            f"💰 **Salary Insights for {role}:**\n\n"
            f"• **Fresher / Entry:** {sal['fresher']}\n"
            f"• **Mid-Level (2-5 Yrs):** {sal['mid']}\n"
            f"• **Senior / Lead (5+ Yrs):** {sal['senior']}\n\n"
            f"📍 **Top Hiring Hubs:** {sal['top_locations']}"
        )
    elif intent == "interview" and "interview_data" in results:
        iv = results["interview_data"]
        qs = "\n".join([f"  {idx+1}. {q}" for idx, q in enumerate(iv['questions'])])
        reply = (
            f"🎯 **Interview Prep Guide for {role}:**\n\n"
            f"**Key Questions Asked:**\n{qs}\n\n"
            f"💡 **Pro Tip:** {iv['pro_tip']}"
        )
    elif intent == "resume" and "resume_tips" in results:
        rt = results["resume_tips"]
        kws = ", ".join(rt["key_keywords"])
        reply = (
            f"📄 **Resume & ATS Strategy for {role}:**\n\n"
            f"• **Target Keywords:** {kws}\n"
            f"• **Formatting Advice:** {rt['ats_structure_tip']}\n"
            f"• **High-Impact Action Verbs:** {', '.join(rt['action_verbs'])}"
        )
    elif intent == "jobs" and "jobs_data" in results:
        jobs = results["jobs_data"]
        if jobs:
            job_list = "\n".join([f"• **{j['title']}** at {j['company']} ({j['location']}) — {j['salary']}" for j in jobs])
            reply = f"🔍 **Matched Opportunities for {role}:**\n\n{job_list}\n\nApply directly or save them to your tracker!"
        else:
            reply = f"No active openings found matching '{role}'. Try broadening your search criteria."
    else:
        reply = (
            f"Hello! I am your **LangGraph Career Agent**. I can help you with:\n"
            f"1. 🔎 Finding relevant tech openings\n"
            f"2. 💰 Benchmarking salaries (LPA) in India\n"
            f"3. 📄 ATS Resume Optimization & Keywords\n"
            f"4. 🎯 Technical & Behavioral Interview Prep\n\n"
            f"What would you like assistance with today?"
        )

    state["final_reply"] = reply
    return state

# ─── Build LangGraph Workflow ─────────────────────────────────────────────────
workflow = StateGraph(CareerAgentState)
workflow.add_node("analyze_intent", intent_analyzer_node)
workflow.add_node("execute_tools", tool_executor_node)
workflow.add_node("synthesize_response", response_synthesizer_node)

workflow.set_entry_point("analyze_intent")
workflow.add_edge("analyze_intent", "execute_tools")
workflow.add_edge("execute_tools", "synthesize_response")
workflow.add_edge("synthesize_response", END)

career_agent_app = workflow.compile()

def run_career_agent(query: str, role: Optional[str] = None, location: Optional[str] = None) -> Dict[str, Any]:
    """Execute LangGraph career agent."""
    initial_state: CareerAgentState = {
        "user_query": query,
        "target_role": role,
        "target_location": location,
        "intent": None,
        "tool_results": {},
        "final_reply": None
    }
    result = career_agent_app.invoke(initial_state)
    return {
        "reply": result.get("final_reply"),
        "intent": result.get("intent"),
        "target_role": result.get("target_role"),
        "tool_results": result.get("tool_results")
    }
