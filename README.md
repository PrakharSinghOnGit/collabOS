# CollabOS - Collaborative Operating System

A real-time collaborative web-based operating system built on OS.js, enabling multiple users to share a desktop environment with synchronized cursor movements.

## Overview

CollabOS adds real-time multi-user collaboration features to a Web Based OS. Users can join the same desktop session and see each other's cursors moving in real-time, with automatic color assignment and inactive cursor hiding.

## Features

- Real-time multi-cursor collaboration using Socket.IO
- Automatic color assignment (10 unique colors)
- Inactive cursor hiding (3-second timeout with fade effect)
- Custom cursor visualization replacing default system cursors
- Manual login authentication
- Customized login screen with backdrop blur
- OS.js desktop environment with full window management

## Requirements

- Node.js 24.9.0 or compatible version
- npm or Bun package manager
- Modern web browser with WebSocket support

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd collabOS
```

### 2. Install dependencies

Using npm:

```bash
npm install
```

Using Bun:

```bash
bun install
```

### 3. Build the project

The build process requires the OpenSSL legacy provider for compatibility with Webpack 4:

```bash
NODE_OPTIONS=--openssl-legacy-provider npm run build
```

### 4. Start the server

```bash
npm run serve
```

The server will start on port 8000 by default.

### 5. Access the application

Open your browser and navigate to:

```
http://localhost:8000
```

For local network access, find your local IP address:

```bash
# macOS/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

Then access from other devices on the same network:

```
http://192.168.x.x:8000
```

## Docker Installation (Alternative)

### Build the Docker image

```bash
docker build -t collabos .
```

### Run the container

```bash
docker run -d -p 8000:8000 --name collabos collabos
```

### Access the application

```
http://localhost:8000
```

### Stop the container

```bash
docker stop collabos
docker rm collabos
```

## Usage

### Login Credentials

Default credentials for testing:

- **Username**: `demo`
- **Password**: `demo`

You can configure additional users in `src/server/config.js`.

### Multi-Cursor Collaboration

1. Open CollabOS in multiple browser windows or tabs
2. Log in to each instance
3. Each user gets a unique colored cursor (blue, red, green, yellow, etc.)
4. Move your cursor to see it synchronized across all sessions
5. Inactive cursors fade out after 3 seconds of no movement

### Desktop Features

CollabOS includes all standard OS.js features:

- Window management (minimize, maximize, close)
- File manager
- Text editor
- Settings panel
- Application menu

## Architecture

### Server Components

- **src/server/index.js**: Main server entry point with Socket.IO integration
- **src/server/config.js**: Server configuration and user management
- Socket.IO server attached to OS.js HTTP server
- Participant tracking with color assignment
- Real-time cursor event broadcasting

### Client Components

- **src/client/index.js**: OS.js client bootstrap and multi-cursor initialization
- **src/client/multicursor.js**: Multi-cursor client implementation
  - Cursor overlay management
  - Socket.IO connection handling
  - Normalized coordinate system (0-1 range)
  - Inactive cursor timeout management
- **src/client/index.scss**: Global styles including cursor hiding
- **src/client/config.js**: Client configuration

### Communication Protocol

The system uses Socket.IO for real-time communication:

- `connect`: Initial connection establishment
- `participants:update`: List of all active participants with colors
- `cursor:joined`: New participant joined
- `cursor:move`: Cursor position update (normalized x, y coordinates)
- `cursor:state`: Cursor state changes (down, up)
- `cursor:left`: Participant disconnected
- `disconnect`: Connection closed

## Configuration

### Port Configuration

Edit `src/server/config.js` to change the server port:

```javascript
module.exports = {
  port: 8000, // Change this value
  // ...
};
```

### Color Palette

The cursor colors are defined in `src/client/multicursor.js`:

```javascript
this.colors = [
  "#3b82f6", // Blue
  "#ef4444", // Red
  "#10b981", // Green
  // ... add more colors
];
```

### Inactive Timeout

Adjust the cursor inactivity timeout in `src/client/multicursor.js`:

```javascript
this.INACTIVE_TIMEOUT = 3000; // milliseconds
```

## Troubleshooting

### Socket.IO connection errors

If you see 404 errors for `/socket.io/`, ensure:

1. The server is running on the correct port
2. The build completed successfully
3. Clear browser cache and reload

### Build errors with Node.js

If you encounter OpenSSL errors during build:

```bash
NODE_OPTIONS=--openssl-legacy-provider npm run build
```

This is required for Node.js versions 17+ with Webpack 4.

### Cursor not appearing

1. Check browser console for errors
2. Verify Socket.IO connection status
3. Try opening in a different browser window
4. Check that JavaScript is enabled

### Port already in use

If port 8000 is busy:

1. Stop other processes using the port
2. Or change the port in `src/server/config.js`

## Development

### Watch mode

For development with auto-rebuild:

```bash
NODE_OPTIONS=--openssl-legacy-provider npm run watch
```

## Technology Stack

- **OS.js 3.1.12**: Web desktop framework
- **Socket.IO 4.8.1**: Real-time WebSocket communication
- **Express**: HTTP server (embedded in OS.js)
- **Webpack 4**: Module bundler
- **Node.js**: Runtime environment

## Known Issues

- Webpack 4 requires OpenSSL legacy provider in Node.js 17+
- Large OS.js node_modules (~500MB)
- Cursor position slightly off during rapid movement (throttled for performance)
