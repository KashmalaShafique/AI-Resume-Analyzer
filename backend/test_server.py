#!/usr/bin/env python3
"""
Simple test script to verify the backend server is working
"""
import requests
import time
import subprocess
import sys
import os

def test_server():
    """Test if the server is running and responding"""
    try:
        # Test health endpoint
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Server is running and responding!")
            print(f"Response: {response.json()}")
            return True
        else:
            print(f"❌ Server responded with status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Make sure it's running on port 8000")
        return False
    except Exception as e:
        print(f"❌ Error testing server: {str(e)}")
        return False

def start_server():
    """Start the server in background"""
    print("🚀 Starting server...")
    try:
        # Start server in background
        process = subprocess.Popen([
            sys.executable, "main.py"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Wait a bit for server to start
        time.sleep(3)
        
        # Test if server is running
        if test_server():
            print("✅ Server started successfully!")
            return process
        else:
            print("❌ Server failed to start properly")
            process.terminate()
            return None
    except Exception as e:
        print(f"❌ Error starting server: {str(e)}")
        return None

if __name__ == "__main__":
    print("🧪 Testing AI Resume Analyzer Backend")
    print("=" * 50)
    
    # Test if server is already running
    if test_server():
        print("✅ Server is already running!")
    else:
        print("🔄 Server not running, attempting to start...")
        process = start_server()
        if process:
            print("✅ Server started successfully!")
            print("Press Ctrl+C to stop the server")
            try:
                process.wait()
            except KeyboardInterrupt:
                print("\n🛑 Stopping server...")
                process.terminate()
        else:
            print("❌ Failed to start server")
            sys.exit(1)
