const { ipcRenderer } = require('electron');

// Get references to elements
const menu = document.getElementById('menu');
const threeDotMenu = document.getElementById('three-dot-menu');
const closeButton = document.getElementById('close-button');
const statusIcon = document.getElementById('status-icon'); // Reference to the status icon image

// User ID
const userId = 'user123';
let currentInterval = 15 * 1000; // Default interval: 15 seconds

// Log that the floating.js script is loaded
console.log("Renderer process: floating.js script loaded.");

// Toggle menu visibility on clicking the three-dot menu
threeDotMenu.addEventListener('click', () => {
  if (menu.style.display === 'none' || menu.style.display === '') {
    menu.style.display = 'block';
    console.log("Renderer process: Menu is now visible.");
  } else {
    menu.style.display = 'none';
    console.log("Renderer process: Menu is now hidden.");
  }
});

// Handle close button click
closeButton.addEventListener('click', () => {
  console.log("Renderer process: Close button clicked.");
  setIconVisibility(userId, 'off') // Turn off icon visibility
});

// Function to set the interval for the user
const setIntervalForUser = async () => {
  console.log("Renderer process: Setting interval to 15 seconds for the user...");
  const url = `http://127.0.0.1:5000/sitsmart/api/interval/${userId}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interval: 15 }) // Set interval to 15 seconds
    });

    const data = await response.json();
    if (response.ok) {
      console.log(`Renderer process: Interval successfully set to ${data.message}`);
    } else {
      console.error("Renderer process: Failed to set interval:", data.error);
    }
  } catch (error) {
    console.error("Renderer process: Error setting interval:", error);
  }
};

// Function to fetch posture type from Flask API
const fetchPostureType = async () => {
  console.log("Renderer process: Fetching posture type from Flask API...");
  const url = `http://127.0.0.1:5000/sitsmart/api/status/${userId}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const postureType = data.status; // Extract posture status
    console.log(`Renderer process: Posture type fetched: ${postureType}`);

    // Update the status icon based on postureType
    if (postureType === 'lean_forward' || postureType === 'lean_backward') {
      statusIcon.src = 'sad-face.png'; // Change to sad face
      console.log("Renderer process: Displaying sad face.");
    } else {
      statusIcon.src = 'good-face.png'; // Change to good face
      console.log("Renderer process: Displaying good face.");
    }
  } catch (error) {
    console.error("Renderer process: Error fetching posture type:", error);
  }
};

const setIconVisibility = async (userId, visibility) => {
  const url = `http://127.0.0.1:5000/sitsmart/api/icon_visibility/${userId}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visibility }), // Send visibility as "on" or "off"
    });

    if (!response.ok) throw new Error('Failed to set icon visibility');
    const data = await response.json();
    return data.message; // Return success message
  } catch (error) {
    console.error('Error setting icon visibility:', error);
    throw error;
  }
};

// Function to fetch icon visibility status
const fetchIconVisibility = async () => {
  console.log("Renderer process: Fetching icon visibility...");
  const url = `http://127.0.0.1:5000/sitsmart/api/icon_visibility/${userId}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const visibility = data.icon_visibility; // Extract visibility status

    console.log(`Renderer process: Icon visibility fetched: ${visibility}`);
    ipcRenderer.send('update-window-visibility', visibility); // Notify main process
  } catch (error) {
    console.error("Renderer process: Error fetching icon visibility:", error);
  }
};

// Monitor visibility frequently (every 1 second)
const monitorVisibility = () => {
  setInterval(() => {
    console.log("Renderer process: Checking icon visibility...");
    fetchIconVisibility();
  }, 1000); // Polling every second
};

// Initialize the app
const initialize = async () => {
  console.log("Renderer process: Initializing the floating app...");

  // Set interval to 15 seconds
  await setIntervalForUser();

  // Fetch posture type immediately
  fetchPostureType();

  // Start frequent visibility monitoring
  monitorVisibility();

  // Periodically fetch posture type (15-second interval)
  setInterval(() => {
    console.log("Renderer process: Fetching posture type at 15-second interval.");
    fetchPostureType();
  }, currentInterval);
};

// Call initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log("Renderer process: DOM fully loaded.");
  initialize();
});
