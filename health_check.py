import re, os

APP_FILE = 'src/App.jsx'

def read():
    with open(APP_FILE, 'r') as f: return f.read()

def write(content):
    with open(APP_FILE, 'w') as f: f.write(content)

print('=== CastWise Health Check ===\n')
content = read()
issues = []

print('1. WEATHER hook')
if 'WEATHER = useRealWeather' not in content:
    issues.append('WEATHER hook')
    marker = '  const forecast7day = use7DayForecast(userLocation);'
    if marker in content:
        content = content.replace(marker, '  const WEATHER = useRealWeather(userLocation);\n' + marker)
        print('    → restored')
    else:
        print('  ⚠️  marker not found')
else:
    print('  ✅ ok')

print('2. Firebase config')
if content.count('const firebaseConfig') > 1:
    issues.append('duplicate firebase')
    idx = content.find('const firebaseConfig')
    idx2 = content.find('const firebaseConfig', idx + 10)
    block_start = content.rfind('\n\n', 0, idx2)
    block_end = content.find('const storage = getStorage(firebaseApp);', idx2) + len('const storage = getStorage(firebaseApp);')
    content = content[:block_start] + content[block_end:]
    print('    → duplicate removed')
elif 'projectId: "castwise-fly"' not in content:
    issues.append('firebase config')
    firebase = '''
const firebaseConfig = {
  apiKey: "AIzaSyCy0qh48dgp31-2xcI1YV3R73qTJGs4tFM",
  authDomain: "castwise-fly.firebaseapp.com",
  projectId: "castwise-fly",
  storageBucket: "castwise-fly.firebasestorage.app",
  messagingSenderId: "468608071051",
  appId: "1:468608071051:web:3d6812edbcf5aacde52b8e",
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);
'''
    marker = '// ─── ADSTERRA'
    if marker in content:
        content = content.replace(marker, firebase + '\n' + marker, 1)
        print('    → restored')
else:
    print('  ✅ ok')

print('3. FISH_SVG')
if 'const FISH_SVG' not in content:
    issues.append('FISH_SVG')
    content = content.replace('function FishIllustration(', 'const FISH_SVG = {};\nfunction FishIllustration(', 1)
    print('    → restored')
else:
    print('  ✅ ok')

print('4. REGIONS array')
bad = '{ key: "puertorico", ja: "プエルトリコ", en: "Puerto Rico", emoji: "🌴" },   en: "Kansai"'
if bad in content:
    issues.append('REGIONS')
    content = content.replace(bad, '{ key: "puertorico", ja: "プエルトリコ", en: "Puerto Rico", emoji: "🌴" },\n    { key: "kansai",   ja: "関西",     en: "Kansai",    emoji: "⛩️" },')
    print('    → fixed')
else:
    print('  ✅ ok')

print('5. Fly data')
if 'const HATCH_CALENDAR' not in content:
    issues.append('fly data')
    print('  ⚠️  missing - run patch_fly.py')
else:
    print('  ✅ ok')

print('6. MapView')
if content.count('function MapView(') == 0:
    issues.append('MapView missing')
    print('  ⚠️  MapView missing!')
elif content.count('function MapView(') > 1:
    issues.append('duplicate MapView')
    decl = 'function MapView({ selectedFish, lang, userLocation, onOpenLocalAI, activeUsers = [], locationSharing, setLocationSharing, weather, tideData }) {'
    while content.count(decl) > 1:
        content = content.replace(decl, '', 1)
    print(f'    → duplicates removed, now {content.count("function MapView(")}')
else:
    print('  ✅ ok')

write(content)
lines = content.split('\n')
backticks = content.count('`')
print(f'\nFile: {len(content):,} chars, {len(lines)} lines')
print(f'Backticks: {backticks} ({"even ✅" if backticks%2==0 else "ODD ❌"})')
if issues:
    print(f'\n⚠️  Fixed {len(issues)} issue(s): {", ".join(issues)}')
    print('Run: git add src/App.jsx && git commit -m "health check" && git push')
else:
    print('\n✅ All checks passed — safe to push!')
