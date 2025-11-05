#!/usr/bin/env python3
"""
Test script to verify JWT authentication flow works correctly
Tests: signup, login, token validation, protected endpoints
"""

import requests
import json
import sys

BASE_URL = "http://localhost:5000"

def print_test(message):
    print(f"\n{'='*60}")
    print(f"TEST: {message}")
    print('='*60)

def print_success(message):
    print(f"✅ SUCCESS: {message}")

def print_error(message):
    print(f"❌ ERROR: {message}")

def test_signup():
    """Test user signup"""
    print_test("User Signup")
    
    data = {
        "email": "test@example.com",
        "password": "test123456",
        "full_name": "Test User"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/signup", json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            result = response.json()
            if 'token' in result and 'user' in result and 'storage' in result:
                print_success("Signup successful with token and storage info")
                return result['token']
            else:
                print_error("Missing required fields in response")
                return None
        else:
            print_error(f"Signup failed: {response.json().get('error', 'Unknown error')}")
            return None
    except Exception as e:
        print_error(f"Request failed: {str(e)}")
        return None

def test_login(email, password):
    """Test user login"""
    print_test("User Login")
    
    data = {
        "email": email,
        "password": password
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            result = response.json()
            if 'token' in result:
                print_success("Login successful with token")
                return result['token']
            else:
                print_error("No token in response")
                return None
        else:
            print_error(f"Login failed: {response.json().get('error', 'Unknown error')}")
            return None
    except Exception as e:
        print_error(f"Request failed: {str(e)}")
        return None

def test_protected_endpoint(token):
    """Test accessing protected /list endpoint"""
    print_test("Protected Endpoint (/list)")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/list", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            result = response.json()
            if 'files' in result and 'storage' in result:
                print_success("Protected endpoint accessed successfully")
                print(f"Files count: {len(result['files'])}")
                print(f"Storage used: {result['storage'].get('used', 0)} bytes")
                return True
            else:
                print_error("Missing required fields in response")
                return False
        else:
            print_error(f"Access failed: {response.json().get('error', 'Unknown error')}")
            return False
    except Exception as e:
        print_error(f"Request failed: {str(e)}")
        return False

def test_invalid_token():
    """Test with invalid token"""
    print_test("Invalid Token Test")
    
    headers = {
        "Authorization": "Bearer invalid_token_here"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/list", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 401:
            print_success("Invalid token correctly rejected")
            return True
        else:
            print_error("Invalid token should return 401")
            return False
    except Exception as e:
        print_error(f"Request failed: {str(e)}")
        return False

def main():
    print("\n" + "="*60)
    print("CloudVault JWT Authentication Test Suite")
    print("="*60)
    
    results = {
        "signup": False,
        "login": False,
        "protected": False,
        "invalid_token": False
    }
    
    # Test 1: Signup
    token = test_signup()
    results["signup"] = token is not None
    
    if not token:
        print_error("\nCannot proceed without successful signup. Exiting.")
        sys.exit(1)
    
    # Test 2: Login
    login_token = test_login("test@example.com", "test123456")
    results["login"] = login_token is not None
    
    # Test 3: Protected endpoint with valid token
    if login_token:
        results["protected"] = test_protected_endpoint(login_token)
    
    # Test 4: Invalid token
    results["invalid_token"] = test_invalid_token()
    
    # Summary
    print_test("Test Summary")
    total_tests = len(results)
    passed_tests = sum(1 for v in results.values() if v)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\n{'='*60}")
    print(f"Results: {passed_tests}/{total_tests} tests passed")
    print('='*60)
    
    if passed_tests == total_tests:
        print_success("All authentication tests passed! 🎉")
        sys.exit(0)
    else:
        print_error("Some tests failed. Please check the server logs.")
        sys.exit(1)

if __name__ == "__main__":
    main()
