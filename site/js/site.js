/* =====================================================================
   Shared site behaviour for every page:
   HTTPS enforcement, mobile nav, cookie consent + gated analytics, CTA.
   ===================================================================== */
(() => {
  const cfg = window.SITE_CONFIG || {};

  /* ---------- 1. Force HTTPS (server-side rules live in netlify.toml / vercel.json / .htaccess) ---------- */
  const isLocal = /^(localhost|127\.|0\.0\.0\.0|\[::1\]|.*\.local)$/.test(location.hostname) || location.protocol === 'file:';
  if (location.protocol === 'http:' && !isLocal) {
    location.replace('https://' + location.host + location.pathname + location.search + location.hash);
    return;
  }

  /* ---------- 1b. Theme (dark by default; light if saved or preferred). The <head> snippet applies it pre-paint. ---------- */
  const root = document.documentElement;
  const setIcons = () => document.querySelectorAll('.theme-toggle').forEach(b => b.innerHTML = ico(root.dataset.theme === 'light' ? 'moon' : 'sun'));
  setIcons();
  document.querySelectorAll('.theme-toggle').forEach(b => b.addEventListener('click', () => {
    const light = root.dataset.theme !== 'light';
    if (light) root.dataset.theme = 'light'; else root.removeAttribute('data-theme');
    try { localStorage.setItem('theme', light ? 'light' : 'dark'); } catch {}
    setIcons();
  }));

  /* ---------- 2. Mobile navigation ---------- */
  const navBtn = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navBtn && navLinks) {
    navBtn.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      navBtn.setAttribute('aria-expanded', String(open));
      navBtn.innerHTML = ico(open ? 'x' : 'menu');
    });
    navLinks.addEventListener('click', e => { if (e.target.tagName === 'A') { navLinks.classList.remove('open'); navBtn.setAttribute('aria-expanded', 'false'); navBtn.innerHTML = ico('menu'); } });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { navLinks.classList.remove('open'); navBtn.setAttribute('aria-expanded', 'false'); navBtn.innerHTML = ico('menu'); } });
  }


  /* ---------- 3. Cookie consent (gates analytics) ---------- */
  const store = {
    get: k => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
  };
  const hasAnalytics = !!(cfg.analytics && (cfg.analytics.ga4 || cfg.analytics.plausible));

  function loadAnalytics() {
    if (!hasAnalytics || window.__analyticsLoaded) return;
    window.__analyticsLoaded = true;
    if (cfg.analytics.ga4) {
      const s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(cfg.analytics.ga4);
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      gtag('js', new Date()); gtag('config', cfg.analytics.ga4, { anonymize_ip: true });
    }
    if (cfg.analytics.plausible) {
      const s = document.createElement('script'); s.defer = true; s.dataset.domain = cfg.analytics.plausible; s.src = 'https://plausible.io/js/script.js';
      document.head.appendChild(s);
    }
  }
  /** Fire a custom event with whichever analytics is configured (no-op without consent). */
  window.trackEvent = (name, params) => {
    if (store.get('cookie-consent') !== 'accepted') return;
    if (window.gtag) gtag('event', name, params || {});
    if (window.plausible) plausible(name, { props: params || {} });
  };

  const consent = store.get('cookie-consent');
  if (consent === 'accepted') loadAnalytics();
  else if (!consent) {
    const privacyHref = '/privacy';
    const banner = document.createElement('div');
    banner.className = 'cookie-banner'; banner.setAttribute('role', 'dialog'); banner.setAttribute('aria-live', 'polite'); banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML = `
      <div class="cookie-text"><strong>${ico('cookie')} Cookies &amp; privacy.</strong> This site stores your language and theme preferences on your device.
        ${hasAnalytics ? 'With your consent we also use anonymised analytics to understand which pages are useful.' : 'No tracking cookies are set.'}
        <a href="${privacyHref}">Privacy policy</a></div>
      <div class="cookie-actions">
        ${hasAnalytics ? '<button class="btn secondary sm" data-consent="declined">Decline</button>' : ''}
        <button class="btn sm" data-consent="accepted">${hasAnalytics ? 'Accept' : 'OK, got it'}</button>
      </div>`;
    banner.addEventListener('click', e => {
      const v = e.target.dataset.consent; if (!v) return;
      store.set('cookie-consent', v); banner.classList.add('hide'); setTimeout(() => banner.remove(), 300);
      if (v === 'accepted') loadAnalytics();
    });
    document.body.appendChild(banner);
    requestAnimationFrame(() => banner.classList.add('show'));
  }

  const socials = (cfg.social || {}); const socialHtml = Object.entries(socials).filter(([, v]) => v).map(([k, v]) => `<a href="${v}" target="_blank" rel="noopener" style="margin-right:12px">${{instagram: 'Instagram', youtube: 'YouTube', facebook: 'Facebook', x: 'X', linkedin: 'LinkedIn'}[k] || k}</a>`).join('');
  document.querySelectorAll('[data-social-links]').forEach(el => el.innerHTML = socialHtml ? socialHtml + '<span class="dot">·</span> ' : '');

  /* ---------- 4. Sticky CTA (one clear action on every page) ---------- */
  const cta = document.querySelector('.sticky-cta');
  if (cta) {
    const target = document.querySelector('#mainForm');
    const show = () => { const past = window.scrollY > 500; const formVisible = target && target.getBoundingClientRect().bottom > 0 && target.getBoundingClientRect().top < innerHeight; cta.classList.toggle('show', past && !formVisible); };
    addEventListener('scroll', show, { passive: true }); show();
  }
  const wa = cfg.contact && cfg.contact.whatsapp;
  document.querySelectorAll('[data-whatsapp]').forEach(el => {
    if (wa) el.href = 'https://wa.me/' + wa.replace(/\D/g, '') + '?text=' + encodeURIComponent('Hi, I would like a mobile numerology consultation.');
    else el.remove();
  });
})();
