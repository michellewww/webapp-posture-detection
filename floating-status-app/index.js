const { app, BrowserWindow, ipcMain } = require('electron');

let floatingWindow;

app.on('ready', () => {
  console.log("Main process: Electron app is ready.");

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
      enableRemoteModule: true,
    },
  });

  console.log("Main process: Loading floating window.");
  floatingWindow.loadURL('http://localhost:3005/floating.html');

  floatingWindow.webContents.once('did-finish-load', () => {
    console.log("Main process: Floating window loaded.");
  });

  // TODO: Remove this line before production
  floatingWindow.webContents.openDevTools();

  // Close floating window on event
  ipcMain.on('close-all-windows', () => {
    console.log("Main process: Closing all windows.");
    floatingWindow.close();
  });

  // Handle window visibility
  ipcMain.on('update-window-visibility', (event, visibility) => {
    if (visibility === 'on') {
      console.log("Main process: Showing floating window.");
      if (floatingWindow.isDestroyed()) {
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
            enableRemoteModule: true,
          },
        });
        floatingWindow.loadURL('http://localhost:3005/floating.html');
      } else {
        floatingWindow.show();
      }
    } else if (visibility === 'off') {
      console.log("Main process: Hiding floating window.");
      floatingWindow.hide();
    }
  });
});
