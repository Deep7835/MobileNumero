/* =====================================================================
   PUBLIC site configuration. Only values that are safe to expose in a
   browser belong here (analytics measurement IDs are public by design).
   Never put API keys, tokens or passwords in any front-end file.
   ===================================================================== */
window.SITE_CONFIG = {
  url: 'https://numberkundli.com',   // canonical site URL — change before deploying (also in tools/build.py)
  name: 'Mobile Numerology',
  analytics: {
    ga4: '',        // e.g. 'G-XXXXXXXXXX' — loaded only after cookie consent
    plausible: '',  // e.g. 'numberkundli.com' — cookieless, loaded after consent
  },
  contact: {
    whatsapp: '',   // e.g. '919737765591' (country code + number, digits only) — enables the "Talk to an expert" CTA
  },
};
