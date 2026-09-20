import sys
import json
from pathlib import Path
import asyncio
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from agents.orchestrator import orchestrator

async def run_test():
    img_path = r"C:/Users/YUVRAJ/.gemini/antigravity/brain/7c00c356-c0cb-4f1e-89fa-7b46feb87f83/.user_uploaded/media_1789888949897.png"
    with open(img_path, "rb") as f:
        img_bytes = f.read()

    user_profile = {
        "session_id": "test_user_acne_eval",
        "budget": "all",
        "skin_type": None
    }

    result = await orchestrator.run(image_bytes=img_bytes, user_profile=user_profile)
    print("=== TEST RESULTS FOR USER IMAGE ===")
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    asyncio.run(run_test())
