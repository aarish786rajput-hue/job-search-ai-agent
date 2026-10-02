from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="Job Search AI Agent API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class JobListing(BaseModel):
    id: int
    title: str
    company: str
    location: str
    salary: str
    experience: str
    description: str

# Mock Database for Week 1
MOCK_JOBS = [
    JobListing(id=1, title="Frontend Developer", company="Tech Solutions", location="Bengaluru", salary="10-15 LPA", experience="2-4 Years", description="React, Next.js, Tailwind CSS"),
    JobListing(id=2, title="Backend Developer", company="InnovateX", location="Mumbai", salary="12-18 LPA", experience="3-5 Years", description="Python, FastAPI, PostgreSQL"),
    JobListing(id=3, title="AI Engineer", company="AI Labs", location="Bengaluru", salary="20-30 LPA", experience="4-6 Years", description="LangChain, LangGraph, LLMs"),
    JobListing(id=4, title="Data Scientist", company="DataCorp", location="Pune", salary="15-22 LPA", experience="3-5 Years", description="Machine Learning, Python, SQL"),
    JobListing(id=5, title="Junior Developer", company="StartUp Inc", location="Delhi", salary="6-9 LPA", experience="Fresher", description="JavaScript, HTML, CSS"),
]

@app.get("/")
def read_root():
    return {"message": "Welcome to the Job Search AI Agent API (Track B)"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "database": "disconnected", "redis": "disconnected"}

@app.get("/api/jobs", response_model=List[JobListing])
def search_jobs(
    title: Optional[str] = Query(None, description="Job title keyword"),
    location: Optional[str] = Query(None, description="Job location"),
    experience: Optional[str] = Query(None, description="Experience level")
):
    """
    Mock endpoint to search jobs based on filters (Week 1 functionality).
    """
    results = MOCK_JOBS
    
    if title:
        results = [job for job in results if title.lower() in job.title.lower()]
    if location:
        results = [job for job in results if location.lower() in job.location.lower()]
    if experience:
        results = [job for job in results if experience.lower() in job.experience.lower()]
        
    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
