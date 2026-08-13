from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="AI Resume Analyzer API",
    description="AI-powered resume analysis and job matching system",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ai-resume-analyzer-brown-theta-96.vercel.app",  # <-- your ACTUAL live frontend
        "https://ai-resume-analyzer-hanunfwxd-mala1.vercel.app",
        "https://ai-resume-analyzer-mala1.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_origin_regex=r"https://ai-resume-analyzer.*\.vercel\.app",  # catches future preview URLs too
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory
UPLOAD_DIR = "/tmp/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount static files for uploaded resumes
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Create database tables on startup
from models.database import create_tables
create_tables()

# Import routes
from routes import resume, job, auth, matching, export

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(resume.router, prefix="/api/resumes", tags=["resumes"])
app.include_router(job.router, prefix="/api/jobs", tags=["jobs"])
app.include_router(matching.router, prefix="/api/matching", tags=["matching"])
app.include_router(export.router, prefix="/api/export", tags=["export"])

@app.get("/")
async def root():
    return {"message": "AI Resume Analyzer API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)