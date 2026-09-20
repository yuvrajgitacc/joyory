import re
from datetime import datetime, timedelta
from typing import List, Dict, Any

class RetentionAgent:
    """
    Smart Care Companion.
    Estimates daily formulation consumption and schedules proactive replenishment alerts
    to ensure users never break their active treatment cycle.
    """
    USAGE_PROFILES = {
        "Cleanser": {"daily_ml": 2.5, "uses_per_day": 2, "unit_cost_label": "dime size (1.25ml)"},
        "Serum": {"daily_ml": 0.5, "uses_per_day": 1, "unit_cost_label": "3-4 drops (0.5ml)"},
        "Moisturizer": {"daily_ml": 1.5, "uses_per_day": 2, "unit_cost_label": "blueberry size (0.75ml)"},
        "Sunscreen": {"daily_ml": 1.5, "uses_per_day": 1, "unit_cost_label": "2 finger lengths (1.5ml)"},
        "Treatment": {"daily_ml": 0.3, "uses_per_day": 1, "unit_cost_label": "targeted dot (0.3ml)"},
        "Eye Care": {"daily_ml": 0.25, "uses_per_day": 1, "unit_cost_label": "rice grain (0.25ml)"}
    }

    def parse_volume(self, size_str: str) -> float:
        if not size_str:
            return 50.0
        match = re.search(r"(\d+(\.\d+)?)", size_str)
        if match:
            return float(match.group(1))
        return 50.0

    def calculate_replenishment(self, products: List[Dict[str, Any]]) -> Dict[str, Any]:
        schedule = []
        today = datetime.now()

        total_routine_monthly_cost = 0.0

        for p in products:
            step = p.get("routine_step", "Treatment")
            vol_ml = self.parse_volume(p.get("volume_size", "50 ML"))
            profile = self.USAGE_PROFILES.get(step, {"daily_ml": 1.0, "uses_per_day": 1, "unit_cost_label": "1 ml"})

            daily_consumption = profile["daily_ml"]
            total_days_lasting = max(14, int(vol_ml / daily_consumption))
            nudge_day = max(7, int(total_days_lasting * 0.85))

            depletion_date = today + timedelta(days=total_days_lasting)
            reminder_date = today + timedelta(days=nudge_day)

            price = p.get("price", 0)
            cost_per_day = price / total_days_lasting
            cost_per_month = cost_per_day * 30
            total_routine_monthly_cost += cost_per_month

            whatsapp_message_preview = (
                f"✨ Hi from Joyory! Your bottle of {p.get('name')} is estimated at 15% remaining "
                f"(~{total_days_lasting - nudge_day} days left). Reorder today with code CARE10 for 10% off & zero routine interruption."
            )

            schedule.append({
                "product_id": p.get("product_id"),
                "product_name": p.get("name"),
                "brand": p.get("brand"),
                "step": step,
                "volume_size": p.get("volume_size"),
                "price": price,
                "estimated_total_days": total_days_lasting,
                "reminder_day_count": nudge_day,
                "days_remaining_at_nudge": total_days_lasting - nudge_day,
                "reminder_date_str": reminder_date.strftime("%b %d, %Y"),
                "depletion_date_str": depletion_date.strftime("%b %d, %Y"),
                "cost_per_day": round(cost_per_day, 1),
                "cost_per_month": round(cost_per_month, 0),
                "dosage_guide": profile["unit_cost_label"],
                "whatsapp_simulation": {
                    "scheduled_for": reminder_date.strftime("%Y-%m-%d"),
                    "message": whatsapp_message_preview,
                    "channel": "WhatsApp Care Assistant"
                }
            })

        # Sort chronologically by reminder date
        schedule.sort(key=lambda x: x["reminder_day_count"])

        return {
            "schedule": schedule,
            "summary": {
                "active_items_tracked": len(schedule),
                "earliest_replenishment": schedule[0] if schedule else None,
                "estimated_monthly_investment": round(total_routine_monthly_cost, 0),
                "currency": "INR"
            }
        }

retention_agent = RetentionAgent()
