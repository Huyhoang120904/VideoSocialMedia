"""
Test feed item API endpoint
"""
import sys
import os
import requests
import json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import API_BASE_URL

feed_item_id = "692091ba0f18a94ae879c83a"

print("=" * 60)
print("TEST FEED ITEM API")
print("=" * 60)
print(f"Feed Item ID: {feed_item_id}")
print()

# Test 1: Get feed item by ID (no auth needed)
print("1. Testing GET /feed-items/{id}...")
try:
    response = requests.get(
        f"{API_BASE_URL}/feed-items/{feed_item_id}",
        timeout=10
    )
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"   [OK] Feed item found!")
        print(f"   Response: {json.dumps(result, indent=2)}")
    else:
        error = response.json()
        print(f"   [ERROR] Failed to get feed item!")
        print(f"   Error: {json.dumps(error, indent=2)}")
except Exception as e:
    print(f"   [ERROR] Request failed: {e}")

# Test 2: Authenticate and test view endpoint
print("\n2. Testing POST /feed-items/{id}/view with authentication...")
try:
    # Authenticate first
    auth_response = requests.post(
        f"{API_BASE_URL}/auth/token",
        json={"username": "admin", "password": "admin123"},
        timeout=10
    )
    
    if auth_response.status_code == 200:
        auth_result = auth_response.json()
        token = auth_result.get("result", {}).get("token")
        
        if token:
            print(f"   [OK] Authenticated successfully")
            
            # Test view endpoint
            headers = {"Authorization": f"Bearer {token}"}
            view_response = requests.post(
                f"{API_BASE_URL}/feed-items/{feed_item_id}/view",
                headers=headers,
                timeout=10
            )
            
            print(f"   Status: {view_response.status_code}")
            
            if view_response.status_code == 200:
                result = view_response.json()
                print(f"   [OK] View recorded successfully!")
                print(f"   Response: {json.dumps(result, indent=2)}")
            else:
                error = view_response.json()
                print(f"   [ERROR] Failed to record view!")
                print(f"   Error: {json.dumps(error, indent=2)}")
        else:
            print(f"   [ERROR] No token in auth response")
    else:
        print(f"   [ERROR] Authentication failed: {auth_response.status_code}")
        print(f"   Response: {auth_response.text}")
except Exception as e:
    print(f"   [ERROR] Request failed: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)

