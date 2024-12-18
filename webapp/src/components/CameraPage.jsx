import React, { useState, useEffect, useRef } from 'react';
import { addUser, removeUser, setIconVisibility } from '../utils/api';

const CameraPage = ({
  postureType,
  setPostureType,
  activeUser,
  setActiveUser,
  directoryHandle,
  setDirectoryHandle,
  status, 
  setStatus,
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);

  const videoRef = useRef(null);
  const CAPTURE_INTERVAL = 5000; // Interval for capturing photos
  let videoStream = null;
  let captureInterval = null;

  // TODO: change this save logic
  const user_id = "user123";

  /* Web Camera */
  const startCamera = async () => {
    if (isCameraActive) return;
    
    if (!directoryHandle) {
      // Open popup to redirect to setting page
      setOpenPopup(true);
      return;
    }

    try {
      videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        console.log('Camera started');
        videoRef.current.srcObject = videoStream;
      }
      setIsCameraActive(true);

      try {
        await addUser(user_id); // Add user to the database
      } catch (error) {
        console.error('Failed to add user:', error);
      }
      setActiveUser(true); // Set active user

      // Set an interval to capture photos
      captureInterval = setInterval(() => {
        captureAndStorePhoto();
      }, CAPTURE_INTERVAL);
    } catch (error) {
      handleCameraError(error);
    }
  };

  const stopCamera = async () => {
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
    try {
      await removeUser(user_id); // Remove user from the database
    } catch (error) {
      console.error('Failed to remove user:', error);
    }
    setActiveUser(false); // Set active user
    setIsCameraActive(false);
  };

  
  

  const captureAndStorePhoto = async () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;

    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const context = canvas.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));

    if (directoryHandle) {
      try {
        const formattedTimestamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0];
        const fileName = `sitsmart_${user_id}_${formattedTimestamp}.png`;
        const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        console.log(`Photo saved to ${fileName}`);
      } catch (error) {
        console.error('Failed to save photo to directory:', error);
      }
    } else {
      console.warn('Directory handle not set.');
    }
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

  const handleStatusToggle = async () => {
    const newStatus = !status;
    setStatus(newStatus);

    // Call API to set visibility
    try {
      const visibility = newStatus ? 'on' : 'off';
      await setIconVisibility(user_id, visibility);
      console.log(`Icon visibility set to ${visibility}`);
    } catch (error) {
      console.error('Error updating icon visibility:', error);
    }
  };

  const selectDirectory = async () => {
    if ('showDirectoryPicker' in window) {
      try {
        const dirHandle = await window.showDirectoryPicker();
        const permission = await dirHandle.queryPermission({ mode: 'readwrite' });
        if (permission !== 'granted') {
          const requestPermission = await dirHandle.requestPermission({ mode: 'readwrite' });
          if (requestPermission !== 'granted') {
            throw new Error('Write permission not granted');
          }
        }
        setDirectoryHandle(dirHandle);
        setOpenPopup(false);
        console.log('Directory selected:', dirHandle);
      } catch (error) {
        console.error('Directory selection cancelled or failed:', error);
      }
    } else {
      alert('Your browser does not support the File System Access API. Please use a compatible browser.');
    }
    setOpenPopup(false);
  };

  return (
    <div>
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6 bg-[#F8F6F7] text-[#2a6f6f]">
        <h1 className="text-3xl font-bold">SitSmart: Your Posture Partner</h1>

        {/* Status Indicator */}
        <div className="flex items-center gap-4">
          <h5 className="text-lg font-semibold">Status Indicator</h5>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={status}
              onChange={handleStatusToggle}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-[#a8c3b5] transition duration-300"></div>
            <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-transform"></div>
          </label>
        </div>

        {/* Video Container */}
        <div
          className={`w-[640px] h-[480px] border-2 ${
            postureType === "lean_forward" || postureType === "lean_backward"
              ? "border-[#ffa500]"
              : "border-gray-300"
          } rounded-lg flex items-center justify-center bg-white`}
        >
          <video ref={videoRef} className="w-full h-full rounded-lg" autoPlay playsInline />
        </div>

        {/* Control Buttons */}
        <div className="flex gap-4 font-semibold">
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

      {/* Popup Modal */}
      {openPopup && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-semibold mb-4">Directory Not Selected</h2>
            <p className="mb-6">Please select a directory to save your captured photos.</p>
            <button
              onClick={selectDirectory}
              className="px-4 py-2 bg-[#a8c3b5] text-white font-semibold rounded"
            >
              Select Directory
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraPage;