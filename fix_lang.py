with open('src/App.jsx') as f:
    content = f.read()

# Fix duplicate JP flag on line 3830
old = 'lang === "ja" ? "🇯🇵 JP" : lang === "en" ? "🇺🇸 EN" : "🇯🇵 JP"}'
new = 'lang === "ja" ? "🇯🇵 JP" : lang === "en" ? "🇺🇸 EN" : "🇵🇷 ES"}'
content = content.replace(old, new, 1)
print("Fixed duplicate flag:", old not in content)

# Fix hotLures crash on es - use [] not ""
old2 = '(tip.hotLures?.[lang] || tip.hotLures?.en || tip.hotLures?.ja || "").map('
new2 = '(tip.hotLures?.[lang] || tip.hotLures?.en || tip.hotLures?.ja || []).map('
count = content.count(old2)
content = content.replace(old2, new2)
print(f"Fixed hotLures crash: {count} places")

with open('src/App.jsx', 'w') as f:
    f.write(content)
print("Done:", len(content))
