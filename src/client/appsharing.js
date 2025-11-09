/**
 * CollabOS Application Sharing Client
 * Handles real-time application state synchronization between multiple users
 */

class AppSharingClient {
  constructor(osjs) {
    this.osjs = osjs;
    this.socket = null;
    this.myId = null;
    this.sharedApps = new Map(); // Map of appId -> app instance
    this.isInitiator = false; // Whether this user initiated an action
    this.suppressEvents = false; // Prevent infinite event loops
  }

  init(socket) {
    this.socket = socket;
    this.myId = socket.id;

    console.log("🚀 Initializing application sharing...");
    console.log("Socket ID:", this.myId);
    console.log("Socket connected:", socket.connected);

    // Add status indicator
    this.createStatusIndicator();

    // Listen for application events from server
    this.setupSocketListeners();

    // Hook into OS.js application lifecycle
    this.hookApplicationEvents();

    // Hook into window management
    this.hookWindowEvents();

    console.log("✅ Application sharing initialized successfully");
  }

  createStatusIndicator() {
    const indicator = document.createElement("div");
    indicator.id = "collab-status";
    indicator.innerHTML = `
      <div class="status-dot"></div>
      <span>App Sharing Active</span>
    `;
    document.body.appendChild(indicator);
  }

  setupSocketListeners() {
    // Application launched by another user
    this.socket.on("app:launched", (data) => {
      if (data.userId === this.myId) return; // Ignore own events
      console.log("📨 Received remote app launch:", data);
      this.handleRemoteAppLaunch(data);
    });

    // Application closed by another user
    this.socket.on("app:closed", (data) => {
      if (data.userId === this.myId) return;
      console.log("Remote app closed:", data);
      this.handleRemoteAppClose(data);
    });

    // Window moved/resized
    this.socket.on("window:moved", (data) => {
      if (data.userId === this.myId) return;
      this.handleRemoteWindowMove(data);
    });

    // Window state changed (minimized, maximized, etc.)
    this.socket.on("window:state", (data) => {
      if (data.userId === this.myId) return;
      this.handleRemoteWindowState(data);
    });

    // Application content/state updated
    this.socket.on("app:state", (data) => {
      if (data.userId === this.myId) return;
      this.handleRemoteAppState(data);
    });

    // Input event from another user (click, keyboard)
    this.socket.on("app:input", (data) => {
      if (data.userId === this.myId) return;
      this.handleRemoteInput(data);
    });

    // Content update from another user (text changes)
    this.socket.on("app:content", (data) => {
      if (data.userId === this.myId) return;
      console.log(
        "📥 Received content update:",
        data.content?.substring(0, 50)
      );
      this.handleRemoteContent(data);
    });

    // Content snapshot from another user
    this.socket.on("app:snapshot", (data) => {
      if (data.userId === this.myId) return;
      this.handleRemoteSnapshot(data);
    });

    // Request full state sync (for new users joining)
    this.socket.on("sync:request", (data) => {
      if (data.userId === this.myId) return;
      this.sendFullState();
    });

    // Receive full state sync
    this.socket.on("sync:state", (data) => {
      if (data.userId === this.myId) return;
      this.applyFullState(data);
    });
  }

  hookApplicationEvents() {
    console.log("🔗 Hooking into OS.js application events");
    console.log("OS.js instance:", this.osjs);
    console.log("OS.js.run function:", typeof this.osjs.run);

    // CRITICAL FIX: Intercept osjs.run() directly instead of relying on events
    const originalRun = this.osjs.run.bind(this.osjs);

    this.osjs.run = async (name, args, options) => {
      console.log("🚀 APPLICATION LAUNCHED VIA osjs.run():", name);

      // Call the original run function
      const app = await originalRun(name, args, options);

      if (app && !this.suppressEvents) {
        console.log("✅ App instance created:", app.metadata.name);

        // Wait for the app to fully initialize
        setTimeout(() => {
          console.log("📡 Broadcasting app launch...");
          this.handleLocalAppLaunch(app);
        }, 100);
      }

      return app;
    };

    console.log("✅ osjs.run() intercepted successfully");

    // Also try the event-based approach as fallback
    this.osjs.on("osjs/application:launched", (app) => {
      console.log("📱 [EVENT] Application launched:", app.metadata.name);
      if (!this.suppressEvents) {
        this.handleLocalAppLaunch(app);
      }
    });

    this.osjs.on("osjs/application:destroy", (app) => {
      console.log("🗑️ Application destroyed:", app.metadata.name);
      if (!this.suppressEvents) {
        this.handleLocalAppClose(app);
      }
    });
  }

  hookWindowEvents() {
    // Hook into window manager events
    this.osjs.on("osjs/window:create", (win) => {
      this.setupWindowHooks(win);
    });
  }

  setupWindowHooks(win) {
    const appId = this.getAppIdFromWindow(win);
    if (!appId) return;

    // Track window movements
    win.on("moved", () => {
      if (this.suppressEvents) return;
      this.broadcastWindowMove(appId, win);
    });

    // Track window resizing
    win.on("resized", () => {
      if (this.suppressEvents) return;
      this.broadcastWindowMove(appId, win);
    });

    // Track window state changes
    win.on("minimize", () => {
      if (this.suppressEvents) return;
      this.broadcastWindowState(appId, "minimize");
    });

    win.on("maximize", () => {
      if (this.suppressEvents) return;
      this.broadcastWindowState(appId, "maximize");
    });

    win.on("restore", () => {
      if (this.suppressEvents) return;
      this.broadcastWindowState(appId, "restore");
    });

    win.on("raise", () => {
      if (this.suppressEvents) return;
      this.broadcastWindowState(appId, "raise", { zIndex: win.state.zIndex });
    });

    // Hook into window content for input events
    this.hookWindowContent(win, appId);
  }

  hookWindowContent(win, appId) {
    // Wait for window to be ready
    setTimeout(() => {
      console.log("🔧 Hooking window content for:", appId);

      const iframe = win.$element?.querySelector("iframe");
      const contentDiv = win.$content;

      if (iframe) {
        // For iframe-based apps
        try {
          const iframeDoc =
            iframe.contentDocument || iframe.contentWindow.document;
          console.log("📄 Found iframe, setting up listeners");
          this.setupContentListeners(iframeDoc, appId);
          this.setupContentMonitoring(iframeDoc, appId);
        } catch (e) {
          console.warn("Cannot access iframe content:", e);
        }
      } else if (contentDiv) {
        // For regular content
        console.log("📄 Found content div, setting up listeners");
        this.setupContentListeners(contentDiv, appId);
        this.setupContentMonitoring(contentDiv, appId);
      }

      // Special handling for textarea/input elements (like Notepad)
      this.setupTextEditorSync(win, appId);
    }, 500); // Increased delay to ensure app is fully loaded
  }

  setupTextEditorSync(win, appId) {
    console.log("🎯 Setting up text editor sync for:", appId);

    // Find all text inputs, textareas, and contenteditable elements
    const findTextElements = (root) => {
      const elements = [];

      // Check iframe content
      const iframe = root.$element?.querySelector("iframe");
      if (iframe) {
        try {
          const doc = iframe.contentDocument || iframe.contentWindow.document;
          const found = doc.querySelectorAll(
            "textarea, input[type='text'], [contenteditable='true']"
          );
          elements.push(...found);
          console.log(`📄 Found ${found.length} text elements in iframe`);
        } catch (e) {
          console.warn("Cannot access iframe for text elements:", e);
        }
      }

      // Check regular content
      if (root.$content) {
        const found = root.$content.querySelectorAll(
          "textarea, input[type='text'], [contenteditable='true']"
        );
        elements.push(...found);
        console.log(`📄 Found ${found.length} text elements in content div`);
      }

      // Also check entire window element
      if (root.$element) {
        const found = root.$element.querySelectorAll(
          "textarea, input[type='text'], [contenteditable='true']"
        );
        elements.push(...found);
        console.log(`📄 Found ${found.length} text elements in window element`);
      }

      return elements;
    };

    const setupElements = () => {
      const textElements = findTextElements(win);
      console.log(
        `📝 TOTAL: Found ${textElements.length} text elements in ${appId}`
      );

      if (textElements.length === 0) {
        console.warn("⚠️ No text elements found yet, will retry...");
        return false;
      }

      textElements.forEach((element, index) => {
        console.log(
          `✅ Setting up sync for text element ${index}:`,
          element.tagName,
          element.className
        );

        // Track content changes
        const syncContent = () => {
          if (this.suppressEvents) return;

          const content =
            element.value || element.textContent || element.innerText || "";
          console.log(
            `📤 Broadcasting content update for ${appId}:`,
            content.substring(0, 50)
          );

          this.socket.emit("app:content", {
            appId: appId,
            userId: this.myId,
            elementIndex: index,
            content: content,
            timestamp: Date.now(),
          });
        };

        // Listen for ALL possible input events
        element.addEventListener("input", syncContent);
        element.addEventListener("change", syncContent);
        element.addEventListener("keyup", syncContent);
        element.addEventListener("keydown", syncContent);
        element.addEventListener("paste", syncContent);

        console.log("✅ Event listeners attached to element", index);

        // Store reference for later updates
        if (!this.textElements) this.textElements = new Map();
        if (!this.textElements.has(appId)) this.textElements.set(appId, []);
        this.textElements.get(appId).push(element);
      });

      return true;
    };

    // Try multiple times with increasing delays
    const delays = [500, 1000, 1500, 2000, 3000];
    delays.forEach((delay) => {
      setTimeout(() => {
        console.log(
          `🔍 Attempting to find text elements (delay: ${delay}ms)...`
        );
        const success = setupElements();
        if (success) {
          console.log(`✅ Successfully set up text sync after ${delay}ms`);
        }
      }, delay);
    });
  }

  setupContentMonitoring(element, appId) {
    // Monitor for DOM mutations (content changes)
    const observer = new MutationObserver((mutations) => {
      if (this.suppressEvents) return;

      // Broadcast content snapshot
      this.broadcastContentSnapshot(appId, element);
    });

    observer.observe(element, {
      childList: true,
      subtree: true,
      characterData: true,
      characterDataOldValue: true,
    });

    // Store observer for cleanup
    if (!this.contentObservers) this.contentObservers = new Map();
    this.contentObservers.set(appId, observer);
  }

  broadcastContentSnapshot(appId, element) {
    // Throttle snapshots
    if (this.snapshotThrottle) return;

    this.snapshotThrottle = true;
    setTimeout(() => {
      this.snapshotThrottle = false;

      if (this.suppressEvents) return;

      // Get serializable content
      const content = element.innerHTML || element.textContent;

      this.socket.emit("app:snapshot", {
        appId: appId,
        userId: this.myId,
        content: content,
        timestamp: Date.now(),
      });
    }, 500); // Throttle to every 500ms
  }

  setupContentListeners(element, appId) {
    // Mouse events
    element.addEventListener("mousedown", (e) => {
      if (this.suppressEvents) return;
      this.broadcastInput(appId, "mousedown", {
        x: e.clientX,
        y: e.clientY,
        button: e.button,
      });
    });

    element.addEventListener("mouseup", (e) => {
      if (this.suppressEvents) return;
      this.broadcastInput(appId, "mouseup", {
        x: e.clientX,
        y: e.clientY,
        button: e.button,
      });
    });

    element.addEventListener("mousemove", (e) => {
      if (this.suppressEvents) return;
      // Throttle mouse move events
      if (!this.inputThrottle) {
        this.inputThrottle = true;
        requestAnimationFrame(() => {
          this.inputThrottle = false;
          this.broadcastInput(appId, "mousemove", {
            x: e.clientX,
            y: e.clientY,
          });
        });
      }
    });

    // Keyboard events
    element.addEventListener("keydown", (e) => {
      if (this.suppressEvents) return;
      this.broadcastInput(appId, "keydown", {
        key: e.key,
        code: e.code,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        metaKey: e.metaKey,
      });
    });

    element.addEventListener("keyup", (e) => {
      if (this.suppressEvents) return;
      this.broadcastInput(appId, "keyup", {
        key: e.key,
        code: e.code,
      });
    });
  }

  handleLocalAppLaunch(app) {
    console.log("🚀 handleLocalAppLaunch called");
    console.log("App metadata:", app.metadata);

    const appId = this.generateAppId(app);
    console.log("Generated app ID:", appId);

    this.sharedApps.set(appId, app);
    console.log("Shared apps count:", this.sharedApps.size);

    // Mark window as shared
    if (app.windows && app.windows.length > 0) {
      app.windows[0]._collabAppId = appId;
      this.markWindowAsShared(app.windows[0]);
      console.log("Window marked as shared");

      // CRITICAL: Set up aggressive content sync
      setTimeout(() => {
        this.setupAggressiveContentSync(app.windows[0], appId);
      }, 500);
    }

    // Broadcast to other users
    console.log("📡 Broadcasting app:launch event");
    console.log("Socket connected:", this.socket.connected);

    this.socket.emit("app:launch", {
      appId: appId,
      appName: app.metadata.name,
      userId: this.myId,
      timestamp: Date.now(),
    });

    console.log("✅ App launch broadcast complete");
  }

  markWindowAsShared(win) {
    if (win.$element) {
      win.$element.setAttribute("data-shared", "true");
    }
  }

  handleLocalAppClose(app) {
    const appId = this.getAppIdFromApp(app);
    if (!appId) return;

    this.sharedApps.delete(appId);

    // Broadcast to other users
    this.socket.emit("app:close", {
      appId: appId,
      userId: this.myId,
      timestamp: Date.now(),
    });
  }

  async handleRemoteAppLaunch(data) {
    try {
      this.suppressEvents = true;

      console.log("🚀 Launching remote app:", data.appName);

      // Launch the application locally
      const app = await this.osjs.run(data.appName);

      if (app) {
        const appId = data.appId;
        this.sharedApps.set(appId, app);

        // Store reference and mark as shared
        if (app.windows && app.windows.length > 0) {
          app.windows[0]._collabAppId = appId;
          this.markWindowAsShared(app.windows[0]);

          // CRITICAL: Set up content sync immediately
          setTimeout(() => {
            this.setupAggressiveContentSync(app.windows[0], appId);
          }, 500);
        }

        // Request current state from the initiator
        setTimeout(() => {
          this.socket.emit("sync:request", {
            appId: appId,
            userId: this.myId,
          });
        }, 1000);
      }

      this.suppressEvents = false;
    } catch (error) {
      console.error("Failed to launch remote app:", error);
      this.suppressEvents = false;
    }
  }

  // New aggressive content sync method
  setupAggressiveContentSync(win, appId) {
    console.log("🎯 Setting up AGGRESSIVE content sync for:", appId);

    // Method 1: Watch the entire window content for any changes
    const watchContent = () => {
      let lastContent = "";

      const captureContent = () => {
        if (this.suppressEvents) return;

        try {
          // Try to get content from various sources
          let content = "";

          // Check iframe
          const iframe = win.$element?.querySelector("iframe");
          if (iframe) {
            try {
              const doc =
                iframe.contentDocument || iframe.contentWindow.document;
              const textarea = doc.querySelector("textarea");
              const input = doc.querySelector("input[type='text']");

              if (textarea) content = textarea.value;
              else if (input) content = input.value;
              else content = doc.body?.innerText || "";
            } catch (e) {
              console.warn("Cannot access iframe:", e);
            }
          }

          // Check window content
          if (!content && win.$content) {
            const textarea = win.$content.querySelector("textarea");
            const input = win.$content.querySelector("input[type='text']");

            if (textarea) content = textarea.value;
            else if (input) content = input.value;
            else content = win.$content.innerText || "";
          }

          // Only broadcast if content changed
          if (content && content !== lastContent) {
            console.log(
              "📤 Content changed! Broadcasting:",
              content.substring(0, 50)
            );
            lastContent = content;

            this.socket.emit("app:content", {
              appId: appId,
              userId: this.myId,
              content: content,
              timestamp: Date.now(),
            });
          }
        } catch (error) {
          console.error("Error capturing content:", error);
        }
      };

      // Poll for changes every 200ms
      setInterval(captureContent, 200);

      // Also capture immediately
      setTimeout(captureContent, 500);
    };

    // Method 2: Set up event listeners on the entire window
    const setupGlobalListeners = () => {
      const targets = [win.$element, win.$content];

      targets.forEach((target) => {
        if (!target) return;

        console.log("📡 Setting up listeners on:", target);

        // Capture ALL events
        ["input", "change", "keyup", "keydown", "paste", "cut"].forEach(
          (eventType) => {
            target.addEventListener(
              eventType,
              (e) => {
                if (this.suppressEvents) return;

                console.log(
                  `🎹 Event captured: ${eventType} on`,
                  e.target.tagName
                );

                // Get content from the target
                let content = "";
                if (e.target.value !== undefined) {
                  content = e.target.value;
                } else if (e.target.textContent) {
                  content = e.target.textContent;
                }

                if (content) {
                  console.log(
                    "📤 Broadcasting from event:",
                    content.substring(0, 50)
                  );

                  this.socket.emit("app:content", {
                    appId: appId,
                    userId: this.myId,
                    content: content,
                    timestamp: Date.now(),
                  });
                }
              },
              true
            ); // Use capture phase
          }
        );
      });
    };

    // Execute both methods
    watchContent();
    setupGlobalListeners();

    console.log("✅ Aggressive sync active for:", appId);
  }

  handleRemoteAppClose(data) {
    const app = this.sharedApps.get(data.appId);
    if (!app) return;

    this.suppressEvents = true;

    try {
      app.destroy();
      this.sharedApps.delete(data.appId);
    } catch (error) {
      console.error("Failed to close remote app:", error);
    }

    this.suppressEvents = false;
  }

  handleRemoteWindowMove(data) {
    const app = this.sharedApps.get(data.appId);
    if (!app || !app.windows || app.windows.length === 0) return;

    this.suppressEvents = true;

    const win = app.windows[0];

    if (data.position) {
      win.setPosition(data.position);
    }

    if (data.dimension) {
      win.setDimension(data.dimension);
    }

    this.suppressEvents = false;
  }

  handleRemoteWindowState(data) {
    const app = this.sharedApps.get(data.appId);
    if (!app || !app.windows || app.windows.length === 0) return;

    this.suppressEvents = true;

    const win = app.windows[0];

    switch (data.state) {
      case "minimize":
        win.minimize();
        break;
      case "maximize":
        win.maximize();
        break;
      case "restore":
        win.restore();
        break;
      case "raise":
        win.raise();
        if (data.data && data.data.zIndex) {
          win.state.zIndex = data.data.zIndex;
        }
        break;
    }

    this.suppressEvents = false;
  }

  handleRemoteAppState(data) {
    const app = this.sharedApps.get(data.appId);
    if (!app) return;

    // This is where application-specific state updates happen
    // For now, we'll implement a generic approach
    if (app.onRemoteState) {
      app.onRemoteState(data.state);
    }
  }

  handleRemoteInput(data) {
    const app = this.sharedApps.get(data.appId);
    if (!app || !app.windows || app.windows.length === 0) return;

    this.suppressEvents = true;

    const win = app.windows[0];
    const element = win.$content;

    if (!element) {
      this.suppressEvents = false;
      return;
    }

    // Simulate the input event
    const eventType = data.type;
    const eventData = data.data;

    try {
      if (eventType.startsWith("mouse")) {
        const mouseEvent = new MouseEvent(eventType, {
          bubbles: true,
          cancelable: true,
          clientX: eventData.x,
          clientY: eventData.y,
          button: eventData.button || 0,
        });
        element.dispatchEvent(mouseEvent);
      } else if (eventType.startsWith("key")) {
        const keyEvent = new KeyboardEvent(eventType, {
          bubbles: true,
          cancelable: true,
          key: eventData.key,
          code: eventData.code,
          ctrlKey: eventData.ctrlKey,
          shiftKey: eventData.shiftKey,
          altKey: eventData.altKey,
          metaKey: eventData.metaKey,
        });
        element.dispatchEvent(keyEvent);
      }
    } catch (error) {
      console.error("Failed to dispatch remote input:", error);
    }

    this.suppressEvents = false;
  }

  handleRemoteContent(data) {
    console.log("🔄 Applying remote content update for:", data.appId);
    console.log("📦 Content length:", data.content?.length);

    const app = this.sharedApps.get(data.appId);
    if (!app) {
      console.warn("❌ App not found:", data.appId);
      return;
    }

    if (!app.windows || app.windows.length === 0) {
      console.warn("❌ No windows found for app");
      return;
    }

    const win = app.windows[0];
    console.log("✅ Found window for app");

    this.suppressEvents = true;

    try {
      // Try to update content in multiple ways
      let updated = false;

      // Method 1: Update iframe content
      const iframe = win.$element?.querySelector("iframe");
      if (iframe) {
        try {
          const doc = iframe.contentDocument || iframe.contentWindow.document;
          const textarea = doc.querySelector("textarea");
          const input = doc.querySelector("input[type='text']");

          if (textarea) {
            console.log("✍️ Updating iframe textarea");
            textarea.value = data.content;
            textarea.dispatchEvent(new Event("input", { bubbles: true }));
            updated = true;
          } else if (input) {
            console.log("✍️ Updating iframe input");
            input.value = data.content;
            input.dispatchEvent(new Event("input", { bubbles: true }));
            updated = true;
          }
        } catch (e) {
          console.warn("Cannot update iframe:", e);
        }
      }

      // Method 2: Update window content
      if (!updated && win.$content) {
        const textarea = win.$content.querySelector("textarea");
        const input = win.$content.querySelector("input[type='text']");

        if (textarea) {
          console.log("✍️ Updating content textarea");
          textarea.value = data.content;
          textarea.dispatchEvent(new Event("input", { bubbles: true }));
          updated = true;
        } else if (input) {
          console.log("✍️ Updating content input");
          input.value = data.content;
          input.dispatchEvent(new Event("input", { bubbles: true }));
          updated = true;
        }
      }

      if (updated) {
        console.log("✅ Content updated successfully");
      } else {
        console.warn("⚠️ Could not find element to update");
      }
    } catch (error) {
      console.error("❌ Failed to apply remote content:", error);
    }

    this.suppressEvents = false;
  }

  handleRemoteSnapshot(data) {
    const app = this.sharedApps.get(data.appId);
    if (!app || !app.windows || app.windows.length === 0) return;

    this.suppressEvents = true;

    try {
      const win = app.windows[0];
      const contentDiv = win.$content;

      if (contentDiv && data.content) {
        // Update HTML content
        contentDiv.innerHTML = data.content;
      }
    } catch (error) {
      console.error("Failed to apply snapshot:", error);
    }

    this.suppressEvents = false;
  }

  broadcastWindowMove(appId, win) {
    this.socket.emit("window:move", {
      appId: appId,
      userId: this.myId,
      position: {
        left: win.state.position.left,
        top: win.state.position.top,
      },
      dimension: {
        width: win.state.dimension.width,
        height: win.state.dimension.height,
      },
      timestamp: Date.now(),
    });
  }

  broadcastWindowState(appId, state, data = {}) {
    this.socket.emit("window:state", {
      appId: appId,
      userId: this.myId,
      state: state,
      data: data,
      timestamp: Date.now(),
    });
  }

  broadcastInput(appId, type, data) {
    this.socket.emit("app:input", {
      appId: appId,
      userId: this.myId,
      type: type,
      data: data,
      timestamp: Date.now(),
    });
  }

  sendFullState() {
    // Send current state of all shared applications
    const state = {
      userId: this.myId,
      apps: [],
      timestamp: Date.now(),
    };

    this.sharedApps.forEach((app, appId) => {
      const appState = {
        appId: appId,
        appName: app.metadata.name,
      };

      if (app.windows && app.windows.length > 0) {
        const win = app.windows[0];
        appState.window = {
          position: win.state.position,
          dimension: win.state.dimension,
          zIndex: win.state.zIndex,
          minimized: win.state.minimized,
          maximized: win.state.maximized,
        };
      }

      state.apps.push(appState);
    });

    this.socket.emit("sync:state", state);
  }

  async applyFullState(data) {
    console.log("Applying full state from another user:", data);

    // Launch any apps that we don't have
    for (const appState of data.apps) {
      if (!this.sharedApps.has(appState.appId)) {
        try {
          await this.handleRemoteAppLaunch({
            appId: appState.appId,
            appName: appState.appName,
            userId: data.userId,
          });

          // Apply window state
          if (appState.window) {
            setTimeout(() => {
              this.handleRemoteWindowMove({
                appId: appState.appId,
                position: appState.window.position,
                dimension: appState.window.dimension,
              });

              if (appState.window.minimized) {
                this.handleRemoteWindowState({
                  appId: appState.appId,
                  state: "minimize",
                });
              } else if (appState.window.maximized) {
                this.handleRemoteWindowState({
                  appId: appState.appId,
                  state: "maximize",
                });
              }
            }, 800);
          }
        } catch (error) {
          console.error("Failed to sync app:", appState.appName, error);
        }
      }
    }
  }

  generateAppId(app) {
    // Generate unique ID for this app instance
    return `${app.metadata.name}-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }

  getAppIdFromApp(app) {
    if (app.windows && app.windows.length > 0 && app.windows[0]._collabAppId) {
      return app.windows[0]._collabAppId;
    }

    // Fallback: search through shared apps
    for (const [appId, sharedApp] of this.sharedApps.entries()) {
      if (sharedApp === app) {
        return appId;
      }
    }

    return null;
  }

  getAppIdFromWindow(win) {
    return win._collabAppId || null;
  }
}

// Export the class
export default AppSharingClient;
