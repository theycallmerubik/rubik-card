/**
 * Shelem (شلم) Card Game - Core Game Logic & State Engine
 * Pure JavaScript, supports Node.js and Browser environments.
 * Standard 52-card Persian Shelem with 165 total points and bidding.
 */

(function (exports) {
  'use strict';

  const SUITS = ['S', 'H', 'D', 'C']; // Spades, Hearts, Diamonds, Clubs

  const SUIT_SYMBOLS = {
    S: '♠',
    H: '♥',
    D: '♦',
    C: '♣'
  };

  const SUIT_NAMES = {
    en: { S: 'Spades', H: 'Hearts', D: 'Diamonds', C: 'Clubs' },
    fa: { S: 'پیک', H: 'دل', D: 'خشت', C: 'گشنیز' }
  };

  const SUIT_COLORS = {
    S: 'black',
    H: 'red',
    D: 'red',
    C: 'black'
  };

  const RANK_LABELS = {
    14: 'A',
    13: 'K',
    12: 'Q',
    11: 'J',
    10: '10',
    9: '9',
    8: '8',
    7: '7',
    6: '6',
    5: '5',
    4: '4',
    3: '3',
    2: '2'
  };

  /**
   * Card points in Shelem:
   * Every hand/trick won has 5 points by default.
   * Bonus cards:
   * - 5s = 5 pts (4 x 5 = 20 pts)
   * - 10s = 10 pts (4 x 10 = 40 pts)
   * - Aces (14) = 10 pts (4 x 10 = 40 pts)
   * - Big Joker = 20 pts, Small Joker = 15 pts (35 pts total)
   * (Kings and other ranks = 0 bonus points)
   *
   * 12 played tricks x 5 = 60 default pts + 5 default pts for widow trick = 65 default trick pts.
   * Total round points without Jokers = 65 + 100 = 165 pts.
   * Total round points with 2 Jokers = 65 + 135 = 200 pts.
   */
  function getCardPoints(card) {
    if (!card) return 0;
    if (card.suit === 'JOKER') {
      return card.rank === 17 ? 20 : 15;
    }
    if (card.rank === 5) return 5;
    if (card.rank === 10 || card.rank === 14) return 10;
    return 0;
  }

  function isTrumpCard(card, trumpSuit) {
    if (!card) return false;
    return card.suit === 'JOKER' || card.suit === trumpSuit;
  }

  /**
   * Generates a 52-card standard deck, or 54-card deck with 2 Jokers.
   */
  function createDeck(withJokers = false) {
    const deck = [];
    for (const suit of SUITS) {
      for (let rank = 2; rank <= 14; rank++) {
        deck.push({
          id: `${suit}-${rank}`,
          suit,
          rank,
          label: RANK_LABELS[rank],
          symbol: SUIT_SYMBOLS[suit],
          color: SUIT_COLORS[suit],
          points: getCardPoints({ suit, rank })
        });
      }
    }

    if (withJokers) {
      // Big Joker (Red) - Highest Trump
      deck.push({
        id: 'JOKER-17',
        suit: 'JOKER',
        rank: 17,
        label: 'JOKER',
        symbol: '🃏',
        color: 'red',
        name: 'Big Joker',
        points: 20
      });
      // Small Joker (Black) - Second Highest Trump
      deck.push({
        id: 'JOKER-16',
        suit: 'JOKER',
        rank: 16,
        label: 'JOKER',
        symbol: '🃏',
        color: 'black',
        name: 'Small Joker',
        points: 15
      });
    }

    return deck;
  }

  /**
   * Fisher-Yates shuffle.
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
   * Deals 12 cards to each of the 4 players.
   * Without Jokers: 4 cards to the widow (48 + 4 = 52).
   * With Jokers: 6 cards to the widow (48 + 6 = 54).
   */
  function dealShelemCards(deck, withJokers = false) {
    const hands = [[], [], [], []];
    const widow = [];

    // Deal 12 to each player
    for (let p = 0; p < 4; p++) {
      for (let i = 0; i < 12; i++) {
        hands[p].push(deck[p * 12 + i]);
      }
    }

    // Remaining cards to widow
    const widowCount = withJokers ? 6 : 4;
    for (let i = 48; i < 48 + widowCount; i++) {
      widow.push(deck[i]);
    }

    return { hands, widow };
  }

  /**
   * Sorts cards by trump priority, then suit, then rank.
   */
  function sortHand(cards, trumpSuit = null) {
    const suitOrder = { S: 0, H: 1, C: 2, D: 3, JOKER: -1 };
    return [...cards].sort((a, b) => {
      const aIsTrump = isTrumpCard(a, trumpSuit);
      const bIsTrump = isTrumpCard(b, trumpSuit);

      if (aIsTrump && !bIsTrump) return -1;
      if (!aIsTrump && bIsTrump) return 1;

      if (aIsTrump && bIsTrump) {
        return b.rank - a.rank;
      }

      if (a.suit !== b.suit) {
        return (suitOrder[a.suit] ?? 9) - (suitOrder[b.suit] ?? 9);
      }
      return b.rank - a.rank;
    });
  }

  /**
   * Evaluates if a card is legally playable.
   */
  function isValidPlay(card, hand, currentTrick, trumpSuit = null) {
    if (!currentTrick || currentTrick.length === 0) {
      if (!trumpSuit && card && card.suit === 'JOKER') {
        return false; // Joker cannot be led as the very first card to determine Trump
      }
      return true; // Leading card
    }

    const firstItem = currentTrick[0];
    const leadCard = (firstItem && firstItem.card) ? firstItem.card : firstItem;
    if (!leadCard) return true;
    const ledSuit = leadCard.suit === 'JOKER' ? trumpSuit : leadCard.suit;

    if (ledSuit === trumpSuit) {
      // Trump led: player must follow trump or Joker if holding any
      const hasTrump = hand.some(c => isTrumpCard(c, trumpSuit));
      if (hasTrump) {
        return isTrumpCard(card, trumpSuit);
      }
      return true;
    }

    // Non-trump led: player must follow led suit if holding any
    const hasLedSuit = hand.some(c => c.suit === ledSuit);
    if (hasLedSuit) {
      return card.suit === ledSuit;
    }

    // Void in led suit: player can cut with trump/Joker or discard any card
    return true;
  }

  /**
   * Determines the winner of a completed trick.
   */
  function evaluateTrickWinner(trick, trumpSuit) {
    if (!trick || trick.length === 0) return null;

    const firstItem = trick[0];
    const leadCard = (firstItem && firstItem.card) ? firstItem.card : firstItem;
    const ledSuit = (leadCard && leadCard.suit === 'JOKER') ? trumpSuit : (leadCard ? leadCard.suit : null);
    let bestPlay = trick[0];
    let bestCard = (bestPlay && bestPlay.card) ? bestPlay.card : bestPlay;

    for (let i = 1; i < trick.length; i++) {
      const current = trick[i];
      const currentCard = (current && current.card) ? current.card : current;
      if (!currentCard || !bestCard) continue;

      const bestIsTrump = isTrumpCard(bestCard, trumpSuit);
      const currentIsTrump = isTrumpCard(currentCard, trumpSuit);

      if (currentIsTrump && !bestIsTrump) {
        bestPlay = current;
        bestCard = currentCard;
      } else if (currentIsTrump && bestIsTrump) {
        if (currentCard.rank > bestCard.rank) {
          bestPlay = current;
          bestCard = currentCard;
        }
      } else if (!currentIsTrump && !bestIsTrump) {
        if (currentCard.suit === ledSuit && currentCard.rank > bestCard.rank) {
          bestPlay = current;
          bestCard = currentCard;
        }
      }
    }

    return bestPlay.playerIndex !== undefined ? bestPlay.playerIndex : (trick.indexOf(bestPlay));
  }

  /**
   * Calculates points contained in a list of cards.
   */
  function calculateCardsPoints(cards) {
    return cards.reduce((sum, c) => sum + getCardPoints(c), 0);
  }

  /**
   * Estimates hand value for Shelem bot bidding.
   */
  function evaluateHandForBidding(hand) {
    // Group by suit
    const suitCounts = { S: 0, H: 0, D: 0, C: 0 };
    const suitPoints = { S: 0, H: 0, D: 0, C: 0 };
    const highCards = { S: 0, H: 0, D: 0, C: 0 };

    for (const card of hand) {
      suitCounts[card.suit]++;
      suitPoints[card.suit] += getCardPoints(card);
      if (card.rank >= 13) highCards[card.suit] += (card.rank === 14 ? 12 : 8);
    }

    // Find best potential trump suit
    let bestSuit = 'S';
    let bestScore = -1;

    for (const suit of SUITS) {
      const count = suitCounts[suit];
      const score = count * 7 + highCards[suit] + suitPoints[suit];
      if (score > bestScore) {
        bestScore = score;
        bestSuit = suit;
      }
    }

    // Estimate realistic points based on hand composition
    // Average hand = ~41 points. Strong hand = 80-120+ points with widow
    let basePower = 70;
    for (const card of hand) {
      if (card.rank === 14) basePower += 14;
      else if (card.rank === 13) basePower += 9;
      else if (card.rank === 12) basePower += 5;
      else if (card.rank === 11) basePower += 3;
      if (card.suit === bestSuit) basePower += 7;
    }

    return {
      bestSuit,
      estimatedPoints: Math.min(165, Math.floor(basePower * 0.85))
    };
  }

  /**
   * Bot decision for bidding phase.
   */
  function getBotBid(playerIndex, hand, currentHighBid, currentHighBidder) {
    const { estimatedPoints } = evaluateHandForBidding(hand);

    // If partner is already high bidder and bid is reasonable, bot can pass
    const partnerIndex = (playerIndex + 2) % 4;
    if (currentHighBidder === partnerIndex && currentHighBid >= 100) {
      if (estimatedPoints < currentHighBid + 15) {
        return { action: 'pass' };
      }
    }

    const minNextBid = currentHighBid === 0 ? 100 : currentHighBid + 5;

    // Check if hand supports bidding
    if (estimatedPoints >= minNextBid && minNextBid <= 145) {
      return { action: 'bid', amount: minNextBid };
    }

    return { action: 'pass' };
  }

  /**
   * Bot decision for choosing cards to discard to the widow (4 without Jokers, 6 with Jokers).
   */
  function getBotWidowDiscards(handCards, trumpSuit, count = 4) {
    // Never discard high trumps
    // Prefer discarding non-trump low cards (ranks 2,3,4,6,7,8,9)
    // If must discard points, only if safe
    const sorted = [...handCards].sort((a, b) => {
      const aIsTrump = a.suit === trumpSuit;
      const bIsTrump = b.suit === trumpSuit;

      if (aIsTrump && !bIsTrump) return 1;
      if (!aIsTrump && bIsTrump) return -1;

      // Between non-trumps: prefer keeping Aces and Kings
      if (a.rank !== b.rank) {
        return a.rank - b.rank; // lowest rank first
      }
      return getCardPoints(a) - getCardPoints(b);
    });

    // Pick first `count` cards from sorted
    const discards = sorted.slice(0, count);
    return discards;
  }

  /**
   * Bot decision for playing a card in a trick.
   */
  function getBotPlayCard(playerIndex, hand, currentTrick, trumpSuit, trickHistory) {
    const legalCards = hand.filter(card => isValidPlay(card, hand, currentTrick, trumpSuit));
    if (legalCards.length === 1) return legalCards[0];

    const partnerIndex = (playerIndex + 2) % 4;

    // 1. If leading
    if (!currentTrick || currentTrick.length === 0) {
      if (!trumpSuit) {
        // Hakem leading the very first card of the round to determine Trump!
        const evalResult = evaluateHandForBidding(hand);
        const bestSuit = evalResult.bestSuit;
        const suitCards = legalCards.filter(c => c.suit === bestSuit);
        if (suitCards.length > 0) {
          return suitCards.sort((a, b) => b.rank - a.rank)[0];
        }
        return legalCards[0];
      }

      // Lead an Ace if available
      const nonTrumpAces = legalCards.filter(c => c.rank === 14 && c.suit !== trumpSuit);
      if (nonTrumpAces.length > 0) return nonTrumpAces[0];

      // Or lead high trump to pull opponent trumps
      const trumps = legalCards.filter(c => c.suit === trumpSuit);
      if (trumps.length > 2) {
        return trumps.sort((a, b) => b.rank - a.rank)[0];
      }

      // Or lead lowest non-point card
      const lowZeroes = legalCards.filter(c => c.points === 0 && c.suit !== trumpSuit);
      if (lowZeroes.length > 0) {
        return lowZeroes.sort((a, b) => a.rank - b.rank)[0];
      }

      return legalCards[0];
    }

    // 2. Following or cutting
    const currentWinner = evaluateTrickWinner(currentTrick, trumpSuit);
    const partnerIsWinning = currentWinner === partnerIndex;

    if (partnerIsWinning) {
      // Feed points to partner if safe!
      const highPointCards = legalCards.filter(c => c.points > 0);
      if (highPointCards.length > 0 && currentTrick.length === 3) {
        // Last player to play and partner is winning: feed biggest point!
        return highPointCards.sort((a, b) => b.points - a.points)[0];
      }
      // Otherwise play lowest legal card
      return legalCards.sort((a, b) => a.rank - b.rank)[0];
    } else {
      // Opponent is currently winning
      const first = currentTrick[0];
      const leadCard = (first && first.card) ? first.card : first;
      const ledSuit = (leadCard && leadCard.suit === 'JOKER') ? trumpSuit : (leadCard ? leadCard.suit : null);

      // Can we beat the winning card?
      const winningCandidates = legalCards.filter(card => {
        const simTrick = [...currentTrick, { playerIndex, card }];
        return evaluateTrickWinner(simTrick, trumpSuit) === playerIndex;
      });

      if (winningCandidates.length > 0) {
        // Win with the lowest winning card
        return winningCandidates.sort((a, b) => a.rank - b.rank)[0];
      }

      // Cannot win: discard lowest 0-point card
      const zeroes = legalCards.filter(c => c.points === 0);
      if (zeroes.length > 0) {
        return zeroes.sort((a, b) => a.rank - b.rank)[0];
      }

      return legalCards.sort((a, b) => a.rank - b.rank)[0];
    }
  }

  // Export module
  exports.SUITS = SUITS;
  exports.SUIT_SYMBOLS = SUIT_SYMBOLS;
  exports.SUIT_NAMES = SUIT_NAMES;
  exports.SUIT_COLORS = SUIT_COLORS;
  exports.RANK_LABELS = RANK_LABELS;
  exports.getCardPoints = getCardPoints;
  exports.isTrumpCard = isTrumpCard;
  exports.createDeck = createDeck;
  exports.shuffleDeck = shuffleDeck;
  exports.dealShelemCards = dealShelemCards;
  exports.sortHand = sortHand;
  exports.isValidPlay = isValidPlay;
  exports.evaluateTrickWinner = evaluateTrickWinner;
  exports.calculateCardsPoints = calculateCardsPoints;
  exports.evaluateHandForBidding = evaluateHandForBidding;
  exports.getBotBid = getBotBid;
  exports.getBotWidowDiscards = getBotWidowDiscards;
  exports.getBotPlayCard = getBotPlayCard;

})(typeof exports !== 'undefined' ? exports : (window.ShelemLogic = {}));
