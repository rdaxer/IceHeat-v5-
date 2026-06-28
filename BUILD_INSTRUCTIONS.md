# IceHeat Desktop - Build & Development Instructions

**Complete guide for building, testing, and packaging the Windows desktop application**

---

## 📋 Quick Reference

| Task | Command | Notes |
|------|---------|-------|
| Install dependencies | `npm install` | One-time setup |
| Start dev server | `npm start` | Opens app with DevTools |
| Build installer | `npm run build:release` | Creates NSIS installer + portable |
| Build unsigned | `npm run build` | Faster, no code signing |
| Run tests | `npm test` | Jest test suite |
| Lint code | `npm lint` | ESLint check |

---

## 🔧 Development Environment Setup

### Prerequisites

- **Windows 10/11** (build environment must be Windows)
- **Node.js 18.x or later** (from [nodejs.org](https://nodejs.org))
- **npm 9.x or later** (included with Node.js)
- **Git** (from [git-scm.com](https://git-scm.com))
- **Visual Studio Build Tools** (optional, for native modules)

### Verify Installation

```cmd
node --version     # Should be v18.0.0 or higher
npm --version      # Should be 9.0.0 or higher
git --version      # Should be 2.30.0 or higher
```

### Initial Setup

```cmd
# Clone repository
git clone https://github.com/rdaxer/IceHeat-v5-.git
cd IceHeat-v5-

# Install dependencies
npm install

# This will:
# - Install Node modules
# - Download Electron
# - Configure electron-builder
```

**Setup time:** ~5-10 minutes (includes Electron download)

---

## 🚀 Running Development Version

### Quick Start

```cmd
npm start
```

**What happens:**
1. Electron window opens showing the app
2. Renderer DevTools automatically open
3. Main process logs to console
4. Hot-reload enabled (file changes auto-reload)
5. Service Worker disabled for development

### Development Workflow

```cmd
# Terminal 1: Start electron app
npm start

# Terminal 2: Watch for TypeScript/JavaScript changes
npm run dev:watch    # If you have this script

# Terminal 3: Use DevTools for debugging
# (automatically opened in Electron window)
```

### Debugging

**Main Process Debugging:**
- Logs appear in console
- Breakpoints: Add `debugger;` statements
- Output: `%APPDATA%\IceHeat\logs\`

**Renderer Process Debugging:**
- DevTools open automatically
- Right-click → Inspect element
- Console, Sources, Network, Application tabs available

---

## 🏗️ Building the Application

### Build Modes

#### 1. Development Build (No Signing)
```cmd
npm run build

# Output:
# - dist/IceHeat Desktop-1.0.0-Setup.exe (NSIS installer)
# - dist/IceHeat Desktop-1.0.0-Portable.exe (Portable)
```

**Pros:** Fast build, no code signing required  
**Cons:** Not signed, antivirus may warn  
**Use:** Internal testing, development

**Build time:** ~3-5 minutes

---

#### 2. Release Build (With Signing - Optional)
```cmd
npm run build:release

# Requires:
# - Code signing certificate
# - GitHub PAT token (for releases)
# - Configure in electron-builder.json
```

**Pros:** Signed, auto-updates work, professional distribution  
**Cons:** Requires certificates and tokens  
**Use:** Production releases

**Build time:** ~5-10 minutes

---

### Build Output Structure

```
dist/
├── IceHeat Desktop-1.0.0-Setup.exe      (NSIS installer, ~150MB)
├── IceHeat Desktop-1.0.0-Portable.exe   (Portable exe, ~150MB)
└── electron-builder/ (temporary files)
```

### Building Without Publishing

```cmd
# Build without GitHub release
npm run build

# Installer files created but not uploaded
```

---

## 📦 Package Contents

### What Gets Included in Build

| Component | Source | Included |
|-----------|--------|----------|
| Electron | node_modules | ✅ Yes |
| FFmpeg | Downloaded at runtime | ❌ No (on first run) |
| Source code | src/, reel/ | ✅ Yes (asar archive) |
| Assets | build/icons/ | ✅ Yes |
| Dependencies | node_modules/ | ✅ Yes |

### Reducing Package Size

```cmd
# Remove dev dependencies before build
npm prune --production

# Exclude large modules (if not used)
# Edit electron-builder.json "files" array

# Result: ~120-130MB instead of ~150MB
```

---

## 🧪 Testing

### Running Tests

```cmd
# Run all tests
npm test

# Run specific test file
npm test VideoManager.test.js

# Run with coverage
npm test -- --coverage
```

### Test Files Location
```
tests/
├── unit/
│   ├── VideoManager.test.js
│   ├── SceneAnalyzer.test.js
│   ├── MusicSync.test.js
│   └── ...
├── integration/
│   ├── FFmpeg.integration.test.js
│   └── Filmora.integration.test.js
└── e2e/
    ├── upload.e2e.test.js
    └── export.e2e.test.js
```

### Manual Testing Checklist

**✅ Core Features:**
- [ ] Upload video file
- [ ] Auto-detect scenes
- [ ] Add music and sync
- [ ] Generate hooks
- [ ] Add auto-subtitles
- [ ] Timeline editing works
- [ ] Export to MP4

**✅ Filmora Integration:**
- [ ] Detect Filmora (if installed)
- [ ] Export project to Filmora
- [ ] Open Filmora from app
- [ ] Import edited project back

**✅ FFmpeg Encoding:**
- [ ] H.264 encoding works
- [ ] H.265 encoding works (if GPU available)
- [ ] Different presets work
- [ ] Batch export works
- [ ] Progress tracking displays

**✅ Updates:**
- [ ] Check for updates works
- [ ] Download update displays progress
- [ ] Install after restart works

**✅ File System:**
- [ ] Save project
- [ ] Open project
- [ ] File associations work
- [ ] System tray functions

**✅ Stability:**
- [ ] No memory leaks with large videos
- [ ] Graceful error handling
- [ ] Proper cleanup on exit

---

## 🔍 Debugging Issues

### Build Fails

**Error: "Cannot find electron"**
```cmd
# Solution: Reinstall dependencies
npm install
npm install electron --save-dev
```

**Error: "NSIS not found"**
```cmd
# Solution: electron-builder will prompt to install
# Or install manually:
choco install nsis
```

**Error: "Code signature invalid"**
```cmd
# Solution: Check certificate configuration
# In electron-builder.json, set:
"certificateFile": null
"signingHashAlgorithms": ["sha256"]
"sign": null
```

### App Crashes on Startup

1. **Check logs:**
   ```cmd
   type %APPDATA%\IceHeat\logs\IceHeat.log
   ```

2. **Check preload script:**
   ```cmd
   # Ensure preload.js has proper exports
   # Test: npm start should show no errors
   ```

3. **Check IPC handlers:**
   ```cmd
   # Verify handlers.js is imported in index.js
   # Verify all event listeners are registered
   ```

### FFmpeg Not Working

1. **Check FFmpeg installation:**
   ```cmd
   # Should download on first run
   dir %APPDATA%\IceHeat\tools\ffmpeg\

   # Should contain: ffmpeg.exe, ffprobe.exe
   ```

2. **Test FFmpeg directly:**
   ```cmd
   ffmpeg -version
   ffprobe -version
   ```

3. **Check logs:**
   ```cmd
   type %APPDATA%\IceHeat\logs\IceHeat.log | find "ffmpeg"
   ```

### GPU Encoding Not Detected

1. **Install GPU drivers:**
   - NVIDIA: [GeFORCE drivers](https://www.nvidia.com/Download/driverDetails.aspx)
   - Intel: [Intel Graphics drivers](https://www.intel.com/content/www.intel.com/en/download/726609/)
   - AMD: [Radeon drivers](https://www.amd.com/en/support)

2. **Install CUDA (NVIDIA):**
   ```cmd
   # Download CUDA Toolkit 12.0+
   # https://developer.nvidia.com/cuda-12-0-0-download-archive

   # Verify installation:
   nvidia-smi
   ```

3. **Check app logs:**
   ```cmd
   # Look for "GPU detected" or "CUDA found"
   type %APPDATA%\IceHeat\logs\IceHeat.log | find "GPU"
   ```

---

## 📝 Project Structure

```
IceHeat-v5-/
├── src/
│   ├── main/
│   │   ├── index.js                 (Main process entry)
│   │   ├── ipc/
│   │   │   └── handlers.js          (IPC handlers)
│   │   ├── services/
│   │   │   ├── UpdateService.js
│   │   │   ├── ToolsService.js
│   │   │   ├── FFmpegService.js
│   │   │   ├── FilmoraService.js
│   │   │   ├── SystemTrayService.js
│   │   │   └── FileAssociationService.js
│   │   └── utils/
│   └── preload.js                   (Context bridge)
├── reel/
│   ├── index.html                   (Main UI)
│   ├── js/
│   │   ├── VideoManager.js
│   │   ├── SceneAnalyzer.js
│   │   ├── MusicSync.js
│   │   ├── HookGenerator.js
│   │   ├── ExportManager.js
│   │   └── SubtitleGenerator.js
│   └── api/
│       ├── update-api.js
│       ├── tools-api.js
│       ├── video-export-api.js
│       ├── filmora-api.js
│       └── filmora-export-api.js
├── build/
│   ├── icons/
│   │   ├── app.ico
│   │   ├── setup.ico
│   │   └── uninstall.ico
│   └── installer-background.bmp
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── electron-builder.json            (Build config)
├── package.json                     (Dependencies & scripts)
├── .gitignore
├── RELEASE_NOTES.md
├── INSTALLATION_GUIDE.md
├── DESKTOP_APP_README.md
└── BUILD_INSTRUCTIONS.md
```

---

## 🔐 Code Signing (Production)

### Option 1: Self-Signing (Test Builds)

```cmd
# Generate self-signed certificate
certutil -genkey -exponent 65537 -eku 1.3.6.1.5.5.7.3.3 -ss my -sr localmachine -len 2048 -csp "Microsoft RSA SChannel Cryptographic Provider" IceHeat

# Use in electron-builder.json:
"certificateFile": "path/to/cert.pfx",
"certificatePassword": "your-password"
```

### Option 2: Production Signing (Enterprise)

1. **Get code signing certificate** from:
   - DigiCert
   - Sectigo (formerly Comodo)
   - GlobalSign
   - AWS Certificate Manager

2. **Configure in electron-builder.json:**
   ```json
   "certificateFile": "path/to/certificate.pfx",
   "certificatePassword": "${CSC_KEY_PASSWORD}",
   "signingHashAlgorithms": ["sha256"]
   ```

3. **Set environment variable:**
   ```cmd
   set CSC_KEY_PASSWORD=your-certificate-password
   npm run build:release
   ```

---

## 🚀 Deploying Updates

### GitHub Releases (Automatic)

1. **Tag a commit:**
   ```cmd
   git tag v1.0.1
   git push origin v1.0.1
   ```

2. **Build and publish:**
   ```cmd
   npm run build:release

   # With GitHub token:
   set GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxx
   npm run build:release
   ```

3. **Release is created automatically** with installers attached

### Manual Release

1. **Build locally:**
   ```cmd
   npm run build
   ```

2. **Upload to GitHub Releases:**
   - Go to: https://github.com/rdaxer/IceHeat-v5-/releases
   - Click "Draft a new release"
   - Upload the .exe files from `dist/`
   - Publish

3. **Users will see update notification** in-app

---

## 📚 Additional Resources

- **Electron Docs:** https://www.electronjs.org/docs
- **electron-builder Docs:** https://www.electron.build/
- **electron-updater Docs:** https://github.com/electron-userland/electron-updater
- **FFmpeg Docs:** https://ffmpeg.org/documentation.html
- **Node.js Docs:** https://nodejs.org/en/docs/

---

## 🤝 Contributing

To contribute to IceHeat:

1. **Fork repository**
   ```cmd
   git clone https://github.com/your-username/IceHeat-v5-.git
   ```

2. **Create feature branch**
   ```cmd
   git checkout -b feature/amazing-feature
   ```

3. **Make changes and test**
   ```cmd
   npm test
   npm start  # Manual testing
   ```

4. **Commit with clear messages**
   ```cmd
   git commit -m "feat: Add amazing feature"
   ```

5. **Push and create Pull Request**

---

## 📋 Checklist for Release

Before releasing a new version:

- [ ] All tests pass: `npm test`
- [ ] Code linted: `npm run lint`
- [ ] Version updated in `package.json`
- [ ] RELEASE_NOTES.md updated
- [ ] CHANGELOG.md updated
- [ ] Build succeeds: `npm run build`
- [ ] Installer tested on Windows 10 and 11
- [ ] Portable exe tested
- [ ] Update path works
- [ ] File associations work
- [ ] System tray works
- [ ] FFmpeg detected and works
- [ ] Filmora integration tested (if installed)
- [ ] GPU detection tested (if GPU available)
- [ ] Git tag created: `git tag v1.0.0`

---

## 📞 Support

**Questions or issues?**

1. Check [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md) Troubleshooting section
2. Review [DESKTOP_APP_README.md](./DESKTOP_APP_README.md)
3. Check logs: `%APPDATA%\IceHeat\logs\`
4. Open issue: [GitHub Issues](https://github.com/rdaxer/IceHeat-v5-/issues)

---

**Happy building! 🎬**

*Last updated: 2024-06-28*
