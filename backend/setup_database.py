#!/usr/bin/env python3
"""
Database setup script for PostgreSQL
"""
import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def setup_database():
    """Setup PostgreSQL database and tables"""
    print("🐘 Setting up PostgreSQL database...")
    
    # Get database URL from environment
    database_url = os.getenv("DATABASE_URL", "postgresql://postgres:1234@localhost:5432/resume_analyzer")
    
    print(f"📡 Connecting to: {database_url}")
    
    try:
        # Create engine
        engine = create_engine(database_url)
        
        # Test connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version();"))
            version = result.fetchone()[0]
            print(f"✅ Connected to PostgreSQL: {version}")
        
        # Import and create tables
        from models.database import create_tables
        create_tables()
        print("✅ Database tables created successfully!")
        
        return True
        
    except Exception as e:
        print(f"❌ Error setting up database: {str(e)}")
        print("\n🔧 Troubleshooting:")
        print("1. Make sure PostgreSQL is running")
        print("2. Check your DATABASE_URL in .env file")
        print("3. Verify your PostgreSQL password")
        return False

if __name__ == "__main__":
    print("🚀 AI Resume Analyzer - Database Setup")
    print("=" * 50)
    
    if setup_database():
        print("\n🎉 Database setup completed successfully!")
        print("You can now run: python main.py")
    else:
        print("\n❌ Database setup failed!")
        sys.exit(1)
