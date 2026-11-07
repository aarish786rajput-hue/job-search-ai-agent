from fastapi import FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import time

from app.core.database import engine, Base
from app.models.user import User
from app.models.application import JobApplication
from app.models.alert import JobAlert
from app.models.interview import MockInterview, ScheduledInterview
from app.api import auth, resume, applications, agent, alerts, interview, roadmap
from sqlalchemy import inspect, text

# Create all database tables on startup
Base.metadata.create_all(bind=engine)

# Auto-migrate SQLite schema for candidate preference columns if needed
try:
    inspector = inspect(engine)
    if "users" in inspector.get_table_names():
        existing_cols = [c["name"] for c in inspector.get_columns("users")]
        with engine.connect() as conn:
            new_cols = {
                "target_role": "VARCHAR DEFAULT 'Full Stack Developer'",
                "target_salary": "VARCHAR DEFAULT '15 LPA'",
                "preferred_locations": "VARCHAR DEFAULT 'Bengaluru, Remote'",
                "notice_period": "VARCHAR DEFAULT '30 days'",
                "work_mode": "VARCHAR DEFAULT 'Hybrid'",
                "primary_skills": "VARCHAR DEFAULT 'React, Next.js, FastAPI, Python'",
                "experience_years": "VARCHAR DEFAULT '2-4 Years'"
            }
            for col_name, col_type in new_cols.items():
                if col_name not in existing_cols:
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
            conn.commit()
except Exception as e:
    print(f"Database migration notice: {e}")

app = FastAPI(
    title="CareerOrbit AI Agent API",
    version="1.0.0",
    description="AI-powered career assistant backend"
)

# Configure CORS — allow frontend dev server and Vercel domains
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Telemetry & Performance Optimization Middleware ─────────────────────────
SERVER_START_TIME = time.time()
REQUEST_METRICS = {
    "total_requests": 0,
    "total_process_time_ms": 0.0
}

@app.middleware("http")
async def add_performance_telemetry_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    process_time_ms = round(process_time * 1000, 2)
    response.headers["X-Process-Time-Ms"] = str(process_time_ms)
    
    REQUEST_METRICS["total_requests"] += 1
    REQUEST_METRICS["total_process_time_ms"] += process_time_ms
    return response

# Mount routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(resume.router, prefix="/api/resume", tags=["Resume & ATS"])
app.include_router(applications.router, prefix="/api/applications", tags=["Applications ATS"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Job Alerts"])
app.include_router(agent.router, prefix="/api/agent", tags=["LangGraph Agent"])
app.include_router(interview.router, prefix="/api/interview", tags=["AI Mock Interview & Negotiation"])
app.include_router(roadmap.router, prefix="/api/roadmap", tags=["Career Path & Roadmap"])


# ─── Models ───────────────────────────────────────────────────────────────────
class JobListing(BaseModel):
    id: int
    title: str
    company: str
    location: str
    salary: str
    experience: str
    description: str


# ─── Job Data ─────────────────────────────────────────────────────────
MOCK_JOBS = [
    JobListing(id=1, title="Frontend Developer",    company="Tech Solutions", location="Bengaluru", salary="10-15 LPA", experience="2-4 Years",  description="React, Next.js, Tailwind CSS, TypeScript"),
    JobListing(id=2, title="Backend Developer",     company="InnovateX",     location="Mumbai",    salary="12-18 LPA", experience="3-5 Years",  description="Python, FastAPI, PostgreSQL, REST APIs"),
    JobListing(id=3, title="AI Engineer",           company="AI Labs",       location="Bengaluru", salary="20-30 LPA", experience="4-6 Years",  description="LangChain, LangGraph, LLMs, RAG pipelines"),
    JobListing(id=4, title="Data Scientist",        company="DataCorp",      location="Pune",      salary="15-22 LPA", experience="3-5 Years",  description="Machine Learning, Python, SQL, Pandas, Scikit-learn"),
    JobListing(id=5, title="Junior Developer",      company="StartUp Inc",   location="Delhi",     salary="6-9 LPA",  experience="Fresher",    description="JavaScript, HTML, CSS, Git basics"),
    JobListing(id=6, title="DevOps Engineer",       company="CloudBase",     location="Hyderabad", salary="18-25 LPA", experience="3-5 Years",  description="Docker, Kubernetes, CI/CD, AWS/GCP"),
    JobListing(id=7, title="Full Stack Developer",  company="WebCraft",      location="Bengaluru", salary="14-20 LPA", experience="2-4 Years",  description="React, Node.js, MongoDB, Express"),
    JobListing(id=8, title="ML Engineer",           company="NeuralNet Inc", location="Mumbai",    salary="22-32 LPA", experience="4-6 Years",  description="PyTorch, TensorFlow, MLOps, Model Deployment"),
]


# ─── Routes ───────────────────────────────────────────────────────────────────
@app.get("/", tags=["Root"])
def read_root():
    return {
        "message": "Welcome to the Job Search AI Agent API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "database": "connected (SQLite)",
        "total_jobs": len(MOCK_JOBS)
    }


@app.get("/api/metrics", tags=["Performance & Telemetry"])
def get_system_metrics():
    """
    Performance benchmarks: uptime, latency averages, throughput.
    """
    uptime_seconds = int(time.time() - SERVER_START_TIME)
    total_reqs = REQUEST_METRICS["total_requests"]
    avg_latency = (
        round(REQUEST_METRICS["total_process_time_ms"] / total_reqs, 2)
        if total_reqs > 0
        else 0.0
    )
    return {
        "status": "healthy",
        "service": "CareerOrbit Core API",
        "uptime_seconds": uptime_seconds,
        "total_requests_served": total_reqs,
        "average_latency_ms": avg_latency,
        "caching_strategy": "In-memory fast lookup + heuristic fallback",
        "database_engine": "SQLAlchemy ORM + SQLite / PostgreSQL ready"
    }


@app.get("/api/jobs", response_model=List[JobListing], tags=["Jobs"])
def search_jobs(
    title: Optional[str] = Query(None, description="Job title keyword"),
    location: Optional[str] = Query(None, description="Job location"),
    experience: Optional[str] = Query(None, description="Experience level"),
):
    """
    Search and filter job listings.
    - **title**: Filter by job title keyword (partial match)
    - **location**: Filter by city/location (partial match)
    - **experience**: Filter by experience level (e.g., Fresher, 3-5 Years)
    """
    results = MOCK_JOBS

    if title:
        results = [j for j in results if title.lower() in j.title.lower()]
    if location:
        results = [j for j in results if location.lower() in j.location.lower()]
    if experience:
        results = [j for j in results if experience.lower() in j.experience.lower()]

    return results


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
