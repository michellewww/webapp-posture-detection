// Initial setup for settings
document.getElementById("enable-notifications").checked = JSON.parse(localStorage.getItem("enableNotifications")) || false;
document.getElementById("notification-frequency").value = localStorage.getItem("notificationFrequency") || "5";
document.getElementById("user-name").value = localStorage.getItem("userName") || "";
document.getElementById("user-email").value = localStorage.getItem("userEmail") || "";

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

document.addEventListener("DOMContentLoaded", () => {
  updateIconVisibility();
  updateIcon();
});

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

async function captureAndStorePhoto(videoElement) {
  if (!videoElement.srcObject) return;

  await maintainStorageLimit();

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
  console.log("webapp");
  console.log(status);
  const icon = document.getElementById("status-icon");
  if (icon) icon.src = status === 'bad' ? 'bad-face.png' : 'good-face.png';
}
