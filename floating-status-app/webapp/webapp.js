const MAX_PHOTO_COUNT = 29; // Maximum number of photos to keep

let videoStream = null;
let captureInterval = null;
let isCameraActive = false; // Track camera status

document.getElementById("start-camera").addEventListener("click", startCamera);
document.getElementById("stop-camera").addEventListener("click", stopCamera);

async function startCamera() {
  const CAPTURE_INTERVAL = 5000;
  // Prevent starting the camera if it's already active
  if (isCameraActive) {
    console.log("Camera is already running.");
    logMessage("Camera is already running.");
    return;
  }
  try {
    // Request camera access
    videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.getElementById("video");
    video.srcObject = videoStream;
    // Set camera status to active
    isCameraActive = true;

    // Set up interval to capture a photo every 5 seconds
    captureInterval = setInterval(() => {
      maintainStorageLimit();
      captureAndStorePhoto(video);
    }, CAPTURE_INTERVAL);

    console.log("Camera started.");
    logMessage("Camera started.");
  } catch (error) {
    handleCameraError(error);
  }
}

function stopCamera() {
  if (videoStream) {
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
  // Set camera status to inactive
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
  const photoData = canvas.toDataURL("image/webp", 0.8); // Store as WebP for efficiency

  const db = await openDatabase();
  const transaction = db.transaction("photos", "readwrite");
  const store = transaction.objectStore("photos");

  try {
    const timestamp = Date.now();
    const photo = { timestamp, data: photoData };
    store.add(photo); // Add the photo with timestamp as the key
    console.log(`Photo stored in IndexedDB with timestamp: ${timestamp}`);
    logMessage(`Photo stored in IndexedDB with timestamp: ${timestamp}`);
  } catch (error) {
    console.error("Failed to store photo in IndexedDB:", error);
    logMessage("Failed to store photo in IndexedDB:", error);
  }

  displayStoredPhotos(); // Refresh the gallery to show the new photo

  // Simulate running a model and updating the status
  updateStatus(photoData);
}

function updateStatus(photoData) {
  // Placeholder logic for determining good or bad posture
  // In a real application, this would involve running a model on the photoData
  const good_or_bad = Math.random() > 0.5 ? 'good' : 'bad';

  // Update localStorage with the new status
  localStorage.setItem('good_or_bad', good_or_bad);
  console.log(`Status updated to: ${good_or_bad}`);
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
      const sortedPhotos = photos.sort((a, b) => a.timestamp - b.timestamp);
      for (let i = 0; i < excessCount; i++) {
        store.delete(sortedPhotos[i].timestamp);
        console.log(`Deleted photo with timestamp: ${sortedPhotos[i].timestamp}`);
        logMessage(`Deleted photo with timestamp: ${sortedPhotos[i].timestamp}`);
      }
    }
  };

  request.onerror = (event) => {
    console.error("Error maintaining storage limit:", event.target.error);
  };
}

async function displayStoredPhotos() {
  const gallery = document.getElementById("photo-gallery");
  if (!gallery) {
    console.error("Photo gallery element not found.");
    return;
  }
  gallery.innerHTML = ""; // Clear the gallery before adding images

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
      img.style.width = "100px"; // Set a width for the images
      img.style.margin = "5px";
      gallery.appendChild(img);
    });
  };

  request.onerror = (event) => {
    console.error("Error retrieving photos from IndexedDB:", event.target.error);
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

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.error("Database error:", event.target.error);
      reject(event.target.error);
    };
});

}

function logMessage(message) {
  const messageContainer = document.getElementById("message-container");
  if (messageContainer) {
    const messageElement = document.createElement("p");
    messageElement.textContent = message;
    messageContainer.appendChild(messageElement);

    // Optional: Scroll to the latest message
    messageContainer.scrollTop = messageContainer.scrollHeight;
  } else {
    console.warn("Message container not found.");
  }
}

function handleCameraError(error) {
  if (error.name === "NotAllowedError") {
    alert("Camera access was denied. Please enable camera access in your browser settings and try again.");
  } else if (error.name === "NotFoundError") {
    alert("No camera found on your device. Please connect a camera and try again.");
  } else {
    console.error("Error accessing webcam:", error);
    alert("Unable to access the webcam: " + error.message);
  }
}
