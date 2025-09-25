# CollabOS v0.1

A collaborative operating system designed for real-time multi-user interaction and shared computing experiences.

## 🚀 Project Overview

CollabOS is a custom operating system built from scratch that focuses on enabling collaboration between multiple users and systems. This first milestone creates a minimal bootable OS with basic networking capabilities to serve as the foundation for advanced collaboration features.

### Key Features (v0.1)

- ✅ Custom kernel that boots in VMs
- ✅ VGA text mode display
- ✅ Basic keyboard input handling
- ✅ Network communication framework
- ✅ Foundation for inter-VM communication

### Future Features (Roadmap)

- 🔄 Screen sharing between VMs
- 🔄 Multi-user text editing
- 🔄 File synchronization
- 🔄 Real-time collaboration APIs
- 🔄 Graphical user interface

## 🛠 Development Setup

### Prerequisites

You'll need the following tools installed:

#### macOS (with Homebrew)

```bash
brew install qemu i386-elf-gcc nasm grub
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

2. **Install dependencies:**

   ```bash
   make install-deps
   ```

3. **Build and run CollabOS:**

   ```bash
   make run
   ```

4. **For networking tests between two VMs:**

   ```bash
   make run-dual
   ```

## 📁 Project Structure

```
collabOS/
├── boot/
│   └── grub.cfg              # GRUB bootloader configuration
├── kernel/
│   ├── boot.s                # Assembly boot code with multiboot header
│   ├── main.c                # Core kernel loop and initialization
│   ├── screen.c              # VGA text mode display driver
│   ├── keyboard.c            # Keyboard input handler
│   └── net.c                 # Network communication primitives
├── include/
│   ├── screen.h              # Display function declarations
│   ├── keyboard.h            # Keyboard function declarations
│   └── net.h                 # Network function declarations
├── build/                    # Generated files (created during build)
│   ├── *.o                   # Object files
│   ├── kernel.bin            # Compiled kernel binary
│   └── collabos.iso          # Bootable ISO image
├── linker.ld                 # Linker script for kernel layout
├── Makefile                  # Build system
└── README.md                 # This file
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

1. **Build Errors**

   ```bash
   # Ensure cross-compiler is installed
   which i386-elf-gcc

   # Check GRUB tools
   which grub-mkrescue
   ```

2. **QEMU Won't Start**

   ```bash
   # Verify QEMU installation
   qemu-system-i386 --version

   # Check ISO file exists
   ls -la build/collabos.iso
   ```

3. **Debugging with GDB**

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
