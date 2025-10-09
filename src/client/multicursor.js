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
  }

  init() {
    console.log("🎯 Initializing multi-cursor client...");
    console.log("🔍 Checking Socket.IO availability...");
    console.log("window.io exists:", typeof window.io !== "undefined");
    console.log("window.io value:", window.io);

    // Create overlay for remote cursors
    this.createOverlay();

    // Inject cursor styles
    this.injectStyles();

    // Connect to Socket.IO server
    this.connectSocket();

    // Setup local cursor tracking
    this.setupEventListeners();

    console.log("✨ Multi-cursor client initialized");
  }

  createOverlay() {
    console.log("🎨 Creating cursor overlay...");
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
    console.log("✅ Overlay created and appended to body");
    console.log("Overlay element:", this.overlay);
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
    console.log("🔌 Attempting to connect Socket.IO...");

    if (!window.io) {
      console.error("❌ Socket.IO not loaded!");
      console.error("window.io is:", window.io);
      console.error(
        "Available globals:",
        Object.keys(window).filter(
          (k) => k.includes("io") || k.includes("socket")
        )
      );
      return;
    }

    console.log("✅ Socket.IO library found, creating connection...");
    this.socket = window.io();
    console.log("Socket object created:", this.socket);

    this.socket.on("connect", () => {
      this.myId = this.socket.id;
      console.log(`🔗 Connected to collaboration server: ${this.myId}`);
    });

    this.socket.on("participants:update", (participants) => {
      console.log("👥 Current participants:", participants);
    });

    this.socket.on("cursor:joined", (data) => {
      console.log(`👋 User joined: ${data.id}`);
      this.ensureCursor(data.id, data.color);
    });

    this.socket.on("cursor:move", (data) => {
      this.updateRemoteCursor(data);
    });

    this.socket.on("cursor:state", (data) => {
      this.handleRemoteCursorState(data);
    });

    this.socket.on("cursor:left", (data) => {
      console.log(`👋 User left: ${data.id}`);
      this.removeCursor(data.id);
    });

    this.socket.on("disconnect", () => {
      console.log("🔌 Disconnected from collaboration server");
    });
  }

  setupEventListeners() {
    // Track cursor movement with throttling
    document.addEventListener("pointermove", (e) => {
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
      console.log(`➕ Creating cursor for user ${id} with color ${color}`);
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
      console.log(
        `✅ Cursor created for ${id}, total cursors: ${this.cursors.size}`
      );
    }
  }

  updateRemoteCursor(data) {
    this.ensureCursor(data.id, data.color);

    const cursor = this.cursors.get(data.id);
    if (cursor) {
      // Convert normalized coordinates back to pixels
      const x = data.x * window.innerWidth;
      const y = data.y * window.innerHeight;

      cursor.element.style.transform = `translate(${x}px, ${y}px)`;

      // Log occasionally (every 100 moves) to avoid spam
      if (!this.moveCount) this.moveCount = 0;
      this.moveCount++;
      if (this.moveCount % 100 === 0) {
        console.log(
          `🖱️ Updated cursor ${data.id} to (${Math.round(x)}, ${Math.round(y)})`
        );
      }
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
}

// Export the class
export default MultiCursorClient;
