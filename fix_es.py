with open('src/App.jsx') as f:
    content = f.read()

# Fix 1: Remove duplicate kansai and chubu from REGIONS array
old = '''  const REGIONS = [
    { key: "kyushu",   ja: "九州",     en: "Kyushu",    emoji: "🌋" },
    { key: "hokkaido", ja: "北海道",   en: "Hokkaido",  emoji: "🏔️" },
    { key: "kanto",    ja: "関東",     en: "Kanto",     emoji: "🗼" },
    { key: "kansai",   ja: "関西",     en: "Kansai",    emoji: "⛩️" },
    { key: "chubu",    ja: "中部",     en: "Chubu",     emoji: "🏯" },
    { key: "puertorico", ja: "プエルトリコ", en: "Puerto Rico", es: "Puerto Rico", emoji: "🌴" },
    { key: "kansai",   ja: "関西",     en: "Kansai",    emoji: "⛩️" },
    { key: "chubu",    ja: "中部",   en: "Chubu",     emoji: "🗻" },
    { key: "all",      ja: "全国",   en: "All Japan", emoji: "🗾" },
  ];'''

new = '''  const REGIONS = [
    { key: "kyushu",   ja: "九州",     en: "Kyushu",    es: "Kyushu",      emoji: "🌋" },
    { key: "hokkaido", ja: "北海道",   en: "Hokkaido",  es: "Hokkaido",    emoji: "🏔️" },
    { key: "kanto",    ja: "関東",     en: "Kanto",     es: "Kanto",       emoji: "🗼" },
    { key: "kansai",   ja: "関西",     en: "Kansai",    es: "Kansai",      emoji: "⛩️" },
    { key: "chubu",    ja: "中部",     en: "Chubu",     es: "Chubu",       emoji: "🏯" },
    { key: "puertorico", ja: "プエルトリコ", en: "Puerto Rico", es: "Puerto Rico", emoji: "🌴" },
    { key: "all",      ja: "全国",     en: "All Japan", es: "Todo Japón",  emoji: "🗾" },
  ];'''

count = content.count(old)
content = content.replace(old, new, 1)
print(f"Fixed REGIONS duplicates: {count} replaced")

# Fix 2: Find objects being rendered directly - look for {r[lang]} where r has ja/en keys
# The region button renders r[lang] but r only has ja/en not es
# Find: {r[lang]} or {r.ja} patterns in the region button
import re
# Look for the region button render
idx = content.find('regionFilter === r.key')
print("Region button area:")
print(content[idx-50:idx+200])

with open('src/App.jsx', 'w') as f:
    f.write(content)
print("Done:", len(content))
with open('src/App.jsx') as f:
    content = f.read()

# Find where region label is rendered - r[lang] where r has no es key
# Should be: r[lang] || r.en
import re
old = '{r[lang]}'
new = '{r[lang] || r.en}'
count = content.count(old)
content = content.replace(old, new)
print(f"Fixed r[lang]: {count}")

# Also fix any other spots where a {ja,en} object might render directly
# Look for spots using just [lang] without fallback in map buttons
fixes = [
    ('{r.emoji} {r[lang]}', '{r.emoji} {r[lang] || r.en}'),
    ('>{ r[lang] }<', '>{r[lang] || r.en}<'),
]
for old2, new2 in fixes:
    c = content.count(old2)
    if c: content = content.replace(old2, new2); print(f"Fixed: {old2[:40]} x{c}")

with open('src/App.jsx', 'w') as f:
    f.write(content)
print("Done")
