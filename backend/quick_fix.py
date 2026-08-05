#!/usr/bin/env python3
"""
Quick fix server - minimal and guaranteed to work
"""

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(title="AI Resume Analyzer", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import everything
from models.database import get_db, create_tables
from models.sql_models import Resume as ResumeModel, JobDescription as JobModel, MatchResult as MatchResultModel
from routes.auth import get_current_user
from services.job_matcher import JobMatcher

# Create database tables
create_tables()

# Initialize job matcher
job_matcher = JobMatcher()

# Import all routes
from routes import resume, job, auth, matching, export

# Include all routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(resume.router, prefix="/api/resumes", tags=["resumes"])
app.include_router(job.router, prefix="/api/jobs", tags=["jobs"])
app.include_router(matching.router, prefix="/api/matching", tags=["matching"])
app.include_router(export.router, prefix="/api/export", tags=["export"])

@app.get("/")
async def root():
    return {"message": "AI Resume Analyzer API is running!", "status": "healthy"}

@app.get("/api/test")
async def test():
    return {"status": "success", "message": "Server is working!"}

# Direct matching endpoint for testing
@app.post("/api/matching/match/{job_id}")
async def match_resumes_with_job(
    job_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Match all parsed resumes with a specific job"""
    print(f"🔍 Matching resumes for job {job_id}")
    
    # Get job
    job = db.query(JobModel).filter(
        JobModel.id == job_id,
        JobModel.user_id == current_user.id
    ).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Get all parsed resumes
    resumes = db.query(ResumeModel).filter(
        ResumeModel.user_id == current_user.id,
        ResumeModel.status == "parsed",
        ResumeModel.parsed_at.isnot(None)
    ).all()
    
    if not resumes:
        raise HTTPException(status_code=404, detail="No parsed resumes found")
    
    match_results = []
    
    for resume in resumes:
        try:
            # Create parsed data dict
            parsed_data = {
                "name": resume.parsed_name or "Unknown",
                "email": resume.parsed_email or "",
                "phone": resume.parsed_phone or "",
                "skills": resume.parsed_skills or [],
                "experience": resume.parsed_experience or [],
                "education": resume.parsed_education or [],
                "summary": resume.parsed_summary or ""
            }
            
            # Create job data dict
            job_data = {
                "title": job.title,
                "description": job.description,
                "requirements": job.requirements or [],
                "skills_required": job.skills_required or []
            }
            
            # Match resume with job
            match_result = await job_matcher.match_resume_with_job(parsed_data, job_data)
            
            # Save match result to database
            db_match_result = MatchResultModel(
                resume_id=resume.id,
                job_id=job.id,
                match_percentage=match_result["match_percentage"],
                matched_skills=match_result["matched_skills"],
                missing_skills=match_result["missing_skills"],
                experience_match=float(match_result.get("experience_match", 0.0)),
                analysis=match_result.get("analysis", "")
            )
            
            db.add(db_match_result)
            db.commit()
            
            match_results.append({
                "resume_id": resume.id,
                "resume_name": resume.parsed_name or resume.original_filename,
                "match_percentage": match_result["match_percentage"],
                "matched_skills": match_result["matched_skills"],
                "missing_skills": match_result["missing_skills"],
                "experience_match": match_result["experience_match"],
                "analysis": match_result.get("analysis", "")
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

if __name__ == "__main__":
    print("🚀 Starting Quick Fix Server...")
    print("📍 Server: http://localhost:8000")
    print("🧪 Test: http://localhost:8000/api/test")
    print("🔍 Match: http://localhost:8000/api/matching/match/1")
    print("=" * 50)
    
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
