// Chetan Sawale — Web Dev Portfolio interactions
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Preloader: fast, skippable, max ~900ms ---------- */
  var pre = document.getElementById('preloader');
  var preBar = document.getElementById('preBar');
  var prePct = document.getElementById('prePct');
  var start = Date.now();
  var done = false;
  function finishPreloader() {
    if (done) return;
    done = true;
    pre.classList.add('done');
    setTimeout(function () { pre.remove(); }, 600);
  }
  var tick = setInterval(function () {
    var p = Math.min(100, Math.round(((Date.now() - start) / 700) * 100));
    preBar.style.width = p + '%';
    prePct.textContent = p + '%';
    if (p >= 100) { clearInterval(tick); finishPreloader(); }
  }, 40);
  setTimeout(finishPreloader, 900);           // hard cap
  pre.addEventListener('click', finishPreloader); // skippable

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal, .skill-card');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll('.stat-num');
  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (reduceMotion) { el.textContent = target; return; }
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
  } else {
    counters.forEach(animateCounter);
  }

  /* ---------- Project filters ---------- */
  var filters = document.querySelectorAll('.filter');
  var projects = document.querySelectorAll('.project');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filters.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.getAttribute('data-filter');
      projects.forEach(function (card) {
        var cats = (card.getAttribute('data-cat') || '').split(' ');
        var show = f === 'all' || cats.indexOf(f) !== -1;
        card.classList.toggle('hidden', !show);
      });
    });
  });

  /* ---------- Project card tilt (desktop, fine pointer only) ---------- */
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('.tilt').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(900px) rotateY(' + (x * 6) + 'deg) rotateX(' + (-y * 6) + 'deg) translateY(-4px)';
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  }

  /* ---------- Custom cursor glow ---------- */
  var cursor = document.getElementById('cursor');
  if (finePointer && !reduceMotion && cursor) {
    var cx = -500, cy = -500, tx = -500, ty = -500;
    document.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; });
    (function loop() {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      cursor.style.left = cx + 'px';
      cursor.style.top = cy + 'px';
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('.magnetic').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.25;
        var y = (e.clientY - r.top - r.height / 2) * 0.35;
        el.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- Mobile nav ---------- */
  var burger = document.getElementById('burger');
  var navLinks = document.getElementById('navLinks');
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

  /* ---------- Contact form -> mailto (no backend) ---------- */
  var form = document.getElementById('contactForm');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('cfName').value.trim();
    var email = document.getElementById('cfEmail').value.trim();
    var msg = document.getElementById('cfMsg').value.trim();
    var subject = encodeURIComponent('Portfolio enquiry from ' + name);
    var body = encodeURIComponent('Hi Chetan,\n\n' + msg + '\n\n— ' + name + ' (' + email + ')');
    window.location.href = 'mailto:sawalechetan102@gmail.com?subject=' + subject + '&body=' + body;
  });
})();

/* ============================================================================
   Advanced motion layer — GSAP + ScrollTrigger, Lenis, Three.js, Lottie.
   Every block is guarded: if a CDN library failed to load, that block is
   skipped and the site falls back to the CSS animations / IntersectionObserver
   reveals above. Nothing here is required for the site to be usable.
   Framer Motion / React Three Fiber were deliberately NOT used: they are
   React-only and would need a Next.js rebuild with a build step. GSAP +
   Three.js deliver the same effects in this static site. Spline was also
   skipped: it needs an external Spline scene/account; Three.js covers 3D.
   ========================================================================== */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var isDesktop = window.innerWidth >= 720;
  var hasGsap = typeof window.gsap !== 'undefined';
  var hasST = hasGsap && typeof window.ScrollTrigger !== 'undefined';

  /* ---------- Lenis smooth scroll (wired to GSAP ticker when available) ---------- */
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
      /* Anchor links: let Lenis handle the smooth scroll (offset for sticky nav) */
      document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
          var id = a.getAttribute('href');
          if (id.length < 2) return;
          var target = document.querySelector(id);
          if (!target) return;
          e.preventDefault();
          lenis.scrollTo(target, { offset: -70 });
        });
      });
    } catch (err) { lenis = null; /* native scroll stays in place */ }
  }

  /* ---------- GSAP + ScrollTrigger ---------- */
  if (hasGsap && !reduceMotion) {
    if (hasST) { window.gsap.registerPlugin(window.ScrollTrigger); }

    /* Hero: staggered title lines slide up out of their overflow mask,
       rotating badge pops in. Delayed ~0.9s so it starts as the preloader lifts. */
    window.gsap.from('.hero-title .line', {
      yPercent: 115, duration: 1.05, stagger: 0.12, ease: 'power4.out',
      delay: 0.9, clearProps: 'transform'
    });
    window.gsap.from('.badge-rotate', {
      scale: 0, rotation: -90, duration: 1, ease: 'back.out(1.6)', delay: 1.3, clearProps: 'transform'
    });

    if (hasST) {
      /* Hero parallax: content drifts up and fades as you scroll away */
      window.gsap.to('.hero-inner', {
        y: -70, opacity: 0.35, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
      /* Orbs drift at different rates for depth (parallax) */
      window.gsap.to('.orb-1', { y: 140, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'max', scrub: 1 } });
      window.gsap.to('.orb-2', { y: -110, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'max', scrub: 1 } });
      window.gsap.to('.orb-3', { y: 90, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'max', scrub: 1 } });

      /* Section titles rise in on entry */
      window.gsap.utils.toArray('.section-title').forEach(function (title) {
        window.gsap.from(title, {
          y: 40, opacity: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: title, start: 'top 88%', once: true }
        });
      });

      /* Project cards scrub-in as the grid enters view */
      window.gsap.from('.project', {
        y: 70, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: '#projectGrid', start: 'top 85%', once: true }
      });

      /* Skill bars grow (scaleX, so it never fights the CSS width transition) */
      window.gsap.from('.skill-card .bar span', {
        scaleX: 0, transformOrigin: 'left center', duration: 1, ease: 'power3.out', stagger: 0.06,
        scrollTrigger: { trigger: '.skill-groups', start: 'top 80%', once: true }
      });

      /* Marquee speed tied to scroll velocity: CSS animation off, GSAP drives it */
      var track = document.querySelector('.marquee-track');
      if (track) {
        track.classList.add('gsap-driven');
        var marqueeTween = window.gsap.to(track, { xPercent: -50, repeat: -1, duration: 22, ease: 'none' });
        var marqueeTarget = 1;
        var setMarqueeTarget = function (v) { marqueeTarget = 1 + Math.min(2.5, Math.abs(v) / 1500); };
        window.ScrollTrigger.create({
          trigger: document.body, start: 'top top', end: 'max',
          onUpdate: function (self) { setMarqueeTarget(self.getVelocity()); }
        });
        if (lenis) { lenis.on('scroll', function (e) { setMarqueeTarget((e.velocity || 0) * 60); }); }
        window.gsap.ticker.add(function () {
          var cur = marqueeTween.timeScale();
          marqueeTween.timeScale(window.gsap.utils.interpolate(cur, marqueeTarget, 0.06));
          marqueeTarget += (1 - marqueeTarget) * 0.02; /* ease back to normal speed */
        });
      }
    }
  }

  /* ---------- Three.js hero canvas: particle field + floating shapes ----------
     Palette-matched, mouse-reactive, behind the hero text (pointer-events: none).
     Desktop only, skipped on reduced motion / small screens / WebGL failure —
     the gradient orbs underneath keep the hero complete without it. */
  (function initThree() {
    var canvas = document.getElementById('webgl');
    if (!canvas || typeof window.THREE === 'undefined' || reduceMotion || !isDesktop) return;
    var renderer;
    try {
      renderer = new window.THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    } catch (err) { canvas.remove(); return; }
    if (!renderer.getContext()) { canvas.remove(); return; }

    var PALETTE = [0x7C3AED, 0xFF2E88, 0xFF6B1A, 0xC6FF00, 0x00E5FF];
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    var scene = new window.THREE.Scene();
    var camera = new window.THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 9;
    var group = new window.THREE.Group();
    scene.add(group);

    /* Particle field */
    var COUNT = 320;
    var pos = new Float32Array(COUNT * 3);
    var col = new Float32Array(COUNT * 3);
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
    group.add(new window.THREE.Points(geo, new window.THREE.PointsMaterial({
      size: 0.07, vertexColors: true, transparent: true, opacity: 0.9, sizeAttenuation: true
    })));

    /* Floating wireframe shapes */
    var shapes = [];
    var geos = [
      new window.THREE.IcosahedronGeometry(0.55, 0),
      new window.THREE.OctahedronGeometry(0.5, 0),
      new window.THREE.TorusGeometry(0.45, 0.14, 12, 32),
      new window.THREE.BoxGeometry(0.7, 0.7, 0.7)
    ];
    for (var s = 0; s < 8; s++) {
      var mat = new window.THREE.MeshBasicMaterial({
        color: PALETTE[s % PALETTE.length], wireframe: true, transparent: true, opacity: 0.5
      });
      var mesh = new window.THREE.Mesh(geos[s % geos.length], mat);
      mesh.position.set((Math.random() - 0.5) * 11, (Math.random() - 0.5) * 5.5, -2 - Math.random() * 3);
      mesh.userData.spin = 0.15 + Math.random() * 0.35;
      group.add(mesh);
      shapes.push(mesh);
    }

    var mouseX = 0, mouseY = 0, tx = 0, ty = 0;
    if (finePointer) {
      document.addEventListener('mousemove', function (e) {
        tx = (e.clientX / window.innerWidth - 0.5) * 2;
        ty = (e.clientY / window.innerHeight - 0.5) * 2;
      });
    }
    var heroVisible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
      }, { threshold: 0 }).observe(document.querySelector('.hero'));
    }
    var resize = function () {
      var hero = document.querySelector('.hero');
      var w = hero.clientWidth, h = hero.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', resize);
    resize();

    var clock = new window.THREE.Clock();
    (function animate() {
      requestAnimationFrame(animate);
      if (!heroVisible || document.hidden) return;
      var t = clock.getElapsedTime();
      mouseX += (tx - mouseX) * 0.04;
      mouseY += (ty - mouseY) * 0.04;
      group.rotation.y = t * 0.04 + mouseX * 0.35;
      group.rotation.x = mouseY * 0.22;
      shapes.forEach(function (m, i) {
        m.rotation.x += 0.002 * m.userData.spin * 10 * 0.1 + 0.001;
        m.rotation.y += 0.003 * m.userData.spin * 10 * 0.1;
        m.position.y += Math.sin(t * 0.7 + i) * 0.0012;
      });
      renderer.render(scene, camera);
    })();
  })();

  /* ---------- Lottie: one small animation in the contact section ----------
     JSON verified 200 (assets.lottiefiles.com/packages/lf20_jcikwtux.json —
     people working at screens). If the library or JSON fails, the container
     stays hidden and nothing breaks. */
  (function initLottie() {
    var wrap = document.getElementById('lottieWrap');
    if (!wrap || typeof window.lottie === 'undefined') return;
    try {
      var anim = window.lottie.loadAnimation({
        container: wrap,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'https://assets.lottiefiles.com/packages/lf20_jcikwtux.json'
      });
      anim.setSpeed(0.8);
      anim.addEventListener('DOMLoaded', function () { wrap.classList.add('on'); });
      anim.addEventListener('data_failed', function () { wrap.remove(); });
    } catch (err) { wrap.remove(); }
  })();
})();
