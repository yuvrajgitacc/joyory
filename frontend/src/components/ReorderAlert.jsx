import React, { useState } from 'react';
import { Bell, Calendar, Clock, MessageSquare, Check, Sparkles, Send } from 'lucide-react';

export default function ReorderAlert({ replenishmentData }) {
  const [activeNotification, setActiveNotification] = useState(null);
  const [reminderSimulated, setReminderSimulated] = useState(false);

  if (!replenishmentData) return null;

  const { schedule = [], summary = {} } = replenishmentData;

  const handleSimulateWhatsApp = (item) => {
    setActiveNotification(item);
    setReminderSimulated(true);
    setTimeout(() => {
      // Auto clear simulation badge after 4s
      setReminderSimulated(false);
    }, 4000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
            Continuous Care Architecture
          </span>
          <h3 className="text-2xl font-bold text-white mt-0.5">
            Smart Care Companion: Usage & Replenishment
          </h3>
        </div>

        {/* Monthly Investment Metric */}
        <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-right">
          <span className="text-[11px] text-slate-400 uppercase block font-medium">Estimated Monthly Care</span>
          <span className="text-xl font-bold text-emerald-400 font-mono">
            ₹{summary.estimated_monthly_investment || 1250} <span className="text-xs font-normal text-slate-400">/mo</span>
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-300">
        Based on clinical cosmetic dispensation rates, SkinGenie forecasts formulation exhaustion and triggers timely replenishment nudges before your treatment cycle is broken.
      </p>

      {/* WhatsApp Simulation Toast when triggered */}
      {reminderSimulated && activeNotification && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-3 shadow-xl animate-fadeIn">
          <MessageSquare className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <strong className="font-bold text-white">WhatsApp Care Dispatch Simulation:</strong>
              <span className="text-[10px] text-emerald-400 font-mono">Joyory Bot</span>
            </div>
            <p className="mt-1 text-slate-200">
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
            className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-all"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-rose-400 uppercase">{item.brand}</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] border border-slate-800 font-mono">
                  {item.volume_size}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white line-clamp-1">{item.product_name}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Dosage: {item.dosage_guide}</p>
            </div>

            {/* Timeline Metrics */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Est. Duration</span>
                <span className="font-bold text-white font-mono">{item.estimated_total_days} Days</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Smart Alert On</span>
                <span className="font-bold text-amber-300 font-mono">{item.reminder_date_str}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => handleSimulateWhatsApp(item)}
                className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Send className="w-3 h-3" />
                <span>Simulate WhatsApp Alert</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
