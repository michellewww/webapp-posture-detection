// Initial setup for settings
document.getElementById("enable-notifications").checked = JSON.parse(localStorage.getItem("enableNotifications")) || false;
document.getElementById("notification-frequency").value = localStorage.getItem("notificationFrequency") || "5";
document.getElementById("user-name").value = localStorage.getItem("userName") || "";
document.getElementById("user-email").value = localStorage.getItem("userEmail") || "";

// Floating icon toggle setup
const toggleIconSwitch = document.getElementById("toggle-icon");
toggleIconSwitch.checked = JSON.parse(localStorage.getItem("iconVisible")) !== false; // Default is true if not set

// Function to show or hide the floating icon
function updateIconVisibility() {
  const iconVisible = toggleIconSwitch.checked;
  const icon = document.getElementById("status-icon");
  if (icon) {
    icon.style.display = iconVisible ? "block" : "none";
  }
  localStorage.setItem("iconVisible", iconVisible);
}

// Listen for toggle switch change
toggleIconSwitch.addEventListener("change", updateIconVisibility);

// Initialize icon visibility on load
document.addEventListener("DOMContentLoaded", () => {
  updateIconVisibility();
  
  // Attach event listeners for the icon and menu toggle
  const statusIcon = document.getElementById("status-icon");
  const menu = document.getElementById("menu");
  
  statusIcon.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
  });
  
  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && e.target !== statusIcon) {
      menu.style.display = 'none';
    }
  });
});

// Hide icon and update switch when "Hide" is clicked in the menu
function hideIcon() {
  const icon = document.getElementById("status-icon");
  if (icon) {
    icon.style.display = "none";
  }
  toggleIconSwitch.checked = false; // Update the switch to reflect hidden state
  localStorage.setItem("iconVisible", false);
}

// Event listeners to save settings
document.getElementById("enable-notifications").addEventListener("change", () => {
  localStorage.setItem("enableNotifications", document.getElementById("enable-notifications").checked);
});

document.getElementById("notification-frequency").addEventListener("change", () => {
  localStorage.setItem("notificationFrequency", document.getElementById("notification-frequency").value);
});

// Sample functions for camera and other features (included from your initial code)
// document.getElementById("sign-in-form").addEventListener("submit", (e) => {
//   e.preventDefault();
//   document.getElementById("sign-in-page").style.display = "none";
//   document.getElementById("main-content").style.display = "block";
//   document.getElementById("sidebar").style.display = "block";
// });

function showPage(pageId) {
  document.getElementById("main-content").style.display = "none";
  document.getElementById("settings-page").style.display = "none";
  if (pageId === "camera-page") {
    document.getElementById("main-content").style.display = "block";
  } else if (pageId === "settings-page") {
    document.getElementById("settings-page").style.display = "block";
  }
}
