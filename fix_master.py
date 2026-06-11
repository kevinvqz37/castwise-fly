import re
with open('src/App.jsx', 'r') as f:
    content = f.read()

# Fix selectedFish.(gear.tips...) style broken patterns
pattern = r'(\w+)\.\((\w+(?:\.\w+)+)\?\.\[lang\][^)]*\)'
def repl(m):
    obj, prop = m.group(1), m.group(2)
    return f'({obj}.{prop}?.[lang] || {obj}.{prop}?.en || "")'
new, n = re.subn(pattern, repl, content)
print(f'Fixed nested: {n}')

# Fix remaining obj.(prop?.[lang]...) patterns  
pattern2 = r'(\w+)\.\((\w+)\?\.\[lang\][^)]*\)'
def repl2(m):
    obj, prop = m.group(1), m.group(2)
    return f'({obj}.{prop}?.[lang] || {obj}.{prop}?.en || "")'
new, n2 = re.subn(pattern2, repl2, new)
print(f'Fixed simple: {n2}')

# Fix any remaining or "" -> || ""
new = new.replace(' or ""', ' || ""')

with open('src/App.jsx', 'w') as f:
    f.write(new)

remaining = re.findall(r'\w+\.\(\w', new)
print(f'Remaining broken: {len(remaining)}')
bt = new.count('`')
print(f'Backticks: {bt} ({"even" if bt%2==0 else "ODD"})')
