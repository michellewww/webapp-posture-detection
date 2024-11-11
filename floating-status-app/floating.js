const statusIcon = document.getElementById('status-icon');
const menu = document.getElementById('menu');
const hideButton = document.getElementById('hide-button');

// Function to update icon source based on the stored status
function updateIcon() {
  const status = localStorage.getItem('good_or_bad') || 'good';
  statusIcon.src = status === 'bad' ? 'bad-face.png' : 'good-face.png';
  console.log("Icon updated to:", statusIcon.src); // Debugging
}

// Hide icon function
function hideIcon() {
  statusIcon.style.display = 'none';
  menu.style.display = 'none';
  localStorage.setItem('iconVisible', false);
  console.log("Icon hidden"); // Debugging
}

// Check and update icon status every 2 seconds
setInterval(updateIcon, 2000);

// Toggle menu on right-click
statusIcon.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
  console.log("Menu toggled"); // Debugging
});

// Attach the hide function to the button
hideButton.addEventListener('click', hideIcon);

// Hide menu on clicking anywhere else
document.addEventListener('click', (e) => {
  if (!menu.contains(e.target) && e.target !== statusIcon) {
    menu.style.display = 'none';
    console.log("Menu hidden by outside click"); // Debugging
  }
});

// Initialize icon visibility and status on load
document.addEventListener('DOMContentLoaded', () => {
  const iconVisible = JSON.parse(localStorage.getItem('iconVisible')) !== false;
  statusIcon.style.display = iconVisible ? 'block' : 'none';
  updateIcon();
  console.log("DOM fully loaded and icon visibility set"); // Debugging
});
