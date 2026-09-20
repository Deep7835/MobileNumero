# -*- coding: utf-8 -*-
"""Standalone calculator pages: specs consumed by build.py (tool_pages)."""

def _rows(rows): return ''.join('<tr>' + ''.join(f'<td>{c}</td>' for c in r) + '</tr>' for r in rows)

TOOLS = [
 dict(slug='life-path-number', tool='life-path', icon='🧭', name='Life Path Number', short='Your Destiny number from your full date of birth',
      title='Life Path Number Calculator — Find Your Destiny Number by Date of Birth',
      meta='Free Life Path (Destiny) Number calculator. Enter your date of birth to get your Life Path and Birth numbers, ruling planet, strengths, careers and compatible numbers.',
      img=dict(a='#1e1b4b', b='#8b7bff', glyph='9', label='Life Path'),
      form='<div class="field"><label for="dob">Date of birth</label><input id="dob" type="date" required min="1900-01-01" /></div><button class="btn" type="submit">Calculate my Life Path</button>',
      intro='Your <strong>Life Path number</strong> (called the Destiny number or Bhagyank in Indian numerology) is the single most important number in your chart. It is calculated from your complete date of birth and describes the direction your life tends to take, the lessons you meet and the opportunities that come to you.',
      body='<h2>How the Life Path number is calculated</h2>'
           '<p>Add every digit of your full date of birth and reduce to a single digit. For 29 November 1994: 2 + 9 + 1 + 1 + 1 + 9 + 9 + 4 = 36 → 3 + 6 = <strong>9</strong>. If an intermediate total is 11, 22 or 33 it is a <em>master number</em>; the calculator shows it, but in the Chaldean system used across this site it is still reduced (11 → 2, 22 → 4, 33 → 6).</p>'
           '<h2>Life Path vs Birth number</h2>'
           '<p>The <strong>Birth number</strong> (Mulank) uses only the day of the month and describes your temperament. The <strong>Life Path / Destiny number</strong> uses the whole date and describes your direction. Both are shown above; a good mobile number, PIN or name total should be friendly to both — see the <a href="../blog/friendly-and-enemy-numbers-numerology-chart.html">friendly and enemy numbers chart</a>.</p>'
           '<h2>The nine Life Paths</h2><table><tr><th>Number</th><th>Planet</th><th>Archetype</th></tr>' + _rows([('<b>1</b>','Sun','The Leader'),('<b>2</b>','Moon','The Diplomat'),('<b>3</b>','Jupiter','The Communicator'),('<b>4</b>','Rahu','The Builder'),('<b>5</b>','Mercury','The Freedom Seeker'),('<b>6</b>','Venus','The Nurturer'),('<b>7</b>','Ketu','The Seeker'),('<b>8</b>','Saturn','The Executive'),('<b>9</b>','Mars','The Humanitarian')]) + '</table>',
      faqs=[('Is the Life Path number the same as the Destiny number?', 'Yes. Western numerology calls it the Life Path number; Indian (Chaldean/Vedic) numerology calls it the Destiny number or Bhagyank. Both add every digit of the full date of birth.'),
            ('What if my total is 11, 22 or 33?', "These are master numbers with an extra layer of meaning (intuition, building, teaching). The calculator flags them. In this site's system they are still reduced to 2, 4 and 6 for compatibility checks."),
            ('Can my Life Path number change?', 'No. It is fixed by your date of birth. What you can change is the numbers around you — mobile number, PIN, name spelling — to be friendly to it.')]),

 dict(slug='name-numerology', tool='name', icon='👤', name='Name Numerology', short='Chaldean & Pythagorean value of any name',
      title='Name Numerology Calculator — Chaldean & Pythagorean Name Number',
      meta='Free name numerology calculator. Get the Chaldean or Pythagorean number of your full name and first name, its meaning, and whether it is friendly to your date of birth.',
      img=dict(a='#0f172a', b='#fbbf24', glyph='Aa', label='Name number'),
      form='<div class="field"><label for="name">Full name (as commonly used)</label><input id="name" type="text" placeholder="e.g. Priya Sharma" maxlength="60" required autocomplete="name" /></div>'
           '<div class="row"><div class="field"><label for="system">System</label><select id="system"><option value="chaldean">Chaldean (1–8)</option><option value="pythagorean">Pythagorean (1–9)</option></select></div><div class="field"><label for="dob">Date of birth <span class="muted">(optional, for compatibility)</span></label><input id="dob" type="date" min="1900-01-01" /></div></div>'
           '<button class="btn" type="submit">Calculate name number</button>',
      intro='Every letter carries a number. Your <strong>name number</strong> is the reduced total of those values and describes how the world sees you and what your name attracts. Indian numerologists use the <strong>Chaldean</strong> system (values 1–8, based on sound); Western numerologists use <strong>Pythagorean</strong> (A=1 … I=9, repeating). This calculator gives both.',
      body='<h2>Chaldean letter values</h2><table><tr><th>Value</th><th>Letters</th></tr>' + _rows([(1,'A I J Q Y'),(2,'B K R'),(3,'C G L S'),(4,'D M T'),(5,'E H N X'),(6,'U V W'),(7,'O Z'),(8,'F P')]) + '</table>'
           '<h2>Pythagorean letter values</h2><table><tr><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th></tr><tr><td>A J S</td><td>B K T</td><td>C L U</td><td>D M V</td><td>E N W</td><td>F O X</td><td>G P Y</td><td>H Q Z</td><td>I R</td></tr></table>'
           '<h2>Should the name number match your date of birth?</h2>'
           '<p>Ideally the name number is <em>friendly</em> to both your Birth and Destiny numbers. If it is an enemy of either, numerologists sometimes suggest a small spelling change — adding or dropping a letter — to shift the total. Enter your date of birth above and the calculator checks this for you. The same letter values are used for <a href="../blog/chaldean-numerology-password-guide.html">choosing a password</a>.</p>',
      faqs=[('Which name should I enter — official or nickname?', 'The name you actually use and hear every day. Many numerologists analyse the commonly used name rather than the one on documents, because that is the vibration you live with.'),
            ('Chaldean or Pythagorean — which is right?', 'Neither is "wrong"; they are different traditions. Indian mobile and name numerology (including this site) uses Chaldean. Use Pythagorean if you follow Western numerology.'),
            ('Does changing my name spelling really change anything?', 'Numerology holds that the vibration changes with the spelling. Changing a signature or the spelling on social profiles is a low-risk way to try it; legal name changes are a bigger decision.')]),

 dict(slug='compatibility', tool='compatibility', icon='💞', name='Compatibility', short='Two dates of birth → relationship score',
      title='Numerology Compatibility Calculator — Love & Partnership by Date of Birth',
      meta='Free numerology compatibility calculator. Enter two dates of birth to get a 0–100 compatibility score based on Birth and Destiny numbers, with friendly, enemy and shared balancer numbers.',
      img=dict(a='#4a044e', b='#f9a8d4', glyph='♥', label='Compatibility'),
      form='<div class="row"><div class="field"><label for="nameA">Person A (name, optional)</label><input id="nameA" type="text" maxlength="40" placeholder="Name" /></div><div class="field"><label for="dobA">Date of birth A</label><input id="dobA" type="date" required min="1900-01-01" /></div></div>'
           '<div class="row"><div class="field"><label for="nameB">Person B (name, optional)</label><input id="nameB" type="text" maxlength="40" placeholder="Name" /></div><div class="field"><label for="dobB">Date of birth B</label><input id="dobB" type="date" required min="1900-01-01" /></div></div>'
           '<button class="btn" type="submit">Check compatibility</button>',
      intro='Numerology compatibility compares the <strong>Birth numbers</strong> (temperament) and <strong>Destiny numbers</strong> (life direction) of two people using the friendly / enemy chart. It works for couples, business partners, parent and child, or any two people who share a life.',
      body='<h2>How the score is built</h2><table><tr><th>Pairing</th><th>What it shows</th><th>Weight</th></tr>' + _rows([('Birth ↔ Birth','Day-to-day temperament and chemistry','40%'),('Destiny ↔ Destiny','Whether your life directions align','30%'),("A's Birth ↔ B's Destiny","How A's nature supports B's path",'15%'),("B's Birth ↔ A's Destiny","How B's nature supports A's path",'15%')]) + '</table>'
           '<p>Each pairing is read in both directions from the <a href="../blog/friendly-and-enemy-numbers-numerology-chart.html">compatibility chart</a> (some relationships are one-sided — 9 is friendly to 2, but 2 treats 9 as an enemy) and averaged: friendly = full marks, neutral = half, enemy = none.</p>'
           '<h2>What a low score means</h2>'
           '<p>Not that the relationship is doomed. Enemy numbers describe <em>friction in style</em>, not fate — a Sun (1) with a Saturn (8), for example, is a leader paired with a patient builder. Knowing where the friction lives lets you compensate: shared balancer numbers (friendly to both charts) can be used for a joint mobile number, PIN, house or car number.</p>',
      faqs=[('Is this calculator only for romantic partners?', 'No. The same Birth/Destiny logic applies to business partners, siblings, friends and parent–child relationships.'),
            ('Which number matters most?', 'The Birth-number pairing (40%) — it reflects everyday temperament, which is where most friction or ease is felt.'),
            ('Can we improve a low score?', 'Your dates cannot change, but you can surround the relationship with shared balancer numbers — a joint phone number, PIN or house number whose total is friendly to both of you.')]),

 dict(slug='personal-year', tool='personal-year', icon='📅', name='Personal Year', short='Where you are in your 9-year cycle',
      title='Personal Year Number Calculator — Your Numerology Forecast for This Year',
      meta='Free Personal Year calculator. Find your current Personal Year, Month and Day numbers from your date of birth and see the theme, focus and pitfalls of this stage of your 9-year cycle.',
      img=dict(a='#7c2d12', b='#fb923c', glyph='📅', label='Personal Year'),
      form='<div class="row"><div class="field"><label for="dob">Date of birth</label><input id="dob" type="date" required min="1900-01-01" /></div><div class="field"><label for="on">For date <span class="muted">(defaults to today)</span></label><input id="on" type="date" /></div></div><button class="btn" type="submit">Find my Personal Year</button>',
      intro='Numerology sees life as repeating <strong>nine-year cycles</strong>. Each year has a number from 1 (new beginnings) to 9 (completion), and the theme changes on your birthday. Knowing your Personal Year tells you whether this is a year to start, build, expand, rest or let go.',
      body='<h2>How it is calculated</h2>'
           '<p>Add your birth day + birth month + the current year (the year of your most recent birthday), then reduce. Born 29 November, in September 2026 the last birthday was in 2025: 2+9 + 1+1 + 2+0+2+5 = 22 → <strong>4</strong>. The Personal Month adds the calendar month to the Personal Year; the Personal Day adds the date to the Personal Month.</p>'
           '<h2>The nine-year cycle</h2><table><tr><th>Year</th><th>Theme</th></tr>' + _rows([('<b>1</b>','New beginnings — plant seeds'),('<b>2</b>','Patience & partnership'),('<b>3</b>','Expression & growth'),('<b>4</b>','Work & foundations'),('<b>5</b>','Change & freedom'),('<b>6</b>','Home & responsibility'),('<b>7</b>','Reflection & study'),('<b>8</b>','Power & harvest'),('<b>9</b>','Completion & release')]) + '</table>'
           '<h2>Using it with the rest of your chart</h2>'
           '<p>A Personal Year 1 or 8 is a good time to change a mobile number or launch a business; a 4 is for putting finances and routines in order; a 9 is for closing chapters. Pair it with your <a href="life-path-number.html">Life Path number</a> to see the long-term direction the year sits inside.</p>',
      faqs=[('When does my Personal Year change?', 'On your birthday, not on 1 January. This calculator handles that automatically: before your birthday the previous calendar year is used.'),
            ('Is a Personal Year 9 bad?', 'No — it is a year of completion. It is a poor time to start big new things, but an excellent one to finish, declutter and forgive, which sets up a strong Year 1.'),
            ('What are Personal Month and Day?', 'Finer subdivisions of the same cycle: Personal Year + calendar month = Personal Month; Personal Month + date = Personal Day. Use them for timing decisions within the year.')]),

 dict(slug='lo-shu-grid', tool='lo-shu', icon='⊞', name='Lo Shu Grid', short='Present, missing & repeated numbers',
      title='Lo Shu Grid Calculator — Missing Numbers, Repeated Numbers & Planes',
      meta='Free Lo Shu grid calculator. Enter your date of birth to draw your 3×3 numerology grid, see present, missing and repeated numbers, completed planes, and PINs that add the missing energies.',
      img=dict(a='#1e293b', b='#4fd1c5', glyph='⊞', label='Lo Shu grid'),
      form='<div class="field"><label for="dob">Date of birth</label><input id="dob" type="date" required min="1900-01-01" /></div><button class="btn" type="submit">Draw my Lo Shu grid</button>',
      intro='The <strong>Lo Shu grid</strong> maps the digits of your date of birth into a 3×3 magic square. Filled boxes show energies you were born with, empty boxes show <strong>missing numbers</strong> to add through your PIN and password, and complete lines (<strong>planes</strong>) reveal concentrated strengths.',
      body='<h2>How the grid is filled</h2>'
           '<p>Every non-zero digit of the date goes into its box (4-9-2 / 3-5-7 / 8-1-6). If the day has two digits, the reduced Birth number is added; the Destiny number is always added. Repeated digits appear more than once — read the <a href="../blog/lo-shu-grid-missing-numbers-explained.html">full Lo Shu guide</a>.</p>'
           '<h2>The eight planes</h2><table><tr><th>Plane</th><th>Cells</th><th>Complete = </th></tr>' + _rows([('Mental','4-9-2','Memory, thinking, analysis'),('Emotional','3-5-7','Balance, sensitivity, spirituality'),('Practical','8-1-6','Turning ideas into results'),('Thought','4-3-8','Orderly, methodical mind'),('Will','9-5-1','Determination'),('Action','2-7-6','Getting things done'),('Determination','4-5-6','Persistence'),('Spiritual','2-5-8','Compassion, intuition')]) + '</table>'
           '<h2>What to do with missing numbers</h2>'
           '<p>Put them in your <a href="../blog/how-to-choose-lucky-pin-code-numerology.html">PIN</a> and choose a password whose Chaldean total supplies the same energy. The calculator suggests PINs whose total is friendly to both your Birth and Destiny numbers.</p>',
      faqs=[('Do I include zeros?', 'No — there is no box for 0, so zeros in the day, month or year are skipped.'),
            ('Is it bad to have many missing numbers?', 'It is common; most people are missing three to five. Missing numbers show where conscious effort is needed, and they can be supplied through your PIN, password and surroundings.'),
            ('What does a full plane mean?', 'All three numbers of a line are present, indicating a concentrated strength — for example the Mental plane 4-9-2 shows strong memory and analysis.')]),
]
