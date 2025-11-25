"""
Compare backend database connection with script database
"""
import sys
import os
import requests

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import MONGO_URI, DATABASE_NAME, API_BASE_URL
from pymongo import MongoClient
from bson import ObjectId

feed_item_id = "692091ba0f18a94ae879c83a"

print("=" * 60)
print("COMPARE BACKEND DB vs SCRIPT DB")
print("=" * 60)

# Check script database
print("\n1. Script Database:")
print(f"   URI: {MONGO_URI.split('@')[0]}@***")
print(f"   Database: {DATABASE_NAME}")

try:
    client = MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    feed_items_col = db['feed_items']
    
    feed_item = feed_items_col.find_one({"_id": ObjectId(feed_item_id)})
    if feed_item:
        print(f"   Feed item {feed_item_id}: FOUND")
        print(f"   Title: {feed_item.get('title', 'N/A')}")
    else:
        print(f"   Feed item {feed_item_id}: NOT FOUND")
    
    # Count all feed items
    total = feed_items_col.count_documents({})
    print(f"   Total feed items: {total}")
    
except Exception as e:
    print(f"   Error: {e}")

# Check backend (via API)
print("\n2. Backend Database (via API):")
print(f"   API URL: {API_BASE_URL}")

try:
    # Authenticate
    auth_response = requests.post(
        f"{API_BASE_URL}/auth/token",
        json={"username": "admin", "password": "admin123"},
        timeout=10
    )
    
    if auth_response.status_code == 200:
        token = auth_response.json().get("result", {}).get("token")
        
        if token:
            headers = {"Authorization": f"Bearer {token}"}
            
            # Try to get feed item
            response = requests.get(
                f"{API_BASE_URL}/feed-items/{feed_item_id}",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                print(f"   Feed item {feed_item_id}: FOUND")
            else:
                error = response.json()
                print(f"   Feed item {feed_item_id}: NOT FOUND")
                print(f"   Error: {error.get('message', 'Unknown')}")
                print(f"   Code: {error.get('code', 'N/A')}")
                
                # Try to get feed items count via user endpoint
                # Get current user detail ID
                me_response = requests.get(
                    f"{API_BASE_URL}/user-details/me",
                    headers=headers,
                    timeout=10
                )
                if me_response.status_code == 200:
                    user_detail = me_response.json().get("result", {})
                    user_detail_id = user_detail.get("id")
                    
                    # Get feed items for this user
                    feed_response = requests.get(
                        f"{API_BASE_URL}/feed-items/user/{user_detail_id}",
                        headers=headers,
                        params={"page": 0, "size": 10},
                        timeout=10
                    )
                    if feed_response.status_code == 200:
                        feed_data = feed_response.json().get("result", {})
                        total = feed_data.get("totalElements", 0)
                        print(f"   User's feed items count: {total}")
                        print(f"   [INFO] Backend can see feed items, but not this specific one")
                        print(f"   [INFO] Possible causes:")
                        print(f"   1. Feed item was created in different database")
                        print(f"   2. Feed item was deleted")
                        print(f"   3. Backend is connecting to different MongoDB instance")
except Exception as e:
    print(f"   Error: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("CONCLUSION:")
print("=" * 60)
print("If script database has feed item but backend doesn't find it:")
print("1. Backend might be connecting to different MongoDB")
print("2. Check backend .env file MONGODB_URL")
print("3. Make sure backend and script use same database")
print("=" * 60)

if 'client' in locals():
    client.close()

