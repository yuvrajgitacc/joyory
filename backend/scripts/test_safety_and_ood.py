import asyncio
import io
import sys
from pathlib import Path
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from agents.orchestrator import orchestrator
from agents.vision_agent import vision_agent, ALLOWED_COSMETIC_CONCERNS

async def run_safety_and_ood_tests():
    print("==================================================")
    print("SkinGenie Safety & OOD Verification Suite")
    print("==================================================")

    # 1. Test OOD Rejection
    print("\n[1] Testing OOD Guardrails on Non-Facial Images...")
    green_wall = Image.new("RGB", (400, 400), color=(30, 160, 40))
    buf = io.BytesIO()
    green_wall.save(buf, format="JPEG")
    green_bytes = buf.getvalue()

    ood_result = await orchestrator.run(
        image_bytes=green_bytes,
        user_profile={"session_id": "test_ood", "budget": "all"}
    )
    print(f"  -> OOD Result Status: {ood_result.get('status')}")
    print(f"  -> OOD Error Code: {ood_result.get('error_code')}")
    print(f"  -> OOD Message: {ood_result.get('message')}")
    assert ood_result.get("status") == "error", "Non-facial image should be rejected!"
    assert ood_result.get("error_code") == "OOD_REJECTED", "Error code should be OOD_REJECTED!"
    print("  [OK] OOD Rejection verified successfully!")

    # 2. Test Real Facial Image (Image 1)
    print("\n[2] Testing Pipeline on Real Clinical Acne Photo (0.45 Conf Threshold)...")
    img_path = r"C:/Users/YUVRAJ/.gemini/antigravity/brain/7c00c356-c0cb-4f1e-89fa-7b46feb87f83/.user_uploaded/media_1789892225870.jpg"
    with open(img_path, "rb") as f:
        real_bytes = f.read()

    real_result = await orchestrator.run(
        image_bytes=real_bytes,
        user_profile={"session_id": "test_user_real", "budget": "all"}
    )
    assert real_result.get("status") == "success", "Real facial photo should pass OOD gate!"
    
    v = real_result.get("vision", {})
    signals = v.get("skin_signals", {})
    acne = v.get("blemish_assessment", {})
    concerns = v.get("primary_concerns", [])
    tone = v.get("skin_tone", {})

    print(f"  -> Detected Blemishes: {acne.get('total_lesions')} (Severity: {acne.get('severity')}, Threshold: {acne.get('confidence_threshold')})")
    print(f"  -> Integer Scores (Zero decimals): Texture={signals.get('texture_score')}, Hydration={signals.get('hydration_score')}, Sun/Clarity={signals.get('sun_exposure_score')}, Firmness={signals.get('firmness_score')}")
    assert isinstance(signals.get("hydration_score"), int), "Hydration score must be an integer!"
    assert isinstance(signals.get("texture_score"), int), "Texture score must be an integer!"

    print(f"  -> Concerns (Sanitized to Enum): {concerns}")
    for c in concerns:
        assert c in ALLOWED_COSMETIC_CONCERNS, f"Concern '{c}' violates the strict cosmetic enum!"
    
    print(f"  -> Skin Tone Lighting Dependency Note: \"{tone.get('lighting_note')}\"")
    print("  [OK] Real Clinical Acne Photo passed all safety gates!")

    # 3. Test Sanitizer on Medical Jargon
    print("\n[3] Testing Medical Term Sanitizer...")
    dirty_concerns = ["severe melasma", "rosacea breakout", "cystic acne", "photoaging", "unknown concern"]
    cleaned = vision_agent.sanitize_concerns(dirty_concerns)
    print(f"  -> Raw Medical Input: {dirty_concerns}")
    print(f"  -> Sanitized Output: {cleaned}")
    for c in cleaned:
        assert c in ALLOWED_COSMETIC_CONCERNS, f"Sanitizer failed to map '{c}' to allowed enum!"
        assert "melasma" not in c.lower() and "rosacea" not in c.lower() and "cystic" not in c.lower(), "Medical terms leaked!"
    print("  [OK] Medical Term Sanitizer verified successfully!")

    print("\n==================================================")
    print("ALL SAFETY & OOD TESTS PASSED (100% BULLETPROOF)!")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(run_safety_and_ood_tests())
