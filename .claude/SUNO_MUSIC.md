# Suno Music & Lyrics Generation

## 🎵 Suno Integration

Automatische Generierung von Musik und Liedtexten mittels Suno AI.

### Features

✅ Text-to-Music Generierung
✅ Lyrics Auto-Generierung
✅ Style/Genre Customization
✅ Duration & BPM Control
✅ Multiple Voice Options
✅ MP3/WAV Export

## 🚀 Quick Start

### 1. Musik generieren
**Prompt:**
```
"Generate a upbeat pop song about summer with energetic vocals"
```

**Automatisch:**
- Suno API aufrufen
- Song generieren lassen
- Lyrics extrahieren
- MP3 exportieren

### 2. Liedtext generieren
**Prompt:**
```
"Write lyrics for a love song in German with 3 verses and chorus"
```

**Automatisch:**
- Langzeitreim-Struktur
- Emotionale Tiefe
- Genre-appropriate Vokabular

### 3. Batch-Musik erstellen
**Prompt:**
```
"Generate 5 different background music tracks for presentations"
```

**Automatisch:**
- Alle parallel generiert
- Verschiedene Styles
- Ready-to-use Files

## 🎯 Integration mit anderen Tools

### Mit Home Assistant
```yaml
automation:
  - alias: "Musik zu Tageszeit"
    trigger: time
      at: "07:00:00"
    action:
      - service: media_player.play_media
        target:
          entity_id: media_player.living_room
        data:
          media_content_id: "/local/morning-music.mp3"
          media_content_type: "music/mp3"
```

### Mit Dashboards (Canva)
```
Musik-Player Widget
- Aktuelle Musik anzeigen
- Play/Pause Controls
- Volume Slider
- Next/Previous Buttons
```

### Mit Claude Design
```
Musikvideo-Thumbnail generieren
- Album Art Design
- Song-Text als Overlay
- Farb-Matching zum Mood
```

## 📋 Parameter

### Music Generation
- **Prompt**: Beschreibung (max 1000 chars)
- **Style**: Genre/Stil (pop, rock, jazz, ambient, etc.)
- **Duration**: 15s, 30s, 60s, custom
- **Mood**: happy, sad, energetic, calm, epic
- **Voice**: male, female, group, instrumental
- **Language**: Englisch, Deutsch, Spanisch, etc.

### Lyrics Generation
- **Theme**: Was soll das Lied handeln
- **Structure**: Verse-Chorus-Verse, Verse-Bridge-Chorus
- **Rhyme Scheme**: AABB, ABAB, ABCABC
- **Language**: Deutsche, Englische oder gemischte Lyrics
- **Tone**: Romantic, funny, serious, motivational

## 🔄 Workflow

```
1. User request
   ↓
2. Prompt validieren
   ↓
3. Suno API aufrufen
   ↓
4. Generation warten (30-60 Sekunden)
   ↓
5. Musik/Lyrics erhalten
   ↓
6. Auto-Export als MP3/WAV
   ↓
7. Optional: In HA/Dashboard integrieren
```

## 💾 Export Formate

- MP3 (komprimiert, web-ready)
- WAV (unkomprimiert, Bearbeitung)
- MIDI (für weitere Produktion)
- JSON (Lyrics + Metadaten)

## 🎨 Tipps für beste Ergebnisse

### Musik-Prompts
- Spezifisch sein: "upbeat indie pop with ukulele" statt "happy music"
- Mood + Genre + Instrumente
- Beispiel: "Fast-paced electronic dance music with synths and drums"

### Lyrik-Prompts
- Konkretes Thema nennen
- Zielgruppe beschreiben
- Tonalität festlegen
- Beispiel: "Write romantic German lyrics about a sunset, 4 verses"

## 🔐 API Keys

Erforderlich in `.env`:
```
SUNO_API_KEY=your_api_key
SUNO_API_ENDPOINT=https://api.suno.ai
```

## ⚙️ Automatische Anwendung

Bei folgenden Prompts wird Suno automatisch genutzt:
- "Generiere eine Musik für..."
- "Schreib mir ein Lied über..."
- "Erstelle einen Song mit..."
- "Komponiere Musik für..."
- "Generiere Liedtext für..."

## 📊 Status

- ✅ Integration konfiguriert
- ⏳ API Key erforderlich
- ⏳ Erste Musik-Generierung bereit
