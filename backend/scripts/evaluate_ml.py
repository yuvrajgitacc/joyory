"""Local ML audit harness (no API keys, no network required).

Runs the vision pipeline's deterministic parts on synthetic images and
reports model health + behavior:

- ONNX load status (signals / acne)
- OOD gate accept/reject on skin-like vs blank/tiny/off-skin images
- Tone v1 vs tone v2 on a synthetic skin swatch
- Acne inference latency, lesion count, and the threshold actually used
- Signals source (ONNX vs heuristic fallback) and score ranges
- Derm agent gate status (must be disabled by default)
- Sanitizer spot-check for medical-term mapping

Usage (from repo root, uv-managed Python 3.11):
    uv run python backend/scripts/evaluate_ml.py [--out backend/eval_reports/ml_eval_report.json]
"""

import argparse
import io
import json
import sys
import time
from pathlib import Path

import numpy as np
from PIL import Image

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from agents.vision_agent import (  # noqa: E402
    ACNE_CONF_THRESHOLD,
    ACNE_NMS_IOU,
    SIGNALS_MEAN,
    SIGNALS_STD,
    vision_agent,
)
from agents.derm_agent import derm_agent  # noqa: E402
import asyncio  # noqa: E402


def skin_swatch(size: int = 400, seed: int = 7) -> Image.Image:
    rng = np.random.default_rng(seed)
    base = np.full((size, size, 3), (198, 152, 122), dtype=np.float32)
    base += rng.normal(0, 9, base.shape)  # natural texture variation
    return Image.fromarray(np.clip(base, 0, 255).astype(np.uint8), "RGB")


def blank(size: int = 400) -> Image.Image:
    return Image.new("RGB", (size, size), color=(255, 255, 255))


def blue_noise(size: int = 400, seed: int = 3) -> Image.Image:
    rng = np.random.default_rng(seed)
    arr = np.zeros((size, size, 3), dtype=np.uint8)
    arr[..., 2] = rng.integers(120, 255, (size, size), dtype=np.uint8)
    arr[..., 0] = rng.integers(0, 60, (size, size), dtype=np.uint8)
    arr[..., 1] = rng.integers(0, 80, (size, size), dtype=np.uint8)
    return Image.fromarray(arr, "RGB")


def main() -> dict:
    report: dict = {
        "models": {
            "signals_onnx_loaded": vision_agent.signals_session is not None,
            "acne_onnx_loaded": vision_agent.acne_session is not None,
            "acne_conf_threshold": ACNE_CONF_THRESHOLD,
            "acne_nms_iou": ACNE_NMS_IOU,
            "signals_imagenet_mean": [float(x) for x in SIGNALS_MEAN],
            "signals_imagenet_std": [float(x) for x in SIGNALS_STD],
        },
        "ood": {},
        "tone": {},
        "acne": {},
        "signals": {},
        "derm": {},
        "sanitizer": {},
    }

    # OOD gate -----------------------------------------------------------
    for name, img in {
        "skin_swatch": skin_swatch(),
        "blank_white": blank(),
        "tiny_50px": Image.new("RGB", (50, 50), color=(198, 152, 122)),
        "blue_noise": blue_noise(),
    }.items():
        ok, reason = vision_agent.check_ood(img, skip_tier2=True)
        report["ood"][name] = {"accepted": ok, "reason": reason}

    # Tone v1 vs v2 ------------------------------------------------------
    swatch = skin_swatch()
    v1 = vision_agent.extract_skin_tone(swatch)
    v2 = vision_agent.extract_skin_tone_v2(swatch)
    report["tone"] = {"v1": v1, "v2": v2}

    # Acne detector ------------------------------------------------------
    t0 = time.perf_counter()
    acne = vision_agent.detect_acne_lesions(swatch)
    dt = time.perf_counter() - t0
    report["acne"] = {
        **acne,
        "latency_s": round(dt, 3),
        "threshold_matches_constant": acne.get("confidence_threshold")
        == ACNE_CONF_THRESHOLD,
    }

    # Skin signals -------------------------------------------------------
    signals = vision_agent.compute_skin_signals(swatch)
    report["signals"] = {
        **signals,
        "source": "onnx"
        if vision_agent.signals_session is not None
        else "heuristic_fallback",
        "all_in_0_100": all(
            isinstance(signals[k], int) and 0 <= signals[k] <= 100
            for k in (
                "texture_score",
                "hydration_score",
                "sun_exposure_score",
                "firmness_score",
            )
        ),
    }

    # Derm gate (must stay OFF by default) -------------------------------
    buf = io.BytesIO()
    swatch.save(buf, format="JPEG")
    derm = asyncio.run(derm_agent.assess(buf.getvalue()))
    report["derm"] = derm

    # Sanitizer spot-check ----------------------------------------------
    report["sanitizer"] = {
        "in": ["melasma", "rosacea", "Acne & Blemishes", "mystery term"],
        "out": vision_agent.sanitize_concerns(
            ["melasma", "rosacea", "Acne & Blemishes", "mystery term"]
        ),
    }
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--out", default=str(BASE_DIR / "eval_reports" / "ml_eval_report.json")
    )
    args = parser.parse_args()
    rep = main()
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(rep, indent=2), encoding="utf-8")
    print(json.dumps(rep, indent=2))
    print(f"\nSaved to {out}")
