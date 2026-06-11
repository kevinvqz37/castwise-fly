with open('src/App.jsx', 'r') as f:
    content = f.read()

# Remove the orphaned second MAP VIEW section
bad = '''}


// ─── MAP VIEW ────────────────────────────────────────────────────────────────
  const REGIONS = [
    { key: "kyushu",     ja: "九州",       en: "Kyushu",     emoji: "🌋" },
    { key: "hokkaido",   ja: "北海道",     en: "Hokkaido",   emoji: "🏔️" },
    { key: "kanto",      ja: "関東",       en: "Kanto",      emoji: "🗼" },
    { key: "kansai",     ja: "関西",       en: "Kansai",     emoji: "⛩️" },
    { key: "chubu",      ja: "中部",       en: "Chubu",      emoji: "🗻" },
    { key: "puertorico", ja: "プエルトリコ", en: "Puerto Rico", emoji: "🌴" },
    { key: "all",        ja: "全国",       en: "All Japan",  emoji: "🗾" },'''

good = '''}


// ─── MAP VIEW placeholder removed'''

if bad in content:
    # Find where this orphaned section ends (before the next top-level function)
    idx = content.find(bad)
    # Find the end of this orphaned block - look for next top-level function
    next_fn = content.find('\nfunction ', idx + len(bad))
    print(f'Orphaned section from char {idx} to {next_fn}')
    print('Removing orphaned block...')
    content = content[:idx+1] + '\n\n' + content[next_fn:]
    with open('src/App.jsx', 'w') as f:
        f.write(content)
    print(f'Done! MapView count: {content.count("function MapView(")}')
    bt = content.count('`')
    print(f'Backticks: {bt} ({"even ✅" if bt%2==0 else "ODD ❌"})')
else:
    print('Pattern not found - checking manually')
    idx = content.find('// ─── MAP VIEW')
    while idx >= 0:
        print(f'  MAP VIEW comment at line {content[:idx].count(chr(10))+1}')
        idx = content.find('// ─── MAP VIEW', idx+1)
