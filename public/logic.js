/**
 * Hokm Card Game - Core Game Logic & State Engine
 * Pure JavaScript, supports both Node.js and Browser environments.
 * Uses strictly UTF-8 characters for suits and card symbols.
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
   * Generates a 52-card standard deck.
   */
  function createDeck() {
    const deck = [];
    for (const suit of SUITS) {
      for (let rank = 2; rank <= 14; rank++) {
        deck.push({
          suit,
          rank,
          id: `${suit}${rank}`,
          symbol: SUIT_SYMBOLS[suit],
          label: RANK_LABELS[rank],
          color: SUIT_COLORS[suit]
        });
      }
    }
    return deck;
  }

  /**
   * Fisher-Yates array shuffle.
   */
  function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Sorts a player's hand neatly: grouped by suit, then descending by rank.
   * If hokmSuit is provided, hokm cards appear first.
   */
  function sortHand(hand, hokmSuit = null) {
    const suitOrder = hokmSuit
      ? [hokmSuit, ...SUITS.filter(s => s !== hokmSuit)]
      : ['S', 'H', 'C', 'D'];

    return [...hand].sort((a, b) => {
      const suitDiff = suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
      if (suitDiff !== 0) return suitDiff;
      return b.rank - a.rank; // Highest rank first
    });
  }

  /**
   * Determines which cards in a hand can legally be played.
   * In Hokm:
   * - If player leads, any card can be played.
   * - If suit was led: must follow suit if player holds any cards of that suit.
   * - If player has no cards of that suit: any card can be played (cut or discard).
   */
  function getValidMoves(hand, ledSuit) {
    if (!ledSuit) {
      return [...hand];
    }
    const matchingSuitCards = hand.filter(c => c.suit === ledSuit);
    if (matchingSuitCards.length > 0) {
      return matchingSuitCards;
    }
    return [...hand];
  }

  /**
   * Evaluates who wins a completed trick (4 played cards).
   * @param {Array<{seat: number, card: object}>} trick 
   * @param {string} hokmSuit 
   * @returns {{winnerSeat: number, winningCard: object}}
   */
  function evaluateTrickWinner(trick, hokmSuit) {
    if (!trick || trick.length === 0) return null;
    const ledSuit = trick[0].card.suit;

    // Filter trump cards played
    const trumpPlays = trick.filter(p => p.card.suit === hokmSuit);
    if (trumpPlays.length > 0) {
      // Highest trump wins
      let highest = trumpPlays[0];
      for (let i = 1; i < trumpPlays.length; i++) {
        if (trumpPlays[i].card.rank > highest.card.rank) {
          highest = trumpPlays[i];
        }
      }
      return { winnerSeat: highest.seat, winningCard: highest.card };
    }

    // No trumps: highest card of the led suit wins
    const ledPlays = trick.filter(p => p.card.suit === ledSuit);
    let highest = ledPlays[0];
    for (let i = 1; i < ledPlays.length; i++) {
      if (ledPlays[i].card.rank > highest.card.rank) {
        highest = ledPlays[i];
      }
    }
    return { winnerSeat: highest.seat, winningCard: highest.card };
  }

  /**
   * Evaluates current winning play during an ongoing trick (1..4 cards).
   */
  function getCurrentTrickLeader(trick, hokmSuit) {
    return evaluateTrickWinner(trick, hokmSuit);
  }

  /**
   * AI logic to choose the best Hokm suit from the initial 5 cards.
   */
  function chooseBestHokm(fiveCards) {
    const scores = { S: 0, H: 0, D: 0, C: 0 };
    for (const card of fiveCards) {
      // Weight cards: count + rank power (Ace=14 gives strong bonus)
      scores[card.suit] += 10 + (card.rank - 2);
    }
    let bestSuit = 'S';
    let maxScore = -1;
    for (const suit of SUITS) {
      if (scores[suit] > maxScore) {
        maxScore = scores[suit];
        bestSuit = suit;
      }
    }
    return bestSuit;
  }

  /**
   * Smart AI logic for bot playing a card.
   * @param {Array<object>} hand 
   * @param {Array<{seat: number, card: object}>} trick 
   * @param {string} hokmSuit 
   * @param {number} botSeat 
   */
  function chooseBotMove(hand, trick, hokmSuit, botSeat) {
    const partnerSeat = (botSeat + 2) % 4;
    const ledSuit = trick.length > 0 ? trick[0].card.suit : null;
    const validMoves = getValidMoves(hand, ledSuit);

    if (validMoves.length === 1) {
      return validMoves[0];
    }

    // 1. Bot is leading the trick
    if (!ledSuit) {
      // Check if bot has Ace of any non-trump or trump
      const aces = validMoves.filter(c => c.rank === 14);
      if (aces.length > 0) {
        // Prefer non-hokm Ace first to cash tricks, or trump Ace if strong
        const nonHokmAces = aces.filter(c => c.suit !== hokmSuit);
        if (nonHokmAces.length > 0) return nonHokmAces[0];
        return aces[0];
      }

      // Check if bot has King with partner likely having Ace or just a safe high card
      const kings = validMoves.filter(c => c.rank === 13);
      if (kings.length > 0) {
        return kings[0];
      }

      // Otherwise play lowest card of longest suit to avoid giving away control
      const suitCounts = {};
      SUITS.forEach(s => suitCounts[s] = 0);
      validMoves.forEach(c => suitCounts[c.suit]++);

      // Sort by longest non-hokm suit, then lowest rank
      const nonHokmMoves = validMoves.filter(c => c.suit !== hokmSuit);
      const candidates = nonHokmMoves.length > 0 ? nonHokmMoves : validMoves;

      candidates.sort((a, b) => {
        if (suitCounts[b.suit] !== suitCounts[a.suit]) {
          return suitCounts[b.suit] - suitCounts[a.suit];
        }
        return a.rank - b.rank; // lowest rank
      });

      return candidates[0];
    }

    // 2. Following suit (Bot has cards of ledSuit)
    const currentLeader = getCurrentTrickLeader(trick, hokmSuit);
    const partnerIsWinning = currentLeader && currentLeader.winnerSeat === partnerSeat;

    if (validMoves[0].suit === ledSuit) {
      // Must follow suit
      if (partnerIsWinning) {
        // Partner is winning: play lowest card to conserve high cards
        validMoves.sort((a, b) => a.rank - b.rank);
        return validMoves[0];
      } else {
        // Opponent is currently winning
        const highestSoFar = currentLeader.winningCard;
        // If current winning card is trump and ledSuit is not trump, we cannot win with ledSuit
        if (highestSoFar.suit === hokmSuit && ledSuit !== hokmSuit) {
          // Play lowest card
          validMoves.sort((a, b) => a.rank - b.rank);
          return validMoves[0];
        }

        // Winning cards in hand that can beat highest so far
        const winningCards = validMoves.filter(c => c.rank > highestSoFar.rank);
        if (winningCards.length > 0) {
          // Win with the lowest card that can beat it
          winningCards.sort((a, b) => a.rank - b.rank);
          return winningCards[0];
        } else {
          // Cannot win: play lowest card
          validMoves.sort((a, b) => a.rank - b.rank);
          return validMoves[0];
        }
      }
    }

    // 3. Out of suit! Can cut with Hokm or discard
    const trumps = validMoves.filter(c => c.suit === hokmSuit);
    const nonTrumps = validMoves.filter(c => c.suit !== hokmSuit);

    if (partnerIsWinning) {
      // Partner already winning: discard lowest non-trump card
      if (nonTrumps.length > 0) {
        nonTrumps.sort((a, b) => a.rank - b.rank);
        return nonTrumps[0];
      }
      // Only trumps left, play lowest
      trumps.sort((a, b) => a.rank - b.rank);
      return trumps[0];
    }

    // Opponent is winning
    if (trumps.length > 0) {
      const highestSoFar = currentLeader.winningCard;
      if (highestSoFar.suit === hokmSuit) {
        // Opponent cut with trump: can we overcut?
        const higherTrumps = trumps.filter(t => t.rank > highestSoFar.rank);
        if (higherTrumps.length > 0) {
          higherTrumps.sort((a, b) => a.rank - b.rank);
          return higherTrumps[0]; // Lowest overcut
        }
      } else {
        // Opponent did not play trump: cut with lowest trump!
        trumps.sort((a, b) => a.rank - b.rank);
        return trumps[0];
      }
    }

    // Cannot or decided not to cut: discard lowest non-trump
    if (nonTrumps.length > 0) {
      nonTrumps.sort((a, b) => a.rank - b.rank);
      return nonTrumps[0];
    }

    validMoves.sort((a, b) => a.rank - b.rank);
    return validMoves[0];
  }

  /**
   * Full Hokm Game Session Controller.
   */
  class HokmGame {
    constructor(options = {}) {
      this.targetScore = options.targetScore || 7; // Rounds to win game
      this.players = options.players || [
        { name: 'Player 1', isBot: false },
        { name: 'Bot 1', isBot: true },
        { name: 'Partner', isBot: true },
        { name: 'Bot 2', isBot: true }
      ];

      this.scores = [0, 0]; // Team 0 (Seats 0 & 2) vs Team 1 (Seats 1 & 3)
      this.currentRound = 0;
      this.hakem = null;
      this.hokmSuit = null;
      this.turn = null;
      this.phase = 'IDLE'; // IDLE, DETERMINING_HAKEM, DEAL_5, SELECT_HOKM, DEAL_REMAINING, PLAYING, ROUND_OVER, GAME_OVER
      this.hands = [[], [], [], []];
      this.trick = []; // [{ seat: number, card: object }]
      this.tricksWon = [0, 0]; // Team 0 vs Team 1 tricks in current round
      this.completedTricks = [];
      this.deck = [];
      this.determiningCards = []; // [{ seat, card }]
      this.lastRoundInfo = null;
    }

    /**
     * Start the entire game from the beginning.
     */
    startNewGame() {
      this.scores = [0, 0];
      this.currentRound = 0;
      this.lastRoundInfo = null;
      this.phase = 'DETERMINING_HAKEM';
      this.determiningCards = [];
      this.deck = shuffle(createDeck());
      this.hakem = null;
      this.hokmSuit = null;
      this.turn = null;
      this.hands = [[], [], [], []];
      this.trick = [];
      this.tricksWon = [0, 0];
      this.completedTricks = [];
    }

    /**
     * Step the Hakem determination process: deals 1 card at a time until an Ace appears.
     * Returns { seat, card, isAce, hakemFound }
     */
    stepDetermineHakem() {
      if (this.phase !== 'DETERMINING_HAKEM') return null;
      if (this.deck.length === 0) {
        this.deck = shuffle(createDeck());
      }
      const card = this.deck.pop();
      const seat = this.determiningCards.length % 4;
      const isAce = card.rank === 14;

      this.determiningCards.push({ seat, card });

      if (isAce) {
        this.hakem = seat;
        return { seat, card, isAce: true, hakem: seat };
      }

      return { seat, card, isAce: false, hakem: null };
    }

    /**
     * Completes Hakem determination and begins Round 1.
     */
    finishHakemDetermination(foundHakem) {
      this.hakem = foundHakem;
      this.startRound();
    }

    /**
     * Starts a new round: shuffles 52 cards, deals first 5 cards to each player.
     */
    startRound() {
      this.currentRound++;
      this.deck = shuffle(createDeck());
      this.hands = [[], [], [], []];
      this.trick = [];
      this.tricksWon = [0, 0];
      this.completedTricks = [];
      this.hokmSuit = null;

      // Deal first 5 cards to each player (or to Hakem first)
      for (let s = 0; s < 4; s++) {
        this.hands[s] = this.deck.splice(0, 5);
        this.hands[s] = sortHand(this.hands[s]);
      }

      this.phase = 'SELECT_HOKM';
      this.turn = this.hakem;
    }

    /**
     * Hakem selects Hokm suit.
     */
    selectHokm(suit) {
      if (this.phase !== 'SELECT_HOKM') return false;
      if (!SUITS.includes(suit)) return false;

      this.hokmSuit = suit;

      // Deal remaining 8 cards to each player (total 13 each)
      for (let s = 0; s < 4; s++) {
        const remaining = this.deck.splice(0, 8);
        this.hands[s].push(...remaining);
        this.hands[s] = sortHand(this.hands[s], this.hokmSuit);
      }

      this.phase = 'PLAYING';
      this.turn = this.hakem; // Hakem leads the first trick
      return true;
    }

    /**
     * Attempt to play a card from a player's hand.
     */
    playCard(seat, cardId) {
      if (this.phase !== 'PLAYING') {
        return { success: false, reason: 'Not in PLAYING phase' };
      }
      if (this.turn !== seat) {
        return { success: false, reason: 'Not your turn' };
      }

      const cardIndex = this.hands[seat].findIndex(c => c.id === cardId);
      if (cardIndex === -1) {
        return { success: false, reason: 'Card not in hand' };
      }

      const card = this.hands[seat][cardIndex];
      const ledSuit = this.trick.length > 0 ? this.trick[0].card.suit : null;
      const validMoves = getValidMoves(this.hands[seat], ledSuit);

      if (!validMoves.some(c => c.id === card.id)) {
        return { success: false, reason: 'Must follow suit' };
      }

      // Remove card from hand
      this.hands[seat].splice(cardIndex, 1);
      this.trick.push({ seat, card });

      // Check if trick is complete (4 cards played)
      if (this.trick.length === 4) {
        const trickResult = evaluateTrickWinner(this.trick, this.hokmSuit);
        const winnerSeat = trickResult.winnerSeat;
        const winnerTeam = winnerSeat % 2; // Team 0 or Team 1
        this.tricksWon[winnerTeam]++;

        const completedTrick = {
          cards: [...this.trick],
          winnerSeat,
          winnerTeam,
          winningCard: trickResult.winningCard
        };
        this.completedTricks.push(completedTrick);

        const currentTrick = [...this.trick];
        this.trick = []; // Clear for next trick

        // Check if round won (first team to 7 tricks)
        if (this.tricksWon[winnerTeam] >= 7) {
          return this.handleRoundEnd(winnerTeam, completedTrick, currentTrick, card, seat);
        }

        // Trick completed, next turn goes to trick winner
        this.turn = winnerSeat;

        return {
          success: true,
          trickComplete: true,
          playedCard: card,
          seat,
          winnerSeat,
          winnerTeam,
          winningCard: trickResult.winningCard,
          currentTrick,
          tricksWon: [...this.tricksWon],
          nextTurn: this.turn
        };
      }

      // Trick still in progress, move to next player clockwise
      this.turn = (seat + 1) % 4;

      return {
        success: true,
        trickComplete: false,
        playedCard: card,
        seat,
        nextTurn: this.turn
      };
    }

    /**
     * Resolves round end scoring: Kot, Hakem Kot, round victory.
     */
    handleRoundEnd(winnerTeam, completedTrick, currentTrick, card, seat) {
      const loserTeam = 1 - winnerTeam;
      const loserTricks = this.tricksWon[loserTeam];
      const hakemTeam = this.hakem % 2;

      let pointsAwarded = 1;
      let kotType = 'NORMAL'; // NORMAL, KOT, HAKEM_KOT

      if (loserTricks === 0) {
        if (winnerTeam === hakemTeam) {
          // Hakem's team won 7-0: KOT (2 points)
          pointsAwarded = 2;
          kotType = 'KOT';
        } else {
          // Opponent team won 7-0: HAKEM_KOT (3 points)
          pointsAwarded = 3;
          kotType = 'HAKEM_KOT';
        }
      }

      this.scores[winnerTeam] += pointsAwarded;

      const gameOver = this.scores[winnerTeam] >= this.targetScore;
      this.phase = gameOver ? 'GAME_OVER' : 'ROUND_OVER';

      // Determine next Hakem
      const oldHakem = this.hakem;
      let nextHakem = oldHakem;
      if (winnerTeam !== hakemTeam) {
        // Hakem passes clockwise to the next player
        nextHakem = (oldHakem + 1) % 4;
      }

      this.lastRoundInfo = {
        winnerTeam,
        loserTeam,
        pointsAwarded,
        kotType,
        tricksWon: [...this.tricksWon],
        scores: [...this.scores],
        gameOver,
        oldHakem,
        nextHakem
      };

      if (!gameOver) {
        this.hakem = nextHakem;
      }

      return {
        success: true,
        trickComplete: true,
        roundComplete: true,
        playedCard: card,
        seat,
        winnerSeat: completedTrick.winnerSeat,
        winnerTeam,
        winningCard: completedTrick.winningCard,
        currentTrick,
        tricksWon: [...this.tricksWon],
        roundInfo: this.lastRoundInfo,
        gameOver
      };
    }

    /**
     * Sanitized public state view for a specific player seat (hides other hands).
     */
    getStateForPlayer(seat) {
      return {
        phase: this.phase,
        scores: [...this.scores],
        targetScore: this.targetScore,
        currentRound: this.currentRound,
        hakem: this.hakem,
        hokmSuit: this.hokmSuit,
        turn: this.turn,
        mySeat: seat,
        myHand: seat !== null && seat !== undefined ? this.hands[seat] : [],
        handCounts: this.hands.map(h => h.length),
        trick: this.trick,
        tricksWon: [...this.tricksWon],
        players: this.players.map((p, idx) => ({
          seat: idx,
          name: p.name,
          isBot: p.isBot,
          team: idx % 2,
          isHakem: idx === this.hakem,
          isTurn: idx === this.turn,
          cardCount: this.hands[idx].length
        })),
        determiningCards: this.determiningCards,
        lastRoundInfo: this.lastRoundInfo,
        completedTricks: this.completedTricks
      };
    }

    getPublicState(seat) {
      return this.getStateForPlayer(seat);
    }
  }

  // Export module for Node.js and Browser
  exports.SUITS = SUITS;
  exports.SUIT_SYMBOLS = SUIT_SYMBOLS;
  exports.SUIT_NAMES = SUIT_NAMES;
  exports.SUIT_COLORS = SUIT_COLORS;
  exports.RANK_LABELS = RANK_LABELS;
  exports.createDeck = createDeck;
  exports.shuffle = shuffle;
  exports.sortHand = sortHand;
  exports.getValidMoves = getValidMoves;
  exports.evaluateTrickWinner = evaluateTrickWinner;
  exports.getCurrentTrickLeader = getCurrentTrickLeader;
  exports.chooseBestHokm = chooseBestHokm;
  exports.chooseBotMove = chooseBotMove;
  exports.HokmGame = HokmGame;

})(typeof exports === 'undefined' ? (this.HokmLogic = {}) : exports);
