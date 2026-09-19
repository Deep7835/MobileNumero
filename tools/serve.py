#!/usr/bin/env python3
"""Local dev server that mimics Cloudflare's static-asset routing so the site behaves like production:
/blog/post -> blog/post.html, /dir -> /dir/, *.html and index.html -> 301 to the clean URL,
and 404.html (with a real 404 status) for anything missing.  Run: python3 tools/serve.py [port]"""
import http.server, io, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent / 'site'
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8765

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=str(ROOT), **k)
    def redirect(self, to):
        self.send_response(301); self.send_header('Location', to); self.send_header('Content-Length', '0'); self.end_headers()
    def send_head(self):
        path, _, qs = self.path.partition('?'); q = ('?' + qs) if qs else ''
        fs = ROOT / path.lstrip('/')
        if path.endswith('/index.html'): return self.redirect(path[:-10] + q)
        if path.endswith('.html'): return self.redirect(path[:-5] + q)
        if fs.is_dir() and not path.endswith('/'): return self.redirect(path + '/' + q)
        if not fs.exists():
            if fs.with_name(fs.name + '.html').is_file(): self.path = path + '.html' + q
            else:
                body = (ROOT / '404.html').read_bytes()
                self.send_response(404); self.send_header('Content-Type', 'text/html; charset=utf-8'); self.send_header('Content-Length', str(len(body))); self.end_headers()
                return io.BytesIO(body)
        return super().send_head()
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store'); super().end_headers()   # never cache during development

if __name__ == '__main__':
    print(f'serving {ROOT} at http://localhost:{PORT}/ (Cloudflare-style clean URLs)')
    http.server.ThreadingHTTPServer(('', PORT), Handler).serve_forever()
