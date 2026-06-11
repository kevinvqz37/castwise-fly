with open('src/App.jsx') as f:
    lines = f.readlines()

# 1. Locate the exact positions
weather_i = next(i for i,l in enumerate(lines) if 'const WEATHER = useRealWeather' in l)
tabs_i = next(i for i,l in enumerate(lines) if 'const TABS_DATA = [' in l)

# 2. Extract the complete TABS_DATA array using bracket balancing
depth = 0
tabs_end = tabs_i
for i in range(tabs_i, len(lines)):
    depth += lines[i].count('[') - lines[i].count(']')
    if depth <= 0 and i > tabs_i:
        tabs_end = i
        break

# 3. Extract the onboarding block
ob_i = next(i for i,l in enumerate(lines) if 'if (showOnboarding)' in l)
depth = 0
ob_end = ob_i
for i in range(ob_i, len(lines)):
    depth += lines[i].count('{') - lines[i].count('}')
    if depth <= 0 and i > ob_i:
        ob_end = i
        break

print(f"Extracting TABS_DATA from lines {tabs_i+1}-{tabs_end+1}")
print(f"Extracting Onboarding from lines {ob_i+1}-{ob_end+1}")

tabs_block = lines[tabs_i:tabs_end+1]
ob_block = lines[ob_i:ob_end+1]

# 4. Strip both blocks out from their current wrong positions
# Handle stripping based on which block appears later in the file first
if tabs_i > ob_i:
    clean_lines = lines[:ob_i] + lines[ob_end+1:tabs_i] + lines[tabs_end+1:]
else:
    clean_lines = lines[:tabs_i] + lines[tabs_end+1:ob_i] + lines[ob_end+1:]

# 5. Re-find the weather line index in the cleaned array
weather_clean_i = next(i for i,l in enumerate(clean_lines) if 'const WEATHER = useRealWeather' in l)

# 6. Inject them sequentially immediately after WEATHER hook initialization
# Order: WEATHER Hook -> TABS_DATA -> Onboarding Guard -> Rest of Component
final_lines = (
    clean_lines[:weather_clean_i+1] + 
    ['\n'] + tabs_block + 
    ['\n'] + ob_block + 
    clean_lines[weather_clean_i+1:]
)

with open('src/App.jsx', 'w') as f:
    f.writelines(final_lines)

print("Successfully rearranged scopes block safely near the top of component! ✅")
