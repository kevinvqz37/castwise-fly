with open('src/App.jsx') as f:
    content = f.read()

# 1. Pass showHeatmap + weather to LeafletMap
old = '<LeafletMap spots={spots} userLocation={userLocation} activeSpot={activeSpot} setActiveSpot={setActiveSpot} lang={lang} activeUsers={activeUsers} />'
new = '<LeafletMap spots={spots} userLocation={userLocation} activeSpot={activeSpot} setActiveSpot={setActiveSpot} lang={lang} activeUsers={activeUsers} showHeatmap={showHeatmap} weather={weather} />'
content = content.replace(old, new, 1)
print('LeafletMap props:', new in content)

# 2. Update LeafletMap signature
old2 = 'function LeafletMap({ spots, userLocation, activeSpot, setActiveSpot, lang, activeUsers = [] }) {'
new2 = 'function LeafletMap({ spots, userLocation, activeSpot, setActiveSpot, lang, activeUsers = [], showHeatmap = false, weather = {} }) {'
content = content.replace(old2, new2, 1)
print('Signature:', new2 in content)

# 3. Add heatmap circles in renderMarkers - insert before user location marker
old3 = '''    // User location marker
    if (userLocation) {'''
new3 = '''    // Heatmap circles
    if (showHeatmap) {
      spots.forEach(spot => {
        const coords = SPOT_COORDS[spot.name] || (spot.lat ? { lat: spot.lat, lng: spot.lng } : null);
        if (!coords) return;
        const score = calcSpotScore(spot, weather, [], activeUsers);
        const color = score >= 80 ? "#00ff88" : score >= 60 ? "#FFE500" : score >= 40 ? "#ff8800" : "#ff4444";
        const radius = 1000 + (score * 20);
        const c1 = L.circle([coords.lat, coords.lng], { radius: radius * 1.6, color: color, fillColor: color, fillOpacity: 0.1, weight: 0 }).addTo(map);
        const c2 = L.circle([coords.lat, coords.lng], { radius: radius, color: color, fillColor: color, fillOpacity: 0.22, weight: 1, opacity: 0.5 }).addTo(map);
        markersRef.current.push(c1, c2);
      });
    }

    // User location marker
    if (userLocation) {'''
content = content.replace(old3, new3, 1)
print('Circles added:', 'Heatmap circles' in content)

# 4. Add showHeatmap to the re-render useEffect deps
old4 = '  }, [spots, userLocation, lang, activeUsers]);'
new4 = '  }, [spots, userLocation, lang, activeUsers, showHeatmap]);'
content = content.replace(old4, new4, 1)
print('Deps updated:', new4 in content)

with open('src/App.jsx', 'w') as f:
    f.write(content)
print('Saved:', len(content))
