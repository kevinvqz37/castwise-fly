// Post-build: generate static, crawlable species pages at /zukan/<slug> + /zukan index + sitemap.
// Runs after `vite build`, writes into dist/.
import fs from "fs";
import path from "path";
import { EXTRA_FISH } from "../src/fishDataExtra.js";

const SITE = "https://castwise-fly.vercel.app";
const src = fs.readFileSync("src/App.jsx", "utf8");
const a = src.indexOf("const FISH_DATA = [");
const b = src.indexOf("\n];", a);
const BASE = new Function("return " + src.slice(a + "const FISH_DATA = ".length, b + 2))();
const FISH = [...BASE, ...EXTRA_FISH];

const esc = v => String(v ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const t = (o, l) => (o && typeof o === "object" ? o[l] || o.en || o.ja || "" : o || "");
const slug = f => f.nameEn.toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const cat = f => f.category || ({ 4: "saltwater", 6: "saltwater", 7: "saltwater", 8: "saltwater", 12: "saltwater", 13: "saltwater", 14: "saltwater", 15: "shore", 16: "saltwater" }[f.id]) || "freshwater";
const CAT_JA = { freshwater: "淡水", saltwater: "海水", shore: "ショア", caribbean: "カリブ海" };
const DIFF_JA = { beginner: "初心者向け", intermediate: "中級者向け", advanced: "上級者向け" };
const img = f => (f.id >= 101 ? `/fish/${f.id}.webp` : null);

const css = `*{box-sizing:border-box}body{margin:0;font-family:'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif;background:#f5f0e8;color:#1a1a14;line-height:1.8}
header{background:#0a2837;color:#fff;padding:14px 18px;display:flex;gap:10px;align-items:center}header a{color:#ffe500;text-decoration:none;font-weight:700}
main{max-width:760px;margin:0 auto;padding:18px 16px 60px}h1{font-size:1.6rem;line-height:1.3;margin:.4em 0}h2{font-size:1.15rem;border-left:5px solid #0d7377;padding-left:10px;margin-top:1.8em}
.hero{background:#fffdf8;border:2px solid #e0dbd0;border-radius:16px;padding:16px;text-align:center}.hero img{max-width:100%;height:auto}
.tags span{display:inline-block;background:#e0f2f2;color:#0d7377;border-radius:99px;padding:2px 10px;margin:2px;font-size:.85rem;font-weight:700}
table{width:100%;border-collapse:collapse;background:#fffdf8;border-radius:12px;overflow:hidden}th,td{padding:8px 10px;border-bottom:1px solid #e8e3d8;text-align:left;vertical-align:top}th{width:32%;color:#5a5a4a;font-weight:600}
.cta{display:block;text-align:center;background:#0d7377;color:#fff;padding:14px;border-radius:14px;font-weight:800;text-decoration:none;margin:24px 0}
.en{color:#5a5a4a;font-size:.95rem}ul.grid{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}ul.grid a{display:block;background:#fffdf8;border:1px solid #e0dbd0;border-radius:10px;padding:8px 10px;color:#0d7377;text-decoration:none;font-weight:700}
footer{text-align:center;font-size:.8rem;color:#7a7a6a;padding:20px}footer a{color:#0d7377}`;

const shell = ({ title, desc, url, body, ld, image }) => `<!doctype html><html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}"><link rel="canonical" href="${url}">
<meta property="og:type" content="article"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}"><meta property="og:image" content="${SITE}${image || "/icon-512.png"}"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico"><meta name="theme-color" content="#0a2837"><style>${css}</style>
${ld ? `<script type="application/ld+json">${JSON.stringify(ld)}</script>` : ""}</head>
<body><header><a href="/">🎣 Castwise 釣りナビPRO</a><span style="opacity:.7">/</span><a href="/zukan/" style="color:#fff">魚図鑑</a></header>
<main>${body}</main><footer><a href="/">アプリを開く</a> · <a href="/zukan/">魚図鑑</a> · <a href="/legal.html">法的情報</a><br>© Shigematsu Tech</footer></body></html>`;

const out = "dist/zukan";
fs.mkdirSync(out, { recursive: true });

for (const f of FISH) {
  const s = slug(f);
  const g = f.gear || {};
  const lures = g.lures || [];
  const desc = t(f.description || f.desc, "ja");
  const title = `${f.name}の釣り方・時期・仕掛け｜${f.nameEn}｜Castwise 釣りナビPRO`;
  const metaDesc = `${f.name}（${f.nameEn}）の釣り方ガイド。シーズン：${t(f.season, "ja")}。${desc}`.slice(0, 150);
  const rows = [
    ["シーズン", t(f.season, "ja")], ["生息場所", t(f.habitat, "ja")], ["狙い目の時間", t(f.bestTime, "ja")],
    ["ロッド", t(g.rod || g.rods, "ja")], ["リール", t(g.reel, "ja")], ["ライン", t(g.line, "ja")], ["ハリ", t(g.hooks, "ja")],
  ].filter(r => r[1]);
  const others = FISH.filter(o => o.id !== f.id && cat(o) === cat(f)).slice(0, 12);
  const body = `
<div class="hero">${img(f) ? `<img src="${img(f)}" alt="${esc(f.name)}（${esc(f.nameEn)}）のイラスト" width="480" height="240">` : `<div style="font-size:4rem">${f.emoji || "🐟"}</div>`}</div>
<h1>${esc(f.name)}の釣り方ガイド<br><span class="en">${esc(f.nameEn)} fishing guide</span></h1>
<div class="tags"><span>${CAT_JA[cat(f)] || ""}</span>${f.difficulty ? `<span>${DIFF_JA[f.difficulty]}</span>` : ""}${f.flyFriendly ? "<span>🪶 フライ・テンカラ対応</span>" : ""}</div>
<p>${esc(desc)}</p><p class="en">${esc(t(f.description || f.desc, "en"))}</p>
<h2>基本情報とタックル</h2><table>${rows.map(r => `<tr><th>${r[0]}</th><td>${esc(r[1])}</td></tr>`).join("")}</table>
${lures.length ? `<h2>おすすめのルアー・エサ・フライ</h2><ul>${lures.map(l => `<li>${esc(l)}</li>`).join("")}</ul>` : ""}
${g.tips || g.technique ? `<h2>釣り方のコツ</h2><p>${esc(t(g.tips || g.technique, "ja"))}</p><p class="en">${esc(t(g.tips || g.technique, "en"))}</p>` : ""}
${f.flyNote ? `<h2>フライフィッシング・テンカラで狙うなら</h2><p>${esc(t(f.flyNote, "ja"))}</p>` : ""}
${f.spots?.length ? `<h2>${esc(f.name)}が釣れる主な釣り場</h2><ul>${f.spots.map(sp => `<li>${esc(sp.name)}${sp.rating ? `（★${sp.rating}）` : ""}${sp.type ? ` — ${esc(t(sp.type, "ja"))}` : ""}</li>`).join("")}</ul>` : ""}
${f.regulations ? `<h2>ルール・注意点</h2><p>${esc(t(f.regulations, "ja"))}</p>` : ""}
<a class="cta" href="/?fish=${f.id}">🤖 今日${esc(f.name)}が釣れるかAIでチェック（無料）</a>
<h2>ほかの${CAT_JA[cat(f)] || ""}の魚</h2><ul class="grid">${others.map(o => `<li><a href="/zukan/${slug(o)}">${esc(o.name)}</a></li>`).join("")}</ul>`;
  const ld = { "@context": "https://schema.org", "@type": "Article", headline: `${f.name}の釣り方ガイド`, inLanguage: "ja", about: { "@type": "Thing", name: f.name, alternateName: f.nameEn }, publisher: { "@type": "Organization", name: "Shigematsu Tech" }, mainEntityOfPage: `${SITE}/zukan/${s}` };
  fs.writeFileSync(path.join(out, `${s}.html`), shell({ title, desc: metaDesc, url: `${SITE}/zukan/${s}`, body, ld, image: img(f) }));
}

// index
const groups = ["freshwater", "saltwater", "shore", "caribbean"].map(c => [c, FISH.filter(f => cat(f) === c)]).filter(([, l]) => l.length);
fs.writeFileSync(path.join(out, "index.html"), shell({
  title: `魚図鑑｜${FISH.length}魚種の釣り方・時期・仕掛け｜Castwise 釣りナビPRO`,
  desc: `ヤマメ・イワナ・アユからシーバス・アジまで、${FISH.length}魚種の釣り方、シーズン、タックル、釣り場を解説。フライ・テンカラ情報も充実。`,
  url: `${SITE}/zukan/`,
  body: `<h1>魚図鑑 <span class="en">Fish Guide</span></h1><p>${FISH.length}魚種の釣り方・シーズン・タックル・主な釣り場をまとめました。</p>` +
    groups.map(([c, l]) => `<h2>${CAT_JA[c]}</h2><ul class="grid">${l.map(f => `<li><a href="/zukan/${slug(f)}">${esc(f.name)}<br><span class="en">${esc(f.nameEn)}</span></a></li>`).join("")}</ul>`).join("") +
    `<a class="cta" href="/">🎣 アプリで今日の釣果予測を見る</a>`,
}));

// sitemap
const today = new Date().toISOString().slice(0, 10);
const urls = [`${SITE}/`, `${SITE}/zukan/`, ...FISH.map(f => `${SITE}/zukan/${slug(f)}`), `${SITE}/legal.html`];
fs.writeFileSync("dist/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join("\n")}\n</urlset>\n`);
console.log(`zukan: ${FISH.length} species pages + index, sitemap ${urls.length} urls`);
