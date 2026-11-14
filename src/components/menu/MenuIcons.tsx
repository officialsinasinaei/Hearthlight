// 1. Sculpted Brass Corner Bracket (for the Central Relic Box)
export function BrassCornerBracket({
  className = '',
  position = 'top-left',
}: {
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}) {
  const transform =
    position === 'top-right'
      ? 'scaleX(-1)'
      : position === 'bottom-left'
      ? 'scaleY(-1)'
      : position === 'bottom-right'
      ? 'scale(-1, -1)'
      : undefined;

  return (
    <div
      className={`pointer-events-none select-none absolute z-20 ${className}`}
      style={{ transform }}
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_2px_5px_rgba(0,0,0,0.85)]"
      >
        <defs>
          <linearGradient id="brass-bracket-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fae6a2" />
            <stop offset="25%" stopColor="#dca84c" />
            <stop offset="60%" stopColor="#8d601b" />
            <stop offset="90%" stopColor="#bf8f3b" />
            <stop offset="100%" stopColor="#5a3c0e" />
          </linearGradient>
          <linearGradient id="brass-bevel-highlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fff6d6" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#b68832" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="rivet-grad" x1="20%" y1="20%" x2="80%" y2="80%">
            <stop offset="0%" stopColor="#fff3ce" />
            <stop offset="45%" stopColor="#d7a445" />
            <stop offset="100%" stopColor="#432808" />
          </linearGradient>
        </defs>

        {/* Outer Heavy Cast Brass L-Bracket with Rounded Outer Arc matching the 24px Box Corner */}
        <path
          d="M 2 24 A 22 22 0 0 1 24 2 H 44 C 40 10 32 20 22 22 C 20 32 10 40 2 44 Z"
          fill="url(#brass-bracket-grad)"
          stroke="#422909"
          strokeWidth="1.2"
        />

        {/* Specular Bevel Arc along the Rounded Outer Corner Rim */}
        <path
          d="M 3 24 A 21 21 0 0 1 24 3 H 42 M 3 24 V 42"
          stroke="url(#brass-bevel-highlight)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Inner Engraved Accent Fillet */}
        <path
          d="M 8 22 A 14 14 0 0 1 22 8 H 32 C 28 14 22 20 14 22 Z"
          stroke="#54370d"
          strokeWidth="0.9"
          strokeDasharray="2 1.5"
          opacity="0.8"
        />

        {/* 3 Heavy Domed Rivets */}
        <circle cx="14" cy="14" r="2.8" fill="url(#rivet-grad)" stroke="#2d1904" strokeWidth="0.8" />
        <circle cx="34" cy="7" r="2.2" fill="url(#rivet-grad)" stroke="#2d1904" strokeWidth="0.7" />
        <circle cx="7" cy="34" r="2.2" fill="url(#rivet-grad)" stroke="#2d1904" strokeWidth="0.7" />
      </svg>
    </div>
  );
}

// 2. Bespoke Crest Emblem for Centerpiece Play Medallion
export function PlayCrestIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="blade-steel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f5f7fa" />
          <stop offset="40%" stopColor="#c5cbd4" />
          <stop offset="70%" stopColor="#758296" />
          <stop offset="100%" stopColor="#434e60" />
        </linearGradient>
        <linearGradient id="crest-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff5d0" />
          <stop offset="35%" stopColor="#e5b450" />
          <stop offset="70%" stopColor="#966a1e" />
          <stop offset="100%" stopColor="#54370b" />
        </linearGradient>
        <linearGradient id="shield-core" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#25427b" />
          <stop offset="50%" stopColor="#14264c" />
          <stop offset="100%" stopColor="#0a142c" />
        </linearGradient>
      </defs>

      {/* Sword 1: Top-Left to Bottom-Right */}
      <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.85))">
        {/* Blade */}
        <polygon points="10,10 14,8 42,36 40,40" fill="url(#blade-steel)" stroke="#242e3f" strokeWidth="0.75" />
        <line x1="12" y1="9" x2="41" y2="38" stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.7" />
        {/* Guard */}
        <polygon points="34,42 44,32 46,34 36,44" fill="url(#crest-gold)" stroke="#3e2808" strokeWidth="0.7" />
        {/* Pommel */}
        <circle cx="45" cy="45" r="2.2" fill="url(#crest-gold)" stroke="#3e2808" strokeWidth="0.7" />
      </g>

      {/* Sword 2: Top-Right to Bottom-Left */}
      <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.85))">
        {/* Blade */}
        <polygon points="42,10 38,8 10,36 12,40" fill="url(#blade-steel)" stroke="#242e3f" strokeWidth="0.75" />
        <line x1="40" y1="9" x2="11" y2="38" stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.7" />
        {/* Guard */}
        <polygon points="18,42 8,32 6,34 16,44" fill="url(#crest-gold)" stroke="#3e2808" strokeWidth="0.7" />
        {/* Pommel */}
        <circle cx="7" cy="45" r="2.2" fill="url(#crest-gold)" stroke="#3e2808" strokeWidth="0.7" />
      </g>

      {/* Central Faceted Shield */}
      <g filter="drop-shadow(0 3px 6px rgba(0,0,0,0.9))">
        {/* Outer Gold Shield Bezel */}
        <path
          d="M26 12 L38 18 V28 C38 36 26 43 26 43 C26 43 14 36 14 28 V18 Z"
          fill="url(#crest-gold)"
          stroke="#3d2708"
          strokeWidth="1.2"
        />
        {/* Inner Enamel Inlay */}
        <path
          d="M26 15 L35 20 V27 C35 33 26 39 26 39 C26 39 17 33 17 27 V20 Z"
          fill="url(#shield-core)"
          stroke="#10192e"
          strokeWidth="0.8"
        />
        {/* Central Embossed Hearthstone Rune Star */}
        <path
          d="M26 21 L28 26 L33 27 L29 30 L30 35 L26 32 L22 35 L23 30 L19 27 L24 26 Z"
          fill="url(#crest-gold)"
          stroke="#47300c"
          strokeWidth="0.75"
        />
        <circle cx="26" cy="28.5" r="1.8" fill="#fff7d6" />
      </g>
    </svg>
  );
}

// 3. Bespoke Leather & Brass Card Tome Icon (for My Collection)
export function CollectionTomeIcon({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="tome-leather" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#634027" />
          <stop offset="50%" stopColor="#432815" />
          <stop offset="100%" stopColor="#29160a" />
        </linearGradient>
        <linearGradient id="tome-brass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fae6a2" />
          <stop offset="50%" stopColor="#cb983d" />
          <stop offset="100%" stopColor="#6e4612" />
        </linearGradient>
        <linearGradient id="parchment-pages" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#eae0c8" />
          <stop offset="100%" stopColor="#c5b797" />
        </linearGradient>
      </defs>

      {/* Pages Block */}
      <rect x="7" y="6" width="22" height="25" rx="2" fill="url(#parchment-pages)" stroke="#4d3b2a" strokeWidth="0.8" />
      <line x1="28" y1="8" x2="28" y2="29" stroke="#9f8d6f" strokeWidth="0.6" strokeDasharray="1.5 1.5" />

      {/* Leather Book Cover */}
      <path
        d="M5 5 C5 4 6 3 7 3 H26 C27.5 3 28 4 28 5 V30 C28 31 27 32 25.5 32 H7 C5.5 32 5 31 5 30 Z"
        fill="url(#tome-leather)"
        stroke="#1a0c04"
        strokeWidth="1.2"
      />

      {/* Brass Spine Ribs */}
      <path d="M5 8 H9 M5 16 H9 M5 24 H9" stroke="url(#tome-brass)" strokeWidth="1.2" strokeLinecap="round" />

      {/* Embossed Brass Corner Hardware */}
      <polygon points="26,4 26,10 20,4" fill="url(#tome-brass)" stroke="#3e2508" strokeWidth="0.6" />
      <polygon points="26,31 26,25 20,31" fill="url(#tome-brass)" stroke="#3e2508" strokeWidth="0.6" />

      {/* Center Inlaid Hearthstone Medallion */}
      <circle cx="16" cy="17.5" r="4.5" fill="url(#tome-brass)" stroke="#3e2508" strokeWidth="0.75" />
      <circle cx="16" cy="17.5" r="2.2" fill="#2a1608" />
      <path d="M16 15.5 V19.5 M14 17.5 H18" stroke="#fae6a2" strokeWidth="0.7" strokeLinecap="round" />
    </svg>
  );
}

// 4. Bespoke Fanned Cards Icon (for Collection Badge)
export function FannedCardsIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="card-edge-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fae498" />
          <stop offset="100%" stopColor="#9b6f25" />
        </linearGradient>
      </defs>
      {/* Back card 1 */}
      <rect x="2" y="5" width="11" height="15" rx="1.5" transform="rotate(-18 2 5)" fill="#231710" stroke="url(#card-edge-gold)" strokeWidth="0.9" />
      {/* Middle card 2 */}
      <rect x="6" y="3" width="11" height="15" rx="1.5" transform="rotate(-4 6 3)" fill="#312218" stroke="url(#card-edge-gold)" strokeWidth="0.9" />
      {/* Front card 3 */}
      <rect x="10.5" y="3.5" width="11" height="15" rx="1.5" transform="rotate(12 10.5 3.5)" fill="#442f22" stroke="url(#card-edge-gold)" strokeWidth="0.9" />
      {/* Emblem on front card */}
      <circle cx="16" cy="11" r="2" fill="url(#card-edge-gold)" />
    </svg>
  );
}

// 5. Bespoke Friends Tavern Crest / Lantern Icon (for Bottom-Left HUD)
export function FriendsCrestIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="friends-brass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fae6a2" />
          <stop offset="60%" stopColor="#c89a3f" />
          <stop offset="100%" stopColor="#694311" />
        </linearGradient>
      </defs>
      {/* Shield Plaque */}
      <path
        d="M12 2 L19 5 V11 C19 16 12 21 12 21 C12 21 5 16 5 11 V5 Z"
        fill="#261b14"
        stroke="url(#friends-brass)"
        strokeWidth="1.2"
      />
      {/* Dual Tavern Figures / Allies Silhouette in Brass Relief */}
      <circle cx="9.5" cy="9" r="2.2" fill="url(#friends-brass)" />
      <path d="M6.5 16 C6.5 13.5 8 12.5 10 12.5 C10.5 12.5 11 12.6 11.5 12.8 C10.5 13.6 10 14.8 10 16 Z" fill="url(#friends-brass)" />
      <circle cx="14.5" cy="8.5" r="2.4" fill="url(#friends-brass)" />
      <path d="M11.5 16 C11.5 13.2 13 12 15 12 C17 12 18.5 13.2 18.5 16 Z" fill="url(#friends-brass)" />
    </svg>
  );
}

// 6. Bespoke Minted Relief Gold Coin Icon (for Bottom-Right HUD)
export function GoldCoinIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="coin-gold-outer" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#fffae0" />
          <stop offset="30%" stopColor="#f3ca56" />
          <stop offset="70%" stopColor="#b48021" />
          <stop offset="100%" stopColor="#603e0a" />
        </linearGradient>
        <linearGradient id="coin-gold-inner" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#eed272" />
          <stop offset="50%" stopColor="#cf9f34" />
          <stop offset="100%" stopColor="#875815" />
        </linearGradient>
      </defs>
      {/* Outer Coin Rim with Specular Lighting */}
      <circle cx="14" cy="14" r="12" fill="url(#coin-gold-outer)" stroke="#4d3007" strokeWidth="1" />
      {/* Milled / Beaded Inner Ring */}
      <circle cx="14" cy="14" r="9.8" stroke="#ffe794" strokeWidth="0.8" strokeDasharray="1.2 1.2" opacity="0.85" />
      {/* Recessed Basin */}
      <circle cx="14" cy="14" r="8.5" fill="url(#coin-gold-inner)" stroke="#5f3a09" strokeWidth="0.75" />
      {/* Stamped Tavern Lion / Crown Star */}
      <path
        d="M14 8 L15.5 12 L19.5 13 L16.5 15.5 L17.5 19.5 L14 17.5 L10.5 19.5 L11.5 15.5 L8.5 13 L12.5 12 Z"
        fill="#fffae0"
        stroke="#68420e"
        strokeWidth="0.6"
      />
      <circle cx="14" cy="14" r="1.3" fill="#68420e" />
    </svg>
  );
}

// 7. Precision Brass Cog Icon (for Bottom-Right HUD Settings)
export function BrassCogIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="cog-brass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff3c4" />
          <stop offset="40%" stopColor="#d5a544" />
          <stop offset="80%" stopColor="#8c5f1c" />
          <stop offset="100%" stopColor="#4f330a" />
        </linearGradient>
      </defs>
      {/* 8-Tooth Precision Machined Gear */}
      <path
        d="M10.5 2 H13.5 L14 4.5 L15.8 5.2 L17.8 3.8 L19.9 5.9 L18.5 7.9 L19.2 9.7 L21.7 10.2 V13.2 L19.2 13.7 L18.5 15.5 L19.9 17.5 L17.8 19.6 L15.8 18.2 L14 18.9 L13.5 21.4 H10.5 L10 18.9 L8.2 18.2 L6.2 19.6 L4.1 17.5 L5.5 15.5 L4.8 13.7 L2.3 13.2 V10.2 L4.8 9.7 L5.5 7.9 L4.1 5.9 L6.2 3.8 L8.2 5.2 L10 4.5 Z"
        fill="url(#cog-brass)"
        stroke="#331e05"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      {/* Center Axle Well & Piercing */}
      <circle cx="12" cy="11.7" r="4.2" fill="#25160c" stroke="#684411" strokeWidth="0.75" />
      <circle cx="12" cy="11.7" r="2.2" fill="url(#cog-brass)" stroke="#331e05" strokeWidth="0.6" />
    </svg>
  );
}
