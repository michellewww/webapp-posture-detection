const { app, BrowserWindow, screen } = require('electron');
const path = require('path');

let floatingWindow;

app.on('ready', () => {
  const { width } = screen.getPrimaryDisplay().workAreaSize;

  // Create the floating window
  floatingWindow = new BrowserWindow({
    width: 50,
    height: 50,
    frame: false,
    alwaysOnTop: true, // Keeps the window on top of others
    transparent: true, // Makes the window transparent
    skipTaskbar: true, // Exclude the floating app from the taskbar
    movable: true, // Ensure the window is movable
    resizable: false, // Prevent resizing
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  // Load the React floating app
  floatingWindow.loadURL('http://localhost:3000/floating');

  // Set initial position
  const padding = 10;
  floatingWindow.setPosition(width - 150 - padding, padding);

  // Prevent minimizing when the main window minimizes
  floatingWindow.on('minimize', (event) => {
    event.preventDefault();
    floatingWindow.show();
  });

  // Prevent closing the floating window independently
  floatingWindow.on('close', (event) => {
    event.preventDefault();
    floatingWindow.hide();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
