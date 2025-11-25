"""
Pexels Downloader - Download videos and images from Pexels API
"""
import os
import requests
import time
from typing import List, Dict, Optional
from pathlib import Path

class PexelsDownloader:
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Pexels downloader
        
        Args:
            api_key: Pexels API key. If None, will try to get from environment variable PEXELS_API_KEY
        """
        self.api_key = api_key or os.getenv("PEXELS_API_KEY", "")
        if not self.api_key:
            print("[WARNING] PEXELS_API_KEY not found. You can get free API key from https://www.pexels.com/api/")
        
        self.base_url = "https://api.pexels.com"
        self.headers = {
            "Authorization": self.api_key,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        } if self.api_key else {}
        
    def search_videos(self, query: str, per_page: int = 15, page: int = 1) -> Dict:
        """Search videos from Pexels"""
        url = f"{self.base_url}/videos/search"
        params = {
            "query": query,
            "per_page": per_page,
            "page": page
        }
        
        try:
            response = requests.get(url, headers=self.headers, params=params, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error searching videos: {e}")
            return {}
    
    def search_images(self, query: str, per_page: int = 15, page: int = 1) -> Dict:
        """Search images from Pexels"""
        url = f"{self.base_url}/v1/search"
        params = {
            "query": query,
            "per_page": per_page,
            "page": page
        }
        
        try:
            response = requests.get(url, headers=self.headers, params=params, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error searching images: {e}")
            return {}
    
    def download_video(self, video_url: str, save_path: str) -> bool:
        """Download video from URL"""
        try:
            # Increase timeout to 180s (3 mins) to handle large files or slow network
            # Add headers to mimic browser
            response = requests.get(video_url, headers=self.headers, stream=True, timeout=180)
            response.raise_for_status()
            
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            
            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            # Check file size (min 2MB - lowered threshold for HD videos)
            file_size = os.path.getsize(save_path)
            min_size = 2 * 1024 * 1024  # 2MB
            
            if file_size < min_size:
                print(f"  [WARNING] Video file too small ({file_size / 1024 / 1024:.2f} MB < 2MB). Likely corrupt. Deleting...")
                os.remove(save_path)
                return False
            
            return True
        except Exception as e:
            print(f"Error downloading video: {e}")
            if os.path.exists(save_path):
                try:
                    os.remove(save_path)
                except:
                    pass
            return False

    def download_image(self, image_url: str, save_path: str) -> bool:
        """Download image from URL"""
        try:
            response = requests.get(image_url, headers=self.headers, stream=True, timeout=30)
            response.raise_for_status()
            
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            
            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            return True
        except Exception as e:
            print(f"Error downloading image: {e}")
            return False

    def get_video_info(self, video_data: Dict) -> Dict:
        # ... (keep as is) ...
        return {
            "id": video_data.get("id"),
            "url": video_data.get("video_files", [{}])[0].get("link") if video_data.get("video_files") else None,
            "duration": video_data.get("duration", 0),
            "width": video_data.get("width", 0),
            "height": video_data.get("height", 0),
            "thumbnail": video_data.get("image", ""),
            "description": video_data.get("description", "")
        }

    def get_image_info(self, image_data: Dict) -> Dict:
        """Extract image information from Pexels response"""
        return {
            "id": image_data.get("id"),
            "url": image_data.get("src", {}).get("original") if isinstance(image_data.get("src"), dict) else image_data.get("src"),
            "width": image_data.get("width", 0),
            "height": image_data.get("height", 0),
            "description": image_data.get("alt", "")
        }

    def download_videos(self, query: str, count: int, save_dir: str, per_page: int = 15) -> List[Dict]:
        # ... (start of function remains same) ...
        if not self.api_key:
            print("[ERROR] PEXELS_API_KEY is required for downloading videos")
            return []
        
        videos_info = []
        downloaded = 0
        page = 1
        
        print(f"Searching videos with query: '{query}'...")
        
        while downloaded < count:
            result = self.search_videos(query, per_page=min(per_page, count - downloaded), page=page)
            videos = result.get("videos", [])
            
            if not videos:
                print("No more videos found")
                break
            
            for video_data in videos:
                if downloaded >= count:
                    break
                
                video_info = self.get_video_info(video_data)
                if not video_info["url"]:
                    continue
                
                # Select best video quality (Prioritize 1080p or 720p to avoid huge 4K files)
                video_files = video_data.get("video_files", [])
                target_video = None
                
                # Try to find 1920x1080 (Full HD)
                for v in video_files:
                    if v.get("width") == 1920 and v.get("height") == 1080:
                        target_video = v
                        break
                
                # If not found, try 1280x720 (HD)
                if not target_video:
                    for v in video_files:
                        if v.get("width") == 1280 and v.get("height") == 720:
                            target_video = v
                            break
                            
                # Fallback to largest if specific resolutions not found
                if not target_video and video_files:
                     target_video = max(video_files, key=lambda x: x.get("width", 0) * x.get("height", 0))
                
                video_url = target_video.get("link") if target_video else video_info["url"]
                
                # Generate filename
                filename = f"video_{video_info['id']}.mp4"
                save_path = os.path.join(save_dir, filename)
                
                print(f"Downloading video {downloaded + 1}/{count}: {filename}...")
                if self.download_video(video_url, save_path):
                    video_info["local_path"] = save_path
                    video_info["filename"] = filename
                    videos_info.append(video_info)
                    downloaded += 1
                else:
                    print(f"Failed to download video {video_info['id']}")
                
                time.sleep(0.5)  # Rate limiting
            
            page += 1
            if len(videos) < per_page:
                break
        
        print(f"Downloaded {downloaded} videos")
        return videos_info
    
    def download_images(self, query: str, count: int, save_dir: str, per_page: int = 15) -> List[Dict]:
        """
        Download multiple images
        
        Args:
            query: Search query
            count: Number of images to download
            save_dir: Directory to save images
            per_page: Results per page (max 80)
        
        Returns:
            List of image info dictionaries
        """
        if not self.api_key:
            print("[ERROR] PEXELS_API_KEY is required for downloading images")
            return []
        
        images_info = []
        downloaded = 0
        page = 1
        
        print(f"Searching images with query: '{query}'...")
        
        while downloaded < count:
            result = self.search_images(query, per_page=min(per_page, count - downloaded), page=page)
            photos = result.get("photos", [])
            
            if not photos:
                print("No more images found")
                break
            
            for photo_data in photos:
                if downloaded >= count:
                    break
                
                image_info = self.get_image_info(photo_data)
                if not image_info["url"]:
                    continue
                
                # Generate filename
                filename = f"image_{image_info['id']}.jpg"
                save_path = os.path.join(save_dir, filename)
                
                print(f"Downloading image {downloaded + 1}/{count}: {filename}...")
                if self.download_image(image_info["url"], save_path):
                    image_info["local_path"] = save_path
                    image_info["filename"] = filename
                    images_info.append(image_info)
                    downloaded += 1
                else:
                    print(f"Failed to download image {image_info['id']}")
                
                time.sleep(0.3)  # Rate limiting
            
            page += 1
            if len(photos) < per_page:
                break
        
        print(f"Downloaded {downloaded} images")
        return images_info


if __name__ == "__main__":
    # Test
    downloader = PexelsDownloader()
    
    # Test video download
    print("Testing video download...")
    videos = downloader.download_videos("nature", 2, "test_videos")
    print(f"Downloaded {len(videos)} videos")
    
    # Test image download
    print("\nTesting image download...")
    images = downloader.download_images("nature", 2, "test_images")
    print(f"Downloaded {len(images)} images")

