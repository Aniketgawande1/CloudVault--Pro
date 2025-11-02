#!/bin/bash

# CloudVault Quick Start Script
# This script helps you quickly start both server and client

set -e  # Exit on error

echo "🚀 CloudVault Quick Start"
echo "========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

print_success "Python 3 found: $(python3 --version)"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

print_success "Node.js found: $(node --version)"

echo ""
echo "📦 Installing Dependencies..."
echo "=============================="
echo ""

# Install server dependencies
print_info "Installing server dependencies..."
cd server

if [ ! -d "venv" ]; then
    print_info "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -q -r requirements.txt
print_success "Server dependencies installed"

cd ..

# Install client dependencies
print_info "Installing client dependencies..."
cd client

if [ ! -d "node_modules" ]; then
    npm install --silent
else
    print_success "Client dependencies already installed"
fi

cd ..

echo ""
echo "🔧 Starting Services..."
echo "======================="
echo ""

# Start server in background
print_info "Starting Flask server on port 5000..."
cd server
source venv/bin/activate
python main.py > ../server.log 2>&1 &
SERVER_PID=$!
cd ..

# Wait for server to start
sleep 3

# Check if server is running
if kill -0 $SERVER_PID 2>/dev/null; then
    print_success "Server started (PID: $SERVER_PID)"
else
    print_error "Server failed to start. Check server.log for details."
    exit 1
fi

# Start client in background
print_info "Starting React client on port 3001..."
cd client
npm run dev > ../client.log 2>&1 &
CLIENT_PID=$!
cd ..

# Wait for client to start
sleep 5

# Check if client is running
if kill -0 $CLIENT_PID 2>/dev/null; then
    print_success "Client started (PID: $CLIENT_PID)"
else
    print_error "Client failed to start. Check client.log for details."
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

echo ""
echo "✨ CloudVault is Ready!"
echo "======================"
echo ""
echo "🌐 Server: http://localhost:5000"
echo "💻 Client: http://localhost:3001"
echo ""
echo "📋 Process IDs:"
echo "   Server: $SERVER_PID"
echo "   Client: $CLIENT_PID"
echo ""
echo "📝 Logs:"
echo "   Server: server.log"
echo "   Client: client.log"
echo ""
echo "🛑 To stop services:"
echo "   kill $SERVER_PID $CLIENT_PID"
echo "   or run: ./stop.sh"
echo ""
echo "🧪 To test authentication:"
echo "   python3 test_auth_flow.py"
echo ""

# Save PIDs to file for stop script
echo $SERVER_PID > .server.pid
echo $CLIENT_PID > .client.pid

print_success "All services running! Open http://localhost:3001 in your browser."
