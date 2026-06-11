with open('src/App.jsx', 'r') as f:
    lines = f.readlines()

# Let's targetedly fix line 1331 (Index 1330 in Python 0-indexed list)
# We need to change the broken brace back to an open div, and put the text inside the div.
broken_line = lines[1330]
print("Original broken line:", broken_line)

# Reconstruct line 1331 properly:
# It should be a <div> element, containing the localized day name string, followed by {d}</div>
fixed_line = '      <div style={{ textAlign: "center", fontSize: "0.75rem", color: i === 0 ? "#b82030" : i === 6 ? "#1565a0" : "#7a7a6a", fontWeight: 700, padding: "4px 0" }}>{dayNames[lang] || dayNames.en || ""}</div>\n'

lines[1330] = fixed_line

with open('src/App.jsx', 'w') as f:
    f.writelines(lines)

print("Line 1331 has been perfectly reconstructed.")
