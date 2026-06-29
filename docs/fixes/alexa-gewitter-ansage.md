# Fix: Alexa-Sprachansage bei Gewitterwarnung

**Datum:** 2026-06-29
**Symptom:** Alexa hat die Gewitterwarnung nicht angesagt. Home Assistant
zeigte im Log eine Status-/Fehlermeldung.

## Ursache

Die Ansage-Automationen riefen die Alexa-Ansagen im veralteten
Legacy-Notify-Service-Stil auf:

```yaml
- action: notify.wohnzimmer_wohnzimmer_durchsagen   # existiert NICHT als Service
  data:
    message: "..."
```

Mit der neuen Integration **Alexa Devices** (`alexa_devices`) sind die
Durchsagen aber **Entities** der `notify`-Plattform, keine Services. Es gibt
nur die Services `notify.send_message`, `notify.persistent_notification`,
die Mobile-App-Services und `notify.notify`. Der Aufruf
`action: notify.<entity>` schlägt daher fehl:

```
Action notify.wohnzimmer_wohnzimmer_durchsagen not found
```

Zusätzlich verwies die 60-Minuten-Gewitter-Automation auf eine gar nicht
existierende Entity `notify.wohnzimmer_durchsagen` (richtig ist
`notify.wohnzimmer_wohnzimmer_durchsagen`).

## Korrektur (in Home Assistant via API umgesetzt)

Alle betroffenen Ansage-Automationen wurden auf den korrekten
`notify.send_message`-Aufruf mit `target.entity_id` umgestellt:

```yaml
- action: notify.send_message
  target:
    entity_id: notify.wohnzimmer_wohnzimmer_durchsagen
  data:
    message: "..."
```

Betroffene Automationen:

- `automation.gewitter_fenster_auf_60_minuten_vorwarnung`
  (zusätzlich falscher Entity-Name `notify.wohnzimmer_durchsagen` →
  `notify.wohnzimmer_wohnzimmer_durchsagen` korrigiert)
- `automation.gewitter_fenster_auf_30_minuten_wiederholung`
- `automation.erdbeben_alexa_warnung`
- `automation.rauchmelder_alexa_alarm` (sicherheitskritisch – gleicher Defekt)

## Offener Punkt (Hardware/Netzwerk, nicht per Software behebbar)

Die Echo-Entities (`media_player.ellis_echo_dot` sowie die zugehörigen
`notify.*_durchsagen`) sind seit dem 27.06.2026 durchgehend `unavailable`,
obwohl die Integration `alexa_devices` fehlerfrei geladen ist. Ein Reload der
Integration hat die Geräte nicht zurückgeholt.

Das deutet auf offline-Echo-Geräte hin. Bitte prüfen:

1. Sind die Echo-Geräte eingeschaltet und mit dem WLAN verbunden?
2. Funktionieren sie in der Alexa-App?
3. Ggf. Integration **Alexa Devices** in HA neu authentifizieren
   (Einstellungen → Geräte & Dienste → Alexa Devices).

Erst wenn die Entities wieder `available` sind, kann Alexa die Ansagen
tatsächlich abspielen – der Automations-Fix oben ist die Voraussetzung dafür,
behebt aber nicht die Geräte-Verfügbarkeit.
