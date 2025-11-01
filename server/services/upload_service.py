# services/upload_service.py
from utils.storage_factory import storage

def upload_file(user_id, filename, content_bytes):
    file_path = f"{user_id}/{filename}"
    return storage.save_file(file_path, content_bytes)
