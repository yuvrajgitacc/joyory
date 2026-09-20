import json
import logging
from typing import List, Dict, Any, Tuple
from config import INGREDIENT_RULES_FILE

logger = logging.getLogger("safety_agent")

class SafetyAgent:
    """
    Deterministic safety rules engine.
    Ensures safe product layering based on active ingredients with 4 defined tiers:
    SAFE (Green), CAUTION (Yellow), SEPARATE (Orange), AVOID (Red).
    """
    def __init__(self, rules_path=INGREDIENT_RULES_FILE):
        self.rules_path = rules_path
        self.rules = []
        self.mandatory_pairings = []
        self.universal_safe = []
        self.load_rules()

    def load_rules(self):
        try:
            with open(self.rules_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.rules = data.get("rules", [])
                self.mandatory_pairings = data.get("mandatory_pairings", [])
                self.universal_safe = data.get("universal_safe", [])
        except Exception as e:
            logger.error(f"Failed to load ingredient rules: {e}")
            self.rules = []

    def normalize_ingredient(self, ing: str) -> str:
        ing_lower = ing.lower()
        if "retinol" in ing_lower or "retinoid" in ing_lower:
            return "Retinol"
        if "vitamin c" in ing_lower or "ascorbic" in ing_lower:
            return "Vitamin C"
        if "salicylic" in ing_lower or "bha" in ing_lower or "lha" in ing_lower:
            return "Salicylic Acid"
        if "glycolic" in ing_lower or "aha" in ing_lower or "lactic" in ing_lower:
            return "Glycolic Acid"
        if "benzoyl peroxide" in ing_lower:
            return "Benzoyl Peroxide"
        if "niacinamide" in ing_lower or "vitamin b3" in ing_lower:
            return "Niacinamide"
        if "hyaluronic" in ing_lower:
            return "Hyaluronic Acid"
        if "ceramide" in ing_lower:
            return "Ceramides"
        if "azelaic" in ing_lower:
            return "Azelaic Acid"
        if "centella" in ing_lower or "cica" in ing_lower or "madecassoside" in ing_lower:
            return "Centella Asiatica (Cica)"
        if "green tea" in ing_lower:
            return "Green Tea Extract"
        if "squalane" in ing_lower:
            return "Squalane"
        if "peptide" in ing_lower:
            return "Peptides"
        return ing.strip()

    def extract_actives(self, product: Dict[str, Any]) -> List[str]:
        actives = set()
        raw_actives = product.get("full_actives", [])
        for a in raw_actives:
            actives.add(self.normalize_ingredient(a))
            
        for ing_obj in product.get("key_active_ingredients", []):
            if isinstance(ing_obj, dict) and "name" in ing_obj:
                actives.add(self.normalize_ingredient(ing_obj["name"]))
        return list(actives)

    def check_pair(self, active_a: str, active_b: str) -> Dict[str, Any]:
        """
        Check relationship between two active ingredients.
        """
        if active_a == active_b:
            return {"level": "SAFE", "recommendation": "Compatible", "reason": "Identical active class"}

        if active_a in self.universal_safe or active_b in self.universal_safe:
            return {
                "level": "SAFE",
                "recommendation": "Universal compatibility",
                "reason": f"{active_a if active_a in self.universal_safe else active_b} is a barrier-supportive active safe to combine with all treatments."
            }

        for rule in self.rules:
            r_a = rule.get("a")
            r_b = rule.get("b")
            if (r_a == active_a and r_b == active_b) or (r_a == active_b and r_b == active_a):
                return {
                    "level": rule.get("level", "CAUTION"),
                    "recommendation": rule.get("recommendation", ""),
                    "reason": rule.get("reason", "")
                }

        return {
            "level": "SAFE",
            "recommendation": "Generally compatible",
            "reason": "No documented contraindications between these cosmetic active concentrations."
        }

    def evaluate_routine_safety(self, products: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Evaluates a set of products selected for a user's routine.
        Returns safety warnings, compatibility statuses, and mandatory pairing validations.
        """
        conflicts = []
        cautions = []
        separations = []
        all_actives_in_routine = set()

        # Collect actives
        for p in products:
            p_actives = self.extract_actives(p)
            for act in p_actives:
                all_actives_in_routine.add(act)

        # Check all pairs
        evaluated_pairs = set()
        for i in range(len(products)):
            for j in range(i + 1, len(products)):
                p1 = products[i]
                p2 = products[j]
                actives1 = self.extract_actives(p1)
                actives2 = self.extract_actives(p2)

                for a1 in actives1:
                    for a2 in actives2:
                        pair_key = tuple(sorted([a1, a2]))
                        if pair_key in evaluated_pairs:
                            continue
                        evaluated_pairs.add(pair_key)

                        result = self.check_pair(a1, a2)
                        level = result["level"]
                        item = {
                            "active_a": a1,
                            "active_b": a2,
                            "product_a": p1.get("name"),
                            "product_b": p2.get("name"),
                            "level": level,
                            "recommendation": result["recommendation"],
                            "reason": result["reason"]
                        }

                        if level == "AVOID":
                            conflicts.append(item)
                        elif level == "SEPARATE":
                            separations.append(item)
                        elif level == "CAUTION":
                            cautions.append(item)

        # Validate mandatory pairings (e.g. SPF with photosensitizers)
        has_sunscreen = any(p.get("routine_step") == "Sunscreen" for p in products)
        mandatory_alerts = []

        for req in self.mandatory_pairings:
            triggers = req.get("if_using", [])
            matched_triggers = [t for t in triggers if self.normalize_ingredient(t) in all_actives_in_routine]
            if matched_triggers and not has_sunscreen:
                mandatory_alerts.append({
                    "level": "MANDATORY_SPF",
                    "reason": f"Active exfoliation/retinization with {', '.join(matched_triggers)} increases UV sensitivity. A broad-spectrum SPF 50+ is mandatory.",
                    "required_step": "Sunscreen"
                })

        overall_status = "SAFE"
        if conflicts:
            overall_status = "AVOID_DETECTED"
        elif separations:
            overall_status = "SEPARATION_REQUIRED"
        elif cautions:
            overall_status = "CAUTION_ADVISED"

        return {
            "overall_status": overall_status,
            "conflicts": conflicts,
            "separations": separations,
            "cautions": cautions,
            "mandatory_alerts": mandatory_alerts
        }

safety_agent = SafetyAgent()
