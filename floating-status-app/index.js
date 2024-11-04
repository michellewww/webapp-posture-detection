const { app, BrowserWindow } = require('electron');
const path = require('path');

let floatingWindow;

app.on('ready', () => {
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
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
