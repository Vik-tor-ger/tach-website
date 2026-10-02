// Tach! Songkarte: Animationen beim Laden und Scrollen
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Buttons erkennen (Links mit gefülltem Hintergrund und runden Ecken)
  document.querySelectorAll('a[style*="border-radius: 999px"]').forEach(function (a) { a.classList.add('btn'); });

  // Herz im Hero-Label
  var heart = document.querySelector('section svg path[fill="#C21B35"]');
  if (heart) heart.closest('svg').classList.add('beat');

  // Hero: gestaffelt einblenden
  var hero = document.querySelector('section');
  if (hero) {
    var text = hero.querySelector('div > div');
    if (text) Array.prototype.forEach.call(text.children, function (el, i) {
      el.classList.add('hero-in'); el.style.setProperty('--d', (80 + i * 110) + 'ms');
    });
    var img = hero.querySelector('.collage') || hero.querySelector('img:not(.deco)');
    if (img) img.classList.add('hero-img');
  }

  // Alles andere beim Scrollen einblenden
  var sel = [
    'section h2', 'section h3', 'main h1', 'main h2', 'main p', 'main ul',
    'section p', 'section img:not(.deco)'
  ];
  var targets = [];
  var secs = document.querySelectorAll('section');
  // Karten zuerst markieren, damit ihr Inhalt mit der Karte erscheint
  secs.forEach(function (sec, si) {
    if (si === 0) return;
    sec.querySelectorAll('div[style*="border-radius: 28px"], div[style*="border-radius: 22px"], div[style*="border-radius: 36px"], a[style*="border-radius: 28px"]').forEach(function (card) {
      card.classList.add('lift');
    });
  });
  secs.forEach(function (sec, si) {
    if (si === 0) return; // Hero hat eigene Animation
    sec.querySelectorAll(sel.join(',')).forEach(function (el) {
      if (el.closest('.lift')) return;
      targets.push(el);
    });
  });
  document.querySelectorAll('footer > div').forEach(function (el) { targets.push(el); });
  document.querySelectorAll('.lift').forEach(function (el) { targets.push(el); el.classList.add('pop'); });
  document.querySelectorAll('section span[style*="border-radius: 999px"]').forEach(function (el) {
    if (el.closest('section') === hero) return;
    el.classList.add('chip', 'pop'); targets.push(el);
  });

  // Verzögerung je nach Position unter Geschwistern
  targets.forEach(function (el) {
    el.classList.add('rv');
    var p = el.parentElement, idx = p ? Array.prototype.indexOf.call(p.children, el) : 0;
    el.style.setProperty('--d', Math.min(idx, 6) * 90 + 'ms');
  });

  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  targets.forEach(function (el) { io.observe(el); });
})();
