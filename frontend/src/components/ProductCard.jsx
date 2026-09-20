import React, { useState } from 'react';
import { ExternalLink, Check, Info, ShieldCheck, Star, Sparkles } from 'lucide-react';

export default function ProductCard({ product, isHighlighted = false }) {
  const [showExplanation, setShowExplanation] = useState(false);

  if (!product) return null;

  const discountPercent = product.mrp > product.price 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  return (
    <div className={`relative bg-slate-900/90 rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden group ${
      isHighlighted 
        ? 'border-rose-500/50 shadow-lg shadow-rose-500/10' 
        : 'border-slate-800 hover:border-slate-700'
    }`}>
      {/* Top badges */}
      <div className="p-4 pb-0 flex items-center justify-between z-10">
        <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          {product.brand}
        </span>
        {discountPercent > 0 && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {discountPercent}% OFF
          </span>
        )}
      </div>

      {/* Image & formulation thumbnail */}
      <div className="relative px-6 py-4 flex items-center justify-center">
        <div className="w-36 h-36 rounded-xl overflow-hidden bg-slate-950/60 border border-slate-800 flex items-center justify-center p-2 shadow-inner group-hover:scale-105 transition-transform duration-300">
          <img 
            src={product.image_path || product.primary_image || '/static/product_images/placeholder.jpg'} 
            alt={product.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/300x300/1e293b/f8fafc?text=" + encodeURIComponent(product.brand);
            }}
          />
        </div>
        <div className="absolute bottom-2 right-6 px-2 py-0.5 rounded bg-slate-950/90 border border-slate-800 text-[10px] text-slate-300">
          {product.volume_size || '50 ml'}
        </div>
      </div>

      {/* Body Info */}
      <div className="p-5 pt-2 flex-1 flex flex-col justify-between">
        <div>
          {/* Subcategory & rating */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{product.subcategory || product.routine_step} • {product.routine_phase || 'BOTH'}</span>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3 h-3 fill-amber-400" />
              <span className="font-semibold text-[11px]">{product.rating || 4.8}</span>
            </div>
          </div>

          <h4 className="font-bold text-base text-white line-clamp-2 leading-snug group-hover:text-rose-300 transition-colors">
            {product.name}
          </h4>

          {/* Key Actives Badges */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {product.key_active_ingredients?.map((act, i) => {
              const actName = typeof act === 'object' ? act.name : act;
              const actPurpose = typeof act === 'object' ? act.purpose : 'Skin active';
              return (
                <span 
                  key={i} 
                  className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60"
                  title={actPurpose}
                >
                  {actName}
                </span>
              );
            })}
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-xl font-extrabold text-white font-mono">
              ₹{product.price}
            </span>
            {product.mrp > product.price && (
              <span className="text-xs text-slate-400 line-through font-mono">
                ₹{product.mrp}
              </span>
            )}
          </div>
        </div>

        {/* Explainability Accordion Button: "Why recommended?" */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="w-full flex items-center justify-between text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors py-1"
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Why this formula was selected
            </span>
            <span>{showExplanation ? '▲' : '▼'}</span>
          </button>

          {showExplanation && (
            <div className="mt-2.5 p-3 rounded-xl bg-slate-950/90 border border-slate-800/80 text-xs text-slate-300 space-y-2.5 animate-fadeIn">
              {/* Grok Recommendation Reasoning (Highlighted if present) */}
              {product.grok_reason && (
                <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/20 text-rose-200">
                  <div className="flex items-center gap-1.5 font-bold text-[11px] text-rose-300 mb-1">
                    <Sparkles className="w-3 h-3 text-rose-400" />
                    <span>Grok Regimen Justification</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    {product.grok_reason}
                  </p>
                </div>
              )}

              <ul className="space-y-1.5">
                {product.why_recommended?.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-relaxed text-[11px]">
                    <Check className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{reason.replace(/^✓\s*/, '')}</span>
                  </li>
                ))}
              </ul>

              {product.why_not_alternatives && (
                <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-start gap-1">
                  <Info className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>{product.why_not_alternatives}</span>
                </div>
              )}
            </div>
          )}

          {/* Buy Link */}
          <div className="mt-3">
            <a
              href={product.source_url || product.product_url || 'https://joyory.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-rose-500/20 transition-all"
            >
              <span>View on Joyory.com</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
