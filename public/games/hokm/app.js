/**
 * Hokm Card Game - Frontend Application Controller
 * Pure Vanilla JavaScript (Zero External Libraries).
 * Supports both Offline Solo Play (vs Smart Bots) & Online Multiplayer.
 */

(function () {
  'use strict';

  // --- Translation Dictionaries (Bilingual EN/FA) ---
  const I18N = {
    en: {
      gameTitle: 'Hokm',
      gameSubtitle: 'Persian Card Game',
      team1Name: 'Team 1 (You & Partner)',
      team2Name: 'Team 2 (Opponents)',
      team1Short: 'T1',
      team2Short: 'T2',
      mainMenuTitle: 'Hokm Card Game',
      mainMenuSubtitle: 'Online & Offline Persian Hokm',
      menuSoloTitle: 'Solo vs Smart Bots',
      menuSoloDesc: 'Instant offline play (no internet needed)',
      menuOnlineTitle: 'Online & LAN Multiplayer',
      menuOnlineDesc: 'Create room or play with friends',
      menuRulesTitle: 'Game Rules & Guide',
      menuRulesDesc: 'How to play Hokm, scoring, and Kot',
      menuHubTitle: 'All Games Hub',
      menuHubDesc: 'Return to Main Menu & Game Catalog',
      lastTrickTitle: 'Last Hand Played',
      viewTricksHint: 'Inspect',
      noTricksYet: 'No tricks completed in this round yet.',
      wonByMsg: 'Won by {name} with {card}',
      trickCounterMsg: 'Trick {current} of {total}',
      hokmSuitLabel: 'Hokm:',
      youAreHakem: 'You are Hakem!',
      chooseHokmPrompt: 'Inspect your first 5 cards and choose the Trump suit (Hokm):',
      suitSpades: 'Spades',
      suitHearts: 'Hearts',
      suitDiamonds: 'Diamonds',
      suitClubs: 'Clubs',
      continueBtn: 'Continue Next Round',
      multiplayerTitle: 'Play Online / LAN',
      multiplayerDesc: 'Play with friends on local WiFi, online server, or solo vs bots.',
      roomCodeLabel: 'Room Code:',
      copyLinkBtn: '📋 Copy Link',
      startGameBtn: 'Start Game',
      leaveRoomBtn: 'Leave Room',
      yourNameLabel: 'Your Name:',
      createRoomBtn: 'Create Room',
      joinRoomBtn: 'Join Room',
      enterRoomCodeLabel: 'Enter 4-Character Room Code:',
      joinBtn: 'Join',
      playOfflineBots: '🤖 Play Offline vs Bots (No Server Needed)',
      closeBtn: 'Close',
      rulesTitle: 'Hokm Rules & Instructions',
      chatTitle: 'Game Chat & Log',
      muteChatBtn: 'Mute chat notifications',
      unmuteChatBtn: 'Unmute chat notifications',
      aiPlayingForYou: '🤖 AI is playing for you',
      aiReplaced3Rounds: '🤖 Replaced by AI (idle 3 rounds)',
      takeControlBtn: '🎮 Take Back Control',
      controlReclaimedMsg: 'You have taken back control! 🎮',
      determiningHakemMsg: 'Dealing cards to determine Hakem...',
      hakemDecidedMsg: '{name} got the first Ace and is Hakem! 👑',
      firstFiveDealtMsg: '{name} is choosing the Hokm...',
      hokmDeclaredMsg: '{name} declared Hokm as {suit}! 👑',
      trickWonMsg: '{name} won the trick!',
      roundWonMsg: '{team} won the round!',
      kotMsg: 'KOT! Losing team won 0 tricks! (+2 sets)',
      hakemKotMsg: 'HAKEM KOT! Hakem was defeated 7-0! (+3 sets)',
      gameOverMsg: 'MATCH OVER! {team} won the match! 🏆',
      resumeGame: 'Resume Game',
      resumeGameDesc: 'Return to your ongoing match',
      team1: 'Team 1',
      team2: 'Team 2',
      team1Subtitle: 'South & North',
      team2Subtitle: 'West & East',
      seatSouth: 'South',
      seatWest: 'West',
      seatNorth: 'North (Partner)',
      seatEast: 'East (Partner)',
      swapSeat: '⇄ Swap',
      changeNameBtn: 'Change Name',
      saveNameBtn: 'Save',
      nameUpdatedMsg: 'Your name was changed to {name}',
      switchTeam: '⇄ Switch Team',
      swapWithThis: '⇄ Swap with this',
      cancelSwap: '✕ Cancel',
      hostBadge: 'Host 👑',
      youBadge: 'You',
      openSeat: 'Open (Bot)',
      takeSeat: 'Take Seat',
      waitingForHost: 'Waiting for host to start...',
      hostRearrangeHint: '👑 Host: Click "⇄ Swap" or "⇄ Switch Team", or drag players to rearrange teams.',
      rulesHtml: `
        <h4>1. Objective</h4>
        <p>Hokm is a 4-player partnership trick-taking game. You and Partner (North) form Team 1; West and East form Team 2. The first team to win 7 tricks wins the round. The first team to reach 7 sets wins the match.</p>
        <h4>2. Determining Hakem (Ruler)</h4>
        <p>Cards are dealt one by one. The first player to receive an Ace becomes the Hakem (👑).</p>
        <h4>3. Declaring Hokm (Trump)</h4>
        <p>The Hakem receives their first 5 cards and declares the Trump suit (Hokm: ♠, ♥, ♦, or ♣). Then the remaining 8 cards are dealt to each player (total 13 cards each).</p>
        <h4>4. Playing the Cards</h4>
        <p>Hakem leads the first card. Each player must follow the led suit if they have one. If a player has no cards of the led suit, they may "cut" with a trump card or discard any other card. The highest trump card (or highest card of the led suit) wins the trick.</p>
        <h4>5. Scoring & Kot</h4>
        <p>• Standard round win: 1 point (set).<br>
        • Kot (7-0 win by Hakem's team): 2 points.<br>
        • Hakem Kot (7-0 win against Hakem's team): 3 points.<br>
        • If Hakem's team wins, Hakem stays. If opponents win, Hakem passes clockwise.</p>
      `
    },
    fa: {
      gameTitle: 'بازی حکم',
      gameSubtitle: 'Hokm',
      team1Name: 'تیم ۱ (شما و یار)',
      team2Name: 'تیم ۲ (حریفان)',
      team1Short: 'ت۱',
      team2Short: 'ت۲',
      mainMenuTitle: 'بازی پاسور حکم',
      mainMenuSubtitle: 'بازی آنلاین و آفلاین حکم',
      menuSoloTitle: 'تک‌نفره با ربات‌های هوشمند',
      menuSoloDesc: 'بازی آفلاین بدون نیاز به اینترنت',
      menuOnlineTitle: 'چندنفره آنلاین و شبکه محلی',
      menuOnlineDesc: 'ساخت اتاق و بازی با دوستان',
      menuRulesTitle: 'قوانین و راهنمای بازی',
      menuRulesDesc: 'آموزش بازی، نحوه امتیازگیری و کت',
      menuHubTitle: 'منوی بازی‌ها (هاب)',
      menuHubDesc: 'بازگشت به منوی اصلی و فهرست بازی‌ها',
      lastTrickTitle: 'آخرین دست بازی شده',
      viewTricksHint: 'مشاهده',
      noTricksYet: 'هنوز دستی در این دور به پایان نرسیده است.',
      wonByMsg: 'برنده: {name} با برگ {card}',
      trickCounterMsg: 'دست {current} از {total}',
      hokmSuitLabel: 'خال حکم:',
      youAreHakem: 'شما حاکم شدید!',
      chooseHokmPrompt: 'پنج برگ اول خود را مشاهده کرده و خال حکم را تعیین کنید:',
      suitSpades: 'پیک (♠)',
      suitHearts: 'دل (♥)',
      suitDiamonds: 'خشت (♦)',
      suitClubs: 'گشنیز (♣)',
      continueBtn: 'ادامه دست بعد',
      multiplayerTitle: 'بازی چندنفره آنلاین / شبکه محلی',
      multiplayerDesc: 'می‌توانید با دوستان خود در شبکه محلی یا سرور بازی کنید، یا به‌صورت آفلاین با ربات‌ها رقابت نمایید.',
      roomCodeLabel: 'کد اتاق:',
      copyLinkBtn: '📋 کپی لینک اتاق',
      startGameBtn: 'شروع بازی',
      leaveRoomBtn: 'خروج از اتاق',
      yourNameLabel: 'نام شما:',
      createRoomBtn: 'ساخت اتاق جدید',
      joinRoomBtn: 'ورود به اتاق',
      enterRoomCodeLabel: 'کد ۴ حرفی اتاق را وارد کنید:',
      joinBtn: 'ورود',
      playOfflineBots: '🤖 بازی آفلاین با ربات‌ها (بدون نیاز به سرور)',
      closeBtn: 'بستن',
      rulesTitle: 'قوانین و راهنمای بازی حکم',
      chatTitle: 'پیام‌ها و گزارش بازی',
      muteChatBtn: 'بی‌صدا کردن اعلان پیام‌ها',
      unmuteChatBtn: 'وصل کردن اعلان پیام‌ها',
      aiPlayingForYou: '🤖 هوش مصنوعی به جای شما بازی می‌کند',
      aiReplaced3Rounds: '🤖 جایگزین با ربات (۳ راند عدم فعالیت)',
      takeControlBtn: '🎮 بازپس‌گیری کنترل',
      controlReclaimedMsg: 'کنترل بازی به شما بازگردانده شد! 🎮',
      determiningHakemMsg: 'در حال تقسیم کارت‌ها برای تعیین حاکم...',
      hakemDecidedMsg: '{name} اولین تک (آس) را دریافت کرد و حاکم شد! 👑',
      firstFiveDealtMsg: '{name} در حال انتخاب خال حکم است...',
      hokmDeclaredMsg: '{name} خال حکم را {suit} تعیین کرد! 👑',
      trickWonMsg: '{name} برنده این دست شد!',
      roundWonMsg: '{team} برنده این دست شد!',
      kotMsg: 'کت شدید! تیم حریف هیچ دستی نگرفت (+۲ امتیاز)',
      hakemKotMsg: 'حاکم کت! تیم حاکم هیچ دستی نگرفت (+۳ امتیاز)',
      gameOverMsg: 'پایان بازی! {team} قهرمان مسابقه شد! 🏆',
      resumeGame: 'ادامه بازی',
      resumeGameDesc: 'بازگشت به بازی در حال انجام',
      team1: 'تیم ۱',
      team2: 'تیم ۲',
      team1Subtitle: 'شمال و جنوب',
      team2Subtitle: 'غرب و شرق',
      seatSouth: 'جنوب',
      seatWest: 'غرب',
      seatNorth: 'شمال (یار)',
      seatEast: 'شرق',
      swapSeat: '⇄ جابجایی',
      changeNameBtn: 'تغییر نام',
      saveNameBtn: 'ثبت نام',
      nameUpdatedMsg: 'نام شما به {name} تغییر یافت',
      switchTeam: '⇄ تغییر تیم',
      swapWithThis: '⇄ جابجایی با این صندلی',
      cancelSwap: '✕ انصراف',
      hostBadge: 'میزبان 👑',
      youBadge: 'شما',
      openSeat: 'خالی (ربات)',
      takeSeat: 'نشستن',
      waitingForHost: 'در انتظار میزبان برای شروع بازی...',
      hostRearrangeHint: '👑 میزبان: برای جابجایی بازیکنان روی «جابجایی» یا «تغییر تیم» کلیک کنید یا کارت را بکشید.',
      rulesHtml: `
        <h4>۱. هدف بازی</h4>
        <p>حکم یک بازی ۴ نفره تیمی است. شما و یار روبرو (شمال) تیم ۱، و بازیکنان چپ و راست تیم ۲ را تشکیل می‌دهید. تیمی که زودتر به ۷ دست برسد برنده دور است. تیمی که به ۷ دست ست برسد برنده کل بازی می‌شود.</p>
        <h4>۲. تعیین حاکم</h4>
        <p>در ابتدای بازی کارت‌ها تک به تک پخش می‌شوند؛ اولین بازیکنی که کارت آس (تک) برایش بیاید، حاکم (👑) می‌شود.</p>
        <h4>۳. تعیین خال حکم</h4>
        <p>حاکم ۵ کارت اول خود را دریافت کرده و خال حکم (پیک، دل، خشت، یا گشنیز) را برمی‌گزیند. سپس بقیه کارت‌ها توزیع می‌شوند تا هر بازیکن ۱۳ کارت داشته باشد.</p>
        <h4>۴. قوانین بازی کردن کارت‌ها</h4>
        <p>حاکم دست اول را آغاز می‌کند. سایر بازیکنان موظفند از همان خالی که به زمین آمده بازی کنند. در صورتی که کارتی از آن خال نداشته باشند، می‌توانند برگ را ببرند (با حکم) یا رد کنند.</p>
        <h4>۵. امتیازدهی و کت</h4>
        <p>• برد معمولی: ۱ امتیاز.<br>
        • کت (برد ۷ بر ۰ توسط تیم حاکم): ۲ امتیاز.<br>
        • حاکم کت (برد ۷ بر ۰ در برابر تیم حاکم): ۳ امتیاز.<br>
        • اگر تیم حاکم ببرد، حاکم باقی می‌ماند؛ در غیر این صورت حاکمیت به بازیکن سمت راست منتقل می‌شود.</p>
      `
    }
  };

  // --- App State ---
  let currentLang = 'fa';
  try {
    currentLang = localStorage.getItem('rubik_card_lang') || 'fa';
  } catch (_) {}
  let mode = 'OFFLINE'; // 'OFFLINE' or 'ONLINE'
  let offlineGame = null;
  let onlineWs = null;
  let mySeat = 0; // 0: South, 1: West, 2: North, 3: East
  let currentGameState = null;
  let offlineAnimationRunning = false;
  let hakemDealInterval = null;
  let isHostUser = false;
  let swapSourceSeat = null;
  let unreadChatCount = 0;
  let chatToastTimer = null;
  let isChatMuted = false;
  try {
    isChatMuted = localStorage.getItem('hokm_chat_muted') === 'true';
  } catch (_) {}
  let latestLobbySeats = [];
  let latestHostId = null;

  // DOM Elements
  const dom = {
    // Top Bar
    scoreTeam0: document.getElementById('score-team-0'),
    scoreTeam1: document.getElementById('score-team-1'),
    tricksTeam0: document.getElementById('tricks-team-0'),
    tricksTeam1: document.getElementById('tricks-team-1'),
    btnMenu: document.getElementById('btn-menu'),
    btnSound: document.getElementById('btn-sound'),
    btnLang: document.getElementById('btn-lang'),
    btnMultiplayer: document.getElementById('btn-multiplayer'),
    btnRules: document.getElementById('btn-rules'),
    btnNewGame: document.getElementById('btn-newgame'),

    // Seats & Table
    tableContainer: document.querySelector('.table-container'),
    seats: [
      document.getElementById('seat-0'),
      document.getElementById('seat-1'),
      document.getElementById('seat-2'),
      document.getElementById('seat-3')
    ],
    names: [
      document.getElementById('name-0'),
      document.getElementById('name-1'),
      document.getElementById('name-2'),
      document.getElementById('name-3')
    ],
    counts: [
      document.getElementById('count-0'),
      document.getElementById('count-1'),
      document.getElementById('count-2'),
      document.getElementById('count-3')
    ],
    crowns: [
      document.getElementById('crown-0'),
      document.getElementById('crown-1'),
      document.getElementById('crown-2'),
      document.getElementById('crown-3')
    ],
    statusDots: [
      document.getElementById('status-0'),
      document.getElementById('status-1'),
      document.getElementById('status-2'),
      document.getElementById('status-3')
    ],
    badges: [
      document.querySelector('#seat-0 .player-card-badge'),
      document.querySelector('#seat-1 .player-card-badge'),
      document.querySelector('#seat-2 .player-card-badge'),
      document.querySelector('#seat-3 .player-card-badge')
    ],
    backs: [
      null, // South has visible cards
      document.getElementById('backs-1'),
      document.getElementById('backs-2'),
      document.getElementById('backs-3')
    ],
    playerHand: document.getElementById('player-hand'),
    takeControlBanner: document.getElementById('take-control-banner'),
    takeControlText: document.getElementById('take-control-text'),
    btnTakeControl: document.getElementById('btn-take-control'),

    // Center Arena
    hokmBadge: document.getElementById('hokm-badge'),
    hokmSuitIcon: document.getElementById('hokm-suit-icon'),
    hokmSuitName: document.getElementById('hokm-suit-name'),
    trickSlots: [
      document.getElementById('trick-slot-0'),
      document.getElementById('trick-slot-1'),
      document.getElementById('trick-slot-2'),
      document.getElementById('trick-slot-3')
    ],
    notificationBubble: document.getElementById('notification-bubble'),

    // Won Tricks Piles
    tricksPile0: document.getElementById('tricks-pile-0'),
    tricksPile1: document.getElementById('tricks-pile-1'),
    pileCount0: document.getElementById('pile-count-0'),
    pileCount1: document.getElementById('pile-count-1'),
    pileStack0: document.getElementById('pile-stack-0'),
    pileStack1: document.getElementById('pile-stack-1'),

    // Main Menu Modal
    modalMainMenu: document.getElementById('modal-main-menu'),
    btnMenuResume: document.getElementById('btn-menu-resume'),
    btnMenuSolo: document.getElementById('btn-menu-solo'),
    btnMenuOnline: document.getElementById('btn-menu-online'),
    btnMenuRules: document.getElementById('btn-menu-rules'),
    btnMenuLang: document.getElementById('btn-menu-lang'),
    menuLangLabel: document.getElementById('menu-lang-label'),
    btnMenuSound: document.getElementById('btn-menu-sound'),
    menuSoundLabel: document.getElementById('menu-sound-label'),

    // Modals
    modalHokm: document.getElementById('modal-hokm-picker'),
    modalHokmBox: document.getElementById('hokm-picker-frame') || document.getElementById('hokm-picker-box') || document.querySelector('#modal-hokm-picker .modal-box'),
    firstFivePreview: document.getElementById('first-five-preview'),
    modalRoundResult: document.getElementById('modal-round-result'),
    roundResultTitle: document.getElementById('round-result-title'),
    roundResultDesc: document.getElementById('round-result-desc'),
    roundResultScores: document.getElementById('round-result-scores'),
    btnNextRound: document.getElementById('btn-next-round'),

    // Last Trick Inspector
    modalLastTrick: document.getElementById('modal-last-trick'),
    lastTrickWinnerDesc: document.getElementById('last-trick-winner-desc'),
    lastTrickCardsContainer: document.getElementById('last-trick-cards-container'),
    btnCloseLastTrick: document.getElementById('btn-close-last-trick'),

    modalMultiplayer: document.getElementById('modal-multiplayer'),
    mpEntryView: document.getElementById('mp-entry-view'),
    mpLobbyView: document.getElementById('mp-lobby-view'),
    lobbyNameBar: document.getElementById('lobby-name-bar'),
    lobbyNameInput: document.getElementById('lobby-name-input'),
    btnSaveLobbyName: document.getElementById('btn-save-lobby-name'),
    inputPlayerName: document.getElementById('input-player-name'),
    btnCreateRoom: document.getElementById('btn-create-room'),
    btnShowJoin: document.getElementById('btn-show-join'),
    mpJoinFields: document.getElementById('mp-join-fields'),
    inputRoomCode: document.getElementById('input-room-code'),
    btnConfirmJoin: document.getElementById('btn-confirm-join'),
    btnPlayOffline: document.getElementById('btn-play-offline'),
    btnCloseMp: document.getElementById('btn-close-mp'),
    mpRoomCode: document.getElementById('mp-room-code'),
    lobbySeatsContainer: document.getElementById('lobby-seats-container'),
    lobbyHostHint: document.getElementById('lobby-host-hint'),
    lobbyWaitingMsg: document.getElementById('lobby-waiting-msg'),
    btnStartOnlineGame: document.getElementById('btn-start-online-game'),
    btnLeaveRoom: document.getElementById('btn-leave-room'),
    btnCopyRoomLink: document.getElementById('btn-copy-room-link'),

    modalRules: document.getElementById('modal-rules'),
    rulesContent: document.getElementById('rules-content'),
    btnCloseRules: document.getElementById('btn-close-rules'),

    // Chat
    chatDrawer: document.getElementById('chat-drawer'),
    chatHeader: document.getElementById('chat-header'),
    chatToggleIcon: document.getElementById('chat-toggle-icon'),
    btnChatMute: document.getElementById('btn-chat-mute'),
    chatBadge: document.getElementById('chat-badge'),
    chatMessages: document.getElementById('chat-messages'),
    chatInput: document.getElementById('chat-input'),
    btnSendChat: document.getElementById('btn-send-chat'),

    // Floating Chat Toast
    chatToast: document.getElementById('chat-toast'),
    chatToastSender: document.getElementById('chat-toast-sender'),
    chatToastText: document.getElementById('chat-toast-text'),
    chatToastClose: document.getElementById('chat-toast-close')
  };

  // --- Localization Engine ---
  function updateSoundUI(enabled) {
    if (dom.btnSound) {
      dom.btnSound.textContent = enabled ? '🔊' : '🔇';
    }
    if (dom.menuSoundLabel) {
      dom.menuSoundLabel.textContent = enabled ? 
        (currentLang === 'fa' ? 'صدا: روشن' : 'Sound On') : 
        (currentLang === 'fa' ? 'صدا: خاموش' : 'Sound Off');
    }
  }

  function updateChatMuteUI() {
    if (!dom.btnChatMute) return;
    if (isChatMuted) {
      dom.btnChatMute.classList.add('muted');
      dom.btnChatMute.textContent = '🔕';
      const label = t('unmuteChatBtn');
      dom.btnChatMute.setAttribute('aria-label', label);
      dom.btnChatMute.title = label;
      hideChatToast();
    } else {
      dom.btnChatMute.classList.remove('muted');
      dom.btnChatMute.textContent = '🔔';
      const label = t('muteChatBtn');
      dom.btnChatMute.setAttribute('aria-label', label);
      dom.btnChatMute.title = label;
    }
  }

  function setLanguage(lang) {
    currentLang = lang;
    try {
      localStorage.setItem('rubik_card_lang', lang);
    } catch (_) {}
    document.documentElement.lang = lang;
    document.body.classList.toggle('rtl', lang === 'fa');
    if (dom.btnLang) {
      dom.btnLang.textContent = lang === 'en' ? 'فا' : 'EN';
    }
    if (dom.menuLangLabel) {
      dom.menuLangLabel.textContent = lang === 'en' ? 'فارسی' : 'English';
    }

    const tDict = I18N[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (tDict[key]) {
        el.textContent = tDict[key];
      }
    });

    if (dom.rulesContent) {
      dom.rulesContent.innerHTML = tDict.rulesHtml;
    }
    updateSoundUI(window.soundEngine.enabled);
    updateChatMuteUI();
    updateUIState();
  }

  function t(key, replacements = {}) {
    let str = I18N[currentLang][key] || key;
    for (const [k, v] of Object.entries(replacements)) {
      str = str.replace(`{${k}}`, v);
    }
    return str;
  }

  // --- UI Notifications & Banner ---
  let notificationTimer = null;
  function showNotification(text, duration = 2200) {
    dom.notificationBubble.textContent = text;
    dom.notificationBubble.classList.add('show');
    clearTimeout(notificationTimer);
    notificationTimer = setTimeout(() => {
      dom.notificationBubble.classList.remove('show');
    }, duration);
  }

  function appendChat(sender, text, isSystem = false) {
    const div = document.createElement('div');
    div.className = `chat-msg ${isSystem ? 'system' : ''}`;
    if (isSystem) {
      div.textContent = text;
    } else {
      div.innerHTML = `<strong>${escapeHtml(sender)}:</strong> ${escapeHtml(text)}`;
    }
    dom.chatMessages.appendChild(div);
    dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight;
  }

  function dismissMainMenu() {
    if (dom.modalMainMenu) {
      dom.modalMainMenu.classList.remove('active');
    }
  }

  function updateResumeButtonVisibility() {
    const hasActiveGame = (mode === 'OFFLINE' && offlineGame && offlineGame.phase !== 'GAME_OVER' && offlineGame.phase !== 'IDLE') ||
                          (mode === 'ONLINE' && currentGameState && currentGameState.phase !== 'IDLE');
    if (dom.btnMenuResume) {
      dom.btnMenuResume.style.display = hasActiveGame ? 'flex' : 'none';
    }
  }

  function showChatNotification(sender, text) {
    const isDrawerOpen = dom.chatDrawer && dom.chatDrawer.classList.contains('open');

    if (!isDrawerOpen) {
      unreadChatCount++;
      if (dom.chatBadge) {
        dom.chatBadge.textContent = unreadChatCount > 9 ? '9+' : unreadChatCount;
        dom.chatBadge.style.display = 'inline-block';
      }
    }

    if (isChatMuted) {
      return;
    }

    if (window.soundEngine && typeof window.soundEngine.playChatNotification === 'function') {
      window.soundEngine.playChatNotification();
    }

    if (dom.chatToast) {
      if (dom.chatToastSender) dom.chatToastSender.textContent = sender || 'System';
      if (dom.chatToastText) dom.chatToastText.textContent = text;
      dom.chatToast.classList.remove('toast-exit');
      dom.chatToast.style.display = 'block';

      clearTimeout(chatToastTimer);
      chatToastTimer = setTimeout(() => {
        hideChatToast();
      }, 4500);
    }
  }

  function hideChatToast() {
    if (!dom.chatToast) return;
    dom.chatToast.classList.add('toast-exit');
    clearTimeout(chatToastTimer);
    chatToastTimer = setTimeout(() => {
      dom.chatToast.style.display = 'none';
      dom.chatToast.classList.remove('toast-exit');
    }, 250);
  }

  function clearChatNotifications() {
    unreadChatCount = 0;
    if (dom.chatBadge) {
      dom.chatBadge.style.display = 'none';
      dom.chatBadge.textContent = '0';
    }
    hideChatToast();
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // --- Visual Progressive Turn Timer (15 Seconds) ---
  let activeTurnRelSeat = null;
  let turnTimerStartTime = null;
  let turnTimerRafId = null;

  function startTurnTimer(relSeat, durationMs = 15000) {
    if (activeTurnRelSeat === relSeat && turnTimerStartTime !== null) {
      return; // Already actively ticking for this seat
    }
    stopTurnTimer();

    if (relSeat === null || relSeat === undefined || relSeat < 0 || relSeat > 3) return;

    activeTurnRelSeat = relSeat;
    turnTimerStartTime = performance.now();

    if (dom.badges[relSeat]) {
      dom.badges[relSeat].classList.add('turn-timer-active');
    }

    function tick(now) {
      if (activeTurnRelSeat !== relSeat) return;

      const elapsed = now - turnTimerStartTime;
      const remainingMs = Math.max(0, durationMs - elapsed);
      const progress = Math.max(0, Math.min(1, remainingMs / durationMs));
      const remainingSec = Math.ceil(remainingMs / 1000);

      // Color scheme based on time left:
      // > 5s: Emerald Green (#22c55e)
      // 3s - 5s: Amber Orange (#f97316)
      // <= 2s: Red (#ef4444)
      let timerColor = '#22c55e';
      let timerGlow = 'rgba(34, 197, 94, 0.45)';
      if (remainingSec <= 2) {
        timerColor = '#ef4444';
        timerGlow = 'rgba(239, 68, 68, 0.75)';
      } else if (remainingSec <= 5) {
        timerColor = '#f97316';
        timerGlow = 'rgba(249, 115, 22, 0.55)';
      }

      // Update perimeter border around the badge/name
      const badge = dom.badges[relSeat];
      if (badge) {
        badge.style.setProperty('--timer-pct', progress);
        badge.style.setProperty('--timer-color', timerColor);
        badge.style.setProperty('--timer-glow', timerGlow);
        if (remainingSec <= 3) {
          badge.classList.add('turn-timer-urgent');
        } else {
          badge.classList.remove('turn-timer-urgent');
        }
      }

      if (remainingMs > 0) {
        turnTimerRafId = requestAnimationFrame(tick);
      } else {
        onTurnTimerExpired(relSeat);
      }
    }

    turnTimerRafId = requestAnimationFrame(tick);
  }

  function stopTurnTimer() {
    if (turnTimerRafId) {
      cancelAnimationFrame(turnTimerRafId);
      turnTimerRafId = null;
    }

    for (let i = 0; i < 4; i++) {
      if (dom.badges && dom.badges[i]) {
        dom.badges[i].classList.remove('turn-timer-active', 'turn-timer-urgent');
        dom.badges[i].style.removeProperty('--timer-pct');
        dom.badges[i].style.removeProperty('--timer-color');
        dom.badges[i].style.removeProperty('--timer-glow');
      }
    }
    activeTurnRelSeat = null;
    turnTimerStartTime = null;
  }

  // --- Progressive Indicator around Hokm Selection Box (Hakem Decision) ---
  let hokmTimerRafId = null;
  let hokmTimerStartTime = null;

  function startHokmTimer(durationMs = 15000) {
    stopHokmTimer();
    if (!dom.modalHokmBox) return;

    hokmTimerStartTime = performance.now();
    dom.modalHokmBox.classList.add('timer-active');

    function tick(now) {
      if (!dom.modalHokm || !dom.modalHokm.classList.contains('active')) {
        stopHokmTimer();
        return;
      }

      const elapsed = now - hokmTimerStartTime;
      const remainingMs = Math.max(0, durationMs - elapsed);
      const progress = Math.max(0, Math.min(1, remainingMs / durationMs));
      const remainingSec = Math.ceil(remainingMs / 1000);

      let timerColor = '#22c55e';
      let timerGlow = 'rgba(34, 197, 94, 0.45)';
      if (remainingSec <= 2) {
        timerColor = '#ef4444';
        timerGlow = 'rgba(239, 68, 68, 0.75)';
      } else if (remainingSec <= 5) {
        timerColor = '#f97316';
        timerGlow = 'rgba(249, 115, 22, 0.55)';
      }

      dom.modalHokmBox.style.setProperty('--timer-pct', progress);
      dom.modalHokmBox.style.setProperty('--timer-color', timerColor);
      dom.modalHokmBox.style.setProperty('--timer-glow', timerGlow);

      if (remainingSec <= 3) {
        dom.modalHokmBox.classList.add('timer-urgent');
      } else {
        dom.modalHokmBox.classList.remove('timer-urgent');
      }

      if (remainingMs > 0) {
        hokmTimerRafId = requestAnimationFrame(tick);
      } else {
        stopHokmTimer();
        if (mode === 'OFFLINE' && offlineGame && offlineGame.phase === 'SELECT_HOKM' && offlineGame.hakem === mySeat) {
          const autoHokm = HokmLogic.chooseBestHokm(offlineGame.hands[mySeat]);
          onHokmSelected(autoHokm);
        }
      }
    }

    hokmTimerRafId = requestAnimationFrame(tick);
  }

  function stopHokmTimer() {
    if (hokmTimerRafId) {
      cancelAnimationFrame(hokmTimerRafId);
      hokmTimerRafId = null;
    }
    hokmTimerStartTime = null;
    if (dom.modalHokmBox) {
      dom.modalHokmBox.classList.remove('timer-active', 'timer-urgent');
      dom.modalHokmBox.style.removeProperty('--timer-pct');
      dom.modalHokmBox.style.removeProperty('--timer-color');
      dom.modalHokmBox.style.removeProperty('--timer-glow');
    }
  }

  function closeHokmPicker() {
    if (dom.modalHokm) {
      dom.modalHokm.classList.remove('active');
    }
    stopHokmTimer();
  }

  function onTurnTimerExpired(relSeat) {
    if (mode === 'OFFLINE' && offlineGame) {
      if (offlineGame.phase === 'SELECT_HOKM' && relSeat === 0 && offlineGame.hakem === mySeat) {
        // Auto-select Hokm for human Hakem on timeout
        const autoHokm = HokmLogic.chooseBestHokm(offlineGame.hands[mySeat]);
        onHokmSelected(autoHokm);
        return;
      }
      if (offlineGame.phase === 'PLAYING' && relSeat === 0 && offlineGame.turn === mySeat) {
        // Auto-play valid move for human in offline mode on timeout
        const hand = offlineGame.hands[mySeat];
        const card = HokmLogic.chooseBotMove(hand, offlineGame.trick, offlineGame.hokmSuit, mySeat);
        if (card) {
          const res = offlineGame.playCard(mySeat, card.id);
          triggerCardPlayEffects(card);
          handleMoveResult(res);
        }
      }
    }
  }

  // --- Card Audio & Physical Table Shake Effect ---
  function triggerCardPlayEffects(card) {
    const activeHokm = (offlineGame && offlineGame.hokmSuit) || (currentGameState && currentGameState.hokmSuit);
    const isHokmCard = (activeHokm && card.suit === activeHokm);

    if (isHokmCard) {
      // Visceral trump smash onto table felt without shaking root screen!
      window.soundEngine.playHokmSlam();
      const feltRing = document.querySelector('.felt-ring');
      const trickCarpet = document.querySelector('.trick-carpet');
      if (feltRing) {
        feltRing.classList.remove('table-slam-shake');
        void feltRing.offsetWidth;
        feltRing.classList.add('table-slam-shake');
        setTimeout(() => feltRing.classList.remove('table-slam-shake'), 400);
      }
      if (trickCarpet) {
        trickCarpet.classList.remove('table-slam-shake');
        trickCarpet.classList.add('table-slam-shake');
        setTimeout(() => trickCarpet.classList.remove('table-slam-shake'), 400);
      }
    } else {
      window.soundEngine.playCardPlay();
    }
  }

  // --- Pure UTF-8 Card HTML Generator ---
  function createCardElement(card, isPlayable = true, onClick = null) {
    const el = document.createElement('div');
    el.className = `card ${card.color} ${isPlayable ? 'playable' : 'unplayable'}`;
    el.dataset.id = card.id;

    el.innerHTML = `
      <div class="card-corner-top">
        <span class="card-rank">${card.label}</span>
        <span class="card-suit-sm">${card.symbol}</span>
      </div>
      <div class="card-center-suit">${card.symbol}</div>
      <div class="card-corner-bottom">
        <span class="card-rank">${card.label}</span>
        <span class="card-suit-sm">${card.symbol}</span>
      </div>
    `;

    if (onClick) {
      el.addEventListener('click', () => {
        if (el.classList.contains('playable')) {
          onClick(card);
        }
      });
    }

    return el;
  }

  // --- Clean Table Visuals for Fresh New Game ---
  function resetTableVisualsForNewGame() {
    offlineAnimationRunning = false;
    stopTurnTimer();
    closeHokmPicker();

    // 1. Clear player's hand cards immediately
    if (dom.playerHand) {
      dom.playerHand.innerHTML = '';
    }

    // 2. Clear all opponent card backs immediately
    if (dom.backs) {
      dom.backs.forEach(b => {
        if (b) b.innerHTML = '';
      });
    }

    // 3. Reset card count badges to 0
    if (dom.counts) {
      dom.counts.forEach(c => {
        if (c) c.textContent = '0';
      });
    }

    // 4. Clear center trick slots and remove any animations
    if (dom.trickSlots) {
      dom.trickSlots.forEach(slot => {
        slot.className = slot.className.split(' ').filter(c => 
          c.startsWith('trick-slot') || c === 'north' || c === 'south' || c === 'west' || c === 'east'
        ).join(' ');
        slot.innerHTML = '';
      });
    }

    // 5. Hide Hokm trump badge & remove crowns
    if (dom.hokmBadge) {
      dom.hokmBadge.style.display = 'none';
    }
    if (dom.crowns) {
      dom.crowns.forEach(c => {
        if (c) c.style.display = 'none';
      });
    }

    // 6. Remove active-turn highlights and timer halos
    if (dom.seats) {
      dom.seats.forEach(s => {
        if (s) s.classList.remove('active-turn');
      });
    }
    if (dom.badges) {
      dom.badges.forEach(b => {
        if (b) {
          b.classList.remove('turn-timer-active', 'turn-timer-urgent');
          b.style.removeProperty('--timer-pct');
          b.style.removeProperty('--timer-color');
          b.style.removeProperty('--timer-glow');
        }
      });
    }

    // 7. Reset scores and trick piles
    if (dom.scoreTeam0) dom.scoreTeam0.textContent = '0';
    if (dom.scoreTeam1) dom.scoreTeam1.textContent = '0';
    if (dom.tricksTeam0) dom.tricksTeam0.textContent = '0';
    if (dom.tricksTeam1) dom.tricksTeam1.textContent = '0';
    renderTrickStackPiles(0, 0);

    // 8. Close any round/game completion or inspection modals
    if (dom.modalRoundResult) dom.modalRoundResult.classList.remove('active');
    if (dom.modalLastTrick) dom.modalLastTrick.classList.remove('active');
    if (dom.modalMultiplayer) dom.modalMultiplayer.classList.remove('active');
    if (dom.takeControlBanner) dom.takeControlBanner.style.display = 'none';

    // 9. Reset currentGameState variables so no old cards linger in state
    if (currentGameState) {
      currentGameState.myHand = [];
      currentGameState.handCounts = [0, 0, 0, 0];
      currentGameState.trick = [];
      currentGameState.tricksWon = [0, 0];
      currentGameState.scores = [0, 0];
      currentGameState.completedTricks = [];
      currentGameState.hokmSuit = null;
      currentGameState.hakem = null;
      currentGameState.phase = 'DETERMINING_HAKEM';
    }
  }

  // --- Offline Mode Controller ---
  function startOfflineGame() {
    mode = 'OFFLINE';
    mySeat = 0;
    dismissMainMenu();
    resetTableVisualsForNewGame();
    clearInterval(hakemDealInterval);

    const playerConfigs = [
      { name: currentLang === 'fa' ? 'شما' : 'You', isBot: false },
      { name: currentLang === 'fa' ? 'ربات چپ' : 'Bot West', isBot: true },
      { name: currentLang === 'fa' ? 'یار' : 'Partner', isBot: true },
      { name: currentLang === 'fa' ? 'ربات راست' : 'Bot East', isBot: true }
    ];

    offlineGame = new HokmLogic.HokmGame({
      targetScore: 7,
      players: playerConfigs
    });

    offlineGame.startNewGame();
    appendChat(null, 'Starting offline match with AI bots.', true);
    runOfflineHakemDetermination();
  }

  function runOfflineHakemDetermination() {
    clearInterval(hakemDealInterval);
    resetTableVisualsForNewGame();
    offlineAnimationRunning = true;
    showNotification(t('determiningHakemMsg'), 1500);

    hakemDealInterval = setInterval(() => {
      const step = offlineGame.stepDetermineHakem();
      if (!step) {
        clearInterval(hakemDealInterval);
        return;
      }

      window.soundEngine.playDeal();
      const cardEl = createCardElement(step.card, false);
      const slot = dom.trickSlots[step.seat];
      slot.innerHTML = '';
      slot.appendChild(cardEl);

      if (step.isAce) {
        clearInterval(hakemDealInterval);
        window.soundEngine.playHokmFanfare();
        const hakemName = offlineGame.players[step.hakem].name;
        showNotification(t('hakemDecidedMsg', { name: hakemName }), 2500);

        setTimeout(() => {
          // Clear table and begin round
          dom.trickSlots.forEach(s => s.innerHTML = '');
          offlineGame.finishHakemDetermination(step.hakem);
          offlineAnimationRunning = false;
          handleOfflinePostDeal();
        }, 2200);
      }
    }, 450);
  }

  function handleOfflinePostDeal() {
    updateUIState();
    window.soundEngine.playDeal();

    const hakemSeat = offlineGame.hakem;
    const hakemPlayer = offlineGame.players[hakemSeat];

    if (hakemSeat === mySeat) {
      // User is Hakem! Show Hokm selection modal
      openHokmPicker(offlineGame.hands[mySeat], 15000);
    } else {
      closeHokmPicker();
      // Bot is Hakem!
      showNotification(t('firstFiveDealtMsg', { name: hakemPlayer.name }), 1800);
      setTimeout(() => {
        const chosenHokm = HokmLogic.chooseBestHokm(offlineGame.hands[hakemSeat]);
        offlineGame.selectHokm(chosenHokm);
        window.soundEngine.playHokmFanfare();

        const suitName = HokmLogic.SUIT_NAMES[currentLang][chosenHokm];
        showNotification(t('hokmDeclaredMsg', { name: hakemPlayer.name, suit: suitName }), 2000);
        updateUIState();
        checkOfflineTurn();
      }, 1500);
    }
  }

  function openHokmPicker(fiveCards, durationMs = 15000) {
    dom.firstFivePreview.innerHTML = '';
    const total = fiveCards.length;
    fiveCards.forEach((c, idx) => {
      const cardEl = createCardElement(c, false);
      cardEl.style.setProperty('--card-idx', idx);
      cardEl.style.setProperty('--card-total', total);
      dom.firstFivePreview.appendChild(cardEl);
    });
    dom.modalHokm.classList.add('active');
    startHokmTimer(durationMs);
    window.soundEngine.playHokmFanfare();
  }

  function onHokmSelected(suit) {
    closeHokmPicker();
    if (mode === 'OFFLINE') {
      offlineGame.selectHokm(suit);
      window.soundEngine.playHokmFanfare();
      const suitName = HokmLogic.SUIT_NAMES[currentLang][suit];
      const playerName = offlineGame.players[mySeat].name;
      showNotification(t('hokmDeclaredMsg', { name: playerName, suit: suitName }), 2000);
      updateUIState();
      checkOfflineTurn();
    } else if (mode === 'ONLINE' && onlineWs) {
      onlineWs.send(JSON.stringify({
        type: 'SELECT_HOKM',
        suit
      }));
    }
  }

  function onCardClicked(card) {
    if (offlineAnimationRunning) return;

    if (mode === 'OFFLINE') {
      if (offlineGame.phase !== 'PLAYING') return;
      if (offlineGame.turn !== mySeat) return;

      const res = offlineGame.playCard(mySeat, card.id);
      if (!res.success) {
        showNotification(res.reason, 1000);
        return;
      }

      triggerCardPlayEffects(card);
      handleMoveResult(res);
    } else if (mode === 'ONLINE' && onlineWs) {
      if (!currentGameState || currentGameState.turn !== mySeat) return;
      onlineWs.send(JSON.stringify({
        type: 'PLAY_CARD',
        cardId: card.id
      }));
    }
  }

  // --- Move Result & Trick Gathering / Sweep Animation (Universal OFFLINE + ONLINE) ---
  function handleMoveResult(res) {
    if (!res.trickComplete) {
      if (mode === 'OFFLINE') {
        updateUIState();
        checkOfflineTurn();
      }
      return;
    }

    // Trick is complete! All 4 cards must remain visible on the table during inspection
    stopTurnTimer();
    offlineAnimationRunning = true;

    if (currentGameState) {
      currentGameState.trick = [];
      if (res.scores) currentGameState.scores = res.scores;
      if (res.tricksWon) currentGameState.tricksWon = res.tricksWon;
      if (res.currentTrick) {
        if (!currentGameState.completedTricks) currentGameState.completedTricks = [];
        currentGameState.completedTricks.push({
          cards: [...res.currentTrick],
          winnerSeat: res.winnerSeat,
          winnerTeam: res.winnerSeat % 2,
          winningCard: res.winningCard
        });
      }
    }

    const winnerName = getPlayerDisplayName(res.winnerSeat);

    const winnerRelPos = (res.winnerSeat - mySeat + 4) % 4; // 0: South, 1: West, 2: North, 3: East
    const winnerTeam = res.winnerSeat % 2;

    // 1. Update UI (hands, badges) while preserving all 4 trick cards on the table
    updateUIState(null, false);

    // Make sure all 4 cards of currentTrick are rendered in trick slots
    if (res.currentTrick) {
      res.currentTrick.forEach(p => {
        const relPos = (p.seat - mySeat + 4) % 4;
        const slot = dom.trickSlots[relPos];
        if (slot) {
          slot.innerHTML = '';
          const cardEl = createCardElement(p.card, false);
          if (res.winningCard && p.card.id === res.winningCard.id) {
            cardEl.classList.add('winning-trick-card');
          }
          slot.appendChild(cardEl);
        }
      });
    }

    // Highlight winner's seat
    dom.seats.forEach((seatEl, idx) => {
      if (idx === winnerRelPos) {
        seatEl.classList.add('active-turn');
      } else {
        seatEl.classList.remove('active-turn');
      }
    });

    window.soundEngine.playTrickWin();
    showNotification(t('trickWonMsg', { name: winnerName }), 1600);
    offlineAnimationRunning = true;

    // Phase 1: Inspection Pause (1400ms) - all 4 cards remain clearly visible on the table
    setTimeout(() => {
      // Phase 2: Gather all 4 cards towards the center of the diamond
      dom.trickSlots.forEach(slot => {
        const c = slot.querySelector('.card');
        if (c) c.classList.remove('winning-trick-card');
        slot.classList.add('gathering');
      });

      setTimeout(() => {
        // Phase 3: Sweep gathered pack smoothly in front of the winning player / toward team pile
        const sweepClasses = ['sweeping-south', 'sweeping-west', 'sweeping-north', 'sweeping-east'];
        const sweepClass = sweepClasses[winnerRelPos];
        dom.trickSlots.forEach(slot => {
          slot.classList.remove('gathering');
          slot.classList.add(sweepClass);
        });
        window.soundEngine.playDeal(); // Soft card swoop audio

        setTimeout(() => {
          // Phase 4: Empty slots first so no card ghost/shadow can ever reappear on table
          dom.trickSlots.forEach(slot => {
            slot.innerHTML = '';
            slot.classList.remove('gathering', 'sweeping-south', 'sweeping-west', 'sweeping-north', 'sweeping-east');
          });

          if (currentGameState) {
            currentGameState.trick = [];
          }

          offlineAnimationRunning = false;
          updateUIState(winnerTeam, false); // Animate new trick arrival in winner's pile without redrawing trick carpet

          if (res.roundComplete) {
            if (mode === 'OFFLINE') {
              handleOfflineRoundEnd(res);
            } else if (res.roundInfo) {
              handleOnlineRoundEnd(res.roundInfo);
            }
          } else {
            if (mode === 'OFFLINE') {
              checkOfflineTurn();
            }
          }
        }, 420);
      }, 350);
    }, 1400);
  }

  function checkOfflineTurn() {
    if (offlineAnimationRunning || !offlineGame || offlineGame.phase !== 'PLAYING') return;
    const currentTurn = offlineGame.turn;

    if (currentTurn !== mySeat && offlineGame.players[currentTurn].isBot) {
      // Natural human-like paced delay (850ms)
      setTimeout(() => {
        if (offlineAnimationRunning || !offlineGame || offlineGame.phase !== 'PLAYING' || offlineGame.turn !== currentTurn) return;
        const hand = offlineGame.hands[currentTurn];
        const card = HokmLogic.chooseBotMove(hand, offlineGame.trick, offlineGame.hokmSuit, currentTurn);
        if (card) {
          const res = offlineGame.playCard(currentTurn, card.id);
          triggerCardPlayEffects(card);
          handleMoveResult(res);
        }
      }, 850);
    }
  }

  function handleOfflineRoundEnd(res) {
    stopTurnTimer();
    const info = res.roundInfo;
    const winningTeamName = info.winnerTeam === 0 ? t('team1Name') : t('team2Name');

    dom.roundResultTitle.textContent = t('roundWonMsg', { team: winningTeamName });
    if (info.kotType === 'HAKEM_KOT') {
      dom.roundResultDesc.textContent = t('hakemKotMsg');
      window.soundEngine.playKot();
    } else if (info.kotType === 'KOT') {
      dom.roundResultDesc.textContent = t('kotMsg');
      window.soundEngine.playKot();
    } else {
      dom.roundResultDesc.textContent = `Tricks: ${info.tricksWon[0]} - ${info.tricksWon[1]}`;
    }

    dom.roundResultScores.textContent = `${t('team1Short')}: ${info.scores[0]}  -  ${t('team2Short')}: ${info.scores[1]}`;

    if (info.matchOver) {
      dom.roundResultTitle.textContent = t('gameOverMsg', { team: winningTeamName });
      window.soundEngine.playVictory();
    }

    dom.modalRoundResult.classList.add('active');
  }

  // --- Won Tricks Stacks Renderer ---
  // --- Won Tricks Stacks Renderer (Criss-Cross / Check Pattern) ---
  function renderTrickStackPiles(tricksWonTeam0, tricksWonTeam1, animateTeam = null) {
    if (!dom.pileStack0 || !dom.pileStack1) return;

    dom.pileCount0.textContent = tricksWonTeam0;
    dom.pileCount1.textContent = tricksWonTeam1;

    [0, 1].forEach(team => {
      const container = team === 0 ? dom.pileStack0 : dom.pileStack1;
      const count = team === 0 ? tricksWonTeam0 : tricksWonTeam1;
      container.innerHTML = '';
      for (let i = 0; i < count; i++) {
        const packet = document.createElement('div');
        packet.className = 'pile-packet';
        // Alternating check pattern: even tricks 0deg (horizontal), odd tricks 90deg (vertical)
        const isRotated = (i % 2 === 1);
        const rot = isRotated ? 90 : 0;
        const yOffset = -i * 5;
        packet.style.setProperty('--target-y', `${yOffset}px`);
        packet.style.setProperty('--target-rot', `${rot}deg`);
        packet.style.transform = `translateY(${yOffset}px) rotate(${rot}deg)`;
        packet.style.zIndex = i + 1;
        if (animateTeam === team && i === count - 1) {
          packet.classList.add('new-arrival');
        }
        container.appendChild(packet);
      }
    });
  }

  function getPlayerDisplayName(seatIndex) {
    if (seatIndex === null || seatIndex === undefined || seatIndex < 0 || seatIndex > 3) {
      return '';
    }
    // 1. Check currentGameState.players (Online mode)
    if (currentGameState && currentGameState.players && currentGameState.players[seatIndex] && currentGameState.players[seatIndex].name) {
      return currentGameState.players[seatIndex].name;
    }
    // 2. Check offlineGame.players (Offline mode)
    if (mode === 'OFFLINE' && offlineGame && offlineGame.players && offlineGame.players[seatIndex] && offlineGame.players[seatIndex].name) {
      return offlineGame.players[seatIndex].name;
    }
    // 3. Fallback: check DOM seat names using relative position
    if (mySeat !== null && mySeat !== undefined) {
      const relPos = (seatIndex - mySeat + 4) % 4;
      if (dom.names && dom.names[relPos] && dom.names[relPos].textContent) {
        return dom.names[relPos].textContent.trim();
      }
    }
    // 4. Default seat name based on locale
    const seatKeys = ['seatSouth', 'seatWest', 'seatNorth', 'seatEast'];
    if (seatKeys[seatIndex]) {
      return t(seatKeys[seatIndex]);
    }
    return `Player ${seatIndex + 1}`;
  }

  // --- Last Trick Inspector Modal (Displays strictly the last hand played) ---
  function openLastTrickInspector() {
    const completedTricks = (mode === 'OFFLINE' && offlineGame) ? 
      (offlineGame.completedTricks || []) : 
      (currentGameState && currentGameState.completedTricks ? currentGameState.completedTricks : []);

    if (completedTricks.length === 0) {
      dom.lastTrickWinnerDesc.textContent = t('noTricksYet');
      dom.lastTrickCardsContainer.innerHTML = '';
      dom.modalLastTrick.classList.add('active');
      return;
    }

    const lastTrick = completedTricks[completedTricks.length - 1];
    renderTrickInInspector(lastTrick);
    dom.modalLastTrick.classList.add('active');
  }

  function renderTrickInInspector(trickData) {
    const winnerName = getPlayerDisplayName(trickData.winnerSeat);

    const cardSuitSymbol = HokmLogic.SUIT_SYMBOLS[trickData.winningCard.suit];
    const cardColor = HokmLogic.SUIT_COLORS[trickData.winningCard.suit];
    const cardStr = `<span style="color:${cardColor === 'red' ? 'var(--card-red)' : '#f3f4f6'}; font-weight:800;">${trickData.winningCard.label}${cardSuitSymbol}</span>`;

    dom.lastTrickWinnerDesc.innerHTML = t('wonByMsg', {
      name: `<strong>${escapeHtml(winnerName)}</strong>`,
      card: cardStr
    });

    dom.lastTrickCardsContainer.innerHTML = '';

    trickData.cards.forEach(item => {
      const playerName = getPlayerDisplayName(item.seat);

      const box = document.createElement('div');
      box.className = 'trick-inspector-card-box';

      const cardEl = createCardElement(item.card, false);
      if (item.card.id === trickData.winningCard.id) {
        cardEl.classList.add('winning-trick-card');
        const crown = document.createElement('span');
        crown.className = 'trick-inspector-winner-tag';
        crown.textContent = '👑';
        box.appendChild(crown);
      }

      const label = document.createElement('span');
      label.className = `trick-inspector-player-label team-${item.seat % 2}-name`;
      label.textContent = playerName;
      label.title = playerName;

      box.appendChild(cardEl);
      box.appendChild(label);
      dom.lastTrickCardsContainer.appendChild(box);
    });
  }

  // --- Rendering UI State ---
  function updateUIState(animateTeam = null, updateTrickCarpet = true) {
    const state = mode === 'OFFLINE' ? (offlineGame ? offlineGame.getStateForPlayer(mySeat) : null) : currentGameState;

    if (!state) return;

    // 1. Update Scores
    if (dom.scoreTeam0) dom.scoreTeam0.textContent = state.scores[0];
    if (dom.scoreTeam1) dom.scoreTeam1.textContent = state.scores[1];
    if (dom.tricksTeam0) dom.tricksTeam0.textContent = `(${state.tricksWon[0]}/7)`;
    if (dom.tricksTeam1) dom.tricksTeam1.textContent = `(${state.tricksWon[1]}/7)`;

    // Update Visual Won Trick Stacks
    renderTrickStackPiles(state.tricksWon[0], state.tricksWon[1], animateTeam);

    // 2. Hokm Badge
    if (state.hokmSuit) {
      dom.hokmBadge.style.display = 'flex';
      dom.hokmSuitIcon.textContent = HokmLogic.SUIT_SYMBOLS[state.hokmSuit];
      dom.hokmSuitIcon.className = `hokm-suit-icon ${HokmLogic.SUIT_COLORS[state.hokmSuit]}`;
      dom.hokmSuitName.textContent = HokmLogic.SUIT_NAMES[currentLang][state.hokmSuit];
    } else {
      dom.hokmBadge.style.display = 'none';
    }

    // 3. Seats Info (Relative to mySeat so mySeat is always South)
    state.players.forEach(p => {
      const relPos = (p.seat - mySeat + 4) % 4; // 0: South, 1: West, 2: North, 3: East
      dom.names[relPos].textContent = p.name;
      dom.counts[relPos].textContent = state.handCounts[p.seat];
      dom.crowns[relPos].style.display = p.isHakem ? 'inline-block' : 'none';

      // Team Color class on seat (Team 0: South & North, Team 1: West & East)
      const playerTeam = p.seat % 2;
      dom.seats[relPos].classList.remove('team-0-player', 'team-1-player');
      dom.seats[relPos].classList.add(`team-${playerTeam}-player`);

      // Online status dot
      if (dom.statusDots && dom.statusDots[relPos]) {
        const isOnline = mode === 'OFFLINE' ? true : (p.isOnline !== false);
        if (isOnline) {
          dom.statusDots[relPos].className = 'status-dot online';
          dom.statusDots[relPos].title = 'Online';
        } else {
          dom.statusDots[relPos].className = 'status-dot offline';
          dom.statusDots[relPos].title = 'Offline';
        }
      }

      // Turn Highlight
      const isTurn = (state.phase === 'PLAYING' && state.turn === p.seat) ||
                     (state.phase === 'SELECT_HOKM' && state.hakem === p.seat);
      if (isTurn) {
        dom.seats[relPos].classList.add('active-turn');
      } else {
        dom.seats[relPos].classList.remove('active-turn');
      }

      // Opponent Back Cards Visuals
      if (relPos > 0) {
        const count = state.handCounts[p.seat];
        const backsContainer = dom.backs[relPos];
        if (backsContainer) {
          backsContainer.innerHTML = '';
          const displayCount = Math.min(count, 8); // Display compact fan
          for (let i = 0; i < displayCount; i++) {
            const b = document.createElement('div');
            b.className = 'mini-card-back';
            backsContainer.appendChild(b);
          }
        }
      }
    });

    // Take Back Control Banner (Online mode when replaced by AI or AFK)
    if (dom.takeControlBanner) {
      const mySeatData = (mySeat !== null && mySeat !== undefined && state.players) ? state.players[mySeat] : null;
      const isReplaced = mySeatData ? (!!mySeatData.permanentAi || !!mySeatData.isAfk || !!state.isControlledByAi) : false;
      if (mode === 'ONLINE' && isReplaced) {
        dom.takeControlBanner.style.display = 'flex';
        if (dom.takeControlText) {
          if (mySeatData && mySeatData.permanentAi) {
            dom.takeControlText.textContent = t('aiReplaced3Rounds');
          } else {
            dom.takeControlText.textContent = t('aiPlayingForYou');
          }
        }
      } else {
        dom.takeControlBanner.style.display = 'none';
      }
    }

    // Turn Timer (15 Seconds Progressive Countdown)
    let currentTurnRelPos = null;
    if (state.phase === 'PLAYING' && state.turn !== null && state.turn !== undefined) {
      currentTurnRelPos = (state.turn - mySeat + 4) % 4;
    } else if (state.phase === 'SELECT_HOKM' && state.hakem !== null && state.hakem !== undefined) {
      currentTurnRelPos = (state.hakem - mySeat + 4) % 4;
    }

    if (currentTurnRelPos !== null && !offlineAnimationRunning) {
      startTurnTimer(currentTurnRelPos, (state.turnDuration || 15) * 1000);
    } else {
      stopTurnTimer();
    }

    if (state.phase !== 'SELECT_HOKM') {
      closeHokmPicker();
    }

    // 4. Player Hand Cards (South) with curved fan variables (Flicker-Free)
    const myHand = state.myHand || [];
    const ledSuit = state.trick.length > 0 ? state.trick[0].card.suit : null;
    const validMoves = state.turn === mySeat ? HokmLogic.getValidMoves(myHand, ledSuit) : [];
    const totalCards = myHand.length;

    // Fast DOM diffing: avoid destroying and recreating hand cards on every tick!
    const currentCardIds = Array.from(dom.playerHand.children).map(el => el.dataset.id).join(',');
    const newCardIds = myHand.map(c => c.id).join(',');

    if (currentCardIds === newCardIds && currentCardIds.length > 0) {
      // Just toggle playable / unplayable without DOM recreation
      Array.from(dom.playerHand.children).forEach((cardEl, idx) => {
        const card = myHand[idx];
        const isPlayable = state.turn === mySeat && validMoves.some(m => m.id === card.id);
        if (isPlayable) {
          cardEl.classList.add('playable');
          cardEl.classList.remove('unplayable');
        } else {
          cardEl.classList.remove('playable');
          cardEl.classList.add('unplayable');
        }
      });
    } else {
      dom.playerHand.innerHTML = '';
      const mid = (totalCards - 1) / 2;
      myHand.forEach((card, idx) => {
        const isPlayable = state.turn === mySeat && validMoves.some(m => m.id === card.id);
        const cardEl = createCardElement(card, isPlayable, onCardClicked);
        const diff = idx - mid;
        const absDiff = Math.abs(diff);
        cardEl.style.setProperty('--card-idx', idx);
        cardEl.style.setProperty('--card-total', totalCards);
        cardEl.style.setProperty('--diff', diff);
        cardEl.style.setProperty('--abs-diff', absDiff);
        cardEl.style.zIndex = idx + 1;
        dom.playerHand.appendChild(cardEl);
      });
    }

    // 5. Trick Table Cards
    if (updateTrickCarpet && !offlineAnimationRunning) {
      if (!state.trick || state.trick.length === 0) {
        dom.trickSlots.forEach(slot => {
          slot.classList.remove('gathering', 'sweeping-south', 'sweeping-west', 'sweeping-north', 'sweeping-east');
          slot.innerHTML = '';
        });
      } else {
        const occupiedSeats = new Set();
        state.trick.forEach(p => {
          const relPos = (p.seat - mySeat + 4) % 4;
          occupiedSeats.add(relPos);
          const slot = dom.trickSlots[relPos];
          const existingCard = slot.querySelector('.card');
          if (!existingCard || existingCard.dataset.id !== p.card.id) {
            slot.innerHTML = '';
            const cardEl = createCardElement(p.card, false);
            if (state.hokmSuit && p.card.suit === state.hokmSuit) {
              cardEl.classList.add('hokm-slam');
            }
            slot.appendChild(cardEl);
          }
        });
        dom.trickSlots.forEach((slot, relPos) => {
          if (!occupiedSeats.has(relPos)) {
            slot.innerHTML = '';
            slot.classList.remove('gathering', 'sweeping-south', 'sweeping-west', 'sweeping-north', 'sweeping-east');
          }
        });
      }
    }
  }

  // --- Online Multiplayer (WebSocket) ---
  function initOnlineConnection() {
    if (onlineWs && (onlineWs.readyState === WebSocket.OPEN || onlineWs.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    onlineWs = new WebSocket(`${protocol}//${host}`);

    onlineWs.onopen = () => {
      appendChat(null, 'Connected to online game server.', true);
    };

    onlineWs.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        handleOnlineMessage(msg);
      } catch (err) {
        console.error('WS Parse Error:', err);
      }
    };

    onlineWs.onclose = () => {
      appendChat(null, 'Disconnected from server.', true);
      onlineWs = null;
    };

    onlineWs.onerror = () => {
      appendChat(null, 'Server connection error.', true);
    };
  }

  function handleOnlineMessage(msg) {
    const { type } = msg;

    if (type === 'ROOM_CREATED' || type === 'ROOM_JOINED') {
      mode = 'ONLINE';
      dismissMainMenu();
      mySeat = msg.seat;
      dom.mpRoomCode.textContent = msg.roomCode;
      dom.mpEntryView.style.display = 'none';
      dom.mpLobbyView.style.display = 'block';

      // Update URL hash with room code for easy sharing
      window.location.hash = msg.roomCode;
      appendChat(null, `Joined room ${msg.roomCode} as seat ${msg.seat + 1}.`, true);
      return;
    }

    if (type === 'LOBBY_UPDATE') {
      dismissMainMenu();
      stopTurnTimer();
      if (msg.yourSeat !== undefined && msg.yourSeat !== -1) {
        mySeat = msg.yourSeat;
      }
      isHostUser = !!msg.isHost;
      renderLobbySeats(msg.seats, msg.hostId, isHostUser);
      return;
    }

    if (type === 'HAKEM_START') {
      dismissMainMenu();
      resetTableVisualsForNewGame();
      showNotification(t('determiningHakemMsg'), 2200);
      return;
    }

    if (type === 'HAKEM_STEP') {
      const step = msg.step;
      window.soundEngine.playDeal();
      const relPos = (step.seat - mySeat + 4) % 4;
      const cardEl = createCardElement(step.card, false);
      const slot = dom.trickSlots[relPos];
      if (slot) {
        slot.innerHTML = '';
        slot.appendChild(cardEl);
      }

      if (step.isAce) {
        window.soundEngine.playHokmFanfare();
        const hakemName = getPlayerDisplayName(step.hakem);
        showNotification(t('hakemDecidedMsg', { name: hakemName }), 2500);
        setTimeout(() => {
          dom.trickSlots.forEach(s => s.innerHTML = '');
        }, 2000);
      }
      return;
    }

    if (type === 'CARD_PLAYED') {
      const { seat, card, moveResult } = msg;
      const relPos = (seat - mySeat + 4) % 4;

      triggerCardPlayEffects(card);

      const slot = dom.trickSlots[relPos];
      if (slot) {
        slot.innerHTML = '';
        const cardEl = createCardElement(card, false);
        const activeHokm = (currentGameState && currentGameState.hokmSuit) || (offlineGame && offlineGame.hokmSuit);
        if (activeHokm && card.suit === activeHokm) {
          cardEl.classList.add('hokm-slam');
        }
        slot.appendChild(cardEl);
      }

      if (moveResult) {
        handleMoveResult(moveResult);
      }
      return;
    }

    if (type === 'GAME_STATE') {
      currentGameState = msg.state;
      dismissMainMenu();
      dom.modalMultiplayer.classList.remove('active');
      if (currentGameState.mySeat !== undefined && currentGameState.mySeat !== null) {
        mySeat = currentGameState.mySeat;
      }
      if (!offlineAnimationRunning) {
        updateUIState();
      }

      if (currentGameState.phase === 'SELECT_HOKM' && currentGameState.hakem === mySeat) {
        openHokmPicker(currentGameState.myHand, (currentGameState.turnDuration || 15) * 1000);
      } else {
        closeHokmPicker();
      }

      if (currentGameState.phase === 'ROUND_OVER' && currentGameState.lastRoundInfo && !offlineAnimationRunning) {
        handleOnlineRoundEnd(currentGameState.lastRoundInfo);
      }
      return;
    }

    if (type === 'HOKM_SELECTED') {
      stopTurnTimer();
      closeHokmPicker();
      const suitName = HokmLogic.SUIT_NAMES[currentLang][msg.suit];
      showNotification(`Hokm declared: ${suitName}!`, 2000);
      window.soundEngine.playHokmFanfare();
      return;
    }

    if (type === 'CHAT') {
      appendChat(msg.sender, msg.text);
      showChatNotification(msg.sender, msg.text);
      return;
    }

    if (type === 'ERROR') {
      showNotification(msg.message, 2500);
      return;
    }
  }

  function sendSwapSeats(seatA, seatB) {
    if (!onlineWs || onlineWs.readyState !== WebSocket.OPEN) return;
    onlineWs.send(JSON.stringify({
      type: 'SWAP_SEATS',
      seatA,
      seatB
    }));
    swapSourceSeat = null;
  }

  function renderLobbySeats(seats, hostId, isHost) {
    latestLobbySeats = seats;
    latestHostId = hostId;
    isHostUser = !!isHost;
    dom.lobbySeatsContainer.innerHTML = '';

    if (dom.lobbyNameInput && document.activeElement !== dom.lobbyNameInput) {
      const mySeatObj = seats.find(s => s.isMe);
      if (mySeatObj && mySeatObj.name) {
        dom.lobbyNameInput.value = mySeatObj.name;
      }
    }

    if (dom.lobbyHostHint) {
      dom.lobbyHostHint.style.display = isHostUser ? 'block' : 'none';
    }
    if (dom.btnStartOnlineGame && dom.lobbyWaitingMsg) {
      if (isHostUser) {
        dom.btnStartOnlineGame.style.display = 'block';
        dom.lobbyWaitingMsg.style.display = 'none';
      } else {
        dom.btnStartOnlineGame.style.display = 'none';
        dom.lobbyWaitingMsg.style.display = 'block';
      }
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'lobby-teams-wrapper';

    // Team 1 Column (Seats 0 & 2: South & North)
    const team1Col = document.createElement('div');
    team1Col.className = 'lobby-team-column';
    const team1Header = document.createElement('div');
    team1Header.className = 'lobby-team-header team-0';
    team1Header.innerHTML = `<span>👑 ${t('team1')}</span><span style="font-size:0.75rem; opacity:0.85;">${t('team1Subtitle')}</span>`;
    team1Col.appendChild(team1Header);
    team1Col.appendChild(createLobbySeatCard(seats[0] || { seat: 0, name: 'Bot 1', isBot: true }, 0, isHostUser));
    team1Col.appendChild(createLobbySeatCard(seats[2] || { seat: 2, name: 'Bot 3', isBot: true }, 2, isHostUser));

    // Team 2 Column (Seats 1 & 3: West & East)
    const team2Col = document.createElement('div');
    team2Col.className = 'lobby-team-column';
    const team2Header = document.createElement('div');
    team2Header.className = 'lobby-team-header team-1';
    team2Header.innerHTML = `<span>⚔️ ${t('team2')}</span><span style="font-size:0.75rem; opacity:0.85;">${t('team2Subtitle')}</span>`;
    team2Col.appendChild(team2Header);
    team2Col.appendChild(createLobbySeatCard(seats[1] || { seat: 1, name: 'Bot 2', isBot: true }, 1, isHostUser));
    team2Col.appendChild(createLobbySeatCard(seats[3] || { seat: 3, name: 'Bot 4', isBot: true }, 3, isHostUser));

    wrapper.appendChild(team1Col);
    wrapper.appendChild(team2Col);
    dom.lobbySeatsContainer.appendChild(wrapper);
  }

  function createLobbySeatCard(seat, seatIdx, isHost) {
    const card = document.createElement('div');
    card.className = `lobby-seat-card team-${seatIdx % 2}`;
    card.dataset.seat = seatIdx;

    if (isHost) {
      card.classList.add('draggable');
      card.setAttribute('draggable', 'true');

      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', String(seatIdx));
        e.dataTransfer.effectAllowed = 'move';
        card.style.opacity = '0.5';
      });

      card.addEventListener('dragend', () => {
        card.style.opacity = '1';
        document.querySelectorAll('.lobby-seat-card').forEach(el => el.classList.remove('drag-over'));
      });

      card.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        card.classList.add('drag-over');
      });

      card.addEventListener('dragleave', () => {
        card.classList.remove('drag-over');
      });

      card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.classList.remove('drag-over');
        const fromSeat = Number(e.dataTransfer.getData('text/plain'));
        if (!isNaN(fromSeat) && fromSeat !== seatIdx && fromSeat >= 0 && fromSeat <= 3) {
          sendSwapSeats(fromSeat, seatIdx);
        }
      });
    }

    if (swapSourceSeat !== null) {
      if (swapSourceSeat === seatIdx) {
        card.classList.add('swap-source');
      } else {
        card.classList.add('swap-target-candidate');
        card.addEventListener('click', (e) => {
          if (!e.target.closest('button')) {
            sendSwapSeats(swapSourceSeat, seatIdx);
          }
        });
      }
    }

    const posLabels = [
      t('seatSouth'),
      t('seatWest'),
      t('seatNorth'),
      t('seatEast')
    ];
    const posLabel = posLabels[seatIdx] || `Seat ${seatIdx + 1}`;

    const isMe = !!seat.isMe;
    const isSeatHost = !!seat.isHost;
    const isBot = !!seat.isBot;
    const isOnline = isBot ? true : !!seat.isOnline;

    const nameHtml = `
      <div class="lobby-seat-name">
        <span class="status-dot ${isOnline ? 'online' : ''}" style="width:7px; height:7px; display:inline-block;" title="${isOnline ? 'Online' : 'Offline'}"></span>
        ${isSeatHost ? '<span class="lobby-host-crown" title="Host">👑</span>' : ''}
        <span>${escapeHtml(seat.name || t('openSeat'))}</span>
        ${isMe ? `<span class="lobby-you-badge">${t('youBadge')}</span>` : ''}
      </div>
      <div class="lobby-seat-status">${posLabel} ${isBot ? '🤖' : '👤'}</div>
    `;

    card.innerHTML = nameHtml;

    // Actions container
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'lobby-seat-actions';

    if (isHost) {
      // 1. Swap button
      const btnSwap = document.createElement('button');
      btnSwap.type = 'button';
      btnSwap.className = `btn-seat-action ${swapSourceSeat === seatIdx ? 'btn-swap-active' : ''}`;
      btnSwap.textContent = swapSourceSeat === seatIdx ? t('cancelSwap') : (swapSourceSeat !== null ? t('swapWithThis') : t('swapSeat'));
      btnSwap.addEventListener('click', (e) => {
        e.stopPropagation();
        if (swapSourceSeat === null) {
          swapSourceSeat = seatIdx;
          renderLobbySeats(latestLobbySeats, latestHostId, isHostUser);
        } else if (swapSourceSeat === seatIdx) {
          swapSourceSeat = null;
          renderLobbySeats(latestLobbySeats, latestHostId, isHostUser);
        } else {
          sendSwapSeats(swapSourceSeat, seatIdx);
        }
      });
      actionsDiv.appendChild(btnSwap);

      // 2. Switch team button
      const btnSwitch = document.createElement('button');
      btnSwitch.type = 'button';
      btnSwitch.className = 'btn-seat-action';
      btnSwitch.textContent = t('switchTeam');
      btnSwitch.title = 'Switch this player to the opposite team';
      btnSwitch.addEventListener('click', (e) => {
        e.stopPropagation();
        const otherTeamSeats = (seatIdx % 2 === 0) ? [1, 3] : [0, 2];
        let target = otherTeamSeats.find(s => latestLobbySeats[s] && latestLobbySeats[s].isBot);
        if (target === undefined) {
          target = (seatIdx === 0 ? 1 : (seatIdx === 2 ? 3 : (seatIdx === 1 ? 0 : 2)));
        }
        sendSwapSeats(seatIdx, target);
      });
      actionsDiv.appendChild(btnSwitch);
    } else {
      // Non-host: can claim seat if it's a bot
      if (isBot && !isMe) {
        const btnClaim = document.createElement('button');
        btnClaim.type = 'button';
        btnClaim.className = 'btn-seat-action';
        btnClaim.textContent = t('takeSeat');
        btnClaim.addEventListener('click', (e) => {
          e.stopPropagation();
          if (onlineWs && onlineWs.readyState === WebSocket.OPEN) {
            onlineWs.send(JSON.stringify({
              type: 'CLAIM_SEAT',
              seat: seatIdx,
              playerName: dom.inputPlayerName.value.trim() || 'Player'
            }));
          }
        });
        actionsDiv.appendChild(btnClaim);
      }
    }

    if (actionsDiv.children.length > 0) {
      card.appendChild(actionsDiv);
    }

    return card;
  }

  function handleOnlineRoundEnd(info) {
    stopTurnTimer();
    const winningTeamName = info.winnerTeam === 0 ? t('team1Name') : t('team2Name');
    dom.roundResultTitle.textContent = t('roundWonMsg', { team: winningTeamName });

    if (info.kotType === 'HAKEM_KOT') {
      dom.roundResultDesc.textContent = t('hakemKotMsg');
      window.soundEngine.playKot();
    } else if (info.kotType === 'KOT') {
      dom.roundResultDesc.textContent = t('kotMsg');
      window.soundEngine.playKot();
    } else {
      dom.roundResultDesc.textContent = `Tricks: ${info.tricksWon[0]} - ${info.tricksWon[1]}`;
    }

    dom.roundResultScores.textContent = `${t('team1Short')}: ${info.scores[0]}  -  ${t('team2Short')}: ${info.scores[1]}`;

    if (info.matchOver) {
      dom.roundResultTitle.textContent = t('gameOverMsg', { team: winningTeamName });
      window.soundEngine.playVictory();
    }

    dom.modalRoundResult.classList.add('active');
  }

  // --- Setup Event Listeners ---
  function setupEventListeners() {
    // Main Menu Button (Home)
    if (dom.btnMenu) {
      dom.btnMenu.addEventListener('click', () => {
        updateResumeButtonVisibility();
        dom.modalMainMenu.classList.add('active');
      });
    }

    if (dom.btnMenuResume) {
      dom.btnMenuResume.addEventListener('click', () => {
        dismissMainMenu();
      });
    }

    if (dom.modalMainMenu) {
      dom.modalMainMenu.addEventListener('click', (e) => {
        if (e.target === dom.modalMainMenu) {
          const hasActiveGame = (mode === 'OFFLINE' && offlineGame && offlineGame.phase !== 'GAME_OVER' && offlineGame.phase !== 'IDLE') ||
                                (mode === 'ONLINE' && currentGameState && currentGameState.phase !== 'IDLE');
          if (hasActiveGame) {
            dismissMainMenu();
          }
        }
      });
    }

    // Main Menu Actions
    if (dom.btnMenuSolo) {
      dom.btnMenuSolo.addEventListener('click', () => {
        dismissMainMenu();
        startOfflineGame();
      });
    }

    if (dom.btnMenuOnline) {
      dom.btnMenuOnline.addEventListener('click', () => {
        dismissMainMenu();
        dom.modalMultiplayer.classList.add('active');
        initOnlineConnection();
      });
    }

    if (dom.btnMenuRules) {
      dom.btnMenuRules.addEventListener('click', () => {
        dom.modalRules.classList.add('active');
      });
    }

    if (dom.btnMenuLang) {
      dom.btnMenuLang.addEventListener('click', () => {
        setLanguage(currentLang === 'en' ? 'fa' : 'en');
      });
    }

    if (dom.btnMenuSound) {
      dom.btnMenuSound.addEventListener('click', () => {
        const en = window.soundEngine.toggle();
        updateSoundUI(en);
      });
    }

    // Header Sound Toggle
    dom.btnSound.addEventListener('click', () => {
      const en = window.soundEngine.toggle();
      updateSoundUI(en);
    });

    // Header Language Toggle
    dom.btnLang.addEventListener('click', () => {
      setLanguage(currentLang === 'en' ? 'fa' : 'en');
    });

    // Won Tricks Piles / Inspect Buttons (Inspect Last Hand Played)
    function attachInspectorTrigger(el) {
      if (!el) return;
      let lastTrigger = 0;
      const trigger = (e) => {
        const now = Date.now();
        if (now - lastTrigger < 350) return;
        lastTrigger = now;
        if (e && e.type === 'touchend') {
          e.preventDefault();
        }
        openLastTrickInspector();
      };
      el.addEventListener('click', trigger);
      el.addEventListener('touchend', trigger, { passive: false });
    }

    attachInspectorTrigger(dom.tricksPile0);
    attachInspectorTrigger(dom.tricksPile1);

    // Last Trick Inspector Close
    if (dom.btnCloseLastTrick) {
      dom.btnCloseLastTrick.addEventListener('click', () => {
        dom.modalLastTrick.classList.remove('active');
      });
    }

    if (dom.modalLastTrick) {
      dom.modalLastTrick.addEventListener('click', (e) => {
        if (e.target === dom.modalLastTrick) {
          dom.modalLastTrick.classList.remove('active');
        }
      });
    }

    // Multiplayer Modal Open
    dom.btnMultiplayer.addEventListener('click', () => {
      dismissMainMenu();
      dom.modalMultiplayer.classList.add('active');
      initOnlineConnection();
    });

    dom.btnCloseMp.addEventListener('click', () => {
      dom.modalMultiplayer.classList.remove('active');
    });

    // Rules Modal
    dom.btnRules.addEventListener('click', () => {
      dom.modalRules.classList.add('active');
    });

    dom.btnCloseRules.addEventListener('click', () => {
      dom.modalRules.classList.remove('active');
    });

    // New Game Button
    dom.btnNewGame.addEventListener('click', () => {
      if (mode === 'ONLINE') {
        const isHost = currentGameState ? !!currentGameState.isHost : false;
        if (!isHost) {
          showNotification(currentLang === 'fa' ? 'فقط میزبان می‌تواند بازی جدید را شروع کند' : 'Only the host can start a new game.', 2500);
          return;
        }
        if (confirm(currentLang === 'fa' ? 'آیا مایلید بازی جدیدی را آغاز کنید؟' : 'Start a fresh new match?')) {
          resetTableVisualsForNewGame();
          if (onlineWs && onlineWs.readyState === WebSocket.OPEN) {
            onlineWs.send(JSON.stringify({ type: 'NEW_GAME' }));
          }
        }
      } else {
        if (confirm(currentLang === 'fa' ? 'آیا مایلید بازی جدیدی را آغاز کنید؟' : 'Start a fresh new match?')) {
          startOfflineGame();
        }
      }
    });

    // Next Round Button
    dom.btnNextRound.addEventListener('click', () => {
      dom.modalRoundResult.classList.remove('active');
      if (mode === 'OFFLINE') {
        if (offlineGame.phase === 'GAME_OVER') {
          startOfflineGame();
        } else {
          offlineGame.startRound();
          handleOfflinePostDeal();
        }
      }
    });

    // Hokm Suit Chooser Buttons
    document.querySelectorAll('.suit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const suit = btn.getAttribute('data-suit');
        onHokmSelected(suit);
      });
    });

    // Multiplayer Form Actions
    dom.btnCreateRoom.addEventListener('click', () => {
      dismissMainMenu();
      initOnlineConnection();
      const playerName = dom.inputPlayerName.value.trim() || 'Player 1';
      setTimeout(() => {
        if (onlineWs && onlineWs.readyState === WebSocket.OPEN) {
          onlineWs.send(JSON.stringify({
            type: 'CREATE_ROOM',
            playerName
          }));
        }
      }, 300);
    });

    dom.btnShowJoin.addEventListener('click', () => {
      dom.mpJoinFields.style.display = 'block';
    });

    dom.btnConfirmJoin.addEventListener('click', () => {
      const code = dom.inputRoomCode.value.trim().toUpperCase();
      const playerName = dom.inputPlayerName.value.trim() || 'Player';
      if (!code) return;

      dismissMainMenu();
      initOnlineConnection();
      setTimeout(() => {
        if (onlineWs && onlineWs.readyState === WebSocket.OPEN) {
          onlineWs.send(JSON.stringify({
            type: 'JOIN_ROOM',
            roomCode: code,
            playerName
          }));
        }
      }, 300);
    });

    dom.btnPlayOffline.addEventListener('click', () => {
      dismissMainMenu();
      dom.modalMultiplayer.classList.remove('active');
      startOfflineGame();
    });

    dom.btnStartOnlineGame.addEventListener('click', () => {
      dismissMainMenu();
      resetTableVisualsForNewGame();
      if (onlineWs) {
        onlineWs.send(JSON.stringify({ type: 'START_GAME' }));
      }
    });

    dom.btnLeaveRoom.addEventListener('click', () => {
      if (onlineWs) {
        onlineWs.close();
      }
      dom.mpLobbyView.style.display = 'none';
      dom.mpEntryView.style.display = 'block';
      dom.modalMainMenu.classList.add('active');
    });

    dom.btnCopyRoomLink.addEventListener('click', () => {
      const code = dom.mpRoomCode.textContent;
      const url = `${window.location.origin}${window.location.pathname}#${code}`;
      navigator.clipboard.writeText(url).then(() => {
        showNotification('Room link copied to clipboard! 📋', 1500);
      }).catch(() => {
        showNotification(`Room Code: ${code}`, 2000);
      });
    });

    function handleLobbyNameChange() {
      if (!dom.lobbyNameInput) return;
      const newName = dom.lobbyNameInput.value.trim().slice(0, 15);
      if (!newName) return;
      if (dom.inputPlayerName) dom.inputPlayerName.value = newName;
      localStorage.setItem('rubik_player_name', newName);
      if (onlineWs && onlineWs.readyState === WebSocket.OPEN) {
        onlineWs.send(JSON.stringify({
          type: 'CHANGE_NAME',
          name: newName
        }));
      }
      showNotification(t('nameUpdatedMsg', { name: newName }));
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

    // Take Back Control Button
    if (dom.btnTakeControl) {
      dom.btnTakeControl.addEventListener('click', () => {
        if (mode === 'ONLINE' && onlineWs) {
          onlineWs.send(JSON.stringify({ type: 'TAKE_CONTROL' }));
          showNotification(t('controlReclaimedMsg'), 2200);
        }
      });
    }

    // Chat Mute Toggle
    if (dom.btnChatMute) {
      dom.btnChatMute.addEventListener('click', (e) => {
        e.stopPropagation();
        isChatMuted = !isChatMuted;
        try {
          localStorage.setItem('hokm_chat_muted', isChatMuted ? 'true' : 'false');
        } catch (_) {}
        updateChatMuteUI();
      });
    }

    // Chat Drawer Toggle
    dom.chatHeader.addEventListener('click', () => {
      dom.chatDrawer.classList.toggle('open');
      const isOpen = dom.chatDrawer.classList.contains('open');
      dom.chatToggleIcon.textContent = isOpen ? '▼' : '▲';
      if (isOpen) {
        clearChatNotifications();
      }
    });

    // Floating Chat Toast Events
    if (dom.chatToast) {
      dom.chatToast.addEventListener('click', (e) => {
        if (e.target === dom.chatToastClose || (dom.chatToastClose && dom.chatToastClose.contains(e.target))) {
          hideChatToast();
          return;
        }
        dom.chatDrawer.classList.add('open');
        dom.chatToggleIcon.textContent = '▼';
        clearChatNotifications();
      });
    }

    if (dom.chatToastClose) {
      dom.chatToastClose.addEventListener('click', (e) => {
        e.stopPropagation();
        hideChatToast();
      });
    }

    // Send Chat
    function sendChat() {
      const text = dom.chatInput.value.trim();
      if (!text) return;
      dom.chatInput.value = '';

      if (mode === 'ONLINE' && onlineWs) {
        onlineWs.send(JSON.stringify({ type: 'CHAT', text }));
      } else {
        appendChat(t('team1Name'), text);
      }
    }

    dom.btnSendChat.addEventListener('click', sendChat);
    dom.chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendChat();
    });
  }

  // --- Initialization ---
  function init() {
    setLanguage(currentLang);
    setupEventListeners();
    updateChatMuteUI();

    const savedPlayerName = localStorage.getItem('rubik_player_name') || 'Player';
    if (dom.inputPlayerName) dom.inputPlayerName.value = savedPlayerName;
    if (dom.lobbyNameInput) dom.lobbyNameInput.value = savedPlayerName;

    // Check if Room Code exists in URL hash (e.g. #ABCD)
    const hash = window.location.hash.replace('#', '').trim().toUpperCase();
    if (hash && hash.length === 4) {
      dom.modalMainMenu.classList.remove('active');
      dom.inputRoomCode.value = hash;
      dom.modalMultiplayer.classList.add('active');
      dom.mpJoinFields.style.display = 'block';
      initOnlineConnection();
    } else {
      // Show main menu and wait for user selection
      dom.modalMainMenu.classList.add('active');
    }
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
