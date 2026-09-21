import { useState } from "react";
import { Bell, Clock, MessageSquare, Send, CheckCircle2, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReplenishmentItem {
  product_name: string;
  brand: string;
  volume_size: string;
  dosage_guide: string;
  estimated_total_days: number;
  reminder_date_str: string;
  whatsapp_simulation?: {
    message: string;
    action_label: string;
  };
}

interface ProgressHistoryItem {
  timestamp: string;
  session_id: string;
  texture_score?: number;
  hydration_score?: number;
  total_spots?: number;
}

interface SmartCareCardProps {
  replenishmentData?: {
    schedule?: ReplenishmentItem[];
    summary?: {
      estimated_monthly_investment?: number;
    };
  };
  progressData?: {
    timeline?: ProgressHistoryItem[];
    total_scans?: number;
    trend_summary?: string;
  };
}

export function SmartCareCard({ replenishmentData, progressData }: SmartCareCardProps) {
  const [activeNotification, setActiveNotification] = useState<ReplenishmentItem | null>(null);
  const [reminderSimulated, setReminderSimulated] = useState(false);

  if (!replenishmentData) return null;

  const { schedule = [], summary = {} } = replenishmentData;

  const handleSimulateWhatsApp = (item: ReplenishmentItem) => {
    setActiveNotification(item);
    setReminderSimulated(true);
    setTimeout(() => {
      setReminderSimulated(false);
    }, 5000);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
            Continuous Care Architecture
          </span>
          <h3 className="text-2xl font-bold text-foreground mt-0.5">
            Smart Care & Progress Tracking
          </h3>
        </div>

        {/* Monthly Investment Metric */}
        <div className="bg-muted/60 px-4 py-2 rounded-xl border border-border text-right self-start sm:self-auto">
          <span className="text-[11px] text-muted-foreground uppercase block font-medium">
            Estimated Monthly Care
          </span>
          <span className="text-xl font-bold text-emerald-600 font-mono">
            ₹{summary.estimated_monthly_investment ?? (schedule.length > 0 ? Math.round(schedule.reduce((acc, s) => acc + ((s.price || 500) / (s.estimated_total_days || 30)) * 30, 0)) : 0)}{" "}
            <span className="text-xs font-normal text-muted-foreground">/mo</span>
          </span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        SkinGenie forecasts formulation exhaustion and triggers automated replenishment alerts before your skin's active treatment cycle is interrupted.
      </p>

      {/* WhatsApp Simulation Toast when triggered */}
      {reminderSimulated && activeNotification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-start gap-3 shadow-md animate-in fade-in slide-in-from-top-2">
          <MessageSquare className="size-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <strong className="font-bold text-emerald-950">WhatsApp Care Dispatch Simulation:</strong>
              <span className="text-[10px] text-emerald-700 font-mono">Joyory Automated Assistant</span>
            </div>
            <p className="mt-1 text-emerald-800">
              "{activeNotification.whatsapp_simulation?.message}"
            </p>
          </div>
        </div>
      )}

      {/* Replenishment Schedule Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schedule.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-muted/20 border border-border flex flex-col justify-between space-y-3 hover:border-primary/40 transition-all"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-rose-600 uppercase">{item.brand}</span>
                <span className="px-2 py-0.5 rounded bg-background text-muted-foreground text-[10px] border border-border font-mono">
                  {item.volume_size}
                </span>
              </div>
              <h4 className="text-sm font-bold text-foreground line-clamp-1">{item.product_name}</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">Dosage: {item.dosage_guide}</p>
            </div>

            {/* Timeline Metrics */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-xs">
              <div className="bg-background p-2 rounded-lg border border-border">
                <span className="text-[10px] text-muted-foreground block">Est. Duration</span>
                <span className="font-bold text-foreground font-mono">{item.estimated_total_days} Days</span>
              </div>
              <div className="bg-background p-2 rounded-lg border border-border">
                <span className="text-[10px] text-muted-foreground block">Smart Alert On</span>
                <span className="font-bold text-amber-600 font-mono">{item.reminder_date_str}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSimulateWhatsApp(item)}
                className="flex-1 py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Send className="size-3 text-emerald-700" />
                <span>Simulate WhatsApp Alert</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Longitudinal Progress Tracker if available */}
      {progressData && progressData.timeline && progressData.timeline.length > 0 && (
        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="size-4 text-primary" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Longitudinal Recovery Tracking
            </h4>
          </div>
          <p className="text-xs text-muted-foreground">
            Total scans logged: <strong className="text-foreground">{progressData.total_scans || 1}</strong>.
            Keep scanning every 14 days to benchmark hydration and barrier recovery over time!
          </p>
        </div>
      )}
    </div>
  );
}
