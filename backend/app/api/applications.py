from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.user import User
from app.models.application import JobApplication
from app.api.auth import get_current_user

router = APIRouter()

class ApplicationCreate(BaseModel):
    job_id: int
    job_title: str
    company: str
    location: Optional[str] = ""
    salary: Optional[str] = ""
    status: Optional[str] = "Saved"

class ApplicationUpdate(BaseModel):
    status: str

class ApplicationResponse(BaseModel):
    id: int
    user_id: int
    job_id: int
    job_title: str
    company: str
    location: str
    salary: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("", response_model=List[ApplicationResponse])
def get_user_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all saved/applied jobs for the logged in candidate."""
    return db.query(JobApplication).filter(JobApplication.user_id == current_user.id).order_by(JobApplication.created_at.desc()).all()

@router.post("", response_model=ApplicationResponse, status_code=201)
def track_job(
    app_data: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save or apply to a job listing."""
    # Check if already tracked
    existing = db.query(JobApplication).filter(
        JobApplication.user_id == current_user.id,
        JobApplication.job_id == app_data.job_id
    ).first()

    if existing:
        # Update status if already exists
        existing.status = app_data.status
        db.commit()
        db.refresh(existing)
        return existing

    new_app = JobApplication(
        user_id=current_user.id,
        job_id=app_data.job_id,
        job_title=app_data.job_title,
        company=app_data.company,
        location=app_data.location or "",
        salary=app_data.salary or "",
        status=app_data.status or "Saved"
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return new_app

@router.patch("/{app_id}", response_model=ApplicationResponse)
def update_application_status(
    app_id: int,
    update: ApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update job application status (Saved -> Applied -> Interviewing -> Offer)."""
    app = db.query(JobApplication).filter(
        JobApplication.id == app_id,
        JobApplication.user_id == current_user.id
    ).first()

    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    app.status = update.status
    db.commit()
    db.refresh(app)
    return app

@router.delete("/{app_id}", status_code=204)
def delete_application(
    app_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a tracked job."""
    app = db.query(JobApplication).filter(
        JobApplication.id == app_id,
        JobApplication.user_id == current_user.id
    ).first()

    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    db.delete(app)
    db.commit()
    return None
