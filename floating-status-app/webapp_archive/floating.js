const { ipcRenderer } = require('electron');

const uid = "user123"; // User ID
const apiBaseUrl = "http://127.0.0.1:5000/sitsmart/api"; // Base URL for API calls

// Register the user by calling addUser API
async function addUser() {
  try {
    console.log(`Attempting to add user: ${uid}`);
    const response = await fetch(`${apiBaseUrl}/add_user/${uid}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("Error adding user:", data.error);
    } else {
      console.log(`User added successfully: ${data.message}`);
    }
  } catch (error) {
    console.error("Network error while adding user:", error);
  }
}

// Fetch the status for the user
async function getStatus() {
  try {
    console.log(`Fetching status for user: ${uid}`);
    const response = await fetch(`${apiBaseUrl}/status/${uid}`);
    const data = await response.json();
    if (response.ok) {
      console.log(`Status fetched successfully: ${data.status}`);
      return data.status;
    } else {
      console.error("Error fetching status:", data.error);
      return null;
    }
  } catch (error) {
    console.error("Network error while fetching status:", error);
    return null;
  }
}

// Update the icon based on status
async function updateIcon() {
  const statusIcon = document.getElementById("status-icon");
  const status = await getStatus();

  if (status === "Bad") {
    console.log("Changing icon to bad-face.png");
    statusIcon.src = "bad-face.png"; // Change to bad icon
  } else {
    console.log("Changing icon to good-face.png");
    statusIcon.src = "good-face.png"; // Change to good icon
  }
}

// Initialize and set up polling for status
async function main() {
  console.log("Initializing SitSmart application...");
  await addUser(); // Register the user when the script starts

  console.log("Starting status update polling...");
  // Set polling interval to check status every 5 seconds
  setInterval(updateIcon, 5000);
}

// Add functionality for the three-dot menu
function setupMenu() {
  const menu = document.getElementById("menu");
  const threeDotMenu = document.getElementById("three-dot-menu");
  const closeButton = document.getElementById("close-button");

  // Toggle menu visibility on clicking the three-dot menu
  threeDotMenu.addEventListener("click", () => {
    console.log("Three-dot menu clicked");
    if (menu.style.display === "none" || menu.style.display === "") {
      console.log("Opening menu");
      menu.style.display = "block";
    } else {
      console.log("Closing menu");
      menu.style.display = "none";
    }
  });

  // Handle close button click
  closeButton.addEventListener("click", () => {
    console.log("Close button clicked, sending close signal");
    ipcRenderer.send("close-all-windows"); // Signal to close all windows
  });
}

// Initialize everything
main();
setupMenu();
