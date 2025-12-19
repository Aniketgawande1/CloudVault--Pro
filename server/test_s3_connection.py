#!/usr/bin/env python3
"""
Test S3 Connection Script for CloudVault
This script verifies that your S3 configuration is working correctly.
"""

import os
import sys
from datetime import datetime
from dotenv import load_dotenv
import boto3
from botocore.exceptions import ClientError, NoCredentialsError

# Load environment variables
load_dotenv()

def print_header(text):
    """Print formatted header"""
    print("\n" + "=" * 60)
    print(f"  {text}")
    print("=" * 60 + "\n")

def print_success(text):
    """Print success message"""
    print(f"✅ {text}")

def print_error(text):
    """Print error message"""
    print(f"❌ {text}")

def print_info(text):
    """Print info message"""
    print(f"ℹ️  {text}")

def check_environment_variables():
    """Check if all required environment variables are set"""
    print_header("Checking Environment Variables")
    
    required_vars = {
        'AWS_ACCESS_KEY_ID': os.getenv('AWS_ACCESS_KEY_ID'),
        'AWS_SECRET_ACCESS_KEY': os.getenv('AWS_SECRET_ACCESS_KEY'),
        'S3_BUCKET': os.getenv('S3_BUCKET'),
        'AWS_REGION': os.getenv('AWS_REGION'),
        'STORAGE_TYPE': os.getenv('STORAGE_TYPE')
    }
    
    all_set = True
    for var_name, var_value in required_vars.items():
        if var_value:
            if 'SECRET' in var_name or 'KEY' in var_name:
                masked_value = var_value[:4] + '*' * (len(var_value) - 8) + var_value[-4:] if len(var_value) > 8 else '****'
                print_success(f"{var_name}: {masked_value}")
            else:
                print_success(f"{var_name}: {var_value}")
        else:
            print_error(f"{var_name}: Not set")
            all_set = False
    
    if not all_set:
        print_error("\nMissing required environment variables!")
        print_info("Please update your server/.env file with the required values.")
        return False
    
    if os.getenv('STORAGE_TYPE') != 's3':
        print_error("\nSTORAGE_TYPE is not set to 's3'")
        print_info("Set STORAGE_TYPE=s3 in your .env file to use S3 storage")
        return False
    
    return True

def test_aws_credentials():
    """Test AWS credentials"""
    print_header("Testing AWS Credentials")
    
    try:
        sts_client = boto3.client('sts',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION')
        )
        
        identity = sts_client.get_caller_identity()
        
        print_success("AWS credentials are valid!")
        print_info(f"Account ID: {identity['Account']}")
        print_info(f"User ARN: {identity['Arn']}")
        print_info(f"User ID: {identity['UserId']}")
        
        return True
        
    except NoCredentialsError:
        print_error("No AWS credentials found")
        return False
    except ClientError as e:
        print_error(f"Invalid AWS credentials: {e}")
        return False
    except Exception as e:
        print_error(f"Error testing credentials: {e}")
        return False

def test_bucket_access():
    """Test S3 bucket access"""
    print_header("Testing S3 Bucket Access")
    
    bucket_name = os.getenv('S3_BUCKET')
    
    try:
        s3_client = boto3.client('s3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION')
        )
        
        # Check if bucket exists
        print_info(f"Checking bucket: {bucket_name}")
        s3_client.head_bucket(Bucket=bucket_name)
        print_success(f"Bucket '{bucket_name}' exists and is accessible")
        
        # Get bucket location
        location = s3_client.get_bucket_location(Bucket=bucket_name)
        region = location['LocationConstraint'] or 'us-east-1'
        print_info(f"Bucket region: {region}")
        
        # Check bucket versioning
        versioning = s3_client.get_bucket_versioning(Bucket=bucket_name)
        if versioning.get('Status') == 'Enabled':
            print_success("Bucket versioning: Enabled")
        else:
            print_info("Bucket versioning: Disabled")
        
        # Check bucket encryption
        try:
            encryption = s3_client.get_bucket_encryption(Bucket=bucket_name)
            print_success("Bucket encryption: Enabled")
        except ClientError:
            print_info("Bucket encryption: Not configured")
        
        return True
        
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == '404':
            print_error(f"Bucket '{bucket_name}' does not exist")
        elif error_code == '403':
            print_error(f"Access denied to bucket '{bucket_name}'")
        else:
            print_error(f"Error accessing bucket: {e}")
        return False
    except Exception as e:
        print_error(f"Error testing bucket: {e}")
        return False

def test_upload_download():
    """Test file upload and download"""
    print_header("Testing File Upload/Download")
    
    bucket_name = os.getenv('S3_BUCKET')
    test_file_key = f"test/{datetime.now().strftime('%Y%m%d_%H%M%S')}_test.txt"
    test_content = f"CloudVault S3 Test - {datetime.now().isoformat()}"
    
    try:
        s3_client = boto3.client('s3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION')
        )
        
        # Upload test file
        print_info(f"Uploading test file: {test_file_key}")
        s3_client.put_object(
            Bucket=bucket_name,
            Key=test_file_key,
            Body=test_content.encode('utf-8'),
            ContentType='text/plain',
            ServerSideEncryption='AES256'
        )
        print_success("Upload successful")
        
        # Download test file
        print_info("Downloading test file")
        response = s3_client.get_object(
            Bucket=bucket_name,
            Key=test_file_key
        )
        downloaded_content = response['Body'].read().decode('utf-8')
        
        if downloaded_content == test_content:
            print_success("Download successful - content matches")
        else:
            print_error("Download failed - content mismatch")
            return False
        
        # Get file URL
        file_url = f"https://{bucket_name}.s3.{os.getenv('AWS_REGION')}.amazonaws.com/{test_file_key}"
        print_info(f"File URL: {file_url}")
        
        # Clean up test file
        print_info("Cleaning up test file")
        s3_client.delete_object(Bucket=bucket_name, Key=test_file_key)
        print_success("Test file deleted")
        
        return True
        
    except ClientError as e:
        print_error(f"S3 operation failed: {e}")
        return False
    except Exception as e:
        print_error(f"Error during test: {e}")
        return False

def test_list_files():
    """Test listing files"""
    print_header("Testing File Listing")
    
    bucket_name = os.getenv('S3_BUCKET')
    
    try:
        s3_client = boto3.client('s3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION')
        )
        
        print_info("Listing bucket contents...")
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            MaxKeys=10
        )
        
        if 'Contents' in response:
            file_count = response.get('KeyCount', 0)
            print_success(f"Found {file_count} files in bucket")
            
            if file_count > 0:
                print_info("\nRecent files:")
                for obj in response['Contents'][:5]:
                    size_mb = obj['Size'] / (1024 * 1024)
                    print(f"  • {obj['Key']} ({size_mb:.2f} MB)")
        else:
            print_info("Bucket is empty")
        
        return True
        
    except ClientError as e:
        print_error(f"List operation failed: {e}")
        return False
    except Exception as e:
        print_error(f"Error listing files: {e}")
        return False

def test_storage_module():
    """Test the storage module"""
    print_header("Testing CloudVault Storage Module")
    
    try:
        # Import storage factory
        from utils.storage_factory import get_storage
        
        print_info("Initializing storage module...")
        storage = get_storage()
        
        print_success(f"Storage type: {type(storage).__name__}")
        
        # Test save_file
        print_info("Testing save_file method...")
        test_content = b"CloudVault Module Test"
        test_path = f"test_user/module_test_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        
        result = storage.save_file(test_path, test_content)
        print_success(f"File saved: {result['key']}")
        
        # Test list_files
        print_info("Testing list_files method...")
        files = storage.list_files("test_user/")
        print_success(f"Found {len(files)} files")
        
        # Test read_file
        print_info("Testing read_file method...")
        content = storage.read_file(test_path)
        if content == test_content:
            print_success("Content matches")
        else:
            print_error("Content mismatch")
        
        # Cleanup
        print_info("Cleaning up test file...")
        s3_client = boto3.client('s3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION')
        )
        s3_client.delete_object(Bucket=os.getenv('S3_BUCKET'), Key=test_path)
        print_success("Test file cleaned up")
        
        return True
        
    except ImportError as e:
        print_error(f"Import error: {e}")
        print_info("Make sure you're running from the server directory")
        return False
    except Exception as e:
        print_error(f"Module test failed: {e}")
        return False

def main():
    """Main test function"""
    print("\n" + "=" * 60)
    print("  🧪 CloudVault S3 Connection Test")
    print("=" * 60)
    
    tests = [
        ("Environment Variables", check_environment_variables),
        ("AWS Credentials", test_aws_credentials),
        ("S3 Bucket Access", test_bucket_access),
        ("Upload/Download", test_upload_download),
        ("File Listing", test_list_files),
        ("Storage Module", test_storage_module),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
            
            if not result:
                print_error(f"\n❌ {test_name} test failed!")
                print_info("Stopping tests due to failure\n")
                break
                
        except KeyboardInterrupt:
            print("\n\nTest interrupted by user")
            sys.exit(1)
        except Exception as e:
            print_error(f"Unexpected error in {test_name}: {e}")
            results.append((test_name, False))
            break
    
    # Summary
    print_header("Test Summary")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status} - {test_name}")
    
    print(f"\n{'=' * 60}")
    print(f"  Results: {passed}/{total} tests passed")
    print("=" * 60 + "\n")
    
    if passed == total:
        print_success("🎉 All tests passed! Your S3 configuration is working correctly.")
        print_info("\nYou can now:")
        print("  1. Start your Flask server: python main.py")
        print("  2. Upload files through the web interface")
        print("  3. Monitor S3 usage in AWS Console")
        return 0
    else:
        print_error("⚠️  Some tests failed. Please fix the issues and try again.")
        print_info("\nTroubleshooting:")
        print("  1. Check your .env file configuration")
        print("  2. Verify AWS credentials are valid")
        print("  3. Ensure S3 bucket exists and has correct permissions")
        print("  4. Review the AWS_SETUP_GUIDE.md for detailed instructions")
        return 1

if __name__ == "__main__":
    sys.exit(main())
