import os
from pathlib import Path
import urllib.request

MODELS_DIR = Path(__file__).resolve().parent.parent / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

HF_BASE = "https://huggingface.co/mufasabrownie/glowlytics-skin-models/resolve/main"

# NOTE (ML audit): upstream skin_signals.onnx references an external
# "skin_signals.onnx.data" file that is NOT published on the Hub, so the
# committed copy cannot load in onnxruntime. The vision pipeline detects
# this and falls back to heuristics. Do not add .data entries here (404).
FILES = [
    ("skin_signals.onnx", f"{HF_BASE}/skin_signals.onnx"),
    ("acne_detector.onnx", f"{HF_BASE}/acne_detector.onnx"),
]

def download_models():
    for fname, url in FILES:
        dest = MODELS_DIR / fname
        if dest.exists() and dest.stat().st_size > 1000:
            print(f"[OK] {fname} already downloaded ({dest.stat().st_size // 1024} KB)")
            continue
        print(f"Downloading {fname} from {url}...")
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "Mozilla/5.0"}
            )
            with urllib.request.urlopen(req, timeout=60) as resp, open(dest, "wb") as f:
                f.write(resp.read())
            print(f"[OK] Successfully saved {fname} ({dest.stat().st_size // 1024} KB)")
        except Exception as e:
            print(f"[NOTE] {fname} not found or skipped: {e}")

if __name__ == "__main__":
    download_models()
    # Loadability check (ML audit): report which models actually work.
    try:
        import onnxruntime as ort

        for fname in ("skin_signals.onnx", "acne_detector.onnx"):
            path = MODELS_DIR / fname
            try:
                ort.InferenceSession(str(path), providers=["CPUExecutionProvider"])
                print(f"[OK] {fname} loads in onnxruntime")
            except Exception as e:
                print(f"[WARN] {fname} present but unloadable: {e}")
    except ImportError:
        print("[NOTE] onnxruntime not installed; skipping loadability check.")
