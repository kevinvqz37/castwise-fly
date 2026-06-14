#!/usr/bin/env python3
"""
Lets tournament photo upload pick from gallery (not just camera).
Run from castwise-fly repo root.
"""
import os, sys
FILE = "src/App.jsx"
if not os.path.exists(FILE): sys.exit("ERROR: run from repo root")
src = open(FILE).read()
old = '<input ref={tourneyFileRef} type="file" accept="image/*" capture="environment" onChange={handleTourneyPhoto} style={{ display: "none" }} />'
new = '<input ref={tourneyFileRef} type="file" accept="image/*" onChange={handleTourneyPhoto} style={{ display: "none" }} />'
if old not in src:
    print("• Already patched or anchor changed.")
    sys.exit(0)
open(FILE, "w").write(src.replace(old, new, 1))
print("✓ Removed forced-camera. Now opens gallery/camera picker on mobile.")
print("  git add -A && git commit -m 'allow gallery uploads for tournament' && git push")
