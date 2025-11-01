from server.utils.auth import DEV_API_KEY

def test_health(client):
    resp = client.get("/health")
    assert resp.status_code == 200
