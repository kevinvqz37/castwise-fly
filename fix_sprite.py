with open('src/App.jsx', 'r') as f:
    content = f.read()
content = content.replace('const SPRITE_ROWS = 5;', 'const SPRITE_ROWS = 4;')
with open('src/App.jsx', 'w') as f:
    f.write(content)
print('Fixed!' if 'SPRITE_ROWS = 4' in content else 'Not found')
