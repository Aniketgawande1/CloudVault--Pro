# services/list_service.py
from utils.storage_factory import storage

def list_user_files(user_id):
    return storage.list_files(user_id)
