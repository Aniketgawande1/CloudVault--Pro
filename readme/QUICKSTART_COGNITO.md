# 🚀 CloudVault AWS Cognito Quick Start

## ⚡ Automatic Setup (Recommended)

Run the automated setup script:

```bash
cd "/run/media/aniketgawande/Aniket/cloud/cloud vault"
./setup_cognito.sh
```

This will:
1. Install AWS CLI (if needed)
2. Configure AWS credentials
3. Create Cognito User Pool
4. Create App Client
5. Update .env files automatically
6. Install Python dependencies

## 📋 Manual Setup (Alternative)

If you prefer manual setup or the script fails:

### Step 1: Install AWS CLI

```bash
pip3 install awscli --user
```

### Step 2: Configure AWS

```bash
aws configure
```

Enter:
- AWS Access Key ID: (from IAM console)
- AWS Secret Access Key: (from IAM console)
- Default region: `us-east-1`
- Default output format: `json`

### Step 3: Create User Pool

```bash
aws cognito-idp create-user-pool \
  --pool-name cloudvault-users \
  --policies "PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=false}" \
  --auto-verified-attributes email \
  --username-attributes email \
  --schema Name=email,Required=true,Mutable=false Name=name,Required=true,Mutable=true \
  --region us-east-1
```

Copy the `UserPool.Id` from output (looks like: `us-east-1_XXXXXXXXX`)

### Step 4: Create App Client

```bash
aws cognito-idp create-user-pool-client \
  --user-pool-id us-east-1_XXXXXXXXX \
  --client-name cloudvault-client \
  --no-generate-secret \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
  --region us-east-1
```

Copy the `ClientId` from output

### Step 5: Update Environment Files

**server/.env**:
```env
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_APP_CLIENT_ID=your_client_id_here
```

**client/.env.local**:
```env
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
NEXT_PUBLIC_COGNITO_APP_CLIENT_ID=your_client_id_here
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Step 6: Install Dependencies

```bash
cd server
pip3 install -r requirements.txt
```

## 🧪 Testing

### Start Servers

**Terminal 1 - Backend**:
```bash
cd server
python main.py
```

**Terminal 2 - Frontend**:
```bash
cd client
npm run dev
```

### Test Flow

1. Open http://localhost:3001
2. Click "Create Account"
3. Fill in:
   - Email: test@example.com
   - Password: Test123! (must have uppercase, lowercase, number)
   - Name: Test User
4. Click Sign Up
5. ✅ Should auto-confirm and login (development mode)
6. ✅ Should see dashboard

### Verify in AWS Console

Go to AWS Console → Cognito → User Pools → cloudvault-users → Users

You should see your user listed!

## 🔧 Troubleshooting

### Error: "AWS credentials not configured"
```bash
aws configure
# Enter your credentials
```

### Error: "User already exists"
Delete the user in AWS Console → Cognito, or use a different email

### Error: "Invalid password"
Password must have:
- At least 8 characters
- Uppercase letter
- Lowercase letter
- Number

### Error: "Module not found: boto3"
```bash
cd server
pip3 install -r requirements.txt
```

### Error: "COGNITO_USER_POOL_ID environment variable required"
Check that server/.env has correct values

## 💰 Cost Estimate

**Free Tier (Forever)**:
- 50,000 Monthly Active Users
- Unlimited user storage

**After Free Tier**:
- $0.0055 per MAU

**For CloudVault**: You'll stay in free tier unless you get 50,000+ users!

## 🎯 Benefits

✅ No database to manage
✅ AWS-managed security
✅ Built-in email verification
✅ Password reset flow included
✅ Multi-device support
✅ JWT token verification
✅ Free tier covers personal/small team use

## 📚 Next Steps

After auth is working:
1. Implement file upload
2. Implement file delete
3. Implement folder creation
4. Implement trash restore
5. Deploy to production
