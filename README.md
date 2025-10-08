# CollabOS - Collaborative Operating System

A Linux-based operating system designed for real-time multi-user collaboration and shared computing experiences.

## 🎯 Project Status: PIVOTED TO LINUX-BASED ARCHITECTURE

**Important Update:** We've pivoted from bare-metal OS to Linux-based approach to focus on **collaborative features** instead of reinventing drivers and bootloaders.

### Why the Pivot?
- ⚡ **90% faster development** - Linux handles drivers, networking, bootloader
- 🎯 **Focus on goals** - Build collaboration features, not VGA drivers
- 📦 **Better results** - Stable, demo-able system in weeks not months
- 🚀 **Real networking** - TCP/IP stack already works

> 📖 **See [COMPARISON.md](COMPARISON.md) for detailed analysis**  
> 🚀 **See [QUICK_START_V2.md](QUICK_START_V2.md) to get started**  
> 📋 **See [PIVOT_PLAN.md](PIVOT_PLAN.md) for full roadmap**

---

## 🚀 CollabOS v2.0 Overview

CollabOS is now built on **Alpine Linux** with custom desktop environment and collaboration features.

### Current Features (v2.0)

- ✅ **Alpine Linux base** - Minimal, fast, secure
- 🔄 **Custom desktop environment** - CollabOS-branded UI
- 🔄 **Shared terminal** - Multiple users in same terminal session
- 🔄 **Screen sharing** - View another user's desktop
- 🔄 **File synchronization** - Real-time file sync between instances
- 🔄 **Collaborative editing** - Real-time text editing

### Architecture

```
CollabOS v2.0
├─ Base: Alpine Linux (~130MB)
├─ Desktop: Custom Window Manager (Python/GTK or C/X11)
├─ Collaboration:
│  ├─ Shared Terminal (WebSocket-based)
│  ├─ Screen Sharing (VNC or custom)
│  ├─ File Sync (rsync + inotify)
│  └─ Real-time Editor (CRDT-based)
└─ Network: Standard TCP/IP
```

---

## 🛠 Quick Start

### Option 1: Use Pre-built ISO (Coming Soon)
```bash
# Download CollabOS ISO
curl -LO https://github.com/PrakharSinghOnGit/collabOS/releases/collabos-v2.0.iso

# Boot in QEMU
qemu-system-x86_64 -cdrom collabos-v2.0.iso -m 1024M -boot d
```

### Option 2: Build from Source
```bash
# See QUICK_START_V2.md for detailed instructions

# 1. Download Alpine Linux
curl -LO https://dl-cdn.alpinelinux.org/alpine/v3.19/releases/x86_64/alpine-virt-3.19.0-x86_64.iso

# 2. Boot and install
qemu-system-x86_64 -cdrom alpine-virt-3.19.0-x86_64.iso -m 1024M -boot d

# 3. Follow setup in QUICK_START_V2.md
```

---

## 📚 Documentation

### Getting Started
- **[QUICK_START_V2.md](QUICK_START_V2.md)** - Step-by-step setup guide
- **[PIVOT_PLAN.md](PIVOT_PLAN.md)** - Complete v2.0 roadmap
- **[COMPARISON.md](COMPARISON.md)** - Bare metal vs Linux comparison

### Legacy (v0.1 Bare Metal)
- **[TESTING.md](TESTING.md)** - Text/desktop mode testing (v0.1)
- **[DESKTOP_MODE.md](DESKTOP_MODE.md)** - Bare metal desktop docs (v0.1)
- **[SESSION_COMPLETE.md](SESSION_COMPLETE.md)** - v0.1 session summary

---

## 🎯 Development Roadmap

### Week 1: Foundation ✅
- [x] Pivot decision made
- [x] Documentation created
- [ ] Alpine Linux setup
- [ ] Development environment ready

### Week 2: Desktop
- [ ] Custom window manager
- [ ] CollabOS UI/UX
- [ ] Basic applications (terminal, files)

### Week 3: Collaboration
- [ ] Shared terminal prototype
- [ ] Screen sharing
- [ ] File synchronization

### Week 4: Polish
- [ ] Performance optimization
- [ ] Documentation
- [ ] Demo preparation

---

## � Key Collaborative Features (v2.0)

### Prerequisites

You'll need the following tools installed:

#### macOS (Apple Silicon - ARM)

```bash
brew install qemu x86_64-elf-gcc nasm i686-elf-grub xorriso
```

#### macOS (Intel - x86)

```bash
brew install qemu x86_64-elf-gcc nasm i686-elf-grub xorriso
```

#### Ubuntu/Debian

```bash
sudo apt-get update
sudo apt-get install qemu-system-x86 gcc-multilib nasm grub2-common xorriso
```

#### Windows

- Install QEMU for Windows
- Install a cross-compiler toolchain (MinGW-w64 or similar)
- Install NASM assembler

### Quick Start

1. **Clone and navigate to the project:**

   ```bash
   cd /path/to/collabOS
   ```

2. **Install dependencies (macOS with Homebrew):**

   ```bash
   brew install qemu x86_64-elf-gcc nasm i686-elf-grub xorriso
   ```

3. **Build and run CollabOS:**

   **Text Mode (default):**

   ```bash
   make run
   # or
   ./switch-mode.sh text
   ```

   **Desktop Mode (graphical):**

   ```bash
   ./switch-mode.sh desktop
   ```

   **Check current mode:**

   ```bash
   ./check-mode.sh
   ```

4. **For networking tests between two VMs:**
   ```bash
   make run-dual
   ```

> 📖 **See [TESTING.md](TESTING.md) for detailed information about both boot modes!**

## 📁 Project Structure

```
collabOS/
├── boot/
│   └── grub.cfg              # GRUB bootloader configuration
├── kernel/
│   ├── boot.s                # Assembly bootstrap + Multiboot header
│   ├── main.c                # Text mode entry point
│   ├── main_desktop.c        # Desktop mode entry point
│   ├── screen.c              # VGA text mode driver (80x25)
│   ├── graphics.c            # VGA graphics driver (320x200)
│   ├── desktop.c             # Window manager & desktop environment
│   ├── keyboard.c            # PS/2 keyboard driver
│   ├── net.c                 # Network communication framework
│   ├── serial.c              # Serial port debugging
│   └── string.c              # Standard library functions
├── include/
│   ├── screen.h              # Text mode declarations
│   ├── graphics.h            # Graphics mode declarations
│   ├── desktop.h             # Window manager declarations
│   ├── keyboard.h            # Keyboard declarations
│   └── net.h                 # Network declarations
├── build/                    # Generated files (created during build)
│   ├── *.o                   # Object files
│   ├── kernel.bin            # Compiled kernel binary
│   └── collabos.iso          # Bootable ISO image
├── linker.ld                 # Linker script for kernel layout
├── Makefile                  # Build system
├── switch-mode.sh            # Switch between text/desktop modes
├── check-mode.sh             # Check current boot mode
├── README.md                 # This file
└── TESTING.md                # Testing guide for both modes
```

## 🔧 Build System

### Available Make Targets

| Command              | Description                           |
| -------------------- | ------------------------------------- |
| `make` or `make all` | Build the CollabOS ISO                |
| `make run`           | Build and run in QEMU                 |
| `make run-net`       | Run with networking support           |
| `make run-dual`      | Run two VMs for collaboration testing |
| `make clean`         | Remove all build files                |
| `make debug`         | Run with GDB debugging support        |
| `make help`          | Show detailed help                    |

### Build Process

1. **Assembly**: `boot.s` is assembled to create the multiboot header
2. **Compilation**: C source files are compiled with `i386-elf-gcc`
3. **Linking**: Object files are linked using the custom `linker.ld` script
4. **ISO Creation**: GRUB creates a bootable ISO with the kernel

## 🚦 Testing & Usage

### Basic Testing

```bash
# Build and run the OS
make run

# You should see:
# Welcome to CollabOS v0.1
# ========================
#
# Initializing kernel...
# Keyboard initialized.
# Network initialized.
#
# CollabOS is ready!
# Type something to test the system:
```

### Networking Tests

```bash
# Run two VMs simultaneously
make run-dual

# This opens two QEMU windows running CollabOS
# Future versions will enable communication between them
```

## 🏗 Architecture Overview

### Kernel Components

1. **Boot Loader Interface** (`boot.s`)

   - Multiboot-compliant header
   - Stack initialization
   - Kernel entry point

2. **Display System** (`screen.c`)

   - VGA text mode (80x25)
   - Color support
   - Scrolling functionality

3. **Input System** (`keyboard.c`)

   - PS/2 keyboard support
   - Scan code to ASCII conversion
   - Basic input echo

4. **Network Framework** (`net.c`)

   - Packet structure definition
   - Send/receive placeholders
   - Foundation for inter-VM communication

### Memory Layout

- Kernel loads at `0x100000` (1MB)
- Stack: 16KB allocated in BSS section
- VGA buffer: `0xB8000` (hardware-mapped)

## 🔬 Development Workflow

### Week 1: Foundation

- [x] Set up build environment
- [x] Create bootable kernel
- [x] Implement basic display

### Week 2: Interaction

- [x] Add keyboard input
- [x] Create network framework
- [ ] Implement basic inter-VM communication

### Week 3: Polish

- [ ] Stabilize networking
- [ ] Add error handling
- [ ] Create demonstration scenario

## 🐛 Debugging

### Common Issues

1. **"i386-elf-gcc: No such file or directory"**

   ```bash
   # On Apple Silicon Macs, use x86_64-elf-gcc instead
   brew install x86_64-elf-gcc
   # The Makefile is already configured to use x86_64-elf-gcc
   ```

2. **"grub-mkrescue: command not found"**

   ```bash
   # Install the correct GRUB package for your system
   brew install i686-elf-grub xorriso
   ```

3. **Build Errors**

   ```bash
   # Ensure cross-compiler is installed
   which x86_64-elf-gcc

   # Check GRUB tools
   which i686-elf-grub-mkrescue

   # Clean and rebuild
   make clean
   make all
   ```

4. **QEMU Won't Start**

   ```bash
   # Verify QEMU installation
   qemu-system-i386 --version

   # Check ISO file exists
   ls -la build/collabos.iso
   ```

5. **Debugging with GDB**

   ```bash
   make debug
   # In another terminal:
   # gdb will connect automatically
   ```

## 🤝 Contributing

This is an educational project demonstrating OS development concepts. Key areas for contribution:

- **Networking**: Implement actual TCP/UDP stack
- **Hardware Support**: Add more device drivers
- **Collaboration Features**: Build on the networking foundation
- **Documentation**: Improve code comments and guides

## 📚 Learning Resources

- [OSDev Wiki](https://wiki.osdev.org/)
- [Multiboot Specification](https://www.gnu.org/software/grub/manual/multiboot/)
- [Intel x86 Architecture Manuals](https://software.intel.com/content/www/us/en/develop/articles/intel-sdm.html)
- [QEMU Documentation](https://www.qemu.org/docs/master/)

## 📄 License

This project is created for educational purposes. Feel free to use, modify, and learn from the code.

---

**CollabOS Team** | Building the future of collaborative computing 🌟
