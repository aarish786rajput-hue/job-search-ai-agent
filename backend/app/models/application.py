from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime, timezone
from app.core.database import Base

class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    job_id = Column(Integer, nullable=False)
    job_title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    location = Column(String, default="")
    salary = Column(String, default="")
    status = Column(String, default="Saved")  # "Saved", "Applied", "Interviewing", "Offer", "Rejected"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
