import os
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_IMG_DIR = BASE_DIR / "static" / "product_images"
PRODUCTS_FILE = BASE_DIR / "data" / "joyory_products.json"

STATIC_IMG_DIR.mkdir(parents=True, exist_ok=True)

# Brand color mapping for luxury skincare aesthetic
BRAND_COLORS = {
    "Aqualogica": ((224, 242, 254), (14, 165, 233)),      # Light sky blue
    "Minimalist": ((241, 245, 249), (15, 23, 42)),        # Minimalist white/slate
    "Plum": ((240, 253, 244), (22, 101, 52)),             # Green tea emerald
    "The Derma Co": ((254, 242, 242), (225, 29, 72)),     # Clinical rose
    "Dot & Key": ((254, 243, 199), (217, 119, 6)),        # Citrus gold
    "Foxtale": ((253, 244, 255), (192, 38, 211)),         # Fuchsia lavender
    "Dr. Sheth's": ((255, 247, 237), (194, 65, 12)),      # Terracotta apricot
    "Swiss Beauty": ((254, 249, 195), (161, 98, 7)),      # 24k Champagne gold
    "Hyphen": ((248, 250, 252), (51, 65, 85)),            # Clean slate
    "Pilgrim": ((243, 232, 255), (126, 34, 206))          # Mystic grape
}

def generate_product_image(filename: str, brand: str, name: str, category: str):
    target_path = STATIC_IMG_DIR / filename
    if target_path.exists():
        return

    # 600x600 canvas
    width, height = 600, 600
    bg_color, accent_color = BRAND_COLORS.get(brand, ((245, 245, 245), (70, 70, 70)))

    img = Image.new("RGB", (width, height), color=bg_color)
    draw = ImageDraw.Draw(img)

    # Gradient circle backdrop
    margin = 40
    draw.ellipse([margin, margin, width - margin, height - margin], outline=accent_color, width=4)
    draw.ellipse([margin + 20, margin + 20, width - margin - 20, height - margin - 20], fill=(255, 255, 255))

    # Bottle silhouette
    bottle_w, bottle_h = 160, 260
    bx0 = (width - bottle_w) // 2
    by0 = (height - bottle_h) // 2 - 20

    # Bottle body
    draw.rounded_rectangle([bx0, by0 + 40, bx0 + bottle_w, by0 + bottle_h], radius=16, fill=bg_color, outline=accent_color, width=3)
    # Bottle neck & pump
    draw.rectangle([bx0 + 45, by0 + 10, bx0 + bottle_w - 45, by0 + 40], fill=accent_color)
    draw.rectangle([bx0 + 60, by0 - 10, bx0 + bottle_w - 60, by0 + 10], fill=(100, 116, 139))

    # Labels
    # Brand title
    draw.text((bx0 + 15, by0 + 70), brand.upper(), fill=accent_color)
    # Category tag
    draw.text((bx0 + 15, by0 + 95), category.upper(), fill=(148, 163, 184))

    # Bottom banner card
    draw.rectangle([0, 500, 600, 600], fill=(15, 23, 42))
    # Brand and truncated name
    display_name = (name[:32] + "..") if len(name) > 32 else name
    draw.text((30, 520), brand.upper(), fill=accent_color)
    draw.text((30, 550), display_name, fill=(255, 255, 255))

    img.save(target_path, "JPEG", quality=90)
    print(f"Generated aesthetic asset: {filename}")

def main():
    if not PRODUCTS_FILE.exists():
        print("Products file not found.")
        return

    with open(PRODUCTS_FILE, "r", encoding="utf-8") as f:
        products = json.load(f)

    for p in products:
        img_path = p.get("image_path", "")
        if img_path:
            fname = Path(img_path).name
            generate_product_image(
                filename=fname,
                brand=p.get("brand", "Joyory"),
                name=p.get("name", "Skincare Item"),
                category=p.get("subcategory", "Care")
            )
    print("All product assets prepared locally.")

if __name__ == "__main__":
    main()
