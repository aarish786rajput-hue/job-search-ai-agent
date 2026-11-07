from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from typing import Optional

from app.core.database import get_db
from app.models.user import User
from app.models.application import JobApplication
from app.models.alert import JobAlert
from app.models.interview import MockInterview, ScheduledInterview

SECRET_KEY = "careerorbit-job-search-ai-secret-2025"  # Move to .env in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

router = APIRouter()


class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool
    target_role: Optional[str] = "Full Stack Developer"
    target_salary: Optional[str] = "15 LPA"
    preferred_locations: Optional[str] = "Bengaluru, Remote"
    notice_period: Optional[str] = "30 days"
    work_mode: Optional[str] = "Hybrid"
    primary_skills: Optional[str] = "React, Next.js, FastAPI, Python"
    experience_years: Optional[str] = "2-4 Years"

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    target_role: Optional[str] = None
    target_salary: Optional[str] = None
    preferred_locations: Optional[str] = None
    notice_period: Optional[str] = None
    work_mode: Optional[str] = None
    primary_skills: Optional[str] = None
    experience_years: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired, please log in again")
    except jwt.InvalidTokenError:
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user


@router.post("/register", status_code=201)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Validate password length
    if len(user.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    hashed_pwd = get_password_hash(user.password)
    new_user = User(
        email=user.email,
        hashed_password=hashed_pwd,
        full_name=user.full_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Account created successfully! Please log in."}


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserResponse)
def update_profile(
    data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if data.full_name is not None:
        current_user.full_name = data.full_name
    if data.target_role is not None:
        current_user.target_role = data.target_role
    if data.target_salary is not None:
        current_user.target_salary = data.target_salary
    if data.preferred_locations is not None:
        current_user.preferred_locations = data.preferred_locations
    if data.notice_period is not None:
        current_user.notice_period = data.notice_period
    if data.work_mode is not None:
        current_user.work_mode = data.work_mode
    if data.primary_skills is not None:
        current_user.primary_skills = data.primary_skills
    if data.experience_years is not None:
        current_user.experience_years = data.experience_years

    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/export-data")
def export_user_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    GDPR & Indian DPDP Act 2023 Compliance — Data Portability.
    Exports all personal candidate data, applications, alerts, and interview sessions.
    """
    apps = db.query(JobApplication).filter(JobApplication.user_id == current_user.id).all()
    alerts = db.query(JobAlert).filter(JobAlert.user_id == current_user.id).all()
    interviews = db.query(MockInterview).filter(MockInterview.user_id == current_user.id).all()
    scheduled = db.query(ScheduledInterview).filter(ScheduledInterview.user_id == current_user.id).all()

    return {
        "export_date": datetime.now(timezone.utc).isoformat(),
        "compliance_standard": "GDPR Article 20 / DPDP Act 2023",
        "profile": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "target_role": current_user.target_role,
            "target_salary": current_user.target_salary,
            "preferred_locations": current_user.preferred_locations,
            "notice_period": current_user.notice_period,
            "work_mode": current_user.work_mode,
            "primary_skills": current_user.primary_skills,
            "experience_years": current_user.experience_years
        },
        "job_applications": [
            {
                "job_title": a.job_title,
                "company": a.company,
                "location": a.location,
                "salary": a.salary,
                "status": a.status,
                "created_at": a.created_at.isoformat() if a.created_at else None
            }
            for a in apps
        ],
        "job_alerts": [
            {
                "keyword": al.keyword,
                "location": al.location,
                "min_salary": al.min_salary,
                "work_mode": al.work_mode,
                "channel": al.channel,
                "is_active": al.is_active
            }
            for al in alerts
        ],
        "mock_interviews": [
            {
                "role": iv.role,
                "difficulty": iv.difficulty,
                "total_score": iv.total_score,
                "feedback_summary": iv.feedback_summary,
                "created_at": iv.created_at.isoformat() if iv.created_at else None
            }
            for iv in interviews
        ],
        "scheduled_interviews": [
            {
                "role": sc.role,
                "scheduled_for": sc.scheduled_for.isoformat() if sc.scheduled_for else None,
                "reminder_channel": sc.reminder_channel
            }
            for sc in scheduled
        ]
    }


@router.delete("/delete-account")
def delete_user_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    GDPR Article 17 — Right to Erasure ('Right to be Forgotten').
    Permanently purges the candidate's account and all associated applications, alerts, and interview records.
    """
    # Delete cascade
    db.query(JobApplication).filter(JobApplication.user_id == current_user.id).delete()
    db.query(JobAlert).filter(JobAlert.user_id == current_user.id).delete()
    db.query(MockInterview).filter(MockInterview.user_id == current_user.id).delete()
    db.query(ScheduledInterview).filter(ScheduledInterview.user_id == current_user.id).delete()
    db.query(User).filter(User.id == current_user.id).delete()
    db.commit()

    return {
        "status": "success",
        "message": "Your candidate account and all associated data have been permanently erased in compliance with GDPR / DPDP Act."
    }
