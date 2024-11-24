import React, { useState, useEffect, useRef } from 'react';

const CameraPage = () => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [status, setStatus] = useState(false); // For status indicator toggle
  const videoRef = useRef(null);
  const CAPTURE_INTERVAL = 5000; // Interval for capturing photos
  let videoStream = null;
  let captureInterval = null;
  
  // TODO: change this save logic
  const user_id = "user123";

  /* Web Camera */
  const startCamera = async () => {
    if (isCameraActive) return;

    try {
      videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        console.log('Camera started');
        videoRef.current.srcObject = videoStream;
      }
      setIsCameraActive(true);

      // Set an interval to capture photos
      captureInterval = setInterval(() => {
        captureAndStorePhoto();
      }, CAPTURE_INTERVAL);
    } catch (error) {
      handleCameraError(error);
    }
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
      videoStream = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (captureInterval) {
      clearInterval(captureInterval);
      captureInterval = null;
    }
    setIsCameraActive(false);
  };

  const captureAndStorePhoto = async () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;

    const canvas = document.createElement('canvas');
    canvas.width = 320; // Adjust width
    canvas.height = 240; // Adjust height
    const context = canvas.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const photoData = canvas.toDataURL('image/webp', 0.8);

    try {
      const db = await openDatabase();
      const transaction = db.transaction('photos', 'readwrite');
      const store = transaction.objectStore('photos');
      const timestamp = Date.now();
      const photo = { timestamp, data: photoData };

      store.add(photo);
      console.log(`Photo stored in IndexedDB with timestamp: ${timestamp}`);
    } catch (error) {
      console.error('Failed to store photo in IndexedDB:', error);
    }

    //TODO: replace this with database storage
    // const formattedTimestamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0];
    // const fileName = `sitsmart_${user_id}_${formattedTimestamp}.png`;

    // const link = document.createElement("a");
    // link.href = photoData;
    // link.download = fileName;
    // link.click();
  };

  const handleCameraError = (error) => {
    if (error.name === 'NotAllowedError') {
      alert('Camera access was denied. Please enable camera access.');
    } else if (error.name === 'NotFoundError') {
      alert('No camera found on your device.');
    } else {
      alert('Unable to access the webcam: ' + error.message);
    }
  };

  // Open IndexedDB database
  // TODO: change this to use a real database
  const openDatabase = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PhotoDatabase', 1);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('photos')) {
          db.createObjectStore('photos', { keyPath: 'timestamp' });
        }
      };

      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject(event.target.error);
    });
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  /* Set up Notification Interval */

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-6 bg-gray-100 text-[#2a6f6f]">
      <h1 className="text-2xl font-bold">Posture Detection App</h1>

      {/* Status Indicator */}
      <div className="flex items-center gap-4">
        <h5 className="text-lg font-semibold">Status Indicator</h5>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={status}
            onChange={() => setStatus(!status)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-[#a8c3b5] transition duration-300"></div>
          <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-transform"></div>
        </label>
      </div>

      {/* Video Container */}
      <div
        className="w-[640px] h-[480px] border-2 border-gray-300 rounded-lg flex items-center justify-center bg-white"
      >
        <video ref={videoRef} className="w-full h-full rounded-lg" autoPlay playsInline />
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4">
        <button
          onClick={startCamera}
          className={`px-4 py-2 rounded ${
            isCameraActive ? 'bg-[#e0e2e4] cursor-not-allowed' : 'bg-[#a8c3b5] text-white'
          }`}
          disabled={isCameraActive}
        >
          Start Camera
        </button>
        <button
          onClick={stopCamera}
          className={`px-4 py-2 rounded ${
            !isCameraActive ? 'bg-[#e0e2e4] cursor-not-allowed' : 'bg-red-500 text-white'
          }`}
          disabled={!isCameraActive}
        >
          Stop Camera
        </button>
      </div>
    </div>
  );
};

export default CameraPage;
