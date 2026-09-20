import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Check, AlertCircle } from 'lucide-react';

export default function CameraCapture({ onCapture, previewUrl }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isStarting, setIsStarting] = useState(false);

  const startCamera = async () => {
    setIsStarting(true);
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: 'user' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setCameraError("Camera access denied or unavailable. You can use File Upload or Pitch Presets.");
    } finally {
      setIsStarting(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 640;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "selfie_capture.jpg", { type: "image/jpeg" });
        onCapture(file);
        stopCamera();
      }
    }, 'image/jpeg', 0.92);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="relative border-2 border-slate-700 bg-slate-950 rounded-2xl overflow-hidden aspect-square max-w-sm mx-auto flex items-center justify-center">
        {previewUrl ? (
          <img src={previewUrl} alt="Captured Selfie" className="w-full h-full object-cover" />
        ) : stream ? (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Oval Face Guide Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-64 rounded-[50%] border-2 border-dashed border-rose-400/60" />
            </div>
          </div>
        ) : (
          <div className="text-center p-6 space-y-3">
            <Camera className="w-10 h-10 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-400">Position your face inside the frame in natural lighting</p>
            {cameraError && (
              <p className="text-xs text-amber-400 flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {cameraError}
              </p>
            )}
            <button
              type="button"
              onClick={startCamera}
              disabled={isStarting}
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-md shadow-rose-500/20"
            >
              {isStarting ? "Opening Camera..." : "Start Camera"}
            </button>
          </div>
        )}
      </div>

      {stream && (
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={capturePhoto}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-500/20"
          >
            <Camera className="w-4 h-4" />
            <span>Snap Facial Selfie</span>
          </button>
          <button
            type="button"
            onClick={stopCamera}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Cancel
          </button>
        </div>
      )}

      {previewUrl && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => {
              startCamera();
            }}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retake Selfie</span>
          </button>
        </div>
      )}
    </div>
  );
}
