#!/bin/bash
# CollabOS Quick Start Script

echo "================================"
echo "  CollabOS Build & Run Script"
echo "================================"
echo ""

# Check dependencies
echo "Checking dependencies..."

command -v x86_64-elf-gcc >/dev/null 2>&1 || {
    echo "❌ x86_64-elf-gcc not found"
    echo "Install with: brew install x86_64-elf-gcc"
    exit 1
}

command -v nasm >/dev/null 2>&1 || {
    echo "❌ nasm not found"
    echo "Install with: brew install nasm"
    exit 1
}

command -v qemu-system-i386 >/dev/null 2>&1 || {
    echo "❌ qemu-system-i386 not found"
    echo "Install with: brew install qemu"
    exit 1
}

command -v i686-elf-grub-mkrescue >/dev/null 2>&1 || {
    echo "❌ i686-elf-grub-mkrescue not found"
    echo "Install with: brew install i686-elf-grub xorriso"
    exit 1
}

echo "✅ All dependencies found!"
echo ""

# Build
echo "Building CollabOS..."
make clean
make all

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "Running CollabOS in QEMU..."
    echo "Press Ctrl+C in this terminal or close the QEMU window to exit."
    echo ""
    make run
else
    echo "❌ Build failed!"
    exit 1
fi