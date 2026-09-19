#!/usr/bin/env python3
"""Link checker: verifies every internal href/src in site/**/*.html resolves to a file (and #anchors to an id),
and probes external links with a HEAD/GET request. Run: python3 tools/check-links.py [--external]"""
import re, sys, os, urllib.request, urllib.error, ssl, concurrent.futures
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent / 'site'
EXTERNAL = '--external' in sys.argv
SITE_URL = re.search(r"SITE_URL = '([^']+)'", (ROOT.parent / 'tools' / 'build.py').read_text()).group(1)
html_files = sorted(ROOT.rglob('*.html'))
ids = {f: set(re.findall(r'\sid="([^"]+)"', f.read_text())) for f in html_files}
broken, external = [], set()
for f in html_files:
    text = f.read_text()
    text = re.sub(r'<link[^>]+rel="preconnect"[^>]*>', '', text)   # preconnect origins are not navigable links
    for attr, url in re.findall(r'\b(href|src|srcset)="([^"]+)"', text):
        for u in ([x.strip().split(' ')[0] for x in url.split(',')] if attr == 'srcset' else [url]):
            if u.startswith(('http://', 'https://')):
                if not u.startswith(SITE_URL): external.add((u, str(f.relative_to(ROOT)))); continue   # canonical/og URLs point at the deploy domain
                u = u[len(SITE_URL):] or '/'                                                          # check own absolute URLs like relative ones
            if u.startswith(('mailto:', 'tel:', 'data:', 'javascript:')) or u == '#': continue
            path, _, frag = u.partition('#'); path = path.split('?')[0]
            if attr == 'href' and path.endswith('.html'): broken.append((str(f.relative_to(ROOT)), u, 'links must be extensionless (Cloudflare redirects *.html)')); continue
            target = f if not path else (ROOT / path.lstrip('/') if path.startswith('/') else f.parent / path).resolve()
            if path and target.is_dir(): target = target / 'index.html'
            elif path and not target.exists() and target.with_name(target.name + '.html').is_file(): target = target.with_name(target.name + '.html')   # clean URL -> page.html
            if path and not target.exists(): broken.append((str(f.relative_to(ROOT)), u, 'missing file')); continue
            if frag and target.suffix == '.html' and frag not in ids.get(target, set()): broken.append((str(f.relative_to(ROOT)), u, f'missing anchor #{frag}'))
print(f'checked {len(html_files)} pages')
print('internal broken:', len(broken))
for b in broken: print('  ', *b)
if EXTERNAL:
    try:
        import certifi; ctx = ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        ctx = ssl.create_default_context()
        try: urllib.request.urlopen('https://www.google.com', timeout=8, context=ctx)
        except Exception: ctx = ssl._create_unverified_context(); print('  (no root CA bundle in this Python — verifying reachability without TLS validation)')
    # sites listed in js/data.js are injected by JavaScript, so add them explicitly
    for m in re.findall(r"url: '([^']+)'", (ROOT / 'js' / 'data.js').read_text()): external.add((m, 'js/data.js'))
    def probe(u):
        req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0 (link-checker)'}, method='HEAD')
        try: return urllib.request.urlopen(req, timeout=12, context=ctx).status
        except urllib.error.HTTPError as e:
            if e.code in (403, 405):   # some hosts block HEAD — retry GET
                try: return urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0 (link-checker)'}), timeout=12, context=ctx).status
                except Exception as e2: return f'ERR {e2}'
            return e.code
        except Exception as e: return f'ERR {e}'
    urls = sorted({u for u, _ in external})
    with concurrent.futures.ThreadPoolExecutor(8) as ex:
        for u, st in zip(urls, ex.map(probe, urls)): print(f'  {st!s:>6}  {u}')
sys.exit(1 if broken else 0)
