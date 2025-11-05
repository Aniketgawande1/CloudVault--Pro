#!/bin/bash

echo "🚀 Creating AWS Cognito User Pool for CloudVault"
echo "Region: ap-south-1 (Mumbai)"
echo "=================================================="
echo ""

# Step 1: Create User Pool
echo "Step 1: Creating User Pool..."
USER_POOL_OUTPUT=$(aws cognito-idp create-user-pool \
  --pool-name cloudvault-users \
  --policies 'PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=false}' \
  --auto-verified-attributes email \
  --username-attributes email \
  --schema 'Name=email,Required=true,Mutable=false' 'Name=name,Required=true,Mutable=true' \
  --region ap-south-1 \
  --output json)

if [ $? -ne 0 ]; then
    echo "❌ Failed to create user pool"
    exit 1
fi

USER_POOL_ID=$(echo "$USER_POOL_OUTPUT" | python3 -c "import sys, json; print(json.load(sys.stdin)['UserPool']['Id'])")
echo "✅ User Pool created!"
echo "   Pool ID: $USER_POOL_ID"
echo ""

# Step 2: Create App Client
echo "Step 2: Creating App Client..."
APP_CLIENT_OUTPUT=$(aws cognito-idp create-user-pool-client \
  --user-pool-id "$USER_POOL_ID" \
  --client-name cloudvault-client \
  --no-generate-secret \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
  --region ap-south-1 \
  --output json)

if [ $? -ne 0 ]; then
    echo "❌ Failed to create app client"
    exit 1
fi

APP_CLIENT_ID=$(echo "$APP_CLIENT_OUTPUT" | python3 -c "import sys, json; print(json.load(sys.stdin)['UserPoolClient']['ClientId'])")
echo "✅ App Client created!"
echo "   Client ID: $APP_CLIENT_ID"
echo ""

# Step 3: Update server/.env
echo "Step 3: Updating server/.env..."
cat > .env << EOF
# Flask Configuration
FLASK_ENV=production
PORT=5000

# AWS Cognito Configuration
AWS_REGION=ap-south-1
COGNITO_USER_POOL_ID=$USER_POOL_ID
COGNITO_APP_CLIENT_ID=$APP_CLIENT_ID

# Storage Configuration
STORAGE_TYPE=local
DATA_DIR=./data
STORAGE_LIMIT=1073741824

# Authentication
AUTH_ENABLED=true
EOF

echo "✅ server/.env updated!"
echo ""

# Step 4: Update client/.env.local
echo "Step 4: Updating client/.env.local..."
cat > ../client/.env.local << EOF
# Cognito Client Configuration
NEXT_PUBLIC_AWS_REGION=ap-south-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=$USER_POOL_ID
NEXT_PUBLIC_COGNITO_APP_CLIENT_ID=$APP_CLIENT_ID
NEXT_PUBLIC_API_URL=http://localhost:5000
EOF

echo "✅ client/.env.local updated!"
echo ""

# Step 5: Update cognito_auth_service.py region
echo "Step 5: Updating auth service for ap-south-1..."
sed -i "s/AWS_REGION = os.getenv('AWS_REGION', 'us-east-1')/AWS_REGION = os.getenv('AWS_REGION', 'ap-south-1')/" services/cognito_auth_service.py
echo "✅ Auth service updated!"
echo ""

# Display summary
echo "🎉 Setup Complete!"
echo "==================="
echo ""
echo "📋 Your Cognito Configuration:"
echo "  Region: ap-south-1 (Mumbai)"
echo "  User Pool ID: $USER_POOL_ID"
echo "  App Client ID: $APP_CLIENT_ID"
echo ""
echo "📂 Files Updated:"
echo "  ✅ server/.env"
echo "  ✅ client/.env.local"
echo "  ✅ services/cognito_auth_service.py"
echo ""
echo "🔜 Next Steps:"
echo "  1. Install dependencies: pip3 install -r requirements.txt"
echo "  2. Start server: python main.py"
echo "  3. Start client: cd ../client && npm run dev"
echo "  4. Test at: http://localhost:3001"
echo ""
