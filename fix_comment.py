with open('src/App.jsx', 'r') as f:
    content = f.read()

bad = '─ SEASONAL COMPONENTS ─────────────────────────────────────────────────────'
good = '// ─── SEASONAL COMPONENTS ──────────────────────────────────────────────────'

if bad in content:
    content = content.replace(bad, good, 1)
    with open('src/App.jsx', 'w') as f:
        f.write(content)
    print('Fixed!')
else:
    # Find line 1543
    lines = content.split('\n')
    print('Line 1543:', repr(lines[1542]))
