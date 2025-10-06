"""Cloud Function for automated backup operations"""
import functions_framework
from flask import jsonify
import datetime
import sys
import os

# Add parent directory to path to import utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.gcs import copy_file, list_files
from utils.logger import log_info, log_error, log_request, log_response

@functions_framework.http
def backup_handler(request):
    """
    HTTP Cloud Function to create backups
    Triggered via HTTP request or Cloud Scheduler
    
    Args:
        request (flask.Request): The request object.
        
    Returns:
        flask.Response: JSON response with backup details
    """
    try:
        log_request(request)
        
        # Get request parameters
        request_json = request.get_json(silent=True)
        source_file = request_json.get('source_file') if request_json else None
        
        if not source_file:
            # For demo/scheduled backups, backup all user data files
            source_file = "user-data/important.docx"
        
        # Create timestamp for backup version
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Generate destination path
        filename = source_file.split('/')[-1]
        filename_parts = filename.rsplit('.', 1)
        if len(filename_parts) == 2:
            base_name, extension = filename_parts
            dest_file = f"backups/{base_name}_{timestamp}.{extension}"
        else:
            dest_file = f"backups/{filename}_{timestamp}"
        
        # Copy file to backup location
        copy_file(source_file, dest_file)
        
        log_info(
            f"Backup created successfully",
            source=source_file,
            destination=dest_file,
            timestamp=timestamp
        )
        
        response_data = {
            "status": "success",
            "message": f"Backed up {source_file} to {dest_file}",
            "backup": {
                "source": source_file,
                "destination": dest_file,
                "timestamp": timestamp,
                "version": timestamp
            }
        }
        
        log_response(200, "Backup successful")
        return jsonify(response_data), 200
        
    except Exception as e:
        log_error(f"Backup failed: {str(e)}", error=str(e))
        log_response(500, f"Backup failed: {str(e)}")
        
        return jsonify({
            "status": "error",
            "message": f"Backup failed: {str(e)}"
        }), 500

@functions_framework.http
def list_backups(request):
    """
    HTTP Cloud Function to list all backups
    
    Args:
        request (flask.Request): The request object.
        
    Returns:
        flask.Response: JSON response with list of backups
    """
    try:
        log_request(request)
        
        # List all files in backups folder
        backup_files = list_files(prefix='backups/')
        
        # Parse backup information
        backups = []
        for file_path in backup_files:
            filename = file_path.split('/')[-1]
            # Extract timestamp from filename
            parts = filename.rsplit('_', 1)
            if len(parts) == 2:
                timestamp_part = parts[1].rsplit('.', 1)[0]
                backups.append({
                    'path': file_path,
                    'filename': filename,
                    'version': timestamp_part
                })
        
        log_info(f"Listed {len(backups)} backups")
        log_response(200, f"Found {len(backups)} backups")
        
        return jsonify({
            "status": "success",
            "count": len(backups),
            "backups": backups
        }), 200
        
    except Exception as e:
        log_error(f"Failed to list backups: {str(e)}", error=str(e))
        log_response(500, f"Failed to list backups: {str(e)}")
        
        return jsonify({
            "status": "error",
            "message": f"Failed to list backups: {str(e)}"
        }), 500
