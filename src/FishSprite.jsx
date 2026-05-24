// FishSprite.jsx
import React from 'react';
import { FISH_SPECIES_DATA, SPRITE_SHEET_COLS, SPRITE_SHEET_ROWS } from './fishAtlasConfig';

// Import sprite sheet — place fish_spritesheet.png in src/assets/
// Uncomment when image is ready:
// import spriteSheetImage from './assets/fish_spritesheet.png';

// Placeholder until sprite sheet is available
const spriteSheetImage = null;

export const FishSprite = ({ fishId, size = 64, className = "" }) => {
  const fish = FISH_SPECIES_DATA[fishId];

  // Fallback emoji map while sprite sheet is pending
  const EMOJI_FALLBACK = {
    largemouth_bass: "🐟", ayu: "🐠", yamame: "🐡", iwana: "🐠",
    rainbow_trout: "🐠", herabuna: "🐟", koi: "🐟", seabass: "🦈",
    hira_suzuki: "🦈", kurodai: "🐟", magochi: "🐟", hirame: "🦈",
    madai: "🐟", isaki: "🐟", mebaru: "🐟", aohata: "🐟",
    tachiuo: "🐟", aori_ika: "🦑", aji: "🐟", hamachi: "🦈",
    buri: "🦈", kanpachi: "🦈",
  };

  if (!fish) {
    return (
      <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.5 }} className={className}>
        🐟
      </div>
    );
  }

  // Use sprite sheet if available, otherwise emoji fallback
  if (spriteSheetImage) {
    const xPercent = (fish.col / (SPRITE_SHEET_COLS - 1)) * 100;
    const yPercent = (fish.row / (SPRITE_SHEET_ROWS - 1)) * 100;

    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundImage: `url(${spriteSheetImage})`,
          backgroundSize: `${SPRITE_SHEET_COLS * 100}% ${SPRITE_SHEET_ROWS * 100}%`,
          backgroundPosition: `${xPercent}% ${yPercent}%`,
          backgroundRepeat: 'no-repeat',
        }}
        className={`fish-sprite-render ${className}`}
        role="img"
        aria-label={`${fish.nameEn} (${fish.nameJa})`}
      />
    );
  }

  // Emoji fallback
  return (
    <div
      style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.5 }}
      className={`fish-sprite-render ${className}`}
      role="img"
      aria-label={`${fish.nameEn} (${fish.nameJa})`}
    >
      {EMOJI_FALLBACK[fishId] || "🐟"}
    </div>
  );
};

export default FishSprite;