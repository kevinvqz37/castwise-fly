with open('src/App.jsx', 'r') as f:
    content = f.read()

# Add WEATHER hook call back into main component after userLocation is set
marker = '  const forecast7day = use7DayForecast(userLocation);'
if marker in content and 'WEATHER = useRealWeather' not in content:
    content = content.replace(marker,
        '  const WEATHER = useRealWeather(userLocation);\n' + marker)
    with open('src/App.jsx', 'w') as f:
        f.write(content)
    print('Fixed!')
else:
    print('Already present or marker not found')
    print('WEATHER hook:', 'WEATHER = useRealWeather' in content)
    print('marker:', marker in content)
