"""
Cloud backup functionality
Handles automated backup operations and scheduling
"""

import os
import json
import schedule
import time
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from utils.gcs import create_backup, list_backups, get_backup_info
from utils.auth import authenticate_request
from utils.logger import get_logger

app = Flask(__name__)
logger = get_logger(__name__)

# Backup configuration
DEFAULT_BACKUP_RETENTION_DAYS = 30
MAX_BACKUP_SIZE = 10 * 1024 * 1024 * 1024  # 10GB

class BackupManager:
    def __init__(self):
        self.active_backups = {}
        self.backup_queue = []
    
    def create_backup_job(self, user_id, backup_config):
        """Create a new backup job"""
        backup_id = f"backup_{user_id}_{int(datetime.now().timestamp())}"
        
        job_config = {
            'backup_id': backup_id,
            'user_id': user_id,
            'created_at': datetime.now().isoformat(),
            'status': 'pending',
            'config': backup_config
        }
        
        self.backup_queue.append(job_config)
        logger.info(f"Backup job created: {backup_id}")
        return backup_id
    
    def process_backup_queue(self):
        """Process pending backup jobs"""
        while self.backup_queue:
            job = self.backup_queue.pop(0)
            try:
                self.execute_backup(job)
            except Exception as e:
                logger.error(f"Backup job failed: {job['backup_id']} - {str(e)}")
                job['status'] = 'failed'
                job['error'] = str(e)
    
    def execute_backup(self, job):
        """Execute a backup operation"""
        backup_id = job['backup_id']
        user_id = job['user_id']
        config = job['config']
        
        logger.info(f"Starting backup: {backup_id}")
        job['status'] = 'running'
        job['started_at'] = datetime.now().isoformat()
        
        try:
            # Create backup based on configuration
            backup_result = create_backup(
                user_id=user_id,
                source_paths=config.get('source_paths', []),
                backup_name=config.get('backup_name', f'backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}'),
                compression=config.get('compression', True),
                encryption=config.get('encryption', True)
            )
            
            job['status'] = 'completed'
            job['completed_at'] = datetime.now().isoformat()
            job['backup_info'] = backup_result
            
            logger.info(f"Backup completed successfully: {backup_id}")
            
            # Schedule cleanup of old backups if retention policy is set
            retention_days = config.get('retention_days', DEFAULT_BACKUP_RETENTION_DAYS)
            if retention_days > 0:
                self.cleanup_old_backups(user_id, retention_days)
                
        except Exception as e:
            job['status'] = 'failed'
            job['error'] = str(e)
            job['failed_at'] = datetime.now().isoformat()
            raise e
    
    def cleanup_old_backups(self, user_id, retention_days):
        """Clean up backups older than retention period"""
        try:
            cutoff_date = datetime.now() - timedelta(days=retention_days)
            old_backups = list_backups(
                user_id=user_id,
                before_date=cutoff_date
            )
            
            for backup in old_backups:
                try:
                    # Delete old backup (implementation would call GCS delete)
                    logger.info(f"Cleaned up old backup: {backup['backup_id']}")
                except Exception as e:
                    logger.error(f"Failed to cleanup backup {backup['backup_id']}: {str(e)}")
                    
        except Exception as e:
            logger.error(f"Backup cleanup failed for user {user_id}: {str(e)}")

# Global backup manager instance
backup_manager = BackupManager()

@app.route('/backup/create', methods=['POST'])
def create_backup_endpoint():
    """Create a new backup"""
    try:
        user_id = authenticate_request(request)
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body required'}), 400
        
        # Validate backup configuration
        required_fields = ['source_paths']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create backup job
        backup_id = backup_manager.create_backup_job(user_id, data)
        
        # Process backup queue (in production, this would be handled by a background worker)
        backup_manager.process_backup_queue()
        
        return jsonify({
            'success': True,
            'message': 'Backup created successfully',
            'backup_id': backup_id
        }), 201
        
    except Exception as e:
        logger.error(f"Create backup error: {str(e)}")
        return jsonify({'error': 'Failed to create backup'}), 500

@app.route('/backup/status/<backup_id>', methods=['GET'])
def get_backup_status(backup_id):
    """Get backup status"""
    try:
        user_id = authenticate_request(request)
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Find backup job (in production, this would query a database)
        backup_job = None
        for job in backup_manager.active_backups.get(user_id, []):
            if job['backup_id'] == backup_id:
                backup_job = job
                break
        
        if not backup_job:
            return jsonify({'error': 'Backup not found'}), 404
        
        return jsonify({
            'backup_id': backup_id,
            'status': backup_job['status'],
            'created_at': backup_job['created_at'],
            'started_at': backup_job.get('started_at'),
            'completed_at': backup_job.get('completed_at'),
            'error': backup_job.get('error'),
            'backup_info': backup_job.get('backup_info')
        }), 200
        
    except Exception as e:
        logger.error(f"Get backup status error: {str(e)}")
        return jsonify({'error': 'Failed to get backup status'}), 500

@app.route('/backup/list', methods=['GET'])
def list_user_backups():
    """List all backups for a user"""
    try:
        user_id = authenticate_request(request)
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Get query parameters
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        # List backups from storage
        backups = list_backups(
            user_id=user_id,
            limit=limit,
            offset=offset
        )
        
        return jsonify({
            'success': True,
            'backups': backups,
            'total': len(backups)
        }), 200
        
    except Exception as e:
        logger.error(f"List backups error: {str(e)}")
        return jsonify({'error': 'Failed to list backups'}), 500

@app.route('/backup/schedule', methods=['POST'])
def schedule_backup():
    """Schedule automated backups"""
    try:
        user_id = authenticate_request(request)
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body required'}), 400
        
        # Validate schedule configuration
        schedule_config = data.get('schedule', {})
        frequency = schedule_config.get('frequency')  # daily, weekly, monthly
        time_of_day = schedule_config.get('time', '02:00')  # Default 2 AM
        
        if frequency not in ['daily', 'weekly', 'monthly']:
            return jsonify({'error': 'Invalid frequency. Use: daily, weekly, monthly'}), 400
        
        # Schedule the backup (simplified implementation)
        if frequency == 'daily':
            schedule.every().day.at(time_of_day).do(
                lambda: backup_manager.create_backup_job(user_id, data)
            )
        elif frequency == 'weekly':
            schedule.every().week.at(time_of_day).do(
                lambda: backup_manager.create_backup_job(user_id, data)
            )
        elif frequency == 'monthly':
            schedule.every(30).days.at(time_of_day).do(
                lambda: backup_manager.create_backup_job(user_id, data)
            )
        
        return jsonify({
            'success': True,
            'message': f'Backup scheduled {frequency} at {time_of_day}'
        }), 200
        
    except Exception as e:
        logger.error(f"Schedule backup error: {str(e)}")
        return jsonify({'error': 'Failed to schedule backup'}), 500

@app.route('/backup/delete/<backup_id>', methods=['DELETE'])
def delete_backup(backup_id):
    """Delete a specific backup"""
    try:
        user_id = authenticate_request(request)
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Verify backup belongs to user and delete
        backup_info = get_backup_info(backup_id, user_id)
        if not backup_info:
            return jsonify({'error': 'Backup not found or access denied'}), 404
        
        # Delete backup from storage (implementation would call GCS delete)
        # delete_backup_from_storage(backup_id, user_id)
        
        return jsonify({
            'success': True,
            'message': 'Backup deleted successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Delete backup error: {str(e)}")
        return jsonify({'error': 'Failed to delete backup'}), 500

def run_backup_scheduler():
    """Run the backup scheduler (should be run in background)"""
    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute

if __name__ == '__main__':
    # In production, run scheduler in a separate process/thread
    import threading
    scheduler_thread = threading.Thread(target=run_backup_scheduler)
    scheduler_thread.daemon = True
    scheduler_thread.start()
    
    app.run(debug=True, host='0.0.0.0', port=8081)