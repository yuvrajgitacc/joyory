import json
import logging
from typing import Dict, Any, Optional
from config import GEMINI_API_KEY, GEMINI_MODEL_NAME

logger = logging.getLogger("narrator_agent")

NARRATOR_SYSTEM_PROMPT = """You are an empathetic, knowledgeable personal skincare advisor at Joyory (an Indian beauty & wellness platform).
Your task is to review the quantitative skin metrics detected by our computer vision neural network and explain what is happening with the person's skin in a warm, gentle, human manner.

STRICT GUIDELINES:
1. Speak in warm, conversational, reassuring 2nd person ("Your skin is showing...", "We noticed...").
2. DO NOT SOUND LIKE A ROBOT OR CLINICAL FORM. Sound like an expert friend who genuinely cares about their skin journey.
3. NEVER claim to be a medical doctor or dermatologist. Do NOT offer medical diagnoses (e.g., do not say cystic acne, infection, dermatitis, eczema, psoriasis).
4. GROUND YOUR DESCRIPTION ENTIRELY ON THE PROVIDED METRICS. Do NOT invent problems not detected by the model.
5. Weave the exact metrics naturally into your description (e.g., mention the specific spot count, whether hydration looks low, texture tightness, or sun defense needs).
6. Explain gently WHY their skin might feel this way (e.g., surface dehydration, sebum build-up in the T-zone, or sun exposure).
7. End on a reassuring, positive note emphasizing that skin is resilient and responds beautifully to a gentle, consistent routine.
8. Length: Exactly 3 to 5 natural, well-crafted sentences.
9. No markdown bullets, no asterisks, no headers — just continuous warm prose.
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

        texture_score = signals.get("texture_score", 70)
        hydration_score = signals.get("hydration_score", 60)
        sun_score = signals.get("sun_exposure_score", 35)
        firmness_score = signals.get("firmness_score", 80)

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

Write a gentle, conversational 3-5 sentence description explaining their skin condition to them. Speak directly to them, acknowledge their specific numbers, explain the root of it (like moisture or sebum balance), and leave them feeling hopeful and supported.
"""

            response = client.models.generate_content(
                model=self.model_name,
                contents=[user_prompt],
                config=types.GenerateContentConfig(
                    system_instruction=NARRATOR_SYSTEM_PROMPT,
                    temperature=0.6,
                    max_output_tokens=300
                )
            )

            if response and response.text:
                cleaned_text = response.text.strip().replace('"', '')
                logger.info("Successfully generated Gemini narrative.")
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
        Smart, empathetic fallback generator that produces personalized conversational descriptions
        based on exact metrics when API key is pending.
        """
        areas_str = " and ".join(focus_areas[:2]) if focus_areas else "the T-zone"
        concerns_str = ", ".join(concerns[:2]) if concerns else "oil control and texture"

        if total_lesions > 0:
            spot_desc = (
                f"Taking a close look at your scan, we noticed about {total_lesions} visible spots—mainly "
                f"{comedones} small congested pores and {papules} active surface bumps around {areas_str}."
            )
        else:
            spot_desc = "Your skin surface is remarkably clear of active inflammatory breakouts right now."

        if hydration < 55:
            moisture_desc = (
                f"Your moisture barrier is currently running a bit low at {int(hydration)}/100, "
                f"which often causes skin to overproduce sebum to compensate, leading to unexpected breakouts."
            )
        else:
            moisture_desc = (
                f"On the bright side, your hydration levels look steady at {int(hydration)}/100, giving your epidermal "
                f"barrier a solid foundation to heal."
            )

        closing_desc = (
            f"With your {skin_type.lower()} profile, focusing on {concerns_str} with gentle, non-stripping actives "
            f"will help soothe irritation and restore a smooth, calm glow within just a few weeks."
        )

        return f"{spot_desc} {moisture_desc} {closing_desc}"

narrator_agent = NarratorAgent()
