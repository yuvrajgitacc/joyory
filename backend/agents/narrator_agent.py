import io
import json
import logging
from typing import Dict, Any, Optional
from config import GEMINI_API_KEY, GEMINI_MODEL_NAME

logger = logging.getLogger("narrator_agent")

NARRATOR_SYSTEM_PROMPT = """You are Joyory's expert personal beauty and skincare advisor.
Your job is to explain what was detected on their skin, WHY it happens (root cause), and what REMEDIES (active ingredients, moisturizers, and care habits) they need, speaking in warm, approachable, natural Hinglish (Hindi written in English alphabets, just like how skincare experts converse in India).

CRITICAL FORMATTING & LANGUAGE RULES:
- Strictly write in natural, conversational Hinglish (e.g., 'Aapke skin scan ke according...', 'Yeh isliye hota hai kyunki...'). Do NOT output pure English.
- DO NOT use robotic numbered template headings like '1. Honest disclaimer', '2. Blemish observation', or '6. Camera lighting note'.
- Structure your response cleanly using EXACTLY these 3 markdown headings:
  * **Kya Dikh Raha Hai (Scan Observations):** State clearly what the scan shows (exact blemish/spots count, clogged pores, hydration index, texture status).
  * **Yeh Kyun Hota Hai (Root Cause):** Explain simply why this happens (barrier dehydration causing rebound sebum/oil production, dead skin cells clogging pores, and lingering post-blemish marks).
  * **Remedies & Kya Karna Chahiye (Actionable Skincare Solutions):** Give concrete ingredient and product guidance:
    - Deep pore cleansing with gentle Salicylic Acid (BHA).
    - Barrier replenishment with a lightweight, non-comedogenic moisturizer containing Ceramides and Hyaluronic Acid.
    - Soothing active bumps and marks with Niacinamide.
    - Daily broad-spectrum gel/matte SPF.
- End on a warm, empowering note connecting directly to the personalized Joyory morning and night routine curated below!
"""

class NarratorAgent:
    """
    Gemini-Powered Natural Language Skincare Advisor.
    Translates raw neural network measurements (ONNX blemish counts, skin signals, tone)
    into an empathetic, actionable consultation with root-cause explanations and remedies.
    """
    def __init__(self):
        self.model_name = GEMINI_MODEL_NAME or "gemini-3.1-flash-lite"

    async def generate_description(
        self,
        vision_result: Dict[str, Any],
        skin_type: Optional[str] = None,
        concerns: Optional[list] = None,
        image_bytes: Optional[bytes] = None,
        scan_mode: str = "normal"
    ) -> str:
        """
        Generates actionable conversational skin overview based on raw model outputs.
        - scan_mode == 'normal': Gemini receives model telemetry only (no image).
        - scan_mode == 'advance': Gemini receives image bytes + telemetry for deep visual multimodal consultation.
        """
        skin_tone = vision_result.get("skin_tone", {})
        signals = vision_result.get("skin_signals", {})
        acne = vision_result.get("blemish_assessment", {})
        user_skin_type = skin_type or vision_result.get("skin_type", "Combination")
        user_concerns = concerns or vision_result.get("primary_concerns", ["Acne & Blemishes", "Sun Protection"])

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
                texture=texture_score
            )

        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=GEMINI_API_KEY)

            user_prompt = f"""
Customer Diagnostic Telemetry from Vision Models:
- Skin Type Profile: {user_skin_type}
- Skin Tone: {skin_tone.get('label', 'Warm Tone')} (Hex: {skin_tone.get('hex', '#d2a07c')})
- Quantitative Skin Signals:
  * Texture Smoothness: {texture_score}/100
  * Moisture Hydration Index: {hydration_score}/100
  * Sun Clarity Index: {sun_score}/100
  * Elasticity Tension: {firmness_score}/100
- Detected Blemishes in Scanned Area:
  * Total Active Spots: {total_lesions}
  * Micro-comedones (clogged pores): {comedones}
  * Surface Papules (active bumps): {papules}
  * Overall Blemish Severity: {severity}
- Priority Focus: {', '.join(user_concerns)}

Write the consultation in natural conversational Hinglish following the 3 sections:
**Kya Dikh Raha Hai (Scan Observations)**
**Yeh Kyun Hota Hai (Root Cause)**
**Remedies & Kya Karna Chahiye (Actionable Skincare Solutions)**
Include why this happens, what moisturizer/ingredients to use, and connect to the Joyory routine below.
"""

            contents = []
            if scan_mode == "advance" and image_bytes:
                # Advance mode: Include direct image pixels for multimodal visual confirmation
                contents.append(types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"))
                contents.append("Perform an advanced multimodal visual inspection of this selfie alongside the telemetry:\n" + user_prompt)
            else:
                # Standard mode: Gemini receives only model telemetry
                contents.append(user_prompt)

            response = client.models.generate_content(
                model=self.model_name,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=NARRATOR_SYSTEM_PROMPT,
                    temperature=0.3,
                    max_output_tokens=1500
                )
            )

            if response and response.text:
                cleaned_text = response.text.strip()
                logger.info(f"Successfully generated Gemini narrative ({len(cleaned_text)} chars, mode={scan_mode}).")
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
            texture=texture_score
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
        texture: float
    ) -> str:
        """
        Actionable conversational fallback with root cause and remedies.
        """
        lines = [
            "Hello! Main hoon aapki Joyory personal skincare advisor.\n",
            "**Kya Dikh Raha Hai (Scan Observations)**",
            f"Aapke scan mein lagbhag {total_lesions} active blemish spots detect hue hain ({comedones} micro-comedones aur {papules} active bumps). Aapka hydration score {int(hydration)}/100 hai, jo dikhata hai ki moisture barrier thirsty hai, aur texture score {int(texture)}/100 par calibrated hai.\n",
            "**Yeh Kyun Hota Hai (Root Cause)**",
            "Jab skin ka moisture barrier dehydrated hota hai, toh skin dryness se ladne ke liye extra sebum (oil) produce karne lagti hai. Yeh excess oil jab dead cells ke saath milta hai, toh pores clog ho jaate hain aur bumps banne lagte hain. Isliye skin ko aggressively dry karne ke bajaye balanced hydration dena zaroori hai.\n",
            "**Remedies & Kya Karna Chahiye (Actionable Skincare Solutions)**",
            "• **Pore Cleansing:** Salicylic Acid (BHA) cleanser use karein jo pores ke andar jakar excess sebum dissolve kare.",
            "• **Hydration & Barrier Healing:** Lightweight, non-comedogenic Ceramide & Hyaluronic Acid moisturizer zaroor lagayein.",
            "• **Calming Marks:** Niacinamide serum active bumps ko soothe karega aur purane marks ko fade karega.",
            "• **Daily Sunscreen:** Broad-spectrum SPF daily lagayein taaki spots dark na hon.\n",
            "Aapke isi telemetry ke basis par neeche humne complete Joyory Morning & Night routine select ki hai!"
        ]
        return "\n".join(lines)

narrator_agent = NarratorAgent()
