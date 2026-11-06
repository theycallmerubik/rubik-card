/**
 * Backgammon (تخته نرد) - Client Application Controller
 * Handles Solo vs Smart AI Bot, Pass-and-Play local, and WebSocket Online Multiplayer.
 * Features 3D animated dice, interactive checker drag/click, pip counters,
 * undo move, AI hints, full bilingual EN/FA support.
 */

(function () {
  'use strict';

  const bgLogic = window.BackgammonLogic || window.backgammonLogic;
  const bgSound = window.BackgammonSound || window.backgammonSound;

  // Bilingual Dictionary
  const BG_I18N = {
    fa: {
      gameTitle: 'تخته نرد',
      menuHubTitle: 'هاب بازی‌ها',
      whiteToMove: 'نوبت حرکت: سفید ⚪',
      blackToMove: 'نوبت حرکت: سیاه ⚫',
      rollDiceBtn: 'پرتاب تاس',
      endTurnBtn: 'پایان نوبت ✔️',
      undoBtn: 'بازگشت',
      hintBtn: 'راهنمایی',
      newGameBtn: 'شروع مجدد',
      resignBtn: 'تسلیم',
      mainMenuBtn: 'منوی اصلی',
      botDifficulty: 'سطح ربات:',
      diffEasy: 'آسان',
      diffMedium: 'متوسط',
      diffHard: 'سخت',
      moveHistoryTitle: 'گزارش حرکات و تاس‌ها',
      multiplayerBtn: 'چندنفره آنلاین',
      swapColorsBtn: '🔄 تعویض مهره',
      multiplayerTitle: 'اتاق تخته نرد آنلاین / شبکه محلی',
      multiplayerDesc: 'اتاق بسازید یا با کد ۴ حرفی اتاق به رقابت دوستانتان ملحق شوید.',
      roomCodeLabel: 'کد اتاق:',
      copyLinkBtn: '📋 کپی لینک',
      yourNameLabel: 'نام شما:',
      saveNameBtn: 'ثبت',
      startGameBtn: 'شروع مسابقه',
      waitingForHost: 'در انتظار شروع مسابقه توسط میزبان...',
      leaveRoomBtn: 'خروج',
      createRoomBtn: 'ساخت اتاق جدید',
      joinRoomBtn: 'ورود به اتاق',
      enterRoomCodeLabel: 'کد ۴ حرفی اتاق را وارد کنید:',
      joinBtn: 'ورود به مسابقه',
      closeBtn: 'بستن',
      backBtn: 'بازگشت',
      mainMenuTitle: 'بازی تخته نرد (Backgammon)',
      mainMenuSubtitle: 'بازی اصیل ایرانی تخته نرد با تاس‌های سه‌بعدی، هوش مصنوعی پیشرفته و اتاق‌های آنلاین.',
      menuSoloTitle: '🤖 بازی با هوش مصنوعی',
      menuPassPlayTitle: '👥 بازی دو نفره روی یک دستگاه',
      menuOnlineTitle: '🌐 اتاق چندنفره آنلاین و شبکه محلی',
      menuRulesTitle: '📜 راهنما و آموزش تخته نرد',
      resumeGame: 'ادامه بازی',
      soloSetupTitle: 'انتخاب رنگ مهره‌ها',
      soloSetupDesc: 'رنگ مهره‌های خود را برای بازی در برابر هوش مصنوعی انتخاب کنید:',
      colorWhiteTitle: 'سفید (White)',
      colorWhiteDesc: 'حرکت از ۲۴ به ۱',
      colorRandomTitle: 'تصادفی (Random)',
      colorRandomDesc: 'انتخاب بر اساس شانس',
      colorBlackTitle: 'سیاه (Black)',
      colorBlackDesc: 'حرکت از ۱ به ۲۴',
      rulesTitle: 'راهنما و قوانین بازی تخته نرد',
      chatTitle: 'گزارش و چت بازی',
      soundLabel: 'صدا',
      menuModalTitle: 'منوی اصلی',
      borneOffLabel: 'خارج شده',
      pipCountLabel: 'پیپ',
      noMovesAvailable: 'حرکت مجازی با این تاس‌ها وجود ندارد! نوبت به پایان رسید.',
      mustRollFirst: 'ابتدا باید تاس بیندازید!',
      linkCopied: 'لینک اتاق کپی شد!',
      normalWin: 'پیروزی عادی (۱ امتیاز)',
      marsWin: 'مارس شد! (۲ امتیاز)',
      vishMarsWin: 'ویش‌مارس (تخته نرد)! (۳ امتیاز)'
    },
    en: {
      gameTitle: 'Backgammon',
      menuHubTitle: 'Game Hub',
      whiteToMove: 'Turn to Move: White ⚪',
      blackToMove: 'Turn to Move: Black ⚫',
      rollDiceBtn: 'Roll Dice',
      endTurnBtn: 'End Turn ✔️',
      undoBtn: 'Undo',
      hintBtn: 'Hint',
      newGameBtn: 'New Game',
      resignBtn: 'Resign',
      mainMenuBtn: 'Main Menu',
      botDifficulty: 'Bot Level:',
      diffEasy: 'Easy',
      diffMedium: 'Medium',
      diffHard: 'Hard',
      moveHistoryTitle: 'Moves & Dice Log',
      multiplayerBtn: 'Multiplayer',
      swapColorsBtn: '🔄 Swap Colors',
      multiplayerTitle: 'Online / LAN Backgammon Room',
      multiplayerDesc: 'Create a room or enter a 4-letter room code to challenge a friend.',
      roomCodeLabel: 'Room Code:',
      copyLinkBtn: '📋 Copy Link',
      yourNameLabel: 'Your Name:',
      saveNameBtn: 'Save',
      startGameBtn: 'Start Match',
      waitingForHost: 'Waiting for host to start match...',
      leaveRoomBtn: 'Leave',
      createRoomBtn: 'Create New Room',
      joinRoomBtn: 'Join Room',
      enterRoomCodeLabel: 'Enter 4-letter room code:',
      joinBtn: 'Join Match',
      closeBtn: 'Close',
      backBtn: 'Back',
      mainMenuTitle: 'Backgammon (تخته نرد)',
      mainMenuSubtitle: 'Authentic Persian Backgammon featuring 3D dice, intelligent AI engine, and online multiplayer rooms.',
      menuSoloTitle: '🤖 Play Solo vs AI Bot',
      menuPassPlayTitle: '👥 Local Pass & Play (2 Players)',
      menuOnlineTitle: '🌐 Online / LAN Multiplayer Room',
      menuRulesTitle: '📜 Backgammon Rules & Guide',
      resumeGame: 'Resume Match',
      soloSetupTitle: 'Choose Your Checkers',
      soloSetupDesc: 'Select checker color for your match against the AI:',
      colorWhiteTitle: 'White',
      colorWhiteDesc: 'Moves 24 down to 1',
      colorRandomTitle: 'Random',
      colorRandomDesc: 'Chosen by luck',
      colorBlackTitle: 'Black',
      colorBlackDesc: 'Moves 1 up to 24',
      rulesTitle: 'Backgammon Rules & Guide',
      chatTitle: 'Chat & Match Log',
      soundLabel: 'Sound',
      menuModalTitle: 'Main Menu',
      borneOffLabel: 'Off',
      pipCountLabel: 'PIP',
      noMovesAvailable: 'No legal moves available with these dice! Turn passes.',
      mustRollFirst: 'Please roll the dice first!',
      linkCopied: 'Room link copied to clipboard!',
      normalWin: 'Normal Victory (1 Pt)',
      marsWin: 'Gammon (Mars)! (2 Pts)',
      vishMarsWin: 'Backgammon (Vish-Mars)! (3 Pts)'
    }
  };

  // State
  let currentLang = localStorage.getItem('rubik_card_lang') || 'fa';
  let gameMode = 'solo'; // 'solo', 'passplay', 'online'
  let playerColor = bgLogic.WHITE; // 'w' or 'b'
  let currentTurn = bgLogic.WHITE; // 'w' or 'b'
  let botDifficulty = 'medium';
  let gameState = bgLogic.getInitialBoard();
  let currentDice = [1, 1];
  let movesRemaining = []; // array of die values e.g. [3, 5]
  let hasRolled = false;
  let turnHistory = []; // history of single moves in current turn for undo
  let stateAtTurnStart = null;
  let selectedPoint = null; // 'bar' or number 1..24
  let isGameOver = false;

  // WebSocket state
  let ws = null;
  let roomCode = null;
  let mySeat = -1;
  let isHost = false;
  let localPlayerName = localStorage.getItem('rubik_bg_player_name') || 'Player';

  // DOM Elements
  const boardEl = document.getElementById('backgammon-board');
  const topOuterRow = document.getElementById('top-outer-row');
  const bottomOuterRow = document.getElementById('bottom-outer-row');
  const topHomeRow = document.getElementById('top-home-row');
  const bottomHomeRow = document.getElementById('bottom-home-row');
  const barBlackEl = document.getElementById('bar-black-checkers');
  const barWhiteEl = document.getElementById('bar-white-checkers');
  const offChipsWhite = document.getElementById('off-chips-white');
  const offChipsBlack = document.getElementById('off-chips-black');
  const offBinWhite = document.getElementById('off-bin-white');
  const offBinBlack = document.getElementById('off-bin-black');
  const btnRoll = document.getElementById('btn-roll-dice');
  const btnConfirmTurn = document.getElementById('btn-confirm-turn');
  const die1El = document.getElementById('die-1');
  const die2El = document.getElementById('die-2');
  const movesContainer = document.getElementById('moves-container');
  const notifEl = document.getElementById('notification-bubble');

  // --- TURN TIMER CONTROLLER ---
  const TURN_DURATION_SEC = 30;
  let turnTimerInterval = null;
  let turnStartTime = null;
  let currentTurnDurationSec = TURN_DURATION_SEC;

  const topTimerEl = document.getElementById('top-timer');
  const bottomTimerEl = document.getElementById('bottom-timer');
  const topTimerTextEl = document.getElementById('top-timer-text');
  const bottomTimerTextEl = document.getElementById('bottom-timer-text');
  const topTurnProgressEl = document.getElementById('top-turn-progress');
  const bottomTurnProgressEl = document.getElementById('bottom-turn-progress');

  function formatTime(totalSec) {
    if (isNaN(totalSec) || totalSec < 0) totalSec = 0;
    const m = Math.floor(totalSec / 60);
    const s = Math.floor(totalSec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function startTurnCountdown(serverStartTime = null, durationSec = TURN_DURATION_SEC) {
    stopTurnCountdown();
    if (isGameOver) return;

    currentTurnDurationSec = durationSec || TURN_DURATION_SEC;
    turnStartTime = serverStartTime ? Number(serverStartTime) : Date.now();

    updateTimerDisplay();

    turnTimerInterval = setInterval(() => {
      if (isGameOver) {
        stopTurnCountdown();
        return;
      }
      updateTimerDisplay();
    }, 250);
  }

  function stopTurnCountdown() {
    if (turnTimerInterval) {
      clearInterval(turnTimerInterval);
      turnTimerInterval = null;
    }
  }

  function updateTimerDisplay() {
    if (!turnStartTime) return;

    const elapsedMs = Math.max(0, Date.now() - turnStartTime);
    const totalMs = currentTurnDurationSec * 1000;
    const remainingMs = Math.max(0, totalMs - elapsedMs);
    const remainingSec = Math.ceil(remainingMs / 1000);
    const progressPct = Math.max(0, Math.min(100, (remainingMs / totalMs) * 100));

    const timeStr = formatTime(remainingSec);
    const isWhiteTurn = (currentTurn === bgLogic.WHITE);

    // Bottom Player Timer (White)
    if (bottomTimerEl) {
      if (isWhiteTurn) {
        if (remainingSec <= 5) {
          bottomTimerEl.className = 'player-timer timer-active timer-urgent';
        } else if (remainingSec <= 10) {
          bottomTimerEl.className = 'player-timer timer-active timer-warning';
        } else {
          bottomTimerEl.className = 'player-timer timer-active';
        }
        if (bottomTimerTextEl) bottomTimerTextEl.textContent = timeStr;
      } else {
        bottomTimerEl.className = 'player-timer timer-inactive';
        if (bottomTimerTextEl) bottomTimerTextEl.textContent = formatTime(currentTurnDurationSec);
      }
    }
    if (bottomTurnProgressEl) {
      bottomTurnProgressEl.style.width = isWhiteTurn ? `${progressPct}%` : '0%';
      bottomTurnProgressEl.style.backgroundColor = remainingSec <= 5 ? '#ef4444' : (remainingSec <= 10 ? '#f97316' : 'var(--gold-primary)');
    }

    // Top Player Timer (Black)
    if (topTimerEl) {
      if (!isWhiteTurn) {
        if (remainingSec <= 5) {
          topTimerEl.className = 'player-timer timer-active timer-urgent';
        } else if (remainingSec <= 10) {
          topTimerEl.className = 'player-timer timer-active timer-warning';
        } else {
          topTimerEl.className = 'player-timer timer-active';
        }
        if (topTimerTextEl) topTimerTextEl.textContent = timeStr;
      } else {
        topTimerEl.className = 'player-timer timer-inactive';
        if (topTimerTextEl) topTimerTextEl.textContent = formatTime(currentTurnDurationSec);
      }
    }
    if (topTurnProgressEl) {
      topTurnProgressEl.style.width = !isWhiteTurn ? `${progressPct}%` : '0%';
      topTurnProgressEl.style.backgroundColor = remainingSec <= 5 ? '#ef4444' : (remainingSec <= 10 ? '#f97316' : 'var(--gold-primary)');
    }

    // Auto timeout for local/solo modes
    if (remainingMs <= 0 && gameMode !== 'online' && !isGameOver) {
      stopTurnCountdown();
      handleLocalTurnTimeout();
    }
  }

  function handleLocalTurnTimeout() {
    if (isGameOver) return;
    showNotification(currentLang === 'fa' ? 'زمان نوبت به پایان رسید!' : 'Turn time expired!');

    if (gameMode === 'solo' && currentTurn === playerColor) {
      if (!hasRolled) {
        handleRollDice();
        setTimeout(() => {
          if (movesRemaining.length > 0) {
            const botMoves = bgLogic.chooseBotTurn(gameState, currentTurn, movesRemaining, 'easy');
            if (botMoves && botMoves.length > 0) {
              botMoves.forEach(m => bgLogic.applySingleMove(gameState, currentTurn, m));
            }
          }
          endTurn();
        }, 1200);
      } else {
        const botMoves = bgLogic.chooseBotTurn(gameState, currentTurn, movesRemaining, 'easy');
        if (botMoves && botMoves.length > 0) {
          botMoves.forEach(m => bgLogic.applySingleMove(gameState, currentTurn, m));
        }
        endTurn();
      }
    } else if (gameMode === 'passplay') {
      endTurn();
    }
  }

  function renderDieFace(dieEl, val) {
    if (!dieEl) return;
    dieEl.setAttribute('data-val', val);
    dieEl.innerHTML = '';
    const numDots = Math.max(1, Math.min(6, parseInt(val, 10) || 1));
    for (let i = 0; i < numDots; i++) {
      const dot = document.createElement('div');
      dot.className = 'die-dot';
      dieEl.appendChild(dot);
    }
  }

  // --- INITIALIZATION ---
  function init() {
    setupBoardDOM();
    setupEventListeners();
    applyLanguage(currentLang);
    checkUrlHash();

    // Initial dice render
    renderDieFace(die1El, 1);
    renderDieFace(die2El, 1);

    // Check if directly loaded with hash
    const openedOnline = checkUrlHash();
    if (!openedOnline) {
      showModal('modal-main-menu');
    }
  }

  function setupBoardDOM() {
    topOuterRow.innerHTML = '';
    bottomOuterRow.innerHTML = '';
    topHomeRow.innerHTML = '';
    bottomHomeRow.innerHTML = '';

    // Standard Persian & International layout:
    // Top-Left: Points 13 to 18 (left to right)
    for (let p = 13; p <= 18; p++) {
      topOuterRow.appendChild(createPointElement(p, 'top', p % 2 === 0 ? 'point-dark' : 'point-light'));
    }

    // Top-Right: Points 19 to 24 (left to right)
    for (let p = 19; p <= 24; p++) {
      topHomeRow.appendChild(createPointElement(p, 'top', p % 2 === 0 ? 'point-dark' : 'point-light'));
    }

    // Bottom-Left: Points 12 down to 7 (left to right)
    for (let p = 12; p >= 7; p--) {
      bottomOuterRow.appendChild(createPointElement(p, 'bottom', p % 2 === 0 ? 'point-light' : 'point-dark'));
    }

    // Bottom-Right: Points 6 down to 1 (left to right)
    for (let p = 6; p >= 1; p--) {
      bottomHomeRow.appendChild(createPointElement(p, 'bottom', p % 2 === 0 ? 'point-light' : 'point-dark'));
    }
  }

  function createPointElement(pointNum, rowType, colorClass) {
    const point = document.createElement('div');
    point.className = `point ${colorClass}`;
    point.dataset.point = pointNum;

    const numSpan = document.createElement('span');
    numSpan.className = 'point-number';
    numSpan.textContent = pointNum;
    point.appendChild(numSpan);

    const checkersWrap = document.createElement('div');
    checkersWrap.className = 'checkers-container';
    checkersWrap.id = `point-checkers-${pointNum}`;
    point.appendChild(checkersWrap);

    point.addEventListener('click', () => handlePointClick(pointNum));
    return point;
  }

  // --- GAME RENDERING ---
  function renderBoard() {
    // 1. Render all 24 points
    for (let p = 1; p <= 24; p++) {
      const wrap = document.getElementById(`point-checkers-${p}`);
      if (!wrap) continue;
      wrap.innerHTML = '';

      const count = gameState.points[p];
      if (count === 0) continue;

      const color = count > 0 ? bgLogic.WHITE : bgLogic.BLACK;
      const absCount = Math.abs(count);
      const displayCount = Math.min(absCount, 5);

      for (let i = 0; i < displayCount; i++) {
        const checker = document.createElement('div');
        checker.className = `checker ${color === bgLogic.WHITE ? 'checker-white' : 'checker-black'}`;
        if (i === displayCount - 1 && absCount > 5) {
          const badge = document.createElement('span');
          badge.className = 'stack-count-badge';
          badge.textContent = `+${absCount - 4}`;
          checker.appendChild(badge);
        }
        wrap.appendChild(checker);
      }
    }

    // 2. Render Bar
    barWhiteEl.innerHTML = '';
    barBlackEl.innerHTML = '';

    for (let i = 0; i < Math.min(gameState.bar.w, 4); i++) {
      const c = document.createElement('div');
      c.className = 'checker checker-white';
      if (i === 3 && gameState.bar.w > 4) {
        c.textContent = `+${gameState.bar.w - 3}`;
      }
      barWhiteEl.appendChild(c);
    }

    for (let i = 0; i < Math.min(gameState.bar.b, 4); i++) {
      const c = document.createElement('div');
      c.className = 'checker checker-black';
      if (i === 3 && gameState.bar.b > 4) {
        c.textContent = `+${gameState.bar.b - 3}`;
      }
      barBlackEl.appendChild(c);
    }

    // 3. Render Bear-off trays
    offChipsWhite.innerHTML = '';
    offChipsBlack.innerHTML = '';

    for (let i = 0; i < gameState.off.w; i++) {
      const chip = document.createElement('div');
      chip.className = 'borne-off-chip white';
      offChipsWhite.appendChild(chip);
    }

    for (let i = 0; i < gameState.off.b; i++) {
      const chip = document.createElement('div');
      chip.className = 'borne-off-chip black';
      offChipsBlack.appendChild(chip);
    }

    // 4. Update HUD
    const t = BG_I18N[currentLang];
    const whitePips = bgLogic.calculatePipCount(gameState, bgLogic.WHITE);
    const blackPips = bgLogic.calculatePipCount(gameState, bgLogic.BLACK);

    document.getElementById('bottom-pip-count').textContent = `${t.pipCountLabel}: ${whitePips}`;
    document.getElementById('top-pip-count').textContent = `${t.pipCountLabel}: ${blackPips}`;

    document.getElementById('bottom-off-count').textContent = `${t.borneOffLabel}: ${gameState.off.w}/15`;
    document.getElementById('top-off-count').textContent = `${t.borneOffLabel}: ${gameState.off.b}/15`;

    // Turn indicator
    const turnDot = document.getElementById('top-turn-dot');
    const turnText = document.getElementById('top-status-text');
    if (currentTurn === bgLogic.WHITE) {
      turnDot.className = 'turn-color-dot white';
      turnText.textContent = t.whiteToMove;
      document.getElementById('bottom-player-bar').classList.add('active-turn');
      document.getElementById('top-player-bar').classList.remove('active-turn');
    } else {
      turnDot.className = 'turn-color-dot black';
      turnText.textContent = t.blackToMove;
      document.getElementById('top-player-bar').classList.add('active-turn');
      document.getElementById('bottom-player-bar').classList.remove('active-turn');
    }

    updateTimerDisplay();

    // Check highlights
    updateHighlights();
    updateControls();
  }

  function updateHighlights() {
    // Clear old highlights
    document.querySelectorAll('.point').forEach(p => {
      p.classList.remove('highlight-valid', 'selected-source');
    });
    offBinWhite.classList.remove('highlight-bearoff');
    offBinBlack.classList.remove('highlight-bearoff');

    if (!selectedPoint || movesRemaining.length === 0) return;

    // Highlight source
    if (selectedPoint !== 'bar') {
      const srcEl = document.querySelector(`.point[data-point="${selectedPoint}"]`);
      if (srcEl) srcEl.classList.add('selected-source');
    }

    // Find and highlight valid targets for selectedPoint
    const uniqueDice = [...new Set(movesRemaining)];
    uniqueDice.forEach(die => {
      const legal = bgLogic.isSingleMoveLegal(gameState, currentTurn, selectedPoint, die);
      if (legal) {
        if (legal.to === 'off') {
          if (currentTurn === bgLogic.WHITE) offBinWhite.classList.add('highlight-bearoff');
          else offBinBlack.classList.add('highlight-bearoff');
        } else {
          const targetEl = document.querySelector(`.point[data-point="${legal.to}"]`);
          if (targetEl) targetEl.classList.add('highlight-valid');
        }
      }
    });
  }

  function updateControls() {
    const isMyTurn = (gameMode === 'solo' && currentTurn === playerColor) ||
                     (gameMode === 'passplay') ||
                     (gameMode === 'online' && (mySeat === 0 ? bgLogic.WHITE : bgLogic.BLACK) === currentTurn);

    btnRoll.disabled = !isMyTurn || hasRolled || isGameOver;
    btnConfirmTurn.style.display = (isMyTurn && hasRolled && movesRemaining.length === 0) ? 'inline-flex' : 'none';
    document.getElementById('btn-undo-move').disabled = turnHistory.length === 0 || !isMyTurn;
  }

  // --- DICE ROLLING ---
  function handleRollDice() {
    if (!hasRolled && !isGameOver) {
      if (gameMode === 'online' && ws && ws.readyState === WebSocket.OPEN) {
        bgSound.playDiceRoll();
        die1El.classList.add('rolling');
        die2El.classList.add('rolling');
        ws.send(JSON.stringify({ type: 'BACKGAMMON_ROLL_DICE' }));
        return;
      }

      bgSound.playDiceRoll();

      die1El.classList.add('rolling');
      die2El.classList.add('rolling');

      setTimeout(() => {
        const rollRes = bgLogic.rollDice();
        currentDice = rollRes.dice;
        movesRemaining = rollRes.movesRemaining;
        hasRolled = true;
        turnHistory = [];
        stateAtTurnStart = bgLogic.cloneGameState(gameState);

        die1El.classList.remove('rolling');
        die2El.classList.remove('rolling');
        renderDieFace(die1El, currentDice[0]);
        renderDieFace(die2El, currentDice[1]);

        logMove(`${currentTurn === bgLogic.WHITE ? 'White' : 'Black'} rolled: [${currentDice[0]}-${currentDice[1]}]`);

        // Check if any legal turns exist
        const legalTurns = bgLogic.getAllLegalTurns(gameState, currentTurn, movesRemaining);
        if (!legalTurns || legalTurns.length === 0 || legalTurns[0].length === 0) {
          showNotification(BG_I18N[currentLang].noMovesAvailable);
          setTimeout(() => endTurn(), 1400);
          return;
        }

        renderBoard();
      }, 450);
    }
  }

  // --- CLICK & MOVE HANDLING ---
  function handlePointClick(pointNum) {
    if (!hasRolled || isGameOver) {
      if (!hasRolled) showNotification(BG_I18N[currentLang].mustRollFirst);
      return;
    }

    const isMyTurn = (gameMode === 'solo' && currentTurn === playerColor) ||
                     (gameMode === 'passplay') ||
                     (gameMode === 'online' && (mySeat === 0 ? bgLogic.WHITE : bgLogic.BLACK) === currentTurn);
    if (!isMyTurn) return;

    const hasBar = currentTurn === bgLogic.WHITE ? gameState.bar.w > 0 : gameState.bar.b > 0;

    // 1. If currently have checker on bar, source MUST be bar!
    if (hasBar) {
      selectedPoint = 'bar';
    }

    // 2. If nothing selected yet:
    if (selectedPoint === null) {
      const hasOwnChecker = currentTurn === bgLogic.WHITE ? gameState.points[pointNum] > 0 : gameState.points[pointNum] < 0;
      if (hasOwnChecker) {
        selectedPoint = pointNum;
        bgSound.playClick();
        renderBoard();
      }
      return;
    }

    // 3. If clicking another own checker point:
    // Check first if moving from selectedPoint to pointNum is a valid move!
    // If it's a legal move, execute the move. Only if it's NOT a valid move do we switch selection.
    const isOwnChecker = currentTurn === bgLogic.WHITE ? gameState.points[pointNum] > 0 : gameState.points[pointNum] < 0;
    if (isOwnChecker && !hasBar && selectedPoint !== pointNum) {
      // Check if moving to this point is legal with any remaining die
      const uniqueDice = [...new Set(movesRemaining)];
      const canMoveThere = uniqueDice.some(die => {
        const legal = bgLogic.isSingleMoveLegal(gameState, currentTurn, selectedPoint, die);
        return legal && legal.to === pointNum;
      });

      if (canMoveThere) {
        executeMoveIfLegal(selectedPoint, pointNum);
        return;
      }

      // Not a valid destination: switch selection to this new point
      selectedPoint = pointNum;
      bgSound.playClick();
      renderBoard();
      return;
    }

    // 4. Try making move from selectedPoint to pointNum
    executeMoveIfLegal(selectedPoint, pointNum);
  }

  function handleBearOffClick() {
    if (!selectedPoint || !hasRolled || isGameOver) return;
    executeMoveIfLegal(selectedPoint, 'off');
  }

  let activeFlyerCleanup = null;

  function animateCheckerMove(from, to, color, onFinish) {
    if (activeFlyerCleanup) {
      activeFlyerCleanup();
    }

    // Safely resolve checker color
    let checkerColor = color;
    if (!checkerColor) {
      if (from === 'bar') {
        checkerColor = (gameState && gameState.bar && gameState.bar.w > 0) ? bgLogic.WHITE : bgLogic.BLACK;
      } else if (typeof from === 'number' && gameState && gameState.points && gameState.points[from] !== 0) {
        checkerColor = gameState.points[from] > 0 ? bgLogic.WHITE : bgLogic.BLACK;
      } else if (typeof to === 'number' && gameState && gameState.points && gameState.points[to] !== 0) {
        checkerColor = gameState.points[to] > 0 ? bgLogic.WHITE : bgLogic.BLACK;
      } else {
        checkerColor = currentTurn;
      }
    }

    let startRect = null;
    let sourceCheckerEl = null;

    if (from === 'bar') {
      const barEl = checkerColor === bgLogic.WHITE ? barWhiteEl : barBlackEl;
      if (barEl && barEl.children.length > 0) {
        sourceCheckerEl = barEl.lastElementChild;
        startRect = sourceCheckerEl.getBoundingClientRect();
      } else if (barEl) {
        const bRect = barEl.getBoundingClientRect();
        startRect = {
          left: bRect.left + (bRect.width - 32) / 2,
          top: bRect.top + (bRect.height - 32) / 2,
          width: 32,
          height: 32
        };
      }
    } else if (typeof from === 'number') {
      const wrap = document.getElementById(`point-checkers-${from}`);
      if (wrap && wrap.children.length > 0) {
        sourceCheckerEl = wrap.lastElementChild;
        startRect = sourceCheckerEl.getBoundingClientRect();
      } else {
        const pt = document.querySelector(`.point[data-point="${from}"]`);
        if (pt) {
          const pRect = pt.getBoundingClientRect();
          const isTop = from >= 13 && from <= 24;
          startRect = {
            left: pRect.left + (pRect.width - 32) / 2,
            top: isTop ? pRect.top + 8 : pRect.bottom - 40,
            width: 32,
            height: 32
          };
        }
      }
    }

    // Fixed circular checker size (always 1:1, never vertically stretched)
    const checkerDim = (sourceCheckerEl && sourceCheckerEl.offsetWidth > 15) ? sourceCheckerEl.offsetWidth : 32;

    let endRect = null;
    if (to === 'off') {
      const offBin = checkerColor === bgLogic.WHITE ? offBinWhite : offBinBlack;
      if (offBin) endRect = offBin.getBoundingClientRect();
    } else if (to === 'bar') {
      const barSlot = checkerColor === bgLogic.WHITE ? barWhiteEl : barBlackEl;
      if (barSlot && barSlot.children.length > 0) {
        const lastChild = barSlot.lastElementChild;
        const cRect = lastChild.getBoundingClientRect();
        endRect = {
          left: cRect.left,
          top: checkerColor === bgLogic.WHITE ? cRect.top - 18 : cRect.top + 18,
          width: checkerDim,
          height: checkerDim
        };
      } else if (barSlot) {
        const bRect = barSlot.getBoundingClientRect();
        endRect = {
          left: bRect.left + (bRect.width - checkerDim) / 2,
          top: bRect.top + (bRect.height - checkerDim) / 2,
          width: checkerDim,
          height: checkerDim
        };
      }
    } else if (typeof to === 'number') {
      const targetWrap = document.getElementById(`point-checkers-${to}`);
      if (targetWrap && targetWrap.children.length > 0) {
        const lastChild = targetWrap.lastElementChild;
        const childRect = lastChild.getBoundingClientRect();
        const isTop = to >= 13 && to <= 24;
        endRect = {
          left: childRect.left,
          top: isTop ? childRect.top + 24 : childRect.top - 24,
          width: checkerDim,
          height: checkerDim
        };
      } else if (targetWrap) {
        const wrapRect = targetWrap.getBoundingClientRect();
        const isTop = to >= 13 && to <= 24;
        endRect = {
          left: wrapRect.left + (wrapRect.width - checkerDim) / 2,
          top: isTop ? wrapRect.top + 8 : wrapRect.bottom - checkerDim - 8,
          width: checkerDim,
          height: checkerDim
        };
      }
    }

    if (!startRect || !endRect || startRect.width === 0 || endRect.width === 0) {
      if (onFinish) onFinish();
      return;
    }

    if (sourceCheckerEl) {
      sourceCheckerEl.style.visibility = 'hidden';
    }

    const flyer = document.createElement('div');
    flyer.className = `checker ${checkerColor === bgLogic.WHITE ? 'checker-white' : 'checker-black'} flying-checker`;
    flyer.style.position = 'fixed';
    flyer.style.left = `${startRect.left}px`;
    flyer.style.top = `${startRect.top}px`;
    flyer.style.width = `${checkerDim}px`;
    flyer.style.height = `${checkerDim}px`;
    flyer.style.margin = '0';
    flyer.style.zIndex = '9999';
    flyer.style.pointerEvents = 'none';
    flyer.style.transform = 'translate3d(0, 0, 0) scale(1.1)';
    flyer.style.boxShadow = '0 10px 24px rgba(0, 0, 0, 0.6), 0 0 10px rgba(245, 197, 24, 0.4)';
    flyer.style.transition = 'transform 0.26s cubic-bezier(0.2, 0.85, 0.4, 1), box-shadow 0.26s ease';
    document.body.appendChild(flyer);

    void flyer.offsetHeight;

    const dx = (endRect.left + (endRect.width || checkerDim) / 2) - (startRect.left + (startRect.width || checkerDim) / 2);
    const dy = (endRect.top + (endRect.height || checkerDim) / 2) - (startRect.top + (startRect.height || checkerDim) / 2);

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
      if (onFinish) onFinish();
    };

    activeFlyerCleanup = cleanup;
    flyer.addEventListener('transitionend', cleanup, { once: true });
    setTimeout(cleanup, 300);
  }

  function executeMoveIfLegal(from, to) {
    // Check which die allows this move
    const uniqueDice = [...new Set(movesRemaining)];
    let matchedDie = null;
    let matchedMove = null;

    for (const die of uniqueDice) {
      const legal = bgLogic.isSingleMoveLegal(gameState, currentTurn, from, die);
      if (legal && legal.to === to) {
        matchedDie = die;
        matchedMove = legal;
        break;
      }
    }

    if (!matchedMove) {
      selectedPoint = null;
      renderBoard();
      return;
    }

    selectedPoint = null;

    if (gameMode === 'online' && ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'BACKGAMMON_MOVE',
        from,
        to
      }));
      return;
    }

    // Apply move with smooth animation (handling hit blot -> bar)
    const moveColor = currentTurn;
    const finalizeTurnAfterMove = () => {
      const checkWin = bgLogic.checkGameOver(gameState);
      if (checkWin.gameOver) {
        handleGameOver(checkWin);
        return;
      }

      if (movesRemaining.length > 0) {
        const remainingLegal = bgLogic.getPossibleSingleMoves(gameState, currentTurn, movesRemaining);
        if (remainingLegal.length === 0) {
          showNotification(BG_I18N[currentLang].noMovesAvailable);
          setTimeout(() => endTurn(), 1000);
        }
      } else {
        setTimeout(() => endTurn(), 400);
      }

      renderBoard();
    };

    if (matchedMove.hit) {
      const victimColor = moveColor === bgLogic.WHITE ? bgLogic.BLACK : bgLogic.WHITE;
      animateCheckerMove(from, to, moveColor, () => {
        bgLogic.applySingleMove(gameState, currentTurn, matchedMove);
        turnHistory.push(matchedMove);
        const dieIdx = movesRemaining.indexOf(matchedDie);
        if (dieIdx !== -1) movesRemaining.splice(dieIdx, 1);
        bgSound.playHit();
        animateCheckerMove(to, 'bar', victimColor, () => {
          finalizeTurnAfterMove();
        });
      });
    } else {
      animateCheckerMove(from, to, moveColor, () => {
        bgLogic.applySingleMove(gameState, currentTurn, matchedMove);
        turnHistory.push(matchedMove);
        const dieIdx = movesRemaining.indexOf(matchedDie);
        if (dieIdx !== -1) movesRemaining.splice(dieIdx, 1);
        if (matchedMove.bearOff) bgSound.playBearOff();
        else bgSound.playMove();
        finalizeTurnAfterMove();
      });
    }
  }

  // --- UNDO MOVE ---
  function undoTurnMoves() {
    if (turnHistory.length === 0 || !stateAtTurnStart) return;
    gameState = bgLogic.cloneGameState(stateAtTurnStart);
    movesRemaining = currentDice[0] === currentDice[1] ? [currentDice[0], currentDice[0], currentDice[0], currentDice[0]] : [...currentDice];
    turnHistory = [];
    selectedPoint = null;
    bgSound.playClick();
    renderBoard();
  }

  // --- END TURN ---
  function endTurn() {
    selectedPoint = null;
    hasRolled = false;
    movesRemaining = [];
    turnHistory = [];
    stateAtTurnStart = null;

    currentTurn = currentTurn === bgLogic.WHITE ? bgLogic.BLACK : bgLogic.WHITE;
    if (gameMode !== 'online' && !isGameOver) {
      startTurnCountdown();
    }
    renderBoard();

    // If Solo Mode and it's Bot's turn:
    if (gameMode === 'solo' && currentTurn !== playerColor && !isGameOver) {
      setTimeout(() => executeBotTurn(), 700);
    }
  }

  // --- BOT EXECUTION ---
  function executeBotTurn() {
    if (isGameOver) return;

    bgSound.playDiceRoll();
    die1El.classList.add('rolling');
    die2El.classList.add('rolling');

    setTimeout(() => {
      const rollRes = bgLogic.rollDice();
      currentDice = rollRes.dice;
      movesRemaining = rollRes.movesRemaining;
      hasRolled = true;

      die1El.classList.remove('rolling');
      die2El.classList.remove('rolling');
      renderDieFace(die1El, currentDice[0]);
      renderDieFace(die2El, currentDice[1]);

      logMove(`Bot (${currentTurn === bgLogic.WHITE ? 'White' : 'Black'}) rolled: [${currentDice[0]}-${currentDice[1]}]`);

      const botMoves = bgLogic.chooseBotTurn(gameState, currentTurn, movesRemaining, botDifficulty);

      if (!botMoves || botMoves.length === 0) {
        showNotification(BG_I18N[currentLang].noMovesAvailable);
        setTimeout(() => endTurn(), 1200);
        return;
      }

      // Step-by-step playback with smooth animation
      let moveIdx = 0;
      function stepBot() {
        if (moveIdx >= botMoves.length) {
          setTimeout(() => endTurn(), 400);
          return;
        }

        const move = botMoves[moveIdx];
        if (move.hit) {
          const victimColor = currentTurn === bgLogic.WHITE ? bgLogic.BLACK : bgLogic.WHITE;
          animateCheckerMove(move.from, move.to, currentTurn, () => {
            bgLogic.applySingleMove(gameState, currentTurn, move);
            bgSound.playHit();
            animateCheckerMove(move.to, 'bar', victimColor, () => {
              renderBoard();
              const checkWin = bgLogic.checkGameOver(gameState);
              if (checkWin.gameOver) {
                handleGameOver(checkWin);
                return;
              }
              moveIdx++;
              setTimeout(stepBot, 450);
            });
          });
        } else {
          animateCheckerMove(move.from, move.to, currentTurn, () => {
            bgLogic.applySingleMove(gameState, currentTurn, move);

            if (move.bearOff) bgSound.playBearOff();
            else bgSound.playMove();

            renderBoard();

            const checkWin = bgLogic.checkGameOver(gameState);
            if (checkWin.gameOver) {
              handleGameOver(checkWin);
              return;
            }

            moveIdx++;
            setTimeout(stepBot, 450);
          });
        }
      }

      setTimeout(stepBot, 400);
    }, 450);
  }

  // --- GAME OVER ---
  function handleGameOver(result) {
    isGameOver = true;
    stopTurnCountdown();
    bgSound.playVictory();

    const t = BG_I18N[currentLang];
    const winnerName = result.winner === bgLogic.WHITE ? t.colorWhiteTitle : t.colorBlackTitle;

    document.getElementById('result-main-text').textContent = `${winnerName} برنده شد!`;
    let sub = t.normalWin;
    if (result.winType === 'gammon') sub = t.marsWin;
    if (result.winType === 'backgammon') sub = t.vishMarsWin;
    document.getElementById('result-sub-text').textContent = sub;

    showModal('modal-game-over');
  }

  // --- SOLO & PASS-PLAY START ---
  function startSoloGame(color) {
    gameMode = 'solo';
    playerColor = color === 'random' ? (Math.random() < 0.5 ? bgLogic.WHITE : bgLogic.BLACK) : color;
    currentTurn = bgLogic.WHITE;
    gameState = bgLogic.getInitialBoard();
    hasRolled = false;
    isGameOver = false;
    movesRemaining = [];
    turnHistory = [];

    document.getElementById('bottom-player-name').textContent = playerColor === bgLogic.WHITE ? 'You (White)' : 'Bot (White)';
    document.getElementById('top-player-name').textContent = playerColor === bgLogic.WHITE ? 'Bot (Black)' : 'You (Black)';

    const bStatus = document.getElementById('bottom-online-status');
    const tStatus = document.getElementById('top-online-status');
    if (bStatus) { bStatus.className = 'online-indicator online'; bStatus.title = playerColor === bgLogic.WHITE ? 'You' : 'Bot'; }
    if (tStatus) { tStatus.className = 'online-indicator online'; tStatus.title = playerColor === bgLogic.WHITE ? 'Bot' : 'You'; }
    const bAvatar = document.getElementById('bottom-avatar');
    const tAvatar = document.getElementById('top-avatar');
    if (bAvatar) bAvatar.textContent = playerColor === bgLogic.WHITE ? '👤' : '🤖';
    if (tAvatar) tAvatar.textContent = playerColor === bgLogic.WHITE ? '🤖' : '👤';

    hideModals();
    renderBoard();
    startTurnCountdown();

    if (playerColor === bgLogic.BLACK) {
      setTimeout(() => executeBotTurn(), 800);
    }
  }

  function startPassPlayGame() {
    gameMode = 'passplay';
    playerColor = bgLogic.WHITE;
    currentTurn = bgLogic.WHITE;
    gameState = bgLogic.getInitialBoard();
    hasRolled = false;
    isGameOver = false;
    movesRemaining = [];
    turnHistory = [];

    document.getElementById('bottom-player-name').textContent = 'Player 1 (White ⚪)';
    document.getElementById('top-player-name').textContent = 'Player 2 (Black ⚫)';

    const bStatus = document.getElementById('bottom-online-status');
    const tStatus = document.getElementById('top-online-status');
    if (bStatus) { bStatus.className = 'online-indicator online'; bStatus.title = 'Local Player 1'; }
    if (tStatus) { tStatus.className = 'online-indicator online'; tStatus.title = 'Local Player 2'; }
    const bAvatar = document.getElementById('bottom-avatar');
    const tAvatar = document.getElementById('top-avatar');
    if (bAvatar) bAvatar.textContent = '👤';
    if (tAvatar) tAvatar.textContent = '👤';

    hideModals();
    renderBoard();
    startTurnCountdown();
  }

  // --- MULTIPLAYER WEBSOCKET ---
  function connectWebSocket(roomCodeToJoin, isCreating = false) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${window.location.host}`);

    ws.onopen = () => {
      if (isCreating) {
        ws.send(JSON.stringify({
          type: 'CREATE_ROOM',
          gameType: 'backgammon',
          playerName: localPlayerName
        }));
      } else {
        ws.send(JSON.stringify({
          type: 'JOIN_ROOM',
          roomCode: roomCodeToJoin,
          playerName: localPlayerName
        }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        handleServerMessage(msg);
      } catch (e) {
        console.error(e);
      }
    };
  }

  function handleServerMessage(msg) {
    if (msg.type === 'ROOM_CREATED' || msg.type === 'LOBBY_UPDATE') {
      roomCode = msg.roomCode;
      isHost = msg.isHost;
      mySeat = msg.yourSeat;
      document.getElementById('mp-room-code').textContent = roomCode;
      document.getElementById('mp-entry-view').style.display = 'none';
      document.getElementById('mp-lobby-view').style.display = 'block';

      // Render seats
      const container = document.getElementById('lobby-seats-container');
      container.innerHTML = '';
      if (msg.seats) {
        msg.seats.forEach(s => {
          const seatCard = document.createElement('div');
          seatCard.className = 'seat-card';
          seatCard.style.cssText = 'flex:1; background:rgba(0,0,0,0.4); padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); text-align:center;';
          seatCard.innerHTML = `
            <div style="font-size:1.4rem;">${s.seat === 0 ? '⚪' : '⚫'}</div>
            <div style="font-weight:700; margin-top:4px;">${s.name}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${s.seat === 0 ? 'White (White Checkers)' : 'Black (Black Checkers)'}</div>
          `;
          container.appendChild(seatCard);
        });
      }

      if (isHost) {
        document.getElementById('btn-start-online-game').style.display = 'block';
        document.getElementById('lobby-waiting-msg').style.display = 'none';
      } else {
        document.getElementById('btn-start-online-game').style.display = 'none';
        document.getElementById('lobby-waiting-msg').style.display = 'block';
      }
    } else if (msg.type === 'GAME_STATE') {
      gameMode = 'online';
      const prevHasRolled = hasRolled;
      const prevDice = currentDice ? [...currentDice] : null;

      gameState = msg.state.gameState;
      currentTurn = msg.state.turn;
      currentDice = msg.state.currentDice || [1, 1];
      movesRemaining = msg.state.movesRemaining || [];
      hasRolled = msg.state.hasRolled;
      if (msg.state.mySeat !== undefined && msg.state.mySeat !== -1) {
        mySeat = msg.state.mySeat;
      }

      // 1. Dice roll animation
      const justRolled = (!prevHasRolled && hasRolled) ||
        (hasRolled && prevDice && (prevDice[0] !== currentDice[0] || prevDice[1] !== currentDice[1]) && movesRemaining.length >= 2);

      if (justRolled) {
        die1El.classList.add('rolling');
        die2El.classList.add('rolling');
        bgSound.playDiceRoll();
        setTimeout(() => {
          die1El.classList.remove('rolling');
          die2El.classList.remove('rolling');
          renderDieFace(die1El, currentDice[0]);
          renderDieFace(die2El, currentDice[1]);
        }, 360);
      } else {
        die1El.classList.remove('rolling');
        die2El.classList.remove('rolling');
        renderDieFace(die1El, currentDice[0]);
        renderDieFace(die2El, currentDice[1]);
      }

      // 2. Player Info & Online Indicators
      if (msg.state.players && msg.state.players[0] && msg.state.players[1]) {
        const whitePlayer = msg.state.players[0];
        const blackPlayer = msg.state.players[1];

        const bottomNameEl = document.getElementById('bottom-player-name');
        const topNameEl = document.getElementById('top-player-name');
        const bottomStatusEl = document.getElementById('bottom-online-status');
        const topStatusEl = document.getElementById('top-online-status');
        const bottomAvatarEl = document.getElementById('bottom-avatar');
        const topAvatarEl = document.getElementById('top-avatar');

        // White Player (Seat 0 / Bottom)
        const isWhiteOnline = whitePlayer.isOnline && !whitePlayer.isAfk;
        const isWhiteAI = whitePlayer.isBot || whitePlayer.isAfk || !whitePlayer.isOnline;
        let whiteLabel = whitePlayer.name;
        if (mySeat === 0) {
          whiteLabel = currentLang === 'fa' ? `شما (${whitePlayer.name})` : `You (${whitePlayer.name})`;
        } else if (isWhiteAI) {
          whiteLabel = `${whitePlayer.name} (AI)`;
        }
        if (bottomNameEl) bottomNameEl.textContent = whiteLabel;
        if (bottomAvatarEl) bottomAvatarEl.textContent = isWhiteAI ? '🤖' : (mySeat === 0 ? '👤' : '🧑');
        if (bottomStatusEl) {
          bottomStatusEl.className = `online-indicator ${isWhiteOnline ? 'online' : 'offline'}`;
          bottomStatusEl.title = isWhiteOnline ? (whitePlayer.isBot ? 'Bot' : 'Online') : (currentLang === 'fa' ? 'آفلاین (جایگزین AI)' : 'Offline (AI Playing)');
        }

        // Black Player (Seat 1 / Top)
        const isBlackOnline = blackPlayer.isOnline && !blackPlayer.isAfk;
        const isBlackAI = blackPlayer.isBot || blackPlayer.isAfk || !blackPlayer.isOnline;
        let blackLabel = blackPlayer.name;
        if (mySeat === 1) {
          blackLabel = currentLang === 'fa' ? `شما (${blackPlayer.name})` : `You (${blackPlayer.name})`;
        } else if (isBlackAI) {
          blackLabel = `${blackPlayer.name} (AI)`;
        }
        if (topNameEl) topNameEl.textContent = blackLabel;
        if (topAvatarEl) topAvatarEl.textContent = isBlackAI ? '🤖' : (mySeat === 1 ? '👤' : '🧑');
        if (topStatusEl) {
          topStatusEl.className = `online-indicator ${isBlackOnline ? 'online' : 'offline'}`;
          topStatusEl.title = isBlackOnline ? (blackPlayer.isBot ? 'Bot' : 'Online') : (currentLang === 'fa' ? 'آفلاین (جایگزین AI)' : 'Offline (AI Playing)');
        }
      }

      hideModals();

      // 3. Move Animation or Direct Render
      if (msg.state.lastMove) {
        const lm = msg.state.lastMove;
        const moveColor = lm.color || (currentTurn === bgLogic.WHITE ? bgLogic.WHITE : bgLogic.BLACK);
        if (lm.hit) {
          const victimColor = moveColor === bgLogic.WHITE ? bgLogic.BLACK : bgLogic.WHITE;
          animateCheckerMove(lm.from, lm.to, moveColor, () => {
            bgSound.playHit();
            animateCheckerMove(lm.to, 'bar', victimColor, () => {
              renderBoard();
            });
          });
        } else {
          animateCheckerMove(lm.from, lm.to, moveColor, () => {
            if (lm.bearOff) bgSound.playBearOff();
            else bgSound.playMove();
            renderBoard();
          });
        }
      } else {
        renderBoard();
      }

      if (msg.state.status === 'PLAYING') {
        startTurnCountdown(msg.state.turnStartTime, msg.state.turnDuration || 30);
      } else {
        stopTurnCountdown();
      }
    } else if (msg.type === 'GAME_OVER') {
      handleGameOver(msg.result);
    } else if (msg.type === 'CHAT' || msg.type === 'CHAT_MESSAGE') {
      addChatMessage(msg.sender, msg.text);
    }
  }

  // --- UI HELPERS & LISTENERS ---
  function setupEventListeners() {
    btnRoll.addEventListener('click', handleRollDice);
    btnConfirmTurn.addEventListener('click', endTurn);
    offBinWhite.addEventListener('click', handleBearOffClick);
    offBinBlack.addEventListener('click', handleBearOffClick);

    // AI Hint
    document.getElementById('btn-hint-move').addEventListener('click', () => {
      if (!hasRolled || movesRemaining.length === 0 || isGameOver) return;
      const bestTurn = bgLogic.chooseBotTurn(gameState, currentTurn, movesRemaining, 'hard');
      if (bestTurn && bestTurn.length > 0) {
        selectedPoint = bestTurn[0].from;
        bgSound.playClick();
        renderBoard();
        showNotification(currentLang === 'fa' ? `پیشنهاد: حرکت از خانه ${bestTurn[0].from} با تاس ${bestTurn[0].die}` : `Hint: Move from point ${bestTurn[0].from} with die ${bestTurn[0].die}`);
      }
    });

    // Multiplayer room controls
    document.getElementById('btn-start-online-game').addEventListener('click', () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'START_GAME' }));
      }
    });

    document.getElementById('btn-swap-bg-seats').addEventListener('click', () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'SWAP_SEATS', seatA: 0, seatB: 1 }));
      }
    });

    document.getElementById('btn-leave-room').addEventListener('click', () => {
      stopTurnCountdown();
      if (ws) {
        ws.close();
        ws = null;
      }
      hideModals();
      showModal('modal-main-menu');
    });

    document.getElementById('btn-copy-room-link').addEventListener('click', () => {
      if (roomCode) {
        const link = `${window.location.origin}/games/backgammon/#${roomCode}`;
        navigator.clipboard.writeText(link).then(() => {
          showNotification(BG_I18N[currentLang].linkCopied);
        }).catch(() => {
          showNotification(roomCode);
        });
      }
    });

    document.getElementById('btn-save-lobby-name').addEventListener('click', () => {
      const nameInput = document.getElementById('lobby-name-input');
      const newName = (nameInput.value || '').trim();
      if (newName) {
        localPlayerName = newName;
        localStorage.setItem('rubik_bg_player_name', newName);
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'UPDATE_NAME', name: newName }));
        }
        showNotification(currentLang === 'fa' ? 'نام ثبت شد' : 'Name saved');
      }
    });
    offBinBlack.addEventListener('click', handleBearOffClick);

    // Top actions
    document.getElementById('btn-sound').addEventListener('click', () => {
      const muted = bgSound.toggleMute();
      document.getElementById('btn-sound').textContent = muted ? '🔇' : '🔊';
    });

    document.getElementById('btn-lang').addEventListener('click', () => {
      applyLanguage(currentLang === 'fa' ? 'en' : 'fa');
    });

    document.getElementById('btn-rules').addEventListener('click', () => showModal('modal-rules'));
    document.getElementById('btn-close-rules').addEventListener('click', () => hideModals());
    document.getElementById('btn-menu').addEventListener('click', () => showModal('modal-main-menu'));
    document.getElementById('btn-multiplayer').addEventListener('click', () => showModal('modal-multiplayer'));
    const btnOnlineMatch = document.getElementById('btn-online-match');
    if (btnOnlineMatch) {
      btnOnlineMatch.addEventListener('click', () => showModal('modal-multiplayer'));
    }

    // Controls
    document.getElementById('btn-undo-move').addEventListener('click', undoTurnMoves);
    document.getElementById('btn-new-game').addEventListener('click', () => showModal('modal-main-menu'));
    document.getElementById('btn-resign-game').addEventListener('click', () => {
      if (!isGameOver) {
        if (gameMode === 'online' && ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'BACKGAMMON_RESIGN' }));
          return;
        }
        const winner = currentTurn === bgLogic.WHITE ? bgLogic.BLACK : bgLogic.WHITE;
        handleGameOver({ gameOver: true, winner, winType: 'normal' });
      }
    });

    // Modals menu
    document.getElementById('btn-menu-solo').addEventListener('click', () => showModal('modal-solo-setup'));
    document.getElementById('btn-menu-passplay').addEventListener('click', () => startPassPlayGame());
    document.getElementById('btn-menu-online').addEventListener('click', () => showModal('modal-multiplayer'));
    document.getElementById('btn-menu-rules').addEventListener('click', () => showModal('modal-rules'));

    // Solo color buttons
    document.getElementById('btn-solo-white').addEventListener('click', () => startSoloGame('w'));
    document.getElementById('btn-solo-black').addEventListener('click', () => startSoloGame('b'));
    document.getElementById('btn-solo-random').addEventListener('click', () => startSoloGame('random'));
    document.getElementById('btn-close-solo-setup').addEventListener('click', () => showModal('modal-main-menu'));

    // Difficulty buttons
    document.querySelectorAll('.btn-diff').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.btn-diff').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        botDifficulty = e.currentTarget.getAttribute('data-level');
      });
    });

    // Chat Drawer
    const chatDrawer = document.getElementById('chat-drawer');
    document.getElementById('chat-header').addEventListener('click', () => {
      chatDrawer.classList.toggle('open');
    });
    document.getElementById('btn-send-chat').addEventListener('click', sendChatInput);
    document.getElementById('chat-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendChatInput();
    });

    // Mobile nav
    const mobBtn = document.getElementById('btn-mobile-nav');
    const mobDropdown = document.getElementById('mobile-nav-dropdown');
    mobBtn.addEventListener('click', () => mobDropdown.classList.toggle('active'));

    // Bar click for re-entry
    barWhiteEl.addEventListener('click', () => {
      if (currentTurn === bgLogic.WHITE && gameState.bar.w > 0) {
        selectedPoint = 'bar';
        bgSound.playClick();
        renderBoard();
      }
    });

    barBlackEl.addEventListener('click', () => {
      if (currentTurn === bgLogic.BLACK && gameState.bar.b > 0) {
        selectedPoint = 'bar';
        bgSound.playClick();
        renderBoard();
      }
    });

    // Result modal
    document.getElementById('btn-result-restart').addEventListener('click', () => {
      hideModals();
      startSoloGame(playerColor);
    });
    document.getElementById('btn-result-menu').addEventListener('click', () => showModal('modal-main-menu'));

    // Multiplayer buttons
    document.getElementById('btn-create-room').addEventListener('click', () => {
      connectWebSocket(null, true);
    });
    document.getElementById('btn-show-join').addEventListener('click', () => {
      document.getElementById('mp-join-fields').style.display = 'block';
    });
    document.getElementById('btn-confirm-join').addEventListener('click', () => {
      const code = (document.getElementById('input-room-code').value || '').trim().toUpperCase();
      if (code.length >= 3) connectWebSocket(code, false);
    });
    document.getElementById('btn-close-mp').addEventListener('click', () => hideModals());
  }

  function showModal(id) {
    hideModals();
    const m = document.getElementById(id);
    if (m) m.classList.add('active');
  }

  function hideModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  }

  function showNotification(text) {
    notifEl.textContent = text;
    notifEl.classList.add('show');
    setTimeout(() => notifEl.classList.remove('show'), 2400);
  }

  function logMove(text) {
    const entry = document.createElement('div');
    entry.className = `move-entry turn-${currentTurn}`;
    entry.textContent = text;
    movesContainer.appendChild(entry);
    movesContainer.scrollTop = movesContainer.scrollHeight;
  }

  function addChatMessage(sender, text) {
    const wrap = document.getElementById('chat-messages');
    const msg = document.createElement('div');
    msg.className = 'chat-msg';
    msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
    wrap.appendChild(msg);
    wrap.scrollTop = wrap.scrollHeight;
  }

  function sendChatInput() {
    const input = document.getElementById('chat-input');
    const val = (input.value || '').trim();
    if (!val) return;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'CHAT', text: val }));
    } else {
      addChatMessage('You', val);
    }
    input.value = '';
  }

  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('rubik_card_lang', lang);
    document.documentElement.lang = lang;
    document.body.dir = lang === 'fa' ? 'rtl' : 'ltr';

    const t = BG_I18N[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key]) el.textContent = t[key];
    });

    // Populate rules content
    document.getElementById('rules-content').innerHTML = lang === 'fa' ? `
      <h4>۱. هدف و ساختار تخته نرد</h4>
      <p>تخته نرد یک بازی کهن ۲ نفره است. صفحه بازی شامل ۲۴ خانه (مثلث) است. هر بازیکن ۱۵ مهره در اختیار دارد. سفید در جهت خلاف عقربه‌ها (از ۲۴ به سمت ۱) و سیاه در جهت عقربه‌ها (از ۱ به سمت ۲۴) حرکت می‌کنند. هدف این است که تمام ۱۵ مهره خود را به خانه خودی رسانده و سپس از صفحه خارج کنید.</p>
      <h4>۲. حرکت مهره‌ها با تاس</h4>
      <p>در هر نوبت ۲ تاس پرتاب می‌شود. اعداد تاس نشان‌دهنده تعداد خانه‌های قابل حرکت هستند. در صورت آوردن جفت (مثلاً ۴-۴)، بازیکن ۴ بار از آن عدد استفاده می‌کند.</p>
      <h4>۳. زدن مهره تک (تک‌خال یا گشاد) و ورود از پیشخوان</h4>
      <p>اگر مهره‌ای روی خانه‌ای قرار گیرد که فقط یک مهره حریف در آن است، آن مهره زده شده و به پیشخوان (بار) می‌رود. بازیکنی که مهره در بار دارد، تا زمانی که آن مهره را مجدداً وارد زمین نکرده نمی‌تواند حرکت دیگری انجام دهد.</p>
      <h4>۴. بستن خانه‌ها</h4>
      <p>اگر در یک خانه ۲ مهره یا بیشتر از یک رنگ باشد، آن خانه بسته است و حریف نمی‌تواند روی آن فرود بیاید.</p>
      <h4>۵. خارج کردن مهره‌ها (برداشتن) و بردهای مارس</h4>
      <p>وقتی تمام ۱۵ مهره بازیکن وارد خانه ۶ تایی خود شد، امکان برداشتن مهره‌ها از بازی آغاز می‌شود. اولین بازیکنی که همه مهره‌هایش را خارج کند برنده است.<br>
      • <strong>برد عادی (۱ امتیاز)</strong>: حریف حداقل یک مهره خارج کرده باشد.<br>
      • <strong>مارس (۲ امتیاز)</strong>: حریف هیچ مهره‌ای خارج نکرده باشد.<br>
      • <strong>ویش‌مارس / سگ‌مارس (۳ امتیاز)</strong>: حریف مهره خارج نکرده و مهره‌ای روی بار یا در خانه شما داشته باشد.</p>
    ` : `
      <h4>1. Objective & Layout</h4>
      <p>Backgammon is a classic 2-player game with 24 triangular points. Each player commands 15 checkers. White moves counter-clockwise (24 down to 1), and Black moves clockwise (1 up to 24). The goal is to bring all 15 checkers into your home board and bear them off.</p>
      <h4>2. Dice Movement</h4>
      <p>Players roll two dice each turn. Rolling doubles grants 4 moves of that value. Players must use both dice numbers if legally possible.</p>
      <h4>3. Hitting Blots & The Bar</h4>
      <p>A single checker on a point is a "blot". If an opposing checker lands on it, the blot is hit and placed on the Bar. Checkers on the bar must re-enter the opponent's home board before any other moves can be made.</p>
      <h4>4. Bearing Off & Victory Types</h4>
      <p>• <strong>Normal Win (1 Pt)</strong>: Loser bore off at least one checker.<br>
      • <strong>Gammon / Mars (2 Pts)</strong>: Loser bore off 0 checkers.<br>
      • <strong>Backgammon / Vish-Mars (3 Pts)</strong>: Loser bore off 0 checkers and has a checker on the bar or in winner's home board.</p>
    `;

    renderBoard();
  }

  function checkUrlHash() {
    const hash = (window.location.hash || '').replace('#', '').trim().toUpperCase();
    if (hash === 'ONLINE') {
      showModal('modal-multiplayer');
      return true;
    } else if (hash.length >= 3) {
      showModal('modal-multiplayer');
      const joinFields = document.getElementById('mp-join-fields');
      const inputCode = document.getElementById('input-room-code');
      if (joinFields) joinFields.style.display = 'block';
      if (inputCode) inputCode.value = hash;
      connectWebSocket(hash, false);
      return true;
    }
    return false;
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
