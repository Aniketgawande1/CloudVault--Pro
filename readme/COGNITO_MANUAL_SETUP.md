# AWS Cognito Manual Setup Guide

Complete step-by-step guide to manually set up AWS Cognito for CloudVault authentication.

## Overview

You'll create:
1. A Cognito User Pool (manages users)
2. An App Client (allows your app to authenticate)
3. Update environment variables in the project

**Time needed:** 10-15 minutes

---

## Method 1: AWS Console (Recommended for Beginners)

### Step 1: Create User Pool

1. **Open AWS Console**
   - Go to https://console.aws.amazon.com/cognito
   - Make sure you're in your preferred region (e.g., `ap-south-1` Mumbai)

2. **Start Creating User Pool**
   - Click **"Manage User Pools"**
   - Click **"Create a user pool"**

3. **Configure Sign-in Experience**
   - Pool name: `CloudVaultUserPool` (or your choice)
   - Choose sign-in option:
     - ✅ **Username** (recommended)
     - Or Email/Phone if you prefer
   - Click **"Next"**

4. **Configure Security Requirements**
   - Password policy: Use defaults (8+ characters, uppercase, lowercase, number)
   - Multi-factor authentication (MFA): Choose **"No MFA"** for testing (enable later)
   - User account recovery: Email (optional for testing)
   - Click **"Next"**

5. **Configure Sign-up Experience**
   - Self-registration: **Allow** (so users can sign up)
   - Attribute verification: Email (optional)
   - Required attributes: None (or add email if you want)
   - Click **"Next"**

6. **Configure Message Delivery**
   - Email provider: **"Send email with Cognito"** (free tier, limited)
   - Or configure SES if you have it
   - Click **"Next"**

7. **Integrate Your App** (we'll add app client in next step)
   - Pool name: confirm `CloudVaultUserPool`
   - Hosted UI: **Skip for now** (not needed for password auth)
   - Click **"Next"**

8. **Review and Create**
   - Review settings
   - Click **"Create user pool"**

9. **Copy Pool ID**
   - After creation, you'll see the pool details page
   - Find **"User pool ID"** (format: `ap-south-1_XXXXXXXXX`)
   - **📋 SAVE THIS** - you'll need it for `COGNITO_USER_POOL_ID`

---

### Step 2: Create App Client

1. **Navigate to App Clients**
   - In your User Pool, click **"App integration"** tab (left sidebar or top)
   - Scroll down to **"App clients and analytics"**
   - Click **"Create app client"**

2. **Configure App Client**
   - App client name: `cloudvault-web-client`
   - **❌ DO NOT** check "Generate a client secret" (must be public client for web)
   - Authentication flows: Enable these:
     - ✅ **ALLOW_USER_PASSWORD_AUTH**
     - ✅ **ALLOW_REFRESH_TOKEN_AUTH**
   - Refresh token expiration: 30 days (default)
   - Access token expiration: 1 hour (default)
   - ID token expiration: 1 hour (default)

3. **Create and Copy Client ID**
   - Click **"Create app client"**
   - Find **"Client ID"** (format: alphanumeric string like `1a2b3c4d5e6f7g8h9i0j`)
   - **📋 SAVE THIS** - you'll need it for `COGNITO_APP_CLIENT_ID`

---

### Step 3: Optional - Configure Hosted UI (Skip for Password Auth)

If you want OAuth/social login later:
- In App client settings, add callback URLs: `http://localhost:3001`
- Add sign-out URLs: `http://localhost:3001`
- Choose OAuth flows (not needed for basic username/password)

**For now, skip this step.**

---

## Method 2: AWS CLI (For Developers)

### Prerequisites
```bash
# Install AWS CLI if not installed
# macOS: brew install awscli
# Linux: pip install awscli
# Or download from: https://aws.amazon.com/cli/

# Configure AWS credentials
aws configure
# Enter: Access Key ID, Secret Access Key, Region (e.g., ap-south-1), Output format (json)
```

### Step 1: Create User Pool

```bash
# Create user pool and capture the ID
USER_POOL_ID=$(aws cognito-idp create-user-pool \
  --pool-name "CloudVaultUserPool" \
  --policies 'PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=false}' \
  --auto-verified-attributes email \
  --username-attributes email \
  --query 'UserPool.Id' \
  --output text \
  --region ap-south-1)

echo "✅ User Pool Created!"
echo "Pool ID: $USER_POOL_ID"
```

**Save this Pool ID** - you'll need it for the next command and env variables.

### Step 2: Create App Client

```bash
# Replace $USER_POOL_ID with the ID from previous command if not in same session
CLIENT_ID=$(aws cognito-idp create-user-pool-client \
  --user-pool-id "$USER_POOL_ID" \
  --client-name "cloudvault-web-client" \
  --generate-secret false \
  --refresh-token-validity 30 \
  --explicit-auth-flows "ALLOW_USER_PASSWORD_AUTH" "ALLOW_REFRESH_TOKEN_AUTH" "ALLOW_USER_SRP_AUTH" \
  --query 'UserPoolClient.ClientId' \
  --output text \
  --region ap-south-1)

echo "✅ App Client Created!"
echo "Client ID: $CLIENT_ID"
```

**Save both IDs** - you'll need them for environment variables.

---

## Step 4: Update Environment Variables

### Server Environment (`server/.env`)

Create or edit `server/.env` file in your project:

```bash
# Flask Configuration
FLASK_ENV=development
PORT=5000

# AWS Cognito Configuration
AWS_REGION=ap-south-1
COGNITO_USER_POOL_ID=ap-south-1_XXXXXXXXX
COGNITO_APP_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j

# AWS Credentials (for server-side operations)
# Get from AWS IAM Console > Your User > Security credentials
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# Storage Configuration
STORAGE_TYPE=local
DATA_DIR=./data
STORAGE_LIMIT=1073741824

# Authentication
AUTH_ENABLED=true
```

**Replace:**
- `AWS_REGION` - Your chosen region (e.g., `ap-south-1`)
- `COGNITO_USER_POOL_ID` - From Step 1 (pool creation)
- `COGNITO_APP_CLIENT_ID` - From Step 2 (app client creation)
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` - From AWS IAM Console

### Client Environment (`client/.env.local`)

Create `client/.env.local` file:

```bash
# AWS Cognito Configuration (Public - safe for browser)
NEXT_PUBLIC_AWS_REGION=ap-south-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=ap-south-1_XXXXXXXXX
NEXT_PUBLIC_COGNITO_APP_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j
```

**Replace** with the same IDs from above.

**⚠️ Security Note:** Never commit AWS secret keys to git. Add `.env` and `.env.local` to `.gitignore`.

---

## Step 5: Install Dependencies

### Server Dependencies

```bash
cd server
pip3 install -r requirements.txt
```

This installs:
- `boto3` - AWS SDK for Python
- `python-jose[cryptography]` - JWT verification
- `requests` - HTTP client for fetching Cognito JWKs
- `flask`, `flask-cors` - Web framework

### Client Dependencies

```bash
cd client
npm install
```

---

## Step 6: Start and Test

### Start Backend Server

```bash
cd server
python main.py
```

Expected output:
```
 * Running on http://127.0.0.1:5000
 * Running on http://0.0.0.0:5000
```

### Start Frontend Server

```bash
cd client
npm run dev
```

Expected output:
```
- ready started server on 0.0.0.0:3001, url: http://localhost:3001
```

---

## Step 7: Test Authentication

### Option A: Test via UI (Browser)

1. Open http://localhost:3001
2. Click "Sign Up" / "Create Account"
3. Enter:
   - Username: `testuser`
   - Password: `TestPass123` (must meet password policy)
   - Email: `you@example.com`
4. Click "Sign Up"
5. Login with same credentials
6. You should see the dashboard with "1 GB Free" storage

### Option B: Test via API (curl)

**1. Sign Up:**
```bash
curl -X POST http://127.0.0.1:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "TestPass123",
    "email": "you@example.com"
  }'
```

Expected response:
```json
{
  "message": "User created successfully",
  "username": "testuser"
}
```

**2. Login:**
```bash
curl -X POST http://127.0.0.1:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "TestPass123"
  }'
```

Expected response:
```json
{
  "id_token": "eyJraWQiOiJ...",
  "access_token": "eyJraWQiOiJ...",
  "refresh_token": "eyJjdHkiOiJ...",
  "user": {
    "sub": "uuid-user-id",
    "username": "testuser",
    "email": "you@example.com"
  }
}
```

**3. Validate Token:**
```bash
# Copy the id_token from login response
curl -H "Authorization: Bearer YOUR_ID_TOKEN_HERE" \
  http://127.0.0.1:5000/auth/me
```

Expected response:
```json
{
  "sub": "uuid-user-id",
  "username": "testuser",
  "email": "you@example.com"
}
```

✅ If you get user info back, **authentication is working!**

---

## Troubleshooting

### Error: "Invalid client" on login

**Cause:** App client doesn't allow password authentication flow.

**Fix:**
1. Go to AWS Console > Cognito > Your User Pool
2. App integration > App clients > Your app client
3. Edit authentication flows
4. Enable `ALLOW_USER_PASSWORD_AUTH` and `ALLOW_REFRESH_TOKEN_AUTH`
5. Save changes

### Error: "Unauthorized" from /auth/me

**Cause:** Token verification failed.

**Check:**
1. `COGNITO_USER_POOL_ID` in `server/.env` matches your actual pool ID
2. `AWS_REGION` in `server/.env` matches the region where you created the pool
3. Server can reach internet to fetch JWKs from:
   ```
   https://cognito-idp.{region}.amazonaws.com/{poolId}/.well-known/jwks.json
   ```
4. Token isn't expired (tokens expire after 1 hour by default)

### Error: "User does not exist" on login

**Cause:** User wasn't created in Cognito.

**Fix:**
1. Check signup response - did it succeed?
2. Go to AWS Console > Cognito > Your User Pool > Users
3. Verify user exists in the list
4. Check user status (might need email verification if configured)

### Error: "AccessDeniedException" from boto3

**Cause:** AWS credentials don't have permission to use Cognito.

**Fix:**
1. Go to AWS IAM Console
2. Find your IAM user
3. Add policy: `AmazonCognitoPowerUser` or create custom policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "cognito-idp:AdminGetUser",
      "cognito-idp:AdminCreateUser",
      "cognito-idp:AdminInitiateAuth",
      "cognito-idp:ListUsers"
    ],
    "Resource": "arn:aws:cognito-idp:*:*:userpool/*"
  }]
}
```

### Port 3000 already in use

**Fix:** The project is configured to use port 3001. If you need to change it:
```bash
# Edit package.json in client/
"scripts": {
  "dev": "next dev -p 3002"  # Change to any port
}
```

### Python dependencies fail to install

**Fix:** Use a virtual environment:
```bash
cd server
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

## Next Steps

Once authentication is working:

1. **Enable File Operations**
   - Upload files via UI
   - View file list
   - Download/delete files
   - Storage usage tracking

2. **Add Security Enhancements**
   - Enable MFA in Cognito User Pool
   - Set up email verification
   - Add password reset flow
   - Configure account recovery

3. **Production Deployment**
   - Set up SES for production email
   - Use environment-specific configs
   - Enable CloudWatch logging
   - Set up HTTPS/SSL

4. **Optional Features**
   - Add social login (Google/Facebook)
   - Implement Cognito Hosted UI
   - Add user profile management
   - Enable account deletion

---

## Quick Reference

### Important URLs
- AWS Cognito Console: https://console.aws.amazon.com/cognito
- AWS IAM Console: https://console.aws.amazon.com/iam
- Frontend (local): http://localhost:3001
- Backend (local): http://127.0.0.1:5000

### Key Files
- Server config: `server/.env`
- Client config: `client/.env.local`
- Server auth service: `server/services/cognito_auth_service.py`
- Server routes: `server/main.py`
- Client API wrapper: `client/src/api/api.js`
- Client auth UI: `client/src/components/auth/`

### Common Commands
```bash
# Start backend
cd server && python main.py

# Start frontend
cd client && npm run dev

# Install server deps
cd server && pip3 install -r requirements.txt

# Install client deps
cd client && npm install

# Check Python version
python3 --version

# Check Node version
node --version
```

---

## Support

If you encounter issues not covered here:

1. Check server logs in terminal where `python main.py` is running
2. Check browser console (F12) for frontend errors
3. Verify all environment variables are set correctly
4. Confirm AWS credentials have proper permissions
5. Test each endpoint individually with curl to isolate issues

---

**✅ Setup Complete!** You now have a fully functional AWS Cognito authentication system.
