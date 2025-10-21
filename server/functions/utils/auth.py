"""Authentication utilities for GCP Cloud Functions"""
from google.oauth2 import id_token
from google.auth.transport import requests
import os
from .config import Config

def verify_firebase_token(token):
    """
    Verify Firebase ID token
    
    Args:
        token: Firebase ID token from client
        
    Returns:
        dict: Decoded token with user information
    """
    try:
        # Verify the token against Firebase
        decoded_token = id_token.verify_firebase_token(
            token, 
            requests.Request()
        )
        return decoded_token
    except Exception as e:
        raise Exception(f"Invalid token: {str(e)}")

def verify_oauth_token(token, client_id=None):
    """
    Verify Google OAuth2 token
    
    Args:
        token: OAuth2 token from client
        client_id: Optional client ID to verify against
        
    Returns:
        dict: Decoded token with user information
    """
    try:
        if client_id is None:
            client_id = os.environ.get('GOOGLE_CLIENT_ID')
        
        # Verify the token
        id_info = id_token.verify_oauth2_token(
            token, 
            requests.Request(), 
            client_id
        )
        
        return id_info
    except Exception as e:
        raise Exception(f"Invalid OAuth token: {str(e)}")

def is_authenticated(request):
    """
    Check if the request is authenticated
    
    Args:
        request: Flask request object
        
    Returns:
        bool: True if authenticated, False otherwise
    """
    try:
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization', '')
        
        if not auth_header.startswith('Bearer '):
            return False
        
        token = auth_header.split('Bearer ')[1]
        
        # Try to verify as Firebase token first, then OAuth
        try:
            verify_firebase_token(token)
            return True
        except:
            try:
                verify_oauth_token(token)
                return True
            except:
                return False
                
    except Exception as e:
        print(f"Authentication error: {str(e)}")
        return False

def get_user_id(request):
    """
    Extract user ID from authenticated request
    
    Args:
        request: Flask request object
        
    Returns:
        str: User ID or None if not authenticated
    """
    try:
        auth_header = request.headers.get('Authorization', '')
        
        if not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split('Bearer ')[1]
        
        # Try Firebase token first
        try:
            decoded = verify_firebase_token(token)
            return decoded.get('uid') or decoded.get('user_id')
        except:
            # Try OAuth token
            try:
                decoded = verify_oauth_token(token)
                return decoded.get('sub')
            except:
                return None
                
    except Exception as e:
        print(f"Error extracting user ID: {str(e)}")
        return None

def require_auth(func):
    """
    Decorator to require authentication for a function
    
    Usage:
        @require_auth
        def my_handler(request):
            # This will only execute if authenticated
            pass
    """
    def wrapper(request):
        if not is_authenticated(request):
            from flask import jsonify
            return jsonify({
                "status": "error",
                "message": "Unauthorized"
            }), 401
        return func(request)
    return wrapper
