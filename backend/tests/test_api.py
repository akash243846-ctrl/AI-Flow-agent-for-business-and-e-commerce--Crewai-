"""
Integration and API endpoint tests using FastAPI TestClient.
"""
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database.session import init_db

# Initialize database tables for testing
init_db()

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert "gemini_model" in data

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert "AgentFlow AI Backend" in response.json()["message"]

def test_create_task_validation():
    # Short query (< 5 chars) should fail with 400
    response = client.post("/api/tasks", data={"query": "hi"})
    assert response.status_code == 400
    assert "at least 5 characters" in response.json()["detail"]

def test_get_nonexistent_task():
    response = client.get("/api/tasks/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404

def test_list_tasks():
    response = client.get("/api/tasks")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
