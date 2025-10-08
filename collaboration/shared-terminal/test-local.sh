#!/bin/bash
# Test script for shared terminal (run on host machine)
# This simulates the VM setup locally for testing

echo "===================================="
echo "CollabOS Shared Terminal Test"
echo "===================================="
echo ""

# Check if websockets is installed
if ! python3 -c "import websockets" 2>/dev/null; then
    echo "📦 Installing websockets library..."
    pip3 install websockets
fi

# Create test directory
TEST_DIR="/tmp/collabos-test"
mkdir -p "$TEST_DIR"

echo "✅ Setup complete"
echo ""
echo "Testing shared terminal locally..."
echo ""
echo "Step 1: Start the server in a new terminal:"
echo "  cd /Users/shaansingh/dev/projects/collabOS/collaboration/shared-terminal"
echo "  python3 server.py"
echo ""
echo "Step 2: Start client 1 in another terminal:"
echo "  python3 client.py"
echo ""
echo "Step 3: Start client 2 in another terminal:"
echo "  python3 client.py"
echo ""
echo "Step 4: Type commands in any client and watch them execute in both!"
echo ""
echo "===================================="
