const { ipcRenderer } = require('electron');

// Get references to elements
const menu = document.getElementById('menu');
const threeDotMenu = document.getElementById('three-dot-menu');
const closeButton = document.getElementById('close-button');

// Toggle menu visibility on clicking the three-dot menu
threeDotMenu.addEventListener('click', () => {
  if (menu.style.display === 'none' || menu.style.display === '') {
    menu.style.display = 'block';
  } else {
    menu.style.display = 'none';
  }
});

// Handle close button click
closeButton.addEventListener('click', () => {
  ipcRenderer.send('close-all-windows');
});
