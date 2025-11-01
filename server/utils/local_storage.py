# utils/storage.py — local filesystem storage adapter
import os
import json
from datetime import datetime
from .logger import log_info

BASE_DATA_DIR = os.getenv("DATA_DIR", "./data")

def _full_path(path):
    return os.path.join(BASE_DATA_DIR, path)

def _ensure_dir_for(path):
    d = os.path.dirname(_full_path(path))
    os.makedirs(d, exist_ok=True)

def save_file(path, content_bytes):
    _ensure_dir_for(path)
    p = _full_path(path)
    with open(p, "wb") as f:
        f.write(content_bytes)
    stat = os.stat(p)
    meta = {
        "filename": os.path.basename(path),
        "path": path,
        "full_path": p,
        "size": stat.st_size,
        "url": None,
        "uploaded_at": datetime.utcnow().isoformat()
    }
    log_info("saved file", meta=meta)
    return meta

def list_files(prefix):
    root = _full_path(prefix)
    out = []
    if not os.path.exists(root):
        return []
    # walk and list files under prefix
    for dirpath, _, filenames in os.walk(root):
        for fn in filenames:
            rel = os.path.relpath(os.path.join(dirpath, fn), BASE_DATA_DIR)
            stat = os.stat(os.path.join(dirpath, fn))
            out.append({
                "name": fn,
                "path": rel,
                "full_path": os.path.join(dirpath, fn),
                "size": stat.st_size,
                "created": datetime.utcfromtimestamp(stat.st_ctime).isoformat(),
                "updated": datetime.utcfromtimestamp(stat.st_mtime).isoformat()
            })
    return out

def read_file(path):
    p = _full_path(path)
    if not os.path.exists(p):
        return None
    with open(p, "rb") as f:
        return f.read()

def create_backup_manifest(user_id, backup_name=None):
    files = list_files(user_id)
    if not backup_name:
        backup_name = f"backup_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
    manifest = {
        "name": backup_name,
        "user_id": user_id,
        "created_at": datetime.utcnow().isoformat(),
        "files": files,
        "file_count": len(files)
    }
    manifest_path = f"backups/{user_id}/{backup_name}_manifest.json"
    _ensure_dir_for(manifest_path)
    with open(_full_path(manifest_path), "w") as f:
        json.dump(manifest, f, indent=2)
    return {"name": backup_name, "manifest_path": manifest_path, "url": None}
    
def restore_from_manifest(backup_name):
    # naive local restore: find backups/*/*_manifest.json with name
    # return counts (for demo)
    restored = []
    failed = []
    # For simple demo, just return empty
    return {"restored_count": len(restored), "failed_count": len(failed), "restored_files": restored, "failed_files": failed}
