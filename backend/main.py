from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from app.core.database import engine, Base
from app.api import auth

# Create all database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Job Search AI Agent API",
    version="1.0.0",
    description="AI-powered career assistant backend (Track B - Capabl Project)"
)

# Configure CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])


# ─── Models ───────────────────────────────────────────────────────────────────
class JobListing(BaseModel):
    id: int
    title: str
    company: str
    location: str
    salary: str
    experience: str
    description: str


# ─── Mock Job Data (Week 1-2) ─────────────────────────────────────────────────
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
