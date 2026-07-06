# 🎬 VideoReel Pro - Windows Build Anleitung

**Einfache Schritt-für-Schritt Anleitung zum Bauen der .exe Datei**

---

## ⚡ Schnellstart (5 Minuten)

### 1️⃣ Repository klonen
Öffne **Command Prompt** (cmd.exe) und gib ein:

```cmd
cd C:\Users\%USERNAME%
git clone https://github.com/rdaxer/IceHeat-v5-.git
cd IceHeat-v5-
git checkout claude/video-reel-generator-k50ypd
```

### 2️⃣ Dependencies installieren
```cmd
npm install
```
⏱️ **Dauert 2-5 Minuten** (Electron wird heruntergeladen)

### 3️⃣ .exe bauen
```cmd
npm run build
```
⏱️ **Dauert 5-10 Minuten**

### ✅ Fertig!
Die .exe-Dateien sind jetzt im Ordner `dist/`:
- **IceHeat Desktop-1.0.0-win-x64-installer.exe** ← Benutzer installieren dies
- **IceHeat Desktop-1.0.0-win-x64-portable.exe** ← Portable Version

---

## 📦 Was wird gebaut?

Professionelle Windows Desktop-Anwendung mit:
- ✅ Automatische Videoanalyse
- ✅ Musiksynchronisation
- ✅ Hook-Generierung
- ✅ Auto-Untertitel
- ✅ FFmpeg Videoencoding
- ✅ GPU-Beschleunigung (NVIDIA/Intel/AMD)
- ✅ Filmora Integration
- ✅ Auto-Update System
- ✅ System Tray Integration

---

## 🚀 Installer ausführen

Doppelklick auf die .exe-Datei und folge dem Setup-Assistent:

1. Wähle Installationsort (Standard: `C:\Program Files\`)
2. Akzeptiere Berechtigungen
3. Warte auf Installation (~30 Sekunden)
4. Starten aus dem Start-Menü

---

## ⚙️ Voraussetzungen

✅ Windows 10/11  
✅ Node.js 18+ ([Download](https://nodejs.org))  
✅ npm 9+ (kommt mit Node.js)  
✅ Git ([Download](https://git-scm.com))  
✅ ~500MB freier Speicher  
✅ ~10 Minuten Zeit

---

## 🔧 Probleme?

**npm install hängt fest?**
```cmd
npm cache clean --force
npm install
```

**electron-builder nicht gefunden?**
```cmd
npm install -g electron-builder
npm install
```

**Port 3000 bereits in Verwendung?**
```cmd
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## 📝 Weitere Befehle

```cmd
# App im Development starten (mit DevTools)
npm start

# Nur bauen (keine Veröffentlichung)
npm run build

# Bauen und zu GitHub veröffentlichen
npm run build:release

# Code-Qualität prüfen
npm run lint

# Tests ausführen
npm test
```

---

## 📁 Ordnerstruktur nach Build

```
IceHeat-v5-/
├── dist/                          (🎯 HIER sind die .exe-Dateien!)
│   ├── IceHeat Desktop-...-installer.exe
│   ├── IceHeat Desktop-...-portable.exe
│   └── electron-builder/
├── src/
│   ├── main/
│   │   ├── index.js              (Electron Hauptprozess)
│   │   ├── services/             (FFmpeg, Filmora, Update, etc.)
│   │   └── ipc/                  (IPC Verbindungen)
│   └── preload.js
├── reel/
│   ├── index.html                (UI)
│   ├── js/                       (Video-Module)
│   └── api/                      (API-Bridges)
├── build/
│   └── icons/                    (App Icons)
├── package.json
├── electron-builder.json
└── index.html
```

---

## 🎯 Nächste Schritte

1. ✅ Repository klonen
2. ✅ npm install
3. ✅ npm run build
4. ✅ Installer in dist/ öffnen
5. ✅ App testen
6. ✅ Zu Benutzern verteilen!

---

**Fragen?** Siehe [BUILD_INSTRUCTIONS.md](./BUILD_INSTRUCTIONS.md) oder [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)

**Status:** ✅ **BEREIT ZUM BAUEN**

*Viel Erfolg! 🚀*
