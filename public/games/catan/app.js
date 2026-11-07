/**
 * Catan (کاتان / مهاجران کاتان) - Client Application Controller
 * Pure Vanilla JavaScript with interactive SVG hex board, Web Audio synthesis,
 * smart strategic AI bots, and real-time WebSocket multiplayer.
 * Universal Settings: Language (rubik_card_lang), Sound (rubik_card_sound), Player Name (rubik_player_name).
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. BILINGUAL I18N DICTIONARY
  // =========================================================================
  const I18N = {
    fa: {
      gameTitle: 'مهاجران کاتان',
      menuHubTitle: 'هاب بازی‌ها',
      mainMenuTitle: 'بازی کاتان (Catan)',
      mainMenuSubtitle: 'بازی استراتژیک تجارت، ساخت‌وساز جاده و شهر و تصرف جزیره با هوش مصنوعی و اتاق‌های آنلاین',
      menuSoloTitle: 'بازی تک‌نفره با هوش مصنوعی',
      menuSoloDesc: 'رقابت آفلاین با ۲ یا ۳ ربات هوشمند با استراتژی توسعه و تجارت',
      menuPassPlayTitle: 'بازی دورهمی روی یک دستگاه (Pass & Play)',
      menuPassPlayDesc: 'رقابت ۲ تا ۴ نفره به نوبت دور یک گوشی یا کامپیوتر',
      menuOnlineTitle: 'چندنفره آنلاین و شبکه محلی',
      menuOnlineDesc: 'ساخت اتاق اختصاصی کاتان، دعوت دوستان و بازی همزمان',
      menuRulesTitle: 'آموزش و قوانین بازی کاتان',
      menuRulesDesc: 'قوانین تولید منابع، راهزن، بنادر تجاری، طولانی‌ترین جاده و ۱۰ امتیاز پیروزی',
      resumeGame: 'ادامه بازی جاری',
      setupTitle: '⚙️ تنظیمات شروع بازی کاتان',
      playerCountLabel: 'تعداد بازیکنان:',
      difficultyLabel: 'درجه هوش مصنوعی:',
      diffEasy: 'آسان',
      diffMed: 'متوسط',
      diffHard: 'سخت (استاد)',
      timerLabel: 'زمان هر نوبت:',
      timerOff: 'نامحدود',
      startGameBtn: 'شروع بازی',
      backBtn: 'بازگشت',
      multiplayerTitle: 'اتاق کاتان آنلاین / شبکه محلی',
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
      cancelBtn: 'انصراف',
      rollDiceBtn: 'پرتاب تاس',
      buildRoadBtn: 'جاده',
      buildSettlementBtn: 'روستا',
      buildCityBtn: 'شهر',
      buyDevBtn: 'کارت شانس',
      myDevsBtn: 'کارت‌های من',
      tradeBtn: 'تجارت',
      endTurnBtn: 'پایان نوبت',
      resLumber: 'چوب',
      resBrick: 'آجر',
      resWool: 'گوسفند',
      resGrain: 'گندم',
      resOre: 'سنگ',
      tradeModalTitle: '🔄 تجارت با بانک و بنادر',
      giveResourceLabel: 'منبعی که می‌دهید:',
      getResourceLabel: 'منبعی که دریافت می‌کنید:',
      confirmTradeBtn: 'انجام تبادل',
      myDevsTitle: '🃏 کارت‌های شانس شما',
      rulesTitle: '📜 قوانین و راهنمای بازی کاتان',
      chatTitle: '💬 پیام‌ها و چت بازی',
      soundLabel: 'صدا',
      multiplayerBtn: 'چندنفره آنلاین',
      rematchBtn: 'بازی مجدد',
      setupSettlement: 'نوبت: ساخت روستا',
      setupRoad: 'نوبت: ساخت جاده متصل به روستا',
      rollDicePhase: 'نوبت {name}: پرتاب تاس (Roll Dice)',
      turnActionPhase: 'نوبت {name}: ساخت، تجارت یا پایان نوبت',
      robberMovePrompt: 'تاس ۷ آمد! روی یک خانه کلیک کنید تا راهزن به آنجا برود.',
      robberStealPrompt: 'یک بازیکن مجاور را برای سرقت کارت منبع انتخاب کنید.',
      discardPrompt: 'تاس ۷ آمد! بازیکنان با بیش از ۷ کارت باید نصف کارت‌ها را بسوزانند.',
      roadHint: 'روی یکی از خطوط مجاز کلیک کنید تا جاده ساخته شود.',
      settlementHint: 'روی یکی از تقاطع‌های مجاز کلیک کنید تا روستا ساخته شود.',
      cityHint: 'روی یکی از روستاهای خود کلیک کنید تا به شهر ارتقا یابد.',
      notEnoughRes: 'منابع کافی برای این ساخت‌وساز را ندارید!',
      linkCopied: 'لینک دعوت به کلیپ‌بورد کپی شد!',
      nameSavedToast: 'نام شما به «{name}» ذخیره شد.',
      longestRoadBadge: '🚗 طولانی‌ترین جاده',
      largestArmyBadge: '⚔️ بزرگترین ارتش',
      soloSetupTitle: '🤖 تنظیمات بازی تک‌نفره با هوش مصنوعی',
      passplaySetupTitle: '👥 تنظیمات بازی دورهمی روی یک دستگاه',
      setupPlayers2: '۲ بازیکن (دوئل)',
      setupPlayers3: '۳ بازیکن (استاندارد)',
      setupPlayers4: '۴ بازیکن (کامل)',
      onlinePlayers2: '۲ بازیکن',
      onlinePlayers3: '۳ بازیکن',
      onlinePlayers4: '۴ بازیکن',
      timer45: '۴۵ ثانیه',
      timer60: '۶۰ ثانیه',
      timer90: '۹۰ ثانیه',
      tradeRateDefault: 'نرخ تبادل: ۴ به ۱ (با داشتن بندر: ۳ به ۱ یا ۲ به ۱)',
      discardModalTitle: '⚠️ پرتاب ۷ و سوزاندن کارت‌ها',
      discardModalDesc: 'به دلیل پرتاب عدد ۷ و داشتن بیش از ۷ کارت، باید نصف کارت‌های خود را انتخاب و بسوزانید.',
      confirmDiscardBtn: 'سوزاندن کارت‌های انتخاب‌شده',
      stealModalTitle: '🦹 سرقت منبع توسط راهزن',
      stealModalDesc: 'یکی از بازیکنان مجاور خانه راهزن را برای سرقت تصادفی یک کارت منبع انتخاب کنید:',
      gameOverTitle: '🎉 پایان بازی کاتان',
      gameOverSub: 'با کسب ۱۰ امتیاز پیروزی، فاتح جزیره کاتان شد.',
      chatSystemSender: 'سیستم',
      chatWelcomeMsg: 'به بازی استراتژیک کاتان خوش آمدید!',
      chatPlaceholder: 'پیام شما...',
      quickEndTurnText: '💡 منابع کافی برای ساخت ندارید. برای نوبت هوش مصنوعی کلیک کنید:',
      quickEndTurnBtnLabel: 'پایان نوبت (نوبت ربات‌ها)',
      soundTooltip: 'صدا (قطع/وصل)',
      langTooltip: 'تغییر زبان (EN/FA)',
      multiplayerTooltip: 'بازی چندنفره آنلاین',
      rulesTooltip: 'قوانین و راهنما',
      chatTooltip: 'پیام‌ها و چت',
      menuTooltip: 'منوی اصلی',
      mobileNavTooltip: 'منو',
      zoomInTooltip: 'بزرگ‌نمایی (+)',
      zoomResetTooltip: 'اندازه پیش‌فرض (۱۰۰٪)',
      zoomOutTooltip: 'کوچک‌نمایی (−)',
      diceLabel: 'تاس',
      rulesContent: `
        <h4>۱. هدف بازی</h4>
        <p>هدف کسب ۱۰ امتیاز پیروزی (VP) از طریق ساخت روستاها (هر کدام ۱ امتیاز)، ارتقای آنها به شهر (هر کدام ۲ امتیاز)، دستیابی به طولانی‌ترین جاده (۲ امتیاز)، بزرگترین ارتش (۲ امتیاز) و کارت‌های امتیاز توسعه است.</p>
        <h4>۲. چیدمان اولیه (Snake Draft)</h4>
        <p>در دور اول به ترتیب نوبت، هر بازیکن یک روستا و یک جاده متصل می‌سازد. در دور دوم، برعکس نوبت هر بازیکن دومین روستا و جاده متصل خود را می‌سازد. کارت‌های اولیه بازیکن از زمین‌های متصل به روستای دوم داده می‌شود.</p>
        <h4>۳. جریان هر نوبت</h4>
        <p>• <strong>پرتاب تاس (۲ تاس شش‌وجهی)</strong>: خانه‌ای که عدد آن آمده منابع تولید می‌کند و به هر روستای مجاور ۱ کارت و به هر شهر ۲ کارت منبع تعلق می‌گیرد.<br>
        • <strong>پرتاب عدد ۷ و راهزن</strong>: هیچ خانه‌ای منبع نمی‌دهد. هر بازیکنی با بیش از ۷ کارت باید نصف کارت‌هایش را بسوزاند. پرتاب‌کننده راهزن را جابجا کرده و از یکی از مالکان زمین جدید یک کارت تصادفی سرقت می‌کند.<br>
        • <strong>مرحله ساخت و تجارت</strong>: می‌توانید با بانک تبادل کنید (نرخ پایه ۴ به ۱، با داشتن بندر عمومی ۳ به ۱ و با بندر اختصاصی ۲ به ۱) و جاده، روستا، شهر یا کارت شانس بخرید.</p>
        <h4>۴. هزینه‌های ساخت</h4>
        <p>• <strong>جاده</strong>: ۱ چوب + ۱ آجر<br>
        • <strong>روستا</strong>: ۱ چوب + ۱ آجر + ۱ گوسفند + ۱ گندم (حداقل فاصله ۲ جاده از هر روستای دیگر)<br>
        • <strong>شهر</strong>: ۲ گندم + ۳ سنگ (ارتقای روستای موجود)<br>
        • <strong>کارت شانس</strong>: ۱ گوسفند + ۱ گندم + ۱ سنگ</p>
        <h4>۵. کارت‌های شانس و افتخارات</h4>
        <p>• <strong>شوالیه (Knight)</strong>: راهزن را جابجا کرده و سرقت می‌کند. اولین بازیکنی که ۳ شوالیه بازی کند کارت بزرگترین ارتش (+۲ امتیاز) را می‌گیرد.<br>
        • <strong>طولانی‌ترین جاده</strong>: اولین بازیکنی با ۵ قطعه جاده پیوسته کارت طولانی‌ترین جاده (+۲ امتیاز) را کسب می‌کند.</p>
      `
    },
    en: {
      gameTitle: 'Settlers of Catan',
      menuHubTitle: 'Game Hub',
      mainMenuTitle: 'Catan (مهاجران کاتان)',
      mainMenuSubtitle: 'Classic strategic board game of trading, building roads, settlements and cities on the island of Catan',
      menuSoloTitle: 'Single Player vs AI',
      menuSoloDesc: 'Play offline against 2 or 3 smart strategic bots with trading and expansion AI',
      menuPassPlayTitle: 'Pass & Play (Local Device)',
      menuPassPlayDesc: 'Play with 2 to 4 friends taking turns on this screen',
      menuOnlineTitle: 'Online Multiplayer & LAN',
      menuOnlineDesc: 'Create private room, invite friends, and settle the island together',
      menuRulesTitle: 'Rules & How to Play',
      menuRulesDesc: 'Official rules: resource production, robber on 7, coastal ports, longest road, and 10 VP',
      resumeGame: 'Resume Current Match',
      setupTitle: '⚙️ Catan Game Setup',
      playerCountLabel: 'Player Count:',
      difficultyLabel: 'AI Difficulty:',
      diffEasy: 'Easy',
      diffMed: 'Medium',
      diffHard: 'Master',
      timerLabel: 'Turn Timer:',
      timerOff: 'Unlimited',
      startGameBtn: 'Start Match',
      backBtn: 'Back',
      multiplayerTitle: 'Online / Local Catan Room',
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
      cancelBtn: 'Cancel',
      rollDiceBtn: 'Roll Dice',
      buildRoadBtn: 'Road',
      buildSettlementBtn: 'Settlement',
      buildCityBtn: 'City',
      buyDevBtn: 'Buy Dev Card',
      myDevsBtn: 'My Cards',
      tradeBtn: 'Trade',
      endTurnBtn: 'End Turn',
      resLumber: 'Lumber',
      resBrick: 'Brick',
      resWool: 'Wool',
      resGrain: 'Grain',
      resOre: 'Ore',
      tradeModalTitle: '🔄 Bank & Port Trading',
      giveResourceLabel: 'Resource to Give:',
      getResourceLabel: 'Resource to Receive:',
      confirmTradeBtn: 'Execute Trade',
      myDevsTitle: '🃏 Your Development Cards',
      rulesTitle: '📜 Catan Rules & Guide',
      chatTitle: '💬 In-Game Chat',
      soundLabel: 'Sound',
      multiplayerBtn: 'Online Multiplayer',
      rematchBtn: 'Rematch',
      setupSettlement: 'Turn: Place Settlement',
      setupRoad: 'Turn: Place Road Connected to Settlement',
      rollDicePhase: "{name}'s Turn: Roll Dice",
      turnActionPhase: "{name}'s Turn: Build, Trade, or End Turn",
      robberMovePrompt: '7 rolled! Click a hex to relocate the Robber.',
      robberStealPrompt: 'Select an adjacent player to steal a resource card.',
      discardPrompt: '7 rolled! Players with > 7 cards must discard half.',
      roadHint: 'Click a highlighted edge to build a road.',
      settlementHint: 'Click a highlighted vertex to build a settlement.',
      cityHint: 'Click one of your settlements to upgrade to a city.',
      notEnoughRes: 'Not enough resources to build this!',
      linkCopied: 'Room invite link copied to clipboard!',
      nameSavedToast: 'Your name was saved as "{name}".',
      longestRoadBadge: '🚗 Longest Road',
      largestArmyBadge: '⚔️ Largest Army',
      soloSetupTitle: '🤖 Solo Match vs AI Setup',
      passplaySetupTitle: '👥 Pass & Play Setup',
      setupPlayers2: '2 Players (Duel)',
      setupPlayers3: '3 Players (Standard)',
      setupPlayers4: '4 Players (Full)',
      onlinePlayers2: '2 Players',
      onlinePlayers3: '3 Players',
      onlinePlayers4: '4 Players',
      timer45: '45 Seconds',
      timer60: '60 Seconds',
      timer90: '90 Seconds',
      tradeRateDefault: 'Exchange rate: 4:1 default (with port: 3:1 or 2:1)',
      discardModalTitle: '⚠️ 7 Rolled: Discard Cards',
      discardModalDesc: 'Due to rolling a 7 with more than 7 cards, you must select and discard half your hand.',
      confirmDiscardBtn: 'Discard Selected Cards',
      stealModalTitle: '🦹 Robber Steal Resource',
      stealModalDesc: 'Select an adjacent player to steal a random resource card:',
      gameOverTitle: '🎉 Game Over - Settlers of Catan',
      gameOverSub: 'Conquered the island of Catan with 10 Victory Points.',
      chatSystemSender: 'System',
      chatWelcomeMsg: 'Welcome to Settlers of Catan strategic board game!',
      chatPlaceholder: 'Your message...',
      quickEndTurnText: '💡 No affordable builds. Click to pass to bots:',
      quickEndTurnBtnLabel: 'End Turn (Bots Turn)',
      soundTooltip: 'Sound (Mute/Unmute)',
      langTooltip: 'Switch Language (EN/FA)',
      multiplayerTooltip: 'Online Multiplayer',
      rulesTooltip: 'Rules & Guide',
      chatTooltip: 'Messages & Chat',
      menuTooltip: 'Main Menu',
      mobileNavTooltip: 'Menu',
      zoomInTooltip: 'Zoom In (+)',
      zoomResetTooltip: 'Reset Zoom (100%)',
      zoomOutTooltip: 'Zoom Out (−)',
      diceLabel: 'Dice',
      rulesContent: `
        <h4>1. Objective</h4>
        <p>The goal is to reach 10 Victory Points (VP). Earn points from Settlements (1 VP each), Cities (2 VP each), Longest Road (2 VP), Largest Army (2 VP), and Victory Point Development Cards.</p>
        <h4>2. Initial Setup (Snake Draft)</h4>
        <p>Players take turns placing 1 Settlement and 1 connected Road. In the reverse direction, each player places their 2nd Settlement and Road, receiving starting resource cards from adjacent hexes.</p>
        <h4>3. Turn Sequence</h4>
        <p>• <strong>Roll Dice (2d6)</strong>: Producing hexes generate 1 resource per adjacent settlement, 2 per city (blocked if hex holds robber).<br>
        • <strong>Rolling a 7 & Robber</strong>: Players with > 7 cards discard half rounded down. The roller moves the robber to any hex and steals 1 random resource from an adjacent player.<br>
        • <strong>Trade & Build</strong>: Trade with the bank (4:1 default, 3:1 generic port, 2:1 specific port) and build roads, settlements, cities, or buy dev cards.</p>
        <h4>4. Building Costs</h4>
        <p>• <strong>Road</strong>: 1 Lumber + 1 Brick<br>
        • <strong>Settlement</strong>: 1 Lumber + 1 Brick + 1 Wool + 1 Grain (distance rule: min 2 edges from any settlement)<br>
        • <strong>City</strong>: 2 Grain + 3 Ore (upgrades an existing settlement)<br>
        • <strong>Dev Card</strong>: 1 Wool + 1 Grain + 1 Ore</p>
      `
    }
  };

  // =========================================================================
  // 2. STATE & CONFIGURATION
  // =========================================================================
  const CatanLogic = window.CatanLogic || (typeof globalThis !== 'undefined' ? globalThis.CatanLogic : null);

  const TERRAIN_IDENTIFIERS = {
    forest: {
      fa: '🪵 چوب',
      en: '🪵 Wood',
      resource: 'lumber'
    },
    hills: {
      fa: '🧱 آجر',
      en: '🧱 Brick',
      resource: 'brick'
    },
    pasture: {
      fa: '🐑 گوسفند',
      en: '🐑 Sheep',
      resource: 'wool'
    },
    fields: {
      fa: '🌾 گندم',
      en: '🌾 Wheat',
      resource: 'grain'
    },
    mountains: {
      fa: '🪨 سنگ',
      en: '🪨 Ore',
      resource: 'ore'
    },
    desert: {
      fa: '🏜️ بیابان',
      en: '🏜️ Desert',
      resource: null
    }
  };

  let currentLang = localStorage.getItem('rubik_card_lang') || 'fa';
  let localPlayerName = localStorage.getItem('rubik_player_name') || 'Player';
  const soundEngine = (typeof window !== 'undefined' && window.catanSound)
    ? window.catanSound
    : ((typeof window !== 'undefined' && window.CatanSoundEngine)
        ? new window.CatanSoundEngine()
        : {
            isMuted: () => false,
            toggleMute: () => false,
            playClick: () => {},
            playDiceRoll: () => {},
            playResourceChime: () => {},
            playBuildRoad: () => {},
            playBuildSettlement: () => {},
            playBuildCity: () => {},
            playCardWhoosh: () => {},
            playRobber: () => {},
            playVictoryFanfare: () => {}
          });

  function safePlaySound(method, ...args) {
    try {
      if (soundEngine && typeof soundEngine[method] === 'function') {
        soundEngine[method](...args);
      } else if (method === 'playResourceChime' && soundEngine && typeof soundEngine.playResource === 'function') {
        soundEngine.playResource(...args);
      } else if (method === 'playCardWhoosh' && soundEngine && typeof soundEngine.playDevCard === 'function') {
        soundEngine.playDevCard(...args);
      } else if (method === 'playVictoryFanfare' && soundEngine && typeof soundEngine.playVictory === 'function') {
        soundEngine.playVictory(...args);
      }
    } catch (_) {}
  }

  function getResourceName(res) {
    if (currentLang === 'fa') {
      const names = {
        lumber: 'چوب',
        brick: 'آجر',
        wool: 'گوسفند',
        grain: 'گندم',
        ore: 'سنگ'
      };
      return names[res] || res;
    }
    return res ? res.charAt(0).toUpperCase() + res.slice(1) : '';
  }

  let gameMode = 'solo'; // 'solo' | 'passplay' | 'online'
  let state = null; // CatanLogic state
  let localSeats = [0]; // Local human player indices
  let buildMode = null; // null | 'ROAD' | 'SETTLEMENT' | 'CITY'

  let botDifficulty = 'medium';
  let timeControl = 0; // seconds per turn
  let turnTimerInterval = null;
  let turnSecondsLeft = 0;

  // Online Multiplayer State
  let ws = null;
  let roomCode = null;
  let isHost = false;
  let mySeat = 0;
  let currentLobbySeats = [];

  // Selected trade resources
  let tradeGiveRes = 'lumber';
  let tradeGetRes = 'brick';

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
    el.boardPanzoomLayer = document.getElementById('board-panzoom-layer');
    el.btnZoomIn = document.getElementById('btn-zoom-in');
    el.btnZoomOut = document.getElementById('btn-zoom-out');
    el.btnZoomReset = document.getElementById('btn-zoom-reset');
    el.zoomLevelText = document.getElementById('zoom-level-text');

    el.boardSvg = document.getElementById('board-svg');
    el.svgOceanPorts = document.getElementById('svg-ocean-ports');
    el.svgHexTiles = document.getElementById('svg-hex-tiles');
    el.svgEdges = document.getElementById('svg-edges');
    el.svgVertices = document.getElementById('svg-vertices');

    el.die1 = document.getElementById('die-1');
    el.die2 = document.getElementById('die-2');
    el.diceSumBadge = document.getElementById('dice-sum-badge');
    el.diceBox = document.getElementById('dice-overlay-widget');

    el.placementModeBanner = document.getElementById('placement-mode-banner');
    el.placementModeText = document.getElementById('placement-mode-text');
    el.btnCancelPlacement = document.getElementById('btn-cancel-placement');

    el.quickEndTurnBanner = document.getElementById('quick-end-turn-banner');
    el.quickEndTurnText = document.getElementById('quick-end-turn-text');
    el.btnQuickEndTurn = document.getElementById('btn-quick-end-turn');
    el.quickEndTurnBtnLabel = document.getElementById('quick-end-turn-btn-label');

    el.countLumber = document.getElementById('count-lumber');
    el.countBrick = document.getElementById('count-brick');
    el.countWool = document.getElementById('count-wool');
    el.countGrain = document.getElementById('count-grain');
    el.countOre = document.getElementById('count-ore');

    el.btnRollDice = document.getElementById('btn-roll-dice');
    el.btnBuildRoad = document.getElementById('btn-build-road');
    el.btnBuildSettlement = document.getElementById('btn-build-settlement');
    el.btnBuildCity = document.getElementById('btn-build-city');
    el.btnBuyDev = document.getElementById('btn-buy-dev');
    el.btnMyDevs = document.getElementById('btn-my-devs');
    el.myDevCount = document.getElementById('my-dev-count');
    el.btnTrade = document.getElementById('btn-trade');
    el.btnEndTurn = document.getElementById('btn-end-turn');

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
    el.modalTrade = document.getElementById('modal-trade');
    el.modalDevcards = document.getElementById('modal-devcards');
    el.modalDiscard = document.getElementById('modal-discard');
    el.modalSteal = document.getElementById('modal-steal');
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
    el.btnSwapCatanSeats = document.getElementById('btn-swap-catan-seats');
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
      ? 'Catan (کاتان) - Rubik Card Club'
      : 'Catan (Settlers of Catan) - Rubik Card Club';

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

    const setupTitleEl = document.getElementById('setup-modal-title');
    if (setupTitleEl) {
      const setupKey = setupTitleEl.getAttribute('data-i18n');
      if (setupKey && t[setupKey]) {
        setupTitleEl.textContent = t[setupKey];
      }
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
      localStorage.setItem('hokm_player_name', clean);
      localStorage.setItem('rubik_bg_player_name', clean);
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
  // 5. INTERACTIVE MAP ZOOM & PAN SYSTEM
  // =========================================================================
  let zoomScale = 1.0;
  let panX = 0;
  let panY = 0;
  let isPanning = false;
  let hasPanned = false;
  let startPointerX = 0;
  let startPointerY = 0;
  let initialPinchDist = 0;
  let initialPinchScale = 1.0;

  function applyPanZoom(smooth = false) {
    if (!el.boardPanzoomLayer) return;
    if (smooth) {
      el.boardPanzoomLayer.classList.add('smooth-reset');
      setTimeout(() => {
        if (el.boardPanzoomLayer) el.boardPanzoomLayer.classList.remove('smooth-reset');
      }, 350);
    }
    el.boardPanzoomLayer.setAttribute(
      'transform',
      `translate(${panX}, ${panY}) scale(${zoomScale})`
    );
    if (el.zoomLevelText) {
      el.zoomLevelText.textContent = `${Math.round(zoomScale * 100)}%`;
    }
  }

  function setZoom(newScale, smooth = true) {
    const clamped = Math.max(0.7, Math.min(2.5, Math.round(newScale * 100) / 100));
    zoomScale = clamped;
    applyPanZoom(smooth);
  }

  function resetPanZoom() {
    zoomScale = 1.0;
    panX = 0;
    panY = 0;
    applyPanZoom(true);
  }

  function setupBoardPanZoom() {
    if (!el.boardContainer) return;

    // 1. Mouse Wheel Zoom (centered on board)
    el.boardContainer.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
      const targetScale = Math.max(0.7, Math.min(2.5, zoomScale * zoomFactor));

      const rect = el.boardContainer.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - rect.width / 2;
      const mouseY = e.clientY - rect.top - rect.height / 2;

      if (zoomFactor > 1) {
        panX -= mouseX * 0.08;
        panY -= mouseY * 0.08;
      }
      zoomScale = targetScale;
      applyPanZoom(false);
    }, { passive: false });

    // 2. Click & Drag Pan (Pointer Events)
    el.boardContainer.addEventListener('pointerdown', (e) => {
      if (e.target.closest('#board-zoom-controls') || e.target.closest('#btn-cancel-placement')) return;

      isPanning = true;
      hasPanned = false;
      startPointerX = e.clientX - panX;
      startPointerY = e.clientY - panY;
      el.boardContainer.classList.add('is-panning');
    });

    window.addEventListener('pointermove', (e) => {
      if (!isPanning) return;
      const dx = (e.clientX - startPointerX) - panX;
      const dy = (e.clientY - startPointerY) - panY;

      if (Math.hypot(dx, dy) > 6) {
        hasPanned = true;
      }

      panX = e.clientX - startPointerX;
      panY = e.clientY - startPointerY;

      const maxPan = 300 * zoomScale;
      panX = Math.max(-maxPan, Math.min(maxPan, panX));
      panY = Math.max(-maxPan, Math.min(maxPan, panY));

      applyPanZoom(false);
    });

    const endPan = () => {
      if (!isPanning) return;
      isPanning = false;
      if (el.boardContainer) el.boardContainer.classList.remove('is-panning');
      setTimeout(() => {
        hasPanned = false;
      }, 60);
    };

    window.addEventListener('pointerup', endPan);
    window.addEventListener('pointercancel', endPan);

    // 3. Touch Pinch-to-zoom (Mobile)
    el.boardContainer.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        initialPinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialPinchScale = zoomScale;
      }
    }, { passive: true });

    el.boardContainer.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2 && initialPinchDist > 0) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = dist / initialPinchDist;
        setZoom(initialPinchScale * factor, false);
      }
    }, { passive: true });

    el.boardContainer.addEventListener('touchend', (e) => {
      if (e.touches.length < 2) {
        initialPinchDist = 0;
      }
    }, { passive: true });

    // 4. Zoom Controls Buttons
    if (el.btnZoomIn) {
      el.btnZoomIn.addEventListener('click', (e) => {
        e.stopPropagation();
        soundEngine.playClick();
        setZoom(zoomScale + 0.25, true);
      });
    }
    if (el.btnZoomOut) {
      el.btnZoomOut.addEventListener('click', (e) => {
        e.stopPropagation();
        soundEngine.playClick();
        setZoom(zoomScale - 0.25, true);
      });
    }
    if (el.btnZoomReset) {
      el.btnZoomReset.addEventListener('click', (e) => {
        e.stopPropagation();
        soundEngine.playClick();
        resetPanZoom();
      });
    }
  }

  function highlightRolledHexes(sum) {
    if (!state || !state.tiles) return;
    state.tiles.forEach(tile => {
      if (tile.number === sum) {
        const g = document.getElementById(`hex-tile-${tile.id}`);
        if (g) {
          const poly = g.querySelector('.hex-polygon');
          if (poly) {
            poly.classList.remove('roll-highlight');
            void poly.offsetWidth; // force reflow
            poly.classList.add('roll-highlight');
            setTimeout(() => {
              if (poly) poly.classList.remove('roll-highlight');
            }, 1500);
          }
        }
      }
    });
  }

  function resetDiceDisplayToReady() {
    if (el.diceSumBadge) el.diceSumBadge.textContent = '🎲';
    renderDieFace(el.die1, 1);
    renderDieFace(el.die2, 1);
  }

  // =========================================================================
  // 6. SVG BOARD GENERATOR & RENDERING
  // =========================================================================
  function renderBoardBase() {
    const bg = CatanLogic.BOARD_GRAPH;

    // 1. Ocean Ports
    if (el.svgOceanPorts) {
      el.svgOceanPorts.innerHTML = '';
      // Group ports by pairs
      const renderedPorts = new Set();
      bg.vertices.forEach((v) => {
        if (v.port && !renderedPorts.has(v.port)) {
          renderedPorts.add(v.port);
          // Port Label near outer boundary
          const angle = Math.atan2(v.y - 240, v.x - 270);
          const px = v.x + 22 * Math.cos(angle);
          const py = v.y + 22 * Math.sin(angle);

          const portGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          const portRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          portRect.setAttribute('x', px - 22);
          portRect.setAttribute('y', py - 10);
          portRect.setAttribute('width', 44);
          portRect.setAttribute('height', 20);
          portRect.setAttribute('class', 'port-label-box');

          const portText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          portText.setAttribute('x', px);
          portText.setAttribute('y', py);
          portText.setAttribute('class', 'port-label-text');
          
          let portLabel = '⚓ 3:1';
          if (v.port.type === 'lumber') portLabel = '🪵 2:1';
          if (v.port.type === 'brick') portLabel = '🧱 2:1';
          if (v.port.type === 'wool') portLabel = '🐑 2:1';
          if (v.port.type === 'grain') portLabel = '🌾 2:1';
          if (v.port.type === 'ore') portLabel = '🪨 2:1';
          portText.textContent = portLabel;

          portGroup.appendChild(portRect);
          portGroup.appendChild(portText);
          el.svgOceanPorts.appendChild(portGroup);
        }
      });
    }

    // 2. Hex Tiles
    if (el.svgHexTiles) {
      el.svgHexTiles.innerHTML = '';
      bg.hexes.forEach((hex) => {
        const tile = state ? state.tiles[hex.id] : null;
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('id', `hex-tile-${hex.id}`);
        group.setAttribute('class', 'hex-group');
        group.dataset.hexId = hex.id;

        // Polygon Corners
        const corners = hex.vertexIds.map(vId => {
          const v = bg.vertices[vId];
          return `${v.x},${v.y}`;
        }).join(' ');

        const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        poly.setAttribute('points', corners);
        poly.setAttribute('class', `hex-polygon terrain-${tile ? tile.terrain : 'desert'}`);
        group.appendChild(poly);

        // Terrain Identifier Badge (Resource Icon + Persian/English Name)
        const tInfo = TERRAIN_IDENTIFIERS[tile ? tile.terrain : 'desert'] || TERRAIN_IDENTIFIERS.desert;
        const badgeLabel = currentLang === 'fa' ? tInfo.fa : tInfo.en;

        const badgeG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        badgeG.setAttribute('class', 'terrain-badge-group');

        const badgeRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        badgeRect.setAttribute('x', hex.x - 30);
        badgeRect.setAttribute('y', hex.y - 34);
        badgeRect.setAttribute('width', 60);
        badgeRect.setAttribute('height', 16);
        badgeRect.setAttribute('rx', 8);
        badgeRect.setAttribute('class', `terrain-badge-pill terrain-pill-${tile ? tile.terrain : 'desert'}`);

        const badgeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        badgeText.setAttribute('x', hex.x);
        badgeText.setAttribute('y', hex.y - 23);
        badgeText.setAttribute('class', 'terrain-badge-text');
        badgeText.textContent = badgeLabel;

        badgeG.appendChild(badgeRect);
        badgeG.appendChild(badgeText);
        group.appendChild(badgeG);

        // Desert Center Icon (when no number token)
        if (!tile || !tile.number) {
          const desertCenterG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          desertCenterG.setAttribute('class', 'desert-center-group');

          const desertIcon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          desertIcon.setAttribute('x', hex.x);
          desertIcon.setAttribute('y', hex.y + 6);
          desertIcon.setAttribute('class', 'desert-center-icon');
          desertIcon.textContent = '🏜️';

          desertCenterG.appendChild(desertIcon);
          group.appendChild(desertCenterG);
        }

        // Number Token (if not desert)
        if (tile && tile.number) {
          const tokenG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          tokenG.setAttribute('class', 'number-token-group');

          const isHighProb = tile.number === 6 || tile.number === 8;

          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle.setAttribute('cx', hex.x);
          circle.setAttribute('cy', hex.y);
          circle.setAttribute('r', 16);
          circle.setAttribute('class', `token-circle ${isHighProb ? 'high-prob' : ''}`);

          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', hex.x);
          text.setAttribute('y', hex.y - 1);
          text.setAttribute('class', `token-text ${isHighProb ? 'high-prob' : ''}`);
          text.textContent = tile.number;

          const pipsText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          pipsText.setAttribute('x', hex.x);
          pipsText.setAttribute('y', hex.y + 11);
          pipsText.setAttribute('class', `token-pips ${isHighProb ? 'high-prob' : ''}`);
          pipsText.textContent = '•'.repeat(tile.pips);

          tokenG.appendChild(circle);
          tokenG.appendChild(text);
          tokenG.appendChild(pipsText);
          group.appendChild(tokenG);
        }

        // Robber Piece
        const robberG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        robberG.setAttribute('id', `robber-hex-${hex.id}`);
        robberG.setAttribute('class', 'robber-figure');
        robberG.style.display = tile && tile.hasRobber ? 'block' : 'none';

        const robberCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        robberCircle.setAttribute('cx', hex.x);
        robberCircle.setAttribute('cy', hex.y);
        robberCircle.setAttribute('r', 12);
        robberCircle.setAttribute('fill', '#090d16');
        robberCircle.setAttribute('stroke', '#d4af37');
        robberCircle.setAttribute('stroke-width', 2);

        const robberText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        robberText.setAttribute('x', hex.x);
        robberText.setAttribute('y', hex.y + 4);
        robberText.setAttribute('text-anchor', 'middle');
        robberText.setAttribute('font-size', '12px');
        robberText.textContent = '🦹';

        robberG.appendChild(robberCircle);
        robberG.appendChild(robberText);
        group.appendChild(robberG);

        // Click handler for moving robber
        group.addEventListener('click', () => {
          if (state && state.phase === 'ROBBER_MOVE' && isLocalPlayerTurn()) {
            handleMoveRobber(hex.id);
          }
        });

        el.svgHexTiles.appendChild(group);
      });
    }

    // 3. Edges (72 Roads)
    if (el.svgEdges) {
      el.svgEdges.innerHTML = '';
      bg.edges.forEach((edge) => {
        const v1 = bg.vertices[edge.v1];
        const v2 = bg.vertices[edge.v2];

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('id', `edge-group-${edge.id}`);
        g.dataset.edgeId = edge.id;

        const hitbox = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        hitbox.setAttribute('x1', v1.x);
        hitbox.setAttribute('y1', v1.y);
        hitbox.setAttribute('x2', v2.x);
        hitbox.setAttribute('y2', v2.y);
        hitbox.setAttribute('class', 'board-edge-hitbox');

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', v1.x);
        line.setAttribute('y1', v1.y);
        line.setAttribute('x2', v2.x);
        line.setAttribute('y2', v2.y);
        line.setAttribute('class', 'board-edge-line');
        line.setAttribute('id', `edge-line-${edge.id}`);

        hitbox.addEventListener('click', () => {
          handleEdgeClick(edge.id);
        });

        g.appendChild(hitbox);
        g.appendChild(line);
        el.svgEdges.appendChild(g);
      });
    }

    // 4. Vertices (54 Settlements / Cities)
    if (el.svgVertices) {
      el.svgVertices.innerHTML = '';
      bg.vertices.forEach((v) => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('id', `vertex-group-${v.id}`);
        g.dataset.vertexId = v.id;

        const hitbox = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        hitbox.setAttribute('cx', v.x);
        hitbox.setAttribute('cy', v.y);
        hitbox.setAttribute('r', 16);
        hitbox.setAttribute('class', 'board-vertex-hitbox');

        const visual = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        visual.setAttribute('cx', v.x);
        visual.setAttribute('cy', v.y);
        visual.setAttribute('r', 6);
        visual.setAttribute('class', 'board-vertex-visual');
        visual.setAttribute('id', `vertex-visual-${v.id}`);

        // Built building icon placeholder
        const buildingText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        buildingText.setAttribute('x', v.x);
        buildingText.setAttribute('y', v.y + 5);
        buildingText.setAttribute('text-anchor', 'middle');
        buildingText.setAttribute('class', 'board-building');
        buildingText.setAttribute('id', `vertex-building-${v.id}`);
        buildingText.style.display = 'none';

        hitbox.addEventListener('click', () => {
          handleVertexClick(v.id);
        });

        g.appendChild(hitbox);
        g.appendChild(visual);
        g.appendChild(buildingText);
        el.svgVertices.appendChild(g);
      });
    }
  }

  // =========================================================================
  // 6. UI UPDATE & SYNC
  // =========================================================================
  function updateUI() {
    if (!state) return;
    const t = I18N[currentLang];
    const activeP = state.players[state.activePlayer];
    const isMyTurn = isLocalPlayerTurn();

    // 1. Top Turn Pill
    if (el.topTurnDot) {
      el.topTurnDot.className = `turn-color-dot ${activeP.color}`;
    }
    if (el.topStatusText) {
      if (state.phase === 'SETUP_SETTLEMENT') {
        el.topStatusText.textContent = `${activeP.name}: ${t.setupSettlement}`;
      } else if (state.phase === 'SETUP_ROAD') {
        el.topStatusText.textContent = `${activeP.name}: ${t.setupRoad}`;
      } else if (state.phase === 'ROLL_DICE') {
        el.topStatusText.textContent = isMyTurn
          ? (currentLang === 'fa' ? `🎲 نوبت شما (${activeP.name}): لطفاً تاس بیندازید` : `🎲 Your turn (${activeP.name}): Please roll the dice`)
          : t.rollDicePhase.replace('{name}', activeP.name);
      } else if (state.phase === 'ROBBER_MOVE') {
        el.topStatusText.textContent = isMyTurn
          ? (currentLang === 'fa' ? '⚠️ راهزن را به یک خانه دیگر منتقل کنید.' : '⚠️ Move the Robber to another hex.')
          : t.robberMovePrompt;
      } else if (state.phase === 'ROBBER_STEAL') {
        el.topStatusText.textContent = t.robberStealPrompt;
      } else if (state.phase === 'ROBBER_DISCARD') {
        el.topStatusText.textContent = t.discardPrompt;
      } else {
        // PLAYING_TURN
        if (isMyTurn) {
          const hasRoadRes = CatanLogic.hasResources(activeP, CatanLogic.COSTS.ROAD) && activeP.roadsLeft > 0;
          const hasSetRes = CatanLogic.hasResources(activeP, CatanLogic.COSTS.SETTLEMENT) && activeP.settlementsLeft > 0;
          const hasCityRes = CatanLogic.hasResources(activeP, CatanLogic.COSTS.CITY) && activeP.citiesLeft > 0;
          const hasDevRes = CatanLogic.canBuyDevCard(state, state.activePlayer);
          const canAny = hasRoadRes || hasSetRes || hasCityRes || hasDevRes;

          if (!canAny) {
            el.topStatusText.textContent = currentLang === 'fa'
              ? `💡 نوبت شما (${activeP.name}): منابع کافی برای ساخت ندارید. برای نوبت ربات‌ها روی «پایان نوبت» بزنید.`
              : `💡 Your turn (${activeP.name}): No affordable builds. Click 'End Turn' to pass to bots.`;
          } else {
            el.topStatusText.textContent = currentLang === 'fa'
              ? `✨ نوبت شما (${activeP.name}): ساخت‌وساز، تجارت یا «پایان نوبت» را انتخاب کنید.`
              : `✨ Your turn (${activeP.name}): Build, trade, or click 'End Turn'.`;
          }
        } else {
          el.topStatusText.textContent = t.turnActionPhase.replace('{name}', activeP.name);
        }
      }
    }

    // 2. Scoreboard / Players HUD
    if (el.playersHudBar) {
      el.playersHudBar.innerHTML = '';
      state.players.forEach((p, idx) => {
        const isActive = state.activePlayer === idx;
        const isSelf = isLocalSeat(idx);

        const card = document.createElement('div');
        card.className = `player-hud-card ${isActive ? 'active-turn' : ''}`;

        const totalRes = Object.values(p.resources).reduce((a, b) => a + b, 0);
        const devCount = p.devCards.length;

        card.innerHTML = `
          <div class="hud-color-stripe" style="background:${p.colorHex};"></div>
          <div class="hud-header">
            <div class="hud-name-wrap" style="color:${p.colorLight};">
              <span class="hud-turn-pip"></span>
              <span>${p.name}${isSelf ? ` ${t.youBadge}` : ''}</span>
            </div>
            <div class="hud-vp-badge">
              <span>⭐</span>
              <span>${p.victoryPoints} VP</span>
            </div>
          </div>
          <div class="hud-stats-row">
            <div class="hud-stat-pill highlight" title="Resources">
              <span>🃏</span> <span>${totalRes}</span>
            </div>
            <div class="hud-stat-pill" title="Development Cards">
              <span>📜</span> <span>${devCount}</span>
            </div>
            <div class="hud-stat-pill" title="Knights Played">
              <span>⚔️</span> <span>${p.playedKnights}</span>
            </div>
            <div class="hud-stat-pill" title="Road Length">
              <span>🛣️</span> <span>${p.longestRoadLength}</span>
            </div>
          </div>
          <div class="hud-special-badges">
            <span class="special-badge road ${p.hasLongestRoad ? 'visible' : ''}">${t.longestRoadBadge}</span>
            <span class="special-badge army ${p.hasLargestArmy ? 'visible' : ''}">${t.largestArmyBadge}</span>
          </div>
        `;
        el.playersHudBar.appendChild(card);
      });
    }

    // 3. Resource Cards Hand (for local human active player or view)
    const localViewer = state.players[getLocalViewerSeat()];
    if (localViewer) {
      if (el.countLumber) el.countLumber.textContent = localViewer.resources.lumber || 0;
      if (el.countBrick) el.countBrick.textContent = localViewer.resources.brick || 0;
      if (el.countWool) el.countWool.textContent = localViewer.resources.wool || 0;
      if (el.countGrain) el.countGrain.textContent = localViewer.resources.grain || 0;
      if (el.countOre) el.countOre.textContent = localViewer.resources.ore || 0;
      if (el.myDevCount) el.myDevCount.textContent = localViewer.devCards.length || 0;
    }

    // 4. Action Buttons State
    const inSetup = state.phase.startsWith('SETUP');
    const canRoll = isMyTurn && state.phase === 'ROLL_DICE';
    const canPlay = isMyTurn && state.phase === 'PLAYING_TURN';

    // Reset dice visual to ready indicator when waiting for roll
    if (state.phase === 'ROLL_DICE' && (!state.lastDice || isMyTurn)) {
      resetDiceDisplayToReady();
    }

    const hasRoadRes = isMyTurn && CatanLogic.hasResources(activeP, CatanLogic.COSTS.ROAD) && activeP.roadsLeft > 0;
    const hasSetRes = isMyTurn && CatanLogic.hasResources(activeP, CatanLogic.COSTS.SETTLEMENT) && activeP.settlementsLeft > 0;
    const hasCityRes = isMyTurn && CatanLogic.hasResources(activeP, CatanLogic.COSTS.CITY) && activeP.citiesLeft > 0;
    const hasDevRes = isMyTurn && CatanLogic.canBuyDevCard(state, state.activePlayer);
    const canTrade = isMyTurn && Object.entries(activeP.resources).some(([res, count]) => count >= CatanLogic.getBestTradeRatio(state, state.activePlayer, res));
    const canAnyAction = hasRoadRes || hasSetRes || hasCityRes || hasDevRes || canTrade;

    if (el.btnRollDice) {
      el.btnRollDice.innerHTML = `<span>🎲</span><span>${t.rollDiceBtn}</span>`;
      el.btnRollDice.disabled = !canRoll;
      if (canRoll) {
        el.btnRollDice.classList.add('primary', 'pulse-glow');
      } else {
        el.btnRollDice.classList.remove('primary', 'pulse-glow', 'must-end-turn');
      }
    }

    if (el.diceBox) {
      el.diceBox.classList.toggle('can-roll', canRoll);
    }

    if (el.btnBuildRoad) {
      el.btnBuildRoad.disabled = !(canPlay || (isMyTurn && state.phase === 'SETUP_ROAD'));
      el.btnBuildRoad.classList.toggle('can-afford', hasRoadRes || (isMyTurn && state.phase === 'SETUP_ROAD'));
      el.btnBuildRoad.classList.toggle('cannot-afford', !hasRoadRes && canPlay);
    }
    if (el.btnBuildSettlement) {
      el.btnBuildSettlement.disabled = !(canPlay || (isMyTurn && state.phase === 'SETUP_SETTLEMENT'));
      el.btnBuildSettlement.classList.toggle('can-afford', hasSetRes || (isMyTurn && state.phase === 'SETUP_SETTLEMENT'));
      el.btnBuildSettlement.classList.toggle('cannot-afford', !hasSetRes && canPlay);
    }
    if (el.btnBuildCity) {
      el.btnBuildCity.disabled = !canPlay;
      el.btnBuildCity.classList.toggle('can-afford', hasCityRes);
      el.btnBuildCity.classList.toggle('cannot-afford', !hasCityRes && canPlay);
    }
    if (el.btnBuyDev) {
      el.btnBuyDev.disabled = !canPlay;
      el.btnBuyDev.classList.toggle('can-afford', hasDevRes);
      el.btnBuyDev.classList.toggle('cannot-afford', !hasDevRes && canPlay);
    }
    if (el.btnTrade) el.btnTrade.disabled = !canPlay;

    if (el.btnEndTurn) {
      el.btnEndTurn.disabled = !canPlay;
      if (canPlay) {
        el.btnEndTurn.classList.add('primary', 'must-end-turn');
        el.btnEndTurn.classList.remove('pulse-glow');
      } else {
        el.btnEndTurn.classList.remove('primary', 'pulse-glow', 'must-end-turn');
      }
    }

    // Quick End Turn Floating Banner (when no actions affordable)
    if (el.quickEndTurnBanner) {
      if (canPlay && !canAnyAction) {
        el.quickEndTurnBanner.style.display = 'flex';
        if (el.quickEndTurnText) {
          el.quickEndTurnText.textContent = currentLang === 'fa'
            ? '💡 منابع کافی برای ساخت ندارید. برای نوبت هوش مصنوعی کلیک کنید:'
            : '💡 No affordable builds. Click to pass to bots:';
        }
        if (el.quickEndTurnBtnLabel) {
          el.quickEndTurnBtnLabel.textContent = currentLang === 'fa'
            ? 'پایان نوبت (نوبت ربات‌ها)'
            : 'End Turn (Bots Turn)';
        }
      } else {
        el.quickEndTurnBanner.style.display = 'none';
      }
    }

    // 5. Update Board Visual Elements
    updateBoardVisuals();

    // 6. Placement Mode Banner
    if (el.placementModeBanner) {
      if (buildMode) {
        el.placementModeBanner.classList.add('active');
        if (buildMode === 'ROAD') el.placementModeText.textContent = t.roadHint;
        if (buildMode === 'SETTLEMENT') el.placementModeText.textContent = t.settlementHint;
        if (buildMode === 'CITY') el.placementModeText.textContent = t.cityHint;
      } else {
        el.placementModeBanner.classList.remove('active');
      }
    }

    // 7. Auto Trigger Modals for Phase
    if (state.phase === 'ROBBER_DISCARD' && isMyTurn) {
      checkAndShowDiscardModal();
    }
  }

  function updateBoardVisuals() {
    const bg = CatanLogic.BOARD_GRAPH;
    const activeId = state.activePlayer;
    const isSetup = state.phase.startsWith('SETUP');

    // Hexes Robber Placement
    bg.hexes.forEach(h => {
      const g = document.getElementById(`hex-tile-${h.id}`);
      const robber = document.getElementById(`robber-hex-${h.id}`);
      if (robber) robber.style.display = (state.robberHexId === h.id) ? 'block' : 'none';
      if (g) {
        if (state.phase === 'ROBBER_MOVE' && isLocalPlayerTurn() && h.id !== state.robberHexId) {
          g.classList.add('selectable-robber');
        } else {
          g.classList.remove('selectable-robber');
        }
      }
    });

    // Edges
    bg.edges.forEach(e => {
      const owner = state.edges[e.id];
      const line = document.getElementById(`edge-line-${e.id}`);
      const g = document.getElementById(`edge-group-${e.id}`);
      const hitbox = g ? g.querySelector('.board-edge-hitbox') : null;

      if (line) {
        if (owner !== null && owner !== undefined) {
          line.classList.add('built');
          line.style.stroke = state.players[owner].colorHex;
        } else {
          line.classList.remove('built');
          line.style.stroke = 'transparent';
        }
      }

      if (hitbox) {
        const canBuild = buildMode === 'ROAD' && CatanLogic.canBuildRoad(state, activeId, e.id, isSetup, state.lastSetupSettlementVertex);
        if (canBuild) {
          hitbox.classList.add('selectable');
        } else {
          hitbox.classList.remove('selectable');
        }
      }
    });

    // Vertices
    bg.vertices.forEach(v => {
      const building = state.vertices[v.id];
      const g = document.getElementById(`vertex-group-${v.id}`);
      const hitbox = g ? g.querySelector('.board-vertex-hitbox') : null;
      const visual = document.getElementById(`vertex-visual-${v.id}`);
      const buildingText = document.getElementById(`vertex-building-${v.id}`);

      if (buildingText) {
        if (building) {
          buildingText.style.display = 'block';
          buildingText.textContent = building.type === 'city' ? '🏛️' : '🏠';
          buildingText.style.filter = `drop-shadow(0 0 5px ${state.players[building.player].colorHex})`;
        } else {
          buildingText.style.display = 'none';
        }
      }

      if (hitbox) {
        let canSelect = false;
        if (buildMode === 'SETTLEMENT') {
          canSelect = CatanLogic.canBuildSettlement(state, activeId, v.id, isSetup);
        } else if (buildMode === 'CITY') {
          canSelect = CatanLogic.canBuildCity(state, activeId, v.id);
        }
        if (canSelect) {
          hitbox.classList.add('selectable');
        } else {
          hitbox.classList.remove('selectable');
        }
      }
    });
  }

  function hasResourcesForRoad(p, isSetup) {
    if (isSetup) return true;
    if (!p) return false;
    return p.resources.lumber >= 1 && p.resources.brick >= 1;
  }

  function hasResourcesForSettlement(p, isSetup) {
    if (isSetup) return true;
    if (!p) return false;
    return p.resources.lumber >= 1 && p.resources.brick >= 1 && p.resources.wool >= 1 && p.resources.grain >= 1;
  }

  function hasResourcesForCity(p) {
    if (!p) return false;
    return p.resources.grain >= 2 && p.resources.ore >= 3;
  }

  function isLocalSeat(seatIdx) {
    if (gameMode === 'passplay') return true;
    if (gameMode === 'solo') return seatIdx === 0;
    if (gameMode === 'online') return seatIdx === mySeat;
    return false;
  }

  function isLocalPlayerTurn() {
    if (!state) return false;
    return isLocalSeat(state.activePlayer);
  }

  function getLocalViewerSeat() {
    if (!state) return 0;
    if (gameMode === 'online') return mySeat;
    if (isLocalPlayerTurn()) return state.activePlayer;
    return 0;
  }

  // =========================================================================
  // 7. PLAYER ACTIONS & GAMEPLAY LOOP
  // =========================================================================
  function processBotDiscards() {
    if (!state || !state.discardQueue) return;
    const botItems = state.discardQueue.filter(d => !isLocalSeat(d.playerId));
    botItems.forEach(item => {
      const victim = state.players[item.playerId];
      const toDiscard = {};
      let need = item.count;
      for (const [r, count] of Object.entries(victim.resources)) {
        const take = Math.min(count, need);
        if (take > 0) { toDiscard[r] = take; need -= take; }
        if (need === 0) break;
      }
      CatanLogic.discardCards(state, item.playerId, toDiscard);
    });
  }

  function botRelocateRobberAndSteal(botId) {
    try {
      if (!state || state.phase !== 'ROBBER_MOVE') return;
      const botDecision = CatanLogic.chooseBotTurn(state, botId);
      let pickHex = (botDecision && botDecision.hexId !== undefined) ? botDecision.hexId : null;
      if (pickHex === null || pickHex === state.robberHexId) {
        const available = state.tiles.filter(t => t.id !== state.robberHexId && t.terrain !== 'desert').map(t => t.id);
        pickHex = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : 0;
      }
      const robRes = CatanLogic.moveRobber(state, botId, pickHex);
      if (robRes && robRes.canSteal && robRes.candidates && robRes.candidates.length > 0) {
        const victimId = robRes.candidates[0];
        CatanLogic.stealResource(state, botId, victimId);
      }
    } catch (err) {
      console.warn('Bot robber error:', err);
    }
  }

  function handleRollDice() {
    if (!state || state.phase !== 'ROLL_DICE' || !isLocalPlayerTurn()) return;

    if (el.btnRollDice) el.btnRollDice.disabled = true;

    safePlaySound('playDiceRoll');
    animateDiceRoll(() => {
      if (gameMode === 'online') {
        sendWsMessage({ type: 'CATAN_ROLL_DICE' });
      } else {
        const res = CatanLogic.rollDice(state);
        if (!res || !res.valid) {
          updateUI();
          return;
        }

        try {
          if (res.dice) {
            updateDiceVisual(res.dice[0], res.dice[1]);
          }
          if (res.sum === 7) {
            safePlaySound('playRobber');
            processBotDiscards();

            const humanDiscard = (state.discardQueue || []).find(d => isLocalSeat(d.playerId));
            if (humanDiscard) {
              checkAndShowDiscardModal();
            } else {
              notify(currentLang === 'fa' 
                ? '⚠️ تاس ۷ آمد! روی یکی از زمین‌های شش‌ضلعی کلیک کنید تا راهزن به آنجا برود.' 
                : '⚠️ 7 rolled! Click a hex to relocate the Robber.');
            }
          } else {
            highlightRolledHexes(res.sum);
            safePlaySound('playResourceChime');
            safePlaySound('playResource');
            const localId = state.activePlayer;
            const myProd = res.production && res.production[localId] ? res.production[localId] : {};
            const items = Object.entries(myProd).filter(([_, count]) => count > 0);
            const anyProduced = res.production && Object.values(res.production).some(p => Object.values(p).some(c => c > 0));

            if (items.length > 0) {
              const listStr = items.map(([r, count]) => `${count} ${getResourceName(r)}`).join(' و ');
              notify(currentLang === 'fa' 
                ? `🎲 تاس ${res.sum} آمد! دریافت کردید: ${listStr}.` 
                : `🎲 Rolled ${res.sum}! Produced: ${listStr}.`);
            } else if (anyProduced) {
              notify(currentLang === 'fa' 
                ? `🎲 تاس ${res.sum} آمد! سایر بازیکنان کارت دریافت کردند.` 
                : `🎲 Rolled ${res.sum}! Other players collected resources.`);
            } else {
              notify(currentLang === 'fa' 
                ? `🎲 تاس ${res.sum} آمد! منبعی تولید نشد.` 
                : `🎲 Rolled ${res.sum}! No resources produced.`);
            }
          }
        } catch (err) {
          console.error('Roll Dice handler error:', err);
        }

        updateUI();
        checkBotTurn();
      }
    });
  }

  function animateDiceRoll(callback) {
    if (el.die1) el.die1.classList.add('rolling');
    if (el.die2) el.die2.classList.add('rolling');

    setTimeout(() => {
      if (el.die1) el.die1.classList.remove('rolling');
      if (el.die2) el.die2.classList.remove('rolling');
      if (callback) callback();
    }, 450);
  }

  function updateDiceVisual(d1, d2) {
    if (el.diceSumBadge) el.diceSumBadge.textContent = d1 + d2;
    renderDieFace(el.die1, d1);
    renderDieFace(el.die2, d2);
  }

  function renderDieFace(dieEl, val) {
    if (!dieEl) return;
    const v = Math.max(1, Math.min(6, parseInt(val, 10) || 1));
    dieEl.setAttribute('data-val', v);
    dieEl.innerHTML = '';
    for (let i = 0; i < v; i++) {
      const dot = document.createElement('div');
      dot.className = 'die-dot';
      dieEl.appendChild(dot);
    }
  }

  function handleVertexClick(vertexId) {
    if (hasPanned || !state || !isLocalPlayerTurn()) return;
    const isSetup = state.phase.startsWith('SETUP');

    if (buildMode === 'SETTLEMENT' || (isSetup && state.phase === 'SETUP_SETTLEMENT')) {
      if (!CatanLogic.canBuildSettlement(state, state.activePlayer, vertexId, isSetup)) return;

      if (gameMode === 'online') {
        sendWsMessage({ type: 'CATAN_BUILD_SETTLEMENT', vertexId, isSetup });
      } else {
        const res = CatanLogic.buildSettlement(state, state.activePlayer, vertexId, isSetup);
        if (res.valid) {
          safePlaySound('playBuildSettlement');
          buildMode = null;
          updateUI();
          checkBotTurn();
        }
      }
    } else if (buildMode === 'CITY') {
      if (!CatanLogic.canBuildCity(state, state.activePlayer, vertexId)) return;

      if (gameMode === 'online') {
        sendWsMessage({ type: 'CATAN_BUILD_CITY', vertexId });
      } else {
        const res = CatanLogic.buildCity(state, state.activePlayer, vertexId);
        if (res.valid) {
          safePlaySound('playBuildCity');
          buildMode = null;
          updateUI();
          checkBotTurn();
        }
      }
    }
  }

  function handleEdgeClick(edgeId) {
    if (hasPanned || !state || !isLocalPlayerTurn()) return;
    const isSetup = state.phase.startsWith('SETUP');

    if (buildMode === 'ROAD' || (isSetup && state.phase === 'SETUP_ROAD')) {
      if (!CatanLogic.canBuildRoad(state, state.activePlayer, edgeId, isSetup, state.lastSetupSettlementVertex)) return;

      if (gameMode === 'online') {
        sendWsMessage({ type: 'CATAN_BUILD_ROAD', edgeId, isSetup });
      } else {
        const res = CatanLogic.buildRoad(state, state.activePlayer, edgeId, isSetup);
        if (res.valid) {
          safePlaySound('playBuildRoad');
          buildMode = null;
          updateUI();
          checkBotTurn();
        }
      }
    }
  }

  function handleMoveRobber(hexId) {
    if (hasPanned || !state || state.phase !== 'ROBBER_MOVE' || !isLocalPlayerTurn()) return;

    if (gameMode === 'online') {
      sendWsMessage({ type: 'CATAN_MOVE_ROBBER', hexId });
    } else {
      const res = CatanLogic.moveRobber(state, state.activePlayer, hexId);
      if (res.valid) {
        safePlaySound('playRobber');
        if (res.canSteal && res.candidates.length > 0) {
          showStealModal(res.candidates);
        }
        updateUI();
        checkBotTurn();
      }
    }
  }

  function handleEndTurn() {
    if (!state || state.phase !== 'PLAYING_TURN' || !isLocalPlayerTurn()) return;

    if (el.btnEndTurn) el.btnEndTurn.disabled = true;
    safePlaySound('playClick');
    if (gameMode === 'online') {
      sendWsMessage({ type: 'CATAN_END_TURN' });
    } else {
      CatanLogic.endTurn(state, state.activePlayer);
      buildMode = null;
      updateUI();
      startTurnCountdown();
      checkBotTurn();
    }
  }

  // =========================================================================
  // 8. BOT AI RUNNER (Solo Mode)
  // =========================================================================
  function checkBotTurn() {
    if (!state || state.phase === 'FINISHED') return;
    if (isLocalPlayerTurn()) {
      // In setup, automatically prompt user for placement mode
      if (state.phase === 'SETUP_SETTLEMENT') buildMode = 'SETTLEMENT';
      if (state.phase === 'SETUP_ROAD') buildMode = 'ROAD';
      updateUI();
      return;
    }

    // Bot's Turn
    const botId = state.activePlayer;
    const bot = state.players[botId];

    if (el.topStatusText) {
      el.topStatusText.textContent = currentLang === 'fa'
        ? `🤖 نوبت ${bot.name}: در حال انداختن تاس...`
        : `🤖 ${bot.name}'s turn: rolling dice...`;
    }

    setTimeout(() => {
      if (!state || state.activePlayer !== botId) return;

      // Setup Phase
      if (state.phase.startsWith('SETUP')) {
        try {
          const move = CatanLogic.chooseBotSetupMove(state, botId);
          if (move) {
            if (move.action === 'BUILD_SETTLEMENT') {
              CatanLogic.buildSettlement(state, botId, move.vertexId, true);
              safePlaySound('playBuildSettlement');
            } else if (move.action === 'BUILD_ROAD') {
              CatanLogic.buildRoad(state, botId, move.edgeId, true);
              safePlaySound('playBuildRoad');
            }
          }
        } catch (err) {
          console.warn('Bot setup error:', err);
        }
        updateUI();
        checkBotTurn();
        return;
      }

      // Roll Phase
      if (state.phase === 'ROLL_DICE') {
        safePlaySound('playDiceRoll');
        const rollRes = CatanLogic.rollDice(state);
        try {
          if (rollRes && rollRes.dice) {
            updateDiceVisual(rollRes.dice[0], rollRes.dice[1]);
          }

          if (rollRes && rollRes.sum === 7) {
            safePlaySound('playRobber');
            notify(currentLang === 'fa' ? `🎲 ${bot.name} تاس ۷ انداخت!` : `🎲 ${bot.name} rolled a 7!`);

            processBotDiscards();

            const humanDiscard = (state.discardQueue || []).find(d => isLocalSeat(d.playerId));
            if (humanDiscard) {
              checkAndShowDiscardModal();
              updateUI();
              return; // Wait for human player to discard cards
            }

            botRelocateRobberAndSteal(botId);
          } else if (rollRes && rollRes.valid) {
            highlightRolledHexes(rollRes.sum);
            safePlaySound('playResourceChime');
            safePlaySound('playResource');
            notify(currentLang === 'fa' ? `🎲 ${bot.name} تاس انداخت: عدد ${rollRes.sum} آمد.` : `🎲 ${bot.name} rolled ${rollRes.sum}.`);
          }
        } catch (err) {
          console.warn('Bot roll handling error:', err);
        }
        updateUI();
      }

      // Main Playing Actions Loop
      setTimeout(() => {
        executeBotTurnActions(botId);
      }, 900);

    }, 800);
  }

  function executeBotTurnActions(botId) {
    if (!state || state.activePlayer !== botId) return;

    try {
      let safety = 0;
      while (state.phase === 'PLAYING_TURN' && safety++ < 6) {
        const decision = CatanLogic.chooseBotTurn(state, botId);
        if (!decision || decision.action === 'END_TURN') {
          break;
        }
        let didAct = false;
        if (decision.action === 'BUILD_CITY') {
          const r = CatanLogic.buildCity(state, botId, decision.vertexId);
          if (r && r.valid) { didAct = true; safePlaySound('playBuildCity'); }
        } else if (decision.action === 'BUILD_SETTLEMENT') {
          const r = CatanLogic.buildSettlement(state, botId, decision.vertexId, false);
          if (r && r.valid) { didAct = true; safePlaySound('playBuildSettlement'); }
        } else if (decision.action === 'BUILD_ROAD') {
          const r = CatanLogic.buildRoad(state, botId, decision.edgeId, false);
          if (r && r.valid) { didAct = true; safePlaySound('playBuildRoad'); }
        } else if (decision.action === 'BUY_DEV_CARD') {
          const r = CatanLogic.buyDevCard(state, botId);
          if (r && r.valid) { didAct = true; safePlaySound('playCardWhoosh'); }
        } else if (decision.action === 'BANK_TRADE') {
          const r = CatanLogic.bankTrade(state, botId, decision.giveResource, decision.getResource);
          if (r && r.valid) { didAct = true; }
        }
        if (!didAct) break;
      }
    } catch (err) {
      console.warn('Bot turn action error:', err);
    }

    // Always guarantee endTurn is called for the bot so turn advances
    if (state.activePlayer === botId) {
      CatanLogic.endTurn(state, botId);
    }

    updateUI();
    if (state.winner !== null) {
      showGameOverModal();
    } else {
      setTimeout(() => {
        checkBotTurn();
      }, 700);
    }
  }

  // =========================================================================
  // 9. TURN TIMER
  // =========================================================================
  function startTurnCountdown() {
    clearInterval(turnTimerInterval);
    if (timeControl <= 0) {
      if (el.topTimerBadge) el.topTimerBadge.style.display = 'none';
      return;
    }

    turnSecondsLeft = timeControl;
    if (el.topTimerBadge) {
      el.topTimerBadge.style.display = 'inline-block';
      el.topTimerBadge.textContent = turnSecondsLeft;
    }

    turnTimerInterval = setInterval(() => {
      turnSecondsLeft--;
      if (el.topTimerBadge) el.topTimerBadge.textContent = turnSecondsLeft;
      if (turnSecondsLeft <= 0) {
        clearInterval(turnTimerInterval);
        if (isLocalPlayerTurn()) {
          handleEndTurn();
        }
      }
    }, 1000);
  }

  // =========================================================================
  // 10. MODALS & TRADE MANAGEMENT
  // =========================================================================
  function openTradeModal() {
    soundEngine.playClick();
    updateTradeRateDisplay();
    if (el.modalTrade) el.modalTrade.classList.add('active');
  }

  function closeTradeModal() {
    soundEngine.playClick();
    if (el.modalTrade) el.modalTrade.classList.remove('active');
  }

  function updateTradeRateDisplay() {
    if (!state) return;
    const ratio = CatanLogic.getBestTradeRatio(state, state.activePlayer, tradeGiveRes);
    const rateText = document.getElementById('trade-rate-indicator');
    if (rateText) {
      rateText.textContent = currentLang === 'fa' 
        ? `نرخ تبادل با بانک: ${ratio} به ۱` 
        : `Bank Trade Ratio: ${ratio} to 1`;
    }
  }

  function showStealModal(candidates) {
    if (!el.modalSteal) return;
    const list = document.getElementById('steal-candidates-list');
    if (!list) return;
    list.innerHTML = '';

    candidates.forEach(cId => {
      const p = state.players[cId];
      const btn = document.createElement('button');
      btn.className = 'btn-secondary';
      btn.style.width = '100%';
      const totalCards = Object.values(p.resources).reduce((a, b) => a + b, 0);
      const cardLabel = currentLang === 'fa' ? 'کارت' : 'cards';
      btn.innerHTML = `<span style="color:${p.colorHex}; font-weight:800;">${p.name}</span> (${totalCards} ${cardLabel})`;
      btn.addEventListener('click', () => {
        soundEngine.playClick();
        if (gameMode === 'online') {
          sendWsMessage({ type: 'CATAN_STEAL', victimId: cId });
        } else {
          const res = CatanLogic.stealResource(state, state.activePlayer, cId);
          if (res.valid) {
            notify(currentLang === 'fa' ? `یک کارت از ${p.name} سرقت شد!` : `Stole a card from ${p.name}!`);
          }
        }
        el.modalSteal.classList.remove('active');
        updateUI();
      });
      list.appendChild(btn);
    });

    el.modalSteal.classList.add('active');
  }

  function checkAndShowDiscardModal() {
    const queueItem = state.discardQueue.find(d => isLocalSeat(d.playerId));
    if (!queueItem || !el.modalDiscard) return;

    const list = document.getElementById('discard-selectors-list');
    const quotaText = document.getElementById('discard-quota-text');
    const confirmBtn = document.getElementById('btn-confirm-discard');
    if (!list || !quotaText) return;

    list.innerHTML = '';
    const player = state.players[queueItem.playerId];
    const chosen = { lumber: 0, brick: 0, wool: 0, grain: 0, ore: 0 };

    function refreshDiscardView() {
      const totalChosen = Object.values(chosen).reduce((a, b) => a + b, 0);
      quotaText.textContent = currentLang === 'fa'
        ? `باید ${queueItem.count} کارت بسوزانید (${totalChosen} از ${queueItem.count} انتخاب شده)`
        : `Must discard ${queueItem.count} cards (${totalChosen} of ${queueItem.count} selected)`;
      
      confirmBtn.disabled = totalChosen !== queueItem.count;
    }

    ['lumber', 'brick', 'wool', 'grain', 'ore'].forEach(resKey => {
      const have = player.resources[resKey] || 0;
      if (have <= 0) return;

      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.justifyContent = 'space-between';
      row.style.alignItems = 'center';
      row.style.background = 'rgba(255,255,255,0.05)';
      row.style.padding = '6px 12px';
      row.style.borderRadius = '8px';

      const resName = getResourceName(resKey);
      const holdingLabel = currentLang === 'fa' ? `(موجودی: ${have})` : `(In hand: ${have})`;

      row.innerHTML = `
        <div style="font-weight:700;">${resName} <span style="font-size:0.8rem; color:var(--text-muted); font-weight:normal;">${holdingLabel}</span></div>
        <div style="display:flex; gap:8px; align-items:center;">
          <button type="button" class="btn-icon minus-btn" style="width:28px; height:28px;">-</button>
          <span class="count-display" style="font-weight:800; min-width:20px; text-align:center;">0</span>
          <button type="button" class="btn-icon plus-btn" style="width:28px; height:28px;">+</button>
        </div>
      `;

      const minus = row.querySelector('.minus-btn');
      const plus = row.querySelector('.plus-btn');
      const display = row.querySelector('.count-display');

      minus.addEventListener('click', () => {
        if (chosen[resKey] > 0) {
          chosen[resKey]--;
          display.textContent = chosen[resKey];
          refreshDiscardView();
        }
      });

      plus.addEventListener('click', () => {
        const total = Object.values(chosen).reduce((a, b) => a + b, 0);
        if (chosen[resKey] < have && total < queueItem.count) {
          chosen[resKey]++;
          display.textContent = chosen[resKey];
          refreshDiscardView();
        }
      });

      list.appendChild(row);
    });

    confirmBtn.onclick = () => {
      soundEngine.playClick();
      if (gameMode === 'online') {
        sendWsMessage({ type: 'CATAN_DISCARD', resources: chosen });
      } else {
        CatanLogic.discardCards(state, queueItem.playerId, chosen);
        processBotDiscards();
        if (state.phase === 'ROBBER_MOVE') {
          if (isLocalPlayerTurn()) {
            notify(currentLang === 'fa'
              ? '⚠️ کارت‌ها سوزانده شدند. روی یکی از زمین‌های شش‌ضلعی کلیک کنید تا راهزن به آنجا برود.'
              : '⚠️ Cards discarded. Click a hex to relocate the Robber.');
          } else {
            botRelocateRobberAndSteal(state.activePlayer);
          }
        }
      }
      el.modalDiscard.classList.remove('active');
      updateUI();
      checkBotTurn();
    };

    refreshDiscardView();
    el.modalDiscard.classList.add('active');
  }

  function showGameOverModal() {
    if (!state || !el.modalGameover) return;
    const winnerP = state.players[state.winner];
    safePlaySound('playVictoryFanfare');

    const t = I18N[currentLang];
    const title = document.getElementById('gameover-message');
    if (title && winnerP) {
      title.textContent = currentLang === 'fa' 
        ? `${winnerP.name} برنده بازی شد! 🏆` 
        : `${winnerP.name} Wins the Match! 🏆`;
    }
    const sub = document.getElementById('gameover-sub');
    if (sub) {
      sub.textContent = t.gameOverSub;
    }
    el.modalGameover.classList.add('active');
  }

  // =========================================================================
  // 11. WEBSOCKET MULTIPLAYER CONTROLLER
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
        const msg = JSON.parse(event.data);
        handleWsMessage(msg);
      } catch (e) {
        console.error('WS Error:', e);
      }
    };

    ws.onclose = () => {
      notify(currentLang === 'fa' ? 'ارتباط با سرور قطع شد.' : 'Connection lost.');
    };
  }

  function sendWsMessage(msg) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }

  function handleWsMessage(msg) {
    if (msg.type === 'ROOM_CREATED' || msg.type === 'ROOM_JOINED') {
      roomCode = msg.roomCode;
      gameMode = 'online';
      mySeat = msg.seat !== undefined ? msg.seat : 0;
      window.location.hash = roomCode;
    } else if (msg.type === 'LOBBY_UPDATE') {
      renderLobbyView(msg);
    } else if (msg.type === 'GAME_STARTED') {
      gameMode = 'online';
      timeControl = msg.timeControl || 0;
      mySeat = msg.yourSeat !== undefined ? msg.yourSeat : mySeat;
      closeAllModals();
      startTurnCountdown();
    } else if (msg.type === 'CATAN_STATE_UPDATE') {
      gameMode = 'online';
      const needsRender = !state || !document.querySelector('.hex-polygon');
      state = msg.state;
      if (needsRender) {
        renderBoardBase();
        resetPanZoom();
      }
      closeAllModals();
      if (msg.lastDice) {
        updateDiceVisual(msg.lastDice[0], msg.lastDice[1]);
      }
      updateUI();
      if (state.winner !== null) showGameOverModal();
    } else if (msg.type === 'CHAT') {
      appendChatMessage(msg.sender, msg.text);
    } else if (msg.type === 'ERROR') {
      notify(msg.message);
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

    if (el.lobbyNameInput) el.lobbyNameInput.value = localPlayerName;

    // Render 4 Seats
    if (el.lobbySeatsContainer && currentLobbySeats) {
      el.lobbySeatsContainer.innerHTML = '';
      const t = I18N[currentLang];

      currentLobbySeats.forEach((seat, idx) => {
        const isMe = idx === mySeat || seat.isMe;
        const isBot = !!seat.isBot;
        const isSeatHost = !!seat.isHost;
        const isOnline = isBot ? true : !!seat.isOnline;

        const card = document.createElement('div');
        card.className = `lobby-seat-card ${isMe ? 'is-you' : ''}`;

        const colorHex = ['#ef4444', '#3b82f6', '#f97316', '#22c55e'][idx] || '#f5c518';

        const info = document.createElement('div');
        info.innerHTML = `
          <div style="display:flex; align-items:center; gap:6px;">
            <div class="lobby-seat-color-dot" style="background:${colorHex};"></div>
            <span style="font-weight:800; color:${colorHex};">${seat.name}</span>
            ${isSeatHost ? '👑' : ''}
            ${isMe ? `<span style="font-size:0.75rem; color:var(--gold-primary);">${t.youBadge}</span>` : ''}
          </div>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
            ${isBot ? t.botBadge : (isOnline ? t.onlineBadge : t.offlineBadge)}
          </div>
        `;
        card.appendChild(info);

        if (isBot && !isMe) {
          const btnClaim = document.createElement('button');
          btnClaim.className = 'btn-seat-action';
          btnClaim.textContent = t.takeSeatBtn;
          btnClaim.addEventListener('click', (e) => {
            e.stopPropagation();
            sendWsMessage({ type: 'CLAIM_SEAT', seat: idx, playerName: localPlayerName });
          });
          card.appendChild(btnClaim);
        }

        el.lobbySeatsContainer.appendChild(card);
      });
    }

    if (isHost) {
      if (el.btnStartOnlineGame) el.btnStartOnlineGame.style.display = 'inline-flex';
      if (el.btnSwapCatanSeats) el.btnSwapCatanSeats.style.display = 'inline-flex';
      if (el.lobbyWaitingMsg) el.lobbyWaitingMsg.style.display = 'none';
    } else {
      if (el.btnStartOnlineGame) el.btnStartOnlineGame.style.display = 'none';
      if (el.btnSwapCatanSeats) el.btnSwapCatanSeats.style.display = 'none';
      if (el.lobbyWaitingMsg) el.lobbyWaitingMsg.style.display = 'block';
    }
  }

  function appendChatMessage(sender, text) {
    const list = document.getElementById('chat-messages');
    if (!list) return;
    const msg = document.createElement('div');
    msg.className = 'chat-msg';
    msg.innerHTML = `<div class="sender">${sender}</div><div>${text}</div>`;
    list.appendChild(msg);
    list.scrollTop = list.scrollHeight;
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  }

  // =========================================================================
  // 12. GAME START & EVENT LISTENERS
  // =========================================================================
  function startSoloMatch(playerCount = 3) {
    gameMode = 'solo';
    closeAllModals();

    const names = [localPlayerName];
    for (let i = 2; i <= playerCount; i++) names.push(`Bot ${i}`);

    state = CatanLogic.createInitialState(playerCount, names);
    renderBoardBase();
    resetPanZoom();
    updateUI();
    startTurnCountdown();

    const resumeBtn = document.getElementById('btn-menu-resume');
    if (resumeBtn) resumeBtn.style.display = 'block';

    checkBotTurn();
  }

  function startPassPlayMatch(playerCount = 3) {
    gameMode = 'passplay';
    closeAllModals();

    const names = [];
    for (let i = 1; i <= playerCount; i++) names.push(`Player ${i}`);

    state = CatanLogic.createInitialState(playerCount, names);
    renderBoardBase();
    resetPanZoom();
    updateUI();
    startTurnCountdown();

    const resumeBtn = document.getElementById('btn-menu-resume');
    if (resumeBtn) resumeBtn.style.display = 'block';
  }

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

    if (el.modalMultiplayer) el.modalMultiplayer.classList.add('active');
  }

  function openDevCardsModal() {
    soundEngine.playClick();
    const list = document.getElementById('my-dev-cards-list');
    if (!list || !state) return;
    list.innerHTML = '';

    const localViewer = state.players[getLocalViewerSeat()];
    if (!localViewer || localViewer.devCards.length === 0) {
      list.innerHTML = `<div style="text-align:center; padding:16px; color:var(--text-muted); font-size:0.9rem;">${currentLang === 'fa' ? 'هیچ کارت شانسی در دست ندارید.' : 'No development cards in hand.'}</div>`;
      if (el.modalDevcards) el.modalDevcards.classList.add('active');
      return;
    }

    const canPlayCard = isLocalPlayerTurn() && state.phase === 'PLAYING_TURN' && !state.devCardPlayedThisTurn;

    localViewer.devCards.forEach((card, idx) => {
      const row = document.createElement('div');
      row.className = 'dev-card-row';

      let icon = '📜';
      let title = card.type;
      let desc = '';

      if (card.type === 'knight') {
        icon = '⚔️';
        title = currentLang === 'fa' ? 'شوالیه (Knight)' : 'Knight';
        desc = currentLang === 'fa' ? 'جابجایی راهزن و سرقت منبع (+بزرگترین ارتش)' : 'Move robber and steal resource (+Largest Army)';
      } else if (card.type === 'road_building') {
        icon = '🛣️';
        title = currentLang === 'fa' ? 'جاده‌سازی (Road Building)' : 'Road Building';
        desc = currentLang === 'fa' ? 'ساخت رایگان ۲ جاده جدید' : 'Build 2 free roads';
      } else if (card.type === 'year_of_plenty') {
        icon = '🌾';
        title = currentLang === 'fa' ? 'وفور نعمت (Year of Plenty)' : 'Year of Plenty';
        desc = currentLang === 'fa' ? 'دریافت ۲ کارت منبع دلخواه از بانک' : 'Take 2 resources of choice from bank';
      } else if (card.type === 'monopoly') {
        icon = '💰';
        title = currentLang === 'fa' ? 'انحصار (Monopoly)' : 'Monopoly';
        desc = currentLang === 'fa' ? 'تصاحب تمام کارت‌های یک منبع از همه بازیکنان' : 'Claim all of 1 resource from opponents';
      } else if (card.type === 'victory_point') {
        icon = '⭐';
        title = currentLang === 'fa' ? 'امتیاز پیروزی (+1 VP)' : 'Victory Point (+1 VP)';
        desc = currentLang === 'fa' ? 'امتیاز پنهان تا پایان بازی' : 'Hidden victory point';
      }

      row.innerHTML = `
        <div class="dev-card-info">
          <span class="dev-card-icon">${icon}</span>
          <div>
            <div style="font-weight:800; color:#fff;">${title}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${desc}</div>
          </div>
        </div>
      `;

      if (card.type !== 'victory_point' && canPlayCard) {
        const playBtn = document.createElement('button');
        playBtn.className = 'btn-secondary';
        playBtn.textContent = currentLang === 'fa' ? 'بازی کردن' : 'Play';
        playBtn.addEventListener('click', () => {
          handlePlayDevCard(card.type, idx);
          if (el.modalDevcards) el.modalDevcards.classList.remove('active');
        });
        row.appendChild(playBtn);
      }

      list.appendChild(row);
    });

    if (el.modalDevcards) el.modalDevcards.classList.add('active');
  }

  function handlePlayDevCard(cardType, cardIdx) {
    if (!state || !isLocalPlayerTurn() || state.phase !== 'PLAYING_TURN' || state.devCardPlayedThisTurn) return;

    soundEngine.playClick();
    const p = state.players[state.activePlayer];
    p.devCards.splice(cardIdx, 1);
    state.devCardPlayedThisTurn = true;

    if (cardType === 'knight') {
      p.playedKnights++;
      notify(currentLang === 'fa' ? 'کارت شوالیه بازی شد! راهزن را جابجا کنید.' : 'Knight played! Move the robber.');
      state.phase = 'ROBBER_MOVE';
      updateUI();
    } else if (cardType === 'road_building') {
      buildMode = 'ROAD';
      notify(currentLang === 'fa' ? 'کارت جاده‌سازی: ۲ جاده بسازید.' : 'Road building: build 2 roads.');
      updateUI();
    } else if (cardType === 'year_of_plenty') {
      p.resources.grain = (p.resources.grain || 0) + 1;
      p.resources.ore = (p.resources.ore || 0) + 1;
      soundEngine.playResourceChime();
      notify(currentLang === 'fa' ? '۲ منبع از بانک دریافت شد!' : 'Received 2 resources from bank!');
      updateUI();
    } else if (cardType === 'monopoly') {
      let stolenTotal = 0;
      state.players.forEach(otherP => {
        if (otherP.id !== p.id && otherP.resources.grain > 0) {
          stolenTotal += otherP.resources.grain;
          otherP.resources.grain = 0;
        }
      });
      p.resources.grain = (p.resources.grain || 0) + stolenTotal;
      soundEngine.playResourceChime();
      notify(currentLang === 'fa' ? `کارت انحصار: ${stolenTotal} گندم از حریفان دریافت شد!` : `Monopoly: claimed ${stolenTotal} grain!`);
      updateUI();
    }
  }

  function setupEventListeners() {
    // Top Bar Actions
    if (el.btnSound) el.btnSound.addEventListener('click', toggleSound);
    if (el.btnLang) el.btnLang.addEventListener('click', toggleLanguage);
    if (el.btnRules) el.btnRules.addEventListener('click', () => {
      soundEngine.playClick();
      if (el.modalRules) el.modalRules.classList.add('active');
    });
    if (el.btnChat) el.btnChat.addEventListener('click', () => {
      soundEngine.playClick();
      if (el.chatDrawer) el.chatDrawer.classList.toggle('open');
    });
    if (el.btnMenu) el.btnMenu.addEventListener('click', () => {
      soundEngine.playClick();
      if (el.modalMainMenu) el.modalMainMenu.classList.add('active');
    });
    if (el.btnMobileNav) el.btnMobileNav.addEventListener('click', () => {
      if (el.mobileNavDropdown) el.mobileNavDropdown.classList.toggle('active');
    });

    // Mobile nav triggers
    const mobSound = document.getElementById('btn-mob-sound');
    if (mobSound) mobSound.addEventListener('click', () => {
      toggleSound();
      if (el.mobileNavDropdown) el.mobileNavDropdown.classList.remove('active');
    });
    const mobLang = document.getElementById('btn-mob-lang');
    if (mobLang) mobLang.addEventListener('click', () => {
      toggleLanguage();
      if (el.mobileNavDropdown) el.mobileNavDropdown.classList.remove('active');
    });
    const mobRules = document.getElementById('btn-mob-rules');
    if (mobRules) mobRules.addEventListener('click', () => {
      if (el.modalRules) el.modalRules.classList.add('active');
      if (el.mobileNavDropdown) el.mobileNavDropdown.classList.remove('active');
    });
    const mobMenu = document.getElementById('btn-mob-menu');
    if (mobMenu) mobMenu.addEventListener('click', () => {
      if (el.modalMainMenu) el.modalMainMenu.classList.add('active');
      if (el.mobileNavDropdown) el.mobileNavDropdown.classList.remove('active');
    });

    // Main Menu Buttons
    const btnSolo = document.getElementById('btn-menu-solo');
    if (btnSolo) btnSolo.addEventListener('click', () => {
      soundEngine.playClick();
      if (el.modalMainMenu) el.modalMainMenu.classList.remove('active');
      if (el.modalSetup) {
        el.modalSetup.dataset.targetMode = 'solo';
        const titleEl = document.getElementById('setup-modal-title');
        if (titleEl) {
          titleEl.setAttribute('data-i18n', 'soloSetupTitle');
          titleEl.textContent = I18N[currentLang].soloSetupTitle;
        }
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
        const titleEl = document.getElementById('setup-modal-title');
        if (titleEl) {
          titleEl.setAttribute('data-i18n', 'passplaySetupTitle');
          titleEl.textContent = I18N[currentLang].passplaySetupTitle;
        }
        const aiGroup = document.getElementById('ai-difficulty-group');
        if (aiGroup) aiGroup.style.display = 'none';
        el.modalSetup.classList.add('active');
      }
    });

    const btnOnline = document.getElementById('btn-menu-online');
    if (btnOnline) btnOnline.addEventListener('click', () => {
      soundEngine.playClick();
      if (el.modalMainMenu) el.modalMainMenu.classList.remove('active');
      openMultiplayerModal();
    });

    const btnMenuRules = document.getElementById('btn-menu-rules');
    if (btnMenuRules) btnMenuRules.addEventListener('click', () => {
      soundEngine.playClick();
      if (el.modalRules) el.modalRules.classList.add('active');
    });

    const btnResume = document.getElementById('btn-menu-resume');
    if (btnResume) btnResume.addEventListener('click', () => {
      soundEngine.playClick();
      if (el.modalMainMenu) el.modalMainMenu.classList.remove('active');
    });

    // Setup Modal Buttons
    const btnCloseSetup = document.getElementById('btn-close-setup');
    if (btnCloseSetup) btnCloseSetup.addEventListener('click', () => {
      soundEngine.playClick();
      if (el.modalSetup) el.modalSetup.classList.remove('active');
      if (el.modalMainMenu) el.modalMainMenu.classList.add('active');
    });

    const btnSetupBack = document.getElementById('btn-setup-back');
    if (btnSetupBack) btnSetupBack.addEventListener('click', () => {
      soundEngine.playClick();
      if (el.modalSetup) el.modalSetup.classList.remove('active');
      if (el.modalMainMenu) el.modalMainMenu.classList.add('active');
    });

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

    const btnStartConfigured = document.getElementById('btn-start-configured-game');
    if (btnStartConfigured) btnStartConfigured.addEventListener('click', () => {
      soundEngine.playClick();
      const activePBtn = document.querySelector('#setup-players-options .option-btn.active');
      const count = activePBtn ? parseInt(activePBtn.dataset.players, 10) : 3;

      const activeTimerBtn = document.querySelector('#setup-timer-options .option-btn.active');
      timeControl = activeTimerBtn ? parseInt(activeTimerBtn.dataset.timer, 10) : 0;

      const targetMode = el.modalSetup.dataset.targetMode || 'solo';
      if (targetMode === 'solo') {
        startSoloMatch(count);
      } else {
        startPassPlayMatch(count);
      }
    });

    // In-Game Action Buttons
    if (el.btnRollDice) el.btnRollDice.addEventListener('click', handleRollDice);
    if (el.diceBox) {
      el.diceBox.style.cursor = 'pointer';
      el.diceBox.addEventListener('click', handleRollDice);
    }

    if (el.btnBuildRoad) el.btnBuildRoad.addEventListener('click', () => {
      soundEngine.playClick();
      if (!state || !isLocalPlayerTurn()) return;
      const inSetup = state.phase.startsWith('SETUP');
      const localViewer = state.players[getLocalViewerSeat()];
      if (!hasResourcesForRoad(localViewer, inSetup)) {
        notify(currentLang === 'fa'
          ? `⚠️ منابع کافی نیست! ساخت جاده: ۱ چوب + ۱ آجر (موجودی شما: ${localViewer.resources.lumber} چوب، ${localViewer.resources.brick} آجر)`
          : `⚠️ Not enough resources! Road costs 1 Lumber + 1 Brick (You have: ${localViewer.resources.lumber} Lumber, ${localViewer.resources.brick} Brick)`);
        return;
      }
      buildMode = (buildMode === 'ROAD') ? null : 'ROAD';
      updateUI();
    });

    if (el.btnBuildSettlement) el.btnBuildSettlement.addEventListener('click', () => {
      soundEngine.playClick();
      if (!state || !isLocalPlayerTurn()) return;
      const inSetup = state.phase.startsWith('SETUP');
      const localViewer = state.players[getLocalViewerSeat()];
      if (!hasResourcesForSettlement(localViewer, inSetup)) {
        notify(currentLang === 'fa'
          ? `⚠️ منابع کافی نیست! ساخت روستا: ۱ چوب + ۱ آجر + ۱ گوسفند + ۱ گندم`
          : `⚠️ Not enough resources! Settlement costs 1 Lumber + 1 Brick + 1 Wool + 1 Grain`);
        return;
      }
      buildMode = (buildMode === 'SETTLEMENT') ? null : 'SETTLEMENT';
      updateUI();
    });

    if (el.btnBuildCity) el.btnBuildCity.addEventListener('click', () => {
      soundEngine.playClick();
      if (!state || !isLocalPlayerTurn()) return;
      const localViewer = state.players[getLocalViewerSeat()];
      if (!hasResourcesForCity(localViewer)) {
        notify(currentLang === 'fa'
          ? `⚠️ منابع کافی نیست! ارتقا به شهر: ۲ گندم + ۳ سنگ (روی یکی از روستاهای موجود)`
          : `⚠️ Not enough resources! City upgrade costs 2 Grain + 3 Ore`);
        return;
      }
      buildMode = (buildMode === 'CITY') ? null : 'CITY';
      updateUI();
    });

    if (el.btnBuyDev) el.btnBuyDev.addEventListener('click', () => {
      if (!state || !isLocalPlayerTurn()) return;
      soundEngine.playClick();
      const localViewer = state.players[getLocalViewerSeat()];
      if (!CatanLogic.canBuyDevCard(state, localViewer.id)) {
        notify(currentLang === 'fa'
          ? `⚠️ منابع کافی نیست! خرید کارت شانس: ۱ گوسفند + ۱ گندم + ۱ سنگ`
          : `⚠️ Not enough resources! Dev card costs 1 Wool + 1 Grain + 1 Ore`);
        return;
      }
      if (gameMode === 'online') {
        sendWsMessage({ type: 'CATAN_BUY_DEV' });
      } else {
        const res = CatanLogic.buyDevCard(state, state.activePlayer);
        if (res.valid) {
          safePlaySound('playCardWhoosh');
          notify(currentLang === 'fa' ? `یک کارت شانس خریداری شد!` : `Bought a Development Card!`);
          updateUI();
        }
      }
    });

    if (el.btnMyDevs) el.btnMyDevs.addEventListener('click', openDevCardsModal);
    const btnCloseDevs = document.getElementById('btn-close-devs');
    if (btnCloseDevs) btnCloseDevs.addEventListener('click', () => {
      soundEngine.playClick();
      if (el.modalDevcards) el.modalDevcards.classList.remove('active');
    });

    if (el.btnMultiplayer) el.btnMultiplayer.addEventListener('click', () => {
      soundEngine.playClick();
      openMultiplayerModal();
    });

    const btnMobMultiplayer = document.getElementById('btn-mob-multiplayer');
    if (btnMobMultiplayer) btnMobMultiplayer.addEventListener('click', () => {
      soundEngine.playClick();
      if (el.mobileNavDropdown) el.mobileNavDropdown.classList.remove('active');
      openMultiplayerModal();
    });
    if (el.btnCancelPlacement) el.btnCancelPlacement.addEventListener('click', () => {
      soundEngine.playClick();
      buildMode = null;
      updateUI();
    });
    if (el.btnTrade) el.btnTrade.addEventListener('click', openTradeModal);
    if (el.btnEndTurn) el.btnEndTurn.addEventListener('click', handleEndTurn);
    if (el.btnQuickEndTurn) el.btnQuickEndTurn.addEventListener('click', () => {
      soundEngine.playClick();
      handleEndTurn();
    });

    // Keyboard Shortcuts (Space / Enter to roll dice or end turn)
    window.addEventListener('keydown', (e) => {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) return;
      const anyActiveModal = document.querySelector('.modal-overlay.active');
      if (anyActiveModal) return;

      if (!state || !isLocalPlayerTurn()) return;
      e.preventDefault();

      if (state.phase === 'ROLL_DICE') {
        handleRollDice();
      } else if (state.phase === 'PLAYING_TURN') {
        handleEndTurn();
      }
    });

    // Trade Modal Controls
    const btnCloseTrade = document.getElementById('btn-close-trade');
    if (btnCloseTrade) btnCloseTrade.addEventListener('click', closeTradeModal);

    const giveBtns = document.querySelectorAll('#trade-give-selector .trade-res-btn');
    giveBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        soundEngine.playClick();
        giveBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        tradeGiveRes = btn.dataset.res;
        updateTradeRateDisplay();
      });
    });

    const getBtns = document.querySelectorAll('#trade-get-selector .trade-res-btn');
    getBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        soundEngine.playClick();
        getBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        tradeGetRes = btn.dataset.res;
      });
    });

    const btnExecTrade = document.getElementById('btn-execute-bank-trade');
    if (btnExecTrade) btnExecTrade.addEventListener('click', () => {
      if (!state || !isLocalPlayerTurn()) return;
      if (tradeGiveRes === tradeGetRes) {
        notify(currentLang === 'fa' ? 'نمی‌توانید همان منبع را تبادل کنید!' : 'Cannot trade same resource!');
        return;
      }
      soundEngine.playClick();
      if (gameMode === 'online') {
        sendWsMessage({ type: 'CATAN_BANK_TRADE', giveResource: tradeGiveRes, getResource: tradeGetRes });
      } else {
        const res = CatanLogic.bankTrade(state, state.activePlayer, tradeGiveRes, tradeGetRes);
        if (res.valid) {
          safePlaySound('playResourceChime');
          notify(currentLang === 'fa' ? 'تبادل با بانک با موفقیت انجام شد!' : 'Bank trade executed successfully!');
          closeTradeModal();
          updateUI();
        } else {
          notify(res.message);
        }
      }
    });

    // Multiplayer Lobby Controls
    if (el.btnSaveLobbyName) {
      el.btnSaveLobbyName.addEventListener('click', () => {
        soundEngine.playClick();
        saveUniversalPlayerName(el.lobbyNameInput ? el.lobbyNameInput.value : '');
      });
    }

    const btnCloseMpH = document.getElementById('btn-close-mp-header');
    if (btnCloseMpH) btnCloseMpH.addEventListener('click', () => {
      soundEngine.playClick();
      if (el.modalMultiplayer) el.modalMultiplayer.classList.remove('active');
      if (el.modalMainMenu) el.modalMainMenu.classList.add('active');
    });

    const btnCloseMp = document.getElementById('btn-close-mp');
    if (btnCloseMp) btnCloseMp.addEventListener('click', () => {
      soundEngine.playClick();
      if (el.modalMultiplayer) el.modalMultiplayer.classList.remove('active');
      if (el.modalMainMenu) el.modalMainMenu.classList.add('active');
    });

    const btnCreateRoom = document.getElementById('btn-create-room');
    if (btnCreateRoom) btnCreateRoom.addEventListener('click', () => {
      soundEngine.playClick();
      const pBtn = document.querySelector('#online-players-options .option-btn.active');
      const pCount = pBtn ? parseInt(pBtn.dataset.players, 10) : 3;
      const tBtn = document.querySelector('#online-timer-options .option-btn.active');
      const tVal = tBtn ? parseInt(tBtn.dataset.timer, 10) : 60;
      connectWebSocket(() => {
        sendWsMessage({
          type: 'CREATE_ROOM',
          gameType: 'catan',
          playerName: localPlayerName,
          settings: { playerCount: pCount, timeControl: tVal }
        });
      });
    });

    const btnShowJoin = document.getElementById('btn-show-join');
    if (btnShowJoin) btnShowJoin.addEventListener('click', () => {
      soundEngine.playClick();
      const joinFields = document.getElementById('mp-join-fields');
      if (joinFields) joinFields.style.display = 'block';
    });

    const btnConfirmJoin = document.getElementById('btn-confirm-join');
    if (btnConfirmJoin) btnConfirmJoin.addEventListener('click', () => {
      const codeInput = document.getElementById('input-room-code');
      const code = codeInput ? codeInput.value.trim().toUpperCase() : '';
      if (!code) return;
      soundEngine.playClick();
      connectWebSocket(() => {
        sendWsMessage({
          type: 'JOIN_ROOM',
          roomCode: code,
          playerName: localPlayerName
        });
      });
    });

    if (el.btnCopyRoomLink) el.btnCopyRoomLink.addEventListener('click', () => {
      soundEngine.playClick();
      const url = `${window.location.origin}/games/catan/#${roomCode}`;
      navigator.clipboard.writeText(url).then(() => {
        notify(I18N[currentLang].linkCopied);
      });
    });

    if (el.btnStartOnlineGame) el.btnStartOnlineGame.addEventListener('click', () => {
      soundEngine.playClick();
      sendWsMessage({ type: 'START_GAME' });
    });

    if (el.btnSwapCatanSeats) el.btnSwapCatanSeats.addEventListener('click', () => {
      soundEngine.playClick();
      sendWsMessage({ type: 'SWAP_SEATS' });
    });

    if (el.btnLeaveRoom) el.btnLeaveRoom.addEventListener('click', () => {
      soundEngine.playClick();
      window.location.hash = '';
      window.location.reload();
    });

    // Chat Form
    const chatForm = document.getElementById('chat-form');
    if (chatForm) chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('chat-input');
      if (!input || !input.value.trim()) return;
      const text = input.value.trim();
      input.value = '';
      if (gameMode === 'online') {
        sendWsMessage({ type: 'CHAT', text });
      } else {
        appendChatMessage(localPlayerName, text);
      }
    });

    const btnCloseChat = document.getElementById('btn-close-chat');
    if (btnCloseChat) btnCloseChat.addEventListener('click', () => {
      soundEngine.playClick();
      if (el.chatDrawer) el.chatDrawer.classList.remove('open');
    });

    const btnCloseRules = document.getElementById('btn-close-rules');
    if (btnCloseRules) btnCloseRules.addEventListener('click', () => {
      soundEngine.playClick();
      if (el.modalRules) el.modalRules.classList.remove('active');
    });

    // Game Over Rematch
    const btnRematch = document.getElementById('btn-gameover-rematch');
    if (btnRematch) btnRematch.addEventListener('click', () => {
      soundEngine.playClick();
      if (el.modalGameover) el.modalGameover.classList.remove('active');
      startSoloMatch(3);
    });

    const btnGoMenu = document.getElementById('btn-gameover-menu');
    if (btnGoMenu) btnGoMenu.addEventListener('click', () => {
      soundEngine.playClick();
      if (el.modalGameover) el.modalGameover.classList.remove('active');
      if (el.modalMainMenu) el.modalMainMenu.classList.add('active');
    });
  }

  // =========================================================================
  // 13. ENTRY POINT
  // =========================================================================
  function init() {
    cacheElements();
    applyLanguage(currentLang);
    setupEventListeners();
    setupBoardPanZoom();

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
