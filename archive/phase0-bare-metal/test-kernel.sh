#!/bin/bash
# Test script to check if CollabOS boots properly

echo "Testing CollabOS kernel..."
echo "================================"
echo ""

# Check if kernel is valid multiboot
if i686-elf-grub-file --is-x86-multiboot build/kernel.bin; then
    echo "✅ Kernel has valid Multiboot header"
else
    echo "❌ Kernel does NOT have valid Multiboot header"
    exit 1
fi

# Check kernel size
KERNEL_SIZE=$(stat -f%z build/kernel.bin 2>/dev/null || stat -c%s build/kernel.bin 2>/dev/null)
echo "📏 Kernel size: $KERNEL_SIZE bytes"

if [ $KERNEL_SIZE -lt 1000 ]; then
    echo "⚠️  Warning: Kernel seems too small"
fi

# Check for multiboot magic in objdump
echo ""
echo "🔍 Checking multiboot header location..."
x86_64-elf-objdump -h build/kernel.bin | grep -E "multiboot|text"

echo ""
echo "🔍 Multiboot header contents:"
x86_64-elf-objdump -s -j .multiboot build/kernel.bin | head -20

echo ""
echo "================================"
echo "Now running in QEMU..."
echo "Press Ctrl+C to exit"
echo "================================"
echo ""

# Run with output to see what happens
timeout 5 qemu-system-i386 -cdrom build/collabos.iso -m 512M -nographic || true

echo ""
echo "Test complete!"