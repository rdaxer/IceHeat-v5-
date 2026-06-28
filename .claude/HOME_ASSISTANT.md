# Home Assistant Integration Guide

## ✅ Verfügbare HA-MCP Tools

Diese Konfiguration aktiviert automatisch **72+ Home Assistant Tools** für:

### 🤖 Automationen
- `ha_config_set_automation` - Automationen erstellen/bearbeiten
- `ha_config_get_automation` - Automationen abrufen
- `ha_get_automation_traces` - Fehlersuche in Automationen
- Best-Practice Validierung automatisch aktiviert

### 📊 Dashboards
- `ha_config_set_dashboard` - Dashboards erstellen/ändern
- `ha_config_get_dashboard` - Dashboard-Konfiguration abrufen
- `ha_config_set_dashboard_resource` - Custom Cards & Ressourcen
- Moderne Lovelace-Best-Practices

### 🔧 Helpers & Integrationen
- `ha_config_get_category` - Kategorien für Organisation
- `ha_get_integration` - Integration Details
- `ha_set_integration_enabled` - Integrationen aktivieren

### 🎮 Services & Steuerung
- `ha_call_service` - Alle HA-Services aufrufen
- `ha_call_event` - Custom Events
- `ha_get_state` - Entity Status abrufen
- `ha_search` - Entities finden

### 📝 Logging & Debugging
- `ha_get_logs` - System, Error, Supervisor Logs
- `ha_get_automation_traces` - Execution Details

## 🚀 Best Practices (automatisch)

### Automationen
✅ Native Triggers/Conditions statt Templates
✅ Richtige Automation Modes (single, restart, queued, parallel)
✅ Numerische Conditions statt Template-Math
✅ State-Trigger für Entity-Änderungen

### Dashboards
✅ Moderne "sections" View-Architektur
✅ "tile" Cards als primäre Card-Type
✅ Grid-basierte Layouts
✅ Hierarchische Navigation mit Area Cards

### Code-Stil
✅ entity_id statt device_id verwenden
✅ Keine Template-Workarounds für native Features
✅ YAML-Konfiguration nur für Legacy-Helper
✅ UI-basierte Automationen bevorzugt

## 📋 Quick Start

### Automation erstellen:
```python
config = {
    "alias": "Meine Automation",
    "description": "Kurzbeschreibung",
    "trigger": [{"platform": "state", "entity_id": "light.living_room"}],
    "condition": [],
    "action": [{"service": "light.turn_on", "entity_id": "light.bedroom"}]
}
```

### Dashboard erstellen:
```python
config = {
    "views": [{
        "title": "Zuhause",
        "type": "sections",
        "sections": [{
            "type": "grid",
            "cards": [
                {"type": "tile", "entity": "light.living_room"},
                {"type": "tile", "entity": "climate.thermostat"}
            ]
        }]
    }]
}
```

### Services aufrufen:
```python
ha_call_service("light", "turn_on", 
    entity_id="light.bedroom",
    data={"brightness": 255, "color_temp": 4000})
```

## 🎯 Automatische Features bei Bedarf

1. **Automation erstellen** → Best-Practice-Validierung
2. **Dashboard designen** → Moderne Lovelace-Struktur
3. **Integration setup** → Automatische Konfiguration
4. **Fehler debuggen** → Traces & Logs automatisch
5. **Automationen testen** → Mock-Services für Tests

## 🔐 Berechtigungen

Alle HA-MCP Tools sind automatisch aktiviert in:
- `.claude/settings.json` → `"mcp__HA-MCP__*"`
- Keine zusätzlichen Prompts nötig

## 📚 Resources

- HA-MCP Skill Guide: `skill://home-assistant-best-practices/SKILL.md`
- Automation Patterns: Automatisch bei Bedarf geladen
- Dashboard Cards: Modern Lovelace Docs
- Integration List: `ha_get_integration()` alle aufgelistet
