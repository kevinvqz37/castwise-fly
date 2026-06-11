with open('src/App.jsx', 'r') as f:
    content = f.read()

old = '    { key: "puertorico", ja: "プエルトリコ", en: "Puerto Rico", emoji: "🌴" },   en: "Kansai",    emoji: "⛩️" },'
new = '''    { key: "puertorico", ja: "プエルトリコ", en: "Puerto Rico", emoji: "🌴" },
    { key: "kansai",   ja: "関西",     en: "Kansai",    emoji: "⛩️" },'''

if old in content:
    content = content.replace(old, new, 1)
    with open('src/App.jsx', 'w') as f:
        f.write(content)
    print('Fixed!')
else:
    idx = content.find('puertorico')
    print('puertorico at line:', content[:idx].count('\n')+1)
    print(repr(content[idx-10:idx+120]))
