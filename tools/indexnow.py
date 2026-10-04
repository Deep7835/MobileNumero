#!/usr/bin/env python3
"""Submit every URL in site/sitemap.xml to IndexNow (Bing, Yandex, Naver, Seznam, DuckDuckGo via Bing).
Google does not use IndexNow. Key file: site/16bbd92b2bd8e3306fbbd966706a76b1.txt.  Run: python3 tools/indexnow.py"""
import json, re, urllib.request, ssl, sys, subprocess
from pathlib import Path
KEY = '16bbd92b2bd8e3306fbbd966706a76b1'
ROOT = Path(__file__).resolve().parent.parent / 'site'
# Bing guideline 4: "Avoid batch submissions when possible." Submit only URLs whose
# sitemap lastmod has moved since the last run; --all forces the full set.
sm = (ROOT / 'sitemap.xml').read_text()
pairs = re.findall(r'<loc>([^<]+)</loc>\s*<lastmod>([^<]+)</lastmod>', sm)
STATE = Path(__file__).resolve().parent / 'indexnow-state.json'
prev = json.loads(STATE.read_text()) if STATE.exists() else {}
force = '--all' in sys.argv
urls = [u for u, d in pairs] if force else [u for u, d in pairs if prev.get(u) != d]
if not urls:
    print('IndexNow: nothing changed since the last submission (use --all to resubmit everything)')
    raise SystemExit(0)
print(f'IndexNow: {len(urls)} of {len(pairs)} URLs changed')
host = urls[0].split('/')[2]
body = json.dumps({'host': host, 'key': KEY, 'keyLocation': f'https://{host}/{KEY}.txt', 'urlList': urls}).encode()
req = urllib.request.Request('https://api.indexnow.org/indexnow', data=body, headers={'Content-Type': 'application/json; charset=utf-8'})
try:
    import certifi; ctx = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    ctx = ssl.create_default_context()
try:
    with urllib.request.urlopen(req, timeout=30, context=ctx) as r:
        print(f'IndexNow: HTTP {r.status} — {len(urls)} URLs submitted for {host}')
        STATE.write_text(json.dumps(dict(pairs), indent=1, sort_keys=True) + '\n')
except urllib.error.HTTPError as e: print(f'IndexNow: HTTP {e.code} {e.read().decode()[:300]}'); sys.exit(1)
except urllib.error.URLError as e:
    if 'CERTIFICATE_VERIFY_FAILED' not in str(e): raise
    # python.org builds ship without root CAs — fall back to the system curl, which has them
    out = subprocess.run(['curl', '-s', '-o', '/dev/null', '-w', '%{http_code}', '-X', 'POST', 'https://api.indexnow.org/indexnow',
                          '-H', 'Content-Type: application/json; charset=utf-8', '--data-binary', '@-'], input=body, capture_output=True)
    code = out.stdout.decode().strip(); print(f'IndexNow (via curl): HTTP {code} — {len(urls)} URLs submitted for {host}')
    if code in ('200', '202'): STATE.write_text(json.dumps(dict(pairs), indent=1, sort_keys=True) + '\n')
    sys.exit(0 if code in ('200', '202') else 1)
