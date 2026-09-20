import os
import re
import json
import html
import logging
import pandas as pd

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger("joyory_processor")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RAW_DIR = os.path.join(BASE_DIR, "raw")
CLEAN_DIR = os.path.join(BASE_DIR, "clean")
os.makedirs(CLEAN_DIR, exist_ok=True)

# Common active skincare & beauty ingredients dictionary for extraction
KNOWN_ACTIVES = [
    "Niacinamide", "Hyaluronic Acid", "Salicylic Acid", "Vitamin C", "Retinol",
    "Ceramides", "Cica", "Centella Asiatica", "Zinc", "Alpha Arbutin", "Glycolic Acid",
    "Lactic Acid", "Kojic Acid", "Squalane", "Peptides", "Green Tea", "Tea Tree",
    "Aloe Vera", "Collagen", "Bakuchiol", "Azelaic Acid", "Caffeine", "Vitamin E",
    "Papaya Enzyme", "Bulgarian Rose", "Ferulic Acid", "Oat Extract", "Glycerin",
    "Shea Butter", "Titanium Dioxide", "Zinc Oxide", "Fision WrinkleFix", "Plant Stem Cells"
]

SKIN_CONCERNS_KEYWORDS = {
    "Acne & Blemishes": ["acne", "blemish", "breakout", "pimple", "salicylic", "tea tree", "clarity"],
    "Oil & Pore Control": ["pore", "oily", "sebum", "mattifying", "shine control", "oil-free"],
    "Dryness & Dehydration": ["dry", "dehydration", "hydrate", "hyaluronic", "nourish", "moisture", "ceramide"],
    "Pigmentation & Dark Spots": ["pigmentation", "dark spot", "melasma", "brighten", "alpha arbutin", "kojic", "vitamin c"],
    "Anti-Aging & Fine Lines": ["wrinkle", "fine line", "anti-aging", "firming", "mature", "retinol", "peptide", "collagen"],
    "Sun Protection & Tanning": ["spf", "pa+++", "sunscreen", "uv", "sun damage", "tanning", "broad-spectrum"],
    "Sensitivity & Redness": ["sensitive", "redness", "soothe", "calming", "cica", "centella", "gentle"],
    "Dullness & Uneven Texture": ["dull", "glow", "radiance", "exfoliat", "uneven texture", "lactic", "glycolic"]
}

def clean_text(text):
    if not text or not isinstance(text, str):
        return ""
    # Decode HTML entities
    text = html.unescape(text)
    # Fix common encoding artifacts
    text = text.replace('\ufffd', '-').replace('\u2013', '-').replace('\u2014', '-')
    text = text.replace('cr\u00e8me', 'creme').replace('Cr\u00e8me', 'Creme')
    # Strip HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)
    # Normalize whitespaces
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def extract_active_ingredients(text_blob, explicit_ingredients):
    combined = " ".join([text_blob or ""] + (explicit_ingredients or []))
    matched = set()
    for active in KNOWN_ACTIVES:
        if re.search(r'\b' + re.escape(active) + r'\b', combined, re.IGNORECASE):
            matched.add(active)
    return sorted(list(matched))

def infer_concerns(name, desc, category):
    combined = f"{name} {desc} {category}".lower()
    matched_concerns = []
    for concern, kws in SKIN_CONCERNS_KEYWORDS.items():
        if any(kw in combined for kw in kws):
            matched_concerns.append(concern)
    if not matched_concerns:
        matched_concerns.append("Daily Maintenance & Care")
    return matched_concerns

def parse_product(p):
    pid = p.get('_id')
    name = clean_text(p.get('name') or p.get('title') or "")
    
    # Brand extraction
    brand_obj = p.get('brand')
    brand_name = brand_obj.get('name') if isinstance(brand_obj, dict) else (brand_obj or "Joyory")
    brand_id = brand_obj.get('_id') if isinstance(brand_obj, dict) else None
    brand_slug = brand_obj.get('slug') if isinstance(brand_obj, dict) else None
    
    # Category extraction
    categories = p.get('categories') or []
    cat_l1 = categories[0].get('name') if len(categories) > 0 and isinstance(categories[0], dict) else None
    cat_l2 = categories[1].get('name') if len(categories) > 1 and isinstance(categories[1], dict) else None
    cat_l3 = categories[2].get('name') if len(categories) > 2 and isinstance(categories[2], dict) else None
    
    # Fallback to single category field
    if not cat_l1 and p.get('category'):
        cat_l1 = p['category'].get('name') if isinstance(p['category'], dict) else p.get('category')
    if not cat_l2 and p.get('subCategory'):
        cat_l2 = p['subCategory'].get('name') if isinstance(p['subCategory'], dict) else p.get('subCategory')
    if not cat_l3 and p.get('subSubCategory'):
        cat_l3 = p['subSubCategory'].get('name') if isinstance(p['subSubCategory'], dict) else p.get('subSubCategory')

    cat_hierarchy = [c for c in [cat_l1, cat_l2, cat_l3] if c]
    category_path = " > ".join(cat_hierarchy) if cat_hierarchy else (cat_l1 or "Beauty")

    # Skin types extraction
    raw_st = p.get('skinTypes') or []
    skin_types = []
    for st in raw_st:
        if isinstance(st, dict) and st.get('name'):
            skin_types.append(st['name'])
        elif isinstance(st, str):
            skin_types.append(st)

    st_lower = [s.lower() for s in skin_types]
    is_oily = any("oily" in s for s in st_lower)
    is_dry = any("dry" in s for s in st_lower)
    is_comb = any("combination" in s for s in st_lower)
    is_sens = any("sensitive" in s for s in st_lower)
    is_norm = any("normal" in s for s in st_lower)
    is_acne = any("acne" in s for s in st_lower)
    is_all = (is_oily and is_dry and is_comb and is_norm) or any("all" in s for s in st_lower) or len(skin_types) == 0

    # Formulation
    form_obj = p.get('formulation')
    formulation = form_obj.get('name') if isinstance(form_obj, dict) else (form_obj or "")

    # Pricing
    price = p.get('discountedPrice') or p.get('price') or p.get('minPrice') or 0
    mrp = p.get('mrp') or p.get('maxPrice') or price
    discount_pct = p.get('discountPercent') or 0
    discount_amt = p.get('discountAmount') or (mrp - price if mrp > price else 0)

    # Description & Instructions
    desc = clean_text(p.get('description') or "")
    
    raw_htu = p.get('howToUse')
    if isinstance(raw_htu, list):
        how_to_use = " ".join([clean_text(h) for h in raw_htu if h])
    else:
        how_to_use = clean_text(raw_htu or "")

    raw_ing = p.get('ingredients')
    if isinstance(raw_ing, list):
        ingredients_list = [clean_text(i) for i in raw_ing if i]
    elif isinstance(raw_ing, str):
        ingredients_list = [clean_text(i) for i in raw_ing.split(',') if clean_text(i)]
    else:
        ingredients_list = []

    ingredients_str = ", ".join(ingredients_list)
    active_actives = extract_active_ingredients(f"{name} {desc}", ingredients_list)
    concerns = infer_concerns(name, desc, category_path)

    # Ratings
    avg_rating = float(p.get('avgRating') or p.get('rating') or 0.0)
    total_ratings = int(p.get('totalRatings') or p.get('reviewsCount') or 0)

    # VTO & Status
    supports_vto = bool(p.get('supportsVTO') or p.get('isTryOnAvailable') or False)
    vto_type = p.get('vtoType') or p.get('tryOnCategory') or None
    in_stock = bool(p.get('inStock') or (p.get('totalStock', 1) > 0))
    status = p.get('status') or ("inStock" if in_stock else "outOfStock")

    # Images
    images = []
    for img in (p.get('images') or []):
        if isinstance(img, str) and img.startswith('http'):
            images.append(img)
        elif isinstance(img, dict) and img.get('url'):
            images.append(img['url'])

    # Variants & Shades
    variants = p.get('variants') or []
    shades = []
    for sh in (p.get('shadeOptions') or p.get('shades') or []):
        if isinstance(sh, dict) and sh.get('name'):
            shades.append(sh['name'])
        elif isinstance(sh, str):
            shades.append(sh)

    # Fallback to variant images if product images empty
    if not images and variants:
        for v in variants:
            for vi in (v.get('images') or []):
                if isinstance(vi, str) and vi.startswith('http') and vi not in images:
                    images.append(vi)

    primary_image = images[0] if images else None

    # Slug and Joyory Web URL
    slugs = p.get('slugs') or []
    slug = slugs[0] if slugs else p.get('slug')
    product_url = f"https://joyory.com/product/{slug}" if slug else f"https://joyory.com/product/{pid}"

    # Rich Recommendation Prompt / Corpus representation for ML models
    recommendation_text = (
        f"Product Name: {name}. "
        f"Brand: {brand_name}. "
        f"Category: {category_path}. "
        f"Skin Compatibility: {', '.join(skin_types) if skin_types else 'All Skin Types'}. "
        f"Formulation: {formulation if formulation else 'Standard'}. "
        f"Key Active Ingredients: {', '.join(active_actives) if active_actives else 'Botanical & Science Actives'}. "
        f"Target Skin Concerns: {', '.join(concerns)}. "
        f"Price: Rs. {price} (MRP: Rs. {mrp}). "
        f"Rating: {avg_rating} ({total_ratings} reviews). "
        f"Virtual Try-On: {'Supported' if supports_vto else 'Not Supported'}. "
        f"Description: {desc} "
        f"How to Use: {how_to_use}"
    ).strip()

    return {
        "product_id": pid,
        "name": name,
        "brand": brand_name,
        "brand_id": brand_id,
        "brand_slug": brand_slug,
        "category_l1": cat_l1,
        "category_l2": cat_l2,
        "category_l3": cat_l3,
        "category_path": category_path,
        "skin_types": skin_types,
        "suitable_for_oily": is_oily,
        "suitable_for_dry": is_dry,
        "suitable_for_combination": is_comb,
        "suitable_for_sensitive": is_sens,
        "suitable_for_normal": is_norm,
        "suitable_for_acne_prone": is_acne,
        "suitable_for_all_skin_types": is_all,
        "formulation": formulation,
        "price": price,
        "mrp": mrp,
        "discount_percent": discount_pct,
        "discount_amount": discount_amt,
        "avg_rating": avg_rating,
        "total_ratings": total_ratings,
        "in_stock": in_stock,
        "status": status,
        "supports_vto": supports_vto,
        "vto_type": vto_type,
        "total_variants": len(variants),
        "total_shades": len(shades),
        "available_shades": shades,
        "key_active_ingredients": active_actives,
        "ingredients_full": ingredients_str,
        "target_concerns": concerns,
        "description": desc,
        "how_to_use": how_to_use,
        "primary_image": primary_image,
        "all_images": images,
        "product_url": product_url,
        "slug": slug,
        "recommendation_prompt": recommendation_text
    }

def main():
    raw_products_file = os.path.join(RAW_DIR, "joyory_raw_products.json")
    if not os.path.exists(raw_products_file):
        logger.error(f"Raw products file not found at: {raw_products_file}")
        return

    with open(raw_products_file, 'r', encoding='utf-8') as f:
        raw_products = json.load(f)

    logger.info(f"Loaded {len(raw_products)} raw products. Parsing and standardizing...")

    clean_records = []
    seen_ids = set()

    for p in raw_products:
        record = parse_product(p)
        if record["product_id"] and record["product_id"] not in seen_ids:
            seen_ids.add(record["product_id"])
            clean_records.append(record)

    logger.info(f"Processed {len(clean_records)} unique, clean product records.")

    # 1. Save Clean JSON
    json_path = os.path.join(CLEAN_DIR, "joyory_products_clean.json")
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(clean_records, f, ensure_ascii=False, indent=2)
    logger.info(f"Saved: {json_path}")

    # 2. Save Clean JSONL (for streaming & LLM fine-tuning)
    jsonl_path = os.path.join(CLEAN_DIR, "joyory_products_clean.jsonl")
    with open(jsonl_path, 'w', encoding='utf-8') as f:
        for r in clean_records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    logger.info(f"Saved: {jsonl_path}")

    # 3. Save Clean CSV for Data Science / Tabular ML
    df = pd.DataFrame(clean_records)
    # Convert lists to semicolon or comma separated strings for tabular CSV compatibility
    df_csv = df.copy()
    df_csv['skin_types'] = df_csv['skin_types'].apply(lambda x: "; ".join(x) if isinstance(x, list) else "")
    df_csv['available_shades'] = df_csv['available_shades'].apply(lambda x: "; ".join(x) if isinstance(x, list) else "")
    df_csv['key_active_ingredients'] = df_csv['key_active_ingredients'].apply(lambda x: "; ".join(x) if isinstance(x, list) else "")
    df_csv['target_concerns'] = df_csv['target_concerns'].apply(lambda x: "; ".join(x) if isinstance(x, list) else "")
    df_csv['all_images'] = df_csv['all_images'].apply(lambda x: "; ".join(x) if isinstance(x, list) else "")

    csv_path = os.path.join(CLEAN_DIR, "joyory_products_clean.csv")
    df_csv.to_csv(csv_path, index=False, encoding='utf-8')
    logger.info(f"Saved: {csv_path}")

    # 4. Save Recommendation Training Pairs & Semantic Corpus (JSONL)
    rec_corpus_path = os.path.join(CLEAN_DIR, "joyory_recommendation_corpus.jsonl")
    with open(rec_corpus_path, 'w', encoding='utf-8') as f:
        for r in clean_records:
            corpus_entry = {
                "id": r["product_id"],
                "title": r["name"],
                "brand": r["brand"],
                "category": r["category_path"],
                "text_for_embedding": r["recommendation_prompt"],
                "metadata": {
                    "skin_types": r["skin_types"],
                    "concerns": r["target_concerns"],
                    "formulation": r["formulation"],
                    "active_ingredients": r["key_active_ingredients"],
                    "price": r["price"],
                    "mrp": r["mrp"],
                    "rating": r["avg_rating"],
                    "url": r["product_url"],
                    "image": r["primary_image"],
                    "in_stock": r["in_stock"],
                    "supports_vto": r["supports_vto"]
                }
            }
            f.write(json.dumps(corpus_entry, ensure_ascii=False) + "\n")
    logger.info(f"Saved: {rec_corpus_path}")

    # 5. Build Skincare Routine Regimen Suggestions (Cleanser -> Toner -> Serum -> Moisturizer -> Sunscreen)
    build_routine_dataset(clean_records)

    # 6. Build Skin Concern Matrix
    build_concern_matrix(clean_records)

    # 7. Dataset Summary & Statistics
    generate_summary(clean_records, df)

def build_routine_dataset(records):
    logger.info("Building multi-step routine suggestion dataset...")
    # Group products by step
    step_buckets = {
        "step_1_cleanser": [],
        "step_2_toner": [],
        "step_3_serum": [],
        "step_4_moisturizer": [],
        "step_5_sunscreen": []
    }
    
    for r in records:
        path_lower = r["category_path"].lower()
        name_lower = r["name"].lower()
        
        if "cleanser" in path_lower or "face wash" in name_lower or "cleanser" in name_lower:
            step_buckets["step_1_cleanser"].append(r["product_id"])
        elif "toner" in path_lower or "mist" in path_lower or "toner" in name_lower:
            step_buckets["step_2_toner"].append(r["product_id"])
        elif "serum" in path_lower or "essence" in path_lower or "serum" in name_lower:
            step_buckets["step_3_serum"].append(r["product_id"])
        elif "moisturizer" in path_lower or "cream" in path_lower or "lotion" in path_lower:
            step_buckets["step_4_moisturizer"].append(r["product_id"])
        elif "sun" in path_lower or "spf" in name_lower or "sunscreen" in name_lower:
            step_buckets["step_5_sunscreen"].append(r["product_id"])

    routine_out = os.path.join(CLEAN_DIR, "joyory_routine_suggestions.json")
    with open(routine_out, 'w', encoding='utf-8') as f:
        json.dump({
            "routine_definition": "Standard 5-step Korean/Dermatological AM/PM routine order",
            "steps": ["step_1_cleanser", "step_2_toner", "step_3_serum", "step_4_moisturizer", "step_5_sunscreen"],
            "step_product_counts": {k: len(v) for k, v in step_buckets.items()},
            "step_products": step_buckets
        }, f, indent=2)
    logger.info(f"Saved routine suggestions -> {routine_out}")

def build_concern_matrix(records):
    logger.info("Building skin concern cross-tabulation matrix...")
    matrix_rows = []
    for r in records:
        row = {
            "product_id": r["product_id"],
            "name": r["name"],
            "brand": r["brand"],
            "category_path": r["category_path"]
        }
        for concern in SKIN_CONCERNS_KEYWORDS.keys():
            row[concern] = 1 if concern in r["target_concerns"] else 0
        matrix_rows.append(row)

    df_matrix = pd.DataFrame(matrix_rows)
    out_matrix = os.path.join(CLEAN_DIR, "joyory_skin_concern_matrix.csv")
    df_matrix.to_csv(out_matrix, index=False, encoding='utf-8')
    logger.info(f"Saved skin concern matrix -> {out_matrix}")

def generate_summary(records, df):
    logger.info("Generating dataset statistical summary...")
    summary = {
        "dataset_name": "Joyory Beauty & Skincare Product Catalog for ML Recommendations",
        "source_url": "https://joyory.com",
        "total_unique_products": len(records),
        "total_brands": df['brand'].nunique(),
        "top_brands": df['brand'].value_counts().head(10).to_dict(),
        "total_categories_l1": df['category_l1'].nunique(),
        "categories_distribution": df['category_l1'].value_counts().to_dict(),
        "price_statistics": {
            "min_price": float(df['price'].min()),
            "max_price": float(df['price'].max()),
            "mean_price": round(float(df['price'].mean()), 2),
            "median_price": float(df['price'].median())
        },
        "skin_type_compatibility_counts": {
            "oily_skin": int(df['suitable_for_oily'].sum()),
            "dry_skin": int(df['suitable_for_dry'].sum()),
            "combination_skin": int(df['suitable_for_combination'].sum()),
            "sensitive_skin": int(df['suitable_for_sensitive'].sum()),
            "acne_prone": int(df['suitable_for_acne_prone'].sum()),
            "all_skin_types": int(df['suitable_for_all_skin_types'].sum())
        },
        "vto_ready_products": int(df['supports_vto'].sum()),
        "in_stock_products": int(df['in_stock'].sum())
    }

    sum_path = os.path.join(CLEAN_DIR, "joyory_dataset_summary.json")
    with open(sum_path, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2)
    logger.info(f"Saved dataset summary -> {sum_path}")

if __name__ == "__main__":
    main()
