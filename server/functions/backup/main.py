from flask import Flask, request, jsonify
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'utils'))

from gcs import list_files, upload_file
import json
from datetime import datetime

app = Flask(__name__)

@app.route("/", methods=["POST"])
def backup_handler():
    """Handle backup creation requests"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
            
        user_path = data.get("user_path")
        backup_name = data.get("backup_name", f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
        
        if not user_path:
            return jsonify({"error": "user_path is required"}), 400
        
        # List all files for the user
        user_files = list_files(user_path)
        
        if not user_files:
            return jsonify({"error": "No files found for backup"}), 404
        
        # Create backup manifest
        backup_manifest = {
            "backup_name": backup_name,
            "user_path": user_path,
            "created_at": datetime.now().isoformat(),
            "files": user_files,
            "file_count": len(user_files)
        }
        
        # Save backup manifest
        manifest_content = json.dumps(backup_manifest, indent=2).encode('utf-8')
        backup_path = f"{user_path}/backups"
        manifest_url = upload_file(f"{backup_name}_manifest.json", manifest_content, backup_path)
        
        return jsonify({
            "status": "success",
            "backup_name": backup_name,
            "manifest_url": manifest_url,
            "files_backed_up": len(user_files),
            "message": f"Backup {backup_name} created successfully"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)