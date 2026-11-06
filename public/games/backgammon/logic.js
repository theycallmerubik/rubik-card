/**
 * Backgammon (تخته نرد) - Core Game Logic & AI Engine
 * Pure JavaScript, works seamlessly in Node.js and Browser environments.
 * Standard International and Persian Backgammon rules:
 * - 24 points board, 2 players: White (light, moves 24 -> 1) & Black (dark, moves 1 -> 24)
 * - 15 checkers per player
 * - Bar re-entry, hitting blots, point blocking (2+ checkers)
 * - Bearing off when all checkers are home (White: 1-6, Black: 19-24)
 * - Mars (Gammon) & Vish-Mars (Backgammon) win detection
 * - Pip count calculation
 * - Smart AI move generator with multi-die combinations
 */

(function (exports) {
  'use strict';

  const WHITE = 'w'; // Moves from 24 down to 1, home board 1-6
  const BLACK = 'b'; // Moves from 1 up to 24, home board 19-24

  const PLAYER_NAMES = {
    en: { w: 'White', b: 'Black' },
    fa: { w: 'سفید', b: 'سیاه' }
  };

  /**
   * Initial Board Setup (Point indices 1 to 24)
   * Positive numbers = White checkers
   * Negative numbers = Black checkers
   * Zero = Empty point
   */
  function getInitialBoard() {
    const points = new Array(25).fill(0); // 1-based index (1 to 24)
    // White: 2 on 24, 5 on 13, 3 on 8, 5 on 6
    points[24] = 2;
    points[13] = -5; // Black: 5 on 12 (from Black's perspective is 13 from White's perspective) -> let's standardise
    // Let's use strict standard global point numbering 1 to 24:
    // White moves 24 -> 1:
    //   White has 2 on 24 (+2)
    //   White has 5 on 13 (+5)
    //   White has 3 on 8  (+3)
    //   White has 5 on 6  (+5)
    // Black moves 1 -> 24:
    //   Black has 2 on 1  (-2)
    //   Black has 5 on 12 (-5)
    //   Black has 3 on 17 (-3)
    //   Black has 5 on 19 (-5)
    points[1]  = -2;
    points[6]  = 5;
    points[8]  = 3;
    points[12] = -5;
    points[13] = 5;
    points[17] = -3;
    points[19] = -5;
    points[24] = 2;

    return {
      points: points,
      bar: { w: 0, b: 0 },
      off: { w: 0, b: 0 }
    };
  }

  function cloneGameState(state) {
    return {
      points: [...state.points],
      bar: { ...state.bar },
      off: { ...state.off }
    };
  }

  /**
   * Roll two random dice (1-6)
   */
  function rollDice() {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    let moves = [];
    if (d1 === d2) {
      moves = [d1, d1, d1, d1]; // Doubles get 4 moves
    } else {
      moves = [d1, d2];
    }
    return {
      dice: [d1, d2],
      movesRemaining: moves
    };
  }

  /**
   * Pip count: total points needed to bear off all checkers
   */
  function calculatePipCount(state, color) {
    let pips = 0;
    if (color === WHITE) {
      // White moves towards 1 and then off (0). Point p has distance p
      pips += state.bar.w * 25;
      for (let p = 1; p <= 24; p++) {
        if (state.points[p] > 0) {
          pips += state.points[p] * p;
        }
      }
    } else {
      // Black moves towards 24 and then off (25). Point p has distance 25 - p
      pips += state.bar.b * 25;
      for (let p = 1; p <= 24; p++) {
        if (state.points[p] < 0) {
          pips += Math.abs(state.points[p]) * (25 - p);
        }
      }
    }
    return pips;
  }

  /**
   * Check if all checkers of a player are inside their home board (or already borne off)
   * White home board: points 1 to 6
   * Black home board: points 19 to 24
   */
  function canBearOff(state, color) {
    if (color === WHITE) {
      if (state.bar.w > 0) return false;
      for (let p = 7; p <= 24; p++) {
        if (state.points[p] > 0) return false;
      }
      return true;
    } else {
      if (state.bar.b > 0) return false;
      for (let p = 1; p <= 18; p++) {
        if (state.points[p] < 0) return false;
      }
      return true;
    }
  }

  /**
   * Check if a single step with a given die is legal from a starting position
   * `from`: 'bar' or number 1..24
   * `die`: 1..6
   */
  function isSingleMoveLegal(state, color, from, die) {
    const opp = color === WHITE ? BLACK : WHITE;

    if (from === 'bar') {
      if (color === WHITE && state.bar.w <= 0) return false;
      if (color === BLACK && state.bar.b <= 0) return false;

      const target = color === WHITE ? 25 - die : die;
      // Target blocked if opponent has 2 or more checkers
      if (color === WHITE && state.points[target] <= -2) return false;
      if (color === BLACK && state.points[target] >= 2) return false;

      return {
        from: 'bar',
        to: target,
        die: die,
        hit: (color === WHITE && state.points[target] === -1) ||
             (color === BLACK && state.points[target] === 1),
        bearOff: false
      };
    }

    // Must re-enter from bar first if any checkers on bar!
    if (color === WHITE && state.bar.w > 0) return false;
    if (color === BLACK && state.bar.b > 0) return false;

    // Must have own checker at `from`
    if (color === WHITE && state.points[from] <= 0) return false;
    if (color === BLACK && state.points[from] >= 0) return false;

    const target = color === WHITE ? from - die : from + die;

    // Check bearing off
    if (color === WHITE && target <= 0) {
      if (!canBearOff(state, WHITE)) return false;
      if (target === 0) {
        return { from, to: 'off', die, hit: false, bearOff: true };
      }
      // Target is < 0: can only bear off if no checkers on higher points in home board
      for (let p = from + 1; p <= 6; p++) {
        if (state.points[p] > 0) return false;
      }
      return { from, to: 'off', die, hit: false, bearOff: true };
    }

    if (color === BLACK && target >= 25) {
      if (!canBearOff(state, BLACK)) return false;
      if (target === 25) {
        return { from, to: 'off', die, hit: false, bearOff: true };
      }
      // Target is > 25: can only bear off if no checkers on lower points in home board (further from 25)
      for (let p = from - 1; p >= 19; p--) {
        if (state.points[p] < 0) return false;
      }
      return { from, to: 'off', die, hit: false, bearOff: true };
    }

    // Regular move onto board point
    if (color === WHITE && state.points[target] <= -2) return false;
    if (color === BLACK && state.points[target] >= 2) return false;

    return {
      from,
      to: target,
      die,
      hit: (color === WHITE && state.points[target] === -1) ||
           (color === BLACK && state.points[target] === 1),
      bearOff: false
    };
  }

  /**
   * Apply a single move to state in-place
   */
  function applySingleMove(state, color, move) {
    if (move.from === 'bar') {
      if (color === WHITE) state.bar.w--;
      else state.bar.b--;
    } else {
      if (color === WHITE) state.points[move.from]--;
      else state.points[move.from]++;
    }

    if (move.bearOff) {
      if (color === WHITE) state.off.w++;
      else state.off.b++;
    } else {
      // Hit opponent checker
      if (move.hit) {
        if (color === WHITE) {
          state.points[move.to] = 1; // replaces -1
          state.bar.b++;
        } else {
          state.points[move.to] = -1; // replaces 1
          state.bar.w++;
        }
      } else {
        if (color === WHITE) state.points[move.to]++;
        else state.points[move.to]--;
      }
    }
  }

  /**
   * Get all valid individual single moves available from current state given a set of unique dice values
   */
  function getPossibleSingleMoves(state, color, diceValues) {
    const moves = [];
    const uniqueDice = [...new Set(diceValues)];

    uniqueDice.forEach(die => {
      // Check bar first
      const hasBar = color === WHITE ? state.bar.w > 0 : state.bar.b > 0;
      if (hasBar) {
        const legal = isSingleMoveLegal(state, color, 'bar', die);
        if (legal) moves.push(legal);
        return;
      }

      // Check points 1..24
      for (let p = 1; p <= 24; p++) {
        const hasChecker = color === WHITE ? state.points[p] > 0 : state.points[p] < 0;
        if (hasChecker) {
          const legal = isSingleMoveLegal(state, color, p, die);
          if (legal) moves.push(legal);
        }
      }
    });

    return moves;
  }

  /**
   * Find all complete valid turns (sequences of single moves) using the remaining dice.
   * According to official rules:
   * 1. Player MUST use as many dice as legally possible (e.g. if can play 2 dice vs 1, must play 2).
   * 2. If can only play one die of two unequal dice, player must play the higher die if possible.
   */
  function getAllLegalTurns(state, color, dice) {
    const allPaths = [];

    function search(currentState, remainingDice, pathSoFar) {
      if (remainingDice.length === 0) {
        allPaths.push(pathSoFar);
        return;
      }

      const availableMoves = getPossibleSingleMoves(currentState, color, remainingDice);
      if (availableMoves.length === 0) {
        allPaths.push(pathSoFar);
        return;
      }

      for (const move of availableMoves) {
        const nextState = cloneGameState(currentState);
        applySingleMove(nextState, color, move);

        // Remove the die used from remaining dice
        const dieIndex = remainingDice.indexOf(move.die);
        const nextDice = [...remainingDice];
        nextDice.splice(dieIndex, 1);

        search(nextState, nextDice, [...pathSoFar, move]);
      }
    }

    search(state, [...dice], []);

    if (allPaths.length === 0) return [[]];

    // Find maximum length of moves used
    let maxLen = 0;
    allPaths.forEach(p => { if (p.length > maxLen) maxLen = p.length; });

    // Filter to paths with maximum length
    let bestPaths = allPaths.filter(p => p.length === maxLen);

    // Rule: If dice are unequal and only 1 die can be played, must play the higher die if possible
    if (maxLen === 1 && dice.length >= 2 && dice[0] !== dice[1]) {
      const higherDie = Math.max(...dice);
      const higherPaths = bestPaths.filter(p => p[0].die === higherDie);
      if (higherPaths.length > 0) {
        bestPaths = higherPaths;
      }
    }

    // Deduplicate identical paths (same sequence of moves)
    const uniqueMap = new Map();
    bestPaths.forEach(path => {
      const key = path.map(m => `${m.from}->${m.to}(${m.die})`).join('|');
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, path);
      }
    });

    return Array.from(uniqueMap.values());
  }

  /**
   * Check if game has ended
   * Outcome types:
   * - 'normal' (1 point): loser bore off at least 1 checker
   * - 'mars' / 'gammon' (2 points): loser bore off 0 checkers
   * - 'vish-mars' / 'backgammon' (3 points): loser bore off 0 checkers AND has a checker on bar or in winner's home board
   */
  function checkGameOver(state) {
    if (state.off.w >= 15) {
      let winType = 'normal';
      let points = 1;
      if (state.off.b === 0) {
        // Check for backgammon (Vish-Mars)
        let hasInOppHome = state.bar.b > 0;
        if (!hasInOppHome) {
          for (let p = 1; p <= 6; p++) {
            if (state.points[p] < 0) { hasInOppHome = true; break; }
          }
        }
        if (hasInOppHome) {
          winType = 'backgammon';
          points = 3;
        } else {
          winType = 'gammon';
          points = 2;
        }
      }
      return { gameOver: true, winner: WHITE, winType, points };
    }

    if (state.off.b >= 15) {
      let winType = 'normal';
      let points = 1;
      if (state.off.w === 0) {
        let hasInOppHome = state.bar.w > 0;
        if (!hasInOppHome) {
          for (let p = 19; p <= 24; p++) {
            if (state.points[p] > 0) { hasInOppHome = true; break; }
          }
        }
        if (hasInOppHome) {
          winType = 'backgammon';
          points = 3;
        } else {
          winType = 'gammon';
          points = 2;
        }
      }
      return { gameOver: true, winner: BLACK, winType, points };
    }

    return { gameOver: false, winner: null };
  }

  /**
   * AI Evaluation Function for Backgammon Board States
   * Higher score = better for `color`
   */
  function evaluateBoardForColor(state, color) {
    const opp = color === WHITE ? BLACK : WHITE;

    // 1. Off checkers count (huge weight)
    const ownOff = color === WHITE ? state.off.w : state.off.b;
    const oppOff = color === WHITE ? state.off.b : state.off.w;
    let score = (ownOff - oppOff) * 120;

    // 2. Pip count advantage (fewer pips is better)
    const ownPips = calculatePipCount(state, color);
    const oppPips = calculatePipCount(state, opp);
    score += (oppPips - ownPips) * 2.5;

    // 3. Opponent checkers on bar
    const oppOnBar = color === WHITE ? state.bar.b : state.bar.w;
    score += oppOnBar * 45;

    // 4. Own checkers on bar (bad)
    const ownOnBar = color === WHITE ? state.bar.w : state.bar.b;
    score -= ownOnBar * 50;

    // 5. Anchors / points made (2 or more checkers)
    let ownAnchors = 0;
    let oppAnchors = 0;
    let ownBlots = 0;
    let oppBlots = 0;

    for (let p = 1; p <= 24; p++) {
      const val = state.points[p];
      if (color === WHITE) {
        if (val >= 2) ownAnchors++;
        else if (val === 1) ownBlots++;
        else if (val <= -2) oppAnchors++;
        else if (val === -1) oppBlots++;
      } else {
        if (val <= -2) ownAnchors++;
        else if (val === -1) ownBlots++;
        else if (val >= 2) oppAnchors++;
        else if (val === 1) oppBlots++;
      }
    }

    score += ownAnchors * 12;
    score -= ownBlots * 18;
    score += oppBlots * 10;

    // 6. Home board strength (points 1-6 for White, 19-24 for Black)
    let homeBoardPoints = 0;
    if (color === WHITE) {
      for (let p = 1; p <= 6; p++) {
        if (state.points[p] >= 2) homeBoardPoints++;
      }
    } else {
      for (let p = 19; p <= 24; p++) {
        if (state.points[p] <= -2) homeBoardPoints++;
      }
    }
    score += homeBoardPoints * 15;

    return score;
  }

  /**
   * Choose Best Turn for AI Bot based on difficulty
   * difficulty: 'easy', 'medium', 'hard'
   */
  function chooseBotTurn(state, color, dice, difficulty = 'medium') {
    const allTurns = getAllLegalTurns(state, color, dice);
    if (!allTurns || allTurns.length === 0 || allTurns[0].length === 0) {
      return [];
    }

    if (difficulty === 'easy' && Math.random() < 0.4) {
      // Pick random legal turn occasionally
      return allTurns[Math.floor(Math.random() * allTurns.length)];
    }

    let bestTurn = allTurns[0];
    let bestScore = -Infinity;

    for (const turn of allTurns) {
      const simState = cloneGameState(state);
      for (const move of turn) {
        applySingleMove(simState, color, move);
      }

      let score = evaluateBoardForColor(simState, color);

      // Add a slight noise for non-hard
      if (difficulty === 'medium') {
        score += (Math.random() - 0.5) * 15;
      }

      if (score > bestScore) {
        bestScore = score;
        bestTurn = turn;
      }
    }

    return bestTurn;
  }

  // Export module for both Node and Browser
  exports.WHITE = WHITE;
  exports.BLACK = BLACK;
  exports.PLAYER_NAMES = PLAYER_NAMES;
  exports.getInitialBoard = getInitialBoard;
  exports.cloneGameState = cloneGameState;
  exports.rollDice = rollDice;
  exports.calculatePipCount = calculatePipCount;
  exports.canBearOff = canBearOff;
  exports.isSingleMoveLegal = isSingleMoveLegal;
  exports.applySingleMove = applySingleMove;
  exports.getPossibleSingleMoves = getPossibleSingleMoves;
  exports.getAllLegalTurns = getAllLegalTurns;
  exports.checkGameOver = checkGameOver;
  exports.evaluateBoardForColor = evaluateBoardForColor;
  exports.chooseBotTurn = chooseBotTurn;

})(typeof exports === 'undefined' ? (this.BackgammonLogic = {}) : exports);
