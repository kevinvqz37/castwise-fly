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
const grab = (name, open = "[", close = "\n];") => {
  const i = src.indexOf(`const ${name} = ${open}`);
  const j = src.indexOf(close, i);
  return new Function("return " + src.slice(i + `const ${name} = `.length, j + close.length - 1))();
};
const SPOTS = grab("MAP_SPOTS");
const HATCH = grab("HATCH_CALENDAR");
const TIPS = grab("SEASONAL_TIPS", "{", "\n};");

const esc = v => String(v ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const t = (o, l) => (o && typeof o === "object" ? o[l] || o.en || o.ja || "" : o || "");
const slug = f => f.nameEn.toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const cat = f => f.category || ({ 4: "saltwater", 6: "saltwater", 7: "saltwater", 8: "saltwater", 12: "saltwater", 13: "saltwater", 14: "saltwater", 15: "shore", 16: "saltwater" }[f.id]) || "freshwater";
const CAT_JA = { freshwater: "淡水", saltwater: "海水", shore: "ショア", caribbean: "カリブ海" };
const DIFF_JA = { beginner: "初心者向け", intermediate: "中級者向け", advanced: "上級者向け" };
const img = f => (f.id >= 101 && f.id <= 114 ? `/fish/${f.id}.webp` : null);

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
<body><header><a href="/">🎣 Castwise 釣りナビPRO</a><span style="opacity:.7">/</span><a href="/zukan/" style="color:#fff">魚図鑑</a><a href="/spots/" style="color:#fff">釣り場</a><a href="/tsuki/${new Date().getMonth()+1}" style="color:#fff">今月</a></header>
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
${f.howTo ? `<h2>${esc(f.name)}の釣り方（手順）</h2>${f.howTo.map(h => `<h3>${esc(t(h.t, "ja"))}</h3><p>${esc(t(h.b, "ja"))}</p><p class="en">${esc(t(h.b, "en"))}</p>`).join("")}` : ""}
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


// ─── SPOT PAGES ──────────────────────────────────────────────────────────────
const PREF_SLUG = { 福岡: "fukuoka", 佐賀: "saga", 長崎: "nagasaki", 熊本: "kumamoto", 大分: "oita", 宮崎: "miyazaki", 鹿児島: "kagoshima", 北海道: "hokkaido", 神奈川: "kanagawa", 滋賀: "shiga", 東京: "tokyo", 岐阜: "gifu" };
const isPR = sp => sp.region === "puertorico";
const prefSlug = sp => isPR(sp) ? "puerto-rico" : PREF_SLUG[sp.pref] || "japan";
const prefName = sp => isPR(sp) ? "Puerto Rico" : (sp.pref || "日本");
const spotSlug = sp => `${sp.id}`;
fs.mkdirSync("dist/spots", { recursive: true });
const fishLinks = txt => FISH.filter(f => txt.includes(f.name.replace(/（.*?）/g, "")) || txt.toLowerCase().includes(f.nameEn.toLowerCase().split(" (")[0].toLowerCase()))
  .slice(0, 6).map(f => `<a href="/zukan/${slug(f)}">${esc(f.name)}</a>`).join("・");
for (const sp of SPOTS.filter(x => x.name)) {
  const pr = isPR(sp), L = pr ? "en" : "ja";
  const fishTxt = t(sp.fish, L), fishJa = t(sp.fish, "ja");
  const title = pr ? `${sp.name} Fishing Guide — ${fishTxt} | Puerto Rico | Castwise` : `${sp.name}の釣り情報｜${fishJa}｜${sp.pref}の釣り場｜Castwise`;
  const desc = (pr ? `${sp.name} (${sp.pref}, Puerto Rico): ${fishTxt}. Best season: ${t(sp.bestSeason, "en")}. ${t(sp.tip, "en")}` : `${sp.name}（${sp.pref}）で釣れる魚：${fishJa}。ベストシーズン：${t(sp.bestSeason, "ja")}。${t(sp.tip, "ja")}`).slice(0, 155);
  const near = SPOTS.filter(o => o.id !== sp.id && o.name && prefSlug(o) === prefSlug(sp)).slice(0, 10);
  const links = fishLinks(fishJa + " " + t(sp.fish, "en"));
  const body = `
<h1>${esc(sp.icon || "🎣")} ${esc(sp.name)}<br><span class="en">${pr ? "Fishing spot guide" : "釣り場ガイド"} · ${esc(prefName(sp))}</span></h1>
<div class="tags"><span>${esc(t(sp.type, L))}</span><span>★ ${sp.rating}</span></div>
<table>
<tr><th>${pr ? "Target fish" : "釣れる魚"}</th><td>${esc(fishTxt)}${links ? `<br><small>${links}</small>` : ""}</td></tr>
<tr><th>${pr ? "Best season" : "ベストシーズン"}</th><td>${esc(t(sp.bestSeason, L))}</td></tr>
<tr><th>${pr ? "Access" : "アクセス・遊漁券"}</th><td>${esc(t(sp.access, L))}</td></tr>
</table>
<h2>${pr ? "Local tip" : "釣りのコツ"}</h2><p>${esc(t(sp.tip, L))}</p>${pr ? `<p class="en">${esc(t(sp.tip, "ja"))}</p>` : `<p class="en">${esc(t(sp.tip, "en"))}</p>`}
<p><a href="https://www.google.com/maps/search/?api=1&query=${sp.lat},${sp.lng}" target="_blank" rel="noopener">📍 ${pr ? "Open in Google Maps" : "Googleマップで開く"}</a></p>
<a class="cta" href="/?spot=${sp.id}">${pr ? "🌤️ Today's fishing forecast for this spot (free)" : "🌤️ この釣り場の今日の釣り予報・天気・潮をチェック（無料）"}</a>
${near.length ? `<h2>${pr ? "More spots in Puerto Rico" : `${esc(sp.pref)}のほかの釣り場`}</h2><ul class="grid">${near.map(o => `<li><a href="/spots/${spotSlug(o)}">${esc(o.name)}</a></li>`).join("")}</ul>` : ""}
<p><a href="/spots/${prefSlug(sp)}">${pr ? "All Puerto Rico spots →" : `${esc(sp.pref)}の釣り場一覧 →`}</a></p>`;
  const ld = { "@context": "https://schema.org", "@type": "TouristAttraction", name: sp.name, description: desc, geo: { "@type": "GeoCoordinates", latitude: sp.lat, longitude: sp.lng }, touristType: "Anglers" };
  let html = shell({ title, desc, url: `${SITE}/spots/${spotSlug(sp)}`, body, ld });
  if (pr) html = html.replace('<html lang="ja">', '<html lang="en">');
  fs.writeFileSync(`dist/spots/${spotSlug(sp)}.html`, html);
}
// prefecture hubs
const prefGroups = {};
SPOTS.filter(x => x.name).forEach(sp => (prefGroups[prefSlug(sp)] ||= []).push(sp));
for (const [ps, list] of Object.entries(prefGroups)) {
  const pr = ps === "puerto-rico", name = prefName(list[0]);
  const title = pr ? `Puerto Rico Fishing Spots — ${list.length} spots (tarpon, snook, bonefish) | Castwise` : `${name}の釣り場${list.length}選｜釣れる魚・時期・アクセス｜Castwise`;
  const desc = pr ? `The ${list.length} best fishing spots in Puerto Rico: Vieques, Culebra, Fajardo, San Juan lagoons and lakes. Species, seasons and access.` : `${name}のおすすめ釣り場${list.length}か所。釣れる魚、ベストシーズン、アクセス、遊漁券情報をまとめました。`;
  const body = `<h1>${pr ? "Puerto Rico fishing spots" : `${esc(name)}の釣り場`}</h1><p>${esc(desc)}</p><ul class="grid">${list.sort((a, b) => b.rating - a.rating).map(sp => `<li><a href="/spots/${spotSlug(sp)}">${esc(sp.icon || "")} ${esc(sp.name)}<br><span class="en">${esc(t(sp.fish, pr ? "en" : "ja"))}</span></a></li>`).join("")}</ul><a class="cta" href="/">${pr ? "🎣 Open the app" : "🎣 アプリで今日の釣り予報を見る"}</a>`;
  let html = shell({ title, desc, url: `${SITE}/spots/${ps}`, body });
  if (pr) html = html.replace('<html lang="ja">', '<html lang="en">');
  fs.writeFileSync(`dist/spots/${ps}.html`, html);
}
// spots index
fs.writeFileSync("dist/spots/index.html", shell({
  title: "釣り場ガイド｜九州・全国・プエルトリコ｜Castwise", desc: "九州を中心とした釣り場ガイド。都道府県別に釣れる魚・時期・アクセスを掲載。", url: `${SITE}/spots/`,
  body: `<h1>釣り場ガイド <span class="en">Fishing spots</span></h1><ul class="grid">${Object.entries(prefGroups).map(([ps, l]) => `<li><a href="/spots/${ps}">${esc(prefName(l[0]))}（${l.length}）</a></li>`).join("")}</ul>`,
}));

// ─── MONTHLY PAGES: 「◯月に釣れる魚・フライのハッチ」 ─────────────────────────
fs.mkdirSync("dist/tsuki", { recursive: true });
for (let m = 0; m < 12; m++) {
  const mj = `${m + 1}月`, h = HATCH[m] || { hatches: [] };
  const inSeason = FISH.map(f => ({ f, tip: (TIPS[f.id] || []).find(x => x.months.includes(m)) })).filter(x => x.tip);
  const peak = inSeason.filter(x => ["peak", "high"].includes(x.tip.urgency));
  const rest = inSeason.filter(x => !["peak", "high"].includes(x.tip.urgency));
  const body = `<h1>${mj}に釣れる魚とフライのハッチ<br><span class="en">What to fish in ${HATCH[m]?.month?.en || ""}</span></h1>
<p>${mj}の釣りの狙い目をまとめました。旬の魚、釣り方のコツ、フライフィッシング・テンカラのハッチ（羽化する水生昆虫）情報。</p>
${h.hatches?.length ? `<h2>${mj}のハッチ（フライ・テンカラ）</h2><ul>${h.hatches.map(x => `<li>${esc(x)}</li>`).join("")}</ul><p>渓流活性の目安：${h.activity || "-"}/100</p>` : ""}
${peak.length ? `<h2>${mj}が最盛期の魚</h2>${peak.map(({ f, tip }) => `<h3><a href="/zukan/${slug(f)}">${esc(f.name)}</a> <small>${esc(t(tip.badge, "ja"))}</small></h3><p>${esc(t(tip.tip, "ja"))}</p>`).join("")}` : ""}
${rest.length ? `<h2>${mj}に狙えるそのほかの魚</h2>${rest.map(({ f, tip }) => `<h3><a href="/zukan/${slug(f)}">${esc(f.name)}</a> <small>${esc(t(tip.badge, "ja"))}</small></h3><p>${esc(t(tip.tip, "ja"))}</p>`).join("")}` : ""}
<a class="cta" href="/">🤖 今日どこで何が釣れるかAIに聞く（無料）</a>
<h2>ほかの月</h2><ul class="grid">${Array.from({ length: 12 }, (_, i) => `<li><a href="/tsuki/${i + 1}">${i + 1}月</a></li>`).join("")}</ul>`;
  fs.writeFileSync(`dist/tsuki/${m + 1}.html`, shell({
    title: `${mj}に釣れる魚・釣り方とフライのハッチ｜Castwise 釣りナビPRO`,
    desc: `${mj}に釣れる魚${inSeason.length}種の狙い方と、フライフィッシング・テンカラのハッチ情報。${peak.slice(0, 5).map(x => x.f.name).join("・")}などが最盛期。`.slice(0, 155),
    url: `${SITE}/tsuki/${m + 1}`, body,
  }));
}

// sitemap
const today = new Date().toISOString().slice(0, 10);
const urls = [`${SITE}/`, `${SITE}/zukan/`, ...FISH.map(f => `${SITE}/zukan/${slug(f)}`),
  `${SITE}/spots/`, ...Object.keys(prefGroups).map(p => `${SITE}/spots/${p}`), ...SPOTS.filter(x => x.name).map(sp => `${SITE}/spots/${spotSlug(sp)}`),
  ...Array.from({ length: 12 }, (_, i) => `${SITE}/tsuki/${i + 1}`), `${SITE}/legal.html`];
fs.writeFileSync("dist/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join("\n")}\n</urlset>\n`);
console.log(`pages: ${FISH.length} species, ${SPOTS.length} spots, ${Object.keys(prefGroups).length} areas, 12 months — sitemap ${urls.length} urls`);
