"""Logging utilities for CloudVault Pro using Google Cloud Logging"""
from google.cloud import logging as cloud_logging
import os
import json
from datetime import datetime

# Initialize Cloud Logging client
logging_client = cloud_logging.Client()
logger = logging_client.logger('cloudvault-pro')

# Environment
ENV = os.environ.get('ENVIRONMENT', 'development')

def log(message, severity='INFO', **kwargs):
    """
    Log a message to Google Cloud Logging
    
    Args:
        message: The log message
        severity: Log severity (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        **kwargs: Additional structured data to log
    """
    # Create structured log entry
    log_entry = {
        'message': message,
        'timestamp': datetime.utcnow().isoformat(),
        'environment': ENV,
        **kwargs
    }
    
    # Log to Cloud Logging
    if ENV == 'production':
        logger.log_struct(log_entry, severity=severity)
    else:
        # For development, print to console
        print(f"[{severity}] {json.dumps(log_entry, indent=2)}")

def log_info(message, **kwargs):
    """Log an info message"""
    log(message, severity='INFO', **kwargs)

def log_warning(message, **kwargs):
    """Log a warning message"""
    log(message, severity='WARNING', **kwargs)

def log_error(message, **kwargs):
    """Log an error message"""
    log(message, severity='ERROR', **kwargs)

def log_debug(message, **kwargs):
    """Log a debug message"""
    log(message, severity='DEBUG', **kwargs)

def log_critical(message, **kwargs):
    """Log a critical message"""
    log(message, severity='CRITICAL', **kwargs)

def log_request(request, user_id=None):
    """
    Log incoming request details
    
    Args:
        request: Flask request object
        user_id: Optional user ID
    """
    log_info(
        f"Request received: {request.method} {request.path}",
        method=request.method,
        path=request.path,
        user_id=user_id,
        ip=request.remote_addr,
        user_agent=request.headers.get('User-Agent', 'unknown')
    )

def log_response(status_code, message='', **kwargs):
    """
    Log response details
    
    Args:
        status_code: HTTP status code
        message: Response message
        **kwargs: Additional data to log
    """
    severity = 'INFO' if status_code < 400 else 'ERROR'
    log(
        f"Response: {status_code} - {message}",
        severity=severity,
        status_code=status_code,
        **kwargs
    )
