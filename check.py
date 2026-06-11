with open('src/App.jsx') as f:
    content = f.read()
bt = content.count('`')
print(f'Backticks: {bt} ({"even" if bt%2==0 else "ODD"})')
lines = content.split('\n')
# Check around line 3691 for anything unusual
for i,l in enumerate(lines[3688:3694], 3689):
    print(f'{i}: {repr(l[:100])}')
