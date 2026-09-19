/* =====================================================================
   NUMEROLOGY ENGINE
   Pure functions — no DOM. Everything the UI shows is computed here.
   ===================================================================== */

const Numerology = (() => {

  /* ---------- basic helpers ---------- */
  const digitsOf = str => String(str).replace(/\D/g, '').split('').map(Number);
  const sum = arr => arr.reduce((a, b) => a + b, 0);

  /** Reduce a number to a single digit, returning every step. e.g. 47 → [47, 11, 2] */
  function reduceSteps(n) {
    const steps = [n];
    while (n > 9) { n = sum(digitsOf(n)); steps.push(n); }
    return steps;
  }
  const reduce = n => reduceSteps(n).pop();

  /* ---------- compatibility ---------- */
  function relation(a, b) {
    const row = DATA.friendly[a];
    if (!row) return 'neutral';
    if (row.friends.includes(b)) return 'friendly';
    if (row.enemies.includes(b)) return 'enemy';
    return 'neutral';
  }

  /** Numbers friendly to BOTH bn and dn = balancer numbers */
  function balancerNumbers(bn, dn) {
    return [1,2,3,4,5,6,7,8,9].filter(n => relation(bn, n) === 'friendly' && relation(dn, n) === 'friendly');
  }
  function combinedEnemies(bn, dn) {
    return [1,2,3,4,5,6,7,8,9].filter(n => relation(bn, n) === 'enemy' || relation(dn, n) === 'enemy');
  }

  /* ---------- DOB → core profile ---------- */
  function profileFromDOB(isoDate) {
    const [y, m, d] = isoDate.split('-').map(Number);
    const bnSteps = reduceSteps(d);
    const allDigits = [...digitsOf(d), ...digitsOf(m), ...digitsOf(y)];
    const dnSteps = reduceSteps(sum(allDigits));
    const bn = bnSteps.pop(), dn = dnSteps.pop();

    // Lo Shu grid: DOB digits + Birth number (if day is 2-digit) + Destiny number
    const gridDigits = [...allDigits.filter(x => x !== 0)];
    if (d > 9) gridDigits.push(bn);
    gridDigits.push(dn);
    const counts = {};
    for (let i = 1; i <= 9; i++) counts[i] = 0;
    gridDigits.forEach(x => counts[x]++);
    const missing = [1,2,3,4,5,6,7,8,9].filter(n => counts[n] === 0);
    const repeated = [1,2,3,4,5,6,7,8,9].filter(n => counts[n] > 1);

    return {
      day: d, month: m, year: y,
      bn, bnSteps: reduceSteps(d),
      dn, dnSteps: reduceSteps(sum(allDigits)),
      dnRaw: sum(allDigits),
      grid: counts, missing, repeated,
      balancers: balancerNumbers(bn, dn),
      enemies: combinedEnemies(bn, dn),
      friendsBN: DATA.friendly[bn].friends,
      friendsDN: DATA.friendly[dn].friends,
    };
  }

  /* ---------- Chaldean name / password value ---------- */
  function chaldean(str) {
    const letters = [];
    let total = 0;
    for (const ch of String(str).toUpperCase()) {
      if (/[A-Z]/.test(ch)) { const v = DATA.chaldean[ch]; letters.push({ ch, v }); total += v; }
      else if (/[0-9]/.test(ch)) { const v = Number(ch); letters.push({ ch, v }); total += v; }
      else if (ch.trim()) letters.push({ ch, v: 0 });
    }
    return { letters, total, steps: reduceSteps(total), single: reduce(total) };
  }

  /* ---------- Mobile number analysis ---------- */
  function analyzeMobile(raw, profile) {
    const all = digitsOf(raw);
    const digits = all.slice(-10);                 // last 10 digits = the subscriber number
    if (digits.length !== 10) return { error: 'Enter a 10-digit mobile number (country code is ignored).' };
    const str = digits.join('');

    let score = 70;                      // base; good rules add, bad rules subtract, compatibility ±
    const findings = [];       // {pos, digit, type, weight, text}
    const positions = digits.map((digit, i) => {
      const pos = i + 1;
      const hits = DATA.digitRules.filter(r => r.digit === digit && r.positions.includes(pos));
      hits.forEach(r => {
        // "avoid 4 anywhere" is capped so it doesn't dominate the score
        findings.push({ pos, digit, type: r.type, weight: r.weight, text: r.text, tags: r.tags });
      });
      return { pos, digit, meaning: DATA.positions[pos], hits };
    });

    // cap the generic "avoid 4" penalty at 3 occurrences
    let fourHits = 0;
    findings.forEach(f => {
      if (f.text.startsWith('Number 4 should be avoided')) { fourHits++; if (fourHits > 3) return; }
      score += f.type === 'good' ? f.weight : -f.weight;
    });

    // whole-number patterns
    DATA.patternRules.forEach(r => {
      if (r.test(str)) { findings.push({ pos: null, digit: null, type: r.type, weight: r.weight, text: r.text, tags: ['pattern'] }); score += r.type === 'good' ? r.weight : -r.weight; }
    });

    // total & compatibility
    const totalRaw = sum(digits);
    const totalSteps = reduceSteps(totalRaw);
    const total = totalSteps[totalSteps.length - 1];
    let compat = null;
    if (profile) {
      const rBN = relation(profile.bn, total), rDN = relation(profile.dn, total);
      const delta = { friendly: 10, neutral: 0, enemy: -15 };
      score += delta[rBN] + delta[rDN];
      compat = { total, rBN, rDN, balancer: rBN === 'friendly' && rDN === 'friendly' };
      // number contains user's enemy digits?
      const enemyDigits = digits.filter(x => x !== 0 && profile.enemies.includes(x));
      if (enemyDigits.length) { findings.push({ pos: null, digit: null, type: 'bad', weight: 3, text: `Contains digits that are enemies of your BN/DN: ${[...new Set(enemyDigits)].join(', ')}`, key: 'm.enemyDigitsIn', vars: { list: [...new Set(enemyDigits)].join(', ') }, tags: ['compat'] }); score -= 3; }
      const balDigits = [...new Set(digits.filter(x => profile.balancers.includes(x)))];
      if (balDigits.length) { findings.push({ pos: null, digit: null, type: 'good', weight: 3, text: `Contains your balancer digits: ${balDigits.join(', ')}`, key: 'm.balancerDigitsIn', vars: { list: balDigits.join(', ') }, tags: ['compat'] }); score += 3; }
    }

    score = Math.max(0, Math.min(100, Math.round(score)));
    const grade = score >= 80 ? 'Excellent' : score >= 65 ? 'Good' : score >= 50 ? 'Average' : 'Needs change';

    return { digits, str, positions, findings, score, grade, totalRaw, totalSteps, total, compat,
             bad: findings.filter(f => f.type === 'bad'), good: findings.filter(f => f.type === 'good') };
  }

  /** Best digits for each position, derived from the 'good' rules and absence of 'bad' rules */
  function idealDigitsByPosition(profile) {
    const out = {};
    for (let pos = 1; pos <= 10; pos++) {
      const good = [], safe = [];
      for (let d = 0; d <= 9; d++) {
        const rules = DATA.digitRules.filter(r => r.digit === d && r.positions.includes(pos));
        const isBad = rules.some(r => r.type === 'bad');
        const isGood = rules.some(r => r.type === 'good');
        const isEnemy = profile && d !== 0 && profile.enemies.includes(d);
        if (isGood && !isBad && !isEnemy) good.push(d);
        else if (!isBad && !isEnemy) safe.push(d);
      }
      out[pos] = { good, safe };
    }
    return out;
  }

  /* ---------- PIN ---------- */
  function checkPin(pin, profile) {
    const digits = digitsOf(pin);
    if (digits.length < 4 || digits.length > 6) return { error: 'PIN should be 4–6 digits.' };
    const totalRaw = sum(digits), total = reduce(totalRaw);
    const rBN = relation(profile.bn, total), rDN = relation(profile.dn, total);
    const missingUsed = [...new Set(digits.filter(d => profile.missing.includes(d)))];
    const enemiesUsed = [...new Set(digits.filter(d => d !== 0 && profile.enemies.includes(d)))];
    const hasZero = digits.includes(0);
    let score = 0;
    score += rBN === 'friendly' ? 30 : rBN === 'neutral' ? 10 : -20;
    score += rDN === 'friendly' ? 30 : rDN === 'neutral' ? 10 : -20;
    score += Math.min(3, missingUsed.length) * 10;
    score -= enemiesUsed.length * 8;
    score -= hasZero ? 5 : 0;
    score = Math.max(0, Math.min(100, score + 10));
    const verdict = score >= 75 ? 'Excellent' : score >= 55 ? 'Good' : score >= 35 ? 'Average' : 'Avoid';
    return { digits, totalRaw, total, steps: reduceSteps(totalRaw), rBN, rDN, missingUsed, enemiesUsed, hasZero, score, verdict,
             balancer: rBN === 'friendly' && rDN === 'friendly' };
  }

  /** Generate 4-digit PINs: prefer missing numbers, total must be friendly to both BN & DN */
  function generatePins(profile, count = 8) {
    const pool = [1,2,3,4,5,6,7,8,9].filter(d => !profile.enemies.includes(d));
    const results = new Map();
    const rec = (prefix) => {
      if (prefix.length === 4) {
        const key = prefix.join('');
        const multiset = [...prefix].sort().join('');   // one PIN per digit-combination, not per permutation
        if (results.has(multiset)) return;
        const total = reduce(sum(prefix));
        if (relation(profile.bn, total) !== 'friendly' || relation(profile.dn, total) !== 'friendly') return;
        const missingUsed = new Set(prefix.filter(d => profile.missing.includes(d)));
        const distinct = new Set(prefix).size;
        let s = missingUsed.size * 10 + distinct * 2 + (profile.balancers.includes(total) ? 5 : 0);
        // small bonus for digits friendly to both
        s += prefix.filter(d => profile.balancers.includes(d)).length;
        results.set(multiset, { pin: key, total, missingUsed: [...missingUsed], score: s });
        return;
      }
      for (const d of pool) rec([...prefix, d]);
    };
    rec([]);
    return [...results.values()].sort((a, b) => b.score - a.score || a.pin.localeCompare(b.pin)).slice(0, count);
  }

  /* ---------- Recommendations ---------- */
  function recommendCovers(profile) {
    return DATA.covers.map(c => ({
      ...c,
      matchBN: c.bestFor.includes(profile.bn),
      matchDN: c.bestFor.includes(profile.dn),
    })).sort((a, b) => (b.matchBN * 2 + b.matchDN) - (a.matchBN * 2 + a.matchDN));
  }

  function recommendColors(profile) {
    return DATA.phoneColors.map(c => {
      const rels = c.numbers.map(n => relation(profile.bn, n));
      const relsDN = c.numbers.map(n => relation(profile.dn, n));
      const good = rels.includes('friendly') || c.numbers.includes(profile.bn);
      const bad = rels.includes('enemy') && !rels.includes('friendly');
      return { ...c, status: bad ? 'avoid' : good ? 'good' : 'neutral', dnStatus: relsDN.includes('enemy') && !relsDN.includes('friendly') ? 'avoid' : relsDN.includes('friendly') ? 'good' : 'neutral' };
    }).sort((a, b) => ({ good: 0, neutral: 1, avoid: 2 })[a.status] - ({ good: 0, neutral: 1, avoid: 2 })[b.status]);
  }

  function purposePins(purposeId, profile) {
    const p = DATA.purposes.find(x => x.id === purposeId);
    const keys = p ? p.pinKeys : [];
    const list = DATA.pins.filter(x => keys.includes(x.purpose));
    // de-dup by pin
    const seen = new Set();
    return list.filter(x => { const k = x.pin + x.purpose; if (seen.has(k)) return false; seen.add(k); return true; })
      .map(x => ({ ...x, check: checkPin(x.pin, profile) }))
      .sort((a, b) => b.check.score - a.check.score);
  }

  function purposePasswords(purposeId, profile) {
    const p = DATA.purposes.find(x => x.id === purposeId);
    const totals = p ? p.pwTotals : [];
    return totals.map(t => ({ total: t, ...DATA.passwords[t], rel: relation(profile.bn, t), relDN: relation(profile.dn, t),
      avoid8: t === 8 && (profile.bn === 8 || profile.dn === 8) }));
  }

  /* ---------- Lucky number generator ---------- */
  /** Small seeded PRNG so a person always sees the same suggestions for the same date of birth. */
  function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const pick = (arr, r) => arr[Math.floor(r() * arr.length)];

  const PATTERNS = [
    { id: 'end555', fixed: { 8: 5, 9: 5, 10: 5 } },
    { id: 'end55',  fixed: { 9: 5, 10: 5 } },
    { id: 'end6',   fixed: { 10: 6 } },
    { id: 'end3',   fixed: { 10: 3 } },
    { id: 'end7',   fixed: { 10: 7 } },
    { id: 'pairs',  pairs: true },      // ABAB style in the middle
    { id: 'mixed' },
  ];

  /**
   * Generate candidate 10-digit numbers that satisfy the position rules and are friendly to the
   * person's Birth & Destiny numbers. Returns [{id, numbers:[{str, score, grade, total}]}] per pattern.
   */
  function generateNumbers(profile, { perPattern = 6, attempts = 400, minScore = 80 } = {}) {
    const ideal = idealDigitsByPosition(profile);
    const seed = profile.day * 10000 + profile.month * 100 + (profile.year % 100);
    const r = rng(seed);
    const startDigits = [9, 7, 6, 8].filter(d => !profile.enemies.includes(d) && ideal[1].good.concat(ideal[1].safe).includes(d)); // Indian mobiles start 6-9
    // Some positions (notably the 6th) carry a warning for almost every digit, so fall back to the
    // least-harmful digits (lowest rule weight, never an enemy, never 0 or 4) when nothing is clean.
    const leastBad = pos => {
      const scored = [1,2,3,5,6,7,8,9].filter(d => !profile.enemies.includes(d)).map(d => ({ d, w: DATA.digitRules.filter(r => r.digit === d && r.type === 'bad' && r.positions.includes(pos)).reduce((a, r) => a + r.weight, 0) }));
      const min = Math.min(...scored.map(x => x.w)); return scored.filter(x => x.w === min).map(x => x.d);
    };
    const pool = pos => { const g = ideal[pos].good, sf = ideal[pos].safe.filter(d => d !== 0 && d !== 4); return g.length ? g.concat(g, sf) : sf.length ? sf : leastBad(pos); }; // weight good digits ×2
    const seen = new Set();
    return PATTERNS.map(pat => {
      const out = [];
      for (let i = 0; i < attempts && out.length < perPattern; i++) {
        const digits = [];
        for (let pos = 1; pos <= 10; pos++) {
          if (pat.fixed && pat.fixed[pos] != null) { digits.push(pat.fixed[pos]); continue; }
          if (pos === 1) { if (!startDigits.length) break; digits.push(pick(startDigits, r)); continue; }
          if (pat.pairs && pos >= 4 && pos <= 7) { digits.push(digits[pos - 3]); continue; }   // positions 4-7 repeat 2-5 → ABAB
          const p = pool(pos); if (!p.length) break; digits.push(pick(p, r));
        }
        if (digits.length !== 10) continue;
        const str = digits.join('');
        if (seen.has(str)) continue;
        const a = analyzeMobile(str, profile);
        if (a.error || a.score < minScore || a.compat.rBN === 'enemy' || a.compat.rDN === 'enemy') continue;
        seen.add(str); out.push({ str, score: a.score, grade: a.grade, total: a.total, balancer: a.compat.balancer });
      }
      out.sort((x, y) => y.score - x.score);
      return { id: pat.id, numbers: out };
    }).filter(g => g.numbers.length);
  }

  /** Compare several numbers for the same profile; returns analyses sorted best-first with a `best` flag. */
  function compareNumbers(list, profile) {
    const rows = list.map(raw => ({ raw, res: analyzeMobile(raw, profile) })).filter(x => !x.res.error);
    const best = Math.max(...rows.map(x => x.res.score), -1);
    return rows.map(x => ({ ...x, best: x.res.score === best }));
  }

  /* ---------- Life Path ---------- */
  function lifePath(isoDate) {
    const p = profileFromDOB(isoDate);
    const master = p.dnSteps.find(x => [11, 22, 33].includes(x)) || null;
    return { ...p, master, meaning: DATA.lifePath[p.dn], birthMeaning: DATA.lifePath[p.bn] };
  }

  /* ---------- Personal Year / Month / Day ---------- */
  function personalCycle(isoDate, onDate) {
    const [, m, d] = isoDate.split('-').map(Number);
    const now = onDate ? new Date(onDate + 'T00:00:00') : new Date();
    // Personal year runs from birthday to birthday; before this year's birthday the previous calendar year applies
    const yr = now.getFullYear() - ((now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) ? 1 : 0);
    const pySteps = reduceSteps(sum(digitsOf(d)) + sum(digitsOf(m)) + sum(digitsOf(yr)));
    const py = pySteps[pySteps.length - 1];
    const pm = reduce(py + now.getMonth() + 1);
    const pd = reduce(pm + now.getDate());
    return { year: yr, personalYear: py, pySteps, personalMonth: pm, personalDay: pd, cycleStart: `${yr}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`, cycleEnd: `${yr + 1}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`, meaning: DATA.personalYear[py], nextYear: DATA.personalYear[py === 9 ? 1 : py + 1] };
  }

  /* ---------- Compatibility between two dates of birth ---------- */
  function compatibility(dobA, dobB) {
    const a = profileFromDOB(dobA), b = profileFromDOB(dobB);
    const score2 = (x, y) => { const r1 = relation(x, y), r2 = relation(y, x); const v = r => r === 'friendly' ? 1 : r === 'neutral' ? 0.5 : 0; return (v(r1) + v(r2)) / 2; };
    const parts = [
      { key: 'bn', label: 'Birth number ↔ Birth number', a: a.bn, b: b.bn, weight: 40, s: score2(a.bn, b.bn), rAB: relation(a.bn, b.bn), rBA: relation(b.bn, a.bn) },
      { key: 'dn', label: 'Destiny number ↔ Destiny number', a: a.dn, b: b.dn, weight: 30, s: score2(a.dn, b.dn), rAB: relation(a.dn, b.dn), rBA: relation(b.dn, a.dn) },
      { key: 'ab', label: 'A\'s Birth ↔ B\'s Destiny', a: a.bn, b: b.dn, weight: 15, s: score2(a.bn, b.dn), rAB: relation(a.bn, b.dn), rBA: relation(b.dn, a.bn) },
      { key: 'ba', label: 'B\'s Birth ↔ A\'s Destiny', a: b.bn, b: a.dn, weight: 15, s: score2(b.bn, a.dn), rAB: relation(b.bn, a.dn), rBA: relation(a.dn, b.bn) },
    ];
    const score = Math.round(parts.reduce((t, p) => t + p.s * p.weight, 0));
    const shared = [1,2,3,4,5,6,7,8,9].filter(n => a.balancers.includes(n) && b.balancers.includes(n));
    const grade = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Average' : 'Needs change';
    return { a, b, parts, score, grade, shared };
  }

  /* ---------- Pythagorean name value (alternative to Chaldean) ---------- */
  function pythagorean(str) {
    const letters = []; let total = 0;
    for (const ch of String(str).toUpperCase()) {
      if (/[A-Z]/.test(ch)) { const v = ((ch.charCodeAt(0) - 65) % 9) + 1; letters.push({ ch, v }); total += v; }
      else if (/[0-9]/.test(ch)) { const v = Number(ch); letters.push({ ch, v }); total += v; }
      else if (ch.trim()) letters.push({ ch, v: 0 });
    }
    return { letters, total, steps: reduceSteps(total), single: reduce(total) };
  }

  /* ---------- Lo Shu planes ---------- */
  function loShuPlanes(grid) {
    return DATA.loShu.planes.map(pl => ({ ...pl, complete: pl.cells.every(c => grid[c] > 0), present: pl.cells.filter(c => grid[c] > 0).length }));
  }

  return { reduce, reduceSteps, relation, profileFromDOB, chaldean, pythagorean, analyzeMobile, idealDigitsByPosition, generateNumbers, compareNumbers, lifePath, personalCycle, compatibility, loShuPlanes,
           checkPin, generatePins, recommendCovers, recommendColors, purposePins, purposePasswords, balancerNumbers, digitsOf };
})();
