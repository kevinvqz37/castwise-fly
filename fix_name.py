with open('src/App.jsx', 'r') as f:
    content = f.read()

count = content.count('柳井')
content = content.replace('柳井', '梁井')
with open('src/App.jsx', 'w') as f:
    f.write(content)
print(f'Fixed {count} occurrences of 柳井 → 梁井')
