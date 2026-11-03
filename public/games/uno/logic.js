/**
 * UNO Card Game - Core Game Logic & State Engine
 * Pure JavaScript, supports Node.js and Browser environments.
 * Standard 108-card official UNO rules with smart Bot AI and points calculation.
 */

(function (exports) {
  'use strict';

  const COLORS = ['red', 'blue', 'green', 'yellow'];

  const COLOR_NAMES = {
    en: { red: 'Red', blue: 'Blue', green: 'Green', yellow: 'Yellow', wild: 'Wild' },
    fa: { red: 'قرمز', blue: 'آبی', green: 'سبز', yellow: 'زرد', wild: 'ویژه' }
  };

  const COLOR_HEX = {
    red: '#ef4444',
    blue: '#3b82f6',
    green: '#22c55e',
    yellow: '#eab308',
    wild: '#1e293b'
  };

  const VALUE_SYMBOLS = {
    skip: '⊘',
    reverse: '⇄',
    draw2: '+2',
    wild: 'W',
    wild4: '+4'
  };

  const VALUE_NAMES = {
    en: {
      skip: 'Skip',
      reverse: 'Reverse',
      draw2: 'Draw 2',
      wild: 'Wild',
      wild4: 'Wild Draw 4'
    },
    fa: {
      skip: 'رد نوبت',
      reverse: 'تغییر جهت',
      draw2: 'کارت +۲',
      wild: 'انتخاب رنگ',
      wild4: 'کارت +۴'
    }
  };

  /**
   * Generates a standard 108-card UNO deck:
   * - 76 Number cards (0: 1 per color, 1-9: 2 per color)
   * - 24 Action cards (Skip, Reverse, Draw Two: 2 per color)
   * - 8 Wild cards (4 Wild, 4 Wild Draw Four)
   */
  function createDeck() {
    const deck = [];
    let idCounter = 1;

    COLORS.forEach(color => {
      // One 0 per color
      deck.push({
        id: `card_${idCounter++}`,
        color,
        value: '0',
        type: 'number',
        points: 0
      });

      // Two 1-9 per color
      for (let num = 1; num <= 9; num++) {
        for (let i = 0; i < 2; i++) {
          deck.push({
            id: `card_${idCounter++}`,
            color,
            value: String(num),
            type: 'number',
            points: num
          });
        }
      }

      // Two Skip cards per color (20 pts)
      for (let i = 0; i < 2; i++) {
        deck.push({
          id: `card_${idCounter++}`,
          color,
          value: 'skip',
          type: 'action',
          points: 20
        });
      }

      // Two Reverse cards per color (20 pts)
      for (let i = 0; i < 2; i++) {
        deck.push({
          id: `card_${idCounter++}`,
          color,
          value: 'reverse',
          type: 'action',
          points: 20
        });
      }

      // Two Draw Two cards per color (20 pts)
      for (let i = 0; i < 2; i++) {
        deck.push({
          id: `card_${idCounter++}`,
          color,
          value: 'draw2',
          type: 'action',
          points: 20
        });
      }
    });

    // Four Wild cards (50 pts)
    for (let i = 0; i < 4; i++) {
      deck.push({
        id: `card_${idCounter++}`,
        color: 'wild',
        value: 'wild',
        type: 'wild',
        points: 50
      });
    }

    // Four Wild Draw 4 cards (50 pts)
    for (let i = 0; i < 4; i++) {
      deck.push({
        id: `card_${idCounter++}`,
        color: 'wild',
        value: 'wild4',
        type: 'wild',
        points: 50
      });
    }

    return deck;
  }

  /**
   * Fisher-Yates shuffle
   */
  function shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Deals 7 cards to each of the numPlayers players and starts the discard pile.
   */
  function dealUnoCards(deck, numPlayers = 4, cardsPerPlayer = 7) {
    const hands = [];
    for (let p = 0; p < numPlayers; p++) {
      hands.push([]);
    }

    let drawPile = [...deck];

    // Deal cardsPerPlayer to each player
    for (let i = 0; i < cardsPerPlayer; i++) {
      for (let p = 0; p < numPlayers; p++) {
        if (drawPile.length > 0) {
          hands[p].push(drawPile.pop());
        }
      }
    }

    // Flip top card for Discard Pile (must not be a wild card to start)
    const discardPile = [];
    let startCardIndex = -1;
    for (let i = drawPile.length - 1; i >= 0; i--) {
      if (drawPile[i].color !== 'wild' && drawPile[i].type === 'number') {
        startCardIndex = i;
        break;
      }
    }

    if (startCardIndex === -1) {
      startCardIndex = drawPile.length - 1;
    }

    const startCard = drawPile.splice(startCardIndex, 1)[0];
    discardPile.push(startCard);

    const activeColor = startCard.color === 'wild'
      ? COLORS[Math.floor(Math.random() * COLORS.length)]
      : startCard.color;

    return {
      hands,
      drawPile,
      discardPile,
      activeColor
    };
  }

  /**
   * Check if a card is legally playable against topCard and activeColor
   */
  function isValidPlay(card, topCard, activeColor, pendingDrawCount = 0) {
    if (!card || !topCard) return false;
    // When there is an active draw penalty stack, only +2 and +4 cards can be played to stack
    if (pendingDrawCount > 0) {
      return card.value === 'draw2' || card.value === 'wild4';
    }
    // Wild cards can always be played
    if (card.color === 'wild') return true;
    // Match current active color
    if (card.color === (activeColor || topCard.color)) return true;
    // Match value or action symbol
    if (card.value === topCard.value) return true;
    return false;
  }

  /**
   * Get all legally playable cards from a hand
   */
  function getLegalCards(hand, topCard, activeColor, pendingDrawCount = 0) {
    if (!Array.isArray(hand)) return [];
    return hand.filter(c => isValidPlay(c, topCard, activeColor, pendingDrawCount));
  }

  /**
   * Calculate point sum of cards in hand
   */
  function calculateHandPoints(hand) {
    if (!Array.isArray(hand)) return 0;
    return hand.reduce((sum, c) => sum + (c.points || 0), 0);
  }

  /**
   * Sort player hand: by color (red, blue, green, yellow, wild) then by value
   */
  function sortHand(hand) {
    if (!Array.isArray(hand)) return [];
    const colorOrder = { red: 0, blue: 1, green: 2, yellow: 3, wild: 4 };
    const valueOrder = {
      '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
      'skip': 10, 'reverse': 11, 'draw2': 12, 'wild': 13, 'wild4': 14
    };

    return [...hand].sort((a, b) => {
      const ca = colorOrder[a.color] !== undefined ? colorOrder[a.color] : 99;
      const cb = colorOrder[b.color] !== undefined ? colorOrder[b.color] : 99;
      if (ca !== cb) return ca - cb;
      const va = valueOrder[a.value] !== undefined ? valueOrder[a.value] : 99;
      const vb = valueOrder[b.value] !== undefined ? valueOrder[b.value] : 99;
      return va - vb;
    });
  }

  /**
   * Chooses the optimal color for a bot playing a Wild card.
   * Picks the color the bot has the most cards of in its remaining hand.
   */
  function getBotColorChoice(hand) {
    const counts = { red: 0, blue: 0, green: 0, yellow: 0 };
    if (Array.isArray(hand)) {
      hand.forEach(c => {
        if (counts[c.color] !== undefined) {
          counts[c.color]++;
        }
      });
    }

    let maxColor = 'red';
    let maxCount = -1;
    COLORS.forEach(col => {
      if (counts[col] > maxCount) {
        maxCount = counts[col];
        maxColor = col;
      }
    });

    return maxColor;
  }

  /**
   * Smart Bot AI decision maker
   */
  function getBotAction(hand, topCard, activeColor, options = {}) {
    const pendingDrawCount = options.pendingDrawCount || 0;
    const legalCards = getLegalCards(hand, topCard, activeColor, pendingDrawCount);

    if (legalCards.length === 0) {
      return { action: 'draw' };
    }

    // If there is an active penalty stack, defend immediately with +2 or +4!
    if (pendingDrawCount > 0) {
      const defenseCard = legalCards.find(c => c.value === 'draw2') || legalCards.find(c => c.value === 'wild4');
      if (defenseCard) {
        return {
          action: 'play',
          card: defenseCard,
          chosenColor: defenseCard.color === 'wild' ? getBotColorChoice(hand.filter(c => c.id !== defenseCard.id)) : defenseCard.color
        };
      }
      return { action: 'draw' };
    }

    const nextPlayerCardCount = options.nextPlayerCardCount || 7;
    const isDangerousOpponent = nextPlayerCardCount <= 2;

    // 1. If next player is about to win (1 or 2 cards left), prioritize offensive cards!
    if (isDangerousOpponent) {
      const attackCard = legalCards.find(c => c.value === 'draw2' || c.value === 'wild4' || c.value === 'skip');
      if (attackCard) {
        return {
          action: 'play',
          card: attackCard,
          chosenColor: attackCard.color === 'wild' ? getBotColorChoice(hand.filter(c => c.id !== attackCard.id)) : attackCard.color
        };
      }
      const reverseCard = legalCards.find(c => c.value === 'reverse');
      if (reverseCard) {
        return {
          action: 'play',
          card: reverseCard,
          chosenColor: reverseCard.color
        };
      }
    }

    // 2. Play normal color-matching cards (number or action) before Wilds
    const nonWildLegal = legalCards.filter(c => c.color !== 'wild');
    if (nonWildLegal.length > 0) {
      // If we have an action card of the active color, play it with good probability
      const actionCard = nonWildLegal.find(c => c.type === 'action');
      if (actionCard && (Math.random() < 0.65 || isDangerousOpponent)) {
        return {
          action: 'play',
          card: actionCard,
          chosenColor: actionCard.color
        };
      }

      // Try to match matching-number cards of another color to switch to bot's favored color
      const favoredColor = getBotColorChoice(hand);
      const colorSwitcher = nonWildLegal.find(c => c.color === favoredColor && c.color !== activeColor);
      if (colorSwitcher) {
        return {
          action: 'play',
          card: colorSwitcher,
          chosenColor: colorSwitcher.color
        };
      }

      // Prefer highest point number card to reduce hand risk
      nonWildLegal.sort((a, b) => b.points - a.points);
      const chosen = nonWildLegal[0];
      return {
        action: 'play',
        card: chosen,
        chosenColor: chosen.color
      };
    }

    // 3. Only wild cards remain: play one
    const wildCard = legalCards.find(c => c.color === 'wild');
    if (wildCard) {
      const remainingHand = hand.filter(c => c.id !== wildCard.id);
      return {
        action: 'play',
        card: wildCard,
        chosenColor: getBotColorChoice(remainingHand)
      };
    }

    return { action: 'draw' };
  }

  // Export module
  exports.COLORS = COLORS;
  exports.COLOR_NAMES = COLOR_NAMES;
  exports.COLOR_HEX = COLOR_HEX;
  exports.VALUE_SYMBOLS = VALUE_SYMBOLS;
  exports.VALUE_NAMES = VALUE_NAMES;
  exports.createDeck = createDeck;
  exports.shuffleDeck = shuffleDeck;
  exports.dealUnoCards = dealUnoCards;
  exports.isValidPlay = isValidPlay;
  exports.getLegalCards = getLegalCards;
  exports.calculateHandPoints = calculateHandPoints;
  exports.sortHand = sortHand;
  exports.getBotColorChoice = getBotColorChoice;
  exports.getBotAction = getBotAction;

})(typeof exports !== 'undefined' ? exports : (window.UnoLogic = {}));
