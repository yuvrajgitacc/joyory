import json
import logging
from typing import Dict, Any, Optional
from config import GEMINI_API_KEY, GEMINI_MODEL_NAME

logger = logging.getLogger("narrator_agent")

NARRATOR_SYSTEM_PROMPT = """You are Joyory's empathetic, highly knowledgeable personal beauty & skincare advisor.
When reviewing facial scan telemetry from our vision models, speak in a gentle, conversational Hinglish/approachable tone (the natural way people talk about skincare in India).

STRICT CRITICAL RULES:
- ONLY talk about what is actually present in the scan telemetry.
- DO NOT assume or invent specific face parts like Forehead, Chin, or T-Zone UNLESS specifically noted. The user might have uploaded a cheek crop or localized skin area. Keep your focus strictly on the scanned skin region!
- Structure your response naturally with these points:
  1. Honest disclaimer:
     "Photo/scan ke basis par exact medical diagnosis toh nahi kar sakte, but visual analysis ke according:"
  2. Blemish & Pore Observation:
     Describe the detected spots ({total_lesions} active lesions: {comedones} micro-comedones, {papules} surface bumps/papules).
  3. Hydration & Skin Barrier:
     Explain what the hydration index ({hydration_score}/100) means for their moisture barrier.
  4. Texture & Marks:
     Discuss the smoothness score ({texture_score}/100) and any post-acne marks or tone clarity.
  5. Overall Assessment:
     e.g., "Overall skin {severity} {skin_type} acne-prone lag rahi hai; severe ya cystic jaisa kuch obvious nahi hai."
  6. Camera Lighting Note:
     "Camera lighting aur angle se appearance thoda change ho sakta hai."
  7. Warm Encouraging Transition:
     "Isi analysis ke basis par neeche humne aapke liye complete Morning & Night routine formulate ki hai with authentic Joyory products!"

STRICT SAFETY RULES:
- NEVER diagnose diseases or use scary clinical jargon (no "melasma", "rosacea", "pathology", "disease").
- Keep it supportive, clear, relatable, and grounded in the numbers provided.
"""

class NarratorAgent:
    """
    Gemini-Powered Natural Language Skin Condition Narrator.
    Translates raw neural network measurements (ONNX blemish counts, skin signals, tone)
    into an empathetic, conversational, highly relatable personal skin summary.
    """
    def __init__(self):
        self.model_name = GEMINI_MODEL_NAME or "gemini-3.1-flash-lite"

    async def generate_description(
        self,
        vision_result: Dict[str, Any],
        skin_type: Optional[str] = None,
        concerns: Optional[list] = None
    ) -> str:
        """
        Generates human-like conversational skin overview based on raw model outputs.
        """
        skin_tone = vision_result.get("skin_tone", {})
        signals = vision_result.get("skin_signals", {})
        acne = vision_result.get("blemish_assessment", {})
        user_skin_type = skin_type or vision_result.get("skin_type", "Combination")
        user_concerns = concerns or vision_result.get("primary_concerns", ["Acne & Blemishes", "Sun Protection"])
        focus_areas = vision_result.get("focus_areas", ["Scanned Skin Region"])

        total_lesions = acne.get("total_lesions", 0)
        comedones = acne.get("comedones", 0)
        papules = acne.get("papules", 0)
        severity = acne.get("severity", "Mild")

        texture_score = signals.get("texture_score", 68)
        hydration_score = signals.get("hydration_score", 48)
        sun_score = signals.get("sun_exposure_score", 42)
        firmness_score = signals.get("firmness_score", 78)

        # Check for Gemini API key
        if not GEMINI_API_KEY:
            logger.info("GEMINI_API_KEY not configured. Generating high-fidelity template narrative.")
            return self._generate_fallback_narrative(
                skin_type=user_skin_type,
                concerns=user_concerns,
                total_lesions=total_lesions,
                comedones=comedones,
                papules=papules,
                severity=severity,
                hydration=hydration_score,
                texture=texture_score,
                focus_areas=focus_areas
            )

        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=GEMINI_API_KEY)

            user_prompt = f"""
Here is the exact diagnostic telemetry from our local vision models:
- Dominant Skin Profile: {user_skin_type}
- Skin Tone Index: {skin_tone.get('label', 'Warm Tone')} (Hex: {skin_tone.get('hex', '#d2a07c')})
- Quantitative Skin Signals:
  * Texture Smoothness: {texture_score}/100
  * Moisture Hydration: {hydration_score}/100
  * Sun Clarity Index: {sun_score}/100
  * Elasticity Tension: {firmness_score}/100
- Visible Blemishes in Scanned Area:
  * Total Active Spots: {total_lesions}
  * Micro-comedones (pore congestion): {comedones}
  * Surface Papules (active bumps): {papules}
  * Overall Blemish Severity: {severity}
- Priority Concerns: {', '.join(user_concerns)}

Write the structured conversational skin breakdown. Remember: DO NOT assume or mention forehead or chin unless it was part of the scan telemetry. Focus strictly on the scanned skin!
"""

            response = client.models.generate_content(
                model=self.model_name,
                contents=[user_prompt],
                config=types.GenerateContentConfig(
                    system_instruction=NARRATOR_SYSTEM_PROMPT,
                    temperature=0.3,
                    max_output_tokens=1000
                )
            )

            if response and response.text:
                cleaned_text = response.text.strip()
                logger.info(f"Successfully generated Gemini narrative ({len(cleaned_text)} chars).")
                return cleaned_text

        except Exception as e:
            logger.warning(f"Gemini narrator call encountered issue: {e}. Falling back to smart narrative generator.")

        return self._generate_fallback_narrative(
            skin_type=user_skin_type,
            concerns=user_concerns,
            total_lesions=total_lesions,
            comedones=comedones,
            papules=papules,
            severity=severity,
            hydration=hydration_score,
            texture=texture_score,
            focus_areas=focus_areas
        )

    def _generate_fallback_narrative(
        self,
        skin_type: str,
        concerns: list,
        total_lesions: int,
        comedones: int,
        papules: int,
        severity: str,
        hydration: float,
        texture: float,
        focus_areas: list
    ) -> str:
        """
        Empathetic conversational fallback matching the exact requested breakdown without assumptions.
        """
        lines = [
            "Photo/scan ke basis par exact medical diagnosis toh nahi kar sakte, but visual analysis ke according:\n",
            f"• Active Blemishes & Pores: Scanned region mein lagbhag {total_lesions} visible spots detect hue hain ({comedones} micro-comedones aur {papules} active bumps), jisse surface texture par dhyan dene ki zaroorat hai.",
            f"• Hydration & Moisture Barrier: Skin ka moisture index {int(hydration)}/100 hai — barrier ko extra hydration aur calming nourishment chahiye.",
            f"• Surface Smoothness: Texture score {int(texture)}/100 par calibrated hai; halkey post-acne marks aur unevenness notice ho sakti hai.",
            f"• Overall Assessment: Skin {severity.lower()} {skin_type.lower()} stage mein hai. Severe ya cystic jaisa kuch nahi hai, bas gentle consistent care chahiye.",
            "• Camera Lighting Note: Lighting conditions aur angle se actual tone mein thoda variation aa sakta hai.\n",
            "Neeche humne aapke isi scan ke basis par personalized Joyory Morning & Night routine select ki hai!"
        ]
        return "\n".join(lines)

narrator_agent = NarratorAgent()
