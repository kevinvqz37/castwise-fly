// Hand-drawn SVG illustrations for FLY_PATTERNS (keyed by pattern id).
// Eye on the right, bend on the left. viewBox 0 0 160 100.

const HOOK = (shank = "#8a8f96") => `
  <path d="M132 50 L44 50 C24 50 20 80 40 83 C54 85 60 76 60 68" fill="none" stroke="${shank}" stroke-width="3" stroke-linecap="round"/>
  <path d="M60 68 L56 74" stroke="${shank}" stroke-width="2.4" stroke-linecap="round"/>
  <circle cx="137" cy="48" r="4.5" fill="none" stroke="${shank}" stroke-width="2.6"/>`;

// radiating fibres helper (hackle)
function fibres(cx, cy, r, n, color, from = 0, to = 360, w = 1.2, len = 1) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const a = ((from + (to - from) * (i / (n - 1 || 1))) * Math.PI) / 180;
    const rr = r * (0.8 + 0.2 * ((i * 37) % 10) / 10) * len;
    s += `<line x1="${cx}" y1="${cy}" x2="${(cx + Math.cos(a) * rr).toFixed(1)}" y2="${(cy + Math.sin(a) * rr).toFixed(1)}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
  }
  return s;
}
// palmered hackle along a body
function palmer(x0, x1, y, r, color, step = 6) {
  let s = "";
  for (let x = x0; x <= x1; x += step) s += fibres(x, y, r, 7, color, -160, -20, 1) + fibres(x, y, r * 0.8, 5, color, 20, 160, 1);
  return s;
}
// tail fibres fanning back from (x,y)
function tail(x, y, len, color, n = 7, spread = 14, w = 1.2) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const dy = -spread / 2 + (spread * i) / (n - 1);
    s += `<path d="M${x} ${y} Q${x - len * 0.5} ${y + dy * 0.4} ${x - len} ${y + dy}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
  }
  return s;
}
function rib(x0, x1, y, h, color, step = 7) {
  let s = "";
  for (let x = x0; x < x1; x += step) s += `<line x1="${x}" y1="${y + h}" x2="${x + 4}" y2="${y - h}" stroke="${color}" stroke-width="1.4"/>`;
  return s;
}
const svg = inner => `<svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">${inner}</svg>`;

export const FLY_SVG = {
  // Elk Hair Caddis
  1: svg(`${HOOK()}
    <path d="M48 50 Q90 43 124 49 Q90 57 48 51 Z" fill="#b08a5a"/>
    ${palmer(52, 120, 50, 9, "#7a4a24")}
    <path d="M126 44 C100 30 70 30 36 40 C60 41 90 43 126 50 Z" fill="#d9b98a" stroke="#a8844f" stroke-width="1"/>
    ${[0,1,2,3,4,5].map(i => `<path d="M124 ${45+i*0.6} C98 ${34+i} 70 ${34+i} ${38+i*2} ${41+i*0.4}" fill="none" stroke="#8f6a3a" stroke-width="0.8" opacity="0.7"/>`).join("")}
    ${[0,1,2,3,4,5,6].map(i => `<line x1="${124+i*1.2}" y1="44" x2="${126+i*1.4}" y2="${36+i*0.6}" stroke="#c9a472" stroke-width="1.6" stroke-linecap="round"/>`).join("")}`),

  // Pheasant Tail Nymph
  2: svg(`${HOOK()}
    ${tail(52, 50, 20, "#6b3f1f", 5, 8)}
    <path d="M50 50 Q80 44 106 46 Q108 50 106 54 Q80 56 50 51 Z" fill="#8a4f24"/>
    ${rib(56, 104, 50, 4, "#c77b35", 7)}
    <ellipse cx="116" cy="50" rx="12" ry="7.5" fill="#7a3f1a"/>
    <path d="M104 43 Q116 38 128 44 L128 47 Q116 43 104 46 Z" fill="#3e2410"/>
    ${fibres(114, 54, 9, 4, "#6b3f1f", 110, 160, 1)}
    <circle cx="131" cy="50" r="5.5" fill="#d4a53c" stroke="#9c7420" stroke-width="1"/>
    <circle cx="129.5" cy="48.5" r="1.6" fill="#fff3c4"/>`),

  // Woolly Bugger
  3: svg(`${HOOK()}
    <path d="M56 48 C38 38 20 44 6 36 C16 48 10 56 4 64 C22 58 38 62 56 54 Z" fill="#4a5a24" opacity="0.95"/>
    <path d="M56 49 C40 44 24 48 12 44 M56 52 C40 54 26 56 12 58" stroke="#2f3a14" stroke-width="1" fill="none" opacity="0.6"/>
    <path d="M54 50 Q90 40 128 47 Q130 50 128 54 Q90 60 54 51 Z" fill="#5f6e2c"/>
    ${[60,68,76,84,92,100,108,116,124].map(x => `<ellipse cx="${x}" cy="50" rx="3.4" ry="${5+ (x>80&&x<110?1:0)}" fill="#6f7f34" stroke="#4d5a20" stroke-width="0.6"/>`).join("")}
    ${palmer(58, 124, 50, 11, "#1e1e1e", 7)}`),

  // Parachute Adams
  4: svg(`${HOOK()}
    ${tail(50, 50, 22, "#7a6a5a", 7, 10, 1)}
    <path d="M48 50 Q84 45 112 47 Q114 50 112 53 Q84 55 48 51 Z" fill="#8f949a"/>
    <rect x="109" y="14" width="6" height="34" rx="3" fill="#fbfbf6" stroke="#a8a89a" stroke-width="1.2"/>
    ${Array.from({length: 26}, (_, i) => { const a = i / 26 * Math.PI * 2; const r = 22 + (i * 7 % 5); return `<line x1="112" y1="40" x2="${(112 + Math.cos(a) * r).toFixed(1)}" y2="${(40 + Math.sin(a) * r * 0.22).toFixed(1)}" stroke="${i % 2 ? "#6d5b49" : "#a3a8ad"}" stroke-width="1.1" stroke-linecap="round"/>`; }).join("")}
    <ellipse cx="112" cy="40" rx="4" ry="2" fill="#5a4a3a"/>`),

  // CDC Midge Dun
  5: svg(`${HOOK()}
    ${tail(70, 50, 12, "#8a8f7a", 4, 5, 0.9)}
    <path d="M68 50 Q96 46 122 48 Q124 50 122 52 Q96 54 68 51 Z" fill="#6f7a4a"/>
    ${rib(72, 118, 50, 2, "#9aa07a", 6)}
    <path d="M112 47 C104 26 94 18 80 18 C92 24 98 34 102 46 C98 32 92 26 86 24 C100 26 108 34 116 47 Z" fill="#b9bcc0" opacity="0.9"/>
    <path d="M112 47 C112 30 108 20 100 14 C114 22 118 34 118 47 Z" fill="#9ea2a8" opacity="0.85"/>
    <ellipse cx="124" cy="50" rx="5" ry="4" fill="#3a3a30"/>`),

  // Tenkara Sakasa Kebari (reversed hackle)
  6: svg(`${HOOK()}
    <path d="M56 50 Q86 45 114 47 Q116 50 114 53 Q86 55 56 51 Z" fill="#1d1d1d"/>
    ${rib(60, 110, 50, 3.5, "#b8322a", 8)}
    <rect x="114" y="46" width="6" height="8" rx="2" fill="#b8322a"/>
    ${fibres(118, 50, 20, 13, "#7a5230", -85, 85, 1.2)}
    ${fibres(118, 50, 16, 9, "#a9774a", -70, 70, 1)}`),

  // Zonker (Red)
  7: svg(`${HOOK()}
    <path d="M52 50 Q88 42 124 47 Q126 50 124 53 Q88 58 52 51 Z" fill="#c0392b"/>
    ${[0,1,2,3,4].map(i => `<line x1="${60+i*13}" y1="${45+i*0.2}" x2="${64+i*13}" y2="${55}" stroke="#e8c9c4" stroke-width="1.2"/>`).join("")}
    <path d="M124 44 C100 36 70 38 50 42 C34 44 18 38 4 44 C18 48 34 50 52 47 C76 43 100 44 124 47 Z" fill="#f4f1ea" stroke="#d6cfc0" stroke-width="1"/>
    ${[8,16,24,32,40,50,60,70,80,90,100,110,118].map(x => `<path d="M${x} ${x < 50 ? 42 : 43} q-3 -3 -7 -2" fill="none" stroke="#cfc6b4" stroke-width="1" stroke-linecap="round"/>`).join("")}
    <circle cx="127" cy="50" r="5" fill="#d0d4d8" stroke="#8a8f96" stroke-width="1"/>
    <circle cx="127" cy="50" r="2.4" fill="#e0a800"/><circle cx="127" cy="50" r="1.1" fill="#111"/>`),

  // Gold Ribbed Hare's Ear
  8: svg(`${HOOK()}
    ${tail(54, 50, 14, "#8a6a44", 6, 7, 1)}
    <path d="M52 50 Q80 43 106 45 Q108 50 106 55 Q80 57 52 51 Z" fill="#a88760"/>
    ${[56,62,68,74,80,86,92,98,104].map((x,i) => `<line x1="${x}" y1="${46 + (i%2)}" x2="${x+(i%3)-1}" y2="${43 - (i%2)*2}" stroke="#c9ab80" stroke-width="1" stroke-linecap="round"/><line x1="${x+2}" y1="54" x2="${x+1}" y2="${57 + (i%2)}" stroke="#8d6d48" stroke-width="1" stroke-linecap="round"/>`).join("")}
    ${rib(56, 104, 50, 4.5, "#e0b340", 7)}
    <ellipse cx="116" cy="50" rx="11" ry="8" fill="#8f6f4a"/>
    ${fibres(116, 52, 10, 8, "#b89468", 30, 170, 1)}
    <path d="M105 43 Q116 38 127 44 L127 46 Q116 42 105 45.5 Z" fill="#4a3620"/>
    <circle cx="131" cy="50" r="5.5" fill="#d4a53c" stroke="#9c7420" stroke-width="1"/>
    <circle cx="129.5" cy="48.5" r="1.6" fill="#fff3c4"/>`),
};
