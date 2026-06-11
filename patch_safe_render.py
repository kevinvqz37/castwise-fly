import re

with open('src/App.jsx', 'r') as f:
    content = f.read()

# Pattern 1: Look for {something[lang]} and change to {something[lang] || something.en}
# This prevents React from rendering undefined or falling back to a full object
pattern_dynamic = r'\{([a-zA-Z0-9_\.]+)(\[lang\])\}'
modified, count1 = re.subn(pattern_dynamic, r'{\1[lang] || \1.en}', content)

# Pattern 2: Look for bad fallbacks like {r[lang] || r} which returns the whole object
pattern_bad_fallback = r'\{([a-zA-Z0-9_\.]+)(\[lang\])\s*\|\|\s*\1\}'
modified, count2 = re.subn(pattern_bad_fallback, r'{\1[lang] || \1.en}', modified)

with open('src/App.jsx', 'w') as f:
    f.write(modified)

print(f"Patched dynamic language lookups: {count1}")
print(f"Fixed hazardous object fallbacks: {count2}")
