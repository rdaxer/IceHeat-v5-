@echo off
REM VideoReel Pro - Windows Build Script
REM Einfach doppelklick und fertig!

setlocal enabledelayedexpansion

echo.
echo 🎬 VideoReel Pro - Build Script
echo ================================
echo.

REM Prüfe Node.js
echo Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ Node.js nicht gefunden!
    echo.
    echo Bitte herunterladen und installieren von:
    echo https://nodejs.org
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo ✅ Node.js %NODE_VER% gefunden
echo.

REM Prüfe npm
echo Checking npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm nicht gefunden!
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VER=%%i
echo ✅ npm %NPM_VER% gefunden
echo.

REM Installiere Dependencies
echo Installing dependencies (kann 5 Minuten dauern)...
echo.
call npm install
if errorlevel 1 (
    echo.
    echo ❌ npm install fehlgeschlagen!
    pause
    exit /b 1
)
echo ✅ Dependencies installiert
echo.

REM Baue die App
echo Baue Windows Installer und portable.exe...
echo (Dauert 5-10 Minuten - bitte warten...)
echo.
call npm run build

if errorlevel 1 (
    echo.
    echo ❌ Build fehlgeschlagen!
    pause
    exit /b 1
)

REM Erfolgreich!
echo.
echo ================================
echo ✅ BUILD ERFOLGREICH!
echo ================================
echo.
echo 📦 Deine Dateien sind hier:
echo    dist\IceHeat Desktop-1.0.0-win-x64-installer.exe
echo    dist\IceHeat Desktop-1.0.0-win-x64-portable.exe
echo.
echo 🚀 Was jetzt?
echo    1. Öffne den dist/ Ordner
echo    2. Doppelklick auf -installer.exe
echo    3. Folge dem Setup-Assistent
echo    4. App im Start-Menü starten!
echo.
echo 💡 Öffne dist/ jetzt? (j/n)
set /p openDist=
if /i "%openDist%"=="j" (
    start .\dist
)

echo.
echo ✨ Fertig! Viel Erfolg mit VideoReel Pro!
echo.
pause
