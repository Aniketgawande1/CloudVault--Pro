# Testing Guide - JWT Authentication

## Quick Start

### Terminal 1 - Start Server:
```bash
cd "/run/media/aniketgawande/Aniket/cloud/cloud vault/server"
source venv/bin/activate
python main.py
```

### Terminal 2 - Start Client:
```bash
cd "/run/media/aniketgawande/Aniket/cloud/cloud vault/client"
npm run dev
```

### Access Application:
- Client: http://localhost:3001
- Server: http://localhost:5000

## Test Scenarios

### 1. Create New Account
**Steps**:
1. Open http://localhost:3001
2. Click "Sign up" button at bottom
3. Enter:
   - Full Name: `John Doe`
   - Email: `john@example.com`
   - Password: `test1234`
4. Click "Create Account"

**Expected Result**:
- ✅ Automatically logged in
- ✅ Dashboard shows "Welcome Back, John Doe!"
- ✅ Storage shows "0 B / 1 GB (0.0% used)"
- ✅ No files displayed

### 2. Login with Existing Account
**Steps**:
1. Logout (click logout icon in sidebar)
2. Enter credentials:
   - Email: `john@example.com`
   - Password: `test1234`
3. Click "Sign In"

**Expected Result**:
- ✅ Redirected to dashboard
- ✅ Welcome message shows your name
- ✅ Previous files displayed
- ✅ Storage usage correct

### 3. Upload Files
**Steps**:
1. Go to "My Files" in sidebar
2. Drag and drop a file OR click upload area
3. Select file(s) to upload
4. Watch progress bar

**Expected Result**:
- ✅ Upload progress: 0% → 30% → 70% → 100%
- ✅ File appears in list
- ✅ Storage usage updates
- ✅ Progress bar in dashboard updates
- ✅ File count increases

### 4. Test Storage Limit
**Steps**:
1. Try uploading files totaling > 1GB

**Expected Result**:
- ✅ Error alert: "Storage limit exceeded"
- ✅ File not uploaded
- ✅ Storage usage unchanged

### 5. Logout and Token Persistence
**Steps**:
1. Upload some files
2. Note storage usage
3. Click logout
4. Login again

**Expected Result**:
- ✅ Files still there
- ✅ Storage usage preserved
- ✅ No duplicate files

### 6. Invalid Credentials
**Steps**:
1. Try login with:
   - Email: `wrong@example.com`
   - Password: `wrongpass`

**Expected Result**:
- ✅ Red error banner appears
- ✅ Message: "Invalid credentials"
- ✅ Not logged in

### 7. Empty Form Validation
**Steps**:
1. On signup, leave fields empty
2. Click "Create Account"

**Expected Result**:
- ✅ Error: "All fields are required"

## API Testing with cURL

### 1. Signup:
```bash
curl -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User"
  }' | jq '.'
```

**Expected Response**:
```json
{
  "status": "success",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "user_id": "...",
    "email": "test@example.com",
    "full_name": "Test User"
  },
  "storage": {
    "used": 0,
    "limit": 1073741824,
    "percentage": 0.0
  }
}
```

### 2. Login:
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' | jq '.'
```

### 3. Get Current User:
```bash
TOKEN="your-token-here"
curl -X GET http://localhost:5000/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

### 4. Upload File:
```bash
TOKEN="your-token-here"
CONTENT=$(echo "Hello World" | base64)

curl -X POST http://localhost:5000/upload \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"filename\": \"test.txt\",
    \"content\": \"$CONTENT\",
    \"encoding\": \"base64\"
  }" | jq '.'
```

**Expected Response**:
```json
{
  "status": "success",
  "file": {
    "filename": "test.txt",
    "path": "data/user_xxx/test.txt",
    "size": 11
  },
  "storage": {
    "used": 11,
    "limit": 1073741824,
    "percentage": 0.0
  }
}
```

### 5. List Files:
```bash
TOKEN="your-token-here"
curl -X POST http://localhost:5000/list \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}' | jq '.'
```

## Browser Console Testing

### Check Token:
```javascript
// Get stored token
localStorage.getItem('authToken')

// Get user data
JSON.parse(localStorage.getItem('userData'))

// Clear auth (logout)
localStorage.removeItem('authToken')
localStorage.removeItem('userData')
```

### Test API Call:
```javascript
const token = localStorage.getItem('authToken');

fetch('http://localhost:5000/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(r => r.json())
.then(console.log);
```

## Troubleshooting

### Issue: "Address already in use"
**Solution**:
```bash
lsof -ti:5000 | xargs -r kill -9  # Kill server
lsof -ti:3001 | xargs -r kill -9  # Kill client
```

### Issue: "Unauthorized" errors
**Solution**:
1. Check token in localStorage
2. Try logout and login again
3. Verify server is running
4. Check server logs for errors

### Issue: Storage not updating
**Solution**:
1. Check browser console for errors
2. Verify API response includes storage info
3. Refresh the page
4. Check server logs

### Issue: Files not showing
**Solution**:
1. Check `/list` API response
2. Verify files in `server/data/{user_id}/`
3. Check token is valid
4. Try re-uploading

## Expected Behavior Summary

| Action | Expected Result |
|--------|----------------|
| Signup | Auto-login, empty dashboard, 0 storage used |
| Login | Dashboard with files, correct storage usage |
| Upload | Progress bar, file in list, storage updates |
| Logout | Return to auth, token cleared |
| Invalid login | Error message, stay on auth page |
| Storage full | Error alert, file not uploaded |
| Page refresh (logged in) | Stay logged in, data preserved |

## Success Criteria

✅ **Authentication Works**: 
- Can create account
- Can login
- Can logout
- Token persists across page refresh

✅ **Storage Tracking Works**:
- Shows 0 / 1GB initially
- Updates after upload
- Prevents uploads when full
- Shows percentage correctly

✅ **UI Updates**:
- Welcome message shows user name
- Storage bar displays correctly
- Professional black animations
- Upload icon visible
- Error messages display

✅ **API Security**:
- Protected routes require token
- Invalid token returns 401
- Password hashed in database
- Storage limits enforced

All features implemented and ready for testing!
