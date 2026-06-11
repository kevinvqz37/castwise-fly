with open('src/App.jsx') as f:
    lines = f.readlines()

def find_line(query):
    return next(i for i, l in enumerate(lines) if query in l)

# 1. Map current file positions
weather_i = find_line('const WEATHER = useRealWeather')
tabs_i = find_line('const TABS_DATA = [')
ob_i = find_line('if (showOnboarding)')
diff_i = find_line('const diffMap = ')
filtered_i = find_line('const filteredFish = ')

# Find where the filteredFish assignment statement block ends (the closing semicolon)
fish_end = filtered_i
for i in range(filtered_i, len(lines)):
    if ';' in lines[i]:
        fish_end = i
        break

print(f"Extracting dependency block from lines {diff_i+1} to {fish_end+1}")
dependency_block = lines[diff_i:fish_end+1]

# 2. Strip the dependency block out of its lower position
clean_lines = lines[:diff_i] + lines[fish_end+1:]

# 3. Re-locate TABS_DATA in the newly sliced array
tabs_clean_i = next(i for i, l in enumerate(clean_lines) if 'const TABS_DATA = [' in l)

# 4. Inject the dependencies safely directly above TABS_DATA
final_lines = clean_lines[:tabs_clean_i] + dependency_block + ['\n'] + clean_lines[tabs_clean_i:]

with open('src/App.jsx', 'w') as f:
    f.writelines(final_lines)

print("Dependencies successfully shifted above TABS_DATA! ✅")
