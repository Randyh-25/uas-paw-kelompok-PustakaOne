import base64
import cloudinary
import cloudinary.uploader
from pyramid.httpexceptions import HTTPBadRequest, HTTPInternalServerError
from pyramid.view import view_config

from ..models.user import UserRole
from .utils import current_user, json_payload, require_role


def get_cloudinary_config(request):
    """Get Cloudinary configuration from settings"""
    settings = request.registry.settings
    return {
        'cloud_name': settings.get('cloudinary.cloud_name'),
        'api_key': settings.get('cloudinary.api_key'),
        'api_secret': settings.get('cloudinary.api_secret')
    }


@view_config(route_name="cloudinary.upload", request_method="POST", renderer="json")
def upload_image(request):
    """Upload image to Cloudinary and return the URL"""
    user = current_user(request)
    require_role(user, [UserRole.librarian.value])

    # Configure Cloudinary with settings from request
    config = get_cloudinary_config(request)
    cloudinary.config(
        cloud_name=config['cloud_name'],
        api_key=config['api_key'],
        api_secret=config['api_secret']
    )

    data = json_payload(request)
    
    if not data.get("image"):
        raise HTTPBadRequest(json_body={"error": "Image data is required"})
    
    try:
        image_data = data["image"]
        
        # If image is base64, upload directly
        if image_data.startswith('data:image'):
            # Upload to Cloudinary
            result = cloudinary.uploader.upload(
                image_data,
                folder="library_books",  # Organize in a folder
                resource_type="image",
                allowed_formats=["jpg", "png", "jpeg", "gif", "webp"]
            )
            
            return {
                "url": result["secure_url"],
                "public_id": result["public_id"]
            }
        else:
            raise HTTPBadRequest(json_body={"error": "Invalid image format"})
            
    except cloudinary.exceptions.Error as e:
        raise HTTPInternalServerError(json_body={"error": f"Cloudinary error: {str(e)}"})
    except Exception as e:
        raise HTTPInternalServerError(json_body={"error": f"Upload failed: {str(e)}"})
