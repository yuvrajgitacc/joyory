# ML Audit — SkinGenie vision section (Task 02)

Scope: `backend/agents/vision_agent.py`, `backend/models/*.onnx`,
`skin-tone-classifier`, `skintone.google` (Monk MST), `google-genai`
(Gemini 2.5 Flash). No existing features were removed; all changes are
fixes or additive keys/modules.

## Pretrained models in use

| Model | Source | Published performance | Notes |
|---|---|---|---|
| `skin_signals.onnx` (EfficientNet-B0, 4 heads: texture/hydration/sun/firmness) | [glowlytics-skin-models](https://huggingface.co/mufasabrownie/glowlytics-skin-models) | r 0.882–0.940, MAE ~4.5 pts; distilled from Claude Sonnet 4 labels on 4,717 UTKFace+FFHQ images | Weak (non-clinical) teacher labels = cosmetic indices only |
| `acne_detector.onnx` (YOLOv8s, 640px) | same repo | mAP50 0.473, mAP50-95 0.199, P 0.503 / R 0.486 (1,843 imgs, 18.7k boxes) | Moderate; needs threshold discipline |
| `stone` (skin-tone-classifier) | [SkinToneClassifier](https://github.com/ChenglongMa/SkinToneClassifier) (187★) | Heuristic face→k-means→palette match, PERLA/YADON/PRODER palettes | Was in requirements but never called |
| Monk MST scale | [skintone.google](https://skintone.google) | 10-tone fairness scale + MST-E (1,515 imgs) | Now used as tone target |
| Gemini 2.5 Flash | `google-genai` SDK | — | Enum-constrained cosmetic summary |

## Findings fixed by this audit

1. **Signals preprocessing ignored the model card** (divided by 255, no
   ImageNet normalize) → now Resize(256)→CenterCrop(224)→normalize, and
   handles both 0–1 and 0–100 outputs.
2. **Upstream `skin_signals.onnx` is unloadable** (references an external
   `.onnx.data` file absent from Hugging Face; verified locally and from
   the Hub cache). The loader now logs this explicitly and the pipeline
   uses documented heuristics until a fixed export lands. Re-export
   template: `backend/colab/Colab_T4_SkinDerm_Training.ipynb`.
3. **Acne threshold lied**: filtered at 0.38, reported 0.45. Now one
   constant `ACNE_CONF_THRESHOLD = 0.45` drives filtering, NMS
   (`ACNE_NMS_IOU = 0.45`), and the API field.
4. **Missing-detector fallback invented lesions** (`total_lesions: 3` with
   fake zones). Now reports zero + `"note": "model_unavailable"`.
5. **Tone was a center-crop luminance bucket** (no Type I, hardcoded Monk
   values). v1 kept for compatibility; new additive `skin_tone_v2`:
   Haar face crop → gray-world balance → YCrCb skin-mask average →
   nearest Monk swatch + ITA angle + optional `stone` cross-check.
6. OOD wording said "clinical"; corrected to cosmetic (product is
   explicitly non-medical).

## New: optional research-only derm signal (default OFF)

`backend/agents/derm_agent.py` — EfficientNet-B0 7-class (HAM10000:
akiec/bcc/bkl/df/mel/nv/vasc), enabled only with
`ENABLE_DERM_EXPERIMENTAL=1`. Without weights: `not_configured`.
Low-confidence or sensitive top-1 (mel/bcc): `uncertain_see_dermatologist`.
Always cosmetic wording + disclaimer. Train weights on Colab T4 with the
notebook below (realistic single-model balanced accuracy ~0.85).

## Train on Colab T4 (not locally)

1. Open `backend/colab/Colab_T4_SkinDerm_Training.ipynb` in Colab.
2. Runtime → Change runtime type → **T4 GPU**.
3. Run all: downloads HAM10000 (kagglehub), fine-tunes EfficientNet-B0,
   exports `derm_ham10000.pt` + self-contained `derm_ham10000.onnx`.
4. Copy to `backend/models/`, set `ENABLE_DERM_EXPERIMENTAL=1`.

## Verify locally (Python 3.11 via uv)

```powershell
uv sync
uv run python backend/scripts/evaluate_ml.py
uv run pytest backend/tests -q
uv run python backend/scripts/download_models.py
```

All product/recommendation features are untouched; new response keys are
`vision.skin_tone_v2`, `vision.derm_assessment`, and top-level
`derm_assessment`.
