# 🧪 Complete Testing Guide

## 🚀 **How to Run the Full Application**

### **Step 1: Start Backend Server**
```bash
# Terminal 1 - Backend
cd resume-ai/backend
venv\Scripts\activate
python main.py
```
**Expected Output:**
```
Warning: OpenAI client initialization failed: Client.__init__() got an unexpected keyword argument 'proxies'
INFO:     Started server process [XXXX]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### **Step 2: Start Frontend Server**
```bash
# Terminal 2 - Frontend
cd resume-ai/frontend
npm run dev
```
**Expected Output:**
```
VITE v5.4.20  ready in 4342 ms
➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

## 🌐 **Access Your Application**

### **Frontend (Main Application)**
- **URL:** http://localhost:3000
- **Features:** Login, Register, Dashboard, Resume Upload, Job Management

### **Backend API**
- **URL:** http://localhost:8000
- **Health Check:** http://localhost:8000/health
- **API Documentation:** http://localhost:8000/docs

## 🧪 **Testing Checklist**

### **✅ 1. Backend API Testing**

#### **Health Check**
```bash
curl http://localhost:8000/health
```
**Expected:** `{"status": "healthy"}`

#### **API Documentation**
- Open: http://localhost:8000/docs
- Should show FastAPI interactive documentation

### **✅ 2. Frontend Testing**

#### **Homepage**
- Open: http://localhost:3000
- Should show login/register options
- Navigation should be visible

#### **User Registration**
1. Click "Sign Up" or go to http://localhost:3000/register
2. Fill in:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `testpass123`
3. Click "Create account"
4. Should redirect to login page

#### **User Login**
1. Go to http://localhost:3000/login
2. Enter credentials:
   - Username: `testuser`
   - Password: `testpass123`
3. Click "Sign in"
4. Should redirect to dashboard

#### **Dashboard**
- Should show welcome message
- Stats should display (may show 0s initially)
- Quick action buttons should be visible

### **✅ 3. Resume Upload Testing**

#### **Upload a Resume**
1. Click "Upload Resume" or go to http://localhost:3000/upload
2. Select a PDF or DOCX file
3. Click "Upload Resume"
4. Should show success message

#### **View Resumes**
1. Go to "My Resumes" or http://localhost:3000/resumes
2. Should show uploaded resume
3. Status should be "uploaded" or "parsing"

### **✅ 4. Job Management Testing**

#### **Create Job Description**
1. Go to "Job Management" or http://localhost:3000/jobs
2. Click "Add Job"
3. Fill in:
   - Title: `Software Developer`
   - Description: `Looking for a skilled software developer...`
   - Requirements: `Bachelor's degree\n3+ years experience`
   - Skills: `JavaScript, React, Node.js`
4. Click "Create Job"
5. Should appear in jobs list

### **✅ 5. Database Testing**

#### **Check PostgreSQL Connection**
```bash
# In backend directory
python test_connection.py
```
**Expected:** Database connection successful message

## 🔧 **Troubleshooting**

### **Backend Issues**
- **"Module not found"**: Activate virtual environment
- **"Database connection failed"**: Check PostgreSQL is running
- **"Port 8000 in use"**: Kill process using port 8000

### **Frontend Issues**
- **"Cannot connect to backend"**: Check backend is running on port 8000
- **"npm command not found"**: Install Node.js
- **"Port 3000 in use"**: Kill process using port 3000

### **Database Issues**
- **"Authentication failed"**: Check PostgreSQL password in .env
- **"Database does not exist"**: Run database setup script

## 📊 **Expected Results**

### **Successful Test Results:**
- ✅ Backend running on http://localhost:8000
- ✅ Frontend running on http://localhost:3000
- ✅ User can register and login
- ✅ Dashboard displays correctly
- ✅ Resume upload works
- ✅ Job creation works
- ✅ Database operations successful

### **Performance Expectations:**
- Backend startup: < 5 seconds
- Frontend startup: < 10 seconds
- Page loads: < 2 seconds
- File uploads: < 10 seconds (depending on file size)

## 🎯 **Next Steps After Testing**

1. **Test all features** - Upload resumes, create jobs
2. **Check database** - Verify data is stored
3. **Test AI features** - Resume parsing and job matching
4. **Deploy application** - Make it available online

## 🆘 **Need Help?**

If you encounter any issues:
1. Check both servers are running
2. Verify database connection
3. Check browser console for errors
4. Review terminal output for error messages

**Your AI Resume Analyzer is ready for testing!** 🚀
