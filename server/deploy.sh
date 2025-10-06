#!/bin/bash

# CloudVault Pro - GCP Cloud Functions Deployment Script
# This script deploys all Cloud Functions to Google Cloud Platform

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID=${GCP_PROJECT_ID:-"cloudvault-pro"}
REGION=${GCP_REGION:-"us-central1"}
BUCKET_NAME=${GCS_BUCKET_NAME:-"cloudvault-pro-backup"}
RUNTIME="python311"

echo -e "${BLUE}🚀 CloudVault Pro - Deploying to GCP${NC}"
echo "=================================="
echo -e "${YELLOW}Project ID:${NC} $PROJECT_ID"
echo -e "${YELLOW}Region:${NC} $REGION"
echo -e "${YELLOW}Bucket:${NC} $BUCKET_NAME"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Error: gcloud CLI is not installed${NC}"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set the project
echo -e "${BLUE}📋 Setting GCP project...${NC}"
gcloud config set project $PROJECT_ID

# Create GCS bucket if it doesn't exist
echo -e "${BLUE}🪣 Creating GCS bucket...${NC}"
gsutil mb -l $REGION gs://$BUCKET_NAME 2>/dev/null && echo -e "${GREEN}✓ Bucket created${NC}" || echo -e "${YELLOW}Bucket already exists${NC}"

# Enable required APIs
echo -e "${BLUE}🔌 Enabling required APIs...${NC}"
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable cloudscheduler.googleapis.com
gcloud services enable logging.googleapis.com
echo -e "${GREEN}✓ APIs enabled${NC}"

# Deploy Upload Function
echo ""
echo -e "${BLUE}📤 Deploying Upload Function...${NC}"
gcloud functions deploy upload_handler \
  --gen2 \
  --runtime=$RUNTIME \
  --region=$REGION \
  --source=./functions/upload \
  --entry-point=upload_handler \
  --trigger-http \
  --allow-unauthenticated \
  --set-env-vars GCS_BUCKET_NAME=$BUCKET_NAME,ENVIRONMENT=production \
  --max-instances=10 \
  --memory=256MB \
  --timeout=60s
echo -e "${GREEN}✓ Upload function deployed${NC}"

# Deploy Backup Function
echo ""
echo -e "${BLUE}💾 Deploying Backup Function...${NC}"
gcloud functions deploy backup_handler \
  --gen2 \
  --runtime=$RUNTIME \
  --region=$REGION \
  --source=./functions/backup \
  --entry-point=backup_handler \
  --trigger-http \
  --allow-unauthenticated \
  --set-env-vars GCS_BUCKET_NAME=$BUCKET_NAME,ENVIRONMENT=production \
  --max-instances=5 \
  --memory=256MB \
  --timeout=120s
echo -e "${GREEN}✓ Backup function deployed${NC}"

# Deploy Restore Function
echo ""
echo -e "${BLUE}♻️  Deploying Restore Function...${NC}"
gcloud functions deploy restore_handler \
  --gen2 \
  --runtime=$RUNTIME \
  --region=$REGION \
  --source=./functions/restore \
  --entry-point=restore_handler \
  --trigger-http \
  --allow-unauthenticated \
  --set-env-vars GCS_BUCKET_NAME=$BUCKET_NAME,ENVIRONMENT=production \
  --max-instances=10 \
  --memory=256MB \
  --timeout=60s
echo -e "${GREEN}✓ Restore function deployed${NC}"

# Deploy List Backups Function
echo ""
echo -e "${BLUE}📋 Deploying List Backups Function...${NC}"
gcloud functions deploy list_backups \
  --gen2 \
  --runtime=$RUNTIME \
  --region=$REGION \
  --source=./functions/backup \
  --entry-point=list_backups \
  --trigger-http \
  --allow-unauthenticated \
  --set-env-vars GCS_BUCKET_NAME=$BUCKET_NAME,ENVIRONMENT=production \
  --max-instances=5 \
  --memory=128MB \
  --timeout=30s
echo -e "${GREEN}✓ List backups function deployed${NC}"

# Deploy Download Backup Function
echo ""
echo -e "${BLUE}⬇️  Deploying Download Backup Function...${NC}"
gcloud functions deploy download_backup \
  --gen2 \
  --runtime=$RUNTIME \
  --region=$REGION \
  --source=./functions/restore \
  --entry-point=download_backup \
  --trigger-http \
  --allow-unauthenticated \
  --set-env-vars GCS_BUCKET_NAME=$BUCKET_NAME,ENVIRONMENT=production \
  --max-instances=10 \
  --memory=512MB \
  --timeout=120s
echo -e "${GREEN}✓ Download backup function deployed${NC}"

# Get function URLs
echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "=================================="
echo ""
echo -e "${BLUE}📍 Function URLs:${NC}"
echo ""

UPLOAD_URL=$(gcloud functions describe upload_handler --region=$REGION --gen2 --format='value(serviceConfig.uri)' 2>/dev/null)
BACKUP_URL=$(gcloud functions describe backup_handler --region=$REGION --gen2 --format='value(serviceConfig.uri)' 2>/dev/null)
RESTORE_URL=$(gcloud functions describe restore_handler --region=$REGION --gen2 --format='value(serviceConfig.uri)' 2>/dev/null)
LIST_URL=$(gcloud functions describe list_backups --region=$REGION --gen2 --format='value(serviceConfig.uri)' 2>/dev/null)
DOWNLOAD_URL=$(gcloud functions describe download_backup --region=$REGION --gen2 --format='value(serviceConfig.uri)' 2>/dev/null)

echo -e "${YELLOW}Upload:${NC}         $UPLOAD_URL"
echo -e "${YELLOW}Backup:${NC}         $BACKUP_URL"
echo -e "${YELLOW}Restore:${NC}        $RESTORE_URL"
echo -e "${YELLOW}List Backups:${NC}   $LIST_URL"
echo -e "${YELLOW}Download:${NC}       $DOWNLOAD_URL"
echo ""

# Save URLs to a file
cat > function_urls.txt << EOF
CloudVault Pro - Function URLs
================================
Upload:         $UPLOAD_URL
Backup:         $BACKUP_URL
Restore:        $RESTORE_URL
List Backups:   $LIST_URL
Download:       $DOWNLOAD_URL

Generated on: $(date)
EOF

echo -e "${GREEN}✓ URLs saved to function_urls.txt${NC}"
echo ""

# Optional: Create Cloud Scheduler job for automated backups
read -p "$(echo -e ${YELLOW}Do you want to create a daily backup schedule? \(y/n\)${NC} )" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo ""
    echo -e "${BLUE}⏰ Creating Cloud Scheduler job...${NC}"
    
    gcloud scheduler jobs create http daily-backup \
      --location=$REGION \
      --schedule="0 2 * * *" \
      --uri="$BACKUP_URL" \
      --http-method=POST \
      --headers="Content-Type=application/json" \
      --message-body='{"source_file":"user-data/important.docx"}' \
      --time-zone="America/New_York" \
      2>/dev/null && echo -e "${GREEN}✓ Daily backup scheduled at 2:00 AM${NC}" || echo -e "${YELLOW}Scheduler job already exists${NC}"
fi

echo ""
echo -e "${GREEN}🎉 All done! Your CloudVault Pro backend is deployed on GCP!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Update your client app with the function URLs above"
echo "2. Configure Firebase Authentication"
echo "3. Set up monitoring in Cloud Console"
echo "4. Review Cloud Logging for function logs"
echo ""
echo -e "${YELLOW}View logs:${NC}"
echo "  gcloud logging read 'resource.type=cloud_function' --limit 50"
echo ""
echo -e "${YELLOW}Test a function:${NC}"
echo "  curl -X POST $BACKUP_URL -H 'Content-Type: application/json' -d '{\"source_file\":\"user-data/test.txt\"}'"
