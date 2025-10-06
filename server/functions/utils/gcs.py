"""Google Cloud Storage utility functions for CloudVault Pro"""
from google.cloud import storage
import os

# Initialize GCS client
storage_client = storage.Client()
BUCKET_NAME = os.environ.get('GCS_BUCKET_NAME', 'cloudvault-pro-backup')
bucket = storage_client.bucket(BUCKET_NAME)

def upload_file(blob_name, content):
    """
    Upload a file to Google Cloud Storage
    
    Args:
        blob_name: The name/path of the file in the bucket
        content: The file content (bytes or string)
    """
    blob = bucket.blob(blob_name)
    
    if isinstance(content, str):
        content = content.encode('utf-8')
    
    blob.upload_from_string(content)
    return blob.public_url

def copy_file(source_blob_name, dest_blob_name):
    """
    Copy a file within the same GCS bucket
    
    Args:
        source_blob_name: Source file path in bucket
        dest_blob_name: Destination file path in bucket
    """
    source_blob = bucket.blob(source_blob_name)
    bucket.copy_blob(source_blob, bucket, dest_blob_name)
    return dest_blob_name

def download_file(blob_name):
    """
    Download a file from Google Cloud Storage
    
    Args:
        blob_name: The name/path of the file in the bucket
        
    Returns:
        bytes: The file content
    """
    blob = bucket.blob(blob_name)
    return blob.download_as_bytes()

def list_files(prefix=''):
    """
    List files in the bucket with optional prefix filter
    
    Args:
        prefix: Optional prefix to filter files
        
    Returns:
        list: List of blob names
    """
    blobs = bucket.list_blobs(prefix=prefix)
    return [blob.name for blob in blobs]

def delete_file(blob_name):
    """
    Delete a file from Google Cloud Storage
    
    Args:
        blob_name: The name/path of the file to delete
    """
    blob = bucket.blob(blob_name)
    blob.delete()
    return True

def get_file_metadata(blob_name):
    """
    Get metadata for a file in GCS
    
    Args:
        blob_name: The name/path of the file
        
    Returns:
        dict: File metadata including size, updated time, etc.
    """
    blob = bucket.blob(blob_name)
    blob.reload()
    
    return {
        'name': blob.name,
        'size': blob.size,
        'content_type': blob.content_type,
        'updated': blob.updated.isoformat() if blob.updated else None,
        'created': blob.time_created.isoformat() if blob.time_created else None,
    }

def file_exists(blob_name):
    """
    Check if a file exists in GCS
    
    Args:
        blob_name: The name/path of the file
        
    Returns:
        bool: True if file exists, False otherwise
    """
    blob = bucket.blob(blob_name)
    return blob.exists()

def get_signed_url(blob_name, expiration=3600):
    """
    Generate a signed URL for temporary access to a file
    
    Args:
        blob_name: The name/path of the file
        expiration: URL expiration time in seconds (default: 1 hour)
        
    Returns:
        str: Signed URL
    """
    blob = bucket.blob(blob_name)
    url = blob.generate_signed_url(
        version="v4",
        expiration=expiration,
        method="GET"
    )
    return url
