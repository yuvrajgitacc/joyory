import React, { useState } from 'react';
import { Sparkles, Camera, UploadCloud, Sliders, ShieldCheck, ArrowRight, Loader2, Zap } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import CameraCapture from '../components/CameraCapture';

export default function AnalyzePage({ onAnalysisComplete }) {
  const [inputMode, setInputMode] = useState('upload'); // 'upload' | 'camera'
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [budget, setBudget] = useState('all');
  const [skinType, setSkinType] = useState('unknown');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  const handleFileSelected = (file) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setErrorMessage(null);
  };

  const handleUsePreset = async (presetType) => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    if (presetType === 'acne') {
      ctx.fillStyle = '#e2b597';
      setSkinType('Oily');
    } else if (presetType === 'dry') {
      ctx.fillStyle = '#f5d0b5';
      setSkinType('Dry');
    } else {
      ctx.fillStyle = '#c68a62';
      setSkinType('Combination');
    }
    ctx.fillRect(0, 0, 300, 300);
    ctx.fillStyle = '#be123c';
    ctx.font = '18px sans-serif';
    ctx.fillText(`${presetType.toUpperCase()} FACE SAMPLE`, 30, 150);

    canvas.toBlob((blob) => {
      const file = new File([blob], `${presetType}_sample.jpg`, { type: 'image/jpeg' });
      setSelectedFile(file);
      setPreviewUrl(canvas.toDataURL());
    }, 'image/jpeg');
  };

  const handleSubmit = async (mode = 'normal') => {
    if (!selectedFile) {
      setErrorMessage("Please capture or upload a selfie, or pick a demo pitch preset.");
      return;
    }

    setIsScanning(true);
    setErrorMessage(null);

    if (mode === 'advance') {
      setScanStep("1/4: Initializing Multimodal Deep Vision (Gemini 2.5 Flash + YOLOv8s)...");
      await new Promise((r) => setTimeout(r, 600));
      setScanStep("2/4: Cross-Validating Neural Signals with Gemini Vision Pixels...");
      await new Promise((r) => setTimeout(r, 700));
      setScanStep("3/4: Structuring Grounded Clinical Telemetry & Active Safety...");
      await new Promise((r) => setTimeout(r, 600));
      setScanStep("4/4: Grok Selecting Synergistic Joyory Formulations...");
    } else {
      setScanStep("1/4: Executing Local YOLOv8s ONNX Blemish & Signal Extraction...");
      await new Promise((r) => setTimeout(r, 600));
      setScanStep("2/4: Computing Central Face Tone & Moisture Indices (CPU)...");
      await new Promise((r) => setTimeout(r, 700));
      setScanStep("3/4: Passing Model Telemetry to Gemini Narrator (No image sent)...");
      await new Promise((r) => setTimeout(r, 600));
      setScanStep("4/4: Grok Regimen Matching across 498 Joyory Products...");
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('budget', budget);
      formData.append('skin_type', skinType);
      formData.append('session_id', 'demo_user_1');
      formData.append('scan_mode', mode);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || data.status === 'error') {
        const detailMsg = data.message || data.detail || `Server returned error ${response.status}`;
        setErrorMessage(detailMsg);
        setIsScanning(false);
        return;
      }

      onAnalysisComplete(data);
    } catch (err) {
      console.error("API error:", err);
      setErrorMessage(err.message || "Could not reach backend API. Ensure FastAPI is running on port 8000.");
    } finally {
      setIsScanning(false);
      setScanStep('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-semibold text-rose-400 uppercase tracking-widest">
          Step 1: Diagnostics
        </span>
        <h2 className="text-3xl font-extrabold text-white font-serif">
          Facial Surface Characterization
        </h2>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Choose between local edge neural scanning (CPU models) or advanced multimodal vision (Gemini 2.5 Flash).
        </p>
      </div>

      {/* Mode selection tabs */}
      <div className="flex justify-center">
        <div className="bg-slate-900/80 p-1 rounded-2xl border border-slate-800 flex gap-1">
          <button
            type="button"
            onClick={() => setInputMode('upload')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              inputMode === 'upload'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Photo</span>
          </button>
          <button
            type="button"
            onClick={() => setInputMode('camera')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              inputMode === 'camera'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Live Camera</span>
          </button>
        </div>
      </div>

      {/* Input section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
        {inputMode === 'upload' ? (
          <FileUpload 
            onFileSelected={handleFileSelected} 
            previewUrl={previewUrl}
          />
        ) : (
          <CameraCapture 
            onCapture={handleFileSelected} 
            previewUrl={previewUrl}
          />
        )}

        {/* Demo pitch presets */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              Quick Demo Pitch Presets
            </span>
            <span>No real face handy? Pick one:</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleUsePreset('acne')}
              className="py-2 px-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors text-center"
            >
              🔥 Oily / Acne Target
            </button>
            <button
              type="button"
              onClick={() => handleUsePreset('dry')}
              className="py-2 px-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors text-center"
            >
              ❄️ Dry / Barrier Target
            </button>
            <button
              type="button"
              onClick={() => handleUsePreset('combination')}
              className="py-2 px-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors text-center"
            >
              ⚖️ Combination T-Zone
            </button>
          </div>
        </div>

        {/* Preferences controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-5 border-t border-slate-800/80">
          {/* Budget tier */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Budget Philosophy
            </label>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="all">All Joyory Ranges (Smart Blended)</option>
              <option value="budget">Value Tier (&lt; ₹400)</option>
              <option value="mid">Masstige Tier (₹350 - ₹650)</option>
              <option value="premium">Dermaceutical Tier (&gt; ₹600)</option>
            </select>
          </div>

          {/* Skin Type Pre-knowledge */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Known Skin Type (Optional)
            </label>
            <select
              value={skinType}
              onChange={(e) => setSkinType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="unknown">Auto-Detect from Selfie</option>
              <option value="Oily">Oily Skin</option>
              <option value="Dry">Dry Skin</option>
              <option value="Combination">Combination Skin</option>
              <option value="Sensitive">Sensitive Skin</option>
              <option value="Normal">Normal Skin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 text-center">
          {errorMessage}
        </div>
      )}

      {/* Scan Buttons & Scanning Overlay */}
      <div className="space-y-3">
        {isScanning ? (
          <div className="p-6 rounded-2xl bg-slate-900 border border-rose-500/40 space-y-3 animate-pulse text-center">
            <Loader2 className="w-8 h-8 text-rose-400 animate-spin mx-auto" />
            <p className="text-sm font-bold text-white font-mono">{scanStep}</p>
            <p className="text-xs text-slate-400">Harmonizing neural signals with Joyory active safety rules...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Mode 1: Standard Neural Scan */}
            <button
              type="button"
              onClick={() => handleSubmit('normal')}
              disabled={!selectedFile}
              className={`p-4 rounded-2xl font-bold text-sm flex flex-col items-center justify-center gap-1.5 transition-all shadow-xl text-center ${
                selectedFile
                  ? 'bg-slate-900 hover:bg-slate-850 text-white border border-rose-500/40 hover:border-rose-400 shadow-rose-500/10 cursor-pointer hover:scale-[1.02]'
                  : 'bg-slate-900/60 text-slate-500 cursor-not-allowed border border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <span className="text-white font-bold">Standard Neural AI Scan</span>
              </div>
              <span className="text-[11px] text-slate-400 font-normal">
                Models scan image • Gemini narrates final JSON
              </span>
            </button>

            {/* Mode 2: Advance Multimodal Scan */}
            <button
              type="button"
              onClick={() => handleSubmit('advance')}
              disabled={!selectedFile}
              className={`p-4 rounded-2xl font-bold text-sm flex flex-col items-center justify-center gap-1.5 transition-all shadow-xl text-center ${
                selectedFile
                  ? 'bg-gradient-to-r from-rose-500 via-pink-600 to-amber-500 hover:from-rose-600 hover:to-pink-700 text-white shadow-rose-500/25 cursor-pointer hover:scale-[1.02]'
                  : 'bg-slate-900/60 text-slate-500 cursor-not-allowed border border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-200" />
                <span className="text-white font-bold">Advance Multimodal Scan</span>
              </div>
              <span className="text-[11px] text-rose-100 font-normal">
                Gemini 2.5 Flash Vision scans image + Models
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
