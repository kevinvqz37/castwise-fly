with open('src/App.jsx', 'r') as f:
    content = f.read()

bad = "noCatchYet: { ja: 'まだ釣果がありません。\n釣りに行きましょう！', en: 'No catches yet.\nGet out there!' },"
good = 'noCatchYet: { ja: "まだ釣果がありません。\\n釣りに行きましょう！", en: "No catches yet.\\nGet out there!" },'

if bad in content:
    content = content.replace(bad, good, 1)
    with open('src/App.jsx', 'w') as f:
        f.write(content)
    print('Fixed!')
else:
    idx = content.find('noCatchYet')
    print('noCatchYet at:', idx)
    print(repr(content[idx:idx+120]))
