/**
 * Root: Woodland Strategy & Might - Client Controller & Tabletop Renderer
 * Pure native ES6+, SVG vector board, highlighted legal action generator,
 * offline AI bots and online WebSocket multiplayer.
 */

(function () {
  'use strict';

  // Board Clearing Coordinates on 1000x800 SVG Canvas
  const CLEARING_POSITIONS = {
    1: { x: 160, y: 140 },
    2: { x: 480, y: 110 },
    3: { x: 820, y: 130 },
    4: { x: 860, y: 350 },
    5: { x: 150, y: 380 },
    6: { x: 490, y: 340 },
    7: { x: 670, y: 470 },
    8: { x: 880, y: 560 },
    9: { x: 160, y: 670 },
    10: { x: 410, y: 640 },
    11: { x: 630, y: 680 },
    12: { x: 860, y: 700 }
  };

  const PATH_CONNECTIONS = [
    [1, 2], [1, 5], [2, 3], [2, 6], [3, 4], [4, 7], [4, 8],
    [5, 6], [5, 9], [6, 7], [6, 10], [7, 8], [7, 11], [8, 12],
    [9, 10], [10, 11], [11, 12]
  ];

  const RIVER_CONNECTIONS = [
    [1, 2], [2, 6], [6, 7], [7, 8], [8, 12]
  ];

  // Client State
  let gameState = null;
  let mySeatIndex = 0;
  let isOnline = false;
  let ws = null;
  let roomCode = null;
  let isHost = true;
  let selectedClearingId = null;
  let currentLang = 'fa';
  let panZoom = { x: 0, y: 0, scale: 1, isPanning: false, startX: 0, startY: 0 };

  try {
    currentLang = localStorage.getItem('rubik_card_lang') || 'fa';
  } catch (e) {}

  // =========================================================================
  // 1. INITIALIZATION & ASSET LOADING
  // =========================================================================
  async function init() {
    setupDomListeners();
    setupPanZoom();
    applyLanguage(currentLang);

    // Fetch and inject SVG symbols
    try {
      const res = await fetch('root-assets.svg');
      const svgText = await res.text();
      const container = document.getElementById('svg-assets-container');
      if (container) container.innerHTML = svgText;
    } catch (err) {
      console.warn('Error pre-loading root-assets.svg:', err);
    }

    // Check URL hash for online room code
    const hash = (window.location.hash || '').replace('#', '').trim().toUpperCase();
    if (hash === 'ONLINE') {
      openLobbyModal();
    } else if (hash.length === 4) {
      connectOnlineRoom(hash);
    } else {
      startOfflineMatch();
    }
  }

  // =========================================================================
  // 2. MATCH & LOBBY MANAGEMENT
  // =========================================================================
  function startOfflineMatch(difficulty = 'normal') {
    isOnline = false;
    mySeatIndex = 0; // Marquise human
    gameState = RootLogic.createInitialState({
      seed: Date.now() & 0xFFFFFF,
      bots: [false, true, true, true],
      difficulties: ['normal', difficulty, difficulty, difficulty]
    });

    renderAll();
    closeAllModals();
    RootSound.play('march');
  }

  function connectOnlineRoom(code) {
    isOnline = true;
    roomCode = code;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${window.location.host}`);

    ws.onopen = () => {
      const username = (typeof RubikUserCache !== 'undefined') ? RubikUserCache.getUsername() : 'Player';
      ws.send(JSON.stringify({
        type: 'JOIN_ROOM',
        roomCode: code,
        playerName: username
      }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        handleServerMessage(msg);
      } catch (err) {
        console.error('WS Error:', err);
      }
    };

    ws.onclose = () => {
      console.warn('WebSocket connection lost');
    };
  }

  function handleServerMessage(msg) {
    if (msg.type === 'ROOM_CREATED' || msg.type === 'ROOM_JOINED') {
      roomCode = msg.roomCode;
      mySeatIndex = msg.seat;
      window.location.hash = `#${roomCode}`;
      const codeEl = document.getElementById('lobby-room-code');
      if (codeEl) codeEl.textContent = roomCode;
    } else if (msg.type === 'LOBBY_UPDATE') {
      isHost = msg.isHost;
      renderLobbySeats(msg.seats);
    } else if (msg.type === 'GAME_STARTED' || msg.type === 'STATE_UPDATE') {
      gameState = msg.state;
      closeAllModals();
      renderAll();
    } else if (msg.type === 'BATTLE_RESULT') {
      showCombatResult(msg.data);
    }
  }

  function sendIntent(action) {
    if (isOnline && ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'ROOT_INTENT',
        roomCode,
        action
      }));
    } else {
      // Local engine execution
      executeActionLocally(action);
    }
  }

  function executeActionLocally(action) {
    if (!gameState) return;

    if (action.type === 'ADVANCE_PHASE') {
      if (gameState.phase === 'BIRDSONG') {
        gameState.phase = 'DAYLIGHT';
      } else if (gameState.phase === 'DAYLIGHT') {
        gameState.phase = 'EVENING';
      } else if (gameState.phase === 'EVENING') {
        // Pass turn to next player
        gameState.phase = 'BIRDSONG';
        gameState.activePlayerIndex = (gameState.activePlayerIndex + 1) % gameState.players.length;
        // Check dominance victory
        checkDominanceVictory(gameState);
      }
      RootSound.play('click');
    } else if (action.type === 'MARQUISE_PLACE_WOOD') {
      const cl = gameState.clearings.find(c => c.id === action.clearingId);
      if (cl) {
        for (let i = 0; i < action.count; i++) {
          cl.pieces.tokens.push({ type: 'wood', faction: 'marquise' });
          gameState.factionData.marquise.woodInSupply--;
        }
        RootSound.play('build');
      }
    } else if (action.type === 'MARQUISE_BUILD') {
      const cl = gameState.clearings.find(c => c.id === action.clearingId);
      if (cl) {
        cl.pieces.buildings.push({ type: action.buildingType, faction: 'marquise' });
        gameState.factionData.marquise[`${action.buildingType}sRemaining`]--;
        // Remove spent wood from connected clearings
        removeConnectedWood(gameState, action.clearingId, action.woodCost, 'marquise');
        // Score building VP
        const track = RootLogic.MARQUISE_TRACKS[action.buildingType];
        const vp = track.vps[6 - gameState.factionData.marquise[`${action.buildingType}sRemaining`]];
        gameState.players[0].score += vp;
        gameState.factionData.marquise.actionsRemaining--;
        RootSound.play('build');
      }
    } else if (action.type === 'MOVE') {
      const fromCl = gameState.clearings.find(c => c.id === action.from);
      const toCl = gameState.clearings.find(c => c.id === action.to);
      const activeFaction = gameState.players[gameState.activePlayerIndex].faction;
      if (fromCl && toCl) {
        fromCl.pieces[activeFaction] -= action.count;
        toCl.pieces[activeFaction] = (toCl.pieces[activeFaction] || 0) + action.count;
        if (activeFaction === 'marquise') gameState.factionData.marquise.actionsRemaining--;
        RootSound.play('march');
      }
    } else if (action.type === 'BATTLE') {
      const result = RootLogic.resolveBattle(gameState, action.clearingId, action.attackerFaction, action.defenderFaction);
      showCombatResult(result);
      if (action.attackerFaction === 'marquise') gameState.factionData.marquise.actionsRemaining--;
      RootSound.play('battle');
    } else if (action.type === 'EYRIE_ADD_TO_DECREE') {
      const p = gameState.players[gameState.activePlayerIndex];
      const card = p.hand.splice(action.cardIndex, 1)[0];
      if (card) {
        gameState.factionData.eyrie.decree[action.column].push(card);
        RootSound.play('click');
      }
    } else if (action.type === 'EYRIE_RESOLVE_DECREE') {
      resolveEyrieDecreeLocally();
    } else if (action.type === 'EYRIE_EVENING_SCORE') {
      const p = gameState.players.find(pl => pl.faction === 'eyrie');
      if (p) p.score += action.vp;
      RootLogic.checkVictory(gameState);
      gameState.phase = 'BIRDSONG';
      gameState.activePlayerIndex = (gameState.activePlayerIndex + 1) % gameState.players.length;
      RootSound.play('click');
    } else if (action.type === 'ALLIANCE_SPREAD_SYMPATHY') {
      const cl = gameState.clearings.find(c => c.id === action.clearingId);
      if (cl) {
        cl.pieces.tokens.push({ type: 'sympathy', faction: 'alliance' });
        gameState.factionData.alliance.sympathyRemaining--;
        // Remove spent supporters
        gameState.factionData.alliance.supporters.splice(0, action.cost);
        // Score sympathy VP
        const vp = RootLogic.ALLIANCE_SYMPATHY_VPS[10 - gameState.factionData.alliance.sympathyRemaining];
        gameState.players.find(p => p.faction === 'alliance').score += vp;
        RootSound.play('craft');
      }
    } else if (action.type === 'VAGABOND_MOVE') {
      gameState.factionData.vagabond.currentLocation = action.toId;
      gameState.factionData.vagabond.locationType = 'clearing';
      const boot = gameState.factionData.vagabond.items.find(i => i.type === 'boot' && i.state === 'ready');
      if (boot) boot.state = 'exhausted';
      RootSound.play('march');
    } else if (action.type === 'VAGABOND_EXPLORE_RUIN') {
      const cl = gameState.clearings.find(c => c.id === action.clearingId);
      if (cl && cl.hasRuin) {
        cl.hasRuin = false;
        if (cl.ruinItem) {
          gameState.factionData.vagabond.items.push({ type: cl.ruinItem, state: 'exhausted' });
        }
        const torch = gameState.factionData.vagabond.items.find(i => i.type === 'torch' && i.state === 'ready');
        if (torch) torch.state = 'exhausted';
        gameState.players.find(p => p.faction === 'vagabond').score += 1;
        RootSound.play('craft');
      }
    }

    RootLogic.checkVictory(gameState);
    renderAll();

    // Trigger AI if next active player is a bot
    checkBotTurn();
  }

  function resolveEyrieDecreeLocally() {
    const fData = state.factionData.eyrie;
    // Auto-execute decree columns
    RootSound.play('march');
    gameState.phase = 'EVENING';
  }

  function checkDominanceVictory(state) {
    // Check if any player played a dominance card and controls 3 matching clearings
    state.players.forEach(p => {
      if (p.dominanceCard) {
        const suit = p.dominanceCard.suit;
        const ruledCount = state.clearings.filter(c => c.suit === suit && RootLogic.factionRulesClearing(c, p.faction)).length;
        if (ruledCount >= 3) {
          state.status = 'FINISHED';
          state.winner = p.faction;
          state.victoryType = 'DOMINANCE';
        }
      }
    });
  }

  function checkBotTurn() {
    if (!gameState || gameState.status !== 'PLAYING') return;
    const activePlayer = gameState.players[gameState.activePlayerIndex];
    if (activePlayer && activePlayer.isBot) {
      setTimeout(() => {
        const legal = RootLogic.getLegalActions(gameState, gameState.activePlayerIndex);
        if (legal.length > 0) {
          // Choose sensible legal action (prefer scoring / battle / move / advance)
          const choice = legal.find(a => a.type === 'BATTLE') ||
                         legal.find(a => a.type === 'MARQUISE_BUILD') ||
                         legal.find(a => a.type === 'ALLIANCE_SPREAD_SYMPATHY') ||
                         legal.find(a => a.type === 'MOVE') ||
                         legal.find(a => a.type === 'ADVANCE_PHASE') ||
                         legal[0];
          executeActionLocally(choice);
        }
      }, 700);
    }
  }

  // =========================================================================
  // 3. TABLETOP RENDERING (WOODLAND SVG BOARD)
  // =========================================================================
  function renderAll() {
    if (!gameState) return;
    renderTopHud();
    renderWoodlandSvgBoard();
    renderFactionDrawer();
    renderActionHub();
    renderHandAndDecks();
    if (gameState.status === 'FINISHED') {
      showVictoryModal();
    }
  }

  function renderTopHud() {
    const activePlayer = gameState.players[gameState.activePlayerIndex];
    const dot = document.getElementById('hud-faction-dot');
    const nameEl = document.getElementById('hud-active-faction-name');
    if (dot && activePlayer) dot.style.background = RootLogic.FACTIONS[activePlayer.faction].color;
    if (nameEl && activePlayer) nameEl.textContent = RootLogic.FACTIONS[activePlayer.faction].name[currentLang] || activePlayer.faction;

    // Stepper
    ['birdsong', 'daylight', 'evening'].forEach(p => {
      const step = document.getElementById(`phase-step-${p}`);
      if (step) {
        step.classList.toggle('active', gameState.phase.toLowerCase() === p);
      }
    });

    // Score Pills
    const pillsBar = document.getElementById('score-pills-bar');
    if (pillsBar) {
      pillsBar.innerHTML = '';
      gameState.players.forEach((p, idx) => {
        const pill = document.createElement('div');
        pill.className = `faction-score-pill ${idx === gameState.activePlayerIndex ? 'active-turn' : ''}`;
        pill.style.color = RootLogic.FACTIONS[p.faction].color;
        pill.innerHTML = `<span>${p.score}</span><span>VP</span>`;
        pillsBar.appendChild(pill);
      });
    }
  }

  function renderWoodlandSvgBoard() {
    const pathsLayer = document.getElementById('svg-paths-layer');
    const riverLayer = document.getElementById('svg-river-layer');
    const clearingsLayer = document.getElementById('svg-clearings-layer');
    const highlightsLayer = document.getElementById('svg-highlights-layer');
    const piecesLayer = document.getElementById('svg-pieces-layer');

    if (!pathsLayer || !clearingsLayer) return;

    // 1. Draw Paths & Rivers once
    if (pathsLayer.innerHTML === '') {
      let pathsSvg = '';
      PATH_CONNECTIONS.forEach(([from, to]) => {
        const p1 = CLEARING_POSITIONS[from];
        const p2 = CLEARING_POSITIONS[to];
        pathsSvg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" class="svg-path-line"/>`;
      });
      pathsLayer.innerHTML = pathsSvg;

      let riverSvg = '';
      RIVER_CONNECTIONS.forEach(([from, to]) => {
        const p1 = CLEARING_POSITIONS[from];
        const p2 = CLEARING_POSITIONS[to];
        riverSvg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" class="svg-river-line"/>`;
      });
      riverLayer.innerHTML = riverSvg;
    }

    // 2. Clearings & Highlights
    let clearingsSvg = '';
    let highlightsSvg = '';
    let piecesSvg = '';

    const legalActions = RootLogic.getLegalActions(gameState, mySeatIndex);
    const legalMoveDests = legalActions.filter(a => a.type === 'MOVE').map(a => a.to);
    const legalBattleClearings = legalActions.filter(a => a.type === 'BATTLE').map(a => a.clearingId);
    const legalBuildClearings = legalActions.filter(a => a.type.includes('BUILD') || a.type.includes('SYMPATHY')).map(a => a.clearingId);

    gameState.clearings.forEach(cl => {
      const pos = CLEARING_POSITIONS[cl.id];
      const ruler = RootLogic.getClearingRuler(cl);
      const rulerColor = ruler ? RootLogic.FACTIONS[ruler].color : '#7f8c8d';

      // Highlight Halo
      if (legalMoveDests.includes(cl.id)) {
        highlightsSvg += `<circle cx="${pos.x}" cy="${pos.y}" r="64" class="hl-halo-move"/>`;
      } else if (legalBattleClearings.includes(cl.id)) {
        highlightsSvg += `<circle cx="${pos.x}" cy="${pos.y}" r="64" class="hl-halo-battle"/>`;
      } else if (legalBuildClearings.includes(cl.id)) {
        highlightsSvg += `<circle cx="${pos.x}" cy="${pos.y}" r="64" class="hl-halo-build"/>`;
      }

      // Base Clearing Disc
      clearingsSvg += `
        <g class="svg-clearing-node" data-cl-id="${cl.id}" onclick="window.onClearingClicked(${cl.id})">
          <circle cx="${pos.x}" cy="${pos.y}" r="50" fill="#fcf9f0" stroke="${rulerColor}" stroke-width="4.5"/>
          <!-- Suit Badge -->
          <circle cx="${pos.x - 30}" cy="${pos.y - 30}" r="14" fill="#1b2631"/>
          <g transform="translate(${pos.x - 42}, ${pos.y - 42}) scale(0.75)">
            <use href="#root-${cl.suit}-suit"/>
          </g>
          <!-- Clearing ID Label -->
          <text x="${pos.x}" y="${pos.y - 24}" text-anchor="middle" font-size="12" font-weight="900" fill="#2c1b0d">#${cl.id}</text>
        </g>
      `;

      // Render Pieces in Clearing
      let pieceOffset = 0;
      // Marquise warriors
      if (cl.pieces.marquise > 0) {
        piecesSvg += `
          <g transform="translate(${pos.x - 32 + pieceOffset}, ${pos.y - 6}) scale(0.75)">
            <use href="#warrior-marquise"/>
            <circle cx="28" cy="12" r="7" fill="#d35400"/>
            <text x="28" y="15" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff">${cl.pieces.marquise}</text>
          </g>
        `;
        pieceOffset += 26;
      }
      // Eyrie warriors
      if (cl.pieces.eyrie > 0) {
        piecesSvg += `
          <g transform="translate(${pos.x - 32 + pieceOffset}, ${pos.y - 6}) scale(0.75)">
            <use href="#warrior-eyrie"/>
            <circle cx="28" cy="12" r="7" fill="#2980b9"/>
            <text x="28" y="15" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff">${cl.pieces.eyrie}</text>
          </g>
        `;
        pieceOffset += 26;
      }
      // Alliance warriors
      if (cl.pieces.alliance > 0) {
        piecesSvg += `
          <g transform="translate(${pos.x - 32 + pieceOffset}, ${pos.y - 6}) scale(0.75)">
            <use href="#warrior-alliance"/>
            <circle cx="28" cy="12" r="7" fill="#27ae60"/>
            <text x="28" y="15" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff">${cl.pieces.alliance}</text>
          </g>
        `;
        pieceOffset += 26;
      }
      // Vagabond pawn
      if (gameState.factionData.vagabond.currentLocation === cl.id && gameState.factionData.vagabond.locationType === 'clearing') {
        piecesSvg += `
          <g transform="translate(${pos.x - 32 + pieceOffset}, ${pos.y - 6}) scale(0.75)">
            <use href="#pawn-vagabond"/>
          </g>
        `;
      }
      // Buildings & Tokens
      let bOffset = 0;
      cl.pieces.buildings.forEach(b => {
        piecesSvg += `
          <g transform="translate(${pos.x - 24 + bOffset}, ${pos.y + 14}) scale(0.65)">
            <use href="#building-${b.type}"/>
          </g>
        `;
        bOffset += 20;
      });
      cl.pieces.tokens.forEach(t => {
        piecesSvg += `
          <g transform="translate(${pos.x - 24 + bOffset}, ${pos.y + 14}) scale(0.65)">
            <use href="#token-${t.type}"/>
          </g>
        `;
        bOffset += 20;
      });
      // Ruins
      if (cl.hasRuin) {
        piecesSvg += `
          <g transform="translate(${pos.x + 12}, ${pos.y - 42}) scale(0.65)">
            <use href="#ruin-marker"/>
          </g>
        `;
      }
    });

    clearingsLayer.innerHTML = clearingsSvg;
    highlightsLayer.innerHTML = highlightsSvg;
    piecesLayer.innerHTML = piecesSvg;
  }

  window.onClearingClicked = function (clearingId) {
    selectedClearingId = clearingId;
    RootSound.play('click');
    renderClearingInspector(clearingId);
  };

  // =========================================================================
  // 4. FACTION DASHBOARD & ACTION HUB
  // =========================================================================
  function renderFactionDrawer() {
    const container = document.getElementById('faction-board-content');
    if (!container || !gameState) return;

    const myFaction = gameState.players[mySeatIndex].faction;
    let html = '';

    if (myFaction === 'marquise') {
      const f = gameState.factionData.marquise;
      html = `
        <div class="faction-panel-card">
          <div class="f-title-bar" style="color:var(--faction-marquise)">🐱 Marquise de Cat Industry</div>
          <div class="track-row"><span>Wood in Supply:</span><span class="track-val">🪵 ${f.woodInSupply}</span></div>
          <div class="track-row"><span>Sawmills Left:</span><span class="track-val">${f.sawmillsRemaining} / 6</span></div>
          <div class="track-row"><span>Workshops Left:</span><span class="track-val">${f.workshopsRemaining} / 6</span></div>
          <div class="track-row"><span>Recruiters Left:</span><span class="track-val">${f.recruitersRemaining} / 6</span></div>
          <div class="track-row"><span>Actions Left:</span><span class="track-val">⚡ ${f.actionsRemaining}</span></div>
        </div>
      `;
    } else if (myFaction === 'eyrie') {
      const f = gameState.factionData.eyrie;
      html = `
        <div class="faction-panel-card">
          <div class="f-title-bar" style="color:var(--faction-eyrie)">🦅 Eyrie Decree & Roosts</div>
          <div class="track-row"><span>Leader:</span><span class="track-val">${f.leader.toUpperCase()}</span></div>
          <div class="track-row"><span>Roosts Remaining:</span><span class="track-val">${f.roostsRemaining} / 7</span></div>
          <div class="decree-grid">
            <div class="decree-col"><div class="decree-col-title">RECRUIT</div>${renderDecreeCards(f.decree.recruit)}</div>
            <div class="decree-col"><div class="decree-col-title">MOVE</div>${renderDecreeCards(f.decree.move)}</div>
            <div class="decree-col"><div class="decree-col-title">BATTLE</div>${renderDecreeCards(f.decree.battle)}</div>
            <div class="decree-col"><div class="decree-col-title">BUILD</div>${renderDecreeCards(f.decree.build)}</div>
          </div>
        </div>
      `;
    } else if (myFaction === 'alliance') {
      const f = gameState.factionData.alliance;
      html = `
        <div class="faction-panel-card">
          <div class="f-title-bar" style="color:var(--faction-alliance)">🐭 Woodland Alliance Insurgency</div>
          <div class="track-row"><span>Supporters:</span><span class="track-val">✊ ${f.supporters.length}</span></div>
          <div class="track-row"><span>Sympathy Tokens:</span><span class="track-val">${10 - f.sympathyRemaining} placed</span></div>
          <div class="track-row"><span>Officers:</span><span class="track-val">🎖️ ${f.officers}</span></div>
        </div>
      `;
    } else if (myFaction === 'vagabond') {
      const f = gameState.factionData.vagabond;
      html = `
        <div class="faction-panel-card">
          <div class="f-title-bar" style="color:var(--faction-vagabond)">🦝 Vagabond Satchel</div>
          <div class="track-row"><span>Character:</span><span class="track-val">${f.character.toUpperCase()}</span></div>
          <div class="vagabond-items-grid">
            ${f.items.map(item => `
              <div class="item-slot-badge ${item.state}">
                <div>${getItemIcon(item.type)}</div>
                <span>${item.type}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
  }

  function renderDecreeCards(cards) {
    if (!cards || cards.length === 0) return '<span style="font-size:0.6rem;color:#64748b;">(Empty)</span>';
    return cards.map(c => `<span class="decree-card-pill ${c.suit}">${c.suit}</span>`).join('');
  }

  function getItemIcon(type) {
    const icons = { boot: '👢', sword: '⚔️', torch: '🔥', crossbow: '🏹', hammer: '🔨', tea: '🍵', coins: '🪙', bag: '🎒' };
    return icons[type] || '📦';
  }

  function renderClearingInspector(clearingId) {
    const cl = gameState.clearings.find(c => c.id === clearingId);
    const titleEl = document.getElementById('inspector-cl-name');
    const badgeEl = document.getElementById('inspector-cl-suit');
    const bodyEl = document.getElementById('inspector-cl-body');
    if (!cl || !titleEl || !bodyEl) return;

    titleEl.textContent = `Clearing #${cl.id} (${cl.suit.toUpperCase()})`;
    if (badgeEl) badgeEl.textContent = cl.suit;

    const ruler = RootLogic.getClearingRuler(cl);
    const rulerName = ruler ? RootLogic.FACTIONS[ruler].name[currentLang] : 'Uncontested';

    bodyEl.innerHTML = `
      <div class="track-row"><span>Ruler:</span><span class="track-val">${rulerName}</span></div>
      <div class="track-row"><span>Building Slots:</span><span class="track-val">${cl.pieces.buildings.length} / ${cl.maxSlots}</span></div>
      <div class="track-row"><span>Marquise Warriors:</span><span class="track-val">${cl.pieces.marquise || 0}</span></div>
      <div class="track-row"><span>Eyrie Warriors:</span><span class="track-val">${cl.pieces.eyrie || 0}</span></div>
      <div class="track-row"><span>Alliance Warriors:</span><span class="track-val">${cl.pieces.alliance || 0}</span></div>
    `;
  }

  function renderActionHub() {
    const list = document.getElementById('commands-list');
    if (!list || !gameState) return;

    const actions = RootLogic.getLegalActions(gameState, mySeatIndex);
    list.innerHTML = '';

    if (actions.length === 0) {
      list.innerHTML = '<p class="empty-hint">No legal actions pending. Wait for your turn.</p>';
      return;
    }

    actions.forEach(action => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-legal-action';
      btn.innerHTML = `<span>${action.text || action.type}</span> <span>➔</span>`;
      btn.addEventListener('click', () => {
        sendIntent(action);
      });
      list.appendChild(btn);
    });

    // Render Action Log
    const logBox = document.getElementById('match-log-entries');
    if (logBox && gameState.actionLog) {
      logBox.innerHTML = gameState.actionLog.slice(-12).reverse().map(e => `
        <div class="log-entry">${e.text}</div>
      `).join('');
    }
  }

  function renderHandAndDecks() {
    const handRow = document.getElementById('player-hand-row');
    const drawCountEl = document.getElementById('draw-deck-count');
    const discardCountEl = document.getElementById('discard-deck-count');

    if (drawCountEl) drawCountEl.textContent = gameState.deck.length;
    if (discardCountEl) discardCountEl.textContent = gameState.discardPile.length;

    if (!handRow || !gameState) return;
    const myHand = gameState.players[mySeatIndex].hand || [];
    handRow.innerHTML = '';

    myHand.forEach((card, idx) => {
      const cardEl = document.createElement('div');
      cardEl.className = `root-card ${card.suit}`;
      cardEl.innerHTML = `
        <div class="card-title-row">
          <span class="card-name">${card.name}</span>
          <span class="card-suit-badge">${card.suit}</span>
        </div>
        <p class="card-desc">${card.desc || (card.item ? 'Craft item: ' + card.item : '+' + (card.vp || 0) + ' VP')}</p>
        <div class="card-craft-bar">
          <span>Cost: ${card.craftCost ? card.craftCost.join(', ') : 'None'}</span>
          <span>${card.vp ? '+' + card.vp + ' VP' : ''}</span>
        </div>
      `;
      handRow.appendChild(cardEl);
    });
  }

  // =========================================================================
  // 5. COMBAT & VICTORY MODALS
  // =========================================================================
  function showCombatResult(res) {
    const modal = document.getElementById('modal-combat');
    const body = document.getElementById('combat-modal-body');
    if (!modal || !body) return;

    body.innerHTML = `
      <div class="combat-dice-stage">
        <div>
          <div style="font-size:0.8rem;text-align:center;margin-bottom:4px;">Attacker (${res.attackerFaction})</div>
          <div class="die-box">${res.dice[0]}</div>
        </div>
        <div>
          <div style="font-size:0.8rem;text-align:center;margin-bottom:4px;">Defender (${res.defenderFaction})</div>
          <div class="die-box">${res.dice[1]}</div>
        </div>
      </div>
      <div style="text-align:center;font-weight:700;margin-top:12px;">
        ${res.attackerHits} hit(s) dealt to Defender &bull; ${res.defenderHits} hit(s) dealt to Attacker
      </div>
    `;

    modal.classList.add('active');
  }

  function showVictoryModal() {
    const modal = document.getElementById('modal-victory');
    const title = document.getElementById('victory-title');
    const desc = document.getElementById('victory-desc');
    if (!modal || !gameState) return;

    if (title) title.textContent = `${RootLogic.FACTIONS[gameState.winner].name[currentLang]} Wins!`;
    if (desc) desc.textContent = `Achieved victory via ${gameState.victoryType}.`;

    if (typeof RubikUserCache !== 'undefined') {
      const isMyWin = gameState.winner === gameState.players[mySeatIndex].faction;
      RubikUserCache.recordMatchResult('root', isMyWin, { faction: gameState.winner });
    }

    RootSound.play('victory');
    modal.classList.add('active');
  }

  // =========================================================================
  // 6. PAN & ZOOM BOARD INTERACTION
  // =========================================================================
  function setupPanZoom() {
    const viewport = document.getElementById('board-viewport');
    const layer = document.getElementById('board-canvas-layer');
    if (!viewport || !layer) return;

    viewport.addEventListener('mousedown', (e) => {
      if (e.target.closest('.board-floating-toolbar') || e.target.closest('.highlights-legend')) return;
      panZoom.isPanning = true;
      panZoom.startX = e.clientX - panZoom.x;
      panZoom.startY = e.clientY - panZoom.y;
    });

    window.addEventListener('mousemove', (e) => {
      if (!panZoom.isPanning) return;
      panZoom.x = e.clientX - panZoom.startX;
      panZoom.y = e.clientY - panZoom.startY;
      updateTransform();
    });

    window.addEventListener('mouseup', () => {
      panZoom.isPanning = false;
    });

    viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      panZoom.scale = Math.min(Math.max(panZoom.scale * zoomFactor, 0.6), 2.5);
      updateTransform();
    }, { passive: false });

    document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
      panZoom.scale = Math.min(panZoom.scale * 1.2, 2.5);
      updateTransform();
    });
    document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
      panZoom.scale = Math.max(panZoom.scale / 1.2, 0.6);
      updateTransform();
    });
    document.getElementById('btn-zoom-reset')?.addEventListener('click', () => {
      panZoom.x = 0;
      panZoom.y = 0;
      panZoom.scale = 1;
      updateTransform();
    });
  }

  function updateTransform() {
    const layer = document.getElementById('board-canvas-layer');
    if (layer) {
      layer.style.transform = `translate(${panZoom.x}px, ${panZoom.y}px) scale(${panZoom.scale})`;
    }
  }

  function setupDomListeners() {
    document.getElementById('btn-toggle-sound')?.addEventListener('click', () => {
      const on = RootSound.toggleSound();
      const btn = document.getElementById('btn-toggle-sound');
      if (btn) btn.textContent = on ? '🔊' : '🔇';
    });

    document.getElementById('btn-toggle-lang')?.addEventListener('click', () => {
      applyLanguage(currentLang === 'fa' ? 'en' : 'fa');
    });

    document.getElementById('btn-open-rules')?.addEventListener('click', openRulesModal);
    document.getElementById('btn-open-lobby')?.addEventListener('click', openLobbyModal);

    document.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', closeAllModals);
    });

    document.getElementById('btn-start-offline')?.addEventListener('click', () => {
      startOfflineMatch();
    });

    document.getElementById('btn-rematch')?.addEventListener('click', () => {
      closeAllModals();
      startOfflineMatch();
    });
  }

  function applyLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.body.dir = lang === 'fa' ? 'rtl' : 'ltr';
    try { localStorage.setItem('rubik_card_lang', lang); } catch (e) {}
  }

  function openRulesModal() {
    const modal = document.getElementById('modal-rules');
    const body = document.getElementById('rules-modal-body');
    if (!modal || !body) return;
    body.innerHTML = `
      <h3>${currentLang === 'fa' ? 'قوانین و راهنمای روت' : 'Law of Root Guide'}</h3>
      <p>${currentLang === 'fa' ? 'هدف بازی رسیدن به ۳۰ امتیاز پیروزی است. چهار جناح به صورت کاملاً نامتقارن بازی می‌کنند: مارکی دو کت با صنایع چوب، پرندگان با احکام و فرمانروایی، اتحاد جنگل با شورش و هواداران، و راکون با ماجراجویی و آیتم‌ها.' : 'Race to 30 Victory Points across 4 asymmetric factions: Marquise de Cat industry, Eyrie Dynasties programmed decree, Woodland Alliance insurgency, and Vagabond quests.'}</p>
    `;
    modal.classList.add('active');
  }

  function openLobbyModal() {
    const modal = document.getElementById('modal-lobby');
    if (modal) modal.classList.add('active');
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
