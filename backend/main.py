import os
import io
import logging
from typing import Optional
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import STATIC_DIR, PRODUCTS_FILE, INGREDIENT_RULES_FILE
from agents.orchestrator import orchestrator
from agents.recommender_agent import recommender_agent
from agents.safety_agent import safety_agent
from agents.progress_agent import progress_agent

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("main")

app = FastAPI(
    title="SkinGenie — Joyory AI Skincare Engine",
    description="Multi-agent smart shopping & skincare retention pipeline for Joyory",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for local product images
if not os.path.exists(STATIC_DIR):
    os.makedirs(STATIC_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "SkinGenie API",
        "catalog_size": len(recommender_agent.products),
        "safety_rules_count": len(safety_agent.rules),
        "disclaimer": "Cosmetic skincare guidance only. Not a medical diagnostic system."
    }

@app.get("/api/products")
async def get_products():
    return {
        "products": recommender_agent.products,
        "total": len(recommender_agent.products)
    }

@app.get("/api/rules")
async def get_rules():
    return {
        "rules": safety_agent.rules,
        "mandatory_pairings": safety_agent.mandatory_pairings,
        "universal_safe": safety_agent.universal_safe
    }

@app.post("/api/analyze")
async def analyze_skin(
    file: UploadFile = File(...),
    session_id: Optional[str] = Form("demo_user_1"),
    budget: Optional[str] = Form("all"),
    skin_type: Optional[str] = Form(None),
    scan_mode: Optional[str] = Form("normal")
):
    try:
        contents = await file.read()
        if len(contents) < 500:
            raise HTTPException(status_code=400, detail="Uploaded file is empty or corrupted.")

        user_profile = {
            "session_id": session_id,
            "budget": budget,
            "skin_type": skin_type if skin_type and skin_type != "unknown" else None,
            "scan_mode": scan_mode
        }

        result = await orchestrator.run(image_bytes=contents, user_profile=user_profile)
        return result

    except Exception as e:
        logger.exception(f"Error during skin analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/progress/{session_id}")
async def get_progress(session_id: str):
    history = progress_agent.history.get(session_id, [])
    return {
        "session_id": session_id,
        "total_scans": len(history),
        "timeline": history
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
