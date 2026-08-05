# 🔧 Configuration Guide

## Step 1: Configure PostgreSQL

### 1.1 Create Database
```bash
# Open Command Prompt as Administrator
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres

# In psql, run:
CREATE DATABASE resume_analyzer;
\q
```

### 1.2 Update .env File
Copy `env_example.txt` to `.env` and update:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/resume_analyzer

# OpenAI Configuration  
OPENAI_API_KEY=your_openai_api_key_here

# Security Configuration
SECRET_KEY=your_secret_key_here_change_this_in_production

# Server Configuration
HOST=0.0.0.0
PORT=8000
```

## Step 2: Get OpenAI API Key

### 2.1 Create OpenAI Account
1. Go to: https://platform.openai.com/
2. Sign up or log in
3. Go to: https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Copy your OpenAI API key.

### 2.2 Update .env File
Replace `your_openai_api_key_here` with your actual API key.

## Step 3: Generate Secret Key

### 3.1 Generate a Secure Secret Key
```python
import secrets
print(secrets.token_urlsafe(32))
```

### 3.2 Update .env File
Replace `your_secret_key_here_change_this_in_production` with the generated key.

## Step 4: Test Configuration

### 4.1 Run Database Setup
```bash
python setup_database.py
```

### 4.2 Start the Server
```bash
python main.py
```

### 4.3 Test API
Open: http://localhost:8000/docs

## 🔍 Troubleshooting

### PostgreSQL Issues:
- **"password authentication failed"**: Check your PostgreSQL password
- **"database does not exist"**: Run the CREATE DATABASE command
- **"connection refused"**: Check if PostgreSQL service is running

### OpenAI Issues:
- **"Invalid API key"**: Check your API key in .env file
- **"Rate limit exceeded"**: You may need to add billing to your OpenAI account

### General Issues:
- Make sure all dependencies are installed: `pip install -r requirements.txt`
- Check that .env file is in the backend directory
- Verify PostgreSQL service is running
