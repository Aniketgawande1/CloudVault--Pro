# CloudVault - Server & Client Connection Guide

## 📋 Prerequisites
- Python 3.8+ installed
- Node.js 16+ and npm installed
- Git installed

---

## 🚀 Step-by-Step Setup Instructions

### **Step 1: Setup Python Server**

#### 1.1 Navigate to server directory
```bash
cd "/run/media/aniketgawande/Aniket/cloud/cloud vault/server"
```

#### 1.2 Create Python virtual environment
```bash
python3 -m venv venv
```

#### 1.3 Activate virtual environment
```bash
# On Linux/Mac:
source venv/bin/activate

# On Windows:
# venv\Scripts\activate
```

#### 1.4 Install Python dependencies
```bash
pip install -r requirements.txt
```

#### 1.5 Configure environment variables
Create/Update the `.env` file in the server directory:
```bash
# Create .env file
cat > .env << 'EOF'
# Flask Configuration
FLASK_ENV=development
PORT=5000

# Storage Configuration
STORAGE_TYPE=local
DATA_DIR=./data

# Authentication (Simple token for development)
AUTH_ENABLED=false

# AWS S3 (Optional - only if using S3)
# AWS_ACCESS_KEY_ID=your_access_key
# AWS_SECRET_ACCESS_KEY=your_secret_key
# AWS_REGION=us-east-1
# S3_BUCKET_NAME=your-bucket-name
EOF
```

#### 1.6 Start the Flask server
```bash
python main.py
```

**Expected Output:**
```
 * Serving Flask app 'main'
 * Debug mode: on
 * Running on http://0.0.0.0:5000
```

✅ **Server is now running on http://localhost:5000**

---

### **Step 2: Setup React Client**

#### 2.1 Open a NEW terminal and navigate to client directory
```bash
cd "/run/media/aniketgawande/Aniket/cloud/cloud vault/client"
```

#### 2.2 Install Node dependencies (if not already done)
```bash
npm install
```

#### 2.3 Create API configuration file
Create a new file: `client/src/api/config.js`
```bash
mkdir -p src/api
cat > src/api/config.js << 'EOF'
// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  HEALTH: '/health',
  UPLOAD: '/upload',
  LIST: '/list',
  DOWNLOAD: '/download',
  BACKUP: '/backup',
  RESTORE: '/restore',
};

export default API_BASE_URL;
EOF
```

#### 2.4 Create API service file
Create: `client/src/api/api.js`
```bash
cat > src/api/api.js << 'EOF'
import API_BASE_URL, { API_ENDPOINTS } from './config';

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'X-User-ID': localStorage.getItem('userId') || 'demo_user',
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// API Methods
export const api = {
  // Check server health
  checkHealth: () => apiCall(API_ENDPOINTS.HEALTH),

  // Upload file
  uploadFile: (filename, content, encoding = 'base64') => 
    apiCall(API_ENDPOINTS.UPLOAD, {
      method: 'POST',
      body: JSON.stringify({ filename, content, encoding }),
    }),

  // List files
  listFiles: (userPath = null) => 
    apiCall(API_ENDPOINTS.LIST, {
      method: 'POST',
      body: JSON.stringify({ user_path: userPath }),
    }),

  // Download file
  downloadFile: (filename) => 
    apiCall(API_ENDPOINTS.DOWNLOAD, {
      method: 'POST',
      body: JSON.stringify({ filename }),
    }),

  // Create backup
  createBackup: (backupName = null) => 
    apiCall(API_ENDPOINTS.BACKUP, {
      method: 'POST',
      body: JSON.stringify({ backup_name: backupName }),
    }),

  // Restore from backup
  restoreBackup: (backupName) => 
    apiCall(API_ENDPOINTS.RESTORE, {
      method: 'POST',
      body: JSON.stringify({ backup_name: backupName }),
    }),
};

export default api;
EOF
```

#### 2.5 Start the React development server
```bash
npm run dev
```

**Expected Output:**
```
▲ Next.js 15.5.6 (Turbopack)
- Local:        http://localhost:3000
- Network:      http://10.x.x.x:3000
✓ Ready in 2.9s
```

✅ **Client is now running on http://localhost:3000**

---

## 🔗 How They Connect

### Architecture Overview:
```
┌─────────────────┐         HTTP Requests          ┌─────────────────┐
│   React Client  │  ────────────────────────────> │  Flask Server   │
│  (Port 3000)    │                                 │  (Port 5000)    │
│                 │  <────────────────────────────  │                 │
└─────────────────┘         JSON Responses          └─────────────────┘
```

### Connection Details:
1. **Client URL**: http://localhost:3000
2. **Server URL**: http://localhost:5000
3. **CORS Enabled**: Server accepts requests from localhost:3000
4. **API Format**: JSON (REST API)
5. **Authentication**: Simple header-based (X-User-ID)

---

## 🧪 Testing the Connection

### Test 1: Check Server Health
Open your browser console on http://localhost:3000 and run:
```javascript
fetch('http://localhost:5000/health')
  .then(r => r.json())
  .then(d => console.log('Server Status:', d));
```

Expected output: `{status: "ok"}`

### Test 2: List Files (from terminal)
```bash
curl -X POST http://localhost:5000/list \
  -H "Content-Type: application/json" \
  -H "X-User-ID: demo_user" \
  -d '{}'
```

---

## 📝 Next Steps to Integrate in App.jsx

You need to replace the mock functions in `App.jsx` with real API calls. Here's what to do:

### 1. Import the API service at the top of App.jsx:
```javascript
import { api } from './api/api';
```

### 2. Replace mock functions with real API calls:
```javascript
// Replace fetchFilesForUser
const fetchFilesForUser = async (userId) => {
  try {
    const response = await api.listFiles(userId);
    if (response.status === 'success') {
      setServerFiles(response.files);
      console.log('Files fetched:', response.files);
    }
  } catch (error) {
    console.error('Error fetching files:', error);
  }
};

// Update handleFileUpload to call real API
const handleFileUpload = async (selectedFiles) => {
  for (const file of selectedFiles) {
    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Content = e.target.result.split(',')[1]; // Remove data:... prefix
        
        setUploadProgress(50);
        
        const response = await api.uploadFile(file.name, base64Content, 'base64');
        
        if (response.status === 'success') {
          setUploadProgress(100);
          console.log('File uploaded:', response.file);
          
          // Refresh file list
          await fetchFilesForUser('demo_user');
          
          setTimeout(() => setUploadProgress(0), 1000);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress(0);
    }
  }
};
```

---

## 🐛 Troubleshooting

### Issue: "Connection refused" or CORS error
**Solution**: Make sure both servers are running:
- Check Flask server: http://localhost:5000/health
- Check React app: http://localhost:3000

### Issue: "Module not found" error in React
**Solution**: 
```bash
cd client
npm install
```

### Issue: Python dependencies missing
**Solution**:
```bash
cd server
source venv/bin/activate  # Activate venv first
pip install -r requirements.txt
```

### Issue: Port already in use
**Solution**:
```bash
# For port 5000:
lsof -ti:5000 | xargs kill -9

# For port 3000:
lsof -ti:3000 | xargs kill -9
```

---

## 🎯 Quick Start Commands (Both Terminals)

### Terminal 1 - Server:
```bash
cd "/run/media/aniketgawande/Aniket/cloud/cloud vault/server"
source venv/bin/activate
python main.py
```

### Terminal 2 - Client:
```bash
cd "/run/media/aniketgawande/Aniket/cloud/cloud vault/client"
npm run dev
```

---

## ✅ Success Checklist

- [ ] Server running on http://localhost:5000
- [ ] Client running on http://localhost:3000
- [ ] Health check returns `{"status": "ok"}`
- [ ] No CORS errors in browser console
- [ ] File upload works
- [ ] File list displays

---

## 📞 Need Help?

If you encounter issues:
1. Check both terminal outputs for errors
2. Verify .env configuration
3. Check browser console for errors (F12)
4. Ensure Python virtual environment is activated

Good luck! 🚀
