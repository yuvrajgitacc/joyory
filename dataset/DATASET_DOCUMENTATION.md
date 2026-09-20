# Complete Data Dictionary & Model Training Guide

## 1. Overview
The Joyory Recommendation Dataset provides high-fidelity, production-level product catalog information extracted directly from the live Joyory beauty e-commerce platform.

Beauty and cosmetic recommendation engines have unique requirements compared to generic retail recommenders:
1. **Skin Compatibility is Critical**: Suggesting a heavy comedogenic cream to a customer with oily, acne-prone skin causes adverse skin reactions. This dataset contains explicit `skin_types` and boolean compatibility flags (`suitable_for_oily`, `suitable_for_dry`, etc.).
2. **Ingredient Awareness & Conflict Checking**: Advanced consumers look for specific actives (e.g., 10% Niacinamide, 2% Salicylic Acid, Retinol). Some ingredients conflict (e.g., Retinol + AHA/BHA exfoliants). The dataset provides parsed `key_active_ingredients` and complete ingredient text.
3. **Regimen Sequencing**: Customers rarely buy a single standalone item; they buy complementary routine steps (Cleanser -> Toner -> Serum -> Moisturizer -> SPF). The dataset provides `joyory_routine_suggestions.json`.

---

## 2. Dataset Formats Explained

### A. `joyory_products_clean.csv`
- Format: Standard RFC 4180 CSV with UTF-8 encoding.
- Ideal for: Pandas, Polars, Scikit-learn, XGBoost, LightGBM, FastAI.
- Multi-valued fields (such as `skin_types`, `key_active_ingredients`, `target_concerns`) are formatted as clean semicolon-separated strings (`; `) to prevent CSV escaping corruption.

### B. `joyory_products_clean.json`
- Format: Pretty-printed JSON array of product objects.
- Ideal for: Web applications, MongoDB/Elasticsearch ingestion, and downstream API services.
- Contains nested arrays for `categories`, `variants`, `images`, `available_shades`, and `skin_types`.

### C. `joyory_products_clean.jsonl`
- Format: Newline-delimited JSON (JSON Lines).
- Ideal for: Big data streaming (Spark, Ray), HuggingFace `datasets` library, and cloud storage loaders.

### D. `joyory_recommendation_corpus.jsonl`
- Format: JSON Lines with pre-synthesized `text_for_embedding` and rich `metadata`.
- Purpose-built for:
  - Vector Databases (Pinecone, Qdrant, Milvus, Weaviate, FAISS, ChromaDB).
  - Sentence Transformer training & fine-tuning.
  - LLM RAG (Retrieval-Augmented Generation) context injection.

### E. `joyory_skin_concern_matrix.csv`
- Format: Binary incidence matrix.
- Columns: `product_id`, `name`, `brand`, `category_path`, plus 8 skin concern flags:
  - `Acne & Blemishes`
  - `Oil & Pore Control`
  - `Dryness & Dehydration`
  - `Pigmentation & Dark Spots`
  - `Anti-Aging & Fine Lines`
  - `Sun Protection & Tanning`
  - `Sensitivity & Redness`
  - `Dullness & Uneven Texture`

### F. `joyory_routine_suggestions.json`
- Maps products into routine step buckets (`step_1_cleanser`, `step_2_toner`, `step_3_serum`, `step_4_moisturizer`, `step_5_sunscreen`).
- Allows graph-based recommendation engines to complete multi-step bundles.

---

## 3. Training Recommendation Models: Code Examples

### A. Semantic Search & Suggestion Engine (Sentence Transformers + FAISS)
```python
import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

# 1. Load data
docs = []
with open("d:/JOYORY/dataset/clean/joyory_recommendation_corpus.jsonl", "r", encoding="utf-8") as f:
    for line in f:
        docs.append(json.loads(line))

# 2. Compute embeddings
encoder = SentenceTransformer("BAAI/bge-small-en-v1.5")
texts = [d["text_for_embedding"] for d in docs]
vectors = encoder.encode(texts, normalize_embeddings=True, show_progress_bar=True)

# 3. Build FAISS Index
dim = vectors.shape[1]
index = faiss.IndexFlatIP(dim)
index.add(vectors.astype(np.float32))

# 4. Recommendation Inference
def recommend(user_query, top_k=5):
    q_vec = encoder.encode([user_query], normalize_embeddings=True)
    distances, indices = index.search(q_vec.astype(np.float32), top_k)
    
    results = []
    for rank, idx in enumerate(indices[0]):
        product = docs[idx]
        score = distances[0][rank]
        results.append({
            "rank": rank + 1,
            "title": product["title"],
            "brand": product["brand"],
            "score": float(score),
            "price": product["metadata"]["price"],
            "url": product["metadata"]["url"]
        })
    return results

# Test query
print(recommend("hydrating serum for dry skin with hyaluronic acid"))
```

### B. LLM Instruction Fine-Tuning Format
To train an LLM (e.g. LLaMA 3, Mistral 7B) as a personalized beauty concierge, convert `joyory_recommendation_corpus.jsonl` into instruction pairs:

```json
{
  "instruction": "Recommend a skincare product for a customer with sensitive, dehydrated skin looking for a gentle daily moisturizer.",
  "response": "I recommend the Cica & Ceramide Gentle Cleanser or Hydrating Gel Moisturizer by Dr Sheth's. It features soothing Ceramides and Centella Asiatica to restore your skin barrier while locking in hydration without irritation."
}
```
