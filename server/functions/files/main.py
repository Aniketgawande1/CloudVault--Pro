from flask import Flask, request, jsonify
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'utils'))

from gcs import list_files, download_file

app = Flask(__name__)

@app.route("/list", methods=["POST"])
def list_handler():
    """Handle file listing requests"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
            
        user_path = data.get("user_path")
        
        if not user_path:
            return jsonify({"error": "user_path is required"}), 400
        
        files = list_files(user_path)
        
        return jsonify({
            "status": "success",
            "user_path": user_path,
            "files": files,
            "file_count": len(files),
            "message": f"Found {len(files)} files for user {user_path}"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/download", methods=["POST"])
def download_handler():
    """Handle file download requests"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
            
        user_path = data.get("user_path")
        filename = data.get("filename")
        
        if not user_path or not filename:
            return jsonify({"error": "user_path and filename are required"}), 400
        
        file_content = download_file(user_path, filename)
        
        # Return base64 encoded content for JSON response
        import base64
        encoded_content = base64.b64encode(file_content).decode('utf-8')
        
        return jsonify({
            "status": "success",
            "filename": filename,
            "content": encoded_content,
            "encoding": "base64",
            "size": len(file_content),
            "message": f"File {filename} downloaded successfully"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)