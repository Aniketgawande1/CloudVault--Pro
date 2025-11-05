#!/bin/bash

# CloudVault Stop Script
# Gracefully stops both server and client

echo "🛑 Stopping CloudVault Services..."
echo "=================================="

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Read PIDs from files
if [ -f ".server.pid" ]; then
    SERVER_PID=$(cat .server.pid)
    if kill -0 $SERVER_PID 2>/dev/null; then
        kill $SERVER_PID
        print_success "Server stopped (PID: $SERVER_PID)"
    else
        print_info "Server was not running"
    fi
    rm .server.pid
else
    print_info "No server PID file found"
fi

if [ -f ".client.pid" ]; then
    CLIENT_PID=$(cat .client.pid)
    if kill -0 $CLIENT_PID 2>/dev/null; then
        kill $CLIENT_PID
        print_success "Client stopped (PID: $CLIENT_PID)"
    else
        print_info "Client was not running"
    fi
    rm .client.pid
else
    print_info "No client PID file found"
fi

# Also kill any remaining processes on ports 5000 and 3001
print_info "Cleaning up any remaining processes..."
lsof -ti:5000 | xargs kill -9 2>/dev/null && print_success "Port 5000 cleared" || true
lsof -ti:3001 | xargs kill -9 2>/dev/null && print_success "Port 3001 cleared" || true

echo ""
print_success "All services stopped!"
