# 🚀 CollabOS v2.0 - Quick Start Guide

## ✅ You Made the Right Choice!

We're pivoting to **Alpine Linux** as our base. This means:

- ✅ **Working today** instead of weeks from now
- ✅ **Focus on collaboration** not bootloaders
- ✅ **90% less low-level code** to write
- ✅ **Real networking** that actually works

---

## 📥 Step 1: Download Alpine Linux (5 minutes)

### Option A: Virtual ISO (Recommended for QEMU)

```bash
# Download Alpine Virtual (optimized for VMs)
curl -LO https://dl-cdn.alpinelinux.org/alpine/v3.19/releases/x86_64/alpine-virt-3.19.0-x86_64.iso

# File size: ~130MB
# Perfect for: QEMU, VirtualBox, VMware
```

### Option B: Standard ISO (if you want GUI tools)

```bash
# Download Alpine Standard (includes more packages)
curl -LO https://dl-cdn.alpinelinux.org/alpine/v3.19/releases/x86_64/alpine-standard-3.19.0-x86_64.iso

# File size: ~180MB
# Includes: More drivers, more packages
```

---

## 🖥️ Step 2: Boot Alpine in QEMU (2 minutes)

```bash
# Create a directory for Alpine work
mkdir -p alpine-test
cd alpine-test

# Boot the ISO
qemu-system-x86_64 \
  -cdrom ../alpine-virt-3.19.0-x86_64.iso \
  -m 1024M \
  -boot d \
  -netdev user,id=net0 \
  -device e1000,netdev=net0 \
  -enable-kvm  # Remove this line if on macOS without KVM
```

**What you'll see:**

- Alpine Linux boot menu
- Login prompt (username: `root`, no password for live CD)

---

## ⚙️ Step 3: Install Alpine to Disk (10 minutes)

Once booted into Alpine:

```bash
# 1. Login as root (no password needed on live CD)
# Type: root

# 2. Run the setup script
setup-alpine

# Follow the prompts:
# - Keyboard: us (or your layout)
# - Hostname: collabos
# - Network: eth0, dhcp
# - Timezone: Your timezone
# - Proxy: none
# - Mirror: f (fastest)
# - SSH: openssh
# - Disk: sda, sys
# - Confirm: y

# 3. Reboot
reboot
```

---

## 🛠️ Step 4: Install Development Tools (5 minutes)

After reboot, login as root:

```bash
# Update package index
apk update

# Install essential development tools
apk add \
  build-base \
  git \
  python3 \
  py3-pip \
  python3-dev \
  gcc \
  make \
  cmake \
  vim \
  nano

# Install networking tools
apk add \
  curl \
  wget \
  openssh \
  avahi \
  avahi-tools

# Start services
rc-update add avahi-daemon
rc-service avahi-daemon start
```

---

## 🎨 Step 5: Choose Desktop Approach

### Option A: Python + GTK (Easiest, Recommended)

```bash
# Install GTK and Python bindings
apk add \
  gtk+3.0 \
  py3-gobject3 \
  python3-tkinter

# Test
python3 << EOF
import gi
gi.require_version('Gtk', '3.0')
from gi.repository import Gtk
print("GTK works!")
EOF
```

### Option B: X11 + Custom C Window Manager

```bash
# Install X11 and development libraries
apk add \
  xorg-server \
  xf86-video-vesa \
  xf86-input-evdev \
  xinit \
  xorg-server-dev \
  libx11-dev \
  libxft-dev

# Start X11
startx
```

### Option C: Framebuffer + SDL2 (No X11)

```bash
# Install SDL2
apk add \
  sdl2 \
  sdl2-dev \
  sdl2_image \
  sdl2_ttf

# Test framebuffer access
cat /dev/urandom | hexdump | head
```

---

## 💻 Step 6: Set Up Development Environment

```bash
# Create workspace
mkdir -p /root/collabos
cd /root/collabos

# Clone your repo (if you want to reference old code)
git clone https://github.com/PrakharSinghOnGit/collabOS.git bare-metal

# Create new structure
mkdir -p {desktop,collaboration,apps,base}

# Create first Python script
cat > desktop/test-window.py << 'EOF'
#!/usr/bin/env python3
import gi
gi.require_version('Gtk', '3.0')
from gi.repository import Gtk

class CollabOSWindow(Gtk.Window):
    def __init__(self):
        Gtk.Window.__init__(self, title="CollabOS v2.0")
        self.set_default_size(800, 600)

        label = Gtk.Label(label="Welcome to CollabOS!\nLinux-based Edition")
        self.add(label)

win = CollabOSWindow()
win.connect("destroy", Gtk.main_quit)
win.show_all()
Gtk.main()
EOF

chmod +x desktop/test-window.py

# Test it
python3 desktop/test-window.py
```

---

## 🌐 Step 7: Test Networking Between Two VMs

### Terminal 1: Start VM 1

```bash
qemu-system-x86_64 \
  -hda alpine-disk1.qcow2 \
  -m 1024M \
  -netdev user,id=net0,hostfwd=tcp::2222-:22 \
  -device e1000,netdev=net0 \
  -name "CollabOS-VM1"
```

### Terminal 2: Start VM 2

```bash
qemu-system-x86_64 \
  -hda alpine-disk2.qcow2 \
  -m 1024M \
  -netdev user,id=net0,hostfwd=tcp::2223-:22 \
  -device e1000,netdev=net0 \
  -name "CollabOS-VM2"
```

### Test Connection

```bash
# In VM1:
ip addr show  # Note the IP

# In VM2:
ping <VM1_IP>  # Should work on same network
```

---

## 🎯 Next Steps: Build Shared Terminal

Create the shared terminal server:

```bash
cat > collaboration/shared-terminal-server.py << 'EOF'
#!/usr/bin/env python3
"""
CollabOS Shared Terminal Server
Allows multiple users to share the same terminal session
"""
import asyncio
import websockets
import subprocess

connected_clients = set()
terminal_process = None

async def handle_client(websocket, path):
    global terminal_process
    connected_clients.add(websocket)

    try:
        # Start terminal process if not running
        if terminal_process is None:
            terminal_process = subprocess.Popen(
                ['/bin/sh'],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )

        async for message in websocket:
            # Send input to terminal
            terminal_process.stdin.write(message.encode())
            terminal_process.stdin.flush()

            # Broadcast output to all clients
            output = terminal_process.stdout.read(1024)
            for client in connected_clients:
                await client.send(output.decode())
    finally:
        connected_clients.remove(websocket)

async def main():
    print("🚀 CollabOS Shared Terminal Server starting on port 8765...")
    async with websockets.serve(handle_client, "0.0.0.0", 8765):
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(main())
EOF

chmod +x collaboration/shared-terminal-server.py

# Install websockets
apk add py3-websockets

# Test it
python3 collaboration/shared-terminal-server.py
```

---

## 📊 Progress Checklist

- [ ] Alpine Linux downloaded
- [ ] Booted in QEMU
- [ ] Alpine installed to disk
- [ ] Development tools installed
- [ ] Python + GTK working (or chosen alternative)
- [ ] Test window displays
- [ ] Two VMs can communicate
- [ ] Shared terminal server running

---

## 🎉 What's Next?

Once you complete these steps, you'll have:

- ✅ Working Linux base with networking
- ✅ Development environment ready
- ✅ Desktop toolkit chosen
- ✅ Foundation for collaborative features

**Next session:**

- Build CollabOS-branded desktop
- Implement window manager
- Create shared terminal UI
- Add screen sharing

---

## 💡 Tips

### SSH into Alpine for easier development

```bash
# In Alpine VM:
passwd  # Set root password
rc-service sshd start

# From your Mac:
ssh -p 2222 root@localhost  # If using port forwarding
```

### Create disk image for persistence

```bash
# Create 10GB disk
qemu-img create -f qcow2 alpine-disk.qcow2 10G

# Boot with disk
qemu-system-x86_64 \
  -cdrom alpine-virt.iso \
  -hda alpine-disk.qcow2 \
  -m 1024M \
  -boot d
```

### Save your VM state

```bash
# In QEMU monitor (Ctrl+Alt+2):
savevm collabos-snapshot

# Restore later:
loadvm collabos-snapshot
```

---

## 🆘 Troubleshooting

**Q: Alpine won't boot in QEMU**

```bash
# Try adding more memory
-m 2048M

# Or use -nographic for text mode
-nographic
```

**Q: Network doesn't work**

```bash
# In Alpine:
setup-interfaces
rc-service networking restart
```

**Q: Can't install packages**

```bash
# Update repositories
echo "http://dl-cdn.alpinelinux.org/alpine/v3.19/main" > /etc/apk/repositories
echo "http://dl-cdn.alpinelinux.org/alpine/v3.19/community" >> /etc/apk/repositories
apk update
```

---

## 🚀 Ready to Start?

**Time investment:** ~30 minutes to get Alpine running  
**Payoff:** Working OS base with networking TODAY

Let's build CollabOS v2.0! 🎉

---

_The smart way to build an OS: stand on the shoulders of giants (Linux)_
