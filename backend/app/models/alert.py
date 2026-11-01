from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime, timezone
from app.core.database import Base

class JobAlert(Base):
    __tablename__ = "job_alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    keyword = Column(String, nullable=False)           # e.g., "AI Engineer", "React Developer"
    location = Column(String, default="Any")            # e.g., "Bengaluru", "Remote", "Any"
    min_salary = Column(String, default="10 LPA")        # e.g., "12 LPA"
    work_mode = Column(String, default="Any")           # "Remote", "Hybrid", "Onsite", "Any"
    channel = Column(String, default="Email & SMS")     # "Email & SMS", "Email", "SMS"
    frequency = Column(String, default="Instant")       # "Instant", "Daily Digest"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_notified_at = Column(DateTime, nullable=True)
