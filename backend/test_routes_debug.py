#!/usr/bin/env python3
"""
Test script to debug the 404 error in AI matching
"""

import requests
import json

def test_matching_routes():
    base_url = "http://localhost:8000"
    
    print("🔍 Testing Matching Routes Debug")
    print("=" * 50)
    
    # Test 1: Check if server is running
    try:
        response = requests.get(f"{base_url}/health")
        print(f"✅ Server Health: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ Server not running: {e}")
        return
    
    # Test 2: Test matching debug endpoint
    try:
        response = requests.get(f"{base_url}/api/matching/debug")
        print(f"✅ Debug Endpoint: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"❌ Debug endpoint failed: {e}")
    
    # Test 3: Test matching test endpoint
    try:
        response = requests.get(f"{base_url}/api/matching/test")
        print(f"✅ Test Endpoint: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"❌ Test endpoint failed: {e}")
    
    # Test 4: List all available routes
    print("\n🔍 Available Routes:")
    routes_to_test = [
        "/",
        "/health", 
        "/api/matching/test",
        "/api/matching/debug",
        "/api/auth/register",
        "/api/resumes/",
        "/api/jobs/"
    ]
    
    for route in routes_to_test:
        try:
            response = requests.get(f"{base_url}{route}")
            print(f"   {route}: {response.status_code}")
        except Exception as e:
            print(f"   {route}: ERROR - {e}")

if __name__ == "__main__":
    test_matching_routes()
