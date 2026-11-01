from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from datetime import datetime, timezone
from app.core.database import Base

class MockInterview(Base):
    __tablename__ = "mock_interviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    role = Column(String, nullable=False)
    difficulty = Column(String, default="Mid-Level")
    total_score = Column(Float, default=0.0)
    questions_answered = Column(Integer, default=0)
    feedback_summary = Column(Text, default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ScheduledInterview(Base):
    __tablename__ = "scheduled_interviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    role = Column(String, nullable=False)
    scheduled_for = Column(DateTime, nullable=False)
    reminder_channel = Column(String, default="Email & Google Calendar")
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
