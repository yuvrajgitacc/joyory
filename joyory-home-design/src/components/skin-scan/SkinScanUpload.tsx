import { useRef, useState } from "react";
import { Scan, ImagePlus, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SkinScanUploadProps {
  selectedImage: string | null;
  onImageSelect: (image: string) => void;
  onStartScan: () => void;
}

export function SkinScanUpload({
  selectedImage,
  onImageSelect,
  onStartScan,
}: SkinScanUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImageSelect(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
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
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImageSelect(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.dataTransfer.files[0]);
    }
  };

  const sampleProfiles = [
    { name: "Aanya", img: "https://i.pravatar.cc/150?img=47" },
    { name: "Riya", img: "https://i.pravatar.cc/150?img=16" },
    { name: "Priya", img: "https://i.pravatar.cc/150?img=44" },
  ];

  return (
    <div className="flex flex-col gap-6 py-2 w-full max-w-sm mx-auto">
      {/* Drag & Drop Upload Area */}
      <div
        className={`group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all duration-300 cursor-pointer relative overflow-hidden ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/40 hover:bg-muted/30"
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {selectedImage ? (
          <div className="relative w-full aspect-[3/4] max-w-[220px] rounded-xl overflow-hidden border border-border shadow-sm">
            <img
              src={selectedImage}
              alt="Selected for scan"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10 transition-opacity hover:opacity-0" />
          </div>
        ) : (
          <div className="flex flex-col items-center py-4">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted shadow-sm border border-border group-hover:scale-110 transition-transform duration-500">
              <ImagePlus className="size-6 text-muted-foreground" />
            </div>
            <p className="text-base font-medium">Tap to upload photo</p>
            <p className="mt-1 text-sm text-muted-foreground">
              or drag and drop here
            </p>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>

      {/* 1-Click Sample Profiles */}
      {!selectedImage && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <p className="text-xs font-medium text-muted-foreground mb-3 text-center">
            Or try with a sample profile
          </p>
          <div className="flex justify-center gap-6">
            {sampleProfiles.map((sample) => (
              <button
                key={sample.name}
                type="button"
                onClick={() => onImageSelect(sample.img)}
                className="flex flex-col items-center gap-2 group outline-none"
              >
                <div className="size-14 rounded-full border-2 border-transparent bg-muted overflow-hidden group-hover:border-primary group-focus:border-primary transition-all shadow-sm group-hover:shadow-md group-hover:scale-105">
                  <img
                    src={sample.img}
                    alt={sample.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground">
                  {sample.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Footer (User's Exact Snippet) */}
      <div className="border-t border-border pt-4">
        <Button
          type="button"
          disabled={!selectedImage}
          onClick={onStartScan}
          className="w-full gap-2 text-sm font-semibold shadow-md transition-transform active:scale-[0.99] py-6"
        >
          <Scan size={18} />
          Scan My Skin
        </Button>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Photos are processed securely in real-time for diagnostic scoring and never stored permanently.
        </p>
      </div>
    </div>
  );
}
