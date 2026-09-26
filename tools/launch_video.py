#!/usr/bin/env python3
"""Launch video for social media.

Renders every frame with Pillow (Geist from brand/fonts, the real logo mark,
CoreText for the Indic line) and encodes H.264 MP4 with the ffmpeg bundled by
imageio-ffmpeg. No audio — add a trending track in the app you post from.

    python3 tools/launch_video.py            # 9:16 and 1:1, plus a poster frame
    python3 tools/launch_video.py --only 9x16

Output: brand/video/
"""
import math, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

sys.path.insert(0, str(Path(__file__).resolve().parent))
try:
    import native_text
except Exception:
    native_text = None
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parent.parent
BRAND, ASSETS, OUT = ROOT / 'brand', ROOT / 'site' / 'assets', ROOT / 'brand' / 'video'
FPS = 30
SITE = 'numberkundli.com'

# ---------------------------------------------------------------- palette
BG, BG2 = (10, 12, 22), (17, 20, 42)
TEXT, MUTED = (238, 240, 251), (163, 168, 200)
GOLD, VIOLET, TEAL = (255, 203, 71), (139, 123, 255), (79, 209, 197)
GOOD, BAD, WARN = (52, 211, 153), (248, 113, 113), (251, 191, 36)
INK = (26, 20, 0)

_fcache = {}
def F(size, weight=700):
    key = (size, weight)
    if key not in _fcache:
        p = BRAND / 'fonts' / f'Geist-{weight}.ttf'
        _fcache[key] = ImageFont.truetype(str(p), size) if p.exists() else ImageFont.load_default()
    return _fcache[key]

# ---------------------------------------------------------------- easing
def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def ease_out(t): return 1 - (1 - clamp(t)) ** 3          # entrances
def ease_in_out(t): t = clamp(t); return 3 * t * t - 2 * t * t * t
def seg(f, start, dur):
    """Progress 0..1 of a sub-animation starting at frame `start` lasting `dur` frames."""
    return clamp((f - start) / max(1, dur))

# ---------------------------------------------------------------- drawing helpers
def bg_frame(W, H, f):
    """Brand gradient background with two slowly drifting glows."""
    im = Image.new('RGB', (W, H), BG)
    small = Image.new('RGB', (W // 8, H // 8), BG)
    d = ImageDraw.Draw(small)
    t = f / FPS
    for cx, cy, r, col, a in [
        (0.18 + 0.03 * math.sin(t * 0.5), 0.10, 0.62, VIOLET, 0.30),
        (0.88, 0.26 + 0.03 * math.cos(t * 0.4), 0.50, GOLD, 0.16),
        (0.50, 1.04, 0.55, TEAL, 0.14),
    ]:
        x, y, rad = cx * small.width, cy * small.height, r * small.width
        steps = 26
        for i in range(steps, 0, -1):
            k = i / steps
            col2 = tuple(int(BG[j] + (col[j] - BG[j]) * a * (1 - k) ** 2) for j in range(3))
            d.ellipse([x - rad * k, y - rad * k, x + rad * k, y + rad * k], fill=col2)
    return Image.blend(im, small.resize((W, H), Image.LANCZOS), 1.0)

def text(d, xy, s, font, fill=TEXT, anchor='mm', spacing=10):
    d.text(xy, s, font=font, fill=fill, anchor=anchor, spacing=spacing)

def fit(d, s, font_size, weight, max_w, min_size=28):
    """Largest Geist size at `weight` that keeps `s` inside max_w."""
    size = font_size
    while size > min_size and d.textlength(s, font=F(size, weight)) > max_w:
        size -= 2
    return F(size, weight)

def rounded(im, box, radius, fill, outline=None, width=2):
    d = ImageDraw.Draw(im, 'RGBA')
    d.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)

def card(im, box, radius=28, alpha=16, outline=40):
    rounded(im, box, radius, (255, 255, 255, alpha), (255, 255, 255, outline), 2)

def paste_fade(base, img, xy, alpha):
    if alpha <= 0.01: return
    layer = img.copy()
    if alpha < 1:
        a = layer.getchannel('A').point(lambda v: int(v * alpha))
        layer.putalpha(a)
    base.paste(layer, xy, layer)

def shadow_text(d, xy, s, font, fill, anchor='mm'):
    d.text((xy[0] + 2, xy[1] + 3), s, font=font, fill=(0, 0, 0, 120), anchor=anchor)
    d.text(xy, s, font=font, fill=fill, anchor=anchor)

_mark = None
def mark(size):
    global _mark
    if _mark is None:
        _mark = Image.open(ASSETS / 'logo-mark.png').convert('RGBA')
    return _mark.resize((size, size), Image.LANCZOS)

_native_cache = {}
def native(txt, lang, size, color=TEXT):
    """Indic text rendered through CoreText (Pillow can't shape these scripts)."""
    key = (txt, lang, size, color)
    if key not in _native_cache:
        if native_text and native_text.AVAILABLE:
            _native_cache[key] = native_text.render(txt, native_text.FONT_FOR_LANG[lang], size, 1400,
                                                    color=color, bold=False, line_height=1.1)
        else:
            _native_cache[key] = Image.new('RGBA', (1, 1))
    return _native_cache[key]

def score_ring(size, pct, color, width=None):
    """Progress ring, supersampled for clean edges."""
    S, w = size * 3, (width or size // 11) * 3
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.ellipse([w // 2, w // 2, S - w // 2, S - w // 2], outline=(255, 255, 255, 40), width=w)
    if pct > 0:
        d.arc([w // 2, w // 2, S - w // 2, S - w // 2], -90, -90 + 360 * pct, fill=color + (255,), width=w)
    return im.resize((size, size), Image.LANCZOS)

# ---------------------------------------------------------------- scenes
POSITIONS = [('9', 'Attitude'), ('5', 'Decision'), ('6', 'Health'), ('0', 'Partner'), ('5', 'Kids'),
             ('6', 'Marriage'), ('9', 'Married life'), ('4', 'Career'), ('9', 'Public'), ('7', 'Wealth')]
POS_STATE = ['good', '', '', '', 'bad', 'bad', 'bad', 'bad', 'good', 'good']
STATE_COL = {'good': GOOD, 'bad': BAD, '': MUTED}

def scene_logo(im, d, f, n, W, H, S):
    """0–2.5s — mark lands, wordmark fades up."""
    p = ease_out(seg(f, 0, int(0.9 * FPS)))
    size = int(S(300) * (0.75 + 0.25 * p))
    m = mark(size)
    paste_fade(im, m, (W // 2 - size // 2, int(H * 0.38) - size // 2), p)
    a = ease_out(seg(f, int(0.55 * FPS), int(0.6 * FPS)))
    if a > 0:
        y = int(H * 0.38) + size // 2 + S(80)
        fnt = fit(d, 'NumberKundli', S(96), 700, W - S(120))
        shadow_text(d, (W // 2, y + int((1 - a) * S(24))), 'NumberKundli', fnt,
                    (*TEXT, int(255 * a)))
        b = ease_out(seg(f, int(0.95 * FPS), int(0.6 * FPS)))
        if b > 0:
            text(d, (W // 2, y + S(78)), 'Mobile number numerology', F(S(40), 500),
                 (*MUTED, int(255 * b)))

def scene_hook(im, d, f, n, W, H, S):
    """2.5–6.5s — the hook, with the phone number typing in."""
    p = ease_out(seg(f, 0, int(0.7 * FPS)))
    lines = ['Your phone number', 'carries a number.']
    y = int(H * 0.28)
    for i, ln in enumerate(lines):
        a = ease_out(seg(f, int(i * 0.14 * FPS), int(0.7 * FPS)))
        fnt = fit(d, ln, S(88), 700, W - S(120))
        shadow_text(d, (W // 2 + 0, y + i * S(104) + int((1 - a) * S(30))), ln, fnt, (*TEXT, int(255 * a)))
    a2 = ease_out(seg(f, int(0.7 * FPS), int(0.6 * FPS)))
    if a2 > 0:
        ln = 'Is it working for you?'
        fnt = fit(d, ln, S(88), 700, W - S(120))
        shadow_text(d, (W // 2, y + 2 * S(104) + int((1 - a2) * S(30))), ln, fnt, (*GOLD, int(255 * a2)))
    # typing number
    full = '95605 69497'
    t = seg(f, int(1.35 * FPS), int(1.5 * FPS))
    shown = full[:max(0, int(t * len(full)))]
    if shown:
        bw, bh = int(W * 0.80), S(170)
        bx, by = (W - bw) // 2, int(H * 0.62)
        card(im, [bx, by, bx + bw, by + bh], radius=S(30))
        caret = '|' if (f // 8) % 2 == 0 and t < 1 else ''
        text(d, (W // 2, by + bh // 2), shown + caret, F(S(72), 600), TEXT)

def scene_positions(im, d, f, n, W, H, S):
    """6.5–11s — the ten positions light up one by one."""
    head = 'All 10 positions, read'
    a = ease_out(seg(f, 0, int(0.5 * FPS)))
    fnt = fit(d, head, S(68), 700, W - S(120))
    shadow_text(d, (W // 2, int(H * 0.17)), head, fnt, (*TEXT, int(255 * a)))
    cols, gap = 2, S(22)
    cw = (W - S(120) - gap) // cols
    ch = S(168)
    top = int(H * 0.235)
    for i, (dig, label) in enumerate(POSITIONS):
        p = ease_out(seg(f, int((0.30 + i * 0.13) * FPS), int(0.45 * FPS)))
        if p <= 0: continue
        r, c = divmod(i, cols)
        x = S(60) + c * (cw + gap)
        y = top + r * (ch + gap) + int((1 - p) * S(26))
        st = POS_STATE[i]
        col = STATE_COL[st]
        alpha = int(255 * p)
        tint = (*col, int(34 * p)) if st else (255, 255, 255, int(14 * p))
        rounded(im, [x, y, x + cw, y + ch], S(24), tint, (*col, int((110 if st else 50) * p)), 2)
        d.text((x + S(34), y + ch // 2), dig, font=F(S(76), 700), fill=(*TEXT, alpha), anchor='lm')
        d.text((x + S(120), y + ch // 2 - S(22)), f'P{i+1}', font=F(S(26), 600), fill=(*MUTED, alpha), anchor='lm')
        d.text((x + S(120), y + ch // 2 + S(26)), label, font=F(S(34), 500), fill=(*TEXT, alpha), anchor='lm')

def scene_score(im, d, f, n, W, H, S):
    """11–15s — the score ring fills."""
    target = 0.82
    p = ease_in_out(seg(f, int(0.2 * FPS), int(1.3 * FPS)))
    size = S(470)
    ring = score_ring(size, target * p, GOOD)
    cx, cy = W // 2, int(H * 0.38)
    a = ease_out(seg(f, 0, int(0.4 * FPS)))
    paste_fade(im, ring, (cx - size // 2, cy - size // 2), a)
    val = int(82 * p)
    text(d, (cx, cy - S(20)), str(val), F(S(156), 700), (*TEXT, int(255 * a)))
    text(d, (cx, cy + S(96)), '/ 100', F(S(40), 500), (*MUTED, int(255 * a)))
    b = ease_out(seg(f, int(1.35 * FPS), int(0.5 * FPS)))
    if b > 0:
        text(d, (cx, cy + size // 2 + S(110)), 'EXCELLENT', F(S(52), 700), (*GOOD, int(255 * b)))
        text(d, (cx, cy + size // 2 + S(186)), '5 warnings · 4 strengths', F(S(38), 500), (*MUTED, int(255 * b)))
    c = ease_out(seg(f, int(1.7 * FPS), int(0.5 * FPS)))
    if c > 0:
        ln = 'and exactly why'
        fnt = fit(d, ln, S(56), 600, W - S(160))
        shadow_text(d, (cx, cy + size // 2 + S(300)), ln, fnt, (*MUTED, int(255 * c)))

def scene_gives(im, d, f, n, W, H, S):
    """15–19s — what you actually get."""
    head = 'You get'
    a = ease_out(seg(f, 0, int(0.4 * FPS)))
    shadow_text(d, (W // 2, int(H * 0.18)), head, F(S(72), 700), (*TEXT, int(255 * a)))
    items = [('A lucky mobile number', GOLD), ('A PIN that fills your gaps', TEAL),
             ('A password for your goal', VIOLET), ('Wallpaper, cover & colour', GOOD),
             ('A PDF report to keep', GOLD)]
    top = int(H * 0.255)
    bh, gap = S(152), S(24)
    for i, (label, col) in enumerate(items):
        p = ease_out(seg(f, int((0.35 + i * 0.22) * FPS), int(0.5 * FPS)))
        if p <= 0: continue
        y = top + i * (bh + gap)
        x0 = S(60) + int((1 - p) * S(50))
        rounded(im, [x0, y, W - S(60), y + bh], S(26), (255, 255, 255, int(16 * p)), (*col, int(90 * p)), 2)
        d.ellipse([x0 + S(38), y + bh // 2 - S(12), x0 + S(62), y + bh // 2 + S(12)], fill=(*col, int(255 * p)))
        fnt = fit(d, label, S(48), 600, W - S(60) - (x0 + S(96)) - S(30))
        d.text((x0 + S(96), y + bh // 2), label, font=fnt, fill=(*TEXT, int(255 * p)), anchor='lm')

def scene_langs(im, d, f, n, W, H, S):
    """19–22s — five languages."""
    a = ease_out(seg(f, 0, int(0.4 * FPS)))
    shadow_text(d, (W // 2, int(H * 0.26)), 'In five languages', F(S(72), 700), (*TEXT, int(255 * a)))
    langs = [('English', None), ('हिन्दी', 'hi'), ('मराठी', 'mr'), ('தமிழ்', 'ta'), ('ગુજરાતી', 'gu')]
    y = int(H * 0.38)
    for i, (label, lang) in enumerate(langs):
        p = ease_out(seg(f, int((0.35 + i * 0.16) * FPS), int(0.5 * FPS)))
        if p <= 0: continue
        yy = y + i * S(126) + int((1 - p) * S(24))
        col = [GOLD, VIOLET, TEAL, GOOD, WARN][i]
        dot, pad = S(20), S(26)
        if lang:
            img = native(label, lang, S(64), TEXT)
            tw = img.width
            x0 = W // 2 - (dot + pad + tw) // 2
            paste_fade(im, img, (x0 + dot + pad, yy - img.height // 2), p)
        else:
            fnt = F(S(64), 600)
            tw = int(d.textlength(label, font=fnt))
            x0 = W // 2 - (dot + pad + tw) // 2
            d.text((x0 + dot + pad, yy), label, font=fnt, fill=(*TEXT, int(255 * p)), anchor='lm')
        d.ellipse([x0, yy - dot // 2, x0 + dot, yy + dot // 2], fill=(*col, int(255 * p)))

def scene_cta(im, d, f, n, W, H, S):
    """22–26s — the call to action."""
    p = ease_out(seg(f, 0, int(0.5 * FPS)))
    size = S(220)
    paste_fade(im, mark(size), (W // 2 - size // 2, int(H * 0.28) - size // 2), p)
    a = ease_out(seg(f, int(0.25 * FPS), int(0.5 * FPS)))
    fnt = fit(d, SITE, S(92), 700, W - S(100))
    shadow_text(d, (W // 2, int(H * 0.45)), SITE, fnt, (*GOLD, int(255 * a)))
    b = ease_out(seg(f, int(0.55 * FPS), int(0.5 * FPS)))
    if b > 0:
        text(d, (W // 2, int(H * 0.52)), 'Free · No sign-up · Runs in your browser',
             F(S(38), 500), (*MUTED, int(255 * b)))
    c = ease_out(seg(f, int(0.85 * FPS), int(0.5 * FPS)))
    if c > 0:
        bw, bh = int(W * 0.78), S(148)
        bx, by = (W - bw) // 2, int(H * 0.62)
        pulse = 1 + 0.015 * math.sin(f / 5.0)
        bw2, bh2 = int(bw * pulse), int(bh * pulse)
        bx2, by2 = W // 2 - bw2 // 2, by - (bh2 - bh) // 2
        rounded(im, [bx2, by2, bx2 + bw2, by2 + bh2], bh2 // 2, (*GOLD, int(255 * c)))
        text(d, (W // 2, by2 + bh2 // 2), 'Analyse my number', F(S(52), 700), (*INK, int(255 * c)))
    e = ease_out(seg(f, int(1.2 * FPS), int(0.5 * FPS)))
    if e > 0:
        text(d, (W // 2, int(H * 0.74)), 'Numerology is for guidance and entertainment',
             F(S(28), 400), (*MUTED, int(200 * e)))

SCENES = [
    (scene_logo,      2.5),
    (scene_hook,      4.0),
    (scene_positions, 4.6),
    (scene_score,     4.0),
    (scene_gives,     4.2),
    (scene_langs,     3.4),
    (scene_cta,       4.0),
]
TOTAL = sum(s[1] for s in SCENES)

def render_frame(i, W, H):
    """Compose frame i of the whole video, with cross-fades between scenes."""
    S = lambda v: max(1, int(v * (H / 1920)))   # scale by height so 4:5 and 9:16 share one layout
    im = bg_frame(W, H, i)
    t = i / FPS
    acc = 0.0
    FADE = 0.28
    for fn, dur in SCENES:
        start, end = acc, acc + dur
        if start - FADE <= t < end + 0.001:
            local = int((t - start) * FPS)
            layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
            d = ImageDraw.Draw(layer, 'RGBA')
            fn(layer, d, max(0, local), int(dur * FPS), W, H, S)
            a = 1.0
            if t < start:                       # incoming during cross-fade
                a = clamp((t - (start - FADE)) / FADE)
            elif t > end - FADE:                # outgoing
                a = 1 - clamp((t - (end - FADE)) / FADE)
            if a > 0.01:
                if a < 1:
                    layer.putalpha(layer.getchannel('A').point(lambda v: int(v * a)))
                im.paste(layer, (0, 0), layer)
        acc = end
    # progress bar
    d = ImageDraw.Draw(im, 'RGBA')
    pw = int(W * clamp(t / TOTAL))
    d.rectangle([0, H - S(8), pw, H], fill=(*GOLD, 200))
    return im

def encode(W, H, name):
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / name
    n = int(TOTAL * FPS)
    writer = imageio_ffmpeg.write_frames(
        str(path), (W, H), fps=FPS, codec='libx264', quality=None,
        macro_block_size=1, ffmpeg_log_level='error',
        output_params=['-crf', '19', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart'])
    writer.send(None)
    for i in range(n):
        writer.send(render_frame(i, W, H).tobytes())
        if i % 60 == 0:
            print(f'  {name}: {i}/{n} frames', flush=True)
    writer.close()
    mb = path.stat().st_size / 1e6
    print(f'  {name}: {n} frames, {TOTAL:.1f}s, {mb:.1f} MB')
    return path

if __name__ == '__main__':
    only = sys.argv[sys.argv.index('--only') + 1] if '--only' in sys.argv else None
    sizes = [(1080, 1920, 'numberkundli-launch-9x16.mp4'),   # Reels / Shorts / Status
             (1080, 1350, 'numberkundli-launch-4x5.mp4')]   # Instagram & Facebook feed
    for W, H, name in sizes:
        if only and only not in name: continue
        print(f'Rendering {name} ({W}x{H})…')
        encode(W, H, name)
    # poster frame for the feed thumbnail
    OUT.mkdir(parents=True, exist_ok=True)
    render_frame(int((TOTAL - 2.0) * FPS), 1080, 1920).save(OUT / 'poster-9x16.jpg', quality=90)
    print('Done →', OUT)
