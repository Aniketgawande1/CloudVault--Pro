# services/backup_service.py
from utils.storage_factory import storage

def create_backup(user_id, backup_name=None):
    return storage.create_backup_manifest(user_id, backup_name)
