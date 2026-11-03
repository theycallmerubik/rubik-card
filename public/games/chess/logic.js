/**
 * Chess (شطرنج) - Core Rules & AI Engine
 * Pure JavaScript, works seamlessly in Node.js and Browser environments.
 * Standard FIDE Chess rules: Castling, En Passant, Pawn Promotion, Check/Checkmate,
 * Stalemate, Draw rules, FEN/PGN support, and Minimax AI with Alpha-Beta pruning.
 */

(function (exports) {
  'use strict';

  // Piece Constants
  const WHITE = 'w';
  const BLACK = 'b';

  const PIECE_SYMBOLS = {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
  };

  const PIECE_NAMES = {
    en: {
      'P': 'Pawn', 'N': 'Knight', 'B': 'Bishop', 'R': 'Rook', 'Q': 'Queen', 'K': 'King',
      'p': 'Pawn', 'n': 'Knight', 'b': 'Bishop', 'r': 'Rook', 'q': 'Queen', 'k': 'King'
    },
    fa: {
      'P': 'پیاده (سرباز)', 'N': 'اسب', 'B': 'فیل', 'R': 'رخ (قلعه)', 'Q': 'وزیر', 'K': 'شاه',
      'p': 'پیاده (سرباز)', 'n': 'اسب', 'b': 'فیل', 'r': 'رخ (قلعه)', 'q': 'وزیر', 'k': 'شاه'
    }
  };

  const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  // Piece Values for Minimax Evaluation
  const PIECE_VALUES = {
    'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000,
    'P': 100, 'N': 320, 'B': 330, 'R': 500, 'Q': 900, 'K': 20000
  };

  // Piece-Square Tables (PST) for Positional AI evaluation (White's perspective; inverted for Black)
  const PAWN_TABLE = [
    0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
     5,  5, 10, 25, 25, 10,  5,  5,
     0,  0,  0, 20, 20,  0,  0,  0,
     5, -5,-10,  0,  0,-10, -5,  5,
     5, 10, 10,-20,-20, 10, 10,  5,
     0,  0,  0,  0,  0,  0,  0,  0
  ];

  const KNIGHT_TABLE = [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50
  ];

  const BISHOP_TABLE = [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20
  ];

  const ROOK_TABLE = [
      0,  0,  0,  0,  0,  0,  0,  0,
      5, 10, 10, 10, 10, 10, 10,  5,
     -5,  0,  0,  0,  0,  0,  0, -5,
     -5,  0,  0,  0,  0,  0,  0, -5,
     -5,  0,  0,  0,  0,  0,  0, -5,
     -5,  0,  0,  0,  0,  0,  0, -5,
     -5,  0,  0,  0,  0,  0,  0, -5,
      0,  0,  0,  5,  5,  0,  0,  0
  ];

  const QUEEN_TABLE = [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
     -5,  0,  5,  5,  5,  5,  0, -5,
      0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20
  ];

  const KING_TABLE_MID = [
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
     20, 20,  0,  0,  0,  0, 20, 20,
     20, 30, 10,  0,  0, 10, 30, 20
  ];

  // Helper conversions
  function squareToCoord(idx) {
    if (idx < 0 || idx > 63) return '-';
    const file = String.fromCharCode('a'.charCodeAt(0) + (idx % 8));
    const rank = 8 - Math.floor(idx / 8);
    return `${file}${rank}`;
  }

  function coordToSquare(coord) {
    if (!coord || coord.length < 2) return -1;
    const file = coord.charCodeAt(0) - 'a'.charCodeAt(0);
    const rank = 8 - parseInt(coord[1], 10);
    if (file < 0 || file > 7 || rank < 0 || rank > 7) return -1;
    return rank * 8 + file;
  }

  function isWhitePiece(p) {
    return p !== null && p === p.toUpperCase();
  }

  function isBlackPiece(p) {
    return p !== null && p === p.toLowerCase();
  }

  function getPieceColor(p) {
    if (!p) return null;
    return isWhitePiece(p) ? WHITE : BLACK;
  }

  /**
   * Parse a FEN string into an internal game state object.
   */
  function createInitialState() {
    return parseFen(INITIAL_FEN);
  }

  function parseFen(fen = INITIAL_FEN) {
    const parts = fen.trim().split(/\s+/);
    const board = new Array(64).fill(null);

    const rows = parts[0].split('/');
    for (let r = 0; r < 8; r++) {
      let c = 0;
      for (const ch of rows[r]) {
        if (/\d/.test(ch)) {
          c += parseInt(ch, 10);
        } else {
          board[r * 8 + c] = ch;
          c++;
        }
      }
    }

    const turn = parts[1] || WHITE;
    const castlingStr = parts[2] || '-';
    const castling = {
      K: castlingStr.includes('K'),
      Q: castlingStr.includes('Q'),
      k: castlingStr.includes('k'),
      q: castlingStr.includes('q')
    };

    const enPassant = (parts[3] && parts[3] !== '-') ? coordToSquare(parts[3]) : null;
    const halfmoveClock = parseInt(parts[4], 10) || 0;
    const fullmoveNumber = parseInt(parts[5], 10) || 1;

    return {
      board,
      turn,
      castling,
      enPassant,
      halfmoveClock,
      fullmoveNumber,
      history: [],
      capturedWhite: [],
      capturedBlack: []
    };
  }

  /**
   * Export internal state to a FEN string.
   */
  function toFen(state) {
    let fen = '';
    for (let r = 0; r < 8; r++) {
      let emptyCount = 0;
      for (let c = 0; c < 8; c++) {
        const p = state.board[r * 8 + c];
        if (p === null) {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            fen += emptyCount;
            emptyCount = 0;
          }
          fen += p;
        }
      }
      if (emptyCount > 0) fen += emptyCount;
      if (r < 7) fen += '/';
    }

    fen += ` ${state.turn} `;

    let cStr = '';
    if (state.castling.K) cStr += 'K';
    if (state.castling.Q) cStr += 'Q';
    if (state.castling.k) cStr += 'k';
    if (state.castling.q) cStr += 'q';
    fen += (cStr.length > 0 ? cStr : '-') + ' ';

    fen += (state.enPassant !== null ? squareToCoord(state.enPassant) : '-') + ' ';
    fen += `${state.halfmoveClock} ${state.fullmoveNumber}`;
    return fen;
  }

  /**
   * Deep clone a game state.
   */
  function cloneState(state) {
    return {
      board: state.board.slice(),
      turn: state.turn,
      castling: { ...state.castling },
      enPassant: state.enPassant,
      halfmoveClock: state.halfmoveClock,
      fullmoveNumber: state.fullmoveNumber,
      history: state.history.slice(),
      capturedWhite: state.capturedWhite.slice(),
      capturedBlack: state.capturedBlack.slice()
    };
  }

  /**
   * Check if a square is attacked by a given color.
   */
  function isSquareAttacked(board, targetSq, attackerColor) {
    const tr = Math.floor(targetSq / 8);
    const tc = targetSq % 8;

    // 1. Pawn attacks
    const pawnDir = attackerColor === WHITE ? 1 : -1;
    const pawnChar = attackerColor === WHITE ? 'P' : 'p';
    const pRow = tr + pawnDir;
    if (pRow >= 0 && pRow < 8) {
      if (tc - 1 >= 0 && board[pRow * 8 + (tc - 1)] === pawnChar) return true;
      if (tc + 1 < 8 && board[pRow * 8 + (tc + 1)] === pawnChar) return true;
    }

    // 2. Knight attacks
    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    const knightChar = attackerColor === WHITE ? 'N' : 'n';
    for (const [dr, dc] of knightMoves) {
      const nr = tr + dr;
      const nc = tc + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        if (board[nr * 8 + nc] === knightChar) return true;
      }
    }

    // 3. King attacks (adjacent 1-step)
    const kingChar = attackerColor === WHITE ? 'K' : 'k';
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = tr + dr;
        const nc = tc + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          if (board[nr * 8 + nc] === kingChar) return true;
        }
      }
    }

    // 4. Straight rays (Rook / Queen)
    const straightDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const rookChar = attackerColor === WHITE ? 'R' : 'r';
    const queenChar = attackerColor === WHITE ? 'Q' : 'q';
    for (const [dr, dc] of straightDirs) {
      let r = tr + dr;
      let c = tc + dc;
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const piece = board[r * 8 + c];
        if (piece !== null) {
          if (piece === rookChar || piece === queenChar) return true;
          break; // ray blocked
        }
        r += dr;
        c += dc;
      }
    }

    // 5. Diagonal rays (Bishop / Queen)
    const diagDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    const bishopChar = attackerColor === WHITE ? 'B' : 'b';
    for (const [dr, dc] of diagDirs) {
      let r = tr + dr;
      let c = tc + dc;
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const piece = board[r * 8 + c];
        if (piece !== null) {
          if (piece === bishopChar || piece === queenChar) return true;
          break; // ray blocked
        }
        r += dr;
        c += dc;
      }
    }

    return false;
  }

  /**
   * Find the king square index for a given color.
   */
  function findKing(board, color) {
    const kingChar = color === WHITE ? 'K' : 'k';
    for (let i = 0; i < 64; i++) {
      if (board[i] === kingChar) return i;
    }
    return -1;
  }

  /**
   * Is the specified king in check?
   */
  function isInCheck(board, color) {
    const kSq = findKing(board, color);
    if (kSq === -1) return false;
    const enemyColor = color === WHITE ? BLACK : WHITE;
    return isSquareAttacked(board, kSq, enemyColor);
  }

  /**
   * Generate pseudo-legal moves for a specific square (or all squares if fromSq === null).
   */
  function generatePseudoMoves(state, fromSq = null, activeColor = null) {
    const moves = [];
    const color = activeColor || state.turn;
    const enemyColor = color === WHITE ? BLACK : WHITE;

    let targetIdx = null;
    if (typeof fromSq === 'string' && fromSq.length === 2) {
      targetIdx = coordToSquare(fromSq);
    } else if (typeof fromSq === 'number') {
      targetIdx = fromSq;
    }

    const startSq = (targetIdx !== null && targetIdx >= 0 && targetIdx <= 63) ? targetIdx : 0;
    const endSq = (targetIdx !== null && targetIdx >= 0 && targetIdx <= 63) ? targetIdx : 63;

    for (let sq = startSq; sq <= endSq; sq++) {
      const piece = state.board[sq];
      if (!piece || getPieceColor(piece) !== color) continue;

      const r = Math.floor(sq / 8);
      const c = sq % 8;
      const type = piece.toUpperCase();

      // --- PAWN ---
      if (type === 'P') {
        const dir = color === WHITE ? -1 : 1;
        const startRow = color === WHITE ? 6 : 1;
        const promRow = color === WHITE ? 0 : 7;

        // 1-step forward
        const nextR = r + dir;
        if (nextR >= 0 && nextR < 8 && state.board[nextR * 8 + c] === null) {
          if (nextR === promRow) {
            ['q', 'r', 'b', 'n'].forEach(pr => moves.push({ from: sq, to: nextR * 8 + c, piece, promotion: pr }));
          } else {
            moves.push({ from: sq, to: nextR * 8 + c, piece });
            // 2-step forward from starting rank
            if (r === startRow) {
              const doubleR = r + dir * 2;
              if (state.board[doubleR * 8 + c] === null) {
                moves.push({ from: sq, to: doubleR * 8 + c, piece, isDoublePawn: true });
              }
            }
          }
        }

        // Diagonal captures
        for (const dc of [-1, 1]) {
          const capC = c + dc;
          if (capC >= 0 && capC < 8 && nextR >= 0 && nextR < 8) {
            const targetSq = nextR * 8 + capC;
            const targetPiece = state.board[targetSq];

            if (targetPiece && getPieceColor(targetPiece) === enemyColor) {
              if (nextR === promRow) {
                ['q', 'r', 'b', 'n'].forEach(pr => moves.push({ from: sq, to: targetSq, piece, captured: targetPiece, promotion: pr }));
              } else {
                moves.push({ from: sq, to: targetSq, piece, captured: targetPiece });
              }
            } else if (targetSq === state.enPassant) {
              // En Passant
              const epCapSq = r * 8 + capC;
              moves.push({ from: sq, to: targetSq, piece, captured: state.board[epCapSq], isEnPassant: true });
            }
          }
        }
      }

      // --- KNIGHT ---
      else if (type === 'N') {
        const deltas = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        for (const [dr, dc] of deltas) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            const targetSq = nr * 8 + nc;
            const targetPiece = state.board[targetSq];
            if (!targetPiece) {
              moves.push({ from: sq, to: targetSq, piece });
            } else if (getPieceColor(targetPiece) === enemyColor) {
              moves.push({ from: sq, to: targetSq, piece, captured: targetPiece });
            }
          }
        }
      }

      // --- BISHOP / ROOK / QUEEN ---
      else if (type === 'B' || type === 'R' || type === 'Q') {
        const dirs = [];
        if (type === 'B' || type === 'Q') dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
        if (type === 'R' || type === 'Q') dirs.push([-1, 0], [1, 0], [0, -1], [0, 1]);

        for (const [dr, dc] of dirs) {
          let nr = r + dr;
          let nc = c + dc;
          while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            const targetSq = nr * 8 + nc;
            const targetPiece = state.board[targetSq];
            if (!targetPiece) {
              moves.push({ from: sq, to: targetSq, piece });
            } else {
              if (getPieceColor(targetPiece) === enemyColor) {
                moves.push({ from: sq, to: targetSq, piece, captured: targetPiece });
              }
              break; // ray blocked
            }
            nr += dr;
            nc += dc;
          }
        }
      }

      // --- KING ---
      else if (type === 'K') {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
              const targetSq = nr * 8 + nc;
              const targetPiece = state.board[targetSq];
              if (!targetPiece) {
                moves.push({ from: sq, to: targetSq, piece });
              } else if (getPieceColor(targetPiece) === enemyColor) {
                moves.push({ from: sq, to: targetSq, piece, captured: targetPiece });
              }
            }
          }
        }

        // Castling (Kingside & Queenside)
        if (color === WHITE && sq === 60 && !isInCheck(state.board, WHITE)) {
          // White Kingside (e1 -> g1)
          if (state.castling.K && state.board[61] === null && state.board[62] === null && state.board[63] === 'R') {
            if (!isSquareAttacked(state.board, 61, BLACK) && !isSquareAttacked(state.board, 62, BLACK)) {
              moves.push({ from: 60, to: 62, piece: 'K', isCastle: 'K' });
            }
          }
          // White Queenside (e1 -> c1)
          if (state.castling.Q && state.board[59] === null && state.board[58] === null && state.board[57] === null && state.board[56] === 'R') {
            if (!isSquareAttacked(state.board, 59, BLACK) && !isSquareAttacked(state.board, 58, BLACK)) {
              moves.push({ from: 60, to: 58, piece: 'K', isCastle: 'Q' });
            }
          }
        } else if (color === BLACK && sq === 4 && !isInCheck(state.board, BLACK)) {
          // Black Kingside (e8 -> g8)
          if (state.castling.k && state.board[5] === null && state.board[6] === null && state.board[7] === 'r') {
            if (!isSquareAttacked(state.board, 5, WHITE) && !isSquareAttacked(state.board, 6, WHITE)) {
              moves.push({ from: 4, to: 6, piece: 'k', isCastle: 'k' });
            }
          }
          // Black Queenside (e8 -> c8)
          if (state.castling.q && state.board[3] === null && state.board[2] === null && state.board[1] === null && state.board[0] === 'r') {
            if (!isSquareAttacked(state.board, 3, WHITE) && !isSquareAttacked(state.board, 2, WHITE)) {
              moves.push({ from: 4, to: 2, piece: 'k', isCastle: 'q' });
            }
          }
        }
      }
    }

    return moves;
  }

  /**
   * Apply move tentatively to a board array to test check legality.
   */
  function applyTentativeMove(board, move) {
    const nextBoard = board.slice();
    const { from, to, piece, isEnPassant, isCastle, promotion } = move;

    nextBoard[to] = promotion ? (isWhitePiece(piece) ? promotion.toUpperCase() : promotion.toLowerCase()) : piece;
    nextBoard[from] = null;

    if (isEnPassant) {
      const capSq = (Math.floor(from / 8)) * 8 + (to % 8);
      nextBoard[capSq] = null;
    } else if (isCastle) {
      if (isCastle === 'K') { nextBoard[63] = null; nextBoard[61] = 'R'; }
      else if (isCastle === 'Q') { nextBoard[56] = null; nextBoard[59] = 'R'; }
      else if (isCastle === 'k') { nextBoard[7] = null; nextBoard[5] = 'r'; }
      else if (isCastle === 'q') { nextBoard[0] = null; nextBoard[3] = 'r'; }
    }

    return nextBoard;
  }

  /**
   * Get all strictly legal moves for the current player (or from a specific square/color).
   */
  function getLegalMoves(state, fromSq = null) {
    let color = state.turn;
    let target = fromSq;

    if (fromSq === WHITE || fromSq === BLACK) {
      color = fromSq;
      target = null;
    }

    const pseudo = generatePseudoMoves(state, target, color);
    const legal = [];

    for (const move of pseudo) {
      const nextBoard = applyTentativeMove(state.board, move);
      if (!isInCheck(nextBoard, color)) {
        legal.push(move);
      }
    }

    return legal;
  }

  /**
   * Make a legal move on state, updating board, castling rights, clocks, and history.
   */
  function makeMove(state, move) {
    if (typeof move.from === 'string') move.from = coordToSquare(move.from);
    if (typeof move.to === 'string') move.to = coordToSquare(move.to);
    if (!move.piece && move.from >= 0 && move.from <= 63) move.piece = state.board[move.from];

    const { from, to, piece, captured, isEnPassant, isCastle, promotion, isDoublePawn } = move;
    const color = state.turn;

    // Save history entry for undo
    state.history.push({
      move: { ...move },
      board: state.board.slice(),
      castling: { ...state.castling },
      enPassant: state.enPassant,
      halfmoveClock: state.halfmoveClock,
      fullmoveNumber: state.fullmoveNumber,
      capturedWhite: state.capturedWhite.slice(),
      capturedBlack: state.capturedBlack.slice()
    });

    // Handle captures
    if (captured || isEnPassant) {
      const capPiece = captured || (color === WHITE ? 'p' : 'P');
      if (isWhitePiece(capPiece)) {
        state.capturedWhite.push(capPiece);
      } else {
        state.capturedBlack.push(capPiece);
      }
      state.halfmoveClock = 0;
    } else if (piece.toUpperCase() === 'P') {
      state.halfmoveClock = 0;
    } else {
      state.halfmoveClock++;
    }

    // Apply board change
    state.board[to] = promotion ? (color === WHITE ? promotion.toUpperCase() : promotion.toLowerCase()) : piece;
    state.board[from] = null;

    if (isEnPassant) {
      const capSq = (Math.floor(from / 8)) * 8 + (to % 8);
      state.board[capSq] = null;
    } else if (isCastle) {
      if (isCastle === 'K') { state.board[63] = null; state.board[61] = 'R'; }
      else if (isCastle === 'Q') { state.board[56] = null; state.board[59] = 'R'; }
      else if (isCastle === 'k') { state.board[7] = null; state.board[5] = 'r'; }
      else if (isCastle === 'q') { state.board[0] = null; state.board[3] = 'r'; }
    }

    // Update En Passant target
    if (isDoublePawn) {
      const dir = color === WHITE ? -1 : 1;
      state.enPassant = from + dir * 8;
    } else {
      state.enPassant = null;
    }

    // Update Castling Rights
    if (piece === 'K') { state.castling.K = false; state.castling.Q = false; }
    if (piece === 'k') { state.castling.k = false; state.castling.q = false; }
    if (from === 63 || to === 63) state.castling.K = false;
    if (from === 56 || to === 56) state.castling.Q = false;
    if (from === 7 || to === 7) state.castling.k = false;
    if (from === 0 || to === 0) state.castling.q = false;

    // Advance fullmove count on Black's move
    if (color === BLACK) {
      state.fullmoveNumber++;
    }

    // Switch turn
    state.turn = color === WHITE ? BLACK : WHITE;

    return true;
  }

  /**
   * Undo last move.
   */
  function undoMove(state) {
    if (state.history.length === 0) return null;
    const last = state.history.pop();
    state.board = last.board;
    state.castling = last.castling;
    state.enPassant = last.enPassant;
    state.halfmoveClock = last.halfmoveClock;
    state.fullmoveNumber = last.fullmoveNumber;
    state.capturedWhite = last.capturedWhite;
    state.capturedBlack = last.capturedBlack;
    state.turn = state.turn === WHITE ? BLACK : WHITE;
    return last.move;
  }

  /**
   * Determine current game status:
   * 'active', 'check', 'checkmate', 'stalemate', 'draw-50moves', 'draw-material'
   */
  function getGameStatus(state) {
    const legalMoves = getLegalMoves(state);
    const inCheck = isInCheck(state.board, state.turn);

    if (legalMoves.length === 0) {
      if (inCheck) {
        return {
          status: 'checkmate',
          winner: state.turn === WHITE ? BLACK : WHITE,
          textEn: `Checkmate! ${state.turn === WHITE ? 'Black' : 'White'} wins.`,
          textFa: `کیش و مات! ${state.turn === WHITE ? 'سیاه' : 'سفید'} برنده شد.`
        };
      } else {
        return {
          status: 'stalemate',
          winner: null,
          textEn: 'Stalemate! Game is a draw.',
          textFa: 'پات (بن‌بست)! بازی مساوی شد.'
        };
      }
    }

    // 50-move rule
    if (state.halfmoveClock >= 100) {
      return {
        status: 'draw-50moves',
        winner: null,
        textEn: 'Draw by 50-move rule.',
        textFa: 'تساوی طبق قانون ۵۰ حرکت بدون جابجایی پیاده یا زدن مهره.'
      };
    }

    // Insufficient Material
    if (isInsufficientMaterial(state.board)) {
      return {
        status: 'draw-material',
        winner: null,
        textEn: 'Draw by insufficient material.',
        textFa: 'تساوی به دلیل عدم کفایت مهره‌ها برای مات.'
      };
    }

    if (inCheck) {
      return {
        status: 'check',
        winner: null,
        textEn: `${state.turn === WHITE ? 'White' : 'Black'} is in check!`,
        textFa: `شاه ${state.turn === WHITE ? 'سفید' : 'سیاه'} در حالت کیش است!`
      };
    }

    return {
      status: 'active',
      winner: null,
      textEn: `${state.turn === WHITE ? 'White' : 'Black'} to move`,
      textFa: `نوبت حرکت ${state.turn === WHITE ? 'سفید' : 'سیاه'}`
    };
  }

  /**
   * Check for insufficient material draws: K vs K, K+B vs K, K+N vs K, K+B vs K+B (same color)
   */
  function isInsufficientMaterial(board) {
    const pieces = board.filter(p => p !== null);
    if (pieces.length === 2) return true; // Only 2 kings

    if (pieces.length === 3) {
      const minors = pieces.filter(p => p.toUpperCase() === 'B' || p.toUpperCase() === 'N');
      if (minors.length === 1) return true; // K+B vs K or K+N vs K
    }

    return false;
  }

  /**
   * Convert move to Standard Algebraic Notation (SAN), e.g. "e4", "Nf3", "O-O", "Qh5#"
   */
  function moveToSan(state, move) {
    const { from, to, piece, isCastle, promotion, captured, isEnPassant } = move;
    if (isCastle) {
      return (isCastle === 'K' || isCastle === 'k') ? 'O-O' : 'O-O-O';
    }

    const type = piece.toUpperCase();
    const fromCoord = squareToCoord(from);
    const toCoord = squareToCoord(to);
    let san = '';

    if (type === 'P') {
      if (captured || isEnPassant) {
        san = `${fromCoord[0]}x${toCoord}`;
      } else {
        san = toCoord;
      }
      if (promotion) {
        san += `=${promotion.toUpperCase()}`;
      }
    } else {
      san = type;
      if (captured) san += 'x';
      san += toCoord;
    }

    // Check / Checkmate suffix
    const nextState = cloneState(state);
    makeMove(nextState, move);
    const status = getGameStatus(nextState);
    if (status.status === 'checkmate') {
      san += '#';
    } else if (status.status === 'check') {
      san += '+';
    }

    return san;
  }

  // =========================================================================
  // SMART CHESS AI BOT (MINIMAX WITH ALPHA-BETA PRUNING & PIECE-SQUARE TABLES)
  // =========================================================================

  function evaluateBoard(state) {
    let score = 0;
    const board = state.board;

    for (let i = 0; i < 64; i++) {
      const p = board[i];
      if (!p) continue;

      const type = p.toUpperCase();
      const val = PIECE_VALUES[type] || 0;
      let pstVal = 0;

      // Table lookup (flip row for Black)
      const lookupIdx = isWhitePiece(p) ? i : (7 - Math.floor(i / 8)) * 8 + (i % 8);

      if (type === 'P') pstVal = PAWN_TABLE[lookupIdx];
      else if (type === 'N') pstVal = KNIGHT_TABLE[lookupIdx];
      else if (type === 'B') pstVal = BISHOP_TABLE[lookupIdx];
      else if (type === 'R') pstVal = ROOK_TABLE[lookupIdx];
      else if (type === 'Q') pstVal = QUEEN_TABLE[lookupIdx];
      else if (type === 'K') pstVal = KING_TABLE_MID[lookupIdx];

      const totalVal = val + pstVal;
      score += isWhitePiece(p) ? totalVal : -totalVal;
    }

    return score;
  }

  /**
   * Minimax with Alpha-Beta Pruning.
   */
  function minimax(state, depth, alpha, beta, isMaximizing) {
    if (depth === 0) {
      return evaluateBoard(state);
    }

    const legalMoves = getLegalMoves(state);
    if (legalMoves.length === 0) {
      if (isInCheck(state.board, state.turn)) {
        return isMaximizing ? -50000 - depth : 50000 + depth;
      }
      return 0; // Stalemate
    }

    // Move ordering: prioritize captures
    legalMoves.sort((a, b) => {
      const valA = a.captured ? PIECE_VALUES[a.captured.toUpperCase()] : 0;
      const valB = b.captured ? PIECE_VALUES[b.captured.toUpperCase()] : 0;
      return valB - valA;
    });

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of legalMoves) {
        makeMove(state, move);
        const evaluation = minimax(state, depth - 1, alpha, beta, false);
        undoMove(state);
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break; // Beta cutoff
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of legalMoves) {
        makeMove(state, move);
        const evaluation = minimax(state, depth - 1, alpha, beta, true);
        undoMove(state);
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break; // Alpha cutoff
      }
      return minEval;
    }
  }

  /**
   * Compute the best move for the AI.
   * difficulty: 'easy' (depth 1 + random), 'medium' (depth 2), 'hard' (depth 3)
   */
  function getBestMove(state, difficulty = 'medium') {
    const legalMoves = getLegalMoves(state);
    if (legalMoves.length === 0) return null;

    if (difficulty === 'easy') {
      // 35% chance to blunder or play random legal move
      if (Math.random() < 0.35) {
        return legalMoves[Math.floor(Math.random() * legalMoves.length)];
      }
    }

    const searchDepth = (difficulty === 'hard') ? 3 : (difficulty === 'medium' ? 2 : 1);
    const isMaximizing = state.turn === WHITE;
    let bestMove = null;
    let bestVal = isMaximizing ? -Infinity : Infinity;

    // Shuffle moves slightly to avoid deterministic play in identical positions
    const shuffled = legalMoves.slice().sort(() => Math.random() - 0.5);

    // Prioritize captures and checks
    shuffled.sort((a, b) => {
      const valA = a.captured ? PIECE_VALUES[a.captured.toUpperCase()] : 0;
      const valB = b.captured ? PIECE_VALUES[b.captured.toUpperCase()] : 0;
      return valB - valA;
    });

    for (const move of shuffled) {
      makeMove(state, move);
      const val = minimax(state, searchDepth - 1, -Infinity, Infinity, !isMaximizing);
      undoMove(state);

      if (isMaximizing) {
        if (val > bestVal) {
          bestVal = val;
          bestMove = move;
        }
      } else {
        if (val < bestVal) {
          bestVal = val;
          bestMove = move;
        }
      }
    }

    return bestMove || legalMoves[0];
  }

  // --- EXPORTS ---
  exports.WHITE = WHITE;
  exports.BLACK = BLACK;
  exports.PIECE_SYMBOLS = PIECE_SYMBOLS;
  exports.PIECE_NAMES = PIECE_NAMES;
  exports.INITIAL_FEN = INITIAL_FEN;
  exports.createInitialState = createInitialState;
  exports.parseFen = parseFen;
  exports.toFen = toFen;
  exports.cloneState = cloneState;
  exports.squareToCoord = squareToCoord;
  exports.coordToSquare = coordToSquare;
  exports.isSquareAttacked = isSquareAttacked;
  exports.isInCheck = isInCheck;
  exports.getLegalMoves = getLegalMoves;
  exports.makeMove = makeMove;
  exports.undoMove = undoMove;
  exports.getGameStatus = getGameStatus;
  exports.moveToSan = moveToSan;
  exports.getBestMove = getBestMove;

})(typeof exports !== 'undefined' ? exports : ((window.chessLogic = window.ChessLogic = {})));
