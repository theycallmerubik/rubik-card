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
      tabBankTrade: '🏦 بانک و بنادر',
      tabPlayerTrade: '🤝 معامله با بازیکنان',
      tradeYouGive: 'منابعی که می‌دهید:',
      tradeYouWant: 'منابعی که می‌خواهید:',
      tradeTargetLabel: 'طرف معامله:',
      tradeTargetAll: 'همه بازیکنان (پیشنهاد عمومی)',
      proposeTradeBtn: 'ارسال پیشنهاد معامله',
      monopolyPrompt: 'منبع مورد نظر برای انحصار را انتخاب کنید:',
      confirmMonopolyBtn: 'اجرای کارت انحصار',
      yopPrompt: '۲ کارت منبع دلخواه از بانک را انتخاب کنید:',
      confirmYopBtn: 'دریافت منابع',
      acceptTradeBtn: 'قبول پیشنهاد',
      declineTradeBtn: 'رد پیشنهاد',
      cancelOfferBtn: 'لغو پیشنهاد',
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
      tabBankTrade: '🏦 Bank & Ports',
      tabPlayerTrade: '🤝 Player Trading',
      tradeYouGive: 'You Give:',
      tradeYouWant: 'You Want:',
      tradeTargetLabel: 'Trade With:',
      tradeTargetAll: 'All Players (Open Offer)',
      proposeTradeBtn: 'Propose Trade',
      monopolyPrompt: 'Choose resource to monopolize:',
      confirmMonopolyBtn: 'Monopolize Resource',
      yopPrompt: 'Select 2 resources from bank:',
      confirmYopBtn: 'Take Resources',
      acceptTradeBtn: 'Accept Offer',
      declineTradeBtn: 'Decline Offer',
      cancelOfferBtn: 'Cancel Offer',
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
  let activeTradeTab = 'bank'; // 'bank' | 'player'
  let playerTradeGive = { lumber: 0, brick: 0, wool: 0, grain: 0, ore: 0 };
  let playerTradeWant = { lumber: 0, brick: 0, wool: 0, grain: 0, ore: 0 };
  let monopolySelectedRes = 'lumber';
  let yopSelectedCounts = { lumber: 0, brick: 0, wool: 0, grain: 0, ore: 0 };
  let freeRoadsLeft = 0;
  let activePlayingDevIdx = null;
  let infoDensity = localStorage.getItem('catan_density') || 'standard';
  let rollHistory = [];
  let rollCounts = { 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0, 11:0, 12:0 };
  let selectedInspectorTarget = null; // { type: 'tile'|'vertex'|'edge', id: number }
  let mapEditorHistory = [];
  let mapEditorRedoStack = [];
  let currentEditorMap = null;
  let currentEditorBrush = 'forest';
  let currentEditorToken = 6;
  let pendingGhostPlacement = null; // tap-to-confirm ghost preview
  let previousTurnPlayer = null;
  let previousTurnPhase = null;
  let pendingBotTradeCallback = null;
  let botTradeAutoTimeout = null;
  let botTurnWatchdog = null;


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
    el.devDeckDock = document.getElementById('dev-deck-dock');
    el.devDeckCount = document.getElementById('dev-deck-count');
    el.devDeckStack = document.getElementById('dev-deck-stack');
    el.btnBuyDevDeck = document.getElementById('btn-buy-dev-deck');
    el.buyDeckReason = document.getElementById('buy-deck-reason');
    el.localDevCardsList = document.getElementById('local-dev-cards-list');
    el.opponentsDevTrays = document.getElementById('opponents-dev-trays');
    el.localDevCount = document.getElementById('local-dev-count');

    el.btnToggleHistogram = document.getElementById('btn-toggle-histogram');
    el.diceHistogramPanel = document.getElementById('dice-histogram-panel');
    el.histogramBarsContainer = document.getElementById('histogram-bars-container');
    el.totalRollsCount = document.getElementById('total-rolls-count');

    el.bankStockCard = document.getElementById('bank-stock-card');
    el.bankStockGrid = document.getElementById('bank-stock-grid');
    el.buildCostsCard = document.getElementById('build-costs-card');
    el.btnToggleCosts = document.getElementById('btn-toggle-costs');
    el.buildCostsBody = document.getElementById('build-costs-body');

    // Activity & Chat Hub
    el.activityHubPanel = document.getElementById('activity-hub-panel');
    el.btnToggleActivityHub = document.getElementById('btn-toggle-activity-hub');
    el.btnCloseActivity = document.getElementById('btn-close-activity');
    el.tabBtnLog = document.getElementById('tab-btn-log');
    el.tabBtnChat = document.getElementById('tab-btn-chat');
    el.unreadChatDot = document.getElementById('unread-chat-dot');
    el.activityViewLog = document.getElementById('activity-view-log');
    el.activityViewChat = document.getElementById('activity-view-chat');
    el.gameLogStream = document.getElementById('game-log-stream');
    el.sideChatMessages = document.getElementById('side-chat-messages');
    el.sideChatForm = document.getElementById('side-chat-form');
    el.sideChatInput = document.getElementById('side-chat-input');
    el.sideChatSend = document.getElementById('side-chat-send');

    // Incoming Trade Offer Modal
    el.modalTradeOffer = document.getElementById('modal-trade-offer');
    el.tradeOfferTitle = document.getElementById('trade-offer-title');
    el.tradeOfferProposer = document.getElementById('trade-offer-proposer');
    el.tradeOfferGives = document.getElementById('trade-offer-gives');
    el.tradeOfferWants = document.getElementById('trade-offer-wants');
    el.btnAcceptTradeOffer = document.getElementById('btn-accept-trade-offer');
    el.btnDeclineTradeOffer = document.getElementById('btn-decline-trade-offer');
    el.btnCloseTradeOffer = document.getElementById('btn-close-trade-offer');

    el.modalCardDetail = document.getElementById('modal-card-detail');
    el.cardDetailTitle = document.getElementById('card-detail-title');
    el.cardDetailSvgUse = document.getElementById('card-detail-svg-use');
    el.cardDetailType = document.getElementById('card-detail-type');
    el.cardDetailRules = document.getElementById('card-detail-rules');
    el.cardDetailState = document.getElementById('card-detail-state');
    el.cardDetailReason = document.getElementById('card-detail-reason');
    el.btnPlayCardConfirm = document.getElementById('btn-play-card-confirm');
    el.btnCloseCardDetail = document.getElementById('btn-close-card-detail');

    el.btnOpenEditor = document.getElementById('btn-open-editor');
    el.modalMapEditor = document.getElementById('modal-map-editor');
    el.btnCloseEditor = document.getElementById('btn-close-editor');
    el.editorTemplateSelect = document.getElementById('editor-template-select');
    el.editorBoardSvg = document.getElementById('editor-board-svg');
    el.editorSvgOcean = document.getElementById('editor-svg-ocean');
    el.editorSvgTiles = document.getElementById('editor-svg-tiles');
    el.editorValStatus = document.getElementById('editor-val-status');
    el.editorStatsSummary = document.getElementById('editor-stats-summary');
    el.btnEditorUndo = document.getElementById('btn-editor-undo');
    el.btnEditorRedo = document.getElementById('btn-editor-redo');
    el.btnEditorAutofix = document.getElementById('btn-editor-autofix');
    el.btnEditorSaveDraft = document.getElementById('btn-editor-save-draft');
    el.btnEditorDuplicate = document.getElementById('btn-editor-duplicate');
    el.btnEditorPlayMap = document.getElementById('btn-editor-play-map');
    el.btnEditorClose = document.getElementById('btn-editor-close');

    el.btnBoardSummary = document.getElementById('btn-board-summary');
    el.modalBoardSummary = document.getElementById('modal-board-summary');
    el.btnCloseSummary = document.getElementById('btn-close-summary');
    el.boardSummaryContent = document.getElementById('board-summary-content');

    el.lobbyRuleProfileSelect = document.getElementById('lobby-rule-profile-select');
    el.lobbyPlayerCountSelect = document.getElementById('lobby-player-count-select');
    el.lobbySeedInput = document.getElementById('lobby-seed-input');
    el.btnLobbyRandomSeed = document.getElementById('btn-lobby-random-seed');
    el.btnLobbyCopySeed = document.getElementById('btn-lobby-copy-seed');
    el.btnLobbyOpenEditor = document.getElementById('btn-lobby-open-editor');
    el.lobbyPreviewSvg = document.getElementById('lobby-preview-svg');
    el.lobbyPreviewOcean = document.getElementById('lobby-preview-ocean');
    el.lobbyPreviewTiles = document.getElementById('lobby-preview-tiles');
    el.previewStatsPips = document.getElementById('preview-stats-pips');

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
    el.tabBankTrade = document.getElementById('tab-bank-trade');
    el.tabPlayerTrade = document.getElementById('tab-player-trade');
    el.panelBankTrade = document.getElementById('panel-bank-trade');
    el.panelPlayerTrade = document.getElementById('panel-player-trade');
    el.playerTradeActiveOffer = document.getElementById('player-trade-active-offer');
    el.playerTradeOfferSummary = document.getElementById('player-trade-offer-summary');
    el.playerTradeOfferResponses = document.getElementById('player-trade-offer-responses');
    el.playerTradeOfferActions = document.getElementById('player-trade-offer-actions');
    el.playerTradeCreateForm = document.getElementById('player-trade-create-form');
    el.tradeGiveCounters = document.getElementById('trade-give-counters');
    el.tradeWantCounters = document.getElementById('trade-want-counters');
    el.tradeTargetSelect = document.getElementById('trade-target-select');
    el.btnProposePlayerTrade = document.getElementById('btn-propose-player-trade');

    el.modalDevcards = document.getElementById('modal-devcards');
    el.tabDevsHand = document.getElementById('tab-devs-hand');
    el.tabDevsPlayed = document.getElementById('tab-devs-played');
    el.badgeHandCount = document.getElementById('badge-hand-count');
    el.badgePlayedCount = document.getElementById('badge-played-count');
    el.myDevCardsList = document.getElementById('my-dev-cards-list');
    el.myPlayedDevsList = document.getElementById('my-played-devs-list');
    el.modalMonopoly = document.getElementById('modal-monopoly');
    el.btnCloseMonopoly = document.getElementById('btn-close-monopoly');
    el.btnCancelMonopoly = document.getElementById('btn-cancel-monopoly');
    el.monopolyCardsGrid = document.getElementById('monopoly-cards-grid');
    el.modalYop = document.getElementById('modal-yop');
    el.btnCloseYop = document.getElementById('btn-close-yop');
    el.btnCancelYop = document.getElementById('btn-cancel-yop');
    el.btnConfirmYop = document.getElementById('btn-confirm-yop');
    el.yopCountersList = document.getElementById('yop-counters-list');
    el.yopSelectionStatus = document.getElementById('yop-selection-status');
    el.modalDiscard = document.getElementById('modal-discard');
    el.modalSteal = document.getElementById('modal-steal');
    el.modalGameover = document.getElementById('modal-gameover');
    el.gameoverMessage = document.getElementById('gameover-message');
    el.gameoverSub = document.getElementById('gameover-sub');
    el.gameoverScoreboardTable = document.getElementById('gameover-scoreboard-table');
    el.btnGameoverRematch = document.getElementById('btn-gameover-rematch');
    el.btnGameoverMenu = document.getElementById('btn-gameover-menu');
    el.btnGameoverHub = document.getElementById('btn-gameover-hub');
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

  // Activity Log & In-Game Chat Helpers
  function logGameAction(category, text, icon = '📜') {
    if (!el.gameLogStream) return;
    const entry = document.createElement('div');
    entry.className = `log-entry ${category || 'system'}`;
    entry.innerHTML = `<span class="log-icon">${icon}</span><span class="log-text">${text}</span>`;
    el.gameLogStream.appendChild(entry);
    if (el.gameLogStream.children.length > 120) {
      el.gameLogStream.removeChild(el.gameLogStream.children[0]);
    }
    el.gameLogStream.scrollTop = el.gameLogStream.scrollHeight;
  }

  function appendChatMessage(sender, text, isMine = false, isSystem = false) {
    if (!el.sideChatMessages) return;
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${isMine ? 'mine' : ''} ${isSystem ? 'system' : ''}`;
    bubble.innerHTML = isSystem
      ? `<span class="chat-text">${text}</span>`
      : `<span class="chat-sender">${sender}:</span><span class="chat-text">${text}</span>`;
    el.sideChatMessages.appendChild(bubble);
    el.sideChatMessages.scrollTop = el.sideChatMessages.scrollHeight;

    const isChatHidden = (!el.activityHubPanel || el.activityHubPanel.style.display === 'none' || (el.activityViewChat && el.activityViewChat.style.display === 'none'));
    if (isChatHidden && !isMine && el.unreadChatDot) {
      el.unreadChatDot.style.display = 'block';
    }
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
    let pointerDownScreenX = 0;
    let pointerDownScreenY = 0;

    el.boardContainer.addEventListener('pointerdown', (e) => {
      if (e.target.closest('#board-zoom-controls') || e.target.closest('#btn-cancel-placement')) return;

      isPanning = true;
      hasPanned = false;
      pointerDownScreenX = e.clientX;
      pointerDownScreenY = e.clientY;
      startPointerX = e.clientX - panX;
      startPointerY = e.clientY - panY;
      el.boardContainer.classList.add('is-panning');
    });

    window.addEventListener('pointermove', (e) => {
      if (!isPanning) return;
      const totalMoved = Math.hypot(e.clientX - pointerDownScreenX, e.clientY - pointerDownScreenY);
      if (totalMoved > 10) {
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
      if (hasPanned) {
        setTimeout(() => {
          hasPanned = false;
        }, 50);
      } else {
        hasPanned = false;
      }
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
    const bg = (state && state.boardGraph) || CatanLogic.getBoardGraph(state) || CatanLogic.BOARD_GRAPHS.base;

    // Adjust viewBox for board size
    if (el.boardSvg) {
      const isExtended = bg.hexes.length > 19;
      el.boardSvg.setAttribute('viewBox', isExtended ? '-80 -40 680 580' : '-50 0 540 480');
    }

    // 1. Ocean Ports
    if (el.svgOceanPorts) {
      el.svgOceanPorts.innerHTML = '';
      const renderedPorts = new Set();
      bg.vertices.forEach((v) => {
        if (v.port && !renderedPorts.has(v.port)) {
          renderedPorts.add(v.port);
          const angle = Math.atan2(v.y - 240, v.x - 270);
          const px = v.x + 24 * Math.cos(angle);
          const py = v.y + 24 * Math.sin(angle);

          const portGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          portGroup.setAttribute('class', 'harbor-port-group');

          // Pier lines from port dock to vertex
          const pierLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          pierLine.setAttribute('x1', px);
          pierLine.setAttribute('y1', py);
          pierLine.setAttribute('x2', v.x);
          pierLine.setAttribute('y2', v.y);
          pierLine.setAttribute('stroke', '#8b5a2b');
          pierLine.setAttribute('stroke-width', '2.5');
          pierLine.setAttribute('stroke-dasharray', '3 2');
          portGroup.appendChild(pierLine);

          // Harbor Ship and Dock SVG
          const dockUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
          dockUse.setAttribute('href', '#harbor-dock');
          dockUse.setAttribute('x', px - 24);
          dockUse.setAttribute('y', py - 18);
          dockUse.setAttribute('width', 48);
          dockUse.setAttribute('height', 36);
          portGroup.appendChild(dockUse);

          // Port Ratio Badge Box
          const portRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          portRect.setAttribute('x', px - 20);
          portRect.setAttribute('y', py + 10);
          portRect.setAttribute('width', 40);
          portRect.setAttribute('height', 16);
          portRect.setAttribute('rx', 4);
          portRect.setAttribute('fill', '#0f172a');
          portRect.setAttribute('stroke', '#d4af37');
          portRect.setAttribute('stroke-width', '1');
          portGroup.appendChild(portRect);

          // Resource icon inside badge if 2:1
          if (v.port.type !== 'generic') {
            const iconUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
            iconUse.setAttribute('href', `#icon-${v.port.type}`);
            iconUse.setAttribute('x', px - 18);
            iconUse.setAttribute('y', py + 11);
            iconUse.setAttribute('width', 14);
            iconUse.setAttribute('height', 14);
            portGroup.appendChild(iconUse);
          }

          const portText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          portText.setAttribute('x', v.port.type === 'generic' ? px : px + 6);
          portText.setAttribute('y', py + 22);
          portText.setAttribute('text-anchor', 'middle');
          portText.setAttribute('fill', '#ffffff');
          portText.setAttribute('font-size', '10px');
          portText.setAttribute('font-weight', '800');
          portText.textContent = v.port.type === 'generic' ? '3:1' : '2:1';
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
        const terrain = tile ? tile.terrain : 'desert';
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
        poly.setAttribute('class', `hex-polygon terrain-${terrain}`);
        group.appendChild(poly);

        // Inline SVG Terrain Graphic with distinct silhouette & texture
        const terrainUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        terrainUse.setAttribute('href', `#tile-${terrain}`);
        terrainUse.setAttribute('x', hex.x - 50);
        terrainUse.setAttribute('y', hex.y - 58);
        terrainUse.setAttribute('width', 100);
        terrainUse.setAttribute('height', 116);
        terrainUse.setAttribute('class', 'hex-terrain-use');
        group.appendChild(terrainUse);

        // Number Token (if not desert)
        if (tile && tile.number) {
          const tokenG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          tokenG.setAttribute('class', 'number-token-group');
          const isHighProb = tile.number === 6 || tile.number === 8;

          const tokenUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
          tokenUse.setAttribute('href', isHighProb ? '#token-high-prob' : '#token-standard');
          tokenUse.setAttribute('x', hex.x - 20);
          tokenUse.setAttribute('y', hex.y - 20);
          tokenUse.setAttribute('width', 40);
          tokenUse.setAttribute('height', 40);
          tokenG.appendChild(tokenUse);

          const numText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          numText.setAttribute('x', hex.x);
          numText.setAttribute('y', hex.y);
          numText.setAttribute('text-anchor', 'middle');
          numText.setAttribute('dominant-baseline', 'central');
          numText.setAttribute('fill', isHighProb ? '#c0392b' : '#1e293b');
          numText.setAttribute('font-size', isHighProb ? '16px' : '15px');
          numText.setAttribute('font-weight', '900');
          numText.textContent = tile.number;
          tokenG.appendChild(numText);

          const pipsText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          pipsText.setAttribute('x', hex.x);
          pipsText.setAttribute('y', hex.y + 11);
          pipsText.setAttribute('text-anchor', 'middle');
          pipsText.setAttribute('fill', isHighProb ? '#c0392b' : '#475569');
          pipsText.setAttribute('font-size', '10px');
          pipsText.setAttribute('font-weight', '900');
          pipsText.textContent = '•'.repeat(tile.pips || 0);
          tokenG.appendChild(pipsText);

          group.appendChild(tokenG);
        }

        // Bandit Pawn Graphic
        const robberG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        robberG.setAttribute('id', `robber-hex-${hex.id}`);
        robberG.setAttribute('class', 'robber-figure');
        robberG.style.display = tile && tile.hasRobber ? 'block' : 'none';

        const robberUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        robberUse.setAttribute('href', '#piece-bandit');
        robberUse.setAttribute('x', hex.x - 18);
        robberUse.setAttribute('y', hex.y - 22);
        robberUse.setAttribute('width', 36);
        robberUse.setAttribute('height', 44);
        robberG.appendChild(robberUse);
        group.appendChild(robberG);

        // Click handler: Move Robber during ROBBER_MOVE phase
        group.addEventListener('click', (e) => {
          e.stopPropagation();
          if (state && state.phase === 'ROBBER_MOVE' && isLocalPlayerTurn()) {
            handleMoveRobber(hex.id);
          }
        });

        el.svgHexTiles.appendChild(group);
      });
    }

    // 3. Edges (Roads)
    if (el.svgEdges) {
      el.svgEdges.innerHTML = '';
      bg.edges.forEach((edge) => {
        const v1 = bg.vertices[edge.v1];
        const v2 = bg.vertices[edge.v2];

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('id', `edge-group-${edge.id}`);
        g.dataset.edgeId = edge.id;
        g.setAttribute('class', 'edge-interactive-group');
        g.style.cursor = 'pointer';

        // Hitbox line with 26px stroke width for generous click/touch target
        const hitbox = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        hitbox.setAttribute('x1', v1.x);
        hitbox.setAttribute('y1', v1.y);
        hitbox.setAttribute('x2', v2.x);
        hitbox.setAttribute('y2', v2.y);
        hitbox.setAttribute('class', 'board-edge-hitbox');
        hitbox.setAttribute('stroke', 'transparent');
        hitbox.setAttribute('stroke-width', '26');
        hitbox.setAttribute('stroke-linecap', 'round');

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', v1.x);
        line.setAttribute('y1', v1.y);
        line.setAttribute('x2', v2.x);
        line.setAttribute('y2', v2.y);
        line.setAttribute('class', 'board-edge-line');
        line.setAttribute('id', `edge-line-${edge.id}`);

        // Center Marker for Color-Blind Non-Color Identification
        const markerG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        markerG.setAttribute('id', `edge-marker-${edge.id}`);
        markerG.setAttribute('class', 'edge-marker-group');
        markerG.style.display = 'none';

        // Direct click listeners on both group and hitbox
        const onEdgeClick = (e) => {
          e.stopPropagation();
          handleEdgeClick(edge.id);
        };
        hitbox.addEventListener('click', onEdgeClick);
        g.addEventListener('click', onEdgeClick);

        g.appendChild(line);
        g.appendChild(markerG);
        g.appendChild(hitbox); // Hitbox on top in DOM order
        el.svgEdges.appendChild(g);
      });
    }

    // 4. Vertices (Settlements / Cities)
    if (el.svgVertices) {
      el.svgVertices.innerHTML = '';
      bg.vertices.forEach((v) => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('id', `vertex-group-${v.id}`);
        g.dataset.vertexId = v.id;
        g.setAttribute('class', 'vertex-interactive-group');
        g.style.cursor = 'pointer';

        const visual = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        visual.setAttribute('cx', v.x);
        visual.setAttribute('cy', v.y);
        visual.setAttribute('r', 7);
        visual.setAttribute('class', 'board-vertex-visual');
        visual.setAttribute('id', `vertex-visual-${v.id}`);

        // Piece graphical group with SVG piece + non-color marker
        const pieceG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        pieceG.setAttribute('id', `vertex-piece-${v.id}`);
        pieceG.setAttribute('class', 'vertex-piece-group');
        pieceG.style.display = 'none';

        // Accurate r=14 (28px diameter) hitbox perfectly centered without covering roads
        const hitbox = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        hitbox.setAttribute('cx', v.x);
        hitbox.setAttribute('cy', v.y);
        hitbox.setAttribute('r', 14);
        hitbox.setAttribute('class', 'board-vertex-hitbox');
        hitbox.setAttribute('fill', 'transparent');

        // Direct click listeners on both group and hitbox
        const onVertexClick = (e) => {
          e.stopPropagation();
          handleVertexClick(v.id);
        };
        hitbox.addEventListener('click', onVertexClick);
        g.addEventListener('click', onVertexClick);

        g.appendChild(visual);
        g.appendChild(pieceG);
        g.appendChild(hitbox); // Hitbox on top in DOM order
        el.svgVertices.appendChild(g);
      });
    }
  }

  // =========================================================================
  // 6. UI UPDATE & SYNC
  // =========================================================================
  function updateUI() {
    if (!state) return;

    // Check game over immediately!
    if (state.winner !== null || state.phase === 'FINISHED') {
      showGameOverModal();
    }

    const t = I18N[currentLang];
    const activeP = state.players[state.activePlayer];
    const isMyTurn = isLocalPlayerTurn();

    // Turn Chime Notification when it becomes Local Player's Turn
    if (isMyTurn && (previousTurnPlayer !== state.activePlayer || previousTurnPhase !== state.phase)) {
      if (state.phase === 'ROLL_DICE' || state.phase === 'PLAYING_TURN' || state.phase === 'SETUP_SETTLEMENT' || state.phase === 'SETUP_ROAD') {
        safePlaySound('playYourTurn');
        notify(currentLang === 'fa' ? `🔔 نوبت شماست (${activeP.name})!` : `🔔 It is your turn (${activeP.name})!`);
      }
    }
    previousTurnPlayer = state.activePlayer;
    previousTurnPhase = state.phase;

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

        const totalRes = p.resourceCount !== undefined ? p.resourceCount : Object.values(p.resources).reduce((a, b) => a + (b || 0), 0);
        const devCount = (p.devCards && Array.isArray(p.devCards))
          ? p.devCards.filter(c => !c.played).length
          : (p.devCardCount !== undefined ? p.devCardCount : 0);

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
            <div class="hud-stat-pill highlight" title="${currentLang === 'fa' ? 'مجموع منابع' : 'Total Resources'}">
              <span>🃏</span> <span>${totalRes}</span>
            </div>
            <div class="hud-stat-pill" title="${currentLang === 'fa' ? 'کارت‌های شانس' : 'Dev Cards'}">
              <span>📜</span> <span>${devCount}</span>
            </div>
            <div class="hud-stat-pill" title="${currentLang === 'fa' ? 'شوالیه‌ها' : 'Knights'}">
              <span>⚔️</span> <span>${p.playedKnights}</span>
            </div>
            <div class="hud-stat-pill" title="${currentLang === 'fa' ? 'طول جاده' : 'Road'}">
              <span>🛣️</span> <span>${p.longestRoadLength}</span>
            </div>
          </div>
          ${isSelf ? `
          <div class="hud-resources-row" title="${currentLang === 'fa' ? 'منابع در دست' : 'Resources in hand'}">
            <span class="hud-res-item res-lumber" title="${currentLang === 'fa' ? 'چوب' : 'Lumber'}"><span class="hud-res-emoji">🪵</span><span>${p.resources.lumber || 0}</span></span>
            <span class="hud-res-item res-brick" title="${currentLang === 'fa' ? 'آجر' : 'Brick'}"><span class="hud-res-emoji">🧱</span><span>${p.resources.brick || 0}</span></span>
            <span class="hud-res-item res-wool" title="${currentLang === 'fa' ? 'گوسفند' : 'Wool'}"><span class="hud-res-emoji">🐑</span><span>${p.resources.wool || 0}</span></span>
            <span class="hud-res-item res-grain" title="${currentLang === 'fa' ? 'گندم' : 'Grain'}"><span class="hud-res-emoji">🌾</span><span>${p.resources.grain || 0}</span></span>
            <span class="hud-res-item res-ore" title="${currentLang === 'fa' ? 'سنگ' : 'Ore'}"><span class="hud-res-emoji">🪨</span><span>${p.resources.ore || 0}</span></span>
          </div>
          ` : `
          <div class="hud-resources-row" style="justify-content:center; color:var(--text-muted); font-size:0.75rem;">
            <span>🔒 ${totalRes} ${currentLang === 'fa' ? 'کارت منبع پنهان' : 'Hidden Resource Cards'}</span>
          </div>
          `}
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
      if (el.myDevCount) {
        const unplayed = (localViewer.devCards || []).filter(c => !c.played).length;
        el.myDevCount.textContent = unplayed;
      }
    }

    // 4. Action Buttons State
    const inSetup = state.phase.startsWith('SETUP');
    const canRoll = isMyTurn && state.phase === 'ROLL_DICE';
    const canPlay = isMyTurn && state.phase === 'PLAYING_TURN';

    // Auto set buildMode during setup if local player's turn
    if (inSetup && isMyTurn) {
      if (state.phase === 'SETUP_SETTLEMENT') buildMode = 'SETTLEMENT';
      if (state.phase === 'SETUP_ROAD') buildMode = 'ROAD';
    } else if (!inSetup && !canPlay) {
      buildMode = null;
    }

    // Always show the last rolled dice (or 1-1 if match just began and no rolls yet)
    if (state.lastDice && state.lastDice.length === 2) {
      updateDiceVisual(state.lastDice[0], state.lastDice[1]);
    } else {
      renderDieFace(el.die1, 1);
      renderDieFace(el.die2, 1);
      if (el.diceSumBadge) el.diceSumBadge.textContent = '-';
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
    renderDevDeckAndCards();
    updateDiceHistogram();
    updateBankStockDisplay();


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
    if (state.phase === 'ROBBER_DISCARD') {
      const humanDiscard = (state.discardQueue || []).find(d => isLocalSeat(d.playerId));
      if (humanDiscard) {
        checkAndShowDiscardModal();
      } else if (el.modalDiscard) {
        el.modalDiscard.classList.remove('active');
      }
    } else if (el.modalDiscard) {
      el.modalDiscard.classList.remove('active');
    }

    if (state.phase === 'ROBBER_STEAL' && isMyTurn) {
      if (state.stealCandidates && state.stealCandidates.length > 0) {
        showStealModal(state.stealCandidates);
      } else {
        if (gameMode !== 'online') {
          state.phase = 'PLAYING_TURN';
          updateUI();
        }
      }
    } else if (state.phase !== 'ROBBER_STEAL' && el.modalSteal) {
      el.modalSteal.classList.remove('active');
    }
  }

  function updateBoardVisuals() {
    const bg = (state && state.boardGraph) || CatanLogic.getBoardGraph(state) || CatanLogic.BOARD_GRAPHS.base;
    const activeId = state.activePlayer;
    const isSetup = state.phase.startsWith('SETUP');
    const isMyTurn = isLocalPlayerTurn();

    // 1. Hexes & Robber
    bg.hexes.forEach(h => {
      const g = document.getElementById(`hex-tile-${h.id}`);
      const robber = document.getElementById(`robber-hex-${h.id}`);
      if (robber) robber.style.display = (state.robberHexId === h.id) ? 'block' : 'none';
      if (g) {
        if (state.phase === 'ROBBER_MOVE' && isMyTurn && h.id !== state.robberHexId) {
          g.classList.add('selectable-robber', 'legal-robber-target');
        } else {
          g.classList.remove('selectable-robber', 'legal-robber-target');
        }
      }
    });

    // 2. Edges (Roads)
    const isRoadMode = (buildMode === 'ROAD' || (isSetup && state.phase === 'SETUP_ROAD') || freeRoadsLeft > 0) && isMyTurn;
    const isSettlementMode = (buildMode === 'SETTLEMENT' || (isSetup && state.phase === 'SETUP_SETTLEMENT')) && isMyTurn;
    const isCityMode = (buildMode === 'CITY') && isMyTurn;
    const isVertexBuildMode = isSettlementMode || isCityMode;

    // Prioritize pointer events dynamically so vertices never block roads during road mode, and vice-versa
    if (el.svgVertices) el.svgVertices.style.pointerEvents = isRoadMode ? 'none' : 'auto';
    if (el.svgEdges) el.svgEdges.style.pointerEvents = isVertexBuildMode ? 'none' : 'auto';

    bg.edges.forEach(e => {
      const owner = state.edges[e.id];
      const line = document.getElementById(`edge-line-${e.id}`);
      const g = document.getElementById(`edge-group-${e.id}`);
      const markerG = document.getElementById(`edge-marker-${e.id}`);
      const hitbox = g ? g.querySelector('.board-edge-hitbox') : null;

      if (line) {
        if (owner !== null && owner !== undefined) {
          const p = state.players[owner];
          line.classList.add('built');
          line.classList.remove('legal-highlight');
          line.style.stroke = p.colorHex;
          line.style.strokeWidth = '7';
          if (hitbox) hitbox.classList.remove('selectable');
          if (g) g.classList.remove('selectable');

          // Non-color marker on edge midpoint
          if (markerG) {
            markerG.style.display = 'block';
            markerG.innerHTML = '';
            const v1 = bg.vertices[e.v1];
            const v2 = bg.vertices[e.v2];
            const mx = (v1.x + v2.x) / 2;
            const my = (v1.y + v2.y) / 2;
            const markerUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
            markerUse.setAttribute('href', `#marker-${p.marker || 'circle'}`);
            markerUse.setAttribute('x', mx - 6);
            markerUse.setAttribute('y', my - 6);
            markerUse.setAttribute('width', 12);
            markerUse.setAttribute('height', 12);
            markerUse.setAttribute('style', `color:#ffffff;`);
            markerG.appendChild(markerUse);
          }
        } else {
          line.classList.remove('built');
          if (markerG) markerG.style.display = 'none';

          const canBuild = isRoadMode && CatanLogic.canBuildRoad(state, activeId, e.id, isSetup, state.lastSetupSettlementVertex, freeRoadsLeft > 0);
          if (canBuild) {
            line.classList.add('legal-highlight');
            line.style.stroke = state.players[activeId].colorHex || '#f5c518';
            line.style.strokeWidth = '7';
            if (hitbox) hitbox.classList.add('selectable');
            if (g) g.classList.add('selectable');
          } else {
            line.classList.remove('legal-highlight');
            line.style.stroke = 'transparent';
            line.style.strokeWidth = '0';
            if (hitbox) hitbox.classList.remove('selectable');
            if (g) g.classList.remove('selectable');
          }
        }
      }
    });

    // 3. Vertices (Settlements / Cities)
    bg.vertices.forEach(v => {
      const building = state.vertices[v.id];
      const g = document.getElementById(`vertex-group-${v.id}`);
      const hitbox = g ? g.querySelector('.board-vertex-hitbox') : null;
      const visual = document.getElementById(`vertex-visual-${v.id}`);
      const pieceG = document.getElementById(`vertex-piece-${v.id}`);

      if (building && pieceG) {
        pieceG.style.display = 'block';
        pieceG.innerHTML = '';
        if (visual) visual.style.display = 'none';

        const p = state.players[building.player];
        const isCity = building.type === 'city';

        const pieceUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        pieceUse.setAttribute('href', isCity ? '#piece-city' : '#piece-settlement');
        pieceUse.setAttribute('x', isCity ? v.x - 20 : v.x - 16);
        pieceUse.setAttribute('y', isCity ? v.y - 18 : v.y - 16);
        pieceUse.setAttribute('width', isCity ? 40 : 32);
        pieceUse.setAttribute('height', isCity ? 36 : 32);
        pieceUse.setAttribute('style', `color:${p.colorHex};`);
        pieceG.appendChild(pieceUse);

        // Non-color marker on piece
        const markerUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        markerUse.setAttribute('href', `#marker-${p.marker || 'circle'}`);
        markerUse.setAttribute('x', v.x - 5);
        markerUse.setAttribute('y', isCity ? v.y - 4 : v.y - 3);
        markerUse.setAttribute('width', 10);
        markerUse.setAttribute('height', 10);
        markerUse.setAttribute('style', `color:#ffffff;`);
        pieceG.appendChild(markerUse);

        // City upgrade highlight on active player's settlement
        if (isCityMode && building.player === activeId && !isCity) {
          if (hitbox) hitbox.classList.add('selectable', 'selectable-city');
          if (g) g.classList.add('selectable');
          if (visual) {
            visual.style.display = 'block';
            visual.classList.add('upgrade-highlight');
          }
        } else {
          if (hitbox) hitbox.classList.remove('selectable-city');
          if (!isSettlementMode && g) g.classList.remove('selectable');
        }
      } else {
        if (pieceG) pieceG.style.display = 'none';
        if (visual) {
          visual.style.display = 'block';
          visual.classList.remove('upgrade-highlight');
          const canBuildSet = isSettlementMode && CatanLogic.canBuildSettlement(state, activeId, v.id, isSetup);
          if (canBuildSet) {
            visual.classList.add('legal-highlight');
            if (hitbox) hitbox.classList.add('selectable');
            if (g) g.classList.add('selectable');
          } else {
            visual.classList.remove('legal-highlight');
            if (hitbox) hitbox.classList.remove('selectable');
            if (g) g.classList.remove('selectable');
          }
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
          logGameAction('dice', `شما تاس انداختید: ${res.dice[0]} + ${res.dice[1]} = ${res.sum}`, '🎲');
          if (res.sum === 7) {
            logGameAction('robber', `⚠️ تاس ۷ آمد! راهزن فعال شد.`, '🦹');
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
    const sum = (d1 || 1) + (d2 || 1);
    if (el.diceSumBadge) el.diceSumBadge.textContent = sum;
    renderDieFace(el.die1, d1);
    renderDieFace(el.die2, d2);

    // Record roll history
    if (d1 && d2) {
      rollHistory.push({ d1, d2, sum, turn: (state && state.turnCount) || 1 });
      if (rollCounts[sum] !== undefined) rollCounts[sum]++;
      updateDiceHistogram();
    }
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
    if (hasPanned || !state) return;
    const isSetup = state.phase.startsWith('SETUP');
    const isMyTurn = isLocalPlayerTurn();

    if (isMyTurn && (buildMode === 'SETTLEMENT' || (isSetup && state.phase === 'SETUP_SETTLEMENT'))) {
      if (!CatanLogic.canBuildSettlement(state, state.activePlayer, vertexId, isSetup)) return;

      if (gameMode === 'online') {
        sendWsMessage({ type: 'CATAN_BUILD_SETTLEMENT', vertexId, isSetup });
      } else {
        const res = CatanLogic.buildSettlement(state, state.activePlayer, vertexId, isSetup);
        if (res.valid) {
          logGameAction('build', isSetup ? 'شما یک روستای اولیه ساختید.' : 'شما یک روستا ساختید.', '🏠');
          safePlaySound('playBuildSettlement');
          buildMode = null;
          updateUI();
          checkBotTurn();
        }
      }
    } else if (isMyTurn && buildMode === 'CITY') {
      if (!CatanLogic.canBuildCity(state, state.activePlayer, vertexId)) return;

      if (gameMode === 'online') {
        sendWsMessage({ type: 'CATAN_BUILD_CITY', vertexId });
      } else {
        const res = CatanLogic.buildCity(state, state.activePlayer, vertexId);
        if (res.valid) {
          logGameAction('build', 'شما یک روستا را به شهر ارتقا دادید.', '🏛️');
          safePlaySound('playBuildCity');
          buildMode = null;
          updateUI();
          checkBotTurn();
        }
      }
    } else if (isMyTurn && state.phase === 'PLAYING_TURN' && !buildMode) {
      // Natural interaction: if clicking own settlement and has city resources, upgrade or switch to city mode
      const b = state.vertices[vertexId];
      if (b && b.player === state.activePlayer && b.type === 'settlement' && CatanLogic.canBuildCity(state, state.activePlayer, vertexId)) {
        if (gameMode === 'online') {
          sendWsMessage({ type: 'CATAN_BUILD_CITY', vertexId });
        } else {
          const res = CatanLogic.buildCity(state, state.activePlayer, vertexId);
          if (res.valid) {
            logGameAction('build', 'شما یک روستا را به شهر ارتقا دادید.', '🏛️');
            safePlaySound('playBuildCity');
            updateUI();
            checkBotTurn();
          }
        }
      }
    }
  }

  function handleEdgeClick(edgeId) {
    if (hasPanned || !state) return;
    const isSetup = state.phase.startsWith('SETUP');
    const isMyTurn = isLocalPlayerTurn();

    if (isMyTurn && freeRoadsLeft > 0) {
      if (!CatanLogic.canBuildRoad(state, state.activePlayer, edgeId, false, null, true)) return;
      if (gameMode === 'online') {
        sendWsMessage({ type: 'CATAN_BUILD_ROAD', edgeId, isSetup: false, isFree: true });
      } else {
        CatanLogic.buildRoad(state, state.activePlayer, edgeId, true);
      }
      freeRoadsLeft--;
      safePlaySound('playBuildRoad');
      logGameAction('build', 'شما یک جاده رایگان ساختید.', '🛣️');
      if (freeRoadsLeft > 0) {
        notify(currentLang === 'fa' ? 'جاده اول ساخته شد! روی خط دوم کلیک کنید.' : 'First road built! Click second edge.');
      } else {
        buildMode = null;
        notify(currentLang === 'fa' ? 'جاده‌سازی رایگان با موفقیت انجام شد!' : 'Free Road Building completed!');
      }
      updateUI();
      if (gameMode !== 'online') checkBotTurn();
      return;
    }

    if (isMyTurn && (buildMode === 'ROAD' || (isSetup && state.phase === 'SETUP_ROAD'))) {
      if (!CatanLogic.canBuildRoad(state, state.activePlayer, edgeId, isSetup, state.lastSetupSettlementVertex)) return;

      if (gameMode === 'online') {
        sendWsMessage({ type: 'CATAN_BUILD_ROAD', edgeId, isSetup });
      } else {
        const res = CatanLogic.buildRoad(state, state.activePlayer, edgeId, isSetup);
        if (res.valid) {
          logGameAction('build', isSetup ? 'شما یک جاده اولیه ساختید.' : 'شما یک جاده ساختید.', '🛣️');
          safePlaySound('playBuildRoad');
          buildMode = null;
          updateUI();
          checkBotTurn();
        }
      }
    } else if (isMyTurn && state.phase === 'PLAYING_TURN' && !buildMode && CatanLogic.canBuildRoad(state, state.activePlayer, edgeId, false)) {
      // Natural interaction: if player has resources and clicks directly on a legal road, build it directly
      if (gameMode === 'online') {
        sendWsMessage({ type: 'CATAN_BUILD_ROAD', edgeId, isSetup: false });
      } else {
        const res = CatanLogic.buildRoad(state, state.activePlayer, edgeId, false);
        if (res.valid) {
          logGameAction('build', 'شما یک جاده ساختید.', '🛣️');
          safePlaySound('playBuildRoad');
          updateUI();
          checkBotTurn();
        }
      }
    }
  }

  function handleMoveRobber(hexId) {
    if (hasPanned || !state || state.phase !== 'ROBBER_MOVE' || !isLocalPlayerTurn()) return;

    safePlaySound('playRobber');
    if (gameMode === 'online') {
      sendWsMessage({ type: 'CATAN_MOVE_ROBBER', hexId });
    } else {
      const res = CatanLogic.moveRobber(state, state.activePlayer, hexId);
      if (res.valid) {
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
      logGameAction('system', 'نوبت شما پایان یافت.', '⏭️');
      buildMode = null;
      updateUI();
      startTurnCountdown();
      checkBotTurn();
    }
  }

  // =========================================================================
  // 8. BOT AI RUNNER (Solo Mode with Deliberate Pacing & Trading)
  // =========================================================================
  function checkBotTurn() {
    if (!state || state.phase === 'FINISHED' || gameMode === 'online') return;

    // Handle Special Building Phase (5-6 player matches)
    if (state.phase === 'SPECIAL_BUILDING') {
      const spTurn = state.specialBuildingTurn;
      if (spTurn !== undefined && !isLocalSeat(spTurn)) {
        const diff = (botDifficulty === 'easy' || botDifficulty === 'hard') ? botDifficulty : 'normal';
        setTimeout(() => {
          if (!state || state.phase !== 'SPECIAL_BUILDING' || state.specialBuildingTurn !== spTurn) return;
          const decision = CatanLogic.chooseBotTurn(state, spTurn, diff);
          if (decision && decision.action === 'BUILD_CITY') {
            CatanLogic.buildCity(state, spTurn, decision.vertexId);
            safePlaySound('playBuildCity');
          } else if (decision && decision.action === 'BUILD_SETTLEMENT') {
            CatanLogic.buildSettlement(state, spTurn, decision.vertexId, false);
            safePlaySound('playBuildSettlement');
          } else if (decision && decision.action === 'BUILD_ROAD') {
            CatanLogic.buildRoad(state, spTurn, decision.edgeId, false);
            safePlaySound('playBuildRoad');
          } else if (decision && decision.action === 'BUY_DEV_CARD') {
            CatanLogic.buyDevCard(state, spTurn);
            safePlaySound('playCardWhoosh');
          } else {
            CatanLogic.passSpecialBuilding(state, spTurn);
          }
          updateUI();
          setTimeout(() => { checkBotTurn(); }, 1200);
        }, 1200);
        return;
      }
      return;
    }

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
    if (!bot) return;

    const diff = (botDifficulty === 'easy' || botDifficulty === 'hard') ? botDifficulty : 'normal';

    if (el.topStatusText) {
      el.topStatusText.textContent = currentLang === 'fa'
        ? `🤖 نوبت ${bot.name}: در حال تفکر...`
        : `🤖 ${bot.name}'s turn: thinking...`;
    }

    setTimeout(() => {
      if (!state || state.activePlayer !== botId) return;

      // Setup Phase
      if (state.phase.startsWith('SETUP')) {
        try {
          const move = CatanLogic.chooseBotSetupMove(state, botId, diff);
          if (move) {
            if (move.action === 'BUILD_SETTLEMENT') {
              CatanLogic.buildSettlement(state, botId, move.vertexId, true);
              safePlaySound('playBuildSettlement');
              logGameAction('build', `${bot.name} یک روستا در نقشه ساخت.`, '🏠');
            } else if (move.action === 'BUILD_ROAD') {
              CatanLogic.buildRoad(state, botId, move.edgeId, true);
              safePlaySound('playBuildRoad');
              logGameAction('build', `${bot.name} یک جاده ساخت.`, '🛣️');
            }
          }
        } catch (err) {
          console.warn('Bot setup error:', err);
        }
        updateUI();
        setTimeout(() => { checkBotTurn(); }, 1200);
        return;
      }

      // Roll Phase
      if (state.phase === 'ROLL_DICE') {
        safePlaySound('playDiceRoll');
        animateDiceRoll(() => {
          if (!state || state.activePlayer !== botId) return;
          const rollRes = CatanLogic.rollDice(state);
          try {
            if (rollRes && rollRes.dice) {
              updateDiceVisual(rollRes.dice[0], rollRes.dice[1]);
              logGameAction('dice', `${bot.name} تاس انداخت: ${rollRes.dice[0]} + ${rollRes.dice[1]} = ${rollRes.sum}`, '🎲');
            }

            if (rollRes && rollRes.sum === 7) {
              safePlaySound('playRobber');
              logGameAction('robber', `⚠️ تاس ۷ آمد! راهزن فعال شد.`, '🦹');
              notify(currentLang === 'fa' ? `🎲 ${bot.name} تاس ۷ انداخت!` : `🎲 ${bot.name} rolled a 7!`);

              processBotDiscards();

              const humanDiscard = (state.discardQueue || []).find(d => isLocalSeat(d.playerId));
              if (humanDiscard) {
                checkAndShowDiscardModal();
                updateUI();
                return;
              }

              setTimeout(() => {
                botRelocateRobberAndSteal(botId);
                updateUI();
                setTimeout(() => {
                  executeBotTurnActions(botId);
                }, 1400);
              }, 1200);
              return;
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

          setTimeout(() => {
            executeBotTurnActions(botId);
          }, 1500);
        });
        return;
      }

      setTimeout(() => {
        executeBotTurnActions(botId);
      }, 1200);

    }, 1200);
  }

  function evaluateBotTradeProposal(botId) {
    if (!state) return null;
    const bot = state.players[botId];
    const human = state.players[0];
    if (!bot || !human || !bot.resources || !human.resources) return null;

    // Surplus resources (bot has >= 2)
    const surpluses = Object.entries(bot.resources).filter(([_, count]) => count >= 2).map(([r]) => r);
    // Needed resources (bot has 0, human has >= 1)
    const deficits = Object.entries(bot.resources).filter(([res, count]) => count === 0 && (human.resources[res] || 0) >= 1).map(([r]) => r);

    if (surpluses.length > 0 && deficits.length > 0) {
      return { give: surpluses[0], want: deficits[0] };
    }
    return null;
  }

  function promptHumanForBotTrade(botId, offer, callback) {
    if (botTradeAutoTimeout) {
      clearTimeout(botTradeAutoTimeout);
      botTradeAutoTimeout = null;
    }

    pendingBotTradeCallback = callback;
    const bot = state.players[botId];
    if (!el.modalTradeOffer) {
      callback(false);
      return;
    }

    if (el.tradeOfferProposer) {
      el.tradeOfferProposer.textContent = currentLang === 'fa'
        ? `🤖 ${bot.name} مایل به معامله است:`
        : `🤖 ${bot.name} wants to trade:`;
    }

    if (el.tradeOfferGives) {
      el.tradeOfferGives.innerHTML = `<span class="trade-pill">${getResourceEmoji(offer.give)} ۱ ${getResourceName(offer.give)}</span>`;
    }
    if (el.tradeOfferWants) {
      el.tradeOfferWants.innerHTML = `<span class="trade-pill">${getResourceEmoji(offer.want)} ۱ ${getResourceName(offer.want)}</span>`;
    }

    let timeLeft = 5;
    if (el.btnDeclineTradeOffer) {
      el.btnDeclineTradeOffer.textContent = currentLang === 'fa' ? `❌ رد پیشنهاد (${timeLeft}s)` : `❌ Decline (${timeLeft}s)`;
    }

    const countdownInterval = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(countdownInterval);
      } else if (el.btnDeclineTradeOffer) {
        el.btnDeclineTradeOffer.textContent = currentLang === 'fa' ? `❌ رد پیشنهاد (${timeLeft}s)` : `❌ Decline (${timeLeft}s)`;
      }
    }, 1000);

    botTradeAutoTimeout = setTimeout(() => {
      clearInterval(countdownInterval);
      if (el.btnDeclineTradeOffer) {
        el.btnDeclineTradeOffer.textContent = currentLang === 'fa' ? '❌ رد پیشنهاد' : '❌ Decline';
      }
      if (el.modalTradeOffer) el.modalTradeOffer.classList.remove('active');
      if (pendingBotTradeCallback) {
        const cb = pendingBotTradeCallback;
        pendingBotTradeCallback = null;
        cb(false);
      }
    }, 5000);

    safePlaySound('playClick');
    el.modalTradeOffer.classList.add('active');
  }

  function executeBotTurnActions(botId) {
    if (!state || state.activePlayer !== botId) return;
    const bot = state.players[botId];
    if (!bot) return;

    if (el.topStatusText) {
      el.topStatusText.textContent = currentLang === 'fa'
        ? `🤖 ${bot.name} در حال بررسی ساخت و معامله...`
        : `🤖 ${bot.name} is planning...`;
    }

    // Safety watchdog: auto-finish if bot turn gets stuck anywhere for > 8s
    if (botTurnWatchdog) clearTimeout(botTurnWatchdog);
    botTurnWatchdog = setTimeout(() => {
      if (state && state.activePlayer === botId) {
        finishBotTurn(botId);
      }
    }, 8000);

    // Attempt trade if eligible
    const offer = evaluateBotTradeProposal(botId);
    if (offer && Math.random() < 0.6) {
      promptHumanForBotTrade(botId, offer, (accepted) => {
        if (botTradeAutoTimeout) {
          clearTimeout(botTradeAutoTimeout);
          botTradeAutoTimeout = null;
        }
        if (accepted) {
          const human = state.players[0];
          bot.resources[offer.give] = (bot.resources[offer.give] || 0) - 1;
          human.resources[offer.give] = (human.resources[offer.give] || 0) + 1;
          human.resources[offer.want] = (human.resources[offer.want] || 0) - 1;
          bot.resources[offer.want] = (bot.resources[offer.want] || 0) + 1;
          safePlaySound('playResourceChime');
          logGameAction('trade', `معامله با ${bot.name} انجام شد: ۱ ${getResourceName(offer.give)} در برابر ۱ ${getResourceName(offer.want)}.`, '🤝');
          updateUI();
          setTimeout(() => { continueBotBuildingSteps(botId, 0); }, 1200);
        } else {
          logGameAction('trade', `پیشنهاد معامله ${bot.name} رد شد.`, '❌');
          setTimeout(() => { continueBotBuildingSteps(botId, 0); }, 800);
        }
      });
      return;
    }

    continueBotBuildingSteps(botId, 0);
  }

  function continueBotBuildingSteps(botId, step = 0) {
    if (!state || state.activePlayer !== botId) return;
    if (state.phase !== 'PLAYING_TURN' || step >= 4) {
      finishBotTurn(botId);
      return;
    }

    const diff = (botDifficulty === 'easy' || botDifficulty === 'hard') ? botDifficulty : 'normal';
    const decision = CatanLogic.chooseBotTurn(state, botId, diff);
    if (!decision || decision.action === 'END_TURN') {
      finishBotTurn(botId);
      return;
    }

    let didAct = false;
    const bot = state.players[botId];

    if (decision.action === 'BUILD_CITY') {
      const r = CatanLogic.buildCity(state, botId, decision.vertexId);
      if (r && r.valid) {
        didAct = true;
        safePlaySound('playBuildCity');
        logGameAction('build', `${bot.name} یک روستا را به شهر ارتقا داد.`, '🏛️');
      }
    } else if (decision.action === 'BUILD_SETTLEMENT') {
      const r = CatanLogic.buildSettlement(state, botId, decision.vertexId, false);
      if (r && r.valid) {
        didAct = true;
        safePlaySound('playBuildSettlement');
        logGameAction('build', `${bot.name} یک روستا ساخت.`, '🏠');
      }
    } else if (decision.action === 'BUILD_ROAD') {
      const r = CatanLogic.buildRoad(state, botId, decision.edgeId, false);
      if (r && r.valid) {
        didAct = true;
        safePlaySound('playBuildRoad');
        logGameAction('build', `${bot.name} یک جاده ساخت.`, '🛣️');
      }
    } else if (decision.action === 'BUY_DEV_CARD') {
      const r = CatanLogic.buyDevCard(state, botId);
      if (r && r.valid) {
        didAct = true;
        safePlaySound('playCardWhoosh');
        logGameAction('dev', `${bot.name} یک کارت شانس خرید.`, '📜');
      }
    } else if (decision.action === 'BANK_TRADE') {
      const r = CatanLogic.bankTrade(state, botId, decision.giveResource, decision.getResource);
      if (r && r.valid) {
        didAct = true;
        safePlaySound('playResourceChime');
        logGameAction('trade', `${bot.name} با بانک معامله کرد: ${decision.giveResource} با ${decision.getResource}.`, '🔄');
      }
    } else if (decision.action === 'PLAY_DEV_CARD') {
      const r = CatanLogic.playDevCard(state, botId, decision);
      if (r && r.valid) {
        didAct = true;
        safePlaySound('playCardWhoosh');
        logGameAction('dev', `${bot.name} کارت شانس خود را بازی کرد.`, '📜');
        if (decision.cardType === 'knight') {
          botRelocateRobberAndSteal(botId);
        }
      }
    }

    updateUI();

    if (didAct) {
      setTimeout(() => {
        continueBotBuildingSteps(botId, step + 1);
      }, 1200);
    } else {
      finishBotTurn(botId);
    }
  }

  function finishBotTurn(botId) {
    if (botTurnWatchdog) { clearTimeout(botTurnWatchdog); botTurnWatchdog = null; }
    if (botTradeAutoTimeout) { clearTimeout(botTradeAutoTimeout); botTradeAutoTimeout = null; }
    if (!state || state.activePlayer !== botId) return;

    if (state.phase === 'ROBBER_MOVE' || state.phase === 'ROBBER_STEAL') {
      botRelocateRobberAndSteal(botId);
    }

    const bot = state.players[botId];
    if (el.topStatusText && bot) {
      el.topStatusText.textContent = currentLang === 'fa' ? `🤖 ${bot.name} نوبت خود را به پایان رساند.` : `🤖 ${bot.name} ended turn.`;
    }
    setTimeout(() => {
      if (!state || state.activePlayer !== botId) return;
      CatanLogic.endTurn(state, botId);
      if (bot) logGameAction('system', `نوبت ${bot.name} پایان یافت.`, '⏭️');
      updateUI();
      if (state.winner !== null) {
        showGameOverModal();
      } else {
        setTimeout(() => { checkBotTurn(); }, 800);
      }
    }, 1000);
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
    renderPlayerTradePanel();
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

  function renderPlayerTradePanel() {
    if (!state) return;
    const localSeat = getLocalViewerSeat();
    const t = I18N[currentLang];

    if (state.tradeOffer) {
      if (el.playerTradeActiveOffer) el.playerTradeActiveOffer.style.display = 'block';
      if (el.playerTradeCreateForm) el.playerTradeCreateForm.style.display = 'none';

      const offer = state.tradeOffer;
      const proposer = state.players[offer.fromPlayer];
      const isMyOffer = offer.fromPlayer === localSeat;

      const giveStr = Object.entries(offer.give).filter(([_, c]) => c > 0).map(([r, c]) => `${c} ${getResourceName(r)}`).join(', ');
      const wantStr = Object.entries(offer.receive).filter(([_, c]) => c > 0).map(([r, c]) => `${c} ${getResourceName(r)}`).join(', ');

      if (el.playerTradeOfferSummary) {
        if (isMyOffer) {
          el.playerTradeOfferSummary.innerHTML = currentLang === 'fa'
            ? `📌 <strong>پیشنهاد شما:</strong> دادن <strong>${giveStr}</strong> در ازای <strong>${wantStr}</strong>.`
            : `📌 <strong>Your Offer:</strong> You give <strong>${giveStr}</strong> for <strong>${wantStr}</strong>.`;
        } else {
          el.playerTradeOfferSummary.innerHTML = currentLang === 'fa'
            ? `📌 <strong>پیشنهاد ${proposer.name}:</strong> دادن <strong>${giveStr}</strong> در ازای <strong>${wantStr}</strong>.`
            : `📌 <strong>Offer from ${proposer.name}:</strong> Gives <strong>${giveStr}</strong> for <strong>${wantStr}</strong>.`;
        }
      }

      if (el.playerTradeOfferResponses) {
        const lines = [];
        state.players.forEach(p => {
          if (p.id !== offer.fromPlayer) {
            const accepted = offer.acceptedBy && offer.acceptedBy.includes(p.id);
            const rejected = offer.rejectedBy && offer.rejectedBy.includes(p.id);
            const statusText = accepted ? (currentLang === 'fa' ? '✅ قبول کرد' : '✅ Accepted') :
                               (rejected ? (currentLang === 'fa' ? '❌ رد کرد' : '❌ Declined') : (currentLang === 'fa' ? '⏳ در حال بررسی' : '⏳ Pending'));
            lines.push(`<span>${p.name}: ${statusText}</span>`);
          }
        });
        el.playerTradeOfferResponses.innerHTML = lines.join(' | ');
      }

      if (el.playerTradeOfferActions) {
        el.playerTradeOfferActions.innerHTML = '';
        if (isMyOffer) {
          if (offer.acceptedBy && offer.acceptedBy.length > 0) {
            offer.acceptedBy.forEach(partnerId => {
              const partner = state.players[partnerId];
              const btn = document.createElement('button');
              btn.className = 'btn-primary';
              btn.textContent = currentLang === 'fa' ? `انجام معامله با ${partner.name}` : `Trade with ${partner.name}`;
              btn.addEventListener('click', () => handleConfirmTrade(offer.id, partnerId));
              el.playerTradeOfferActions.appendChild(btn);
            });
          }
          const cancelBtn = document.createElement('button');
          cancelBtn.className = 'btn-secondary';
          cancelBtn.textContent = currentLang === 'fa' ? 'لغو پیشنهاد' : 'Cancel Offer';
          cancelBtn.addEventListener('click', handleCancelTrade);
          el.playerTradeOfferActions.appendChild(cancelBtn);
        } else {
          const alreadyAccepted = offer.acceptedBy && offer.acceptedBy.includes(localSeat);
          const alreadyRejected = offer.rejectedBy && offer.rejectedBy.includes(localSeat);

          const acceptBtn = document.createElement('button');
          acceptBtn.className = 'btn-primary';
          acceptBtn.textContent = currentLang === 'fa' ? 'قبول پیشنهاد' : 'Accept Offer';
          if (alreadyAccepted) acceptBtn.disabled = true;
          acceptBtn.addEventListener('click', () => handleRespondTrade(offer.id, true));

          const declineBtn = document.createElement('button');
          declineBtn.className = 'btn-secondary';
          declineBtn.textContent = currentLang === 'fa' ? 'رد پیشنهاد' : 'Decline Offer';
          if (alreadyRejected) declineBtn.disabled = true;
          declineBtn.addEventListener('click', () => handleRespondTrade(offer.id, false));

          el.playerTradeOfferActions.appendChild(acceptBtn);
          el.playerTradeOfferActions.appendChild(declineBtn);
        }
      }
    } else {
      if (el.playerTradeActiveOffer) el.playerTradeActiveOffer.style.display = 'none';
      if (el.playerTradeCreateForm) el.playerTradeCreateForm.style.display = 'block';

      renderTradeCounters();
      renderTradeTargetSelect();
    }
  }

  function renderTradeCounters() {
    const localP = state.players[getLocalViewerSeat()];
    if (!localP) return;

    const resList = [
      { id: 'lumber', name: currentLang === 'fa' ? 'چوب' : 'Lumber', icon: '🪵' },
      { id: 'brick', name: currentLang === 'fa' ? 'آجر' : 'Brick', icon: '🧱' },
      { id: 'wool', name: currentLang === 'fa' ? 'گوسفند' : 'Wool', icon: '🐑' },
      { id: 'grain', name: currentLang === 'fa' ? 'گندم' : 'Grain', icon: '🌾' },
      { id: 'ore', name: currentLang === 'fa' ? 'سنگ' : 'Ore', icon: '🪨' }
    ];

    if (el.tradeGiveCounters) {
      el.tradeGiveCounters.innerHTML = '';
      resList.forEach(r => {
        const row = document.createElement('div');
        row.className = 'trade-counter-row';
        const have = localP.resources[r.id] || 0;
        row.innerHTML = `
          <div class="trade-counter-label"><span>${r.icon}</span><span>${r.name} (${have})</span></div>
          <div class="trade-counter-controls">
            <button type="button" class="trade-counter-btn" data-action="dec" data-type="give" data-res="${r.id}">−</button>
            <span class="trade-counter-val" id="val-give-${r.id}">${playerTradeGive[r.id] || 0}</span>
            <button type="button" class="trade-counter-btn" data-action="inc" data-type="give" data-res="${r.id}" ${playerTradeGive[r.id] >= have ? 'disabled' : ''}>+</button>
          </div>
        `;
        el.tradeGiveCounters.appendChild(row);
      });
    }

    if (el.tradeWantCounters) {
      el.tradeWantCounters.innerHTML = '';
      resList.forEach(r => {
        const row = document.createElement('div');
        row.className = 'trade-counter-row';
        row.innerHTML = `
          <div class="trade-counter-label"><span>${r.icon}</span><span>${r.name}</span></div>
          <div class="trade-counter-controls">
            <button type="button" class="trade-counter-btn" data-action="dec" data-type="want" data-res="${r.id}">−</button>
            <span class="trade-counter-val" id="val-want-${r.id}">${playerTradeWant[r.id] || 0}</span>
            <button type="button" class="trade-counter-btn" data-action="inc" data-type="want" data-res="${r.id}">+</button>
          </div>
        `;
        el.tradeWantCounters.appendChild(row);
      });
    }

    const counterBtns = el.modalTrade ? el.modalTrade.querySelectorAll('.trade-counter-btn') : [];
    counterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        const res = btn.dataset.res;
        const action = btn.dataset.action;
        const have = localP.resources[res] || 0;

        if (type === 'give') {
          if (action === 'inc' && (playerTradeGive[res] || 0) < have) {
            playerTradeGive[res] = (playerTradeGive[res] || 0) + 1;
          } else if (action === 'dec' && (playerTradeGive[res] || 0) > 0) {
            playerTradeGive[res] = (playerTradeGive[res] || 0) - 1;
          }
        } else if (type === 'want') {
          if (action === 'inc') {
            playerTradeWant[res] = (playerTradeWant[res] || 0) + 1;
          } else if (action === 'dec' && (playerTradeWant[res] || 0) > 0) {
            playerTradeWant[res] = (playerTradeWant[res] || 0) - 1;
          }
        }
        renderTradeCounters();
      });
    });
  }

  function renderTradeTargetSelect() {
    if (!el.tradeTargetSelect || !state) return;
    el.tradeTargetSelect.innerHTML = `<option value="all">${currentLang === 'fa' ? 'همه بازیکنان (پیشنهاد عمومی)' : 'All Players (Open Offer)'}</option>`;
    state.players.forEach(p => {
      if (p.id !== getLocalViewerSeat()) {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.name;
        el.tradeTargetSelect.appendChild(opt);
      }
    });
  }

  function handleProposePlayerTrade() {
    const totalGive = Object.values(playerTradeGive).reduce((a, b) => a + b, 0);
    const totalWant = Object.values(playerTradeWant).reduce((a, b) => a + b, 0);

    if (totalGive === 0 || totalWant === 0) {
      notify(currentLang === 'fa' ? 'لطفاً حداقل ۱ منبع برای دادن و ۱ منبع برای دریافت انتخاب کنید.' : 'Select at least 1 resource to give and 1 to receive.');
      return;
    }

    const targetVal = el.tradeTargetSelect ? el.tradeTargetSelect.value : 'all';
    const targetPlayer = targetVal === 'all' ? null : parseInt(targetVal, 10);

    soundEngine.playClick();
    if (gameMode === 'online') {
      sendWsMessage({
        type: 'CATAN_PROPOSE_TRADE',
        give: { ...playerTradeGive },
        receive: { ...playerTradeWant },
        targetPlayer
      });
    } else {
      const res = CatanLogic.proposeTrade(state, state.activePlayer, {
        give: { ...playerTradeGive },
        receive: { ...playerTradeWant },
        targetPlayer
      });
      if (res.valid) {
        notify(currentLang === 'fa' ? 'پیشنهاد معامله ارسال شد.' : 'Trade proposal sent.');
        if (gameMode === 'solo') {
          processBotTradeResponses();
        }
      }
    }
    renderPlayerTradePanel();
    updateUI();
  }

  function handleRespondTrade(offerId, accept) {
    soundEngine.playClick();
    if (gameMode === 'online') {
      sendWsMessage({ type: 'CATAN_RESPOND_TRADE', offerId, accept });
    } else {
      const localSeat = getLocalViewerSeat();
      CatanLogic.respondTrade(state, localSeat, offerId, accept);
      renderPlayerTradePanel();
      updateUI();
    }
  }

  function handleConfirmTrade(offerId, partnerId) {
    soundEngine.playClick();
    if (gameMode === 'online') {
      sendWsMessage({ type: 'CATAN_CONFIRM_TRADE', offerId, partnerId });
    } else {
      const res = CatanLogic.confirmTrade(state, state.activePlayer, offerId, partnerId);
      if (res.valid) {
        soundEngine.playResourceChime();
        notify(currentLang === 'fa' ? 'معامله با موفقیت انجام شد!' : 'Trade successfully completed!');
        closeTradeModal();
        updateUI();
      }
    }
  }

  function handleCancelTrade() {
    soundEngine.playClick();
    if (gameMode === 'online') {
      sendWsMessage({ type: 'CATAN_CANCEL_TRADE' });
    } else {
      CatanLogic.cancelTrade(state, state.activePlayer);
      renderPlayerTradePanel();
      updateUI();
    }
  }

  function processBotTradeResponses() {
    if (!state || !state.tradeOffer) return;
    const offer = state.tradeOffer;
    for (let i = 0; i < state.playerCount; i++) {
      if (i !== offer.fromPlayer && i !== 0) {
        if (offer.targetPlayer !== null && offer.targetPlayer !== i) continue;
        const bot = state.players[i];
        let hasAll = true;
        for (const [r, count] of Object.entries(offer.receive || {})) {
          if ((bot.resources[r] || 0) < count + 1) {
            hasAll = false;
            break;
          }
        }
        CatanLogic.respondTrade(state, i, offer.id, hasAll);
      }
    }
    renderPlayerTradePanel();
  }

  function showMonopolyPicker(cardIdx) {
    activePlayingDevIdx = cardIdx;
    if (el.modalDevcards) el.modalDevcards.classList.remove('active');
    if (el.modalCardDetail) el.modalCardDetail.classList.remove('active');

    if (el.modalMonopoly) {
      el.modalMonopoly.classList.add('active');
      const cards = el.modalMonopoly.querySelectorAll('.monopoly-res-card');
      cards.forEach(card => {
        card.onclick = () => {
          const res = card.dataset.res;
          soundEngine.playClick();
          if (el.modalMonopoly) el.modalMonopoly.classList.remove('active');
          if (gameMode === 'online') {
            sendWsMessage({
              type: 'CATAN_PLAY_DEV',
              cardType: 'monopoly',
              cardIdx: activePlayingDevIdx,
              targetResource: res
            });
          } else {
            const playRes = CatanLogic.playDevCard(state, state.activePlayer, {
              cardType: 'monopoly',
              cardIdx: activePlayingDevIdx,
              targetResource: res
            });
            if (playRes.valid) {
              const resName = getResourceName(res);
              logGameAction('dev', `شما کارت انحصار بازی کردید و مجموعاً ${playRes.totalTaken} ${resName} از حریفان دریافت کردید!`, '💰');
              safePlaySound('playResourceChime');
              notify(currentLang === 'fa' ? `انحصار: ${playRes.totalTaken} ${resName} دریافت شد!` : `Monopoly: claimed ${playRes.totalTaken} ${res}!`);
              updateUI();
            }
          }
        };
      });
    }
  }

  function showYopPicker(cardIdx) {
    activePlayingDevIdx = cardIdx;
    yopSelectedCounts = { lumber: 0, brick: 0, wool: 0, grain: 0, ore: 0 };
    if (el.modalDevcards) el.modalDevcards.classList.remove('active');
    if (el.modalCardDetail) el.modalCardDetail.classList.remove('active');
    renderYopCounters();
    if (el.modalYop) el.modalYop.classList.add('active');
  }

  function renderYopCounters() {
    const list = document.getElementById('yop-counters-list') || el.yopCountersList;
    if (!list) return;
    const resList = [
      { id: 'lumber', name: currentLang === 'fa' ? 'چوب' : 'Lumber', icon: '🪵' },
      { id: 'brick', name: currentLang === 'fa' ? 'آجر' : 'Brick', icon: '🧱' },
      { id: 'wool', name: currentLang === 'fa' ? 'گوسفند' : 'Wool', icon: '🐑' },
      { id: 'grain', name: currentLang === 'fa' ? 'گندم' : 'Grain', icon: '🌾' },
      { id: 'ore', name: currentLang === 'fa' ? 'سنگ' : 'Ore', icon: '🪨' }
    ];

    const totalSelected = Object.values(yopSelectedCounts).reduce((a, b) => a + b, 0);
    list.innerHTML = '';

    resList.forEach(r => {
      const row = document.createElement('div');
      row.className = 'trade-counter-row';
      const inBank = state && state.bank ? (state.bank[r.id] || 0) : 5;
      row.innerHTML = `
        <div class="trade-counter-label"><span>${r.icon}</span><span>${r.name} (${currentLang === 'fa' ? 'موجودی بانک: ' : 'Bank: '}${inBank})</span></div>
        <div class="trade-counter-controls">
          <button type="button" class="trade-counter-btn" data-action="dec" data-res="${r.id}" ${(!yopSelectedCounts[r.id] || yopSelectedCounts[r.id] <= 0) ? 'disabled' : ''}>−</button>
          <span class="trade-counter-val">${yopSelectedCounts[r.id] || 0}</span>
          <button type="button" class="trade-counter-btn" data-action="inc" data-res="${r.id}" ${(totalSelected >= 2 || (yopSelectedCounts[r.id] || 0) >= inBank) ? 'disabled' : ''}>+</button>
        </div>
      `;
      list.appendChild(row);
    });

    const statusEl = document.getElementById('yop-selection-status') || el.yopSelectionStatus;
    if (statusEl) {
      statusEl.textContent = currentLang === 'fa'
        ? `انتخاب شده: ${totalSelected} از ۲`
        : `Selected: ${totalSelected} of 2`;
    }

    const confirmBtn = document.getElementById('btn-confirm-yop') || el.btnConfirmYop;
    if (confirmBtn) {
      confirmBtn.disabled = totalSelected !== 2;
      confirmBtn.textContent = currentLang === 'fa'
        ? `دریافت منابع (${totalSelected}/۲)`
        : `Take Resources (${totalSelected}/2)`;
    }

    list.querySelectorAll('.trade-counter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        soundEngine.playClick();
        const res = btn.dataset.res;
        const action = btn.dataset.action;
        const inBank = state && state.bank ? (state.bank[res] || 0) : 5;
        const sum = Object.values(yopSelectedCounts).reduce((a, b) => a + b, 0);

        if (action === 'inc' && sum < 2 && (yopSelectedCounts[res] || 0) < inBank) {
          yopSelectedCounts[res] = (yopSelectedCounts[res] || 0) + 1;
        } else if (action === 'dec' && (yopSelectedCounts[res] || 0) > 0) {
          yopSelectedCounts[res] = (yopSelectedCounts[res] || 0) - 1;
        }
        renderYopCounters();
      });
    });
  }

  function showStealModal(candidates) {
    if (!el.modalSteal) return;
    if (!candidates || candidates.length === 0) {
      if (gameMode !== 'online') {
        state.phase = 'PLAYING_TURN';
        updateUI();
      }
      return;
    }
    const list = document.getElementById('steal-candidates-list');
    if (!list) return;
    list.innerHTML = '';

    candidates.forEach(cId => {
      const p = state.players[cId];
      if (!p) return;
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
    if (state.winner === null && state.phase !== 'FINISHED') return;

    safePlaySound('playVictoryFanfare');

    const winnerId = state.winner !== null ? state.winner : 0;
    const winnerP = state.players[winnerId];

    const title = document.getElementById('gameover-message') || el.gameoverMessage;
    if (title && winnerP) {
      title.innerHTML = currentLang === 'fa' 
        ? `<span style="color:${winnerP.colorHex}; font-weight:900;">${winnerP.name}</span> برنده بازی شد! 🏆` 
        : `<span style="color:${winnerP.colorHex}; font-weight:900;">${winnerP.name}</span> Wins the Match! 🏆`;
    }

    const sub = document.getElementById('gameover-sub') || el.gameoverSub;
    if (sub && winnerP) {
      sub.textContent = currentLang === 'fa'
        ? `با کسب ${winnerP.victoryPoints} امتیاز پیروزی، فاتح جزیره کاتان شد.`
        : `Victory achieved on Catan Island with ${winnerP.victoryPoints} Victory Points.`;
    }

    // Populate Match Scoreboard Breakdown Table
    const table = document.getElementById('gameover-scoreboard-table') || el.gameoverScoreboardTable;
    if (table) {
      const bg = (state && state.boardGraph) || CatanLogic.getBoardGraph(state) || CatanLogic.BOARD_GRAPHS.base;
      const scores = state.players.map(p => {
        let settlements = 0;
        let cities = 0;
        for (let vId = 0; vId < bg.vertices.length; vId++) {
          const b = state.vertices[vId];
          if (b && b.player === p.id) {
            if (b.type === 'city') cities++;
            else settlements++;
          }
        }
        const longestRoad = p.hasLongestRoad ? 2 : 0;
        const largestArmy = p.hasLargestArmy ? 2 : 0;
        const vpCards = (p.devCards || []).filter(c => c.type === 'victory_point').length;
        const total = (settlements * 1) + (cities * 2) + longestRoad + largestArmy + vpCards;

        return {
          id: p.id,
          name: p.name,
          colorHex: p.colorHex,
          settlements,
          cities,
          longestRoad,
          largestArmy,
          vpCards,
          total,
          isWinner: p.id === winnerId
        };
      });

      // Sort descending by total score
      scores.sort((a, b) => b.total - a.total);

      table.innerHTML = `
        <thead>
          <tr>
            <th>${currentLang === 'fa' ? 'رتبه' : 'Rank'}</th>
            <th style="text-align:right;">${currentLang === 'fa' ? 'بازیکن' : 'Player'}</th>
            <th>${currentLang === 'fa' ? 'روستا (۱+)' : 'Settlement (+1)'}</th>
            <th>${currentLang === 'fa' ? 'شهر (۲+)' : 'City (+2)'}</th>
            <th>${currentLang === 'fa' ? 'جاده (۲+)' : 'Road (+2)'}</th>
            <th>${currentLang === 'fa' ? 'ارتش (۲+)' : 'Army (+2)'}</th>
            <th>${currentLang === 'fa' ? 'شانس (+۱)' : 'VP Dev (+1)'}</th>
            <th>${currentLang === 'fa' ? 'مجموع' : 'Total'}</th>
          </tr>
        </thead>
        <tbody>
          ${scores.map((s, rank) => `
            <tr class="${s.isWinner ? 'winner-row' : ''}">
              <td>${s.isWinner ? '🥇' : (rank + 1)}</td>
              <td>
                <div class="score-player-cell">
                  <span class="score-color-dot" style="background:${s.colorHex};"></span>
                  <span>${s.name}</span>
                </div>
              </td>
              <td>${s.settlements}</td>
              <td>${s.cities * 2} (${s.cities})</td>
              <td>${s.longestRoad > 0 ? '۲⭐' : '-'}</td>
              <td>${s.largestArmy > 0 ? '۲⚔️' : '-'}</td>
              <td>${s.vpCards > 0 ? `${s.vpCards}📜` : '-'}</td>
              <td><span class="score-vp-total">${s.total}</span></td>
            </tr>
          `).join('')}
        </tbody>
      `;
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
      if (state.phase !== 'ROBBER_STEAL' && state.phase !== 'ROBBER_DISCARD') {
        if (!el.modalTrade || !el.modalTrade.classList.contains('active')) {
          closeAllModals();
        }
      }
      if (el.modalTrade && el.modalTrade.classList.contains('active')) {
        renderPlayerTradePanel();
      } else if (state.tradeOffer && state.tradeOffer.fromPlayer !== mySeat && (!state.tradeOffer.rejectedBy || !state.tradeOffer.rejectedBy.includes(mySeat))) {
        const fromP = state.players[state.tradeOffer.fromPlayer];
        notify(currentLang === 'fa' ? `🤝 پیشنهاد معامله جدید از طرف ${fromP ? fromP.name : 'بازیکن'}!` : `🤝 New trade offer from ${fromP ? fromP.name : 'player'}!`);
      }
      if (msg.lastDice) {
        updateDiceVisual(msg.lastDice[0], msg.lastDice[1]);
      }
      updateUI();
      if (state.winner !== null) showGameOverModal();
    } else if (msg.type === 'CHAT' || msg.type === 'CHAT_MESSAGE') {
      appendChatMessage(msg.sender, msg.text, msg.sender === localPlayerName);
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

    // Rule profile & player count sync
    const ruleProfile = (msg.settings && msg.settings.ruleProfile) || (msg.ruleProfile) || 'base';
    const playerCount = (msg.settings && msg.settings.playerCount) || (msg.playerCount) || 4;
    const mapSeed = (msg.settings && msg.settings.mapSeed) || msg.mapSeed || roomCode || 'SEED1';

    if (el.lobbyRuleProfileSelect) {
      el.lobbyRuleProfileSelect.value = ruleProfile;
      el.lobbyRuleProfileSelect.disabled = !isHost;
    }
    if (el.lobbyPlayerCountSelect) {
      el.lobbyPlayerCountSelect.value = playerCount;
      el.lobbyPlayerCountSelect.disabled = !isHost;
    }
    if (el.lobbySeedInput) {
      el.lobbySeedInput.value = mapSeed;
      el.lobbySeedInput.disabled = !isHost;
    }

    // Update live SVG preview in lobby
    updateLobbyMapPreview(mapSeed, ruleProfile);

    // 8-Player Colors Palette
    const PLAYER_COLORS = ['#ef4444', '#3b82f6', '#f97316', '#22c55e', '#8b4513', '#e2e8f0', '#8b5cf6', '#06b6d4'];
    const MARKER_NAMES = ['circle', 'square', 'triangle', 'diamond', 'star', 'cross', 'hexagon', 'plus'];

    if (el.lobbySeatsContainer && currentLobbySeats) {
      el.lobbySeatsContainer.innerHTML = '';
      const t = I18N[currentLang];

      currentLobbySeats.forEach((seat, idx) => {
        const isMe = idx === mySeat || seat.isMe;
        const isBot = !!seat.isBot;
        const isSeatHost = !!seat.isHost;
        const isOnline = isBot ? true : !!seat.isOnline;
        const colorHex = PLAYER_COLORS[idx] || '#f5c518';
        const marker = MARKER_NAMES[idx] || 'circle';

        const card = document.createElement('div');
        card.className = `lobby-seat-card ${isMe ? 'is-you' : ''}`;

        const info = document.createElement('div');
        info.innerHTML = `
          <div style="display:flex; align-items:center; gap:6px;">
            <div class="lobby-seat-color-dot" style="background:${colorHex};"></div>
            <span style="font-weight:800; color:${colorHex};">${seat.name}</span>
            <span style="font-size:0.75rem; color:var(--text-muted); opacity:0.8;">[${marker}]</span>
            ${isSeatHost ? '👑' : ''}
            ${isMe ? `<span style="font-size:0.75rem; color:var(--gold-primary);">${t.youBadge}</span>` : ''}
          </div>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
            ${isBot ? `${t.botBadge} (${seat.difficulty || 'Normal'})` : (isOnline ? t.onlineBadge : t.offlineBadge)}
          </div>
        `;
        card.appendChild(info);

        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.gap = '6px';
        actions.style.alignItems = 'center';

        // Host Bot Difficulty Toggle
        if (isHost && isBot) {
          const diffSelect = document.createElement('select');
          diffSelect.className = 'form-select';
          diffSelect.style.padding = '2px 6px';
          diffSelect.style.fontSize = '0.75rem';
          diffSelect.innerHTML = `
            <option value="easy" ${seat.difficulty === 'easy' ? 'selected' : ''}>Easy</option>
            <option value="medium" ${seat.difficulty === 'medium' || !seat.difficulty ? 'selected' : ''}>Normal</option>
            <option value="hard" ${seat.difficulty === 'hard' ? 'selected' : ''}>Hard</option>
          `;
          diffSelect.addEventListener('change', (e) => {
            sendWsMessage({ type: 'CATAN_CONFIG_UPDATE', botSeatDifficulty: { seat: idx, difficulty: e.target.value } });
          });
          actions.appendChild(diffSelect);
        }

        if (isBot && !isMe) {
          const btnClaim = document.createElement('button');
          btnClaim.className = 'btn-seat-action';
          btnClaim.textContent = t.takeSeatBtn;
          btnClaim.addEventListener('click', (e) => {
            e.stopPropagation();
            sendWsMessage({ type: 'CLAIM_SEAT', seat: idx, playerName: localPlayerName });
          });
          actions.appendChild(btnClaim);
        }

        card.appendChild(actions);
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

  function getCardSvgHref(type) {
    if (!type) return '#card-back';
    const slug = String(type).replace(/_/g, '-');
    return `#card-${slug}`;
  }

  function openDevCardsModal() {
    soundEngine.playClick();
    const handList = document.getElementById('my-dev-cards-list') || el.myDevCardsList;
    const playedList = document.getElementById('my-played-devs-list') || el.myPlayedDevsList;
    if (!state || !handList) return;

    handList.innerHTML = '';
    if (playedList) playedList.innerHTML = '';

    const localViewer = state.players[getLocalViewerSeat()];
    if (!localViewer) return;

    const allCards = (localViewer.devCards || []).map((card, idx) => ({ ...card, originalIdx: idx }));
    const unplayedCards = allCards.filter(c => !c.played);
    const playedCards = allCards.filter(c => c.played);

    // Update tab badges
    const badgeHand = document.getElementById('badge-hand-count') || el.badgeHandCount;
    const badgePlayed = document.getElementById('badge-played-count') || el.badgePlayedCount;
    if (badgeHand) badgeHand.textContent = unplayedCards.length;
    if (badgePlayed) badgePlayed.textContent = playedCards.length;

    // Render Hand (Unplayed) Cards
    if (unplayedCards.length === 0) {
      handList.innerHTML = `<div style="text-align:center; padding:24px; color:var(--text-muted); font-size:0.92rem;">${currentLang === 'fa' ? 'هیچ کارت شانسی در دست ندارید.' : 'No development cards in hand.'}</div>`;
    } else {
      unplayedCards.forEach(c => {
        const row = document.createElement('div');
        row.className = `dev-card-row ${c.type}`;

        const isBoughtThisTurn = c.turnBought !== undefined && c.turnBought >= (state.turnCount || 0);
        const canPlayPhase = (state.phase === 'PLAYING_TURN');
        const canPlayCard = isLocalPlayerTurn() && !state.devCardPlayedThisTurn && !isBoughtThisTurn && canPlayPhase;

        const title = getDevCardTitle(c.type);
        const desc = getDevCardRules(c.type);

        row.innerHTML = `
          <div class="dev-card-info">
            <div class="dev-card-icon-frame">
              <svg class="dev-card-svg-icon" viewBox="0 0 48 48"><use href="${getCardSvgHref(c.type)}"/></svg>
            </div>
            <div>
              <div class="dev-card-title">${title}</div>
              <div class="dev-card-desc">${desc}</div>
            </div>
          </div>
        `;

        if (c.type === 'victory_point') {
          if (localViewer.victoryPoints >= 10 && isLocalPlayerTurn()) {
            const winBtn = document.createElement('button');
            winBtn.type = 'button';
            winBtn.className = 'btn-dev-play btn-dev-claim-vp';
            winBtn.textContent = currentLang === 'fa' ? '🏆 اعلام پیروزی (۱۰ امتیاز)' : '🏆 Claim Victory (10 VP)';
            winBtn.onclick = () => handlePlayDevCard(c.type, c.originalIdx);
            row.appendChild(winBtn);
          } else {
            const vpTag = document.createElement('span');
            vpTag.className = 'dev-card-tag vp';
            vpTag.textContent = currentLang === 'fa' ? '⭐ ۱ امتیاز (پنهان تا پیروزی)' : '⭐ 1 VP (Hidden)';
            row.appendChild(vpTag);
          }
        } else if (isBoughtThisTurn) {
          const lockTag = document.createElement('span');
          lockTag.className = 'dev-card-tag locked';
          lockTag.textContent = currentLang === 'fa' ? '🔒 قفل تا نوبت بعد' : '🔒 Next turn';
          row.appendChild(lockTag);
        } else if (state.phase === 'ROLL_DICE' && isLocalPlayerTurn()) {
          const diceTag = document.createElement('span');
          diceTag.className = 'dev-card-tag locked';
          diceTag.textContent = currentLang === 'fa' ? '🎲 ابتدا تاس بیندازید' : '🎲 Roll dice first';
          row.appendChild(diceTag);
        } else if (state.devCardPlayedThisTurn) {
          const usedTag = document.createElement('span');
          usedTag.className = 'dev-card-tag locked';
          usedTag.textContent = currentLang === 'fa' ? '۱ کارت در هر نوبت' : '1 card per turn';
          row.appendChild(usedTag);
        } else if (!isLocalPlayerTurn()) {
          const turnTag = document.createElement('span');
          turnTag.className = 'dev-card-tag locked';
          turnTag.textContent = currentLang === 'fa' ? 'نوبت شما نیست' : 'Not your turn';
          row.appendChild(turnTag);
        } else if (canPlayCard) {
          const playBtn = document.createElement('button');
          playBtn.type = 'button';
          playBtn.className = 'btn-dev-play';
          playBtn.textContent = currentLang === 'fa' ? '✨ استفاده از کارت' : '✨ Play Card';
          playBtn.onclick = () => handlePlayDevCard(c.type, c.originalIdx);
          row.appendChild(playBtn);
        } else {
          const phaseTag = document.createElement('span');
          phaseTag.className = 'dev-card-tag locked';
          phaseTag.textContent = currentLang === 'fa' ? 'غیرقابل بازی در این فاز' : 'Not playable now';
          row.appendChild(phaseTag);
        }

        handList.appendChild(row);
      });
    }

    // Render Played Cards
    if (playedList) {
      if (playedCards.length === 0) {
        playedList.innerHTML = `<div style="text-align:center; padding:24px; color:var(--text-muted); font-size:0.92rem;">${currentLang === 'fa' ? 'هیچ کارتی تاکنون استفاده نشده است.' : 'No cards played yet.'}</div>`;
      } else {
        playedCards.forEach(c => {
          const row = document.createElement('div');
          row.className = `dev-card-row is-played ${c.type}`;

          row.innerHTML = `
            <div class="dev-card-info">
              <div class="dev-card-icon-frame">
                <svg class="dev-card-svg-icon" viewBox="0 0 48 48"><use href="${getCardSvgHref(c.type)}"/></svg>
              </div>
              <div>
                <div class="dev-card-title">${getDevCardTitle(c.type)}</div>
                <div class="dev-card-desc">${getDevCardRules(c.type)}</div>
              </div>
            </div>
            <span class="dev-card-tag played">${currentLang === 'fa' ? '✨ استفاده شده' : '✨ Played'}</span>
          `;
          playedList.appendChild(row);
        });
      }
    }

    // Tab switching handlers
    const tabHand = document.getElementById('tab-devs-hand') || el.tabDevsHand;
    const tabPlayed = document.getElementById('tab-devs-played') || el.tabDevsPlayed;
    if (tabHand && tabPlayed && playedList) {
      tabHand.onclick = () => {
        soundEngine.playClick();
        tabHand.classList.add('active');
        tabPlayed.classList.remove('active');
        handList.style.display = 'flex';
        playedList.style.display = 'none';
      };
      tabPlayed.onclick = () => {
        soundEngine.playClick();
        tabPlayed.classList.add('active');
        tabHand.classList.remove('active');
        handList.style.display = 'none';
        playedList.style.display = 'flex';
      };
      // Reset view to hand tab
      tabHand.classList.add('active');
      tabPlayed.classList.remove('active');
      handList.style.display = 'flex';
      playedList.style.display = 'none';
    }

    if (el.modalDevcards) el.modalDevcards.classList.add('active');
  }

  function handlePlayDevCard(cardType, cardIdx) {
    if (!state || !isLocalPlayerTurn()) return;

    if (state.phase === 'ROLL_DICE') {
      notify(currentLang === 'fa'
        ? '🎲 لطفاً ابتدا تاس بیندازید؛ کارت‌ها پس از پرتاب تاس قابل بازی هستند.'
        : '🎲 Please roll dice first; cards are playable after rolling.');
      return;
    }
    if (state.phase !== 'PLAYING_TURN') {
      notify(currentLang === 'fa'
        ? 'کارت‌ها فقط در نوبت اصلی شما قابل استفاده هستند.'
        : 'Cards can only be played during action phase.');
      return;
    }

    const p = state.players[state.activePlayer];
    if (!p) return;

    let card = p.devCards[cardIdx];
    if (!card || card.played || card.type !== cardType) {
      cardIdx = p.devCards.findIndex(c => c.type === cardType && !c.played);
      card = p.devCards[cardIdx];
    }
    if (!card || card.played) return;

    const isBoughtThisTurn = card.turnBought !== undefined && card.turnBought >= (state.turnCount || 0);
    const canWinVP = cardType === 'victory_point' && (p.victoryPoints >= 10);
    if (isBoughtThisTurn && !canWinVP) {
      notify(currentLang === 'fa'
        ? 'کارت‌های شانس فقط از نوبت بعد قابل بازی هستند.'
        : 'Development cards can only be played starting from your next turn.');
      return;
    }

    if (state.devCardPlayedThisTurn && !canWinVP) {
      notify(currentLang === 'fa'
        ? 'در هر نوبت فقط یک کارت شانس می‌توانید بازی کنید.'
        : 'You can only play one development card per turn.');
      return;
    }

    if (el.modalDevcards) el.modalDevcards.classList.remove('active');
    if (el.modalCardDetail) el.modalCardDetail.classList.remove('active');

    if (cardType === 'knight') {
      soundEngine.playClick();
      if (gameMode === 'online') {
        sendWsMessage({ type: 'CATAN_PLAY_DEV', cardType: 'knight', cardIdx });
      } else {
        const res = CatanLogic.playDevCard(state, state.activePlayer, { cardType: 'knight', cardIdx });
        if (res.valid) {
          logGameAction('dev', 'شما کارت شوالیه بازی کردید.', '⚔️');
          notify(currentLang === 'fa' ? 'کارت شوالیه بازی شد! راهزن را جابجا کنید.' : 'Knight played! Move the robber.');
          updateUI();
        }
      }
    } else if (cardType === 'road_building') {
      soundEngine.playClick();
      if (gameMode === 'online') {
        sendWsMessage({ type: 'CATAN_PLAY_DEV', cardType: 'road_building', cardIdx });
      } else {
        const res = CatanLogic.playDevCard(state, state.activePlayer, { cardType: 'road_building', cardIdx });
        if (res.valid) {
          freeRoadsLeft = 2;
          buildMode = 'ROAD';
          logGameAction('dev', 'شما کارت جاده‌سازی بازی کردید (۲ جاده رایگان).', '🛣️');
          notify(currentLang === 'fa' ? 'جاده‌سازی: روی خط اول کلیک کنید.' : 'Road building: click first edge.');
          updateUI();
        }
      }
    } else if (cardType === 'monopoly') {
      soundEngine.playClick();
      showMonopolyPicker(cardIdx);
    } else if (cardType === 'year_of_plenty') {
      soundEngine.playClick();
      showYopPicker(cardIdx);
    } else if (cardType === 'victory_point') {
      soundEngine.playClick();
      if (p.victoryPoints >= 10) {
        if (gameMode === 'online') {
          sendWsMessage({ type: 'CATAN_PLAY_DEV', cardType: 'victory_point', cardIdx });
        } else {
          CatanLogic.playDevCard(state, state.activePlayer, { cardType: 'victory_point', cardIdx });
          updateUI();
        }
      }
    }
  }

  
  // =========================================================================
  // 10A. DEVELOPMENT CARD DECK & PLAYER CARD TRAYS
  // =========================================================================
  function renderDevDeckAndCards() {
    if (!state) return;

    const deckRemaining = (state.devCardDeck && state.devCardDeck.length) || 0;
    if (el.devDeckCount) el.devDeckCount.textContent = deckRemaining;

    // 1. 3D Stack Thickness Representation
    if (el.devDeckStack) {
      el.devDeckStack.innerHTML = '';
      const layerCount = Math.min(6, Math.max(1, Math.ceil(deckRemaining / 5)));
      for (let i = 0; i < layerCount; i++) {
        const layer = document.createElement('div');
        layer.className = 'deck-card-layer';
        const offset = i * 2;
        layer.style.transform = `translate(-50%, -50%) translate3d(${offset}px, -${offset}px, ${i * 2}px)`;
        layer.style.zIndex = i + 1;
        if (i === layerCount - 1) {
          layer.innerHTML = `<svg viewBox="0 0 48 64" class="deck-top-card-svg"><use href="#card-back"/></svg>`;
        }
        el.devDeckStack.appendChild(layer);
      }
    }

    // 2. Buy Dev Card Button State & Reason Tooltip
    if (el.btnBuyDevDeck) {
      const activeId = state.activePlayer;
      const isMyTurn = isLocalPlayerTurn();
      const canAfford = CatanLogic.canBuyDevCard(state, activeId);
      const isPlayPhase = state.phase === 'PLAYING_TURN';
      const canBuy = isMyTurn && isPlayPhase && canAfford && deckRemaining > 0;

      el.btnBuyDevDeck.disabled = !canBuy;
      el.btnBuyDevDeck.classList.toggle('can-afford', canBuy);

      if (el.buyDeckReason) {
        if (!isMyTurn) {
          el.buyDeckReason.textContent = currentLang === 'fa' ? 'نوبت شما نیست' : 'Not your turn';
          el.buyDeckReason.style.display = 'block';
        } else if (!isPlayPhase) {
          el.buyDeckReason.textContent = currentLang === 'fa' ? 'ابتدا تاس بیندازید' : 'Roll dice first';
          el.buyDeckReason.style.display = 'block';
        } else if (deckRemaining <= 0) {
          el.buyDeckReason.textContent = currentLang === 'fa' ? 'کارت‌های دسته تمام شده' : 'Deck is empty';
          el.buyDeckReason.style.display = 'block';
        } else if (!canAfford) {
          el.buyDeckReason.textContent = currentLang === 'fa' ? 'نیاز به ۱ گوسفند، ۱ گندم، ۱ سنگ' : 'Needs 1 Wool, 1 Grain, 1 Ore';
          el.buyDeckReason.style.display = 'block';
        } else {
          el.buyDeckReason.style.display = 'none';
        }
      }
    }

    // 3. Local Player's Face-Up Dev Cards Tray (Unplayed Cards Only)
    const localViewer = state.players[getLocalViewerSeat()];
    if (el.localDevCardsList && localViewer) {
      el.localDevCardsList.innerHTML = '';
      const unplayedDevs = (localViewer.devCards || []).filter(c => !c.played);
      if (el.localDevCount) el.localDevCount.textContent = unplayedDevs.length;

      if (unplayedDevs.length === 0) {
        el.localDevCardsList.innerHTML = `<div class="empty-tray-msg">${currentLang === 'fa' ? 'کارتی در دست ندارید' : 'No cards held'}</div>`;
      } else {
        localViewer.devCards.forEach((c, idx) => {
          if (c.played) return; // Do not show played cards in hand tray!

          const cardEl = document.createElement('div');
          cardEl.className = 'player-tray-card';

          const isBoughtThisTurn = c.turnBought !== undefined && c.turnBought >= (state.turnCount || 0);
          const isPlayable = isLocalPlayerTurn() && (state.phase === 'PLAYING_TURN') && !state.devCardPlayedThisTurn && !isBoughtThisTurn;

          if (isPlayable) cardEl.classList.add('is-playable');
          if (isBoughtThisTurn) cardEl.classList.add('is-locked');

          cardEl.innerHTML = `
            <svg class="tray-card-art"><use href="${getCardSvgHref(c.type)}"/></svg>
            <span class="tray-card-name">${getDevCardTitle(c.type)}</span>
            ${isBoughtThisTurn ? '<span class="card-lock-badge">🔒</span>' : ''}
          `;

          cardEl.addEventListener('click', () => {
            openCardDetailModal(c, idx, false, getLocalViewerSeat());
          });

          el.localDevCardsList.appendChild(cardEl);
        });
      }
    }

    // 4. Opponents' Dev Card Groups (Hidden Counts + Public Played Cards)
    if (el.opponentsDevTrays) {
      el.opponentsDevTrays.innerHTML = '';
      state.players.forEach((p, pIdx) => {
        if (pIdx === getLocalViewerSeat()) return;

        const group = document.createElement('div');
        group.className = 'opponent-dev-group';

        const unplayedCount = (p.devCards && Array.isArray(p.devCards))
          ? p.devCards.filter(c => !c.played).length
          : (p.devCardCount !== undefined ? p.devCardCount : 0);

        group.innerHTML = `
          <div class="opponent-dev-header">
            <span class="opp-dot" style="background:${p.colorHex};"></span>
            <span class="opp-name">${p.name}</span>
          </div>
          <div class="opponent-cards-row">
            <div class="opp-face-down-stack" title="${currentLang === 'fa' ? 'کارت‌های پنهان در دست' : 'Hidden cards in hand'}">
              <svg class="opp-mini-card"><use href="#card-back"/></svg>
              <span class="opp-hidden-count">${unplayedCount}</span>
            </div>
            <div class="opp-played-cards">
              ${p.playedKnights > 0 ? `<span class="played-pill" title="Knights Played"><svg class="played-icon"><use href="${getCardSvgHref('knight')}"/></svg> ${p.playedKnights}</span>` : ''}
            </div>
          </div>
        `;

        el.opponentsDevTrays.appendChild(group);
      });
    }
  }

  function getDevCardTitle(type) {
    const titles = {
      knight: currentLang === 'fa' ? 'شوالیه' : 'Knight',
      road_building: currentLang === 'fa' ? 'جاده‌سازی' : 'Road Building',
      year_of_plenty: currentLang === 'fa' ? 'وفور نعمت' : 'Year of Plenty',
      monopoly: currentLang === 'fa' ? 'انحصار' : 'Monopoly',
      victory_point: currentLang === 'fa' ? 'امتیاز پیروزی' : 'Victory Point'
    };
    return titles[type] || type;
  }

  function getDevCardRules(type) {
    const rules = {
      knight: currentLang === 'fa' 
        ? 'راهزن را به زمین دلخواه منتقل کرده و ۱ کارت منبع از مالک یکی از روستاهای مجاور سرقت کنید. ۳ شوالیه = کارت بزرگترین ارتش (۲ امتیاز).'
        : 'Move the robber to any hex and steal 1 resource from an adjacent settlement/city owner. 3 Knights = Largest Army (2 VP).',
      road_building: currentLang === 'fa'
        ? 'بلافاصله ۲ جاده رایگان روی خطوط مجاز نقشه بسازید بدون مصرف چوب یا آجر.'
        : 'Immediately place 2 free roads on the board without paying lumber or brick.',
      year_of_plenty: currentLang === 'fa'
        ? '۲ کارت منبع دلخواه (یکسان یا متفاوت) مستقیماً از بانک دریافت کنید.'
        : 'Take any 2 resource cards of your choice directly from the bank into your hand.',
      monopoly: currentLang === 'fa'
        ? '۱ نوع منبع اعلام کنید؛ تمام بازیکنان دیگر موظفند همه کارت‌های آن منبع را به شما تحویل دهند.'
        : 'Declare 1 resource type; all other players must surrender all cards of that resource to you.',
      victory_point: currentLang === 'fa'
        ? '۱ امتیاز پیروزی قطعی و پنهان که در انتهای بازی یا زمان پیروزی محاسبه می‌شود.'
        : '1 hidden Victory Point revealed when claiming 10 VP to win the match.'
    };
    return rules[type] || '';
  }

  function openCardDetailModal(card, idx, isOpponent, playerIdx) {
    if (!el.modalCardDetail) return;
    soundEngine.playClick();

    if (el.cardDetailTitle) el.cardDetailTitle.textContent = getDevCardTitle(card.type);
    if (el.cardDetailSvgUse) el.cardDetailSvgUse.setAttribute('href', getCardSvgHref(card.type));
    if (el.cardDetailType) el.cardDetailType.textContent = getDevCardTitle(card.type);
    if (el.cardDetailRules) el.cardDetailRules.textContent = getDevCardRules(card.type);

    const isBoughtThisTurn = card.turnBought !== undefined && card.turnBought >= (state.turnCount || 0);
    const isRollDicePhase = state.phase === 'ROLL_DICE';
    const canPlayPhase = (state.phase === 'PLAYING_TURN');
    const isPlayable = !isOpponent && !card.played && isLocalPlayerTurn() && !state.devCardPlayedThisTurn && !isBoughtThisTurn && canPlayPhase;

    if (el.cardDetailState) {
      if (card.played) {
        el.cardDetailState.textContent = currentLang === 'fa' ? '✨ استفاده شده' : '✨ Already Played';
        el.cardDetailState.className = 'card-detail-state-pill played';
      } else if (card.type === 'victory_point') {
        const viewerP = state.players[playerIdx !== undefined ? playerIdx : getLocalViewerSeat()];
        if (viewerP && viewerP.victoryPoints >= 10) {
          el.cardDetailState.textContent = currentLang === 'fa' ? '🏆 آماده اعلام پیروزی (۱۰ امتیاز)!' : '🏆 Ready to Claim Victory (10 VP)!';
          el.cardDetailState.className = 'card-detail-state-pill playable';
        } else {
          el.cardDetailState.textContent = currentLang === 'fa' ? '⭐ ۱ امتیاز پیروزی (پنهان تا پیروزی)' : '⭐ Permanent Victory Point';
          el.cardDetailState.className = 'card-detail-state-pill vp';
        }
      } else if (isBoughtThisTurn) {
        el.cardDetailState.textContent = currentLang === 'fa' ? '🔒 قفل تا نوبت بعد' : '🔒 Playable next turn';
        el.cardDetailState.className = 'card-detail-state-pill locked';
      } else if (isRollDicePhase && isLocalPlayerTurn()) {
        el.cardDetailState.textContent = currentLang === 'fa' ? '🎲 ابتدا باید تاس بیندازید' : '🎲 Roll dice first';
        el.cardDetailState.className = 'card-detail-state-pill locked';
      } else if (isPlayable) {
        el.cardDetailState.textContent = currentLang === 'fa' ? '✨ آماده بازی' : '✨ Ready to play';
        el.cardDetailState.className = 'card-detail-state-pill playable';
      } else {
        el.cardDetailState.textContent = currentLang === 'fa' ? 'غیرقابل بازی در این لحظه' : 'Cannot play right now';
        el.cardDetailState.className = 'card-detail-state-pill';
      }
    }

    if (el.btnPlayCardConfirm) {
      const viewerP = state.players[playerIdx !== undefined ? playerIdx : getLocalViewerSeat()];
      const canClaimVP = card.type === 'victory_point' && viewerP && viewerP.victoryPoints >= 10 && isLocalPlayerTurn() && !card.played;

      if (!card.played && (isPlayable || canClaimVP)) {
        el.btnPlayCardConfirm.style.display = 'block';
        el.btnPlayCardConfirm.textContent = canClaimVP
          ? (currentLang === 'fa' ? '🏆 اعلام پیروزی (۱۰ امتیاز)' : '🏆 Claim Victory (10 VP)')
          : (currentLang === 'fa' ? '✨ استفاده از کارت' : 'Play Card');
        el.btnPlayCardConfirm.onclick = () => {
          el.modalCardDetail.classList.remove('active');
          handlePlayDevCard(card.type, idx);
        };
      } else {
        el.btnPlayCardConfirm.style.display = 'none';
      }
    }

    el.modalCardDetail.classList.add('active');
  }



  // =========================================================================
  // 10D. DICE HISTOGRAM (2-12 Observed vs Theoretical Gaussian)
  // =========================================================================
  function updateDiceHistogram() {
    if (!el.histogramBarsContainer) return;
    const totalRolls = rollHistory.length;
    if (el.totalRollsCount) {
      el.totalRollsCount.textContent = currentLang === 'fa' ? `${totalRolls} پرتاب ثبت شده` : `${totalRolls} total rolls`;
    }

    el.histogramBarsContainer.innerHTML = '';
    const theoretical = { 2: 2.8, 3: 5.6, 4: 8.3, 5: 11.1, 6: 13.9, 7: 16.7, 8: 13.9, 9: 11.1, 10: 8.3, 11: 5.6, 12: 2.8 };

    for (let sum = 2; sum <= 12; sum++) {
      const count = rollCounts[sum] || 0;
      const actualPct = totalRolls > 0 ? ((count / totalRolls) * 100).toFixed(1) : 0;
      const theoPct = theoretical[sum];

      const col = document.createElement('div');
      col.className = 'histogram-col';

      const barHeight = totalRolls > 0 ? Math.min(100, Math.max(4, (count / totalRolls) * 250)) : 4;
      const isRed = (sum === 6 || sum === 8);

      col.innerHTML = `
        <div class="bar-value">${count > 0 ? count : ''}</div>
        <div class="bar-track">
          <div class="bar-fill ${isRed ? 'high-prob' : ''}" style="height:${barHeight}%;"></div>
        </div>
        <div class="bar-label ${isRed ? 'high-prob' : ''}">${sum}</div>
        <div class="bar-theo">${theoPct}%</div>
      `;

      el.histogramBarsContainer.appendChild(col);
    }
  }

  // =========================================================================
  // 10E. BANK STOCK DISPLAY WITH LOW-SUPPLY WARNINGS
  // =========================================================================
  function updateBankStockDisplay() {
    if (!el.bankStockGrid || !state) return;
    el.bankStockGrid.innerHTML = '';

    const resOrder = ['lumber', 'brick', 'wool', 'grain', 'ore'];
    resOrder.forEach(r => {
      const remaining = state.bank ? (state.bank[r] !== undefined ? state.bank[r] : 19) : 19;
      const isLow = remaining <= 2;

      const item = document.createElement('div');
      item.className = `bank-stock-item ${isLow ? 'low-supply' : ''}`;
      item.innerHTML = `
        <svg class="bank-res-icon"><use href="#icon-${r}"/></svg>
        <span class="bank-res-name">${getResourceName(r)}</span>
        <span class="bank-res-count ${isLow ? 'warning' : ''}">${remaining}</span>
        ${isLow ? `<span class="bank-low-badge">${currentLang === 'fa' ? 'کمبود' : 'Low'}</span>` : ''}
      `;
      el.bankStockGrid.appendChild(item);
    });
  }

  // =========================================================================
  // 10F. DENSITY SETTING CONTROLLER
  // =========================================================================
  function setDensity(mode) {
    infoDensity = mode;
    localStorage.setItem('catan_density', mode);

    const layout = document.getElementById('catan-layout');
    if (layout) {
      layout.classList.remove('density-compact', 'density-standard', 'density-detailed');
      layout.classList.add(`density-${mode}`);
    }

    const btns = document.querySelectorAll('#density-selector-box .density-btn');
    btns.forEach(b => {
      b.classList.toggle('active', b.dataset.density === mode);
    });
  }

  // =========================================================================
  // 10G. MAP EDITOR MODE CONTROLLER
  // =========================================================================
  function openMapEditor() {
    soundEngine.playClick();
    if (!el.modalMapEditor) return;

    // Load draft or generate base 19 template
    if (!currentEditorMap) {
      const savedDraft = localStorage.getItem('catan_custom_map_draft');
      if (savedDraft) {
        try { currentEditorMap = JSON.parse(savedDraft); } catch (e) { currentEditorMap = null; }
      }
      if (!currentEditorMap) {
        const seed = 'EDITOR_' + Math.floor(Math.random() * 10000);
        currentEditorMap = CatanLogic.generateMap({ ruleProfile: 'base', seed });
      }
    }

    mapEditorHistory = [JSON.stringify(currentEditorMap)];
    mapEditorRedoStack = [];

    renderEditorBoard();
    el.modalMapEditor.classList.add('active');
  }

  function renderEditorBoard() {
    if (!currentEditorMap || !el.editorSvgTiles) return;
    const bg = CatanLogic.BOARD_GRAPHS[currentEditorMap.ruleProfile || 'base'] || CatanLogic.BOARD_GRAPHS.base;

    if (el.editorBoardSvg) {
      const isExtended = bg.hexes.length > 19;
      el.editorBoardSvg.setAttribute('viewBox', isExtended ? '-80 -40 680 580' : '-50 0 540 480');
    }

    el.editorSvgTiles.innerHTML = '';
    bg.hexes.forEach(h => {
      const tile = currentEditorMap.tiles[h.id] || { terrain: 'desert' };
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'editor-hex-group');

      const corners = h.vertexIds.map(vId => {
        const v = bg.vertices[vId];
        return `${v.x},${v.y}`;
      }).join(' ');

      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      poly.setAttribute('points', corners);
      poly.setAttribute('class', `hex-polygon terrain-${tile.terrain}`);
      g.appendChild(poly);

      const terrainUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      terrainUse.setAttribute('href', `#tile-${tile.terrain}`);
      terrainUse.setAttribute('x', h.x - 50);
      terrainUse.setAttribute('y', h.y - 58);
      terrainUse.setAttribute('width', 100);
      terrainUse.setAttribute('height', 116);
      g.appendChild(terrainUse);

      if (tile.number) {
        const isHigh = tile.number === 6 || tile.number === 8;
        const tokUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        tokUse.setAttribute('href', isHigh ? '#token-high-prob' : '#token-standard');
        tokUse.setAttribute('x', h.x - 18);
        tokUse.setAttribute('y', h.y - 18);
        tokUse.setAttribute('width', 36);
        tokUse.setAttribute('height', 36);
        g.appendChild(tokUse);

        const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        txt.setAttribute('x', h.x);
        txt.setAttribute('y', h.y + 4);
        txt.setAttribute('text-anchor', 'middle');
        txt.setAttribute('fill', isHigh ? '#c0392b' : '#1e293b');
        txt.setAttribute('font-weight', '900');
        txt.setAttribute('font-size', '14px');
        txt.textContent = tile.number;
        g.appendChild(txt);
      }

      // Click to paint terrain or token
      g.addEventListener('click', () => {
        applyEditorBrushToHex(h.id);
      });

      el.editorSvgTiles.appendChild(g);
    });

    // Validate map
    const valRes = CatanLogic.validateCustomMap(currentEditorMap, currentEditorMap.ruleProfile || 'base', 4);
    if (el.editorValStatus) {
      if (valRes.valid) {
        el.editorValStatus.textContent = currentLang === 'fa' ? '✓ نقشه معتبر و آماده بازی است' : '✓ Map is valid and playable';
        el.editorValStatus.className = 'validation-status valid';
      } else {
        el.editorValStatus.textContent = valRes.errors.join(' | ');
        el.editorValStatus.className = 'validation-status invalid';
      }
    }

    // Stats summary
    const stats = CatanLogic.calculateMapStats(bg, currentEditorMap.tiles);
    if (el.editorStatsSummary && stats) {
      el.editorStatsSummary.textContent = `${stats.totalPips} Pips Total`;
    }
  }

  function applyEditorBrushToHex(hexId) {
    if (!currentEditorMap) return;
    mapEditorHistory.push(JSON.stringify(currentEditorMap));
    mapEditorRedoStack = [];

    const tile = currentEditorMap.tiles[hexId];
    if (!tile) return;

    if (currentEditorBrush === 'robber') {
      currentEditorMap.robberHexId = hexId;
      currentEditorMap.tiles.forEach(t => t.hasRobber = (t.id === hexId));
    } else if (currentEditorBrush === 'token') {
      tile.number = currentEditorToken;
      tile.pips = CatanLogic.DICE_PIPS[currentEditorToken] || 0;
    } else {
      tile.terrain = currentEditorBrush;
      if (tile.terrain === 'desert') {
        tile.number = null;
        tile.pips = 0;
      } else if (!tile.number) {
        tile.number = currentEditorToken || 6;
        tile.pips = CatanLogic.DICE_PIPS[tile.number] || 0;
      }
    }

    renderEditorBoard();
  }

  function setupMapEditorControls() {
    // Template select
    if (el.editorTemplateSelect) {
      el.editorTemplateSelect.addEventListener('change', (e) => {
        const prof = e.target.value;
        const seed = 'EDITOR_' + Math.floor(Math.random() * 10000);
        currentEditorMap = CatanLogic.generateMap({ ruleProfile: prof, seed });
        mapEditorHistory = [JSON.stringify(currentEditorMap)];
        mapEditorRedoStack = [];
        renderEditorBoard();
      });
    }

    // Terrain Brush tools
    document.querySelectorAll('.editor-tool-btn[data-brush]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.editor-tool-btn[data-brush]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentEditorBrush = btn.dataset.brush;
      });
    });

    // Token palette
    document.querySelectorAll('#editor-token-palette .token-picker-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#editor-token-palette .token-picker-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentEditorToken = parseInt(btn.dataset.num, 10);
        currentEditorBrush = 'token';
      });
    });

    // Undo / Redo
    if (el.btnEditorUndo) {
      el.btnEditorUndo.addEventListener('click', () => {
        if (mapEditorHistory.length > 1) {
          mapEditorRedoStack.push(mapEditorHistory.pop());
          currentEditorMap = JSON.parse(mapEditorHistory[mapEditorHistory.length - 1]);
          renderEditorBoard();
        }
      });
    }

    if (el.btnEditorRedo) {
      el.btnEditorRedo.addEventListener('click', () => {
        if (mapEditorRedoStack.length > 0) {
          const next = mapEditorRedoStack.pop();
          mapEditorHistory.push(next);
          currentEditorMap = JSON.parse(next);
          renderEditorBoard();
        }
      });
    }

    // Auto-fix
    if (el.btnEditorAutofix) {
      el.btnEditorAutofix.addEventListener('click', () => {
        if (currentEditorMap) {
          mapEditorHistory.push(JSON.stringify(currentEditorMap));
          currentEditorMap = CatanLogic.autoFixMap(currentEditorMap);
          renderEditorBoard();
          notify(currentLang === 'fa' ? '✨ نقشه به صورت خودکار اصلاح و متعادل شد!' : '✨ Map auto-fixed and balanced!');
        }
      });
    }

    // Save Draft
    if (el.btnEditorSaveDraft) {
      el.btnEditorSaveDraft.addEventListener('click', () => {
        if (currentEditorMap) {
          localStorage.setItem('catan_custom_map_draft', JSON.stringify(currentEditorMap));
          notify(currentLang === 'fa' ? '💾 پیش‌نویس نقشه با موفقیت ذخیره شد!' : '💾 Map draft saved to storage!');
        }
      });
    }

    // Duplicate
    if (el.btnEditorDuplicate) {
      el.btnEditorDuplicate.addEventListener('click', () => {
        if (currentEditorMap) {
          const clone = JSON.parse(JSON.stringify(currentEditorMap));
          clone.seed = 'COPY_' + Math.floor(Math.random() * 10000);
          currentEditorMap = clone;
          mapEditorHistory.push(JSON.stringify(currentEditorMap));
          renderEditorBoard();
          notify(currentLang === 'fa' ? '📋 یک نسخه کپی از نقشه ایجاد شد.' : '📋 Cloned map into a new copy.');
        }
      });
    }

    // Play Map
    if (el.btnEditorPlayMap) {
      el.btnEditorPlayMap.addEventListener('click', () => {
        if (!currentEditorMap) return;
        const val = CatanLogic.validateCustomMap(currentEditorMap, currentEditorMap.ruleProfile || 'base', 4);
        if (!val.valid) {
          notify(currentLang === 'fa' ? '⚠️ ابتدا نقشه را اصلاح کنید تا معتبر شود.' : '⚠️ Please fix validation errors first.');
          return;
        }
        closeAllModals();
        startSoloMatch(4);
        state.tiles = JSON.parse(JSON.stringify(currentEditorMap.tiles));
        state.robberHexId = currentEditorMap.robberHexId;
        renderBoardBase();
        updateUI();
        notify(currentLang === 'fa' ? '🎮 مسابقه با نقشه اختصاصی آغاز شد!' : '🎮 Match started with custom map!');
      });
    }

    if (el.btnCloseEditor) {
      el.btnCloseEditor.addEventListener('click', () => {
        if (el.modalMapEditor) el.modalMapEditor.classList.remove('active');
      });
    }
  }

  // =========================================================================
  // 10H. LOBBY MAP PREVIEW & LIVE REPRODUCTION
  // =========================================================================
  function updateLobbyMapPreview(seed, profile) {
    if (!el.lobbyPreviewTiles) return;
    try {
      const map = CatanLogic.generateMap({ ruleProfile: profile || 'base', seed: seed || 'SEED1' });
      const bg = CatanLogic.BOARD_GRAPHS[profile || 'base'] || CatanLogic.BOARD_GRAPHS.base;

      if (el.lobbyPreviewSvg) {
        const isExtended = bg.hexes.length > 19;
        el.lobbyPreviewSvg.setAttribute('viewBox', isExtended ? '-80 -40 680 580' : '-50 0 540 480');
      }

      el.lobbyPreviewTiles.innerHTML = '';
      bg.hexes.forEach(h => {
        const tile = map.tiles[h.id] || { terrain: 'desert' };
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        const corners = h.vertexIds.map(vId => {
          const v = bg.vertices[vId];
          return `${v.x},${v.y}`;
        }).join(' ');

        const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        poly.setAttribute('points', corners);
        poly.setAttribute('class', `hex-polygon terrain-${tile.terrain}`);
        g.appendChild(poly);

        if (tile.number) {
          const isHigh = tile.number === 6 || tile.number === 8;
          const tok = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          tok.setAttribute('cx', h.x);
          tok.setAttribute('cy', h.y);
          tok.setAttribute('r', 12);
          tok.setAttribute('fill', isHigh ? '#fee2e2' : '#ffffff');
          tok.setAttribute('stroke', isHigh ? '#c0392b' : '#334155');
          tok.setAttribute('stroke-width', '1.5');
          g.appendChild(tok);

          const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          txt.setAttribute('x', h.x);
          txt.setAttribute('y', h.y + 4);
          txt.setAttribute('text-anchor', 'middle');
          txt.setAttribute('fill', isHigh ? '#c0392b' : '#1e293b');
          txt.setAttribute('font-weight', '900');
          txt.setAttribute('font-size', '10px');
          txt.textContent = tile.number;
          g.appendChild(txt);
        }

        el.lobbyPreviewTiles.appendChild(g);
      });

      const stats = CatanLogic.calculateMapStats(bg, map.tiles);
      if (el.previewStatsPips && stats) {
        el.previewStatsPips.textContent = `${stats.totalPips} Total Pips | Seed: ${seed}`;
      }
    } catch (e) {
      console.warn('Lobby preview error:', e);
    }
  }

  function setupEventListeners() {
    // Activity Hub Toggle (Show / Hide Button on Bottom Right)
    if (el.btnToggleActivityHub) {
      el.btnToggleActivityHub.addEventListener('click', () => {
        soundEngine.playClick();
        if (!el.activityHubPanel) return;
        const isHidden = el.activityHubPanel.style.display === 'none';
        el.activityHubPanel.style.display = isHidden ? 'flex' : 'none';
        if (isHidden && el.unreadChatDot) {
          el.unreadChatDot.style.display = 'none';
        }
      });
    }

    if (el.btnCloseActivity) {
      el.btnCloseActivity.addEventListener('click', () => {
        soundEngine.playClick();
        if (el.activityHubPanel) {
          el.activityHubPanel.style.display = 'none';
        }
      });
    }

    // Activity Hub Tabs (Log vs Chat)
    if (el.tabBtnLog) {
      el.tabBtnLog.addEventListener('click', () => {
        soundEngine.playClick();
        if (el.tabBtnLog) el.tabBtnLog.classList.add('active');
        if (el.tabBtnChat) el.tabBtnChat.classList.remove('active');
        if (el.activityViewLog) el.activityViewLog.style.display = 'flex';
        if (el.activityViewChat) el.activityViewChat.style.display = 'none';
      });
    }

    if (el.tabBtnChat) {
      el.tabBtnChat.addEventListener('click', () => {
        soundEngine.playClick();
        if (el.tabBtnChat) el.tabBtnChat.classList.add('active');
        if (el.tabBtnLog) el.tabBtnLog.classList.remove('active');
        if (el.activityViewChat) el.activityViewChat.style.display = 'flex';
        if (el.activityViewLog) el.activityViewLog.style.display = 'none';
        if (el.unreadChatDot) el.unreadChatDot.style.display = 'none';
        if (el.sideChatInput) el.sideChatInput.focus();
      });
    }

    // In-game Chat Form
    if (el.sideChatForm) {
      el.sideChatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = (el.sideChatInput && el.sideChatInput.value || '').trim();
        if (!text) return;
        el.sideChatInput.value = '';

        if (gameMode === 'online') {
          sendWsMessage({ type: 'CHAT', text });
        } else {
          // Solo mode: append player chat and trigger friendly bot reply
          const playerName = (state && state.players[0] && state.players[0].name) || 'You';
          appendChatMessage(playerName, text, true);
          safePlaySound('playClick');

          setTimeout(() => {
            if (!state || state.players.length < 2) return;
            const bot1 = state.players[1];
            const botReplies = [
              currentLang === 'fa' ? 'بازی خوبی است، موفق باشی!' : 'Good luck, let us play well!',
              currentLang === 'fa' ? 'کسی گوسفند یا چوب اضافی برای معامله دارد؟' : 'Anyone have surplus sheep or lumber to trade?',
              currentLang === 'fa' ? 'امیدوارم تاس بعدی راهزن را فعال نکند!' : 'Hope the next roll is not a 7!',
              currentLang === 'fa' ? 'طولانی‌ترین جاده مال من خواهد بود!' : 'The longest road will be mine!',
              currentLang === 'fa' ? 'استراتژی هوشمندانه‌ای داری!' : 'Smart strategy!'
            ];
            const randomReply = botReplies[Math.floor(Math.random() * botReplies.length)];
            appendChatMessage(bot1.name, randomReply, false);
            safePlaySound('playResourceChime');
          }, 1400);
        }
      });
    }

    // Incoming Trade Offer Accept / Decline
    if (el.btnAcceptTradeOffer) {
      el.btnAcceptTradeOffer.addEventListener('click', () => {
        soundEngine.playClick();
        if (botTradeAutoTimeout) { clearTimeout(botTradeAutoTimeout); botTradeAutoTimeout = null; }
        if (el.modalTradeOffer) el.modalTradeOffer.classList.remove('active');
        if (pendingBotTradeCallback) {
          const cb = pendingBotTradeCallback;
          pendingBotTradeCallback = null;
          cb(true);
        }
      });
    }

    if (el.btnDeclineTradeOffer) {
      el.btnDeclineTradeOffer.addEventListener('click', () => {
        soundEngine.playClick();
        if (botTradeAutoTimeout) { clearTimeout(botTradeAutoTimeout); botTradeAutoTimeout = null; }
        if (el.modalTradeOffer) el.modalTradeOffer.classList.remove('active');
        if (pendingBotTradeCallback) {
          const cb = pendingBotTradeCallback;
          pendingBotTradeCallback = null;
          cb(false);
        }
      });
    }

    if (el.btnCloseTradeOffer) {
      el.btnCloseTradeOffer.addEventListener('click', () => {
        soundEngine.playClick();
        if (botTradeAutoTimeout) { clearTimeout(botTradeAutoTimeout); botTradeAutoTimeout = null; }
        if (el.modalTradeOffer) el.modalTradeOffer.classList.remove('active');
        if (pendingBotTradeCallback) {
          const cb = pendingBotTradeCallback;
          pendingBotTradeCallback = null;
          cb(false);
        }
      });
    }



    // Dice Histogram Panel Toggle
    if (el.btnToggleHistogram) {
      el.btnToggleHistogram.addEventListener('click', () => {
        soundEngine.playClick();
        if (el.diceHistogramPanel) {
          const isOpen = el.diceHistogramPanel.style.display === 'block';
          el.diceHistogramPanel.style.display = isOpen ? 'none' : 'block';
          if (!isOpen) updateDiceHistogram();
        }
      });
    }

    // Build Costs Accordion Toggle
    if (el.btnToggleCosts) {
      el.btnToggleCosts.addEventListener('click', () => {
        soundEngine.playClick();
        if (el.buildCostsBody) {
          const isOpen = el.buildCostsBody.style.display !== 'none';
          el.buildCostsBody.style.display = isOpen ? 'none' : 'block';
        }
      });
    }

    // Buy Dev Card directly from deck
    if (el.btnBuyDevDeck) {
      el.btnBuyDevDeck.addEventListener('click', () => {
        if (!state || !isLocalPlayerTurn()) return;
        soundEngine.playClick();
        const localViewer = state.players[getLocalViewerSeat()];
        if (!CatanLogic.canBuyDevCard(state, localViewer.id)) {
          notify(currentLang === 'fa'
            ? '⚠️ منابع کافی نیست! خرید کارت شانس: ۱ گوسفند + ۱ گندم + ۱ سنگ'
            : '⚠️ Not enough resources! Dev card costs 1 Wool + 1 Grain + 1 Ore');
          return;
        }
        if (gameMode === 'online') {
          sendWsMessage({ type: 'CATAN_BUY_DEV' });
        } else {
          const res = CatanLogic.buyDevCard(state, state.activePlayer);
          if (res.valid) {
            logGameAction('dev', 'شما یک کارت شانس خریدید.', '📜');
            safePlaySound('playCardWhoosh');
            notify(currentLang === 'fa' ? 'یک کارت شانس خریداری شد!' : 'Bought a Development Card!');
            updateUI();
          }
        }
      });
    }

    // Card Detail Modal Close
    if (el.btnCloseCardDetail) {
      el.btnCloseCardDetail.addEventListener('click', () => {
        soundEngine.playClick();
        if (el.modalCardDetail) el.modalCardDetail.classList.remove('active');
      });
    }

    // Map Editor Launchers
    if (el.btnOpenEditor) el.btnOpenEditor.addEventListener('click', openMapEditor);

    const btnLobbyOpenEditor = document.getElementById('btn-lobby-open-editor');
    if (btnLobbyOpenEditor) btnLobbyOpenEditor.addEventListener('click', openMapEditor);

    // Board Summary Text Modal
    if (el.btnBoardSummary) {
      el.btnBoardSummary.addEventListener('click', () => {
        soundEngine.playClick();
        if (!state) return;
        const bg = (state && state.boardGraph) || CatanLogic.getBoardGraph(state) || CatanLogic.BOARD_GRAPHS.base;
        const stats = CatanLogic.calculateMapStats(bg, state.tiles);

        if (el.boardSummaryContent && stats) {
          const lines = [
            `🗺️ نقشه کاتان (${state.ruleProfile || 'base'} - ${bg.hexes.length} خانه‌ها)`,
            `📊 مجموع پیپ‌ها: ${stats.totalPips}`,
            `🪵 چوب: ${stats.pipCountsByResource.lumber || 0} پیپ`,
            `🧱 آجر: ${stats.pipCountsByResource.brick || 0} پیپ`,
            `🐑 گوسفند: ${stats.pipCountsByResource.wool || 0} پیپ`,
            `🌾 گندم: ${stats.pipCountsByResource.grain || 0} پیپ`,
            `🪨 سنگ: ${stats.pipCountsByResource.ore || 0} پیپ`,
            '',
            '🏆 قوی‌ترین موقعیت‌های شروع مسابقه:',
            ...(stats.strongestLocations || []).map((loc, idx) => `${idx + 1}. تقاطع #${loc.vertexId}: ${loc.pips} پیپ (${loc.yields.map(y => `${getResourceName(y.resource)} ${y.number}`).join('، ')})`)
          ];
          el.boardSummaryContent.innerHTML = `<pre style="white-space:pre-wrap; line-height:1.6; font-size:0.9rem; color:#fff;">${lines.join('\n')}</pre>`;
        }
        if (el.modalBoardSummary) el.modalBoardSummary.classList.add('active');
      });
    }

    if (el.btnCloseSummary) {
      el.btnCloseSummary.addEventListener('click', () => {
        soundEngine.playClick();
        if (el.modalBoardSummary) el.modalBoardSummary.classList.remove('active');
      });
    }

    // Lobby Config Controls
    if (el.lobbyRuleProfileSelect) {
      el.lobbyRuleProfileSelect.addEventListener('change', (e) => {
        const prof = e.target.value;
        const currentSeed = el.lobbySeedInput ? el.lobbySeedInput.value : 'SEED1';
        updateLobbyMapPreview(currentSeed, prof);
        sendWsMessage({ type: 'CATAN_CONFIG_UPDATE', config: { ruleProfile: prof } });
      });
    }

    if (el.lobbyPlayerCountSelect) {
      el.lobbyPlayerCountSelect.addEventListener('change', (e) => {
        const count = parseInt(e.target.value, 10);
        sendWsMessage({ type: 'CATAN_CONFIG_UPDATE', config: { playerCount: count } });
      });
    }

    if (el.btnLobbyRandomSeed) {
      el.btnLobbyRandomSeed.addEventListener('click', () => {
        soundEngine.playClick();
        const randSeed = 'CATAN_' + Math.random().toString(36).substring(2, 7).toUpperCase();
        if (el.lobbySeedInput) el.lobbySeedInput.value = randSeed;
        const prof = el.lobbyRuleProfileSelect ? el.lobbyRuleProfileSelect.value : 'base';
        updateLobbyMapPreview(randSeed, prof);
        sendWsMessage({ type: 'CATAN_CONFIG_UPDATE', config: { mapSeed: randSeed } });
      });
    }

    if (el.btnLobbyCopySeed) {
      el.btnLobbyCopySeed.addEventListener('click', () => {
        soundEngine.playClick();
        const seedVal = el.lobbySeedInput ? el.lobbySeedInput.value : '';
        navigator.clipboard.writeText(seedVal).then(() => {
          notify(currentLang === 'fa' ? 'سید نقشه در کلیپ‌بورد کپی شد!' : 'Map seed copied to clipboard!');
        });
      });
    }

    if (el.lobbySeedInput) {
      el.lobbySeedInput.addEventListener('change', (e) => {
        const seedVal = e.target.value.trim().toUpperCase();
        const prof = el.lobbyRuleProfileSelect ? el.lobbyRuleProfileSelect.value : 'base';
        updateLobbyMapPreview(seedVal, prof);
        sendWsMessage({ type: 'CATAN_CONFIG_UPDATE', config: { mapSeed: seedVal } });
      });
    }

    setupMapEditorControls();
    if (el.btnSound) el.btnSound.addEventListener('click', toggleSound);
    if (el.btnLang) el.btnLang.addEventListener('click', toggleLanguage);
    if (el.btnRules) el.btnRules.addEventListener('click', () => {
      soundEngine.playClick();
      if (el.modalRules) el.modalRules.classList.add('active');
    });
    if (el.btnChat) el.btnChat.addEventListener('click', () => {
      soundEngine.playClick();
      if (el.tabBtnChat) el.tabBtnChat.click();
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
          logGameAction('dev', 'شما یک کارت شانس خریدید.', '📜');
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
          logGameAction('trade', `تبادل با بانک: ${tradeGiveRes} داده شد و ${tradeGetRes} دریافت شد.`, '🔄');
          safePlaySound('playResourceChime');
          notify(currentLang === 'fa' ? 'تبادل با بانک با موفقیت انجام شد!' : 'Bank trade executed successfully!');
          closeTradeModal();
          updateUI();
        } else {
          notify(res.message);
        }
      }
    });

    if (el.tabBankTrade) {
      el.tabBankTrade.addEventListener('click', () => {
        soundEngine.playClick();
        el.tabBankTrade.classList.add('active');
        if (el.tabPlayerTrade) el.tabPlayerTrade.classList.remove('active');
        if (el.panelBankTrade) el.panelBankTrade.style.display = 'block';
        if (el.panelPlayerTrade) el.panelPlayerTrade.style.display = 'none';
      });
    }

    if (el.tabPlayerTrade) {
      el.tabPlayerTrade.addEventListener('click', () => {
        soundEngine.playClick();
        el.tabPlayerTrade.classList.add('active');
        if (el.tabBankTrade) el.tabBankTrade.classList.remove('active');
        if (el.panelBankTrade) el.panelBankTrade.style.display = 'none';
        if (el.panelPlayerTrade) el.panelPlayerTrade.style.display = 'block';
        renderPlayerTradePanel();
      });
    }

    if (el.btnProposePlayerTrade) {
      el.btnProposePlayerTrade.addEventListener('click', handleProposePlayerTrade);
    }

    // Dedicated Monopoly Modal Controls
    const btnCloseMonopoly = document.getElementById('btn-close-monopoly') || el.btnCloseMonopoly;
    if (btnCloseMonopoly) btnCloseMonopoly.addEventListener('click', () => {
      soundEngine.playClick();
      if (el.modalMonopoly) el.modalMonopoly.classList.remove('active');
    });

    const btnCancelMonopoly = document.getElementById('btn-cancel-monopoly') || el.btnCancelMonopoly;
    if (btnCancelMonopoly) btnCancelMonopoly.addEventListener('click', () => {
      soundEngine.playClick();
      if (el.modalMonopoly) el.modalMonopoly.classList.remove('active');
    });

    // Dedicated Year of Plenty Modal Controls
    const btnCloseYop = document.getElementById('btn-close-yop') || el.btnCloseYop;
    if (btnCloseYop) btnCloseYop.addEventListener('click', () => {
      soundEngine.playClick();
      if (el.modalYop) el.modalYop.classList.remove('active');
    });

    const btnCancelYop = document.getElementById('btn-cancel-yop') || el.btnCancelYop;
    if (btnCancelYop) btnCancelYop.addEventListener('click', () => {
      soundEngine.playClick();
      if (el.modalYop) el.modalYop.classList.remove('active');
    });

    const btnConfirmYop = document.getElementById('btn-confirm-yop') || el.btnConfirmYop;
    if (btnConfirmYop) {
      btnConfirmYop.addEventListener('click', () => {
        const chosen = [];
        for (const [r, count] of Object.entries(yopSelectedCounts)) {
          for (let i = 0; i < count; i++) chosen.push(r);
        }
        if (chosen.length !== 2) return;

        soundEngine.playClick();
        if (el.modalYop) el.modalYop.classList.remove('active');

        if (gameMode === 'online') {
          sendWsMessage({
            type: 'CATAN_PLAY_DEV',
            cardType: 'year_of_plenty',
            cardIdx: activePlayingDevIdx,
            resources: chosen
          });
        } else {
          const res = CatanLogic.playDevCard(state, state.activePlayer, {
            cardType: 'year_of_plenty',
            cardIdx: activePlayingDevIdx,
            resources: chosen
          });
          if (res.valid) {
            logGameAction('dev', 'شما کارت وفور نعمت بازی کردید و ۲ منبع از بانک دریافت کردید.', '🌾');
            safePlaySound('playResourceChime');
            notify(currentLang === 'fa' ? '۲ منبع از بانک دریافت شد!' : 'Received 2 resources from bank!');
            updateUI();
          }
        }
      });
    }

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

    // Game Over Rematch & Menu & Hub
    const btnRematch = document.getElementById('btn-gameover-rematch') || el.btnGameoverRematch;
    if (btnRematch) btnRematch.addEventListener('click', () => {
      soundEngine.playClick();
      if (el.modalGameover) el.modalGameover.classList.remove('active');
      const count = state ? state.playerCount : 3;
      if (gameMode === 'passplay') {
        startPassPlayMatch(count);
      } else {
        startSoloMatch(count);
      }
    });

    const btnGoMenu = document.getElementById('btn-gameover-menu') || el.btnGameoverMenu;
    if (btnGoMenu) btnGoMenu.addEventListener('click', () => {
      soundEngine.playClick();
      if (el.modalGameover) el.modalGameover.classList.remove('active');
      if (el.modalMainMenu) el.modalMainMenu.classList.add('active');
    });

    const btnGoHub = document.getElementById('btn-gameover-hub') || el.btnGameoverHub;
    if (btnGoHub) btnGoHub.addEventListener('click', () => {
      soundEngine.playClick();
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
    setDensity(infoDensity);


    // Initialize dice so they are never blank
    if (el.die1) renderDieFace(el.die1, 1);
    if (el.die2) renderDieFace(el.die2, 1);
    if (el.diceSumBadge) el.diceSumBadge.textContent = '-';

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
