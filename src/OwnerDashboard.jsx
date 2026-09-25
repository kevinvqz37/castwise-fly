import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";

const INK = "#1a1a14", MUTED = "#5a5a4a", TEAL = "#0d7377", CARD = "#fffdf8", LINE = "#e0dbd0";

function Tile({ label, value, sub, accent = TEAL }) {
  return (
    <div style={{ flex: "1 1 120px", background: CARD, border: `2px solid ${LINE}`, borderRadius: 14, padding: "12px 14px" }}>
      <div style={{ fontSize: "0.72rem", color: MUTED, fontWeight: 700, letterSpacing: ".04em" }}>{label}</div>
      <div style={{ fontSize: "1.8rem", fontWeight: 900, color: accent, lineHeight: 1.2 }}>{value}</div>
      {sub && <div style={{ fontSize: "0.72rem", color: MUTED }}>{sub}</div>}
    </div>
  );
}

export default function OwnerDashboard({ lang = "ja" }) {
  const [d, setD] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);
  const L = (ja, en) => (lang === "ja" ? ja : en);

  async function load() {
    try {
      const t = await getAuth().currentUser?.getIdToken();
      const r = await fetch("/api/stats", { headers: { Authorization: `Bearer ${t}` } });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || r.status);
      setD(j); setErr(null);
    } catch (e) { setErr(e.message); }
    setLoading(false);
  }
  useEffect(() => { load(); const i = setInterval(load, 60000); return () => clearInterval(i); }, []);

  if (loading) return <div style={{ padding: 20, color: MUTED }}>📊 {L("読み込み中…", "Loading…")}</div>;
  if (err) return <div style={{ padding: 20, color: "#b82030" }}>⚠️ {err}</div>;

  const days = d.days || [];
  const max = Math.max(1, ...days.map(x => x.visits));
  const t = d.today || {};
  const week = days.slice(-7).reduce((a, x) => a + x.visits, 0);
  const refs = {};
  days.slice(-7).forEach(x => Object.entries(x.refs || {}).forEach(([k, v]) => (refs[k] = (refs[k] || 0) + v)));
  const topRefs = Object.entries(refs).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const ago = ms => { const m = Math.round((Date.now() - ms) / 60000); return m < 1 ? L("たった今", "just now") : m < 60 ? `${m}${L("分前", "m ago")}` : `${Math.round(m / 60)}${L("時間前", "h ago")}`; };
  const EV = { visit: L("👀 アプリを開いた", "👀 opened the app"), new_user: L("🎉 新規ユーザー", "🎉 new user"), ai_use: L("🤖 AI診断", "🤖 used AI"), catch_logged: L("🐟 釣果を記録", "🐟 logged a catch"), pro_click: L("👑 PROボタン", "👑 tapped PRO") };

  return (
    <div style={{ animation: "fadeUp 0.3s ease", color: INK }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ fontWeight: 900, fontSize: "1.05rem" }}>📊 {L("オーナーダッシュボード", "Owner dashboard")}</div>
        <button onClick={load} style={{ marginLeft: "auto", background: CARD, border: `2px solid ${LINE}`, borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: "0.8rem" }}>↻</button>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        <Tile label={L("今いる人", "LIVE NOW")} value={d.live} accent={d.live > 0 ? "#2d7a3a" : MUTED}
          sub={Object.entries(d.liveRefs || {}).map(([k, v]) => `${k} ${v}`).join(" · ")} />
        <Tile label={L("今日の訪問", "VISITS TODAY")} value={t.visits || 0} sub={L(`新規 ${t.newUsers || 0}人`, `${t.newUsers || 0} new`)} />
        <Tile label={L("7日間", "LAST 7 DAYS")} value={week} />
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        <Tile label={L("PRO会員", "PRO SUBS")} value={d.pro?.active ?? "–"} accent="#6040a0"
          sub={d.pro?.mrrJpy != null ? `¥${d.pro.mrrJpy.toLocaleString()}/${L("月", "mo")}` : ""} />
        <Tile label={L("登録ユーザー", "ACCOUNTS")} value={d.totals?.users ?? "–"} />
        <Tile label={L("釣果投稿", "CATCHES")} value={d.totals?.catches ?? "–"} />
      </div>

      <div style={{ background: CARD, border: `2px solid ${LINE}`, borderRadius: 14, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: "0.8rem", fontWeight: 800, marginBottom: 10 }}>{L("日別アクセス（14日）", "Daily visits (14 days)")}</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 110 }}>
          {days.map(x => (
            <div key={x.day} title={`${x.day}: ${x.visits}`} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <div style={{ fontSize: "0.6rem", color: MUTED }}>{x.visits || ""}</div>
              <div style={{ width: "100%", height: `${Math.round((x.visits / max) * 80)}px`, minHeight: x.visits ? 3 : 0, background: TEAL, borderRadius: "4px 4px 0 0" }} />
              <div style={{ fontSize: "0.55rem", color: MUTED }}>{x.day.slice(8)}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 220px", background: CARD, border: `2px solid ${LINE}`, borderRadius: 14, padding: 14 }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 800, marginBottom: 8 }}>{L("流入元（7日）", "Where they came from (7d)")}</div>
          {topRefs.length ? topRefs.map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", padding: "3px 0", borderBottom: `1px solid ${LINE}` }}>
              <span>{k}</span><strong>{v}</strong>
            </div>
          )) : <div style={{ fontSize: "0.8rem", color: MUTED }}>—</div>}
        </div>
        <div style={{ flex: "1 1 220px", background: CARD, border: `2px solid ${LINE}`, borderRadius: 14, padding: 14 }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 800, marginBottom: 8 }}>{L("最近の動き", "Recent activity")}</div>
          {(d.recent || []).slice(0, 12).map((e, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: "0.78rem", padding: "3px 0", borderBottom: `1px solid ${LINE}` }}>
              <span>{EV[e.name] || e.name}</span>
              <span style={{ color: MUTED, whiteSpace: "nowrap" }}>{e.ref !== "direct" ? `${e.ref} · ` : ""}{ago(e.t)}</span>
            </div>
          ))}
          {!(d.recent || []).length && <div style={{ fontSize: "0.8rem", color: MUTED }}>—</div>}
        </div>
      </div>
      <div style={{ fontSize: "0.7rem", color: MUTED, marginTop: 10 }}>{L("60秒ごとに自動更新", "Auto-refreshes every 60s")}</div>
    </div>
  );
}
