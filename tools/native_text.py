"""Render properly-shaped text (Devanagari, Tamil, Gujarati…) to a PIL RGBA image via macOS CoreText.
Pillow without libraqm cannot shape Indic scripts; AppKit can."""
from PIL import Image
import io
try:
    import objc
    from AppKit import (NSImage, NSBitmapImageRep, NSGraphicsContext, NSFont, NSColor, NSMutableParagraphStyle,
                        NSAttributedString, NSString, NSMakeRect, NSMakeSize, NSFontAttributeName, NSForegroundColorAttributeName,
                        NSParagraphStyleAttributeName, NSPNGFileType, NSCalibratedRGBColorSpace, NSFontManager, NSFontBoldTrait)
    from Foundation import NSMakeRange
    AVAILABLE = True
except Exception:
    AVAILABLE = False

FONT_FOR_LANG = {'hi': 'Devanagari Sangam MN', 'mr': 'Devanagari Sangam MN', 'gu': 'Gujarati Sangam MN', 'ta': 'Tamil Sangam MN'}

def _font(name, size, bold=True):
    f = NSFont.fontWithName_size_(name, size) or NSFont.systemFontOfSize_(size)
    if bold:
        fb = NSFontManager.sharedFontManager().convertFont_toHaveTrait_(f, NSFontBoldTrait)
        if fb: f = fb
    return f

def render(text, font_name, size, max_width, color=(255, 255, 255), bold=True, line_height=1.25):
    """Returns an RGBA PIL image (2× supersampled then downscaled for crisp edges) of the wrapped text."""
    scale = 2
    font = _font(font_name, size * scale, bold)
    para = NSMutableParagraphStyle.alloc().init(); para.setLineHeightMultiple_(line_height)
    attrs = {NSFontAttributeName: font, NSForegroundColorAttributeName: NSColor.colorWithCalibratedRed_green_blue_alpha_(color[0]/255, color[1]/255, color[2]/255, 1.0), NSParagraphStyleAttributeName: para}
    s = NSAttributedString.alloc().initWithString_attributes_(text, attrs)
    W = int(max_width * scale)
    rect = s.boundingRectWithSize_options_(NSMakeSize(W, 100000), 1 | 2)   # usesLineFragmentOrigin | usesFontLeading
    H = int(rect.size.height) + int(size * scale * 0.6)
    rep = NSBitmapImageRep.alloc().initWithBitmapDataPlanes_pixelsWide_pixelsHigh_bitsPerSample_samplesPerPixel_hasAlpha_isPlanar_colorSpaceName_bytesPerRow_bitsPerPixel_(None, W, H, 8, 4, True, False, NSCalibratedRGBColorSpace, 0, 0)
    ctx = NSGraphicsContext.graphicsContextWithBitmapImageRep_(rep)
    NSGraphicsContext.saveGraphicsState(); NSGraphicsContext.setCurrentContext_(ctx)
    s.drawWithRect_options_(NSMakeRect(0, 0, W, H), 1 | 2)
    NSGraphicsContext.restoreGraphicsState()
    png = rep.representationUsingType_properties_(NSPNGFileType, None)
    img = Image.open(io.BytesIO(bytes(png))).convert('RGBA')
    bbox = img.getbbox()
    if bbox: img = img.crop((0, bbox[1], bbox[2], bbox[3]))   # keep x=0 so left alignment is preserved
    return img.resize((img.width // scale, img.height // scale), Image.LANCZOS)

if __name__ == '__main__':
    import sys
    for lang, txt in [('hi', 'मोबाइल नंबर की 10 पोज़ीशन का अर्थ — हर अंक क्या नियंत्रित करता है'), ('ta', 'மொபைல் எண் கணிதம்: 10 இடங்களின் அர்த்தம்'), ('gu', 'મોબાઇલ નંબરની 10 પોઝિશનનો અર્થ')]:
        im = render(txt, FONT_FOR_LANG[lang], 58, 640); bg = Image.new('RGB', (im.width + 40, im.height + 40), '#222'); bg.paste(im, (20, 20), im); bg.save(f'/private/tmp/claude-501/-Users-deepammishra-numerology/f9a3e5bf-2136-4404-a0ed-05169daaa07f/scratchpad/native-{lang}.png')
    print('ok')
