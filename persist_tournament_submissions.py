#!/usr/bin/env python3
"""
Persists tournament submissions to Firestore.
- Submit: uploads photo to Storage, writes doc to tournamentSubmissions collection
- Load: live-syncs submissions for the active tournament, sorted by weight
- Display: shows submissions in the tournament leaderboard with photos

Run from castwise-fly repo root:
    python3 persist_tournament_submissions.py
"""
import os, sys

FILE = "src/App.jsx"
if not os.path.exists(FILE):
    sys.exit("ERROR: run from castwise-fly repo root")

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
        print(f"  ⚠ {label} — anchor not found, skipped")

# 1) TournamentView signature: accept user, db, storage, profile already there
old1 = '''function TournamentView({ lang, profile, myCatches }) {
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

new1 = '''function TournamentView({ lang, profile, myCatches, user, db, storage }) {
  const [activeTournament, setActiveTournament] = useState(null);
  const [showJoin, setShowJoin] = useState(false);
  const [submitWeight, setSubmitWeight] = useState("");
  const [submitSpecies, setSubmitSpecies] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [tourneyPhoto, setTourneyPhoto] = useState(null);
  const tourneyFileRef = useRef(null);

  // Live-sync submissions for active tournament
  useEffect(() => {
    if (!activeTournament || !db) { setSubmissions([]); return; }
    const q = query(
      collection(db, "tournamentSubmissions"),
      where("tournamentId", "==", activeTournament.id)
    );
    const unsub = onSnapshot(q, snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => (b.weightNum || 0) - (a.weightNum || 0));
      setSubmissions(docs);
    }, err => console.warn("submissions load failed:", err));
    return () => unsub();
  }, [activeTournament?.id]);

  function handleTourneyPhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setTourneyPhoto(ev.target.result);
    reader.readAsDataURL(file);
  }

  async function submitEntry() {
    if (!submitWeight || !submitSpecies || !tourneyPhoto || !activeTournament) return;
    if (!user) {
      alert(lang === "ja" ? "提出するにはログインしてください" : "Please log in to submit");
      return;
    }
    setSubmitting(true);
    try {
      const now = Date.now();
      const path = `tournaments/${activeTournament.id}/${user.uid}_${now}.jpg`;
      const photoRef = ref(storage, path);
      await uploadString(photoRef, tourneyPhoto, "data_url");
      const photoURL = await getDownloadURL(photoRef);
      const weightNum = parseFloat(submitWeight.replace(/[^0-9.]/g, "")) || 0;
      await addDoc(collection(db, "tournamentSubmissions"), {
        tournamentId: activeTournament.id,
        userId: user.uid,
        userName: profile.name || "Angler",
        avatar: profile.avatar || "🎣",
        species: submitSpecies,
        weight: submitWeight,
        weightNum,
        photoURL,
        createdAt: now,
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setSubmitWeight("");
        setSubmitSpecies("");
        setTourneyPhoto(null);
      }, 2500);
    } catch (e) {
      console.error("Tournament submit failed:", e);
      alert((lang === "ja" ? "提出に失敗しました: " : "Submit failed: ") + e.message);
    }
    setSubmitting(false);
  }'''
patch(old1, new1, "TournamentView signature + Firestore submit")

# 2) Replace submit button onClick + disabled to call submitEntry, and label changes when submitting
old2 = '''            <button
              disabled={!submitWeight || !submitSpecies || !tourneyPhoto}
              onClick={() => { if (submitWeight && submitSpecies && tourneyPhoto) setSubmitted(true); }}
              style={{ width: "100%", padding: "11px", background: (submitWeight && submitSpecies && tourneyPhoto) ? "#0d7377" : "#aaa", border: "none", borderRadius: 10, color: "white", cursor: (submitWeight && submitSpecies && tourneyPhoto) ? "pointer" : "not-allowed", fontFamily: "inherit", fontSize: "0.95rem", fontWeight: 800 }}>
              {lang === "ja" ? "提出する" : "Submit Entry"}
            </button>'''

new2 = '''            <button
              disabled={!submitWeight || !submitSpecies || !tourneyPhoto || submitting}
              onClick={submitEntry}
              style={{ width: "100%", padding: "11px", background: (submitWeight && submitSpecies && tourneyPhoto && !submitting) ? "#0d7377" : "#aaa", border: "none", borderRadius: 10, color: "white", cursor: (submitWeight && submitSpecies && tourneyPhoto && !submitting) ? "pointer" : "not-allowed", fontFamily: "inherit", fontSize: "0.95rem", fontWeight: 800 }}>
              {submitting ? (lang === "ja" ? "アップロード中..." : "Uploading...") : (lang === "ja" ? "提出する" : "Submit Entry")}
            </button>'''
patch(old2, new2, "Wire submit button to submitEntry")

# 3) Replace the leaderboard rendering — show live submissions if any, else fall back to static
old3 = '''        {t.leaderboard.length > 0 && (
          <>
            <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "#0d7377", marginBottom: 8, borderBottom: "2px solid #1a1a14", paddingBottom: 4 }}>
              🏅 {lang === "ja" ? "現在のランキング" : "Current Rankings"}
            </div>
            {t.leaderboard.map((entry, i) => (
              <div key={i} style={{ background: i === 0 ? "#e0f2f2" : "white", border: `1.5px solid ${i === 0 ? "#74c69d" : "#e0e0d8"}`, borderRadius: 10, padding: "10px 12px", marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: i === 0 ? "#74c69d" : i === 1 ? "#ddd" : i === 2 ? "#e0a060" : "#f5f0e8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.82rem", color: "#0d7377", flexShrink: 0 }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : entry.rank}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0d7377" }}>{entry.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "#888" }}>{entry.species}</div>
                </div>
                <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#0d7377" }}>{entry.weight}</div>
              </div>
            ))}
          </>
        )}'''

new3 = '''        {/* LIVE submissions from Firestore, ranked by weight */}
        {submissions.length > 0 && (
          <>
            <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "#0d7377", marginBottom: 8, borderBottom: "2px solid #1a1a14", paddingBottom: 4 }}>
              🏅 {lang === "ja" ? `現在のランキング (${submissions.length}件)` : `Current Rankings (${submissions.length})`}
            </div>
            {submissions.map((entry, i) => (
              <div key={entry.id} style={{ background: i === 0 ? "#e0f2f2" : "white", border: `1.5px solid ${i === 0 ? "#74c69d" : "#e0e0d8"}`, borderRadius: 10, padding: "10px 12px", marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: i === 0 ? "#74c69d" : i === 1 ? "#ddd" : i === 2 ? "#e0a060" : "#f5f0e8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.82rem", color: "#0d7377", flexShrink: 0 }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                </div>
                {entry.photoURL && (
                  <img src={entry.photoURL} alt="catch" style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0d7377" }}>{entry.avatar} {entry.userName}</div>
                  <div style={{ fontSize: "0.75rem", color: "#888" }}>{entry.species}</div>
                </div>
                <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#0d7377" }}>{entry.weight}</div>
              </div>
            ))}
          </>
        )}

        {/* Static demo leaderboard — only shown when there are no real submissions yet */}
        {submissions.length === 0 && t.leaderboard.length > 0 && (
          <>
            <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "#0d7377", marginBottom: 8, borderBottom: "2px solid #1a1a14", paddingBottom: 4 }}>
              🏅 {lang === "ja" ? "現在のランキング" : "Current Rankings"}
            </div>
            {t.leaderboard.map((entry, i) => (
              <div key={i} style={{ background: i === 0 ? "#e0f2f2" : "white", border: `1.5px solid ${i === 0 ? "#74c69d" : "#e0e0d8"}`, borderRadius: 10, padding: "10px 12px", marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: i === 0 ? "#74c69d" : i === 1 ? "#ddd" : i === 2 ? "#e0a060" : "#f5f0e8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.82rem", color: "#0d7377", flexShrink: 0 }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : entry.rank}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0d7377" }}>{entry.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "#888" }}>{entry.species}</div>
                </div>
                <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#0d7377" }}>{entry.weight}</div>
              </div>
            ))}
          </>
        )}'''
patch(old3, new3, "Replace static leaderboard with Firestore-backed one")

# 4) Update the TournamentView call site to pass user, db, storage
old4 = '''        {tab === "Tournament" && <TournamentView lang={lang} profile={profile} myCatches={myCatches} />}'''
new4 = '''        {tab === "Tournament" && <TournamentView lang={lang} profile={profile} myCatches={myCatches} user={user} db={db} storage={storage} />}'''
patch(old4, new4, "Pass user/db/storage to TournamentView")

if n == 0:
    sys.exit("No changes — already patched?")

open(FILE, "w").write(src)
print(f"\n✓ {n} patches applied to {FILE}")
print("""
IMPORTANT — also update Firestore rules to allow tournament submissions.
In the Firebase console (or your firestore.rules file), add:

    match /tournamentSubmissions/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }

Then:
  git add -A && git commit -m 'persist tournament submissions to firestore' && git push
""")
