# Quick Test Guide - Auth Fix Verification

## Current Status
✅ Both servers running:
- **Frontend**: http://localhost:3001 (Next.js)
- **Backend**: http://localhost:5000 (Flask)

## What Was Fixed

### 1. Hydration Errors
- **Problem**: React hydration mismatch from `localStorage` reads during SSR
- **Fix**: Added `"use client"` to all components using browser APIs
- **Result**: No more hydration warnings in console

### 2. Auth Skip Bug  
- **Problem**: Dashboard shown even when user shouldn't be authenticated
- **Fix**: `/auth/me` endpoint now checks user exists in database
- **Result**: Invalid/stale tokens properly rejected, forces re-login

## How to Test Right Now

### Test 1: Clean Auth Flow
```bash
# In browser console (F12)
localStorage.clear();
# Refresh page - should show auth page
# Sign up or log in - should show dashboard
```

### Test 2: Server Restart Scenario
```bash
# 1. Log in to the app (dashboard should show)

# 2. In terminal, restart Flask server:
pkill -f "python main.py"
cd server && python main.py &

# 3. Refresh browser
# Expected: Auth page shows (not dashboard)
# Before fix: Dashboard would show with errors

# 4. Log in again - should work normally
```

### Test 3: Check for Hydration Errors
```bash
# 1. Open browser devtools (F12) → Console
# 2. Look for "Hydration" errors
# Expected: None
# Before fix: React hydration error about text mismatch
```

## What to Look For

### ✅ Good Signs
- Auth page when no localStorage token
- Auth page after server restart
- Dashboard only after successful login
- No hydration warnings in console
- API calls work after login
- Storage info displays correctly

### ❌ Bad Signs (Should NOT happen now)
- Dashboard showing immediately on page load without login
- "User not found" errors while on dashboard
- Hydration mismatch warnings
- Auth loop (constantly redirecting between auth/dashboard)

## Browser Console Commands

### Check current auth state:
```javascript
console.log('Token:', localStorage.getItem('authToken')?.substring(0, 30) + '...');
console.log('User:', JSON.parse(localStorage.getItem('userData') || 'null'));
```

### Manually test /auth/me:
```javascript
const token = localStorage.getItem('authToken');
fetch('http://localhost:5000/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### Force logout:
```javascript
localStorage.clear();
window.location.reload();
```

## Expected API Responses

### /auth/signup (201)
```json
{
  "status": "success",
  "token": "eyJ...",
  "user": {
    "user_id": "user_1",
    "email": "test@example.com",
    "full_name": "Test User",
    "storage_used": 0,
    "storage_limit": 1073741824
  },
  "storage": {
    "used": 0,
    "limit": 1073741824,
    "percentage": 0.0
  }
}
```

### /auth/login (200)
```json
{
  "status": "success",
  "token": "eyJ...",
  "user": { ... },
  "storage": { ... }
}
```

### /auth/me - Success (200)
```json
{
  "status": "success",
  "user": {
    "email": "test@example.com",
    "user_id": "user_1",
    "storage": { ... }
  }
}
```

### /auth/me - User Not Found (401)
```json
{
  "status": "error",
  "message": "User not found"
}
```

## Troubleshooting

### If auth still skipping:
1. Clear localStorage completely: `localStorage.clear()`
2. Check browser console for errors
3. Check Flask server logs for `/auth/me` calls
4. Verify `/auth/me` returns 401 when user doesn't exist

### If hydration errors persist:
1. Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
2. Clear Next.js cache: `rm -rf client/.next` then restart dev server
3. Check all components have `"use client"` if they use `window`/`localStorage`

### If server errors:
```bash
# Check if Flask is running
curl http://localhost:5000/health

# Check server logs
cd server && python main.py
# Look for error messages

# Check dependencies
pip install -r requirements.txt
```

## Files to Review

If you want to see the changes:
- **Client auth logic**: `client/src/App.jsx` (lines 57-96)
- **Server /auth/me**: `server/main.py` (lines 96-116)
- **All components**: Added `"use client"` directive at top

## What's Still TODO

1. **Persistent Database**: Users lost on server restart (need SQLite/PostgreSQL)
2. **Token Refresh**: Add refresh token mechanism
3. **Production Cleanup**: Remove debug logs
4. **Error Handling**: Better error messages for users

---

**Ready to test!** Open http://localhost:3001 and try the scenarios above.
