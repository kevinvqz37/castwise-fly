// fishAtlasConfig.js

export const SPRITE_SHEET_COLS = 8;
export const SPRITE_SHEET_ROWS = 4;

export const FISH_SPECIES_DATA = {
  // --- ROW 0: FRESHWATER & STREAM ---
  "largemouth_bass": { id: "largemouth_bass", nameJa: "ブラックバス", nameEn: "Largemouth Bass",      col: 0, row: 0, habitat: "Freshwater", appId: 1 },
  "ayu":             { id: "ayu",             nameJa: "アユ",         nameEn: "Sweetfish (Ayu)",       col: 1, row: 0, habitat: "Freshwater", appId: 2 },
  "yamame":          { id: "yamame",          nameJa: "ヤマメ",       nameEn: "Yamame Trout",          col: 2, row: 0, habitat: "Freshwater", appId: 3 },
  "iwana":           { id: "iwana",           nameJa: "イワナ",       nameEn: "White-Spotted Char",    col: 3, row: 0, habitat: "Freshwater", appId: 5 },
  "rainbow_trout":   { id: "rainbow_trout",   nameJa: "ニジマス",     nameEn: "Rainbow Trout",         col: 4, row: 0, habitat: "Freshwater", appId: 11 },
  "herabuna":        { id: "herabuna",        nameJa: "ヘラブナ",     nameEn: "Crucian Carp",          col: 5, row: 0, habitat: "Freshwater", appId: 9 },
  "koi":             { id: "koi",             nameJa: "コイ",         nameEn: "Common Carp",           col: 6, row: 0, habitat: "Freshwater", appId: 10 },

  // --- ROW 1: SHALLOW SALTWATER & ESTUARY ---
  "seabass":         { id: "seabass",         nameJa: "シーバス",     nameEn: "Sea Bass",              col: 0, row: 1, habitat: "Saltwater", appId: 4 },
  "hira_suzuki":     { id: "hira_suzuki",     nameJa: "ヒラスズキ",   nameEn: "Blackfin Seabass",      col: 1, row: 1, habitat: "Saltwater", appId: null },
  "kurodai":         { id: "kurodai",         nameJa: "クロダイ",     nameEn: "Black Bream",           col: 2, row: 1, habitat: "Saltwater", appId: 14 },
  "magochi":         { id: "magochi",         nameJa: "マゴチ",       nameEn: "Flathead",              col: 3, row: 1, habitat: "Saltwater", appId: null },
  "hirame":          { id: "hirame",          nameJa: "ヒラメ",       nameEn: "Olive Flounder",        col: 4, row: 1, habitat: "Saltwater", appId: 8 },
  "madai":           { id: "madai",           nameJa: "マダイ",       nameEn: "Red Sea Bream",         col: 5, row: 1, habitat: "Saltwater", appId: 6 },
  "isaki":           { id: "isaki",           nameJa: "イサキ",       nameEn: "Chicken Grunt",         col: 6, row: 1, habitat: "Saltwater", appId: null },

  // --- ROW 2: STRUCTURE & REEF ---
  "mebaru":          { id: "mebaru",          nameJa: "メバル",       nameEn: "Rockfish",              col: 0, row: 2, habitat: "Saltwater", appId: 16 },
  "aohata":          { id: "aohata",          nameJa: "アオハタ",     nameEn: "Yellow Grouper",        col: 1, row: 2, habitat: "Saltwater", appId: null },
  "tachiuo":         { id: "tachiuo",         nameJa: "タチウオ",     nameEn: "Scabbardfish",          col: 2, row: 2, habitat: "Saltwater", appId: null },
  "aori_ika":        { id: "aori_ika",        nameJa: "アオリイカ",   nameEn: "Bigfin Reef Squid",     col: 3, row: 2, habitat: "Saltwater", appId: 12 },
  "aji":             { id: "aji",             nameJa: "アジ",         nameEn: "Horse Mackerel",        col: 4, row: 2, habitat: "Saltwater", appId: 7 },

  // --- ROW 3: PELAGIC & BLUE-WATER ---
  "hamachi":         { id: "hamachi",         nameJa: "ハマチ",       nameEn: "Young Yellowtail",      col: 0, row: 3, habitat: "Saltwater", appId: 15 },
  "buri":            { id: "buri",            nameJa: "ブリ",         nameEn: "Yellowtail",            col: 1, row: 3, habitat: "Saltwater", appId: 13 },
  "kanpachi":        { id: "kanpachi",        nameJa: "カンパチ",     nameEn: "Greater Amberjack",     col: 2, row: 3, habitat: "Saltwater", appId: null },
};

// Reverse map: appId -> spriteId (for use in FishIllustration)
export const APP_ID_TO_SPRITE = Object.fromEntries(
  Object.values(FISH_SPECIES_DATA)
    .filter(f => f.appId !== null)
    .map(f => [f.appId, f.id])
);