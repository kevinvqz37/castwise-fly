with open('src/App.jsx') as f:
    content = f.read()

# Add fileRef inside TournamentView and wire up photo
old = '''function TournamentView({ lang, profile, myCatches }) {
  const [activeTournament, setActiveTournament] = useState(null);
  const [showJoin, setShowJoin] = useState(false);
  const [submitWeight, setSubmitWeight] = useState("");
  const [submitSpecies, setSubmitSpecies] = useState("");
  const [submitted, setSubmitted] = useState(false);'''

new = '''function TournamentView({ lang, profile, myCatches }) {
  const [activeTournament, setActiveTournament] = useState(null);
  const [showJoin, setShowJoin] = useState(false);
  const [submitWeight, setSubmitWeight] = useState("");
  const [submitSpecies, setSubmitSpecies] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [tourneyPhoto, setTourneyPhoto] = useState(null);
  const tourneyFileRef = useRef();'''

content = content.replace(old, new, 1)
print("Added state:", "tourneyPhoto" in content)

# Add photo button before the submit button in tournament form
old2 = '''            <button onClick={() => { if (submitWeight && submitSpecies) setSubmitted(true); }} style={{ width: "100%", padding: "11px", background: "#0d7377", border: "none", borderRadius: 10, color: "#74c69d", cursor: "pointer", fontFamily: "inherit", fontSize: "0.95rem", fontWeight: 800 }}>
              {lang === "ja" ? "📸 写真付きで提出" : "📸 Submit with Photo"}
            </button>'''

new2 = '''            <input ref={tourneyFileRef} type="file" accept="image/*" onChange={e => {
              const file = e.target.files[0]; if (!file) return;
              const reader = new FileReader();
              reader.onload = ev => setTourneyPhoto(ev.target.result);
              reader.readAsDataURL(file);
            }} style={{ display: "none" }} />
            {tourneyPhoto && <img src={tourneyPhoto} alt="" style={{ width: "100%", maxHeight: 120, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} />}
            <button onClick={() => tourneyFileRef.current.click()} style={{ width: "100%", padding: "10px", background: "#e0f2f2", border: "2px solid #FFE500", borderRadius: 10, color: "#0d7377", cursor: "pointer", fontFamily: "inherit", fontSize: "0.9rem", fontWeight: 700, marginBottom: 8 }}>
              📸 {lang === "ja" ? "写真を追加" : lang === "es" ? "Añadir foto" : "Add Photo"}
            </button>
            <button onClick={() => { if (submitWeight && submitSpecies) setSubmitted(true); }} style={{ width: "100%", padding: "11px", background: "#0d7377", border: "none", borderRadius: 10, color: "#74c69d", cursor: "pointer", fontFamily: "inherit", fontSize: "0.95rem", fontWeight: 800 }}>
              {lang === "ja" ? "📸 写真付きで提出" : "📸 Submit with Photo"}
            </button>'''

count = content.count(old2)
content = content.replace(old2, new2, 1)
print(f"Added photo button: {count} replacements")

with open('src/App.jsx', 'w') as f:
    f.write(content)
print("Done:", len(content))
