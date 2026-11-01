from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone

from app.core.database import get_db
from app.models.user import User
from app.models.alert import JobAlert
from app.api.auth import get_current_user

router = APIRouter()

# In-memory notification log for interactive UI demonstrations
NOTIFICATION_LOGS = [
    {
        "id": "notif-1",
        "title": "New Job Match: AI Engineer",
        "message": "AI Labs (Bengaluru) posted a job matching your 'AI Engineer' alert (20-30 LPA).",
        "channel": "Email & SMS",
        "timestamp": "Just now",
        "read": False,
    },
    {
        "id": "notif-2",
        "title": "Daily Alert Digest",
        "message": "3 new Frontend Developer roles matching your criteria were found in Bengaluru & Remote.",
        "channel": "Email",
        "timestamp": "2 hours ago",
        "read": False,
    }
]

class AlertCreate(BaseModel):
    keyword: str
    location: Optional[str] = "Any"
    min_salary: Optional[str] = "10 LPA"
    work_mode: Optional[str] = "Any"
    channel: Optional[str] = "Email & SMS"
    frequency: Optional[str] = "Instant"

class AlertResponse(BaseModel):
    id: int
    user_id: int
    keyword: str
    location: str
    min_salary: str
    work_mode: str
    channel: str
    frequency: str
    is_active: bool
    matched_jobs_count: int = 0
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

def _count_matches(keyword: str, location: str) -> int:
    from main import MOCK_JOBS
    count = 0
    kw = (keyword or "").lower()
    loc = (location or "").lower()
    for j in MOCK_JOBS:
        match_kw = not kw or kw in j.title.lower() or kw in j.description.lower()
        match_loc = not loc or loc == "any" or loc in j.location.lower()
        if match_kw and match_loc:
            count += 1
    return count

@router.get("", response_model=List[AlertResponse])
def get_user_alerts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    alerts = db.query(JobAlert).filter(JobAlert.user_id == current_user.id).all()
    results = []
    for a in alerts:
        res = AlertResponse(
            id=a.id,
            user_id=a.user_id,
            keyword=a.keyword,
            location=a.location,
            min_salary=a.min_salary,
            work_mode=a.work_mode,
            channel=a.channel,
            frequency=a.frequency,
            is_active=a.is_active,
            matched_jobs_count=_count_matches(a.keyword, a.location),
            created_at=a.created_at
        )
        results.append(res)
    return results

@router.post("", response_model=AlertResponse, status_code=201)
def create_job_alert(
    data: AlertCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not data.keyword.strip():
        raise HTTPException(status_code=400, detail="Job keyword is required")

    alert = JobAlert(
        user_id=current_user.id,
        keyword=data.keyword.strip(),
        location=data.location or "Any",
        min_salary=data.min_salary or "10 LPA",
        work_mode=data.work_mode or "Any",
        channel=data.channel or "Email & SMS",
        frequency=data.frequency or "Instant",
        is_active=True
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    # Add notification for alert creation
    NOTIFICATION_LOGS.insert(0, {
        "id": f"notif-{int(datetime.now().timestamp())}",
        "title": f"Job Alert Created: {alert.keyword}",
        "message": f"Alert activated for '{alert.keyword}' in {alert.location}. You will receive notifications via {alert.channel}.",
        "channel": alert.channel,
        "timestamp": "Just now",
        "read": False,
    })

    return AlertResponse(
        id=alert.id,
        user_id=alert.user_id,
        keyword=alert.keyword,
        location=alert.location,
        min_salary=alert.min_salary,
        work_mode=alert.work_mode,
        channel=alert.channel,
        frequency=alert.frequency,
        is_active=alert.is_active,
        matched_jobs_count=_count_matches(alert.keyword, alert.location),
        created_at=alert.created_at
    )

@router.delete("/{alert_id}")
def delete_job_alert(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = db.query(JobAlert).filter(JobAlert.id == alert_id, JobAlert.user_id == current_user.id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    db.delete(alert)
    db.commit()
    return {"message": "Job alert removed successfully"}

@router.patch("/{alert_id}/toggle")
def toggle_job_alert(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = db.query(JobAlert).filter(JobAlert.id == alert_id, JobAlert.user_id == current_user.id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_active = not alert.is_active
    db.commit()
    return {"id": alert.id, "is_active": alert.is_active}

@router.post("/{alert_id}/trigger")
def trigger_test_notification(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = db.query(JobAlert).filter(JobAlert.id == alert_id, JobAlert.user_id == current_user.id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    matches = _count_matches(alert.keyword, alert.location)
    notif_msg = f"Dispatched {alert.channel} notification to {current_user.email}: {matches} active opening(s) match '{alert.keyword}' in {alert.location}."

    NOTIFICATION_LOGS.insert(0, {
        "id": f"notif-{int(datetime.now().timestamp())}",
        "title": f"Live Alert Trigger: {alert.keyword}",
        "message": notif_msg,
        "channel": alert.channel,
        "timestamp": "Just now",
        "read": False,
    })

    return {
        "status": "success",
        "channel": alert.channel,
        "recipient": current_user.email,
        "message": notif_msg,
        "matched_jobs": matches
    }

@router.get("/notifications")
def get_notifications():
    return NOTIFICATION_LOGS

@router.post("/notifications/mark-read")
def mark_notifications_read():
    for n in NOTIFICATION_LOGS:
        n["read"] = True
    return {"status": "success"}
