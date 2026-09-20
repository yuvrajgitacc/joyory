# Joyory E-Commerce Product Recommendation Dataset

A comprehensive, professionally curated and cleaned dataset of cosmetics, skincare, haircare, and fragrance products scraped directly from [Joyory](https://joyory.com). 

This dataset has been specially cleaned and engineered for **training machine learning models**, including:
1. **Product Suggestion & Recommendation Systems** (Content-based filtering, Two-tower neural networks, Collaborative filtering).
2. **Semantic Search & Vector Embeddings** (`sentence-transformers`, OpenAI embeddings, Pinecone, Qdrant, ChromaDB).
3. **Conversational AI / LLM Concierge** (Fine-tuning Llama, Mistral, Gemma, or OpenAI GPT models for skincare & makeup advice).
4. **Routine Regimen Generation** (Multi-step AM/PM skincare sequence predictions).
5. **Virtual Try-On (VTO) and Shade Matching** (Matching skin tones, undertones, and makeup shades).

---

## 📁 Directory Structure

```
d:/JOYORY/dataset/
├── clean/
│   ├── joyory_products_clean.csv            <- Tabular dataset with clean scalar & multi-label attributes
│   ├── joyory_products_clean.json           <- Full structured JSON with complete variants & image arrays
│   ├── joyory_products_clean.jsonl          <- JSON Lines format for batch ML pipelines and LLM training
│   ├── joyory_recommendation_corpus.jsonl   <- Pre-engineered semantic prompts + metadata for embeddings/RAG
│   ├── joyory_routine_suggestions.json      <- Step-by-step AM/PM regimen sequence graph
│   ├── joyory_skin_concern_matrix.csv       <- Cross-tabulation of skin concerns vs product compatibility
│   └── joyory_dataset_summary.json          <- Statistical metrics, counts, and category distributions
├── raw/
│   ├── joyory_raw_products.json             <- Exact raw production JSON dump from Joyory API
│   ├── categories_tree.json                 <- Full hierarchical category tree
│   ├── brands.json                          <- Complete list of 21 official brands
│   ├── skin_types.json                      <- Joyory skin types taxonomy
│   ├── routine_templates.json               <- Official routine templates & conflict rules
│   ├── skincare_quiz_questions.json         <- Diagnostic quiz decision trees
│   ├── shadefinder_tones.json               <- Skin tone and undertone lookup tables
│   ├── promotions_banner.json               <- Active marketing banners
│   ├── promotions_offers.json               <- Active bundle discounts & vouchers
│   └── vto_workflow.json                    <- Virtual Try-on configuration
├── scraper.py                               <- Production-grade resilient API crawler
├── process_dataset.py                       <- Data cleaning, NLP parsing, & feature engineering pipeline
├── test_recommendation.py                   <- Example recommendation engine demonstrating search & suggestions
├── README.md                                <- Overview & quick-start guide
└── DATASET_DOCUMENTATION.md                 <- In-depth data dictionary, schema, and training code examples
```

---

## 📊 Features & Schema Summary

| Column Name | Type | Description |
| :--- | :--- | :--- |
| `product_id` | String | Unique MongoDB ObjectId identifier for the product |
| `name` | String | Cleaned, normalized product title |
| `brand` | String | Brand name (e.g. Plum, Minimalist, Faces Canada, Foxtale) |
| `category_l1` | String | Primary department (e.g. Skin, Makeup, Hair, Fragrance) |
| `category_l2` | String | Sub-category (e.g. Sun Care, Serums, Moisturizers) |
| `category_l3` | String | Granular sub-subcategory (e.g. Sunscreen, Gel, Night Cream) |
| `category_path` | String | Hierarchical path string (e.g. `Skin > Sun Care > Sunscreen`) |
| `skin_types` | List / String | Compatible skin types (`Oily`, `Dry`, `Combination`, `Sensitive`, `Normal`, `Acne Prone`) |
| `suitable_for_oily` | Boolean | Binary flag for oily skin filtering |
| `suitable_for_dry` | Boolean | Binary flag for dry skin filtering |
| `suitable_for_combination` | Boolean | Binary flag for combination skin filtering |
| `suitable_for_sensitive` | Boolean | Binary flag for sensitive skin filtering |
| `suitable_for_acne_prone` | Boolean | Binary flag for acne-prone skin filtering |
| `formulation` | String | Texture/delivery type (`Serum`, `Cream`, `Liquid`, `Gel`, `Foam`, etc.) |
| `price` | Float | Active selling price in INR (Rs.) |
| `mrp` | Float | Maximum Retail Price in INR (Rs.) |
| `discount_percent` | Float | Discount percentage applied |
| `avg_rating` | Float | Average customer rating (0.0 to 5.0) |
| `total_ratings` | Integer | Total customer reviews |
| `in_stock` | Boolean | Current inventory availability |
| `supports_vto` | Boolean | Virtual Try-on capability flag |
| `key_active_ingredients` | List | Extracted high-potency actives (Niacinamide, Salicylic Acid, Hyaluronic Acid, etc.) |
| `target_concerns` | List | Inferred primary skin concerns addressed |
| `recommendation_prompt` | String | Synthesized text representation engineered for embeddings & LLM context |
| `product_url` | String | Canonical URL on joyory.com |

---

## 🚀 Quick Start: Training a Recommendation Model

### 1. Vector Search / Embedding-based Retrieval
```python
import json
from sentence_transformers import SentenceTransformer
import numpy as np

# Load the clean recommendation corpus
model = SentenceTransformer('all-MiniLM-L6-v2')

corpus = []
with open('d:/JOYORY/dataset/clean/joyory_recommendation_corpus.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        corpus.append(json.loads(line))

texts = [doc['text_for_embedding'] for doc in corpus]
embeddings = model.encode(texts, show_progress_bar=True)

# Query: Suggest products for a customer
query = "I have oily skin and want a daily sunscreen that doesn't feel greasy"
q_emb = model.encode([query])

sims = np.dot(embeddings, q_emb.T).flatten()
top_idx = np.argsort(-sims)[:3]

print("Top Recommendations:")
for idx in top_idx:
    print(f"- {corpus[idx]['title']} ({corpus[idx]['brand']}) | Score: {sims[idx]:.3f}")
```

### 2. Multi-step Skincare Routine Regimen Suggestions
Use `joyory_routine_suggestions.json` to generate complete end-to-end regimens:
- Step 1: Cleanser
- Step 2: Toner / Essence
- Step 3: Targeted Treatment Serum
- Step 4: Moisturizer
- Step 5: Sunscreen (AM) / Night Recovery (PM)

---

## 📜 Legal & Ethical Notice
This dataset was collected from the publicly accessible live endpoints of Joyory (`joyory.com`) for research, machine learning model development, and educational purposes.
