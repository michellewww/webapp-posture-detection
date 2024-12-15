const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

let floatingWindow;

app.on('ready', () => {
  const { width } = screen.getPrimaryDisplay().workAreaSize;

  floatingWindow = new BrowserWindow({
    width: 100,
    height: 100,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    backgroundColor: '#00000000',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,  // Enabling remote module for more flexible access
    },
  });

  floatingWindow.loadFile(path.join(__dirname, 'floating.html'));
  const padding = 10;
  floatingWindow.setPosition(width - 150 - padding, padding);
});

// Close all windows on receiving the event
ipcMain.on('close-all-windows', () => {
  app.quit();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
