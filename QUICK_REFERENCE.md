# CollabOS Phase 1 - Quick Reference

## 📁 Project Structure

```
collabOS/
├── alpine/                          # VM management
│   ├── boot-vm1-install.sh         # Install Alpine to VM1
│   ├── boot-vm2-install.sh         # Install Alpine to VM2
│   ├── boot-vm1.sh                 # Run VM1 after install
│   ├── boot-vm2.sh                 # Run VM2 after install
│   ├── setup-vm.sh                 # Dev tools setup script
│   ├── vms/
│   │   ├── alpine-vm1.qcow2       # ✅ Created (10GB)
│   │   └── alpine-vm2.qcow2       # ✅ Created (10GB)
│   └── README.md
│
├── collaboration/
│   └── shared-terminal/            # Phase 1 implementation
│       ├── server.py               # WebSocket server
│       ├── client.py               # WebSocket client
│       ├── test-local.sh           # Local testing
│       └── README.md
│
├── docs/                           # Documentation
│   ├── PIVOT_PLAN.md              # Architecture decision
│   ├── QUICK_START_V2.md          # Detailed guide
│   ├── COMPARISON.md              # Bare-metal vs Linux
│   └── NEXT_STEPS.md
│
├── kernel/                         # Phase 0 (archived)
│   └── [bare-metal code]
│
├── PROJECT_STATUS_PHASE1.md       # ✅ Status report
├── INSTALLATION_GUIDE.md          # ✅ Step-by-step guide
└── README.md

```

## 🚀 Quick Start

### Option 1: Test Locally First (5 minutes)

```bash
cd /Users/shaansingh/dev/projects/collabOS/collaboration/shared-terminal

# Install dependencies
pip3 install websockets

# Terminal 1
python3 server.py

# Terminal 2
python3 client.py

# Terminal 3
python3 client.py

# Type commands and watch magic happen! ✨
```

### Option 2: Full VM Setup (2 hours)

```bash
# 1. Place Alpine ISO in project root
cd /Users/shaansingh/dev/projects/collabOS
# Make sure alpine-virt-3.19.0-x86_64.iso is here

# 2. Install VM1
cd alpine
./boot-vm1-install.sh
# Follow prompts, hostname: collabos-vm1

# 3. Install VM2
./boot-vm2-install.sh
# Follow prompts, hostname: collabos-vm2

# 4. Copy setup script to VMs
scp -P 2221 setup-vm.sh root@localhost:/root/
scp -P 2222 setup-vm.sh root@localhost:/root/

# 5. Run setup on each VM
ssh root@localhost -p 2221
chmod +x /root/setup-vm.sh && /root/setup-vm.sh

# 6. Copy shared terminal code
cd ../collaboration/shared-terminal
scp -P 2221 *.py root@localhost:/root/collabos/
scp -P 2222 *.py root@localhost:/root/collabos/

# 7. Test!
# VM1: python3 /root/collabos/server.py
# VM2: python3 /root/collabos/client.py --server ws://10.0.2.2:8765
```

## 📊 Current Status

### ✅ Completed (100%)

- [x] Project status report (PROJECT_STATUS_PHASE1.md)
- [x] Alpine Linux ISO downloaded
- [x] Virtual disk images created (10GB each)
- [x] Boot scripts created (4 scripts)
- [x] VM setup script created
- [x] Shared terminal server implemented
- [x] Shared terminal client implemented
- [x] Documentation suite complete
- [x] Installation guide created

### 🔄 In Progress (0%)

- [ ] Alpine Linux installation on VM1
- [ ] Alpine Linux installation on VM2

### ⏳ Pending (0%)

- [ ] Development tools installation
- [ ] Shared terminal deployment
- [ ] Two-VM collaboration testing

## 🎯 Phase 1 Goals

| Goal                    | Status  | Notes                          |
| ----------------------- | ------- | ------------------------------ |
| Network between 2 VMs   | Ready   | QEMU networking configured     |
| Data transfer           | Ready   | WebSocket protocol implemented |
| State synchronization   | Ready   | Terminal I/O broadcast system  |
| Real-time collaboration | Ready   | Character-by-character sync    |
| Documentation           | ✅ Done | 2000+ lines of docs            |

## 🔧 Key Commands

```bash
# Boot VMs for installation
./alpine/boot-vm1-install.sh
./alpine/boot-vm2-install.sh

# Boot VMs after installation
./alpine/boot-vm1.sh
./alpine/boot-vm2.sh

# SSH to VMs
ssh root@localhost -p 2221  # VM1
ssh root@localhost -p 2222  # VM2

# Run shared terminal server
python3 /root/collabos/server.py

# Run shared terminal client
python3 /root/collabos/client.py --server ws://10.0.2.2:8765
```

## 📦 Requirements

- QEMU (`brew install qemu`)
- Alpine Linux ISO (alpine-virt-3.19.0-x86_64.iso)
- Python 3 with websockets (`pip3 install websockets`)
- 2GB RAM (1GB per VM)
- 20GB disk space (10GB per VM)

## 🎓 What You'll Learn

- Virtual machine setup and networking
- WebSocket real-time communication
- Terminal multiplexing and PTY handling
- Client-server architecture
- Async I/O with Python asyncio
- Linux system administration

## 🏆 Success Criteria

After completing Phase 1, you should be able to:

1. ✅ Boot two Alpine Linux VMs
2. ✅ SSH into both VMs from host
3. ✅ Run shared terminal server on VM1
4. ✅ Connect client from VM2
5. ✅ Type command on VM2
6. ✅ See command execute and output on both VMs
7. ✅ Multiple users typing simultaneously
8. ✅ Sub-100ms latency

## 📚 Documentation

- **PROJECT_STATUS_PHASE1.md** - Academic project report
- **INSTALLATION_GUIDE.md** - Step-by-step installation
- **alpine/README.md** - VM setup details
- **collaboration/shared-terminal/README.md** - Server/client docs
- **PIVOT_PLAN.md** - Architecture decisions
- **QUICK_START_V2.md** - Comprehensive guide

## 🐛 Common Issues

### QEMU not found

```bash
brew install qemu
```

### ISO not found

```bash
cd /Users/shaansingh/dev/projects/collabOS
curl -LO https://dl-cdn.alpinelinux.org/alpine/v3.19/releases/x86_64/alpine-virt-3.19.0-x86_64.iso
```

### Websockets not installed

```bash
pip3 install websockets
# Or on Alpine VM:
pip3 install --break-system-packages websockets
```

### Can't SSH to VM

- Wait 30 seconds after boot
- Check VM is running: `ps aux | grep qemu`
- Verify port forwarding: `lsof -i :2221`

## 🎉 Next Steps

1. **Now:** Install Alpine Linux on both VMs
2. **Then:** Setup development tools
3. **Finally:** Test shared terminal collaboration
4. **Phase 2:** Build custom desktop environment
5. **Phase 3:** Add screen sharing and file sync

## 📞 Quick Commands Cheatsheet

```bash
# Where am I?
pwd  # Should be /Users/shaansingh/dev/projects/collabOS

# Start VM installation
cd alpine && ./boot-vm1-install.sh

# Test locally first
cd collaboration/shared-terminal && python3 server.py

# Copy files to VM
scp -P 2221 file.txt root@localhost:/root/

# Check VM is running
ps aux | grep qemu

# Check port is open
lsof -i :8765

# Kill stuck process
pkill -f server.py
```

---

**Ready to start? Begin with:**

```bash
cd /Users/shaansingh/dev/projects/collabOS/alpine
./boot-vm1-install.sh
```

Or test locally first:

```bash
cd /Users/shaansingh/dev/projects/collabOS/collaboration/shared-terminal
pip3 install websockets
python3 server.py  # Terminal 1
python3 client.py  # Terminal 2
```

**CollabOS - Building the future of collaborative computing!** 🚀
