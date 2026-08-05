from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from models.database import get_db
from models.sql_models import Resume as ResumeModel, JobDescription as JobModel, MatchResult as MatchResultModel
from routes.auth import get_current_user
from services.job_matcher import JobMatcher
from services.resume_parser import ResumeParser
import json

router = APIRouter()

# Initialize services
job_matcher = JobMatcher()
resume_parser = ResumeParser()

@router.get("/test")
async def test_matching():
    """Test endpoint to verify matching functionality"""
    print("🧪 TEST ENDPOINT CALLED - Matching routes are working!")
    return {"message": "Matching routes are working!", "status": "success"}

@router.get("/debug")
async def debug_matching():
    """Debug endpoint to check route registration"""
    print("🔍 DEBUG ENDPOINT CALLED")
    return {
        "message": "Matching debug endpoint is working",
        "available_routes": [
            "GET /api/matching/test",
            "GET /api/matching/debug", 
            "POST /api/matching/parse/{resume_id}",
            "POST /api/matching/match/{job_id}",
            "GET /api/matching/results/{job_id}"
        ]
    }

@router.get("/test-detailed")
async def test_matching_detailed():
    """Test endpoint with detailed matching functionality"""
    test_resume = {
        "name": "John Doe",
        "email": "john@example.com",
        "skills": ["Python", "JavaScript", "React"],
        "experience": [{"title": "Developer", "company": "Tech Corp"}],
        "summary": "Experienced developer with Python and React skills"
    }
    
    test_job = {
        "title": "Python Developer",
        "description": "Looking for a Python developer with React experience",
        "skills_required": ["Python", "React", "JavaScript"],
        "requirements": ["2+ years experience"]
    }
    
    try:
        result = await job_matcher.match_resume_with_job(test_resume, test_job)
        return {"status": "success", "test_result": result}
    except Exception as e:
        return {"status": "error", "error": str(e)}

@router.post("/parse/{resume_id}")
async def parse_resume_with_ai(
    resume_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Parse a resume using AI to extract key information"""
    # Get resume
    resume = db.query(ResumeModel).filter(
        ResumeModel.id == resume_id,
        ResumeModel.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    try:
        # Parse resume using AI
        parsed_data = await resume_parser.parse_resume(resume.file_path)
        
        # Update resume with parsed data
        resume.parsed_name = parsed_data.name
        resume.parsed_email = parsed_data.email
        resume.parsed_phone = parsed_data.phone
        resume.parsed_skills = parsed_data.skills
        resume.parsed_experience = parsed_data.experience
        resume.parsed_education = parsed_data.education
        resume.parsed_summary = parsed_data.summary
        resume.status = "parsed"
        db.commit()
        
        # Debug: Print what was saved
        print(f"✅ Database updated for resume {resume_id}:")
        print(f"   Name: {resume.parsed_name}")
        print(f"   Email: {resume.parsed_email}")
        print(f"   Phone: {resume.parsed_phone}")
        print(f"   Skills: {resume.parsed_skills}")
        print(f"   Summary: {resume.parsed_summary}")
        print(f"   Status: {resume.status}")
        
        return {
            "message": "Resume parsed successfully",
            "parsed_data": parsed_data.dict()
        }
    
    except Exception as e:
        resume.status = "error"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Error parsing resume: {str(e)}")

@router.post("/match/{job_id}")
async def match_resumes_with_job(
    job_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Match all parsed resumes with a specific job"""
    print(f"🔍 MATCHING DEBUG - Starting match for job_id: {job_id}")
    print(f"🔍 Current user: {current_user.id} ({current_user.username})")
    
    # Get job
    print(f"🔍 Looking for job with ID: {job_id}")
    job = db.query(JobModel).filter(
        JobModel.id == job_id,
        JobModel.user_id == current_user.id
    ).first()
    
    if not job:
        print(f"❌ Job not found for ID: {job_id}, User: {current_user.id}")
        # Let's see what jobs exist
        all_jobs = db.query(JobModel).filter(JobModel.user_id == current_user.id).all()
        print(f"🔍 Available jobs for user {current_user.id}:")
        for j in all_jobs:
            print(f"   Job ID: {j.id}, Title: {j.title}")
        raise HTTPException(status_code=404, detail="Job not found")
    
    print(f"✅ Found job: {job.title} (ID: {job.id})")
    
    # Get all parsed resumes - be more flexible with the criteria
    print(f"🔍 Looking for parsed resumes for user: {current_user.id}")
    resumes = db.query(ResumeModel).filter(
        ResumeModel.user_id == current_user.id,
        ResumeModel.status == "parsed"
    ).all()
    
    # Filter out resumes that don't have any parsed data
    resumes_with_data = []
    for resume in resumes:
        has_parsed_data = (
            resume.parsed_name or 
            resume.parsed_email or 
            resume.parsed_skills or 
            resume.parsed_summary
        )
        if has_parsed_data:
            resumes_with_data.append(resume)
    
    resumes = resumes_with_data
    
    print(f"🔍 Found {len(resumes)} parsed resumes with data")
    for resume in resumes:
        print(f"   Resume ID: {resume.id}")
        print(f"     Name: {resume.parsed_name}")
        print(f"     Email: {resume.parsed_email}")
        print(f"     Skills: {resume.parsed_skills}")
        print(f"     Summary: {resume.parsed_summary[:50] if resume.parsed_summary else 'None'}...")
        print(f"     Status: {resume.status}")
        print(f"     Parsed At: {resume.parsed_at}")
    
    if not resumes:
        # Let's see what resumes exist
        all_resumes = db.query(ResumeModel).filter(ResumeModel.user_id == current_user.id).all()
        print(f"🔍 All resumes for user {current_user.id}:")
        for r in all_resumes:
            print(f"   Resume ID: {r.id}, Status: {r.status}, Parsed: {r.parsed_at is not None}")
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
            import traceback
            traceback.print_exc()
            continue
    
    # Sort by match percentage
    match_results.sort(key=lambda x: x["match_percentage"], reverse=True)
    
    return {
        "job_title": job.title,
        "total_resumes": len(resumes),
        "match_results": match_results
    }

@router.get("/results/{job_id}")
async def get_match_results(
    job_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get match results for a specific job"""
    # Get job
    job = db.query(JobModel).filter(
        JobModel.id == job_id,
        JobModel.user_id == current_user.id
    ).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Get match results
    match_results = db.query(MatchResultModel).filter(
        MatchResultModel.job_id == job_id
    ).order_by(MatchResultModel.match_percentage.desc()).all()
    
    results = []
    for match in match_results:
        resume = db.query(ResumeModel).filter(ResumeModel.id == match.resume_id).first()
        if resume:
            results.append({
                "resume_id": match.resume_id,
                "resume_name": resume.parsed_name or resume.original_filename,
                "match_percentage": match.match_percentage,
                "matched_skills": match.matched_skills,
                "missing_skills": match.missing_skills,
                "experience_match": match.experience_match,
                "analysis": match.analysis,
                "created_at": match.created_at
            })
    
    return {
        "job_title": job.title,
        "total_matches": len(results),
        "results": results
    }

@router.get("/search")
async def search_resumes(
    skills: str = None,
    min_match: float = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Search and filter resumes by skills or match score"""
    query = db.query(ResumeModel).filter(
        ResumeModel.user_id == current_user.id,
        ResumeModel.status == "parsed"
    )
    
    # Filter by skills
    if skills:
        skill_list = [skill.strip().lower() for skill in skills.split(',')]
        # This is a simplified search - in production, you'd want more sophisticated matching
        query = query.filter(
            ResumeModel.parsed_skills.op('?')(skill_list)
        )
    
    resumes = query.all()
    
    results = []
    for resume in resumes:
        # Get latest match results for this resume
        latest_match = db.query(MatchResultModel).filter(
            MatchResultModel.resume_id == resume.id
        ).order_by(MatchResultModel.created_at.desc()).first()
        
        match_percentage = latest_match.match_percentage if latest_match else 0
        
        # Filter by minimum match percentage
        if min_match is not None and match_percentage < min_match:
            continue
        
        results.append({
            "id": resume.id,
            "name": resume.parsed_name or resume.original_filename,
            "email": resume.parsed_email,
            "skills": resume.parsed_skills or [],
            "summary": resume.parsed_summary,
            "match_percentage": match_percentage,
            "uploaded_at": resume.uploaded_at
        })
    
    # Sort by match percentage if available
    results.sort(key=lambda x: x["match_percentage"], reverse=True)
    
    return {
        "total_found": len(results),
        "resumes": results
    }
