/* Inn Isar Racing — Cookie/Consent-Banner (DSGVO)
   Externe Einbettungen (YouTube-Live-Player, ggf. Google-Kalender) werden erst
   nach ausdrücklicher Zustimmung geladen ("2-Klick-Lösung"). Zustimmung wird
   lokal im Browser gespeichert (localStorage), es werden KEINE Tracking-Dienste
   geladen. */
(function () {
  const KEY = 'iir-consent-v1';
  const stored = localStorage.getItem(KEY); // 'all' | 'essential' | null
  window.iirConsent = { level: stored };

  function loadEmbeds() {
    document.querySelectorAll('iframe[data-embed-src]').forEach((el) => {
      if (!el.getAttribute('src')) el.setAttribute('src', el.getAttribute('data-embed-src'));
    });
    document.querySelectorAll('.embed-gate').forEach((g) => g.classList.add('is-loaded'));
  }

  function set(level) {
    localStorage.setItem(KEY, level);
    window.iirConsent.level = level;
    if (level === 'all') loadEmbeds();
    document.dispatchEvent(new CustomEvent('iir-consent', { detail: level }));
    const b = document.getElementById('consent-banner');
    if (b) b.remove();
  }
  window.iirSetConsent = set;

  // If already accepted earlier, load embeds immediately.
  if (stored === 'all') { document.addEventListener('DOMContentLoaded', loadEmbeds); }

  // Per-embed "load this video" button (individual consent, does not change global choice)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-load-embed]');
    if (!btn) return;
    const gate = btn.closest('.embed-gate');
    const frame = gate && gate.querySelector('iframe[data-embed-src]');
    if (frame) { frame.setAttribute('src', frame.getAttribute('data-embed-src')); gate.classList.add('is-loaded'); }
  });

  if (stored) return; // already decided -> no banner

  document.addEventListener('DOMContentLoaded', () => {
    const el = document.createElement('div');
    el.id = 'consent-banner';
    el.innerHTML = `
      <div class="consent-inner">
        <div class="consent-text">
          <strong>Datenschutz-Hinweis.</strong> Diese Seite lädt externe Inhalte (z.&nbsp;B. den
          YouTube-Live-Player) erst nach deiner Zustimmung. Es werden keine Werbe- oder Tracking-Dienste eingesetzt.
          Details in der <a href="datenschutz.html">Datenschutzerklärung</a>.
        </div>
        <div class="consent-actions">
          <button class="btn btn-ghost" type="button" data-consent="essential">Nur notwendige</button>
          <button class="btn btn-primary" type="button" data-consent="all">Externe Inhalte erlauben</button>
        </div>
      </div>`;
    document.body.appendChild(el);
    el.querySelectorAll('[data-consent]').forEach((b) =>
      b.addEventListener('click', () => set(b.getAttribute('data-consent'))));
  });
})();
