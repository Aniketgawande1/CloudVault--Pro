"""Cloud Function for file upload operations"""
import functions_framework
from flask import jsonify
import sys
import os

# Add parent directory to path to import utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.auth import is_authenticated, get_user_id
from utils.gcs import upload_file, get_file_metadata
from utils.logger import log_info, log_error, log_request, log_response, log_warning
import base64

@functions_framework.http
def upload_handler(request):
    """
    HTTP Cloud Function to handle file uploads
    
    Args:
        request (flask.Request): The request object.
        
    Returns:
        flask.Response: JSON response with upload status
    """
    try:
        # Log the request
        user_id = get_user_id(request)
        log_request(request, user_id=user_id)
        
        # Check authentication
        if not is_authenticated(request):
            log_warning("Unauthorized upload attempt")
            log_response(401, "Unauthorized")
            return jsonify({
                "status": "error",
                "message": "Unauthorized. Please provide valid authentication token."
            }), 401
        
        # Get filename from query parameters or JSON
        filename = None
        file_content = None
        
        # Check if request has JSON data
        request_json = request.get_json(silent=True)
        if request_json:
            filename = request_json.get('filename')
            file_content = request_json.get('content')
            
            # If content is base64 encoded
            if request_json.get('encoding') == 'base64' and file_content:
                file_content = base64.b64decode(file_content)
        
        # Check query parameters
        if not filename:
            filename = request.args.get('filename')
        
        # Check form data for file upload
        if not file_content and 'file' in request.files:
            uploaded_file = request.files['file']
            if uploaded_file.filename:
                filename = filename or uploaded_file.filename
                file_content = uploaded_file.read()
        
        # Check raw body
        if not file_content and request.data:
            file_content = request.data
        
        # Validate inputs
        if not filename:
            log_warning("Upload failed: No filename provided")
            log_response(400, "No filename provided")
            return jsonify({
                "status": "error",
                "message": "Filename is required"
            }), 400
        
        if not file_content:
            log_warning("Upload failed: No file content provided")
            log_response(400, "No file content provided")
            return jsonify({
                "status": "error",
                "message": "File content is required"
            }), 400
        
        # Sanitize filename
        filename = filename.replace('../', '').replace('..\\', '')
        
        # Create user-specific path
        file_path = f"user-data/{user_id}/{filename}"
        
        # Upload file to GCS
        public_url = upload_file(file_path, file_content)
        
        # Get file metadata
        metadata = get_file_metadata(file_path)
        
        log_info(
            f"File uploaded successfully",
            filename=filename,
            path=file_path,
            size=metadata.get('size'),
            user_id=user_id
        )
        
        log_response(200, "Upload successful")
        
        return jsonify({
            "status": "success",
            "message": f"{filename} uploaded successfully",
            "file": {
                "filename": filename,
                "path": file_path,
                "size": metadata.get('size'),
                "url": public_url,
                "uploaded_at": metadata.get('created')
            }
        }), 200
        
    except Exception as e:
        log_error(f"Upload failed: {str(e)}", error=str(e), user_id=user_id if 'user_id' in locals() else None)
        log_response(500, f"Upload failed: {str(e)}")
        
        return jsonify({
            "status": "error",
            "message": f"Upload failed: {str(e)}"
        }), 500
