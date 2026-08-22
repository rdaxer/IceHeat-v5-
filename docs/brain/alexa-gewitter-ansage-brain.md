# 🧠 Gehirn: Alexa-Gewitter-Ansage funktioniert nicht

> Persistente Wissensdatei für die Aufgabe „Alexa sagt bei Gewitter/Unwetter nichts an".
> Letzte Aktualisierung: 2026-08-21

## ✅ GELÖST am 2026-08-21 — Alexa spricht wieder

Die **Alexa-Devices-Integration ist wieder `loaded`** (Amazon-/Bibliotheks-Bug durch spätere
HA/Library-Updates behoben). Live getestet 2026-08-21: Sprachdurchsage auf **Wohnzimmer + Küche
funktioniert hörbar** ✅. Zusätzlich läuft der 2026-07-15 gebaute **Handy-Push-Fallback** (Edge 60 +
Nothing, Alarm-Ton) als Absicherung weiter. Warnlogik am 2026-08-21 auf **zweistufig** erweitert
(siehe unten). Der historische Abschnitt darunter dokumentiert den früheren Defekt.

- ⚠️ **Bad-Echo** war beim Test offline (`notify.bad_durchsagen` = unavailable) — kein Warnungsproblem,
  Wohnzimmer + Küche + Handys decken ab. Bei Bedarf Strom/WLAN des Bad-Echos prüfen.
- Küche sprach beim 1. Test scheinbar nicht → war nur Standort; DND (`switch.kuche_bitte_nicht_storen`)
  war off, Lautstärke ok. 2. Test bestätigt hörbar ✅.

## Kurzfassung (TL;DR) — HISTORISCH (Stand bis 2026-08-21, jetzt überholt)

Die Gewitter-/Unwetter-Ansagen liefen **nicht hörbar**, weil die **Alexa-Devices-Integration
nicht lud** (`setup_retry`). Ursache war ein **damals ungefixter Bibliotheks-Bug**:
`aioamazondevices` konnte die *Account-Owner-Customer-ID* nicht ermitteln, wenn ein Amazon-Konto
**viele App-/Geräte-Registrierungen** hat. Die HA-Automationen selbst waren **korrekt** — sie
warteten nur auf verfügbare Geräte. (→ Inzwischen behoben, siehe Abschnitt oben.)

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

### Fallback-Kanäle — EINGEBAUT am 2026-07-15 ✅ (finalisiert)
In beide Gewitter-Automationen (`…60_minuten_vorwarnung`, `…30_minuten_wiederholung`):
- Alexa-Ansagen mit `continue_on_error: true` (totes Echo bricht die Automation nicht mehr ab)
- Fallback-Block (`actions[2]`, parallel):
  - `notify.mobile_app_motorola_edge_60` (Edge 60)
  - `notify.mobile_app_a059p` (Nothing Phone — Modell A059P)
  - `persistent_notification.create` (`notification_id: gewitter_warnung`)
- **Ton/Klingeln:** Legacy-mobile_app-Dienste mit `data: {ttl: 0, priority: high,
  channel: alarm_stream, tag: gewitter_warnung}` → klingelt auf Alarm-Lautstärke, umgeht „Nicht stören".
- Warntext identisch zur Alexa-Ansage.
- **Nur 2 Handys** (Xiaomi `notify.xiaomi` / `notify.mobile_app_2112123ag` entfernt — existiert nicht mehr).
- ⚠️ Ton geht NUR über die Legacy-Dienste `notify.mobile_app_*` (mit verschachteltem `data.data`),
  NICHT über `notify.send_message` (das unterstützt keine app-spezifischen `data`).
- Hinweis: Nutzer hatte Fallback am 2026-07-05 zunächst abgelehnt, am 2026-07-15 dann gewünscht.

### Warnumfang ERWEITERT am 2026-08-21 ✅ (zweistufige Logik)
Anlass: Nutzer meldete „keine Töne/keine Gewitter angesagt". Diagnose (kein Defekt!):
Die Automationen liefen sauber (stündliche/30-min time_pattern, Traces = `failed_conditions`),
aber der Headline-Filter reagierte **nur auf `gewitter`**. Reale Warnungen seit 17. Aug waren
**Starkregen** (z.B. 21. Aug 09:55–20:00 „Amtliche WARNUNG vor STARKREGEN") → korrekt, aber
für den Nutzer unerwünscht, ignoriert. Zuletzt echt ausgelöst: 17. Aug 20:09 (damals Gewitter).

**Neue Logik (auf Wunsch des Nutzers):**
- **TIER A — nur wenn Fenster offen** (Fenster-zu-Ansage): `gewitter | starkregen`
- **TIER B — immer, fensterunabhängig** (Sicherheits-Ansage): `orkan | hagel | glatteis | schneefall | hitze`

Umsetzung in `…60_minuten_vorwarnung` (das „Gehirn"):
- Top-Level-Conditions bleiben nativ: OR(Sensor 1/2/3 on) + `time 05:00–22:00`.
- Headline-Regex + Fenster-Logik als `variables:` (Reihenfolge zählt — spätere Vars nutzen frühere):
  `offene_fenster` → `hat_fenster_offen` → `headlines` → `treffer_fenster` (`(?i)(gewitter|starkregen)`)
  → `treffer_extrem` (`(?i)(orkan|hagel|glatteis|schneefall|hitze)`) → `passende_headline`
  → `soll_warnen` (`treffer_extrem or (treffer_fenster and hat_fenster_offen)`) → `ansage`/`push_titel`.
- Danach `condition: template {{ soll_warnen }}` als Stop; sonst identischer Alexa+Push-Block.
- Ansagetext: Extrem → „Achtung! {headline} … Vorsichtsmaßnahmen"; Fenster → „… Folgende Fenster offen …".
- ⚠️ `condition: template` löst eine Best-Practice-Warnung aus — **bewusst akzeptiert**: Regex auf
  ein `attribute` + Fensterabhängigkeit haben kein natives Äquivalent.

`…30_minuten_wiederholung`: bleibt reiner Fenster-zu-Reminder → Filter nur auf `gewitter|starkregen`
erweitert, Extremereignisse **NICHT** wiederholt (sonst 30-min-Spam bei Hitze/Orkan). Text generisch
(`passende_headline` statt hartem „Gewitter").
- DWD-Headline-Format ist GROSS („WARNUNG vor STARKREGEN"), Regex daher case-insensitive `(?i)`.
- Getestet 2026-08-21: Template-Logik (Starkregen→Tier A, Orkan/Hitze→Tier B) + Push-Ton auf beiden Handys ✅.

### Erdbeben-Ansage KOMPLETT NEU GEBAUT am 2026-08-21 ✅ (`automation.erdbeben_alexa_warnung`)
Anlass: Nutzer bat um Prüfung „auf Funktion und Logik". Befund: **war komplett funktionsunfähig**
(`last_triggered: null`, konnte nie feuern). Vier Fehler:
1. **Falsche Quelle:** hörte auf `source: usgs_earthquakes_feed` — Integration **nicht installiert**.
   Tatsächlich läuft **GDACS** (`source: gdacs`, entry `01JKP45BCDWZNAY1SN4M9WF017`, Radius **2500 km**,
   scan 300 s, zentriert 48.0576 / 12.1699).
2. **Falscher Trigger:** `event: geo_location_new_state` existiert nicht → nativer **`geo_location`-Trigger**.
3. **Falsche Attribute:** las `magnitude`/`place` — GDACS liefert `event_type`, `alert_level`, `severity`
   (String „Magnitude 5.2M, Depth:10km"), `country`, `description`; State = Entfernung in km.
4. Kein `continue_on_error`, kein Handy-Fallback.

**Neuer Aufbau (Nutzerwahl: ≤ 300 km, ALLE Beben, jede Alarmstufe):**
- Neue **Zone `zone.erdbeben_umkreis`** (Radius 300000 m um Zuhause, `passive: false` — passiv würde
  den Trigger blockieren!). Über `ha_set_zone` angelegt.
- Trigger: `{trigger: geo_location, source: gdacs, zone: zone.erdbeben_umkreis, event: enter}`.
- Conditions (template, mangels nativem Attribut-Filter): `event_type` enthält „earthquake"
  + **Frische-Filter** (`from_date` < 3 h) gegen Wiederholung alter Beben nach HA-Neustart.
- Variables: `distance` (State→km, gerundet), `land` (country), `alarmstufe` (Red/Orange/Green→Rot/Orange/Grün),
  `magnitude` (erste Zahl aus `severity` via `regex_findall`, Fallback = ganzer severity-String), `ansage`.
- Ansage: „Achtung, Erdbeben! Stärke {mag} in {land}, etwa {km} Kilometer entfernt. Alarmstufe {x}."
- 3× Alexa (`continue_on_error`) + Fallback-Push (Edge 60 + a059p, `alarm_stream`, `tag: erdbeben_warnung`)
  + persistent_notification. `mode: parallel`, `max: 5`.
- Getestet 2026-08-21: Template-Logik (Magnitude-Parse, Alarmstufe, Frische) + Push auf beiden Handys ✅.
  Live-Auslösung nicht testbar (aktuell kein Beben ≤300 km); GDACS listet gerade nur Dürre/Flut/Waldbrand.
- ⚠️ Offen/Knöpfe: (a) keine Nachtruhe — Beben werden 24/7 angesagt (Sicherheit); bei Bedarf Zeitfenster
  ergänzen. (b) `country`/severity sind teils englisch. (c) Radius/Alarmstufe jederzeit über Zone bzw.
  eine `alert_level`-Condition anpassbar.

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
