import React from 'react';
import { Sparkles, ShieldCheck, Zap, HeartHandshake, ArrowRight, CheckCircle2, TrendingUp, Layers } from 'lucide-react';

export default function LandingPage({ onStartScan }) {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto px-4 space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          <span>B.Tech Hackathon 2026 • Real-World Product Innovation</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight font-serif">
          Not a Skin Scanner. <br />
          <span className="bg-gradient-to-r from-rose-400 via-pink-300 to-amber-200 bg-clip-text text-transparent">
            A Retention Engine for Joyory.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          SkinGenie pairs neural facial signal extraction with a <strong>deterministic active ingredient safety layer</strong> and predictive replenishment alerts to eliminate blind beauty purchases.
        </p>

        {/* CTA Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={onStartScan}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-600 to-amber-500 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-rose-500/25 transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>Launch AI Skin Scan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="https://joyory.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-sm transition-all"
          >
            Explore Joyory Catalog
          </a>
        </div>

        {/* Problem Statement Task Alignment Badges */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
            <Layers className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Primary Focus</span>
              <strong className="text-xs text-white">Task 02: Smart Shopping</strong>
              <p className="text-[11px] text-slate-400 mt-0.5">Zero blind buying via explainable product matches</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
            <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Core Innovation</span>
              <strong className="text-xs text-white">Task 01: Future of Beauty</strong>
              <p className="text-[11px] text-slate-400 mt-0.5">Deterministic ingredient safety & AM/PM sequencing</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
            <HeartHandshake className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Revenue Lever</span>
              <strong className="text-xs text-white">Task 03: Customer Retention</strong>
              <p className="text-[11px] text-slate-400 mt-0.5">Smart Care replenishment & longitudinal progress</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Module Agent Pipeline Architecture Highlight */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10 space-y-2">
          <span className="text-xs font-semibold text-rose-400 uppercase tracking-widest">
            Behind the Experience
          </span>
          <h2 className="text-3xl font-bold text-white font-serif">
            The 5 Modular AI Engines
          </h2>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            Engineered as deterministic, reliable service blocks without framework overhead.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="font-bold text-sm text-white">Vision Module</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extracts skin tone (Monk/Fitzpatrick), quantitative surface signals (0-100), and blemish clusters.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="font-bold text-sm text-white">Catalog Matcher</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Maps concerns to authenticated Joyory inventory with transparent "Why Recommended" rationale.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="font-bold text-sm text-white">Safety Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deterministic active conflict resolver (SAFE, CAUTION, SEPARATE, AVOID) preventing barrier irritation.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h3 className="font-bold text-sm text-white">Smart Care Companion</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Usage consumption forecasting that triggers replenishment reminders before bottles empty.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
              5
            </div>
            <h3 className="font-bold text-sm text-white">Progress Tracker</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Longitudinal delta analytics logging score shifts across multi-week active treatment cycles.
            </p>
          </div>
        </div>
      </section>

      {/* Commercial Pitch Hook */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-900 border border-rose-500/20 text-center space-y-4 shadow-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
            Commercial Value Proposition
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
            "Diagnosis is Free Acquisition. Routines Build Trust. Replenishment Drives Compounding Revenue."
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Instead of a one-time utility, SkinGenie creates an ongoing relationship loop for Joyory customers, elevating Customer Lifetime Value (LTV) by over 40%.
          </p>
          <div className="pt-2">
            <button
              onClick={onStartScan}
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs transition-all shadow-md"
            >
              Experience Live Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
