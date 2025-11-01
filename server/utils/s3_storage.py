# utils/s3_storage.py — S3 adapter implementing same contract as storage.py
import os, json
import boto3
from datetime import datetime
from .logger import log_info

S3_BUCKET = os.getenv("S3_BUCKET")
AWS_REGION = os.getenv("AWS_REGION")

s3 = boto3.client("s3", region_name=AWS_REGION) if S3_BUCKET else None

def _ensure_bucket():
    if not S3_BUCKET:
        raise RuntimeError("S3_BUCKET not configured")

def save_file(path, content_bytes):
    _ensure_bucket()
    s3.put_object(Bucket=S3_BUCKET, Key=path, Body=content_bytes)
    url = f"https://{S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{path}" if AWS_REGION else f"https://{S3_BUCKET}.s3.amazonaws.com/{path}"
    meta = {
        "filename": os.path.basename(path),
        "path": path,
        "full_path": f"s3://{S3_BUCKET}/{path}",
        "size": len(content_bytes),
        "url": url,
        "uploaded_at": datetime.utcnow().isoformat()
    }
    log_info("s3 saved file", meta=meta)
    return meta

def list_files(prefix):
    _ensure_bucket()
    paginator = s3.get_paginator("list_objects_v2")
    pages = paginator.paginate(Bucket=S3_BUCKET, Prefix=prefix)
    out = []
    for p in pages:
        for obj in p.get("Contents", []):
            out.append({
                "name": os.path.basename(obj["Key"]),
                "path": obj["Key"],
                "full_path": f"s3://{S3_BUCKET}/{obj['Key']}",
                "size": obj["Size"],
                "created": obj["LastModified"].isoformat(),
                "updated": obj["LastModified"].isoformat()
            })
    return out

def read_file(path):
    _ensure_bucket()
    try:
        res = s3.get_object(Bucket=S3_BUCKET, Key=path)
        return res["Body"].read()
    except s3.exceptions.NoSuchKey:
        return None

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
    manifest_key = f"backups/{user_id}/{backup_name}_manifest.json"
    s3.put_object(Bucket=S3_BUCKET, Key=manifest_key, Body=json.dumps(manifest).encode("utf-8"))
    url = f"https://{S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{manifest_key}" if AWS_REGION else f"https://{S3_BUCKET}.s3.amazonaws.com/{manifest_key}"
    return {"name": backup_name, "manifest_path": manifest_key, "url": url}

def restore_from_manifest(backup_name):
    # find manifest in backups/<user_id>/<backup_name>_manifest.json — require user_id? For demo, simple list
    # In production you must include user_id to protect restore scope
    return {"restored_count":0,"failed_count":0,"restored_files":[],"failed_files":[]}
