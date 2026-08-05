from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from models.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    resumes = relationship("Resume", back_populates="user")
    jobs = relationship("JobDescription", back_populates="user")

class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default="uploaded")  # uploaded, parsing, parsed, error
    
    # Parsed data (stored as JSON)
    parsed_name = Column(String)
    parsed_email = Column(String)
    parsed_phone = Column(String)
    parsed_skills = Column(JSON)  # List of skills
    parsed_experience = Column(JSON)  # List of experience objects
    parsed_education = Column(JSON)  # List of education objects
    parsed_summary = Column(Text)
    parsed_at = Column(DateTime(timezone=True))
    
    # Relationships
    user = relationship("User", back_populates="resumes")
    match_results = relationship("MatchResult", back_populates="resume")

class JobDescription(Base):
    __tablename__ = "job_descriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    requirements = Column(JSON)  # List of requirements
    skills_required = Column(JSON)  # List of required skills
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="jobs")
    match_results = relationship("MatchResult", back_populates="job")

class MatchResult(Base):
    __tablename__ = "match_results"
    
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("job_descriptions.id"), nullable=False)
    match_percentage = Column(Float, nullable=False)
    matched_skills = Column(JSON)  # List of matched skills
    missing_skills = Column(JSON)  # List of missing skills
    experience_match = Column(Float)
    analysis = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    resume = relationship("Resume", back_populates="match_results")
    job = relationship("JobDescription", back_populates="match_results")
