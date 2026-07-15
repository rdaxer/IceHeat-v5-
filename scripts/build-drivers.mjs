/* Inn Isar Racing — generate fahrer.html from data/drivers.json
   Keeps rider content as real HTML (good for SEO) while staying editable
   from a single data file. Run: node scripts/build-drivers.mjs */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

function riderCard(d) {
  const meta = [d.discipline, d.hometown, d.born ? '*' + d.born : ''].filter(Boolean).map(esc).join(' · ');
  const badges = (d.highlights || []).map(h => `<span class="rider-badge">${esc(h)}</span>`).join('');
  const ach = (d.achievements || []).map(a => `<li>${esc(a)}</li>`).join('');
  const note = d.note ? `<p class="rider-note">${esc(d.note)}</p>` : '';
  return `      <article class="rider reveal" id="${esc(d.id)}">
        <div class="rider-top">
          <div class="rider-photo">${esc(d.initials || '')}<span class="flag">${d.flag || ''}</span></div>
          <div class="rider-id">
            <h3>${esc(d.name)}</h3>
            <div class="rider-role">${esc(d.role || '')}</div>
            <div class="rider-meta">${meta}</div>
          </div>
        </div>
        <div class="rider-badges">${badges}</div>
        <ul class="rider-ach">${ach}</ul>
        ${note}
      </article>`;
}

function page(drivers) {
  const cards = drivers.map(riderCard).join('\n');
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Fahrer & Erfolge – Inn Isar Racing</title>
  <meta name="description" content="Die Fahrer des Inn Isar Racing Teams und ihre Erfolge – Eisspeedway, Speedway und mehr. Von Max Niedermaier bis Celina Liebmann." />
  <link rel="stylesheet" href="assets/css/style.css" />
  <noscript><style>.reveal{opacity:1 !important;transform:none !important}</style></noscript>
</head>
<body>
  <header class="nav">
    <div class="container">
      <a class="brand" href="index.html"><span class="mark">II</span> Inn&nbsp;Isar&nbsp;Racing</a>
      <nav class="nav-links">
        <a href="index.html">Start</a>
        <a href="index.html#teams">Teams</a>
        <a href="fahrer.html" class="active">Fahrer</a>
        <a href="index.html#videos">Videos</a>
        <a href="index.html#termine">Kalender</a>
        <a href="index.html#kontakt">Kontakt</a>
      </nav>
      <div class="nav-cta">
        <a href="index.html#videos" class="btn btn-ghost">Live &amp; Videos</a>
        <button class="burger" aria-label="Menü"><span></span><span></span><span></span></button>
      </div>
    </div>
  </header>

  <section class="page-header">
    <div class="container">
      <span class="eyebrow">Fahrer &amp; Erfolge</span>
      <h1>Unsere Fahrer</h1>
      <p>Von Weltmeister-Silber im Eisspeedway bis zu Pionierleistungen im Frauen-Speedway – das sind die Piloten hinter Inn Isar Racing.</p>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="rider-grid">
${cards}
      </div>
      <p class="muted" style="margin-top:32px; font-size:.85rem; color:var(--text-mute);">
        Angaben nach Vereinsfreigabe &amp; öffentlicher Recherche (SPEEDWEEK, DMV, Bahnsport Deutschland, Wikipedia).
      </p>
    </div>
  </section>

  <footer class="footer">
    <div class="container">
      <div class="footer-bottom" style="border-top:0; padding-top:0;">
        <span>© <span id="year">2026</span> Inn Isar Racing. Alle Rechte vorbehalten.</span>
        <span><a href="index.html" style="display:inline;">Zur Startseite</a></span>
      </div>
    </div>
  </footer>

  <script src="assets/js/main.js"></script>
</body>
</html>
`;
}

const data = JSON.parse(await readFile(path.join(root, 'data', 'drivers.json'), 'utf8'));
await writeFile(path.join(root, 'fahrer.html'), page(data.drivers), 'utf8');
console.log(`Built fahrer.html with ${data.drivers.length} riders`);
