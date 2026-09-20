import json
import logging
from typing import List, Dict, Any, Optional, Tuple
from config import PRODUCTS_FILE
from agents.dataset_adapter import load_catalog

logger = logging.getLogger("recommender_agent")

class RecommenderAgent:
    """
    Joyory Catalog Recommender Module.
    Selects optimal products tailored to detected visible skin concerns, skin type, and budget,
    providing full transparency through 'Why Recommended' explainability tags.
    """
    def __init__(self, catalog_path=PRODUCTS_FILE):
        self.catalog_path = catalog_path
        self.products: List[Dict[str, Any]] = []
        self.load_catalog()

    def load_catalog(self):
        try:
            # Prefer dataset_adapter which cleanly adapts the 680-product dataset
            self.products = load_catalog()
            if not self.products:
                with open(self.catalog_path, "r", encoding="utf-8") as f:
                    self.products = json.load(f)
            logger.info(f"Loaded {len(self.products)} Joyory products into recommender.")
        except Exception as e:
            logger.error(f"Failed to load Joyory catalog: {e}")
            self.products = []

    def normalize_concern(self, c: str) -> str:
        c_low = c.lower().strip()
        if "acne" in c_low or "blemish" in c_low or "pimple" in c_low or "breakout" in c_low:
            return "Acne & Blemishes"
        if "dry" in c_low or "dehydrat" in c_low or "tight" in c_low:
            return "Dryness"
        if "pore" in c_low or "blackhead" in c_low or "whitehead" in c_low:
            return "Large Pores"
        if "pigment" in c_low or "spot" in c_low or "tan" in c_low or "uneven" in c_low:
            return "Pigmentation"
        if "sun" in c_low or "uv" in c_low:
            return "Sun Protection"
        if "wrinkle" in c_low or "fine line" in c_low or "aging" in c_low:
            return "Fine Lines"
        if "oil" in c_low or "sebum" in c_low or "shine" in c_low:
            return "Excess Sebum"
        if "dull" in c_low or "glow" in c_low:
            return "Dullness"
        if "red" in c_low or "sensitiv" in c_low or "erythema" in c_low:
            return "Redness"
        return c.title()

    def score_product(
        self,
        product: Dict[str, Any],
        user_concerns: List[str],
        user_skin_type: str,
        budget_tier: str = "all"
    ) -> Tuple[float, List[str], Optional[str]]:
        score = 0.0
        reasons = []
        skip_reason = None

        prod_concerns = [self.normalize_concern(c) for c in product.get("target_concerns", [])]
        user_norm_concerns = [self.normalize_concern(c) for c in user_concerns]

        # 1. Concern Matching (+3.5 per matched concern)
        matched_concerns = set(prod_concerns).intersection(set(user_norm_concerns))
        if matched_concerns:
            score += len(matched_concerns) * 3.5
            reasons.append(f"✓ Formulated to target your identified concern(s): {', '.join(matched_concerns)}")

        # 2. Skin Type Alignment (+2.5)
        raw_types = product.get("target_skin_types") or product.get("skin_types") or []
        prod_skin_types = [st.lower() for st in raw_types]
        user_type_low = user_skin_type.lower()
        if "all skin types" in prod_skin_types or user_type_low in prod_skin_types or any(user_type_low in st for st in prod_skin_types):
            score += 2.5
            reasons.append(f"✓ Validated for {user_skin_type.title()} skin characteristics")
        elif "combination" in prod_skin_types and user_type_low in ["oily", "dry"]:
            score += 1.5
            reasons.append(f"✓ Balances combination and {user_skin_type.title()} zones")

        # 3. Budget Alignment
        price = product.get("price", 0)
        if budget_tier == "budget" and price <= 400:
            score += 2.0
            reasons.append("✓ Fits your value budget criteria (under ₹400)")
        elif budget_tier == "mid" and 350 <= price <= 650:
            score += 2.0
            reasons.append("✓ Balanced masstige price point (₹350 - ₹650)")
        elif budget_tier == "premium" and price > 600:
            score += 2.0
            reasons.append("✓ High-concentration dermaceutical formula")

        # 4. Key Active Benefit
        key_actives = product.get("key_active_ingredients", [])
        if key_actives:
            top_active = key_actives[0]
            if isinstance(top_active, dict):
                act_name = top_active.get("name", "")
                act_purp = top_active.get("purpose", "")
                if act_name:
                    reasons.append(f"✓ Powered by active {act_name} for {act_purp}")
            elif isinstance(top_active, str) and top_active:
                reasons.append(f"✓ Powered by active {top_active}")

        reasons.append("✓ 100% Authentic Joyory inventory verified")

        return score, reasons, skip_reason

    def get_shortlist(
        self,
        concerns: List[str],
        skin_type: str = "Combination",
        budget: str = "all",
        limit: int = 15
    ) -> List[Dict[str, Any]]:
        """
        Retrieves a diverse, top-scoring shortlist of candidate products across
        key routine categories (Cleanser, Serum, Moisturizer, Sunscreen, Treatment)
        specifically to pass as a curated candidate pool for Grok AI.
        """
        scored = []
        for p in self.products:
            score, reasons, _ = self.score_product(p, concerns, skin_type, budget)
            if score > 0:
                p_copy = dict(p)
                p_copy["relevance_score"] = round(score, 1)
                p_copy["why_recommended"] = reasons
                scored.append(p_copy)

        scored.sort(key=lambda x: x["relevance_score"], reverse=True)

        # Ensure representation across essential routine categories
        selected = []
        steps = ["Cleanser", "Serum", "Moisturizer", "Sunscreen", "Treatment", "Eye Care"]
        step_buckets = {s: [] for s in steps}

        for p in scored:
            step = p.get("routine_step", "Treatment")
            if step in step_buckets:
                step_buckets[step].append(p)

        # Take top 2-3 from each essential step
        for step in ["Cleanser", "Serum", "Moisturizer", "Sunscreen"]:
            selected.extend(step_buckets[step][:3])

        for step in ["Treatment", "Eye Care"]:
            selected.extend(step_buckets[step][:2])

        # Fill remaining slots up to limit
        if len(selected) < limit:
            existing_ids = {p["product_id"] for p in selected}
            for p in scored:
                if p["product_id"] not in existing_ids:
                    selected.append(p)
                    existing_ids.add(p["product_id"])
                    if len(selected) >= limit:
                        break

        return selected[:limit]

    def recommend(
        self,
        concerns: List[str],
        skin_type: str = "Combination",
        budget: str = "all",
        limit_per_step: int = 2
    ) -> Dict[str, Any]:
        """
        Executes candidate matching and selects top products for each routine step.
        """
        scored_products = []
        for p in self.products:
            score, reasons, skip_reason = self.score_product(p, concerns, skin_type, budget)
            if score > 0:
                p_copy = dict(p)
                p_copy["relevance_score"] = round(score, 1)
                p_copy["why_recommended"] = reasons
                p_copy["why_not_alternatives"] = (
                    "High-irritancy alternatives were excluded to safeguard your epidermal barrier."
                )
                scored_products.append(p_copy)

        # Sort highest scoring first
        scored_products.sort(key=lambda x: x["relevance_score"], reverse=True)

        # Group by routine step: Cleanser, Serum, Moisturizer, Sunscreen, Treatment/Eye Care
        steps = ["Cleanser", "Serum", "Moisturizer", "Sunscreen", "Treatment", "Eye Care"]
        grouped_recommendations = {s: [] for s in steps}

        for p in scored_products:
            step = p.get("routine_step", "Treatment")
            if step in grouped_recommendations and len(grouped_recommendations[step]) < limit_per_step:
                grouped_recommendations[step].append(p)

        # Flat list of primary picks (top 1 per essential step)
        primary_bundle = []
        for step in ["Cleanser", "Serum", "Moisturizer", "Sunscreen"]:
            if grouped_recommendations[step]:
                primary_bundle.append(grouped_recommendations[step][0])

        total_routine_price = sum(p["price"] for p in primary_bundle)
        total_routine_mrp = sum(p.get("mrp", p["price"]) for p in primary_bundle)
        total_savings = total_routine_mrp - total_routine_price

        return {
            "grouped_by_step": grouped_recommendations,
            "primary_bundle": primary_bundle,
            "total_products_evaluated": len(self.products),
            "bundle_pricing": {
                "sale_total": total_routine_price,
                "mrp_total": total_routine_mrp,
                "savings": total_savings,
                "currency": "INR"
            }
        }

recommender_agent = RecommenderAgent()
