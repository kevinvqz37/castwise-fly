with open('src/App.jsx') as f:
    lines = f.readlines()

# Find the misplaced hooks (after onboarding)
ob_i = next(i for i,l in enumerate(lines) if 'if (showOnboarding)' in l)
weather_i = next(i for i,l in enumerate(lines) if 'const WEATHER = useRealWeather' in l)

# Collect all hook lines that appear after onboarding
to_move = []
to_remove = set()
for i,l in enumerate(lines):
    if i <= ob_i:
        continue
    s = l.strip()
    if any(s.startswith(x) for x in [
        'const forecast7day','const tideData','const riverConditions',
        'const { isOnline }','useFishingAlerts(','const { journal',
        'const [journalOpen','const [journalEntry','const [locationSharing',
        'const userId','const activeUsers','const [fishIDResult',
        'const [fishIDLoading','const fileRef'
    ]):
        to_move.append(l)
        to_remove.add(i)

print(f'Moving {len(to_move)} lines from after onboarding to before it')

# Remove them
new_lines = [l for i,l in enumerate(lines) if i not in to_remove]

# Insert after WEATHER hook
ins = next(i for i,l in enumerate(new_lines) if 'const WEATHER = useRealWeather' in l)
new_lines = new_lines[:ins+1] + to_move + new_lines[ins+1:]

with open('src/App.jsx', 'w') as f:
    f.writelines(new_lines)

content = open('src/App.jsx').read()
wh = content.find('const WEATHER = useRealWeather')
fc = content.find('const forecast7day')
ob = content.find('if (showOnboarding)')
print(f'WEATHER:{content[:wh].count(chr(10))+1} forecast:{content[:fc].count(chr(10))+1} onboarding:{content[:ob].count(chr(10))+1}')
print(f'All hooks before onboarding: {fc < ob}')
