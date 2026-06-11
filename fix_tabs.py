with open('src/App.jsx') as f:
    lines = f.readlines()

# Find TABS_DATA definition
tabs_i = next(i for i,l in enumerate(lines) if 'const TABS_DATA = [' in l)
# Find onboarding return
ob_i = next(i for i,l in enumerate(lines) if 'if (showOnboarding)' in l)

print(f'TABS_DATA at line {tabs_i+1}, onboarding at line {ob_i+1}')

if tabs_i > ob_i:
    # Find end of TABS_DATA array
    depth = 0
    tabs_end = tabs_i
    for i in range(tabs_i, len(lines)):
        depth += lines[i].count('[') - lines[i].count(']')
        if depth <= 0 and i > tabs_i:
            tabs_end = i
            break
    print(f'TABS_DATA ends at line {tabs_end+1}')
    
    # Extract and move before onboarding
    tabs_block = lines[tabs_i:tabs_end+1]
    new = lines[:tabs_i] + lines[tabs_end+1:]
    ob_i2 = next(i for i,l in enumerate(new) if 'if (showOnboarding)' in l)
    new = new[:ob_i2] + tabs_block + ['\n'] + new[ob_i2:]
    
    with open('src/App.jsx', 'w') as f:
        f.writelines(new)
    print('Moved TABS_DATA before onboarding ✅')
