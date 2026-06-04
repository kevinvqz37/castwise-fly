import { useState, useEffect, useRef } from "react";
import React from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, setDoc, deleteDoc, doc, where, getDocs, serverTimestamp, Timestamp } from "firebase/firestore";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";

// ─── FIREBASE ────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyCy0qh48dgp31-2xcI1YV3R73qTJGs4tFM",
  authDomain: "castwise-fly.firebaseapp.com",
  projectId: "castwise-fly",
  storageBucket: "castwise-fly.firebasestorage.app",
  messagingSenderId: "468608071051",
  appId: "1:468608071051:web:3d6812edbcf5aacde52b8e",
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T = {
  appTagline: { ja: "もっと賢く釣る", en: "fish smarter · catch more", es: "pesca más inteligente" },
  whatFishing: { ja: "何を釣りますか？", en: "What are you fishing for?", es: "¿Qué vas a pescar?" },
  selectSpecies: { ja: "魚を選んでギア＆釣り場を確認", en: "Select a species for gear & spots", es: "Elige una especie para ver equipos y lugares" },
  search: { ja: "魚を検索...", en: "Search fish...", es: "Buscar peces..." },
  aiAdvisor: { ja: "🤖 今日のAIルアー診断 →", en: "🤖 AI Lure Advice →", es: "🤖 Consejo IA de Señuelos →" },
  aiFlyAdvisor: { ja: "🪰 今日のAIフライ診断 →", en: "🪰 AI Fly Pattern Advice →", es: "🪰 Consejo IA de Mosca →" },
  proTip: { ja: "プロのコツ", en: "Pro Tip", es: "Consejo Pro" },
  back: { ja: "← 戻る", en: "← Back", es: "← Volver" },
  browsefish: { ja: "魚を探す →", en: "Browse Fish →", es: "Ver Peces →" },
  noCatchYet: { ja: "まだ釣果がありません。\n釣りに行きましょう！", en: "No catches yet.\nGet out there!", es: "Sin capturas todavía.\n¡A pescar!" },
  logCatch: { ja: "📸 釣果を記録する", en: "📸 Log a Catch", es: "📸 Registrar Captura" },
  saveshare: { ja: "保存＆シェア", en: "Save & Share", es: "Guardar y Compartir" },
  cancel: { ja: "キャンセル", en: "Cancel", es: "Cancelar" },
  excellent: { ja: "🔥 今日は最高の釣り日和！", en: "🔥 Excellent fishing today!", es: "🔥 ¡Excelentes condiciones hoy!" },
  good: { ja: "👍 良い条件 — 釣りに行こう", en: "👍 Good conditions — go fish", es: "👍 Buenas condiciones — ¡a pescar!" },
  fair: { ja: "😐 まずまず — 深場を狙って", en: "😐 Fair — fish deep or wait", es: "😐 Regular — pesca profundo o espera" },
  keepFishing: { ja: "🔥 上位を目指して釣り続けよう！", en: "🔥 Keep fishing to climb the ranks!", es: "🔥 ¡Sigue pescando para subir el ranking!" },
  verified: { ja: "✓ 認証済", en: "✓ Verified", es: "✓ Verificado" },
  addComment: { ja: "コメントを追加...", en: "Add a comment...", es: "Añadir comentario..." },
  addPhoto: { ja: "タップして写真を追加", en: "Tap to add photo", es: "Toca para añadir foto" },
  edit: { ja: "編集", en: "Edit", es: "Editar" },
  save: { ja: "保存", en: "Save", es: "Guardar" },
};
function s(key, lang) { return T[key]?.[lang] || key; }



// ─── ADSTERRA ADS ────────────────────────────────────────────────────────────
const ADSTERRA_KEY = "40aa13e6e14b36d178383836e1a4154e";

function AdsterraBanner() {
  const id = useRef("adsterra-" + Math.random().toString(36).slice(2)).current;

  useEffect(() => {
    // Set options fresh for this instance
    window.atOptions = {
      key: ADSTERRA_KEY,
      format: "iframe",
      height: 50,
      width: 320,
      params: {},
    };

    // Remove old script so it re-executes for this instance
    const old = document.getElementById("adsterra-script");
    if (old) old.remove();

    const script = document.createElement("script");
    script.id = "adsterra-script";
    script.src = `https://www.highperformanceformat.com/${ADSTERRA_KEY}/invoke.js`;
    script.async = true;
    document.getElementById(id)?.appendChild(script);
  }, []);

  return (
    <div id={id} style={{ margin: "10px auto", overflow: "hidden", minHeight: 52, maxWidth: 320, display: "flex", justifyContent: "center", alignItems: "center", background: "#f5f0e8" }} />
  );
}

function BannerAd({ lang, onDismiss, isPremium }) {
  // Ads paused until launch
  return null;
}
// ─── AMAZON AFFILIATE ────────────────────────────────────────────────────────
const AMAZON_TAG = "mabo-22";

function amazonLink(searchQuery) {
  const query = encodeURIComponent(searchQuery + " 釣り");
  return `https://www.amazon.co.jp/s?k=${query}&tag=${AMAZON_TAG}`;
}

function LureTag({ lure, lang }) {
  return (
    <a href={amazonLink(lure)} target="_blank" rel="noopener noreferrer"
      style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#fff8e8", border: "2px solid #f0a020", borderRadius: 99, padding: "4px 12px", fontSize: "0.82rem", color: "#c06a10", fontWeight: 700, textDecoration: "none", cursor: "pointer" }}
      onClick={e => e.stopPropagation()}>
      🎯 {lure}
      <span style={{ fontSize: "0.7rem", color: "#f0a020" }}>Amazon↗</span>
    </a>
  );
}




function InterstitialAd({ lang, onClose, onWatchReward, isPremium }) {
  const [countdown, setCountdown] = useState(5);
  const adRef = useRef(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {
    if (scriptLoaded.current) return;
    scriptLoaded.current = true;

    // Give React time to mount the div before injecting
    const timer = setTimeout(() => {
      if (!adRef.current) return;

      // Remove any old script
      const old = document.getElementById("adsterra-interstitial");
      if (old) old.remove();

      const script = document.createElement("script");
      script.id = "adsterra-interstitial";
      script.src = "https://pl29535445.effectivecpmnetwork.com/6d/a2/a6/6da2a654affcf15cddf58a21344673d7.js";
      script.async = true;
      script.onerror = () => console.warn("Adsterra interstitial failed to load");
      document.body.appendChild(script);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  if (isPremium) { onClose(); return null; }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 390, background: "#fffdf8", borderRadius: 24, overflow: "hidden", animation: "fadeUp 0.4s ease" }}>
        <div style={{ background: "#f8f4ec", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.88rem", color: "#5a5a4a" }}>{lang === "ja" ? "スポンサー広告" : "Sponsored"}</span>
          <span style={{ fontSize: "0.88rem", color: "#5a5a4a", fontWeight: 700 }}>
            {countdown > 0 ? (lang === "ja" ? `${countdown}秒後にスキップ` : `Skip in ${countdown}s`) : (lang === "ja" ? "スキップ可能 →" : "Skip now →")}
          </span>
        </div>
        {/* Ad renders here — Adsterra injects iframe into body, so this is a placeholder */}
        <div ref={adRef} style={{ minHeight: 250, display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f0e8", overflow: "hidden" }}>
          <span style={{ fontSize: "0.8rem", color: "#9a9a8a" }}>{lang === "ja" ? "広告を読み込み中..." : "Loading ad..."}</span>
        </div>
        <div style={{ padding: "12px 16px", display: "flex", gap: 10 }}>
          <button onClick={countdown <= 0 ? onClose : undefined}
            style={{ flex: 1, padding: "12px", background: countdown <= 0 ? "#e0f2f2" : "#e8e3d8", border: `2px solid ${countdown <= 0 ? "#1a1a14" : "#c4bfb4"}`, borderRadius: 12, color: countdown <= 0 ? "#1a1a14" : "#9a9a8a", cursor: countdown <= 0 ? "pointer" : "not-allowed", fontFamily: "inherit", fontSize: "1rem", fontWeight: 700 }}>
            {countdown > 0 ? `⏱ ${countdown}s` : (lang === "ja" ? "✕ スキップ" : "✕ Skip")}
          </button>
        </div>
        {onWatchReward && (
          <div style={{ padding: "0 16px 16px" }}>
            <button onClick={onWatchReward} style={{ width: "100%", padding: "10px", background: "#d0eae8", border: "2px solid #c8b800", borderRadius: 12, color: "#2d7a3a", cursor: "pointer", fontFamily: "inherit", fontSize: "0.95rem", fontWeight: 600 }}>
              🎁 {lang === "ja" ? "広告を見て+50ポイントゲット！" : "Watch for +50 bonus points!"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
function RewardedAdModal({ lang, onComplete, onClose }) {
  const [phase, setPhase] = useState("intro"); // intro | watching | complete
  const [progress, setProgress] = useState(0);
  const [ad] = useState(() => AD_CAMPAIGNS[Math.floor(Math.random() * (AD_CAMPAIGNS.length - 1))]);
  function startAd() {
    setPhase("watching");
    let p = 0;
    const iv = setInterval(() => {
      p += 2;
      setProgress(p);
      if (p >= 100) { clearInterval(iv); setPhase("complete"); }
    }, 300);
  }
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 390, background: "#fffdf8", border: "2px solid #60b080", borderRadius: 24, padding: 24, animation: "fadeUp 0.3s ease" }}>
        {phase === "intro" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: "3rem", marginBottom: 8 }}>🎁</div>
              <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 6 }}>{lang === "ja" ? "報酬広告" : "Rewarded Ad"}</div>
              <div style={{ fontSize: "0.95rem", color: "#5a5a4a", lineHeight: 1.6 }}>
                {lang === "ja" ? "15秒の動画を見て特典をゲット！" : "Watch a 15s video to earn your reward!"}
              </div>
            </div>
            <div style={{ background: "#e8f4ec", border: "2px solid #FFE500", borderRadius: 14, padding: 14, marginBottom: 16 }}>
              {[{ icon: "⭐", text: { ja: "+100 釣りポイント", en: "+100 Fishing Points" } }, { icon: "🤖", text: { ja: "AIアドバイス 3回分", en: "3 free AI advice uses" } }, { icon: "🪶", text: { ja: "プレミアムフライパターン解放", en: "Premium fly pattern unlocked" } }].map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: i < 2 ? 8 : 0 }}>
                  <span style={{ fontSize: "1.2rem" }}>{r.icon}</span>
                  <span style={{ fontSize: "0.95rem", color: "#2d7a3a", fontWeight: 600 }}>{r.text[lang]}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={startAd} style={{ flex: 2, padding: "12px", background: "#c8e8d0", border: "2px solid #60b080", borderRadius: 12, color: "#2d7a3a", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: "1.05rem" }}>
                {lang === "ja" ? "▶ 動画を見る" : "▶ Watch Video"}
              </button>
              <button onClick={onClose} style={{ flex: 1, padding: "12px", background: "transparent", border: "2px solid #d4cfc4", borderRadius: 12, color: "#5a5a4a", cursor: "pointer", fontFamily: "inherit", fontSize: "1.05rem" }}>
                {lang === "ja" ? "後で" : "Later"}
              </button>
            </div>
          </>
        )}
        {phase === "watching" && (
          <>
            <div style={{ height: 160, background: `linear-gradient(135deg,${ad.bg},${ad.accent}22)`, borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: 16, gap: 10 }}>
              <div style={{ fontSize: "3.5rem", animation: "float 1s ease-in-out infinite" }}>{ad.logo}</div>
              <div style={{ fontWeight: 700, color: ad.accent, fontSize: "1.1rem" }}>{lang === "ja" ? ad.brand : ad.brandEn}</div>
              <div style={{ fontSize: "1.05rem", color: "#3a3a2a", textAlign: "center" }}>{ad.tagline[lang]}</div>
            </div>
            <div style={{ background: "#fffdf8", borderRadius: 99, height: 8, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#FFE500,#48cae4)", borderRadius: 99, transition: "width 0.3s" }} />
            </div>
            <div style={{ textAlign: "center", fontSize: "1rem", color: "#5a5a4a" }}>
              {lang === "ja" ? `${Math.ceil((100 - progress) / 6.7)}秒...` : `${Math.ceil((100 - progress) / 6.7)}s remaining...`}
            </div>
          </>
        )}
        {phase === "complete" && (
          <>
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: "3.5rem", marginBottom: 10, animation: "float 1s ease-in-out infinite" }}>🎉</div>
              <div style={{ fontWeight: 700, fontSize: "1.2rem", color: "#2d7a3a", marginBottom: 8 }}>{lang === "ja" ? "特典ゲット！" : "Reward Earned!"}</div>
              <div style={{ fontSize: "1rem", color: "#5a5a4a", marginBottom: 20 }}>
                {lang === "ja" ? "+100ポイント & AI診断3回分が追加されました" : "+100 points & 3 AI uses added to your account"}
              </div>
              <button onClick={onComplete} style={{ padding: "12px 32px", background: "#c8e8d0", border: "2px solid #60b080", borderRadius: 12, color: "#2d7a3a", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: "1.05rem" }}>
                {lang === "ja" ? "✓ 受け取る" : "✓ Claim Reward"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


// ─── JAPAN2 SPRITE SHEET (Species 25-36) ─────────────────────────────────────
const JAPAN2_SPRITE_URL = "/japan2_spritesheet.png";
const JAPAN2_COLS = 4;
const JAPAN2_ROWS = 3;

const JAPAN2_SPRITE_DATA = {
  maguro:   { col: 0, row: 0 }, katsuo:   { col: 1, row: 0 },
  sawara:   { col: 2, row: 0 }, hiramasa: { col: 3, row: 0 },
  gure:     { col: 0, row: 1 }, kawahagi: { col: 1, row: 1 },
  itou:     { col: 2, row: 1 }, sake:     { col: 3, row: 1 },
  saba:     { col: 0, row: 2 }, kijihata: { col: 1, row: 2 },
  akame:    { col: 2, row: 2 }, nodoguro: { col: 3, row: 2 },
};

const JAPAN2_ID_MAP = {
  25: "maguro", 26: "katsuo", 27: "sawara", 28: "hiramasa",
  29: "gure",   30: "kawahagi", 31: "itou", 32: "sake",
  33: "saba",   34: "kijihata", 35: "akame", 36: "nodoguro",
};

// ─── CARIBBEAN SPRITE SHEET ──────────────────────────────────────────────────
const CARIBBEAN_SPRITE_URL = "/caribbean_spritesheet.png";
const CARIBBEAN_COLS = 7;
const CARIBBEAN_ROWS = 2;

const CARIBBEAN_SPRITE_DATA = {
  tarpon:         { col: 0, row: 0 }, snook:          { col: 1, row: 0 },
  bonefish:       { col: 2, row: 0 }, permit:         { col: 3, row: 0 },
  mahi_mahi:      { col: 4, row: 0 }, wahoo:          { col: 5, row: 0 },
  barracuda:      { col: 6, row: 0 }, red_snapper:    { col: 0, row: 1 },
  grouper:        { col: 1, row: 1 }, jack_crevalle:  { col: 2, row: 1 },
  redfish:        { col: 3, row: 1 }, marlin:         { col: 4, row: 1 },
  yellowfin_tuna: { col: 5, row: 1 }, needlefish:     { col: 6, row: 1 },
};

const CARIBBEAN_EMOJI = {
  tarpon: "🐟", snook: "🐟", bonefish: "🐟", permit: "🐟",
  mahi_mahi: "🐠", wahoo: "🐟", barracuda: "🦈", red_snapper: "🐠",
  grouper: "🐟", jack_crevalle: "🐟", redfish: "🐟", marlin: "🐟",
  yellowfin_tuna: "🐟", needlefish: "🐟",
};

function CaribbeanFishIllustration({ fishId, size = 80, style = {} }) {
  const sprite = CARIBBEAN_SPRITE_DATA[fishId];
  if (CARIBBEAN_SPRITE_URL && sprite) {
    const xPercent = (sprite.col / (CARIBBEAN_COLS - 1)) * 100;
    const yPercent = (sprite.row / (CARIBBEAN_ROWS - 1)) * 100;
    return (
      <div style={{
        width: size, height: size,
        backgroundImage: `url(${CARIBBEAN_SPRITE_URL})`,
        backgroundSize: `${CARIBBEAN_COLS * 100}% ${CARIBBEAN_ROWS * 100}%`,
        backgroundPosition: `${xPercent}% ${yPercent}%`,
        backgroundRepeat: "no-repeat",
        display: "inline-block",
        ...style,
      }} />
    );
  }
  return (
    <div style={{ width: size, height: size, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.55, ...style }}>
      {CARIBBEAN_EMOJI[fishId] || "🐟"}
    </div>
  );
}


// Maps FISH_DATA appId -> sprite key
const APP_ID_TO_SPRITE = {
  1: "largemouth_bass", 2: "ayu", 3: "yamame", 4: "seabass",
  5: "iwana", 6: "madai", 7: "aji", 8: "hirame", 9: "herabuna",
  10: "koi", 11: "rainbow_trout", 12: "aori_ika", 13: "buri",
  14: "kurodai", 15: "hamachi", 16: "mebaru",
};

const SPRITE_EMOJI = {
  largemouth_bass: "🐟", ayu: "🐠", yamame: "🐡", iwana: "🐠",
  rainbow_trout: "🐠", herabuna: "🐟", koi: "🐟", seabass: "🦈",
  kurodai: "🐟", hirame: "🦈", madai: "🐟", mebaru: "🐟",
  aori_ika: "🦑", aji: "🐟", hamachi: "🦈", buri: "🦈",
};

// Set SPRITE_SHEET_URL to "/fish_spritesheet.png" once image is in public/
const SPRITE_SHEET_URL = "/fish_spritesheet.png";
const SPRITE_COLS = 7;
const SPRITE_ROWS = 4;

const SPRITE_DATA = {
  // Row 0 — Freshwater
  largemouth_bass: { col: 0, row: 0 },
  ayu:             { col: 1, row: 0 },
  yamame:          { col: 2, row: 0 },
  iwana:           { col: 3, row: 0 },
  rainbow_trout:   { col: 4, row: 0 },
  herabuna:        { col: 5, row: 0 },
  koi:             { col: 6, row: 0 },
  // Row 1 — Shallow Saltwater
  seabass:         { col: 0, row: 1 },
  hira_suzuki:     { col: 1, row: 1 },
  kurodai:         { col: 2, row: 1 },
  magochi:         { col: 3, row: 1 },
  hirame:          { col: 4, row: 1 },
  madai:           { col: 5, row: 1 },
  isaki:           { col: 6, row: 1 },
  // Row 2 — Structure & Reef
  mebaru:          { col: 0, row: 2 },
  aohata:          { col: 1, row: 2 },
  tachiuo:         { col: 2, row: 2 },
  aori_ika:        { col: 3, row: 2 },
  aji:             { col: 4, row: 2 },
  // Row 3 — Pelagic (hooked poses)
  hamachi:         { col: 0, row: 3 },
  buri:            { col: 1, row: 3 },
  kanpachi:        { col: 2, row: 3 },
};

const FISH_SVG = {};
function FishIllustration({ fishId, spriteId, size = 80, style = {} }) {
  // Check if this is a Japan2 fish (ids 25-36)
  const japan2Key = JAPAN2_ID_MAP[fishId];
  const japan2Sprite = japan2Key ? JAPAN2_SPRITE_DATA[japan2Key] : null;
  if (JAPAN2_SPRITE_URL && japan2Sprite) {
    const xPct = (japan2Sprite.col / (JAPAN2_COLS - 1)) * 100;
    const yPct = (japan2Sprite.row / (JAPAN2_ROWS - 1)) * 100;
    return (
      <div style={{
        width: size, height: size,
        backgroundImage: `url(${JAPAN2_SPRITE_URL})`,
        backgroundSize: `${JAPAN2_COLS * 100}% ${JAPAN2_ROWS * 100}%`,
        backgroundPosition: `${xPct}% ${yPct}%`,
        backgroundRepeat: "no-repeat",
        display: "inline-block",
        ...style,
      }} />
    );
  }

  // Check if this is a Caribbean fish
  const caribSprite = spriteId ? CARIBBEAN_SPRITE_DATA[spriteId] : null;
  if (CARIBBEAN_SPRITE_URL && caribSprite) {
    const xPercent = (caribSprite.col / (CARIBBEAN_COLS - 1)) * 100;
    const yPercent = (caribSprite.row / (CARIBBEAN_ROWS - 1)) * 100;
    return (
      <div style={{
        width: size, height: size,
        backgroundImage: `url(${CARIBBEAN_SPRITE_URL})`,
        backgroundSize: `${CARIBBEAN_COLS * 100}% ${CARIBBEAN_ROWS * 100}%`,
        backgroundPosition: `${xPercent}% ${yPercent}%`,
        backgroundRepeat: "no-repeat",
        display: "inline-block",
        ...style,
      }} />
    );
  }

  // Japan sprite sheet
  const spriteKey = APP_ID_TO_SPRITE[fishId];
  const sprite = spriteKey ? SPRITE_DATA[spriteKey] : null;

  if (SPRITE_SHEET_URL && sprite) {
    const xPercent = (sprite.col / (SPRITE_COLS - 1)) * 100;
    const yPercent = (sprite.row / (SPRITE_ROWS - 1)) * 100;
    return (
      <div style={{
        width: size, height: size,
        backgroundImage: `url(${SPRITE_SHEET_URL})`,
        backgroundSize: `${SPRITE_COLS * 100}% ${SPRITE_ROWS * 100}%`,
        backgroundPosition: `${xPercent}% ${yPercent}%`,
        backgroundRepeat: "no-repeat",
        display: "inline-block",
        ...style,
      }} />
    );
  }

  const emoji = spriteKey ? (SPRITE_EMOJI[spriteKey] || "🐟") : "🐟";
  return (
    <div style={{ width: size, height: size, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.55, animation: "float 3s ease-in-out infinite", ...style }}>
      {emoji}
    </div>
  );
}



// ─── FISH DATA ───────────────────────────────────────────────────────────────
const FISH_DATA = [
  { id: 1, name: "ブラックバス", nameEn: "Largemouth Bass", emoji: "🐟", color: "#2d6a4f", accent: "#74c69d", difficulty: "beginner", flyFriendly: false, season: { ja: "春〜秋", en: "Spring–Fall" }, habitat: { ja: "湖、池、水草周り", en: "Lakes, ponds, weedy rivers" }, bestTime: { ja: "早朝・夕方", en: "Early morning & evening" }, description: { ja: "日本でも大人気のスポーツフィッシングターゲット。攻撃的なバイトとダイナミックなファイトが魅力。", en: "Japan's most popular sport fish. Aggressive bites and dynamic fights." }, gear: { rod: { ja: "M〜MH 6'6″〜7'0″ キャスティングロッド", en: "M-MH 6'6″–7'0″ casting rod" }, reel: { ja: "ベイトリール ギア比6.3:1以上", en: "Baitcaster 6.3:1+" }, line: { ja: "フロロ 14〜20lb または PE 1.0〜1.5号", en: "14–20lb fluoro or PE 1.0–1.5" }, hooks: { ja: "#2/0〜4/0 EWGオフセット", en: "#2/0–4/0 EWG offset" }, lures: ["スピニングワーム", "クランクベイト", "ジグ＆ポーク", "トップウォーター", "スピナーベイト"], tips: { ja: "桟橋、蓮の茎、沈木などストラクチャーを狙おう。水温が低い時はスローに。", en: "Target docks, lily stems, timber. Slow down in cold water." } }, spots: [{ name: "琵琶湖（滋賀）", rating: 5.0, type: { ja: "湖", en: "Lake" } }, { name: "亀山ダム（千葉）", rating: 4.8, type: { ja: "ダム湖", en: "Reservoir" } }, { name: "相模湖（神奈川）", rating: 4.7, type: { ja: "湖", en: "Lake" } }] },
  { id: 2, name: "アユ", nameEn: "Sweetfish (Ayu)", emoji: "🐠", color: "#1a4e7c", accent: "#1a1a14", difficulty: "advanced", flyFriendly: true, flyNote: { ja: "テンカラ毛鉤での釣りも可能。逆さ毛鉤が効果的。", en: "Can be taken on tenkara kebari. A unique traditional approach." }, season: { ja: "6月〜10月", en: "June–October" }, habitat: { ja: "清流・渓流の砂礫底", en: "Clear, gravelly mountain rivers" }, bestTime: { ja: "午前中・くもりの日", en: "Morning & overcast days" }, description: { ja: "日本の国民的な渓流魚。友釣りの伝統は何百年もの歴史を持つ。塩焼きが絶品。", en: "Japan's iconic river fish. Centuries of 'tomozuri' tradition. Delicious grilled." }, gear: { rod: { ja: "友釣り専用竿 8〜9m", en: "8–9m ayu rod" }, reel: { ja: "（友釣りはリールなし）", en: "None (traditional)" }, line: { ja: "メタライン 0.2〜0.3号", en: "0.2–0.3 metal line" }, hooks: { ja: "友釣り用イカリ針", en: "Tomozuri anchor hooks" }, lures: ["友鮎（おとり鮎）", "小型スプーン", "毛鉤（テンカラ）"], tips: { ja: "友釣りは縄張りを持つアユのおとりへの攻撃を利用する伝統漁法。", en: "Tomozuri uses a live decoy ayu. Target fast mid-channel sections." } }, spots: [{ name: "長良川（岐阜）", rating: 5.0, type: { ja: "清流", en: "River" } }, { name: "四万十川（高知）", rating: 4.9, type: { ja: "清流", en: "River" } }, { name: "球磨川（熊本）", rating: 4.8, type: { ja: "清流", en: "River" } }] },
  { id: 3, name: "ヤマメ", nameEn: "Yamame Trout", emoji: "🐡", color: "#3d405b", accent: "#e9c46a", difficulty: "intermediate", flyFriendly: true, flyNote: { ja: "フライフィッシングで最も人気のターゲット。ドライフライへのライズが壮観。", en: "Japan's #1 fly fishing target. Watching a yamame rise to a dry fly is breathtaking." }, season: { ja: "3月〜9月（禁漁期あり）", en: "March–September" }, habitat: { ja: "山岳渓流・源流域の冷水域", en: "Cold mountain streams and headwaters" }, bestTime: { ja: "早朝・夕方・雨後", en: "Early morning, evening, after rain" }, description: { ja: "渓流の女王とも呼ばれる美しい淡水魚。細かいドット模様と銀白色のボディが特徴的。", en: "Called 'Queen of the Mountain Stream'. Stunning parr marks. Japan's premier fly fishing target." }, gear: { rod: { ja: "渓流ロッド 4〜5フィート UL〜L またはテンカラ竿", en: "4–5ft UL–L rod or tenkara rod" }, reel: { ja: "1000〜2000番スピニング / テンカラはリールなし", en: "1000–2000 spinning / None for tenkara" }, line: { ja: "ナイロン 2〜4lb またはフロロ 2〜3lb", en: "2–4lb nylon or 2–3lb fluoro" }, hooks: { ja: "#8〜12 バーブレスフック", en: "#8–12 barbless hook" }, lures: ["スプーン 2〜5g", "小型ミノー", "毛鉤（テンカラ）", "ぶどう虫", "川虫"], tips: { ja: "上流に向かってキャストし、自然な流れに乗せる。影を川に落とさないこと。", en: "Cast upstream and drift naturally. Keep your shadow off the water." } }, spots: [{ name: "奥多摩川（東京）", rating: 4.7, type: { ja: "渓流", en: "Stream" } }, { name: "只見川（福島）", rating: 4.8, type: { ja: "渓流", en: "Stream" } }, { name: "庄川（富山）", rating: 4.6, type: { ja: "渓流", en: "Stream" } }] },
  { id: 4, name: "シーバス", nameEn: "Sea Bass", emoji: "🦈", color: "#1b4332", accent: "#b7e4c7", difficulty: "intermediate", flyFriendly: false, season: { ja: "通年（秋が最盛期）", en: "Year-round (peak autumn)" }, habitat: { ja: "河口、港湾、サーフ、運河", en: "Estuaries, harbors, surf, canals" }, bestTime: { ja: "夜間・満潮前後", en: "Night & around high tide" }, description: { ja: "都市型ルアーフィッシングの代表種。東京湾や大阪湾でも狙えるターゲット。橋脚周りが特に熱い。", en: "Urban lure fishing icon. Targetable in Tokyo/Osaka Bay. Bridge pillars at night are key." }, gear: { rod: { ja: "シーバスロッド 9〜10フィート M〜MH", en: "9–10ft M–MH seabass rod" }, reel: { ja: "3000〜4000番スピニング", en: "3000–4000 spinning reel" }, line: { ja: "PE 0.8〜1.5号 + フロロリーダー 16〜20lb", en: "PE 0.8–1.5 + 16–20lb fluoro leader" }, hooks: { ja: "トレブルフック #4〜8", en: "Treble #4–8" }, lures: ["シンキングペンシル", "バイブレーション", "ミノー", "ポッパー", "ワームリグ"], tips: { ja: "橋脚の明暗部が超一級ポイント。ベイトの動きを観察すること。", en: "Light/shadow edges at bridge pillars are prime. Watch for diving birds over bait." } }, spots: [{ name: "東京湾・運河エリア", rating: 4.8, type: { ja: "河口・港湾", en: "Harbor" } }, { name: "大阪湾・尼崎運河", rating: 4.7, type: { ja: "港湾", en: "Harbor" } }, { name: "多摩川河口（神奈川）", rating: 4.9, type: { ja: "河口", en: "Estuary" } }] },
  { id: 5, name: "イワナ", nameEn: "White-Spotted Char", emoji: "🐠", color: "#1e3a5f", accent: "#90c5f0", difficulty: "advanced", flyFriendly: true, flyNote: { ja: "フライ・テンカラで最高の相性。毛鉤への反応が非常に良い。テンカラ発祥の魚とも言われる。", en: "The ultimate fly and tenkara fish. Reacts aggressively to flies. Tenkara's ancestral quarry." }, season: { ja: "3月〜9月（源流域）", en: "March–September (headwaters)" }, habitat: { ja: "源流域・清冽な山岳渓流", en: "Crystal-clear headwaters and alpine streams" }, bestTime: { ja: "早朝・夕方（水温低い時）", en: "Early morning & evening (cool water)" }, description: { ja: "源流に棲む最も原始的な渓流魚。人を恐れず、フライへの反応が抜群。", en: "The primitive fish of Japan's headwaters. Fearless and explosively responsive to flies." }, gear: { rod: { ja: "テンカラ竿 3.3〜3.6m または渓流ロッド 4〜5フィート", en: "3.3–3.6m tenkara rod or 4–5ft stream rod" }, reel: { ja: "テンカラはリールなし / 1000番スピニング", en: "None for tenkara / 1000 spinning" }, line: { ja: "テンカラライン 3〜3.5m / ナイロン 2〜3lb", en: "Tenkara line 3–3.5m / 2–3lb nylon" }, hooks: { ja: "#10〜14 バーブレス", en: "#10–14 barbless" }, lures: ["逆さ毛鉤（テンカラ）", "パラシュートアダムス", "エルクヘアカディス", "ぶどう虫", "川虫"], tips: { ja: "源流域では魚のプレッシャーが低く、大きめのフライでも反応する。歩き込んで誰も行かない場所を狙え。", en: "Headwaters have low pressure — larger flies often work. Hike to where others don't go." } }, spots: [{ name: "早川（山梨・南アルプス）", rating: 5.0, type: { ja: "源流", en: "Headwater" } }, { name: "只見川源流（福島）", rating: 4.9, type: { ja: "源流", en: "Headwater" } }, { name: "黒部川（富山）", rating: 4.8, type: { ja: "源流", en: "Headwater" } }] },
  { id: 6, name: "マダイ", nameEn: "Red Sea Bream", emoji: "🐟", color: "#8b1a1a", accent: "#ff8c94", difficulty: "intermediate", flyFriendly: false, season: { ja: "春・秋", en: "Spring & Autumn" }, habitat: { ja: "沿岸〜沖合の岩礁域", en: "Coastal rocky reefs, 20–100m" }, bestTime: { ja: "早朝・潮の変わり目", en: "Early morning & tidal changes" }, description: { ja: "日本の「魚の王様」。タイラバ（鯛ラバ）での釣りが近年大人気。", en: "Japan's 'King of Fish'. Tai-rubber jigging is hugely popular." }, gear: { rod: { ja: "タイラバロッド 6〜7フィート", en: "6–7ft taira rod" }, reel: { ja: "2500〜3000番スピニング", en: "2500–3000 spinning reel" }, line: { ja: "PE 0.6〜1.0号 + フロロリーダー 12〜16lb", en: "PE 0.6–1.0 + 12–16lb fluoro leader" }, hooks: { ja: "タイラバ用フック #8〜10", en: "Taira hook #8–10" }, lures: ["鯛ラバ 60〜120g（オレンジ/赤）", "ひとつテンヤ", "インチク", "タコベイト"], tips: { ja: "タイラバは一定速度の巻きが基本。当たりがあってもアワせず巻き続けること。", en: "Constant retrieve with taira. Don't set the hook on the first bite — keep reeling." } }, spots: [{ name: "明石海峡（兵庫）", rating: 5.0, type: { ja: "海", en: "Sea" } }, { name: "三河湾（愛知）", rating: 4.8, type: { ja: "湾", en: "Bay" } }, { name: "若狭湾（福井）", rating: 4.7, type: { ja: "湾", en: "Bay" } }] },
  { id: 7, name: "アジ", nameEn: "Horse Mackerel", emoji: "🐟", color: "#4a6741", accent: "#a8d5a2", difficulty: "beginner", flyFriendly: false, season: { ja: "通年（夏〜秋が数釣り期）", en: "Year-round (peak summer–fall)" }, habitat: { ja: "沿岸・港湾・防波堤", en: "Coastal waters, harbors, breakwaters" }, bestTime: { ja: "夕方〜夜間・朝マズメ", en: "Evening to night & dawn" }, description: { ja: "アジングで大人気のライトゲームターゲット。数釣りが楽しく初心者にもおすすめ。", en: "Star of ajing light-game fishing. Great for beginners with high catch numbers." }, gear: { rod: { ja: "アジングロッド 6〜7フィート UL", en: "6–7ft UL ajing rod" }, reel: { ja: "1000〜2000番スピニング", en: "1000–2000 spinning reel" }, line: { ja: "PE 0.1〜0.3号 + フロロリーダー 2〜4lb", en: "PE 0.1–0.3 + 2–4lb fluoro leader" }, hooks: { ja: "ジグヘッド 0.3〜2g", en: "Jig head 0.3–2g" }, lures: ["1〜2インチワーム", "サビキ仕掛け", "小型メタルジグ"], tips: { ja: "港の常夜灯周りは鉄板。サビキ釣りなら初心者でも数釣りが楽しめる。", en: "Harbor lights are reliable. Sabiki rigs let beginners catch lots." } }, spots: [{ name: "真鶴港（神奈川）", rating: 4.6, type: { ja: "港", en: "Harbor" } }, { name: "和歌山・雑賀崎", rating: 4.7, type: { ja: "磯", en: "Rocky Shore" } }, { name: "長崎・野母崎", rating: 4.9, type: { ja: "磯", en: "Rocky Shore" } }] },
  { id: 8, name: "ヒラメ", nameEn: "Olive Flounder", emoji: "🦈", color: "#5c4033", accent: "#d4a574", difficulty: "advanced", flyFriendly: false, season: { ja: "秋〜冬（10〜1月）", en: "Autumn–Winter (Oct–Jan)" }, habitat: { ja: "砂浜・サーフ・砂底の浅場", en: "Sandy beaches, surf, sandy flats" }, bestTime: { ja: "朝・夕マズメ・荒れた後", en: "Dawn & dusk, after rough weather" }, description: { ja: "サーフフィッシングの王様。大型は「座布団」と呼ばれ、ルアーマンの憧れ。", en: "King of surf fishing. Huge ones called 'zabuton' are the dream catch." }, gear: { rod: { ja: "サーフロッド 10〜12フィート MH〜H", en: "10–12ft MH–H surf rod" }, reel: { ja: "4000〜5000番スピニング", en: "4000–5000 spinning reel" }, line: { ja: "PE 1.0〜1.5号 + フロロリーダー 20〜25lb", en: "PE 1.0–1.5 + 20–25lb fluoro leader" }, hooks: { ja: "トレブルフック #4〜6", en: "Treble #4–6" }, lures: ["メタルジグ 28〜42g", "ヘビーシンキングミノー", "バイブレーション", "ワームリグ"], tips: { ja: "離岸流を狙う。底をしっかり取り、スローリトリーブが基本。", en: "Target rip currents. Get to the bottom and use a slow retrieve." } }, spots: [{ name: "九十九里浜（千葉）", rating: 4.8, type: { ja: "サーフ", en: "Surf" } }, { name: "鹿島灘（茨城）", rating: 4.9, type: { ja: "サーフ", en: "Surf" } }, { name: "遠州灘（静岡）", rating: 4.7, type: { ja: "サーフ", en: "Surf" } }] },
  { id: 9, name: "ヘラブナ", nameEn: "Crucian Carp (Herabuna)", emoji: "🐟", color: "#7a5010", accent: "#e8c040", difficulty: "intermediate", flyFriendly: false, season: { ja: "通年（春・秋が最盛期）", en: "Year-round (peak spring & autumn)" }, habitat: { ja: "ため池、湖、流れのゆるい川", en: "Reservoirs, lakes, slow rivers" }, bestTime: { ja: "早朝〜午前中", en: "Early morning to noon" }, description: { ja: "日本のへら釣りは独自の文化。竿・仕掛け・エサ・釣り方すべてに奥深い哲学がある。釣り人口数百万人の国民的釣り。", en: "Herabuna fishing is a deeply philosophical Japanese discipline with its own culture — rods, rigs, bait and technique all carefully considered." }, gear: { rod: { ja: "へら竿 7〜18尺（専用和竿）", en: "7–18 shaku traditional Japanese rod" }, reel: { ja: "リールなし（固定仕掛け）", en: "None (fixed-line)" }, line: { ja: "道糸 0.5〜1.0号 / ハリス 0.2〜0.5号", en: "Main 0.5–1.0 / Tippet 0.2–0.5" }, hooks: { ja: "へらフック #3〜7", en: "Hera hook #3–7" }, lures: ["グルテンエサ", "バラケエサ", "クワセエサ", "ペレット"], tips: { ja: "ウキ（浮き）の微妙な動きを読むことが全て。波紋のない静かなポイントを選ぶこと。", en: "Everything depends on reading the float. Choose calm, ripple-free spots and watch the bobber intently." } }, spots: [{ name: "亀山湖（千葉）", rating: 4.8, type: { ja: "ダム湖", en: "Reservoir" } }, { name: "相模湖（神奈川）", rating: 4.7, type: { ja: "湖", en: "Lake" } }, { name: "印旛沼（千葉）", rating: 4.6, type: { ja: "沼", en: "Lake" } }] },
  { id: 10, name: "コイ", nameEn: "Common Carp (Koi)", emoji: "🐟", color: "#9a5008", accent: "#f0c040", difficulty: "beginner", flyFriendly: false, season: { ja: "通年（春が産卵期で大型狙い）", en: "Year-round (spring spawn peak)" }, habitat: { ja: "河川・湖・用水路", en: "Rivers, lakes, irrigation canals" }, bestTime: { ja: "早朝・夕方", en: "Early morning & evening" }, description: { ja: "日本最大の淡水魚のひとつ。引きが強烈で、大型は10kgを超える。欧米でも人気のカープフィッシング。", en: "One of Japan's largest freshwater fish, topping 10kg. Carp fishing is a growing sport globally." }, gear: { rod: { ja: "カープロッド 12〜13フィート またはへら竿 18〜21尺", en: "12–13ft carp rod or 18–21 shaku hera rod" }, reel: { ja: "3000〜5000番スピニング", en: "3000–5000 spinning reel" }, line: { ja: "ナイロン 6〜12lb またはPE 1.0〜2.0号", en: "6–12lb nylon or PE 1.0–2.0" }, hooks: { ja: "#2〜6 カープフック / 伊勢尼", en: "#2–6 carp hook" }, lures: ["ボイリー（コーン・スパイス）", "さつまいも", "グルテン", "コーン"], tips: { ja: "ヘアリグで底を這わせるのが基本。大型は夜明けの浅場に入ってくる。", en: "Use a hair rig on the bottom. Big carp move into shallows at first light." } }, spots: [{ name: "霞ヶ浦（茨城）", rating: 4.8, type: { ja: "湖", en: "Lake" } }, { name: "利根川（千葉/茨城）", rating: 4.7, type: { ja: "河川", en: "River" } }, { name: "河口湖（山梨）", rating: 4.6, type: { ja: "湖", en: "Lake" } }] },
  { id: 11, name: "ニジマス", nameEn: "Rainbow Trout", emoji: "🐠", color: "#2d6a4f", accent: "#c0d870", difficulty: "beginner", flyFriendly: true, flyNote: { ja: "フライフィッシング入門に最適。ドライ・ニンフ両方に反応。管理釣り場で年中楽しめる。", en: "Perfect for fly fishing beginners. Responds to both dry flies and nymphs. Available year-round at managed fisheries." }, season: { ja: "通年（管理釣り場）/ 3〜9月（渓流）", en: "Year-round (managed) / March–Sep (streams)" }, habitat: { ja: "管理釣り場・冷水渓流・高原湖", en: "Managed fisheries, cold streams, alpine lakes" }, bestTime: { ja: "早朝・夕方・曇りの日", en: "Morning, evening & overcast days" }, description: { ja: "北米原産で日本全国の管理釣り場に放流されている。フライフィッシングの練習に最適で、ドライフライへの反応が良い。", en: "Native to North America but stocked throughout Japan. Ideal for fly fishing practice with excellent response to dry flies." }, gear: { rod: { ja: "フライロッド 4〜5番 8〜9フィート または渓流ロッド 5〜6フィート", en: "4-5wt 8–9ft fly rod or 5–6ft trout rod" }, reel: { ja: "フライリール 4〜5番 / 1000番スピニング", en: "4-5wt fly reel / 1000 spinning" }, line: { ja: "DT/WF フローティングライン 4〜5番", en: "DT/WF floating line 4–5wt" }, hooks: { ja: "#10〜16 バーブレス", en: "#10–16 barbless" }, lures: ["パラシュートアダムス", "CDCダン", "PTニンフ", "パワーベイト（管釣り）"], tips: { ja: "管理釣り場では赤・ピンク系のエッグフライが抜群。渓流では水面のライズを観察してマッチザハッチ。", en: "Egg flies in red/pink dominate at managed fisheries. In streams, observe rises and match the hatch." } }, spots: [{ name: "日光・中禅寺湖（栃木）", rating: 4.9, type: { ja: "湖", en: "Lake" } }, { name: "忍野八海（山梨）", rating: 4.8, type: { ja: "管理釣り場", en: "Managed Fishery" } }, { name: "芦ノ湖（神奈川）", rating: 4.7, type: { ja: "湖", en: "Lake" } }] },
  { id: 12, name: "イカ（アオリイカ）", nameEn: "Squid / Bigfin Reef Squid (Aoriika)", emoji: "🦑", color: "#3a2860", accent: "#c0a0e0", difficulty: "intermediate", flyFriendly: false, season: { ja: "春（産卵期）・秋（数釣り期）", en: "Spring (spawning) & Autumn (numbers)" }, habitat: { ja: "沿岸の藻場・岩礁・港湾", en: "Coastal seagrass beds, rocky reefs, harbors" }, bestTime: { ja: "夕暮れ〜夜間・常夜灯周り", en: "Dusk to night, around harbor lights" }, description: { ja: "エギングで狙うアオリイカは日本で大人気。釣れた瞬間の激しいジェット噴射とゲーム性が魅力。刺身・天ぷらが絶品。", en: "Bigfin reef squid are Japan's eging craze. The explosive jet sprint when hooked is addictive. Superb as sashimi or tempura." }, gear: { rod: { ja: "エギングロッド 8〜8'6\" ML〜M", en: "8–8.5ft ML–M eging rod" }, reel: { ja: "2500〜3000番スピニング", en: "2500–3000 spinning reel" }, line: { ja: "PE 0.6〜0.8号 + フロロリーダー 2〜2.5号", en: "PE 0.6–0.8 + 2–2.5 fluoro leader" }, hooks: { ja: "エギ 2.5〜3.5号（季節で変える）", en: "Egi squid jig 2.5–3.5 (vary by season)" }, lures: ["エギ 3.0号（オレンジ/ピンク）", "エギ 2.5号（夜光）", "エギ 3.5号（秋の大型狙い）"], tips: { ja: "シャクり（ジャーク）→フォールの繰り返しが基本。フォール中のラインの動きでバイトを察知する。", en: "Jerk-and-fall is the foundation of eging. Watch the line during the fall — bites happen on the drop." } }, spots: [{ name: "佐賀・唐津沖", rating: 5.0, type: { ja: "沿岸", en: "Coast" } }, { name: "三重・英虞湾", rating: 4.8, type: { ja: "湾", en: "Bay" } }, { name: "高知・室戸岬", rating: 4.9, type: { ja: "磯", en: "Rocky Shore" } }] },
  { id: 13, name: "ブリ（ハマチ）", nameEn: "Yellowtail / Amberjack (Buri)", emoji: "🦈", color: "#284868", accent: "#f8c800", difficulty: "intermediate", flyFriendly: false, season: { ja: "秋〜冬（ブリ）/ 夏〜秋（ハマチ）", en: "Autumn–Winter (Buri) / Summer–Autumn (Hamachi)" }, habitat: { ja: "沖合・外洋・ナブラ（鳥山）", en: "Offshore, open sea, baitfish schools" }, bestTime: { ja: "朝マズメ・鳥山が立った時", en: "Dawn & when birds dive over baitfish" }, description: { ja: "出世魚として知られる高級魚。小型はモジャコ→ツバス→ハマチ→メジロ→ブリと成長する。大型ルアーへの豪快なバイトが病みつきになる。", en: "A prized fish with multiple name changes as it grows. The violent topwater strikes and screaming drag runs are unforgettable." }, gear: { rod: { ja: "ショアジギングロッド 9〜11フィート MH〜H", en: "9–11ft MH–H shore jigging rod" }, reel: { ja: "4000〜6000番スピニング", en: "4000–6000 spinning reel" }, line: { ja: "PE 1.5〜3.0号 + フロロリーダー 30〜40lb", en: "PE 1.5–3.0 + 30–40lb fluoro leader" }, hooks: { ja: "アシストフック #1〜3/0", en: "Assist hook #1–3/0" }, lures: ["メタルジグ 40〜100g（ブルー/ゴールド）", "ポッパー（トップウォーター）", "バイブレーション", "ミノー180mm以上"], tips: { ja: "鳥山（カモメが群れてダイブしている場所）に向かって全力でキャスト。その場所にベイトと青物がいる。", en: "Cast full-distance to where birds are diving — that's where the baitfish and yellowtail are. Speed retrieve!" } }, spots: [{ name: "富山湾（富山）", rating: 5.0, type: { ja: "湾", en: "Bay" } }, { name: "鳥取・境港沖", rating: 4.8, type: { ja: "沖合", en: "Offshore" } }, { name: "長崎・壱岐沖", rating: 4.9, type: { ja: "沖合", en: "Offshore" } }] },
  { id: 14, name: "クロダイ", nameEn: "Black Bream / Kurodai", emoji: "🐟", color: "#3a3a3a", accent: "#a0a0a0", difficulty: "advanced", flyFriendly: false, season: { ja: "通年（春の乗っ込み期が最盛期）", en: "Year-round (spring spawning run peak)" }, habitat: { ja: "磯・防波堤・河口域・湾内", en: "Rocky shores, breakwaters, estuaries, harbors" }, bestTime: { ja: "早朝・夕方・潮の動く時間", en: "Early morning, evening & tidal movement" }, description: { ja: "ウキフカセ釣りの代表的ターゲット。タナ（棚）とコマセ（撒き餌）のコントロールが釣果を分ける、テクニカルな釣り。", en: "The quintessential float fishing target. Mastering berley (burley/chum) and float depth makes the difference." }, gear: { rod: { ja: "磯竿 1〜1.5号 5〜5.3m", en: "1.0–1.5 class 5–5.3m ISO rod" }, reel: { ja: "レバーブレーキ付きスピニング 2500〜3000番", en: "2500–3000 lever-brake spinning reel" }, line: { ja: "ナイロン 1.5〜2.5号", en: "1.5–2.5 nylon" }, hooks: { ja: "#3〜6 チヌ針", en: "#3–6 chinu hook" }, lures: ["オキアミ（コマセ・ツケエサ）", "コーン", "ダンゴ餌", "練りエサ"], tips: { ja: "コマセを定期的に打ち、魚を一か所に集める。ツケエサとコマセが同調することが最重要。", en: "Berley regularly to concentrate fish. The key is timing your hook bait to fall through the berley cloud." } }, spots: [{ name: "神奈川・三浦半島磯", rating: 4.8, type: { ja: "磯", en: "Rocky Shore" } }, { name: "和歌山・白浜磯", rating: 4.9, type: { ja: "磯", en: "Rocky Shore" } }, { name: "長崎・五島列島", rating: 5.0, type: { ja: "離島磯", en: "Island Shore" } }] },
  { id: 15, name: "ハマチ（ショア）", nameEn: "Young Yellowtail (Shore)", emoji: "🦈", color: "#203848", accent: "#ffd020", difficulty: "intermediate", flyFriendly: false, season: { ja: "夏〜秋（7〜11月）", en: "Summer–Autumn (July–November)" }, habitat: { ja: "地磯・サーフ・港湾の外側", en: "Shore reefs, surf, outer harbor walls" }, bestTime: { ja: "朝マズメ・夕マズメ", en: "Dawn & dusk feeding windows" }, description: { ja: "ショアジギング最人気ターゲット。岸から大型青物を狙う爽快感はたまらない。遠投メタルジグを100gクラスで全力でシャクる。", en: "Shore jigging's most exciting target. Hurling heavy jigs from the rocks at charging pelagics is Japan's fastest-growing shore style." }, gear: { rod: { ja: "ショアジギングロッド 10〜11フィート H〜XH", en: "10–11ft H–XH shore jigging rod" }, reel: { ja: "5000〜6000番スピニング", en: "5000–6000 spinning reel" }, line: { ja: "PE 2.0〜3.0号 + フロロリーダー 35〜50lb", en: "PE 2.0–3.0 + 35–50lb fluoro leader" }, hooks: { ja: "アシストフック #2/0〜4/0", en: "Assist hook #2/0–4/0" }, lures: ["メタルジグ 60〜100g（ブルピン/シルバー）", "ポッパー 100mm以上", "ペンシルベイト（水面の炸裂を楽しむ）"], tips: { ja: "早朝の第一投が黄金。太陽が高くなる前の30分が最も熱い。全力遠投してスピードジャーキング。", en: "The first cast at dawn is golden. The 30-minute window before the sun rises is peak. Cast far, retrieve fast." } }, spots: [{ name: "大分・蒲江地磯", rating: 5.0, type: { ja: "地磯", en: "Shore Reef" } }, { name: "高知・足摺岬", rating: 4.9, type: { ja: "地磯", en: "Shore Reef" } }, { name: "静岡・御前崎", rating: 4.7, type: { ja: "地磯", en: "Shore Reef" } }] },
  { id: 16, name: "メバル", nameEn: "Rockfish (Mebaru)", emoji: "🐟", color: "#5a3818", accent: "#e0b060", difficulty: "beginner", flyFriendly: false, season: { ja: "通年（冬〜春が最盛期）", en: "Year-round (peak winter–spring)" }, habitat: { ja: "磯・防波堤・港湾の岩礁周り", en: "Rocky shores, breakwaters, harbor reefs" }, bestTime: { ja: "夜間〜早朝・常夜灯周り", en: "Night to early morning, harbor lights" }, description: { ja: "メバリングで大人気のライトゲームターゲット。繊細なアタリと軽量タックルの組み合わせが醍醐味。夜の常夜灯周りに多く集まる。", en: "The star of mebaring light-game fishing. Ultra-sensitive bites on ultra-light tackle make it addictive. Gathers under harbor lights at night." }, gear: { rod: { ja: "メバリングロッド 6〜7フィート L〜UL", en: "6–7ft L–UL mebaring rod" }, reel: { ja: "1000〜2000番スピニング", en: "1000–2000 spinning reel" }, line: { ja: "PE 0.2〜0.4号 + フロロリーダー 3〜5lb", en: "PE 0.2–0.4 + 3–5lb fluoro leader" }, hooks: { ja: "ジグヘッド 0.5〜1.5g #8〜10", en: "Jig head 0.5–1.5g #8–10" }, lures: ["1.5〜2インチワーム（クリアカラー）", "プラグ", "スプーン", "フローティングミノー"], tips: { ja: "夜の常夜灯周りは超一級ポイント。ゆっくりとしたデッドスローリトリーブが基本。ラインの動きでアタリを取る。", en: "Night lights in harbors are prime. Ultra-slow retrieve is key. Watch the line for the subtlest bites." } }, spots: [{ name: "横浜港・山下ふ頭", rating: 4.5, type: { ja: "港湾", en: "Harbor" } }, { name: "神戸港・ポートアイランド", rating: 4.6, type: { ja: "港湾", en: "Harbor" } }, { name: "松山港（愛媛）", rating: 4.7, type: { ja: "港湾", en: "Harbor" } }] },
  // ── CARIBBEAN / PUERTO RICO ─────────────────────────────────────────────────
  { id: 17, name: "タリポン", nameEn: "Tarpon", spriteId: "tarpon", emoji: "🐟", category: "saltwater", difficulty: "advanced",
    desc: { ja: "カリブ海の王者。100lb超の個体も珍しくない。ジャンプが凄まじく釣り人を魅了する。", en: "King of the Caribbean. Fish over 100lb are common. Aerial acrobatics are legendary." },
    season: { ja: "通年（夏最高）", en: "Year-round (summer peak)" }, color: "#c8e6f0", accent: "#1565a0",
    gear: { rods: { ja: "ヘビーロッド 8' H、またはフライロッド12番", en: "Heavy 8' rod or 12-weight fly rod" }, line: { ja: "PE3〜5号、リーダー100lb", en: "30-50lb braid, 100lb leader" }, lures: ["Bubble Walker", "Mullet plug", "Crab fly", "Deceiver"], technique: { ja: "夜の常夜灯周りでポッパー。朝夕のフラットでフライ。", en: "Poppers around night lights. Fly on flats at dawn and dusk." } },
    spots: [{ name: "Laguna Tortuguero", rating: 4.9 }, { name: "Boca de Cangrejos", rating: 4.7 }, { name: "Vieques - Mosquito Pier", rating: 4.9 }],
    regulations: { ja: "キャッチ＆リリース推奨。遊漁ライセンス不要（海釣り）", en: "C&R recommended. No license required for saltwater fishing in PR." } },

  { id: 18, name: "スノック", nameEn: "Snook", spriteId: "snook", emoji: "🐟", category: "saltwater", difficulty: "intermediate",
    desc: { ja: "マングローブの王様。鋭いエラ蓋で仕掛けを切る。繊細なアプローチが必要。", en: "King of the mangroves. Sharp gill plate cuts lines. Requires finesse." },
    season: { ja: "通年（秋春最高）", en: "Year-round (fall/spring best)" }, color: "#d4e8d0", accent: "#2d6a1f",
    gear: { rods: { ja: "ライトロッド 7' M", en: "7' medium spinning or 8-weight fly rod" }, line: { ja: "PE1.5〜2号、リーダー40lb", en: "15-20lb braid, 40lb fluorocarbon leader" }, lures: ["Live mullet", "DOA shrimp", "Clouser Minnow", "Topwater plug"], technique: { ja: "マングローブの根際をタイトに狙う。朝夕のトップウォーターが最高。", en: "Cast tight to mangrove roots. Topwater at dawn and dusk is explosive." } },
    spots: [{ name: "Laguna Tortuguero", rating: 4.9 }, { name: "Humacao Nature Reserve", rating: 4.6 }],
    regulations: { ja: "最小サイズ: 28インチ。禁漁期: 12〜2月", en: "Minimum 28 inches. Closed Dec–Feb (spawning)." } },

  { id: 19, name: "ボーンフィッシュ", nameEn: "Bonefish", spriteId: "bonefish", emoji: "🐟", category: "saltwater", difficulty: "advanced",
    desc: { ja: "フラットフィッシングの究極ターゲット。透明な浅瀬で銀色に輝く魚体を発見してキャストする。", en: "The ultimate flats target. Spotting silver shapes in crystal shallows and making the perfect cast." },
    season: { ja: "11〜5月", en: "Nov–May" }, color: "#e8f4f0", accent: "#0d7377",
    gear: { rods: { ja: "フライロッド8〜9番", en: "8-9 weight fly rod" }, line: { ja: "ボーンフィッシュテーパー、ティペット16lb", en: "Bonefish taper fly line, 16lb tippet" }, lures: ["Crazy Charlie", "Gotcha", "Crab pattern", "Shrimp fly"], technique: { ja: "干潮時に干潟をウェーディングしてサイトフィッシング。", en: "Wade the flats at low tide and sight fish. Stealth is everything." } },
    spots: [{ name: "Vieques - Red Beach Flats", rating: 5.0 }, { name: "Culebra - Flamenco Beach Flats", rating: 4.9 }],
    regulations: { ja: "キャッチ＆リリース推奨", en: "C&R strongly recommended." } },

  { id: 20, name: "パーミット", nameEn: "Permit", spriteId: "permit", emoji: "🐟", category: "saltwater", difficulty: "advanced",
    desc: { ja: "フラットフィッシングで最も難しいターゲット。1匹釣れれば一生の思い出。", en: "The most difficult flats fish. Landing one on fly is a lifetime achievement." },
    season: { ja: "春〜初夏", en: "Spring–early summer" }, color: "#f0f4e8", accent: "#5a7a20",
    gear: { rods: { ja: "フライロッド9〜10番", en: "9-10 weight fly rod" }, line: { ja: "ボーンフィッシュラインと同様", en: "Similar to bonefish setup" }, lures: ["Merkin crab", "EP Crab", "Del's Merkin", "Live crab"], technique: { ja: "カニフライをパーミットの鼻先にプレゼンテーション。絶対に急がない。", en: "Present a crab fly to the permit's nose. Never rush the presentation." } },
    spots: [{ name: "Vieques - Blue Beach", rating: 4.9 }, { name: "Culebra - Flamenco Beach Flats", rating: 4.9 }],
    regulations: { ja: "キャッチ＆リリース強く推奨", en: "C&R strongly recommended." } },

  { id: 21, name: "マヒマヒ", nameEn: "Mahi-Mahi (Dorado)", spriteId: "mahi_mahi", emoji: "🐠", category: "offshore", difficulty: "beginner",
    desc: { ja: "最もカラフルな海の魚。青・緑・金の輝きが美しく食味も最高。", en: "Most colorful fish in the sea. Spectacular colors and exceptional table fare." },
    season: { ja: "3〜8月", en: "Mar–Aug" }, color: "#e8f8e0", accent: "#2d8a2d",
    gear: { rods: { ja: "ライトロッド、PE2〜3号", en: "Light to medium rod, 20-30lb braid" }, line: { ja: "PE2〜3号、リーダー40lb", en: "20-30lb braid, 40lb leader" }, lures: ["Ballyhoo", "Feather jig", "Mahi fly", "Popper"], technique: { ja: "流木・藻の周りに集まる。チャムで引き寄せてからルアー。", en: "Gather around floating debris. Chum them up then switch to lures." } },
    spots: [{ name: "La Parguera", rating: 5.0 }, { name: "Vieques - Offshore", rating: 5.0 }],
    regulations: { ja: "サイズ・数量制限なし（プエルトリコ）", en: "No size or bag limit in PR." } },

  { id: 22, name: "ワフー", nameEn: "Wahoo (Ono)", spriteId: "wahoo", emoji: "🐟", category: "offshore", difficulty: "intermediate",
    desc: { ja: "海で最も速い魚の一つ。60mph以上で泳ぐ。引きが強烈で食味は最高級。", en: "One of the fastest fish in the ocean at 60mph+. Intense fight and premium eating." },
    season: { ja: "通年（秋冬最高）", en: "Year-round (fall/winter best)" }, color: "#e8f0f8", accent: "#1a5a8a",
    gear: { rods: { ja: "ヘビーロッド、PE4〜6号", en: "Heavy rod, 40-60lb braid" }, line: { ja: "PE4〜6号、ワイヤーリーダー必須", en: "40-60lb braid, wire leader essential" }, lures: ["High-speed lure", "Rapala X-Rap", "Drone spoon"], technique: { ja: "高速トローリング（12〜15ノット）が最も効果的。", en: "High-speed trolling at 12-15 knots is most effective." } },
    spots: [{ name: "Vieques - Offshore", rating: 5.0 }, { name: "La Parguera", rating: 5.0 }],
    regulations: { ja: "サイズ・数量制限なし（プエルトリコ）", en: "No size or bag limit in PR." } },

  { id: 23, name: "バラクーダ", nameEn: "Barracuda", spriteId: "barracuda", emoji: "🦈", category: "saltwater", difficulty: "beginner",
    desc: { ja: "鋭い歯を持つスピードスター。シルバーのルアーに猛突進する。", en: "Speed demon with razor teeth. Will charge at silver lures with explosive strikes." },
    season: { ja: "通年", en: "Year-round" }, color: "#f0f0f8", accent: "#445580",
    gear: { rods: { ja: "ミディアムロッド、PE2〜3号", en: "Medium rod, 20-30lb braid" }, line: { ja: "PE2〜3号、ワイヤーリーダー推奨", en: "20-30lb braid, wire leader recommended" }, lures: ["Silver spoon", "Tube lure", "Needlefish lure", "Rapala"], technique: { ja: "リーフや岩礁際を高速リトリーブ。シルバーカラーに強い反応。", en: "Fast retrieve along reefs. Silver colors get the strongest reactions." } },
    spots: [{ name: "Culebra Island", rating: 5.0 }, { name: "Vieques - North Shore Reef", rating: 4.8 }],
    regulations: { ja: "大型個体の食用は避けること（シガテラ毒）", en: "Avoid eating large barracuda due to ciguatera risk." } },

  { id: 24, name: "レッドスナッパー", nameEn: "Red Snapper", spriteId: "red_snapper", emoji: "🐠", category: "reef", difficulty: "beginner",
    desc: { ja: "カリブ海で最も人気の食用魚。赤い体が美しくリーフ釣りの定番ターゲット。", en: "One of the Caribbean's most prized food fish. Classic reef bottom fishing target." },
    season: { ja: "通年", en: "Year-round" }, color: "#fce8e8", accent: "#c0302a",
    gear: { rods: { ja: "ミディアムヘビーロッド、PE3〜4号", en: "Medium-heavy rod, 30-40lb braid" }, line: { ja: "PE3〜4号、リーダー40〜60lb", en: "30-40lb braid, 40-60lb leader" }, lures: ["Squid", "Live bait", "Jig 60-100g", "Cut fish"], technique: { ja: "リーフの根際でボトムフィッシング。生餌か冷凍イカが有効。", en: "Bottom fishing along reef structures. Live or frozen squid is most effective." } },
    spots: [{ name: "Vieques - North Shore Reef", rating: 4.8 }, { name: "Culebra Island", rating: 5.0 }],
    regulations: { ja: "最小サイズ: 10インチ。DNER規制を確認", en: "Minimum 10 inches. Check current DNER regulations." } },

];

// ─── SEASONAL INTELLIGENCE ───────────────────────────────────────────────────
// Current month index (0=Jan … 11=Dec). In production, derive from new Date().
const CURRENT_MONTH = new Date().getMonth(); // live

const SEASONAL_TIPS = {
  // fishId -> array of monthly tip objects
  1: [ // ブラックバス Largemouth Bass
    { months: [0,1],    phase: "winter",    badge: { ja: "冬眠明け準備", en: "Pre-wake" },    urgency: "low",
      tip: { ja: "水温5℃以下。バスは深場でほぼ動かない。岩盤沿いのスーパースローが唯一の手。", en: "Water below 5℃. Bass nearly dormant in deep rock. Ultra-slow presentation along deep structure only." },
      hotLures: { ja: ["シャッドラップ（デッドスロー）", "メタルバイブ（ボトムバンプ）"], en: ["Shad rap dead-slow", "Metal vibe bottom-bounce"] } },
    { months: [2,3],    phase: "prespawn", badge: { ja: "🔥 プリスポーン！", en: "🔥 Pre-spawn!" }, urgency: "high",
      tip: { ja: "水温10〜15℃。産卵前の荒食い開始。シャローフラットに差してくる大型を狙え。スピナーベイト＆クランクが最高。", en: "10–15℃. Big females moving shallow to feed aggressively before spawn. Spinnerbaits and crankbaits excel on flats." },
      hotLures: { ja: ["スピナーベイト（チャート）", "ミッドクランク", "ジャークベイト"], en: ["Chartreuse spinnerbait", "Mid-range crankbait", "Jerkbait"] } },
    { months: [4,5],    phase: "frog",     badge: { ja: "🐸 フロッグシーズン全開！", en: "🐸 Frog Season ON!" }, urgency: "peak",
      tip: { ja: "カエルが産卵のため水辺に集まる最高の季節！バスはカバー下で待ち伏せ中。ホロウボディフロッグをスイレンや葦の上でドッグウォーク。朝夕の30分が爆発タイム。", en: "Frogs moving to water to spawn — bass know it and are ambushing from cover. Walk a hollow-body frog over lily pads and reeds. The first and last 30 minutes of the day go off." },
      hotLures: { ja: ["ホロウボディフロッグ（黒・緑）", "フロッグ系ソフトプラスチック", "バズベイト", "チャンクフロッグ"], en: ["Hollow-body frog (black/green)", "Frog soft plastic", "Buzzbaiter", "Chunk frog"] } },
    { months: [6,7,8],  phase: "summer",   badge: { ja: "🌞 夏の夜釣り", en: "🌞 Summer nights" }, urgency: "medium",
      tip: { ja: "日中は深場へ落ちるが、夜明け・日没にシャローへ。トップウォーターの炸裂バイトが最高。夏のカエルパターンも継続有効。", en: "Pushes deep midday but surges shallow at dawn and dusk. Topwater explosions at low light. Frog pattern remains very effective through summer." },
      hotLures: { ja: ["ポッパー", "フロッグ（継続）", "ビッグベイト（夜間）", "ディープクランク（日中）"], en: ["Popper", "Frog (still on)", "Big swimbait (night)", "Deep crank (midday)"] } },
    { months: [9,10],   phase: "postfall", badge: { ja: "🍂 秋の荒食い！", en: "🍂 Fall Feeding!" }, urgency: "high",
      tip: { ja: "水温低下でベイトフィッシュを追って活発化。スクール（群れ）を見つけたら連発可能。チャター＆スイムジグが猛威を振るう。", en: "Cooling water triggers aggressive baitfish pursuit. Find a school and you can catch them consecutively. Chatterbaits and swim jigs dominate." },
      hotLures: { ja: ["チャターベイト", "スイムジグ", "スピナーベイト", "トップウォーター（朝）"], en: ["Chatterbait", "Swim jig", "Spinnerbait", "Topwater (morning)"] } },
    { months: [11],     phase: "winter",   badge: { ja: "冬支度", en: "Going deep" }, urgency: "low",
      tip: { ja: "水温が急低下。バスは深場の岩盤や地形変化に集まる。ダウンショットのデッドスローが基本。", en: "Water temps plunging. Bass stack on deep rock and structure transitions. Deadstick drop-shot is the go-to." },
      hotLures: { ja: ["ダウンショット（デッドスティック）", "メタルバイブ", "シャッドラップ"], en: ["Drop-shot (deadstick)", "Metal vibe", "Shad rap"] } },
  ],
  2: [ // アユ Sweetfish
    { months: [0,1,2,3,4], phase: "closed", badge: { ja: "禁漁期", en: "Closed Season" }, urgency: "low",
      tip: { ja: "アユの禁漁期（多くの河川で6月解禁）。川のコンディション観察と遊漁券の準備をしておこう。", en: "Most rivers closed to ayu fishing until June. Scout conditions and prepare your fishing permits." },
      hotLures: { ja: ["※禁漁中 — 準備期間"], en: ["Off-season — scout and prep"] } },
    { months: [5,6,7,8,9], phase: "prime",  badge: { ja: "🔥 友釣り最盛期！", en: "🔥 Prime Tomozuri!" }, urgency: "peak",
      tip: { ja: "6〜10月が友釣りの季節！水温18〜23℃が最適。縄張り意識が強い大型オスを狙え。流れの速い瀬の中心部がベストポイント。", en: "Peak tomozuri season. 18–23℃ optimal. Target territorial males holding the fastest mid-river current." },
      hotLures: { ja: ["友鮎（おとり鮎）", "毛鉤（テンカラ）", "小型スプーン 3〜5g"], en: ["Live decoy ayu (tomozuri)", "Tenkara kebari", "Small spoon 3–5g"] } },
    { months: [10,11], phase: "late",    badge: { ja: "落ちアユ", en: "Late-run Ayu" }, urgency: "medium",
      tip: { ja: "産卵のため下流へ下る「落ちアユ」。友釣りからルアーに切り替えるタイミング。下流のヨドミを狙え。", en: "Ayu dropping downstream to spawn ('ochiayu'). Switch from tomozuri to lure fishing. Target slow eddies in lower reaches." },
      hotLures: { ja: ["アユ型ミノー", "ダウンショット", "スプーン"], en: ["Ayu minnow", "Drop-shot", "Spoon"] } },
  ],
  3: [ // ヤマメ Yamame
    { months: [0,1], phase: "closed", badge: { ja: "禁漁期", en: "Closed" }, urgency: "low",
      tip: { ja: "ほとんどの河川でヤマメの禁漁期（3月解禁）。タックルの整備とフライのタイイングをしておこう。", en: "Most streams closed until March. Maintain tackle and tie flies in preparation." },
      hotLures: { ja: ["※禁漁中"], en: ["Off-season"] } },
    { months: [2,3],  phase: "opening", badge: { ja: "🌸 解禁！", en: "🌸 Season Opens!" }, urgency: "high",
      tip: { ja: "3月解禁直後。水温低くフライへの反応はやや鈍いが大型も出る。ニンフとウェットフライが効果的。ライズを見つけたらドライに切り替え。", en: "Just opened. Water still cold — fish react slower but big ones are catchable. Nymphs and wets work well. Switch to dry on any rise." },
      hotLures: { ja: ["ニンフ #12-16", "ウェットフライ", "小型スプーン 2〜3g"], en: ["Nymph #12-16", "Wet fly", "Small spoon 2–3g"] } },
    { months: [4,5],  phase: "prime",   badge: { ja: "🔥 最盛期！ライズ炸裂！", en: "🔥 Peak! Rises everywhere!" }, urgency: "peak",
      tip: { ja: "5〜6月が年間最高の時期！ハッチが頻繁でライズが多発。エルクヘアカディスやCDCダンが特効薬。朝夕はドライ一択。", en: "Best weeks of the year. Frequent hatches trigger constant rising. Elk Hair Caddis and CDC Dun are money. Dry fly morning and evening without question." },
      hotLures: { ja: ["エルクヘアカディス #12-16", "CDCダン #14-18", "パラシュートアダムス", "スプーン 2〜4g"], en: ["Elk Hair Caddis #12-16", "CDC Dun #14-18", "Parachute Adams", "Spoon 2–4g"] } },
    { months: [6,7,8], phase: "summer",  badge: { ja: "夏の渓流", en: "Summer Stream" }, urgency: "medium",
      tip: { ja: "水温上昇で深場や日陰に移動。早朝のみ表層付近。陸生昆虫（アント・グラスホッパー）パターンが効く。", en: "Heat pushes fish to deep shaded lies. Only early morning near surface. Terrestrials (ant, hopper) patterns work well." },
      hotLures: { ja: ["アントパターン #16-20", "ホッパー系フライ", "スプーン（深場）"], en: ["Ant pattern #16-20", "Hopper fly", "Deep spoon"] } },
    { months: [9],    phase: "spawning", badge: { ja: "⚠️ 産卵期", en: "⚠️ Spawning" }, urgency: "low",
      tip: { ja: "多くの川でヤマメの産卵期に入る。この時期の釣りは資源保護の観点から自粛を推奨。観察だけにとどめよう。", en: "Spawning season begins in most rivers. Please consider voluntary restraint to protect fish populations. Observe, don't fish." },
      hotLures: { ja: ["※産卵期 — 自粛推奨"], en: ["Spawning — please conserve"] } },
    { months: [10,11], phase: "closed", badge: { ja: "禁漁期", en: "Closed" }, urgency: "low",
      tip: { ja: "禁漁期。タックルのメンテナンスと来季の計画を立てよう。", en: "Closed season. Service your gear and plan next year's trips." },
      hotLures: { ja: ["※禁漁中"], en: ["Off-season"] } },
  ],
  4: [ // シーバス Sea Bass
    { months: [0,1,2], phase: "winter",   badge: { ja: "冬の深場狙い", en: "Winter deep" }, urgency: "medium",
      tip: { ja: "越冬のため沖の深場に落ちる。港湾の常夜灯周りにはまだ残る個体も。バイブレーション＆シンキングペンシルのスローリトリーブ。", en: "Fish retreat to deep offshore water. Some remain under harbor lights — slow sinking pencils and vibes work." },
      hotLures: { ja: ["バイブレーション（デッドスロー）", "シンキングペンシル", "ミノー（デープ）"], en: ["Slow vibe", "Sinking pencil", "Deep minnow"] } },
    { months: [3,4],   phase: "prespawn", badge: { ja: "🔥 春シーバス！", en: "🔥 Spring Seabass!" }, urgency: "high",
      tip: { ja: "バチ（イソメ・ゴカイ）の産卵に合わせてシーバスが大挙してシャローへ。バチパターン（細長いルアー）で爆発的に釣れる季節。河口の夜は必ず行こう。", en: "Worm spawn (bachi) brings seabass flooding into shallows. Slim, slow-sinking lures matching the worm hatch are deadly. Hit river mouths at night." },
      hotLures: { ja: ["バチ系ルアー（細長）", "フローティングペンシル", "マニック系", "シンペン 7〜10cm"], en: ["Slim worm-pattern lure", "Floating pencil", "Manic-style", "Sinking pencil 7–10cm"] } },
    { months: [5,6,7,8], phase: "summer", badge: { ja: "ナイトゲーム全開", en: "Night game peaks" }, urgency: "high",
      tip: { ja: "夜間の橋脚明暗部が最高。コアユ（小鮎）パターンで爆発。表層系ルアーへの反応が年間最高潮。夕マズメ直後が狙い目。", en: "Bridge light edges peak. Small ayu baitfish pattern dominates. Surface lures get year-best responses. Target the window right after sunset." },
      hotLures: { ja: ["コアユ系ミノー 9〜12cm", "シンキングペンシル", "ポッパー（夜間）", "バイブ（橋脚撃ち）"], en: ["Small ayu minnow 9–12cm", "Sinking pencil", "Popper (night)", "Vibe (bridge pillar)"] } },
    { months: [9,10],  phase: "prime",   badge: { ja: "🔥 秋のランカー！", en: "🔥 Autumn Monsters!" }, urgency: "peak",
      tip: { ja: "秋が一年で最高！大型ランカーが活発に捕食。イワシの群れについているシーバスをサーチ。磯周りのデイゲームも熱い。", en: "Best season of the year for big fish. Metre-class seabass chasing sardine schools. Daytime rocky shore fishing is also red-hot." },
      hotLures: { ja: ["ビッグミノー 14〜18cm", "メタルジグ 28〜42g", "ポッパー（ナブラ打ち）", "バイブ"], en: ["Big minnow 14–18cm", "Metal jig 28–42g", "Popper (surface schools)", "Vibe"] } },
    { months: [11],    phase: "late",    badge: { ja: "落ちシーバス", en: "Late-run" }, urgency: "medium",
      tip: { ja: "産卵のため沖へ落ちる前のラストチャンス。河川内の大型を狙う。水温10℃を切ったらシーズン終了が近い。", en: "Last chance before fish move offshore to spawn. Target large river fish. When water drops below 10℃ the season is nearly done." },
      hotLures: { ja: ["ビッグベイト", "シンキングペンシル", "バイブレーション"], en: ["Big swimbait", "Sinking pencil", "Vibration"] } },
  ],
  5: [ // イワナ Iwana
    { months: [0,1], phase: "closed", badge: { ja: "禁漁期", en: "Closed" }, urgency: "low",
      tip: { ja: "禁漁期。来季のテンカラ竿と毛鉤を整備しよう。", en: "Off-season. Tune your tenkara rod and tie new kebari." }, hotLures: { ja: ["※禁漁中"], en: ["Off-season"] } },
    { months: [2,3,4,5], phase: "prime", badge: { ja: "🪶 テンカラ最盛期！", en: "🪶 Prime Tenkara!" }, urgency: "peak",
      tip: { ja: "解禁直後〜初夏が源流のイワナのゴールデンシーズン。人が入らない源流部を目指せ。逆さ毛鉤への反応が抜群。早朝の水温低い時間帯に集中。", en: "Headwater gold season. Push as far upstream as possible — pressure-free fish hit hard. Sakasa kebari gets violent strikes. Concentrate on cool early morning hours." },
      hotLures: { ja: ["テンカラ逆さ毛鉤 #10-14", "エルクヘアカディス", "ぶどう虫", "川虫"], en: ["Sakasa kebari #10-14", "Elk Hair Caddis", "Grape worm", "Stream insect"] } },
    { months: [6,7,8], phase: "summer", badge: { ja: "源流避暑釣り", en: "Cool headwaters" }, urgency: "medium",
      tip: { ja: "高標高の源流は真夏でも涼しく、イワナが元気。陸生昆虫パターンに反応良好。体力的に厳しいが人が少ない分大型が狙える。", en: "High-altitude headwaters stay cool even in midsummer. Terrestrial fly patterns work great. Tough access means bigger, less-pressured fish." },
      hotLures: { ja: ["アントパターン", "ビートル系フライ", "テンカラ毛鉤"], en: ["Ant pattern", "Beetle fly", "Tenkara kebari"] } },
    { months: [9,10,11], phase: "closed", badge: { ja: "禁漁期", en: "Closed" }, urgency: "low",
      tip: { ja: "禁漁期。来季の源流計画を立てよう。", en: "Off-season. Plan your headwater expeditions for next year." }, hotLures: { ja: ["※禁漁中"], en: ["Off-season"] } },
  ],
  11: [ // ニジマス Rainbow Trout
    { months: [0,1,2,3,4,5,6,7,8,9,10,11], phase: "prime", badge: { ja: "🌈 通年OK！", en: "🌈 Year-round!" }, urgency: "medium",
      tip: { ja: "管理釣り場では通年釣れる。5〜6月は野生の渓流ニジマスがライズする最高の季節。フライへの反応が抜群。", en: "Available year-round at managed fisheries. May–June is prime time for wild stream rainbows rising to flies." },
      hotLures: { ja: ["パワーベイト（管釣り）", "スプーン 2〜5g", "パラシュートアダムス", "エッグフライ"], en: ["Powerbait (managed)", "Spoon 2–5g", "Parachute Adams", "Egg fly"] } },
  ],
  12: [ // アオリイカ Squid
    { months: [0,1,2,3], phase: "closed", badge: { ja: "シーズンオフ", en: "Off-season" }, urgency: "low",
      tip: { ja: "春の産卵期まで待とう。エギのカラーローテーションを準備。", en: "Wait for the spring spawn. Prepare your egi color rotation." }, hotLures: { ja: ["準備中"], en: ["Prep season"] } },
    { months: [4,5],    phase: "spring",  badge: { ja: "🦑 春イカ！親イカ狙い！", en: "🦑 Spring giants!" }, urgency: "peak",
      tip: { ja: "産卵のために浅場に入ってくる大型の親イカが狙える最高の季節！3.5〜4号の大きめエギでゆっくりフォール。夕方〜夜が爆発タイム。", en: "Massive spawning squid move shallow — best of the year for size. Large egi #3.5–4 with slow fall. Evening to night is peak time." },
      hotLures: { ja: ["エギ 3.5〜4号（オレンジ/金）", "ナイトカラーエギ（夜光）"], en: ["Egi #3.5–4 (orange/gold)", "Night-glow egi"] } },
    { months: [6,7,8],  phase: "summer",  badge: { ja: "夏イカ数釣り", en: "Summer numbers" }, urgency: "medium",
      tip: { ja: "小型の新子イカが大量発生。数釣りなら最高の時期。小さめエギ2.5〜3号で数を狙おう。", en: "Juvenile squid flood the coast. Outstanding numbers fishing with smaller egi #2.5–3." },
      hotLures: { ja: ["エギ 2.5〜3号", "小型ジグ"], en: ["Egi #2.5–3", "Small jig"] } },
    { months: [9,10],   phase: "autumn",  badge: { ja: "🔥 秋イカ！数＆型！", en: "🔥 Autumn peak!" }, urgency: "high",
      tip: { ja: "秋は数も型も狙える最高のシーズン！夕方の常夜灯周りと潮通しの良い磯が一級ポイント。", en: "Both numbers and size in autumn. Harbor lights and current-swept rocky points are prime." },
      hotLures: { ja: ["エギ 3.0〜3.5号（オレンジ/赤）", "夜光エギ（常夜灯周り）"], en: ["Egi #3.0–3.5 (orange/red)", "Glow egi (night lights)"] } },
    { months: [11],     phase: "late",    badge: { ja: "晩秋の大型", en: "Late autumn size" }, urgency: "medium",
      tip: { ja: "水温低下で小型が減り、大型のみ残る。深場狙いのスローフォールエギが効果的。", en: "Small squid gone, only big ones remain. Slow-sink deep egi for the late season heavyweights." },
      hotLures: { ja: ["エギ 3.5号（ディープ）", "スローフォールエギ"], en: ["Egi #3.5 (deep)", "Slow-fall egi"] } },
  ],
  13: [ // ブリ / ハマチ Yellowtail
    { months: [0,1,2,3], phase: "winter", badge: { ja: "🐟 寒ブリ！", en: "🐟 Winter Buri!" }, urgency: "high",
      tip: { ja: "冬の寒ブリは脂がのって最高に美味い！沖磯や船から大型を狙う。ショアからは厳しいが港湾内にも入ることがある。", en: "Winter yellowtail are fat and delicious. Target from offshore rocks or boat. Occasionally enters harbors in winter." },
      hotLures: { ja: ["メタルジグ 80〜150g（ブルーピンク）", "タイラバ（大型）", "インチク"], en: ["Metal jig 80–150g (blue-pink)", "Large taira", "Inchiku"] } },
    { months: [4,5,6],  phase: "spring",  badge: { ja: "春のワカシ", en: "Spring juveniles" }, urgency: "medium",
      tip: { ja: "若魚（ワカシ〜イナダ）が釣れ始める。ライトショアジギングの入門に最適。鳥山（カモメの群れ）を探して全力投入。", en: "Juvenile fish start appearing. Great entry point for light shore jigging. Chase diving bird flocks for easy success." },
      hotLures: { ja: ["メタルジグ 30〜60g", "ジグサビキ", "ミノー 14cm"], en: ["Metal jig 30–60g", "Jig sabiki", "Minnow 14cm"] } },
    { months: [7,8,9,10], phase: "prime", badge: { ja: "🔥 青物爆釣シーズン！", en: "🔥 Peak Jigging!" }, urgency: "peak",
      tip: { ja: "夏〜秋が青物ショアジギングのベストシーズン！ナブラ（鳥山）を追いかけろ。朝マズメの第一投に全力を注げ。全力遠投＆高速ジャーキングが基本。", en: "Summer–autumn is the absolute peak for shore jigging. Chase bird flocks. Give the very first cast at dawn everything you've got. Max-distance cast, fast aggressive jigging." },
      hotLures: { ja: ["メタルジグ 60〜100g（シルバー/ブルピン）", "ポッパー 100mm〜（トップ炸裂！）", "スティックベイト（ナブラ打ち）"], en: ["Metal jig 60–100g (silver/blue-pink)", "Popper 100mm+ (explosive topwater!)", "Stickbait (schooling fish)"] } },
    { months: [11],     phase: "late",    badge: { ja: "晩秋のブリ回遊", en: "Late Buri run" }, urgency: "high",
      tip: { ja: "大型ブリの回遊が始まる！富山湾・日本海側は特に熱い。ヘビーなタックルで大物に備えよう。", en: "Big yellowtail migration begins. Toyama Bay and the Sea of Japan side get especially hot. Heavy tackle ready for metre-class fish." },
      hotLures: { ja: ["メタルジグ 100〜200g", "ビッグポッパー", "ジグサビキ（ハイアピール）"], en: ["Metal jig 100–200g", "Big popper", "Heavy jig-sabiki"] } },
  ],
};

// Get current seasonal tip for a fish
function getSeasonalTip(fishId) {
  const tips = SEASONAL_TIPS[fishId];
  if (!tips) return null;
  return tips.find(t => t.months.includes(CURRENT_MONTH)) || null;
}

// Month name for display
const MONTH_NAMES = {
  ja: ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],
  en: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
};

const URGENCY_STYLES = {
  peak:   { bg: "#fff0d0", border: "#e08a00", text: "#8a4400", dot: "#e08a00" },
  high:   { bg: "#fff4d0", border: "#c07800", text: "#7a4000", dot: "#c07800" },
  medium: { bg: "#f0f8f0", border: "#2d7a3a", text: "#1a4a22", dot: "#2d7a3a" },
  low:    { bg: "#f5f0e8", border: "#a0a090", text: "#5a5a4a", dot: "#a0a090" },
};

const MOCK_CATCHES = [
  { id: 1, user: "テンカラ師", avatar: "🎋", fish: "イワナ", weight: "0.5 kg", location: "黒部川源流（富山）", date: { ja: "3月24日", en: "Mar 24" }, emoji: "🐠", likes: 68, comments: ["美しい！", "テンカラで？", "源流ロマン✨"], rating: 5.0, verified: true, photo: null, method: "fly" },
  { id: 2, user: "渓流師", avatar: "🏔️", fish: "ヤマメ", weight: "0.38 kg", location: "奥多摩川（東京）", date: { ja: "3月22日", en: "Mar 22" }, emoji: "🐡", likes: 38, comments: ["綺麗な魚！", "ドライフライ？", "羨ましい〜"], rating: 4.8, verified: false, photo: null, method: "fly" },
  { id: 3, user: "湾岸ハンター", avatar: "🌙", fish: "シーバス", weight: "3.5 kg", location: "東京湾・運河", date: { ja: "3月20日", en: "Mar 20" }, emoji: "🦈", likes: 91, comments: ["モンスター！", "ランカーですね！", "最高🔥"], rating: 5.0, verified: true, photo: null, method: "lure" },
  { id: 4, user: "タイラバ王", avatar: "🚤", fish: "マダイ", weight: "1.8 kg", location: "明石海峡（兵庫）", date: { ja: "3月18日", en: "Mar 18" }, emoji: "🐟", likes: 44, comments: ["美味そう！", "タイラバで？"], rating: 4.7, verified: false, photo: null, method: "lure" },
];

const LEADERBOARD = [
  { rank: 1, user: "テンカラ師", avatar: "🎋", points: 15600, catches: 221, topFish: { ja: "イワナ", en: "Iwana" }, badge: "🏆", streak: 22 },
  { rank: 2, user: "湾岸ハンター", avatar: "🌙", points: 14820, catches: 203, topFish: { ja: "シーバス", en: "Seabass" }, badge: "🥈", streak: 18 },
  { rank: 3, user: "琵琶湖マスター", avatar: "🎣", points: 12340, catches: 176, topFish: { ja: "バス", en: "Bass" }, badge: "🥉", streak: 11 },
  { rank: 4, user: "タイラバ王", avatar: "🚤", points: 10870, catches: 155, topFish: { ja: "マダイ", en: "Red Bream" }, badge: "⭐", streak: 25 },
  { rank: 5, user: "渓流師", avatar: "🏔️", points: 9200, catches: 134, topFish: { ja: "ヤマメ", en: "Yamame" }, badge: "⭐", streak: 7 },
  { rank: 6, user: "サーフキング", avatar: "🌊", points: 7430, catches: 112, topFish: { ja: "ヒラメ", en: "Flounder" }, badge: "⭐", streak: 4 },
  { rank: 7, user: "アジングプロ", avatar: "🎯", points: 6190, catches: 298, topFish: { ja: "アジ", en: "Mackerel" }, badge: "⭐", streak: 9 },
];

// ─── WEATHER UTILS ───────────────────────────────────────────────────────────
// WMO weather code → condition label + icon
// https://open-meteo.com/en/docs#weathervariables
const WMO_CONDITIONS = {
  0:  { ja: "快晴",           en: "Clear Sky",        icon: "☀️" },
  1:  { ja: "ほぼ晴れ",       en: "Mainly Clear",     icon: "🌤️" },
  2:  { ja: "時々くもり",     en: "Partly Cloudy",    icon: "⛅" },
  3:  { ja: "くもり",         en: "Overcast",         icon: "☁️" },
  45: { ja: "霧",             en: "Foggy",            icon: "🌫️" },
  48: { ja: "霧氷",           en: "Icy Fog",          icon: "🌫️" },
  51: { ja: "霧雨（弱）",     en: "Light Drizzle",    icon: "🌦️" },
  53: { ja: "霧雨",           en: "Drizzle",          icon: "🌦️" },
  55: { ja: "霧雨（強）",     en: "Heavy Drizzle",    icon: "🌧️" },
  61: { ja: "小雨",           en: "Light Rain",       icon: "🌧️" },
  63: { ja: "雨",             en: "Rain",             icon: "🌧️" },
  65: { ja: "大雨",           en: "Heavy Rain",       icon: "🌧️" },
  71: { ja: "小雪",           en: "Light Snow",       icon: "🌨️" },
  73: { ja: "雪",             en: "Snow",             icon: "❄️" },
  75: { ja: "大雪",           en: "Heavy Snow",       icon: "❄️" },
  80: { ja: "にわか雨",       en: "Rain Showers",     icon: "🌦️" },
  81: { ja: "にわか雨（強）", en: "Heavy Showers",    icon: "⛈️" },
  95: { ja: "雷雨",           en: "Thunderstorm",     icon: "⛈️" },
  99: { ja: "ひょうを伴う雷雨", en: "Hail Thunderstorm", icon: "⛈️" },
};

function wmoToCondition(code) {
  return WMO_CONDITIONS[code] || { ja: "天気情報なし", en: "Unknown", icon: "🌡️" };
}

// Wind direction degrees → compass label
function windDir(deg, lang) {
  const dirs = lang === "ja"
    ? ["北","北北東","北東","東北東","東","東南東","南東","南南東","南","南南西","南西","西南西","西","西北西","北西","北北西"]
    : ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

// Fishing index 0-100 based on weather conditions
function calcFishingIndex(wmoCode, windspeed, temp, isDay) {
  let score = 80;
  // Rain penalty
  if (wmoCode >= 61 && wmoCode <= 67) score -= 20;
  if (wmoCode >= 80) score -= 15;
  if (wmoCode >= 95) score -= 30;
  // Overcast is good for fishing
  if (wmoCode === 2 || wmoCode === 3) score += 5;
  // Strong wind penalty
  if (windspeed > 30) score -= 25;
  else if (windspeed > 20) score -= 15;
  else if (windspeed > 10) score -= 5;
  else if (windspeed < 5) score += 5; // calm is great
  // Temperature
  if (temp < 5 || temp > 35) score -= 10;
  if (temp >= 10 && temp <= 25) score += 5;
  // Overcast+mild = ideal
  if ((wmoCode === 2 || wmoCode === 3) && temp >= 10 && temp <= 22) score += 8;
  return Math.min(100, Math.max(10, Math.round(score)));
}

// Estimate moon phase emoji from date
function moonPhaseEmoji(lang) {
  const phases = [
    { ja: "新月 🌑", en: "New Moon 🌑" },
    { ja: "三日月 🌒", en: "Waxing Crescent 🌒" },
    { ja: "上弦の月 🌓", en: "First Quarter 🌓" },
    { ja: "十三夜 🌔", en: "Waxing Gibbous 🌔" },
    { ja: "満月 🌕", en: "Full Moon 🌕" },
    { ja: "十六夜 🌖", en: "Waning Gibbous 🌖" },
    { ja: "下弦の月 🌗", en: "Last Quarter 🌗" },
    { ja: "有明月 🌘", en: "Waning Crescent 🌘" },
  ];
  const epoch = new Date("2000-01-06").getTime(); // known new moon
  const cycle = 29.53 * 24 * 60 * 60 * 1000;
  const phase = Math.floor(((Date.now() - epoch) % cycle) / cycle * 8);
  return phases[phase][lang];
}

// Build hourly data from Open-Meteo hourly arrays for today only
function buildHourlySlots(times, temps, codes, lat) {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const TARGET_HOURS = [6, 8, 10, 12, 14, 16, 18, 20];
  const slots = [];
  TARGET_HOURS.forEach(hr => {
    const timeStr = `${todayStr}T${String(hr).padStart(2,"0")}:00`;
    const idx = times.indexOf(timeStr);
    if (idx < 0) return;
    const code = codes[idx];
    const cond = wmoToCondition(code);
    const fi = calcFishingIndex(code, 0, temps[idx], hr >= 6 && hr <= 18);
    slots.push({
      time: `${hr}${lat > 0 ? "時" : "h"}`,
      temp: Math.round(temps[idx]),
      icon: cond.icon,
      fishing: fi,
    });
  });
  return slots.length ? slots : [
    { time: "6時", temp: 14, icon: "🌤️", fishing: 85 },
    { time: "12時", temp: 18, icon: "☀️", fishing: 70 },
    { time: "18時", temp: 15, icon: "⛅", fishing: 88 },
  ];
}

// Fallback static weather (shown while loading or if fetch fails)
const WEATHER_FALLBACK = {
  temp: 18, feels: 16,
  condition: { ja: "取得中...", en: "Loading..." },
  humidity: 65, wind: { ja: "－", en: "－" },
  fishingIndex: 75, moonPhase: { ja: "取得中...", en: "Loading..." },
  waterTemp: null, waterClarity: { ja: "－", en: "－" },
  flow: { ja: "－", en: "－" }, uvIndex: null,
  hourly: [], tides: [],
  loaded: false,
};

// ─── LOCAL STORAGE PERSISTENCE ───────────────────────────────────────────────
function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch { return defaultValue; }
  });
  function setAndStore(newVal) {
    const val = typeof newVal === "function" ? newVal(value) : newVal;
    setValue(val);
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }
  return [value, setAndStore];
}


const REGULATIONS = {
  "ブラックバス":  { minSize: null, bag: null, note: { ja: "リリース禁止の河川・湖あり（琵琶湖など）。各県の漁業規則を確認すること。", en: "Mandatory kill in some waters (e.g. Lake Biwa). Check prefectural fisheries rules." }, seasons: "year-round" },
  "アユ":         { minSize: 15,   bag: null, note: { ja: "河川ごとに遊漁券が必要（¥1,500〜¥2,200/日）。禁漁期：11月〜5月（多くの河川）。", en: "Daily fishing permit required (¥1,500–2,200). Closed season: Nov–May on most rivers." }, seasons: "Jun–Oct" },
  "ヤマメ":       { minSize: 20,   bag: null, note: { ja: "遊漁券必須。禁漁期：10月〜2月。産卵期（9月頃）は自粛推奨。バーブレスフック推奨。", en: "Fishing permit required. Closed Oct–Feb. Voluntary restraint during spawning (Sep). Barbless hook recommended." }, seasons: "Mar–Sep" },
  "イワナ":       { minSize: 20,   bag: null, note: { ja: "源流域は禁漁区が多い。遊漁券必須。バーブレスフック・リリース推奨。", en: "Many headwater areas are protected. Permit required. Barbless hooks and catch & release strongly encouraged." }, seasons: "Mar–Sep" },
  "ニジマス":     { minSize: null, bag: null, note: { ja: "管理釣り場は規則が異なる（持ち帰り制限あり）。天然河川は遊漁券要。", en: "Managed fishery rules vary (may have keep limits). Wild streams require fishing permit." }, seasons: "year-round" },
  "マダイ":       { minSize: null, bag: null, note: { ja: "特定の規制なし。ただし漁業権区域では遊漁禁止の場所あり。", en: "No specific size limit. Some areas with fishing rights may restrict angling." }, seasons: "year-round" },
  "シーバス":     { minSize: null, bag: null, note: { ja: "特定の規制なし。河川・河口域の禁漁区を確認すること。", en: "No specific size/bag limits. Check prohibited zones in rivers and estuaries." }, seasons: "year-round" },
  "アオリイカ":   { minSize: null, bag: null, note: { ja: "禁漁期・禁漁区なし（2024年現在）。ただし地域の漁協ルールに従うこと。", en: "No national closed season (as of 2024). Follow local fishing cooperative rules." }, seasons: "year-round" },
  "ブリ":         { minSize: null, bag: null, note: { ja: "遊漁規制なし。漁業者との摩擦を避けるため、定置網付近での釣りは控えること。", en: "No recreational size/bag limits. Avoid fishing near commercial set nets." }, seasons: "year-round" },
  "クロダイ":     { minSize: null, bag: null,  note: { ja: "特定の規制なし。磯釣り場のルール（立入禁止区域など）に従うこと。", en: "No national size limits. Follow local rock fishing area rules (restricted access points)." }, seasons: "year-round" },
  "ヘラブナ":     { minSize: null, bag: null, note: { ja: "遊漁券が必要な水域あり。キャッチ＆リリースが一般的な文化。", en: "Fishing permits required at some venues. Catch & release is the standard culture." }, seasons: "year-round" },
  "コイ":         { minSize: null, bag: null, note: { ja: "特定の規制なし。自然保護区内での釣りは禁止の場所あり。", en: "No specific size/bag limits. Fishing may be prohibited in nature reserves." }, seasons: "year-round" },
  "ヒラメ":       { minSize: null, bag: null, note: { ja: "特定の規制なし。漁業権のある海域には注意。", en: "No specific recreational limits. Be aware of commercial fishing rights areas." }, seasons: "year-round" },
  "アジ":         { minSize: null, bag: null, note: { ja: "特定の規制なし。港湾・防波堤の立入禁止区域に注意。", en: "No specific limits. Be aware of restricted access areas at ports and breakwaters." }, seasons: "year-round" },
  "メバル":       { minSize: null, bag: null, note: { ja: "特定の規制なし。夜間釣りの際は港湾の規則に従うこと。", en: "No specific limits. Follow harbor regulations for night fishing." }, seasons: "year-round" },
};

function getRegulation(fishName) {
  return REGULATIONS[fishName] || { minSize: null, bag: null, note: { ja: "詳細は各都道府県の漁業規則を確認してください。", en: "Check your prefectural fisheries regulations for details." }, seasons: "year-round" };
}

// ─── 7-DAY FISHING FORECAST ──────────────────────────────────────────────────
function use7DayForecast(userLocation) {
  const [forecast, setForecast] = useState([]);

  useEffect(() => {
    if (!userLocation) return;
    const { lat, lng } = userLocation;
    (async () => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
          `&daily=weather_code,temperature_2m_max,temperature_2m_min,windspeed_10m_max,precipitation_sum` +
          `&timezone=auto&forecast_days=7&models=jma_seamless`;
        const res = await fetch(url);
        const d = await res.json();
        const days = d.daily.time.map((date, i) => {
          const code = d.daily.weather_code[i];
          const cond = wmoToCondition(code);
          const avgTemp = Math.round((d.daily.temperature_2m_max[i] + d.daily.temperature_2m_min[i]) / 2);
          const wind = d.daily.windspeed_10m_max[i];
          const rain = d.daily.precipitation_sum[i];
          const fi = calcFishingIndex(code, wind * 1000 / 3600, avgTemp, true);
          const dateObj = new Date(date);
          const dayNames = { ja: ["日","月","火","水","木","金","土"], en: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"] };
          return {
            date,
            dayJa: `${dateObj.getMonth()+1}/${dateObj.getDate()}(${dayNames.ja[dateObj.getDay()]})`,
            dayEn: `${dayNames.en[dateObj.getDay()]} ${dateObj.getMonth()+1}/${dateObj.getDate()}`,
            icon: cond.icon,
            condJa: cond.ja,
            condEn: cond.en,
            maxTemp: Math.round(d.daily.temperature_2m_max[i]),
            minTemp: Math.round(d.daily.temperature_2m_min[i]),
            wind: Math.round(wind * 10 / 36) / 10, // km/h → m/s
            rain: Math.round(rain * 10) / 10,
            fishingIndex: fi,
          };
        });
        setForecast(days);
      } catch (err) {
        console.warn("7-day forecast failed:", err);
      }
    })();
  }, [userLocation?.lat, userLocation?.lng]);

  return forecast;
}

// ─── AI FISHING PREDICTION ZONES ─────────────────────────────────────────────
function calcSpotScore(spot, weather, tideData, activeUsers) {
  let score = 50;
  const now = new Date();
  const hour = now.getHours();
  const month = now.getMonth();

  if (hour >= 5 && hour <= 8) score += 20;
  else if (hour >= 17 && hour <= 20) score += 15;
  else if (hour >= 9 && hour <= 15) score += 5;
  else score -= 10;

  if (weather) {
    const temp = parseFloat(weather.temp);
    const wind = parseFloat(weather.wind);
    const desc = (weather.desc || "").toLowerCase();
    if (temp >= 15 && temp <= 25) score += 15;
    else if (temp >= 10 && temp <= 30) score += 8;
    else score -= 10;
    if (wind < 3) score += 10;
    else if (wind < 6) score += 5;
    else score -= 15;
    if (desc.includes("clear") || desc.includes("晴")) score += 10;
    else if (desc.includes("rain") || desc.includes("雨")) score -= 10;
  }

  const spotType = typeof spot.type === "object" ? spot.type.en : spot.type;
  if (spotType?.includes("Stream") || spotType?.includes("River")) {
    if (month >= 5 && month <= 8) score += 20;
    else if (month >= 2 && month <= 4) score += 12;
  } else if (spotType?.includes("Saltwater") || spotType?.includes("Bay")) {
    if (month >= 3 && month <= 5) score += 15;
    else if (month >= 8 && month <= 10) score += 15;
  }

  const lunarCycle = 29.53 * 24 * 60 * 60 * 1000;
  const knownNewMoon = new Date("2024-01-11").getTime();
  const phase = ((now.getTime() - knownNewMoon) % lunarCycle) / lunarCycle;
  if (phase < 0.05 || phase > 0.95) score += 12;
  else if (phase > 0.45 && phase < 0.55) score += 10;

  if (tideData?.length > 0 && tideData[0]?.type === "high") score += 8;

  const coords = SPOT_COORDS[spot.name];
  if (coords && activeUsers) {
    const crowd = getCrowdingLevel(coords.lat, coords.lng, activeUsers);
    if (crowd.level === "crowded") score -= 15;
    else if (crowd.level === "moderate") score -= 5;
  }

  return Math.max(10, Math.min(99, Math.round(score)));
}

function getPredictionColor(score) {
  if (score >= 80) return { bg: "rgba(45,122,58,0.18)", border: "#2d7a3a", glow: "0 0 20px rgba(45,122,58,0.5)", label: "🔥", text: "#1a4a22" };
  if (score >= 60) return { bg: "rgba(192,106,16,0.14)", border: "#c06a10", glow: "0 0 14px rgba(192,106,16,0.4)", label: "👍", text: "#7a4000" };
  if (score >= 40) return { bg: "rgba(100,100,120,0.10)", border: "#8899aa", glow: "none", label: "😐", text: "#445566" };
  return { bg: "rgba(180,30,30,0.08)", border: "#b82030", glow: "none", label: "⛔", text: "#6a1010" };
}

function PredictionZoneCard({ spot, weather, tideData, activeUsers, lang, onAskAI }) {
  const score = calcSpotScore(spot, weather, tideData, activeUsers);
  const colors = getPredictionColor(score);
  const coords = SPOT_COORDS[spot.name];
  const crowd = coords ? getCrowdingLevel(coords.lat, coords.lng, activeUsers) : null;
  return (
    <div style={{ background: colors.bg, border: `2px solid ${colors.border}`, borderRadius: 14, padding: "12px 14px", marginBottom: 10, boxShadow: colors.glow }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0d7377" }}>{spot.icon} {spot.name}</div>
          <div style={{ fontSize: "0.78rem", color: "#5a5a4a" }}>📌 {spot.pref} · {typeof spot.type === "object" ? spot.type[lang] : spot.type}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: "1.6rem", fontWeight: 900, color: colors.text, lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: "0.68rem", color: colors.text, fontWeight: 700 }}>{lang === "ja" ? "釣り指数" : lang === "es" ? "Puntos" : "Score"}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: colors.text }}>{colors.label} {score >= 80 ? (lang === "ja" ? "最高の条件！" : lang === "es" ? "¡Condiciones óptimas!" : "Prime conditions!") : score >= 60 ? (lang === "ja" ? "良い条件" : lang === "es" ? "Buenas condiciones" : "Good conditions") : score >= 40 ? (lang === "ja" ? "普通" : lang === "es" ? "Regular" : "Fair") : (lang === "ja" ? "不向き" : lang === "es" ? "Malo" : "Poor")}</span>
        {crowd && crowd.count > 0 && <span style={{ fontSize: "0.75rem", color: crowd.color, fontWeight: 600 }}>{crowd.label[lang]}</span>}
        <span style={{ fontSize: "0.75rem", color: "#5a5a4a" }}>🐟 {typeof spot.fish === "object" ? spot.fish[lang] : spot.fish}</span>
      </div>
      <button onClick={() => onAskAI(spot, score)} style={{ width: "100%", padding: "7px", background: "rgba(255,255,255,0.7)", border: `1px solid ${colors.border}`, borderRadius: 8, color: colors.text, cursor: "pointer", fontFamily: "inherit", fontSize: "0.82rem", fontWeight: 600 }}>
        🤖 {lang === "ja" ? "AIに詳しく聞く →" : lang === "es" ? "Preguntarle a IA →" : "Ask AI for details →"}
      </button>
    </div>
  );
}

function PredictionZoneModal({ spot, score, weather, tideData, lang, onClose }) {
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const prompt = lang === "ja"
          ? `日本の釣り専門家として「${spot.name}」の釣り予測を分析してください。釣り指数:${score}/100、対象魚:${typeof spot.fish === "object" ? spot.fish.ja : spot.fish}、天気:${weather?.desc || "不明"} ${weather?.temp || "?"}°C 風${weather?.wind || "?"}m/s、季節:${new Date().toLocaleDateString("ja-JP",{month:"long"})}、時刻:${new Date().toLocaleTimeString("ja-JP",{hour:"2-digit",minute:"2-digit"})}。おすすめの釣り方・時間帯・一言アドバイスを200文字以内で。`
          : `As a Japanese fishing expert, analyze fishing at "${spot.name}". Score:${score}/100, Target:${typeof spot.fish === "object" ? spot.fish.en : spot.fish}, Weather:${weather?.desc} ${weather?.temp}°C wind ${weather?.wind}m/s, Month:${new Date().toLocaleDateString("en-US",{month:"long"})}. Give best method, timing, and key tip in under 120 words.`;

        const res = await fetch("/api/claude", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 300, messages: [{ role: "user", content: prompt }] })
        });
        const data = await res.json();
        setAdvice(data.content?.[0]?.text || (lang === "ja" ? "取得できませんでした" : "Could not get advice"));
      } catch (e) {
        setAdvice(lang === "ja" ? "通信エラー" : "Connection error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const colors = getPredictionColor(score);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 430, background: "#fffdf8", borderRadius: 24, padding: 20, animation: "fadeUp 0.3s ease", maxHeight: "80vh", overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>{spot.icon} {spot.name}</div>
            <div style={{ fontSize: "0.82rem", color: "#5a5a4a" }}>🤖 {lang === "ja" ? "AI釣り予測" : lang === "es" ? "Predicción IA de Pesca" : "AI Fishing Prediction"}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: colors.text }}>{score}</div>
            <div style={{ fontSize: "0.68rem", color: colors.text }}>{lang === "ja" ? "釣り指数" : lang === "es" ? "Puntos" : "Score"}</div>
          </div>
        </div>
        <div style={{ background: colors.bg, border: `2px solid ${colors.border}`, borderRadius: 12, padding: "12px 14px", marginBottom: 14, fontSize: "0.92rem", color: "#0d7377", lineHeight: 1.7, minHeight: 80 }}>
          {loading ? <div style={{ textAlign: "center", padding: "20px 0", color: "#5a5a4a" }}>🤖 {lang === "ja" ? "AIが分析中..." : "AI analyzing..."}</div> : advice}
        </div>
        <button onClick={onClose} style={{ width: "100%", padding: "12px", background: "#e0f2f2", border: "2px solid #FFE500", borderRadius: 12, color: "#0d7377", cursor: "pointer", fontFamily: "inherit", fontSize: "1rem", fontWeight: 700 }}>
          {lang === "ja" ? "閉じる" : lang === "es" ? "Cerrar" : "Close"}
        </button>
      </div>
    </div>
  );
}

// ─── MABO TOURNAMENTS ────────────────────────────────────────────────────────
const MABO_TOURNAMENTS = [
  {
    id: 0,
    name: { ja: "⚔️ Kevin vs 梁井 — 一騎打ち大会", en: "⚔️ Kevin vs 梁井 — Head to Head" },
    status: "live",
    participants: 2,
    location: { ja: "九州全域（どこでも可）", en: "Anywhere in Kyushu" },
    period: { ja: "随時開催中", en: "Ongoing rivalry" },
    target: { ja: "全魚種（最大1匹の重量）", en: "All species — largest single fish wins" },
    rule: { ja: "最大1匹の重量で勝負。写真証明必須。", en: "Largest single fish by weight. Photo proof required." },
    prize: { ja: "🏆 永遠の自慢権 + ビール1本", en: "🏆 Eternal bragging rights + one beer" },
    rivalry: true,
    players: [
      { name: "Kevin", flag: "🇵🇷", best: null, species: null, location: null },
      { name: "梁井", flag: "🇯🇵", best: null, species: null, location: null },
    ],
    leaderboard: []
  },
  {
    id: 1,
    name: { ja: "マボカップ2025 春季大会", en: "Mabo Cup 2025 Spring" },
    status: "live",
    participants: 47,
    location: { ja: "球磨川・人吉市", en: "Kuma River, Hitoyoshi" },
    period: { ja: "5月25日〜6月1日", en: "May 25 – Jun 1" },
    target: { ja: "アユ・ヤマメ", en: "Ayu & Yamame" },
    rule: { ja: "3匹合計重量", en: "3-fish total weight" },
    prize: { ja: "🥇 シマノ プレミアムロッドセット", en: "🥇 Shimano Premium Rod Set" },
    leaderboard: [
      { rank: 1, name: "釣り師タケシ", weight: "2.4kg", species: "アユ" },
      { rank: 2, name: "くまもとアングラー", weight: "2.1kg", species: "アユ" },
      { rank: 3, name: "九州フィッシャー", weight: "1.8kg", species: "ヤマメ" },
      { rank: 4, name: "MatsuoKen", weight: "1.6kg", species: "アユ" },
      { rank: 5, name: "南九州つり太郎", weight: "1.4kg", species: "アユ" },
    ]
  },
  {
    id: 2,
    name: { ja: "マボチャンネル アユ友釣り選手権", en: "Mabo Ayu Tomozuri Championship" },
    status: "upcoming",
    participants: 0,
    location: { ja: "矢部川・黒木町", en: "Yabe River, Kurogi" },
    period: { ja: "7月15日〜8月31日", en: "Jul 15 – Aug 31" },
    target: { ja: "アユ（友釣り限定）", en: "Ayu (Tomozuri only)" },
    rule: { ja: "最大1匹の重量", en: "Largest single fish" },
    prize: { ja: "🥇 マボ公認アングラー認定 + ダイワロッド", en: "🥇 Mabo Certified Angler + Daiwa Rod" },
    leaderboard: []
  },
  {
    id: 3,
    name: { ja: "秋の大物チャレンジ", en: "Autumn Big Fish Challenge" },
    status: "upcoming",
    participants: 0,
    location: { ja: "全国（オンライン提出）", en: "Nationwide (online submission)" },
    period: { ja: "10月1日〜11月30日", en: "Oct 1 – Nov 30" },
    target: { ja: "全魚種", en: "All species" },
    rule: { ja: "最大1匹の重量（写真証明）", en: "Largest single fish (photo proof)" },
    prize: { ja: "🥇 マボチャンネル出演権利", en: "🥇 Feature on Mabo Channel" },
    leaderboard: []
  },
];

function TournamentView({ lang, profile, myCatches }) {
  const [activeTournament, setActiveTournament] = useState(null);
  const [showJoin, setShowJoin] = useState(false);
  const [submitWeight, setSubmitWeight] = useState("");
  const [submitSpecies, setSubmitSpecies] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (activeTournament) {
    const t = activeTournament;
    return (
      <div style={{ padding: "14px 14px 80px" }}>
        <button onClick={() => setActiveTournament(null)} style={{ background: "none", border: "none", color: "#0d7377", fontFamily: "inherit", fontSize: "0.88rem", fontWeight: 700, cursor: "pointer", marginBottom: 12, padding: 0 }}>← {lang === "ja" ? "大会一覧" : "All Tournaments"}</button>

        <div style={{ background: "#0d7377", borderRadius: 16, padding: 16, marginBottom: 12 }}>
          <div style={{ display: "inline-block", background: t.status === "live" ? "#74c69d" : "#555", color: t.status === "live" ? "#1a1a14" : "#74c69d", fontSize: "0.75rem", fontWeight: 800, padding: "3px 10px", borderRadius: 99, marginBottom: 8 }}>
            {t.status === "live" ? (lang === "ja" ? "🔴 開催中" : "🔴 LIVE") : (lang === "ja" ? "近日開催" : "UPCOMING")}
            {t.status === "live" && ` · ${lang === "ja" ? `参加者 ${t.participants}名` : `${t.participants} anglers`}`}
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#74c69d", marginBottom: 6 }}>{t.name[lang]}</div>
          <div style={{ fontSize: "0.82rem", color: "#aaa", marginBottom: 4 }}>📍 {t.location[lang]} · {t.period[lang]}</div>
          <div style={{ fontSize: "0.82rem", color: "#aaa", marginBottom: 4 }}>🎯 {t.target[lang]} · {t.rule[lang]}</div>
          <div style={{ fontSize: "0.88rem", color: "#74c69d", fontWeight: 700, marginTop: 8 }}>{t.prize[lang]}</div>
        </div>

        {t.status === "live" && !submitted && (
          <div style={{ background: "#e0f2f2", border: "2px solid #FFE500", borderRadius: 14, padding: 14, marginBottom: 12 }}>
            <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#0d7377", marginBottom: 10 }}>
              🎣 {lang === "ja" ? "釣果を提出する" : "Submit Your Catch"}
            </div>
            <input value={submitSpecies} onChange={e => setSubmitSpecies(e.target.value)} placeholder={lang === "ja" ? "魚種（例：アユ）" : "Species (e.g. Ayu)"} style={{ width: "100%", marginBottom: 8, background: "white", border: "2px solid #FFE500", borderRadius: 8, padding: "9px 12px", fontSize: "0.9rem", fontFamily: "inherit" }} />
            <input value={submitWeight} onChange={e => setSubmitWeight(e.target.value)} placeholder={lang === "ja" ? "重量（例：0.8kg）" : "Weight (e.g. 0.8kg)"} style={{ width: "100%", marginBottom: 10, background: "white", border: "2px solid #FFE500", borderRadius: 8, padding: "9px 12px", fontSize: "0.9rem", fontFamily: "inherit" }} />
            <button onClick={() => { if (submitWeight && submitSpecies) setSubmitted(true); }} style={{ width: "100%", padding: "11px", background: "#0d7377", border: "none", borderRadius: 10, color: "#74c69d", cursor: "pointer", fontFamily: "inherit", fontSize: "0.95rem", fontWeight: 800 }}>
              {lang === "ja" ? "📸 写真付きで提出" : "📸 Submit with Photo"}
            </button>
          </div>
        )}

        {submitted && (
          <div style={{ background: "#0d7377", border: "2px solid #FFE500", borderRadius: 14, padding: 14, marginBottom: 12, textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>🎉</div>
            <div style={{ fontWeight: 800, color: "#74c69d", marginBottom: 4 }}>{lang === "ja" ? "提出完了！" : "Submitted!"}</div>
            <div style={{ fontSize: "0.82rem", color: "#aaa" }}>{lang === "ja" ? "審査後にリーダーボードに反映されます" : "Will appear on leaderboard after review"}</div>
          </div>
        )}

        {t.leaderboard.length > 0 && (
          <>
            <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "#0d7377", marginBottom: 8, borderBottom: "2px solid #1a1a14", paddingBottom: 4 }}>
              🏅 {lang === "ja" ? "現在のランキング" : "Current Rankings"}
            </div>
            {t.leaderboard.map((entry, i) => (
              <div key={i} style={{ background: i === 0 ? "#e0f2f2" : "white", border: `1.5px solid ${i === 0 ? "#74c69d" : "#e0e0d8"}`, borderRadius: 10, padding: "10px 12px", marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: i === 0 ? "#74c69d" : i === 1 ? "#ddd" : i === 2 ? "#e0a060" : "#f5f0e8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.82rem", color: "#0d7377", flexShrink: 0 }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : entry.rank}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0d7377" }}>{entry.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "#888" }}>{entry.species}</div>
                </div>
                <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#0d7377" }}>{entry.weight}</div>
              </div>
            ))}
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: "14px 14px 80px" }}>
      <div style={{ background: "#0d7377", borderRadius: 14, padding: "12px 16px", marginBottom: 14, textAlign: "center" }}>
        <div style={{ color: "#74c69d", fontWeight: 900, fontSize: "1rem", marginBottom: 2 }}>🏆 マボカップ シリーズ</div>
        <div style={{ color: "#aaa", fontSize: "0.78rem" }}>{lang === "ja" ? "マボチャンネル主催の公式釣り大会" : "Official fishing tournaments by Mabo Channel"}</div>
      </div>

      {MABO_TOURNAMENTS.map(t => (
        t.rivalry ? (
          <div key={t.id} onClick={() => setActiveTournament(t)} style={{ background: "linear-gradient(135deg, #1a1a14, #2a1a00)", border: "2px solid #FFE500", borderRadius: 14, padding: "14px 16px", marginBottom: 10, cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ background: "#FFE500", color: "#1a1a14", fontSize: "0.72rem", fontWeight: 800, padding: "2px 8px", borderRadius: 99 }}>⚔️ {lang === "ja" ? "ライバル対決" : lang === "es" ? "RIVALIDAD" : "RIVALRY"}</span>
              <span style={{ color: "#FFE500", fontSize: "0.75rem" }}>🇵🇷 vs 🇯🇵</span>
            </div>
            <div style={{ fontWeight: 900, fontSize: "0.95rem", color: "#FFE500", marginBottom: 10 }}>{t.name[lang]}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.07)", borderRadius: 10, padding: "8px", textAlign: "center" }}>
                <div style={{ fontSize: "1.4rem" }}>🇵🇷</div>
                <div style={{ color: "white", fontWeight: 800, fontSize: "0.88rem" }}>Kevin</div>
                <div style={{ color: "#aaa", fontSize: "0.72rem", marginTop: 2 }}>{lang === "ja" ? "未記録" : lang === "es" ? "Sin captura" : "No catch yet"}</div>
              </div>
              <div style={{ color: "#FFE500", fontWeight: 900, fontSize: "1.3rem" }}>VS</div>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.07)", borderRadius: 10, padding: "8px", textAlign: "center" }}>
                <div style={{ fontSize: "1.4rem" }}>🇯🇵</div>
                <div style={{ color: "white", fontWeight: 800, fontSize: "0.88rem" }}>梁井</div>
                <div style={{ color: "#aaa", fontSize: "0.72rem", marginTop: 2 }}>{lang === "ja" ? "未記録" : "No catch yet"}</div>
              </div>
            </div>
            <div style={{ color: "#aaa", fontSize: "0.75rem", marginBottom: 8 }}>🏆 {t.prize[lang]}</div>
            <div style={{ background: "#FFE500", color: "#1a1a14", borderRadius: 8, padding: "7px", textAlign: "center", fontSize: "0.85rem", fontWeight: 800 }}>
              {lang === "ja" ? "釣果を提出して勝負！→" : lang === "es" ? "¡Envía tu captura y gana! →" : "Submit your catch & win! →"}
            </div>
          </div>
        ) : (
        <div key={t.id} onClick={() => setActiveTournament(t)} style={{ background: t.status === "live" ? "#1a1a14" : "white", border: `2px solid ${t.status === "live" ? "#74c69d" : "#e0e0d8"}`, borderRadius: 14, padding: "14px 16px", marginBottom: 10, cursor: "pointer" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <span style={{ background: t.status === "live" ? "#74c69d" : "#555", color: t.status === "live" ? "#1a1a14" : "#74c69d", fontSize: "0.72rem", fontWeight: 800, padding: "2px 8px", borderRadius: 99 }}>
              {t.status === "live" ? (lang === "ja" ? `🔴 開催中 · ${t.participants}名参加` : `🔴 LIVE · ${t.participants} anglers`) : (lang === "ja" ? "近日開催" : "UPCOMING")}
            </span>
          </div>
          <div style={{ fontWeight: 800, fontSize: "0.95rem", color: t.status === "live" ? "#74c69d" : "#1a1a14", marginBottom: 4 }}>{t.name[lang]}</div>
          <div style={{ fontSize: "0.78rem", color: t.status === "live" ? "#aaa" : "#888", marginBottom: 4 }}>📍 {t.location[lang]} · {t.period[lang]}</div>
          <div style={{ fontSize: "0.82rem", color: t.status === "live" ? "#74c69d" : "#2d7a3a", fontWeight: 700 }}>{t.prize[lang]}</div>
          <div style={{ marginTop: 10, background: t.status === "live" ? "#74c69d" : "#1a1a14", color: t.status === "live" ? "#1a1a14" : "#74c69d", borderRadius: 8, padding: "7px", textAlign: "center", fontSize: "0.85rem", fontWeight: 800 }}>
            {t.status === "live" ? (lang === "ja" ? "参加・詳細を見る →" : "Join & View Details →") : (lang === "ja" ? "詳細を見る →" : "View Details →")}
          </div>
        </div>
        )
      ))}
    </div>
  );
}

// ─── LINE SHARING ────────────────────────────────────────────────────────────
function shareToLINE(catch_, lang) {
  const text = lang === "ja"
    ? `🎣 釣れた！\n魚種: ${catch_.fish}\n重量: ${catch_.weight}\n場所: ${catch_.location}\n\n釣りナビPROで記録 → https://mabo-fly.vercel.app`
    : `🎣 Got one!\nSpecies: ${catch_.fish}\nWeight: ${catch_.weight}\nLocation: ${catch_.location}\n\nLogged on CastWise Japan → https://mabo-fly.vercel.app`;
  const url = `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}

function shareToTwitter(catch_, lang) {
  const text = lang === "ja"
    ? `🎣 ${catch_.fish} ${catch_.weight}を釣りました！📍${catch_.location} #釣りナビPRO #釣り #fishing`
    : `🎣 Caught a ${catch_.fish} weighing ${catch_.weight} at ${catch_.location}! #CastWiseJapan #fishing #Japan`;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}

// ─── PERSONAL RECORDS / TROPHY ROOM ─────────────────────────────────────────
function getTrophyRoom(catches) {
  const records = {};
  catches.forEach(c => {
    if (!c.fish || !c.weight) return;
    const weightNum = parseFloat(c.weight.replace(/[^0-9.]/g, ""));
    if (isNaN(weightNum)) return;
    if (!records[c.fish] || weightNum > records[c.fish].weight) {
      records[c.fish] = { ...c, weight: weightNum, weightStr: c.weight, date: c.date };
    }
  });
  return Object.values(records).sort((a, b) => b.weight - a.weight);
}

function TrophyRoom({ catches, lang, onSelectFish, FISH_DATA }) {
  const records = getTrophyRoom(catches);
  if (records.length === 0) return (
    <div style={{ textAlign: "center", padding: "40px 20px", color: "#5a5a4a" }}>
      <div style={{ fontSize: "3rem", marginBottom: 12 }}>🏆</div>
      <div style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: 8 }}>{lang === "ja" ? lang === "ja" ? lang === "ja" ? "まだ記録がありません" : "No records yet" : "No records yet" : "No records yet"}</div>
      <div style={{ fontSize: "0.9rem" }}>{lang === "ja" ? lang === "ja" ? lang === "ja" ? "釣果を記録すると自動的に最大記録が更新されます" : "Log catches to build your trophy room" : "Log catches to build your trophy room" : "Log catches to build your trophy room"}</div>
    </div>
  );
  return (
    <div>
      <div style={{ fontSize: "0.88rem", color: "#5a5a4a", marginBottom: 12 }}>
        {lang === "ja" ? lang === "ja" ? lang === "ja" ? `${records.length}魚種の自己記録` : `Personal records for ${records.length} species` : `Personal records for ${records.length} species` : `Personal records for ${records.length} species`}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {records.map((r, i) => {
          const fish = FISH_DATA.find(f => f.name === r.fish || f.nameEn === r.fish);
          return (
            <div key={r.fish} style={{ background: i === 0 ? "#fff8e8" : "#fffdf8", border: `2px solid ${i === 0 ? "#f0a020" : "#e0dbd0"}`, borderRadius: 14, padding: "12px 16px", display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ fontSize: "1.5rem", minWidth: 32, textAlign: "center" }}>
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🎣"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "1rem" }}>{r.fish}</div>
                <div style={{ fontSize: "0.82rem", color: "#5a5a4a" }}>📅 {r.date?.[lang] || r.date}</div>
                {r.location && <div style={{ fontSize: "0.78rem", color: "#7a7a6a" }}>📍 {r.location}</div>}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 900, fontSize: "1.2rem", color: i === 0 ? "#c06a10" : "#1a1a14" }}>⚖️ {r.weightStr}</div>
                <div style={{ fontSize: "0.75rem", color: "#9a9a8a" }}>{lang === "ja" ? lang === "ja" ? lang === "ja" ? "自己ベスト" : "Personal best" : "Personal best" : "Personal best"}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── TIDAL FISHING CALENDAR ───────────────────────────────────────────────────
function TidalCalendar({ lang, userLocation }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const lunarCycle = 29.53 * 24 * 60 * 60 * 1000;
  const knownNewMoon = new Date("2024-01-11").getTime();

  function getDayScore(day) {
    const date = new Date(year, month, day);
    const phase = ((date.getTime() - knownNewMoon) % lunarCycle) / lunarCycle;
    const dayOfWeek = date.getDay();
    let score = 60;
    // Full moon and new moon are best for fishing
    if (phase < 0.05 || phase > 0.95) score += 25; // new moon
    else if (phase > 0.45 && phase < 0.55) score += 20; // full moon
    else if (phase > 0.20 && phase < 0.30) score += 10; // first quarter
    else if (phase > 0.70 && phase < 0.80) score += 10; // last quarter
    // Weekend bonus
    if (dayOfWeek === 0 || dayOfWeek === 6) score += 5;
    return Math.min(99, score);
  }

  const monthNames = {
    ja: ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],
    en: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  };
  const dayNames = {
    ja: ["日","月","火","水","木","金","土"],
    en: ["S","M","T","W","T","F","S"]
  };

  // Find best days
  const dayScores = Array.from({length: daysInMonth}, (_, i) => ({ day: i+1, score: getDayScore(i+1) }));
  const bestDays = [...dayScores].sort((a,b) => b.score - a.score).slice(0, 5).map(d => d.day);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: "1.05rem" }}>🗓️ {monthNames[lang][month]} {year}</h3>
        <div style={{ fontSize: "0.82rem", color: "#0d7377" }}>{lang === "ja" ? lang === "ja" ? "月齢ベース釣り指数" : "Lunar fishing index" : "Lunar-based fishing index"}</div>
      </div>

      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, marginBottom: 3 }}>
        {dayNames[lang].map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: "0.75rem", color: i === 0 ? "#b82030" : i === 6 ? "#1565a0" : "#7a7a6a", fontWeight: 700, padding: "4px 0" }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
        {Array.from({length: firstDay}, (_, i) => <div key={`empty-${i}`} />)}
        {dayScores.map(({ day, score }) => {
          const isToday = day === now.getDate();
          const isBest = bestDays.includes(day);
          const bg = score >= 85 ? "#e0f2f2" : score >= 75 ? "#f8f0d0" : "#f5f0e8";
          const color = score >= 85 ? "#2d7a3a" : score >= 75 ? "#c06a10" : "#7a7a6a";
          return (
            <div key={day} style={{ background: isToday ? "#e0f2f2" : bg, border: `${isToday ? 2 : 1}px solid ${isToday ? "#1a1a14" : isBest ? "#a0d0a0" : "#e0dbd0"}`, borderRadius: 8, padding: "5px 2px", textAlign: "center", position: "relative" }}>
              {isBest && <div style={{ position: "absolute", top: 1, right: 2, fontSize: "0.55rem" }}>⭐</div>}
              <div style={{ fontSize: "0.8rem", fontWeight: isToday ? 900 : 400, color: isToday ? "#1a1a14" : "#1a1a14" }}>{day}</div>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, color }}>{score}</div>
            </div>
          );
        })}
      </div>

      {/* Best days summary */}
      <div style={{ marginTop: 14, background: "#e0f2f2", border: "2px solid #a0d0a0", borderRadius: 12, padding: "10px 14px" }}>
        <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#2d7a3a", marginBottom: 6 }}>
          ⭐ {lang === "ja" ? lang === "ja" ? "今月のベスト釣り日" : "Best fishing days this month" : "Best fishing days this month"}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {bestDays.sort((a,b)=>a-b).map(d => (
            <span key={d} style={{ background: "#2d7a3a", color: "white", borderRadius: 99, padding: "3px 10px", fontSize: "0.82rem", fontWeight: 700 }}>
              {monthNames[lang][month]}{d}日 ({getDayScore(d)})
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 8, fontSize: "0.75rem", color: "#9a9a8a", textAlign: "center" }}>
        {lang === "ja" ? lang === "ja" ? "※月齢・潮汐パターンに基づく推定値" : "Based on lunar & tidal patterns" : "Based on lunar cycle & tidal patterns"}
      </div>
    </div>
  );
}

// ─── FISHING JOURNAL ──────────────────────────────────────────────────────────
// Full trip notes beyond just catches
function useFishingJournal() {
  const [journal, setJournal] = useLocalStorage("mabo_journal", []);

  function addEntry(entry) {
    const newEntry = { ...entry, id: Date.now(), createdAt: Date.now() };
    setJournal(prev => [newEntry, ...prev]);
    return newEntry;
  }

  function deleteEntry(id) {
    setJournal(prev => prev.filter(e => e.id !== id));
  }

  return { journal, addEntry, deleteEntry };
}

// ─── TENKARA SPECIALIST MODE ──────────────────────────────────────────────────
const TENKARA_RODS = [
  { length: 3.0, target: { ja: "小渓流・源流", en: "Small streams & headwaters" }, line: "3.0〜3.3m", tip: { ja: "木が多い狭い渓流に最適。コントロール重視。", en: "Best for tight tree-lined streams. Precision over distance." } },
  { length: 3.3, target: { ja: "標準渓流", en: "Standard mountain streams" }, line: "3.3〜3.6m", tip: { ja: "最も汎用的なサイズ。迷ったらこれ。", en: "Most versatile size. Default choice for most Japanese streams." } },
  { length: 3.6, target: { ja: "中〜大渓流", en: "Medium to large streams" }, line: "3.6〜4.0m", tip: { ja: "開けた渓流で遠投が必要な時。", en: "When you need extra reach on open water." } },
  { length: 3.9, target: { ja: "大渓流・本流", en: "Large rivers & main stems" }, line: "4.0〜4.5m", tip: { ja: "本流のアユ・大型ヤマメに。腕力が必要。", en: "For main-stem ayu and large Yamame. Requires strong wrist." } },
  { length: 4.5, target: { ja: "本流・テンカラ遠投", en: "Long-line tenkara" }, line: "4.5〜5.0m", tip: { ja: "上級者向け。大型河川の対岸を狙う。", en: "Advanced only. Targeting far banks on large rivers." } },
];

const TENKARA_KNOTS = [
  { name: { ja: "テンカラ結び（ラインtoロッド）", en: "Tenkara Hitch (line to rod)" }, steps: { ja: ["ラインをリリアンに通す", "ループを作る", "ループの中にラインを通す", "きつく締める", "端を2〜3cm残してカット"], en: ["Thread line through lillian", "Form a loop", "Pass line end through loop", "Tighten firmly", "Leave 2–3cm tail and cut"] }, difficulty: "beginner" },
  { name: { ja: "フロロ結び（ラインtoティペット）", en: "Fluorocarbon Join" }, steps: { ja: ["ラインとティペットを20cm重ねる", "両方を一緒に輪にする", "輪の中に3〜4回通す", "両端を引いて締める", "余分をカット"], en: ["Overlap line and tippet 20cm", "Form loop with both", "Pass through loop 3–4 times", "Pull both ends to tighten", "Trim excess"] }, difficulty: "beginner" },
  { name: { ja: "ユニノット（毛鉤結び）", en: "Uni Knot (fly attachment)" }, steps: { ja: ["ティペットをフックアイに通す", "ティペットでループを作る", "ループの中に5〜6回巻く", "端を引いて締める", "アイに向けてスライド"], en: ["Thread tippet through hook eye", "Form loop with tippet", "Wrap through loop 5–6 times", "Pull end to tighten", "Slide knot to eye"] }, difficulty: "beginner" },
];

const LINE_FORMULA = {
  ja: "ライン長さ = 竿の長さ × 1.0〜1.3（源流は短め、開けた渓流は長め）",
  en: "Line length = Rod length × 1.0–1.3 (shorter for headwaters, longer for open streams)"
};


// Writes user location to Firestore every 2 minutes while app is open
// Each document expires after 10 minutes (checked client-side)
const ACTIVE_USER_TTL_MS = 10 * 60 * 1000; // 10 minutes
const LOCATION_UPDATE_INTERVAL = 2 * 60 * 1000; // 2 minutes

function useActiveUsers(db, userLocation, sharingEnabled, userId) {
  const [activeUsers, setActiveUsers] = useState([]);
  const intervalRef = useRef(null);

  // Write own location to Firestore
  async function writeLocation() {
    if (!sharingEnabled || !userLocation || !userId) return;
    try {
      await setDoc(doc(db, "activeUsers", userId), {
        lat: userLocation.lat,
        lng: userLocation.lng,
        display: userLocation.display || "",
        updatedAt: Date.now(),
        userId,
      });
    } catch (e) { console.warn("Location write failed:", e); }
  }

  // Remove own location on unmount
  async function removeLocation() {
    if (!userId) return;
    try { await deleteDoc(doc(db, "activeUsers", userId)); } catch (e) {}
  }

  useEffect(() => {
    if (!sharingEnabled || !userLocation) return;
    writeLocation();
    intervalRef.current = setInterval(writeLocation, LOCATION_UPDATE_INTERVAL);
    return () => {
      clearInterval(intervalRef.current);
      removeLocation();
    };
  }, [sharingEnabled, userLocation?.lat, userLocation?.lng]);

  // Listen to all active users
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "activeUsers"), (snap) => {
      const now = Date.now();
      const users = snap.docs
        .map(d => d.data())
        .filter(u => u.updatedAt && (now - u.updatedAt) < ACTIVE_USER_TTL_MS)
        .filter(u => u.userId !== userId); // exclude self
      setActiveUsers(users);
    });
    return () => unsub();
  }, [userId]);

  return activeUsers;
}

// Calculate crowding level at a spot based on nearby active users
function getCrowdingLevel(spotLat, spotLng, activeUsers) {
  const RADIUS_KM = 1.5;
  const nearby = activeUsers.filter(u => {
    if (!u.lat || !u.lng) return false;
    return distKm(spotLat, spotLng, u.lat, u.lng) <= RADIUS_KM;
  });
  const count = nearby.length;
  if (count >= 5) return { level: "crowded", color: "#b82030", glow: "0 0 16px rgba(184,32,48,0.7)", label: { ja: "🔴 混雑", en: "🔴 Crowded" }, count };
  if (count >= 2) return { level: "moderate", color: "#c06a10", glow: "0 0 12px rgba(192,106,16,0.5)", label: { ja: "🟠 普通", en: "🟠 Moderate" }, count };
  return { level: "quiet", color: "#2d7a3a", glow: "none", label: { ja: "🟢 空いてる", en: "🟢 Quiet" }, count };
}

// Generate a stable anonymous user ID stored in localStorage
function getOrCreateUserId() {
  let id = localStorage.getItem("mabo_uid");
  if (!id) {
    id = "user_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("mabo_uid", id);
  }
  return id;
}

// ─── REAL TIDE DATA ───────────────────────────────────────────────────────────
// Uses worldtides.info API — 10 free requests/day on free tier
// Falls back to lunar calculation if unavailable
function useRealTideData(userLocation) {
  const [tides, setTides] = useState([]);

  useEffect(() => {
    if (!userLocation) return;
    const { lat, lng } = userLocation;

    (async () => {
      try {
        // Try Open-Meteo marine API for wave/tide data (free, no key)
        const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&hourly=wave_height,swell_wave_height&timezone=auto&forecast_days=1`;
        const res = await fetch(url);
        const data = await res.json();

        // Build tide approximation from wave patterns + lunar cycle
        const now = new Date();
        const lunarCycle = 29.53 * 24 * 60 * 60 * 1000;
        const knownNewMoon = new Date("2024-01-11").getTime();
        const phase = ((now.getTime() - knownNewMoon) % lunarCycle) / lunarCycle;
        const baseHour = Math.round(phase * 24 * 2) % 12;

        const calculated = [];
        for (let i = 0; i < 4; i++) {
          const h = (baseHour + i * 6) % 24;
          const m = Math.floor((phase * 60 + i * 15) % 40);
          const isHigh = i % 2 === 0;
          // Use wave data to estimate tidal range if available
          const waveHeight = data?.hourly?.wave_height?.[h] || 0;
          const height = isHigh
            ? (1.2 + waveHeight * 0.3 + (phase < 0.5 ? 0.3 : 0)).toFixed(1)
            : (0.2 + waveHeight * 0.1).toFixed(1);
          calculated.push({
            time: `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`,
            type: isHigh ? "high" : "low",
            height,
            source: "marine",
          });
        }
        setTides(calculated.sort((a, b) => a.time.localeCompare(b.time)));
      } catch (err) {
        // Pure lunar fallback
        const now = new Date();
        const lunarCycle = 29.53 * 24 * 60 * 60 * 1000;
        const knownNewMoon = new Date("2024-01-11").getTime();
        const phase = ((now.getTime() - knownNewMoon) % lunarCycle) / lunarCycle;
        const baseHour = Math.round(phase * 24 * 2) % 12;
        const calculated = [];
        for (let i = 0; i < 4; i++) {
          const h = (baseHour + i * 6) % 24;
          const m = Math.floor((phase * 60 + i * 15) % 40);
          calculated.push({
            time: `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`,
            type: i % 2 === 0 ? "high" : "low",
            height: i % 2 === 0 ? (1.2 + Math.random() * 0.6).toFixed(1) : (0.2 + Math.random() * 0.3).toFixed(1),
            source: "lunar",
          });
        }
        setTides(calculated.sort((a, b) => a.time.localeCompare(b.time)));
      }
    })();
  }, [userLocation?.lat, userLocation?.lng]);

  return tides;
}



// ─── RIVER CONDITIONS ─────────────────────────────────────────────────────────
// Japan river monitoring — 国土交通省 川の防災情報
// Real API: https://www.river.go.jp/kawabou/reference/suii_api.html
const MONITORED_RIVERS = [
  { id: "river_nagara", name: { ja: "長良川（岐阜）", en: "Nagara River (Gifu)" }, station: "156061285501010", fish: ["アユ","ヤマメ"], idealLevel: "1.0〜2.5m" },
  { id: "river_kuma",   name: { ja: "球磨川（熊本）", en: "Kuma River (Kumamoto)" }, station: "205021285401010", fish: ["アユ","シーバス"], idealLevel: "0.8〜2.0m" },
  { id: "river_okutama",name: { ja: "奥多摩川（東京）", en: "Okutama River (Tokyo)" }, station: "306081285101010", fish: ["ヤマメ","イワナ"], idealLevel: "0.3〜0.8m" },
];

function useRiverConditions() {
  const [rivers, setRivers] = useState([]);

  useEffect(() => {
    // Simulate river data — real implementation would call 川の防災情報 API
    // API endpoint: https://www.river.go.jp/kawabou/ba/reference/suii
    const mockRivers = MONITORED_RIVERS.map(r => ({
      ...r,
      level: (0.5 + Math.random() * 2.5).toFixed(2),
      trend: ["rising","stable","falling"][Math.floor(Math.random()*3)],
      clarity: ["clear","slightly_cloudy","cloudy"][Math.floor(Math.random()*3)],
      temp: (8 + Math.random() * 14).toFixed(1),
      updatedAt: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
      fishable: Math.random() > 0.3,
    }));
    setRivers(mockRivers);

    // In production, poll every 30 minutes:
    // const iv = setInterval(fetchRealData, 30 * 60 * 1000);
    // return () => clearInterval(iv);
  }, []);

  return rivers;
}

// ─── OFFLINE MODE ─────────────────────────────────────────────────────────────
function useOfflineMode() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastOnline, setLastOnline] = useState(null);

  useEffect(() => {
    function handleOnline()  { setIsOnline(true);  setLastOnline(new Date()); }
    function handleOffline() { setIsOnline(false); }
    window.addEventListener("online",  handleOnline);
    window.addEventListener("offline", handleOffline);

    // Register service worker for offline caching
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    return () => {
      window.removeEventListener("online",  handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline, lastOnline };
}

// ─── PUSH NOTIFICATIONS ───────────────────────────────────────────────────────
async function requestNotificationPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  const result = await Notification.requestPermission();
  return result === "granted";
}

function sendFishingAlert(title, body) {
  if (Notification.permission !== "granted") return;
  new Notification(title, {
    body,
    icon: "/favicon.svg",
    badge: "/favicon.svg",
    tag: "fishing-alert",
  });
}

// Check conditions and fire notification if fishing index peaks
function useFishingAlerts(weather, userLocation, lang) {
  const alertedRef = useRef(false);

  useEffect(() => {
    if (!weather?.loaded || alertedRef.current) return;
    if (weather.fishingIndex >= 88) {
      alertedRef.current = true;
      requestNotificationPermission().then(granted => {
        if (granted) {
          sendFishingAlert(
            lang === "ja" ? "🔥 今が釣り日和！" : "🔥 Prime Fishing Conditions!",
            lang === "ja"
              ? `釣り指数 ${weather.fishingIndex}/100 — ${userLocation?.display || "現在地"}周辺が最高の状態です！`
              : `Fishing index ${weather.fishingIndex}/100 — Conditions are excellent near ${userLocation?.display || "your location"}!`
          );
        }
      });
    }
  }, [weather?.fishingIndex, weather?.loaded]);
}



// Hook that fetches real weather from Open-Meteo
function useRealWeather(userLocation) {
  const [weather, setWeather] = useState(WEATHER_FALLBACK);

  useEffect(() => {
    if (!userLocation) return;
    const { lat, lng } = userLocation;

    (async () => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
          `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,windspeed_10m,winddirection_10m,uv_index,surface_pressure` +
          `&hourly=temperature_2m,weather_code&daily=sunrise,sunset&timezone=auto&forecast_days=1` +
          `&models=jma_seamless`; // JMA model — best for Japan

        const res = await fetch(url);
        const d = await res.json();
        const c = d.current;
        const code = c.weather_code;
        const cond = wmoToCondition(code);
        const windspd = Math.round(c.windspeed_10m * 1000 / 3600 * 10) / 10; // km/h → m/s
        const windDirLabel = windDir(c.winddirection_10m, "ja");
        const windDirLabelEn = windDir(c.winddirection_10m, "en");
        const fi = calcFishingIndex(code, c.windspeed_10m, c.temperature_2m, true);
        const hourly = buildHourlySlots(d.hourly.time, d.hourly.temperature_2m, d.hourly.weather_code, lat);

        setWeather({
          temp: Math.round(c.temperature_2m),
          feels: Math.round(c.apparent_temperature),
          condition: { ja: cond.ja, en: cond.en },
          conditionIcon: cond.icon,
          humidity: c.relative_humidity_2m,
          wind: {
            ja: `${windDirLabel} ${windspd.toFixed(1)}m/s`,
            en: `${windDirLabelEn} ${windspd.toFixed(1)}m/s`,
          },
          fishingIndex: fi,
          moonPhase: { ja: moonPhaseEmoji("ja"), en: moonPhaseEmoji("en") },
          uvIndex: c.uv_index !== undefined ? Math.round(c.uv_index) : "－",
          waterTemp: null, // would need marine API
          waterClarity: { ja: "現地確認を", en: "Check locally" },
          flow: { ja: "現地確認を", en: "Check locally" },
          hourly,
          tides: [], // would need tide API
          loaded: true,
          lat, lng,
        });
      } catch (err) {
        console.warn("Weather fetch failed:", err);
        // Keep fallback but mark as attempted
        setWeather(w => ({ ...w, condition: { ja: "取得失敗", en: "Unavailable" }, loaded: true }));
      }
    })();
  }, [userLocation?.lat, userLocation?.lng]);

  return weather;
}

// ─── SPOT COORDINATES & DISTANCE ────────────────────────────────────────────
function distKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

const SPOT_COORDS = {
  "長良川（岐阜）":          { lat: 35.41,  lng: 136.72 },
  "奥多摩川（東京）":        { lat: 35.79,  lng: 139.09 },
  "神流川（群馬）":          { lat: 36.25,  lng: 138.95 },
  "四万十川（高知）":        { lat: 33.09,  lng: 132.93 },
  "琵琶湖（滋賀）":          { lat: 35.27,  lng: 136.07 },
  "亀山ダム（千葉）":        { lat: 35.23,  lng: 140.05 },
  "相模湖（神奈川）":        { lat: 35.62,  lng: 139.16 },
  "球磨川（熊本）":          { lat: 32.48,  lng: 130.71 },
  "只見川（福島）":          { lat: 37.34,  lng: 139.23 },
  "庄川（富山）":            { lat: 36.56,  lng: 137.05 },
  "東京湾・運河エリア":      { lat: 35.63,  lng: 139.78 },
  "大阪湾・尼崎運河":        { lat: 34.72,  lng: 135.41 },
  "多摩川河口（神奈川）":    { lat: 35.55,  lng: 139.75 },
  "早川（山梨・南アルプス）":{ lat: 35.45,  lng: 138.38 },
  "只見川源流（福島）":      { lat: 37.20,  lng: 139.05 },
  "黒部川（富山）":          { lat: 36.88,  lng: 137.62 },
  "明石海峡（兵庫）":        { lat: 34.62,  lng: 135.01 },
  "三河湾（愛知）":          { lat: 34.75,  lng: 137.11 },
  "若狭湾（福井）":          { lat: 35.57,  lng: 135.77 },
  "真鶴港（神奈川）":        { lat: 35.32,  lng: 139.13 },
  "和歌山・雑賀崎":          { lat: 34.20,  lng: 135.15 },
  "長崎・野母崎":            { lat: 32.58,  lng: 129.75 },
  "九十九里浜（千葉）":      { lat: 35.59,  lng: 140.42 },
  "鹿島灘（茨城）":          { lat: 36.14,  lng: 140.66 },
  "遠州灘（静岡）":          { lat: 34.70,  lng: 137.84 },
  "亀山湖（千葉）":          { lat: 35.23,  lng: 140.05 },
  "印旛沼（千葉）":          { lat: 35.73,  lng: 140.20 },
  "霞ヶ浦（茨城）":          { lat: 36.02,  lng: 140.39 },
  "利根川（千葉/茨城）":     { lat: 35.87,  lng: 140.60 },
  "河口湖（山梨）":          { lat: 35.50,  lng: 138.75 },
  "日光・中禅寺湖（栃木）":  { lat: 36.74,  lng: 139.48 },
  "忍野八海（山梨）":        { lat: 35.46,  lng: 138.85 },
  "芦ノ湖（神奈川）":        { lat: 35.19,  lng: 139.02 },
  "佐賀・唐津沖":            { lat: 33.45,  lng: 129.97 },
  "三重・英虞湾":            { lat: 34.30,  lng: 136.85 },
  "高知・室戸岬":            { lat: 33.25,  lng: 134.16 },
  "富山湾（富山）":          { lat: 36.80,  lng: 137.20 },
  "鳥取・境港沖":            { lat: 35.54,  lng: 133.23 },
  "長崎・壱岐沖":            { lat: 33.75,  lng: 129.69 },
  "神奈川・三浦半島磯":      { lat: 35.13,  lng: 139.62 },
  "和歌山・白浜磯":          { lat: 33.68,  lng: 135.37 },
  "長崎・五島列島":          { lat: 32.70,  lng: 128.84 },
  "大分・蒲江地磯":          { lat: 32.78,  lng: 132.00 },
  "高知・足摺岬":            { lat: 32.73,  lng: 132.98 },
  "静岡・御前崎":            { lat: 34.60,  lng: 138.22 },
  "横浜港・山下ふ頭":        { lat: 35.44,  lng: 139.65 },
  "神戸港・ポートアイランド":{ lat: 34.67,  lng: 135.20 },
  "松山港（愛媛）":          { lat: 33.85,  lng: 132.70 },
  "隅田川水門":              { lat: 35.694, lng: 139.803 },
  "お台場海浜公園":          { lat: 35.627, lng: 139.775 },
  "荒川・葛西水門":          { lat: 35.652, lng: 139.862 },
  "多摩川・丸子橋":          { lat: 35.578, lng: 139.670 },
  "奥多摩川・白丸":          { lat: 35.793, lng: 139.093 },
  "琵琶湖・南湖":            { lat: 35.100, lng: 135.920 },
  "明石海峡":                { lat: 34.618, lng: 135.012 },
  "長良川（岐阜）":          { lat: 35.410, lng: 136.720 },
  // Kyushu spots
  "北山湖（佐賀）":          { lat: 33.43,  lng: 130.18 },
  "伊万里湾":                { lat: 33.27,  lng: 129.88 },
  "七山渓流（佐賀）":        { lat: 33.49,  lng: 130.02 },
  "玄界灘（佐賀側）":        { lat: 33.60,  lng: 130.05 },
  "博多湾・シーサイドももち":{ lat: 33.59,  lng: 130.35 },
  "玄界島・能古島周辺":      { lat: 33.65,  lng: 130.22 },
  "福岡市海釣り公園":        { lat: 33.58,  lng: 130.27 },
  "今津湾・室見川河口":      { lat: 33.56,  lng: 130.31 },
  "糸島・二丈周辺磯":        { lat: 33.53,  lng: 130.18 },
  "遠賀川（北九州）":        { lat: 33.87,  lng: 130.66 },
  "長崎・五島列島":          { lat: 32.70,  lng: 128.84 },
  "長崎・壱岐沖":            { lat: 33.75,  lng: 129.69 },
  "長崎・野母崎":            { lat: 32.58,  lng: 129.75 },
  "対馬":                    { lat: 34.20,  lng: 129.29 },
  "天草・牛深":              { lat: 32.19,  lng: 130.03 },
  "緑川・加勢川（熊本）":    { lat: 32.73,  lng: 130.72 },
  "大分・蒲江地磯":          { lat: 32.78,  lng: 132.00 },
  "別府湾・臼杵湾":          { lat: 33.22,  lng: 131.62 },
  "大分・姫島":              { lat: 33.72,  lng: 131.65 },
  "日向灘・延岡沖":          { lat: 32.58,  lng: 131.66 },
  "高千穂・五ヶ瀬川":        { lat: 32.71,  lng: 131.30 },
  "宮崎・木崎浜サーフ":      { lat: 31.88,  lng: 131.44 },
  "錦江湾（鹿児島）":        { lat: 31.40,  lng: 130.67 },
  "屋久島":                  { lat: 30.35,  lng: 130.64 },
  "甑島（薩摩川内）":        { lat: 31.80,  lng: 129.84 },
  // Hokkaido
  "知床半島・羅臼沖":        { lat: 44.02,  lng: 145.00 },
  "支笏湖（北海道）":        { lat: 42.75,  lng: 141.35 },
  "阿寒川（北海道）":        { lat: 43.45,  lng: 144.13 },
  "十勝川（北海道）":        { lat: 42.80,  lng: 143.10 },
  // Kanto
  "東京湾・竹芝周辺":        { lat: 35.655, lng: 139.763 },
  "芦ノ湖（神奈川）":        { lat: 35.19,  lng: 139.02 },
  "矢部川（八女）":           { lat: 33.21,  lng: 130.71 },
  "嘉瀬川・大和町（上流）":     { lat: 33.35,  lng: 130.28 },
  "嘉瀬川・佐賀市中流":         { lat: 33.28,  lng: 130.30 },
  "六角川・武雄市橋下":         { lat: 33.19,  lng: 130.01 },
  "牛津川・小城市":             { lat: 33.27,  lng: 130.20 },
  "城原川・神埼市":             { lat: 33.42,  lng: 130.38 },
  "筑後川・鳥栖市（基山橋）":   { lat: 33.37,  lng: 130.51 },
  "筑後川・久留米市（合川橋）": { lat: 33.32,  lng: 130.51 },
  "矢部川・黒木町（上流部）":   { lat: 33.24,  lng: 130.68 },
  "矢部川・瀬高（中流域）":     { lat: 33.17,  lng: 130.59 },
  "星野川・八女市星野村":       { lat: 33.20,  lng: 130.77 },
  "山田川・八女市上陽町":       { lat: 33.22,  lng: 130.64 },
  "遠賀川・直方市":             { lat: 33.74,  lng: 130.73 },
  "今川・行橋市（豊前海）":     { lat: 33.72,  lng: 130.98 },
  "大村湾・諫早（西岸）":       { lat: 32.84,  lng: 130.02 },
  "五島列島・福江島（磯釣り）": { lat: 32.69,  lng: 128.84 },
  "緑川・美里町（上流）":       { lat: 32.65,  lng: 130.79 },
  "球磨川・人吉市（本流）":     { lat: 32.21,  lng: 130.76 },
  "Lago Dos Bocas":          { lat: 18.35,  lng: -66.72 },
  "Lago Carite":             { lat: 18.07,  lng: -66.12 },
  "Laguna Tortuguero":       { lat: 18.46,  lng: -66.47 },
  "Boca de Cangrejos":       { lat: 18.45,  lng: -66.02 },
  "La Parguera":             { lat: 17.97,  lng: -67.04 },
  "Río Grande de Arecibo":   { lat: 18.27,  lng: -66.70 },
  "Culebra Island":          { lat: 18.30,  lng: -65.30 },
  "Vieques - Red Beach Flats":          { lat: 18.09, lng: -65.44 },
  "Vieques - Mosquito Pier (旧海軍桟橋)": { lat: 18.15, lng: -65.44 },
  "Vieques - Blue Beach (東端)":         { lat: 18.103, lng: -65.384 },
  "Vieques - Bioluminescent Bay (カヤック釣り)": { lat: 18.09, lng: -65.47 },
  "Vieques - North Shore Reef":          { lat: 18.16, lng: -65.44 },
  "Vieques - Offshore (カジキ・マヒマヒ)": { lat: 18.05, lng: -65.20 },
  "Vieques - Esperanza (夕方タリポン)":   { lat: 18.09, lng: -65.47 },
  "Culebra - Flamenco Beach Flats":      { lat: 18.34, lng: -65.31 },
  "Culebra - Luis Peña Channel":         { lat: 18.31, lng: -65.34 },
  "Fajardo - Las Croabas Flats":         { lat: 18.33, lng: -65.63 },
  "Fajardo - Seven Seas Beach":          { lat: 18.37, lng: -65.62 },
  "Ceiba - Roosevelt Roads (旧米海軍基地)": { lat: 18.24, lng: -65.64 },
  "Humacao Nature Reserve":              { lat: 18.15, lng: -65.77 },
  // Other
  "長良川（岐阜・友釣り）":  { lat: 35.41,  lng: 136.72 },
  "琵琶湖（滋賀）":          { lat: 35.27,  lng: 136.07 },
};

const MAP_SPOTS = [
  // ── SAGA ──────────────────────────────────────────────────────────────────
  { id: 1,  name: "佐賀・唐津沖",        region: "kyushu", pref: "佐賀", fish: { ja: "アオリイカ・マダイ", en: "Squid & Red Bream" }, rating: 5.0, type: { ja: "沿岸・ボート", en: "Coast/Boat" }, icon: "🦑", lat: 33.45, lng: 129.97, bestSeason: { ja: "春・秋", en: "Spring & Autumn" }, access: { ja: "唐津港から出船", en: "Charter from Karatsu Port" }, tip: { ja: "エギ3.5号ピンクが唐津の定番。春の親イカは2kgオーバーも。", en: "Pink egi #3.5 is standard at Karatsu. Spring spawning squid often exceed 2kg." } },
  { id: 2,  name: "北山湖（佐賀）",      region: "kyushu", pref: "佐賀", fish: { ja: "ブラックバス・ヘラブナ", en: "Bass & Herabuna" }, rating: 4.8, type: { ja: "ダム湖", en: "Reservoir" }, icon: "🐟", lat: 33.43, lng: 130.18, bestSeason: { ja: "春・秋", en: "Spring & Autumn" }, access: { ja: "佐賀市内から車30分。レンタルボートあり。", en: "30min drive from Saga city. Rental boats available." }, tip: { ja: "九州屈指のバス釣り場。春のスポーニング期は岸から大型が狙える。", en: "One of Kyushu's top bass spots. Big fish from shore during spring spawn." } },
  { id: 3,  name: "伊万里湾",            region: "kyushu", pref: "佐賀", fish: { ja: "クロダイ・メバル・カサゴ", en: "Black Bream & Rockfish" }, rating: 4.6, type: { ja: "湾・磯", en: "Bay & Rock" }, icon: "🐟", lat: 33.27, lng: 129.88, bestSeason: { ja: "通年", en: "Year-round" }, access: { ja: "伊万里市内から車15分", en: "15min drive from Imari city" }, tip: { ja: "湾内の牡蠣棚周りにクロダイが多い。フカセ釣りで数釣り可能。", en: "Black bream stack around oyster farms in the bay. Float fishing yields numbers." } },
  { id: 4,  name: "七山渓流（佐賀）",    region: "kyushu", pref: "佐賀", fish: { ja: "ヤマメ・イワナ", en: "Yamame & Iwana" }, rating: 4.7, type: { ja: "渓流", en: "Mountain Stream" }, icon: "🪶", lat: 33.49, lng: 130.02, bestSeason: { ja: "3〜9月", en: "Mar–Sep" }, access: { ja: "唐津市七山地区。遊漁券要（¥1,500/日）", en: "Karatsu city, Shichiyama area. Permit required (¥1,500/day)" }, tip: { ja: "九州では数少ないヤマメの渓流。早朝のドライフライが最高。", en: "One of Kyushu's rare Yamame streams. Early morning dry fly fishing is excellent." } },
  { id: 5,  name: "玄界灘（佐賀側）",   region: "kyushu", pref: "佐賀", fish: { ja: "ブリ・ヒラマサ・マダイ", en: "Yellowtail & Red Bream" }, rating: 4.9, type: { ja: "沖合", en: "Offshore" }, icon: "🦈", lat: 33.60, lng: 130.05, bestSeason: { ja: "秋〜冬", en: "Autumn–Winter" }, access: { ja: "呼子港・唐津港から出船。遊漁船多数。", en: "Charter from Yobuko or Karatsu Port. Many charter boats available." }, tip: { ja: "玄界灘の青物は日本屈指の引き。ジギング・タイラバ両方使える。", en: "Genkai Sea pelagics are among Japan's strongest fighters. Both jigging and taira work." } },

  // ── FUKUOKA ───────────────────────────────────────────────────────────────
  { id: 6,  name: "博多湾・シーサイドももち", region: "kyushu", pref: "福岡", fish: { ja: "シーバス・チヌ", en: "Seabass & Black Bream" }, rating: 4.5, type: { ja: "港湾・護岸", en: "Harbor" }, icon: "🦈", lat: 33.59, lng: 130.35, bestSeason: { ja: "春・秋", en: "Spring & Autumn" }, access: { ja: "福岡市内。地下鉄唐人町駅から徒歩15分", en: "Fukuoka city. 15min walk from Tojinmachi subway station" }, tip: { ja: "夜の常夜灯周りにシーバスが集まる。バチパターンは3〜4月が最盛。", en: "Seabass gather under harbor lights at night. Worm hatch pattern peaks March–April." } },
  { id: 7,  name: "玄界島・能古島周辺",  region: "kyushu", pref: "福岡", fish: { ja: "アジ・メバル・クロ", en: "Mackerel & Rockfish" }, rating: 4.7, type: { ja: "離島・磯", en: "Island Shore" }, icon: "🐟", lat: 33.65, lng: 130.22, bestSeason: { ja: "通年", en: "Year-round" }, access: { ja: "姪浜港からフェリー（能古島20分・玄界島40分）", en: "Ferry from Meinohama Port (20min to Nokonoshima, 40min to Genkaijima)" }, tip: { ja: "能古島は家族でも楽しめる。玄界島の磯はクロ（メジナ）の名ポイント。", en: "Nokonoshima suits families. Genkaijima rocky shores are famous for Mejina." } },
  { id: 8,  name: "福岡市海釣り公園",    region: "kyushu", pref: "福岡", fish: { ja: "アジ・サバ・チヌ", en: "Mackerel & Bream" }, rating: 4.4, type: { ja: "管理釣り場", en: "Managed Fishery" }, icon: "🎣", lat: 33.58, lng: 130.27, bestSeason: { ja: "通年", en: "Year-round" }, access: { ja: "福岡市西区。料金：大人¥1,000/4時間", en: "Nishi-ku, Fukuoka. Fee: ¥1,000/4hrs adults" }, tip: { ja: "初心者・ファミリーに最適。道具レンタルあり。指導スタッフ常駐。", en: "Perfect for beginners and families. Gear rental and on-site instruction available." } },
  { id: 9,  name: "今津湾・室見川河口",  region: "kyushu", pref: "福岡", fish: { ja: "シーバス・ヒラメ", en: "Seabass & Flounder" }, rating: 4.6, type: { ja: "河口・干潟", en: "Estuary & Mudflat" }, icon: "🦈", lat: 33.56, lng: 130.31, bestSeason: { ja: "秋〜冬", en: "Autumn–Winter" }, access: { ja: "福岡市西区。JR今宿駅から車10分", en: "Nishi-ku, Fukuoka. 10min from JR Imajuku Station" }, tip: { ja: "干潟のヒラメは満潮前後2時間が狙い目。シンキングミノーをスロー引き。", en: "Flounder hit for 2hrs either side of high tide. Slow-retrieve sinking minnow." } },
  { id: 10, name: "糸島・二丈周辺磯",    region: "kyushu", pref: "福岡", fish: { ja: "クロダイ・メジナ・アオリイカ", en: "Bream & Squid" }, rating: 4.8, type: { ja: "磯", en: "Rocky Shore" }, icon: "🐟", lat: 33.53, lng: 130.18, bestSeason: { ja: "通年（秋が最盛）", en: "Year-round (peak autumn)" }, access: { ja: "JR筑前前原駅から車20分", en: "20min drive from JR Chikuzen-Maebaru Station" }, tip: { ja: "イカメタルとエギングで秋のアオリが炸裂。磯クロは冬も通じる。", en: "Egi and ikametal for autumn squid explosions. Shore Mejina fishes well through winter." } },
  { id: 11, name: "遠賀川（北九州）",    region: "kyushu", pref: "福岡", fish: { ja: "シーバス・バス", en: "Seabass & Bass" }, rating: 4.5, type: { ja: "河川", en: "River" }, icon: "🦈", lat: 33.87, lng: 130.66, bestSeason: { ja: "春〜秋", en: "Spring–Autumn" }, access: { ja: "北九州市〜中間市。各橋梁から徒歩アクセス可", en: "Kitakyushu to Nakama. Walkable from major bridges" }, tip: { ja: "河口から30kmにわたりシーバスが入る。橋脚明暗部が最重要ポイント。", en: "Seabass run 30km upstream. Bridge shadow edges are prime." } },

  // ── NAGASAKI ──────────────────────────────────────────────────────────────
  { id: 12, name: "長崎・五島列島",       region: "kyushu", pref: "長崎", fish: { ja: "クロ・マダイ・ヒラマサ", en: "Mejina, Bream & Amberjack" }, rating: 5.0, type: { ja: "離島磯", en: "Remote Island Shore" }, icon: "🐟", lat: 32.70, lng: 128.84, bestSeason: { ja: "秋〜春", en: "Autumn–Spring" }, access: { ja: "長崎港からフェリー（福江島まで3時間30分）", en: "Ferry from Nagasaki Port (3.5hrs to Fukue Island)" }, tip: { ja: "日本の磯釣り聖地。クロ（メジナ）の全国大会も開催される。渡船要予約。", en: "Japan's rock fishing mecca. National Mejina tournaments held here. Charter boat essential." } },
  { id: 13, name: "長崎・壱岐沖",         region: "kyushu", pref: "長崎", fish: { ja: "ブリ・ヒラマサ・マグロ", en: "Yellowtail & Bluefin Tuna" }, rating: 4.9, type: { ja: "沖合", en: "Offshore" }, icon: "🦈", lat: 33.75, lng: 129.69, bestSeason: { ja: "夏〜秋", en: "Summer–Autumn" }, access: { ja: "郷ノ浦港・印通寺港から出船", en: "Charter from Gonoura or Intoji Port" }, tip: { ja: "壱岐沖のクロマグロは国際的に有名。ジギングで100kg超も。", en: "Iki's bluefin tuna fishing is world-famous. 100kg+ fish on jigs is not uncommon." } },
  { id: 14, name: "長崎・野母崎",          region: "kyushu", pref: "長崎", fish: { ja: "アオリイカ・根魚", en: "Squid & Rockfish" }, rating: 4.8, type: { ja: "磯・地磯", en: "Shore Reef" }, icon: "🦑", lat: 32.58, lng: 129.75, bestSeason: { ja: "春・秋", en: "Spring & Autumn" }, access: { ja: "長崎市内から車40分。無料駐車場あり。", en: "40min drive from Nagasaki city. Free parking." }, tip: { ja: "長崎市最南端の地磯。エギング春のアオリが大型。カサゴ・キジハタも豊富。", en: "Nagasaki's southernmost shore reef. Big spring squid. Also excellent for grouper." } },
  { id: 15, name: "対馬",                  region: "kyushu", pref: "長崎", fish: { ja: "ヒラマサ・クロ・ヤリイカ", en: "Amberjack & Mejina" }, rating: 5.0, type: { ja: "離島磯・沖合", en: "Remote Island" }, icon: "🦈", lat: 34.20, lng: 129.29, bestSeason: { ja: "春〜秋", en: "Spring–Autumn" }, access: { ja: "長崎港からフェリー（厳原まで6時間）", en: "Ferry from Nagasaki Port (6hrs to Izuhara)" }, tip: { ja: "日本海の孤島で超大型ヒラマサが狙える。10kgオーバーも珍しくない。", en: "Remote Japan Sea island for giant Hiramasa amberjack. 10kg+ is not unusual." } },

  // ── KUMAMOTO ──────────────────────────────────────────────────────────────
  { id: 16, name: "球磨川（熊本）",        region: "kyushu", pref: "熊本", fish: { ja: "アユ・シーバス", en: "Ayu & Seabass" }, rating: 5.0, type: { ja: "清流・河川", en: "River" }, icon: "🐠", lat: 32.48, lng: 130.71, bestSeason: { ja: "6〜10月（アユ）", en: "Jun–Oct (Ayu)" }, access: { ja: "人吉・八代市内各所から徒歩アクセス可", en: "Walk-in access from Hitoyoshi and Yatsushiro city" }, tip: { ja: "日本三大急流のひとつ。友釣りの名川。上流は清流、下流はシーバス。", en: "One of Japan's three great rapid rivers. Famous for tomozuri ayu. Seabass in lower reaches." } },
  { id: 17, name: "天草・牛深",            region: "kyushu", pref: "熊本", fish: { ja: "マダイ・アオリイカ・根魚", en: "Bream, Squid & Grouper" }, rating: 4.9, type: { ja: "離島磯・沿岸", en: "Island & Coast" }, icon: "🐟", lat: 32.19, lng: 130.03, bestSeason: { ja: "通年（秋が最盛）", en: "Year-round (peak autumn)" }, access: { ja: "熊本市内から車2時間。天草四郎シティから渡船", en: "2hrs drive from Kumamoto city. Charter from Amakusa" }, tip: { ja: "天草の海は魚影が濃い。イシグロ・アラなどの高級根魚も多数。", en: "Amakusa seas are fish-dense. Prized grouper species including Ishiguroi and Ara." } },
  { id: 18, name: "緑川・加勢川（熊本）", region: "kyushu", pref: "熊本", fish: { ja: "シーバス・バス", en: "Seabass & Bass" }, rating: 4.4, type: { ja: "河川", en: "River" }, icon: "🦈", lat: 32.73, lng: 130.72, bestSeason: { ja: "春〜秋", en: "Spring–Autumn" }, access: { ja: "熊本市内。各橋梁から徒歩アクセス可", en: "Kumamoto city. Walk-in from major bridges" }, tip: { ja: "市街地に近く通いやすい。春のバチパターンはシーバスが爆発する。", en: "Convenient city access. Worm hatch pattern triggers seabass explosions in spring." } },

  // ── OITA ──────────────────────────────────────────────────────────────────
  { id: 19, name: "大分・蒲江地磯",        region: "kyushu", pref: "大分", fish: { ja: "ハマチ・ブリ・ヒラスズキ", en: "Yellowtail & Shore Seabass" }, rating: 5.0, type: { ja: "地磯", en: "Shore Reef" }, icon: "🦈", lat: 32.78, lng: 132.00, bestSeason: { ja: "夏〜秋", en: "Summer–Autumn" }, access: { ja: "佐伯市蒲江町。国道388号沿い各地磯へ徒歩アクセス", en: "Kamae, Saiki city. Walk-in from Rte 388 to various shore reefs" }, tip: { ja: "九州ショアジギングの聖地。夜明けの一投が全て。100gジグを全力投入。", en: "Kyushu shore jigging mecca. The first cast at dawn is everything. 100g jig, max distance." } },
  { id: 20, name: "別府湾・臼杵湾",        region: "kyushu", pref: "大分", fish: { ja: "マダイ・チヌ・ヒラメ", en: "Red Bream & Flounder" }, rating: 4.6, type: { ja: "湾・サーフ", en: "Bay & Surf" }, icon: "🐟", lat: 33.22, lng: 131.62, bestSeason: { ja: "春・秋", en: "Spring & Autumn" }, access: { ja: "大分市・別府市各港から出船", en: "Charter boats from Oita and Beppu ports" }, tip: { ja: "タイラバで大型マダイが狙える。テトラ帯のチヌはウキフカセで。", en: "Large red bream on taira rigs. Float fishing for Black Bream around tetrapods." } },
  { id: 21, name: "大分・姫島",            region: "kyushu", pref: "大分", fish: { ja: "アオリイカ・クロ", en: "Squid & Mejina" }, rating: 4.8, type: { ja: "離島", en: "Island" }, icon: "🦑", lat: 33.72, lng: 131.65, bestSeason: { ja: "春・秋", en: "Spring & Autumn" }, access: { ja: "伊美港からフェリー15分", en: "15min ferry from Imi Port" }, tip: { ja: "透明度抜群の海でエギングが楽しめる。磯クロも人気。早めの予約推奨。", en: "Crystal clear water for eging. Shore Mejina also popular. Book accommodation early." } },

  // ── MIYAZAKI ──────────────────────────────────────────────────────────────
  { id: 22, name: "日向灘・延岡沖",        region: "kyushu", pref: "宮崎", fish: { ja: "カンパチ・ブリ・マグロ", en: "Amberjack & Tuna" }, rating: 4.9, type: { ja: "沖合", en: "Offshore" }, icon: "🦈", lat: 32.58, lng: 131.66, bestSeason: { ja: "夏〜秋", en: "Summer–Autumn" }, access: { ja: "延岡市内各港から出船。遊漁船多数。", en: "Multiple charter boats from Nobeoka city ports" }, tip: { ja: "日向灘はカンパチの一級ポイント。深場の大型ジギングが主流。", en: "Hyuga-nada Sea is prime for large Kanpachi. Deep jigging for large specimens." } },
  { id: 23, name: "高千穂・五ヶ瀬川",      region: "kyushu", pref: "宮崎", fish: { ja: "ヤマメ・アユ", en: "Yamame & Ayu" }, rating: 4.8, type: { ja: "渓流・清流", en: "Mountain Stream" }, icon: "🪶", lat: 32.71, lng: 131.30, bestSeason: { ja: "3〜10月", en: "Mar–Oct" }, access: { ja: "高千穂峡付近。遊漁券要（漁協で購入）", en: "Near Takachiho Gorge. Permit required (buy from fishing cooperative)" }, tip: { ja: "神話の里の清流でヤマメが釣れる感動。テンカラも楽しめる。", en: "Catch Yamame in the legendary waters of Takachiho. Tenkara is also excellent here." } },
  { id: 24, name: "宮崎・木崎浜サーフ",   region: "kyushu", pref: "宮崎", fish: { ja: "ヒラメ・青物", en: "Flounder & Pelagics" }, rating: 4.7, type: { ja: "サーフ", en: "Surf" }, icon: "🏄", lat: 31.88, lng: 131.44, bestSeason: { ja: "秋〜冬", en: "Autumn–Winter" }, access: { ja: "宮崎市内から車30分。駐車場完備。", en: "30min drive from Miyazaki city. Parking available." }, tip: { ja: "宮崎サーフの代名詞。ヒラメの実績が高い。離岸流を丁寧に探すこと。", en: "The icon of Miyazaki surf fishing. High track record for Flounder. Hunt rip currents carefully." } },

  // ── KAGOSHIMA ─────────────────────────────────────────────────────────────
  { id: 25, name: "錦江湾（鹿児島）",      region: "kyushu", pref: "鹿児島", fish: { ja: "ブリ・カンパチ・マダイ", en: "Yellowtail & Red Bream" }, rating: 4.8, type: { ja: "湾・沖合", en: "Bay & Offshore" }, icon: "🦈", lat: 31.40, lng: 130.67, bestSeason: { ja: "秋〜冬", en: "Autumn–Winter" }, access: { ja: "鹿児島市内各港から出船", en: "Charter from Kagoshima city ports" }, tip: { ja: "桜島を背景に竿を出す絶景ポイント。カンパチは60〜80cm級も。", en: "Fish with Sakurajima volcano as your backdrop. Kanpachi to 60–80cm regularly taken." } },
  { id: 26, name: "屋久島",                region: "kyushu", pref: "鹿児島", fish: { ja: "GT・カスミアジ・シイラ", en: "Giant Trevally & Mahi-Mahi" }, rating: 5.0, type: { ja: "離島・沖合", en: "Remote Island" }, icon: "🦈", lat: 30.35, lng: 130.64, bestSeason: { ja: "夏〜秋", en: "Summer–Autumn" }, access: { ja: "鹿児島港からフェリー4時間 or 飛行機35分", en: "4hr ferry or 35min flight from Kagoshima" }, tip: { ja: "GTを含むトロピカル系の大型魚が狙える。ポッパーへの炸裂バイトが迫力満点。", en: "Target GT and tropical species. Topwater popper strikes are explosive and powerful." } },
  { id: 27, name: "甑島（薩摩川内）",      region: "kyushu", pref: "鹿児島", fish: { ja: "ヒラマサ・クロ・アオリイカ", en: "Amberjack & Mejina" }, rating: 5.0, type: { ja: "離島磯", en: "Remote Island Shore" }, icon: "🐟", lat: 31.80, lng: 129.84, bestSeason: { ja: "春〜秋", en: "Spring–Autumn" }, access: { ja: "川内港からフェリー2時間30分", en: "2.5hr ferry from Sendai Port" }, tip: { ja: "ヒラマサの磯釣りで全国的に有名。10kgオーバーが普通に出る夢の磯。", en: "Nationally famous for shore-caught Hiramasa amberjack. 10kg+ are regularly taken." } },

  // ── HOKKAIDO ──────────────────────────────────────────────────────────────
  { id: 28, name: "知床半島・羅臼沖",      region: "hokkaido", pref: "北海道", fish: { ja: "カラフトマス・カジキ・ヒラメ", en: "Pink Salmon & Marlin" }, rating: 5.0, type: { ja: "沖合・磯", en: "Offshore & Shore" }, icon: "🐠", lat: 44.02, lng: 145.00, bestSeason: { ja: "夏〜秋", en: "Summer–Autumn" }, access: { ja: "羅臼港から各種遊漁船。世界自然遺産内。", en: "Charter from Rausu Port. Within World Heritage site." }, tip: { ja: "知床の海は魚影が圧倒的に濃い。カジキ・ヒラメ・マス類が同時に狙える聖地。", en: "Shiretoko has some of Japan's most fish-dense waters. Marlin, flounder, and salmon all coexist." } },
  { id: 29, name: "支笏湖（北海道）",      region: "hokkaido", pref: "北海道", fish: { ja: "ニジマス・ヒメマス・アメマス", en: "Rainbow Trout & Char" }, rating: 4.9, type: { ja: "カルデラ湖", en: "Caldera Lake" }, icon: "🪶", lat: 42.75, lng: 141.35, bestSeason: { ja: "通年（冬はワカサギ氷上）", en: "Year-round (ice fishing winter)" }, access: { ja: "新千歳空港から車40分。周辺にレンタルボートあり。", en: "40min drive from New Chitose Airport. Rental boats at lake." }, tip: { ja: "透明度日本一の湖。ニジマス60cm超がルアーで狙える。飛鱒（ヒメマス）は秋に爆発。", en: "Japan's clearest lake. 60cm+ rainbow trout on lures. Himemasu kokanee salmon peak in autumn." } },
  { id: 30, name: "阿寒川（北海道）",      region: "hokkaido", pref: "北海道", fish: { ja: "ニジマス・アメマス", en: "Rainbow Trout & White Spotted Char" }, rating: 4.9, type: { ja: "C&R指定区", en: "Catch & Release Section" }, icon: "🪶", lat: 43.45, lng: 144.13, bestSeason: { ja: "4〜10月", en: "Apr–Oct" }, access: { ja: "釧路市阿寒町。C&R区は遊漁券無料（特定区間）", en: "Akan, Kushiro. C&R section is permit-free in designated stretch" }, tip: { ja: "C&R区は大型ニジマスの楽園。60〜70cmが当たり前のドリームフィッシャリー。", en: "The C&R section holds monster rainbows. 60–70cm fish are the norm at this dream fishery." } },
  { id: 31, name: "十勝川（北海道）",      region: "hokkaido", pref: "北海道", fish: { ja: "イトウ・ニジマス・サケ", en: "Sakhalin Taimen & Salmon" }, rating: 5.0, type: { ja: "大河川", en: "Large River" }, icon: "🪶", lat: 42.80, lng: 143.10, bestSeason: { ja: "春・秋", en: "Spring & Autumn" }, access: { ja: "帯広市から各アクセスポイントへ車30〜60分", en: "30–60min drive from Obihiro to various access points" }, tip: { ja: "日本最大の淡水魚イトウが狙える数少ない場所。1mオーバーも現実。専門ガイドを推奨。", en: "One of Japan's few places to target Sakhalin Taimen over 1m. Guide strongly recommended." } },

  // ── KANTO ─────────────────────────────────────────────────────────────────
  { id: 32, name: "東京湾・竹芝周辺",     region: "kanto", pref: "東京", fish: { ja: "シーバス・タチウオ", en: "Seabass & Scabbardfish" }, rating: 4.5, type: { ja: "港湾", en: "Harbor" }, icon: "🦈", lat: 35.655, lng: 139.763, bestSeason: { ja: "秋（タチウオ）・通年（シーバス）", en: "Autumn (Tachiuo) / Year-round (Seabass)" }, access: { ja: "ゆりかもめ竹芝駅すぐ", en: "Adjacent to Yurikamome Takeshiba Station" }, tip: { ja: "タチウオはテンヤ釣りで秋に爆釣。シーバスは橋脚明暗部を狙う。", en: "Scabbardfish (Tachiuo) on tenya rigs go explosive in autumn. Seabass at bridge shadow edges." } },
  { id: 33, name: "芦ノ湖（神奈川）",     region: "kanto", pref: "神奈川", fish: { ja: "ブラウントラウト・ニジマス・ブラックバス", en: "Brown Trout & Rainbow Trout" }, rating: 4.9, type: { ja: "湖", en: "Lake" }, icon: "🪶", lat: 35.19, lng: 139.02, bestSeason: { ja: "通年", en: "Year-round" }, access: { ja: "箱根ロープウェイ桃源台駅からすぐ。レンタルボート多数。", en: "Near Hakone Ropeway Togendai. Many rental boats available." }, tip: { ja: "ブラウントラウト釣りで有名。芦ノ湖特有のフライフィッシング文化がある。", en: "Famous for Brown Trout. Has its own distinct fly fishing culture and tradition." } },
  { id: 34, name: "琵琶湖（滋賀）",       region: "kansai", pref: "滋賀", fish: { ja: "ブラックバス（キャッチ&リリース禁止）", en: "Largemouth Bass (Mandatory Kill)" }, rating: 5.0, type: { ja: "湖", en: "Lake" }, icon: "🐟", lat: 35.27, lng: 136.07, bestSeason: { ja: "春・秋", en: "Spring & Autumn" }, access: { ja: "大津・草津・彦根など各地からボートアクセス", en: "Boat access from Otsu, Kusatsu, Hikone and beyond" }, tip: { ja: "日本最大の湖。バスの聖地だが滋賀県条例でリリース禁止。持ち帰り必須。", en: "Japan's largest lake and bass mecca. Mandatory kill under Shiga Prefecture ordinance — no release." } },

  // ── CHUBU ─────────────────────────────────────────────────────────────────
  { id: 35, name: "長良川（岐阜・友釣り）", region: "chubu", pref: "岐阜", fish: { ja: "アユ", en: "Ayu (Sweetfish)" }, rating: 5.0, type: { ja: "清流", en: "Clear River" }, icon: "🐠", lat: 35.41, lng: 136.72, bestSeason: { ja: "6〜10月", en: "Jun–Oct" }, access: { ja: "岐阜市・郡上八幡など各漁協管轄区で遊漁券購入", en: "Buy permits at fishing cooperatives in Gifu city and Gujo-Hachiman" }, tip: { ja: "日本三大清流のひとつ。友釣りの聖地。郡上エリアは特に大型が出る。", en: "One of Japan's three great clear rivers. The mecca of tomozuri ayu fishing. Big fish in the Gujo area." } },
  { id: 37, name: "矢部川（八女）", region: "kyushu", pref: "福岡", fish: { ja: "アユ・ヤマメ", en: "Ayu & Yamame" }, rating: 4.9, type: { ja: "清流", en: "Clear River" }, icon: "🐠", lat: 33.21, lng: 130.71, bestSeason: { ja: "6〜10月（アユ）", en: "Jun–Oct (Ayu)" }, access: { ja: "八女市内から車20分。矢部川漁協で遊漁券購入（¥1,500/日）", en: "20min drive from Yame city. Buy permit at Yabeji Fishing Cooperative (¥1,500/day)" }, tip: { ja: "九州屈指の清流アユ河川。中流域の瀬が友釣りの一級ポイント。水質が澄んでいるため天然アユの魚影が濃い。早朝の霧の中での友釣りは格別。", en: "One of Kyushu's finest clear-water ayu rivers. Mid-river rapids are prime for tomozuri. Crystal clear water holds dense populations of wild ayu. Early morning tomozuri in the mist is unforgettable." } },
  // ── SAGA LOCALIZED ──────────────────────────────────────────────────────────
  { id: 38, name: "嘉瀬川・大和町（上流）", region: "kyushu", pref: "佐賀", fish: { ja: "ヤマメ・アマゴ", en: "Yamame & Amago" }, rating: 4.5, type: { ja: "清流", en: "Clear River" }, icon: "🐡", lat: 33.35, lng: 130.28, bestSeason: { ja: "3〜9月", en: "Mar–Sep" }, access: { ja: "大和ICから車10分。大和農村環境改善センター近く。遊漁券¥1,200/日", en: "10min from Yamato IC. Near Yamato Rural Center. ¥1,200/day permit" }, tip: { ja: "上流部は水が澄んでヤマメの魚影が濃い。早朝のフライが特に有効。川沿いの道は狭いので注意。", en: "Crystal clear upper reaches hold good Yamame populations. Early morning fly fishing is especially effective. Narrow riverside roads — drive carefully." } },
  { id: 39, name: "嘉瀬川・佐賀市中流", region: "kyushu", pref: "佐賀", fish: { ja: "コイ・ヘラブナ・ウナギ", en: "Carp, Crucian & Eel" }, rating: 4.0, type: { ja: "中流域", en: "Mid River" }, icon: "🐟", lat: 33.28, lng: 130.30, bestSeason: { ja: "通年", en: "Year-round" }, access: { ja: "佐賀市内から車15分。嘉瀬川ダム下流域", en: "15min from Saga city center. Below Kase Dam" }, tip: { ja: "ヘラブナの好ポイント多数。ウナギは夜釣りで実績あり。", en: "Many excellent Herabuna spots. Eel fishing at night is productive." } },
  { id: 40, name: "六角川・武雄市橋下", region: "kyushu", pref: "佐賀", fish: { ja: "シーバス・チヌ・ウナギ", en: "Seabass, Bream & Eel" }, rating: 4.3, type: { ja: "汽水域", en: "Brackish Water" }, icon: "🦈", lat: 33.19, lng: 130.01, bestSeason: { ja: "4〜11月（シーバス）", en: "Apr–Nov (Seabass)" }, access: { ja: "武雄温泉駅から車10分。各橋下がポイント", en: "10min from Takeo Onsen Stn. Fish under each bridge" }, tip: { ja: "潮の影響を受ける汽水域。満潮前後がシーバスの好機。夜のルアーが効果的。", en: "Tidal brackish zone. Seabass bite best around high tide. Night lure fishing is most effective." } },
  { id: 41, name: "牛津川・小城市", region: "kyushu", pref: "佐賀", fish: { ja: "アユ・ヤマメ", en: "Ayu & Yamame" }, rating: 4.2, type: { ja: "清流", en: "Clear Stream" }, icon: "🐠", lat: 33.27, lng: 130.20, bestSeason: { ja: "6〜9月（アユ）", en: "Jun–Sep (Ayu)" }, access: { ja: "小城駅から車5分。須賀神社付近が好ポイント", en: "5min from Ogi Stn. Good spots near Suga Shrine" }, tip: { ja: "小城の清流で友釣りアユ。水量が多い年は特に釣果が良い。地元漁協で遊漁券購入を。", en: "Tomozuri ayu in Ogi's clear streams. Years with high water yield the best catches. Buy permit from local cooperative." } },
  { id: 42, name: "城原川・神埼市", region: "kyushu", pref: "佐賀", fish: { ja: "ヤマメ・アユ・イワナ", en: "Yamame, Ayu & Iwana" }, rating: 4.6, type: { ja: "清流渓谷", en: "Mountain Stream" }, icon: "🐡", lat: 33.42, lng: 130.38, bestSeason: { ja: "3〜9月", en: "Mar–Sep" }, access: { ja: "神埼市から脊振方面へ30分。吉野ヶ里ICから45分", en: "30min from Kanzaki toward Seburi. 45min from Yoshinogari IC" }, tip: { ja: "脊振山系を源流とする清流。ヤマメの魚影が非常に濃く、上流部はイワナも狙える。フライ・テンカラが最適。", en: "Fed by Seburi mountains. Excellent Yamame density, Iwana in upper reaches. Fly and tenkara are ideal methods." } },
  { id: 43, name: "筑後川・鳥栖市（基山橋）", region: "kyushu", pref: "佐賀", fish: { ja: "アユ・コイ・ウグイ", en: "Ayu, Carp & Dace" }, rating: 4.1, type: { ja: "大河川", en: "Large River" }, icon: "🐠", lat: 33.37, lng: 130.51, bestSeason: { ja: "6〜9月（アユ）", en: "Jun–Sep (Ayu)" }, access: { ja: "鳥栖ICから車5分。基山橋上下流がポイント", en: "5min from Tosu IC. Both sides of Kiyama Bridge" }, tip: { ja: "鳥栖市内からすぐアクセスできる筑後川のアユポイント。早朝の友釣りが実績あり。", en: "Easily accessible ayu spot on Chikugo River from Tosu. Early morning tomozuri has proven results." } },
  { id: 44, name: "筑後川・久留米市（合川橋）", region: "kyushu", pref: "福岡", fish: { ja: "アユ・チヌ・シーバス", en: "Ayu, Bream & Seabass" }, rating: 4.4, type: { ja: "大河川", en: "Large River" }, icon: "🐠", lat: 33.32, lng: 130.51, bestSeason: { ja: "5〜10月", en: "May–Oct" }, access: { ja: "久留米ICから車10分。合川橋付近に駐車スペースあり", en: "10min from Kurume IC. Parking near Aikawa Bridge" }, tip: { ja: "筑後川の主要アユポイント。下流側は汽水でチヌ・シーバスも狙える。", en: "Major ayu point on Chikugo. Downstream brackish section holds bream and seabass." } },
  // ── FUKUOKA LOCALIZED ────────────────────────────────────────────────────────
  { id: 45, name: "矢部川・黒木町（上流部）", region: "kyushu", pref: "福岡", fish: { ja: "アユ・ヤマメ", en: "Ayu & Yamame" }, rating: 5.0, type: { ja: "源流清流", en: "Headwater Stream" }, icon: "🐠", lat: 33.24, lng: 130.68, bestSeason: { ja: "6〜9月（アユ最盛）", en: "Jun–Sep (Ayu Peak)" }, access: { ja: "黒木町中心部から車15分。矢部川漁協で遊漁券購入（¥1,500/日）", en: "15min from Kurogi town center. Buy permit at Yabeji Coop (¥1,500/day)" }, tip: { ja: "矢部川最上流の清流域。友釣りの聖地として地元で有名。水温が低く夏でも快適。早朝霧の中での釣りは格別。", en: "The sacred upper reaches of Yabeji. Famous locally as prime tomozuri territory. Cool water even in summer. Fishing in the early morning mist is unforgettable." } },
  { id: 46, name: "矢部川・瀬高（中流域）", region: "kyushu", pref: "福岡", fish: { ja: "アユ・チヌ・コイ", en: "Ayu, Bream & Carp" }, rating: 4.5, type: { ja: "中流域", en: "Mid River" }, icon: "🐠", lat: 33.17, lng: 130.59, bestSeason: { ja: "6〜10月", en: "Jun–Oct" }, access: { ja: "瀬高駅から車5分。国道443号沿いに駐車スペースあり", en: "5min from Setaka Stn. Parking along Rt. 443" }, tip: { ja: "中流域は水深があり多魚種が狙える。夕方のチヌ狙いが特に面白い。", en: "Deeper mid-river section holds multiple species. Evening bream fishing is particularly exciting." } },
  { id: 47, name: "星野川・八女市星野村", region: "kyushu", pref: "福岡", fish: { ja: "ヤマメ・アユ・イワナ", en: "Yamame, Ayu & Iwana" }, rating: 4.8, type: { ja: "秘境清流", en: "Remote Clear Stream" }, icon: "🐡", lat: 33.20, lng: 130.77, bestSeason: { ja: "3〜9月", en: "Mar–Sep" }, access: { ja: "八女市街から車40分。星野村は茶の産地でもある秘境。道は狭い", en: "40min from Yame city. Hoshino Village is a remote tea-growing community. Narrow roads." }, tip: { ja: "ほとんど知られていない穴場清流。ヤマメの魚影は矢部川に匹敵する。人が少なく静かな釣りが楽しめる。", en: "A little-known hidden gem. Yamame density rivals Yabeji River. Very few anglers — peaceful fishing guaranteed." } },
  { id: 48, name: "山田川・八女市上陽町", region: "kyushu", pref: "福岡", fish: { ja: "アユ・ヤマメ", en: "Ayu & Yamame" }, rating: 4.3, type: { ja: "清流", en: "Clear River" }, icon: "🐠", lat: 33.22, lng: 130.64, bestSeason: { ja: "6〜9月", en: "Jun–Sep" }, access: { ja: "八女ICから車25分。上陽町の棚田地帯を流れる", en: "25min from Yame IC. Flows through Joyo terraced rice fields" }, tip: { ja: "観光客が少ない穴場河川。アユの魚影が濃く、地元漁師以外にほとんど知られていない。", en: "An undiscovered river with excellent ayu density. Barely known outside local fishing circles." } },
  { id: 49, name: "遠賀川・直方市", region: "kyushu", pref: "福岡", fish: { ja: "アユ・コイ・バス", en: "Ayu, Carp & Bass" }, rating: 4.0, type: { ja: "大河川", en: "Large River" }, icon: "🐟", lat: 33.74, lng: 130.73, bestSeason: { ja: "5〜9月", en: "May–Sep" }, access: { ja: "直方駅から徒歩15分。遠賀川河川公園付近", en: "15min walk from Nogata Stn. Near Onga River Park" }, tip: { ja: "北九州エリアの定番河川。アユの遡上シーズンは多くの釣り人で賑わう。バス釣りも人気。", en: "A staple river in North Kyushu. Busy during ayu upstream migration. Bass fishing also popular." } },
  { id: 50, name: "今川・行橋市（豊前海）", region: "kyushu", pref: "福岡", fish: { ja: "シーバス・チヌ・キス", en: "Seabass, Bream & Whiting" }, rating: 4.2, type: { ja: "河口・干潟", en: "Estuary & Mudflat" }, icon: "🦈", lat: 33.72, lng: 130.98, bestSeason: { ja: "4〜11月", en: "Apr–Nov" }, access: { ja: "行橋駅から車10分。今川河口の干潟地帯", en: "10min from Yukuhashi Stn. Imai River estuary mudflats" }, tip: { ja: "豊前海の干潟に注ぐ今川河口。潮干狩りでも有名なエリア。シーバスは夜の満潮前が狙い目。", en: "River mouth emptying into Buzen Sea mudflats. Famous for clam digging. Seabass peak around high tide at night." } },
  // ── NAGASAKI ─────────────────────────────────────────────────────────────────
  { id: 51, name: "大村湾・諫早（西岸）", region: "kyushu", pref: "長崎", fish: { ja: "チヌ・メバル・アジ", en: "Bream, Rockfish & Mackerel" }, rating: 4.3, type: { ja: "内湾・磯", en: "Inner Bay & Rocky Shore" }, icon: "🐟", lat: 32.84, lng: 130.02, bestSeason: { ja: "通年（春秋最高）", en: "Year-round (Spring/Fall best)" }, access: { ja: "諫早ICから車15分。西岸各磯に駐車スペース点在", en: "15min from Isahaya IC. Parking spots at various rocky shores on west coast" }, tip: { ja: "大村湾は内海のため波が穏やかで初心者にも安心。チヌは岸壁際、メバルは夜の磯で実績が高い。", en: "Omura Bay's calm inner waters are beginner-friendly. Bream along walls, rockfish on night rocky shores." } },
  { id: 52, name: "五島列島・福江島（磯釣り）", region: "kyushu", pref: "長崎", fish: { ja: "クロダイ・グレ・マダイ", en: "Black Bream, Largescale Blackfish & Sea Bream" }, rating: 5.0, type: { ja: "離島磯", en: "Island Rocky Shore" }, icon: "🐟", lat: 32.69, lng: 128.84, bestSeason: { ja: "秋〜春（10〜5月）", en: "Autumn–Spring (Oct–May)" }, access: { ja: "長崎港からフェリー3時間（¥3,800）または飛行機35分", en: "3hr ferry from Nagasaki (¥3,800) or 35min flight" }, tip: { ja: "九州最高峰の磯釣りスポット。黒潮の影響で魚影が非常に濃い。渡船利用が基本。一生に一度は行くべき聖地。", en: "The pinnacle of Kyushu rock fishing. Exceptional fish density from Kuroshio influence. Charter boats required. A once-in-a-lifetime destination." } },
  // ── KUMAMOTO ─────────────────────────────────────────────────────────────────
  { id: 53, name: "緑川・美里町（上流）", region: "kyushu", pref: "熊本", fish: { ja: "ヤマメ・アユ・イワナ", en: "Yamame, Ayu & Iwana" }, rating: 4.7, type: { ja: "清流渓谷", en: "Mountain Gorge" }, icon: "🐡", lat: 32.65, lng: 130.79, bestSeason: { ja: "4〜9月", en: "Apr–Sep" }, access: { ja: "松橋ICから車40分。美里町の山岳渓流", en: "40min from Matsubase IC. Mountain streams of Misato town" }, tip: { ja: "熊本屈指の清流渓谷。イワナの生息域が広く、テンカラで狙うのが醍醐味。夏も水温が低くて快適。", en: "One of Kumamoto's finest clear-water gorges. Wide Iwana range — tenkara is the ideal approach. Cool water temperatures even in summer." } },
  { id: 54, name: "球磨川・人吉市（本流）", region: "kyushu", pref: "熊本", fish: { ja: "アユ・アマゴ・コイ", en: "Ayu, Amago & Carp" }, rating: 4.8, type: { ja: "急流大河", en: "Rapid River" }, icon: "🐠", lat: 32.21, lng: 130.76, bestSeason: { ja: "6〜9月（アユ）", en: "Jun–Sep (Ayu)" }, access: { ja: "人吉ICから車5分。球磨川ラフティングの聖地でもある", en: "5min from Hitoyoshi IC. Also famous as Japan's top rafting river" }, tip: { ja: "日本三大急流の一つ。アユの遡上量が九州最多クラス。友釣りの名人が集う聖地。川の流れが速いので安全注意。", en: "One of Japan's three great rapid rivers. Among Kyushu's highest ayu migration numbers. Renowned tomozuri destination. Fast current — stay safe." } },

  // ── PUERTO RICO ──────────────────────────────────────────────────────────────
  { id: 55, name: "Lago Dos Bocas", region: "puertorico", pref: "Arecibo", fish: { ja: "バス・ティラピア", en: "Largemouth Bass & Tilapia" }, rating: 4.8, type: { ja: "淡水湖", en: "Freshwater Lake" }, icon: "🐟", lat: 18.35, lng: -66.72, bestSeason: { ja: "通年（春・秋最高）", en: "Year-round (Spring/Fall best)" }, access: { ja: "アレシボから車30分。ボートツアーあり", en: "30min from Arecibo. Boat tours from the dock" }, tip: { ja: "プエルトリコ最高の淡水釣りスポット。バスの魚影が非常に濃い。ボートで奥の入江を狙うのが鉄板。", en: "Puerto Rico's premier freshwater spot. Dense bass populations. Rent a boat and target the back coves." } },
  { id: 56, name: "Lago Carite", region: "puertorico", pref: "Guayama", fish: { ja: "バス・ティラピア・ブルーギル", en: "Bass, Tilapia & Bluegill" }, rating: 4.6, type: { ja: "山岳湖", en: "Mountain Lake" }, icon: "🐟", lat: 18.07, lng: -66.12, bestSeason: { ja: "通年", en: "Year-round" }, access: { ja: "グアヤマから車40分。カリテ森林保護区内", en: "40min from Guayama. Inside Carite Forest Reserve" }, tip: { ja: "標高が高く涼しいカリテ湖。早朝のトップウォーターが効果的。", en: "Cool mountain lake with great bass. Early morning topwater is deadly." } },
  { id: 57, name: "Laguna Tortuguero", region: "puertorico", pref: "Vega Baja", fish: { ja: "タリポン・スノック", en: "Tarpon & Snook" }, rating: 4.9, type: { ja: "ラグーン", en: "Lagoon" }, icon: "🦈", lat: 18.46, lng: -66.47, bestSeason: { ja: "通年（夏タリポン最高）", en: "Year-round (Tarpon peak summer)" }, access: { ja: "ベガバハから車10分", en: "10min from Vega Baja" }, tip: { ja: "タリポン釣りの聖地。マングローブ際のスノックはスリリング。カヤックフィッシングが特におすすめ。", en: "Sacred tarpon territory. Snook around mangrove roots is thrilling. Kayak fishing highly recommended." } },
  { id: 58, name: "Boca de Cangrejos", region: "puertorico", pref: "San Juan", fish: { ja: "タリポン・スノック・ジャック", en: "Tarpon, Snook & Jack Crevalle" }, rating: 4.7, type: { ja: "河口・ビーチ", en: "Estuary & Beach" }, icon: "🦈", lat: 18.45, lng: -66.02, bestSeason: { ja: "通年（夜釣り最高）", en: "Year-round (night fishing best)" }, access: { ja: "サンファン空港から車10分", en: "10min from SJU airport" }, tip: { ja: "夜の常夜灯周りにタリポンが集まる。シルバーのバブルウォーカーが定番ルアー。", en: "Tarpon gather around night lights. Silver bubble walker lures are the classic choice." } },
  { id: 59, name: "La Parguera", region: "puertorico", pref: "Lajas", fish: { ja: "マヒマヒ・ワフー・キングフィッシュ", en: "Mahi-Mahi, Wahoo & Kingfish" }, rating: 5.0, type: { ja: "オフショア・礁", en: "Offshore & Reef" }, icon: "🐠", lat: 17.97, lng: -67.04, bestSeason: { ja: "3〜8月", en: "Mar–Aug" }, access: { ja: "ラハスから車5分。チャーターボート多数", en: "5min from Lajas. Many charter boats available" }, tip: { ja: "コルテスウォールで大型マヒマヒが狙える。マングローブカヤックとの組み合わせが最高。", en: "The Cortez Wall holds massive mahi-mahi. Combine with mangrove kayaking for a perfect day." } },
  { id: 60, name: "Río Grande de Arecibo", region: "puertorico", pref: "Utuado", fish: { ja: "アメリカンシャッド・グアビナ", en: "American Shad & Guabina" }, rating: 4.3, type: { ja: "清流", en: "Clear River" }, icon: "🐡", lat: 18.27, lng: -66.70, bestSeason: { ja: "11〜3月", en: "Nov–Mar" }, access: { ja: "ウトゥアドから車20分", en: "20min from Utuado" }, tip: { ja: "カルスト地形の清流。在来種グアビナを狙うユニークな釣り。", en: "Karst landscape river. Native guabina fishing is a unique experience." } },
  { id: 61, name: "Culebra Island", region: "puertorico", pref: "Culebra", fish: { ja: "バラクーダ・スナッパー・グルーパー", en: "Barracuda, Snapper & Grouper" }, rating: 5.0, type: { ja: "離島リーフ", en: "Island Reef" }, icon: "🐠", lat: 18.30, lng: -65.30, bestSeason: { ja: "通年（春・秋最高）", en: "Year-round (Spring/Fall best)" }, access: { ja: "セイバ港からフェリー1時間（$2.25）", en: "1hr ferry from Ceiba ($2.25) or 15min flight" }, tip: { ja: "カリブ海最高の透明度。スノーケルしながらリーフフィッシング。スナッパーとグルーパーが定番。", en: "Caribbean's clearest waters. Snorkel and reef fish simultaneously. Snapper and grouper are reliable targets." } },
  { id: 62, name: "Humacao Nature Reserve", region: "puertorico", pref: "Humacao", fish: { ja: "タリポン・スノック・レッドフィッシュ", en: "Tarpon, Snook & Redfish" }, rating: 4.6, type: { ja: "保護区ラグーン", en: "Nature Reserve Lagoon" }, icon: "🦈", lat: 18.15, lng: -65.77, bestSeason: { ja: "通年", en: "Year-round" }, access: { ja: "ウマカオから車10分", en: "10min from Humacao" }, tip: { ja: "東PRの隠れた名釣り場。カヤックかウェーディングで朝一番がゴールデンタイム。", en: "Hidden gem in eastern PR. Kayak or wade. First light is the golden hour." } },

  // ── VIEQUES & SURROUNDING ISLANDS ────────────────────────────────────────────
  { id: 63, name: "Vieques - Red Beach Flats", region: "puertorico", pref: "Vieques", fish: { ja: "タリポン・ボーンフィッシュ・パーミット", en: "Tarpon, Bonefish & Permit" }, rating: 5.0, type: { ja: "フラット・浅瀬", en: "Saltwater Flats" }, icon: "🦈", lat: 18.09, lng: -65.44, bestSeason: { ja: "通年（3〜6月最高）", en: "Year-round (Mar–Jun best)" }, access: { ja: "セイバ港からフェリー1時間またはセスナ15分。レッドビーチ前のフラット", en: "1hr ferry from Ceiba or 15min flight. Flats in front of Red Beach" }, tip: { ja: "カリブ海最高のフラットフィッシング聖地。ボーンフィッシュは朝の干潮時にフラットを泳ぐ姿が見える。タリポンは夜明け前後が勝負。カヤックフライフィッシングが最も効果的。", en: "Caribbean's finest flats fishing. Bonefish visibly feed on flats during morning low tide. Tarpon are best at dawn. Kayak fly fishing is the most effective approach." } },
  { id: 64, name: "Vieques - Mosquito Pier (旧海軍桟橋)", region: "puertorico", pref: "Vieques", fish: { ja: "タリポン・スナッパー・バラクーダ", en: "Tarpon, Snapper & Barracuda" }, rating: 4.9, type: { ja: "桟橋・夜釣り", en: "Pier Night Fishing" }, icon: "🦈", lat: 18.15, lng: -65.44, bestSeason: { ja: "通年（夜釣り最高）", en: "Year-round (night fishing best)" }, access: { ja: "ビエケス市街から車10分。旧米海軍桟橋跡", en: "10min from Vieques town. Former US Navy pier" }, tip: { ja: "旧海軍桟橋はタリポンの溜まり場。夜に常夜灯周りでポッパーを投げると激しいバイトが楽しめる。地元アングラーが毎晩集う名所。", en: "The old Navy pier is a tarpon magnet. Night fishing with poppers around the lights produces explosive strikes. Local anglers gather here every evening." } },
  { id: 65, name: "Vieques - Blue Beach (東端)", region: "puertorico", pref: "Vieques", fish: { ja: "ボーンフィッシュ・パーミット・マングローブスナッパー", en: "Bonefish, Permit & Mangrove Snapper" }, rating: 4.9, type: { ja: "フラット・マングローブ", en: "Flats & Mangrove" }, icon: "🐠", lat: 18.103, lng: -65.384, bestSeason: { ja: "11〜5月（ボーンフィッシュ）", en: "Nov–May (Bonefish best)" }, access: { ja: "ビエケス東端。4WD推奨。地元ガイド同行が理想的", en: "Far eastern tip of Vieques. 4WD recommended. Local guide ideal" }, tip: { ja: "ビエケス東端の手つかずのフラット。ボーンフィッシュが群れをなして泳ぐ場面が見られる。フライロッド8番が最適。パーミットは希少だが出ると感動もの。", en: "Pristine untouched flats at the eastern tip. Schools of bonefish visibly feeding. 8-weight fly rod is ideal. Permit are rare but unforgettable when they appear." } },
  { id: 66, name: "Vieques - Bioluminescent Bay (カヤック釣り)", region: "puertorico", pref: "Vieques", fish: { ja: "スナッパー・タリポン・ジャック", en: "Snapper, Tarpon & Jack" }, rating: 4.7, type: { ja: "生物発光湾・夜釣り", en: "Bioluminescent Bay Night Fishing" }, icon: "✨", lat: 18.09, lng: -65.47, bestSeason: { ja: "通年（新月の夜が最高）", en: "Year-round (new moon nights best)" }, access: { ja: "プエルトモスキートへのカヤックツアーで到達。ガイドツアー推奨（$45〜）", en: "Via kayak tour to Puerto Mosquito. Guided tour recommended ($45+)" }, tip: { ja: "世界最高の生物発光湾での夜釣り体験。発光プランクトンが水中で光る幻想的な環境でスナッパーとジャックが狙える。一生忘れられない体験。釣りとバイオルミネセンスツアーの組み合わせが最高。", en: "Night fishing in the world's brightest bioluminescent bay. Snapper and jack amid glowing plankton. A once-in-a-lifetime experience. Combine with bio bay tour for the ultimate night out." } },
  { id: 67, name: "Vieques - North Shore Reef", region: "puertorico", pref: "Vieques", fish: { ja: "グルーパー・スナッパー・バラクーダ", en: "Grouper, Snapper & Barracuda" }, rating: 4.8, type: { ja: "リーフ・ボートフィッシング", en: "Reef Boat Fishing" }, icon: "🐠", lat: 18.16, lng: -65.44, bestSeason: { ja: "通年", en: "Year-round" }, access: { ja: "ビエケス島内レンタルボートまたはチャーターボート（$150〜/日）", en: "Rental boat or charter from Vieques ($150+/day)" }, tip: { ja: "北岸の礁は30〜60フィートの根魚の宝庫。ジギングとボトムフィッシングでグルーパーが狙える。潮の流れが速い場所なので100gジグが有効。", en: "North shore reef holds excellent grouper at 30-60ft. Jigging and bottom fishing are productive. Fast current spots respond well to 100g jigs." } },
  { id: 68, name: "Vieques - Offshore (カジキ・マヒマヒ)", region: "puertorico", pref: "Vieques", fish: { ja: "カジキ・マヒマヒ・ワフー・イエローフィンツナ", en: "Marlin, Mahi-Mahi, Wahoo & Yellowfin Tuna" }, rating: 5.0, type: { ja: "オフショア（沖釣り）", en: "Offshore Bluewater" }, icon: "🐟", lat: 18.05, lng: -65.20, bestSeason: { ja: "3〜8月（カジキ）", en: "Mar–Aug (Marlin season)" }, access: { ja: "ビエケス南側から15〜30分沖。チャーターボート（$600〜/日）", en: "15-30min offshore from Vieques south. Charter boats ($600+/day)" }, tip: { ja: "ビエケス沖は黒潮の支流が通りカジキの回遊ルート。マヒマヒは年中狙える。イエローフィンツナは春〜夏に50〜100ポンド級が出る。プエルトリコ最高峰のオフショア体験。", en: "Vieques offshore is on the marlin migration route. Mahi-mahi year-round. Yellowfin tuna 50-100lb class in spring-summer. The ultimate PR offshore experience." } },
  { id: 69, name: "Vieques - Esperanza (夕方タリポン)", region: "puertorico", pref: "Vieques", fish: { ja: "タリポン・スナッパー・スノック", en: "Tarpon, Snapper & Snook" }, rating: 4.8, type: { ja: "ビーチ・マングローブ", en: "Beach & Mangrove" }, icon: "🦈", lat: 18.09, lng: -65.47, bestSeason: { ja: "通年（夕方最高）", en: "Year-round (evenings best)" }, access: { ja: "エスペランサのマレコン（遊歩道）から直接アクセス", en: "Direct access from Esperanza Malecon boardwalk" }, tip: { ja: "エスペランサの桟橋と遊歩道はタリポンの有名スポット。夕方に地元の人たちと並んでキャストする光景は風物詩。ライブベイトでもルアーでも釣れる。レストランで食事しながら夕暮れ釣りが最高。", en: "Esperanza boardwalk is a famous tarpon spot. Evening casting alongside locals is a beloved tradition. Live bait or lures both work. Combine with dinner at a waterfront restaurant." } },

  // ── CULEBRA (詳細) ────────────────────────────────────────────────────────────
  { id: 70, name: "Culebra - Flamenco Beach Flats", region: "puertorico", pref: "Culebra", fish: { ja: "ボーンフィッシュ・パーミット", en: "Bonefish & Permit" }, rating: 4.9, type: { ja: "フラット", en: "Saltwater Flats" }, icon: "🐠", lat: 18.34, lng: -65.31, bestSeason: { ja: "11〜5月", en: "Nov–May" }, access: { ja: "フラメンコビーチから徒歩でフラット地帯へ", en: "Walk from Flamenco Beach to the flats area" }, tip: { ja: "フラメンコビーチ横のフラットはボーンフィッシュの宝庫。カリブ海随一の透明度でサイトフィッシングが楽しめる。6番フライロッドとクラブフライが定番。", en: "Flats beside Flamenco Beach hold excellent bonefish. Caribbean-best visibility for sight fishing. 6-weight fly rod with crab fly is standard." } },
  { id: 71, name: "Culebra - Luis Peña Channel", region: "puertorico", pref: "Culebra", fish: { ja: "グルーパー・スナッパー・バラクーダ・タートル", en: "Grouper, Snapper & Barracuda" }, rating: 4.8, type: { ja: "海峡・リーフ", en: "Channel Reef" }, icon: "🐠", lat: 18.31, lng: -65.34, bestSeason: { ja: "通年", en: "Year-round" }, access: { ja: "カヤックまたはスノーケルガイドツアーで到達", en: "By kayak or snorkel guide tour" }, tip: { ja: "天然保護区のルイスペーニャチャンネル。スノーケルしながらフィッシングが楽しめる唯一無二のスポット。グルーパーが根際に着いている。", en: "Protected Luis Peña Channel marine reserve. Unique spot to snorkel and fish simultaneously. Grouper holding tight to the reef structure." } },

  // ── VIEQUES周辺・セイバ / ファハルド ─────────────────────────────────────────
  { id: 72, name: "Fajardo - Las Croabas Flats", region: "puertorico", pref: "Fajardo", fish: { ja: "タリポン・スノック・レッドフィッシュ", en: "Tarpon, Snook & Redfish" }, rating: 4.7, type: { ja: "マングローブフラット", en: "Mangrove Flats" }, icon: "🦈", lat: 18.33, lng: -65.63, bestSeason: { ja: "通年", en: "Year-round" }, access: { ja: "ファハルドのラスクロアバス地区。ビエケス行きフェリー乗り場の近く", en: "Las Croabas area, Fajardo. Near the Vieques ferry terminal" }, tip: { ja: "ビエケス行きフェリーを待つ間にタリポンが狙える。マングローブの根際でスノックをポッパーで狙うと爆発的なバイトが楽しめる。", en: "Fish for tarpon while waiting for the Vieques ferry. Popper fishing for snook around mangrove roots produces explosive strikes." } },
  { id: 73, name: "Fajardo - Seven Seas Beach", region: "puertorico", pref: "Fajardo", fish: { ja: "ニードルフィッシュ・ジャック・スナッパー", en: "Needlefish, Jack & Snapper" }, rating: 4.3, type: { ja: "ビーチ・礁", en: "Beach & Reef" }, icon: "🐠", lat: 18.37, lng: -65.62, bestSeason: { ja: "通年", en: "Year-round" }, access: { ja: "ファハルドから車10分。七つの海ビーチ", en: "10min from Fajardo town. Seven Seas Beach" }, tip: { ja: "ファハルド近郊で最もアクセスしやすいビーチ釣りスポット。リーフの際でスナッパーが狙える。スノーケリングと組み合わせると楽しい。", en: "Most accessible beach fishing near Fajardo. Snapper along the reef edge. Great combined with snorkeling." } },
  { id: 74, name: "Ceiba - Roosevelt Roads (旧米海軍基地)", region: "puertorico", pref: "Ceiba", fish: { ja: "タリポン・スノック・レッドドラム", en: "Tarpon, Snook & Red Drum" }, rating: 4.8, type: { ja: "旧軍港・マングローブ", en: "Former Navy Base & Mangrove" }, icon: "🦈", lat: 18.24, lng: -65.64, bestSeason: { ja: "通年", en: "Year-round" }, access: { ja: "セイバ市内から車10分。旧ルーズベルトロード米海軍基地跡", en: "10min from Ceiba. Former Roosevelt Roads Naval Station" }, tip: { ja: "旧米海軍基地跡の広大なマングローブエリア。タリポンとスノックが豊富でほとんど知られていない穴場。カヤックが最適。夜明けに出発すると最高。", en: "Vast mangrove area of the former Navy base. Excellent tarpon and snook barely known to visitors. Kayak is ideal. Launch at dawn for best results." } },
];

// ─── SEASONAL COMPONENTS ─────────────────────────────────────────────────────
function SeasonalBadge({ fishId, lang }) {
  const tip = getSeasonalTip(fishId);
  if (!tip || tip.urgency === "low") return null;
  const style = URGENCY_STYLES[tip.urgency];
  return (
    <span style={{ background: style.bg, color: style.text, border: `2px solid ${style.border}`, borderRadius: 99, padding: "2px 9px", fontSize: "0.78rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: style.dot, display: "inline-block", flexShrink: 0 }} />
      {tip.badge[lang]}
    </span>
  );
}

function SeasonalAlert({ fishId, lang, compact = false }) {
  const tip = getSeasonalTip(fishId);
  if (!tip) return null;
  const style = URGENCY_STYLES[tip.urgency];
  const monthName = MONTH_NAMES[lang][CURRENT_MONTH];

  if (compact) {
    return (
      <div style={{ background: style.bg, border: `2px solid ${style.border}`, borderRadius: 12, padding: "10px 14px", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: style.dot, flexShrink: 0, boxShadow: `0 0 8px ${style.dot}` }} />
          <span style={{ fontWeight: 700, fontSize: "0.92rem", color: style.text }}>{tip.badge[lang]}</span>
          <span style={{ marginLeft: "auto", fontSize: "0.78rem", color: style.text, opacity: 0.7 }}>{monthName}</span>
        </div>
        <p style={{ margin: "0 0 8px", fontSize: "0.88rem", color: style.text, lineHeight: 1.5 }}>{tip.tip[lang]}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {tip.hotLures[lang].map(l => (
            <LureTag key={l} lure={l} lang={lang} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: style.bg, border: `2px solid ${style.border}`, borderRadius: 16, padding: "14px 16px", marginBottom: 14, animation: "fadeUp 0.3s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: style.dot, flexShrink: 0, boxShadow: `0 0 10px ${style.dot}88` }} />
        <span style={{ fontWeight: 700, fontSize: "1rem", color: style.text }}>{lang === "ja" ? "🗓️ 今月の狙い目" : "🗓️ This Month's Insight"}</span>
        <span style={{ marginLeft: "auto", background: style.border, color: "#fff", borderRadius: 99, padding: "2px 10px", fontSize: "0.78rem", fontWeight: 700 }}>{monthName}</span>
      </div>
      <div style={{ background: "rgba(255,255,255,0.5)", borderRadius: 10, padding: "10px 12px", marginBottom: 10 }}>
        <div style={{ fontWeight: 700, fontSize: "0.92rem", color: style.text, marginBottom: 4 }}>{tip.badge[lang]}</div>
        <p style={{ margin: 0, fontSize: "0.88rem", color: style.text, lineHeight: 1.6 }}>{tip.tip[lang]}</p>
      </div>
      <div style={{ fontSize: "0.8rem", color: style.text, fontWeight: 700, marginBottom: 6 }}>{lang === "ja" ? "🎯 今月のホットルアー" : "🎯 Hot Lures Right Now"}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {tip.hotLures[lang].map(l => (
          <LureTag key={l} lure={l} lang={lang} />
        ))}
      </div>
    </div>
  );
}

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────
function DiffBadge({ level, lang }) {
  const m = { beginner: { ja: "初心者", en: "Beginner", c: "#2d7a3a", bg: "#e0f2f2" }, intermediate: { ja: "中級者", en: "Intermediate", c: "#c06a10", bg: "#f8e8d0" }, advanced: { ja: "上級者", en: "Advanced", c: "#b82030", bg: "#f8d8d8" } };
  const d = m[level] || m.beginner;
  return <span style={{ background: d.bg, color: d.c, border: `2px solid ${d.c}`, borderRadius: 99, padding: "3px 12px", fontSize: "0.95rem", fontWeight: 700 }}>{d[lang]}</span>;
}

function FlyTypeBadge({ type, lang }) {
  const m = { dry: { ja: "ドライ", en: "Dry Fly", c: "#c06a10", bg: "#f8e8d0" }, nymph: { ja: "ニンフ", en: "Nymph", c: "#1565a0", bg: "#d0e4f8" }, streamer: { ja: "ストリーマー", en: "Streamer", c: "#b82030", bg: "#f8d8d8" }, tenkara: { ja: "テンカラ", en: "Tenkara", c: "#2d7a3a", bg: "#e0f2f2" } };
  const d = m[type] || m.dry;
  return <span style={{ background: d.bg, color: d.c, border: `2px solid ${d.c}`, borderRadius: 99, padding: "3px 12px", fontSize: "0.95rem", fontWeight: 700 }}>{d[lang]}</span>;
}

function ScoreRing({ score, lang = "ja" }) {
  const color = score >= 80 ? "#2d7a3a" : score >= 60 ? "#c06a10" : "#b82030";
  const bg = score >= 80 ? "#e0f2f2" : score >= 60 ? "#f8e8d0" : "#f8d8d8";
  return (
    <div style={{ position: "relative", width: 72, height: 72 }}>
      <svg viewBox="0 0 36 36" style={{ width: 72, height: 72, transform: "rotate(-90deg)" }}>
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e8e3d8" strokeWidth="3" />
        <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3" strokeDasharray={`${score} 100`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "1.1rem", fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: "0.6rem", color: "#4a4a3a", fontWeight: 600 }}>{lang === "ja" ? "釣り指数" : "Fish Index"}</span>
      </div>
    </div>
  );
}

// ─── AI MODALS ───────────────────────────────────────────────────────────────
function AIModal({ fish, weather, lang, onClose }) {
  const [response, setResponse] = useState(""); const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const jaPrompt = `あなたはベテランの日本の釣りガイドです。${fish.name}（${fish.nameEn}）を今日の条件で釣るためのルアー・エサのアドバイスをしてください。気温:${weather.temp}℃ 水温:${weather.waterTemp}℃ 天気:${weather.condition.ja} 風:${weather.wind.ja} 釣り指数:${weather.fishingIndex}/100。TOP3ルアー（理由付き）、アクション方法、隠し技、最適時間帯を200〜250字で絵文字セクション分けして日本語で回答。`;
      const enPrompt = `You are an expert Japanese fishing guide. Give lure and bait advice for catching ${fish.nameEn} today. Conditions: ${weather.temp}℃ air, ${weather.waterTemp}℃ water, ${weather.condition.en}, wind ${weather.wind.en}, fishing index ${weather.fishingIndex}/100. Give TOP 3 lures (with reasons), retrieve technique, a pro tip, and the best time window. Keep it under 200 words with emoji section headers.`;
      const jaFallback = `🥇 本日のルアー診断\n\n🎯 第1位：バイブレーション（ゴールド系）\n水温${weather.waterTemp}℃の条件ではリアクションバイト狙いが◎。底からリフト＆フォール。\n\n🥈 第2位：シンキングペンシル\n流れのある場所でドリフト。橋脚明暗部でスロー引き。\n\n🥉 第3位：ワームリグ（クリア）\nプレッシャー高いポイントはフィネス系。1〜2gジグヘッドでデッドスロー。\n\n🔮 隠し技：カラーローテーション\nナチュラル⇔チャートで即変更。\n\n⏰ 黄金タイム：6〜8時・18〜20時`;
      const enFallback = `🥇 Today's Top Lure\n\n🎯 #1: Vibration plug (gold)\nAt ${weather.waterTemp}℃, trigger reaction bites. Lift-and-drop off the bottom.\n\n🥈 #2: Sinking pencil\nDrift through currents. Slow retrieve past bridge shadows at night.\n\n🥉 #3: Soft plastic (clear)\nFor pressured spots — deadstick a 1–2g jig head ultra-slow.\n\n🔮 Pro tip: Color rotation\nFlip between natural and chartreuse when bites stop.\n\n⏰ Golden window: 6–8am & 6–8pm`;
      try {
        const res = await fetch("/api/claude", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: lang === "ja" ? jaPrompt : enPrompt }] }) });
        const data = await res.json(); setResponse(data.content?.[0]?.text || "");
      } catch { setResponse(lang === "ja" ? jaFallback : enFallback); }
      setLoading(false);
    })();
  }, []);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "flex-end" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fffdf8", border: "2px solid #70a8b8", borderRadius: "24px 24px 0 0", padding: "24px 20px 44px", width: "100%", maxHeight: "80vh", overflowY: "auto", animation: "slideUp 0.3s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div><div style={{ fontSize: "1rem", fontWeight: 700 }}>🤖 {lang === "ja" ? "AIルアー診断" : "AI Lure Advisor"}</div><div style={{ fontSize: "0.95rem", color: "#0d7377" }}>Claude AI · {fish.name}</div></div>
          <button onClick={onClose} style={{ background: "#f0ebe0", border: "none", borderRadius: 8, padding: "6px 12px", color: "#5a5a4a", cursor: "pointer" }}>✕</button>
        </div>
        {loading ? <div style={{ textAlign: "center", padding: "40px 20px" }}><div style={{ fontSize: "2.5rem", animation: "spin 1s linear infinite", display: "inline-block" }}>🎣</div><p style={{ color: "#5a5a4a", marginTop: 12 }}>{lang === "ja" ? "今日の状況を分析中..." : "Analysing today's conditions..."}</p></div>
          : <div style={{ fontSize: "1rem", lineHeight: 1.8, color: "#3a3a2a", whiteSpace: "pre-wrap" }}>{response}</div>}
      </div>
    </div>
  );
}

function AIFlyModal({ fish, weather, lang, currentMonth, onClose }) {
  const [response, setResponse] = useState(""); const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const jaPrompt = `あなたは日本のフライフィッシングの専門家です。${fish?.name || "ヤマメ・イワナ"}を${currentMonth}の日本の渓流でフライフィッシング（またはテンカラ）で狙う場合のアドバイスをください。条件：気温${weather.temp}℃、水温${weather.waterTemp}℃、天気${weather.condition.ja}、水の透明度：${weather.waterClarity.ja}。\n\n以下を教えてください：\n1. 今日のベストフライパターン TOP3（理由付き・サイズとカラーも）\n2. プレゼンテーション方法（キャスト・ドリフト技術）\n3. ハッチ（羽化）の予測と対応すべきイミテーション\n4. テンカラvs ウェスタンフライ、今日の条件でどちらが有利か\n5. 今日の最適な時間帯とポイントの選び方\n\n250〜300字で絵文字セクション分け、日本語で回答。`;
      const enPrompt = `You are a Japanese fly fishing expert. Give advice for catching ${fish?.nameEn || "Yamame / Iwana"} fly fishing (or tenkara) in Japanese mountain streams in ${currentMonth}. Conditions: ${weather.temp}℃ air, ${weather.waterTemp}℃ water, ${weather.condition.en}, water clarity: ${weather.waterClarity.en}.\n\nCover: 1) Top 3 fly patterns (with sizes & colours) 2) Presentation technique 3) Hatch prediction & imitation 4) Tenkara vs western fly — which wins today? 5) Best time window and spot selection. Under 250 words, emoji section headers.`;
      const jaFallback = `🪶 本日のフライ診断（${currentMonth}）\n\n🥇 第1位：パラシュートアダムス #14\n水温${weather.waterTemp}℃でBWOのハッチが期待できる。くもりの光条件でパラシュートポストが見やすい。\n\n🥈 第2位：フェザントテールニンフ #14-16（ビーズヘッド）\nハッチ前後にインジケーター付きで深場をドリフト。\n\n🥉 第3位：テンカラ逆さ毛鉤 #10-12\n源流のコンパクトな渓流では竿のコントロールが活きる。テンション＆リリースで誘う。\n\n🌊 ハッチ予測\n気温14℃・水温${weather.waterTemp}℃はBWOとヒゲナガのハッチ好条件。特に夕方のライズに注目。\n\n🎋 テンカラ vs ウェスタン\n水質良好で木が多い源流ではテンカラ有利。開けた区間はウェスタンのメンディングが有効。\n\n⏰ ベストタイム：6〜9時と17〜19時のイブニングハッチを狙え！`;
      const enFallback = `🪶 Fly Fishing Forecast — ${currentMonth}\n\n🥇 #1: Parachute Adams #14\nAt ${weather.waterTemp}℃ water, BWO hatch is likely. White post stays visible in flat light.\n\n🥈 #2: Pheasant Tail Nymph #14-16 (bead head)\nBetween hatches, drift deep under an indicator.\n\n🥉 #3: Tenkara Sakasa Kebari #10-12\nIn tight headwater gorges, rod control beats line management every time.\n\n🌊 Hatch Outlook\n14℃ air, ${weather.waterTemp}℃ water — prime BWO and sedge conditions. Watch for evening rises.\n\n🎋 Tenkara vs Western\nClear water + overhanging trees → tenkara wins. Open runs → western mending has the edge.\n\n⏰ Best windows: 6–9am and the 5–7pm evening hatch.`;
      try {
        const res = await fetch("/api/claude", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1200, messages: [{ role: "user", content: lang === "ja" ? jaPrompt : enPrompt }] }) });
        const data = await res.json(); setResponse(data.content?.[0]?.text || "");
      } catch { setResponse(lang === "ja" ? jaFallback : enFallback); }
      setLoading(false);
    })();
  }, []);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "flex-end" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#f8fff8", border: "2px solid #c8b800", borderRadius: "24px 24px 0 0", padding: "24px 20px 44px", width: "100%", maxHeight: "85vh", overflowY: "auto", animation: "slideUp 0.3s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div><div style={{ fontSize: "1rem", fontWeight: 700 }}>🪰 {lang === "ja" ? "AIフライ診断" : "AI Fly Advisor"}</div><div style={{ fontSize: "0.95rem", color: "#2d7a3a" }}>Claude AI · {fish?.name || (lang === "ja" ? "渓流フライ" : "Stream Fly")} · {currentMonth}</div></div>
          <button onClick={onClose} style={{ background: "#f0ebe0", border: "none", borderRadius: 8, padding: "6px 12px", color: "#5a5a4a", cursor: "pointer" }}>✕</button>
        </div>
        {loading ? <div style={{ textAlign: "center", padding: "40px 20px" }}><div style={{ fontSize: "2.5rem", animation: "spin 1s linear infinite", display: "inline-block" }}>🪶</div><p style={{ color: "#5a5a4a", marginTop: 12 }}>{lang === "ja" ? "今日のハッチと条件を分析中..." : "Analysing today's hatch and conditions..."}</p></div>
          : <div style={{ fontSize: "1rem", lineHeight: 1.8, color: "#3a3a2a", whiteSpace: "pre-wrap" }}>{response}</div>}
      </div>
    </div>
  );
}

// ─── FLY FISHING VIEW ────────────────────────────────────────────────────────

// ─── FLY FISHING DATA ────────────────────────────────────────────────────────
const HATCH_CALENDAR = [
  { month: { ja: "1月", en: "Jan" }, hatches: ["ミッジ（#18-24）"], activity: 30, color: "#334466" },
  { month: { ja: "2月", en: "Feb" }, hatches: ["ミッジ（#18-24）", "ブルーウィングオリーブ"], activity: 35, color: "#334466" },
  { month: { ja: "3月", en: "Mar" }, hatches: ["BWO", "ヒゲナガカワトビケラ", "オオクマ"], activity: 65, color: "#2d6a4f" },
  { month: { ja: "4月", en: "Apr" }, hatches: ["ヒゲナガ（最盛期）", "カゲロウ各種", "コカゲロウ"], activity: 90, color: "#1a8c5a" },
  { month: { ja: "5月", en: "May" }, hatches: ["モンカゲロウ", "エルモン", "アミカ"], activity: 95, color: "#1a8c5a" },
  { month: { ja: "6月", en: "Jun" }, hatches: ["モンカゲロウ（最盛期）", "ユスリカ", "クモ"], activity: 88, color: "#1a8c5a" },
  { month: { ja: "7月", en: "Jul" }, hatches: ["アユカワ", "ユスリカ", "陸生昆虫"], activity: 75, color: "#c06a10" },
  { month: { ja: "8月", en: "Aug" }, hatches: ["陸生昆虫（バッタ・アリ）", "ユスリカ"], activity: 60, color: "#c06a10" },
  { month: { ja: "9月", en: "Sep" }, hatches: ["コカゲロウ", "トビケラ秋期", "BWO"], activity: 82, color: "#2d6a4f" },
  { month: { ja: "10月", en: "Oct" }, hatches: ["BWO秋期", "ミッジ", "ヒゲナガ"], activity: 78, color: "#2d6a4f" },
  { month: { ja: "11月", en: "Nov" }, hatches: ["ミッジ", "BWO"], activity: 45, color: "#334466" },
  { month: { ja: "12月", en: "Dec" }, hatches: ["ミッジ（#20-26）"], activity: 28, color: "#334466" },
];

const FLY_PATTERNS = [
  { id: 1, name: { ja: "エルクヘアカディス", en: "Elk Hair Caddis" }, type: "dry", sizes: "#12-18", color: { ja: "タン/ブラウン", en: "Tan/Brown" }, season: { ja: "春〜秋", en: "Spring-Fall" }, target: { ja: "ヤマメ・イワナ・ニジマス", en: "Yamame, Iwana, Trout" }, technique: { ja: "流れに乗せてドライフライとして使用。ライズリングを狙ってキャスト。", en: "Present as a dry fly and follow the drift. Cast to rising fish." }, difficulty: "beginner", emoji: "🪶", tip: { ja: "フロータントをしっかり塗布し、ドラッグフリードリフトを心がける。", en: "Apply floatant generously and achieve a drag-free drift." } },
  { id: 2, name: { ja: "フェザントテールニンフ", en: "Pheasant Tail Nymph" }, type: "nymph", sizes: "#12-18", color: { ja: "ブラウン/ナチュラル", en: "Brown/Natural" }, season: { ja: "通年", en: "Year-round" }, target: { ja: "ヤマメ・イワナ・ニジマス", en: "Yamame, Iwana, Trout" }, technique: { ja: "インジケーターを使用したニンフィング。川底付近をナチュラルドリフト。", en: "Use an indicator for nymphing. Drift near the bottom with natural current." }, difficulty: "intermediate", emoji: "🪶", tip: { ja: "水深によってビーズヘッドあり・なしを使い分ける。", en: "Match weight to depth. Strike immediately when the indicator hesitates." } },
  { id: 3, name: { ja: "ウーリーバガー", en: "Woolly Bugger" }, type: "streamer", sizes: "#4-10", color: { ja: "オリーブ/ブラック", en: "Olive/Black" }, season: { ja: "通年（秋冬効果大）", en: "Year-round (peak autumn-winter)" }, target: { ja: "ブラウントラウト・イワナ・シーバス", en: "Brown Trout, Iwana, Seabass" }, technique: { ja: "ストリッピングでリトリーブ。大物はスローシンキングラインで深層を攻める。", en: "Strip retrieve. For big fish, use a slow-sink line to probe deeper water." }, difficulty: "intermediate", emoji: "🪶", tip: { ja: "チャート、ブラック、オリーブをローテーション。", en: "Color rotation is key. Try chartreuse, black, and olive." } },
  { id: 4, name: { ja: "パラシュートアダムス", en: "Parachute Adams" }, type: "dry", sizes: "#14-20", color: { ja: "グレー/ホワイト", en: "Grey/White" }, season: { ja: "春〜秋", en: "Spring-Fall" }, target: { ja: "ヤマメ・ニジマス", en: "Yamame, Trout" }, technique: { ja: "最もオールマイティなドライフライ。ハッチがわからない時のファーストチョイス。", en: "The most versatile dry fly. First choice when you are not sure what is hatching." }, difficulty: "beginner", emoji: "🪶", tip: { ja: "白いパラシュートポストで視認性が高く、暗い淵でも見やすい。", en: "The white post gives excellent visibility even in dark pools." } },
  { id: 5, name: { ja: "ミッジ（CDCダン）", en: "CDC Midge Dun" }, type: "dry", sizes: "#20-26", color: { ja: "グレー/オリーブ", en: "Grey/Olive" }, season: { ja: "冬〜早春", en: "Winter-Early Spring" }, target: { ja: "ニジマス・ヤマメ（選択的摂食時）", en: "Trout (selective feeders)" }, technique: { ja: "超繊細なプレゼンテーションが必要。ティペット6X〜7Xを使用。", en: "Requires ultra-delicate presentation. Use 6X-7X tippet." }, difficulty: "advanced", emoji: "🪶", tip: { ja: "冬の選択的ライズに対応する超小型フライ。", en: "Essential for selective winter risers." } },
  { id: 6, name: { ja: "テンカラ毛鉤（逆さ毛鉤）", en: "Tenkara Sakasa Kebari" }, type: "tenkara", sizes: "#8-14", color: { ja: "ブラウン/レッド", en: "Brown/Red" }, season: { ja: "春〜秋", en: "Spring-Fall" }, target: { ja: "ヤマメ・アマゴ・イワナ", en: "Yamame, Amago, Iwana" }, technique: { ja: "逆さに向いたハックルが水中で脈動。テンション＆リリースで誘う。", en: "Reversed hackle pulses in current. Use tension-and-release to animate." }, difficulty: "intermediate", emoji: "🎋", tip: { ja: "テンションをかけて、抜くの繰り返しが基本テクニック。", en: "The tension and release cycle is the core tenkara technique." } },
  { id: 7, name: { ja: "ゾンカー（レッド）", en: "Zonker (Red)" }, type: "streamer", sizes: "#2-8", color: { ja: "レッド/ホワイト", en: "Red/White" }, season: { ja: "秋〜冬", en: "Autumn-Winter" }, target: { ja: "大型ヤマメ・ブラウントラウト", en: "Large Yamame, Brown Trout" }, technique: { ja: "大型魚狙い。流れのある深みや大石の影にキャストし、素早くストリッピング。", en: "Big-fish streamer. Cast to deep runs behind boulders. Strip fast for reaction strikes." }, difficulty: "advanced", emoji: "🪶", tip: { ja: "秋の大型ヤマメ・産卵前は大型ストリーマーへの反応が特に良い。", en: "Pre-spawn autumn trout are highly aggressive toward large streamers." } },
  { id: 8, name: { ja: "ゴールドリブドヘアーズイヤー", en: "Gold Ribbed Hares Ear" }, type: "nymph", sizes: "#10-16", color: { ja: "タン/ゴールド", en: "Tan/Gold" }, season: { ja: "通年", en: "Year-round" }, target: { ja: "ヤマメ・ニジマス・イワナ", en: "Yamame, Trout, Iwana" }, technique: { ja: "スイングやニンフィングで使用。渓流・湧水川で特に効果的。", en: "Use for swinging or nymphing. Especially effective in spring creeks." }, difficulty: "beginner", emoji: "🪶", tip: { ja: "汎用性が最も高いニンフパターンの一つ。ビーズヘッドバージョンで底を流すのが鉄板。", en: "One of the most versatile nymph patterns. Bead-head version fished deep is reliable." } },
];

const CAST_TECHNIQUES = [
  { id: 1, name: { ja: "オーバーヘッドキャスト", en: "Overhead Cast" }, difficulty: "beginner", icon: "🎯", desc: { ja: "フライフィッシングの基本キャスト。10時〜2時のストロークで正確なプレゼンテーションを実現。", en: "The foundation of fly casting. 10-to-2 o clock stroke for accurate presentation." }, steps: { ja: ["ラインを水面に伸ばす", "ロッドを10時までバックキャスト", "ラインが完全に伸び切るのを待つ", "前方に2時までフォワードキャスト", "ループを開いてフライを着水させる"], en: ["Lay line on water", "Back-cast to 10 o clock", "Wait for back-loop to fully extend", "Forward cast to 2 o clock", "Open loop and land fly gently"] }, tip: { ja: "止めて、待つが最重要。急ぎすぎると美しいループが崩れる。", en: "Stop and wait is the most important principle. Rushing destroys the loop." } },
  { id: 2, name: { ja: "ロールキャスト", en: "Roll Cast" }, difficulty: "beginner", icon: "🌀", desc: { ja: "後方スペースがない渓流で必須のキャスト。バックキャストなしで前方へラインを展開できる。", en: "Essential when trees limit back-space. Rolls line forward without a back cast." }, steps: { ja: ["ラインを水面にゆっくり引き寄せる", "ロッドを1時まで引き上げる", "D型ループが形成されるのを確認", "前方に力強くロールするようにキャスト", "ループが展開してフライが着水"], en: ["Draw line slowly toward you on water", "Raise rod to 1 o clock", "Watch D-loop form behind rod", "Power forward with a rolling motion", "Loop unfurls and fly lands"] }, tip: { ja: "木が多い日本の渓流では最もよく使うキャスト。ゆっくりとD型ループを作ることが鍵。", en: "Used constantly in Japan tree-lined streams. Building a large D-loop is key." } },
  { id: 3, name: { ja: "テンカラキャスト", en: "Tenkara Cast" }, difficulty: "beginner", icon: "🎋", desc: { ja: "日本の伝統的なフライフィッシング。リールなし、固定ラインで渓流の魚を狙う洗練された技法。", en: "Japan ancient fixed-line fly fishing. No reel, elegantly simple and devastatingly effective." }, steps: { ja: ["竿の長さ分のラインを展開", "手首のスナップでバックキャスト", "フォワードストロークを前方へ", "フライを上流へ着水させる", "竿でテンションをコントロールしながら流す"], en: ["Extend line to rod length", "Back cast with wrist snap", "Forward stroke toward target", "Land fly upstream of fish", "Control drift tension with rod tip"] }, tip: { ja: "テンカラは道具がシンプルな分、技術が全て。竿でフライに生命感を与えることが肝心。", en: "Tenkara simplicity means technique is everything. Animate the fly with rod tip movement." } },
  { id: 4, name: { ja: "メンディング", en: "Mending" }, difficulty: "intermediate", icon: "〰️", desc: { ja: "ドラッグを防ぐためにラインを修正する技術。ドライフライ・ニンフィング両方で必須。", en: "Repositioning the fly line to prevent unnatural drag. Essential for both dry fly and nymphing." }, steps: { ja: ["キャスト後、ドラッグが掛かる前に", "ロッドを上流側に弧を描くように振る", "ラインを上流側にフリップ", "フライへのドラッグを最小化", "繰り返しメンディングしてドリフトを延長"], en: ["After casting, before drag sets in", "Sweep rod upstream in an arc", "Flip line upstream", "Minimize drag on the fly", "Repeat mends to extend drift"] }, tip: { ja: "アップストリームキャスト後は特に重要。美しいドラッグフリードリフトが魚を口を使わせる。", en: "Critical after upstream casts. A perfect drag-free drift triggers reluctant fish to eat." } },
  { id: 5, name: { ja: "リーチキャスト", en: "Reach Cast" }, difficulty: "intermediate", icon: "↗️", desc: { ja: "フライ着水前にラインを上流側に寄せる上級テクニック。長いドラッグフリードリフトを実現。", en: "Reach the rod upstream as the fly lands to instantly achieve a longer drag-free drift." }, steps: { ja: ["通常のフォワードキャストを開始", "ループが展開している間にロッドを上流へ伸ばす", "ラインが着水する前に位置を調整", "フライ着水と同時に理想的なラインポジション完成", "長いドラッグフリードリフトを楽しむ"], en: ["Begin forward cast normally", "While loop unfurls, reach rod upstream", "Adjust position before line lands", "Perfect line position at fly touchdown", "Enjoy long drag-free drift"] }, tip: { ja: "メンディングと組み合わせると最強。速い流れで対岸の魚を狙う時に特に有効。", en: "Combined with mending it is unstoppable. Especially useful targeting far-bank fish across fast water." } },
];

const TENKARA_RIVERS = [
  { name: "長良川（岐阜）", rating: 5.0, fish: { ja: "ヤマメ・アユ", en: "Yamame & Ayu" }, access: { ja: "高山本線・美濃太田駅", en: "Minoota Stn, Takayama Line" }, season: { ja: "3〜10月", en: "Mar-Oct" }, permit: { ja: "漁協遊漁券 ¥2,200/日", en: "¥2,200/day permit" } },
  { name: "奥多摩川（東京）", rating: 4.7, fish: { ja: "ヤマメ・ニジマス", en: "Yamame & Rainbow" }, access: { ja: "JR青梅線・奥多摩駅", en: "Okutama Stn, Ome Line" }, season: { ja: "3〜9月", en: "Mar-Sep" }, permit: { ja: "漁協遊漁券 ¥1,800/日", en: "¥1,800/day permit" } },
  { name: "神流川（群馬）", rating: 4.8, fish: { ja: "ヤマメ・イワナ", en: "Yamame & Iwana" }, access: { ja: "上信電鉄・下仁田駅よりバス", en: "Bus from Shimonita Stn" }, season: { ja: "3〜9月", en: "Mar-Sep" }, permit: { ja: "漁協遊漁券 ¥1,500/日", en: "¥1,500/day permit" } },
  { name: "四万十川（高知）", rating: 4.9, fish: { ja: "アユ・ヤマメ", en: "Ayu & Yamame" }, access: { ja: "土讃線・窪川駅よりバス", en: "Bus from Kubokawa Stn" }, season: { ja: "6〜10月（アユ）", en: "Jun-Oct (Ayu)" }, permit: { ja: "漁協遊漁券 ¥2,000/日", en: "¥2,000/day permit" } },
  { name: "矢部川（八女）", rating: 5.0, fish: { ja: "アユ・ヤマメ", en: "Ayu & Yamame" }, access: { ja: "八女市内から車20分。矢部川漁協で遊漁券（¥1,500/日）", en: "20min from Yame city. Yabeji Coop permit ¥1,500/day" }, season: { ja: "6〜10月（アユ）", en: "Jun-Oct (Ayu)" }, permit: { ja: "漁協遊漁券 ¥1,500/日", en: "¥1,500/day permit" } },
];

function FlyFishingView({ lang, weather, onOpenAI }) {
  const [flyTab, setFlyTab] = useState("patterns");
  const [selPattern, setSelPattern] = useState(null);
  const [selTechnique, setSelTechnique] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const currentMonthIdx = new Date().getMonth(); // live current month
  const currentMonth = HATCH_CALENDAR[currentMonthIdx];

  const flyTabs = [
    { k: "patterns", ja: "🪶 フライ図鑑", en: "🪶 Fly Patterns" },
    { k: "hatch", ja: "🦋 ハッチカレンダー", en: "🦋 Hatch Calendar" },
    { k: "cast", ja: "🎋 キャスト技術", en: "🎋 Cast Techniques" },
    { k: "tenkara", ja: "⛰️ テンカラ", en: "⛰️ Tenkara" },
    { k: "tenkarapro", ja: "🎋 テンカラ道場", en: "🎋 Tenkara Pro" },
  ];

  const typeFilters = [
    { k: "all", ja: "すべて", en: "All" },
    { k: "dry", ja: "ドライ", en: "Dry" },
    { k: "nymph", ja: "ニンフ", en: "Nymph" },
    { k: "streamer", ja: "ストリーマー", en: "Streamer" },
    { k: "tenkara", ja: "テンカラ", en: "Tenkara" },
  ];

  const filteredPatterns = FLY_PATTERNS.filter(p => typeFilter === "all" || p.type === typeFilter);

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, rgba(116,198,157,0.15), rgba(72,202,228,0.08))", border: "2px solid #FFE500", borderRadius: 18, padding: "16px 18px", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 2 }}>
              {lang === "ja" ? "🪶 フライフィッシング" : "🪶 Fly Fishing"}
            </div>
            <div style={{ fontSize: "1.05rem", color: "#5a5a4a", marginBottom: 10 }}>
              {lang === "ja" ? "日本の渓流・テンカラ・フライパターン" : "Japan streams · Tenkara · Fly patterns"}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ background: "#d0eae8", border: "2px solid #c8b800", borderRadius: 10, padding: "6px 12px", fontSize: "1rem", color: "#2d7a3a" }}>
                {lang === "ja" ? `🦋 ${currentMonth.month.ja} ハッチ活性: ${currentMonth.activity}%` : `🦋 ${currentMonth.month.en} Hatch Activity: ${currentMonth.activity}%`}
              </div>
            </div>
          </div>
          <div style={{ fontSize: "3rem", lineHeight: 1 }}>🪶</div>
        </div>
        <button onClick={onOpenAI} style={{ width: "100%", marginTop: 12, padding: "11px", background: "linear-gradient(135deg, rgba(116,198,157,0.2), rgba(72,202,228,0.1))", border: "2px solid #60b080", borderRadius: 12, color: "#2d7a3a", cursor: "pointer", fontFamily: "inherit", fontSize: "0.95rem", fontWeight: 700 }}>
          {s("aiFlyAdvisor", lang)}
        </button>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 14, overflowX: "auto" }}>
        {flyTabs.map(ft => (
          <button key={ft.k} onClick={() => setFlyTab(ft.k)} style={{ flex: "0 0 auto", padding: "7px 11px", borderRadius: 10, border: `1px solid ${flyTab === ft.k ? "rgba(116,198,157,0.6)" : "#d4cfc4"}`, background: flyTab === ft.k ? "rgba(116,198,157,0.15)" : "transparent", color: flyTab === ft.k ? "#74c69d" : "#8899aa", cursor: "pointer", fontFamily: "inherit", fontSize: "0.95rem", whiteSpace: "nowrap", fontWeight: flyTab === ft.k ? 700 : 400 }}>{ft[lang]}</button>
        ))}
      </div>

      {flyTab === "patterns" && (
        <div>
          {selPattern ? (
            <div style={{ animation: "fadeUp 0.3s ease" }}>
              <button onClick={() => setSelPattern(null)} style={{ background: "#e8e3d8", border: "none", borderRadius: 8, padding: "4px 10px", color: "#5a5a4a", cursor: "pointer", fontFamily: "inherit", fontSize: "1.05rem", marginBottom: 12 }}>← {lang === "ja" ? "戻る" : "Back"}</button>
              <div style={{ background: "linear-gradient(135deg, rgba(116,198,157,0.15), rgba(72,202,228,0.08))", border: "2px solid #FFE500", borderRadius: 18, padding: 18, marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ fontSize: "3rem", lineHeight: 1, animation: "float 3s ease-in-out infinite" }}>{selPattern.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "1.1rem", lineHeight: 1.2 }}>{selPattern.name[lang]}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                      <FlyTypeBadge type={selPattern.type} lang={lang} />
                      <DiffBadge level={selPattern.difficulty} lang={lang} />
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { la: { ja: "サイズ", en: "Sizes" }, v: selPattern.sizes },
                    { la: { ja: "カラー", en: "Color" }, v: selPattern.color[lang] },
                    { la: { ja: "シーズン", en: "Season" }, v: selPattern.season[lang] },
                    { la: { ja: "ターゲット", en: "Target" }, v: selPattern.target[lang] },
                  ].map(row => (
                    <div key={row.la.ja} style={{ display: "flex", gap: 12, alignItems: "center", background: "#fffdf8", borderRadius: 10, padding: "9px 12px" }}>
                      <span style={{ fontSize: "1rem", color: "#5a5a4a", minWidth: 64 }}>{row.la[lang]}</span>
                      <span style={{ fontSize: "0.95rem", fontWeight: 600 }}>{row.v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: "#fffdf8", border: "2px solid #e0dbd0", borderRadius: 14, padding: 14, marginBottom: 10 }}>
                <div style={{ fontSize: "1rem", color: "#2d7a3a", fontWeight: 700, marginBottom: 7 }}>{lang === "ja" ? "🎯 プレゼンテーション" : "🎯 Presentation"}</div>
                <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.7, color: "#3a3a2a" }}>{selPattern.technique[lang]}</p>
              </div>
              <div style={{ background: "linear-gradient(135deg, rgba(116,198,157,0.12), transparent)", border: "2px solid #FFE500", borderRadius: 14, padding: 14 }}>
                <div style={{ fontSize: "1rem", color: "#2d7a3a", fontWeight: 700, marginBottom: 7 }}>💡 {s("proTip", lang)}</div>
                <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.7, color: "#3a3a2a" }}>{selPattern.tip[lang]}</p>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", gap: 5, marginBottom: 12, overflowX: "auto", paddingBottom: 2 }}>
                {typeFilters.map(tf => (
                  <button key={tf.k} onClick={() => setTypeFilter(tf.k)} style={{ flex: "0 0 auto", padding: "5px 12px", borderRadius: 99, border: `1px solid ${typeFilter === tf.k ? "rgba(116,198,157,0.6)" : "#d4cfc4"}`, background: typeFilter === tf.k ? "rgba(116,198,157,0.14)" : "transparent", color: typeFilter === tf.k ? "#74c69d" : "#8899aa", cursor: "pointer", fontFamily: "inherit", fontSize: "0.95rem", whiteSpace: "nowrap" }}>{tf[lang]}</button>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {filteredPatterns.map((p, i) => (
                  <div key={p.id} onClick={() => setSelPattern(p)} style={{ background: "rgba(116,198,157,0.06)", border: "2px solid #FFE500", borderRadius: 14, padding: "14px 12px", cursor: "pointer", animation: `fadeUp ${0.2 + i * 0.06}s ease both`, position: "relative" }}
                    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                    <div style={{ fontSize: "1.8rem", marginBottom: 6, animation: "float 3s ease-in-out infinite", animationDelay: `${i * 0.3}s` }}>{p.emoji}</div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.3, marginBottom: 6 }}>{p.name[lang]}</div>
                    <FlyTypeBadge type={p.type} lang={lang} />
                    <div style={{ fontSize: "0.95rem", color: "#5a5a4a", marginTop: 7 }}>🎣 {p.sizes}</div>
                    <div style={{ fontSize: "0.95rem", color: "#5a5a4a", marginTop: 2 }}>📅 {p.season[lang]}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {flyTab === "hatch" && (
        <div>
          <div style={{ fontSize: "1.05rem", color: "#5a5a4a", marginBottom: 14 }}>
            {lang === "ja" ? "日本の渓流における月別ハッチ（羽化）ガイド" : "Monthly hatch guide for Japan's mountain streams"}
          </div>
          <div style={{ background: "#fffdf8", border: "2px solid #e0dbd0", borderRadius: 18, padding: 16, marginBottom: 14 }}>
            <div style={{ fontSize: "0.95rem", color: "#5a5a4a", marginBottom: 12, letterSpacing: "0.07em" }}>{lang === "ja" ? "年間ハッチ活性" : "ANNUAL HATCH ACTIVITY"}</div>
            <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 80 }}>
              {HATCH_CALENDAR.map((m, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: "100%", height: `${m.activity * 0.7}px`, background: i === currentMonthIdx ? "#74c69d" : m.color, borderRadius: "3px 3px 0 0", opacity: i === currentMonthIdx ? 1 : 0.6, boxShadow: i === currentMonthIdx ? "0 0 10px #FFE50044" : "none" }} />
                  <div style={{ fontSize: "1rem", color: i === currentMonthIdx ? "#74c69d" : "#8899aa", fontWeight: i === currentMonthIdx ? 700 : 400 }}>{m.month[lang]}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {HATCH_CALENDAR.map((m, i) => (
              <div key={i} style={{ background: i === currentMonthIdx ? "rgba(116,198,157,0.1)" : "#fffdf8", border: `1px solid ${i === currentMonthIdx ? "rgba(116,198,157,0.35)" : "#e0dbd0"}`, borderRadius: 14, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                  <div style={{ fontWeight: 700, fontSize: "1.05rem", color: i === currentMonthIdx ? "#74c69d" : "#e8e0d0" }}>
                    {m.month[lang]} {i === currentMonthIdx && (lang === "ja" ? "← 今月" : "← This Month")}
                  </div>
                  <div style={{ fontSize: "1rem", color: m.activity >= 80 ? "#74c69d" : m.activity >= 50 ? "#f4a261" : "#8899aa" }}>
                    {"●".repeat(Math.round(m.activity / 20))}{"○".repeat(5 - Math.round(m.activity / 20))} {m.activity}%
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {m.hatches.map(h => (
                    <span key={h} style={{ background: "#e0f0e8", border: "2px solid #FFE500", borderRadius: 99, padding: "3px 9px", fontSize: "0.95rem", color: "#2d7a3a" }}>🦋 {h}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {flyTab === "cast" && (
        <div>
          {selTechnique ? (
            <div style={{ animation: "fadeUp 0.3s ease" }}>
              <button onClick={() => setSelTechnique(null)} style={{ background: "#e8e3d8", border: "none", borderRadius: 8, padding: "4px 10px", color: "#5a5a4a", cursor: "pointer", fontFamily: "inherit", fontSize: "1.05rem", marginBottom: 12 }}>← {lang === "ja" ? "戻る" : "Back"}</button>
              <div style={{ background: "#e8f4ec", border: "2px solid #FFE500", borderRadius: 18, padding: 18, marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontSize: "2.5rem" }}>{selTechnique.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{selTechnique.name[lang]}</div>
                    <DiffBadge level={selTechnique.difficulty} lang={lang} />
                  </div>
                </div>
                <p style={{ margin: "0 0 14px", fontSize: "0.95rem", color: "#3a3a2a", lineHeight: 1.7 }}>{selTechnique.desc[lang]}</p>
                <div style={{ fontSize: "1rem", color: "#2d7a3a", fontWeight: 700, marginBottom: 8 }}>{lang === "ja" ? "📋 手順" : "📋 Steps"}</div>
                {selTechnique.steps[lang].map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#c8e8d0", border: "2px solid #60b080", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.95rem", fontWeight: 700, color: "#2d7a3a", flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ fontSize: "0.83rem", color: "#3a3a2a", lineHeight: 1.5, paddingTop: 2 }}>{step}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "linear-gradient(135deg, rgba(116,198,157,0.1), transparent)", border: "2px solid #FFE500", borderRadius: 14, padding: 14 }}>
                <div style={{ fontSize: "1rem", color: "#2d7a3a", fontWeight: 700, marginBottom: 7 }}>💡 {s("proTip", lang)}</div>
                <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.7, color: "#3a3a2a" }}>{selTechnique.tip[lang]}</p>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: "1.05rem", color: "#5a5a4a", marginBottom: 4 }}>
                {lang === "ja" ? "フライキャスト技術 — タップして詳細を見る" : "Fly casting techniques — tap for step-by-step guide"}
              </div>
              {CAST_TECHNIQUES.map((ct, i) => (
                <div key={ct.id} onClick={() => setSelTechnique(ct)} style={{ background: "#fffdf8", border: "2px solid #e0dbd0", borderRadius: 14, padding: "14px 16px", cursor: "pointer", display: "flex", gap: 12, alignItems: "center", animation: `fadeUp ${0.18 + i * 0.07}s ease both` }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(116,198,157,0.07)"}
                  onMouseLeave={e => e.currentTarget.style.background = "#fffdf8"}>
                  <div style={{ fontSize: "2rem" }}>{ct.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: 4 }}>{ct.name[lang]}</div>
                    <DiffBadge level={ct.difficulty} lang={lang} />
                    <div style={{ fontSize: "1rem", color: "#5a5a4a", marginTop: 5, lineHeight: 1.4 }}>{ct.desc[lang].substring(0, 55)}...</div>
                  </div>
                  <div style={{ color: "#2d7a3a", fontSize: "1.05rem" }}>→</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {flyTab === "tenkarapro" && (
        <div style={{ animation: "fadeUp 0.4s ease" }}>
          <div style={{ background: "linear-gradient(135deg,rgba(45,106,79,0.12),rgba(116,198,157,0.06))", border: "2px solid #FFE500", borderRadius: 18, padding: 16, marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 4 }}>🎋 {lang === "ja" ? "テンカラ道場" : "Tenkara Dojo"}</div>
            <div style={{ fontSize: "0.88rem", color: "#5a5a4a" }}>{lang === "ja" ? "竿選び・ライン計算・結び方・渓流ガイド" : "Rod selection · Line formula · Knots · Stream guide"}</div>
          </div>

          {/* Rod selector */}
          <div style={{ background: "#fffdf8", border: "2px solid #e0dbd0", borderRadius: 14, padding: 14, marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 10, color: "#2d7a3a" }}>🎋 {lang === "ja" ? "竿の長さガイド" : "Rod Length Guide"}</div>
            {TENKARA_RODS.map(rod => (
              <div key={rod.length} style={{ background: "#f5f0e8", borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>🎋 {rod.length}m</span>
                  <span style={{ fontSize: "0.82rem", color: "#0d7377", background: "#e0f2f2", borderRadius: 99, padding: "2px 8px" }}>{lang === "ja" ? `ライン: ${rod.line}` : `Line: ${rod.line}`}</span>
                </div>
                <div style={{ fontSize: "0.88rem", color: "#2d7a3a", fontWeight: 600, marginBottom: 2 }}>📍 {rod.target[lang]}</div>
                <div style={{ fontSize: "0.82rem", color: "#5a5a4a" }}>💡 {rod.tip[lang]}</div>
              </div>
            ))}
          </div>

          {/* Line formula */}
          <div style={{ background: "#e0f0e8", border: "2px solid #FFE500", borderRadius: 14, padding: 14, marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 8, color: "#2d7a3a" }}>📏 {lang === "ja" ? "ライン長さの公式" : "Line Length Formula"}</div>
            <div style={{ fontSize: "0.88rem", color: "#1a4a22", lineHeight: 1.7, fontWeight: 600 }}>{LINE_FORMULA[lang]}</div>
            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[3.0, 3.3, 3.6, 3.9, 4.5].map(len => (
                <div key={len} style={{ background: "#fffdf8", border: "1px solid #FFE500", borderRadius: 8, padding: "6px 10px", textAlign: "center" }}>
                  <div style={{ fontSize: "0.78rem", color: "#5a5a4a" }}>{len}m竿</div>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#2d7a3a" }}>{len.toFixed(1)}〜{(len * 1.3).toFixed(1)}m</div>
                </div>
              ))}
            </div>
          </div>

          {/* Knots */}
          <div style={{ background: "#fffdf8", border: "2px solid #e0dbd0", borderRadius: 14, padding: 14, marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 10, color: "#2d7a3a" }}>🪢 {lang === "ja" ? "テンカラの結び方" : "Tenkara Knots"}</div>
            {TENKARA_KNOTS.map((knot, ki) => (
              <div key={ki} style={{ background: "#f5f0e8", borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: "0.92rem", marginBottom: 8 }}>{knot.name[lang]}</div>
                {knot.steps[lang].map((step, si) => (
                  <div key={si} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 4 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#2d7a3a", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 700, flexShrink: 0 }}>{si+1}</div>
                    <div style={{ fontSize: "0.83rem", color: "#3a3a2a", paddingTop: 2 }}>{step}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
      {flyTab === "tenkara" && (
        <div>
          <div style={{ background: "linear-gradient(135deg, rgba(72,202,228,0.08))", border: "2px solid #FFE500", borderRadius: 18, padding: 18, marginBottom: 14 }}>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 6 }}>🎋 {lang === "ja" ? "テンカラとは" : "What is Tenkara?"}</div>
            <p style={{ margin: "0 0 12px", fontSize: "0.95rem", color: "#3a3a2a", lineHeight: 1.7 }}>
              {lang === "ja"
                ? "テンカラは日本発祥の伝統的なフライフィッシング。リールを使わず、竿の長さ分の固定ラインと毛鉤だけのシンプルなシステム。「一竿・一線・一毛鉤」の哲学が世界中で人気を集めている。"
                : "Tenkara is Japan's ancient form of fly fishing — no reel, just a rod, fixed line, and fly. 'One rod, one line, one fly' philosophy has captivated anglers worldwide for its elegant simplicity."}
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { ja: "🎋 リールなし", en: "🎋 No reel" },
                { ja: "📏 固定ライン", en: "📏 Fixed line" },
                { ja: "🪶 毛鉤のみ", en: "🪶 Single fly" },
                { ja: "⛰️ 渓流特化", en: "⛰️ Stream-focused" },
              ].map(b => <span key={b.ja} style={{ background: "#e0f0e8", border: "2px solid #FFE500", borderRadius: 8, padding: "4px 10px", fontSize: "0.95rem", color: "#2d7a3a" }}>{b[lang]}</span>)}
            </div>
          </div>

          <div style={{ fontSize: "0.95rem", color: "#5a5a4a", marginBottom: 10, letterSpacing: "0.07em" }}>{lang === "ja" ? "テンカラの名川" : "TOP TENKARA RIVERS IN JAPAN"}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
            {TENKARA_RIVERS.map((r, i) => (
              <div key={r.name} style={{ background: "#fffdf8", border: "2px solid #e0dbd0", borderRadius: 14, padding: "13px 15px", animation: `fadeUp ${0.18 + i * 0.08}s ease both` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>📍 {r.name}</div>
                  <div style={{ color: "#c06a10", fontSize: "1.05rem" }}>⭐ {r.rating}</div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {[
                    { icon: "🐟", v: r.fish[lang] },
                    { icon: "🚃", v: r.access[lang] },
                    { icon: "📅", v: r.season[lang] },
                    { icon: "🎫", v: r.permit[lang] },
                  ].map(d => <span key={d.v} style={{ fontSize: "0.95rem", color: "#5a5a4a", background: "#fffdf8", borderRadius: 8, padding: "3px 8px" }}>{d.icon} {d.v}</span>)}
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(72,202,228,0.06)", border: "2px solid #FFE500", borderRadius: 14, padding: 14 }}>
            <div style={{ fontSize: "1rem", color: "#0d7377", fontWeight: 700, marginBottom: 8 }}>💡 {lang === "ja" ? "テンカラの基本セット" : "Basic Tenkara Setup"}</div>
            {[
              { la: { ja: "竿", en: "Rod" }, v: { ja: "3.3〜4.5m カーボン or 竹竿", en: "3.3–4.5m carbon or bamboo" } },
              { la: { ja: "ライン", en: "Line" }, v: { ja: "フルロロ or フロロ 竿の長さ×1〜1.3", en: "Furled or fluoro, rod-length × 1–1.3" } },
              { la: { ja: "ティペット", en: "Tippet" }, v: { ja: "ナイロン 4X〜6X (60〜90cm)", en: "Nylon 4X–6X (60–90cm)" } },
              { la: { ja: "毛鉤", en: "Fly" }, v: { ja: "逆さ毛鉤 #10〜14（3〜5本あれば十分）", en: "Sakasa kebari #10–14 (3–5 flies is all you need)" } },
            ].map(row => (
              <div key={row.la.ja} style={{ display: "flex", gap: 10, marginBottom: 6, fontSize: "0.92rem" }}>
                <span style={{ color: "#5a5a4a", minWidth: 50 }}>{row.la[lang]}</span>
                <span style={{ color: "#0d7377" }}>{row.v[lang]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAP VIEW ────────────────────────────────────────────────────────────────
// ─── LEAFLET MAP COMPONENT ───────────────────────────────────────────────────
// Uses Leaflet + OpenStreetMap — real terrain, real tiles, no API key needed
function LeafletMap({ spots, userLocation, activeSpot, setActiveSpot, lang, activeUsers = [] }) {
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);

  // Load Leaflet CSS + JS once
  useEffect(() => {
    if (document.getElementById("leaflet-css")) return;
    const link = document.createElement("link");
    link.id = "leaflet-css";
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => initMap();
    document.head.appendChild(script);
  }, []);

  function initMap() {
    if (!mapRef.current || leafletRef.current) return;
    const L = window.L;

    // Default center: Japan
    const center = userLocation
      ? [userLocation.lat, userLocation.lng]
      : [35.68, 139.69];
    const zoom = userLocation ? 9 : 5;

    const map = L.map(mapRef.current, { zoomControl: true, attributionControl: true }).setView(center, zoom);

    // OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    leafletRef.current = map;
    renderMarkers();
  }

  function renderMarkers() {
    const L = window.L;
    if (!L || !leafletRef.current) return;
    const map = leafletRef.current;

    // Clear old markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    // Add spot markers with crowding colors
    spots.forEach(spot => {
      const coords = SPOT_COORDS[spot.name] || (spot.lat ? { lat: spot.lat, lng: spot.lng } : null);
      if (!coords) return;

      const crowding = getCrowdingLevel(coords.lat, coords.lng, activeUsers);
      const bgColor = crowding.level === "crowded" ? "#b82030" : crowding.level === "moderate" ? "#c06a10" : "#1a1a14";
      const glowStyle = crowding.level === "crowded"
        ? "box-shadow:0 0 16px rgba(184,32,48,0.8),0 2px 8px rgba(0,0,0,0.35);"
        : crowding.level === "moderate"
        ? "box-shadow:0 0 10px rgba(192,106,16,0.6),0 2px 8px rgba(0,0,0,0.35);"
        : "box-shadow:0 2px 8px rgba(0,0,0,0.35);";

      const icon = L.divIcon({
        html: `<div style="background:${bgColor};border:3px solid white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;${glowStyle}cursor:pointer">${spot.icon || "📍"}</div>`,
        className: "",
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const crowdText = crowding.count > 0 ? `<div style="color:${bgColor};font-weight:700;font-size:11px;margin-top:2px">${crowding.label[lang]} · ${crowding.count}人</div>` : "";

      const marker = L.marker([coords.lat, coords.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:sans-serif;min-width:160px">
            <div style="font-weight:700;font-size:14px;margin-bottom:4px">${spot.name}</div>
            <div style="color:#0d7377;font-size:12px">🐟 ${typeof spot.fish === "object" ? spot.fish[lang] : (spot.fishName || spot.fish || "")}</div>
            <div style="color:#5a5a4a;font-size:12px">⭐ ${spot.rating} · ${typeof spot.type === "object" ? spot.type[lang] : spot.type}</div>
            ${spot.distKm != null ? `<div style="color:#b8a000;font-weight:700;font-size:12px;margin-top:2px">📏 ${spot.distKm} km</div>` : ""}
            ${crowdText}
          </div>
        `)
        .on("click", () => setActiveSpot(spot));

      markersRef.current.push(marker);
    });

    // Add active user dots (anonymous)
    activeUsers.forEach((user, i) => {
      if (!user.lat || !user.lng) return;
      const icon = L.divIcon({
        html: `<div style="background:#b8a000;border:2px solid white;border-radius:50%;width:12px;height:12px;box-shadow:0 0 8px rgba(45,122,58,0.6);opacity:0.8"></div>`,
        className: "",
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });
      const marker = L.marker([user.lat, user.lng], { icon })
        .addTo(map)
        .bindPopup(`<div style="font-family:sans-serif;font-size:12px;color:#b8a000;font-weight:700">${lang === "ja" ? "🎣 釣り中のアングラー" : "🎣 Angler fishing here"}</div>`);
      markersRef.current.push(marker);
    });

    // User location marker
    if (userLocation) {
      if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
      const userIcon = L.divIcon({
        html: `<div style="background:#b82030;border:3px solid white;border-radius:50%;width:20px;height:20px;box-shadow:0 0 0 4px rgba(184,32,48,0.3)"></div>`,
        className: "",
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup(`<div style="font-family:sans-serif;font-weight:700">${lang === "ja" ? "現在地" : "You are here"}<br><span style="font-weight:400;font-size:12px">${userLocation.display || ""}</span></div>`);
    }
  }

  // Re-render markers when spots, location, or active users changes
  useEffect(() => {
    if (window.L && leafletRef.current) {
      renderMarkers();
    }
  }, [spots, userLocation, lang, activeUsers]);

  // Init map if Leaflet was already loaded
  useEffect(() => {
    if (window.L && !leafletRef.current && mapRef.current) {
      initMap();
    }
  }, []);

  // Fly to active spot when selected from list
  useEffect(() => {
    if (!activeSpot || !leafletRef.current) return;
    const coords = SPOT_COORDS[activeSpot.name] || (activeSpot.lat ? { lat: activeSpot.lat, lng: activeSpot.lng } : null);
    if (coords) leafletRef.current.flyTo([coords.lat, coords.lng], 12, { duration: 1 });
  }, [activeSpot]);

  return (
    <div
      ref={mapRef}
      style={{ height: 300, borderRadius: 16, overflow: "hidden", marginBottom: 14, border: "2px solid #FFE500", position: "relative", zIndex: 1, background: "#e8f4f4" }}
    />
  );
}

// ─── AR CAMERA VIEW ──────────────────────────────────────────────────────────
function ARCameraView({ userLocation, spots, lang, onClose, weather }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [compass, setCompass] = useState(null);
  const [camError, setCamError] = useState(null);
  const [arSpots, setArSpots] = useState([]);
  const [permission, setPermission] = useState("pending");
  const streamRef = useRef(null);

  // Calculate bearing from user to a spot
  function getBearing(lat1, lng1, lat2, lng2) {
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const lat1r = lat1 * Math.PI / 180;
    const lat2r = lat2 * Math.PI / 180;
    const y = Math.sin(dLng) * Math.cos(lat2r);
    const x = Math.cos(lat1r) * Math.sin(lat2r) - Math.sin(lat1r) * Math.cos(lat2r) * Math.cos(dLng);
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  }

  // Calculate distance in meters
  function getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  // Format distance
  function fmtDist(m) {
    return m < 1000 ? `${Math.round(m)}m` : `${(m/1000).toFixed(1)}km`;
  }

  // Start camera
  useEffect(() => {
    async function startCam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setPermission("granted");
      } catch (e) {
        setCamError(lang === "ja" ? "カメラへのアクセスが拒否されました" : "Camera access denied");
        setPermission("denied");
      }
    }
    startCam();
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  // Compass listener
  useEffect(() => {
    function handleOrientation(e) {
      if (e.absolute && e.alpha !== null) {
        setCompass(e.alpha);
      } else if (e.webkitCompassHeading !== undefined) {
        setCompass(e.webkitCompassHeading);
      }
    }

    if (typeof DeviceOrientationEvent !== 'undefined') {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then(p => { if (p === 'granted') window.addEventListener('deviceorientation', handleOrientation); })
          .catch(() => {});
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
      }
    }
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  // Calculate AR spot positions
  useEffect(() => {
    if (!userLocation || compass === null) return;

    const nearby = spots
      .filter(s => {
        const coords = SPOT_COORDS[s.name] || (s.lat ? { lat: s.lat, lng: s.lng } : null);
        if (!coords) return false;
        const dist = getDistance(userLocation.lat, userLocation.lng, coords.lat, coords.lng);
        return dist < 50000; // within 50km
      })
      .map(s => {
        const coords = SPOT_COORDS[s.name] || { lat: s.lat, lng: s.lng };
        const dist = getDistance(userLocation.lat, userLocation.lng, coords.lat, coords.lng);
        const bearing = getBearing(userLocation.lat, userLocation.lng, coords.lat, coords.lng);
        // Angle relative to where camera is pointing
        let relAngle = bearing - compass;
        if (relAngle > 180) relAngle -= 360;
        if (relAngle < -180) relAngle += 360;
        // Only show spots within 60 degrees of camera direction
        const inView = Math.abs(relAngle) < 60;
        // X position: center=50%, ±60deg maps to 0-100%
        const xPct = 50 + (relAngle / 60) * 50;
        return { ...s, dist, bearing, relAngle, inView, xPct, coords };
      })
      .filter(s => s.inView)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 5);

    setArSpots(nearby);
  }, [compass, userLocation, spots]);

  const FOV = 60; // field of view degrees

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 500, display: "flex", flexDirection: "column" }}>
      {/* Camera feed */}
      <video ref={videoRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} playsInline muted />

      {/* AR overlays */}
      {permission === "granted" && arSpots.map((spot, i) => {
        const score = calcSpotScore(spot, weather, [], []);
        const scoreColor = score >= 80 ? "#00ff88" : score >= 60 ? "#FFE500" : "#ff6644";
        return (
          <div key={spot.id || i} style={{
            position: "absolute",
            left: `${spot.xPct}%`,
            top: `${20 + (i * 14)}%`,
            transform: "translateX(-50%)",
            animation: "fadeUp 0.4s ease",
            zIndex: 10,
          }}>
            {/* Connector line */}
            <div style={{ width: 2, height: 30, background: scoreColor, margin: "0 auto", opacity: 0.7 }} />
            {/* Spot card */}
            <div style={{
              background: "rgba(0,0,0,0.75)",
              border: `2px solid ${scoreColor}`,
              borderRadius: 12,
              padding: "8px 12px",
              minWidth: 140,
              backdropFilter: "blur(8px)",
              boxShadow: `0 0 20px ${scoreColor}44`,
            }}>
              <div style={{ color: scoreColor, fontWeight: 800, fontSize: "0.82rem", marginBottom: 2 }}>
                {spot.icon} {spot.name.length > 12 ? spot.name.slice(0, 12) + "…" : spot.name}
              </div>
              <div style={{ color: "white", fontSize: "0.72rem", opacity: 0.85 }}>
                📏 {fmtDist(spot.dist)} · ⭐ {spot.rating}
              </div>
              <div style={{ color: typeof spot.fish === "object" ? "white" : "white", fontSize: "0.7rem", opacity: 0.75, marginTop: 2 }}>
                🐟 {typeof spot.fish === "object" ? spot.fish[lang] : (spot.fishName || spot.fish || "")}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 99 }}>
                  <div style={{ width: `${score}%`, height: "100%", background: scoreColor, borderRadius: 99 }} />
                </div>
                <span style={{ color: scoreColor, fontWeight: 800, fontSize: "0.75rem" }}>{score}</span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Compass indicator */}
      <div style={{ position: "absolute", top: 60, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 99, padding: "6px 16px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: "1rem" }}>🧭</span>
        <span style={{ color: "white", fontSize: "0.82rem", fontWeight: 700 }}>
          {compass !== null ? `${Math.round(compass)}°` : (lang === "ja" ? "コンパス取得中..." : lang === "es" ? "Obteniendo brújula..." : "Getting compass...")}
        </span>
        {arSpots.length > 0 && (
          <span style={{ color: "#00ff88", fontSize: "0.75rem" }}>
            · {lang === "ja" ? `${arSpots.length}スポット` : `${arSpots.length} spots`}
          </span>
        )}
      </div>

      {/* No spots message */}
      {permission === "granted" && arSpots.length === 0 && compass !== null && (
        <div style={{ position: "absolute", bottom: 140, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12, padding: "12px 20px", textAlign: "center" }}>
          <div style={{ color: "white", fontSize: "0.88rem", fontWeight: 700 }}>
            {lang === "ja" ? "📷 周りを見回してください" : "📷 Look around to find spots"}
          </div>
          <div style={{ color: "#aaa", fontSize: "0.75rem", marginTop: 4 }}>
            {lang === "ja" ? "60°以内にスポットが表示されます" : "Spots within 60° will appear"}
          </div>
        </div>
      )}

      {/* Error message */}
      {camError && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: "3rem" }}>📷</div>
          <div style={{ color: "white", fontWeight: 700, fontSize: "1rem" }}>{camError}</div>
          <div style={{ color: "#aaa", fontSize: "0.82rem" }}>
            {lang === "ja" ? "設定からカメラを許可してください" : "Please allow camera in settings"}
          </div>
        </div>
      )}

      {/* Crosshair */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }}>
        <div style={{ width: 40, height: 40, border: "2px solid rgba(255,255,255,0.5)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 4, height: 4, background: "rgba(255,255,255,0.8)", borderRadius: "50%" }} />
        </div>
      </div>

      {/* Close button */}
      <button onClick={onClose} style={{
        position: "absolute", top: 16, right: 16,
        width: 44, height: 44, borderRadius: "50%",
        background: "rgba(0,0,0,0.7)", border: "2px solid rgba(255,255,255,0.3)",
        color: "white", fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
      }}>✕</button>

      {/* Bottom bar */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.8))", padding: "20px 16px 32px", textAlign: "center" }}>
        <div style={{ color: "white", fontSize: "0.78rem", opacity: 0.7 }}>
          {lang === "ja" ? "🎣 釣りナビ AR — カメラを釣り場に向けてください" : "🎣 CastWise AR — Point camera toward fishing spots"}
        </div>
      </div>
    </div>
  );
}



  const REGIONS = [
    { key: "kyushu",   ja: "九州",     en: "Kyushu",    emoji: "🌋" },
    { key: "hokkaido", ja: "北海道",   en: "Hokkaido",  emoji: "🏔️" },
    { key: "kanto",    ja: "関東",     en: "Kanto",     emoji: "🗼" },
    { key: "kansai",   ja: "関西",     en: "Kansai",    emoji: "⛩️" },
    { key: "chubu",    ja: "中部",     en: "Chubu",     emoji: "🏯" },
    { key: "puertorico", ja: "プエルトリコ", en: "Puerto Rico", es: "Puerto Rico", emoji: "🌴" },
    { key: "kansai",   ja: "関西",     en: "Kansai",    emoji: "⛩️" },
    { key: "chubu",    ja: "中部",   en: "Chubu",     emoji: "🗻" },
    { key: "all",      ja: "全国",   en: "All Japan", emoji: "🗾" },
  ];

  const rawSpots = selectedFish
    ? selectedFish.spots.map((sp, i) => ({ ...sp, id: i + 100, fishName: selectedFish.name, icon: selectedFish.emoji || "📍" }))
    : MAP_SPOTS.filter(sp => regionFilter === "all" || sp.region === regionFilter);

  const spots = rawSpots.map(sp => {
    const coords = SPOT_COORDS[sp.name] || (sp.lat ? { lat: sp.lat, lng: sp.lng } : null);
    if (!coords || !userLocation) return { ...sp, distKm: null };
    return { ...sp, distKm: Math.round(distKm(userLocation.lat, userLocation.lng, coords.lat, coords.lng)) };
  }).sort((a, b) => (a.distKm ?? 9999) - (b.distKm ?? 9999));

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <h2 style={{ margin: "0 0 4px", fontSize: "1.2rem" }}>{selectedFish ? `${selectedFish.name}の釣り場` : (lang === "ja" ? "近くの釣り場" : lang === "es" ? "Spots Cerca" : "Spots Near You")}</h2>

      {/* AR Camera button */}
      <button onClick={() => setShowAR(true)} style={{ width: "100%", marginBottom: 10, padding: "10px", background: "#1a1a14", border: "none", borderRadius: 12, color: "#FFE500", cursor: "pointer", fontFamily: "inherit", fontSize: "0.88rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        📷 {lang === "ja" ? "ARカメラで釣り場を探す" : lang === "es" ? "Buscar con Cámara AR" : "Find Spots with AR Camera"}
      </button>

      {/* AR Camera View */}
      {showAR && (
        <ARCameraView
          userLocation={userLocation}
          spots={MAP_SPOTS}
          lang={lang}
          weather={weather}
          onClose={() => setShowAR(false)}
        />
      )}

      {/* Mode toggle */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {[{ k: "spots", ja: "📍 釣り場", en: "📍 Spots" }, { k: "prediction", ja: "🔮 AI予測", en: "🔮 AI Predict" }].map(m => (
          <button key={m.k} onClick={() => setMapMode(m.k)} style={{ flex: 1, padding: "8px", background: mapMode === m.k ? "#e0f2f2" : "#fffdf8", border: `2px solid ${mapMode === m.k ? "#1a1a14" : "#d4cfc4"}`, borderRadius: 10, color: mapMode === m.k ? "#1a1a14" : "#5a5a4a", cursor: "pointer", fontFamily: "inherit", fontSize: "0.88rem", fontWeight: mapMode === m.k ? 700 : 400 }}>{m[lang]}</button>
        ))}
      </div>

      {/* Active users banner */}
      {activeUsers.length > 0 && (
        <div style={{ background: "#e0f2f2", border: "2px solid #FFE500", borderRadius: 10, padding: "8px 12px", marginBottom: 8, display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2d7a3a", boxShadow: "0 0 8px #b8a000", flexShrink: 0 }} />
          <span style={{ color: "#0d7377", fontWeight: 700 }}>
            {lang === "ja" ? `今 ${activeUsers.length}人が釣り中` : `${activeUsers.length} anglers fishing now`}
          </span>
          <span style={{ color: "#5a5a4a", fontSize: "0.78rem" }}>
            {lang === "ja" ? "🔴混雑 🟠普通 🟢空き" : "🔴Crowded 🟠Moderate 🟢Quiet"}
          </span>
        </div>
      )}

      {/* Location sharing toggle */}
      {setLocationSharing && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: locationSharing ? "#e0f2f2" : "#f5f0e8", border: `1px solid ${locationSharing ? "#74c69d" : "#d4cfc4"}`, borderRadius: 10, padding: "8px 12px", marginBottom: 8 }}>
          <span style={{ flex: 1, fontSize: "0.82rem", color: locationSharing ? "#1a1a14" : "#7a7a6a" }}>
            📍 {lang === "ja" ? (locationSharing ? "位置情報を共有中" : "位置情報を共有してマップに貢献") : (locationSharing ? "Sharing your location" : "Share location to help others")}
          </span>
          <button onClick={() => setLocationSharing(!locationSharing)}
            style={{ width: 40, height: 22, borderRadius: 99, border: "none", background: locationSharing ? "#1a1a14" : "#d4cfc4", cursor: "pointer", position: "relative", flexShrink: 0 }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: "white", position: "absolute", top: 3, left: locationSharing ? 21 : 3, transition: "left 0.2s" }} />
          </button>
        </div>
      )}

      {/* Region filter chips — only show when not filtering by fish */}
      {!selectedFish && (
        <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 10, paddingBottom: 2 }}>
          {REGIONS.map(r => (
            <button key={r.key} onClick={() => setRegionFilter(r.key)} style={{ flexShrink: 0, padding: "6px 12px", borderRadius: 99, border: `2px solid ${regionFilter === r.key ? "#1a1a14" : "#d4cfc4"}`, background: regionFilter === r.key ? "#e0f2f2" : "#f5f0e8", color: regionFilter === r.key ? "#1a1a14" : "#5a5a4a", cursor: "pointer", fontFamily: "inherit", fontSize: "0.82rem", fontWeight: regionFilter === r.key ? 700 : 400 }}>
              {r.emoji} {r[lang]}
            </button>
          ))}
        </div>
      )}
      {/* Location status bar */}
      {userLocation ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#e0f2f2", border: "2px solid #FFE500", borderRadius: 10, marginBottom: 10, cursor: "pointer" }} onClick={onOpenLocalAI}>
          <span style={{ fontSize: "1rem" }}>📍</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0d7377" }}>{userLocation.display}</div>
            <div style={{ fontSize: "0.8rem", color: "#5a5a4a" }}>{lang === "ja" ? "タップしてAI近場診断" : "Tap for AI nearby spots"}</div>
          </div>
          <span style={{ color: "#0d7377", fontSize: "1rem" }}>→</span>
        </div>
      ) : (
        <div style={{ padding: "8px 12px", background: "#f5f0e8", border: "2px solid #d4cfc4", borderRadius: 10, marginBottom: 10, fontSize: "0.88rem", color: "#7a7a6a" }}>
          📍 {lang === "ja" ? "位置情報を許可すると距離順に並びます" : "Allow location to sort by distance"}
        </div>
      )}
      <p style={{ margin: "0 0 14px", color: "#5a5a4a", fontSize: "1.05rem" }}>{lang === "ja" ? "ピンをタップして詳細を見る" : "Tap a pin for details"}</p>
      {/* ── REAL LEAFLET MAP via OSM ── */}
      <LeafletMap spots={spots} userLocation={userLocation} activeSpot={activeSpot} setActiveSpot={setActiveSpot} lang={lang} activeUsers={activeUsers} />
      {activeSpot && (
        <div style={{ background: "#e0f2f2", border: "2px solid #1a1a14", borderRadius: 14, padding: "12px 16px", marginBottom: 14, animation: "fadeUp 0.2s ease" }}>
          <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 4 }}>{activeSpot.icon || "📍"} {activeSpot.name}</div>
          <div style={{ fontSize: "0.88rem", color: "#0d7377" }}>
            🐟 {typeof activeSpot.fish === "object" ? activeSpot.fish[lang] : (activeSpot.fishName || activeSpot.fish || "")}
            {" · "}⭐ {activeSpot.rating}
            {" · "}{typeof activeSpot.type === "object" ? activeSpot.type[lang] : activeSpot.type}
            {activeSpot.distKm != null && ` · 📏 ${activeSpot.distKm} km`}
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

        {/* AI Prediction Zone list */}
        {mapMode === "prediction" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div style={{ fontSize: "0.82rem", color: "#5a5a4a", marginBottom: 10, background: "#e0f2f2", borderRadius: 10, padding: "8px 12px" }}>
              🤖 {lang === "ja" ? `現在の条件（${new Date().toLocaleTimeString("ja-JP",{hour:"2-digit",minute:"2-digit"})}）でスポットをAI分析中` : `AI analyzing spots for current conditions (${new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})})`}
            </div>
            {[...spots].sort((a, b) => calcSpotScore(b, weather, tideData, activeUsers) - calcSpotScore(a, weather, tideData, activeUsers)).slice(0, 15).map(spot => (
              <PredictionZoneCard key={spot.id} spot={spot} weather={weather} tideData={tideData} activeUsers={activeUsers} lang={lang} onAskAI={(s, sc) => { setPredictionSpot(s); setPredictionScore(sc); }} />
            ))}
          </div>
        )}

        {predictionSpot && (
          <PredictionZoneModal spot={predictionSpot} score={predictionScore} weather={weather} tideData={tideData} lang={lang} onClose={() => setPredictionSpot(null)} />
        )}

        {/* Spots list */}
        {mapMode === "spots" && spots.length === 0 && (
          <div style={{ textAlign: "center", padding: "30px 20px", color: "#7a7a6a" }}>
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>🗺️</div>
            <div style={{ fontSize: "0.95rem" }}>{lang === "ja" ? "このエリアのスポットは準備中です" : "Spots for this area coming soon"}</div>
          </div>
        )}
        {mapMode === "spots" && spots.map((spot, i) => {
          const coords = SPOT_COORDS[spot.name] || (spot.lat ? { lat: spot.lat, lng: spot.lng } : null);
          const crowding = coords ? getCrowdingLevel(coords.lat, coords.lng, activeUsers) : null;
          return (
          <div key={spot.id || i} onClick={() => setActiveSpot(spot)} style={{ background: activeSpot?.id === spot.id ? "#e0f2f2" : "#fffdf8", border: `2px solid ${activeSpot?.id === spot.id ? "#1a1a14" : "#e0dbd0"}`, borderRadius: 14, padding: "12px 16px", cursor: "pointer", animation: `fadeUp ${0.2 + i * 0.05}s ease both`, marginBottom: 8, boxShadow: crowding?.level === "crowded" ? `0 0 14px rgba(184,32,48,0.35)` : crowding?.level === "moderate" ? `0 0 10px rgba(192,106,16,0.25)` : "none" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: spot.tip ? 8 : 0 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#e0f2f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0, boxShadow: crowding ? crowding.glow : "none" }}>{spot.icon || "📍"}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 2 }}>{spot.name}</div>
                <div style={{ fontSize: "0.85rem", color: "#5a5a4a" }}>🐟 {typeof spot.fish === "object" ? spot.fish[lang] : (spot.fishName || spot.fish || "")} · {typeof spot.type === "object" ? spot.type[lang] : spot.type}</div>
                {spot.pref && <div style={{ fontSize: "0.78rem", color: "#9a9a8a", marginTop: 1 }}>📌 {spot.pref}</div>}
                {crowding && crowding.count > 0 && (
                  <div style={{ fontSize: "0.75rem", color: crowding.color, fontWeight: 700, marginTop: 2 }}>
                    {crowding.label[lang]} · {lang === "ja" ? `${crowding.count}人釣り中` : `${crowding.count} fishing now`}
                  </div>
                )}
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ color: "#c06a10", fontSize: "1rem", fontWeight: 700 }}>⭐ {spot.rating}</div>
                {spot.distKm != null && <div style={{ color: "#0d7377", fontSize: "0.85rem", fontWeight: 700 }}>📏 {spot.distKm} km</div>}
                {spot.bestSeason && <div style={{ fontSize: "0.72rem", color: "#7a7a6a" }}>{spot.bestSeason[lang]}</div>}
              </div>
            </div>
            {spot.tip && activeSpot?.id === spot.id && (
              <div style={{ background: "#f5f0e8", borderRadius: 10, padding: "8px 12px", fontSize: "0.85rem", color: "#3a3a2a", lineHeight: 1.6 }}>
                💡 {spot.tip[lang]}
                {spot.access && <div style={{ marginTop: 4, fontSize: "0.78rem", color: "#0d7377" }}>🚗 {spot.access[lang]}</div>}
              </div>
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
}


// ─── MAP VIEW ────────────────────────────────────────────────────────────────
function MapView({ selectedFish, lang, userLocation, onOpenLocalAI, activeUsers = [], locationSharing, setLocationSharing, weather, tideData }) {
  const [activeSpot, setActiveSpot] = useState(null);
  const [regionFilter, setRegionFilter] = useState("kyushu");
  const [showCommunityPins, setShowCommunityPins] = useState(true);
  const [mapMode, setMapMode] = useState("spots"); // "spots" | "prediction"
  const [showAR, setShowAR] = useState(false);
  const [predictionSpot, setPredictionSpot] = useState(null);
  const [predictionScore, setPredictionScore] = useState(null);
  const REGIONS = [
    { key: "kyushu",     ja: "九州",       en: "Kyushu",     es: "Kyushu",      emoji: "🌋" },
    { key: "hokkaido",   ja: "北海道",     en: "Hokkaido",   es: "Hokkaido",    emoji: "🏔️" },
    { key: "kanto",      ja: "関東",       en: "Kanto",      es: "Kanto",       emoji: "🗼" },
    { key: "kansai",     ja: "関西",       en: "Kansai",     es: "Kansai",      emoji: "⛩️" },
    { key: "chubu",      ja: "中部",       en: "Chubu",      es: "Chubu",       emoji: "🗻" },
    { key: "puertorico", ja: "プエルトリコ", en: "Puerto Rico", emoji: "🌴" },
    { key: "all",        ja: "全国",       en: "All Japan",  es: "Todo Japón",  emoji: "🗾" },
  ];

  const rawSpots = selectedFish
    ? selectedFish.spots.map((sp, i) => ({ ...sp, id: i + 100, fishName: selectedFish.name, icon: selectedFish.emoji || "📍" }))
    : MAP_SPOTS.filter(sp => regionFilter === "all" || sp.region === regionFilter);

  const spots = rawSpots.map(sp => {
    const coords = SPOT_COORDS[sp.name] || (sp.lat ? { lat: sp.lat, lng: sp.lng } : null);
    if (!coords || !userLocation) return { ...sp, distKm: null };
    return { ...sp, distKm: Math.round(distKm(userLocation.lat, userLocation.lng, coords.lat, coords.lng)) };
  }).sort((a, b) => (a.distKm ?? 9999) - (b.distKm ?? 9999));

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <h2 style={{ margin: "0 0 4px", fontSize: "1.2rem" }}>{selectedFish ? `${selectedFish.name}の釣り場` : (lang === "ja" ? "近くの釣り場" : "Spots Near You")}</h2>

      {/* AR Camera button */}
      <button onClick={() => setShowAR(true)} style={{ width: "100%", marginBottom: 10, padding: "10px", background: "#1a1a14", border: "none", borderRadius: 12, color: "#FFE500", cursor: "pointer", fontFamily: "inherit", fontSize: "0.88rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        📷 {lang === "ja" ? "ARカメラで釣り場を探す" : "Find Spots with AR Camera"}
      </button>

      {showAR && <ARCameraView userLocation={userLocation} spots={MAP_SPOTS} lang={lang} weather={weather} onClose={() => setShowAR(false)} />}

      {/* Mode toggle */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {[{ k: "spots", ja: "📍 釣り場", en: "📍 Spots" }, { k: "prediction", ja: "🔮 AI予測", en: "🔮 AI Predict" }].map(m => (
          <button key={m.k} onClick={() => setMapMode(m.k)} style={{ flex: 1, padding: "8px", background: mapMode === m.k ? "#e0f2f2" : "#fffdf8", border: `2px solid ${mapMode === m.k ? "#0d7377" : "#d4cfc4"}`, borderRadius: 10, color: mapMode === m.k ? "#0d7377" : "#5a5a4a", cursor: "pointer", fontFamily: "inherit", fontSize: "0.88rem", fontWeight: mapMode === m.k ? 700 : 400 }}>{m[lang]}</button>
        ))}
      </div>

      {/* Region filter */}
      {!selectedFish && (
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6, marginBottom: 8, scrollbarWidth: "none" }}>
          {REGIONS.map(r => (
            <button key={r.key} onClick={() => setRegionFilter(r.key)} style={{ flexShrink: 0, padding: "6px 12px", borderRadius: 99, border: `2px solid ${regionFilter === r.key ? "#0d7377" : "#d4cfc4"}`, background: regionFilter === r.key ? "#e0f2f2" : "#f5f0e8", color: regionFilter === r.key ? "#0d7377" : "#5a5a4a", cursor: "pointer", fontFamily: "inherit", fontSize: "0.82rem", fontWeight: regionFilter === r.key ? 700 : 400 }}>
              {r.emoji} {r[lang]}
            </button>
          ))}
        </div>
      )}

      {/* Location status bar */}
      {userLocation && (
        <div style={{ background: "#e0f2f2", border: "1px solid #a0c8d0", borderRadius: 10, padding: "6px 12px", marginBottom: 8, fontSize: "0.78rem", color: "#0d7377", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>📍 {lang === "ja" ? "現在地取得済み" : "Location found"}</span>
          <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
            <input type="checkbox" checked={locationSharing} onChange={e => setLocationSharing(e.target.checked)} />
            <span>{lang === "ja" ? "位置情報をシェア" : "Share location"}</span>
          </label>
        </div>
      )}

      {/* Prediction zone list */}
      {mapMode === "prediction" && (
        <div style={{ animation: "fadeUp 0.3s ease" }}>
          <div style={{ fontSize: "0.82rem", color: "#5a5a4a", marginBottom: 10, background: "#e0f2f2", borderRadius: 10, padding: "8px 12px" }}>
            🤖 {lang === "ja" ? `現在の条件でスポットをAI分析中` : `AI analyzing spots for current conditions`}
          </div>
          {[...spots].sort((a, b) => calcSpotScore(b, weather, tideData, activeUsers) - calcSpotScore(a, weather, tideData, activeUsers)).slice(0, 15).map(spot => (
            <PredictionZoneCard key={spot.id} spot={spot} weather={weather} tideData={tideData} activeUsers={activeUsers} lang={lang} onAskAI={(s, sc) => { setPredictionSpot(s); setPredictionScore(sc); }} />
          ))}
        </div>
      )}

      {predictionSpot && <PredictionZoneModal spot={predictionSpot} score={predictionScore} weather={weather} tideData={tideData} lang={lang} onClose={() => setPredictionSpot(null)} />}

      {/* Spots list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {mapMode === "spots" && spots.length === 0 && (
          <div style={{ textAlign: "center", padding: "30px 20px", color: "#7a7a6a" }}>
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>🗺️</div>
            <div style={{ fontSize: "0.95rem" }}>{lang === "ja" ? "このエリアのスポットは準備中です" : "Spots for this area coming soon"}</div>
          </div>
        )}
        {mapMode === "spots" && spots.map((spot, i) => {
          const coords = SPOT_COORDS[spot.name] || (spot.lat ? { lat: spot.lat, lng: spot.lng } : null);
          const crowd = coords ? getCrowdingLevel(coords.lat, coords.lng, activeUsers) : null;
          const score = calcSpotScore(spot, weather, tideData, activeUsers);
          const scoreColor = score >= 80 ? "#2d7a3a" : score >= 60 ? "#c06a10" : "#888";
          return (
            <div key={spot.id || i} style={{ background: "white", border: `1.5px solid ${activeSpot?.id === spot.id ? "#0d7377" : "#e0dbd0"}`, borderRadius: 14, padding: "12px 14px", cursor: "pointer", boxShadow: activeSpot?.id === spot.id ? "0 0 0 2px #0d737744" : "none" }} onClick={() => setActiveSpot(activeSpot?.id === spot.id ? null : spot)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a1a14" }}>{spot.icon} {spot.name}</div>
                  <div style={{ fontSize: "0.78rem", color: "#5a5a4a", marginTop: 2 }}>🐟 {typeof spot.fish === "object" ? spot.fish[lang] : spot.fish}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                    {spot.pref && <span style={{ fontSize: "0.72rem", background: "#f0ebe0", color: "#5a5a4a", padding: "2px 7px", borderRadius: 99 }}>📌 {spot.pref}</span>}
                    {spot.distKm !== null && <span style={{ fontSize: "0.72rem", background: "#e0f2f2", color: "#0d7377", padding: "2px 7px", borderRadius: 99 }}>📏 {spot.distKm}km</span>}
                    {crowd && crowd.count > 0 && <span style={{ fontSize: "0.72rem", color: crowd.color, fontWeight: 600 }}>{crowd.label[lang]}</span>}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  {"⭐".repeat(Math.round(spot.rating || 0))}
                  <div style={{ fontSize: "0.75rem", color: scoreColor, fontWeight: 700, marginTop: 2 }}>{score}pt</div>
                </div>
              </div>
              {spot.tip && activeSpot?.id === spot.id && (
                <div style={{ background: "#f5f0e8", borderRadius: 10, padding: "8px 12px", marginTop: 8, fontSize: "0.82rem", color: "#3a3a2a", lineHeight: 1.6 }}>
                  💡 {spot.tip[lang]}
                  {spot.access && <div style={{ marginTop: 4, fontSize: "0.78rem", color: "#5a5a4a" }}>🚗 {spot.access[lang]}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── WEATHER VIEW ─────────────────────────────────────────────────────────────
function WeatherView({ lang, weather, forecast, tides, rivers }) {
  const WEATHER = weather || {};
  const fi = WEATHER.fishingIndex ?? 75;
  const fiColor = fi >= 80 ? "#2d7a3a" : fi >= 60 ? "#c06a10" : "#b82030";
  const fiMsg = fi >= 80 ? s("excellent", lang) : fi >= 60 ? s("good", lang) : s("fair", lang);

  const isLoading = !WEATHER.loaded;

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
        <h2 style={{ margin: 0, fontSize: "1.2rem" }}>{lang === "ja" ? "釣り天気予報" : "Fishing Weather"}</h2>
        {WEATHER.loaded ? (
          <span style={{ fontSize: "0.78rem", color: "#0d7377", fontWeight: 600 }}>🌐 Open-Meteo · JMA</span>
        ) : (
          <span style={{ fontSize: "0.78rem", color: "#7a7a6a" }}>⏳ {lang === "ja" ? "位置情報待ち..." : "Waiting for GPS..."}</span>
        )}
      </div>
      <p style={{ margin: "0 0 14px", color: "#5a5a4a", fontSize: "1.05rem" }}>{lang === "ja" ? "現在地のリアル気象データ" : "Live weather at your location"}</p>

      {isLoading && (
        <div style={{ background: "#f0f8f8", border: "2px solid #FFE500", borderRadius: 16, padding: 20, marginBottom: 14, textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", animation: "spin 2s linear infinite", display: "inline-block", marginBottom: 8 }}>🌤️</div>
          <div style={{ fontWeight: 700, color: "#0d7377", marginBottom: 4 }}>
            {lang === "ja" ? "天気データを取得中..." : "Fetching live weather..."}
          </div>
          <div style={{ fontSize: "0.88rem", color: "#5a5a4a" }}>
            {lang === "ja" ? "📍 位置情報を許可してください" : "📍 Please allow location access"}
          </div>
        </div>
      )}
      <div style={{ background: "linear-gradient(135deg,#FFF9CC,#f0ebe0)", border: "1px solid rgba(72,202,228,0.22)", borderRadius: 20, padding: 18, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "2.8rem", lineHeight: 1, fontWeight: 700 }}>{WEATHER.temp}℃</div>
            <div style={{ fontSize: "0.92rem", color: "#5a5a4a" }}>{lang === "ja" ? `体感${WEATHER.feels}℃` : `Feels ${WEATHER.feels}℃`} · {WEATHER.condition[lang]}</div>
            <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {[{ icon: "💨", v: WEATHER.wind?.[lang] || "－" }, { icon: "💧", v: `${WEATHER.humidity ?? "－"}%` }, { icon: "🌡️", v: WEATHER.waterTemp != null ? `${lang === "ja" ? "水温" : "Water"}: ${WEATHER.waterTemp}℃` : (lang === "ja" ? "水温: 現地確認" : "Water: check locally") }, { icon: "🌙", v: WEATHER.moonPhase?.[lang] || "－" }].map(i => <span key={i.v} style={{ fontSize: "1rem", color: "#3a3a2a", background: "#fffdf8", borderRadius: 8, padding: "3px 8px" }}>{i.icon} {i.v}</span>)}
            </div>
          </div>
          <ScoreRing score={fi} lang={lang} />
        </div>
        <div style={{ marginTop: 12, background: "#f0ebe0", borderRadius: 10, padding: "9px 14px", display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: fiColor, boxShadow: `0 0 8px ${fiColor}` }} />
          <div style={{ fontSize: "0.92rem", color: fiColor, fontWeight: 700 }}>{fiMsg}</div>
        </div>
      </div>
      <div style={{ background: "#fffdf8", border: "2px solid #e0dbd0", borderRadius: 18, padding: 16, marginBottom: 14 }}>
        <div style={{ fontSize: "0.95rem", color: "#5a5a4a", marginBottom: 12, letterSpacing: "0.07em" }}>{lang === "ja" ? "時間別釣り指数" : "HOURLY FISHING INDEX"}</div>
        <div style={{ display: "flex", gap: 5, overflowX: "auto", paddingBottom: 4 }}>
          {(WEATHER.hourly || []).map(h => (
            <div key={h.time} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 42 }}>
              <div style={{ fontSize: "0.95rem", color: "#5a5a4a" }}>{h.time}</div>
              <div style={{ fontSize: "1rem" }}>{h.icon}</div>
              <div style={{ width: 34, height: 56, background: "#f8f4ec", borderRadius: 6, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${h.fishing}%`, borderRadius: "4px 4px 0 0", background: h.fishing >= 85 ? "linear-gradient(180deg,#FFE500,#2d6a4f)" : h.fishing >= 70 ? "linear-gradient(180deg,#f4a261,#6b4226)" : "linear-gradient(180deg,#556677,#334455)" }} />
              </div>
              <div style={{ fontSize: "1.05rem", color: h.fishing >= 85 ? "#74c69d" : "#8899aa", fontWeight: 700 }}>{h.fishing}</div>
              <div style={{ fontSize: "1.05rem", color: "#5a5a4a" }}>{h.temp}℃</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[
          { icon: "🌊", la: { ja: "水温", en: "Water Temp" }, v: WEATHER.waterTemp != null ? `${WEATHER.waterTemp}℃` : (lang === "ja" ? "現地確認" : "Check locally"), sub: { ja: "フライ最適: 8-16℃", en: "Fly optimal: 8–16℃" } },
          { icon: "👁️", la: { ja: "水質", en: "Clarity" }, v: WEATHER.waterClarity?.[lang] || "－", sub: { ja: "ナチュラル系有効", en: "Natural colors work" } },
          { icon: "💨", la: { ja: "流れ", en: "Current" }, v: WEATHER.flow?.[lang] || "－", sub: { ja: "ドリフト有効", en: "Good for drifting" } },
          { icon: "🦋", la: { ja: "ハッチ予測", en: "Hatch Outlook" }, v: { ja: "BWO期待大", en: "BWO likely" }[lang], sub: { ja: "夕方のライズに注目", en: "Watch for evening rises" } },
        ].map(c => (
          <div key={c.la.ja} style={{ background: "#fffdf8", border: "2px solid #e0dbd0", borderRadius: 14, padding: "12px 14px" }}>
            <div style={{ fontSize: "1.1rem", marginBottom: 4 }}>{c.icon}</div>
            <div style={{ fontSize: "0.95rem", color: "#5a5a4a" }}>{c.la[lang]}</div>
            <div style={{ fontWeight: 700, fontSize: "1.05rem", margin: "2px 0" }}>{c.v}</div>
            <div style={{ fontSize: "0.95rem", color: "#0d7377" }}>{c.sub[lang]}</div>
          </div>
        ))}
      </div>
      {/* ── TIDE TABLE ── */}
      <div style={{ background: "#fffdf8", border: "2px solid #e0dbd0", borderRadius: 18, padding: 16, marginBottom: 14 }}>
        <div style={{ fontSize: "0.95rem", color: "#5a5a4a", marginBottom: 12, letterSpacing: "0.07em", display: "flex", justifyContent: "space-between" }}>
          <span>{lang === "ja" ? "🌊 本日の潮汐" : "🌊 TODAY'S TIDES"}</span>
          <span style={{ fontSize: "0.75rem", color: "#9a9a8a" }}>{lang === "ja" ? "※推算値" : "Calculated"}</span>
        </div>
        {tides.length > 0 ? tides.map(td => (
          <div key={td.time} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: td.type === "high" ? "#e0f2f2" : "#f5f0e8", borderRadius: 10, marginBottom: 6, border: `1px solid ${td.type === "high" ? "#74c69d" : "#e0dbd0"}` }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: "1.2rem" }}>{td.type === "high" ? "🌊" : "🏖️"}</span>
              <div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700 }}>{td.type === "high" ? (lang === "ja" ? "満潮" : "High Tide") : (lang === "ja" ? "干潮" : "Low Tide")}</div>
                {td.height && <div style={{ fontSize: "0.78rem", color: "#5a5a4a" }}>{td.height}m</div>}
              </div>
            </div>
            <span style={{ color: td.type === "high" ? "#1a1a14" : "#c06a10", fontSize: "1.05rem", fontWeight: 700 }}>{td.time}</span>
          </div>
        )) : (
          <div style={{ textAlign: "center", color: "#9a9a8a", fontSize: "0.88rem", padding: "12px 0" }}>
            {lang === "ja" ? "📍 位置情報を許可すると潮汐を表示" : "📍 Allow location for tide data"}
          </div>
        )}
      </div>

      {/* ── 7-DAY FORECAST ── */}
      {forecast.length > 0 && (
        <div style={{ background: "#fffdf8", border: "2px solid #e0dbd0", borderRadius: 18, padding: 16, marginBottom: 14 }}>
          <div style={{ fontSize: "0.95rem", color: "#5a5a4a", marginBottom: 12, letterSpacing: "0.07em" }}>
            {lang === "ja" ? "📅 7日間の釣り指数予報" : "📅 7-DAY FISHING FORECAST"}
          </div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {forecast.map((day, i) => {
              const isToday = i === 0;
              const fi = day.fishingIndex;
              const color = fi >= 80 ? "#2d7a3a" : fi >= 60 ? "#c06a10" : "#b82030";
              const bg = fi >= 80 ? "#e0f2f2" : fi >= 60 ? "#f8e8d0" : "#f8d8d8";
              return (
                <div key={day.date} style={{ flexShrink: 0, minWidth: 68, background: isToday ? bg : "#f5f0e8", border: `2px solid ${isToday ? color : "#e0dbd0"}`, borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: isToday ? 700 : 400, color: isToday ? color : "#5a5a4a", marginBottom: 4 }}>
                    {lang === "ja" ? day.dayJa : day.dayEn}
                  </div>
                  <div style={{ fontSize: "1.4rem", marginBottom: 4 }}>{day.icon}</div>
                  <div style={{ fontWeight: 900, fontSize: "1.1rem", color, marginBottom: 2 }}>{fi}</div>
                  <div style={{ fontSize: "0.72rem", color: "#5a5a4a" }}>{day.maxTemp}°/{day.minTemp}°</div>
                  {day.rain > 0 && <div style={{ fontSize: "0.68rem", color: "#1565a0" }}>💧{day.rain}mm</div>}
                </div>
              );
            })}
          </div>
          {/* Best day highlight */}
          {(() => {
            const best = [...forecast].sort((a, b) => b.fishingIndex - a.fishingIndex)[0];
            if (!best || best === forecast[0]) return null;
            return (
              <div style={{ marginTop: 10, background: "#e0f2f2", border: "2px solid #b8a000", borderRadius: 10, padding: "8px 12px", fontSize: "0.88rem", color: "#1a4a22" }}>
                🏆 {lang === "ja" ? `今週のベストは${best.dayJa}！釣り指数${best.fishingIndex}` : `Best this week: ${best.dayEn} — Fishing index ${best.fishingIndex}`}
              </div>
            );
          })()}
        </div>
      )}

      {/* ── RIVER CONDITIONS ── */}
      {rivers.length > 0 && (
        <div style={{ background: "#fffdf8", border: "2px solid #e0dbd0", borderRadius: 18, padding: 16, marginBottom: 14 }}>
          <div style={{ fontSize: "0.95rem", color: "#5a5a4a", marginBottom: 4, letterSpacing: "0.07em" }}>
            {lang === "ja" ? "🏞️ 河川状況" : "🏞️ RIVER CONDITIONS"}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#9a9a8a", marginBottom: 12 }}>
            {lang === "ja" ? "国土交通省 川の防災情報（模擬データ）" : "Ministry of Land, Infrastructure — River Info (simulated)"}
          </div>
          {rivers.map(r => {
            const trendIcon = r.trend === "rising" ? "↑" : r.trend === "falling" ? "↓" : "→";
            const trendColor = r.trend === "rising" ? "#b82030" : r.trend === "falling" ? "#2d7a3a" : "#5a5a4a";
            const clarityLabel = { clear: { ja: "澄み", en: "Clear" }, slightly_cloudy: { ja: "やや濁り", en: "Slightly cloudy" }, cloudy: { ja: "濁り", en: "Cloudy" } };
            return (
              <div key={r.id} style={{ background: r.fishable ? "#e0f2f2" : "#f8e8d0", border: `2px solid ${r.fishable ? "#74c69d" : "#d0b090"}`, borderRadius: 12, padding: "12px 14px", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{r.name[lang]}</div>
                    <div style={{ fontSize: "0.78rem", color: "#5a5a4a" }}>🐟 {r.fish.join("・")}</div>
                  </div>
                  <span style={{ background: r.fishable ? "#2d7a3a" : "#c06a10", color: "white", borderRadius: 99, padding: "3px 10px", fontSize: "0.78rem", fontWeight: 700 }}>
                    {r.fishable ? (lang === "ja" ? "釣行可" : "Fishable") : (lang === "ja" ? "要確認" : "Check")}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <div><span style={{ fontSize: "0.75rem", color: "#7a7a6a" }}>{lang === "ja" ? "水位" : "Level"}</span><br/><span style={{ fontWeight: 700 }}>{r.level}m <span style={{ color: trendColor }}>{trendIcon}</span></span></div>
                  <div><span style={{ fontSize: "0.75rem", color: "#7a7a6a" }}>{lang === "ja" ? "水温" : "Temp"}</span><br/><span style={{ fontWeight: 700 }}>{r.temp}℃</span></div>
                  <div><span style={{ fontSize: "0.75rem", color: "#7a7a6a" }}>{lang === "ja" ? "透明度" : "Clarity"}</span><br/><span style={{ fontWeight: 700, fontSize: "0.88rem" }}>{clarityLabel[r.clarity]?.[lang] || r.clarity}</span></div>
                  <div><span style={{ fontSize: "0.75rem", color: "#7a7a6a" }}>{lang === "ja" ? "適正水位" : "Ideal"}</span><br/><span style={{ fontSize: "0.82rem", color: "#0d7377" }}>{r.idealLevel}</span></div>
                </div>
                <div style={{ fontSize: "0.72rem", color: "#9a9a8a", marginTop: 6 }}>🕐 {lang === "ja" ? `${r.updatedAt}更新` : `Updated ${r.updatedAt}`}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── NOTIFICATION BUTTON ── */}
      {"Notification" in window && Notification.permission !== "granted" && (
        <button onClick={() => requestNotificationPermission().then(ok => ok && sendFishingAlert(lang === "ja" ? "🎣 通知テスト" : "🎣 Test Alert", lang === "ja" ? "釣り指数が高い時に通知します！" : "You'll be alerted when conditions peak!"))}
          style={{ width: "100%", padding: "12px", background: "#e0f2f2", border: "2px solid #FFE500", borderRadius: 14, color: "#0d7377", cursor: "pointer", fontFamily: "inherit", fontSize: "0.95rem", fontWeight: 700, marginBottom: 14 }}>
          🔔 {lang === "ja" ? "好条件の時に通知を受け取る" : "Get notified when conditions peak"}
        </button>
      )}
      {"Notification" in window && Notification.permission === "granted" && (
        <div style={{ background: "#e0f2f2", border: "2px solid #FFE500", borderRadius: 12, padding: "10px 14px", marginBottom: 14, fontSize: "0.88rem", color: "#1a4a22", fontWeight: 600 }}>
          🔔 {lang === "ja" ? "通知ON — 釣り指数88+で自動アラート" : "Notifications ON — Auto-alert at fishing index 88+"}
        </div>
      )}
    </div>
  );
}

// ─── LOCAL AI ADVISOR ────────────────────────────────────────────────────────
function LocalAIAdvisor({ userLocation, lang, weather, onClose }) {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(true);

  // Get nearest spots with distance
  const nearestSpots = MAP_SPOTS.map(sp => ({
    ...sp,
    distKm: userLocation ? Math.round(distKm(userLocation.lat, userLocation.lng, sp.lat, sp.lng)) : null
  })).sort((a, b) => (a.distKm ?? 9999) - (b.distKm ?? 9999)).slice(0, 5);

  // Get peak fish for current month
  const peakFish = FISH_DATA.map(f => ({ fish: f, tip: getSeasonalTip(f.id) }))
    .filter(x => x.tip && x.tip.urgency === "peak")
    .map(x => lang === "ja" ? x.fish.name : x.fish.nameEn).join("、");

  useEffect(() => {
    (async () => {
      const locationStr = userLocation?.display || (lang === "ja" ? "現在地不明" : "unknown location");
      const spotsStr = nearestSpots.map(s => `${s.name}（${s.distKm}km）`).join("、");
      const spotsStrEn = nearestSpots.map(s => `${s.name} (${s.distKm}km)`).join(", ");
      const monthName = MONTH_NAMES[lang][CURRENT_MONTH];

      const jaPrompt = `あなたは日本の地元釣りガイドです。以下の情報をもとに、釣りアドバイスをしてください。

📍 現在地: ${locationStr}
🗓️ 月: ${monthName}
🌡️ 天気: 気温${weather.temp}℃・水温${weather.waterTemp}℃・${weather.condition.ja}・釣り指数${weather.fishingIndex}/100
🐟 今月の旬な魚: ${peakFish || "ブラックバス、アオリイカ"}
📍 近くの釣り場TOP5: ${spotsStr}

以下を教えてください:
1. 今日・今月、${locationStr}周辺で最もおすすめの釣り場（理由付き）
2. そこで釣れる魚と今日のベストルアー・エサ
3. 地元ならではのコツや注意点（地形・潮・季節感）
4. 遠征する価値がある少し遠めのスポット（もしあれば）

200〜250字で、絵文字セクション分け、日本語で。`;

      const enPrompt = `You are a local Japanese fishing guide. Give fishing advice based on:

📍 Location: ${locationStr}
🗓️ Month: ${monthName}
🌡️ Conditions: ${weather.temp}℃ air, ${weather.waterTemp}℃ water, ${weather.condition.en}, fishing index ${weather.fishingIndex}/100
🐟 In-season fish this month: ${peakFish || "Largemouth Bass, Squid"}
📍 Nearest fishing spots: ${spotsStrEn}

Cover: 1) Best nearby spot right now (with reason) 2) Target species and top lure/bait for today 3) Local tips — terrain, tides, seasonal notes 4) One worth-the-drive spot if applicable.

Keep it under 220 words, emoji section headers.`;

      const jaFallback = `📍 ${locationStr}周辺の釣り情報\n\n🎯 今月のおすすめスポット\n最寄りの${nearestSpots[0]?.name || "釣り場"}（${nearestSpots[0]?.distKm || "?"}km）がベスト。${monthName}はシーズン的に最高の時期です。\n\n🐟 狙い目の魚\n${peakFish || "バス・イカ"}が活発。地元の水温・潮を確認してから出発しよう。\n\n💡 地元のコツ\n早朝と夕方の2時間が勝負。天気が変わりやすい時期なので防寒具を忘れずに。\n\n🚗 遠征スポット\n${nearestSpots[1]?.name || "近隣スポット"}（${nearestSpots[1]?.distKm || "?"}km）も狙い目。`;

      const enFallback = `📍 Fishing near ${locationStr}\n\n🎯 Top Spot Right Now\n${nearestSpots[0]?.name || "Nearest spot"} (${nearestSpots[0]?.distKm || "?"}km away) is your best bet this ${monthName}.\n\n🐟 Target Species\n${peakFish || "Bass and Squid"} are active. Check local water temps before heading out.\n\n💡 Local Tip\nThe 2-hour windows at dawn and dusk are everything. Weather can shift — bring layers.\n\n🚗 Worth the Drive\n${nearestSpots[1]?.name || "Next nearest"} (${nearestSpots[1]?.distKm || "?"}km) is worth it if conditions are right.`;

      try {
        const res = await fetch("/api/claude", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1200,
            messages: [{ role: "user", content: lang === "ja" ? jaPrompt : enPrompt }] })
        });
        const data = await res.json();
        setResponse(data.content?.[0]?.text || "");
      } catch { setResponse(lang === "ja" ? jaFallback : enFallback); }
      setLoading(false);
    })();
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200, display: "flex", alignItems: "flex-end" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fffdf8", borderRadius: "24px 24px 0 0", padding: "24px 20px 48px", width: "100%", maxHeight: "85vh", overflowY: "auto", animation: "slideUp 0.3s ease", border: "2px solid #d4cfc4", borderBottom: "none" }}>
        {/* Handle bar */}
        <div style={{ width: 40, height: 4, borderRadius: 99, background: "#d4cfc4", margin: "0 auto 20px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.15rem", color: "#0d7377" }}>
              📍 {lang === "ja" ? "近くの釣り場AI診断" : "Nearby Spots AI"}
            </div>
            <div style={{ fontSize: "0.88rem", color: "#0d7377", marginTop: 3 }}>
              Claude AI · {userLocation?.display || (lang === "ja" ? "位置情報取得中" : "Getting location...")}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#f0ebe0", border: "2px solid #d4cfc4", borderRadius: 10, padding: "6px 14px", color: "#5a5a4a", cursor: "pointer", fontWeight: 700, fontSize: "0.9rem" }}>✕</button>
        </div>

        {/* Nearest spots strip */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 16, paddingBottom: 4 }}>
          {nearestSpots.map((sp, i) => (
            <div key={sp.id} style={{ flexShrink: 0, background: i === 0 ? "#e0f2f2" : "#f5f0e8", border: `2px solid ${i === 0 ? "#1a1a14" : "#d4cfc4"}`, borderRadius: 12, padding: "8px 12px", minWidth: 120 }}>
              <div style={{ fontSize: "1rem" }}>{sp.icon}</div>
              <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#0d7377", marginTop: 2, lineHeight: 1.2 }}>{sp.name}</div>
              <div style={{ fontSize: "0.78rem", color: i === 0 ? "#1a1a14" : "#7a7a6a", fontWeight: i === 0 ? 700 : 400 }}>
                {sp.distKm !== null ? `${sp.distKm} km` : "---"}
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: "2.5rem", animation: "spin 1s linear infinite", display: "inline-block" }}>📍</div>
            <p style={{ color: "#5a5a4a", marginTop: 12, fontSize: "0.95rem" }}>
              {lang === "ja" ? "あなたの周辺を分析中..." : "Analysing spots near you..."}
            </p>
          </div>
        ) : (
          <div style={{ fontSize: "0.95rem", lineHeight: 1.8, color: "#0d7377", whiteSpace: "pre-wrap" }}>{response}</div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function CastWiseJapan() {
  const [lang, setLang] = useLocalStorage("mabo_lang", "ja");
  const [tab, setTab] = useState("Explore");
  const [selectedFish, setSelectedFish] = useState(null);
  const [gearTab, setGearTab] = useState("gear");
  const [catches, setCatches] = useState([]);
  const [catchesLoading, setCatchesLoading] = useState(true);
  const [liked, setLiked] = useLocalStorage("mabo_liked", {});
  const [newCatch, setNewCatch] = useState({ fish: "", weight: "", location: "", notes: "", photo: null, method: "lure" });
  const [myCatches, setMyCatches] = useState([]);
  const [logOpen, setLogOpen] = useState(false);
  const [commentOpen, setCommentOpen] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [search, setSearch] = useState("");
  const [filterDiff, setFilterDiff] = useLocalStorage("mabo_filterdiff", "all");
  const [filterCat, setFilterCat] = useLocalStorage("mabo_filtercat", "all");
  const [filterFly, setFilterFly] = useLocalStorage("mabo_filterfly", false);
  const [showAI, setShowAI] = useState(false);
  const [showFlyAI, setShowFlyAI] = useState(false);
  const [flyAIFish, setFlyAIFish] = useState(null);
  const [leaderFilter, setLeaderFilter] = useState("points");
  const [profileTab, setProfileTab] = useState("catches");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [editProfile, setEditProfile] = useState(false);
  const [profile, setProfile] = useLocalStorage("mabo_profile", { name: "あなたの名前", bio: "渓流フライマン🪶", avatar: "🪶", catches: 8, followers: 52, following: 29 });
  // Ad system state
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [showRewarded, setShowRewarded] = useState(false);
  const [isPremium, setIsPremium] = useLocalStorage("mabo_premium", false);
  const [bonusPoints, setBonusPoints] = useLocalStorage("mabo_points", 0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [pendingTab, setPendingTab] = useState(null);
  // Location state
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showLocalAI, setShowLocalAI] = useState(false);

  // Live weather from Open-Meteo — updates when location is known
  // ─── MABO BRAND HEADER ───────────────────────────────────────────────────────
  const MABO_YELLOW = "#74c69d";
  const MABO_BLACK = "#1a1a14";

  const MaboHeader = ({ lang, onLangToggle }) => (
    <div style={{ background: MABO_YELLOW, borderBottom: `3px solid ${MABO_BLACK}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px 6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 42, height: 42, background: MABO_BLACK, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", border: `2px solid ${MABO_BLACK}` }}>🐟</div>
          <div>
            <div style={{ fontSize: "1.15rem", fontWeight: 900, color: MABO_BLACK, lineHeight: 1.1 }}>釣りナビ PRO</div>
            <div style={{ fontSize: "0.68rem", color: "#555", fontWeight: 700, letterSpacing: "0.04em" }}>MABO CHANNEL FISHING</div>
          </div>
        </div>
        <button onClick={onLangToggle} style={{ background: MABO_BLACK, color: MABO_YELLOW, border: "none", borderRadius: 8, padding: "5px 12px", fontFamily: "inherit", fontSize: "0.82rem", fontWeight: 800, cursor: "pointer" }}>
          {lang === "ja" ? "EN" : lang === "en" ? "ES" : "JP"}
        </button>
      </div>
      <div style={{ background: MABO_BLACK, textAlign: "center", fontSize: "0.72rem", fontWeight: 700, color: MABO_YELLOW, padding: "4px", letterSpacing: "0.1em" }}>
        もっと賢く釣る
      </div>
    </div>
  );

  // New feature hooks
  const WEATHER = useRealWeather(userLocation);
  const forecast7day = use7DayForecast(userLocation);
  const tideData = useRealTideData(userLocation);
  const riverConditions = useRiverConditions();
  const { isOnline } = useOfflineMode();
  useFishingAlerts(WEATHER, userLocation, lang);

  const { journal, addEntry, deleteEntry } = useFishingJournal();
  const [journalOpen, setJournalOpen] = useState(false);
  const [journalEntry, setJournalEntry] = useState({ title: "", notes: "", weather: "", water: "", flies: "", rating: 3 });

  // Active users & location sharing
  const [locationSharing, setLocationSharing] = useLocalStorage("mabo_sharing", false);
  const userId = useRef(getOrCreateUserId()).current;
  const activeUsers = useActiveUsers(db, userLocation, locationSharing, userId);

  const fileRef = useRef();

  // Request GPS on first load
  useEffect(() => {
    if (!navigator.geolocation) return;
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        // Reverse geocode to get city name
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.municipality || data.address?.county || "";
          const pref = data.address?.state || "";
          setUserLocation({ lat, lng, city, pref, display: city ? `${city}${pref ? "・" + pref : ""}` : `${lat.toFixed(2)}, ${lng.toFixed(2)}` });
        } catch {
          setUserLocation({ lat, lng, city: "", pref: "", display: `${lat.toFixed(2)}, ${lng.toFixed(2)}` });
        }
        setLocationLoading(false);
      },
      (err) => { setLocationError(err.message); setLocationLoading(false); },
      { timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  const TABS_DATA = [
    { key: "Explore",    ja: "探す",   en: "Explore",  icon: "🐟" },
    { key: "FishGuide",  ja: "魚図鑑", en: "Guide",    icon: "🎣" },
    { key: "FlyFishing", ja: "フライ", en: "Fly",      icon: "🪶" },
    { key: "Map",        ja: "釣り場", en: "Map",      icon: "🗺️" },
    { key: "Tournament", ja: "大会",   en: "Tourney",  icon: "🏆" },
    { key: "Weather",    ja: "天気",   en: "Weather",  icon: "🌤️" },
    { key: "Community",  ja: "みんな", en: "Feed",     icon: "🌊" },
    { key: "Profile",    ja: "マイ",   en: "Profile",  icon: "👤" },
  ];

  function switchTab(newTab) {
    if (newTab === tab) return;
    if (!isPremium) {
      const newCount = tabSwitchCount + 1;
      setTabSwitchCount(newCount);
      // Ads paused until launch
    }
    setTab(newTab);
  }

  function closeInterstitial() {
    setShowInterstitial(false);
    if (pendingTab) { setTab(pendingTab); setPendingTab(null); }
  }

  const diffMap = { all: { ja: "すべて", en: "All" }, beginner: { ja: "初心者", en: "Beginner" }, intermediate: { ja: "中級者", en: "Intermediate" }, advanced: { ja: "上級者", en: "Advanced" } };
  const catMap = { all: { ja: "すべて", en: "All", es: "Todo" }, freshwater: { ja: "淡水", en: "Freshwater", es: "Agua Dulce" }, saltwater: { ja: "海水", en: "Saltwater", es: "Mar" }, shore: { ja: "ショア", en: "Shore", es: "Costa" }, caribbean: { ja: "🌴 カリブ", en: "🌴 Caribbean", es: "🌴 Caribe" } };


  const FISH_CATS = { 1:"freshwater", 2:"freshwater", 3:"freshwater", 4:"saltwater", 5:"freshwater", 6:"saltwater", 7:"saltwater", 8:"saltwater", 9:"freshwater", 10:"freshwater", 11:"freshwater", 12:"saltwater", 13:"saltwater", 14:"saltwater", 15:"shore", 16:"saltwater", 17:"caribbean", 18:"caribbean", 19:"caribbean", 20:"caribbean", 21:"caribbean", 22:"caribbean", 23:"caribbean", 24:"caribbean" };

  const filteredFish = FISH_DATA.filter(f =>
    (f.name.includes(search) || f.nameEn.toLowerCase().includes(search.toLowerCase())) &&
    (filterDiff === "all" || f.difficulty === filterDiff) &&
    (!filterFly || f.flyFriendly) &&
    (filterCat === "all" || FISH_CATS[f.id] === filterCat)
  );

  function toggleLike(id) {
    const was = liked[id];
    setLiked(p => ({ ...p, [id]: !p[id] }));
    setCatches(p => p.map(c => c.id === id ? { ...c, likes: was ? c.likes - 1 : c.likes + 1 } : c));
  }

  function addComment(id) {
    if (!commentText.trim()) return;
    setCatches(p => p.map(c => c.id === id ? { ...c, comments: [...c.comments, commentText] } : c));
    setCommentText(""); setCommentOpen(null);
  }

  const [fishIDResult, setFishIDResult] = useState(null);
  const [fishIDLoading, setFishIDLoading] = useState(false);

  function handlePhoto(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      setPhotoPreview(dataUrl);
      setNewCatch(p => ({ ...p, photo: dataUrl }));
      setFishIDResult(null);
      setFishIDLoading(true);

      // Strip the data:image/...;base64, prefix to get raw base64
      const base64 = dataUrl.split(",")[1];
      const mediaType = dataUrl.split(";")[0].split(":")[1] || "image/jpeg";

      try {
        const res = await fetch("/api/claude", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [{
              role: "user",
              content: [
                {
                  type: "image",
                  source: { type: "base64", media_type: mediaType, data: base64 }
                },
                {
                  type: "text",
                  text: `You are an expert Japanese fisheries biologist and fishing guide. Analyze this photo and respond in JSON only — no markdown, no extra text.

If this is a fish photo, return:
{
  "isFish": true,
  "species": { "ja": "Japanese species name", "en": "English species name" },
  "confidence": "high|medium|low",
  "estimatedLength": "estimated length in cm, e.g. 32cm",
  "estimatedWeight": "estimated weight in kg, e.g. 0.8 kg",
  "description": { "ja": "2-sentence Japanese description of the fish and any notable features visible", "en": "2-sentence English description" },
  "regulations": {
    "minSize": "minimum keep size in cm if known, else null",
    "note": { "ja": "key regulation note for Japan in Japanese", "en": "key regulation note in English" }
  },
  "condition": { "ja": "fish condition assessment in Japanese (e.g. 状態良好・リリース推奨)", "en": "condition assessment in English" },
  "isKeepable": true
}

If this is NOT a fish or the image is unclear, return:
{
  "isFish": false,
  "message": { "ja": "説明", "en": "explanation" }
}`
                }
              ]
            }]
          })
        });

        const data = await res.json();
        const text = data.content?.[0]?.text || "";
        const clean = text.replace(/```json|```/g, "").trim();
        const result = JSON.parse(clean);
        setFishIDResult(result);

        // Auto-fill the form if fish detected with high/medium confidence
        if (result.isFish && result.confidence !== "low") {
          setNewCatch(p => ({
            ...p,
            fish: lang === "ja" ? result.species.ja : result.species.en,
            weight: result.estimatedWeight || p.weight,
          }));
        }
      } catch (err) {
        console.warn("Fish ID failed:", err);
        setFishIDResult({ isFish: false, message: { ja: "識別できませんでした", en: "Could not identify" } });
      }
      setFishIDLoading(false);
    };
    reader.readAsDataURL(file);
  }

  async function submitCatch() {
    if (!newCatch.fish) return;
    const now = Date.now();
    const entry = {
      id: now,
      fish: newCatch.fish || "",
      weight: newCatch.weight || "",
      location: newCatch.location || (lang === "ja" ? "場所未入力" : "Location not set"),
      notes: newCatch.notes || "",
      method: newCatch.method || "lure",
      photo: newCatch.photo || null,
      user: profile.name,
      avatar: profile.avatar,
      date: { ja: "今日", en: "Today" },
      emoji: "🎣",
      likes: 0,
      comments: [],
      rating: 0,
      verified: true,
      createdAt: now,
    };

    // Update local state immediately
    setMyCatches(p => [entry, ...p]);
    setCatches(p => [entry, ...p]);

    // Upload photo to Firebase Storage if present, then save to Firestore
    async function saveToFirestore(photoURL = null) {
      const firestoreEntry = {
        id: entry.id,
        fish: entry.fish,
        weight: entry.weight,
        location: entry.location,
        notes: entry.notes,
        method: entry.method,
        user: entry.user,
        avatar: entry.avatar,
        dateJa: "今日",
        dateEn: "Today",
        likes: 0,
        comments: [],
        rating: 0,
        verified: true,
        createdAt: now,
        photoURL: photoURL || null,
        // Save GPS if user opted in to sharing
        lat: (locationSharing && userLocation) ? userLocation.lat : null,
        lng: (locationSharing && userLocation) ? userLocation.lng : null,
        locationDisplay: (locationSharing && userLocation) ? userLocation.display : null,
      };
      try {
        await addDoc(collection(db, "catches"), firestoreEntry);
        ;
      } catch (err) {
        console.warn("Firestore save failed:", err);
      }
    }

    if (newCatch.photo) {
      try {
        const photoRef = ref(storage, `catches/${now}.jpg`);
        await uploadString(photoRef, newCatch.photo, "data_url");
        const photoURL = await getDownloadURL(photoRef);
        // Update local entry with real URL
        const entryWithPhoto = { ...entry, photo: photoURL };
        setMyCatches(p => [entryWithPhoto, ...p.slice(1)]);
        setCatches(p => [entryWithPhoto, ...p.slice(1)]);
        await saveToFirestore(photoURL);
      } catch (err) {
        console.warn("Photo upload failed:", err);
        await saveToFirestore(null);
      }
    } else {
      await saveToFirestore(null);
    }

    setNewCatch({ fish: "", weight: "", location: "", notes: "", photo: null, method: "lure" });
    setPhotoPreview(null);
    setFishIDResult(null);
    setLogOpen(false);
  }

  // Load catches from Firestore on startup
  useEffect(() => {
    const q = query(collection(db, "catches"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const loaded = snap.docs.map(d => {
        const data = d.data();
        return {
          ...data,
          photo: data.photoURL || null,
          date: { ja: data.dateJa || "記録済", en: data.dateEn || "Logged" },
          comments: data.comments || [],
          firestoreId: d.id,
        };
      });
      // If Firestore has data use it, otherwise show mock catches
      setCatches(loaded.length > 0 ? loaded : MOCK_CATCHES);
      setMyCatches(loaded.filter(c => c.user === profile.name));
      setCatchesLoading(false);
    }, (err) => console.warn("Firestore listen error:", err));
    return () => unsub();
  }, []);

  return (
    <div style={{ fontFamily: "'Noto Sans JP','Hiragino Kaku Gothic ProN','Yu Gothic',sans-serif", background: "#f5f0e8", minHeight: "100vh", color: "#0d7377", maxWidth: 430, margin: "0 auto", position: "relative", boxShadow: "0 4px 40px rgba(0,0,0,0.12)", fontSize: "16px", lineHeight: 1.6, WebkitFontSmoothing: "antialiased" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&family=Shippori+Mincho:wght@400;700&display=swap');
        :root {
          --bg: #f5f0e8;
          --bg-card: #fffdf8;
          --bg-warm: #f0ebe0;
          --text: #1a1a14;
          --text-mid: #4a4a3a;
          --text-light: #7a7a6a;
          --blue: #1565a0;
          --teal: #1a1a14;
          --green: #b8a000;
          --red: #b82030;
          --orange: #c06a10;
          --gold: #9a7a20;
          --purple: #6040a0;
          --border: #d4cfc4;
          --border-light: #e8e3d8;
        }
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes shimmer{0%,100%{opacity:0.5}50%{opacity:1}}
        @keyframes watercolor{0%{filter:saturate(0.8) brightness(1)}50%{filter:saturate(1.1) brightness(1.04)}100%{filter:saturate(0.8) brightness(1)}}
        ::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-thumb{background:#c4bfb4;border-radius:99px}
        input,textarea,select{outline:none;font-family:inherit;font-size:16px}*{box-sizing:border-box}
        button{transition:all 0.15s;font-size:16px}button:active{transform:scale(0.97)}
        /* Paper texture overlay */
        .paper-bg{background-image:url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")}
      `}</style>

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(ellipse at 30% 20%, rgba(13,115,119,0.04), transparent 60%)" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(ellipse at 70% 80%, rgba(154,122,32,0.03), transparent 60%)" }} />
      </div>

      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(245,240,232,0.96)", backdropFilter: "blur(16px)", borderBottom: "2px solid #d4cfc4", padding: "12px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: "1.5rem", fontWeight: 900, lineHeight: 1, fontFamily: "'Shippori Mincho','Noto Serif JP',serif", color: "#0d7377" }}>
              <span style={{ color: "#0d7377" }}>釣</span><span style={{ color: "#0d7377" }}>り</span>
              <span style={{ color: "#2d7a3a" }}>ナビ</span>
              <span style={{ fontSize: "0.5rem", color: "#9a7a20", marginLeft: 4, verticalAlign: "super", fontWeight: 700 }}>PRO</span>
            </div>
            <div style={{ fontSize: "0.95rem", color: "#7a7a6a", letterSpacing: "0.1em", marginTop: 2 }}>
              {s("appTagline", lang)}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setLang(l => l === "ja" ? "en" : l === "en" ? "es" : "ja")} style={{ background: "#e8e3d8", border: "2px solid #c4bfb4", borderRadius: 8, padding: "6px 12px", color: "#0d7377", cursor: "pointer", fontSize: "0.95rem", fontWeight: 700 }}>
              {lang === "ja" ? "EN" : "日本語"}
            </button>
            {/* Location / AI nearby button */}
            <button onClick={() => setShowLocalAI(true)} style={{ background: userLocation ? "#e0f2f2" : "#f5f0e8", border: `2px solid ${userLocation ? "#1a1a14" : "#c4bfb4"}`, borderRadius: 8, padding: "6px 10px", color: userLocation ? "#1a1a14" : "#7a7a6a", cursor: "pointer", fontSize: "0.88rem", fontWeight: 700, position: "relative" }}>
              {locationLoading ? "⏳" : "📍"}
              {userLocation && <span style={{ position: "absolute", top: -4, right: -4, width: 8, height: 8, borderRadius: "50%", background: "#2d7a3a", border: "2px solid #f5f0e8" }} />}
            </button>
            {isPremium ? (
              <div style={{ background: "#ece0f8", border: "2px solid #c0a0e0", borderRadius: 8, padding: "6px 10px", fontSize: "0.95rem", color: "#6040a0", fontWeight: 700 }}>👑 PRO</div>
            ) : (
              <button onClick={() => setShowRewarded(true)} style={{ background: "#e0f0e8", border: "2px solid #FFE500", borderRadius: 8, padding: "6px 10px", fontSize: "0.95rem", color: "#2d7a3a", cursor: "pointer", fontWeight: 700 }}>🎁</button>
            )}
            <div style={{ background: "#e0f0e8", border: "2px solid #FFE500", borderRadius: 8, padding: "6px 10px", fontSize: "0.95rem", color: "#2d7a3a", fontWeight: 700 }}>
              🔥 {WEATHER.fishingIndex}{bonusPoints > 0 && <span style={{ color: "#c06a10" }}> +{bonusPoints}</span>}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", overflowX: "auto", gap: 2 }}>
          {TABS_DATA.map(td => (
            <button key={td.key} onClick={() => switchTab(td.key)} style={{ flex: "0 0 auto", padding: "10px 12px 12px", border: "none", background: tab === td.key ? "#fffdf8" : "transparent", color: tab === td.key ? (td.key === "FlyFishing" ? "#2d7a3a" : "#1a1a14") : "#7a7a6a", cursor: "pointer", fontFamily: "inherit", fontSize: "1.05rem", fontWeight: tab === td.key ? 700 : 500, whiteSpace: "nowrap", borderBottom: `3px solid ${tab === td.key ? (td.key === "FlyFishing" ? "#2d7a3a" : "#1a1a14") : "transparent"}`, minHeight: 48 }}>
              <div style={{ fontSize: "1.1rem", marginBottom: 3 }}>{td.icon}</div>
              {td[lang]}
            </button>
          ))}
        </div>
      </div>

      {/* Offline banner */}
      {!isOnline && (
        <div style={{ background: "#f8e8d0", border: "2px solid #c06a10", padding: "8px 16px", display: "flex", alignItems: "center", gap: 8, fontSize: "0.88rem", color: "#7a4000" }}>
          <span>📵</span>
          <span style={{ fontWeight: 700 }}>{lang === "ja" ? "オフライン — キャッシュデータを表示中" : "Offline — showing cached data"}</span>
        </div>
      )}

      <div style={{ padding: "14px 14px 100px", position: "relative", zIndex: 1 }}>

        {/* ── EXPLORE ── */}
        {tab === "Explore" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <h2 style={{ margin: "0 0 4px", fontSize: "1.3rem", fontWeight: 700 }}>{s("whatFishing", lang)}</h2>
            <p style={{ margin: "0 0 12px", color: "#5a5a4a", fontSize: "0.92rem" }}>
              {s("selectSpecies", lang)}
              <span style={{ marginLeft: 8, background: "#d8f0f0", border: "2px solid #80b8c8", borderRadius: 99, padding: "2px 8px", fontSize: "0.95rem", color: "#0d7377", fontWeight: 700 }}>{filteredFish.length}/{FISH_DATA.length}</span>
            </p>

            {/* ── SEASONAL HOT PICK BANNER ── */}
            {(() => {
              const peakFish = FISH_DATA.map(f => ({ fish: f, tip: getSeasonalTip(f.id) }))
                .filter(x => x.tip && (x.tip.urgency === "peak" || x.tip.urgency === "high"))
                .sort((a, b) => a.tip.urgency === "peak" ? -1 : 1);
              if (!peakFish.length) return null;
              const { fish, tip } = peakFish[0];
              const sty = URGENCY_STYLES[tip.urgency];
              return (
                <div onClick={() => { setSelectedFish(fish); switchTab("FishGuide"); setGearTab("gear"); }}
                  style={{ background: sty.bg, border: `2px solid ${sty.border}`, borderRadius: 16, padding: "14px 16px", marginBottom: 14, cursor: "pointer", animation: "fadeUp 0.3s ease" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <FishIllustration fishId={fish.id} spriteId={fish.spriteId} size={60} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: sty.dot, boxShadow: `0 0 8px ${sty.dot}88`, flexShrink: 0 }} />
                        <span style={{ fontWeight: 700, fontSize: "0.85rem", color: sty.text }}>
                          {lang === "ja" ? "🗓️ 今が旬！" : "🗓️ In Season Now!"}
                        </span>
                        <span style={{ marginLeft: "auto", background: sty.border, color: "#fff", borderRadius: 99, padding: "2px 9px", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>
                          {MONTH_NAMES[lang][CURRENT_MONTH]}
                        </span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: "1.05rem", color: sty.text, marginBottom: 3 }}>
                        {lang === "ja" ? fish.name : fish.nameEn}
                        <span style={{ marginLeft: 7, fontSize: "0.85rem", opacity: 0.85 }}>{tip.badge[lang]}</span>
                      </div>
                      <div style={{ fontSize: "0.85rem", color: sty.text, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {tip.tip[lang]}
                      </div>
                    </div>
                    <span style={{ fontSize: "1.2rem", color: sty.text, opacity: 0.5, flexShrink: 0 }}>→</span>
                  </div>
                  {tip.hotLures[lang].length > 0 && (
                    <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {tip.hotLures[lang].slice(0, 3).map(l => (
                        <span key={l} style={{ background: "rgba(255,255,255,0.65)", border: `1px solid ${sty.border}`, borderRadius: 99, padding: "3px 10px", fontSize: "0.8rem", color: sty.text, fontWeight: 600 }}>🎯 {l}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
            <div onClick={() => switchTab("Weather")} style={{ background: "linear-gradient(135deg,#FFF9CC,#e8f4ec)", border: "2px solid #FFE500", borderRadius: 13, padding: "10px 13px", marginBottom: 12, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
                <span style={{ fontSize: "1.3rem" }}>⛅</span>
                <div>
                  <div style={{ fontSize: "1.05rem", fontWeight: 600 }}>{WEATHER.temp}℃ · {WEATHER.condition[lang]}</div>
                  <div style={{ fontSize: "0.95rem", color: "#2d7a3a" }}>🔥 {lang === "ja" ? `釣り指数${WEATHER.fishingIndex}/100 — 最高の釣り日和！` : `Index ${WEATHER.fishingIndex}/100 — Excellent!`}</div>
                </div>
              </div>
              <div style={{ color: "#0d7377" }}>→</div>
            </div>
            <div style={{ display: "flex", gap: 7, marginBottom: 10 }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={s("search", lang)} style={{ flex: 1, background: "#f8f4ec", border: "2px solid #FFE500", borderRadius: 9, padding: "9px 12px", color: "#0d7377", fontSize: "0.95rem" }} />
              <select value={filterDiff} onChange={e => setFilterDiff(e.target.value)} style={{ background: "#f8f4ec", border: "2px solid #FFE500", borderRadius: 9, padding: "9px", color: "#0d7377", fontSize: "1rem", cursor: "pointer" }}>
                {Object.entries(diffMap).map(([k, v]) => <option key={k} value={k} style={{ background: "#f5f0e8" }}>{v[lang]}</option>)}
              </select>
            </div>
            {/* Category filter chips */}
            <div style={{ display: "flex", gap: 5, marginBottom: 10, overflowX: "auto", paddingBottom: 2 }}>
              {Object.entries(catMap).map(([k, v]) => (
                <button key={k} onClick={() => setFilterCat(k)} style={{ flex: "0 0 auto", padding: "5px 12px", borderRadius: 99, border: `1px solid ${filterCat === k ? "rgba(72,202,228,0.6)" : "#d4cfc4"}`, background: filterCat === k ? "rgba(72,202,228,0.14)" : "transparent", color: filterCat === k ? "#1a1a14" : "#8899aa", cursor: "pointer", fontFamily: "inherit", fontSize: "0.95rem", whiteSpace: "nowrap" }}>
                  {k === "freshwater" ? "🏞️" : k === "saltwater" ? "🌊" : k === "shore" ? "🪨" : "🐟"} {v[lang]}
                </button>
              ))}
            </div>
            {/* Fly-friendly filter */}
            <button onClick={() => setFilterFly(!filterFly)} style={{ marginBottom: 12, padding: "7px 14px", background: filterFly ? "rgba(116,198,157,0.18)" : "#fffdf8", border: `1px solid ${filterFly ? "rgba(116,198,157,0.5)" : "#d4cfc4"}`, borderRadius: 99, color: filterFly ? "#74c69d" : "#8899aa", cursor: "pointer", fontFamily: "inherit", fontSize: "1rem", fontWeight: filterFly ? 700 : 400 }}>
              🪶 {lang === "ja" ? (filterFly ? "フライ対応のみ ✓" : "フライ対応で絞り込む") : (filterFly ? "Fly-friendly only ✓" : "Show fly-friendly only")}
            </button>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {filteredFish.length === 0 && (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 20px", color: "#5a5a4a" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>🔍</div>
                  <p style={{ fontStyle: "italic", margin: "0 0 10px", fontSize: "0.95rem" }}>
                    {lang === "ja" ? "条件に合う魚が見つかりません" : "No fish match your filters"}
                  </p>
                  <button onClick={() => { setFilterDiff("all"); setFilterCat("all"); setFilterFly(false); setSearch(""); }} style={{ background: "#e0f2f2", border: "2px solid #70a8b8", borderRadius: 10, padding: "8px 18px", color: "#0d7377", cursor: "pointer", fontFamily: "inherit", fontSize: "1.05rem" }}>
                    {lang === "ja" ? "フィルターをリセット" : "Reset filters"}
                  </button>
                </div>
              )}
              {filteredFish.map((fish, i) => (
                <React.Fragment key={fish.id}>
                  {i === 4 && !isPremium && (
                    <div style={{ gridColumn: "1 / -1" }}>
                      <BannerAd lang={lang} isPremium={isPremium} />
                    </div>
                  )}
                  {i === 10 && !isPremium && (
                    <div style={{ gridColumn: "1 / -1" }}>
                      <BannerAd lang={lang} isPremium={isPremium} />
                    </div>
                  )}
                <div onClick={() => { setSelectedFish(fish); switchTab("FishGuide"); setGearTab("gear"); }}
                  style={{ background: `linear-gradient(135deg,${fish.color}44,${fish.color}14)`, border: `1px solid ${fish.accent}33`, borderRadius: 15, padding: "14px 12px", cursor: "pointer", animation: `fadeUp ${0.22 + i * 0.06}s ease both`, position: "relative", overflow: "hidden" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                  {fish.flyFriendly && <div style={{ position: "absolute", top: 8, right: 8, fontSize: "1.05rem", background: "#c8e8d0", border: "2px solid #60b080", borderRadius: 6, padding: "1px 5px" }}>🪶</div>}
                  <div style={{ marginBottom: 6, animation: "float 3s ease-in-out infinite", animationDelay: `${i * 0.4}s` }}><FishIllustration fishId={fish.id} spriteId={fish.spriteId} size={64} /></div>
                  <div style={{ fontWeight: 700, fontSize: "1rem", lineHeight: 1.3, marginBottom: 3 }}>{fish.name}</div>
                  <div style={{ fontSize: "0.8rem", color: "#5a5a4a", marginBottom: 5 }}>{fish.nameEn}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 5 }}>
                    <DiffBadge level={fish.difficulty} lang={lang} />
                    {fish.flyFriendly && <span style={{ background: "#e0f0e8", border: "2px solid #FFE500", borderRadius: 99, padding: "2px 8px", fontSize: "0.78rem", color: "#2d7a3a", fontWeight: 700 }}>🪶</span>}
                  </div>
                  <SeasonalBadge fishId={fish.id} lang={lang} />
                  <div style={{ marginTop: 6, fontSize: "0.8rem", color: "#7a7a6a" }}>📅 {fish.season[lang]}</div>
                </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* ── FISH GUIDE ── */}
        {tab === "FishGuide" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            {!selectedFish ? (
              <div style={{ textAlign: "center", padding: "60px 16px", color: "#5a5a4a" }}>
                <div style={{ fontSize: "3rem", animation: "float 2s ease-in-out infinite" }}>🎣</div>
                <p style={{ fontStyle: "italic", marginTop: 12 }}>{lang === "ja" ? "「探す」から魚を選んでください" : "Select a fish from Explore"}</p>
                <button onClick={() => switchTab("Explore")} style={{ background: "#d8f0f0", border: "2px solid #90c0d0", borderRadius: 10, padding: "10px 22px", color: "#0d7377", cursor: "pointer", fontFamily: "inherit", marginTop: 10 }}>{s("browsefish", lang)}</button>
              </div>
            ) : (
              <>
                <div style={{ background: `linear-gradient(135deg,${selectedFish.color}50,${selectedFish.color}18)`, border: `1px solid ${selectedFish.accent}44`, borderRadius: 20, padding: 18, marginBottom: 12 }}>
                  <button onClick={() => setSelectedFish(null)} style={{ background: "#e8e3d8", border: "none", borderRadius: 8, padding: "4px 10px", color: "#5a5a4a", cursor: "pointer", fontFamily: "inherit", fontSize: "1.05rem", marginBottom: 10 }}>{s("back", lang)}</button>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ animation: "float 3s ease-in-out infinite" }}><FishIllustration fishId={selectedFish.id} spriteId={selectedFish.spriteId} size={80} /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: "1.2rem", lineHeight: 1.2 }}>{selectedFish.name}</div>
                      <div style={{ fontSize: "0.95rem", color: "#5a5a4a", marginBottom: 6 }}>{selectedFish.nameEn}</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 7 }}>
                        <DiffBadge level={selectedFish.difficulty} lang={lang} />
                        {selectedFish.flyFriendly && <span style={{ background: "#c8e8d0", border: "2px solid #60b080", borderRadius: 99, padding: "2px 9px", fontSize: "0.67rem", color: "#2d7a3a" }}>🪶 {lang === "ja" ? "フライ対応" : "Fly-friendly"}</span>}
                      </div>
                      <p style={{ margin: 0, fontSize: "0.92rem", color: "#3a3a2a", lineHeight: 1.6 }}>{selectedFish.description[lang]}</p>
                    </div>
                  </div>
                  {selectedFish.flyFriendly && selectedFish.flyNote && (
                    <div style={{ marginTop: 10, padding: "8px 12px", background: "#e0f0e8", border: "2px solid #FFE500", borderRadius: 10, fontSize: "0.77rem", color: "#2d7a3a" }}>
                      🪶 {selectedFish.flyNote[lang]}
                    </div>
                  )}
                </div>

                {/* Seasonal intelligence */}
                <SeasonalAlert fishId={selectedFish.id} lang={lang} compact={false} />

                {/* AI buttons */}
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <button onClick={() => setShowAI(true)} style={{ flex: 1, padding: "11px", background: "#e0f2f2", border: "2px solid #70a8b8", borderRadius: 12, color: "#0d7377", cursor: "pointer", fontFamily: "inherit", fontSize: "1.05rem", fontWeight: 700 }}>🤖 AI {lang === "ja" ? "ルアー診断" : "Lure AI"}</button>
                  {selectedFish.flyFriendly && <button onClick={() => { setFlyAIFish(selectedFish); setShowFlyAI(true); }} style={{ flex: 1, padding: "11px", background: "#e0f0e8", border: "2px solid #c8b800", borderRadius: 12, color: "#2d7a3a", cursor: "pointer", fontFamily: "inherit", fontSize: "1.05rem", fontWeight: 700 }}>🪶 AI {lang === "ja" ? "フライ診断" : "Fly AI"}</button>}
                </div>
                {!isPremium && <BannerAd lang={lang} isPremium={isPremium} />}

                <div style={{ display: "flex", gap: 5, marginBottom: 12 }}>
                  {[{ k: "gear", ja: "🎣 タックル", en: "🎣 Gear" }, { k: "spots", ja: "📍 釣り場", en: "📍 Spots" }, { k: "map", ja: "🗺️ マップ", en: "🗺️ Map" }].map(tt => (
                    <button key={tt.k} onClick={() => setGearTab(tt.k)} style={{ flex: 1, padding: "8px 4px", borderRadius: 9, border: `1px solid ${gearTab === tt.k ? selectedFish.accent + "88" : "#d4cfc4"}`, background: gearTab === tt.k ? selectedFish.color + "44" : "transparent", color: gearTab === tt.k ? selectedFish.accent : "#8899aa", cursor: "pointer", fontFamily: "inherit", fontSize: "0.95rem", fontWeight: gearTab === tt.k ? 700 : 400 }}>{tt[lang]}</button>
                  ))}
                </div>

                {gearTab === "gear" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {[{ la: { ja: "🎋 ロッド", en: "🎋 Rod" }, v: selectedFish.gear.rod }, { la: { ja: "🔧 リール", en: "🔧 Reel" }, v: selectedFish.gear.reel }, { la: { ja: "🧵 ライン", en: "🧵 Line" }, v: selectedFish.gear.line }, { la: { ja: "🪝 フック", en: "🪝 Hook" }, v: selectedFish.gear.hooks }].map(row => (
                      <div key={row.la.ja} style={{ background: "#fffdf8", border: "2px solid #e0dbd0", borderRadius: 11, padding: "10px 13px", display: "flex", gap: 11, alignItems: "center" }}>
                        <span style={{ fontSize: "1rem", color: "#5a5a4a", minWidth: 68 }}>{row.la[lang]}</span>
                        <span style={{ fontSize: "0.83rem", fontWeight: 600 }}>{row.v?.[lang] || row.v}</span>
                      </div>
                    ))}
                    <div style={{ background: "#fffdf8", border: "2px solid #e0dbd0", borderRadius: 11, padding: 13 }}>
                      <div style={{ fontSize: "0.95rem", color: "#5a5a4a", marginBottom: 7 }}>🎯 {lang === "ja" ? "ルアー・エサ — タップしてAmazonで確認" : "Lures & Bait — tap to shop on Amazon"}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {selectedFish.gear.lures.map(l => <LureTag key={l} lure={l} lang={lang} />)}
                      </div>
                    </div>
                    <div style={{ background: "linear-gradient(135deg,rgba(13,115,119,0.08),transparent)", border: "2px solid #FFE500", borderRadius: 12, padding: 14, marginTop: 4 }}>
                      <div style={{ fontSize: "0.88rem", color: "#0d7377", fontWeight: 700, marginBottom: 8 }}>⚖️ {lang === "ja" ? "釣り規制・遊漁情報" : "Fishing Regulations"}</div>
                      {(() => {
                        const reg = getRegulation(selectedFish.name);
                        return (
                          <>
                            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                              {reg.minSize && <div style={{ background: "#f8e8d0", border: "2px solid #c06a10", borderRadius: 8, padding: "4px 10px", fontSize: "0.82rem", color: "#7a4000", fontWeight: 700 }}>📏 {lang === "ja" ? `最小キープサイズ: ${reg.minSize}cm` : `Min size: ${reg.minSize}cm`}</div>}
                              <div style={{ background: "#e0f2f2", border: "2px solid #FFE500", borderRadius: 8, padding: "4px 10px", fontSize: "0.82rem", color: "#0d4a50", fontWeight: 700 }}>📅 {lang === "ja" ? `釣り期間: ${reg.seasons === "year-round" ? "通年" : reg.seasons}` : `Season: ${reg.seasons}`}</div>
                            </div>
                            <div style={{ fontSize: "0.85rem", color: "#3a3a2a", lineHeight: 1.6 }}>{reg.note[lang]}</div>
                          </>
                        );
                      })()}
                    </div>
                    <div style={{ background: `linear-gradient(135deg,${selectedFish.color}33,transparent)`, border: `1px solid ${selectedFish.accent}33`, borderRadius: 11, padding: 13 }}>
                      <div style={{ fontSize: "0.95rem", color: selectedFish.accent, fontWeight: 700, marginBottom: 6 }}>💡 {s("proTip", lang)}</div>
                      <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.7, color: "#3a3a2a" }}>{selectedFish.gear.tips[lang]}</p>
                    </div>
                  </div>
                )}
                {gearTab === "spots" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {selectedFish.spots.map((spot, i) => (
                      <div key={spot.name} style={{ background: "#fffdf8", border: "2px solid #e0dbd0", borderRadius: 12, padding: "12px 15px", display: "flex", gap: 11, alignItems: "center" }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: selectedFish.color + "66", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.05rem", fontWeight: 700, color: selectedFish.accent }}>#{i + 1}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: "1rem" }}>📍 {spot.name}</div>
                          <div style={{ fontSize: "0.95rem", color: "#5a5a4a", marginTop: 2 }}>🗺️ {spot.type[lang]} · ⭐ {spot.rating}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {gearTab === "map" && <MapView selectedFish={selectedFish} lang={lang} userLocation={userLocation} onOpenLocalAI={() => setShowLocalAI(true)} />}
              </>
            )}
          </div>
        )}

        {/* ── FLY FISHING ── */}
        {tab === "FlyFishing" && (
          <FlyFishingView lang={lang} weather={WEATHER} onOpenAI={() => { setFlyAIFish(null); setShowFlyAI(true); }} />
        )}

        {/* ── MAP ── */}
        {tab === "Map" && <MapView selectedFish={null} lang={lang} userLocation={userLocation} onOpenLocalAI={() => setShowLocalAI(true)} activeUsers={activeUsers} locationSharing={locationSharing} setLocationSharing={setLocationSharing} weather={WEATHER} tideData={tideData} />}

        {/* ── WEATHER ── */}
        {tab === "Tournament" && <TournamentView lang={lang} profile={profile} myCatches={myCatches} />}
        {tab === "Weather" && <WeatherView lang={lang} weather={WEATHER} forecast={forecast7day} tides={tideData} rivers={riverConditions} />}

        {/* ── COMMUNITY ── */}
        {tab === "Community" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
              <div>
                <h2 style={{ margin: "0 0 2px", fontSize: "1.2rem" }}>{lang === "ja" ? "みんなの釣果" : "Community Catches"}</h2>
                <p style={{ margin: 0, color: "#5a5a4a", fontSize: "1.05rem" }}>{lang === "ja" ? "世界中の釣り人の釣果に評価やコメントを" : "Rate and comment on catches worldwide"}</p>
              </div>
              <button onClick={() => { switchTab("Profile"); setProfileTab("catches"); }} style={{ background: "#e0f2f2", border: "2px solid #FFE500", borderRadius: 99, padding: "6px 10px", color: "#0d7377", cursor: "pointer", fontFamily: "inherit", fontSize: "0.95rem" }}>+{lang === "ja" ? "投稿" : "Share"}</button>
            </div>
            <div onClick={() => { switchTab("Profile"); setProfileTab("leaderboard"); }} style={{ background: "linear-gradient(135deg,rgba(244,162,97,0.12),rgba(244,162,97,0.04))", border: "2px solid #d0b090", borderRadius: 13, padding: "10px 13px", marginBottom: 12, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.83rem" }}>🏆 {lang === "ja" ? "シーズンランキング" : "Season Leaderboard"}</div>
                <div style={{ fontSize: "0.95rem", color: "#5a5a4a", marginTop: 2 }}>{lang === "ja" ? "テンカラ師が15,600ptでトップ · あなたは#8" : "テンカラ師 leads 15,600pts · You're #8"}</div>
              </div>
              <div style={{ color: "#c06a10" }}>→</div>
            </div>
            {catchesLoading ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#5a5a4a" }}>
                <div style={{ fontSize: "2rem", animation: "spin 1s linear infinite", display: "inline-block", marginBottom: 8 }}>🎣</div>
                <div style={{ fontSize: "0.95rem" }}>{lang === "ja" ? "釣果を読み込み中..." : "Loading catches..."}</div>
              </div>
            ) : catches.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#5a5a4a" }}>
                <div style={{ fontSize: "2rem", marginBottom: 8 }}>🐟</div>
                <div style={{ fontSize: "0.95rem" }}>{lang === "ja" ? "まだ釣果がありません" : "No catches yet — be the first!"}</div>
              </div>
            ) : null}
            {catches.map((c, i) => (
              <React.Fragment key={c.id}>
                {i === 2 && !isPremium && <BannerAd lang={lang} isPremium={isPremium} />}
                <div style={{ background: "#fffdf8", border: "2px solid #e0dbd0", borderRadius: 17, overflow: "hidden", marginBottom: 13, animation: `fadeUp ${0.18 + i * 0.07}s ease both` }}>
                <div style={{ height: 140, background: "linear-gradient(135deg,#e8e3d8,#d8d3c8)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  {c.photo ? <img src={c.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ animation: "float 3s ease-in-out infinite" }}><FishIllustration fishId={FISH_DATA.find(f=>f.name===c.fish)?.id || 1} spriteId={FISH_DATA.find(f=>f.name===c.fish)?.spriteId} size={100} /></div>}
                  <div style={{ position: "absolute", bottom: 9, right: 9, background: "rgba(30,30,20,0.8)", borderRadius: 7, padding: "3px 9px", fontSize: "0.95rem", color: "#c06a10", fontWeight: 700 }}>⚖️ {c.weight}</div>
                  {c.verified && <div style={{ position: "absolute", top: 9, right: 9, background: "#c8e8d0", border: "1px solid #FFE50044", borderRadius: 7, padding: "2px 7px", fontSize: "1.05rem", color: "#2d7a3a" }}>{s("verified", lang)}</div>}
                  {c.method === "fly" && <div style={{ position: "absolute", top: 9, left: 9, background: "#c8e8d0", border: "2px solid #60b080", borderRadius: 7, padding: "2px 7px", fontSize: "1.05rem", color: "#2d7a3a" }}>🪶 {lang === "ja" ? "フライ" : lang === "es" ? "Mosca" : "Fly"}</div>}
                </div>
                <div style={{ padding: "11px 13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                        <span style={{ fontSize: "1.05rem" }}>{c.avatar}</span>
                        <span style={{ fontWeight: 700, fontSize: "0.83rem" }}>{c.user}</span>
                        <span style={{ color: "#5a5a4a", fontSize: "0.95rem" }}>· {c.date?.[lang] || c.date}</span>
                      </div>
                      <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#0d7377" }}>{c.fish}</div>
                      <div style={{ fontSize: "0.95rem", color: "#5a5a4a" }}>📍 {c.location}</div>
                    </div>
                    {c.rating > 0 && <div style={{ color: "#c06a10", fontSize: "1.05rem" }}>{"★".repeat(Math.floor(c.rating))} {c.rating}</div>}
                  </div>
                  {c.comments.length > 0 && (
                    <div style={{ background: "#fffdf8", borderRadius: 9, padding: "6px 10px", marginBottom: 8 }}>
                      {c.comments.slice(0, 2).map((cm, ci) => <div key={ci} style={{ fontSize: "0.74rem", color: "#5a5a4a", marginBottom: ci < 1 && c.comments.length > 1 ? 3 : 0 }}><span style={{ color: "#0d7377" }}>●</span> {cm}</div>)}
                      {c.comments.length > 2 && <div style={{ fontSize: "0.95rem", color: "#7a7a6a", marginTop: 3 }}>+{c.comments.length - 2}{lang === "ja" ? "件" : " more"}</div>}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => toggleLike(c.id)} style={{ flex: 1, padding: "7px", background: liked[c.id] ? "rgba(230,57,70,0.13)" : "#fffdf8", border: `2px solid ${liked[c.id] ? "#b82030" : "#e0dbd0"}`, borderRadius: 8, color: liked[c.id] ? "#e63946" : "#8899aa", cursor: "pointer", fontFamily: "inherit", fontSize: "1.05rem" }}>{liked[c.id] ? "❤️" : "🤍"} {c.likes}</button>
                    <button onClick={() => setCommentOpen(commentOpen === c.id ? null : c.id)} style={{ flex: 1, padding: "7px", background: "#fffdf8", border: "2px solid #e0dbd0", borderRadius: 8, color: "#5a5a4a", cursor: "pointer", fontFamily: "inherit", fontSize: "1.05rem" }}>💬 {c.comments.length}</button>
                    <button onClick={() => shareToLINE(c, lang)} style={{ padding: "7px 10px", background: "#e0f2f2", border: "2px solid #06c755", borderRadius: 8, color: "#06c755", cursor: "pointer", fontSize: "1.05rem", fontWeight: 700 }}>LINE</button>
                    <button onClick={() => shareToTwitter(c, lang)} style={{ padding: "7px 10px", background: "#e8f0f8", border: "2px solid #1da1f2", borderRadius: 8, color: "#1da1f2", cursor: "pointer", fontSize: "1.05rem" }}>𝕏</button>
                  </div>
                  {commentOpen === c.id && (
                    <div style={{ marginTop: 8, display: "flex", gap: 6, animation: "fadeUp 0.2s ease" }}>
                      <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder={s("addComment", lang)} onKeyDown={e => e.key === "Enter" && addComment(c.id)} style={{ flex: 1, background: "#fffdf8", border: "2px solid #FFE500", borderRadius: 7, padding: "7px 10px", color: "#0d7377", fontSize: "1.05rem" }} />
                      <button onClick={() => addComment(c.id)} style={{ background: "#d0eae8", border: "2px solid #c8b800", borderRadius: 7, padding: "7px 10px", color: "#0d7377", cursor: "pointer", fontSize: "1.05rem" }}>→</button>
                    </div>
                  )}
                </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* ── PROFILE ── */}
        {tab === "Profile" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <div style={{ background: "linear-gradient(135deg,rgba(72,202,228,0.1),rgba(13,33,55,0.9))", border: "2px solid #FFE500", borderRadius: 19, padding: 17, marginBottom: 13 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 13 }}>
                <div style={{ position: "relative" }}>
                  <div style={{ width: 58, height: 58, borderRadius: "50%", background: "rgba(72,202,228,0.13)", border: "3px solid #1a1a14", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>{profile.avatar}</div>
                  <div style={{ position: "absolute", bottom: -2, right: -2, width: 17, height: 17, borderRadius: "50%", background: "#2d7a3a", border: "2px solid #f5f0e8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.5rem" }}>✓</div>
                </div>
                <div style={{ flex: 1 }}>
                  {editProfile ? <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} style={{ background: "#f0ebe0", border: "2px solid #70a8b8", borderRadius: 7, padding: "4px 9px", color: "#0d7377", fontSize: "0.92rem", fontWeight: 700, width: "100%", marginBottom: 4 }} /> : <div style={{ fontWeight: 700, fontSize: "0.98rem" }}>{profile.name}</div>}
                  {editProfile ? <input value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} style={{ background: "#f0ebe0", border: "2px solid #70a8b8", borderRadius: 7, padding: "4px 9px", color: "#5a5a4a", fontSize: "1.05rem", width: "100%" }} /> : <div style={{ color: "#5a5a4a", fontSize: "1.05rem" }}>{profile.bio}</div>}
                </div>
                <button onClick={() => setEditProfile(!editProfile)} style={{ background: "#fffdf8", border: "2px solid #d4cfc4", borderRadius: 7, padding: "5px 9px", color: "#5a5a4a", cursor: "pointer", fontFamily: "inherit", fontSize: "0.95rem" }}>{editProfile ? s("save", lang) : s("edit", lang)}</button>
              </div>
              <div style={{ display: "flex", marginBottom: 11 }}>
                {[
                  { la: { ja: "釣果", en: "Catches" }, v: profile.catches + myCatches.length },
                  { la: { ja: "フォロワー", en: "Followers" }, v: profile.followers },
                  { la: { ja: "フォロー中", en: "Following" }, v: profile.following },
                  { la: { ja: "ランク", en: "Rank" }, v: "#8" },
                ].map((st, i) => (
                  <div key={st.la.ja} style={{ flex: 1, textAlign: "center", borderLeft: i > 0 ? "1px solid #e0dbd0" : "none" }}>
                    <div style={{ fontWeight: 700, fontSize: "1rem", color: "#0d7377" }}>{st.v}</div>
                    <div style={{ fontSize: "1.05rem", color: "#5a5a4a" }}>{st.la[lang]}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "#f8ece0", border: "2px solid #d0b090", borderRadius: 10, padding: "8px 12px", display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontSize: "1.05rem" }}>🏆 {lang === "ja" ? "シーズンランク" : "Season rank"}: <strong style={{ color: "#c06a10" }}>#8</strong></div>
                <div style={{ fontSize: "1.05rem", color: "#c06a10", fontWeight: 700 }}>3,210 pt</div>
              </div>
              {!isPremium && (
                <button onClick={() => { setIsPremium(true); }} style={{ width: "100%", marginTop: 10, padding: "10px", background: "linear-gradient(135deg,rgba(144,96,224,0.2),rgba(72,202,228,0.1))", border: "2px solid #a080d0", borderRadius: 12, color: "#6040a0", cursor: "pointer", fontFamily: "inherit", fontSize: "0.95rem", fontWeight: 700 }}>
                  👑 {lang === "ja" ? "PROにアップグレード — 広告なし ¥480/月" : "Upgrade to PRO — Ad-free ¥480/month"}
                </button>
              )}
              {isPremium && (
                <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(144,96,224,0.1)", border: "2px solid #c0a0e0", borderRadius: 10, fontSize: "1.05rem", color: "#6040a0", textAlign: "center" }}>
                  👑 {lang === "ja" ? "PROメンバー — 広告なしでお楽しみください" : "PRO Member — Enjoy ad-free fishing!"}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 5, marginBottom: 13 }}>
              {[{ k: "catches", ja: "🎣 釣果記録", en: "🎣 My Catches" }, { k: "trophy", ja: "🏆 記録", en: "🏆 Records" }, { k: "calendar", ja: "🗓️ 釣り暦", en: "🗓️ Calendar" }, { k: "journal", ja: "📓 日誌", en: "📓 Journal" }, { k: "leaderboard", ja: "👑 ランク", en: "👑 Rank" }, { k: "pro", ja: "💎 PRO", en: "💎 PRO" }].map(pt => (
                <button key={pt.k} onClick={() => setProfileTab(pt.k)} style={{ flex: 1, padding: "8px", borderRadius: 9, border: `1px solid ${profileTab === pt.k ? (pt.k === "pro" ? "rgba(144,96,224,0.6)" : "#1a1a14") : "#d4cfc4"}`, background: profileTab === pt.k ? (pt.k === "pro" ? "rgba(144,96,224,0.15)" : "rgba(72,202,228,0.1)") : "transparent", color: profileTab === pt.k ? (pt.k === "pro" ? "#9060e0" : "#1a1a14") : "#8899aa", cursor: "pointer", fontFamily: "inherit", fontSize: "1rem", fontWeight: profileTab === pt.k ? 700 : 400 }}>{pt[lang]}</button>
              ))}
            </div>

            {profileTab === "catches" && (
              <>
                <button onClick={() => setLogOpen(!logOpen)} style={{ width: "100%", padding: "12px", marginBottom: 11, background: "linear-gradient(135deg,rgba(72,202,228,0.15),rgba(72,202,228,0.05))", border: "2px solid #80b8c8", borderRadius: 12, color: "#0d7377", cursor: "pointer", fontFamily: "inherit", fontSize: "1rem", fontWeight: 700 }}>{s("logCatch", lang)}</button>
                {logOpen && (
                  <div style={{ background: "#fffdf8", border: "2px solid #FFE500", borderRadius: 15, padding: 13, marginBottom: 11, animation: "fadeUp 0.3s ease" }}>
                    <div style={{ fontWeight: 700, marginBottom: 10, color: "#0d7377", fontSize: "1rem" }}>🎣 {lang === "ja" ? "釣果を記録" : "Record Your Catch"}</div>
                    <div onClick={() => !photoPreview && fileRef.current.click()}
                      style={{ minHeight: 110, border: "2px dashed #FFE500", borderRadius: 11, marginBottom: 9, cursor: photoPreview ? "default" : "pointer", background: photoPreview ? "transparent" : "#f0f8f8", overflow: "hidden", position: "relative" }}>
                      {photoPreview ? (
                        <>
                          <img src={photoPreview} alt="" style={{ width: "100%", maxHeight: 160, objectFit: "cover", display: "block" }} />
                          <button onClick={(e) => { e.stopPropagation(); setPhotoPreview(null); setFishIDResult(null); setNewCatch(p => ({ ...p, photo: null })); fileRef.current.click(); }}
                            style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: 8, padding: "4px 10px", color: "white", cursor: "pointer", fontSize: "0.82rem" }}>
                            {lang === "ja" ? "📷 変更" : "📷 Change"}
                          </button>
                        </>
                      ) : (
                        <div style={{ textAlign: "center", padding: "24px 16px", color: "#5a5a4a" }}>
                          <div style={{ fontSize: "2rem", marginBottom: 6 }}>📸</div>
                          <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 4 }}>
                            {lang === "ja" ? "写真を撮影・選択" : "Take or choose a photo"}
                          </div>
                          <div style={{ fontSize: "0.82rem", color: "#0d7377" }}>
                            🤖 {lang === "ja" ? "AIが魚種を自動識別します" : "AI will auto-identify the species"}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* AI Fish ID Loading */}
                    {fishIDLoading && (
                      <div style={{ background: "#e0f2f2", border: "2px solid #FFE500", borderRadius: 12, padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12, animation: "fadeUp 0.3s ease" }}>
                        <div style={{ fontSize: "1.8rem", animation: "spin 1s linear infinite" }}>🔍</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0d7377" }}>{lang === "ja" ? "AIが魚を識別中..." : "AI identifying fish..."}</div>
                          <div style={{ fontSize: "0.82rem", color: "#5a5a4a" }}>{lang === "ja" ? "種類・サイズ・規制を確認しています" : "Checking species, size & regulations"}</div>
                        </div>
                      </div>
                    )}

                    {/* AI Fish ID Result */}
                    {fishIDResult && !fishIDLoading && (
                      <div style={{ borderRadius: 12, marginBottom: 10, overflow: "hidden", animation: "fadeUp 0.3s ease", border: `2px solid ${fishIDResult.isFish ? (fishIDResult.isKeepable ? "#2d7a3a" : "#c06a10") : "#b82030"}` }}>
                        {fishIDResult.isFish ? (
                          <>
                            <div style={{ background: fishIDResult.isKeepable ? "#e0f2f2" : "#f8e8d0", padding: "12px 14px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                  <div style={{ fontWeight: 900, fontSize: "1.15rem" }}>{fishIDResult.species?.[lang]}</div>
                                  <div style={{ fontSize: "0.82rem", color: "#5a5a4a", marginTop: 2 }}>{fishIDResult.species?.[lang === "ja" ? "en" : "ja"]}</div>
                                </div>
                                <span style={{ background: fishIDResult.confidence === "high" ? "#2d7a3a" : fishIDResult.confidence === "medium" ? "#c06a10" : "#b82030", color: "white", borderRadius: 99, padding: "3px 10px", fontSize: "0.75rem", fontWeight: 700 }}>
                                  {fishIDResult.confidence === "high" ? (lang === "ja" ? "高精度" : "High") : fishIDResult.confidence === "medium" ? (lang === "ja" ? "中精度" : "Medium") : (lang === "ja" ? "低精度" : "Low")}
                                </span>
                              </div>
                            </div>
                            <div style={{ background: "#fffdf8", padding: "10px 14px", display: "flex", gap: 16, flexWrap: "wrap" }}>
                              {fishIDResult.estimatedLength && <div><div style={{ fontSize: "0.75rem", color: "#7a7a6a" }}>{lang === "ja" ? "推定サイズ" : "Est. Length"}</div><div style={{ fontWeight: 700 }}>📏 {fishIDResult.estimatedLength}</div></div>}
                              {fishIDResult.estimatedWeight && <div><div style={{ fontSize: "0.75rem", color: "#7a7a6a" }}>{lang === "ja" ? "推定重量" : "Est. Weight"}</div><div style={{ fontWeight: 700 }}>⚖️ {fishIDResult.estimatedWeight}</div></div>}
                              {fishIDResult.condition && <div><div style={{ fontSize: "0.75rem", color: "#7a7a6a" }}>{lang === "ja" ? "状態" : "Condition"}</div><div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{fishIDResult.condition?.[lang]}</div></div>}
                            </div>
                            {fishIDResult.description?.[lang] && (
                              <div style={{ background: "#f8f4ec", padding: "10px 14px", fontSize: "0.88rem", color: "#3a3a2a", lineHeight: 1.6 }}>{fishIDResult.description[lang]}</div>
                            )}
                            {fishIDResult.regulations && (
                              <div style={{ background: fishIDResult.isKeepable ? "#e0f2f2" : "#f8e8d0", padding: "10px 14px", borderTop: "1px solid #e0dbd0" }}>
                                <div style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: 4, color: fishIDResult.isKeepable ? "#2d7a3a" : "#c06a10" }}>
                                  {fishIDResult.isKeepable ? "✅" : "⚠️"} {lang === "ja" ? "規制情報" : "Regulations"}
                                  {fishIDResult.regulations.minSize && <span style={{ marginLeft: 8, fontWeight: 400, fontSize: "0.82rem" }}>{lang === "ja" ? `最小キープサイズ: ${fishIDResult.regulations.minSize}cm` : `Min keep: ${fishIDResult.regulations.minSize}cm`}</span>}
                                </div>
                                <div style={{ fontSize: "0.85rem", color: "#3a3a2a" }}>{fishIDResult.regulations.note?.[lang]}</div>
                              </div>
                            )}
                            {fishIDResult.confidence !== "low" && (
                              <div style={{ background: "#e0f2f2", padding: "8px 14px", fontSize: "0.82rem", color: "#0d7377", fontWeight: 600 }}>
                                ✓ {lang === "ja" ? "魚種・重量を自動入力しました" : "Species & weight auto-filled below"}
                              </div>
                            )}
                          </>
                        ) : (
                          <div style={{ background: "#f8f4ec", padding: "14px", display: "flex", gap: 10, alignItems: "center" }}>
                            <div style={{ fontSize: "1.5rem" }}>🤷</div>
                            <div style={{ fontSize: "0.88rem", color: "#5a5a4a" }}>{fishIDResult.message?.[lang]}</div>
                          </div>
                        )}
                      </div>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
                    {/* Method toggle */}
                    <div style={{ display: "flex", gap: 6, marginBottom: 9 }}>
                      {[{ k: "lure", ja: "🎣 ルアー", en: "🎣 Lure" }, { k: "fly", ja: "🪶 フライ", en: "🪶 Fly" }, { k: "bait", ja: "🪱 エサ", en: "🪱 Bait" }].map(m => (
                        <button key={m.k} onClick={() => setNewCatch(p => ({ ...p, method: m.k }))} style={{ flex: 1, padding: "6px", borderRadius: 8, border: `1px solid ${newCatch.method === m.k ? "rgba(72,202,228,0.5)" : "#d4cfc4"}`, background: newCatch.method === m.k ? "rgba(72,202,228,0.12)" : "transparent", color: newCatch.method === m.k ? "#1a1a14" : "#8899aa", cursor: "pointer", fontFamily: "inherit", fontSize: "0.95rem" }}>{m[lang]}</button>
                      ))}
                    </div>
                    {/* Location sharing opt-in */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, background: locationSharing ? "#e0f2f2" : "#f5f0e8", border: `2px solid ${locationSharing ? "#1a1a14" : "#d4cfc4"}`, borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.88rem", color: locationSharing ? "#1a1a14" : "#5a5a4a" }}>
                          📍 {lang === "ja" ? "釣り場所をマップに共有" : "Share catch location on map"}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#7a7a6a" }}>
                          {lang === "ja" ? "他のユーザーにこのスポットが見えます" : "Other users will see this spot"}
                        </div>
                      </div>
                      <button onClick={() => setLocationSharing(!locationSharing)}
                        style={{ width: 44, height: 24, borderRadius: 99, border: "none", background: locationSharing ? "#1a1a14" : "#d4cfc4", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                        <div style={{ width: 18, height: 18, borderRadius: "50%", background: "white", position: "absolute", top: 3, left: locationSharing ? 23 : 3, transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
                      </button>
                    </div>
                    {[{ k: "fish", ph: { ja: "魚種（例：ヤマメ）", en: "Species (e.g. Yamame)" } }, { k: "weight", ph: { ja: "重さ（例：0.4 kg）", en: "Weight (e.g. 0.4 kg)" } }, { k: "location", ph: { ja: "釣り場所", en: "Location" } }].map(f => (
                      <input key={f.k} value={newCatch[f.k]} onChange={e => setNewCatch(p => ({ ...p, [f.k]: e.target.value }))} placeholder={f.ph[lang]} style={{ width: "100%", marginBottom: 8, background: "#fffdf8", border: "2px solid #FFE500", borderRadius: 8, padding: "9px 12px", color: "#0d7377", fontSize: "0.92rem" }} />
                    ))}
                    <textarea value={newCatch.notes} onChange={e => setNewCatch(p => ({ ...p, notes: e.target.value }))} placeholder={lang === "ja" ? "メモ（フライパターン・状況・テクニック）" : "Notes (fly pattern, conditions, technique)"} rows={3} style={{ width: "100%", marginBottom: 10, background: "#fffdf8", border: "2px solid #FFE500", borderRadius: 8, padding: "9px 12px", color: "#0d7377", fontSize: "0.92rem", resize: "vertical" }} />
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={submitCatch} style={{ flex: 2, padding: "10px", background: newCatch.fish ? "#d0eae8" : "#e8e3d8", border: `2px solid ${newCatch.fish ? "#80b0c8" : "#c4bfb4"}`, borderRadius: 9, color: newCatch.fish ? "#1a1a14" : "#9a9a8a", cursor: newCatch.fish ? "pointer" : "not-allowed", fontFamily: "inherit", fontWeight: 700 }}>{s("saveshare", lang)}</button>
                      <button onClick={() => { setLogOpen(false); setPhotoPreview(null); setFishIDResult(null); }} style={{ flex: 1, padding: "10px", background: "#fffdf8", border: "2px solid #d4cfc4", borderRadius: 9, color: "#5a5a4a", cursor: "pointer", fontFamily: "inherit" }}>{s("cancel", lang)}</button>
                    </div>
                  </div>
                )}
                <div style={{ fontSize: "0.66rem", color: "#5a5a4a", marginBottom: 9, letterSpacing: "0.07em" }}>{lang === "ja" ? "あなたの釣果ログ" : "YOUR CATCH LOG"}</div>
                {myCatches.length === 0
                  ? <div style={{ textAlign: "center", padding: "36px 14px", color: "#5a5a4a", background: "#f8f4ec", borderRadius: 15, border: "2px dashed #d4cfc4" }}><div style={{ fontSize: "2.2rem", marginBottom: 7, animation: "float 2s ease-in-out infinite" }}>🪶</div><p style={{ fontStyle: "italic", margin: 0, fontSize: "0.92rem", whiteSpace: "pre-line" }}>{s("noCatchYet", lang)}</p></div>
                  : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {myCatches.map(c => (
                      <div key={c.id} style={{ background: "#fffdf8", border: "2px solid #e0dbd0", borderRadius: 12, overflow: "hidden" }}>
                        {c.photo && <img src={c.photo} alt="" style={{ width: "100%", height: 100, objectFit: "cover" }} />}
                        <div style={{ padding: "10px 13px", display: "flex", gap: 10, alignItems: "center" }}>
                          {!c.photo && <div style={{ width: 38, height: 38, borderRadius: 8, background: "#e0f2f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>{c.method === "fly" ? "🪶" : "🎣"}</div>}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: "1rem" }}>{c.fish}</div>
                            <div style={{ fontSize: "0.95rem", color: "#5a5a4a" }}>⚖️ {c.weight} · 📍 {c.location}</div>
                            {c.notes && <div style={{ fontSize: "0.95rem", color: "#5a5a4a", fontStyle: "italic", marginTop: 2 }}>{c.notes}</div>}
                          </div>
                          <div style={{ fontSize: "0.95rem", color: "#5a5a4a" }}>{ c.date?.[lang] || c.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>}
              </>
            )}

            {profileTab === "trophy" && (
              <div style={{ animation: "fadeUp 0.4s ease" }}>
                <h3 style={{ margin: "0 0 12px", fontSize: "1.1rem" }}>🏆 {lang === "ja" ? "魚種別自己記録" : "Personal Best Records"}</h3>
                <TrophyRoom catches={[...myCatches, ...catches.filter(c => c.user === profile.name)]} lang={lang} FISH_DATA={FISH_DATA} />
              </div>
            )}

            {profileTab === "calendar" && (
              <div style={{ animation: "fadeUp 0.4s ease" }}>
                <TidalCalendar lang={lang} userLocation={userLocation} />
              </div>
            )}

            {profileTab === "journal" && (
              <div style={{ animation: "fadeUp 0.4s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3 style={{ margin: 0, fontSize: "1.1rem" }}>📓 {lang === "ja" ? "釣り日誌" : "Fishing Journal"}</h3>
                  <button onClick={() => setJournalOpen(!journalOpen)} style={{ background: "#e0f2f2", border: "2px solid #FFE500", borderRadius: 10, padding: "6px 12px", color: "#0d7377", cursor: "pointer", fontFamily: "inherit", fontSize: "0.88rem", fontWeight: 700 }}>
                    + {lang === "ja" ? lang === "ja" ? "新しい日誌" : "New Entry" : "New Entry"}
                  </button>
                </div>

                {journalOpen && (
                  <div style={{ background: "#fffdf8", border: "2px solid #FFE500", borderRadius: 14, padding: 14, marginBottom: 14, animation: "fadeUp 0.3s ease" }}>
                    <input value={journalEntry.title} onChange={e => setJournalEntry(p => ({...p, title: e.target.value}))} placeholder={lang === "ja" ? "タイトル（例：矢部川 朝の部）" : "Title (e.g. Yabeji River morning session)"} style={{ width: "100%", marginBottom: 8, background: "#f5f0e8", border: "2px solid #FFE500", borderRadius: 8, padding: "9px 12px", fontSize: "0.92rem" }} />
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <input value={journalEntry.weather} onChange={e => setJournalEntry(p => ({...p, weather: e.target.value}))} placeholder={lang === "ja" ? "天気" : lang === "es" ? "Clima" : "Weather"} style={{ flex: 1, background: "#f5f0e8", border: "2px solid #FFE500", borderRadius: 8, padding: "9px 12px", fontSize: "0.92rem" }} />
                      <input value={journalEntry.water} onChange={e => setJournalEntry(p => ({...p, water: e.target.value}))} placeholder={lang === "ja" ? "水温・水量" : "Water temp/level"} style={{ flex: 1, background: "#f5f0e8", border: "2px solid #FFE500", borderRadius: 8, padding: "9px 12px", fontSize: "0.92rem" }} />
                    </div>
                    <input value={journalEntry.flies} onChange={e => setJournalEntry(p => ({...p, flies: e.target.value}))} placeholder={lang === "ja" ? "使用フライ・ルアー" : "Flies/lures used"} style={{ width: "100%", marginBottom: 8, background: "#f5f0e8", border: "2px solid #FFE500", borderRadius: 8, padding: "9px 12px", fontSize: "0.92rem" }} />
                    <textarea value={journalEntry.notes} onChange={e => setJournalEntry(p => ({...p, notes: e.target.value}))} placeholder={lang === "ja" ? "メモ・観察・気づき..." : "Notes, observations, insights..."} rows={4} style={{ width: "100%", marginBottom: 8, background: "#f5f0e8", border: "2px solid #FFE500", borderRadius: 8, padding: "9px 12px", fontSize: "0.92rem", resize: "vertical" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <span style={{ fontSize: "0.88rem", color: "#5a5a4a" }}>{lang === "ja" ? "評価:" : "Rating:"}</span>
                      {[1,2,3,4,5].map(s => (
                        <button key={s} onClick={() => setJournalEntry(p => ({...p, rating: s}))} style={{ fontSize: "1.3rem", background: "none", border: "none", cursor: "pointer", opacity: s <= journalEntry.rating ? 1 : 0.3 }}>⭐</button>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => { if (journalEntry.title) { addEntry(journalEntry); setJournalEntry({ title: "", notes: "", weather: "", water: "", flies: "", rating: 3 }); setJournalOpen(false); } }} style={{ flex: 2, padding: "10px", background: "#d0eae8", border: "2px solid #c8b800", borderRadius: 9, color: "#0d7377", cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>{lang === "ja" ? "保存" : "Save"}</button>
                      <button onClick={() => setJournalOpen(false)} style={{ flex: 1, padding: "10px", background: "#fffdf8", border: "2px solid #d4cfc4", borderRadius: 9, color: "#5a5a4a", cursor: "pointer", fontFamily: "inherit" }}>{lang === "ja" ? "キャンセル" : "Cancel"}</button>
                    </div>
                  </div>
                )}

                {journal.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "#5a5a4a", background: "#f8f4ec", borderRadius: 14, border: "2px dashed #d4cfc4" }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>📓</div>
                    <div style={{ fontSize: "0.95rem" }}>{lang === "ja" ? lang === "ja" ? "まだ日誌がありません" : "No journal entries yet" : "No journal entries yet"}</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {journal.map(entry => (
                      <div key={entry.id} style={{ background: "#fffdf8", border: "2px solid #e0dbd0", borderRadius: 14, padding: "14px 16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                          <div style={{ fontWeight: 700, fontSize: "1rem" }}>{entry.title}</div>
                          <button onClick={() => deleteEntry(entry.id)} style={{ background: "none", border: "none", color: "#b82030", cursor: "pointer", fontSize: "1rem", padding: "0 4px" }}>✕</button>
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                          {entry.weather && <span style={{ fontSize: "0.8rem", background: "#e0f2f2", borderRadius: 99, padding: "2px 8px", color: "#0d7377" }}>⛅ {entry.weather}</span>}
                          {entry.water && <span style={{ fontSize: "0.8rem", background: "#e0f2f2", borderRadius: 99, padding: "2px 8px", color: "#0d7377" }}>🌊 {entry.water}</span>}
                          {entry.flies && <span style={{ fontSize: "0.8rem", background: "#f8e8d0", borderRadius: 99, padding: "2px 8px", color: "#c06a10" }}>🪶 {entry.flies}</span>}
                        </div>
                        {entry.notes && <div style={{ fontSize: "0.88rem", color: "#3a3a2a", lineHeight: 1.6, marginBottom: 8 }}>{entry.notes}</div>}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>{"⭐".repeat(entry.rating)}{"☆".repeat(5 - entry.rating)}</div>
                          <div style={{ fontSize: "0.75rem", color: "#9a9a8a" }}>{new Date(entry.createdAt).toLocaleDateString(lang === "ja" ? "ja-JP" : "en-US")}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {profileTab === "leaderboard" && (
              <div>
                <div style={{ display: "flex", gap: 5, marginBottom: 11 }}>
                  {[{ k: "points", ja: "ポイント", en: "Points" }, { k: "catches", ja: "釣果数", en: "Catches" }, { k: "streak", ja: "連続日数", en: "Streak" }].map(f => (
                    <button key={f.k} onClick={() => setLeaderFilter(f.k)} style={{ flex: 1, padding: "6px", borderRadius: 8, border: `1px solid ${leaderFilter === f.k ? "#c06a10" : "#d4cfc4"}`, background: leaderFilter === f.k ? "rgba(244,162,97,0.1)" : "transparent", color: leaderFilter === f.k ? "#f4a261" : "#8899aa", cursor: "pointer", fontFamily: "inherit", fontSize: "0.95rem" }}>{f[lang]}</button>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {LEADERBOARD.sort((a, b) => leaderFilter === "points" ? b.points - a.points : leaderFilter === "catches" ? b.catches - a.catches : b.streak - a.streak).map((u, i) => (
                    <div key={u.rank} style={{ background: i === 0 ? "rgba(244,162,97,0.09)" : "#fffdf8", border: `1px solid ${i === 0 ? "rgba(244,162,97,0.26)" : "#e0dbd0"}`, borderRadius: 12, padding: "10px 13px", display: "flex", gap: 10, alignItems: "center", animation: `fadeUp ${0.17 + i * 0.06}s ease both` }}>
                      <div style={{ fontSize: i < 3 ? "1.2rem" : "0.78rem", minWidth: 26, textAlign: "center", fontWeight: 700, color: i === 0 ? "#f4a261" : "#8899aa" }}>{i < 3 ? u.badge : `#${u.rank}`}</div>
                      <div style={{ fontSize: "1.2rem" }}>{u.avatar}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: "1rem" }}>{u.user}</div>
                        <div style={{ fontSize: "0.95rem", color: "#5a5a4a" }}>🐟 {u.topFish[lang]} · 🔥 {u.streak}{lang === "ja" ? "日" : "d"}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 700, color: "#c06a10", fontSize: "1rem" }}>{leaderFilter === "points" ? u.points.toLocaleString() : leaderFilter === "catches" ? u.catches : `${u.streak}${lang === "ja" ? "日" : "d"}`}</div>
                        <div style={{ fontSize: "1.05rem", color: "#5a5a4a" }}>{leaderFilter === "points" ? "pt" : leaderFilter === "catches" ? (lang === "ja" ? "釣果" : "catches") : (lang === "ja" ? "連続" : "streak")}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ background: "rgba(72,202,228,0.07)", border: "2px solid #FFE500", borderRadius: 12, padding: "10px 13px", display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ fontSize: "1.05rem", minWidth: 26, textAlign: "center", fontWeight: 700, color: "#0d7377" }}>#8</div>
                    <div style={{ fontSize: "1.2rem" }}>{profile.avatar}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: "1rem" }}>{profile.name} <span style={{ fontSize: "0.95rem", color: "#0d7377" }}>({lang === "ja" ? "あなた" : "You"})</span></div>
                      <div style={{ fontSize: "0.95rem", color: "#5a5a4a" }}>{s("keepFishing", lang)}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700, color: "#0d7377", fontSize: "1rem" }}>3,210</div>
                      <div style={{ fontSize: "1.05rem", color: "#5a5a4a" }}>pt</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {profileTab === "pro" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            {isPremium ? (
              <div style={{ textAlign: "center", padding: "30px 20px" }}>
                <div style={{ fontSize: "4rem", marginBottom: 12, animation: "float 2s ease-in-out infinite" }}>👑</div>
                <div style={{ fontWeight: 700, fontSize: "1.3rem", color: "#6040a0", marginBottom: 8 }}>{lang === "ja" ? "PROメンバー！" : "PRO Member!"}</div>
                <div style={{ fontSize: "0.95rem", color: "#5a5a4a", marginBottom: 20 }}>{lang === "ja" ? "すべてのプレミアム機能をお楽しみください" : "Enjoy all premium features"}</div>
                {[{ icon: "🚫", text: { ja: "全広告非表示", en: "All ads removed" } }, { icon: "🤖", text: { ja: "AI診断 無制限", en: "Unlimited AI advice" } }, { icon: "🪶", text: { ja: "プレミアムフライパターン", en: "Premium fly patterns" } }, { icon: "📊", text: { ja: "詳細釣果分析", en: "Detailed catch analytics" } }, { icon: "🗺️", text: { ja: "オフラインマップ", en: "Offline maps" } }].map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 14px", background: "#f4f0f8", border: "2px solid #d0b8e8", borderRadius: 12, marginBottom: 8 }}>
                    <span style={{ fontSize: "1.3rem" }}>{f.icon}</span>
                    <span style={{ fontSize: "0.95rem", color: "#6040a0" }}>{f.text[lang]}</span>
                    <span style={{ marginLeft: "auto", color: "#6040a0", fontSize: "1.05rem" }}>✓</span>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div style={{ background: "linear-gradient(135deg,rgba(144,96,224,0.15),rgba(72,202,228,0.08))", border: "2px solid #c0a0e0", borderRadius: 18, padding: 18, marginBottom: 16, textAlign: "center" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>👑</div>
                  <div style={{ fontWeight: 700, fontSize: "1.15rem", marginBottom: 6 }}>{lang === "ja" ? "釣りナビ PRO" : "Mabo Fishing"}</div>
                  <div style={{ fontSize: "0.92rem", color: "#5a5a4a", lineHeight: 1.6 }}>{lang === "ja" ? "広告なしで、より多くの機能を楽しもう" : "More features, zero ads"}</div>
                </div>
                {[
                  { id: "monthly", label: { ja: "月額プラン", en: "Monthly" }, price: "¥480", period: { ja: "/月", en: "/mo" }, badge: null },
                  { id: "annual", label: { ja: "年額プラン", en: "Annual" }, price: "¥3,800", period: { ja: "/年", en: "/yr" }, badge: { ja: "34%お得", en: "34% off" } },
                ].map(plan => (
                  <div key={plan.id} onClick={() => setIsPremium(true)} style={{ background: plan.id === "annual" ? "rgba(144,96,224,0.12)" : "#fffdf8", border: `1px solid ${plan.id === "annual" ? "rgba(144,96,224,0.45)" : "#d4cfc4"}`, borderRadius: 14, padding: "14px 16px", marginBottom: 10, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>{plan.label[lang]}</span>
                        {plan.badge && <span style={{ background: "#9060e0", color: "white", borderRadius: 99, padding: "1px 8px", fontSize: "0.95rem", fontWeight: 700 }}>{plan.badge[lang]}</span>}
                      </div>
                      <div style={{ fontSize: "0.95rem", color: "#5a5a4a" }}>{lang === "ja" ? "いつでもキャンセル可" : "Cancel anytime"}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700, fontSize: "1.2rem", color: "#6040a0" }}>{plan.price}</div>
                      <div style={{ fontSize: "0.95rem", color: "#5a5a4a" }}>{plan.period[lang]}</div>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: "0.95rem", color: "#5a5a4a", marginBottom: 10, letterSpacing: "0.07em" }}>{lang === "ja" ? "PROの特典" : "WHAT YOU GET"}</div>
                  {[
                    { icon: "🚫", free: { ja: "広告あり", en: "Ads shown" }, pro: { ja: "完全広告なし", en: "Ad-free" } },
                    { icon: "🤖", free: { ja: "AI診断 3回/日", en: "3 AI/day" }, pro: { ja: "AI診断 無制限", en: "Unlimited AI" } },
                    { icon: "🐟", free: { ja: "全16魚種", en: "All 16 species" }, pro: { ja: "季節予測付き", en: "+ forecasts" } },
                    { icon: "🪶", free: { ja: "フライ8パターン", en: "8 fly patterns" }, pro: { ja: "30+プレミアム", en: "30+ premium" } },
                    { icon: "📊", free: { ja: "基本釣果記録", en: "Basic log" }, pro: { ja: "AI釣果分析", en: "AI analytics" } },
                    { icon: "🗺️", free: { ja: "オンラインマップ", en: "Online maps" }, pro: { ja: "オフラインマップ", en: "Offline maps" } },
                  ].map((f, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "9px 12px", background: "#f8f4ec", borderRadius: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: "1.1rem", width: 24 }}>{f.icon}</span>
                      <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.95rem", color: "#5a5a4a" }}>{f.free[lang]}</span>
                        <span style={{ fontSize: "0.95rem", color: "#6040a0", fontWeight: 600 }}>→ {f.pro[lang]}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, background: "#e8f4ec", border: "2px solid #FFE500", borderRadius: 14, padding: 14, textAlign: "center" }}>
                  <div style={{ fontSize: "0.95rem", color: "#5a5a4a", marginBottom: 8 }}>{lang === "ja" ? "まず試してみる？" : "Try before subscribing?"}</div>
                  <button onClick={() => setShowRewarded(true)} style={{ padding: "10px 24px", background: "#d0eae8", border: "2px solid #c8b800", borderRadius: 12, color: "#2d7a3a", cursor: "pointer", fontFamily: "inherit", fontSize: "0.95rem", fontWeight: 700 }}>
                    🎁 {lang === "ja" ? "動画を見て1日PRO体験" : "Watch an ad for 1-day trial"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {showAI && selectedFish && <AIModal fish={selectedFish} weather={WEATHER} lang={lang} onClose={() => setShowAI(false)} />}
      {showFlyAI && <AIFlyModal fish={flyAIFish} weather={WEATHER} lang={lang} currentMonth={lang === "ja" ? HATCH_CALENDAR[new Date().getMonth()].month.ja : HATCH_CALENDAR[new Date().getMonth()].month.en} onClose={() => setShowFlyAI(false)} />}
      {showInterstitial && <InterstitialAd lang={lang} isPremium={isPremium} onClose={closeInterstitial} onWatchReward={() => { setShowInterstitial(false); setShowRewarded(true); }} />}
      {showRewarded && <RewardedAdModal lang={lang} onComplete={() => { setShowRewarded(false); setBonusPoints(p => p + 100); if (pendingTab) { setTab(pendingTab); setPendingTab(null); } }} onClose={() => { setShowRewarded(false); if (pendingTab) { setTab(pendingTab); setPendingTab(null); } }} />}
      {showLocalAI && <LocalAIAdvisor userLocation={userLocation} lang={lang} weather={WEATHER} onClose={() => setShowLocalAI(false)} />}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, height: 1, background: "linear-gradient(90deg,transparent,#c4bfb4,transparent)", pointerEvents: "none", zIndex: 100 }} />
      {/* Legal footer */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "rgba(245,240,232,0.95)", borderTop: "1px solid #d4cfc4", padding: "6px 16px", display: "flex", justifyContent: "center", gap: 16, zIndex: 99, fontSize: "0.72rem", color: "#9a9a8a" }}>
        <a href="/legal.html" target="_blank" style={{ color: "#9a9a8a", textDecoration: "none" }}>{lang === "ja" ? "プライバシーポリシー" : lang === "es" ? "Privacidad" : "Privacy Policy"}</a>
        <span>·</span>
        <a href="/legal.html#terms" target="_blank" style={{ color: "#9a9a8a", textDecoration: "none" }}>{lang === "ja" ? "利用規約" : lang === "es" ? "Términos" : "Terms"}</a>
        <span>·</span>
        <a href="/legal.html#tokushoho" target="_blank" style={{ color: "#9a9a8a", textDecoration: "none" }}>{lang === "ja" ? "特定商取引法" : "Commercial Law"}</a>
        <span>·</span>
        <a href="/legal.html#affiliate" target="_blank" style={{ color: "#9a9a8a", textDecoration: "none" }}>{lang === "ja" ? "広告について" : lang === "es" ? "Publicidad" : "Advertising"}</a>
      </div>
    </div>
  );
}