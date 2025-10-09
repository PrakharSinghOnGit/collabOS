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

  // Listen for desktop ready events
  osjs.on("osjs/desktop:ready", () => initMultiCursor());
  osjs.on("osjs/core:started", () => initMultiCursor());
  osjs.on("init", () => initMultiCursor());

  // Fallback initialization after delay
  setTimeout(() => initMultiCursor(), 2000);

  function initMultiCursor() {
    if (multiCursor.initialized) return;

    try {
      multiCursor.init();
      multiCursor.initialized = true;
    } catch (error) {
      console.error("Failed to initialize multi-cursor:", error);
    }
  }
};

window.addEventListener("DOMContentLoaded", () => init());
