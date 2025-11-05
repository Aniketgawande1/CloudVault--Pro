#!/bin/bash

echo "🚀 Setting up AWS Cognito for CloudVault"
echo "========================================"
echo ""

# Step 1: Check if AWS CLI is installed
echo "1. Checking AWS CLI..."
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Installing..."
    pip3 install awscli --user
    echo "✅ AWS CLI installed"
else
    echo "✅ AWS CLI found"
fi

echo ""
echo "2. AWS Configuration"
echo "--------------------"
echo "Please configure AWS CLI with your credentials:"
echo "You'll need:"
echo "  - AWS Access Key ID"
echo "  - AWS Secret Access Key"
echo "  - Default region (us-east-1 recommended)"
echo ""
read -p "Press Enter to configure AWS CLI..."
aws configure

echo ""
echo "3. Creating Cognito User Pool..."
echo "--------------------------------"

# Create User Pool
USER_POOL_OUTPUT=$(aws cognito-idp create-user-pool \
  --pool-name cloudvault-users \
  --policies "PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=false}" \
  --auto-verified-attributes email \
  --username-attributes email \
  --schema Name=email,Required=true,Mutable=false Name=name,Required=true,Mutable=true \
  --region us-east-1 \
  --output json 2>&1)

if [[ $? -ne 0 ]]; then
    echo "❌ Failed to create user pool"
    echo "$USER_POOL_OUTPUT"
    exit 1
fi

USER_POOL_ID=$(echo "$USER_POOL_OUTPUT" | python3 -c "import sys, json; print(json.load(sys.stdin)['UserPool']['Id'])")
echo "✅ User Pool created: $USER_POOL_ID"

echo ""
echo "4. Creating App Client..."
echo "-------------------------"

# Create App Client
APP_CLIENT_OUTPUT=$(aws cognito-idp create-user-pool-client \
  --user-pool-id "$USER_POOL_ID" \
  --client-name cloudvault-client \
  --no-generate-secret \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
  --region us-east-1 \
  --output json 2>&1)

if [[ $? -ne 0 ]]; then
    echo "❌ Failed to create app client"
    echo "$APP_CLIENT_OUTPUT"
    exit 1
fi

APP_CLIENT_ID=$(echo "$APP_CLIENT_OUTPUT" | python3 -c "import sys, json; print(json.load(sys.stdin)['UserPoolClient']['ClientId'])")
echo "✅ App Client created: $APP_CLIENT_ID"

echo ""
echo "5. Updating .env files..."
echo "-------------------------"

# Update server .env
cat > server/.env << EOF
# Flask Configuration
FLASK_ENV=production
PORT=5000

# AWS Cognito Configuration
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=$USER_POOL_ID
COGNITO_APP_CLIENT_ID=$APP_CLIENT_ID

# AWS Credentials (already configured via aws configure)
# Credentials will be read from ~/.aws/credentials

# Storage Configuration
STORAGE_TYPE=local
DATA_DIR=./data
STORAGE_LIMIT=1073741824

# Authentication
AUTH_ENABLED=true
EOF

echo "✅ Updated server/.env"

# Update client .env.local
cat > client/.env.local << EOF
# Cognito Client Configuration
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=$USER_POOL_ID
NEXT_PUBLIC_COGNITO_APP_CLIENT_ID=$APP_CLIENT_ID
NEXT_PUBLIC_API_URL=http://localhost:5000
EOF

echo "✅ Updated client/.env.local"

echo ""
echo "6. Installing Python dependencies..."
echo "------------------------------------"
cd server
pip3 install -r requirements.txt
echo "✅ Python dependencies installed"

echo ""
echo "🎉 Setup Complete!"
echo "==================="
echo ""
echo "Your Cognito credentials:"
echo "  User Pool ID: $USER_POOL_ID"
echo "  App Client ID: $APP_CLIENT_ID"
echo "  Region: us-east-1"
echo ""
echo "Next steps:"
echo "  1. Start the server: cd server && python main.py"
echo "  2. Start the client: cd client && npm run dev"
echo "  3. Open http://localhost:3001"
echo "  4. Sign up and test!"
echo ""
echo "📝 Note: First user signup will send a verification email."
echo "   Check the COGNITO_SETUP_GUIDE.md for more details."
