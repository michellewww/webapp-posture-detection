const { app, BrowserWindow, screen } = require('electron');
const path = require('path');

let floatingWindow;

app.on('ready', () => {
  const { width } = screen.getPrimaryDisplay().workAreaSize;

  floatingWindow = new BrowserWindow({
    width: 50,
    height: 50,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,  // Enabling remote module for more flexible access
    },
  });

  floatingWindow.loadFile(path.join(__dirname, 'floating.html'));
  floatingWindow.webContents.openDevTools(); // Open DevTools for debugging

  const padding = 10;
  floatingWindow.setPosition(width - 150 - padding, padding);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
