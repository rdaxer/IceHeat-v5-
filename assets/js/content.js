/* Inn Isar Racing — dynamic content
   Renders the race calendar (data/events.json) and the YouTube video wall
   (data/videos.json). Progressive enhancement: if a fetch fails (e.g. opened
   via file://) the static fallback markup in the HTML stays untouched. */
(function () {
  const MONTHS = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];

  async function getJSON(url) {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(url + ' ' + res.status);
    return res.json();
  }

  /* ---------- Events ---------- */
  function renderEvents(list) {
    const wrap = document.getElementById('events-list');
    if (!wrap || !Array.isArray(list) || !list.length) return;
    const now = new Date(); now.setHours(0, 0, 0, 0);

    const upcoming = list
      .map(e => ({ ...e, d: new Date(e.date + 'T00:00:00') }))
      .filter(e => !isNaN(e.d) && e.d >= now)
      .sort((a, b) => a.d - b.d)
      .slice(0, 6);

    if (!upcoming.length) return;

    wrap.innerHTML = upcoming.map(e => {
      const isPreview = e.type === 'preview';
      const day = isPreview ? 'TBA' : String(e.d.getDate()).padStart(2, '0');
      const mon = isPreview ? 'Termin folgt' : `${MONTHS[e.d.getMonth()]} ${e.d.getFullYear()}`;
      const sub = [e.subtitle, e.location, e.time].filter(Boolean).join(' · ');
      let badge = '<span class="badge">Vorschau</span>';
      if (e.type === 'home') badge = `<span class="badge home ${e.team === 'devils' ? 'devils' : ''}">Heim</span>`;
      else if (e.type === 'away') badge = '<span class="badge">Auswärts</span>';
      return `<div class="event">
        <div class="date"><div class="d">${day}</div><div class="m">${mon}</div></div>
        <div class="info"><h4>${escape(e.title)}</h4><div class="sub">${escape(sub)}</div></div>
        ${badge}
      </div>`;
    }).join('');
  }

  /* ---------- Videos ---------- */
  function renderVideos(data) {
    const grid = document.getElementById('video-grid');
    const videos = data && data.videos;
    if (!grid || !Array.isArray(videos) || !videos.length) return; // keep fallback

    grid.innerHTML = videos.slice(0, 6).map(v => `
      <a class="card" href="${v.url}" target="_blank" rel="noopener">
        <div class="thumb play" style="background-image:url('${v.thumbnail}');background-size:cover;background-position:center;"></div>
        <div class="body"><h4>${escape(v.title)}</h4>
          <div class="meta">YouTube · ${formatDate(v.published)}</div></div>
      </a>`).join('');
  }

  function formatDate(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return 'Inn Isar Racing';
    return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
  }
  function escape(s = '') {
    return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  /* ---------- Sponsors ---------- */
  function renderSponsors(data) {
    const wrap = document.getElementById('sponsors-list');
    const list = data && data.sponsors;
    if (!wrap || !Array.isArray(list) || !list.length) return; // keep fallback
    wrap.innerHTML = list.map(s => {
      const inner = `<img src="${s.logo}" alt="${escape(s.name)}" loading="lazy">`;
      return s.url
        ? `<a class="sponsor" href="${s.url}" target="_blank" rel="noopener" title="${escape(s.name)}">${inner}</a>`
        : `<div class="sponsor" title="${escape(s.name)}">${inner}</div>`;
    }).join('');
  }

  getJSON('data/events.json').then(d => renderEvents(d.events || d)).catch(() => {});
  getJSON('data/sponsors.json').then(renderSponsors).catch(() => {});

  // YouTube thumbnails load images from YouTube -> only after consent (DSGVO).
  let videoData = null;
  const maybeVideos = () => {
    if (videoData && window.iirConsent && window.iirConsent.level === 'all') renderVideos(videoData);
  };
  getJSON('data/videos.json').then(d => { videoData = d; maybeVideos(); }).catch(() => {});
  document.addEventListener('iir-consent', maybeVideos);
})();
