import logging
from typing import Dict, Any
from agents.vision_agent import vision_agent
from agents.recommender_agent import recommender_agent
from agents.safety_agent import safety_agent
from agents.routine_agent import routine_agent
from agents.retention_agent import retention_agent
from agents.progress_agent import progress_agent
from agents.narrator_agent import narrator_agent
from agents.grok_recommender_agent import grok_recommender_agent
from agents.derm_agent import derm_agent

logger = logging.getLogger("orchestrator")

class AgentOrchestrator:
    """
    SkinGenie Pipeline Orchestrator.
    Executes the multi-agent AI skincare pipeline:
    1. Vision Analysis (ONNX Blemish & Signals + Tone)
    2. Gemini Narrator (Empathetic conversational condition overview from raw model telemetry)
    3. Product Retrieval & Pre-filtering (from 680-product Joyory dataset)
    4. Grok Intelligent Recommender (Ingredient-level justification & synergistic regimen assembly)
    5. Deterministic Safety Check (SAFE / CAUTION / SEPARATE / AVOID)
    6. Routine Assembly (AM / PM Sequencing with ingredient conflict handling)
    7. Replenishment & Longitudinal Progress Tracking
    """
    async def run(self, image_bytes: bytes, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        session_id = user_profile.get("session_id", "default_session")
        budget_pref = user_profile.get("budget", "all")
        user_override_skin_type = user_profile.get("skin_type")

        scan_mode = user_profile.get("scan_mode", "normal")

        # Step 1: Vision Module (Tone + ONNX Signals + Cosmetic Classification)
        vision_result = await vision_agent.analyze(image_bytes, scan_mode=scan_mode)
        if vision_result.get("status") == "error":
            return {
                "status": "error",
                "error_code": vision_result.get("error_code", "OOD_REJECTED"),
                "message": vision_result.get("message", "Invalid image detected. Please provide a clear facial photo."),
                "disclaimer": "This analysis identifies visible skin characteristics for cosmetic skincare guidance. It is not a medical diagnosis."
            }

        skin_type = user_override_skin_type if user_override_skin_type else vision_result.get("skin_type", "Combination")
        concerns = vision_result.get("primary_concerns", ["Acne & Blemishes", "Sun Protection"])

        # Step 1b: Optional research-only derm assessment (default OFF).
        # Additive key only; pipeline is unchanged when disabled/unconfigured.
        derm_assessment = await derm_agent.assess(image_bytes)
        vision_result["derm_assessment"] = derm_assessment

        # Step 2: Gemini Narrator Agent (Warm, human conversational description based on raw model numbers)
        narrator_description = await narrator_agent.generate_description(
            vision_result=vision_result,
            skin_type=skin_type,
            concerns=concerns,
            image_bytes=image_bytes,
            scan_mode=scan_mode
        )
        vision_result["narrator_description"] = narrator_description

        # Step 3: Catalog Recommender Module (with 'Why Recommended' explainability from 680 catalog)
        recommendations = recommender_agent.recommend(
            concerns=concerns,
            skin_type=skin_type,
            budget=budget_pref
        )
        primary_products = recommendations.get("primary_bundle", [])

        # Step 4: Grok Recommender Agent (Curated shortlist -> ingredient justification)
        product_shortlist = recommender_agent.get_shortlist(
            concerns=concerns,
            skin_type=skin_type,
            budget=budget_pref,
            limit=15
        )
        grok_analysis = await grok_recommender_agent.recommend(
            skin_analysis=vision_result,
            skin_type=skin_type,
            concerns=concerns,
            budget=budget_pref,
            product_shortlist=product_shortlist,
            primary_fallback_bundle=primary_products
        )

        # Enrich primary products with Grok's personalized reasoning
        grok_reason_map = {
            p["product_id"]: p.get("grok_reason") 
            for p in grok_analysis.get("selected_products", []) 
            if p.get("grok_reason")
        }
        for p in primary_products:
            if p.get("product_id") in grok_reason_map:
                p["grok_reason"] = grok_reason_map[p["product_id"]]

        # Step 5: Deterministic Safety Rules Engine (SAFE / CAUTION / SEPARATE / AVOID)
        safety_analysis = safety_agent.evaluate_routine_safety(primary_products)

        # Step 6: Routine Architecture (AM / PM Sequencing with ingredient conflict handling)
        routine = routine_agent.build_routine(primary_products, safety_analysis)

        # Step 7: Smart Care Companion (Replenishment timing & WhatsApp simulation)
        replenishment = retention_agent.calculate_replenishment(primary_products)

        # Step 8: Progress & Longitudinal Tracking
        progress = progress_agent.record_and_compare(
            session_id=session_id,
            current_metrics=vision_result.get("skin_signals", {}),
            current_acne=vision_result.get("blemish_assessment", {})
        )

        return {
            "status": "success",
            "session_id": session_id,
            "vision": vision_result,
            "derm_assessment": derm_assessment,
            "narrator_description": narrator_description,
            "recommendations": recommendations,
            "grok_recommendations": grok_analysis,
            "safety": safety_analysis,
            "routine": routine,
            "replenishment": replenishment,
            "progress": progress,
            "disclaimer": "This analysis identifies visible skin characteristics for cosmetic skincare guidance. It is not a medical diagnosis."
        }

orchestrator = AgentOrchestrator()
