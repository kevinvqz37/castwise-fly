// Catch share card: renders a 1080x1350 image (Instagram portrait) with the catch photo
// or species illustration, species, size, place, angler and the app URL, then opens the
// native share sheet (Instagram / X / LINE on phones) or downloads the PNG.

const SITE = "castwise-fly.vercel.app";
const W = 1080, H = 1350;

function loadImg(src) {
  return new Promise((res) => {
    if (!src) return res(null);
    const im = new Image();
    if (/^https?:/.test(src)) im.crossOrigin = "anonymous";
    im.onload = () => res(im);
    im.onerror = () => res(null);
    im.src = src;
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

function fitText(ctx, text, maxW, size, weight = 800, family = "'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif") {
  let s = size;
  do { ctx.font = `${weight} ${s}px ${family}`; s -= 2; } while (ctx.measureText(text).width > maxW && s > 20);
  return s + 2;
}

export async function renderShareCard({ catchData, fish, lang = "ja" }) {
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d");

  // background
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#0a2837"); g.addColorStop(1, "#0d4a5a");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  // photo / illustration panel
  const px = 60, py = 150, pw = W - 120, ph = 760;
  ctx.save(); roundRect(ctx, px, py, pw, ph, 36); ctx.clip();
  const photo = await loadImg(catchData.photo);
  if (photo) {
    const sc = Math.max(pw / photo.width, ph / photo.height);
    const dw = photo.width * sc, dh = photo.height * sc;
    ctx.drawImage(photo, px + (pw - dw) / 2, py + (ph - dh) / 2, dw, dh);
  } else {
    ctx.fillStyle = "#f5f0e8"; ctx.fillRect(px, py, pw, ph);
    const art = fish?.id >= 101 ? await loadImg(`/fish/${fish.id}.webp`) : null;
    if (art) {
      const sc = Math.min((pw - 80) / art.width, (ph - 120) / art.height);
      ctx.drawImage(art, px + (pw - art.width * sc) / 2, py + (ph - art.height * sc) / 2, art.width * sc, art.height * sc);
    } else {
      ctx.font = "320px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(fish?.emoji || "🎣", W / 2, py + ph / 2);
    }
  }
  ctx.restore();

  // header
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#FFE500"; ctx.font = "900 54px 'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif";
  ctx.fillText("🎣 Castwise", 60, 95);
  ctx.fillStyle = "rgba(255,255,255,0.75)"; ctx.font = "600 34px 'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif";
  ctx.textAlign = "right"; ctx.fillText(lang === "ja" ? "釣果レポート" : "Catch Report", W - 60, 95);

  // species + size
  const species = catchData.fish || (lang === "ja" ? "釣果" : "My catch");
  const en = fish?.nameEn && fish.nameEn !== species ? fish.nameEn : "";
  ctx.textAlign = "left"; ctx.fillStyle = "#ffffff";
  fitText(ctx, species, W - 120 - (catchData.weight ? 330 : 0), 96);
  ctx.fillText(species, 60, 1030);
  if (catchData.weight) {
    const txt = String(catchData.weight);
    ctx.font = "900 64px 'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif";
    const tw = ctx.measureText(txt).width + 56;
    roundRect(ctx, W - 60 - tw, 962, tw, 88, 44); ctx.fillStyle = "#FFE500"; ctx.fill();
    ctx.fillStyle = "#0a2837"; ctx.textAlign = "center"; ctx.fillText(txt, W - 60 - tw / 2, 1030);
  }
  ctx.textAlign = "left";
  if (en) { ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.font = "600 38px sans-serif"; ctx.fillText(en, 60, 1085); }

  // meta line
  const place = catchData.locationDisplay || catchData.location || "";
  const date = new Date(catchData.createdAt || Date.now()).toLocaleDateString(lang === "ja" ? "ja-JP" : "en-US", { year: "numeric", month: "short", day: "numeric" });
  ctx.fillStyle = "#cfe8e8"; ctx.font = "600 38px 'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif";
  const meta = [place && `📍 ${place}`, `📅 ${date}`].filter(Boolean).join("   ");
  fitText(ctx, meta, W - 120, 38, 600); ctx.fillText(meta, 60, en ? 1150 : 1120);
  if (catchData.user) { ctx.font = "600 36px 'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif"; ctx.fillText(`${catchData.avatar || "🎣"} ${catchData.user}`, 60, en ? 1205 : 1175); }

  // footer CTA
  ctx.fillStyle = "rgba(255,255,255,0.1)"; ctx.fillRect(0, H - 110, W, 110);
  ctx.fillStyle = "#ffffff"; ctx.font = "700 36px 'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif"; ctx.textAlign = "center";
  ctx.fillText(lang === "ja" ? `AI釣り予報・魚図鑑 ▶ ${SITE}` : `AI fishing forecast ▶ ${SITE}`, W / 2, H - 42);

  return await new Promise(r => c.toBlob(r, "image/png"));
}

export async function shareCatchCard({ catchData, fish, lang = "ja" }) {
  const blob = await renderShareCard({ catchData, fish, lang });
  if (!blob) return "error";
  const name = `castwise-${(catchData.fish || "catch").replace(/\s+/g, "")}-${Date.now()}.png`;
  const file = new File([blob], name, { type: "image/png" });
  const tags = lang === "ja" ? "#釣り #釣果 #Castwise" : "#fishing #flyfishing #Castwise";
  const text = `${catchData.fish || ""} ${catchData.weight || ""} ${tags}\nhttps://${SITE}/?ref=share`;
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], text });
      return "shared";
    }
  } catch (e) {
    if (e?.name === "AbortError") return "cancelled";
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return "downloaded";
}
