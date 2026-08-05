from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
    is_active: bool = True
    created_at: datetime

class ResumeBase(BaseModel):
    filename: str
    original_filename: str
    file_path: str
    file_size: int

class ResumeCreate(ResumeBase):
    pass

class ResumeParsed(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: List[str] = []
    experience: List[dict] = []
    education: List[dict] = []
    summary: Optional[str] = None
    parsed_at: datetime

class Resume(ResumeBase):
    id: str
    user_id: str
    parsed_data: Optional[ResumeParsed] = None
    uploaded_at: datetime
    status: str = "uploaded"  # uploaded, parsing, parsed, error
    # Add parsed data fields
    parsed_name: Optional[str] = None
    parsed_email: Optional[str] = None
    parsed_phone: Optional[str] = None
    parsed_skills: Optional[List[str]] = None
    parsed_experience: Optional[List[dict]] = None
    parsed_education: Optional[List[dict]] = None
    parsed_summary: Optional[str] = None
    parsed_at: Optional[datetime] = None

class JobDescriptionBase(BaseModel):
    title: str
    description: str
    requirements: List[str] = []
    skills_required: List[str] = []

class JobDescriptionCreate(JobDescriptionBase):
    pass

class JobDescription(JobDescriptionBase):
    id: str
    user_id: str
    created_at: datetime

class MatchResult(BaseModel):
    resume_id: str
    job_id: str
    match_percentage: float
    matched_skills: List[str]
    missing_skills: List[str]
    experience_match: float
    created_at: datetime

class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
