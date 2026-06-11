with open('src/App.jsx', 'r') as f:
    content = f.read()

old = '''{lang === "ja" ? "\U0001f1fa\U0001f1f8 EN" : lang === "en" ? "\U0001f1f5\U0001f1f7 ES" : "\U0001f1ef\U0001f1f5 JP"}
            <button onClick={() => setLang(l => l === "ja" ? "en" : l === "en" ? "es" : "ja")} style={{ background: "#e8e3d8", border: "2px solid #c4bfb4", borderRadius: 8, padding: "6px 12px", color: "#0d7377", cursor: "pointer", fontSize: "0.95rem", fontWeight: 700 }}>
              {lang === "ja" ? "EN" : "\u65e5\u672c\u8a9e"}
            </button>'''

new = '''<button onClick={() => setLang(l => l === "ja" ? "en" : l === "en" ? "es" : "ja")} style={{ background: "#e8e3d8", border: "2px solid #c4bfb4", borderRadius: 8, padding: "6px 12px", color: "#0d7377", cursor: "pointer", fontSize: "1rem", fontWeight: 700 }}>
              {lang === "ja" ? "\U0001f1fa\U0001f1f8" : lang === "en" ? "\U0001f1f5\U0001f1f7" : "\U0001f1ef\U0001f1f5"}
            </button>'''

if old in content:
    content = content.replace(old, new)
    print('Fixed!')
else:
    print('Pattern not found - checking...')
    idx = content.find('lang === "ja" ? "EN" : "\u65e5\u672c\u8a9e"')
    print(f'Old button at line: {content[:idx].count(chr(10))+1 if idx>0 else "not found"}')

with open('src/App.jsx', 'w') as f:
    f.write(content)
