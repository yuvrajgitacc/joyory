import sys
import json
from pathlib import Path
import asyncio
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from agents.orchestrator import orchestrator
from agents.vision_agent import vision_agent

images = [
    ("Image 1 (Forehead & Cheek Acne)", r"C:/Users/YUVRAJ/.gemini/antigravity/brain/7c00c356-c0cb-4f1e-89fa-7b46feb87f83/.user_uploaded/media_1789892225870.jpg"),
    ("Image 2 (Cheek Pigmentation / Melasma)", r"C:/Users/YUVRAJ/.gemini/antigravity/brain/7c00c356-c0cb-4f1e-89fa-7b46feb87f83/.user_uploaded/media_1789892286609.png"),
    ("Image 3 (Close-up Large Pores / Sebum)", r"C:/Users/YUVRAJ/.gemini/antigravity/brain/7c00c356-c0cb-4f1e-89fa-7b46feb87f83/.user_uploaded/media_1789892350477.png")
]

async def evaluate():
    for label, path in images:
        print("="*60)
        print(f"EVALUATING: {label}")
        print("="*60)
        try:
            with open(path, "rb") as f:
                img_bytes = f.read()

            result = await orchestrator.run(
                image_bytes=img_bytes,
                user_profile={"session_id": "test_eval", "budget": "all"}
            )
            v = result.get("vision", {})
            tone = v.get("skin_tone", {})
            signals = v.get("skin_signals", {})
            acne = v.get("blemish_assessment", {})
            recs = result.get("recommendations", {}).get("primary_bundle", [])
            narrative = result.get("narrator_description", "")

            print(f"Skin Profile: {v.get('skin_type')}")
            print(f"Skin Tone: {tone.get('fitzpatrick')} / Monk {tone.get('monk_scale')} (Hex: {tone.get('hex')})")
            print(f"Primary Concerns: {v.get('primary_concerns')}")
            print(f"Signals: Texture={signals.get('texture_score')}, Hydration={signals.get('hydration_score')}, Sun/Clarity={signals.get('sun_exposure_score')}, Firmness={signals.get('firmness_score')}")
            print(f"Acne Lesions: Total={acne.get('total_lesions')}, Comedones={acne.get('comedones')}, Papules={acne.get('papules')}, Severity={acne.get('severity')}")
            print(f"Bounding Boxes Count: {len(acne.get('bounding_boxes', []))}")
            for i, b in enumerate(acne.get('bounding_boxes', [])[:3]):
                print(f"  Box {i+1}: conf={b.get('conf')}, coords=({b.get('x')}, {b.get('y')}, {b.get('w')}, {b.get('h')})")
            print(f"\nGemini Narrative Description:")
            print(f"  \"{narrative}\"")
            print(f"\nRecommended Joyory Regimen ({len(recs)} steps):")
            for p in recs:
                print(f"  * [{p.get('routine_step')}] {p.get('brand')} - {p.get('name')} (Rs. {p.get('price')})")
                if p.get('grok_reason'):
                    print(f"    Reason: {p.get('grok_reason')[:120]}...")
            print("\n")
        except Exception as e:
            print(f"Error on {label}: {e}")

if __name__ == "__main__":
    asyncio.run(evaluate())
