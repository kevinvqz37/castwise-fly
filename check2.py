
with open("src/App.jsx") as f:
    lines = f.readlines()
depth = 0
in_style = False
for i, l in enumerate(lines[3690:3780], 3691):
    if "`}</style>" in l: in_style = False
    if "<style>{`" in l: in_style = True
    if not in_style:
        o = l.count("<div") + l.count("<button") + l.count("<span") + l.count("<input")
        c = l.count("</div") + l.count("</button") + l.count("</span")
        depth += o - c
    if o != c and not in_style:
        print(f"{i} ({depth:+d}): {l.rstrip()[:70]}")
