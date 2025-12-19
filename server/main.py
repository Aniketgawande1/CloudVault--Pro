# main.py — Flask app factory + routes
import os
import sys
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# load local .env if present
load_dotenv()

# Handle both direct execution and package import
try:
    # Try relative imports first (when imported as a module)
    from .utils.logger import log_info, log_error
    from .utils.auth import is_authenticated, get_user_id
    from .utils.storage_factory import storage
    from .services.cognito_auth_service import (
        signup_user, login_user, refresh_user_token, 
        token_required, get_user_storage, update_user_storage, get_user_info
    )
except ImportError:
    # Fall back to absolute imports (when run directly)
    from utils.logger import log_info, log_error
    from utils.auth import is_authenticated, get_user_id
    from utils.storage_factory import storage
    from services.cognito_auth_service import (
        signup_user, login_user, refresh_user_token,
        token_required, get_user_storage, update_user_storage, get_user_info
    )

def create_app():
    app = Flask(__name__)
    
    # Enable CORS for all routes, allowing requests from localhost:3000 and 3001
    CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"]}},
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization", "X-User-ID"],
         methods=["GET", "POST", "OPTIONS"])

    @app.route("/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok"}), 200

    # Authentication routes
    @app.route("/auth/signup", methods=["POST"])
    def signup():
        data = request.get_json(silent=True) or {}
        email = data.get("email")
        password = data.get("password")
        full_name = data.get("full_name")
        
        if not email or not password or not full_name:
            return jsonify({"status": "error", "message": "Email, password, and full name are required"}), 400
        
        user_data, error = signup_user(email, password, full_name)
        if error:
            return jsonify({"status": "error", "message": error}), 400
        
        # Extract tokens from user_data
        id_token = user_data.pop('id_token')
        access_token = user_data.pop('access_token')
        refresh_token = user_data.pop('refresh_token')
        expires_in = user_data.pop('expires_in', 3600)
        
        user_id = user_data['user_id']
        storage_info = get_user_storage(user_id)
        
        log_info("user signed up", email=email)
        return jsonify({
            "status": "success",
            "token": id_token,  # For compatibility with existing client
            "id_token": id_token,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "expires_in": expires_in,
            "user": user_data,
            "storage": storage_info
        }), 201

    @app.route("/auth/login", methods=["POST"])
    def login():
        data = request.get_json(silent=True) or {}
        email = data.get("email")
        password = data.get("password")
        
        print(f"[DEBUG] Login attempt - email: {email}")
        
        if not email or not password:
            print("[DEBUG] Missing email or password")
            return jsonify({"status": "error", "message": "Email and password are required"}), 400
        
        user_data, error = login_user(email, password)
        if error:
            print(f"[DEBUG] Login failed - error: {error}")
            return jsonify({"status": "error", "message": error}), 401
        
        # Extract tokens from user_data
        id_token = user_data.pop('id_token')
        access_token = user_data.pop('access_token')
        refresh_token = user_data.pop('refresh_token')
        expires_in = user_data.pop('expires_in', 3600)
        
        user_id = user_data['user_id']
        storage_info = get_user_storage(user_id)
        
        print(f"[DEBUG] Login successful - email: {email}")
        log_info("user logged in", email=email)
        return jsonify({
            "status": "success",
            "token": id_token,  # For compatibility with existing client
            "id_token": id_token,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "expires_in": expires_in,
            "user": user_data,
            "storage": storage_info
        }), 200

    @app.route("/auth/me", methods=["GET"])
    @token_required
    def get_current_user():
        user_id = request.current_user.get('user_id')
        email = request.current_user.get('email')
        
        # Get user info from Cognito
        user_info = get_user_info(user_id)
        if not user_info:
            return jsonify({
                "status": "error",
                "message": "User not found"
            }), 401
        
        storage_info = get_user_storage(user_id)
        return jsonify({
            "status": "success",
            "user": {
                "email": email,
                "user_id": user_id,
                "full_name": user_info.get('full_name', ''),
                "storage": storage_info
            }
        }), 200
    
    @app.route("/auth/refresh", methods=["POST"])
    def refresh_token_endpoint():
        data = request.get_json(silent=True) or {}
        refresh_token_value = data.get("refresh_token")
        
        if not refresh_token_value:
            return jsonify({"status": "error", "message": "Refresh token is required"}), 400
        
        result, error = refresh_user_token(refresh_token_value)
        if error:
            return jsonify({"status": "error", "message": error}), 401
        
        return jsonify({
            "status": "success",
            "token": result['id_token'],
            "id_token": result['id_token'],
            "access_token": result['access_token'],
            "expires_in": result['expires_in']
        }), 200

    @app.route("/upload", methods=["POST"])
    @token_required
    def upload():
        email = request.current_user.get('email')
        user_id = request.current_user.get('user_id')
        data = request.get_json(silent=True) or {}
        filename = data.get("filename")
        content = data.get("content")
        encoding = data.get("encoding", "base64")

        if not filename:
            return jsonify({"status": "error", "message": "filename required"}), 400
        
        # Allow empty content for folder markers
        if content is None:
            content = ""

        # decode if base64
        if encoding == "base64" and content:
            try:
                content_bytes = base64.b64decode(content)
            except Exception as e:
                return jsonify({"status": "error", "message": "invalid base64 content"}), 400
        elif content:
            content_bytes = content.encode("utf-8")
        else:
            content_bytes = b""

        # Check storage limit
        file_size = len(content_bytes)
        storage_info = get_user_storage(email)
        if storage_info and (storage_info['used'] + file_size > storage_info['limit']):
            return jsonify({
                "status": "error",
                "message": "Storage limit exceeded",
                "storage": storage_info
            }), 400

        # sanitize filename (simple)
        filename = filename.replace("..", "").lstrip("/")

        path = f"{user_id}/{filename}"
        meta = storage.save_file(path, content_bytes)
        
        # Update storage used
        update_user_storage(email, file_size)
        updated_storage = get_user_storage(email)
        
        log_info("file uploaded", user=user_id, path=path, size=file_size)
        return jsonify({
            "status":"success",
            "file": meta,
            "storage": updated_storage
        }), 200

    @app.route("/files/list", methods=["POST"])
    @app.route("/list", methods=["POST"])
    @token_required
    def list_files():
        # Get user info from request.current_user set by @token_required
        email = request.current_user.get('email')
        user_id = request.current_user.get('user_id')
        
        print(f"[DEBUG] list_files - email: {email}, user_id: {user_id}")  # Debug
        
        data = request.get_json(silent=True) or {}
        user_path = data.get("user_path") or user_id
        
        files = storage.list_files(user_path)
        storage_info = get_user_storage(email)
        
        print(f"[DEBUG] list_files - Found {len(files)} files, storage: {storage_info}")  # Debug
        
        return jsonify({
            "status":"success", 
            "user_path": user_path, 
            "files": files, 
            "file_count": len(files),
            "storage": storage_info
        }), 200

    @app.route("/files/download", methods=["POST"])
    @app.route("/download", methods=["POST"])
    @token_required
    def download(email):
        data = request.get_json(silent=True) or {}
        filename = data.get("filename")
        if not filename:
            return jsonify({"status":"error","message":"filename required"}), 400
        content = storage.read_file(filename)
        if content is None:
            return jsonify({"status":"error","message":"file not found"}), 404
        b64 = base64.b64encode(content).decode("utf-8")
        return jsonify({"status":"success","filename": filename, "content": b64, "encoding": "base64", "size": len(content)}), 200

    @app.route("/backup", methods=["POST"])
    @token_required
    def backup(email):
        user_id = get_user_storage(email)['user_id']
        data = request.get_json(silent=True) or {}
        backup_name = data.get("backup_name")
        manifest_meta = storage.create_backup_manifest(user_id, backup_name=backup_name)
        return jsonify({"status":"success","backup_name": manifest_meta.get("name"), "manifest": manifest_meta}), 200

    @app.route("/restore", methods=["POST"])
    @token_required
    def restore(email):
        data = request.get_json(silent=True) or {}
        backup_name = data.get("backup_name")
        if not backup_name:
            return jsonify({"status":"error","message":"backup_name required"}), 400
        result = storage.restore_from_manifest(backup_name)
        return jsonify({"status":"success", **result}), 200

    return app

if __name__ == "__main__":
    app = create_app()
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=os.getenv("FLASK_ENV")=="development")
