import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import isDev from 'electron-is-dev';

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

// Adicionando o handler para o evento 'show-open-dialog'
ipcMain.handle("show-open-dialog", async (event, options) => {
  const result = await dialog.showOpenDialog(options);
  return result.filePaths; // Retorna o caminho selecionado
});