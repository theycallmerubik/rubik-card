/**
 * Dots and Boxes (نقطه و خط) - Client Application Controller
 * Pure Vanilla JavaScript with responsive SVG/DOM grid, procedural Web Audio,
 * Smart Minimax/Chain Bot, and Real-time WebSocket Multiplayer.
 * Universal Settings: Language (rubik_card_lang), Sound (rubik_card_sound), Player Name (rubik_player_name).
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. I18N DICTIONARY
  // =========================================================================
  const I18N = {
    fa: {
      gameTitle: 'بازی نقطه و خط',
      menuHubTitle: 'هاب بازی‌ها',
      mainMenuTitle: 'بازی نقطه و خط (Dots & Boxes)',
      mainMenuSubtitle: 'بازی دونفره فکری و استراتژیک تسخیر خانه‌ها با هوش مصنوعی و اتاق‌های آنلاین',
      menuSoloTitle: 'بازی تک‌نفره با هوش مصنوعی',
      menuSoloDesc: 'بازی سریع و آفلاین با ربات هوشمند در ابعاد ۶×۶ تا ۲۰×۲۰ نقطه',
      menuPassPlayTitle: 'بازی دو نفره روی یک دستگاه (Pass & Play)',
      menuPassPlayDesc: 'رقابت دونفره آفلاین به نوبت روی همین دستگاه',
      menuOnlineTitle: 'چندنفره آنلاین و شبکه محلی',
      menuOnlineDesc: 'ساخت اتاق اختصاصی، انتخاب ابعاد زمین و دعوت دوستان',
      menuRulesTitle: 'آموزش و قوانین نقطه و خط',
      menuRulesDesc: 'قوانین بستن خانه‌ها، نوبت جایزه و استراتژی دابل‌کراس',
      resumeGame: 'ادامه بازی جاری',
      p1ToMove: 'نوبت: بازیکن ۱ (قرمز)',
      p2ToMove: 'نوبت: بازیکن ۲ (آبی)',
      botThinking: 'ربات در حال تصمیم‌گیری...',
      player1Badge: 'بازیکن ۱ (قرمز)',
      player2Badge: 'بازیکن ۲ (آبی)',
      boxesLabel: 'خانه‌ها',
      undoBtn: 'برگشت',
      restartBtn: 'شروع مجدد',
      newGameBtn: 'منوی بازی',
      setupTitleSolo: '🤖 تنظیمات بازی تک‌نفره با هوش مصنوعی',
      setupTitlePass: '👥 تنظیمات بازی دو نفره روی یک دستگاه',
      gridDotsLabel: 'تعداد نقطه‌های زمین بازی:',
      dots6: 'کوچک (۶ × ۶ نقطه)',
      boxes25: '۵ × ۵ خانه (۲۵ خانه)',
      dots10: 'متوسط (۱۰ × ۱۰ نقطه)',
      boxes81: '۹ × ۹ خانه (۸۱ خانه)',
      dots15: 'بزرگ (۱۵ × ۱۵ نقطه)',
      boxes196: '۱۴ × ۱۴ خانه (۱۹۶ خانه)',
      dots20: 'خیلی بزرگ (۲۰ × ۲۰ نقطه)',
      boxes361: '۱۹ × ۱۹ خانه (۳۶۱ خانه)',
      difficultyLabel: 'درجه سختی ربات:',
      diffEasy: 'آسان',
      diffMed: 'متوسط',
      diffHard: 'سخت (استاد)',
      timerLabel: 'زمان هر نوبت:',
      timerOff: 'نامحدود',
      timer30: '۳۰ ثانیه',
      timer60: '۶۰ ثانیه',
      startGameBtn: 'شروع مسابقه',
      backBtn: 'بازگشت',
      multiplayerTitle: 'اتاق نقطه و خط آنلاین / شبکه محلی',
      multiplayerDesc: 'اتاق بسازید یا با کد ۴ حرفی اتاق به رقابت با دوستانتان ملحق شوید.',
      yourNameLabel: 'نام شما:',
      saveNameBtn: 'ثبت نام',
      roomCodeLabel: 'کد اتاق:',
      copyLinkBtn: '📋 کپی لینک',
      createRoomBtn: 'ساخت اتاق جدید',
      joinRoomBtn: 'ورود به اتاق',
      enterRoomCodeLabel: 'کد ۴ حرفی اتاق را وارد نمایید:',
      joinBtn: 'ورود به مسابقه',
      swapColorsBtn: '🔄 تعویض جایگاه',
      waitingForHost: 'در انتظار شروع مسابقه توسط میزبان...',
      leaveRoomBtn: 'خروج از اتاق',
      nameSavedToast: 'نام شما به «{name}» ذخیره شد.',
      takeSeatBtn: 'نشستن در این جایگاه',
      youBadge: '(شما)',
      botBadge: '(ربات 🤖)',
      onlineBadge: '🟢 آنلاین',
      offlineBadge: '🔴 آفلاین',
      redColorTitle: 'قرمز 🔴 (Player 1)',
      blueColorTitle: 'آبی 🔵 (Player 2)',
      rematchBtn: 'بازی مجدد',
      rulesTitle: '📜 قوانین و راهنمای نقطه و خط',
      chatTitle: '💬 پیام‌ها و چت بازی',
      soundLabel: 'صدا',
      multiplayerBtn: 'چندنفره آنلاین',
      winMessageP1: 'بازیکن ۱ پیروز شد! 🏆',
      winMessageP2: 'بازیکن ۲ پیروز شد! 🏆',
      winMessageYou: 'تبریک! شما برنده شدید! 🏆',
      winMessageBot: 'ربات برنده شد! دوباره تلاش کنید.',
      drawMessage: 'بازی مساوی شد! 🤝',
      extraTurnNotice: 'خانه تکمیل شد! نوبت جایزه 🎉',
      doubleCaptureNotice: 'دو خانه همزمان! نوبت جایزه 🔥',
      linkCopied: 'لینک دعوت به کلیپ‌بورد کپی شد!',
      rulesContent: `
        <h4>۱. هدف بازی</h4>
        <p>نقطه و خط یک بازی استراتژیک دونفره است. هدف تصاحب بیشترین تعداد خانه‌های ۱×۱ از طریق کشیدن خطوط بین نقطه‌ها است.</p>
        <h4>۲. کشیدن خطوط</h4>
        <p>هر بازیکن در نوبت خود یک خط افقی یا عمودی بین دو نقطه مجاور رسم می‌کند.</p>
        <h4>۳. تصاحب خانه و نوبت جایزه</h4>
        <p>بازیکنی که چهارمین ضلع یک خانه را کامل کند، آن خانه را تصاحب کرده (رنگ‌آمیزی با رنگ خود و +۱ امتیاز) و <strong>موظف است بلافاصله یک حرکت جایزه انجام دهد</strong>.</p>
        <h4>۴. ابعاد زمین‌های بازی</h4>
        <p>• <strong>کوچک (۶×۶ نقطه)</strong>: ۲۵ خانه، بازی سریع و سرگرم‌کننده.<br>
        • <strong>متوسط (۱۰×۱۰ نقطه)</strong>: ۸۱ خانه، بازی استاندارد و کلاسیک.<br>
        • <strong>بزرگ (۱۵×۱۵ نقطه)</strong>: ۱۹۶ خانه، مبارزه تاکتیکی عمیق.<br>
        • <strong>خیلی بزرگ (۲۰×۲۰ نقطه)</strong>: ۳۶۱ خانه، یک ماراتن استراتژیک تمام‌عیار!</p>
        <h4>۵. استراتژی دابل‌کراس (Double-Cross)</h4>
        <p>در سطوح پیشرفته، باز کردن زنجیره‌ها اهمیت کلیدی دارد. گاهی با فدا کردن ۲ خانه آخر یک زنجیره، نوبت را به حریف می‌دهید تا کنترل زنجیره بعدی در اختیار شما قرار گیرد!</p>
      `
    },
    en: {
      gameTitle: 'Dots and Boxes',
      menuHubTitle: 'Game Hub',
      mainMenuTitle: 'Dots and Boxes (نقطه و خط)',
      mainMenuSubtitle: 'Classic 2-player strategic grid & box capture duel with AI bots and online rooms',
      menuSoloTitle: 'Single Player vs AI',
      menuSoloDesc: 'Fast offline match against smart AI bot from 6x6 up to 20x20 dots',
      menuPassPlayTitle: 'Two Players on Same Device (Pass & Play)',
      menuPassPlayDesc: 'Offline 2-player turn-based match on this screen',
      menuOnlineTitle: 'Online Multiplayer & LAN',
      menuOnlineDesc: 'Create private room, customize dot grid size, and invite friends',
      menuRulesTitle: 'Rules & How to Play',
      menuRulesDesc: 'Box capturing, bonus turn rule, and double-cross strategies',
      resumeGame: 'Resume Current Game',
      p1ToMove: 'Turn: Player 1 (Red)',
      p2ToMove: 'Turn: Player 2 (Blue)',
      botThinking: 'Bot is thinking...',
      player1Badge: 'Player 1 (Red)',
      player2Badge: 'Player 2 (Blue)',
      boxesLabel: 'Boxes',
      undoBtn: 'Undo',
      restartBtn: 'Restart',
      newGameBtn: 'Game Menu',
      setupTitleSolo: '🤖 Single Player vs AI Setup',
      setupTitlePass: '👥 Two Players (Pass & Play) Setup',
      gridDotsLabel: 'Grid Size (Number of Dots):',
      dots6: 'Small (6 × 6 Dots)',
      boxes25: '5 × 5 Boxes (25 Boxes)',
      dots10: 'Medium (10 × 10 Dots)',
      boxes81: '9 × 9 Boxes (81 Boxes)',
      dots15: 'Big (15 × 15 Dots)',
      boxes196: '14 × 14 Boxes (196 Boxes)',
      dots20: 'Large (20 × 20 Dots)',
      boxes361: '19 × 19 Boxes (361 Boxes)',
      difficultyLabel: 'Bot Difficulty:',
      diffEasy: 'Easy',
      diffMed: 'Medium',
      diffHard: 'Hard (Master)',
      timerLabel: 'Turn Timer:',
      timerOff: 'Unlimited',
      timer30: '30s',
      timer60: '60s',
      startGameBtn: 'Start Match',
      backBtn: 'Back',
      multiplayerTitle: 'Online Multiplayer & Local Network',
      multiplayerDesc: 'Create a room or join your friends using a 4-letter room code.',
      yourNameLabel: 'Your Name:',
      saveNameBtn: 'Save Name',
      roomCodeLabel: 'Room Code:',
      copyLinkBtn: '📋 Copy Link',
      createRoomBtn: 'Create New Room',
      joinRoomBtn: 'Join Room',
      enterRoomCodeLabel: 'Enter 4-letter Room Code:',
      joinBtn: 'Join Match',
      swapColorsBtn: '🔄 Swap Seats',
      waitingForHost: 'Waiting for host to start match...',
      leaveRoomBtn: 'Leave Room',
      nameSavedToast: 'Your name was saved as "{name}".',
      takeSeatBtn: 'Take This Seat',
      youBadge: '(You)',
      botBadge: '(Bot 🤖)',
      onlineBadge: '🟢 Online',
      offlineBadge: '🔴 Offline',
      redColorTitle: 'Red 🔴 (Player 1)',
      blueColorTitle: 'Blue 🔵 (Player 2)',
      rematchBtn: 'Play Again',
      rulesTitle: '📜 Dots and Boxes Rules',
      chatTitle: '💬 Game Chat',
      soundLabel: 'Sound',
      multiplayerBtn: 'Online Multiplayer',
      winMessageP1: 'Player 1 Wins! 🏆',
      winMessageP2: 'Player 2 Wins! 🏆',
      winMessageYou: 'Congratulations! You Win! 🏆',
      winMessageBot: 'Bot Wins! Try again.',
      drawMessage: 'Game Draw! 🤝',
      extraTurnNotice: 'Box Claimed! Bonus Turn 🎉',
      doubleCaptureNotice: 'Double Box Capture! Bonus Turn 🔥',
      linkCopied: 'Invite link copied to clipboard!',
      rulesContent: `
        <h4>1. Objective</h4>
        <p>Dots and Boxes is a 2-player strategy game. The objective is to claim the most 1×1 squares by joining adjacent dots.</p>
        <h4>2. Drawing Lines</h4>
        <p>Players take turns drawing a single horizontal or vertical line between two unjoined adjacent dots.</p>
        <h4>3. Claiming Boxes & Bonus Turns</h4>
        <p>Completing the 4th side of a 1×1 square claims that box (+1 point) and <strong>grants an immediate bonus move</strong>.</p>
        <h4>4. Grid Sizes</h4>
        <p>• <strong>Small (6×6 dots)</strong>: 25 boxes, quick & fun match.<br>
        • <strong>Medium (10×10 dots)</strong>: 81 boxes, classic standard.<br>
        • <strong>Big (15×15 dots)</strong>: 196 boxes, tactical depth.<br>
        • <strong>Large (20×20 dots)</strong>: 361 boxes, grand strategic marathon!</p>
        <h4>5. Strategy & Chains</h4>
        <p>Avoid giving your opponent 3rd sides. Advanced players use double-cross sacrifices to maintain control over long corridors!</p>
      `
    }
  };

  // =========================================================================
  // 2. CONFIGURATION & UNIVERSAL STATE
  // =========================================================================
  let currentLang = localStorage.getItem('rubik_card_lang') || 'fa';
  let localPlayerName = localStorage.getItem('rubik_player_name') || localStorage.getItem('rubik_bg_player_name') || 'Player';
  
  let gameMode = 'solo'; // 'solo', 'passplay', 'online'
  let selectedDots = 6;  // 6, 10, 15, 20 dots
  let onlineSelectedDots = 6;
  let difficulty = 'medium';
  let turnDuration = 30; // 0 = unlimited
  let onlineTurnDuration = 30;

  let state = null;
  let gameStarted = false;
  let timerInterval = null;
  let remainingTimer = 0;
  let lastMoveElement = null;

  // Online Multiplayer State
  let ws = null;
  let roomCode = null;
  let mySeat = null; // 0 = P1 (Red), 1 = P2 (Blue)
  let isHost = false;
  let currentLobbySeats = [];

  // DOM Elements Cache
  const el = {};

  function cacheDOMElements() {
    el.dotsGrid = document.getElementById('dots-grid');
    el.boardWrapper = document.getElementById('board-wrapper');
    el.mainLayout = document.getElementById('dots-main-layout');
    el.topStatusText = document.getElementById('top-status-text');
    el.topTurnDot = document.getElementById('top-turn-dot');

    el.p1Bar = document.getElementById('p1-player-bar');
    el.p2Bar = document.getElementById('p2-player-bar');
    el.p1Name = document.getElementById('p1-name');
    el.p2Name = document.getElementById('p2-name');
    el.p1Avatar = document.getElementById('p1-avatar');
    el.p2Avatar = document.getElementById('p2-avatar');
    el.p1Role = document.getElementById('p1-role');
    el.p2Role = document.getElementById('p2-role');
    el.p1Score = document.getElementById('p1-score');
    el.p2Score = document.getElementById('p2-score');
    el.p1Timer = document.getElementById('p1-timer');
    el.p2Timer = document.getElementById('p2-timer');

    el.btnUndo = document.getElementById('btn-undo');
    el.btnRestart = document.getElementById('btn-restart');
    el.btnNewGame = document.getElementById('btn-new-game');
    el.btnMenu = document.getElementById('btn-menu');
    el.btnSound = document.getElementById('btn-sound');
    el.btnLang = document.getElementById('btn-lang');
    el.btnMultiplayer = document.getElementById('btn-multiplayer');
    el.btnRules = document.getElementById('btn-rules');
    el.btnChat = document.getElementById('btn-chat');
    el.btnMobileNav = document.getElementById('btn-mobile-nav');
    el.mobileNavDropdown = document.getElementById('mobile-nav-dropdown');

    // Main Menu Modal Elements
    el.modalMainMenu = document.getElementById('modal-main-menu');
    el.btnMenuSolo = document.getElementById('btn-menu-solo');
    el.btnMenuPassplay = document.getElementById('btn-menu-passplay');
    el.btnMenuOnline = document.getElementById('btn-menu-online');
    el.btnMenuRules = document.getElementById('btn-menu-rules');
    el.btnMenuResume = document.getElementById('btn-menu-resume');

    // Setup Modal Elements
    el.modalSetup = document.getElementById('modal-setup');
    el.setupModalTitle = document.getElementById('setup-modal-title');
    el.btnCloseSetup = document.getElementById('btn-close-setup');
    el.btnSetupBack = document.getElementById('btn-setup-back');
    el.btnStartConfiguredGame = document.getElementById('btn-start-configured-game');
    el.aiDifficultyGroup = document.getElementById('ai-difficulty-group');

    // Multiplayer Modal Elements (Unified Entry & Lobby)
    el.modalMultiplayer = document.getElementById('modal-multiplayer');
    el.mpEntryView = document.getElementById('mp-entry-view');
    el.mpLobbyView = document.getElementById('mp-lobby-view');
    el.mpRoomCode = document.getElementById('mp-room-code');
    el.btnCopyRoomLink = document.getElementById('btn-copy-room-link');
    el.inputPlayerName = document.getElementById('input-player-name');
    el.lobbyNameInput = document.getElementById('lobby-name-input');
    el.btnSaveLobbyName = document.getElementById('btn-save-lobby-name');
    el.lobbyGridDesc = document.getElementById('lobby-grid-desc');
    el.lobbyTimerDesc = document.getElementById('lobby-timer-desc');
    el.lobbySeatsContainer = document.getElementById('lobby-seats-container');
    el.btnSwapDotsSeats = document.getElementById('btn-swap-dots-seats');
    el.btnStartOnlineGame = document.getElementById('btn-start-online-game');
    el.lobbyWaitingMsg = document.getElementById('lobby-waiting-msg');
    el.btnLeaveRoom = document.getElementById('btn-leave-room');
    el.btnCreateRoom = document.getElementById('btn-create-room');
    el.btnShowJoin = document.getElementById('btn-show-join');
    el.mpJoinFields = document.getElementById('mp-join-fields');
    el.inputRoomCode = document.getElementById('input-room-code');
    el.btnConfirmJoin = document.getElementById('btn-confirm-join');
    el.btnCloseMp = document.getElementById('btn-close-mp');

    // Game Over Modal Elements
    el.modalGameover = document.getElementById('modal-gameover');
    el.gameoverTitle = document.getElementById('gameover-title');
    el.gameoverIcon = document.getElementById('gameover-icon');
    el.gameoverMessage = document.getElementById('gameover-message');
    el.goP1Score = document.getElementById('go-p1-score');
    el.goP2Score = document.getElementById('go-p2-score');
    el.btnGameoverRematch = document.getElementById('btn-gameover-rematch');
    el.btnGameoverMenu = document.getElementById('btn-gameover-menu');

    // Rules & Chat
    el.modalRules = document.getElementById('modal-rules');
    el.btnCloseRules = document.getElementById('btn-close-rules');
    el.rulesContent = document.getElementById('rules-content');
    el.chatDrawer = document.getElementById('chat-drawer');
    el.btnCloseChat = document.getElementById('btn-close-chat');
    el.chatMessages = document.getElementById('chat-messages');
    el.chatForm = document.getElementById('chat-form');
    el.chatInput = document.getElementById('chat-input');
    el.notificationBubble = document.getElementById('notification-bubble');
  }

  // =========================================================================
  // 3. SOUND & NOTIFICATIONS & SETTINGS SYNC
  // =========================================================================
  function notify(msg, duration = 2200) {
    if (!el.notificationBubble) return;
    el.notificationBubble.textContent = msg;
    el.notificationBubble.classList.add('show');
    clearTimeout(notify.timeout);
    notify.timeout = setTimeout(() => {
      el.notificationBubble.classList.remove('show');
    }, duration);
  }

  function saveUniversalPlayerName(newName) {
    const clean = (newName || '').trim().slice(0, 15);
    if (!clean) return;
    localPlayerName = clean;
    try {
      localStorage.setItem('rubik_player_name', clean);
      localStorage.setItem('rubik_bg_player_name', clean);
      localStorage.setItem('shelem_player_name', clean);
    } catch (_) {}

    if (el.inputPlayerName) el.inputPlayerName.value = clean;
    if (el.lobbyNameInput) el.lobbyNameInput.value = clean;

    if (ws && ws.readyState === WebSocket.OPEN && roomCode) {
      sendWsMessage({
        type: 'CHANGE_NAME',
        name: clean
      });
    }

    const t = I18N[currentLang];
    notify(t.nameSavedToast.replace('{name}', clean));
  }

  // =========================================================================
  // 4. BOARD RENDERING (DOM GRID SCALED BY DOT COUNT)
  // =========================================================================
  function renderBoard() {
    if (!state || !el.dotsGrid) return;

    el.dotsGrid.innerHTML = '';
    const containerWidth = el.boardWrapper ? el.boardWrapper.clientWidth - 32 : 360;
    const maxAvailable = Math.min(containerWidth, 680);

    const totalDots = state.rows + 1; // 6, 10, 15, 20

    let step;
    let dotDiameter;
    let edgeHitbox;
    let lineThickness;
    let boxFontSize;

    if (totalDots <= 6) {
      step = Math.max(52, Math.floor(maxAvailable / state.cols));
      dotDiameter = 14;
      edgeHitbox = 28;
      lineThickness = 6;
      boxFontSize = 1.35;
    } else if (totalDots <= 10) {
      step = Math.max(34, Math.floor(maxAvailable / state.cols));
      dotDiameter = 11;
      edgeHitbox = 22;
      lineThickness = 5;
      boxFontSize = 1.0;
    } else if (totalDots <= 15) {
      step = Math.max(26, Math.floor(maxAvailable / state.cols));
      dotDiameter = 8;
      edgeHitbox = 18;
      lineThickness = 4;
      boxFontSize = 0.8;
    } else {
      step = Math.max(22, Math.floor(maxAvailable / state.cols));
      dotDiameter = 7;
      edgeHitbox = 16;
      lineThickness = 3.5;
      boxFontSize = 0.65;
    }

    const totalWidth = state.cols * step;
    const totalHeight = state.rows * step;

    el.dotsGrid.style.width = `${totalWidth}px`;
    el.dotsGrid.style.height = `${totalHeight}px`;

    // 1. Boxes (Cells)
    for (let r = 0; r < state.rows; r++) {
      for (let c = 0; c < state.cols; c++) {
        const box = document.createElement('div');
        box.className = 'box-cell';
        box.id = `box-${r}-${c}`;
        box.style.left = `${c * step}px`;
        box.style.top = `${r * step}px`;
        box.style.width = `${step}px`;
        box.style.height = `${step}px`;
        box.style.fontSize = `${boxFontSize}rem`;

        const owner = state.boxes[r][c];
        if (owner !== 0) {
          box.classList.add('claimed', owner === 1 ? 'p1' : 'p2');
          box.textContent = owner === 1 ? '🔴' : '🔵';
        }
        el.dotsGrid.appendChild(box);
      }
    }

    // 2. Horizontal Lines
    for (let r = 0; r <= state.rows; r++) {
      for (let c = 0; c < state.cols; c++) {
        const edge = document.createElement('div');
        edge.className = 'grid-edge horizontal';
        edge.id = `edge-h-${r}-${c}`;
        edge.style.left = `${c * step}px`;
        edge.style.top = `${r * step}px`;
        edge.style.width = `${step}px`;
        edge.style.height = `${edgeHitbox}px`;

        const innerBar = document.createElement('div');
        innerBar.className = 'edge-line-bar';
        innerBar.style.height = `${lineThickness}px`;
        edge.appendChild(innerBar);

        const val = state.hLines[r][c];
        if (val !== 0) {
          edge.classList.add('taken', val === 1 ? 'p1' : 'p2');
        }

        edge.addEventListener('click', () => handleEdgeClick('h', r, c));
        el.dotsGrid.appendChild(edge);
      }
    }

    // 3. Vertical Lines
    for (let r = 0; r < state.rows; r++) {
      for (let c = 0; c <= state.cols; c++) {
        const edge = document.createElement('div');
        edge.className = 'grid-edge vertical';
        edge.id = `edge-v-${r}-${c}`;
        edge.style.left = `${c * step}px`;
        edge.style.top = `${r * step}px`;
        edge.style.width = `${edgeHitbox}px`;
        edge.style.height = `${step}px`;

        const innerBar = document.createElement('div');
        innerBar.className = 'edge-line-bar';
        innerBar.style.width = `${lineThickness}px`;
        edge.appendChild(innerBar);

        const val = state.vLines[r][c];
        if (val !== 0) {
          edge.classList.add('taken', val === 1 ? 'p1' : 'p2');
        }

        edge.addEventListener('click', () => handleEdgeClick('v', r, c));
        el.dotsGrid.appendChild(edge);
      }
    }

    // 4. Dots
    for (let r = 0; r <= state.rows; r++) {
      for (let c = 0; c <= state.cols; c++) {
        const dot = document.createElement('div');
        dot.className = 'grid-dot';
        dot.style.left = `${c * step}px`;
        dot.style.top = `${r * step}px`;
        dot.style.width = `${dotDiameter}px`;
        dot.style.height = `${dotDiameter}px`;
        el.dotsGrid.appendChild(dot);
      }
    }

    updateUI();
  }

  // =========================================================================
  // 5. GAME LOGIC & TURN CONTROLLER
  // =========================================================================
  function handleEdgeClick(type, r, c) {
    if (!state || state.status !== 'PLAYING') return;

    if (gameMode === 'online') {
      const activeSeat = state.turn === 1 ? 0 : 1;
      if (mySeat !== activeSeat) return;
    }

    if (gameMode === 'solo' && state.turn === 2) return;

    const move = { type, r, c };
    if (!DotsAndBoxesLogic.isValidMove(state, move)) return;

    if (gameMode === 'online') {
      sendWsMessage({
        type: 'DOTS_MOVE',
        move
      });
      return;
    }

    executeMove(move);
  }

  function executeMove(move) {
    const prevPlayer = state.turn;
    const res = DotsAndBoxesLogic.applyMove(state, move);
    if (!res.valid) return;

    window.dotsSound.playLine(prevPlayer);

    const edgeEl = document.getElementById(`edge-${move.type}-${move.r}-${move.c}`);
    if (edgeEl) {
      edgeEl.classList.add('taken', prevPlayer === 1 ? 'p1' : 'p2');
      if (lastMoveElement) lastMoveElement.classList.remove('last-move');
      edgeEl.classList.add('last-move');
      lastMoveElement = edgeEl;
    }

    if (res.completedBoxes && res.completedBoxes.length > 0) {
      window.dotsSound.playBox(prevPlayer, res.completedBoxes.length);
      for (const box of res.completedBoxes) {
        const boxEl = document.getElementById(`box-${box.r}-${box.c}`);
        if (boxEl) {
          boxEl.classList.add('claimed', prevPlayer === 1 ? 'p1' : 'p2');
          boxEl.textContent = prevPlayer === 1 ? '🔴' : '🔵';
        }
      }

      if (res.completedBoxes.length > 1) {
        notify(I18N[currentLang].doubleCaptureNotice);
      } else {
        notify(I18N[currentLang].extraTurnNotice);
      }
    }

    updateUI();

    if (res.isGameOver) {
      handleGameOver();
      return;
    }

    resetTurnTimer();

    if (gameMode === 'solo' && state.turn === 2) {
      scheduleBotMove();
    }
  }

  function scheduleBotMove() {
    el.topStatusText.textContent = I18N[currentLang].botThinking;
    const delay = Math.floor(Math.random() * 300) + 350;

    setTimeout(() => {
      if (!state || state.status !== 'PLAYING' || state.turn !== 2) return;
      const botMove = DotsAndBoxesLogic.chooseBotMove(state, difficulty);
      if (botMove) {
        executeMove(botMove);
      }
    }, delay);
  }

  function updateUI() {
    if (!state) return;

    el.mainLayout.setAttribute('data-turn', state.turn);

    el.p1Score.textContent = state.scores[1];
    el.p2Score.textContent = state.scores[2];

    if (state.turn === 1) {
      el.p1Bar.classList.add('active-turn');
      el.p2Bar.classList.remove('active-turn');
      el.topTurnDot.className = 'turn-color-dot p1';
      el.topStatusText.textContent = I18N[currentLang].p1ToMove;
    } else {
      el.p2Bar.classList.add('active-turn');
      el.p1Bar.classList.remove('active-turn');
      el.topTurnDot.className = 'turn-color-dot p2';
      el.topStatusText.textContent = I18N[currentLang].p2ToMove;
    }

    if (el.btnUndo) {
      el.btnUndo.disabled = gameMode === 'online' || state.history.length === 0 || (gameMode === 'solo' && state.turn === 2);
    }
  }

  // =========================================================================
  // 6. TURN TIMER CONTROLLER
  // =========================================================================
  function startTurnTimer() {
    stopTurnTimer();
    if (turnDuration <= 0) {
      el.p1Timer.style.display = 'none';
      el.p2Timer.style.display = 'none';
      return;
    }

    el.p1Timer.style.display = 'block';
    el.p2Timer.style.display = 'block';
    remainingTimer = turnDuration;
    renderTimerDisplay();

    timerInterval = setInterval(() => {
      if (!state || state.status !== 'PLAYING') {
        stopTurnTimer();
        return;
      }

      remainingTimer--;
      renderTimerDisplay();

      if (remainingTimer <= 0) {
        handleTimerTimeout();
      }
    }, 1000);
  }

  function resetTurnTimer() {
    remainingTimer = turnDuration;
    renderTimerDisplay();
  }

  function stopTurnTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function renderTimerDisplay() {
    const mins = Math.floor(Math.max(0, remainingTimer) / 60);
    const secs = Math.max(0, remainingTimer) % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const activeTimerEl = state && state.turn === 1 ? el.p1Timer : el.p2Timer;
    const inactiveTimerEl = state && state.turn === 1 ? el.p2Timer : el.p1Timer;

    activeTimerEl.textContent = formatted;
    inactiveTimerEl.textContent = `${String(Math.floor(turnDuration / 60)).padStart(2, '0')}:${String(turnDuration % 60).padStart(2, '0')}`;

    activeTimerEl.classList.remove('warning', 'urgent');
    if (remainingTimer <= 5) {
      activeTimerEl.classList.add('urgent');
    } else if (remainingTimer <= 10) {
      activeTimerEl.classList.add('warning');
    }
  }

  function handleTimerTimeout() {
    if (!state || state.status !== 'PLAYING') return;

    if (gameMode === 'solo' && state.turn === 1) {
      const available = DotsAndBoxesLogic.getAvailableMoves(state);
      if (available.length > 0) {
        executeMove(available[Math.floor(Math.random() * available.length)]);
      }
    } else if (gameMode === 'passplay') {
      const available = DotsAndBoxesLogic.getAvailableMoves(state);
      if (available.length > 0) {
        executeMove(available[Math.floor(Math.random() * available.length)]);
      }
    }
  }

  // =========================================================================
  // 7. GAME OVER MODAL
  // =========================================================================
  function handleGameOver() {
    stopTurnTimer();

    const winner = state.winner;
    el.goP1Score.textContent = state.scores[1];
    el.goP2Score.textContent = state.scores[2];

    if (winner === 'draw') {
      window.dotsSound.playDefeat();
      el.gameoverIcon.textContent = '🤝';
      el.gameoverMessage.textContent = I18N[currentLang].drawMessage;
    } else if (winner === 1) {
      window.dotsSound.playVictory();
      el.gameoverIcon.textContent = '🏆';
      el.gameoverMessage.textContent = gameMode === 'solo' ? I18N[currentLang].winMessageYou : I18N[currentLang].winMessageP1;
    } else {
      if (gameMode === 'solo') {
        window.dotsSound.playDefeat();
        el.gameoverIcon.textContent = '🤖';
        el.gameoverMessage.textContent = I18N[currentLang].winMessageBot;
      } else {
        window.dotsSound.playVictory();
        el.gameoverIcon.textContent = '🏆';
        el.gameoverMessage.textContent = I18N[currentLang].winMessageP2;
      }
    }

    el.modalGameover.classList.add('active');
  }

  // =========================================================================
  // 8. START / RESET / UNDO
  // =========================================================================
  function startNewGame() {
    const boxRows = selectedDots - 1;
    const boxCols = selectedDots - 1;

    state = DotsAndBoxesLogic.createInitialState(boxRows, boxCols);
    lastMoveElement = null;
    gameStarted = true;

    if (el.btnMenuResume) {
      el.btnMenuResume.style.display = 'inline-flex';
    }

    if (gameMode === 'solo') {
      el.p1Name.textContent = localPlayerName || (currentLang === 'fa' ? 'شما (قرمز)' : 'You (Red)');
      el.p2Name.textContent = currentLang === 'fa' ? `ربات (${getDifficultyText()})` : `Bot (${difficulty})`;
      el.p1Avatar.textContent = '👤';
      el.p2Avatar.textContent = '🤖';
    } else if (gameMode === 'passplay') {
      el.p1Name.textContent = currentLang === 'fa' ? 'بازیکن ۱' : 'Player 1';
      el.p2Name.textContent = currentLang === 'fa' ? 'بازیکن ۲' : 'Player 2';
      el.p1Avatar.textContent = '🔴';
      el.p2Avatar.textContent = '🔵';
    }

    renderBoard();
    startTurnTimer();
  }

  function getDifficultyText() {
    if (difficulty === 'easy') return currentLang === 'fa' ? 'آسان' : 'Easy';
    if (difficulty === 'hard') return currentLang === 'fa' ? 'استاد' : 'Hard';
    return currentLang === 'fa' ? 'متوسط' : 'Medium';
  }

  function undoMove() {
    if (!state || gameMode === 'online' || state.history.length === 0) return;

    if (gameMode === 'solo') {
      while (state.history.length > 0) {
        const undone = DotsAndBoxesLogic.undoLastMove(state);
        if (undone && undone.player === 1 && !undone.completedBoxes.length) {
          break;
        }
      }
    } else {
      DotsAndBoxesLogic.undoLastMove(state);
    }

    renderBoard();
    resetTurnTimer();
  }

  // =========================================================================
  // 9. WEBSOCKET MULTIPLAYER & LOBBY CONTROLLER
  // =========================================================================
  function connectWebSocket(onOpenCallback) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      if (onOpenCallback) onOpenCallback();
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${window.location.host}`);

    ws.onopen = () => {
      if (onOpenCallback) onOpenCallback();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleServerMessage(data);
      } catch (err) {
        console.error('WS parse error:', err);
      }
    };

    ws.onclose = () => {
      notify(currentLang === 'fa' ? 'اتصال با سرور قطع شد.' : 'Connection closed.');
    };
  }

  function sendWsMessage(msg) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }

  function renderLobbyView(msg) {
    roomCode = msg.roomCode || roomCode;
    isHost = !!msg.isHost;
    mySeat = msg.yourSeat !== undefined ? msg.yourSeat : mySeat;
    currentLobbySeats = msg.seats || currentLobbySeats;

    if (el.mpRoomCode) el.mpRoomCode.textContent = roomCode;
    if (el.mpEntryView) el.mpEntryView.style.display = 'none';
    if (el.mpLobbyView) el.mpLobbyView.style.display = 'block';

    if (el.lobbyNameInput) {
      el.lobbyNameInput.value = localPlayerName;
    }

    // Grid settings description
    if (msg.settings && el.lobbyGridDesc) {
      const dots = (msg.settings.rows || 5) + 1;
      const boxes = (msg.settings.rows || 5) * (msg.settings.cols || 5);
      el.lobbyGridDesc.textContent = currentLang === 'fa' 
        ? `ابعاد زمین: ${dots} × ${dots} نقطه (${boxes} خانه)`
        : `Grid Size: ${dots} × ${dots} dots (${boxes} boxes)`;
      
      const tc = msg.settings.timeControl;
      if (el.lobbyTimerDesc) {
        el.lobbyTimerDesc.textContent = tc > 0 
          ? `⏱️ ${tc} ${currentLang === 'fa' ? 'ثانیه' : 'sec'}`
          : (currentLang === 'fa' ? '⏱️ نامحدود' : '⏱️ Unlimited');
      }
    }

    // Render 2 Seats
    if (el.lobbySeatsContainer && currentLobbySeats) {
      el.lobbySeatsContainer.innerHTML = '';
      const t = I18N[currentLang];
      const seatLabels = [t.redColorTitle, t.blueColorTitle];

      currentLobbySeats.slice(0, 2).forEach((seat, idx) => {
        const isMe = idx === mySeat || seat.isMe;
        const isBot = !!seat.isBot;
        const isSeatHost = !!seat.isHost;
        const isOnline = isBot ? true : !!seat.isOnline;

        const card = document.createElement('div');
        card.className = 'lobby-seat-card' + (isMe ? ' is-you' : '');

        const infoDiv = document.createElement('div');
        infoDiv.innerHTML = `
          <span style="font-weight:800; color:${idx === 0 ? 'var(--p1-light)' : 'var(--p2-light)'};">${seatLabels[idx]}</span>
          <div style="font-weight:700; margin-top:2px;">
            ${isSeatHost ? '👑 ' : ''}${seat.name}
            ${isMe ? `<span style="font-size:0.75rem; color:var(--gold-primary); margin-right:4px;">${t.youBadge}</span>` : ''}
          </div>
          <div>
            ${isBot ? `<span style="font-size:0.75rem; color:#94a3b8;">${t.botBadge}</span>` : `<span class="seat-online-badge ${isOnline ? 'online' : 'offline'}">${isOnline ? t.onlineBadge : t.offlineBadge}</span>`}
          </div>
        `;
        card.appendChild(infoDiv);

        // Claim Seat button if bot and not me
        if (isBot && !isMe) {
          const btnClaim = document.createElement('button');
          btnClaim.type = 'button';
          btnClaim.className = 'btn-seat-action';
          btnClaim.textContent = t.takeSeatBtn;
          btnClaim.addEventListener('click', (e) => {
            e.stopPropagation();
            sendWsMessage({
              type: 'CLAIM_SEAT',
              seat: idx,
              playerName: localPlayerName
            });
          });
          card.appendChild(btnClaim);
        }

        el.lobbySeatsContainer.appendChild(card);
      });
    }

    // Host vs Guest action buttons
    if (isHost) {
      if (el.btnStartOnlineGame) el.btnStartOnlineGame.style.display = 'inline-flex';
      if (el.btnSwapDotsSeats) el.btnSwapDotsSeats.style.display = 'inline-flex';
      if (el.lobbyWaitingMsg) el.lobbyWaitingMsg.style.display = 'none';
    } else {
      if (el.btnStartOnlineGame) el.btnStartOnlineGame.style.display = 'none';
      if (el.btnSwapDotsSeats) el.btnSwapDotsSeats.style.display = 'none';
      if (el.lobbyWaitingMsg) el.lobbyWaitingMsg.style.display = 'block';
    }
  }

  function handleServerMessage(data) {
    switch (data.type) {
      case 'ROOM_CREATED':
      case 'ROOM_JOINED':
      case 'LOBBY_UPDATE':
        renderLobbyView(data);
        break;

      case 'GAME_STARTED':
        if (data.gameType === 'dots-and-boxes') {
          el.modalMultiplayer.classList.remove('active');
          el.modalMainMenu.classList.remove('active');
          gameMode = 'online';
          const r = data.rows || 5;
          const c = data.cols || 5;
          turnDuration = data.timeControl !== undefined ? data.timeControl : 30;

          if (data.yourSeat !== undefined) {
            mySeat = data.yourSeat;
          }

          state = DotsAndBoxesLogic.createInitialState(r, c);
          gameStarted = true;

          if (el.btnMenuResume) {
            el.btnMenuResume.style.display = 'inline-flex';
          }

          if (data.seats) {
            el.p1Name.textContent = data.seats[0].name + (mySeat === 0 ? ' (You)' : '');
            el.p2Name.textContent = data.seats[1].name + (mySeat === 1 ? ' (You)' : '');
          }

          renderBoard();
          startTurnTimer();
          notify(currentLang === 'fa' ? 'مسابقه آنلاین آغاز شد!' : 'Online match started!');
        }
        break;

      case 'DOTS_STATE_UPDATE':
      case 'DOTS_MOVE_RESULT':
        if (data.move) {
          executeMove(data.move);
        }
        break;

      case 'CHAT_MESSAGE':
      case 'CHAT':
        appendChatMessage(data.sender, data.text);
        break;

      case 'ERROR':
        notify(data.message || (currentLang === 'fa' ? 'خطا در ارتباط با سرور' : 'Server error'));
        break;
    }
  }

  function appendChatMessage(sender, text) {
    if (!el.chatMessages) return;
    const msg = document.createElement('div');
    msg.className = 'chat-msg';
    if (sender === localPlayerName || sender === el.p1Name.textContent) {
      msg.classList.add('self');
    }
    msg.innerHTML = `<div class="sender">${sender}</div><div>${text}</div>`;
    el.chatMessages.appendChild(msg);
    el.chatMessages.scrollTop = el.chatMessages.scrollHeight;
  }

  // =========================================================================
  // 10. EVENT LISTENERS
  // =========================================================================
  function setupEventListeners() {
    // Sound Toggle (Universal storage handled in sound.js)
    el.btnSound.addEventListener('click', () => {
      const muted = window.dotsSound.toggleMute();
      el.btnSound.textContent = muted ? '🔇' : '🔊';
      notify(muted ? (currentLang === 'fa' ? 'صدا قطع شد' : 'Sound Muted') : (currentLang === 'fa' ? 'صدا فعال شد' : 'Sound Enabled'));
    });

    // Language Toggle (Universal storage in rubik_card_lang)
    el.btnLang.addEventListener('click', () => {
      currentLang = currentLang === 'fa' ? 'en' : 'fa';
      try {
        localStorage.setItem('rubik_card_lang', currentLang);
      } catch (_) {}
      document.documentElement.lang = currentLang;
      document.documentElement.dir = currentLang === 'fa' ? 'rtl' : 'ltr';
      applyTranslations();
      updateUI();
    });

    // Header Menu Trigger
    el.btnMenu.addEventListener('click', () => {
      window.dotsSound.playClick();
      el.modalMainMenu.classList.add('active');
    });

    el.btnNewGame.addEventListener('click', () => {
      window.dotsSound.playClick();
      el.modalMainMenu.classList.add('active');
    });

    // Main Menu Buttons
    el.btnMenuSolo.addEventListener('click', () => {
      window.dotsSound.playClick();
      gameMode = 'solo';
      el.setupModalTitle.textContent = I18N[currentLang].setupTitleSolo;
      el.aiDifficultyGroup.style.display = 'block';
      el.modalMainMenu.classList.remove('active');
      el.modalSetup.classList.add('active');
    });

    el.btnMenuPassplay.addEventListener('click', () => {
      window.dotsSound.playClick();
      gameMode = 'passplay';
      el.setupModalTitle.textContent = I18N[currentLang].setupTitlePass;
      el.aiDifficultyGroup.style.display = 'none';
      el.modalMainMenu.classList.remove('active');
      el.modalSetup.classList.add('active');
    });

    el.btnMenuOnline.addEventListener('click', () => {
      window.dotsSound.playClick();
      el.modalMainMenu.classList.remove('active');
      openMultiplayerModal();
    });

    el.btnMenuRules.addEventListener('click', () => {
      window.dotsSound.playClick();
      el.rulesContent.innerHTML = I18N[currentLang].rulesContent;
      el.modalMainMenu.classList.remove('active');
      el.modalRules.classList.add('active');
    });

    el.btnMenuResume.addEventListener('click', () => {
      window.dotsSound.playClick();
      el.modalMainMenu.classList.remove('active');
    });

    // Setup Modal Buttons
    el.btnCloseSetup.addEventListener('click', () => {
      el.modalSetup.classList.remove('active');
      if (!gameStarted) {
        el.modalMainMenu.classList.add('active');
      }
    });

    el.btnSetupBack.addEventListener('click', () => {
      el.modalSetup.classList.remove('active');
      el.modalMainMenu.classList.add('active');
    });

    // Setup Dots Options
    document.querySelectorAll('#setup-dots-options .grid-size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        window.dotsSound.playClick();
        document.querySelectorAll('#setup-dots-options .grid-size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedDots = parseInt(btn.dataset.dots, 10);
      });
    });

    // Setup Difficulty Options
    document.querySelectorAll('#setup-diff-options .option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        window.dotsSound.playClick();
        document.querySelectorAll('#setup-diff-options .option-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        difficulty = btn.dataset.diff;
      });
    });

    // Setup Timer Options
    document.querySelectorAll('#setup-timer-options .option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        window.dotsSound.playClick();
        document.querySelectorAll('#setup-timer-options .option-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        turnDuration = parseInt(btn.dataset.timer, 10);
      });
    });

    // Start Configured Game (from Setup modal)
    el.btnStartConfiguredGame.addEventListener('click', () => {
      window.dotsSound.playClick();
      el.modalSetup.classList.remove('active');
      startNewGame();
    });

    // =======================================================================
    // Multiplayer Modal Actions
    // =======================================================================
    function openMultiplayerModal() {
      if (el.inputPlayerName) el.inputPlayerName.value = localPlayerName;
      if (el.lobbyNameInput) el.lobbyNameInput.value = localPlayerName;

      if (!roomCode) {
        if (el.mpEntryView) el.mpEntryView.style.display = 'block';
        if (el.mpLobbyView) el.mpLobbyView.style.display = 'none';
      } else {
        if (el.mpEntryView) el.mpEntryView.style.display = 'none';
        if (el.mpLobbyView) el.mpLobbyView.style.display = 'block';
      }
      el.modalMultiplayer.classList.add('active');
    }

    el.btnMultiplayer.addEventListener('click', () => {
      window.dotsSound.playClick();
      el.modalMainMenu.classList.remove('active');
      openMultiplayerModal();
    });

    el.btnCloseMp.addEventListener('click', () => {
      el.modalMultiplayer.classList.remove('active');
      if (!gameStarted) {
        el.modalMainMenu.classList.add('active');
      }
    });

    // Name input blur save in entry view
    if (el.inputPlayerName) {
      el.inputPlayerName.addEventListener('change', () => {
        saveUniversalPlayerName(el.inputPlayerName.value);
      });
    }

    // Save Name button in lobby view
    if (el.btnSaveLobbyName) {
      el.btnSaveLobbyName.addEventListener('click', () => {
        window.dotsSound.playClick();
        saveUniversalPlayerName(el.lobbyNameInput.value);
      });
    }

    if (el.lobbyNameInput) {
      el.lobbyNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          window.dotsSound.playClick();
          saveUniversalPlayerName(el.lobbyNameInput.value);
        }
      });
    }

    // Online Dots Options in Entry View
    document.querySelectorAll('#online-dots-options .grid-size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        window.dotsSound.playClick();
        document.querySelectorAll('#online-dots-options .grid-size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        onlineSelectedDots = parseInt(btn.dataset.dots, 10);
      });
    });

    // Online Timer Options in Entry View
    document.querySelectorAll('#online-timer-options .option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        window.dotsSound.playClick();
        document.querySelectorAll('#online-timer-options .option-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        onlineTurnDuration = parseInt(btn.dataset.timer, 10);
      });
    });

    // Create Room Button
    el.btnCreateRoom.addEventListener('click', () => {
      window.dotsSound.playClick();
      saveUniversalPlayerName(el.inputPlayerName.value);
      const boxes = onlineSelectedDots - 1;

      connectWebSocket(() => {
        sendWsMessage({
          type: 'CREATE_ROOM',
          gameType: 'dots-and-boxes',
          playerName: localPlayerName,
          settings: {
            rows: boxes,
            cols: boxes,
            timeControl: onlineTurnDuration,
            difficulty: 'medium'
          }
        });
      });
    });

    // Show Join Fields Button
    el.btnShowJoin.addEventListener('click', () => {
      window.dotsSound.playClick();
      if (el.mpJoinFields) {
        el.mpJoinFields.style.display = el.mpJoinFields.style.display === 'none' ? 'block' : 'none';
        if (el.mpJoinFields.style.display === 'block') {
          el.inputRoomCode.focus();
        }
      }
    });

    // Confirm Join Room Button
    el.btnConfirmJoin.addEventListener('click', () => {
      const code = (el.inputRoomCode.value || '').trim().toUpperCase();
      if (code.length < 3) {
        notify(currentLang === 'fa' ? 'لطفاً کد معتبر اتاق را وارد کنید.' : 'Please enter a valid room code.');
        return;
      }
      window.dotsSound.playClick();
      saveUniversalPlayerName(el.inputPlayerName.value);

      connectWebSocket(() => {
        sendWsMessage({
          type: 'JOIN_ROOM',
          roomCode: code,
          playerName: localPlayerName
        });
      });
    });

    // Copy Room Link Button
    el.btnCopyRoomLink.addEventListener('click', () => {
      if (!roomCode) return;
      const url = `${window.location.origin}/games/dots-and-boxes/#${roomCode}`;
      navigator.clipboard.writeText(url).then(() => {
        notify(I18N[currentLang].linkCopied);
      });
    });

    // Swap Seats (Colors) Button
    if (el.btnSwapDotsSeats) {
      el.btnSwapDotsSeats.addEventListener('click', () => {
        window.dotsSound.playClick();
        sendWsMessage({
          type: 'SWAP_SEATS',
          seatA: 0,
          seatB: 1
        });
      });
    }

    // Start Online Match (Host Only)
    el.btnStartOnlineGame.addEventListener('click', () => {
      window.dotsSound.playClick();
      sendWsMessage({
        type: 'START_GAME'
      });
    });

    // Leave Room Button
    if (el.btnLeaveRoom) {
      el.btnLeaveRoom.addEventListener('click', () => {
        window.dotsSound.playClick();
        if (ws) {
          try { ws.close(); } catch (_) {}
          ws = null;
        }
        roomCode = null;
        mySeat = null;
        isHost = false;
        el.mpEntryView.style.display = 'block';
        el.mpLobbyView.style.display = 'none';
        el.modalMultiplayer.classList.remove('active');
        if (!gameStarted) {
          el.modalMainMenu.classList.add('active');
        }
      });
    }

    // Rematch & Game Over Actions
    el.btnGameoverRematch.addEventListener('click', () => {
      window.dotsSound.playClick();
      el.modalGameover.classList.remove('active');
      if (gameMode === 'online') {
        sendWsMessage({ type: 'START_GAME' });
      } else {
        startNewGame();
      }
    });

    el.btnGameoverMenu.addEventListener('click', () => {
      window.dotsSound.playClick();
      el.modalGameover.classList.remove('active');
      el.modalMainMenu.classList.add('active');
    });

    // Undo & Restart
    el.btnUndo.addEventListener('click', () => {
      window.dotsSound.playClick();
      undoMove();
    });

    el.btnRestart.addEventListener('click', () => {
      window.dotsSound.playClick();
      startNewGame();
    });

    // Rules
    el.btnRules.addEventListener('click', () => {
      window.dotsSound.playClick();
      el.rulesContent.innerHTML = I18N[currentLang].rulesContent;
      el.modalRules.classList.add('active');
    });

    el.btnCloseRules.addEventListener('click', () => {
      el.modalRules.classList.remove('active');
      if (!gameStarted) {
        el.modalMainMenu.classList.add('active');
      }
    });

    // Chat Drawer
    el.btnChat.addEventListener('click', () => {
      window.dotsSound.playClick();
      el.chatDrawer.classList.toggle('open');
    });

    el.btnCloseChat.addEventListener('click', () => {
      el.chatDrawer.classList.remove('open');
    });

    el.chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const txt = (el.chatInput.value || '').trim();
      if (!txt) return;
      el.chatInput.value = '';

      if (gameMode === 'online') {
        sendWsMessage({
          type: 'CHAT_MESSAGE',
          text: txt
        });
      } else {
        appendChatMessage(localPlayerName || el.p1Name.textContent, txt);
      }
    });

    // Mobile Navigation Dropdown
    el.btnMobileNav.addEventListener('click', () => {
      el.mobileNavDropdown.classList.toggle('show');
    });

    // Window Resize
    window.addEventListener('resize', () => {
      if (state) {
        renderBoard();
      }
    });
  }

  function applyTranslations() {
    const dict = I18N[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(elem => {
      const key = elem.getAttribute('data-i18n');
      if (dict[key]) {
        elem.textContent = dict[key];
      }
    });
    if (el.rulesContent) {
      el.rulesContent.innerHTML = dict.rulesContent;
    }
  }

  function checkUrlHash() {
    const hash = (window.location.hash || '').replace('#', '').trim().toUpperCase();
    if (hash === 'ONLINE') {
      el.modalMainMenu.classList.remove('active');
      if (el.mpEntryView) el.mpEntryView.style.display = 'block';
      if (el.mpLobbyView) el.mpLobbyView.style.display = 'none';
      el.modalMultiplayer.classList.add('active');
    } else if (hash.length === 4) {
      el.modalMainMenu.classList.remove('active');
      if (el.inputRoomCode) el.inputRoomCode.value = hash;
      if (el.mpJoinFields) el.mpJoinFields.style.display = 'block';
      if (el.mpEntryView) el.mpEntryView.style.display = 'block';
      if (el.mpLobbyView) el.mpLobbyView.style.display = 'none';
      el.modalMultiplayer.classList.add('active');
    }
  }

  // =========================================================================
  // 11. INITIALIZATION
  // =========================================================================
  window.addEventListener('DOMContentLoaded', () => {
    cacheDOMElements();

    // Universal sound button state
    if (el.btnSound) {
      el.btnSound.textContent = window.dotsSound.isMuted() ? '🔇' : '🔊';
    }

    // Universal language setup
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'fa' ? 'rtl' : 'ltr';

    setupEventListeners();
    applyTranslations();

    // Default preview board (non-interactive backdrop until user starts a match)
    state = DotsAndBoxesLogic.createInitialState(5, 5);
    renderBoard();

    // Show Main Menu by default
    el.modalMainMenu.classList.add('active');
    checkUrlHash();
  });

})();
