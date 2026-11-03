/**
 * Rubik Card Club - UNO Client Controller
 * Pure Vanilla JavaScript with dual Singleplayer (offline vs bots)
 * and Multiplayer (online LAN/WebSockets) support.
 */

(function () {
  'use strict';

  const L = window.UnoLogic;
  const Sound = window.UnoSound;

  // =========================================================================
  // 1. I18N DICTIONARY
  // =========================================================================
  const I18N = {
    en: {
      gameTitle: 'UNO',
      menuHubTitle: 'Game Hub',
      activeColorLabel: 'Active Color:',
      passBtn: 'Pass Turn',
      chooseColorTitle: 'Choose Next Color',
      chooseColorPrompt: 'Wild card played! Choose the active color to continue:',
      colorRed: 'Red',
      colorBlue: 'Blue',
      colorGreen: 'Green',
      colorYellow: 'Yellow',
      mainMenuTitle: 'UNO Card Game',
      mainMenuSubtitle: 'Classic arcade card game online & offline',
      menuSoloTitle: 'Solo vs Smart Bots',
      menuSoloDesc: 'Instant offline game with 3 intelligent bots',
      menuOnlineTitle: 'Online & LAN Multiplayer',
      menuOnlineDesc: 'Create private room and play with friends',
      menuRulesTitle: 'Rules & Guide',
      menuRulesDesc: 'How to play UNO, action cards and scoring',
      resumeGame: 'Resume Game',
      multiplayerTitle: 'Play Online / LAN',
      multiplayerDesc: 'Create a room or join with a room code.',
      roomCodeLabel: 'Room Code:',
      copyLinkBtn: '📋 Copy Link',
      yourNameLabel: 'Your Name:',
      saveNameBtn: 'Save',
      createRoomBtn: 'Create Room',
      joinRoomBtn: 'Join Room',
      enterRoomCodeLabel: 'Enter 4-Character Room Code:',
      joinBtn: 'Join',
      playOfflineBots: '🤖 Play Offline vs Bots (No Server Needed)',
      waitingForHost: 'Waiting for host to start...',
      hostRearrangeHint: '👑 Host: Click "⇄ Swap" or drag players to rearrange seats.',
      startGameBtn: 'Start Game',
      leaveRoomBtn: 'Leave',
      closeBtn: 'Close',
      rulesTitle: 'UNO Rules & Instructions',
      chatTitle: 'Game Chat & Log',
      nextRoundBtn: 'Next Round',
      mainMenuBtn: 'Main Menu',
      roundCompleteTitle: 'Round Complete!',
      roundWinnerMsg: '{name} won the round!',
      matchWinnerMsg: '🏆 {name} won the match!',
      playerTurnMsg: "It's your turn!",
      botTurnMsg: "{name}'s turn...",
      drewCardMsg: '{name} drew a card.',
      playedCardMsg: '{name} played {color} {value}.',
      unoCalledMsg: '🔥 {name} called UNO!',
      unoPenaltyMsg: '⚠️ {name} was caught and drew 2 penalty cards!',
      reversedMsg: '⇄ Direction reversed!',
      skippedMsg: '⊘ {name} was skipped!',
      drawTwoMsg: '+2 {name} drew 2 cards and was skipped!',
      drawFourMsg: '+4 {name} drew 4 cards and was skipped!',
      wildColorMsg: '🎨 Color changed to {color}!',
      youBadge: 'YOU',
      openSeat: 'Open Seat',
      cardsCount: '{count} Cards',
      scorePoints: '{score} Pts',
      swapSeat: '⇄ Swap',
      swapWithThis: '⇄ Swap With This',
      cancelSwap: '✕ Cancel',
      nameUpdatedMsg: 'Your name was changed to {name}',
      aiPlayingForYou: '🤖 AI is playing for you',
      aiReplaced3Rounds: '🤖 AI playing (idle 3 turns)',
      takeControlBtn: '🎮 Take Back Control',
      unoPenaltyExpiredMsg: '⚠️ Did not declare UNO in 2s! 1 penalty card added.',
      unoDeclaredMsg: '🔥 {name} declared UNO!',
      unoCatchBtn: '⚠️ Catch UNO!'
    },
    fa: {
      gameTitle: 'بازی اونو (UNO)',
      menuHubTitle: 'هاب بازی‌ها',
      activeColorLabel: 'رنگ فعال:',
      passBtn: 'رد کردن نوبت',
      chooseColorTitle: 'انتخاب رنگ بعدی',
      chooseColorPrompt: 'کارت ویژه بازی شد! رنگ دلخواه خود را برای ادامه بازی انتخاب کنید:',
      colorRed: 'قرمز (Red)',
      colorBlue: 'آبی (Blue)',
      colorGreen: 'سبز (Green)',
      colorYellow: 'زرد (Yellow)',
      mainMenuTitle: 'بازی کارتی اونو (UNO)',
      mainMenuSubtitle: 'بازی آنلاین و آفلاین اونو با قوانین استاندارد',
      menuSoloTitle: 'بازی تک‌نفره با ربات‌ها',
      menuSoloDesc: 'بازی آفلاین و سریع با ۳ هوش مصنوعی هوشمند',
      menuOnlineTitle: 'چندنفره آنلاین و شبکه محلی',
      menuOnlineDesc: 'ساخت اتاق اختصاصی و بازی با دوستان',
      menuRulesTitle: 'قوانین و راهنمای بازی',
      menuRulesDesc: 'آموزش کامل قوانین اونو، کارت‌های ویژه و امتیازات',
      resumeGame: 'ادامه بازی جاری',
      multiplayerTitle: 'بازی چندنفره آنلاین / شبکه محلی',
      multiplayerDesc: 'اتاق بسازید یا با کد اتاق به جمع دوستانتان بپیوندید.',
      roomCodeLabel: 'کد اتاق:',
      copyLinkBtn: '📋 کپی لینک اتاق',
      yourNameLabel: 'نام شما:',
      saveNameBtn: 'ثبت نام',
      createRoomBtn: 'ساخت اتاق جدید',
      joinRoomBtn: 'ورود به اتاق',
      enterRoomCodeLabel: 'کد ۴ حرفی اتاق را وارد کنید:',
      joinBtn: 'ورود به اتاق',
      playOfflineBots: '🤖 بازی آفلاین با ربات‌ها (بدون نیاز به سرور)',
      waitingForHost: 'در انتظار شروع بازی توسط میزبان...',
      hostRearrangeHint: '👑 میزبان: با دکمه‌های «⇄ جابجایی» یا کشیدن بازیکنان می‌توانید ترتیب صندلی‌ها را تنظیم کنید.',
      startGameBtn: 'شروع بازی',
      leaveRoomBtn: 'خروج از اتاق',
      closeBtn: 'بستن',
      rulesTitle: 'راهنما و قوانین بازی اونو (UNO)',
      chatTitle: 'گزارش و چت بازی',
      nextRoundBtn: 'ادامه راند بعد',
      mainMenuBtn: 'منوی اصلی',
      roundCompleteTitle: 'پایان راند!',
      roundWinnerMsg: '{name} برنده این راند شد!',
      matchWinnerMsg: '🏆 {name} قهرمان مسابقه شد!',
      playerTurnMsg: 'نوبت شماست! یک کارت بازی کنید یا کارت بکشید.',
      botTurnMsg: 'نوبت {name}...',
      drewCardMsg: '{name} یک کارت کشید.',
      playedCardMsg: '{name} کارت {color} {value} بازی کرد.',
      unoCalledMsg: '🔥 {name} اعلام اونو (UNO) کرد!',
      unoPenaltyMsg: '⚠️ مچ {name} گرفته شد و ۲ کارت جریمه کشید!',
      reversedMsg: '⇄ جهت بازی تغییر کرد!',
      skippedMsg: '⊘ نوبت {name} سوخت!',
      drawTwoMsg: '+۲ {name} ۲ کارت کشید و نوبتش سوخت!',
      drawFourMsg: '+۴ {name} ۴ کارت کشید و نوبتش سوخت!',
      wildColorMsg: '🎨 رنگ بازی به {color} تغییر کرد!',
      youBadge: 'شما',
      openSeat: 'صندلی خالی',
      cardsCount: '{count} کارت',
      scorePoints: '{score} امتیاز',
      swapSeat: '⇄ جابجایی',
      swapWithThis: '⇄ جابجایی با این صندلی',
      cancelSwap: '✕ لغو',
      nameUpdatedMsg: 'نام شما به {name} تغییر یافت',
      aiPlayingForYou: '🤖 ربات به جای شما بازی می‌کند',
      aiReplaced3Rounds: '🤖 ربات به جای شما بازی می‌کند (عدم فعالیت)',
      takeControlBtn: '🎮 بازپس‌گیری کنترل',
      unoPenaltyExpiredMsg: '⚠️ عدم اعلام اونو در ۲ ثانیه! ۱ کارت جریمه دریافت شد.',
      unoDeclaredMsg: '🔥 {name} اعلام اونو (UNO) کرد!',
      unoCatchBtn: '⚠️ جریمه اونو!'
    }
  };

  let currentLang = localStorage.getItem('rubik_card_lang') || 'fa';
  let isChatMuted = localStorage.getItem('uno_chat_muted') === 'true';

  // =========================================================================
  // 2. APP STATE
  // =========================================================================
  let mode = 'SOLO'; // 'SOLO' or 'ONLINE'
  let onlineWs = null;
  let wsQueue = [];
  let mySeat = 0;
  let isHostUser = false;
  let currentGameState = null;
  let turnTimerId = null;
  let pendingWildCard = null;

  // Solo Mode State
  const soloState = {
    hands: [[], [], [], []],
    turn: 0,
    direction: 1, // 1: clockwise, -1: counter-clockwise
    drawPile: [],
    discardPile: [],
    activeColor: 'red',
    calledUno: [false, false, false, false],
    scores: [0, 0, 0, 0],
    targetScore: 500,
    roundNumber: 1,
    pendingDrawCount: 0,
    hasDrawnThisTurn: false,
    drewPlayableCard: null,
    consecutiveAfkTurns: 0,
    players: [
      { name: 'You', isBot: false },
      { name: 'Bot 1', isBot: true },
      { name: 'Bot 2', isBot: true },
      { name: 'Bot 3', isBot: true }
    ]
  };

  // Lobby state
  let latestLobbySeats = [];
  let latestHostId = null;
  let swapSourceSeat = null;

  // DOM Elements cache
  let dom = {};

  // =========================================================================
  // 3. INITIALIZATION
  // =========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    cacheDomElements();
    applyLanguage(currentLang);
    bindEvents();
    updateChatMuteUI();

    const savedPlayerName = localStorage.getItem('rubik_player_name') || 'Player';
    if (dom.inputPlayerName) dom.inputPlayerName.value = savedPlayerName;
    if (dom.lobbyNameInput) dom.lobbyNameInput.value = savedPlayerName;

    // Check URL hash for direct room join
    const hash = window.location.hash.replace('#', '').toUpperCase().trim();
    if (hash && hash.length >= 4) {
      if (dom.inputRoomCode) dom.inputRoomCode.value = hash;
      openMultiplayerModal(true);
      connectAndJoinRoom(hash);
    } else {
      // Open main menu on launch
      if (dom.modalMainMenu) dom.modalMainMenu.classList.add('active');
    }
  });

  function cacheDomElements() {
    dom = {
      unoTable: document.getElementById('uno-table'),
      directionIndicator: document.getElementById('direction-indicator'),
      drawPile: document.getElementById('draw-pile'),
      drawCountBadge: document.getElementById('draw-count-badge'),
      drawStackBadge: document.getElementById('draw-stack-badge'),
      discardPile: document.getElementById('discard-pile'),
      emptyDiscardHint: document.getElementById('empty-discard-hint'),
      centerStatusText: document.getElementById('center-status-text'),
      topUnoPill: document.getElementById('top-uno-pill'),
      activeColorDot: document.getElementById('active-color-dot'),
      activeColorName: document.getElementById('active-color-name'),
      notificationBubble: document.getElementById('notification-bubble'),

      // Controls
      btnUnoShout: document.getElementById('btn-uno-shout'),
      btnActionPass: document.getElementById('btn-action-pass'),
      btnActionCatch: document.getElementById('btn-action-catch'),
      playerHand: document.getElementById('hand-0'),

      // Modals
      modalColorChooser: document.getElementById('modal-color-chooser'),
      modalRoundResult: document.getElementById('modal-round-result'),
      roundWinnerTitle: document.getElementById('round-winner-title'),
      roundWinnerDesc: document.getElementById('round-winner-desc'),
      scoresSummaryTable: document.getElementById('scores-summary-table'),
      btnNextRound: document.getElementById('btn-next-round'),
      btnResultMenu: document.getElementById('btn-result-menu'),

      modalMainMenu: document.getElementById('modal-main-menu'),
      btnMenuResume: document.getElementById('btn-menu-resume'),
      btnMenuSolo: document.getElementById('btn-menu-solo'),
      btnMenuOnline: document.getElementById('btn-menu-online'),
      btnMenuRules: document.getElementById('btn-menu-rules'),

      modalMultiplayer: document.getElementById('modal-multiplayer'),
      mpLobbyView: document.getElementById('mp-lobby-view'),
      mpEntryView: document.getElementById('mp-entry-view'),
      mpRoomCode: document.getElementById('mp-room-code'),
      btnCopyRoomLink: document.getElementById('btn-copy-room-link'),
      lobbyNameBar: document.getElementById('lobby-name-bar'),
      lobbyNameInput: document.getElementById('lobby-name-input'),
      btnSaveLobbyName: document.getElementById('btn-save-lobby-name'),
      lobbyHostHint: document.getElementById('lobby-host-hint'),
      lobbySeatsContainer: document.getElementById('lobby-seats-container'),
      btnStartOnlineGame: document.getElementById('btn-start-online-game'),
      lobbyWaitingMsg: document.getElementById('lobby-waiting-msg'),
      btnLeaveRoom: document.getElementById('btn-leave-room'),
      inputPlayerName: document.getElementById('input-player-name'),
      btnCreateRoom: document.getElementById('btn-create-room'),
      btnShowJoin: document.getElementById('btn-show-join'),
      mpJoinFields: document.getElementById('mp-join-fields'),
      inputRoomCode: document.getElementById('input-room-code'),
      btnConfirmJoin: document.getElementById('btn-confirm-join'),
      btnPlayOffline: document.getElementById('btn-play-offline'),
      btnCloseMp: document.getElementById('btn-close-mp'),

      modalRules: document.getElementById('modal-rules'),
      btnRules: document.getElementById('btn-rules'),
      btnCloseRules: document.getElementById('btn-close-rules'),

      // Seats & Badges (Matching Hokm & Shelem)
      seats: [
        document.getElementById('seat-0'),
        document.getElementById('seat-1'),
        document.getElementById('seat-2'),
        document.getElementById('seat-3')
      ],
      badges: [
        document.getElementById('badge-0'),
        document.getElementById('badge-1'),
        document.getElementById('badge-2'),
        document.getElementById('badge-3')
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
      unoBadges: [
        document.getElementById('uno-badge-0'),
        document.getElementById('uno-badge-1'),
        document.getElementById('uno-badge-2'),
        document.getElementById('uno-badge-3')
      ],

      // Take Control Banner
      takeControlBanner: document.getElementById('take-control-banner'),
      takeControlText: document.getElementById('take-control-text'),
      btnTakeControl: document.getElementById('btn-take-control'),

      // Chat Drawer & Toast (Matching Hokm & Shelem)
      chatDrawer: document.getElementById('chat-drawer'),
      chatHeader: document.getElementById('chat-header'),
      chatToggleIcon: document.getElementById('chat-toggle-icon'),
      btnChatMute: document.getElementById('btn-chat-mute'),
      chatBadge: document.getElementById('chat-badge'),
      chatMessages: document.getElementById('chat-messages'),
      chatInput: document.getElementById('chat-input'),
      btnSendChat: document.getElementById('btn-send-chat'),

      chatToast: document.getElementById('chat-toast'),
      chatToastSender: document.getElementById('chat-toast-sender'),
      chatToastText: document.getElementById('chat-toast-text'),
      chatToastClose: document.getElementById('chat-toast-close'),

      btnSound: document.getElementById('btn-sound'),
      btnLang: document.getElementById('btn-lang'),
      btnMenu: document.getElementById('btn-menu'),

      // Mobile Navigation
      btnMobileNav: document.getElementById('btn-mobile-nav'),
      mobileNavDropdown: document.getElementById('mobile-nav-dropdown'),
      btnMobSound: document.getElementById('btn-mob-sound'),
      btnMobLang: document.getElementById('btn-mob-lang'),
      btnMobRules: document.getElementById('btn-mob-rules'),
      btnMobMenu: document.getElementById('btn-mob-menu')
    };
  }

  // =========================================================================
  // 4. I18N & NOTIFICATIONS
  // =========================================================================
  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('rubik_card_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'fa') ? 'rtl' : 'ltr';

    const t = I18N[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key]) {
        el.textContent = t[key];
      }
    });

    if (dom.btnLang) {
      dom.btnLang.textContent = (lang === 'fa') ? '🌐 EN' : '🌐 فارسی';
    }
    if (dom.btnMobLang) {
      dom.btnMobLang.textContent = (lang === 'fa') ? '🌐 EN' : '🌐 فارسی';
    }

    renderActiveColorPill();
  }

  let notifyTimer = null;
  function notify(msg) {
    if (!dom.notificationBubble) return;
    dom.notificationBubble.textContent = msg;
    dom.notificationBubble.classList.add('show');
    clearTimeout(notifyTimer);
    notifyTimer = setTimeout(() => {
      dom.notificationBubble.classList.remove('show');
    }, 2400);
  }

  let unreadChatCount = 0;
  let chatToastTimer = null;

  function showChatNotification(sender, text) {
    const isDrawerOpen = dom.chatDrawer && dom.chatDrawer.classList.contains('open');

    if (!isDrawerOpen) {
      unreadChatCount++;
      if (dom.chatBadge) {
        dom.chatBadge.textContent = unreadChatCount > 9 ? '9+' : unreadChatCount;
        dom.chatBadge.style.display = 'inline-flex';
      }
    }

    if (isChatMuted) return;

    if (Sound && typeof Sound.playChatNotification === 'function') {
      Sound.playChatNotification();
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

  function updateChatMuteUI() {
    if (dom.btnChatMute) {
      dom.btnChatMute.classList.toggle('muted', isChatMuted);
      dom.btnChatMute.textContent = isChatMuted ? '🔕' : '🔔';
    }
  }

  function appendChat(sender, text, isSystem = false) {
    if (!dom.chatMessages) return;
    const msgEl = document.createElement('div');
    msgEl.className = `chat-msg ${isSystem ? 'system' : ''}`;
    if (isSystem) {
      msgEl.textContent = text;
    } else {
      msgEl.innerHTML = `<span class="sender">${escapeHtml(sender)}:</span> <span>${escapeHtml(text)}</span>`;
    }
    dom.chatMessages.appendChild(msgEl);
    dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight;

    if (!isSystem) {
      showChatNotification(sender, text);
    }
  }

  function escapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // --- Visual Progressive Turn Timer (15 Seconds - Matches Hokm & Shelem) ---
  let activeTurnRelSeat = null;
  let turnTimerStartTime = null;
  let turnTimerRafId = null;

  function startTurnTimer(relSeat, durationMs = 15000) {
    if (activeTurnRelSeat === relSeat && turnTimerStartTime !== null) {
      return; // Already actively ticking
    }
    stopTurnTimer();
    if (relSeat === null || relSeat === undefined || relSeat < 0 || relSeat > 3) return;

    activeTurnRelSeat = relSeat;
    turnTimerStartTime = performance.now();

    if (dom.badges && dom.badges[relSeat]) {
      dom.badges[relSeat].classList.add('turn-timer-active');
    }

    function tick(now) {
      if (activeTurnRelSeat !== relSeat) return;

      const elapsed = now - turnTimerStartTime;
      const remainingMs = Math.max(0, durationMs - elapsed);
      const progress = Math.max(0, Math.min(1, remainingMs / durationMs));
      const remainingSec = Math.ceil(remainingMs / 1000);

      // Color scheme based on time left (Same as Hokm & Shelem):
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

      const badge = dom.badges ? dom.badges[relSeat] : null;
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

  function onTurnTimerExpired(relSeat) {
    stopTurnTimer();
    if (mode === 'SOLO' && relSeat === 0 && soloState.turn === 0) {
      soloState.consecutiveAfkTurns = (soloState.consecutiveAfkTurns || 0) + 1;
      if (soloState.consecutiveAfkTurns >= 3) {
        soloState.players[0].isAfk = true;
        soloState.players[0].permanentAi = true;
        if (dom.takeControlBanner) {
          dom.takeControlBanner.style.display = 'flex';
          if (dom.takeControlText) {
            dom.takeControlText.textContent = I18N[currentLang].aiPlayingForYou;
          }
        }
        appendChat(null, `${soloState.players[0].name} timed out (3/3). AI taking over.`, true);
      } else {
        appendChat(null, `${soloState.players[0].name} timed out (${soloState.consecutiveAfkTurns}/3). Auto-playing turn.`, true);
      }

      // Auto-play for human in Solo mode on timeout
      const hand = soloState.hands[0];
      const topCard = soloState.discardPile[soloState.discardPile.length - 1];
      const playable = hand.find(c => L.isValidPlay(c, topCard, soloState.activeColor, soloState.pendingDrawCount || 0));
      if (playable) {
        const chosenCol = (playable.color === 'wild') ? L.getBotColorChoice(hand) : playable.color;
        executePlayCard(0, playable, chosenCol);
      } else {
        if (!soloState.hasDrawnThisTurn) {
          onPlayerDrawClicked();
        } else {
          passSoloTurn();
        }
      }
    }
  }

  // --- Uno! Button & 2-Second Penalty Timer ---
  let unoPenaltyTimerId = null;
  let unoPenaltyEndTime = null;
  let unoPenaltyRafId = null;

  function cancelUnoPenaltyTimer() {
    if (unoPenaltyTimerId) {
      clearTimeout(unoPenaltyTimerId);
      unoPenaltyTimerId = null;
    }
    if (unoPenaltyRafId) {
      cancelAnimationFrame(unoPenaltyRafId);
      unoPenaltyRafId = null;
    }
    unoPenaltyEndTime = null;
  }

  function startUnoPenaltyTimer(seatIndex) {
    cancelUnoPenaltyTimer();

    if (seatIndex === 0) {
      // Local human player: button activated and shown for 2 seconds
      hideCatchUnoButton(); // Never show penalty button to the caller themself

      if (dom.btnUnoShout) {
        dom.btnUnoShout.style.display = 'inline-flex';
        dom.btnUnoShout.disabled = false;
        dom.btnUnoShout.classList.add('must-call-uno');
      }

      unoPenaltyEndTime = performance.now() + 2000;

      function tickPenalty(now) {
        if (!unoPenaltyEndTime) return;
        const remainingMs = Math.max(0, unoPenaltyEndTime - now);
        const sec = (remainingMs / 1000).toFixed(1);
        if (dom.btnUnoShout) {
          dom.btnUnoShout.textContent = `🔥 UNO! (${sec}s)`;
        }

        if (remainingMs > 0) {
          unoPenaltyRafId = requestAnimationFrame(tickPenalty);
        }
      }

      unoPenaltyRafId = requestAnimationFrame(tickPenalty);

      // In Solo mode: after 1 second, the 3 bot opponents can attempt to catch player 0 if not called
      setTimeout(() => {
        if (mode === 'SOLO' && soloState.hands[0].length === 1 && !soloState.calledUno[0]) {
          if (Math.random() < 0.8) {
            setTimeout(() => {
              if (mode === 'SOLO' && soloState.hands[0].length === 1 && !soloState.calledUno[0]) {
                const catcherSeat = 1 + Math.floor(Math.random() * 3);
                cancelUnoPenaltyTimer();
                drawCardsForPlayer(0, 2);
                animateAttackPenalty(0, 2);
                Sound.playAttackPenalty();
                notify(I18N[currentLang].unoPenaltyMsg.replace('{name}', soloState.players[0].name));
                appendChat(null, `⚡ ${soloState.players[catcherSeat].name} caught ${soloState.players[0].name} without shouting UNO! (+2 penalty cards)`, true);
                updateUnoButtonState();
                renderSoloGameState();
              }
            }, 250 + Math.random() * 450);
          }
        }
      }, 1000);

      // Authoritative 2-second penalty timer
      unoPenaltyTimerId = setTimeout(() => {
        cancelUnoPenaltyTimer();
        if (mode === 'SOLO') {
          if (soloState.hands[0].length === 1 && !soloState.calledUno[0]) {
            drawCardsForPlayer(0, 1);
            animateAttackPenalty(0, 1);
            Sound.playAttackPenalty();
            notify(I18N[currentLang].unoPenaltyExpiredMsg);
            appendChat(null, I18N[currentLang].unoPenaltyExpiredMsg, true);
            updateUnoButtonState();
            renderSoloGameState();
          }
        }
      }, 2000);
    } else {
      // Bot seat in Solo mode
      if (mode === 'SOLO') {
        const willCall = Math.random() < 0.85;
        if (willCall) {
          setTimeout(() => {
            if (soloState.hands[seatIndex] && soloState.hands[seatIndex].length === 1 && !soloState.calledUno[seatIndex]) {
              soloState.calledUno[seatIndex] = true;
              Sound.playUnoCall();
              notify(I18N[currentLang].unoDeclaredMsg.replace('{name}', soloState.players[seatIndex].name));
              appendChat(null, `📢 ${soloState.players[seatIndex].name} UNO!`, true);
              hideCatchUnoButton();
              renderSoloGameState();
            }
          }, 700 + Math.random() * 500);
        }

        unoPenaltyTimerId = setTimeout(() => {
          if (soloState.hands[seatIndex] && soloState.hands[seatIndex].length === 1 && !soloState.calledUno[seatIndex]) {
            drawCardsForPlayer(seatIndex, 1);
            animateAttackPenalty(seatIndex, 1);
            const pName = soloState.players[seatIndex].name;
            appendChat(null, `⚠️ ${pName} did not declare UNO in 2s! (+1 penalty card)`, true);
            hideCatchUnoButton();
            renderSoloGameState();
          }
        }, 2000);
      }
    }
  }

  function updateUnoButtonState() {
    const handLen = (mode === 'SOLO') ? soloState.hands[0].length : (currentGameState && currentGameState.hand ? currentGameState.hand.length : 0);
    if (handLen > 1 && mode === 'SOLO') {
      soloState.calledUno[0] = false;
    }
    const hasCalled = (mode === 'SOLO') ? soloState.calledUno[0] : (currentGameState && currentGameState.players && currentGameState.players[mySeat] ? currentGameState.players[mySeat].calledUno : false);

    if (dom.btnUnoShout) {
      if (handLen === 1 && !hasCalled) {
        dom.btnUnoShout.style.display = 'inline-flex';
        dom.btnUnoShout.disabled = false;
        dom.btnUnoShout.classList.add('must-call-uno');
        if (!unoPenaltyEndTime) {
          startUnoPenaltyTimer(mode === 'SOLO' ? 0 : mySeat);
        }
      } else {
        cancelUnoPenaltyTimer();
        dom.btnUnoShout.style.display = 'none';
        dom.btnUnoShout.disabled = true;
        dom.btnUnoShout.classList.remove('must-call-uno');
        dom.btnUnoShout.textContent = '🔥 UNO!';
      }
    }
  }

  // --- Card Play Flying Animation ---
  function animateCardPlay(fromRelSeat, card, onComplete) {
    if (!dom.discardPile) {
      if (onComplete) onComplete();
      return;
    }

    let sourceRect = null;
    if (fromRelSeat === 0) {
      const cardInHand = dom.playerHand ? (dom.playerHand.querySelector(`[data-id="${card.id}"]`) || dom.playerHand.querySelector(`[data-card-id="${card.id}"]`)) : null;
      if (cardInHand) {
        sourceRect = cardInHand.getBoundingClientRect();
      }
    }
    if (!sourceRect) {
      const sourceEl = (fromRelSeat === 0) ? dom.playerHand : document.getElementById(`hand-${fromRelSeat}`) || dom.seats[fromRelSeat];
      if (sourceEl) {
        sourceRect = sourceEl.getBoundingClientRect();
      }
    }

    const discardRect = dom.discardPile.getBoundingClientRect();

    const flyingCard = createUnoCardElement(card, false);
    flyingCard.className += ' uno-flying-card';

    const cardW = 70;
    const cardH = 100;
    const startX = sourceRect ? (sourceRect.left + sourceRect.width / 2 - cardW / 2) : (window.innerWidth / 2 - cardW / 2);
    const startY = sourceRect ? (sourceRect.top + sourceRect.height / 2 - cardH / 2) : (window.innerHeight - 150);

    const targetX = discardRect.left + (discardRect.width - cardW) / 2;
    const targetY = discardRect.top + (discardRect.height - cardH) / 2;
    const targetRot = Math.round(Math.random() * 20 - 10);

    flyingCard.style.left = `${startX}px`;
    flyingCard.style.top = `${startY}px`;
    flyingCard.style.transform = `scale(0.85) rotate(${Math.round(Math.random() * 30 - 15)}deg)`;

    document.body.appendChild(flyingCard);

    // Force reflow
    void flyingCard.offsetWidth;

    flyingCard.style.left = `${targetX}px`;
    flyingCard.style.top = `${targetY}px`;
    flyingCard.style.transform = `scale(1) rotate(${targetRot}deg)`;

    Sound.playCardPlay();

    setTimeout(() => {
      if (flyingCard.parentNode) {
        flyingCard.parentNode.removeChild(flyingCard);
      }
      if (dom.discardPile) {
        dom.discardPile.classList.remove('discard-pop');
        void dom.discardPile.offsetWidth;
        dom.discardPile.classList.add('discard-pop');
      }
      if (onComplete) onComplete();
    }, 320);
  }

  // --- Card Draw Flying Animation (Grab card from table draw pile) ---
  function animateCardDraw(toRelSeat, onComplete) {
    if (!dom.drawPile) {
      if (onComplete) onComplete();
      return;
    }

    // Tap pulse on draw pile
    dom.drawPile.classList.remove('draw-pile-tap');
    void dom.drawPile.offsetWidth;
    dom.drawPile.classList.add('draw-pile-tap');

    const drawRect = dom.drawPile.getBoundingClientRect();
    let targetRect = null;
    if (toRelSeat === 0) {
      targetRect = dom.playerHand ? dom.playerHand.getBoundingClientRect() : null;
    }
    if (!targetRect) {
      const targetEl = (toRelSeat === 0) ? dom.seats[0] : (document.getElementById(`hand-${toRelSeat}`) || dom.seats[toRelSeat]);
      if (targetEl) targetRect = targetEl.getBoundingClientRect();
    }

    const cardW = 56;
    const cardH = 82;
    const startX = drawRect.left + (drawRect.width - cardW) / 2;
    const startY = drawRect.top + (drawRect.height - cardH) / 2;

    const targetX = targetRect ? (targetRect.left + targetRect.width / 2 - cardW / 2) : (window.innerWidth / 2 - cardW / 2);
    const targetY = targetRect ? (targetRect.top + targetRect.height / 2 - cardH / 2) : (window.innerHeight - 90);

    const drawingCard = document.createElement('div');
    drawingCard.className = 'uno-drawing-card';
    drawingCard.innerHTML = `
      <div class="card-inner-oval">
        <span>UNO</span>
      </div>
    `;

    drawingCard.style.left = `${startX}px`;
    drawingCard.style.top = `${startY}px`;
    drawingCard.style.transform = `scale(1) rotate(${Math.round(Math.random() * 16 - 8)}deg)`;

    document.body.appendChild(drawingCard);

    // Force reflow
    void drawingCard.offsetWidth;

    drawingCard.style.left = `${targetX}px`;
    drawingCard.style.top = `${targetY}px`;
    drawingCard.style.transform = `scale(0.85) rotate(${Math.round(Math.random() * 20 - 10)}deg)`;
    drawingCard.style.opacity = '0.9';

    Sound.playCardDraw();

    setTimeout(() => {
      if (drawingCard.parentNode) {
        drawingCard.parentNode.removeChild(drawingCard);
      }
      if (onComplete) onComplete();
    }, 320);
  }

  // --- Attack Penalty Animation (+2 and +4 Cards) ---
  function showAttackSplash(toRelSeat, count) {
    const badge = document.createElement('div');
    badge.className = `penalty-splash-badge ${count === 4 ? 'draw4' : 'draw2'}`;
    badge.textContent = `+${count}!`;

    let targetRect = null;
    if (dom.seats && dom.seats[toRelSeat]) {
      targetRect = dom.seats[toRelSeat].getBoundingClientRect();
    }
    const x = targetRect ? (targetRect.left + targetRect.width / 2) : (window.innerWidth / 2);
    const y = targetRect ? (targetRect.top + targetRect.height / 2) : (window.innerHeight / 2);

    badge.style.left = `${x}px`;
    badge.style.top = `${y}px`;

    document.body.appendChild(badge);

    setTimeout(() => {
      if (badge.parentNode) {
        badge.parentNode.removeChild(badge);
      }
    }, 1000);
  }

  function animateAttackPenalty(toRelSeat, count, onComplete) {
    showAttackSplash(toRelSeat, count);
    Sound.playAttackPenalty();

    // Vibrate / flash victim badge without displacing seat horizontally
    const badgeEl = dom.badges ? dom.badges[toRelSeat] : document.getElementById(`badge-${toRelSeat}`);
    if (badgeEl) {
      badgeEl.classList.remove('badge-penalty-hit');
      void badgeEl.offsetWidth;
      badgeEl.classList.add('badge-penalty-hit');
      setTimeout(() => badgeEl.classList.remove('badge-penalty-hit'), 700);
    }

    let cardsDrawn = 0;
    const interval = setInterval(() => {
      animateCardDraw(toRelSeat);
      cardsDrawn++;
      if (cardsDrawn >= count) {
        clearInterval(interval);
        if (onComplete) {
          setTimeout(onComplete, 350);
        }
      }
    }, 130);
  }

  // =========================================================================
  // 5. SOLO (SINGLEPLAYER) GAME ENGINE
  // =========================================================================
  function startSoloGame() {
    mode = 'SOLO';
    mySeat = 0;
    isHostUser = true;

    if (dom.modalMainMenu) dom.modalMainMenu.classList.remove('active');
    if (dom.modalMultiplayer) dom.modalMultiplayer.classList.remove('active');
    if (dom.btnMenuResume) dom.btnMenuResume.style.display = 'inline-flex';

    soloState.scores = [0, 0, 0, 0];
    soloState.roundNumber = 0;
    soloState.pendingDrawCount = 0;
    soloState.consecutiveAfkTurns = 0;
    soloState.players[0].isAfk = false;
    soloState.players[0].permanentAi = false;
    soloState.players[0].afkRoundsCount = 0;
    soloState.players[0].originalName = soloState.players[0].originalName || 'You';
    soloState.players[0].name = soloState.players[0].originalName;
    if (dom.takeControlBanner) dom.takeControlBanner.style.display = 'none';

    startSoloRound();
  }

  function startSoloRound() {
    soloState.roundNumber++;
    soloState.direction = 1;
    soloState.pendingDrawCount = 0;
    soloState.hasDrawnThisTurn = false;
    soloState.drewPlayableCard = null;
    soloState.calledUno = [false, false, false, false];
    cancelUnoPenaltyTimer();
    hideCatchUnoButton();
    if (dom.btnUnoShout) dom.btnUnoShout.style.display = 'none';

    // Create & shuffle deck
    const deck = L.createDeck();
    const shuffled = L.shuffleDeck(deck);
    const dealt = L.dealUnoCards(shuffled, 4, 7);

    soloState.hands = dealt.hands;
    soloState.drawPile = dealt.drawPile;
    soloState.discardPile = dealt.discardPile;
    soloState.activeColor = dealt.activeColor;
    soloState.turn = (soloState.roundNumber - 1) % 4;

    appendChat(null, `--- Round ${soloState.roundNumber} Started ---`, true);
    Sound.playCardDraw();

    renderSoloGameState();
    processSoloTurn();
  }

  function renderSoloGameState() {
    renderCenterPiles(soloState.discardPile, soloState.drawPile, soloState.activeColor);
    renderDirection(soloState.direction);
    renderActiveColorPill(soloState.activeColor);

    // Render seats
    for (let seat = 0; seat < 4; seat++) {
      updateSeatVisuals(seat, {
        name: soloState.players[seat].name,
        cardCount: soloState.hands[seat].length,
        score: soloState.scores[seat],
        isTurn: (soloState.turn === seat),
        calledUno: soloState.calledUno[seat]
      });

      if (seat === 0) {
        renderLocalPlayerHand(soloState.hands[0], soloState.discardPile[soloState.discardPile.length - 1], soloState.activeColor);
      } else {
        renderOpponentCardFan(seat, soloState.hands[seat].length);
      }
    }

    // Pass and Catch Buttons
    if (dom.btnActionPass) {
      dom.btnActionPass.style.display = (soloState.turn === 0 && soloState.hasDrawnThisTurn) ? 'inline-flex' : 'none';
    }

    // Take Back Control Banner (Solo mode when replaced by AI or AFK)
    if (dom.takeControlBanner) {
      const isReplaced = !!soloState.players[0].permanentAi || !!soloState.players[0].isAfk;
      if (isReplaced) {
        dom.takeControlBanner.style.display = 'flex';
        if (dom.takeControlText) {
          dom.takeControlText.textContent = soloState.players[0].permanentAi
            ? I18N[currentLang].aiReplaced3Rounds
            : I18N[currentLang].aiPlayingForYou;
        }
      } else {
        dom.takeControlBanner.style.display = 'none';
      }
    }

    // Check if anyone has 1 card without calling UNO
    checkCatchUnoOpportunity();
  }

  function renderCenterPiles(discardPile, drawPile, activeColor) {
    if (dom.drawCountBadge) {
      dom.drawCountBadge.textContent = drawPile.length;
    }

    // Render Draw Stack Badge (+2, +4, +6, etc.)
    const pendingStack = (mode === 'SOLO') ? (soloState.pendingDrawCount || 0) : (currentGameState ? (currentGameState.pendingDrawCount || 0) : 0);
    if (dom.drawStackBadge) {
      if (pendingStack > 0) {
        dom.drawStackBadge.textContent = `+${pendingStack}`;
        dom.drawStackBadge.style.display = 'block';
      } else {
        dom.drawStackBadge.style.display = 'none';
      }
    }

    if (dom.discardPile) {
      dom.discardPile.innerHTML = '';
      if (discardPile && discardPile.length > 0) {
        const topCard = discardPile[discardPile.length - 1];
        const cardEl = createUnoCardElement(topCard, false);
        dom.discardPile.appendChild(cardEl);
      } else if (dom.emptyDiscardHint) {
        dom.discardPile.appendChild(dom.emptyDiscardHint);
      }
    }

    // Glow draw pile on local turn
    const isMyTurn = (mode === 'SOLO' && soloState.turn === 0) || (mode === 'ONLINE' && currentGameState && currentGameState.turn === mySeat);
    if (dom.drawPile) {
      if (isMyTurn) {
        dom.drawPile.classList.add('active-turn-can-draw');
      } else {
        dom.drawPile.classList.remove('active-turn-can-draw');
      }
    }
  }

  function renderDirection(direction) {
    if (!dom.directionIndicator) return;
    if (direction === 1) {
      dom.directionIndicator.className = 'direction-indicator clockwise';
    } else {
      dom.directionIndicator.className = 'direction-indicator counter-clockwise';
    }
  }

  function renderActiveColorPill(color) {
    if (!dom.activeColorDot || !dom.activeColorName) return;
    const activeCol = color || (mode === 'SOLO' ? soloState.activeColor : (currentGameState ? currentGameState.activeColor : 'red'));
    dom.activeColorDot.className = `active-color-dot color-${activeCol}`;
    dom.activeColorName.textContent = I18N[currentLang][`color${capitalize(activeCol)}`] || activeCol;
  }

  function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  }

  function updateSeatVisuals(relPos, info) {
    const seatEl = dom.seats ? dom.seats[relPos] : document.getElementById(`seat-${relPos}`);
    if (seatEl) {
      if (info.isTurn) {
        seatEl.classList.add('active-turn');
      } else {
        seatEl.classList.remove('active-turn');
      }
    }

    if (dom.names && dom.names[relPos]) {
      dom.names[relPos].textContent = info.name;
    }

    if (dom.counts && dom.counts[relPos]) {
      dom.counts[relPos].textContent = info.cardCount;
    }

    if (dom.crowns && dom.crowns[relPos]) {
      dom.crowns[relPos].style.display = info.isHost ? 'inline-block' : 'none';
    }

    if (dom.statusDots && dom.statusDots[relPos]) {
      const isOnline = mode === 'SOLO' ? true : (info.isOnline !== false);
      dom.statusDots[relPos].className = `status-dot ${isOnline ? 'online' : 'offline'}`;
      dom.statusDots[relPos].title = isOnline ? 'Online' : 'Offline';
    }

    if (dom.unoBadges && dom.unoBadges[relPos]) {
      dom.unoBadges[relPos].style.display = (info.calledUno && info.cardCount === 1) ? 'inline-block' : 'none';
    }
  }

  function renderLocalPlayerHand(hand, topCard, activeColor) {
    if (!dom.playerHand) return;
    dom.playerHand.innerHTML = '';

    const isMyTurn = (mode === 'SOLO' && soloState.turn === 0) || (mode === 'ONLINE' && currentGameState && currentGameState.turn === mySeat);
    const pendingDrawCount = (mode === 'SOLO') ? (soloState.pendingDrawCount || 0) : (currentGameState ? (currentGameState.pendingDrawCount || 0) : 0);
    const sorted = L.sortHand(hand);

    sorted.forEach(card => {
      const isPlayable = isMyTurn && L.isValidPlay(card, topCard, activeColor, pendingDrawCount);
      const cardEl = createUnoCardElement(card, isPlayable);
      cardEl.dataset.id = card.id;

      if (isPlayable) {
        cardEl.addEventListener('click', () => {
          onPlayerCardClicked(card);
        });
      }

      dom.playerHand.appendChild(cardEl);
    });

    updateUnoButtonState();
  }

  function renderOpponentCardFan(seatIndex, cardCount) {
    const fanEl = document.getElementById(`hand-${seatIndex}`);
    if (!fanEl) return;
    fanEl.innerHTML = '';

    const maxShown = Math.min(cardCount, 8);
    for (let i = 0; i < maxShown; i++) {
      const miniCard = document.createElement('div');
      miniCard.className = 'mini-card-back';
      fanEl.appendChild(miniCard);
    }
  }

  function createUnoCardElement(card, isPlayable) {
    const cardEl = document.createElement('div');
    cardEl.className = `uno-card color-${card.color} ${isPlayable ? 'playable' : 'unplayable'}`;
    cardEl.dataset.cardId = card.id;
    cardEl.dataset.id = card.id;

    let symbol = card.value;
    if (L.VALUE_SYMBOLS[card.value]) {
      symbol = L.VALUE_SYMBOLS[card.value];
    }

    const centerSymbol = (card.value === 'wild') ? '' : symbol;
    const cornerSymbol = (card.value === 'wild') ? 'W' : symbol;

    cardEl.innerHTML = `
      <span class="card-corner corner-top-left">${cornerSymbol}</span>
      <div class="card-inner-oval">
        <span class="card-center-val">${centerSymbol}</span>
      </div>
      <span class="card-corner corner-bottom-right">${cornerSymbol}</span>
    `;

    return cardEl;
  }

  // =========================================================================
  // 6. PLAYER ACTIONS & BOT TURNS
  // =========================================================================
  function processSoloTurn() {
    stopTurnTimer();
    const currentTurn = soloState.turn;
    const isHuman = (currentTurn === 0);

    // Progressive turn timer (15 seconds, matching Hokm & Shelem)
    startTurnTimer(currentTurn, 15000);

    if (isHuman) {
      if (soloState.players[0].permanentAi || soloState.players[0].isAfk) {
        setTimeout(() => {
          if (soloState.turn !== 0) return;
          executeSoloBotTurn(0);
        }, 1000);
        return;
      }
      notify(I18N[currentLang].playerTurnMsg);
      Sound.playNotification();
    } else {
      const botName = soloState.players[currentTurn].name;
      if (dom.centerStatusText) {
        dom.centerStatusText.textContent = I18N[currentLang].botTurnMsg.replace('{name}', botName);
      }

      // Smart Bot action delay
      setTimeout(() => {
        if (soloState.turn !== currentTurn) return;
        executeSoloBotTurn(currentTurn);
      }, 1000);
    }
  }

  function onPlayerCardClicked(card) {
    if (mode === 'ONLINE') {
      if (!currentGameState || currentGameState.turn !== mySeat) return;
      if (card.color === 'wild') {
        pendingWildCard = card;
        openColorChooser();
        return;
      }
      sendOnlineMessage({
        type: 'UNO_PLAY_CARD',
        cardId: card.id,
        calledUno: soloState.calledUno[0]
      });
      return;
    }

    // Solo mode
    if (soloState.turn !== 0) return;
    const topCard = soloState.discardPile[soloState.discardPile.length - 1];
    if (!L.isValidPlay(card, topCard, soloState.activeColor, soloState.pendingDrawCount || 0)) {
      Sound.playError();
      return;
    }

    if (card.color === 'wild') {
      pendingWildCard = card;
      openColorChooser();
      return;
    }

    soloState.consecutiveAfkTurns = 0;
    soloState.players[0].isAfk = false;
    executePlayCard(0, card, card.color);
  }

  function executePlayCard(seatIndex, card, chosenColor) {
    const isHuman = (seatIndex === 0);

    // Animate card play smoothly!
    animateCardPlay(seatIndex, card, () => {
      // Remove from player's hand
      const hand = soloState.hands[seatIndex];
      const cardIdx = hand.findIndex(c => c.id === card.id);
      if (cardIdx !== -1) {
        hand.splice(cardIdx, 1);
      }

      // Add to discard pile
      soloState.discardPile.push(card);
      soloState.activeColor = chosenColor || card.color;
      soloState.hasDrawnThisTurn = false;
      soloState.drewPlayableCard = null;

      const playerName = soloState.players[seatIndex].name;
      const colorName = I18N[currentLang][`color${capitalize(chosenColor)}`] || chosenColor;
      const valName = L.VALUE_NAMES[currentLang][card.value] || card.value;
      appendChat(null, I18N[currentLang].playedCardMsg.replace('{name}', playerName).replace('{color}', colorName).replace('{value}', valName), true);

      // Check UNO call: only activated when player has 1 card; 2s penalty countdown starts
      if (hand.length === 1) {
        startUnoPenaltyTimer(seatIndex);
      } else {
        soloState.calledUno[seatIndex] = false;
        cancelUnoPenaltyTimer();
      }

      // Check round victory
      if (hand.length === 0) {
        stopTurnTimer();
        cancelUnoPenaltyTimer();
        onSoloRoundWon(seatIndex);
        return;
      }

      // Apply Card Effects
      applyCardEffect(seatIndex, card, chosenColor);
    });
  }

  function applyCardEffect(seatIndex, card, chosenColor) {
    const val = card.value;
    let nextTurn = (soloState.turn + soloState.direction + 4) % 4;

    if (val === 'reverse') {
      soloState.direction = -soloState.direction;
      Sound.playActionWhoosh();
      notify(I18N[currentLang].reversedMsg);
      nextTurn = (soloState.turn + soloState.direction + 4) % 4;
    } else if (val === 'skip') {
      const skippedSeat = nextTurn;
      Sound.playActionWhoosh();
      notify(I18N[currentLang].skippedMsg.replace('{name}', soloState.players[skippedSeat].name));
      nextTurn = (nextTurn + soloState.direction + 4) % 4;
    } else if (val === 'draw2') {
      soloState.pendingDrawCount = (soloState.pendingDrawCount || 0) + 2;
      Sound.playActionWhoosh();
      notify(`+2! (Stack: +${soloState.pendingDrawCount})`);
      appendChat(null, `+2 stacked! Total penalty to next player: +${soloState.pendingDrawCount}`, true);
      nextTurn = (soloState.turn + soloState.direction + 4) % 4;
    } else if (val === 'wild4') {
      soloState.pendingDrawCount = (soloState.pendingDrawCount || 0) + 4;
      Sound.playActionWhoosh();
      notify(`+4! (Stack: +${soloState.pendingDrawCount})`);
      appendChat(null, `+4 stacked! Total penalty to next player: +${soloState.pendingDrawCount}`, true);
      nextTurn = (nextTurn + soloState.direction + 4) % 4;
    }

    soloState.turn = nextTurn;
    renderSoloGameState();
    processSoloTurn();
  }

  function drawCardsForPlayer(seatIndex, count) {
    for (let i = 0; i < count; i++) {
      if (soloState.drawPile.length === 0) {
        reshuffleDiscardIntoDraw();
      }
      if (soloState.drawPile.length > 0) {
        soloState.hands[seatIndex].push(soloState.drawPile.pop());
      }
    }
    if (soloState.hands[seatIndex].length > 1) {
      soloState.calledUno[seatIndex] = false;
      if (seatIndex === 0) {
        cancelUnoPenaltyTimer();
        updateUnoButtonState();
      }
    }
  }

  function reshuffleDiscardIntoDraw() {
    if (soloState.discardPile.length <= 1) return;
    const topCard = soloState.discardPile.pop();
    soloState.drawPile = L.shuffleDeck(soloState.discardPile);
    soloState.discardPile = [topCard];
    appendChat(null, 'Draw pile replenished from discard pile.', true);
  }

  function onPlayerDrawClicked() {
    if (mode === 'ONLINE') {
      sendOnlineMessage({ type: 'UNO_DRAW_CARD' });
      return;
    }

    if (soloState.turn !== 0 || soloState.hasDrawnThisTurn) return;

    soloState.consecutiveAfkTurns = 0;
    soloState.players[0].isAfk = false;

    // Check if player is accepting an active penalty stack (+2 / +4)
    if (soloState.pendingDrawCount && soloState.pendingDrawCount > 0) {
      const count = soloState.pendingDrawCount;
      soloState.pendingDrawCount = 0;
      drawCardsForPlayer(0, count);
      animateAttackPenalty(0, count);
      notify(currentLang === 'fa' ? `شما جریمه +${count} کارت را دریافت کردید!` : `You took the penalty stack and drew ${count} cards!`);
      appendChat(null, `${soloState.players[0].name} accepted the penalty stack and drew ${count} cards.`, true);
      passSoloTurn();
      return;
    }

    if (soloState.drawPile.length === 0) {
      reshuffleDiscardIntoDraw();
    }
    if (soloState.drawPile.length === 0) return;

    animateCardDraw(0, () => {
      const drawnCard = soloState.drawPile.pop();
      soloState.hands[0].push(drawnCard);
      soloState.hasDrawnThisTurn = true;
      if (soloState.hands[0].length > 1) {
        soloState.calledUno[0] = false;
        cancelUnoPenaltyTimer();
        updateUnoButtonState();
      }

      const topCard = soloState.discardPile[soloState.discardPile.length - 1];
      const isPlayable = L.isValidPlay(drawnCard, topCard, soloState.activeColor);

      if (isPlayable) {
        soloState.drewPlayableCard = drawnCard;
        if (dom.btnActionPass) dom.btnActionPass.style.display = 'inline-flex';
        notify(currentLang === 'fa' ? 'کارت کشیده شده قابل بازی است! می‌توانید بازی کنید یا پاس دهید.' : 'Drawn card is playable! You can play it or pass.');
        renderSoloGameState();
      } else {
        if (dom.btnActionPass) dom.btnActionPass.style.display = 'none';
        notify(currentLang === 'fa' ? 'کارت کشیده شده قابل بازی نیست؛ نوبت رد شد.' : 'Drawn card is not playable; turn skipped.');
        renderSoloGameState();
        // Auto pass / skip turn immediately after short delay
        setTimeout(() => {
          if (soloState.turn === 0 && soloState.hasDrawnThisTurn) {
            passSoloTurn();
          }
        }, 650);
      }
    });
  }

  function passSoloTurn() {
    if (mode === 'ONLINE') {
      sendOnlineMessage({ type: 'UNO_PASS' });
      return;
    }

    if (soloState.turn !== 0) return;
    soloState.hasDrawnThisTurn = false;
    soloState.drewPlayableCard = null;
    soloState.turn = (soloState.turn + soloState.direction + 4) % 4;
    renderSoloGameState();
    processSoloTurn();
  }

  function executeSoloBotTurn(botSeat) {
    const hand = soloState.hands[botSeat];
    const topCard = soloState.discardPile[soloState.discardPile.length - 1];
    const nextSeat = (botSeat + soloState.direction + 4) % 4;

    const decision = L.getBotAction(hand, topCard, soloState.activeColor, {
      nextPlayerCardCount: soloState.hands[nextSeat].length,
      pendingDrawCount: soloState.pendingDrawCount || 0
    });

    if (decision.action === 'play') {
      executePlayCard(botSeat, decision.card, decision.chosenColor);
    } else {
      // If there is an active penalty stack, bot accepts the stack!
      if (soloState.pendingDrawCount && soloState.pendingDrawCount > 0) {
        const count = soloState.pendingDrawCount;
        soloState.pendingDrawCount = 0;
        drawCardsForPlayer(botSeat, count);
        animateAttackPenalty(botSeat, count);
        appendChat(null, `${soloState.players[botSeat].name} took the penalty stack and drew ${count} cards.`, true);
        soloState.turn = (soloState.turn + soloState.direction + 4) % 4;
        renderSoloGameState();
        processSoloTurn();
        return;
      }

      // Bot draws
      animateCardDraw(botSeat, () => {
        if (soloState.drawPile.length === 0) reshuffleDiscardIntoDraw();
        if (soloState.drawPile.length > 0) {
          const drawn = soloState.drawPile.pop();
          hand.push(drawn);
          if (hand.length > 1) {
            soloState.calledUno[botSeat] = false;
          }
          appendChat(null, I18N[currentLang].drewCardMsg.replace('{name}', soloState.players[botSeat].name), true);

          // If drawn card is playable, bot plays it with 75% probability
          if (L.isValidPlay(drawn, topCard, soloState.activeColor) && Math.random() < 0.75) {
            setTimeout(() => {
              const chosenCol = drawn.color === 'wild' ? L.getBotColorChoice(hand) : drawn.color;
              executePlayCard(botSeat, drawn, chosenCol);
            }, 600);
            return;
          }
        }

        // Pass turn to next player
        soloState.turn = (soloState.turn + soloState.direction + 4) % 4;
        renderSoloGameState();
        processSoloTurn();
      });
    }
  }

  function onSoloRoundWon(winnerSeat) {
    stopTurnTimer();
    cancelUnoPenaltyTimer();
    Sound.playWinFanfare();
    const winnerName = soloState.players[winnerSeat].name;

    // Calculate score
    let roundPoints = 0;
    for (let p = 0; p < 4; p++) {
      if (p !== winnerSeat) {
        roundPoints += L.calculateHandPoints(soloState.hands[p]);
      }
    }
    soloState.scores[winnerSeat] += roundPoints;

    // Check AFK rounds for local human player
    if (soloState.players[0].isAfk || soloState.players[0].permanentAi) {
      soloState.players[0].afkRoundsCount = (soloState.players[0].afkRoundsCount || 0) + 1;
      if (soloState.players[0].afkRoundsCount >= 3) {
        soloState.players[0].permanentAi = true;
        soloState.players[0].name = `${soloState.players[0].originalName || 'You'} (AI)`;
        appendChat(null, `${soloState.players[0].name} was idle for 3 full rounds and has been replaced by AI.`, true);
      }
    } else {
      soloState.players[0].afkRoundsCount = 0;
    }

    showRoundResultModal(winnerName, roundPoints, soloState.players.map((p, idx) => ({
      name: p.name,
      score: soloState.scores[idx]
    })));
  }

  function showRoundResultModal(winnerName, points, scoresList) {
    if (!dom.modalRoundResult) return;
    if (dom.roundWinnerTitle) {
      dom.roundWinnerTitle.textContent = I18N[currentLang].roundCompleteTitle;
    }
    if (dom.roundWinnerDesc) {
      dom.roundWinnerDesc.textContent = `${I18N[currentLang].roundWinnerMsg.replace('{name}', winnerName)} (+${points} pts)`;
    }

    if (dom.scoresSummaryTable) {
      dom.scoresSummaryTable.innerHTML = scoresList.map(s => `
        <div class="score-row ${s.name === winnerName ? 'winner' : ''}">
          <span>${escapeHtml(s.name)}</span>
          <span>${s.score} pts</span>
        </div>
      `).join('');
    }

    dom.modalRoundResult.classList.add('active');
  }

  // =========================================================================
  // 7. UNO CALL & CATCH PENALTIES
  // =========================================================================
  let unoCatchDelayTimer = null;
  let activeCatchTargetSeat = -1;

  function showCatchUnoButton(targetSeat) {
    if (!dom.btnActionCatch) return;
    activeCatchTargetSeat = targetSeat;
    dom.btnActionCatch.dataset.targetSeat = targetSeat;
    dom.btnActionCatch.style.display = 'inline-flex';
  }

  function hideCatchUnoButton() {
    activeCatchTargetSeat = -1;
    if (unoCatchDelayTimer) {
      clearTimeout(unoCatchDelayTimer);
      unoCatchDelayTimer = null;
    }
    if (dom.btnActionCatch) {
      dom.btnActionCatch.style.display = 'none';
      delete dom.btnActionCatch.dataset.targetSeat;
    }
  }

  function callUnoAction() {
    const handLen = (mode === 'SOLO')
      ? soloState.hands[0].length
      : (currentGameState && currentGameState.hand ? currentGameState.hand.length : 0);
    if (handLen !== 1) return;

    cancelUnoPenaltyTimer();
    Sound.playUnoCall();

    if (mode === 'ONLINE') {
      sendOnlineMessage({ type: 'UNO_CALL' });
      if (dom.btnUnoShout) {
        dom.btnUnoShout.textContent = 'UNO! ✓';
        dom.btnUnoShout.classList.remove('must-call-uno');
        setTimeout(() => {
          if (dom.btnUnoShout) dom.btnUnoShout.style.display = 'none';
        }, 400);
      }
      return;
    }

    soloState.calledUno[0] = true;
    notify(I18N[currentLang].unoDeclaredMsg.replace('{name}', soloState.players[0].name));
    appendChat(null, `📢 ${soloState.players[0].name} UNO!`, true);
    if (dom.btnUnoShout) {
      dom.btnUnoShout.textContent = 'UNO! ✓';
      dom.btnUnoShout.classList.remove('must-call-uno');
      setTimeout(() => {
        if (dom.btnUnoShout) dom.btnUnoShout.style.display = 'none';
      }, 400);
    }
    renderSoloGameState();
  }

  function checkCatchUnoOpportunity() {
    const localSeat = (mode === 'SOLO') ? 0 : mySeat;

    // Find any opponent (never the caller themself!) who has 1 card and has not called UNO
    let targetOpponent = -1;
    for (let seat = 0; seat < 4; seat++) {
      if (seat === localSeat) continue; // Never show penalty button to the caller themself!
      const cardLen = (mode === 'SOLO')
        ? (soloState.hands[seat] ? soloState.hands[seat].length : 0)
        : (currentGameState && currentGameState.cardCounts ? currentGameState.cardCounts[seat] : 0);
      const hasCalled = (mode === 'SOLO')
        ? soloState.calledUno[seat]
        : (currentGameState && currentGameState.players && currentGameState.players[seat] ? currentGameState.players[seat].calledUno : false);

      if (cardLen === 1 && !hasCalled) {
        targetOpponent = seat;
        break;
      }
    }

    if (targetOpponent === -1) {
      hideCatchUnoButton();
      return;
    }

    // If button is already showing for this target, keep it
    if (activeCatchTargetSeat === targetOpponent) {
      return;
    }

    // Penalty button should be shown after 1 second
    if (!unoCatchDelayTimer) {
      unoCatchDelayTimer = setTimeout(() => {
        unoCatchDelayTimer = null;
        // Verify target still has 1 card and still hasn't called UNO
        const cardLen = (mode === 'SOLO')
          ? (soloState.hands[targetOpponent] ? soloState.hands[targetOpponent].length : 0)
          : (currentGameState && currentGameState.cardCounts ? currentGameState.cardCounts[targetOpponent] : 0);
        const hasCalled = (mode === 'SOLO')
          ? soloState.calledUno[targetOpponent]
          : (currentGameState && currentGameState.players && currentGameState.players[targetOpponent] ? currentGameState.players[targetOpponent].calledUno : false);

        if (cardLen === 1 && !hasCalled) {
          showCatchUnoButton(targetOpponent);
        }
      }, 1000);
    }
  }

  function catchUnoAction() {
    const targetSeat = Number(dom.btnActionCatch ? dom.btnActionCatch.dataset.targetSeat : -1);
    const localSeat = (mode === 'SOLO') ? 0 : mySeat;
    if (targetSeat === -1 || targetSeat === localSeat) return;

    hideCatchUnoButton();

    if (mode === 'ONLINE') {
      sendOnlineMessage({ type: 'UNO_CATCH', targetSeat });
      return;
    }

    // Solo mode: Target draws 2 penalty cards
    drawCardsForPlayer(targetSeat, 2);
    animateAttackPenalty(targetSeat, 2);
    Sound.playAttackPenalty();
    notify(I18N[currentLang].unoPenaltyMsg.replace('{name}', soloState.players[targetSeat].name));
    appendChat(null, `⚡ ${soloState.players[0].name} caught ${soloState.players[targetSeat].name} without shouting UNO! (+2 penalty cards)`, true);
    renderSoloGameState();
  }

  // =========================================================================
  // 8. COLOR CHOOSER POPUP
  // =========================================================================
  function openColorChooser() {
    if (dom.modalColorChooser) {
      dom.modalColorChooser.classList.add('active');
    }
  }

  function selectWildColor(color) {
    if (dom.modalColorChooser) {
      dom.modalColorChooser.classList.remove('active');
    }
    if (!pendingWildCard) return;

    const card = pendingWildCard;
    pendingWildCard = null;

    if (mode === 'ONLINE') {
      sendOnlineMessage({
        type: 'UNO_PLAY_CARD',
        cardId: card.id,
        chosenColor: color,
        calledUno: soloState.calledUno[0]
      });
      return;
    }

    executePlayCard(0, card, color);
  }

  // =========================================================================
  // 9. MULTIPLAYER (ONLINE / LAN) WEBSOCKET CLIENT
  // =========================================================================
  function sendOnlineMessage(msgObj) {
    const payload = JSON.stringify(msgObj);
    if (onlineWs && onlineWs.readyState === WebSocket.OPEN) {
      onlineWs.send(payload);
    } else {
      wsQueue.push(payload);
    }
  }

  function connectAndCreateRoom() {
    ensureWebSocketConnection(() => {
      const playerName = dom.inputPlayerName ? dom.inputPlayerName.value.trim() || 'Player 1' : 'Player 1';
      sendOnlineMessage({
        type: 'CREATE_ROOM',
        gameType: 'uno',
        playerName
      });
    });
  }

  function connectAndJoinRoom(code) {
    ensureWebSocketConnection(() => {
      const playerName = dom.inputPlayerName ? dom.inputPlayerName.value.trim() || 'Player' : 'Player';
      sendOnlineMessage({
        type: 'JOIN_ROOM',
        roomCode: code,
        playerName
      });
    });
  }

  function ensureWebSocketConnection(onOpenCallback) {
    if (onlineWs && (onlineWs.readyState === WebSocket.OPEN || onlineWs.readyState === WebSocket.CONNECTING)) {
      if (onlineWs.readyState === WebSocket.OPEN && onOpenCallback) {
        onOpenCallback();
      }
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    onlineWs = new WebSocket(wsUrl);

    onlineWs.onopen = () => {
      while (wsQueue.length > 0) {
        onlineWs.send(wsQueue.shift());
      }
      if (onOpenCallback) onOpenCallback();
    };

    onlineWs.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        handleServerMessage(msg);
      } catch (err) {
        console.error('Failed to parse server message:', err);
      }
    };

    onlineWs.onclose = () => {
      onlineWs = null;
    };
  }

  function handleServerMessage(msg) {
    const { type } = msg;

    if (type === 'ROOM_CREATED' || type === 'ROOM_JOINED') {
      mode = 'ONLINE';
      if (dom.modalMainMenu) dom.modalMainMenu.classList.remove('active');
      mySeat = msg.seat;
      if (dom.mpRoomCode) dom.mpRoomCode.textContent = msg.roomCode;
      if (dom.mpEntryView) dom.mpEntryView.style.display = 'none';
      if (dom.mpLobbyView) dom.mpLobbyView.style.display = 'block';
      window.location.hash = msg.roomCode;
      appendChat(null, `Joined room ${msg.roomCode} as seat ${msg.seat + 1}.`, true);
      return;
    }

    if (type === 'LOBBY_UPDATE') {
      if (dom.modalMainMenu) dom.modalMainMenu.classList.remove('active');
      if (msg.yourSeat !== undefined && msg.yourSeat !== -1) {
        mySeat = msg.yourSeat;
      }
      isHostUser = !!msg.isHost;
      renderLobbySeats(msg.seats, msg.hostId, isHostUser);
      return;
    }

    if (type === 'CARD_PLAYED') {
      const relPos = (msg.seat - mySeat + 4) % 4;
      animateCardPlay(relPos, msg.card, () => {
        if (currentGameState) {
          currentGameState.activeColor = msg.activeColor || (msg.card.color === 'wild' ? 'red' : msg.card.color);
          if (!currentGameState.discardPile) currentGameState.discardPile = [];
          currentGameState.discardPile.push(msg.card);
          renderCenterPiles(currentGameState.discardPile, { length: currentGameState.drawPileCount || 0 }, currentGameState.activeColor);

          // Audio effect for action / attack cards
          const val = msg.card ? msg.card.value : null;
          if (val === 'draw2' || val === 'wild4' || val === 'skip' || val === 'reverse') {
            Sound.playActionWhoosh();
          }
        }
      });
      return;
    }

    if (type === 'CARD_DRAWN') {
      const relPos = (msg.seat - mySeat + 4) % 4;
      animateCardDraw(relPos);
      if (msg.count && msg.count > 1) {
        animateAttackPenalty(relPos, msg.count);
      }
      return;
    }

    if (type === 'UNO_CALLED') {
      Sound.playUnoCall();
      const pName = msg.name || `Player ${msg.seat + 1}`;
      notify(I18N[currentLang].unoDeclaredMsg.replace('{name}', pName));
      hideCatchUnoButton();
      return;
    }

    if (type === 'GAME_STATE') {
      currentGameState = msg.state;
      mode = 'ONLINE';
      if (dom.modalMainMenu) dom.modalMainMenu.classList.remove('active');
      if (dom.modalMultiplayer) dom.modalMultiplayer.classList.remove('active');
      if (dom.mpLobbyView) dom.mpLobbyView.style.display = 'none';
      if (dom.mpEntryView) dom.mpEntryView.style.display = 'none';
      if (currentGameState.mySeat !== undefined && currentGameState.mySeat !== -1) {
        mySeat = currentGameState.mySeat;
      }
      isHostUser = !!currentGameState.isHost;
      renderOnlineGameState(currentGameState);
      return;
    }

    if (type === 'CHAT') {
      appendChat(msg.sender, currentLang === 'fa' && msg.textFa ? msg.textFa : msg.text, msg.sender === 'System');
      return;
    }

    if (type === 'ERROR') {
      notify(msg.message);
      return;
    }
  }

  function renderOnlineGameState(s) {
    renderCenterPiles(s.discardPile, { length: s.drawPileCount || 0 }, s.activeColor);
    renderDirection(s.direction);
    renderActiveColorPill(s.activeColor);

    // Render seats relative to local player at South 0
    for (let relPos = 0; relPos < 4; relPos++) {
      const absSeat = (mySeat + relPos) % 4;
      const p = s.players ? s.players[absSeat] : null;
      const isTurn = (s.turn === absSeat);

      updateSeatVisuals(relPos, {
        name: p ? p.name : `P${absSeat + 1}`,
        cardCount: s.cardCounts ? (s.cardCounts[absSeat] || 0) : 0,
        score: s.scores ? (s.scores[absSeat] || 0) : 0,
        isTurn,
        calledUno: p ? p.calledUno : false,
        isHost: p ? p.isHost : false,
        isOnline: p ? (p.isBot ? true : p.isOnline) : true
      });

      if (relPos === 0) {
        const topCard = s.discardPile && s.discardPile.length > 0 ? s.discardPile[s.discardPile.length - 1] : null;
        renderLocalPlayerHand(s.hand || [], topCard, s.activeColor);
      } else {
        renderOpponentCardFan(relPos, s.cardCounts ? (s.cardCounts[absSeat] || 0) : 0);
      }
    }

    // Take Back Control Banner (Online mode when replaced by AI or AFK)
    if (dom.takeControlBanner) {
      const mySeatData = (mySeat !== null && mySeat !== undefined && s.players) ? s.players[mySeat] : null;
      const isReplaced = mySeatData ? (!!mySeatData.permanentAi || !!mySeatData.isAfk) : false;
      if (isReplaced) {
        dom.takeControlBanner.style.display = 'flex';
        if (dom.takeControlText) {
          dom.takeControlText.textContent = (mySeatData && mySeatData.permanentAi)
            ? I18N[currentLang].aiReplaced3Rounds
            : I18N[currentLang].aiPlayingForYou;
        }
      } else {
        dom.takeControlBanner.style.display = 'none';
      }
    }

    // Progressive Turn Timer (15 seconds, matching Hokm & Shelem)
    let currentTurnRelPos = null;
    if (s.phase === 'PLAYING' && s.turn !== null && s.turn !== undefined) {
      currentTurnRelPos = (s.turn - mySeat + 4) % 4;
    }
    if (currentTurnRelPos !== null) {
      startTurnTimer(currentTurnRelPos, (s.turnDuration || 15) * 1000);
    } else {
      stopTurnTimer();
    }

    // Turn notification
    if (s.turn === mySeat) {
      notify(I18N[currentLang].playerTurnMsg);
      Sound.playNotification();
    }

    // Pass Button
    if (dom.btnActionPass) {
      dom.btnActionPass.style.display = (s.turn === mySeat && s.hasDrawnThisTurn) ? 'inline-flex' : 'none';
    }

    // Update Uno shout button state
    updateUnoButtonState();

    // Check catch UNO opportunity
    checkCatchUnoOpportunity();

    // Round Result / Finished Modal
    if ((s.phase === 'ROUND_RESULT' || s.phase === 'FINISHED') && s.lastRoundResult) {
      stopTurnTimer();
      cancelUnoPenaltyTimer();
      hideCatchUnoButton();
      if (dom.btnUnoShout) dom.btnUnoShout.style.display = 'none';
      showRoundResultModal(
        s.lastRoundResult.winnerName,
        s.lastRoundResult.points,
        s.players.map((p, idx) => ({ name: p.name, score: s.scores[idx] }))
      );
    } else if (s.phase === 'PLAYING') {
      if (dom.modalRoundResult) dom.modalRoundResult.classList.remove('active');
    }
  }

  function renderLobbySeats(seats, hostId, isHost) {
    latestLobbySeats = seats;
    latestHostId = hostId;
    isHostUser = !!isHost;
    if (!dom.lobbySeatsContainer) return;
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

    seats.forEach((seat, idx) => {
      const card = document.createElement('div');
      card.className = `lobby-seat-card ${seat.isMe ? 'is-me' : ''}`;

      const isMe = !!seat.isMe;
      const isSeatHost = !!seat.isHost;
      const isBot = !!seat.isBot;
      const isOnline = isBot ? true : !!seat.isOnline;

      card.innerHTML = `
        <div class="lobby-seat-header">
          <span class="lobby-seat-title">
            ${isSeatHost ? '👑 ' : ''}${escapeHtml(seat.name || I18N[currentLang].openSeat)}
            ${isMe ? ` <span class="uno-call-badge" style="background:#f59e0b; color:#111;">${I18N[currentLang].youBadge}</span>` : ''}
          </span>
          <span class="lobby-seat-meta">Seat ${idx + 1} ${isBot ? '🤖' : '👤'}</span>
        </div>
      `;

      if (isHost) {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'lobby-seat-actions';
        const btnSwap = document.createElement('button');
        btnSwap.className = 'btn-seat-action';
        btnSwap.textContent = swapSourceSeat === idx ? I18N[currentLang].cancelSwap : (swapSourceSeat !== null ? I18N[currentLang].swapWithThis : I18N[currentLang].swapSeat);
        btnSwap.addEventListener('click', () => {
          if (swapSourceSeat === null) {
            swapSourceSeat = idx;
            renderLobbySeats(latestLobbySeats, latestHostId, isHostUser);
          } else if (swapSourceSeat === idx) {
            swapSourceSeat = null;
            renderLobbySeats(latestLobbySeats, latestHostId, isHostUser);
          } else {
            sendOnlineMessage({
              type: 'SWAP_SEATS',
              seatA: swapSourceSeat,
              seatB: idx
            });
            swapSourceSeat = null;
          }
        });
        actionsDiv.appendChild(btnSwap);
        card.appendChild(actionsDiv);
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

    sendOnlineMessage({
      type: 'CHANGE_NAME',
      name: newName
    });
    notify(I18N[currentLang].nameUpdatedMsg.replace('{name}', newName));
  }

  function openMultiplayerModal(showJoinFields = false) {
    if (dom.modalMainMenu) dom.modalMainMenu.classList.remove('active');
    if (dom.modalMultiplayer) dom.modalMultiplayer.classList.add('active');
    if (dom.mpEntryView) dom.mpEntryView.style.display = 'block';
    if (dom.mpLobbyView) dom.mpLobbyView.style.display = 'none';
    if (dom.mpJoinFields) dom.mpJoinFields.style.display = showJoinFields ? 'block' : 'none';
  }

  // =========================================================================
  // 10. EVENT LISTENERS
  // =========================================================================
  function bindEvents() {
    // Menu buttons
    if (dom.btnMenu) dom.btnMenu.addEventListener('click', () => dom.modalMainMenu.classList.add('active'));
    if (dom.btnMenuResume) dom.btnMenuResume.addEventListener('click', () => dom.modalMainMenu.classList.remove('active'));
    if (dom.btnMenuSolo) dom.btnMenuSolo.addEventListener('click', startSoloGame);
    if (dom.btnMenuOnline) dom.btnMenuOnline.addEventListener('click', () => openMultiplayerModal(false));
    if (dom.btnMenuRules) dom.btnMenuRules.addEventListener('click', () => dom.modalRules.classList.add('active'));

    // Sound & Language
    if (dom.btnSound) {
      dom.btnSound.addEventListener('click', () => {
        const enabled = Sound.toggle();
        dom.btnSound.textContent = enabled ? '🔊' : '🔇';
      });
    }

    if (dom.btnLang) {
      dom.btnLang.addEventListener('click', () => {
        applyLanguage(currentLang === 'fa' ? 'en' : 'fa');
      });
    }

    // Rules
    if (dom.btnRules) dom.btnRules.addEventListener('click', () => dom.modalRules.classList.add('active'));
    if (dom.btnCloseRules) dom.btnCloseRules.addEventListener('click', () => dom.modalRules.classList.remove('active'));

    // Mobile Hamburger Navigation & Dropdown
    if (dom.btnMobileNav) {
      dom.btnMobileNav.addEventListener('click', (e) => {
        e.stopPropagation();
        if (dom.mobileNavDropdown) {
          dom.mobileNavDropdown.classList.toggle('open');
        }
      });
    }

    document.addEventListener('click', (e) => {
      if (dom.mobileNavDropdown && dom.mobileNavDropdown.classList.contains('open')) {
        if (!dom.mobileNavDropdown.contains(e.target) && e.target !== dom.btnMobileNav) {
          dom.mobileNavDropdown.classList.remove('open');
        }
      }
    });

    if (dom.btnMobSound) {
      dom.btnMobSound.addEventListener('click', () => {
        const enabled = Sound.toggle();
        if (dom.btnSound) dom.btnSound.textContent = enabled ? '🔊' : '🔇';
        dom.btnMobSound.textContent = enabled ? '🔊 Sound' : '🔇 Sound';
        if (dom.mobileNavDropdown) dom.mobileNavDropdown.classList.remove('open');
      });
    }

    if (dom.btnMobLang) {
      dom.btnMobLang.addEventListener('click', () => {
        applyLanguage(currentLang === 'fa' ? 'en' : 'fa');
        if (dom.mobileNavDropdown) dom.mobileNavDropdown.classList.remove('open');
      });
    }

    if (dom.btnMobRules) {
      dom.btnMobRules.addEventListener('click', () => {
        if (dom.modalRules) dom.modalRules.classList.add('active');
        if (dom.mobileNavDropdown) dom.mobileNavDropdown.classList.remove('open');
      });
    }

    if (dom.btnMobMenu) {
      dom.btnMobMenu.addEventListener('click', () => {
        if (dom.modalMainMenu) dom.modalMainMenu.classList.add('active');
        if (dom.mobileNavDropdown) dom.mobileNavDropdown.classList.remove('open');
      });
    }

    // Chat Header & Drawer Toggle (Matches Hokm & Shelem)
    if (dom.chatHeader) {
      dom.chatHeader.addEventListener('click', () => {
        dom.chatDrawer.classList.toggle('open');
        const isOpen = dom.chatDrawer.classList.contains('open');
        if (dom.chatToggleIcon) dom.chatToggleIcon.textContent = isOpen ? '▼' : '▲';
        if (isOpen) {
          clearChatNotifications();
        }
      });
    }

    if (dom.btnChat) {
      dom.btnChat.addEventListener('click', () => {
        dom.chatDrawer.classList.toggle('open');
        const isOpen = dom.chatDrawer.classList.contains('open');
        if (dom.chatToggleIcon) dom.chatToggleIcon.textContent = isOpen ? '▼' : '▲';
        if (isOpen) {
          clearChatNotifications();
        }
      });
    }

    if (dom.btnChatMute) {
      dom.btnChatMute.addEventListener('click', (e) => {
        e.stopPropagation();
        isChatMuted = !isChatMuted;
        try {
          localStorage.setItem('uno_chat_muted', isChatMuted ? 'true' : 'false');
        } catch (_) {}
        updateChatMuteUI();
      });
    }

    // Floating Chat Toast Events
    if (dom.chatToast) {
      dom.chatToast.addEventListener('click', (e) => {
        if (e.target === dom.chatToastClose || (dom.chatToastClose && dom.chatToastClose.contains(e.target))) {
          hideChatToast();
          return;
        }
        if (dom.chatDrawer) {
          dom.chatDrawer.classList.add('open');
          if (dom.chatToggleIcon) dom.chatToggleIcon.textContent = '▼';
        }
        clearChatNotifications();
      });
    }

    if (dom.chatToastClose) {
      dom.chatToastClose.addEventListener('click', (e) => {
        e.stopPropagation();
        hideChatToast();
      });
    }

    // Take Back Control Button
    if (dom.btnTakeControl) {
      dom.btnTakeControl.addEventListener('click', () => {
        if (mode === 'ONLINE') {
          sendOnlineMessage({ type: 'TAKE_CONTROL' });
        } else {
          soloState.consecutiveAfkTurns = 0;
          soloState.players[0].isAfk = false;
          soloState.players[0].permanentAi = false;
          soloState.players[0].afkRoundsCount = 0;
          soloState.players[0].name = soloState.players[0].originalName || 'You';
          if (dom.takeControlBanner) dom.takeControlBanner.style.display = 'none';
          notify(I18N[currentLang].controlReclaimedMsg || 'You have taken back control! 🎮');
          renderSoloGameState();
          if (soloState.turn === 0) {
            startTurnTimer(0, 15000);
          }
        }
      });
    }
    if (dom.btnSendChat) {
      dom.btnSendChat.addEventListener('click', sendChatMessage);
    }
    if (dom.chatInput) {
      dom.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendChatMessage();
      });
    }

    // Draw Pile click
    if (dom.drawPile) dom.drawPile.addEventListener('click', onPlayerDrawClicked);

    // Action buttons
    if (dom.btnActionPass) dom.btnActionPass.addEventListener('click', passSoloTurn);
    if (dom.btnUnoShout) dom.btnUnoShout.addEventListener('click', callUnoAction);
    if (dom.btnActionCatch) dom.btnActionCatch.addEventListener('click', catchUnoAction);

    // Color chooser choices
    document.querySelectorAll('.btn-color-choice').forEach(btn => {
      btn.addEventListener('click', () => {
        const color = btn.getAttribute('data-color');
        selectWildColor(color);
      });
    });

    // Multiplayer room actions
    if (dom.btnCreateRoom) dom.btnCreateRoom.addEventListener('click', connectAndCreateRoom);
    if (dom.btnShowJoin) dom.btnShowJoin.addEventListener('click', () => dom.mpJoinFields.style.display = 'block');
    if (dom.btnConfirmJoin) {
      dom.btnConfirmJoin.addEventListener('click', () => {
        const code = (dom.inputRoomCode ? dom.inputRoomCode.value : '').toUpperCase().trim();
        if (code) connectAndJoinRoom(code);
      });
    }
    if (dom.btnPlayOffline) dom.btnPlayOffline.addEventListener('click', startSoloGame);
    if (dom.btnCloseMp) dom.btnCloseMp.addEventListener('click', () => dom.modalMultiplayer.classList.remove('active'));
    if (dom.btnStartOnlineGame) {
      dom.btnStartOnlineGame.addEventListener('click', () => {
        sendOnlineMessage({ type: 'START_GAME' });
      });
    }
    if (dom.btnLeaveRoom) {
      dom.btnLeaveRoom.addEventListener('click', () => {
        if (onlineWs) onlineWs.close();
        dom.mpLobbyView.style.display = 'none';
        dom.mpEntryView.style.display = 'block';
        window.location.hash = '';
        dom.modalMainMenu.classList.add('active');
      });
    }
    if (dom.btnCopyRoomLink) {
      dom.btnCopyRoomLink.addEventListener('click', () => {
        const code = dom.mpRoomCode ? dom.mpRoomCode.textContent : '';
        const url = `${window.location.origin}${window.location.pathname}#${code}`;
        navigator.clipboard.writeText(url).then(() => {
          notify(currentLang === 'fa' ? 'لینک اتاق در کلیپ‌بورد کپی شد! 📋' : 'Room link copied to clipboard! 📋');
        }).catch(() => {
          notify(`Room Code: ${code}`);
        });
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

    // Result buttons
    if (dom.btnNextRound) {
      dom.btnNextRound.addEventListener('click', () => {
        if (dom.modalRoundResult) dom.modalRoundResult.classList.remove('active');
        if (mode === 'SOLO') {
          startSoloRound();
        } else {
          if (currentGameState && currentGameState.status === 'FINISHED') {
            sendOnlineMessage({ type: 'START_GAME' });
          } else {
            sendOnlineMessage({ type: 'NEXT_ROUND' });
          }
        }
      });
    }
    if (dom.btnResultMenu) {
      dom.btnResultMenu.addEventListener('click', () => {
        if (dom.modalRoundResult) dom.modalRoundResult.classList.remove('active');
        if (dom.modalMainMenu) dom.modalMainMenu.classList.add('active');
      });
    }
  }

  function sendChatMessage() {
    if (!dom.chatInput) return;
    const text = dom.chatInput.value.trim();
    if (!text) return;
    dom.chatInput.value = '';

    const myName = (mode === 'SOLO') ? soloState.players[0].name : (dom.inputPlayerName ? dom.inputPlayerName.value : 'Player');

    if (mode === 'ONLINE') {
      sendOnlineMessage({ type: 'CHAT', text, sender: myName });
    } else {
      appendChat(myName, text);
    }
  }

  // Verification & test hook
  window.__unoTest = {
    getSoloState: () => soloState,
    renderSoloGameState,
    updateUnoButtonState,
    startUnoPenaltyTimer,
    callUnoAction,
    animateCardDraw,
    animateCardPlay
  };

})();
