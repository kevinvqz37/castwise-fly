import re
with open('src/App.jsx') as f:
    lines = f.readlines()

print("Hooks inside if/for/while blocks:")
brace_depth = 0
paren_depth = 0
for i, l in enumerate(lines):
    stripped = l.strip()
    # Track if we're inside a conditional block
    if re.search(r'^\s*(if|for|while|switch)\s*\(', l):
        pass
    if re.search(r'use(State|Effect|Ref|Memo|Callback|LocalStorage|RealWeather|ActiveUsers|OfflineMode|FishingAlerts|RealTideData|RiverConditions|7DayForecast)\s*\(', l):
        # Count leading spaces to estimate nesting
        indent = len(l) - len(l.lstrip())
        if indent > 2:  # More than 1 level of indent = inside something
            print(f"  Line {i+1} (indent={indent}): {stripped[:80]}")
