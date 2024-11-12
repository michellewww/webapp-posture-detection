// cameraPage.js
let videoStream = null;

document.getElementById("start-camera").addEventListener("click", startCamera);
document.getElementById("stop-camera").addEventListener("click", stopCamera);

async function startCamera() {
    try {
        videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.getElementById("video");
        video.srcObject = videoStream;
        console.log("Camera started.");
    } catch (error) {
        console.error("Error accessing webcam:", error);
        alert("Unable to access the webcam. Please allow camera access in your browser settings.");
    }
}

function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
        document.getElementById("video").srcObject = null;
        console.log("Camera stopped.");
    }
}