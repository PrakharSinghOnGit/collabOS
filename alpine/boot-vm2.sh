#!/bin/bash
# Boot VM2 from installed disk (after installation complete)
# Use this script after Alpine Linux has been installed to the disk

DISK_PATH="vms/alpine-vm2.qcow2"

if [ ! -f "$DISK_PATH" ]; then
    echo "Error: Disk image not found at $DISK_PATH"
    echo "Please run boot-vm2-install.sh first to install Alpine Linux"
    exit 1
fi

echo "===================================="
echo "CollabOS VM2 - Running Mode"
echo "===================================="
echo "Disk: $DISK_PATH"
echo "SSH Port: 2222 (localhost:2222 -> VM:22)"
echo ""
echo "To connect via SSH:"
echo "  ssh root@localhost -p 2222"
echo ""
echo "To shutdown:"
echo "  Inside VM: poweroff"
echo "  Or press Ctrl+A then X"
echo "===================================="
echo ""

qemu-system-x86_64 \
    -m 1024M \
    -hda "$DISK_PATH" \
    -netdev user,id=net0,hostfwd=tcp::2222-:22 \
    -device e1000,netdev=net0 \
    -nographic
