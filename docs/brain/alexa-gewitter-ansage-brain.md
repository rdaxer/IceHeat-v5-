# 🧠 Gehirn: Alexa-Gewitter-Ansage funktioniert nicht

> Persistente Wissensdatei für die Aufgabe „Alexa sagt bei Gewitter/Unwetter nichts an".
> Letzte Aktualisierung: 2026-07-15

## Kurzfassung (TL;DR)

Die Gewitter-/Unwetter-Ansagen laufen **nicht hörbar**, weil die **Alexa-Devices-Integration
nicht lädt** (`setup_retry`). Ursache ist ein **bekannter, noch ungefixter Bibliotheks-Bug**:
`aioamazondevices` kann die *Account-Owner-Customer-ID* nicht ermitteln, wenn ein Amazon-Konto
**viele App-/Geräte-Registrierungen** hat. Die HA-Automationen selbst sind **korrekt** — sie
warten nur auf verfügbare Geräte.

## Bestätigte Fehlerursache (Debug-Beweis)

Aus dem HA-Debug-Log (`aioamazondevices` auf DEBUG, 2026-07-05):

```
aioamazondevices.exceptions.CannotRetrieveData: Cannot find account owner customer ID
  File ".../aioamazondevices/login.py", line 504, in obtain_account_customer_id
  File ".../aioamazondevices/login.py", line 394, in login_mode_stored_data
```

- Login bei `alexa.amazon.de` klappt ✅
- Geräteliste wird 3× erfolgreich geladen ✅ (Echos sind sogar `online: True`)
- **Letzter Schritt scheitert:** Owner-Customer-ID kann nicht aus der Antwort ermittelt werden ❌

## Zwei Bug-Varianten (wichtig, nicht verwechseln)

| Variante | GitHub | Status | Betrifft uns? |
|---|---|---|---|
| `Request failed: Service Unavailable` | [core #175079](https://github.com/home-assistant/core/issues/175079) | ✅ geschlossen, Fix in 2026.7.0 | War früher sichtbar, **nicht mehr die Ursache** |
| `Cannot find account owner customer ID` | [core #174991](https://github.com/home-assistant/core/issues/174991) · [core #154191](https://github.com/home-assistant/core/issues/154191) | ⚠️ **offen** | ✅ **JA — das ist der aktuelle Fehler** |

### Upstream-Bibliothek (dort landet der echte Fix)
- **[aioamazondevices #949](https://github.com/chemelli74/aioamazondevices/issues/949)** —
  „obtain_account_customer_id fails … **on accounts with many app-device registrations**"
  → **offen**, kein Fix (eröffnet 2026-07-04). **Exakt unser Fall.**
- **aioamazondevices #625** — „feat: store account customer id" → der eigentliche Fix, **in Arbeit**.
- Neueste Bibliotheks-Version: **v14.2.0 (2026-07-04)** — enthält **keinen** Customer-ID-Fix.
  HA 2026.7.1 bündelt v14.1.3.

## ⚠️ Schlüssel-Erkenntnis
Jedes **Neu-Hinzufügen** der Integration registriert ein weiteres App-Gerät bei Amazon
(„…AioAmazonDevices"). Das **verschlimmert** die #949-Bedingung („viele App-Registrierungen").
→ **Nicht wiederholt löschen/neu hinzufügen.** Stattdessen: alte/Ghost-Registrierungen bei
Amazon **aufräumen**.

Im Debug-Log auffällig: mehrere **Ghost-/Fehl-Geräte** mit kaputten Namen
`Rainer's Reverb.ai (Reverb.ai) (Reverb.ai) …` (Familie `THIRD_PARTY_AVS_MEDIA_DISPLAY`) und ein
`This Device` (VOX) mit **4** `appDeviceList`-Einträgen → Kandidaten zum Deregistrieren.

## Workaround-Kandidaten (nicht garantiert, da Upstream-Bug)
1. **Amazon-Konto aufräumen:** unter amazon.de → *Geräte / Inhalte & Geräte* alte/ungenutzte
   und Ghost-Geräte (v. a. die doppelten „Reverb.ai"-AVS-Einträge, alte App-Sessions)
   **deregistrieren** → reduziert die App-Registrierungen aus #949.
2. **Primäres Konto-Owner-Login** verwenden (Rainerdachs@…), Land **Deutschland**.
3. **Abwarten** auf aioamazondevices-Fix (#625/#949), der in ein HA-Patch-Release (2026.7.x) kommt.
4. **Fallback** (siehe unten), damit Warnungen bis dahin ankommen.

## Zustand der HA-Konfiguration (alles korrekt — nur Geräte fehlen)

### System
- HA-Version: **2026.7.1** (Update bereits drauf)
- Integration `alexa_devices`, entry_id `01KVZNQYK71F9R3E9A1J81E97N`, Konto `Rainerdachs@googlemail.com`
  → Status **`setup_retry`**

### Sprachausgabe-Entities (alle aktuell `unavailable`)
- `notify.wohnzimmer_wohnzimmer_durchsagen`
- `notify.kuche_durchsagen`
- `notify.bad_durchsagen`
- `notify.uberall_durchsagen`

### Betroffene / reparierte Automationen
Legacy-Muster `action: notify.<entity>` ist **ungültig** → muss `notify.send_message` + `target.entity_id` sein.
- ✅ `automation.gewitter_fenster_auf_60_minuten_vorwarnung` — gefixt
- ✅ `automation.gewitter_fenster_auf_30_minuten_wiederholung` — gefixt
- ✅ `automation.erdbeben_alexa_warnung` — gefixt
- ✅ `automation.rauchmelder_alexa_alarm` — gefixt
- ✅ `automation.mullabfuhr_alexa_erinnerung_morgen` — gefixt am 2026-07-15 (Wohnzimmer/Küche/Bad)
- ❓ **TODO:** restliche Automationen auf verbleibende `action: notify.<entity>`-Aufrufe prüfen

### Korrektes Muster (Referenz)
```yaml
- action: notify.send_message
  target:
    entity_id: notify.wohnzimmer_wohnzimmer_durchsagen
  data:
    message: "Achtung Gewitterwarnung …"
```

### Fallback-Kanäle — EINGEBAUT am 2026-07-15 ✅
In beide Gewitter-Automationen (`…60_minuten_vorwarnung`, `…30_minuten_wiederholung`):
- Alexa-Ansagen mit `continue_on_error: true` (totes Echo bricht die Automation nicht mehr ab)
- Neuer Fallback-Block danach: Push auf `notify.motorola_edge_60`, `notify.xiaomi`,
  `notify.nothing` (Nothing Phone) + persistente Notification (`notification_id: gewitter_warnung`)
- Warntext identisch zur Alexa-Ansage
- Hinweis: Nutzer hatte Fallback am 2026-07-05 zunächst abgelehnt, am 2026-07-15 dann doch gewünscht.

## Diagnose-Kochrezept (wie prüfen)
1. `ha_get_integration(query="alexa")` → Status prüfen (`loaded` = gut, `setup_retry` = kaputt).
2. `ha_get_state(["notify.wohnzimmer_wohnzimmer_durchsagen", …])` → `available`?
3. Debug an: `logger.set_level {aioamazondevices: debug}` → `homeassistant.reload_config_entry {entry_id}` →
   `ha_get_logs(source=error_log, search="amazon")`. Danach Level wieder auf `warning`.
4. Test bei verfügbaren Geräten:
   `notify.send_message` → `target.entity_id: notify.wohnzimmer_wohnzimmer_durchsagen`, `message: "Test"`.

## Was NICHT das Problem ist
- ❌ Nicht die Automationen (korrekt konfiguriert, `state: on`)
- ❌ Nicht die YAML-Config
- ❌ Nicht die Hardware (Echos sind laut Amazon-API online)
- ❌ Nicht der „Service Unavailable"-Bug (in 2026.7 bereits gefixt)

## Offene nächste Schritte
- [ ] Amazon-Konto: Ghost-/Doppel-Geräte deregistrieren, dann 1× Reload testen
- [ ] aioamazondevices #625/#949 beobachten; bei Fix → HA-Patch einspielen
- [x] Fallback (Handy-Push/Notification) in Gewitter-Automationen ergänzt (2026-07-15)
- [ ] Restliche Automationen auf Legacy-`notify.<entity>` prüfen
