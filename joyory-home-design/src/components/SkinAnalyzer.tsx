import { useState, useCallback, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { X, RotateCcw, ChevronRight, Activity, ShieldCheck, Droplets, Sun, Zap, Heart, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { SkinScanUpload } from "./skin-scan/SkinScanUpload";
import { SkinScanAnimation } from "./skin-scan/SkinScanAnimation";

type Stage = "upload" | "scanning" | "results";

/* ------------------------------------------------------------------ */
/*  Mock Result Data                                                  */
/* ------------------------------------------------------------------ */
const MOCK_RESULT = {
  overallScore: 82,
  skinType: "Combination",
  summary: "Your skin barrier is resilient. The T-zone shows moderate sebum levels and cheek areas are well hydrated.",
  metrics: [
    { label: "Hydration", value: 78, status: "good", icon: Droplets, detail: "Optimal hydration levels detected." },
    { label: "Elasticity", value: 85, status: "good", icon: Activity, detail: "Firm skin barrier with high elasticity." },
    { label: "UV Exposure", value: 45, status: "moderate", icon: Sun, detail: "Mild sun exposure signs. SPF recommended." },
    { label: "Pore Health", value: 68, status: "moderate", icon: ShieldCheck, detail: "Some congestion in the T-Zone." },
    { label: "Radiance", value: 92, status: "good", icon: Zap, detail: "Excellent natural glow." },
    { label: "Sensitivity", value: 20, status: "good", icon: Heart, detail: "Low reactivity detected." },
  ],
  recommendations: [
    "Continue with your current hydrating cleanser.",
    "Introduce a lightweight BHA for T-zone pores.",
    "Maintain daily SPF 50+ application.",
  ],
};

const SCAN_PHASES = [
  "Analyzing facial topography...",
  "Scanning T-zone sebum & pore dilation...",
  "Checking cheek hydration levels...",
  "Evaluating UV impact & pigmentation...",
  "Measuring collagen elasticity & barrier...",
  "Synthesizing diagnostic report...",
];

export function SkinAnalyzer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [stage, setStage] = useState<Stage>("upload");
  const [image, setImage] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanPhase, setScanPhase] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const reset = useCallback(() => {
    setStage("upload");
    setImage(null);
    setScanProgress(0);
    setScanPhase(0);
    setShowResults(false);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const startScan = useCallback(() => {
    setStage("scanning");
    setScanProgress(0);
    setScanPhase(0);
  }, []);

  useEffect(() => {
    if (stage !== "scanning") return;
    const dur = 4000;
    const tick = 30;
    let t = 0;
    const id = setInterval(() => {
      t += tick;
      const p = Math.min((t / dur) * 100, 100);
      setScanProgress(Math.floor(p));
      setScanPhase(Math.min(Math.floor((p / 100) * SCAN_PHASES.length), SCAN_PHASES.length - 1));
      if (p >= 100) {
        clearInterval(id);
        setTimeout(() => {
          setStage("results");
          requestAnimationFrame(() => setShowResults(true));
        }, 500);
      }
    }, tick);
    return () => clearInterval(id);
  }, [stage]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={handleClose} 
        style={{ animation: "fadeIn .3s ease" }} 
      />

      <div
        className="relative z-10 flex w-full max-w-md flex-col overflow-hidden bg-background rounded-3xl border border-border shadow-2xl"
        style={{
          maxHeight: "min(90vh, 800px)",
          animation: "scaleIn .3s cubic-bezier(.16,1,.3,1)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <h2 className="text-base font-semibold tracking-tight">
            {stage === "upload" && "Skin Analysis"}
            {stage === "scanning" && "Clinical Scan"}
            {stage === "results" && "Diagnostic Results"}
          </h2>
          <div className="flex items-center gap-2">
            <Link
              to="/optimize-skin"
              onClick={handleClose}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>Full Studio</span>
              <ChevronRight className="size-3" />
            </Link>
            <button 
              onClick={handleClose} 
              className="grid size-8 place-items-center rounded-full bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-none p-5 sm:p-6">
          {stage === "upload" && (
            <SkinScanUpload
              selectedImage={image}
              onImageSelect={setImage}
              onStartScan={startScan}
            />
          )}

          {stage === "scanning" && image && (
            <SkinScanAnimation
              image={image}
              progress={scanProgress}
              statusText={SCAN_PHASES[scanPhase] || "Scanning..."}
              activeLabel={scanProgress < 25 ? "T-Zone" : scanProgress < 50 ? "Hydration" : scanProgress < 75 ? "Pigment" : "Barrier"}
              onCancel={reset}
            />
          )}

          {stage === "results" && image && (
             <div className={cn("transition-all duration-700 bg-background", showResults ? "opacity-100" : "opacity-0 translate-y-8")}>
              
             {/* Hero Result */}
             <div className="relative overflow-hidden rounded-2xl bg-muted/30 p-5 sm:p-6 border border-border mb-6">
               <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
                 {/* Score Ring */}
                 <div className="relative flex size-24 shrink-0 items-center justify-center">
                   <svg className="absolute size-full -rotate-90" viewBox="0 0 100 100">
                     <circle cx="50" cy="50" r="44" fill="none" stroke="var(--border)" strokeWidth="6" />
                     <circle
                       cx="50" cy="50" r="44" fill="none"
                       stroke="var(--primary)" strokeWidth="6" strokeLinecap="round"
                       strokeDasharray={`${2 * Math.PI * 44}`}
                       strokeDashoffset={`${2 * Math.PI * 44 * (1 - (showResults ? MOCK_RESULT.overallScore / 100 : 0))}`}
                       className="transition-all duration-[1.5s] ease-out"
                     />
                   </svg>
                   <div className="text-center">
                     <span className="text-3xl font-bold tracking-tighter">{MOCK_RESULT.overallScore}</span>
                     <span className="block text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">Score</span>
                   </div>
                 </div>
                 <div className="text-center sm:text-left space-y-2">
                   <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                     <CheckCircle className="size-3.5" />
                     {MOCK_RESULT.skinType} Skin
                   </div>
                   <h3 className="text-lg font-semibold">Overall Analysis</h3>
                   <p className="text-sm leading-relaxed text-muted-foreground">{MOCK_RESULT.summary}</p>
                 </div>
               </div>
             </div>
             
             {/* Detailed Metrics */}
             <div className="space-y-6">
               <div>
                 <h3 className="text-base font-semibold mb-4">Detailed Metrics</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {MOCK_RESULT.metrics.map((m, i) => (
                     <div
                       key={m.label}
                       className="group flex flex-col justify-center rounded-xl border border-border bg-card p-4 shadow-sm"
                       style={{ animation: `fadeSlideUp .5s ease ${200 + i * 100}ms both` }}
                     >
                       <div className="flex items-center justify-between mb-3">
                         <div className="flex items-center gap-2.5">
                           <div className={cn(
                             "flex size-7 items-center justify-center rounded-full",
                             m.status === 'good' ? 'bg-emerald-500/10 text-emerald-600' :
                             m.status === 'moderate' ? 'bg-amber-500/10 text-amber-600' :
                             'bg-red-500/10 text-red-600'
                           )}>
                             <m.icon className="size-3.5" />
                           </div>
                           <span className="font-medium text-xs">{m.label}</span>
                         </div>
                         <span className="font-semibold text-sm tabular-nums">{m.value}%</span>
                       </div>
                       <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted mb-2">
                         <div
                           className={cn(
                             "h-full rounded-full transition-[width] duration-[1.2s] ease-out",
                             m.status === 'good' ? 'bg-emerald-500' :
                             m.status === 'moderate' ? 'bg-amber-500' :
                             'bg-red-500'
                           )}
                           style={{ width: showResults ? `${m.value}%` : "0%", transitionDelay: `${300 + i * 100}ms` }}
                         />
                       </div>
                       <p className="text-[11px] text-muted-foreground leading-relaxed">{m.detail}</p>
                     </div>
                   ))}
                 </div>
               </div>
               
               {/* Care Plan */}
               <div>
                 <h3 className="text-base font-semibold mb-4">Care Plan</h3>
                 <div className="space-y-3">
                   {MOCK_RESULT.recommendations.map((r, i) => (
                     <div
                       key={i}
                       className="flex items-start gap-3 rounded-lg bg-muted/40 p-3.5"
                       style={{ animation: `fadeSlideUp .5s ease ${600 + i * 100}ms both` }}
                     >
                       <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-background border border-primary/20 text-primary mt-0.5">
                         <span className="text-[10px] font-bold">{i + 1}</span>
                       </div>
                       <p className="text-xs leading-relaxed font-medium">{r}</p>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
             
             <div className="flex items-start gap-2.5 rounded-xl border border-border bg-card p-4 mt-6">
                 <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                 <p className="text-[11px] text-muted-foreground leading-relaxed">
                   This analysis uses AI for cosmetic suggestions. It is not a medical diagnosis.
                 </p>
               </div>
             
             {/* Bottom Actions */}
             <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border" style={{ animation: "fadeSlideUp .4s ease .8s both" }}>
               <Button variant="outline" className="flex-1 rounded-xl h-11 text-xs" onClick={reset}>
                 <RotateCcw className="size-3.5 mr-2" /> Retake
               </Button>
               <Button className="flex-[2] rounded-xl h-11 text-xs" onClick={handleClose}>
                 Shop Skincare <ChevronRight className="size-3.5 ml-2" />
               </Button>
             </div>
             
           </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(.97) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
