import shutil
import os

src = '/mnt/user-data/outputs/castwise-fly.jsx'
dst = 'src/App.jsx'

shutil.copy2(src, dst)
print(f'Copied {os.path.getsize(dst):,} bytes to {dst}')

with open(dst) as f:
    content = f.read()

for name in ['FISH_SVG', 'function s(', 'const T =', 'FISH_DATA', 'MAP_SPOTS', 'useState']:
    print(f"{'OK' if name in content else 'MISSING'} {name}")
