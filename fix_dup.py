with open('src/App.jsx', 'r') as f:
    content = f.read()

# Remove the duplicate Firebase block (second occurrence)
dup = '''
const firebaseConfig = {
  apiKey: "AIzaSyCy0qh48dgp31-2xcI1YV3R73qTJGs4tFM",
  authDomain: "castwise-fly.firebaseapp.com",
  projectId: "castwise-fly",
  storageBucket: "castwise-fly.firebasestorage.app",
  messagingSenderId: "468608071051",
  appId: "1:468608071051:web:3d6812edbcf5aacde52b8e",
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);'''

count = content.count('const firebaseConfig')
print(f'firebaseConfig count: {count}')

if count > 1:
    # Remove second occurrence
    idx = content.find('const firebaseConfig')
    idx2 = content.find('const firebaseConfig', idx + 10)
    # Find start of second block (go back to find the comment or newline)
    block_start = content.rfind('\n\n', 0, idx2)
    block_end = content.find('const storage = getStorage(firebaseApp);', idx2) + len('const storage = getStorage(firebaseApp);')
    content = content[:block_start] + content[block_end:]
    with open('src/App.jsx', 'w') as f:
        f.write(content)
    print(f'Fixed! firebaseConfig now appears {content.count("const firebaseConfig")} time(s)')
else:
    print('No duplicate found')
