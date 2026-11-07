from typing import TypedDict, Annotated, List, Dict, Any, Optional
import operator
from langgraph.graph import StateGraph, END
from app.services.career_apis import (
    fetch_live_jobs_with_fallback,
    fetch_company_intelligence_with_fallback,
    calculate_realtime_salary_benchmark,
    analyze_github_developer_profile
)

# ─── Career Tools ─────────────────────────────────────────────────────────────

def search_jobs_tool(role: str = "", location: str = "") -> List[Dict[str, Any]]:
    live_data = fetch_live_jobs_with_fallback(role=role, location=location, limit=4)
    return [
        {
            "id": j["id"],
            "title": j["title"],
            "company": j["company"],
            "location": j["location"],
            "salary": j["salary"],
            "experience": j.get("experience", "2-4 Years"),
            "source": j.get("source", "verified_database")
        } for j in live_data.get("jobs", [])[:4]
    ]

def salary_benchmark_tool(role: str, location: str = "Bengaluru") -> Dict[str, Any]:
    res = calculate_realtime_salary_benchmark(role=role, location=location)
    return {
        "role": role or "Software Engineer",
        "location": res.get("location", location),
        "location_tier": res.get("location_tier", "Tier-1 Metro"),
        "fresher": res["bands"]["fresher"],
        "mid": res["bands"]["mid_level"],
        "senior": res["bands"]["senior_lead"],
        "estimated_in_hand_monthly_mid": res.get("estimated_in_hand_monthly_mid", ""),
        "top_locations": "Bengaluru, Hyderabad, Pune, Mumbai, Gurgaon"
    }

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

# Company Information Lookup (AmbitionBox & Glassdoor style)
COMPANY_DATABASE = {
    "google": {
        "name": "Google India",
        "rating": 4.6,
        "wlb_rating": 4.4,
        "sentiment": "92% approve of CEO • High employee satisfaction",
        "locations": "Bengaluru, Hyderabad, Gurgaon",
        "salary_range": "25 - 65+ LPA",
        "notice_period": "30 days buyout or standard notice",
        "work_mode": "Hybrid (3 days in-office)",
        "tech_stack": "Go, C++, Python, Kubernetes, TensorFlow, GCP",
        "interview_difficulty": "Challenging (DSA, System Design, Googleyness)",
        "culture_summary": "Top-tier engineering culture, world-class amenities, strong work-life balance."
    },
    "microsoft": {
        "name": "Microsoft India (IDC)",
        "rating": 4.5,
        "wlb_rating": 4.5,
        "sentiment": "90% positive outlook • Stable growth",
        "locations": "Hyderabad, Bengaluru, Noida",
        "salary_range": "22 - 60+ LPA",
        "notice_period": "30-60 days",
        "work_mode": "Flexible Hybrid",
        "tech_stack": "C#, .NET Core, Azure, TypeScript, Python, React",
        "interview_difficulty": "Moderate to Hard (Problem Solving & Low Level Design)",
        "culture_summary": "Exceptional work-life balance, collaborative team culture, extensive healthcare."
    },
    "flipkart": {
        "name": "Flipkart",
        "rating": 4.2,
        "wlb_rating": 3.8,
        "sentiment": "High ownership • Rapid execution environment",
        "locations": "Bengaluru",
        "salary_range": "18 - 55 LPA",
        "notice_period": "30-60 days",
        "work_mode": "Hybrid (Bengaluru campus)",
        "tech_stack": "Java, Dropwizard, Kafka, Aerospike, React, Python",
        "interview_difficulty": "Hard (High-concurrency System Design & Data Structures)",
        "culture_summary": "Fast-paced e-commerce scale, high engineering autonomy, lucrative ESOPs."
    },
    "swiggy": {
        "name": "Swiggy",
        "rating": 4.2,
        "wlb_rating": 4.0,
        "sentiment": "Remote-first culture with occasional offsites",
        "locations": "Bengaluru, Remote",
        "salary_range": "18 - 48 LPA",
        "notice_period": "30 days",
        "work_mode": "Remote-First",
        "tech_stack": "Golang, Node.js, React Native, Kubernetes, AWS",
        "interview_difficulty": "Moderate (Real-world system architecture & coding)",
        "culture_summary": "High product velocity, modern tech stack, flexible work-from-anywhere model."
    },
    "zomato": {
        "name": "Zomato",
        "rating": 4.1,
        "wlb_rating": 3.7,
        "sentiment": "Hardworking, high adrenaline, quick turnaround",
        "locations": "Gurgaon, Bengaluru",
        "salary_range": "16 - 45 LPA",
        "notice_period": "30 days",
        "work_mode": "In-Office / Hybrid",
        "tech_stack": "PHP, Go, React, Python, Kafka, Redis",
        "interview_difficulty": "Fast-tracked technical and cultural fit rounds",
        "culture_summary": "Energetic consumer startup culture with direct business impact."
    },
    "razorpay": {
        "name": "Razorpay",
        "rating": 4.3,
        "wlb_rating": 4.1,
        "sentiment": "Fintech unicorn with stellar developer brand",
        "locations": "Bengaluru",
        "salary_range": "18 - 50 LPA",
        "notice_period": "30 days",
        "work_mode": "Hybrid",
        "tech_stack": "Go, PHP, React, MySQL, AWS, Docker",
        "interview_difficulty": "Moderate-Hard (Machine Coding + Architecture)",
        "culture_summary": "Fintech innovation leader, transparent leadership, employee-friendly ESOP policies."
    },
    "tcs": {
        "name": "Tata Consultancy Services (TCS)",
        "rating": 3.9,
        "wlb_rating": 4.1,
        "sentiment": "Highest job security in Indian IT sector",
        "locations": "Mumbai, Pune, Bengaluru, Chennai, Hyderabad, Kolkata",
        "salary_range": "3.6 - 18 LPA",
        "notice_period": "90 days (Strictly enforced)",
        "work_mode": "In-Office (5 days / week policy)",
        "tech_stack": "Java, Spring Boot, Angular, Oracle, Cloud, Mainframe",
        "interview_difficulty": "Moderate (Aptitude, Core CS concepts, Managerial round)",
        "culture_summary": "Immense enterprise stability, international onsite opportunities, structured career ladder."
    },
    "infosys": {
        "name": "Infosys",
        "rating": 3.8,
        "wlb_rating": 4.0,
        "sentiment": "World-class Mysore training academy and campus",
        "locations": "Bengaluru, Pune, Hyderabad, Chennai, Chandigarh",
        "salary_range": "3.8 - 20 LPA",
        "notice_period": "90 days (Mandatory in Indian IT services)",
        "work_mode": "Hybrid / In-Office",
        "tech_stack": "Java, Python, React, Cloud, DevOps, AI/GenAI",
        "interview_difficulty": "Moderate (Online assessment + Technical interview)",
        "culture_summary": "Predictable work hours, strong training and upskilling ecosystem, global brand."
    }
}

def company_research_tool(company: str) -> Dict[str, Any]:
    intel = fetch_company_intelligence_with_fallback(company)
    c_info = intel.get("company", {})
    # Ensure locations is string for formatting
    if isinstance(c_info.get("locations"), list):
        c_info["locations"] = ", ".join(c_info["locations"])
    if isinstance(c_info.get("tech_stack"), list):
        c_info["tech_stack"] = ", ".join(c_info["tech_stack"])
    return c_info

# ─── LangGraph State Definition ───────────────────────────────────────────────
class CareerAgentState(TypedDict):
    user_query: str
    target_role: Optional[str]
    target_location: Optional[str]
    target_company: Optional[str]
    intent: Optional[str]
    tool_results: Dict[str, Any]
    final_reply: Optional[str]

# ─── Graph Nodes ──────────────────────────────────────────────────────────────
def intent_analyzer_node(state: CareerAgentState) -> CareerAgentState:
    query = state["user_query"].lower()
    intent = "general"
    role = state.get("target_role") or ""
    loc = state.get("target_location") or ""
    comp = state.get("target_company") or ""

    # Check company research intent
    company_keywords = ["company", "culture", "ambitionbox", "glassdoor", "review", "work life", "rating", "google", "microsoft", "flipkart", "swiggy", "zomato", "razorpay", "tcs", "infosys"]
    if any(k in query for k in company_keywords):
        intent = "company"
        for cname in ["google", "microsoft", "flipkart", "swiggy", "zomato", "razorpay", "tcs", "infosys"]:
            if cname in query:
                comp = cname
                break
    elif any(k in query for k in ["salary", "package", "lpa", "earning", "compensation"]):
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
    if comp:
        state["target_company"] = comp

    return state

def tool_executor_node(state: CareerAgentState) -> CareerAgentState:
    intent = state.get("intent", "general")
    role = state.get("target_role") or "Software Engineer"
    loc = state.get("target_location") or ""
    comp = state.get("target_company") or "Google"
    results = {}

    if intent == "company":
        results["company_data"] = company_research_tool(comp)
    elif intent == "salary":
        results["salary_data"] = salary_benchmark_tool(role)
    elif intent == "interview":
        results["interview_data"] = interview_prep_tool(role)
    elif intent == "resume":
        results["resume_tips"] = resume_optimizer_tool(role)
    elif intent == "jobs":
        results["jobs_data"] = search_jobs_tool(role, loc)
    else:
        results["jobs_data"] = search_jobs_tool(role, loc)
        results["salary_data"] = salary_benchmark_tool(role)

    state["tool_results"] = results
    return state

def response_synthesizer_node(state: CareerAgentState) -> CareerAgentState:
    intent = state.get("intent", "general")
    role = state.get("target_role") or "Software Developer"
    results = state.get("tool_results", {})

    if intent == "company" and "company_data" in results:
        c = results["company_data"]
        reply = (
            f"🏢 **Company Intelligence: {c['name']}**\n\n"
            f"⭐ **AmbitionBox & Glassdoor Rating:** {c['rating']} / 5.0\n"
            f"⚖️ **Work-Life Balance:** {c['wlb_rating']} / 5.0\n"
            f"💼 **Expected Salary Band:** {c['salary_range']}\n"
            f"⏱️ **Notice Period Policy:** {c['notice_period']}\n"
            f"🏠 **Work Mode:** {c['work_mode']}\n"
            f"💻 **Core Tech Stack:** {c['tech_stack']}\n\n"
            f"💡 **Culture & Interview Insights:**\n"
            f"• {c['culture_summary']}\n"
            f"• **Interview Difficulty:** {c['interview_difficulty']}"
        )
    elif intent == "salary" and "salary_data" in results:
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
            f"2. 🏢 AmbitionBox & Glassdoor Company Intelligence\n"
            f"3. 💰 Benchmarking salaries (LPA) in India\n"
            f"4. 📄 ATS Resume Optimization & Keywords\n"
            f"5. 🎯 Technical & Behavioral Interview Prep\n\n"
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

def run_career_agent(query: str, role: Optional[str] = None, location: Optional[str] = None, company: Optional[str] = None) -> Dict[str, Any]:
    """Execute LangGraph career agent."""
    initial_state: CareerAgentState = {
        "user_query": query,
        "target_role": role,
        "target_location": location,
        "target_company": company,
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
