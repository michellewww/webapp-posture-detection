const MAX_PHOTO_COUNT = 29; 
let videoStream = null;
let captureInterval = null;
let isCameraActive = false;

document.getElementById("start-camera").addEventListener("click", startCamera);
document.getElementById("stop-camera").addEventListener("click", stopCamera);
document.getElementById("open-camera-page").addEventListener("click", () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
  });

async function startCamera() {
  const CAPTURE_INTERVAL = 5000;
    logMessage("Extension.js")
  if (isCameraActive) {
    console.log("Camera is already running.");
    logMessage("Camera is already running.");
    return;
  }

  try {
    // Request access to the camera
    videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
    
    // If successful, start displaying the video feed
    const video = document.getElementById("video");
    video.srcObject = videoStream;
    isCameraActive = true;

    // Start capturing photos at intervals
    captureInterval = setInterval(() => {
      maintainStorageLimit();
      captureAndStorePhoto(video);
    }, CAPTURE_INTERVAL);

    console.log("Camera started.");
    logMessage("Camera started.");
  } catch (error) {
    // Handle any errors related to accessing the camera
    console.error("Error accessing webcam:", error);
    if (error.name === "NotAllowedError") {
      alert("Please enable camera access in your browser settings and try again.");
      logMessage("Please enable camera access in your browser settings and try again.");
    } else if (error.name === "NotFoundError") {
      alert("No camera found on your device. Please connect a camera and try again.");
      logMessage("No camera found on your device. Please connect a camera and try again.");
    } else {
      alert("Unable to access the webcam: " + error.message);
      logMessage("Unable to access the webcam: " + error.message);
    }
  }
}

function stopCamera() {
  if (videoStream) {
    // Stop all video tracks to end the stream
    videoStream.getTracks().forEach(track => track.stop());
    videoStream = null;
    document.getElementById("video").srcObject = null;
    console.log("Camera stopped.");
    logMessage("Camera stopped.");
  }

  if (captureInterval) {
    clearInterval(captureInterval);
    captureInterval = null;
    console.log("Capture interval stopped.");
    logMessage("Capture interval stopped.");
  }

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
    console.log(`Photo stored in IndexedDB with timestamp: ${timestamp}`);
    logMessage(`Photo stored in IndexedDB with timestamp: ${timestamp}`);
  } catch (error) {
    console.error("Failed to store photo in IndexedDB:", error);
    logMessage("Failed to store photo in IndexedDB:", error);
  }

  displayStoredPhotos();
}

function logMessage(message) {
  const messageContainer = document.getElementById("message-container");
  if (messageContainer) {
    const messageElement = document.createElement("p");
    messageElement.textContent = message;
    messageContainer.appendChild(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
  } else {
    console.warn("Message container not found.");
  }
}