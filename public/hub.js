/**
 * Rubik Casino & Card Club - Main Menu Controller
 * Classic & Simple Casino Theme for Card & Board Games.
 * Pure Vanilla JavaScript with procedural Web Audio synthesizer and bilingual support.
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. EXTENSIBLE GAME REGISTRY
  // =========================================================================
  const GAMES = [
    {
      id: 'hokm',
      icon: '👑',
      suits: '♠ ♥ ♦ ♣',
      status: 'available',
      title: {
        en: 'Hokm',
        fa: 'بازی پاسور حکم'
      },
      subtitle: {
        en: 'Persian Classic 4-Player Partnership',
        fa: 'سلطان بازی‌های پاسور ایرانی // استراتژی تیمی'
      },
      players: {
        en: '4 Players (2 vs 2 Teams)',
        fa: '۴ نفره (۲ تیم ۲ نفره)'
      },
      tags: {
        en: ['Trick-Taking', 'Fixed Partnerships', 'Kot & Hakem Kot', 'Solo vs AI & Online LAN'],
        fa: ['دست‌گیری', 'همکاری تیمی', 'کت و حاکم کت', 'آفلاین با ربات و چندنفره آنلاین']
      },
      desc: {
        en: 'The legendary Persian 4-player team card game. Form partnerships, crown the Hakem with the first Ace, declare the Trump suit, and coordinate with your teammate to race to 7 tricks. Achieve Kot (+2 sets) or Hakem Kot (+3 sets).',
        fa: 'محبوب‌ترین و کهن‌ترین بازی کارتی ۴ نفره ایران. بازیکنان روبروی هم هم‌تیمی هستند. تعیین حاکم با تک، اعلام هوشمندانه خال حکم، و همکاری برای بردن ۷ دست. ثبت افتخار کت (+۲ دست) و حاکم کت (+۳ دست).'
      },
      playUrl: '/games/hokm/',
      onlineUrl: '/games/hokm/#online',
      rules: {
        en: `
          <h4>1. Objective & Teamwork</h4>
          <p>Hokm is played with a standard 52-card deck by 4 players in fixed partnerships (North-South vs East-West). The objective is to win 7 tricks in each round to earn sets. The first team to reach 7 sets wins the match.</p>
          <h4>2. Crowning the Hakem (King)</h4>
          <p>Cards are dealt one by one clockwise until the first Ace appears. The recipient is crowned the Hakem (👑).</p>
          <h4>3. Trump (Hokm) Declaration</h4>
          <p>The Hakem receives their initial 5 cards first and declares the Trump suit based on their hand strength. The remaining 8 cards are then dealt to each player (13 cards total per player).</p>
          <h4>4. Trick-Taking Play</h4>
          <p>The Hakem leads the first trick. Players must follow the led suit if they hold any cards of that suit. If void, you may cut with trump or discard another suit. The highest trump (or highest card of the led suit) wins the trick.</p>
          <h4>5. Kot & Hakem Kot Bonuses</h4>
          <p>• <strong>Kot (+2 sets)</strong>: When the Hakem's team wins 7-0 without letting the defenders take a single trick.<br>
          • <strong>Hakem Kot (+3 sets)</strong>: When the defending team defeats the Hakem 7-0 without letting them score a single trick!</p>
        `,
        fa: `
          <h4>۱. هدف بازی و کار تیمی</h4>
          <p>حکم یک بازی ۴ نفره در قالب دو تیم ۲ نفره روبروی هم است. هدف بردن ۷ دست در هر دور برای کسب امتیاز ست است. تیمی که زودتر به ۷ ست برسد، برنده کل مسابقه خواهد بود.</p>
          <h4>۲. تعیین حاکم با تک</h4>
          <p>کارت‌ها تک‌تک در جهت عقربه‌های ساعت پخش می‌شوند تا اولین تک (آس) به هر بازیکنی برسد؛ آن بازیکن حاکم (👑) می‌شود.</p>
          <h4>۳. تعیین خال حکم</h4>
          <p>حاکم ابتدا ۵ برگ اول خود را می‌بیند و با ارزیابی دست خود، خال حکم را اعلام می‌کند. سپس ۸ برگ باقیمانده به هر بازیکن داده می‌شود تا هر نفر ۱۳ برگ کامل داشته باشد.</p>
          <h4>۴. جریان دست‌گیری</h4>
          <p>حاکم دست اول را بازی می‌کند. بازیکنان در صورت داشتن کارت از خال بازی‌شده، ملزم به بازی از همان خال هستند. در صورت نداشتن، می‌توانند با کارت حکم برش بزنند یا رد بدهند. بالاترین کارت حکم (یا بالاترین کارت خال زمینه) دست را می‌برد.</p>
          <h4>۵. کت و حاکم کت</h4>
          <p>• <strong>کت (+۲ امتیاز ست)</strong>: اگر تیم حاکم ۷ بر ۰ ببرد و حریف حتی یک دست هم نگیرد.<br>
          • <strong>حاکم کت (+۳ امتیاز ست)</strong>: اگر تیم مدافع موفق شود حاکم را ۷ بر ۰ شکست دهد!</p>
        `
      }
    },
    {
      id: 'shelem',
      icon: '🃏',
      suits: '♠ ♥ ♦ ♣',
      status: 'available',
      title: {
        en: 'Shelem',
        fa: 'بازی پاسور شلم'
      },
      subtitle: {
        en: 'High-Stakes Contract & Bidding',
        fa: 'بازی اصیل تعهد و قرارداد // نبرد محاسبه و جسارت'
      },
      players: {
        en: '4 Players (2 vs 2 Teams)',
        fa: '۴ نفره (۲ تیم ۲ نفره)'
      },
      tags: {
        en: ['Bidding 100-165', 'Widow Cards Exchange', 'Shelem Slam (+330)', 'Solo vs AI & Online LAN'],
        fa: ['تعهد ۱۰۰ تا ۱۶۵', 'کارت‌های زمین', 'شلم کامل', 'آفلاین با ربات و چندنفره آنلاین']
      },
      desc: {
        en: 'The premier Persian bidding and contract game. Evaluate your 12 cards, bid from 100 to 165, seize the widow cards from the table, declare the trump suit, and race to 1,165 points. Succeed to bank big points, or fail and suffer steep penalties!',
        fa: 'حرفه‌ای‌ترین بازی فکری و محاسباتی پاسور در ایران. بر اساس دست خود در گام‌های ۵تایی تعهد دهید (از ۱۰۰ تا ۱۶۵)، کارت‌های زمین را بردارید، بهترین کارت‌ها را تنظیم کرده و خال حکم را معین کنید. هدف: رسیدن به ۱۱۶۵ امتیاز پیش از حریف.'
      },
      playUrl: '/games/shelem/',
      onlineUrl: '/games/shelem/',
      rules: {
        en: `
          <h4>1. Objective</h4>
          <p>Shelem is played by two partnerships. The team that first banks 1,165 total points wins the match.</p>
          <h4>2. The Bidding Phase (Reading Contracts)</h4>
          <p>Players bid clockwise starting from 100 in increments of 5. The highest bidder wins the contract, collects the widow cards from the table (4 cards in standard, 6 cards in Joker mode), discards the same amount, and declares the trump suit.</p>
          <h4>3. Card Values (Total 165 Points in Standard)</h4>
          <p>• <strong>5s</strong>: 5 points each (20 total)<br>
          • <strong>10s</strong>: 10 points each (40 total)<br>
          • <strong>Kings</strong>: 10 points each (40 total)<br>
          • <strong>Aces</strong>: 10 points each (40 total)<br>
          • <strong>Last Trick Winner</strong>: 5 bonus points + points in discarded widow cards (25 total points).<br>
          • Total round points: 165 (or 200 points in Joker mode).</p>
          <h4>4. Scoring & Negative Penalties</h4>
          <p>If the bidding team makes at least their bid, both teams bank the points they earned. If the bidding team fails by even 1 point, they lose the full bid amount as negative points!</p>
          <h4>5. Complete Shelem (Grand Slam)</h4>
          <p>Taking all 165 points awards a massive 330 points to the bidding team (or negative 330 if attempted and failed).</p>
        `,
        fa: `
          <h4>۱. هدف بازی</h4>
          <p>شلم یک بازی ۲ به ۲ تیمی است. تیمی که زودتر مجموع امتیازات خود را به ۱۱۶۵ برساند، برنده نهایی بازی است.</p>
          <h4>۲. مرحله تعهد (خواندن) و زمین</h4>
          <p>بازیکنان به نوبت از ۱۰۰ به بالا در گام‌های ۵تایی تعهد می‌دهند. بالاترین پیشنهاددهنده برنده قرارداد می‌شود، کارت‌های زمین را برمی‌دارد، به همان تعداد برگ را به زمین می‌ریزد و خال حکم را تعیین می‌کند.</p>
          <h4>۳. ارزش کارت‌ها (مجموع ۱۶۵ امتیاز در حالت استاندارد)</h4>
          <p>• هر برگ ۵: ۵ امتیاز (مجموع ۲۰)<br>
          • هر برگ ۱۰: ۱۰ امتیاز (مجموع ۴۰)<br>
          • هر برگ شاه: ۱۰ امتیاز (مجموع ۴۰)<br>
          • هر برگ تک (آس): ۱۰ امتیاز (مجموع ۴۰)<br>
          • برنده دست آخر: ۵ امتیاز پاداش به همراه امتیاز کارت‌های زمین (مجموع ۲۵).<br>
          • مجموع کل امتیازات هر دور: ۱۶۵ امتیاز (در حالت با جوکر: ۲۰۰ امتیاز).</p>
          <h4>۴. امتیازدهی و جریمه منفی</h4>
          <p>اگر تیم تعهددهنده به میزان تعهدش امتیاز بیاورد، امتیازات هر دو تیم در جدول ثبت می‌شود. اگر حتی ۱ امتیاز کمتر بیاورد، معادل کل تعهد نمره منفی می‌خورد!</p>
          <h4>۵. شلم کامل</h4>
          <p>اگر تیمی تمام ۱۶۵ امتیاز را کسب کند، شلم رخ داده و ۳۳۰ امتیاز کامل به دست می‌آورد.</p>
        `
      }
    },
    {
      id: 'uno',
      icon: '🎴',
      suits: '🔴 🔵 🟢 🟡',
      status: 'available',
      title: {
        en: 'UNO',
        fa: 'بازی اونو (UNO)'
      },
      subtitle: {
        en: 'Fast-Paced Color & Number Matching',
        fa: 'بازی پرطرفدار کارت‌های رنگی و اکشن'
      },
      players: {
        en: '4 Players (Free-for-All)',
        fa: '۴ نفره (انفرادی - هرکس برای خود)'
      },
      tags: {
        en: ['Color & Number Match', 'Action Cards', 'UNO Call Button', 'Penalty Challenge', 'Solo & Online'],
        fa: ['تطبیق رنگ و شماره', 'کارت‌های اکشن', 'فریاد اونو', 'مچ‌گیری و جریمه', 'آنلاین و آفلاین']
      },
      desc: {
        en: 'The worldwide colorful card sensation. Match numbers and colors, deploy Skips, Reverses, Draw Twos, and Wild Draw Fours. Catch opponents who forget to announce "UNO!" and empty your hand first to win.',
        fa: 'محبوب‌ترین بازی کارتی تفریحی و خانوادگی جهان. کارت‌ها را بر اساس رنگ یا عدد تطبیق دهید، با کارت‌های پرش نوبت، جهت معکوس و +۴ حریفان را غافلگیر کنید، قبل از آخرین برگ دکمه «اونو!» را بزنید و دست خود را خالی کنید.'
      },
      playUrl: '/games/uno/',
      onlineUrl: '/games/uno/',
      rules: {
        en: `
          <h4>1. Objective</h4>
          <p>Be the first player to empty your hand of all cards in each round. Points are scored from the cards remaining in opponents' hands.</p>
          <h4>2. Matching Rules</h4>
          <p>On your turn, play a card that matches the top discard card by <strong>Color</strong>, <strong>Number</strong>, or <strong>Symbol</strong>. If you have no match, you must draw a card from the deck.</p>
          <h4>3. Action & Wild Cards</h4>
          <p>• <strong>Skip (🚫)</strong>: The next player loses their turn.<br>
          • <strong>Reverse (🔄)</strong>: Reverses the direction of play.<br>
          • <strong>Draw Two (+2)</strong>: Next player draws 2 cards and misses their turn.<br>
          • <strong>Wild (🌈)</strong>: Change the active color to Red, Blue, Green, or Yellow.<br>
          • <strong>Wild Draw Four (+4)</strong>: Choose a color, next player draws 4 cards and misses their turn.</p>
          <h4>4. Shouting "UNO!"</h4>
          <p>When you have only 1 card remaining, you must immediately press the <strong>"UNO!"</strong> button within 2 seconds. If an opponent catches you and hits the Penalty button first, you are penalized with 2 penalty cards!</p>
        `,
        fa: `
          <h4>۱. هدف بازی</h4>
          <p>اولین بازیکنی باشید که تمامی کارت‌های دست خود را خالی می‌کند. در پایان هر دور، امتیاز کارت‌های باقیمانده در دست حریفان به نفع شما ثبت می‌شود.</p>
          <h4>۲. قوانین تطبیق کارت‌ها</h4>
          <p>در نوبت خود کارتی بیندازید که با کارت روی زمین از نظر <strong>رنگ</strong>، <strong>شماره</strong> یا <strong>نماد</strong> همخوانی داشته باشد. در غیر این صورت باید یک کارت از مخزن بکشید.</p>
          <h4>۳. کارت‌های ویژه و اکشن</h4>
          <p>• <strong>پرش (Skip 🚫)</strong>: نوبت بازیکن بعدی می‌سوزد.<br>
          • <strong>جهت معکوس (Reverse 🔄)</strong>: جهت چرخش بازی معکوس می‌شود.<br>
          • <strong>دو کارت بکش (+2)</strong>: نفر بعدی ۲ کارت جریمه می‌کشد و نوبتش می‌سوزد.<br>
          • <strong>کارت رنگ دلخواه (Wild 🌈)</strong>: رنگ فعال بازی را به قرمز، آبی، سبز یا زرد تغییر می‌دهد.<br>
          • <strong>رنگ دلخواه +۴</strong>: انتخاب رنگ جدید + نفر بعدی ۴ کارت می‌کشد و نوبتش می‌سوزد.</p>
          <h4>۴. فریاد «اونو!» (UNO) و مچ‌گیری</h4>
          <p>وقتی به یک برگ باقیمانده می‌رسید، باید بلافاصله دکمه <strong>«اونو!»</strong> را بزنید. اگر حریفان در فرصت ۲ ثانیه‌ای متوجه شوند و دکمه جریمه را بزنند، ۲ برگ جریمه می‌شوید!</p>
        `
      }
    },
    {
      id: 'chess',
      icon: '♟️',
      suits: '♔ ♕ ♖ ♗ ♘ ♙',
      status: 'available',
      title: {
        en: 'Chess',
        fa: 'شطرنج'
      },
      subtitle: {
        en: 'Grandmaster Tournament Strategy',
        fa: 'شاهکار کهن بازی‌های فکری و استراتژی'
      },
      players: {
        en: '2 Players (White vs Black)',
        fa: '۲ نفره (سفید در برابر سیاه)'
      },
      tags: {
        en: ['FIDE Rules', 'Smart AI Engine', 'Tournament Clocks', 'PGN History', 'Solo & Online Rooms'],
        fa: ['قوانین رسمی FIDE', 'ربات هوشمند چند سطحی', 'زمان‌سنج‌های مسابقه‌ای', 'ثبت PGN', 'آنلاین و آفلاین']
      },
      desc: {
        en: 'The immortal battlefield of kings. Features standard 8x8 tournament vinyl board, castling, en passant, pawn promotion, check/checkmate detection, multi-difficulty Minimax bot, undo, hints, customizable match clocks (3m to 30m), online rooms, and forfeit timers.',
        fa: 'شاهکار تاریخ تفکر و استراتژی بشر. پیاده‌سازی مو به موی قوانین رسمی فدراسیون جهانی (FIDE) شامل قلعه رفتن، آن‌پاسان، ارتقای پیاده، تشخیص کیش و مات و پات، ربات چند سطحی، ساعت مسابقه‌ای (۳ تا ۳۰ دقیقه)، اتاق‌های چندنفره و تایمر جریمه قطعی.'
      },
      playUrl: '/games/chess/',
      onlineUrl: '/games/chess/#online',
      rules: {
        en: `
          <h4>1. Objective</h4>
          <p>The goal is to checkmate your opponent’s king. Checkmate occurs when the king is under attack and cannot escape by moving, blocking, or capturing the attacking piece.</p>
          <h4>2. Piece Movements</h4>
          <p>• <strong>Pawn (♙)</strong>: 1 square forward (or 2 on first move), captures diagonally.<br>
          • <strong>Knight (♘)</strong>: "L"-shape move (2 squares in one direction, 1 square perpendicular). Can jump over pieces.<br>
          • <strong>Bishop (♗)</strong>: Any number of diagonal squares on its color.<br>
          • <strong>Rook (♖)</strong>: Any number of horizontal or vertical squares.<br>
          • <strong>Queen (♕)</strong>: Combines the power of rook and bishop in all directions.<br>
          • <strong>King (♔)</strong>: 1 square in any direction.</p>
          <h4>3. Special Moves</h4>
          <p>• <strong>Castling (O-O / O-O-O)</strong>: Move king 2 squares toward a rook, and the rook hops over to the adjacent square.<br>
          • <strong>En Passant</strong>: Capture an enemy pawn that moved two squares past your pawn on the very next move.<br>
          • <strong>Promotion</strong>: When a pawn reaches the 8th rank, promote it to a Queen, Rook, Bishop, or Knight.</p>
          <h4>4. Match Clocks & Draws</h4>
          <p>Customizable clocks count down during active turns. Draws occur by stalemate, insufficient material, or the 50-move rule.</p>
        `,
        fa: `
          <h4>۱. هدف بازی</h4>
          <p>هدف به دام انداختن و کیش و مات کردن شاه حریف است؛ به طوری که شاه زیر ضربه باشد و هیچ راهی برای فرار، زدن مهره مهاجم یا بستن مسیر وجود نداشته باشد.</p>
          <h4>۲. حرکت مهره‌ها</h4>
          <p>• <strong>پیاده (♙)</strong>: یک خانه مستقیم رو به جلو (در حرکت نخست ۲ خانه)، گرفتن قطری.<br>
          • <strong>اسب (♘)</strong>: حرکت L شکل (۲ خانه مستقیم و ۱ خانه عمود)، تنها مهره‌ای که از روی سایر مهره‌ها می‌پرد.<br>
          • <strong>فیل (♗)</strong>: حرکت نامحدود در مسیرهای قطری هم‌رنگ خانه شروع.<br>
          • <strong>رخ (♖)</strong>: حرکت نامحدود در مسیرهای مستقیم افقی و عمودی.<br>
          • <strong>وزیر (♕)</strong>: قدرتمندترین مهره، ترکیب کامل حرکات رخ و فیل در تمام جهات.<br>
          • <strong>شاه (♔)</strong>: یک خانه در هر جهت به شرط امن بودن خانه مقصد.</p>
          <h4>۳. حرکات ویژه</h4>
          <p>• <strong>قلعه رفتن</strong>: حرکت همزمان شاه و رخ برای امنیت شاه و فعال‌سازی رخ.<br>
          • <strong>آن‌پاسان</strong>: زدن پیاده حریف در حین عبور پس از پرش دو خانه‌ای آن.<br>
          • <strong>ارتقای پیاده</strong>: با رسیدن پیاده به آخرین سطر، می‌توان آن را به وزیر، رخ، فیل یا اسب تبدیل کرد.</p>
          <h4>۴. زمان‌سنج و شرایط تساوی</h4>
          <p>پات (بن‌بست بدون کیش)، عدم کفایت مهره، یا قانون ۵۰ حرکت مساوی را رقم می‌زند. اتمام زمان ساعت نیز منجر به باخت با زمان می‌شود.</p>
        `
      }
    }
  ];

  // =========================================================================
  // 2. I18N DICTIONARY FOR HUB
  // =========================================================================
  const HUB_I18N = {
    en: {
      siteTitle: 'RUBIK CASINO CLUB',
      siteSubtitle: 'Classic Card & Board Games',
      tagline: 'Classic Card & Board Games',
      langBtn: 'فارسی',
      soundOn: 'Sound: ON',
      soundOff: 'Sound: OFF',
      heroBadge: 'CLASSIC CASINO & CARD SALON',
      heroTitle: 'Timeless Casino & Card Games',
      heroSubtitle: 'Experience authentic Persian card masters and timeless classics with intelligent AI opponents and live multiplayer tables. Play Hokm, Shelem, UNO, and Chess directly in your browser with zero installs and instant play.',
      featureZeroInstall: '⚡ Instant Play (Zero Install)',
      featureMultiplayer: '♠ Live Multiplayer Tables',
      featureNeuralAI: '🤖 Smart AI Opponents',
      featureClocks: '⏱️ Official Match Clocks',
      quickJoinTitle: 'DIRECT TABLE ACCESS',
      quickJoinLabel: 'Enter table room code:',
      quickJoinPlaceholder: 'ABCD',
      quickJoinBtn: 'JOIN TABLE',
      featuredGames: 'Available Tables',
      featuredGamesSub: 'Select a table to play solo vs AI or create an online multiplayer room',
      activeCoresLabel: 'STATUS:',
      availableBadge: 'TABLE READY',
      comingSoonBadge: 'IN DEVELOPMENT',
      playBtn: '♠ PLAY GAME',
      rulesBtn: '📜 RULES & GUIDE',
      comingSoonBtn: '⏳ COMING SOON',
      devBannerTitle: 'Modular Card Engine // Add Custom Games',
      devBannerDesc: 'Built with an ultra-lightweight, native framework-free architecture. Drop your custom HTML5/JS game module into public/games/<id>/ and register it in hub.js to link it into the casino lounge!',
      footerText: 'Pure Native Web Stack — HTML5, CSS3, & Web Audio API. Zero dependencies, ultra-fast 60FPS performance across desktop and mobile browsers.',
      closeModal: 'Close',
      roomNotFound: 'Please enter a valid room code (3-6 characters).',
      redirectingRoom: 'Joining table {code}...'
    },
    fa: {
      siteTitle: 'باشگاه روبیک // بازی‌های اصیل',
      siteSubtitle: 'مجموعه بازی‌های اصیل پاسور و رومیزی',
      tagline: 'مجموعه اصیل پاسور و بازی‌های رومیزی',
      langBtn: 'English',
      soundOn: 'صدا: فعال',
      soundOff: 'صدا: خاموش',
      heroBadge: 'سالن اصیل بازی‌های کارتی و رومیزی',
      heroTitle: 'تجربه اصیل بازی‌های کلاسیک پاسور و رومیزی',
      heroSubtitle: 'پشت میزهای سبز بنشینید و از بازی‌های اصیل پاسور ایرانی (حکم و شلم)، بازی جهانی اونو و شطرنج لذت ببرید. امکان بازی انفرادی با هوش مصنوعی یا رقابت زنده در میزهای چندنفره با دوستان، بدون نیاز به نصب و کاملاً روان.',
      featureZeroInstall: '⚡ اجرای آنی (بدون نصب)',
      featureMultiplayer: '♠ میزهای زنده چندنفره',
      featureNeuralAI: '🤖 هوش مصنوعی قدرتمند',
      featureClocks: '⏱️ زمان‌سنج‌های مسابقه‌ای',
      quickJoinTitle: 'ورود مستقیم به میز بازی',
      quickJoinLabel: 'کد ۴ حرفی میز را وارد کنید:',
      quickJoinPlaceholder: 'مثال: ABCD',
      quickJoinBtn: 'ورود به میز',
      featuredGames: 'میزهای فعال بازی',
      featuredGamesSub: 'یک بازی را برای تمرین با هوش مصنوعی یا ساخت اتاق رقابت آنلاین انتخاب کنید',
      activeCoresLabel: 'وضعیت:',
      availableBadge: 'میز آماده',
      comingSoonBadge: 'در حال ساخت',
      playBtn: '♠ شروع بازی',
      rulesBtn: '📜 راهنما و قوانین',
      comingSoonBtn: '⏳ به‌زودی',
      devBannerTitle: 'معماری ماژولار // توسعه و افزودن بازی',
      devBannerDesc: 'هاب با ساختار بومی، ماژولار و بدون وابستگی‌های سنگین پیاده‌سازی شده است. کافیست پوشه ماژول خود را در public/games/<id>/ قرار داده و در hub.js رجیستر کنید تا به این مجموعه اضافه شود!',
      footerText: 'پیاده‌سازی سبک با استک بومی وب — HTML5، CSS3 و Web Audio API بدون کتابخانه‌های سنگین، با اجرای روان و فوق‌سریع روی تمامی پلتفرم‌ها.',
      closeModal: 'بستن',
      roomNotFound: 'لطفاً یک کد اتاق معتبر (۳ الی ۶ کاراکتر) وارد کنید.',
      redirectingRoom: 'در حال اتصال به میز {code}...'
    }
  };

  // State
  let currentLang = localStorage.getItem('rubik_card_lang') || 'fa';
  let soundEnabled = localStorage.getItem('rubik_card_sound') !== 'false';
  let audioCtx = null;

  // =========================================================================
  // 3. SYNTHESIZED CASINO SOUND ENGINE (Web Audio API)
  // Soft felt taps, authentic clay chip clicks, and warm brass chimes.
  // =========================================================================
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSound(type) {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (type === 'hover') {
        // Soft felt contact / gentle chip tap
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(240, now + 0.03);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.03);
      } else if (type === 'click') {
        // Authentic tactile poker chip clack (dual frequency pulse)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(1400, now);
        osc1.frequency.exponentialRampToValueAtTime(400, now + 0.04);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(2800, now);
        osc2.frequency.exponentialRampToValueAtTime(800, now + 0.025);

        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.045);
        osc2.stop(now + 0.045);
      } else if (type === 'success') {
        // Warm casino chime arpeggio (C Major Triad chord with warm bell decay)
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteTime = now + i * 0.055;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, noteTime);

          gain.gain.setValueAtTime(0.04, noteTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.22);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(noteTime);
          osc.stop(noteTime + 0.22);
        });
      }
    } catch (e) {
      // Audio context may fail if user hasn't interacted yet
    }
  }

  // =========================================================================
  // 4. RENDERING & UI
  // =========================================================================
  function renderGames() {
    const grid = document.getElementById('games-grid');
    if (!grid) return;

    const t = HUB_I18N[currentLang];
    grid.innerHTML = '';

    const countBadge = document.getElementById('games-count-badge');
    if (countBadge) {
      countBadge.textContent = `${GAMES.length} ${currentLang === 'fa' ? 'میز آماده' : 'Tables Ready'}`;
    }

    GAMES.forEach(game => {
      const card = document.createElement('div');
      card.className = `game-card ${game.status}`;
      card.id = `card-${game.id}`;

      const title = game.title[currentLang] || game.title.en;
      const subtitle = game.subtitle[currentLang] || game.subtitle.en;
      const desc = game.desc[currentLang] || game.desc.en;
      const players = game.players[currentLang] || game.players.en;
      const tags = (game.tags[currentLang] || game.tags.en).map(tag => `<span class="meta-chip">${tag}</span>`).join('');

      const statusBadge = game.status === 'available'
        ? `<span class="card-status-badge badge-available">● ${t.availableBadge}</span>`
        : `<span class="card-status-badge badge-coming-soon">⏳ ${t.comingSoonBadge}</span>`;

      let actionsHtml = '';
      if (game.status === 'available') {
        actionsHtml = `
          <div class="card-actions-grid">
            <a href="${game.playUrl}" class="btn-casino-primary btn-cyber-primary" data-sound="click">
              <span>${t.playBtn}</span>
            </a>
            <button type="button" class="btn-casino-secondary btn-cyber-secondary btn-show-rules" data-game-id="${game.id}" data-sound="click" title="${t.rulesBtn}">
              <span>${t.rulesBtn}</span>
            </button>
          </div>
        `;
      } else {
        actionsHtml = `
          <div class="btn-coming-soon">${t.comingSoonBtn}</div>
        `;
      }

      card.innerHTML = `
        <div>
          <div class="card-top">
            <div class="card-icon-box">${game.icon}</div>
            ${statusBadge}
          </div>

          <div class="card-title-group">
            <h3 class="card-title">${title} <span class="card-title-suits">${game.suits}</span></h3>
            <div class="card-subtitle">${subtitle}</div>
          </div>

          <p class="card-desc">${desc}</p>

          <div class="card-meta">
            <span class="meta-chip players">👥 ${players}</span>
            ${tags}
          </div>
        </div>

        <div class="card-actions">
          ${actionsHtml}
        </div>
      `;

      // Hover sound
      card.addEventListener('mouseenter', () => playSound('hover'));

      grid.appendChild(card);
    });

    // Attach click listeners for rules modal
    document.querySelectorAll('.btn-show-rules').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const gameId = e.currentTarget.getAttribute('data-game-id');
        openRulesModal(gameId);
      });
    });
  }

  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('rubik_card_lang', lang);
    document.documentElement.lang = lang;
    document.body.dir = lang === 'fa' ? 'rtl' : 'ltr';

    const t = HUB_I18N[lang];

    // Update all data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key]) {
        el.textContent = t[key];
      }
    });

    // Update inputs with placeholder translations
    const inputRoom = document.getElementById('input-quick-room');
    if (inputRoom) {
      inputRoom.placeholder = t.quickJoinPlaceholder;
    }

    // Update lang button text
    const langBtnLabel = document.getElementById('lang-btn-label');
    if (langBtnLabel) {
      langBtnLabel.textContent = t.langBtn;
    }

    // Re-render games
    renderGames();
  }

  function toggleLanguage() {
    const nextLang = currentLang === 'fa' ? 'en' : 'fa';
    playSound('click');
    applyLanguage(nextLang);
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem('rubik_card_sound', soundEnabled);
    updateSoundBtn();
    if (soundEnabled) playSound('click');
  }

  function updateSoundBtn() {
    const btn = document.getElementById('btn-hub-sound');
    if (!btn) return;
    const t = HUB_I18N[currentLang];
    btn.innerHTML = soundEnabled 
      ? `<span class="casino-btn-icon">🔊</span> <span>${t.soundOn}</span>` 
      : `<span class="casino-btn-icon">🔇</span> <span>${t.soundOff}</span>`;
  }

  // =========================================================================
  // 5. QUICK JOIN ROOM
  // =========================================================================
  async function handleQuickJoin(e) {
    if (e) e.preventDefault();
    const input = document.getElementById('input-quick-room');
    if (!input) return;

    const code = (input.value || '').trim().toUpperCase();
    const t = HUB_I18N[currentLang];

    if (!code || code.length < 3) {
      alert(t.roomNotFound);
      input.focus();
      return;
    }

    try {
      const res = await fetch(`/api/room/${code}`);
      const data = await res.json();
      playSound('success');
      if (data && data.gameType === 'shelem') {
        window.location.href = `/games/shelem/#${code}`;
      } else if (data && data.gameType === 'uno') {
        window.location.href = `/games/uno/#${code}`;
      } else if (data && data.gameType === 'chess') {
        window.location.href = `/games/chess/#${code}`;
      } else {
        window.location.href = `/games/hokm/#${code}`;
      }
    } catch {
      playSound('success');
      window.location.href = `/games/hokm/#${code}`;
    }
  }

  function checkUrlHash() {
    const hash = (window.location.hash || '').replace('#', '').trim().toUpperCase();
    if (hash && hash.length === 4) {
      const input = document.getElementById('input-quick-room');
      if (input) input.value = hash;

      const banner = document.getElementById('quick-join-card');
      if (banner) {
        banner.style.boxShadow = '0 0 25px rgba(212, 175, 55, 0.7)';
      }
    }
  }

  // =========================================================================
  // 6. RULES / GUIDE MODAL
  // =========================================================================
  function openRulesModal(gameId) {
    playSound('click');
    const game = GAMES.find(g => g.id === gameId);
    if (!game) return;

    const modal = document.getElementById('modal-rules');
    const titleEl = document.getElementById('modal-game-title');
    const bodyEl = document.getElementById('modal-game-body');
    if (!modal || !titleEl || !bodyEl) return;

    const title = game.title[currentLang] || game.title.en;
    titleEl.innerHTML = `${game.icon} ${title}`;
    bodyEl.innerHTML = game.rules[currentLang] || game.rules.en;

    modal.classList.add('active');
  }

  function closeRulesModal() {
    playSound('click');
    const modal = document.getElementById('modal-rules');
    if (modal) modal.classList.remove('active');
  }

  // =========================================================================
  // 7. INITIALIZATION
  // =========================================================================
  function init() {
    const btnLang = document.getElementById('btn-hub-lang');
    if (btnLang) btnLang.addEventListener('click', toggleLanguage);

    const btnSound = document.getElementById('btn-hub-sound');
    if (btnSound) btnSound.addEventListener('click', toggleSound);

    const formQuickJoin = document.getElementById('form-quick-join');
    if (formQuickJoin) formQuickJoin.addEventListener('submit', handleQuickJoin);

    const btnCloseRules = document.getElementById('btn-close-rules');
    if (btnCloseRules) btnCloseRules.addEventListener('click', closeRulesModal);

    const modalRules = document.getElementById('modal-rules');
    if (modalRules) {
      modalRules.addEventListener('click', (e) => {
        if (e.target === modalRules) closeRulesModal();
      });
    }

    // Attach sound to elements with data-sound
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-sound]');
      if (target) {
        const soundType = target.getAttribute('data-sound') || 'click';
        playSound(soundType);
      }
    });

    // Apply saved language & sound
    applyLanguage(currentLang);
    updateSoundBtn();
    checkUrlHash();
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
