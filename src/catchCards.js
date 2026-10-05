// Catch Card collection (釣りカード図鑑): one collectible card per species, unlocked by
// logging a catch. This file holds the pure logic (species matching, rarity, building the
// collection) and the canvas renderer for the shareable card image. The binder UI lives
// in App.jsx (CatchCards) because it reuses FishIllustration.

const SITE = "castwise-fly.vercel.app";
const FONT = "'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif";

export const RARITY = {
  beginner:     { key: "common", stars: 1, color: "#4f8a7f", ja: "コモン", en: "Common", es: "Común" },
  intermediate: { key: "rare",   stars: 2, color: "#2f6fd6", ja: "レア",   en: "Rare",   es: "Rara" },
  advanced:     { key: "epic",   stars: 3, color: "#c38a12", ja: "エピック", en: "Epic",  es: "Épica" },
};
export const rarityOf = fish => RARITY[fish?.difficulty] || RARITY.beginner;

export const isCaribbean = fish => (fish.id >= 17 && fish.id <= 24) || fish.id >= 201;

// Card number: Japan No.001–031 and Caribbean C01–C18, in id order (stable as long as
// species are only ever appended).
export function cardNo(fish, index) {
  return isCaribbean(fish) ? `C${String(index + 1).padStart(2, "0")}` : `No.${String(index + 1).padStart(3, "0")}`;
}

// Lowercase, strip spacing/punctuation, hiragana → katakana (あおりいか = アオリイカ).
const norm = s => String(s || "").toLowerCase().replace(/[\s・･\-_'’.]/g, "")
  .replace(/[\u3041-\u3096]/g, ch => String.fromCharCode(ch.charCodeAt(0) + 0x60));

// Common local / growth-stage names anglers actually log under, keyed by species id.
const LOCAL_NAMES = {
  1: ["バス", "ラージマウス", "largemouth"], 3: ["エノハ", "ヤマベ"], 4: ["スズキ", "セイゴ", "フッコ", "suzuki"],
  12: ["アオリ", "squid"], 13: ["ワラサ", "メジロ", "イナダ"], 14: ["チヌ"], 111: ["ガシラ", "アラカブ"],
  16: ["メバリング"], 112: ["タチ"], 202: ["jurel"],
};

// Every name a species can be logged under: JA/EN/ES names plus the parts inside and
// outside parentheses ("イカ（アオリイカ）" → "イカ", "アオリイカ").
function aliases(fish) {
  const out = new Set();
  for (const n of [fish.name, fish.nameEn, fish.nameEs]) {
    if (!n) continue;
    out.add(norm(n));
    const m = String(n).match(/^(.*?)[（(](.*?)[)）]/);
    if (m) { out.add(norm(m[1])); out.add(norm(m[2])); }
  }
  for (const n of LOCAL_NAMES[fish.id] || []) out.add(norm(n));
  out.delete("");
  return [...out];
}

// Catch names are free text (typed, or filled by AI fish ID), so match exactly first,
// then by containment, preferring the longest alias that fits.
export function makeSpeciesMatcher(fishList) {
  const table = fishList.map(f => ({ f, names: aliases(f) }));
  const cache = new Map();
  return name => {
    const key = norm(name);
    if (!key) return null;
    if (cache.has(key)) return cache.get(key);
    let hit = table.find(t => t.names.includes(key))?.f || null;
    if (!hit) {
      let best = 0;
      for (const t of table) for (const a of t.names) {
        const ok = (a.length >= 2 && key.includes(a)) || (key.length >= 3 && a.includes(key));
        if (ok && a.length > best) { best = a.length; hit = t.f; }
      }
    }
    cache.set(key, hit);
    return hit;
  };
}

// Sizes are free text ("1.2kg", "800g", "45cm"). Weights compare in grams, lengths in
// cm; a weight beats a length when the two kinds are mixed.
function sizeOf(w) {
  const m = String(w || "").replace(/,/g, "").match(/([0-9]+(?:\.[0-9]+)?)\s*(kg|キロ|g|グラム|cm|センチ|mm|m)?/i);
  if (!m) return { kind: 0, v: -1 };
  const n = parseFloat(m[1]), u = (m[2] || "").toLowerCase();
  if (u === "kg" || u === "キロ") return { kind: 2, v: n * 1000 };
  if (u === "g" || u === "グラム") return { kind: 2, v: n };
  if (u === "mm") return { kind: 1, v: n / 10 };
  if (u === "m") return { kind: 1, v: n * 100 };
  return { kind: 1, v: n };
}
const bigger = (a, b) => { const x = sizeOf(a), y = sizeOf(b); return x.kind !== y.kind ? x.kind > y.kind : x.v > y.v; };
const same = (a, b) => { const x = sizeOf(a), y = sizeOf(b); return x.kind === y.kind && x.v === y.v; };

// → { japan: [card…], caribbean: [card…] }, card = { fish, no, rarity, caught, best, count, foil }
export function buildCollection(fishList, catches) {
  const match = makeSpeciesMatcher(fishList);
  const byId = new Map();
  for (const c of catches) {
    const f = match(c.fish);
    if (!f) continue;
    const e = byId.get(f.id) || { best: null, count: 0, foil: false };
    e.count += 1;
    if (c.method === "fly") e.foil = true;
    if (!e.best || bigger(c.weight, e.best.weight) || (!e.best.photo && c.photo && same(c.weight, e.best.weight))) e.best = c;
    byId.set(f.id, e);
  }
  const make = list => list.sort((a, b) => a.id - b.id).map((fish, i) => {
    const e = byId.get(fish.id);
    return { fish, no: cardNo(fish, i), rarity: rarityOf(fish), caught: !!e, best: e?.best || null, count: e?.count || 0, foil: !!e?.foil };
  });
  return {
    japan: make(fishList.filter(f => !isCaribbean(f))),
    caribbean: make(fishList.filter(isCaribbean)),
    match,
  };
}

// ─── shareable card image ──────────────────────────────────────────────────────
const W = 1080, H = 1350;

function loadImg(src) {
  return new Promise(res => {
    if (!src) return res(null);
    const im = new Image();
    if (/^https?:/.test(src)) im.crossOrigin = "anonymous";
    im.onload = () => res(im);
    im.onerror = () => res(null);
    im.src = src;
  });
}
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function fit(ctx, text, maxW, size, weight = 900) {
  let s = size;
  do { ctx.font = `${weight} ${s}px ${FONT}`; s -= 2; } while (ctx.measureText(text).width > maxW && s > 18);
}

// art = { src } for a single painted file, { src, col, row, cols, rows } for a sprite
// sheet cell, or { emoji }.
async function drawArt(ctx, art, x, y, w, h) {
  const img = art?.src ? await loadImg(art.src) : null;
  if (img && art.cols) {
    const cw = img.width / art.cols, ch = img.height / art.rows;
    const sc = Math.min(w / cw, h / ch);
    ctx.drawImage(img, art.col * cw, art.row * ch, cw, ch, x + (w - cw * sc) / 2, y + (h - ch * sc) / 2, cw * sc, ch * sc);
  } else if (img) {
    const sc = Math.min(w / img.width, h / img.height);
    ctx.drawImage(img, x + (w - img.width * sc) / 2, y + (h - img.height * sc) / 2, img.width * sc, img.height * sc);
  } else {
    ctx.font = `${Math.round(h * 0.6)}px sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(art?.emoji || "🐟", x + w / 2, y + h / 2);
    ctx.textBaseline = "alphabetic";
  }
}

const T = (lang, ja, en, es) => (lang === "ja" ? ja : lang === "es" ? (es || en) : en);

export async function renderCollectorCard({ card, art, progress, lang = "ja", user }) {
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d");
  const { fish, rarity, best } = card;
  const name = lang === "ja" ? fish.name : lang === "es" ? (fish.nameEs || fish.nameEn) : fish.nameEn;
  const sub = lang === "ja" ? fish.nameEn : fish.name;

  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#0a2837"); g.addColorStop(1, "#0d4a5a");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  // card frame
  const cx = 170, cy = 70, cw = 740, ch = 1036;
  ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = 40; ctx.shadowOffsetY = 16;
  rr(ctx, cx, cy, cw, ch, 44); ctx.fillStyle = rarity.color; ctx.fill(); ctx.restore();
  if (rarity.key === "epic") {
    const eg = ctx.createLinearGradient(cx, cy, cx + cw, cy + ch);
    eg.addColorStop(0, "#f4d06a"); eg.addColorStop(0.5, "#b07a0c"); eg.addColorStop(1, "#f4d06a");
    rr(ctx, cx, cy, cw, ch, 44); ctx.fillStyle = eg; ctx.fill();
  }
  const ix = cx + 22, iy = cy + 22, iw = cw - 44, ih = ch - 44;
  rr(ctx, ix, iy, iw, ih, 30); ctx.fillStyle = "#fffdf8"; ctx.fill();

  // header: number, rarity, stars
  ctx.textAlign = "left"; ctx.fillStyle = "#0a2837"; ctx.font = `800 40px ${FONT}`;
  ctx.fillText(card.no, ix + 36, iy + 66);
  ctx.textAlign = "right"; ctx.fillStyle = rarity.color; ctx.font = `900 44px ${FONT}`;
  ctx.fillText("★".repeat(rarity.stars) + " " + T(lang, rarity.ja, rarity.en, rarity.es), ix + iw - 36, iy + 66);

  // art window
  const ax = ix + 36, ay = iy + 96, aw = iw - 72, ah = 520;
  ctx.save(); rr(ctx, ax, ay, aw, ah, 22); ctx.clip();
  ctx.fillStyle = "#f2ece0"; ctx.fillRect(ax, ay, aw, ah);
  const photo = await loadImg(best?.photo);
  if (photo) {
    const sc = Math.max(aw / photo.width, ah / photo.height);
    ctx.drawImage(photo, ax + (aw - photo.width * sc) / 2, ay + (ah - photo.height * sc) / 2, photo.width * sc, photo.height * sc);
  } else {
    await drawArt(ctx, art, ax + 40, ay + 40, aw - 80, ah - 80);
  }
  ctx.restore();

  // name
  ctx.textAlign = "left"; ctx.fillStyle = "#0a2837";
  fit(ctx, name, iw - 72, 84); ctx.fillText(name, ix + 36, ay + ah + 100);
  if (sub && sub !== name) { ctx.fillStyle = "#6a6a5a"; ctx.font = `600 36px ${FONT}`; ctx.fillText(sub, ix + 36, ay + ah + 150); }

  // stats
  const date = best?.createdAt ? new Date(best.createdAt).toLocaleDateString(lang === "ja" ? "ja-JP" : lang === "es" ? "es-ES" : "en-US", { year: "numeric", month: "short", day: "numeric" }) : "";
  const stats = [
    [T(lang, "サイズ", "Size", "Tamaño"), best?.weight || "—"],
    [T(lang, "釣法", "Method", "Método"), best?.method === "fly" ? T(lang, "フライ", "Fly", "Mosca") : T(lang, "ルアー・エサ", "Lure / bait", "Señuelo / carnada")],
    [T(lang, "捕獲数", "Caught", "Capturas"), `×${card.count}`],
  ];
  const sy = ay + ah + 200, sw = (iw - 72) / 3;
  stats.forEach(([k, v], i) => {
    const sx = ix + 36 + i * sw;
    ctx.fillStyle = "#8a8a7a"; ctx.font = `700 30px ${FONT}`; ctx.fillText(k, sx, sy);
    ctx.fillStyle = "#0a2837"; fit(ctx, String(v), sw - 16, 46, 900); ctx.fillText(String(v), sx, sy + 56);
  });
  if (date) { ctx.fillStyle = "#8a8a7a"; ctx.font = `600 30px ${FONT}`; ctx.fillText(`📅 ${date}${user ? `  ·  ${user}` : ""}`, ix + 36, iy + ih - 34); }

  // foil sheen for fly catches
  if (card.foil) {
    ctx.save(); rr(ctx, cx, cy, cw, ch, 44); ctx.clip();
    const fg = ctx.createLinearGradient(cx, cy, cx + cw, cy + ch);
    [["rgba(255,0,170,0)", 0.15], ["rgba(255,0,170,0.16)", 0.32], ["rgba(0,220,255,0.18)", 0.46], ["rgba(255,240,0,0.16)", 0.6], ["rgba(120,255,140,0.12)", 0.72], ["rgba(255,255,255,0)", 0.88]]
      .forEach(([col, at]) => fg.addColorStop(at, col));
    ctx.fillStyle = fg; ctx.fillRect(cx, cy, cw, ch);
    ctx.restore();
    ctx.textAlign = "right"; ctx.fillStyle = "#c24bd6"; ctx.font = `900 30px ${FONT}`;
    ctx.fillText(T(lang, "🪶 フライ・ホロ", "🪶 FLY FOIL", "🪶 MOSCA HOLO"), ix + iw - 36, iy + ih - 34);
  }

  // collection progress + CTA
  ctx.textAlign = "center"; ctx.fillStyle = "#ffffff"; ctx.font = `800 44px ${FONT}`;
  ctx.fillText(T(lang, `釣りカード図鑑  ${progress.caught} / ${progress.total}`, `Catch Cards  ${progress.caught} / ${progress.total}`, `Cartas de pesca  ${progress.caught} / ${progress.total}`), W / 2, cy + ch + 80);
  ctx.fillStyle = "rgba(255,255,255,0.1)"; ctx.fillRect(0, H - 100, W, 100);
  ctx.fillStyle = "#FFE500"; ctx.font = `800 36px ${FONT}`;
  ctx.fillText(T(lang, `あなたも集めよう ▶ ${SITE}`, `Start your collection ▶ ${SITE}`, `Empieza tu colección ▶ ${SITE}`), W / 2, H - 38);

  return await new Promise(r => c.toBlob(r, "image/png"));
}

export async function shareCollectorCard(opts) {
  const blob = await renderCollectorCard(opts);
  if (!blob) return "error";
  const { card, lang = "ja" } = opts;
  const name = `castwise-card-${card.no.replace(/\W/g, "")}-${Date.now()}.png`;
  const file = new File([blob], name, { type: "image/png" });
  const label = lang === "ja" ? card.fish.name : card.fish.nameEn;
  const text = lang === "ja"
    ? `${card.no} ${label} のカードをゲット！ #釣りカード #釣り #Castwise\nhttps://${SITE}/?ref=card`
    : `Got the ${label} card (${card.no})! #fishing #Castwise\nhttps://${SITE}/?ref=card`;
  try {
    if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], text }); return "shared"; }
  } catch (e) {
    if (e?.name === "AbortError") return "cancelled";
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return "downloaded";
}
