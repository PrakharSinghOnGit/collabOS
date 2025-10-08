#!/bin/bash
# Boot VM2 for Alpine Linux installation
# This script boots from the ISO to install Alpine Linux to the virtual disk

ISO_PATH="${ISO_PATH:-../alpine-virt-3.19.1-x86_64.iso}"
DISK_PATH="vms/alpine-vm2.qcow2"

if [ ! -f "$ISO_PATH" ]; then
    echo "Error: ISO not found at $ISO_PATH"
    echo "Please download Alpine Linux ISO or set ISO_PATH environment variable"
    exit 1
fi

if [ ! -f "$DISK_PATH" ]; then
    echo "Error: Disk image not found at $DISK_PATH"
    exit 1
fi

echo "===================================="
echo "CollabOS VM2 - Installation Mode"
echo "===================================="
echo "ISO: $ISO_PATH"
echo "Disk: $DISK_PATH"
echo ""
echo "Installation Steps:"
echo "1. Login as root (no password)"
echo "2. Run: setup-alpine"
echo "3. Choose keyboard layout (us)"
echo "4. Set hostname: collabos-vm2"
echo "5. Choose network interface: eth0"
echo "6. Configure DHCP: dhcp"
echo "7. Set root password"
echo "8. Choose timezone (UTC recommended)"
echo "9. Choose proxy: none"
echo "10. Choose mirror: f (find fastest)"
echo "11. SSH server: openssh"
echo "12. Disk: sda"
echo "13. Mode: sys"
echo "14. Erase disk: y"
echo "15. After installation, shutdown VM"
echo "===================================="
echo ""

qemu-system-x86_64 \
    -m 1024M \
    -cdrom "$ISO_PATH" \
    -hda "$DISK_PATH" \
    -boot d \
    -netdev user,id=net0,hostfwd=tcp::2222-:22 \
    -device e1000,netdev=net0 \
    -nographic
