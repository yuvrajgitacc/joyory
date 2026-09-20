import io
import json
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import numpy as np
from PIL import Image
from config import GEMINI_API_KEY


def check_ood_multispectral(pil_image: Image.Image) -> tuple[bool, str]:
    """
    Tier 1 Fast Local Multispectral & Biological Heuristics.
    Instantly filters foliage/plants, blue objects, flat screens, and non-skin subjects.
    """
    img_rgb = np.array(pil_image.convert("RGB"))
    h, w, _ = img_rgb.shape

    if h < 120 or w < 120:
        return False, "Image resolution too low for clinical skin analysis (minimum 120x120 required)."

    r = img_rgb[..., 0].astype(np.float32)
    g = img_rgb[..., 1].astype(np.float32)
    b = img_rgb[..., 2].astype(np.float32)

    total_pixels = float(h * w)

    # 1. Texture variance check (blank screens, plain paper, solid surfaces)
    std_color = float(np.std(img_rgb))
    if std_color < 12.0:
        return False, "Image lacks textural variation (uniform surface, paper, or screen detected)."

    # 2. Plant foliage & Chlorophyll check (detects leaves, crops, grass, vegetation)
    green_dom = (g >= r * 0.90) & (g > b * 1.10) & (g > 30)
    green_ratio = float(np.count_nonzero(green_dom)) / total_pixels
    if green_ratio > 0.12:
        return False, f"Out-of-Distribution: Plant foliage, leaf or vegetation detected ({green_ratio*100:.1f}% green leaf area). Please upload a human facial selfie."

    # 3. Non-biological cool blue/cyan check (sky, water, synthetic objects)
    blue_dom = (b > r * 1.10) & (b > g * 1.05) & (b > 60)
    blue_ratio = float(np.count_nonzero(blue_dom)) / total_pixels
    if blue_ratio > 0.25:
        return False, f"Out-of-Distribution: Non-biological cool blue tones detected ({blue_ratio*100:.1f}%). Please upload a skin photo."

    # 4. Biological human skin chrominance (R > G > B across all human skin types)
    bio_skin = (r > g) & (g > b) & ((r - g) >= 8) & ((g - b) >= 3)
    bio_ratio = float(np.count_nonzero(bio_skin)) / total_pixels

    # YCrCb strict digital dermatology locus
    y = 0.299 * r + 0.587 * g + 0.114 * b
    cr = (r - y) * 0.713 + 128.0
    cb = (b - y) * 0.564 + 128.0
    strict_skin = (cr >= 133) & (cr <= 178) & (cb >= 80) & (cb <= 132) & (y >= 45) & (r > g)
    strict_ratio = float(np.count_nonzero(strict_skin)) / total_pixels

    if strict_ratio < 0.35 and bio_ratio < 0.40:
        return False, f"Out-of-Distribution: No biological human skin detected (skin coverage is only {bio_ratio*100:.1f}%, minimum 40% required)."

    return True, "Passed Tier 1 heuristic"

def check_ood_semantic(pil_image: Image.Image) -> tuple[bool, str]:
    """
    Tier 2 Semantic AI Quality Inspector (Gemini 3.1 Flash Lite).
    Detects animals, food, documents, cartoons, furniture, or complex non-skin objects.
    """
    if not GEMINI_API_KEY:
        return True, "Semantic check skipped (no key)"

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=GEMINI_API_KEY)
        buf = io.BytesIO()
        pil_image.save(buf, format="JPEG")
        img_bytes = buf.getvalue()

        prompt = (
            "You are a strict Skincare Quality Inspector.\n"
            "Determine whether this image is a photo of real human skin (face, cheek, forehead, chin, nose, neck, or close-up human skin patch) OR if it is Out-of-Distribution (such as a plant, leaf, crop disease, animal, pet, food, inanimate object, car, document, illustration, or landscape).\n"
            "Respond ONLY with a JSON object: {\"is_human_skin\": true or false, \"detected_subject\": \"brief description of subject\", \"reason\": \"explanation\"}"
        )

        resp = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=[
                types.Part.from_bytes(data=img_bytes, mime_type="image/jpeg"),
                prompt
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1,
                max_output_tokens=300
            )
        )

        data = json.loads(resp.text)
        is_skin = data.get("is_human_skin", True)
        subject = data.get("detected_subject", "unknown object")
        reason = data.get("reason", "Non-skin subject detected.")

        if not is_skin:
            return False, f"Out-of-Distribution: {subject.title()} detected instead of human skin. Please upload a clear photo of your face or skin."

        return True, "Valid human skin"
    except Exception as e:
        # If API fails or times out, Tier 1 multispectral heuristics still protected the system
        return True, f"Semantic check bypassed: {e}"

def verify_ood(pil_image: Image.Image) -> tuple[bool, str]:
    # Tier 1: Fast local multispectral & biological skin check (zero cost, 2ms)
    t1_ok, t1_reason = check_ood_multispectral(pil_image)
    if not t1_ok:
        return False, t1_reason

    # Tier 2: Deep semantic AI check
    t2_ok, t2_reason = check_ood_semantic(pil_image)
    if not t2_ok:
        return False, t2_reason

    return True, "Valid facial skin image"

if __name__ == "__main__":
    test_leaf = r"C:/Users/YUVRAJ/.gemini/antigravity/brain/7c00c356-c0cb-4f1e-89fa-7b46feb87f83/.user_uploaded/media_1789897523572.jpg"
    test_skin = r"C:/Users/YUVRAJ/.gemini/antigravity/brain/7c00c356-c0cb-4f1e-89fa-7b46feb87f83/.user_uploaded/media_1789892225870.jpg"

    print("--- TESTING LEAF (CORN RUST PLANT DISEASE) ---")
    ok, reason = verify_ood(Image.open(test_leaf))
    print(f"Result -> Valid={ok}, Reason={reason}")

    print("\n--- TESTING REAL CLINICAL ACNE SKIN ---")
    ok, reason = verify_ood(Image.open(test_skin))
    print(f"Result -> Valid={ok}, Reason={reason}")
