# 📄 AI Resume Analyzer

An AI-powered web application that analyzes resumes, extracts key information, and matches candidates with job descriptions using Natural Language Processing (NLP) and intelligent matching algorithms.

The application helps recruiters and job seekers by automating resume parsing, identifying relevant skills, and calculating resume-job compatibility scores.

---

## 🚀 Features

### 👤 User Authentication
- User Registration
- Secure Login
- JWT Authentication
- Protected Routes

### 📄 Resume Management
- Upload Resume (PDF)
- Store Uploaded Resumes
- Resume History
- Resume Details

### 🤖 AI Resume Parsing
- Extract Name
- Extract Email
- Extract Phone Number
- Extract Skills
- Extract Education
- Extract Work Experience
- Generate Resume Summary

### 💼 Job Description Management
- Create Job Descriptions
- Edit Job Descriptions
- Delete Job Descriptions
- Store Multiple Job Posts

### 🎯 AI Resume Matching
- Resume Match Percentage
- Skill Matching
- Missing Skills Detection
- Experience Matching
- Resume Ranking

### 📊 Dashboard
- Resume Statistics
- Job Statistics
- Match Results
- User Dashboard

---

# 🛠 Tech Stack

## Frontend

- React.js
- Vite
- React Router
- Axios
- Tailwind CSS
- Lucide React

## Backend

- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic
- JWT Authentication
- Uvicorn

## AI & NLP

- OpenAI API (Optional)
- Rule-based Resume Parsing
- Intelligent Skill Matching
- NLP Text Processing

---

# 📁 Project Structure

```
AI-Resume-Analyzer
│
├── backend
│   ├── models
│   ├── routes
│   ├── services
│   ├── requirements.txt
│   ├── main.py
│   └── .env
│
├── frontend
│   ├── src
│   ├── public
│   ├── package.json
│   └── vite.config.js
│
├── BACKEND_SETUP.md
├── CONFIGURATION_GUIDE.md
├── POSTGRESQL_SETUP.md
├── QUICK_SETUP.md
└── README.md
```

---

# ⚙ Prerequisites

Before running the project, install:

- Python 3.10+
- Node.js 18+
- PostgreSQL 15 or above
- Git

---

# 📥 Installation

## 1 Clone Repository

```bash
git clone https://github.com/yourusername/AI-Resume-Analyzer.git

cd AI-Resume-Analyzer
```

---

# 🐘 PostgreSQL Setup

Install PostgreSQL.

Create a database named:

```
resume_analyzer
```

---

# 🔑 Backend Environment Variables

Inside the **backend** folder create a file named:

```
.env
```

Add:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/resume_analyzer

OPENAI_API_KEY=your_openai_api_key_here

SECRET_KEY=your_secret_key_here

HOST=0.0.0.0

PORT=8000
```

> **Note**
>
> If you do not provide an OpenAI API key, the application automatically falls back to its built-in resume parsing and matching implementation.

---

# ⚙ Backend Installation

Navigate to backend:

```bash
cd backend
```

Create virtual environment

```bash
python -m venv venv
```

Activate environment

### Windows

```bash
venv\Scripts\activate
```

### Linux/Mac

```bash
source venv/bin/activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Install email validator

```bash
pip install email-validator
```

Run backend

```bash
python main.py
```

Backend runs at

```
http://localhost:8000
```

Swagger Documentation

```
http://localhost:8000/docs
```

---

# 💻 Frontend Installation

Open another terminal.

Navigate to frontend

```bash
cd frontend
```

Install packages

```bash
npm install
```

Run frontend

```bash
npm run dev
```

Frontend runs at

```
http://localhost:5173
```

---

# 🧪 Using the Application

## Step 1

Open

```
http://localhost:5173
```

Register a new account.

---

## Step 2

Login using your credentials.

---

## Step 3

Upload a resume in PDF format.

---

## Step 4

Wait for the AI parser to extract:

- Name
- Email
- Phone
- Skills
- Education
- Experience

---

## Step 5

Create a Job Description.

Example:

**Title**

```
Python Backend Developer
```

**Description**

```
We are looking for a Python Backend Developer with experience in FastAPI, PostgreSQL, SQLAlchemy, REST APIs, Docker, Git, and machine learning. Candidates should have strong problem-solving skills and experience building scalable web applications.
```

---

## Step 6

Run AI Matching.

The system calculates:

- Resume Match %
- Matched Skills
- Missing Skills
- Experience Match

---

# 📸 Screenshots

## 🔐 Login

![Login](screenshots/login.png)

---

## 📝 Register

![Register](screenshots/register.png)

---

## 📊 Dashboard

![Dashboard](screenshots/Dashboard.png)

---

## 📄 Upload Resume

![Upload Resume](screenshots/Upload_resume.png)

---

## 📂 My Resumes

![My Resumes](screenshots/my_resume.png)

---

## 💼 Job Management

![Job Management](screenshots/job_management.png)

---

## 🎯 AI Matching

![AI Matching](screenshots/ai_matching.png)

---

## 📚 Swagger API

![Swagger API](screenshots/swagger_api.png)

---

# 🔒 Authentication

The application uses JWT Authentication.

Protected endpoints require a Bearer Token.

You can authorize requests from Swagger using the **Authorize** button.

---

# 📚 API Documentation

Interactive Swagger UI:

```
http://localhost:8000/docs
```

---

# 🚀 Future Improvements

- Resume ATS Score
- AI Resume Suggestions
- Resume Comparison
- Multiple Resume Ranking
- Cover Letter Generator
- Interview Question Generator
- Resume Export
- Admin Dashboard
- Analytics Dashboard
- Cloud Deployment

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature-name
```

3. Commit changes

```bash
git commit -m "Add new feature"
```

4. Push branch

```bash
git push origin feature-name
```

5. Open a Pull Request

---

# 📄 License

This project is licensed under the MIT License.

---

# 👩‍💻 Author

**Kashmala Shafique**

BS Artificial Intelligence

University of Wah

GitHub:
https://github.com/KashmalaShafique

LinkedIn:
https://www.linkedin.com/in/kashmala-shafique-2b90ba373/

---

## ⭐ Support

If you found this project helpful, consider giving it a ⭐ on GitHub.
