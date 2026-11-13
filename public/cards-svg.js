/**
 * Rubik Card Club - Vector SVG Playing Card Engine
 * Renders authentic playing card faces with:
 * - Distinct, suit-specific styling for Diamonds, Spades, Hearts, and Clubs
 * - One dominant ornate symbol for Ace
 * - Value represented by the exact amount of symbols for 2 through 10
 * - 12 distinct court figure illustrations for Jack (J), Queen (Q), and King (K),
 *   each prominently featuring and wielding the card's specific suit symbol (♠, ♥, ♦, ♣)
 * - Colorful Jester illustration for Shelem Jokers
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.RubikCardsSVG = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // --- 1. Exact Geometric Suit Paths matching official emojis & card symbols (viewBox: 0 0 24 24) ---
  const SUIT_PATHS = {
    // Spade (♠): Classic geometric spire tip, dual parabolic lobes, circular undercuts, flared pedestal base
    spades: 'M12 2 C11.2 5.5 2.5 10.5 2.5 15 A4.8 4.8 0 0 0 10.5 17.8 C10 19.2 8.5 20.8 6.5 22 L17.5 22 C15.5 20.8 14 19.2 13.5 17.8 A4.8 4.8 0 0 0 21.5 15 C21.5 10.5 12.8 5.5 12 2 Z',

    // Heart (♥): Exact geometric cardioid with true circular arc top lobes and tapered bottom tip
    hearts: 'M12 21.35 C11.3 20.7 2.5 14.5 2.5 8.5 A5.5 5.5 0 0 1 12 5.5 A5.5 5.5 0 0 1 21.5 8.5 C21.5 14.5 12.7 20.7 12 21.35 Z',

    // Diamond (♦): Exact geometric 4-point rhombus / lozenge (mathematically symmetrical across x=12 and y=12)
    diamonds: 'M12 2 L21 12 L12 22 L3 12 Z',

    // Club (♣): Exact geometric trefoil clover with three circular lobes and flared pedestal base
    clubs: 'M12 2 C9.5 2 7.5 4 7.5 6.5 C7.5 7.6 7.9 8.6 8.6 9.4 C7.2 9 5.8 9.3 4.6 10.2 C2.8 11.5 2.2 13.8 3.1 15.8 C4 17.8 6.1 18.8 8.2 18.2 C9.2 17.9 10 17.2 10.6 16.3 C10.1 18.2 9 20.2 6.5 22 L17.5 22 C15 20.2 13.9 18.2 13.4 16.3 C14 17.2 14.8 17.9 15.8 18.2 C17.9 18.8 20 17.8 20.9 15.8 C21.8 13.8 21.2 11.5 19.4 10.2 C18.2 9.3 16.8 9 15.4 9.4 C16.1 8.6 16.5 7.6 16.5 6.5 C16.5 4 14.5 2 12 2 Z'
  };

  const SUIT_COLORS = {
    spades: '#111827',   // Crisp Card Black
    hearts: '#dc2626',   // Classic Card Red
    diamonds: '#dc2626', // Classic Card Red (matches card suit & ♦️ emoji)
    clubs: '#111827'     // Crisp Card Black
  };

  function normalizeSuit(card) {
    if (!card) return 'spades';
    const suitRaw = typeof card === 'string' ? card : (card.suit || card.color || card.symbol || '');
    const s = String(suitRaw).toUpperCase().trim();
    const sym = String(card.symbol || '');

    if (s === 'S' || s.startsWith('SPADE') || sym === '♠') return 'spades';
    if (s === 'H' || s.startsWith('HEART') || sym === '♥') return 'hearts';
    if (s === 'D' || s.startsWith('DIAMOND') || sym === '♦') return 'diamonds';
    if (s === 'C' || s.startsWith('CLUB') || sym === '♣') return 'clubs';
    if (s === 'JOKER' || s.startsWith('JOK') || sym === '🃏') return 'joker';

    return 'spades';
  }

  function getSuitSvg(suitKey, extraClass = '') {
    const color = SUIT_COLORS[suitKey] || '#111827';
    const path = SUIT_PATHS[suitKey] || SUIT_PATHS.spades;
    return `
      <svg class="suit-svg-icon suit-${suitKey} ${extraClass}" viewBox="0 0 24 24" fill="${color}">
        <path d="${path}"/>
      </svg>
    `;
  }

  // --- 2. Ace: One Dominant Ornate Symbol ---
  function getAceBodyHtml(suitKey) {
    return `
      <div class="card-ace-hero">
        ${getSuitSvg(suitKey)}
      </div>
    `;
  }

  // --- 3. Number Cards (2 through 10): Representing Value by Amount of Symbols ---
  function getPipsGridHtml(count, suitKey) {
    const pip = (extra = '') => `<div class="pip-cell ${extra}">${getSuitSvg(suitKey)}</div>`;
    const pair = (extra = '') => `<div class="pip-col-pair ${extra}">${pip()}${pip()}</div>`;
    const single = (extra = '') => `<div class="pip-col-single ${extra}">${pip()}</div>`;

    let inner = '';
    switch (count) {
      case 2:
        // Exactly 2 symbols
        inner = `
          ${single()}
          ${single('inverted')}
        `;
        break;
      case 3:
        // Exactly 3 symbols
        inner = `
          ${single()}
          ${single()}
          ${single('inverted')}
        `;
        break;
      case 4:
        // Exactly 4 symbols (2 + 2)
        inner = `
          ${pair()}
          ${pair('inverted')}
        `;
        break;
      case 5:
        // Exactly 5 symbols (2 + 1 + 2)
        inner = `
          ${pair()}
          ${single()}
          ${pair('inverted')}
        `;
        break;
      case 6:
        // Exactly 6 symbols (2 + 2 + 2)
        inner = `
          ${pair()}
          ${pair()}
          ${pair('inverted')}
        `;
        break;
      case 7:
        // Exactly 7 symbols (2 + 1 + 2 + 2)
        inner = `
          ${pair()}
          ${single('mid-high')}
          ${pair()}
          ${pair('inverted')}
        `;
        break;
      case 8:
        // Exactly 8 symbols (2 + 1 + 2 + 1 + 2)
        inner = `
          ${pair()}
          ${single('mid-high')}
          ${pair()}
          ${single('mid-low inverted')}
          ${pair('inverted')}
        `;
        break;
      case 9:
        // Exactly 9 symbols (2 + 2 + 1 + 2 + 2)
        inner = `
          ${pair()}
          ${pair()}
          ${single()}
          ${pair('inverted')}
          ${pair('inverted')}
        `;
        break;
      case 10:
        // Exactly 10 symbols (2 + 1 + 2 + 2 + 1 + 2 = 10)
        inner = `
          ${pair()}
          ${single('center-top')}
          ${pair()}
          ${pair('inverted')}
          ${single('center-bot inverted')}
          ${pair('inverted')}
        `;
        break;
      default:
        inner = `${single()}`;
        break;
    }

    return `<div class="card-pips-grid count-${count}">${inner}</div>`;
  }

  // --- 4. 12 Distinct Court Figure Illustrations (J, Q, K x 4 Suits) ---
  function getCourtFigureHtml(rank, suitKey) {
    const isRed = (suitKey === 'hearts' || suitKey === 'diamonds');
    const borderCol = isRed ? '#dc2626' : '#1e3a8a';
    const bgCol = isRed ? '#fff5f5' : '#f8fafc';

    // Suit badge helper inside court portrait
    const badge = (x, y, scale = 0.58) => `
      <g transform="translate(${x}, ${y}) scale(${scale})">
        ${getSuitSvg(suitKey)}
      </g>
    `;

    // -------------------------------------------------------------
    // JACKS (J) — Distinct character & symbol weapon/insignia per suit
    // -------------------------------------------------------------
    if (rank === 'J') {
      if (suitKey === 'spades') {
        // Jack of Spades: Dark steel knight with a ♠ Spade Halberd & ♠ Breastplate
        return `
          <div class="card-court-container">
            <svg viewBox="0 0 52 70" class="court-figure-svg" preserveAspectRatio="xMidYMid meet">
              <rect x="1" y="1" width="50" height="68" rx="4" fill="${bgCol}" stroke="${borderCol}" stroke-width="1.2"/>
              <!-- Dark Armor -->
              <path d="M7 68 C10 46 19 40 26 40 C33 40 42 46 45 68 Z" fill="#0f172a"/>
              <!-- Breastplate with large Spade symbol embossed -->
              <circle cx="26" cy="54" r="8" fill="#1e293b" stroke="#94a3b8" stroke-width="1"/>
              ${badge(20, 48, 0.58)}
              <!-- Collar / Gorget -->
              <path d="M18 40 L26 48 L34 40 Z" fill="#d4af37"/>
              <!-- Head & Steel Helm with Feather -->
              <rect x="22" y="30" width="8" height="10" fill="#fed7aa"/>
              <ellipse cx="26" cy="22" rx="7" ry="8.5" fill="#ffedd5"/>
              <path d="M15 16 C18 7 34 7 37 16 Z" fill="#334155"/>
              <!-- Visor & eyes -->
              <rect x="17" y="18" width="18" height="4" rx="2" fill="#d4af37"/>
              <circle cx="23" cy="20" r="0.9" fill="#0f172a"/>
              <circle cx="29" cy="20" r="0.9" fill="#0f172a"/>
              <!-- Polearm / Halberd with prominent SPADE HEAD -->
              <line x1="10" y1="18" x2="10" y2="66" stroke="#94a3b8" stroke-width="2"/>
              ${badge(4, 8, 0.58)}
            </svg>
          </div>
        `;
      }

      if (suitKey === 'hearts') {
        // Jack of Hearts: Gallant crimson courtier holding a ♥ Heart Pommel Dagger
        return `
          <div class="card-court-container">
            <svg viewBox="0 0 52 70" class="court-figure-svg" preserveAspectRatio="xMidYMid meet">
              <rect x="1" y="1" width="50" height="68" rx="4" fill="${bgCol}" stroke="${borderCol}" stroke-width="1.2"/>
              <!-- Crimson Tunic -->
              <path d="M7 68 C10 46 19 40 26 40 C33 40 42 46 45 68 Z" fill="#b91c1c"/>
              <!-- Large Heart on chest -->
              <circle cx="26" cy="54" r="8" fill="#fef2f2" stroke="#f59e0b" stroke-width="1"/>
              ${badge(20, 48, 0.58)}
              <!-- Golden Ruffle Collar -->
              <path d="M18 40 L26 48 L34 40 Z" fill="#f59e0b"/>
              <!-- Head & Velvet Cap with Heart Crest -->
              <rect x="22" y="30" width="8" height="10" fill="#fed7aa"/>
              <ellipse cx="26" cy="22" rx="7" ry="8.5" fill="#ffedd5"/>
              <circle cx="23" cy="21" r="0.9" fill="#1e293b"/>
              <circle cx="29" cy="21" r="0.9" fill="#1e293b"/>
              <path d="M15 16 C18 7 34 7 37 16 Z" fill="#dc2626"/>
              <path d="M31 10 Q39 1 43 4 Q40 9 34 10 Z" fill="#f59e0b"/>
              <!-- Dagger with HEART pommel -->
              <line x1="42" y1="28" x2="42" y2="64" stroke="#d4af37" stroke-width="2"/>
              ${badge(36, 18, 0.58)}
            </svg>
          </div>
        `;
      }

      if (suitKey === 'diamonds') {
        // Jack of Diamonds: Amber-Orange Scout with a ♦ Diamond Wand
        return `
          <div class="card-court-container">
            <svg viewBox="0 0 52 70" class="court-figure-svg" preserveAspectRatio="xMidYMid meet">
              <rect x="1" y="1" width="50" height="68" rx="4" fill="${bgCol}" stroke="${borderCol}" stroke-width="1.2"/>
              <!-- Orange Doublet -->
              <path d="M7 68 C10 46 19 40 26 40 C33 40 42 46 45 68 Z" fill="#c2410c"/>
              <!-- Diamond Chest Plate -->
              <polygon points="26,46 34,54 26,62 18,54" fill="#ffedd5" stroke="#ea580c" stroke-width="1.2"/>
              ${badge(20, 48, 0.58)}
              <!-- Neck & Hat -->
              <rect x="22" y="30" width="8" height="10" fill="#fed7aa"/>
              <ellipse cx="26" cy="22" rx="7" ry="8.5" fill="#ffedd5"/>
              <circle cx="23" cy="21" r="0.9" fill="#1e293b"/>
              <circle cx="29" cy="21" r="0.9" fill="#1e293b"/>
              <polygon points="26,6 38,15 14,15" fill="#ea580c"/>
              <!-- Wand with prominent DIAMOND head -->
              <line x1="10" y1="20" x2="10" y2="66" stroke="#fbbf24" stroke-width="2"/>
              ${badge(4, 9, 0.58)}
            </svg>
          </div>
        `;
      }

      if (suitKey === 'clubs') {
        // Jack of Clubs: Forest Archer with a ♣ Club Banner
        return `
          <div class="card-court-container">
            <svg viewBox="0 0 52 70" class="court-figure-svg" preserveAspectRatio="xMidYMid meet">
              <rect x="1" y="1" width="50" height="68" rx="4" fill="${bgCol}" stroke="${borderCol}" stroke-width="1.2"/>
              <!-- Charcoal & Emerald Robe -->
              <path d="M7 68 C10 46 19 40 26 40 C33 40 42 46 45 68 Z" fill="#1e293b"/>
              <!-- Clover Badge on chest -->
              <circle cx="26" cy="54" r="8" fill="#047857" stroke="#10b981" stroke-width="1"/>
              ${badge(20, 48, 0.58)}
              <!-- Head & Archer Cap -->
              <rect x="22" y="30" width="8" height="10" fill="#fed7aa"/>
              <ellipse cx="26" cy="22" rx="7" ry="8.5" fill="#ffedd5"/>
              <circle cx="23" cy="21" r="0.9" fill="#1e293b"/>
              <circle cx="29" cy="21" r="0.9" fill="#1e293b"/>
              <path d="M15 16 C18 7 34 7 37 16 Z" fill="#065f46"/>
              <path d="M31 10 Q39 1 43 4 Q40 9 34 10 Z" fill="#10b981"/>
              <!-- Lance with prominent CLUB head -->
              <line x1="42" y1="20" x2="42" y2="66" stroke="#10b981" stroke-width="2"/>
              ${badge(36, 10, 0.58)}
            </svg>
          </div>
        `;
      }
    }

    // -------------------------------------------------------------
    // QUEENS (Q) — Distinct gowns, crowns & symbol sceptres per suit
    // -------------------------------------------------------------
    if (rank === 'Q') {
      if (suitKey === 'spades') {
        // Queen of Spades: Royal Obsidian Gown & ♠ Spade Sceptre
        return `
          <div class="card-court-container">
            <svg viewBox="0 0 52 70" class="court-figure-svg" preserveAspectRatio="xMidYMid meet">
              <rect x="1" y="1" width="50" height="68" rx="4" fill="${bgCol}" stroke="${borderCol}" stroke-width="1.2"/>
              <!-- Obsidian Dress -->
              <path d="M8 68 C12 46 19 40 26 40 C33 40 40 46 44 68 Z" fill="#0f172a"/>
              <circle cx="26" cy="54" r="7" fill="#1e293b" stroke="#94a3b8" stroke-width="0.8"/>
              ${badge(20, 48, 0.58)}
              <!-- Face & Crown with Spade jewel -->
              <rect x="22" y="30" width="8" height="10" fill="#fed7aa"/>
              <ellipse cx="26" cy="22" rx="7" ry="8" fill="#ffedd5"/>
              <circle cx="23.5" cy="21" r="0.9" fill="#1e293b"/>
              <circle cx="28.5" cy="21" r="0.9" fill="#1e293b"/>
              <path d="M17 15 L20 8 L23 12 L26 6 L29 12 L32 8 L35 15 Z" fill="#94a3b8" stroke="#334155" stroke-width="0.8"/>
              <!-- Sceptre with SPADE top -->
              <line x1="41" y1="24" x2="41" y2="64" stroke="#d4af37" stroke-width="1.8"/>
              ${badge(35, 14, 0.58)}
            </svg>
          </div>
        `;
      }

      if (suitKey === 'hearts') {
        // Queen of Hearts: Crimson Gown & ♥ Heart Sceptre
        return `
          <div class="card-court-container">
            <svg viewBox="0 0 52 70" class="court-figure-svg" preserveAspectRatio="xMidYMid meet">
              <rect x="1" y="1" width="50" height="68" rx="4" fill="${bgCol}" stroke="${borderCol}" stroke-width="1.2"/>
              <!-- Crimson Dress -->
              <path d="M8 68 C12 46 19 40 26 40 C33 40 40 46 44 68 Z" fill="#dc2626"/>
              <circle cx="26" cy="54" r="7" fill="#fff" stroke="#f59e0b" stroke-width="0.8"/>
              ${badge(20, 48, 0.58)}
              <!-- Face & Crown with Heart jewel -->
              <rect x="22" y="30" width="8" height="10" fill="#fed7aa"/>
              <ellipse cx="26" cy="22" rx="7" ry="8" fill="#ffedd5"/>
              <circle cx="23.5" cy="21" r="0.9" fill="#1e293b"/>
              <circle cx="28.5" cy="21" r="0.9" fill="#1e293b"/>
              <path d="M17 15 L20 8 L23 12 L26 6 L29 12 L32 8 L35 15 Z" fill="#f59e0b" stroke="#b45309" stroke-width="0.8"/>
              <!-- Sceptre with blooming HEART top -->
              <line x1="41" y1="24" x2="41" y2="64" stroke="#f59e0b" stroke-width="1.8"/>
              ${badge(35, 14, 0.58)}
            </svg>
          </div>
        `;
      }

      if (suitKey === 'diamonds') {
        // Queen of Diamonds: Amber Gown & ♦ Diamond Sceptre
        return `
          <div class="card-court-container">
            <svg viewBox="0 0 52 70" class="court-figure-svg" preserveAspectRatio="xMidYMid meet">
              <rect x="1" y="1" width="50" height="68" rx="4" fill="${bgCol}" stroke="${borderCol}" stroke-width="1.2"/>
              <!-- Amber Dress -->
              <path d="M8 68 C12 46 19 40 26 40 C33 40 40 46 44 68 Z" fill="#ea580c"/>
              <polygon points="26,48 32,54 26,60 20,54" fill="#fef08a" stroke="#c2410c" stroke-width="0.8"/>
              ${badge(20, 48, 0.58)}
              <!-- Face & Crown with Diamond tip -->
              <rect x="22" y="30" width="8" height="10" fill="#fed7aa"/>
              <ellipse cx="26" cy="22" rx="7" ry="8" fill="#ffedd5"/>
              <circle cx="23.5" cy="21" r="0.9" fill="#1e293b"/>
              <circle cx="28.5" cy="21" r="0.9" fill="#1e293b"/>
              <path d="M17 15 L20 8 L23 12 L26 6 L29 12 L32 8 L35 15 Z" fill="#fbbf24" stroke="#b45309" stroke-width="0.8"/>
              <!-- Sceptre with prominent DIAMOND crystal -->
              <line x1="41" y1="24" x2="41" y2="64" stroke="#fbbf24" stroke-width="1.8"/>
              ${badge(35, 14, 0.58)}
            </svg>
          </div>
        `;
      }

      if (suitKey === 'clubs') {
        // Queen of Clubs: Emerald Dress & ♣ Club Trefoil Sceptre
        return `
          <div class="card-court-container">
            <svg viewBox="0 0 52 70" class="court-figure-svg" preserveAspectRatio="xMidYMid meet">
              <rect x="1" y="1" width="50" height="68" rx="4" fill="${bgCol}" stroke="${borderCol}" stroke-width="1.2"/>
              <!-- Emerald Dress -->
              <path d="M8 68 C12 46 19 40 26 40 C33 40 40 46 44 68 Z" fill="#047857"/>
              <circle cx="26" cy="54" r="7" fill="#10b981" stroke="#064e3b" stroke-width="0.8"/>
              ${badge(20, 48, 0.58)}
              <!-- Face & Floral Diadem -->
              <rect x="22" y="30" width="8" height="10" fill="#fed7aa"/>
              <ellipse cx="26" cy="22" rx="7" ry="8" fill="#ffedd5"/>
              <circle cx="23.5" cy="21" r="0.9" fill="#1e293b"/>
              <circle cx="28.5" cy="21" r="0.9" fill="#1e293b"/>
              <path d="M17 15 L20 8 L23 12 L26 6 L29 12 L32 8 L35 15 Z" fill="#10b981" stroke="#064e3b" stroke-width="0.8"/>
              <!-- Sceptre with prominent CLUB trefoil -->
              <line x1="41" y1="24" x2="41" y2="64" stroke="#34d399" stroke-width="1.8"/>
              ${badge(35, 14, 0.58)}
            </svg>
          </div>
        `;
      }
    }

    // -------------------------------------------------------------
    // KINGS (K) — Imperial Monarchs wielding & wearing their suit symbols
    // -------------------------------------------------------------
    if (rank === 'K') {
      if (suitKey === 'spades') {
        // King of Spades: Imperial Crown, Ermine Robe, Raised ♠ Broadsword
        return `
          <div class="card-court-container">
            <svg viewBox="0 0 52 70" class="court-figure-svg" preserveAspectRatio="xMidYMid meet">
              <rect x="1" y="1" width="50" height="68" rx="4" fill="${bgCol}" stroke="${borderCol}" stroke-width="1.2"/>
              <!-- Ermine Mantle -->
              <path d="M6 68 C9 44 17 38 26 38 C35 38 43 44 46 68 Z" fill="#0f172a"/>
              <!-- Breastplate with SPADE crest -->
              <circle cx="26" cy="54" r="8" fill="#334155" stroke="#cbd5e1" stroke-width="1"/>
              ${badge(20, 48, 0.58)}
              <!-- Face, Beard & Spired Crown -->
              <rect x="21" y="28" width="10" height="10" fill="#fed7aa"/>
              <ellipse cx="26" cy="21" rx="8" ry="8.5" fill="#ffedd5"/>
              <path d="M19 23 C19 34 33 34 33 23 Z" fill="#475569"/>
              <circle cx="23" cy="20" r="1" fill="#1e293b"/>
              <circle cx="29" cy="20" r="1" fill="#1e293b"/>
              <path d="M16 14 L18 5 L22 10 L26 3 L30 10 L34 5 L36 14 Z" fill="#d4af37" stroke="#b45309" stroke-width="0.8"/>
              <!-- Raised Broadsword with ♠ Spade Pommel -->
              <line x1="10" y1="22" x2="10" y2="64" stroke="#94a3b8" stroke-width="2.2"/>
              <line x1="6" y1="28" x2="14" y2="28" stroke="#d4af37" stroke-width="2"/>
              ${badge(4, 12, 0.58)}
            </svg>
          </div>
        `;
      }

      if (suitKey === 'hearts') {
        // King of Hearts: Suicide King with Sword behind Crown & ♥ Heart Medallion
        return `
          <div class="card-court-container">
            <svg viewBox="0 0 52 70" class="court-figure-svg" preserveAspectRatio="xMidYMid meet">
              <rect x="1" y="1" width="50" height="68" rx="4" fill="${bgCol}" stroke="${borderCol}" stroke-width="1.2"/>
              <!-- Royal Crimson Robe -->
              <path d="M6 68 C9 44 17 38 26 38 C35 38 43 44 46 68 Z" fill="#991b1b"/>
              <!-- Large HEART Medallion -->
              <circle cx="26" cy="54" r="8" fill="#fef2f2" stroke="#f59e0b" stroke-width="1"/>
              ${badge(20, 48, 0.58)}
              <!-- Face, Beard & Crown -->
              <rect x="21" y="28" width="10" height="10" fill="#fed7aa"/>
              <ellipse cx="26" cy="21" rx="8" ry="8.5" fill="#ffedd5"/>
              <path d="M19 23 C19 34 33 34 33 23 Z" fill="#78350f"/>
              <circle cx="23" cy="20" r="1" fill="#1e293b"/>
              <circle cx="29" cy="20" r="1" fill="#1e293b"/>
              <!-- Famous sword behind the crown -->
              <line x1="42" y1="12" x2="10" y2="12" stroke="#d4af37" stroke-width="2.5"/>
              <path d="M16 14 L18 5 L22 10 L26 3 L30 10 L34 5 L36 14 Z" fill="#f59e0b" stroke="#b45309" stroke-width="0.8"/>
              <!-- Heart emblem atop crown -->
              ${badge(20, -1, 0.58)}
            </svg>
          </div>
        `;
      }

      if (suitKey === 'diamonds') {
        // King of Diamonds: Stately Profile King with ♦ Battleaxe
        return `
          <div class="card-court-container">
            <svg viewBox="0 0 52 70" class="court-figure-svg" preserveAspectRatio="xMidYMid meet">
              <rect x="1" y="1" width="50" height="68" rx="4" fill="${bgCol}" stroke="${borderCol}" stroke-width="1.2"/>
              <!-- Amber Robe -->
              <path d="M6 68 C9 44 17 38 26 38 C35 38 43 44 46 68 Z" fill="#9a3412"/>
              <!-- Geometric DIAMOND Chest Crest -->
              <polygon points="26,46 34,54 26,62 18,54" fill="#ffedd5" stroke="#ea580c" stroke-width="1.2"/>
              ${badge(20, 48, 0.58)}
              <!-- Face in Profile, Beard & Crown -->
              <rect x="21" y="28" width="10" height="10" fill="#fed7aa"/>
              <ellipse cx="26" cy="21" rx="8" ry="8.5" fill="#ffedd5"/>
              <path d="M19 23 C19 34 33 34 33 23 Z" fill="#78350f"/>
              <circle cx="23" cy="20" r="1" fill="#1e293b"/>
              <circle cx="29" cy="20" r="1" fill="#1e293b"/>
              <path d="M16 14 L18 5 L22 10 L26 3 L30 10 L34 5 L36 14 Z" fill="#fbbf24" stroke="#b45309" stroke-width="0.8"/>
              <!-- Battleaxe / Sceptre with DIAMOND head -->
              <line x1="42" y1="20" x2="42" y2="64" stroke="#fbbf24" stroke-width="2.2"/>
              ${badge(36, 10, 0.58)}
            </svg>
          </div>
        `;
      }

      if (suitKey === 'clubs') {
        // King of Clubs: Imperial King with Royal ♣ Club Orb
        return `
          <div class="card-court-container">
            <svg viewBox="0 0 52 70" class="court-figure-svg" preserveAspectRatio="xMidYMid meet">
              <rect x="1" y="1" width="50" height="68" rx="4" fill="${bgCol}" stroke="${borderCol}" stroke-width="1.2"/>
              <!-- Imperial Charcoal Robe -->
              <path d="M6 68 C9 44 17 38 26 38 C35 38 43 44 46 68 Z" fill="#1e293b"/>
              <!-- Golden Chest Crest with ♣ Club -->
              <circle cx="26" cy="54" r="8" fill="#047857" stroke="#10b981" stroke-width="1"/>
              ${badge(20, 48, 0.58)}
              <!-- Face, Curled Beard & Crown -->
              <rect x="21" y="28" width="10" height="10" fill="#fed7aa"/>
              <ellipse cx="26" cy="21" rx="8" ry="8.5" fill="#ffedd5"/>
              <path d="M19 23 C19 34 33 34 33 23 Z" fill="#1e293b"/>
              <circle cx="23" cy="20" r="1" fill="#1e293b"/>
              <circle cx="29" cy="20" r="1" fill="#1e293b"/>
              <path d="M16 14 L18 5 L22 10 L26 3 L30 10 L34 5 L36 14 Z" fill="#10b981" stroke="#064e3b" stroke-width="0.8"/>
              <!-- Royal Orb surmounted by ♣ Club -->
              <circle cx="11" cy="38" r="5" fill="#d4af37" stroke="#b45309" stroke-width="1"/>
              ${badge(5, 22, 0.58)}
            </svg>
          </div>
        `;
      }
    }

    return '';
  }

  // --- 5. Shelem Joker: Jester with Tri-Corner Hat and Bells ---
  function getJokerBodyHtml() {
    return `
      <div class="card-court-container">
        <svg viewBox="0 0 52 70" class="court-figure-svg" preserveAspectRatio="xMidYMid meet">
          <rect x="1" y="1" width="50" height="68" rx="4" fill="#faf5ff" stroke="#a855f7" stroke-width="1.2"/>
          <path d="M8 68 C12 48 19 42 26 42 C33 42 40 48 44 68 Z" fill="#9333ea"/>
          <path d="M15 42 L20 52 L26 42 L32 52 L37 42 L34 39 L26 41 L18 39 Z" fill="#facc15"/>
          <circle cx="20" cy="53" r="1.5" fill="#f59e0b"/>
          <circle cx="32" cy="53" r="1.5" fill="#f59e0b"/>
          <ellipse cx="26" cy="24" rx="7.5" ry="9" fill="#fed7aa"/>
          <path d="M20 20 Q26 17 32 20 Q26 23 20 20 Z" fill="#1e1b4b"/>
          <circle cx="23" cy="20" r="1" fill="#38bdf8"/>
          <circle cx="29" cy="20" r="1" fill="#38bdf8"/>
          <path d="M22 28 Q26 32 30 28" stroke="#dc2626" stroke-width="1.4" fill="none"/>
          <path d="M17 19 C11 9 7 12 5 19 C11 21 16 21 19 19 Z" fill="#dc2626"/>
          <path d="M19 18 C24 7 28 7 33 18 Z" fill="#eab308"/>
          <path d="M33 19 C36 21 41 21 47 19 C45 12 41 9 35 19 Z" fill="#2563eb"/>
          <circle cx="5" cy="19" r="1.8" fill="#facc15"/>
          <circle cx="26" cy="6" r="1.8" fill="#facc15"/>
          <circle cx="47" cy="19" r="1.8" fill="#facc15"/>
          <text x="26" y="63" text-anchor="middle" font-size="8" font-weight="900" fill="#7e22ce">JOKER</text>
        </svg>
      </div>
    `;
  }

  // --- 6. Main Card Face HTML Generator ---
  function generateCardInnerHtml(card) {
    const isJoker = (card.suit === 'JOKER' || card.rank === 'JOKER' || card.id === 'JOKER' || card.symbol === '🃏');
    if (isJoker) {
      return `
        <div class="card-corner-top">
          <span class="card-rank" style="font-size:0.65rem;">JKR</span>
          <span class="card-suit-sm">🃏</span>
        </div>
        <div class="card-center-body">
          ${getJokerBodyHtml()}
        </div>
        <div class="card-corner-bottom">
          <span class="card-rank" style="font-size:0.65rem;">JKR</span>
          <span class="card-suit-sm">🃏</span>
        </div>
      `;
    }

    const suitKey = normalizeSuit(card);
    const rawRank = String(card.label || card.rank || '').trim().toUpperCase();
    const cornerSuit = `<span class="suit-corner-svg">${getSuitSvg(suitKey)}</span>`;

    let centerHtml = '';
    const numericRank = parseInt(rawRank, 10);

    if (rawRank === 'A' || rawRank === '1' || numericRank === 1 || numericRank === 14) {
      centerHtml = getAceBodyHtml(suitKey);
    } else if (rawRank === 'J' || numericRank === 11) {
      centerHtml = getCourtFigureHtml('J', suitKey);
    } else if (rawRank === 'Q' || numericRank === 12) {
      centerHtml = getCourtFigureHtml('Q', suitKey);
    } else if (rawRank === 'K' || numericRank === 13) {
      centerHtml = getCourtFigureHtml('K', suitKey);
    } else if (numericRank >= 2 && numericRank <= 10) {
      centerHtml = getPipsGridHtml(numericRank, suitKey);
    } else {
      centerHtml = `<div class="card-center-suit">${getSuitSvg(suitKey)}</div>`;
    }

    return `
      <div class="card-corner-top">
        <span class="card-rank">${rawRank}</span>
        ${cornerSuit}
      </div>
      <div class="card-center-body">
        ${centerHtml}
      </div>
      <div class="card-corner-bottom">
        <span class="card-rank">${rawRank}</span>
        ${cornerSuit}
      </div>
    `;
  }

  return {
    normalizeSuit,
    getSuitSvg,
    getAceBodyHtml,
    getPipsGridHtml,
    getCourtFigureHtml,
    getJokerBodyHtml,
    generateCardInnerHtml,
    SUIT_PATHS,
    SUIT_COLORS
  };
});
