import os
import subprocess

def create_html(theme="dark"):
    is_dark = theme == "dark"
    
    # Palette definitions
    bg_color = "#020617" if is_dark else "#F8FAFC"
    text_main = "#F8FAFC" if is_dark else "#0F172A"
    text_muted = "#94A3B8" if is_dark else "#475569"
    card_bg = "rgba(15, 23, 42, 0.85)" if is_dark else "rgba(255, 255, 255, 0.95)"
    card_border = "rgba(255, 255, 255, 0.12)" if is_dark else "rgba(148, 163, 184, 0.28)"
    card_shadow = "0 12px 36px rgba(0,0,0,0.45)" if is_dark else "0 8px 24px rgba(15, 23, 42, 0.08)"
    tag_bg = "rgba(255, 255, 255, 0.06)" if is_dark else "rgba(15, 23, 42, 0.05)"
    grid_glow = "rgba(244, 63, 94, 0.15)" if is_dark else "rgba(244, 63, 94, 0.08)"
    loop_line = "#F43F5E" if is_dark else "#E11D48"

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * {{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
  }}
  body {{
    width: 1920px;
    height: 1080px;
    background-color: {bg_color};
    color: {text_main};
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Inter', Roboto, sans-serif;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 38px 48px 32px 48px;
  }}
  
  /* Ambient Background Gradients */
  .ambient-glow {{
    position: absolute;
    border-radius: 50%;
    filter: blur(140px);
    pointer-events: none;
    z-index: 0;
  }}
  .glow-1 {{
    width: 600px;
    height: 350px;
    top: -50px;
    left: 80px;
    background: {grid_glow};
  }}
  .glow-2 {{
    width: 700px;
    height: 400px;
    bottom: -50px;
    right: 120px;
    background: {'rgba(14, 165, 233, 0.15)' if is_dark else 'rgba(14, 165, 233, 0.08)'};
  }}
  .glow-3 {{
    width: 500px;
    height: 300px;
    top: 300px;
    left: 50%;
    transform: translateX(-50%);
    background: {'rgba(139, 92, 246, 0.12)' if is_dark else 'rgba(139, 92, 246, 0.06)'};
  }}

  /* Content Wrapper */
  .content {{
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: space-between;
  }}

  /* Header Section */
  .header {{
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 18px;
    border-bottom: 1px solid {card_border};
  }}
  .header-left {{
    display: flex;
    flex-direction: column;
    gap: 6px;
  }}
  .brand-pill {{
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: {'rgba(244, 63, 94, 0.16)' if is_dark else 'rgba(244, 63, 94, 0.1)'};
    border: 1px solid {'rgba(244, 63, 94, 0.4)' if is_dark else 'rgba(244, 63, 94, 0.3)'};
    color: {'#FB7185' if is_dark else '#E11D48'};
    padding: 4px 14px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    width: fit-content;
  }}
  .brand-pill svg {{
    width: 14px;
    height: 14px;
    fill: currentColor;
  }}
  .title-row {{
    display: flex;
    align-items: baseline;
    gap: 14px;
  }}
  .main-title {{
    font-size: 32px;
    font-weight: 800;
    letter-spacing: -0.02em;
    background: {'linear-gradient(135deg, #FFFFFF 30%, #CBD5E1 100%)' if is_dark else 'linear-gradient(135deg, #0F172A 30%, #334155 100%)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }}
  .main-title span {{
    background: linear-gradient(135deg, #F43F5E 0%, #FB7185 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }}
  .sub-title {{
    font-size: 15px;
    color: {text_muted};
    font-weight: 500;
  }}
  .header-right {{
    display: flex;
    align-items: center;
    gap: 16px;
  }}
  .hackathon-badge {{
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
  }}
  .hackathon-title {{
    font-size: 13px;
    font-weight: 700;
    color: {'#38BDF8' if is_dark else '#0284C7'};
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }}
  .hackathon-sub {{
    font-size: 12px;
    color: {text_muted};
  }}
  .loop-badge {{
    background: {'rgba(16, 185, 129, 0.15)' if is_dark else 'rgba(16, 185, 129, 0.12)'};
    border: 1px solid {'rgba(16, 185, 129, 0.35)' if is_dark else 'rgba(16, 185, 129, 0.3)'};
    color: {'#34D399' if is_dark else '#059669'};
    padding: 8px 16px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
  }}

  /* Pipeline Columns Container (6 Core Stages) */
  .pipeline-grid {{
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 18px;
    margin: 20px 0 16px 0;
    position: relative;
  }}

  /* Individual Stage Card */
  .stage-card {{
    background: {card_bg};
    border: 1px solid {card_border};
    border-radius: 16px;
    box-shadow: {card_shadow};
    display: flex;
    flex-direction: column;
    position: relative;
    backdrop-filter: blur(16px);
  }}

  /* Card Top Accent Strip */
  .stage-accent {{
    height: 4px;
    width: 100%;
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
  }}
  .accent-1 {{ background: linear-gradient(90deg, #0284C7, #38BDF8); }}
  .accent-2 {{ background: linear-gradient(90deg, #F43F5E, #FB7185); }}
  .accent-3 {{ background: linear-gradient(90deg, #8B5CF6, #C084FC); }}
  .accent-4 {{ background: linear-gradient(90deg, #F59E0B, #FBBF24); }}
  .accent-5 {{ background: linear-gradient(90deg, #10B981, #34D399); }}
  .accent-6 {{ background: linear-gradient(90deg, #EC4899, #F43F5E); }}

  .card-body {{
    padding: 18px 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
    justify-content: space-between;
  }}

  /* Stage Header */
  .stage-meta {{
    display: flex;
    align-items: center;
    justify-content: space-between;
  }}
  .stage-number {{
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 3px 8px;
    border-radius: 6px;
  }}
  .num-1 {{ background: rgba(56, 189, 248, 0.15); color: #38BDF8; }}
  .num-2 {{ background: rgba(244, 63, 94, 0.15); color: #F43F5E; }}
  .num-3 {{ background: rgba(139, 92, 246, 0.15); color: #A78BFA; }}
  .num-4 {{ background: rgba(245, 158, 11, 0.15); color: #FBBF24; }}
  .num-5 {{ background: rgba(16, 185, 129, 0.15); color: #34D399; }}
  .num-6 {{ background: rgba(236, 72, 153, 0.15); color: #F472B6; }}

  .agent-chip {{
    font-size: 11px;
    font-weight: 600;
    color: {text_muted};
    background: {tag_bg};
    padding: 2px 7px;
    border-radius: 4px;
    border: 1px solid {card_border};
  }}

  .stage-name {{
    font-size: 17px;
    font-weight: 700;
    line-height: 1.25;
    color: {text_main};
    margin-top: 2px;
  }}
  .stage-role {{
    font-size: 12px;
    color: {text_muted};
    line-height: 1.35;
  }}

  /* Feature / Operations Box */
  .ops-list {{
    display: flex;
    flex-direction: column;
    gap: 7px;
  }}
  .op-item {{
    display: flex;
    align-items: flex-start;
    gap: 8px;
    background: {tag_bg};
    padding: 7px 10px;
    border-radius: 8px;
    border: 1px solid {'rgba(255, 255, 255, 0.04)' if is_dark else 'rgba(0,0,0,0.04)'};
  }}
  .op-icon {{
    width: 14px;
    height: 14px;
    margin-top: 2px;
    flex-shrink: 0;
  }}
  .op-text {{
    font-size: 12px;
    line-height: 1.35;
    font-weight: 500;
  }}
  .op-text b {{
    color: {text_main};
    font-weight: 600;
  }}
  .op-text span {{
    color: {text_muted};
    display: block;
    font-size: 11px;
    margin-top: 1px;
  }}

  /* Highlights / Output Footer */
  .card-footer {{
    background: {'rgba(0, 0, 0, 0.25)' if is_dark else 'rgba(241, 245, 249, 0.7)'};
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px dashed {card_border};
    display: flex;
    flex-direction: column;
    gap: 4px;
  }}
  .footer-label {{
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: {text_muted};
  }}
  .footer-val {{
    font-size: 12px;
    font-weight: 600;
    color: {text_main};
    display: flex;
    align-items: center;
    gap: 6px;
  }}

  /* Connecting Highway Arrows between Cards */
  .connector-arrow {{
    position: absolute;
    top: 50%;
    right: -14px;
    transform: translateY(-50%);
    width: 26px;
    height: 26px;
    background: {'#0F172A' if is_dark else '#FFFFFF'};
    border: 1.5px solid {'#F43F5E' if is_dark else '#E11D48'};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    color: {'#FB7185' if is_dark else '#E11D48'};
    box-shadow: {'0 0 14px rgba(244, 63, 94, 0.45)' if is_dark else '0 2px 8px rgba(225, 29, 72, 0.25)'};
  }}
  .connector-arrow svg {{
    width: 14px;
    height: 14px;
    stroke: currentColor;
    stroke-width: 2.5;
  }}

  /* Retention Feedback Loop Banner (Bottom of Pipeline) */
  .loop-banner {{
    background: {'linear-gradient(90deg, rgba(244,63,94,0.12) 0%, rgba(139,92,246,0.12) 50%, rgba(16,185,129,0.12) 100%)' if is_dark else 'linear-gradient(90deg, rgba(244,63,94,0.08) 0%, rgba(139,92,246,0.08) 50%, rgba(16,185,129,0.08) 100%)'};
    border: 1px solid {'rgba(244, 63, 94, 0.35)' if is_dark else 'rgba(244, 63, 94, 0.25)'};
    border-radius: 12px;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    position: relative;
    overflow: hidden;
  }}
  .loop-left {{
    display: flex;
    align-items: center;
    gap: 14px;
  }}
  .loop-icon-box {{
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: linear-gradient(135deg, #F43F5E, #8B5CF6);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFFFFF;
    flex-shrink: 0;
  }}
  .loop-icon-box svg {{
    width: 20px;
    height: 20px;
    stroke: currentColor;
    stroke-width: 2;
  }}
  .loop-text-title {{
    font-size: 14px;
    font-weight: 700;
    color: {text_main};
  }}
  .loop-text-desc {{
    font-size: 12.5px;
    color: {text_muted};
  }}
  .loop-steps {{
    display: flex;
    align-items: center;
    gap: 12px;
  }}
  .loop-pill {{
    background: {'rgba(15, 23, 42, 0.8)' if is_dark else 'rgba(255, 255, 255, 0.9)'};
    border: 1px solid {card_border};
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    color: {text_main};
  }}
  .loop-arrow-svg {{
    color: {loop_line};
    width: 16px;
    height: 16px;
  }}

  /* Bottom Impact & Architecture Bar */
  .footer-metrics-bar {{
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
    gap: 16px;
  }}
  .metric-card {{
    background: {card_bg};
    border: 1px solid {card_border};
    border-radius: 12px;
    padding: 12px 18px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }}
  .tech-stack-title {{
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    color: {text_muted};
    letter-spacing: 0.06em;
    margin-bottom: 5px;
  }}
  .tech-tags {{
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }}
  .tech-badge {{
    background: {tag_bg};
    border: 1px solid {card_border};
    padding: 3px 8px;
    border-radius: 5px;
    font-size: 11px;
    font-weight: 600;
    color: {text_main};
  }}

  .stat-card {{
    text-align: center;
  }}
  .stat-val {{
    font-size: 24px;
    font-weight: 800;
    line-height: 1.1;
    background: linear-gradient(135deg, #F43F5E, #38BDF8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }}
  .stat-green {{
    background: linear-gradient(135deg, #10B981, #34D399);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }}
  .stat-purple {{
    background: linear-gradient(135deg, #8B5CF6, #C084FC);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }}
  .stat-amber {{
    background: linear-gradient(135deg, #F59E0B, #FBBF24);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }}
  .stat-lbl {{
    font-size: 11.5px;
    font-weight: 600;
    color: {text_muted};
    margin-top: 3px;
  }}
</style>
</head>
<body>

  <!-- Ambient Glow Effects -->
  <div class="ambient-glow glow-1"></div>
  <div class="ambient-glow glow-2"></div>
  <div class="ambient-glow glow-3"></div>

  <div class="content">

    <!-- HEADER -->
    <div class="header">
      <div class="header-left">
        <div class="brand-pill">
          <svg viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
          Joyory AI Beauty Concierge · SkinGenie
        </div>
        <div class="title-row">
          <h1 class="main-title">End-to-End System <span>Workflow Architecture</span></h1>
          <span class="sub-title">From 10s Visual Diagnosis to Pharmacological Safety & Automated Reorder Loop</span>
        </div>
      </div>

      <div class="header-right">
        <div class="hackathon-badge">
          <span class="hackathon-title">B.Tech Hackathon 2026 · Task 02</span>
          <span class="hackathon-sub">Smart Shopping Experience Deliverable</span>
        </div>
        <div class="loop-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/></svg>
          Self-Sustaining Growth Loop
        </div>
      </div>
    </div>

    <!-- 6-STAGE PIPELINE GRID -->
    <div class="pipeline-grid">

      <!-- STAGE 1: Ingestion & Guardrails -->
      <div class="stage-card">
        <div class="stage-accent accent-1"></div>
        <div class="card-body">
          <div>
            <div class="stage-meta">
              <span class="stage-number num-1">STAGE 01</span>
              <span class="agent-chip">Client & Gate</span>
            </div>
            <h3 class="stage-name">Capture & Guardrail</h3>
            <p class="stage-role">Image intake & Out-of-Distribution rejection</p>
          </div>

          <div class="ops-list">
            <div class="op-item">
              <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
              <div class="op-text"><b>Capture Modes:</b><span>Standard Neural or Advance Multimodal scan</span></div>
            </div>
            <div class="op-item">
              <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <div class="op-text"><b>Two-Tier OOD Gate:</b><span>Rejects plants, pets & non-human selfies</span></div>
            </div>
            <div class="op-item">
              <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 14.14 14.14"/></svg>
              <div class="op-text"><b>Tone Calibration:</b><span>Monk Tone (MST 1-10) for Indian complexions</span></div>
            </div>
          </div>

          <div class="card-footer">
            <span class="footer-label">Verified Input Contract</span>
            <span class="footer-val">Validated Raw Face Buffer</span>
          </div>
        </div>
        <div class="connector-arrow">
          <svg viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6"/></svg>
        </div>
      </div>

      <!-- STAGE 2: Vision & Biomarkers -->
      <div class="stage-card">
        <div class="stage-accent accent-2"></div>
        <div class="card-body">
          <div>
            <div class="stage-meta">
              <span class="stage-number num-2">STAGE 02</span>
              <span class="agent-chip">Vision Agent</span>
            </div>
            <h3 class="stage-name">Biomarker Extraction</h3>
            <p class="stage-role">Zero-temp multimodal & ONNX inference</p>
          </div>

          <div class="ops-list">
            <div class="op-item">
              <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M2 12h3M19 12h3M12 2v3M12 19v3"/></svg>
              <div class="op-text"><b>Gemini 3.1 Flash-Lite:</b><span>Deep facial feature extraction</span></div>
            </div>
            <div class="op-item">
              <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              <div class="op-text"><b>Quantitative 0-100:</b><span>Hydration, Sebum, Redness & Lesion density</span></div>
            </div>
            <div class="op-item">
              <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
              <div class="op-text"><b>Term Sanitizer:</b><span>Clinical to cosmetic compliant terms</span></div>
            </div>
          </div>

          <div class="card-footer">
            <span class="footer-label">Vision Output Telemetry</span>
            <span class="footer-val">Calibrated 0-100 Skin Metrics</span>
          </div>
        </div>
        <div class="connector-arrow">
          <svg viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6"/></svg>
        </div>
      </div>

      <!-- STAGE 3: Gemini Narrator -->
      <div class="stage-card">
        <div class="stage-accent accent-3"></div>
        <div class="card-body">
          <div>
            <div class="stage-meta">
              <span class="stage-number num-3">STAGE 03</span>
              <span class="agent-chip">Narrator Agent</span>
            </div>
            <h3 class="stage-name">Empathetic Diagnosis</h3>
            <p class="stage-role">Translates cold telemetry into trust</p>
          </div>

          <div class="ops-list">
            <div class="op-item">
              <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <div class="op-text"><b>Natural Overview:</b><span>Warm, conversational skin condition explanation</span></div>
            </div>
            <div class="op-item">
              <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/></svg>
              <div class="op-text"><b>Consumer Friendly:</b><span>Removes intimidating medical jargon</span></div>
            </div>
            <div class="op-item">
              <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" stroke-width="2"><path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>
              <div class="op-text"><b>Psychological Buy-in:</b><span>Validates concerns & sets realistic goals</span></div>
            </div>
          </div>

          <div class="card-footer">
            <span class="footer-label">Narrative Contract</span>
            <span class="footer-val">Empathetic Skin Overview</span>
          </div>
        </div>
        <div class="connector-arrow">
          <svg viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6"/></svg>
        </div>
      </div>

      <!-- STAGE 4: Catalog & Grok Recommender -->
      <div class="stage-card">
        <div class="stage-accent accent-4"></div>
        <div class="card-body">
          <div>
            <div class="stage-meta">
              <span class="stage-number num-4">STAGE 04</span>
              <span class="agent-chip">Recommender</span>
            </div>
            <h3 class="stage-name">Catalog Intelligence</h3>
            <p class="stage-role">680+ Joyory SKUs & Grok ingredient match</p>
          </div>

          <div class="ops-list">
            <div class="op-item">
              <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
              <div class="op-text"><b>Storefront Catalog:</b><span>Foxtale, Plum, Minimalist, Dr. Sheth's</span></div>
            </div>
            <div class="op-item">
              <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <div class="op-text"><b>Budget Aware:</b><span>Filters for Student vs Premium regimes</span></div>
            </div>
            <div class="op-item">
              <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
              <div class="op-text"><b>Grok Rationale:</b><span>Scientific 'Why Recommended' per active</span></div>
            </div>
          </div>

          <div class="card-footer">
            <span class="footer-label">Candidate Products</span>
            <span class="footer-val">Shortlisted Joyory SKUs</span>
          </div>
        </div>
        <div class="connector-arrow">
          <svg viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6"/></svg>
        </div>
      </div>

      <!-- STAGE 5: Deterministic Safety Engine -->
      <div class="stage-card">
        <div class="stage-accent accent-5"></div>
        <div class="card-body">
          <div>
            <div class="stage-meta">
              <span class="stage-number num-5">STAGE 05</span>
              <span class="agent-chip">Safety Agent</span>
            </div>
            <h3 class="stage-name">Active Safety Shield</h3>
            <p class="stage-role">Zero-hallucination pharmacological matrix</p>
          </div>

          <div class="ops-list">
            <div class="op-item">
              <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="#34D399" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <div class="op-text"><b>O(1) Rules Matrix:</b><span>Deterministic INCI chemical clash check</span></div>
            </div>
            <div class="op-item">
              <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="#34D399" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <div class="op-text"><b>4-Tier Verdict:</b><span>SAFE · CAUTION · SEPARATE · AVOID</span></div>
            </div>
            <div class="op-item">
              <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="#34D399" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
              <div class="op-text"><b>Conflict Isolation:</b><span>Separates Retinol, Vitamin C & AHA/BHAs</span></div>
            </div>
          </div>

          <div class="card-footer">
            <span class="footer-label">Safety Guarantee</span>
            <span class="footer-val">100% Barrier-Safe Bundle</span>
          </div>
        </div>
        <div class="connector-arrow">
          <svg viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6"/></svg>
        </div>
      </div>

      <!-- STAGE 6: Regimen Sequencing & Cart -->
      <div class="stage-card">
        <div class="stage-accent accent-6"></div>
        <div class="card-body">
          <div>
            <div class="stage-meta">
              <span class="stage-number num-6">STAGE 06</span>
              <span class="agent-chip">Routine Agent</span>
            </div>
            <h3 class="stage-name">Regimen & Checkout</h3>
            <p class="stage-role">Diurnal scheduling & 1-click cart bundle</p>
          </div>

          <div class="ops-list">
            <div class="op-item">
              <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="#F472B6" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>
              <div class="op-text"><b>AM Shield Plan:</b><span>Gentle Cleanse ➔ Vit C ➔ SPF 50 Barrier</span></div>
            </div>
            <div class="op-item">
              <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="#F472B6" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              <div class="op-text"><b>PM Repair Plan:</b><span>Double Cleanse ➔ Active Retinol ➔ Ceramide</span></div>
            </div>
            <div class="op-item">
              <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="#F472B6" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              <div class="op-text"><b>1-Click Basket:</b><span>Adds full routine to cart (+42% AOV)</span></div>
            </div>
          </div>

          <div class="card-footer">
            <span class="footer-label">Delivered Regimen</span>
            <span class="footer-val">Daily AM / PM Action Plan</span>
          </div>
        </div>
      </div>

    </div>

    <!-- RETENTION & PROGRESS HABIT LOOP (CONNECTING STAGE 6 BACK TO STAGE 1) -->
    <div class="loop-banner">
      <div class="loop-left">
        <div class="loop-icon-box">
          <svg viewBox="0 0 24 24" fill="none"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/></svg>
        </div>
        <div>
          <div class="loop-text-title">Continuous Retention & Longitudinal Re-Scan Loop (The Habit Loop)</div>
          <div class="loop-text-desc">Converts single-purchase transactions into recurring LTV through formula depletion triggers and bi-weekly diagnostic updates.</div>
        </div>
      </div>

      <div class="loop-steps">
        <div class="loop-pill">
          <span>📦 Step Dosage Modeling (30ml = ~45 Days)</span>
        </div>
        <svg class="loop-arrow-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        <div class="loop-pill">
          <span>💬 Day 38: WhatsApp Auto Replenishment</span>
        </div>
        <svg class="loop-arrow-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        <div class="loop-pill">
          <span>📸 Day 14/30: Progress Re-Scan (Loops to Stage 01)</span>
        </div>
      </div>
    </div>

    <!-- FOOTER: ARCHITECTURE STACK & IMPACT KPIS -->
    <div class="footer-metrics-bar">
      
      <!-- Tech Stack -->
      <div class="metric-card">
        <div class="tech-stack-title">Underlying Engineering & Production Stack</div>
        <div class="tech-tags">
          <span class="tech-badge">FastAPI (Python 3.11)</span>
          <span class="tech-badge">React 18 + Vite</span>
          <span class="tech-badge">Gemini 3.1 Flash-Lite</span>
          <span class="tech-badge">Groq Llama 3.3</span>
          <span class="tech-badge">ONNX YOLOv8</span>
          <span class="tech-badge">680+ Joyory SKUs</span>
          <span class="tech-badge">WhatsApp Cloud API</span>
        </div>
      </div>

      <!-- KPI 1 -->
      <div class="metric-card stat-card">
        <div class="stat-val">&lt; 1.8s</div>
        <div class="stat-lbl">End-to-End Pipeline Latency</div>
      </div>

      <!-- KPI 2 -->
      <div class="metric-card stat-card">
        <div class="stat-val stat-green">100% Safe</div>
        <div class="stat-lbl">Deterministic Active Clash Shield</div>
      </div>

      <!-- KPI 3 -->
      <div class="metric-card stat-card">
        <div class="stat-val stat-purple">+50% AOV</div>
        <div class="stat-lbl">₹520 → ₹780 Basket Size Expansion</div>
      </div>

      <!-- KPI 4 -->
      <div class="metric-card stat-card">
        <div class="stat-val stat-amber">3.26x LTV</div>
        <div class="stat-lbl">12-Mo Customer Lifetime Value</div>
      </div>

    </div>

  </div>

</body>
</html>
"""
    return html

def render_image(html_content, output_png):
    temp_html = output_png.replace(".png", "_temp.html")
    with open(temp_html, "w", encoding="utf-8") as f:
        f.write(html_content)
    
    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    
    # 2x scale on 1920x1080 produces a 3840x2160 4K Ultra-HD image
    cmd = [
        edge_path,
        "--headless",
        "--disable-gpu",
        "--no-sandbox",
        "--hide-scrollbars",
        "--window-size=1920,1080",
        "--force-device-scale-factor=2",
        f"--screenshot={os.path.abspath(output_png)}",
        f"file:///{os.path.abspath(temp_html).replace(os.sep, '/')}"
    ]
    print(f"Rendering {output_png}...")
    subprocess.run(cmd, check=True)
    
    if os.path.exists(temp_html):
        os.remove(temp_html)
        
    print(f"Successfully rendered: {output_png} (Size: {os.path.getsize(output_png):,} bytes)")

if __name__ == "__main__":
    dark_html = create_html(theme="dark")
    render_image(dark_html, "joyory_workflow_dark.png")
    
    light_html = create_html(theme="light")
    render_image(light_html, "joyory_workflow_light.png")
