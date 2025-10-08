# 🚀 How to Run CollabOS

## Option 1: Quick Test (5 Minutes) - Recommended First!

Test the shared terminal on your local machine before dealing with VMs:

### Step 1: Install websockets
```bash
pip3 install websockets
```

### Step 2: Open 3 terminals

**Terminal 1 - Start the Server:**
```bash
cd /Users/shaansingh/dev/projects/collabOS/collaboration/shared-terminal
python3 server.py
```

You should see:
```
🚀 CollabOS Shared Terminal Server running on ws://0.0.0.0:8765
📡 Waiting for clients to connect...
```

**Terminal 2 - Start Client 1:**
```bash
cd /Users/shaansingh/dev/projects/collabOS/collaboration/shared-terminal
python3 client.py
```

You should see:
```
✅ Connected to CollabOS Shared Terminal
You are now in a shared terminal session.
```

**Terminal 3 - Start Client 2:**
```bash
cd /Users/shaansingh/dev/projects/collabOS/collaboration/shared-terminal
python3 client.py
```

### Step 3: Test it!

Type in **any** terminal:
```bash
ls -la
pwd
echo "Hello from CollabOS!"
whoami
date
```

**All commands will execute and output will appear in BOTH client terminals!** ✨

That's the magic of CollabOS - one shared terminal session across multiple users!

---

## Option 2: Full VM Setup (2 Hours)

If you want to test with actual virtual machines (more impressive demo):

### Step 1: Install Alpine Linux on VM1 (30 min)

```bash
cd /Users/shaansingh/dev/projects/collabOS/alpine
./boot-vm1-install.sh
```

When it boots:
1. Login as `root` (no password needed)
2. Type: `setup-alpine`
3. Answer prompts:
   - Keyboard: `us`
   - Hostname: `collabos-vm1`
   - Interface: `eth0`
   - IP: `dhcp`
   - Root password: (create one)
   - Timezone: `UTC` or your timezone
   - Proxy: `none`
   - Mirror: `f` (fastest)
   - SSH: `openssh`
   - Disk: `sda`
   - Mode: `sys`
   - Erase disk: `y`
4. Wait for installation (5-10 minutes)
5. Type: `poweroff`

### Step 2: Install Alpine Linux on VM2 (30 min)

```bash
./boot-vm2-install.sh
```

Same process as VM1, but use hostname: `collabos-vm2`

### Step 3: Setup Dev Tools on VM1 (10 min)

```bash
# Copy setup script
scp -P 2221 setup-vm.sh root@localhost:/root/

# SSH into VM1
ssh root@localhost -p 2221

# Run setup
chmod +x /root/setup-vm.sh
/root/setup-vm.sh

# Wait for packages to install (5 minutes)
```

### Step 4: Setup Dev Tools on VM2 (10 min)

```bash
# Copy setup script
scp -P 2222 setup-vm.sh root@localhost:/root/

# SSH into VM2
ssh root@localhost -p 2222

# Run setup
chmod +x /root/setup-vm.sh
/root/setup-vm.sh
```

### Step 5: Deploy Shared Terminal Code (5 min)

```bash
cd /Users/shaansingh/dev/projects/collabOS/collaboration/shared-terminal

# Copy to VM1
scp -P 2221 server.py client.py root@localhost:/root/collabos/

# Copy to VM2
scp -P 2222 server.py client.py root@localhost:/root/collabos/
```

### Step 6: Test Collaboration! (5 min)

Open 3 terminals:

**Terminal 1 - Server on VM1:**
```bash
ssh root@localhost -p 2221
cd /root/collabos
python3 server.py
```

**Terminal 2 - Client on VM1:**
```bash
ssh root@localhost -p 2221
cd /root/collabos
python3 client.py --server ws://localhost:8765
```

**Terminal 3 - Client on VM2:**
```bash
ssh root@localhost -p 2222
cd /root/collabos
python3 client.py --server ws://10.0.2.2:8765
```

Now type commands in Terminal 2 or Terminal 3 - they execute and appear in both! 🎉

---

## Common Issues

### "websockets not found"
```bash
pip3 install websockets
```

### "QEMU not found"
```bash
brew install qemu
```

### "Can't SSH to VM"
- Wait 30 seconds after VM boots
- Check VM is running: `ps aux | grep qemu`

### "Connection refused"
- Make sure server is running first
- From VM to host, use `10.0.2.2` not `localhost`

---

## To Stop Everything

**Local test:**
- Press `Ctrl+C` in each terminal

**VM test:**
- Press `Ctrl+C` in client terminals
- Press `Ctrl+C` in server terminal
- In VM terminal, type: `poweroff`

---

## Summary

**Quickest way to see CollabOS in action:**
1. `cd collaboration/shared-terminal`
2. `python3 server.py` (Terminal 1)
3. `python3 client.py` (Terminal 2)
4. `python3 client.py` (Terminal 3)
5. Type commands in Terminal 2 or 3
6. Watch them execute in both! ✨

**Most impressive demo (with VMs):**
- Follow "Option 2" above
- Show that VM1 and VM2 share the same terminal
- Demonstrate real distributed collaboration

---

## What's Next?

After you've tested Phase 1, see:
- **PHASE1_COMPLETE.md** - What's been built
- **PROJECT_STATUS_PHASE1.md** - Full project report
- **INSTALLATION_GUIDE.md** - Detailed setup
- **README.md** - Complete project overview

---

**Have fun collaborating! 🚀**
