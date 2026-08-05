#!/usr/bin/env python3
"""
Test database connection without .env file
"""
import os
from sqlalchemy import create_engine, text

def test_database_connection():
    """Test PostgreSQL connection"""
    print("🐘 Testing PostgreSQL connection...")
    
    # Set environment variables directly
    os.environ["DATABASE_URL"] = "postgresql://postgres:1234@localhost:5432/resume_analyzer"
    
    database_url = os.environ["DATABASE_URL"]
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
        print(f"❌ Error connecting to database: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Testing Database Connection")
    print("=" * 40)
    
    if test_database_connection():
        print("\n🎉 Database connection successful!")
        print("You can now run: python main.py")
    else:
        print("\n❌ Database connection failed!")
        print("Please check your PostgreSQL password and service status.")
