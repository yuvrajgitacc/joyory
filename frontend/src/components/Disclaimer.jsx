import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function Disclaimer() {
  return (
    <footer className="w-full border-t border-slate-800/60 bg-slate-950/90 py-4 px-4 sm:px-6 text-center text-xs text-slate-400">
      <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <span>
          <strong className="text-slate-300">Cosmetic Guidance Notice:</strong> SkinGenie AI evaluates visible cosmetic surface characteristics and active ingredient compatibility to support shopping decisions. It is not a medical device or dermatological diagnosis. Consult a board-certified dermatologist for clinical skin conditions.
        </span>
      </div>
    </footer>
  );
}
