with open('src/App.jsx', 'r') as f:
    content = f.read()

fly_data = '''
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
];

'''

# Insert before FlyFishingView function
marker = 'function FlyFishingView('
if marker in content:
    content = content.replace(marker, fly_data + marker, 1)
    with open('src/App.jsx', 'w') as f:
        f.write(content)
    print('Fly data patched!')
else:
    print('FlyFishingView not found')
