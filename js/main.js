// Chetan Sawale — Web Dev Portfolio, rebuild 2 (black / off-white / signal red)
// VISIBILITY RULE: content is visible by default in CSS (opacity:1). Reveals
// are transform-only. A 1200ms safety timer forces .in on everything, so a
// project card or heading can never be stuck invisible. No gsap.from() with
// opacity:0 is used anywhere on content.
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Preloader: fast, skippable, max ~900ms ---------- */
  var pre = document.getElementById('preloader');
  var preBar = document.getElementById('preBar');
  var prePct = document.getElementById('prePct');
  var start = Date.now(), done = false;
  function finishPreloader() {
    if (done) return; done = true;
    pre.classList.add('done');
    setTimeout(function () { if (pre.parentNode) pre.remove(); }, 600);
  }
  var tick = setInterval(function () {
    var p = Math.min(100, Math.round(((Date.now() - start) / 700) * 100));
    if (preBar) preBar.style.width = p + '%';
    if (prePct) prePct.textContent = p + '%';
    if (p >= 100) { clearInterval(tick); finishPreloader(); }
  }, 40);
  setTimeout(finishPreloader, 900);
  if (pre) pre.addEventListener('click', finishPreloader);

  /* ---------- Safety: force everything visible at 1200ms ---------- */
  function forceVisible() {
    document.querySelectorAll('.reveal, .skill-row, .project, .section-title, .contact-title').forEach(function (el) {
      el.classList.add('in');
      el.style.opacity = ''; el.style.visibility = ''; // clear any stray inline hiding
    });
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  }
  setTimeout(forceVisible, 1200);

  /* ---------- Scroll reveal (transform-only; content already visible) ---------- */
  var revealEls = document.querySelectorAll('.reveal, .skill-row');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- IST clock ---------- */
  var clockEl = document.getElementById('istClock');
  function tickClock() {
    if (!clockEl) return;
    try {
      clockEl.textContent = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST';
    } catch (err) { clockEl.textContent = ''; }
  }
  tickClock(); setInterval(tickClock, 1000);

  /* ---------- Mouse coordinates readout ---------- */
  var cxEl = document.getElementById('coordX'), cyEl = document.getElementById('coordY');
  if (finePointer && cxEl && cyEl) {
    document.addEventListener('mousemove', function (e) {
      cxEl.textContent = String(e.clientX).padStart(3, '0');
      cyEl.textContent = String(e.clientY).padStart(3, '0');
    });
  }

  /* ---------- Animated counters (start from the final value in HTML) ---------- */
  var counters = document.querySelectorAll('.stat-num');
  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (reduceMotion || !target) { el.textContent = target; return; }
    var t0 = null, dur = 1100;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCounter(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else { counters.forEach(animateCounter); }

  /* ---------- Project slider + filters + lightbox ---------- */
  var track = document.getElementById('sliderTrack');
  var viewport = document.querySelector('.slider-viewport');
  var prevBtn = document.getElementById('prevBtn');
  var nextBtn = document.getElementById('nextBtn');
  var dotsWrap = document.getElementById('sliderDots');
  var filters = document.querySelectorAll('.filter');
  var index = 0, pages = 1, dragging = false, dragStartX = 0, dragStartIndex = 0, dragMoved = false;

  function visibleTiles() {
    return Array.prototype.filter.call(track.querySelectorAll('.project'), function (c) {
      return !c.classList.contains('hidden');
    });
  }
  function tileStep() {
    var tiles = visibleTiles();
    if (!tiles.length) return 360;
    var r = tiles[0].getBoundingClientRect();
    return r.width + 20; // tile width + flex gap
  }
  function perView() {
    if (!viewport) return 1;
    return Math.max(1, Math.floor(viewport.clientWidth / tileStep()));
  }
  function maxIndex() {
    return Math.max(0, visibleTiles().length - perView());
  }
  function applyTransform(animate) {
    if (!track) return;
    if (animate) track.classList.add('animated'); else track.classList.remove('animated');
    track.style.transform = 'translateX(' + (-index * tileStep()) + 'px)';
    if (prevBtn) prevBtn.disabled = index <= 0;
    if (nextBtn) nextBtn.disabled = index >= maxIndex();
    if (dotsWrap) {
      Array.prototype.forEach.call(dotsWrap.children, function (d, i) {
        d.classList.toggle('active', i === index);
        d.setAttribute('aria-selected', i === index ? 'true' : 'false');
      });
    }
  }
  function rebuildSlider() {
    pages = maxIndex() + 1;
    if (index > maxIndex()) index = maxIndex();
    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      for (var i = 0; i < pages; i++) {
        (function (n) {
          var b = document.createElement('button');
          b.type = 'button'; b.setAttribute('role', 'tab');
          b.setAttribute('aria-label', 'Go to project page ' + (n + 1));
          b.addEventListener('click', function () { index = n; applyTransform(true); });
          dotsWrap.appendChild(b);
        })(i);
      }
    }
    applyTransform(false);
    forceVisible(); // filtered tiles must show immediately, fully visible
  }
  function goTo(n) { index = Math.max(0, Math.min(maxIndex(), n)); applyTransform(true); }
  if (prevBtn) prevBtn.addEventListener('click', function () { goTo(index - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { goTo(index + 1); });
  document.addEventListener('keydown', function (e) {
    if (document.getElementById('lightbox') && !document.getElementById('lightbox').hidden) return;
    if (e.key === 'ArrowLeft') goTo(index - 1);
    if (e.key === 'ArrowRight') goTo(index + 1);
  });

  // Drag / swipe (pointer events; click on a tile still opens the lightbox)
  if (viewport && track) {
    viewport.classList.add('js-slider');
    viewport.style.overflow = 'hidden';
    viewport.addEventListener('pointerdown', function (e) {
      dragging = true; dragMoved = false; dragStartX = e.clientX; dragStartIndex = index;
      track.classList.remove('animated');
      viewport.setPointerCapture(e.pointerId);
    });
    viewport.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - dragStartX;
      if (Math.abs(dx) > 6) dragMoved = true;
      track.style.transform = 'translateX(' + (-dragStartIndex * tileStep() + dx) + 'px)';
    });
    function endDrag(e) {
      if (!dragging) return; dragging = false;
      var dx = e.clientX - dragStartX;
      if (dx < -60) goTo(dragStartIndex + 1);
      else if (dx > 60) goTo(dragStartIndex - 1);
      else applyTransform(true);
    }
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', function () { dragging = false; applyTransform(true); });
    // A drag must not open the lightbox: swallow the click after a drag
    track.addEventListener('click', function (e) {
      if (dragMoved) { e.stopPropagation(); e.preventDefault(); dragMoved = false; }
    }, true);
    window.addEventListener('resize', function () { rebuildSlider(); });
  }

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filters.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.getAttribute('data-filter');
      track.querySelectorAll('.project').forEach(function (card) {
        var cats = (card.getAttribute('data-cat') || '').split(' ');
        card.classList.toggle('hidden', !(f === 'all' || cats.indexOf(f) !== -1));
      });
      index = 0;
      rebuildSlider();
    });
  });

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById('lightbox');
  var lbNum = document.getElementById('lbNum'), lbMedia = document.getElementById('lbMedia');
  var lbTitle = document.getElementById('lbTitle'), lbDesc = document.getElementById('lbDesc');
  var lbWake = document.getElementById('lbWake'), lbTags = document.getElementById('lbTags');
  var lbLinks = document.getElementById('lbLinks');
  var lastFocus = null;
  function openLightbox(card) {
    if (!lightbox) return;
    lastFocus = document.activeElement;
    var num = card.getAttribute('data-num') || '';
    var year = card.getAttribute('data-year') || '';
    lbNum.textContent = num + (year && year !== '—' ? ' / ' + year : '');
    lbTitle.textContent = card.querySelector('h3').textContent;
    lbDesc.textContent = card.querySelector('.project-desc').textContent;
    var wake = card.querySelector('.wake-note');
    lbWake.hidden = !wake;
    var media = card.querySelector('.project-media');
    lbMedia.innerHTML = '';
    var img = media.querySelector('img');
    if (img) {
      var c = document.createElement('img');
      c.src = img.src; c.alt = img.alt; lbMedia.appendChild(c);
    } else {
      var big = media.querySelector('.media-big');
      var sub = media.querySelector('.media-sub');
      var d = document.createElement('div');
      d.style.textAlign = 'center'; d.style.padding = '20px';
      d.innerHTML = '<span class="media-big">' + (big ? big.innerHTML : '') + '</span>' +
        (sub ? '<p class="mono" style="margin-top:8px">' + sub.textContent + '</p>' : '');
      lbMedia.appendChild(d);
    }
    lbTags.innerHTML = '';
    card.querySelectorAll('.tags li').forEach(function (li) {
      var t = document.createElement('li'); t.textContent = li.textContent; lbTags.appendChild(t);
    });
    lbLinks.innerHTML = '';
    var links = card.querySelectorAll('.project-links a');
    if (links.length) {
      links.forEach(function (a) {
        var b = document.createElement('a');
        b.href = a.href; b.target = '_blank'; b.rel = 'noopener';
        b.className = a.classList.contains('btn-red') ? 'btn btn-red btn-small' : 'btn btn-ghost btn-small';
        b.textContent = a.textContent; lbLinks.appendChild(b);
      });
    } else {
      var ask = document.createElement('a');
      ask.href = 'mailto:sawalechetan102@gmail.com?subject=' + encodeURIComponent('Code request — ' + lbTitle.textContent);
      ask.className = 'btn btn-red btn-small'; ask.textContent = 'CODE ON REQUEST — ASK ME ↗';
      var gh = document.createElement('a');
      gh.href = 'https://github.com/ChetanSawale'; gh.target = '_blank'; gh.rel = 'noopener';
      gh.className = 'btn btn-ghost btn-small'; gh.textContent = 'GITHUB ↗';
      lbLinks.appendChild(ask); lbLinks.appendChild(gh);
    }
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    var close = document.getElementById('lbClose'); if (close) close.focus();
  }
  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (track) {
    track.querySelectorAll('.project').forEach(function (card) {
      card.addEventListener('click', function (e) {
        if (e.target.closest('a')) return; // link clicks go to the link, not the lightbox
        openLightbox(card);
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(card); }
      });
    });
  }
  document.getElementById('lbClose').addEventListener('click', closeLightbox);
  document.getElementById('lbBackdrop').addEventListener('click', closeLightbox);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLightbox(); });

  /* ---------- Mobile nav ---------- */
  var burger = document.getElementById('burger');
  var navLinks = document.getElementById('navLinks');
  if (burger && navLinks) {
    burger.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Contact form -> mailto (no backend) ---------- */
  var form = document.getElementById('contactForm');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('cfName').value.trim();
    var email = document.getElementById('cfEmail').value.trim();
    var msg = document.getElementById('cfMsg').value.trim();
    var subject = encodeURIComponent('Portfolio enquiry from ' + name);
    var body = encodeURIComponent('Hi Chetan,\n\n' + msg + '\n\n— ' + name + ' (' + email + ')');
    window.location.href = 'mailto:sawalechetan102@gmail.com?subject=' + subject + '&body=' + body;
  });

  rebuildSlider();

  /* Anchor jump safety: after any jump to #projects, force everything visible */
  window.addEventListener('hashchange', function () { setTimeout(forceVisible, 60); });
})();

/* ============================================================================
   Motion layer — GSAP + ScrollTrigger, Lenis, Three.js (red/white only).
   Guarded: if a CDN library failed, that block is skipped and the site falls
   back to CSS/IO. GSAP here does TRANSFORM-ONLY work (parallax, marquee
   velocity). It never sets opacity on content. Lottie was DROPPED in this
   rebuild: its colourful illustration clashed with the black/white/red
   palette and the contact section is now a solid-red footer.
   ========================================================================== */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';
  var hasST = hasGsap && typeof window.ScrollTrigger !== 'undefined';

  /* ---------- Lenis smooth scroll ---------- */
  var lenis = null;
  if (typeof window.Lenis !== 'undefined' && !reduceMotion) {
    try {
      lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
      document.documentElement.style.scrollBehavior = 'auto';
      if (hasGsap && hasST) {
        lenis.on('scroll', window.ScrollTrigger.update);
        window.gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
        window.gsap.ticker.lagSmoothing(0);
      } else {
        var rafLenis = function (time) { lenis.raf(time); requestAnimationFrame(rafLenis); };
        requestAnimationFrame(rafLenis);
      }
      document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
          var id = a.getAttribute('href');
          if (id.length < 2) return;
          var target = document.querySelector(id);
          if (!target) return;
          e.preventDefault();
          lenis.scrollTo(target, { offset: -70 });
          setTimeout(function () {
            document.querySelectorAll('.reveal, .project').forEach(function (el) { el.classList.add('in'); });
          }, 700);
        });
      });
    } catch (err) { lenis = null; }
  }

  /* ---------- GSAP: transform-only parallax + marquee (no opacity) ---------- */
  if (hasGsap && hasST && !reduceMotion) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    // Giant WORK background number drifts (transform only) as you scroll
    window.gsap.to('.work-bgnum', {
      yPercent: -30, ease: 'none',
      scrollTrigger: { trigger: '#projects', start: 'top bottom', end: 'bottom top', scrub: true }
    });
    // Hero photo: slight parallax (transform only)
    window.gsap.to('.hero-photo', {
      y: 40, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    // Marquee speed tied to scroll velocity (transform only)
    var track = document.querySelector('.marquee-track');
    if (track) {
      track.classList.add('gsap-driven');
      var tween = window.gsap.to(track, { xPercent: -50, repeat: -1, duration: 22, ease: 'none' });
      var target = 1;
      window.ScrollTrigger.create({
        trigger: document.body, start: 'top top', end: 'max',
        onUpdate: function (self) { target = 1 + Math.min(2.5, Math.abs(self.getVelocity()) / 1500); }
      });
      window.gsap.ticker.add(function () {
        tween.timeScale(window.gsap.utils.interpolate(tween.timeScale(), target, 0.06));
        target += (1 - target) * 0.02;
      });
    }
  }

  /* ---------- Three.js hero: red/white particles + wireframes only ---------- */
  (function initThree() {
    var canvas = document.getElementById('webgl');
    if (!canvas || typeof window.THREE === 'undefined' || reduceMotion || window.innerWidth < 720) return;
    var renderer;
    try { renderer = new window.THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true }); }
    catch (err) { canvas.remove(); return; }
    if (!renderer.getContext()) { canvas.remove(); return; }
    var PALETTE = [0xFF2B2B, 0xF2F2F0, 0xD9D9D9, 0xFF2B2B, 0xF2F2F0];
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    var scene = new window.THREE.Scene();
    var camera = new window.THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 9;
    var group = new window.THREE.Group(); scene.add(group);
    var COUNT = 260, pos = new Float32Array(COUNT * 3), col = new Float32Array(COUNT * 3);
    var c = new window.THREE.Color();
    for (var i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 9;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
      c.setHex(PALETTE[i % PALETTE.length]);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    var geo = new window.THREE.BufferGeometry();
    geo.setAttribute('position', new window.THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new window.THREE.BufferAttribute(col, 3));
    group.add(new window.THREE.Points(geo, new window.THREE.PointsMaterial({ size: 0.07, vertexColors: true, transparent: true, opacity: 0.85 })));
    var shapes = [];
    var geos = [new window.THREE.IcosahedronGeometry(0.55, 0), new window.THREE.OctahedronGeometry(0.5, 0), new window.THREE.TorusGeometry(0.45, 0.14, 12, 32), new window.THREE.BoxGeometry(0.7, 0.7, 0.7)];
    for (var s = 0; s < 6; s++) {
      var mesh = new window.THREE.Mesh(geos[s % geos.length], new window.THREE.MeshBasicMaterial({ color: PALETTE[s % 2 === 0 ? 0 : 1], wireframe: true, transparent: true, opacity: 0.45 }));
      mesh.position.set((Math.random() - 0.5) * 11, (Math.random() - 0.5) * 5.5, -2 - Math.random() * 3);
      mesh.userData.spin = 0.15 + Math.random() * 0.35;
      group.add(mesh); shapes.push(mesh);
    }
    var mouseX = 0, mouseY = 0, tx = 0, ty = 0;
    document.addEventListener('mousemove', function (e) {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    });
    var heroVisible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) { heroVisible = entries[0].isIntersecting; }, { threshold: 0 }).observe(document.querySelector('.hero'));
    }
    var resize = function () {
      var hero = document.querySelector('.hero');
      renderer.setSize(hero.clientWidth, hero.clientHeight, false);
      camera.aspect = hero.clientWidth / hero.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', resize); resize();
    var clock = new window.THREE.Clock();
    (function animate() {
      requestAnimationFrame(animate);
      if (!heroVisible || document.hidden) return;
      var t = clock.getElapsedTime();
      mouseX += (tx - mouseX) * 0.04; mouseY += (ty - mouseY) * 0.04;
      group.rotation.y = t * 0.04 + mouseX * 0.35;
      group.rotation.x = mouseY * 0.22;
      shapes.forEach(function (m, i) { m.rotation.x += 0.002; m.rotation.y += 0.003; m.position.y += Math.sin(t * 0.7 + i) * 0.0012; });
      renderer.render(scene, camera);
    })();
  })();
})();
