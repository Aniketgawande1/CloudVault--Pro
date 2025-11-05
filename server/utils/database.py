"""
MongoDB Database Configuration and Helper Functions
"""
import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure
from datetime import datetime

# MongoDB connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
DB_NAME = os.getenv('DB_NAME', 'cloudvault')

_client = None
_db = None

def get_db():
    """Get MongoDB database instance."""
    global _client, _db
    
    if _db is None:
        try:
            _client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
            # Test connection
            _client.admin.command('ping')
            _db = _client[DB_NAME]
            print(f"[MongoDB] Connected to database: {DB_NAME}")
        except ConnectionFailure as e:
            print(f"[MongoDB] Connection failed: {e}")
            print("[MongoDB] Falling back to in-memory storage")
            return None
    
    return _db

def init_db():
    """Initialize database collections and indexes."""
    db = get_db()
    if db is None:
        return False
    
    try:
        # Create collections if they don't exist
        if 'users' not in db.list_collection_names():
            db.create_collection('users')
        
        if 'files' not in db.list_collection_names():
            db.create_collection('files')
        
        # Create indexes
        db.users.create_index('email', unique=True)
        db.users.create_index('user_id', unique=True)
        db.files.create_index([('user_email', 1), ('filename', 1)])
        db.files.create_index([('user_email', 1), ('is_deleted', 1)])
        
        print("[MongoDB] Database initialized successfully")
        return True
    except OperationFailure as e:
        print(f"[MongoDB] Initialization failed: {e}")
        return False

# User operations
def create_user(email, user_id, password_hash, full_name):
    """Create a new user in database."""
    db = get_db()
    if db is None:
        return None
    
    try:
        user_doc = {
            'email': email,
            'user_id': user_id,
            'password': password_hash,
            'full_name': full_name,
            'storage_used': 0,
            'storage_limit': 1073741824,  # 1GB
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        result = db.users.insert_one(user_doc)
        return user_doc
    except Exception as e:
        print(f"[MongoDB] Error creating user: {e}")
        return None

def get_user_by_email(email):
    """Get user by email."""
    db = get_db()
    if db is None:
        return None
    
    try:
        return db.users.find_one({'email': email})
    except Exception as e:
        print(f"[MongoDB] Error fetching user: {e}")
        return None

def update_user_storage(email, file_size):
    """Update user storage used."""
    db = get_db()
    if db is None:
        return False
    
    try:
        db.users.update_one(
            {'email': email},
            {
                '$inc': {'storage_used': file_size},
                '$set': {'updated_at': datetime.utcnow().isoformat()}
            }
        )
        return True
    except Exception as e:
        print(f"[MongoDB] Error updating storage: {e}")
        return False

def get_user_storage(email):
    """Get user storage information."""
    user = get_user_by_email(email)
    if user:
        return {
            'used': user.get('storage_used', 0),
            'limit': user.get('storage_limit', 1073741824),
            'percentage': (user.get('storage_used', 0) / user.get('storage_limit', 1073741824)) * 100
        }
    return {
        'used': 0,
        'limit': 1073741824,
        'percentage': 0.0
    }

# File operations
def create_file_record(user_email, filename, size, file_path, file_type='file'):
    """Create a file record in database."""
    db = get_db()
    if db is None:
        return None
    
    try:
        file_doc = {
            'user_email': user_email,
            'filename': filename,
            'size': size,
            'file_path': file_path,
            'file_type': file_type,  # 'file' or 'folder'
            'is_deleted': False,
            'is_starred': False,
            'uploaded_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat(),
            'deleted_at': None
        }
        result = db.files.insert_one(file_doc)
        file_doc['_id'] = str(result.inserted_id)
        return file_doc
    except Exception as e:
        print(f"[MongoDB] Error creating file record: {e}")
        return None

def get_user_files(user_email, include_deleted=False):
    """Get all files for a user."""
    db = get_db()
    if db is None:
        return []
    
    try:
        query = {'user_email': user_email}
        if not include_deleted:
            query['is_deleted'] = False
        
        files = list(db.files.find(query).sort('uploaded_at', -1))
        # Convert ObjectId to string
        for f in files:
            f['_id'] = str(f['_id'])
        return files
    except Exception as e:
        print(f"[MongoDB] Error fetching files: {e}")
        return []

def get_deleted_files(user_email):
    """Get all deleted files (trash)."""
    db = get_db()
    if db is None:
        return []
    
    try:
        files = list(db.files.find({
            'user_email': user_email,
            'is_deleted': True
        }).sort('deleted_at', -1))
        
        for f in files:
            f['_id'] = str(f['_id'])
        return files
    except Exception as e:
        print(f"[MongoDB] Error fetching deleted files: {e}")
        return []

def mark_file_deleted(user_email, filename):
    """Move file to trash."""
    db = get_db()
    if db is None:
        return False
    
    try:
        result = db.files.update_one(
            {'user_email': user_email, 'filename': filename, 'is_deleted': False},
            {
                '$set': {
                    'is_deleted': True,
                    'deleted_at': datetime.utcnow().isoformat(),
                    'updated_at': datetime.utcnow().isoformat()
                }
            }
        )
        return result.modified_count > 0
    except Exception as e:
        print(f"[MongoDB] Error marking file as deleted: {e}")
        return False

def restore_file(user_email, filename):
    """Restore file from trash."""
    db = get_db()
    if db is None:
        return False
    
    try:
        result = db.files.update_one(
            {'user_email': user_email, 'filename': filename, 'is_deleted': True},
            {
                '$set': {
                    'is_deleted': False,
                    'deleted_at': None,
                    'updated_at': datetime.utcnow().isoformat()
                }
            }
        )
        return result.modified_count > 0
    except Exception as e:
        print(f"[MongoDB] Error restoring file: {e}")
        return False

def delete_file_permanently(user_email, filename):
    """Permanently delete file from database."""
    db = get_db()
    if db is None:
        return False
    
    try:
        result = db.files.delete_one({
            'user_email': user_email,
            'filename': filename,
            'is_deleted': True
        })
        return result.deleted_count > 0
    except Exception as e:
        print(f"[MongoDB] Error deleting file permanently: {e}")
        return False

def toggle_file_starred(user_email, filename):
    """Toggle starred status of a file."""
    db = get_db()
    if db is None:
        return False
    
    try:
        file_doc = db.files.find_one({
            'user_email': user_email,
            'filename': filename,
            'is_deleted': False
        })
        
        if file_doc:
            new_status = not file_doc.get('is_starred', False)
            db.files.update_one(
                {'_id': file_doc['_id']},
                {
                    '$set': {
                        'is_starred': new_status,
                        'updated_at': datetime.utcnow().isoformat()
                    }
                }
            )
            return new_status
        return False
    except Exception as e:
        print(f"[MongoDB] Error toggling starred: {e}")
        return False

def get_starred_files(user_email):
    """Get all starred files."""
    db = get_db()
    if db is None:
        return []
    
    try:
        files = list(db.files.find({
            'user_email': user_email,
            'is_deleted': False,
            'is_starred': True
        }).sort('updated_at', -1))
        
        for f in files:
            f['_id'] = str(f['_id'])
        return files
    except Exception as e:
        print(f"[MongoDB] Error fetching starred files: {e}")
        return []
