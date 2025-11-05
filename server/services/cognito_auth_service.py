# cognito_auth_service.py - AWS Cognito Authentication Service
import os
import boto3
from jose import jwt, JWTError
from functools import wraps
from flask import request, jsonify
import requests
import json
from datetime import datetime

# AWS Cognito Configuration
AWS_REGION = os.getenv('AWS_REGION', 'us-east-1')
COGNITO_USER_POOL_ID = os.getenv('COGNITO_USER_POOL_ID')
COGNITO_APP_CLIENT_ID = os.getenv('COGNITO_APP_CLIENT_ID')

# Validate configuration
if not COGNITO_USER_POOL_ID or not COGNITO_APP_CLIENT_ID:
    raise ValueError("AWS Cognito environment variables are required! See COGNITO_SETUP_GUIDE.md")

# Initialize Cognito client
cognito_client = boto3.client('cognito-idp', region_name=AWS_REGION)

# Cache for JWKs (JSON Web Keys for token verification)
_jwks_cache = None
_jwks_url = f'https://cognito-idp.{AWS_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}/.well-known/jwks.json'


def get_jwks():
    """Get JSON Web Keys from Cognito for token verification."""
    global _jwks_cache
    if _jwks_cache is None:
        response = requests.get(_jwks_url)
        _jwks_cache = response.json()
    return _jwks_cache


def verify_cognito_token(token):
    """Verify Cognito ID token and return decoded claims."""
    try:
        # Get the kid (key ID) from token header
        headers = jwt.get_unverified_header(token)
        kid = headers['kid']
        
        # Find the key in JWKs
        jwks = get_jwks()
        key = None
        for k in jwks['keys']:
            if k['kid'] == kid:
                key = k
                break
        
        if not key:
            return None, "Invalid token - key not found"
        
        # Verify and decode token
        claims = jwt.decode(
            token,
            key,
            algorithms=['RS256'],
            audience=COGNITO_APP_CLIENT_ID,
            issuer=f'https://cognito-idp.{AWS_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}'
        )
        
        return claims, None
    except JWTError as e:
        return None, f"Token verification failed: {str(e)}"
    except Exception as e:
        return None, f"Token error: {str(e)}"


def signup_user(email, password, full_name):
    """Register a new user with Cognito."""
    try:
        response = cognito_client.sign_up(
            ClientId=COGNITO_APP_CLIENT_ID,
            Username=email,
            Password=password,
            UserAttributes=[
                {'Name': 'email', 'Value': email},
                {'Name': 'name', 'Value': full_name}
            ]
        )
        
        print(f"[COGNITO] User signed up: {email}, UserSub: {response['UserSub']}")
        
        # Auto-confirm user for development (remove in production)
        # In production, users confirm via email link
        try:
            cognito_client.admin_confirm_sign_up(
                UserPoolId=COGNITO_USER_POOL_ID,
                Username=email
            )
            print(f"[COGNITO] Auto-confirmed user: {email}")
        except Exception as e:
            print(f"[COGNITO] Auto-confirm failed (user may need email verification): {e}")
        
        # Now login to get tokens
        return login_user(email, password)
        
    except cognito_client.exceptions.UsernameExistsException:
        return None, "User already exists"
    except cognito_client.exceptions.InvalidPasswordException as e:
        return None, f"Invalid password: {str(e)}"
    except Exception as e:
        print(f"[COGNITO] Signup error: {e}")
        return None, f"Signup failed: {str(e)}"


def login_user(email, password):
    """Login user and return Cognito tokens."""
    try:
        response = cognito_client.initiate_auth(
            ClientId=COGNITO_APP_CLIENT_ID,
            AuthFlow='USER_PASSWORD_AUTH',
            AuthParameters={
                'USERNAME': email,
                'PASSWORD': password
            }
        )
        
        auth_result = response['AuthenticationResult']
        id_token = auth_result['IdToken']
        access_token = auth_result['AccessToken']
        refresh_token = auth_result['RefreshToken']
        
        # Decode ID token to get user info
        claims, error = verify_cognito_token(id_token)
        if error:
            return None, error
        
        user_id = claims.get('sub')  # Cognito user ID (UUID)
        user_email = claims.get('email')
        user_name = claims.get('name', '')
        
        print(f"[COGNITO] User logged in: {email}, UserSub: {user_id}")
        
        return {
            'user_id': user_id,
            'email': user_email,
            'full_name': user_name,
            'id_token': id_token,
            'access_token': access_token,
            'refresh_token': refresh_token,
            'expires_in': auth_result['ExpiresIn']  # Usually 3600 seconds (1 hour)
        }, None
        
    except cognito_client.exceptions.NotAuthorizedException:
        return None, "Invalid email or password"
    except cognito_client.exceptions.UserNotConfirmedException:
        return None, "User not confirmed. Please check your email for verification link."
    except Exception as e:
        print(f"[COGNITO] Login error: {e}")
        return None, f"Login failed: {str(e)}"


def refresh_user_token(refresh_token):
    """Refresh access token using refresh token."""
    try:
        response = cognito_client.initiate_auth(
            ClientId=COGNITO_APP_CLIENT_ID,
            AuthFlow='REFRESH_TOKEN_AUTH',
            AuthParameters={
                'REFRESH_TOKEN': refresh_token
            }
        )
        
        auth_result = response['AuthenticationResult']
        return {
            'id_token': auth_result['IdToken'],
            'access_token': auth_result['AccessToken'],
            'expires_in': auth_result['ExpiresIn']
        }, None
        
    except Exception as e:
        print(f"[COGNITO] Token refresh error: {e}")
        return None, f"Token refresh failed: {str(e)}"


def get_user_info(user_id):
    """Get user info from Cognito by user ID (sub)."""
    try:
        # List users and find by sub attribute
        response = cognito_client.list_users(
            UserPoolId=COGNITO_USER_POOL_ID,
            Filter=f'sub = "{user_id}"',
            Limit=1
        )
        
        if not response['Users']:
            return None
        
        user = response['Users'][0]
        attributes = {attr['Name']: attr['Value'] for attr in user['Attributes']}
        
        return {
            'user_id': attributes.get('sub'),
            'email': attributes.get('email'),
            'full_name': attributes.get('name', ''),
            'email_verified': attributes.get('email_verified') == 'true',
            'created_at': user['UserCreateDate'].isoformat()
        }
        
    except Exception as e:
        print(f"[COGNITO] Get user info error: {e}")
        return None


def token_required(f):
    """Decorator to protect routes with Cognito token verification."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'status': 'error', 'message': 'Token is missing'}), 401
        
        try:
            # Remove 'Bearer ' prefix if present
            token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else auth_header
            
            # Verify token with Cognito
            claims, error = verify_cognito_token(token)
            if error:
                print(f"[COGNITO] Token verification failed: {error}")
                return jsonify({'status': 'error', 'message': 'Token is invalid or expired'}), 401
            
            # Add user info to request
            request.current_user = {
                'user_id': claims.get('sub'),
                'email': claims.get('email'),
                'name': claims.get('name', ''),
                'email_verified': claims.get('email_verified', False)
            }
            
            print(f"[COGNITO] Token verified for user: {request.current_user['email']}")
            
        except Exception as e:
            print(f"[COGNITO] Token verification exception: {e}")
            return jsonify({'status': 'error', 'message': 'Token verification failed'}), 401
        
        return f(*args, **kwargs)
    
    return decorated


# Storage tracking (in-memory for now - can move to DynamoDB later if needed)
# For free tier, we can use a simple JSON file or keep in-memory
user_storage = {}


def get_user_storage(user_id):
    """Get user storage information."""
    if user_id not in user_storage:
        user_storage[user_id] = {
            'used': 0,
            'limit': 1073741824,  # 1GB
            'percentage': 0.0
        }
    return user_storage[user_id]


def update_user_storage(user_id, file_size):
    """Update user storage used."""
    if user_id not in user_storage:
        user_storage[user_id] = {
            'used': 0,
            'limit': 1073741824,
            'percentage': 0.0
        }
    
    user_storage[user_id]['used'] += file_size
    user_storage[user_id]['percentage'] = (user_storage[user_id]['used'] / user_storage[user_id]['limit']) * 100
    return True
