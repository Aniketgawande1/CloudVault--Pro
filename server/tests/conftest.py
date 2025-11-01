from server.main import create_app
import pytest

@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    return app.test_client()
