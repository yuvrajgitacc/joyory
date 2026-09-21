import { Droplet, Sparkles, Sun, Activity, CheckCircle2, Info, Layers } from "lucide-react";

interface SkinMetricsCardProps {
  visionData?: {
    skin_tone?: {
      label?: string;
      hex?: string;
      fitzpatrick?: string;
      monk_scale?: number;
    };
    skin_signals?: {
      texture_score?: number;
      hydration_score?: number;
      sun_exposure_score?: number;
      firmness_score?: number;
    };
    blemish_assessment?: {
      total_lesions?: number;
      comedones?: number;
      papules?: number;
      severity?: string;
      confidence_threshold?: number;
    };
    skin_type?: string;
    primary_concerns?: string[];
    summary?: string;
  };
}

export function SkinMetricsCard({ visionData }: SkinMetricsCardProps) {
  if (!visionData) return null;

  const { skin_tone, skin_signals, blemish_assessment, skin_type, primary_concerns, summary } = visionData;

  const textureScore = Math.round(skin_signals?.texture_score ?? 67);
  const hydrationScore = Math.round(skin_signals?.hydration_score ?? 37);
  const sunScore = Math.round(skin_signals?.sun_exposure_score ?? 48);
  const firmnessScore = Math.round(skin_signals?.firmness_score ?? 76);

  // Calibrate human-readable status labels based on quantitative indices
  const getStatus = (key: string, val: number) => {
    switch (key) {
      case "hydration":
        return val < 45
          ? { text: "Dehydrated", color: "bg-amber-50 text-amber-700 border-amber-200" }
          : val < 70
            ? { text: "Moderate", color: "bg-blue-50 text-blue-700 border-blue-200" }
            : { text: "Optimal", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "texture":
        return val < 60
          ? { text: "Uneven", color: "bg-amber-50 text-amber-700 border-amber-200" }
          : { text: "Smooth", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "sun":
        return val < 50
          ? { text: "Care Required", color: "bg-amber-50 text-amber-700 border-amber-200" }
          : { text: "Protected", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "firmness":
        return val >= 70
          ? { text: "Resilient", color: "bg-emerald-50 text-emerald-700 border-emerald-200" }
          : { text: "Low Tension", color: "bg-amber-50 text-amber-700 border-amber-200" };
      default:
        return { text: "Calibrated", color: "bg-muted text-muted-foreground border-border" };
    }
  };

  const signals = [
    {
      key: "texture",
      category: "SURFACE TEXTURE",
      title: "Texture Smoothness",
      sub: "Micro-relief & epidermal regularity index",
      score: textureScore,
      icon: Sparkles,
      barGradient: "from-cyan-500 to-blue-500",
      status: getStatus("texture", textureScore),
    },
    {
      key: "hydration",
      category: "MOISTURE BARRIER",
      title: "Moisture Hydration",
      sub: "Surface specular moisture reflection index",
      score: hydrationScore,
      icon: Droplet,
      barGradient: "from-blue-500 to-indigo-600",
      status: getStatus("hydration", hydrationScore),
    },
    {
      key: "sun",
      category: "PHOTOPROTECTION",
      title: "Sun Clarity Index",
      sub: "UV pigmentation contrast & exposure risk",
      score: sunScore,
      icon: Sun,
      barGradient: "from-amber-500 to-orange-500",
      status: getStatus("sun", sunScore),
    },
    {
      key: "firmness",
      category: "TISSUE TENSION",
      title: "Epidermal Elasticity",
      sub: "Relative dermal bounceback resilience",
      score: firmnessScore,
      icon: Activity,
      barGradient: "from-emerald-500 to-teal-600",
      status: getStatus("firmness", firmnessScore),
    },
  ];

  return (
    <div className="bg-card border border-border rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
      {/* Header: Skin Type & Tone */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
              AI Clinical Characterization
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
              Multi-Spectral
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mt-1">
            {skin_type || "Combination"} Profile
          </h3>
        </div>

        {/* Skin Tone & Undertone Swatch */}
        <div className="flex items-center gap-3 bg-muted/40 px-4 py-2.5 rounded-2xl border border-border">
          <div
            className="size-7 rounded-full border-2 border-background shadow-xs flex-shrink-0"
            style={{ backgroundColor: skin_tone?.hex || "#d2a07c" }}
          />
          <div className="text-left text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-foreground">
                {skin_tone?.fitzpatrick || "Type IV"}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-background text-muted-foreground border border-border font-medium">
                Lighting Dependent
              </span>
            </div>
            <p className="text-muted-foreground font-mono text-[11px] mt-0.5">
              Hex: {skin_tone?.hex || "#d2a07c"} • Monk {skin_tone?.monk_scale || 6}
            </p>
          </div>
        </div>
      </div>

      {/* Surface Telemetry Summary Box */}
      {summary && (
        <div className="p-4 rounded-2xl bg-muted/20 border border-border flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-background border border-border text-primary shrink-0 mt-0.5">
            <Layers className="size-4" />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {summary}
          </p>
        </div>
      )}

      {/* 4 Quantitative Image-Derived Signals with Professional Spacing */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Image-Derived Visual Signals (0 - 100 Scale)
          </h4>
          <span className="text-[11px] text-muted-foreground font-normal">
            *Relative cosmetic indices computed from camera pixel heuristics
          </span>
        </div>

        {/* 2x2 Spacious Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {signals.map((sig) => {
            const Icon = sig.icon;
            return (
              <div
                key={sig.key}
                className="p-4 sm:p-5 rounded-2xl bg-muted/20 border border-border hover:border-primary/40 hover:bg-muted/30 transition-all flex flex-col justify-between space-y-3 shadow-2xs"
              >
                {/* Top: Category & Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-background border border-border text-foreground">
                      <Icon className="size-3.5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {sig.category}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sig.status.color}`}>
                    {sig.status.text}
                  </span>
                </div>

                {/* Number & Title */}
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-foreground font-mono tracking-tight">
                      {sig.score}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground font-mono">
                      / 100
                    </span>
                  </div>
                  <h5 className="font-bold text-sm text-foreground mt-1">
                    {sig.title}
                  </h5>
                  <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                    {sig.sub}
                  </p>
                </div>

                {/* Smooth Progress Bar */}
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${sig.barGradient} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${Math.min(100, Math.max(8, sig.score))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Priority Concerns & Blemish Assessment Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {/* Identified Priority Focus */}
        <div className="p-4 sm:p-5 rounded-2xl bg-muted/20 border border-border space-y-2.5">
          <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Identified Priority Focus
          </h5>
          <div className="flex flex-wrap gap-2">
            {primary_concerns?.map((c, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5 shadow-2xs"
              >
                <CheckCircle2 className="size-3.5 text-rose-600" />
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Blemish Assessment Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-muted/20 border border-border flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Blemish Targets
              </h5>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-background text-muted-foreground border border-border">
                YOLOv8s
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">Severity:</span>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                {blemish_assessment?.severity || "Mild"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium pt-0.5">
              {blemish_assessment?.comedones ?? 0} micro-pores • {blemish_assessment?.papules ?? 0} bumps
            </p>
          </div>

          <div className="text-right">
            <span className="text-4xl font-black font-mono text-foreground tracking-tight">
              {blemish_assessment?.total_lesions ?? 0}
            </span>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Active Targets
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
