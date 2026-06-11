import re
with open('src/App.jsx', 'r') as f:
    content = f.read()

# Fix ALL patterns like: obj.(prop?.[lang] || prop?.en || "")
# Should be: (obj.prop?.[lang] || obj.prop?.en || "")
patterns = [
    # Pattern 1: obj.(prop?.[lang] || prop?.en || "")
    (r'(\w+)\.\((\w+)\?\.\[lang\] \|\| \2\?\.en \|\| ""\)', 
     lambda m: f'({m.group(1)}.{m.group(2)}?.[lang] || {m.group(1)}.{m.group(2)}?.en || "")'),
    # Pattern 2: obj.(prop[lang] || prop?.en || prop?.ja || "")
    (r'(\w+)\.\((\w+)\[lang\] \|\| \2\?\.en \|\| \2\?\.ja \|\| ""\)',
     lambda m: f'({m.group(1)}.{m.group(2)}?.[lang] || {m.group(1)}.{m.group(2)}?.en || "")'),
    # Pattern 3: selectedFish.(gear.tips?.[lang] || gear.tips?.en || "")
    (r'(\w+)\.\((\w+\.\w+)\?\.\[lang\] \|\| \2\?\.en \|\| ""\)',
     lambda m: f'({m.group(1)}.{m.group(2)}?.[lang] || {m.group(1)}.{m.group(2)}?.en || "")'),
]

total = 0
for pattern, repl in patterns:
    new_content, count = re.subn(pattern, repl, content)
    if count:
        print(f'Fixed {count} of pattern: {pattern[:50]}')
        content = new_content
        total += count

print(f'Total fixed: {total}')

# Also do a broader catch-all for any remaining obj.(...)
remaining = re.findall(r'\w+\.\([^)]+\[lang\][^)]*\)', content)
if remaining:
    print(f'Still broken: {len(remaining)}')
    for r in remaining[:5]:
        print(f'  {r[:80]}')

with open('src/App.jsx', 'w') as f:
    f.write(content)

bt = content.count('`')
print(f'Backticks: {bt} ({"even ✅" if bt%2==0 else "ODD ❌"})')
