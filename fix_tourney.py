with open('src/App.jsx', 'r') as f:
    content = f.read()

# The rivalry div closes at line 1177 but needs ) after it
old = '''          </div>
        ) : (
        <div key={t.id} onClick={() => setActiveTournament(t)} style={{ background: t.stat'''

new = '''          </div>
        ) : (
          <div key={t.id} onClick={() => setActiveTournament(t)} style={{ background: t.stat'''

# More reliable fix - find the exact pattern
old2 = '        ) : (\n        <div key={t.id} onClick={() => setActiveTournament(t)}'
new2 = '        ) : (\n          <div key={t.id} onClick={() => setActiveTournament(t)}'

if old2 in content:
    content = content.replace(old2, new2, 1)
    print('Fixed indentation')

# Also fix closing - the non-rivalry div needs proper closing paren
old3 = '        </div>\n        )\n      ))}'
new3 = '        </div>\n        )\n      ))}'

with open('src/App.jsx', 'w') as f:
    f.write(content)

# Check bracket balance around tournament map
idx = content.find('MABO_TOURNAMENTS.map(t =>')
section = content[idx:idx+2500]
opens = section.count('(')
closes = section.count(')')
print(f'Opens: {opens}, Closes: {closes}, Diff: {opens-closes}')
