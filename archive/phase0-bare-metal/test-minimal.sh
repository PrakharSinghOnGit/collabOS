#!/bin/bash
# Test with ultra-minimal kernel

echo "Creating minimal test kernel..."

# Backup current main.c
cp kernel/main.c kernel/main_backup.c

# Use minimal version
cp kernel/main_simple.c kernel/main.c

# Rebuild
make clean > /dev/null 2>&1
make all > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "Starting QEMU..."
    echo "You should see a green screen with 'COLLAB OS v0.1 - IT WORKS!'"
    echo ""
    make run
else
    echo "❌ Build failed!"
    # Restore backup
    cp kernel/main_backup.c kernel/main.c
    exit 1
fi

# Restore original after test
echo ""
echo "Restoring original main.c..."
cp kernel/main_backup.c kernel/main.c
rm kernel/main_backup.c