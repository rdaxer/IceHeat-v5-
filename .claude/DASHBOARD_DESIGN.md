# Dashboard Design & Canva Integration

## 🎨 Canva Integration für Dashboard Design

Automatische Erstellung professioneller Dashboards mittels Canva AI.

### ✅ Verfügbare Canva Tools (38+)

**Design Generation:**
- `generate-design` - Designs aus Text generieren
- `generate-design-structured` - Präsentationen mit Outline
- `search-brand-templates` - Templates durchsuchen
- `create-design-from-candidate` - AI-Generated Designs speichern

**Design Management:**
- `search-designs` - Existierende Designs finden
- `copy-design` - Designs duplizieren
- `export-design` - PDF, PNG, JPG, PPTX exportieren

**Bearbeitung:**
- `start-editing-transaction` - Design bearbeiten
- `perform-editing-operations` - Elemente ändern
- `comment-on-design` - Feedback hinzufügen

## 🚀 Dashboard Templates

### 1. Home Assistant Dashboard
```
Komponenten:
- Oberfläche (Header + Navigation)
- Lights Control Section
- Climate/Thermostat
- Security & Doors
- Energy Monitoring
- Media Player
- System Status
```

### 2. Smart Home Monitor
```
Echtzeit-Übersicht:
- 8 große Status-Tiles
- Temperatur-Graphen
- Bewegungs-Sensor-Log
- Türzustand-Übersicht
- Energie-Verbrauch
- Alarmstatus
```

### 3. Geschäfts-Dashboard
```
KPI's:
- Sales Overview
- Customer Analytics
- Performance Metrics
- Task Management
- Calendar Integration
- Reports
```

## 📋 Quick Start

### Neues Dashboard generieren:

**Prompt:**
```
"Create a modern smart home dashboard for Home Assistant 
with lights, climate, security sections, dark theme"
```

**Automatisch:**
1. Canva Design generieren
2. Sektionen für alle Systeme
3. Dark/Light Theme anwenden
4. Icons & Colors optimieren
5. PDF & PNG exportieren

### Dashboard anpassen:

**Mit Python Transform:**
```python
# Neuen Section hinzufügen
config["sections"].append({
    "type": "grid",
    "columns": 2,
    "cards": [...]
})

# Farben ändern
for card in config["cards"]:
    if "icon_color" in card:
        card["icon_color"] = "#FF6B6B"
```

## 🎨 Design Best Practices

### Layout
✅ Responsive Design (Mobile + Desktop)
✅ Grid-basierte Layouts (12er Grid)
✅ Konsistente Spacing & Padding
✅ Hierarchie durch Größe & Farbe

### Farben
✅ 3-5 Hauptfarben (max)
✅ Hoher Kontrast für Lesbarkeit
✅ Dark Mode für Nacht
✅ Semantische Farben (rot=Fehler, grün=OK)

### Typography
✅ Max 2-3 Font-Familien
✅ Größen-Hierarchie
✅ Ausreichend Zeilenabstand
✅ Lesbar auf allen Displays

### Interaktivität
✅ Hover-States für Buttons
✅ Loading-Indikatoren
✅ Error-Messages sichtbar
✅ Feedback-Animation

## 🔗 Integration mit Home Assistant

### Schritt 1: Dashboard Design in Canva
```
1. Dashboard-Mockup generieren
2. Farben & Layout finalisieren
3. Als PNG/SVG exportieren
```

### Schritt 2: In HA-Lovelace integrieren
```yaml
views:
  - title: Custom Dashboard
    path: custom-design
    type: custom:canvas-display
    image: /local/dashboard-design.png
    cards: [...]
```

### Schritt 3: Live-Daten verbinden
```python
cards = [
    {
        "type": "tile",
        "entity": "light.living_room",
        "icon": "mdi:lightbulb",
        "show_entity_picture": true
    }
]
```

## 📊 Export Optionen

| Format | Use Case | Quality |
|--------|----------|---------|
| PNG | Web, Mobile | 72-300 DPI |
| PDF | Print, Sharing | Vector |
| JPG | Thumbnails | Web-optimized |
| PPTX | Presentations | Editable |
| SVG | Web (custom) | Vector |

## 🎯 Template-Galerie

### Health Dashboard
```
Komponenten:
- Heart Rate Monitor
- Sleep Tracking
- Workout Log
- Nutrition Info
- Daily Challenges
```

### Office Dashboard
```
Komponenten:
- Time Tracking
- Task Board
- Calendar
- Team Status
- Productivity Charts
```

### Entertainment Dashboard
```
Komponenten:
- Now Playing
- Playlist Manager
- Video Library
- Recommendations
- Listening History
```

## 🔄 Workflow

```
1. Design Brief
   ↓
2. Template wählen oder neu generieren
   ↓
3. Mit Canva AI Design erstellen
   ↓
4. Farben/Layout anpassen
   ↓
5. Icons & Images hinzufügen
   ↓
6. Responsive Überprüfung
   ↓
7. Export (PNG/PDF/SVG)
   ↓
8. In Home Assistant einbinden
```

## 💡 Pro-Tipps

1. **Brand Colors verwenden**: Konsistente Corporate Identity
2. **Icon-Set einheitlich**: Alle aus einer Familie
3. **Weiße Flächen nutzen**: Überforderung vermeiden
4. **Mobile-First denken**: Responsive von Start
5. **A/B Testing**: 2 Varianten generieren & vergleichen

## 🔐 Berechtigungen

Automatisch aktiviert in `.claude/settings.json`:
- `mcp__Canva__*` - Alle Canva Tools
- Keine zusätzlichen Prompts nötig

## 📈 Status

- ✅ Canva Integration konfiguriert
- ✅ 38+ Design-Tools verfügbar
- ✅ Auto-Generation aktiviert
- ✅ Home Assistant Ready
