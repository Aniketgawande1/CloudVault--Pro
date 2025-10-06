# CloudVault Pro - GCP Cloud Functions

This directory contains Google Cloud Functions for the CloudVault Pro backup system, replacing AWS Lambda functions with GCP services.

## 🏗️ Architecture

```
cloudvault-gcp/
├── functions/
│   ├── upload/           # File upload handler
│   │   └── main.py
│   ├── backup/           # Backup creation and listing
│   │   └── main.py
│   ├── restore/          # File restore and download
│   │   └── main.py
│   └── utils/            # Shared utilities
│       ├── gcs.py        # Google Cloud Storage operations
│       ├── auth.py       # Authentication utilities
│       └── logger.py     # Cloud Logging integration
├── requirements.txt      # Python dependencies
├── deploy.sh            # Deployment automation script
└── README.md            # This file
```

## 🔧 Technology Stack

- **Google Cloud Storage (GCS)** - Replaces AWS S3 for object storage
- **Cloud Functions (Gen 2)** - Replaces AWS Lambda for serverless compute
- **Cloud Logging** - Replaces AWS CloudWatch for centralized logging
- **Firebase Authentication / OAuth 2.0** - User authentication and authorization
- **Cloud Scheduler** - Automated backup scheduling

## 📋 API Functions

### 1. Upload Handler
**Function**: `upload_handler`  
**Endpoint**: `/upload`  
**Method**: POST  
**Authentication**: Required (Bearer token)

Upload files to Google Cloud Storage with user-specific paths.

**Request Example**:
```bash
curl -X POST https://REGION-PROJECT_ID.cloudfunctions.net/upload_handler \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "document.pdf",
    "content": "base64_encoded_content",
    "encoding": "base64"
  }'
```

**Response**:
```json
{
  "status": "success",
  "message": "document.pdf uploaded successfully",
  "file": {
    "filename": "document.pdf",
    "path": "user-data/user123/document.pdf",
    "size": 1024,
    "url": "https://storage.googleapis.com/...",
    "uploaded_at": "2025-10-04T10:30:00Z"
  }
}
```

### 2. Backup Handler
**Function**: `backup_handler`  
**Endpoint**: `/backup`  
**Method**: POST  
**Authentication**: Optional

Create timestamped backups of files.

**Request Example**:
```bash
curl -X POST https://REGION-PROJECT_ID.cloudfunctions.net/backup_handler \
  -H "Content-Type: application/json" \
  -d '{"source_file": "user-data/important.docx"}'
```

**Response**:
```json
{
  "status": "success",
  "message": "Backed up user-data/important.docx to backups/important_20251004_103000.docx",
  "backup": {
    "source": "user-data/important.docx",
    "destination": "backups/important_20251004_103000.docx",
    "timestamp": "20251004_103000",
    "version": "20251004_103000"
  }
}
```

### 3. List Backups
**Function**: `list_backups`  
**Endpoint**: `/list-backups`  
**Method**: GET  
**Authentication**: Optional

List all available backups.

**Request Example**:
```bash
curl https://REGION-PROJECT_ID.cloudfunctions.net/list_backups
```

**Response**:
```json
{
  "status": "success",
  "count": 5,
  "backups": [
    {
      "path": "backups/important_20251004_103000.docx",
      "filename": "important_20251004_103000.docx",
      "version": "20251004_103000"
    }
  ]
}
```

### 4. Restore Handler
**Function**: `restore_handler`  
**Endpoint**: `/restore`  
**Method**: POST  
**Authentication**: Required (Bearer token)

Restore files from backup versions.

**Request Example**:
```bash
curl -X POST https://REGION-PROJECT_ID.cloudfunctions.net/restore_handler \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "version": "20251004_103000",
    "backup_path": "backups/important_20251004_103000.docx"
  }'
```

**Response**:
```json
{
  "status": "success",
  "message": "Restored backup version 20251004_103000",
  "restored_file": {
    "path": "user-data/user123/important.docx",
    "size": 2048,
    "restored_at": "2025-10-04T11:00:00Z",
    "backup_source": "backups/important_20251004_103000.docx"
  }
}
```

### 5. Download Backup
**Function**: `download_backup`  
**Endpoint**: `/download-backup`  
**Method**: GET  
**Authentication**: Required (Bearer token)

Download backup file content.

**Request Example**:
```bash
curl "https://REGION-PROJECT_ID.cloudfunctions.net/download_backup?backup_path=backups/file.docx" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🚀 Setup and Deployment

### Prerequisites

1. **Google Cloud Account** with billing enabled
2. **gcloud CLI** installed and configured
   ```bash
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   gcloud init
   ```
3. **Python 3.9+** for local development
4. **Project ID** - Create a new GCP project or use existing

### Environment Variables

Set these before deployment:

```bash
export GCP_PROJECT_ID="your-project-id"
export GCP_REGION="us-central1"
export GCS_BUCKET_NAME="cloudvault-pro-backup"
export GOOGLE_CLIENT_ID="your-oauth-client-id"  # For OAuth authentication
```

### Quick Deployment

1. **Make the deploy script executable**:
   ```bash
   chmod +x deploy.sh
   ```

2. **Run the deployment script**:
   ```bash
   ./deploy.sh
   ```

The script will:
- Create GCS bucket
- Enable required GCP APIs
- Deploy all Cloud Functions
- Output function URLs
- Optionally set up Cloud Scheduler for automated backups

### Manual Deployment

If you prefer manual deployment:

1. **Create GCS Bucket**:
   ```bash
   gsutil mb -l us-central1 gs://cloudvault-pro-backup
   ```

2. **Deploy each function**:
   ```bash
   # Upload function
   gcloud functions deploy upload_handler \
     --gen2 \
     --runtime python311 \
     --region us-central1 \
     --source ./functions/upload \
     --entry-point upload_handler \
     --trigger-http \
     --allow-unauthenticated \
     --set-env-vars GCS_BUCKET_NAME=cloudvault-pro-backup
   
   # Backup function
   gcloud functions deploy backup_handler \
     --gen2 \
     --runtime python311 \
     --region us-central1 \
     --source ./functions/backup \
     --entry-point backup_handler \
     --trigger-http \
     --allow-unauthenticated \
     --set-env-vars GCS_BUCKET_NAME=cloudvault-pro-backup
   
   # Restore function
   gcloud functions deploy restore_handler \
     --gen2 \
     --runtime python311 \
     --region us-central1 \
     --source ./functions/restore \
     --entry-point restore_handler \
     --trigger-http \
     --allow-unauthenticated \
     --set-env-vars GCS_BUCKET_NAME=cloudvault-pro-backup
   ```

## 🧪 Local Development

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up Application Default Credentials**:
   ```bash
   gcloud auth application-default login
   ```

3. **Run a function locally**:
   ```bash
   cd functions/upload
   functions-framework --target=upload_handler --debug --port=8080
   ```

4. **Test locally**:
   ```bash
   curl -X POST http://localhost:8080 \
     -H "Content-Type: application/json" \
     -d '{"filename": "test.txt", "content": "SGVsbG8gV29ybGQh", "encoding": "base64"}'
   ```

## 🔒 Security

### Authentication
- Uses Firebase Authentication or Google OAuth 2.0
- Bearer token required in Authorization header
- User-specific file paths prevent unauthorized access

### Best Practices
1. **Enable IAM restrictions** on production functions
2. **Use Secret Manager** for sensitive credentials
3. **Set up VPC connectors** for private resource access
4. **Enable Cloud Armor** for DDoS protection
5. **Implement rate limiting** to prevent abuse

### Example: Restrict Function Access
```bash
gcloud functions remove-iam-policy-binding upload_handler \
  --member="allUsers" \
  --role="roles/cloudfunctions.invoker"

gcloud functions add-iam-policy-binding upload_handler \
  --member="serviceAccount:your-service-account@project.iam.gserviceaccount.com" \
  --role="roles/cloudfunctions.invoker"
```

## 📊 Monitoring and Logging

### View Logs
```bash
# All function logs
gcloud logging read "resource.type=cloud_function" --limit 50

# Specific function logs
gcloud logging read "resource.type=cloud_function AND resource.labels.function_name=upload_handler" --limit 20

# Error logs only
gcloud logging read "severity>=ERROR" --limit 50
```

### Metrics Dashboard
```bash
# Open Cloud Console metrics
gcloud monitoring dashboards list
```

### Set Up Alerts
```bash
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="CloudVault Function Errors" \
  --condition-display-name="High error rate" \
  --condition-threshold-value=10 \
  --condition-threshold-duration=300s
```

## 💰 Cost Optimization

1. **Set memory limits** appropriately (128MB-512MB)
2. **Configure max instances** to prevent runaway costs
3. **Use lifecycle policies** on GCS bucket:
   ```bash
   gsutil lifecycle set lifecycle.json gs://cloudvault-pro-backup
   ```
4. **Monitor usage** regularly via Cloud Console
5. **Use Cloud Scheduler** efficiently to reduce invocations

## 🔄 Migration from AWS

| AWS Service | GCP Equivalent |
|------------|----------------|
| S3 | Cloud Storage (GCS) |
| Lambda | Cloud Functions |
| CloudWatch | Cloud Logging |
| API Gateway | Cloud Functions HTTP triggers |
| Cognito | Firebase Auth / Identity Platform |
| EventBridge | Cloud Scheduler |
| IAM | IAM + Service Accounts |

### Code Changes
- `boto3.client('s3')` → `storage.Client()`
- `lambda_handler(event, context)` → `@functions_framework.http`
- Environment variables work the same way
- Replace AWS SDK calls with GCP client library calls

## 🐛 Troubleshooting

### Common Issues

**Issue**: "Permission denied" errors
```bash
# Solution: Grant necessary permissions
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:PROJECT_ID@appspot.gserviceaccount.com" \
  --role="roles/storage.admin"
```

**Issue**: Function timeout
```bash
# Solution: Increase timeout
gcloud functions deploy FUNCTION_NAME --timeout=300s
```

**Issue**: Module import errors
```bash
# Solution: Ensure utils folder is in the same deployment package
# Check requirements.txt has all dependencies
```

## 📚 Additional Resources

- [Cloud Functions Documentation](https://cloud.google.com/functions/docs)
- [Cloud Storage Documentation](https://cloud.google.com/storage/docs)
- [Cloud Logging Documentation](https://cloud.google.com/logging/docs)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

## 📧 Support

For issues or questions:
- Check Cloud Logging for error details
- Review function configuration in Cloud Console
- Consult GCP documentation linked above

---

**CloudVault Pro** - Secure cloud backup powered by Google Cloud Platform 🔐☁️
