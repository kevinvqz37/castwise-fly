import re

with open('src/App.jsx', 'r') as f:
    content = f.read()

# This looks for any instance of {variable[lang]} and replaces it with {variable[lang] || variable.en}
# It ignores matches that already have a safe fallback logic applied
def replacer(match):
    full_match = match.group(0)
    var_name = match.group(1)
    # If it already contains a fallback condition, don't double-patch it
    if '||' in full_match:
        return full_match
    return f"{{{var_name}[lang] || {var_name}.en}}"

# Target patterns like {item[lang]} or {r[lang]} or {current.data[lang]}
updated = re.sub(r'\{([a-zA-Z0-9_\.]+)(\[lang\][^}]*)\}', replacer, content)

with open('src/App.jsx', 'w') as f:
    f.write(updated)

print("Safety net injected.")
