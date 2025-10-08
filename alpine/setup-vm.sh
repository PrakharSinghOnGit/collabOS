#!/bin/bash
# CollabOS Development Environment Setup Script
# Run this script inside each Alpine Linux VM after installation

set -e

echo "===================================="
echo "CollabOS VM Setup"
echo "===================================="
echo ""

# Get hostname to identify which VM this is
HOSTNAME=$(hostname)
echo "Setting up: $HOSTNAME"
echo ""

# Update package repositories
echo "1. Updating package repositories..."
apk update

# Install build tools
echo "2. Installing build tools..."
apk add build-base gcc make cmake git

# Install Python and development tools
echo "3. Installing Python development environment..."
apk add python3 py3-pip python3-dev

# Install networking libraries
echo "4. Installing networking libraries..."
pip3 install --break-system-packages websockets aiohttp asyncio

# Install GTK for future GUI development
echo "5. Installing GTK3 (for Phase 2)..."
apk add gtk+3.0 py3-gobject3

# Install Avahi for service discovery
echo "6. Installing Avahi for mDNS..."
apk add avahi avahi-tools dbus

# Enable and start services
echo "7. Enabling services..."
rc-update add dbus
rc-update add avahi-daemon
rc-service dbus start
rc-service avahi-daemon start

# Create working directory
echo "8. Creating CollabOS directory..."
mkdir -p /root/collabos
cd /root/collabos

# Install additional useful tools
echo "9. Installing utilities..."
apk add nano curl wget netcat-openbsd

echo ""
echo "===================================="
echo "Setup Complete!"
echo "===================================="
echo ""
echo "Installed packages:"
python3 --version
pip3 --version
gcc --version | head -1
git --version
echo ""
echo "Python libraries:"
pip3 list | grep -E "websockets|aiohttp"
echo ""
echo "Working directory: /root/collabos"
echo ""
echo "Next steps:"
echo "1. Clone CollabOS repository or copy code"
echo "2. Run shared terminal server/client"
echo "3. Test VM-to-VM communication"
echo "===================================="
