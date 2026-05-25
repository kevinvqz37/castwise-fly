with open('src/App.jsx', 'r') as f:
    content = f.read()

# Check if already defined
if 'const FISH_SVG = {' in content:
    print('Already defined!')
else:
    # Insert before FishIllustration function
    insert_before = 'function FishIllustration('
    idx = content.find(insert_before)
    if idx < 0:
        print('FishIllustration not found either')
    else:
        fish_svg = '''const FISH_SVG = {};
// Fish SVGs defined inline in FishIllustration
'''
        content = content[:idx] + fish_svg + content[idx:]
        # Now fix FishIllustration to not use FISH_SVG lookup
        content = content.replace(
            'const Component = FISH_SVG[fishId];',
            'const Component = null;'
        )
        content = content.replace(
            'if (!Component) return <span style={{ fontSize: size * 0.5 }}>🐟</span>;',
            'return <span style={{ fontSize: size * 0.5 }}>🐟</span>;'
        )
        with open('src/App.jsx', 'w') as f:
            f.write(content)
        print('Patched - fish will show as emoji temporarily')
