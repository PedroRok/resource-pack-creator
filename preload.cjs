// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  saveFile: saveFile,
  showOpenDialog: (options) => ipcRenderer.invoke("show-open-dialog", options),
});

async function saveFile(files, toPath) {

  var serializedFiles = []; // byte blob files
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();
    reader.onload = (e) => {
      serializedFiles.push({
        name: file.name,
        type: file.type,
        size: file.size,
        data: e.target.result,
      });
      if (serializedFiles.length === files.length) {
        ipcRenderer.send("save-file", serializedFiles, toPath);
      }
    };
    console.log(file);
    reader.readAsArrayBuffer(file);
  }
}