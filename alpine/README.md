# Alpine Linux VM Setup for CollabOS

This directory contains the Alpine Linux virtual machines for CollabOS Phase 1.

## Quick Start

### 1. Prerequisites
- QEMU installed (`brew install qemu` on macOS)
- Alpine Linux ISO downloaded (alpine-virt-3.19.0-x86_64.iso)
- Place ISO in parent directory or set `ISO_PATH` environment variable

### 2. Installation Process

#### Install VM1:
```bash
cd /Users/shaansingh/dev/projects/collabOS/alpine
./boot-vm1-install.sh
```

Follow the on-screen prompts:
- Login: `root` (no password)
- Run: `setup-alpine`
- Hostname: `collabos-vm1`
- Network: `eth0` with DHCP
- Set root password (remember it!)
- Disk: `sda`, mode: `sys`
- After installation: `poweroff`

#### Install VM2:
```bash
./boot-vm2-install.sh
```

Same process as VM1 but use hostname: `collabos-vm2`

### 3. Running VMs (After Installation)

#### Start VM1:
```bash
./boot-vm1.sh
```
- SSH access: `ssh root@localhost -p 2221`

#### Start VM2:
```bash
./boot-vm2.sh
```
- SSH access: `ssh root@localhost -p 2222`

### 4. Post-Installation Setup

Once VMs are installed, install development tools on each:

```bash
# SSH into VM
ssh root@localhost -p 2221  # or 2222 for VM2

# Update package index
apk update

# Install development tools
apk add build-base git python3 py3-pip gcc make

# Install Python networking libraries
pip3 install websockets aiohttp

# Install Avahi for service discovery
apk add avahi avahi-tools dbus

# Start and enable Avahi
rc-update add avahi-daemon
rc-service avahi-daemon start
```

## Directory Structure

```
alpine/
├── boot-vm1-install.sh     # Install Alpine to VM1
├── boot-vm2-install.sh     # Install Alpine to VM2
├── boot-vm1.sh             # Boot VM1 (after install)
├── boot-vm2.sh             # Boot VM2 (after install)
├── vms/
│   ├── alpine-vm1.qcow2    # VM1 disk image (10GB)
│   └── alpine-vm2.qcow2    # VM2 disk image (10GB)
└── README.md               # This file
```

## Network Configuration

Both VMs use QEMU's user-mode networking:
- VM1: SSH forwarded to localhost:2221
- VM2: SSH forwarded to localhost:2222

For VM-to-VM communication in Phase 1, we'll use:
- Option A: Host as relay (VMs connect to host WebSocket server)
- Option B: QEMU socket networking (direct VM-to-VM)

## Troubleshooting

### Can't connect via SSH
- Verify VM is running: check QEMU window
- Verify SSH is installed: `apk add openssh` in VM
- Verify SSH is running: `rc-service sshd start` in VM

### ISO not found
- Check ISO location: should be `../alpine-virt-3.19.0-x86_64.iso`
- Or set environment variable: `export ISO_PATH=/path/to/alpine.iso`

### QEMU not found
- Install QEMU: `brew install qemu` (macOS)
- Verify: `which qemu-system-x86_64`

## Next Steps

After both VMs are installed and configured:
1. Test SSH connectivity to both VMs
2. Install development tools on both
3. Proceed to Phase 1 shared terminal implementation
4. See `/collaboration/shared-terminal/` for code

## References

- Alpine Linux Installation: https://docs.alpinelinux.org/user-handbook/0.1a/Installing/manual.html
- QEMU Documentation: https://www.qemu.org/docs/master/
- CollabOS Main Docs: See `/docs/` directory
