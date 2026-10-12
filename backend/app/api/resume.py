from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from app.services.resume_parser import extract_text_from_pdf, analyze_resume_text

router = APIRouter()

class ResumeAnalysisResponse(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: List[str]
    total_skills_found: int
    sections_detected: Dict[str, bool]
    ats_score: int
    rating: str
    strengths: List[str]
    improvements: List[str]
    word_count: int

class JobMatchRequest(BaseModel):
    user_skills: List[str]
    job_description: str
    job_title: str

class JobMatchResult(BaseModel):
    match_percentage: int
    matched_skills: List[str]
    missing_skills: List[str]
    recommendation: str

@router.post("/upload", response_model=ResumeAnalysisResponse)
async def upload_resume(file: UploadFile = File(...)):
    """Upload PDF or TXT resume and get automated ATS & skills extraction."""
    filename = file.filename.lower()
    
    if not (filename.endswith(".pdf") or filename.endswith(".txt")):
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Please upload a PDF or TXT resume."
        )

    content = await file.read()
    
    if len(content) > 5 * 1024 * 1024:  # 5MB limit
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB.")

    extracted_text = ""
    if filename.endswith(".pdf"):
        try:
            extracted_text = extract_text_from_pdf(content)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Could not read PDF: {str(e)}")
    else:
        extracted_text = content.decode("utf-8", errors="ignore")

    if not extracted_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Could not extract readable text from this resume. Please ensure it is not a scanned image."
        )

    analysis = analyze_resume_text(extracted_text)
    return analysis

@router.post("/analyze-text", response_model=ResumeAnalysisResponse)
def analyze_text(text: str = Form(...)):
    """Analyze plain text resume pasted by user."""
    if not text.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty.")
    return analyze_resume_text(text)

@router.post("/match", response_model=JobMatchResult)
def match_resume_to_job(req: JobMatchRequest):
    """Calculate skill match percentage against a job."""
    from app.services.resume_parser import extract_skills

    job_text = f"{req.job_title} {req.job_description}"
    required_skills = extract_skills(job_text)
    
    user_skills_lower = {s.lower() for s in req.user_skills}
    matched = [s for s in required_skills if s.lower() in user_skills_lower]
    missing = [s for s in required_skills if s.lower() not in user_skills_lower]

    if not required_skills:
        pct = 75
    else:
        pct = int((len(matched) / len(required_skills)) * 100)
    
    pct = max(min(pct, 100), 20)

    if pct >= 80:
        rec = "High Match! You are a strong candidate for this position."
    elif pct >= 50:
        rec = "Moderate Match. Consider tailoring your resume with missing keywords."
    else:
        rec = "Low Match. Upskilling in required tools is recommended."

    return {
        "match_percentage": pct,
        "matched_skills": matched,
        "missing_skills": missing,
        "recommendation": rec
    }
