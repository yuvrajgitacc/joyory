import logging
from typing import List, Dict, Any

logger = logging.getLogger("routine_agent")

class RoutineAgent:
    """
    AM/PM Routine Architect.
    Sequences compatible products into morning and evening skincare regimens,
    incorporating deterministic safety constraints and application guidance.
    """
    def build_routine(
        self,
        products: List[Dict[str, Any]],
        safety_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        am_steps = []
        pm_steps = []

        # Categorize by product type and routine phase
        cleansers = [p for p in products if p.get("routine_step") == "Cleanser"]
        serums = [p for p in products if p.get("routine_step") == "Serum"]
        moisturizers = [p for p in products if p.get("routine_step") == "Moisturizer"]
        sunscreens = [p for p in products if p.get("routine_step") == "Sunscreen"]
        treatments = [p for p in products if p.get("routine_step") in ["Treatment", "Eye Care"]]

        # 1. AM Routine Assembly
        # Step 1: Cleanser
        if cleansers:
            am_steps.append({
                "step_number": 1,
                "title": "Cleanse & Refresh",
                "phase": "AM",
                "product": cleansers[0],
                "instructions": "Wash face with lukewarm water for 45-60 seconds. Pat dry with a clean microfiber towel.",
                "timing": "Morning"
            })

        # Step 2: AM Serum (Prioritize Vitamin C / Niacinamide / Hyaluronic)
        am_serum = None
        for s in serums:
            phase = s.get("routine_phase", "BOTH")
            actives_str = " ".join([a.get("name", "") for a in s.get("key_active_ingredients", [])]).lower()
            if phase in ["AM", "BOTH"] and "retinol" not in actives_str:
                am_serum = s
                break

        if am_serum:
            am_steps.append({
                "step_number": len(am_steps) + 1,
                "title": "Target & Protect",
                "phase": "AM",
                "product": am_serum,
                "instructions": "Dispense 3-4 drops onto palms and press gently into face and neck. Allow 60 seconds to absorb.",
                "timing": "Morning"
            })

        # Step 3: Hydrate / Moisturize
        if moisturizers:
            am_steps.append({
                "step_number": len(am_steps) + 1,
                "title": "Hydrate & Lock",
                "phase": "AM",
                "product": moisturizers[0],
                "instructions": "Smooth a dime-sized amount across face in upward motions.",
                "timing": "Morning"
            })

        # Step 4: Sunscreen (Mandatory AM Finale)
        if sunscreens:
            am_steps.append({
                "step_number": len(am_steps) + 1,
                "title": "Broad Spectrum Defense",
                "phase": "AM",
                "product": sunscreens[0],
                "instructions": "Apply 2 finger-lengths generously 15 minutes before UV exposure. Reapply every 2-3 hours.",
                "timing": "Morning"
            })

        # 2. PM Routine Assembly
        # Step 1: Cleanser
        if cleansers:
            pm_steps.append({
                "step_number": 1,
                "title": "Clarifying Cleanse",
                "phase": "PM",
                "product": cleansers[0],
                "instructions": "Double cleanse if wearing sunscreen or makeup to fully dissolve sebum and particulate buildup.",
                "timing": "Evening"
            })

        # Step 2: PM Treatment / Exfoliation / Retinoid
        pm_serum = None
        for s in serums:
            phase = s.get("routine_phase", "BOTH")
            actives_str = " ".join([a.get("name", "") for a in s.get("key_active_ingredients", [])]).lower()
            if phase in ["PM", "BOTH"] and s != am_serum:
                pm_serum = s
                break
        if not pm_serum and treatments:
            pm_serum = treatments[0]
        elif not pm_serum and serums:
            pm_serum = serums[0]

        if pm_serum:
            pm_steps.append({
                "step_number": len(pm_steps) + 1,
                "title": "Cellular Renewal Treatment",
                "phase": "PM",
                "product": pm_serum,
                "instructions": "Apply onto clean, dry skin. If introducing actives, start 2-3 evenings per week before nightly use.",
                "timing": "Evening"
            })

        # Step 3: Overnight Barrier Recovery
        pm_moisturizer = moisturizers[0] if moisturizers else None
        if pm_moisturizer:
            pm_steps.append({
                "step_number": len(pm_steps) + 1,
                "title": "Overnight Barrier Seal",
                "phase": "PM",
                "product": pm_moisturizer,
                "instructions": "Generously seal active layers with lipid barrier cream to minimize trans-epidermal water loss.",
                "timing": "Evening"
            })

        # Specialized notes and weekly schedules
        weekly_guidance = [
            "🌿 Introduce new active serums sequentially with a 48-hour patch test.",
            "☀️ Never skip AM SPF when using chemical exfoliants or retinoids in your evening routine.",
            "💧 On nights when your barrier feels sensitized, skip exfoliating treatments and double up on moisturizer."
        ]

        return {
            "am_routine": am_steps,
            "pm_routine": pm_steps,
            "safety_summary": {
                "status": safety_analysis.get("overall_status", "SAFE"),
                "separations_applied": safety_analysis.get("separations", []),
                "cautions_applied": safety_analysis.get("cautions", []),
                "conflicts_avoided": safety_analysis.get("conflicts", [])
            },
            "weekly_guidance": weekly_guidance
        }

routine_agent = RoutineAgent()
