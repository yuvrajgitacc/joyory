import uuid
from datetime import datetime
from typing import Dict, Any, List

class ProgressAgent:
    """
    Progress & Longitudinal Tracking Module.
    Maintains user scan history, computes delta improvements across image-derived skin signals,
    and provides tangible before/after milestone validation.
    """
    def __init__(self):
        # In-memory dictionary: session_id -> list of scan records
        self.history: Dict[str, List[Dict[str, Any]]] = {}

    def record_and_compare(
        self,
        session_id: str,
        current_metrics: Dict[str, Any],
        current_acne: Dict[str, Any],
        image_snapshot_url: str = ""
    ) -> Dict[str, Any]:
        if not session_id:
            session_id = str(uuid.uuid4())

        now_str = datetime.now().strftime("%b %d, %Y %I:%M %p")
        new_entry = {
            "scan_id": str(uuid.uuid4())[:8],
            "timestamp": now_str,
            "metrics": current_metrics,
            "acne": current_acne,
            "image_url": image_snapshot_url
        }

        user_scans = self.history.setdefault(session_id, [])
        is_first_scan = len(user_scans) == 0

        deltas = {}
        insights = []

        if not is_first_scan:
            baseline = user_scans[0]
            prev_metrics = baseline["metrics"]

            for metric_key in ["texture_score", "hydration_score", "sun_exposure_score", "firmness_score"]:
                curr_val = current_metrics.get(metric_key, 50)
                prev_val = prev_metrics.get(metric_key, 50)
                diff = round(curr_val - prev_val, 1)
                deltas[metric_key] = diff

                if metric_key == "hydration_score" and diff > 0:
                    insights.append(f"💧 Hydration increased by +{diff} pts — barrier hydration seal is working.")
                elif metric_key == "texture_score" and diff > 0:
                    insights.append(f"✨ Skin texture smoothed by +{diff} pts — cellular exfoliation showing visible progress.")
                elif metric_key == "sun_exposure_score" and diff < 0:
                    insights.append(f"☀️ Pigmentation indicators reduced by {abs(diff)} pts with consistent SPF use.")
                elif metric_key == "firmness_score" and diff > 0:
                    insights.append(f"🌟 Elasticity balance improved by +{diff} pts.")

            # Acne lesion comparison
            prev_lesions = baseline.get("acne", {}).get("total_lesions", 0)
            curr_lesions = current_acne.get("total_lesions", 0)
            lesion_diff = curr_lesions - prev_lesions
            deltas["lesions_delta"] = lesion_diff
            if lesion_diff < 0:
                insights.append(f"🛡️ Active visible blemishes reduced by {abs(lesion_diff)} spots.")
        else:
            insights.append("🎯 Baseline scan recorded! Repeat scan in 14-21 days to track active ingredient response.")

        user_scans.append(new_entry)

        return {
            "session_id": session_id,
            "scan_count": len(user_scans),
            "is_first_scan": is_first_scan,
            "deltas": deltas,
            "clinical_insights": insights,
            "timeline": user_scans,
            "baseline_scan": user_scans[0],
            "latest_scan": new_entry
        }

progress_agent = ProgressAgent()
