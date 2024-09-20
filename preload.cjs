// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  showOpenDialog: (options) => ipcRenderer.invoke("show-open-dialog", options),
});