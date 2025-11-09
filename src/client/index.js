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
import AppSharingClient from "./appsharing.js";

const init = () => {
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

  osjs.boot();

  // Initialize multi-cursor collaboration
  const multiCursor = new MultiCursorClient();

  // We'll initialize app sharing AFTER osjs is fully booted
  let appSharing = null;

  // Listen for desktop ready events
  osjs.on("osjs/desktop:ready", () => initCollaboration());
  osjs.on("osjs/core:started", () => initCollaboration());
  osjs.on("init", () => initCollaboration());

  // Fallback initialization after delay
  setTimeout(() => initCollaboration(), 2000);

  function initCollaboration() {
    if (multiCursor.initialized) return;

    console.log("🎯 initCollaboration called");

    try {
      // Initialize multi-cursor
      multiCursor.init();
      multiCursor.initialized = true;

      // Initialize app sharing AFTER osjs is booted and socket is connected
      setTimeout(() => {
        if (multiCursor.socket && multiCursor.socket.connected) {
          console.log("✅ Socket connected, initializing app sharing...");

          // Create AppSharingClient NOW (after boot)
          appSharing = new AppSharingClient(osjs);
          appSharing.init(multiCursor.socket);

          console.log("✅ Application sharing initialized");
        } else {
          console.error(
            "❌ Socket not connected, retrying app sharing init..."
          );
          setTimeout(() => {
            if (multiCursor.socket && multiCursor.socket.connected) {
              console.log(
                "🔄 Retry: Socket connected, initializing app sharing..."
              );

              appSharing = new AppSharingClient(osjs);
              appSharing.init(multiCursor.socket);

              console.log("✅ Application sharing initialized (retry)");
            } else {
              console.error("❌ Socket still not connected after retry");
            }
          }, 2000);
        }
      }, 1000);
    } catch (error) {
      console.error("❌ Failed to initialize collaboration:", error);
    }
  }
};

window.addEventListener("DOMContentLoaded", () => init());
