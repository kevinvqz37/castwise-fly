with open('src/App.jsx', 'r') as f:
    content = f.read()
content = content.replace(
    '// Show interstitial every 4 tab switches\n      if (newCount % 4 === 0) {',
    '// Show interstitial every 10 tab switches\n      if (newCount % 10 === 0) {'
)
with open('src/App.jsx', 'w') as f:
    f.write(content)
print('Fixed!' if '% 10' in content else 'Not found')
