# utils/storage_factory.py — picks storage adapter
import os

USE_S3 = bool(os.getenv("S3_BUCKET"))

if USE_S3:
    from .s3_storage import (
        save_file,
        list_files,
        read_file,
        create_backup_manifest,
        restore_from_manifest
    )
else:
    from .local_storage import (
        save_file,
        list_files,
        read_file,
        create_backup_manifest,
        restore_from_manifest
    )


class StorageAdapter:
    save_file = staticmethod(save_file)
    list_files = staticmethod(list_files)
    read_file = staticmethod(read_file)
    create_backup_manifest = staticmethod(create_backup_manifest)
    restore_from_manifest = staticmethod(restore_from_manifest)


storage = StorageAdapter()
