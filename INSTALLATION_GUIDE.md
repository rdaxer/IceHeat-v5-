# IceHeat Desktop v1.0.0 - Installation Guide

**Complete setup instructions for Windows 10+ | Professional Video Reel Generator**

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [System Requirements](#system-requirements)
3. [Installation Methods](#installation-methods)
4. [Post-Installation Setup](#post-installation-setup)
5. [Troubleshooting](#troubleshooting)
6. [FAQ](#faq)
7. [Uninstallation](#uninstallation)

---

## 🚀 Quick Start

### Easiest Method: Windows Installer (Recommended)

1. **Download** `IceHeat Desktop-1.0.0-Setup.exe` from [GitHub Releases](https://github.com/rdaxer/IceHeat-v5-/releases)
2. **Double-click** the .exe file
3. **Follow** the installation wizard
4. **Launch** from Start Menu or Desktop shortcut
5. **Grant admin rights** when prompted (for file associations)

**Installation time:** ~2 minutes

---

## 📊 System Requirements

### Minimum (Functional)
- **OS:** Windows 10 (Build 1909 or later)
- **RAM:** 4GB
- **Disk Space:** 2GB free (for app + working files)
- **Processor:** Intel Core i5 / AMD Ryzen 5
- **GPU:** Integrated graphics (no encoding acceleration)

### Recommended (Good Performance)
- **OS:** Windows 11 (21H2 or later)
- **RAM:** 8GB
- **Disk Space:** SSD with 5GB+ free space
- **Processor:** Intel Core i7 / AMD Ryzen 7
- **GPU:** NVIDIA GeForce GTX 1650+ or AMD RX 6500+
- **Internet:** 5+ Mbps (for updates and cloud features)

### Optional (Best Performance)
- **NVIDIA CUDA Toolkit 12.0+** (for GPU-accelerated H.265 encoding)
- **Intel Media Driver 23.0+** (for Intel QuickSync)
- **Wondershare Filmora 13.0+** (for advanced editing integration)

---

## 💾 Installation Methods

### Method 1: Windows Installer (RECOMMENDED)

**Best for:** Most users, includes auto-update support

**Steps:**
1. Download `IceHeat Desktop-1.0.0-Setup.exe`
2. Run the installer
3. Choose installation directory (default: `C:\Program Files\IceHeat Desktop`)
4. Accept file associations
5. Create Start Menu and Desktop shortcuts
6. Launch application

**Features:**
- ✅ One-click installation
- ✅ Automatic updates
- ✅ File association (.iceheat)
- ✅ Start Menu integration
- ✅ Easy uninstall via Control Panel

**File size:** ~150MB

---

### Method 2: Portable Executable

**Best for:** USB drives, temporary installations, portable computers

**Steps:**
1. Download `IceHeat Desktop-1.0.0-Portable.exe`
2. Run the .exe file directly
3. No installation needed
4. Can run from any directory

**Features:**
- ✅ No installation required
- ✅ No system registry modifications
- ✅ Portable across USB drives
- ✅ Self-contained (includes all dependencies)
- ❌ No automatic updates
- ❌ Manual update installation needed

**File size:** ~150MB  
**Settings location:** Same directory as executable

---

### Method 3: Developer Installation (From Source)

**Best for:** Development, customization, contributing to project

**Requirements:**
- Git
- Node.js 18.x or later
- npm 9.x or later

**Steps:**

```bash
# Clone repository
git clone https://github.com/rdaxer/IceHeat-v5-.git
cd IceHeat-v5-

# Install dependencies
npm install

# Run development version
npm start

# Build installer (if desired)
npm run build:release
```

**Development server:** http://localhost:3000

**Output files:**
- NSIS installer: `dist/IceHeat Desktop-1.0.0-Setup.exe`
- Portable exe: `dist/IceHeat Desktop-1.0.0-Portable.exe`

---

## 🔧 Post-Installation Setup

### 1. Enable Hardware Acceleration (Optional but Recommended)

Hardware acceleration significantly speeds up video encoding.

#### For NVIDIA GPUs:

```cmd
# Download NVIDIA CUDA Toolkit
# Visit: https://developer.nvidia.com/cuda-downloads

# After installation, verify:
nvidia-smi

# IceHeat should auto-detect on next launch
```

#### For Intel GPUs:

```cmd
# Download Intel Media Driver
# Visit: https://www.intel.com/content/www.intel.com/en/download/726609/726609.html

# Verify in Device Manager:
# Display adapters > Intel UHD/Iris Xe Graphics
```

#### For AMD GPUs:

```cmd
# AMD support requires DirectX 12 (built-in to Windows 10+)
# Install latest GPU drivers from AMD website
```

### 2. Install Filmora Integration (Optional)

If you have Wondershare Filmora 13.0+:

1. **Install Filmora** from [wondershare.com](https://www.wondershare.com/filmora/video-editor.html)
2. **Launch IceHeat Desktop**
3. **Go to:** Tools → Open Filmora
4. **IceHeat** will detect Filmora automatically
5. **Confirm** detection in Tools → Filmora Status

### 3. Configure Automatic Updates

**Default:** Enabled (checks every 24 hours)

**To manage:**
1. Open IceHeat Desktop
2. Go to Settings → Updates
3. Options:
   - ✅ Auto-update enabled (recommended)
   - ⏱️ Check frequency (daily/weekly)
   - 📊 Update channel (Stable/Beta)

**Manual check:** Menu → Help → Check for Updates

### 4. Associate .iceheat Project Files

**Automatic:** Done during installation

**Manual (if needed):**
1. Right-click any .iceheat file
2. Select "Open with..."
3. Browse to `C:\Program Files\IceHeat Desktop\IceHeat Desktop.exe`
4. Check "Always use this app"

---

## 🔍 Troubleshooting

### Application won't start

**Symptoms:**
- Crash on launch
- Error dialog appears
- Nothing happens

**Solutions:**

1. **Check Windows version:**
   ```cmd
   winver
   # Must be Windows 10 Build 1909 or later
   ```

2. **Check disk space:**
   ```cmd
   # Ensure 2GB+ free space on C: drive
   ```

3. **Verify installation integrity:**
   - Uninstall completely
   - Restart computer
   - Reinstall application

4. **Check logs:**
   ```cmd
   # Open logs folder:
   %APPDATA%\IceHeat\logs\

   # Check IceHeat.log for errors
   ```

5. **Run as Administrator:**
   - Right-click IceHeat shortcut
   - Select "Run as administrator"

---

### FFmpeg not detected / Video encoding fails

**Symptoms:**
- Export button disabled
- "FFmpeg not found" error
- Video quality looks poor

**Solutions:**

1. **Verify FFmpeg installation:**
   - IceHeat includes FFmpeg
   - Should be at: `%APPDATA%\IceHeat\tools\ffmpeg\ffmpeg.exe`
   - Verify file exists (should be ~50MB)

2. **Reinstall FFmpeg:**
   ```cmd
   # Delete FFmpeg folder
   rmdir /s "%APPDATA%\IceHeat\tools\"

   # Restart IceHeat (will re-download FFmpeg)
   ```

3. **Install system FFmpeg (fallback):**
   ```cmd
   # Using Chocolatey
   choco install ffmpeg

   # Using Windows Package Manager
   winget install FFmpeg
   ```

4. **Check antivirus:**
   - Some antivirus software blocks FFmpeg
   - Add `%APPDATA%\IceHeat\` to whitelist
   - See below: Windows Defender Whitelist

---

### Filmora not detected / Integration fails

**Symptoms:**
- "Filmora not found" message
- Export to Filmora button disabled
- Can't launch Filmora from Tools menu

**Solutions:**

1. **Verify Filmora installation:**
   - Must be Filmora 13.0 or later
   - Check: Start Menu → Filmora

2. **Reinstall Filmora:**
   - Uninstall Filmora completely
   - Restart computer
   - Reinstall from [wondershare.com](https://www.wondershare.com/filmora/)

3. **Check Registry (Advanced):**
   ```cmd
   # Open Registry Editor
   regedit

   # Navigate to:
   HKEY_LOCAL_MACHINE\SOFTWARE\Wondershare\Filmora

   # If missing, Filmora may not be installed correctly
   ```

4. **Manual Filmora path:**
   - Settings → Pro Tools
   - Enter Filmora executable path manually
   - Example: `C:\Program Files\Wondershare\Filmora\Filmora.exe`

---

### GPU Encoding Not Available

**Symptoms:**
- H.264/H.265 Hardware encoding grayed out
- Only CPU encoding available
- Slow exports

**Solutions:**

1. **Check GPU drivers:**
   ```cmd
   # Device Manager → Display adapters
   # Update driver for your GPU
   ```

2. **NVIDIA CUDA Setup:**
   ```cmd
   # Download CUDA Toolkit 12.0+
   # https://developer.nvidia.com/cuda-downloads

   # Install with default options
   # Restart computer
   # Reopen IceHeat
   ```

3. **Verify GPU support:**
   - NVIDIA: GeForce GTX 750+ (Maxwell or newer)
   - Intel: 8th Gen Core or newer
   - AMD: Ryzen 5000+ or Radeon RX series

4. **Check NVIDIA Drivers:**
   ```cmd
   nvidia-smi

   # Should show your GPU with CUDA Compute Capability 5.0+
   ```

---

### Out of memory / Slow performance

**Symptoms:**
- App crashes when processing large videos
- Very slow encoding
- 100% disk/memory usage

**Solutions:**

1. **Close unnecessary applications:**
   - Free up RAM for encoding
   - Target: 2GB+ available

2. **Reduce video resolution:**
   - Settings → Video Quality
   - Export at 720p instead of 1080p
   - Process shorter clips

3. **Enable swap/page file:**
   ```cmd
   # Windows 10/11 usually auto-manages this
   # But you can increase manually:
   # Settings → System → About → Advanced system settings
   # → Performance → Virtual memory
   ```

4. **Use portable version:**
   - May be faster than installer version
   - Run from SSD if possible

5. **Split large videos:**
   - Process in segments
   - Combine in Filmora

---

### File Association Issues

**Symptoms:**
- .iceheat files don't open with IceHeat
- "Open with IceHeat" not in context menu
- Wrong app opens project files

**Solutions:**

1. **Restore file association:**
   ```cmd
   # Right-click .iceheat file
   # Select "Open with..."
   # Choose IceHeat Desktop
   # Check "Always use this app"
   ```

2. **Manual Registry fix:**
   ```cmd
   # Run as Administrator
   # Create batch file with:
   @echo off
   reg add "HKCR\.iceheat" /ve /d "IceHeatProject" /f
   reg add "HKCR\IceHeatProject" /ve /d "IceHeat Desktop Project" /f
   # Run it
   ```

3. **Reinstall application:**
   - Uninstall completely
   - Restart
   - Reinstall (will re-register associations)

---

### Windows Defender / Antivirus Warnings

**Issue:** Windows Defender or other antivirus flags FFmpeg as suspicious

**Solution:**

```cmd
# Add IceHeat folder to Windows Defender whitelist:
Add-MpPreference -ExclusionPath "C:\Program Files\IceHeat Desktop"
Add-MpPreference -ExclusionPath "%APPDATA%\IceHeat"

# Run PowerShell as Administrator
# Or: Settings → Virus & threat protection → Manage settings
# → Add exclusions → Add C:\Program Files\IceHeat Desktop
```

---

## ❓ FAQ

### Q: Is IceHeat free?
**A:** Yes! IceHeat is completely free and open-source under MIT License.

### Q: Do I need an internet connection?
**A:** No. All processing is local. Internet is only needed for:
- Checking updates
- Cloud features (if enabled, disabled by default)

### Q: Can I use this on Mac or Linux?
**A:** Not yet. Currently Windows 10+ only. macOS and Linux versions are planned for v2.0.0 (2025).

### Q: How much internet data does this use?
**A:** Very little:
- Initial download: ~150MB
- Auto-update check: <1MB
- Cloud features: None (disabled)
- Monthly usage: <10MB

### Q: Can I use custom fonts for subtitles?
**A:** Currently limited to system fonts. Custom fonts planned for v1.2.0.

### Q: What video formats are supported?
**A:** Input: MP4, MOV, AVI, MKV, FLV, WMV, WebM
Output: MP4 (H.264/H.265/VP9)

### Q: Can I export to formats other than MP4?
**A:** Currently MP4 only. Support for WebM and AV1 planned for v1.1.0.

### Q: Is my data secure?
**A:** Yes:
- All processing is local (no cloud upload)
- No telemetry or tracking
- Minimal registry modifications
- Code ready for code signing

### Q: Where are my projects saved?
**A:** IndexedDB browser storage (local):
```
%APPDATA%\IceHeat\projects\
```

### Q: Can I backup my projects?
**A:** Manual export:
1. Open project in IceHeat
2. Menu → File → Export Project
3. Save .iceheat file to safe location

### Q: How do I update to a new version?
**A:** Automatic:
- Settings → Updates → Auto-update enabled
- Or: Menu → Help → Check for Updates

### Q: Can I rollback to an older version?
**A:** Possible but not recommended. Newer versions are more stable.

### Q: Is there portable/USB version?
**A:** Yes! Download `IceHeat Desktop-1.0.0-Portable.exe` - no installation needed.

---

## 🗑️ Uninstallation

### Windows Installer Version

1. Open Control Panel
2. Go to: Programs → Programs and Features
3. Find "IceHeat Desktop"
4. Click "Uninstall"
5. Follow the uninstaller wizard
6. Restart computer (recommended)

**Optional: Remove user data**
```cmd
# Delete app data and projects:
rmdir /s "%APPDATA%\IceHeat"

# Delete Start Menu shortcut:
del "%APPDATA%\Microsoft\Windows\Start Menu\Programs\IceHeat\*"
```

### Portable Version

1. Delete `IceHeat Desktop-1.0.0-Portable.exe`
2. Done! (No registry changes)

### Developer Installation

```cmd
# In IceHeat directory:
npm run clean

# Delete project folder
rmdir /s IceHeat-v5-
```

---

## 📞 Support

**Need help?**

1. **Check the FAQ** above
2. **View logs:** `%APPDATA%\IceHeat\logs\IceHeat.log`
3. **GitHub Issues:** [Report bug](https://github.com/rdaxer/IceHeat-v5-/issues)
4. **Documentation:** [Wiki](https://github.com/rdaxer/IceHeat-v5-/wiki)

**Before reporting issues, please include:**
- Windows version (`winver`)
- IceHeat version (Menu → Help → About)
- Steps to reproduce
- Log file content (`%APPDATA%\IceHeat\logs\`)
- System specs (RAM, GPU, processor)

---

## 🔗 Useful Links

- **GitHub Repository:** https://github.com/rdaxer/IceHeat-v5-
- **Release Downloads:** https://github.com/rdaxer/IceHeat-v5-/releases
- **Issue Tracker:** https://github.com/rdaxer/IceHeat-v5-/issues
- **Wiki/Documentation:** https://github.com/rdaxer/IceHeat-v5-/wiki

---

## 📝 Version Information

| Component | Version | Notes |
|-----------|---------|-------|
| Application | 1.0.0 | Production release |
| Electron | 28.0.0 | Desktop framework |
| FFmpeg | 6.0+ | Built-in, auto-downloaded |
| Minimum Windows | 10 Build 1909 | 2018-H2 update |
| Node.js (dev) | 18.0+ | For building from source |

---

## 🎉 Getting Started

After installation:

1. **Launch IceHeat Desktop** from Start Menu
2. **Upload** a video (drag & drop or click Upload)
3. **Analyze** scenes (automatic detection)
4. **Edit** timeline (add music, effects, subtitles)
5. **Export** to your platform (TikTok, Instagram, YouTube, etc.)
6. **(Optional) Refine** in Filmora
7. **Share** directly to platforms

**Typical workflow time:** 5-15 minutes per reel

---

**Thank you for using IceHeat Desktop! 🎬**

*Last updated: 2024-06-28*  
*For the latest version, visit: https://github.com/rdaxer/IceHeat-v5-*
