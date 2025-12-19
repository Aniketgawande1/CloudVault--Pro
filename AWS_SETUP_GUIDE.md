# AWS Setup Guide for CloudVault Backend Deployment

This guide will help you connect your CloudVault application to AWS services for backend deployment and storage.

## 📋 Table of Contents
1. [AWS Services Overview](#aws-services-overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: AWS Account Setup](#step-1-aws-account-setup)
4. [Step 2: IAM User Creation](#step-2-iam-user-creation)
5. [Step 3: S3 Bucket Setup](#step-3-s3-bucket-setup)
6. [Step 4: Configure Application](#step-4-configure-application)
7. [Step 5: Deploy to AWS (Options)](#step-5-deploy-to-aws-options)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## 🌟 AWS Services Overview

Your CloudVault app uses these AWS services:

- **AWS Cognito**: User authentication (✅ Already configured)
- **Amazon S3**: File storage (⚙️ To be configured)
- **AWS EC2/ECS/Lambda**: Backend deployment (optional)
- **AWS CloudFront**: CDN for faster file delivery (optional)

---

## 📝 Prerequisites

1. AWS Account (create at https://aws.amazon.com)
2. AWS CLI installed locally
3. Your current Cognito credentials:
   - Region: `ap-south-1` (Mumbai)
   - User Pool ID: `ap-south-1_jop34S6wZ`
   - App Client ID: `1bc810i7mqp7bvqcvr3dg94n2o`

---

## Step 1: AWS Account Setup

### 1.1 Create AWS Account (if you don't have one)
```bash
# Visit: https://aws.amazon.com
# Click "Create an AWS Account"
# Follow the registration process
```

### 1.2 Install AWS CLI
```bash
# Linux/macOS
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Or using package manager
# Fedora
sudo dnf install aws-cli

# Ubuntu/Debian
sudo apt install awscli

# Verify installation
aws --version
```

---

## Step 2: IAM User Creation

### 2.1 Create IAM User via Console

1. **Login to AWS Console**: https://console.aws.amazon.com
2. **Navigate to IAM**:
   - Search for "IAM" in the top search bar
   - Click "Identity and Access Management"

3. **Create User**:
   ```
   - Click "Users" in left sidebar
   - Click "Create user"
   - Username: cloudvault-backend
   - Select "Provide user access to the AWS Management Console" (optional)
   - Click "Next"
   ```

4. **Set Permissions**:
   ```
   Option 1 (Quick - For Development):
   - Select "Attach policies directly"
   - Search and select:
     ✅ AmazonS3FullAccess
     ✅ AmazonCognitoPowerUser
   
   Option 2 (Recommended - For Production):
   - Create custom policy with minimal permissions (see below)
   ```

5. **Create Access Keys**:
   ```
   - Click on the created user
   - Go to "Security credentials" tab
   - Scroll to "Access keys"
   - Click "Create access key"
   - Select "Application running on an AWS compute service"
   - Click "Next" and "Create access key"
   - ⚠️ IMPORTANT: Download and save the CSV file
   - You'll get:
     * Access Key ID
     * Secret Access Key
   ```

### 2.2 Custom IAM Policy (Production - Recommended)

Create a policy named `CloudVault-Backend-Policy`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3Operations",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": [
        "arn:aws:s3:::cloudvault-storage-*",
        "arn:aws:s3:::cloudvault-storage-*/*"
      ]
    },
    {
      "Sid": "CognitoOperations",
      "Effect": "Allow",
      "Action": [
        "cognito-idp:AdminGetUser",
        "cognito-idp:AdminInitiateAuth",
        "cognito-idp:AdminRespondToAuthChallenge",
        "cognito-idp:AdminSetUserPassword",
        "cognito-idp:AdminUpdateUserAttributes"
      ],
      "Resource": "arn:aws:cognito-idp:ap-south-1:*:userpool/ap-south-1_jop34S6wZ"
    }
  ]
}
```

### 2.3 Configure AWS CLI

```bash
# Configure AWS credentials
aws configure

# Enter the following when prompted:
# AWS Access Key ID: [Your Access Key]
# AWS Secret Access Key: [Your Secret Key]
# Default region name: ap-south-1
# Default output format: json

# Verify configuration
aws sts get-caller-identity
```

---

## Step 3: S3 Bucket Setup

### 3.1 Create S3 Bucket via AWS Console

1. **Navigate to S3**: https://s3.console.aws.amazon.com
2. **Create Bucket**:
   ```
   - Click "Create bucket"
   - Bucket name: cloudvault-storage-[your-unique-id]
     Example: cloudvault-storage-prod-2025
   - Region: ap-south-1 (Asia Pacific Mumbai)
   - Block Public Access: Keep enabled (recommended)
   - Bucket Versioning: Enable (optional, for file history)
   - Default encryption: Enable (AES-256)
   - Click "Create bucket"
   ```

### 3.2 Create S3 Bucket via CLI

```bash
# Create bucket
aws s3 mb s3://cloudvault-storage-prod-2025 --region ap-south-1

# Enable versioning (optional)
aws s3api put-bucket-versioning \
  --bucket cloudvault-storage-prod-2025 \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket cloudvault-storage-prod-2025 \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Set CORS configuration (for web uploads)
aws s3api put-bucket-cors \
  --bucket cloudvault-storage-prod-2025 \
  --cors-configuration file://cors.json
```

### 3.3 CORS Configuration (`cors.json`)

Create `server/cors.json`:

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["http://localhost:3001", "https://your-domain.com"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

### 3.4 Configure Lifecycle Rules (Optional - Cost Optimization)

```bash
# Delete old backups after 30 days
aws s3api put-bucket-lifecycle-configuration \
  --bucket cloudvault-storage-prod-2025 \
  --lifecycle-configuration file://lifecycle.json
```

`lifecycle.json`:
```json
{
  "Rules": [
    {
      "Id": "DeleteOldBackups",
      "Status": "Enabled",
      "Prefix": "backups/",
      "Expiration": {
        "Days": 30
      }
    }
  ]
}
```

---

## Step 4: Configure Application

### 4.1 Update Server Environment Variables

Edit `server/.env`:

```bash
# Flask Configuration
FLASK_ENV=production
PORT=5000

# AWS Cognito Configuration (Already set)
AWS_REGION=ap-south-1
COGNITO_USER_POOL_ID=ap-south-1_jop34S6wZ
COGNITO_APP_CLIENT_ID=1bc810i7mqp7bvqcvr3dg94n2o

# AWS Credentials
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# S3 Storage Configuration
STORAGE_TYPE=s3
S3_BUCKET=cloudvault-storage-prod-2025
S3_REGION=ap-south-1

# Storage Limits
STORAGE_LIMIT=1073741824  # 1GB per user

# Authentication
AUTH_ENABLED=true
```

### 4.2 Update Storage Factory

The app will automatically use S3 when `STORAGE_TYPE=s3`. Verify:

```python
# server/utils/storage_factory.py
from .config import STORAGE_TYPE

if STORAGE_TYPE == 's3':
    from .s3_storage import (
        save_file, list_files, read_file,
        create_backup_manifest, restore_from_manifest
    )
else:
    from .local_storage import (
        save_file, list_files, read_file,
        create_backup_manifest, restore_from_manifest
    )
```

### 4.3 Test S3 Connection

```bash
cd server

# Test with Python
python3 << EOF
import boto3
import os
from dotenv import load_dotenv

load_dotenv()

s3 = boto3.client('s3', region_name='ap-south-1')
bucket = os.getenv('S3_BUCKET')

# List buckets
print("Available buckets:")
response = s3.list_buckets()
for bucket_info in response['Buckets']:
    print(f"  - {bucket_info['Name']}")

# Test upload
print(f"\nTesting upload to {bucket}...")
s3.put_object(
    Bucket=bucket,
    Key='test/hello.txt',
    Body=b'Hello from CloudVault!'
)
print("✅ Upload successful!")

# Test download
print("\nTesting download...")
obj = s3.get_object(Bucket=bucket, Key='test/hello.txt')
content = obj['Body'].read()
print(f"✅ Downloaded: {content.decode()}")

# Cleanup
s3.delete_object(Bucket=bucket, Key='test/hello.txt')
print("✅ Test file deleted")
EOF
```

---

## Step 5: Deploy to AWS (Options)

### Option A: Deploy to AWS EC2 (Traditional)

#### 5.1 Launch EC2 Instance

```bash
# Create key pair
aws ec2 create-key-pair \
  --key-name cloudvault-key \
  --query 'KeyMaterial' \
  --output text > cloudvault-key.pem

chmod 400 cloudvault-key.pem

# Launch instance (Ubuntu 22.04)
aws ec2 run-instances \
  --image-id ami-0a7cf821b91bcccbc \
  --instance-type t2.micro \
  --key-name cloudvault-key \
  --security-groups cloudvault-sg \
  --region ap-south-1 \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=CloudVault-Backend}]'
```

#### 5.2 Configure Security Group

```bash
# Create security group
aws ec2 create-security-group \
  --group-name cloudvault-sg \
  --description "CloudVault backend security group" \
  --region ap-south-1

# Allow SSH
aws ec2 authorize-security-group-ingress \
  --group-name cloudvault-sg \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0

# Allow HTTP
aws ec2 authorize-security-group-ingress \
  --group-name cloudvault-sg \
  --protocol tcp \
  --port 5000 \
  --cidr 0.0.0.0/0
```

#### 5.3 Deploy to EC2

```bash
# Get instance public IP
INSTANCE_IP=$(aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=CloudVault-Backend" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)

# SSH into instance
ssh -i cloudvault-key.pem ubuntu@$INSTANCE_IP

# On EC2 instance:
sudo apt update
sudo apt install -y python3-pip python3-venv git

# Clone your repo
git clone https://github.com/Aniketgawande1/cloud-backup-cli.git
cd cloud-backup-cli/server

# Setup Python environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure environment
nano .env  # Add your AWS credentials

# Run with gunicorn (production server)
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 main:app
```

### Option B: Deploy to AWS ECS (Docker - Recommended)

See `server/ecs/README.md` for detailed ECS deployment instructions.

Quick start:
```bash
cd server/ecs
bash deploy.sh
```

### Option C: Deploy to AWS Lambda (Serverless)

Use AWS SAM or Zappa for serverless deployment.

---

## 🧪 Testing

### Test S3 Storage

```bash
# Start server with S3 enabled
cd server
STORAGE_TYPE=s3 python main.py

# In another terminal, test upload
curl -X POST http://localhost:5000/upload \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "filename": "test.txt",
    "content": "SGVsbG8gUzMh",
    "encoding": "base64"
  }'

# Test list
curl -X POST http://localhost:5000/list \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"user_path": "your_user_id"}'

# Verify in S3
aws s3 ls s3://cloudvault-storage-prod-2025/your_user_id/
```

---

## 🔧 Troubleshooting

### Issue: "Unable to locate credentials"
**Solution**:
```bash
# Check AWS configuration
aws configure list

# Verify credentials file
cat ~/.aws/credentials

# Set environment variables
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
```

### Issue: "Access Denied" when uploading to S3
**Solution**:
- Check IAM user has S3 permissions
- Verify bucket policy allows your IAM user
- Check bucket name is correct

### Issue: CORS errors in browser
**Solution**:
```bash
# Update CORS configuration
aws s3api put-bucket-cors \
  --bucket cloudvault-storage-prod-2025 \
  --cors-configuration file://cors.json
```

### Issue: "Bucket already exists"
**Solution**:
- S3 bucket names are globally unique
- Use a different bucket name
- Add timestamp: `cloudvault-storage-$(date +%s)`

---

## 💰 Cost Estimation

### AWS Free Tier (First 12 months):
- **S3**: 5GB storage, 20,000 GET requests, 2,000 PUT requests/month
- **EC2**: 750 hours/month of t2.micro instance
- **Cognito**: 50,000 MAUs (Monthly Active Users) free forever

### After Free Tier:
- **S3 Storage**: ~$0.023/GB/month (Mumbai region)
- **S3 Requests**: $0.005/1,000 PUT requests
- **EC2 t2.micro**: ~$0.0116/hour (~$8.50/month)
- **Data Transfer**: First 1GB free, then $0.12/GB

**Estimated monthly cost for 100 users**:
- Storage (100GB): $2.30
- Requests (100k): $0.50
- EC2 t2.micro: $8.50
- **Total**: ~$11.30/month

---

## 🎉 Next Steps

1. ✅ Configure AWS credentials
2. ✅ Create S3 bucket
3. ✅ Update `.env` file
4. ✅ Test S3 connection
5. ⬜ Deploy backend to EC2/ECS
6. ⬜ Configure custom domain
7. ⬜ Set up CloudFront CDN
8. ⬜ Configure monitoring with CloudWatch

---

## 📚 Additional Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [Boto3 Documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html)

---

## 🔒 Security Best Practices

1. **Never commit credentials**: Use `.env` files (already in `.gitignore`)
2. **Use IAM roles** on EC2/ECS instead of access keys
3. **Enable MFA** on AWS account
4. **Rotate access keys** regularly
5. **Enable S3 encryption** (already configured)
6. **Use bucket policies** to restrict access
7. **Enable CloudTrail** for audit logging
8. **Set up billing alerts** to avoid surprise costs

---

**Need help?** Check the troubleshooting section or create an issue on GitHub.
