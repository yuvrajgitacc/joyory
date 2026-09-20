import React from 'react';
import { Droplet, Sparkles, Sun, Activity, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function SkinMetricsCard({ visionData }) {
  if (!visionData) return null;

  const { skin_tone, skin_signals, blemish_assessment, skin_type, primary_concerns, summary } = visionData;

  const metrics = [
    {
      key: 'texture_score',
      label: 'AI-Estimated Texture',
      sub: 'Relative smoothness index',
      score: Math.round(skin_signals?.texture_score ?? 70),
      icon: Sparkles,
      color: 'from-cyan-400 to-blue-500'
    },
    {
      key: 'hydration_score',
      label: 'AI-Estimated Hydration',
      sub: 'Surface moisture reflection',
      score: Math.round(skin_signals?.hydration_score ?? 60),
      icon: Droplet,
      color: 'from-blue-400 to-indigo-500'
    },
    {
      key: 'sun_exposure_score',
      label: 'AI-Estimated Clarity',
      sub: 'Photoprotection priority',
      score: Math.round(skin_signals?.sun_exposure_score ?? 35),
      icon: Sun,
      color: 'from-amber-400 to-orange-500',
      invertNote: 'Lower = Less apparent sun damage'
    },
    {
      key: 'firmness_score',
      label: 'AI-Estimated Elasticity',
      sub: 'Visible epidermal tension',
      score: Math.round(skin_signals?.firmness_score ?? 80),
      icon: Activity,
      color: 'from-emerald-400 to-teal-500'
    }
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-6">
      {/* Header: Skin Type & Tone */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
            AI Facial Skin Characterization
          </span>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2 mt-0.5">
            {skin_type || 'Combination'} Profile
          </h3>
        </div>

        {/* Skin Tone & Undertone Pill */}
        <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800">
          <div 
            className="w-6 h-6 rounded-full border-2 border-white/40 shadow-sm flex-shrink-0"
            style={{ backgroundColor: skin_tone?.hex || '#d2a07c' }}
          />
          <div className="text-left text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-white">{skin_tone?.fitzpatrick || 'Type IV'}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-medium">
                Lighting Dependent
              </span>
            </div>
            <p className="text-slate-400 font-mono text-[11px] mt-0.5">
              {skin_tone?.hex || '#d2a07c'} • Monk {skin_tone?.monk_scale || 6}
            </p>
          </div>
        </div>
      </div>

      {/* Summary statement */}
      {summary && (
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 text-sm text-slate-300 leading-relaxed">
          <p>{summary}</p>
        </div>
      )}

      {/* 4 Quantitative Image-Derived Signals */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Image-Derived Visual Signals (0 - 100 Relative Scale)
          </h4>
          <span className="text-[11px] text-slate-400 font-normal">
            *Relative cosmetic indices computed from camera pixel heuristics (Not clinical lab tests)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m) => {
            const Icon = m.icon;
            const score = m.score;
            return (
              <div 
                key={m.key}
                className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-2xl font-black text-white font-mono">{score}</span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-200">{m.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{m.sub}</p>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-900 h-2 rounded-full mt-3 overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${m.color} rounded-full transition-all duration-700`}
                    style={{ width: `${Math.min(100, Math.max(10, score))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Priority Concerns & Blemishes Badge row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Concerns */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Identified Priority Focus
          </h5>
          <div className="flex flex-wrap gap-2">
            {primary_concerns?.map((c, i) => (
              <span 
                key={i}
                className="px-3 py-1 rounded-full text-xs font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Blemish Count */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Blemish Assessment
              </h5>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                Conf &gt; 0.45
              </span>
            </div>
            <p className="text-sm font-medium text-slate-300">
              Severity: <strong className="text-amber-300">{blemish_assessment?.severity || 'Mild'}</strong>
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Comedones: {blemish_assessment?.comedones || 0} • Papules: {blemish_assessment?.papules || 0}
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black font-mono text-white">
              {blemish_assessment?.total_lesions ?? 0}
            </span>
            <p className="text-[11px] text-slate-400">active spots</p>
          </div>
        </div>
      </div>
    </div>
  );
}
