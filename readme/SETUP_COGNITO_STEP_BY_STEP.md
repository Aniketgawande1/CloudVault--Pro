# 🚀 AWS Cognito Setup - Step by Step Guide

## ⚡ EASIEST METHOD: Automated Script (Recommended)

### Step 1: Get AWS Credentials

1. **Go to AWS Console**: https://console.aws.amazon.com/
2. **Sign in** or create a free account
3. **Go to IAM** (Identity and Access Management):
   - Search "IAM" in the top search bar
   - Click "IAM" service

4. **Create a User**:
   - Click "Users" in left sidebar
   - Click "Create user"
   - User name: `cloudvault-admin`
   - Click "Next"
   
5. **Set Permissions**:
   - Select "Attach policies directly"
   - Search and check: `AmazonCognitoPowerUser`
   - Click "Next"
   - Click "Create user"

6. **Create Access Key**:
   - Click on the user you just created
   - Click "Security credentials" tab
   - Scroll down to "Access keys"
   - Click "Create access key"
   - Choose: "Command Line Interface (CLI)"
   - Check "I understand..."
   - Click "Next"
   - Description: "CloudVault Cognito"
   - Click "Create access key"
   - **⚠️ IMPORTANT: Copy both:**
     - Access key ID (starts with AKIA...)
     - Secret access key (long string, shown only once!)
   - Click "Done"

### Step 2: Run Automated Setup

```bash
# Navigate to your project
cd "/run/media/aniketgawande/Aniket/cloud/cloud vault"

# Run the setup script
./setup_cognito.sh
```

**What it will ask you:**

1. **AWS Access Key ID**: Paste the Access key ID you copied
2. **AWS Secret Access Key**: Paste the Secret access key
3. **Default region name**: Type `us-east-1` and press Enter
4. **Default output format**: Type `json` and press Enter

**That's it!** The script will:
- ✅ Create Cognito User Pool
- ✅ Create App Client
- ✅ Update server/.env
- ✅ Update client/.env.local
- ✅ Install Python dependencies

### Step 3: Verify Setup

```bash
# Check if .env was updated
cat server/.env | grep COGNITO

# You should see:
# COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
# COGNITO_APP_CLIENT_ID=xxxxxxxxxxxxx
```

### Step 4: Test It!

```bash
# Terminal 1 - Start backend
cd server
python main.py

# Terminal 2 - Start frontend (in new terminal)
cd client
npm run dev

# Open browser: http://localhost:3001
# Try signing up with a new account!
```

---

## 📝 MANUAL METHOD (If Script Fails)

### Step 1: Install AWS CLI

```bash
pip3 install awscli --user
```

### Step 2: Configure AWS CLI

```bash
aws configure
```

Enter:
- AWS Access Key ID: (paste from IAM)
- AWS Secret Access Key: (paste from IAM)
- Default region name: `us-east-1`
- Default output format: `json`

### Step 3: Create Cognito User Pool

```bash
aws cognito-idp create-user-pool \
  --pool-name cloudvault-users \
  --policies "PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=false}" \
  --auto-verified-attributes email \
  --username-attributes email \
  --schema Name=email,Required=true,Mutable=false Name=name,Required=true,Mutable=true \
  --region us-east-1
```

**Copy the UserPool.Id** from the output (looks like: `us-east-1_abc123XYZ`)

### Step 4: Create App Client

Replace `YOUR_USER_POOL_ID` with the ID from Step 3:

```bash
aws cognito-idp create-user-pool-client \
  --user-pool-id YOUR_USER_POOL_ID \
  --client-name cloudvault-client \
  --no-generate-secret \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
  --region us-east-1
```

**Copy the ClientId** from the output (looks like: `1a2b3c4d5e6f7g8h9i0j`)

### Step 5: Update server/.env

Edit `server/.env`:

```bash
nano server/.env
# or
code server/.env
```

Update these lines:

```env
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_YOUR_POOL_ID_HERE
COGNITO_APP_CLIENT_ID=YOUR_CLIENT_ID_HERE
```

**Don't change** `AWS_ACCESS_KEY_ID` or `AWS_SECRET_ACCESS_KEY` - they're read from `~/.aws/credentials`

### Step 6: Update client/.env.local

Create or edit `client/.env.local`:

```bash
nano client/.env.local
# or
code client/.env.local
```

Add:

```env
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_YOUR_POOL_ID_HERE
NEXT_PUBLIC_COGNITO_APP_CLIENT_ID=YOUR_CLIENT_ID_HERE
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Step 7: Install Python Dependencies

```bash
cd server
pip3 install -r requirements.txt
```

### Step 8: Test Connection

```bash
# Start the server
python main.py

# You should see:
# * Running on http://127.0.0.1:5000
# No error about COGNITO_USER_POOL_ID
```

---

## 🎯 VERIFY IT'S WORKING

### Test 1: Check Server Starts

```bash
cd server
python main.py
```

**Expected Output:**
```
 * Serving Flask app 'main'
 * Debug mode: off
 * Running on http://127.0.0.1:5000
```

**❌ If you see error:**
```
ValueError: AWS Cognito environment variables are required!
```
→ Your .env file is not configured correctly

### Test 2: Create a Test User via CLI

```bash
aws cognito-idp sign-up \
  --client-id YOUR_CLIENT_ID \
  --username test@example.com \
  --password Test123! \
  --user-attributes Name=email,Value=test@example.com Name=name,Value="Test User" \
  --region us-east-1
```

**Expected:** You should see user details returned

### Test 3: Confirm the User (for testing)

```bash
aws cognito-idp admin-confirm-sign-up \
  --user-pool-id YOUR_USER_POOL_ID \
  --username test@example.com \
  --region us-east-1
```

### Test 4: Test Login via API

```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}' | python3 -m json.tool
```

**Expected Response:**
```json
{
  "status": "success",
  "token": "eyJraWQ...",
  "id_token": "eyJraWQ...",
  "access_token": "eyJraWQ...",
  "refresh_token": "eyJjdHk...",
  "user": {
    "user_id": "abc123...",
    "email": "test@example.com",
    "full_name": "Test User"
  }
}
```

---

## 🐛 TROUBLESHOOTING

### Error: "AWS credentials not configured"

**Solution:**
```bash
aws configure
# Enter your credentials again
```

### Error: "User already exists"

**Solution:** Use a different email or delete the user:
```bash
aws cognito-idp admin-delete-user \
  --user-pool-id YOUR_USER_POOL_ID \
  --username test@example.com \
  --region us-east-1
```

### Error: "Invalid password"

**Solution:** Password must have:
- At least 8 characters
- 1 uppercase letter (A-Z)
- 1 lowercase letter (a-z)
- 1 number (0-9)

Example valid passwords: `Test123!`, `MyPass1`, `Hello123`

### Error: "Module 'boto3' not found"

**Solution:**
```bash
cd server
pip3 install boto3 python-jose requests
```

### Error: "Token is invalid or expired"

**Solution:** Clear browser localStorage and login again:
```javascript
// Open browser console (F12)
localStorage.clear();
```

---

## 📊 VISUAL DIAGRAM

```
┌─────────────┐
│  AWS Cloud  │
└──────┬──────┘
       │
       ├── IAM User (you created)
       │   └── Access Keys
       │
       └── Cognito
           └── User Pool
               ├── Users (stored here)
               └── App Client
                   └── Client ID

┌──────────────────────────────────┐
│  Your Server (main.py)           │
│  ┌────────────────────────────┐  │
│  │ cognito_auth_service.py    │  │
│  │ - Uses boto3              │  │
│  │ - Connects to Cognito     │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
           ↑ API calls
           │
┌──────────────────────────────────┐
│  Browser (client)                │
│  - User signs up                 │
│  - Gets token from Cognito      │
│  - Sends token to server        │
└──────────────────────────────────┘
```

---

## ✅ FINAL CHECKLIST

Before testing:

- [ ] AWS account created
- [ ] IAM user created with Cognito permissions
- [ ] Access key ID and Secret key copied
- [ ] AWS CLI configured (`aws configure` completed)
- [ ] Cognito User Pool created
- [ ] App Client created
- [ ] `server/.env` updated with pool ID and client ID
- [ ] `client/.env.local` created with pool ID and client ID
- [ ] Python dependencies installed (`pip3 install -r requirements.txt`)
- [ ] Server starts without errors (`python main.py`)

---

## 🎉 YOU'RE READY!

Start both servers:

```bash
# Terminal 1
cd server && python main.py

# Terminal 2  
cd client && npm run dev
```

Open http://localhost:3001 and sign up!

**First signup will:**
1. Create user in AWS Cognito ✅
2. Return JWT tokens ✅
3. Login automatically ✅
4. Show dashboard ✅

---

## 💰 Cost

**Free Tier (Forever):**
- 50,000 monthly active users
- Unlimited user storage
- 50 emails per day

**You won't pay anything unless you get 50,000+ users!**
