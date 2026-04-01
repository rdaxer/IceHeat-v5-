# ❄️ IceHeat v5 — Eisspeedway Heat Display

**Live:** https://rdaxer.github.io/iceheat-v4/ *(oder deine GitHub Pages URL)*

Professionelles Heat-Management & YoloBox-Overlay-System für Eisspeedway-Veranstaltungen.

---

## ✅ Features

### 🔬 Dualer Heatschema-Scanner
| Modus | Technologie | Kosten | Offline |
|-------|-------------|--------|---------|
| **Auto-Scan** | OpenCV.js + Tesseract.js | **Kostenlos** | ✅ Ja |
| **KI-Scan** | Claude Vision API | API-Key nötig | ❌ Nein |

**Auto-Scan (empfohlen):**
- Erkennt Tabellenraster via OpenCV Bildverarbeitung
- Klassifiziert Helmfarben (Rot/Blau/Weiß/Gelb) im LAB-Farbraum
- Liest Startnummern per Tesseract OCR offline aus
- Kein API-Key, keine Kosten, 100% datenschutzkonform

**KI-Scan (Fallback):**
- Claude Vision liest das komplette Schema inkl. Fahrernamen
- Höhere Erkennungsgenauigkeit bei schlechten Lichtverhältnissen
- Benötigt Anthropic API-Key

### 📊 Ergebnismanagement
- Fahrerverwaltung mit Foto-Upload (3:4 Format)
- Fahrerdatenbank (persistent via localStorage)
- Heat-Editor mit Gate-Zuweisung
- ⚡ Schnelleingabe-Modal (alle Heats nacheinander)
- 🎨 Helmfarben-Editor (Drag-to-fix Farben nach Scan)
- Ergebniscodes: 1./2./3./0 · D T M R F N W

### 📺 YoloBox / Vollbild-Anzeige
- **Übersichtstabelle** — alle Fahrer & Punkte, auto-skaliert auf 16:9
- **Heat-Anzeige** — 4 Fahrer mit Foto, Helmfarbe & Ergebnis
- Punktetabelle mit Zwischensegmenten (H1-H15 | Pkt | H16-H20 | Pkt ...)

### 📱 PWA — Installierbar als App
- Offline-fähig dank Service Worker
- Installierbar auf Android/iOS/Desktop
- Datei speichern (HTML mit eingebettetem State)
- JSON Import/Export

---

## 🚀 GitHub Pages Deployment

### Schritt 1: Repo aufsetzen
```bash
git clone https://github.com/DEIN-USERNAME/iceheat-v5.git
cd iceheat-v5
# Dateien aus diesem Paket kopieren
git add .
git commit -m "IceHeat v5 - initial"
git push origin main
```

### Schritt 2: GitHub Pages aktivieren
1. GitHub → Repo → **Settings** → **Pages**
2. Source: **GitHub Actions**
3. Beim nächsten Push wird automatisch deployed

### Schritt 3: Icons hinzufügen (optional)
Erstelle `icon-192.png` und `icon-512.png` für das PWA-Icon.

---

## 📁 Dateistruktur

```
iceheat-v5/
├── index.html          # Komplette App (Single-File)
├── manifest.json       # PWA Manifest
├── service-worker.js   # Offline-Cache
├── icon-192.png        # PWA Icon (192×192)
├── icon-512.png        # PWA Icon (512×512)
├── .github/
│   └── workflows/
│       └── deploy.yml  # Auto-Deploy zu GitHub Pages
└── README.md
```

---

## 🎮 Bedienung

### Scanner
1. Tab **Vorläufe** öffnen → **📷 Scan** klicken
2. **Auto-Scan** wählen (kein API-Key nötig)
3. Foto des Heatschemas aufnehmen
4. Warten bis OpenCV + OCR fertig
5. Ergebnis prüfen → **🎨 Farben** korrigieren falls nötig
6. **Alles ersetzen** oder **Hinzufügen**

### Ergebnis eingeben
1. **⚡ Ergebnis** → Heat auswählen → Platzierungen tippen
2. Oder im **Heats**-Tab einzeln eintragen

### YoloBox Ausgabe
- **📊 YoloBox** im Vorläufe-Tab → Übersichtstabelle (neues Fenster, 16:9)
- **Anzeige**-Tab → einzelne Heats Vollbild

---

## 🛠️ Lokale Entwicklung

```bash
# Einfacher HTTP-Server (Python)
python3 -m http.server 8080
# → http://localhost:8080
```

Service Worker funktioniert nur auf HTTPS oder localhost.

---

## 📄 Lizenz

MIT License — frei verwendbar und erweiterbar.
