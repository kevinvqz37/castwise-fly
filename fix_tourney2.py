with open('src/App.jsx', 'r') as f:
    content = f.read()

# Find and replace the entire tournament map section
old = '''      {MABO_TOURNAMENTS.map(t => (
        t.rivalry ? ('''

# Find the end of the map - "))}
idx_start = content.find(old)
idx_end = content.find('      ))}\n    </div>\n  );\n}\n\n// ─── LINE SHARING', idx_start)
end_marker = '      ))}\n    </div>\n  );\n}\n\n// ─── LINE SHARING'
idx_end = content.find(end_marker, idx_start)
print(f'Start: {idx_start}, End: {idx_end}')

if idx_start > 0 and idx_end > 0:
    new_section = '''      {MABO_TOURNAMENTS.map(t => {
        if (t.rivalry) return (
          <div key={t.id} onClick={() => setActiveTournament(t)} style={{ background: "linear-gradient(135deg, #1a1a14, #2a1a00)", border: "2px solid #FFE500", borderRadius: 14, padding: "14px 16px", marginBottom: 10, cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ background: "#FFE500", color: "#1a1a14", fontSize: "0.72rem", fontWeight: 800, padding: "2px 8px", borderRadius: 99 }}>⚔️ {lang === "ja" ? "ライバル対決" : "RIVALRY"}</span>
              <span style={{ color: "#FFE500", fontSize: "0.75rem" }}>🇵🇷 vs 🇯🇵</span>
            </div>
            <div style={{ fontWeight: 900, fontSize: "0.95rem", color: "#FFE500", marginBottom: 10 }}>{t.name[lang]}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.07)", borderRadius: 10, padding: "8px", textAlign: "center" }}>
                <div style={{ fontSize: "1.4rem" }}>🇵🇷</div>
                <div style={{ color: "white", fontWeight: 800, fontSize: "0.88rem" }}>Kevin</div>
                <div style={{ color: "#aaa", fontSize: "0.72rem", marginTop: 2 }}>{lang === "ja" ? "未記録" : "No catch yet"}</div>
              </div>
              <div style={{ color: "#FFE500", fontWeight: 900, fontSize: "1.3rem" }}>VS</div>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.07)", borderRadius: 10, padding: "8px", textAlign: "center" }}>
                <div style={{ fontSize: "1.4rem" }}>🇯🇵</div>
                <div style={{ color: "white", fontWeight: 800, fontSize: "0.88rem" }}>柳井</div>
                <div style={{ color: "#aaa", fontSize: "0.72rem", marginTop: 2 }}>{lang === "ja" ? "未記録" : "No catch yet"}</div>
              </div>
            </div>
            <div style={{ color: "#aaa", fontSize: "0.75rem", marginBottom: 8 }}>🏆 {t.prize[lang]}</div>
            <div style={{ background: "#FFE500", color: "#1a1a14", borderRadius: 8, padding: "7px", textAlign: "center", fontSize: "0.85rem", fontWeight: 800 }}>
              {lang === "ja" ? "釣果を提出して勝負！→" : "Submit your catch & win! →"}
            </div>
          </div>
        );
        return (
          <div key={t.id} onClick={() => setActiveTournament(t)} style={{ background: t.status === "live" ? "#1a1a14" : "white", border: `2px solid ${t.status === "live" ? "#74c69d" : "#e0e0d8"}`, borderRadius: 14, padding: "14px 16px", marginBottom: 10, cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <span style={{ background: t.status === "live" ? "#74c69d" : "#555", color: t.status === "live" ? "#1a1a14" : "#74c69d", fontSize: "0.72rem", fontWeight: 800, padding: "2px 8px", borderRadius: 99 }}>
                {t.status === "live" ? (lang === "ja" ? `🔴 開催中 · ${t.participants}名参加` : `🔴 LIVE · ${t.participants} anglers`) : (lang === "ja" ? "近日開催" : "UPCOMING")}
              </span>
            </div>
            <div style={{ fontWeight: 800, fontSize: "0.95rem", color: t.status === "live" ? "#74c69d" : "#1a1a14", marginBottom: 4 }}>{t.name[lang]}</div>
            <div style={{ fontSize: "0.78rem", color: t.status === "live" ? "#aaa" : "#888", marginBottom: 4 }}>📍 {t.location[lang]} · {t.period[lang]}</div>
            <div style={{ fontSize: "0.82rem", color: t.status === "live" ? "#74c69d" : "#2d7a3a", fontWeight: 700 }}>{t.prize[lang]}</div>
            <div style={{ marginTop: 10, background: t.status === "live" ? "#74c69d" : "#1a1a14", color: t.status === "live" ? "#1a1a14" : "#74c69d", borderRadius: 8, padding: "7px", textAlign: "center", fontSize: "0.85rem", fontWeight: 800 }}>
              {t.status === "live" ? (lang === "ja" ? "参加・詳細を見る →" : "Join & View Details →") : (lang === "ja" ? "詳細を見る →" : "View Details →")}
            </div>
          </div>
        );
      })}'''

    content = content[:idx_start] + new_section + content[idx_end + len('      ))}'  ):]
    with open('src/App.jsx', 'w') as f:
        f.write(content)
    print('Fixed!')
    bt = content.count('`')
    print(f'Backticks: {bt} ({"even ✅" if bt%2==0 else "ODD ❌"})')
else:
    print(f'Markers not found. Start={idx_start}, End={idx_end}')
