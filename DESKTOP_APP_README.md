# IceHeat Desktop - Professionelle Windows-Anwendung

Eine vollständige Electron-basierte Desktop-Anwendung für professionelle Video-Reel-Generierung und Eisspeedway-Management mit Filmora-Integration.

## 🎯 Features

### ✅ Implementiert (Phase 1-2)
- **Electron Framework** - Vollständige Desktop-Integration
- **Windows Installer** - NSIS-basierter Installer (.exe + Portable)
- **Auto-Update System** - Automatische Updates über GitHub Releases
- **Filmora-Integration** - Registry-Detection & Launch
- **Pro-Tools Services** - FFmpeg, ImageMagick, MediaInfo
- **IPC Bridge** - Sichere Kommunikation zwischen Main/Renderer Process
- **Menu Integration** - Windows-native Menus & Shortcuts

### 🔄 In Entwicklung (Phase 3-5)
- **Local FFmpeg Encoding** - Schneller Video-Export
- **GPU Acceleration** - NVIDIA CUDA & Intel QuickSync
- **Advanced Filmora Bridge** - Project Export/Import
- **Tool Auto-Update** - Separate Update für FFmpeg, ImageMagick
- **System Tray** - Taskbar-Integration
- **Drag-Drop UI** - Native Drag-Drop in Explorer

## 📦 Installation & Setup

### Voraussetzungen
- Windows 10 oder neuer (x64)
- Node.js 18+ (für Development)
- Git
- (Optional) Visual Studio Build Tools für Native Modules

### Entwicklungs-Setup

```bash
# Repository klonen
git clone https://github.com/rdaxer/IceHeat-v5-.git
cd IceHeat-v5-

# Dependencies installieren
npm install

# App starten (Development Mode)
npm start

# Oder mit Dev-Tools:
npm run dev
```

### Windows Installer erstellen

```bash
# Standalone Installer (.exe)
npm run build

# Oder mit automatischem Release zu GitHub:
npm run build:release
```

Der Installer wird in `dist/` erstellt:
- `IceHeat Desktop-1.0.0-Setup.exe` - NSIS Installer
- `IceHeat Desktop-1.0.0-Portable.exe` - Portable Version

## 🎬 Projektstruktur

```
IceHeat-v5-/
├── src/main/
│   ├── index.js                  # Main Process Entry
│   ├── services/
│   │   ├── FilmoraService.js     # Filmora Integration
│   │   └── ToolsService.js       # Pro-Tools (FFmpeg, etc)
│   └── ipc/                      # IPC Handlers (später)
│
├── reel/                         # Reel Generator Web App
│   ├── index.html
│   ├── js/                       # Module (VideoManager, etc)
│   └── api/
│       ├── filmora-api.js        # Renderer Bridge für Filmora
│       └── tools-api.js          # Renderer Bridge für Tools
│
├── package.json                  # Electron Dependencies
├── electron-builder.json         # Build Configuration
└── src/preload.js               # Secure Context Bridge
```

## 🔧 API Verwendung

### Im Renderer Process (Web-App)

#### Filmora Integration
```javascript
// Filmora Status überprüfen
const status = await FilmoraAPI.checkStatus();
if (status.isReady) {
    // Starte Filmora
    await FilmoraAPI.launch();
    
    // Oder exportiere Reel zu Filmora
    await FilmoraAPI.exportProject({
        title: 'Mein Video',
        duration: 10,
        resolution: '1080p'
    });
}
```

#### Local Tools (FFmpeg)
```javascript
// Überprüfe installierte Tools
const tools = await ToolsAPI.checkTools();

// Konvertiere Video mit Preset
await ToolsAPI.encodeWithPreset(
    'input.mp4',
    'output.mp4',
    'instagram'  // 1080x1350, 4000k Bitrate
);

// Oder mit benutzerdefinierten Optionen
await ToolsAPI.encodeVideo(
    'input.mp4',
    'output.mp4',
    {
        codec: 'h264',
        bitrate: '5000k',
        preset: 'medium',
        resolution: '1920x1080'
    }
);

// Extrahiere Metadaten
const metadata = await ToolsAPI.getVideoMetadata('video.mp4');
console.log(metadata);
// {
//     width: 1920,
//     height: 1080,
//     fps: 30,
//     duration: 10.5,
//     codec: 'h264'
// }
```

## 🔄 Auto-Update System

### Wie Updates funktionieren

1. **Versionierung**: Nutzt Semantic Versioning (MAJOR.MINOR.PATCH)
2. **Release**: Tag in Git erstellen → `git tag v1.0.0`
3. **Build**: GitHub Actions baut .exe & erstellt Release
4. **Download**: App überprüft nach Updates
5. **Install**: Auto-Download & Restart-Prompt

### Update-Prüfung manuell

Nutzer können Updates manuell überprüfen:
- **Menu** → Help → "Auf Updates prüfen"
- Oder automatisch beim App-Start

## 🎬 Filmora Integration

### Features
- ✅ Filmora-Installation über Registry erkennen
- ✅ Filmora starten
- 🔄 Project Export (später)
- 🔄 Template Library (später)
- 🔄 COM Interface (optional, fortgeschritten)

### Registry Detection

```javascript
const FilmoraService = require('./services/FilmoraService');
const service = new FilmoraService();

const status = await service.detectFilmora();
// {
//     installed: true,
//     path: "C:\\Program Files\\Wondershare\\Filmora",
//     version: "13.0.20",
//     licensed: true
// }
```

## 🛠️ Pro-Tools Integration

### FFmpeg (Local Binary)

Die App nutzt portable FFmpeg-Binaries im `assets/tools/` Verzeichnis:
- `ffmpeg.exe` - Video/Audio Encoding
- `ffprobe.exe` - Metadaten-Extraktion

### Unterstützte Codecs

**Video:**
- H.264 (libx264) - Standard, beste Kompatibilität
- H.265 (libx265) - Bessere Kompression, weniger Support
- VP9 (libvpx-vp9) - WebM Format

**Audio:**
- AAC (standardmäßig)
- MP3
- OPUS

### Platform Presets

Vordefinierte Einstellungen für verschiedene Plattformen:

```javascript
ToolsAPI.presets = {
    tiktok: { resolution: '1080x1920', bitrate: '3000k' },
    instagram: { resolution: '1080x1350', bitrate: '4000k' },
    youtube: { resolution: '1440x2560', bitrate: '8000k' },
    twitter: { resolution: '1200x675', bitrate: '3000k' },
    '4k': { resolution: '3840x2160', bitrate: '15000k' }
};
```

## 📝 Konfiguration

### Settings (electron-store)

Einstellungen werden gespeichert in:
```
%APPDATA%\IceHeat\settings.json
```

Beispiel:
```json
{
  "autoUpdate": true,
  "filmoraPath": "C:\\Program Files\\Wondershare\\Filmora",
  "toolsPath": "%APPDATA%\\IceHeat\\tools",
  "defaultPreset": "instagram",
  "theme": "dark"
}
```

## 🐛 Entwicklung & Debugging

### Logs

Logs werden gespeichert in:
```
%APPDATA%\IceHeat\logs\
```

### DevTools

Im Development Mode (`npm run dev`):
- F12 oder Ctrl+Shift+I öffnet DevTools
- Console Tab für Fehler
- Network Tab für IPC Calls

### IPC Debugging

```javascript
// In Renderer Process
window.electron.filmora.detect().then(result => {
    console.log('Filmora detection result:', result);
});
```

## 🚀 Deployment

### Release-Prozess

```bash
# 1. Version in package.json aktualisieren
npm version patch  # or minor/major

# 2. GitHub Release erstellen
git tag v1.0.1
git push origin v1.0.1

# 3. GitHub Actions baut automatisch
# (pushes zu release/latest.yml)

# 4. Users bekommen Auto-Update Notification
```

### GitHub Actions

Repository muss folgende Actions aktiviert haben:
- **Build & Release Workflow** (`.github/workflows/build-release.yml`)
- Automatische .exe Generation
- Auto-Publish zu Releases

## 📚 Ressourcen

- **Electron Docs**: https://www.electronjs.org/docs
- **electron-builder**: https://www.electron.build/
- **electron-updater**: https://github.com/electron-userland/electron-updater
- **FFmpeg**: https://ffmpeg.org/documentation.html
- **Filmora API**: https://www.filmora.io/wiki/

## 🤝 Beitragen

Pull Requests sind willkommen! Bitte erstelle einen Branch von `claude/video-reel-generator-*`:

```bash
git checkout -b feature/your-feature
git commit -m "Add your feature"
git push origin feature/your-feature
```

## 📄 Lizenz

MIT License - siehe LICENSE Datei

## 🎯 Roadmap

### Phase 1 ✅ (Woche 1-2)
- [x] Electron Setup
- [x] NSIS Installer
- [x] Preload Scripts & IPC

### Phase 2 ✅ (Woche 2-3)
- [x] Auto-Update System
- [x] GitHub Actions Pipeline
- [x] Update UI Integration

### Phase 3 🔄 (Woche 3-5)
- [ ] Local FFmpeg Integration
- [ ] ImageMagick Wrapper
- [ ] Video Encoding Pipeline

### Phase 4 🔄 (Woche 5-7)
- [ ] Filmora Project Bridge
- [ ] Template Library
- [ ] Advanced Export

### Phase 5 🔄 (Woche 7-8)
- [ ] System Tray Integration
- [ ] File Explorer Context Menu
- [ ] Performance Optimizations
- [ ] Beta Release

## 📞 Support

Issues oder Fragen? Erstelle ein GitHub Issue:
https://github.com/rdaxer/IceHeat-v5-/issues

---

**Aktuelle Version**: 1.0.0  
**Zielplattform**: Windows 10+  
**Status**: Alpha/Development
