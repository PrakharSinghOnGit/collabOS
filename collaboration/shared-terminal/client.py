#!/usr/bin/env python3
"""
CollabOS Shared Terminal Client
Connects to shared terminal server and synchronizes terminal I/O
"""

import asyncio
import websockets
import json
import sys
import tty
import termios
import signal
from datetime import datetime

class TerminalClient:
    def __init__(self, server_url='ws://localhost:8765'):
        self.server_url = server_url
        self.websocket = None
        self.running = True
        self.old_tty_settings = None
        
    async def connect(self):
        """Connect to the shared terminal server"""
        print(f"🔌 Connecting to {self.server_url}...")
        
        try:
            self.websocket = await websockets.connect(self.server_url)
            print("✅ Connected to CollabOS Shared Terminal")
            print("=" * 60)
            print("You are now in a shared terminal session.")
            print("Everything you type will be visible to all connected users.")
            print("Press Ctrl+C to disconnect.")
            print("=" * 60)
            print()
            
            # Setup raw terminal mode
            self.setup_raw_mode()
            
            # Start tasks
            await asyncio.gather(
                self.receive_messages(),
                self.send_input(),
                return_exceptions=True
            )
            
        except websockets.exceptions.WebSocketException as e:
            print(f"❌ Connection error: {e}")
        except Exception as e:
            print(f"❌ Error: {e}")
        finally:
            self.cleanup()
    
    def setup_raw_mode(self):
        """Set terminal to raw mode for character-by-character input"""
        try:
            self.old_tty_settings = termios.tcgetattr(sys.stdin)
            tty.setraw(sys.stdin.fileno())
        except:
            pass  # If not a terminal, skip
    
    def restore_terminal(self):
        """Restore terminal to normal mode"""
        if self.old_tty_settings:
            try:
                termios.tcsetattr(sys.stdin, termios.TCSADRAIN, self.old_tty_settings)
            except:
                pass
    
    async def receive_messages(self):
        """Receive and display messages from server"""
        try:
            async for message in self.websocket:
                data = json.loads(message)
                msg_type = data.get('type')
                
                if msg_type == 'welcome':
                    # Connection confirmed
                    pass
                    
                elif msg_type == 'output':
                    # Terminal output from server
                    output = data.get('data', '')
                    sys.stdout.write(output)
                    sys.stdout.flush()
                    
                elif msg_type == 'pong':
                    # Health check response
                    pass
                    
        except websockets.exceptions.ConnectionClosed:
            print("\n❌ Connection to server lost")
            self.running = False
        except Exception as e:
            print(f"\n❌ Error receiving messages: {e}")
            self.running = False
    
    async def send_input(self):
        """Read user input and send to server"""
        loop = asyncio.get_event_loop()
        
        while self.running:
            try:
                # Read character from stdin (non-blocking)
                char = await loop.run_in_executor(None, sys.stdin.read, 1)
                
                if char:
                    # Send to server
                    message = {
                        'type': 'input',
                        'data': char,
                        'timestamp': datetime.now().isoformat()
                    }
                    await self.websocket.send(json.dumps(message))
                    
            except KeyboardInterrupt:
                self.running = False
                break
            except Exception as e:
                if self.running:
                    print(f"\n❌ Error sending input: {e}")
                break
    
    def cleanup(self):
        """Clean up resources"""
        self.running = False
        self.restore_terminal()
        print("\n👋 Disconnected from shared terminal")

async def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='CollabOS Shared Terminal Client')
    parser.add_argument(
        '--server',
        default='ws://localhost:8765',
        help='WebSocket server URL (default: ws://localhost:8765)'
    )
    
    args = parser.parse_args()
    
    client = TerminalClient(server_url=args.server)
    
    # Setup signal handler
    def signal_handler(sig, frame):
        print("\n⏹️  Interrupted by user")
        client.running = False
    
    signal.signal(signal.SIGINT, signal_handler)
    
    await client.connect()

if __name__ == '__main__':
    print("=" * 60)
    print("CollabOS Shared Terminal Client")
    print("=" * 60)
    
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n⏹️  Client stopped")
