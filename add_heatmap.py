import urllib.request

url = 'https://raw.githubusercontent.com/kevinvqz37/castwise-fly/main/src/App.jsx'
content = urllib.request.urlopen(url).read().decode()
print(f'Downloaded: {len(content):,} chars')

# 1. Add showHeatmap state to MapView
content = content.replace(
    '  const [showAR, setShowAR] = useState(false);',
    '  const [showHeatmap, setShowHeatmap] = useState(false);'
)

# 2. Replace AR button with heatmap button
old = '''      <button onClick={() => setShowAR(true)} style={{ width: "100%", marginBottom: 10, padding: "10px", background: "#1a1a14", border: "none", borderRadius: 12, color: "#FFE500", cursor: "pointer", fontFamily: "inherit", fontSize: "0.88rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        📷 {lang === "ja" ? "ARカメラで釣り場を探す" : lang === "es" ? "Buscar con Cámara AR" : "Find Spots with AR Camera"}
      </button>'''
new = '''      <button onClick={() => setShowHeatmap(h => !h)} style={{ width: "100%", marginBottom: 10, padding: "10px", background: showHeatmap ? "#0d7377" : "#1a1a14", border: "none", borderRadius: 12, color: "#FFE500", cursor: "pointer", fontFamily: "inherit", fontSize: "0.88rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        🔥 {lang === "ja" ? (showHeatmap ? "ヒートマップ非表示" : "魚活性ヒートマップ") : (showHeatmap ? "Hide Heatmap" : "Fish Activity Heatmap")}
      </button>'''
content = content.replace(old, new, 1)

# 3. Remove AR view render
old2 = '''      {/* AR Camera View */}
      {showAR && (
        <ARCameraView
          userLocation={userLocation}
          spots={MAP_SPOTS}
          lang={lang}
          weather={weather}
          onClose={() => setShowAR(false)}
        />
      )}'''
content = content.replace(old2, '', 1)

# 4. Add heatmap overlay after LeafletMap
old3 = '''      {activeSpot && ('''
new3 = '''      {/* Heatmap overlay */}
      {showHeatmap && (
        <div style={{ marginBottom: 10 }}>
          {spots.slice(0,10).map((spot, i) => {
            const score = calcSpotScore(spot, weather, [], activeUsers);
            const color = score >= 80 ? "#00ff88" : score >= 60 ? "#FFE500" : "#ff8800";
            return (
              <div key={spot.id || i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px", background: "rgba(0,0,0,0.05)", borderRadius: 8, marginBottom: 4 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}`, flexShrink: 0 }} />
                <span style={{ fontSize: "0.82rem", flex: 1 }}>{spot.icon} {spot.name}</span>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color }}>{score}</span>
              </div>
            );
          })}
        </div>
      )}

      {activeSpot && ('''
content = content.replace(old3, new3, 1)

print(f'showHeatmap:', 'showHeatmap' in content)
print(f'heatmap button:', 'ヒートマップ' in content)

open('src/App.jsx', 'w').write(content)
print(f'Saved: {len(content):,} chars')
