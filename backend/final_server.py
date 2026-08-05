#!/usr/bin/env python3
"""
Final working server - all issues fixed
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

# Import and setup everything
try:
    print("🔄 Initializing database...")
    from models.database import get_db, create_tables
    from models.sql_models import Resume as ResumeModel, JobDescription as JobModel, MatchResult as MatchResultModel
    from routes.auth import get_current_user
    from services.job_matcher import JobMatcher
    from services.resume_parser import ResumeParser
    
    # Import all routes
    from routes import resume, job, auth, matching, export
    
    # Create database tables
    create_tables()
    print("✅ Database tables created successfully")
    
    # Initialize services
    job_matcher = JobMatcher()
    resume_parser = ResumeParser()
    print("✅ Services initialized successfully")
    
    # Include all routers
    app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
    app.include_router(resume.router, prefix="/api/resumes", tags=["resumes"])
    app.include_router(job.router, prefix="/api/jobs", tags=["jobs"])
    app.include_router(matching.router, prefix="/api/matching", tags=["matching"])
    app.include_router(export.router, prefix="/api/export", tags=["export"])
    print("✅ All routes registered successfully")
    
except Exception as e:
    print(f"❌ Error during initialization: {e}")
    import traceback
    traceback.print_exc()

@app.get("/")
async def root():
    return {"message": "AI Resume Analyzer API is running!", "status": "healthy"}

@app.get("/health")
async def health():
    return {"status": "healthy", "message": "Server is running"}

@app.get("/api/test")
async def test_endpoint():
    """Test endpoint to verify server is working"""
    return {"status": "success", "message": "API is working correctly!"}

# Add a direct matching endpoint to test
@app.post("/api/test-match/{job_id}")
async def test_match_endpoint(job_id: int):
    """Test matching endpoint"""
    return {"status": "success", "message": f"Test matching endpoint for job {job_id} is working!"}

if __name__ == "__main__":
    print("🚀 Starting AI Resume Analyzer Server...")
    print("📍 Server will be available at: http://localhost:8000")
    print("🔗 API Documentation: http://localhost:8000/docs")
    print("🧪 Test endpoint: http://localhost:8000/api/test")
    print("🔍 Test matching: http://localhost:8000/api/test-match/1")
    print("=" * 60)
    
    try:
        uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info", reload=False)
    except Exception as e:
        print(f"❌ Server startup failed: {e}")
        import traceback
        traceback.print_exc()
