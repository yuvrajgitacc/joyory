import React, { useState } from 'react';
import { Sun, Moon, ShieldCheck, AlertTriangle, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import ProductCard from './ProductCard';

export default function RoutineTimeline({ routineData, safetyData }) {
  const [activeTab, setActiveTab] = useState('AM');

  if (!routineData) return null;

  const { am_routine = [], pm_routine = [], weekly_guidance = [] } = routineData;
  const currentSteps = activeTab === 'AM' ? am_routine : pm_routine;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-6">
      {/* Header & AM/PM Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
            Conflict-Free Formulation Regimen
          </span>
          <h3 className="text-2xl font-bold text-white mt-0.5">
            Personalized Daily Routine Architecture
          </h3>
        </div>

        {/* Day / Night Toggle */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('AM')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'AM'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-400" />
            <span>AM Routine ({am_routine.length} Steps)</span>
          </button>
          <button
            onClick={() => setActiveTab('PM')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'PM'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Moon className="w-4 h-4 text-indigo-400" />
            <span>PM Routine ({pm_routine.length} Steps)</span>
          </button>
        </div>
      </div>

      {/* Safety Engine Validation Bar */}
      {safetyData && (
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Deterministic Safety Audit: <span className="text-emerald-400">PASSED & LAYERED</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
            {/* Separations */}
            {safetyData.separations?.length > 0 ? (
              safetyData.separations.map((sep, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-amber-300">Active Separation: </span>
                    <span>{sep.active_a} and {sep.active_b} sequenced safely into AM vs PM slots to avoid barrier stress.</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>All active concentrations verified within safe synergy boundaries.</span>
              </div>
            )}

            {/* Mandatory SPF Alert */}
            <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
              <Sun className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span>SPF 50+ broad spectrum locked as mandatory final morning step.</span>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Steps */}
      <div className="space-y-4">
        {currentSteps.map((step, idx) => (
          <div 
            key={idx}
            className="flex flex-col md:flex-row gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all"
          >
            {/* Step Counter Badge */}
            <div className="flex items-center md:flex-col justify-start gap-3 md:min-w-[120px]">
              <span className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 text-rose-400 font-black text-sm flex items-center justify-center font-mono">
                {step.step_number}
              </span>
              <div>
                <span className="text-xs font-bold text-white block">{step.title}</span>
                <span className="text-[11px] text-slate-400">{step.timing}</span>
              </div>
            </div>

            {/* Application Instructions */}
            <div className="flex-1 text-xs text-slate-300 flex flex-col justify-center border-l-0 md:border-l border-slate-800 md:pl-4 space-y-1">
              <p className="font-medium text-slate-200">{step.instructions}</p>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                <Sparkles className="w-3 h-3 text-rose-400" />
                <span>Product: <strong className="text-white">{step.product?.name}</strong></span>
              </div>
            </div>

            {/* Product Quick-View Button */}
            <div className="flex items-center justify-end">
              <a
                href={step.product?.source_url || 'https://joyory.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-rose-300 hover:text-white transition-all whitespace-nowrap"
              >
                ₹{step.product?.price} on Joyory →
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly dermatological guidance */}
      {weekly_guidance.length > 0 && (
        <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-1">
          <span className="font-semibold text-slate-300 block mb-1">Key Application Rules:</span>
          {weekly_guidance.map((note, i) => (
            <p key={i}>{note}</p>
          ))}
        </div>
      )}
    </div>
  );
}
