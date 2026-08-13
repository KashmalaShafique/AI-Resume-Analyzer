from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List
import os
import aiofiles
from datetime import datetime
from sqlalchemy.orm import Session
from models.schemas import Resume, ResumeCreate, ResumeParsed
from models.database import get_db
from models.sql_models import Resume as ResumeModel, User as UserModel
from routes.auth import get_current_user
from services.resume_parser import ResumeParser

router = APIRouter()

# Initialize resume parser
resume_parser = ResumeParser()

# Match the /tmp/uploads directory defined in main.py (Vercel only allows writes to /tmp)
UPLOAD_DIR = "/tmp/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=Resume)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate file type
    allowed_extensions = ['.pdf', '.docx', '.doc']
    file_extension = os.path.splitext(file.filename)[1].lower()
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are allowed"
        )
    
    # Generate unique filename
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Save file
    try:
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")
    
    # Create resume record
    db_resume = ResumeModel(
        filename=filename,
        original_filename=file.filename,
        file_path=file_path,
        file_size=len(content),
        user_id=current_user.id,
        status="uploaded"
    )
    
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    
    return {
        "id": str(db_resume.id),
        "filename": db_resume.filename,
        "original_filename": db_resume.original_filename,
        "file_path": db_resume.file_path,
        "file_size": db_resume.file_size,
        "user_id": str(db_resume.user_id),
        "uploaded_at": db_resume.uploaded_at,
        "status": db_resume.status
    }

@router.get("/", response_model=List[Resume])
async def get_resumes(current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    resumes = db.query(ResumeModel).filter(ResumeModel.user_id == current_user.id).all()
    
    print(f"📤 Sending {len(resumes)} resumes to frontend:")
    for resume in resumes:
        print(f"   Resume {resume.id}: Status={resume.status}, Name={resume.parsed_name}, Email={resume.parsed_email}, Skills={len(resume.parsed_skills) if resume.parsed_skills else 0}")
    
    return [
        {
            "id": str(resume.id),
            "filename": resume.filename,
            "original_filename": resume.original_filename,
            "file_path": resume.file_path,
            "file_size": resume.file_size,
            "user_id": str(resume.user_id),
            "uploaded_at": resume.uploaded_at,
            "status": resume.status,
            "parsed_name": resume.parsed_name,
            "parsed_email": resume.parsed_email,
            "parsed_phone": resume.parsed_phone,
            "parsed_skills": resume.parsed_skills,
            "parsed_experience": resume.parsed_experience,
            "parsed_education": resume.parsed_education,
            "parsed_summary": resume.parsed_summary,
            "parsed_at": resume.parsed_at
        }
        for resume in resumes
    ]

@router.get("/{resume_id}", response_model=Resume)
async def get_resume(resume_id: int, current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(ResumeModel).filter(
        ResumeModel.id == resume_id,
        ResumeModel.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    return {
        "id": str(resume.id),
        "filename": resume.filename,
        "original_filename": resume.original_filename,
        "file_path": resume.file_path,
        "file_size": resume.file_size,
        "user_id": str(resume.user_id),
        "uploaded_at": resume.uploaded_at,
        "status": resume.status
    }

@router.post("/{resume_id}/parse")
async def parse_resume(resume_id: int, current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(ResumeModel).filter(
        ResumeModel.id == resume_id,
        ResumeModel.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    resume.status = "parsing"
    db.commit()
    
    try:
        parsed_data = await resume_parser.parse_resume(resume.file_path)
        
        resume.parsed_name = parsed_data.name
        resume.parsed_email = parsed_data.email
        resume.parsed_phone = parsed_data.phone
        resume.parsed_skills = parsed_data.skills
        resume.parsed_experience = parsed_data.experience
        resume.parsed_education = parsed_data.education
        resume.parsed_summary = parsed_data.summary
        resume.parsed_at = parsed_data.parsed_at
        resume.status = "parsed"
        db.commit()
        
        return {"message": "Resume parsed successfully", "parsed_data": parsed_data.dict()}
    
    except Exception as e:
        resume.status = "error"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Error parsing resume: {str(e)}")

@router.delete("/{resume_id}")
async def delete_resume(resume_id: int, current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(ResumeModel).filter(
        ResumeModel.id == resume_id,
        ResumeModel.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    try:
        if os.path.exists(resume.file_path):
            os.remove(resume.file_path)
    except Exception as e:
        print(f"Error deleting file: {str(e)}")
    
    db.delete(resume)
    db.commit()
    
    return {"message": "Resume deleted successfully"}