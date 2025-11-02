#!/bin/bash

echo "🚀 CloudVault Server Startup Script"
echo "===================================="
echo ""

# Navigate to server directory
cd "$(dirname "$0")"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "✅ Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -q -r requirements.txt

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating default configuration..."
    cat > .env << 'EOF'
FLASK_ENV=development
PORT=5000
STORAGE_TYPE=local
DATA_DIR=./data
AUTH_ENABLED=false
EOF
fi

# Create data directory if it doesn't exist
mkdir -p data

echo ""
echo "✅ Server setup complete!"
echo "🌐 Starting Flask server on http://localhost:5000..."
echo "📝 Press Ctrl+C to stop the server"
echo ""

# Start the server
python main.py
