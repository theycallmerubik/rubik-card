/**
 * Chess (شطرنج) - Client Application Controller
 * Supports Offline Solo vs Smart AI Bot (with Minimax + Difficulty settings),
 * Move Undo, AI Hints, Flip Board, PGN Notation Log, and Online/LAN Multiplayer.
 */

(function () {
  'use strict';

  const chessLogic = window.chessLogic || window.ChessLogic;
  const chessSound = window.chessSound || window.ChessSound;

  // --- I18N DICTIONARY ---
  const CHESS_I18N = {
    fa: {
      gameTitle: 'بازی شطرنج',
      menuHubTitle: 'هاب بازی‌ها',
      whiteToMove: 'نوبت حرکت: سفید ⚪',
      blackToMove: 'نوبت حرکت: سیاه ⚫',
      checkAlert: '⚠️ کیش!',
      checkmateBanner: (color) => `🏆 کیش و مات! ${color === 'w' ? 'سفید' : 'سیاه'} برنده شد.`,
      stalemateBanner: '🤝 پات (بن‌بست)! بازی مساوی شد.',
      drawMaterialBanner: '🤝 تساوی به دلیل عدم کفایت مهره‌ها.',
      draw50Banner: '🤝 تساوی طبق قانون ۵۰ حرکت.',
      resignedBanner: (name) => `🏳️ ${name} تسلیم شد.`,
      undoBtn: 'بازگشت',
      hintBtn: 'راهنمایی',
      newGameBtn: 'شروع مجدد',
      resignBtn: 'تسلیم',
      flipBoardBtn: 'چرخش صفحه',
      mainMenuBtn: 'منوی اصلی',
      botDifficulty: 'سطح ربات:',
      diffEasy: 'آسان',
      diffMedium: 'متوسط',
      diffHard: 'سخت',
      moveHistoryTitle: 'گزارش حرکات (PGN)',
      colWhite: 'سفید',
      colBlack: 'سیاه',
      promotionTitle: 'ارتقای پیاده (Promotion)',
      promotionPrompt: 'پیاده شما به انتهای صفحه رسید! مهره مورد نظر را انتخاب کنید:',
      promoQueen: 'وزیر (Queen)',
      promoRook: 'رخ (Rook)',
      promoBishop: 'فیل (Bishop)',
      promoKnight: 'اسب (Knight)',
      multiplayerBtn: 'چندنفره آنلاین',
      swapColorsBtn: '🔄 تعویض رنگ',
      multiplayerTitle: 'اتاق شطرنج آنلاین / شبکه محلی',
      multiplayerDesc: 'اتاق بسازید یا با کد اتاق به رقابت دوستانتان ملحق شوید.',
      roomCodeLabel: 'کد اتاق:',
      copyLinkBtn: '📋 کپی لینک اتاق',
      yourNameLabel: 'نام شما:',
      saveNameBtn: 'ثبت نام',
      startGameBtn: 'شروع مسابقه',
      waitingForHost: 'در انتظار شروع مسابقه توسط میزبان...',
      leaveRoomBtn: 'خروج از اتاق',
      createRoomBtn: 'ساخت اتاق جدید',
      joinRoomBtn: 'ورود به اتاق',
      enterRoomCodeLabel: 'کد ۴ حرفی اتاق را وارد کنید:',
      joinBtn: 'ورود به مسابقه',
      playOfflineBots: '🤖 بازی آفلاین با هوش مصنوعی (بدون نیاز به اینترنت)',
      closeBtn: 'بستن',
      chatTitle: 'گزارش و چت بازی',
      mainMenuTitle: 'بازی فکری شطرنج (Chess)',
      mainMenuSubtitle: 'بازی آنلاین و آفلاین شطرنج استاندارد با هوش مصنوعی و تحلیل حرکات',
      menuSoloTitle: 'بازی تک‌نفره با هوش مصنوعی',
      menuSoloDesc: 'بازی سریع و آفلاین با ربات هوشمند در ۳ سطح سختی',
      menuOnlineTitle: 'چندنفره آنلاین و شبکه محلی',
      menuOnlineDesc: 'ساخت اتاق شطرنج و دعوت دوستان برای رقابت زنده',
      menuRulesTitle: 'آموزش و قوانین شطرنج',
      menuRulesDesc: 'آموزش حرکات مهره‌ها، قلعه رفتن، آن‌پاسان و نحوه مات و پات',
      resumeGame: 'ادامه بازی جاری',
      soundLabel: 'صدا',
      menuModalTitle: 'منوی اصلی',
      rulesTitle: 'راهنما و قوانین بازی شطرنج',
      timeControlLabel: 'زمان کل هر بازیکن:',
      soloSetupTitle: 'انتخاب رنگ و شروع بازی',
      soloSetupDesc: 'رنگ مهره‌های خود را برای بازی در برابر هوش مصنوعی انتخاب کنید:',
      colorWhiteTitle: 'سفید (White)',
      colorWhiteDesc: 'حرکت اول با شماست',
      colorRandomTitle: 'تصادفی (Random)',
      colorRandomDesc: 'رنگ به شانس انتخاب می‌شود',
      colorBlackTitle: 'سیاه (Black)',
      colorBlackDesc: 'ربات بازی را شروع می‌کند',
      backBtn: 'بازگشت',
      rulesContent: `
        <h4>۱. هدف بازی</h4>
        <p>هدف شطرنج به دام انداختن شاه حریف به نحوی است که هیچ راه فراری از حمله نداشته باشد (کیش و مات).</p>
        <h4>۲. حرکات مهره‌ها</h4>
        <p>• <strong>پیاده (Pawn - ♙):</strong> یک خانه رو به جلو (در حرکت اول ۲ خانه)، گرفتن مهره‌ها به‌صورت قطری.<br>
        • <strong>اسب (Knight - ♘):</strong> حرکت به شکل L (۲ خانه مستقیم و ۱ خانه عمود)، تنها مهره‌ای که می‌تواند از روی سایر مهره‌ها بپرد.<br>
        • <strong>فیل (Bishop - ♗):</strong> حرکت در خطوط قطری به هر تعداد خانه دلخواه هم‌رنگ خود.<br>
        • <strong>رخ (Rook - ♖):</strong> حرکت در خطوط مستقیم افقی و عمودی به هر تعداد خانه.<br>
        • <strong>وزیر (Queen - ♕):</strong> قدرتمندترین مهره؛ ترکیب حرکات رخ و فیل در تمام جهات.<br>
        • <strong>شاه (King - ♔):</strong> یک خانه در هر جهت به شرطی که آن خانه مورد تهدید حریف نباشد.</p>
        <h4>۳. قوانین و حرکات ویژه</h4>
        <p>• <strong>قلعه رفتن (Castling - O-O و O-O-O):</strong> حرکت همزمان شاه و رخ جهت محافظت از شاه و فعال‌سازی رخ.<br>
        • <strong>آن‌پاسان (En Passant):</strong> گرفتن پیاده حریف در حین عبور پس از پرش دو خانه‌ای آن.<br>
        • <strong>ارتقای پیاده (Promotion):</strong> با رسیدن پیاده به آخرین سطر، می‌توان آن را به وزیر، رخ، فیل یا اسب تبدیل کرد.</p>
        <h4>۴. شرایط پایان بازی</h4>
        <p>• <strong>کیش و مات:</strong> شاه زیر ضربه است و هیچ حرکت قانونی برای رفع آن وجود ندارد.<br>
        • <strong>پات (بن‌بست):</strong> شاه کیش نیست اما بازیکن هیچ حرکت قانونی ندارد (تساوی).<br>
        • <strong>تساوی:</strong> عدم کفایت مهره، قانون ۵۰ حرکت بدون زدن مهره، یا توافق دو طرف.</p>
      `
    },
    en: {
      gameTitle: 'Chess',
      menuHubTitle: 'Game Hub',
      whiteToMove: 'White to move ⚪',
      blackToMove: 'Black to move ⚫',
      checkAlert: '⚠️ Check!',
      checkmateBanner: (color) => `🏆 Checkmate! ${color === 'w' ? 'White' : 'Black'} wins.`,
      stalemateBanner: '🤝 Stalemate! Game is a draw.',
      drawMaterialBanner: '🤝 Draw by insufficient material.',
      draw50Banner: '🤝 Draw by 50-move rule.',
      resignedBanner: (name) => `🏳️ ${name} resigned.`,
      undoBtn: 'Undo',
      hintBtn: 'Hint',
      newGameBtn: 'New Game',
      resignBtn: 'Resign',
      flipBoardBtn: 'Flip Board',
      mainMenuBtn: 'Main Menu',
      botDifficulty: 'Bot Level:',
      diffEasy: 'Easy',
      diffMedium: 'Medium',
      diffHard: 'Hard',
      moveHistoryTitle: 'Move History (PGN)',
      colWhite: 'White',
      colBlack: 'Black',
      promotionTitle: 'Pawn Promotion',
      promotionPrompt: 'Your pawn reached the back rank! Choose a piece to promote to:',
      promoQueen: 'Queen',
      promoRook: 'Rook',
      promoBishop: 'Bishop',
      promoKnight: 'Knight',
      multiplayerBtn: 'Multiplayer',
      swapColorsBtn: '🔄 Swap Colors',
      multiplayerTitle: 'Online / LAN Chess Room',
      multiplayerDesc: 'Create a room or join with a room code to challenge your friends.',
      roomCodeLabel: 'Room Code:',
      copyLinkBtn: '📋 Copy Room Link',
      yourNameLabel: 'Your Name:',
      saveNameBtn: 'Save Name',
      startGameBtn: 'Start Match',
      waitingForHost: 'Waiting for host to start the match...',
      leaveRoomBtn: 'Leave Room',
      createRoomBtn: 'Create New Room',
      joinRoomBtn: 'Join Room',
      enterRoomCodeLabel: 'Enter 4-letter room code:',
      joinBtn: 'Join Match',
      playOfflineBots: '🤖 Play Offline vs AI Bot',
      closeBtn: 'Close',
      chatTitle: 'Game Log & Chat',
      mainMenuTitle: 'Chess Game',
      mainMenuSubtitle: 'Online & offline standard chess with smart bot and move analysis',
      menuSoloTitle: 'Solo Match vs AI',
      menuSoloDesc: 'Fast offline match vs chess bot with 3 difficulty levels',
      menuOnlineTitle: 'Multiplayer Online / LAN',
      menuOnlineDesc: 'Create a custom room and invite friends to play live',
      menuRulesTitle: 'Rules & Guidelines',
      menuRulesDesc: 'Movement of pieces, castling, en passant, check & mate',
      resumeGame: 'Resume Game',
      soundLabel: 'Sound',
      menuModalTitle: 'Main Menu',
      rulesTitle: 'Chess Rules & Guidelines',
      timeControlLabel: 'Time Per Player:',
      soloSetupTitle: 'Choose Piece Color',
      soloSetupDesc: 'Select your piece color to play against the chess bot:',
      colorWhiteTitle: 'White ⚪',
      colorWhiteDesc: 'You make the first move',
      colorRandomTitle: 'Random 🎲',
      colorRandomDesc: 'Color chosen by random luck',
      colorBlackTitle: 'Black ⚫',
      colorBlackDesc: 'Bot makes the first move',
      backBtn: 'Back',
      rulesContent: `
        <h4>1. Objective of the Game</h4>
        <p>The goal in chess is to checkmate the opponent's king. Checkmate happens when the king is under attack and cannot escape.</p>
        <h4>2. Piece Movements</h4>
        <p>• <strong>Pawn (♙):</strong> Moves forward 1 square (or 2 on first move), captures diagonally.<br>
        • <strong>Knight (♘):</strong> Moves in an "L" pattern (2 squares one way, 1 square perpendicular). Can jump over pieces.<br>
        • <strong>Bishop (♗):</strong> Moves diagonally as many squares as unobstructed.<br>
        • <strong>Rook (♖):</strong> Moves horizontally or vertically as many squares as unobstructed.<br>
        • <strong>Queen (♕):</strong> Combines the power of rook and bishop in all directions.<br>
        • <strong>King (♔):</strong> Moves 1 square in any direction.</p>
        <h4>3. Special Moves</h4>
        <p>• <strong>Castling (O-O / O-O-O):</strong> King moves two squares toward rook, rook hops over king.<br>
        • <strong>En Passant:</strong> A pawn capturing an enemy pawn that just moved two squares past it.<br>
        • <strong>Promotion:</strong> A pawn reaching the opposite back rank promotes to a Queen, Rook, Bishop, or Knight.</p>
        <h4>4. Draws & Stalemate</h4>
        <p>• <strong>Stalemate:</strong> Player has no legal moves and is not in check.<br>
        • <strong>Insufficient Material:</strong> Neither player has enough pieces to checkmate.<br>
        • <strong>50-Move Rule:</strong> 50 consecutive moves without a capture or pawn advance.</p>
      `
    }
  };

  // --- GLOBAL STATE ---
  let currentLang = 'fa';
  let mode = 'SOLO'; // 'SOLO' | 'ONLINE'
  let onlineWs = null;
  const wsQueue = [];
  let mySeat = -1; // 0 (White) | 1 (Black) | -1
  let myColor = 'w'; // 'w' | 'b' | null (spectator)
  let isBoardFlipped = false;
  let botDifficulty = 'medium'; // 'easy' | 'medium' | 'hard'
  let botThinkingTimeout = null;
  let isChatMuted = false;

  // Time Controls
  let selectedTimeControl = 900; // in seconds (default 15 minutes)
  let whiteClockSec = 900;
  let blackClockSec = 900;
  let clockTimerInterval = null;

  // Core Game State
  let gameState = chessLogic.parseFen();
  let selectedSquare = null;
  let legalMovesForSelected = [];
  let pendingPromotionMove = null;
  let lastMove = null; // { from, to }
  let hintSquares = null; // { from, to }

  // DOM Elements Cache
  const dom = {};

  function initDom() {
    dom.btnSound = document.getElementById('btn-sound');
    dom.btnLang = document.getElementById('btn-lang');
    dom.btnFlip = document.getElementById('btn-flip');
    dom.btnRules = document.getElementById('btn-rules');
    dom.btnMultiplayer = document.getElementById('btn-multiplayer');
    dom.btnChat = document.getElementById('btn-chat');
    dom.btnMenu = document.getElementById('btn-menu');
    dom.btnMobileNav = document.getElementById('btn-mobile-nav');
    dom.mobileNavDropdown = document.getElementById('mobile-nav-dropdown');
    dom.btnMobMultiplayer = document.getElementById('btn-mob-multiplayer');
    dom.btnMobSound = document.getElementById('btn-mob-sound');
    dom.btnMobLang = document.getElementById('btn-mob-lang');
    dom.btnMobFlip = document.getElementById('btn-mob-flip');
    dom.btnMobRules = document.getElementById('btn-mob-rules');
    dom.btnMobMenu = document.getElementById('btn-mob-menu');

    dom.topTurnDot = document.getElementById('top-turn-dot');
    dom.topStatusText = document.getElementById('top-status-text');
    dom.checkAlertPill = document.getElementById('check-alert-pill');
    dom.notificationBubble = document.getElementById('notification-bubble');

    dom.topPlayerBar = document.getElementById('top-player-bar');
    dom.topPlayerName = document.getElementById('top-player-name');
    dom.topAvatar = document.getElementById('top-avatar');
    dom.topColorMarker = document.getElementById('top-color-marker');
    dom.topOnlineStatus = document.getElementById('top-online-status');
    dom.topCapturedTray = document.getElementById('top-captured-tray');
    dom.topMaterialLead = document.getElementById('top-material-lead');
    dom.topTimer = document.getElementById('top-timer');

    dom.bottomPlayerBar = document.getElementById('bottom-player-bar');
    dom.bottomPlayerName = document.getElementById('bottom-player-name');
    dom.bottomAvatar = document.getElementById('bottom-avatar');
    dom.bottomColorMarker = document.getElementById('bottom-color-marker');
    dom.bottomOnlineStatus = document.getElementById('bottom-online-status');
    dom.bottomCapturedTray = document.getElementById('bottom-captured-tray');
    dom.bottomMaterialLead = document.getElementById('bottom-material-lead');
    dom.bottomTimer = document.getElementById('bottom-timer');

    dom.chessboard = document.getElementById('chessboard');

    // Controls
    dom.btnUndoMove = document.getElementById('btn-undo-move');
    dom.btnHintMove = document.getElementById('btn-hint-move');
    dom.btnOnlineMatch = document.getElementById('btn-online-match');
    dom.btnNewGame = document.getElementById('btn-new-game');
    dom.btnResignGame = document.getElementById('btn-resign-game');
    dom.difficultyBar = document.getElementById('difficulty-bar');
    dom.movesTbody = document.getElementById('moves-tbody');
    dom.movesContainer = document.getElementById('moves-container');
    dom.btnCopyPgn = document.getElementById('btn-copy-pgn');

    // Modals
    dom.modalPromotion = document.getElementById('modal-promotion');
    dom.promotionPiecesGrid = document.getElementById('promotion-pieces-grid');
    dom.modalGameOver = document.getElementById('modal-game-over');
    dom.gameOverTitle = document.getElementById('game-over-title');
    dom.gameOverDesc = document.getElementById('game-over-desc');
    dom.resultBadgeIcon = document.getElementById('result-badge-icon');
    dom.resultMainText = document.getElementById('result-main-text');
    dom.btnResultRestart = document.getElementById('btn-result-restart');
    dom.btnResultMenu = document.getElementById('btn-result-menu');

    dom.modalMainMenu = document.getElementById('modal-main-menu');
    dom.btnMenuSolo = document.getElementById('btn-menu-solo');
    dom.btnMenuOnline = document.getElementById('btn-menu-online');
    dom.btnMenuRules = document.getElementById('btn-menu-rules');
    dom.btnMenuResume = document.getElementById('btn-menu-resume');

    // Solo Setup Modal
    dom.modalSoloSetup = document.getElementById('modal-solo-setup');
    dom.btnSoloWhite = document.getElementById('btn-solo-white');
    dom.btnSoloRandom = document.getElementById('btn-solo-random');
    dom.btnSoloBlack = document.getElementById('btn-solo-black');
    dom.btnCloseSoloSetup = document.getElementById('btn-close-solo-setup');

    dom.modalRules = document.getElementById('modal-rules');
    dom.rulesContent = document.getElementById('rules-content');
    dom.btnCloseRules = document.getElementById('btn-close-rules');

    dom.modalMultiplayer = document.getElementById('modal-multiplayer');
    dom.mpEntryView = document.getElementById('mp-entry-view');
    dom.mpLobbyView = document.getElementById('mp-lobby-view');
    dom.mpRoomCode = document.getElementById('mp-room-code');
    dom.btnCopyRoomLink = document.getElementById('btn-copy-room-link');
    dom.inputPlayerName = document.getElementById('input-player-name');
    dom.btnCreateRoom = document.getElementById('btn-create-room');
    dom.btnShowJoin = document.getElementById('btn-show-join');
    dom.mpJoinFields = document.getElementById('mp-join-fields');
    dom.inputRoomCode = document.getElementById('input-room-code');
    dom.btnConfirmJoin = document.getElementById('btn-confirm-join');
    dom.btnPlayOffline = document.getElementById('btn-play-offline');
    dom.btnCloseMp = document.getElementById('btn-close-mp');
    dom.lobbySeatsContainer = document.getElementById('lobby-seats-container');
    dom.btnSwapChessSeats = document.getElementById('btn-swap-chess-seats');
    dom.btnStartOnlineGame = document.getElementById('btn-start-online-game');
    dom.lobbyWaitingMsg = document.getElementById('lobby-waiting-msg');
    dom.btnLeaveRoom = document.getElementById('btn-leave-room');
    dom.lobbyNameInput = document.getElementById('lobby-name-input');
    dom.btnSaveLobbyName = document.getElementById('btn-save-lobby-name');
    dom.lobbyTimeSelect = document.getElementById('lobby-time-select');

    // Chat
    dom.chatDrawer = document.getElementById('chat-drawer');
    dom.chatHeader = document.getElementById('chat-header');
    dom.btnChatMute = document.getElementById('btn-chat-mute');
    dom.chatToggleIcon = document.getElementById('chat-toggle-icon');
    dom.chatMessages = document.getElementById('chat-messages');
    dom.chatInput = document.getElementById('chat-input');
    dom.btnSendChat = document.getElementById('btn-send-chat');
    dom.chatBadge = document.getElementById('chat-badge');
    dom.chatToast = document.getElementById('chat-toast');
    dom.chatToastSender = document.getElementById('chat-toast-sender');
    dom.chatToastText = document.getElementById('chat-toast-text');
    dom.chatToastClose = document.getElementById('chat-toast-close');
  }

  // --- NOTIFICATIONS & CHAT ---
  function showNotification(msg) {
    if (!dom.notificationBubble) return;
    dom.notificationBubble.textContent = msg;
    dom.notificationBubble.classList.add('show');
    setTimeout(() => dom.notificationBubble.classList.remove('show'), 2800);
  }

  function appendChat(sender, text, isSystem = false) {
    if (!dom.chatMessages) return;
    const msgEl = document.createElement('div');
    msgEl.className = 'chat-msg' + (isSystem ? ' system' : ' user');
    if (isSystem) {
      msgEl.textContent = text;
    } else {
      msgEl.innerHTML = `<span class="chat-msg-sender">${escapeHtml(sender || 'Player')}:</span> ${escapeHtml(text)}`;
    }
    dom.chatMessages.appendChild(msgEl);
    dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight;

    if (dom.chatDrawer && dom.chatDrawer.classList.contains('minimized') && !isSystem) {
      if (dom.chatBadge) {
        dom.chatBadge.style.display = 'inline-block';
        const cur = parseInt(dom.chatBadge.textContent, 10) || 0;
        dom.chatBadge.textContent = cur + 1;
      }
      if (!isChatMuted && dom.chatToast && dom.chatToastSender && dom.chatToastText) {
        dom.chatToastSender.textContent = sender || 'Player';
        dom.chatToastText.textContent = text;
        dom.chatToast.style.display = 'block';
        chessSound.playNotification();
        setTimeout(() => {
          if (dom.chatToast) dom.chatToast.style.display = 'none';
        }, 4000);
      }
    }
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // --- LANGUAGE SWITCHING ---
  function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'fa') ? 'rtl' : 'ltr';
    if (lang === 'fa') document.body.classList.add('rtl');
    else document.body.classList.remove('rtl');

    const t = CHESS_I18N[lang];
    if (dom.rulesContent) dom.rulesContent.innerHTML = t.rulesContent;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key]) el.textContent = t[key];
    });

    updateStatusHeader();
  }

  function toggleLanguage() {
    setLanguage(currentLang === 'fa' ? 'en' : 'fa');
  }

  // --- BOARD GENERATION & RENDERING ---
  function renderBoard() {
    if (!dom.chessboard) return;
    dom.chessboard.innerHTML = '';

    const inCheck = chessLogic.isInCheck(gameState.board, gameState.turn);
    const checkedKingSq = inCheck ? (gameState.turn === 'w' ? gameState.board.indexOf('K') : gameState.board.indexOf('k')) : -1;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        // Handle board flip
        const actualR = isBoardFlipped ? 7 - r : r;
        const actualC = isBoardFlipped ? 7 - c : c;
        const sqIdx = actualR * 8 + actualC;

        const square = document.createElement('div');
        const isLight = (actualR + actualC) % 2 === 0;
        square.className = 'square ' + (isLight ? 'light' : 'dark');
        square.dataset.square = sqIdx;

        // Last move highlight
        if (lastMove && (sqIdx === lastMove.from || sqIdx === lastMove.to)) {
          square.classList.add(sqIdx === lastMove.from ? 'last-move-source' : 'last-move-target');
        }

        // Selected square highlight
        if (sqIdx === selectedSquare) {
          square.classList.add('selected');
        }

        // King check highlight
        if (sqIdx === checkedKingSq) {
          square.classList.add('king-check');
        }

        // AI Hint highlight
        if (hintSquares && (sqIdx === hintSquares.from || sqIdx === hintSquares.to)) {
          square.classList.add('selected');
        }

        // Coordinates notation along edges
        if (r === 7) {
          const fileLabel = document.createElement('span');
          fileLabel.className = 'coord-label coord-file';
          fileLabel.textContent = String.fromCharCode('a'.charCodeAt(0) + actualC);
          square.appendChild(fileLabel);
        }
        if (c === 0) {
          const rankLabel = document.createElement('span');
          rankLabel.className = 'coord-label coord-rank';
          rankLabel.textContent = 8 - actualR;
          square.appendChild(rankLabel);
        }

        // Valid move indicators
        const matchingMove = legalMovesForSelected.find(m => m.to === sqIdx);
        if (matchingMove) {
          if (matchingMove.captured || matchingMove.isEnPassant) {
            const capRing = document.createElement('div');
            capRing.className = 'valid-capture-ring';
            square.appendChild(capRing);
          } else {
            const dot = document.createElement('div');
            dot.className = 'valid-dot';
            square.appendChild(dot);
          }
        }

        // Piece rendering
        const piece = gameState.board[sqIdx];
        if (piece) {
          const pieceEl = document.createElement('span');
          const isWhite = piece === piece.toUpperCase();
          pieceEl.className = 'piece ' + (isWhite ? 'white-piece' : 'black-piece');
          pieceEl.textContent = chessLogic.PIECE_SYMBOLS[piece] || piece;
          square.appendChild(pieceEl);
        }

        square.addEventListener('click', () => onSquareClicked(sqIdx));
        dom.chessboard.appendChild(square);
      }
    }

    renderPlayerBars();
    updateStatusHeader();
  }

  function renderPlayerBars() {
    const isWhiteBottom = !isBoardFlipped;
    const t = CHESS_I18N[currentLang];

    // Colors
    const bottomColor = isWhiteBottom ? 'w' : 'b';
    const topColor = isWhiteBottom ? 'b' : 'w';

    // Active turn border
    if (dom.bottomPlayerBar) {
      if (gameState.turn === bottomColor) dom.bottomPlayerBar.classList.add('active-turn');
      else dom.bottomPlayerBar.classList.remove('active-turn');
    }
    if (dom.topPlayerBar) {
      if (gameState.turn === topColor) dom.topPlayerBar.classList.add('active-turn');
      else dom.topPlayerBar.classList.remove('active-turn');
    }

    // Material calculation
    let whiteScore = 0;
    let blackScore = 0;
    const capturedByWhite = gameState.capturedBlack || [];
    const capturedByBlack = gameState.capturedWhite || [];

    capturedByWhite.forEach(p => whiteScore += (p === 'q' ? 9 : (p === 'r' ? 5 : (p === 'b' || p === 'n' ? 3 : 1))));
    capturedByBlack.forEach(p => blackScore += (p === 'Q' ? 9 : (p === 'R' ? 5 : (p === 'B' || p === 'N' ? 3 : 1))));

    // Render captured pieces
    if (dom.bottomCapturedTray) {
      const bottomCaps = isWhiteBottom ? capturedByWhite : capturedByBlack;
      dom.bottomCapturedTray.innerHTML = bottomCaps.map(p => chessLogic.PIECE_SYMBOLS[p] || p).join('');
    }
    if (dom.topCapturedTray) {
      const topCaps = isWhiteBottom ? capturedByBlack : capturedByWhite;
      dom.topCapturedTray.innerHTML = topCaps.map(p => chessLogic.PIECE_SYMBOLS[p] || p).join('');
    }

    // Material Lead Badges
    const diff = whiteScore - blackScore;
    if (dom.bottomMaterialLead) dom.bottomMaterialLead.textContent = (isWhiteBottom ? (diff > 0 ? `+${diff}` : '') : (diff < 0 ? `+${-diff}` : ''));
    if (dom.topMaterialLead) dom.topMaterialLead.textContent = (!isWhiteBottom ? (diff > 0 ? `+${diff}` : '') : (diff < 0 ? `+${-diff}` : ''));
  }

  function updateStatusHeader() {
    const t = CHESS_I18N[currentLang];
    const status = chessLogic.getGameStatus(gameState);

    if (dom.topTurnDot) {
      dom.topTurnDot.className = 'turn-color-dot ' + (gameState.turn === 'w' ? 'white' : 'black');
    }

    if (dom.topStatusText) {
      if (status.status === 'checkmate') dom.topStatusText.textContent = t.checkmateBanner(status.winner);
      else if (status.status === 'stalemate') dom.topStatusText.textContent = t.stalemateBanner;
      else if (status.status === 'draw-50moves') dom.topStatusText.textContent = t.draw50Banner;
      else if (status.status === 'draw-material') dom.topStatusText.textContent = t.drawMaterialBanner;
      else dom.topStatusText.textContent = gameState.turn === 'w' ? t.whiteToMove : t.blackToMove;
    }

    if (dom.checkAlertPill) {
      dom.checkAlertPill.style.display = (status.status === 'check') ? 'inline-block' : 'none';
    }
  }

  // --- CLOCK & TIMERS ---
  function formatTime(totalSec) {
    if (isNaN(totalSec) || totalSec < 0) totalSec = 0;
    const m = Math.floor(totalSec / 60);
    const s = Math.floor(totalSec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function updateClocksDisplay() {
    if (selectedTimeControl <= 0) {
      if (dom.topTimer) dom.topTimer.style.display = 'none';
      if (dom.bottomTimer) dom.bottomTimer.style.display = 'none';
      return;
    }

    if (dom.topTimer) dom.topTimer.style.display = 'block';
    if (dom.bottomTimer) dom.bottomTimer.style.display = 'block';

    const myClock = (myColor === 'b') ? blackClockSec : whiteClockSec;
    const oppClock = (myColor === 'b') ? whiteClockSec : blackClockSec;

    if (dom.bottomTimer) {
      dom.bottomTimer.textContent = formatTime(myClock);
      if (myClock <= 60 && gameState.turn === myColor) {
        dom.bottomTimer.classList.add('time-warning');
      } else {
        dom.bottomTimer.classList.remove('time-warning');
      }
    }

    if (dom.topTimer) {
      dom.topTimer.textContent = formatTime(oppClock);
      const oppColor = (myColor === 'b') ? 'w' : 'b';
      if (oppClock <= 60 && gameState.turn === oppColor) {
        dom.topTimer.classList.add('time-warning');
      } else {
        dom.topTimer.classList.remove('time-warning');
      }
    }
  }

  function startClientClock() {
    stopClientClock();
    if (selectedTimeControl <= 0) return;
    clockTimerInterval = setInterval(() => {
      const status = chessLogic.getGameStatus(gameState);
      if (status.status !== 'active' && status.status !== 'check') {
        stopClientClock();
        return;
      }
      if (gameState.turn === 'w') {
        whiteClockSec = Math.max(0, whiteClockSec - 1);
      } else {
        blackClockSec = Math.max(0, blackClockSec - 1);
      }
      updateClocksDisplay();
    }, 1000);
  }

  function stopClientClock() {
    if (clockTimerInterval) {
      clearInterval(clockTimerInterval);
      clockTimerInterval = null;
    }
  }

  function updatePlayerOnlineStatus(pos, isOnline) {
    const el = pos === 'top' ? dom.topOnlineStatus : dom.bottomOnlineStatus;
    if (!el) return;
    if (isOnline) {
      el.className = 'online-indicator online';
      el.title = (currentLang === 'fa') ? 'آنلاین' : 'Online';
    } else {
      el.className = 'online-indicator offline';
      el.title = (currentLang === 'fa') ? 'آفلاین (قطع ارتباط)' : 'Offline (Disconnected)';
    }
  }

  // --- SQUARE CLICK & MOVE HANDLER ---
  function onSquareClicked(sqIdx) {
    if (botThinkingTimeout) return; // Prevent move while bot thinks

    const status = chessLogic.getGameStatus(gameState);
    if (status.status === 'checkmate' || status.status === 'stalemate' || status.status.startsWith('draw-')) {
      return;
    }

    // If online mode, verify player controls this turn
    if (mode === 'ONLINE' && myColor !== gameState.turn) {
      return;
    }

    hintSquares = null; // Clear hint if any
    const piece = gameState.board[sqIdx];
    const isPieceFriendly = piece && (gameState.turn === 'w' ? piece === piece.toUpperCase() : piece === piece.toLowerCase());

    // 1. If clicking a destination square for current selection
    if (selectedSquare !== null) {
      // If clicking the same selected piece again -> deselect it
      if (selectedSquare === sqIdx) {
        selectedSquare = null;
        legalMovesForSelected = [];
        renderBoard();
        return;
      }

      const validMove = legalMovesForSelected.find(m => m.to === sqIdx);
      if (validMove) {
        // Check if pawn promotion
        if (validMove.promotion) {
          pendingPromotionMove = validMove;
          showPromotionModal(validMove);
          return;
        }

        executeMove(validMove);
        selectedSquare = null;
        legalMovesForSelected = [];
        return;
      }
    }

    // 2. Select a friendly piece
    if (isPieceFriendly) {
      selectedSquare = sqIdx;
      legalMovesForSelected = chessLogic.getLegalMoves(gameState, sqIdx);
      renderBoard();
      return;
    }

    // 3. Clicked empty square or opponent square without valid move -> deselect
    selectedSquare = null;
    legalMovesForSelected = [];
    renderBoard();
  }

  function executeMove(move) {
    const san = chessLogic.moveToSan(gameState, move);
    const wasCapture = !!move.captured || !!move.isEnPassant;
    const wasCastle = !!move.isCastle;

    chessLogic.makeMove(gameState, move);
    lastMove = { from: move.from, to: move.to };

    // Play procedural sound
    const nextStatus = chessLogic.getGameStatus(gameState);
    if (nextStatus.status === 'checkmate') {
      chessSound.playVictory();
    } else if (nextStatus.status === 'check') {
      chessSound.playCheck();
    } else if (wasCapture) {
      chessSound.playCapture();
    } else if (wasCastle) {
      chessSound.playCastle();
    } else {
      chessSound.playMove();
    }

    appendMoveToHistory(san);
    renderBoard();

    // Check game termination
    if (nextStatus.status !== 'active' && nextStatus.status !== 'check') {
      handleGameOver(nextStatus);
      return;
    }

    // In Solo mode, trigger AI bot response if it's bot's turn
    if (mode === 'SOLO' && gameState.turn !== myColor) {
      triggerBotTurn();
    }

    // In Online mode, broadcast move via WebSocket
    if (mode === 'ONLINE') {
      sendWsMessage({ type: 'CHESS_MOVE', move, fen: chessLogic.toFen(gameState) });
    }
  }

  function showPromotionModal(move) {
    if (!dom.modalPromotion) return;
    const isWhite = move.piece === move.piece.toUpperCase();

    // Set symbols in modal
    const symQ = document.getElementById('promo-sym-q');
    const symR = document.getElementById('promo-sym-r');
    const symB = document.getElementById('promo-sym-b');
    const symN = document.getElementById('promo-sym-n');
    if (symQ) symQ.textContent = isWhite ? '♕' : '♛';
    if (symR) symR.textContent = isWhite ? '♖' : '♜';
    if (symB) symB.textContent = isWhite ? '♗' : '♝';
    if (symN) symN.textContent = isWhite ? '♘' : '♞';

    dom.modalPromotion.classList.add('active');
  }

  function handlePromotionChoice(pieceChar) {
    if (!pendingPromotionMove) return;
    if (dom.modalPromotion) dom.modalPromotion.classList.remove('active');

    const move = { ...pendingPromotionMove, promotion: pieceChar };
    pendingPromotionMove = null;
    selectedSquare = null;
    legalMovesForSelected = [];
    executeMove(move);
  }

  // --- BOT ENGINE (SOLO PLAY) ---
  function triggerBotTurn() {
    const delay = 450 + Math.random() * 450;
    botThinkingTimeout = setTimeout(() => {
      botThinkingTimeout = null;
      const bestMove = chessLogic.getBestMove(gameState, botDifficulty);
      if (bestMove) {
        // Auto-promote to Queen for AI
        if (bestMove.promotion && !bestMove.promotion) {
          bestMove.promotion = 'q';
        }
        executeMove(bestMove);
      }
    }, delay);
  }

  function handleGameOver(status) {
    stopClientClock();
    const t = CHESS_I18N[currentLang];
    if (dom.gameOverTitle) dom.gameOverTitle.textContent = (currentLang === 'fa') ? '🏆 پایان مسابقه!' : '🏆 Game Over!';
    
    let resultText = '';
    let icon = '🤝';

    if (status.status === 'checkmate') {
      icon = '👑';
      resultText = t.checkmateBanner(status.winner);
      if (status.winner === myColor) chessSound.playVictory();
      else chessSound.playDefeat();
    } else if (status.status === 'timeout') {
      icon = '⏱️';
      const winnerName = status.winner === 'w' ? (currentLang === 'fa' ? 'سفید ⚪' : 'White ⚪') : (currentLang === 'fa' ? 'سیاه ⚫' : 'Black ⚫');
      resultText = (currentLang === 'fa') ? `⏱️ زمان به پایان رسید! ${winnerName} برنده شد.` : `⏱️ Time ran out! ${winnerName} won on time.`;
      if (status.winner === myColor) chessSound.playVictory();
      else chessSound.playDefeat();
    } else if (status.status === 'forfeit') {
      icon = '🏆';
      const winnerName = status.winner === 'w' ? (currentLang === 'fa' ? 'سفید ⚪' : 'White ⚪') : (currentLang === 'fa' ? 'سیاه ⚫' : 'Black ⚫');
      resultText = (currentLang === 'fa') ? `🔴 بازیکن حریف بیش از ۵ دقیقه آفلاین بود. ${winnerName} برنده شد!` : `🔴 Opponent was offline for 5 minutes. ${winnerName} wins by forfeit!`;
      if (status.winner === myColor) chessSound.playVictory();
      else chessSound.playDefeat();
    } else if (status.resignedSeat !== undefined) {
      icon = '🏳️';
      resultText = (currentLang === 'fa') ? '🏳️ بازیکن تسلیم شد.' : '🏳️ Player resigned.';
    } else if (status.status === 'stalemate') {
      resultText = t.stalemateBanner;
    } else if (status.status === 'draw-50moves') {
      resultText = t.draw50Banner;
    } else if (status.status === 'draw-material') {
      resultText = t.drawMaterialBanner;
    } else {
      resultText = (currentLang === 'fa') ? 'بازی پایان یافت.' : 'Game over.';
    }

    if (dom.resultBadgeIcon) dom.resultBadgeIcon.textContent = icon;
    if (dom.resultMainText) dom.resultMainText.textContent = resultText;
    if (dom.gameOverDesc) dom.gameOverDesc.textContent = resultText;
    if (dom.modalGameOver) dom.modalGameOver.classList.add('active');
  }

  // --- MOVE HISTORY LOG (PGN TABLE) ---
  function appendMoveToHistory(san) {
    if (!dom.movesTbody) return;
    const isWhiteMove = gameState.turn === 'b'; // Because turn already switched!

    if (isWhiteMove) {
      const row = document.createElement('tr');
      row.id = `move-row-${gameState.fullmoveNumber}`;
      row.innerHTML = `
        <td class="move-num">${gameState.fullmoveNumber}.</td>
        <td class="move-cell" id="san-w-${gameState.fullmoveNumber}">${san}</td>
        <td class="move-cell" id="san-b-${gameState.fullmoveNumber}"></td>
      `;
      dom.movesTbody.appendChild(row);
    } else {
      const blackCell = document.getElementById(`san-b-${gameState.fullmoveNumber}`);
      if (blackCell) {
        blackCell.textContent = san;
      }
    }

    if (dom.movesContainer) dom.movesContainer.scrollTop = dom.movesContainer.scrollHeight;
  }

  function resetGame() {
    if (botThinkingTimeout) clearTimeout(botThinkingTimeout);
    botThinkingTimeout = null;

    gameState = chessLogic.parseFen();
    selectedSquare = null;
    legalMovesForSelected = [];
    pendingPromotionMove = null;
    lastMove = null;
    hintSquares = null;

    if (dom.movesTbody) dom.movesTbody.innerHTML = '';
    if (dom.modalGameOver) dom.modalGameOver.classList.remove('active');
    if (dom.modalPromotion) dom.modalPromotion.classList.remove('active');

    renderBoard();
    appendChat(null, (currentLang === 'fa') ? 'بازی جدید شطرنج آغاز شد. موفق باشید!' : 'New chess game started. Good luck!', true);

    if (mode === 'SOLO' && myColor === 'b') {
      triggerBotTurn();
    }
  }

  function undoLastMove() {
    if (mode === 'ONLINE') return; // Cannot undo in online match
    if (botThinkingTimeout) return;

    // Undo 2 plies in solo mode (bot move + player move)
    chessLogic.undoMove(gameState);
    if (myColor !== gameState.turn) {
      chessLogic.undoMove(gameState);
    }

    selectedSquare = null;
    legalMovesForSelected = [];
    lastMove = null;
    hintSquares = null;

    // Refresh history table
    rebuildMoveHistory();
    renderBoard();
  }

  function rebuildMoveHistory() {
    if (!dom.movesTbody) return;
    dom.movesTbody.innerHTML = '';
    // Rebuild from gameState.history
    const history = gameState.history || [];
    let curMoveNum = 1;

    for (let i = 0; i < history.length; i++) {
      const item = history[i];
      const isWhite = i % 2 === 0;
      // Reconstruct SAN
      const san = item.move.san || chessLogic.moveToSan({ board: item.board, turn: isWhite ? 'w' : 'b', castling: item.castling, enPassant: item.enPassant }, item.move);

      if (isWhite) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td class="move-num">${curMoveNum}.</td>
          <td class="move-cell">${san}</td>
          <td class="move-cell" id="rebuilt-b-${curMoveNum}"></td>
        `;
        dom.movesTbody.appendChild(row);
      } else {
        const bCell = document.getElementById(`rebuilt-b-${curMoveNum}`);
        if (bCell) bCell.textContent = san;
        curMoveNum++;
      }
    }
  }

  function giveHint() {
    if (botThinkingTimeout) return;
    const bestMove = chessLogic.getBestMove(gameState, 'hard');
    if (bestMove) {
      hintSquares = { from: bestMove.from, to: bestMove.to };
      renderBoard();
      chessSound.playNotification();
      showNotification((currentLang === 'fa') ? `پیشنهاد هوش مصنوعی: ${chessLogic.moveToSan(gameState, bestMove)}` : `AI Hint: ${chessLogic.moveToSan(gameState, bestMove)}`);
    }
  }

  function resignGame() {
    const t = CHESS_I18N[currentLang];
    const myName = (myColor === 'w') ? ((currentLang === 'fa') ? 'سفید' : 'White') : ((currentLang === 'fa') ? 'سیاه' : 'Black');
    showNotification(t.resignedBanner(myName));
    if (mode === 'ONLINE') {
      sendWsMessage({ type: 'CHESS_RESIGN' });
    } else {
      handleGameOver({
        status: 'checkmate',
        winner: myColor === 'w' ? 'b' : 'w'
      });
    }
  }

  function flipBoard() {
    isBoardFlipped = !isBoardFlipped;
    renderBoard();
  }

  function openMultiplayerModal() {
    if (dom.modalMainMenu) dom.modalMainMenu.classList.remove('active');
    if (dom.modalRules) dom.modalRules.classList.remove('active');
    if (dom.modalGameOver) dom.modalGameOver.classList.remove('active');
    if (dom.modalMultiplayer) dom.modalMultiplayer.classList.add('active');
    ensureWebSocket();
  }

  // --- MULTIPLAYER & WEBSOCKET ENGINE ---
  function ensureWebSocket(onOpen) {
    if (onlineWs && (onlineWs.readyState === WebSocket.OPEN || onlineWs.readyState === WebSocket.CONNECTING)) {
      if (onlineWs.readyState === WebSocket.OPEN && onOpen) onOpen();
      return;
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    onlineWs = new WebSocket(wsUrl);

    onlineWs.onopen = () => {
      while (wsQueue.length > 0) onlineWs.send(wsQueue.shift());
      if (onOpen) onOpen();
    };

    onlineWs.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        handleServerMessage(msg);
      } catch (err) {
        console.error('Failed to parse WS msg:', err);
      }
    };

    onlineWs.onclose = () => {
      onlineWs = null;
    };
  }

  function sendWsMessage(data) {
    const str = JSON.stringify(data);
    if (onlineWs && onlineWs.readyState === WebSocket.OPEN) {
      onlineWs.send(str);
    } else {
      wsQueue.push(str);
      ensureWebSocket();
    }
  }

  function handleServerMessage(msg) {
    const { type } = msg;

    if (type === 'ROOM_CREATED' || type === 'ROOM_JOINED') {
      mode = 'ONLINE';
      if (dom.modalMainMenu) dom.modalMainMenu.classList.remove('active');
      mySeat = (msg.seat !== undefined) ? msg.seat : 0;
      myColor = (mySeat === 0) ? 'w' : 'b';
      isBoardFlipped = (myColor === 'b');
      if (dom.mpRoomCode) dom.mpRoomCode.textContent = msg.roomCode;
      if (dom.mpEntryView) dom.mpEntryView.style.display = 'none';
      if (dom.mpLobbyView) dom.mpLobbyView.style.display = 'block';
      window.location.hash = msg.roomCode;
      appendChat(null, (currentLang === 'fa') ? `به اتاق ${msg.roomCode} به عنوان ${myColor === 'w' ? 'سفید ⚪' : 'سیاه ⚫'} پیوستید.` : `Joined room ${msg.roomCode} as ${myColor === 'w' ? 'White ⚪' : 'Black ⚫'}.`, true);
      return;
    }

    if (type === 'LOBBY_UPDATE') {
      if (dom.modalMainMenu) dom.modalMainMenu.classList.remove('active');
      if (msg.yourSeat !== undefined && msg.yourSeat !== -1) {
        mySeat = msg.yourSeat;
        myColor = msg.yourColor || (mySeat === 0 ? 'w' : 'b');
        isBoardFlipped = (myColor === 'b');
      }
      if (msg.timeControl !== undefined) {
        selectedTimeControl = msg.timeControl;
        whiteClockSec = selectedTimeControl;
        blackClockSec = selectedTimeControl;
      }
      renderLobby(msg);
      return;
    }

    if (type === 'GAME_STARTED' || type === 'CHESS_STATE_UPDATE') {
      mode = 'ONLINE';
      if (dom.modalMultiplayer) dom.modalMultiplayer.classList.remove('active');
      if (dom.modalGameOver) dom.modalGameOver.classList.remove('active');
      if (dom.difficultyBar) dom.difficultyBar.style.display = 'none';
      if (dom.btnUndoMove) dom.btnUndoMove.style.display = 'none';
      if (dom.btnHintMove) dom.btnHintMove.style.display = 'none';

      if (msg.yourSeat !== undefined && msg.yourSeat !== -1) {
        mySeat = msg.yourSeat;
      }
      if (msg.yourColor) {
        myColor = msg.yourColor;
      } else if (mySeat !== -1) {
        myColor = (mySeat === 0) ? 'w' : 'b';
      }
      isBoardFlipped = (myColor === 'b');

      if (msg.timeControl !== undefined) selectedTimeControl = msg.timeControl;
      if (msg.whiteTime !== undefined) whiteClockSec = msg.whiteTime;
      if (msg.blackTime !== undefined) blackClockSec = msg.blackTime;
      startClientClock();
      updateClocksDisplay();

      // Update player nameplates according to seat orientation
      const whiteSeat = (msg.seats && msg.seats[0]) || { name: 'White Player', isBot: false, connected: true };
      const blackSeat = (msg.seats && msg.seats[1]) || { name: 'Black Player', isBot: true, connected: true };

      const bottomSeat = (myColor === 'b') ? blackSeat : whiteSeat;
      const topSeat = (myColor === 'b') ? whiteSeat : blackSeat;
      const bottomColor = myColor;
      const topColor = (myColor === 'b') ? 'w' : 'b';

      if (dom.bottomPlayerName) dom.bottomPlayerName.textContent = `${bottomSeat.name} (${bottomColor === 'w' ? (currentLang === 'fa' ? 'سفید - شما' : 'White - You') : (currentLang === 'fa' ? 'سیاه - شما' : 'Black - You')})`;
      if (dom.topPlayerName) dom.topPlayerName.textContent = `${topSeat.name} (${topColor === 'w' ? (currentLang === 'fa' ? 'سفید' : 'White') : (currentLang === 'fa' ? 'سیاه' : 'Black')})`;
      if (dom.bottomColorMarker) dom.bottomColorMarker.className = `player-color-marker ${bottomColor === 'w' ? 'white' : 'black'}`;
      if (dom.topColorMarker) dom.topColorMarker.className = `player-color-marker ${topColor === 'w' ? 'white' : 'black'}`;
      if (dom.bottomAvatar) dom.bottomAvatar.textContent = bottomSeat.isBot ? '🤖' : '👤';
      if (dom.topAvatar) dom.topAvatar.textContent = topSeat.isBot ? '🤖' : '👤';

      updatePlayerOnlineStatus('bottom', bottomSeat.isBot ? true : bottomSeat.connected);
      updatePlayerOnlineStatus('top', topSeat.isBot ? true : topSeat.connected);

      if (msg.fen) {
        gameState = chessLogic.parseFen(msg.fen);
        renderBoard();
      }
      return;
    }

    if (type === 'CHESS_MOVE_BROADCAST') {
      if (msg.whiteTime !== undefined) whiteClockSec = msg.whiteTime;
      if (msg.blackTime !== undefined) blackClockSec = msg.blackTime;
      updateClocksDisplay();

      if (msg.move) {
        if (msg.seat === mySeat) {
          // You already executed this move locally! Keep FEN perfectly synchronized
          if (msg.fen) {
            gameState = chessLogic.parseFen(msg.fen);
          }
          return;
        }

        // Opponent's move
        const wasCapture = !!msg.move.captured || !!msg.move.isEnPassant;
        const wasCastle = !!msg.move.isCastle;
        chessLogic.makeMove(gameState, msg.move);
        if (msg.fen) {
          gameState = chessLogic.parseFen(msg.fen);
        }
        lastMove = { from: msg.move.from, to: msg.move.to };

        const nextStatus = chessLogic.getGameStatus(gameState);
        if (nextStatus.status === 'checkmate') {
          chessSound.playDefeat();
          handleGameOver(nextStatus);
        } else if (nextStatus.status === 'check') {
          chessSound.playCheck();
        } else if (wasCapture) {
          chessSound.playCapture();
        } else if (wasCastle) {
          chessSound.playCastle();
        } else {
          chessSound.playMove();
        }

        appendMoveToHistory(msg.san || chessLogic.moveToSan(gameState, msg.move));
        renderBoard();
      }
      return;
    }

    if (type === 'GAME_OVER') {
      if (msg.gameStatus) {
        handleGameOver(msg.gameStatus);
      }
      return;
    }

    if (type === 'CHAT_MESSAGE' || type === 'CHAT') {
      appendChat(msg.sender, msg.text, false);
      return;
    }

    if (type === 'ERROR') {
      showNotification(msg.message || 'Error occurred');
      return;
    }
  }

  function renderLobby(lobbyData) {
    if (!dom.lobbySeatsContainer) return;
    dom.lobbySeatsContainer.innerHTML = '';
    const seats = lobbyData.seats || [];
    const isHost = lobbyData.isHost;

    if (dom.lobbyNameInput && document.activeElement !== dom.lobbyNameInput) {
      const mySeatObj = seats.find(s => s.isMe);
      if (mySeatObj && mySeatObj.name) {
        dom.lobbyNameInput.value = mySeatObj.name;
      } else {
        dom.lobbyNameInput.value = localStorage.getItem('rubik_player_name') || 'Player';
      }
    }

    if (dom.btnStartOnlineGame && dom.lobbyWaitingMsg) {
      if (isHost) {
        dom.btnStartOnlineGame.style.display = 'block';
        if (dom.btnSwapChessSeats) dom.btnSwapChessSeats.style.display = 'inline-flex';
        dom.lobbyWaitingMsg.style.display = 'none';
      } else {
        dom.btnStartOnlineGame.style.display = 'none';
        if (dom.btnSwapChessSeats) dom.btnSwapChessSeats.style.display = 'none';
        dom.lobbyWaitingMsg.style.display = 'block';
      }
    }

    if (dom.lobbyTimeSelect) {
      if (lobbyData.timeControl !== undefined) {
        dom.lobbyTimeSelect.value = String(lobbyData.timeControl);
        selectedTimeControl = lobbyData.timeControl;
        whiteClockSec = selectedTimeControl;
        blackClockSec = selectedTimeControl;
      }
      dom.lobbyTimeSelect.disabled = !isHost;
    }

    const labels = [
      { color: 'w', title: (currentLang === 'fa') ? 'سفید ⚪ (White)' : 'White ⚪' },
      { color: 'b', title: (currentLang === 'fa') ? 'سیاه ⚫ (Black)' : 'Black ⚫' }
    ];

    seats.slice(0, 2).forEach((seat, idx) => {
      const card = document.createElement('div');
      card.className = 'lobby-seat-card' + (seat.isMe ? ' is-you' : '');

      const isBot = !!seat.isBot;
      const isMe = !!seat.isMe;
      const isSeatHost = !!seat.isHost;
      const isOnline = isBot ? true : !!seat.isOnline;

      const infoDiv = document.createElement('div');
      infoDiv.innerHTML = `
        <span style="font-weight:800; color:var(--gold-primary);">${labels[idx].title}</span>
        <div style="font-weight:700; margin-top:2px;">
          ${isSeatHost ? '👑 ' : ''}${escapeHtml(seat.name)}
          ${isMe ? `<span style="font-size:0.75rem; color:var(--gold-primary); margin-right:4px;">${currentLang === 'fa' ? '(شما)' : '(You)'}</span>` : ''}
        </div>
        <div>
          ${isBot ? '<span style="font-size:0.75rem; color:#94a3b8;">(Bot 🤖)</span>' : `<span class="seat-online-badge ${isOnline ? 'online' : 'offline'}">${isOnline ? (currentLang === 'fa' ? '🟢 آنلاین' : '🟢 Online') : (currentLang === 'fa' ? '🔴 آفلاین' : '🔴 Offline')}</span>`}
        </div>
      `;
      card.appendChild(infoDiv);

      // Actions: If seat is a bot and not occupied by me -> allow taking seat (CLAIM_SEAT)
      if (isBot && !isMe) {
        const btnClaim = document.createElement('button');
        btnClaim.type = 'button';
        btnClaim.className = 'btn-seat-action';
        btnClaim.textContent = (currentLang === 'fa') ? 'انتخاب این رنگ' : 'Take Seat';
        btnClaim.addEventListener('click', (e) => {
          e.stopPropagation();
          const pName = (dom.lobbyNameInput?.value || dom.inputPlayerName?.value || localStorage.getItem('rubik_player_name') || 'Player').trim();
          sendWsMessage({
            type: 'CLAIM_SEAT',
            seat: idx,
            playerName: pName
          });
        });
        card.appendChild(btnClaim);
      }

      dom.lobbySeatsContainer.appendChild(card);
    });
  }

  function handleLobbyNameChange() {
    if (!dom.lobbyNameInput) return;
    const newName = dom.lobbyNameInput.value.trim().slice(0, 15);
    if (!newName) return;
    if (dom.inputPlayerName) dom.inputPlayerName.value = newName;
    localStorage.setItem('rubik_player_name', newName);

    sendWsMessage({
      type: 'CHANGE_NAME',
      name: newName
    });
    showNotification((currentLang === 'fa') ? `نام شما به «${newName}» ذخیره شد.` : `Your name saved as "${newName}".`);
  }

  function openSoloSetupModal() {
    if (dom.modalMainMenu) dom.modalMainMenu.classList.remove('active');
    if (dom.modalMultiplayer) dom.modalMultiplayer.classList.remove('active');
    if (dom.modalSoloSetup) dom.modalSoloSetup.classList.add('active');
  }

  function startSoloGame(chosenColor = 'w') {
    if (chosenColor === 'random') {
      chosenColor = (Math.random() < 0.5) ? 'w' : 'b';
    }
    mode = 'SOLO';
    mySeat = (chosenColor === 'w') ? 0 : 1;
    myColor = chosenColor;
    isBoardFlipped = (myColor === 'b');
    selectedTimeControl = 0; // In solo mode, timers hidden
    stopClientClock();

    if (dom.topTimer) dom.topTimer.style.display = 'none';
    if (dom.bottomTimer) dom.bottomTimer.style.display = 'none';

    if (dom.modalMainMenu) dom.modalMainMenu.classList.remove('active');
    if (dom.modalSoloSetup) dom.modalSoloSetup.classList.remove('active');
    if (dom.modalMultiplayer) dom.modalMultiplayer.classList.remove('active');
    if (dom.btnMenuResume) dom.btnMenuResume.style.display = 'inline-flex';
    if (dom.difficultyBar) dom.difficultyBar.style.display = 'flex';
    if (dom.btnUndoMove) dom.btnUndoMove.style.display = 'flex';
    if (dom.btnHintMove) dom.btnHintMove.style.display = 'flex';

    const pName = localStorage.getItem('rubik_player_name') || 'Player';
    if (myColor === 'b') {
      if (dom.bottomPlayerName) dom.bottomPlayerName.textContent = `${pName} (${currentLang === 'fa' ? 'سیاه - شما' : 'Black - You'})`;
      if (dom.topPlayerName) dom.topPlayerName.textContent = (currentLang === 'fa') ? 'ربات شطرنج (سفید)' : 'Chess Bot (White)';
      if (dom.bottomColorMarker) dom.bottomColorMarker.className = 'player-color-marker black';
      if (dom.topColorMarker) dom.topColorMarker.className = 'player-color-marker white';
    } else {
      if (dom.bottomPlayerName) dom.bottomPlayerName.textContent = `${pName} (${currentLang === 'fa' ? 'سفید - شما' : 'White - You'})`;
      if (dom.topPlayerName) dom.topPlayerName.textContent = (currentLang === 'fa') ? 'ربات شطرنج (سیاه)' : 'Chess Bot (Black)';
      if (dom.bottomColorMarker) dom.bottomColorMarker.className = 'player-color-marker white';
      if (dom.topColorMarker) dom.topColorMarker.className = 'player-color-marker black';
    }
    if (dom.topAvatar) dom.topAvatar.textContent = '🤖';
    if (dom.bottomAvatar) dom.bottomAvatar.textContent = '👤';

    updatePlayerOnlineStatus('bottom', true);
    updatePlayerOnlineStatus('top', true);

    resetGame();
  }

  // --- EVENT LISTENERS ---
  function setupEventListeners() {
    if (dom.btnSound) {
      dom.btnSound.addEventListener('click', () => {
        chessSound.toggleMute();
        dom.btnSound.textContent = chessSound.isMuted() ? '🔇' : '🔊';
        if (dom.mobSoundIcon) dom.mobSoundIcon.textContent = chessSound.isMuted() ? '🔇' : '🔊';
      });
    }

    if (dom.btnMobSound) {
      dom.btnMobSound.addEventListener('click', () => {
        chessSound.toggleMute();
        if (dom.btnSound) dom.btnSound.textContent = chessSound.isMuted() ? '🔇' : '🔊';
        if (dom.mobSoundIcon) dom.mobSoundIcon.textContent = chessSound.isMuted() ? '🔇' : '🔊';
      });
    }

    if (dom.btnLang) dom.btnLang.addEventListener('click', toggleLanguage);
    if (dom.btnMobLang) dom.btnMobLang.addEventListener('click', toggleLanguage);

    if (dom.btnFlip) dom.btnFlip.addEventListener('click', flipBoard);
    if (dom.btnMobFlip) {
      dom.btnMobFlip.addEventListener('click', () => {
        dom.mobileNavDropdown.classList.remove('active');
        flipBoard();
      });
    }

    // Multiplayer Buttons
    if (dom.btnMultiplayer) dom.btnMultiplayer.addEventListener('click', openMultiplayerModal);
    if (dom.btnMobMultiplayer) {
      dom.btnMobMultiplayer.addEventListener('click', () => {
        dom.mobileNavDropdown.classList.remove('active');
        openMultiplayerModal();
      });
    }
    if (dom.btnOnlineMatch) dom.btnOnlineMatch.addEventListener('click', openMultiplayerModal);

    if (dom.btnRules) dom.btnRules.addEventListener('click', () => dom.modalRules.classList.add('active'));
    if (dom.btnMobRules) {
      dom.btnMobRules.addEventListener('click', () => {
        dom.mobileNavDropdown.classList.remove('active');
        dom.modalRules.classList.add('active');
      });
    }
    if (dom.btnCloseRules) dom.btnCloseRules.addEventListener('click', () => dom.modalRules.classList.remove('active'));

    if (dom.btnMenu) dom.btnMenu.addEventListener('click', () => dom.modalMainMenu.classList.add('active'));
    if (dom.btnMobMenu) {
      dom.btnMobMenu.addEventListener('click', () => {
        dom.mobileNavDropdown.classList.remove('active');
        dom.modalMainMenu.classList.add('active');
      });
    }

    if (dom.btnMenuSolo) dom.btnMenuSolo.addEventListener('click', openSoloSetupModal);
    if (dom.btnMenuOnline) dom.btnMenuOnline.addEventListener('click', openMultiplayerModal);
    if (dom.btnMenuRules) {
      dom.btnMenuRules.addEventListener('click', () => {
        dom.modalMainMenu.classList.remove('active');
        dom.modalRules.classList.add('active');
      });
    }
    if (dom.btnMenuResume) dom.btnMenuResume.addEventListener('click', () => dom.modalMainMenu.classList.remove('active'));

    // Solo Setup Modal
    if (dom.btnSoloWhite) dom.btnSoloWhite.addEventListener('click', () => startSoloGame('w'));
    if (dom.btnSoloRandom) dom.btnSoloRandom.addEventListener('click', () => startSoloGame('random'));
    if (dom.btnSoloBlack) dom.btnSoloBlack.addEventListener('click', () => startSoloGame('b'));
    if (dom.btnCloseSoloSetup) {
      dom.btnCloseSoloSetup.addEventListener('click', () => {
        if (dom.modalSoloSetup) dom.modalSoloSetup.classList.remove('active');
        if (dom.modalMainMenu) dom.modalMainMenu.classList.add('active');
      });
    }

    // Mobile Hamburger
    if (dom.btnMobileNav && dom.mobileNavDropdown) {
      dom.btnMobileNav.addEventListener('click', (e) => {
        e.stopPropagation();
        dom.mobileNavDropdown.classList.toggle('active');
      });
      document.addEventListener('click', (e) => {
        if (!dom.mobileNavDropdown.contains(e.target) && e.target !== dom.btnMobileNav) {
          dom.mobileNavDropdown.classList.remove('active');
        }
      });
    }

    // Controls
    if (dom.btnUndoMove) dom.btnUndoMove.addEventListener('click', undoLastMove);
    if (dom.btnHintMove) dom.btnHintMove.addEventListener('click', giveHint);
    if (dom.btnNewGame) dom.btnNewGame.addEventListener('click', resetGame);
    if (dom.btnResignGame) dom.btnResignGame.addEventListener('click', resignGame);

    if (dom.btnResultRestart) {
      dom.btnResultRestart.addEventListener('click', () => {
        if (mode === 'ONLINE') {
          if (dom.modalGameOver) dom.modalGameOver.classList.remove('active');
          sendWsMessage({ type: 'START_GAME' });
        } else {
          resetGame();
        }
      });
    }
    if (dom.btnResultMenu) {
      dom.btnResultMenu.addEventListener('click', () => {
        if (dom.modalGameOver) dom.modalGameOver.classList.remove('active');
        if (dom.modalMainMenu) dom.modalMainMenu.classList.add('active');
      });
    }

    // Difficulty Buttons
    document.querySelectorAll('.btn-diff').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.btn-diff').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        botDifficulty = e.currentTarget.dataset.level;
      });
    });

    // Promotion Buttons
    document.querySelectorAll('.btn-promo-piece').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const piece = e.currentTarget.dataset.piece;
        handlePromotionChoice(piece);
      });
    });

    // Copy PGN
    if (dom.btnCopyPgn) {
      dom.btnCopyPgn.addEventListener('click', () => {
        const pgnRows = [];
        const rows = document.querySelectorAll('#moves-tbody tr');
        rows.forEach(r => {
          const num = r.querySelector('.move-num')?.textContent || '';
          const cells = r.querySelectorAll('.move-cell');
          const w = cells[0]?.textContent || '';
          const b = cells[1]?.textContent || '';
          pgnRows.push(`${num} ${w} ${b}`.trim());
        });
        const fullPgn = pgnRows.join(' ');
        navigator.clipboard.writeText(fullPgn).then(() => {
          showNotification((currentLang === 'fa') ? 'تاریخچه حرکات کپی شد!' : 'PGN copied to clipboard!');
        });
      });
    }

    // Chat Drawer Toggle
    if (dom.chatHeader && dom.chatDrawer) {
      dom.chatHeader.addEventListener('click', (e) => {
        if (e.target === dom.btnChatMute || dom.btnChatMute.contains(e.target)) return;
        dom.chatDrawer.classList.toggle('minimized');
        if (dom.chatToggleIcon) {
          dom.chatToggleIcon.textContent = dom.chatDrawer.classList.contains('minimized') ? '▲' : '▼';
        }
        if (!dom.chatDrawer.classList.contains('minimized') && dom.chatBadge) {
          dom.chatBadge.textContent = '0';
          dom.chatBadge.style.display = 'none';
        }
      });
    }

    if (dom.btnChat) {
      dom.btnChat.addEventListener('click', () => {
        if (!dom.chatDrawer) return;
        dom.chatDrawer.classList.toggle('minimized');
      });
    }

    if (dom.btnChatMute) {
      dom.btnChatMute.addEventListener('click', (e) => {
        e.stopPropagation();
        isChatMuted = !isChatMuted;
        dom.btnChatMute.textContent = isChatMuted ? '🔕' : '🔔';
        showNotification(isChatMuted ? 'صدای چت قطع شد' : 'صدای چت فعال شد');
      });
    }

    if (dom.chatToastClose && dom.chatToast) {
      dom.chatToastClose.addEventListener('click', () => dom.chatToast.style.display = 'none');
    }

    if (dom.btnSendChat && dom.chatInput) {
      const sendAction = () => {
        const val = dom.chatInput.value.trim();
        if (!val) return;
        dom.chatInput.value = '';
        if (mode === 'SOLO') {
          appendChat((currentLang === 'fa') ? 'شما' : 'You', val, false);
        } else {
          sendWsMessage({ type: 'CHAT_MESSAGE', text: val });
        }
      };
      dom.btnSendChat.addEventListener('click', sendAction);
      dom.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendAction();
      });
    }

    // Multiplayer Buttons
    if (dom.btnCreateRoom) {
      dom.btnCreateRoom.addEventListener('click', () => {
        const pName = (dom.inputPlayerName?.value || dom.lobbyNameInput?.value || localStorage.getItem('rubik_player_name') || 'Player').trim();
        localStorage.setItem('rubik_player_name', pName);
        ensureWebSocket(() => {
          sendWsMessage({ type: 'CREATE_ROOM', gameType: 'chess', playerName: pName });
        });
      });
    }

    if (dom.btnShowJoin) {
      dom.btnShowJoin.addEventListener('click', () => {
        if (dom.mpJoinFields) dom.mpJoinFields.style.display = 'block';
      });
    }

    if (dom.btnConfirmJoin) {
      dom.btnConfirmJoin.addEventListener('click', () => {
        const code = (dom.inputRoomCode.value || '').trim().toUpperCase();
        const pName = (dom.inputPlayerName?.value || dom.lobbyNameInput?.value || localStorage.getItem('rubik_player_name') || 'Player').trim();
        localStorage.setItem('rubik_player_name', pName);
        if (!code) return;
        ensureWebSocket(() => {
          sendWsMessage({ type: 'JOIN_ROOM', roomCode: code, playerName: pName });
        });
      });
    }

    if (dom.btnPlayOffline) dom.btnPlayOffline.addEventListener('click', openSoloSetupModal);

    if (dom.lobbyTimeSelect) {
      dom.lobbyTimeSelect.addEventListener('change', () => {
        const val = parseInt(dom.lobbyTimeSelect.value, 10);
        selectedTimeControl = val;
        whiteClockSec = val;
        blackClockSec = val;
        sendWsMessage({ type: 'SET_TIME_CONTROL', timeControl: val });
      });
    }

    if (dom.btnCloseMp) {
      dom.btnCloseMp.addEventListener('click', () => {
        dom.modalMultiplayer.classList.remove('active');
        dom.modalMainMenu.classList.add('active');
      });
    }

    if (dom.btnSwapChessSeats) {
      dom.btnSwapChessSeats.addEventListener('click', () => {
        sendWsMessage({ type: 'SWAP_SEATS', seatA: 0, seatB: 1 });
      });
    }

    if (dom.btnStartOnlineGame) {
      dom.btnStartOnlineGame.addEventListener('click', () => {
        sendWsMessage({ type: 'START_GAME' });
      });
    }

    if (dom.btnLeaveRoom) {
      dom.btnLeaveRoom.addEventListener('click', () => {
        if (onlineWs) onlineWs.close();
        if (dom.mpLobbyView) dom.mpLobbyView.style.display = 'none';
        if (dom.mpEntryView) dom.mpEntryView.style.display = 'block';
        window.location.hash = '';
        dom.modalMainMenu.classList.add('active');
      });
    }

    if (dom.btnSaveLobbyName) {
      dom.btnSaveLobbyName.addEventListener('click', handleLobbyNameChange);
    }

    if (dom.lobbyNameInput) {
      dom.lobbyNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleLobbyNameChange();
        }
      });
    }

    if (dom.btnCopyRoomLink) {
      dom.btnCopyRoomLink.addEventListener('click', () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
          showNotification((currentLang === 'fa') ? 'لینک اتاق کپی شد!' : 'Room link copied!');
        });
      });
    }
  }

  function checkUrlHash() {
    const hash = (window.location.hash || '').replace('#', '').trim().toUpperCase();
    if (hash === 'ONLINE') {
      openMultiplayerModal();
      return true;
    } else if (hash.length >= 3) {
      openMultiplayerModal();
      if (dom.mpJoinFields) dom.mpJoinFields.style.display = 'block';
      if (dom.inputRoomCode) dom.inputRoomCode.value = hash;
      const pName = localStorage.getItem('rubik_player_name') || 'Player';
      ensureWebSocket(() => {
        sendWsMessage({ type: 'JOIN_ROOM', roomCode: hash, playerName: pName });
      });
      return true;
    }
    return false;
  }

  // --- INITIALIZATION ---
  window.addEventListener('DOMContentLoaded', () => {
    initDom();
    setupEventListeners();
    setLanguage(localStorage.getItem('rubik_card_lang') || 'fa');

    // Retrieve saved player name (defaults to 'Player')
    const savedPlayerName = localStorage.getItem('rubik_player_name') || 'Player';
    if (dom.inputPlayerName) dom.inputPlayerName.value = savedPlayerName;
    if (dom.lobbyNameInput) dom.lobbyNameInput.value = savedPlayerName;

    // Render board once for background
    renderBoard();

    const openedOnline = checkUrlHash();
    if (!openedOnline) {
      // By default show singleplayer/multiplayer selection screen on launch, matching other games
      if (dom.modalMainMenu) dom.modalMainMenu.classList.add('active');
    }
  });

})();
