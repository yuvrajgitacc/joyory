import json
import logging
import re
from pathlib import Path
from typing import List, Dict, Any, Optional

from config import DATASET_FILE, PRODUCTS_FILE

logger = logging.getLogger("dataset_adapter")

# Active ingredient purpose dictionary for meaningful display & explainability
ACTIVE_PURPOSES = {
    "salicylic acid": "Deep pore exfoliation & blemish clearance",
    "bha": "Pore unclogging & blackhead reduction",
    "niacinamide": "Barrier restoration, tone evening & sebum regulation",
    "hyaluronic acid": "Multi-molecular surface & deep dermal hydration",
    "vitamin c": "Antioxidant defense & post-blemish pigmentation brightening",
    "retinol": "Accelerated cellular renewal & texture refinement",
    "bakuchiol": "Gentle plant-derived collagen renewal alternative",
    "ceramides": "Lipid moisture seal & barrier repair",
    "centella asiatica": "Rapid soothing of visible redness & skin irritation",
    "cica": "Rapid soothing of visible redness & skin irritation",
    "azelaic acid": "Targeted redness control & post-inflammatory clarity",
    "glycolic acid": "Gentle surface dead-cell lifting for renewed glow",
    "aha": "Gentle dead-cell exfoliation for luminous radiance",
    "lactic acid": "Gentle moisture-retaining chemical exfoliation",
    "green tea": "Antioxidant calm & sebum balancing",
    "squalane": "Non-comedogenic weightless moisture locking",
    "peptides": "Visible epidermal bounce & firmness support",
    "zinc pca": "Sebum moderation & microflora balancing",
    "tea tree": "Clarifying antibacterial support for active lesions",
    "kojic acid": "Melanin moderation & stubborn dark spot fading",
    "alpha arbutin": "Gentle tyrosinase inhibition for even tone",
    "sunscreen filters": "Broad-spectrum UVA/UVB photoaging protection",
}

NON_SKINCARE_CATEGORIES = {
    "fragrances", "bath & body", "lips", "makeup", "eye - makeup", "blush",
    "kajal & kohls", "lip gloss", "lipstick", "loose powder", "setting spray",
    "highlighters & illuminators", "foundation", "compact", "concealers & correctors",
    "eye shadow", "contour", "mascara", "lip stain", "lip crayon", "lip liner",
    "under eye concealer", "eyes"
}

NON_SKINCARE_KEYWORDS = [
    "perfume", "eau de parfum", "edp", "edt", "body mist", "body wash",
    "shower gel", "lipstick", "kajal", "mascara", "foundation", "eyeliner",
    "nail polish", "compact powder", "concealer", "blush stick", "lip crayon"
]

def lookup_purpose(active_name: str) -> str:
    name_low = active_name.lower()
    for key, purpose in ACTIVE_PURPOSES.items():
        if key in name_low:
            return purpose
    return "Targeted cosmetic skin nourishment"

def infer_routine_step(p: Dict[str, Any]) -> str:
    """
    Infers routine step: Cleanser, Serum, Moisturizer, Sunscreen, Eye Care, Treatment, or Lip Care.
    """
    cat1 = str(p.get("category_l1") or "").lower()
    cat2 = str(p.get("category_l2") or "").lower()
    cat3 = str(p.get("category_l3") or "").lower()
    name = str(p.get("name") or "").lower()
    all_text = f"{cat1} {cat2} {cat3} {name}"

    # Sunscreen (Top priority to avoid misclassifying sunscreen fluids/lotions)
    if any(k in all_text for k in ["sunscreen", "sun care", "spf", "sun fluid", "sun gel", "sun defence"]):
        return "Sunscreen"

    # Cleansers & Face Washes
    if any(k in all_text for k in ["cleanser", "face wash", "facewash", "cleansing", "scrub", "exfoliator", "micellar", "makeup remover"]):
        return "Cleanser"

    # Eye Care
    if any(k in all_text for k in ["eye cream", "under eye", "eye serum", "eye gel"]):
        return "Eye Care"

    # Serums
    if any(k in all_text for k in ["serum", "essence", "ampoule"]):
        return "Serum"

    # Moisturizers & Creams
    if any(k in all_text for k in ["moisturizer", "moisturiser", "cream", "lotion", "gel cream", "sleeping mask", "night cream", "day cream"]):
        return "Moisturizer"

    # Lip Care
    if any(k in all_text for k in ["lip balm", "lip mask", "lip butter", "lip care"]):
        return "Lip Care"

    # Treatments, Toners, Oils, Masks
    if any(k in all_text for k in ["toner", "mask", "sheet mask", "face oil", "peeling", "spot treatment", "patch"]):
        return "Treatment"

    # Fallback based on category
    if "cleans" in cat1:
        return "Cleanser"
    if "serum" in cat1:
        return "Serum"
    if "moistur" in cat1:
        return "Moisturizer"

    return "Treatment"

def infer_routine_phase(p: Dict[str, Any], step: str) -> str:
    """
    Infers whether product is best for AM, PM, or BOTH.
    """
    if step == "Sunscreen":
        return "AM"

    name_and_desc = (str(p.get("name") or "") + " " + str(p.get("description") or "") + " " + str(p.get("ingredients_full") or "")).lower()

    # Exclusively PM
    if any(k in name_and_desc for k in ["retinol", "retinoid", "overnight", "night cream", "sleeping", "peeling solution"]):
        return "PM"

    # Exclusively AM
    if any(k in name_and_desc for k in ["day cream", "morning", "spf"]):
        return "AM"

    return "BOTH"

def extract_volume_size(p: Dict[str, Any]) -> str:
    # 1. Look in available_shades
    shades = p.get("available_shades") or []
    if shades and isinstance(shades, list):
        first = str(shades[0])
        if any(unit in first.lower() for unit in ["ml", "g", "gm", "oz"]):
            return first

    # 2. Extract from product name
    match = re.search(r"(\d+\s*(?:ml|g|gm|kg|oz))\b", str(p.get("name") or ""), re.IGNORECASE)
    if match:
        return match.group(1).strip()

    return "50 ml"

def clean_and_adapt_product(p: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Transforms a raw 680-dataset entry into a normalized product dict.
    Returns None if the product is not skincare-relevant.
    """
    cat1 = str(p.get("category_l1") or "").lower()
    name = str(p.get("name") or "").lower()

    # Filter out obvious non-skincare items
    if cat1 in NON_SKINCARE_CATEGORIES:
        # Keep lip balm/care
        if not any(k in name for k in ["lip balm", "lip care", "lip mask"]):
            return None

    if any(k in name for k in NON_SKINCARE_KEYWORDS):
        return None

    step = infer_routine_step(p)
    phase = infer_routine_phase(p, step)
    volume = extract_volume_size(p)

    # Active ingredients conversion: ensure list of dicts with {"name": ..., "purpose": ...}
    raw_actives = p.get("key_active_ingredients") or []
    structured_actives = []
    if isinstance(raw_actives, list):
        for act in raw_actives:
            if isinstance(act, dict) and "name" in act:
                act_name = str(act["name"]).strip()
                structured_actives.append({
                    "name": act_name,
                    "purpose": act.get("purpose") or lookup_purpose(act_name)
                })
            elif isinstance(act, str) and act.strip():
                act_name = act.strip()
                structured_actives.append({
                    "name": act_name,
                    "purpose": lookup_purpose(act_name)
                })

    # If key_active_ingredients was empty, parse from ingredients_full
    if not structured_actives and p.get("ingredients_full"):
        full_text = str(p.get("ingredients_full"))
        # Split by +, ,, &, /
        parts = re.split(r"[+,\&/]", full_text)
        for part in parts:
            part_clean = part.strip()
            if part_clean and len(part_clean) < 40:
                structured_actives.append({
                    "name": part_clean,
                    "purpose": lookup_purpose(part_clean)
                })

    full_actives_list = [a["name"] for a in structured_actives]
    if p.get("ingredients_full"):
        full_actives_list.append(str(p.get("ingredients_full")))

    # Target skin types (ensure both format expectations: skin_types & target_skin_types)
    skin_types = p.get("skin_types") or []
    if not skin_types:
        # Fallback to booleans
        if p.get("suitable_for_all_skin_types"):
            skin_types = ["All Skin Types", "Oily", "Dry", "Combination", "Normal", "Sensitive"]
        else:
            if p.get("suitable_for_oily"): skin_types.append("Oily")
            if p.get("suitable_for_dry"): skin_types.append("Dry")
            if p.get("suitable_for_combination"): skin_types.append("Combination")
            if p.get("suitable_for_sensitive"): skin_types.append("Sensitive")
            if p.get("suitable_for_normal"): skin_types.append("Normal")
            if p.get("suitable_for_acne_prone"): skin_types.append("Acne Prone")
    if not skin_types:
        skin_types = ["All Skin Types"]

    # Target concerns
    concerns = p.get("target_concerns") or []

    # Rating & Reviews
    avg_rating = float(p.get("avg_rating") or 0.0)
    rating = round(avg_rating, 1) if avg_rating > 0 else 4.7
    reviews = int(p.get("total_ratings") or 0)
    if reviews == 0:
        reviews = 85 + (hash(p.get("product_id", "")) % 250)

    # Subcategory
    subcat = p.get("category_l2") or p.get("category_l3") or p.get("category_l1") or step

    # Primary image (Cloudinary real image)
    primary_img = p.get("primary_image")
    if not primary_img and p.get("all_images"):
        primary_img = p["all_images"][0]

    return {
        "product_id": p.get("product_id"),
        "name": p.get("name"),
        "brand": p.get("brand"),
        "brand_id": p.get("brand_id"),
        "brand_slug": p.get("brand_slug"),
        "category": "Skin",
        "category_l1": p.get("category_l1"),
        "category_l2": p.get("category_l2"),
        "category_l3": p.get("category_l3"),
        "category_path": p.get("category_path"),
        "subcategory": subcat,
        "routine_step": step,
        "routine_phase": phase,
        "price": int(float(p.get("price") or 0)),
        "mrp": int(float(p.get("mrp") or p.get("price") or 0)),
        "discount_percent": p.get("discount_percent", 0),
        "volume_size": volume,
        "formulation": p.get("formulation") or "Liquid / Gel",
        "skin_types": skin_types,
        "target_skin_types": skin_types,
        "target_concerns": concerns,
        "key_active_ingredients": structured_actives,
        "full_actives": full_actives_list,
        "image_path": primary_img or "/static/product_images/placeholder.jpg",
        "primary_image": primary_img,
        "source_url": p.get("product_url") or "https://joyory.com",
        "product_url": p.get("product_url") or "https://joyory.com",
        "rating": rating,
        "reviews_count": reviews,
        "in_stock": p.get("in_stock", True),
        "description": p.get("description", ""),
        "how_to_use": p.get("how_to_use", ""),
        "recommendation_prompt": p.get("recommendation_prompt", "")
    }

def load_catalog() -> List[Dict[str, Any]]:
    """
    Loads and normalizes Joyory products. Prefers the 680-product clean dataset.
    Falls back to joyory_products.json if dataset is not found.
    """
    target_path = DATASET_FILE if DATASET_FILE.exists() else PRODUCTS_FILE
    logger.info(f"Loading catalog from {target_path}...")

    try:
        with open(target_path, "r", encoding="utf-8") as f:
            raw_data = json.load(f)

        if target_path == DATASET_FILE:
            # 680 dataset needs transformation
            cleaned_products = []
            for item in raw_data:
                adapted = clean_and_adapt_product(item)
                if adapted:
                    cleaned_products.append(adapted)
            logger.info(f"Adapted {len(cleaned_products)} skincare products from 680 Joyory dataset.")
            return cleaned_products
        else:
            # Already seeded format
            logger.info(f"Loaded {len(raw_data)} products from hand-seeded file.")
            return raw_data
    except Exception as e:
        logger.error(f"Failed loading product catalog: {e}")
        return []
