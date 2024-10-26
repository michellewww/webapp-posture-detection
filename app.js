let videoStream = null;
let captureInterval = null;

document.getElementById("start-camera").addEventListener("click", startCamera);
document.getElementById("stop-camera").addEventListener("click", stopCamera);

async function startCamera() {
  try {
    // Request camera access
    videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.getElementById("video");
    video.srcObject = videoStream;

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

  // Display the message in the scrollable container
  displayMessage(timestamp);
}

function displayMessage(timestamp) {
  const messageContainer = document.getElementById("message-container");
  const date = new Date(timestamp);
  const formattedTime = date.toLocaleTimeString();

  // Create a new message element with the formatted timestamp and message
  const messageElement = document.createElement("div");
  messageElement.className = "message";
  messageElement.textContent = `${formattedTime} - Good posture! Well done!`;

  // Append the message to the message container
  messageContainer.appendChild(messageElement);

  // Scroll to the bottom of the container to show the latest message
  messageContainer.scrollTop = messageContainer.scrollHeight;
}
