"""
Check feed item in database
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
print("CHECK FEED ITEM")
print("=" * 60)
print(f"Feed Item ID: {feed_item_id}")
print()

try:
    client = MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    feed_items_col = db['feed_items']
    videos_col = db['videos']
    image_slides_col = db['image_slides']
    files_col = db['files']
    metadata_col = db['metadata']
    user_details_col = db['user_details']
    
    # 1. Check if feed item exists
    print("1. Checking feed item...")
    feed_item = feed_items_col.find_one({"_id": ObjectId(feed_item_id)})
    
    if not feed_item:
        print(f"   [ERROR] Feed item NOT FOUND in database!")
        print(f"   This is why you're getting 404 error.")
        print()
        print("   Checking all feed items...")
        all_feed_items = list(feed_items_col.find({}, {"_id": 1, "feed_item_type": 1, "active": 1}).limit(10))
        print(f"   Found {len(all_feed_items)} feed items (showing first 10):")
        for fi in all_feed_items:
            print(f"     - {fi['_id']} (type: {fi.get('feed_item_type')}, active: {fi.get('active', True)})")
        exit(1)
    
    print(f"   [OK] Feed item found!")
    print(f"   Type: {feed_item.get('feed_item_type')}")
    print(f"   Active: {feed_item.get('active', True)}")
    print(f"   Title: {feed_item.get('title', 'N/A')}")
    
    # 2. Check video/image slide reference
    print("\n2. Checking video/image slide reference...")
    if feed_item.get('feed_item_type') == 'VIDEO':
        video_ref = feed_item.get('video_ref')
        if video_ref:
            # Handle DBRef format
            if isinstance(video_ref, dict):
                if '$id' in video_ref:
                    video_id = video_ref['$id']
                elif 'id' in video_ref:
                    video_id = video_ref['id']
                else:
                    video_id = None
            else:
                video_id = None
            
            if video_id:
                video = videos_col.find_one({"_id": ObjectId(video_id)})
                if video:
                    print(f"   [OK] Video found: {video_id}")
                    file_ref = video.get('file_ref')
                    if file_ref:
                        # Handle DBRef format
                        if isinstance(file_ref, dict):
                            if '$id' in file_ref:
                                file_id = file_ref['$id']
                            elif 'id' in file_ref:
                                file_id = file_ref['id']
                            else:
                                file_id = None
                        else:
                            file_id = None
                        
                        if file_id:
                            file_doc = files_col.find_one({"_id": ObjectId(file_id)})
                            if file_doc:
                                print(f"   [OK] File found: {file_id}")
                                print(f"   File name: {file_doc.get('file_name')}")
                                print(f"   URL: {file_doc.get('url', 'N/A')}")
                            else:
                                print(f"   [ERROR] File NOT FOUND: {file_id}")
                        else:
                            print(f"   [ERROR] Invalid file_ref format: {file_ref}")
                    else:
                        print(f"   [ERROR] Video has no file_ref")
                else:
                    print(f"   [ERROR] Video NOT FOUND: {video_id}")
            else:
                print(f"   [ERROR] Invalid video_ref format: {video_ref}")
        else:
            print(f"   [ERROR] Feed item has no video_ref")
    
    elif feed_item.get('feed_item_type') == 'IMAGE_SLIDE':
        image_slide_ref = feed_item.get('image_slide_ref')
        if image_slide_ref:
            if isinstance(image_slide_ref, dict) and '$id' in image_slide_ref:
                image_slide_id = image_slide_ref['$id']
                image_slide = image_slides_col.find_one({"_id": ObjectId(image_slide_id)})
                if image_slide:
                    print(f"   [OK] Image slide found: {image_slide_id}")
                    images_ref = image_slide.get('images_ref', [])
                    print(f"   Images count: {len(images_ref)}")
                else:
                    print(f"   [ERROR] Image slide NOT FOUND: {image_slide_id}")
            else:
                print(f"   [ERROR] Invalid image_slide_ref format: {image_slide_ref}")
        else:
            print(f"   [ERROR] Feed item has no image_slide_ref")
    
    # 3. Check metadata
    print("\n3. Checking metadata...")
    metadata_ref = feed_item.get('metadata_ref')
    if metadata_ref:
        if isinstance(metadata_ref, dict) and '$id' in metadata_ref:
            metadata_id = metadata_ref['$id']
            metadata = metadata_col.find_one({"_id": ObjectId(metadata_id)})
            if metadata:
                print(f"   [OK] Metadata found: {metadata_id}")
                print(f"   Views: {metadata.get('views_count', 0)}")
                print(f"   Loves: {metadata.get('loves_count', 0)}")
                print(f"   Comments: {metadata.get('comments_count', 0)}")
                print(f"   Shares: {metadata.get('shares_count', 0)}")
            else:
                print(f"   [ERROR] Metadata NOT FOUND: {metadata_id}")
        else:
            print(f"   [ERROR] Invalid metadata_ref format: {metadata_ref}")
    else:
        print(f"   [WARNING] Feed item has no metadata_ref")
    
    # 4. Check uploader
    print("\n4. Checking uploader...")
    uploader_ref = feed_item.get('uploader_ref')
    if uploader_ref:
        if isinstance(uploader_ref, dict) and '$id' in uploader_ref:
            uploader_id = uploader_ref['$id']
            uploader = user_details_col.find_one({"_id": ObjectId(uploader_id)})
            if uploader:
                print(f"   [OK] Uploader found: {uploader_id}")
                print(f"   Display name: {uploader.get('display_name', 'N/A')}")
            else:
                print(f"   [ERROR] Uploader NOT FOUND: {uploader_id}")
        else:
            print(f"   [ERROR] Invalid uploader_ref format: {uploader_ref}")
    else:
        print(f"   [WARNING] Feed item has no uploader_ref")
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print("Feed item exists: YES")
    print("If you're still getting 404, check:")
    print("1. Backend is running")
    print("2. Feed item ID is correct")
    print("3. User is authenticated")
    
except Exception as e:
    print(f"[ERROR] Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    if 'client' in locals():
        client.close()

