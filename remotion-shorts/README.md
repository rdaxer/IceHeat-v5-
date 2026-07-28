# 🎬 IceHeat Remotion Shorts

Automatische **YouTube-Shorts (9:16)** aus deinen IceHeat-Renndaten — mit
[Remotion](https://remotion.dev). Du exportierst dein Event als JSON, ersetzt
eine Datei, und renderst fertige Videos.

Zwei Vorlagen sind enthalten:

| Composition | Inhalt | Format |
|-------------|--------|--------|
| **HeatCard** | Ein Heat: 4 Fahrer mit Helmfarbe, Startnummer, Nation — als **Aufstellung** oder (wenn Ergebnisse da sind) als **Ergebnis** mit Punkten | 1080×1920, ~7 s |
| **Standings** | **Gesamtwertung** als animiertes Ranking mit Gold/Silber/Bronze und hochzählenden Punkten | 1080×1920, Länge je nach Fahreranzahl |

---

## 🚀 Schnellstart

```bash
cd remotion-shorts
npm install
npm run studio      # öffnet die Remotion-Vorschau im Browser
```

Im Studio kannst du links die Composition wählen, rechts die Props
(`heatIndex`, `topN`) ändern und live zusehen.

## 🎥 Video rendern

```bash
npm run render:heat        # -> out/heat.mp4
npm run render:standings   # -> out/standings.mp4
npm run render:all         # beide
```

Die MP4s liegen danach im Ordner `out/`.

---

## 📥 Eigene Renndaten verwenden

Es gibt zwei Wege:

**Weg 1 – einfach (empfohlen):**
1. In IceHeat oben rechts **JSON exportieren**.
2. Den Inhalt dieser Datei nach `src/data/sample.json` kopieren (überschreiben).
3. `npm run studio` bzw. `npm run render:all`.

Fotos aus dem Export (als Data-URL) werden automatisch angezeigt; fehlt ein
Foto, erscheint die Startnummer als Platzhalter.

**Weg 2 – ohne Datei zu überschreiben (per Props):**
```bash
# nur einen anderen Heat rendern (Index 0 = erster Heat):
npm run render:heat -- --props='{"heatIndex":2}'

# Top 5 statt Top 10 in der Gesamtwertung:
npm run render:standings -- --props='{"topN":5}'
```

Für komplett eigene Daten per Props eine Datei `meine-props.json` anlegen:
```json
{ "data": { …dein kompletter IceHeat-Export… }, "heatIndex": 0 }
```
```bash
npm run render:heat -- --props=./meine-props.json
```

---

## ⚙️ Welchen Heat / wie viele Plätze?

- **HeatCard** → Prop `heatIndex` (0 = erster Heat in der Liste).
- **Standings** → Prop `topN` (Anzahl angezeigter Fahrer). Die Videolänge
  passt sich automatisch an.

Ob ein Heat als *Aufstellung* oder *Ergebnis* dargestellt wird, entscheidet
sich automatisch: Sobald mindestens ein Ergebnis eingetragen ist, wird der
Ergebnis-Modus mit Punkten gezeigt.

---

## 🎨 Anpassen

- **Farben/Layout:** `src/compositions/HeatCard.tsx` und `Standings.tsx`.
- **Helmfarben, Punkte-Logik, Nationsflaggen:** `src/data/iceheat.ts`
  (spiegelt exakt die Logik aus `index.html` wider).
- **Schriftart:** Standard ist eine System-Fallback-Schrift. Für die
  Original-Optik kannst du Barlow / Barlow Condensed via
  [`@remotion/google-fonts`](https://remotion.dev/docs/google-fonts) laden.

---

## 🖥️ Rendering in eingeschränkten Umgebungen

Remotion lädt beim ersten Render eine „Chrome Headless Shell" herunter. Auf
deinem PC passiert das automatisch. In abgeschotteten Umgebungen (z. B.
Cloud-Runner ohne Netzzugang zu remotion.media) kannst du ein vorhandenes
Chromium verwenden:

```bash
npm run render:heat -- --browser-executable=/pfad/zu/headless_shell
```

---

## 📤 Auf YouTube hochladen

Die fertigen `out/*.mp4` sind bereits im 9:16-Format (1080×1920) — direkt als
**YouTube Short**, Instagram Reel oder TikTok verwendbar. Für einen Short
sollte das Video ≤ 60 s sein (beide Vorlagen liegen deutlich darunter).
