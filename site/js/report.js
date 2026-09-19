/* =====================================================================
   REPORT — builds a self-contained, print-friendly HTML report from a
   profile and downloads it as PDF (html2pdf.js, loaded on demand) or
   opens it in the browser's print dialog as a fallback.
   ===================================================================== */
const Report = (() => {
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const steps = arr => arr.join(' → ');
  const chip = (txt, kind) => `<span class="c ${kind || ''}">${txt}</span>`;
  const rel = r => chip(t('rel.' + r), r === 'friendly' ? 'g' : r === 'enemy' ? 'b' : 'n');
  const grade = g => t('g.' + g);
  const planet = n => td(DATA.numbers[n].planet);
  const ftext = f => f.key ? t(f.key, f.vars) : td(f.text);

  const RAW_CSS = `
    *{box-sizing:border-box;font-family:var(--rfont, Inter, Helvetica, Arial, sans-serif)}
    body{color:#1b1d33;margin:0;font-size:12px;line-height:1.45;background:#fff;width:100%}
    .page{padding:28px 32px}
    h1{font-size:24px;margin:0 0 2px} h2{font-size:15px;margin:16px 0 8px;padding-bottom:4px;border-bottom:2px solid #8b7bff;color:#2b2560}
    h3{font-size:12.5px;margin:10px 0 4px} p{margin:0 0 6px} .muted{color:#6b6f8f} .small{font-size:10.5px}
    .head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid #ddd;padding-bottom:10px}
    .brand{font-weight:800;font-size:13px;color:#8b7bff}
    .row{display:flex;gap:12px;flex-wrap:wrap;grid-template-columns:none} .col{flex:1;min-width:180px}
    .box{border:1px solid #e3e4ef;border-radius:10px;padding:10px 12px;background:#fafaff;margin-bottom:8px}
    .num{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,#ffcb47,#ffe08a);font-weight:800;font-size:20px;margin-right:10px;vertical-align:middle}
    .num.v{background:linear-gradient(135deg,#8b7bff,#c3b8ff)}
    .c{display:inline-block;padding:1px 7px;border-radius:99px;font-size:10.5px;font-weight:600;border:1px solid #ccc;margin:1px 2px 1px 0;background:#f1f1f6}
    .c.g{background:#e3f8ee;color:#137a4e;border-color:#9fdcbf} .c.b{background:#fde8e8;color:#b42323;border-color:#f3b4b4} .c.n{color:#666}
    .c.m{background:#ebe8ff;color:#4b3fb5;border-color:#c3b8ff}
    table{width:100%;border-collapse:collapse;font-size:11px} th,td{text-align:left;padding:4px 6px;border-bottom:1px solid #e7e7f0;vertical-align:top} th{font-size:10px;text-transform:uppercase;color:#6b6f8f}
    .grid{display:grid;grid-template-columns:repeat(3,34px);gap:3px} .grid div{height:34px;border:1px solid #ccd;border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;background:#fff}
    .grid div.e{color:#bbb} .grid div.f{background:#ebe8ff}
    .pos{display:grid;grid-template-columns:repeat(10,1fr);gap:4px;margin:6px 0;padding:0;background:none;border:0;border-radius:0}
    .pos div{border:1px solid #ddd;border-radius:6px;text-align:center;padding:4px 2px;font-size:9px} .pos b{display:block;font-size:16px}
    .pos .g{background:#e3f8ee;border-color:#9fdcbf} .pos .b{background:#fde8e8;border-color:#f3b4b4} .pos .x{background:#fff4d6;border-color:#f3d48a}
    ul{margin:4px 0;padding-left:16px} li{margin-bottom:2px}
    .score{font-size:30px;font-weight:800} .q{font-style:italic;border-left:3px solid #ffcb47;padding:4px 8px;margin:4px 0;background:#fffbea}
    .foot{margin-top:18px;border-top:1px solid #ddd;padding-top:8px;font-size:9.5px;color:#6b6f8f;page-break-inside:avoid}
    h2{page-break-after:avoid}
    .pb{page-break-inside:avoid;padding-top:6px}   /* padding keeps tall glyphs clear of the page boundary after a forced break */
  `;
  /* Every rule is scoped to .rpt so the page's own stylesheet cannot leak in (and vice-versa). */
  const CSS = RAW_CSS.replace(/([^{}]+)\{/g, (m, sel) =>
    sel.split(',').map(x => { x = x.trim(); return x === 'body' ? '.rpt' : x === '*' ? '.rpt *' : '.rpt ' + x; }).join(', ') + '{');
  const wrap = inner => `<style>${CSS}</style><div class="rpt" lang="${I18N.lang}" style="--rfont:${I18N.fontFor()}">${inner}</div>`;
  const doc = inner => `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Numerology report</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Sans+Tamil:wght@400;500;600;700&family=Noto+Sans+Gujarati:wght@400;500;600;700&display=swap" rel="stylesheet" /></head><body style="margin:0">${wrap(inner)}</body></html>`;

  const DISCLAIMER = 'Numerology is a belief-based practice offered for guidance and entertainment; it is not medical, legal or financial advice. Never share your real PIN or password. Content based on the Advance Mobile Numerology Class material by Dr. Isha Thakkar Numerology.';

  function build(profile, opts) {
    const p = profile, N = Numerology, D = DATA;
    const mobileRaw = opts.mobile || '';
    const m = mobileRaw.replace(/\D/g, '').length ? N.analyzeMobile(mobileRaw, p) : null;
    const gen = N.generatePins(p, 6).map(x => ({ ...x, check: N.checkPin(x.pin, p) }));
    const purpose = D.purposes.find(x => x.id === opts.purpose) || D.purposes[0];
    const purposePins = N.purposePins(purpose.id, p).slice(0, 6);
    const pws = N.purposePasswords(purpose.id, p);
    const covers = N.recommendCovers(p).filter(c => c.matchBN || c.matchDN);
    const colors = N.recommendColors(p);
    const ideal = N.idealDigitsByPosition(p);
    const lucky = N.generateNumbers(p, { perPattern: 3 });
    const gridOrder = [4, 9, 2, 3, 5, 7, 8, 1, 6];
    const today = new Date().toLocaleDateString({ en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN', ta: 'ta-IN', gu: 'gu-IN' }[I18N.lang] || 'en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const numCard = (n, cls, label, st) => `<div class="col box"><span class="num ${cls}">${n}</span><b>${label}</b><div class="small muted">${st}</div><div class="small">${planet(n)} — ${td(D.numbers[n].keyword)}</div></div>`;
    const wall = (n, label) => { const w = D.wallpapers[n]; return `<div class="col box"><b>${label} ${n}</b><ul>${w.items.map(i => `<li>${td(i)}</li>`).join('')}<li>${t('w.solid', { colors: w.colors.map(td).join(' / ') })}</li></ul></div>`; };
    const aff = (n, label) => { const a = D.affirmations[n]; return `<div class="col box pb"><b>${label} ${n}</b>${a.lines.map(l => `<div class="q">“${td(l)}”</div>`).join('')}<div class="small"><b>${t('a.ringtone')}:</b> ${a.ringtones.map(td).join(', ')} · <b>${t('a.mantra')}:</b> ${td(a.mantra)}</div></div>`; };
    let name = '';
    if (p.name) { const c = N.chaldean(p.name); name = `<div class="col box"><span class="num" style="background:linear-gradient(135deg,#4fd1c5,#a8f0e8)">${c.single}</span><b>${t('p.nameNumber')}</b><div class="small muted">${esc(p.name)} → ${steps(c.steps)}</div><div class="small">${rel(N.relation(p.bn, c.single))} ${t('p.withBN')} · ${rel(N.relation(p.dn, c.single))} ${t('p.withDN')}</div></div>`; }

    const mobileHtml = m && !m.error ? `
      <div class="box pb">
        <div class="row"><div><div class="score">${m.score}<span class="small muted">/100</span></div><b>${grade(m.grade)}</b></div>
          <div class="col small"><b>${t('r.number')}:</b> ${m.str.replace(/(\d{5})(\d{5})/, '$1 $2')}<br/><b>${t('r.total')}:</b> ${steps(m.totalSteps)} (${planet(m.total)})<br/>
          <b>${t('r.withBN', { n: p.bn })}:</b> ${rel(m.compat.rBN)} &nbsp; <b>${t('r.withDN', { n: p.dn })}:</b> ${rel(m.compat.rDN)} ${m.compat.balancer ? chip(t('r.balancerTotal'), 'g') : ''}</div></div>
        <div class="pos">${m.positions.map(x => { const hb = x.hits.some(h => h.type === 'bad'), hg = x.hits.some(h => h.type === 'good'); return `<div class="${hb && hg ? 'x' : hb ? 'b' : hg ? 'g' : ''}">P${x.pos}<b>${x.digit}</b>${td(x.meaning.title)}</div>`; }).join('')}</div>
        <div class="row"><div class="col"><h3 style="color:#b42323">${t('r.warnings', { n: m.bad.length })}</h3><ul>${m.bad.map(f => `<li>${f.pos ? `<b>${t('r.pos')} ${f.pos} (${f.digit})</b> — ` : ''}${ftext(f)}</li>`).join('') || `<li>${t('m.none')}</li>`}</ul></div>
        <div class="col"><h3 style="color:#137a4e">${t('r.strengths', { n: m.good.length })}</h3><ul>${m.good.map(f => `<li>${f.pos ? `<b>${t('r.pos')} ${f.pos} (${f.digit})</b> — ` : ''}${ftext(f)}</li>`).join('') || `<li>${t('m.none')}</li>`}</ul></div></div>
      </div>` : `<p class="muted">${t('r.noMobile')}</p>`;

    const html = `<div class="page">
      <div class="head"><div><div class="brand">${t('r.brand')}</div><h1>${t('r.title')}${p.name ? ' — ' + esc(p.name) : ''}</h1>
        <div class="small muted">${t('r.dob')} ${String(p.day).padStart(2, '0')}/${String(p.month).padStart(2, '0')}/${p.year} · ${t('r.purpose')}: ${td(purpose.label)} · ${t('r.generated')} ${today}</div></div></div>

      <h2>${t('r.s1')}</h2>
      <div class="row">${numCard(p.bn, '', t('p.bn'), t('p.day') + ' ' + steps(p.bnSteps))}${numCard(p.dn, 'v', t('p.dn'), steps(p.dnSteps))}${name}</div>
      <div class="row">
        <div class="box" style="flex:0 0 auto"><b>${t('p.loshu')}</b><div class="grid" style="margin-top:6px">${gridOrder.map(n => { const c = p.grid[n]; return `<div class="${c ? 'f' : 'e'}">${c ? String(n).repeat(c) : n}</div>`; }).join('')}</div></div>
        <div class="col box"><b>${t('p.missing')}:</b> ${p.missing.map(x => chip(x, 'm')).join('') || '—'}<br/><b>${t('p.friendlyBN')}:</b> ${p.friendsBN.map(x => chip(x, 'g')).join('')}<br/><b>${t('p.friendlyDN')}:</b> ${p.friendsDN.map(x => chip(x, 'g')).join('')}<br/><b>${t('p.balancer')}:</b> ${p.balancers.map(x => chip(x, 'g')).join('') || '—'}<br/><b>${t('p.avoid')}:</b> ${p.enemies.map(x => chip(x, 'b')).join('') || '—'}</div>
      </div>

      <h2>${t('r.s2')}</h2>
      ${mobileHtml}
      <div class="box pb"><b>${t('r.ideal')}</b>
        <table style="margin-top:4px"><tr><th>${t('r.pos')}</th><th>${t('r.governs')}</th><th>${t('r.best')}</th><th>${t('r.safe')}</th></tr>${Object.entries(ideal).map(([pos, v]) => `<tr><td><b>${pos}</b></td><td>${td(D.positions[pos].title)}</td><td>${v.good.map(d => chip(d, 'g')).join('') || '—'}</td><td>${v.safe.map(d => chip(d, 'n')).join('') || '—'}</td></tr>`).join('')}</table>
        <p class="small muted" style="margin-top:4px">${t('r.idealTip')}</p></div>

      <h2>${t('r.s3')}</h2>
      <div class="row">
        <div class="col box pb"><b>${t('r.genForYou')}</b> <span class="small muted">${t('r.genNote')}</span>
          <table style="margin-top:4px"><tr><th>${t('r.pin')}</th><th>${t('r.total')}</th><th>${t('r.missingUsed')}</th><th>${t('r.rating')}</th></tr>${gen.map(x => `<tr><td><b>${x.pin}</b></td><td>${steps(x.check.steps)}</td><td>${x.missingUsed.join(', ') || '—'}</td><td>${chip(grade(x.check.verdict), x.check.verdict === 'Avoid' ? 'b' : x.check.verdict === 'Average' ? 'n' : 'g')}</td></tr>`).join('')}</table></div>
        <div class="col box pb"><b>${t('r.classRec', { purpose: td(purpose.label) })}</b>
          <table style="margin-top:4px"><tr><th>${t('r.pin')}</th><th>${t('r.purposeCol')}</th><th>${t('r.total')}</th><th>${t('r.rating')}</th></tr>${purposePins.map(x => `<tr><td><b>${x.pin}</b></td><td>${td(x.purpose)}</td><td>${x.check.total}</td><td>${chip(grade(x.check.verdict), x.check.verdict === 'Avoid' ? 'b' : x.check.verdict === 'Average' ? 'n' : 'g')}</td></tr>`).join('')}</table></div>
      </div>
      <p class="small muted">${D.pinRules.map(td).join(' · ')}</p>

      <h2>${t('r.s4')}</h2>
      <div class="box pb"><table><tr><th>${t('r.total')}</th><th>${t('r.purposeCol')}</th><th>${t('r.examples')}</th><th>${t('r.fit')}</th></tr>${pws.map(x => `<tr><td><b>${x.total}</b></td><td>${td(x.purpose)}</td><td>${x.examples.map(w => `${w} (${N.chaldean(w).total})`).join(', ')}</td><td>${x.avoid8 ? chip(t('r.avoid8'), 'b') : rel(x.rel) + ' BN · ' + rel(x.relDN) + ' DN'}</td></tr>`).join('')}</table>
        <p class="small muted" style="margin-top:4px">${t('r.chaldean')} ${D.passwordRules.map(td).join(' ')}</p></div>

      <h2>${t('r.s5')}</h2>
      <div class="row">${wall(p.bn, t('r.bnLabel'))}${p.dn !== p.bn ? wall(p.dn, t('r.dnLabel')) : ''}</div>

      <h2>${t('r.s6')}</h2>
      <div class="row">${covers.map(c => `<div class="col box pb"><b>${c.icon} ${td(c.name)}</b> ${c.matchBN ? chip(t('c.matchesBN', { n: p.bn }), 'g') : chip(t('c.matchesDN', { n: p.dn }), 'm')}<div class="small muted">${t('r.bestFor')} ${c.bestFor.join(', ')} · ${td(c.idealFor)}${c.tip ? ' · ' + t('c.tip') + ' ' + td(c.tip) : ''}</div><ul class="small">${c.traits.slice(0, 4).map(x => `<li>${td(x)}</li>`).join('')}</ul></div>`).join('')}</div>
      <div class="box pb"><b>${t('r.phoneColors')}</b><div style="margin-top:4px">${colors.map(c => chip(`<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${c.hex};border:1px solid #999;margin-right:4px;vertical-align:middle"></span>${td(c.name)} — ${t('r.' + (c.status === 'good' ? 'supportive' : c.status))}`, c.status === 'good' ? 'g' : c.status === 'avoid' ? 'b' : 'n')).join(' ')}</div></div>

      <h2>${t('r.s7')}</h2>
      <div class="row">${aff(p.bn, t('r.bnLabel'))}${p.dn !== p.bn ? aff(p.dn, t('r.dnLabel')) : ''}</div>

      <h2>${t('r.s8')}</h2>
      <div class="box pb"><table><tr><th>${t('r.purposeCol')}</th><th>${t('r.number')}</th><th>${t('r.total')}</th><th>${t('r.rating')}</th></tr>${lucky.map(g => g.numbers.slice(0, 2).map((n, i) => `<tr><td>${i === 0 ? t('lucky.' + g.id) : ''}</td><td><b>${n.str.replace(/(\d{5})(\d{5})/, '$1 $2')}</b></td><td>${n.total}</td><td>${n.score}/100</td></tr>`).join('')).join('')}</table>
        <p class="small muted" style="margin-top:4px">${t('r.s8note')}</p></div>
      ${opts.noFooter ? '' : `<div class="foot pb">${DISCLAIMER}</div>`}
    </div>`;
    return groupHeadings(html);
  }

  /** html2pdf only honours page-break-inside:avoid, so wrap every <h2> together with the
      element that follows it in a .pb group — a heading then never sits alone at a page bottom. */
  function groupHeadings(html) {
    const tpl = document.createElement('template');
    tpl.innerHTML = html;
    tpl.content.querySelectorAll('h2').forEach(h2 => {
      const next = h2.nextElementSibling;
      const g = document.createElement('div'); g.className = 'pb';
      h2.replaceWith(g); g.append(h2); if (next) g.append(next);
    });
    return tpl.innerHTML;
  }

  /* ---- html2pdf loader (CDN, on demand) ---- */
  let libPromise = null;
  function loadLib() {
    if (window.html2pdf) return Promise.resolve();
    if (!libPromise) libPromise = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      s.onload = res; s.onerror = () => { libPromise = null; rej(new Error('Could not load PDF library')); };
      document.head.appendChild(s);
    });
    return libPromise;
  }

  function filename(profile) {
    const base = (profile.name || 'numerology').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
    return `${base}-numberkundli-report.pdf`;
  }

  /** Download as PDF (or hand the jsPDF instance to opts.onPdf instead of saving). The report is rendered inside the page (html2canvas cannot see into
      other documents) behind a full-screen overlay, captured, then removed. */
  async function download(profile, opts) {
    await loadLib();
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(10,12,24,.92);display:grid;place-items:center;color:#fff;font:600 16px Inter,sans-serif';
    overlay.textContent = t('report.overlay');
    const host = document.createElement('div');
    host.style.cssText = 'position:fixed;top:0;left:0;width:748px;z-index:9998;background:#fff';
    host.innerHTML = wrap(build(profile, { ...opts, noFooter: true }));
    document.body.append(host, overlay);
    const scroll = { x: window.scrollX, y: window.scrollY };
    window.scrollTo(0, 0);                          // belt and braces against scroll-offset capture bugs
    try { await document.fonts.ready; } catch {}
    await new Promise(r => setTimeout(r, 200));    // let fonts/layout settle
    try {
      const worker = html2pdf().set({
        margin: [10, 8, 14, 8], image: { type: 'jpeg', quality: 0.95 },
        // The host is position:fixed, so the capture must ignore the window scroll offset.
        // Do NOT set windowWidth: html2pdf centres its own container and the crop would shift.
        html2canvas: { scale: 2, useCORS: true, scrollX: 0, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'], avoid: ['.pb', 'tr'] },
      }).from(host.firstElementChild.nextElementSibling).toContainer().toCanvas().toPdf();
      // .get() calls must be sequential — parallel gets fork the worker chain.
      const canvas = await worker.get('canvas');
      const pageSize = await worker.get('pageSize');
      const pdf = await worker.get('pdf');
      // html2pdf slices the canvas into pages of this height; if the last slice holds < 3 % of a
      // page it is a rounding artefact (an empty page), so drop it.
      const pxPageHeight = Math.floor(canvas.width * pageSize.inner.ratio);
      const remainder = canvas.height % pxPageHeight;
      if (pdf.internal.getNumberOfPages() > 1 && remainder > 0 && remainder / pxPageHeight < 0.03) pdf.deletePage(pdf.internal.getNumberOfPages());
      // Disclaimer + page numbers drawn into the bottom margin of every page
      const total = pdf.internal.getNumberOfPages();
      const W = pdf.internal.pageSize.getWidth(), H = pdf.internal.pageSize.getHeight();
      for (let i = 1; i <= total; i++) {
        pdf.setPage(i);
        pdf.setDrawColor(220); pdf.line(8, H - 11.5, W - 8, H - 11.5);
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(6.5); pdf.setTextColor(120);
        pdf.text(pdf.splitTextToSize(DISCLAIMER, W - 40), 8, H - 8);
        pdf.text(`Page ${i} of ${total}`, W - 8, H - 8, { align: 'right' });
      }
      if (opts.onPdf) opts.onPdf(pdf); else pdf.save(filename(profile));
    } finally { host.remove(); overlay.remove(); window.scrollTo(scroll.x, scroll.y); }
  }

  /** Fallback: open the report in a new tab and trigger the print dialog (Save as PDF). */
  function print(profile, opts) {
    const w = window.open('', '_blank');
    if (!w) { alert(t('report.popup')); return; }
    w.document.open(); w.document.write(doc(build(profile, opts))); w.document.close();
    w.focus(); setTimeout(() => w.print(), 600);
  }

  function preview(profile, opts) {
    const w = window.open('', '_blank');
    if (!w) { alert(t('report.popup')); return; }
    w.document.open(); w.document.write(doc(build(profile, opts))); w.document.close();
  }

  return { build, doc, wrap, download, print, preview, filename };
})();
