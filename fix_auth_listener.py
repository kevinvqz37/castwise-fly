#!/usr/bin/env python3
"""
Adds the missing onAuthStateChanged listener to src/App.jsx
Run from your castwise-fly repo root:
    python3 fix_auth_listener.py
"""
import re, sys, os

FILE = "src/App.jsx"

if not os.path.exists(FILE):
    print(f"ERROR: {FILE} not found. Run this from the repo root.")
    sys.exit(1)

src = open(FILE).read()

# Don't double-apply
if "onAuthStateChanged(auth," in src:
    print("✓ Listener already present — no changes needed.")
    sys.exit(0)

# Find the GPS useEffect (anchor we know exists) and insert auth listener before it
anchor = "  useEffect(() => {\n    if (!navigator.geolocation) return;"

if anchor not in src:
    print("ERROR: anchor not found — file structure changed. Aborting.")
    sys.exit(1)

listener = '''  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setAuthLoading(false);
      if (u) {
        try {
          const userDocs = await getDocs(query(collection(db, "users"), where("uid", "==", u.uid)));
          if (!userDocs.empty) {
            const data = userDocs.docs[0].data();
            setIsPro(data.isPro || false);
            setAiUsage(data.aiUsage || { count: 0, date: "" });
          } else {
            await addDoc(collection(db, "users"), {
              uid: u.uid, email: u.email, isPro: false,
              aiUsage: { count: 0, date: "" }, createdAt: Date.now()
            });
          }
        } catch (e) { console.warn("user doc fetch failed:", e); }
      }
    });
    return () => unsub();
  }, []);

'''

patched = src.replace(anchor, listener + anchor, 1)

open(FILE, "w").write(patched)
print(f"✓ Patched {FILE} — added onAuthStateChanged listener.")
print("  Now: git add -A && git commit -m 'fix: wire up auth listener' && git push")
