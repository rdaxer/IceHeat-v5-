/* Inn Isar Racing — global UI behaviour */
(function () {
  const nav = document.querySelector('.nav');
  const burger = document.querySelector('.burger');

  // Sticky nav background on scroll
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  if (burger && nav) {
    burger.addEventListener('click', () => nav.classList.toggle('open'));
    nav.querySelectorAll('.nav-links a').forEach(a =>
      a.addEventListener('click', () => nav.classList.remove('open')));
  }

  // Reveal on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Current year in footer
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
