# CollabOS Shared Terminal

Real-time collaborative terminal sharing using WebSockets.

## Overview

This implementation allows multiple users on different VMs to share a single terminal session. All input and output is synchronized in real-time across all connected clients.

## Architecture

```
┌─────────────┐         WebSocket          ┌─────────────┐
│   Client 1  │ ────────────────────────▶ │             │
│   (VM1)     │ ◀──────────────────────── │   Server    │
└─────────────┘                            │   (Host or  │
                                           │    VM1)     │
┌─────────────┐         WebSocket          │             │
│   Client 2  │ ────────────────────────▶ │   /bin/sh   │
│   (VM2)     │ ◀──────────────────────── │   process   │
└─────────────┘                            └─────────────┘
```

## Components

### 1. Server (`server.py`)
- Runs a WebSocket server (default port 8765)
- Spawns a shell process (`/bin/sh`) with pseudo-terminal (PTY)
- Reads output from shell and broadcasts to all clients
- Receives input from clients and writes to shell
- Manages client connections/disconnections

### 2. Client (`client.py`)
- Connects to WebSocket server
- Captures user input character-by-character
- Sends input to server
- Displays output from server
- Handles terminal raw mode for immediate input

## Protocol

Messages are JSON-formatted:

### Client → Server
```json
{
  "type": "input",
  "data": "ls\n",
  "timestamp": "2025-10-08T22:00:00"
}
```

### Server → Client
```json
{
  "type": "output",
  "data": "file1.txt\nfile2.txt\n",
  "timestamp": "2025-10-08T22:00:01"
}
```

### Message Types
- `welcome`: Initial connection message from server
- `input`: User input from client to server
- `output`: Terminal output from server to clients
- `resize`: Terminal resize request
- `ping`/`pong`: Health check

## Usage

### Option 1: Server on Host, Clients on VMs

**On host machine:**
```bash
cd /Users/shaansingh/dev/projects/collabOS/collaboration/shared-terminal
python3 server.py
```

**On VM1 (SSH: localhost:2221):**
```bash
cd /root/collabos/shared-terminal
python3 client.py --server ws://10.0.2.2:8765
```

**On VM2 (SSH: localhost:2222):**
```bash
cd /root/collabos/shared-terminal
python3 client.py --server ws://10.0.2.2:8765
```

Note: `10.0.2.2` is the host machine from QEMU's user-mode networking

### Option 2: Server on VM1, Client on VM2

**On VM1:**
```bash
# Start server
python3 server.py

# In another SSH session, start client
python3 client.py --server ws://localhost:8765
```

**On VM2:**
```bash
# Connect to VM1's server (need VM1's IP)
python3 client.py --server ws://VM1_IP:8765
```

## Installation

### Prerequisites
```bash
# On Alpine Linux VMs
apk add python3 py3-pip

# Install websockets library
pip3 install --break-system-packages websockets
```

### Copy Files to VMs

**Method 1: SCP from host**
```bash
# Copy to VM1
scp -P 2221 server.py client.py root@localhost:/root/collabos/shared-terminal/

# Copy to VM2
scp -P 2222 server.py client.py root@localhost:/root/collabos/shared-terminal/
```

**Method 2: Git clone**
```bash
# On each VM
cd /root/collabos
git clone https://github.com/PrakharSinghOnGit/collabOS.git
cd collabOS/collaboration/shared-terminal
```

## Testing

### Test 1: Single Client
```bash
# Terminal 1: Start server
python3 server.py

# Terminal 2: Start client
python3 client.py

# Type commands in client, see output
```

### Test 2: Multiple Clients
```bash
# Terminal 1: Start server
python3 server.py

# Terminal 2: Start client 1
python3 client.py

# Terminal 3: Start client 2
python3 client.py

# Type in either client, see output in both
```

### Test 3: VM-to-VM
```bash
# VM1: Start server
ssh root@localhost -p 2221
python3 /root/collabos/shared-terminal/server.py

# VM2: Start client
ssh root@localhost -p 2222
python3 /root/collabos/shared-terminal/client.py --server ws://10.0.2.2:8765

# Type commands on VM2, see execution and output in real-time
```

## Features

✅ **Real-time Synchronization**: All input/output appears instantly on all clients  
✅ **Multiple Clients**: Unlimited concurrent users  
✅ **Character-by-character**: Raw terminal mode for immediate feedback  
✅ **PTY Support**: Full terminal features (colors, cursor movement, etc.)  
✅ **Graceful Disconnection**: Handles client connect/disconnect cleanly  
✅ **Cross-VM**: Works across different VMs and host machine  

## Limitations

⚠️ **No Authentication**: Anyone who can reach the server can connect  
⚠️ **No Encryption**: Messages sent in plaintext (use WSS for production)  
⚠️ **Single Shell**: All clients share one shell instance  
⚠️ **Race Conditions**: Simultaneous input from multiple users can interleave  

## Future Enhancements

- [ ] Add authentication (password or token)
- [ ] Support WSS (WebSocket Secure)
- [ ] Multiple shell sessions (one per client)
- [ ] Input arbitration (lock/unlock for typing)
- [ ] Session recording and playback
- [ ] User presence indicators
- [ ] Chat alongside terminal

## Troubleshooting

### Can't connect to server
- Verify server is running: `ps aux | grep server.py`
- Check firewall: `iptables -L`
- Verify port is open: `netstat -tlnp | grep 8765`
- Check URL: Make sure `ws://` prefix is present

### Input not working
- Check terminal raw mode is active
- Verify stdin is a TTY: `python3 -c "import sys; print(sys.stdin.isatty())"`

### Output not appearing
- Check server logs for errors
- Verify WebSocket connection: Look for "Client connected" message
- Check terminal encoding: Should be UTF-8

## Development

### Run with debugging
```bash
# Server with verbose output
python3 -u server.py

# Client with debugging
python3 -u client.py --server ws://localhost:8765
```

### Code Structure
```
server.py
├─ TerminalServer class
│  ├─ start_terminal()      # Fork shell process with PTY
│  ├─ read_terminal_output() # Read from shell, broadcast
│  ├─ handle_client()       # WebSocket connection handler
│  └─ handle_message()      # Process client messages
└─ main()

client.py
├─ TerminalClient class
│  ├─ setup_raw_mode()      # Enable character-by-character input
│  ├─ receive_messages()    # Read from WebSocket, display
│  ├─ send_input()          # Read from stdin, send to server
│  └─ cleanup()             # Restore terminal, disconnect
└─ main()
```

## References

- Python asyncio: https://docs.python.org/3/library/asyncio.html
- Python websockets: https://websockets.readthedocs.io/
- PTY module: https://docs.python.org/3/library/pty.html
- Terminal control: https://docs.python.org/3/library/termios.html

---

**CollabOS Phase 1 - Network Foundation** 🚀
