# 🎬 IceHeat Desktop v1.0.0

> **Professional Video Reel Generator for Windows 10+**  
> Automatically extract compelling scenes, generate engaging hooks, sync with music, add subtitles, and integrate with Filmora for advanced editing.

[![GitHub Release](https://img.shields.io/github/v/release/rdaxer/IceHeat-v5-?style=flat-square&logo=github)](https://github.com/rdaxer/IceHeat-v5-/releases)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![Windows 10+](https://img.shields.io/badge/windows-10%2B-0078D4?style=flat-square&logo=windows)](https://www.microsoft.com/windows)
[![Electron](https://img.shields.io/badge/electron-v28-47848F?style=flat-square&logo=electron)](https://www.electronjs.org)

---

## ✨ Features

### 🎥 Intelligent Scene Detection
- Automatic detection of high-quality scenes using optical flow analysis
- Sharpness scoring with Laplacian variance detection
- Motion tracking for dynamic content identification
- Customizable detection sensitivity

### 🎵 Music Synchronization
- BPM detection via spectral flux analysis
- Beat-aligned video editing
- Automatic cut point suggestions based on musical structure
- Support for multiple audio formats

### 🎣 Automatic Hook Generation
- 6+ hook templates (Action, Comedy, Suspense, Educational, Lifestyle, Music)
- Platform-optimized hooks (TikTok, Instagram, YouTube, Twitter)
- Niche-specific templates (Fitness, Cooking, Travel, Tech, Beauty)
- AI-powered hook suggestions with visual effects

### 📝 Auto-Subtitle Generation
- Speech-to-text transcription (Tesseract.js)
- Automatic caption generation (SRT/WebVTT formats)
- Keyword highlighting and emphasis
- Customizable subtitle timing and positioning

### 🎨 Professional Video Encoding
- **Local FFmpeg** with H.264, H.265 (HEVC), VP9 codecs
- **Hardware Acceleration:**
  - NVIDIA CUDA (GeForce RTX series)
  - Intel QuickSync (8th Gen Core+)
  - AMD DXVA2
- **Platform-Optimized Presets:**
  - TikTok (1080×1920, 3000k)
  - Instagram (1080×1350, 4000k)
  - YouTube Shorts (1080×1920, 60fps)
  - YouTube (1440×2560, 8000k)
  - Twitter/X (1200×675, 3000k)
  - 4K UHD (3840×2160, 15000k)

### 🎬 Filmora Professional Bridge
- **Automatic Detection** via Windows Registry
- **Direct Integration** with Wondershare Filmora 13.0+
- **Project Export** with full metadata preservation
- **Seamless Workflow:** Edit in Reel → Refine in Filmora → Export

### 🔄 Auto-Update System
- **Automatic Checks** every 24 hours
- **Delta Updates** - download only what changed
- **Background Downloads** - no interruption
- **Staged Rollout** - slow rollout for stability
- **Manual Control** via Menu → Help

### 🪟 Windows Integration
- **System Tray** with quick access and context menu
- **File Associations** for .iceheat project files
- **Start Menu** shortcuts and integration
- **Context Menu** - "Open with IceHeat"
- **Native Windows** menus and dialogs

---

## 🚀 Quick Start

### 🎯 Easiest: Download & Install

1. **Download** the installer from [GitHub Releases](https://github.com/rdaxer/IceHeat-v5-/releases)
   - `IceHeat Desktop-1.0.0-Setup.exe` (recommended)
   - `IceHeat Desktop-1.0.0-Portable.exe` (no installation)

2. **Run** the installer and follow the wizard

3. **Launch** from Start Menu

4. **Grant admin rights** when prompted (for file associations)

👉 **See [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md) for detailed instructions**

### 💻 Or Build from Source

**Requirements:** Node.js 18+, npm 9+, Git

```bash
git clone https://github.com/rdaxer/IceHeat-v5-.git
cd IceHeat-v5-
npm install
npm start
```

👉 **See [BUILD_INSTRUCTIONS.md](./BUILD_INSTRUCTIONS.md) for build & development guide**

---

## 📋 System Requirements

### Minimum
- **Windows 10** (Build 1909 or later)
- **4GB RAM**
- **2GB disk space**
- **Intel Core i5 / AMD Ryzen 5**

### Recommended
- **Windows 11**
- **8GB+ RAM**
- **SSD with 5GB+ space**
- **Intel Core i7 / AMD Ryzen 7**
- **GPU:** NVIDIA GeForce GTX 1650+ (for hardware acceleration)

### Optional
- **NVIDIA CUDA Toolkit 12.0+** (for GPU encoding)
- **Intel Media Driver** (for QuickSync)
- **Wondershare Filmora 13.0+** (for advanced editing)

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **[INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)** | Complete installation & troubleshooting |
| **[BUILD_INSTRUCTIONS.md](./BUILD_INSTRUCTIONS.md)** | Development & build guide |
| **[RELEASE_NOTES.md](./RELEASE_NOTES.md)** | v1.0.0 feature summary |
| **[DESKTOP_APP_README.md](./DESKTOP_APP_README.md)** | Technical API reference |

---

## 🎬 Workflow

### Typical 5-Minute Process

```
1. Upload Video
   ↓
2. Auto-Detect Scenes (OpenCV)
   ↓
3. Add Music & Sync Beats
   ↓
4. Generate Hook (AI templates)
   ↓
5. Add Auto-Subtitles
   ↓
6. Export for Platform (H.264/H.265 + FFmpeg)
   ↓
7. (Optional) Open in Filmora for Polish
   ↓
8. Share to TikTok/Instagram/YouTube
```

---

## 🔧 API Reference

### Renderer APIs (JavaScript)

```javascript
// Check FFmpeg status
await VideoExportAPI.checkFFmpegStatus();

// Encode video with platform preset
await VideoExportAPI.encodeWithPreset(
    'input.mp4',
    'output.mp4',
    'tiktok'  // or 'instagram', 'youtube', 'twitter', '4k', 'hd'
);

// Detect Filmora
const status = await FilmoraExportAPI.checkStatus();

// Export to Filmora project
await FilmoraExportAPI.exportAndOpen('video.mp4', {
    title: 'My Viral Reel',
    platform: 'tiktok'
});

// Check for updates
await UpdateAPI.checkForUpdates();
```

👉 **Full API docs:** [DESKTOP_APP_README.md](./DESKTOP_APP_README.md)

---

## 🏗️ Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Electron 28 | Desktop wrapper |
| **Renderer** | HTML5/CSS3/JavaScript | UI & web modules |
| **Backend** | Node.js + IPC | Main process services |
| **Video** | FFmpeg 6.0+ | Encoding engine |
| **AI/CV** | OpenCV.js, Tesseract.js | Scene detection & OCR |
| **Audio** | Tone.js, Web Audio API | Music analysis |
| **Storage** | IndexedDB | Local project persistence |
| **Updates** | electron-updater | Auto-update system |

### File Structure

```
IceHeat-v5-/
├── src/main/
│   ├── index.js                 (Main process)
│   ├── preload.js              (Context bridge)
│   ├── ipc/
│   │   └── handlers.js         (IPC handlers)
│   └── services/
│       ├── UpdateService.js
│       ├── ToolsService.js
│       ├── FFmpegService.js
│       ├── FilmoraService.js
│       ├── SystemTrayService.js
│       └── FileAssociationService.js
├── reel/
│   ├── index.html              (Main UI)
│   ├── js/                     (Web modules)
│   │   ├── VideoManager.js
│   │   ├── SceneAnalyzer.js
│   │   ├── MusicSync.js
│   │   ├── HookGenerator.js
│   │   ├── ExportManager.js
│   │   └── SubtitleGenerator.js
│   └── api/                    (IPC bridges)
│       ├── update-api.js
│       ├── video-export-api.js
│       ├── filmora-export-api.js
│       └── tools-api.js
├── build/
│   ├── icons/                  (App icons)
│   └── installer-background.bmp
├── electron-builder.json       (Build config)
├── package.json
└── RELEASE_NOTES.md
```

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Lint code
npm run lint
```

**Manual testing checklist:** See [BUILD_INSTRUCTIONS.md](./BUILD_INSTRUCTIONS.md#manual-testing-checklist)

---

## 📦 Building for Distribution

```bash
# Development build (no signing)
npm run build

# Release build (with GitHub publishing)
npm run build:release
```

Output files:
- `dist/IceHeat Desktop-1.0.0-Setup.exe` (NSIS installer, ~150MB)
- `dist/IceHeat Desktop-1.0.0-Portable.exe` (Portable, ~150MB)

👉 **Full build guide:** [BUILD_INSTRUCTIONS.md](./BUILD_INSTRUCTIONS.md)

---

## 🔍 Troubleshooting

### Common Issues

**App won't start?**
→ See [INSTALLATION_GUIDE.md - Troubleshooting](./INSTALLATION_GUIDE.md#troubleshooting)

**FFmpeg not found?**
→ Auto-downloads on first run. Check `%APPDATA%\IceHeat\tools\ffmpeg\`

**GPU encoding not available?**
→ Install NVIDIA CUDA / Intel drivers. See setup guide in [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md#post-installation-setup)

**Filmora not detected?**
→ Must be Filmora 13.0+. Check [INSTALLATION_GUIDE.md - Filmora Integration](./INSTALLATION_GUIDE.md#2-install-filmora-integration-optional)

👉 **Full troubleshooting:** [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md#troubleshooting)

---

## 🔄 Updates

### Automatic Updates
- **Check frequency:** Every 24 hours at startup
- **Download:** Automatic, no action needed
- **Installation:** On next restart
- **Manual check:** Menu → Help → Check for Updates

### Update Channels
- **Stable** (default): Production releases
- **Beta** (optional): Pre-releases
- **Dev** (internal): Bleeding edge

### Disable Auto-Updates
Settings → Updates → Uncheck "Auto-update enabled"

---

## 🤝 Contributing

We welcome contributions! Here's how to help:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m "feat: Add amazing feature"`
4. **Push** branch: `git push origin feature/amazing-feature`
5. **Open** Pull Request

Please ensure:
- Tests pass: `npm test`
- Code is linted: `npm run lint`
- Commits have clear messages
- Changes are well-documented

---

## 🐛 Bug Reports & Feature Requests

Found a bug? Have an idea? [Open an issue](https://github.com/rdaxer/IceHeat-v5-/issues)

**Please include:**
- Windows version (`winver`)
- App version (Menu → Help → About)
- Steps to reproduce
- Log file: `%APPDATA%\IceHeat\logs\IceHeat.log`
- System specs (RAM, GPU, processor)

---

## 📄 License

MIT License - Free for personal and commercial use

See [LICENSE](./LICENSE) file for details

---

## 🗺️ Roadmap

### v1.1.0 (Q3 2024)
- [ ] Cloud backup for projects
- [ ] Batch processing queue
- [ ] Advanced color grading
- [ ] Custom watermark designer
- [ ] Subtitle styling options

### v1.2.0 (Q4 2024)
- [ ] Mobile app companion
- [ ] Team collaboration
- [ ] Advanced AI features
- [ ] Plugin system
- [ ] Professional certification

### v2.0.0 (2025)
- [ ] macOS version
- [ ] Linux version
- [ ] Web version
- [ ] Advanced analytics
- [ ] Enterprise features

---

## 📞 Support

- **Documentation:** [Docs](./INSTALLATION_GUIDE.md)
- **Issues:** [GitHub Issues](https://github.com/rdaxer/IceHeat-v5-/issues)
- **Wiki:** [GitHub Wiki](https://github.com/rdaxer/IceHeat-v5-/wiki)

---

## 🙏 Acknowledgments

- **[Electron](https://www.electronjs.org/)** - Desktop framework
- **[FFmpeg](https://ffmpeg.org/)** - Video encoding
- **[electron-builder](https://www.electron.build/)** - Build & packaging
- **[OpenCV.js](https://docs.opencv.org/master/d5/d10/tutorial_js_root.html)** - Computer vision
- **[Tesseract.js](https://tesseract.projectnaptha.com/)** - OCR
- **[Tone.js](https://tonejs.github.io/)** - Audio analysis
- **[Wondershare Filmora](https://www.wondershare.com/filmora/)** - Professional editing

---

<div align="center">

**Made with ❤️ for content creators**

[⬇️ Download](https://github.com/rdaxer/IceHeat-v5-/releases) · [📖 Docs](./INSTALLATION_GUIDE.md) · [🐛 Report Bug](https://github.com/rdaxer/IceHeat-v5-/issues) · [💡 Feature Request](https://github.com/rdaxer/IceHeat-v5-/issues)

</div>
