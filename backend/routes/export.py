from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from models.database import get_db
from models.sql_models import Resume as ResumeModel, JobDescription as JobModel, MatchResult as MatchResultModel
from routes.auth import get_current_user
import csv
import io
from typing import List, Dict, Any
import json

router = APIRouter()

@router.get("/resumes/csv")
async def export_resumes_csv(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export all resumes as CSV"""
    resumes = db.query(ResumeModel).filter(
        ResumeModel.user_id == current_user.id
    ).all()
    
    # Create CSV content
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        'ID', 'Name', 'Email', 'Phone', 'Skills', 'Experience', 
        'Education', 'Summary', 'Status', 'Uploaded At'
    ])
    
    # Write data
    for resume in resumes:
        writer.writerow([
            resume.id,
            resume.parsed_name or resume.original_filename,
            resume.parsed_email or '',
            resume.parsed_phone or '',
            ', '.join(resume.parsed_skills) if resume.parsed_skills else '',
            json.dumps(resume.parsed_experience) if resume.parsed_experience else '',
            json.dumps(resume.parsed_education) if resume.parsed_education else '',
            resume.parsed_summary or '',
            resume.status,
            resume.uploaded_at.strftime('%Y-%m-%d %H:%M:%S') if resume.uploaded_at else ''
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=resumes.csv"}
    )

@router.get("/matches/csv/{job_id}")
async def export_match_results_csv(
    job_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export match results for a specific job as CSV"""
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
    
    # Create CSV content
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        'Resume ID', 'Resume Name', 'Match Percentage', 'Matched Skills', 
        'Missing Skills', 'Experience Match', 'Analysis', 'Created At'
    ])
    
    # Write data
    for match in match_results:
        resume = db.query(ResumeModel).filter(ResumeModel.id == match.resume_id).first()
        resume_name = resume.parsed_name if resume and resume.parsed_name else f"Resume {match.resume_id}"
        
        writer.writerow([
            match.resume_id,
            resume_name,
            f"{match.match_percentage:.2f}%",
            ', '.join(match.matched_skills) if match.matched_skills else '',
            ', '.join(match.missing_skills) if match.missing_skills else '',
            f"{match.experience_match:.2f}" if match.experience_match else '',
            match.analysis or '',
            match.created_at.strftime('%Y-%m-%d %H:%M:%S') if match.created_at else ''
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=job_{job_id}_matches.csv"}
    )

@router.get("/dashboard/summary")
async def get_dashboard_summary(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashboard summary statistics"""
    # Count resumes by status
    total_resumes = db.query(ResumeModel).filter(ResumeModel.user_id == current_user.id).count()
    parsed_resumes = db.query(ResumeModel).filter(
        ResumeModel.user_id == current_user.id,
        ResumeModel.status == "parsed"
    ).count()
    
    # Count jobs
    total_jobs = db.query(JobModel).filter(JobModel.user_id == current_user.id).count()
    
    # Count match results
    total_matches = db.query(MatchResultModel).join(ResumeModel).filter(
        ResumeModel.user_id == current_user.id
    ).count()
    
    # Get recent activity
    recent_resumes = db.query(ResumeModel).filter(
        ResumeModel.user_id == current_user.id
    ).order_by(ResumeModel.uploaded_at.desc()).limit(5).all()
    
    recent_jobs = db.query(JobModel).filter(
        JobModel.user_id == current_user.id
    ).order_by(JobModel.created_at.desc()).limit(5).all()
    
    return {
        "statistics": {
            "total_resumes": total_resumes,
            "parsed_resumes": parsed_resumes,
            "total_jobs": total_jobs,
            "total_matches": total_matches
        },
        "recent_resumes": [
            {
                "id": resume.id,
                "name": resume.parsed_name or resume.original_filename,
                "status": resume.status,
                "uploaded_at": resume.uploaded_at
            }
            for resume in recent_resumes
        ],
        "recent_jobs": [
            {
                "id": job.id,
                "title": job.title,
                "created_at": job.created_at
            }
            for job in recent_jobs
        ]
    }
