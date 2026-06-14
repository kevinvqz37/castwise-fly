#!/usr/bin/env python3
"""
Fixes Tournament view:
- Adds working photo upload (camera + gallery)
- Makes input text visible (explicit text color)
- Disables submit until species, weight, AND photo are all set

Run from castwise-fly repo root:
    python3 fix_tournament.py
"""
import os, sys

FILE = "src/App.jsx"
if not os.path.exists(FILE):
    print(f"ERROR: {FILE} not found. Run from repo root.")
    sys.exit(1)

src = open(FILE).read()
orig = src
n = 0

def patch(old, new, label):
    global src, n
    if old in src:
        src = src.replace(old, new, 1)
        n += 1
        print(f"  ✓ {label}")
    elif new in src:
        print(f"  • {label} (already applied)")
    else:
        print(f"  ⚠ {label} — anchor not found")

# 1) Add photo state + handler to TournamentView
old1 = '''function TournamentView({ lang, profile, myCatches }) {
  const [activeTournament, setActiveTournament] = useState(null);
  const [showJoin, setShowJoin] = useState(false);
  const [submitWeight, setSubmitWeight] = useState("");
  const [submitSpecies, setSubmitSpecies] = useState("");
  const [submitted, setSubmitted] = useState(false);'''

new1 = '''function TournamentView({ lang, profile, myCatches }) {
  const [activeTournament, setActiveTournament] = useState(null);
  const [showJoin, setShowJoin] = useState(false);
  const [submitWeight, setSubmitWeight] = useState("");
  const [submitSpecies, setSubmitSpecies] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [tourneyPhoto, setTourneyPhoto] = useState(null);
  const tourneyFileRef = useRef(null);

  function handleTourneyPhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setTourneyPhoto(ev.target.result);
    reader.readAsDataURL(file);
  }'''
patch(old1, new1, "Add photo state + handler")

# 2) Replace the submit form
old2 = '''        {t.status === "live" && !submitted && (
          <div style={{ background: "#e0f2f2", border: "2px solid #FFE500", borderRadius: 14, padding: 14, marginBottom: 12 }}>
            <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#0d7377", marginBottom: 10 }}>
              🎣 {lang === "ja" ? "釣果を提出する" : "Submit Your Catch"}
            </div>
            <input value={submitSpecies} onChange={e => setSubmitSpecies(e.target.value)} placeholder={lang === "ja" ? "魚種（例：アユ）" : "Species (e.g. Ayu)"} style={{ width: "100%", marginBottom: 8, background: "white", border: "2px solid #FFE500", borderRadius: 8, padding: "9px 12px", fontSize: "0.9rem", fontFamily: "inherit" }} />
            <input value={submitWeight} onChange={e => setSubmitWeight(e.target.value)} placeholder={lang === "ja" ? "重量（例：0.8kg）" : "Weight (e.g. 0.8kg)"} style={{ width: "100%", marginBottom: 10, background: "white", border: "2px solid #FFE500", borderRadius: 8, padding: "9px 12px", fontSize: "0.9rem", fontFamily: "inherit" }} />
            <button onClick={() => { if (submitWeight && submitSpecies) setSubmitted(true); }} style={{ width: "100%", padding: "11px", background: "#0d7377", border: "none", borderRadius: 10, color: "#74c69d", cursor: "pointer", fontFamily: "inherit", fontSize: "0.95rem", fontWeight: 800 }}>
              {lang === "ja" ? "📸 写真付きで提出" : "📸 Submit with Photo"}
            </button>
          </div>
        )}'''

new2 = '''        {t.status === "live" && !submitted && (
          <div style={{ background: "#e0f2f2", border: "2px solid #FFE500", borderRadius: 14, padding: 14, marginBottom: 12 }}>
            <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#0d7377", marginBottom: 10 }}>
              🎣 {lang === "ja" ? "釣果を提出する" : "Submit Your Catch"}
            </div>
            <input value={submitSpecies} onChange={e => setSubmitSpecies(e.target.value)} placeholder={lang === "ja" ? "魚種（例：アユ）" : "Species (e.g. Ayu)"} style={{ width: "100%", marginBottom: 8, background: "white", border: "2px solid #FFE500", borderRadius: 8, padding: "9px 12px", fontSize: "0.9rem", color: "#1a1a14", fontFamily: "inherit", boxSizing: "border-box" }} />
            <input value={submitWeight} onChange={e => setSubmitWeight(e.target.value)} placeholder={lang === "ja" ? "重量（例：0.8kg）" : "Weight (e.g. 0.8kg)"} style={{ width: "100%", marginBottom: 10, background: "white", border: "2px solid #FFE500", borderRadius: 8, padding: "9px 12px", fontSize: "0.9rem", color: "#1a1a14", fontFamily: "inherit", boxSizing: "border-box" }} />
            <input ref={tourneyFileRef} type="file" accept="image/*" capture="environment" onChange={handleTourneyPhoto} style={{ display: "none" }} />
            {tourneyPhoto ? (
              <div style={{ position: "relative", marginBottom: 10 }}>
                <img src={tourneyPhoto} alt="catch" style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 8, display: "block" }} />
                <button onClick={() => setTourneyPhoto(null)} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.75)", color: "white", border: "none", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: "0.8rem", fontFamily: "inherit" }}>{lang === "ja" ? "✕ 削除" : "✕ Remove"}</button>
              </div>
            ) : (
              <button onClick={() => tourneyFileRef.current && tourneyFileRef.current.click()} style={{ width: "100%", padding: "14px", background: "white", border: "2px dashed #0d7377", borderRadius: 10, color: "#0d7377", cursor: "pointer", fontFamily: "inherit", fontSize: "0.9rem", fontWeight: 700, marginBottom: 10 }}>
                📸 {lang === "ja" ? "写真を撮影 / 選択" : "Take or choose a photo"}
              </button>
            )}
            <button
              disabled={!submitWeight || !submitSpecies || !tourneyPhoto}
              onClick={() => { if (submitWeight && submitSpecies && tourneyPhoto) setSubmitted(true); }}
              style={{ width: "100%", padding: "11px", background: (submitWeight && submitSpecies && tourneyPhoto) ? "#0d7377" : "#aaa", border: "none", borderRadius: 10, color: "white", cursor: (submitWeight && submitSpecies && tourneyPhoto) ? "pointer" : "not-allowed", fontFamily: "inherit", fontSize: "0.95rem", fontWeight: 800 }}>
              {lang === "ja" ? "提出する" : "Submit Entry"}
            </button>
          </div>
        )}'''
patch(old2, new2, "Add photo upload + fix input text color")

if n == 0:
    print("\nNo changes — already patched?")
    sys.exit(0)

open(FILE, "w").write(src)
print(f"\n✓ {n} patches applied to {FILE}")
print("\nNow:")
print("  git add -A && git commit -m 'fix tournament photo upload + input text' && git push")
