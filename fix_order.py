with open('src/App.jsx') as f:
    lines = f.readlines()

def find_block_end(start):
    # Find end of a single statement (next blank line or semicolon line)
    for i in range(start, min(start+20, len(lines))):
        if lines[i].strip().endswith(';') or lines[i].strip().endswith('}'):
            return i
    return start

diff_i = next(i for i,l in enumerate(lines) if 'const diffMap = ' in l)
cat_i = next(i for i,l in enumerate(lines) if 'const catMap = ' in l)
fish_cats_i = next(i for i,l in enumerate(lines) if 'const FISH_CATS = ' in l)
filtered_i = next(i for i,l in enumerate(lines) if 'const filteredFish = ' in l)
ob_i = next(i for i,l in enumerate(lines) if 'if (showOnboarding)' in l)

print(f'ob_i={ob_i+1} diff={diff_i+1} cat={cat_i+1} fish_cats={fish_cats_i+1} filtered={filtered_i+1}')

# Find end of each block
diff_end = find_block_end(diff_i)
cat_end = find_block_end(cat_i)
fish_end = find_block_end(fish_cats_i)
filtered_end = find_block_end(filtered_i)

# Extract blocks (in reverse order to not mess up indices)
blocks = sorted([(diff_i, diff_end), (cat_i, cat_end), (fish_cats_i, fish_end), (filtered_i, filtered_end)], reverse=True)

extracted = []
for start, end in blocks:
    extracted.insert(0, lines[start:end+1] + ['\n'])
    lines = lines[:start] + lines[end+1:]

# Re-find onboarding position
ob_i = next(i for i,l in enumerate(lines) if 'if (showOnboarding)' in l)
print(f'Inserting before onboarding at line {ob_i+1}')

# Insert all blocks before onboarding
insert_lines = []
for block in extracted:
    insert_lines.extend(block)

lines = lines[:ob_i] + insert_lines + lines[ob_i:]

with open('src/App.jsx', 'w') as f:
    f.writelines(lines)
print('Done ✅')
