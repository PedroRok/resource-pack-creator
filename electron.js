import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import isDev from 'electron-is-dev';
import fs from 'fs';

// Obter o diretório atual usando import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'), // Certifique-se de que o caminho está correto
      nodeIntegration: true,
    },
  });
  mainWindow.setResizable(false);
  mainWindow.setMenu(null);

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '/out/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => (mainWindow = null));
}

// Menu template
const menu = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open',
        click: () => {
          console.log('Open clicked');
        },
      },
      {
        label: 'Exit',
        click: () => {
          app.quit();
        },
      },
    ],
  },
];

const menuTemplate = Menu.buildFromTemplate(menu);
Menu.setApplicationMenu(menuTemplate);

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});


ipcMain.handle("show-open-dialog", async (event, options) => {
  const result = await dialog.showOpenDialog(options);
  return result.filePaths; // Retorna o caminho selecionado
});

ipcMain.on('save-file', (event, files, toPath) => {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(toPath, file.name);
    fs.writeFile(filePath, Buffer.from(file.data), (err) => {
      if (err) {
        console.error(`Error saving file ${file.name}:`, err);
        event.sender.send('save-file-error', err.message);
      } else {
        console.log(`File ${file.name} saved successfully.`);
        event.sender.send('save-file-success', file.name);
      }
    });
    console.log('File path:', filePath);
  }

  // Aqui você pode adicionar a lógica para salvar os arquivos no sistema de arquivos
});