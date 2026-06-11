with open('src/App.jsx', 'r') as f:
    content = f.read()

# MaboHeader was inserted before WEATHER is defined
# Move MaboHeader to AFTER the hooks section
mabo_start = content.find('  // ─── MABO BRAND HEADER')
mabo_end = content.find('\n\n  const WEATHER', mabo_start)

if mabo_start > 0 and mabo_end > 0:
    mabo_block = content[mabo_start:mabo_end]
    # Remove from current location
    content = content[:mabo_start] + content[mabo_end:]
    # Insert after WEATHER and other hooks - find a safe spot after all hooks
    insert_after = '  useFishingAlerts(WEATHER, userLocation, lang);'
    idx = content.find(insert_after)
    if idx > 0:
        insert_pos = idx + len(insert_after)
        content = content[:insert_pos] + '\n\n' + mabo_block + content[insert_pos:]
        print('MaboHeader moved after hooks ✅')
    else:
        print('Insert point not found')
else:
    print(f'MaboHeader start: {mabo_start}, end: {mabo_end}')

with open('src/App.jsx', 'w') as f:
    f.write(content)
