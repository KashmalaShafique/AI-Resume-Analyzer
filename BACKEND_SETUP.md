# Backend Setup Guide

## Prerequisites
- Python 3.8 or higher
- MongoDB (local or cloud)
- OpenAI API key

## Installation

1. **Navigate to backend directory:**
   ```bash
   cd resume-ai/backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   - Copy `env_example.txt` to `.env`
   - Update the values:
     ```
     MONGODB_URL=mongodb://localhost:27017
     OPENAI_API_KEY=your_actual_openai_api_key
     SECRET_KEY=your_secret_key_here
     ```

5. **Start MongoDB:**
   - Local: Make sure MongoDB is running on your system
   - Cloud: Use MongoDB Atlas and update MONGODB_URL

## Running the Backend

1. **Start the server:**
   ```bash
   python run.py
   ```
   
   Or directly:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Access the API:**
   - API Documentation: http://localhost:8000/docs
   - Health Check: http://localhost:8000/health

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Resumes
- `POST /api/resumes/upload` - Upload resume file
- `GET /api/resumes/` - Get all resumes
- `GET /api/resumes/{id}` - Get specific resume
- `POST /api/resumes/{id}/parse` - Parse resume with AI
- `DELETE /api/resumes/{id}` - Delete resume

### Jobs
- `POST /api/jobs/` - Create job description
- `GET /api/jobs/` - Get all job descriptions
- `GET /api/jobs/{id}` - Get specific job
- `POST /api/jobs/{id}/match` - Match resumes with job
- `DELETE /api/jobs/{id}` - Delete job description

## Testing the Backend

1. **Test health endpoint:**
   ```bash
   curl http://localhost:8000/health
   ```

2. **Register a user:**
   ```bash
   curl -X POST "http://localhost:8000/api/auth/register" \
        -H "Content-Type: application/json" \
        -d '{"email": "test@example.com", "username": "testuser", "password": "testpass"}'
   ```

3. **Login:**
   ```bash
   curl -X POST "http://localhost:8000/api/auth/login" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "username=testuser&password=testpass"
   ```

## Next Steps
- Set up the React frontend
- Test resume upload functionality
- Configure OpenAI API key
- Test AI parsing features
