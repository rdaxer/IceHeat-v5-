/* Inn Isar Racing — animated hero background
   Ice-speedway feel: horizontal speed streaks + drifting ice spray particles.
   Pure canvas, no dependencies, respects reduced-motion. */
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w, h, dpr, streaks = [], sparks = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function rand(a, b) { return a + Math.random() * (b - a); }

  function makeStreak() {
    return {
      x: rand(-0.2, 1) * w,
      y: rand(0, h),
      len: rand(80, 320),
      speed: rand(3, 12),
      alpha: rand(0.10, 0.42),
      ice: Math.random() > 0.35
    };
  }
  function makeSpark() {
    return {
      x: rand(0, w), y: rand(0, h),
      vx: rand(1.5, 6.5), vy: rand(-0.6, 0.6),
      r: rand(0.6, 2.6), alpha: rand(0.35, 1),
      ice: Math.random() > 0.4
    };
  }

  function init() {
    resize();
    streaks = Array.from({ length: Math.round(w / 8) }, makeStreak);
    sparks = Array.from({ length: Math.round(w / 14) }, makeSpark);
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // subtle vignette base
    for (const s of streaks) {
      const grad = ctx.createLinearGradient(s.x, s.y, s.x + s.len, s.y);
      const col = s.ice ? '53,198,255' : '255,51,32';
      grad.addColorStop(0, `rgba(${col},0)`);
      grad.addColorStop(1, `rgba(${col},${s.alpha})`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = s.ice ? 2 : 1.4;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x + s.len, s.y);
      ctx.stroke();
      s.x += s.speed;
      if (s.x - s.len > w) { Object.assign(s, makeStreak(), { x: -s.len }); }
    }

    for (const p of sparks) {
      const col = p.ice ? '120,215,255' : '255,120,90';
      ctx.fillStyle = `rgba(${col},${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      p.x += p.vx; p.y += p.vy; p.alpha -= 0.004;
      if (p.x > w || p.alpha <= 0) Object.assign(p, makeSpark(), { x: -4 });
    }

    requestAnimationFrame(draw);
  }

  function drawStatic() {
    // one-frame render for reduced-motion users
    ctx.clearRect(0, 0, w, h);
    for (const s of streaks) {
      const col = s.ice ? '53,198,255' : '255,51,32';
      ctx.strokeStyle = `rgba(${col},${s.alpha})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x + s.len, s.y); ctx.stroke();
    }
  }

  window.addEventListener('resize', () => { init(); if (reduce) drawStatic(); });
  init();
  if (reduce) drawStatic(); else draw();
})();
