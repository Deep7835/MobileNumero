#!/usr/bin/env python3
"""Submit every URL in site/sitemap.xml to IndexNow (Bing, Yandex, Naver, Seznam, DuckDuckGo via Bing).
Google does not use IndexNow. Key file: site/16bbd92b2bd8e3306fbbd966706a76b1.txt.  Run: python3 tools/indexnow.py"""
import json, re, urllib.request, sys
from pathlib import Path
KEY = '16bbd92b2bd8e3306fbbd966706a76b1'
ROOT = Path(__file__).resolve().parent.parent / 'site'
urls = re.findall(r'<loc>([^<]+)</loc>', (ROOT / 'sitemap.xml').read_text())
host = urls[0].split('/')[2]
body = json.dumps({'host': host, 'key': KEY, 'keyLocation': f'https://{host}/{KEY}.txt', 'urlList': urls}).encode()
req = urllib.request.Request('https://api.indexnow.org/indexnow', data=body, headers={'Content-Type': 'application/json; charset=utf-8'})
try:
    with urllib.request.urlopen(req, timeout=30) as r: print(f'IndexNow: HTTP {r.status} — {len(urls)} URLs submitted for {host}')
except urllib.error.HTTPError as e: print(f'IndexNow: HTTP {e.code} {e.read().decode()[:300]}'); sys.exit(1)
