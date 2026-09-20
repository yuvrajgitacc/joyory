import os
from pathlib import Path
import urllib.request

MODELS_DIR = Path(__file__).resolve().parent.parent / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

HF_BASE = "https://huggingface.co/mufasabrownie/glowlytics-skin-models/resolve/main"

FILES = [
    ("skin_signals.onnx", f"{HF_BASE}/skin_signals.onnx"),
    ("skin_signals.onnx.data", f"{HF_BASE}/skin_signals.onnx.data"),
    ("acne_detector.onnx", f"{HF_BASE}/acne_detector.onnx"),
    ("acne_detector.onnx.data", f"{HF_BASE}/acne_detector.onnx.data")
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
