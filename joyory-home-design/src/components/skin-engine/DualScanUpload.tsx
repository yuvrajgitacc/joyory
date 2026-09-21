import { useState, useRef } from "react";
import { UploadCloud, Zap, Sparkles, X, Sliders, ShieldCheck, Check, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DualScanUploadProps {
  onStartScan: (file: File, scanMode: "normal" | "advance", budget: string, skinType: string) => void;
  disabled?: boolean;
}

export function DualScanUpload({ onStartScan, disabled = false }: DualScanUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [budget, setBudget] = useState("all");
  const [skinType, setSkinType] = useState("unknown");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Demo pitch presets for judges/reviewers
  const handleUsePreset = async (presetType: string) => {
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (presetType === "acne") {
      ctx.fillStyle = "#d2a07c";
      ctx.fillRect(0, 0, 300, 300);
      ctx.fillStyle = "#a83232";
      for (let i = 0; i < 6; i++) {
        const x = 70 + (i % 3) * 60;
        const y = 80 + Math.floor(i / 3) * 70;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (presetType === "dry") {
      ctx.fillStyle = "#e8c8b0";
      ctx.fillRect(0, 0, 300, 300);
      ctx.fillStyle = "#f5dcd0";
      for (let i = 0; i < 40; i++) {
        ctx.fillRect(Math.random() * 300, Math.random() * 300, 4, 1);
      }
    } else {
      ctx.fillStyle = "#c69269";
      ctx.fillRect(0, 0, 300, 300);
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `preset_${presetType}.jpg`, { type: "image/jpeg" });
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      }
    }, "image/jpeg");
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
      {/* Upload Zone */}
      <div
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 sm:p-10 text-center transition-all ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        } ${previewUrl ? "border-solid border-border" : "cursor-pointer"}`}
        onClick={() => !previewUrl && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <div className="relative flex flex-col items-center gap-3">
            <div className="relative size-48 sm:size-60 rounded-2xl overflow-hidden border-2 border-border shadow-md">
              <img
                src={previewUrl}
                alt="Selected selfie preview"
                className="size-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearImage();
                }}
                className="absolute top-2 right-2 size-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition-colors"
                title="Remove image"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedFile?.name} ({(selectedFile ? selectedFile.size / 1024 : 0).toFixed(1)} KB)
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4">
            <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-3 text-muted-foreground shadow-xs">
              <UploadCloud className="size-8" />
            </div>
            <h4 className="font-bold text-base text-foreground">
              Upload High-Resolution Skin Photo
            </h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Drag & drop selfie, or click to browse. Natural lighting, clean skin, no heavy filters.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/60 text-[11px] text-muted-foreground border border-border">
              <ShieldCheck className="size-3.5 text-emerald-600" />
              <span>Biometric privacy preserved • Real-time in-memory analysis</span>
            </div>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Quick Demo Presets */}
      {!previewUrl && (
        <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-muted-foreground font-medium">Quick Demo Pitch Presets:</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleUsePreset("acne")}
              className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border font-medium transition-colors cursor-pointer"
            >
              Acne-Prone
            </button>
            <button
              type="button"
              onClick={() => handleUsePreset("dry")}
              className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border font-medium transition-colors cursor-pointer"
            >
              Dry Barrier
            </button>
            <button
              type="button"
              onClick={() => handleUsePreset("glow")}
              className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border font-medium transition-colors cursor-pointer"
            >
              Normal Tone
            </button>
          </div>
        </div>
      )}

      {/* Preferences & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
            Budget Preference (Optional)
          </label>
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary transition-colors cursor-pointer"
          >
            <option value="all">All Formulations (Best Fit)</option>
            <option value="affordable">Value / Budget (Under ₹700)</option>
            <option value="luxury">Luxury / Premium (₹1,000+)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
            Skin Type Override (Optional)
          </label>
          <select
            value={skinType}
            onChange={(e) => setSkinType(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary transition-colors cursor-pointer"
          >
            <option value="unknown">Auto-Detect via AI Models</option>
            <option value="Combination">Combination</option>
            <option value="Oily">Oily / Sebum-Prone</option>
            <option value="Dry">Dry / Dehydrated</option>
            <option value="Sensitive">Sensitive</option>
            <option value="Normal">Normal</option>
          </select>
        </div>
      </div>

      {/* Dual Scan Mode Action Buttons */}
      <div className="pt-4 border-t border-border space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-semibold uppercase tracking-wider text-[11px]">
            Choose AI Scanning Engine:
          </span>
          <span>{selectedFile ? "Ready to analyze" : "Upload photo to activate"}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Option 1: Standard Neural AI Scan */}
          <button
            type="button"
            disabled={!selectedFile || disabled}
            onClick={() => selectedFile && onStartScan(selectedFile, "normal", budget, skinType)}
            className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
              selectedFile && !disabled
                ? "bg-card border-border hover:border-primary hover:shadow-md active:scale-[0.99]"
                : "bg-muted/40 border-border opacity-50 cursor-not-allowed"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                YOLOv8s ONNX + Local CV
              </span>
              <Sparkles className="size-4 text-primary" />
            </div>
            <h5 className="font-bold text-base text-foreground">
              Standard Neural AI Scan
            </h5>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Local edge models execute zero-cost visual telemetry. Gemini receives structured diagnostic JSON only.
            </p>
          </button>

          {/* Option 2: Advance Multimodal Scan */}
          <button
            type="button"
            disabled={!selectedFile || disabled}
            onClick={() => selectedFile && onStartScan(selectedFile, "advance", budget, skinType)}
            className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
              selectedFile && !disabled
                ? "bg-rose-50/50 border-rose-200 hover:border-rose-400 hover:shadow-md active:scale-[0.99]"
                : "bg-muted/40 border-border opacity-50 cursor-not-allowed"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-300">
                Gemini 2.5 Flash + Vision Models
              </span>
              <Zap className="size-4 text-rose-600" />
            </div>
            <h5 className="font-bold text-base text-rose-950">
              Advance Multimodal Scan
            </h5>
            <p className="text-xs text-rose-800/80 mt-1 leading-relaxed">
              Gemini Vision inspects image bytes directly alongside local model telemetry for deep visual cross-validation.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
