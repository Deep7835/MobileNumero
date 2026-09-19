#!/usr/bin/env python3
"""Build script: generates blog pages, blog index, hero images, favicon/OG images,
sitemap.xml and robots.txt into ../site. Run:  python3 tools/build.py"""
import os, re, json, html, datetime, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

sys.path.insert(0, str(Path(__file__).parent))
from posts import POSTS
from calculators import TOOLS
import importlib
try:
    import native_text
except Exception:
    native_text = None
LANGS = ['hi', 'mr', 'ta', 'gu']
TR = {}
for _l in LANGS:
    try: TR[_l] = importlib.import_module(f'posts_{_l}').POSTS
    except ModuleNotFoundError: TR[_l] = {}
FONT_CSS = {'hi': ("'Noto Sans Devanagari','Inter',sans-serif", "'Noto Sans Devanagari',serif"), 'mr': ("'Noto Sans Devanagari','Inter',sans-serif", "'Noto Sans Devanagari',serif"), 'ta': ("'Noto Sans Tamil','Inter',sans-serif", "'Noto Sans Tamil',serif"), 'gu': ("'Noto Sans Gujarati','Inter',sans-serif", "'Noto Sans Gujarati',serif")}
LOCALE = {'en': 'en_IN', 'hi': 'hi_IN', 'mr': 'mr_IN', 'ta': 'ta_IN', 'gu': 'gu_IN'}
LANG_NAME = {'en': 'English', 'hi': 'हिन्दी', 'mr': 'मराठी', 'ta': 'தமிழ்', 'gu': 'ગુજરાતી'}
FOOT_UI = {'en': {'f_tag': 'Free mobile numerology: analyse your number, find a lucky PIN and password, and get a PDF report in five languages.', 'f_explore': 'Explore', 'f_company': 'Company', 'f_social': 'Socials', 'f_news': 'Newsletter', 'f_newsText': 'New guides, lucky-number tips and tool updates. No spam, unsubscribe anytime.', 'f_email': 'Enter your email…', 'f_thanks': 'Thanks — you are on the list.', 'f_rights': 'All rights reserved', 'f_made': 'Built with care in India', 'f_cta_eye': 'Free personal report', 'f_cta_h': 'Get your mobile numerology report', 'f_cta_p': 'Birth & Destiny numbers, a position-by-position reading of your mobile number, lucky PIN, password, wallpaper and cover — compiled into a PDF you can keep.', 'f_cta_btn': 'Analyse my number', 'f_expert': 'Talk to an expert', 'f_home': 'Home', 'f_analyser': 'Mobile number analyser', 'viewall': 'View all', 'journal_eye': 'NumberKundli Journal', 'featured': 'Featured'}, 'hi': {'f_tag': 'मुफ़्त मोबाइल न्यूमरोलॉजी: अपना नंबर जाँचें, शुभ पिन और पासवर्ड पाएँ, और पाँच भाषाओं में PDF रिपोर्ट लें।', 'f_explore': 'खोजें', 'f_company': 'कंपनी', 'f_social': 'सोशल', 'f_news': 'न्यूज़लेटर', 'f_newsText': 'नई गाइड, शुभ-नंबर टिप्स और टूल अपडेट। कोई स्पैम नहीं, कभी भी अनसब्सक्राइब करें।', 'f_email': 'अपना ईमेल दर्ज करें…', 'f_thanks': 'धन्यवाद — आप सूची में हैं।', 'f_rights': 'सर्वाधिकार सुरक्षित', 'f_made': 'भारत में सावधानी से बनाया गया', 'f_cta_eye': 'मुफ़्त व्यक्तिगत रिपोर्ट', 'f_cta_h': 'अपनी मोबाइल न्यूमरोलॉजी रिपोर्ट पाएँ', 'f_cta_p': 'मूलांक और भाग्यांक, आपके मोबाइल नंबर की पोज़ीशन-दर-पोज़ीशन रीडिंग, शुभ पिन, पासवर्ड, वॉलपेपर और कवर — एक PDF में।', 'f_cta_btn': 'मेरा नंबर जाँचें', 'f_expert': 'विशेषज्ञ से बात करें', 'f_home': 'होम', 'f_analyser': 'मोबाइल नंबर विश्लेषक', 'viewall': 'सभी देखें', 'journal_eye': 'NumberKundli जर्नल', 'featured': 'विशेष'}, 'mr': {'f_tag': 'मोफत मोबाइल न्यूमरॉलॉजी: तुमचा नंबर तपासा, शुभ पिन व पासवर्ड मिळवा, आणि पाच भाषांत PDF अहवाल घ्या.', 'f_explore': 'शोधा', 'f_company': 'कंपनी', 'f_social': 'सोशल', 'f_news': 'न्यूजलेटर', 'f_newsText': 'नवीन मार्गदर्शक, शुभ-नंबर टिप्स आणि साधन अपडेट. स्पॅम नाही, कधीही अनसबस्क्राइब करा.', 'f_email': 'तुमचा ईमेल टाका…', 'f_thanks': 'धन्यवाद — तुम्ही यादीत आहात.', 'f_rights': 'सर्व हक्क राखीव', 'f_made': 'भारतात काळजीपूर्वक बनवले', 'f_cta_eye': 'मोफत वैयक्तिक अहवाल', 'f_cta_h': 'तुमचा मोबाइल न्यूमरॉलॉजी अहवाल मिळवा', 'f_cta_p': 'मूलांक व भाग्यांक, तुमच्या मोबाइल नंबरचे स्थाननिहाय वाचन, शुभ पिन, पासवर्ड, वॉलपेपर व कव्हर — एका PDF मध्ये.', 'f_cta_btn': 'माझा नंबर तपासा', 'f_expert': 'तज्ज्ञांशी बोला', 'f_home': 'होम', 'f_analyser': 'मोबाइल नंबर विश्लेषक', 'viewall': 'सर्व पहा', 'journal_eye': 'NumberKundli जर्नल', 'featured': 'खास'}, 'ta': {'f_tag': 'இலவச மொபைல் எண் கணிதம்: உங்கள் எண்ணை ஆய்வு செய்து, அதிர்ஷ்ட பின் மற்றும் கடவுச்சொல்லைக் கண்டறிந்து, ஐந்து மொழிகளில் PDF அறிக்கையைப் பெறுங்கள்.', 'f_explore': 'ஆராயுங்கள்', 'f_company': 'நிறுவனம்', 'f_social': 'சமூக ஊடகம்', 'f_news': 'செய்திமடல்', 'f_newsText': 'புதிய வழிகாட்டிகள், அதிர்ஷ்ட எண் குறிப்புகள் மற்றும் கருவி புதுப்பிப்புகள். ஸ்பேம் இல்லை, எப்போது வேண்டுமானாலும் விலகலாம்.', 'f_email': 'உங்கள் மின்னஞ்சலை உள்ளிடவும்…', 'f_thanks': 'நன்றி — நீங்கள் பட்டியலில் உள்ளீர்கள்.', 'f_rights': 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை', 'f_made': 'இந்தியாவில் அக்கறையுடன் உருவாக்கப்பட்டது', 'f_cta_eye': 'இலவச தனிப்பட்ட அறிக்கை', 'f_cta_h': 'உங்கள் மொபைல் எண் கணித அறிக்கையைப் பெறுங்கள்', 'f_cta_p': 'பிறப்பு & விதி எண்கள், உங்கள் மொபைல் எண்ணின் இடவாரியான வாசிப்பு, அதிர்ஷ்ட பின், கடவுச்சொல், வால்பேப்பர் மற்றும் கவர் — ஒரே PDF இல்.', 'f_cta_btn': 'என் எண்ணை ஆய்வு செய்', 'f_expert': 'நிபுணரிடம் பேசுங்கள்', 'f_home': 'முகப்பு', 'f_analyser': 'மொபைல் எண் ஆய்வாளர்', 'viewall': 'அனைத்தும்', 'journal_eye': 'NumberKundli இதழ்', 'featured': 'சிறப்பு'}, 'gu': {'f_tag': 'મફત મોબાઇલ ન્યુમરોલોજી: તમારો નંબર તપાસો, શુભ પિન અને પાસવર્ડ મેળવો, અને પાંચ ભાષામાં PDF રિપોર્ટ લો.', 'f_explore': 'શોધો', 'f_company': 'કંપની', 'f_social': 'સોશિયલ', 'f_news': 'ન્યૂઝલેટર', 'f_newsText': 'નવી માર્ગદર્શિકાઓ, શુભ-નંબર ટિપ્સ અને ટૂલ અપડેટ. સ્પામ નહીં, ગમે ત્યારે અનસબ્સ્ક્રાઇબ કરો.', 'f_email': 'તમારો ઇમેઇલ દાખલ કરો…', 'f_thanks': 'આભાર — તમે યાદીમાં છો.', 'f_rights': 'સર્વ હક્ક સુરક્ષિત', 'f_made': 'ભારતમાં કાળજીથી બનાવેલું', 'f_cta_eye': 'મફત વ્યક્તિગત રિપોર્ટ', 'f_cta_h': 'તમારો મોબાઇલ ન્યુમરોલોજી રિપોર્ટ મેળવો', 'f_cta_p': 'મૂળાંક અને ભાગ્યાંક, તમારા મોબાઇલ નંબરનું પોઝિશન-દર-પોઝિશન વાંચન, શુભ પિન, પાસવર્ડ, વૉલપેપર અને કવર — એક PDF માં.', 'f_cta_btn': 'મારો નંબર તપાસો', 'f_expert': 'નિષ્ણાત સાથે વાત કરો', 'f_home': 'હોમ', 'f_analyser': 'મોબાઇલ નંબર વિશ્લેષક', 'viewall': 'બધા જુઓ', 'journal_eye': 'NumberKundli જર્નલ', 'featured': 'ખાસ'}}
UI = {
 'en': dict(calc='Calculators', home='Home', blog='Blog', tools='Quick tools', buy='Buy a number', numbers='Birth numbers', free='Free analysis', skip='Skip to content', minread='{n} min read', by='By the NumberKundli Team', inthis='In this article', faq='Frequently asked questions', related='Related articles', blogtitle='NumberKundli Blog — Mobile Numerology Guides to Lucky Numbers, PINs & Passwords', blogdesc='Practical mobile numerology guides: what each digit position means, lucky number endings, Lo Shu grid, PIN and password rules, wallpaper, cover and colour by date of birth.', blogh1='Inside numerology: guides, rules and lucky numbers', blogintro='Practical guides drawn from the Advance Mobile Numerology Class: how to read every digit of your phone number, choose a lucky PIN and password, and align your wallpaper, cover and colour with your date of birth.', disclaimer='<strong>Disclaimer:</strong> Numerology is a belief-based practice offered for guidance and entertainment. It is not medical, legal or financial advice. Never share your real PIN or password with anyone — the calculators here run only in your browser.', credit='Content based on the <em>Advance Mobile Numerology Class</em> material by Dr. Isha Thakkar Numerology.', privacy='Privacy Policy', terms='Terms &amp; Conditions', sitemap='Sitemap', expert='Talk to an expert', cta='✨ Get my free analysis', readin='Read this article in', imgalt='{t} — illustration', dateloc='en_IN'),
 'hi': dict(calc='कैलकुलेटर', home='होम', blog='ब्लॉग', tools='त्वरित टूल', buy='नंबर खरीदें', numbers='मूलांक 1–9', free='मुफ़्त विश्लेषण', skip='सामग्री पर जाएँ', minread='{n} मिनट पढ़ें', by='NumberKundli टीम द्वारा', inthis='इस लेख में', faq='अक्सर पूछे जाने वाले प्रश्न', related='संबंधित लेख', blogtitle='NumberKundli ब्लॉग — शुभ नंबर, पिन, पासवर्ड और अधिक की गाइड', blogdesc='व्यावहारिक मोबाइल न्यूमरोलॉजी गाइड: हर अंक पोज़ीशन का अर्थ, शुभ नंबर अंत, लो-शू ग्रिड, पिन और पासवर्ड नियम, जन्मतिथि के अनुसार वॉलपेपर, कवर और रंग।', blogh1='न्यूमरोलॉजी की दुनिया: गाइड, नियम और शुभ अंक', blogintro='एडवांस मोबाइल न्यूमरोलॉजी क्लास से लिए गए व्यावहारिक गाइड: अपने फ़ोन नंबर का हर अंक कैसे पढ़ें, शुभ पिन और पासवर्ड कैसे चुनें, और अपनी जन्मतिथि के अनुसार वॉलपेपर, कवर और रंग कैसे मिलाएँ।', disclaimer='<strong>अस्वीकरण:</strong> न्यूमरोलॉजी एक आस्था-आधारित पद्धति है जो मार्गदर्शन और मनोरंजन के लिए है। यह चिकित्सा, कानूनी या वित्तीय सलाह नहीं है। अपना असली पिन या पासवर्ड कभी किसी से साझा न करें — यहाँ के कैलकुलेटर केवल आपके ब्राउज़र में चलते हैं।', credit='सामग्री डॉ. इशा ठक्कर न्यूमरोलॉजी की <em>एडवांस मोबाइल न्यूमरोलॉजी क्लास</em> पर आधारित है।', privacy='गोपनीयता नीति', terms='नियम और शर्तें', sitemap='साइटमैप', expert='विशेषज्ञ से बात करें', cta='✨ मेरा मुफ़्त विश्लेषण पाएँ', readin='इस लेख को पढ़ें', imgalt='{t} — चित्रण', dateloc='hi_IN'),
 'mr': dict(calc='कॅल्क्युलेटर', home='होम', blog='ब्लॉग', tools='झटपट साधने', buy='नंबर खरेदी करा', numbers='मूलांक 1–9', free='मोफत विश्लेषण', skip='मजकुराकडे जा', minread='{n} मिनिटे वाचन', by='NumberKundli टीमकडून', inthis='या लेखात', faq='वारंवार विचारले जाणारे प्रश्न', related='संबंधित लेख', blogtitle='NumberKundli ब्लॉग — शुभ नंबर, पिन, पासवर्ड आणि बरेच काही', blogdesc='व्यावहारिक मोबाइल न्यूमरॉलॉजी मार्गदर्शक: प्रत्येक अंक स्थानाचा अर्थ, शुभ नंबर शेवट, लो-शू ग्रिड, पिन व पासवर्ड नियम, जन्मतारखेनुसार वॉलपेपर, कव्हर आणि रंग.', blogh1='न्यूमरॉलॉजीच्या आत: मार्गदर्शक, नियम आणि शुभ अंक', blogintro='अ‍ॅडव्हान्स मोबाइल न्यूमरॉलॉजी क्लासमधून घेतलेले व्यावहारिक मार्गदर्शक: तुमच्या फोन नंबरचा प्रत्येक अंक कसा वाचावा, शुभ पिन व पासवर्ड कसा निवडावा, आणि जन्मतारखेनुसार वॉलपेपर, कव्हर व रंग कसे जुळवावे.', disclaimer='<strong>अस्वीकरण:</strong> न्यूमरॉलॉजी ही श्रद्धेवर आधारित पद्धत असून ती मार्गदर्शन व मनोरंजनासाठी आहे. हा वैद्यकीय, कायदेशीर किंवा आर्थिक सल्ला नाही. तुमचा खरा पिन किंवा पासवर्ड कधीही कोणाशी शेअर करू नका — येथील कॅल्क्युलेटर फक्त तुमच्या ब्राउझरमध्ये चालतात.', credit='मजकूर डॉ. इशा ठक्कर न्यूमरॉलॉजी यांच्या <em>अ‍ॅडव्हान्स मोबाइल न्यूमरॉलॉजी क्लास</em>वर आधारित.', privacy='गोपनीयता धोरण', terms='अटी व शर्ती', sitemap='साइटमॅप', expert='तज्ज्ञांशी बोला', cta='✨ माझे मोफत विश्लेषण मिळवा', readin='हा लेख वाचा', imgalt='{t} — चित्र', dateloc='mr_IN'),
 'ta': dict(calc='கால்குலேட்டர்கள்', home='முகப்பு', blog='வலைப்பதிவு', tools='விரைவு கருவிகள்', buy='எண் வாங்க', numbers='பிறப்பு எண்கள்', free='இலவச ஆய்வு', skip='உள்ளடக்கத்திற்குச் செல்', minread='{n} நிமிட வாசிப்பு', by='NumberKundli குழுவால்', inthis='இந்தக் கட்டுரையில்', faq='அடிக்கடி கேட்கப்படும் கேள்விகள்', related='தொடர்புடைய கட்டுரைகள்', blogtitle='NumberKundli வலைப்பதிவு — அதிர்ஷ்ட எண்கள், பின், கடவுச்சொல் வழிகாட்டிகள்', blogdesc='நடைமுறை மொபைல் எண் கணித வழிகாட்டிகள்: ஒவ்வொரு இலக்க இடத்தின் அர்த்தம், அதிர்ஷ்ட எண் முடிவுகள், லோ ஷூ கட்டம், பின் மற்றும் கடவுச்சொல் விதிகள், பிறந்த தேதிப்படி வால்பேப்பர், கவர் மற்றும் நிறம்.', blogh1='எண் கணிதத்தின் உள்ளே: வழிகாட்டிகள், விதிகள், அதிர்ஷ்ட எண்கள்', blogintro='அட்வான்ஸ் மொபைல் நியூமராலஜி வகுப்பிலிருந்து எடுக்கப்பட்ட நடைமுறை வழிகாட்டிகள்: உங்கள் ஃபோன் எண்ணின் ஒவ்வொரு இலக்கத்தையும் எப்படிப் படிப்பது, அதிர்ஷ்ட பின் மற்றும் கடவுச்சொல்லைத் தேர்வு செய்வது, பிறந்த தேதிக்கு ஏற்ப வால்பேப்பர், கவர் மற்றும் நிறத்தை அமைப்பது.', disclaimer='<strong>மறுப்பு:</strong> எண் கணிதம் என்பது வழிகாட்டுதல் மற்றும் பொழுதுபோக்கிற்காக வழங்கப்படும் நம்பிக்கை அடிப்படையிலான நடைமுறை. இது மருத்துவ, சட்ட அல்லது நிதி ஆலோசனை அல்ல. உங்கள் உண்மையான பின் அல்லது கடவுச்சொல்லை யாருடனும் பகிராதீர்கள் — இங்குள்ள கால்குலேட்டர்கள் உங்கள் உலாவியில் மட்டுமே இயங்கும்.', credit='உள்ளடக்கம் டாக்டர் இஷா தக்கர் நியூமராலஜியின் <em>அட்வான்ஸ் மொபைல் நியூமராலஜி வகுப்பு</em> அடிப்படையிலானது.', privacy='தனியுரிமைக் கொள்கை', terms='விதிமுறைகள்', sitemap='தளவரைபடம்', expert='நிபுணரிடம் பேசுங்கள்', cta='✨ என் இலவச ஆய்வைப் பெறு', readin='இந்தக் கட்டுரையைப் படிக்க', imgalt='{t} — விளக்கப்படம்', dateloc='ta_IN'),
 'gu': dict(calc='કેલ્ક્યુલેટર', home='હોમ', blog='બ્લોગ', tools='ઝડપી સાધનો', buy='નંબર ખરીદો', numbers='મૂળાંક 1–9', free='મફત વિશ્લેષણ', skip='સામગ્રી પર જાઓ', minread='{n} મિનિટ વાંચન', by='NumberKundli ટીમ દ્વારા', inthis='આ લેખમાં', faq='વારંવાર પૂછાતા પ્રશ્નો', related='સંબંધિત લેખો', blogtitle='NumberKundli બ્લોગ — શુભ નંબર, પિન, પાસવર્ડ અને વધુની માર્ગદર્શિકા', blogdesc='વ્યવહારુ મોબાઇલ ન્યુમરોલોજી માર્ગદર્શિકાઓ: દરેક અંક પોઝિશનનો અર્થ, શુભ નંબર અંત, લો-શુ ગ્રિડ, પિન અને પાસવર્ડ નિયમો, જન્મતારીખ મુજબ વૉલપેપર, કવર અને રંગ.', blogh1='ન્યુમરોલોજીની અંદર: માર્ગદર્શિકાઓ, નિયમો અને શુભ અંકો', blogintro='એડવાન્સ મોબાઇલ ન્યુમરોલોજી ક્લાસમાંથી લીધેલી વ્યવહારુ માર્ગદર્શિકાઓ: તમારા ફોન નંબરનો દરેક અંક કેવી રીતે વાંચવો, શુભ પિન અને પાસવર્ડ કેવી રીતે પસંદ કરવો, અને જન્મતારીખ મુજબ વૉલપેપર, કવર અને રંગ કેવી રીતે મેળવવા.', disclaimer='<strong>અસ્વીકરણ:</strong> ન્યુમરોલોજી એ માર્ગદર્શન અને મનોરંજન માટે આપવામાં આવતી શ્રદ્ધા-આધારિત પદ્ધતિ છે. તે તબીબી, કાનૂની કે નાણાકીય સલાહ નથી. તમારો ખરો પિન કે પાસવર્ડ ક્યારેય કોઈ સાથે શેર ન કરો — અહીંના કેલ્ક્યુલેટર ફક્ત તમારા બ્રાઉઝરમાં ચાલે છે.', credit='સામગ્રી ડૉ. ઇશા ઠક્કર ન્યુમરોલોજીના <em>એડવાન્સ મોબાઇલ ન્યુમરોલોજી ક્લાસ</em> પર આધારિત.', privacy='ગોપનીયતા નીતિ', terms='નિયમો અને શરતો', sitemap='સાઇટમેપ', expert='નિષ્ણાત સાથે વાત કરો', cta='✨ મારું મફત વિશ્લેષણ મેળવો', readin='આ લેખ વાંચો', imgalt='{t} — ચિત્ર', dateloc='gu_IN'),
}
NUMBERS = json.load(open(Path(__file__).parent / 'numbers.json')) if (Path(__file__).parent / 'numbers.json').exists() else {}
NUM_INTRO = {
 '1': "People with Birth number 1 are ruled by the Sun: natural leaders, original thinkers and self-starters who like to be in charge. They do best with a mobile number that keeps their authority intact and avoids the Saturn digit 8, their only enemy.",
 '2': "Birth number 2 belongs to the Moon: sensitive, intuitive, diplomatic people who thrive in partnerships. Because 4, 8 and 9 are enemies of 2, a Moon person's phone number should stay clear of those digits and lean on 1, 3 and 5.",
 '3': "Jupiter rules Birth number 3: teachers, advisers, optimists and lifelong learners. 3 is friendly with 1, 2, 3 and 5 and clashes only with 6, so Venus-heavy numbers (many 6s) are the ones to avoid.",
 '4': "Birth number 4 is governed by Rahu: unconventional, hard-working, sometimes unpredictable. 4 has more enemies than most (2, 4, 8, 9), so choosing a phone number carefully matters more for this number than for any other.",
 '5': "Mercury rules Birth number 5: communicators, traders, travellers and quick thinkers. 5 is the luckiest number in the compatibility chart — it has no enemies at all — which gives Mercury people the widest choice of phone numbers.",
 '6': "Birth number 6 is Venus: love, beauty, family, comfort and money. 6 is friendly with 1, 5, 6 and 7 and has a single enemy, 3, so numbers heavy in Jupiter's digit are the ones a Venus person should skip.",
 '7': "Ketu rules Birth number 7: researchers, spiritual seekers, analysts and introverts. 7's only enemy is 2 (the Moon), so a Ketu person's number should avoid 2s and welcome 1, 3, 4, 5 and 6.",
 '8': "Birth number 8 belongs to Saturn: disciplined, patient, karmic, slow-but-sure achievers. 8 is the most sensitive number in the chart — 1, 2, 4, 9 and even 8 itself are enemies — so Saturn people benefit most from a number built on 3, 5, 6 and 7.",
 '9': "Mars rules Birth number 9: energetic, courageous, competitive people who act first. 9 is friendly with 1, 2, 3, 5 and 6 and clashes with 4 and 8, so a Mars person's number should be free of Rahu and Saturn digits.",
}

ROOT = Path(__file__).resolve().parent.parent / 'site'
SITE_URL = 'https://numberkundli.com'   # keep in sync with site/js/site-config.js
SITE_NAME = 'NumberKundli'
ASSETS = ROOT / 'assets'; BLOG = ROOT / 'blog'; IMG = ASSETS / 'blog'
for d in (ASSETS, BLOG, IMG): d.mkdir(parents=True, exist_ok=True)
VER = 'v=21'

# ---------------------------------------------------------------- fonts
def font(size, bold=True):
    for path in (['/System/Library/Fonts/Supplemental/Georgia Bold.ttf', '/System/Library/Fonts/Supplemental/Arial Bold.ttf'] if bold else ['/System/Library/Fonts/Supplemental/Arial.ttf']) + ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf']:
        if os.path.exists(path): return ImageFont.truetype(path, size)
    return ImageFont.load_default()
def emoji_font(size):
    p = '/System/Library/Fonts/Apple Color Emoji.ttc'
    try: return ImageFont.truetype(p, size) if os.path.exists(p) else None
    except Exception: return None

def hexrgb(h): h = h.lstrip('#'); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

# ---------------------------------------------------------------- images
def gradient(w, h, a, b):
    """diagonal gradient a → b (no rotation artefacts)"""
    from PIL import ImageChops
    v = Image.linear_gradient('L').resize((w, h))
    hz = Image.linear_gradient('L').transpose(Image.Transpose.ROTATE_90).resize((w, h))
    mask = ImageChops.add(v, hz, scale=2.0)
    return Image.composite(Image.new('RGB', (w, h), b), Image.new('RGB', (w, h), a), mask)

def decorate(img, b):
    """soft glowing circles for depth"""
    glow = Image.new('RGBA', img.size, (0, 0, 0, 0)); d = ImageDraw.Draw(glow)
    W, H = img.size
    for (x, y, r, a) in [(W*0.85, H*0.2, 260, 70), (W*0.15, H*0.9, 200, 55), (W*0.6, H*1.05, 320, 40)]:
        d.ellipse([x-r, y-r, x+r, y+r], fill=hexrgb(b) + (a,))
    glow = glow.filter(ImageFilter.GaussianBlur(60))
    return Image.alpha_composite(img.convert('RGBA'), glow).convert('RGB')

def wrap(draw, text, fnt, max_w):
    words, lines, cur = text.split(), [], ''
    for w in words:
        test = (cur + ' ' + w).strip()
        if draw.textlength(test, font=fnt) <= max_w: cur = test
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines

def hero_image(post, lang='en'):
    """1200×630 social/hero image: gradient, big glyph, wrapped title, brand."""
    spec = post['img']; W, H = 1200, 630
    img = decorate(gradient(W, H, hexrgb(spec['a']), hexrgb(spec['b'])), spec['b']).convert('RGBA')
    # translucent shapes go on an overlay so alpha is respected
    ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
    glyph = spec['glyph']; is_emoji = any(ord(c) >= 0x1F000 for c in glyph)
    panel = [W-430, 95, W-90, 535]
    od.rounded_rectangle(panel, radius=48, fill=(255, 255, 255, 34), outline=(255, 255, 255, 70), width=2)
    native_label = lang != 'en' and native_text and native_text.AVAILABLE
    if native_label:
        lbl = native_text.render(spec['label'], native_text.FONT_FOR_LANG[lang], 30, 500, bold=False, line_height=1.0); lw = lbl.width + 44
    else:
        lf = font(26, bold=False); lw = od.textlength(spec['label'], font=lf) + 40
    od.rounded_rectangle([80, 96, 80+lw, 146], radius=25, fill=(255, 255, 255, 40))
    img = Image.alpha_composite(img, ov)
    if native_label: img.alpha_composite(lbl, (102, 121 - lbl.height // 2))
    d = ImageDraw.Draw(img)
    ef = emoji_font(160) if is_emoji else None
    if ef:
        try:
            # Apple Color Emoji is a fixed-size bitmap font: draw at 160 px, then upscale ~1.8×
            tile = Image.new('RGBA', (220, 220), (0, 0, 0, 0)); ImageDraw.Draw(tile).text((110, 110), glyph, font=ef, anchor='mm', embedded_color=True)
            tile = tile.crop(tile.getbbox() or (0, 0, 220, 220)); scale = 300 / max(tile.size); tile = tile.resize((int(tile.width*scale), int(tile.height*scale)), Image.LANCZOS)
            cx, cy = (panel[0]+panel[2])//2, (panel[1]+panel[3])//2
            img.alpha_composite(tile, (cx - tile.width//2, cy - tile.height//2)); d = ImageDraw.Draw(img)
        except Exception: ef = None
    if not ef:
        size = 150 if len(glyph) <= 2 else 110
        gf = font(size)
        if not all(c.isascii() and (c.isalnum() or c in ' .·') for c in glyph):   # symbols / Devanagari need a Unicode font
            for fp in ['/System/Library/Fonts/Supplemental/Devanagari Sangam MN.ttc', '/System/Library/Fonts/Supplemental/Arial Unicode.ttf']:
                if os.path.exists(fp) and (('\u0900' <= glyph[0] <= '\u097f') == ('Devanagari' in fp)):
                    try: gf = ImageFont.truetype(fp, int(size * (1.5 if 'Devanagari' in fp else 1))); break
                    except Exception: pass
        d.text(((panel[0]+panel[2])//2, (panel[1]+panel[3])//2), glyph, font=gf, anchor='mm', fill=(255, 255, 255))
    if not native_label: d.text((100, 121), spec['label'], font=lf, anchor='lm', fill=(255, 255, 255))
    # title
    if lang != 'en' and native_text and native_text.AVAILABLE:
        # Indic scripts need real shaping → CoreText; draw a blurred shadow copy then the text
        size = 54; txt = native_text.render(post['title'], native_text.FONT_FOR_LANG[lang], size, 640)
        while txt.height > 330 and size > 34: size -= 4; txt = native_text.render(post['title'], native_text.FONT_FOR_LANG[lang], size, 640)
        shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0)); sh_txt = Image.new('RGBA', txt.size, (0, 0, 0, 0)); sh_txt.paste((0, 0, 0, 120), None, txt); shadow.paste(sh_txt, (83, 193), sh_txt)
        img = Image.alpha_composite(img, shadow.filter(ImageFilter.GaussianBlur(4))); img.alpha_composite(txt, (80, 190)); d = ImageDraw.Draw(img)
    else:
        tf = font(58); lines = wrap(d, post['title'], tf, 640)
        if len(lines) > 4: tf = font(48); lines = wrap(d, post['title'], tf, 640)
        y = 190
        sh = Image.new('RGBA', (W, H), (0, 0, 0, 0)); sd = ImageDraw.Draw(sh); yy = y
        for ln in lines: sd.text((83, yy+3), ln, font=tf, fill=(0, 0, 0, 120)); yy += 70 if tf.size == 58 else 58
        img = Image.alpha_composite(img, sh.filter(ImageFilter.GaussianBlur(4))); d = ImageDraw.Draw(img)
        for ln in lines: d.text((80, y), ln, font=tf, fill=(255, 255, 255)); y += 70 if tf.size == 58 else 58
    # brand
    d.text((80, H-70), SITE_NAME.upper() + '  ·  FREE CALCULATOR', font=font(22, bold=False), fill=(255, 255, 255))
    return img.convert('RGB')

def save_variants(img, stem):
    """Compressed outputs: WebP (primary) + JPEG (fallback) + 640px thumbnail WebP."""
    img.save(IMG / f'{stem}.webp', 'WEBP', quality=78, method=6)
    img.save(IMG / f'{stem}.jpg', 'JPEG', quality=80, optimize=True, progressive=True)
    img.resize((640, 336), Image.LANCZOS).save(IMG / f'{stem}-640.webp', 'WEBP', quality=74, method=6)

def brand_images():
    # favicon.svg
    (ASSETS / 'favicon.svg').write_text('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b7bff"/><stop offset="1" stop-color="#ffcb47"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#g)"/><text x="32" y="45" font-family="Georgia, serif" font-size="38" font-weight="700" text-anchor="middle" fill="#14103a">९</text></svg>''')
    def icon(size):
        im = gradient(size, size, hexrgb('#8b7bff'), hexrgb('#ffcb47')); d = ImageDraw.Draw(im)
        mask = Image.new('L', (size, size), 0); ImageDraw.Draw(mask).rounded_rectangle([0, 0, size-1, size-1], radius=size//4, fill=255)
        f = None
        for p in ['/System/Library/Fonts/Supplemental/Devanagari Sangam MN.ttc', '/System/Library/Fonts/Supplemental/Arial Unicode.ttf', '/System/Library/Fonts/Supplemental/Kohinoor.ttc']:
            if os.path.exists(p):
                try: f = ImageFont.truetype(p, int(size*0.62)); break
                except Exception: pass
        d.text((size/2, size/2), '९', font=f or font(int(size*0.6)), anchor='mm', fill=(20, 16, 58))
        out = Image.new('RGBA', (size, size), (0, 0, 0, 0)); out.paste(im, mask=mask); return out
    icon(32).save(ASSETS / 'favicon-32.png', optimize=True)
    icon(180).convert('RGB').save(ASSETS / 'apple-touch-icon.png', optimize=True)
    icon(192).save(ASSETS / 'icon-192.png', optimize=True)
    icon(512).save(ASSETS / 'icon-512.png', optimize=True)
    # OG image for the home page
    og = hero_image(dict(title='NumberKundli — Free Mobile Number Numerology Calculator', img=dict(a='#0b0d17', b='#8b7bff', glyph='९', label='Number · PIN · Password · Wallpaper')))
    og.save(ASSETS / 'og-image.jpg', 'JPEG', quality=82, optimize=True, progressive=True)

# ---------------------------------------------------------------- html
def esc(s): return html.escape(s, quote=True)
def fmt_date(iso): return datetime.date.fromisoformat(iso).strftime('%d %B %Y')
BY = {p['slug']: p for p in POSTS}

def head(title, desc, canonical_path, og_image, extra_ld='', article=None, depth=1, lang='en', alternates=None):
    up = '../' * depth; u = UI[lang]
    alt_links = ''.join(f'<link rel="alternate" hreflang="{l}" href="{SITE_URL}/{p}" />' for l, p in (alternates or {}).items()) + (f'<link rel="alternate" hreflang="x-default" href="{SITE_URL}/{alternates["en"]}" />' if alternates and 'en' in alternates else '')
    ld = [{"@type": "WebSite", "name": SITE_NAME, "url": SITE_URL + '/'}]
    if article:
        ld.append({"@type": "Article", "headline": article['title'], "description": article['meta'], "image": [og_image],
                   "datePublished": article['date'], "dateModified": article['date'],
                   "author": {"@type": "Organization", "name": SITE_NAME + " Team"}, "inLanguage": lang,
                   "publisher": {"@type": "Organization", "name": SITE_NAME, "logo": {"@type": "ImageObject", "url": f"{SITE_URL}/assets/icon-512.png"}},
                   "mainEntityOfPage": f"{SITE_URL}/{canonical_path}", "keywords": article['keywords'], "articleSection": article['category']})
        ld.append({"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL + '/'},
            {"@type": "ListItem", "position": 2, "name": u['blog'], "item": SITE_URL + '/' + ('' if lang == 'en' else lang + '/') + 'blog/'},
            {"@type": "ListItem", "position": 3, "name": article['title'], "item": f"{SITE_URL}/{canonical_path}"}]})
        if article.get('faqs'):
            ld.append({"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in article['faqs']]})
    return f'''<!DOCTYPE html>
<html lang="{lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{esc(title)}</title>
  <meta name="description" content="{esc(desc)}" />
  <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests" />
  <meta name="theme-color" content="#0b0d17" />
  <link rel="canonical" href="{SITE_URL}/{canonical_path}" />
  {alt_links}
  <meta property="og:locale" content="{LOCALE[lang]}" />
  <link rel="icon" href="{up}assets/favicon.svg" type="image/svg+xml" />
  <link rel="icon" href="{up}assets/favicon-32.png" sizes="32x32" type="image/png" />
  <link rel="apple-touch-icon" href="{up}assets/apple-touch-icon.png" />
  <meta property="og:type" content="{'article' if article else 'website'}" />
  <meta property="og:site_name" content="{SITE_NAME}" />
  <meta property="og:title" content="{esc(title)}" />
  <meta property="og:description" content="{esc(desc)}" />
  <meta property="og:url" content="{SITE_URL}/{canonical_path}" />
  <meta property="og:image" content="{og_image}" />
  <meta property="og:image:width" content="1200" /><meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="{esc(title)}" />
  {'<meta property="article:published_time" content="' + article['date'] + '" /><meta property="article:section" content="' + esc(article['category']) + '" />' if article else ''}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{esc(title)}" />
  <meta name="twitter:description" content="{esc(desc)}" />
  <meta name="twitter:image" content="{og_image}" />
  <script type="application/ld+json">{json.dumps({"@context": "https://schema.org", "@graph": ld}, ensure_ascii=False)}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Sans+Tamil:wght@400;500;600;700&family=Noto+Sans+Gujarati:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="{up}css/styles.css?{VER}" />
  {'<style>:root{--font:' + FONT_CSS[lang][0] + ';--display:' + FONT_CSS[lang][1] + '}</style>' if lang != 'en' else ''}
</head>
<body>
<a class="skip-link" href="#main">{u['skip']}</a>
<nav class="nav" aria-label="Main">
  <div class="container">
    <a class="brand" href="{up}index.html{'' if lang == 'en' else '?lang=' + lang}"><span class="logo">९</span> <span>{SITE_NAME}</span></a>
    <div class="nav-links" id="navLinks">
      <a href="{up}index.html{'' if lang == 'en' else '?lang=' + lang}">{u['home']}</a>
      <a href="{up}{'' if lang == 'en' else lang + '/'}blog/">{u['blog']}</a>
      <a href="{up}tools/">{u['calc']}</a>
      <a href="{up}numbers/">{u['numbers']}</a>
    </div>
    <button class="nav-toggle" aria-label="Menu" aria-expanded="false" aria-controls="navLinks">☰</button>
    <a class="btn sm" href="{up}index.html{'' if lang == 'en' else '?lang=' + lang}#mainForm" style="margin-left:8px">{u['free']}</a>
  </div>
</nav>
<main class="container" id="main">
'''

for _l in FOOT_UI: UI[_l].update(FOOT_UI[_l])

def foot(depth=1, lang='en', home_anchor=None):
    """CTA card + 4-column footer + newsletter. Shared by every page (static pages get it injected too)."""
    up = '../' * depth; u = UI[lang]; q = '' if lang == 'en' else '?lang=' + lang
    home = f"{up}index.html{q}"; anchor = home_anchor or f"{home}#mainForm"
    orbs = ''.join(f'<span class="orb" style="left:{x}%;top:{y}%;background:{c}">{n}</span>' for n, x, y, c in [(1, 50, 4, '#ffcb47'), (5, 84, 22, '#9CCC65'), (6, 90, 62, '#7fb0ff'), (9, 62, 88, '#f28b8b'), (3, 22, 80, '#f6c95b'), (2, 8, 40, '#e6e9ff'), (7, 28, 14, '#a5e8a0')])
    return f"""
</main>
<footer class="site-footer">
  <div class="container">
    <div class="footer-cta">
      <div>
        <div class="eyebrow-plain">{u['f_cta_eye']}</div>
        <h2>{u['f_cta_h']}</h2>
        <p>{u['f_cta_p']}</p>
        <a class="btn" href="{anchor}">{u['f_cta_btn']} ↗</a>
      </div>
      <div class="rings" aria-hidden="true">
        <svg viewBox="0 0 400 300"><g fill="none" stroke="currentColor" stroke-opacity=".18" stroke-dasharray="3 5"><circle cx="200" cy="150" r="44"/><circle cx="200" cy="150" r="100"/><circle cx="200" cy="150" r="156"/><circle cx="200" cy="150" r="212"/></g></svg>
        <span class="core">९</span>{orbs}
      </div>
    </div>
  </div>
  <div class="footer-main">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="brand" href="{home}"><span class="logo">९</span> <span>{SITE_NAME}</span></a>
          <p>{u['f_tag']}</p>
        </div>
        <div>
          <h4>{u['f_explore']}</h4>
          <ul>
            <li><a href="{anchor}">{u['f_analyser']}</a></li>
            <li><a href="{up}tools/">{u['calc']}</a></li>
            <li><a href="{up}numbers/">{u['numbers']}</a></li>
            <li><a href="{up}{'' if lang == 'en' else lang + '/'}blog/">{u['blog']}</a></li>
          </ul>
        </div>
        <div>
          <h4>{u['f_company']}</h4>
          <ul>
            <li><a href="{up}privacy.html">{u['privacy']}</a></li>
            <li><a href="{up}terms.html">{u['terms']}</a></li>
            <li><a href="#" data-whatsapp target="_blank" rel="noopener">{u['f_expert']} <span class="ext">↗</span></a></li>
            <li><a href="{up}sitemap.xml">{u['sitemap']}</a></li>
          </ul>
        </div>
        <div>
          <h4>{u['f_news']}</h4>
          <p class="muted small" style="margin:0">{u['f_newsText']}</p>
          <form class="news-form" name="newsletter" method="POST" data-netlify="true" netlify-honeypot="company" action="/thanks.html">
            <input type="hidden" name="form-name" value="newsletter" /><input type="hidden" name="lang" value="{lang}" />
            <span class="hp" aria-hidden="true"><input name="company" tabindex="-1" autocomplete="off" /></span>
            <span class="at">@</span><input type="email" name="email" placeholder="{u['f_email']}" required aria-label="Email" />
            <button type="submit" aria-label="Subscribe">→</button>
          </form>
          <div class="news-note" data-thanks="{u['f_thanks']}"></div>
        </div>
      </div>
      <p class="footer-disc">{u['disclaimer']} {u['credit']}</p>
      <div class="footer-bottom">
        <div>© 2026 {SITE_NAME} <span class="dot">·</span> {u['f_rights']}</div>
        <div><span data-social-links></span>{u['f_made']}</div>
      </div>
    </div>
  </div>
</footer>
<a class="btn sticky-cta" href="{anchor}">{u['cta']}</a>
<script src="{up}js/site-config.js?{VER}"></script>
<script src="{up}js/site.js?{VER}" defer></script>
</body>
</html>
"""

def picture(slug, alt, lazy=True, thumb=False, depth=1, lang='en'):
    src = f'{"../" * depth}assets/blog/{slug}' + ('' if lang == 'en' else '-' + lang)
    if thumb:
        return f'<picture><source type="image/webp" srcset="{src}-640.webp 640w, {src}.webp 1200w" sizes="(max-width: 600px) 100vw, 33vw" /><img src="{src}.jpg" alt="{esc(alt)}" width="1200" height="630" loading="lazy" decoding="async" /></picture>'
    return f'<picture><source type="image/webp" srcset="{src}.webp" /><img src="{src}.jpg" alt="{esc(alt)}" width="1200" height="630" {"loading=lazy" if lazy else "fetchpriority=high"} decoding="async" /></picture>'

def toc(body):
    heads = re.findall(r'<h2>(.*?)</h2>', body)
    return heads

def fmt_date_l(iso, lang):
    d = datetime.date.fromisoformat(iso)
    months = {'hi': ['जनवरी','फ़रवरी','मार्च','अप्रैल','मई','जून','जुलाई','अगस्त','सितंबर','अक्टूबर','नवंबर','दिसंबर'], 'mr': ['जानेवारी','फेब्रुवारी','मार्च','एप्रिल','मे','जून','जुलै','ऑगस्ट','सप्टेंबर','ऑक्टोबर','नोव्हेंबर','डिसेंबर'], 'ta': ['ஜனவரி','பிப்ரவரி','மார்ச்','ஏப்ரல்','மே','ஜூன்','ஜூலை','ஆகஸ்ட்','செப்டம்பர்','அக்டோபர்','நவம்பர்','டிசம்பர்'], 'gu': ['જાન્યુઆરી','ફેબ્રુઆરી','માર્ચ','એપ્રિલ','મે','જૂન','જુલાઈ','ઑગસ્ટ','સપ્ટેમ્બર','ઑક્ટોબર','નવેમ્બર','ડિસેમ્બર']}
    return fmt_date(iso) if lang == 'en' else f'{d.day} {months[lang][d.month-1]} {d.year}'

def localized(p, lang):
    """Return the post merged with its translation (title, meta, excerpt, body, faqs) if available."""
    if lang == 'en': return p
    tr = TR.get(lang, {}).get(p['slug'])
    if not tr: return None
    merged = {**p, **tr}
    if 'label' in tr: merged['img'] = {**p['img'], 'label': tr['label']}
    return merged

def alternates_for(slug):
    alts = {'en': f'blog/{slug}.html'}
    for l in LANGS:
        if slug in TR.get(l, {}): alts[l] = f'{l}/blog/{slug}.html'
    return alts

def post_page(p0, lang='en'):
    p = localized(p0, lang)
    if not p: return
    u = UI[lang]; depth = 1 if lang == 'en' else 2; pre = '' if lang == 'en' else lang + '/'
    body = p['body']
    # add ids to h2 for the table of contents
    counter = [0]
    def addid(m):
        counter[0] += 1
        return f'<h2 id="s{counter[0]}">{m.group(1)}</h2>'
    body = re.sub(r'<h2>(.*?)</h2>', addid, body)
    heads = [(f's{i+1}', re.sub('<[^>]+>', '', h)) for i, h in enumerate(toc(p['body']))]
    words = len(re.sub('<[^>]+>', ' ', body).split()); mins = max(2, round(words / (200 if lang == 'en' else 160)))
    og = f"{SITE_URL}/assets/blog/{p['slug']}{'' if lang == 'en' else '-' + lang}.jpg"
    alt = u['imgalt'].format(t=p['title'])
    faq_html = ''.join(f'<details><summary>{esc(q)}</summary><p>{esc(a)}</p></details>' for q, a in p['faqs'])
    rel_posts = [(r, localized(BY[r], lang)) for r in p['related']]
    related = ''.join(f'''<article class="card post-card"><a href="{r}.html" aria-label="{esc(rp['title'])}">{picture(r, u['imgalt'].format(t=rp['title']), thumb=True, depth=depth, lang=lang)}</a>
      <div class="body"><span class="tag">{esc(rp['category'])}</span><h3><a href="{r}.html">{esc(rp['title'])}</a></h3><p>{esc(rp['excerpt'])}</p></div></article>''' for r, rp in rel_posts if rp)
    alts = alternates_for(p['slug'])
    switcher = ' '.join(f'<a class="chip {"good" if l == lang else ""}" href="{"../" * depth}{path}" hreflang="{l}" lang="{l}">{LANG_NAME[l]}</a>' for l, path in alts.items())
    html_ = head(p['title'], p['meta'], f"{pre}blog/{p['slug']}.html", og, article=p, depth=depth, lang=lang, alternates=alts) + f'''
<article class="page-head" style="padding-bottom:0">
  <div class="breadcrumb"><a href="{'../' * depth}index.html{'' if lang == 'en' else '?lang=' + lang}">{u['home']}</a> › <a href="./">{u['blog']}</a> › {esc(p['category'])}</div>
  <h1>{esc(p['title'])}</h1>
  <div class="meta-row"><span>{esc(p['category'])}</span><span>·</span><time datetime="{p['date']}">{fmt_date_l(p['date'], lang)}</time><span>·</span><span>{u['minread'].format(n=mins)}</span><span>·</span><span>{u['by']}</span></div>
  <div class="lang-switch"><span class="small muted">{u['readin']}:</span> {switcher}</div>
  <div class="article-hero">{picture(p['slug'], alt, lazy=False, depth=depth, lang=lang)}</div>
  <div class="grid" style="grid-template-columns: minmax(0, 760px) 1fr; align-items: start">
    <div class="prose">
      <div class="callout toc"><strong>{u['inthis']}</strong><ol>{''.join(f'<li><a href="#{i}">{esc(h)}</a></li>' for i, h in heads)}</ol></div>
      {body}
      <h2 id="faq">{u['faq']}</h2>
      <div class="faq">{faq_html}</div>
    </div>
  </div>
</article>
<section class="related">
  <h2>{u['related']}</h2>
  <div class="post-grid">{related}</div>
</section>
''' + foot(depth, lang)
    out = BLOG if lang == 'en' else ROOT / lang / 'blog'; out.mkdir(parents=True, exist_ok=True)
    (out / f"{p['slug']}.html").write_text(html_)

def index_page(lang='en'):
    """Editorial blog index: eyebrow + title, category sidebar (client-side filter), featured post, two-column list."""
    u = UI[lang]; depth = 1 if lang == 'en' else 2; pre = '' if lang == 'en' else lang + '/'
    base_by_slug = {p['slug']: p for p in POSTS}
    posts = [lp for lp in (localized(p, lang) for p in sorted(POSTS, key=lambda x: x['date'], reverse=True)) if lp]
    if not posts: return
    cats = []
    for p in posts:
        key = base_by_slug[p['slug']]['category']
        if key not in [c[0] for c in cats]: cats.append((key, p['category']))
    catkey = lambda p: re.sub(r'[^a-z0-9]+', '-', base_by_slug[p['slug']]['category'].lower())
    author = lambda d: '<div class="byline"><span class="avatar">९</span><div><b>' + SITE_NAME + '</b><span>' + fmt_date_l(d, lang) + '</span></div></div>'
    feat = posts[0]
    feature = ('<article class="feature" data-cat="' + catkey(feat) + '">'
               '<a href="' + feat['slug'] + '.html" aria-label="' + esc(feat['title']) + '">' + picture(feat['slug'], u['imgalt'].format(t=feat['title']), lazy=False, depth=depth, lang=lang) + '</a>'
               '<div><span class="post-item"><span class="cat">' + esc(feat['category']) + ' &middot; ' + u['featured'] + '</span></span><h2><a href="' + feat['slug'] + '.html">' + esc(feat['title']) + '</a></h2><p>' + esc(feat['excerpt']) + '</p>' + author(feat['date']) + '</div></article>')
    items = ''.join('<article class="post-item" data-cat="' + catkey(p) + '">'
                    '<a href="' + p['slug'] + '.html" aria-label="' + esc(p['title']) + '">' + picture(p['slug'], u['imgalt'].format(t=p['title']), thumb=True, depth=depth, lang=lang) + '</a>'
                    '<span class="cat">' + esc(p['category']) + '</span><h3><a href="' + p['slug'] + '.html">' + esc(p['title']) + '</a></h3><p>' + esc(p['excerpt']) + '</p>' + author(p['date']) + '</article>' for p in posts[1:])
    catnav = '<button class="active" data-filter="all">' + u['viewall'] + '</button>' + ''.join('<button data-filter="' + re.sub(r'[^a-z0-9]+', '-', k.lower()) + '">' + esc(label) + '</button>' for k, label in cats)
    ld = json.dumps({"@context": "https://schema.org", "@type": "ItemList", "itemListElement": [{"@type": "ListItem", "position": i + 1, "url": f"{SITE_URL}/{pre}blog/{p['slug']}.html", "name": p['title']} for i, p in enumerate(posts)]}, ensure_ascii=False)
    alts = {'en': 'blog/'} | {l: f'{l}/blog/' for l in LANGS if TR.get(l)}
    switcher = ' '.join('<a class="chip ' + ('good' if l == lang else '') + '" href="' + '../' * depth + path + '" hreflang="' + l + '" lang="' + l + '">' + LANG_NAME[l] + '</a>' for l, path in alts.items())
    filter_js = "(function(){var b=document.querySelectorAll('.cat-nav button'),it=document.querySelectorAll('.feature,.post-item');b.forEach(function(x){x.addEventListener('click',function(){b.forEach(function(y){y.classList.remove('active')});x.classList.add('active');var f=x.dataset.filter;it.forEach(function(i){i.classList.toggle('hidden',f!=='all'&&i.dataset.cat!==f)})})})})();"
    html_ = head(u['blogtitle'], u['blogdesc'], pre + 'blog/', SITE_URL + '/assets/og-image.jpg', depth=depth, lang=lang, alternates=alts) + (
        '\n<script type="application/ld+json">' + ld + '</script>\n'
        '<div class="journal-head"><span class="journal-eyebrow">' + u['journal_eye'] + '</span><h1>' + u['blogh1'] + '</h1><p>' + u['blogintro'] + '</p><div class="lang-switch" style="margin:18px 0 0">' + switcher + '</div></div>\n'
        '<div class="journal"><nav class="cat-nav" aria-label="Categories">' + catnav + '</nav><div>' + feature + '<div class="post-list">' + items + '</div></div></div>\n'
        '<script>' + filter_js + '</script>\n') + foot(depth, lang)
    out = BLOG if lang == 'en' else ROOT / lang / 'blog'; out.mkdir(parents=True, exist_ok=True)
    (out / 'index.html').write_text(html_)

NUMDIR = ROOT / 'numbers'
def number_pages():
    NUMDIR.mkdir(exist_ok=True)
    for n, d in NUMBERS.items():
        slug = f'birth-number-{n}'
        title = f"Birth Number {n} ({d['planet']}): Lucky Mobile Number, PIN, Wallpaper & Colour"
        meta = f"Born on the {', '.join(str(x) + ('st' if x in (1,21,31) else 'nd' if x in (2,22) else 'rd' if x in (3,23) else 'th') for x in d['days'])}? Birth number {n} is ruled by {d['planet']}. Friendly digits {', '.join(map(str, d['friends']))}, enemies {', '.join(map(str, d['enemies'])) or 'none'}. Best mobile number digits, PINs, wallpaper, cover and colour for you."
        meta = meta[:158].rsplit(' ', 1)[0] + ('…' if len(meta) > 158 else '')
        img_spec = dict(title=f"Birth Number {n} — {d['planet']}", img=dict(a=['#1e1b4b','#7c2d12','#1e293b','#3f2f00','#312e81','#064e3b','#4a044e','#134e4a','#0f172a','#3b0d0d'][int(n)], b=['#8b7bff','#fb923c','#93c5fd','#fde68a','#a5b4fc','#34d399','#f9a8d4','#5eead4','#fbbf24','#f87171'][int(n)], glyph=n, label=d['keyword']))
        save_variants(hero_image(img_spec), slug)
        og = f"{SITE_URL}/assets/blog/{slug}.jpg"
        chips = lambda arr, cls: ''.join(f'<span class="digit-chip {cls}">{x}</span>' for x in arr) or '<span class="muted">—</span>'
        ideal_rows = ''.join(f"<tr><td><b>{pos}</b></td><td>{d['positions'][pos]['title']}</td><td><div class=\"chips\">{chips(v['good'], 'good')}</div></td><td><div class=\"chips\">{chips([x for x in v['safe'] if x != 4], 'neutral')}</div></td></tr>" for pos, v in d['ideal'].items())
        lucky_names = {'end555': 'Ends with 555', 'end55': 'Ends with 55', 'end6': 'Ends with 6', 'end3': 'Ends with 3', 'end7': 'Ends with 7', 'pairs': 'Repeating pairs', 'mixed': 'Balanced mix'}
        lucky_rows = ''.join(f"<tr><td>{lucky_names[g['id']]}</td><td>{' · '.join('<b>' + x['str'][:5] + ' ' + x['str'][5:] + '</b>' for x in g['numbers'])}</td></tr>" for g in d['lucky'])
        pin_rows = ''.join(f"<tr><td><b>{p['pin']}</b></td><td>{p['purpose']}</td><td>{p['total']}</td></tr>" for p in d['pins'])
        pw_rows = ''.join(f"<tr><td><b>{x['total']}</b></td><td>{x['purpose']}</td><td>{', '.join(x['examples'])}</td></tr>" for x in d['pwTotals'])
        covers = ''.join(f"<li><b>{c['icon']} {c['name']}</b> — {c['idealFor']}{(' Tip: ' + c['tip']) if c['tip'] else ''}</li>" for c in d['covers'])
        colors = ' '.join(f'<span class="chip {"good" if c["status"]=="good" else "bad" if c["status"]=="avoid" else "neutral"}"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:{c["hex"]};border:1px solid rgba(0,0,0,.2)"></span> {c["name"]} — {"supportive" if c["status"]=="good" else c["status"]}</span>' for c in d['colors'])
        a = d['affirmation']
        faqs = [(f"Which mobile number total is best for Birth number {n}?", f"A total that reduces to one of your friendly numbers — {', '.join(map(str, d['friends']))}. Avoid a total of {', '.join(map(str, d['enemies'])) if d['enemies'] else 'none (number ' + n + ' has no enemies)'}."),
                (f"Which digits should Birth number {n} avoid in a phone number?", f"Your enemy digits are {', '.join(map(str, d['enemies'])) or 'none'}; in addition the class advises everyone to avoid 4 anywhere and 8 as the last digit."),
                (f"What is the lucky colour for Birth number {n}?", f"Colours that carry {d['planet']} or a friendly planet's energy: {', '.join(c['name'] for c in d['colors'] if c['status']=='good')}. Better avoided: {', '.join(c['name'] for c in d['colors'] if c['status']=='avoid') or 'none'}.")]
        art = dict(title=title, meta=meta, date='2026-09-16', keywords=f'birth number {n}, mulank {n}, lucky mobile number for birth number {n}, number {n} numerology', category='Birth Numbers', faqs=faqs)
        others = ' '.join(f'<a class="chip {"good" if str(m)==n else ""}" href="birth-number-{m}.html">{m}</a>' for m in range(1, 10))
        related = ''.join(f'<li><a href="../blog/{r}.html">{BY[r]["title"]}</a></li>' for r in ['how-to-calculate-birth-number-and-destiny-number', 'friendly-and-enemy-numbers-numerology-chart', 'mobile-number-numerology-10-positions-meaning'])
        html_ = head(title, meta, f'numbers/{slug}.html', og, article=art) + f'''
<article class="page-head" style="padding-bottom:0">
  <div class="breadcrumb"><a href="../index.html">Home</a> › <a href="./">Birth numbers</a> › {n}</div>
  <h1>Birth Number {n} ({d['planet']}): Lucky Mobile Number, PIN, Wallpaper &amp; Colour</h1>
  <div class="meta-row"><span>Born on the {', '.join(map(str, d['days']))} of any month</span><span>·</span><span>{d['keyword']}</span></div>
  <div class="chips" style="margin:6px 0 18px">{others}</div>
  <div class="article-hero">{picture(slug, f"Birth number {n} — {d['planet']} — illustration", lazy=False)}</div>
  <div class="prose">
    <p>{NUM_INTRO[n]}</p>
    <div class="callout"><b>Friendly:</b> <span class="chips" style="display:inline-flex;vertical-align:middle">{chips(d['friends'], 'good')}</span> &nbsp; <b>Enemy:</b> <span class="chips" style="display:inline-flex;vertical-align:middle">{chips(d['enemies'], 'bad')}</span> &nbsp; <b>Neutral:</b> <span class="chips" style="display:inline-flex;vertical-align:middle">{chips(d['neutral'], 'neutral')}</span></div>

    <h2 id="mobile">Best mobile number for Birth number {n}</h2>
    <p>Each of the 10 positions of a mobile number governs a life area. The table shows which digits are positively indicated (green) and which are safe (grey) for a Birth number {n} person; anything missing is a digit to avoid at that position.</p>
    <table><tr><th>Pos</th><th>Governs</th><th>Best</th><th>Safe</th></tr>{ideal_rows}</table>
    <h3>Sample lucky numbers</h3>
    <p>Generated by our engine to satisfy every position rule with a total friendly to number {n}. Search these endings on the VIP-number sites and re-check any real number with the <a href="../index.html#mainForm">free analyser</a> — your Destiny number can change the verdict.</p>
    <table><tr><th>Pattern</th><th>Examples</th></tr>{lucky_rows}</table>

    <h2 id="pin">Lucky PIN for Birth number {n}</h2>
    <p>These class-recommended PINs total to one of your friendly numbers. Best results come from also including your <a href="../blog/lo-shu-grid-missing-numbers-explained.html">missing numbers</a>, which depend on your full date of birth.</p>
    <table><tr><th>PIN</th><th>Purpose</th><th>Total</th></tr>{pin_rows}</table>

    <h2 id="password">Password totals that suit you</h2>
    <table><tr><th>Total</th><th>Purpose</th><th>Example words</th></tr>{pw_rows}</table>
    <p class="small muted">See the <a href="../blog/chaldean-numerology-password-guide.html">Chaldean password guide</a> for the letter chart.</p>

    <h2 id="wallpaper">Wallpaper for Birth number {n}</h2>
    <ul>{''.join(f'<li>{i}</li>' for i in d['wallpaper']['items'])}<li>Solid <b>{' / '.join(d['wallpaper']['colors'])}</b> colour</li></ul>

    <h2 id="cover">Phone cover and colour</h2>
    <p><b>Covers best suited to {n}:</b></p><ul>{covers}</ul>
    <p><b>Phone colours:</b></p><p class="chips">{colors}</p>

    <h2 id="affirmation">Affirmation, ringtone &amp; mantra</h2>
    <p class="small muted">{a['intro']}</p>
    {''.join(f'<blockquote>"{l}"</blockquote>' for l in a['lines'])}
    <p><b>Ringtone:</b> {', '.join(a['ringtones'])} · <b>Mantra:</b> {a['mantra']}</p>

    <div class="callout cta"><h3>Get the full picture for your date of birth</h3><p>Birth number is half the story — your Destiny number, missing numbers and the actual digits of your phone change the recommendations. The free analyser combines all of it and produces a PDF report.</p><p><a class="btn" href="../index.html#mainForm">✨ Analyse my numbers</a></p></div>

    <h2 id="faq">Frequently asked questions</h2>
    <div class="faq">{''.join(f'<details><summary>{esc(q)}</summary><p>{esc(ans)}</p></details>' for q, ans in faqs)}</div>
    <h3>Read next</h3><ul>{related}</ul>
  </div>
</article>
''' + foot()
        (NUMDIR / f'{slug}.html').write_text(html_)
    # index of the nine numbers
    cards = ''.join(f'''<article class="card post-card"><a href="birth-number-{n}.html">{picture('birth-number-' + n, f"Birth number {n} — {d['planet']}", thumb=True)}</a><div class="body"><span class="tag">{d['planet']}</span><h3><a href="birth-number-{n}.html">Birth Number {n}</a></h3><p>{d['keyword']}. Born on the {', '.join(map(str, d['days']))}.</p></div></article>''' for n, d in NUMBERS.items())
    html_ = head('Birth Numbers 1–9: Lucky Mobile Number, PIN, Wallpaper & Colour for Each', 'Find your birth number from your day of birth and see the lucky mobile number digits, PINs, passwords, wallpaper, cover and colour recommended for numbers 1 to 9.', 'numbers/', f'{SITE_URL}/assets/og-image.jpg') + f'''
<div class="page-head"><div class="breadcrumb"><a href="../index.html">Home</a> › Birth numbers</div><h1>Birth Numbers 1–9</h1><p class="muted" style="max-width:64ch">Your Birth number is the day of the month you were born, reduced to a single digit (29 → 2 + 9 = 11 → 2). Pick yours to see the mobile-number digits, PINs, wallpaper, cover and colour that suit it.</p></div>
<div class="post-grid">{cards}</div>
''' + foot()
    (NUMDIR / 'index.html').write_text(html_)

def tool_pages():
    TDIR = ROOT / 'tools'; TDIR.mkdir(exist_ok=True)
    sidebar = lambda cur: '<aside class="tool-nav"><div class="tool-nav-head">Free calculators</div>' + ''.join(f'<a href="{t["slug"]}.html" class="{"active" if t["slug"] == cur else ""}"><span class="ico">{t["icon"]}</span>{t["name"]}</a>' for t in TOOLS) + '<a href="../index.html#mainForm"><span class="ico">📱</span>Mobile number analyser</a></aside>'
    scripts = lambda: f'<script src="../js/data.js?{VER}" defer></script>\n<script src="../js/numerology.js?{VER}" defer></script>\n<script src="../js/tools.js?{VER}" defer></script>\n<script src="../js/site-config.js'
    for t in TOOLS:
        save_variants(hero_image(dict(title=t['name'] + ' Calculator', img=t['img'])), 'tool-' + t['slug'])
        og = f"{SITE_URL}/assets/blog/tool-{t['slug']}.jpg"
        faq_html = ''.join(f'<details><summary>{esc(q)}</summary><p>{esc(a)}</p></details>' for q, a in t['faqs'])
        ld = json.dumps({"@context": "https://schema.org", "@graph": [
            {"@type": "WebApplication", "name": t['name'] + ' Calculator', "url": f"{SITE_URL}/tools/{t['slug']}.html", "applicationCategory": "LifestyleApplication", "operatingSystem": "Any", "offers": {"@type": "Offer", "price": "0", "priceCurrency": "INR"}, "description": t['meta']},
            {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL + '/'}, {"@type": "ListItem", "position": 2, "name": "Calculators", "item": SITE_URL + '/tools/'}, {"@type": "ListItem", "position": 3, "name": t['name'], "item": f"{SITE_URL}/tools/{t['slug']}.html"}]},
            {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in t['faqs']]}]}, ensure_ascii=False)
        html_ = head(t['title'], t['meta'], f"tools/{t['slug']}.html", og) + f'''
<script type="application/ld+json">{ld}</script>
<div class="tool-layout">
  {sidebar(t['slug'])}
  <div>
    <div class="page-head" style="padding-top:24px">
      <div class="breadcrumb"><a href="../index.html">Home</a> › <a href="./">Calculators</a> › {t['name']}</div>
      <h1>{t['name']} Calculator</h1>
      <p class="muted" style="max-width:70ch">{t['intro']}</p>
    </div>
    <form class="card form" id="f" autocomplete="off">{t['form']}<div class="field-note">Runs entirely in your browser — nothing you enter is stored or sent anywhere.</div></form>
    <div id="toolOut" class="hidden" style="margin-top:18px"></div>
    <div class="prose" style="margin-top:36px">{t['body']}
      <h2 id="faq">Frequently asked questions</h2><div class="faq">{faq_html}</div>
    </div>
  </div>
</div>
''' + foot().replace('<script src="../js/site-config.js', scripts())
        html_ = html_.replace('<body>', f'<body data-tool="{t["tool"]}">')
        (TDIR / f"{t['slug']}.html").write_text(html_)
    cards = ''.join(f'<a class="card tool-card" href="{t["slug"]}.html"><div class="tool-ico">{t["icon"]}</div><h3>{t["name"]}</h3><p class="muted small">{t["short"]}</p></a>' for t in TOOLS)
    html_ = head('Free Numerology Calculators — Life Path, Name, Compatibility, Personal Year, Lo Shu', 'Five free numerology calculators: Life Path number, name numerology (Chaldean & Pythagorean), compatibility by date of birth, Personal Year forecast and Lo Shu grid — plus the mobile number analyser.', 'tools/', f'{SITE_URL}/assets/og-image.jpg') + f'''
<div class="page-head"><div class="breadcrumb"><a href="../index.html">Home</a> › Calculators</div><h1>Free numerology calculators</h1><p class="muted" style="max-width:64ch">Quick, single-purpose tools that run in your browser. For the complete picture — mobile number, PIN, password, wallpaper, cover and a PDF report — use the <a href="../index.html#mainForm">main analyser</a>.</p></div>
<div class="grid grid-3">{cards}<a class="card tool-card" href="../index.html#mainForm"><div class="tool-ico">📱</div><h3>Mobile Number Analyser</h3><p class="muted small">All 10 positions, score, lucky numbers &amp; PDF</p></a></div>
''' + foot()
    (TDIR / 'index.html').write_text(html_)

def sitemap_robots():
    today = datetime.date.today().isoformat()
    urls = [('', '1.0', 'weekly', today), ('blog/', '0.8', 'weekly', today), ('numbers/', '0.8', 'monthly', today), ('tools/', '0.9', 'monthly', today)] + [(f"tools/{t['slug']}.html", '0.8', 'monthly', today) for t in TOOLS] + [(f"blog/{p['slug']}.html", '0.7', 'monthly', p['date']) for p in POSTS] + [(f'numbers/birth-number-{n}.html', '0.7', 'monthly', '2026-09-16') for n in NUMBERS] + [('privacy.html', '0.2', 'yearly', today), ('terms.html', '0.2', 'yearly', today)]
    for l in LANGS:
        if TR.get(l):
            urls.append((f'{l}/blog/', '0.7', 'weekly', today))
            urls += [(f"{l}/blog/{p['slug']}.html", '0.6', 'monthly', p['date']) for p in POSTS if p['slug'] in TR[l]]
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
    for path, pri, freq, mod in urls:
        m = re.match(r'(?:(hi|mr|ta|gu)/)?blog/([a-z0-9-]+)\.html$', path)
        lang_img = ('-' + m.group(1)) if m and m.group(1) else ''
        img = f"\n    <image:image><image:loc>{SITE_URL}/assets/blog/{path.split('/')[-1][:-5]}{lang_img}.jpg</image:loc></image:image>" if path.endswith('.html') and ('blog/' in path or path.startswith('numbers/')) else ''
        alts = ''
        if m: alts = ''.join(f'\n    <xhtml:link rel="alternate" hreflang="{l}" href="{SITE_URL}/{ap}" />' for l, ap in alternates_for(m.group(2)).items())
        elif path.endswith('blog/'): alts = ''.join(f'\n    <xhtml:link rel="alternate" hreflang="{l}" href="{SITE_URL}/{ap}" />' for l, ap in ({'en': 'blog/'} | {l: f'{l}/blog/' for l in LANGS if TR.get(l)}).items())
        xml += f'  <url>\n    <loc>{SITE_URL}/{path}</loc>\n    <lastmod>{mod}</lastmod>\n    <changefreq>{freq}</changefreq>\n    <priority>{pri}</priority>{img}{alts}\n  </url>\n'
    xml += '</urlset>\n'
    (ROOT / 'sitemap.xml').write_text(xml)
    (ROOT / 'robots.txt').write_text(f'User-agent: *\nAllow: /\nDisallow: /404.html\n\nSitemap: {SITE_URL}/sitemap.xml\n')

def inject_static_footers():
    """privacy/terms/404/index keep their own bodies; the footer is replaced between markers."""
    for name in ['index.html', 'privacy.html', 'terms.html', '404.html']:
        f = ROOT / name; html_ = f.read_text()
        if '<!-- footer:start -->' not in html_: continue
        a = html_.index('<!-- footer:start -->'); b = html_.index('<!-- footer:end -->') + len('<!-- footer:end -->')
        body = foot(depth=0, home_anchor='#mainForm' if name == 'index.html' else None)
        body = body.split('</main>', 1)[1].split('<script src=', 1)[0]  # keep only <footer>…</footer> + sticky CTA
        if name == 'index.html':
            # home page is localised at runtime: mark translatable strings
            u = UI['en']
            for key, val in [('f_cta_eye', u['f_cta_eye']), ('f_cta_h', u['f_cta_h']), ('f_cta_p', u['f_cta_p']), ('f_tag', u['f_tag']), ('f_explore', u['f_explore']), ('f_company', u['f_company']), ('f_news', u['f_news']), ('f_newsText', u['f_newsText']), ('f_rights', u['f_rights']), ('f_made', u['f_made']), ('f_expert', u['f_expert']), ('f_analyser', u['f_analyser'])]:
                body = body.replace(f'>{val}<', f' data-i18n="{key}">{val}<', 1).replace(f'>{val} <span', f' data-i18n-html="{key}_x">{val} <span', 1)
            body = body.replace(f">{u['f_cta_btn']} ↗<", f" data-i18n-html=\"f_cta_btn_x\">{u['f_cta_btn']} ↗<")
            body = body.replace(f'placeholder="{u["f_email"]}"', f'placeholder="{u["f_email"]}" data-i18n-ph="f_email"')
            body = body.replace(f'data-thanks="{u["f_thanks"]}"', f'data-thanks="{u["f_thanks"]}" data-i18n-thanks="f_thanks"')
            body = body.replace(f"{u['disclaimer']} {u['credit']}", '<span data-i18n-html="footer.disclaimer"></span> <span data-i18n-html="footer.credit"></span>')
            body = body.replace(f">{u['calc']}<", f" data-i18n=\"nav.calc\">{u['calc']}<").replace(f">{u['numbers']}<", f" data-i18n=\"nav.numbers\">{u['numbers']}<").replace(f">{u['blog']}<", f" data-i18n=\"nav.blog\">{u['blog']}<").replace(f">{u['privacy']}<", f" data-i18n=\"f_privacy\">{u['privacy']}<").replace(f">{u['terms']}<", f" data-i18n=\"f_terms\">{u['terms']}<").replace(f">{u['sitemap']}<", f" data-i18n=\"f_sitemap\">{u['sitemap']}<").replace(f">{u['cta']}<", f" data-i18n=\"report.ctaSticky\">{u['cta']}<")
        f.write_text(html_[:a] + '<!-- footer:start -->' + body + '<!-- footer:end -->' + html_[b:])

if __name__ == '__main__':
    inject_static_footers()
    brand_images()
    for p in POSTS:
        save_variants(hero_image(p), p['slug']); post_page(p)
        for l in LANGS:
            lp = localized(p, l)
            if lp: save_variants(hero_image(lp, l), f"{p['slug']}-{l}"); post_page(p, l)
    index_page()
    for l in LANGS: index_page(l)
    number_pages(); tool_pages(); sitemap_robots()
    total = sum(f.stat().st_size for f in IMG.iterdir())
    n_tr = {l: len(TR.get(l, {})) for l in LANGS}
    print(f"built {len(POSTS)} posts (translations: {n_tr}), indexes, sitemap, robots; {len(list(IMG.iterdir()))} images = {total/1024:.0f} KB")
