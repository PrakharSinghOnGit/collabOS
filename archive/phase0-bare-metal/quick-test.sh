#!/bin/bash
# Quick test runner with serial output capture

echo "Building CollabOS..."
make clean > /dev/null 2>&1
make all > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"
echo ""
echo "Starting QEMU with serial logging..."
echo "Look for a QEMU window to open"
echo "Serial output will appear below:"
echo "================================"

# Run QEMU with both graphical window AND serial output
qemu-system-i386 \
    -cdrom build/collabos.iso \
    -m 512M \
    -serial file:serial.log \
    -display sdl &

QEMU_PID=$!

# Wait a moment for boot
sleep 2

# Show serial output if it exists
if [ -f serial.log ]; then
    echo ""
    echo "📝 Serial output:"
    cat serial.log
    echo ""
fi

echo ""
echo "QEMU is running (PID: $QEMU_PID)"
echo "Close the QEMU window or press Ctrl+C to exit"

# Wait for QEMU to finish
wait $QEMU_PID 2>/dev/null

# Show final serial output
if [ -f serial.log ]; then
    echo ""
    echo "📝 Final serial output:"
    cat serial.log
    echo ""
fi