import os
import sys
import json
import time
import logging
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("joyory_scraper")

BASE_API_URL = "https://beauty.joyory.com/api"
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "raw")
os.makedirs(OUTPUT_DIR, exist_ok=True)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://joyory.com/',
    'Origin': 'https://joyory.com',
    'Connection': 'keep-alive'
}

def get_session():
    session = requests.Session()
    session.headers.update(HEADERS)
    retries = Retry(
        total=5,
        backoff_factor=1.5,
        status_forcelist=[429, 500, 502, 503, 504],
        raise_on_status=False
    )
    adapter = HTTPAdapter(max_retries=retries)
    session.mount('https://', adapter)
    session.mount('http://', adapter)
    return session

def fetch_json(session, url, params=None, timeout=35):
    for attempt in range(1, 6):
        try:
            res = session.get(url, params=params, timeout=timeout)
            if res.status_code == 200:
                return res.json()
            elif res.status_code == 404:
                logger.warning(f"404 Not Found: {url}")
                return None
            else:
                logger.warning(f"Attempt {attempt}: Status {res.status_code} for {url}. Retrying...")
        except Exception as e:
            logger.warning(f"Attempt {attempt}: Network error fetching {url}: {e}. Retrying in {attempt * 2}s...")
            time.sleep(attempt * 2)
    raise RuntimeError(f"Failed to fetch {url} after 5 attempts.")

def scrape_auxiliary_data(session):
    logger.info("Scraping auxiliary metadata endpoints...")
    aux_endpoints = {
        "categories_tree": f"{BASE_API_URL}/user/categories/tree",
        "brands": f"{BASE_API_URL}/user/brands",
        "skin_types": f"{BASE_API_URL}/user/products/skin-types",
        "top_sellers": f"{BASE_API_URL}/user/products/top-sellers",
        "top_categories": f"{BASE_API_URL}/user/products/top-categories",
        "routine_templates": f"{BASE_API_URL}/user/routines/templates",
        "skincare_quiz_questions": f"{BASE_API_URL}/user/for-you/skincare/questions",
        "shadefinder_tones": f"{BASE_API_URL}/user/shadefinder/tones",
        "promotions_banner": f"{BASE_API_URL}/user/promotions/active?section=banner",
        "promotions_offers": f"{BASE_API_URL}/user/promotions/active?section=offers",
        "promotions_product": f"{BASE_API_URL}/user/promotions/active?section=product",
        "vto_workflow": f"{BASE_API_URL}/vto/workflow?section=landing"
    }

    aux_data = {}
    for name, endpoint in aux_endpoints.items():
        try:
            logger.info(f"Fetching {name}...")
            data = fetch_json(session, endpoint)
            aux_data[name] = data
            out_file = os.path.join(OUTPUT_DIR, f"{name}.json")
            with open(out_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            logger.info(f"Saved {name} -> {out_file}")
        except Exception as e:
            logger.error(f"Error fetching {name}: {e}")
            aux_data[name] = None
        time.sleep(0.3)

    return aux_data

def scrape_all_products(session, batch_limit=50):
    logger.info("Starting catalog scraping with cursor pagination...")
    all_products = []
    seen_ids = set()
    cursor = None
    page = 1
    checkpoint_file = os.path.join(OUTPUT_DIR, "products_checkpoint.json")

    # Load existing checkpoint if available
    if os.path.exists(checkpoint_file):
        try:
            with open(checkpoint_file, 'r', encoding='utf-8') as f:
                saved = json.load(f)
                all_products = saved.get('products', [])
                cursor = saved.get('nextCursor')
                seen_ids = set(p['_id'] for p in all_products if '_id' in p)
                page = saved.get('page', 1)
                logger.info(f"Resumed from checkpoint: {len(all_products)} products loaded, next cursor: {cursor}, page: {page}")
        except Exception as e:
            logger.warning(f"Could not load checkpoint: {e}")

    while True:
        url = f"{BASE_API_URL}/user/products/all"
        params = {'limit': batch_limit}
        if cursor:
            params['cursor'] = cursor

        logger.info(f"Fetching page {page} (current total: {len(all_products)}, cursor: {cursor})...")
        t0 = time.time()
        try:
            data = fetch_json(session, url, params=params)
        except Exception as e:
            logger.error(f"Failed fetching page {page}: {e}")
            break

        if not data or not isinstance(data, dict):
            logger.warning(f"Unexpected response format on page {page}: {type(data)}")
            break

        products = data.get('products', [])
        pagination = data.get('pagination', {})
        duration = time.time() - t0

        new_in_batch = 0
        for p in products:
            pid = p.get('_id')
            if pid and pid not in seen_ids:
                seen_ids.add(pid)
                all_products.append(p)
                new_in_batch += 1

        logger.info(f"Page {page} done in {duration:.2f}s: received {len(products)} products ({new_in_batch} new). Total accumulated: {len(all_products)}")

        has_more = pagination.get('hasMore', False)
        next_cursor = pagination.get('nextCursor')

        # Periodic checkpoint
        with open(checkpoint_file, 'w', encoding='utf-8') as f:
            json.dump({
                'products': all_products,
                'nextCursor': next_cursor,
                'page': page + 1,
                'total_unique': len(all_products)
            }, f, ensure_ascii=False)

        if not has_more or not next_cursor or next_cursor == cursor or len(products) == 0:
            logger.info("Catalog pagination completed: reached the end of results.")
            break

        cursor = next_cursor
        page += 1
        time.sleep(0.3)

    raw_final_file = os.path.join(OUTPUT_DIR, "joyory_raw_products.json")
    with open(raw_final_file, 'w', encoding='utf-8') as f:
        json.dump(all_products, f, ensure_ascii=False, indent=2)

    logger.info(f"Successfully scraped all {len(all_products)} products! Saved to {raw_final_file}")
    return all_products

def main():
    logger.info("=== Starting Full Joyory Scraper ===")
    session = get_session()
    
    # 1. Scrape auxiliary taxonomy & recommendation data
    scrape_auxiliary_data(session)
    
    # 2. Scrape entire product catalog
    scrape_all_products(session, batch_limit=50)
    
    logger.info("=== Scraping Finished Successfully ===")

if __name__ == "__main__":
    main()
