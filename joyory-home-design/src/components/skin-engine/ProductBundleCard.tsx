import { useState } from "react";
import { Star, ChevronDown, ChevronUp, Sparkles, ShoppingBag, ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface JoyoryProduct {
  product_id: string;
  name: string;
  brand: string;
  price: number;
  mrp: number;
  discount_percent?: number;
  volume_size?: string;
  routine_step?: string;
  routine_phase?: string;
  subcategory?: string;
  rating?: number;
  image_path?: string;
  primary_image?: string;
  source_url?: string;
  product_url?: string;
  key_active_ingredients?: Array<{ name: string; purpose?: string } | string>;
  grok_reason?: string;
  why_recommended?: string[] | string;
  why_not_alternatives?: string;
}

interface ProductBundleCardProps {
  products: JoyoryProduct[];
  bundlePricing?: {
    total_mrp: number;
    bundle_price: number;
    total_savings: number;
  };
  onAddToBag?: (product: JoyoryProduct) => void;
}

export function ProductBundleCard({ products, bundlePricing, onAddToBag }: ProductBundleCardProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!products || products.length === 0) return null;

  const totalMrp = bundlePricing?.total_mrp || products.reduce((acc, p) => acc + (p.mrp || p.price), 0);
  const totalPrice = bundlePricing?.bundle_price || products.reduce((acc, p) => acc + p.price, 0);
  const totalSavings = bundlePricing?.total_savings || (totalMrp - totalPrice);

  return (
    <div className="bg-card border border-border rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
            Curated Regimen Bundle
          </span>
          <h3 className="text-2xl font-bold text-foreground tracking-tight mt-0.5">
            Selected Joyory Formulations ({products.length})
          </h3>
        </div>

        {/* Bundle Pricing Tag */}
        <div className="bg-muted/50 px-4 py-2 rounded-2xl border border-border text-right self-start sm:self-auto shadow-2xs">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-foreground font-mono">
              ₹{totalPrice}
            </span>
            {totalSavings > 0 && (
              <span className="text-xs text-muted-foreground line-through font-mono">
                ₹{totalMrp}
              </span>
            )}
          </div>
          {totalSavings > 0 && (
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
              Save ₹{totalSavings} on Bundle
            </span>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {products.map((product) => {
          const isExpanded = expandedId === product.product_id;
          const discount = product.mrp > product.price
            ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
            : 0;

          const websiteUrl = product.source_url || product.product_url || "https://joyory.com";

          return (
            <div
              key={product.product_id}
              className="relative bg-muted/20 rounded-2xl border border-border hover:border-primary/40 transition-all flex flex-col justify-between overflow-hidden p-5 shadow-2xs"
            >
              <div>
                {/* Top Badge & Discount */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-background border border-border text-foreground">
                    {product.brand}
                  </span>
                  {discount > 0 && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {discount}% OFF
                    </span>
                  )}
                </div>

                {/* Thumbnail & Product Details */}
                <div className="flex items-center gap-4 mb-3.5">
                  <div className="size-20 rounded-xl bg-background border border-border p-1.5 flex items-center justify-center flex-shrink-0 shadow-2xs">
                    <img
                      src={product.image_path || product.primary_image || "/static/product_images/placeholder.jpg"}
                      alt={product.name}
                      className="size-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://placehold.co/120x120/f1f5f9/475569?text=" + encodeURIComponent(product.brand);
                      }}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span className="font-semibold text-foreground/80">
                        {product.routine_step || "Step"} • {product.routine_phase || "BOTH"}
                      </span>
                      <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                        <Star className="size-3 fill-amber-500" />
                        <span>{product.rating || 4.8}</span>
                      </div>
                    </div>
                    <h4 className="font-bold text-sm text-foreground line-clamp-2 leading-snug">
                      {product.name}
                    </h4>
                    <span className="text-[11px] text-muted-foreground font-mono mt-0.5 block">
                      {product.volume_size || "50 ml"}
                    </span>
                  </div>
                </div>

                {/* Key Actives */}
                {product.key_active_ingredients && product.key_active_ingredients.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3.5">
                    {product.key_active_ingredients.slice(0, 3).map((act, i) => {
                      const name = typeof act === "object" ? act.name : act;
                      return (
                        <span
                          key={i}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-background text-foreground/80 border border-border"
                        >
                          {name}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Pricing & Add to Bag */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-extrabold text-foreground font-mono">
                      ₹{product.price}
                    </span>
                    {product.mrp > product.price && (
                      <span className="text-xs text-muted-foreground line-through font-mono">
                        ₹{product.mrp}
                      </span>
                    )}
                  </div>

                  {onAddToBag && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAddToBag(product)}
                      className="h-8 px-3 text-xs gap-1.5 rounded-lg cursor-pointer"
                    >
                      <ShoppingBag className="size-3" />
                      <span>Add to Bag</span>
                    </Button>
                  )}
                </div>

                {/* Navigate to Actual Website Button */}
                <div className="mt-3">
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <span>View on Joyory.com</span>
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              </div>

              {/* Explainability Accordion: Grok / Scientific Reason */}
              {(product.grok_reason || product.why_recommended) && (
                <div className="mt-3.5 pt-2.5 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : product.product_id)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors py-1 cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="size-3 text-rose-500" />
                      Why recommended for your skin?
                    </span>
                    {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-2.5 p-3 rounded-xl bg-background border border-border text-xs text-muted-foreground leading-relaxed space-y-2 animate-in fade-in slide-in-from-top-1">
                      {product.grok_reason && (
                        <div className="p-2 rounded-lg bg-rose-50 text-rose-900 border border-rose-200">
                          <strong className="text-[11px] block font-bold text-rose-700 mb-0.5">
                            Grok Regimen Rationale:
                          </strong>
                          <p className="text-[11px] leading-relaxed">{product.grok_reason}</p>
                        </div>
                      )}

                      {Array.isArray(product.why_recommended) ? (
                        <ul className="space-y-1">
                          {product.why_recommended.map((r, rIdx) => (
                            <li key={rIdx} className="flex items-start gap-1.5 text-[11px]">
                              <Check className="size-3 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{String(r).replace(/^✓\s*/, "")}</span>
                            </li>
                          ))}
                        </ul>
                      ) : product.why_recommended ? (
                        <p className="text-[11px]">{product.why_recommended}</p>
                      ) : null}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
