# PostgreSQL Setup Guide

## 🐘 PostgreSQL Installation

### Option 1: Download from Official Website (Recommended)
1. **Download PostgreSQL:**
   - Go to: https://www.postgresql.org/download/windows/
   - Download PostgreSQL 15 or 16 (latest stable)
   - File size: ~200MB

2. **Install PostgreSQL:**
   - Run the installer as Administrator
   - Choose installation directory (default: `C:\Program Files\PostgreSQL\15`)
   - **Important:** Remember the password you set for the `postgres` user
   - Port: 5432 (default)
   - Locale: Default

### Option 2: Using Chocolatey (if you have it)
```bash
choco install postgresql
```

### Option 3: Using Scoop (if you have it)
```bash
scoop install postgresql
```

## 🔧 Database Setup

### 1. Create Database
After installation, open **pgAdmin** or **psql** command line:

```sql
-- Connect to PostgreSQL (use the password you set during installation)
psql -U postgres

-- Create database
CREATE DATABASE resume_analyzer;

-- Create user (optional, for better security)
CREATE USER resume_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE resume_analyzer TO resume_user;

-- Exit
\q
```

### 2. Update Environment Variables
Copy `env_example.txt` to `.env` and update:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/resume_analyzer

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Security Configuration
SECRET_KEY=your_secret_key_here

# Server Configuration
HOST=0.0.0.0
PORT=8000
```

## 🚀 Quick Start Commands

### Start PostgreSQL Service
```bash
# Windows Service (usually starts automatically)
net start postgresql-x64-15

# Or start from Services.msc
```

### Connect to Database
```bash
# Using psql command line
psql -U postgres -d resume_analyzer

# Using pgAdmin (GUI)
# Open pgAdmin and connect to localhost:5432
```

### Test Connection
```bash
# Test if PostgreSQL is running
psql -U postgres -c "SELECT version();"
```

## 🔍 Troubleshooting

### Common Issues:

1. **"psql: command not found"**
   - Add PostgreSQL bin directory to PATH:
   - `C:\Program Files\PostgreSQL\15\bin`

2. **Connection refused**
   - Check if PostgreSQL service is running:
   - `services.msc` → PostgreSQL → Start

3. **Authentication failed**
   - Use the password you set during installation
   - Default user: `postgres`

4. **Port 5432 already in use**
   - Check what's using the port: `netstat -an | findstr :5432`
   - Change PostgreSQL port in `postgresql.conf`

## 📊 Database Management Tools

### pgAdmin (Included with PostgreSQL)
- Web-based GUI for PostgreSQL
- Access at: http://localhost:5050 (after installation)
- Username: your email
- Password: what you set during installation

### Alternative Tools:
- **DBeaver** (Free, cross-platform)
- **DataGrip** (JetBrains, paid)
- **TablePlus** (Paid, modern UI)

## ✅ Verification

After setup, test the connection:

```bash
# Test connection
psql -U postgres -d resume_analyzer -c "SELECT current_database();"
```

Expected output:
```
 current_database 
------------------
 resume_analyzer
(1 row)
```

## 🎯 Next Steps

1. **Install PostgreSQL** (follow steps above)
2. **Create database** (`resume_analyzer`)
3. **Update `.env` file** with your credentials
4. **Install Python dependencies**: `pip install -r requirements.txt`
5. **Run the backend**: `python main.py`

The backend will automatically create all necessary tables on first run!
