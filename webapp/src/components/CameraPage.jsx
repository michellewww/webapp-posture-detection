import React, { useState } from 'react';

const CameraPage = ({ startCamera, stopCamera }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);

  const handleStart = () => {
    startCamera();
    setIsCameraActive(true);
  };

  const handleStop = () => {
    stopCamera();
    setIsCameraActive(false);
  };

  return (
    <div className="text-center">
      <h1 className="text-xl font-bold">Posture Detection App</h1>
      <div className="flex justify-center items-center mt-4">
        <h5>Status Indicator</h5>
        <label className="flex items-center ml-2">
          <input type="checkbox" className="toggle" />
        </label>
      </div>
      <video className="mt-5 border rounded-lg" autoPlay></video>
      <div className="mt-4">
        <button
          className="px-4 py-2 bg-green-500 text-white rounded"
          onClick={handleStart}
          disabled={isCameraActive}
        >
          Start Camera
        </button>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded ml-2"
          onClick={handleStop}
          disabled={!isCameraActive}
        >
          Stop Camera
        </button>
      </div>
    </div>
  );
};

export default CameraPage;
