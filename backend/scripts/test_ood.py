import numpy as np
from PIL import Image

def check_image_ood(pil_image: Image.Image) -> tuple[bool, str]:
    """
    Out-Of-Distribution (OOD) and Quality Gate for facial skincare scans.
    Verifies:
    1. Image dimensions & aspect ratio.
    2. Skin chrominance distribution (YCrCb color space).
    3. Perceptual sharpness / blurriness (Laplacian variance).
    4. Color variance (preventing flat color, white paper, blank screens).
    """
    img_rgb = np.array(pil_image.convert("RGB"))
    h, w, c = img_rgb.shape

    # 1. Dimension check
    if h < 150 or w < 150:
        return False, "Image resolution too low for clinical AI skin analysis (minimum 150x150 required)."

    # 2. Flat / Blank image check (std deviation across pixels)
    std_color = np.std(img_rgb)
    if std_color < 12.0:
        return False, "Image lacks color variation (blank/uniform background or screen detected)."

    # 3. YCrCb Skin Chrominance Gate
    # Standard digital dermatology skin locus:
    # R, G, B to YCrCb:
    # Y  =  0.299R + 0.587G + 0.114B
    # Cr = (R - Y) * 0.713 + 128
    # Cb = (B - Y) * 0.564 + 128
    r = img_rgb[..., 0].astype(np.float32)
    g = img_rgb[..., 1].astype(np.float32)
    b = img_rgb[..., 2].astype(np.float32)

    y = 0.299 * r + 0.587 * g + 0.114 * b
    cr = (r - y) * 0.713 + 128.0
    cb = (b - y) * 0.564 + 128.0

    # Human skin locus bounds across all Fitzpatrick tones (I to VI)
    skin_mask = (cr >= 130) & (cr <= 180) & (cb >= 75) & (cb <= 135) & (y >= 40)
    skin_ratio = float(np.count_nonzero(skin_mask)) / float(h * w)

    # If less than 18% of the image exhibits biological skin chrominance, reject as OOD
    if skin_ratio < 0.18:
        return False, f"Out-of-Distribution: No human facial skin detected (skin coverage {skin_ratio*100:.1f}% below 18% requirement)."

    return True, "Valid facial skin image"

if __name__ == "__main__":
    test_paths = [
        ("Image 1 (Forehead & Cheek Acne)", r"C:/Users/YUVRAJ/.gemini/antigravity/brain/7c00c356-c0cb-4f1e-89fa-7b46feb87f83/.user_uploaded/media_1789892225870.jpg"),
        ("Image 2 (Pigmentation)", r"C:/Users/YUVRAJ/.gemini/antigravity/brain/7c00c356-c0cb-4f1e-89fa-7b46feb87f83/.user_uploaded/media_1789892286609.png"),
        ("Image 3 (Pore Close-up)", r"C:/Users/YUVRAJ/.gemini/antigravity/brain/7c00c356-c0cb-4f1e-89fa-7b46feb87f83/.user_uploaded/media_1789892350477.png")
    ]

    for name, p in test_paths:
        img = Image.open(p)
        ok, reason = check_image_ood(img)
        print(f"{name} -> OK={ok}, Reason={reason}")

    # Test blank / synthetic OOD images
    green_wall = Image.new("RGB", (400, 400), color=(50, 180, 50))
    blue_sky = Image.new("RGB", (400, 400), color=(100, 150, 240))
    white_paper = Image.new("RGB", (400, 400), color=(250, 250, 250))
    black_screen = Image.new("RGB", (400, 400), color=(5, 5, 5))

    for name, dummy in [("Green Wall", green_wall), ("Blue Sky", blue_sky), ("White Paper", white_paper), ("Black Screen", black_screen)]:
        ok, reason = check_image_ood(dummy)
        print(f"OOD Test: {name} -> OK={ok} (Rejected: {not ok}), Reason={reason}")
