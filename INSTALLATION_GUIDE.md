# CollabOS Phase 1 Implementation Guide

## Current Status

✅ **Completed:**

1. Project documentation and status report
2. Virtual disk images created (alpine-vm1.qcow2, alpine-vm2.qcow2)
3. VM boot scripts created
4. Shared terminal server/client implementation
5. Complete testing framework

## Next Steps - Installation Process

### Step 1: Install Alpine Linux on VM1 (30 minutes)

```bash
cd /Users/shaansingh/dev/projects/collabOS/alpine

# Start VM1 installation
./boot-vm1-install.sh
```

**Installation prompts:**

1. Login: `root` (no password)
2. Run: `setup-alpine`
3. Keyboard: `us`
4. Hostname: `collabos-vm1`
5. Network interface: `eth0`
6. IP address: `dhcp`
7. Root password: `[set a password]`
8. Timezone: `UTC`
9. Proxy: `none`
10. Mirror: `f` (fastest)
11. SSH: `openssh`
12. Disk: `sda`
13. Mode: `sys`
14. Erase: `y`
15. Shutdown: `poweroff`

### Step 2: Install Alpine Linux on VM2 (30 minutes)

```bash
# Start VM2 installation
./boot-vm2-install.sh
```

Follow same process, use hostname: `collabos-vm2`

### Step 3: Setup Development Environment on VM1 (15 minutes)

```bash
# Boot VM1
./boot-vm1.sh

# Or SSH from another terminal
ssh root@localhost -p 2221

# Copy and run setup script
# (First, SCP the setup script from host)
```

On host machine:

```bash
scp -P 2221 /Users/shaansingh/dev/projects/collabOS/alpine/setup-vm.sh root@localhost:/root/
```

On VM1:

```bash
chmod +x /root/setup-vm.sh
/root/setup-vm.sh
```

### Step 4: Setup Development Environment on VM2 (15 minutes)

```bash
# Boot VM2 (in another terminal)
cd /Users/shaansingh/dev/projects/collabOS/alpine
./boot-vm2.sh

# Or SSH
ssh root@localhost -p 2222
```

On host machine:

```bash
scp -P 2222 /Users/shaansingh/dev/projects/collabOS/alpine/setup-vm.sh root@localhost:/root/
```

On VM2:

```bash
chmod +x /root/setup-vm.sh
/root/setup-vm.sh
```

### Step 5: Deploy Shared Terminal Code (10 minutes)

```bash
# Copy server and client to both VMs
cd /Users/shaansingh/dev/projects/collabOS/collaboration/shared-terminal

# Copy to VM1
scp -P 2221 server.py client.py README.md root@localhost:/root/collabos/

# Copy to VM2
scp -P 2222 server.py client.py README.md root@localhost:/root/collabos/
```

### Step 6: Test Shared Terminal (10 minutes)

**Terminal 1 - Start server on VM1:**

```bash
ssh root@localhost -p 2221
cd /root/collabos
python3 server.py
```

**Terminal 2 - Connect client on VM1:**

```bash
ssh root@localhost -p 2221
cd /root/collabos
python3 client.py --server ws://localhost:8765
```

**Terminal 3 - Connect client on VM2:**

```bash
ssh root@localhost -p 2222
cd /root/collabos
python3 client.py --server ws://10.0.2.2:8765
```

Note: `10.0.2.2` is the host machine from QEMU's perspective

**Test commands:**

```bash
# Type in any terminal:
ls -la
pwd
echo "Hello from CollabOS!"
whoami
uname -a
```

All commands should execute and output appear in all connected clients!

## Expected Timeline

| Task                  | Duration | Cumulative |
| --------------------- | -------- | ---------- |
| Install VM1           | 30 min   | 30 min     |
| Install VM2           | 30 min   | 1 hour     |
| Setup VM1 environment | 15 min   | 1h 15m     |
| Setup VM2 environment | 15 min   | 1h 30m     |
| Deploy code           | 10 min   | 1h 40m     |
| Test collaboration    | 10 min   | 1h 50m     |
| Documentation         | 10 min   | 2 hours    |

**Total: ~2 hours for complete Phase 1 implementation**

## Alternative: Quick Test on Host (5 minutes)

Before setting up VMs, test locally:

```bash
cd /Users/shaansingh/dev/projects/collabOS/collaboration/shared-terminal

# Install websockets if needed
pip3 install websockets

# Terminal 1: Start server
python3 server.py

# Terminal 2: Start client 1
python3 client.py

# Terminal 3: Start client 2
python3 client.py

# Type in any client, see output in all!
```

## Troubleshooting

### QEMU not found

```bash
brew install qemu
```

### ISO not found

Download Alpine Linux:

```bash
cd /Users/shaansingh/dev/projects/collabOS
curl -LO https://dl-cdn.alpinelinux.org/alpine/v3.19/releases/x86_64/alpine-virt-3.19.0-x86_64.iso
```

### Can't SSH to VM

- Wait 30 seconds after VM boots
- Check VM is running: `ps aux | grep qemu`
- Verify SSH port: `lsof -i :2221` or `lsof -i :2222`

### Websockets not found on VM

```bash
# On the VM
pip3 install --break-system-packages websockets
```

### Can't connect client to server

- Verify server is running: `ps aux | grep server.py`
- Check firewall (usually not an issue in QEMU)
- Use `10.0.2.2` from VM to reach host

## Success Criteria

✅ Both VMs boot successfully  
✅ Can SSH to both VMs from host  
✅ Development tools installed on both  
✅ Server runs on one VM  
✅ Clients connect from both VMs  
✅ Commands typed in one VM execute and display on other VM  
✅ Real-time synchronization (< 100ms latency)  
✅ Multiple simultaneous users supported

## What's Next (Phase 2)

After Phase 1 is complete:

1. Custom GTK desktop environment
2. Window manager for CollabOS
3. Graphical application framework
4. Screen sharing capabilities
5. File synchronization
6. Collaborative text editor

## Getting Help

- Check logs: Look at terminal output for errors
- Review documentation: `cat README.md` in each directory
- Test incrementally: Don't skip steps
- Verify each component: Test server alone, then add clients

---

**Ready to start? Run:**

```bash
cd /Users/shaansingh/dev/projects/collabOS/alpine
./boot-vm1-install.sh
```

Good luck! 🚀
