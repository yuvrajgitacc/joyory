import { Scan, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface SkinScanAnimationProps {
  image: string;
  progress: number;
  statusText: string;
  activeLabel: string;
  onCancel?: () => void;
}

export function SkinScanAnimation({
  image,
  progress,
  statusText,
  activeLabel,
  onCancel,
}: SkinScanAnimationProps) {
  // Facial zone targeting based on current scan progress
  const activeZone =
    progress < 25
      ? "forehead"
      : progress < 50
        ? "nose-cheeks"
        : progress < 75
          ? "cheeks-tone"
          : "chin-barrier";

  return (
    <div className="flex flex-col items-center gap-6 py-2">
      {/* Screen Reader Progress Announcement */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {statusText} ({progress}% completed). Current analysis focus: {activeLabel}
      </div>

      {/* Main Scanner Stage */}
      <div className="relative aspect-[3/4] max-h-[380px] w-full max-w-[290px] overflow-hidden rounded-2xl border-2 border-primary/40 bg-black/95 shadow-2xl gpu-accelerated">
        {/* User Face Image */}
        <img
          src={image}
          alt="Skin being scanned"
          className="h-full w-full object-cover opacity-85 transition-opacity duration-500"
        />

        {/* Biometric Analysis Grid Overlay */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-screen"
          style={{
            backgroundImage: 'radial-gradient(circle, #22d3ee 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        {/* High-Tech HUD Reticles & Corner Brackets */}
        <div className="pointer-events-none absolute inset-0 p-3">
          <div className="absolute top-2.5 left-2.5 size-4 border-t-2 border-l-2 border-cyan-400/90 rounded-tl-sm" />
          <div className="absolute top-2.5 right-2.5 size-4 border-t-2 border-r-2 border-cyan-400/90 rounded-tr-sm" />
          <div className="absolute bottom-2.5 left-2.5 size-4 border-b-2 border-l-2 border-cyan-400/90 rounded-bl-sm" />
          <div className="absolute bottom-2.5 right-2.5 size-4 border-b-2 border-r-2 border-cyan-400/90 rounded-br-sm" />

          {/* HUD Header Badge */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-black/75 px-3 py-1 text-[10px] font-mono tracking-wider text-cyan-300 backdrop-blur-md shadow-lg">
            <span className="size-1.5 rounded-full bg-cyan-400 animate-ping" />
            JOYORY CLINICAL SCANNER
          </div>

          {/* Facial Landmark Nodes (Pulsing Targets) */}
          {/* Forehead / T-Zone */}
          <div
            className={`absolute top-[22%] left-1/2 -translate-x-1/2 transition-all duration-300 gpu-accelerated ${
              activeZone === "forehead" ? "scale-125 opacity-100" : "scale-90 opacity-30"
            }`}
          >
            <div className="size-3 rounded-full border border-cyan-300 bg-cyan-400/50 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-black/85 px-1.5 py-0.5 text-[9px] font-medium text-cyan-200 border border-cyan-500/30 backdrop-blur-xs">
              T-Zone
            </span>
          </div>

          {/* Left Cheek */}
          <div
            className={`absolute top-[48%] left-[24%] transition-all duration-300 gpu-accelerated ${
              activeZone === "nose-cheeks" || activeZone === "cheeks-tone"
                ? "scale-125 opacity-100"
                : "scale-90 opacity-30"
            }`}
          >
            <div className="size-2.5 rounded-full border border-cyan-300 bg-cyan-400/40 animate-pulse shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
          </div>

          {/* Right Cheek */}
          <div
            className={`absolute top-[48%] right-[24%] transition-all duration-300 gpu-accelerated ${
              activeZone === "nose-cheeks" || activeZone === "cheeks-tone"
                ? "scale-125 opacity-100"
                : "scale-90 opacity-30"
            }`}
          >
            <div className="size-2.5 rounded-full border border-cyan-300 bg-cyan-400/40 animate-pulse shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
          </div>

          {/* Nose Center */}
          <div
            className={`absolute top-[44%] left-1/2 -translate-x-1/2 transition-all duration-300 gpu-accelerated ${
              activeZone === "nose-cheeks" ? "scale-125 opacity-100" : "scale-90 opacity-30"
            }`}
          >
            <div className="size-2 rounded-full bg-emerald-400/80 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          </div>

          {/* Chin / Jawline */}
          <div
            className={`absolute bottom-[18%] left-1/2 -translate-x-1/2 transition-all duration-300 gpu-accelerated ${
              activeZone === "chin-barrier" ? "scale-125 opacity-100" : "scale-90 opacity-30"
            }`}
          >
            <div className="size-3 rounded-full border border-cyan-300 bg-cyan-400/50 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-black/85 px-1.5 py-0.5 text-[9px] font-medium text-cyan-200 border border-cyan-500/30 backdrop-blur-xs">
              Barrier
            </span>
          </div>
        </div>

        {/* Dynamic Sweeping Laser Scan Line with GPU hardware acceleration */}
        <div
          className="pointer-events-none absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_18px_4px_rgba(34,211,238,0.85)] transition-all duration-100 ease-out gpu-accelerated"
          style={{ top: `${Math.min(Math.max(progress, 4), 96)}%` }}
        >
          {/* Laser Glow Cone */}
          <div className="absolute -top-12 left-0 right-0 h-12 bg-gradient-to-t from-cyan-400/25 to-transparent" />
          <div className="absolute -bottom-2 left-0 right-0 h-2 bg-gradient-to-b from-cyan-400/20 to-transparent" />
        </div>

        {/* Floating Active Status Label */}
        <div className="pointer-events-none absolute bottom-4 left-3 right-3 flex justify-center">
          <div className="flex items-center gap-1.5 rounded-full border border-cyan-500/50 bg-black/85 px-3.5 py-1.5 text-xs font-medium text-cyan-200 shadow-xl backdrop-blur-md">
            <Scan size={13} className="animate-spin text-cyan-400" />
            <span className="tracking-wide">{activeLabel}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar & Status Text */}
      <div className="w-full max-w-[340px] space-y-2.5">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="flex items-center gap-1.5 text-foreground">
            <Scan size={14} className="text-secondary animate-pulse" />
            Skin Diagnostics Active
          </span>
          <span className="font-mono text-sm font-semibold tabular-nums text-primary">
            {progress}%
          </span>
        </div>
        <Progress value={progress} className="h-2.5 bg-muted" />
        <p className="text-center text-xs font-medium text-muted-foreground animate-pulse">
          {statusText}
        </p>
      </div>

      {/* Cancel Scan Button */}
      {onCancel && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
        >
          <X size={14} /> Cancel Scan
        </Button>
      )}
    </div>
  );
}
