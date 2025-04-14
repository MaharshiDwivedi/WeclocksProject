import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';

const WebcamCapture = ({ onCapture }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const webcamRef = useRef(null);

  const videoConstraints = {
    width: 320,
    height: 240,
    facingMode: "environment"
  };

  const startCapture = () => {
    setIsCapturing(true);
  };

  const capture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      onCapture(imageSrc);
      setIsCapturing(false);
    }
  };

  const cancelCapture = () => {
    setIsCapturing(false);
  };

  return (
    <div className="webcam-container">
      {isCapturing ? (
        <div className="flex flex-col items-center">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="w-full rounded-md border border-gray-300 mb-2"
          />
          <div className="flex space-x-2">
            <button
              onClick={capture}
              className="bg-green-500 text-white px-4 py-1 rounded-md hover:bg-green-600 transition"
              type="button"
            >
              Capture
            </button>
            <button
              onClick={cancelCapture}
              className="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600 transition"
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={startCapture}
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
          type="button"
        >
          Take Photo with Webcam
        </button>
      )}
    </div>
  );
};

export default WebcamCapture;