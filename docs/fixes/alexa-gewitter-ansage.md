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

## Kritischer Blocker: YAML-Fehler in configuration.yaml

**Status:** Die Automations-Fixes sind in der Datenbank korrekt gespeichert (verifiziert per `config_hash`), können aber **NICHT in die Runtime geladen werden**, weil ein YAML-Syntaxfehler die `automation.reload`-Aktion blockiert.

**Fehlermeldung:**
```
mapping values are not allowed here
in "/config/configuration.yaml", line 83, column 20
```

**Behebung erforderlich:**
1. Öffne `/config/configuration.yaml` im Editor (nicht per HA UI – diese kann nicht geladen werden)
2. Gehe zu Zeile 83
3. Prüfe auf unquotierte Doppelpunkte (`:`) in Werten oder falsche Einrückung
4. Typische Fehler:
   - Wert mit `:` ohne Anführungszeichen: `key: value: with: colons`
   - Sollte sein: `key: "value: with: colons"`
5. Speichere die Datei
6. **Starten Sie Home Assistant neu** oder verwenden Sie Developer Tools > Services > `automation.reload`

**Nach dem Fix:**
Alle vier Automationen werden automatisch mit der korrekten `notify.send_message`-Struktur geladen:
- `automation.gewitter_fenster_auf_60_minuten_vorwarnung` (config_hash: 97bf39087ce6bdcf)
- `automation.gewitter_fenster_auf_30_minuten_wiederholung` (config_hash: 011be1d760e24b91)
- `automation.erdbeben_alexa_warnung`
- `automation.rauchmelder_alexa_alarm`

---

## Zusätzlicher Punkt: Hardware/Netzwerk (nicht per Software behebbar)

Die Echo-Entities (`media_player.ellis_echo_dot` sowie die zugehörigen
`notify.*_durchsagen`) waren während der Behebung zeitweise `unavailable`,
obwohl die Integration `alexa_devices` fehlerfrei geladen ist.

Das deutet auf Netzwerk-/Hardware-Probleme hin. Bitte prüfen:

1. Sind die Echo-Geräte eingeschaltet und mit dem WLAN verbunden?
2. Funktionieren sie in der Alexa-App?
3. Ggf. Integration **Alexa Devices** in HA neu authentifizieren
   (Einstellungen → Geräte & Dienste → Alexa Devices).

Erst wenn die Entities wieder `available` sind, kann Alexa die Ansagen
tatsächlich abspielen – der Automations-Fix oben ist die Voraussetzung dafür,
behebt aber nicht die Geräte-Verfügbarkeit.
