# 🚀 Quick Setup Guide

## ✅ **Step 1: PostgreSQL Setup**

### 1.1 Add PostgreSQL to PATH (One-time setup)
1. **Open System Environment Variables:**
   - Press `Win + R`, type `sysdm.cpl`, press Enter
   - Click "Environment Variables..."
   - Under "System variables", find "Path" and click "Edit..."
   - Click "New" and add: `C:\Program Files\PostgreSQL\17\bin`
   - Click "OK" to save

2. **Verify Installation:**
   ```bash
   psql --version
   ```

### 1.2 Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# In psql prompt, create database:
CREATE DATABASE resume_analyzer;
\q
```

## ✅ **Step 2: Get OpenAI API Key**

### 2.1 Create OpenAI Account
1. Go to: **https://platform.openai.com/**
2. Sign up or log in
3. Go to: **https://platform.openai.com/api-keys**
4. Click **"Create new secret key"**
5. Copy your OpenAI API key.

### 2.2 Update .env File
Open `resume-ai/backend/.env` and replace:
```env
# Replace with your PostgreSQL password
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/resume_analyzer

# Replace with your OpenAI API key
OPENAI_API_KEY=your_openai_api_key_here
```

## ✅ **Step 3: Test the Setup**

### 3.1 Setup Database Tables
```bash
cd resume-ai/backend
python setup_database.py
```

### 3.2 Start the Server
```bash
python main.py
```

### 3.3 Test the API
- Open: **http://localhost:8000/docs**
- Try the health endpoint: **http://localhost:8000/health**

## 🎯 **What You Need:**

1. **PostgreSQL Password** - The password you set during PostgreSQL installation
2. **OpenAI API Key** - Get from https://platform.openai.com/api-keys
3. **Secret Key** - Already generated for you! ✅

## 🔧 **Troubleshooting:**

### PostgreSQL Issues:
- **"psql not found"**: Add PostgreSQL to PATH (Step 1.1)
- **"password authentication failed"**: Check your PostgreSQL password
- **"database does not exist"**: Run the CREATE DATABASE command

### OpenAI Issues:
- **"Invalid API key"**: Check your API key in .env file
- **"Rate limit exceeded"**: Add billing to your OpenAI account

## 🎉 **Success Indicators:**
- ✅ PostgreSQL service running
- ✅ Database `resume_analyzer` created
- ✅ .env file configured
- ✅ Server starts without errors
- ✅ API docs accessible at http://localhost:8000/docs
