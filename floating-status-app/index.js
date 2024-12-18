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

  // Log that we're loading the floating window
  console.log("Main process: Loading floating window.");

  floatingWindow.loadURL('http://localhost:3005/floating.html');
  
  // Log after the window is loaded
  floatingWindow.webContents.once('did-finish-load', () => {
    console.log("Main process: Floating window loaded.");
  });

  //TODO: Remove this line before production
  floatingWindow.webContents.openDevTools();

  // Handle close all windows event
  ipcMain.on('close-all-windows', () => {
    console.log("Main process: Closing all windows.");
    floatingWindow.close();  // Close the floating window
  });
});
