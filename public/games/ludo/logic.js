/**
 * Ludo (منچ / Ludo) - Pure Isomorphic Game Logic Engine
 * Supports 2, 3, and 4 players (missing players have empty yards).
 * Works seamlessly in Node.js and modern browsers.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.LudoLogic = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // =========================================================================
  // CONSTANTS & CONFIGURATION
  // =========================================================================
  const PLAYER_COLORS = {
    0: { id: 0, name: 'Red', fa: 'قرمز', hex: '#ef4444', light: '#fca5a5' },
    1: { id: 1, name: 'Green', fa: 'سبز', hex: '#22c55e', light: '#86efac' },
    2: { id: 2, name: 'Yellow', fa: 'زرد', hex: '#eab308', light: '#fde047' },
    3: { id: 3, name: 'Blue', fa: 'آبی', hex: '#3b82f6', light: '#93c5fd' }
  };

  // Start cell index on the 52-cell outer track for each color
  const START_TRACK_CELL = {
    0: 0,   // Red
    1: 13,  // Green
    2: 26,  // Yellow
    3: 39   // Blue
  };

  // Safe cells on the 52-cell track where tokens cannot be captured
  const SAFE_CELLS = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

  // Total steps to complete track before entering Home Run
  const TRACK_LENGTH = 52;
  const STEPS_BEFORE_HOME_RUN = 51; // steps 0 to 50 are on track
  const HOME_RUN_LENGTH = 5;        // steps 51 to 55 (indices 0 to 4)
  const GOAL_STEP = 56;             // exact step to finish

  // Coordinate mappings on 15x15 board grid (x: 0..14, y: 0..14)
  // 52-step perimeter track clockwise
  const TRACK_COORDINATES = [
    // Red arm going right (0 to 4)
    { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 },
    // Top arm going up (5 to 10)
    { x: 6, y: 5 }, { x: 6, y: 4 }, { x: 6, y: 3 }, { x: 6, y: 2 }, { x: 6, y: 1 }, { x: 6, y: 0 },
    // Top arm crest (11)
    { x: 7, y: 0 },
    // Top arm going down (12 to 17)
    { x: 8, y: 0 }, { x: 8, y: 1 }, { x: 8, y: 2 }, { x: 8, y: 3 }, { x: 8, y: 4 }, { x: 8, y: 5 },
    // Right arm going right (18 to 23)
    { x: 9, y: 6 }, { x: 10, y: 6 }, { x: 11, y: 6 }, { x: 12, y: 6 }, { x: 13, y: 6 }, { x: 14, y: 6 },
    // Right arm crest (24)
    { x: 14, y: 7 },
    // Right arm going left (25 to 30)
    { x: 14, y: 8 }, { x: 13, y: 8 }, { x: 12, y: 8 }, { x: 11, y: 8 }, { x: 10, y: 8 }, { x: 9, y: 8 },
    // Bottom arm going down (31 to 36)
    { x: 8, y: 9 }, { x: 8, y: 10 }, { x: 8, y: 11 }, { x: 8, y: 12 }, { x: 8, y: 13 }, { x: 8, y: 14 },
    // Bottom arm crest (37)
    { x: 7, y: 14 },
    // Bottom arm going up (38 to 43)
    { x: 6, y: 14 }, { x: 6, y: 13 }, { x: 6, y: 12 }, { x: 6, y: 11 }, { x: 6, y: 10 }, { x: 6, y: 9 },
    // Left arm going left (44 to 49)
    { x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }, { x: 2, y: 8 }, { x: 1, y: 8 }, { x: 0, y: 8 },
    // Left arm crest (50)
    { x: 0, y: 7 },
    // Return to start (51)
    { x: 0, y: 6 }
  ];

  // 5 Home Run coordinates for each player leading into the center (index 0 to 4)
  const HOME_RUN_COORDINATES = {
    0: [{ x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }],
    1: [{ x: 7, y: 1 }, { x: 7, y: 2 }, { x: 7, y: 3 }, { x: 7, y: 4 }, { x: 7, y: 5 }],
    2: [{ x: 13, y: 7 }, { x: 12, y: 7 }, { x: 11, y: 7 }, { x: 10, y: 7 }, { x: 9, y: 7 }],
    3: [{ x: 7, y: 13 }, { x: 7, y: 12 }, { x: 7, y: 11 }, { x: 7, y: 10 }, { x: 7, y: 9 }]
  };

  // 4 Yard Token Slot Coordinates (Inside 6x6 corner bases)
  const YARD_COORDINATES = {
    0: [{ x: 1.5, y: 1.5 }, { x: 3.5, y: 1.5 }, { x: 1.5, y: 3.5 }, { x: 3.5, y: 3.5 }], // Top-Left Red
    1: [{ x: 10.5, y: 1.5 }, { x: 12.5, y: 1.5 }, { x: 10.5, y: 3.5 }, { x: 12.5, y: 3.5 }], // Top-Right Green
    2: [{ x: 10.5, y: 10.5 }, { x: 12.5, y: 10.5 }, { x: 10.5, y: 12.5 }, { x: 12.5, y: 12.5 }], // Bottom-Right Yellow
    3: [{ x: 1.5, y: 10.5 }, { x: 3.5, y: 10.5 }, { x: 1.5, y: 12.5 }, { x: 3.5, y: 12.5 }]  // Bottom-Left Blue
  };

  // Center Goal coordinates for finished tokens
  const GOAL_COORDINATES = {
    0: { x: 6.2, y: 7 },   // Red Triangle Center
    1: { x: 7, y: 6.2 },   // Green Triangle Center
    2: { x: 7.8, y: 7 },   // Yellow Triangle Center
    3: { x: 7, y: 7.8 }    // Blue Triangle Center
  };

  // Active seats for each player count
  // In 2-player mode: Red (0) and Yellow (2) are diagonally opposite
  // In 3-player mode: Red (0), Green (1), and Yellow (2)
  // In 4-player mode: Red (0), Green (1), Yellow (2), Blue (3)
  function getActiveSeatsForPlayerCount(count) {
    if (count === 2) return [0, 2];
    if (count === 3) return [0, 1, 2];
    return [0, 1, 2, 3];
  }

  // =========================================================================
  // STATE INITIALIZATION
  // =========================================================================
  function createGame(options = {}) {
    const playerCount = Math.max(2, Math.min(4, parseInt(options.playerCount, 10) || 4));
    const activeSeats = getActiveSeatsForPlayerCount(playerCount);

    const players = {};
    activeSeats.forEach(colorId => {
      const pInfo = options.players && options.players[colorId] ? options.players[colorId] : {};
      players[colorId] = {
        id: colorId,
        colorHex: PLAYER_COLORS[colorId].hex,
        name: pInfo.name || PLAYER_COLORS[colorId].name,
        isBot: pInfo.isBot !== undefined ? pInfo.isBot : false,
        tokens: [
          { id: 0, state: 'YARD', step: -1 },
          { id: 1, state: 'YARD', step: -1 },
          { id: 2, state: 'YARD', step: -1 },
          { id: 3, state: 'YARD', step: -1 }
        ],
        finishedCount: 0,
        rank: null
      };
    });

    return {
      playerCount,
      activeSeats,
      players,
      currentTurnIndex: 0, // index in activeSeats
      activePlayer: activeSeats[0],
      phase: 'ROLL', // 'ROLL' | 'MOVE' | 'GAME_OVER'
      lastDice: null,
      consecutiveSixes: 0,
      winner: null,
      rankings: [],
      history: []
    };
  }

  // =========================================================================
  // CORE MOVE & RULES ENGINE
  // =========================================================================

  /**
   * Calculate global track index from relative step
   */
  function getGlobalTrackIndex(colorId, step) {
    if (step < 0 || step >= STEPS_BEFORE_HOME_RUN) return -1;
    return (START_TRACK_CELL[colorId] + step) % TRACK_LENGTH;
  }

  /**
   * Determine exact grid (x, y) coordinates for a token
   */
  function getTokenCoordinates(colorId, token) {
    if (token.state === 'YARD') {
      return YARD_COORDINATES[colorId][token.id];
    }
    if (token.state === 'TRACK') {
      const gIdx = getGlobalTrackIndex(colorId, token.step);
      return TRACK_COORDINATES[gIdx];
    }
    if (token.state === 'HOME_RUN') {
      const hrIdx = token.step - STEPS_BEFORE_HOME_RUN;
      return HOME_RUN_COORDINATES[colorId][hrIdx];
    }
    if (token.state === 'FINISHED') {
      return GOAL_COORDINATES[colorId];
    }
    return { x: 7, y: 7 };
  }

  /**
   * Check if a token can execute a move with a given dice roll
   */
  function getValidMoves(state, colorId, dice) {
    const player = state.players[colorId];
    if (!player || state.phase !== 'MOVE') return [];

    const validMoves = [];

    player.tokens.forEach(token => {
      // Finished tokens cannot move
      if (token.state === 'FINISHED') return;

      // 1. Moving out of Yard requires rolling a 6
      if (token.state === 'YARD') {
        if (dice === 6) {
          // Check if starting square already contains one of our own tokens
          const ownTokenOnStart = player.tokens.some(t => t.id !== token.id && t.state === 'TRACK' && t.step === 0);
          if (!ownTokenOnStart) {
            validMoves.push({
              tokenId: token.id,
              action: 'LEAVE_YARD',
              fromState: 'YARD',
              fromStep: -1,
              toState: 'TRACK',
              toStep: 0,
              trackIndex: START_TRACK_CELL[colorId],
              canCapture: checkCaptureAt(state, colorId, START_TRACK_CELL[colorId])
            });
          }
        }
        return;
      }

      // 2. Moving an active token on TRACK or HOME_RUN
      const nextStep = token.step + dice;

      // Cannot overshoot the goal (step 56 is exact goal)
      if (nextStep > GOAL_STEP) return;

      if (nextStep === GOAL_STEP) {
        // Exact finish!
        validMoves.push({
          tokenId: token.id,
          action: 'FINISH',
          fromState: token.state,
          fromStep: token.step,
          toState: 'FINISHED',
          toStep: GOAL_STEP,
          canCapture: false
        });
        return;
      }

      if (nextStep >= STEPS_BEFORE_HOME_RUN) {
        // Moving into or within HOME_RUN
        const hrIdx = nextStep - STEPS_BEFORE_HOME_RUN;
        // Check if our own token already occupies this home run slot
        const blockedByOwn = player.tokens.some(t => t.id !== token.id && t.state === 'HOME_RUN' && t.step === nextStep);
        if (!blockedByOwn) {
          validMoves.push({
            tokenId: token.id,
            action: 'MOVE_HOME_RUN',
            fromState: token.state,
            fromStep: token.step,
            toState: 'HOME_RUN',
            toStep: nextStep,
            canCapture: false
          });
        }
        return;
      }

      // Moving on the TRACK
      const targetTrackIndex = getGlobalTrackIndex(colorId, nextStep);
      // Check if blocked by our own token on target track square
      const blockedByOwn = player.tokens.some(t => t.id !== token.id && t.state === 'TRACK' && t.step === nextStep);
      if (!blockedByOwn) {
        const captureInfo = checkCaptureAt(state, colorId, targetTrackIndex);
        validMoves.push({
          tokenId: token.id,
          action: 'MOVE_TRACK',
          fromState: token.state,
          fromStep: token.step,
          toState: 'TRACK',
          toStep: nextStep,
          trackIndex: targetTrackIndex,
          canCapture: captureInfo
        });
      }
    });

    return validMoves;
  }

  /**
   * Check if landing on a target track index captures an opponent token
   */
  function checkCaptureAt(state, movingColorId, trackIndex) {
    if (SAFE_CELLS.has(trackIndex)) {
      return null; // Safe cell: no captures allowed
    }

    for (const seat of state.activeSeats) {
      if (seat === movingColorId) continue;
      const opp = state.players[seat];
      if (!opp) continue;

      for (const t of opp.tokens) {
        if (t.state === 'TRACK') {
          const oppTrackIdx = getGlobalTrackIndex(seat, t.step);
          if (oppTrackIdx === trackIndex) {
            return { capturedColor: seat, capturedTokenId: t.id };
          }
        }
      }
    }
    return null;
  }

  /**
   * Execute dice roll
   */
  function rollDice(state, fixedValue = null) {
    if (state.phase !== 'ROLL') {
      return { valid: false, error: 'Not in roll phase' };
    }

    const value = fixedValue !== null ? fixedValue : Math.floor(Math.random() * 6) + 1;
    state.lastDice = value;

    if (value === 6) {
      state.consecutiveSixes++;
    } else {
      state.consecutiveSixes = 0;
    }

    // Three consecutive 6s rule: player forfeits turn
    if (state.consecutiveSixes >= 3) {
      state.consecutiveSixes = 0;
      state.phase = 'ROLL';
      advanceTurn(state);
      return {
        valid: true,
        dice: value,
        threeSixesPenalty: true,
        validMoves: [],
        mustPass: true
      };
    }

    state.phase = 'MOVE';
    const moves = getValidMoves(state, state.activePlayer, value);

    if (moves.length === 0) {
      // No moves possible -> turn immediately passes
      state.phase = 'ROLL';
      advanceTurn(state);
      return {
        valid: true,
        dice: value,
        threeSixesPenalty: false,
        validMoves: [],
        mustPass: true
      };
    }

    return {
      valid: true,
      dice: value,
      threeSixesPenalty: false,
      validMoves: moves,
      mustPass: false
    };
  }

  /**
   * Execute token move
   */
  function moveToken(state, colorId, tokenId, fixedDice = null) {
    if (state.phase !== 'MOVE' || state.activePlayer !== colorId) {
      return { valid: false, error: 'Invalid move phase or not player turn' };
    }

    const dice = fixedDice !== null ? fixedDice : state.lastDice;
    const moves = getValidMoves(state, colorId, dice);
    const chosenMove = moves.find(m => m.tokenId === tokenId);

    if (!chosenMove) {
      return { valid: false, error: 'Token cannot make a valid move' };
    }

    const player = state.players[colorId];
    const token = player.tokens[tokenId];

    token.state = chosenMove.toState;
    token.step = chosenMove.toStep;

    let captured = null;
    let finished = false;

    // Handle captures
    if (chosenMove.canCapture) {
      const opp = state.players[chosenMove.canCapture.capturedColor];
      if (opp) {
        const oppToken = opp.tokens[chosenMove.canCapture.capturedTokenId];
        if (oppToken) {
          oppToken.state = 'YARD';
          oppToken.step = -1;
          captured = {
            color: chosenMove.canCapture.capturedColor,
            tokenId: chosenMove.canCapture.capturedTokenId
          };
        }
      }
    }

    // Check if token finished
    if (chosenMove.toState === 'FINISHED') {
      player.finishedCount++;
      finished = true;

      // Check if player has won / completed all 4 tokens
      if (player.finishedCount === 4 && player.rank === null) {
        state.rankings.push(colorId);
        player.rank = state.rankings.length;
        if (!state.winner) {
          state.winner = colorId;
        }
      }
    }

    // Check if match is fully completed
    const activeUnfinished = state.activeSeats.filter(seat => state.players[seat].finishedCount < 4);
    if (activeUnfinished.length <= 1) {
      state.phase = 'GAME_OVER';
      if (activeUnfinished.length === 1) {
        const lastSeat = activeUnfinished[0];
        if (!state.players[lastSeat].rank) {
          state.rankings.push(lastSeat);
          state.players[lastSeat].rank = state.rankings.length;
        }
      }
      return {
        valid: true,
        move: chosenMove,
        captured,
        finished,
        bonusRoll: false,
        gameOver: true,
        winner: state.winner
      };
    }

    // Bonus roll conditions:
    // 1. Rolled a 6
    // 2. Captured an opponent's token
    // 3. Brought a token to the FINISHED goal
    const bonusRoll = (dice === 6) || Boolean(captured) || finished;

    if (bonusRoll) {
      state.phase = 'ROLL';
      // Same active player keeps turn for bonus roll
    } else {
      state.phase = 'ROLL';
      advanceTurn(state);
    }

    return {
      valid: true,
      move: chosenMove,
      captured,
      finished,
      bonusRoll,
      gameOver: false,
      winner: null
    };
  }

  /**
   * Advance turn to the next unfinished player
   */
  function advanceTurn(state) {
    if (state.phase === 'GAME_OVER') return;

    state.lastDice = null;
    state.consecutiveSixes = 0;

    let loops = 0;
    do {
      state.currentTurnIndex = (state.currentTurnIndex + 1) % state.activeSeats.length;
      state.activePlayer = state.activeSeats[state.currentTurnIndex];
      loops++;
    } while (state.players[state.activePlayer].finishedCount === 4 && loops <= state.activeSeats.length);

    if (loops > state.activeSeats.length) {
      state.phase = 'GAME_OVER';
    }
  }

  // =========================================================================
  // SMART AI ENGINE (Easy, Medium, Master)
  // =========================================================================
  function getBotMove(state, botColorId, difficulty = 'medium') {
    const dice = state.lastDice;
    if (!dice) return null;

    const validMoves = getValidMoves(state, botColorId, dice);
    if (!validMoves || validMoves.length === 0) return null;
    if (validMoves.length === 1) return validMoves[0];

    if (difficulty === 'easy') {
      return validMoves[Math.floor(Math.random() * validMoves.length)];
    }

    // Score each move based on strategic priorities
    let bestScore = -Infinity;
    let bestMove = validMoves[0];

    validMoves.forEach(move => {
      let score = 0;

      // 1. Finishing a token is highest priority (+1000)
      if (move.toState === 'FINISHED') {
        score += 1000;
      }

      // 2. Capturing an opponent is huge (+600)
      if (move.canCapture) {
        score += 600;
      }

      // 3. Leaving yard onto board (+350)
      if (move.action === 'LEAVE_YARD') {
        score += 350;
      }

      // 4. Entering safe home run (+200)
      if (move.toState === 'HOME_RUN' && move.fromState === 'TRACK') {
        score += 200;
      }

      // 5. Landing on a safe cell (+120)
      if (move.toState === 'TRACK' && SAFE_CELLS.has(move.trackIndex)) {
        score += 120;
      }

      // 6. Forward progress
      score += move.toStep * 3;

      // Master difficulty: advanced threat detection & escaping
      if (difficulty === 'hard' || difficulty === 'master') {
        // If current position was under threat from an opponent behind (1..6 steps behind)
        if (move.fromState === 'TRACK' && !SAFE_CELLS.has(getGlobalTrackIndex(botColorId, move.fromStep))) {
          const fromTrackIdx = getGlobalTrackIndex(botColorId, move.fromStep);
          if (isCellUnderThreat(state, botColorId, fromTrackIdx)) {
            score += 180; // Escape threat!
          }
        }

        // Penalty if landing on an unsafe cell under immediate threat
        if (move.toState === 'TRACK' && !SAFE_CELLS.has(move.trackIndex)) {
          if (isCellUnderThreat(state, botColorId, move.trackIndex)) {
            score -= 150; // Dangerous move!
          }
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    });

    return bestMove;
  }

  /**
   * Helper: Check if a track index has an opponent token within 1..6 steps behind
   */
  function isCellUnderThreat(state, botColorId, targetTrackIndex) {
    for (const seat of state.activeSeats) {
      if (seat === botColorId) continue;
      const opp = state.players[seat];
      if (!opp) continue;

      for (const t of opp.tokens) {
        if (t.state === 'TRACK') {
          const oppIdx = getGlobalTrackIndex(seat, t.step);
          const distance = (targetTrackIndex - oppIdx + TRACK_LENGTH) % TRACK_LENGTH;
          if (distance >= 1 && distance <= 6) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // =========================================================================
  // PUBLIC EXPORTS
  // =========================================================================
  return {
    PLAYER_COLORS,
    START_TRACK_CELL,
    SAFE_CELLS,
    TRACK_LENGTH,
    STEPS_BEFORE_HOME_RUN,
    HOME_RUN_LENGTH,
    GOAL_STEP,
    TRACK_COORDINATES,
    HOME_RUN_COORDINATES,
    YARD_COORDINATES,
    GOAL_COORDINATES,
    getActiveSeatsForPlayerCount,
    createGame,
    getGlobalTrackIndex,
    getTokenCoordinates,
    getValidMoves,
    checkCaptureAt,
    rollDice,
    moveToken,
    getBotMove
  };
});
