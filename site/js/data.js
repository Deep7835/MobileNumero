/* =====================================================================
   DATA — extracted from the Advance Mobile Numerology Class PDFs
   (Dr. Isha Thakkar Numerology). All rules below are data-driven so
   they can be edited without touching the algorithm.
   ===================================================================== */

const DATA = {
  /* ---------- PDF 9: Websites to buy a number ---------- */
  websites: [
    { name: 'numberwale.com',      url: 'https://numberwale.com' },
    { name: 'numberspoint.com',    url: 'https://numberspoint.com' },
    { name: 'vipnumbershop.com',   url: 'https://vipnumbershop.com' },
    { name: 'phone.com',           url: 'https://www.phone.com/' },
    { name: 'myvi.in',             url: 'https://www.myvi.in' },
    { name: 'jio.com',             url: 'https://www.jio.com' },
    { name: 'airtel.in',           url: 'https://www.airtel.in' },
    { name: 'vipfancynumber.com',  url: 'https://vipfancynumber.com' },
    { name: 'fancywala.in',        url: 'https://fancywala.in' },
    { name: 'lifetimenumber.com',  url: 'https://www.lifetimenumber.com' },
  ],

  /* ---------- PDF 9: What each position of a 10-digit number governs ---------- */
  positions: {
    1:  { title: 'Attitude',          desc: 'How you start things in life' },
    2:  { title: 'Decision making',   desc: 'Positivity & negativity in life' },
    3:  { title: 'Health',            desc: 'Prolonged illness' },
    4:  { title: 'Partnership',       desc: 'Business & personal partnerships' },
    5:  { title: 'Kids',              desc: 'Children & conception' },
    6:  { title: 'Marriage',          desc: 'Marriage prospects' },
    7:  { title: 'Married life',      desc: 'Harmony after marriage' },
    8:  { title: 'Career & health',   desc: 'Profession and physical wellbeing' },
    9:  { title: 'Public relations',  desc: 'Reputation, network, wealth' },
    10: { title: 'Wealth / gains',    desc: 'Money flow and gains' },
  },

  /* ---------- PDF 9: Digit-at-position rules ----------
     type: 'bad' | 'good'   weight: how strongly it affects the score
     tags let the analyzer surface "for whom" it matters. */
  digitRules: [
    // 0
    { digit: 0, positions: [5, 6],     type: 'bad',  weight: 8,  text: 'Difficulty with baby conception', tags: ['family'] },
    { digit: 0, positions: [8, 9, 10], type: 'bad',  weight: 10, text: 'Serious health issues, mainly stomach related', tags: ['health'] },
    { digit: 0, positions: [9, 10],    type: 'bad',  weight: 6,  text: 'Weakens thinking ability — avoid for media, doctors, writers, thinkers, scientists', tags: ['career'] },
    // 1
    { digit: 1, positions: [6, 7, 8, 9, 10], type: 'bad', weight: 7, text: 'Loan related problems', tags: ['money'] },
    { digit: 1, positions: [10],       type: 'bad',  weight: 4,  text: 'Avoid for people in politics', tags: ['career'] },
    { digit: 1, positions: [9, 10],    type: 'bad',  weight: 6,  text: 'Partnership issues', tags: ['relationship', 'business'] },
    // 2
    { digit: 2, positions: [5, 6],     type: 'bad',  weight: 9,  text: 'Depression tendency', tags: ['health'] },
    { digit: 2, positions: [5, 6, 7],  type: 'bad',  weight: 6,  text: 'Difficulty taking decisions', tags: ['mind'] },
    { digit: 2, positions: [2, 8],     type: 'bad',  weight: 7,  text: 'Asthma, eye issues, stress, headache or cough', tags: ['health'] },
    { digit: 2, positions: [1, 3],     type: 'good', weight: 5,  text: '2 is at its best here', tags: [] },
    // 3
    { digit: 3, positions: [5, 6],     type: 'bad',  weight: 6,  text: 'Throat related health issues', tags: ['health'] },
    { digit: 3, positions: [9, 10],    type: 'good', weight: 6,  text: 'Brings opportunity & confidence', tags: ['career'] },
    // 4
    { digit: 4, positions: [6],        type: 'bad',  weight: 9,  text: 'Depression tendency', tags: ['health'] },
    { digit: 4, positions: [1,2,3,4,5,6,7,8,9,10], type: 'bad', weight: 4, text: 'Number 4 should be avoided in a mobile number', tags: ['general'] },
    // 5
    { digit: 5, positions: [8, 9, 10], type: 'good', weight: 7,  text: 'Career success and fame', tags: ['career'] },
    { digit: 5, positions: [6, 7],     type: 'bad',  weight: 8,  text: 'Marital issues', tags: ['relationship'] },
    { digit: 5, positions: [5],        type: 'bad',  weight: 7,  text: 'Child related issues', tags: ['family'] },
    // 6
    { digit: 6, positions: [5, 6],     type: 'bad',  weight: 7,  text: 'BP, skin or kidney health issues', tags: ['health'] },
    { digit: 6, positions: [7],        type: 'good', weight: 7,  text: 'Happy relationship', tags: ['relationship'] },
    { digit: 6, positions: [10],       type: 'good', weight: 7,  text: 'Excellent for money', tags: ['money'] },
    { digit: 6, positions: [8],        type: 'good', weight: 5,  text: 'Great for writers, singers, filmmakers', tags: ['career'] },
    // 7
    { digit: 7, positions: [6],        type: 'bad',  weight: 8,  text: 'Marriage life issues', tags: ['relationship'] },
    { digit: 7, positions: [7],        type: 'bad',  weight: 12, text: 'May cause divorce and financial loss', tags: ['relationship', 'money'] },
    { digit: 7, positions: [9, 10],    type: 'good', weight: 6,  text: '7 is at its best here', tags: [] },
    { digit: 7, positions: [8],        type: 'bad',  weight: 6,  text: 'Back problems, arthritis', tags: ['health'] },
    // 8
    { digit: 8, positions: [7],        type: 'bad',  weight: 12, text: 'Divorce tendency', tags: ['relationship'] },
    { digit: 8, positions: [10],       type: 'bad',  weight: 12, text: 'Financial loss and debt — never keep 8 as the last digit', tags: ['money'] },
    // 9
    { digit: 9, positions: [6, 7],     type: 'bad',  weight: 8,  text: 'Aggression between couples', tags: ['relationship'] },
    { digit: 9, positions: [1, 8, 9],  type: 'good', weight: 6,  text: '9 is at its best here', tags: [] },
  ],

  /* Pattern rules on the full number */
  patternRules: [
    { test: n => /000$/.test(n),            type: 'bad',  weight: 10, text: 'Ends with 000 — business loss indicated' },
    { test: n => /00$/.test(n),             type: 'bad',  weight: 5,  text: 'Ends with 00 — check for business/money leakage' },
    { test: n => /555$/.test(n),            type: 'good', weight: 10, text: 'Ends with 555 — one of the best endings' },
    { test: n => /55$/.test(n) && !/555$/.test(n), type: 'good', weight: 7, text: 'Ends with 55 — very favourable ending' },
  ],

  /* ---------- Standard Chaldean / Lo-Shu compatibility chart ----------
     (The PDFs refer to "friendly numbers"; this is the widely used chart.) */
  friendly: {
    1: { friends: [1, 2, 3, 5, 6, 9], enemies: [8],             neutral: [4, 7] },
    2: { friends: [1, 3, 5],          enemies: [4, 8, 9],       neutral: [2, 6, 7] },
    3: { friends: [1, 2, 3, 5],       enemies: [6],             neutral: [4, 7, 8, 9] },
    4: { friends: [1, 5, 6, 7],       enemies: [2, 4, 8, 9],    neutral: [3] },
    5: { friends: [1, 2, 3, 5, 6],    enemies: [],              neutral: [4, 7, 8, 9] },
    6: { friends: [1, 5, 6, 7],       enemies: [3],             neutral: [2, 4, 8, 9] },
    7: { friends: [1, 3, 4, 5, 6],    enemies: [2],             neutral: [7, 8, 9] },
    8: { friends: [3, 5, 6, 7],       enemies: [1, 2, 4, 8, 9], neutral: [] },
    9: { friends: [1, 2, 3, 5, 6],    enemies: [4, 8],          neutral: [7, 9] },
  },

  /* Planet & core meaning of each number (used in the profile header) */
  numbers: {
    1: { planet: 'Sun',     keyword: 'Leadership, authority, originality' },
    2: { planet: 'Moon',    keyword: 'Emotion, intuition, partnership' },
    3: { planet: 'Jupiter', keyword: 'Wisdom, knowledge, expansion' },
    4: { planet: 'Rahu',    keyword: 'Discipline, unconventional, sudden change' },
    5: { planet: 'Mercury', keyword: 'Communication, business, freedom' },
    6: { planet: 'Venus',   keyword: 'Love, luxury, family, beauty' },
    7: { planet: 'Ketu',    keyword: 'Spirituality, research, detachment' },
    8: { planet: 'Saturn',  keyword: 'Karma, hard work, justice' },
    9: { planet: 'Mars',    keyword: 'Energy, courage, action' },
  },

  /* ---------- PDF 10: Wallpaper by BN / DN ---------- */
  wallpapers: {
    1: { items: ['Rising sun', 'Sun with rays', 'Photo of you with your father'], colors: ['Yellow', 'Orange'], palette: ['#F6B21B', '#F26A1B'] },
    2: { items: ['Full moon scattering light', 'Buddha in meditation', 'Twin birds or twin leaves', "Couple's picture", 'Photo with your mother'], colors: ['White', 'Silver'], palette: ['#F5F5F5', '#C0C4CC'] },
    3: { items: ['Blooming yellow flowers', 'Picture of your Guru', 'Maa Saraswati', 'Library picture'], colors: ['Yellow', 'Orange', 'Golden'], palette: ['#FFC107', '#F57C00', '#D4AF37'] },
    4: { items: ['Common friendly-number wallpaper (e.g. a bold 1)', 'Mountains (without snow)', 'Picture with grandmother / grandfather'], colors: ['Light blue'], palette: ['#4FC3F7'] },
    5: { items: ['Greenery', 'Rock crystals', 'Snow-covered mountains'], colors: ['Light green'], palette: ['#9CCC65'] },
    6: { items: ['Luxury items', 'Lakshmi ji giving money', 'Chimes in metallic shade', 'Currency and diamonds', 'Picture with spouse or family'], colors: ['Blue'], palette: ['#1A1AB8'] },
    7: { items: ['Airplane taking off', 'Something spiritual — saint / sage', 'Buddha in meditative state', 'Seashore / beach / snowy mountain top'], colors: ['Light green', 'White'], palette: ['#A5E8A0', '#F4F4F4'] },
    8: { items: ['Beautiful village', 'Smooth road with greenery', 'High-rise building'], colors: ['Dark blue'], palette: ['#1A237E'] },
    9: { items: ['Blooming red flowers', 'Hanuman ji', 'Red rose (blooming)', 'Army related picture'], colors: ['Red'], palette: ['#E53935'] },
  },

  /* ---------- PDF 11: PIN codes ---------- */
  pinRules: [
    'Use your missing numbers (from the Lo Shu grid) inside the PIN.',
    'The total of the PIN should be a friendly number for you.',
    'Include your lucky / money number in the total of the PIN.',
    'Balancer number: a number that is friendly to both your Birth and Destiny number.',
    'The effect of a changed PIN or password is generally seen in about 45 days.',
  ],
  pins: [
    { purpose: 'Good married life',    pin: '5666',  total: 5 },
    { purpose: 'Good married life',    pin: '5667',  total: 6 },
    { purpose: 'Good married life',    pin: '2577',  total: 3 },
    { purpose: 'Education',            pin: '6555',  total: 3 },
    { purpose: 'Education',            pin: '3767',  total: 7 },
    { purpose: 'Foreign travel',       pin: '6357',  total: 3 },
    { purpose: 'Foreign travel',       pin: '1113',  total: 6 },
    { purpose: 'Foreign travel',       pin: '3759',  total: 6 },
    { purpose: 'Senior citizenship',   pin: '3759',  total: 6 },
    { purpose: 'Children',             pin: '3337',  total: 7 },
    { purpose: 'Good health',          pin: '3569',  total: 5 },
    { purpose: 'Relationships',        pin: '6357',  total: 3 },
    { purpose: 'Love life',            pin: '6775',  total: 7 },
    { purpose: 'Love life',            pin: '1266',  total: 6 },
    { purpose: 'Promotion',            pin: '4368',  total: 3 },
    { purpose: 'Luck factor',          pin: '4566',  total: 3 },
    { purpose: 'Determination',        pin: '12358', total: 1 },
    { purpose: 'Intellect',            pin: '2469',  total: 3 },
    { purpose: 'Will power',           pin: '1149',  total: 6 },
    { purpose: 'Prosperity',           pin: '1668',  total: 3 },
    { purpose: 'Baby / child',         pin: '3666',  total: 3 },
    { purpose: 'Baby / child',         pin: '6666',  total: 6 },
    { purpose: 'Baby / child',         pin: '4777',  total: 7 },
    { purpose: 'Baby / child',         pin: '1489',  total: 4 },
    { purpose: 'Money attraction',     pin: '13467', total: 3 },
    { purpose: 'Business growth',      pin: '1569',  total: 3 },
    { purpose: 'Business growth',      pin: '5559',  total: 3 },
    { purpose: 'Harmony',              pin: '1247',  total: 5 },
    { purpose: 'Harmony',              pin: '3569',  total: 5 },
    { purpose: 'Harmony',              pin: '2557',  total: 1 },
    { purpose: 'Harmony',              pin: '1455',  total: 6 },
    { purpose: 'Peace of mind',        pin: '4456',  total: 3 },
    { purpose: 'Peace of mind',        pin: '5151',  total: 3 },
    { purpose: 'Property',             pin: '2588',  total: 5 },
    { purpose: 'Luxury',               pin: '5667',  total: 6 },
    { purpose: 'Construction of house',pin: '4568',  total: 5 },
    { purpose: 'Court case',           pin: '4488',  total: 6 },
    { purpose: 'Government job',       pin: '11458', total: 1 },
    { purpose: 'Meditation',           pin: '2377',  total: 1 },
    { purpose: 'Meditation',           pin: '2577',  total: 3 },
  ],

  /* ---------- PDF 11: Chaldean alphabet ---------- */
  chaldean: {
    A: 1, I: 1, J: 1, Q: 1, Y: 1,
    B: 2, K: 2, R: 2,
    C: 3, G: 3, L: 3, S: 3,
    D: 4, M: 4, T: 4,
    E: 5, H: 5, N: 5, X: 5,
    U: 6, V: 6, W: 6,
    O: 7, Z: 7,
    F: 8, P: 8,
  },
  passwordRules: [
    'Mobile passwords may use 4–16 characters.',
    'Choose a word whose Chaldean total matches your life purpose.',
    'If your Birth or Destiny number is 8, avoid a password whose total is 8.',
    'The effect of a changed password is generally seen in about 45 days.',
  ],
  passwords: {
    1: { purpose: 'Name & fame, leadership',            examples: ['GURUJI', 'TILK', 'RAIIN'] },
    2: { purpose: 'Intuition, emotions',                examples: ['SAIBABA', 'MANGO', 'PAPAYA'] },
    3: { purpose: 'Education, research work',           examples: ['RHYTHM', 'REDROSE'] },
    4: { purpose: 'Court cases',                        examples: ['GRAPES', 'MOUSUMI'] },
    5: { purpose: 'Communication and money flow',       examples: ['LAXMI', 'LOTUS', 'NEELAM'] },
    6: { purpose: 'Marriage, children, foreign travel', examples: ['GANESHJI', 'BANANA'] },
    7: { purpose: 'Research, occult science',           examples: ['APPLE', 'LIGHT'] },
    8: { purpose: 'Property, court case',               examples: ['PINEAPPLE', 'ROSE', 'DATES'] },
    9: { purpose: 'Energy, restaurant business, sports',examples: ['HANUMAN', 'VISHNU'] },
  },

  /* ---------- PDF 12: Mobile covers ---------- */
  covers: [
    { id: 'silicone', name: 'Silicone / Gel / TPU', icon: '🫧', bestFor: [2, 3, 6, 7], idealFor: 'Artists, empaths, teachers, healers',
      traits: ['Friendly & open — easily trusts and shares', 'Emotionally soft — feels deeply, gets hurt quickly', 'Highly flexible — adapts in relationships', 'Needs push — depends on others for motivation', 'Clingy in love — can become emotionally dependent', "Won't break easily — inner strength", 'Cares about looks and social image', 'Protective, loyal partner'] },
    { id: 'plastic', name: 'Plastic', icon: '🧊', bestFor: [4, 5, 6, 8], idealFor: 'Calm, peace-loving people', tip: 'Keep pink or blue shades to open emotional flow.',
      traits: ['Emotionally guarded due to past hurt', 'Loyal & reliable once committed', 'Takes time to trust', 'Not easily provoked — calm under pressure', 'Simple mindset — values peace over materialism'] },
    { id: 'metal', name: 'Metal', icon: '⚙️', bestFor: [1, 8, 9], idealFor: 'Career-driven, goal-oriented people', tip: 'Red or gold tones energise motivation positively.',
      traits: ['Strong & unshakable — a tough shell', 'Bold & assertive — speaks their mind', 'May appear cold but wants to feel safe', 'Need for control — adjusting is hard', 'Career-focused — work before emotions'] },
    { id: 'leather', name: 'Leather', icon: '👜', bestFor: [1, 4, 6, 8], idealFor: 'Business owners, decision-makers, public figures',
      traits: ['Classy & mature — timeless charm', 'Emotionally balanced — stability over drama', 'High standards in love — loyalty and depth', 'Natural leaders — responsible and grounded', 'Private & protective — few earn deep trust'] },
    { id: 'rubber', name: 'Rubber', icon: '🟣', bestFor: [2, 4, 6, 7], idealFor: 'Supportive listeners', tip: 'Use grounding crystals (e.g. Pyrite) with this cover.',
      traits: ['Soft yet strong — bends, not breaks', 'Highly adjustable — may lose self-identity', "Emotional absorber — soaks up others' energy", 'Supportive listener — people confide in them', 'Needs boundaries — should learn to say no'] },
    { id: 'hybrid', name: 'Hybrid / Military-grade Armour', icon: '🛡️', bestFor: [1, 4, 8, 9], idealFor: 'Leaders, security forces, lawyers, those needing strength',
      traits: ['Strong outside, guarded inside', 'Emotionally reserved — rarely shows feelings', 'Highly protective — a shield in relationships', 'Disciplined & focused — hates chaos', 'Hard to approach — "don\'t mess with me" vibe', 'Reliable under pressure', 'Control lover — dislikes surprises'] },
    { id: 'hard', name: 'Hard & Tough', icon: '🧱', bestFor: [1, 4, 8], idealFor: 'Managers, elders, solo decision-makers, serious-minded people',
      traits: ["Emotionally strong — doesn't get hurt easily", 'Mentally unshakable in stressful times', "Private — doesn't express emotions openly", 'High self-control — rarely impulsive', 'Can be rigid — struggles with change', 'Reliable & steady, protective vibe'] },
    { id: 'flip', name: 'Flip / Wallet Case', icon: '📔', bestFor: [4, 6, 7, 8], idealFor: 'Teachers, advisors, consultants, introverts, caretakers',
      traits: ['Protective by nature — thinks one step ahead', 'Private & reserved — keeps emotions hidden', 'Caring yet cautious — takes time to trust', 'Old-school vibe — comfort and tradition', 'Organised thinker — plans well', 'Emotionally balanced — handles situations calmly', 'Detached look — may seem distant while caring deeply'] },
    { id: 'pouch', name: 'Pouch Case', icon: '👝', bestFor: [8], idealFor: 'Senior professionals, introverts, thinkers, spiritual seekers',
      traits: ['Extra cautious — avoids risks', "Highly protective — doesn't trust easily", "Old-school mindset — sticks to what's tested", 'Slow to open up', "Private & low-key — doesn't like attention", 'Expresses love through actions, not words', 'Secure but inward — self-preservation'] },
  ],

  /* ---------- PDF 12: Phone body colours ---------- */
  phoneColors: [
    { name: 'Black',       hex: '#1c1c1e', numbers: [8],    traits: ['Reserved, deep thinker, serious about goals', 'Likes solitude and personal space', 'Strong self-control & focus', 'May appear cold and emotionally distant', 'Great for discipline & long-term planning, but can cause delays or overthinking if overused'] },
    { name: 'Pink',        hex: '#f8bbd0', numbers: [6],    traits: ['Loving, kind-hearted and affectionate', 'Attracts attention, romance and emotional support', 'Values aesthetics, comfort and harmony', 'May avoid conflicts or be overly emotional', 'Ideal for beauty, fashion and healing work'] },
    { name: 'White',       hex: '#f5f5f7', numbers: [2],    traits: ['Gentle, spiritual, emotional and nurturing', 'Values beauty, peace and emotional safety', 'Soft-spoken, creative and intuitive', 'Can be overly sensitive or indecisive', 'Attracts harmony and helpful people, but needs grounding'] },
    { name: 'Grey / Silver', hex: '#b0b3b8', numbers: [2, 7], traits: ['Emotionally intelligent, highly reflective', 'Tech-friendly, smart, adaptable', 'Blends intellect and emotion well', 'Observant, detail-oriented, diplomatic', 'Can become moody or scattered if stressed'] },
    { name: 'Gold',        hex: '#d4af37', numbers: [1, 3], traits: ['Confident, ambitious and authoritative', 'Loves leadership, fame and recognition', 'Radiates charm and magnetism', 'May develop ego or pride if unchecked', 'Attracts success and visibility, but needs humility'] },
    { name: 'Blue',        hex: '#3a8dde', numbers: [3, 6], traits: ['Loyal, wise, teacher-like presence', 'Calm speaker, honest communicator', 'Natural mentor or counsellor vibe', 'Likes structure, principles and truth', 'Can become rigid or overly moralistic if imbalanced'] },
    { name: 'Red',         hex: '#e53935', numbers: [9],    traits: ['Fiery, bold, passionate, competitive', 'Action-oriented "go-getter" mindset', 'Impatient, easily frustrated under pressure', 'Takes quick decisions, sometimes without planning', 'Attracts fast results, but needs patience and direction'] },
    { name: 'Purple',      hex: '#8e6bd6', numbers: [7],    traits: ['Mystical, visionary, spiritual and creative', 'Strong imagination and inner world', 'Drawn to mysticism, art, healing or astrology', 'Can struggle with grounding and real-world action', 'Excellent for intuitive and creative fields'] },
    { name: 'Yellow',      hex: '#ffd54f', numbers: [1, 3], traits: ['Cheerful, inspiring, optimistic, natural guide', 'Loves to teach, coach and uplift others', 'High energy and idealism, seeks purpose', 'Can be naive or overly trusting', 'Attracts opportunities and wisdom — good for educators and seekers'] },
    { name: 'Green',       hex: '#66bb6a', numbers: [5],    traits: ['Youthful, curious, witty, expressive', 'Great communicator and fast learner', 'Loves new ideas, multitasking and socialising', 'May lack patience in long-term projects', 'Good for business-minded or marketing professionals'] },
  ],

  /* ---------- PDF 13: Affirmations, ringtones & mantras ---------- */
  affirmations: {
    1: { intro: 'To encourage the flow of 1 energy, before you pick up the phone say:', lines: ['Every positive action I take leads to greater and greater success.', 'I communicate with confidence & wisdom.'], ringtones: ['Powerful motivational speech', 'Drum beats'], mantra: 'Om Suryay Namah' },
    2: { intro: 'To encourage the flow of 2 energy, before you pick up the phone say:', lines: ['I am willing to let go of my past and take the next step towards a better future.', 'I speak with clarity and inner peace.'], ringtones: ['Soul flute music', 'Nature sounds'], mantra: 'Om Chandray Namah' },
    3: { intro: 'Before you pick up the phone, say the affirmation out loud or in your head:', lines: ['By eliminating interruptions and distractions, I easily maintain my focus and trust.', 'I attract wisdom and meaningful connection.'], ringtones: ['Temple bells', 'Classical music'], mantra: 'Om Brum Bruhaspatey Namah' },
    4: { intro: 'Stay relaxed and calm (despite roadblocks) with this affirmation:', lines: ['I accept and release everything in my life that is beyond my power to change.', 'I am grounded, stable, and attract positive changes.'], ringtones: ['Electronic beats', 'Meditative / soft tone'], mantra: 'Om Ram Rahvey Namah' },
    5: { intro: 'Before you pick up the call to get the ball rolling, think this:', lines: ["I can't do everything by myself. I accept the help of others who offer it on my journey to realising my goal.", 'I express myself clearly and attract prosperity.'], ringtones: ['Fast-paced beats', 'Uplifting tunes'], mantra: 'Om Bum Budhay Namah' },
    6: { intro: 'Use this affirmation:', lines: ['I will make effective use of my time. I will concentrate on talking to people who further my journey towards my goals.', 'I communicate with love and balance.'], ringtones: ['Romantic instrumental', 'Classical instrumental'], mantra: 'Om Shum Shukray Namah' },
    7: { intro: 'Use this affirmation before picking up:', lines: ['My day is a perfect balance of solo reflection, meaningful friendship, and resolute purpose.', 'I am connected, intuitive, and clear in my communication.'], ringtones: ['Cosmic sound', 'Tibetan bells'], mantra: 'Om Ketveye Namah' },
    8: { intro: 'Keep this affirmation in mind before picking up:', lines: ['There is no need to control. I trust that everything will happen as it is intended to.', 'Every call brings me progress and stability.'], ringtones: ['Deep chant', 'Slow meditation beats'], mantra: 'Om Shum Shaneshcharay Namah' },
    9: { intro: 'Keep this affirmation in mind before picking up:', lines: ['As I realise my current dream, I immediately start work on the next one. All I do supports the larger vision I have for my life.', 'I express myself with power and positivity.'], ringtones: ['Drum beats', 'High-energy instruments'], mantra: 'Om Am Angarakay Namah' },
  },

  /* Purposes offered in the form; maps to PIN purposes + password totals + rule tags */
  purposes: [
    { id: 'money',        label: 'Money & prosperity',    pinKeys: ['Money attraction', 'Prosperity', 'Luck factor', 'Business growth'], pwTotals: [5, 6, 3], tags: ['money'] },
    { id: 'career',       label: 'Career & promotion',    pinKeys: ['Promotion', 'Government job', 'Determination', 'Will power'], pwTotals: [1, 5, 3], tags: ['career'] },
    { id: 'business',     label: 'Business growth',       pinKeys: ['Business growth', 'Money attraction', 'Prosperity'], pwTotals: [5, 9, 1], tags: ['business', 'money'] },
    { id: 'relationship', label: 'Marriage & relationships', pinKeys: ['Good married life', 'Love life', 'Relationships', 'Harmony'], pwTotals: [6, 2], tags: ['relationship'] },
    { id: 'family',       label: 'Children & family',     pinKeys: ['Baby / child', 'Children', 'Harmony'], pwTotals: [6], tags: ['family'] },
    { id: 'health',       label: 'Health & peace',        pinKeys: ['Good health', 'Peace of mind', 'Meditation', 'Harmony'], pwTotals: [2, 7], tags: ['health', 'mind'] },
    { id: 'education',    label: 'Education & research',  pinKeys: ['Education', 'Intellect'], pwTotals: [3, 7], tags: ['career'] },
    { id: 'travel',       label: 'Foreign travel',        pinKeys: ['Foreign travel'], pwTotals: [6], tags: [] },
    { id: 'property',     label: 'Property & legal',      pinKeys: ['Property', 'Construction of house', 'Court case'], pwTotals: [8, 4], tags: ['money'] },
  ],
};
