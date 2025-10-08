#!/usr/bin/env python3
"""
CollabOS Shared Terminal Server
Broadcasts terminal input/output to all connected clients in real-time
"""

import asyncio
import websockets
import json
import subprocess
import os
import sys
from datetime import datetime
from typing import Set, Dict
import signal
import pty
import select
import termios
import struct
import fcntl

# Connected clients
clients: Set[websockets.WebSocketServerProtocol] = set()

# Terminal process
terminal_process = None
master_fd = None

class TerminalServer:
    def __init__(self, host='0.0.0.0', port=8765):
        self.host = host
        self.port = port
        self.clients = set()
        self.master_fd = None
        self.terminal_pid = None
        
    async def start(self):
        """Start the WebSocket server and terminal process"""
        # Start the terminal subprocess
        self.start_terminal()
        
        # Start WebSocket server
        async with websockets.serve(self.handle_client, self.host, self.port):
            print(f"🚀 CollabOS Shared Terminal Server running on ws://{self.host}:{self.port}")
            print(f"📡 Waiting for clients to connect...")
            
            # Start reading from terminal
            await asyncio.gather(
                self.read_terminal_output(),
                asyncio.Event().wait()  # Run forever
            )
    
    def start_terminal(self):
        """Start a shell process with a pseudo-terminal"""
        self.master_fd, slave_fd = pty.openpty()
        
        # Start shell
        self.terminal_pid = os.fork()
        if self.terminal_pid == 0:
            # Child process
            os.close(self.master_fd)
            
            # Make slave the controlling terminal
            os.setsid()
            fcntl.ioctl(slave_fd, termios.TIOCSCTTY, 0)
            
            # Duplicate slave to stdin/stdout/stderr
            os.dup2(slave_fd, 0)
            os.dup2(slave_fd, 1)
            os.dup2(slave_fd, 2)
            
            if slave_fd > 2:
                os.close(slave_fd)
            
            # Set terminal size
            self.set_terminal_size(self.master_fd, 24, 80)
            
            # Start shell
            os.execvp('/bin/sh', ['/bin/sh'])
        else:
            # Parent process
            os.close(slave_fd)
            
            # Set non-blocking mode
            flag = fcntl.fcntl(self.master_fd, fcntl.F_GETFL)
            fcntl.fcntl(self.master_fd, fcntl.F_SETFL, flag | os.O_NONBLOCK)
            
            print(f"✅ Terminal process started (PID: {self.terminal_pid})")
    
    def set_terminal_size(self, fd, rows, cols):
        """Set terminal window size"""
        size = struct.pack("HHHH", rows, cols, 0, 0)
        fcntl.ioctl(fd, termios.TIOCSWINSZ, size)
    
    async def read_terminal_output(self):
        """Read output from terminal and broadcast to all clients"""
        loop = asyncio.get_event_loop()
        
        while True:
            try:
                # Check if there's data to read
                ready, _, _ = select.select([self.master_fd], [], [], 0.1)
                
                if ready:
                    # Read from terminal
                    data = os.read(self.master_fd, 4096)
                    
                    if data:
                        # Broadcast to all clients
                        message = {
                            'type': 'output',
                            'data': data.decode('utf-8', errors='ignore'),
                            'timestamp': datetime.now().isoformat()
                        }
                        
                        await self.broadcast(message)
                
                await asyncio.sleep(0.01)  # Small delay to prevent CPU spinning
                
            except OSError:
                # Terminal process may have ended
                await asyncio.sleep(0.1)
            except Exception as e:
                print(f"❌ Error reading terminal output: {e}")
                await asyncio.sleep(0.1)
    
    async def handle_client(self, websocket, path):
        """Handle a new client connection"""
        client_id = f"{websocket.remote_address[0]}:{websocket.remote_address[1]}"
        self.clients.add(websocket)
        
        print(f"✅ Client connected: {client_id} (Total: {len(self.clients)})")
        
        # Send welcome message
        await websocket.send(json.dumps({
            'type': 'welcome',
            'message': 'Connected to CollabOS Shared Terminal',
            'client_id': client_id,
            'timestamp': datetime.now().isoformat()
        }))
        
        try:
            async for message in websocket:
                await self.handle_message(websocket, message)
        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            self.clients.remove(websocket)
            print(f"❌ Client disconnected: {client_id} (Total: {len(self.clients)})")
    
    async def handle_message(self, websocket, message):
        """Handle incoming message from client"""
        try:
            data = json.loads(message)
            msg_type = data.get('type')
            
            if msg_type == 'input':
                # Client sent input, write to terminal
                user_input = data.get('data', '')
                
                # Write to terminal
                os.write(self.master_fd, user_input.encode('utf-8'))
                
                # Echo input to all clients (for immediate feedback)
                # The actual output will come from terminal process
                
            elif msg_type == 'resize':
                # Client wants to resize terminal
                rows = data.get('rows', 24)
                cols = data.get('cols', 80)
                self.set_terminal_size(self.master_fd, rows, cols)
                
            elif msg_type == 'ping':
                # Health check
                await websocket.send(json.dumps({
                    'type': 'pong',
                    'timestamp': datetime.now().isoformat()
                }))
                
        except json.JSONDecodeError:
            print(f"⚠️  Invalid JSON received: {message}")
        except Exception as e:
            print(f"❌ Error handling message: {e}")
    
    async def broadcast(self, message):
        """Broadcast message to all connected clients"""
        if self.clients:
            message_str = json.dumps(message)
            await asyncio.gather(
                *[client.send(message_str) for client in self.clients],
                return_exceptions=True
            )
    
    def cleanup(self):
        """Clean up resources"""
        if self.master_fd:
            os.close(self.master_fd)
        if self.terminal_pid:
            os.kill(self.terminal_pid, signal.SIGTERM)

async def main():
    server = TerminalServer(host='0.0.0.0', port=8765)
    
    # Setup signal handlers
    loop = asyncio.get_event_loop()
    for sig in (signal.SIGTERM, signal.SIGINT):
        loop.add_signal_handler(sig, lambda: asyncio.create_task(shutdown(server)))
    
    try:
        await server.start()
    except KeyboardInterrupt:
        print("\n⏹️  Server stopped by user")
    finally:
        server.cleanup()

async def shutdown(server):
    """Gracefully shutdown server"""
    print("\n⏹️  Shutting down server...")
    server.cleanup()
    asyncio.get_event_loop().stop()

if __name__ == '__main__':
    print("=" * 60)
    print("CollabOS Shared Terminal Server")
    print("=" * 60)
    
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n⏹️  Server stopped")
