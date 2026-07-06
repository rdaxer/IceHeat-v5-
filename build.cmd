@echo off
REM VideoReel Pro - 1-Klick Build fuer Windows
setlocal

echo.
echo ================================
echo   VideoReel Pro - Build
echo ================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [FEHLER] Node.js nicht gefunden. Bitte installieren: https://nodejs.org
  pause
  exit /b 1
)

echo Installiere Abhaengigkeiten...
call npm install
if errorlevel 1 ( echo [FEHLER] npm install fehlgeschlagen. & pause & exit /b 1 )

echo.
echo Baue Windows-App (Installer + Portable)...
call npm run build
if errorlevel 1 ( echo [FEHLER] Build fehlgeschlagen. & pause & exit /b 1 )

echo.
echo ================================
echo   FERTIG! Dateien in:  dist\
echo     VideoReel-Pro-1.0.0-Installer.exe
echo     VideoReel-Pro-1.0.0-Portable.exe
echo ================================
echo.
start "" ".\dist"
pause
