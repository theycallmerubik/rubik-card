/**
 * Dots and Boxes (نقطه و خط) - Core Game Logic & AI Engine
 * Pure JavaScript, works seamlessly in Node.js and Browser environments.
 * Standard International Rules:
 * - 2-player turn-based strategy game played on a grid of dots.
 * - Players take turns joining two unjoined horizontally or vertically adjacent dots.
 * - When a player completes the 4th side of a 1x1 box, they claim it (+1 point) and MUST move again.
 * - The player with the most boxes when all are claimed wins.
 */

(function (exports) {
  'use strict';

  const P1 = 1; // Player 1 (Red / Ruby)
  const P2 = 2; // Player 2 (Blue / Sapphire)

  const DEFAULT_ROWS = 3; // 3x3 boxes = 4x4 dots
  const DEFAULT_COLS = 3;

  /**
   * Create an initial blank game state.
   * @param {number} rows - number of box rows (2 to 6)
   * @param {number} cols - number of box cols (2 to 6)
   */
  function createInitialState(rows = DEFAULT_ROWS, cols = DEFAULT_COLS) {
    const r = Math.max(2, Math.min(30, parseInt(rows, 10) || DEFAULT_ROWS));
    const c = Math.max(2, Math.min(30, parseInt(cols, 10) || DEFAULT_COLS));

    // hLines[r][c]: horizontal edges between dot(r, c) and dot(r, c+1)
    // Dimension: (r + 1) rows x c columns
    const hLines = Array.from({ length: r + 1 }, () => Array(c).fill(0));

    // vLines[r][c]: vertical edges between dot(r, c) and dot(r+1, c)
    // Dimension: r rows x (c + 1) columns
    const vLines = Array.from({ length: r }, () => Array(c + 1).fill(0));

    // boxes[r][c]: owner of completed 1x1 box at row r, col c
    // Dimension: r rows x c columns
    const boxes = Array.from({ length: r }, () => Array(c).fill(0));

    return {
      rows: r,
      cols: c,
      totalBoxes: r * c,
      hLines,
      vLines,
      boxes,
      turn: P1,
      scores: { [P1]: 0, [P2]: 0 },
      history: [],
      status: 'PLAYING', // 'PLAYING' or 'FINISHED'
      winner: null // null, P1, P2, or 'draw'
    };
  }

  /**
   * Deep clone a game state.
   */
  function cloneState(state) {
    return {
      rows: state.rows,
      cols: state.cols,
      totalBoxes: state.totalBoxes,
      hLines: state.hLines.map(row => [...row]),
      vLines: state.vLines.map(row => [...row]),
      boxes: state.boxes.map(row => [...row]),
      turn: state.turn,
      scores: { ...state.scores },
      history: state.history.map(h => ({
        type: h.type,
        r: h.r,
        c: h.c,
        player: h.player,
        completedBoxes: h.completedBoxes ? h.completedBoxes.map(b => ({ ...b })) : []
      })),
      status: state.status,
      winner: state.winner
    };
  }

  /**
   * Check if a specific move is valid and not yet filled.
   */
  function isValidMove(state, move) {
    if (!move || !move.type) return false;
    const { type, r, c } = move;
    if (type === 'h') {
      if (r < 0 || r > state.rows || c < 0 || c >= state.cols) return false;
      return state.hLines[r][c] === 0;
    }
    if (type === 'v') {
      if (r < 0 || r >= state.rows || c < 0 || c > state.cols) return false;
      return state.vLines[r][c] === 0;
    }
    return false;
  }

  /**
   * Get all remaining unplayed edges.
   */
  function getAvailableMoves(state) {
    const moves = [];
    if (state.status !== 'PLAYING') return moves;

    // Horizontal edges
    for (let r = 0; r <= state.rows; r++) {
      for (let c = 0; c < state.cols; c++) {
        if (state.hLines[r][c] === 0) {
          moves.push({ type: 'h', r, c });
        }
      }
    }

    // Vertical edges
    for (let r = 0; r < state.rows; r++) {
      for (let c = 0; c <= state.cols; c++) {
        if (state.vLines[r][c] === 0) {
          moves.push({ type: 'v', r, c });
        }
      }
    }

    return moves;
  }

  /**
   * Count how many sides of box (r, c) are currently filled (0 to 4).
   */
  function countBoxSides(state, r, c) {
    if (r < 0 || r >= state.rows || c < 0 || c >= state.cols) return 0;
    let count = 0;
    if (state.hLines[r][c] !== 0) count++;     // Top
    if (state.hLines[r + 1][c] !== 0) count++; // Bottom
    if (state.vLines[r][c] !== 0) count++;     // Left
    if (state.vLines[r][c + 1] !== 0) count++; // Right
    return count;
  }

  /**
   * Get the boxes that share this edge (up to 2 boxes).
   */
  function getBoxesForEdge(state, type, r, c) {
    const adjacent = [];
    if (type === 'h') {
      // Top adjacent box: (r - 1, c)
      if (r - 1 >= 0) adjacent.push({ r: r - 1, c });
      // Bottom adjacent box: (r, c)
      if (r < state.rows) adjacent.push({ r, c });
    } else if (type === 'v') {
      // Left adjacent box: (r, c - 1)
      if (c - 1 >= 0) adjacent.push({ r, c: c - 1 });
      // Right adjacent box: (r, c)
      if (c < state.cols) adjacent.push({ r, c });
    }
    return adjacent;
  }

  /**
   * Apply a move to the game state.
   * Completes any boxes enclosed by this move.
   * If at least 1 box is completed, player gets an extra turn!
   * @param {Object} state
   * @param {Object} move { type: 'h'|'v', r, c }
   * @returns {Object} result metadata { valid, completedBoxes, extraTurn, isGameOver, winner }
   */
  function applyMove(state, move) {
    if (!isValidMove(state, move)) {
      return { valid: false, message: 'Invalid or already taken line' };
    }

    const { type, r, c } = move;
    const player = state.turn;

    // Mark line
    if (type === 'h') {
      state.hLines[r][c] = player;
    } else {
      state.vLines[r][c] = player;
    }

    // Check adjacent boxes for completion
    const adjacentBoxes = getBoxesForEdge(state, type, r, c);
    const completedBoxes = [];

    for (const box of adjacentBoxes) {
      if (state.boxes[box.r][box.c] === 0 && countBoxSides(state, box.r, box.c) === 4) {
        state.boxes[box.r][box.c] = player;
        state.scores[player]++;
        completedBoxes.push({ r: box.r, c: box.c });
      }
    }

    const extraTurn = completedBoxes.length > 0;

    // Record in history for undo
    state.history.push({
      type,
      r,
      c,
      player,
      completedBoxes
    });

    // Check game over
    const totalClaimed = state.scores[P1] + state.scores[P2];
    if (totalClaimed >= state.totalBoxes) {
      state.status = 'FINISHED';
      if (state.scores[P1] > state.scores[P2]) {
        state.winner = P1;
      } else if (state.scores[P2] > state.scores[P1]) {
        state.winner = P2;
      } else {
        state.winner = 'draw';
      }
    } else if (!extraTurn) {
      // Switch turn only if no box was completed
      state.turn = state.turn === P1 ? P2 : P1;
    }

    return {
      valid: true,
      move,
      player,
      completedBoxes,
      extraTurn,
      isGameOver: state.status === 'FINISHED',
      winner: state.winner,
      scores: { ...state.scores }
    };
  }

  /**
   * Undo the last move.
   */
  function undoLastMove(state) {
    if (state.history.length === 0) return null;

    const last = state.history.pop();
    if (last.type === 'h') {
      state.hLines[last.r][last.c] = 0;
    } else {
      state.vLines[last.r][last.c] = 0;
    }

    if (last.completedBoxes && last.completedBoxes.length > 0) {
      for (const box of last.completedBoxes) {
        state.boxes[box.r][box.c] = 0;
        state.scores[last.player]--;
      }
    }

    state.turn = last.player;
    state.status = 'PLAYING';
    state.winner = null;

    return last;
  }

  /**
   * Classify move impact:
   * - 'capture': completes 1 or 2 boxes (always good!)
   * - 'safe': creates 1st or 2nd side of adjacent boxes (gives opponent 0 or 1 edge, safe!)
   * - 'giveaway': creates 3rd side of at least one adjacent box (gives opponent a box next turn!)
   */
  function evaluateMoveCategory(state, move) {
    const adjacent = getBoxesForEdge(state, move.type, move.r, move.c);
    let wouldComplete = 0;
    let wouldGiveaway = 0;

    for (const b of adjacent) {
      const currentSides = countBoxSides(state, b.r, b.c);
      if (currentSides === 3) {
        wouldComplete++;
      } else if (currentSides === 2) {
        wouldGiveaway++;
      }
    }

    if (wouldComplete > 0) return { category: 'capture', count: wouldComplete };
    if (wouldGiveaway > 0) return { category: 'giveaway', count: wouldGiveaway };
    return { category: 'safe', count: 0 };
  }

  /**
   * Helper to find chain length starting from a 3-sided box.
   */
  function getChainLengthFromBox(state, startR, startC) {
    const visitedBoxes = new Set();
    const queue = [{ r: startR, c: startC }];
    let count = 0;

    const testState = cloneState(state);

    while (queue.length > 0 && visitedBoxes.size < 40) {
      const curr = queue.shift();
      const key = `${curr.r},${curr.c}`;
      if (visitedBoxes.has(key)) continue;
      visitedBoxes.add(key);

      if (countBoxSides(testState, curr.r, curr.c) === 3) {
        count++;
        // Find the open edge and pretend to close it
        const openEdge = getOpenEdgeForBox(testState, curr.r, curr.c);
        if (openEdge) {
          applyMove(testState, openEdge);
          // Check adjacent neighbor
          const neighbors = getBoxesForEdge(testState, openEdge.type, openEdge.r, openEdge.c);
          for (const n of neighbors) {
            const nKey = `${n.r},${n.c}`;
            if (!visitedBoxes.has(nKey) && countBoxSides(testState, n.r, n.c) === 3) {
              queue.push(n);
            }
          }
        }
      }
    }
    return Math.max(1, count);
  }

  function getOpenEdgeForBox(state, r, c) {
    if (state.hLines[r][c] === 0) return { type: 'h', r, c };
    if (state.hLines[r + 1][c] === 0) return { type: 'h', r: r + 1, c };
    if (state.vLines[r][c] === 0) return { type: 'v', r, c };
    if (state.vLines[r][c + 1] === 0) return { type: 'v', r, c: c + 1 };
    return null;
  }

  /**
   * Smart AI Engine
   * Easy: Random moves, grabs box 50% of the time.
   * Medium: Always grabs boxes, avoids giving away 3rd side when safe moves exist.
   * Hard: Chains strategy, double-cross sacrifice when advantageous, minimizes giveaway size.
   */
  function chooseBotMove(state, difficulty = 'medium') {
    const available = getAvailableMoves(state);
    if (available.length === 0) return null;

    if (difficulty === 'easy') {
      // Grabs box sometimes, otherwise random
      const captures = available.filter(m => evaluateMoveCategory(state, m).category === 'capture');
      if (captures.length > 0 && Math.random() < 0.65) {
        return captures[Math.floor(Math.random() * captures.length)];
      }
      return available[Math.floor(Math.random() * available.length)];
    }

    // Categorize moves
    const captures = [];
    const safeMoves = [];
    const giveaways = [];

    for (const move of available) {
      const evalRes = evaluateMoveCategory(state, move);
      if (evalRes.category === 'capture') {
        captures.push({ move, count: evalRes.count });
      } else if (evalRes.category === 'safe') {
        safeMoves.push(move);
      } else {
        giveaways.push(move);
      }
    }

    // 1. If we can capture boxes:
    if (captures.length > 0) {
      if (difficulty === 'hard') {
        // Prefer captures that complete 2 boxes at once
        const doubleCaptures = captures.filter(c => c.count === 2);
        if (doubleCaptures.length > 0) {
          return doubleCaptures[0].move;
        }

        // Hard mode double-crossing: take the capturing move
        return captures[0].move;
      }
      // Medium mode: take any capturing move
      return captures[0].move;
    }

    // 2. If safe moves exist (creates only 1st or 2nd side of boxes):
    if (safeMoves.length > 0) {
      if (difficulty === 'hard') {
        // Prefer edges on the outer border (they form fewer future corridors)
        const borderMoves = safeMoves.filter(m => {
          if (m.type === 'h') return m.r === 0 || m.r === state.rows;
          if (m.type === 'v') return m.c === 0 || m.c === state.cols;
          return false;
        });
        if (borderMoves.length > 0 && Math.random() < 0.8) {
          return borderMoves[Math.floor(Math.random() * borderMoves.length)];
        }
      }
      return safeMoves[Math.floor(Math.random() * safeMoves.length)];
    }

    // 3. No safe moves exist: we are forced to give away boxes!
    // Hard mode: Give away the SMALLEST chain/corridor to minimize opponent's loot!
    if (difficulty === 'hard' && giveaways.length > 0) {
      let minChain = Infinity;
      let bestMove = giveaways[0];
      const candidates = giveaways.length > 15 
        ? giveaways.slice(0, 15) 
        : giveaways;

      for (const move of candidates) {
        const adjacent = getBoxesForEdge(state, move.type, move.r, move.c);
        let maxLootFromMove = 0;
        for (const b of adjacent) {
          if (countBoxSides(state, b.r, b.c) === 2) {
            const chainLen = getChainLengthFromBox(state, b.r, b.c);
            maxLootFromMove = Math.max(maxLootFromMove, chainLen);
          }
        }
        if (maxLootFromMove < minChain) {
          minChain = maxLootFromMove;
          bestMove = move;
        }
      }
      return bestMove;
    }

    // Fallback: pick any remaining giveaway
    return giveaways[Math.floor(Math.random() * giveaways.length)];
  }

  // Export module for both Node and Browser
  exports.P1 = P1;
  exports.P2 = P2;
  exports.DEFAULT_ROWS = DEFAULT_ROWS;
  exports.DEFAULT_COLS = DEFAULT_COLS;
  exports.createInitialState = createInitialState;
  exports.cloneState = cloneState;
  exports.isValidMove = isValidMove;
  exports.getAvailableMoves = getAvailableMoves;
  exports.countBoxSides = countBoxSides;
  exports.getBoxesForEdge = getBoxesForEdge;
  exports.applyMove = applyMove;
  exports.undoLastMove = undoLastMove;
  exports.evaluateMoveCategory = evaluateMoveCategory;
  exports.chooseBotMove = chooseBotMove;

})(typeof exports === 'undefined' ? (this.DotsAndBoxesLogic = {}) : exports);
