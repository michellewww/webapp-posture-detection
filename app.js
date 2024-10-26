const MAX_PHOTO_COUNT = 30; // Maximum number of photos to keep in localStorage

let videoStream = null;
let captureInterval = null;
let isCameraActive = false; // Track camera status


document.getElementById("start-camera").addEventListener("click", startCamera);
document.getElementById("stop-camera").addEventListener("click", stopCamera);

async function startCamera() {
  // Prevent starting the camera if it's already active
  if (isCameraActive) {
    console.log("Camera is already running.");
    return;
  }
  try {
    // Request camera access
    videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.getElementById("video");
    video.srcObject = videoStream;
    // Set camera status to active
    isCameraActive = true;

    // Set up interval to capture a photo every 10 seconds
    captureInterval = setInterval(() => {
      captureAndStorePhoto(video);
    }, 10000);

    console.log("Camera started.");
  } catch (error) {
    if (error.name === "NotAllowedError") {
      alert(
        "Camera access was denied. Please enable camera access in your browser settings and try again."
      );
    } else if (error.name === "NotFoundError") {
      alert("No camera found on your device. Please connect a camera and try again.");
    } else {
      console.error("Error accessing webcam:", error);
      alert("Unable to access the webcam: " + error.message);
    }
  }
}

function stopCamera() {
  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop());
    videoStream = null;
    document.getElementById("video").srcObject = null;
    console.log("Camera stopped.");
  }

  if (captureInterval) {
    clearInterval(captureInterval);
    captureInterval = null;
    console.log("Capture interval stopped.");
  }
  // Set camera status to inactive
  isCameraActive = false;
}

function captureAndStorePhoto(videoElement) {
  if (!videoElement.srcObject) return;

  const canvas = document.createElement("canvas");
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  const context = canvas.getContext("2d");

  // Draw the current video frame onto the canvas
  context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  const photoData = canvas.toDataURL("image/png");

  // Store the photo in localStorage with a unique key based on the timestamp
  const timestamp = Date.now();
  localStorage.setItem(`photo_${timestamp}`, photoData);

  console.log(`Photo captured and stored with key: photo_${timestamp}`);

  // Maintain the local storage size
  maintainStorageLimit();

  // Display the new photo in the gallery
  displayStoredPhotos();
}

function maintainStorageLimit() {
  // Get all photo keys from localStorage and sort them by timestamp
  const photoKeys = Object.keys(localStorage)
    .filter(key => key.startsWith("photo_"))
    .sort((a, b) => parseInt(a.split("_")[1]) - parseInt(b.split("_")[1]));

  // Remove oldest photos if we exceed the maximum photo count
  while (photoKeys.length > MAX_PHOTO_COUNT) {
    const oldestKey = photoKeys.shift(); // Get the oldest key
    localStorage.removeItem(oldestKey); // Remove the oldest photo
    console.log(`Removed oldest photo with key: ${oldestKey}`);
  }
}

function displayStoredPhotos() {
  const gallery = document.getElementById("photo-gallery");
  gallery.innerHTML = ""; // Clear the gallery before adding images

  Object.keys(localStorage).forEach(key => {
    if (key.startsWith("photo_")) {
      const photoData = localStorage.getItem(key);

      // Create an image element and set the src to the base64 data
      const img = document.createElement("img");
      img.src = photoData;
      img.alt = `Captured on ${new Date(parseInt(key.split("_")[1])).toLocaleString()}`;
      img.style.width = "100px"; // Set a width for the images
      img.style.margin = "5px";

      // Append the image to the gallery
      gallery.appendChild(img);
    }
  });
}
