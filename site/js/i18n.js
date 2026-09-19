/* =====================================================================
   I18N — tiny translation layer.
   t(key, vars)  → UI string from the active pack (falls back to English, then the key)
   td(str)       → content string (rules, traits, wallpapers…) translated by English source text
   Packs live in js/lang/*.js and register themselves with I18N.register().
   ===================================================================== */
const I18N = (() => {
  const LANGS = {
    en: { name: 'English',  native: 'English',  font: "'Geist', 'Inter', system-ui, sans-serif", display: "'Geist', 'Inter', system-ui, sans-serif" },
    hi: { name: 'Hindi',    native: 'हिन्दी',   font: "'Noto Sans Devanagari', 'Geist', 'Inter', sans-serif", display: "'Noto Sans Devanagari', 'Geist', sans-serif" },
    mr: { name: 'Marathi',  native: 'मराठी',    font: "'Noto Sans Devanagari', 'Geist', 'Inter', sans-serif", display: "'Noto Sans Devanagari', 'Geist', sans-serif" },
    ta: { name: 'Tamil',    native: 'தமிழ்',    font: "'Noto Sans Tamil', 'Geist', 'Inter', sans-serif",      display: "'Noto Sans Tamil', 'Geist', sans-serif" },
    gu: { name: 'Gujarati', native: 'ગુજરાતી',  font: "'Noto Sans Gujarati', 'Geist', 'Inter', sans-serif",   display: "'Noto Sans Gujarati', 'Geist', sans-serif" },
  };
  const packs = {};
  let lang = 'en';
  const listeners = [];

  const register = (code, pack) => { packs[code] = pack; };
  const interpolate = (s, vars) => vars ? s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m)) : s;

  function t(key, vars) {
    const s = (packs[lang] && packs[lang].ui && packs[lang].ui[key]) ?? (packs.en && packs.en.ui[key]) ?? key;
    return interpolate(s, vars);
  }
  function td(str) {
    if (str == null) return '';
    const d = packs[lang] && packs[lang].data;
    return (d && d[str]) || str;
  }

  function setLang(code, { silent } = {}) {
    if (!LANGS[code]) code = 'en';
    lang = code;
    document.documentElement.lang = code;
    document.documentElement.style.setProperty('--font', LANGS[code].font);
    document.documentElement.style.setProperty('--display', LANGS[code].display);
    try { localStorage.setItem('lang', code); } catch {}
    applyStatic();
    if (!silent) listeners.forEach(fn => fn(code));
  }

  /** Translate every element carrying data-i18n / data-i18n-html / data-i18n-ph / data-i18n-title */
  function applyStatic(root = document) {
    root.querySelectorAll('[data-i18n]').forEach(el => el.textContent = t(el.dataset.i18n));
    root.querySelectorAll('[data-i18n-html]').forEach(el => el.innerHTML = t(el.dataset.i18nHtml));
    root.querySelectorAll('[data-i18n-ph]').forEach(el => el.placeholder = t(el.dataset.i18nPh));
    root.querySelectorAll('[data-i18n-title]').forEach(el => el.title = t(el.dataset.i18nTitle));
  }

  function init() {
    let saved = null;
    const q = new URLSearchParams(location.search).get('lang');   // ?lang=hi from localized blog pages
    if (q && LANGS[q]) saved = q;
    else try { saved = localStorage.getItem('lang'); } catch {}
    if (!saved) { const nav = (navigator.language || 'en').slice(0, 2); if (LANGS[nav]) saved = nav; }
    setLang(saved || 'en', { silent: true });
  }

  return { LANGS, register, t, td, setLang, applyStatic, init, onChange: fn => listeners.push(fn), get lang() { return lang; }, fontFor: code => LANGS[code || lang].font };
})();
const t = I18N.t, td = I18N.td;
