"""
Configuration file for data generation scripts
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Get project root directory (parent of scripts folder)
PROJECT_ROOT = Path(__file__).parent.parent
BACKEND_DIR = PROJECT_ROOT / "backend"
SCRIPTS_DIR = Path(__file__).parent

# Load environment variables from scripts/.env first, then backend/.env, then root .env
env_files = [
    SCRIPTS_DIR / ".env",
    BACKEND_DIR / ".env",
    PROJECT_ROOT / ".env"
]

for env_file in env_files:
    if env_file.exists():
        load_dotenv(env_file, override=True)
        print(f"Loaded .env from: {env_file}")
        break

# MongoDB Configuration - Try to get from MONGODB_URL first
MONGODB_URL = os.getenv("MONGODB_URL", "")
if MONGODB_URL:
    # Parse MONGODB_URL: mongodb://username:password@host:port/database?authSource=admin
    MONGO_URI = MONGODB_URL
    print(f"Using MONGODB_URL from .env: {MONGODB_URL.split('@')[0]}@***")
else:
    # Fallback to individual components
    MONGO_HOST = os.getenv("MONGO_HOST", "localhost")
    MONGO_PORT = int(os.getenv("MONGO_PORT", 27017))
    MONGO_USERNAME = os.getenv("MONGODB_USERNAME") or os.getenv("MONGO_USERNAME", "superadmin")
    MONGO_PASSWORD = os.getenv("MONGODB_PASSWORD") or os.getenv("MONGO_PASSWORD", "123456")
    MONGO_DATABASE = os.getenv("MONGO_DATABASE", "thesocial")
    MONGO_AUTH_SOURCE = os.getenv("MONGO_AUTH_SOURCE", "admin")
    
    # Construct MongoDB URI
    if MONGO_USERNAME and MONGO_PASSWORD:
        MONGO_URI = f"mongodb://{MONGO_USERNAME}:{MONGO_PASSWORD}@{MONGO_HOST}:{MONGO_PORT}/{MONGO_DATABASE}?authSource={MONGO_AUTH_SOURCE}"
    else:
        MONGO_URI = f"mongodb://{MONGO_HOST}:{MONGO_PORT}/{MONGO_DATABASE}"

# Extract database name from URI if not set
if MONGODB_URL:
    # Extract database name from URI
    if "/" in MONGODB_URL.split("?")[0]:
        DATABASE_NAME = MONGODB_URL.split("/")[-1].split("?")[0]
    else:
        DATABASE_NAME = os.getenv("MONGO_DATABASE", "thesocial")
else:
    DATABASE_NAME = os.getenv("MONGO_DATABASE", "thesocial")

# Backend API Configuration
SERVER_HOST = os.getenv("SERVER_HOST", "localhost")
SERVER_PORT = os.getenv("SERVER_PORT", "8082")

CONTEXT_PATH = os.getenv("CONTEXT_PATH", "/api/v1")

# API Base URL
API_BASE_URL = f"http://{SERVER_HOST}:{SERVER_PORT}{CONTEXT_PATH}"

# File Upload URL
FILE_BASE_URL = f"{API_BASE_URL}/files"

# Backend uploads directory
BACKEND_UPLOADS_DIR = BACKEND_DIR / "uploads"

# Pexels API Key (optional - for downloading real videos/images)
PEXELS_API_KEY = os.getenv("PEXELS_API_KEY", "")

# Print configuration (for debugging)
if __name__ == "__main__":
    print("=" * 60)
    print("CONFIGURATION")
    print("=" * 60)
    print("MongoDB Configuration:")
    # Mask password in URI
    masked_uri = MONGO_URI
    if "@" in masked_uri:
        parts = masked_uri.split("@")
        if ":" in parts[0]:
            user_pass = parts[0].split("//")[1]
            if ":" in user_pass:
                user = user_pass.split(":")[0]
                masked_uri = masked_uri.replace(user_pass, f"{user}:***")
    print(f"  URI: {masked_uri}")
    print(f"  Database: {DATABASE_NAME}")
    print("\nBackend API Configuration:")
    print(f"  Base URL: {API_BASE_URL}")
    print(f"  File URL: {FILE_BASE_URL}")
    print(f"  Uploads Dir: {BACKEND_UPLOADS_DIR}")
    print("=" * 60)

