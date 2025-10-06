"""Cloud Function for file restore operations"""
import functions_framework
from flask import jsonify
import sys
import os
import base64

# Add parent directory to path to import utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.auth import is_authenticated, get_user_id
from utils.gcs import copy_file, download_file, get_file_metadata
from utils.logger import log_info, log_error, log_request, log_response, log_warning

@functions_framework.http
def restore_handler(request):
    """
    HTTP Cloud Function to restore files from backup
    
    Args:
        request (flask.Request): The request object.
        
    Returns:
        flask.Response: JSON response with restore status
    """
    try:
        # Log the request
        user_id = get_user_id(request)
        log_request(request, user_id=user_id)
        
        # Check authentication
        if not is_authenticated(request):
            log_warning("Unauthorized restore attempt")
            log_response(401, "Unauthorized")
            return jsonify({
                "status": "error",
                "message": "Unauthorized. Please provide valid authentication token."
            }), 401
        
        # Get parameters
        request_json = request.get_json(silent=True)
        backup_version = None
        backup_path = None
        restore_path = None
        
        if request_json:
            backup_version = request_json.get('version')
            backup_path = request_json.get('backup_path')
            restore_path = request_json.get('restore_path')
        
        # Check query parameters
        if not backup_version:
            backup_version = request.args.get('version')
        if not backup_path:
            backup_path = request.args.get('backup_path')
        if not restore_path:
            restore_path = request.args.get('restore_path')
        
        # Validate inputs
        if not backup_version and not backup_path:
            log_warning("Restore failed: No backup version or path provided")
            log_response(400, "No backup version or path provided")
            return jsonify({
                "status": "error",
                "message": "Backup version or path is required"
            }), 400
        
        # Construct backup path if only version is provided
        if backup_version and not backup_path:
            backup_path = f"backups/important_{backup_version}.docx"
        
        # Construct restore path if not provided
        if not restore_path:
            filename = backup_path.split('/')[-1]
            # Remove timestamp from filename
            original_filename = filename.rsplit('_', 1)[0] + '.' + filename.rsplit('.', 1)[1]
            restore_path = f"user-data/{user_id}/{original_filename}"
        
        # Restore file by copying from backup location
        copy_file(backup_path, restore_path)
        
        # Get restored file metadata
        metadata = get_file_metadata(restore_path)
        
        log_info(
            f"File restored successfully",
            backup_path=backup_path,
            restore_path=restore_path,
            user_id=user_id,
            version=backup_version
        )
        
        log_response(200, "Restore successful")
        
        return jsonify({
            "status": "success",
            "message": f"Restored backup version {backup_version or 'from ' + backup_path}",
            "restored_file": {
                "path": restore_path,
                "size": metadata.get('size'),
                "restored_at": metadata.get('updated'),
                "backup_source": backup_path
            }
        }), 200
        
    except Exception as e:
        log_error(
            f"Restore failed: {str(e)}", 
            error=str(e),
            user_id=user_id if 'user_id' in locals() else None,
            backup_path=backup_path if 'backup_path' in locals() else None
        )
        log_response(500, f"Restore failed: {str(e)}")
        
        return jsonify({
            "status": "error",
            "message": f"Restore failed: {str(e)}"
        }), 500

@functions_framework.http
def download_backup(request):
    """
    HTTP Cloud Function to download a backup file
    
    Args:
        request (flask.Request): The request object.
        
    Returns:
        flask.Response: File content or error message
    """
    try:
        # Log the request
        user_id = get_user_id(request)
        log_request(request, user_id=user_id)
        
        # Check authentication
        if not is_authenticated(request):
            log_warning("Unauthorized download attempt")
            log_response(401, "Unauthorized")
            return jsonify({
                "status": "error",
                "message": "Unauthorized"
            }), 401
        
        # Get backup path
        backup_path = request.args.get('backup_path')
        
        if not backup_path:
            request_json = request.get_json(silent=True)
            if request_json:
                backup_path = request_json.get('backup_path')
        
        if not backup_path:
            log_warning("Download failed: No backup path provided")
            log_response(400, "No backup path provided")
            return jsonify({
                "status": "error",
                "message": "Backup path is required"
            }), 400
        
        # Download file content
        file_content = download_file(backup_path)
        
        log_info(
            f"Backup downloaded successfully",
            backup_path=backup_path,
            user_id=user_id,
            size=len(file_content)
        )
        
        log_response(200, "Download successful")
        
        # Return file content
        filename = backup_path.split('/')[-1]
        response = jsonify({
            "status": "success",
            "filename": filename,
            "content": base64.b64encode(file_content).decode('utf-8'),
            "encoding": "base64",
            "size": len(file_content)
        })
        
        return response, 200
        
    except Exception as e:
        log_error(f"Download failed: {str(e)}", error=str(e), user_id=user_id if 'user_id' in locals() else None)
        log_response(500, f"Download failed: {str(e)}")
        
        return jsonify({
            "status": "error",
            "message": f"Download failed: {str(e)}"
        }), 500
