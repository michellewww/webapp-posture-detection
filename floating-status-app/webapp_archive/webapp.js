// Load settings from localStorage on page load
document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
  updateIconVisibility();
  updateIcon();
  const userId = "user123";  // Define user_id
  addUser(userId);
  startBadPostureNotificationCycle();
});

async function addUser(userId) {
  try {
    const response = await fetch(`http://127.0.0.1:5000/sitsmart/api/add_user/${userId}`, {
      method: 'POST'
    });
    const data = await response.json();
    console.log(data.message);  // Log the response message
  } catch (error) {
    console.error("Error adding user:", error);
  }
}

async function setIntervalForUser(userId, interval) {
  try {
    console.log("Setting interval for user:", userId);
    const response = await fetch(`http://127.0.0.1:5000/sitsmart/api/interval/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ interval: interval })
    });
    const data = await response.json();
    console.log(data.message);
  } catch (error) {
    console.error("Error setting interval:", error);
  }
}

// Settings
function loadSettings() {
  document.getElementById("enable-notifications").checked = JSON.parse(localStorage.getItem("enableNotifications")) || false;
  document.getElementById("notification-frequency").value = localStorage.getItem("notificationFrequency") || "5";
  const chosenFolderPath = localStorage.getItem("chosenFolderPath") || "No folder selected";
  console.log("Loaded folder path:", chosenFolderPath); // Optional: Display it in the console or on the UI
  toggleFrequency();
}

// Toggle notification frequency dropdown
function toggleFrequency() {
  const checkbox = document.getElementById("enable-notifications");
  const frequencySection = document.getElementById("frequency-section");
  frequencySection.style.display = checkbox.checked ? "block" : "none";
}

// Event listeners for settings and camera controls
document.getElementById("enable-notifications").addEventListener("change", () => {
  localStorage.setItem("enableNotifications", document.getElementById("enable-notifications").checked);
  toggleFrequency();
  startBadPostureNotificationCycle();  // Restart notification cycle if setting is changed
});
document.getElementById("notification-frequency").addEventListener("change", async () => {
  let frequencyInMinutes = document.getElementById("notification-frequency").value;
  localStorage.setItem("notificationFrequency", frequencyInMinutes);
  if (frequencyInMinutes == 0) {
    frequencyInMinutes = 0.75;
  }

  // Call the API to update the interval on the backend
  await setIntervalForUser("user123", frequencyInMinutes * 60);  // Convert minutes to seconds
  startBadPostureNotificationCycle();
});

document.getElementById("choose-folder").addEventListener("click", () => {
  document.getElementById("storage-folder").click();
});

document.getElementById("storage-folder").addEventListener("change", (event) => {
  const files = event.target.files;
  if (files.length > 0) {
    const folderPath = files[0].webkitRelativePath.split("/")[0];
    localStorage.setItem("chosenFolderPath", folderPath);
    document.getElementById("selected-folder-path").textContent = folderPath; // Update UI
  }
});



function showPage(pageId) {
  const pages = ["camera-page", "settings-page", "status-page", "analysis-page"];
  
  pages.forEach(page => {
    const element = document.getElementById(page);
    if (element) {
      element.style.display = "none";
    }
  });

  const selectedPage = document.getElementById(pageId);
  if (selectedPage) {
    selectedPage.style.display = "block";
  }

  if (pageId === "analysis-page") {
    renderPostureChart();
    renderHourlyPostureChart();
  }
}

// Floating icon toggle setup
const toggleIconSwitch = document.getElementById("toggle-icon");
toggleIconSwitch.checked = JSON.parse(localStorage.getItem("iconVisible")) !== false;

function updateIconVisibility() {
  const iconVisible = toggleIconSwitch.checked;
  const icon = document.getElementById("status-icon");
  if (icon) icon.style.display = iconVisible ? "block" : "none";
  localStorage.setItem("iconVisible", iconVisible);
}

toggleIconSwitch.addEventListener("change", updateIconVisibility);

// Camera controls
let videoStream = null;
let captureInterval = null;
let isCameraActive = false;
const MAX_PHOTO_COUNT = 29;

document.getElementById("start-camera").addEventListener("click", startCamera);
document.getElementById("stop-camera").addEventListener("click", stopCamera);

async function startCamera() {
  const CAPTURE_INTERVAL = 5000;
  if (isCameraActive) return;

  try {
    videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
    document.getElementById("video").srcObject = videoStream;
    isCameraActive = true;
    captureInterval = setInterval(() => {
      maintainStorageLimit();
      captureAndStorePhoto(document.getElementById("video"));
    }, CAPTURE_INTERVAL);
  } catch (error) {
    handleCameraError(error);
  }
}

function stopCamera() {
  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop());
    videoStream = null;
    document.getElementById("video").srcObject = null;
  }
  if (captureInterval) clearInterval(captureInterval);
  isCameraActive = false;
}

// Photo capture and storage in IndexedDB
async function captureAndStorePhoto(videoElement) {
  if (!videoElement.srcObject) return;
  await maintainStorageLimit();

  const user_id = "user123";

  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 240;
  const context = canvas.getContext("2d");
  context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  const photoData = canvas.toDataURL("image/webp", 0.8);

  const db = await openDatabase();
  const transaction = db.transaction("photos", "readwrite");
  const store = transaction.objectStore("photos");

  try {
    const timestamp = Date.now();
    const photo = { timestamp, data: photoData };
    store.add(photo);
    logMessage(`Photo stored in IndexedDB with timestamp: ${timestamp}`);
  } catch (error) {
    logMessage("Failed to store photo in IndexedDB: " + error);
  }

  displayStoredPhotos();
  updateStatus(photoData);

  const formattedTimestamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0];
  const fileName = `sitsmart_${user_id}_${formattedTimestamp}.png`;

  const link = document.createElement("a");
  link.href = photoData;
  link.download = fileName;
  link.click();
}

function updateStatus(photoData) {
  const good_or_bad = Math.random() > 0.5 ? 'good' : 'bad';
  localStorage.setItem('good_or_bad', good_or_bad);
  updateIcon();
}

async function maintainStorageLimit() {
  const db = await openDatabase();
  const transaction = db.transaction("photos", "readwrite");
  const store = transaction.objectStore("photos");
  const request = store.getAll();

  request.onsuccess = () => {
    const photos = request.result;
    if (photos.length > MAX_PHOTO_COUNT) {
      const excessCount = photos.length - MAX_PHOTO_COUNT;
      photos.sort((a, b) => a.timestamp - b.timestamp);
      for (let i = 0; i < excessCount; i++) {
        store.delete(photos[i].timestamp);
      }
    }
  };
}

async function displayStoredPhotos() {
  const gallery = document.getElementById("photo-gallery");
  if (!gallery) return;
  gallery.innerHTML = "";

  const db = await openDatabase();
  const transaction = db.transaction("photos", "readonly");
  const store = transaction.objectStore("photos");
  const request = store.getAll();

  request.onsuccess = () => {
    const photos = request.result;
    photos.forEach(photo => {
      const img = document.createElement("img");
      img.src = photo.data;
      img.alt = `Captured on ${new Date(photo.timestamp).toLocaleString()}`;
      img.style.width = "100px";
      img.style.margin = "5px";
      gallery.appendChild(img);
    });
  };
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("PhotoDatabase", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("photos")) {
        db.createObjectStore("photos", { keyPath: "timestamp" });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

function logMessage(message) {
  const messageContainer = document.getElementById("message-container");
  if (messageContainer) {
    const messageElement = document.createElement("p");
    messageElement.textContent = message;
    messageContainer.appendChild(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }
}

function handleCameraError(error) {
  if (error.name === "NotAllowedError") {
    alert("Camera access was denied. Please enable camera access.");
  } else if (error.name === "NotFoundError") {
    alert("No camera found on your device.");
  } else {
    alert("Unable to access the webcam: " + error.message);
  }
}

function updateIcon() {
  const status = localStorage.getItem('good_or_bad') || 'good';
  const icon = document.getElementById("status-icon");
  if (icon) icon.src = status === 'bad' ? '../sad-face.png' : '../good-face.png';
}

function renderPostureChart() {
  const ctx = document.getElementById("PostureChart").getContext("2d");
  const badPostureCounts = Array.from({length: 30}, () => Math.floor(Math.random() * 10));

  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: days,
      datasets: [{
        label: 'Times in Bad Posture',
        data: badPostureCounts,
        borderWidth: 2,
        fill: false,
      }]
    },
    options: {
      scales: {
        x: { title: { display: true, text: 'Days' } },
        y: { title: { display: true, text: 'Bad Posture Count' } }
      }
    }
  });
}

function renderHourlyPostureChart() {
  const ctx = document.getElementById("HourlyPostureChart").getContext("2d");
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  const hourlyBadPostureCounts = Array.from({ length: 24 }, () => Math.floor(Math.random() * 10));

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: hours,
      datasets: [{
        label: 'Times in Bad Posture (Hourly)',
        data: hourlyBadPostureCounts,
        borderWidth: 2,
        fill: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        x: { title: { display: true, text: 'Hour of the Day' } },
        y: { title: { display: true, text: 'Bad Posture Count' } }
      }
    }
  });
}

function toggleFrequency() {
  const checkbox = document.getElementById("enable-notifications");
  const frequencySection = document.getElementById("frequency-section");
  frequencySection.style.display = checkbox.checked ? "block" : "none";
}

// Notification-related settings
let notificationInterval = null;

// Function to display the system notification
function displayBadPostureNotification() {
  console.log("Displaying bad posture notification");
  if (Notification.permission === "granted") {
    new Notification("Bad Posture Detected!", {
      body: "Remember to maintain good posture.",
      icon: "../sad-face.png",
      requireInteraction: true,
    });
  }
}

// Start notification cycle based on settings
function startBadPostureNotificationCycle() {
  console.log("Starting notification cycle");
  if (notificationInterval) {
    clearInterval(notificationInterval);
  }

  const notificationsEnabled = JSON.parse(localStorage.getItem("enableNotifications"));
  if (!notificationsEnabled) return;

  const frequencyInMinutes = localStorage.getItem("notificationFrequency");
  console.log("Notification frequency:", frequencyInMinutes);
  let frequency = 45 * 1000; // Default to 45 seconds
  if (frequencyInMinutes == 0) {
    //45 seoconds
    console.log("45 seconds");
    frequency = 45 * 1000;
  } else {
    frequency = frequencyInMinutes * 60 * 1000; // Convert minutes to milliseconds
  }

  // notificationInterval = setInterval(() => {
  //   const postureStatus = localStorage.getItem("good_or_bad");
  //   if (postureStatus === "bad") {
  //     displayBadPostureNotification();
  //   }
  // }, frequency);

  notificationInterval = setInterval(async () => {
    const userId = "user123";
    try {
      console.log("Fetching status...");
      const response = await fetch(`http://127.0.0.1:5000/sitsmart/api/status/${userId}`);
      const data = await response.json();
      console.log("Status fetched:", data.status);
      if (data.status === "bad") { // TODO: Check if status is bad
        displayBadPostureNotification();
      }
    } catch (error) {
      console.error("Error fetching status:", error);
    }
  }, frequency);
}

// Request notification permission and start cycle if granted
document.addEventListener("DOMContentLoaded", () => {
  if (Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        startBadPostureNotificationCycle();
      }
    });
  } else if (Notification.permission === "granted") {
    startBadPostureNotificationCycle();
  }
});

// Stop notifications when the app is closed
window.addEventListener("beforeunload", () => {
  if (notificationInterval) {
    clearInterval(notificationInterval);
  }
});
