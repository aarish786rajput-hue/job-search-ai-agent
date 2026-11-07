from sqlalchemy import Column, Integer, String, Boolean
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String, index=True)
    is_active = Column(Boolean, default=True)

    # Comprehensive Career Goals & Preferences (Indian Market Standard)
    target_role = Column(String, default="Full Stack Developer")
    target_salary = Column(String, default="15 LPA")
    preferred_locations = Column(String, default="Bengaluru, Remote")
    notice_period = Column(String, default="30 days")  # Immediate, 30 days, 60 days, 90 days
    work_mode = Column(String, default="Hybrid")        # Remote, Hybrid, Onsite
    primary_skills = Column(String, default="React, Next.js, FastAPI, Python")
    experience_years = Column(String, default="2-4 Years")
