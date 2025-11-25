"""
Data Manager Full - Complete script to generate all fake data for testing
Includes: Users, UserDetails, Videos, ImageSlides, FeedItems, Hashtags, Comments, Metadata, UserInteractions
"""
import sys
import os
import time
import random
import shutil
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
import bcrypt
import requests
from pymongo import MongoClient
from pymongo.database import DBRef
from bson import ObjectId
from faker import Faker
from pathlib import Path

# Add scripts directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import (
    MONGO_URI, DATABASE_NAME, API_BASE_URL, SERVER_HOST, SERVER_PORT, CONTEXT_PATH,
    BACKEND_UPLOADS_DIR, PROJECT_ROOT, BACKEND_DIR, PEXELS_API_KEY
)
from pexels_downloader import PexelsDownloader

fake = Faker()

# Configuration presets
PRESETS = {
    "xlarge": {
        "users": 100,
        "videos": 500,
        "image_slides": 100,
        "hashtags": 50,
        "comments_per_feed": (10, 30),
        "interactions_multiplier": 5,
        "following_percentage": 0.4,
        "search_history_per_user": (5, 20)
    },
    "large": {
        "users": 50,
        "videos": 200,
        "image_slides": 100,
        "hashtags": 30,
        "comments_per_feed": (5, 20),
        "interactions_multiplier": 3,
        "following_percentage": 0.3,
        "search_history_per_user": (3, 15)
    },
    "small": {
        "users": 10,
        "videos": 50,
        "image_slides": 25,
        "hashtags": 10,
        "comments_per_feed": (2, 10),
        "interactions_multiplier": 2,
        "following_percentage": 0.2,
        "search_history_per_user": (1, 10)
    },
    "test": {
        "users": 10,
        "videos": 20,
        "image_slides": 10,
        "hashtags": 5,
        "comments_per_feed": (1, 5),
        "interactions_multiplier": 1,
        "following_percentage": 0.1,
        "search_history_per_user": (0, 5)
    }
}

class DataManagerFull:
    def __init__(self):
        self.client = MongoClient(MONGO_URI)
        self.db = self.client[DATABASE_NAME]
        self.users_col = self.db['users']
        self.user_details_col = self.db['user_details']
        self.roles_col = self.db['roles']
        self.files_col = self.db['files']
        self.videos_col = self.db['videos']
        self.image_slides_col = self.db['image_slides']
        self.feed_items_col = self.db['feed_items']
        self.comments_col = self.db['comments']
        self.user_interactions_col = self.db['user_interaction']  # Singular to match Spring Boot
        self.hashtags_col = self.db['hashtags']
        self.hashtags_col = self.db['hashtags']
        self.metadata_col = self.db['metadata']
        self.user_preferences_col = self.db['user_preference']
        self.search_history_col = self.db['search_history']
        
        self.api_base_url = API_BASE_URL
        self.current_token = None
        self.current_user_detail_id = None
        
        # Storage paths - use backend/uploads directory
        self.uploads_dir = BACKEND_UPLOADS_DIR
        self.pexels_videos_dir = PROJECT_ROOT / "pexels_data" / "videos"
        self.pexels_images_dir = PROJECT_ROOT / "pexels_data" / "images"
        
        # Create uploads directory if it doesn't exist
        self.uploads_dir.mkdir(parents=True, exist_ok=True)
        print(f"Uploads directory: {self.uploads_dir}")
        print(f"Uploads directory exists: {self.uploads_dir.exists()}")
        
        # Initialize lists
        self.user_ids = []
        self.user_detail_ids = []
        self.file_ids = []
        self.video_ids = []
        self.image_slide_ids = []
        self.feed_item_ids = []
        self.hashtag_ids = []
        
        # Pexels downloader for real videos/images
        self.pexels_downloader = PexelsDownloader(api_key=PEXELS_API_KEY)
        
        # Map file_id to thumbnail_url for videos
        self.video_thumbnails = {}
        
    def bcrypt_java_compatible(self, password: str) -> str:
        """Generate bcrypt hash compatible with Java Spring Security ($2a$ format)"""
        salt = bcrypt.gensalt(rounds=12)
        hash_bytes = bcrypt.hashpw(password.encode('utf-8'), salt)
        hash_str = hash_bytes.decode('utf-8')
        if hash_str.startswith('$2b$'):
            hash_str = '$2a$' + hash_str[4:]
        return hash_str
    
    def authenticate(self, username: str = "admin", password: str = "admin123") -> bool:
        """Authenticate with backend and get JWT token"""
        auth_url = f"{self.api_base_url}/auth/token"
        auth_data = {"username": username, "password": password}
        
        try:
            response = requests.post(auth_url, json=auth_data, timeout=10)
            if response.status_code == 200:
                result = response.json()
                self.current_token = result.get("result", {}).get("token")
                if self.current_token:
                    self._get_current_user_detail_id()
                    return True
        except:
            # Try localhost
            try:
                localhost_url = "http://localhost:8082/api/v1/auth/token"
                response = requests.post(localhost_url, json=auth_data, timeout=10)
                if response.status_code == 200:
                    result = response.json()
                    self.current_token = result.get("result", {}).get("token")
                    if self.current_token:
                        self.api_base_url = "http://localhost:8082/api/v1"
                        self._get_current_user_detail_id()
                        return True
            except:
                pass
        
        print("[WARNING] Cannot authenticate. Will use direct DB insertion.")
        return False
    
    def _get_current_user_detail_id(self):
        """Get current user's UserDetail ID"""
        if not self.current_token:
            return
        try:
            headers = {"Authorization": f"Bearer {self.current_token}"}
            response = requests.get(f"{self.api_base_url}/user-details/me", headers=headers, timeout=10)
            if response.status_code == 200:
                result = response.json()
                self.current_user_detail_id = result.get("result", {}).get("id")
        except:
            pass
    
    def _create_roles(self):
        """Create default roles"""
        roles = [
            {"role_name": "ADMIN", "description": "Administrator role"},
            {"role_name": "USER", "description": "Regular user role"}
        ]
        for role_data in roles:
            if not self.roles_col.find_one({"role_name": role_data["role_name"]}):
                self.roles_col.insert_one(role_data)
    
    def _create_users(self, count: int):
        """Create users via API register to avoid duplicate key errors"""
        print(f"\nCreating {count} users via API...")
        
        # Ensure admin exists
        admin = self.users_col.find_one({"username": "admin"})
        if not admin:
            self._create_admin_user()
            admin = self.users_col.find_one({"username": "admin"})
        
        # Try to authenticate and create via API first
        use_api = False
        if admin:
            if self.authenticate("admin", "admin123"):
                use_api = True
                print("[INFO] Authenticated successfully. Creating users via API...")
            else:
                print("[WARNING] Cannot authenticate. Will create users directly in database.")
        
        # Create users via API
        success_count = 0
        created_user_ids = []
        created_user_detail_ids = []
        
        if use_api:
            for i in range(count):
                username = f"user{i:03d}_{fake.user_name().replace(' ', '').lower()}"
                mail = f"{username}@example.com"
                password = "password123"
                
                user_data = {
                    "username": username,
                    "mail": mail,
                    "phoneNumber": fake.phone_number()[:15],
                    "password": password
                }
                
                try:
                    response = requests.post(
                        f"{self.api_base_url}/users",
                        json=user_data,
                        timeout=10
                    )
                    
                    if response.status_code == 201:
                        result = response.json()
                        user_id = result.get("result", {}).get("id")
                        if user_id:
                            created_user_ids.append(user_id)
                            success_count += 1
                            print(f"Created user {success_count}/{count}: {username}")
                            
                            # Get user detail ID - try different query formats
                            user_detail = None
                            # Try query by user_ref.$id
                            user_detail = self.user_details_col.find_one({"user_ref.$id": ObjectId(user_id)})
                            if not user_detail:
                                # Try query by user_ref as DBRef
                                from pymongo.database import DBRef
                                dbref = DBRef(collection="users", id=ObjectId(user_id))
                                user_detail = self.user_details_col.find_one({"user_ref": dbref})
                            if not user_detail:
                                # Try query by user_ref as ObjectId
                                user_detail = self.user_details_col.find_one({"user_ref": ObjectId(user_id)})
                            
                            if user_detail:
                                created_user_detail_ids.append(str(user_detail["_id"]))
                    elif response.status_code == 400:
                        error = response.json()
                        if "duplicate" in error.get("message", "").lower() or "existed" in error.get("message", "").lower():
                            print(f"User {username} already exists, skipping...")
                        else:
                            print(f"Failed to create user {username}: {error.get('message', 'Unknown error')}")
                    else:
                        print(f"Failed to create user {username}: HTTP {response.status_code}")
                        # If too many failures, fallback to direct creation
                        if i > 0 and success_count == 0:
                            print("[WARNING] API creation failing. Falling back to direct DB insertion...")
                            break
                    
                    time.sleep(0.1)  # Rate limiting
                    
                except requests.exceptions.RequestException as e:
                    print(f"Error creating user {username}: {e}")
                    # Fallback to direct creation if API fails
                    if i == 0:
                        print("[WARNING] API not available. Falling back to direct DB insertion...")
                        break
        
        # Fallback: Create users directly in database if API failed or not enough
        if not use_api:
            # API not available, create all users directly
            print(f"\nCreating {count} users directly in database (API not available)...")
            self._create_users_direct(count, start_index=0)
        elif success_count < count:
            # API available but didn't create all users, create remaining
            remaining = count - success_count
            print(f"\nCreating {remaining} remaining users directly in database...")
            self._create_users_direct(remaining, start_index=success_count)
        elif success_count > 0:
            # All users created via API
            print(f"Successfully created {success_count} users via API")
        
        # Always get all user detail IDs from database (including admin)
        all_user_details = list(self.user_details_col.find({}, {"_id": 1}))
        self.user_detail_ids = [str(ud["_id"]) for ud in all_user_details]
        
        # Get all user IDs
        all_users = list(self.users_col.find({}, {"_id": 1}))
        self.user_ids = [str(u["_id"]) for u in all_users]
        
        print(f"\nTotal users in database: {len(self.user_ids)}")
        print(f"Total user details in database: {len(self.user_detail_ids)}")
    
    def _create_users_direct(self, count: int, start_index: int = 0):
        """Create users directly in MongoDB (fallback method)"""
        # Get roles
        user_role = self.roles_col.find_one({"role_name": "USER"})
        if not user_role:
            self._create_roles()
            user_role = self.roles_col.find_one({"role_name": "USER"})
        
        users = []
        user_details = []
        
        for i in range(count):
            idx = start_index + i
            username = f"user{idx:03d}_{fake.user_name().replace(' ', '').lower()}"
            mail = f"{username}@example.com"
            password = "password123"
            
            user = {
                "_id": str(ObjectId()),  # String ID
                "username": username,
                "mail": mail,
                "password": self.bcrypt_java_compatible(password),
                "enable": True,
                "roles_ref": [DBRef(collection="roles", id=user_role["_id"])],
                "created_at": datetime.now() - timedelta(days=random.randint(1, 365)),
                "updated_at": datetime.now()
            }
            users.append(user)
        
        if users:
            result = self.users_col.insert_many(users)
            # user_ids are already strings in the 'users' list
            
            for i, user in enumerate(users):
                user_id = user["_id"]
                user_detail = {
                    "_id": str(ObjectId()),  # String ID
                    "user_ref": DBRef(collection="users", id=user_id),
                    "display_name": user["username"],
                    "shown_name": f"@{user['username']}",
                    "avatar": {"url": f"https://ui-avatars.com/api/?name={user['username']}&background=random"},
                    "bio": fake.text(max_nb_chars=200),
                    "following": [],
                    "following_count": 0,
                    "follower": [],
                    "follower_count": 0,
                    "violationCount": 0,
                    "created_at": datetime.now() - timedelta(days=random.randint(1, 365)),
                    "updated_at": datetime.now()
                }
                user_details.append(user_detail)
            
            if user_details:
                result = self.user_details_col.insert_many(user_details)
                print(f"Created {len(users)} users directly in database")
    
    def _create_admin_user(self):
        """Create admin user"""
        admin_role = self.roles_col.find_one({"role_name": "ADMIN"})
        if not admin_role:
            self._create_roles()
            admin_role = self.roles_col.find_one({"role_name": "ADMIN"})
        
        admin_user = {
            "_id": str(ObjectId()),  # String ID
            "username": "admin",
            "mail": "admin@thesocial.com",
            "password": self.bcrypt_java_compatible("admin123"),
            "enable": True,
            "roles_ref": [DBRef(collection="roles", id=admin_role["_id"])],
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        self.users_col.insert_one(admin_user)
        user_id = admin_user["_id"]
        
        admin_detail = {
            "_id": str(ObjectId()),  # String ID
            "user_ref": DBRef(collection="users", id=user_id),
            "display_name": "admin",
            "shown_name": "@admin",
            "avatar": {"url": "https://ui-avatars.com/api/?name=Admin&background=000&color=fff"},
            "bio": "Administrator",
            "following": [],
            "following_count": 0,
            "follower": [],
            "follower_count": 0,
            "violationCount": 0,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        self.user_details_col.insert_one(admin_detail)
    
    def _download_pexels_media(self, video_count: int, image_count: int):
        """Download real videos and images from Pexels"""
        print(f"\nDownloading {video_count} videos and {image_count} images from Pexels...")
        
        video_paths = []
        image_paths = []
        
        # Check if Pexels API key is available
        if not self.pexels_downloader.api_key:
            print("[WARNING] PEXELS_API_KEY not found in environment variables.")
            print("[INFO] Will create placeholder files instead.")
            print("[INFO] To download real videos/images, add PEXELS_API_KEY to .env file")
            print("[INFO] Get free API key from: https://www.pexels.com/api/")
            return self._create_placeholder_files(video_count, image_count)
        
        # Download videos from Pexels
        if video_count > 0:
            # Use video-specific queries
            queries = ["lifestyle", "dance", "fitness", "vlog", "funny", "cats", "dogs", "music", "party"]
            videos_per_query = max(1, video_count // len(queries))
            all_videos = []
            
            for query in queries:
                if len(all_videos) >= video_count:
                    break
                try:
                    videos = self.pexels_downloader.download_videos(
                        query, 
                        min(videos_per_query, video_count - len(all_videos)),
                        str(self.pexels_videos_dir)
                    )
                    all_videos.extend(videos)
                except Exception as e:
                    print(f"Error downloading videos for query '{query}': {e}")
                    continue
            
            # Store video info including thumbnail
            for v in all_videos:
                if v.get("local_path"):
                    video_paths.append({
                        "path": Path(v["local_path"]),
                        "thumbnail": v.get("thumbnail", "")
                    })
            
            print(f"Downloaded {len(video_paths)} videos from Pexels")
        
        # Download images from Pexels
        if image_count > 0:
            # Use image-specific queries (distinct from videos)
            queries = ["nature", "architecture", "abstract", "food", "technology", "art", "landscape", "portrait"]
            images_per_query = max(1, image_count // len(queries))
            all_images = []
            
            for query in queries:
                if len(all_images) >= image_count:
                    break
                try:
                    images = self.pexels_downloader.download_images(
                        query,
                        min(images_per_query, image_count - len(all_images)),
                        str(self.pexels_images_dir)
                    )
                    all_images.extend(images)
                except Exception as e:
                    print(f"Error downloading images for query '{query}': {e}")
                    continue
            
            image_paths = [Path(img["local_path"]) for img in all_images if img.get("local_path")]
            print(f"Downloaded {len(image_paths)} images from Pexels")
        
        # If not enough files downloaded, create placeholders for the rest
        if len(video_paths) < video_count or len(image_paths) < image_count:
            print(f"[WARNING] Only downloaded {len(video_paths)}/{video_count} videos and {len(image_paths)}/{image_count} images")
            
            # Extract just paths for existing videos to use for duplication
            existing_video_paths = [v["path"] for v in video_paths]
            
            placeholder_videos, placeholder_images = self._create_placeholder_files(
                max(0, video_count - len(video_paths)),
                max(0, image_count - len(image_paths)),
                existing_videos=existing_video_paths,
                existing_images=image_paths
            )
            video_paths.extend(placeholder_videos)
            image_paths.extend(placeholder_images)
        
        return video_paths, image_paths
    
    def _create_placeholder_files(self, video_count: int, image_count: int, existing_videos: List[Path] = [], existing_images: List[Path] = []):
        """Create placeholder files by duplicating existing files if available"""
        print(f"\nCreating {video_count} placeholder videos and {image_count} placeholder images...")
        
        video_paths = []
        image_paths = []
        
        # 1. Create videos (Duplicate existing valid videos)
        if existing_videos and video_count > 0:
            print(f"  - Duplicating existing {len(existing_videos)} videos to fill gaps...")
            for i in range(video_count):
                source_video = existing_videos[i % len(existing_videos)]
                new_video_path = self.pexels_videos_dir / f"duplicate_video_{i}_{source_video.name}"
                self.pexels_videos_dir.mkdir(parents=True, exist_ok=True)
                try:
                    shutil.copy2(source_video, new_video_path)
                    video_paths.append({
                        "path": new_video_path,
                        "thumbnail": "" # No thumbnail for duplicates/placeholders unless we copy that too, but keeping it simple
                    })
                except Exception as e:
                    print(f"Error duplicating video: {e}")
        elif video_count > 0:
            # Fallback to dummy if no videos downloaded (Should not happen if internet is ok)
            print("  - [WARNING] No existing videos to duplicate. Creating dummy files (MAY NOT PLAY)...")
            for i in range(video_count):
                video_path = self.pexels_videos_dir / f"placeholder_video_{i}.mp4"
                self.pexels_videos_dir.mkdir(parents=True, exist_ok=True)
                # Minimal valid MP4 header
                mp4_header = b'\x00\x00\x00\x20ftypmp41\x00\x00\x00\x00mp41isom\x00\x00\x02\x00'
                with open(video_path, 'wb') as f:
                    f.write(mp4_header)
                    f.write(b'\x00' * (1024 * 100))  # 100KB
                video_paths.append({
                    "path": video_path,
                    "thumbnail": ""
                })
        
        # 2. Create images (Duplicate existing valid images)
        if existing_images and image_count > 0:
            print(f"  - Duplicating existing {len(existing_images)} images to fill gaps...")
            for i in range(image_count):
                source_image = existing_images[i % len(existing_images)]
                new_image_path = self.pexels_images_dir / f"duplicate_image_{i}_{source_image.name}"
                self.pexels_images_dir.mkdir(parents=True, exist_ok=True)
                try:
                    shutil.copy2(source_image, new_image_path)
                    image_paths.append(new_image_path)
                except Exception as e:
                    print(f"Error duplicating image: {e}")
        elif image_count > 0:
            # Fallback to dummy
            print("  - [WARNING] No existing images to duplicate. Creating dummy files...")
            for i in range(image_count):
                image_path = self.pexels_images_dir / f"placeholder_image_{i}.jpg"
                self.pexels_images_dir.mkdir(parents=True, exist_ok=True)
                jpeg_header = b'\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00'
                jpeg_footer = b'\xFF\xD9'
                with open(image_path, 'wb') as f:
                    f.write(jpeg_header)
                    f.write(b'\x00' * (1024 * 50))  # 50KB
                    f.write(jpeg_footer)
                image_paths.append(image_path)
            
        return video_paths, image_paths
    
    def _create_files_from_local(self, user_detail_ids: List[str], video_items: List[Dict], image_paths: List[str]):
        """Create FileDocument entries from local files and copy to uploads/{user_detail_id}"""
        print(f"\nCreating file documents and copying to uploads...")
        
        files = []
        
        # Process videos
        for i, video_item in enumerate(video_items):
            video_path = video_item["path"]
            thumbnail_url = video_item.get("thumbnail", "")
            
            if not os.path.exists(str(video_path)):
                continue
            
            user_detail_id = random.choice(user_detail_ids)
            user_upload_dir = self.uploads_dir / str(user_detail_id)
            user_upload_dir.mkdir(parents=True, exist_ok=True)
            
            # Copy file to uploads/{user_detail_id}
            filename = f"video_{ObjectId()}.mp4"
            dest_path = user_upload_dir / filename
            
            shutil.copy2(str(video_path), str(dest_path))
            
            # Get file size
            file_size = os.path.getsize(str(dest_path))
            
            # Create file document
            file_url = f"http://{SERVER_HOST}:{SERVER_PORT}{CONTEXT_PATH}/files/{user_detail_id}/{filename}"
            file_id = str(ObjectId())
            
            file_doc = {
                "_id": file_id,  # String ID for Spring Boot
                "file_name": filename,
                "original_file_name": os.path.basename(video_path),
                "size": file_size,
                "public_id": str(ObjectId()),
                "url": file_url,
                "resource_type": "video",
                "width": 1920,
                "height": 1080,
                "etag": "",
                "created_at": datetime.now() - timedelta(days=random.randint(1, 30)),
                "updated_at": datetime.now()
            }
            files.append(file_doc)
            
            # Store thumbnail for this file ID
            if thumbnail_url:
                self.video_thumbnails[file_id] = thumbnail_url
        
        # Process images
        for i, image_path in enumerate(image_paths):
            if not os.path.exists(str(image_path)):
                continue
            
            user_detail_id = random.choice(user_detail_ids)
            user_upload_dir = self.uploads_dir / str(user_detail_id)
            user_upload_dir.mkdir(parents=True, exist_ok=True)
            
            # Copy file to uploads/{user_detail_id}
            filename = f"image_{ObjectId()}.jpg"
            dest_path = user_upload_dir / filename
            
            shutil.copy2(str(image_path), str(dest_path))
            
            # Get file size
            file_size = os.path.getsize(str(dest_path))
            
            # Create file document
            file_url = f"http://{SERVER_HOST}:{SERVER_PORT}{CONTEXT_PATH}/files/{user_detail_id}/{filename}"
            
            file_doc = {
                "_id": str(ObjectId()),  # String ID for Spring Boot
                "file_name": filename,
                "original_file_name": os.path.basename(image_path),
                "size": file_size,
                "public_id": str(ObjectId()),
                "url": file_url,
                "resource_type": "image",
                "width": 1920,
                "height": 1080,
                "etag": "",
                "created_at": datetime.now() - timedelta(days=random.randint(1, 30)),
                "updated_at": datetime.now()
            }
            files.append(file_doc)
        
        if files:
            result = self.files_col.insert_many(files)
            self.file_ids = [str(fid) for fid in result.inserted_ids]
            print(f"Created {len(files)} file documents")
    
    def _create_videos(self, file_ids: List[str]):
        """Create Video entities"""
        print(f"\nCreating videos...")
        
        videos = []
        video_file_ids = [fid for i, fid in enumerate(self.file_ids) if i < len(file_ids) // 2]
        
        for file_id in video_file_ids:
            video = {
                "_id": str(ObjectId()),  # String ID for Spring Boot compatibility
                "file_ref": DBRef(collection="files", id=file_id if isinstance(file_id, str) else str(file_id)),
                "duration": random.uniform(10, 300),  # 10s to 5min
                "thumbnail_url": self.video_thumbnails.get(file_id, ""), # Add thumbnail URL
                "created_at": datetime.now() - timedelta(days=random.randint(1, 30)),
                "updated_at": datetime.now()
            }
            videos.append(video)
        
        if videos:
            result = self.videos_col.insert_many(videos)
            self.video_ids = [str(vid) for vid in result.inserted_ids]
            print(f"Created {len(videos)} videos")
    
    def _create_image_slides(self, file_ids: List[str]):
        """Create ImageSlide entities"""
        print(f"\nCreating image slides...")
        
        image_slides = []
        image_file_ids = [fid for i, fid in enumerate(self.file_ids) if i >= len(self.file_ids) // 2]
        
        # Group images into slides (2-5 images per slide)
        images_per_slide = random.randint(2, 5)
        for i in range(0, len(image_file_ids), images_per_slide):
            slide_images = image_file_ids[i:i+images_per_slide]
            if len(slide_images) < 2:
                break
            
            # Use string IDs for DBRef
            image_refs = [DBRef(collection="files", id=fid if isinstance(fid, str) else str(fid)) for fid in slide_images]
            
            image_slide = {
                "_id": str(ObjectId()),  # String ID for Spring Boot
                "images_ref": image_refs,
                "created_at": datetime.now() - timedelta(days=random.randint(1, 30)),
                "updated_at": datetime.now()
            }
            image_slides.append(image_slide)
        
        if image_slides:
            result = self.image_slides_col.insert_many(image_slides)
            self.image_slide_ids = [str(iid) for iid in result.inserted_ids]
            print(f"Created {len(image_slides)} image slides")
    
    def _create_hashtags(self, count: int):
        """Create hashtags"""
        print(f"\nCreating {count} hashtags...")
        
        hashtag_names = [
            "nature", "travel", "food", "fitness", "music", "art", "photography",
            "fashion", "beauty", "tech", "gaming", "sports", "cooking", "pets",
            "motivation", "lifestyle", "adventure", "explore", "love", "happy"
        ]
        
        hashtags = []
        for i in range(count):
            name = hashtag_names[i % len(hashtag_names)] + (f"_{i}" if i >= len(hashtag_names) else "")
            hashtag = {
                "_id": str(ObjectId()),  # String ID for Spring Boot
                "name": name,
                "view_count": random.randint(0, 10000),
                "video_count": 0,  # Will be updated later
                "created_at": datetime.now() - timedelta(days=random.randint(1, 365)),
                "updated_at": datetime.now()
            }
            hashtags.append(hashtag)
        
        if hashtags:
            result = self.hashtags_col.insert_many(hashtags)
            self.hashtag_ids = [str(hid) for hid in result.inserted_ids]
            print(f"Created {len(hashtags)} hashtags")
    
    def _create_feed_items(self, user_detail_ids: List[str]):
        """Create FeedItems with Videos and ImageSlides"""
        print(f"\nCreating feed items...")
        
        feed_items = []
        
        # Video feed items
        for video_id in self.video_ids:
            uploader_id = random.choice(user_detail_ids)
            hashtag_count = random.randint(1, 5)
            hashtag_refs = [
                DBRef(collection="hashtags", id=hid if isinstance(hid, str) else str(hid))
                for hid in [random.choice(self.hashtag_ids) for _ in range(hashtag_count)]
            ]
            
            # Create metadata with string ID
            metadata = {
                "_id": str(ObjectId()),  # String ID for Spring Boot
                "loves_count": 0,
                "comments_count": 0,
                "views_count": 0,
                "shares_count": 0
            }
            metadata_id = self.metadata_col.insert_one(metadata).inserted_id
            
            # Use string IDs for all references
            video_id_str = video_id if isinstance(video_id, str) else str(video_id)
            uploader_id_str = uploader_id if isinstance(uploader_id, str) else str(uploader_id)
            metadata_id_str = metadata_id if isinstance(metadata_id, str) else str(metadata_id)
            
            feed_item = {
                "_id": str(ObjectId()),  # Generate string ID for Spring Boot compatibility
                "feed_item_type": "VIDEO",
                "video_ref": DBRef(collection="videos", id=video_id_str),
                "title": fake.sentence(nb_words=6),
                "description": fake.text(max_nb_chars=500),
                "hashtags_ref": hashtag_refs,
                "comments_ref": [],
                "metadata_ref": DBRef(collection="metadata", id=metadata_id_str),
                "loved_by": [],
                "uploader_ref": DBRef(collection="user_details", id=uploader_id_str),
                "report_count": 0,
                "active": True,
                "created_at": datetime.now() - timedelta(days=random.randint(1, 30)),
                "updated_at": datetime.now()
            }
            feed_items.append(feed_item)
        
        # Image slide feed items
        for image_slide_id in self.image_slide_ids:
            uploader_id = random.choice(user_detail_ids)
            hashtag_count = random.randint(1, 5)
            hashtag_refs = [
                DBRef(collection="hashtags", id=hid if isinstance(hid, str) else str(hid))
                for hid in [random.choice(self.hashtag_ids) for _ in range(hashtag_count)]
            ]
            
            # Create metadata with string ID
            metadata = {
                "_id": str(ObjectId()),  # String ID for Spring Boot
                "loves_count": 0,
                "comments_count": 0,
                "views_count": 0,
                "shares_count": 0
            }
            metadata_id = self.metadata_col.insert_one(metadata).inserted_id
            
            # Use string IDs for all references
            image_slide_id_str = image_slide_id if isinstance(image_slide_id, str) else str(image_slide_id)
            uploader_id_str = uploader_id if isinstance(uploader_id, str) else str(uploader_id)
            metadata_id_str = metadata_id if isinstance(metadata_id, str) else str(metadata_id)
            
            feed_item = {
                "_id": str(ObjectId()),  # Generate string ID for Spring Boot compatibility
                "feed_item_type": "IMAGE_SLIDE",
                "image_slide_ref": DBRef(collection="image_slides", id=image_slide_id_str),
                "title": fake.sentence(nb_words=6),
                "description": fake.text(max_nb_chars=500),
                "hashtags_ref": hashtag_refs,
                "comments_ref": [],
                "metadata_ref": DBRef(collection="metadata", id=metadata_id_str),
                "loved_by": [],
                "uploader_ref": DBRef(collection="user_details", id=uploader_id_str),
                "report_count": 0,
                "active": True,
                "created_at": datetime.now() - timedelta(days=random.randint(1, 30)),
                "updated_at": datetime.now()
            }
            feed_items.append(feed_item)
        
        if feed_items:
            result = self.feed_items_col.insert_many(feed_items)
            self.feed_item_ids = list(result.inserted_ids)
            print(f"Created {len(feed_items)} feed items")
    
    def _create_comments(self, feed_item_ids: List[str], user_detail_ids: List[str], min_per_feed: int, max_per_feed: int):
        """Create comments for feed items"""
        print(f"\nCreating comments...")
        
        comments = []
        
        for feed_item_id in feed_item_ids:
            comment_count = random.randint(min_per_feed, max_per_feed)
            
            for _ in range(comment_count):
                user_detail_id = random.choice(user_detail_ids)
                
                comment = {
                    "_id": str(ObjectId()),  # String ID for Spring Boot
                    "content": fake.sentence(nb_words=random.randint(5, 20)),
                    "love_count": 0,
                    "dislike_count": 0,
                    "reply_count": 0,
                    "loved_by": [],
                    "disliked_by": [],
                    "user_detail_id": user_detail_id,
                    "avatar_url": "",
                    "feed_item_id": feed_item_id,
                    "created_at": datetime.now() - timedelta(days=random.randint(0, 30)),
                    "updated_at": datetime.now()
                }
                comments.append(comment)
        
        if comments:
            result = self.comments_col.insert_many(comments)
            comment_ids = [str(cid) for cid in result.inserted_ids]
            
            # Update feed items with comment refs AND update metadata
            for i, feed_item_id in enumerate(feed_item_ids):
                feed_comments = [c for j, c in enumerate(comment_ids) if comments[j]["feed_item_id"] == feed_item_id]
                if feed_comments:
                    # Use string IDs for DBRef
                    comment_refs = [DBRef(collection="comments", id=cid if isinstance(cid, str) else str(cid)) for cid in feed_comments[:10]]
                    # Use string ID for feed_item_id
                    feed_item_id_str = feed_item_id if isinstance(feed_item_id, str) else str(feed_item_id)
                    
                    # Update feed item with comment refs
                    self.feed_items_col.update_one(
                        {"_id": feed_item_id_str},
                        {"$set": {"comments_ref": comment_refs}}
                    )
                    
                    # Update metadata with comment count
                    feed_item = self.feed_items_col.find_one({"_id": feed_item_id_str})
                    if feed_item and "metadata_ref" in feed_item:
                        metadata_ref = feed_item["metadata_ref"]
                        if metadata_ref:
                            metadata_id = metadata_ref.id if hasattr(metadata_ref, 'id') else str(metadata_ref)
                            self.metadata_col.update_one(
                                {"_id": metadata_id},
                                {"$set": {"comments_count": len(feed_comments)}}
                            )
            
            print(f"Created {len(comments)} comments")
    
    def _create_user_interactions(self, feed_item_ids: List[str], user_detail_ids: List[str], multiplier: int):
        """Create user interactions and update metadata + user preferences"""
        print(f"\nCreating user interactions...")
        
        interaction_types = ["VIEW", "LIKE", "COMMENT", "SHARE", "WATCH_COMPLETE"]
        interactions = []
        
        # Track metadata updates per feed item
        metadata_updates = {}  # feed_item_id -> {views: count, loves: count}
        
        # Track user preferences updates
        user_watched = {}  # user_detail_id -> [feed_item_ids]
        user_liked = {}    # user_detail_id -> [feed_item_ids]
        
        for feed_item_id in feed_item_ids:
            # Initialize metadata tracking
            if feed_item_id not in metadata_updates:
                metadata_updates[feed_item_id] = {"views": 0, "loves": 0, "shares": 0}
            
            # Each feed item gets multiple interactions
            interaction_count = random.randint(multiplier * 3, multiplier * 10)
            
            # Track which users have viewed/liked this feed item
            viewers = set()
            likers = set()
            
            for _ in range(interaction_count):
                user_detail_id = random.choice(user_detail_ids)
                interaction_type = random.choice(interaction_types)
                
                interaction = {
                    "_id": str(ObjectId()),  # String ID for Spring Boot
                    "user_detail_id": user_detail_id,
                    "creator_id": "",  # Will be set from feed item uploader
                    "feed_item_id": feed_item_id,
                    "interaction_type": interaction_type,
                    "watch_duration": random.uniform(0, 300) if interaction_type in ["VIEW", "WATCH_COMPLETE"] else None,
                    "watch_percentage": random.uniform(0, 100) if interaction_type in ["VIEW", "WATCH_COMPLETE"] else None,
                    "created_at": datetime.now() - timedelta(days=random.randint(0, 30))
                }
                interactions.append(interaction)
                
                # Track views
                if interaction_type in ["VIEW", "WATCH_COMPLETE"]:
                    if user_detail_id not in viewers:
                        metadata_updates[feed_item_id]["views"] += 1
                        viewers.add(user_detail_id)
                        
                        # Add to user's watched list
                        if user_detail_id not in user_watched:
                            user_watched[user_detail_id] = []
                        if feed_item_id not in user_watched[user_detail_id]:
                            user_watched[user_detail_id].append(feed_item_id)
                
                # Track likes
                if interaction_type == "LIKE":
                    if user_detail_id not in likers:
                        metadata_updates[feed_item_id]["loves"] += 1
                        likers.add(user_detail_id)
                        
                        # Add to user's liked list
                        if user_detail_id not in user_liked:
                            user_liked[user_detail_id] = []
                        if feed_item_id not in user_liked[user_detail_id]:
                            user_liked[user_detail_id].append(feed_item_id)
                
                # Track shares
                if interaction_type == "SHARE":
                    metadata_updates[feed_item_id]["shares"] += 1
        
        # Insert all interactions
        if interactions:
            self.user_interactions_col.insert_many(interactions)
            print(f"Created {len(interactions)} user interactions")
        
        # Update metadata for each feed item
        print(f"Updating metadata for {len(metadata_updates)} feed items...")
        for feed_item_id, counts in metadata_updates.items():
            feed_item_id_str = feed_item_id if isinstance(feed_item_id, str) else str(feed_item_id)
            feed_item = self.feed_items_col.find_one({"_id": feed_item_id_str})
            
            if feed_item and "metadata_ref" in feed_item:
                metadata_ref = feed_item["metadata_ref"]
                if metadata_ref:
                    metadata_id = metadata_ref.id if hasattr(metadata_ref, 'id') else str(metadata_ref)
                    self.metadata_col.update_one(
                        {"_id": metadata_id},
                        {
                            "$inc": {
                                "views_count": counts["views"],
                                "loves_count": counts["loves"],
                                "shares_count": counts["shares"]
                            }
                        }
                    )
        
        # Update user preferences with watched and liked lists
        print(f"Updating user preferences for {len(user_watched)} users with watched lists...")
        for user_detail_id, watched_items in user_watched.items():
            self.user_preferences_col.update_one(
                {"user_detail_id": user_detail_id},
                {"$addToSet": {"watched_list": {"$each": watched_items}}},
                upsert=True
            )
        
        print(f"Updating user preferences for {len(user_liked)} users with liked lists...")
        for user_detail_id, liked_items in user_liked.items():
            self.user_preferences_col.update_one(
                {"user_detail_id": user_detail_id},
                {"$addToSet": {"liked_list": {"$each": liked_items}}},
                upsert=True
            )
    
    def _create_following_relationships(self, user_detail_ids: List[str], percentage: float):
        """Create following relationships"""
        print(f"\nCreating following relationships...")
        
        follow_count = 0
        for user_detail_id in user_detail_ids:
            if random.random() < percentage:
                # Each user follows 1-10 other users
                following_count = random.randint(1, 10)
                following_ids = random.sample(
                    [uid for uid in user_detail_ids if uid != user_detail_id],
                    min(following_count, len(user_detail_ids) - 1)
                )
                
                following_refs = [DBRef(collection="user_details", id=ObjectId(fid)) for fid in following_ids]
                
                self.user_details_col.update_one(
                    {"_id": ObjectId(user_detail_id)},
                    {
                        "$set": {
                            "following_ref": following_refs,
                            "following_count": len(following_refs)
                        }
                    }
                )
                
                # Update followers
                for following_id in following_ids:
                    self.user_details_col.update_one(
                        {"_id": ObjectId(following_id)},
                        {
                            "$inc": {"follower_count": 1},
                            "$addToSet": {"follower_ref": DBRef(collection="user_details", id=ObjectId(user_detail_id))}
                        }
                    )
                
                follow_count += len(following_ids)
        
        print(f"Created {follow_count} following relationships")

    def _create_user_preferences(self, user_detail_ids: List[str], feed_item_ids: List[str]):
        """Create UserPreference entities with watched list"""
        print(f"\nCreating user preferences...")
        
        created_count = 0
        for user_detail_id in user_detail_ids:
            # Randomly assign some watched videos
            watched_count = random.randint(0, 10)
            watched_list = []
            if feed_item_ids:
                watched_list = random.sample(feed_item_ids, min(watched_count, len(feed_item_ids)))
                # Convert to strings
                watched_list = [str(wid) for wid in watched_list]
            
            # Randomly assign some liked videos (subset of watched)
            liked_list = []
            if watched_list:
                liked_count = random.randint(0, len(watched_list))
                liked_list = random.sample(watched_list, liked_count)
            
            # Use upsert to avoid duplicate key errors
            # This will update existing preferences or create new ones
            result = self.user_preferences_col.update_one(
                {"user_detail_id": user_detail_id},
                {
                    "$setOnInsert": {
                        "_id": str(ObjectId()),  # String ID for Spring Boot
                        "user_detail_id": user_detail_id,
                        "hashtag_scores": {},
                        "creator_scores": {},
                        "preferred_video_duration": 0.0,
                        "last_seen_feed_items": []
                    },
                    "$addToSet": {
                        "watched_list": {"$each": watched_list},
                        "liked_videos": {"$each": liked_list}
                    },
                    "$set": {
                        "updated_at": datetime.now()
                    }
                },
                upsert=True
            )
            
            if result.upserted_id or result.modified_count > 0:
                created_count += 1
            
        print(f"Created/Updated {created_count} user preferences")
    
    def _create_search_history(self, user_detail_ids: List[str], min_per_user: int, max_per_user: int):
        """Create search history for users"""
        print(f"\nCreating search history...")
        
        # Get hashtag names for realistic searches
        hashtag_names = []
        hashtags = list(self.hashtags_col.find({}, {"name": 1}))
        hashtag_names = [h["name"] for h in hashtags if "name" in h]
        
        # Get user display names for user searches
        user_names = []
        users = list(self.user_details_col.find({}, {"display_name": 1, "shown_name": 1}))
        for u in users:
            if "display_name" in u:
                user_names.append(u["display_name"])
            if "shown_name" in u:
                user_names.append(u["shown_name"])
        
        # Common search queries
        common_queries = [
            "funny videos", "dance", "music", "cooking", "travel",
            "fitness", "makeup", "gaming", "pets", "nature",
            "art", "photography", "fashion", "food", "tech"
        ]
        
        search_histories = []
        
        for user_detail_id in user_detail_ids:
            search_count = random.randint(min_per_user, max_per_user)
            
            for _ in range(search_count):
                # Mix of hashtag searches, user searches, and common queries
                query_type = random.choice(["hashtag", "user", "common", "random"])
                
                if query_type == "hashtag" and hashtag_names:
                    query = random.choice(hashtag_names)
                elif query_type == "user" and user_names:
                    query = random.choice(user_names)
                elif query_type == "common":
                    query = random.choice(common_queries)
                else:
                    # Random fake query
                    query = fake.word() + " " + random.choice(["video", "videos", ""])
                
                search_history = {
                    "_id": str(ObjectId()),
                    "user_detail_id": user_detail_id,
                    "query": query.strip(),
                    "created_at": datetime.now() - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
                }
                search_histories.append(search_history)
        
        if search_histories:
            self.search_history_col.insert_many(search_histories)
            print(f"Created {len(search_histories)} search history entries")
    
    def generate_data(self, preset: str = "small"):
        """Generate all data based on preset"""
        config = PRESETS[preset]
        
        print("=" * 60)
        print(f"GENERATING DATA - {preset.upper()} PRESET")
        print("=" * 60)
        
        # 1. Create roles
        self._create_roles()
        
        # 2. Create users via API
        self._create_users(config["users"])
        
        if not self.user_detail_ids:
            print("[WARNING] No user detail IDs collected. Trying to get from database...")
            # Get all user details from database (except admin if needed)
            all_user_details = list(self.user_details_col.find({}, {"_id": 1}))
            self.user_detail_ids = [str(ud["_id"]) for ud in all_user_details]
            print(f"Found {len(self.user_detail_ids)} user details in database")
        
        if not self.user_detail_ids:
            print("[ERROR] No user details found. Aborting.")
            print("[INFO] Make sure backend is running and admin user exists.")
            return
        
        # 3. Download real videos and images from Pexels (or create placeholders)
        video_items, image_paths = self._download_pexels_media(
            config["videos"], 
            config["image_slides"] * 3  # 3 images per slide
        )
        
        # 5. Create files and copy to uploads
        self._create_files_from_local(self.user_detail_ids, video_items, image_paths)
        
        if not self.file_ids:
            print("[ERROR] No files created. Aborting.")
            return
        
        # 6. Create videos
        self._create_videos(self.file_ids)
        
        # 7. Create image slides
        self._create_image_slides(self.file_ids)
        
        # 8. Create hashtags
        self._create_hashtags(config["hashtags"])
        
        # 9. Create feed items
        self._create_feed_items(self.user_detail_ids)
        
        # 10. Create comments
        self._create_comments(
            self.feed_item_ids,
            self.user_detail_ids,
            config["comments_per_feed"][0],
            config["comments_per_feed"][1]
        )
        
        # 11. Create user interactions
        self._create_user_interactions(
            self.feed_item_ids,
            self.user_detail_ids,
            config["interactions_multiplier"]
        )
        
        # 12. Create following relationships
        self._create_following_relationships(
            self.user_detail_ids,
            config["following_percentage"]
        )

        # 13. Create user preferences
        self._create_user_preferences(self.user_detail_ids, self.feed_item_ids)
        
        # 14. Create search history
        self._create_search_history(
            self.user_detail_ids,
            config["search_history_per_user"][0],
            config["search_history_per_user"][1]
        )
        
        print("\n" + "=" * 60)
        print("DATA GENERATION COMPLETE!")
        print("=" * 60)
        self.check_database()
        
        # Cleanup: Delete pexels_data folder to save disk space
        print("\nCleaning up temporary files...")
        pexels_data_dir = Path(__file__).parent / "pexels_data"
        if pexels_data_dir.exists():
            try:
                shutil.rmtree(str(pexels_data_dir))
                print(f"✓ Deleted temporary folder: {pexels_data_dir}")
            except Exception as e:
                print(f"⚠ Could not delete pexels_data folder: {e}")
                print(f"  You can manually delete: {pexels_data_dir}")
        
        print("\n✓ All files are now in backend/uploads/ only")
        print("✓ No duplicate storage!")
    
    def clear_all_data(self):
        """Clear all data from database and uploads folder"""
        print("\n" + "=" * 60)
        print("CLEARING ALL DATA")
        print("=" * 60)
        
        confirm = input("Are you sure you want to delete ALL data? (yes/no): ").strip().lower()
        if confirm != "yes":
            print("Operation cancelled.")
            return
        
        print("\nDeleting collections...")
        collections = [
            'users', 'user_details', 'roles', 'files', 'videos',
            'image_slides', 'feed_items', 'comments', 'user_interactions',
            'hashtags', 'metadata', 'conversations', 'chat_messages',
            'invalid_tokens', 'report_tickets', 'user_preferences', 'search_history'
        ]
        
        deleted_counts = {}
        for col_name in collections:
            try:
                count = self.db[col_name].count_documents({})
                if count > 0:
                    self.db[col_name].delete_many({})
                    deleted_counts[col_name] = count
                    print(f"Deleted {count} documents from {col_name}")
            except Exception as e:
                print(f"Error deleting {col_name}: {e}")
        
        # Keep admin user and roles
        print("\nRecreating admin user and roles...")
        self._create_roles()
        admin = self.users_col.find_one({"username": "admin"})
        if not admin:
            self._create_admin_user()
        
        # Delete uploads folder (backend/uploads)
        print("\nDeleting uploads folder...")
        if self.uploads_dir.exists():
            try:
                # Delete all subdirectories but keep uploads folder
                for item in self.uploads_dir.iterdir():
                    if item.is_dir():
                        shutil.rmtree(str(item))
                        print(f"Deleted: {item}")
                    elif item.is_file():
                        item.unlink()
                        print(f"Deleted file: {item}")
                print(f"Cleared uploads folder: {self.uploads_dir}")
            except Exception as e:
                print(f"Error deleting uploads folder: {e}")
        
        # Delete pexels data folder (optional cleanup)
        print("\nDeleting pexels data folder...")
        if self.pexels_videos_dir.parent.exists():
            try:
                shutil.rmtree(str(self.pexels_videos_dir.parent))
                print(f"Deleted pexels data folder: {self.pexels_videos_dir.parent}")
            except Exception as e:
                print(f"Error deleting pexels data folder: {e}")
        
        print("\n" + "=" * 60)
        print("DATA CLEARED SUCCESSFULLY!")
        print("=" * 60)
        print(f"Total collections cleared: {len(deleted_counts)}")
        total_deleted = sum(deleted_counts.values())
        print(f"Total documents deleted: {total_deleted}")
        print("=" * 60)
    
    def check_database(self):
        """Check database statistics"""
        print("\n" + "=" * 60)
        print("DATABASE STATISTICS")
        print("=" * 60)
        
        collections = [
            'users', 'user_details', 'roles', 'files', 'videos',
            'image_slides', 'feed_items', 'comments', 'user_interactions',
            'hashtags', 'metadata', 'user_preference', 'search_history'
        ]
        
        for col_name in collections:
            count = self.db[col_name].count_documents({})
            print(f"{col_name:20s}: {count:6d}")
        
        print("=" * 60)
    
    def close(self):
        """Close database connection"""
        if self.client:
            self.client.close()


def main():
    print("=" * 60)
    print("DATA MANAGER FULL - Complete Fake Data Generator")
    print("=" * 60)
    print("\nSelect option:")
    print("1. XLarge dataset (100 users, 500 videos, 100 image slides) - Production scale")
    print("2. Large dataset (50 users, 200 videos, 100 image slides)")
    print("3. Small dataset (10 users, 50 videos, 25 image slides)")
    print("4. Test dataset (10 users, 20 videos, 10 image slides) - Quick test")
    print("5. Clear all data")
    print("6. Exit")
    
    choice = input("\nEnter choice (1-6): ").strip()
    
    manager = DataManagerFull()
    
    try:
        if choice == "1":
            preset = "xlarge"
            manager.generate_data(preset)
        elif choice == "2":
            preset = "large"
            manager.generate_data(preset)
        elif choice == "3":
            preset = "small"
            manager.generate_data(preset)
        elif choice == "4":
            preset = "test"
            manager.generate_data(preset)
        elif choice == "5":
            manager.clear_all_data()
        else:
            print("Exiting...")
            return
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        manager.close()


if __name__ == "__main__":
    main()

