#!/bin/bash
# Test script to verify auth fix

echo "=== Testing Auth Flow ==="
echo ""

# Step 1: Clear any existing tokens from browser localStorage
echo "1. First, clear localStorage in your browser console:"
echo "   localStorage.removeItem('authToken');"
echo "   localStorage.removeItem('userData');"
echo ""

# Step 2: Test signup
echo "2. Testing signup..."
SIGNUP_RESPONSE=$(curl -s -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","full_name":"Test User"}')

echo "Signup response:"
echo "$SIGNUP_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$SIGNUP_RESPONSE"
echo ""

# Extract token from signup response
TOKEN=$(echo "$SIGNUP_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ No token received from signup"
  echo "Note: User might already exist. Try login instead."
  echo ""
  
  # Try login instead
  echo "3. Trying login..."
  LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"test123"}')
  
  echo "Login response:"
  echo "$LOGIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_RESPONSE"
  echo ""
  
  TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))" 2>/dev/null)
fi

if [ -n "$TOKEN" ]; then
  echo "✅ Got token: ${TOKEN:0:30}..."
  echo ""
  
  # Step 3: Test /auth/me with valid token
  echo "4. Testing /auth/me with valid token..."
  AUTH_ME_RESPONSE=$(curl -s -X GET http://localhost:5000/auth/me \
    -H "Authorization: Bearer $TOKEN")
  
  echo "Auth me response:"
  echo "$AUTH_ME_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$AUTH_ME_RESPONSE"
  echo ""
  
  # Step 4: Simulate server restart (token valid but user gone from memory)
  echo "5. Now simulate server restart scenario:"
  echo "   - Server restarts → users_db cleared"
  echo "   - Client still has valid JWT token"
  echo "   - Client calls /auth/me"
  echo ""
  echo "   Expected: 401 User not found (forces re-login)"
  echo "   Before fix: Would have returned success with empty data"
  echo ""
  
  echo "=== Test Complete ==="
  echo ""
  echo "To test in browser:"
  echo "1. Go to http://localhost:3001"
  echo "2. Sign up or log in"
  echo "3. Restart the Python server (pkill -f 'python main.py' && cd server && python main.py)"
  echo "4. Refresh the page"
  echo "5. Expected: Should show auth page (not dashboard)"
  echo "6. Login again → Should work"
else
  echo "❌ Failed to get token"
fi
