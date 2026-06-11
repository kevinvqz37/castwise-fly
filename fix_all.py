import re
with open('src/App.jsx', 'r') as f:
    content = f.read()

# Fix all patterns like: obj.gl(prop, lang) -> gl(obj.prop, lang)
pattern = r'(\w+)\.gl\((\w+), lang\)'
def repl(m):
    obj, prop = m.group(1), m.group(2)
    return f'gl({obj}.{prop}, lang)'

new, count = re.subn(pattern, repl, content)
print(f'Fixed {count} obj.gl() patterns')

with open('src/App.jsx', 'w') as f:
    f.write(new)

bt = new.count('`')
print(f'Backticks: {bt} ({"even ✅" if bt%2==0 else "ODD ❌"})')
# Check remaining
remaining = re.findall(r'\w+\.gl\(', new)
print(f'Remaining .gl( calls: {remaining[:5]}')
