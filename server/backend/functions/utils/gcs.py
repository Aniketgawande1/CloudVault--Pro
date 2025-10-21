"""
Google Cloud Storage utility functions
Handles all GCS operations for CloudVault Pro
"""

import os
import json
import hashlib
import tempfile
from datetime import datetime, timedelta
from google.cloud import storage
from google.cloud.exceptions import NotFound, GoogleCloudError
from utils.logger import get_logger

logger = get_logger(__name__)

# Initialize GCS client
def get_gcs_client():
    """Get authenticated GCS client"""
    try:
        # Use environment variables for configuration
        project_id = os.environ.get('GOOGLE_CLOUD_PROJECT')
        if not project_id:
            raise ValueError("GOOGLE_CLOUD_PROJECT environment variable not set")
        
        client = storage.Client(project=project_id)
        return client
    except Exception as e:
        logger.error(f"Failed to initialize GCS client: {str(e)}")
        raise

def get_bucket():
    """Get the configured GCS bucket"""
    try:
        bucket_name = os.environ.get('GCS_BUCKET_NAME')
        if not bucket_name:
            raise ValueError("GCS_BUCKET_NAME environment variable not set")
        
        client = get_gcs_client()
        bucket = client.bucket(bucket_name)
        
        # Verify bucket exists
        if not bucket.exists():
            raise ValueError(f"Bucket {bucket_name} does not exist")
        
        return bucket
    except Exception as e:
        logger.error(f"Failed to get bucket: {str(e)}")
        raise

def upload_file_to_gcs(file_obj, file_path, metadata=None, content_type=None):
    """
    Upload a file to Google Cloud Storage
    
    Args:
        file_obj: File object or file data to upload
        file_path: Path within the bucket where file will be stored
        metadata: Optional metadata dictionary
        content_type: Optional content type override
    
    Returns:
        Dictionary with upload result information
    """
    try:
        bucket = get_bucket()
        blob = bucket.blob(file_path)
        
        # Set metadata if provided
        if metadata:
            blob.metadata = metadata
        
        # Set content type if provided
        if content_type:
            blob.content_type = content_type
        
        # Upload the file
        if hasattr(file_obj, 'read'):
            # File-like object
            file_obj.seek(0)  # Ensure we're at the beginning
            blob.upload_from_file(file_obj)
        else:
            # Raw data
            blob.upload_from_string(file_obj)
        
        # Get file information
        blob.reload()  # Refresh blob properties
        
        result = {
            'success': True,
            'file_path': file_path,
            'size': blob.size,
            'md5_hash': blob.md5_hash,
            'upload_time': blob.time_created.isoformat() if blob.time_created else datetime.now().isoformat(),
            'content_type': blob.content_type,
            'public_url': f"gs://{bucket.name}/{file_path}"
        }
        
        logger.info(f"File uploaded successfully: {file_path} ({blob.size} bytes)")
        return result
        
    except Exception as e:
        logger.error(f"Upload failed for {file_path}: {str(e)}")
        raise GoogleCloudError(f"Upload failed: {str(e)}")

def download_file_from_gcs(user_id, file_path):
    """
    Download a file from Google Cloud Storage
    
    Args:
        user_id: User ID for access control
        file_path: Path to file in bucket
    
    Returns:
        File data as bytes
    """
    try:
        bucket = get_bucket()
        
        # Ensure user can only access their own files
        if not file_path.startswith(f"{user_id}/"):
            raise PermissionError("Access denied: Cannot access files of other users")
        
        blob = bucket.blob(file_path)
        
        if not blob.exists():
            raise NotFound(f"File not found: {file_path}")
        
        # Download file data
        file_data = blob.download_as_bytes()
        
        logger.info(f"File downloaded successfully: {file_path} ({len(file_data)} bytes)")
        return file_data
        
    except Exception as e:
        logger.error(f"Download failed for {file_path}: {str(e)}")
        raise

def list_user_files(user_id, prefix="", limit=1000):
    """
    List files for a specific user
    
    Args:
        user_id: User ID
        prefix: Optional prefix to filter files
        limit: Maximum number of files to return
    
    Returns:
        List of file information dictionaries
    """
    try:
        bucket = get_bucket()
        
        # Construct the search prefix
        search_prefix = f"{user_id}/"
        if prefix:
            search_prefix += prefix.strip('/')
        
        # List blobs with prefix
        blobs = bucket.list_blobs(prefix=search_prefix, max_results=limit)
        
        files = []
        for blob in blobs:
            # Skip directories (blobs ending with /)
            if blob.name.endswith('/'):
                continue
            
            # Extract relative path (remove user_id prefix)
            relative_path = blob.name[len(f"{user_id}/"):]
            
            file_info = {
                'name': os.path.basename(blob.name),
                'path': relative_path,
                'full_path': blob.name,
                'size': blob.size,
                'created': blob.time_created.isoformat() if blob.time_created else None,
                'updated': blob.updated.isoformat() if blob.updated else None,
                'content_type': blob.content_type,
                'md5_hash': blob.md5_hash,
                'metadata': blob.metadata or {}
            }
            files.append(file_info)
        
        logger.info(f"Listed {len(files)} files for user {user_id}")
        return files
        
    except Exception as e:
        logger.error(f"List files failed for user {user_id}: {str(e)}")
        raise

def delete_file_from_gcs(user_id, file_path):
    """
    Delete a file from Google Cloud Storage
    
    Args:
        user_id: User ID for access control
        file_path: Path to file in bucket
    
    Returns:
        Boolean indicating success
    """
    try:
        bucket = get_bucket()
        
        # Construct full path with user ID
        full_path = f"{user_id}/{file_path.strip('/')}"
        blob = bucket.blob(full_path)
        
        if not blob.exists():
            raise NotFound(f"File not found: {file_path}")
        
        # Delete the blob
        blob.delete()
        
        logger.info(f"File deleted successfully: {full_path}")
        return True
        
    except Exception as e:
        logger.error(f"Delete failed for {file_path}: {str(e)}")
        raise

def create_backup(user_id, source_paths, backup_name, compression=True, encryption=False):
    """
    Create a backup archive from specified source paths
    
    Args:
        user_id: User ID
        source_paths: List of file paths to backup
        backup_name: Name for the backup
        compression: Whether to compress the backup
        encryption: Whether to encrypt the backup (placeholder)
    
    Returns:
        Dictionary with backup information
    """
    try:
        import zipfile
        import io
        
        # Create backup metadata
        backup_id = f"backup_{user_id}_{int(datetime.now().timestamp())}"
        backup_path = f"{user_id}/backups/{backup_name}_{backup_id}.zip"
        
        # Create ZIP archive in memory
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'w', 
                           zipfile.ZIP_DEFLATED if compression else zipfile.ZIP_STORED) as zipf:
            
            bucket = get_bucket()
            files_added = 0
            
            for source_path in source_paths:
                try:
                    # Download source file
                    full_source_path = f"{user_id}/{source_path.strip('/')}"
                    blob = bucket.blob(full_source_path)
                    
                    if blob.exists():
                        file_data = blob.download_as_bytes()
                        zipf.writestr(source_path, file_data)
                        files_added += 1
                    else:
                        logger.warning(f"Source file not found for backup: {source_path}")
                        
                except Exception as e:
                    logger.error(f"Failed to add {source_path} to backup: {str(e)}")
                    continue
        
        # Upload backup archive
        zip_buffer.seek(0)
        upload_result = upload_file_to_gcs(
            zip_buffer, 
            backup_path, 
            metadata={
                'backup_id': backup_id,
                'backup_name': backup_name,
                'files_count': str(files_added),
                'created_by': user_id,
                'compression': str(compression),
                'encryption': str(encryption)
            }
        )
        
        backup_info = {
            'backup_id': backup_id,
            'backup_name': backup_name,
            'backup_path': backup_path,
            'files_count': files_added,
            'size': upload_result['size'],
            'created_at': upload_result['upload_time'],
            'compression': compression,
            'encryption': encryption
        }
        
        logger.info(f"Backup created successfully: {backup_id} ({files_added} files)")
        return backup_info
        
    except Exception as e:
        logger.error(f"Backup creation failed: {str(e)}")
        raise

def list_backups(user_id, before_date=None, limit=100, offset=0):
    """
    List backups for a user
    
    Args:
        user_id: User ID
        before_date: Optional datetime to filter backups created before this date
        limit: Maximum number of backups to return
        offset: Number of backups to skip
    
    Returns:
        List of backup information dictionaries
    """
    try:
        bucket = get_bucket()
        
        # List backup files
        backup_prefix = f"{user_id}/backups/"
        blobs = bucket.list_blobs(prefix=backup_prefix)
        
        backups = []
        for blob in blobs:
            # Skip if not a backup file
            if not blob.name.endswith('.zip'):
                continue
            
            # Filter by date if specified
            if before_date and blob.time_created and blob.time_created >= before_date:
                continue
            
            backup_info = {
                'backup_id': blob.metadata.get('backup_id') if blob.metadata else None,
                'backup_name': blob.metadata.get('backup_name') if blob.metadata else os.path.basename(blob.name),
                'backup_path': blob.name,
                'size': blob.size,
                'created_at': blob.time_created.isoformat() if blob.time_created else None,
                'files_count': int(blob.metadata.get('files_count', 0)) if blob.metadata else 0,
                'compression': blob.metadata.get('compression') == 'True' if blob.metadata else False
            }
            backups.append(backup_info)
        
        # Sort by creation date (newest first)
        backups.sort(key=lambda x: x['created_at'] or '', reverse=True)
        
        # Apply pagination
        total_backups = len(backups)
        backups = backups[offset:offset + limit]
        
        logger.info(f"Listed {len(backups)} backups for user {user_id} (total: {total_backups})")
        return backups
        
    except Exception as e:
        logger.error(f"List backups failed for user {user_id}: {str(e)}")
        raise

def get_backup_info(backup_id, user_id):
    """
    Get information about a specific backup
    
    Args:
        backup_id: Backup ID
        user_id: User ID for access control
    
    Returns:
        Backup information dictionary or None if not found
    """
    try:
        backups = list_backups(user_id)
        
        for backup in backups:
            if backup['backup_id'] == backup_id:
                return backup
        
        return None
        
    except Exception as e:
        logger.error(f"Get backup info failed for {backup_id}: {str(e)}")
        raise

def get_backup_contents(backup_id, user_id):
    """
    Get contents of a backup archive
    
    Args:
        backup_id: Backup ID
        user_id: User ID for access control
    
    Returns:
        List of files in the backup
    """
    try:
        import zipfile
        import io
        
        backup_info = get_backup_info(backup_id, user_id)
        if not backup_info:
            return None
        
        # Download backup file
        bucket = get_bucket()
        blob = bucket.blob(backup_info['backup_path'])
        backup_data = blob.download_as_bytes()
        
        # Read ZIP contents
        with zipfile.ZipFile(io.BytesIO(backup_data), 'r') as zipf:
            contents = []
            for file_info in zipf.filelist:
                if not file_info.is_dir():
                    contents.append({
                        'name': file_info.filename,
                        'size': file_info.file_size,
                        'compressed_size': file_info.compress_size,
                        'modified': datetime(*file_info.date_time).isoformat(),
                        'path': file_info.filename
                    })
        
        logger.info(f"Retrieved contents for backup {backup_id}: {len(contents)} files")
        return contents
        
    except Exception as e:
        logger.error(f"Get backup contents failed for {backup_id}: {str(e)}")
        raise

def get_storage_usage(user_id):
    """
    Calculate total storage usage for a user
    
    Args:
        user_id: User ID
    
    Returns:
        Dictionary with storage usage information
    """
    try:
        bucket = get_bucket()
        
        # List all user files
        prefix = f"{user_id}/"
        blobs = bucket.list_blobs(prefix=prefix)
        
        total_size = 0
        file_count = 0
        backup_size = 0
        backup_count = 0
        
        for blob in blobs:
            total_size += blob.size or 0
            file_count += 1
            
            # Check if it's a backup
            if '/backups/' in blob.name and blob.name.endswith('.zip'):
                backup_size += blob.size or 0
                backup_count += 1
        
        usage_info = {
            'user_id': user_id,
            'total_size_bytes': total_size,
            'total_size_mb': round(total_size / (1024 * 1024), 2),
            'total_size_gb': round(total_size / (1024 * 1024 * 1024), 2),
            'total_files': file_count,
            'backup_size_bytes': backup_size,
            'backup_count': backup_count,
            'regular_files_size': total_size - backup_size,
            'regular_files_count': file_count - backup_count,
            'calculated_at': datetime.now().isoformat()
        }
        
        logger.info(f"Storage usage calculated for user {user_id}: {usage_info['total_size_mb']} MB")
        return usage_info
        
    except Exception as e:
        logger.error(f"Storage usage calculation failed for user {user_id}: {str(e)}")
        raise