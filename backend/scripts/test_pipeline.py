import io
import sys
from pathlib import Path
import asyncio
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from agents.orchestrator import orchestrator

async def main():
    print("Testing SkinGenie Multi-Agent Pipeline...")
    # Create synthetic test portrait image (300x300 warm peach tone)
    img = Image.new("RGB", (300, 300), color=(210, 160, 124))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    img_bytes = buf.getvalue()

    user_profile = {
        "session_id": "test_pitch_session",
        "budget": "all",
        "skin_type": None
    }

    result = await orchestrator.run(image_bytes=img_bytes, user_profile=user_profile)
    print("\n--- PIPELINE EXECUTION SUCCESS ---")
    print(f"Status: {result.get('status')}")
    print(f"Detected Skin Type: {result['vision'].get('skin_type')}")
    print(f"Skin Tone: {result['vision']['skin_tone']}")
    print(f"Skin Signals: {result['vision']['skin_signals']}")
    print(f"Active Concerns: {result['vision']['primary_concerns']}")
    print(f"Safety Overall Status: {result['safety']['overall_status']}")
    print(f"AM Steps Count: {len(result['routine']['am_routine'])}")
    print(f"PM Steps Count: {len(result['routine']['pm_routine'])}")
    print(f"Primary Products Picked: {len(result['recommendations']['primary_bundle'])}")
    for p in result['recommendations']['primary_bundle']:
        print(f"  - [{p['routine_step']}] {p['brand']} - {p['name']} (Score: {p['relevance_score']})")
    print(f"Total Bundle Price: Rs. {result['recommendations']['bundle_pricing']['sale_total']}")
    print(f"Replenishment Items Scheduled: {len(result['replenishment']['schedule'])}")
    print(f"Progress Scan Count: {result['progress']['scan_count']}")

if __name__ == "__main__":
    asyncio.run(main())
