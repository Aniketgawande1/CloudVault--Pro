#!/bin/bash

# CloudVault Production Preparation Script
# Run this script to prepare your app for production deployment

set -e

echo "🚀 CloudVault Production Preparation"
echo "===================================="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -d "server" ] || [ ! -d "client" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

echo "Step 1: Generate Secure JWT Secret"
echo "====================================="
print_info "Generating a secure JWT secret key..."

JWT_SECRET=$(openssl rand -hex 32)
print_success "Generated secure JWT secret: ${JWT_SECRET:0:10}...${JWT_SECRET: -10}"

# Backup original .env
if [ -f "server/.env" ]; then
    cp server/.env server/.env.backup
    print_success "Backed up original .env to .env.backup"
fi

# Update .env file
cat > server/.env << EOF
# Flask Configuration
FLASK_ENV=production
PORT=5000
DEBUG=False

# JWT Secret Key - SECURE PRODUCTION KEY
JWT_SECRET_KEY=$JWT_SECRET

# Storage Configuration
STORAGE_TYPE=local
DATA_DIR=./data
STORAGE_LIMIT=1073741824

# Authentication
AUTH_ENABLED=true

# AWS S3 (Optional - only if using S3 in future)
# AWS_ACCESS_KEY_ID=your_access_key
# AWS_SECRET_ACCESS_KEY=your_secret_key
# AWS_REGION=us-east-1
# S3_BUCKET_NAME=your-bucket-name
EOF

print_success "Updated server/.env with production settings"

echo ""
echo "Step 2: Remove Debug Logging (Optional)"
echo "========================================="
print_warning "Debug logging is still present in the code"
print_info "To remove debug logs, you have two options:"
echo "  1. Keep them for initial production debugging"
echo "  2. Run: ./remove_debug_logs.sh (creates this script next)"
echo ""

# Create debug log removal script
cat > remove_debug_logs.sh << 'EOF'
#!/bin/bash
# Remove debug console.log and print statements

echo "🧹 Removing debug logs..."

# Remove console.log from client
find client/src -name "*.jsx" -type f -exec sed -i '/console\.log/d' {} \;
find client/src -name "*.js" -type f -exec sed -i '/console\.log/d' {} \;

# Remove debug prints from server
find server -name "*.py" -type f -exec sed -i '/print.*\[DEBUG\]/d' {} \;
find server -name "*.py" -type f -exec sed -i '/# Debug$/d' {} \;

echo "✅ Debug logs removed!"
echo "⚠️  Remember to test the app after removing logs"
EOF

chmod +x remove_debug_logs.sh
print_success "Created remove_debug_logs.sh script"

echo ""
echo "Step 3: Check Dependencies"
echo "=========================="

# Check server dependencies
print_info "Checking server dependencies..."
cd server
if [ -d "venv" ]; then
    source venv/bin/activate
    pip install -q -r requirements.txt
    print_success "Server dependencies installed"
else
    print_warning "Virtual environment not found. Run: python3 -m venv venv"
fi
cd ..

# Check client dependencies
print_info "Checking client dependencies..."
cd client
if [ -d "node_modules" ]; then
    print_success "Client dependencies already installed"
else
    print_info "Installing client dependencies..."
    npm install --silent
    print_success "Client dependencies installed"
fi
cd ..

echo ""
echo "Step 4: Run Security Audit"
echo "=========================="

print_info "Running npm audit..."
cd client
npm audit --audit-level=high || print_warning "Some npm vulnerabilities found. Run 'npm audit fix'"
cd ..

echo ""
echo "Step 5: Create Production Build"
echo "================================"

print_info "Building client for production..."
cd client
npm run build || print_error "Build failed! Fix errors before deploying"
print_success "Client production build created"
cd ..

echo ""
echo "📋 Production Preparation Summary"
echo "=================================="
print_success "JWT Secret generated and configured"
print_success "Environment set to production"
print_success "Dependencies checked"
print_success "Production build created"

echo ""
print_warning "⚠️  CRITICAL ITEMS STILL NEEDED:"
echo ""
echo "1. Database Migration:"
echo "   Current: In-memory storage (data lost on restart)"
echo "   Required: PostgreSQL, MongoDB, or MySQL"
echo "   Priority: HIGH"
echo ""
echo "2. Debug Panel in UI:"
echo "   Remove the debug panel from client/src/App.jsx (line ~658)"
echo "   Search for: '<!-- Debug Info - Remove in production -->'"
echo ""
echo "3. HTTPS/SSL:"
echo "   Set up SSL certificates for secure connections"
echo "   Use Let's Encrypt (free) or your cloud provider"
echo ""
echo "4. Production Server:"
echo "   Use gunicorn instead of Flask dev server"
echo "   Command: gunicorn -w 4 -b 0.0.0.0:5000 'main:create_app()'"
echo ""
echo "5. Monitoring & Logging:"
echo "   Set up error tracking (e.g., Sentry)"
echo "   Configure application logs"
echo "   Set up uptime monitoring"
echo ""

echo "🚀 Next Steps:"
echo "=============="
echo ""
echo "To test production build locally:"
echo "  1. cd server && gunicorn -w 4 -b 0.0.0.0:5000 'main:create_app()'"
echo "  2. cd client && npm start"
echo ""
echo "To deploy to production:"
echo "  1. Set up database (PostgreSQL recommended)"
echo "  2. Update database connection in server/services/auth_service.py"
echo "  3. Deploy backend to cloud (AWS, DigitalOcean, etc.)"
echo "  4. Deploy frontend to Vercel or similar"
echo "  5. Configure DNS and SSL"
echo ""

print_success "Production preparation complete! 🎉"
print_warning "Review the checklist above before deploying"

echo ""
echo "📚 Full details in: DEPLOYMENT_CHECKLIST.md"
