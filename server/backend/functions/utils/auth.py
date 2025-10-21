"""
Authentication utilities for CloudVault Pro
Handles user authentication and authorization
"""

import os
import jwt
import hashlib
import secrets
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify
from utils.logger import get_logger

logger = get_logger(__name__)

# Configuration
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24
API_KEY_LENGTH = 32

class AuthenticationError(Exception):
    """Custom exception for authentication errors"""
    pass

class AuthorizationError(Exception):
    """Custom exception for authorization errors"""
    pass

def generate_password_hash(password):
    """
    Generate a secure hash for a password
    
    Args:
        password: Plain text password
    
    Returns:
        Hashed password string
    """
    # Add salt and hash
    salt = secrets.token_hex(16)
    password_hash = hashlib.pbkdf2_hmac('sha256', 
                                       password.encode('utf-8'), 
                                       salt.encode('utf-8'), 
                                       100000)
    return f"{salt}:{password_hash.hex()}"

def verify_password(password, password_hash):
    """
    Verify a password against its hash
    
    Args:
        password: Plain text password to verify
        password_hash: Stored password hash
    
    Returns:
        Boolean indicating if password is correct
    """
    try:
        salt, stored_hash = password_hash.split(':', 1)
        password_hash_check = hashlib.pbkdf2_hmac('sha256',
                                                 password.encode('utf-8'),
                                                 salt.encode('utf-8'),
                                                 100000)
        return password_hash_check.hex() == stored_hash
    except Exception as e:
        logger.error(f"Password verification error: {str(e)}")
        return False

def generate_jwt_token(user_id, email=None, additional_claims=None):
    """
    Generate JWT token for user authentication
    
    Args:
        user_id: User identifier
        email: User email address
        additional_claims: Optional additional claims to include
    
    Returns:
        JWT token string
    """
    try:
        now = datetime.utcnow()
        
        payload = {
            'user_id': user_id,
            'email': email,
            'iat': now,
            'exp': now + timedelta(hours=JWT_EXPIRATION_HOURS),
            'iss': 'cloudvault-pro',
            'aud': 'cloudvault-pro-users'
        }
        
        # Add any additional claims
        if additional_claims:
            payload.update(additional_claims)
        
        token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        
        logger.info(f"JWT token generated for user: {user_id}")
        return token
        
    except Exception as e:
        logger.error(f"JWT token generation failed: {str(e)}")
        raise AuthenticationError(f"Token generation failed: {str(e)}")

def verify_jwt_token(token):
    """
    Verify and decode JWT token
    
    Args:
        token: JWT token string
    
    Returns:
        Decoded token payload
    
    Raises:
        AuthenticationError: If token is invalid
    """
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        
        # Verify required claims
        required_claims = ['user_id', 'exp', 'iat']
        for claim in required_claims:
            if claim not in payload:
                raise AuthenticationError(f"Missing required claim: {claim}")
        
        logger.debug(f"JWT token verified for user: {payload['user_id']}")
        return payload
        
    except jwt.ExpiredSignatureError:
        raise AuthenticationError("Token has expired")
    except jwt.InvalidTokenError as e:
        raise AuthenticationError(f"Invalid token: {str(e)}")
    except Exception as e:
        logger.error(f"JWT token verification failed: {str(e)}")
        raise AuthenticationError(f"Token verification failed: {str(e)}")

def generate_api_key():
    """
    Generate a secure API key
    
    Returns:
        API key string
    """
    return secrets.token_urlsafe(API_KEY_LENGTH)

def hash_api_key(api_key):
    """
    Hash an API key for secure storage
    
    Args:
        api_key: Plain API key
    
    Returns:
        Hashed API key
    """
    return hashlib.sha256(api_key.encode('utf-8')).hexdigest()

def verify_api_key(api_key, stored_hash):
    """
    Verify an API key against its stored hash
    
    Args:
        api_key: Plain API key to verify
        stored_hash: Stored hash of the API key
    
    Returns:
        Boolean indicating if API key is valid
    """
    return hash_api_key(api_key) == stored_hash

def extract_token_from_request(request):
    """
    Extract authentication token from request
    
    Args:
        request: Flask request object
    
    Returns:
        Token string or None
    """
    # Check Authorization header first
    auth_header = request.headers.get('Authorization')
    if auth_header:
        try:
            scheme, token = auth_header.split(' ', 1)
            if scheme.lower() == 'bearer':
                return token
        except ValueError:
            pass
    
    # Check query parameter as fallback
    token = request.args.get('token')
    if token:
        return token
    
    # Check form data as last resort
    token = request.form.get('token')
    if token:
        return token
    
    return None

def authenticate_request(request):
    """
    Authenticate incoming request and return user ID
    
    Args:
        request: Flask request object
    
    Returns:
        User ID if authenticated, None otherwise
    """
    try:
        # Extract token from request
        token = extract_token_from_request(request)
        if not token:
            logger.warning("No authentication token provided")
            return None
        
        # Verify JWT token
        try:
            payload = verify_jwt_token(token)
            user_id = payload['user_id']
            
            logger.debug(f"Request authenticated for user: {user_id}")
            return user_id
            
        except AuthenticationError:
            # Try API key authentication as fallback
            return authenticate_api_key(token)
            
    except Exception as e:
        logger.error(f"Request authentication failed: {str(e)}")
        return None

def authenticate_api_key(api_key):
    """
    Authenticate using API key (placeholder implementation)
    
    Args:
        api_key: API key to verify
    
    Returns:
        User ID if valid API key, None otherwise
    """
    # This is a placeholder implementation
    # In a real application, you would:
    # 1. Query database for API key hash
    # 2. Verify the provided key against stored hash
    # 3. Return associated user ID
    
    # For demo purposes, accept a specific test API key
    test_api_key = "cloudvault_test_api_key_12345"
    if api_key == test_api_key:
        logger.info("Test API key authenticated")
        return "test_user"
    
    logger.warning(f"Invalid API key provided: {api_key[:10]}...")
    return None

def require_auth(f):
    """
    Decorator to require authentication for Flask routes
    
    Args:
        f: Flask route function
    
    Returns:
        Decorated function that requires authentication
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = authenticate_request(request)
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Add user_id to request context
        request.current_user_id = user_id
        return f(*args, **kwargs)
    
    return decorated_function

def require_admin(f):
    """
    Decorator to require admin privileges for Flask routes
    
    Args:
        f: Flask route function
    
    Returns:
        Decorated function that requires admin authentication
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = authenticate_request(request)
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Check if user has admin privileges
        # This is a placeholder - in real implementation, check database
        if not is_admin_user(user_id):
            return jsonify({'error': 'Admin privileges required'}), 403
        
        request.current_user_id = user_id
        return f(*args, **kwargs)
    
    return decorated_function

def is_admin_user(user_id):
    """
    Check if user has admin privileges (placeholder implementation)
    
    Args:
        user_id: User identifier
    
    Returns:
        Boolean indicating admin status
    """
    # Placeholder implementation
    # In real application, query user database for admin role
    admin_users = ['admin', 'test_admin']
    return user_id in admin_users

def validate_user_access(user_id, resource_user_id):
    """
    Validate that user can access a resource belonging to another user
    
    Args:
        user_id: Current user ID
        resource_user_id: Owner of the resource
    
    Returns:
        Boolean indicating access permission
    
    Raises:
        AuthorizationError: If access is denied
    """
    # Users can access their own resources
    if user_id == resource_user_id:
        return True
    
    # Admin users can access any resource
    if is_admin_user(user_id):
        return True
    
    # Otherwise, access denied
    raise AuthorizationError(f"User {user_id} cannot access resources of user {resource_user_id}")

def create_user_session(user_id, email, remember_me=False):
    """
    Create user session with appropriate token expiration
    
    Args:
        user_id: User identifier
        email: User email
        remember_me: Whether to create long-lived session
    
    Returns:
        Dictionary with session information
    """
    try:
        # Adjust token expiration based on remember_me
        global JWT_EXPIRATION_HOURS
        original_expiration = JWT_EXPIRATION_HOURS
        
        if remember_me:
            JWT_EXPIRATION_HOURS = 24 * 30  # 30 days
        else:
            JWT_EXPIRATION_HOURS = 24  # 24 hours
        
        # Generate token
        token = generate_jwt_token(user_id, email, {
            'remember_me': remember_me,
            'session_type': 'extended' if remember_me else 'standard'
        })
        
        # Restore original expiration
        JWT_EXPIRATION_HOURS = original_expiration
        
        session_info = {
            'token': token,
            'user_id': user_id,
            'email': email,
            'expires_in_hours': 24 * 30 if remember_me else 24,
            'remember_me': remember_me,
            'created_at': datetime.utcnow().isoformat()
        }
        
        logger.info(f"User session created for {user_id} (remember_me: {remember_me})")
        return session_info
        
    except Exception as e:
        logger.error(f"Session creation failed for {user_id}: {str(e)}")
        raise AuthenticationError(f"Session creation failed: {str(e)}")

def invalidate_user_session(token):
    """
    Invalidate a user session (placeholder implementation)
    
    Args:
        token: JWT token to invalidate
    
    Returns:
        Boolean indicating success
    """
    # In a real implementation, you would:
    # 1. Add token to a blacklist in database/cache
    # 2. Check blacklist during token verification
    
    try:
        payload = verify_jwt_token(token)
        user_id = payload['user_id']
        
        logger.info(f"Session invalidated for user: {user_id}")
        return True
        
    except AuthenticationError:
        logger.warning("Attempted to invalidate invalid token")
        return False