/* =====================================================================
   Standalone calculator pages (tools/*.html). One script, dispatched by
   <body data-tool="…">. English-only pages; reuses the shared engine.
   ===================================================================== */
(() => {
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const steps = a => a.length > 1 ? a.join(' → ') : String(a[0]);
  const chip = (txt, cls) => `<span class="chip ${cls || ''}">${txt}</span>`;
  const rel = r => chip(r, r === 'friendly' ? 'good' : r === 'enemy' ? 'bad' : 'neutral');
  const digits = (arr, cls) => '<span class="chips" style="display:inline-flex">' + (arr.map(n => `<span class="digit-chip ${cls}">${n}</span>`).join('') || '<span class="muted">—</span>') + '</span>';
  const N = DATA.numbers;
  const badge = (n, cls) => `<div class="num-badge ${cls || ''}">${n}</div>`;
  const dobOk = v => { const d = v ? new Date(v + 'T00:00:00') : null; return d && !isNaN(d) && d <= new Date() && d.getFullYear() >= 1900; };
  const home = '../';
  const tool = document.body.dataset.tool;
  const out = $('#toolOut');
  const cta = `<div class="callout cta" style="margin-top:18px"><h3>Want the full picture?</h3><p>The free analyser combines your Birth and Destiny numbers with your actual mobile number and gives you a lucky PIN, password, wallpaper, cover and a PDF report.</p><p><a class="btn" href="${home}#mainForm">${ico('sparkles')} Analyse my numbers</a></p></div>`;
  const show = html => { out.innerHTML = html; out.classList.remove('hidden'); out.scrollIntoView({ behavior: 'smooth', block: 'start' }); if (window.trackEvent) trackEvent('tool_used', { tool }); };

  /* ---------- Life Path ---------- */
  if (tool === 'life-path') {
    $('#f').addEventListener('submit', e => {
      e.preventDefault(); const v = $('#dob').value;
      if (!dobOk(v)) { out.innerHTML = chip('Enter a valid date of birth', 'bad'); out.classList.remove('hidden'); return; }
      const r = Numerology.lifePath(v); const m = r.meaning, b = r.birthMeaning;
      show(`
        <div class="grid grid-2">
          <div class="card"><div class="stat">${badge(r.dn, 'violet')}<div><div class="label">Life Path / Destiny number</div><div class="value">${N[r.dn].planet} — ${m.title}</div><div class="steps">${r.day}/${r.month}/${r.year} → ${steps(r.dnSteps)}</div></div></div>
            ${r.master ? `<p class="small" style="margin:12px 0 0"><b>Master number ${r.master}:</b> ${DATA.masterNumbers[r.master]}</p>` : ''}
          </div>
          <div class="card"><div class="stat">${badge(r.bn)}<div><div class="label">Birth number (Mulank)</div><div class="value">${N[r.bn].planet} — ${b.title}</div><div class="steps">Day ${steps(r.bnSteps)}</div></div></div>
            <div class="divider"></div><div class="small muted">Friendly numbers</div><div class="chips" style="margin-top:6px">${digits(r.friendsDN, 'good')}</div></div>
        </div>
        <div class="card" style="margin-top:18px"><h3>Life Path ${r.dn} — ${m.title}</h3><p>${m.traits}</p>
          <div class="grid grid-3"><div><h4 style="color:var(--good)">Strengths</h4><ul class="list small">${m.strengths.map(x => `<li>${x}</li>`).join('')}</ul></div>
          <div><h4 style="color:var(--warn)">Challenges</h4><ul class="list small">${m.challenges.map(x => `<li>${x}</li>`).join('')}</ul></div>
          <div><h4>Careers</h4><p class="small">${m.careers}</p><h4>Relationships</h4><p class="small">${m.relationships}</p></div></div>
          <div class="divider"></div>
          <div class="kv"><dt>Lucky colours</dt><dd>${DATA.wallpapers[r.dn].colors.join(' / ')}</dd><dt>Wallpaper</dt><dd>${DATA.wallpapers[r.dn].items.slice(0, 2).join(' · ')}</dd><dt>Mantra</dt><dd><span class="mantra">${DATA.affirmations[r.dn].mantra}</span></dd></div>
          <p class="small" style="margin-top:12px"><a href="../numbers/birth-number-${r.bn}">Full guide for Birth number ${r.bn} →</a></p></div>${cta}`);
    });
  }

  /* ---------- Name numerology ---------- */
  if (tool === 'name') {
    const run = () => {
      const name = $('#name').value.trim(); if (!name) return;
      const sys = $('#system').value; const dob = $('#dob').value;
      const c = sys === 'pythagorean' ? Numerology.pythagorean(name) : Numerology.chaldean(name);
      const first = name.split(/\s+/)[0]; const cf = sys === 'pythagorean' ? Numerology.pythagorean(first) : Numerology.chaldean(first);
      const p = dobOk(dob) ? Numerology.profileFromDOB(dob) : null;
      const purpose = DATA.passwords[c.single];
      show(`
        <div class="card"><div class="card-title"><h3>${esc(name)}</h3>${chip(sys === 'pythagorean' ? 'Pythagorean' : 'Chaldean', '')}</div>
          <div class="letters">${c.letters.map(l => `<div class="l"><b>${esc(l.ch)}</b><span>${l.v || ''}</span></div>`).join('')}</div>
          <div class="grid grid-2">
            <div><div class="stat">${badge(c.single)}<div><div class="label">Full name number</div><div class="value">${N[c.single].planet} — ${DATA.lifePath[c.single].title}</div><div class="steps">${steps(c.steps)}</div></div></div></div>
            <div><div class="stat">${badge(cf.single, 'teal')}<div><div class="label">First name number</div><div class="value">${N[cf.single].planet}</div><div class="steps">${esc(first)} → ${steps(cf.steps)}</div></div></div></div>
          </div>
          <div class="divider"></div>
          <p><b>${N[c.single].keyword}.</b> ${DATA.lifePath[c.single].traits}</p>
          ${purpose ? `<p class="small muted">In the Chaldean purpose table a total of ${c.single} relates to: <b>${purpose.purpose}</b>.</p>` : ''}
          ${p ? `<div class="divider"></div><h4>Compatibility with your date of birth</h4><div class="kv"><dt>Birth number ${p.bn}</dt><dd>${rel(Numerology.relation(p.bn, c.single))}</dd><dt>Destiny number ${p.dn}</dt><dd>${rel(Numerology.relation(p.dn, c.single))}</dd><dt>Balancer numbers</dt><dd>${digits(p.balancers, 'good')}</dd></div>
            <p class="small muted" style="margin-top:8px">${Numerology.relation(p.bn, c.single) === 'enemy' || Numerology.relation(p.dn, c.single) === 'enemy' ? 'Your name number is an enemy of one of your core numbers. Numerologists sometimes suggest a spelling change (adding or removing a letter) to move the total to a friendly number — try variations above.' : 'Your name number is compatible with your core numbers. A total that is friendly to both is ideal.'}</p>` : `<p class="small muted">Add your date of birth to check whether the name number is friendly to your Birth and Destiny numbers.</p>`}
        </div>${cta}`);
    };
    $('#f').addEventListener('submit', e => { e.preventDefault(); run(); });
    $('#system').addEventListener('change', () => { if (!out.classList.contains('hidden')) run(); });
  }

  /* ---------- Compatibility ---------- */
  if (tool === 'compatibility') {
    $('#f').addEventListener('submit', e => {
      e.preventDefault(); const a = $('#dobA').value, b = $('#dobB').value;
      if (!dobOk(a) || !dobOk(b)) { out.innerHTML = chip('Enter two valid dates of birth', 'bad'); out.classList.remove('hidden'); return; }
      const r = Numerology.compatibility(a, b); const nameA = $('#nameA').value.trim() || 'Person A', nameB = $('#nameB').value.trim() || 'Person B';
      const ring = r.score >= 80 ? 'var(--good)' : r.score >= 60 ? 'var(--accent-3)' : r.score >= 40 ? 'var(--warn)' : 'var(--bad)';
      const verdictText = { Excellent: 'Your core numbers support each other — a naturally harmonious pairing.', Good: 'Mostly compatible; one pairing needs a little conscious effort.', Average: 'Mixed signals — some numbers help, some clash. Awareness of the differences goes a long way.', 'Needs change': 'Your core numbers pull in different directions. It does not doom the relationship, but expect to work at understanding each other.' }[r.grade];
      show(`
        <div class="grid mobile-layout">
          <div class="card"><div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap"><div class="score-ring" style="--p:${r.score};--ring:${ring}"><div class="inner"><b>${r.score}</b><span>/ 100</span></div></div><div><div class="label muted small" style="text-transform:uppercase;letter-spacing:.06em">Compatibility</div><div style="font-size:1.4rem;font-weight:700;color:${ring}">${r.grade}</div><div class="muted small">${verdictText}</div></div></div>
            <div class="divider"></div><div class="small muted">Shared balancer numbers (friendly to both of you)</div><div class="chips" style="margin-top:6px">${digits(r.shared, 'good')}</div>
            ${r.shared.length ? `<p class="small muted" style="margin-top:8px">A shared mobile number, PIN or house number that totals ${r.shared.join(' or ')} supports you both.</p>` : ''}</div>
          <div class="card">
            <div class="grid grid-2"><div><b>${esc(nameA)}</b><div class="chips" style="margin-top:6px">${chip('BN ' + r.a.bn + ' · ' + N[r.a.bn].planet)} ${chip('DN ' + r.a.dn + ' · ' + N[r.a.dn].planet)}</div></div><div><b>${esc(nameB)}</b><div class="chips" style="margin-top:6px">${chip('BN ' + r.b.bn + ' · ' + N[r.b.bn].planet)} ${chip('DN ' + r.b.dn + ' · ' + N[r.b.dn].planet)}</div></div></div>
            <div class="divider"></div>
            <table class="cmp-table"><thead><tr><th>Pairing</th><th>Numbers</th><th>A → B</th><th>B → A</th><th>Weight</th></tr></thead><tbody>
            ${r.parts.map(p => `<tr><td>${p.label.replace("A's", esc(nameA) + "'s").replace("B's", esc(nameB) + "'s")}</td><td><b>${p.a}</b> ↔ <b>${p.b}</b></td><td>${rel(p.rAB)}</td><td>${rel(p.rBA)}</td><td>${p.weight}%</td></tr>`).join('')}</tbody></table>
            <p class="small muted" style="margin-top:10px">Read from the friendly/enemy chart: friendly = full marks, neutral = half, enemy = none. The Birth-number pairing (temperament) counts most; Destiny (life direction) next.</p>
          </div>
        </div>
        <div class="card" style="margin-top:18px"><h3>How to use this</h3><ul class="list">
          <li><b>${esc(nameA)}</b> (${DATA.lifePath[r.a.bn].title}): ${DATA.lifePath[r.a.bn].relationships}</li>
          <li><b>${esc(nameB)}</b> (${DATA.lifePath[r.b.bn].title}): ${DATA.lifePath[r.b.bn].relationships}</li>
          <li>Wallpaper for a couple: a couple's picture (number 2) or family photo (number 6). Recommended PINs for a good married life: 5666, 5667, 2577.</li></ul>
          <p class="small"><a href="../blog/mobile-number-for-marriage-and-relationships">Which mobile number digits support marriage →</a></p></div>${cta}`);
    });
  }

  /* ---------- Personal year ---------- */
  if (tool === 'personal-year') {
    const today = new Date().toISOString().slice(0, 10); $('#on').value = today;
    $('#f').addEventListener('submit', e => {
      e.preventDefault(); const v = $('#dob').value, on = $('#on').value || today;
      if (!dobOk(v)) { out.innerHTML = chip('Enter a valid date of birth', 'bad'); out.classList.remove('hidden'); return; }
      const r = Numerology.personalCycle(v, on); const m = r.meaning;
      const cycle = [1,2,3,4,5,6,7,8,9].map(n => `<div class="pos ${n === r.personalYear ? 'good' : ''}" title="${esc(DATA.personalYear[n].theme)}"><div class="p">Yr</div><div class="d">${n}</div><div class="t">${DATA.personalYear[n].theme.split(' ')[0]}</div></div>`).join('');
      show(`
        <div class="grid grid-3">
          <div class="card"><div class="stat">${badge(r.personalYear, 'violet')}<div><div class="label">Personal Year</div><div class="value">${m.theme}</div><div class="steps">${steps(r.pySteps)} · ${r.cycleStart.split('-').reverse().join('/')} → ${r.cycleEnd.split('-').reverse().join('/')}</div></div></div></div>
          <div class="card"><div class="stat">${badge(r.personalMonth, 'teal')}<div><div class="label">Personal Month</div><div class="value">${DATA.personalYear[r.personalMonth].theme}</div></div></div></div>
          <div class="card"><div class="stat">${badge(r.personalDay)}<div><div class="label">Personal Day (${on.split('-').reverse().join('/')})</div><div class="value">${DATA.personalYear[r.personalDay].theme}</div></div></div></div>
        </div>
        <div class="card" style="margin-top:18px"><h3>Personal Year ${r.personalYear}: ${m.theme}</h3><p>${m.text}</p>
          <div class="grid grid-2"><div><h4 style="color:var(--good)">Focus on</h4><ul class="list small">${m.focus.map(x => `<li>${x}</li>`).join('')}</ul></div><div><h4 style="color:var(--warn)">Avoid</h4><ul class="list small">${m.avoid.map(x => `<li>${x}</li>`).join('')}</ul></div></div>
          <div class="divider"></div><div class="small muted" style="margin-bottom:8px">Your nine-year cycle (current year highlighted)</div><div class="positions" style="grid-template-columns:repeat(9,1fr)">${cycle}</div>
          <p class="small muted" style="margin-top:12px"><b>Next year (${r.personalYear === 9 ? 1 : r.personalYear + 1}):</b> ${r.nextYear.theme} — ${r.nextYear.text}</p></div>${cta}`);
    });
  }

  /* ---------- Lo Shu grid ---------- */
  if (tool === 'lo-shu') {
    $('#f').addEventListener('submit', e => {
      e.preventDefault(); const v = $('#dob').value;
      if (!dobOk(v)) { out.innerHTML = chip('Enter a valid date of birth', 'bad'); out.classList.remove('hidden'); return; }
      const p = Numerology.profileFromDOB(v); const planes = Numerology.loShuPlanes(p.grid);
      const order = [4, 9, 2, 3, 5, 7, 8, 1, 6];
      const pins = Numerology.generatePins(p, 4).map(x => ({ ...x, check: Numerology.checkPin(x.pin, p) }));
      show(`
        <div class="grid mobile-layout">
          <div class="card"><h3>Your grid</h3><div class="loshu" style="max-width:300px">${order.map(n => { const c = p.grid[n]; return `<div class="cell ${c ? 'filled' : 'empty'}" data-n="${n}">${c ? String(n).repeat(c) : '·'}</div>`; }).join('')}</div>
            <p class="small muted" style="margin-top:12px">Digits from ${p.day}/${p.month}/${p.year}${p.day > 9 ? ' + Birth number ' + p.bn : ''} + Destiny number ${p.dn}. Zeros are skipped.</p>
            <div class="divider"></div><div class="kv"><dt>Present</dt><dd>${digits([1,2,3,4,5,6,7,8,9].filter(n => p.grid[n] > 0), 'good')}</dd><dt>Missing</dt><dd>${digits(p.missing, 'missing')}</dd><dt>Repeated</dt><dd>${digits(p.repeated, 'neutral')}</dd></div></div>
          <div class="card"><h3>Completed planes</h3>${planes.filter(x => x.complete).length ? planes.filter(x => x.complete).map(x => `<div class="finding good"><span class="tag">${x.cells.join('-')}</span><div class="txt"><b>${x.name}</b><small>${x.text}</small></div></div>`).join('') : '<p class="muted small">No complete plane — your strengths are spread across the grid rather than concentrated in one line.</p>'}
            <h4 style="margin-top:14px">Partial planes (2 of 3)</h4><div class="chips">${planes.filter(x => !x.complete && x.present === 2).map(x => chip(x.name.split(' (')[0], 'neutral')).join('') || '<span class="muted small">—</span>'}</div></div>
        </div>
        <div class="grid grid-2" style="margin-top:18px">
          <div class="card"><h3 style="color:var(--accent-2)">Missing numbers</h3>${p.missing.length ? p.missing.map(n => `<div class="finding"><span class="tag" style="background:rgba(139,123,255,.2);color:var(--accent-2)">${n} · ${N[n].planet}</span><div class="txt">${DATA.loShu.missing[n]}</div></div>`).join('') : '<p class="muted small">None — every energy is present.</p>'}
            <p class="small muted">Add missing numbers through your PIN and password: <a href="../blog/how-to-choose-lucky-pin-code-numerology">how to choose a lucky PIN →</a></p></div>
          <div class="card"><h3>Repeated numbers</h3>${p.repeated.length ? p.repeated.map(n => `<div class="finding good"><span class="tag">${n} ×${p.grid[n]}</span><div class="txt">${DATA.loShu.repeated[n]}</div></div>`).join('') : '<p class="muted small">No repeats.</p>'}
            ${pins.length ? `<div class="divider"></div><div class="small muted" style="margin-bottom:6px">PINs built from your missing numbers (totals friendly to BN ${p.bn} & DN ${p.dn})</div><div class="chips">${pins.map(x => chip(x.pin + ' · ' + x.total, 'good')).join('')}</div>` : ''}</div>
        </div>${cta}`);
    });
  }
})();
