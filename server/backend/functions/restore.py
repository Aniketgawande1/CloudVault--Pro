"""
Cloud restore functionality
Handles file and backup restoration operations
"""

import os
import json
import zipfile
import tempfile
from datetime import datetime
from flask import Flask, request, jsonify, send_file, Response
from utils.gcs import download_file_from_gcs, restore_backup, get_backup_contents
from utils.auth import authenticate_request
from utils.logger import get_logger

app = Flask(__name__)
logger = get_logger(__name__)

class RestoreManager:
    def __init__(self):
        self.active_restores = {}
        self.restore_queue = []
    
    def create_restore_job(self, user_id, restore_config):
        """Create a new restore job"""
        restore_id = f"restore_{user_id}_{int(datetime.now().timestamp())}"
        
        job_config = {
            'restore_id': restore_id,
            'user_id': user_id,
            'created_at': datetime.now().isoformat(),
            'status': 'pending',
            'config': restore_config
        }
        
        self.restore_queue.append(job_config)
        logger.info(f"Restore job created: {restore_id}")
        return restore_id
    
    def process_restore_queue(self):
        """Process pending restore jobs"""
        while self.restore_queue:
            job = self.restore_queue.pop(0)
            try:
                self.execute_restore(job)
            except Exception as e:
                logger.error(f"Restore job failed: {job['restore_id']} - {str(e)}")
                job['status'] = 'failed'
                job['error'] = str(e)
    
    def execute_restore(self, job):
        """Execute a restore operation"""
        restore_id = job['restore_id']
        user_id = job['user_id']
        config = job['config']
        
        logger.info(f"Starting restore: {restore_id}")
        job['status'] = 'running'
        job['started_at'] = datetime.now().isoformat()
        
        try:
            restore_type = config.get('type')  # 'file' or 'backup'
            
            if restore_type == 'file':
                result = self.restore_single_file(user_id, config)
            elif restore_type == 'backup':
                result = self.restore_backup_archive(user_id, config)
            else:
                raise ValueError(f"Invalid restore type: {restore_type}")
            
            job['status'] = 'completed'
            job['completed_at'] = datetime.now().isoformat()
            job['restore_info'] = result
            
            logger.info(f"Restore completed successfully: {restore_id}")
            
        except Exception as e:
            job['status'] = 'failed'
            job['error'] = str(e)
            job['failed_at'] = datetime.now().isoformat()
            raise e
    
    def restore_single_file(self, user_id, config):
        """Restore a single file"""
        file_path = config.get('file_path')
        destination = config.get('destination', 'restored/')
        
        if not file_path:
            raise ValueError("file_path is required for file restore")
        
        # Download file from GCS
        file_data = download_file_from_gcs(user_id, file_path)
        
        # In production, this would save to the specified destination
        # For now, we'll return file info
        return {
            'type': 'file',
            'original_path': file_path,
            'destination': destination,
            'size': len(file_data) if file_data else 0,
            'restored_at': datetime.now().isoformat()
        }
    
    def restore_backup_archive(self, user_id, config):
        """Restore from backup archive"""
        backup_id = config.get('backup_id')
        destination = config.get('destination', 'restored/')
        selected_files = config.get('files')  # Optional: specific files to restore
        
        if not backup_id:
            raise ValueError("backup_id is required for backup restore")
        
        # Get backup contents and restore
        backup_contents = get_backup_contents(backup_id, user_id)
        restored_files = []
        
        for file_info in backup_contents:
            if selected_files and file_info['name'] not in selected_files:
                continue
            
            # Restore each file
            file_data = download_file_from_gcs(user_id, file_info['path'])
            restored_files.append({
                'name': file_info['name'],
                'path': file_info['path'],
                'size': file_info['size'],
                'restored_to': f"{destination}/{file_info['name']}"
            })
        
        return {
            'type': 'backup',
            'backup_id': backup_id,
            'destination': destination,
            'files_restored': len(restored_files),
            'files': restored_files,
            'restored_at': datetime.now().isoformat()
        }

# Global restore manager instance
restore_manager = RestoreManager()

@app.route('/restore/file', methods=['POST'])
def restore_file():
    """Restore a single file"""
    try:
        user_id = authenticate_request(request)
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body required'}), 400
        
        file_path = data.get('file_path')
        if not file_path:
            return jsonify({'error': 'file_path is required'}), 400
        
        # Create restore job
        restore_config = {
            'type': 'file',
            'file_path': file_path,
            'destination': data.get('destination', 'restored/')
        }
        
        restore_id = restore_manager.create_restore_job(user_id, restore_config)
        
        # Process restore queue
        restore_manager.process_restore_queue()
        
        return jsonify({
            'success': True,
            'message': 'File restore initiated',
            'restore_id': restore_id
        }), 200
        
    except Exception as e:
        logger.error(f"Restore file error: {str(e)}")
        return jsonify({'error': 'Failed to restore file'}), 500

@app.route('/restore/backup', methods=['POST'])
def restore_backup():
    """Restore from backup"""
    try:
        user_id = authenticate_request(request)
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body required'}), 400
        
        backup_id = data.get('backup_id')
        if not backup_id:
            return jsonify({'error': 'backup_id is required'}), 400
        
        # Create restore job
        restore_config = {
            'type': 'backup',
            'backup_id': backup_id,
            'destination': data.get('destination', 'restored/'),
            'files': data.get('files')  # Optional: specific files to restore
        }
        
        restore_id = restore_manager.create_restore_job(user_id, restore_config)
        
        # Process restore queue
        restore_manager.process_restore_queue()
        
        return jsonify({
            'success': True,
            'message': 'Backup restore initiated',
            'restore_id': restore_id
        }), 200
        
    except Exception as e:
        logger.error(f"Restore backup error: {str(e)}")
        return jsonify({'error': 'Failed to restore backup'}), 500

@app.route('/restore/download/<file_path:path>', methods=['GET'])
def download_file(file_path):
    """Download a specific file"""
    try:
        user_id = authenticate_request(request)
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Download file from GCS
        file_data = download_file_from_gcs(user_id, file_path)
        
        if not file_data:
            return jsonify({'error': 'File not found'}), 404
        
        # Create a temporary file to serve
        temp_file = tempfile.NamedTemporaryFile(delete=False)
        temp_file.write(file_data)
        temp_file.close()
        
        # Get filename for download
        filename = os.path.basename(file_path)
        
        return send_file(
            temp_file.name,
            as_attachment=True,
            download_name=filename,
            mimetype='application/octet-stream'
        )
        
    except Exception as e:
        logger.error(f"Download file error: {str(e)}")
        return jsonify({'error': 'Failed to download file'}), 500

@app.route('/restore/download/backup/<backup_id>', methods=['GET'])
def download_backup_archive(backup_id):
    """Download entire backup as ZIP archive"""
    try:
        user_id = authenticate_request(request)
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Get backup contents
        backup_contents = get_backup_contents(backup_id, user_id)
        
        if not backup_contents:
            return jsonify({'error': 'Backup not found'}), 404
        
        # Create ZIP archive in memory
        temp_zip = tempfile.NamedTemporaryFile(delete=False, suffix='.zip')
        
        with zipfile.ZipFile(temp_zip.name, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for file_info in backup_contents:
                try:
                    file_data = download_file_from_gcs(user_id, file_info['path'])
                    if file_data:
                        zipf.writestr(file_info['name'], file_data)
                except Exception as e:
                    logger.warning(f"Failed to add {file_info['name']} to ZIP: {str(e)}")
                    continue
        
        return send_file(
            temp_zip.name,
            as_attachment=True,
            download_name=f'backup_{backup_id}.zip',
            mimetype='application/zip'
        )
        
    except Exception as e:
        logger.error(f"Download backup archive error: {str(e)}")
        return jsonify({'error': 'Failed to download backup'}), 500

@app.route('/restore/status/<restore_id>', methods=['GET'])
def get_restore_status(restore_id):
    """Get restore operation status"""
    try:
        user_id = authenticate_request(request)
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Find restore job
        restore_job = None
        for job in restore_manager.active_restores.get(user_id, []):
            if job['restore_id'] == restore_id:
                restore_job = job
                break
        
        if not restore_job:
            return jsonify({'error': 'Restore job not found'}), 404
        
        return jsonify({
            'restore_id': restore_id,
            'status': restore_job['status'],
            'created_at': restore_job['created_at'],
            'started_at': restore_job.get('started_at'),
            'completed_at': restore_job.get('completed_at'),
            'error': restore_job.get('error'),
            'restore_info': restore_job.get('restore_info')
        }), 200
        
    except Exception as e:
        logger.error(f"Get restore status error: {str(e)}")
        return jsonify({'error': 'Failed to get restore status'}), 500

@app.route('/restore/preview/<backup_id>', methods=['GET'])
def preview_backup_contents(backup_id):
    """Preview backup contents before restore"""
    try:
        user_id = authenticate_request(request)
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Get backup contents
        backup_contents = get_backup_contents(backup_id, user_id)
        
        if backup_contents is None:
            return jsonify({'error': 'Backup not found'}), 404
        
        return jsonify({
            'success': True,
            'backup_id': backup_id,
            'total_files': len(backup_contents),
            'files': backup_contents
        }), 200
        
    except Exception as e:
        logger.error(f"Preview backup error: {str(e)}")
        return jsonify({'error': 'Failed to preview backup'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8082)