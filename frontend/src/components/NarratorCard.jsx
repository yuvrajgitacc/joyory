import React from 'react';
import { Sparkles, MessageSquareHeart, HeartHandshake } from 'lucide-react';

export default function NarratorCard({ narrativeText, skinType }) {
  if (!narrativeText) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900/95 via-rose-950/30 to-slate-900/95 border border-rose-500/30 p-6 shadow-2xl backdrop-blur-md">
      {/* Decorative ambient glow */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-start gap-4">
        {/* Avatar/Badge Icon */}
        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30">
          <MessageSquareHeart className="w-6 h-6" />
        </div>

        {/* Narrative Content */}
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Skin Condition Narrative
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/20 font-medium">
                Gemini 2.5 Voice
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Interpreting raw neural network scan
            </span>
          </div>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
            "{narrativeText}"
          </p>

          <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
            <HeartHandshake className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>Gentle cosmetic analysis • Joyory Personal Care Companion</span>
          </div>
        </div>
      </div>
    </div>
  );
}
