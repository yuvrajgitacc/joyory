import os
from pathlib import Path
from dotenv import load_dotenv

# Base paths
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
STATIC_DIR = BASE_DIR / "static"
PRODUCT_IMAGES_DIR = STATIC_DIR / "product_images"

# Ensure directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)
PRODUCT_IMAGES_DIR.mkdir(parents=True, exist_ok=True)

# Load environment variables
load_dotenv(BASE_DIR / ".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL_NAME = os.getenv("GEMINI_MODEL_NAME", "gemini-3.1-flash-lite")


# Model Paths
ONNX_SIGNALS_PATH = MODELS_DIR / "skin_signals.onnx"
ONNX_ACNE_PATH = MODELS_DIR / "acne_detector.onnx"

# Grok (xAI) API Configuration
GROK_API_KEY = os.getenv("GROK_API_KEY", "")
GROK_MODEL_NAME = os.getenv("GROK_MODEL_NAME", "grok-3-mini")

# Data Paths
PRODUCTS_FILE = DATA_DIR / "joyory_products.json"
DATASET_FILE = BASE_DIR.parent / "dataset" / "clean" / "joyory_products_clean.json"
INGREDIENT_RULES_FILE = DATA_DIR / "ingredient_rules.json"

