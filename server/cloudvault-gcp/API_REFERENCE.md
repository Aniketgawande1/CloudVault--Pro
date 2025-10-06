# CloudVault Pro - API Reference

## 🌐 Base URL
```
https://REGION-PROJECT_ID.cloudfunctions.net/
```

## 🔑 Authentication
All authenticated endpoints require an `Authorization` header:
```
Authorization: Bearer <your-token>
```

---

## 📤 Upload Function

### Upload File
**Endpoint**: `POST /upload_handler`  
**Authentication**: Required

**Request (JSON)**:
```json
{
  "filename": "document.pdf",
  "content": "base64_encoded_content",
  "encoding": "base64"
}
```

**Request (Form Data)**:
```
Content-Type: multipart/form-data
file: <binary_file>
```

**Response (Success)**:
```json
{
  "status": "success",
  "message": "document.pdf uploaded successfully",
  "file": {
    "filename": "document.pdf",
    "path": "user-data/user123/document.pdf",
    "size": 1024,
    "url": "https://storage.googleapis.com/...",
    "uploaded_at": "2025-10-06T10:30:00"
  }
}
```

**Response (Error)**:
```json
{
  "status": "error",
  "message": "Filename is required"
}
```

**cURL Example**:
```bash
curl -X POST https://us-central1-project.cloudfunctions.net/upload_handler \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "test.txt",
    "content": "SGVsbG8gV29ybGQ=",
    "encoding": "base64"
  }'
```

---

## 💾 Backup Functions

### Create Backup
**Endpoint**: `POST /backup_handler`  
**Authentication**: Optional

**Request**:
```json
{
  "source_file": "user-data/user123/document.pdf"
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Backed up user-data/user123/document.pdf to backups/document_20251006_103000.pdf",
  "backup": {
    "source": "user-data/user123/document.pdf",
    "destination": "backups/document_20251006_103000.pdf",
    "timestamp": "20251006_103000",
    "version": "20251006_103000"
  }
}
```

**cURL Example**:
```bash
curl -X POST https://us-central1-project.cloudfunctions.net/backup_handler \
  -H "Content-Type: application/json" \
  -d '{"source_file": "user-data/important.docx"}'
```

### List All Backups
**Endpoint**: `GET /list_backups`  
**Authentication**: Optional

**Response**:
```json
{
  "status": "success",
  "count": 5,
  "backups": [
    {
      "path": "backups/document_20251006_103000.pdf",
      "filename": "document_20251006_103000.pdf",
      "version": "20251006_103000"
    },
    {
      "path": "backups/document_20251005_103000.pdf",
      "filename": "document_20251005_103000.pdf",
      "version": "20251005_103000"
    }
  ]
}
```

**cURL Example**:
```bash
curl -X GET https://us-central1-project.cloudfunctions.net/list_backups
```

---

## ♻️ Restore Functions

### Restore File from Backup
**Endpoint**: `POST /restore_handler`  
**Authentication**: Required

**Request (Option 1: By Version)**:
```json
{
  "version": "20251006_103000"
}
```

**Request (Option 2: By Path)**:
```json
{
  "backup_path": "backups/document_20251006_103000.pdf",
  "restore_path": "user-data/user123/document.pdf"
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Restored backup version 20251006_103000",
  "restored_file": {
    "path": "user-data/user123/document.pdf",
    "size": 1024,
    "restored_at": "2025-10-06T11:00:00",
    "backup_source": "backups/document_20251006_103000.pdf"
  }
}
```

**cURL Example**:
```bash
curl -X POST https://us-central1-project.cloudfunctions.net/restore_handler \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "version": "20251006_103000"
  }'
```

### Download Backup
**Endpoint**: `POST /download_backup`  
**Authentication**: Required

**Request**:
```json
{
  "backup_path": "backups/document_20251006_103000.pdf"
}
```

**Response**:
```json
{
  "status": "success",
  "filename": "document_20251006_103000.pdf",
  "content": "base64_encoded_file_content",
  "encoding": "base64",
  "size": 1024
}
```

**cURL Example**:
```bash
curl -X POST https://us-central1-project.cloudfunctions.net/download_backup \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "backup_path": "backups/document_20251006_103000.pdf"
  }'
```

---

## 📋 HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (missing parameters) |
| 401 | Unauthorized (invalid/missing token) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 🔐 Authentication Details

### Firebase Authentication
```javascript
// Frontend: Get ID token
firebase.auth().currentUser.getIdToken()
  .then(token => {
    // Use token in Authorization header
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
```

### Google OAuth2
```javascript
// Frontend: Get OAuth token
gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token
```

---

## 🛠️ Error Response Format

All errors follow this format:
```json
{
  "status": "error",
  "message": "Descriptive error message"
}
```

### Common Errors

**Unauthorized (401)**:
```json
{
  "status": "error",
  "message": "Unauthorized. Please provide valid authentication token."
}
```

**Missing Parameters (400)**:
```json
{
  "status": "error",
  "message": "Filename is required"
}
```

**Server Error (500)**:
```json
{
  "status": "error",
  "message": "Upload failed: Storage service unavailable"
}
```

---

## 📊 Rate Limits

Default GCP Cloud Functions limits:
- **Invocations**: 10,000 per 100 seconds
- **Concurrent executions**: 1,000
- **Memory**: 256MB - 8GB
- **Timeout**: 60s - 540s

---

## 🧪 Testing with Postman

### 1. Create New Request
- Method: POST
- URL: `https://REGION-PROJECT.cloudfunctions.net/upload_handler`

### 2. Add Headers
```
Authorization: Bearer supersecret123
Content-Type: application/json
```

### 3. Add Body (JSON)
```json
{
  "filename": "test.txt",
  "content": "SGVsbG8gV29ybGQ=",
  "encoding": "base64"
}
```

### 4. Send Request

---

## 📱 Client Integration Examples

### JavaScript/React
```javascript
const uploadFile = async (file) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = async () => {
    const base64 = reader.result.split(',')[1];
    
    const response = await fetch('YOUR_FUNCTION_URL/upload_handler', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filename: file.name,
        content: base64,
        encoding: 'base64'
      })
    });
    
    const result = await response.json();
    console.log('Upload result:', result);
  };
};
```

### Python
```python
import requests
import base64

def upload_file(file_path, token):
    with open(file_path, 'rb') as f:
        content = base64.b64encode(f.read()).decode('utf-8')
    
    response = requests.post(
        'YOUR_FUNCTION_URL/upload_handler',
        headers={
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        },
        json={
            'filename': 'document.pdf',
            'content': content,
            'encoding': 'base64'
        }
    )
    
    return response.json()
```

### cURL
```bash
# Upload file
FILE_CONTENT=$(base64 -w 0 myfile.txt)
curl -X POST https://YOUR-REGION-PROJECT.cloudfunctions.net/upload_handler \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"filename\":\"myfile.txt\",\"content\":\"$FILE_CONTENT\",\"encoding\":\"base64\"}"

# List backups
curl https://YOUR-REGION-PROJECT.cloudfunctions.net/list_backups

# Restore backup
curl -X POST https://YOUR-REGION-PROJECT.cloudfunctions.net/restore_handler \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"version":"20251006_103000"}'
```

---

## 🔍 Debugging Tips

### Enable Detailed Logging
```bash
gcloud logging read "resource.type=cloud_function" \
  --format="table(timestamp, severity, textPayload)" \
  --limit=50
```

### Check Function Status
```bash
gcloud functions describe upload_handler \
  --region=us-central1 \
  --gen2
```

### Test Locally
```bash
functions-framework --target=upload_handler --debug --port=8080
```

---

**Quick Start**: Replace `YOUR_FUNCTION_URL` with your actual Cloud Functions URL after deployment!
