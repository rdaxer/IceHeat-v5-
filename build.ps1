# VideoReel Pro - Automatisches Build-Script für Windows
# Ausführung: powershell -ExecutionPolicy Bypass -File build.ps1

Write-Host "🎬 VideoReel Pro - Build Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Schritt 1: Prüfe ob Node.js installiert ist
Write-Host "✓ Prüfe Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  ✅ Node.js $nodeVersion gefunden" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Node.js nicht gefunden!" -ForegroundColor Red
    Write-Host "  Bitte installieren: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# Schritt 2: Prüfe ob npm installiert ist
Write-Host "✓ Prüfe npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "  ✅ npm $npmVersion gefunden" -ForegroundColor Green
} catch {
    Write-Host "  ❌ npm nicht gefunden!" -ForegroundColor Red
    exit 1
}

# Schritt 3: Installiere Dependencies
Write-Host ""
Write-Host "✓ Installiere Dependencies (kann 5 Minuten dauern)..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ npm install fehlgeschlagen!" -ForegroundColor Red
    exit 1
}

Write-Host "  ✅ Dependencies installiert" -ForegroundColor Green

# Schritt 4: Baue die Anwendung
Write-Host ""
Write-Host "✓ Baue Windows Installer und portable.exe..." -ForegroundColor Yellow
Write-Host "  (Dieser Schritt dauert 5-10 Minuten)" -ForegroundColor Gray
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Build fehlgeschlagen!" -ForegroundColor Red
    exit 1
}

# Schritt 5: Erfolgreich!
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ BUILD ERFOLGREICH!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📦 Deine Dateien sind hier:" -ForegroundColor Cyan
Write-Host "  📁 dist/IceHeat Desktop-1.0.0-win-x64-installer.exe" -ForegroundColor White
Write-Host "  📁 dist/IceHeat Desktop-1.0.0-win-x64-portable.exe" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Was jetzt?" -ForegroundColor Cyan
Write-Host "  1. Öffne dist/" -ForegroundColor White
Write-Host "  2. Doppelklick auf -installer.exe" -ForegroundColor White
Write-Host "  3. Folge dem Setup-Assistent" -ForegroundColor White
Write-Host "  4. App im Start-Menü starten!" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tipp: Öffne dist/ jetzt?" -ForegroundColor Yellow
$openDist = Read-Host "  (j/n)"
if ($openDist -eq "j" -or $openDist -eq "J") {
    explorer .\dist
}

Write-Host ""
Write-Host "✨ Fertig! Viel Spaß mit VideoReel Pro! 🎬" -ForegroundColor Green
