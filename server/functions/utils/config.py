"""Configuration management for CloudVault Pro server"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Configuration class for CloudVault Pro"""
    
    # Google Cloud Configuration
    CLOUD_PROJECT_ID = os.environ.get('CLOUD_PROJECT_ID')
    GCS_BUCKET_NAME = os.environ.get('GCS_BUCKET_NAME', 'cloudvault-pro-backup')
    GOOGLE_APPLICATION_CREDENTIALS = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
    
    # Server Configuration
    PORT = int(os.environ.get('PORT', 8080))
    DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    # Security Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
    
    @classmethod
    def validate_config(cls):
        """Validate that all required configuration variables are set"""
        required_vars = [
            'CLOUD_PROJECT_ID',
            'GCS_BUCKET_NAME',
            'GOOGLE_APPLICATION_CREDENTIALS'
        ]
        
        missing_vars = []
        for var in required_vars:
            if not getattr(cls, var):
                missing_vars.append(var)
        
        if missing_vars:
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
        
        return True

# Validate configuration on import
Config.validate_config()