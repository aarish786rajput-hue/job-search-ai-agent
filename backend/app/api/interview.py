from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import urllib.parse

from app.core.database import get_db
from app.models.user import User
from app.models.interview import MockInterview, ScheduledInterview
from app.api.auth import get_current_user

router = APIRouter()

# ── Question Bank ─────────────────────────────────────────────────────────────
INTERVIEW_QUESTIONS: Dict[str, List[Dict[str, Any]]] = {
    "ai engineer": [
        {
            "id": 1,
            "question": "Explain the difference between LangChain standard chains and LangGraph cyclic graphs. When would you choose LangGraph?",
            "keywords": ["cycle", "state", "agent", "memory", "graph", "loop", "dag"],
            "model_answer": "Standard LangChain uses linear DAGs (Directed Acyclic Graphs) that run step-by-step from start to finish. In contrast, LangGraph supports cyclical state machines with loops, branching, and conditional edges, enabling agents to self-correct, maintain state, iterate on tool execution, and execute multi-agent coordination."
        },
        {
            "id": 2,
            "question": "How do you mitigate LLM hallucination and latency in a production RAG (Retrieval-Augmented Generation) pipeline?",
            "keywords": ["reranking", "chunking", "embeddings", "vector", "cache", "context", "grounding"],
            "model_answer": "To minimize hallucination: implement hybrid search (BM25 + vector embeddings), cross-encoder re-ranking (like Cohere or BGE), strict prompt grounding with citations, and self-reflection loops. For latency: semantic caching with Redis, asynchronous tool execution, and smaller quantized models for routing."
        },
        {
            "id": 3,
            "question": "What metrics and frameworks do you use to evaluate LLM outputs in production?",
            "keywords": ["ragas", "precision", "recall", "faithfulness", "latency", "cost", "eval"],
            "model_answer": "I use evaluation frameworks like RAGAS or TruLens focusing on: 1) Faithfulness (is the answer grounded in context?), 2) Answer Relevance, 3) Context Precision/Recall, alongside operational metrics like TTFT (Time to First Token), end-to-end latency, and cost per token."
        }
    ],
    "full stack developer": [
        {
            "id": 1,
            "question": "Explain how Next.js Server Components differ from Client Components and how hydration works.",
            "keywords": ["server", "client", "hydration", "bundle", "async", "render"],
            "model_answer": "React Server Components (RSC) execute strictly on the server and stream zero JavaScript to the client, drastically reducing bundle size. Client Components ('use client') run on both server (for initial SSR HTML) and client, undergoing hydration to attach event listeners and interactive state."
        },
        {
            "id": 2,
            "question": "How do you design a scalable RESTful API with FastAPI and ensure database query optimization with SQLAlchemy?",
            "keywords": ["index", "async", "n+1", "eager", "join", "pagination", "session"],
            "model_answer": "Design idempotent endpoints with standard HTTP status codes, Pydantic data validation, and cursor-based pagination. In SQLAlchemy, optimize queries using indexed foreign keys, eager loading (selectinload/joinedload) to eliminate N+1 queries, and connection pooling."
        },
        {
            "id": 3,
            "question": "How do you secure JWT authentication in production against XSS and CSRF attacks?",
            "keywords": ["cookie", "httponly", "samesite", "csrf", "xss", "refresh", "expiry"],
            "model_answer": "Store short-lived JWT access tokens in memory or secure HttpOnly, SameSite=Strict cookies so they cannot be accessed via JavaScript (preventing XSS). Use rotating refresh tokens stored in secure database sessions and validate CSRF tokens for state-changing requests."
        }
    ],
    "backend developer": [
        {
            "id": 1,
            "question": "How do you handle database concurrency, race conditions, and transactions in high-throughput applications?",
            "keywords": ["transaction", "acid", "lock", "optimistic", "pessimistic", "isolation", "atomic"],
            "model_answer": "Ensure ACID compliance using database transactions. For low contention, use Optimistic Locking with version columns; for critical financial data, use Pessimistic Locking (SELECT FOR UPDATE) or distributed locks via Redis (Redlock). Keep transactions short and set appropriate isolation levels."
        },
        {
            "id": 2,
            "question": "Explain how you would architect an asynchronous background job processing system with FastAPI, Celery, and Redis.",
            "keywords": ["celery", "worker", "queue", "redis", "async", "broker", "retry"],
            "model_answer": "Offload long-running tasks (e.g. PDF parsing, email alerts) by publishing tasks to Redis as the message broker. Independent Celery workers consume tasks from the queue with exponential backoff retries, dead-letter queues for failures, and idempotency keys to prevent duplicate runs."
        },
        {
            "id": 3,
            "question": "How do you optimize API response times and web vitals for distributed microservices?",
            "keywords": ["cache", "redis", "cdn", "gzip", "pooling", "async", "latency"],
            "model_answer": "Implement tiered caching (Redis for hot data, CDN for static content), asynchronous I/O with connection pooling, gzip/brotli compression, database indexing, and distributed tracing with OpenTelemetry to isolate bottlenecks."
        }
    ]
}

# ── Schemas ───────────────────────────────────────────────────────────────────
class StartInterviewRequest(BaseModel):
    role: str
    difficulty: Optional[str] = "Mid-Level"

class EvaluateAnswerRequest(BaseModel):
    role: str
    question_index: int
    question: str
    user_answer: str

class ScheduleRequest(BaseModel):
    role: str
    date: str  # YYYY-MM-DD
    time: str  # HH:MM

class NegotiationRequest(BaseModel):
    company: str
    role: str
    offered_lpa: float
    target_lpa: float
    notice_period_days: Optional[int] = 30

# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/start")
def start_interview(req: StartInterviewRequest):
    role_key = req.role.lower().strip()
    questions = INTERVIEW_QUESTIONS.get(role_key, INTERVIEW_QUESTIONS["full stack developer"])
    return {
        "session_id": f"mock-{int(datetime.now().timestamp())}",
        "role": req.role,
        "difficulty": req.difficulty,
        "total_questions": len(questions),
        "current_index": 0,
        "question": questions[0]["question"]
    }

@router.post("/evaluate")
def evaluate_answer(
    req: EvaluateAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    role_key = req.role.lower().strip()
    questions = INTERVIEW_QUESTIONS.get(role_key, INTERVIEW_QUESTIONS["full stack developer"])
    idx = min(req.question_index, len(questions) - 1)
    q_data = questions[idx]

    answer_lower = req.user_answer.lower()
    matched_kws = [k for k in q_data["keywords"] if k in answer_lower]
    word_count = len(req.user_answer.split())

    # Scoring algorithm
    score = 40  # base score
    if word_count > 30:
        score += 20
    elif word_count > 15:
        score += 10

    kw_bonus = min(len(matched_kws) * 10, 40)
    score = min(score + kw_bonus, 98)

    strengths = []
    improvements = []

    if len(matched_kws) >= 2:
        strengths.append(f"Demonstrated solid grasp of key principles ({', '.join(matched_kws[:3])}).")
    if word_count > 25:
        strengths.append("Structured explanation with sufficient architectural context.")
    else:
        improvements.append("Answer is somewhat brief; elaborate more on system trade-offs and edge cases.")

    if len(matched_kws) < 2:
        improvements.append(f"Consider mentioning key concepts such as: {', '.join(q_data['keywords'][:3])}.")

    is_last = req.question_index >= len(questions) - 1
    next_q = None if is_last else questions[req.question_index + 1]["question"]

    # Save to database if last question
    if is_last:
        mock_rec = MockInterview(
            user_id=current_user.id,
            role=req.role,
            total_score=float(score),
            questions_answered=len(questions),
            feedback_summary=f"Completed {len(questions)} technical questions with average score of {score}%"
        )
        db.add(mock_rec)
        db.commit()

    return {
        "score": score,
        "strengths": strengths if strengths else ["Good initial attempt touching relevant concepts."],
        "improvements": improvements if improvements else ["Refine delivery with measurable production metrics."],
        "model_answer": q_data["model_answer"],
        "is_complete": is_last,
        "next_index": req.question_index + 1 if not is_last else None,
        "next_question": next_q
    }

@router.post("/schedule")
def schedule_interview(
    req: ScheduleRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        dt_str = f"{req.date} {req.time}"
        sched_dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M")
    except Exception:
        sched_dt = datetime.now()

    rec = ScheduledInterview(
        user_id=current_user.id,
        role=req.role,
        scheduled_for=sched_dt
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)

    # Generate Google Calendar link
    title = urllib.parse.quote(f"Mock Interview Practice: {req.role}")
    details = urllib.parse.quote(f"AI-Powered Technical Mock Interview session for {req.role} on CareerOrbit platform.")
    start_fmt = sched_dt.strftime("%Y%m%dT%H%M00Z")
    end_fmt = sched_dt.strftime("%Y%m%dT%H%M00Z")
    gcal_url = f"https://calendar.google.com/calendar/render?action=TEMPLATE&text={title}&dates={start_fmt}/{end_fmt}&details={details}"

    # Generate ICS calendar file content
    ics_content = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CareerOrbit AI//Mock Interview//EN
BEGIN:VEVENT
SUMMARY:Mock Interview Practice: {req.role}
DESCRIPTION:Practice session for {req.role} on CareerOrbit AI platform.
DTSTART:{start_fmt}
DTEND:{end_fmt}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR"""

    return {
        "id": rec.id,
        "role": req.role,
        "scheduled_for": sched_dt.strftime("%d %b %Y at %I:%M %p"),
        "google_calendar_url": gcal_url,
        "ics_content": ics_content
    }

@router.post("/negotiate")
def salary_negotiation_assistant(req: NegotiationRequest):
    offered = req.offered_lpa
    target = req.target_lpa
    diff_lpa = round(target - offered, 1)
    diff_pct = round(((target - offered) / offered) * 100, 1) if offered > 0 else 0

    # In-Hand Estimation formula for Indian Tax System (LPA to Monthly approx)
    # Roughly: InHand = (CTC * 0.85) / 12 for standard bracket after PF & Tax
    in_hand_offered = round((offered * 100000 * 0.84) / 12)
    in_hand_target = round((target * 100000 * 0.84) / 12)

    email_draft = (
        f"Subject: In appreciation of the offer — Discussion regarding {req.role} compensation at {req.company}\n\n"
        f"Dear Hiring Team,\n\n"
        f"Thank you very much for offering me the {req.role} position at {req.company}. I am truly excited about the team's roadmap and the opportunity to make an impact.\n\n"
        f"Based on my relevant experience and market benchmarks for this role in India, I was hoping we could explore aligning the total compensation closer to {target} LPA (offered: {offered} LPA). "
        f"With my {req.notice_period_days}-day notice period and hands-on readiness in modern engineering workflows, I am confident I will deliver immediate value.\n\n"
        f"Would it be possible to discuss whether there is flexibility in the base salary or joining bonus to bridge this gap? Either way, I am very enthusiastic about joining {req.company}.\n\n"
        f"Warm regards,\n[Your Name]"
    )

    talking_points = [
        f"Emphasize your immediate readiness: Your {req.notice_period_days}-day notice period means rapid onboarding.",
        f"Highlight market benchmark: Top tech roles in this tier typically start at {target} LPA.",
        f"Propose alternative levers: If fixed pay is rigid, request a {round(diff_lpa * 0.7, 1)} LPA one-time Joining Bonus or annual performance incentives.",
        "Always express excitement first before presenting counter numbers."
    ]

    return {
        "offered_lpa": offered,
        "target_lpa": target,
        "difference_lpa": diff_lpa,
        "difference_percent": diff_pct,
        "estimated_in_hand_monthly_offered": f"₹{in_hand_offered:,}/month",
        "estimated_in_hand_monthly_target": f"₹{in_hand_target:,}/month",
        "email_draft": email_draft,
        "talking_points": talking_points
    }

@router.get("/history")
def get_interview_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve history of completed AI mock interviews for candidate performance tracking."""
    records = db.query(MockInterview).filter(MockInterview.user_id == current_user.id).order_by(MockInterview.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "role": r.role,
            "difficulty": r.difficulty,
            "total_score": r.total_score,
            "questions_answered": r.questions_answered,
            "feedback_summary": r.feedback_summary,
            "created_at": r.created_at.strftime("%d %b %Y, %I:%M %p") if r.created_at else ""
        }
        for r in records
    ]

@router.get("/scheduled")
def get_scheduled_interviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all upcoming scheduled mock interview sessions."""
    records = db.query(ScheduledInterview).filter(ScheduledInterview.user_id == current_user.id).order_by(ScheduledInterview.scheduled_for.asc()).all()
    return [
        {
            "id": r.id,
            "role": r.role,
            "scheduled_for": r.scheduled_for.strftime("%d %b %Y at %I:%M %p") if r.scheduled_for else "",
            "reminder_channel": r.reminder_channel,
            "is_completed": r.is_completed
        }
        for r in records
    ]
