#!/bin/bash
# Check which mode CollabOS is currently configured for

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 CollabOS Mode Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if grep -q 'filter-out.*main_desktop.c' Makefile; then
    echo "📟 Current Mode: TEXT MODE"
    echo "   - 80x25 VGA text console"
    echo "   - Green welcome screen"
    echo "   - Keyboard driver enabled"
elif grep -q 'filter-out.*main.c' Makefile; then
    echo "🖥️  Current Mode: DESKTOP MODE"
    echo "   - 320x200 256-color graphics"
    echo "   - Window manager with 3 demo windows"
    echo "   - Mouse cursor rendering"
else
    echo "⚠️  Unknown mode configuration"
fi

echo ""
echo "To switch modes, run:"
echo "  ./switch-mode.sh text    - Switch to text console"
echo "  ./switch-mode.sh desktop - Switch to graphical desktop"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
