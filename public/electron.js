/* eslint-disable */
require('electron-reloader')(module);
const {
  app,
  BrowserWindow,
  globalShortcut,
} = require('electron');

/* eslint-enable */
const path = require('path');

const { ELECTRON_ENV = 'development' } = process.env;
let mainWindow;

async function createWindow() {
  mainWindow = new BrowserWindow({
    backgroundColor: '#fff',
    height: ELECTRON_ENV === 'development' ? 900 : 640,
    resizable: false,
    webPreferences: {
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
      preload: path.join(__dirname, './preload.js'),
    },
    width: ELECTRON_ENV === 'development' ? 1440 : 480,
  });

  if (ELECTRON_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.menuBarVisible = false;
  await mainWindow.loadURL(
    ELECTRON_ENV !== 'development'
      ? `file://${path.join(__dirname, '../build/index.html')}`
      : 'http://localhost:3000',
  );

  if (ELECTRON_ENV !== 'development') {
    globalShortcut.register('CommandOrControl+R', () => null);
    globalShortcut.register('F5', () => null);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

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

app.on('will-quit', () => globalShortcut.unregisterAll());
