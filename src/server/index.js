const {
  Core,
  CoreServiceProvider,
  PackageServiceProvider,
  VFSServiceProvider,
  AuthServiceProvider,
  SettingsServiceProvider,
} = require("@osjs/server");

const config = require("./config.js");
const osjs = new Core(config, {});

osjs.register(CoreServiceProvider, { before: true });
osjs.register(PackageServiceProvider);
osjs.register(VFSServiceProvider);
osjs.register(AuthServiceProvider);
osjs.register(SettingsServiceProvider);

const shutdown = (signal) => (error) => {
  if (error instanceof Error) {
    console.error(error);
  }

  osjs.destroy(() => process.exit(signal));
};

process.on("SIGTERM", shutdown(0));
process.on("SIGINT", shutdown(0));
process.on("exit", shutdown(0));

osjs
  .boot()
  .then(() => {
    // Get the actual HTTP server from osjs
    // OS.js stores it in osjs.httpServer
    const httpServer = osjs.httpServer;

    if (!httpServer) {
      console.error("Could not find HTTP server!");
      return;
    }

    console.log("Socket.IO server initializing...");

    // Initialize Socket.IO
    const { Server } = require("socket.io");
    const io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    // Track participants and their colors
    const participants = new Map();
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#FFA07A",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E2",
      "#F8B739",
      "#52C77A",
    ];
    let colorIndex = 0;

    io.on("connection", (socket) => {
      console.log(`User connected: ${socket.id}`);

      // Assign color to new participant
      const userColor = colors[colorIndex % colors.length];
      colorIndex++;

      participants.set(socket.id, {
        id: socket.id,
        color: userColor,
      });

      // Send current participants to new user
      socket.emit("participants:update", Array.from(participants.values()));

      // Notify others about new participant
      socket.broadcast.emit("cursor:joined", {
        id: socket.id,
        color: userColor,
      });

      // Handle cursor movement
      socket.on("cursor:move", (data) => {
        socket.broadcast.emit(
          "cursor:move",
          Object.assign({}, data, {
            id: socket.id,
            color: participants.get(socket.id).color,
          })
        );
      });

      // Handle cursor state changes (click, etc.)
      socket.on("cursor:state", (data) => {
        socket.broadcast.emit(
          "cursor:state",
          Object.assign({}, data, {
            id: socket.id,
          })
        );
      });

      // ============================================
      // Application Sharing Events
      // ============================================

      // Application launched
      socket.on("app:launch", (data) => {
        console.log(`App launched by ${socket.id}:`, data.appName);
        socket.broadcast.emit("app:launched", data);
      });

      // Application closed
      socket.on("app:close", (data) => {
        console.log(`App closed by ${socket.id}:`, data.appId);
        socket.broadcast.emit("app:closed", data);
      });

      // Window moved/resized
      socket.on("window:move", (data) => {
        socket.broadcast.emit("window:moved", data);
      });

      // Window state changed
      socket.on("window:state", (data) => {
        socket.broadcast.emit("window:state", data);
      });

      // Application state update
      socket.on("app:state", (data) => {
        socket.broadcast.emit("app:state", data);
      });

      // Input event
      socket.on("app:input", (data) => {
        socket.broadcast.emit("app:input", data);
      });

      // Content update (for text editors, etc.)
      socket.on("app:content", (data) => {
        console.log(`Content update from ${socket.id}:`, data.content?.substring(0, 50));
        socket.broadcast.emit("app:content", data);
      });

      // Content snapshot (full content sync)
      socket.on("app:snapshot", (data) => {
        socket.broadcast.emit("app:snapshot", data);
      });

      // Sync request
      socket.on("sync:request", (data) => {
        socket.broadcast.emit("sync:request", data);
      });

      // Sync state
      socket.on("sync:state", (data) => {
        socket.broadcast.emit("sync:state", data);
      });

      // ============================================
      // End Application Sharing Events
      // ============================================

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        participants.delete(socket.id);
        socket.broadcast.emit("cursor:left", { id: socket.id });
      });
    });

    console.log("CollabOS multi-cursor collaboration enabled");
  })
  .catch(shutdown(1));
