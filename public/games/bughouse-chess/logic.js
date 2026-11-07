/**
 * Bughouse Chess (شطرنج باگ‌هاوس / دوبل ۴ نفره) - Core Rules & AI Engine
 * Pure JavaScript, works seamlessly in Node.js and Browser environments.
 * Follows official Chess.com Bughouse rules:
 * - 2 Boards, 4 Players, 2 Teams of 2 (Team 1: A-White & B-Black; Team 2: A-Black & B-White)
 * - Captured pieces transfer immediately to partner's reserve in partner's color.
 * - Promotion Reversion: Promoted pawns revert to regular pawns when captured.
 * - Drop Moves: Drop pieces from reserve onto empty squares (Pawns only on ranks 2-7).
 * - Dropped pieces can block check, give check, or deliver checkmate.
 * - Dual clocks & simultaneous play; checkmate or flag fall on either board ends match immediately.
 */

(function (exports) {
  'use strict';

  // Constants
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
      'P': 'پیاده', 'N': 'اسب', 'B': 'فیل', 'R': 'رخ', 'Q': 'وزیر', 'K': 'شاه',
      'p': 'پیاده', 'n': 'اسب', 'b': 'فیل', 'r': 'رخ', 'q': 'وزیر', 'k': 'شاه'
    }
  };

  const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  const PIECE_VALUES = {
    'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000,
    'P': 100, 'N': 320, 'B': 330, 'R': 500, 'Q': 900, 'K': 20000
  };

  // Piece-Square Tables (PST) for AI positional evaluation
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

  // Coordinate Helpers
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
   * Parse a FEN string for a single board.
   */
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
      promoted: [],      // square indices of pieces that are promoted pawns
      droppedRooks: [],  // square indices where rooks were dropped (cannot castle)
      history: []
    };
  }

  /**
   * Create a fresh Bughouse Game State containing dual boards & reserve piece banks.
   */
  function createInitialState() {
    return {
      boardA: parseFen(INITIAL_FEN),
      boardB: parseFen(INITIAL_FEN),
      reserves: {
        A_w: [], // White player on Board A
        A_b: [], // Black player on Board A
        B_w: [], // White player on Board B
        B_b: []  // Black player on Board B
      },
      status: 'PLAYING', // PLAYING, FINISHED
      winnerTeam: null,  // 1 or 2
      winReason: null,   // checkmate, timeout, resignation
      winningBoard: null // 'boardA' or 'boardB'
    };
  }

  /**
   * Deep clone a Bughouse game state.
   */
  function cloneState(state) {
    return {
      boardA: {
        board: state.boardA.board.slice(),
        turn: state.boardA.turn,
        castling: { ...state.boardA.castling },
        enPassant: state.boardA.enPassant,
        halfmoveClock: state.boardA.halfmoveClock,
        fullmoveNumber: state.boardA.fullmoveNumber,
        promoted: state.boardA.promoted.slice(),
        droppedRooks: state.boardA.droppedRooks.slice(),
        history: state.boardA.history.slice()
      },
      boardB: {
        board: state.boardB.board.slice(),
        turn: state.boardB.turn,
        castling: { ...state.boardB.castling },
        enPassant: state.boardB.enPassant,
        halfmoveClock: state.boardB.halfmoveClock,
        fullmoveNumber: state.boardB.fullmoveNumber,
        promoted: state.boardB.promoted.slice(),
        droppedRooks: state.boardB.droppedRooks.slice(),
        history: state.boardB.history.slice()
      },
      reserves: {
        A_w: state.reserves.A_w.slice(),
        A_b: state.reserves.A_b.slice(),
        B_w: state.reserves.B_w.slice(),
        B_b: state.reserves.B_b.slice()
      },
      status: state.status,
      winnerTeam: state.winnerTeam,
      winReason: state.winReason,
      winningBoard: state.winningBoard
    };
  }

  // --- Attack & Check Detection ---
  function isSquareAttacked(board, targetSq, attackerColor) {
    const tr = Math.floor(targetSq / 8);
    const tc = targetSq % 8;

    // 1. Pawn attacks
    const pawnChar = attackerColor === WHITE ? 'P' : 'p';
    const pawnDir = attackerColor === WHITE ? 1 : -1;
    const pawnRow = tr + pawnDir;
    if (pawnRow >= 0 && pawnRow < 8) {
      if (tc > 0 && board[pawnRow * 8 + (tc - 1)] === pawnChar) return true;
      if (tc < 7 && board[pawnRow * 8 + (tc + 1)] === pawnChar) return true;
    }

    // 2. Knight attacks
    const knightChar = attackerColor === WHITE ? 'N' : 'n';
    const knightOffsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    for (const [dr, dc] of knightOffsets) {
      const r = tr + dr;
      const c = tc + dc;
      if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        if (board[r * 8 + c] === knightChar) return true;
      }
    }

    // 3. King attacks
    const kingChar = attackerColor === WHITE ? 'K' : 'k';
    const kingOffsets = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    for (const [dr, dc] of kingOffsets) {
      const r = tr + dr;
      const c = tc + dc;
      if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        if (board[r * 8 + c] === kingChar) return true;
      }
    }

    // 4. Orthogonal rays (Rook / Queen)
    const orthoDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const rookChar = attackerColor === WHITE ? 'R' : 'r';
    const queenChar = attackerColor === WHITE ? 'Q' : 'q';
    for (const [dr, dc] of orthoDirs) {
      let r = tr + dr;
      let c = tc + dc;
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const piece = board[r * 8 + c];
        if (piece !== null) {
          if (piece === rookChar || piece === queenChar) return true;
          break;
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
          break;
        }
        r += dr;
        c += dc;
      }
    }

    return false;
  }

  function findKing(board, color) {
    const kingChar = color === WHITE ? 'K' : 'k';
    for (let i = 0; i < 64; i++) {
      if (board[i] === kingChar) return i;
    }
    return -1;
  }

  function isInCheck(board, color) {
    const kSq = findKing(board, color);
    if (kSq === -1) return false;
    const enemyColor = color === WHITE ? BLACK : WHITE;
    return isSquareAttacked(board, kSq, enemyColor);
  }

  // --- Move Generation ---
  function generateRegularPseudoMoves(subState, fromSq = null, activeColor = null) {
    const moves = [];
    const color = activeColor || subState.turn;
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
      const piece = subState.board[sq];
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
        if (nextR >= 0 && nextR < 8 && subState.board[nextR * 8 + c] === null) {
          if (nextR === promRow) {
            ['q', 'r', 'b', 'n'].forEach(pr => moves.push({ from: sq, to: nextR * 8 + c, piece, promotion: pr }));
          } else {
            moves.push({ from: sq, to: nextR * 8 + c, piece });
            // 2-step forward
            const twoR = r + dir * 2;
            if (r === startRow && subState.board[twoR * 8 + c] === null) {
              moves.push({ from: sq, to: twoR * 8 + c, piece, isDoublePawn: true });
            }
          }
        }

        // Diagonal captures
        for (const dc of [-1, 1]) {
          const capC = c + dc;
          if (capC >= 0 && capC < 8 && nextR >= 0 && nextR < 8) {
            const capTarget = nextR * 8 + capC;
            const targetPiece = subState.board[capTarget];

            if (targetPiece && getPieceColor(targetPiece) === enemyColor) {
              if (nextR === promRow) {
                ['q', 'r', 'b', 'n'].forEach(pr => moves.push({ from: sq, to: capTarget, piece, captured: targetPiece, promotion: pr }));
              } else {
                moves.push({ from: sq, to: capTarget, piece, captured: targetPiece });
              }
            } else if (subState.enPassant === capTarget) {
              moves.push({ from: sq, to: capTarget, piece, captured: color === WHITE ? 'p' : 'P', isEnPassant: true });
            }
          }
        }
      }

      // --- KNIGHT ---
      else if (type === 'N') {
        const offsets = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        for (const [dr, dc] of offsets) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            const dest = nr * 8 + nc;
            const targetPiece = subState.board[dest];
            if (!targetPiece) {
              moves.push({ from: sq, to: dest, piece });
            } else if (getPieceColor(targetPiece) === enemyColor) {
              moves.push({ from: sq, to: dest, piece, captured: targetPiece });
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
            const dest = nr * 8 + nc;
            const targetPiece = subState.board[dest];
            if (!targetPiece) {
              moves.push({ from: sq, to: dest, piece });
            } else {
              if (getPieceColor(targetPiece) === enemyColor) {
                moves.push({ from: sq, to: dest, piece, captured: targetPiece });
              }
              break;
            }
            nr += dr;
            nc += dc;
          }
        }
      }

      // --- KING ---
      else if (type === 'K') {
        const offsets = [
          [-1, -1], [-1, 0], [-1, 1],
          [0, -1],           [0, 1],
          [1, -1],  [1, 0],  [1, 1]
        ];
        for (const [dr, dc] of offsets) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            const dest = nr * 8 + nc;
            const targetPiece = subState.board[dest];
            if (!targetPiece) {
              moves.push({ from: sq, to: dest, piece });
            } else if (getPieceColor(targetPiece) === enemyColor) {
              moves.push({ from: sq, to: dest, piece, captured: targetPiece });
            }
          }
        }

        // Castling (Bughouse rule: cannot castle with dropped rooks)
        if (color === WHITE && sq === 60 && !isInCheck(subState.board, WHITE)) {
          // King-side
          if (subState.castling.K && !subState.droppedRooks.includes(63) &&
              subState.board[61] === null && subState.board[62] === null && subState.board[63] === 'R') {
            if (!isSquareAttacked(subState.board, 61, BLACK) && !isSquareAttacked(subState.board, 62, BLACK)) {
              moves.push({ from: 60, to: 62, piece: 'K', isCastle: 'K' });
            }
          }
          // Queen-side
          if (subState.castling.Q && !subState.droppedRooks.includes(56) &&
              subState.board[59] === null && subState.board[58] === null && subState.board[57] === null && subState.board[56] === 'R') {
            if (!isSquareAttacked(subState.board, 59, BLACK) && !isSquareAttacked(subState.board, 58, BLACK)) {
              moves.push({ from: 60, to: 58, piece: 'K', isCastle: 'Q' });
            }
          }
        } else if (color === BLACK && sq === 4 && !isInCheck(subState.board, BLACK)) {
          // King-side
          if (subState.castling.k && !subState.droppedRooks.includes(7) &&
              subState.board[5] === null && subState.board[6] === null && subState.board[7] === 'r') {
            if (!isSquareAttacked(subState.board, 5, WHITE) && !isSquareAttacked(subState.board, 6, WHITE)) {
              moves.push({ from: 4, to: 6, piece: 'k', isCastle: 'k' });
            }
          }
          // Queen-side
          if (subState.castling.q && !subState.droppedRooks.includes(0) &&
              subState.board[3] === null && subState.board[2] === null && subState.board[1] === null && subState.board[0] === 'r') {
            if (!isSquareAttacked(subState.board, 3, WHITE) && !isSquareAttacked(subState.board, 2, WHITE)) {
              moves.push({ from: 4, to: 2, piece: 'k', isCastle: 'q' });
            }
          }
        }
      }
    }

    return moves;
  }

  function applyTentativeMove(board, move) {
    const nextBoard = board.slice();
    if (move.isDrop) {
      nextBoard[move.to] = move.piece;
      return nextBoard;
    }

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
   * Get all strictly legal regular moves for boardId on the current turn.
   */
  function getLegalRegularMoves(subState, fromSq = null) {
    const color = subState.turn;
    const pseudo = generateRegularPseudoMoves(subState, fromSq, color);
    const legal = [];

    for (const move of pseudo) {
      const nextBoard = applyTentativeMove(subState.board, move);
      if (!isInCheck(nextBoard, color)) {
        legal.push(move);
      }
    }

    return legal;
  }

  /**
   * Generate legal DROP moves for the active player on a given board.
   * In Bughouse:
   * - Pieces in player's reserve can be placed on ANY empty square.
   * - Pawns CANNOT be placed on rank 1 (row 7) or rank 8 (row 0).
   * - The drop must leave the player's king SAFE (not in check).
   * - Dropping pieces can block check, give check, or deliver checkmate.
   */
  function getLegalDropMoves(state, boardId) {
    const subState = state[boardId];
    const color = subState.turn;
    const reserveKey = (boardId === 'boardA' ? 'A_' : 'B_') + color;
    const reserve = state.reserves[reserveKey] || [];

    if (reserve.length === 0) return [];

    // Distinct piece types in reserve
    const distinctPieces = Array.from(new Set(reserve));
    const legalDrops = [];

    for (let sq = 0; sq < 64; sq++) {
      if (subState.board[sq] !== null) continue; // Must be empty square

      const row = Math.floor(sq / 8);

      for (const piece of distinctPieces) {
        const type = piece.toUpperCase();

        // Pawns cannot be dropped on rank 1 or rank 8
        if (type === 'P' && (row === 0 || row === 7)) {
          continue;
        }

        const dropMove = {
          isDrop: true,
          piece: piece,
          to: sq
        };

        const nextBoard = applyTentativeMove(subState.board, dropMove);
        if (!isInCheck(nextBoard, color)) {
          legalDrops.push(dropMove);
        }
      }
    }

    return legalDrops;
  }

  /**
   * Get all legal actions (Regular moves + Drop moves) for a board.
   */
  function getAllLegalMoves(state, boardId) {
    const regular = getLegalRegularMoves(state[boardId]);
    const drops = getLegalDropMoves(state, boardId);
    return regular.concat(drops);
  }

  /**
   * Execute an action (regular move or drop) on a Bughouse game state.
   * Handles piece transfer to partner reserve, pawn promotion reversion, and victory check.
   */
  function makeBughouseMove(state, boardId, move) {
    if (state.status !== 'PLAYING') return false;

    const subState = state[boardId];
    const color = subState.turn;
    const enemyColor = color === WHITE ? BLACK : WHITE;

    // Convert string coordinates if passed
    if (typeof move.to === 'string') move.to = coordToSquare(move.to);
    if (typeof move.from === 'string') move.from = coordToSquare(move.from);

    // -------------------------------------------------------------
    // CASE A: DROP MOVE
    // -------------------------------------------------------------
    if (move.isDrop) {
      const reserveKey = (boardId === 'boardA' ? 'A_' : 'B_') + color;
      const reserve = state.reserves[reserveKey];
      const pIdx = reserve.indexOf(move.piece);
      if (pIdx === -1) return false; // Piece not in reserve

      // Validate empty square & pawn ranks
      if (subState.board[move.to] !== null) return false;
      const row = Math.floor(move.to / 8);
      if (move.piece.toUpperCase() === 'P' && (row === 0 || row === 7)) return false;

      // Verify king safety
      const testBoard = applyTentativeMove(subState.board, move);
      if (isInCheck(testBoard, color)) return false;

      // Apply drop
      reserve.splice(pIdx, 1);
      subState.board[move.to] = move.piece;

      // If dropped rook, track so it cannot castle
      if (move.piece.toUpperCase() === 'R') {
        subState.droppedRooks.push(move.to);
      }

      // Record move
      subState.history.push({
        move: { ...move },
        san: `${move.piece.toUpperCase()}@${squareToCoord(move.to)}`
      });

      subState.halfmoveClock = 0;
      if (color === BLACK) subState.fullmoveNumber++;
      subState.enPassant = null;
      subState.turn = enemyColor;

      checkGameEnd(state, boardId);
      return true;
    }

    // -------------------------------------------------------------
    // CASE B: REGULAR MOVE
    // -------------------------------------------------------------
    if (!move.piece && move.from >= 0 && move.from <= 63) {
      move.piece = subState.board[move.from];
    }

    const { from, to, piece, captured, isEnPassant, isCastle, promotion, isDoublePawn } = move;

    // Save previous state for history
    const historyItem = {
      move: { ...move },
      board: subState.board.slice()
    };

    // 1. Check if captured piece was promoted:
    // If captured piece was promoted, it reverts to a PAWN when transferred to partner!
    let transferPiece = null;
    let actualCaptured = captured;
    if (isEnPassant) {
      actualCaptured = color === WHITE ? 'p' : 'P';
    }

    if (actualCaptured) {
      const capSq = isEnPassant ? ((Math.floor(from / 8)) * 8 + (to % 8)) : to;
      const wasPromoted = subState.promoted.includes(capSq);

      if (wasPromoted) {
        // Revert to Pawn!
        transferPiece = 'P';
        // Remove from promoted list
        subState.promoted = subState.promoted.filter(sq => sq !== capSq);
      } else {
        transferPiece = actualCaptured.toUpperCase();
      }

      // Partner transfer routing:
      // Board A White captures -> transfers to Board B Black in black color ('p', 'r', 'n', 'b', 'q')
      // Board A Black captures -> transfers to Board B White in white color ('P', 'R', 'N', 'B', 'Q')
      // Board B White captures -> transfers to Board A Black in black color
      // Board B Black captures -> transfers to Board A White in white color
      if (boardId === 'boardA') {
        if (color === WHITE) {
          state.reserves.B_b.push(transferPiece.toLowerCase());
        } else {
          state.reserves.B_w.push(transferPiece.toUpperCase());
        }
      } else {
        if (color === WHITE) {
          state.reserves.A_b.push(transferPiece.toLowerCase());
        } else {
          state.reserves.A_w.push(transferPiece.toUpperCase());
        }
      }

      subState.halfmoveClock = 0;
    } else if (piece.toUpperCase() === 'P') {
      subState.halfmoveClock = 0;
    } else {
      subState.halfmoveClock++;
    }

    // Update if moving piece was in promoted list
    if (subState.promoted.includes(from)) {
      subState.promoted = subState.promoted.filter(sq => sq !== from);
      subState.promoted.push(to);
    }

    // Apply board change
    subState.board[to] = promotion ? (color === WHITE ? promotion.toUpperCase() : promotion.toLowerCase()) : piece;
    subState.board[from] = null;

    if (promotion) {
      // Mark target square as holding a promoted piece
      subState.promoted.push(to);
    }

    // Handle en passant capture square clearing
    if (isEnPassant) {
      const capSq = (Math.floor(from / 8)) * 8 + (to % 8);
      subState.board[capSq] = null;
    }

    // Set new en passant target if double pawn push
    if (isDoublePawn) {
      const dir = color === WHITE ? 1 : -1;
      subState.enPassant = to + (dir * 8);
    } else {
      subState.enPassant = null;
    }

    // Handle castling rook movement
    if (isCastle) {
      if (isCastle === 'K') { subState.board[63] = null; subState.board[61] = 'R'; }
      else if (isCastle === 'Q') { subState.board[56] = null; subState.board[59] = 'R'; }
      else if (isCastle === 'k') { subState.board[7] = null; subState.board[5] = 'r'; }
      else if (isCastle === 'q') { subState.board[0] = null; subState.board[3] = 'r'; }
    }

    // Update castling rights
    if (piece === 'K') { subState.castling.K = false; subState.castling.Q = false; }
    if (piece === 'k') { subState.castling.k = false; subState.castling.q = false; }
    if (from === 63 || to === 63) subState.castling.K = false;
    if (from === 56 || to === 56) subState.castling.Q = false;
    if (from === 7 || to === 7) subState.castling.k = false;
    if (from === 0 || to === 0) subState.castling.q = false;

    // Track dropped rooks movement
    if (subState.droppedRooks.includes(from)) {
      subState.droppedRooks = subState.droppedRooks.filter(sq => sq !== from);
      subState.droppedRooks.push(to);
    }

    // Update clocks
    if (color === BLACK) subState.fullmoveNumber++;
    subState.turn = enemyColor;

    subState.history.push(historyItem);

    // Check if move created checkmate or stalemate
    checkGameEnd(state, boardId);
    return true;
  }

  /**
   * Check if a board is in checkmate or stalemate, and end game with team victory.
   */
  function checkGameEnd(state, boardId) {
    const subState = state[boardId];
    const activeColor = subState.turn;
    const inCheck = isInCheck(subState.board, activeColor);
    const legalMoves = getAllLegalMoves(state, boardId);

    if (legalMoves.length === 0) {
      if (inCheck) {
        // Checkmate!
        state.status = 'FINISHED';
        state.winReason = 'checkmate';
        state.winningBoard = boardId;

        // Team 1: Board A White & Board B Black
        // Team 2: Board A Black & Board B White
        if (boardId === 'boardA') {
          // If activeColor is Black, White mated Black -> Team 1 wins!
          state.winnerTeam = activeColor === BLACK ? 1 : 2;
        } else {
          // Board B: If activeColor is Black, White mated Black -> Team 2 wins!
          state.winnerTeam = activeColor === BLACK ? 2 : 1;
        }
      } else {
        // Stalemate
        state.status = 'FINISHED';
        state.winReason = 'stalemate';
        state.winnerTeam = null; // Draw
      }
    }
  }

  /**
   * Handle player clock timeout (flag fall) or resignation.
   * Immediately ends the game with victory for the opposing team.
   */
  function handleTimeout(state, boardId, losingColor) {
    if (state.status !== 'PLAYING') return;
    state.status = 'FINISHED';
    state.winReason = 'timeout';
    state.winningBoard = boardId;

    if (boardId === 'boardA') {
      state.winnerTeam = losingColor === WHITE ? 2 : 1;
    } else {
      state.winnerTeam = losingColor === WHITE ? 1 : 2;
    }
  }

  function handleResign(state, boardId, resigningColor) {
    if (state.status !== 'PLAYING') return;
    state.status = 'FINISHED';
    state.winReason = 'resignation';
    state.winningBoard = boardId;

    if (boardId === 'boardA') {
      state.winnerTeam = resigningColor === WHITE ? 2 : 1;
    } else {
      state.winnerTeam = resigningColor === WHITE ? 1 : 2;
    }
  }

  // --- AI ENGINE FOR BUGHOUSE ---
  /**
   * Positional score evaluation for a single board.
   */
  function evaluateBoard(subState) {
    let score = 0;
    const board = subState.board;

    for (let sq = 0; sq < 64; sq++) {
      const p = board[sq];
      if (!p) continue;

      const isW = isWhitePiece(p);
      const val = PIECE_VALUES[p] || 0;
      const type = p.toUpperCase();

      // PST table lookup
      let pstVal = 0;
      const pstIdx = isW ? sq : (63 - sq);

      if (type === 'P') pstVal = PAWN_TABLE[pstIdx] || 0;
      else if (type === 'N') pstVal = KNIGHT_TABLE[pstIdx] || 0;
      else if (type === 'B') pstVal = BISHOP_TABLE[pstIdx] || 0;
      else if (type === 'R') pstVal = ROOK_TABLE[pstIdx] || 0;
      else if (type === 'Q') pstVal = QUEEN_TABLE[pstIdx] || 0;
      else if (type === 'K') pstVal = KING_TABLE_MID[pstIdx] || 0;

      const totalVal = val + pstVal;
      score += isW ? totalVal : -totalVal;
    }

    return score;
  }

  /**
   * Evaluate a move/drop for Bughouse AI.
   * Considers checks, captures, drop tactics, and center control.
   */
  function scoreAction(state, boardId, move, color) {
    const subState = state[boardId];
    const isW = color === WHITE;
    let score = 0;

    // 1. Regular captures
    if (move.captured) {
      const capVal = PIECE_VALUES[move.captured.toUpperCase()] || 0;
      const myVal = PIECE_VALUES[move.piece.toUpperCase()] || 0;
      score += capVal * 10 - myVal * 2;
      // Bonus: Passing a captured piece to teammate is HUGE in Bughouse!
      score += capVal * 5;
    }

    // 2. Promotion bonus
    if (move.promotion) {
      score += 800;
    }

    // 3. Drop moves tactics
    if (move.isDrop) {
      const dropType = move.piece.toUpperCase();
      const dropVal = PIECE_VALUES[dropType] || 0;
      score += 50; // Drops are tempo-effective

      // Drops near enemy king (pawn storm, queen drop attack)
      const enemyKingSq = findKing(subState.board, isW ? BLACK : WHITE);
      if (enemyKingSq !== -1) {
        const kr = Math.floor(enemyKingSq / 8);
        const kc = enemyKingSq % 8;
        const dr = Math.floor(move.to / 8);
        const dc = move.to % 8;
        const dist = Math.abs(kr - dr) + Math.abs(kc - dc);
        if (dist <= 2) score += 120; // Aggressive drop near king
      }

      // Fork potential for Knight drop
      if (dropType === 'N') {
        score += 80;
      }
    }

    // 4. Giving Check bonus
    const nextBoard = applyTentativeMove(subState.board, move);
    const enemyColor = isW ? BLACK : WHITE;
    if (isInCheck(nextBoard, enemyColor)) {
      score += 150;
    }

    // 5. Positional delta
    const testState = cloneState(state);
    makeBughouseMove(testState, boardId, move);
    const posScore = evaluateBoard(testState[boardId]);
    score += isW ? posScore : -posScore;

    return score;
  }

  /**
   * Choose the best move or drop for a bot on a given board.
   */
  function getBestBughouseMove(state, boardId, difficulty = 'medium') {
    const legalMoves = getAllLegalMoves(state, boardId);
    if (legalMoves.length === 0) return null;

    const subState = state[boardId];
    const color = subState.turn;

    // Easy mode: mostly random with capture preference
    if (difficulty === 'easy') {
      const captures = legalMoves.filter(m => m.captured || m.isDrop);
      if (captures.length > 0 && Math.random() < 0.6) {
        return captures[Math.floor(Math.random() * captures.length)];
      }
      return legalMoves[Math.floor(Math.random() * legalMoves.length)];
    }

    // Medium & Hard: Scored evaluation
    let scoredMoves = legalMoves.map(m => ({
      move: m,
      score: scoreAction(state, boardId, m, color) + (Math.random() * 20 - 10)
    }));

    scoredMoves.sort((a, b) => b.score - a.score);

    if (difficulty === 'medium') {
      // Pick among top 3
      const pool = scoredMoves.slice(0, Math.min(3, scoredMoves.length));
      return pool[Math.floor(Math.random() * pool.length)].move;
    }

    // Hard: Pick absolute top move
    return scoredMoves[0].move;
  }

  // --- EXPORTS ---
  exports.WHITE = WHITE;
  exports.BLACK = BLACK;
  exports.PIECE_SYMBOLS = PIECE_SYMBOLS;
  exports.PIECE_NAMES = PIECE_NAMES;
  exports.INITIAL_FEN = INITIAL_FEN;
  exports.PIECE_VALUES = PIECE_VALUES;
  exports.createInitialState = createInitialState;
  exports.cloneState = cloneState;
  exports.parseFen = parseFen;
  exports.squareToCoord = squareToCoord;
  exports.coordToSquare = coordToSquare;
  exports.isSquareAttacked = isSquareAttacked;
  exports.findKing = findKing;
  exports.isInCheck = isInCheck;
  exports.getLegalRegularMoves = getLegalRegularMoves;
  exports.getLegalDropMoves = getLegalDropMoves;
  exports.getAllLegalMoves = getAllLegalMoves;
  exports.makeBughouseMove = makeBughouseMove;
  exports.handleTimeout = handleTimeout;
  exports.handleResign = handleResign;
  exports.getBestBughouseMove = getBestBughouseMove;

})(typeof exports !== 'undefined' ? exports : ((globalThis.bughouseLogic = globalThis.BughouseLogic = {})));
