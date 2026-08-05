#!/usr/bin/env python3
"""
Quick test to verify the application is working
"""
import os
import sys

# Set environment variables
os.environ["DATABASE_URL"] = "postgresql://postgres:1234@localhost:5432/resume_analyzer"
os.environ["OPENAI_API_KEY"] = "your_openai_api_key_here"
os.environ["SECRET_KEY"] = "yCdhBuSKmK3Bue9kxIAB5zH4Ji0YmCkqsbwucElHq0g"

def test_database():
    """Test database connection and tables"""
    print("🔍 Testing database connection...")
    try:
        from models.database import create_tables
        create_tables()
        print("✅ Database tables created successfully!")
        return True
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False

def test_imports():
    """Test if all modules can be imported"""
    print("🔍 Testing imports...")
    try:
        from routes import auth, resume, job
        from services import resume_parser, job_matcher
        from models import database, schemas, sql_models
        print("✅ All modules imported successfully!")
        return True
    except Exception as e:
        print(f"❌ Import error: {e}")
        return False

def test_server_start():
    """Test if server can start"""
    print("🔍 Testing server startup...")
    try:
        from main import app
        print("✅ Server app created successfully!")
        return True
    except Exception as e:
        print(f"❌ Server error: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Quick Application Test")
    print("=" * 40)
    
    tests = [
        ("Database Connection", test_database),
        ("Module Imports", test_imports),
        ("Server Startup", test_server_start)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n📋 {test_name}:")
        if test_func():
            passed += 1
        else:
            print(f"❌ {test_name} failed!")
    
    print(f"\n📊 Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your application is ready!")
        print("\n🚀 To start the server:")
        print("   python main.py")
        print("\n🌐 Then open: http://localhost:3000")
    else:
        print("❌ Some tests failed. Please check the errors above.")
        sys.exit(1)
