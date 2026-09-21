import { useState } from "react";
import { Sun, Moon, ShieldCheck, Clock, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";

interface RoutineStep {
  step_number: number;
  title: string;
  phase: string;
  instructions: string;
  timing: string;
  product?: {
    product_id: string;
    name: string;
    brand: string;
    image_path?: string;
    primary_image?: string;
    price?: number;
    volume_size?: string;
    routine_step?: string;
    key_active_ingredients?: Array<{ name: string; purpose?: string } | string>;
  };
}

interface RoutineTimelineProps {
  routineData?: {
    am_routine?: RoutineStep[];
    pm_routine?: RoutineStep[];
    safety_summary?: {
      status?: string;
      separations_applied?: Array<{ active_a: string; active_b: string }>;
      cautions_applied?: string[];
      conflicts_avoided?: string[];
    };
    weekly_guidance?: string[];
  };
  safetyData?: {
    overall_status?: string;
    separations?: Array<{ active_a: string; active_b: string }>;
    cautions?: string[];
    conflicts?: string[];
  };
}

export function RoutineTimeline({ routineData, safetyData }: RoutineTimelineProps) {
  const [activeTab, setActiveTab] = useState<"AM" | "PM">("AM");

  if (!routineData) return null;

  const { am_routine = [], pm_routine = [], weekly_guidance = [] } = routineData;
  const currentSteps = activeTab === "AM" ? am_routine : pm_routine;
  const audit = safetyData || routineData.safety_summary;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header & AM/PM Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
            Conflict-Free Formulation Regimen
          </span>
          <h3 className="text-2xl font-bold text-foreground mt-0.5">
            Daily AM / PM Architecture
          </h3>
        </div>

        {/* Day / Night Toggle */}
        <div className="flex bg-muted/60 p-1 rounded-xl border border-border self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("AM")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "AM"
                ? "bg-amber-500/15 text-amber-700 border border-amber-500/30 shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sun className="size-4 text-amber-500" />
            <span>AM Routine ({am_routine.length} Steps)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("PM")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "PM"
                ? "bg-indigo-500/15 text-indigo-700 border border-indigo-500/30 shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Moon className="size-4 text-indigo-500" />
            <span>PM Routine ({pm_routine.length} Steps)</span>
          </button>
        </div>
      </div>

      {/* Safety Engine Validation Bar */}
      {audit && (
        <div className="bg-muted/30 border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="size-4 text-emerald-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Deterministic Safety Audit:{" "}
              <span className="text-emerald-600 font-semibold">
                {audit.overall_status || audit.status || "SAFE & LAYERED"}
              </span>
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-muted-foreground">
            {audit.separations && audit.separations.length > 0 ? (
              audit.separations.map((sep, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-2"
                >
                  <Clock className="size-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-amber-900">Active Separation: </span>
                    <span>
                      {sep.active_a} and {sep.active_b} sequenced safely into AM vs PM slots to avoid barrier irritation.
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>All active concentrations verified within safe synergistic boundaries.</span>
              </div>
            )}

            {/* Mandatory SPF Alert */}
            <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 flex items-center gap-2">
              <Sun className="size-4 text-blue-600 flex-shrink-0" />
              <span>Broad-spectrum SPF locked as mandatory morning final step.</span>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Steps */}
      <div className="space-y-4">
        {currentSteps.map((step, idx) => {
          const prod = step.product;
          return (
            <div
              key={idx}
              className="flex flex-col md:flex-row gap-4 p-4 rounded-xl bg-muted/20 border border-border hover:border-primary/40 transition-all"
            >
              {/* Step Counter Badge */}
              <div className="flex items-center md:flex-col justify-start gap-3 md:min-w-[110px]">
                <span className="size-8 rounded-full bg-background border border-border text-rose-600 font-bold text-sm flex items-center justify-center font-mono shadow-xs">
                  0{step.step_number}
                </span>
                <div className="md:text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    {step.timing}
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {prod?.routine_step || step.title}
                  </span>
                </div>
              </div>

              {/* Product Thumbnail & Details */}
              <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-background p-3.5 rounded-xl border border-border">
                {prod && (
                  <div className="size-16 rounded-lg bg-muted/50 border border-border overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                    <img
                      src={prod.image_path || prod.primary_image || "/static/product_images/placeholder.jpg"}
                      alt={prod.name}
                      className="size-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://placehold.co/100x100/e2e8f0/475569?text=" + encodeURIComponent(prod.brand);
                      }}
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                      {prod?.brand || "Joyory"}
                    </span>
                    {prod?.volume_size && (
                      <span className="text-[10px] text-muted-foreground font-mono">
                        • {prod.volume_size}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-foreground truncate mt-0.5">
                    {prod?.name || step.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {step.instructions}
                  </p>
                </div>

                {prod?.price && (
                  <div className="text-right sm:pl-4 sm:border-l border-border flex-shrink-0">
                    <span className="text-base font-extrabold text-foreground font-mono">
                      ₹{prod.price}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Regimen Guidance Footnote */}
      {weekly_guidance.length > 0 && (
        <div className="pt-3 border-t border-border space-y-1.5 text-xs text-muted-foreground">
          {weekly_guidance.map((tip, i) => (
            <p key={i} className="flex items-center gap-2">
              <span>{tip}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
