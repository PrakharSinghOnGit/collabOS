# CollabOS Application Sharing - Feature Documentation

## Overview

CollabOS now features **real-time application sharing** where all users in a collaborative session can see and interact with the same applications simultaneously. When one user opens an application (like Paint, Text Editor, or any other app), it automatically appears on all connected users' screens. All users can interact with these shared applications, and their actions are synchronized in real-time.

## How It Works

### Architecture

The application sharing system consists of three main components:

1. **Server-Side Relay** (`src/server/index.js`)

   - Broadcasts application launch/close events to all connected clients
   - Relays window position, size, and state changes
   - Forwards user input events (mouse, keyboard) between clients
   - Handles state synchronization for new users joining

2. **Client-Side Application Manager** (`src/client/appsharing.js`)

   - Monitors local application launches and broadcasts them
   - Receives remote application events and replicates them locally
   - Manages window synchronization (position, size, z-index)
   - Forwards input events to shared applications
   - Prevents infinite event loops with suppressEvents flag

3. **Visual Indicators** (`src/client/index.scss`)
   - Blue border around shared applications
   - "👥 Shared" badge on shared windows
   - Status indicator showing "App Sharing Active"

### Event Flow

#### Application Launch

```
User A opens Paint
    ↓
AppSharingClient detects launch
    ↓
Broadcasts "app:launch" to server
    ↓
Server relays to all other clients
    ↓
Other clients auto-launch Paint
    ↓
All users see Paint window
```

#### User Interaction

```
User B clicks in Paint
    ↓
Input event captured
    ↓
Broadcasts "app:input" to server
    ↓
Server relays to all clients
    ↓
Input replicated in everyone's Paint window
    ↓
All users see the result
```

#### Window Movement

```
User C drags window
    ↓
"window:move" event fired
    ↓
Server broadcasts to all
    ↓
Window position synchronized across all clients
```

## Features

### ✅ Implemented

1. **Automatic Application Replication**

   - When any user launches an app, it appears for everyone
   - Maintains unique app instances with synchronized IDs

2. **Window Synchronization**

   - Position (x, y coordinates)
   - Size (width, height)
   - State (minimized, maximized, restored)
   - Z-index (window stacking order)

3. **Input Event Forwarding**

   - Mouse clicks (mousedown, mouseup)
   - Mouse movement (mousemove - throttled)
   - Keyboard input (keydown, keyup with modifiers)

4. **State Synchronization**

   - New users joining receive full state from existing users
   - Applications are launched to match current session
   - Window positions and states applied automatically

5. **Visual Feedback**
1.  **Automatic Application Replication**

    -   When any user launches an app, it appears for everyone
    -   Maintains unique app instances with synchronized IDs

2.  **Window Synchronization**

    -   Position (x, y coordinates)
    -   Size (width, height)
    -   State (minimized, maximized, restored)
    -   Z-index (window stacking order)

3.  **Input Event Forwarding**

    -   Mouse clicks (mousedown, mouseup)
    -   Mouse movement (mousemove - throttled)
    -   Keyboard input (keydown, keyup with modifiers)

4.  **State Synchronization**

    -   New users joining receive full state from existing users
    -   Applications are launched to match current session
    -   Window positions and states applied automatically

5.  **Visual Feedback**

    -   Shared windows have blue border highlight
    -   "👥 Shared" badge appears on window title bars
    -   "App Sharing Active" status indicator in bottom-right

6.  **Event Loop Prevention**
    -   `suppressEvents` flag prevents infinite loops
    -   Remote-triggered actions don't re-broadcast

7.  **Canvas Synchronization (Draw App)**
    -   Real-time drawing synchronization via input event forwarding
    -   Full state synchronization using `toDataURL` on stroke completion
    -   Support for `mousedown`, `mousemove`, `mouseup` on canvas elements

### ⚠️ Limitations

1.  **Application-Specific Content**

    -   Generic input forwarding may not work perfectly for all apps
    -   Complex applications (like Paint with canvas) need custom handlers (Implemented for Draw)
    -   File operations are not synchronized

2.  **Performance**

    -   Input events are throttled to prevent overwhelming network
    -   High-frequency operations (like rapid drawing) may lag

3.  **Application State**
    -   Application internal state is not fully synchronized
    -   Only DOM events are forwarded
    -   Canvas/WebGL content requires special handling

## Usage Instructions

### For Users

1.  **Start CollabOS**

    ```bash
    npm run serve
    ```

2.  **Open Multiple Browser Windows**

    -   Navigate to `http://localhost:8000` in each window
    -   Login with credentials (demo/demo)

3.  **Launch an Application**

    -   Click on any application from the menu
    -   Notice it appears in ALL browser windows
    -   Look for the blue border and "👥 Shared" badge

4.  **Interact with Shared Apps**

    -   Any user can click, type, or interact
    -   Actions are visible to all users in real-time
    -   Move/resize windows - everyone sees the changes

5.  **Close Applications**
    -   Closing an app in one window closes it for everyone

### Visual Indicators

-   **Blue Border**: Indicates a window is shared across all clients
-   **👥 Badge**: Shows "Shared" label on window title bar
-   **Status Dot**: Green pulsing dot in bottom-right indicates app sharing is active

## Technical Details

### Socket.IO Events

| Event          | Direction        | Payload                        | Purpose                     |
| -------------- | ---------------- | ------------------------------ | --------------------------- |
| `app:launch`   | Client → Server  | `{appId, appName, userId}`     | User launched an app        |
| `app:launched` | Server → Clients | `{appId, appName, userId}`     | Notify others to launch app |
| `app:close`    | Client → Server  | `{appId, userId}`              | User closed an app          |
| `app:closed`   | Server → Clients | `{appId, userId}`              | Notify others to close app  |
| `window:move`  | Client → Server  | `{appId, position, dimension}` | Window moved/resized        |
| `window:moved` | Server → Clients | `{appId, position, dimension}` | Update window position      |
| `window:state` | Client → Server  | `{appId, state, data}`         | Window state changed        |
| `app:input`    | Client → Server  | `{appId, type, data}`          | User input in app           |
| `sync:request` | Client → Server  | `{appId, userId}`              | Request current state       |
| `sync:state`   | Client → Server  | `{apps: [...]}`                | Send full state to newcomer |

### Application ID Generation

Each shared application gets a unique ID:

```javascript
`${appName}-${timestamp}-${random9chars}`;
// Example: "Paint-1699294321000-a7x4k9p2q"
```

This ensures:

-   Multiple instances of the same app can coexist
-   Each instance is uniquely trackable
-   IDs are consistent across clients

### Input Event Throttling

Mouse move events are throttled using `requestAnimationFrame`:

```javascript
if (!this.inputThrottle) {
  this.inputThrottle = true;
  requestAnimationFrame(() => {
    this.inputThrottle = false;
    this.broadcastInput(appId, "mousemove", {...});
  });
}
```

This ensures ~60fps maximum update rate, preventing network congestion.

### Event Loop Prevention

The `suppressEvents` flag prevents infinite loops:

```javascript
this.suppressEvents = true;
// ... perform remote-triggered action ...
this.suppressEvents = false;
```

When handling remote events, we set this flag so the action doesn't trigger another broadcast.

## Future Enhancements

### High Priority

2.  **Text Editor Collaboration**

    -   Operational Transformation (OT) for text editing
    -   Cursor position indicators for each user
    -   Conflict resolution for simultaneous edits

3.  **File System Sharing**
    -   Synchronize file operations (create, edit, delete)
    -   Shared file browser state
    -   File upload/download synchronization

### Medium Priority

4.  **Application Permissions**

    -   Owner/participant roles
    -   Read-only mode for certain users
    -   Lock applications to prevent accidental changes

5.  **User Presence Indicators**

    -   Show which user is actively using which app
    -   Highlight active user in window title
    -   Color-coded user indicators

6.  **Performance Optimization**
    -   Delta synchronization (only send changes)
    -   Binary protocol for faster transmission
    -   Compression for large payloads

### Low Priority

7.  **Application-Specific Handlers**

    -   Custom synchronization for music player
    -   Video player synchronization (play/pause/seek)
    -   Calculator result sharing

8.  **Session Recording**

    -   Record collaboration sessions
    -   Replay functionality
    -   Export session history

9.  **Cross-Session Persistence**
    -   Save shared application state
    -   Resume sessions after disconnect
    -   Session history and recovery

## Testing

### Manual Test Procedure

1.  **Two-User Basic Test**

    ```
    - Open two browser windows
    - Login to both
    - User 1: Open Paint
    - Verify: User 2 sees Paint open
    - User 2: Click in Paint
    - Verify: User 1 sees the action
    ```

2.  **Window Management Test**

    ```
    - User 1: Move Paint window
    - Verify: Window moves for User 2
    - User 1: Maximize Paint
    - Verify: Paint maximizes for User 2
    - User 2: Minimize Paint
    - Verify: Paint minimizes for User 1
    ```

3.  **Multiple Applications Test**

    ```
    - User 1: Open Paint
    - User 2: Open Text Editor
    - User 1: Open Settings
    - Verify: All users see all three apps
    - Verify: All windows are marked as shared
    ```

4.  **Late Join Test**
    ```
    - User 1: Open Paint and Text Editor
    - User 2: Join session
    - Verify: User 2 sees both apps automatically
    - Verify: Window positions match
    ```

### Known Issues


3. **Rapid Events Lost**
   - Very fast typing may skip keys
   - Throttling drops some events
   - **Solution**: Use event batching instead of throttling

## Configuration

### Disable Application Sharing

To disable application sharing while keeping multi-cursor:

```javascript
// src/client/index.js
function initCollaboration() {
  multiCursor.init();
  // Comment out these lines:
  // appSharing.init(multiCursor.socket);
}
```

### Adjust Throttling

To change input event frequency:

```javascript
// src/client/appsharing.js
setupContentListeners(element, appId) {
  // Change throttle mechanism or remove it:
  element.addEventListener("mousemove", (e) => {
    // Direct broadcast (no throttle):
    this.broadcastInput(appId, "mousemove", {...});
  });
}
```

### Customize Visual Indicators

To change shared window styling:

```scss
// src/client/index.scss
.osjs-window[data-shared="true"] {
  box-shadow: 0 0 0 3px rgba(255, 0, 0, 0.5) !important; // Red instead of blue
}
```

## Conclusion

CollabOS now provides real-time collaborative application sharing, enabling multiple users to work together in the same desktop environment. While basic functionality is implemented, there's significant room for enhancement, particularly in application-specific synchronization and performance optimization.

The system is designed to be extensible, allowing for custom handlers for different application types. The event-driven architecture ensures loose coupling between components, making it easy to add new features without disrupting existing functionality.

---

**Version**: 1.0.0  
**Last Updated**: November 6, 2025  
**Status**: Beta - Core Features Implemented
