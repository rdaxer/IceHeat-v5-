# Projektplan – Neue Website Inn Isar Racing

**Stand:** 2026-07-14
**Ziel:** Frische, moderne, funktionale Website für die Rennsport-Vereinigung
**Inn Isar Racing Team** (Eis- & Sommer-Speedway, DMV) und das Kooperationsteam
**Inn Isar Devils** (mit AC Landshut, 2. Speedway-Bundesliga, Heimrennen
OneSolar-Arena Landshut/Ellermühle).

Grundprinzip: **Du sollst so wenig Arbeit wie möglich haben.** Deshalb setzen wir
auf kostenlose, wartungsarme Bausteine und so viel Automatik wie technisch
seriös machbar ist.

---

## 1. Getroffene Grundsatz-Entscheidungen

| Thema | Entscheidung |
|-------|--------------|
| **Plattform / Hosting** | Neue Seite auf **GitHub Pages** (kostenlos). Domain `innisarracing.com` wird später von 1&1/IONOS darauf umgezogen. |
| **Social-Automatik** | **Kostenlos-Mix:** YouTube voll automatisch (RSS-Feed), Instagram/Facebook als eingebettete Widgets + große Link-Buttons. |
| **Rennkalender** | **Google-Kalender** (empfohlen): ihr pflegt Termine bequem per Handy, die Website zieht sie automatisch. |
| **Medien / Urheberrecht** | Nur **eigenes Material** von euren Kanälen (Instagram, Facebook, YouTube) + offizielle Vereinslogos. Keine fremden Presse-Fotos. Texte/Fakten werden recherchiert und geprüft. |

---

## 2. Technisches Fundament

- **Statische Website** (modern, sehr schnell, kein Server nötig, extrem wartungsarm).
- Gehostet auf **GitHub Pages** – kostenlos, HTTPS inklusive.
- Aufbau responsiv: funktioniert auf **Handy, Tablet, Desktop**.
- **Automatik über GitHub Actions** (geplante Jobs, „Cron"): laufen im Hintergrund,
  aktualisieren Inhalte, ohne dass jemand etwas anklicken muss.
- **Laufende Kosten: 0 €.** (Nur die Domain läuft wie bisher weiter bei IONOS.)

---

## 3. Seitenstruktur (Navigation)

1. **Start** – Hero mit starkem Bild/Video, aktuelle Highlights, nächste Termine,
   Live-Hinweis wenn ein Restream läuft.
2. **Teams** – Inn Isar Racing Team & Inn Isar Devils: Vorstellung, Serien
   (Eisspeedway, Sommer-Speedway, 2. Bundesliga, Schweden-Liga), Kooperation mit AC Landshut.
3. **Fahrer & Erfolge** – Einzelseiten je Fahrer: Foto, Steckbrief, Bahn/Serie,
   geprüfte Erfolge/Ergebnisse.
4. **Videos & Live** – YouTube-Videowand (automatisch), **Restream-Live-Player**,
   Buttons zu Instagram/Facebook.
5. **Kalender** – Automatischer Rennkalender (Google-Kalender), Termine an denen
   Inn Isar Racing Team oder Inn Isar Devils teilnehmen.
6. **Galerie** – Bilder (eigenes Material).
7. **Sponsoren / Partner** – Logos & Links.
8. **Kontakt** – Kontaktformular/E-Mail, Anfahrt, Social-Links.
9. **Impressum & Datenschutz** – rechtlich verpflichtend (siehe Abschnitt 6).

---

## 4. Die Automatik-Bausteine

### 4.1 YouTube (voll automatisch)
- YouTube liefert einen kostenlosen **RSS-Feed** pro Kanal (kein API-Schlüssel nötig).
- Ein GitHub-Action-Job prüft z. B. **1× täglich** den Feed und aktualisiert die
  Videowand mit den neuesten Videos automatisch. → **tagesaktuell, null Aufwand.**

### 4.2 Instagram & Facebook (Widget + Buttons)
- Meta (Instagram/Facebook) sperrt automatische Einbindung technisch stark ab.
- Lösung ohne Kosten & Wartung: eingebettetes **Feed-Widget** eurer eigenen Seiten
  plus auffällige **„Folge uns"-Buttons**, die direkt zu euren Profilen führen.
- Neue Beiträge erscheinen dort, sobald ihr sie postet – ihr müsst nichts extra tun.

### 4.3 Restream (Live)
- Restream stellt einen **einbettbaren Player** bereit.
- Wird als Live-Bereich auf „Videos & Live" eingebunden. Läuft ein Stream, ist er
  direkt auf der Seite sichtbar; sonst dezent ausgeblendet.

### 4.4 Rennkalender (automatisch via Google-Kalender)
- Ihr (oder ich einmalig) legt einen **Google-Kalender** „Inn Isar Racing" an.
- Termine tragt ihr bequem per Handy ein → die Website zeigt sie **automatisch**
  (kommende Rennen, Ort, Team, Serie). Vergangene Termine wandern in ein Archiv.

---

## 5. Inhalte & Recherche

- **Fakten** (Historie, Serien, Kooperation Landshut, Fahrernamen, Ergebnisse)
  werden aus mehreren Quellen recherchiert (SPEEDWEEK, DMV, Vereins-/Presseberichte)
  und **gegengeprüft**, bevor sie auf die Seite kommen. Unsichere Angaben markiere
  ich zur Freigabe durch euch.
- **Bilder/Videos**: ausschließlich euer eigenes Material (Uploads oder eure
  Social-/YouTube-Inhalte) und offizielle Logos.
- **Ton/Design**: sportlich, dynamisch, „Speedway" – dunkles Grundthema mit
  kräftigen Akzentfarben, viel Bild/Video, klare Typografie.

---

## 6. Rechtliches (Deutschland – wichtig!)

- **Impressum** und **Datenschutzerklärung** sind Pflicht (TMG/DSGVO). Dafür brauche
  ich von euch die Vereinsangaben (siehe Abschnitt 8).
- Eingebettete Inhalte (YouTube, Instagram, Facebook, Restream, Google-Kalender)
  setzen Cookies → wir bauen einen **Consent-Banner** ein, der Einbettungen erst
  nach Zustimmung lädt („2-Klick-Lösung").

---

## 7. Umsetzung in Phasen

| Phase | Inhalt | Ergebnis für dich |
|-------|--------|-------------------|
| **1** | Fundament + Design-Prototyp der Startseite, live auf GitHub Pages | Du siehst sofort einen echten Entwurf zum Anschauen/Freigeben |
| **2** | Alle Unterseiten mit recherchierten, geprüften Inhalten | Vollständige Seite inhaltlich |
| **3** | Automatik: YouTube-Feed, Kalender-Sync, Restream, Social-Widgets | Selbst-aktualisierende Seite |
| **4** | Impressum/Datenschutz/Consent, Feinschliff, Mobile, dann Domain-Umzug | Fertige, rechtssichere Live-Seite unter innisarracing.com |

---

## 8. Was ich von dir brauche (minimal)

1. **Social-Links (exakt):** YouTube-Kanal-URL, Instagram-Handle(s)
   (gefunden: `@innisarracingteam` und `@innisarracing.team` – welches ist aktuell?),
   Facebook-Seite (gefunden: `/onspikes`).
2. **Logo/Wappen** als Datei (falls vorhanden).
3. **Restream:** Kanal-Link bzw. Zugang zum Einbett-Code.
4. **Google-Kalender:** Habt ihr schon einen, oder soll ich einen anlegen?
5. **Fahrerliste:** Namen der Einzelfahrer (ich recherchiere Vorschläge, ihr bestätigt).
6. **Impressum-Angaben:** offizieller Vereinsname (Inn Isar Racing Team e. V. im DMV?),
   Anschrift, Vertretungsberechtigte(r), Kontakt-E-Mail, ggf. Registernummer.
7. **Domain (später):** Zugang zu 1&1/IONOS für den DNS-Umzug.

> Vieles davon (2–7) kann auch nach und nach kommen – ich starte in Phase 1 schon
> mit Platzhaltern und ersetze sie, sobald das echte Material da ist.

---

## 9. Kosten-Übersicht

| Posten | Kosten |
|--------|--------|
| Hosting (GitHub Pages) | 0 € |
| YouTube-Feed, Google-Kalender, Restream-Embed | 0 € |
| Domain innisarracing.com | läuft wie bisher bei IONOS (~1 €/Monat) |
| **Summe zusätzlich** | **0 € laufend** |
