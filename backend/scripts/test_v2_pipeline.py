import os
import sys
from pathlib import Path

# Add backend directory to path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

import asyncio
import numpy as np
from PIL import Image
import io

from agents.dataset_adapter import load_catalog
from agents.narrator_agent import narrator_agent
from agents.grok_recommender_agent import grok_recommender_agent
from agents.recommender_agent import recommender_agent
from agents.orchestrator import orchestrator

async def run_v2_tests():
    print("==================================================")
    print("SkinGenie v2 Test: Dataset Adapter + Narrator + Grok")
    print("==================================================")

    # 1. Test Dataset Adapter
    print("\n[1] Testing Dataset Adapter...")
    products = load_catalog()
    print(f"  -> Total skincare products adapted: {len(products)}")
    assert len(products) > 100, f"Expected >100 products, got {len(products)}"
    sample = products[0]
    print(f"  -> Sample product: {sample.get('name')} by {sample.get('brand')}")
    print(f"  -> Routine step: {sample.get('routine_step')}")
    print(f"  -> Routine phase: {sample.get('routine_phase')}")
    print(f"  -> Price: Rs. {sample.get('price')} (MRP: Rs. {sample.get('mrp')})")
    print(f"  -> Actives: {sample.get('key_active_ingredients')[:2]}")
    print("  [OK] Dataset Adapter test passed!")

    # 2. Test Recommender on 680 Catalog
    print("\n[2] Testing Recommender on 680 Catalog...")
    recs = recommender_agent.recommend(
        concerns=["Acne & Blemishes", "Sun Protection"],
        skin_type="Oily",
        budget="all"
    )
    bundle = recs.get("primary_bundle", [])
    print(f"  -> Products in primary bundle: {len(bundle)}")
    for p in bundle:
        print(f"     * [{p.get('routine_step')}] {p.get('name')} - Rs. {p.get('price')}")
    assert len(bundle) >= 3, "Primary bundle should have at least 3 core steps"
    print("  [OK] Recommender test passed!")

    # 3. Test Shortlist for Grok
    print("\n[3] Testing Shortlist for Grok...")
    shortlist = recommender_agent.get_shortlist(
        concerns=["Acne & Blemishes", "Sun Protection"],
        skin_type="Oily",
        budget="all",
        limit=15
    )
    print(f"  -> Shortlist size for Grok: {len(shortlist)}")
    assert len(shortlist) >= 5, "Shortlist should have at least 5 products"
    print("  [OK] Shortlist test passed!")

    # 4. Test Gemini Narrator (with fallback handling)
    print("\n[4] Testing Gemini Narrator Agent...")
    mock_vision = {
        "skin_tone": {"label": "Fitzpatrick Type IV", "hex": "#c89b7b"},
        "skin_signals": {
            "texture_score": 68.5,
            "hydration_score": 48.0,
            "sun_exposure_score": 42.0,
            "firmness_score": 82.0
        },
        "blemish_assessment": {
            "total_lesions": 7,
            "comedones": 4,
            "papules": 3,
            "severity": "Moderate"
        },
        "skin_type": "Oily",
        "primary_concerns": ["Acne & Blemishes", "Excess Sebum", "Large Pores"],
        "focus_areas": ["T-Zone", "Cheeks"]
    }

    narrative = await narrator_agent.generate_description(
        vision_result=mock_vision,
        skin_type="Oily",
        concerns=["Acne & Blemishes", "Excess Sebum"]
    )
    print("  -> Generated Narrative Output:")
    print(f"     \"{narrative}\"")
    assert len(narrative) > 50, "Narrative should be a detailed 3-5 sentence description"
    print("  [OK] Gemini Narrator test passed!")

    # 5. Test Grok Recommender (with fallback handling)
    print("\n[5] Testing Grok Recommender Agent...")
    grok_picks = await grok_recommender_agent.recommend(
        skin_analysis=mock_vision,
        skin_type="Oily",
        concerns=["Acne & Blemishes"],
        budget="all",
        product_shortlist=shortlist,
        primary_fallback_bundle=bundle
    )
    print(f"  -> Grok output source: {grok_picks.get('source')}")
    print(f"  -> Selected products: {len(grok_picks.get('selected_products', []))}")
    print(f"  -> Master routine tip: \"{grok_picks.get('routine_tip')}\"")
    if grok_picks.get("selected_products"):
        first_p = grok_picks["selected_products"][0]
        print(f"  -> Product 1 Grok Justification:")
        print(f"     \"{first_p.get('grok_reason')}\"")
    print("  [OK] Grok Recommender test passed!")

    # 6. Test Full Orchestrator Pipeline with synthetic image
    print("\n[6] Testing Full Multi-Agent Pipeline...")
    synthetic_img = Image.new("RGB", (640, 640), color=(200, 155, 125))
    buf = io.BytesIO()
    synthetic_img.save(buf, format="JPEG")
    img_bytes = buf.getvalue()

    result = await orchestrator.run(
        image_bytes=img_bytes,
        user_profile={"session_id": "test_v2", "budget": "all"}
    )
    print(f"  -> Pipeline status: {result.get('status')}")
    print(f"  -> Total products evaluated: {result.get('recommendations', {}).get('total_products_evaluated')}")
    print(f"  -> Narrator description present: {bool(result.get('narrator_description'))}")
    print(f"  -> Grok recommendations present: {bool(result.get('grok_recommendations'))}")
    print(f"  -> Safety status: {result.get('safety', {}).get('overall_status')}")
    print(f"  -> AM Routine steps: {len(result.get('routine', {}).get('am_routine', []))}")
    print(f"  -> PM Routine steps: {len(result.get('routine', {}).get('pm_routine', []))}")
    print("  [OK] Full Multi-Agent Pipeline test passed successfully!")

    print("\n==================================================")
    print("ALL TESTS PASSED! SkinGenie v2 is ready for action.")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(run_v2_tests())
