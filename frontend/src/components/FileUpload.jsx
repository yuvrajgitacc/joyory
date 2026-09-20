import React, { useState } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, Check } from 'lucide-react';

export default function FileUpload({ onFileSelected, previewUrl, onUsePreset }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelected(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag & drop dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
          isDragging
            ? 'border-rose-500 bg-rose-500/10'
            : 'border-slate-700 bg-slate-950/60 hover:border-slate-600 hover:bg-slate-900/50'
        }`}
        onClick={() => document.getElementById('file-input-hidden').click()}
      >
        <input
          id="file-input-hidden"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />

        {previewUrl ? (
          <div className="flex flex-col items-center space-y-3">
            <div className="w-36 h-36 rounded-2xl overflow-hidden border-2 border-rose-500/80 shadow-lg shadow-rose-500/20">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <p className="text-xs text-rose-300 font-semibold flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Ready for multi-agent evaluation
            </p>
            <p className="text-[11px] text-slate-400">Click or drop another file to replace</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Drag & drop your facial selfie here</p>
              <p className="text-xs text-slate-400 mt-1">Supports high-res JPG, PNG, WEBP (front-facing, well-lit)</p>
            </div>
            <span className="inline-block px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors">
              Browse from Computer
            </span>
          </div>
        )}
      </div>

      {/* Demo Presets Bar for Hackathon Pitching */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Or test with pitch presets (Instant Demo):
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onUsePreset('acne')}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left text-xs transition-colors"
          >
            <span className="font-bold text-white block">Preset 1</span>
            <span className="text-[11px] text-rose-400">Oily / Blemish T-Zone</span>
          </button>
          <button
            type="button"
            onClick={() => onUsePreset('dry')}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left text-xs transition-colors"
          >
            <span className="font-bold text-white block">Preset 2</span>
            <span className="text-[11px] text-blue-400">Dry / Dehydrated</span>
          </button>
          <button
            type="button"
            onClick={() => onUsePreset('pigment')}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left text-xs transition-colors"
          >
            <span className="font-bold text-white block">Preset 3</span>
            <span className="text-[11px] text-amber-400">Sun Damage / Dull</span>
          </button>
        </div>
      </div>
    </div>
  );
}
