# 🎧 Medien-Dashboard – Home Assistant

Ein neues Dashboard **„Medien"** (`/medien-center`) wurde in Home Assistant angelegt.
Es bündelt alle Medienplayer übersichtlich in Karten für **Sonos**, **Spotify**,
**Alexa/Echo** und **TV** und ist in der Seitenleiste sichtbar (Icon `mdi:play-network`).

---

## 📋 Erkannte Medienplayer

| Bereich | Entity | Integration |
|---|---|---|
| **Sonos** | `media_player.wohnzimmer` (Alias „Sonos") | `sonos` |
| **Spotify** | `media_player.spotify_shaun_schaf` | `spotify` |
| **Alexa/Echo** | `media_player.wohnzimmer_wohnzimmer` (Echo Wohnzimmer) | `alexa_devices` |
| | `media_player.kuche` (Echo Küche) | `alexa_devices` |
| | `media_player.bad` (Echo Bad) | `alexa_devices` |
| | `media_player.ellis_echo_dot` (Elli Echo Dot) | `alexa_devices` |
| | `media_player.reverb` (Echo Reverb) | `alexa_devices` |
| | `media_player.uberall` (Alexa „Überall"-Gruppe) | `alexa_devices` |
| **TV** | `media_player.tv_samsung_6_series_70` | `dlna_dmr` |

> Hinweis: Die Alexa-Geräte melden sich zeitweise als `unavailable`, wenn sie im
> Standby sind. Die Karten füllen sich automatisch, sobald ein Gerät aktiv ist.

---

## 🗂️ Aufbau des Dashboards

Ansicht **„Übersicht"** (Typ `sections`, 3 Spalten) mit folgenden Abschnitten:

1. **🎧 Jetzt läuft** – große `media-control`-Karten (Cover, Fortschritt, Steuerung)
   für Sonos & Spotify.
2. **🔊 Sonos – Wohnzimmer** – Mushroom-Media-Player-Karte + Lautstärke-Slider.
3. **🟢 Spotify** – Mushroom-Karte (grün) + Tile mit Wiedergabe- & Lautstärke-Feature.
4. **🗣️ Alexa / Echo** – Raster aller Echo-Geräte als Mushroom-Karten.
5. **📺 TV** – `media-control`-Karte für den Samsung TV.
6. **⚡ Schnellsteuerung** – Buttons „Alles stoppen" / „Alles pausieren".

Verwendete Karten: **built-in** `media-control`, `tile`, `button`, `grid` +
**Mushroom** (`custom:mushroom-media-player-card`, bereits via HACS installiert).
Damit funktioniert das Dashboard sofort ohne weitere Installation.

---

## 🧩 Empfohlene HACS-Erweiterungen (optional, für mehr Komfort)

Diese Community-Karten/Integrationen erweitern das Medien-Dashboard deutlich.
Installation jeweils über **HACS → Frontend/Integration → Repository hinzufügen**.

### 1. Maxi Media Player (Sonos-Nachfolger) — empfohlen für Sonos
- **Repo:** https://github.com/punxaphil/maxi-media-player
- **Kategorie:** Dashboard (Lovelace)
- **Kann:** Lautsprecher gruppieren/entgruppen, Favoriten & Media-Browser, Queue,
  Einzel-Lautstärke – ideal wenn mehrere Sonos/Speaker zusammengeschaltet werden.
- **Community-Thread:** https://community.home-assistant.io/t/maxi-media-player/705007

### 2. Mini Media Player — kompakter Allrounder
- **Repo:** https://github.com/kalkih/mini-media-player
- **Kategorie:** Dashboard (Lovelace)
- **Kann:** Sehr kompakte Karte, Speaker-Gruppierung, Kurzbefehl-Buttons, Spotify-tauglich.

### 3. SpotifyPlus (Integration) + SpotifyPlus Card — für Power-Spotify
- **Integration:** https://github.com/thlucas1/homeassistantcomponent_spotifyplus
- **Karte:** https://github.com/thlucas1/spotifyplus_card
- **Kann:** Spotify-Katalog durchsuchen, Favoriten (Alben/Playlists/Künstler/Podcasts),
  Spotify-Connect-Geräteauswahl, eigene Presets/Empfehlungen.
- **Voraussetzung:** Erst die **Integration** installieren & einrichten. Für den
  Spotify-Web-API-Zugriff wird seit 2026 **Spotify Premium** benötigt.

### 4. Spotcast (zum Casten von Spotify auf beliebige Geräte)
- **Repo:** https://github.com/fondberg/spotcast
- **Kategorie:** Integration
- **Kann:** Spotify-Wiedergabe gezielt auf Sonos/Echo/Chromecast starten – auch aus
  Automationen heraus. Wird von *mini-media-player* für Spotify-Buttons genutzt.

### 5. Bereits installierte, nützliche Bausteine
- **Mushroom** – https://github.com/piitaya/lovelace-mushroom (im Dashboard genutzt)
- **button-card** – https://github.com/custom-cards/button-card
- **apexcharts-card** – https://github.com/RomRider/apexcharts-card (z. B. Hörstatistiken)
- **card-mod** – https://github.com/thomasloven/lovelace-card-mod (CSS-Feintuning)

---

## 🔧 Karte anpassen

Das Dashboard liegt im Storage-Modus und kann in der HA-UI über
**Einstellungen → Dashboards → Medien → ⋮ → Bearbeiten** angepasst werden.
Nach Installation einer der o. g. HACS-Karten können die Mushroom-Karten z. B. durch
`custom:maxi-media-player` (Sonos) oder `custom:spotifyplus-card` (Spotify) ersetzt werden.

**Beispiel – Maxi Media Player für Sonos:**
```yaml
type: custom:maxi-media-player
entities:
  - media_player.wohnzimmer
sections:
  - player
  - volumes
  - groups
  - grouping
  - media browser
  - favorites
```

**Beispiel – SpotifyPlus Card:**
```yaml
type: custom:spotifyplus-card
entity: media_player.spotify_shaun_schaf
sections:
  - player
  - albumfavorites
  - playlistfavorites
  - search
```
