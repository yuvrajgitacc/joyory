import io
import json
import logging
from typing import Dict, Any, Optional
from config import GEMINI_API_KEY, GEMINI_MODEL_NAME

logger = logging.getLogger("narrator_agent")

NARRATOR_NORMAL_SYSTEM_PROMPT = """You are Joyory's expert personal beauty and skincare advisor.
In this Standard Neural Scan (Manual Scan) mode, our specialized on-device computer vision models have already completed the physical scan and detected all quantitative metrics (blemish count, micro-comedones, hydration index, texture, and tone). The user ALREADY sees all these numbers and badges on their screen in the UI metrics card.

YOUR STRICT ROLE IN MANUAL SCAN:
- DO NOT create any 'Kya Dikh Raha Hai' or scan observation section.
- DO NOT parrot or summarize the scan numbers as if you are observing them for the first time.
- Provide ONLY the essential advisory intelligence that the user actually needs:
  1. WHY their detected conditions happen (scientific root-cause explanation).
  2. Actionable REMEDIES (the exact type of moisturizer to use, key active ingredients, and care habits).

CRITICAL FORMATTING & LANGUAGE RULES:
- Strictly write in warm, natural, conversational Hinglish (Hindi written in English alphabets, just like how skincare experts converse in India, e.g., 'Aapki skin mein dehydration isliye hoti hai kyunki...', 'Sabse zaroori hai ek sahi moisturizer choose karna...'). Do NOT output pure English.
- DO NOT use robotic numbered template headings like '1. Disclaimer' or '2. Observation'.
- Structure your response cleanly using EXACTLY these 2 markdown headings:
  * **Yeh Kyun Hota Hai (Root Cause)**: Explain clearly why their detected concerns (e.g. moisture dehydration, pore congestion, sun dullness, or uneven texture) happen. Explain how barrier lipid deficiency, trans-epidermal water loss (TEWL), or sebum interacting with dead skin cells causes these symptoms.
  * **Remedies & Kya Karna Chahiye (Actionable Skincare Solutions)**: Give concrete, personalized solutions:
    - **Moisturizer & Barrier Care:** Clearly advise on the exact moisturizer type (e.g. lightweight Ceramide + Hyaluronic Acid moisturizer for barrier replenishment, gel-cream for oily skin, rich nourishing cream for dry skin).
    - **Targeted Active Ingredients:** Recommend specific actives matching their detected concerns (e.g., Niacinamide to soothe marks and strengthen barrier, Salicylic Acid (BHA) for pore congestion, broad-spectrum daily SPF).
    - **Daily Skincare Habits:** Gentle cleansing and daily routine discipline.
- End on a warm, encouraging closing sentence connecting directly to the personalized Joyory morning and night routine curated below!
"""

NARRATOR_ADVANCE_SYSTEM_PROMPT = """You are Joyory's expert personal beauty and skincare advisor.
In this Advance Multimodal Scan mode, you have direct visual access to the user's facial selfie photo alongside the neural telemetry.
Your job is to visually inspect what you see on their face, explain WHY it happens (root cause), and provide actionable REMEDIES (moisturizer, active ingredients, care habits).

CRITICAL FORMATTING & LANGUAGE RULES:
- Strictly write in natural, conversational Hinglish (Hindi written in English alphabets, e.g., 'Aapke selfie photo ko dhyan se dekhne par...', 'Yeh isliye hota hai kyunki...'). Do NOT output pure English.
- DO NOT use robotic numbered template headings.
- Structure your response cleanly using EXACTLY these 3 markdown headings:
  * **Kya Dikh Raha Hai (Scan Observations):** Provide a grounded visual description of what you observe in the photo (facial areas, visible clarity, texture, spots, glow).
  * **Yeh Kyun Hota Hai (Root Cause):** Explain the biological and environmental root causes (barrier dehydration, sebum balance, sun exposure).
  * **Remedies & Kya Karna Chahiye (Actionable Skincare Solutions):** Recommend specific moisturizer formulations, active ingredients (Ceramides, Hyaluronic acid, Niacinamide, Salicylic acid), and daily SPF.
- End on a warm, empowering closing sentence connecting directly to the personalized Joyory morning and night routine curated below!
"""

class NarratorAgent:
    """
    Gemini-Powered Natural Language Skincare Advisor.
    Translates raw neural network measurements (ONNX blemish counts, skin signals, tone)
    into an empathetic, actionable consultation:
    - Standard/Manual scan: Focuses purely on Root Cause and Actionable Remedies (Moisturizer, Actives).
    - Advance multimodal scan: Full visual observations + Root Cause + Remedies.
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
        - scan_mode == 'normal': Gemini receives model telemetry only; outputs Root Cause & Remedies.
        - scan_mode == 'advance': Gemini receives image bytes + telemetry; outputs Visual Scan + Root Cause + Remedies.
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
                texture=texture_score,
                scan_mode=scan_mode
            )

        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=GEMINI_API_KEY)

            if scan_mode == "advance" and image_bytes:
                # Advance multimodal mode: Gemini visually scans the photo
                system_prompt = NARRATOR_ADVANCE_SYSTEM_PROMPT
                user_prompt = f"""
Advance Multimodal Skin Inspection:
- User Profile: {user_skin_type} skin, primary concerns: {', '.join(user_concerns)}
- Quantitative Neural Signals:
  * Texture Smoothness: {texture_score}/100
  * Moisture Hydration Index: {hydration_score}/100
  * Sun Clarity Index: {sun_score}/100
  * Elasticity Tension: {firmness_score}/100
- Detected Blemish Assessment:
  * Total Active Spots: {total_lesions}
  * Micro-comedones (clogged pores): {comedones}
  * Surface Papules (active bumps): {papules}
  * Severity: {severity}
- Tone: {skin_tone.get('label', 'Warm Tone')} (Hex: {skin_tone.get('hex', '#d2a07c')})

Visually examine this facial selfie alongside the telemetry and write the consultation in natural conversational Hinglish using the 3 sections:
**Kya Dikh Raha Hai (Scan Observations)**
**Yeh Kyun Hota Hai (Root Cause)**
**Remedies & Kya Karna Chahiye (Actionable Skincare Solutions)**
Detail visual characteristics, why this happens, the right moisturizer and active ingredients, and connect to the Joyory routine below.
"""
                contents = [
                    types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                    user_prompt
                ]
            else:
                # Standard / Manual scan mode: Models have already scanned. Gemini provides Root Cause & Remedies.
                system_prompt = NARRATOR_NORMAL_SYSTEM_PROMPT
                user_prompt = f"""
Diagnostic Telemetry from Completed Model Scan:
- User Profile: {user_skin_type} skin
- Detected Concerns: {', '.join(user_concerns)}
- Quantitative Signals:
  * Moisture Hydration Index: {hydration_score}/100 ({"Dehydrated barrier" if hydration_score < 55 else "Adequate moisture"})
  * Texture Smoothness: {texture_score}/100 ({"Uneven surface texture" if texture_score < 60 else "Smooth texture"})
  * Sun Clarity Index: {sun_score}/100 ({"Needs sun protection & brightening" if sun_score < 50 else "Good clarity"})
  * Elasticity Tension: {firmness_score}/100
- Blemish Assessment:
  * Total Active Spots: {total_lesions} (Comedones: {comedones}, Papules: {papules}, Severity: {severity})
- Skin Tone: {skin_tone.get('label', 'Warm Tone')}

CRITICAL INSTRUCTION FOR STANDARD SCAN:
The user already sees all these scan numbers and blemish counts on their screen in the metrics cards. DO NOT create any 'Kya Dikh Raha Hai' observation section.
Provide ONLY the required actionable intelligence in natural conversational Hinglish using EXACTLY these 2 sections:
**Yeh Kyun Hota Hai (Root Cause)**
Explain the exact biological reason for these findings (e.g. why their hydration is at {hydration_score}/100, why sebum/oil is reacting, barrier status).

**Remedies & Kya Karna Chahiye (Actionable Skincare Solutions)**
Give concrete solutions:
1. Exact type of moisturizer needed (barrier repair, ceramides, hyaluronic acid, gel vs cream texture).
2. Key active ingredients to treat their concerns (Niacinamide, Salicylic Acid, Sunscreen SPF, etc.).
3. Daily application habits and connect to the personalized Joyory routine below.
"""
                contents = [user_prompt]

            response = client.models.generate_content(
                model=self.model_name,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
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
            texture=texture_score,
            scan_mode=scan_mode
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
        scan_mode: str = "normal"
    ) -> str:
        """
        Actionable conversational fallback.
        - In manual/normal mode: omits redundant observation block and focuses on Root Cause & Remedies.
        - In advance mode: includes visual observation block.
        """
        if scan_mode == "advance":
            lines = [
                "Hello! Main hoon aapki Joyory personal skincare advisor.\n",
                "**Kya Dikh Raha Hai (Scan Observations)**",
                f"Aapke visual scan mein lagbhag {total_lesions} active blemish spots detect hue hain ({comedones} micro-comedones aur {papules} active bumps). Aapka hydration score {int(hydration)}/100 hai, jo dikhata hai ki moisture barrier thirsty hai, aur texture score {int(texture)}/100 par calibrated hai.\n",
                "**Yeh Kyun Hota Hai (Root Cause)**",
                "Jab skin ka moisture barrier dehydrated hota hai, toh skin dryness se ladne ke liye extra sebum (oil) produce karne lagti hai. Yeh excess oil jab dead cells ke saath milta hai, toh pores clog ho jaate hain aur bumps banne lagte hain. Isliye skin ko aggressively dry karne ke bajaye balanced hydration dena zaroori hai.\n",
                "**Remedies & Kya Karna Chahiye (Actionable Skincare Solutions)**",
                "• **Pore Cleansing:** Salicylic Acid (BHA) cleanser use karein jo pores ke andar jakar excess sebum dissolve kare.",
                "• **Hydration & Barrier Healing:** Lightweight, non-comedogenic Ceramide & Hyaluronic Acid moisturizer zaroor lagayein jo skin barrier ko replenish kare.",
                "• **Calming Marks:** Niacinamide serum active bumps ko soothe karega aur purane marks ko fade karega.",
                "• **Daily Sunscreen:** Broad-spectrum SPF daily lagayein taaki spots dark na hon.\n",
                "Aapke isi scan ke basis par neeche humne complete Joyory Morning & Night routine select ki hai!"
            ]
        else:
            lines = [
                "Hello! Main hoon aapki Joyory personal skincare advisor.\n",
                "**Yeh Kyun Hota Hai (Root Cause)**",
                f"Aapki {skin_type.lower()} skin mein jo moisture level ({int(hydration)}/100) aur blemish tendency dikh rahi hai, uska mukhya kaaran skin ka compromised moisture barrier ho sakta hai. Jab barrier weak hota hai, toh moisture jaldi evaporate ho jaata hai aur skin dryness compensate karne ke liye extra oil banati hai. Yeh oil aur dead skin cells milkar pores ko congest karte hain, jisse texture uneven feel hota hai.\n",
                "**Remedies & Kya Karna Chahiye (Actionable Skincare Solutions)**",
                "• **Barrier Replenishment Moisturizer:** Ek lightweight Ceramide aur Hyaluronic Acid-based moisturizer use karein jo skin barrier ko lock kare bina pores clog kiye.",
                "• **Targeted Active Serums:** Niacinamide serum add karein jo skin barrier ko strengthen karta hai, inflammation calm karta hai aur skin texture ko refine karta hai.",
                "• **Gentle BHA Exfoliation:** Agar pores clogged hain, toh hafte mein 2-3 baar gentle Salicylic Acid use karein.",
                "• **Daily Sun Protection:** Broad-spectrum gel/matte SPF 50 lagana zaroori hai taaki UV damage se skin dull na ho.\n",
                "Neeche humne aapke model diagnostic ke basis par complete personalized Joyory routine curate ki hai—ise follow karein aur aapki skin jald healthy aur radiant feel karegi!"
            ]
        return "\n".join(lines)

narrator_agent = NarratorAgent()
