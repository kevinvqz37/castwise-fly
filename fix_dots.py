import re
with open('src/App.jsx', 'r') as f:
    content = f.read()

# Fix all patterns like: obj.(prop[lang] || prop?.en || prop?.ja || "")
# Should be: (obj.prop?.[lang] || obj.prop?.en || "")
pattern = r'(\w+)\.\((\w+)\[lang\] \|\| \2\?\.en \|\| \2\?\.ja \|\| ""\)'
def replace_fn(m):
    obj, prop = m.group(1), m.group(2)
    return f'({obj}.{prop}?.[lang] || {obj}.{prop}?.en || "")'

new_content, count = re.subn(pattern, replace_fn, content)
print(f'Fixed {count} patterns')

with open('src/App.jsx', 'w') as f:
    f.write(new_content)

bt = new_content.count('`')
print(f'Backticks: {bt} ({"even ✅" if bt%2==0 else "ODD ❌"})')
