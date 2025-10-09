//
// This is the client bootstrapping script.
// This is where you can register service providers or set up
// your libraries etc.
//
// https://manual.os-js.org/guide/provider/
// https://manual.os-js.org/install/
// https://manual.os-js.org/resource/official/
//

import {
  Core,
  CoreServiceProvider,
  DesktopServiceProvider,
  VFSServiceProvider,
  NotificationServiceProvider,
  SettingsServiceProvider,
  AuthServiceProvider,
} from "@osjs/client";

import { PanelServiceProvider } from "@osjs/panels";
import { GUIServiceProvider } from "@osjs/gui";
import { DialogServiceProvider } from "@osjs/dialogs";
import config from "./config.js";
import "./index.scss";
import MultiCursorClient from "./multicursor.js";

const init = () => {
  console.log("🚀 CollabOS initializing...");
  const osjs = new Core(config, {});

  // Register your service providers
  osjs.register(CoreServiceProvider);
  osjs.register(DesktopServiceProvider);
  osjs.register(VFSServiceProvider);
  osjs.register(NotificationServiceProvider);
  osjs.register(SettingsServiceProvider, { before: true });
  osjs.register(AuthServiceProvider, { before: true });
  osjs.register(PanelServiceProvider);
  osjs.register(DialogServiceProvider);
  osjs.register(GUIServiceProvider);

  console.log("⚙️ Booting OS.js...");
  osjs.boot();

  // Initialize multi-cursor collaboration
  const multiCursor = new MultiCursorClient();
  console.log("📦 MultiCursorClient created");

  // Listen to multiple possible events to catch desktop ready
  console.log("🎧 Setting up event listeners...");

  // Try different event names that OS.js might use
  osjs.on("osjs/desktop:ready", () => {
    console.log("🖥️ Desktop ready event fired!");
    initMultiCursor();
  });

  osjs.on("osjs/core:started", () => {
    console.log("� Core started event fired!");
    initMultiCursor();
  });

  osjs.on("init", () => {
    console.log("🎬 Init event fired!");
    initMultiCursor();
  });

  // Also try after a delay as fallback
  setTimeout(() => {
    console.log("⏰ Fallback timeout triggered (2s), forcing init...");
    initMultiCursor();
  }, 2000);

  function initMultiCursor() {
    if (multiCursor.initialized) {
      console.log("⚠️ Multi-cursor already initialized, skipping...");
      return;
    }

    console.log("🔍 Checking Socket.IO: window.io =", typeof window.io);

    try {
      console.log("⏰ Initializing multi-cursor NOW...");
      multiCursor.init();
      multiCursor.initialized = true;
    } catch (error) {
      console.error("❌ Failed to initialize multi-cursor:", error);
    }
  }

  console.log("✅ Init complete, waiting for desktop ready...");
};

console.log("🎬 Script loaded, waiting for DOMContentLoaded...");
window.addEventListener("DOMContentLoaded", () => {
  console.log("📄 DOMContentLoaded fired!");
  init();
});
