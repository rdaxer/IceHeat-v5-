# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development

No build step or package manager. Run locally with:
```bash
python3 -m http.server 8080
# → http://localhost:8080
```

Service Worker only activates on HTTPS or localhost. OpenCV.js loads asynchronously from CDN on first use (~5–10s).

## Deployment

Push to `main` → GitHub Actions automatically deploys to GitHub Pages (`.github/workflows/deploy.yml`). No manual step needed.

## Architecture

This is a **single-file PWA** — the entire application is `index.html` (~1800 lines). There is no framework, no bundler, and no dependencies installed locally. All external libraries (OpenCV.js, Tesseract.js, Google Fonts) load from CDN at runtime.

### Global State

All app state lives in a single `S` object (defined around line 550):
```js
let S = { eventName, eventSub, drivers[], heats[], selDriver, selHeat, overlayHeat, schemaSegments }
```

State is persisted to `localStorage` under key `iceheat_v5` via `saveToLS()` / `loadFromLS()`. The driver database (cross-event) uses a separate key `iceheat_driverdb`.

### Data Model

**Driver**: `{ id, nr, name, nation, photo }` — photo stored as base64 data URL. Max 20 drivers per event.

**Heat**: `{ id, label, type, slots[4], results[4] }` — `type` is `'vl'`|`'lc'`|`'sf'`|`'f'`. `slots` contains driver IDs indexed by gate (0–3). `results` contains placement codes per gate.

**Gate/Helmet colors** (always in this order):
- Gate 0: Red `#dc2626` — Innen
- Gate 1: Blue `#2563eb` — Mitte-Innen
- Gate 2: White `#f1f5f9` — Mitte-Außen
- Gate 3: Yellow `#eab308` — Außen

**Result codes**: `1`/`2`/`3` = placement (3/2/1 pts), `0` = 4th place (0 pts), `D`=DQ, `T`=false start, `M`=time DQ, `R`=retired, `F`=fall, `N`=DNS, `W`=warning. Score codes yield `null` points.

### UI Structure

Four pages (`showPage(name)`): `drivers`, `heats`, `results`, `overlay`. Pages are `<div id="page-*">` toggled via CSS class `active`. All rendering is imperative DOM injection via `innerHTML`.

Key render functions:
- `render()` — renders all views at once
- `renderDriverSidebar()` / `renderDriverEditor()` — Fahrer tab
- `renderHeatSidebar()` / `renderHeatEditor()` — Heats tab
- `renderResults()` — Vorläufe results table with auto-segmentation
- `renderOverlay()` / `buildResultDisplay(h, num)` — Anzeige tab preview

### YoloBox Fullscreen Overlay

`openHeatFullscreen()`, `openFullscreen()`, and `openResultsFullscreen()` open `window.open('', '_blank', 'width=1920,height=1080')` and write a complete HTML document inline. The overlay CSS is duplicated in the `OVERLAY_CSS` constant (around line 950) specifically for this purpose — changes to overlay styles must be made in **both** the `<style>` block in `<head>` and in `OVERLAY_CSS`.

### Dual Scanner

**Auto-Scan (OpenCV + Tesseract)**: `runOpenCVScan()` pipeline:
1. `segmentCells()` — adaptive threshold + morphological ops to find table grid cells
2. `classifyColorLAB()` — classifies each cell into red/blue/white/yellow in LAB color space
3. `buildHeatsFromCells()` — groups cells into rows/columns to reconstruct heat structure
4. `runOCRForHeats()` — Tesseract.js reads start numbers from each cell canvas
5. `convertCVResultToScanData()` — normalizes to `SCAN_DATA` format

**AI Scan (Claude Vision)**: `runClaudeVisionScan()` calls `https://api.anthropic.com/v1/messages` directly from the browser using model `claude-opus-4-5`. The API key is stored in `localStorage` under `iceheat_apikey`. The header `anthropic-dangerous-direct-browser-access: true` is required for browser-side CORS.

Both paths produce `SCAN_DATA` in the same format and feed into `applyScanResult()`.

### Results Table Segmentation

`renderResults()` uses `S.schemaSegments` (set by AI scan or manually) or falls back to `autoSegments()` which auto-groups heats into blocks of 5 with intermediate point columns. Segment types: `'heats'`, `'points'`, `'lc'`, `'place'`.
