import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException
from app.config import settings
import logging

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024 # 5MB

async def upload_image(file: UploadFile) -> str:
    # 1. Validate file extension
    filename = file.filename.lower()
    if not any(filename.endswith(ext) for ext in ALLOWED_EXTENSIONS):
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # 2. Validate file size
    # We read the file to check size, then seek back
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400, 
            detail="File size too large. Maximum 5MB allowed."
        )
    
    try:
        # 3. Upload to Cloudinary
        # We use upload_resource to handle the bytes we just read
        result = cloudinary.uploader.upload(
            content,
            folder="nanaconnect/pandits",
            transformation=[
                {"width": 800, "height": 800, "crop": "limit"}
            ]
        )
        return result.get("secure_url")
    except Exception as e:
        logger.error(f"Cloudinary upload error: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload image to cloud storage.")
    finally:
        await file.close()
