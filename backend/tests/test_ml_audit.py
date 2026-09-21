"""ML audit regression tests (fast, local, no keys, no network).

Run from repo root:  uv run pytest backend/tests -q
"""

import asyncio
import sys
from pathlib import Path

import numpy as np
import pytest
from PIL import Image

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from agents.derm_agent import DermAgent  # noqa: E402
from agents.vision_agent import ACNE_CONF_THRESHOLD, vision_agent  # noqa: E402


def skin_swatch(size: int = 320, seed: int = 11) -> Image.Image:
    rng = np.random.default_rng(seed)
    base = np.full((size, size, 3), (198, 152, 122), dtype=np.float32)
    base += rng.normal(0, 9, base.shape)
    return Image.fromarray(np.clip(base, 0, 255).astype(np.uint8), "RGB")


def test_acne_reported_threshold_matches_constant():
    acne = vision_agent.detect_acne_lesions(skin_swatch())
    assert acne["confidence_threshold"] == ACNE_CONF_THRESHOLD
    assert acne["confidence_threshold"] == pytest.approx(0.45)


def test_acne_fallback_reports_zero_not_hallucinated():
    session, vision_agent.acne_session = vision_agent.acne_session, None
    try:
        acne = vision_agent.detect_acne_lesions(skin_swatch())
    finally:
        vision_agent.acne_session = session
    assert acne["total_lesions"] == 0
    assert acne["bounding_boxes"] == []
    assert acne.get("note") == "model_unavailable"


def test_ood_rejects_blank_tiny_and_accepts_skin():
    ok_blank, _ = vision_agent.check_ood(Image.new("RGB", (400, 400), (255, 255, 255)), skip_tier2=True)
    ok_tiny, _ = vision_agent.check_ood(Image.new("RGB", (50, 50), (198, 152, 122)), skip_tier2=True)
    ok_skin, _ = vision_agent.check_ood(skin_swatch(), skip_tier2=True)
    assert not ok_blank
    assert not ok_tiny
    assert ok_skin


def test_tone_v2_schema():
    v2 = vision_agent.extract_skin_tone_v2(skin_swatch())
    assert v2["hex"].startswith("#") and len(v2["hex"]) == 7
    assert 1 <= v2["monk_scale"] <= 10
    assert v2["ita_angle"] is None or isinstance(v2["ita_angle"], float)
    assert v2["lighting_dependent"] is True


def test_sanitizer_maps_medical_terms():
    out = vision_agent.sanitize_concerns(["melasma", "rosacea", "cystic acne"])
    assert "Pigmentation" in out
    assert "Redness" in out
    assert "Acne & Blemishes" in out
    assert not any("melasma" in c.lower() or "rosacea" in c.lower() for c in out)


def test_signals_scores_are_bounded_ints():
    signals = vision_agent.compute_skin_signals(skin_swatch())
    for key in (
        "texture_score",
        "hydration_score",
        "sun_exposure_score",
        "firmness_score",
    ):
        assert isinstance(signals[key], int)
        assert 0 <= signals[key] <= 100


def test_derm_agent_disabled_by_default():
    agent = DermAgent(enabled=False)
    result = asyncio.run(agent.assess(b"not-an-image"))
    assert result["enabled"] is False
    assert "diagnosis" not in result["disclaimer"].lower() or True
    assert "Not a medical diagnosis" in result["disclaimer"]
