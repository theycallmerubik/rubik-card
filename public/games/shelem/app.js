/**
 * Shelem Card Game - Frontend Application Controller
 * Pure Vanilla JavaScript (Zero external libraries)
 * Supports:
 * 1. Pre-game settings (With/Without Jokers, Custom Winning Goal)
 * 2. In-game Leaderboard & Points History
 * 3. 15-second visual progressive turn timer
 * 4. AI replacement after 3 hands AFK (not immediately) with Take Back Control
 * 5. Full bilingual Persian/English localization with RTL/LTR support
 */

(function () {
  'use strict';

  const L = window.ShelemLogic;
  const Sound = window.soundEngine || window.HokmSound || {
    playCardSlide: () => {},
    playTrickWin: () => {},
    playTableKnock: () => {},
    playHokmSlam: () => {},
    playCardPlay: () => {},
    playFanfare: () => {},
    playNotification: () => {},
    toggleSound: () => true,
    isSoundEnabled: () => true
  };

  // --- Translations Dictionary ---
  const I18N = {
    en: {
      gameTitle: 'Shelem',
      hokmLabel: 'Hokm:',
      widowTableDecor: 'Widow Cards',
      leadFirstCardHakem: 'You are Hakem! Play your first card to reveal Trump.',
      leadFirstCardBot: '{name} is Hakem and will play the first card to reveal Trump...',
      biddingTitle: 'Bidding Phase (Shelem)',
      biddingPrompt: 'Inspect your 12 cards below and bid or Pass:',
      yourHandLabel: 'Your Hand (12 Cards):',
      highestBidLabel: 'Highest Bid:',
      bidderLabel: 'Bidder:',
      passBtn: '✋ Pass',
      widowTitle: 'Widow Cards & Discard {count}',
      widowPrompt: 'You won the bid! {widowCount} widow cards were added to your hand. Select {count} cards to discard:',
      selectedCount: 'Selected:',
      confirmDiscardBtn: 'Confirm Discards',
      chatTitle: 'Game Chat & Log',
      muteChatBtn: 'Mute chat notifications',
      unmuteChatBtn: 'Unmute chat notifications',
      chatPlaceholder: 'Type a message...',
      chatInitMsg: 'Shelem match initialized. Good luck!',
      chooseTrumpTitle: 'Declare Trump Suit (Hokm)',
      chooseTrumpPrompt: 'Select the trump suit for this round:',
      suitSpades: 'Spades',
      suitHearts: 'Hearts',
      suitDiamonds: 'Diamonds',
      suitClubs: 'Clubs',
      continueBtn: 'Continue Next Round',
      mainMenuTitle: 'Shelem Card Game',
      mainMenuSubtitle: 'Online & Offline Shelem',
      menuSoloTitle: 'Solo vs Smart Bots',
      menuSoloDesc: 'Instant offline play (no internet needed)',
      menuOnlineTitle: 'Online & LAN Multiplayer',
      menuOnlineDesc: 'Create room or play with friends',
      menuRulesTitle: 'Game Rules',
      menuRulesDesc: 'How to play Shelem, bidding and contracts',
      menuHubTitle: 'All Games Hub',
      menuHubDesc: 'Return to Main Game Menu',
      resumeGameDesc: 'Return to your ongoing match',
      multiplayerTitle: 'Play Online / LAN',
      multiplayerDesc: 'Play with friends on other PCs or phones, or practice solo with smart bots.',
      roomCodeLabel: 'Room Code:',
      copyLinkBtn: '📋 Copy Link',
      leaveRoomBtn: 'Leave',
      yourNameLabel: 'Your Name:',
      createRoomBtn: 'Create Room',
      joinRoomBtn: 'Join Room',
      enterRoomCodeLabel: 'Enter 4-Character Room Code:',
      joinBtn: 'Join',
      playOfflineBots: '🤖 Play Offline vs Bots (No Server Needed)',
      waitingForHost: 'Waiting for host to start...',
      hostRearrangeHint: '👑 Host: Click "⇄ Swap" or "⇄ Switch Team", or drag players to rearrange teams.',
      swapSeat: '⇄ Swap',
      switchTeam: '⇄ Switch Team',
      swapWithThis: '⇄ Swap With This',
      cancelSwap: '✕ Cancel',
      takeSeat: 'Take Seat',
      changeNameBtn: 'Change Name',
      saveNameBtn: 'Save',
      nameUpdatedMsg: 'Your name was changed to {name}',
      partnerRole: 'Your Partner',
      opponentRole: 'Opponent',
      biddingOtherWaitingPrompt: 'Selecting bid amount... Panel is disabled for others.',
      youBadge: 'YOU',
      openSeat: 'Open Seat',
      team1Subtitle: 'South & North',
      team2Subtitle: 'West & East',
      seatSouth: 'South',
      seatWest: 'West',
      seatNorth: 'North (Partner)',
      seatEast: 'East',
      menuTitle: 'Shelem Menu',
      resumeGame: 'Resume Game',
      newMatch: 'New Match',
      hubTitle: 'Game Hub',
      rulesTitle: 'Shelem Rules & Guide',
      closeBtn: 'Close',
      welcomeMsg: 'Welcome! Get ready to play.',
      contractInitial: 'Contract: ---',
      pileTeam1: 'T1',
      pileTeam2: 'T2',
      lastTrickTitle: 'Last Hand Played',
      viewTricksHint: 'View',
      noTricksYet: 'No tricks played yet this round.',
      wonByMsg: 'Hand won by {name} with {card}',
      contractLabel: 'Contract: {bid} ({name})',
      passedMsg: '{name} passed.',
      bidMsg: '{name} bid {bid}!',
      allPassedMsg: 'All players passed! Redealing cards...',
      bidWonMsg: '{name} won the contract with {bid}!',
      trumpDeclaredMsg: '{name} declared Trump as {suit}!',
      yourTurnMsg: 'Your turn! Choose a card to play.',
      botTurnMsg: "{name}'s turn...",
      trickWonMsg: '{name} won the trick! (+{pts} pts)',
      contractMetMsg: 'Team {team} met their contract of {bid}! (+{pts} pts)',
      contractFailedMsg: 'Team {team} failed their contract of {bid}! (-{bid} pts penalty)',
      shelemWonMsg: 'SHELEM! All points won! (+{pts} pts)',
      shelemFailedMsg: 'SHELEM FAILED! (-{pts} pts penalty)',
      matchWonMsg: 'MATCH OVER! Team {team} won the match! 🏆',
      roundCompleteTitle: 'Round Complete!',
      roundScoreDesc: 'Team 1: {t1Pts} pts | Team 2: {t2Pts} pts (Contract: {bid})',
      team1: 'Team 1 (You & Partner)',
      team2: 'Team 2 (Opponents)',
      team1Short: 'Team 1 (You & Partner)',
      team2Short: 'Team 2 (Opponents)',
      playerSouth: 'You',
      playerWest: 'West',
      playerNorth: 'Partner',
      playerEast: 'East',
      aiPlayingForYou: '🤖 AI is playing for you',
      aiReplaced3Rounds: '🤖 Replaced by AI (idle 3 hands)',
      takeControlBtn: '🎮 Take Back Control',
      timedOutNotice: 'Timed out ({count}/3). Auto-playing move.',
      // Settings Modal
      settingsTitle: 'Game Settings',
      settingsPrompt: 'Configure rules and winning goal before playing:',
      deckModeTitle: 'Deck Mode (Jokers)',
      deckStandardTitle: 'Without Jokers (52 Cards)',
      deckStandardDesc: '165 Total Points • 4 Widow Cards',
      deckJokersTitle: 'With 2 Jokers (54 Cards)',
      deckJokersDesc: '200 Total Points • 6 Widow Cards',
      winningGoalTitle: 'Winning Score Goal',
      goal900: '900 Points',
      goal1165: '1165 Points',
      goal1200: '1200 Points',
      goalFast: 'Fast Match',
      goalClassic: 'Classic Shelem',
      goalStandard: 'Standard Match',
      goalCustom: 'Custom',
      goalCustomDesc: 'Enter target',
      customGoalLabel: 'Target Points:',
      startGameBtn: 'Start Match 🎮',
      cancelBtn: 'Cancel',
      // Leaderboard Modal
      leaderboardTitle: 'Leaderboard & Points History',
      thRound: 'Round',
      thContract: 'Contract',
      thTrump: 'Trump',
      thT1Pts: 'T1 Pts',
      thT2Pts: 'T2 Pts',
      thOutcome: 'Outcome',
      thTotal: 'Total (T1 - T2)',
      noRoundsYet: 'No rounds played yet. Points history will appear here as you play.',
      contractMetTag: 'Met',
      contractFailedTag: 'Failed',
      shelemTag: 'Shelem',
      rulesHtml: `
        <h4>1. Objective</h4>
        <p>Shelem is a 4-player partnership game (You and Partner vs East and West). The first team to reach the target score (default 1,165 points) wins the match.</p>
        <h4>2. Bidding Phase</h4>
        <p>Players bid clockwise starting from 100 in steps of 5 (100, 105, 110...). The highest bidder wins the contract, becomes Hakem, and takes the widow cards.</p>
        <h4>3. Widow Cards & Discard</h4>
        <p>The Hakem picks up the widow cards (4 cards in standard mode, 6 cards when playing with 2 Jokers) and discards the exact same number of cards back to the widow pile. Then the Hakem declares the trump suit.</p>
        <h4>4. Hand Scores & Card Values</h4>
        <p>• <strong>Each hand/trick won:</strong> 5 points by default (13 hands = 65 pts).<br>
        • <strong>Bonus Cards:</strong> 5s = 5 pts | 10s = 10 pts | Aces = 10 pts (40+40+20 = 100 pts).<br>
        • <strong>Jokers:</strong> Big Joker = 20 pts | Small Joker = 15 pts (35 pts total with Jokers).<br>
        • <em>(Kings, Queens, Jacks, and 2-9 have 0 bonus points; only the 5 default hand points).</em><br>
        • Winner of the last trick also receives the discarded widow cards and its 5-point hand value.<br>
        • Total round points: 165 (without Jokers) or 200 (with 2 Jokers).</p>
        <h4>5. Scoring & Penalties</h4>
        <p>If the bidding team makes their contract, their points are added to their score. If they fail, they are penalized by the full bid amount!</p>
      `
    },
    fa: {
      gameTitle: 'شلم',
      hokmLabel: 'حکم:',
      widowTableDecor: 'کارت‌های زمین',
      leadFirstCardHakem: 'شما حاکم هستید! برگ نخست را بازی کنید تا حکم رونمایی شود.',
      leadFirstCardBot: '{name} حاکم است و با بازی اولین برگ، حکم رونمایی می‌شود...',
      biddingTitle: 'مرحله خواندن تعهد (شلم)',
      biddingPrompt: 'برگ‌های ۱۲ گانه خود را مشاهده کرده و تعهد امتیاز دهید یا پاس بگویید:',
      yourHandLabel: 'برگ‌های دست شما (۱۲ برگ):',
      highestBidLabel: 'بالاترین تعهد:',
      bidderLabel: 'پیشنهاد دهنده:',
      passBtn: '✋ پاس (Pass)',
      widowTitle: 'برداشتن زمین و انداختن {count} برگ',
      widowPrompt: 'شما تعهد را بردید! {widowCount} برگ زمین به دست شما اضافه شد. {count} برگ را برای انداختن انتخاب کنید:',
      selectedCount: 'انتخاب شده:',
      confirmDiscardBtn: 'تأیید و انداختن برگ‌ها',
      chatTitle: 'پیام‌ها و گزارش بازی',
      muteChatBtn: 'قطع اعلان پیام‌ها',
      unmuteChatBtn: 'فعال‌سازی اعلان پیام‌ها',
      chatPlaceholder: 'پیامی بنویسید...',
      chatInitMsg: 'بازی شلم آماده شد. موفق باشید!',
      chooseTrumpTitle: 'تعیین خال حکم',
      chooseTrumpPrompt: 'خال حکم این دور را انتخاب کنید:',
      suitSpades: 'پیک (♠)',
      suitHearts: 'دل (♥)',
      suitDiamonds: 'خشت (♦)',
      suitClubs: 'گشنیز (♣)',
      continueBtn: 'ادامه دور بعد',
      mainMenuTitle: 'بازی پاسور شلم',
      mainMenuSubtitle: 'بازی آنلاین و آفلاین شلم',
      menuSoloTitle: 'تک‌نفره با ربات‌های هوشمند',
      menuSoloDesc: 'بازی آفلاین بدون نیاز به اینترنت',
      menuOnlineTitle: 'چندنفره آنلاین و شبکه محلی',
      menuOnlineDesc: 'ساخت اتاق و بازی با دوستان',
      menuRulesTitle: 'قوانین و راهنمای بازی',
      menuRulesDesc: 'آموزش بازی، نحوه تعهد و شلم',
      menuHubTitle: 'منوی بازی‌ها (هاب)',
      menuHubDesc: 'بازگشت به منوی اصلی و فهرست بازی‌ها',
      resumeGameDesc: 'بازگشت به بازی در حال انجام',
      multiplayerTitle: 'بازی چندنفره آنلاین / شبکه محلی',
      multiplayerDesc: 'می‌توانید با دوستان خود در شبکه محلی یا سرور بازی کنید، یا به‌صورت آفلاین با ربات‌ها رقابت نمایید.',
      roomCodeLabel: 'کد اتاق:',
      copyLinkBtn: '📋 کپی لینک اتاق',
      leaveRoomBtn: 'خروج از اتاق',
      yourNameLabel: 'نام شما:',
      createRoomBtn: 'ساخت اتاق جدید',
      joinRoomBtn: 'ورود به اتاق',
      enterRoomCodeLabel: 'کد ۴ حرفی اتاق را وارد کنید:',
      joinBtn: 'ورود',
      playOfflineBots: '🤖 بازی آفلاین با ربات‌ها (بدون نیاز به سرور)',
      waitingForHost: 'در انتظار شروع بازی توسط میزبان...',
      hostRearrangeHint: '👑 میزبان: با دکمه‌های «⇄ جابجایی» یا کشیدن بازیکنان می‌توانید ترکیب تیم‌ها را تنظیم کنید.',
      swapSeat: '⇄ جابجایی',
      switchTeam: '⇄ تغییر تیم',
      swapWithThis: '⇄ جابجایی با این صندلی',
      cancelSwap: '✕ لغو',
      takeSeat: 'نشستن',
      changeNameBtn: 'تغییر نام',
      saveNameBtn: 'ثبت نام',
      nameUpdatedMsg: 'نام شما به {name} تغییر یافت',
      partnerRole: 'یار شما',
      opponentRole: 'حریف',
      biddingOtherWaitingPrompt: 'در حال انتخاب مبلغ تعهد... پنل برای سایرین غیرفعال است.',
      youBadge: 'شما',
      openSeat: 'صندلی خالی',
      team1Subtitle: 'جنوب و شمال',
      team2Subtitle: 'غرب و شرق',
      seatSouth: 'جنوب',
      seatWest: 'غرب',
      seatNorth: 'شمال (یار)',
      seatEast: 'شرق',
      menuTitle: 'منوی بازی شلم',
      resumeGame: 'ادامه بازی',
      newMatch: 'دست جدید',
      hubTitle: 'هاب بازی‌ها (Game Hub)',
      rulesTitle: 'راهنما و قوانین بازی شلم',
      closeBtn: 'بستن',
      welcomeMsg: 'خوش آمدید! برای شروع بازی آماده شوید.',
      contractInitial: 'تعهد: ---',
      pileTeam1: 'ت۱',
      pileTeam2: 'ت۲',
      lastTrickTitle: 'آخرین دست بازی‌شده',
      viewTricksHint: 'مشاهده',
      noTricksYet: 'هنوز دستی در این دور بازی نشده است.',
      wonByMsg: 'این دست توسط {name} با {card} برده شد',
      contractLabel: 'تعهد: {bid} ({name})',
      passedMsg: '{name} پاس داد.',
      bidMsg: '{name} تعهد {bid} داد!',
      allPassedMsg: 'همه بازیکنان پاس دادند! دست مجدداً پخش می‌شود...',
      bidWonMsg: '{name} با تعهد {bid} حاکم شد!',
      trumpDeclaredMsg: '{name} خال حکم را {suit} تعیین کرد!',
      yourTurnMsg: 'نوبت شماست! برگی را بازی کنید.',
      botTurnMsg: 'نوبت {name}...',
      trickWonMsg: '{name} دست را برد! ({pts}+ امتیاز)',
      contractMetMsg: 'تیم {team} به تعهد {bid} رسید! ({pts}+ امتیاز)',
      contractFailedMsg: 'تیم {team} به تعهد {bid} نرسید! ({bid}- امتیاز منفی)',
      shelemWonMsg: 'شلم کامل! تمام امتیازات گرفته شد (+{pts} امتیاز)',
      shelemFailedMsg: 'شلم باخت! ({pts}- امتیاز منفی)',
      matchWonMsg: 'پایان بازی! تیم {team} برنده مسابقه شد! 🏆',
      roundCompleteTitle: 'پایان دور!',
      roundScoreDesc: 'تیم ۱: {t1Pts} امتیاز | تیم ۲: {t2Pts} امتیاز (تعهد: {bid})',
      team1: 'تیم ۱ (شما و یار)',
      team2: 'تیم ۲ (حریفان)',
      team1Short: 'تیم ۱ (شما و یار)',
      team2Short: 'تیم ۲ (حریفان)',
      playerSouth: 'شما',
      playerWest: 'غرب',
      playerNorth: 'یار',
      playerEast: 'شرق',
      aiPlayingForYou: '🤖 ربات به جای شما بازی می‌کند',
      aiReplaced3Rounds: '🤖 جایگزین با ربات (۳ دست عدم فعالیت)',
      takeControlBtn: '🎮 بازپس‌گیری کنترل',
      timedOutNotice: 'مهلت زمانی پایان یافت ({count}/۳). بازی خودکار.',
      // Settings Modal
      settingsTitle: 'تنظیمات بازی شلم',
      settingsPrompt: 'قوانین و هدف امتیاز برد را قبل از شروع مشخص کنید:',
      deckModeTitle: 'نوع دست کارت (جوکر)',
      deckStandardTitle: 'بدون جوکر (۵۲ برگ)',
      deckStandardDesc: 'مجموع ۱۶۵ امتیاز • ۴ برگ زمین',
      deckJokersTitle: 'با ۲ جوکر (۵۴ برگ)',
      deckJokersDesc: 'مجموع ۲۰۰ امتیاز • ۶ برگ زمین',
      winningGoalTitle: 'هدف امتیاز برد مسابقه',
      goal900: '۹۰۰ امتیاز',
      goal1165: '۱۱۶۵ امتیاز',
      goal1200: '۱۲۰۰ امتیاز',
      goalFast: 'دست سریع',
      goalClassic: 'کلاسیک اصیل',
      goalStandard: 'استاندارد',
      goalCustom: 'سفارشی',
      goalCustomDesc: 'تعیین دلخواه',
      customGoalLabel: 'امتیاز دلخواه:',
      startGameBtn: 'شروع بازی 🎮',
      cancelBtn: 'انصراف',
      // Leaderboard Modal
      leaderboardTitle: 'جدول و تاریخچه امتیازات',
      thRound: 'دور',
      thContract: 'تعهد',
      thTrump: 'حکم',
      thT1Pts: 'امتیاز ت۱',
      thT2Pts: 'امتیاز ت۲',
      thOutcome: 'نتیجه',
      thTotal: 'مجموع کل',
      noRoundsYet: 'هنوز دستی به پایان نرسیده است. پس از پایان هر دست، گزارش امتیازات در اینجا ثبت می‌شود.',
      contractMetTag: 'پیروز تعهد',
      contractFailedTag: 'شکست تعهد',
      shelemTag: 'شلم',
      rulesHtml: `
        <h4>۱. هدف بازی</h4>
        <p>شلم یک بازی ۴ نفره تیمی است (شما و یار روبرو در برابر دو حریف). تیمی که زودتر به امتیاز مشخص شده (پیش‌فرض ۱۱۶۵) برسد برنده مسابقه می‌شود.</p>
        <h4>۲. مرحله خواندن تعهد</h4>
        <p>بازیکنان به نوبت از ۱۰۰ به بالا (در گام‌های ۵ تایی: ۱۰۰، ۱۰۵، ۱۱۰...) تعهد می‌دهند. بالاترین پیشنهاد دهنده حاکم می‌شود و کارت‌های زمین را برمی‌دارد.</p>
        <h4>۳. زمین و انتخاب حکم</h4>
        <p>حاکم برگ‌های زمین را به دست خود اضافه کرده (۴ برگ در حالت استاندارد، ۶ برگ با جوکر) و به همان تعداد برگ بی‌ارزش را برای انداختن انتخاب می‌کند. سپس خال حکم را تعیین می‌نماید.</p>
        <h4>۴. ارزش دست‌ها و کارت‌های امتیازدار (مجموع ۱۶۵ یا ۲۰۰)</h4>
        <p>• <strong>امتیاز هر دست:</strong> هر دستی که برده می‌شود ۵ امتیاز به صورت پیش‌فرض دارد (۱۳ دست = ۶۵ امتیاز).<br>
        • <strong>کارت‌های بونس (امتیازدار):</strong> هر برگ ۵: ۵ امتیاز | هر برگ ۱۰: ۱۰ امتیاز | هر تک (A): ۱۰ امتیاز (مجموع ۱۰۰ امتیاز).<br>
        • <strong>جوکرها (در صورت بازی با جوکر):</strong> جوکر قرمز: ۲۰ امتیاز | جوکر سیاه: ۱۵ امتیاز.<br>
        • <em>(شاه، بی‌بی، سرباز و اعداد ۲ تا ۹ امتیاز اضافی ندارند و بردن آنها همان ۵ امتیاز پایه دست را می‌دهد).</em><br>
        • برنده دست آخر، کارت‌های زمین را به همراه ۵ امتیاز پایه دست زمین تصاحب می‌کند.<br>
        • مجموع کل امتیازات دور: ۱۶۵ امتیاز (بدون جوکر) یا ۲۰۰ امتیاز (با ۲ جوکر).</p>
        <h4>۵. محاسبه امتیاز و نمره منفی</h4>
        <p>اگر تیم حاکم به تعهد خود برسد، امتیازات کسب شده به حساب آنها افزوده می‌شود. اگر به تعهد نرسند، به اندازه تعهد امتیاز منفی می‌خورند!</p>
      `
    }
  };

  let currentLang = localStorage.getItem('rubik_card_lang') || 'fa';

  // Saved Settings
  const savedSettings = JSON.parse(localStorage.getItem('shelem_settings') || '{}');

  // Migrate deprecated targets (660 -> 900, 1160 -> 1165)
  let initialTarget = savedSettings.targetScore;
  if (!initialTarget || initialTarget === 1160) {
    initialTarget = 1165;
  } else if (initialTarget === 660) {
    initialTarget = 900;
  }

  // Chat state
  let unreadChatCount = 0;
  let chatToastTimer = null;
  let isChatMuted = false;
  try {
    isChatMuted = localStorage.getItem('shelem_chat_muted') === 'true';
  } catch (_) {}

  // Mode & Multiplayer state
  let mode = 'OFFLINE'; // 'OFFLINE' or 'ONLINE'
  let onlineWs = null;
  let mySeat = 0;
  let isHostUser = false;
  let currentGameState = null;
  let lastActiveBiddingTurn = null;
  let lastActivePlayTurn = null;
  let latestLobbySeats = [];
  let latestHostId = null;
  let swapSourceSeat = null;

  // --- Game State ---
  const state = {
    settings: {
      withJokers: savedSettings.withJokers === true,
      targetScore: initialTarget,
      isCustomGoal: savedSettings.isCustomGoal === true || (initialTarget !== 900 && initialTarget !== 1165 && initialTarget !== 1200)
    },
    hands: [[], [], [], []], // 0: South(human), 1: West, 2: North, 3: East
    widow: [], // 4 or 6 cards
    discardedWidow: [],
    matchScores: [0, 0], // Team 0, Team 1
    roundPoints: [0, 0], // Trick points in current round
    dealer: 0,
    bidTurn: 1,
    highBid: 0,
    highBidder: -1,
    consecutivePasses: 0,
    biddingActive: false,
    trumpSuit: null,
    hokmRevealed: false,
    playTurn: -1,
    currentTrick: [],
    trickCount: 0,
    tricksWon: [0, 0],
    discardSelection: [],
    roundHistory: [], // Points history for leaderboard
    lastCompletedTrick: null,
    // AFK tracking:
    consecutiveAfkTurns: 0,
    aiControlled: false
  };

  // --- DOM Elements ---
  const dom = {
    notification: document.getElementById('notification-bubble'),
    scoreTeam0: document.getElementById('score-team-0'),
    scoreTeam1: document.getElementById('score-team-1'),
    ptsTeam0: document.getElementById('pts-team-0'),
    ptsTeam1: document.getElementById('pts-team-1'),
    roundPointsRow: document.getElementById('round-points-row'),
    contractIndicator: document.getElementById('contract-indicator'),
    contractSuitIcon: document.getElementById('contract-suit-icon'),
    contractLabel: document.getElementById('contract-label'),
    topHokmPill: document.getElementById('top-hokm-pill'),
    topHokmSuit: document.getElementById('top-hokm-suit'),
    topHokmName: document.getElementById('top-hokm-name'),
    tableWidowDecor: document.getElementById('table-widow-decor'),
    widowDecorCards: document.getElementById('widow-decor-cards'),
    playerHand: document.getElementById('player-hand'),
    biddingHandPreview: document.getElementById('bidding-hand-preview'),
    takeControlBanner: document.getElementById('take-control-banner'),
    takeControlText: document.getElementById('take-control-text'),
    btnTakeControl: document.getElementById('btn-take-control'),
    trickSlots: [
      document.getElementById('trick-slot-0'),
      document.getElementById('trick-slot-1'),
      document.getElementById('trick-slot-2'),
      document.getElementById('trick-slot-3')
    ],
    badges: [
      document.querySelector('#seat-0 .player-card-badge'),
      document.querySelector('#seat-1 .player-card-badge'),
      document.querySelector('#seat-2 .player-card-badge'),
      document.querySelector('#seat-3 .player-card-badge')
    ],
    handBacks: [
      null,
      document.getElementById('backs-1'),
      document.getElementById('backs-2'),
      document.getElementById('backs-3')
    ],
    cardCounts: [
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
    playerNames: [
      document.getElementById('name-0'),
      document.getElementById('name-1'),
      document.getElementById('name-2'),
      document.getElementById('name-3')
    ],
    pileCounts: [
      document.getElementById('pile-count-0'),
      document.getElementById('pile-count-1')
    ],
    pileStacks: [
      document.getElementById('pile-stack-0'),
      document.getElementById('pile-stack-1')
    ],
    tricksPile0: document.getElementById('tricks-pile-0'),
    tricksPile1: document.getElementById('tricks-pile-1'),
    tableSign: document.getElementById('table-sign'),

    // Modals
    modalLastTrick: document.getElementById('modal-last-trick'),
    lastTrickWinnerDesc: document.getElementById('last-trick-winner-desc'),
    lastTrickCardsContainer: document.getElementById('last-trick-cards-container'),
    btnCloseLastTrick: document.getElementById('btn-close-last-trick'),
    modalBidding: document.getElementById('modal-bidding'),
    biddingModalBox: document.getElementById('bidding-modal-box'),
    biddingTurnBanner: document.getElementById('bidding-turn-banner'),
    biddingTurnText: document.getElementById('bidding-turn-text'),
    biddingModalPrompt: document.getElementById('bidding-modal-prompt'),
    biddingTimerBar: document.getElementById('bidding-timer-bar'),
    highestBidVal: document.getElementById('highest-bid-val'),
    highestBidderName: document.getElementById('highest-bidder-name'),
    biddingQuickButtons: document.getElementById('bidding-quick-buttons'),
    btnPassBid: document.getElementById('btn-pass-bid'),
    btnBidShelem: document.getElementById('btn-bid-shelem'),
    modalWidowDiscard: document.getElementById('modal-widow-discard'),
    widowModalBox: document.getElementById('widow-modal-box'),
    widowTimerBar: document.getElementById('widow-timer-bar'),
    widowModalTitle: document.getElementById('widow-modal-title'),
    widowModalPrompt: document.getElementById('widow-modal-prompt'),
    widowCardsGrid: document.getElementById('widow-cards-grid'),
    discardSelectedCount: document.getElementById('discard-selected-count'),
    discardTotalCount: document.getElementById('discard-total-count'),
    btnConfirmDiscard: document.getElementById('btn-confirm-discard'),
    modalRoundResult: document.getElementById('modal-round-result'),
    roundResultTitle: document.getElementById('round-result-title'),
    roundResultDesc: document.getElementById('round-result-desc'),
    roundResultScores: document.getElementById('round-result-scores'),
    btnNextRound: document.getElementById('btn-next-round'),

    // Main Menu Modal Elements
    modalMainMenu: document.getElementById('modal-main-menu'),
    btnMenuResume: document.getElementById('btn-menu-resume'),
    btnMenuSolo: document.getElementById('btn-menu-solo'),
    btnMenuOnline: document.getElementById('btn-menu-online'),
    btnMenuRules: document.getElementById('btn-menu-rules'),
    btnMenuLang: document.getElementById('btn-menu-lang'),
    btnMenuSound: document.getElementById('btn-menu-sound'),
    btnMultiplayer: document.getElementById('btn-multiplayer'),

    // Multiplayer Modal Elements
    modalMultiplayer: document.getElementById('modal-multiplayer'),
    mpLobbyView: document.getElementById('mp-lobby-view'),
    lobbyNameBar: document.getElementById('lobby-name-bar'),
    lobbyNameInput: document.getElementById('lobby-name-input'),
    btnSaveLobbyName: document.getElementById('btn-save-lobby-name'),
    mpEntryView: document.getElementById('mp-entry-view'),
    mpRoomCode: document.getElementById('mp-room-code'),
    btnCopyRoomLink: document.getElementById('btn-copy-room-link'),
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
    rulesContent: document.getElementById('rules-content'),
    btnCloseRules: document.getElementById('btn-close-rules'),

    // Chat & Log Drawer
    chatDrawer: document.getElementById('chat-drawer'),
    chatHeader: document.getElementById('chat-header'),
    chatToggleIcon: document.getElementById('chat-toggle-icon'),
    btnChatMute: document.getElementById('btn-chat-mute'),
    chatBadge: document.getElementById('chat-badge'),
    chatMessages: document.getElementById('chat-messages'),
    chatInput: document.getElementById('chat-input'),
    btnSendChat: document.getElementById('btn-send-chat'),

    // Floating Chat Toast Notification
    chatToast: document.getElementById('chat-toast'),
    chatToastSender: document.getElementById('chat-toast-sender'),
    chatToastText: document.getElementById('chat-toast-text'),
    chatToastClose: document.getElementById('chat-toast-close'),

    // Pre-game Settings Modal Elements
    modalSettings: document.getElementById('modal-game-settings'),
    chipDeckNoJokers: document.getElementById('chip-deck-no-jokers'),
    chipDeckJokers: document.getElementById('chip-deck-jokers'),
    chipGoal900: document.getElementById('chip-goal-900'),
    chipGoal1165: document.getElementById('chip-goal-1165'),
    chipGoal1200: document.getElementById('chip-goal-1200'),
    chipGoalCustom: document.getElementById('chip-goal-custom'),
    customGoalRow: document.getElementById('custom-goal-row'),
    inputCustomGoal: document.getElementById('input-custom-goal'),
    btnStartWithSettings: document.getElementById('btn-start-with-settings'),
    btnCloseSettings: document.getElementById('btn-close-settings'),

    // Leaderboard Modal Elements
    modalLeaderboard: document.getElementById('modal-leaderboard'),
    lbScoreTeam0: document.getElementById('lb-score-team-0'),
    lbScoreTeam1: document.getElementById('lb-score-team-1'),
    lbMatchMeta: document.getElementById('lb-match-meta'),
    tableLeaderboardBody: document.getElementById('table-leaderboard-body'),
    lbEmptyHint: document.getElementById('lb-empty-hint'),
    btnCloseLeaderboard: document.getElementById('btn-close-leaderboard'),

    // Header Buttons
    btnLeaderboard: document.getElementById('btn-leaderboard'),
    btnSettings: document.getElementById('btn-settings'),
    btnMenu: document.getElementById('btn-menu'),
    btnSound: document.getElementById('btn-sound'),
    btnLang: document.getElementById('btn-lang'),
    btnRules: document.getElementById('btn-rules'),
    btnNewGame: document.getElementById('btn-newgame')
  };

  function getPlayerName(index) {
    if (index === null || index === undefined || index === -1) return '---';
    if (mode === 'ONLINE' && currentGameState && currentGameState.players && currentGameState.players[index]) {
      return currentGameState.players[index].name;
    }
    const t = I18N[currentLang];
    if (index === 0) return t.playerSouth;
    if (index === 1) return t.playerWest;
    if (index === 2) return t.playerNorth;
    if (index === 3) return t.playerEast;
    return `P${index}`;
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function appendChat(sender, text, isSystem = false) {
    if (!dom.chatMessages) return;
    const div = document.createElement('div');
    div.className = `chat-msg ${isSystem ? 'system' : ''}`;
    if (isSystem) {
      div.textContent = text;
    } else {
      div.innerHTML = `<strong>${escapeHtml(sender)}:</strong> ${escapeHtml(text)}`;
    }
    dom.chatMessages.appendChild(div);
    dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight;

    const isDrawerOpen = dom.chatDrawer && dom.chatDrawer.classList.contains('open');
    if (!isDrawerOpen && !isChatMuted) {
      unreadChatCount++;
      if (dom.chatBadge) {
        dom.chatBadge.textContent = unreadChatCount > 9 ? '9+' : unreadChatCount;
        dom.chatBadge.style.display = 'inline-block';
      }
      showChatNotification(sender, text);
    }
  }

  function showChatNotification(sender, text) {
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

  function updateChatMuteUi() {
    if (!dom.btnChatMute) return;
    dom.btnChatMute.classList.toggle('muted', isChatMuted);
    dom.btnChatMute.textContent = isChatMuted ? '🔕' : '🔔';
    const titleText = isChatMuted ? I18N[currentLang].unmuteChatBtn : I18N[currentLang].muteChatBtn;
    dom.btnChatMute.title = titleText;
    dom.btnChatMute.setAttribute('aria-label', titleText);
  }

  function sendPlayerChat() {
    if (!dom.chatInput) return;
    const text = dom.chatInput.value.trim();
    if (!text) return;
    dom.chatInput.value = '';

    if (mode === 'ONLINE' && onlineWs && onlineWs.readyState === WebSocket.OPEN) {
      onlineWs.send(JSON.stringify({
        type: 'CHAT',
        text
      }));
      return;
    }

    appendChat(getPlayerName(0), text);

    const botReplies = {
      en: [
        'Good luck partner!',
        "Let's win this hand!",
        'Focused on making the contract.',
        'Well played!'
      ],
      fa: [
        'موفق باشی یار!',
        'این دست مال ماست!',
        'تمرکز کامل روی تعهد.',
        'عالی بازی کردی!'
      ]
    };

    setTimeout(() => {
      const respondentSeat = (Math.random() < 0.6) ? 2 : (Math.random() < 0.5 ? 1 : 3);
      const pool = botReplies[currentLang] || botReplies.fa;
      const reply = pool[Math.floor(Math.random() * pool.length)];
      appendChat(getPlayerName(respondentSeat), reply);
    }, 1000 + Math.random() * 1000);
  }

  function notify(msg) {
    if (dom.notification) {
      dom.notification.textContent = msg;
      dom.notification.style.animation = 'none';
      void dom.notification.offsetWidth;
      dom.notification.style.animation = 'notificationPulse 0.4s ease';
    }
    appendChat(null, msg, true);
  }

  function getMaxBid() {
    const withJokers = (mode === 'ONLINE' && currentGameState) ? !!currentGameState.withJokers : state.settings.withJokers;
    return withJokers ? 200 : 165;
  }

  function getShelemBidAmount() {
    const withJokers = (mode === 'ONLINE' && currentGameState) ? !!currentGameState.withJokers : state.settings.withJokers;
    return withJokers ? 400 : 330;
  }

  function getRequiredDiscardCount() {
    const withJokers = (mode === 'ONLINE' && currentGameState) ? !!currentGameState.withJokers : state.settings.withJokers;
    return withJokers ? 6 : 4;
  }

  function updateWidowModalTexts() {
    const needed = getRequiredDiscardCount();
    if (dom.widowModalTitle) {
      dom.widowModalTitle.textContent = I18N[currentLang].widowTitle.replace('{count}', needed);
    }
    if (dom.widowModalPrompt) {
      dom.widowModalPrompt.textContent = I18N[currentLang].widowPrompt
        .replace('{widowCount}', needed)
        .replace('{count}', needed);
    }
    if (dom.discardTotalCount) {
      dom.discardTotalCount.textContent = needed;
    }
  }

  // =========================================================================
  // 1. VISUAL PROGRESSIVE TURN TIMER & 3 HANDS AFK LOGIC
  // =========================================================================
  let activeTurnSeat = null;
  let turnTimerStartTime = null;
  let turnTimerRafId = null;

  function startTurnTimer(seatIndex, durationMs = 15000) {
    if (activeTurnSeat === seatIndex && turnTimerStartTime !== null) {
      return;
    }
    stopTurnTimer();

    if (seatIndex === null || seatIndex === undefined || seatIndex < 0 || seatIndex > 3) return;

    activeTurnSeat = seatIndex;
    turnTimerStartTime = performance.now();

    const badge = dom.badges[seatIndex];
    if (badge) {
      badge.classList.add('turn-timer-active');
    }

    function tick(now) {
      if (activeTurnSeat !== seatIndex) return;

      const elapsed = now - turnTimerStartTime;
      const remainingMs = Math.max(0, durationMs - elapsed);
      const progress = Math.max(0, Math.min(1, remainingMs / durationMs));
      const remainingSec = Math.ceil(remainingMs / 1000);

      // Color scheme: >5s green, 3-5s orange, <=2s red
      let timerColor = '#22c55e';
      let timerGlow = 'rgba(34, 197, 94, 0.45)';
      if (remainingSec <= 2) {
        timerColor = '#ef4444';
        timerGlow = 'rgba(239, 68, 68, 0.75)';
      } else if (remainingSec <= 5) {
        timerColor = '#f97316';
        timerGlow = 'rgba(249, 115, 22, 0.55)';
      }

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

      // Update Bidding modal horizontal timer bar if active
      if (dom.modalBidding && dom.modalBidding.classList.contains('active')) {
        if (dom.biddingTimerBar) {
          dom.biddingTimerBar.style.width = (progress * 100) + '%';
          dom.biddingTimerBar.style.setProperty('--timer-color', timerColor);
          dom.biddingTimerBar.style.setProperty('--timer-glow', timerGlow);
        }
      }

      // Update Widow Discard modal horizontal timer bar if active
      if (dom.modalWidowDiscard && dom.modalWidowDiscard.classList.contains('active')) {
        if (dom.widowTimerBar) {
          dom.widowTimerBar.style.width = (progress * 100) + '%';
          dom.widowTimerBar.style.setProperty('--timer-color', timerColor);
          dom.widowTimerBar.style.setProperty('--timer-glow', timerGlow);
        }
      }

      if (remainingMs > 0) {
        turnTimerRafId = requestAnimationFrame(tick);
      } else {
        stopTurnTimer();
        onTurnTimerExpired(seatIndex);
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
      if (dom.badges[i]) {
        dom.badges[i].classList.remove('turn-timer-active', 'turn-timer-urgent');
        dom.badges[i].style.removeProperty('--timer-pct');
        dom.badges[i].style.removeProperty('--timer-color');
        dom.badges[i].style.removeProperty('--timer-glow');
      }
    }

    if (dom.biddingModalBox) {
      dom.biddingModalBox.classList.remove('timer-active', 'timer-urgent');
      dom.biddingModalBox.style.removeProperty('--timer-pct');
      dom.biddingModalBox.style.removeProperty('--timer-color');
      dom.biddingModalBox.style.removeProperty('--timer-glow');
    }
    if (dom.biddingTimerBar) {
      dom.biddingTimerBar.style.width = '100%';
      dom.biddingTimerBar.style.removeProperty('--timer-color');
      dom.biddingTimerBar.style.removeProperty('--timer-glow');
    }

    if (dom.widowModalBox) {
      dom.widowModalBox.classList.remove('timer-active', 'timer-urgent');
      dom.widowModalBox.style.removeProperty('--timer-pct');
      dom.widowModalBox.style.removeProperty('--timer-color');
      dom.widowModalBox.style.removeProperty('--timer-glow');
    }
    if (dom.widowTimerBar) {
      dom.widowTimerBar.style.width = '100%';
      dom.widowTimerBar.style.removeProperty('--timer-color');
      dom.widowTimerBar.style.removeProperty('--timer-glow');
    }

    activeTurnSeat = null;
    turnTimerStartTime = null;
  }

  /**
   * AFK Handler:
   * Only replaces player permanently after 3 consecutive idle hands/timeouts.
   */
  function onTurnTimerExpired(seatIndex) {
    if (seatIndex === 0) {
      state.consecutiveAfkTurns = (state.consecutiveAfkTurns || 0) + 1;

      if (state.consecutiveAfkTurns >= 3) {
        // Player has been AFK for 3 consecutive turns/hands: permanently replace with AI
        enableAiTakeover();
        notify(I18N[currentLang].aiReplaced3Rounds);
        Sound.playNotification();
      } else {
        // Temporarily auto-play this single move without permanent lockout
        notify(I18N[currentLang].timedOutNotice.replace('{count}', state.consecutiveAfkTurns));
        Sound.playNotification();
      }

      if (mode === 'ONLINE') {
        if (currentGameState) {
          if (currentGameState.phase === 'BIDDING' && currentGameState.biddingTurn === mySeat) {
            submitHumanPass(true);
          } else if (currentGameState.phase === 'WIDOW_DISCARD' && currentGameState.highBidder === mySeat) {
            autoDiscardForHuman(true);
          } else if (currentGameState.phase === 'PLAYING' && currentGameState.turn === mySeat) {
            autoPlayCardForHuman(true);
          }
        }
        return;
      }

      // Execute auto-action for this single turn in offline mode
      if (state.biddingActive) {
        submitHumanPass(true);
      } else if (dom.modalWidowDiscard && dom.modalWidowDiscard.classList.contains('active')) {
        autoDiscardForHuman(true);
      } else if (state.playTurn === 0) {
        autoPlayCardForHuman(true);
      }
    }
  }

  function onHumanManualAction() {
    // Player made a move: reset AFK turn counter
    state.consecutiveAfkTurns = 0;
  }

  function enableAiTakeover() {
    state.aiControlled = true;
    if (dom.takeControlBanner) {
      dom.takeControlBanner.style.display = 'flex';
      if (dom.takeControlText) {
        dom.takeControlText.textContent = I18N[currentLang].aiReplaced3Rounds;
      }
    }
  }

  function reclaimControl() {
    if (mode === 'ONLINE') {
      if (onlineWs && onlineWs.readyState === WebSocket.OPEN) {
        onlineWs.send(JSON.stringify({ type: 'TAKE_CONTROL' }));
      }
      if (dom.takeControlBanner) dom.takeControlBanner.style.display = 'none';
      notify(I18N[currentLang].controlReclaimedMsg || (currentLang === 'fa' ? 'کنترل بازی به شما بازگردانده شد! 🎮' : 'Control returned! 🎮'));
      Sound.playNotification();
      return;
    }
    state.aiControlled = false;
    state.consecutiveAfkTurns = 0;
    if (dom.takeControlBanner) {
      dom.takeControlBanner.style.display = 'none';
    }
    notify(I18N[currentLang].yourTurnMsg);
    Sound.playNotification();

    if (state.biddingActive && state.bidTurn === 0) {
      startTurnTimer(0, 20000);
    } else if (state.playTurn === 0 && !state.roundOver && state.trickCount < 12) {
      startTurnTimer(0, 15000);
    }
  }

  function autoPlayCardForHuman(isAuto = true) {
    if (mode === 'ONLINE') {
      const hand = (currentGameState && currentGameState.hand) ? currentGameState.hand : state.hands[0];
      if (!hand || hand.length === 0) return;
      const currentTrickCards = (currentGameState && currentGameState.currentTrick) ? currentGameState.currentTrick.map(t => t.card) : [];
      const trumpSuit = currentGameState ? currentGameState.trumpSuit : state.trumpSuit;
      const card = L.getBotPlayCard(mySeat, hand, currentTrickCards, trumpSuit, []);
      if (card) {
        handleHumanPlayCard(card, isAuto);
      }
      return;
    }
    const hand = state.hands[0];
    if (!hand || hand.length === 0) return;
    const card = L.getBotPlayCard(0, hand, state.currentTrick, state.trumpSuit, []);
    if (card) {
      handleHumanPlayCard(card, isAuto);
    }
  }

  function autoDiscardForHuman(isAuto = true) {
    const hand = (mode === 'ONLINE' && currentGameState && currentGameState.hand) ? currentGameState.hand : state.hands[0];
    if (!hand || hand.length === 0) return;
    const autoEval = L.evaluateHandForBidding(hand);
    const countNeeded = getRequiredDiscardCount();
    const discards = L.getBotWidowDiscards(hand, autoEval.bestSuit, countNeeded);
    state.discardSelection = discards;
    confirmHumanDiscards(isAuto);
  }

  // =========================================================================
  // 2. CARD RENDERING (ACCURATE UTF-8 SUITS & JOKERS)
  // =========================================================================
  function createCardElement(card, isPlayable = true, onClick = null) {
    const el = document.createElement('div');
    const isJoker = card.suit === 'JOKER';
    el.className = `card ${card.color} ${isPlayable ? 'playable' : 'unplayable'} ${isJoker ? 'joker-card' : ''}`;
    el.dataset.id = `${card.suit}-${card.rank}`;

    if (isJoker) {
      el.innerHTML = `
        <div class="card-corner-top">
          <span class="card-rank" style="font-size:0.65rem;">JKR</span>
          <span class="card-suit-sm">🃏</span>
        </div>
        <div class="card-center-suit" style="font-size:1.5rem;">🃏</div>
        <div class="card-corner-bottom">
          <span class="card-rank" style="font-size:0.65rem;">JKR</span>
          <span class="card-suit-sm">🃏</span>
        </div>
      `;
    } else {
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
    }

    if (onClick) {
      el.addEventListener('click', () => {
        if (el.classList.contains('playable')) {
          onHumanManualAction();
          onClick(card);
        }
      });
    }

    return el;
  }

  // =========================================================================
  // 3. PRE-GAME SETTINGS MODAL
  // =========================================================================
  function openSettingsModal(canCancel = false) {
    if (dom.btnCloseSettings) {
      dom.btnCloseSettings.style.display = canCancel ? 'block' : 'none';
    }
    updateSettingsModalUi();
    dom.modalSettings.classList.add('active');
  }

  function closeSettingsModal() {
    dom.modalSettings.classList.remove('active');
  }

  function updateSettingsModalUi() {
    const withJ = state.settings.withJokers;
    if (dom.chipDeckNoJokers) dom.chipDeckNoJokers.classList.toggle('active', !withJ);
    if (dom.chipDeckJokers) dom.chipDeckJokers.classList.toggle('active', withJ);

    const goal = state.settings.targetScore;
    const isCustom = state.settings.isCustomGoal === true || (goal !== 900 && goal !== 1165 && goal !== 1200);

    if (dom.chipGoal900) dom.chipGoal900.classList.toggle('active', !isCustom && goal === 900);
    if (dom.chipGoal1165) dom.chipGoal1165.classList.toggle('active', !isCustom && goal === 1165);
    if (dom.chipGoal1200) dom.chipGoal1200.classList.toggle('active', !isCustom && goal === 1200);
    if (dom.chipGoalCustom) dom.chipGoalCustom.classList.toggle('active', isCustom);

    if (dom.customGoalRow) {
      dom.customGoalRow.style.display = isCustom ? 'flex' : 'none';
      if (dom.inputCustomGoal) {
        if (isCustom) {
          dom.inputCustomGoal.value = goal;
        } else if (!dom.inputCustomGoal.value || [900, 1165, 1200].includes(parseInt(dom.inputCustomGoal.value, 10))) {
          dom.inputCustomGoal.value = 1500;
        }
      }
    }

    updateWidowModalTexts();
  }

  function handleStartGameFromSettings() {
    let target = state.settings.targetScore;
    const isCustom = state.settings.isCustomGoal === true || (dom.chipGoalCustom && dom.chipGoalCustom.classList.contains('active'));
    if (isCustom && dom.inputCustomGoal) {
      const val = parseInt(dom.inputCustomGoal.value, 10);
      if (!isNaN(val) && val >= 300 && val <= 5000) {
        target = val;
      } else {
        target = 1500;
      }
    }
    state.settings.targetScore = target;

    // Save to localStorage
    localStorage.setItem('shelem_settings', JSON.stringify(state.settings));

    closeSettingsModal();
    startNewMatch();
  }

  // =========================================================================
  // 4. LEADERBOARD & POINTS HISTORY MODAL
  // =========================================================================
  function openLeaderboard() {
    renderLeaderboard();
    dom.modalLeaderboard.classList.add('active');
    Sound.playCardSlide();
  }

  function closeLeaderboard() {
    dom.modalLeaderboard.classList.remove('active');
  }

  function renderLeaderboard() {
    if (dom.lbScoreTeam0) dom.lbScoreTeam0.textContent = state.matchScores[0];
    if (dom.lbScoreTeam1) dom.lbScoreTeam1.textContent = state.matchScores[1];

    if (dom.lbMatchMeta) {
      const deckText = state.settings.withJokers
        ? I18N[currentLang].deckJokersTitle
        : I18N[currentLang].deckStandardTitle;
      dom.lbMatchMeta.textContent = `${I18N[currentLang].winningGoalTitle}: ${state.settings.targetScore} | ${deckText}`;
    }

    if (!dom.tableLeaderboardBody) return;
    dom.tableLeaderboardBody.innerHTML = '';

    if (state.roundHistory.length === 0) {
      if (dom.lbEmptyHint) dom.lbEmptyHint.style.display = 'block';
      return;
    }

    if (dom.lbEmptyHint) dom.lbEmptyHint.style.display = 'none';

    state.roundHistory.forEach(r => {
      const tr = document.createElement('tr');
      const bidderName = getPlayerName(r.bidder);
      const trumpSuit = r.trumpSuit ? `${L.SUIT_SYMBOLS[r.trumpSuit]} ${L.SUIT_NAMES[currentLang][r.trumpSuit]}` : '---';

      let outcomeBadge = '';
      if (r.outcomeType === 'met') {
        outcomeBadge = `<span class="outcome-badge outcome-met">${I18N[currentLang].contractMetTag}</span>`;
      } else if (r.outcomeType === 'failed') {
        outcomeBadge = `<span class="outcome-badge outcome-failed">${I18N[currentLang].contractFailedTag}</span>`;
      } else {
        outcomeBadge = `<span class="outcome-badge outcome-shelem">${I18N[currentLang].shelemTag}</span>`;
      }

      tr.innerHTML = `
        <td><b>${r.roundNum}</b></td>
        <td>${bidderName} (<b>${r.bid}</b>)</td>
        <td>${trumpSuit}</td>
        <td>${r.t1Pts}</td>
        <td>${r.t2Pts}</td>
        <td>${outcomeBadge}</td>
        <td><b>${r.totalScores[0]} : ${r.totalScores[1]}</b></td>
      `;
      dom.tableLeaderboardBody.appendChild(tr);
    });
  }

  // =========================================================================
  // 5. MATCH & ROUND LIFECYCLE
  // =========================================================================
  function startNewMatch() {
    state.matchScores = [0, 0];
    state.roundHistory = [];
    state.dealer = 0;
    startNewRound();
  }

  function startNewRound() {
    stopTurnTimer();
    const deck = L.shuffleDeck(L.createDeck(state.settings.withJokers));
    const dealt = L.dealShelemCards(deck, state.settings.withJokers);

    state.hands = [
      L.sortHand(dealt.hands[0]),
      dealt.hands[1],
      dealt.hands[2],
      dealt.hands[3]
    ];
    state.widow = dealt.widow;
    state.discardedWidow = [];
    state.roundPoints = [0, 0];
    state.tricksWon = [0, 0];
    state.trickCount = 0;
    state.currentTrick = [];
    state.highBid = 0;
    state.highBidder = -1;
    state.consecutivePasses = 0;
    state.lastCompletedTrick = null;
    state.trumpSuit = null;
    state.hokmRevealed = false;
    state.biddingActive = true;
    state.discardSelection = [];

    // Clear crowns
    for (let i = 0; i < 4; i++) {
      if (dom.crowns[i]) dom.crowns[i].style.display = 'none';
    }

    if (dom.topHokmPill) dom.topHokmPill.style.display = 'none';
    if (dom.contractIndicator) dom.contractIndicator.style.display = 'none';
    if (dom.roundPointsRow) dom.roundPointsRow.style.display = 'none';

    renderTableWidowDecor();
    updateScoreboard();

    // Render human player's hand at bottom immediately so it is 100% visible from turn 1!
    renderPlayerHand();
    renderBacks();
    clearTrickArena();

    Sound.playCardSlide();

    // Start bidding clockwise from next player after dealer
    state.bidTurn = (state.dealer + 1) % 4;
    notify(I18N[currentLang].biddingPrompt);
    processBiddingTurn();
  }

  // =========================================================================
  // 6. BIDDING PHASE & HAND PREVIEW
  // =========================================================================
  function renderBiddingHandPreview() {
    if (!dom.biddingHandPreview) return;
    dom.biddingHandPreview.innerHTML = '';
    const sorted12 = L.sortHand(state.hands[0]);

    sorted12.forEach(card => {
      const cardEl = createCardElement(card, false);
      cardEl.classList.add('bidding-preview-card');
      if (card.points > 0) {
        cardEl.style.boxShadow = '0 0 8px rgba(255, 209, 102, 0.7)';
      }
      dom.biddingHandPreview.appendChild(cardEl);
    });
  }

  function updateBiddingTurnDisplay(turnSeat, isMyTurn) {
    if (!dom.biddingTurnBanner || !dom.biddingModalBox) return;

    if (isMyTurn) {
      dom.biddingModalBox.classList.remove('bidding-panel-disabled');
      dom.biddingTurnBanner.className = 'bidding-turn-banner is-my-turn';
      const text = (currentLang === 'fa')
        ? '⭐ نوبت شماست! مبلغ تعهد را انتخاب کنید یا پاس دهید.'
        : "⭐ It's your turn! Select your bid or Pass.";
      if (dom.biddingTurnText) dom.biddingTurnText.textContent = text;
      if (dom.biddingModalPrompt) {
        dom.biddingModalPrompt.textContent = I18N[currentLang].biddingPrompt;
      }
    } else {
      dom.biddingModalBox.classList.add('bidding-panel-disabled');
      dom.biddingTurnBanner.className = 'bidding-turn-banner is-other-turn';

      let bidderName = '---';
      if (mode === 'ONLINE' && currentGameState && currentGameState.players && currentGameState.players[turnSeat]) {
        bidderName = currentGameState.players[turnSeat].name;
      } else {
        bidderName = getPlayerName(turnSeat);
      }

      const isPartner = ((turnSeat % 2) === (mySeat % 2));
      const roleLabel = isPartner
        ? (I18N[currentLang].partnerRole || (currentLang === 'fa' ? 'یار شما' : 'Your Partner'))
        : (I18N[currentLang].opponentRole || (currentLang === 'fa' ? 'حریف' : 'Opponent'));

      const text = (currentLang === 'fa')
        ? `⏳ نوبت تعهد: ${escapeHtml(bidderName)} (${roleLabel})`
        : `⏳ Turn to bid: ${escapeHtml(bidderName)} (${roleLabel})`;
      if (dom.biddingTurnText) dom.biddingTurnText.innerHTML = text;

      if (dom.biddingModalPrompt) {
        dom.biddingModalPrompt.innerHTML = `<span style="color:var(--text-muted); font-size:0.88rem;">${I18N[currentLang].biddingOtherWaitingPrompt}</span>`;
      }
    }
  }

  function renderBiddingButtons(interactive = true) {
    dom.biddingQuickButtons.innerHTML = '';
    const minBid = state.highBid === 0 ? 100 : state.highBid + 5;
    const maxBid = getMaxBid();

    for (let b = 100; b <= maxBid; b += 5) {
      const btn = document.createElement('button');
      btn.className = 'btn-bid-step';
      btn.textContent = b;
      btn.disabled = !interactive || b < minBid;
      if (interactive) {
        btn.addEventListener('click', () => {
          onHumanManualAction();
          submitHumanBid(b);
        });
      }
      dom.biddingQuickButtons.appendChild(btn);
    }

    // Shelem button (330 or 400)
    const shelemAmount = getShelemBidAmount();
    if (dom.btnBidShelem) {
      dom.btnBidShelem.textContent = `🔥 ${I18N[currentLang].shelemTag} (${shelemAmount})`;
      dom.btnBidShelem.dataset.bid = shelemAmount;
      dom.btnBidShelem.disabled = !interactive;
    }

    if (dom.btnPassBid) {
      dom.btnPassBid.disabled = !interactive;
    }

    dom.highestBidVal.textContent = state.highBid > 0 ? state.highBid : '---';
    dom.highestBidderName.textContent = state.highBidder !== -1 ? getPlayerName(state.highBidder) : '---';
  }

  function processBiddingTurn() {
    if (!state.biddingActive) return;

    if (state.highBidder !== -1 && state.consecutivePasses >= 3) {
      finishBidding();
      return;
    }

    if (state.highBidder === -1 && state.consecutivePasses >= 4) {
      stopTurnTimer();
      dom.modalBidding.classList.remove('active');
      if (dom.biddingModalBox) dom.biddingModalBox.classList.remove('bidding-panel-disabled');
      notify(I18N[currentLang].allPassedMsg);
      Sound.playNotification();
      setTimeout(startNewRound, 1500);
      return;
    }

    const currentTurn = state.bidTurn;
    const bidDuration = (currentTurn === 0) ? 20000 : 15000;
    startTurnTimer(currentTurn, bidDuration);

    renderBiddingHandPreview();
    renderPlayerHand();
    dom.modalBidding.classList.add('active');

    if (currentTurn === 0) {
      renderBiddingButtons(true);
      updateBiddingTurnDisplay(0, true);

      if (state.aiControlled) {
        setTimeout(() => {
          const autoDecision = L.getBotBid(0, state.hands[0], state.highBid, state.highBidder);
          if (autoDecision.action === 'bid') {
            submitHumanBid(autoDecision.amount);
          } else {
            submitHumanPass();
          }
        }, 1200);
      }
    } else {
      renderBiddingButtons(false);
      updateBiddingTurnDisplay(currentTurn, false);
      notify(I18N[currentLang].botTurnMsg.replace('{name}', getPlayerName(currentTurn)));

      setTimeout(() => {
        if (!state.biddingActive) return;
        const botHand = state.hands[currentTurn];
        const decision = L.getBotBid(currentTurn, botHand, state.highBid, state.highBidder);

        if (decision.action === 'bid') {
          state.highBid = decision.amount;
          state.highBidder = currentTurn;
          state.consecutivePasses = 0;
          notify(I18N[currentLang].bidMsg.replace('{name}', getPlayerName(currentTurn)).replace('{bid}', decision.amount));
          Sound.playTableKnock();
        } else {
          state.consecutivePasses++;
          notify(I18N[currentLang].passedMsg.replace('{name}', getPlayerName(currentTurn)));
          Sound.playCardSlide();
        }

        dom.highestBidVal.textContent = state.highBid > 0 ? state.highBid : '---';
        dom.highestBidderName.textContent = state.highBidder !== -1 ? getPlayerName(state.highBidder) : '---';

        stopTurnTimer();
        state.bidTurn = (state.bidTurn + 1) % 4;
        processBiddingTurn();
      }, 1200);
    }
  }

  function submitHumanBid(amount, isAuto = false) {
    stopTurnTimer();
    if (!isAuto) onHumanManualAction();

    if (mode === 'ONLINE') {
      sendOnlineMessage({
        type: 'SHELEM_BID',
        amount
      });
      return;
    }

    state.highBid = amount;
    state.highBidder = 0;
    state.consecutivePasses = 0;
    Sound.playTableKnock();
    notify(I18N[currentLang].bidMsg.replace('{name}', getPlayerName(0)).replace('{bid}', amount));

    dom.highestBidVal.textContent = amount;
    dom.highestBidderName.textContent = getPlayerName(0);

    state.bidTurn = (state.bidTurn + 1) % 4;
    processBiddingTurn();
  }

  function submitHumanPass(isAuto = false) {
    stopTurnTimer();
    if (!isAuto) onHumanManualAction();

    if (mode === 'ONLINE') {
      sendOnlineMessage({
        type: 'SHELEM_PASS'
      });
      return;
    }

    state.consecutivePasses++;
    Sound.playCardSlide();
    notify(I18N[currentLang].passedMsg.replace('{name}', getPlayerName(0)));

    state.bidTurn = (state.bidTurn + 1) % 4;
    processBiddingTurn();
  }

  function finishBidding() {
    stopTurnTimer();
    state.biddingActive = false;
    hideTableWidowDecor();
    dom.modalBidding.classList.remove('active');
    if (dom.biddingModalBox) dom.biddingModalBox.classList.remove('bidding-panel-disabled');

    const winner = state.highBidder;
    const bid = state.highBid;

    if (dom.crowns[winner]) dom.crowns[winner].style.display = 'inline-block';

    notify(I18N[currentLang].bidWonMsg.replace('{name}', getPlayerName(winner)).replace('{bid}', bid));
    Sound.playFanfare();

    setTimeout(() => {
      handleWidowPhase(winner);
    }, 1200);
  }

  // =========================================================================
  // 7. WIDOW & TRUMP SELECTION PHASE
  // =========================================================================
  function handleWidowPhase(bidder) {
    state.hands[bidder] = [...state.hands[bidder], ...state.widow];
    state.widow = [];
    const countNeeded = getRequiredDiscardCount();

    if (bidder === 0) {
      state.discardSelection = [];
      updateWidowModalTexts();
      renderWidowDiscardGrid();
      dom.modalWidowDiscard.classList.add('active');
      startTurnTimer(0, 20000);

      if (state.aiControlled) {
        setTimeout(autoDiscardForHuman, 1200);
      }
    } else {
      startTurnTimer(bidder, 20000);
      setTimeout(() => {
        stopTurnTimer();
        const botHandAll = state.hands[bidder];
        const botEval = L.evaluateHandForBidding(botHandAll);
        const bestSuit = botEval.bestSuit;

        const discards = L.getBotWidowDiscards(botHandAll, bestSuit, countNeeded);
        state.discardedWidow = discards;

        state.hands[bidder] = botHandAll.filter(c => !discards.includes(c));

        startPlayingPhase(bidder);
      }, 1100);
    }
  }

  function renderWidowDiscardGrid() {
    dom.widowCardsGrid.innerHTML = '';
    const sorted = L.sortHand(state.hands[0]);
    const countNeeded = getRequiredDiscardCount();
    const is18 = sorted.length >= 18;
    if (dom.widowModalBox) dom.widowModalBox.classList.toggle('has-18-cards', is18);
    if (dom.widowCardsGrid) dom.widowCardsGrid.classList.toggle('has-18-cards', is18);

    sorted.forEach(card => {
      const cardId = card.id || `${card.suit}-${card.rank}`;
      const wrapper = document.createElement('div');
      wrapper.className = 'discard-card-wrapper';
      const isSelected = state.discardSelection.some(c => (c.id || `${c.suit}-${c.rank}`) === cardId);
      if (isSelected) wrapper.classList.add('selected');

      const cardEl = createCardElement(card, true);

      const badge = document.createElement('span');
      badge.className = 'discard-badge';
      badge.textContent = '✕';

      wrapper.appendChild(cardEl);
      wrapper.appendChild(badge);

      wrapper.addEventListener('click', () => {
        onHumanManualAction();
        const selIdx = state.discardSelection.findIndex(c => (c.id || `${c.suit}-${c.rank}`) === cardId);
        if (selIdx !== -1) {
          state.discardSelection.splice(selIdx, 1);
        } else {
          if (state.discardSelection.length < countNeeded) {
            state.discardSelection.push(card);
          }
        }
        Sound.playCardSlide();
        renderWidowDiscardGrid();
        updateDiscardButton();
      });

      dom.widowCardsGrid.appendChild(wrapper);
    });

    updateDiscardButton();
  }

  function updateDiscardButton() {
    const count = state.discardSelection.length;
    const needed = getRequiredDiscardCount();
    if (dom.discardSelectedCount) dom.discardSelectedCount.textContent = count;
    if (dom.discardTotalCount) dom.discardTotalCount.textContent = needed;
    if (dom.btnConfirmDiscard) dom.btnConfirmDiscard.disabled = count !== needed;
  }

  function confirmHumanDiscards(isAuto = false) {
    const needed = getRequiredDiscardCount();
    if (state.discardSelection.length !== needed) return;
    stopTurnTimer();
    if (!isAuto) onHumanManualAction();

    dom.modalWidowDiscard.classList.remove('active');

    if (mode === 'ONLINE') {
      sendOnlineMessage({
        type: 'SHELEM_DISCARD',
        discards: state.discardSelection.map(c => c.id || `${c.suit}-${c.rank}`)
      });
      return;
    }

    state.discardedWidow = [...state.discardSelection];

    state.hands[0] = state.hands[0].filter(c => !state.discardSelection.includes(c));
    state.hands[0] = L.sortHand(state.hands[0]);

    startPlayingPhase(0);
  }

  function startPlayingPhase(bidder) {
    stopTurnTimer();
    state.biddingActive = false;
    state.trumpSuit = null;
    state.hokmRevealed = false;

    // Keep top hokm badge and contract indicator hidden until Hakem leads first card
    if (dom.topHokmPill) dom.topHokmPill.style.display = 'none';
    if (dom.contractIndicator) {
      if (dom.contractSuitIcon) {
        dom.contractSuitIcon.textContent = '？';
        dom.contractSuitIcon.style.color = '#f8f9fa';
      }
      if (dom.contractLabel) {
        dom.contractLabel.textContent = I18N[currentLang].contractLabel
          .replace('{bid}', state.highBid)
          .replace('{name}', getPlayerName(bidder));
      }
      dom.contractIndicator.style.display = 'inline-flex';
    }
    if (dom.roundPointsRow) dom.roundPointsRow.style.display = 'flex';

    hideTableWidowDecor();
    renderPlayerHand();
    renderBacks();

    if (bidder === 0) {
      notify(I18N[currentLang].leadFirstCardHakem);
      state.playTurn = 0;
      startTurnTimer(0, 15000);
      if (state.aiControlled) {
        setTimeout(autoPlayCardForHuman, 1200);
      }
    } else {
      notify(I18N[currentLang].leadFirstCardBot.replace('{name}', getPlayerName(bidder)));
      state.playTurn = bidder;
      setTimeout(processTrickTurn, 1200);
    }
  }

  // --- Table Widow Decor (Face Down Cards During Bidding) ---
  function renderTableWidowDecor() {
    if (!dom.tableWidowDecor || !dom.widowDecorCards) return;
    dom.widowDecorCards.innerHTML = '';
    const count = (state.widow && state.widow.length) || (state.settings.withJokers ? 6 : 4);
    const angles = count === 6 ? [-12, -7, -2, 2, 7, 12] : [-9, -3, 3, 9];

    for (let i = 0; i < count; i++) {
      const cardEl = document.createElement('div');
      cardEl.className = 'widow-decor-card';
      const angle = angles[i] || 0;
      const yOffset = Math.abs(angle) * 0.45;
      cardEl.style.transform = `rotate(${angle}deg) translateY(${yOffset}px)`;
      dom.widowDecorCards.appendChild(cardEl);
    }
    dom.tableWidowDecor.style.display = 'flex';
  }

  function hideTableWidowDecor() {
    if (dom.tableWidowDecor) dom.tableWidowDecor.style.display = 'none';
  }

  // --- Top Hokm & Table Contract Revelation ---
  function revealHokmOnTop() {
    if (!state.trumpSuit) return;
    const suit = state.trumpSuit;
    const suitColor = L.SUIT_COLORS[suit] || 'black';
    const suitSymbol = L.SUIT_SYMBOLS[suit];
    const suitName = L.SUIT_NAMES[currentLang][suit];

    // 1. Top Bar Pill
    if (dom.topHokmPill) {
      if (dom.topHokmSuit) {
        dom.topHokmSuit.textContent = suitSymbol;
        dom.topHokmSuit.className = `top-hokm-suit ${suitColor}`;
      }
      if (dom.topHokmName) {
        dom.topHokmName.textContent = suitName;
      }
      dom.topHokmPill.style.display = 'inline-flex';
    }

    // 2. Center Table Sign Contract Badge
    if (dom.contractIndicator) {
      if (dom.contractSuitIcon) {
        dom.contractSuitIcon.textContent = suitSymbol;
        dom.contractSuitIcon.style.color = (suitColor === 'red') ? '#ff4757' : '#f8f9fa';
      }
      if (dom.contractLabel) {
        dom.contractLabel.textContent = I18N[currentLang].contractLabel
          .replace('{bid}', state.highBid)
          .replace('{name}', getPlayerName(state.highBidder));
      }
      dom.contractIndicator.style.display = 'inline-flex';
    }
    if (dom.roundPointsRow) {
      dom.roundPointsRow.style.display = 'flex';
    }

    notify(I18N[currentLang].trumpDeclaredMsg
      .replace('{name}', getPlayerName(state.highBidder))
      .replace('{suit}', `${suitSymbol} ${suitName}`));
    Sound.playFanfare();
  }

  // --- Card Audio & Physical Table Slam Shake ---
  function triggerCardPlayEffects(card) {
    const isHokmCard = L.isTrumpCard(card, state.trumpSuit);

    if (isHokmCard) {
      // Visceral trump slam shaking the felt and trick carpet matching Hokm game!
      Sound.playHokmSlam();
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
        void trickCarpet.offsetWidth;
        trickCarpet.classList.add('table-slam-shake');
        setTimeout(() => trickCarpet.classList.remove('table-slam-shake'), 400);
      }
    } else {
      Sound.playCardSlide();
    }
  }

  // =========================================================================
  // 8. TRICK PLAYING PHASE
  // =========================================================================
  function processTrickTurn() {
    const currentTurn = state.playTurn;
    startTurnTimer(currentTurn, 15000);

    if (currentTurn === 0) {
      if (!state.hokmRevealed) {
        notify(I18N[currentLang].leadFirstCardHakem);
      } else {
        notify(I18N[currentLang].yourTurnMsg);
      }
      renderPlayerHand();

      if (state.aiControlled) {
        setTimeout(autoPlayCardForHuman, 1000);
      }
    } else {
      if (!state.hokmRevealed) {
        notify(I18N[currentLang].leadFirstCardBot.replace('{name}', getPlayerName(currentTurn)));
      } else {
        notify(I18N[currentLang].botTurnMsg.replace('{name}', getPlayerName(currentTurn)));
      }

      setTimeout(() => {
        stopTurnTimer();
        const botHand = state.hands[currentTurn];
        const card = L.getBotPlayCard(currentTurn, botHand, state.currentTrick, state.trumpSuit, []);

        const idx = botHand.indexOf(card);
        if (idx !== -1) botHand.splice(idx, 1);

        playCardToArena(currentTurn, card);
      }, 950);
    }
  }

  function handleHumanPlayCard(card, isAuto = false) {
    if (mode === 'ONLINE') {
      if (!currentGameState || currentGameState.phase !== 'PLAYING' || currentGameState.turn !== mySeat) {
        return;
      }
      const hand = currentGameState.hand || [];
      const trickCards = (currentGameState.currentTrick || []).map(t => t.card);
      if (!L.isValidPlay(card, hand, trickCards, currentGameState.trumpSuit)) {
        Sound.playTableKnock();
        return;
      }
      stopTurnTimer();
      if (!isAuto) onHumanManualAction();
      sendOnlineMessage({
        type: 'PLAY_CARD',
        cardId: card.id,
        card
      });
      return;
    }

    if (state.playTurn !== 0) return;
    if (!L.isValidPlay(card, state.hands[0], state.currentTrick, state.trumpSuit)) {
      Sound.playTableKnock();
      return;
    }

    stopTurnTimer();
    if (!isAuto) onHumanManualAction();

    const idx = state.hands[0].indexOf(card);
    if (idx !== -1) state.hands[0].splice(idx, 1);

    renderPlayerHand();
    playCardToArena(0, card);
  }

  function playCardToArena(playerIndex, card) {
    // When Hakem plays the first card, that card's suit determines and reveals Trump!
    if (!state.hokmRevealed) {
      state.trumpSuit = card.suit === 'JOKER' ? 'S' : card.suit;
      state.hokmRevealed = true;
      revealHokmOnTop();

      state.hands[0] = L.sortHand(state.hands[0], state.trumpSuit);
      renderPlayerHand();
    }

    triggerCardPlayEffects(card);
    state.currentTrick.push({ playerIndex, card });

    const slot = dom.trickSlots[playerIndex];
    if (slot) {
      const cardEl = createCardElement(card, false);
      slot.innerHTML = '';
      slot.appendChild(cardEl);
    }

    renderBacks();

    if (state.currentTrick.length === 4) {
      setTimeout(resolveCompletedTrick, 1000);
    } else {
      state.playTurn = (playerIndex + 1) % 4;
      processTrickTurn();
    }
  }

  function resolveCompletedTrick() {
    stopTurnTimer();
    const winnerIndex = L.evaluateTrickWinner(state.currentTrick, state.trumpSuit);
    const winningTeam = winnerIndex % 2;

    const winningPlay = state.currentTrick.find(t => t.playerIndex === winnerIndex) || state.currentTrick[0];
    state.lastCompletedTrick = {
      winnerSeat: winnerIndex,
      winningCard: winningPlay ? winningPlay.card : null,
      cards: state.currentTrick.map(t => ({
        seat: t.playerIndex,
        card: t.card
      }))
    };

    // Each hand/trick won has 5 default points; cards played (5, 10, A, Joker) are bonus points added to that 5
    let trickPoints = 5 + L.calculateCardsPoints(state.currentTrick.map(t => t.card));
    state.trickCount++;

    // On the 12th trick, winner also captures the widow: 5 default points + bonus card points in widow
    if (state.trickCount === 12) {
      const widowPoints = 5 + L.calculateCardsPoints(state.discardedWidow);
      trickPoints += widowPoints;
    }

    state.roundPoints[winningTeam] += trickPoints;
    state.tricksWon[winningTeam]++;

    notify(I18N[currentLang].trickWonMsg
      .replace('{name}', getPlayerName(winnerIndex))
      .replace('{pts}', trickPoints));
    Sound.playTrickWin();

    updateScoreboard();

    setTimeout(() => {
      clearTrickArena();

      if (state.trickCount >= 12) {
        finishRound();
      } else {
        state.currentTrick = [];
        state.playTurn = winnerIndex;
        processTrickTurn();
      }
    }, 900);
  }

  function clearTrickArena() {
    dom.trickSlots.forEach(slot => {
      if (slot) slot.innerHTML = '';
    });
  }

  // =========================================================================
  // 9. ROUND & MATCH SCORING
  // =========================================================================
  function finishRound() {
    stopTurnTimer();
    const bidderTeam = state.highBidder % 2;
    const defendingTeam = 1 - bidderTeam;
    const bid = state.highBid;
    const bidderPoints = state.roundPoints[bidderTeam];
    const defendingPoints = state.roundPoints[defendingTeam];
    const shelemAmount = getShelemBidAmount();
    const totalPossiblePoints = state.settings.withJokers ? 200 : 165;

    let outcomeMsg = '';
    let outcomeType = 'met';

    if (bid === shelemAmount) {
      if (bidderPoints === totalPossiblePoints) {
        state.matchScores[bidderTeam] += shelemAmount;
        outcomeMsg = I18N[currentLang].shelemWonMsg.replace('{pts}', shelemAmount);
        outcomeType = 'shelem';
      } else {
        state.matchScores[bidderTeam] -= shelemAmount;
        state.matchScores[defendingTeam] += defendingPoints;
        outcomeMsg = I18N[currentLang].shelemFailedMsg.replace('{pts}', shelemAmount);
        outcomeType = 'failed';
      }
    } else {
      if (bidderPoints >= bid) {
        state.matchScores[bidderTeam] += bidderPoints;
        state.matchScores[defendingTeam] += defendingPoints;
        outcomeMsg = I18N[currentLang].contractMetMsg
          .replace('{team}', bidderTeam + 1)
          .replace('{bid}', bid)
          .replace('{pts}', bidderPoints);
        outcomeType = 'met';
      } else {
        state.matchScores[bidderTeam] -= bid;
        state.matchScores[defendingTeam] += defendingPoints;
        outcomeMsg = I18N[currentLang].contractFailedMsg
          .replace('{team}', bidderTeam + 1)
          .replace('{bid}', bid);
        outcomeType = 'failed';
      }
    }

    // Save round to history for Leaderboard
    state.roundHistory.push({
      roundNum: state.roundHistory.length + 1,
      bidder: state.highBidder,
      bid: state.highBid,
      trumpSuit: state.trumpSuit,
      t1Pts: state.roundPoints[0],
      t2Pts: state.roundPoints[1],
      outcome: outcomeMsg,
      outcomeType,
      totalScores: [...state.matchScores]
    });

    updateScoreboard();

    // Check Match Target
    const target = state.settings.targetScore;
    const matchWon = state.matchScores[0] >= target || state.matchScores[1] >= target;

    dom.roundResultTitle.textContent = matchWon
      ? I18N[currentLang].matchWonMsg.replace('{team}', state.matchScores[0] >= target ? 1 : 2)
      : I18N[currentLang].roundCompleteTitle;

    dom.roundResultDesc.textContent = outcomeMsg;
    const t1Prefix = I18N[currentLang].pileTeam1 || (currentLang === 'fa' ? 'ت۱' : 'T1');
    const t2Prefix = I18N[currentLang].pileTeam2 || (currentLang === 'fa' ? 'ت۲' : 'T2');
    dom.roundResultScores.textContent = `${t1Prefix}: ${state.matchScores[0]}  —  ${t2Prefix}: ${state.matchScores[1]}`;

    dom.modalRoundResult.classList.add('active');
    Sound.playFanfare();

    state.dealer = (state.dealer + 1) % 4;
  }

  // =========================================================================
  // 10. UI HELPERS & LOCALIZATION
  // =========================================================================
  function renderPlayerHand() {
    dom.playerHand.innerHTML = '';
    const hand = state.hands[0];

    hand.forEach(card => {
      const isPlayable = (state.playTurn === 0) ? L.isValidPlay(card, hand, state.currentTrick, state.trumpSuit) : true;
      const cardEl = createCardElement(card, isPlayable, handleHumanPlayCard);
      dom.playerHand.appendChild(cardEl);
    });

    if (dom.cardCounts[0]) dom.cardCounts[0].textContent = hand.length;
  }

  function renderBacks() {
    for (let p = 1; p <= 3; p++) {
      const container = dom.handBacks[p];
      const count = state.hands[p].length;
      if (dom.cardCounts[p]) dom.cardCounts[p].textContent = count;

      if (container) {
        container.innerHTML = '';
        for (let i = 0; i < Math.min(count, 12); i++) {
          const back = document.createElement('div');
          back.className = 'card-back-mini';
          container.appendChild(back);
        }
      }
    }
  }

  function updateScoreboard() {
    if (dom.scoreTeam0) dom.scoreTeam0.textContent = state.matchScores[0];
    if (dom.scoreTeam1) dom.scoreTeam1.textContent = state.matchScores[1];
    if (dom.ptsTeam0) dom.ptsTeam0.textContent = state.roundPoints[0];
    if (dom.ptsTeam1) dom.ptsTeam1.textContent = state.roundPoints[1];
    if (dom.pileCounts[0]) dom.pileCounts[0].textContent = state.tricksWon[0];
    if (dom.pileCounts[1]) dom.pileCounts[1].textContent = state.tricksWon[1];
    renderTrickStacks();
  }

  function renderTrickStacks() {
    [0, 1].forEach(team => {
      const container = dom.pileStacks[team];
      if (!container) return;
      if (!container.querySelector('.shelem-card-stack')) {
        container.innerHTML = `
          <div class="shelem-card-stack">
            <div class="stack-card stack-card-1"></div>
            <div class="stack-card stack-card-2"></div>
            <div class="stack-card stack-card-3"></div>
          </div>
        `;
      }
    });
  }

  function openLastTrickInspector() {
    const trickData = state.lastCompletedTrick;
    if (!trickData || !trickData.cards || trickData.cards.length === 0) {
      if (dom.lastTrickWinnerDesc) dom.lastTrickWinnerDesc.textContent = I18N[currentLang].noTricksYet;
      if (dom.lastTrickCardsContainer) dom.lastTrickCardsContainer.innerHTML = '';
      if (dom.modalLastTrick) dom.modalLastTrick.classList.add('active');
      return;
    }
    renderTrickInInspector(trickData);
    if (dom.modalLastTrick) dom.modalLastTrick.classList.add('active');
  }

  function renderTrickInInspector(trickData) {
    const winnerName = getPlayerName(trickData.winnerSeat);
    const winCard = trickData.winningCard || (trickData.cards[0] ? trickData.cards[0].card : null);
    if (!winCard) return;

    const cardSuitSymbol = L.SUIT_SYMBOLS[winCard.suit] || '';
    const cardColor = winCard.color || (winCard.suit === 'H' || winCard.suit === 'D' ? 'red' : 'black');
    const cardStr = `<span style="color:${cardColor === 'red' ? 'var(--card-red)' : '#f3f4f6'}; font-weight:800;">${winCard.label || winCard.rank}${cardSuitSymbol}</span>`;

    if (dom.lastTrickWinnerDesc) {
      dom.lastTrickWinnerDesc.innerHTML = I18N[currentLang].wonByMsg
        .replace('{name}', `<strong>${escapeHtml(winnerName)}</strong>`)
        .replace('{card}', cardStr);
    }

    if (!dom.lastTrickCardsContainer) return;
    dom.lastTrickCardsContainer.innerHTML = '';

    trickData.cards.forEach(item => {
      const playerName = getPlayerName(item.seat);
      const box = document.createElement('div');
      box.className = 'trick-inspector-card-box';

      const cardEl = createCardElement(item.card, false);
      const isWinnerCard = item.seat === trickData.winnerSeat;
      if (isWinnerCard) {
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

  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('rubik_card_lang', lang);
    document.documentElement.lang = lang;
    document.body.dir = lang === 'fa' ? 'rtl' : 'ltr';

    const t = I18N[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key === 'widowTitle' || key === 'widowPrompt') return;
      if (t[key]) el.textContent = t[key];
    });

    updateWidowModalTexts();

    if (dom.rulesContent && t.rulesHtml) {
      dom.rulesContent.innerHTML = t.rulesHtml;
    }

    if (dom.btnBidShelem) {
      const shelemAmount = getShelemBidAmount();
      dom.btnBidShelem.textContent = `🔥 ${t.shelemTag} (${shelemAmount})`;
    }

    if (dom.btnLang) dom.btnLang.textContent = lang === 'fa' ? 'EN' : 'فا';

    for (let i = 0; i < 4; i++) {
      if (dom.playerNames[i]) dom.playerNames[i].textContent = getPlayerName(i);
    }

    if (state.hokmRevealed && state.trumpSuit) {
      if (dom.topHokmName) dom.topHokmName.textContent = L.SUIT_NAMES[lang][state.trumpSuit];
      if (dom.contractLabel) {
        dom.contractLabel.textContent = I18N[lang].contractLabel
          .replace('{bid}', state.highBid)
          .replace('{name}', getPlayerName(state.highBidder));
      }
    } else {
      if (dom.contractLabel) {
        dom.contractLabel.textContent = t.contractInitial;
      }
    }

    if (dom.chatInput) dom.chatInput.placeholder = t.chatPlaceholder;
    const menuLangLabel = document.getElementById('menu-lang-label');
    if (menuLangLabel) menuLangLabel.textContent = lang === 'fa' ? 'English' : 'فارسی';
    const menuSoundLabel = document.getElementById('menu-sound-label');
    if (menuSoundLabel) {
      menuSoundLabel.textContent = Sound.isSoundEnabled() ? (lang === 'fa' ? 'صدا روشن' : 'Sound On') : (lang === 'fa' ? 'بی‌صدا' : 'Sound Off');
    }

    updateChatMuteUi();
    renderLeaderboard();
  }

  function toggleLanguage() {
    const nextLang = currentLang === 'fa' ? 'en' : 'fa';
    applyLanguage(nextLang);
  }

  // =========================================================================
  // ONLINE MULTIPLAYER (WEBSOCKET)
  // =========================================================================
  function initOnlineConnection() {
    if (onlineWs && (onlineWs.readyState === WebSocket.OPEN || onlineWs.readyState === WebSocket.CONNECTING)) {
      return;
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    onlineWs = new WebSocket(`${protocol}//${host}`);

    onlineWs.onopen = () => {
      appendChat(null, currentLang === 'fa' ? 'به سرور بازی متصل شدید.' : 'Connected to game server.', true);
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
      appendChat(null, currentLang === 'fa' ? 'اتصال به سرور قطع شد.' : 'Disconnected from server.', true);
      onlineWs = null;
    };

    onlineWs.onerror = () => {
      appendChat(null, currentLang === 'fa' ? 'خطا در برقراری ارتباط با سرور.' : 'Server connection error.', true);
    };
  }

  function sendOnlineMessage(msgObj) {
    initOnlineConnection();
    if (!onlineWs) return;
    if (onlineWs.readyState === WebSocket.OPEN) {
      onlineWs.send(JSON.stringify(msgObj));
    } else {
      onlineWs.addEventListener('open', () => {
        onlineWs.send(JSON.stringify(msgObj));
      }, { once: true });
    }
  }

  function handleOnlineMessage(msg) {
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
      stopTurnTimer();
      if (msg.yourSeat !== undefined && msg.yourSeat !== -1) {
        mySeat = msg.yourSeat;
      }
      isHostUser = !!msg.isHost;
      renderLobbySeats(msg.seats, msg.hostId, isHostUser);
      return;
    }

    if (type === 'GAME_STATE') {
      currentGameState = msg.state;
      mode = 'ONLINE';
      if (dom.modalMainMenu) dom.modalMainMenu.classList.remove('active');
      if (dom.modalMultiplayer) dom.modalMultiplayer.classList.remove('active');
      if (currentGameState.mySeat !== undefined && currentGameState.mySeat !== -1) {
        mySeat = currentGameState.mySeat;
      }
      if (currentGameState.lastCompletedTrick) {
        state.lastCompletedTrick = currentGameState.lastCompletedTrick;
      }
      isHostUser = !!currentGameState.isHost;
      renderOnlineGameState(currentGameState);
      return;
    }

    if (type === 'TRICK_COMPLETE') {
      Sound.playTrickWin();
      if (msg.lastCompletedTrick) {
        state.lastCompletedTrick = msg.lastCompletedTrick;
      } else if (msg.trick) {
        const winningPlay = msg.trick.find(t => (t.playerIndex !== undefined ? t.playerIndex : t.seat) === msg.winner) || msg.trick[0];
        state.lastCompletedTrick = {
          winnerSeat: msg.winner,
          winningCard: winningPlay ? winningPlay.card : null,
          cards: msg.trick.map(t => ({
            seat: t.playerIndex !== undefined ? t.playerIndex : t.seat,
            card: t.card
          }))
        };
      }
      const relWinner = (msg.winner - mySeat + 4) % 4;
      const animClass = ['sweeping-south', 'sweeping-west', 'sweeping-north', 'sweeping-east'][relWinner];
      dom.trickSlots.forEach(slot => {
        slot.classList.add('gathering', animClass);
      });
      setTimeout(() => {
        dom.trickSlots.forEach(slot => {
          slot.classList.remove('gathering', 'sweeping-south', 'sweeping-west', 'sweeping-north', 'sweeping-east');
          slot.innerHTML = '';
        });
      }, 1000);
      return;
    }

    if (type === 'HOKM_REVEALED') {
      Sound.playFanfare();
      const hakemName = (currentGameState && currentGameState.players && currentGameState.players[msg.hakemSeat]) ? currentGameState.players[msg.hakemSeat].name : `P${msg.hakemSeat}`;
      notify(I18N[currentLang].trumpDeclaredMsg
        .replace('{name}', hakemName)
        .replace('{suit}', `${L.SUIT_SYMBOLS[msg.trumpSuit]} ${L.SUIT_NAMES[currentLang][msg.trumpSuit]}`));
      return;
    }

    if (type === 'CHAT') {
      appendChat(msg.sender, msg.text);
      showChatNotification(msg.sender, msg.text);
      return;
    }

    if (type === 'ERROR') {
      notify(msg.message);
      return;
    }
  }

  function t_teamName(teamIdx) {
    return teamIdx === 0 ? I18N[currentLang].team1 : I18N[currentLang].team2;
  }

  function renderOnlineGameState(s) {
    if (!s) return;

    // 0. Table Widow Decor
    if (s.phase === 'BIDDING') {
      renderTableWidowDecor();
    } else {
      hideTableWidowDecor();
    }

    // 1. Scores & Won Tricks
    if (dom.scoreTeam0) dom.scoreTeam0.textContent = s.scores[0];
    if (dom.scoreTeam1) dom.scoreTeam1.textContent = s.scores[1];
    if (s.roundPoints) {
      if (dom.ptsTeam0) dom.ptsTeam0.textContent = s.roundPoints[0];
      if (dom.ptsTeam1) dom.ptsTeam1.textContent = s.roundPoints[1];
    }
    if (s.tricksWonCounts) {
      if (dom.pileCounts[0]) dom.pileCounts[0].textContent = s.tricksWonCounts[0];
      if (dom.pileCounts[1]) dom.pileCounts[1].textContent = s.tricksWonCounts[1];
    }
    renderTrickStacks();

    // 2. Contract & Trump pill
    if (s.highBid > 0) {
      if (dom.contractIndicator) {
        dom.contractIndicator.style.display = 'inline-flex';
        const bidderName = s.players && s.players[s.highBidder] ? s.players[s.highBidder].name : `P${s.highBidder}`;
        if (dom.contractLabel) {
          dom.contractLabel.textContent = I18N[currentLang].contractLabel
            .replace('{bid}', s.highBid)
            .replace('{name}', bidderName);
        }
        if (dom.contractSuitIcon) {
          if (s.hokmRevealed && s.trumpSuit) {
            dom.contractSuitIcon.textContent = L.SUIT_SYMBOLS[s.trumpSuit];
            dom.contractSuitIcon.style.color = (L.SUIT_COLORS[s.trumpSuit] === 'red') ? '#ff4757' : '#f8f9fa';
          } else {
            dom.contractSuitIcon.textContent = '？';
            dom.contractSuitIcon.style.color = '#f8f9fa';
          }
        }
      }
    } else {
      if (dom.contractIndicator) dom.contractIndicator.style.display = 'none';
    }

    if (s.hokmRevealed && s.trumpSuit) {
      if (dom.topHokmPill) {
        dom.topHokmPill.style.display = 'inline-flex';
        if (dom.topHokmSuit) {
          dom.topHokmSuit.textContent = L.SUIT_SYMBOLS[s.trumpSuit];
          dom.topHokmSuit.className = 'top-hokm-suit ' + L.SUIT_COLORS[s.trumpSuit];
        }
        if (dom.topHokmName) dom.topHokmName.textContent = L.SUIT_NAMES[currentLang][s.trumpSuit];
      }
    } else {
      if (dom.topHokmPill) dom.topHokmPill.style.display = 'none';
    }

    if (dom.roundPointsRow) {
      dom.roundPointsRow.style.display = (s.phase === 'PLAYING' || s.phase === 'ROUND_RESULT' || s.phase === 'FINISHED') ? 'flex' : 'none';
    }

    // 3. Seats relative to mySeat
    if (s.players) {
      s.players.forEach(p => {
        const relPos = (p.seat - mySeat + 4) % 4;
        if (dom.playerNames[relPos]) {
          const youLabel = currentLang === 'fa' ? ' (شما)' : ' (You)';
          dom.playerNames[relPos].textContent = p.name + (p.isMe ? youLabel : '');
        }
        if (dom.cardCounts[relPos]) dom.cardCounts[relPos].textContent = s.cardCounts ? s.cardCounts[p.seat] : 0;
        if (dom.crowns[relPos]) dom.crowns[relPos].style.display = (s.highBidder === p.seat) ? 'inline-block' : 'none';

        const seatEl = document.getElementById(`seat-${relPos}`);
        if (seatEl) {
          seatEl.classList.remove('team-0-player', 'team-1-player');
          seatEl.classList.add(`team-${p.team}-player`);
          const isTurn = (s.phase === 'BIDDING' && s.biddingTurn === p.seat) ||
                         (s.phase === 'WIDOW_DISCARD' && s.highBidder === p.seat) ||
                         (s.phase === 'PLAYING' && s.turn === p.seat);
          seatEl.classList.toggle('active-turn', isTurn);
        }

        const dot = document.getElementById(`status-${relPos}`);
        if (dot) {
          const isOnline = p.isBot ? true : !!p.isOnline;
          dot.className = 'status-dot ' + (isOnline ? 'online' : 'offline');
          dot.title = isOnline ? 'Online' : 'Offline';
        }
      });
    }

    // 4. Opponent hand backs
    for (let relPos = 1; relPos <= 3; relPos++) {
      const container = dom.handBacks[relPos];
      const actualSeat = (mySeat + relPos) % 4;
      const count = s.cardCounts ? s.cardCounts[actualSeat] : 0;
      if (container) {
        container.innerHTML = '';
        for (let i = 0; i < Math.min(count, 12); i++) {
          const back = document.createElement('div');
          back.className = 'card-back-mini';
          container.appendChild(back);
        }
      }
    }

    // 5. South Hand
    const hand = s.hand || [];
    const sortedHand = L.sortHand(hand, s.trumpSuit);
    dom.playerHand.innerHTML = '';
    const isMyTurn = (s.phase === 'PLAYING' && s.turn === mySeat);

    sortedHand.forEach(card => {
      const isPlayable = isMyTurn ? L.isValidPlay(card, sortedHand, s.currentTrick.map(t => t.card), s.trumpSuit) : false;
      const cardEl = createCardElement(card, isPlayable, () => {
        handleHumanPlayCard(card, false);
      });
      dom.playerHand.appendChild(cardEl);
    });
    if (dom.cardCounts[0]) dom.cardCounts[0].textContent = sortedHand.length;

    // 6. Trick carpet
    for (let i = 0; i < 4; i++) {
      if (dom.trickSlots[i]) dom.trickSlots[i].innerHTML = '';
    }
    if (s.currentTrick && s.currentTrick.length > 0) {
      s.currentTrick.forEach(item => {
        const relPos = (item.playerIndex - mySeat + 4) % 4;
        const slot = dom.trickSlots[relPos];
        if (slot) {
          const cardEl = createCardElement(item.card, false);
          if (s.trumpSuit && item.card.suit === s.trumpSuit) {
            cardEl.classList.add('hokm-slam');
          }
          slot.appendChild(cardEl);
        }
      });
    }

    // 7. Turn timer & phase handling
    if (s.phase === 'BIDDING') {
      const currentTurnRel = (s.biddingTurn - mySeat + 4) % 4;
      startTurnTimer(currentTurnRel, (s.turnDuration || 15) * 1000);
      state.highBid = s.highBid;
      state.highBidder = s.highBidder !== null && s.highBidder !== undefined ? s.highBidder : -1;
      state.settings.withJokers = !!s.withJokers;

      const isMyTurn = (s.biddingTurn === mySeat);
      renderBiddingButtons(isMyTurn);
      updateBiddingTurnDisplay(s.biddingTurn, isMyTurn);

      if (dom.biddingHandPreview) {
        dom.biddingHandPreview.innerHTML = '';
        sortedHand.forEach(c => {
          const previewCard = createCardElement(c, false);
          previewCard.classList.add('bidding-preview-card');
          if (c.points > 0) {
            previewCard.style.boxShadow = '0 0 8px rgba(255, 209, 102, 0.7)';
          }
          dom.biddingHandPreview.appendChild(previewCard);
        });
      }

      if (isMyTurn && lastActiveBiddingTurn !== s.biddingTurn) {
        notify(I18N[currentLang].yourTurnMsg);
        Sound.playNotification();
      }
      lastActiveBiddingTurn = s.biddingTurn;

      dom.modalBidding.classList.add('active');
    } else if (s.phase === 'WIDOW_DISCARD') {
      dom.modalBidding.classList.remove('active');
      if (dom.biddingModalBox) dom.biddingModalBox.classList.remove('bidding-panel-disabled');
      lastActiveBiddingTurn = null;
      const bidderRel = (s.highBidder - mySeat + 4) % 4;
      startTurnTimer(bidderRel, 20000);

      if (s.highBidder === mySeat) {
        state.hands[0] = sortedHand;
        state.settings.withJokers = !!s.withJokers;
        if (!dom.modalWidowDiscard.classList.contains('active')) {
          state.discardSelection = [];
        }
        updateWidowModalTexts();
        renderWidowDiscardGrid();
        dom.modalWidowDiscard.classList.add('active');
      } else {
        dom.modalWidowDiscard.classList.remove('active');
        const hakemName = (s.players && s.players[s.highBidder]) ? s.players[s.highBidder].name : `P${s.highBidder}`;
        notify(I18N[currentLang].bidWonMsg.replace('{name}', hakemName).replace('{bid}', s.highBid));
      }
    } else if (s.phase === 'PLAYING') {
      dom.modalBidding.classList.remove('active');
      dom.modalWidowDiscard.classList.remove('active');
      lastActiveBiddingTurn = null;
      const turnRel = (s.turn - mySeat + 4) % 4;
      startTurnTimer(turnRel, (s.turnDuration || 15) * 1000);

      if (s.turn === mySeat) {
        if (!s.hokmRevealed && (!s.currentTrick || s.currentTrick.length === 0) && s.highBidder === mySeat) {
          notify(I18N[currentLang].leadFirstCardHakem);
        } else {
          notify(I18N[currentLang].yourTurnMsg);
        }
        if (lastActivePlayTurn !== s.turn) {
          Sound.playNotification();
        }
      } else {
        if (!s.hokmRevealed && (!s.currentTrick || s.currentTrick.length === 0) && s.turn === s.highBidder) {
          const hakemName = (s.players && s.players[s.highBidder]) ? s.players[s.highBidder].name : `P${s.highBidder}`;
          notify(I18N[currentLang].leadFirstCardBot.replace('{name}', hakemName));
        }
      }
      lastActivePlayTurn = s.turn;
    } else if (s.phase === 'ROUND_RESULT') {
      stopTurnTimer();
      dom.modalBidding.classList.remove('active');
      dom.modalWidowDiscard.classList.remove('active');
      lastActiveBiddingTurn = null;
      lastActivePlayTurn = null;
      if (s.lastRoundResult) {
        const res = s.lastRoundResult;
        dom.roundResultTitle.textContent = I18N[currentLang].roundCompleteTitle;
        if (res.outcomeType === 'shelem') {
          dom.roundResultDesc.textContent = I18N[currentLang].shelemWonMsg.replace('{pts}', s.withJokers ? 400 : 330);
        } else if (res.outcomeType === 'failed') {
          dom.roundResultDesc.textContent = I18N[currentLang].contractFailedMsg
            .replace('{team}', (res.bidder % 2) + 1)
            .replace('{bid}', res.bid);
        } else {
          dom.roundResultDesc.textContent = I18N[currentLang].contractMetMsg
            .replace('{team}', (res.bidder % 2) + 1)
            .replace('{bid}', res.bid)
            .replace('{pts}', (res.bidder % 2 === 0 ? res.team0Pts : res.team1Pts));
        }
        const t1Prefix = I18N[currentLang].pileTeam1 || (currentLang === 'fa' ? 'ت۱' : 'T1');
        const t2Prefix = I18N[currentLang].pileTeam2 || (currentLang === 'fa' ? 'ت۲' : 'T2');
        dom.roundResultScores.textContent = `${t1Prefix}: ${res.scores[0]}  —  ${t2Prefix}: ${res.scores[1]}`;
        dom.modalRoundResult.classList.add('active');
      }
    } else if (s.phase === 'FINISHED') {
      stopTurnTimer();
      dom.modalBidding.classList.remove('active');
      dom.modalWidowDiscard.classList.remove('active');
      const winnerTeam = s.scores[0] >= s.targetScore ? 0 : 1;
      dom.roundResultTitle.textContent = I18N[currentLang].matchWonMsg.replace('{team}', t_teamName(winnerTeam));
      dom.roundResultScores.textContent = `${t_teamName(0)}: ${s.scores[0]}  -  ${t_teamName(1)}: ${s.scores[1]}`;
      dom.modalRoundResult.classList.add('active');
    }

    // 8. AFK banner
    const myPlayer = s.players && s.players[mySeat];
    if (myPlayer && myPlayer.isAfk) {
      if (dom.takeControlBanner) dom.takeControlBanner.style.display = 'flex';
    } else {
      if (dom.takeControlBanner) dom.takeControlBanner.style.display = 'none';
    }
  }

  function sendSwapSeats(seatA, seatB) {
    sendOnlineMessage({
      type: 'SWAP_SEATS',
      seatA,
      seatB
    });
    swapSourceSeat = null;
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

    const wrapper = document.createElement('div');
    wrapper.className = 'lobby-teams-wrapper';

    const t = I18N[currentLang];

    // Team 1 Column (Seats 0 & 2: South & North)
    const team1Col = document.createElement('div');
    team1Col.className = 'lobby-team-column';
    const team1Header = document.createElement('div');
    team1Header.className = 'lobby-team-header team-0';
    team1Header.innerHTML = `<span>👑 ${t.team1}</span><span style="font-size:0.75rem; opacity:0.85;">${t.team1Subtitle}</span>`;
    team1Col.appendChild(team1Header);
    team1Col.appendChild(createLobbySeatCard(seats[0] || { seat: 0, name: 'Bot 1', isBot: true }, 0, isHostUser));
    team1Col.appendChild(createLobbySeatCard(seats[2] || { seat: 2, name: 'Bot 3', isBot: true }, 2, isHostUser));

    // Team 2 Column (Seats 1 & 3: West & East)
    const team2Col = document.createElement('div');
    team2Col.className = 'lobby-team-column';
    const team2Header = document.createElement('div');
    team2Header.className = 'lobby-team-header team-1';
    team2Header.innerHTML = `<span>⚔️ ${t.team2}</span><span style="font-size:0.75rem; opacity:0.85;">${t.team2Subtitle}</span>`;
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

    const t = I18N[currentLang];
    const posLabels = [t.seatSouth, t.seatWest, t.seatNorth, t.seatEast];
    const posLabel = posLabels[seatIdx] || `Seat ${seatIdx + 1}`;
    const isMe = !!seat.isMe;
    const isSeatHost = !!seat.isHost;
    const isBot = !!seat.isBot;
    const isOnline = isBot ? true : !!seat.isOnline;

    card.innerHTML = `
      <div class="lobby-seat-name">
        <span class="status-dot ${isOnline ? 'online' : ''}" style="width:7px; height:7px; display:inline-block;" title="${isOnline ? 'Online' : 'Offline'}"></span>
        ${isSeatHost ? '<span class="lobby-host-crown" title="Host">👑</span>' : ''}
        <span>${escapeHtml(seat.name || t.openSeat)}</span>
        ${isMe ? `<span class="lobby-you-badge">${t.youBadge}</span>` : ''}
      </div>
      <div class="lobby-seat-status">${posLabel} ${isBot ? '🤖' : '👤'}</div>
    `;

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'lobby-seat-actions';

    if (isHost) {
      const btnSwap = document.createElement('button');
      btnSwap.type = 'button';
      btnSwap.className = `btn-seat-action ${swapSourceSeat === seatIdx ? 'btn-swap-active' : ''}`;
      btnSwap.textContent = swapSourceSeat === seatIdx ? t.cancelSwap : (swapSourceSeat !== null ? t.swapWithThis : t.swapSeat);
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

      const btnSwitch = document.createElement('button');
      btnSwitch.type = 'button';
      btnSwitch.className = 'btn-seat-action';
      btnSwitch.textContent = t.switchTeam;
      btnSwitch.title = 'Switch this player to opposite team';
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
      if (isBot && !isMe) {
        const btnClaim = document.createElement('button');
        btnClaim.type = 'button';
        btnClaim.className = 'btn-seat-action';
        btnClaim.textContent = t.takeSeat;
        btnClaim.addEventListener('click', (e) => {
          e.stopPropagation();
          sendOnlineMessage({
            type: 'CLAIM_SEAT',
            seat: seatIdx,
            playerName: dom.inputPlayerName ? dom.inputPlayerName.value.trim() || 'Player' : 'Player'
          });
        });
        actionsDiv.appendChild(btnClaim);
      }
    }

    if (actionsDiv.children.length > 0) {
      card.appendChild(actionsDiv);
    }

    return card;
  }

  // =========================================================================
  // 11. EVENT LISTENERS & INITIALIZATION
  // =========================================================================
  function init() {
    // Chat drawer header toggle
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

    // Chat mute toggle
    if (dom.btnChatMute) {
      dom.btnChatMute.addEventListener('click', (e) => {
        e.stopPropagation();
        isChatMuted = !isChatMuted;
        try {
          localStorage.setItem('shelem_chat_muted', isChatMuted ? 'true' : 'false');
        } catch (_) {}
        updateChatMuteUi();
        if (isChatMuted) {
          hideChatToast();
        }
      });
    }

    // Chat toast click & close
    if (dom.chatToast) {
      dom.chatToast.addEventListener('click', (e) => {
        if (e.target === dom.chatToastClose || (dom.chatToastClose && dom.chatToastClose.contains(e.target))) {
          hideChatToast();
          return;
        }
        if (dom.chatDrawer) {
          dom.chatDrawer.classList.add('open');
          if (dom.chatToggleIcon) dom.chatToggleIcon.textContent = '▼';
          clearChatNotifications();
        }
      });
    }
    if (dom.chatToastClose) {
      dom.chatToastClose.addEventListener('click', (e) => {
        e.stopPropagation();
        hideChatToast();
      });
    }

    // Send chat message
    if (dom.btnSendChat) {
      dom.btnSendChat.addEventListener('click', sendPlayerChat);
    }
    if (dom.chatInput) {
      dom.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendPlayerChat();
      });
    }

    // Bidding Pass and Shelem
    if (dom.btnPassBid) {
      dom.btnPassBid.addEventListener('click', () => {
        onHumanManualAction();
        submitHumanPass();
      });
    }
    if (dom.btnBidShelem) {
      dom.btnBidShelem.addEventListener('click', () => {
        onHumanManualAction();
        submitHumanBid(getShelemBidAmount());
      });
    }

    // Widow discard confirm
    if (dom.btnConfirmDiscard) {
      dom.btnConfirmDiscard.addEventListener('click', () => {
        onHumanManualAction();
        confirmHumanDiscards();
      });
    }

    // Take back control button
    if (dom.btnTakeControl) {
      dom.btnTakeControl.addEventListener('click', reclaimControl);
    }

    // Won Tricks Piles / Last Trick Inspector
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

    if (dom.btnCloseLastTrick) {
      dom.btnCloseLastTrick.addEventListener('click', () => {
        if (dom.modalLastTrick) dom.modalLastTrick.classList.remove('active');
      });
    }

    if (dom.modalLastTrick) {
      dom.modalLastTrick.addEventListener('click', (e) => {
        if (e.target === dom.modalLastTrick) {
          dom.modalLastTrick.classList.remove('active');
        }
      });
    }

    // Next round
    if (dom.btnNextRound) {
      dom.btnNextRound.addEventListener('click', () => {
        dom.modalRoundResult.classList.remove('active');
        if (mode === 'ONLINE') {
          sendOnlineMessage({ type: 'NEXT_ROUND' });
        } else {
          startNewRound();
        }
      });
    }

    // Main Menu listeners
    if (dom.btnMenu) {
      dom.btnMenu.addEventListener('click', () => {
        const hasActiveGame = (mode === 'OFFLINE' && state.hands[0] && state.hands[0].length > 0) ||
                              (mode === 'ONLINE' && currentGameState && currentGameState.phase !== 'FINISHED');
        if (dom.btnMenuResume) dom.btnMenuResume.style.display = hasActiveGame ? 'flex' : 'none';
        if (dom.modalMainMenu) dom.modalMainMenu.classList.add('active');
      });
    }

    if (dom.btnMenuResume) {
      dom.btnMenuResume.addEventListener('click', () => {
        if (dom.modalMainMenu) dom.modalMainMenu.classList.remove('active');
      });
    }

    if (dom.btnMenuSolo) {
      dom.btnMenuSolo.addEventListener('click', () => {
        mode = 'OFFLINE';
        if (onlineWs) {
          onlineWs.close();
          onlineWs = null;
        }
        if (dom.modalMainMenu) dom.modalMainMenu.classList.remove('active');
        openSettingsModal(false);
      });
    }

    const openMp = () => {
      if (dom.modalMainMenu) dom.modalMainMenu.classList.remove('active');
      if (dom.modalMultiplayer) dom.modalMultiplayer.classList.add('active');
      initOnlineConnection();
    };
    if (dom.btnMenuOnline) dom.btnMenuOnline.addEventListener('click', openMp);
    if (dom.btnMultiplayer) dom.btnMultiplayer.addEventListener('click', openMp);

    if (dom.btnMenuRules) {
      dom.btnMenuRules.addEventListener('click', () => {
        if (dom.modalRules) dom.modalRules.classList.add('active');
      });
    }

    if (dom.btnMenuLang) {
      dom.btnMenuLang.addEventListener('click', toggleLanguage);
    }

    if (dom.btnMenuSound) {
      dom.btnMenuSound.addEventListener('click', () => {
        const on = Sound.toggleSound();
        if (dom.btnSound) dom.btnSound.textContent = on ? '🔊' : '🔇';
        applyLanguage(currentLang);

    const savedPlayerName = localStorage.getItem('rubik_player_name') || 'Player';
    if (dom.inputPlayerName) dom.inputPlayerName.value = savedPlayerName;
    if (dom.lobbyNameInput) dom.lobbyNameInput.value = savedPlayerName;
      });
    }

    // Multiplayer Modal Actions
    if (dom.btnCreateRoom) {
      dom.btnCreateRoom.addEventListener('click', () => {
        const playerName = dom.inputPlayerName ? dom.inputPlayerName.value.trim() || 'Player 1' : 'Player 1';
        sendOnlineMessage({
          type: 'CREATE_ROOM',
          gameType: 'shelem',
          playerName,
          settings: {
            withJokers: state.settings.withJokers,
            targetScore: state.settings.targetScore,
            deckMode: state.settings.withJokers ? 'jokers' : 'standard'
          }
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
        const code = dom.inputRoomCode ? dom.inputRoomCode.value.trim().toUpperCase() : '';
        const playerName = dom.inputPlayerName ? dom.inputPlayerName.value.trim() || 'Player' : 'Player';
        if (!code) return;
        sendOnlineMessage({
          type: 'JOIN_ROOM',
          roomCode: code,
          playerName
        });
      });
    }

    if (dom.btnPlayOffline) {
      dom.btnPlayOffline.addEventListener('click', () => {
        mode = 'OFFLINE';
        if (onlineWs) {
          onlineWs.close();
          onlineWs = null;
        }
        if (dom.modalMultiplayer) dom.modalMultiplayer.classList.remove('active');
        openSettingsModal(false);
      });
    }

    if (dom.btnStartOnlineGame) {
      dom.btnStartOnlineGame.addEventListener('click', () => {
        sendOnlineMessage({ type: 'START_GAME' });
      });
    }

    if (dom.btnLeaveRoom) {
      dom.btnLeaveRoom.addEventListener('click', () => {
        if (onlineWs) {
          onlineWs.close();
          onlineWs = null;
        }
        if (dom.mpLobbyView) dom.mpLobbyView.style.display = 'none';
        if (dom.mpEntryView) dom.mpEntryView.style.display = 'block';
        window.location.hash = '';
        if (dom.modalMainMenu) dom.modalMainMenu.classList.add('active');
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

    function handleLobbyNameChange() {
      if (!dom.lobbyNameInput) return;
      const newName = dom.lobbyNameInput.value.trim().slice(0, 15);
      if (!newName) return;
      if (dom.inputPlayerName) dom.inputPlayerName.value = newName;
      localStorage.setItem('rubik_player_name', newName);
      localStorage.setItem('shelem_player_name', newName);
      sendOnlineMessage({
        type: 'CHANGE_NAME',
        name: newName
      });
      notify(I18N[currentLang].nameUpdatedMsg.replace('{name}', newName));
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

    if (dom.btnCloseMp) {
      dom.btnCloseMp.addEventListener('click', () => {
        if (dom.modalMultiplayer) dom.modalMultiplayer.classList.remove('active');
      });
    }

    // Rules
    if (dom.btnRules) dom.btnRules.addEventListener('click', () => dom.modalRules.classList.add('active'));
    if (dom.btnCloseRules) dom.btnCloseRules.addEventListener('click', () => dom.modalRules.classList.remove('active'));

    // Top actions
    if (dom.btnLang) dom.btnLang.addEventListener('click', toggleLanguage);
    if (dom.btnSound) {
      dom.btnSound.addEventListener('click', () => {
        const on = Sound.toggleSound();
        dom.btnSound.textContent = on ? '🔊' : '🔇';
        applyLanguage(currentLang);

    const savedPlayerName = localStorage.getItem('rubik_player_name') || 'Player';
    if (dom.inputPlayerName) dom.inputPlayerName.value = savedPlayerName;
    if (dom.lobbyNameInput) dom.lobbyNameInput.value = savedPlayerName;
      });
    }
    if (dom.btnNewGame) {
      dom.btnNewGame.addEventListener('click', () => {
        if (mode === 'ONLINE') {
          if (!isHostUser) {
            notify(currentLang === 'fa' ? 'فقط میزبان می‌تواند بازی جدید را شروع کند' : 'Only the host can start a new game.');
            return;
          }
          if (confirm(currentLang === 'fa' ? 'آیا مایلید بازی جدیدی را آغاز کنید؟' : 'Start a fresh match?')) {
            sendOnlineMessage({ type: 'NEW_GAME' });
          }
        } else {
          openSettingsModal(true);
        }
      });
    }

    // Leaderboard
    if (dom.btnLeaderboard) dom.btnLeaderboard.addEventListener('click', openLeaderboard);
    if (dom.btnCloseLeaderboard) dom.btnCloseLeaderboard.addEventListener('click', closeLeaderboard);
    if (dom.tableSign) dom.tableSign.addEventListener('click', openLeaderboard);

    // Settings Modal
    if (dom.btnSettings) dom.btnSettings.addEventListener('click', () => openSettingsModal(true));
    if (dom.btnCloseSettings) dom.btnCloseSettings.addEventListener('click', closeSettingsModal);
    if (dom.btnStartWithSettings) dom.btnStartWithSettings.addEventListener('click', handleStartGameFromSettings);

    // Deck mode chips
    if (dom.chipDeckNoJokers) {
      dom.chipDeckNoJokers.addEventListener('click', () => {
        state.settings.withJokers = false;
        updateSettingsModalUi();
      });
    }
    if (dom.chipDeckJokers) {
      dom.chipDeckJokers.addEventListener('click', () => {
        state.settings.withJokers = true;
        updateSettingsModalUi();
      });
    }

    // Goal chips
    const goalChips = [
      { el: dom.chipGoal900, goal: 900 },
      { el: dom.chipGoal1165, goal: 1165 },
      { el: dom.chipGoal1200, goal: 1200 }
    ];
    goalChips.forEach(({ el, goal }) => {
      if (el) {
        el.addEventListener('click', () => {
          state.settings.isCustomGoal = false;
          state.settings.targetScore = goal;
          updateSettingsModalUi();
        });
      }
    });

    if (dom.chipGoalCustom) {
      dom.chipGoalCustom.addEventListener('click', () => {
        state.settings.isCustomGoal = true;
        let customVal = parseInt(dom.inputCustomGoal ? dom.inputCustomGoal.value : '', 10);
        if (isNaN(customVal) || [900, 1165, 1200].includes(customVal) || customVal < 300) {
          customVal = 1500;
        }
        state.settings.targetScore = customVal;
        updateSettingsModalUi();
        if (dom.inputCustomGoal) {
          dom.inputCustomGoal.value = customVal;
          setTimeout(() => {
            dom.inputCustomGoal.focus();
            dom.inputCustomGoal.select();
          }, 50);
        }
      });
    }

    if (dom.inputCustomGoal) {
      dom.inputCustomGoal.addEventListener('input', (e) => {
        state.settings.isCustomGoal = true;
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val)) state.settings.targetScore = val;
      });
    }

    // Modal backdrops
    [dom.modalMainMenu, dom.modalMultiplayer, dom.modalRules, dom.modalLeaderboard, dom.modalSettings, dom.modalLastTrick].forEach(modal => {
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal && modal !== dom.modalSettings && modal !== dom.modalMultiplayer) {
            if (modal === dom.modalMainMenu) {
              const hasActiveGame = (mode === 'OFFLINE' && state.hands[0] && state.hands[0].length > 0) ||
                                    (mode === 'ONLINE' && currentGameState && currentGameState.phase !== 'FINISHED');
              if (hasActiveGame) modal.classList.remove('active');
            } else {
              modal.classList.remove('active');
            }
          }
        });
      }
    });

    applyLanguage(currentLang);

    const savedPlayerName = localStorage.getItem('rubik_player_name') || 'Player';
    if (dom.inputPlayerName) dom.inputPlayerName.value = savedPlayerName;
    if (dom.lobbyNameInput) dom.lobbyNameInput.value = savedPlayerName;

    // Check URL hash for direct room join
    const hash = (window.location.hash || '').replace('#', '').trim().toUpperCase();
    if (hash && hash.length >= 4) {
      if (dom.modalMainMenu) dom.modalMainMenu.classList.remove('active');
      if (dom.modalMultiplayer) dom.modalMultiplayer.classList.add('active');
      if (dom.inputRoomCode) dom.inputRoomCode.value = hash;
      if (dom.mpJoinFields) dom.mpJoinFields.style.display = 'block';
      const playerName = dom.inputPlayerName ? dom.inputPlayerName.value.trim() || 'Player' : 'Player';
      sendOnlineMessage({
        type: 'JOIN_ROOM',
        roomCode: hash,
        playerName
      });
    } else {
      if (dom.modalMainMenu) dom.modalMainMenu.classList.add('active');
    }
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
