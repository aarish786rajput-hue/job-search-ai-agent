from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any

router = APIRouter()

ROLE_BENCHMARK_SKILLS: Dict[str, Dict[str, Any]] = {
    "ai engineer": {
        "required_skills": ["Python", "LangChain", "LangGraph", "Vector Databases", "Embeddings", "RAG Pipelines", "Docker", "FastAPI"],
        "roadmap": [
            {"week": "Phase 1: Foundations & Architecture", "focus": "Cyclic state graphs with LangGraph, state schemas, and conditional edges.", "project": "Build a stateful conversational assistant with memory."},
            {"week": "Phase 2: Advanced Retrieval & RAG", "focus": "Hybrid search (BM25 + Chroma/Pinecone), cross-encoder re-ranking, and chunking strategies.", "project": "PDF document Q&A engine with citation grounding."},
            {"week": "Phase 3: Tool Use & Agentic Workflows", "focus": "Function calling, dynamic tool dispatch, and human-in-the-loop validation.", "project": "Multi-tool research agent with web search & calculation."},
            {"week": "Phase 4: Evaluation & Productionization", "focus": "RAGAS framework, latency optimization with Redis caching, and Docker deployment.", "project": "Production-ready API service with latency benchmarks."}
        ]
    },
    "full stack developer": {
        "required_skills": ["React", "Next.js", "TypeScript", "Tailwind CSS", "FastAPI", "SQLAlchemy", "PostgreSQL", "Docker", "CI/CD"],
        "roadmap": [
            {"week": "Phase 1: Modern Frontend Architecture", "focus": "Next.js App Router, React Server Components (RSC), and state management.", "project": "High-performance job portal dashboard with glassmorphism UI."},
            {"week": "Phase 2: Resilient RESTful APIs", "focus": "FastAPI asynchronous handlers, Pydantic v2 schemas, and JWT authentication.", "project": "Complete Auth & Profile microservice with PBKDF2 hashing."},
            {"week": "Phase 3: Database & Performance", "focus": "SQLAlchemy relationships, query indexing, and eliminating N+1 queries.", "project": "Optimized multi-tenant application tracking database."},
            {"week": "Phase 4: DevOps & Cloud Delivery", "focus": "Docker containerization, GitHub Actions CI/CD pipelines, and Vercel edge deployment.", "project": "Zero-downtime deployment pipeline with automated test suites."}
        ]
    },
    "backend developer": {
        "required_skills": ["Python", "FastAPI", "PostgreSQL", "Redis", "Celery", "Docker", "System Design", "Microservices"],
        "roadmap": [
            {"week": "Phase 1: High-Throughput APIs", "focus": "FastAPI async endpoints, dependency injection, and middleware telemetry.", "project": "Rate-limited API gateway with Bearer token authentication."},
            {"week": "Phase 2: Caching & Asynchronous Tasks", "focus": "Redis key-value caching and Celery task queues for long-running jobs.", "project": "Background email and notification dispatcher with worker queues."},
            {"week": "Phase 3: Distributed Database Patterns", "focus": "Database transactions, optimistic locking, connection pooling, and indexing.", "project": "High-concurrency booking engine handling race conditions."},
            {"week": "Phase 4: Scalable System Design", "focus": "Microservices decomposition, message queues, and load balancing principles.", "project": "End-to-end scalable backend architecture with documentation."}
        ]
    }
}

class RoadmapRequest(BaseModel):
    target_role: str
    current_skills: str

@router.post("/analyze")
def analyze_skill_gap_and_roadmap(req: RoadmapRequest):
    role_key = req.target_role.lower().strip()
    benchmark = ROLE_BENCHMARK_SKILLS.get(role_key, ROLE_BENCHMARK_SKILLS["full stack developer"])

    user_skills_list = [s.strip().lower() for s in req.current_skills.split(",") if s.strip()]
    req_skills = benchmark["required_skills"]

    matched = []
    missing = []
    for r in req_skills:
        if any(r.lower() in u or u in r.lower() for u in user_skills_list):
            matched.append(r)
        else:
            missing.append(r)

    match_percentage = round((len(matched) / len(req_skills)) * 100) if req_skills else 50

    return {
        "target_role": req.target_role,
        "match_percentage": match_percentage,
        "matched_skills": matched,
        "missing_skills": missing,
        "total_required": len(req_skills),
        "roadmap": benchmark["roadmap"]
    }
