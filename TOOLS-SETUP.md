# 🧰 Claude-Code Werkzeuge — Merkzettel für den lokalen PC

Diese Befehle richtest du **auf deinem eigenen Computer** ein (nicht in der
Web-/Cloud-Version von Claude). Reihenfolge von oben nach unten abarbeiten.
Stand: Juli 2026.

> ℹ️ Voraussetzung: Node.js 18+ und Claude Code lokal installiert.

---

## 1. Playwright MCP — App im echten Browser testen ⭐

Damit kann Claude deine IceHeat-App (`index.html`, `dashboard.html`) im Browser
öffnen, durchklicken und Screenshots machen.

```bash
claude mcp add playwright npx @playwright/mcp@latest
```

Prüfen: `claude mcp list` — „playwright" sollte auftauchen.

---

## 2. Remotion — Shorts aus Renndaten ⭐

Kein MCP, sondern das Projekt im Ordner **`remotion-shorts/`** dieses Repos.

```bash
cd remotion-shorts
npm install
npm run studio          # Vorschau
npm run render:all      # Videos nach out/ rendern
```

Details siehe `remotion-shorts/README.md`.

---

## 3. claude-mem — Gedächtnis über Sessions

Merkt sich über Sessions hinweg, woran ihr gearbeitet habt.

Im Claude-Fenster tippen:
```
/plugin marketplace add thedotmack/claude-mem
/plugin install claude-mem
```
Danach Claude Code neu starten.

> ⚠️ **Nicht** `npm install -g claude-mem` verwenden — das installiert nur die
> Bibliothek ohne die nötigen Hooks/Worker. Immer über `/plugin` oder
> `npx claude-mem install`.

---

## 4. Superpowers — systematischeres Arbeiten (optional)

Bündel an Workflows (Planung, TDD, Review). Eher für größere Projekte; für
IceHeat „nice to have".

Im Claude-Fenster tippen:
```
/plugin install superpowers@claude-plugins-official
```
Prüfen mit `/plugin`, in laufender Session anwenden mit `/reload-plugins`.

---

## Niedrige Priorität (nur bei Bedarf)

| Tool | Zweck | Einrichtung |
|------|-------|-------------|
| **ppl-ai** (Perplexity) | Websuche mit Quellen | `claude mcp add …` + API-Key |
| **firecrawl-mcp** | Webseiten scrapen | `claude mcp add …` + API-Key |
| **glif** | KI-Bild-/Workflow-Generierung | `claude mcp add …` + API-Key |
| **Council-Skill** | Entscheidungen aus mehreren Perspektiven | aus einer *awesome-claude-code*-Liste installieren |

Bekannte Sammelliste zum Stöbern: `hesreallyhim/awesome-claude-code` (GitHub).

---

### ⚠️ Sicherheitshinweis
Alle Punkte 3–4 und die Tabelle sind **Community-Projekte**, nicht offiziell von
Anthropic. Sie führen teils Code aus / greifen aufs Dateisystem zu. Vor der
Installation kurz reinschauen lohnt sich.
