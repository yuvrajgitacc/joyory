import json
import logging
from typing import Dict, Any, Optional
from config import GEMINI_API_KEY, GEMINI_MODEL_NAME

logger = logging.getLogger("narrator_agent")

NARRATOR_SYSTEM_PROMPT = """You are Joyory's empathetic, highly knowledgeable personal beauty & skincare advisor.
When reviewing facial scan telemetry from our vision models, speak in a gentle, conversational Hinglish/approachable tone (the natural way people talk about skincare in India).

STRICT STRUCTURE TO FOLLOW:
1. Start with an honest disclaimer:
   "Photo/scan ke basis par exact medical diagnosis toh nahi kar sakte, but visual analysis ke according:"
2. Zone-by-zone breakdown based on the detected metrics:
   - Forehead & T-Zone: mention clogged pores / comedones or texture
   - Cheeks: mention active surface bumps (papules), redness, or moisture levels
   - Texture & Marks: mention post-blemish marks, smoothness score, or tone uniformity
3. Overall Assessment:
   - e.g. "Overall skin mild-to-moderate acne-prone/combination lag rahi hai; severe ya cystic jaisa kuch obvious nahi dikh raha."
4. Lighting Note:
   - "Camera lighting aur angle se appearance thoda change ho sakta hai."
5. Warm Encouraging Transition:
   - "Isi analysis ke basis par neeche humne aapke liye complete Morning & Night routine formulate ki hai with authentic Joyory products!"

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
        self.model_name = GEMINI_MODEL_NAME

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
        focus_areas = vision_result.get("focus_areas", ["T-Zone", "Cheeks"])

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
Here is the exact diagnostic telemetry from our vision models:
- Dominant Skin Profile: {user_skin_type}
- Skin Tone Index: {skin_tone.get('label', 'Warm Tone')} (Hex: {skin_tone.get('hex', '#d2a07c')})
- Quantitative Skin Signals:
  * Texture Smoothness: {texture_score}/100
  * Moisture Hydration: {hydration_score}/100
  * Sun Clarity Index: {sun_score}/100
  * Elasticity Tension: {firmness_score}/100
- Visible Blemishes:
  * Total Active Spots: {total_lesions}
  * Micro-comedones (pore congestion): {comedones}
  * Surface Papules (inflamed spots): {papules}
  * Overall Blemish Severity: {severity}
- Priority Focus Areas: {', '.join(focus_areas)}
- Identified Visible Concerns: {', '.join(user_concerns)}

Write the structured conversational skin breakdown following the exact 5-point layout in your instructions.
"""

            response = client.models.generate_content(
                model=self.model_name,
                contents=[user_prompt],
                config=types.GenerateContentConfig(
                    system_instruction=NARRATOR_SYSTEM_PROMPT,
                    temperature=0.3,
                    max_output_tokens=2048  # Increased to account for Gemini 2.5 Flash thinking tokens
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
        Empathetic conversational fallback matching the exact requested breakdown.
        """
        lines = [
            "Photo ke basis par exact clinical diagnosis nahi kar sakte, but visual scan ke according:\n",
            f"• Forehead & T-Zone: Lagbhag {comedones} small clogged pores aur micro-comedones visible hain, jisse texture thoda uneven lag raha hai.",
            f"• Cheeks: {papules} active surface bumps notice hue hain, jahan halki redness dikh sakti hai.",
            f"• Hydration & Marks: Hydration level {int(hydration)}/100 hai (barrier ko extra moisture aur soothing care chahiye), aur purane spots ke halkey marks dikh rahe hain.",
            f"• Overall: Skin {severity.lower()} {skin_type.lower()} acne-prone lag rahi hai; severe ya cystic jaisa kuch obvious nahi hai.",
            "• Note: Camera lighting aur resolution se actual appearance mein thoda difference ho sakta hai.\n",
            "Isi scan ke basis par neeche humne aapke liye complete Morning & Night routine aur targeted Joyory products select kiye hain!"
        ]
        return "\n".join(lines)

narrator_agent = NarratorAgent()
