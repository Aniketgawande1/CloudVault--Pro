from flask import Flask, request, jsonify
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'utils'))

from gcs import download_file, list_files
import json

app = Flask(__name__)

@app.route("/", methods=["POST"])
def restore_handler():
    """Handle file restore requests"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        user_path = data.get("user_path")
        backup_name = data.get("backup_name")
        
        if not user_path or not backup_name:
            return jsonify({"error": "user_path and backup_name are required"}), 400
        
        # Download backup manifest
        try:
            backup_path = f"{user_path}/backups"
            manifest_content = download_file(backup_path, f"{backup_name}_manifest.json")
            backup_manifest = json.loads(manifest_content.decode('utf-8'))
        except Exception as e:
            return jsonify({"error": f"Backup manifest not found: {str(e)}"}), 404
        
        # Get list of files to restore
        files_to_restore = backup_manifest.get("files", [])
        
        if not files_to_restore:
            return jsonify({"error": "No files found in backup manifest"}), 404
        
        restored_files = []
        failed_files = []
        
        for file_path in files_to_restore:
            try:
                # Extract filename from full path
                filename = file_path.split('/')[-1]
                
                # Download file content
                file_content = download_file(user_path, filename)
                
                restored_files.append({
                    "filename": filename,
                    "size": len(file_content),
                    "status": "restored"
                })
            except Exception as e:
                failed_files.append({
                    "filename": filename,
                    "error": str(e)
                })
        
        return jsonify({
            "status": "success",
            "backup_name": backup_name,
            "restored_count": len(restored_files),
            "failed_count": len(failed_files),
            "restored_files": restored_files,
            "failed_files": failed_files,
            "message": f"Restore completed. {len(restored_files)} files restored, {len(failed_files)} failed."
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)