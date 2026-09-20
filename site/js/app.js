/* =====================================================================
   UI — renders results from the Numerology engine (all strings via i18n)
   ===================================================================== */
(() => {
  const $ = sel => document.querySelector(sel);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const relChip = (rel, label) => `<span class="chip ${rel === 'friendly' ? 'good' : rel === 'enemy' ? 'bad' : 'neutral'}">${label ? label + ': ' : ''}${t('rel.' + rel)}</span>`;
  const steps = arr => arr.length > 1 ? arr.join(' → ') : String(arr[0]);
  const grade = g => t('g.' + g);
  const planet = n => td(DATA.numbers[n].planet);
  const ftext = f => f.key ? t(f.key, f.vars) : td(f.text);

  let profile = null;
  let currentPurpose = 'money';

  /* ---------- toast ---------- */
  let toastT;
  function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 1800); }
  function copy(text) { navigator.clipboard?.writeText(text).then(() => toast(t('toast.copied', { text }))); }
  window.__copy = copy;

  /* ---------- language ---------- */
  const langSel = $('#langSelect');
  Object.entries(I18N.LANGS).forEach(([code, l]) => langSel.append(new Option(l.native, code)));
  I18N.init();
  langSel.value = I18N.lang;
  langSel.onchange = e => I18N.setLang(e.target.value);
  I18N.onChange(() => { renderStatic(); if (profile) renderAll(); refreshTools(); });

  /* ---------- static content (re-rendered on language change) ---------- */
  const purposeSel = $('#purpose');
  const seoTitle = document.title;   // the English <title> is SEO-tuned; only localise it for other languages
  function renderStatic() {
    document.querySelectorAll('a[href$="blog/"]').forEach(a => a.href = (I18N.lang === 'en' ? '' : I18N.lang + '/') + 'blog/');
    document.title = I18N.lang === 'en' ? seoTitle : t('brand') + ' — ' + t('report.title');
    const keep = purposeSel.value || 'money';
    purposeSel.innerHTML = '';
    DATA.purposes.forEach(p => purposeSel.append(new Option(td(p.label), p.id)));
    purposeSel.value = keep;

    $('#websites').innerHTML = DATA.websites.map((w, i) => `<a href="${w.url}" target="_blank" rel="noopener"><span>${i + 1}.</span> ${w.name} ↗</a>`).join('');
    $('#positionLegend').innerHTML = Object.entries(DATA.positions).map(([p, v]) => `<div class="finding"><span class="tag" style="background:var(--surface-2)">${t('m.pos')} ${p}</span><div class="txt"><b>${td(v.title)}</b><small>${td(v.desc)}</small></div></div>`).join('');

    const cols = {}; Object.entries(DATA.chaldean).forEach(([l, v]) => (cols[v] = cols[v] || []).push(l));
    $('#chaldeanTable').innerHTML = [1,2,3,4,5,6,7,8].map(v => `<div class="col"><b>${v}</b>${cols[v].map(l => `<span>${l}</span>`).join('')}</div>`).join('');

    $('#friendlyTable').innerHTML = `<thead><tr><th>${t('chart.number')}</th><th>${t('chart.planet')}</th><th>${t('chart.friendly')}</th><th>${t('chart.enemy')}</th><th>${t('chart.neutral')}</th></tr></thead><tbody>` +
      [1,2,3,4,5,6,7,8,9].map(n => { const f = DATA.friendly[n]; return `<tr><td><b>${n}</b></td><td>${planet(n)}</td>
        <td><div class="chips">${f.friends.map(x => `<span class="digit-chip good">${x}</span>`).join('')}</div></td>
        <td><div class="chips">${f.enemies.map(x => `<span class="digit-chip bad">${x}</span>`).join('') || '<span class="muted">—</span>'}</div></td>
        <td><div class="chips">${f.neutral.map(x => `<span class="digit-chip neutral">${x}</span>`).join('') || '<span class="muted">—</span>'}</div></td></tr>`; }).join('') + '</tbody>';
  }
  renderStatic();

  /* ---------- form: validation + bot protection ---------- */
  const pageLoadedAt = Date.now();
  const setInvalid = (id, bad) => { const f = $('#' + id).closest('.field'); f.classList.toggle('invalid', bad); $('#' + id).setAttribute('aria-invalid', String(bad)); return !bad; };
  function validateForm() {
    let ok = true;
    const dob = $('#dob').value;
    const d = dob ? new Date(dob + 'T00:00:00') : null;
    ok = setInvalid('dob', !d || isNaN(d) || d > new Date() || d.getFullYear() < 1900) && ok;
    const name = $('#name').value.trim();
    ok = setInvalid('name', name.length > 60 || /[^\p{L}\p{M} .'\-]/u.test(name)) && ok;
    const mob = $('#mobile').value.trim();
    ok = setInvalid('mobile', mob !== '' && mob.replace(/\D/g, '').length < 10) && ok;
    return ok;
  }
  ['dob', 'name', 'mobile'].forEach(id => $('#' + id).addEventListener('input', () => { if ($('#' + id).closest('.field').classList.contains('invalid')) validateForm(); }));

  $('#mainForm').addEventListener('submit', e => {
    e.preventDefault();
    // Bot protection: honeypot field must stay empty and a human needs at least ~1.5 s on the page.
    if ($('#website').value || Date.now() - pageLoadedAt < 1500) return;
    if (!validateForm()) { const first = document.querySelector('.field.invalid input'); if (first) first.focus(); toast(t('form.fix')); return; }
    profile = Numerology.profileFromDOB($('#dob').value);
    profile.name = $('#name').value.trim();
    currentPurpose = purposeSel.value;
    renderAll();
    $('#results').classList.remove('hidden');
    $('#sectionsDd')?.classList.remove('hidden');
    document.querySelectorAll('#results .section').forEach(s => s.classList.add('fade-in'));
    setTimeout(() => $('#profile').scrollIntoView({ behavior: 'smooth' }), 50);
    if (window.trackEvent) trackEvent('analysis_generated', { has_mobile: !!$('#mobile').value.trim(), lang: I18N.lang });
  });

  function renderAll() {
    renderProfile();
    renderMobile($('#mobile').value, $('#mobileResult'), true);
    renderPin();
    renderPassword();
    renderWallpaper();
    renderCovers();
    renderColors();
    renderAffirmation();
    renderLucky();
    renderCompare();
    renderReport();
  }

  /* ---------- profile ---------- */
  function renderProfile() {
    const p = profile;
    const numCard = (n, cls, label, stepsArr, extra) => `
      <div class="card">
        <div class="stat">
          <div class="num-badge ${cls}">${n}</div>
          <div>
            <div class="label">${label}</div>
            <div class="value">${planet(n)} · ${td(DATA.numbers[n].keyword)}</div>
            <div class="steps">${stepsArr}</div>
          </div>
        </div>
        ${extra || ''}
      </div>`;

    const bnHtml = numCard(p.bn, '', t('p.bn'), `${t('p.day')} ${steps(p.bnSteps)}`,
      `<div class="divider"></div><div class="small muted" style="margin-bottom:6px">${t('p.friendlyBN')}</div><div class="chips">${p.friendsBN.map(x => `<span class="digit-chip good">${x}</span>`).join('')}</div><p class="small" style="margin:10px 0 0"><a href="numbers/birth-number-${p.bn}">${t('p.readMore', { n: p.bn })} →</a></p>`);
    const dnHtml = numCard(p.dn, 'violet', t('p.dn'), `${p.day}/${p.month}/${p.year} → ${steps(p.dnSteps)}`,
      `<div class="divider"></div><div class="small muted" style="margin-bottom:6px">${t('p.friendlyDN')}</div><div class="chips">${p.friendsDN.map(x => `<span class="digit-chip good">${x}</span>`).join('')}</div>`);

    const gridOrder = [4, 9, 2, 3, 5, 7, 8, 1, 6];
    const loshu = `<div class="card">
      <div class="card-title"><h3>${t('p.loshu')}</h3><span class="chip">${t('p.missingCount', { n: p.missing.length })}</span></div>
      <div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">
        <div class="loshu">${gridOrder.map(n => { const c = p.grid[n]; return `<div class="cell ${c ? 'filled' : 'empty'}" data-n="${n}">${c ? String(n).repeat(c) : '·'}</div>`; }).join('')}</div>
        <div style="flex:1;min-width:160px">
          <div class="small muted">${t('p.missing')}</div>
          <div class="chips" style="margin:6px 0 12px">${p.missing.map(x => `<span class="digit-chip missing">${x}</span>`).join('') || `<span class="muted">${t('p.noneMissing')}</span>`}</div>
          <div class="small muted">${t('p.balancer')}</div>
          <div class="chips" style="margin:6px 0 12px">${p.balancers.map(x => `<span class="digit-chip good">${x}</span>`).join('') || `<span class="muted">${t('p.none')}</span>`}</div>
          <div class="small muted">${t('p.avoid')}</div>
          <div class="chips" style="margin-top:6px">${p.enemies.map(x => `<span class="digit-chip bad">${x}</span>`).join('') || `<span class="muted">${t('p.none')}</span>`}</div>
        </div>
      </div>
    </div>`;

    let nameHtml = '';
    if (p.name) {
      const c = Numerology.chaldean(p.name);
      nameHtml = `<div class="card" style="grid-column:1/-1">
        <div class="card-title"><h3>${t('p.nameNumber')} — ${esc(p.name)}</h3>
          <div class="chips">${relChip(Numerology.relation(p.bn, c.single), t('p.withBN'))} ${relChip(Numerology.relation(p.dn, c.single), t('p.withDN'))}</div></div>
        <div class="letters">${c.letters.map(l => `<div class="l"><b>${esc(l.ch)}</b><span>${l.v || ''}</span></div>`).join('')}</div>
        <div><b>${t('p.total')}</b> ${steps(c.steps)} · <span class="muted">${planet(c.single)} — ${td(DATA.numbers[c.single].keyword)}</span></div>
      </div>`;
    }
    $('#profileCards').innerHTML = bnHtml + dnHtml + loshu + nameHtml;
  }

  /* ---------- mobile ---------- */
  function renderMobile(raw, target, full) {
    const p = profile;
    if (!raw || !raw.replace(/\D/g, '').length) {
      target.innerHTML = `<div class="card"><p class="muted" style="margin:0">${t('m.noNumber')} <a href="#tools">${t('m.quickChecker')}</a>.</p>
        ${full ? renderIdeal() : ''}</div>`;
      return;
    }
    const r = Numerology.analyzeMobile(raw, p);
    if (r.error) { target.innerHTML = `<div class="card"><span class="chip bad">${t('m.error10')}</span></div>`; return; }

    const ringColor = r.score >= 80 ? 'var(--good)' : r.score >= 65 ? 'var(--accent-3)' : r.score >= 50 ? 'var(--warn)' : 'var(--bad)';
    const positions = r.positions.map(x => {
      const hasBad = x.hits.some(h => h.type === 'bad'), hasGood = x.hits.some(h => h.type === 'good');
      const cls = hasBad && hasGood ? 'mixed' : hasBad ? 'bad' : hasGood ? 'good' : '';
      const tip = x.hits.map(h => (h.type === 'bad' ? '⚠ ' : '✓ ') + td(h.text)).join('\n') || t('m.noRule');
      return `<div class="pos ${cls}" title="${esc(tip)}"><div class="p">P${x.pos}</div><div class="d">${x.digit}</div><div class="t">${td(x.meaning.title)}</div></div>`;
    }).join('');

    // "6th" in English; Indic languages take a suffix on the numeral
    const ordinal = n => ({ en: n + (['th', 'st', 'nd', 'rd'][(n % 100 - 20) % 10] || ['th', 'st', 'nd', 'rd'][n % 100] || 'th'), hi: n + 'वाँ', mr: n + ' वा', gu: n + 'મો', ta: n + '-ஆவது' })[I18N.lang] || String(n);
    const findings = (list, cls) => list.length ? list.map(f => `<div class="finding ${cls}"><span class="tag">${f.pos ? t('m.pos') + ' ' + f.pos + ' · ' + f.digit : t('m.overall')}</span><div class="txt">${ftext(f)}${f.pos ? `<small>${t('m.where', { ord: ordinal(f.pos), digit: f.digit, title: td(DATA.positions[f.pos].title) })}</small>` : ''}</div></div>`).join('') : `<p class="muted small">${t('m.none')}</p>`;

    const compat = p && r.compat ? `
      <div class="kv">
        <dt>${t('m.total')}</dt><dd><b>${steps(r.totalSteps)}</b> &nbsp;<span class="muted">(${planet(r.total)})</span></dd>
        <dt>${t('m.withBN', { n: p.bn })}</dt><dd>${relChip(r.compat.rBN)}</dd>
        <dt>${t('m.withDN', { n: p.dn })}</dt><dd>${relChip(r.compat.rDN)}</dd>
        <dt>${t('m.balancerTotal')}</dt><dd>${r.compat.balancer ? `<span class="chip good">${t('m.yesBoth')}</span>` : `<span class="chip neutral">${t('m.no')}</span>`}</dd>
      </div>` : `<div class="kv"><dt>${t('m.total')}</dt><dd><b>${steps(r.totalSteps)}</b></dd></div>`;

    target.innerHTML = `
      <div class="grid ${full ? 'mobile-layout' : ''}">
        <div class="card">
          <div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap">
            <div class="score-ring" style="--p:${r.score};--ring:${ringColor}"><div class="inner"><b>${r.score}</b><span>/ 100</span></div></div>
            <div>
              <div class="label muted small" style="text-transform:uppercase;letter-spacing:.06em">${t('m.verdict')}</div>
              <div style="font-size:1.4rem;font-weight:700;color:${ringColor}">${grade(r.grade)}</div>
              <div class="muted small">${r.bad.length} ${r.bad.length === 1 ? t('m.warning') : t('m.warningsN')} · ${r.good.length} ${r.good.length === 1 ? t('m.strength') : t('m.strengthsN')}</div>
            </div>
          </div>
          <div class="divider"></div>
          ${compat}
          ${full ? `<div class="share-row"><button class="btn sm" data-share="${r.score}|${r.grade}">${ico('share')}${t('share.btn')}</button><button class="btn secondary sm" data-copy-summary="${r.score}|${r.grade}">${t('share.copy')}</button></div>` : ''}
        </div>
        <div class="card">
          <div class="card-title"><h3>${r.str.replace(/(\d{5})(\d{5})/, '$1 $2')}</h3><span class="muted small">${t('m.hover')}</span></div>
          <div class="positions">${positions}</div>
          <div class="divider"></div>
          <div class="grid grid-2">
            <div><h4 class="findings-h" style="color:var(--bad)">${ico('alert')}${t('m.warnings')}</h4>${findings(r.bad, 'bad')}</div>
            <div><h4 class="findings-h" style="color:var(--good)">${ico('check-circle')}${t('m.strengths')}</h4>${findings(r.good, 'good')}</div>
          </div>
        </div>
      </div>
      ${full ? `<div class="card" style="margin-top:18px">${renderIdeal()}</div>` : ''}`;
  }

  function renderIdeal() {
    const ideal = Numerology.idealDigitsByPosition(profile);
    return `<div class="card-title"><h3>${t('m.ideal.h')}</h3><span class="muted small">${t('m.ideal.legend')}</span></div>
      <table class="ideal-table"><thead><tr><th>${t('m.ideal.pos')}</th><th>${t('m.ideal.governs')}</th><th>${t('m.ideal.best')}</th><th>${t('m.ideal.safe')}</th></tr></thead><tbody>
      ${Object.entries(ideal).map(([pos, v]) => `<tr><td><b>${pos}</b></td><td>${td(DATA.positions[pos].title)}</td>
        <td><div class="chips">${v.good.map(d => `<span class="digit-chip good">${d}</span>`).join('') || '<span class="muted">—</span>'}</div></td>
        <td><div class="chips">${v.safe.map(d => `<span class="digit-chip neutral">${d}</span>`).join('') || '<span class="muted">—</span>'}</div></td></tr>`).join('')}
      </tbody></table>
      <p class="small muted" style="margin:12px 0 0">${t('m.ideal.tip')}</p>`;
  }

  /* ---------- PIN ---------- */
  function pinCard(x) {
    const c = x.check;
    const cls = c.verdict === 'Avoid' ? 'bad' : c.verdict === 'Average' ? 'warn' : 'good';
    return `<div class="pin-card">
      <div><div class="pin">${x.pin}</div><div class="meta">${t('pin.total')} ${steps(c.steps)} · ${x.purpose ? td(x.purpose) + ' · ' : ''}${c.missingUsed.length ? t('pin.usesMissing', { list: c.missingUsed.join(',') }) : t('pin.noMissing')}</div></div>
      <div style="text-align:right"><span class="chip ${cls}">${grade(c.verdict)}</span><br/><button class="btn secondary sm" style="margin-top:6px" onclick="__copy('${x.pin}')">${t('pin.copy')}</button></div>
    </div>`;
  }

  function renderPin() {
    const p = profile;
    const gen = Numerology.generatePins(p, 8).map(x => ({ ...x, check: Numerology.checkPin(x.pin, p) }));
    const purposeList = Numerology.purposePins(currentPurpose, p);
    const purposeLabel = td(DATA.purposes.find(x => x.id === currentPurpose).label);
    const none = t('p.none');

    $('#pinResult').innerHTML = `
      <div class="card">
        <div class="card-title"><h3>${t('pin.generated')}</h3><span class="chip">${t('pin.balancerTotals', { list: p.balancers.join(', ') || '—' })}</span></div>
        <p class="small muted">${t('pin.genDesc', { missing: p.missing.join(', ') || none, enemies: p.enemies.join(', ') || none, bn: p.bn, dn: p.dn })}</p>
        <div style="display:grid;gap:8px">${gen.map(pinCard).join('') || `<p class="muted">${t('pin.noPin')}</p>`}</div>
      </div>
      <div class="card">
        <div class="card-title"><h3>${t('pin.byPurpose')}</h3>
          <select id="pinPurpose" style="width:auto">${DATA.purposes.map(x => `<option value="${x.id}" ${x.id === currentPurpose ? 'selected' : ''}>${td(x.label)}</option>`).join('')}</select></div>
        <p class="small muted">${t('pin.purposeDesc', { purpose: purposeLabel })}</p>
        <div style="display:grid;gap:8px">${purposeList.map(pinCard).join('')}</div>
        <div class="divider"></div>
        <ul class="list small muted">${DATA.pinRules.map(r => `<li>${td(r)}</li>`).join('')}</ul>
      </div>`;
    $('#pinPurpose').onchange = e => { currentPurpose = e.target.value; renderPin(); renderPassword(); };
  }

  /* ---------- password ---------- */
  function renderPassword() {
    const p = profile;
    const list = Numerology.purposePasswords(currentPurpose, p);
    const purposeLabel = td(DATA.purposes.find(x => x.id === currentPurpose).label);
    $('#passwordResult').innerHTML = `
      <div class="card">
        <div class="card-title"><h3>${t('pw.check')}</h3></div>
        <input id="pwInput" type="text" placeholder="${t('pw.ph')}" maxlength="16" />
        <div id="pwOut" style="margin-top:12px"><p class="muted small">${t('pw.typeHint')}</p></div>
        <div class="divider"></div>
        <ul class="list small muted">${DATA.passwordRules.map(r => `<li>${td(r)}</li>`).join('')}</ul>
      </div>
      <div class="card">
        <div class="card-title"><h3>${t('pw.suggested', { purpose: purposeLabel })}</h3></div>
        <div style="display:grid;gap:10px">
        ${list.map(x => `<div class="finding ${x.avoid8 ? 'bad' : x.rel === 'enemy' ? 'bad' : 'good'}">
            <span class="tag">${t('pin.total')} ${x.total}</span>
            <div class="txt"><b>${td(x.purpose)}</b>
              <div class="chips" style="margin:6px 0">${x.examples.map(w => `<span class="chip" style="cursor:pointer" onclick="__copy('${w}')">${w} <small class="muted">${Numerology.chaldean(w).total}</small></span>`).join('')}</div>
              <small>${x.avoid8 ? t('pw.avoid8') : t('pw.fit', { t: x.total, rel: t('rel.' + x.rel), relDN: t('rel.' + x.relDN) })}</small>
            </div></div>`).join('')}
        </div>
        <div class="divider"></div>
        <div class="small muted">${t('pw.allTotals')}</div>
        <div class="chips" style="margin-top:6px">${Object.entries(DATA.passwords).map(([tt, v]) => `<span class="chip" title="${esc(td(v.purpose))}">${tt} · ${td(v.purpose).split(',')[0]}</span>`).join('')}</div>
      </div>`;
    $('#pwInput').addEventListener('input', e => $('#pwOut').innerHTML = passwordReport(e.target.value, p));
  }

  function passwordReport(word, p) {
    if (!word.trim()) return `<p class="muted small">${t('pw.typeHint')}</p>`;
    const c = Numerology.chaldean(word);
    const meaning = DATA.passwords[c.single];
    const avoid8 = c.single === 8 && p && (p.bn === 8 || p.dn === 8);
    const len = word.replace(/\s/g, '').length;
    return `<div class="letters">${c.letters.map(l => `<div class="l"><b>${esc(l.ch)}</b><span>${l.v || ''}</span></div>`).join('')}</div>
      <div><b>${t('p.total')}</b> ${steps(c.steps)} · <span class="muted">${meaning ? td(meaning.purpose) : ''}</span></div>
      <div class="chips" style="margin-top:8px">
        ${p ? relChip(Numerology.relation(p.bn, c.single), 'BN ' + p.bn) + relChip(Numerology.relation(p.dn, c.single), 'DN ' + p.dn) : ''}
        ${avoid8 ? `<span class="chip bad">${t('pw.avoid8chip')}</span>` : ''}
        ${len < 4 || len > 16 ? `<span class="chip warn">${t('pw.lengthBad')}</span>` : `<span class="chip good">${t('pw.lengthOk')}</span>`}
      </div>`;
  }

  /* ---------- wallpaper ---------- */
  function renderWallpaper() {
    const p = profile;
    const card = (n, label) => { const w = DATA.wallpapers[n]; return `<div class="card">
      <div class="card-title"><div class="stat"><div class="num-badge ${label === 'DN' ? 'violet' : ''}" style="width:48px;height:48px;font-size:1.4rem;border-radius:14px">${n}</div><div><div class="label">${t(label === 'BN' ? 'r.bnLabel' : 'r.dnLabel')}</div><div class="value">${planet(n)}</div></div></div>
        <div class="swatches">${w.palette.map((c, i) => `<div class="swatch" style="background:${c}" title="${td(w.colors[i] || '')}"></div>`).join('')}</div></div>
      <ul class="list">${w.items.map(i => `<li>${td(i)}</li>`).join('')}<li>${t('w.solid', { colors: w.colors.map(td).join(' / ') })}</li></ul></div>`; };
    $('#wallpaperResult').innerHTML = card(p.bn, 'BN') + (p.dn !== p.bn ? card(p.dn, 'DN') : `<div class="card"><p class="muted" style="margin:0">${t('w.same', { n: p.bn })}</p></div>`);
  }

  /* ---------- covers ---------- */
  function renderCovers() {
    const p = profile;
    const list = Numerology.recommendCovers(p);
    $('#coverResult').innerHTML = list.map(c => `<div class="card cover-card">
      ${c.matchBN ? `<span class="chip good match">${ico('check')}${t('c.matchesBN', { n: p.bn })}</span>` : c.matchDN ? `<span class="chip warn match">${t('c.matchesDN', { n: p.dn })}</span>` : ''}
      <div class="icon">${ico(c.icon)}</div>
      <h3 style="margin-top:6px">${td(c.name)}</h3>
      <div class="chips" style="margin-bottom:10px">${c.bestFor.map(n => `<span class="digit-chip ${n === p.bn ? 'good' : n === p.dn ? 'missing' : 'neutral'}">${n}</span>`).join('')}</div>
      <ul class="list traits">${c.traits.map(x => `<li>${td(x)}</li>`).join('')}</ul>
      <div class="divider"></div>
      <div class="small"><b>${t('c.idealFor')}</b> ${td(c.idealFor)}${c.tip ? `<br/><b>${t('c.tip')}</b> ${td(c.tip)}` : ''}</div>
    </div>`).join('');
  }

  /* ---------- colours ---------- */
  function renderColors() {
    const p = profile;
    const list = Numerology.recommendColors(p);
    $('#colorResult').innerHTML = list.map(c => `<div class="card color-card">
      <div class="dot" style="background:${c.hex}"></div>
      <div style="flex:1">
        <div class="card-title" style="margin-bottom:4px"><h3>${td(c.name)}</h3>
          <span class="chip ${c.status === 'good' ? 'good' : c.status === 'avoid' ? 'bad' : 'neutral'}">${t('col.' + c.status)}</span></div>
        <div class="small muted">${t('col.energy', { nums: c.numbers.join(' / '), planets: c.numbers.map(planet).join(' / ') })}</div>
        <ul>${c.traits.map(x => `<li>${td(x)}</li>`).join('')}</ul>
      </div></div>`).join('');
  }

  /* ---------- affirmation ---------- */
  function renderAffirmation() {
    const p = profile;
    const card = (n, label) => { const a = DATA.affirmations[n]; return `<div class="card">
      <div class="card-title"><div class="stat"><div class="num-badge ${label === 'DN' ? 'violet' : 'teal'}" style="width:48px;height:48px;font-size:1.4rem;border-radius:14px">${n}</div><div><div class="label">${t(label === 'BN' ? 'r.bnLabel' : 'r.dnLabel')}</div><div class="value">${planet(n)}</div></div></div></div>
      <p class="small muted">${td(a.intro)}</p>
      ${a.lines.map(l => `<div class="quote">“${td(l)}”</div>`).join('')}
      <div class="divider"></div>
      <div class="kv"><dt>${t('a.ringtone')}</dt><dd>${a.ringtones.map(td).join(' · ')}</dd><dt>${t('a.mantra')}</dt><dd><span class="mantra">${td(a.mantra)}</span></dd></div>
    </div>`; };
    $('#affirmationResult').innerHTML = card(p.bn, 'BN') + (p.dn !== p.bn ? card(p.dn, 'DN') : '');
  }

  /* ---------- share ---------- */
  const shareText = (score, gradeKey) => t('share.text', { score, grade: grade(gradeKey), url: (window.SITE_CONFIG && SITE_CONFIG.url) || location.origin + location.pathname });
  document.addEventListener('click', async e => {
    const sh = e.target.closest('[data-share]'), cp = e.target.closest('[data-copy-summary]');
    if (sh) { const [score, g] = sh.dataset.share.split('|'); const text = shareText(score, g);
      if (navigator.share) { try { await navigator.share({ text }); } catch {} } else window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
      if (window.trackEvent) trackEvent('score_shared', {}); }
    if (cp) { const [score, g] = cp.dataset.copySummary.split('|'); navigator.clipboard?.writeText(shareText(score, g)).then(() => toast(t('share.copied'))); }
  });

  /* ---------- lucky numbers ---------- */
  function renderLucky() {
    const p = profile;
    const groups = Numerology.generateNumbers(p);
    const fmt = n => n.replace(/(\d{5})(\d{5})/, '$1 $2');
    $('#luckyResult').innerHTML = groups.map(g => `<div class="card" style="margin-bottom:14px">
        <div class="card-title"><h3>${t('lucky.' + g.id)}</h3><a class="small" href="#buy">${t('lucky.search')} →</a></div>
        <div class="lucky-grid">${g.numbers.map(n => `<div class="lucky-card">
          <div><div class="num">${fmt(n.str)}</div><div class="meta">${n.score}/100 · ${t('pin.total')} ${n.total}${n.balancer ? ' · ' + t('lucky.balancer') : ''}</div></div>
          <div class="actions"><button class="btn secondary" onclick="__copy('${n.str}')">${t('lucky.copy')}</button><button class="btn secondary" data-analyse="${n.str}">${t('lucky.analyse')}</button><button class="btn secondary" data-share-num="${n.str}|${n.score}">${t('lucky.share')}</button></div>
        </div>`).join('')}</div>
      </div>`).join('') + `<p class="small muted">${t('lucky.note')}</p>`;
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-analyse]'); if (a) { $('#toolMobile').value = a.dataset.analyse; $('#toolMobileBtn').click(); $('#tools').scrollIntoView({ behavior: 'smooth' }); }
    const sn = e.target.closest('[data-share-num]'); if (sn) { const [num, score] = sn.dataset.shareNum.split('|'); const text = `${num} — ${score}/100 · ${(window.SITE_CONFIG && SITE_CONFIG.url) || location.origin}`; if (navigator.share) navigator.share({ text }).catch(() => {}); else window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener'); }
  });

  /* ---------- compare ---------- */
  function renderCompare() {
    [1, 2, 3].forEach(i => { $('#cmp' + i).placeholder = t('cmp.ph', { n: i }); });
    if ($('#cmpOut').innerHTML) runCompare();
  }
  function runCompare() {
    const vals = [1, 2, 3].map(i => $('#cmp' + i).value.trim()).filter(v => v.replace(/\D/g, '').length >= 10);
    if (vals.length < 2) { $('#cmpOut').innerHTML = `<span class="chip warn">${t('cmp.none')}</span>`; return; }
    const rows = Numerology.compareNumbers(vals, profile);
    $('#cmpOut').innerHTML = `<div style="overflow:auto"><table class="cmp-table"><thead><tr><th>${t('cmp.number')}</th><th>${t('m.score')}</th><th>${t('m.verdict')}</th><th>${t('pin.total')}</th><th>BN ${profile.bn}</th><th>DN ${profile.dn}</th><th>${t('cmp.warnings')}</th><th>${t('cmp.strengths')}</th></tr></thead><tbody>
      ${rows.map(x => `<tr class="${x.best ? 'best' : ''}"><td><span class="num">${x.res.str.replace(/(\d{5})(\d{5})/, '$1 $2')}</span>${x.best ? ` <span class="chip good">${t('cmp.best')}</span>` : ''}</td><td><b>${x.res.score}</b></td><td>${grade(x.res.grade)}</td><td>${steps(x.res.totalSteps)}</td><td>${relChip(x.res.compat.rBN)}</td><td>${relChip(x.res.compat.rDN)}</td><td>${x.res.bad.length}</td><td>${x.res.good.length}</td></tr>`).join('')}
    </tbody></table></div>`;
  }
  $('#cmpBtn').onclick = () => profile && runCompare();

  /* ---------- report ---------- */
  function reportOpts() { return { mobile: $('#mobile').value, purpose: currentPurpose }; }
  function renderReport() {
    $('#reportTitle').textContent = `${t('report.title')}${profile.name ? ' — ' + profile.name : ''}`;
    $('#reportStatus').textContent = t('report.file', { file: Report.filename(profile) });
  }
  $('#downloadPdf').onclick = async e => {
    if (!profile) return;
    const b = e.currentTarget; b.disabled = true; const label = b.textContent; b.textContent = t('report.generating');
    $('#reportStatus').textContent = t('report.building');
    try { await Report.download(profile, reportOpts()); $('#reportStatus').textContent = t('report.done'); toast(t('report.toastDone')); if (window.trackEvent) trackEvent('pdf_downloaded', { lang: I18N.lang }); }
    catch (err) { console.error(err); $('#reportStatus').textContent = t('report.fail'); toast(t('report.toastFail')); }
    finally { b.disabled = false; b.textContent = label; }
  };
  $('#printPdf').onclick = () => profile && Report.print(profile, reportOpts());
  $('#previewReport').onclick = () => profile && Report.preview(profile, reportOpts());

  /* ---------- quick tools ---------- */
  function refreshTools() {
    if ($('#toolWord').value) $('#toolWordOut').innerHTML = passwordReport($('#toolWord').value, profile);
    if ($('#toolMobileOut').innerHTML) $('#toolMobileBtn').click();
    if ($('#toolPinOut').innerHTML) $('#toolPinBtn').click();
  }
  $('#toolWord').addEventListener('input', e => $('#toolWordOut').innerHTML = passwordReport(e.target.value, profile));
  $('#toolMobileBtn').onclick = () => {
    const v = $('#toolMobile').value;
    if (!v.trim()) return;
    if (!profile) { const r = Numerology.analyzeMobile(v, null); if (r.error) { $('#toolMobileOut').innerHTML = `<span class="chip bad">${t('m.error10')}</span>`; return; }
      const row = (f, cls) => `<div class="finding ${cls}"><span class="tag">${f.pos ? t('m.pos') + ' ' + f.pos : t('m.all')}</span><div class="txt">${ftext(f)}</div></div>`;
      $('#toolMobileOut').innerHTML = `<div class="kv"><dt>${t('m.score')}</dt><dd><b>${r.score}</b> — ${grade(r.grade)}</dd><dt>${t('p.total')}</dt><dd>${steps(r.totalSteps)}</dd></div>
        <div style="margin-top:10px">${r.bad.map(f => row(f, 'bad')).join('')}${r.good.map(f => row(f, 'good')).join('')}</div>
        <p class="small muted">${t('tools.genHint')}</p>`; return; }
    renderMobile(v, $('#toolMobileOut'), false);
  };
  $('#toolPinBtn').onclick = () => {
    if (!$('#toolPin').value.trim()) return;
    if (!profile) { $('#toolPinOut').innerHTML = `<span class="chip warn">${t('tools.needProfile')}</span>`; return; }
    const c = Numerology.checkPin($('#toolPin').value, profile);
    if (c.error) { $('#toolPinOut').innerHTML = `<span class="chip bad">${t('pin.error')}</span>`; return; }
    $('#toolPinOut').innerHTML = `<div class="kv"><dt>${t('p.total')}</dt><dd>${steps(c.steps)}</dd><dt>BN ${profile.bn}</dt><dd>${relChip(c.rBN)}</dd><dt>DN ${profile.dn}</dt><dd>${relChip(c.rDN)}</dd>
      <dt>${t('pin.missingUsed')}</dt><dd>${c.missingUsed.join(', ') || '—'}</dd><dt>${t('pin.enemyDigits')}</dt><dd>${c.enemiesUsed.join(', ') || '—'}</dd></div>
      <div class="progress" style="margin:10px 0 6px"><i style="width:${c.score}%"></i></div>
      <span class="chip ${c.verdict === 'Avoid' ? 'bad' : c.verdict === 'Average' ? 'warn' : 'good'}">${grade(c.verdict)} · ${c.score}/100</span>`;
  };

  /* ---------- nav highlight ---------- */
  const links = [...document.querySelectorAll('.nav-links a')];
  const obs = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id)); }), { rootMargin: '-40% 0px -55% 0px' });
  document.querySelectorAll('section[id]').forEach(s => obs.observe(s));
})();
