/**
 * CollabOS Multi-Cursor Client
 * Handles real-time cursor sharing between multiple users
 */

class MultiCursorClient {
  constructor() {
    this.socket = null;
    this.cursors = new Map();
    this.overlay = null;
    this.myId = null;
    this.rafPending = false;
    this.lastPosition = { x: 0, y: 0 };
    this.cursorTimeouts = new Map(); // Track inactivity timeouts
    this.INACTIVE_TIMEOUT = 3000; // Hide cursor after 3 seconds of inactivity
  }

  init() {
    // Hide default cursor globally
    document.body.style.cursor = "none";

    // Create overlay for remote cursors
    this.createOverlay();

    // Inject cursor styles
    this.injectStyles();

    // Connect to Socket.IO server
    this.connectSocket();

    // Setup local cursor tracking
    this.setupEventListeners();
  }

  createOverlay() {
    this.overlay = document.createElement("div");
    this.overlay.id = "multicursor-overlay";
    this.overlay.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      pointer-events: none !important;
      z-index: 999999 !important;
      background: transparent !important;
    `;
    document.body.appendChild(this.overlay);
  }

  injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .remote-cursor {
        position: absolute;
        width: 20px;
        height: 20px;
        pointer-events: none;
        transition: transform 0.05s ease-out;
        will-change: transform;
      }
      
      .remote-cursor svg {
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      }
      
      .remote-cursor-label {
        position: absolute;
        top: 20px;
        left: 10px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 11px;
        white-space: nowrap;
        pointer-events: none;
      }
      
      .remote-cursor.clicking {
        animation: cursorClick 0.3s ease-out;
      }
      
      @keyframes cursorClick {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.3); }
      }
    `;
    document.head.appendChild(style);
  }

  connectSocket() {
    if (!window.io) {
      console.error("❌ Socket.IO not loaded!");
      return;
    }

    this.socket = window.io();

    this.socket.on("connect", () => {
      this.myId = this.socket.id;
    });

    this.socket.on("participants:update", (participants) => {
      const me = participants.find((p) => p.id === this.myId);
      if (me && !this.localCursor) {
        this.createLocalCursor(me.color);
      }
    });

    this.socket.on("cursor:joined", (data) => {
      this.ensureCursor(data.id, data.color);
    });

    this.socket.on("cursor:move", (data) => {
      this.updateRemoteCursor(data);
    });

    this.socket.on("cursor:state", (data) => {
      this.handleRemoteCursorState(data);
    });

    this.socket.on("cursor:left", (data) => {
      this.removeCursor(data.id);
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from collaboration server");
    });
  }

  setupEventListeners() {
    // Track cursor movement with throttling
    document.addEventListener("pointermove", (e) => {
      // Update local cursor position immediately
      if (this.localCursor) {
        this.localCursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }

      if (!this.socket || !this.socket.connected) return;

      if (!this.rafPending) {
        this.rafPending = true;
        requestAnimationFrame(() => {
          this.rafPending = false;

          // Normalize coordinates to 0-1 range
          const x = e.clientX / window.innerWidth;
          const y = e.clientY / window.innerHeight;

          this.lastPosition = { x, y };

          this.socket.emit("cursor:move", {
            x: x,
            y: y,
            timestamp: Date.now(),
          });
        });
      }
    });

    // Track clicks
    document.addEventListener("pointerdown", (e) => {
      if (!this.socket || !this.socket.connected) return;

      this.socket.emit("cursor:state", {
        state: "down",
        timestamp: Date.now(),
      });
    });

    document.addEventListener("pointerup", (e) => {
      if (!this.socket || !this.socket.connected) return;

      this.socket.emit("cursor:state", {
        state: "up",
        timestamp: Date.now(),
      });
    });
  }

  ensureCursor(id, color) {
    if (!this.cursors.has(id)) {
      const cursor = document.createElement("div");
      cursor.className = "remote-cursor";
      cursor.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 2L18 10L10 12L8 18L2 2Z" fill="${color}" stroke="white" stroke-width="1"/>
        </svg>
        <div class="remote-cursor-label" style="background-color: ${color};">
          User
        </div>
      `;
      this.overlay.appendChild(cursor);
      this.cursors.set(id, { element: cursor, color });
    }
  }

  updateRemoteCursor(data) {
    this.ensureCursor(data.id, data.color);

    const cursor = this.cursors.get(data.id);
    if (cursor) {
      // Show cursor (in case it was hidden)
      cursor.element.style.opacity = "1";

      // Convert normalized coordinates back to pixels
      const x = data.x * window.innerWidth;
      const y = data.y * window.innerHeight;

      cursor.element.style.transform = `translate(${x}px, ${y}px)`;

      // Clear existing timeout
      if (this.cursorTimeouts.has(data.id)) {
        clearTimeout(this.cursorTimeouts.get(data.id));
      }

      // Set new timeout to hide cursor after inactivity
      const timeout = setTimeout(() => {
        if (cursor.element) {
          cursor.element.style.opacity = "0";
          cursor.element.style.transition = "opacity 0.5s ease-out";
        }
      }, this.INACTIVE_TIMEOUT);

      this.cursorTimeouts.set(data.id, timeout);

      // Log occasionally (every 100 moves) to avoid spam
      if (!this.moveCount) this.moveCount = 0;
      this.moveCount++;
    }
  }

  handleRemoteCursorState(data) {
    const cursor = this.cursors.get(data.id);
    if (cursor) {
      if (data.state === "down") {
        cursor.element.classList.add("clicking");
        setTimeout(() => {
          cursor.element.classList.remove("clicking");
        }, 300);
      }
    }
  }

  removeCursor(id) {
    const cursor = this.cursors.get(id);
    if (cursor) {
      cursor.element.remove();
      this.cursors.delete(id);
    }
  }

  createLocalCursor(color) {
    this.localCursor = document.createElement("div");
    this.localCursor.className = "local-cursor";
    this.localCursor.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 20px;
      height: 20px;
      pointer-events: none;
      z-index: 9999999;
      will-change: transform;
    `;
    this.localCursor.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 2L18 10L10 12L8 18L2 2Z" fill="${color}" stroke="white" stroke-width="1.5"/>
      </svg>
    `;
    document.body.appendChild(this.localCursor);
  }
}

// Export the class
export default MultiCursorClient;
