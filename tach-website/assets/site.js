// Tach! Handgemacht · Bewegung: Parallax, Reveal, Story, Kaufleiste
(function () {
  var doc = document.documentElement;
  doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var vh = window.innerHeight;

  // Hero laden
  function ready() { requestAnimationFrame(function () { document.body.classList.add('loaded'); }); }
  if (document.fonts && document.fonts.ready) { Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 600); })]).then(ready); } else { ready(); }
  document.querySelectorAll('.hero h1 .ln > span').forEach(function (s, i) { s.style.setProperty('--d', (120 + i * 110) + 'ms'); });

  // Reveal beim Scrollen
  var rv = document.querySelectorAll('.rv, .rv-scale');
  if (reduce || !('IntersectionObserver' in window)) { rv.forEach(function (el) { el.classList.add('in'); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    rv.forEach(function (el) { io.observe(el); });
  }

  // Header
  var hdr = document.querySelector('.hdr'), lastY = 0;

  // Parallax + Maus Tiefe
  var par = Array.prototype.slice.call(document.querySelectorAll('[data-speed]'));
  var depth = Array.prototype.slice.call(document.querySelectorAll('[data-depth]'));
  var mx = 0, my = 0, tx = 0, ty = 0;
  if (finePointer && !reduce && depth.length) {
    window.addEventListener('pointermove', function (e) {
      tx = (e.clientX / window.innerWidth - 0.5); ty = (e.clientY / window.innerHeight - 0.5);
    }, { passive: true });
  }

  // Kaufleiste
  var buy = document.querySelector('.buybar');
  var heroCta = document.querySelector('[data-hero-cta]');
  var finalSec = document.querySelector('.final');

  // Story
  var story = document.querySelector('.story');
  var stage = story && story.querySelector('.stage');
  var steps = story ? story.querySelectorAll('.step') : [];
  var dots = story ? story.querySelectorAll('.mob-dots i') : [];
  var screens = story ? story.querySelectorAll('.stage .screen') : [];
  var progBar = story && story.querySelector('.prog i');
  var curStep = -1;

  function placeStoryPhone() {
    if (!stage) return;
    var card = stage.querySelector('.songcard'), phone = stage.querySelector('.phone'), chip = stage.querySelector('.sc-nfc'), rip = stage.querySelector('.ripples');
    var sr = stage.getBoundingClientRect(), cr = chip.getBoundingClientRect();
    var cx = cr.left + cr.width / 2 - sr.left, cy = cr.top + cr.height / 2 - sr.top;
    rip.style.left = cx + 'px'; rip.style.top = cy + 'px';
    var pw = phone.offsetWidth, ph = phone.offsetHeight;
    // Handy oben links an den Chip legen
    phone.style.setProperty('--tl', (cx - pw * 0.22) + 'px');
    phone.style.setProperty('--tt', (cy - ph * 0.06) + 'px');
  }
  function setStep(n) {
    if (n === curStep) return; curStep = n;
    stage.setAttribute('data-step', n);
    steps.forEach(function (s, i) { s.classList.toggle('on', i === n); s.classList.toggle('done', i < n); });
    dots.forEach(function (d, i) { d.classList.toggle('on', i === n); });
    screens.forEach(function (s) { s.classList.toggle('on', +s.getAttribute('data-s') === n); });
    var phone = stage.querySelector('.phone');
    if (n === 3) { setTimeout(function () { if (curStep !== 3) return; placeStoryPhone(); phone.style.left = phone.style.getPropertyValue('--tl'); phone.style.top = phone.style.getPropertyValue('--tt'); }, 0); }
    else { phone.style.left = ''; phone.style.top = ''; }
    stage.querySelector('.ripples').classList.toggle('on', n === 3);
  }

  function frame() {
    var y = window.scrollY;
    if (hdr) {
      hdr.classList.toggle('scrolled', y > 10);
      hdr.classList.toggle('hide', y > 700 && y > lastY + 2 && !reduce);
      if (y < lastY - 2) hdr.classList.remove('hide');
    }
    lastY = y;

    if (!reduce) {
      mx += (tx - mx) * 0.08; my += (ty - my) * 0.08;
      for (var i = 0; i < par.length; i++) {
        var el = par[i], r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;
        var sp = parseFloat(el.getAttribute('data-speed')) || 0;
        var off = (r.top + r.height / 2 - vh / 2) * -sp;
        var d = parseFloat(el.getAttribute('data-depth')) || 0;
        el.style.transform = 'translate3d(' + (mx * d * 40).toFixed(2) + 'px,' + (off + my * d * 30).toFixed(2) + 'px,0)';
      }
    }

    if (buy) {
      var show = true;
      if (heroCta) { var hr = heroCta.getBoundingClientRect(); if (hr.bottom > 0) show = false; }
      if (finalSec) { var fr = finalSec.getBoundingClientRect(); if (fr.top < vh * 0.85) show = false; }
      if (story) { var qr = story.getBoundingClientRect(); if (qr.top < vh * 0.5 && qr.bottom > vh * 0.5) show = false; }
      buy.classList.toggle('show', show);
    }

    if (story && !reduce) {
      var sr = story.getBoundingClientRect();
      var total = story.offsetHeight - vh;
      var p = Math.min(1, Math.max(0, -sr.top / total));
      if (progBar) progBar.style.transform = 'scaleY(' + p.toFixed(3) + ')';
      setStep(Math.min(3, Math.floor(p * 4.0001)));
    }
    if (!(frame.n = (frame.n || 0) + 1) || frame.n % 10 === 0) alignRipples();
    requestAnimationFrame(frame);
  }
  if (story && reduce) { setTimeout(function () { setStep(3); }, 50); steps.forEach(function (s) { s.classList.add('on'); }); }
  window.addEventListener('resize', function () { vh = window.innerHeight; if (curStep === 3) { curStep = -1; } }, { passive: true });
  requestAnimationFrame(frame);

  // Feature Bühnen: Wellen am Chip ausrichten
  function alignRipples() {
    document.querySelectorAll('[data-chip-stage]').forEach(function (st) {
      var chip = st.querySelector('.sc-nfc'), rip = st.querySelector('.ripples');
      if (!chip || !rip) return;
      var sr = st.getBoundingClientRect(), cr = chip.getBoundingClientRect();
      rip.style.left = (cr.left + cr.width / 2 - sr.left) + 'px';
      rip.style.top = (cr.top + cr.height / 2 - sr.top) + 'px';
    });
  }
  window.addEventListener('load', alignRipples);
  window.addEventListener('resize', alignRipples);
  setTimeout(alignRipples, 300);
})();
