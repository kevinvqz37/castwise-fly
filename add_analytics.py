#!/usr/bin/env python3
"""
Adds Vercel Analytics to src/App.jsx (Vite/React, not Next.js).
Run from castwise-fly repo root.
"""
import os, sys
FILE = "src/App.jsx"
if not os.path.exists(FILE): sys.exit("ERROR: run from repo root")
src = open(FILE).read()
n = 0

# 1) Add import after the firebase/auth import
old1 = 'import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";'
new1 = old1 + '\nimport { Analytics } from "@vercel/analytics/react";'
if old1 in src and 'from "@vercel/analytics/react"' not in src:
    src = src.replace(old1, new1, 1); n += 1
    print("  ✓ Added Analytics import")
elif 'from "@vercel/analytics/react"' in src:
    print("  • Import already present")
else:
    print("  ⚠ Import anchor not found")

# 2) Insert <Analytics /> right before the very last </div> in the file
# The legal footer is the last element. We add <Analytics /> after it.
old2 = '''        <a href="/legal.html#affiliate" target="_blank" style={{ color: "#9a9a8a", textDecoration: "none" }}>{lang === "ja" ? "広告について" : lang === "es" ? "Publicidad" : "Advertising"}</a>
      </div>
    </div>
  );
}'''
new2 = '''        <a href="/legal.html#affiliate" target="_blank" style={{ color: "#9a9a8a", textDecoration: "none" }}>{lang === "ja" ? "広告について" : lang === "es" ? "Publicidad" : "Advertising"}</a>
      </div>
      <Analytics />
    </div>
  );
}'''
if old2 in src:
    src = src.replace(old2, new2, 1); n += 1
    print("  ✓ Added <Analytics /> component")
elif "<Analytics />" in src:
    print("  • <Analytics /> already present")
else:
    print("  ⚠ Component anchor not found")

if n == 0: sys.exit("\nNothing to do.")
open(FILE, "w").write(src)
print(f"\n✓ {n} edits applied")
print("\nNow:")
print("  npm i @vercel/analytics")
print("  git add -A && git commit -m 'add vercel analytics' && git push")
