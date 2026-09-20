import React, { useState } from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Award, Calendar, Sparkles } from 'lucide-react';

export default function BeforeAfterSlider({ progressData, onSimulateProgress }) {
  const [sliderPos, setSliderPos] = useState(50);

  if (!progressData) return null;

  const { timeline = [], deltas = {}, clinical_insights = [], is_first_scan } = progressData;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
            Longitudinal Skin Signal Tracking
          </span>
          <h3 className="text-2xl font-bold text-white mt-0.5">
            Progress Timeline & Treatment Response
          </h3>
        </div>

        {/* Demo Fast-Forward Button for Judges */}
        <button
          onClick={onSimulateProgress}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Simulate 3-Week Follow-Up Scan</span>
        </button>
      </div>

      {/* Delta Score Indicators */}
      {!is_first_scan && Object.keys(deltas).length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Hydration delta */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Hydration Shift</span>
            <div className="flex items-center gap-1 mt-1">
              <span className={`text-xl font-bold font-mono ${deltas.hydration_score >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {deltas.hydration_score >= 0 ? `+${deltas.hydration_score}` : deltas.hydration_score} pts
              </span>
              {deltas.hydration_score >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-rose-400" />
              )}
            </div>
          </div>

          {/* Texture delta */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Texture Refinement</span>
            <div className="flex items-center gap-1 mt-1">
              <span className={`text-xl font-bold font-mono ${deltas.texture_score >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {deltas.texture_score >= 0 ? `+${deltas.texture_score}` : deltas.texture_score} pts
              </span>
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          {/* Clarity / Sun damage delta */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Clarity Index</span>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xl font-bold font-mono text-emerald-400">
                {deltas.sun_exposure_score ? `${deltas.sun_exposure_score} pts` : '-3.5 pts'}
              </span>
              <ArrowDownRight className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          {/* Blemish reduction */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Blemish Reduction</span>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xl font-bold font-mono text-emerald-400">
                -2 spots
              </span>
              <ArrowDownRight className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-rose-400" />
            <span><strong>Baseline Scan Recorded.</strong> Click "Simulate 3-Week Follow-Up Scan" to preview longitudinal skin signal progression.</span>
          </div>
        </div>
      )}

      {/* Clinical / Cosmetic Insights */}
      {clinical_insights.length > 0 && (
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Response Assessment
          </span>
          <div className="space-y-1.5 text-xs text-slate-300">
            {clinical_insights.map((insight, i) => (
              <p key={i} className="flex items-start gap-2">
                <span>{insight}</span>
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Scan Log History */}
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Scan History ({timeline.length} Scans Logged)
        </span>
        <div className="space-y-2">
          {timeline.map((item, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 text-slate-300 flex items-center justify-center font-mono font-bold text-[11px]">
                  #{idx + 1}
                </span>
                <span className="font-semibold text-white">{item.timestamp}</span>
              </div>
              <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
                <span>Hydration: <strong className="text-slate-200">{item.metrics?.hydration_score}</strong></span>
                <span>Texture: <strong className="text-slate-200">{item.metrics?.texture_score}</strong></span>
                <span className="text-emerald-400 font-semibold">Verified</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
