// Exports per-birth-number data (computed by the real engine) for tools/build.py → tools/numbers.json
const fs = require('fs'), path = require('path');
const site = path.join(__dirname, '..', 'site', 'js');
eval(fs.readFileSync(path.join(site, 'data.js'), 'utf8') + fs.readFileSync(path.join(site, 'numerology.js'), 'utf8') + `
const out = {};
for (let n = 1; n <= 9; n++) {
  const f = DATA.friendly[n];
  // synthetic profile: someone whose BN and DN are both n (so recommendations depend on n alone)
  const profile = { day: n, month: n, year: 1990 + n, bn: n, dn: n, enemies: f.enemies, balancers: f.friends, friendsBN: f.friends, friendsDN: f.friends, missing: [], grid: {} };
  const ideal = Numerology.idealDigitsByPosition(profile);
  const lucky = Numerology.generateNumbers(profile, { perPattern: 3 }).map(g => ({ id: g.id, numbers: g.numbers.slice(0, 3).map(x => ({ str: x.str, score: x.score, total: x.total })) }));
  const pins = DATA.pins.filter(p => f.friends.includes(p.total)).slice(0, 10);
  const pwTotals = [1,2,3,4,5,6,7,8,9].filter(tt => f.friends.includes(tt) && !(n === 8 && tt === 8)).map(tt => ({ total: tt, ...DATA.passwords[tt] }));
  const days = [n, n + 9, n + 18, n + 27].filter(d => d <= 31);
  out[n] = {
    planet: DATA.numbers[n].planet, keyword: DATA.numbers[n].keyword, friends: f.friends, enemies: f.enemies, neutral: f.neutral, days,
    ideal: Object.fromEntries(Object.entries(ideal).map(([pos, v]) => [pos, { good: v.good, safe: v.safe }])),
    lucky, pins, pwTotals,
    wallpaper: DATA.wallpapers[n],
    covers: DATA.covers.filter(c => c.bestFor.includes(n)).map(c => ({ name: c.name, icon: c.icon, idealFor: c.idealFor, tip: c.tip || '', traits: c.traits.slice(0, 4) })),
    colors: DATA.phoneColors.map(c => ({ name: c.name, hex: c.hex, numbers: c.numbers, status: c.numbers.includes(n) || c.numbers.some(x => f.friends.includes(x)) ? 'good' : c.numbers.some(x => f.enemies.includes(x)) ? 'avoid' : 'neutral' })),
    affirmation: DATA.affirmations[n],
    positions: DATA.positions,
  };
}
fs.writeFileSync(path.join(__dirname, 'numbers.json'), JSON.stringify(out));
console.log('exported', Object.keys(out).length, 'numbers');
`);
