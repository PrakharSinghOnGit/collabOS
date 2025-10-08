#!/bin/bash
# Switch between text-mode and desktop-mode kernels

MODE=$1
MAKEFILE="Makefile"

if [ "$MODE" = "desktop" ]; then
    echo "🖥️  Building CollabOS with Desktop Environment..."
    
    # Update Makefile to exclude main.c and include main_desktop.c
    sed -i.bak 's/filter-out $(SRCDIR)\/main_desktop.c/filter-out $(SRCDIR)\/main.c/' "$MAKEFILE"
    
    make clean
    make all
    
    if [ $? -eq 0 ]; then
        echo "✅ Build successful!"
        echo "🚀 Starting CollabOS Desktop..."
        make run
    else
        echo "❌ Build failed!"
        mv "$MAKEFILE.bak" "$MAKEFILE"
        exit 1
    fi
    
elif [ "$MODE" = "text" ]; then
    echo "📟 Building CollabOS in Text Mode..."
    
    # Update Makefile to exclude main_desktop.c and include main.c
    sed -i.bak 's/filter-out $(SRCDIR)\/main.c/filter-out $(SRCDIR)\/main_desktop.c/' "$MAKEFILE"
    
    make clean
    make all
    
    if [ $? -eq 0 ]; then
        echo "✅ Build successful!"
        echo "🚀 Starting CollabOS Text Mode..."
        make run
    else
        echo "❌ Build failed!"
        mv "$MAKEFILE.bak" "$MAKEFILE"
        exit 1
    fi
    
else
    echo "Usage: ./switch-mode.sh [text|desktop]"
    echo ""
    echo "  text    - Boot to text-mode console (80x25 VGA)"
    echo "  desktop - Boot to graphical desktop environment (320x200 256-color)"
    echo ""
    echo "Current mode: $(grep 'filter-out.*main' Makefile | grep -q 'main_desktop' && echo 'TEXT' || echo 'DESKTOP')"
fi