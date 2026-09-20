import json
import logging
import os
from typing import List, Dict, Any, Optional
from config import GROK_API_KEY, GROK_MODEL_NAME

logger = logging.getLogger("grok_recommender_agent")

GROK_SYSTEM_PROMPT = """You are Grok, an ultra-smart, scientifically grounded cosmetic skincare advisor integrated into Joyory (India's premier beauty marketplace).
You are evaluating a user's verified skin scan data and selecting the best 4 to 6 skincare formulations from a curated candidate catalog.

STRICT ANTI-HALLUCINATION RULES:
1. You MUST ONLY recommend products that exist in the PROVIDED CANDIDATE CATALOG below.
2. You MUST NOT invent, alter, or hallucinate product names, brands, ingredients, or product IDs.
3. Every recommendation MUST reference the exact `product_id` provided in the list.
4. Pick exactly 4 to 6 complementary products spanning essential steps (e.g., Cleanser, Serum, Moisturizer, Sunscreen, and optional Treatment/Eye Care).
5. For EVERY selected product, write a concise, compelling 2-3 sentence `recommendation_reason` explaining:
   - Why its specific active ingredients (e.g., Niacinamide, Salicylic Acid, Ceramides) target their exact skin metrics (e.g., comedone count, low hydration, skin tone).
   - How it supports barrier recovery without overloading their skin.
6. Provide a cohesive `routine_tip` summarizing the overall regimen synergy.
7. Return ONLY valid JSON adhering strictly to the schema.
"""

class GrokRecommenderAgent:
    """
    xAI Grok Intelligent Product Selection Module.
    Takes pre-filtered Joyory catalog candidates + model diagnostic data
    and generates an optimized regimen bundle with deep ingredient-level justification.
    """
    def __init__(self):
        self.api_key = GROK_API_KEY
        self.model_name = GROK_MODEL_NAME

    async def recommend(
        self,
        skin_analysis: Dict[str, Any],
        skin_type: str,
        concerns: List[str],
        budget: str,
        product_shortlist: List[Dict[str, Any]],
        primary_fallback_bundle: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Queries Grok API to select optimal products from the pre-filtered shortlist.
        Falls back to deterministic scoring bundle if API key is not present or API call fails.
        """
        # If no key, execute deterministic fallback
        if not self.api_key:
            logger.info("GROK_API_KEY not configured. Using deterministic scoring with expert rationale.")
            return self._fallback_recommendation(primary_fallback_bundle, skin_type, concerns)

        try:
            from openai import AsyncOpenAI

            client = AsyncOpenAI(
                api_key=self.api_key,
                base_url="https://api.x.ai/v1"
            )

            # Prepare concise candidate list for Grok to avoid token bloat and hallucination
            simplified_candidates = []
            for p in product_shortlist:
                simplified_candidates.append({
                    "product_id": p.get("product_id"),
                    "name": p.get("name"),
                    "brand": p.get("brand"),
                    "routine_step": p.get("routine_step"),
                    "routine_phase": p.get("routine_phase"),
                    "price": p.get("price"),
                    "actives": [a.get("name") if isinstance(a, dict) else str(a) for a in p.get("key_active_ingredients", [])],
                    "target_concerns": p.get("target_concerns", []),
                    "summary": p.get("recommendation_prompt") or p.get("description", "")[:200]
                })

            acne = skin_analysis.get("blemish_assessment", {})
            signals = skin_analysis.get("skin_signals", {})

            user_prompt = f"""
USER SKIN DIAGNOSTIC TELEMETRY:
- Skin Type: {skin_type}
- Target Concerns: {', '.join(concerns)}
- Active Spots: {acne.get('total_lesions', 0)} ({acne.get('severity', 'Mild')} severity, {acne.get('comedones', 0)} comedones, {acne.get('papules', 0)} papules)
- Hydration Score: {signals.get('hydration_score', 60)}/100
- Texture Smoothness: {signals.get('texture_score', 70)}/100
- Budget Preference: {budget}

CURATED CANDIDATE CATALOG (CHOOSE ONLY FROM THIS LIST):
{json.dumps(simplified_candidates, indent=2)}

Respond ONLY in this exact JSON schema:
{{
  "selected_products": [
    {{
      "product_id": "exact_product_id_from_list",
      "recommendation_reason": "2-3 sentences of persuasive, scientifically sound reasoning tailored to their detected metrics and actives."
    }}
  ],
  "routine_tip": "A crisp, actionable master tip for this user's daily regimen."
}}
"""

            response = await client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": GROK_SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )

            content = response.choices[0].message.content
            parsed = json.loads(content)

            # Validate returned IDs against candidate catalog to guarantee zero hallucination
            valid_id_map = {p["product_id"]: p for p in product_shortlist}
            grok_picks = []

            for item in parsed.get("selected_products", []):
                pid = item.get("product_id")
                if pid in valid_id_map:
                    matched_prod = dict(valid_id_map[pid])
                    matched_prod["grok_reason"] = item.get("recommendation_reason")
                    grok_picks.append(matched_prod)

            if len(grok_picks) >= 3:
                logger.info(f"Grok successfully recommended {len(grok_picks)} products from catalog.")
                return {
                    "selected_products": grok_picks,
                    "routine_tip": parsed.get("routine_tip", "Stay consistent with SPF protection while treating active spots."),
                    "source": "xAI Grok-3"
                }

        except Exception as e:
            logger.warning(f"Grok API call encountered issue: {e}. Falling back to deterministic recommendation bundle.")

        return self._fallback_recommendation(primary_fallback_bundle, skin_type, concerns)

    def _fallback_recommendation(
        self,
        fallback_bundle: List[Dict[str, Any]],
        skin_type: str,
        concerns: List[str]
    ) -> Dict[str, Any]:
        """
        High-fidelity fallback attaching customized ingredient justifications to primary bundle.
        """
        enriched_products = []
        for p in fallback_bundle:
            p_copy = dict(p)
            step = p.get("routine_step", "Treatment")
            actives = p.get("key_active_ingredients", [])
            act_names = [a.get("name") if isinstance(a, dict) else str(a) for a in actives]
            actives_str = ", ".join(act_names[:2]) if act_names else "dermatological actives"

            if step == "Cleanser":
                reason = (
                    f"Selected as the foundational first step. Its {actives_str} formulation clears excess surface sebum "
                    f"and unclogs micro-comedones without disrupting the acid mantle."
                )
            elif step == "Serum":
                reason = (
                    f"Acts as your high-potency core treatment. Concentrated {actives_str} penetrates deep into the epidermis "
                    f"to reduce visible blemish marks and regulate cellular turnover."
                )
            elif step == "Moisturizer":
                reason = (
                    f"Provides essential barrier recovery. Blended with {actives_str} to lock in essential moisture "
                    f"and prevent trans-epidermal water loss across your {skin_type.lower()} zones."
                )
            elif step == "Sunscreen":
                reason = (
                    f"Critical non-negotiable daytime defense. Formulated with lightweight UV filters and {actives_str} "
                    f"to guard sensitized spots from post-inflammatory hyperpigmentation and photo-damage."
                )
            else:
                reason = (
                    f"Targeted cosmetic support powered by {actives_str} to accelerate skin clarity and smooth texture."
                )

            p_copy["grok_reason"] = reason
            enriched_products.append(p_copy)

        concerns_str = " and ".join(concerns[:2]) if concerns else "oil control"
        tip = (
            f"For your {skin_type.lower()} skin, introduce new active serums sequentially. "
            f"Always follow chemical exfoliation or blemish treatments with generous broad-spectrum SPF every single morning."
        )

        return {
            "selected_products": enriched_products,
            "routine_tip": tip,
            "source": "SkinGenie Intelligent Rules Engine (Grok Ready)"
        }

grok_recommender_agent = GrokRecommenderAgent()
