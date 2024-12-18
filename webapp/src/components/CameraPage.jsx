import React, { useState, useEffect, useRef } from 'react';
import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { POSE_CONNECTIONS } from '@mediapipe/pose';
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
  const canvasRef = useRef(null);
  const poseRef = useRef(null);
  const cameraRef = useRef(null);
  const streamRef = useRef(null);
  const captureIntervalRef = useRef(null);
  const CAPTURE_INTERVAL = 5000;

  const user_id = "user123";

  useEffect(() => {
    // Initialize MediaPipe Pose
    poseRef.current = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      }
    });

    poseRef.current.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    poseRef.current.onResults(onResults);

    return () => {
      stopCamera();
    };
  }, []);

  const onResults = (results) => {
    if (!canvasRef.current) return;

    const canvasCtx = canvasRef.current.getContext('2d');
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Draw the video frame
    canvasCtx.drawImage(
      results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

    if (results.poseLandmarks) {
      // Draw standard pose landmarks and connections
      drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
        { color: '#00FF00', lineWidth: 2 });
      drawLandmarks(canvasCtx, results.poseLandmarks,
        { color: '#FF0000', lineWidth: 1, radius: 3 });

      // Draw custom posture line
      const nose = results.poseLandmarks[0];
      const leftShoulder = results.poseLandmarks[11];
      const rightShoulder = results.poseLandmarks[12];

      // Calculate mid-point between shoulders
      const midShoulderX = (leftShoulder.x + rightShoulder.x) / 2;
      const midShoulderY = (leftShoulder.y + rightShoulder.y) / 2;

      // Draw posture line (from nose to mid-shoulder point)
      canvasCtx.beginPath();
      canvasCtx.moveTo(nose.x * canvasRef.current.width, nose.y * canvasRef.current.height);
      canvasCtx.lineTo(
        midShoulderX * canvasRef.current.width,
        midShoulderY * canvasRef.current.height
      );
      canvasCtx.strokeStyle = '#0000FF';
      canvasCtx.lineWidth = 3;
      canvasCtx.stroke();

      // Draw mid-shoulder point
      canvasCtx.beginPath();
      canvasCtx.arc(
        midShoulderX * canvasRef.current.width,
        midShoulderY * canvasRef.current.height,
        5, 0, 2 * Math.PI
      );
      canvasCtx.fillStyle = '#0000FF';
      canvasCtx.fill();

      // Calculate angle of posture line
      const angle = Math.atan2(
        (nose.y - midShoulderY) * canvasRef.current.height,
        (nose.x - midShoulderX) * canvasRef.current.width
      ) * 180 / Math.PI;

      // Draw angle text
      canvasCtx.font = '16px Arial';
      canvasCtx.fillStyle = '#0000FF';
      canvasCtx.fillText(
        `Angle: ${Math.abs(angle).toFixed(1)}°`,
        10,
        30
      );
    }

    canvasCtx.restore();
  };

  const captureAndStorePhoto = async () => {
    if (!videoRef.current || !directoryHandle) return;

    // Create a canvas for raw image capture
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = videoRef.current.videoWidth;
    captureCanvas.height = videoRef.current.videoHeight;
    const ctx = captureCanvas.getContext('2d');
    
    // Draw the raw video frame
    ctx.drawImage(videoRef.current, 0, 0);
    
    // Convert to blob
    const blob = await new Promise((resolve) => 
      captureCanvas.toBlob(resolve, 'image/png', 1.0)
    );

    try {
      const formattedTimestamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0];
      const fileName = `sitsmart_${user_id}_${formattedTimestamp}.png`;
      const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      console.log(`Raw photo saved to ${fileName}`);
    } catch (error) {
      console.error('Failed to save photo to directory:', error);
    }
  };

  const startCamera = async () => {
    if (isCameraActive) return;
    
    if (!directoryHandle) {
      setOpenPopup(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Initialize MediaPipe camera after video stream is set
        if (!cameraRef.current) {
          cameraRef.current = new Camera(videoRef.current, {
            onFrame: async () => {
              if (poseRef.current) {
                await poseRef.current.send({image: videoRef.current});
              }
            },
            width: 640,
            height: 480
          });
          await cameraRef.current.start();
        }
      }
      
      setIsCameraActive(true);

      try {
        await addUser(user_id);
      } catch (error) {
        console.error('Failed to add user:', error);
      }
      setActiveUser(true);

      // Start photo capture interval
      captureIntervalRef.current = setInterval(captureAndStorePhoto, CAPTURE_INTERVAL);
    } catch (error) {
      handleCameraError(error);
    }
  };

  const stopCamera = async () => {
    // Stop MediaPipe camera
    if (cameraRef.current) {
      await cameraRef.current.stop();
      cameraRef.current = null;
    }

    // Stop the media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }

    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    // Clear capture interval
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }

    try {
      await removeUser(user_id);
    } catch (error) {
      console.error('Failed to remove user:', error);
    }

    setActiveUser(false);
    setIsCameraActive(false);
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
          className={`relative w-[640px] h-[480px] border-2 ${
            postureType === "lean_forward" || postureType === "lean_backward"
              ? "border-[#ffa500]"
              : "border-gray-300"
          } rounded-lg flex items-center justify-center bg-white`}
        >
          <video
            ref={videoRef}
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            playsInline
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            width={640}
            height={480}
          />
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