/**
 * Bughouse Chess (شطرنج باگ‌هاوس / دوبل ۴ نفره) - Client Application Controller
 * Handles dual-board interaction, reserve drops, procedural audio, blitz dual clocks,
 * AI bots orchestration, partner callouts, and WebSocket online multiplayer.
 */

(function () {
  'use strict';

  // 1. Translations & Localizations
  const I18N = {
    fa: {
      brandTitle: 'شطرنج باگ‌هاوس',
      readyToStart: 'آماده شروع',
      playingTurn: 'بازی در جریان است',
      menu: 'منو',
      calloutLabel: 'پیام سریع به هم‌تیمی:',
      needKnight: 'نیاز به اسب',
      needPawn: 'پیاده بده',
      needQueen: 'وزیر بفرست',
      watchMate: 'مراقب مات باش',
      waitStall: 'نوبت رو نگه دار',
      goodJob: 'آفرین هم‌تیمی',
      boardA: 'تخته ۱ (Board A)',
      boardB: 'تخته ۲ (Board B)',
      team1: 'تیم ۱ (شما)',
      team1Partner: 'تیم ۱ (هم‌تیمی)',
      team2: 'تیم ۲ (حریف)',
      reserveYou: 'ذخیره شما:',
      reservePartner: 'ذخیره هم‌تیمی:',
      reserveEnemy: 'ذخیره حریف:',
      menuTitle: 'شطرنج باگ‌هاوس (۴ نفره)',
      btnAiTitle: 'تک‌نفره با ربات‌های هوشمند',
      btnAiDesc: 'شما به همراه هم‌تیمی هوش مصنوعی در برابر تیم ربات‌ها',
      btnOnlineTitle: 'چندنفره آنلاین ۴ نفره',
      btnOnlineDesc: 'ایجاد اتاق، دعوت از دوستان با لینک و لابی تیمی',
      btnRulesTitle: 'قوانین و راهنمای بازی',
      btnRulesDesc: 'قوانین رسمی Chess.com، قطعات ذخیره و مهره‌گذاری',
      btnHubTitle: 'بازگشت به هاب روبیک',
      btnHubDesc: 'مشاهده سایر بازی‌های پاسور، تخته و شطرنج',
      aiSettingsTitle: 'تنظیمات مسابقه هوش مصنوعی',
      aiDiffLabel: 'سطح هوش مصنوعی:',
      diffEasy: 'آسان (تفریحی)',
      diffMed: 'متوسط (استاندارد)',
      diffHard: 'حرفه‌ای (استراتژیک)',
      timeLabel: 'زمان بازی (ساعت بلیتس):',
      time3: '۳ دقیقه (بلیتس استاندارد)',
      time5: '۵ دقیقه (سریع)',
      timeUnlimited: 'نامحدود (بدون ساعت)',
      startMatch: 'شروع مسابقه',
      lobbyTitle: 'لابی اتاق آنلاین (۴ صندلی)',
      roomCodeLabel: 'کد اتاق:',
      copyLink: 'کپی لینک دعوت',
      fillBots: 'پر کردن با ربات',
      startOnline: 'شروع مسابقه',
      rulesModalTitle: 'قوانین شطرنج باگ‌هاوس (Chess.com)',
      victoryTeam1: 'پیروزی تیم ۱!',
      victoryTeam2: 'پیروزی تیم ۲!',
      mateReasonA: 'کیش‌مات روی تخته شماره ۱',
      mateReasonB: 'کیش‌مات روی تخته شماره ۲',
      timeoutReason: 'پایان زمان بازی (پرچم ساعت افتاد)',
      resignReason: 'تسلیم شدن یکی از بازیکنان',
      stalemateReason: 'پات (تساوی)',
      btnRematch: 'بازی مجدد',
      btnBackMenu: 'منوی اصلی',
      linkCopied: 'لینک اتاق در کلیپ‌بورد کپی شد!'
    },
    en: {
      brandTitle: 'Bughouse Chess',
      readyToStart: 'Ready to Play',
      playingTurn: 'Match in Progress',
      menu: 'Menu',
      calloutLabel: 'Quick Partner Callout:',
      needKnight: 'Need Knight',
      needPawn: 'Feed Pawn',
      needQueen: 'Send Queen',
      watchMate: 'Watch Mate!',
      waitStall: 'Stall / Hold',
      goodJob: 'Great Job!',
      boardA: 'Board 1 (Board A)',
      boardB: 'Board 2 (Board B)',
      team1: 'Team 1 (You)',
      team1Partner: 'Team 1 (Partner)',
      team2: 'Team 2 (Opponent)',
      reserveYou: 'Your Reserve:',
      reservePartner: 'Partner Reserve:',
      reserveEnemy: 'Opponent Reserve:',
      menuTitle: 'Bughouse Chess (4 Players)',
      btnAiTitle: 'Solo vs Smart AI Bots',
      btnAiDesc: 'You and an AI teammate face off against two AI opponents',
      btnOnlineTitle: '4-Player Online Match',
      btnOnlineDesc: 'Create room, invite friends via link, and team up',
      btnRulesTitle: 'Rules & How to Play',
      btnRulesDesc: 'Official Chess.com rules, reserve drops, promotion reversion',
      btnHubTitle: 'Back to Rubik Hub',
      btnHubDesc: 'Browse all classic card, board and chess games',
      aiSettingsTitle: 'AI Match Settings',
      aiDiffLabel: 'AI Difficulty:',
      diffEasy: 'Casual (Easy)',
      diffMed: 'Standard (Medium)',
      diffHard: 'Strategic (Hard)',
      timeLabel: 'Time Control (Blitz Clock):',
      time3: '3 Minutes (Standard Blitz)',
      time5: '5 Minutes (Rapid)',
      timeUnlimited: 'Unlimited (Casual)',
      startMatch: 'Start Match',
      lobbyTitle: 'Online Room Lobby (4 Seats)',
      roomCodeLabel: 'Room Code:',
      copyLink: 'Copy Invite Link',
      fillBots: 'Fill with Bots',
      startOnline: 'Start Match',
      rulesModalTitle: 'Bughouse Chess Rules (Chess.com)',
      victoryTeam1: 'Team 1 Victory!',
      victoryTeam2: 'Team 2 Victory!',
      mateReasonA: 'Checkmate on Board 1',
      mateReasonB: 'Checkmate on Board 2',
      timeoutReason: 'Flag fall / Clock timeout',
      resignReason: 'Player resignation',
      stalemateReason: 'Stalemate (Draw)',
      btnRematch: 'Rematch',
      btnBackMenu: 'Main Menu',
      linkCopied: 'Room link copied to clipboard!'
    }
  };

  const RULES_CONTENT = {
    fa: `
      <h4>۱. ساختار بازی و تیم‌ها</h4>
      <p>شطرنج باگ‌هاوس (شطرنج دوبل یا دونفره) با ۴ بازیکن بر روی ۲ صفحه شطرنج مجزا برگزار می‌شود. بازیکنان به دو تیم دو نفره تقسیم می‌شوند:</p>
      <p>• <strong>تیم ۱:</strong> سفید در تخته ۱ (شما) + سیاه در تخته ۲ (هم‌تیمی شما)<br>
         • <strong>تیم ۲:</strong> سیاه در تخته ۱ + سفید در تخته ۲ (حریفان)</p>
      <h4>۲. انتقال قطعات تسخیرشده (Reserve Passing)</h4>
      <p>هرگاه شما مهره‌ای از حریف را بزنید، آن مهره <strong>بلافاصله به بانک ذخیره هم‌تیمی شما منتقل می‌شود</strong> و او می‌تواند آن مهره را با رنگ خودش در نوبتش وارد بازی کند!</p>
      <h4>۳. قانون برگشت پیاده ترفیع‌یافته (Promotion Reversion)</h4>
      <p>طبق قوانین رسمی Chess.com، اگر پیاده‌ای در صفحه به وزیر (یا رخ/اسب/فیل) تبدیل شود و سپس حریف آن را بزند، هنگام انتقال به بانک ذخیره هم‌تیمی، <strong>به یک پیاده معمولی تبدیل می‌شود</strong> تا از تجمع وزیرها جلوگیری شود.</p>
      <h4>۴. مهره‌گذاری (Drop Move)</h4>
      <p>در هر نوبت، شما می‌توانید به جای حرکت دادن مهره‌های روی صفحه، یکی از مهره‌های موجود در بانک ذخیره‌تان را در <strong>هر خانه خالی دلخواه</strong> قرار دهید. این عمل یک حرکت کامل محسوب می‌شود.<br>
      • پیاده‌ها را نمی‌توان در ردیف ۱ یا ردیف ۸ وارد کرد (تنها در ردیف‌های ۲ تا ۷ مجاز است).<br>
      • مهره‌های واردشده می‌توانند کیش بدهند، راه کیش را سد کنند، یا حتی کیش‌مات ایجاد کنند!</p>
      <h4>۵. پایان همزمان بازی (Dual Clock & Checkmate)</h4>
      <p>مسابقه بلافاصله پس از <strong>کیش‌مات یا اتمام زمان (افتادن پرچم ساعت) روی هر یک از دو تخته</strong> به پایان می‌رسد و تیمی که زودتر حریفش را مات کند یا زمان حریفش تمام شود، برنده کل مسابقه خواهد بود.</p>
    `,
    en: `
      <h4>1. Teams & Structure</h4>
      <p>Bughouse is played with 4 players on 2 adjacent chessboards divided into two teams of two:</p>
      <p>• <strong>Team 1:</strong> Board 1 White (You) + Board 2 Black (Your Teammate)<br>
         • <strong>Team 2:</strong> Board 1 Black + Board 2 White (Opponents)</p>
      <h4>2. Piece Passing & Reserves</h4>
      <p>Whenever you capture an opponent's piece, that piece is immediately passed to your partner's reserve in your partner's piece color! Your partner can then deploy it onto their board.</p>
      <h4>3. Pawn Promotion Reversion Rule</h4>
      <p>According to official Chess.com Bughouse rules, when a promoted piece is captured, it reverts to a <strong>standard Pawn</strong> when transferred to the partner's reserve bank.</p>
      <h4>4. Drop Moves (Placement)</h4>
      <p>On your turn, instead of moving a piece already on the board, you may "drop" any piece from your reserve onto any vacant square.<br>
      • Pawns may NOT be dropped on the 1st or 8th ranks (ranks 2-7 only).<br>
      • Drops can block checks, give checks, or deliver checkmates!</p>
      <h4>5. Simultaneous Game End & Blitz Clocks</h4>
      <p>Both boards play in real time with synchronized blitz clocks. A checkmate, resignation, or clock timeout on <strong>EITHER</strong> board immediately ends the entire match with a victory for that team!</p>
    `
  };

  // 2. Global State Variables
  let currentLang = localStorage.getItem('rubik_card_lang') || 'fa';
  let soundEnabled = localStorage.getItem('rubik_card_sound') !== 'false';
  let playerName = localStorage.getItem('rubik_player_name') || (currentLang === 'fa' ? 'بازیکن' : 'Player');

  let gameState = null;
  let gameMode = 'ai'; // 'ai' | 'online'
  let aiDifficulty = 'medium';
  let timeControlSeconds = 180; // 3 min

  // Clock timers
  let clocks = {
    A_w: 180,
    A_b: 180,
    B_w: 180,
    B_b: 180
  };
  let clockInterval = null;
  let lastClockTick = null;

  // Selected state
  let selectedSquare = null; // { boardId: 'boardA'|'boardB', sq: 0..63 }
  let selectedDropPiece = null; // { boardId: 'boardA'|'boardB', piece: 'P' }

  // Online WebSocket
  let ws = null;
  let roomCode = null;
  let mySeatIdx = 0; // 0: A_w, 1: A_b, 2: B_w, 3: B_b
  let lobbySeats = [];

  // DOM Elements Cache
  const el = {};

  function cacheDom() {
    el.brandTitle = document.getElementById('txt-brand-title');
    el.matchStatusBadge = document.getElementById('match-status-badge');
    el.txtMatchStatus = document.getElementById('txt-match-status');
    el.btnSound = document.getElementById('btn-sound');
    el.btnLang = document.getElementById('btn-lang');
    el.btnMenu = document.getElementById('btn-menu');
    el.txtMenuBtn = document.getElementById('txt-menu-btn');

    el.calloutToast = document.getElementById('callout-toast');
    el.calloutToastIcon = document.getElementById('callout-toast-icon');
    el.calloutToastText = document.getElementById('callout-toast-text');

    // Board containers
    el.containerBoardA = document.getElementById('container-board-a');
    el.containerBoardB = document.getElementById('container-board-b');
    el.boardAGrid = document.getElementById('board-a-grid');
    el.boardBGrid = document.getElementById('board-b-grid');

    // Clocks
    el.clockTopA = document.getElementById('clock-top-a');
    el.clockBottomA = document.getElementById('clock-bottom-a');
    el.clockTopB = document.getElementById('clock-top-b');
    el.clockBottomB = document.getElementById('clock-bottom-b');

    // Names
    el.nameTopA = document.getElementById('name-top-a');
    el.nameBottomA = document.getElementById('name-bottom-a');
    el.nameTopB = document.getElementById('name-top-b');
    el.nameBottomB = document.getElementById('name-bottom-b');

    // Reserves
    el.resItemsTopA = document.getElementById('reserve-items-top-a');
    el.resItemsBottomA = document.getElementById('reserve-items-bottom-a');
    el.resItemsTopB = document.getElementById('reserve-items-top-b');
    el.resItemsBottomB = document.getElementById('reserve-items-bottom-b');

    // Modals
    el.modalMainMenu = document.getElementById('modal-main-menu');
    el.modalAiSettings = document.getElementById('modal-ai-settings');
    el.modalOnlineLobby = document.getElementById('modal-online-lobby');
    el.modalRules = document.getElementById('modal-rules');
    el.modalGameOver = document.getElementById('modal-game-over');

    el.btnCloseMenu = document.getElementById('btn-close-menu');
    el.btnCloseAi = document.getElementById('btn-close-ai-settings');
    el.btnCloseLobby = document.getElementById('btn-close-lobby');
    el.btnCloseRules = document.getElementById('btn-close-rules');

    el.btnModeAi = document.getElementById('btn-mode-ai');
    el.btnModeOnline = document.getElementById('btn-mode-online');
    el.btnModeRules = document.getElementById('btn-mode-rules');

    el.selectAiDiff = document.getElementById('select-ai-difficulty');
    el.selectTimeControl = document.getElementById('select-time-control');
    el.btnStartAiMatch = document.getElementById('btn-start-ai-match');

    el.lblRoomCode = document.getElementById('lbl-room-code');
    el.btnCopyLink = document.getElementById('btn-copy-room-link');
    el.btnFillBots = document.getElementById('btn-fill-bots');
    el.btnStartOnline = document.getElementById('btn-start-online-match');
    el.lobbySeatsGrid = document.getElementById('lobby-seats-grid');

    el.rulesContent = document.getElementById('rules-content');
    el.gameOverIcon = document.getElementById('game-over-icon');
    el.gameOverTitle = document.getElementById('game-over-title');
    el.gameOverReason = document.getElementById('game-over-reason');
    el.btnRematch = document.getElementById('btn-rematch');
    el.btnReturnMenu = document.getElementById('btn-return-menu');
  }

  // 3. Language & Localization Setup
  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('rubik_card_lang', lang);
    const t = I18N[lang];

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.body.className = lang === 'fa' ? 'rtl' : 'ltr';

    if (el.brandTitle) el.brandTitle.textContent = t.brandTitle;
    if (el.txtMenuBtn) el.txtMenuBtn.textContent = t.menu;
    if (el.btnLang) el.btnLang.textContent = lang === 'fa' ? '🌐 EN' : '🌐 فا';

    // Callout labels
    const txtCalloutLabel = document.getElementById('txt-callout-label');
    if (txtCalloutLabel) txtCalloutLabel.textContent = t.calloutLabel;
    const txtCalloutN = document.getElementById('txt-callout-n');
    if (txtCalloutN) txtCalloutN.textContent = t.needKnight;
    const txtCalloutP = document.getElementById('txt-callout-p');
    if (txtCalloutP) txtCalloutP.textContent = t.needPawn;
    const txtCalloutQ = document.getElementById('txt-callout-q');
    if (txtCalloutQ) txtCalloutQ.textContent = t.needQueen;
    const txtCalloutWarn = document.getElementById('txt-callout-warn');
    if (txtCalloutWarn) txtCalloutWarn.textContent = t.watchMate;
    const txtCalloutWait = document.getElementById('txt-callout-wait');
    if (txtCalloutWait) txtCalloutWait.textContent = t.waitStall;
    const txtCalloutCheer = document.getElementById('txt-callout-cheer');
    if (txtCalloutCheer) txtCalloutCheer.textContent = t.goodJob;

    // Board headers
    const txtBoardATitle = document.getElementById('txt-board-a-title');
    if (txtBoardATitle) txtBoardATitle.textContent = t.boardA;
    const txtBoardBTitle = document.getElementById('txt-board-b-title');
    if (txtBoardBTitle) txtBoardBTitle.textContent = t.boardB;

    const badgeTopA = document.getElementById('badge-top-a');
    if (badgeTopA) badgeTopA.textContent = t.team2;
    const badgeBotA = document.getElementById('badge-bot-a');
    if (badgeBotA) badgeBotA.textContent = t.team1;
    const badgeTopB = document.getElementById('badge-top-b');
    if (badgeTopB) badgeTopB.textContent = t.team2;
    const badgeBotB = document.getElementById('badge-bot-b');
    if (badgeBotB) badgeBotB.textContent = t.team1Partner;

    // Reserve labels
    const resLblTopA = document.getElementById('txt-res-label-top-a');
    if (resLblTopA) resLblTopA.textContent = t.reserveEnemy;
    const resLblBotA = document.getElementById('txt-res-label-bot-a');
    if (resLblBotA) resLblBotA.textContent = t.reserveYou;
    const resLblTopB = document.getElementById('txt-res-label-top-b');
    if (resLblTopB) resLblTopB.textContent = t.reserveEnemy;
    const resLblBotB = document.getElementById('txt-res-label-bot-b');
    if (resLblBotB) resLblBotB.textContent = t.reservePartner;

    // Menu texts
    const menuTitle = document.getElementById('txt-menu-title');
    if (menuTitle) menuTitle.textContent = t.menuTitle;
    const txtBtnAiTitle = document.getElementById('txt-btn-ai-title');
    if (txtBtnAiTitle) txtBtnAiTitle.textContent = t.btnAiTitle;
    const txtBtnAiDesc = document.getElementById('txt-btn-ai-desc');
    if (txtBtnAiDesc) txtBtnAiDesc.textContent = t.btnAiDesc;
    const txtBtnOnlineTitle = document.getElementById('txt-btn-online-title');
    if (txtBtnOnlineTitle) txtBtnOnlineTitle.textContent = t.btnOnlineTitle;
    const txtBtnOnlineDesc = document.getElementById('txt-btn-online-desc');
    if (txtBtnOnlineDesc) txtBtnOnlineDesc.textContent = t.btnOnlineDesc;
    const txtBtnRulesTitle = document.getElementById('txt-btn-rules-title');
    if (txtBtnRulesTitle) txtBtnRulesTitle.textContent = t.btnRulesTitle;
    const txtBtnRulesDesc = document.getElementById('txt-btn-rules-desc');
    if (txtBtnRulesDesc) txtBtnRulesDesc.textContent = t.btnRulesDesc;
    const txtBtnHubTitle = document.getElementById('txt-btn-hub-title');
    if (txtBtnHubTitle) txtBtnHubTitle.textContent = t.btnHubTitle;
    const txtBtnHubDesc = document.getElementById('txt-btn-hub-desc');
    if (txtBtnHubDesc) txtBtnHubDesc.textContent = t.btnHubDesc;

    // AI modal
    const txtAiTitle = document.getElementById('txt-ai-title');
    if (txtAiTitle) txtAiTitle.textContent = t.aiSettingsTitle;
    const txtLabelAiDiff = document.getElementById('txt-label-ai-diff');
    if (txtLabelAiDiff) txtLabelAiDiff.textContent = t.aiDiffLabel;
    const optDiffEasy = document.getElementById('opt-diff-easy');
    if (optDiffEasy) optDiffEasy.textContent = t.diffEasy;
    const optDiffMed = document.getElementById('opt-diff-med');
    if (optDiffMed) optDiffMed.textContent = t.diffMed;
    const optDiffHard = document.getElementById('opt-diff-hard');
    if (optDiffHard) optDiffHard.textContent = t.diffHard;
    const txtLabelTime = document.getElementById('txt-label-time');
    if (txtLabelTime) txtLabelTime.textContent = t.timeLabel;
    const optTime3 = document.getElementById('opt-time-3');
    if (optTime3) optTime3.textContent = t.time3;
    const optTime5 = document.getElementById('opt-time-5');
    if (optTime5) optTime5.textContent = t.time5;
    const optTimeUn = document.getElementById('opt-time-unlimited');
    if (optTimeUn) optTimeUn.textContent = t.timeUnlimited;
    const txtBtnStart = document.getElementById('txt-btn-start-match');
    if (txtBtnStart) txtBtnStart.textContent = t.startMatch;

    // Lobby texts
    const txtLobbyTitle = document.getElementById('txt-lobby-title');
    if (txtLobbyTitle) txtLobbyTitle.textContent = t.lobbyTitle;
    const txtRoomCodeLabel = document.getElementById('txt-room-code-label');
    if (txtRoomCodeLabel) txtRoomCodeLabel.textContent = t.roomCodeLabel;
    const txtCopyLink = document.getElementById('txt-copy-link');
    if (txtCopyLink) txtCopyLink.textContent = t.copyLink;
    const txtFillBots = document.getElementById('txt-fill-bots');
    if (txtFillBots) txtFillBots.textContent = t.fillBots;
    const txtStartOnline = document.getElementById('txt-start-online');
    if (txtStartOnline) txtStartOnline.textContent = t.startOnline;

    // Rules modal
    const txtRulesModalTitle = document.getElementById('txt-rules-modal-title');
    if (txtRulesModalTitle) txtRulesModalTitle.textContent = t.rulesModalTitle;
    if (el.rulesContent) el.rulesContent.innerHTML = RULES_CONTENT[lang];

    // Game over texts
    const txtBtnRematch = document.getElementById('txt-btn-rematch');
    if (txtBtnRematch) txtBtnRematch.textContent = t.btnRematch;
    const txtBtnBackMenu = document.getElementById('txt-btn-back-menu');
    if (txtBtnBackMenu) txtBtnBackMenu.textContent = t.btnBackMenu;

    updateMatchStatusBadge();
  }

  function toggleLanguage() {
    const next = currentLang === 'fa' ? 'en' : 'fa';
    if (window.BughouseSound) window.BughouseSound.playMove();
    applyLanguage(next);
  }

  function toggleSound() {
    if (window.BughouseSound) {
      soundEnabled = !window.BughouseSound.toggleMute();
    } else {
      soundEnabled = !soundEnabled;
    }
    el.btnSound.textContent = soundEnabled ? '🔊' : '🔇';
  }

  // 4. Initial Game State & Clocks Setup
  function initGame(mode = 'ai') {
    gameMode = mode;
    gameState = BughouseLogic.createInitialState();
    selectedSquare = null;
    selectedDropPiece = null;

    clocks = {
      A_w: timeControlSeconds,
      A_b: timeControlSeconds,
      B_w: timeControlSeconds,
      B_b: timeControlSeconds
    };

    if (clockInterval) clearInterval(clockInterval);
    lastClockTick = Date.now();

    if (timeControlSeconds > 0) {
      clockInterval = setInterval(updateClocks, 200);
    }

    // Configure names based on mode
    if (mode === 'ai') {
      el.nameBottomA.textContent = `${playerName} (You)`;
      el.nameTopA.textContent = 'Bot A (Opponent)';
      el.nameTopB.textContent = 'Bot B (Opponent)';
      el.nameBottomB.textContent = 'Bot Partner (Teammate)';
    }

    renderAll();
    closeAllModals();

    if (window.BughouseSound) window.BughouseSound.playMove();
  }

  function updateClocks() {
    if (!gameState || gameState.status !== 'PLAYING' || timeControlSeconds === 0) return;

    const now = Date.now();
    const delta = (now - lastClockTick) / 1000;
    lastClockTick = now;

    // Clock runs on Board A for active turn player
    const activeColorA = gameState.boardA.turn;
    const clockKeyA = 'A_' + activeColorA;
    clocks[clockKeyA] = Math.max(0, clocks[clockKeyA] - delta);

    // Clock runs on Board B for active turn player
    const activeColorB = gameState.boardB.turn;
    const clockKeyB = 'B_' + activeColorB;
    clocks[clockKeyB] = Math.max(0, clocks[clockKeyB] - delta);

    // Check timeout
    if (clocks[clockKeyA] <= 0) {
      BughouseLogic.handleTimeout(gameState, 'boardA', activeColorA);
      handleGameEnd();
    } else if (clocks[clockKeyB] <= 0) {
      BughouseLogic.handleTimeout(gameState, 'boardB', activeColorB);
      handleGameEnd();
    }

    renderClocks();
  }

  function formatTime(sec) {
    if (timeControlSeconds === 0) return '∞';
    const s = Math.ceil(sec);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  }

  function renderClocks() {
    if (!el.clockBottomA) return;

    el.clockBottomA.textContent = formatTime(clocks.A_w);
    el.clockTopA.textContent = formatTime(clocks.A_b);
    el.clockTopB.textContent = formatTime(clocks.B_w);
    el.clockBottomB.textContent = formatTime(clocks.B_b);

    const isAwTurn = gameState.boardA.turn === 'w';
    const isAbTurn = gameState.boardA.turn === 'b';
    const isBwTurn = gameState.boardB.turn === 'w';
    const isBbTurn = gameState.boardB.turn === 'b';

    el.clockBottomA.className = 'player-clock' + (isAwTurn ? ' clock-running' : '') + (clocks.A_w < 30 && timeControlSeconds > 0 ? ' clock-low' : '');
    el.clockTopA.className = 'player-clock' + (isAbTurn ? ' clock-running' : '') + (clocks.A_b < 30 && timeControlSeconds > 0 ? ' clock-low' : '');
    el.clockTopB.className = 'player-clock' + (isBwTurn ? ' clock-running' : '') + (clocks.B_w < 30 && timeControlSeconds > 0 ? ' clock-low' : '');
    el.clockBottomB.className = 'player-clock' + (isBbTurn ? ' clock-running' : '') + (clocks.B_b < 30 && timeControlSeconds > 0 ? ' clock-low' : '');
  }

  // 5. Board Rendering & Interaction
  function renderAll() {
    renderBoard('boardA', el.boardAGrid);
    renderBoard('boardB', el.boardBGrid);
    renderReserves();
    renderClocks();
    updateMatchStatusBadge();
  }

  function renderBoard(boardId, gridEl) {
    if (!gridEl || !gameState) return;
    gridEl.innerHTML = '';

    const subState = gameState[boardId];
    const board = subState.board;
    const isTurn = (boardId === 'boardA' && subState.turn === 'w') || (boardId === 'boardB' && subState.turn === 'b');
    const inCheck = BughouseLogic.isInCheck(board, subState.turn);
    const kingSq = inCheck ? BughouseLogic.findKing(board, subState.turn) : -1;

    // Get legal targets for currently selected piece or drop piece
    let legalMoveTargets = [];
    let isDropMode = selectedDropPiece && selectedDropPiece.boardId === boardId;

    if (isDropMode) {
      const allDrops = BughouseLogic.getLegalDropMoves(gameState, boardId);
      const pieceDrops = allDrops.filter(d => d.piece === selectedDropPiece.piece);
      legalMoveTargets = pieceDrops.map(d => d.to);
    } else if (selectedSquare && selectedSquare.boardId === boardId) {
      const moves = BughouseLogic.getLegalRegularMoves(subState, selectedSquare.sq);
      legalMoveTargets = moves.map(m => m.to);
    }

    // Last move squares
    const lastMove = subState.history.length > 0 ? subState.history[subState.history.length - 1].move : null;

    for (let sq = 0; sq < 64; sq++) {
      const row = Math.floor(sq / 8);
      const col = sq % 8;
      const isLight = (row + col) % 2 === 0;

      const squareEl = document.createElement('div');
      squareEl.className = `square ${isLight ? 'light' : 'dark'}`;
      squareEl.dataset.sq = sq;
      squareEl.dataset.board = boardId;

      // Coordinate labels inside edge squares
      if (col === 0) {
        const rankEl = document.createElement('span');
        rankEl.className = 'coord-rank';
        rankEl.textContent = 8 - row;
        squareEl.appendChild(rankEl);
      }
      if (row === 7) {
        const fileEl = document.createElement('span');
        fileEl.className = 'coord-file';
        fileEl.textContent = String.fromCharCode(97 + col);
        squareEl.appendChild(fileEl);
      }

      // Highlighting
      if (selectedSquare && selectedSquare.boardId === boardId && selectedSquare.sq === sq) {
        squareEl.classList.add('selected');
      }
      if (lastMove && (lastMove.from === sq || lastMove.to === sq)) {
        squareEl.classList.add('last-move');
      }
      if (sq === kingSq) {
        squareEl.classList.add('in-check');
      }

      // Valid move marker
      if (legalMoveTargets.includes(sq)) {
        if (isDropMode) {
          const dropMarker = document.createElement('div');
          dropMarker.className = 'valid-drop-target';
          squareEl.appendChild(dropMarker);
        } else {
          const targetPiece = board[sq];
          if (targetPiece) {
            const capMarker = document.createElement('div');
            capMarker.className = 'valid-capture';
            squareEl.appendChild(capMarker);
          } else {
            const dotMarker = document.createElement('div');
            dotMarker.className = 'valid-dot';
            squareEl.appendChild(dotMarker);
          }
        }
      }

      // Chess Piece
      const piece = board[sq];
      if (piece) {
        const pieceEl = document.createElement('span');
        pieceEl.className = `piece ${BughouseLogic.WHITE === BughouseLogic.WHITE && piece === piece.toUpperCase() ? 'white-piece' : 'black-piece'}`;
        pieceEl.textContent = BughouseLogic.PIECE_SYMBOLS[piece] || piece;
        squareEl.appendChild(pieceEl);
      }

      squareEl.addEventListener('click', () => handleSquareClick(boardId, sq));
      gridEl.appendChild(squareEl);
    }
  }

  function handleSquareClick(boardId, sq) {
    if (!gameState || gameState.status !== 'PLAYING') return;

    // Check if player is allowed to move on this board in current mode
    if (gameMode === 'ai') {
      if (boardId !== 'boardA' || gameState.boardA.turn !== 'w') {
        return; // Only human can click Board A White in AI mode
      }
    } else if (gameMode === 'online') {
      const activeColor = gameState[boardId].turn;
      const isMyTurn = (mySeatIdx === 0 && boardId === 'boardA' && activeColor === 'w') ||
                       (mySeatIdx === 1 && boardId === 'boardA' && activeColor === 'b') ||
                       (mySeatIdx === 2 && boardId === 'boardB' && activeColor === 'w') ||
                       (mySeatIdx === 3 && boardId === 'boardB' && activeColor === 'b');
      if (!isMyTurn) return;
    }

    const subState = gameState[boardId];
    const piece = subState.board[sq];

    // 1. DROP MOVE EXECUTION
    if (selectedDropPiece && selectedDropPiece.boardId === boardId) {
      const legalDrops = BughouseLogic.getLegalDropMoves(gameState, boardId);
      const matchingDrop = legalDrops.find(d => d.piece === selectedDropPiece.piece && d.to === sq);

      if (matchingDrop) {
        executeBughouseAction(boardId, matchingDrop);
        selectedDropPiece = null;
        selectedSquare = null;
        return;
      } else {
        // Deselect or click another
        selectedDropPiece = null;
        renderAll();
        return;
      }
    }

    // 2. REGULAR MOVE EXECUTION
    if (selectedSquare && selectedSquare.boardId === boardId) {
      // Trying to move selected piece to sq
      const legalMoves = BughouseLogic.getLegalRegularMoves(subState, selectedSquare.sq);
      const targetMove = legalMoves.find(m => m.to === sq);

      if (targetMove) {
        executeBughouseAction(boardId, targetMove);
        selectedSquare = null;
        selectedDropPiece = null;
        return;
      }

      // If clicked another piece of same color, select it instead
      if (piece && (piece === piece.toUpperCase() ? 'w' : 'b') === subState.turn) {
        selectedSquare = { boardId, sq };
        renderAll();
        return;
      }

      // Cancel selection
      selectedSquare = null;
      renderAll();
      return;
    }

    // 3. PIECE SELECTION
    if (piece && (piece === piece.toUpperCase() ? 'w' : 'b') === subState.turn) {
      selectedSquare = { boardId, sq };
      selectedDropPiece = null;
      renderAll();
    }
  }

  // 6. Action Execution (Regular Move or Drop)
  function executeBughouseAction(boardId, move) {
    if (!gameState) return;

    // Check if capture occurred for flying piece visual
    let capturedPiece = null;
    if (move.captured) {
      capturedPiece = move.captured;
    }

    const success = BughouseLogic.makeBughouseMove(gameState, boardId, move);
    if (!success) return;

    // Procedural sound
    if (window.BughouseSound) {
      if (move.isDrop) {
        window.BughouseSound.playDrop();
      } else if (capturedPiece) {
        window.BughouseSound.playCapture();
        setTimeout(() => window.BughouseSound.playTransfer(), 80);
      } else {
        window.BughouseSound.playMove();
      }

      if (BughouseLogic.isInCheck(gameState[boardId].board, gameState[boardId].turn)) {
        setTimeout(() => window.BughouseSound.playCheck(), 120);
      }
    }

    // Animate piece transfer across boards
    if (capturedPiece) {
      const fromBoardEl = boardId === 'boardA' ? el.containerBoardA : el.containerBoardB;
      const toBoardEl = boardId === 'boardA' ? el.containerBoardB : el.containerBoardA;
      triggerFlyingPiece(fromBoardEl, toBoardEl, capturedPiece);
    }

    renderAll();

    // Check for game end
    if (gameState.status === 'FINISHED') {
      handleGameEnd();
      return;
    }

    // If online match, send action to server
    if (gameMode === 'online' && ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: move.isDrop ? 'BUGHOUSE_DROP' : 'BUGHOUSE_MOVE',
        boardId,
        move
      }));
    }

    // If AI match, trigger bot actions
    if (gameMode === 'ai') {
      triggerBotLoop();
    }
  }

  // 7. Flying Transfer Piece Animation
  function triggerFlyingPiece(fromContainer, toContainer, piece) {
    if (!fromContainer || !toContainer) return;

    const fromRect = fromContainer.getBoundingClientRect();
    const toRect = toContainer.getBoundingClientRect();

    const flyEl = document.createElement('div');
    flyEl.className = 'flying-transfer-piece';
    flyEl.textContent = BughouseLogic.PIECE_SYMBOLS[piece] || piece;
    flyEl.style.left = `${fromRect.left + fromRect.width / 2}px`;
    flyEl.style.top = `${fromRect.top + fromRect.height / 2}px`;

    document.body.appendChild(flyEl);

    // Trigger transition
    requestAnimationFrame(() => {
      flyEl.style.left = `${toRect.left + toRect.width / 2}px`;
      flyEl.style.top = `${toRect.top + toRect.height / 2}px`;
      flyEl.style.transform = 'scale(1.4) rotate(20deg)';
      flyEl.style.opacity = '0';
    });

    setTimeout(() => {
      if (flyEl.parentNode) flyEl.parentNode.removeChild(flyEl);
    }, 600);
  }

  // 8. Reserve Rack Rendering & Drop Selection
  function renderReserves() {
    renderReserveRack(el.resItemsBottomA, 'boardA', 'w', true);
    renderReserveRack(el.resItemsTopA, 'boardA', 'b', false);
    renderReserveRack(el.resItemsTopB, 'boardB', 'w', false);
    renderReserveRack(el.resItemsBottomB, 'boardB', 'b', false);
  }

  function renderReserveRack(container, boardId, color, isInteractive) {
    if (!container || !gameState) return;
    container.innerHTML = '';

    const reserveKey = (boardId === 'boardA' ? 'A_' : 'B_') + color;
    const pieces = gameState.reserves[reserveKey] || [];

    // Count piece frequencies
    const counts = {};
    for (const p of pieces) {
      counts[p] = (counts[p] || 0) + 1;
    }

    const order = color === 'w' ? ['Q', 'R', 'B', 'N', 'P'] : ['q', 'r', 'b', 'n', 'p'];

    for (const p of order) {
      const count = counts[p] || 0;
      if (count === 0 && !isInteractive) continue;

      const slotEl = document.createElement('div');
      slotEl.className = 'reserve-slot';
      if (count === 0) {
        slotEl.style.opacity = '0.35';
        slotEl.style.pointerEvents = 'none';
      }

      if (selectedDropPiece && selectedDropPiece.boardId === boardId && selectedDropPiece.piece === p) {
        slotEl.classList.add('selected-drop');
      }

      const pieceEl = document.createElement('span');
      pieceEl.className = `reserve-piece ${color === 'w' ? 'white-piece' : 'black-piece'}`;
      pieceEl.textContent = BughouseLogic.PIECE_SYMBOLS[p] || p;
      slotEl.appendChild(pieceEl);

      if (count > 0) {
        const countBadge = document.createElement('span');
        countBadge.className = 'reserve-count';
        countBadge.textContent = count;
        slotEl.appendChild(countBadge);
      }

      if (isInteractive && count > 0) {
        slotEl.addEventListener('click', (e) => {
          e.stopPropagation();
          handleReserveClick(boardId, p);
        });
      }

      container.appendChild(slotEl);
    }
  }

  function handleReserveClick(boardId, piece) {
    if (!gameState || gameState.status !== 'PLAYING') return;

    // Check if player's turn on this board
    const color = piece === piece.toUpperCase() ? 'w' : 'b';
    if (gameState[boardId].turn !== color) return;

    if (selectedDropPiece && selectedDropPiece.piece === piece) {
      selectedDropPiece = null;
    } else {
      selectedDropPiece = { boardId, piece };
      selectedSquare = null;
    }

    renderAll();
  }

  // 9. Match Status & Game End
  function updateMatchStatusBadge() {
    if (!el.txtMatchStatus || !gameState) return;
    const t = I18N[currentLang];

    if (gameState.status !== 'PLAYING') {
      el.txtMatchStatus.textContent = gameState.winnerTeam ? (gameState.winnerTeam === 1 ? t.victoryTeam1 : t.victoryTeam2) : t.stalemateReason;
      return;
    }

    const aTurn = gameState.boardA.turn === 'w' ? 'White' : 'Black';
    const bTurn = gameState.boardB.turn === 'w' ? 'White' : 'Black';
    el.txtMatchStatus.textContent = `A: ${aTurn} | B: ${bTurn}`;
  }

  function handleGameEnd() {
    if (!gameState || !el.modalGameOver) return;
    const t = I18N[currentLang];

    if (clockInterval) clearInterval(clockInterval);

    const winner = gameState.winnerTeam;
    if (winner === 1) {
      el.gameOverIcon.textContent = '🏆';
      el.gameOverTitle.textContent = t.victoryTeam1;
      if (window.BughouseSound) window.BughouseSound.playVictory();
    } else if (winner === 2) {
      el.gameOverIcon.textContent = '💀';
      el.gameOverTitle.textContent = t.victoryTeam2;
      if (window.BughouseSound) window.BughouseSound.playDefeat();
    } else {
      el.gameOverIcon.textContent = '🤝';
      el.gameOverTitle.textContent = t.stalemateReason;
    }

    let reasonText = '';
    if (gameState.winReason === 'checkmate') {
      reasonText = gameState.winningBoard === 'boardA' ? t.mateReasonA : t.mateReasonB;
    } else if (gameState.winReason === 'timeout') {
      reasonText = t.timeoutReason;
    } else if (gameState.winReason === 'resignation') {
      reasonText = t.resignReason;
    }
    el.gameOverReason.textContent = reasonText;

    el.modalGameOver.classList.add('active');
  }

  // 10. AI Bot Orchestrator
  let botLoopTimeout = null;

  function triggerBotLoop() {
    if (gameMode !== 'ai' || !gameState || gameState.status !== 'PLAYING') return;

    if (botLoopTimeout) clearTimeout(botLoopTimeout);

    botLoopTimeout = setTimeout(() => {
      // Check Board A Black (Bot Opponent)
      if (gameState.boardA.turn === 'b') {
        const move = BughouseLogic.getBestBughouseMove(gameState, 'boardA', aiDifficulty);
        if (move) {
          executeBughouseAction('boardA', move);
          return;
        }
      }

      // Check Board B White (Bot Opponent)
      if (gameState.boardB.turn === 'w') {
        const move = BughouseLogic.getBestBughouseMove(gameState, 'boardB', aiDifficulty);
        if (move) {
          executeBughouseAction('boardB', move);
          return;
        }
      }

      // Check Board B Black (Bot Partner!)
      if (gameState.boardB.turn === 'b') {
        const move = BughouseLogic.getBestBughouseMove(gameState, 'boardB', aiDifficulty);
        if (move) {
          executeBughouseAction('boardB', move);

          // Occasionally trigger teammate partner callout!
          if (Math.random() < 0.25) {
            triggerBotCallout();
          }
          return;
        }
      }
    }, 450 + Math.random() * 400);
  }

  function triggerBotCallout() {
    const t = I18N[currentLang];
    const callouts = [
      { text: t.needKnight, icon: '🐴' },
      { text: t.needPawn, icon: '♟️' },
      { text: t.goodJob, icon: '👏' },
      { text: t.watchMate, icon: '⚠️' }
    ];
    const pick = callouts[Math.floor(Math.random() * callouts.length)];
    showCalloutToast(currentLang === 'fa' ? `هم‌تیمی شما: ${pick.text}` : `Bot Partner: ${pick.text}`, pick.icon);
  }

  function showCalloutToast(text, icon = '📢') {
    if (!el.calloutToast) return;
    el.calloutToastText.textContent = text;
    el.calloutToastIcon.textContent = icon;
    el.calloutToast.classList.add('active');

    if (window.BughouseSound) window.BughouseSound.playCallout();

    setTimeout(() => {
      el.calloutToast.classList.remove('active');
    }, 2800);
  }

  // 11. Teammate Callout Strip Handler
  function handleCalloutClick(e) {
    const btn = e.target.closest('[data-callout]');
    if (!btn) return;

    const calloutKey = btn.dataset.callout;
    const t = I18N[currentLang];
    let msg = '';
    let icon = '📢';

    if (calloutKey === 'need_knight') { msg = t.needKnight; icon = '🐴'; }
    else if (calloutKey === 'need_pawn') { msg = t.needPawn; icon = '♟️'; }
    else if (calloutKey === 'need_queen') { msg = t.needQueen; icon = '👑'; }
    else if (calloutKey === 'watch_mate') { msg = t.watchMate; icon = '⚠️'; }
    else if (calloutKey === 'wait_stall') { msg = t.waitStall; icon = '⏳'; }
    else if (calloutKey === 'good_job') { msg = t.goodJob; icon = '👏'; }

    showCalloutToast(`${playerName}: ${msg}`, icon);

    if (gameMode === 'online' && ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'BUGHOUSE_CALLOUT',
        text: msg,
        icon
      }));
    }
  }

  // 12. Modal Handlers
  function openModal(modalEl) {
    if (modalEl) modalEl.classList.add('active');
  }

  function closeModal(modalEl) {
    if (modalEl) modalEl.classList.remove('active');
  }

  function closeAllModals() {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(m => m.classList.remove('active'));
  }

  // 13. Online Multiplayer Connection
  function startOnlineMultiplayer() {
    closeAllModals();
    openModal(el.modalOnlineLobby);

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      // Check if hash contains room code
      const hash = (window.location.hash || '').replace('#', '').trim().toUpperCase();
      if (hash && hash.length === 4) {
        ws.send(JSON.stringify({
          type: 'JOIN_ROOM',
          roomCode: hash,
          playerName
        }));
      } else {
        ws.send(JSON.stringify({
          type: 'CREATE_ROOM',
          gameType: 'bughouse-chess',
          playerName,
          settings: { timeControl: 180 }
        }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        handleWsMessage(msg);
      } catch (err) {}
    };

    ws.onclose = () => {};
  }

  function handleWsMessage(msg) {
    const t = I18N[currentLang];

    if (msg.type === 'ROOM_CREATED' || msg.type === 'ROOM_JOINED') {
      roomCode = msg.roomCode;
      mySeatIdx = msg.seat !== undefined ? msg.seat : 0;
      if (el.lblRoomCode) el.lblRoomCode.textContent = roomCode;
      window.location.hash = `#${roomCode}`;
    }

    if (msg.type === 'LOBBY_UPDATE') {
      lobbySeats = msg.seats || [];
      renderLobbySeats();
    }

    if (msg.type === 'GAME_START') {
      gameMode = 'online';
      gameState = msg.gameState || BughouseLogic.createInitialState();
      timeControlSeconds = msg.timeControl || 180;
      clocks = msg.clocks || { A_w: 180, A_b: 180, B_w: 180, B_b: 180 };

      // Seat mapping
      if (lobbySeats[0]) el.nameBottomA.textContent = lobbySeats[0].name;
      if (lobbySeats[1]) el.nameTopA.textContent = lobbySeats[1].name;
      if (lobbySeats[2]) el.nameTopB.textContent = lobbySeats[2].name;
      if (lobbySeats[3]) el.nameBottomB.textContent = lobbySeats[3].name;

      closeAllModals();
      renderAll();
      if (timeControlSeconds > 0) {
        clockInterval = setInterval(updateClocks, 200);
      }
    }

    if (msg.type === 'BUGHOUSE_MOVE' || msg.type === 'BUGHOUSE_DROP') {
      if (msg.boardId && msg.move) {
        BughouseLogic.makeBughouseMove(gameState, msg.boardId, msg.move);
        if (msg.clocks) clocks = msg.clocks;
        renderAll();

        if (window.BughouseSound) {
          if (msg.move.isDrop) window.BughouseSound.playDrop();
          else if (msg.move.captured) window.BughouseSound.playCapture();
          else window.BughouseSound.playMove();
        }

        if (gameState.status === 'FINISHED') {
          handleGameEnd();
        }
      }
    }

    if (msg.type === 'BUGHOUSE_CALLOUT') {
      showCalloutToast(`${msg.sender || 'Partner'}: ${msg.text}`, msg.icon || '📢');
    }

    if (msg.type === 'GAME_OVER') {
      if (msg.gameState) gameState = msg.gameState;
      handleGameEnd();
    }
  }

  function renderLobbySeats() {
    if (!el.lobbySeatsGrid) return;
    el.lobbySeatsGrid.innerHTML = '';

    const seatLabels = [
      { title: 'تخته ۱ - سفید (Board A White)', team: 'team-1', teamTxt: 'تیم ۱' },
      { title: 'تخته ۱ - سیاه (Board A Black)', team: 'team-2', teamTxt: 'تیم ۲' },
      { title: 'تخته ۲ - سفید (Board B White)', team: 'team-2', teamTxt: 'تیم ۲' },
      { title: 'تخته ۲ - سیاه (Board B Black)', team: 'team-1', teamTxt: 'تیم ۱' }
    ];

    for (let i = 0; i < 4; i++) {
      const seat = lobbySeats[i] || { name: `صندلی ${i + 1}`, connected: false, isBot: false };
      const card = document.createElement('div');
      card.className = `lobby-seat-card ${seatLabels[i].team} ${i === mySeatIdx ? 'my-seat' : ''}`;

      card.innerHTML = `
        <div class="seat-header">
          <span>${seatLabels[i].title}</span>
          <span class="team-badge ${seatLabels[i].team}">${seatLabels[i].teamTxt}</span>
        </div>
        <div class="seat-player-name">${seat.name} ${i === mySeatIdx ? '(شما)' : ''}</div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
          <span class="seat-status-pill">${seat.isBot ? '🤖 ربات' : (seat.connected ? '● متصل' : '○ خالی')}</span>
        </div>
      `;

      el.lobbySeatsGrid.appendChild(card);
    }
  }

  // 14. Event Listeners Initialization
  function attachEvents() {
    if (el.btnSound) el.btnSound.addEventListener('click', toggleSound);
    if (el.btnLang) el.btnLang.addEventListener('click', toggleLanguage);
    if (el.btnMenu) el.btnMenu.addEventListener('click', () => openModal(el.modalMainMenu));

    if (el.btnCloseMenu) el.btnCloseMenu.addEventListener('click', () => closeModal(el.modalMainMenu));
    if (el.btnCloseAi) el.btnCloseAi.addEventListener('click', () => closeModal(el.modalAiSettings));
    if (el.btnCloseLobby) el.btnCloseLobby.addEventListener('click', () => closeModal(el.modalOnlineLobby));
    if (el.btnCloseRules) el.btnCloseRules.addEventListener('click', () => closeModal(el.modalRules));

    // Mode Buttons
    if (el.btnModeAi) {
      el.btnModeAi.addEventListener('click', () => {
        closeModal(el.modalMainMenu);
        openModal(el.modalAiSettings);
      });
    }

    if (el.btnStartAiMatch) {
      el.btnStartAiMatch.addEventListener('click', () => {
        aiDifficulty = el.selectAiDiff.value;
        timeControlSeconds = parseInt(el.selectTimeControl.value, 10);
        initGame('ai');
      });
    }

    if (el.btnModeOnline) {
      el.btnModeOnline.addEventListener('click', startOnlineMultiplayer);
    }

    if (el.btnModeRules) {
      el.btnModeRules.addEventListener('click', () => {
        openModal(el.modalRules);
      });
    }

    // Callout buttons
    const calloutStrip = document.getElementById('callout-strip');
    if (calloutStrip) calloutStrip.addEventListener('click', handleCalloutClick);

    // Online Lobby buttons
    if (el.btnCopyLink) {
      el.btnCopyLink.addEventListener('click', () => {
        const url = `${window.location.origin}/games/bughouse-chess/#${roomCode}`;
        navigator.clipboard.writeText(url).then(() => {
          showCalloutToast(I18N[currentLang].linkCopied, '📋');
        });
      });
    }

    if (el.btnFillBots) {
      el.btnFillBots.addEventListener('click', () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'FILL_BOTS' }));
        }
      });
    }

    if (el.btnStartOnline) {
      el.btnStartOnline.addEventListener('click', () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'START_GAME' }));
        }
      });
    }

    // Game Over Rematch
    if (el.btnRematch) {
      el.btnRematch.addEventListener('click', () => {
        initGame(gameMode);
      });
    }

    if (el.btnReturnMenu) {
      el.btnReturnMenu.addEventListener('click', () => {
        closeAllModals();
        openModal(el.modalMainMenu);
      });
    }
  }

  // 15. App Boot
  function boot() {
    cacheDom();
    applyLanguage(currentLang);
    if (el.btnSound) el.btnSound.textContent = soundEnabled ? '🔊' : '🔇';
    attachEvents();

    // Check URL hash for direct online join
    const hash = (window.location.hash || '').replace('#', '').trim().toUpperCase();
    if (hash && hash.length === 4) {
      startOnlineMultiplayer();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
