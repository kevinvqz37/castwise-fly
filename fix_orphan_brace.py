with open('src/App.jsx', 'r') as f:
    lines = f.readlines()

# Print the broken neighborhood for visibility
print("Before fix:")
for i in range(1328, 1335):
    if i < len(lines):
        print(f"{i+1}: {lines[i]}", end="")

# Line 1332 is index 1331. Let's fix the closing mapping block cleanly.
# It should just close the map loop block cleanly, usually just '        ' or '      }))' 
# depending on how the array map opened.
if "})}" in lines[1331]:
    lines[1331] = lines[1331].replace("})}", "})")
elif "}}" in lines[1331]:
    lines[1331] = lines[1331].replace("}}", "}")

with open('src/App.jsx', 'w') as f:
    f.writelines(lines)

print("\nAfter fix:")
for i in range(1328, 1335):
    if i < len(lines):
        print(f"{i+1}: {lines[i]}", end="")
