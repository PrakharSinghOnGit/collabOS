# 🎮 Testing CollabOS Modes

CollabOS now supports **two boot modes**: Text Mode and Desktop Mode!

## 📋 Quick Start

### Check Current Mode

```bash
./check-mode.sh
```

### Switch to Desktop Mode

```bash
./switch-mode.sh desktop
```

You should see:

- 🖥️ Graphical desktop environment (320x200, 256 colors)
- Three demo windows: "Welcome", "Terminal", and "Files"
- Gray desktop background
- Taskbar at the bottom showing window count
- Mouse cursor (static for now)

### Switch to Text Mode

```bash
./switch-mode.sh text
```

You should see:

- 📟 Text console (80x25 VGA)
- Green welcome screen
- System status messages
- Colored text output

## 🔍 What's Different?

### Text Mode (`kernel/main.c`)

- **Display**: 80x25 character text mode
- **Memory**: VGA buffer at 0xB8000
- **Features**:
  - Colored text (16 foreground × 8 background colors)
  - Scrolling support
  - Terminal functions
  - Keyboard driver (port I/O ready)

### Desktop Mode (`kernel/main_desktop.c`)

- **Display**: 320x200 graphics mode (VGA Mode 13h)
- **Memory**: Framebuffer at 0xA0000
- **Features**:
  - 256-color palette
  - Window manager
  - Pixel-level drawing
  - Shape rendering (lines, rectangles)
  - 8x8 bitmap font rendering
  - Desktop environment with taskbar

## 🏗️ Architecture

```
kernel/
├── main.c              # Text mode entry point
├── main_desktop.c      # Desktop mode entry point
├── screen.c            # Text mode VGA driver (0xB8000)
├── graphics.c          # Graphics mode VGA driver (0xA0000)
├── desktop.c           # Window manager & desktop environment
├── boot.s              # Assembly bootstrap
└── keyboard.c          # PS/2 keyboard driver

include/
├── screen.h            # Text mode constants (VGA_WIDTH=80, VGA_HEIGHT=25)
├── graphics.h          # Graphics mode constants (GFX_WIDTH=320, GFX_HEIGHT=200)
└── desktop.h           # Window structures
```

## 🎯 Current Implementation Status

### ✅ Working Features

- [x] Boot into either mode via switch script
- [x] Text mode with colors and scrolling
- [x] Graphics mode with pixel drawing
- [x] Window manager with 3 demo windows
- [x] Taskbar rendering
- [x] Text rendering in graphics mode

### 🔄 In Progress

- [ ] Keyboard input in desktop mode
- [ ] Mouse driver for cursor movement
- [ ] Window dragging
- [ ] Close button functionality

### ⏳ Future Features

- [ ] Window focus management
- [ ] Menu system
- [ ] File manager UI
- [ ] Network terminal application
- [ ] Inter-VM communication

## 🐛 Troubleshooting

### Desktop mode shows black screen?

- Check QEMU is using VGA graphics: `-vga std`
- Verify graphics mode switch: mode 13h (320x200x256)

### Text mode doesn't show colors?

- Check VGA memory writes to 0xB8000
- Verify color attributes (high byte of VGA entry)

### Build fails?

```bash
# Clean and rebuild
make clean
make all

# Or use the switch script which does this automatically
./switch-mode.sh [text|desktop]
```

## 📝 Technical Notes

### Mode Switching Mechanism

The `switch-mode.sh` script modifies the Makefile to exclude either:

- `kernel/main_desktop.c` (for text mode) → uses `kernel/main.c`
- `kernel/main.c` (for desktop mode) → uses `kernel/main_desktop.c`

This ensures only one `kernel_main()` function is linked into the final binary.

### VGA Memory Layout

- **Text Mode**: 0xB8000 (2 bytes per character: ASCII + color attribute)
- **Graphics Mode**: 0xA0000 (1 byte per pixel: palette index)

### Constants Renamed

To avoid macro conflicts:

- Text mode: `VGA_WIDTH`, `VGA_HEIGHT`, `VGA_MEMORY` (in `screen.h`)
- Graphics mode: `GFX_WIDTH`, `GFX_HEIGHT`, `GFX_MEMORY` (in `graphics.h`)

## 🚀 Next Steps

1. **Test both modes** to ensure they boot correctly
2. **Add keyboard interrupts** (IRQ1) for input in desktop mode
3. **Implement mouse driver** (PS/2 port 0x60/0x64)
4. **Make windows interactive** (drag, resize, close)
5. **Add network stack** for inter-VM terminal sharing

---

**CollabOS** - Building a custom OS from scratch 🎉
