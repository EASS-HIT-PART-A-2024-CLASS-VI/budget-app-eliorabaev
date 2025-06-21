from pathlib import Path
import sys
import pytest
from fastapi.testclient import TestClient

# Adjust the import path
current_file = Path(__file__).resolve()
app_dir = current_file.parent.parent
sys.path.insert(0, str(app_dir))

from main import app

client = TestClient(app)

class TestAuthenticationRoutes:
    """Test cases for authentication endpoints"""

    def test_password_requirements_endpoint(self):
        """Test that password requirements endpoint works"""
        response = client.get("/auth/password-requirements")
        assert response.status_code == 200
        data = response.json()
        assert "requirements" in data
        assert "min_length" in data
        assert data["min_length"] == 8

    def test_valid_user_registration(self):
        """Test successful user registration"""
        user_data = {
            "username": "testuser123",
            "email": "test@example.com",
            "password": "SecurePass123!",
            "password_confirmation": "SecurePass123!"
        }
        
        response = client.post("/auth/register", json=user_data)
        assert response.status_code == 201
        data = response.json()
        assert data["username"] == "testuser123"
        assert data["email"] == "test@example.com"
        assert "password" not in data  # Password should not be returned

    def test_duplicate_username_registration(self):
        """Test registration with duplicate username"""
        user_data = {
            "username": "testuser123",
            "email": "different@example.com",
            "password": "SecurePass123!",
            "password_confirmation": "SecurePass123!"
        }
        
        # First registration should succeed
        response1 = client.post("/auth/register", json=user_data)
        assert response1.status_code == 201
        
        # Second registration with same username should fail
        response2 = client.post("/auth/register", json=user_data)
        assert response2.status_code == 409
        assert "Username already registered" in response2.json()["detail"]

    def test_invalid_password_registration(self):
        """Test registration with weak password"""
        user_data = {
            "username": "testuser456",
            "email": "test2@example.com",
            "password": "123456",  # Common password
            "password_confirmation": "123456"
        }
        
        response = client.post("/auth/register", json=user_data)
        assert response.status_code == 422
        assert "too common" in response.json()["detail"]

    def test_password_mismatch_registration(self):
        """Test registration with password mismatch"""
        user_data = {
            "username": "testuser789",
            "email": "test3@example.com",
            "password": "SecurePass123!",
            "password_confirmation": "DifferentPass123!"
        }
        
        response = client.post("/auth/register", json=user_data)
        assert response.status_code == 422
        assert "do not match" in response.json()["detail"]

    def test_invalid_email_registration(self):
        """Test registration with invalid email"""
        user_data = {
            "username": "testuser000",
            "email": "invalid-email",
            "password": "SecurePass123!",
            "password_confirmation": "SecurePass123!"
        }
        
        response = client.post("/auth/register", json=user_data)
        assert response.status_code == 422
        assert "Invalid email format" in response.json()["detail"]

    def test_invalid_username_registration(self):
        """Test registration with invalid username (special characters)"""
        user_data = {
            "username": "test-user!",  # Contains special characters
            "email": "test4@example.com",
            "password": "SecurePass123!",
            "password_confirmation": "SecurePass123!"
        }
        
        response = client.post("/auth/register", json=user_data)
        assert response.status_code == 422
        assert "letters and numbers" in response.json()["detail"]

    def test_username_availability_check(self):
        """Test username availability check endpoint"""
        # Check available username
        response = client.get("/auth/check-username/newuser123")
        assert response.status_code == 200
        data = response.json()
        assert data["available"] is True
        
        # Register a user first
        user_data = {
            "username": "takenuser",
            "email": "taken@example.com",
            "password": "SecurePass123!",
            "password_confirmation": "SecurePass123!"
        }
        client.post("/auth/register", json=user_data)
        
        # Check taken username
        response = client.get("/auth/check-username/takenuser")
        assert response.status_code == 200
        data = response.json()
        assert data["available"] is False

# Example usage script
if __name__ == "__main__":
    # Example of how to test the endpoints manually
    print("Testing authentication endpoints...")
    
    # Test password requirements
    response = client.get("/auth/password-requirements")
    print(f"Password requirements: {response.json()}")
    
    # Test registration
    test_user = {
        "username": "demouser123",
        "email": "demo@example.com", 
        "password": "DemoPass123!",
        "password_confirmation": "DemoPass123!"
    }
    
    response = client.post("/auth/register", json=test_user)
    if response.status_code == 201:
        print(f"Registration successful: {response.json()}")
    else:
        print(f"Registration failed: {response.json()}")
    
    # Test login
    login_data = {
        "username_or_email": "demouser123",
        "password": "DemoPass123!"
    }
    
    response = client.post("/auth/login", json=login_data)
    if response.status_code == 200:
        print(f"Login successful: {response.json()}")
    else:
        print(f"Login failed: {response.json()}")
