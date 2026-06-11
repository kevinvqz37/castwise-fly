with open('src/App.jsx') as f:
    lines = f.readlines()

# Extract the 3 late hooks (0-indexed: 3572, 3573, 3740)
late_hooks = []
late_indices = []
for i,l in enumerate(lines):
    if i+1 in [3573, 3574, 3741]:
        late_hooks.append(l)
        late_indices.append(i)

print("Moving these hooks:")
for l in late_hooks:
    print(" ", l.strip()[:70])

# Remove them from current positions (remove in reverse order)
for i in sorted(late_indices, reverse=True):
    lines.pop(i)

# Find insertion point: just before line with "const fileRef = useRef()"
ins = next(i for i,l in enumerate(lines) if 'const fileRef = useRef()' in l)
print(f"Inserting before line {ins+1}")

# Insert the hooks there
for h in reversed(late_hooks):
    lines.insert(ins, h)

with open('src/App.jsx', 'w') as f:
    f.writelines(lines)
print("Done")
