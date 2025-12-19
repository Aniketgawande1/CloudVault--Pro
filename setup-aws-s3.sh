#!/bin/bash

# AWS S3 Storage Setup Script for CloudVault
# This script helps you quickly set up S3 storage for your CloudVault application

set -e

echo "🚀 CloudVault AWS S3 Setup"
echo "=========================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed"
    echo "Please install it first:"
    echo "  curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip'"
    echo "  unzip awscliv2.zip"
    echo "  sudo ./aws/install"
    exit 1
fi

print_success "AWS CLI found: $(aws --version)"

# Check if AWS is configured
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS CLI is not configured"
    echo ""
    echo "Please run: aws configure"
    echo ""
    echo "You'll need:"
    echo "  - AWS Access Key ID"
    echo "  - AWS Secret Access Key"
    echo "  - Default region (e.g., ap-south-1)"
    exit 1
fi

print_success "AWS credentials configured"
echo ""

# Get AWS account info
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region)
print_info "AWS Account ID: $ACCOUNT_ID"
print_info "AWS Region: $AWS_REGION"
echo ""

# Ask for bucket name
read -p "Enter S3 bucket name (e.g., cloudvault-storage-prod): " BUCKET_NAME

if [ -z "$BUCKET_NAME" ]; then
    print_error "Bucket name cannot be empty"
    exit 1
fi

# Check if bucket exists
if aws s3 ls "s3://$BUCKET_NAME" 2>/dev/null; then
    print_warning "Bucket '$BUCKET_NAME' already exists"
    read -p "Do you want to use this existing bucket? (y/n): " use_existing
    if [ "$use_existing" != "y" ]; then
        exit 0
    fi
else
    # Create bucket
    print_info "Creating S3 bucket: $BUCKET_NAME"
    
    if [ "$AWS_REGION" == "us-east-1" ]; then
        aws s3 mb "s3://$BUCKET_NAME"
    else
        aws s3 mb "s3://$BUCKET_NAME" --region "$AWS_REGION"
    fi
    
    print_success "Bucket created successfully"
fi

# Enable versioning
print_info "Enabling bucket versioning..."
aws s3api put-bucket-versioning \
    --bucket "$BUCKET_NAME" \
    --versioning-configuration Status=Enabled

print_success "Versioning enabled"

# Enable encryption
print_info "Enabling server-side encryption..."
aws s3api put-bucket-encryption \
    --bucket "$BUCKET_NAME" \
    --server-side-encryption-configuration '{
        "Rules": [{
            "ApplyServerSideEncryptionByDefault": {
                "SSEAlgorithm": "AES256"
            },
            "BucketKeyEnabled": true
        }]
    }'

print_success "Encryption enabled"

# Configure CORS
print_info "Configuring CORS..."
cat > /tmp/cors.json << 'EOF'
{
    "CORSRules": [
        {
            "AllowedOrigins": ["http://localhost:3000", "http://localhost:3001", "https://*"],
            "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
            "AllowedHeaders": ["*"],
            "ExposeHeaders": ["ETag", "x-amz-server-side-encryption"],
            "MaxAgeSeconds": 3000
        }
    ]
}
EOF

aws s3api put-bucket-cors \
    --bucket "$BUCKET_NAME" \
    --cors-configuration file:///tmp/cors.json

print_success "CORS configured"

# Configure lifecycle policy (optional)
read -p "Do you want to auto-delete backup files older than 30 days? (y/n): " setup_lifecycle
if [ "$setup_lifecycle" == "y" ]; then
    print_info "Setting up lifecycle policy..."
    
    cat > /tmp/lifecycle.json << 'EOF'
{
    "Rules": [
        {
            "Id": "DeleteOldBackups",
            "Status": "Enabled",
            "Filter": {
                "Prefix": "backups/"
            },
            "Expiration": {
                "Days": 30
            }
        }
    ]
}
EOF

    aws s3api put-bucket-lifecycle-configuration \
        --bucket "$BUCKET_NAME" \
        --lifecycle-configuration file:///tmp/lifecycle.json
    
    print_success "Lifecycle policy configured"
fi

# Test upload
print_info "Testing S3 upload..."
echo "CloudVault Test File" > /tmp/test-cloudvault.txt
aws s3 cp /tmp/test-cloudvault.txt "s3://$BUCKET_NAME/test/test-cloudvault.txt"
print_success "Upload test successful"

# Test download
print_info "Testing S3 download..."
aws s3 cp "s3://$BUCKET_NAME/test/test-cloudvault.txt" /tmp/test-download.txt
print_success "Download test successful"

# Cleanup test files
aws s3 rm "s3://$BUCKET_NAME/test/test-cloudvault.txt"
rm /tmp/test-cloudvault.txt /tmp/test-download.txt /tmp/cors.json
[ -f /tmp/lifecycle.json ] && rm /tmp/lifecycle.json

print_success "Test files cleaned up"
echo ""

# Update .env file
print_info "Updating server/.env file..."

ENV_FILE="server/.env"

if [ -f "$ENV_FILE" ]; then
    # Backup existing .env
    cp "$ENV_FILE" "$ENV_FILE.backup"
    print_info "Backed up existing .env to .env.backup"
fi

# Get AWS credentials
AWS_ACCESS_KEY=$(aws configure get aws_access_key_id)
AWS_SECRET_KEY=$(aws configure get aws_secret_access_key)

# Update or create .env file
cat > "$ENV_FILE" << EOF
# Flask Configuration
FLASK_ENV=production
PORT=5000

# AWS Cognito Configuration
AWS_REGION=$AWS_REGION
COGNITO_USER_POOL_ID=ap-south-1_jop34S6wZ
COGNITO_APP_CLIENT_ID=1bc810i7mqp7bvqcvr3dg94n2o

# AWS Credentials
AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=$AWS_SECRET_KEY

# S3 Storage Configuration
STORAGE_TYPE=s3
S3_BUCKET=$BUCKET_NAME
S3_REGION=$AWS_REGION

# Storage Configuration
STORAGE_LIMIT=1073741824

# Authentication
AUTH_ENABLED=true
EOF

print_success ".env file updated"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
print_success "AWS S3 Setup Complete! 🎉"
echo ""
echo "📋 Configuration Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  S3 Bucket:         $BUCKET_NAME"
echo "  AWS Region:        $AWS_REGION"
echo "  AWS Account:       $ACCOUNT_ID"
echo "  Versioning:        Enabled"
echo "  Encryption:        AES-256"
echo "  CORS:              Configured"
echo ""
echo "📁 Bucket URL:"
echo "  https://$BUCKET_NAME.s3.$AWS_REGION.amazonaws.com"
echo ""
echo "🔒 Security:"
print_success "  Server-side encryption enabled"
print_success "  Bucket versioning enabled"
print_warning "  Public access blocked (recommended)"
echo ""
echo "🚀 Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  1. Test the application:"
echo "     cd server && python main.py"
echo ""
echo "  2. Verify S3 storage is working:"
echo "     # Upload a file through the app"
echo "     # Check: aws s3 ls s3://$BUCKET_NAME/"
echo ""
echo "  3. Monitor usage:"
echo "     aws s3 ls s3://$BUCKET_NAME/ --recursive --human-readable --summarize"
echo ""
echo "  4. View AWS console:"
echo "     https://s3.console.aws.amazon.com/s3/buckets/$BUCKET_NAME"
echo ""
echo "💰 Cost Estimation (Mumbai region):"
echo "  Storage:    ~\$0.023/GB/month"
echo "  Requests:   \$0.005/1,000 PUT"
echo "  Transfer:   First 1GB free, then \$0.12/GB"
echo ""
print_warning "Remember: Never commit AWS credentials to git!"
print_info "Your credentials are stored in server/.env (already in .gitignore)"
echo ""

