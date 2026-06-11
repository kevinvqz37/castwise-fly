with open('src/App.jsx', 'r') as f:
    content = f.read()

# Fix wrong project ID in first config
content = content.replace('projectId: "mabo-fly"', 'projectId: "castwise-fly"')
content = content.replace('authDomain: "mabo-fly.firebaseapp.com"', 'authDomain: "castwise-fly.firebaseapp.com"')
content = content.replace('storageBucket: "mabo-fly.firebasestorage.app"', 'storageBucket: "castwise-fly.firebasestorage.app"')

# Remove duplicate firebase block if present
while content.count('const firebaseConfig') > 1:
    idx = content.find('const firebaseConfig')
    idx2 = content.find('const firebaseConfig', idx + 10)
    block_start = content.rfind('\n\n', 0, idx2)
    block_end = content.find('const storage = getStorage(firebaseApp);', idx2) + len('const storage = getStorage(firebaseApp);')
    content = content[:block_start] + content[block_end:]

with open('src/App.jsx', 'w') as f:
    f.write(content)

print(f'firebaseConfig count: {content.count("const firebaseConfig")}')
print(f'projectId castwise: {"castwise-fly" in content}')
bt = content.count('`')
print(f'Backticks: {bt} ({"even ✅" if bt%2==0 else "ODD ❌"})')
