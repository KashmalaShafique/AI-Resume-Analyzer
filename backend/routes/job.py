from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime
from sqlalchemy.orm import Session
from models.schemas import JobDescription, JobDescriptionCreate, MatchResult
from models.database import get_db
from models.sql_models import JobDescription as JobModel, Resume as ResumeModel, User as UserModel
from routes.auth import get_current_user
from services.job_matcher import JobMatcher

router = APIRouter()

# Initialize job matcher
job_matcher = JobMatcher()

@router.post("/", response_model=JobDescription)
async def create_job_description(
    job: JobDescriptionCreate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_job = JobModel(
        title=job.title,
        description=job.description,
        requirements=job.requirements,
        skills_required=job.skills_required,
        user_id=current_user.id
    )
    
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    
    return {
        "id": str(db_job.id),
        "title": db_job.title,
        "description": db_job.description,
        "requirements": db_job.requirements,
        "skills_required": db_job.skills_required,
        "user_id": str(db_job.user_id),
        "created_at": db_job.created_at
    }

@router.get("/", response_model=List[JobDescription])
async def get_job_descriptions(current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    jobs = db.query(JobModel).filter(JobModel.user_id == current_user.id).all()
    return [
        {
            "id": str(job.id),
            "title": job.title,
            "description": job.description,
            "requirements": job.requirements,
            "skills_required": job.skills_required,
            "user_id": str(job.user_id),
            "created_at": job.created_at
        }
        for job in jobs
    ]

@router.get("/{job_id}", response_model=JobDescription)
async def get_job_description(job_id: int, current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    job = db.query(JobModel).filter(
        JobModel.id == job_id,
        JobModel.user_id == current_user.id
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job description not found")
    
    return {
        "id": str(job.id),
        "title": job.title,
        "description": job.description,
        "requirements": job.requirements,
        "skills_required": job.skills_required,
        "user_id": str(job.user_id),
        "created_at": job.created_at
    }

@router.post("/{job_id}/match")
async def match_resumes_with_job(
    job_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get job description
    job = db.query(JobModel).filter(
        JobModel.id == job_id,
        JobModel.user_id == current_user.id
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job description not found")
    
    # Get all parsed resumes for the user
    resumes = db.query(ResumeModel).filter(
        ResumeModel.user_id == current_user.id,
        ResumeModel.status == "parsed",
        ResumeModel.parsed_at.isnot(None)
    ).all()
    
    if not resumes:
        raise HTTPException(status_code=404, detail="No parsed resumes found")
    
    # Match resumes with job
    match_results = []
    for resume in resumes:
        try:
            # Create parsed data dict for matching
            parsed_data = {
                "name": resume.parsed_name,
                "email": resume.parsed_email,
                "phone": resume.parsed_phone,
                "skills": resume.parsed_skills or [],
                "experience": resume.parsed_experience or [],
                "education": resume.parsed_education or [],
                "summary": resume.parsed_summary
            }
            
            # Create job data dict for matching
            job_data = {
                "title": job.title,
                "description": job.description,
                "requirements": job.requirements or [],
                "skills_required": job.skills_required or []
            }
            
            match_result = await job_matcher.match_resume_with_job(parsed_data, job_data)
            match_results.append({
                "resume_id": str(resume.id),
                "resume_filename": resume.original_filename,
                "match_percentage": match_result["match_percentage"],
                "matched_skills": match_result["matched_skills"],
                "missing_skills": match_result["missing_skills"],
                "experience_match": match_result["experience_match"]
            })
        except Exception as e:
            print(f"Error matching resume {resume.id}: {str(e)}")
            continue
    
    # Sort by match percentage
    match_results.sort(key=lambda x: x["match_percentage"], reverse=True)
    
    return {
        "job_title": job.title,
        "total_resumes": len(resumes),
        "match_results": match_results
    }

@router.delete("/{job_id}")
async def delete_job_description(job_id: int, current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    job = db.query(JobModel).filter(
        JobModel.id == job_id,
        JobModel.user_id == current_user.id
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job description not found")
    
    db.delete(job)
    db.commit()
    return {"message": "Job description deleted successfully"}
