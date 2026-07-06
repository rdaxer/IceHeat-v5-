# 🎬 VideoReel Pro

Professioneller Video-Reel-Generator für Windows. Lade ein Video, erkenne automatisch die
besten Szenen, füge Musik, Hook und Untertitel hinzu und exportiere fertig für
TikTok, Instagram oder YouTube.

Die komplette Anwendung liegt in **`reel/`** und läuft als Electron-Desktop-App
(Hauptprozess: `src/main/index.js`, lädt `reel/index.html`).

---

## Starten & Bauen (Windows)

Voraussetzung: [Node.js 18+](https://nodejs.org) und [Git](https://git-scm.com).

```cmd
npm install        REM einmalig – lädt Electron & electron-builder
npm start          REM App direkt starten und ansehen
npm run build      REM .exe erzeugen (Installer + Portable in dist\)
```

Ergebnis von `npm run build` im Ordner `dist\`:

- `VideoReel-Pro-1.0.0-Installer.exe` – Installer mit Setup-Assistent
- `VideoReel-Pro-1.0.0-Portable.exe` – portable Version (keine Installation)

Tipp: Ein Doppelklick auf **`build.cmd`** führt `npm install` + `npm run build`
automatisch aus.

---

## Funktionen

- **Upload** – Video, Musik und Bilder per Drag & Drop
- **Szenen-Analyse** – findet die besten Momente (Schärfe/Bewegung, läuft lokal)
- **Hook-Generator** – Vorlagen für Action, Comedy, Suspense, Educational, u. a.
- **Musik-Sync** – Schnitte an den Takt der Musik anlegen
- **Untertitel** – automatische Timings, editierbar
- **Export** – Plattform-Presets für TikTok (9:16), Instagram, YouTube

---

## Projektstruktur

```
VideoReel-Pro/
├── src/
│   ├── main/index.js     Electron-Hauptprozess (Fenster + Menü)
│   └── preload.js        sichere Bridge zum UI
├── reel/
│   ├── index.html        die eigentliche Anwendung (UI)
│   ├── js/               VideoManager, SceneAnalyzer, MusicSync,
│   │                     HookGenerator, ExportManager, SubtitleGenerator
│   └── api/              Bridges (Tools, Export, Filmora)
├── electron-builder.json Build-Konfiguration
├── package.json
└── build.cmd             1-Klick-Build für Windows
```

---

## Lizenz

MIT
