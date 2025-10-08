#!/bin/bash
# Force boot from CD-ROM with explicit settings

echo "🚀 Testing CollabOS boot with forced CD-ROM boot order..."
echo ""

qemu-system-i386 \
    -boot d \
    -cdrom build/collabos.iso \
    -m 512M \
    -vga std \
    -no-reboot \
    -no-shutdown \
    -serial stdio

echo ""
echo "QEMU exited."
