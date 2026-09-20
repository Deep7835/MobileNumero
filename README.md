# NumberKundli

**Free mobile number numerology calculator** — live at **[numberkundli.com](https://numberkundli.com)**.

Enter a date of birth and a 10‑digit Indian mobile number to get your Birth and Destiny numbers, a position‑by‑position (1–10) reading of the number with a 0–100 score, lucky numbers, a PIN and password generator, and wallpaper, cover‑colour, ringtone and mantra suggestions — plus a downloadable PDF report. Available in English, Hindi, Marathi, Tamil and Gujarati.

- Analyser: <https://numberkundli.com/>
- Calculators (Life Path, Name, Compatibility, Personal Year, Lo Shu Grid): <https://numberkundli.com/tools/>
- Birth number guides 1–9: <https://numberkundli.com/numbers/>
- Blog: <https://numberkundli.com/blog/>
- About / author: <https://numberkundli.com/about>

Everything runs in the browser; nothing a visitor types is uploaded.

## How it's built

A static site — no framework, no backend.

| Path | What it is |
|---|---|
| `site/` | The deployable site (Cloudflare Workers serves this folder) |
| `site/js/numerology.js` | The rule engine: Birth/Destiny numbers, Lo Shu grid, 10‑position rules, scoring, friendly/enemy numbers, PIN and lucky‑number generators |
| `site/js/data.js` | Every rule as data, so the analyser, generators and PDF all agree |
| `site/js/lang/` | UI + content translations (en, hi, mr, ta, gu) |
| `tools/build.py` | Generates blog pages, calculators, birth‑number pages, hero images, favicons, sitemap, robots and `llms.txt` |
| `tools/posts*.py` | Blog content per language |
| `brand/` | Source artwork for the mark and logo lockup |

```bash
python3 tools/build.py          # rebuild everything under site/
python3 tools/check-links.py    # verify every internal link (fails on any .html link)
python3 tools/serve.py          # local dev server that mimics Cloudflare's clean-URL routing
python3 tools/indexnow.py       # push the sitemap's URLs to Bing/IndexNow after publishing
```

Requires Python 3 with Pillow and PyObjC (macOS, for Indic text in generated images).

## Author

Built and maintained independently by [Deepam Mishra](https://numberkundli.com/about). Numerology is a belief‑based practice; the site offers it for guidance and entertainment, not as medical, legal or financial advice.
