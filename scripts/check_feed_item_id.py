"""
Check feed item _id format
"""
import sys
import os
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import MONGO_URI, DATABASE_NAME
from pymongo import MongoClient
from bson import ObjectId

feed_item_id = "692091ba0f18a94ae879c83a"

print("=" * 60)
print("CHECK FEED ITEM ID FORMAT")
print("=" * 60)

try:
    client = MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    feed_items_col = db['feed_items']
    
    # Try different query formats
    print(f"Feed Item ID (string): {feed_item_id}")
    print()
    
    # Query 1: As string
    print("1. Query as string:")
    feed_item1 = feed_items_col.find_one({"_id": feed_item_id})
    print(f"   Result: {'FOUND' if feed_item1 else 'NOT FOUND'}")
    
    # Query 2: As ObjectId
    print("\n2. Query as ObjectId:")
    try:
        feed_item2 = feed_items_col.find_one({"_id": ObjectId(feed_item_id)})
        print(f"   Result: {'FOUND' if feed_item2 else 'NOT FOUND'}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Query 3: Find all and check _id format
    print("\n3. Check _id format of existing feed items:")
    all_feed_items = list(feed_items_col.find({}, {"_id": 1}).limit(5))
    for fi in all_feed_items:
        _id = fi.get("_id")
        print(f"   _id: {_id} (type: {type(_id).__name__})")
        if str(_id) == feed_item_id:
            print(f"   [MATCH] This is the feed item we're looking for!")
    
    # Query 4: Try to find by converting string to ObjectId
    print("\n4. Backend should query like this:")
    print(f"   feedItemRepository.findById('{feed_item_id}')")
    print(f"   Spring Data MongoDB will convert string to ObjectId automatically")
    print(f"   But if _id is stored as string, it won't match ObjectId query")
    
    # Check if _id is string or ObjectId
    target_item = feed_items_col.find_one({"_id": ObjectId(feed_item_id)})
    if target_item:
        _id = target_item.get("_id")
        print(f"\n   [FOUND] Feed item exists with _id type: {type(_id).__name__}")
        print(f"   _id value: {_id}")
        print(f"   _id as string: {str(_id)}")
        
        if isinstance(_id, ObjectId):
            print(f"   [OK] _id is ObjectId - backend should find it")
        else:
            print(f"   [ERROR] _id is NOT ObjectId - backend won't find it!")
            print(f"   Need to fix: _id should be ObjectId, not string")
    else:
        print(f"\n   [ERROR] Cannot find feed item even with ObjectId query!")
        print(f"   Feed item might not exist or ID is wrong")
    
except Exception as e:
    print(f"[ERROR] Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    if 'client' in locals():
        client.close()

print("\n" + "=" * 60)

