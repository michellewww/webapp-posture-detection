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
    focusable: false, // Initially not focusable
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
          focusable: false,
          webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
          },
        });
        floatingWindow.loadURL('http://localhost:3005/floating.html');
      } else {
        // floatingWindow.setBounds({ x: 0, y: 0, width: 100, height: 100 });
        floatingWindow.setSkipTaskbar(true);
        floatingWindow.showInactive();
      }
    } else if (visibility === 'off') {
      console.log("Main process: Hiding floating window.");
      floatingWindow.hide();
    }
  });

  // Allow floating window to gain focus only when clicked
  floatingWindow.on('focus', () => {
    console.log("Main process: Floating window focused.");
    floatingWindow.setFocusable(true);
  });

  floatingWindow.on('blur', () => {
    console.log("Main process: Floating window lost focus.");
    floatingWindow.setFocusable(false);
  });

  // Enable focus during drag
  ipcMain.on('start-drag', () => {
    console.log("Main process: Enabling focus for drag.");
    floatingWindow.setFocusable(true);
  });

  ipcMain.on('stop-drag', () => {
    console.log("Main process: Disabling focus after drag.");
    floatingWindow.setFocusable(false);
  });
});
