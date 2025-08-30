import boto3
s3 = boto3.client('s3')

def upload_file(bucket, key, file_bytes):
    s3.put_object(Bucket=bucket, Key=key, Body=file_bytes)
def list_flies(bucket,file_bytes):
    objects = s3.list_objects_v2(Bucket=bucket, Prefix=prefix)
    return [obj['key']for obj in objects.get('Contents',[])]
def copy_file(source_bucket, source_key, dest_bucket,dest_key):
    s3.copy_object(Bucket=dest_bucket,
                   copySource={'bucket':source_bucket,'Key':source_key},
                   key=dest_key)