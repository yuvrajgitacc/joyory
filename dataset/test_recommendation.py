import os
import json
import math
from collections import Counter

CLEAN_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "clean")

class BeautyRecommendationEngine:
    def __init__(self, products_path=None):
        if not products_path:
            products_path = os.path.join(CLEAN_DIR, "joyory_products_clean.json")
        
        with open(products_path, 'r', encoding='utf-8') as f:
            self.products = json.load(f)

        print(f"[RecommendationEngine] Loaded {len(self.products)} products.")
        self._build_vocabulary()

    def _tokenize(self, text):
        import re
        tokens = re.findall(r'\b[a-zA-Z0-9]{2,}\b', text.lower())
        stopwords = {
            'the', 'and', 'for', 'with', 'that', 'this', 'from', 'have', 'are', 'was',
            'has', 'not', 'you', 'your', 'all', 'any', 'can', 'our', 'out', 'over', 'into'
        }
        return [t for t in tokens if t not in stopwords]

    def _build_vocabulary(self):
        self.doc_freqs = Counter()
        self.doc_vectors = []
        self.n_docs = len(self.products)

        for p in self.products:
            prompt = p.get('recommendation_prompt', '')
            tokens = self._tokenize(prompt)
            term_counts = Counter(tokens)
            self.doc_vectors.append(term_counts)
            for t in term_counts.keys():
                self.doc_freqs[t] += 1

    def _compute_tfidf(self, term_counts):
        vec = {}
        for t, count in term_counts.items():
            df = self.doc_freqs.get(t, 0)
            idf = math.log((self.n_docs + 1) / (df + 1)) + 1.0
            vec[t] = count * idf
        norm = math.sqrt(sum(v * v for v in vec.values()))
        if norm > 0:
            vec = {k: v / norm for k, v in vec.items()}
        return vec

    def _cosine_similarity(self, v1, v2):
        score = 0.0
        for k in v1:
            if k in v2:
                score += v1[k] * v2[k]
        return score

    def suggest_semantic(self, query, top_k=3, filter_category=None, max_price=None, skin_type=None):
        query_tokens = self._tokenize(query)
        q_vec = self._compute_tfidf(Counter(query_tokens))

        scored = []
        for i, p in enumerate(self.products):
            # Apply hard filters if specified
            if filter_category and filter_category.lower() not in p['category_path'].lower():
                continue
            if max_price and p['price'] > max_price:
                continue
            if skin_type:
                st_list = [s.lower() for s in p.get('skin_types', [])]
                if st_list and not any(skin_type.lower() in s for s in st_list):
                    continue

            p_vec = self._compute_tfidf(self.doc_vectors[i])
            sim = self._cosine_similarity(q_vec, p_vec)

            # Social proof & in-stock weight
            boost = 1.0
            if p.get('in_stock', False):
                boost += 0.1
            if p.get('avg_rating', 0) > 4.0:
                boost += 0.05
            
            final_score = sim * boost
            scored.append((final_score, p))

        scored.sort(key=lambda x: x[0], reverse=True)
        return scored[:top_k]

def test_engine():
    print("=== Testing Joyory Product Recommendation Engine ===")
    engine = BeautyRecommendationEngine()

    sample_queries = [
        {
            "persona": "Oily & Acne-Prone Skin",
            "query": "sunscreen broad spectrum spf for oily acne prone skin no white cast",
            "filters": {"skin_type": "oily"}
        },
        {
            "persona": "Dry & Mature Skin",
            "query": "overnight restorative hydration cream for wrinkles aging mature skin with peptides",
            "filters": {"skin_type": "dry"}
        },
        {
            "persona": "Skin Brightening & Hyperpigmentation",
            "query": "brightening face serum with niacinamide and vitamin c for dark spots glow",
            "filters": {}
        },
        {
            "persona": "Gentle Cleanser",
            "query": "gentle face wash cleanser foaming with cica ceramides",
            "filters": {}
        }
    ]

    for item in sample_queries:
        print("\n" + "="*70)
        print(f"Customer Profile: {item['persona']}")
        print(f"Query: \"{item['query']}\"")
        recs = engine.suggest_semantic(item['query'], top_k=3, **item['filters'])
        
        for rank, (score, p) in enumerate(recs, 1):
            print(f"\n  [Rank {rank}] (Match Score: {score:.4f})")
            print(f"  Name: {p['name']}")
            print(f"  Brand: {p['brand']} | Category: {p['category_path']}")
            print(f"  Price: Rs. {p['price']} (MRP: Rs. {p['mrp']}, {p['discount_percent']}% OFF)")
            print(f"  Key Actives: {', '.join(p['key_active_ingredients'])}")
            print(f"  Concerns: {', '.join(p['target_concerns'])}")
            print(f"  Skin Types: {', '.join(p['skin_types']) if p['skin_types'] else 'All Skin Types'}")
            print(f"  Product Link: {p['product_url']}")

if __name__ == "__main__":
    test_engine()
