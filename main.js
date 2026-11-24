// Mobile menu
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('nav');
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded', open);
});
nav.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  })
);

// Show a labelled placeholder for any photo/video that hasn't been added yet
document.querySelectorAll('.media').forEach(fig => {
  const el = fig.querySelector('img, video');
  if (!el) return;
  const markEmpty = () => fig.classList.add('is-empty');
  if (el.tagName === 'IMG') {
    if (el.complete && el.naturalWidth === 0) markEmpty();
    el.addEventListener('error', markEmpty);
  } else {
    el.addEventListener('error', markEmpty);
    if (el.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) markEmpty();
  }
});

// Interview video: play on click, show controls once started
const iv = document.getElementById('interview-video');
if (iv) {
  const fig = iv.closest('.interview-video');
  const start = () => {
    iv.controls = true;
    iv.play().then(() => fig.classList.add('is-playing')).catch(() => {
      alert('The interview video is coming soon.');
    });
    fig.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  document.querySelectorAll('.play, .play-link').forEach(b => b.addEventListener('click', start));
  iv.addEventListener('play', () => fig.classList.add('is-playing'));
}

// Stories scroller: arrows, counter, progress, drag, keyboard
document.querySelectorAll('.stories-track').forEach(track => {
  const section = track.parentElement;
  const cards = [...track.querySelectorAll('.story-card')];
  const prev = section.querySelector('.stories-prev');
  const next = section.querySelector('.stories-next');
  const cur = section.querySelector('.stories-current');
  const tot = section.querySelector('.stories-total');
  const bar = section.querySelector('.stories-progress-bar');
  const pad = n => String(n).padStart(2, '0');
  if (tot) tot.textContent = pad(cards.length);

  const step = () => (cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth);
  const update = () => {
    const max = track.scrollWidth - track.clientWidth;
    const idx = Math.min(cards.length - 1, Math.round(track.scrollLeft / step()));
    if (cur) cur.textContent = pad(idx + 1);
    if (bar) bar.style.transform = `scaleX(${max <= 0 ? 1 : Math.max(track.clientWidth / track.scrollWidth, (track.scrollLeft + track.clientWidth) / track.scrollWidth)})`;
    if (prev) prev.disabled = track.scrollLeft <= 4;
    if (next) next.disabled = track.scrollLeft >= max - 4;
  };
  // Glide to a card with our own easing (snap is paused while moving)
  let anim = null;
  const glideTo = target => {
    const max = track.scrollWidth - track.clientWidth;
    target = Math.max(0, Math.min(max, target));
    cancelAnimationFrame(anim);
    if (reduceMotion) { track.scrollLeft = target; update(); return; }
    const from = track.scrollLeft, dist = target - from, t0 = performance.now(), dur = 700;
    track.classList.add('is-animating');
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1);
      const e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      track.scrollLeft = from + dist * e;
      if (p < 1) anim = requestAnimationFrame(tick);
      else { track.classList.remove('is-animating'); update(); }
    };
    anim = requestAnimationFrame(tick);
  };
  const go = dir => {
    const idx = Math.round(track.scrollLeft / step()) + dir;
    glideTo(idx * step());
  };
  prev && prev.addEventListener('click', () => go(-1));
  next && next.addEventListener('click', () => go(1));
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  track.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  });

  // Click-and-drag with a mouse
  let down = false, startX = 0, startLeft = 0, moved = false;
  track.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
  });
  window.addEventListener('pointermove', e => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) > 6) { moved = true; track.classList.add('is-dragging'); }
    if (moved) track.scrollLeft = startLeft - dx;
  });
  window.addEventListener('pointerup', () => {
    if (!down) return;
    down = false;
    if (moved) {
      track.classList.remove('is-dragging');
      glideTo(Math.round(track.scrollLeft / step()) * step());
    }
  });
  track.addEventListener('click', e => { if (moved) { e.preventDefault(); moved = false; } }, true);
  update();
});

// Business brain: entrance, live feed that lights up its tool, hover links
document.querySelectorAll('.brain-stage').forEach(stage => {
  const section = stage.closest('.brain');
  const items = [...section.querySelectorAll('.feed-item')];
  const core = stage.querySelector('.brain-core');
  stage.querySelectorAll('.brain-icon path').forEach(p => p.setAttribute('pathLength', '1'));
  const light = (i, on) => {
    stage.querySelectorAll(`.brain-tool[data-i="${i}"], .brain-line[data-i="${i}"]`).forEach(el => el.classList.toggle('is-hot', on));
  };
  // hover a tile to light its connection
  stage.querySelectorAll('.brain-tool').forEach(t => {
    t.addEventListener('mouseenter', () => light(t.dataset.i, true));
    t.addEventListener('mouseleave', () => light(t.dataset.i, false));
  });

  let k = 0, timer = null, started = false;
  const show = () => {
    items.forEach((el, n) => {
      el.classList.toggle('is-on', n === k);
      el.classList.toggle('is-off', n !== k && el.classList.contains('is-on'));
    });
    const i = items[k] && items[k].dataset.i;
    stage.querySelectorAll('.is-hot').forEach(el => el.classList.remove('is-hot'));
    if (i !== undefined) {
      light(i, true);
      core.classList.add('is-hit');
      setTimeout(() => core.classList.remove('is-hit'), 500);
    }
    setTimeout(() => items.forEach(el => el.classList.remove('is-off')), 650);
  };
  const start = () => {
    if (started) return; started = true;
    stage.classList.add('is-in');
    setTimeout(() => {
      show();
      if (!reduceMotion) timer = setInterval(() => { k = (k + 1) % items.length; show(); }, 3200);
    }, reduceMotion ? 0 : 1800);
  };
  if ('IntersectionObserver' in window) {
    const bio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { start(); bio.disconnect(); } }), { threshold: 0.25 });
    bio.observe(stage);
  } else start();
  // pause the feed when the tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { clearInterval(timer); timer = null; }
    else if (started && !timer && !reduceMotion) timer = setInterval(() => { k = (k + 1) % items.length; show(); }, 3200);
  });
});

document.getElementById('year').textContent = new Date().getFullYear();

/* ------------------------------------------------------------------
   Motion: smooth scroll, reveals, icon drawing, count-up, header state
   ------------------------------------------------------------------ */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;

// Smooth, slightly slower scrolling (desktop wheel/trackpad; touch stays native)
let lenis = null;
if (!reduceMotion && window.Lenis) {
  lenis = new Lenis({
    lerp: 0.075, wheelMultiplier: 0.9, smoothWheel: true,
    // Let sideways swipes over the stories scroller scroll it natively
    virtualScroll: ({ deltaX, deltaY, event }) =>
      !(Math.abs(deltaX) > Math.abs(deltaY) && event.target.closest && event.target.closest('.stories-track'))
  });
  const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
}

// In-page links glide to their section (header height offset)
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: -72, duration: 1.6 });
    else target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    history.replaceState(null, '', id);
  });
});
// Arriving from another page with a #hash
if (lenis && location.hash) {
  window.addEventListener('load', () => {
    const t = document.querySelector(location.hash);
    if (t) { lenis.resize(); lenis.scrollTo(t, { offset: -72, immediate: true, force: true }); }
  });
}

// Header gains a soft shadow once the page scrolls
const header = document.querySelector('.site-header');
const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

if (!reduceMotion && 'IntersectionObserver' in window) {
  root.classList.add('motion');

  // Elements that fade up as they enter; siblings are staggered
  const groups = [
    '.section-head', '.band', '.brain-steps li', '.brain-feed', '.service', '.model', '.tool', '.principles article',
    '.step', '.story-card', '.member', '.faq details', '.statement blockquote',
    '.interview-head > *', '.interview-media > *', '.testimonial', '.testimonial-cta',
    '.hero-copy', '.hero-side', '.gallery-caption', '.tools-note', '.sub-label',
    '.article-head > *', '.article-body > *', '.article-cover', '.article-wide', '.article-trio', '.article-pair',
    '.article-caption', '.trust-row', '.photo-band blockquote'
  ];
  const items = new Set();
  groups.forEach(sel => document.querySelectorAll(sel).forEach(el => items.add(el)));
  items.forEach(el => {
    el.classList.add('reveal');
    const sibs = [...el.parentElement.children].filter(c => items.has(c));
    const i = sibs.indexOf(el);
    el.style.setProperty('--d', `${Math.min(i, 7) * 80}ms`);
  });

  // Gallery tiles unveil one by one
  document.querySelectorAll('.gallery .media').forEach((el, i) => {
    el.classList.add('unveil');
    el.style.setProperty('--d', `${250 + i * 140}ms`);
  });

  // Line icons draw themselves
  document.querySelectorAll('.icon').forEach(svg => {
    svg.querySelectorAll('path, circle, rect, polyline, line').forEach(p => p.setAttribute('pathLength', '1'));
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      io.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  document.querySelectorAll('.reveal, .icon').forEach(el => io.observe(el));

  // Gallery: watch the (unclipped) container, then unveil every tile
  const gio = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.querySelectorAll('.unveil').forEach(t => t.classList.add('is-in'));
      gio.unobserve(en.target);
    });
  }, { threshold: 0.05 });
  document.querySelectorAll('.gallery').forEach(g => gio.observe(g));

  // Safety net: never leave on-screen content hidden
  const showVisible = () => {
    document.querySelectorAll('.reveal:not(.is-in), .unveil:not(.is-in), .icon:not(.is-in), .brain-stage:not(.is-in)').forEach(el => {
      const r = (el.closest('.gallery') || el).getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-in');
    });
  };
  window.addEventListener('load', () => setTimeout(showVisible, 1200));
  setTimeout(showVisible, 2500);

  // Count-up for numeric figures, e.g. <span data-count="36" data-suffix="M">
  const counters = document.querySelectorAll('[data-count]');
  const cio = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target, end = +el.dataset.count, suffix = el.dataset.suffix || '';
      const t0 = performance.now(), dur = 1600;
      const tick = now => {
        const p = Math.min((now - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(end * eased).toLocaleString('en-US') + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      cio.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach(el => { el.textContent = '0' + (el.dataset.suffix || ''); cio.observe(el); });

  // Hero headline rises in line by line on load
  requestAnimationFrame(() => root.classList.add('loaded'));

  // Fast typing effect for quotes marked data-type. Characters are hidden, not
  // removed, so the layout never jumps while the text types in.
  document.querySelectorAll('[data-type] p').forEach(p => {
    const chars = [];
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          for (const ch of n.textContent) {
            const s = document.createElement('span');
            s.className = 'tch'; s.textContent = ch;
            frag.appendChild(s); chars.push(s);
          }
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(p);
    const caret = document.createElement('span');
    caret.className = 'type-caret'; caret.setAttribute('aria-hidden', 'true');
    p.closest('[data-type]').classList.add('is-typing-ready');
    const tio = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      tio.disconnect();
      let i = 0;
      const step = () => {
        const n = Math.min(i + 2, chars.length);
        for (; i < n; i++) chars[i].classList.add('on');
        chars[i - 1].after(caret);
        if (i < chars.length) setTimeout(step, 28);
        else setTimeout(() => caret.classList.add('done'), 1800);
      };
      step();
    }, { threshold: 0.5 });
    tio.observe(p);
  });
}
