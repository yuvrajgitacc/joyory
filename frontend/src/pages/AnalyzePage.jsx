import React, { useState } from 'react';
import { Sparkles, Camera, UploadCloud, Sliders, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
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
    // Generate a simple test blob representing the selected face type
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    // Aesthetic simulated face tone
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage("Please capture or upload a selfie, or pick a demo pitch preset.");
      return;
    }

    setIsScanning(true);
    setErrorMessage(null);

    // Sequential simulation of the 5 modules for visual feedback
    setScanStep("1/4: Analyzing Skin Tone & Monk Palette...");
    await new Promise((r) => setTimeout(r, 600));

    setScanStep("2/4: Computing Image-Derived Skin Signals (ONNX)...");
    await new Promise((r) => setTimeout(r, 700));

    setScanStep("3/4: Auditing Joyory Catalog & Active Safety Rules...");
    await new Promise((r) => setTimeout(r, 600));

    setScanStep("4/4: Sequencing Conflict-Free AM/PM Routine...");

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('budget', budget);
      formData.append('skin_type', skinType);
      formData.append('session_id', 'demo_user_1');

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server returned error ${response.status}`);
      }

      const data = await response.json();
      onAnalysisComplete(data);
    } catch (err) {
      console.error("API error:", err);
      setErrorMessage("Could not reach backend API. Ensure FastAPI is running on port 8000.");
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
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Capture or upload a clear, front-facing portrait to initiate our 5-engine multi-agent evaluation.
        </p>
      </div>

      {/* Input Mode Selector */}
      <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 max-w-xs mx-auto">
        <button
          type="button"
          onClick={() => setInputMode('upload')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
            inputMode === 'upload'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload File</span>
        </button>
        <button
          type="button"
          onClick={() => setInputMode('camera')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
            inputMode === 'camera'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Live Selfie</span>
        </button>
      </div>

      {/* Image Input Area */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
        {inputMode === 'upload' ? (
          <FileUpload
            onFileSelected={handleFileSelected}
            previewUrl={previewUrl}
            onUsePreset={handleUsePreset}
          />
        ) : (
          <CameraCapture
            onCapture={handleFileSelected}
            previewUrl={previewUrl}
          />
        )}
      </div>

      {/* Optional User Guidance / Budget Filter */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-rose-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Shopping Preferences & Budget Criteria
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Budget */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Budget Target (Per Product)
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

      {/* Scan Button & Scanning Overlay */}
      <div className="text-center">
        {isScanning ? (
          <div className="p-6 rounded-2xl bg-slate-900 border border-rose-500/40 space-y-3 animate-pulse">
            <Loader2 className="w-8 h-8 text-rose-400 animate-spin mx-auto" />
            <p className="text-sm font-bold text-white font-mono">{scanStep}</p>
            <p className="text-xs text-slate-400">Harmonizing vision signals with Joyory product safety rules...</p>
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!selectedFile}
            className={`w-full sm:w-auto px-10 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 mx-auto transition-all shadow-xl ${
              selectedFile
                ? 'bg-gradient-to-r from-rose-500 via-pink-600 to-amber-500 hover:from-rose-600 hover:to-pink-700 text-white shadow-rose-500/25 cursor-pointer hover:scale-105'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>Generate Personalized Regimen & Safety Audit</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
