import re
with open('src/App.jsx', 'r') as f:
    content = f.read()

# Fix bad replacements where single letter variables got mangled
# tgl(agline, lang) should be (tagline?.[lang] || tagline?.en || "")
# Also fix any other mangled short vars

fixes = [
    # Mangled tagline
    ('tgl(agline, lang)', '(tagline?.[lang] || tagline?.en || "")'),
    # t[lang] was wrongly replaced - t is a tournament object
    ('gl(t, lang)', 't[lang]'),
    # f[lang] might be a fish object - keep as gl
    # b[lang] - keep as gl
    # d[lang] - keep as gl  
    # v[lang] - keep as gl
]

count = 0
for old, new in fixes:
    if old in content:
        content = content.replace(old, new)
        count += 1
        print(f'✅ Fixed: {old}')

# Also check for other mangled patterns
mangled = re.findall(r'\bgl\([a-z], lang\)', content)
print(f'\nRemaining single-letter gl() calls: {set(mangled)}')

with open('src/App.jsx', 'w') as f:
    f.write(content)

bt = content.count('`')
print(f'Backticks: {bt} ({"even ✅" if bt%2==0 else "ODD ❌"})')
