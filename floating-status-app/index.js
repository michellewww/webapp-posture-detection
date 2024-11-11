const { app, BrowserWindow, screen } = require('electron');
const path = require('path');

let floatingWindow;

app.on('ready', () => {
  const { width } = screen.getPrimaryDisplay().workAreaSize;
  
  floatingWindow = new BrowserWindow({
    width: 150,
    height: 150,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  floatingWindow.loadFile('floating.html');
  floatingWindow.setSkipTaskbar(true);

  // Position window in the top-right corner with padding
  const padding = 10;
  floatingWindow.setPosition(width - 150 - padding, padding);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
