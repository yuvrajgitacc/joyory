import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DualScanUpload } from "@/components/skin-engine/DualScanUpload";
import { NarratorCard } from "@/components/skin-engine/NarratorCard";
import { SkinMetricsCard } from "@/components/skin-engine/SkinMetricsCard";
import { RoutineTimeline } from "@/components/skin-engine/RoutineTimeline";
import { ProductBundleCard, type JoyoryProduct } from "@/components/skin-engine/ProductBundleCard";
import { SmartCareCard } from "@/components/skin-engine/SmartCareCard";
import { SkinScanAnimation } from "@/components/skin-scan/SkinScanAnimation";
import { Button } from "@/components/ui/button";
import {
  RotateCcw,
  Printer,
  Sparkles,
  Zap,
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

export const Route = createFileRoute("/optimize-skin")({
  component: OptimizeSkinPage,
});

type Stage = "upload" | "scanning" | "results" | "error";

const SCAN_PHASES = [
  "Preprocessing high-resolution selfie pixels...",
  "Running YOLOv8s ONNX acne & blemish lesion detection...",
  "Calibrating biological skin chrominance (Cr/Cb & RGB locus)...",
  "Computing hydration, texture, and photoprotection signals...",
  "Invoking Gemini 2.5 Flash for natural condition narration...",
  "Querying 498-product catalog & generating Grok rationale...",
  "Executing deterministic ingredient safety & conflict rules...",
  "Finalizing personalized AM / PM skincare regimen...",
];

export function OptimizeSkinPage() {
  const [stage, setStage] = useState<Stage>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<"normal" | "advance">("normal");
  const [scanProgress, setScanProgress] = useState(0);
  const [scanPhaseIndex, setScanPhaseIndex] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOOD, setIsOOD] = useState(false);
  const [bagCount, setBagCount] = useState(0);

  const reset = () => {
    setStage("upload");
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setScanProgress(0);
    setScanPhaseIndex(0);
    setAnalysisResult(null);
    setErrorMessage(null);
    setIsOOD(false);
  };

  const handleStartScan = async (
    file: File,
    mode: "normal" | "advance",
    budget: string,
    skinType: string
  ) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setScanMode(mode);
    setStage("scanning");
    setScanProgress(5);
    setScanPhaseIndex(0);
    setErrorMessage(null);
    setIsOOD(false);

    // Progress animation interval
    const progressInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) return prev;
        const next = prev + Math.floor(Math.random() * 8) + 4;
        const phase = Math.min(
          Math.floor((next / 100) * SCAN_PHASES.length),
          SCAN_PHASES.length - 1
        );
        setScanPhaseIndex(phase);
        return next;
      });
    }, 450);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("scan_mode", mode);
      formData.append("session_id", "demo_user_" + Date.now());
      if (budget !== "all") formData.append("budget", budget);
      if (skinType !== "unknown") formData.append("skin_type", skinType);

      // Backend API call
      const response = await fetch("http://127.0.0.1:8000/api/analyze", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setScanProgress(100);

      const data = await response.json();

      if (!response.ok || data.status === "error" || data.error_code === "OOD_REJECTED") {
        setIsOOD(data.error_code === "OOD_REJECTED");
        setErrorMessage(
          data.message || "Skin analysis could not be completed. Please upload a clear photo of human facial skin."
        );
        setStage("error");
        return;
      }

      setAnalysisResult(data);
      setTimeout(() => {
        setStage("results");
        window.scrollTo({ top: 120, behavior: "smooth" });
      }, 600);
    } catch (err: any) {
      clearInterval(progressInterval);
      setErrorMessage(
        "Could not connect to SkinGenie backend (http://127.0.0.1:8000). Ensure the backend service is running."
      );
      setStage("error");
    }
  };

  const handleAddToBag = (product: JoyoryProduct) => {
    setBagCount((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-background relative selection:bg-primary/20 selection:text-primary">
      {/* Header */}
      <Header bagCount={bagCount} />

      {/* Marquee Banner */}
      <div className="overflow-hidden bg-secondary py-2 text-xs font-medium text-secondary-foreground group">
        <div className="flex min-w-max animate-[marquee_25s_linear_infinite] group-hover:[animation-play-state:paused] gap-20 px-8">
          <span>* Dual-Engine Skin Intelligence: YOLOv8s ONNX + Gemini 2.5 Flash Vision</span>
          <span>* 100% Conflict-Free Regimen Sequencing & Ingredient Safety Audit</span>
          <span>* Grok Ingredient-Level Justification & 498 Clean Joyory Products</span>
          <span>* Smart Replenishment Alerts & Longitudinal Recovery Tracking</span>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-5 py-8 md:px-10 md:py-12">
        {/* Breadcrumb / Top Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Joyory Store</span>
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-semibold">
            <Sparkles className="size-3.5" />
            <span>SkinGenie v2 • Live Engine</span>
          </div>
        </div>

        {/* Hero Section */}
        {stage === "upload" && (
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground tracking-tight">
              Clinical AI Skin Intelligence
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Upload a facial selfie for instant neural blemish detection, moisture-barrier evaluation, and a personalized 4-step Joyory regimen with zero ingredient conflicts.
            </p>
          </div>
        )}

        {/* STAGE 1: UPLOAD */}
        {stage === "upload" && (
          <div className="max-w-3xl mx-auto">
            <DualScanUpload onStartScan={handleStartScan} />
          </div>
        )}

        {/* STAGE 2: SCANNING ANIMATION */}
        {stage === "scanning" && previewUrl && (
          <div className="max-w-md mx-auto py-8">
            <SkinScanAnimation
              image={previewUrl}
              progress={scanProgress}
              statusText={SCAN_PHASES[scanPhaseIndex] || "Executing neural inspection..."}
              activeLabel={
                scanProgress < 25
                  ? "T-Zone Pores"
                  : scanProgress < 50
                    ? "Cheek Hydration"
                    : scanProgress < 75
                      ? "Tone & Pigment"
                      : "Regimen Synthesis"
              }
              onCancel={reset}
            />
          </div>
        )}

        {/* STAGE 3: ERROR / OOD ALERT */}
        {stage === "error" && (
          <div className="max-w-xl mx-auto p-8 rounded-3xl bg-card border border-border shadow-lg text-center space-y-4">
            <div className="size-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="size-7" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              {isOOD ? "Out-of-Distribution Image Detected" : "Scan Error Encountered"}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {errorMessage}
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <Button onClick={reset} className="gap-2 text-xs font-semibold px-6 py-5 rounded-xl">
                <RotateCcw className="size-4" />
                Upload New Photo
              </Button>
            </div>
          </div>
        )}

        {/* STAGE 4: RESULTS PRESENTATION */}
        {stage === "results" && analysisResult && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Persistent Non-Medical Disclaimer Banner */}
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-amber-900 text-xs shadow-xs">
              <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Non-Medical Disclaimer:</strong> All skin signal scores, blemish assessments, and tone indices are relative cosmetic estimations derived from 2D camera pixels. Results are lighting-dependent and do not constitute clinical dermatology advice. Consult a certified medical dermatologist for persistent or inflamed skin conditions.
              </p>
            </div>

            {/* Top Results Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border shadow-xs">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <CheckCircle className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">Diagnostic Regimen Complete</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">Active Scanner:</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/30">
                      {analysisResult.vision?.scanner_label ||
                        (scanMode === "advance"
                          ? "Advance Multimodal Vision (Gemini 2.5 Flash + YOLOv8s)"
                          : "Standard Neural AI (YOLOv8s ONNX + CV Heuristics)")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={reset}
                  className="text-xs gap-1.5 rounded-xl h-10 px-4 cursor-pointer"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Retake Scan</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="text-xs gap-1.5 rounded-xl h-10 px-4 cursor-pointer"
                >
                  <Printer className="size-3.5" />
                  <span>Print Report</span>
                </Button>
              </div>
            </div>

            {/* 2-Column Responsive Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Narrative, Daily AM/PM Architecture, Smart Care Tracking */}
              <div className="lg:col-span-7 space-y-8">
                {/* 1. Gemini Hinglish Consultant Narrative */}
                <NarratorCard
                  narrativeText={
                    analysisResult.narrator_description ||
                    analysisResult.vision?.narrator_description
                  }
                  skinType={analysisResult.vision?.skin_type}
                />

                {/* 2. Daily AM / PM Architecture */}
                <RoutineTimeline
                  routineData={analysisResult.routine}
                  safetyData={analysisResult.safety}
                />

                {/* 3. Smart Care & Replenishment Tracking */}
                <SmartCareCard
                  replenishmentData={analysisResult.replenishment}
                  progressData={analysisResult.progress}
                />
              </div>

              {/* Right Column: Image-Derived Skin Signals, Selected Joyory Formulations */}
              <div className="lg:col-span-5 space-y-8">
                {/* 1. Image-Derived Skin Signals */}
                <SkinMetricsCard visionData={analysisResult.vision} />

                {/* 2. Selected Joyory Formulations (4) */}
                <ProductBundleCard
                  products={analysisResult.recommendations?.primary_bundle || []}
                  bundlePricing={analysisResult.recommendations?.bundle_pricing}
                  onAddToBag={handleAddToBag}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
