import React from 'react';
import { Sparkles, ShieldCheck, ShoppingBag, Award } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 p-[2px] shadow-lg shadow-pink-500/20 group-hover:shadow-pink-500/40 transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="font-black text-xl tracking-tighter bg-gradient-to-r from-rose-400 via-pink-300 to-amber-200 bg-clip-text text-transparent">
                J
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white font-serif">JOYORY</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                SkinGenie AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Beauty-Tech Smart Shopping</p>
          </div>
        </div>

        {/* Navigation / Features */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('landing')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'landing' ? 'text-white bg-slate-800/80' : 'hover:text-white hover:bg-slate-900'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('analyze')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${activeTab === 'analyze' ? 'text-rose-300 bg-rose-500/10 border border-rose-500/20' : 'hover:text-white hover:bg-slate-900'}`}
          >
            <Sparkles className="w-4 h-4 text-rose-400" />
            AI Skin Scan
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'results' ? 'text-white bg-slate-800/80' : 'hover:text-white hover:bg-slate-900'}`}
          >
            Routine & Results
          </button>
        </nav>

        {/* Right Action: Joy Points & Guarantee */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>250 Joy Points</span>
          </div>
          <a
            href="https://joyory.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-xs font-semibold text-slate-200 transition-all hover:border-slate-600"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-rose-400" />
            <span>Joyory.com</span>
          </a>
        </div>
      </div>
    </header>
  );
}
