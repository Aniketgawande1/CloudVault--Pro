# utils/auth.py — simple dev auth + production hooks
import os
from flask import request
from .config import DEV_API_KEY

DEV_API_KEY = os.getenv("DEV_API_KEY", "cloudvault_test_api_key_12345")

def _extract_bearer(req):
    auth = req.headers.get("Authorization", "")
    if not auth:
        return None
    parts = auth.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    return None

def is_authenticated(req):
    token = _extract_bearer(req)
    if not token:
        return False
    # dev mode: accept DEV_API_KEY
    if token == DEV_API_KEY:
        return True
    # TODO: implement JWT verification (Firebase/OIDC) in production
    return False

def get_user_id(req):
    # return X-User-ID header if provided (simple)
    uid = req.headers.get("X-User-ID")
    if uid:
        return uid
    # fallback to token subject or "guest"
    token = _extract_bearer(req)
    if token == DEV_API_KEY:
        return "demo_user"
    return "guest"
