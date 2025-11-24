"""
Test user creation via API and check if login works
"""
import requests
import json
import time
from config import API_BASE_URL

print("=" * 60)
print("TEST USER CREATION VIA API")
print("=" * 60)

# Try localhost if configured host fails
api_url = API_BASE_URL
if "10.10.3.225" in api_url:
    api_url = "http://localhost:8082/api/v1"
    print(f"Using API URL: {api_url}")

# Test data
username = "Huy Nguyen"
mail = "abc@gmail.com"
password = "user123"

# 1. Create user
print(f"\n1. Creating user '{username}'...")
user_data = {
    "username": username,
    "mail": mail,
    "phoneNumber": "0123456789",
    "password": password
}

try:
    response = requests.post(
        f"{api_url}/users",
        json=user_data,
        timeout=10
    )
    
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 201:
        result = response.json()
        print(f"   [OK] User created successfully!")
        print(f"   User ID: {result.get('result', {}).get('id')}")
        print(f"   Response: {json.dumps(result, indent=2)}")
        
        # Wait a bit for backend to finish creating UserDetail
        print("\n   Waiting 2 seconds for UserDetail creation...")
        time.sleep(2)
        
        # 2. Test login
        print(f"\n2. Testing login with '{username}'...")
        auth_data = {
            "username": username,
            "password": password
        }
        
        auth_response = requests.post(
            f"{api_url}/auth/token",
            json=auth_data,
            timeout=10
        )
        
        print(f"   Status: {auth_response.status_code}")
        
        if auth_response.status_code == 200:
            auth_result = auth_response.json()
            token = auth_result.get("result", {}).get("token")
            if token:
                print(f"   [OK] Login successful!")
                print(f"   Token: {token[:50]}...")
            else:
                print(f"   [ERROR] Login successful but no token in response")
                print(f"   Response: {json.dumps(auth_result, indent=2)}")
        else:
            error = auth_response.json()
            print(f"   [ERROR] Login failed!")
            print(f"   Error: {json.dumps(error, indent=2)}")
            
            if error.get("code") == 1101:  # USER_NOT_FOUND
                print(f"\n   [DEBUG] Backend cannot find user!")
                print(f"   Possible causes:")
                print(f"   1. UserDetail was not created")
                print(f"   2. Backend query issue")
                print(f"   3. Database connection issue")
    else:
        error = response.json()
        print(f"   [ERROR] Failed to create user!")
        print(f"   Error: {json.dumps(error, indent=2)}")
        
except requests.exceptions.RequestException as e:
    print(f"   [ERROR] Request failed: {e}")
    print(f"   Make sure backend is running at {api_url}")

print("\n" + "=" * 60)

