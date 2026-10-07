// Exports the UI strings from site/js/lang/*.js (the same packs the browser loads) so
// tools/build.py can pre-render the per-language home pages → tools/lang.json
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'site', 'js', 'lang');
const out = {};
global.I18N = { register: (code, pack) => { out[code] = pack.ui || {}; } };
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.js'))) eval(fs.readFileSync(path.join(dir, f), 'utf8'));
fs.writeFileSync(path.join(__dirname, 'lang.json'), JSON.stringify(out, null, 1));
console.log('exported', Object.keys(out).join(', '), '—', Object.values(out)[0] && Object.keys(Object.values(out)[0]).length, 'keys each');
