with open('src/App.jsx', 'r') as f:
    content = f.read()

# Replace the s() function and add a global getLang helper
old_s = 'function s(key, lang) { return T[key]?.[lang] || T[key]?.["en"] || key; }'
new_s = '''function s(key, lang) { return T[key]?.[lang] || T[key]?.["en"] || key; }
function gl(obj, lang) { if (!obj) return ""; return obj[lang] || obj.en || obj.ja || ""; }'''

content = content.replace(old_s, new_s)

# Now replace ALL remaining direct [lang] accesses on data objects
# These are the ones inside JSX that access spot/fish data
import re

# Replace patterns like: spot.fish[lang], spot.type[lang] etc  
# with: gl(spot.fish, lang), gl(spot.type, lang)
data_props = ['fish', 'type', 'tip', 'access', 'bestSeason', 'desc', 'season',
              'technique', 'target', 'name', 'note', 'prize', 'rule', 'period',
              'location', 'label', 'permit', 'sub', 'condition', 'wind',
              'moonPhase', 'waterClarity', 'flow', 'hotLures', 'flyNote',
              'topFish', 'tips', 'free', 'pro', 'badge', 'color', 'month', 'steps']

count = 0
for prop in data_props:
    # Match word.prop[lang] but not T[key][lang] or similar
    pattern = rf'(?<!\w)(\w+)\.{prop}\[lang\]'
    def make_repl(p):
        return lambda m: f'gl({m.group(1)}.{p}, lang)'
    new, n = re.subn(pattern, make_repl(prop), content)
    if n:
        content = new
        count += n

print(f'Replaced {count} direct [lang] accesses with gl()')

with open('src/App.jsx', 'w') as f:
    f.write(content)

bt = content.count('`')
print(f'Backticks: {bt} ({"even ✅" if bt%2==0 else "ODD ❌"})')
