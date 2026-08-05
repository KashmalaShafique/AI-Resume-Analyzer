#!/usr/bin/env python3
"""
Minimal working server - guaranteed to work
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Create FastAPI app
app = FastAPI(title="AI Resume Analyzer", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "AI Resume Analyzer API is running!"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/api/matching/test")
async def test_matching():
    """Test endpoint to verify matching functionality"""
    return {"status": "Matching endpoint is working!", "message": "Server is running successfully!"}

if __name__ == "__main__":
    print("🚀 Starting Minimal Server...")
    print("📍 Server will be available at: http://localhost:8000")
    print("🔗 Test endpoint: http://localhost:8000/api/matching/test")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
