# 🚀 Quick Start - Connect Server & Client

## ⚡ Super Fast Setup (2 Commands)

### Step 1: Start Server (Terminal 1)
```bash
cd "/run/media/aniketgawande/Aniket/cloud/cloud vault/server"
./start_server.sh
```

### Step 2: Start Client (Terminal 2 - Keep first one running)
```bash
cd "/run/media/aniketgawande/Aniket/cloud/cloud vault/client"
npm run dev
```

**That's it!** 🎉

- **Server**: http://localhost:5000
- **Client**: http://localhost:3000

---

## 📖 What Each Step Does

### Server (./start_server.sh):
1. ✅ Creates Python virtual environment (if needed)
2. ✅ Installs all dependencies automatically
3. ✅ Creates .env configuration
4. ✅ Starts Flask server on port 5000

### Client (npm run dev):
1. ✅ Starts Next.js development server
2. ✅ Opens on port 3000 (or 3001 if 3000 is busy)
3. ✅ Hot reload enabled

---

## 🧪 Test the Connection

### Option 1: Browser Console Test
1. Open http://localhost:3000
2. Open browser console (F12)
3. Run:
```javascript
fetch('http://localhost:5000/health')
  .then(r => r.json())
  .then(d => console.log('✅ Server connected:', d));
```

### Option 2: Terminal Test
```bash
curl http://localhost:5000/health
```

Expected: `{"status":"ok"}`

---

## 📂 Files Created

I've created these files for you:

1. **`SETUP_GUIDE.md`** - Detailed setup instructions
2. **`server/.env`** - Server configuration
3. **`server/start_server.sh`** - Automatic server startup
4. **`client/src/api/config.js`** - API configuration
5. **`client/src/api/api.js`** - API service functions

---

## 🔗 How to Use API in Your App

The API is ready to use! Import it in any component:

```javascript
import { api } from './api/api';

// Examples:
await api.checkHealth();
await api.uploadFile('test.txt', base64Content);
await api.listFiles();
await api.downloadFile('demo_user/test.txt');
```

---

## ❓ Troubleshooting

### Server won't start?
```bash
# Check if port 5000 is in use
lsof -ti:5000 | xargs kill -9

# Then restart
./start_server.sh
```

### Client won't start?
```bash
# Install dependencies
npm install

# Then start
npm run dev
```

### Need detailed help?
Check `SETUP_GUIDE.md` for complete instructions!

---

## 📝 Next Steps

1. ✅ Start both servers (done above)
2. ✅ Test connection
3. 📝 Update App.jsx to use real API calls (see SETUP_GUIDE.md)
4. 🎨 Enjoy your connected CloudVault app!

**For complete integration guide, see: `SETUP_GUIDE.md`**
