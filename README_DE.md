# 🎬 VideoReel Pro v1.0.0

> **Professioneller Video-Reel-Generator für Windows 10+**  
> Automatische Szenerkennung, Musiksynchronisation, Hook-Generierung, Auto-Untertitel und Filmora-Integration für professionelle Videobearbeitung.

---

## ⚡ Schnellstart

### Option 1: Einfach bauen (Empfohlen)

**Windows Command Prompt (cmd.exe) öffnen und eingeben:**

```cmd
cd C:\Users\%USERNAME%
git clone https://github.com/rdaxer/IceHeat-v5-.git
cd IceHeat-v5-
git checkout claude/video-reel-generator-k50ypd
npm install
npm run build
```

Dann in `dist/` Ordner gehen und die `.exe` Datei doppelklicken.

---

### Option 2: Automatisches Script

**Doppelklick auf eine dieser Dateien im Repository:**
- `build.cmd` (für Command Prompt)
- `build.ps1` (für PowerShell)

Das macht alles automatisch! ✨

---

## ✨ Features

### 🎥 Intelligente Szenerkennung
- Automatische Detektion von hochwertigen Szenen mit optischem Fluss
- Schärfe-Scoring mit Laplacian-Varianz-Erkennung
- Bewegungsverfolgung für dynamische Inhalte
- Anpassbare Erkennungsempfindlichkeit

### 🎵 Musiksynchronisation
- BPM-Erkennung via spektrale Flux-Analyse
- Beat-aligned Videobearbeitung
- Automatische Schnittpunkt-Vorschläge
- Unterstützung für mehrere Audioformate

### 🎣 Automatische Hook-Generierung
- 6+ Hook-Vorlagen (Action, Comedy, Suspense, Educational, Lifestyle, Music)
- Plattformoptimierte Hooks (TikTok, Instagram, YouTube, Twitter)
- Nischen-spezifische Templates (Fitness, Kochen, Reisen, Tech, Beauty)
- KI-gestützte Hook-Vorschläge mit visuellen Effekten

### 📝 Auto-Untertitel-Generierung
- Sprache-zu-Text-Transkription (Tesseract.js)
- Automatische Beschriftungsgenerierung (SRT/WebVTT-Formate)
- Stichwort-Hervorhebung und Betonung
- Anpassbares Untertitel-Timing und Positionierung

### 🎨 Professionelle Videocodierung
- **Lokales FFmpeg** mit H.264, H.265 (HEVC), VP9 Codecs
- **Hardware-Beschleunigung:**
  - NVIDIA CUDA (GeForce RTX Serie)
  - Intel QuickSync (8. Generation Core+)
  - AMD DXVA2
- **Plattform-Optimierte Presets:**
  - TikTok (1080×1920, 3000k)
  - Instagram (1080×1350, 4000k)
  - YouTube Shorts (1080×1920, 60fps)
  - YouTube (1440×2560, 8000k)
  - Twitter/X (1200×675, 3000k)
  - 4K UHD (3840×2160, 15000k)

### 🎬 Filmora Professional Bridge
- **Automatische Erkennung** via Windows Registry
- **Direkte Integration** mit Wondershare Filmora 13.0+
- **Projekt-Export** mit vollständiger Metadaten-Beibehaltung
- **Nahtloser Workflow:** Bearbeite in Reel → Verfeinere in Filmora → Exportiere

### 🔄 Auto-Update-System
- **Automatische Prüfungen** alle 24 Stunden
- **Delta-Updates** - Download nur der Änderungen
- **Hintergrund-Downloads** - keine Unterbrechung
- **Gestaffelte Einführung** für Stabilität
- **Manuelle Kontrolle** über Menü → Hilfe

### 🪟 Windows-Integration
- **System Tray** mit Schnellzugriff und Kontextmenü
- **Dateiassoziationen** für .iceheat-Projektdateien
- **Start-Menü** Shortcuts und Integration
- **Kontextmenü** - "Mit IceHeat öffnen"
- **Native Windows** Menüs und Dialoge

---

## 📋 Systemanforderungen

### Minimum
- **Windows 10** (Build 1909 oder später)
- **4GB RAM**
- **2GB Speicherplatz**
- **Intel Core i5 / AMD Ryzen 5**

### Empfohlen
- **Windows 11**
- **8GB+ RAM**
- **SSD mit 5GB+ Speicher**
- **Intel Core i7 / AMD Ryzen 7**
- **GPU:** NVIDIA GeForce GTX 1650+ (für Hardware-Beschleunigung)

### Optional
- **NVIDIA CUDA Toolkit 12.0+** (für GPU-Encoding)
- **Intel Media Driver** (für QuickSync)
- **Wondershare Filmora 13.0+** (für erweiterte Bearbeitung)

---

## 🚀 Installation

### Von Installer
1. `npm run build` ausführen oder `build.cmd` doppelklicken
2. `dist/IceHeat Desktop-...-installer.exe` öffnen
3. Setup-Assistent folgen
4. Aus dem Start-Menü starten

### Portable Version
1. `dist/IceHeat Desktop-...-portable.exe` herunterladen
2. Direkt ausführen (keine Installation nötig)
3. USB-portabel

### Aus Source Code
```cmd
git clone https://github.com/rdaxer/IceHeat-v5-.git
cd IceHeat-v5-
npm install
npm start
```

---

## 🏗️ Technologie-Stack

| Layer | Technologie | Zweck |
|-------|-------------|--------|
| **Framework** | Electron 28 | Desktop-Wrapper |
| **Renderer** | HTML5/CSS3/JavaScript | UI & Web-Module |
| **Backend** | Node.js + IPC | Hauptprozess-Services |
| **Video** | FFmpeg 6.0+ | Encoding-Engine |
| **AI/CV** | OpenCV.js, Tesseract.js | Szenerkennung & OCR |
| **Audio** | Tone.js, Web Audio API | Musikanalyse |
| **Storage** | IndexedDB | Lokale Projektpersistenz |
| **Updates** | electron-updater | Auto-Update-System |

---

## 📁 Dateienstruktur

```
IceHeat-v5-/
├── src/main/
│   ├── index.js                 (Hauptprozess)
│   ├── preload.js              (Context Bridge)
│   ├── ipc/
│   │   └── handlers.js         (IPC-Handler)
│   └── services/
│       ├── UpdateService.js
│       ├── ToolsService.js
│       ├── FFmpegService.js
│       ├── FilmoraService.js
│       ├── SystemTrayService.js
│       └── FileAssociationService.js
├── reel/
│   ├── index.html              (Haupt-UI)
│   ├── js/                     (Web-Module)
│   │   ├── VideoManager.js
│   │   ├── SceneAnalyzer.js
│   │   ├── MusicSync.js
│   │   ├── HookGenerator.js
│   │   ├── ExportManager.js
│   │   └── SubtitleGenerator.js
│   └── api/                    (IPC-Bridges)
│       ├── update-api.js
│       ├── video-export-api.js
│       ├── filmora-export-api.js
│       └── tools-api.js
├── build/
│   ├── icons/                  (App-Icons)
│   └── installer-background.bmp
├── electron-builder.json       (Build-Konfiguration)
├── package.json
├── build.cmd                   (🎯 Einfach doppelklick!)
├── build.ps1                   (🎯 Oder das!)
└── BUILD_WINDOWS.md            (Detaillierte Anleitung)
```

---

## 🔧 Development

```bash
# Abhängigkeiten installieren
npm install

# Im Dev-Modus starten (mit DevTools)
npm start

# Bauen ohne Veröffentlichung
npm run build

# Bauen und zu GitHub veröffentlichen
npm run build:release

# Code-Qualität prüfen
npm run lint

# Tests ausführen
npm test
```

---

## 🧪 Workflow (Typischer 5-Minuten-Prozess)

```
1. Video hochladen
   ↓
2. Szenen automatisch erkennen (OpenCV)
   ↓
3. Musik hinzufügen & Beats synchronisieren
   ↓
4. Hook generieren (KI-Templates)
   ↓
5. Auto-Untertitel hinzufügen
   ↓
6. Für Plattform exportieren (H.264/H.265 + FFmpeg)
   ↓
7. (Optional) In Filmora polieren
   ↓
8. Zu TikTok/Instagram/YouTube teilen
```

---

## 📚 Dokumentation

| Datei | Beschreibung |
|-------|-------------|
| **[BUILD_WINDOWS.md](./BUILD_WINDOWS.md)** | Windows Build-Anleitung |
| **[BUILD_INSTRUCTIONS.md](./BUILD_INSTRUCTIONS.md)** | Detaillierte Entwickler-Anleitung |
| **[INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)** | Installation & Troubleshooting |
| **[RELEASE_NOTES.md](./RELEASE_NOTES.md)** | v1.0.0 Feature-Zusammenfassung |
| **[DESKTOP_APP_README.md](./DESKTOP_APP_README.md)** | Technische API-Referenz |
| **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** | Projekt-Status & Statistiken |

---

## 🐛 Probleme?

### App startet nicht?
→ Siehe [INSTALLATION_GUIDE.md - Troubleshooting](./INSTALLATION_GUIDE.md#troubleshooting)

### FFmpeg nicht gefunden?
→ Wird automatisch beim ersten Start heruntergeladen.  
→ Prüfe: `%APPDATA%\IceHeat\tools\ffmpeg\`

### GPU-Encoding nicht verfügbar?
→ NVIDIA CUDA / Intel Treiber installieren.  
→ Siehe Setup-Anleitung in [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md#post-installation-setup)

### Filmora nicht erkannt?
→ Muss Filmora 13.0+ sein.  
→ Prüfe [INSTALLATION_GUIDE.md - Filmora Integration](./INSTALLATION_GUIDE.md#2-install-filmora-integration-optional)

---

## 🔄 Updates

### Automatische Updates
- **Häufigkeit:** Alle 24 Stunden beim Start
- **Download:** Automatisch, keine Aktion nötig
- **Installation:** Beim nächsten Neustart
- **Manuelle Prüfung:** Menü → Hilfe → Auf Updates prüfen

### Update-Kanäle
- **Stable** (Standard): Produktionsversionen
- **Beta** (Optional): Vorabversionen
- **Dev** (Intern): Bleeding Edge

### Auto-Updates deaktivieren
Einstellungen → Updates → "Auto-update aktiviert" deaktivieren

---

## 🤝 Mitwirken

Wir freuen uns über Beiträge! So helfen Sie:

1. **Fork** das Repository
2. **Erstellen** Sie einen Feature Branch: `git checkout -b feature/amazing-feature`
3. **Commiten** Sie Änderungen: `git commit -m "feat: Erstaunliches Feature hinzugefügt"`
4. **Push** Branch: `git push origin feature/amazing-feature`
5. **Öffnen** Sie einen Pull Request

Bitte stellen Sie sicher:
- Tests bestehen: `npm test`
- Code ist gelint: `npm run lint`
- Commits haben klare Nachrichten
- Änderungen sind gut dokumentiert

---

## 🐛 Bug-Reports & Feature-Anfragen

Einen Fehler gefunden? Eine Idee? [Öffnen Sie ein Issue](https://github.com/rdaxer/IceHeat-v5-/issues)

**Bitte fügen Sie ein:**
- Windows-Version (`winver`)
- App-Version (Menü → Hilfe → Über)
- Schritte zum Reproduzieren
- Log-Datei: `%APPDATA%\IceHeat\logs\IceHeat.log`
- Systemspezifikationen (RAM, GPU, Prozessor)

---

## 📄 Lizenz

MIT License - Kostenlos für privaten und kommerziellen Gebrauch

Siehe [LICENSE](./LICENSE) für Details

---

## 🗺️ Roadmap

### v1.1.0 (Q3 2024)
- [ ] Cloud-Backup für Projekte
- [ ] Batch-Processing-Warteschlange
- [ ] Erweiterte Farbgrading
- [ ] Custom Watermark Designer
- [ ] Untertitel-Styling-Optionen

### v1.2.0 (Q4 2024)
- [ ] Mobile App Begleiter
- [ ] Team-Zusammenarbeit
- [ ] Erweiterte KI-Features
- [ ] Plugin-System
- [ ] Professionelle Zertifizierung

### v2.0.0 (2025)
- [ ] macOS Version
- [ ] Linux Version
- [ ] Web Version
- [ ] Erweiterte Analysen
- [ ] Enterprise-Features

---

## 📞 Support

- **Dokumentation:** [Docs](./INSTALLATION_GUIDE.md)
- **Issues:** [GitHub Issues](https://github.com/rdaxer/IceHeat-v5-/issues)
- **Wiki:** [GitHub Wiki](https://github.com/rdaxer/IceHeat-v5-/wiki)

---

## 🙏 Danksagungen

- **[Electron](https://www.electronjs.org/)** - Desktop Framework
- **[FFmpeg](https://ffmpeg.org/)** - Videoencoding
- **[electron-builder](https://www.electron.build/)** - Build & Packaging
- **[OpenCV.js](https://docs.opencv.org/master/d5/d10/tutorial_js_root.html)** - Computer Vision
- **[Tesseract.js](https://tesseract.projectnaptha.com/)** - OCR
- **[Tone.js](https://tonejs.github.io/)** - Audio-Analyse
- **[Wondershare Filmora](https://www.wondershare.com/filmora/)** - Professionelle Bearbeitung

---

<div align="center">

**Mit ❤️ für Content Creator gemacht**

[⬇️ Download](https://github.com/rdaxer/IceHeat-v5-/releases) · [📖 Docs](./BUILD_WINDOWS.md) · [🐛 Bug Report](https://github.com/rdaxer/IceHeat-v5-/issues) · [💡 Feature Request](https://github.com/rdaxer/IceHeat-v5-/issues)

</div>

---

**Status:** ✅ **FERTIG ZUM BAUEN**

*Viel Erfolg mit VideoReel Pro! 🎬*
