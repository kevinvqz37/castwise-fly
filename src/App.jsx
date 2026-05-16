import { useState, useEffect, useRef } from "react";
import React from "react";

const T = {
  appTagline: { ja: "もっと賢く釣る", en: "fish smarter · catch more" },
  whatFishing: { ja: "何を釣りますか？", en: "What are you fishing for?" },
  selectSpecies: { ja: "魚を選んでギア＆釣り場を確認", en: "Select a species for gear & spots" },
  search: { ja: "魚を検索...", en: "Search fish..." },
  aiAdvisor: { ja: "🤖 今日のAIルアー診断 →", en: "🤖 AI Lure Advice →" },
  aiFlyAdvisor: { ja: "🪰 今日のAIフライ診断 →", en: "🪰 AI Fly Pattern Advice →" },
  proTip: { ja: "プロのコツ", en: "Pro Tip" },
  back: { ja: "← 戻る", en: "← Back" },
  browsefish: { ja: "魚を探す →", en: "Browse Fish →" },
  noCatchYet: { ja: "まだ釣果がありません。\n釣りに行きましょう！", en: "No catches yet.\nGet out there!" },
  logCatch: { ja: "📸 釣果を記録する", en: "📸 Log a Catch" },
  saveshare: { ja: "保存＆シェア", en: "Save & Share" },
  cancel: { ja: "キャンセル", en: "Cancel" },
  excellent: { ja: "🔥 今日は最高の釣り日和！", en: "🔥 Excellent fishing today!" },
  good: { ja: "👍 良い条件 — 釣りに行こう", en: "👍 Good conditions — go fish" },
  fair: { ja: "😐 まずまず — 深場を狙って", en: "😐 Fair — fish deep or wait" },
  keepFishing: { ja: "🔥 上位を目指して釣り続けよう！", en: "🔥 Keep fishing to climb the ranks!" },
  verified: { ja: "✓ 認証済", en: "✓ Verified" },
  addComment: { ja: "コメントを追加...", en: "Add a comment..." },
  addPhoto: { ja: "タップして写真を追加", en: "Tap to add photo" },
  edit: { ja: "編集", en: "Edit" },
  save: { ja: "保存", en: "Save" },
};
function s(key, lang) { return T[key]?.[lang] || key; }

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
  { id: 1, name: { ja: "エルクヘアカディス", en: "Elk Hair Caddis" }, type: "dry", sizes: "#12–18", color: { ja: "タン/ブラウン", en: "Tan/Brown" }, season: { ja: "春〜秋", en: "Spring–Fall" }, target: { ja: "ヤマメ・イワナ・ニジマス", en: "Yamame, Iwana, Trout" }, technique: { ja: "流れに乗せてドライフライとして使用。ライズリングを狙ってキャスト。", en: "Present as a dry fly and follow the drift. Cast to rising fish." }, difficulty: "beginner", emoji: "🪶", tip: { ja: "フロータントをしっかり塗布し、ドラッグフリードリフトを心がける。", en: "Apply floatant generously and achieve a drag-free drift." } },
  { id: 2, name: { ja: "フェザントテールニンフ", en: "Pheasant Tail Nymph" }, type: "nymph", sizes: "#12–18", color: { ja: "ブラウン/ナチュラル", en: "Brown/Natural" }, season: { ja: "通年", en: "Year-round" }, target: { ja: "ヤマメ・イワナ・ニジマス", en: "Yamame, Iwana, Trout" }, technique: { ja: "インジケーターを使用したニンフィング。川底付近をナチュラルドリフト。", en: "Use an indicator for nymphing. Drift near the bottom with natural current." }, difficulty: "intermediate", emoji: "🪶", tip: { ja: "水深によってビーズヘッドあり・なしを使い分ける。インジケーターが止まったら即アワせ。", en: "Match weight to depth — bead head or not. Strike immediately when the indicator hesitates." } },
  { id: 3, name: { ja: "ウーリーバガー", en: "Woolly Bugger" }, type: "streamer", sizes: "#4–10", color: { ja: "オリーブ/ブラック", en: "Olive/Black" }, season: { ja: "通年（秋冬効果大）", en: "Year-round (peak autumn–winter)" }, target: { ja: "ブラウントラウト・イワナ・シーバス", en: "Brown Trout, Iwana, Seabass" }, technique: { ja: "ストリッピングでリトリーブ。大物はスローシンキングラインで深層を攻める。", en: "Strip retrieve. For big fish, use a slow-sink line to probe deeper water." }, difficulty: "intermediate", emoji: "🪶", tip: { ja: "チャート、ブラック、オリーブをローテーション。その日の当たりカラーを見つける。", en: "Color rotation is key. Try chartreuse, black, and olive until you find the day's hot color." } },
  { id: 4, name: { ja: "パラシュートアダムス", en: "Parachute Adams" }, type: "dry", sizes: "#14–20", color: { ja: "グレー/ホワイト", en: "Grey/White" }, season: { ja: "春〜秋", en: "Spring–Fall" }, target: { ja: "ヤマメ・ニジマス", en: "Yamame, Trout" }, technique: { ja: "最もオールマイティなドライフライ。ハッチがわからない時のファーストチョイス。", en: "The most versatile dry fly. First choice when you're not sure what's hatching." }, difficulty: "beginner", emoji: "🪶", tip: { ja: "白いパラシュートポストで視認性が高く、暗い淵でも見やすい。", en: "The white post gives excellent visibility even in dark pools." } },
  { id: 5, name: { ja: "ミッジ（CDCダン）", en: "CDC Midge Dun" }, type: "dry", sizes: "#20–26", color: { ja: "グレー/オリーブ", en: "Grey/Olive" }, season: { ja: "冬〜早春", en: "Winter–Early Spring" }, target: { ja: "ニジマス・ヤマメ（選択的摂食時）", en: "Trout (selective feeders)" }, technique: { ja: "超繊細なプレゼンテーションが必要。ティペット6X〜7Xを使用。", en: "Requires ultra-delicate presentation. Use 6X–7X tippet." }, difficulty: "advanced", emoji: "🪶", tip: { ja: "冬の選択的ライズに対応する超小型フライ。冬期の切り札。", en: "Essential for selective winter risers. Invaluable in cold months." } },
  { id: 6, name: { ja: "テンカラ毛鉤（逆さ毛鉤）", en: "Tenkara Sakasa Kebari" }, type: "tenkara", sizes: "#8–14", color: { ja: "ブラウン/レッド", en: "Brown/Red" }, season: { ja: "春〜秋", en: "Spring–Fall" }, target: { ja: "ヤマメ・アマゴ・イワナ", en: "Yamame, Amago, Iwana" }, technique: { ja: "逆さに向いたハックルが水中で脈動。テンション＆リリースで誘う。", en: "Reversed hackle pulses in current. Use tension-and-release to animate." }, difficulty: "intermediate", emoji: "🎋", tip: { ja: "「テンションをかけて、抜く」の繰り返しが基本テクニック。", en: "The 'tension and release' cycle is the core tenkara technique." } },
  { id: 7, name: { ja: "ゾンカー（レッド）", en: "Zonker (Red)" }, type: "streamer", sizes: "#2–8", color: { ja: "レッド/ホワイト", en: "Red/White" }, season: { ja: "秋〜冬", en: "Autumn–Winter" }, target: { ja: "大型ヤマメ・ブラウントラウト", en: "Large Yamame, Brown Trout" }, technique: { ja: "大型魚狙い。流れのある深みや大石の影にキャストし、素早くストリッピング。", en: "Big-fish streamer. Cast to deep runs behind boulders. Strip fast for reaction strikes." }, difficulty: "advanced", emoji: "🪶", tip: { ja: "秋の大型ヤマメ・産卵前は大型ストリーマーへの反応が特に良い。", en: "Pre-spawn autumn trout are highly aggressive toward large streamers." } },
  { id: 8, name: { ja: "ゴールドリブドヘアーズイヤー", en: "Gold Ribbed Hare's Ear" }, type: "nymph", sizes: "#10–16", color: { ja: "タン/ゴールド", en: "Tan/Gold" }, season: { ja: "通年", en: "Year-round" }, target: { ja: "ヤマメ・ニジマス・イワナ", en: "Yamame, Trout, Iwana" }, technique: { ja: "スイングやニンフィングで使用。渓流・湧水川で特に効果的。", en: "Use for swinging or nymphing. Especially effective in spring creeks." }, difficulty: "beginner", emoji: "🪶", tip: { ja: "汎用性が最も高いニンフパターンの一つ。ビーズヘッドバージョンで底を流すのが鉄板。", en: "One of the most versatile nymph patterns. Bead-head version fished deep is reliable." } },
];

const CAST_TECHNIQUES = [
  { id: 1, name: { ja: "オーバーヘッドキャスト", en: "Overhead Cast" }, difficulty: "beginner", icon: "🎯", desc: { ja: "フライフィッシングの基本キャスト。10時〜2時のストロークで正確なプレゼンテーションを実現。", en: "The foundation of fly casting. 10-to-2 o'clock stroke for accurate presentation." }, steps: { ja: ["ラインを水面に伸ばす", "ロッドを10時までバックキャスト", "ラインが完全に伸び切るのを待つ", "前方に2時までフォワードキャスト", "ループを開いてフライを着水させる"], en: ["Lay line on water", "Back-cast to 10 o'clock", "Wait for back-loop to fully extend", "Forward cast to 2 o'clock", "Open loop and land fly gently"] }, tip: { ja: "「止めて、待つ」が最重要。急ぎすぎると美しいループが崩れる。", en: "'Stop and wait' is the most important principle. Rushing destroys the loop." } },
  { id: 2, name: { ja: "ロールキャスト", en: "Roll Cast" }, difficulty: "beginner", icon: "🌀", desc: { ja: "後方スペースがない渓流で必須のキャスト。バックキャストなしで前方へラインを展開できる。", en: "Essential when trees limit back-space. Rolls line forward without a back cast." }, steps: { ja: ["ラインを水面にゆっくり引き寄せる", "ロッドを1時まで引き上げる", "D型ループが形成されるのを確認", "前方に力強くロールするようにキャスト", "ループが展開してフライが着水"], en: ["Draw line slowly toward you on water", "Raise rod to 1 o'clock", "Watch D-loop form behind rod", "Power forward with a rolling motion", "Loop unfurls and fly lands"] }, tip: { ja: "木が多い日本の渓流では最もよく使うキャスト。ゆっくりとD型ループを作ることが鍵。", en: "Used constantly in Japan's tree-lined streams. Building a large D-loop is key." } },
  { id: 3, name: { ja: "テンカラキャスト", en: "Tenkara Cast" }, difficulty: "beginner", icon: "🎋", desc: { ja: "日本の伝統的なフライフィッシング。リールなし、固定ラインで渓流の魚を狙う洗練された技法。", en: "Japan's ancient fixed-line fly fishing. No reel — elegantly simple and devastatingly effective." }, steps: { ja: ["竿の長さ分のラインを展開", "手首のスナップでバックキャスト", "フォワードストロークを前方へ", "フライを上流へ着水させる", "竿でテンションをコントロールしながら流す"], en: ["Extend line to rod length", "Back cast with wrist snap", "Forward stroke toward target", "Land fly upstream of fish", "Control drift tension with rod tip"] }, tip: { ja: "テンカラは道具がシンプルな分、技術が全て。竿でフライに生命感を与えることが肝心。", en: "Tenkara's simplicity means technique is everything. Animate the fly with rod tip movement." } },
  { id: 4, name: { ja: "メンディング", en: "Mending" }, difficulty: "intermediate", icon: "〰️", desc: { ja: "ドラッグを防ぐためにラインを修正する技術。ドライフライ・ニンフィング両方で必須。", en: "Repositioning the fly line to prevent unnatural drag. Essential for both dry fly and nymphing." }, steps: { ja: ["キャスト後、ドラッグが掛かる前に", "ロッドを上流側に弧を描くように振る", "ラインを上流側にフリップ", "フライへのドラッグを最小化", "繰り返しメンディングしてドリフトを延長"], en: ["After casting, before drag sets in", "Sweep rod upstream in an arc", "Flip line upstream", "Minimize drag on the fly", "Repeat mends to extend drift"] }, tip: { ja: "アップストリームキャスト後は特に重要。美しいドラッグフリードリフトが魚を口を使わせる。", en: "Critical after upstream casts. A perfect drag-free drift is what triggers reluctant fish to eat." } },
  { id: 5, name: { ja: "リーチキャスト", en: "Reach Cast" }, difficulty: "intermediate", icon: "↗️", desc: { ja: "フライ着水前にラインを上流側に寄せる上級テクニック。長いドラッグフリードリフトを実現。", en: "Reach the rod upstream as the fly lands to instantly achieve a longer drag-free drift." }, steps: { ja: ["通常のフォワードキャストを開始", "ループが展開している間にロッドを上流へ伸ばす", "ラインが着水する前に位置を調整", "フライ着水と同時に理想的なラインポジション完成", "長いドラッグフリードリフトを楽しむ"], en: ["Begin forward cast normally", "While loop unfurls, reach rod upstream", "Adjust position before line lands", "Perfect line position at fly touchdown", "Enjoy long drag-free drift"] }, tip: { ja: "メンディングと組み合わせると最強。速い流れで対岸の魚を狙う時に特に有効。", en: "Combined with mending it's unstoppable. Especially useful targeting far-bank fish across fast water." } },
];

const TENKARA_RIVERS = [
  { name: "長良川（岐阜）", rating: 5.0, fish: { ja: "ヤマメ・アユ", en: "Yamame & Ayu" }, access: { ja: "高山本線・美濃太田駅", en: "Minoota Stn, Takayama Line" }, season: { ja: "3〜10月", en: "Mar–Oct" }, permit: { ja: "漁協遊漁券 ¥2,200/日", en: "¥2,200/day permit" } },
  { name: "奥多摩川（東京）", rating: 4.7, fish: { ja: "ヤマメ・ニジマス", en: "Yamame & Rainbow" }, access: { ja: "JR青梅線・奥多摩駅", en: "Okutama Stn, Ome Line" }, season: { ja: "3〜9月", en: "Mar–Sep" }, permit: { ja: "漁協遊漁券 ¥1,800/日", en: "¥1,800/day permit" } },
  { name: "神流川（群馬）", rating: 4.8, fish: { ja: "ヤマメ・イワナ", en: "Yamame & Iwana" }, access: { ja: "上信電鉄・下仁田駅よりバス", en: "Bus from Shimonita Stn" }, season: { ja: "3〜9月", en: "Mar–Sep" }, permit: { ja: "漁協遊漁券 ¥1,500/日", en: "¥1,500/day permit" } },
  { name: "四万十川（高知）", rating: 4.9, fish: { ja: "アユ・ヤマメ", en: "Ayu & Yamame" }, access: { ja: "土讃線・窪川駅よりバス", en: "Bus from Kubokawa Stn" }, season: { ja: "6〜10月（アユ）", en: "Jun–Oct (Ayu)" }, permit: { ja: "漁協遊漁券 ¥2,000/日", en: "¥2,000/day permit" } },
];

// ─── FISH SVG ILLUSTRATIONS ─────────────────────────────────────────────────
const FISH_SVG = {
  // Largemouth Bass - chunky greenish bass with open mouth
  1: ({ size = 80 }) => (
    <svg viewBox="0 0 120 80" width={size} height={size * 0.67} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="b1" cx="40%" cy="40%"><stop offset="0%" stopColor="#5a8a3c"/><stop offset="100%" stopColor="#2d5a1e"/></radialGradient>
        <radialGradient id="b2" cx="50%" cy="30%"><stop offset="0%" stopColor="#c8e6a0"/><stop offset="100%" stopColor="#8aba5a"/></radialGradient>
      </defs>
      {/* Body */}
      <ellipse cx="58" cy="42" rx="46" ry="26" fill="url(#b1)"/>
      {/* Belly */}
      <ellipse cx="55" cy="52" rx="38" ry="14" fill="url(#b2)" opacity="0.9"/>
      {/* Lateral stripe */}
      <path d="M18 42 Q58 36 100 40" stroke="#1a3a10" strokeWidth="3" fill="none" opacity="0.5"/>
      {/* Tail fin */}
      <path d="M102 28 L118 18 L118 66 L102 56 Z" fill="#2d5a1e" opacity="0.9"/>
      <path d="M104 42 L118 42" stroke="#1a3a10" strokeWidth="1.5" opacity="0.4"/>
      {/* Dorsal fin */}
      <path d="M40 18 L48 10 L60 8 L72 12 L80 18" stroke="#1a3a10" strokeWidth="2" fill="#3d7a28" opacity="0.85"/>
      {/* Pectoral fin */}
      <path d="M36 44 L24 52 L28 58 L40 50 Z" fill="#4a7a30" opacity="0.8"/>
      {/* Head / mouth area */}
      <ellipse cx="16" cy="42" rx="16" ry="18" fill="url(#b1)"/>
      {/* Open mouth */}
      <path d="M4 38 Q2 42 4 46 L18 44 L14 38 Z" fill="#1a1a1a"/>
      <path d="M4 38 L18 36 L18 38 Z" fill="#4a7a30"/>
      {/* Eye */}
      <circle cx="18" cy="35" r="5" fill="#cc3300"/>
      <circle cx="18" cy="35" r="3" fill="#111"/>
      <circle cx="19.5" cy="33.5" r="1.2" fill="white" opacity="0.9"/>
      {/* Scale texture */}
      {[30,42,54,66,80].map((x,i) => [35,45,55].map((y,j) => (
        <ellipse key={`s${i}${j}`} cx={x} cy={y} rx="5" ry="3.5" fill="none" stroke="#1a3a10" strokeWidth="0.6" opacity="0.25"/>
      )))}
      {/* Anal fin */}
      <path d="M55 66 L60 76 L72 72 L70 64 Z" fill="#3d7a28" opacity="0.7"/>
    </svg>
  ),
  // Ayu (Sweetfish) - slender silvery fish
  2: ({ size = 80 }) => (
    <svg viewBox="0 0 130 60" width={size} height={size * 0.46} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="a1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#b8d4e8"/><stop offset="50%" stopColor="#e8f4f8"/><stop offset="100%" stopColor="#d4b860"/></linearGradient>
        <linearGradient id="a2" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#7ab0c8"/><stop offset="100%" stopColor="#c8e0f0"/></linearGradient>
      </defs>
      {/* Body - slender */}
      <ellipse cx="62" cy="30" rx="52" ry="16" fill="url(#a1)"/>
      {/* Back darker */}
      <path d="M15 26 Q62 18 108 24 Q100 22 62 20 Q30 20 15 26" fill="#7aa8c0" opacity="0.6"/>
      {/* Yellow/gold belly stripe */}
      <path d="M20 34 Q62 40 106 34 Q90 38 62 38 Q35 38 20 34" fill="#d4b830" opacity="0.6"/>
      {/* Iridescent silver side */}
      <ellipse cx="62" cy="30" rx="40" ry="8" fill="white" opacity="0.3"/>
      {/* Tail fin - forked */}
      <path d="M110 22 L128 14 L124 30 Z" fill="#5a8aaa" opacity="0.9"/>
      <path d="M110 38 L128 46 L124 30 Z" fill="#5a8aaa" opacity="0.9"/>
      {/* Dorsal fin */}
      <path d="M45 16 L50 8 L62 6 L74 9 L80 16" stroke="#5a8aaa" strokeWidth="1.5" fill="#8ab8d0" opacity="0.8"/>
      {/* Adipose fin */}
      <ellipse cx="96" cy="20" rx="6" ry="3" fill="#d4b830" opacity="0.7"/>
      {/* Pectoral fin */}
      <path d="M28 28 L18 22 L16 30 L26 34 Z" fill="#8ab8d0" opacity="0.75"/>
      {/* Pelvic fin */}
      <path d="M50 40 L44 48 L52 46 Z" fill="#8ab8d0" opacity="0.7"/>
      {/* Anal fin */}
      <path d="M68 42 L72 50 L80 46 L76 40 Z" fill="#8ab8d0" opacity="0.7"/>
      {/* Head */}
      <ellipse cx="14" cy="30" rx="14" ry="12" fill="url(#a2)"/>
      {/* Mouth - small */}
      <path d="M2 32 Q1 30 2 28 L10 29 L10 31 Z" fill="#2a4a5a"/>
      {/* Eye */}
      <circle cx="14" cy="26" r="4.5" fill="#c8d8e8"/>
      <circle cx="14" cy="26" r="3" fill="#111"/>
      <circle cx="15" cy="25" r="1" fill="white" opacity="0.9"/>
      {/* Scales shimmer */}
      {[35,50,65,80,95].map((x,i) => (
        <ellipse key={i} cx={x} cy={30} rx="6" ry="4" fill="white" opacity="0.12" stroke="#aaccdd" strokeWidth="0.4"/>
      ))}
    </svg>
  ),
  // Yamame Trout - beautiful parr marks
  3: ({ size = 80 }) => (
    <svg viewBox="0 0 130 70" width={size} height={size * 0.54} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="y1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#7a6840"/><stop offset="40%" stopColor="#c8a870"/><stop offset="100%" stopColor="#e8d8b0"/></linearGradient>
        <radialGradient id="y2" cx="50%" cy="50%"><stop offset="0%" stopColor="#f0e8c0"/><stop offset="100%" stopColor="#d4b870"/></radialGradient>
      </defs>
      {/* Body */}
      <ellipse cx="62" cy="36" rx="52" ry="22" fill="url(#y1)"/>
      {/* Belly */}
      <ellipse cx="58" cy="46" rx="40" ry="12" fill="url(#y2)" opacity="0.9"/>
      {/* Back - darker olive */}
      <path d="M15 28 Q62 18 108 26" stroke="#5a4820" strokeWidth="8" fill="none" opacity="0.4"/>
      {/* Parr marks - oval dark spots along lateral line */}
      {[22,34,46,58,70,82,94].map((x,i) => (
        <ellipse key={`p${i}`} cx={x} cy={36} rx="5" ry="8" fill="#3a2a10" opacity="0.55"/>
      ))}
      {/* Red/pink spots */}
      {[28,44,60,76,90].map((x,i) => (
        <circle key={`r${i}`} cx={x} cy={40} r="2.5" fill="#cc4422" opacity="0.7"/>
      ))}
      {/* Black spots on back */}
      {[30,45,60,75,90].map((x,i) => (
        <circle key={`b${i}`} cx={x} cy={26} r="2" fill="#1a1a1a" opacity="0.5"/>
      ))}
      {/* Tail - slightly forked */}
      <path d="M112 24 L128 16 L126 36 Z" fill="#7a6840" opacity="0.9"/>
      <path d="M112 48 L128 56 L126 36 Z" fill="#7a6840" opacity="0.9"/>
      {/* Dorsal fin with spots */}
      <path d="M42 16 L46 7 L58 5 L70 8 L78 16" stroke="#5a4820" strokeWidth="1.5" fill="#a08850" opacity="0.85"/>
      <circle cx="52" cy="10" r="1.5" fill="#1a1a1a" opacity="0.5"/>
      <circle cx="64" cy="8" r="1.5" fill="#1a1a1a" opacity="0.5"/>
      {/* Adipose fin */}
      <ellipse cx="98" cy="22" rx="6" ry="3.5" fill="#8a7040" opacity="0.8"/>
      {/* Pectoral fin */}
      <path d="M28 34 L16 26 L14 36 L26 40 Z" fill="#b09060" opacity="0.8"/>
      {/* Anal fin */}
      <path d="M65 56 L68 66 L78 62 L76 54 Z" fill="#a08850" opacity="0.75"/>
      {/* Head */}
      <ellipse cx="14" cy="36" rx="15" ry="14" fill="#a08850"/>
      {/* Mouth */}
      <path d="M1 38 Q0 36 1 34 L12 35 L12 37 Z" fill="#2a1a08"/>
      {/* Eye */}
      <circle cx="15" cy="30" r="5" fill="#d4c080"/>
      <circle cx="15" cy="30" r="3.2" fill="#111"/>
      <circle cx="16.5" cy="28.5" r="1.3" fill="white" opacity="0.9"/>
    </svg>
  ),
  // Sea Bass / Seabass - sleek silver
  4: ({ size = 80 }) => (
    <svg viewBox="0 0 140 65" width={size} height={size * 0.46} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sb1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#6080a0"/><stop offset="40%" stopColor="#d0dce8"/><stop offset="100%" stopColor="#e8f0f8"/></linearGradient>
        <linearGradient id="sb2" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#8898b0"/><stop offset="100%" stopColor="#c0ccd8"/></linearGradient>
      </defs>
      {/* Body - sleek fusiform */}
      <ellipse cx="66" cy="32" rx="58" ry="19" fill="url(#sb1)"/>
      {/* Silver belly */}
      <ellipse cx="62" cy="42" rx="46" ry="10" fill="white" opacity="0.8"/>
      {/* Dark back */}
      <path d="M14 24 Q66 14 118 22" stroke="#3a4a60" strokeWidth="9" fill="none" opacity="0.45"/>
      {/* Lateral line */}
      <path d="M24 30 Q66 28 114 30" stroke="#5a6a80" strokeWidth="1.2" fill="none" opacity="0.6" strokeDasharray="3,2"/>
      {/* Tail - forked */}
      <path d="M122 20 L138 10 L136 32 Z" fill="#5a6a80" opacity="0.9"/>
      <path d="M122 44 L138 54 L136 32 Z" fill="#5a6a80" opacity="0.9"/>
      {/* First dorsal fin (spiny) */}
      <path d="M48 15 L52 6 L60 4 L68 6 L74 12 L72 15" stroke="#3a4a60" strokeWidth="1.2" fill="#7a8a9a" opacity="0.85"/>
      {/* Second dorsal fin (soft) */}
      <path d="M76 15 L78 9 L86 7 L94 10 L96 15" stroke="#3a4a60" strokeWidth="1" fill="#8a9aaa" opacity="0.8"/>
      {/* Anal fin */}
      <path d="M72 50 L74 58 L86 54 L84 48 Z" fill="#7a8a9a" opacity="0.75"/>
      {/* Pectoral fin - large */}
      <path d="M32 30 L20 22 L16 34 L28 42 Z" fill="#8898b0" opacity="0.8"/>
      {/* Head */}
      <ellipse cx="14" cy="32" rx="16" ry="17" fill="url(#sb2)"/>
      {/* Gill plate line */}
      <path d="M22 18 Q28 32 22 46" stroke="#3a4a60" strokeWidth="1.5" fill="none" opacity="0.5"/>
      {/* Mouth - slightly upturned */}
      <path d="M1 35 Q0 32 2 30 L14 31 L14 33 Z" fill="#1a2a3a"/>
      {/* Eye */}
      <circle cx="12" cy="26" r="5.5" fill="#c8d4e0"/>
      <circle cx="12" cy="26" r="3.5" fill="#0a0a1a"/>
      <circle cx="13.5" cy="24.5" r="1.4" fill="white" opacity="0.9"/>
      {/* Scale shimmer */}
      {[40,55,70,85,100].map((x,i) => (
        <ellipse key={i} cx={x} cy={32} rx="7" ry="5" fill="white" opacity="0.1" stroke="#8898b0" strokeWidth="0.5"/>
      ))}
    </svg>
  ),
  // Iwana (White-Spotted Char) - dark with white spots
  5: ({ size = 80 }) => (
    <svg viewBox="0 0 130 65" width={size} height={size * 0.5} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="iw1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#2a3a28"/><stop offset="50%" stopColor="#4a5a40"/><stop offset="100%" stopColor="#8a9a70"/></linearGradient>
      </defs>
      {/* Body */}
      <ellipse cx="62" cy="33" rx="52" ry="21" fill="url(#iw1)"/>
      {/* Belly - pale */}
      <ellipse cx="58" cy="44" rx="38" ry="11" fill="#c8d4a0" opacity="0.85"/>
      {/* White spots - distinctive iwana pattern */}
      {[20,32,44,56,68,80,92].map((x,i) => (
        <circle key={`w${i}`} cx={x} cy={30} r="4" fill="white" opacity="0.85"/>
      ))}
      {[26,38,50,62,74,86].map((x,i) => (
        <circle key={`w2${i}`} cx={x} cy={40} r="3" fill="white" opacity="0.7"/>
      ))}
      {/* Orange/red spots */}
      {[28,44,60,76,90].map((x,i) => (
        <circle key={`o${i}`} cx={x} cy={35} r="2.5" fill="#ff6620" opacity="0.75"/>
      ))}
      {/* Tail - square/slightly forked */}
      <path d="M112 22 L128 14 L126 33 Z" fill="#2a3a28" opacity="0.9"/>
      <path d="M112 44 L128 52 L126 33 Z" fill="#2a3a28" opacity="0.9"/>
      {/* Dorsal fin */}
      <path d="M42 14 L46 6 L58 4 L70 7 L78 14" stroke="#1a2a18" strokeWidth="1.5" fill="#3a4a30" opacity="0.9"/>
      {/* White spots on dorsal */}
      <circle cx="52" cy="8" r="2" fill="white" opacity="0.6"/>
      <circle cx="64" cy="6" r="2" fill="white" opacity="0.6"/>
      {/* Adipose fin */}
      <ellipse cx="98" cy="20" rx="7" ry="4" fill="#4a5a30" opacity="0.85"/>
      {/* Pectoral fin */}
      <path d="M28 32 L16 24 L14 34 L26 40 Z" fill="#4a5a40" opacity="0.8"/>
      {/* Head */}
      <ellipse cx="13" cy="33" rx="15" ry="14" fill="#3a4a30"/>
      {/* Large mouth */}
      <path d="M1 36 Q0 33 1 30 L14 32 L14 34 Z" fill="#1a0a08"/>
      {/* Eye */}
      <circle cx="14" cy="27" r="5.5" fill="#e8d080"/>
      <circle cx="14" cy="27" r="3.5" fill="#0a0808"/>
      <circle cx="15.5" cy="25.5" r="1.4" fill="white" opacity="0.9"/>
    </svg>
  ),
  // Red Sea Bream (Madai) - brilliant red/pink
  6: ({ size = 80 }) => (
    <svg viewBox="0 0 120 80" width={size} height={size * 0.67} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="m1" cx="40%" cy="40%"><stop offset="0%" stopColor="#ff7060"/><stop offset="100%" stopColor="#cc1820"/></radialGradient>
        <radialGradient id="m2" cx="50%" cy="60%"><stop offset="0%" stopColor="#ffb0a0"/><stop offset="100%" stopColor="#e84040"/></radialGradient>
      </defs>
      {/* Body - deep/tall bream shape */}
      <ellipse cx="58" cy="42" rx="44" ry="30" fill="url(#m1)"/>
      {/* Belly lighter */}
      <ellipse cx="55" cy="56" rx="34" ry="14" fill="url(#m2)" opacity="0.9"/>
      {/* Blue iridescent stripe/scale shimmer */}
      <path d="M20 34 Q58 28 96 32" stroke="#6090e0" strokeWidth="2" fill="none" opacity="0.5"/>
      {/* Scale lines */}
      {[28,42,56,70,84].map((x,i) => [35,45,55].map((y,j) => (
        <ellipse key={`s${i}${j}`} cx={x} cy={y} rx="5.5" ry="4" fill="none" stroke="#aa1010" strokeWidth="0.7" opacity="0.3"/>
      )))}
      {/* Blue spot above lateral line - distinctive madai mark */}
      {[30,45,60,75,90].map((x,i) => (
        <circle key={i} cx={x} cy={32} r="2" fill="#4080e0" opacity="0.6"/>
      ))}
      {/* Tail */}
      <path d="M100 25 L118 16 L118 68 L100 59 Z" fill="#cc1820" opacity="0.9"/>
      <path d="M102 42 L118 42" stroke="#aa1010" strokeWidth="1.5" opacity="0.4"/>
      {/* Long dorsal fin (spiny) */}
      <path d="M36 14 L40 6 L52 4 L64 5 L76 8 L82 14" stroke="#aa1010" strokeWidth="1.8" fill="#e03030" opacity="0.9"/>
      {/* Soft dorsal */}
      <path d="M82 14 L84 10 L92 12 L96 16" stroke="#aa1010" strokeWidth="1.2" fill="#e03030" opacity="0.8"/>
      {/* Anal fin */}
      <path d="M54 70 L56 78 L68 74 L66 68 Z" fill="#e03030" opacity="0.8"/>
      {/* Pectoral fin */}
      <path d="M32 42 L18 34 L16 46 L30 52 Z" fill="#e05050" opacity="0.8"/>
      {/* Head */}
      <ellipse cx="17" cy="43" rx="17" ry="22" fill="url(#m1)"/>
      {/* Distinctive bump on head (madai feature) */}
      <ellipse cx="14" cy="28" rx="8" ry="5" fill="#dd2828" opacity="0.8"/>
      {/* Mouth */}
      <path d="M2 46 Q1 43 2 40 L16 41 L16 44 Z" fill="#4a0808"/>
      {/* Eye - large */}
      <circle cx="18" cy="34" r="7" fill="#f0d040"/>
      <circle cx="18" cy="34" r="4.5" fill="#0a0a08"/>
      <circle cx="20" cy="32" r="1.8" fill="white" opacity="0.9"/>
    </svg>
  ),
  // Horse Mackerel (Aji) - slim silver with scutes
  7: ({ size = 80 }) => (
    <svg viewBox="0 0 130 55" width={size} height={size * 0.42} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="aj1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#5070a0"/><stop offset="40%" stopColor="#c0d0e0"/><stop offset="100%" stopColor="#e0e8f0"/></linearGradient>
      </defs>
      {/* Body - slim */}
      <ellipse cx="60" cy="27" rx="50" ry="15" fill="url(#aj1)"/>
      {/* Belly */}
      <ellipse cx="56" cy="36" rx="40" ry="8" fill="white" opacity="0.85"/>
      {/* Dark back */}
      <path d="M14 20 Q60 12 106 18" stroke="#304060" strokeWidth="7" fill="none" opacity="0.4"/>
      {/* Scutes (bony ridge along lateral line) */}
      {[60,68,76,84,92,100,108].map((x,i) => (
        <path key={i} d={`M${x} 23 L${x+4} 20 L${x+4} 30 L${x} 27`} fill="#8090a8" opacity="0.7"/>
      ))}
      {/* Yellow tail spot */}
      <ellipse cx="106" cy="27" rx="5" ry="3" fill="#f0c020" opacity="0.7"/>
      {/* Tail - deeply forked */}
      <path d="M112 20 L130 12 L128 27 Z" fill="#4060a0" opacity="0.9"/>
      <path d="M112 34 L130 42 L128 27 Z" fill="#4060a0" opacity="0.9"/>
      {/* First dorsal */}
      <path d="M40 13 L44 5 L54 3 L62 5 L66 10 L64 13" stroke="#304060" strokeWidth="1.2" fill="#6080a8" opacity="0.85"/>
      {/* Second dorsal */}
      <path d="M66 13 L68 8 L76 6 L84 9 L86 13" fill="#6080a8" opacity="0.8"/>
      {/* Anal fin */}
      <path d="M66 42 L68 50 L78 46 L76 40 Z" fill="#6080a8" opacity="0.75"/>
      {/* Pectoral fin */}
      <path d="M26 24 L14 18 L12 28 L24 32 Z" fill="#7890b0" opacity="0.8"/>
      {/* Head */}
      <ellipse cx="13" cy="27" rx="14" ry="13" fill="#8090b0"/>
      {/* Mouth - small, slightly downturned */}
      <path d="M1 29 Q0 27 1 25 L10 26 L10 28 Z" fill="#203040"/>
      {/* Eye */}
      <circle cx="13" cy="22" r="5" fill="#d0dce8"/>
      <circle cx="13" cy="22" r="3.2" fill="#0a0a10"/>
      <circle cx="14.5" cy="20.5" r="1.2" fill="white" opacity="0.9"/>
    </svg>
  ),
  // Olive Flounder (Hirame) - flat fish from above/side
  8: ({ size = 80 }) => (
    <svg viewBox="0 0 130 80" width={size} height={size * 0.62} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="h1" cx="50%" cy="40%"><stop offset="0%" stopColor="#8a7850"/><stop offset="100%" stopColor="#4a3a20"/></radialGradient>
        <radialGradient id="h2" cx="50%" cy="50%"><stop offset="0%" stopColor="#c0aa70"/><stop offset="100%" stopColor="#7a6030"/></radialGradient>
      </defs>
      {/* Flat body - wider oval */}
      <ellipse cx="58" cy="40" rx="52" ry="30" fill="url(#h1)"/>
      {/* Camouflage spots */}
      {[25,40,55,70,85].map((x,i) => [30,45,55].map((y,j) => (
        <ellipse key={`s${i}${j}`} cx={x + j*3} cy={y} rx="7" ry="5" fill="#3a2a10" opacity={0.2 + (i+j)*0.04}/>
      )))}
      {/* White underside edge visible */}
      <path d="M12 62 Q58 72 104 60" stroke="#e8e0c8" strokeWidth="6" fill="none" opacity="0.6"/>
      {/* Dorsal fin - runs along top edge */}
      <path d="M16 28 Q58 14 100 24" stroke="#6a5030" strokeWidth="3" fill="none" opacity="0.7"/>
      {[22,34,46,58,70,82,94].map((x,i) => {
        const y = 22 - Math.sin(i * 0.6) * 4;
        return <line key={i} x1={x} y1={y} x2={x-2} y2={y-6} stroke="#6a5030" strokeWidth="1.2" opacity="0.6"/>;
      })}
      {/* Anal fin - runs along bottom */}
      <path d="M20 56 Q58 66 98 56" stroke="#6a5030" strokeWidth="2.5" fill="none" opacity="0.6"/>
      {/* Tail */}
      <path d="M108 28 L126 22 L126 58 L108 52 Z" fill="#5a4020" opacity="0.85"/>
      {/* Pectoral fin - prominent */}
      <path d="M26 36 L10 28 L8 44 L24 48 Z" fill="#7a6040" opacity="0.8"/>
      {/* Head - with both eyes on top (left-eyed) */}
      <ellipse cx="12" cy="40" rx="14" ry="16" fill="url(#h2)"/>
      {/* Both eyes on same side */}
      <circle cx="10" cy="28" r="5.5" fill="#d0c080"/>
      <circle cx="10" cy="28" r="3.5" fill="#0a0808"/>
      <circle cx="11.5" cy="26.5" r="1.4" fill="white" opacity="0.9"/>
      <circle cx="16" cy="22" r="4.5" fill="#d0c080"/>
      <circle cx="16" cy="22" r="3" fill="#0a0808"/>
      <circle cx="17" cy="21" r="1.1" fill="white" opacity="0.9"/>
      {/* Mouth - large, angled */}
      <path d="M1 46 Q0 42 2 38 L16 40 L16 44 Z" fill="#2a1808"/>
    </svg>
  ),
  // Bluegill-like Bream (Herabuna / Crucian Carp)
  9: ({ size = 80 }) => (
    <svg viewBox="0 0 110 90" width={size} height={size * 0.82} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cr1" cx="40%" cy="40%"><stop offset="0%" stopColor="#c8a030"/><stop offset="100%" stopColor="#7a5010"/></radialGradient>
        <radialGradient id="cr2" cx="50%" cy="70%"><stop offset="0%" stopColor="#f0e080"/><stop offset="100%" stopColor="#c8a040"/></radialGradient>
      </defs>
      <ellipse cx="54" cy="46" rx="40" ry="34" fill="url(#cr1)"/>
      <ellipse cx="50" cy="60" rx="30" ry="16" fill="url(#cr2)" opacity="0.9"/>
      {[30,44,58,72].map((x,i) => [38,50,62].map((y,j) => (
        <ellipse key={`s${i}${j}`} cx={x} cy={y} rx="6" ry="4.5" fill="none" stroke="#5a3a08" strokeWidth="0.8" opacity="0.3"/>
      )))}
      <path d="M92 20 L108 10 L108 82 L92 72 Z" fill="#7a5010" opacity="0.9"/>
      <path d="M34 14 L38 5 L50 3 L62 6 L70 14" stroke="#5a3a08" strokeWidth="2" fill="#9a6818" opacity="0.9"/>
      <path d="M46 78 L50 88 L62 84 L60 76 Z" fill="#9a6818" opacity="0.8"/>
      <path d="M26 46 L14 36 L12 54 L24 58 Z" fill="#9a6818" opacity="0.8"/>
      <ellipse cx="15" cy="47" rx="15" ry="20" fill="url(#cr1)"/>
      <path d="M2 50 Q1 47 2 44 L14 45 L14 49 Z" fill="#3a1a04"/>
      <circle cx="16" cy="36" r="6" fill="#e8c840"/>
      <circle cx="16" cy="36" r="4" fill="#0a0808"/>
      <circle cx="18" cy="34" r="1.5" fill="white" opacity="0.9"/>
    </svg>
  ),
  // Carp (Koi/Nishikigoi) - large golden
  10: ({ size = 80 }) => (
    <svg viewBox="0 0 140 70" width={size} height={size * 0.5} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ka1" cx="40%" cy="35%"><stop offset="0%" stopColor="#e8a020"/><stop offset="100%" stopColor="#9a5008"/></radialGradient>
        <linearGradient id="ka2" x1="0%" y1="100%" x2="0%" y2="0%"><stop offset="0%" stopColor="#f0d060"/><stop offset="100%" stopColor="#c87820"/></linearGradient>
      </defs>
      <ellipse cx="66" cy="35" rx="56" ry="24" fill="url(#ka1)"/>
      <ellipse cx="60" cy="46" rx="44" ry="13" fill="url(#ka2)" opacity="0.85"/>
      {[30,46,62,78,94].map((x,i) => [28,40,50].map((y,j) => (
        <ellipse key={`s${i}${j}`} cx={x} cy={y} rx="7" ry="5" fill="none" stroke="#7a4008" strokeWidth="0.9" opacity="0.3"/>
      )))}
      <path d="M32 25 Q66 14 118 24" stroke="#7a4008" strokeWidth="3" fill="none" opacity="0.4"/>
      <path d="M120 18 L138 8 L138 62 L120 52 Z" fill="#9a5008" opacity="0.9"/>
      <path d="M44 12 L48 4 L62 2 L76 5 L84 12" stroke="#7a4008" strokeWidth="2" fill="#c07818" opacity="0.9"/>
      <path d="M58 57 L62 67 L74 63 L72 55 Z" fill="#c07818" opacity="0.8"/>
      <path d="M32 36 L16 26 L14 44 L30 48 Z" fill="#c07818" opacity="0.8"/>
      <ellipse cx="14" cy="36" rx="16" ry="20" fill="url(#ka1)"/>
      {/* Barbels */}
      <path d="M2 40 Q-2 46 0 50" stroke="#9a5008" strokeWidth="1.5" fill="none"/>
      <path d="M4 42 Q0 50 2 54" stroke="#9a5008" strokeWidth="1.5" fill="none"/>
      <path d="M2 36 Q0 30 4 28 L14 34 L14 38 Z" fill="#3a1808"/>
      <circle cx="15" cy="26" r="6.5" fill="#e8c030"/>
      <circle cx="15" cy="26" r="4.2" fill="#0a0808"/>
      <circle cx="17" cy="24" r="1.7" fill="white" opacity="0.9"/>
    </svg>
  ),
  // Rainbow Trout (Nijimasу) - vibrant pink stripe
  11: ({ size = 80 }) => (
    <svg viewBox="0 0 135 65" width={size} height={size * 0.48} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rbt1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#4a7a5a"/><stop offset="50%" stopColor="#c0d8c0"/><stop offset="100%" stopColor="#e8f0e0"/></linearGradient>
      </defs>
      <ellipse cx="62" cy="32" rx="54" ry="20" fill="url(#rbt1)"/>
      <ellipse cx="58" cy="42" rx="44" ry="11" fill="white" opacity="0.8"/>
      {/* Pink lateral stripe */}
      <path d="M16 30 Q62 26 108 30" stroke="#e060a0" strokeWidth="6" fill="none" opacity="0.7"/>
      <path d="M16 30 Q62 26 108 30" stroke="#ff90c0" strokeWidth="3" fill="none" opacity="0.5"/>
      {/* Black spots */}
      {[22,32,42,52,62,72,82,92,100].map((x,i) => (
        <circle key={i} cx={x} cy={26 + (i%2)*8} r="2.2" fill="#1a2a1a" opacity="0.55"/>
      ))}
      {[28,40,54,68,82,94].map((x,i) => (
        <circle key={`d${i}`} cx={x} cy={20} r="1.8" fill="#1a2a1a" opacity="0.45"/>
      ))}
      <path d="M114 20 L132 12 L130 32 Z" fill="#4a7a5a" opacity="0.9"/>
      <path d="M114 44 L132 52 L130 32 Z" fill="#4a7a5a" opacity="0.9"/>
      <path d="M40 14 L44 5 L56 3 L68 6 L76 14" stroke="#2a5a3a" strokeWidth="1.5" fill="#6a9a7a" opacity="0.9"/>
      <ellipse cx="100" cy="18" rx="7" ry="3.5" fill="#6a9a6a" opacity="0.8"/>
      <path d="M26 30 L14 22 L12 32 L24 38 Z" fill="#6a9a7a" opacity="0.8"/>
      <path d="M66 52 L70 62 L80 58 L78 50 Z" fill="#6a9a7a" opacity="0.75"/>
      <ellipse cx="14" cy="32" rx="15" ry="14" fill="#5a8a6a"/>
      <path d="M1 34 Q0 32 1 30 L12 31 L12 33 Z" fill="#1a2a1a"/>
      <circle cx="14" cy="26" r="5.5" fill="#d0e0c0"/>
      <circle cx="14" cy="26" r="3.5" fill="#0a100a"/>
      <circle cx="15.5" cy="24.5" r="1.4" fill="white" opacity="0.9"/>
    </svg>
  ),
  // Squid (Ika) - for eging
  12: ({ size = 80 }) => (
    <svg viewBox="0 0 80 120" width={size * 0.67} height={size} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ika1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#c0b0e0"/><stop offset="50%" stopColor="#e8e0f8"/><stop offset="100%" stopColor="#c0b0e0"/></linearGradient>
      </defs>
      {/* Mantle */}
      <path d="M20 30 Q10 50 12 80 Q20 95 40 98 Q60 95 68 80 Q70 50 60 30 Z" fill="url(#ika1)"/>
      {/* Fins */}
      <path d="M20 55 L4 45 L8 70 L20 68 Z" fill="#b0a0d8" opacity="0.85"/>
      <path d="M60 55 L76 45 L72 70 L60 68 Z" fill="#b0a0d8" opacity="0.85"/>
      {/* Iridescent spots */}
      {[28,40,52].map((x,i) => [42,56,70].map((y,j) => (
        <ellipse key={`p${i}${j}`} cx={x} cy={y} rx="3" ry="2" fill="#8070c0" opacity="0.3"/>
      )))}
      {/* Mantle tip */}
      <path d="M20 30 Q40 10 60 30 Q50 18 40 16 Q30 18 20 30 Z" fill="#9080c0" opacity="0.7"/>
      {/* Head */}
      <ellipse cx="40" cy="105" rx="18" ry="14" fill="url(#ika1)"/>
      {/* Eyes */}
      <circle cx="32" cy="103" r="5" fill="#2a1a40"/>
      <circle cx="32" cy="103" r="3" fill="#0a0818"/>
      <circle cx="33.5" cy="101.5" r="1.2" fill="white" opacity="0.9"/>
      <circle cx="48" cy="103" r="5" fill="#2a1a40"/>
      <circle cx="48" cy="103" r="3" fill="#0a0818"/>
      <circle cx="49.5" cy="101.5" r="1.2" fill="white" opacity="0.9"/>
      {/* Tentacles */}
      {[28,32,36,40,44,48,52].map((x,i) => (
        <path key={i} d={`M${x} 116 Q${x + Math.sin(i)*4} ${122 + i*1.5} ${x + Math.sin(i)*2} ${118 + i}`} stroke="#9080c0" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      ))}
      {/* Long tentacles */}
      <path d="M34 116 Q30 128 28 138" stroke="#8070c0" strokeWidth="3" fill="none"/>
      <path d="M46 116 Q50 128 52 138" stroke="#8070c0" strokeWidth="3" fill="none"/>
    </svg>
  ),
  // Amberjack (Kanpachi/Buri) - powerful pelagic
  13: ({ size = 80 }) => (
    <svg viewBox="0 0 145 65" width={size} height={size * 0.45} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="buri1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#3a5070"/><stop offset="40%" stopColor="#90a8c0"/><stop offset="100%" stopColor="#e0e8d0"/></linearGradient>
      </defs>
      <ellipse cx="68" cy="32" rx="60" ry="20" fill="url(#buri1)"/>
      <ellipse cx="62" cy="42" rx="50" ry="11" fill="#e8ecd8" opacity="0.9"/>
      {/* Yellow lateral stripe */}
      <path d="M14 30 Q68 26 124 30" stroke="#d4c020" strokeWidth="5" fill="none" opacity="0.8"/>
      <path d="M128 18 L144 8 L142 32 Z" fill="#3a5070" opacity="0.9"/>
      <path d="M128 46 L144 56 L142 32 Z" fill="#3a5070" opacity="0.9"/>
      <path d="M50 13 L54 5 L66 3 L78 6 L86 13" stroke="#2a3a50" strokeWidth="2" fill="#5a7090" opacity="0.9"/>
      <path d="M86 13 L88 8 L98 6 L108 9 L110 13" stroke="#2a3a50" strokeWidth="1.5" fill="#6a8098" opacity="0.85"/>
      <path d="M18 36 L6 26 L4 42 L16 46 Z" fill="#5a7090" opacity="0.8"/>
      <path d="M78 52 L80 60 L92 56 L90 50 Z" fill="#5a7090" opacity="0.75"/>
      <ellipse cx="14" cy="32" rx="16" ry="18" fill="#5a7090"/>
      {/* Black diagonal stripe on head */}
      <path d="M6 20 Q18 28 16 40" stroke="#1a2030" strokeWidth="4" fill="none" opacity="0.6"/>
      <path d="M2 34 Q1 32 2 30 L14 31 L14 33 Z" fill="#1a2030"/>
      <circle cx="13" cy="24" r="6" fill="#d0c8a0"/>
      <circle cx="13" cy="24" r="3.8" fill="#0a0a08"/>
      <circle cx="14.5" cy="22.5" r="1.5" fill="white" opacity="0.9"/>
    </svg>
  ),
  // Snapper (Kurodai/Black Bream)
  14: ({ size = 80 }) => (
    <svg viewBox="0 0 115 85" width={size} height={size * 0.74} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="kd1" cx="40%" cy="35%"><stop offset="0%" stopColor="#6a6a6a"/><stop offset="100%" stopColor="#2a2a2a"/></radialGradient>
        <radialGradient id="kd2" cx="50%" cy="70%"><stop offset="0%" stopColor="#a0a0a0"/><stop offset="100%" stopColor="#585858"/></radialGradient>
      </defs>
      <ellipse cx="56" cy="44" rx="42" ry="32" fill="url(#kd1)"/>
      <ellipse cx="52" cy="58" rx="32" ry="16" fill="url(#kd2)" opacity="0.9"/>
      {/* Silver scale shimmer */}
      {[28,42,56,70,82].map((x,i) => [36,48,60].map((y,j) => (
        <ellipse key={`s${i}${j}`} cx={x} cy={y} rx="5.5" ry="4" fill="none" stroke="#888" strokeWidth="0.7" opacity="0.25"/>
      )))}
      <path d="M96 24 L112 14 L112 74 L96 64 Z" fill="#2a2a2a" opacity="0.9"/>
      <path d="M34 14 L38 5 L50 3 L62 5 L72 12 L70 14" stroke="#1a1a1a" strokeWidth="2" fill="#4a4a4a" opacity="0.9"/>
      <path d="M50 74 L52 84 L64 80 L62 72 Z" fill="#4a4a4a" opacity="0.8"/>
      <path d="M28 44 L14 34 L12 52 L26 56 Z" fill="#4a4a4a" opacity="0.8"/>
      <ellipse cx="14" cy="44" rx="15" ry="20" fill="url(#kd1)"/>
      <path d="M0 48 Q-1 44 0 40 L14 42 L14 46 Z" fill="#1a1a1a"/>
      <circle cx="16" cy="34" r="6.5" fill="#c0c0a0"/>
      <circle cx="16" cy="34" r="4.2" fill="#080808"/>
      <circle cx="17.5" cy="32.5" r="1.6" fill="white" opacity="0.9"/>
    </svg>
  ),
  // Yellowtail Kingfish (Hamachi young) 
  15: ({ size = 80 }) => (
    <svg viewBox="0 0 138 58" width={size} height={size * 0.42} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hm1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#284868"/><stop offset="45%" stopColor="#a8c0d8"/><stop offset="100%" stopColor="#f0f0e0"/></linearGradient>
      </defs>
      <ellipse cx="64" cy="29" rx="56" ry="18" fill="url(#hm1)"/>
      <ellipse cx="58" cy="40" rx="46" ry="10" fill="#f0eee0" opacity="0.9"/>
      <path d="M10 25 Q64 18 118 24" stroke="#f8c800" strokeWidth="5" fill="none" opacity="0.85"/>
      {/* Yellow fins */}
      <path d="M120 18 L136 10 L134 29 Z" fill="#f0c000" opacity="0.95"/>
      <path d="M120 40 L136 48 L134 29 Z" fill="#f0c000" opacity="0.95"/>
      <path d="M46 12 L50 4 L62 2 L74 5 L80 12" stroke="#203848" strokeWidth="1.8" fill="#507090" opacity="0.9"/>
      <path d="M80 12 L82 7 L92 5 L102 8 L104 12" stroke="#203848" strokeWidth="1.2" fill="#607888" opacity="0.85"/>
      <path d="M16 30 L4 22 L2 38 L14 44 Z" fill="#5a8090" opacity="0.8"/>
      <path d="M72 48 L74 56 L86 52 L84 46 Z" fill="#f0c000" opacity="0.75"/>
      <ellipse cx="12" cy="29" rx="14" ry="16" fill="#385870"/>
      <path d="M6 22 Q16 28 14 38" stroke="#203848" strokeWidth="3.5" fill="none" opacity="0.5"/>
      <path d="M0 31 Q-1 29 0 27 L12 28 L12 30 Z" fill="#1a2830"/>
      <circle cx="12" cy="22" r="5.5" fill="#c8d0a0"/>
      <circle cx="12" cy="22" r="3.5" fill="#080808"/>
      <circle cx="13.5" cy="20.5" r="1.4" fill="white" opacity="0.9"/>
    </svg>
  ),
  // Rockfish/Mebaru more detailed
  16: ({ size = 80 }) => (
    <svg viewBox="0 0 115 80" width={size} height={size * 0.7} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="mb1" cx="40%" cy="35%"><stop offset="0%" stopColor="#8a6040"/><stop offset="100%" stopColor="#4a2818"/></radialGradient>
        <radialGradient id="mb2" cx="50%" cy="65%"><stop offset="0%" stopColor="#c09060"/><stop offset="100%" stopColor="#7a4828"/></radialGradient>
      </defs>
      <ellipse cx="54" cy="42" rx="42" ry="28" fill="url(#mb1)"/>
      <ellipse cx="50" cy="54" rx="32" ry="14" fill="url(#mb2)" opacity="0.9"/>
      {/* Banding pattern */}
      {[30,46,62,76].map((x,i) => (
        <path key={i} d={`M${x} 20 Q${x+4} 42 ${x} 64`} stroke="#2a1408" strokeWidth="5" fill="none" opacity="0.25"/>
      ))}
      <path d="M94 24 L110 14 L110 70 L94 60 Z" fill="#4a2818" opacity="0.9"/>
      {/* Spiny dorsal */}
      <path d="M28 16 L34 8 L46 5 L58 7 L68 12 L74 18 L72 20" stroke="#2a1408" strokeWidth="1.5" fill="#6a3820" opacity="0.9"/>
      {[32,40,48,56,64,70].map((x,i) => (
        <line key={i} x1={x} y1={16-i} x2={x+1} y2={10-i} stroke="#2a1408" strokeWidth="1.5" opacity="0.7"/>
      ))}
      <path d="M72 20 L74 14 L82 12 L90 16 L92 22" stroke="#2a1408" strokeWidth="1" fill="#7a4828" opacity="0.85"/>
      <path d="M46 68 L48 78 L60 74 L58 66 Z" fill="#6a3820" opacity="0.8"/>
      <path d="M26 44 L12 34 L10 52 L24 56 Z" fill="#6a3820" opacity="0.8"/>
      <ellipse cx="13" cy="43" rx="15" ry="20" fill="url(#mb1)"/>
      <path d="M0 47 Q-1 43 0 39 L14 41 L14 45 Z" fill="#2a1008"/>
      <circle cx="15" cy="32" r="6.5" fill="#e0c060"/>
      <circle cx="15" cy="32" r="4.2" fill="#080808"/>
      <circle cx="16.5" cy="30.5" r="1.6" fill="white" opacity="0.9"/>
    </svg>
  ),
};

// ─── AD SYSTEM ────────────────────────────────────────────────────────────────
const AD_CAMPAIGNS = [
  { id: 1, brand: "シマノ", brandEn: "Shimano", tagline: { ja: "世界最高のリールを体験せよ", en: "Experience the world's finest reels" }, cta: { ja: "今すぐ購入", en: "Shop Now" }, bg: "#1a2a3a", accent: "#e8a020", logo: "⚙️", type: "tackle" },
  { id: 2, brand: "ダイワ", brandEn: "Daiwa", tagline: { ja: "次世代フィッシングロッド 2024", en: "Next-Gen Fishing Rods 2024" }, cta: { ja: "詳細を見る", en: "Learn More" }, bg: "#1a1a2a", accent: "#4488ff", logo: "🎣", type: "tackle" },
  { id: 3, brand: "がまかつ", brandEn: "Gamakatsu", tagline: { ja: "針は命。最高品質のフック", en: "The sharpest hooks. Period." }, cta: { ja: "商品を見る", en: "View Range" }, bg: "#2a1a1a", accent: "#cc2200", logo: "🪝", type: "tackle" },
  { id: 4, brand: "マルキュー", brandEn: "Marukyu", tagline: { ja: "釣れる！爆発エサ新発売", en: "New: Explosive Bait Formula" }, cta: { ja: "試してみる", en: "Try It" }, bg: "#1a2a1a", accent: "#44aa44", logo: "🎯", type: "bait" },
  { id: 5, brand: "つり人社", brandEn: "Tsuribito-sha", tagline: { ja: "月刊つり人 最新号 好評発売中", en: "Monthly Fishing Magazine — Out Now" }, cta: { ja: "購読する", en: "Subscribe" }, bg: "#2a2218", accent: "#d4a830", logo: "📖", type: "media" },
  { id: 6, brand: "PRO釣りナビ", brandEn: "PRO CastWise", tagline: { ja: "広告なしでアプリを楽しもう！月額￥480", en: "Go ad-free for ¥480/month" }, cta: { ja: "アップグレード", en: "Upgrade" }, bg: "#1a0a2a", accent: "#9060e0", logo: "👑", type: "premium" },
];

function BannerAd({ lang, onDismiss }) {
  const [ad] = useState(() => AD_CAMPAIGNS[Math.floor(Math.random() * AD_CAMPAIGNS.length)]);
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div style={{ position: "relative", margin: "10px 0", borderRadius: 12, overflow: "hidden", background: ad.bg, border: `1px solid ${ad.accent}44`, animation: "fadeUp 0.3s ease" }}>
      <div style={{ position: "absolute", top: 4, right: 4, zIndex: 2 }}>
        <button onClick={() => { setVisible(false); onDismiss?.(); }} style={{ background: "#d4cfc4", border: "none", borderRadius: 6, padding: "2px 7px", color: "#5a5a4a", cursor: "pointer", fontSize: "0.95rem" }}>✕</button>
      </div>
      <div style={{ padding: "10px 12px", display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ fontSize: "1.6rem", flexShrink: 0 }}>{ad.logo}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
            <span style={{ fontSize: "0.95rem", color: "#5a5a4a", background: "#fffdf8", borderRadius: 4, padding: "1px 5px" }}>{lang === "ja" ? "広告" : "AD"}</span>
            <span style={{ fontWeight: 700, fontSize: "0.92rem", color: ad.accent }}>{lang === "ja" ? ad.brand : ad.brandEn}</span>
          </div>
          <div style={{ fontSize: "1rem", color: "#3a3a2a", lineHeight: 1.3 }}>{ad.tagline[lang]}</div>
        </div>
        <button style={{ flexShrink: 0, background: ad.accent, border: "none", borderRadius: 8, padding: "6px 10px", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: "0.95rem", fontWeight: 700 }}>{ad.cta[lang]}</button>
      </div>
    </div>
  );
}

function InterstitialAd({ lang, onClose, onWatchReward }) {
  const [countdown, setCountdown] = useState(5);
  const [ad] = useState(() => AD_CAMPAIGNS[Math.floor(Math.random() * AD_CAMPAIGNS.length)]);
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 390, background: ad.bg, border: `2px solid ${ad.accent}66`, borderRadius: 24, overflow: "hidden", animation: "fadeUp 0.4s ease" }}>
        {/* Ad badge */}
        <div style={{ background: "#f8f4ec", padding: "8px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.95rem", color: "#5a5a4a" }}>{lang === "ja" ? "スポンサー広告" : "Sponsored"}</span>
          <span style={{ fontSize: "0.95rem", color: "#5a5a4a" }}>{lang === "ja" ? `${countdown > 0 ? countdown + "秒後にスキップ" : "スキップ可能"}` : `${countdown > 0 ? `Skip in ${countdown}s` : "Ready to skip"}`}</span>
        </div>
        {/* Big visual */}
        <div style={{ height: 180, background: `linear-gradient(135deg, ${ad.bg}, ${ad.accent}22)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 20 }}>
          <div style={{ fontSize: "4rem", animation: "float 2s ease-in-out infinite" }}>{ad.logo}</div>
          <div style={{ fontWeight: 700, fontSize: "1.4rem", color: ad.accent, textAlign: "center" }}>{lang === "ja" ? ad.brand : ad.brandEn}</div>
          <div style={{ fontSize: "1.05rem", color: "#3a3a2a", textAlign: "center", lineHeight: 1.5 }}>{ad.tagline[lang]}</div>
        </div>
        {/* Actions */}
        <div style={{ padding: 16, display: "flex", gap: 10 }}>
          <button style={{ flex: 2, padding: "12px", background: ad.accent, border: "none", borderRadius: 12, color: "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: "1.05rem", fontWeight: 700 }}>{ad.cta[lang]}</button>
          <button onClick={countdown <= 0 ? onClose : undefined} style={{ flex: 1, padding: "12px", background: countdown <= 0 ? "#d4cfc4" : "#fffdf8", border: "2px solid #d4cfc4", borderRadius: 12, color: countdown <= 0 ? "#e8e0d0" : "#4a5a6a", cursor: countdown <= 0 ? "pointer" : "not-allowed", fontFamily: "inherit", fontSize: "1.05rem" }}>
            {countdown > 0 ? `${countdown}s` : (lang === "ja" ? "スキップ" : "Skip")}
          </button>
        </div>
        {/* Rewarded option */}
        {onWatchReward && (
          <div style={{ padding: "0 16px 16px" }}>
            <button onClick={onWatchReward} style={{ width: "100%", padding: "10px", background: "#d0ead8", border: "2px solid #80c098", borderRadius: 12, color: "#2d7a3a", cursor: "pointer", fontFamily: "inherit", fontSize: "1.05rem", fontWeight: 600 }}>
              🎁 {lang === "ja" ? "動画を見て+50ポイントをゲット！" : "Watch full ad for +50 bonus points!"}
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
            <div style={{ background: "#e8f4ec", border: "2px solid #a0d0b0", borderRadius: 14, padding: 14, marginBottom: 16 }}>
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
              <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#74c69d,#48cae4)", borderRadius: 99, transition: "width 0.3s" }} />
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

function FishIllustration({ fishId, size = 80, style = {} }) {
  const Component = FISH_SVG[fishId];
  if (!Component) return <span style={{ fontSize: size * 0.5 }}>🐟</span>;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", position: "relative", ...style }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          <filter id="watercolor" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" seed="2" result="noise"/>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" result="displaced"/>
            <feGaussianBlur in="displaced" stdDeviation="0.6" result="blur"/>
            <feComponentTransfer in="blur" result="soft">
              <feFuncA type="linear" slope="0.92"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="soft"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
      <div style={{ filter: "url(#watercolor)", animation: "watercolor 8s ease-in-out infinite" }}>
        <Component size={size} />
      </div>
    </div>
  );
}

// ─── FISH DATA ───────────────────────────────────────────────────────────────
const FISH_DATA = [
  { id: 1, name: "ブラックバス", nameEn: "Largemouth Bass", emoji: "🐟", color: "#2d6a4f", accent: "#74c69d", difficulty: "beginner", flyFriendly: false, season: { ja: "春〜秋", en: "Spring–Fall" }, habitat: { ja: "湖、池、水草周り", en: "Lakes, ponds, weedy rivers" }, bestTime: { ja: "早朝・夕方", en: "Early morning & evening" }, description: { ja: "日本でも大人気のスポーツフィッシングターゲット。攻撃的なバイトとダイナミックなファイトが魅力。", en: "Japan's most popular sport fish. Aggressive bites and dynamic fights." }, gear: { rod: { ja: "M〜MH 6'6″〜7'0″ キャスティングロッド", en: "M-MH 6'6″–7'0″ casting rod" }, reel: { ja: "ベイトリール ギア比6.3:1以上", en: "Baitcaster 6.3:1+" }, line: { ja: "フロロ 14〜20lb または PE 1.0〜1.5号", en: "14–20lb fluoro or PE 1.0–1.5" }, hooks: { ja: "#2/0〜4/0 EWGオフセット", en: "#2/0–4/0 EWG offset" }, lures: ["スピニングワーム", "クランクベイト", "ジグ＆ポーク", "トップウォーター", "スピナーベイト"], tips: { ja: "桟橋、蓮の茎、沈木などストラクチャーを狙おう。水温が低い時はスローに。", en: "Target docks, lily stems, timber. Slow down in cold water." } }, spots: [{ name: "琵琶湖（滋賀）", rating: 5.0, type: { ja: "湖", en: "Lake" } }, { name: "亀山ダム（千葉）", rating: 4.8, type: { ja: "ダム湖", en: "Reservoir" } }, { name: "相模湖（神奈川）", rating: 4.7, type: { ja: "湖", en: "Lake" } }] },
  { id: 2, name: "アユ", nameEn: "Sweetfish (Ayu)", emoji: "🐠", color: "#1a4e7c", accent: "#0d7377", difficulty: "advanced", flyFriendly: true, flyNote: { ja: "テンカラ毛鉤での釣りも可能。逆さ毛鉤が効果的。", en: "Can be taken on tenkara kebari. A unique traditional approach." }, season: { ja: "6月〜10月", en: "June–October" }, habitat: { ja: "清流・渓流の砂礫底", en: "Clear, gravelly mountain rivers" }, bestTime: { ja: "午前中・くもりの日", en: "Morning & overcast days" }, description: { ja: "日本の国民的な渓流魚。友釣りの伝統は何百年もの歴史を持つ。塩焼きが絶品。", en: "Japan's iconic river fish. Centuries of 'tomozuri' tradition. Delicious grilled." }, gear: { rod: { ja: "友釣り専用竿 8〜9m", en: "8–9m ayu rod" }, reel: { ja: "（友釣りはリールなし）", en: "None (traditional)" }, line: { ja: "メタライン 0.2〜0.3号", en: "0.2–0.3 metal line" }, hooks: { ja: "友釣り用イカリ針", en: "Tomozuri anchor hooks" }, lures: ["友鮎（おとり鮎）", "小型スプーン", "毛鉤（テンカラ）"], tips: { ja: "友釣りは縄張りを持つアユのおとりへの攻撃を利用する伝統漁法。", en: "Tomozuri uses a live decoy ayu. Target fast mid-channel sections." } }, spots: [{ name: "長良川（岐阜）", rating: 5.0, type: { ja: "清流", en: "River" } }, { name: "四万十川（高知）", rating: 4.9, type: { ja: "清流", en: "River" } }, { name: "球磨川（熊本）", rating: 4.8, type: { ja: "清流", en: "River" } }] },
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
};

const MAP_SPOTS = [
  { id: 1, name: "隅田川水門",      fish: { ja: "シーバス",       en: "Seabass"         }, rating: 4.7, type: { ja: "河口",   en: "Estuary" }, icon: "🦈", lat: 35.694, lng: 139.803 },
  { id: 2, name: "お台場海浜公園",  fish: { ja: "アジ・メバル",   en: "Aji & Rockfish"  }, rating: 4.5, type: { ja: "港湾",   en: "Harbor"  }, icon: "🐟", lat: 35.627, lng: 139.775 },
  { id: 3, name: "荒川・葛西水門",  fish: { ja: "シーバス",       en: "Seabass"         }, rating: 4.8, type: { ja: "河口",   en: "Estuary" }, icon: "🦈", lat: 35.652, lng: 139.862 },
  { id: 4, name: "多摩川・丸子橋",  fish: { ja: "シーバス・バス", en: "Seabass & Bass"  }, rating: 4.6, type: { ja: "河川",   en: "River"   }, icon: "🐟", lat: 35.578, lng: 139.670 },
  { id: 5, name: "奥多摩川・白丸",  fish: { ja: "ヤマメ（フライ）",en: "Yamame (fly)"   }, rating: 4.9, type: { ja: "渓流",   en: "Stream"  }, icon: "🪶", lat: 35.793, lng: 139.093 },
  { id: 6, name: "琵琶湖・南湖",    fish: { ja: "バス・ヘラブナ", en: "Bass & Herabuna" }, rating: 4.9, type: { ja: "湖",     en: "Lake"    }, icon: "🐟", lat: 35.100, lng: 135.920 },
  { id: 7, name: "明石海峡",        fish: { ja: "マダイ・ブリ",   en: "Madai & Buri"   }, rating: 5.0, type: { ja: "海峡",   en: "Channel" }, icon: "🐟", lat: 34.618, lng: 135.012 },
  { id: 8, name: "佐賀・唐津沖",    fish: { ja: "アオリイカ",     en: "Squid"          }, rating: 5.0, type: { ja: "沿岸",   en: "Coast"   }, icon: "🦑", lat: 33.450, lng: 129.970 },
  { id: 9, name: "長良川（岐阜）",  fish: { ja: "アユ・ヤマメ",   en: "Ayu & Yamame"   }, rating: 5.0, type: { ja: "清流",   en: "River"   }, icon: "🐠", lat: 35.410, lng: 136.720 },
  { id: 10, name: "四万十川（高知）",fish: { ja: "アユ・テナガエビ",en: "Ayu & Prawn"   }, rating: 4.9, type: { ja: "清流",   en: "River"   }, icon: "🐠", lat: 33.090, lng: 132.930 },
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
            <span key={l} style={{ background: "rgba(255,255,255,0.6)", border: `1px solid ${style.border}`, borderRadius: 99, padding: "3px 10px", fontSize: "0.8rem", color: style.text, fontWeight: 600 }}>🎯 {l}</span>
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
          <span key={l} style={{ background: "rgba(255,255,255,0.7)", border: `2px solid ${style.border}`, borderRadius: 99, padding: "4px 12px", fontSize: "0.82rem", color: style.text, fontWeight: 600 }}>{l}</span>
        ))}
      </div>
    </div>
  );
}

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────
function DiffBadge({ level, lang }) {
  const m = { beginner: { ja: "初心者", en: "Beginner", c: "#2d7a3a", bg: "#d8f0d8" }, intermediate: { ja: "中級者", en: "Intermediate", c: "#c06a10", bg: "#f8e8d0" }, advanced: { ja: "上級者", en: "Advanced", c: "#b82030", bg: "#f8d8d8" } };
  const d = m[level] || m.beginner;
  return <span style={{ background: d.bg, color: d.c, border: `2px solid ${d.c}`, borderRadius: 99, padding: "3px 12px", fontSize: "0.95rem", fontWeight: 700 }}>{d[lang]}</span>;
}

function FlyTypeBadge({ type, lang }) {
  const m = { dry: { ja: "ドライ", en: "Dry Fly", c: "#c06a10", bg: "#f8e8d0" }, nymph: { ja: "ニンフ", en: "Nymph", c: "#1565a0", bg: "#d0e4f8" }, streamer: { ja: "ストリーマー", en: "Streamer", c: "#b82030", bg: "#f8d8d8" }, tenkara: { ja: "テンカラ", en: "Tenkara", c: "#2d7a3a", bg: "#d8f0d8" } };
  const d = m[type] || m.dry;
  return <span style={{ background: d.bg, color: d.c, border: `2px solid ${d.c}`, borderRadius: 99, padding: "3px 12px", fontSize: "0.95rem", fontWeight: 700 }}>{d[lang]}</span>;
}

function ScoreRing({ score, lang = "ja" }) {
  const color = score >= 80 ? "#2d7a3a" : score >= 60 ? "#c06a10" : "#b82030";
  const bg = score >= 80 ? "#d8f0d8" : score >= 60 ? "#f8e8d0" : "#f8d8d8";
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
      <div onClick={e => e.stopPropagation()} style={{ background: "#f8fff8", border: "2px solid #80c098", borderRadius: "24px 24px 0 0", padding: "24px 20px 44px", width: "100%", maxHeight: "85vh", overflowY: "auto", animation: "slideUp 0.3s ease" }}>
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
function FlyFishingView({ lang, weather, onOpenAI }) {
  const [flyTab, setFlyTab] = useState("patterns");
  const [selPattern, setSelPattern] = useState(null);
  const [selTechnique, setSelTechnique] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const currentMonthIdx = 2; // March
  const currentMonth = HATCH_CALENDAR[currentMonthIdx];

  const flyTabs = [
    { k: "patterns", ja: "🪶 フライ図鑑", en: "🪶 Fly Patterns" },
    { k: "hatch", ja: "🦋 ハッチカレンダー", en: "🦋 Hatch Calendar" },
    { k: "cast", ja: "🎋 キャスト技術", en: "🎋 Cast Techniques" },
    { k: "tenkara", ja: "⛰️ テンカラ", en: "⛰️ Tenkara" },
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
      <div style={{ background: "linear-gradient(135deg, rgba(116,198,157,0.15), rgba(72,202,228,0.08))", border: "2px solid #a0d0b0", borderRadius: 18, padding: "16px 18px", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 2 }}>
              {lang === "ja" ? "🪶 フライフィッシング" : "🪶 Fly Fishing"}
            </div>
            <div style={{ fontSize: "1.05rem", color: "#5a5a4a", marginBottom: 10 }}>
              {lang === "ja" ? "日本の渓流・テンカラ・フライパターン" : "Japan streams · Tenkara · Fly patterns"}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ background: "#d0ead8", border: "2px solid #80c098", borderRadius: 10, padding: "6px 12px", fontSize: "1rem", color: "#2d7a3a" }}>
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
              <div style={{ background: "linear-gradient(135deg, rgba(116,198,157,0.15), rgba(72,202,228,0.08))", border: "2px solid #a0d0b0", borderRadius: 18, padding: 18, marginBottom: 12 }}>
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
              <div style={{ background: "linear-gradient(135deg, rgba(116,198,157,0.12), transparent)", border: "2px solid #a0d0b0", borderRadius: 14, padding: 14 }}>
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
                  <div key={p.id} onClick={() => setSelPattern(p)} style={{ background: "rgba(116,198,157,0.06)", border: "2px solid #a0d0b0", borderRadius: 14, padding: "14px 12px", cursor: "pointer", animation: `fadeUp ${0.2 + i * 0.06}s ease both`, position: "relative" }}
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
                  <div style={{ width: "100%", height: `${m.activity * 0.7}px`, background: i === currentMonthIdx ? "#74c69d" : m.color, borderRadius: "3px 3px 0 0", opacity: i === currentMonthIdx ? 1 : 0.6, boxShadow: i === currentMonthIdx ? "0 0 10px #74c69d44" : "none" }} />
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
                    <span key={h} style={{ background: "#e0f0e8", border: "2px solid #a0d0b0", borderRadius: 99, padding: "3px 9px", fontSize: "0.95rem", color: "#2d7a3a" }}>🦋 {h}</span>
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
              <div style={{ background: "#e8f4ec", border: "2px solid #a0d0b0", borderRadius: 18, padding: 18, marginBottom: 12 }}>
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
              <div style={{ background: "linear-gradient(135deg, rgba(116,198,157,0.1), transparent)", border: "2px solid #a0d0b0", borderRadius: 14, padding: 14 }}>
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

      {flyTab === "tenkara" && (
        <div>
          <div style={{ background: "linear-gradient(135deg, rgba(72,202,228,0.08))", border: "2px solid #a0d0b0", borderRadius: 18, padding: 18, marginBottom: 14 }}>
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
              ].map(b => <span key={b.ja} style={{ background: "#d8f0e0", border: "2px solid #a0d0b0", borderRadius: 8, padding: "4px 10px", fontSize: "0.95rem", color: "#2d7a3a" }}>{b[lang]}</span>)}
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

          <div style={{ background: "rgba(72,202,228,0.06)", border: "2px solid #a0c8d0", borderRadius: 14, padding: 14 }}>
            <div style={{ fontSize: "1rem", color: "#0d7377", fontWeight: 700, marginBottom: 8 }}>💡 {lang === "ja" ? "テンカラの基本セット" : "Basic Tenkara Setup"}</div>
            {[
              { la: { ja: "竿", en: "Rod" }, v: { ja: "3.3〜4.5m カーボン or 竹竿", en: "3.3–4.5m carbon or bamboo" } },
              { la: { ja: "ライン", en: "Line" }, v: { ja: "フルロロ or フロロ 竿の長さ×1〜1.3", en: "Furled or fluoro, rod-length × 1–1.3" } },
              { la: { ja: "ティペット", en: "Tippet" }, v: { ja: "ナイロン 4X〜6X (60〜90cm)", en: "Nylon 4X–6X (60–90cm)" } },
              { la: { ja: "毛鉤", en: "Fly" }, v: { ja: "逆さ毛鉤 #10〜14（3〜5本あれば十分）", en: "Sakasa kebari #10–14 (3–5 flies is all you need)" } },
            ].map(row => (
              <div key={row.la.ja} style={{ display: "flex", gap: 10, marginBottom: 6, fontSize: "0.92rem" }}>
                <span style={{ color: "#5a5a4a", minWidth: 50 }}>{row.la[lang]}</span>
                <span style={{ color: "#1a1a14" }}>{row.v[lang]}</span>
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
function LeafletMap({ spots, userLocation, activeSpot, setActiveSpot, lang }) {
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

    // Add spot markers
    spots.forEach(spot => {
      const coords = SPOT_COORDS[spot.name] || (spot.lat ? { lat: spot.lat, lng: spot.lng } : null);
      if (!coords) return;

      const icon = L.divIcon({
        html: `<div style="background:#0d7377;border:3px solid white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,0.35);cursor:pointer">${spot.icon || "📍"}</div>`,
        className: "",
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([coords.lat, coords.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:sans-serif;min-width:160px">
            <div style="font-weight:700;font-size:14px;margin-bottom:4px">${spot.name}</div>
            <div style="color:#0d7377;font-size:12px">🐟 ${typeof spot.fish === "object" ? spot.fish[lang] : (spot.fishName || spot.fish || "")}</div>
            <div style="color:#5a5a4a;font-size:12px">⭐ ${spot.rating} · ${typeof spot.type === "object" ? spot.type[lang] : spot.type}</div>
            ${spot.distKm != null ? `<div style="color:#2d7a3a;font-weight:700;font-size:12px;margin-top:2px">📏 ${spot.distKm} km</div>` : ""}
          </div>
        `)
        .on("click", () => setActiveSpot(spot));

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

  // Re-render markers when spots or location changes
  useEffect(() => {
    if (window.L && leafletRef.current) {
      renderMarkers();
    }
  }, [spots, userLocation, lang]);

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
      style={{ height: 300, borderRadius: 16, overflow: "hidden", marginBottom: 14, border: "2px solid #a0c8d0", position: "relative", zIndex: 1, background: "#e8f4f4" }}
    />
  );
}

function MapView({ selectedFish, lang, userLocation, onOpenLocalAI }) {
  const [activeSpot, setActiveSpot] = useState(null);

  const rawSpots = selectedFish
    ? selectedFish.spots.map((sp, i) => ({ ...sp, id: i + 100, fishName: selectedFish.name, icon: selectedFish.emoji || "📍" }))
    : MAP_SPOTS;

  const spots = rawSpots.map(sp => {
    const coords = SPOT_COORDS[sp.name] || (sp.lat ? { lat: sp.lat, lng: sp.lng } : null);
    if (!coords || !userLocation) return { ...sp, distKm: null };
    return { ...sp, distKm: Math.round(distKm(userLocation.lat, userLocation.lng, coords.lat, coords.lng)) };
  }).sort((a, b) => (a.distKm ?? 9999) - (b.distKm ?? 9999));

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <h2 style={{ margin: "0 0 4px", fontSize: "1.2rem" }}>{selectedFish ? `${selectedFish.name}の釣り場` : (lang === "ja" ? "近くの釣り場" : "Spots Near You")}</h2>
      {/* Location status bar */}
      {userLocation ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#e0f2f2", border: "2px solid #a0c8d0", borderRadius: 10, marginBottom: 10, cursor: "pointer" }} onClick={onOpenLocalAI}>
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
      <LeafletMap spots={spots} userLocation={userLocation} activeSpot={activeSpot} setActiveSpot={setActiveSpot} lang={lang} />
      {activeSpot && (
        <div style={{ background: "#e0f2f2", border: "2px solid #0d7377", borderRadius: 14, padding: "12px 16px", marginBottom: 14, animation: "fadeUp 0.2s ease" }}>
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
        {spots.map((spot, i) => (
          <div key={spot.id || i} onClick={() => setActiveSpot(spot)} style={{ background: "#fffdf8", border: "2px solid #e0dbd0", borderRadius: 14, padding: "12px 16px", display: "flex", gap: 12, alignItems: "center", cursor: "pointer", animation: `fadeUp ${0.2 + i * 0.07}s ease both` }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "#e0f2f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>{spot.icon || "📍"}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>{spot.name}</div>
              <div style={{ fontSize: "1rem", color: "#5a5a4a", marginTop: 2 }}>🐟 {typeof spot.fish === "object" ? spot.fish[lang] : (spot.fishName || spot.fish || "")} · {typeof spot.type === "object" ? spot.type[lang] : spot.type}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#c06a10", fontSize: "1.05rem" }}>⭐ {spot.rating}</div>
              {spot.distKm != null && <div style={{ color: "#0d7377", fontSize: "0.88rem", fontWeight: 700 }}>📏 {spot.distKm} km</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── WEATHER VIEW ─────────────────────────────────────────────────────────────
function WeatherView({ lang, weather }) {
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
        <div style={{ background: "#f0f8f8", border: "2px solid #a0c8d0", borderRadius: 16, padding: 20, marginBottom: 14, textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", animation: "spin 2s linear infinite", display: "inline-block", marginBottom: 8 }}>🌤️</div>
          <div style={{ fontWeight: 700, color: "#0d7377", marginBottom: 4 }}>
            {lang === "ja" ? "天気データを取得中..." : "Fetching live weather..."}
          </div>
          <div style={{ fontSize: "0.88rem", color: "#5a5a4a" }}>
            {lang === "ja" ? "📍 位置情報を許可してください" : "📍 Please allow location access"}
          </div>
        </div>
      )}
      <div style={{ background: "linear-gradient(135deg,#e0f2f2,#f0ebe0)", border: "1px solid rgba(72,202,228,0.22)", borderRadius: 20, padding: 18, marginBottom: 14 }}>
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
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${h.fishing}%`, borderRadius: "4px 4px 0 0", background: h.fishing >= 85 ? "linear-gradient(180deg,#74c69d,#2d6a4f)" : h.fishing >= 70 ? "linear-gradient(180deg,#f4a261,#6b4226)" : "linear-gradient(180deg,#556677,#334455)" }} />
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
      <div style={{ background: "#fffdf8", border: "2px solid #e0dbd0", borderRadius: 18, padding: 16 }}>
        <div style={{ fontSize: "0.95rem", color: "#5a5a4a", marginBottom: 12, letterSpacing: "0.07em" }}>{lang === "ja" ? "潮汐" : "TIDES"}</div>
        {(WEATHER.tides || []).map(td => (
          <div key={td.time} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#fffdf8", borderRadius: 10, marginBottom: 6 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: "1rem" }}>{td.type === "high" ? "🌊" : "🏖️"}</span>
              <span style={{ fontSize: "0.95rem", fontWeight: 600 }}>{td.type === "high" ? (lang === "ja" ? "満潮" : "High Tide") : (lang === "ja" ? "干潮" : "Low Tide")}</span>
            </div>
            <span style={{ color: td.type === "high" ? "#0d7377" : "#f4a261", fontSize: "1.05rem", fontWeight: 700 }}>{td.time}</span>
          </div>
        ))}
      </div>
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
            <div style={{ fontWeight: 700, fontSize: "1.15rem", color: "#1a1a14" }}>
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
            <div key={sp.id} style={{ flexShrink: 0, background: i === 0 ? "#e0f2f2" : "#f5f0e8", border: `2px solid ${i === 0 ? "#0d7377" : "#d4cfc4"}`, borderRadius: 12, padding: "8px 12px", minWidth: 120 }}>
              <div style={{ fontSize: "1rem" }}>{sp.icon}</div>
              <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#1a1a14", marginTop: 2, lineHeight: 1.2 }}>{sp.name}</div>
              <div style={{ fontSize: "0.78rem", color: i === 0 ? "#0d7377" : "#7a7a6a", fontWeight: i === 0 ? 700 : 400 }}>
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
          <div style={{ fontSize: "0.95rem", lineHeight: 1.8, color: "#1a1a14", whiteSpace: "pre-wrap" }}>{response}</div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function CastWiseJapan() {
  const [lang, setLang] = useState("ja");
  const [tab, setTab] = useState("Explore");
  const [selectedFish, setSelectedFish] = useState(null);
  const [gearTab, setGearTab] = useState("gear");
  const [catches, setCatches] = useState(MOCK_CATCHES);
  const [liked, setLiked] = useState({});
  const [newCatch, setNewCatch] = useState({ fish: "", weight: "", location: "", notes: "", photo: null, method: "lure" });
  const [myCatches, setMyCatches] = useState([]);
  const [logOpen, setLogOpen] = useState(false);
  const [commentOpen, setCommentOpen] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [search, setSearch] = useState("");
  const [filterDiff, setFilterDiff] = useState("all");
  const [filterFly, setFilterFly] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showFlyAI, setShowFlyAI] = useState(false);
  const [flyAIFish, setFlyAIFish] = useState(null);
  const [leaderFilter, setLeaderFilter] = useState("points");
  const [profileTab, setProfileTab] = useState("catches");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [editProfile, setEditProfile] = useState(false);
  const [profile, setProfile] = useState({ name: lang === "ja" ? "あなたの名前" : "Your Name", bio: lang === "ja" ? "渓流フライマン🪶" : "Mountain stream fly fisher 🪶", avatar: "🪶", catches: 8, followers: 52, following: 29 });
  // Ad system state
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [showRewarded, setShowRewarded] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [bonusPoints, setBonusPoints] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [pendingTab, setPendingTab] = useState(null);
  // Location state
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showLocalAI, setShowLocalAI] = useState(false);

  // Live weather from Open-Meteo — updates when location is known
  const WEATHER = useRealWeather(userLocation);

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
    { key: "Explore", ja: "探す", en: "Explore", icon: "🐟" },
    { key: "FishGuide", ja: "魚図鑑", en: "Guide", icon: "🎣" },
    { key: "FlyFishing", ja: "フライ", en: "Fly", icon: "🪶" },
    { key: "Map", ja: "釣り場", en: "Map", icon: "🗺️" },
    { key: "Weather", ja: "天気", en: "Weather", icon: "🌤️" },
    { key: "Community", ja: "みんな", en: "Feed", icon: "🌊" },
    { key: "Profile", ja: "マイ", en: "Profile", icon: "👤" },
  ];

  function switchTab(newTab) {
    if (newTab === tab) return;
    if (!isPremium) {
      const newCount = tabSwitchCount + 1;
      setTabSwitchCount(newCount);
      // Show interstitial every 4 tab switches
      if (newCount % 4 === 0) {
        setPendingTab(newTab);
        setShowInterstitial(true);
        return;
      }
    }
    setTab(newTab);
  }

  function closeInterstitial() {
    setShowInterstitial(false);
    if (pendingTab) { setTab(pendingTab); setPendingTab(null); }
  }

  const diffMap = { all: { ja: "すべて", en: "All" }, beginner: { ja: "初心者", en: "Beginner" }, intermediate: { ja: "中級者", en: "Intermediate" }, advanced: { ja: "上級者", en: "Advanced" } };
  const catMap = { all: { ja: "すべて", en: "All" }, freshwater: { ja: "淡水", en: "Freshwater" }, saltwater: { ja: "海水", en: "Saltwater" }, shore: { ja: "ショア", en: "Shore" } };
  const [filterCat, setFilterCat] = useState("all");

  const FISH_CATS = { 1:"freshwater", 2:"freshwater", 3:"freshwater", 4:"saltwater", 5:"freshwater", 6:"saltwater", 7:"saltwater", 8:"saltwater", 9:"freshwater", 10:"freshwater", 11:"freshwater", 12:"saltwater", 13:"saltwater", 14:"saltwater", 15:"shore", 16:"saltwater" };

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

  function submitCatch() {
    if (!newCatch.fish || !newCatch.weight || !newCatch.location) return;
    const entry = { id: Date.now(), ...newCatch, user: profile.name, avatar: profile.avatar, date: { ja: "今日", en: "Today" }, emoji: "🎣", likes: 0, comments: [], rating: 0, verified: true };
    setMyCatches(p => [entry, ...p]);
    setCatches(p => [entry, ...p]);
    setNewCatch({ fish: "", weight: "", location: "", notes: "", photo: null, method: "lure" });
    setPhotoPreview(null); setFishIDResult(null); setLogOpen(false);
  }

  return (
    <div style={{ fontFamily: "'Noto Sans JP','Hiragino Kaku Gothic ProN','Yu Gothic',sans-serif", background: "#f5f0e8", minHeight: "100vh", color: "#1a1a14", maxWidth: 430, margin: "0 auto", position: "relative", boxShadow: "0 4px 40px rgba(0,0,0,0.12)", fontSize: "16px", lineHeight: 1.6, WebkitFontSmoothing: "antialiased" }}>
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
          --teal: #0d7377;
          --green: #2d7a3a;
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
            <div style={{ fontSize: "1.5rem", fontWeight: 900, lineHeight: 1, fontFamily: "'Shippori Mincho','Noto Serif JP',serif", color: "#1a1a14" }}>
              <span style={{ color: "#0d7377" }}>釣</span><span style={{ color: "#0d7377" }}>り</span>
              <span style={{ color: "#2d7a3a" }}>ナビ</span>
              <span style={{ fontSize: "0.5rem", color: "#9a7a20", marginLeft: 4, verticalAlign: "super", fontWeight: 700 }}>PRO</span>
            </div>
            <div style={{ fontSize: "0.95rem", color: "#7a7a6a", letterSpacing: "0.1em", marginTop: 2 }}>
              {s("appTagline", lang)}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setLang(l => l === "ja" ? "en" : "ja")} style={{ background: "#e8e3d8", border: "2px solid #c4bfb4", borderRadius: 8, padding: "6px 12px", color: "#1a1a14", cursor: "pointer", fontSize: "0.95rem", fontWeight: 700 }}>
              {lang === "ja" ? "EN" : "日本語"}
            </button>
            {/* Location / AI nearby button */}
            <button onClick={() => setShowLocalAI(true)} style={{ background: userLocation ? "#e0f2f2" : "#f5f0e8", border: `2px solid ${userLocation ? "#0d7377" : "#c4bfb4"}`, borderRadius: 8, padding: "6px 10px", color: userLocation ? "#0d7377" : "#7a7a6a", cursor: "pointer", fontSize: "0.88rem", fontWeight: 700, position: "relative" }}>
              {locationLoading ? "⏳" : "📍"}
              {userLocation && <span style={{ position: "absolute", top: -4, right: -4, width: 8, height: 8, borderRadius: "50%", background: "#2d7a3a", border: "2px solid #f5f0e8" }} />}
            </button>
            {isPremium ? (
              <div style={{ background: "#ece0f8", border: "2px solid #c0a0e0", borderRadius: 8, padding: "6px 10px", fontSize: "0.95rem", color: "#6040a0", fontWeight: 700 }}>👑 PRO</div>
            ) : (
              <button onClick={() => setShowRewarded(true)} style={{ background: "#e0f0e8", border: "2px solid #a0d0b0", borderRadius: 8, padding: "6px 10px", fontSize: "0.95rem", color: "#2d7a3a", cursor: "pointer", fontWeight: 700 }}>🎁</button>
            )}
            <div style={{ background: "#e0f0e8", border: "2px solid #a0d0b0", borderRadius: 8, padding: "6px 10px", fontSize: "0.95rem", color: "#2d7a3a", fontWeight: 700 }}>
              🔥 {WEATHER.fishingIndex}{bonusPoints > 0 && <span style={{ color: "#c06a10" }}> +{bonusPoints}</span>}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", overflowX: "auto", gap: 2 }}>
          {TABS_DATA.map(td => (
            <button key={td.key} onClick={() => switchTab(td.key)} style={{ flex: "0 0 auto", padding: "10px 12px 12px", border: "none", background: tab === td.key ? "#fffdf8" : "transparent", color: tab === td.key ? (td.key === "FlyFishing" ? "#2d7a3a" : "#0d7377") : "#7a7a6a", cursor: "pointer", fontFamily: "inherit", fontSize: "1.05rem", fontWeight: tab === td.key ? 700 : 500, whiteSpace: "nowrap", borderBottom: `3px solid ${tab === td.key ? (td.key === "FlyFishing" ? "#2d7a3a" : "#0d7377") : "transparent"}`, minHeight: 48 }}>
              <div style={{ fontSize: "1.1rem", marginBottom: 3 }}>{td.icon}</div>
              {td[lang]}
            </button>
          ))}
        </div>
      </div>

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
                    <FishIllustration fishId={fish.id} size={60} />
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
            <div onClick={() => switchTab("Weather")} style={{ background: "linear-gradient(135deg,#e0f2f2,#e8f4ec)", border: "2px solid #a0c8d0", borderRadius: 13, padding: "10px 13px", marginBottom: 12, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={s("search", lang)} style={{ flex: 1, background: "#f8f4ec", border: "2px solid #a0c8d0", borderRadius: 9, padding: "9px 12px", color: "#1a1a14", fontSize: "0.95rem" }} />
              <select value={filterDiff} onChange={e => setFilterDiff(e.target.value)} style={{ background: "#f8f4ec", border: "2px solid #a0c8d0", borderRadius: 9, padding: "9px", color: "#1a1a14", fontSize: "1rem", cursor: "pointer" }}>
                {Object.entries(diffMap).map(([k, v]) => <option key={k} value={k} style={{ background: "#f5f0e8" }}>{v[lang]}</option>)}
              </select>
            </div>
            {/* Category filter chips */}
            <div style={{ display: "flex", gap: 5, marginBottom: 10, overflowX: "auto", paddingBottom: 2 }}>
              {Object.entries(catMap).map(([k, v]) => (
                <button key={k} onClick={() => setFilterCat(k)} style={{ flex: "0 0 auto", padding: "5px 12px", borderRadius: 99, border: `1px solid ${filterCat === k ? "rgba(72,202,228,0.6)" : "#d4cfc4"}`, background: filterCat === k ? "rgba(72,202,228,0.14)" : "transparent", color: filterCat === k ? "#0d7377" : "#8899aa", cursor: "pointer", fontFamily: "inherit", fontSize: "0.95rem", whiteSpace: "nowrap" }}>
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
                      <BannerAd lang={lang} />
                    </div>
                  )}
                  {i === 10 && !isPremium && (
                    <div style={{ gridColumn: "1 / -1" }}>
                      <BannerAd lang={lang} />
                    </div>
                  )}
                <div onClick={() => { setSelectedFish(fish); switchTab("FishGuide"); setGearTab("gear"); }}
                  style={{ background: `linear-gradient(135deg,${fish.color}44,${fish.color}14)`, border: `1px solid ${fish.accent}33`, borderRadius: 15, padding: "14px 12px", cursor: "pointer", animation: `fadeUp ${0.22 + i * 0.06}s ease both`, position: "relative", overflow: "hidden" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                  {fish.flyFriendly && <div style={{ position: "absolute", top: 8, right: 8, fontSize: "1.05rem", background: "#c8e8d0", border: "2px solid #60b080", borderRadius: 6, padding: "1px 5px" }}>🪶</div>}
                  <div style={{ marginBottom: 6, animation: "float 3s ease-in-out infinite", animationDelay: `${i * 0.4}s` }}><FishIllustration fishId={fish.id} size={64} /></div>
                  <div style={{ fontWeight: 700, fontSize: "1rem", lineHeight: 1.3, marginBottom: 3 }}>{fish.name}</div>
                  <div style={{ fontSize: "0.8rem", color: "#5a5a4a", marginBottom: 5 }}>{fish.nameEn}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 5 }}>
                    <DiffBadge level={fish.difficulty} lang={lang} />
                    {fish.flyFriendly && <span style={{ background: "#d8f0e0", border: "2px solid #a0d0b0", borderRadius: 99, padding: "2px 8px", fontSize: "0.78rem", color: "#2d7a3a", fontWeight: 700 }}>🪶</span>}
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
                    <div style={{ animation: "float 3s ease-in-out infinite" }}><FishIllustration fishId={selectedFish.id} size={80} /></div>
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
                    <div style={{ marginTop: 10, padding: "8px 12px", background: "#e0f0e8", border: "2px solid #a0d0b0", borderRadius: 10, fontSize: "0.77rem", color: "#2d7a3a" }}>
                      🪶 {selectedFish.flyNote[lang]}
                    </div>
                  )}
                </div>

                {/* Seasonal intelligence */}
                <SeasonalAlert fishId={selectedFish.id} lang={lang} compact={false} />

                {/* AI buttons */}
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <button onClick={() => setShowAI(true)} style={{ flex: 1, padding: "11px", background: "#e0f2f2", border: "2px solid #70a8b8", borderRadius: 12, color: "#0d7377", cursor: "pointer", fontFamily: "inherit", fontSize: "1.05rem", fontWeight: 700 }}>🤖 AI {lang === "ja" ? "ルアー診断" : "Lure AI"}</button>
                  {selectedFish.flyFriendly && <button onClick={() => { setFlyAIFish(selectedFish); setShowFlyAI(true); }} style={{ flex: 1, padding: "11px", background: "#d8f0e0", border: "2px solid #80c098", borderRadius: 12, color: "#2d7a3a", cursor: "pointer", fontFamily: "inherit", fontSize: "1.05rem", fontWeight: 700 }}>🪶 AI {lang === "ja" ? "フライ診断" : "Fly AI"}</button>}
                </div>
                {!isPremium && <BannerAd lang={lang} />}

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
                      <div style={{ fontSize: "0.95rem", color: "#5a5a4a", marginBottom: 7 }}>🎯 {lang === "ja" ? "ルアー・エサ" : "Lures & Bait"}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {selectedFish.gear.lures.map(l => <span key={l} style={{ background: selectedFish.color + "44", border: `1px solid ${selectedFish.accent}33`, borderRadius: 99, padding: "3px 10px", fontSize: "0.95rem", color: selectedFish.accent }}>{l}</span>)}
                      </div>
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
        {tab === "Map" && <MapView selectedFish={null} lang={lang} userLocation={userLocation} onOpenLocalAI={() => setShowLocalAI(true)} />}

        {/* ── WEATHER ── */}
        {tab === "Weather" && <WeatherView lang={lang} weather={WEATHER} />}

        {/* ── COMMUNITY ── */}
        {tab === "Community" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
              <div>
                <h2 style={{ margin: "0 0 2px", fontSize: "1.2rem" }}>{lang === "ja" ? "みんなの釣果" : "Community Catches"}</h2>
                <p style={{ margin: 0, color: "#5a5a4a", fontSize: "1.05rem" }}>{lang === "ja" ? "世界中の釣り人の釣果に評価やコメントを" : "Rate and comment on catches worldwide"}</p>
              </div>
              <button onClick={() => { switchTab("Profile"); setProfileTab("catches"); }} style={{ background: "#e0f2f2", border: "2px solid #a0c8d0", borderRadius: 99, padding: "6px 10px", color: "#0d7377", cursor: "pointer", fontFamily: "inherit", fontSize: "0.95rem" }}>+{lang === "ja" ? "投稿" : "Share"}</button>
            </div>
            <div onClick={() => { switchTab("Profile"); setProfileTab("leaderboard"); }} style={{ background: "linear-gradient(135deg,rgba(244,162,97,0.12),rgba(244,162,97,0.04))", border: "2px solid #d0b090", borderRadius: 13, padding: "10px 13px", marginBottom: 12, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.83rem" }}>🏆 {lang === "ja" ? "シーズンランキング" : "Season Leaderboard"}</div>
                <div style={{ fontSize: "0.95rem", color: "#5a5a4a", marginTop: 2 }}>{lang === "ja" ? "テンカラ師が15,600ptでトップ · あなたは#8" : "テンカラ師 leads 15,600pts · You're #8"}</div>
              </div>
              <div style={{ color: "#c06a10" }}>→</div>
            </div>
            {catches.map((c, i) => (
              <React.Fragment key={c.id}>
                {i === 2 && !isPremium && <BannerAd lang={lang} />}
                <div style={{ background: "#fffdf8", border: "2px solid #e0dbd0", borderRadius: 17, overflow: "hidden", marginBottom: 13, animation: `fadeUp ${0.18 + i * 0.07}s ease both` }}>
                <div style={{ height: 140, background: "linear-gradient(135deg,#e8e3d8,#d8d3c8)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  {c.photo ? <img src={c.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ animation: "float 3s ease-in-out infinite" }}><FishIllustration fishId={FISH_DATA.find(f=>f.name===c.fish)?.id || 1} size={100} /></div>}
                  <div style={{ position: "absolute", bottom: 9, right: 9, background: "rgba(30,30,20,0.8)", borderRadius: 7, padding: "3px 9px", fontSize: "0.95rem", color: "#c06a10", fontWeight: 700 }}>⚖️ {c.weight}</div>
                  {c.verified && <div style={{ position: "absolute", top: 9, right: 9, background: "#c8e8d0", border: "1px solid #74c69d44", borderRadius: 7, padding: "2px 7px", fontSize: "1.05rem", color: "#2d7a3a" }}>{s("verified", lang)}</div>}
                  {c.method === "fly" && <div style={{ position: "absolute", top: 9, left: 9, background: "#c8e8d0", border: "2px solid #60b080", borderRadius: 7, padding: "2px 7px", fontSize: "1.05rem", color: "#2d7a3a" }}>🪶 {lang === "ja" ? "フライ" : "Fly"}</div>}
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
                    <button style={{ padding: "7px 10px", background: "#e8f4f4", border: "2px solid #a0c8d0", borderRadius: 8, color: "#0d7377", cursor: "pointer", fontSize: "1.05rem" }}>⭐</button>
                  </div>
                  {commentOpen === c.id && (
                    <div style={{ marginTop: 8, display: "flex", gap: 6, animation: "fadeUp 0.2s ease" }}>
                      <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder={s("addComment", lang)} onKeyDown={e => e.key === "Enter" && addComment(c.id)} style={{ flex: 1, background: "#fffdf8", border: "2px solid #a0c8d0", borderRadius: 7, padding: "7px 10px", color: "#1a1a14", fontSize: "1.05rem" }} />
                      <button onClick={() => addComment(c.id)} style={{ background: "#d0eae8", border: "2px solid #80b0c8", borderRadius: 7, padding: "7px 10px", color: "#0d7377", cursor: "pointer", fontSize: "1.05rem" }}>→</button>
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
            <div style={{ background: "linear-gradient(135deg,rgba(72,202,228,0.1),rgba(13,33,55,0.9))", border: "2px solid #a0c8d0", borderRadius: 19, padding: 17, marginBottom: 13 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 13 }}>
                <div style={{ position: "relative" }}>
                  <div style={{ width: 58, height: 58, borderRadius: "50%", background: "rgba(72,202,228,0.13)", border: "3px solid #0d7377", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>{profile.avatar}</div>
                  <div style={{ position: "absolute", bottom: -2, right: -2, width: 17, height: 17, borderRadius: "50%", background: "#2d7a3a", border: "2px solid #f5f0e8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.5rem" }}>✓</div>
                </div>
                <div style={{ flex: 1 }}>
                  {editProfile ? <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} style={{ background: "#f0ebe0", border: "2px solid #70a8b8", borderRadius: 7, padding: "4px 9px", color: "#1a1a14", fontSize: "0.92rem", fontWeight: 700, width: "100%", marginBottom: 4 }} /> : <div style={{ fontWeight: 700, fontSize: "0.98rem" }}>{profile.name}</div>}
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
              {[{ k: "catches", ja: "🎣 釣果記録", en: "🎣 My Catches" }, { k: "leaderboard", ja: "🏆 ランキング", en: "🏆 Leaderboard" }, { k: "pro", ja: "👑 PRO", en: "👑 PRO" }].map(pt => (
                <button key={pt.k} onClick={() => setProfileTab(pt.k)} style={{ flex: 1, padding: "8px", borderRadius: 9, border: `1px solid ${profileTab === pt.k ? (pt.k === "pro" ? "rgba(144,96,224,0.6)" : "#0d7377") : "#d4cfc4"}`, background: profileTab === pt.k ? (pt.k === "pro" ? "rgba(144,96,224,0.15)" : "rgba(72,202,228,0.1)") : "transparent", color: profileTab === pt.k ? (pt.k === "pro" ? "#9060e0" : "#0d7377") : "#8899aa", cursor: "pointer", fontFamily: "inherit", fontSize: "1rem", fontWeight: profileTab === pt.k ? 700 : 400 }}>{pt[lang]}</button>
              ))}
            </div>

            {profileTab === "catches" && (
              <>
                <button onClick={() => setLogOpen(!logOpen)} style={{ width: "100%", padding: "12px", marginBottom: 11, background: "linear-gradient(135deg,rgba(72,202,228,0.15),rgba(72,202,228,0.05))", border: "2px solid #80b8c8", borderRadius: 12, color: "#0d7377", cursor: "pointer", fontFamily: "inherit", fontSize: "1rem", fontWeight: 700 }}>{s("logCatch", lang)}</button>
                {logOpen && (
                  <div style={{ background: "#fffdf8", border: "2px solid #a0c8d0", borderRadius: 15, padding: 13, marginBottom: 11, animation: "fadeUp 0.3s ease" }}>
                    <div style={{ fontWeight: 700, marginBottom: 10, color: "#0d7377", fontSize: "1rem" }}>🎣 {lang === "ja" ? "釣果を記録" : "Record Your Catch"}</div>
                    <div onClick={() => !photoPreview && fileRef.current.click()}
                      style={{ minHeight: 110, border: "2px dashed #a0c8d0", borderRadius: 11, marginBottom: 9, cursor: photoPreview ? "default" : "pointer", background: photoPreview ? "transparent" : "#f0f8f8", overflow: "hidden", position: "relative" }}>
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
                      <div style={{ background: "#e0f2f2", border: "2px solid #a0c8d0", borderRadius: 12, padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12, animation: "fadeUp 0.3s ease" }}>
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
                            <div style={{ background: fishIDResult.isKeepable ? "#d8f0d8" : "#f8e8d0", padding: "12px 14px" }}>
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
                              <div style={{ background: fishIDResult.isKeepable ? "#d8f0d8" : "#f8e8d0", padding: "10px 14px", borderTop: "1px solid #e0dbd0" }}>
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
                        <button key={m.k} onClick={() => setNewCatch(p => ({ ...p, method: m.k }))} style={{ flex: 1, padding: "6px", borderRadius: 8, border: `1px solid ${newCatch.method === m.k ? "rgba(72,202,228,0.5)" : "#d4cfc4"}`, background: newCatch.method === m.k ? "rgba(72,202,228,0.12)" : "transparent", color: newCatch.method === m.k ? "#0d7377" : "#8899aa", cursor: "pointer", fontFamily: "inherit", fontSize: "0.95rem" }}>{m[lang]}</button>
                      ))}
                    </div>
                    {[{ k: "fish", ph: { ja: "魚種（例：ヤマメ）", en: "Species (e.g. Yamame)" } }, { k: "weight", ph: { ja: "重さ（例：0.4 kg）", en: "Weight (e.g. 0.4 kg)" } }, { k: "location", ph: { ja: "釣り場所", en: "Location" } }].map(f => (
                      <input key={f.k} value={newCatch[f.k]} onChange={e => setNewCatch(p => ({ ...p, [f.k]: e.target.value }))} placeholder={f.ph[lang]} style={{ width: "100%", marginBottom: 8, background: "#fffdf8", border: "2px solid #a0c8d0", borderRadius: 8, padding: "9px 12px", color: "#1a1a14", fontSize: "0.92rem" }} />
                    ))}
                    <textarea value={newCatch.notes} onChange={e => setNewCatch(p => ({ ...p, notes: e.target.value }))} placeholder={lang === "ja" ? "メモ（フライパターン・状況・テクニック）" : "Notes (fly pattern, conditions, technique)"} rows={3} style={{ width: "100%", marginBottom: 10, background: "#fffdf8", border: "2px solid #a0c8d0", borderRadius: 8, padding: "9px 12px", color: "#1a1a14", fontSize: "0.92rem", resize: "vertical" }} />
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={submitCatch} style={{ flex: 2, padding: "10px", background: "#d0eae8", border: "2px solid #80b0c8", borderRadius: 9, color: "#0d7377", cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>{s("saveshare", lang)}</button>
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
                  <div style={{ background: "rgba(72,202,228,0.07)", border: "2px solid #a0c8d0", borderRadius: 12, padding: "10px 13px", display: "flex", gap: 10, alignItems: "center" }}>
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
                  <div style={{ fontWeight: 700, fontSize: "1.15rem", marginBottom: 6 }}>{lang === "ja" ? "釣りナビ PRO" : "CastWise PRO"}</div>
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
                <div style={{ marginTop: 16, background: "#e8f4ec", border: "2px solid #a0d0b0", borderRadius: 14, padding: 14, textAlign: "center" }}>
                  <div style={{ fontSize: "0.95rem", color: "#5a5a4a", marginBottom: 8 }}>{lang === "ja" ? "まず試してみる？" : "Try before subscribing?"}</div>
                  <button onClick={() => setShowRewarded(true)} style={{ padding: "10px 24px", background: "#d0ead8", border: "2px solid #80c098", borderRadius: 12, color: "#2d7a3a", cursor: "pointer", fontFamily: "inherit", fontSize: "0.95rem", fontWeight: 700 }}>
                    🎁 {lang === "ja" ? "動画を見て1日PRO体験" : "Watch an ad for 1-day trial"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {showAI && selectedFish && <AIModal fish={selectedFish} weather={WEATHER} lang={lang} onClose={() => setShowAI(false)} />}
      {showFlyAI && <AIFlyModal fish={flyAIFish} weather={WEATHER} lang={lang} currentMonth={lang === "ja" ? HATCH_CALENDAR[2].month.ja : HATCH_CALENDAR[2].month.en} onClose={() => setShowFlyAI(false)} />}
      {showInterstitial && <InterstitialAd lang={lang} onClose={closeInterstitial} onWatchReward={() => { setShowInterstitial(false); setShowRewarded(true); }} />}
      {showRewarded && <RewardedAdModal lang={lang} onComplete={() => { setShowRewarded(false); setBonusPoints(p => p + 100); if (pendingTab) { setTab(pendingTab); setPendingTab(null); } }} onClose={() => { setShowRewarded(false); if (pendingTab) { setTab(pendingTab); setPendingTab(null); } }} />}
      {showLocalAI && <LocalAIAdvisor userLocation={userLocation} lang={lang} weather={WEATHER} onClose={() => setShowLocalAI(false)} />}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, height: 1, background: "linear-gradient(90deg,transparent,#c4bfb4,transparent)", pointerEvents: "none", zIndex: 100 }} />
    </div>
  );
}