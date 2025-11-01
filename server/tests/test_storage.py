# tests/test_storage.py
from server.utils.storage_factory import storage

def test_local_storage_save_list_read():
    # Save
    storage.save_file("test_user/hello.txt", b"hello")

    # List
    files = storage.list_files("test_user")
    assert len(files) > 0

    # Read
    data = storage.read_file("test_user/hello.txt")
    assert data == b"hello"
