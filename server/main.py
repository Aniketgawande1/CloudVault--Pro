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
except ImportError:
    # Fall back to absolute imports (when run directly)
    from utils.logger import log_info, log_error
    from utils.auth import is_authenticated, get_user_id
    from utils.storage_factory import storage

def create_app():
    app = Flask(__name__)
    
    # Enable CORS for all routes, allowing requests from localhost:3000
    CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}},
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization", "X-User-ID"],
         methods=["GET", "POST", "OPTIONS"])

    @app.route("/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok"}), 200

    @app.route("/upload", methods=["POST"])
    def upload():
        if not is_authenticated(request):
            return jsonify({"status": "error", "message": "Unauthorized"}), 401
        user_id = get_user_id(request)
        data = request.get_json(silent=True) or {}
        filename = data.get("filename")
        content = data.get("content")
        encoding = data.get("encoding", "base64")

        if not filename or not content:
            return jsonify({"status": "error", "message": "filename and content required"}), 400

        # decode if base64
        if encoding == "base64":
            try:
                content_bytes = base64.b64decode(content)
            except Exception as e:
                return jsonify({"status": "error", "message": "invalid base64 content"}), 400
        else:
            content_bytes = content.encode("utf-8")

        # sanitize filename (simple)
        filename = filename.replace("..", "").lstrip("/")

        path = f"{user_id}/{filename}"
        meta = storage.save_file(path, content_bytes)
        log_info("file uploaded", user=user_id, path=path)
        return jsonify({"status":"success", "file": meta}), 200

    @app.route("/files/list", methods=["POST"])
    @app.route("/list", methods=["POST"])
    def list_files():
        if not is_authenticated(request):
            return jsonify({"status": "error", "message": "Unauthorized"}), 401
        data = request.get_json(silent=True) or {}
        user_path = data.get("user_path") or get_user_id(request)
        files = storage.list_files(user_path)
        return jsonify({"status":"success", "user_path": user_path, "files": files, "file_count": len(files)}), 200

    @app.route("/files/download", methods=["POST"])
    @app.route("/download", methods=["POST"])
    def download():
        if not is_authenticated(request):
            return jsonify({"status": "error", "message": "Unauthorized"}), 401
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
    def backup():
        if not is_authenticated(request):
            return jsonify({"status": "error", "message": "Unauthorized"}), 401
        user_id = get_user_id(request)
        data = request.get_json(silent=True) or {}
        backup_name = data.get("backup_name")
        manifest_meta = storage.create_backup_manifest(user_id, backup_name=backup_name)
        return jsonify({"status":"success","backup_name": manifest_meta.get("name"), "manifest": manifest_meta}), 200

    @app.route("/restore", methods=["POST"])
    def restore():
        if not is_authenticated(request):
            return jsonify({"status": "error", "message": "Unauthorized"}), 401
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
