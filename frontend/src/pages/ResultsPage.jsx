import React, { useState } from 'react';
import { Sparkles, ShoppingBag, Calendar, ArrowLeft, RefreshCw, Layers, CheckCircle2, ShieldCheck, Lightbulb, ShieldAlert } from 'lucide-react';
import SkinMetricsCard from '../components/SkinMetricsCard';
import ProductCard from '../components/ProductCard';
import RoutineTimeline from '../components/RoutineTimeline';
import ReorderAlert from '../components/ReorderAlert';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import NarratorCard from '../components/NarratorCard';

export default function ResultsPage({ analysisResult, onResetScan }) {
  const [activeSubTab, setActiveSubTab] = useState('routine'); // 'routine' | 'products' | 'signals' | 'retention'

  if (!analysisResult) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <p className="text-slate-400 text-sm">No analysis data yet. Complete an AI skin scan first.</p>
        <button
          onClick={onResetScan}
          className="px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all"
        >
          Start Scan
        </button>
      </div>
    );
  }

  const { vision, recommendations, grok_recommendations, safety, routine, replenishment, progress, narrator_description } = analysisResult;
  const primaryBundle = recommendations?.primary_bundle || [];
  const bundlePricing = recommendations?.bundle_pricing || {};
  const totalEvaluated = recommendations?.total_products_evaluated || 680;
  const routineTip = grok_recommendations?.routine_tip;

  const handleSimulateProgress = async () => {
    // Generate simulated follow-up progress
    alert("Simulated: 3-Week Follow-Up Scan recorded! Hydration +8 pts, Visible Blemishes reduced by -2 spots.");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-semibold text-rose-400 uppercase tracking-widest">
            Diagnostic & Routine Portfolio
          </span>
          <h2 className="text-3xl font-extrabold text-white font-serif mt-0.5">
            Joyory Tailored Skincare Regimen
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Formulated for <strong>{vision?.skin_type || 'Combination'}</strong> profile • Verified active compatibility • Evaluated across <strong>{totalEvaluated}</strong> Joyory products
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium border ${
              vision?.scan_mode === 'advance'
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
            }`}>
              {vision?.scanner_label || (vision?.scan_mode === 'advance' ? 'Advance Multimodal Scan' : 'Standard Neural AI Scan')}
            </span>
          </div>
        </div>


        <div className="flex items-center gap-3">
          <button
            onClick={onResetScan}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New Scan</span>
          </button>
          <a
            href="https://joyory.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Order Bundle on Joyory</span>
          </a>
        </div>
      </div>

      {/* Universal Safety & Non-Medical Disclaimer Banner */}
      <div className="rounded-2xl bg-amber-950/20 border border-amber-500/30 px-5 py-3.5 flex items-start gap-3 text-xs text-amber-200/90 shadow-sm">
        <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-amber-300 font-semibold">AI Estimation Only (Not a Medical Diagnosis):</strong>{' '}
          All skin signal scores, blemish assessments, and tone indices are relative cosmetic estimations derived from 2D camera pixels. Results are lighting-dependent and do not constitute clinical dermatology advice. Consult a certified medical dermatologist for persistent or inflamed skin conditions.
        </div>
      </div>

      {/* Gemini Human Narrative Card */}
      <NarratorCard 
        narrativeText={narrator_description || vision?.narrator_description} 
        skinType={vision?.skin_type} 
      />


      {/* Sub-tab Navigation */}
      <div className="flex overflow-x-auto pb-2 gap-2 border-b border-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('routine')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === 'routine'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Daily AM / PM Architecture</span>
        </button>

        <button
          onClick={() => setActiveSubTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === 'products'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Selected Joyory Formulations ({primaryBundle.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('signals')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === 'signals'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Image-Derived Skin Signals</span>
        </button>

        <button
          onClick={() => setActiveSubTab('retention')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === 'retention'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Smart Care & Progress Tracking</span>
        </button>
      </div>

      {/* Tab 1: AM/PM Daily Routine */}
      {activeSubTab === 'routine' && (
        <div className="space-y-6">
          <RoutineTimeline routineData={routine} safetyData={safety} />
        </div>
      )}

      {/* Tab 2: Products Catalog Matches with Explainability */}
      {activeSubTab === 'products' && (
        <div className="space-y-6">
          {/* Grok Regimen Insight Banner (if available) */}
          {routineTip && (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3 shadow-md">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 flex-shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                  xAI Grok Regimen Tip
                </p>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  {routineTip}
                </p>
              </div>
            </div>
          )}

          {/* Bundle summary box */}
          {bundlePricing.sale_total > 0 && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div>
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">Curated 4-Step Regimen Bundle</span>
                <p className="text-sm font-semibold text-white mt-0.5">
                  Complete synergy: Cleanser + Serum + Barrier Cream + SPF 50+
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  Total Bundle: <strong className="text-white font-mono">₹{bundlePricing.sale_total}</strong>{' '}
                  <span className="line-through text-slate-400 font-mono text-xs">₹{bundlePricing.mrp_total}</span>{' '}
                  <span className="text-emerald-400 font-bold">(Save ₹{bundlePricing.savings})</span>
                </p>
              </div>
              <a
                href="https://joyory.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-lg shadow-rose-500/20 transition-all text-center"
              >
                1-Click Bundle Checkout
              </a>
            </div>
          )}

          {/* Product grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {primaryBundle.map((product) => (
              <ProductCard key={product.product_id} product={product} isHighlighted={true} />
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Skin Signals & Tone Metrics */}
      {activeSubTab === 'signals' && (
        <div className="space-y-6">
          <SkinMetricsCard visionData={vision} />
        </div>
      )}

      {/* Tab 4: Smart Care & Progress Timeline */}
      {activeSubTab === 'retention' && (
        <div className="space-y-6">
          <ReorderAlert replenishmentData={replenishment} />
          <BeforeAfterSlider progressData={progress} onSimulateProgress={handleSimulateProgress} />
        </div>
      )}
    </div>
  );
}
