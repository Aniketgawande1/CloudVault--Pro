# AWS Cognito Setup Guide for CloudVault

## 🎯 Setup Steps

### 1. Create Cognito User Pool (AWS Console)

1. **Go to AWS Console** → Cognito → Create User Pool
2. **Configure sign-in experience**:
   - Provider types: ✅ Cognito user pool
   - Cognito user pool sign-in options: ✅ Email
   - Click Next

3. **Configure security requirements**:
   - Password policy: Choose "Cognito defaults" or custom
   - Multi-factor authentication (MFA): No MFA (or Optional)
   - User account recovery: ✅ Enable self-service account recovery (Email only)
   - Click Next

4. **Configure sign-up experience**:
   - Self-registration: ✅ Enable self-registration
   - Attribute verification: ✅ Send email message, verify email address
   - Required attributes: 
     - ✅ email
     - ✅ name (for full_name)
   - Click Next

5. **Configure message delivery**:
   - Email provider: Choose "Send email with Cognito" (Free tier: 50 emails/day)
   - SES Configuration: Skip for now (can add later)
   - Click Next

6. **Integrate your app**:
   - User pool name: `cloudvault-users`
   - Hosted authentication pages: ❌ Don't use (we have custom UI)
   - Initial app client:
     - App type: ✅ Public client
     - App client name: `cloudvault-client`
     - Client secret: ❌ Don't generate (public SPA)
     - Authentication flows: 
       - ✅ ALLOW_USER_PASSWORD_AUTH
       - ✅ ALLOW_REFRESH_TOKEN_AUTH
   - Click Next

7. **Review and create** → Create user pool

### 2. Get Your Credentials

After creation, copy these values:

```
User Pool ID: us-east-1_XXXXXXXXX
Region: us-east-1
App Client ID: 1234567890abcdefghijklmnop
```

### 3. CLI Method (Alternative - Faster)

```bash
# Install AWS CLI if not installed
# brew install awscli  # macOS
# pip install awscli   # Python

# Configure AWS credentials
aws configure
# Enter: Access Key, Secret Key, Region (us-east-1), Output format (json)

# Create User Pool
aws cognito-idp create-user-pool \
  --pool-name cloudvault-users \
  --policies "PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=false}" \
  --auto-verified-attributes email \
  --username-attributes email \
  --schema Name=email,Required=true,Mutable=false Name=name,Required=true,Mutable=true \
  --region us-east-1

# Save the UserPoolId from output

# Create App Client
aws cognito-idp create-user-pool-client \
  --user-pool-id us-east-1_XXXXXXXXX \
  --client-name cloudvault-client \
  --no-generate-secret \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
  --region us-east-1

# Save the ClientId from output
```

### 4. Update Environment Variables

Create/update `server/.env`:

```env
# AWS Cognito Configuration
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_APP_CLIENT_ID=1234567890abcdefghijklmnop

# AWS Credentials (for server-side operations)
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
```

Create `client/.env.local`:

```env
# Cognito Client Config
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
NEXT_PUBLIC_COGNITO_APP_CLIENT_ID=1234567890abcdefghijklmnop
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 5. Benefits of This Setup

✅ **Free Tier**: 50,000 MAUs (Monthly Active Users) free forever
✅ **No Database Needed**: Cognito stores users
✅ **Secure**: AWS-managed tokens with automatic rotation
✅ **Email Verification**: Built-in email verification
✅ **Password Reset**: Built-in forgot password flow
✅ **JWT Tokens**: Industry-standard tokens with built-in verification
✅ **Refresh Tokens**: Automatic token refresh (7-day access, 30-day refresh)
✅ **Multi-device**: Users can login from multiple devices

### 6. Next Steps After Setup

1. Install dependencies (I'll do this)
2. Update server auth service to use Cognito
3. Update client to use Cognito tokens
4. Test signup/login flow

## 📋 Free Tier Limits

| Service | Free Tier | After Free Tier |
|---------|-----------|-----------------|
| Cognito MAUs | 50,000/month forever | $0.0055 per MAU |
| Cognito emails | 50/day via Cognito email | Use SES (50,000 free/month) |
| SES emails | 62,000/month (if EC2-based) | $0.10 per 1,000 |

**For CloudVault**: Cognito's 50,000 MAUs and 50 emails/day is more than enough for personal/small team use!
