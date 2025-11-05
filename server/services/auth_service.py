# auth_service.py - JWT Authentication Service
import jwt
import bcrypt
import os
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify

SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')

# Import database functions
try:
    from utils.database import (
        get_user_by_email, create_user, 
        get_user_storage as db_get_user_storage,
        update_user_storage as db_update_user_storage
    )
    USE_DATABASE = True
except ImportError:
    print("[AUTH] Database module not available, using in-memory storage")
    USE_DATABASE = False
    users_db = {}  # Fallback to in-memory

def hash_password(password):
    """Hash a password for storing."""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password, hashed):
    """Verify a password against a hash."""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def generate_token(user_id, email):
    """Generate JWT token."""
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.utcnow() + timedelta(days=7),  # Token expires in 7 days
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def decode_token(token):
    """Decode JWT token."""
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def signup_user(email, password, full_name):
    """Register a new user."""
    if USE_DATABASE:
        # Check if user exists in database
        existing_user = get_user_by_email(email)
        if existing_user:
            return None, "User already exists"
        
        # Generate user ID
        user_id = f"user_{int(datetime.utcnow().timestamp())}"
        hashed_pw = hash_password(password)
        
        # Create user in database
        user_doc = create_user(email, user_id, hashed_pw, full_name)
        if not user_doc:
            return None, "Failed to create user"
        
        token = generate_token(user_id, email)
        return {
            'user_id': user_id,
            'email': email,
            'full_name': full_name,
            'storage_used': 0,
            'storage_limit': 1073741824,
            'token': token
        }, None
    else:
        # Fallback: in-memory storage
        if email in users_db:
            return None, "User already exists"
        
        user_id = f"user_{len(users_db) + 1}"
        hashed_pw = hash_password(password)
        
        users_db[email] = {
            'user_id': user_id,
            'email': email,
            'password': hashed_pw,
            'full_name': full_name,
            'storage_used': 0,
            'storage_limit': 1073741824,
            'created_at': datetime.utcnow().isoformat()
        }
        
        token = generate_token(user_id, email)
        return {
            'user_id': user_id,
            'email': email,
            'full_name': full_name,
            'storage_used': 0,
            'storage_limit': 1073741824,
            'token': token
        }, None

def login_user(email, password):
    """Login user and return token."""
    if USE_DATABASE:
        user = get_user_by_email(email)
        if not user:
            return None, "User not found"
        
        if not verify_password(password, user['password']):
            return None, "Invalid password"
        
        token = generate_token(user['user_id'], email)
        return {
            'user_id': user['user_id'],
            'email': user['email'],
            'full_name': user['full_name'],
            'storage_used': user.get('storage_used', 0),
            'storage_limit': user.get('storage_limit', 1073741824),
            'token': token
        }, None
    else:
        # Fallback: in-memory storage
        user = users_db.get(email)
        if not user:
            return None, "User not found"
        
        if not verify_password(password, user['password']):
            return None, "Invalid password"
        
        token = generate_token(user['user_id'], email)
        return {
            'user_id': user['user_id'],
            'email': user['email'],
            'full_name': user['full_name'],
            'storage_used': user['storage_used'],
            'storage_limit': user['storage_limit'],
            'token': token
        }, None

def token_required(f):
    """Decorator to protect routes with JWT."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        print(f"[DEBUG] Authorization header: {token}")  # Debug log
        
        if not token:
            print("[DEBUG] No token provided")  # Debug log
            return jsonify({'status': 'error', 'message': 'Token is missing'}), 401
        
        try:
            # Remove 'Bearer ' prefix if present
            if token.startswith('Bearer '):
                token = token[7:]
            
            print(f"[DEBUG] Token after Bearer removal: {token[:20]}...")  # Debug log
            
            data = decode_token(token)
            if not data:
                print("[DEBUG] Token decode returned None")  # Debug log
                return jsonify({'status': 'error', 'message': 'Token is invalid or expired'}), 401
            
            print(f"[DEBUG] Token decoded successfully: {data}")  # Debug log
            request.current_user = data
        except Exception as e:
            print(f"[DEBUG] Token verification exception: {e}")  # Debug log
            return jsonify({'status': 'error', 'message': 'Token verification failed'}), 401
        
        return f(*args, **kwargs)
    
    return decorated

def get_user_storage(email):
    """Get user storage information."""
    if USE_DATABASE:
        return db_get_user_storage(email)
    else:
        # Fallback: in-memory storage
        user = users_db.get(email)
        if user:
            return {
                'used': user['storage_used'],
                'limit': user['storage_limit'],
                'percentage': (user['storage_used'] / user['storage_limit']) * 100
            }
        return {
            'used': 0,
            'limit': 1073741824,
            'percentage': 0.0
        }

def update_user_storage(email, file_size):
    """Update user storage used."""
    if USE_DATABASE:
        return db_update_user_storage(email, file_size)
    else:
        # Fallback: in-memory storage
        user = users_db.get(email)
        if user:
            users_db[email]['storage_used'] += file_size
            return True
        return False
