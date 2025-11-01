# services/restore_service.py
from utils.storage_factory import storage

def restore_backup(user_id, backup_name):
    return storage.restore_from_manifest(user_id, backup_name)
