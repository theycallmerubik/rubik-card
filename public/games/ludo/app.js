/**
 * Ludo (منچ / Ludo) - Client Application Controller
 * Pure Vanilla JavaScript with interactive SVG board, Web Audio synthesis,
 * strategic AI bots, and real-time WebSocket multiplayer.
 * Universal Settings: Language (rubik_card_lang), Sound (rubik_card_sound), Player Name (rubik_player_name).
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. BILINGUAL I18N DICTIONARY
  // =========================================================================
  const I18N = {
    fa: {
      gameTitle: 'بازی منچ',
      menuHubTitle: 'هاب بازی‌ها',
      mainMenuTitle: 'بازی منچ (Ludo)',
      mainMenuSubtitle: 'بازی نوستالژیک و کلاسیک منچ با هوش مصنوعی و اتاق‌های آنلاین ۲ تا ۴ نفره',
      menuSoloTitle: 'بازی تک‌نفره با ربات',
      menuSoloDesc: 'رقابت آفلاین با ۱ تا ۳ ربات هوشمند با استراتژی زدن مهره و ورود به خانه',
      menuPassPlayTitle: 'بازی دورهمی روی یک دستگاه (Pass & Play)',
      menuPassPlayDesc: 'رقابت ۲، ۳ یا ۴ نفره به نوبت دور یک گوشی یا کامپیوتر',
      menuOnlineTitle: 'چندنفره آنلاین و شبکه محلی',
      menuOnlineDesc: 'ساخت اتاق اختصاصی، دعوت دوستان با لینک و رقابت زنده',
      menuRulesTitle: 'آموزش و قوانین بازی منچ',
      menuRulesDesc: 'قوانین تاس ۶، جایزه پرتاب مجدد، زدن مهره حریف و خانه‌های امن',
      resumeGame: 'ادامه بازی جاری',
      setupTitle: '⚙️ تنظیمات مسابقه منچ',
      playerCountLabel: 'تعداد بازیکنان:',
      setupPlayers2: '۲ بازیکن (دوئل روبرو)',
      setupPlayers3: '۳ بازیکن',
      setupPlayers4: '۴ بازیکن (کامل)',
      onlinePlayers2: '۲ بازیکن (دوئل)',
      onlinePlayers3: '۳ بازیکن',
      onlinePlayers4: '۴ بازیکن',
      difficultyLabel: 'درجه هوش مصنوعی:',
      diffEasy: 'آسان',
      diffMed: 'متوسط',
      diffHard: 'سخت (استاد)',
      timerLabel: 'زمان هر نوبت:',
      timerOff: 'نامحدود',
      timer30: '۳۰ ثانیه',
      timer45: '۴۵ ثانیه',
      timer60: '۶۰ ثانیه',
      startGameBtn: 'شروع بازی',
      backBtn: 'بازگشت',
      multiplayerTitle: 'اتاق منچ آنلاین / شبکه محلی',
      roomCodeLabel: 'کد اتاق:',
      copyLinkBtn: '📋 کپی لینک',
      yourNameLabel: 'نام شما:',
      saveNameBtn: 'ثبت نام',
      swapColorsBtn: '🔄 تعویض جایگاه',
      createRoomBtn: 'ساخت اتاق جدید',
      joinRoomBtn: 'ورود به اتاق',
      enterRoomCodeLabel: 'کد ۴ حرفی اتاق را وارد نمایید:',
      joinBtn: 'ورود به مسابقه',
      waitingForHost: 'در انتظار شروع مسابقه توسط میزبان...',
      leaveRoomBtn: 'خروج از اتاق',
      takeSeatBtn: 'نشستن در این جایگاه',
      youBadge: '(شما)',
      botBadge: '(ربات 🤖)',
      onlineBadge: '🟢 آنلاین',
      offlineBadge: '🔴 آفلاین',
      rollDiceBtn: 'پرتاب تاس',
      diceLabel: 'تاس منچ',
      soundLabel: 'صدا',
      multiplayerBtn: 'چندنفره آنلاین',
      rematchBtn: 'بازی مجدد',
      rulesTitle: '📜 قوانین و راهنمای بازی منچ',
      chatTitle: '💬 پیام‌ها و چت بازی',
      chatSystemSender: 'سیستم',
      chatWelcomeMsg: 'به بازی کلاسیک منچ خوش آمدید!',
      chatPlaceholder: 'پیام شما...',
      linkCopied: 'لینک دعوت به کلیپ‌بورد کپی شد!',
      nameSavedToast: 'نام شما به «{name}» ذخیره شد.',
      gameOverTitle: '🎉 پایان مسابقه منچ',
      gameOverSub: 'با رساندن هر ۴ مهره به مقصد، قهرمان مسابقه شد.',
      soundTooltip: 'صدا (قطع/وصل)',
      langTooltip: 'تغییر زبان (EN/FA)',
      multiplayerTooltip: 'بازی چندنفره آنلاین',
      rulesTooltip: 'قوانین و راهنما',
      chatTooltip: 'پیام‌ها و چت',
      menuTooltip: 'منوی اصلی',
      mobileNavTooltip: 'منو',
      rulesContent: `
        <h4>۱. هدف بازی</h4>
        <p>هدف بازی منچ، هدایت هر ۴ مهره از جایگاه شروع (Yard) به دور صفحه و ورود به خط امن ستون پایان (Home Run) و در نهایت رسیدن به خانه هدف (Goal) است. اولین بازیکنی که هر ۴ مهره خود را به مقصد برساند، برنده مسابقه می‌شود.</p>
        <h4>۲. پرتاب تاس و ورود به صفحه</h4>
        <p>• برای خارج کردن هر مهره از خانه اولیه و قرار دادن آن در نقطه آغازین، باید عدد <strong>۶</strong> بیاورید.<br>
        • آوردن عدد ۶، یک <strong>پرتاب جایزه</strong> به همراه دارد!<br>
        • اگر بازیکنی ۳ بار متوالی عدد ۶ بیاورد، نوبت او به دلیل قانون جریمه ۳ شش بدون حرکت پایان می‌یابد.</p>
        <h4>۳. زدن مهره حریف (Capture)</h4>
        <p>• اگر مهره شما دقیقاً روی خانه‌ای فرود بیاید که مهره حریف در آن قرار دارد، مهره حریف «زده» شده و به خانه اولیه خود بازمی‌گردد.<br>
        • زدن مهره حریف یک پرتاب جایزه به بازیکن هدیه می‌دهد!<br>
        • <strong>خانه‌های امن (ستاره ⭐)</strong>: مهره‌هایی که روی خانه‌های ستاره‌دار یا نقطه شروع قرار دارند از گزند زدن در امان هستند.</p>
        <h4>۴. ستون امن خانه و پیروزی</h4>
        <p>• پس از دور زدن کامل صفحه، مهره‌ها وارد ستون ۵ خانه‌ای هم‌رنگ خود می‌شوند که کاملاً امن است.<br>
        • برای رسیدن به خانه مرکز (Goal)، نیاز به عدد دقیق تاس است. اولین بازیکنی که ۴ مهره‌اش به مرکز برسد پیروز است.</p>
      `
    },
    en: {
      gameTitle: 'Ludo',
      menuHubTitle: 'Game Hub',
      mainMenuTitle: 'Ludo (منچ)',
      mainMenuSubtitle: 'Classic cross-and-circle strategy board game with AI bots and 2 to 4 player online rooms',
      menuSoloTitle: 'Single Player vs AI',
      menuSoloDesc: 'Play offline against 1 to 3 smart AI bots with tactical captures and home racing',
      menuPassPlayTitle: 'Pass & Play (Local Device)',
      menuPassPlayDesc: 'Play with 2, 3, or 4 friends taking turns on this screen',
      menuOnlineTitle: 'Online Multiplayer & LAN',
      menuOnlineDesc: 'Create private room, invite friends with link, and race tokens in real time',
      menuRulesTitle: 'Rules & How to Play',
      menuRulesDesc: 'Official rules: rolling 6 to enter, bonus rolls, captures, and safe star squares',
      resumeGame: 'Resume Current Match',
      setupTitle: '⚙️ Ludo Match Setup',
      playerCountLabel: 'Player Count:',
      setupPlayers2: '2 Players (Duel)',
      setupPlayers3: '3 Players',
      setupPlayers4: '4 Players (Full)',
      onlinePlayers2: '2 Players (Duel)',
      onlinePlayers3: '3 Players',
      onlinePlayers4: '4 Players',
      difficultyLabel: 'AI Difficulty:',
      diffEasy: 'Easy',
      diffMed: 'Medium',
      diffHard: 'Master',
      timerLabel: 'Turn Timer:',
      timerOff: 'Unlimited',
      timer30: '30 Seconds',
      timer45: '45 Seconds',
      timer60: '60 Seconds',
      startGameBtn: 'Start Match',
      backBtn: 'Back',
      multiplayerTitle: 'Online / Local Ludo Room',
      roomCodeLabel: 'Room Code:',
      copyLinkBtn: '📋 Copy Link',
      yourNameLabel: 'Your Name:',
      saveNameBtn: 'Save Name',
      swapColorsBtn: '🔄 Swap Seats',
      createRoomBtn: 'Create New Room',
      joinRoomBtn: 'Join Room',
      enterRoomCodeLabel: 'Enter 4-letter room code:',
      joinBtn: 'Join Match',
      waitingForHost: 'Waiting for host to start match...',
      leaveRoomBtn: 'Leave Room',
      takeSeatBtn: 'Take This Seat',
      youBadge: '(You)',
      botBadge: '(Bot 🤖)',
      onlineBadge: '🟢 Online',
      offlineBadge: '🔴 Offline',
      rollDiceBtn: 'Roll Dice',
      diceLabel: 'Ludo Die',
      soundLabel: 'Sound',
      multiplayerBtn: 'Online Multiplayer',
      rematchBtn: 'Rematch',
      rulesTitle: '📜 Ludo Rules & Guide',
      chatTitle: '💬 In-Game Chat',
      chatSystemSender: 'System',
      chatWelcomeMsg: 'Welcome to classic Ludo board game!',
      chatPlaceholder: 'Your message...',
      linkCopied: 'Room invite link copied to clipboard!',
      nameSavedToast: 'Your name was saved as "{name}".',
      gameOverTitle: '🎉 Ludo Match Over',
      gameOverSub: 'Brought all 4 tokens home and won the championship!',
      soundTooltip: 'Sound (Mute/Unmute)',
      langTooltip: 'Switch Language (EN/FA)',
      multiplayerTooltip: 'Online Multiplayer',
      rulesTooltip: 'Rules & Guide',
      chatTooltip: 'Messages & Chat',
      menuTooltip: 'Main Menu',
      mobileNavTooltip: 'Menu',
      rulesContent: `
        <h4>1. Objective</h4>
        <p>The objective of Ludo is to navigate all 4 tokens from the Yard, around the perimeter track, into the colored Home Run column, and finally into the central Goal. The first player to bring all 4 tokens home wins!</p>
        <h4>2. Rolling a 6 & Leaving the Yard</h4>
        <p>• A player must roll a <strong>6</strong> to move a token from the Yard onto the starting square.<br>
        • Rolling a 6 grants a <strong>bonus roll</strong>!<br>
        • Rolling three consecutive 6s forfeits the turn with no move allowed on the third 6.</p>
        <h4>3. Capturing Opponent Tokens</h4>
        <p>• If a token lands on a square occupied by an opponent's token, the opponent's token is captured and sent back to its Yard.<br>
        • Successfully capturing an opponent's token awards a bonus roll!<br>
        • <strong>Safe Squares (⭐)</strong>: Tokens on the 8 Star squares or starting squares are immune to being captured.</p>
        <h4>4. Home Run & Victory</h4>
        <p>• After circling the board, tokens enter the 5-cell colored Home Run column, which is safe from opponents.<br>
        • Exact dice count is required to land in the center Goal. The first player to finish all 4 tokens wins!</p>
      `
    }
  };

  // =========================================================================
  // 2. STATE & CONFIGURATION
  // =========================================================================
  const LudoLogic = window.LudoLogic || (typeof globalThis !== 'undefined' ? globalThis.LudoLogic : null);

  let currentLang = localStorage.getItem('rubik_card_lang') || 'fa';
  let localPlayerName = localStorage.getItem('rubik_player_name') || 'Player';
  const soundEngine = (typeof window !== 'undefined' && window.ludoSound)
    ? window.ludoSound
    : ((typeof window !== 'undefined' && window.LudoSoundEngine)
        ? new window.LudoSoundEngine()
        : {
            isMuted: () => false,
            toggleMute: () => false,
            playClick: () => {},
            playDiceRoll: () => {},
            playTokenMove: () => {},
            playTokenExitYard: () => {},
            playTokenCapture: () => {},
            playTokenHome: () => {},
            playVictory: () => {}
          });

  function safePlaySound(method, ...args) {
    try {
      if (soundEngine && typeof soundEngine[method] === 'function') {
        soundEngine[method](...args);
      }
    } catch (_) {}
  }

  let gameMode = 'solo'; // 'solo' | 'passplay' | 'online'
  let state = null; // LudoLogic state
  let localSeats = [0]; // Local human player indices
  let botDifficulty = 'medium';
  let timeControl = 45; // seconds per turn
  let turnTimerInterval = null;
  let turnSecondsLeft = 0;
  let currentValidMoves = [];
  let isAnimatingToken = false;
  let activeFlyerCleanup = null;

  // Online Multiplayer State
  let ws = null;
  let roomCode = null;
  let isHost = false;
  let mySeat = 0;
  let currentLobbySeats = [];

  // DOM Elements Cache
  const el = {};

  // =========================================================================
  // 3. INITIALIZATION & ELEMENT BINDING
  // =========================================================================
  function cacheElements() {
    el.topTurnPill = document.getElementById('top-turn-pill');
    el.topTurnDot = document.getElementById('top-turn-dot');
    el.topStatusText = document.getElementById('top-status-text');
    el.topTimerBadge = document.getElementById('top-timer-badge');
    el.playersHudBar = document.getElementById('players-hud-bar');

    el.boardContainer = document.getElementById('board-container');
    el.ludoBoardSvg = document.getElementById('ludo-board-svg');
    el.svgBoardBase = document.getElementById('svg-board-base');
    el.svgTrackPaths = document.getElementById('svg-track-paths');
    el.svgBoardDecorations = document.getElementById('svg-board-decorations');
    el.svgTokensLayer = document.getElementById('svg-tokens-layer');

    el.diceWidgetCard = document.getElementById('dice-widget-card');
    el.die1 = document.getElementById('die-1');
    el.btnRollDice = document.getElementById('btn-roll-dice');
    el.ludoActionPrompt = document.getElementById('ludo-action-prompt');

    // Header buttons
    el.btnSound = document.getElementById('btn-sound');
    el.btnLang = document.getElementById('btn-lang');
    el.btnMultiplayer = document.getElementById('btn-multiplayer');
    el.btnRules = document.getElementById('btn-rules');
    el.btnChat = document.getElementById('btn-chat');
    el.btnMenu = document.getElementById('btn-menu');
    el.btnMobileNav = document.getElementById('btn-mobile-nav');
    el.mobileNavDropdown = document.getElementById('mobile-nav-dropdown');

    // Modals
    el.modalMainMenu = document.getElementById('modal-main-menu');
    el.modalSetup = document.getElementById('modal-setup');
    el.modalMultiplayer = document.getElementById('modal-multiplayer');
    el.modalGameover = document.getElementById('modal-gameover');
    el.modalRules = document.getElementById('modal-rules');
    el.chatDrawer = document.getElementById('chat-drawer');
    el.notificationBubble = document.getElementById('notification-bubble');

    // Multiplayer elements
    el.mpEntryView = document.getElementById('mp-entry-view');
    el.mpLobbyView = document.getElementById('mp-lobby-view');
    el.mpRoomCode = document.getElementById('mp-room-code');
    el.inputPlayerName = document.getElementById('input-player-name');
    el.lobbyNameInput = document.getElementById('lobby-name-input');
    el.btnSaveLobbyName = document.getElementById('btn-save-lobby-name');
    el.lobbySeatsContainer = document.getElementById('lobby-seats-container');
    el.btnSwapLudoSeats = document.getElementById('btn-swap-ludo-seats');
    el.btnStartOnlineGame = document.getElementById('btn-start-online-game');
    el.lobbyWaitingMsg = document.getElementById('lobby-waiting-msg');
    el.btnLeaveRoom = document.getElementById('btn-leave-room');
    el.btnCopyRoomLink = document.getElementById('btn-copy-room-link');
  }

  // =========================================================================
  // 4. UNIVERSAL SETTINGS & I18N
  // =========================================================================
  function applyLanguage(lang) {
    currentLang = lang === 'en' ? 'en' : 'fa';
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'fa' ? 'rtl' : 'ltr';
    try {
      localStorage.setItem('rubik_card_lang', currentLang);
    } catch (_) {}

    document.title = currentLang === 'fa'
      ? 'Ludo (منچ) - Rubik Card Club'
      : 'Ludo - Rubik Card Club';

    const t = I18N[currentLang];
    document.querySelectorAll('[data-i18n]').forEach((node) => {
      const key = node.getAttribute('data-i18n');
      if (t[key]) {
        if (node.tagName === 'INPUT' && (node.placeholder || node.getAttribute('placeholder') !== null)) {
          node.placeholder = t[key];
        } else {
          node.innerHTML = t[key];
        }
      }
    });

    document.querySelectorAll('[data-i18n-title]').forEach((node) => {
      const key = node.getAttribute('data-i18n-title');
      if (t[key]) {
        node.setAttribute('title', t[key]);
      }
    });

    const rulesEl = document.getElementById('rules-content');
    if (rulesEl && t.rulesContent) {
      rulesEl.innerHTML = t.rulesContent;
    }

    updateHeaderIcons();
    if (state) {
      renderBoardBase();
      updateUI();
    }
  }

  function toggleLanguage() {
    soundEngine.playClick();
    applyLanguage(currentLang === 'fa' ? 'en' : 'fa');
  }

  function updateHeaderIcons() {
    const isMuted = soundEngine.isMuted();
    if (el.btnSound) el.btnSound.textContent = isMuted ? '🔇' : '🔊';
    const mobSoundIcon = document.getElementById('mob-sound-icon');
    if (mobSoundIcon) mobSoundIcon.textContent = isMuted ? '🔇' : '🔊';

    const mobLang = document.getElementById('mob-lang-text');
    if (mobLang) mobLang.textContent = currentLang === 'fa' ? 'EN' : 'فارسی';
  }

  function toggleSound() {
    const muted = soundEngine.toggleMute();
    updateHeaderIcons();
    notify(currentLang === 'fa' ? (muted ? 'صدا قطع شد.' : 'صدا وصل شد.') : (muted ? 'Sound Muted' : 'Sound Enabled'));
    if (!muted) soundEngine.playClick();
  }

  function saveUniversalPlayerName(name) {
    const clean = String(name || '').trim().slice(0, 15) || 'Player';
    localPlayerName = clean;
    try {
      localStorage.setItem('rubik_player_name', clean);
      localStorage.setItem('catan_player_name', clean);
      localStorage.setItem('hokm_player_name', clean);
      localStorage.setItem('shelem_player_name', clean);
    } catch (_) {}

    if (el.inputPlayerName) el.inputPlayerName.value = clean;
    if (el.lobbyNameInput) el.lobbyNameInput.value = clean;

    if (ws && ws.readyState === WebSocket.OPEN && roomCode) {
      sendWsMessage({ type: 'CHANGE_NAME', name: clean });
    }
    notify(I18N[currentLang].nameSavedToast.replace('{name}', clean));
  }

  function notify(msg) {
    if (!el.notificationBubble) return;
    el.notificationBubble.textContent = msg;
    el.notificationBubble.classList.add('show');
    clearTimeout(el.notificationBubble._timer);
    el.notificationBubble._timer = setTimeout(() => {
      el.notificationBubble.classList.remove('show');
    }, 2800);
  }

  // =========================================================================
  // 5. SVG LUDO BOARD RENDERING (15x15 GRID = 600x600 px)
  // =========================================================================
  const CELL_SIZE = 40; // 15 * 40 = 600 px

  function renderBoardBase() {
    if (!el.svgBoardBase || !el.svgTrackPaths || !el.svgBoardDecorations) return;

    el.svgBoardBase.innerHTML = '';
    el.svgTrackPaths.innerHTML = '';
    el.svgBoardDecorations.innerHTML = '';

    const colors = LudoLogic.PLAYER_COLORS;

    // 1. Draw 4 Corner Yard Bases (6x6 cells each = 240x240 px)
    const yardPositions = [
      { colorId: 0, x: 0, y: 0, fill: colors[0].hex, dark: '#991b1b' },       // Red (Top-Left)
      { colorId: 1, x: 360, y: 0, fill: colors[1].hex, dark: '#166534' },     // Green (Top-Right)
      { colorId: 2, x: 360, y: 360, fill: colors[2].hex, dark: '#854d0e' },   // Yellow (Bottom-Right)
      { colorId: 3, x: 0, y: 360, fill: colors[3].hex, dark: '#1e40af' }      // Blue (Bottom-Left)
    ];

    yardPositions.forEach(y => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', `yard-base-group yard-${y.colorId}`);

      // Base Outer Box
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', y.x);
      rect.setAttribute('y', y.y);
      rect.setAttribute('width', 240);
      rect.setAttribute('height', 240);
      rect.setAttribute('fill', y.fill);
      rect.setAttribute('class', 'yard-base');
      g.appendChild(rect);

      // Inner White/Dark Board Area
      const innerRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      innerRect.setAttribute('x', y.x + 30);
      innerRect.setAttribute('y', y.y + 30);
      innerRect.setAttribute('width', 180);
      innerRect.setAttribute('height', 180);
      innerRect.setAttribute('rx', 20);
      innerRect.setAttribute('class', 'yard-inner');
      g.appendChild(innerRect);

      // 4 Circular Slots for Tokens in Yard
      LudoLogic.YARD_COORDINATES[y.colorId].forEach((coord, slotIdx) => {
        const slot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        slot.setAttribute('cx', coord.x * CELL_SIZE);
        slot.setAttribute('cy', coord.y * CELL_SIZE);
        slot.setAttribute('r', 24);
        slot.setAttribute('class', 'yard-slot');
        slot.setAttribute('id', `yard-slot-${y.colorId}-${slotIdx}`);
        g.appendChild(slot);
      });

      el.svgBoardBase.appendChild(g);
    });

    // 2. Draw 52 Perimeter Track Cells
    LudoLogic.TRACK_COORDINATES.forEach((coord, idx) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', coord.x * CELL_SIZE);
      rect.setAttribute('y', coord.y * CELL_SIZE);
      rect.setAttribute('width', CELL_SIZE);
      rect.setAttribute('height', CELL_SIZE);

      const isSafe = LudoLogic.SAFE_CELLS.has(idx);
      rect.setAttribute('class', `track-cell ${isSafe ? 'safe' : ''}`);

      // Check if starting cell of any color
      Object.entries(LudoLogic.START_TRACK_CELL).forEach(([cId, startIdx]) => {
        if (parseInt(startIdx, 10) === idx) {
          rect.setAttribute('fill', colors[cId].hex);
        }
      });

      g.appendChild(rect);

      // Add star to safe cells
      if (isSafe) {
        const star = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        star.setAttribute('x', coord.x * CELL_SIZE + CELL_SIZE / 2);
        star.setAttribute('y', coord.y * CELL_SIZE + CELL_SIZE / 2 + 5);
        star.setAttribute('font-size', '18');
        star.setAttribute('text-anchor', 'middle');
        star.setAttribute('fill', '#f5c518');
        star.textContent = '⭐';
        g.appendChild(star);
      }

      el.svgTrackPaths.appendChild(g);
    });

    // 3. Draw 4 Home Runs (5 colored cells each)
    [0, 1, 2, 3].forEach(cId => {
      const color = colors[cId];
      LudoLogic.HOME_RUN_COORDINATES[cId].forEach(coord => {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', coord.x * CELL_SIZE);
        rect.setAttribute('y', coord.y * CELL_SIZE);
        rect.setAttribute('width', CELL_SIZE);
        rect.setAttribute('height', CELL_SIZE);
        rect.setAttribute('fill', color.hex);
        rect.setAttribute('class', 'home-run-cell');
        el.svgTrackPaths.appendChild(rect);
      });
    });

    // 4. Central Goal Area (3x3 cells = 120x120 px, 4 colored triangles)
    // Center is at (300, 300)
    const triangles = [
      { color: colors[0].hex, d: 'M 240,240 L 300,300 L 240,360 Z' }, // Red (Left)
      { color: colors[1].hex, d: 'M 240,240 L 360,240 L 300,300 Z' }, // Green (Top)
      { color: colors[2].hex, d: 'M 360,240 L 360,360 L 300,300 Z' }, // Yellow (Right)
      { color: colors[3].hex, d: 'M 240,360 L 300,300 L 360,360 Z' }  // Blue (Bottom)
    ];

    triangles.forEach(t => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', t.d);
      path.setAttribute('fill', t.color);
      path.setAttribute('stroke', '#fff');
      path.setAttribute('stroke-width', '1.5');
      el.svgBoardDecorations.appendChild(path);
    });
  }

  // =========================================================================
  // 6. TOKEN RENDERING & POSITIONING
  // =========================================================================
  function renderTokens() {
    if (!el.svgTokensLayer || !state) return;
    el.svgTokensLayer.innerHTML = '';

    const colors = LudoLogic.PLAYER_COLORS;

    // Group active tokens by coordinate so multiple tokens on the same square fan out nicely
    const cellGroups = {};

    state.activeSeats.forEach(colorId => {
      const p = state.players[colorId];
      if (!p) return;

      p.tokens.forEach(token => {
        const coords = LudoLogic.getTokenCoordinates(colorId, token);
        const key = `${coords.x.toFixed(1)},${coords.y.toFixed(1)}`;
        if (!cellGroups[key]) cellGroups[key] = [];
        cellGroups[key].push({ colorId, token, coords });
      });
    });

    // Render each token
    Object.values(cellGroups).forEach(group => {
      group.forEach((item, idx) => {
        const { colorId, token, coords } = item;
        const color = colors[colorId];

        // Offset slightly if multiple tokens occupy the exact same cell
        let offsetX = 0;
        let offsetY = 0;
        if (group.length > 1 && token.state !== 'FINISHED') {
          const angle = (idx / group.length) * 2 * Math.PI;
          offsetX = Math.cos(angle) * 8;
          offsetY = Math.sin(angle) * 8;
        }

        const cx = coords.x * CELL_SIZE + (token.state === 'YARD' ? 0 : CELL_SIZE / 2) + offsetX;
        const cy = coords.y * CELL_SIZE + (token.state === 'YARD' ? 0 : CELL_SIZE / 2) + offsetY;

        const isSelectable = currentValidMoves.some(m => m.tokenId === token.id && state.activePlayer === colorId);

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', `ludo-token-group ${isSelectable ? 'selectable' : ''}`);
        g.setAttribute('id', `token-${colorId}-${token.id}`);
        g.setAttribute('transform', `translate(${cx}, ${cy})`);

        // Inner content group for in-place scale animation centered at (0, 0)
        const content = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        content.setAttribute('class', 'ludo-token-content');

        // Token Outer Ring
        const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        ring.setAttribute('cx', 0);
        ring.setAttribute('cy', 0);
        ring.setAttribute('r', 16);
        ring.setAttribute('fill', color.hex);
        ring.setAttribute('class', 'ludo-token-body');

        // Token Inner Metallic Dome
        const inner = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        inner.setAttribute('cx', 0);
        inner.setAttribute('cy', 0);
        inner.setAttribute('r', 9);
        inner.setAttribute('fill', '#ffffff');
        inner.setAttribute('opacity', '0.85');

        // Center Pip
        const pip = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pip.setAttribute('cx', 0);
        pip.setAttribute('cy', 0);
        pip.setAttribute('r', 4);
        pip.setAttribute('fill', color.hex);

        content.appendChild(ring);
        content.appendChild(inner);
        content.appendChild(pip);
        g.appendChild(content);

        if (isSelectable) {
          g.addEventListener('click', (e) => {
            e.stopPropagation();
            onTokenClick(colorId, token.id);
          });
        }

        el.svgTokensLayer.appendChild(g);
      });
    });
  }

  // =========================================================================
  // 7. DIE RENDERING & ANIMATION (Copied directly from Backgammon)
  // =========================================================================
  function renderDieFace(val) {
    if (!el.die1) return;
    const v = Math.max(1, Math.min(6, parseInt(val, 10) || 1));
    el.die1.setAttribute('data-val', v);
    el.die1.innerHTML = '';
    for (let i = 0; i < v; i++) {
      const dot = document.createElement('div');
      dot.className = 'die-dot';
      el.die1.appendChild(dot);
    }
  }

  function animateDiceRoll(callback) {
    if (!el.die1) return callback ? callback() : undefined;
    el.die1.classList.add('rolling');

    setTimeout(() => {
      el.die1.classList.remove('rolling');
      if (callback) callback();
    }, 450);
  }

  // =========================================================================
  // 8. TURN FLOW & USER ACTIONS
  // =========================================================================
  function isLocalPlayerTurn() {
    if (!state || state.phase === 'GAME_OVER') return false;
    if (gameMode === 'solo') {
      return state.activePlayer === 0 && !state.players[0].isBot;
    }
    if (gameMode === 'passplay') {
      return true; // Any active seat on local device
    }
    if (gameMode === 'online') {
      return state.activePlayer === mySeat;
    }
    return false;
  }

  // =========================================================================
  // FLYING CHECKER ANIMATION (Copied directly from Backgammon)
  // =========================================================================
  function getSvgScreenCoords(svgEl, cx, cy) {
    if (svgEl && svgEl.getScreenCTM) {
      const ctm = svgEl.getScreenCTM();
      if (ctm) {
        return {
          x: cx * ctm.a + cy * ctm.c + ctm.e,
          y: cx * ctm.b + cy * ctm.d + ctm.f,
          scale: ctm.a
        };
      }
    }

    const rect = svgEl.getBoundingClientRect();
    const minDim = Math.min(rect.width, rect.height);
    const scale = minDim / 600;
    const offsetX = rect.left + (rect.width - minDim) / 2;
    const offsetY = rect.top + (rect.height - minDim) / 2;
    return {
      x: offsetX + cx * scale,
      y: offsetY + cy * scale,
      scale
    };
  }

  function flyTokenAnimation(colorId, tokenId, fromCoords, toCoords, onFinish) {
    if (activeFlyerCleanup) {
      activeFlyerCleanup();
    }

    const svgEl = el.ludoBoardSvg || document.getElementById('ludo-board-svg');
    if (!svgEl) {
      if (onFinish) onFinish();
      return;
    }

    const startCX = fromCoords ? fromCoords.x * CELL_SIZE + (fromCoords.state === 'YARD' ? 0 : CELL_SIZE / 2) : 0;
    const startCY = fromCoords ? fromCoords.y * CELL_SIZE + (fromCoords.state === 'YARD' ? 0 : CELL_SIZE / 2) : 0;

    const endCX = toCoords ? toCoords.x * CELL_SIZE + (toCoords.state === 'YARD' ? 0 : CELL_SIZE / 2) : 0;
    const endCY = toCoords ? toCoords.y * CELL_SIZE + (toCoords.state === 'YARD' ? 0 : CELL_SIZE / 2) : 0;

    const startPt = getSvgScreenCoords(svgEl, startCX, startCY);
    const endPt = getSvgScreenCoords(svgEl, endCX, endCY);

    const tokenDim = Math.max(16, Math.round(32 * (startPt.scale || 1)));

    const sourceTokenEl = document.getElementById(`token-${colorId}-${tokenId}`);
    if (sourceTokenEl) {
      sourceTokenEl.style.visibility = 'hidden';
    }

    const flyer = document.createElement('div');
    flyer.className = `ludo-flying-checker color-${colorId}`;
    flyer.style.position = 'fixed';
    flyer.style.left = `${startPt.x - tokenDim / 2}px`;
    flyer.style.top = `${startPt.y - tokenDim / 2}px`;
    flyer.style.width = `${tokenDim}px`;
    flyer.style.height = `${tokenDim}px`;
    flyer.style.margin = '0';
    flyer.style.zIndex = '9999';
    flyer.style.pointerEvents = 'none';
    flyer.style.transform = 'translate3d(0, 0, 0) scale(1.1)';
    flyer.style.boxShadow = '0 10px 24px rgba(0, 0, 0, 0.6), 0 0 10px rgba(245, 197, 24, 0.4)';
    flyer.style.transition = 'transform 0.28s cubic-bezier(0.2, 0.85, 0.4, 1), box-shadow 0.28s ease';
    document.body.appendChild(flyer);

    void flyer.offsetHeight;

    const dx = endPt.x - startPt.x;
    const dy = endPt.y - startPt.y;

    flyer.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(1)`;
    flyer.style.boxShadow = '0 3px 8px rgba(0, 0, 0, 0.4)';

    let finished = false;
    const cleanup = () => {
      if (finished) return;
      finished = true;
      activeFlyerCleanup = null;
      if (flyer.parentNode) {
        flyer.parentNode.removeChild(flyer);
      }
      if (sourceTokenEl) {
        sourceTokenEl.style.visibility = 'visible';
      }
      if (onFinish) onFinish();
    };

    activeFlyerCleanup = cleanup;
    flyer.addEventListener('transitionend', cleanup, { once: true });
    setTimeout(cleanup, 320);
  }

  function handleRollDice() {
    if (isAnimatingToken || !state || state.phase !== 'ROLL' || !isLocalPlayerTurn()) return;

    if (el.btnRollDice) el.btnRollDice.disabled = true;
    safePlaySound('playDiceRoll');

    animateDiceRoll(() => {
      if (gameMode === 'online') {
        sendWsMessage({ type: 'LUDO_ROLL_DICE' });
      } else {
        const rollRes = LudoLogic.rollDice(state);
        renderDieFace(rollRes.dice);

        if (rollRes.threeSixesPenalty) {
          notify(currentLang === 'fa' ? '⚠️ سه تاس ۶ متوالی! نوبت شما به دلیل جریمه رد شد.' : '⚠️ Three consecutive 6s! Turn forfeited.');
        } else if (rollRes.mustPass) {
          notify(currentLang === 'fa' ? `تاس ${rollRes.dice} آمد اما حرکتی امکان‌پذیر نیست.` : `Rolled ${rollRes.dice}, but no valid moves.`);
        }

        updateUI();
        checkBotTurn();
      }
    });
  }

  function onTokenClick(colorId, tokenId) {
    if (isAnimatingToken || !state || state.phase !== 'MOVE' || state.activePlayer !== colorId || !isLocalPlayerTurn()) return;

    if (gameMode === 'online') {
      sendWsMessage({ type: 'LUDO_MOVE_TOKEN', tokenId });
    } else {
      executeLocalMove(colorId, tokenId);
    }
  }

  function executeLocalMove(colorId, tokenId) {
    if (isAnimatingToken) return;

    const player = state.players[colorId];
    if (!player || !player.tokens[tokenId]) return;

    const prevToken = { ...player.tokens[tokenId] };
    const fromCoords = { ...LudoLogic.getTokenCoordinates(colorId, prevToken), state: prevToken.state };

    const moveRes = LudoLogic.moveToken(state, colorId, tokenId);
    if (!moveRes.valid) return;

    const newToken = player.tokens[tokenId];
    const toCoords = { ...LudoLogic.getTokenCoordinates(colorId, newToken), state: newToken.state };

    isAnimatingToken = true;
    flyTokenAnimation(colorId, tokenId, fromCoords, toCoords, () => {
      if (moveRes.captured) {
        safePlaySound('playTokenCapture');
        const oppName = state.players[moveRes.captured.color].name;
        notify(currentLang === 'fa' ? `💥 مهره ${oppName} زده شد!` : `💥 Captured ${oppName}'s token!`);

        // Fly the captured token back to its yard!
        const capColor = moveRes.captured.color;
        const capTokenId = moveRes.captured.tokenId;
        const capYardCoords = { ...LudoLogic.YARD_COORDINATES[capColor][capTokenId], state: 'YARD' };

        flyTokenAnimation(capColor, capTokenId, toCoords, capYardCoords, () => {
          isAnimatingToken = false;
          finishMoveSequence(moveRes);
        });
        return;
      } else if (moveRes.finished) {
        safePlaySound('playTokenHome');
        notify(currentLang === 'fa' ? '⭐ مهره به مقصد رسید!' : '⭐ Token reached the Goal!');
      } else if (moveRes.move.action === 'LEAVE_YARD') {
        safePlaySound('playTokenExitYard');
      } else {
        safePlaySound('playTokenMove');
      }

      isAnimatingToken = false;
      finishMoveSequence(moveRes);
    });
  }

  function finishMoveSequence(moveRes) {
    if (moveRes.gameOver) {
      safePlaySound('playVictory');
      showGameOverModal();
      updateUI();
      return;
    }

    if (moveRes.bonusRoll) {
      notify(currentLang === 'fa' ? '🎲 جایزه! یک بار دیگر تاس بیندازید.' : '🎲 Bonus Roll! Roll again.');
    }

    updateUI();
    checkBotTurn();
  }

  function checkBotTurn() {
    if (!state || state.phase === 'GAME_OVER') return;

    const activeP = state.players[state.activePlayer];
    if (!activeP || !activeP.isBot) return;

    // Bot Turn Execution
    setTimeout(() => {
      if (!state || state.activePlayer !== activeP.id) return;

      if (state.phase === 'ROLL') {
        safePlaySound('playDiceRoll');
        animateDiceRoll(() => {
          const rollRes = LudoLogic.rollDice(state);
          renderDieFace(rollRes.dice);

          if (rollRes.threeSixesPenalty) {
            notify(currentLang === 'fa' ? `🤖 ${activeP.name}: ۳ تاس ۶ متوالی و پایان نوبت!` : `🤖 ${activeP.name}: 3 sixes penalty!`);
          }

          updateUI();

          if (state.phase === 'MOVE') {
            setTimeout(() => {
              const bestMove = LudoLogic.getBotMove(state, activeP.id, botDifficulty);
              if (bestMove) {
                executeLocalMove(activeP.id, bestMove.tokenId);
              } else {
                updateUI();
                checkBotTurn();
              }
            }, 550);
          } else {
            checkBotTurn();
          }
        });
      }
    }, 600);
  }

  // =========================================================================
  // 9. UI & SCOREBOARD UPDATE
  // =========================================================================
  function updateUI() {
    if (!state) return;

    const t = I18N[currentLang];
    const activeColor = state.activePlayer;
    const activeP = state.players[activeColor];
    const isMyTurn = isLocalPlayerTurn();
    const colors = LudoLogic.PLAYER_COLORS;

    // 1. Top Turn Pill
    if (el.topTurnDot) {
      el.topTurnDot.style.background = colors[activeColor].hex;
      el.topTurnDot.style.boxShadow = `0 0 10px ${colors[activeColor].hex}`;
    }

    if (el.topStatusText) {
      if (state.phase === 'ROLL') {
        el.topStatusText.textContent = isMyTurn
          ? (currentLang === 'fa' ? `نوبت شما (${activeP.name}): لطفاً تاس بیندازید` : `Your turn (${activeP.name}): Roll the die`)
          : (currentLang === 'fa' ? `نوبت ${activeP.name}: در حال پرتاب تاس...` : `${activeP.name}'s turn: rolling die...`);
      } else if (state.phase === 'MOVE') {
        el.topStatusText.textContent = isMyTurn
          ? (currentLang === 'fa' ? `تاس: ${state.lastDice} - روی یکی از مهره‌های مشخص شده کلیک کنید` : `Rolled ${state.lastDice} - Click a highlighted token`)
          : (currentLang === 'fa' ? `نوبت ${activeP.name}: در حال انتخاب مهره...` : `${activeP.name}'s turn: moving token...`);
      } else {
        el.topStatusText.textContent = t.gameOverTitle;
      }
    }

    // 2. Action Prompt at bottom dock
    if (el.ludoActionPrompt) {
      if (state.phase === 'ROLL') {
        el.ludoActionPrompt.textContent = isMyTurn
          ? (currentLang === 'fa' ? 'نوبت شماست: روی تاس کلیک کنید یا دکمه پرتاب را بزنید.' : 'Your turn: Click the die or tap Roll Dice.')
          : (currentLang === 'fa' ? `در انتظار پرتاب تاس توسط ${activeP.name}...` : `Waiting for ${activeP.name} to roll...`);
      } else {
        el.ludoActionPrompt.textContent = isMyTurn
          ? (currentLang === 'fa' ? `عدد ${state.lastDice} آمد! مهره مورد نظر برای حرکت را انتخاب کنید.` : `Rolled ${state.lastDice}! Tap a highlighted token to move.`)
          : (currentLang === 'fa' ? `${activeP.name} در حال حرکت مهره است...` : `${activeP.name} is moving a token...`);
      }
    }

    // 3. Roll Button & Die Interaction State
    const canRoll = isMyTurn && state.phase === 'ROLL';
    if (el.btnRollDice) {
      el.btnRollDice.disabled = !canRoll;
      el.btnRollDice.classList.toggle('primary', canRoll);
    }
    if (el.die1) {
      el.die1.classList.toggle('can-roll', canRoll);
    }

    // 4. Calculate Valid Moves
    if (state.phase === 'MOVE') {
      currentValidMoves = LudoLogic.getValidMoves(state, state.activePlayer, state.lastDice);
    } else {
      currentValidMoves = [];
    }

    // 5. Update Scoreboard / Players HUD Bar
    if (el.playersHudBar) {
      el.playersHudBar.innerHTML = '';
      state.activeSeats.forEach(colorId => {
        const p = state.players[colorId];
        const isActive = state.activePlayer === colorId;
        const color = colors[colorId];

        const card = document.createElement('div');
        card.className = `player-hud-card ${isActive ? 'active-turn' : ''}`;

        const inYard = p.tokens.filter(t => t.state === 'YARD').length;
        const onTrack = p.tokens.filter(t => t.state === 'TRACK' || t.state === 'HOME_RUN').length;
        const finished = p.tokens.filter(t => t.state === 'FINISHED').length;

        card.innerHTML = `
          <div class="hud-color-stripe" style="background:${color.hex};"></div>
          <div class="hud-header">
            <div class="hud-name-wrap">
              <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${color.hex};"></span>
              <span>${p.name}${p.isBot ? ` ${t.botBadge}` : (isLocalSeat(colorId) ? ` ${t.youBadge}` : '')}</span>
            </div>
            <div class="hud-rank-badge ${p.rank ? 'visible' : ''}">
              ${p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : p.rank === 3 ? '🥉' : ''} #${p.rank || ''}
            </div>
          </div>
          <div class="hud-tokens-status">
            <div class="hud-stat-pill" title="In Yard">
              <span>🏠</span> <span>${inYard}</span>
            </div>
            <div class="hud-stat-pill" title="On Track">
              <span>🛣️</span> <span>${onTrack}</span>
            </div>
            <div class="hud-stat-pill highlight" title="Home Finished">
              <span>⭐</span> <span>${finished}/4</span>
            </div>
          </div>
        `;

        el.playersHudBar.appendChild(card);
      });
    }

    // 6. Render Tokens onto SVG board
    renderTokens();
  }

  function isLocalSeat(seatIdx) {
    if (gameMode === 'solo') return seatIdx === 0;
    if (gameMode === 'passplay') return true;
    if (gameMode === 'online') return seatIdx === mySeat;
    return false;
  }

  function showGameOverModal() {
    if (!state || !el.modalGameover) return;
    const winnerP = state.players[state.winner];
    const msg = document.getElementById('gameover-message');
    if (msg && winnerP) {
      msg.textContent = currentLang === 'fa'
        ? `${winnerP.name} برنده مسابقه شد! 🏆`
        : `${winnerP.name} Won the Match! 🏆`;
    }
    el.modalGameover.classList.add('active');
  }

  // =========================================================================
  // 10. GAME START & MODE CONFIGURATION
  // =========================================================================
  function startSinglePlayerMatch(playerCount = 4, difficulty = 'medium') {
    gameMode = 'solo';
    localSeats = [0];
    botDifficulty = difficulty;

    const activeSeats = LudoLogic.getActiveSeatsForPlayerCount(playerCount);
    const playersConfig = {};

    activeSeats.forEach((seat, idx) => {
      if (idx === 0) {
        playersConfig[seat] = { name: localPlayerName, isBot: false };
      } else {
        playersConfig[seat] = { name: `Bot ${idx + 1}`, isBot: true };
      }
    });

    state = LudoLogic.createGame({
      playerCount,
      players: playersConfig
    });

    closeAllModals();
    renderBoardBase();
    renderDieFace(1);
    updateUI();
    notify(currentLang === 'fa' ? 'مسابقه جدید منچ آغاز شد!' : 'New Ludo match started!');
  }

  function startPassAndPlayMatch(playerCount = 4) {
    gameMode = 'passplay';
    localSeats = LudoLogic.getActiveSeatsForPlayerCount(playerCount);

    const activeSeats = localSeats;
    const playersConfig = {};

    activeSeats.forEach((seat, idx) => {
      playersConfig[seat] = {
        name: idx === 0 ? localPlayerName : `Player ${idx + 1}`,
        isBot: false
      };
    });

    state = LudoLogic.createGame({
      playerCount,
      players: playersConfig
    });

    closeAllModals();
    renderBoardBase();
    renderDieFace(1);
    updateUI();
    notify(currentLang === 'fa' ? 'مسابقه دورهمی (Pass & Play) آغاز شد!' : 'Pass & Play match started!');
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    if (el.chatDrawer) el.chatDrawer.classList.remove('active');
  }

  // =========================================================================
  // 11. WEBSOCKET MULTIPLAYER CONTROLLER
  // =========================================================================
  function connectWebSocket(onOpenCallback) {
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
      if (ws.readyState === WebSocket.OPEN && onOpenCallback) onOpenCallback();
      return;
    }

    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${proto}//${window.location.host}`;
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      if (onOpenCallback) onOpenCallback();
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        handleServerMessage(msg);
      } catch (_) {}
    };

    ws.onclose = () => {
      notify(currentLang === 'fa' ? 'ارتباط با سرور قطع شد.' : 'Connection lost.');
    };
  }

  function sendWsMessage(obj) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(obj));
    }
  }

  function openMultiplayerModal() {
    if (el.modalMainMenu) el.modalMainMenu.classList.remove('active');
    if (el.modalMultiplayer) el.modalMultiplayer.classList.add('active');
    connectWebSocket();
  }

  function findMovedToken(oldState, newState) {
    if (!oldState || !newState || !oldState.players || !newState.players) return null;
    const activeSeats = newState.activeSeats || [0, 1, 2, 3];
    for (const colorId of activeSeats) {
      const oldP = oldState.players[colorId];
      const newP = newState.players[colorId];
      if (!oldP || !newP) continue;
      for (let i = 0; i < 4; i++) {
        const oldT = oldP.tokens[i];
        const newT = newP.tokens[i];
        if (oldT && newT && (oldT.state !== newT.state || oldT.step !== newT.step)) {
          const fromCoords = { ...LudoLogic.getTokenCoordinates(colorId, oldT), state: oldT.state };
          const toCoords = { ...LudoLogic.getTokenCoordinates(colorId, newT), state: newT.state };
          return { colorId, tokenId: i, fromCoords, toCoords };
        }
      }
    }
    return null;
  }

  function handleServerMessage(msg) {
    if (!msg || !msg.type) return;

    if (msg.type === 'ROOM_CREATED' || msg.type === 'ROOM_JOINED') {
      roomCode = msg.roomCode;
      mySeat = msg.seat !== undefined ? msg.seat : 0;
      isHost = Boolean(msg.isHost);
      window.location.hash = roomCode;

      if (el.mpRoomCode) el.mpRoomCode.textContent = roomCode;
      if (el.mpEntryView) el.mpEntryView.style.display = 'none';
      if (el.mpLobbyView) el.mpLobbyView.style.display = 'block';
    } else if (msg.type === 'LOBBY_STATE') {
      currentLobbySeats = msg.seats || [];
      renderLobbySeats(currentLobbySeats);
    } else if (msg.type === 'GAME_START') {
      gameMode = 'online';
      state = msg.gameState;
      closeAllModals();
      renderBoardBase();
      updateUI();
      notify(currentLang === 'fa' ? 'مسابقه آنلاین منچ آغاز شد!' : 'Online Ludo match started!');
    } else if (msg.type === 'LUDO_GAME_STATE') {
      const prevState = state;
      state = msg.gameState;
      if (msg.lastDice) renderDieFace(msg.lastDice);

      const moved = findMovedToken(prevState, state);
      if (moved) {
        isAnimatingToken = true;
        flyTokenAnimation(moved.colorId, moved.tokenId, moved.fromCoords, moved.toCoords, () => {
          isAnimatingToken = false;
          updateUI();
        });
      } else {
        updateUI();
      }
    } else if (msg.type === 'CHAT_MESSAGE') {
      appendChatMessage(msg.sender, msg.text);
    } else if (msg.type === 'ERROR') {
      notify(msg.message || 'Error occurred');
    }
  }

  function renderLobbySeats(seats) {
    if (!el.lobbySeatsContainer) return;
    el.lobbySeatsContainer.innerHTML = '';

    const colors = LudoLogic.PLAYER_COLORS;

    seats.forEach((seat, idx) => {
      const card = document.createElement('div');
      card.className = `lobby-seat-card ${idx === mySeat ? 'my-seat' : ''}`;
      const color = colors[seat.colorId || idx] || colors[idx];

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${color.hex};"></span>
            <span style="font-weight:800; font-size:0.85rem; color:${color.hex};">${color.name}</span>
          </div>
          <span style="font-size:0.75rem; font-weight:700; color:var(--text-muted);">${seat.connected ? '🟢' : '🔴'}</span>
        </div>
        <div style="font-size:0.95rem; font-weight:800; color:#fff; margin-top:2px;">
          ${seat.name || 'Empty'} ${idx === mySeat ? `(You)` : (seat.isBot ? `(Bot 🤖)` : '')}
        </div>
      `;

      el.lobbySeatsContainer.appendChild(card);
    });

    if (el.btnStartOnlineGame) {
      el.btnStartOnlineGame.style.display = isHost ? 'inline-flex' : 'none';
    }
    if (el.lobbyWaitingMsg) {
      el.lobbyWaitingMsg.style.display = isHost ? 'none' : 'block';
    }
  }

  function appendChatMessage(sender, text) {
    const list = document.getElementById('chat-messages');
    if (!list) return;
    const msg = document.createElement('div');
    msg.className = 'chat-msg';
    msg.innerHTML = `
      <div class="sender">${escapeHtml(sender)}</div>
      <div>${escapeHtml(text)}</div>
    `;
    list.appendChild(msg);
    list.scrollTop = list.scrollHeight;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  // =========================================================================
  // 12. EVENT LISTENERS
  // =========================================================================
  function setupEventListeners() {
    // Header actions
    if (el.btnSound) el.btnSound.addEventListener('click', toggleSound);
    if (el.btnLang) el.btnLang.addEventListener('click', toggleLanguage);
    if (el.btnRules) el.btnRules.addEventListener('click', () => {
      soundEngine.playClick();
      if (el.modalRules) el.modalRules.classList.add('active');
    });
    if (el.btnMultiplayer) el.btnMultiplayer.addEventListener('click', () => {
      soundEngine.playClick();
      openMultiplayerModal();
    });
    if (el.btnChat) el.btnChat.addEventListener('click', () => {
      soundEngine.playClick();
      if (el.chatDrawer) el.chatDrawer.classList.toggle('active');
    });
    if (el.btnMenu) el.btnMenu.addEventListener('click', () => {
      soundEngine.playClick();
      if (el.modalMainMenu) {
        el.modalMainMenu.classList.add('active');
        const resumeBtn = document.getElementById('btn-menu-resume');
        if (resumeBtn) resumeBtn.style.display = state ? 'block' : 'none';
      }
    });

    // Mobile nav
    if (el.btnMobileNav) el.btnMobileNav.addEventListener('click', () => {
      soundEngine.playClick();
      if (el.mobileNavDropdown) el.mobileNavDropdown.classList.toggle('active');
    });

    const mobSound = document.getElementById('btn-mob-sound');
    if (mobSound) mobSound.addEventListener('click', toggleSound);
    const mobLang = document.getElementById('btn-mob-lang');
    if (mobLang) mobLang.addEventListener('click', toggleLanguage);
    const mobRules = document.getElementById('btn-mob-rules');
    if (mobRules) mobRules.addEventListener('click', () => {
      if (el.mobileNavDropdown) el.mobileNavDropdown.classList.remove('active');
      if (el.modalRules) el.modalRules.classList.add('active');
    });
    const mobMp = document.getElementById('btn-mob-multiplayer');
    if (mobMp) mobMp.addEventListener('click', () => {
      if (el.mobileNavDropdown) el.mobileNavDropdown.classList.remove('active');
      openMultiplayerModal();
    });
    const mobMenu = document.getElementById('btn-mob-menu');
    if (mobMenu) mobMenu.addEventListener('click', () => {
      if (el.mobileNavDropdown) el.mobileNavDropdown.classList.remove('active');
      if (el.modalMainMenu) el.modalMainMenu.classList.add('active');
    });

    // Main menu buttons
    const btnSolo = document.getElementById('btn-menu-solo');
    if (btnSolo) btnSolo.addEventListener('click', () => {
      soundEngine.playClick();
      if (el.modalMainMenu) el.modalMainMenu.classList.remove('active');
      if (el.modalSetup) {
        el.modalSetup.dataset.targetMode = 'solo';
        const aiGroup = document.getElementById('ai-difficulty-group');
        if (aiGroup) aiGroup.style.display = 'block';
        el.modalSetup.classList.add('active');
      }
    });

    const btnPass = document.getElementById('btn-menu-passplay');
    if (btnPass) btnPass.addEventListener('click', () => {
      soundEngine.playClick();
      if (el.modalMainMenu) el.modalMainMenu.classList.remove('active');
      if (el.modalSetup) {
        el.modalSetup.dataset.targetMode = 'passplay';
        const aiGroup = document.getElementById('ai-difficulty-group');
        if (aiGroup) aiGroup.style.display = 'none';
        el.modalSetup.classList.add('active');
      }
    });

    const btnOnline = document.getElementById('btn-menu-online');
    if (btnOnline) btnOnline.addEventListener('click', () => {
      soundEngine.playClick();
      openMultiplayerModal();
    });

    const btnRulesMenu = document.getElementById('btn-menu-rules');
    if (btnRulesMenu) btnRulesMenu.addEventListener('click', () => {
      soundEngine.playClick();
      if (el.modalRules) el.modalRules.classList.add('active');
    });

    const btnResume = document.getElementById('btn-menu-resume');
    if (btnResume) btnResume.addEventListener('click', () => {
      soundEngine.playClick();
      if (el.modalMainMenu) el.modalMainMenu.classList.remove('active');
    });

    // Modal closes
    document.querySelectorAll('.btn-modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        soundEngine.playClick();
        closeAllModals();
      });
    });

    const btnSetupBack = document.getElementById('btn-setup-back');
    if (btnSetupBack) btnSetupBack.addEventListener('click', () => {
      soundEngine.playClick();
      if (el.modalSetup) el.modalSetup.classList.remove('active');
      if (el.modalMainMenu) el.modalMainMenu.classList.add('active');
    });

    // Setup option selectors
    const setupPlayers = document.querySelectorAll('#setup-players-options .option-btn');
    setupPlayers.forEach(btn => {
      btn.addEventListener('click', () => {
        soundEngine.playClick();
        setupPlayers.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    const setupDiffs = document.querySelectorAll('#setup-diff-options .option-btn');
    setupDiffs.forEach(btn => {
      btn.addEventListener('click', () => {
        soundEngine.playClick();
        setupDiffs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        botDifficulty = btn.dataset.diff || 'medium';
      });
    });

    const setupTimers = document.querySelectorAll('#setup-timer-options .option-btn');
    setupTimers.forEach(btn => {
      btn.addEventListener('click', () => {
        soundEngine.playClick();
        setupTimers.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        timeControl = parseInt(btn.dataset.timer, 10) || 0;
      });
    });

    const onlinePlayers = document.querySelectorAll('#online-players-options .option-btn');
    onlinePlayers.forEach(btn => {
      btn.addEventListener('click', () => {
        soundEngine.playClick();
        onlinePlayers.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    const onlineTimers = document.querySelectorAll('#online-timer-options .option-btn');
    onlineTimers.forEach(btn => {
      btn.addEventListener('click', () => {
        soundEngine.playClick();
        onlineTimers.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Start configured game (Solo or Pass & Play)
    const btnStartConfigured = document.getElementById('btn-start-configured-game');
    if (btnStartConfigured) btnStartConfigured.addEventListener('click', () => {
      soundEngine.playClick();
      const activePBtn = document.querySelector('#setup-players-options .option-btn.active');
      const count = activePBtn ? parseInt(activePBtn.dataset.players, 10) : 4;
      const mode = el.modalSetup ? el.modalSetup.dataset.targetMode : 'solo';

      if (mode === 'passplay') {
        startPassAndPlayMatch(count);
      } else {
        startSinglePlayerMatch(count, botDifficulty);
      }
    });

    // Rematch button on Game Over modal
    const btnRematch = document.getElementById('btn-gameover-rematch');
    if (btnRematch) btnRematch.addEventListener('click', () => {
      soundEngine.playClick();
      if (state) {
        if (gameMode === 'passplay') {
          startPassAndPlayMatch(state.playerCount);
        } else {
          startSinglePlayerMatch(state.playerCount, botDifficulty);
        }
      }
    });

    const btnGameoverMenu = document.getElementById('btn-gameover-menu');
    if (btnGameoverMenu) btnGameoverMenu.addEventListener('click', () => {
      soundEngine.playClick();
      closeAllModals();
      if (el.modalMainMenu) el.modalMainMenu.classList.add('active');
    });

    // Die & Roll button
    if (el.btnRollDice) el.btnRollDice.addEventListener('click', handleRollDice);
    if (el.die1) el.die1.addEventListener('click', handleRollDice);

    // Online Multiplayer actions
    const btnCreateRoom = document.getElementById('btn-create-room');
    if (btnCreateRoom) btnCreateRoom.addEventListener('click', () => {
      soundEngine.playClick();
      const nameInput = document.getElementById('input-player-name');
      const name = nameInput ? nameInput.value : localPlayerName;
      saveUniversalPlayerName(name);

      const activePBtn = document.querySelector('#online-players-options .option-btn.active');
      const playerCount = activePBtn ? parseInt(activePBtn.dataset.players, 10) : 4;

      const activeTimerBtn = document.querySelector('#online-timer-options .option-btn.active');
      const tControl = activeTimerBtn ? parseInt(activeTimerBtn.dataset.timer, 10) : 45;

      connectWebSocket(() => {
        sendWsMessage({
          type: 'CREATE_ROOM',
          gameType: 'ludo',
          playerName: localPlayerName,
          settings: {
            playerCount,
            timeControl: tControl
          }
        });
      });
    });

    const btnShowJoin = document.getElementById('btn-show-join');
    if (btnShowJoin) btnShowJoin.addEventListener('click', () => {
      soundEngine.playClick();
      const subform = document.getElementById('join-room-subform');
      if (subform) subform.style.display = subform.style.display === 'none' ? 'block' : 'none';
    });

    const btnSubmitJoin = document.getElementById('btn-submit-join');
    if (btnSubmitJoin) btnSubmitJoin.addEventListener('click', () => {
      soundEngine.playClick();
      const codeInput = document.getElementById('input-join-code');
      const code = (codeInput ? codeInput.value : '').trim().toUpperCase();
      if (!code || code.length !== 4) {
        notify(currentLang === 'fa' ? 'لطفاً کد ۴ حرفی اتاق را وارد نمایید.' : 'Please enter a 4-letter room code.');
        return;
      }
      connectWebSocket(() => {
        sendWsMessage({
          type: 'JOIN_ROOM',
          roomCode: code,
          playerName: localPlayerName
        });
      });
    });

    if (el.btnSaveLobbyName) el.btnSaveLobbyName.addEventListener('click', () => {
      soundEngine.playClick();
      const input = document.getElementById('lobby-name-input');
      if (input) saveUniversalPlayerName(input.value);
    });

    if (el.btnSwapLudoSeats) el.btnSwapLudoSeats.addEventListener('click', () => {
      soundEngine.playClick();
      sendWsMessage({ type: 'SWAP_SEATS' });
    });

    if (el.btnStartOnlineGame) el.btnStartOnlineGame.addEventListener('click', () => {
      soundEngine.playClick();
      sendWsMessage({ type: 'START_GAME' });
    });

    if (el.btnLeaveRoom) el.btnLeaveRoom.addEventListener('click', () => {
      soundEngine.playClick();
      sendWsMessage({ type: 'LEAVE_ROOM' });
      window.location.hash = '';
      if (el.mpLobbyView) el.mpLobbyView.style.display = 'none';
      if (el.mpEntryView) el.mpEntryView.style.display = 'block';
    });

    if (el.btnCopyRoomLink) el.btnCopyRoomLink.addEventListener('click', () => {
      soundEngine.playClick();
      const url = window.location.href.split('#')[0] + '#' + roomCode;
      navigator.clipboard.writeText(url).then(() => {
        notify(I18N[currentLang].linkCopied);
      }).catch(() => {});
    });

    // Chat form
    const chatForm = document.getElementById('chat-form');
    if (chatForm) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('chat-input');
        const text = input ? input.value.trim() : '';
        if (!text) return;
        input.value = '';
        if (gameMode === 'online') {
          sendWsMessage({ type: 'CHAT_MESSAGE', text });
        } else {
          appendChatMessage(localPlayerName, text);
        }
      });
    }
  }

  // =========================================================================
  // 13. INITIALIZATION BOOTSTRAP
  // =========================================================================
  function init() {
    cacheElements();
    applyLanguage(currentLang);
    setupEventListeners();
    renderBoardBase();
    renderDieFace(1);

    // Check URL Hash for Room Code
    const hash = (window.location.hash || '').replace('#', '').trim().toUpperCase();
    if (hash && hash.length === 4) {
      if (el.modalMainMenu) el.modalMainMenu.classList.remove('active');
      if (el.modalMultiplayer) el.modalMultiplayer.classList.add('active');
      connectWebSocket(() => {
        sendWsMessage({
          type: 'JOIN_ROOM',
          roomCode: hash,
          playerName: localPlayerName
        });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
