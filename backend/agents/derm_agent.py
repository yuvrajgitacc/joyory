"""Optional research-only dermoscopic pattern classifier (default OFF).

This module is an *additive, experimental* extension for the hackathon's
"detect color and condition" goal. It NEVER replaces the cosmetic-only
pipeline and NEVER issues diagnoses:

- Disabled unless ``ENABLE_DERM_EXPERIMENTAL=1`` is set (see config.py).
- Without trained weights it returns ``status: "not_configured"`` and the
  pipeline continues exactly as before.
- With weights (trained on Colab T4 via backend/colab/, HAM10000 7-class),
  it returns top-k cosmetic-pattern candidates with confidence scores and
  always routes low-confidence or sensitive predictions to
  ``"uncertain_see_dermatologist"`` with a non-medical disclaimer.

Intended weights: EfficientNet-B0 fine-tuned on HAM10000
(akiec, bcc, bkl, df, mel, nv, vasc). Realistic single-model balanced
accuracy is ~0.85; this is a shopping-assistant signal, not a medical
device. Any product mapping downstream must stay cosmetic.
"""

import io
import logging
import os
from typing import Any, Dict, List, Optional

from PIL import Image

logger = logging.getLogger("derm_agent")

HAM10000_CLASSES = ["akiec", "bcc", "bkl", "df", "mel", "nv", "vasc"]

# Human-readable cosmetic labels (deliberately non-diagnostic wording).
COSMETIC_LABELS = {
    "akiec": "Rough / sun-exposed patches (cosmetic pattern)",
    "bcc": "Pearly / translucent area (needs professional check)",
    "bkl": "Benign-looking keratotic pattern",
    "df": "Firm small bump pattern",
    "mel": "Dark pigmented pattern (needs professional check)",
    "nv": "Mole-like pattern",
    "vasc": "Reddish vascular-looking pattern",
}

# Classes that must always trigger a professional-check note.
SENSITIVE_CLASSES = {"mel", "bcc"}

DISCLAIMER = (
    "Research-only cosmetic pattern signal. Not a medical diagnosis. "
    "Consult a qualified dermatologist for any concerning skin change."
)


class DermAgent:
    """Gated wrapper around an optional HAM10000 classifier."""

    def __init__(
        self,
        enabled: Optional[bool] = None,
        model_path: Optional[str] = None,
        hf_model_id: Optional[str] = None,
    ):
        self.enabled = (
            os.getenv("ENABLE_DERM_EXPERIMENTAL", "0") == "1"
            if enabled is None
            else enabled
        )
        self.model_path = model_path or os.getenv("DERM_MODEL_PATH", "") or None
        self.hf_model_id = (
            hf_model_id or os.getenv("DERM_HF_MODEL_ID", "") or None
        )
        self._model = None
        self._weights_key: Optional[str] = None

    def _resolve_weights(self) -> Optional[str]:
        """Return a local weights path, downloading from HF hub if configured."""
        if self.model_path and os.path.exists(self.model_path):
            return self.model_path
        if self.hf_model_id:
            try:
                from huggingface_hub import hf_hub_download

                return hf_hub_download(self.hf_model_id, "derm_ham10000.pt")
            except Exception as e:
                logger.warning(f"derm weights download note: {e}")
        return None

    def _load_model(self, weights_path: str):
        """Lazy-load EfficientNet-B0 with a 7-class head (cached per path)."""
        if self._model is not None and self._weights_key == weights_path:
            return self._model
        import torch
        from torchvision import models

        model = models.efficientnet_b0(weights=None)
        model.classifier[1] = torch.nn.Linear(model.classifier[1].in_features, 7)
        state = torch.load(weights_path, map_location="cpu")
        if isinstance(state, dict) and "state_dict" in state:
            state = state["state_dict"]
        model.load_state_dict(state, strict=False)
        model.eval()
        self._model = model
        self._weights_key = weights_path
        return model

    async def assess(self, image_bytes: bytes, top_k: int = 3) -> Dict[str, Any]:
        """Return gated derm assessment dict (never raises)."""
        if not self.enabled:
            return {"enabled": False, "disclaimer": DISCLAIMER}
        weights = self._resolve_weights()
        if not weights:
            return {
                "enabled": True,
                "status": "not_configured",
                "message": (
                    "Derm weights not present. Train on Colab T4 with "
                    "backend/colab/Colab_T4_SkinDerm_Training.ipynb, place "
                    "weights at DERM_MODEL_PATH, and retry."
                ),
                "disclaimer": DISCLAIMER,
            }
        try:
            import numpy as np
            import torch
            from torchvision import transforms

            pil = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            tfm = transforms.Compose(
                [
                    transforms.Resize((256, 256)),
                    transforms.CenterCrop(224),
                    transforms.ToTensor(),
                    transforms.Normalize(
                        [0.485, 0.456, 0.406], [0.229, 0.224, 0.225]
                    ),
                ]
            )
            model = self._load_model(weights)
            with torch.no_grad():
                logits = model(tfm(pil).unsqueeze(0))[0]
                probs = torch.softmax(logits, dim=0).cpu().numpy()
            order = np.argsort(-probs)[: max(1, min(top_k, 7))]
            candidates: List[Dict[str, Any]] = [
                {
                    "class": HAM10000_CLASSES[i],
                    "cosmetic_label": COSMETIC_LABELS[HAM10000_CLASSES[i]],
                    "confidence": round(float(probs[i]), 3),
                }
                for i in order
            ]
            top1 = candidates[0]
            needs_pro = (
                top1["class"] in SENSITIVE_CLASSES or top1["confidence"] < 0.5
            )
            return {
                "enabled": True,
                "status": "success",
                "top_candidates": candidates,
                "recommendation": (
                    "uncertain_see_dermatologist"
                    if needs_pro
                    else "cosmetic_followup"
                ),
                "professional_check_advised": needs_pro,
                "disclaimer": DISCLAIMER,
            }
        except Exception as e:
            logger.warning(f"derm assess note: {e}")
            return {
                "enabled": True,
                "status": "error",
                "message": str(e),
                "disclaimer": DISCLAIMER,
            }


derm_agent = DermAgent()
