/**
 * Catan (کاتان / مهاجران کاتان) - Core Game Logic & AI Engine
 * Pure JavaScript, works seamlessly in Node.js and Browser environments.
 * Standard Official Rules (mipel.ir / catan.com):
 * - 19 Hexagonal Island (Forest, Hills, Pasture, Fields, Mountains, Desert)
 * - 54 Vertices (Settlements = 1 VP, Cities = 2 VP) with 2-road Distance Rule
 * - 72 Edges (Roads)
 * - 9 Coastal Ports (4 Generic 3:1, 5 Specific 2:1)
 * - 25 Development Cards (Knights, Road Building, Year of Plenty, Monopoly, Victory Points)
 * - Longest Road (2 VP) & Largest Army (2 VP)
 * - Dice Roll (2d6), Robber on 7, Discard on >7 cards, Resource production & trading
 * - Victory condition: 10 Victory Points on active turn
 */

(function (exports) {
  'use strict';

  // =========================================================================
  // 1. CONSTANTS & DEFINITIONS
  // =========================================================================
  const TERRAINS = {
    FOREST: 'forest',      // Lumber / Wood (چوب 🪵)
    HILLS: 'hills',        // Brick / Clay (آجر 🧱)
    PASTURE: 'pasture',    // Wool / Sheep (گوسفند 🐑)
    FIELDS: 'fields',      // Grain / Wheat (گندم 🌾)
    MOUNTAINS: 'mountains',// Ore / Rock (سنگ 🪨)
    DESERT: 'desert'       // No resource (بیابان 🏜️)
  };

  const RESOURCES = {
    LUMBER: 'lumber',
    BRICK: 'brick',
    WOOL: 'wool',
    GRAIN: 'grain',
    ORE: 'ore'
  };

  const TERRAIN_TO_RESOURCE = {
    [TERRAINS.FOREST]: RESOURCES.LUMBER,
    [TERRAINS.HILLS]: RESOURCES.BRICK,
    [TERRAINS.PASTURE]: RESOURCES.WOOL,
    [TERRAINS.FIELDS]: RESOURCES.GRAIN,
    [TERRAINS.MOUNTAINS]: RESOURCES.ORE,
    [TERRAINS.DESERT]: null
  };

  const COSTS = {
    ROAD: { [RESOURCES.LUMBER]: 1, [RESOURCES.BRICK]: 1 },
    SETTLEMENT: { [RESOURCES.LUMBER]: 1, [RESOURCES.BRICK]: 1, [RESOURCES.WOOL]: 1, [RESOURCES.GRAIN]: 1 },
    CITY: { [RESOURCES.GRAIN]: 2, [RESOURCES.ORE]: 3 },
    DEV_CARD: { [RESOURCES.WOOL]: 1, [RESOURCES.GRAIN]: 1, [RESOURCES.ORE]: 1 }
  };

  const DEV_CARD_TYPES = {
    KNIGHT: 'knight',
    ROAD_BUILDING: 'road_building',
    YEAR_OF_PLENTY: 'year_of_plenty',
    MONOPOLY: 'monopoly',
    VICTORY_POINT: 'victory_point'
  };

  const PLAYER_COLORS = [
    { id: 'red', hex: '#ef4444', light: '#f87171', nameFa: 'قرمز', nameEn: 'Red' },
    { id: 'blue', hex: '#3b82f6', light: '#60a5fa', nameFa: 'آبی', nameEn: 'Blue' },
    { id: 'orange', hex: '#f97316', light: '#fb923c', nameFa: 'نارنجی', nameEn: 'Orange' },
    { id: 'green', hex: '#22c55e', light: '#4ade80', nameFa: 'سبز', nameEn: 'Green' }
  ];

  // Dice number to pips (probability dots)
  const NUMBER_PIPS = {
    2: 1, 3: 2, 4: 3, 5: 4, 6: 5,
    8: 5, 9: 4, 10: 3, 11: 2, 12: 1
  };

  // =========================================================================
  // 2. GEOMETRY GENERATOR (19 Hexes, 54 Vertices, 72 Edges)
  // =========================================================================
  const HEX_RADIUS = 55;
  const HEX_WIDTH = Math.sqrt(3) * HEX_RADIUS;
  const VERT_DIST = 1.5 * HEX_RADIUS;

  const HEX_ROW_CONFIG = [
    { row: 0, count: 3, offset: 1 },
    { row: 1, count: 4, offset: 0.5 },
    { row: 2, count: 5, offset: 0 },
    { row: 3, count: 4, offset: 0.5 },
    { row: 4, count: 3, offset: 1 }
  ];

  function buildBoardGeometry() {
    const hexes = [];
    let hexId = 0;

    for (const rConf of HEX_ROW_CONFIG) {
      const cy = 240 + (rConf.row - 2) * VERT_DIST;
      for (let i = 0; i < rConf.count; i++) {
        const cx = 270 + (i + rConf.offset - 2.5) * HEX_WIDTH;
        hexes.push({
          id: hexId++,
          row: rConf.row,
          col: i,
          x: Math.round(cx * 10) / 10,
          y: Math.round(cy * 10) / 10,
          vertexIds: [],
          edgeIds: []
        });
      }
    }

    const vertices = [];
    function findOrCreateVertex(vx, vy) {
      for (const v of vertices) {
        const distSq = (v.x - vx) ** 2 + (v.y - vy) ** 2;
        if (distSq < 16) {
          return v;
        }
      }
      const newV = {
        id: vertices.length,
        x: Math.round(vx * 10) / 10,
        y: Math.round(vy * 10) / 10,
        hexIds: [],
        neighborVertexIds: [],
        edgeIds: [],
        port: null
      };
      vertices.push(newV);
      return newV;
    }

    const edges = [];
    function findOrCreateEdge(v1, v2) {
      const minV = Math.min(v1, v2);
      const maxV = Math.max(v1, v2);
      for (const e of edges) {
        if (e.v1 === minV && e.v2 === maxV) return e;
      }
      const newE = {
        id: edges.length,
        v1: minV,
        v2: maxV,
        hexIds: [],
        neighborEdgeIds: []
      };
      edges.push(newE);
      return newE;
    }

    for (const h of hexes) {
      const corners = [];
      for (let a = 0; a < 6; a++) {
        const angleRad = (Math.PI / 180) * (30 + a * 60);
        const vx = h.x + HEX_RADIUS * Math.cos(angleRad);
        const vy = h.y + HEX_RADIUS * Math.sin(angleRad);
        const vObj = findOrCreateVertex(vx, vy);
        if (!vObj.hexIds.includes(h.id)) vObj.hexIds.push(h.id);
        corners.push(vObj.id);
      }
      h.vertexIds = corners;

      for (let a = 0; a < 6; a++) {
        const v1 = corners[a];
        const v2 = corners[(a + 1) % 6];
        const eObj = findOrCreateEdge(v1, v2);
        if (!eObj.hexIds.includes(h.id)) eObj.hexIds.push(h.id);
        h.edgeIds.push(eObj.id);

        const v1Obj = vertices[v1];
        const v2Obj = vertices[v2];
        if (v1Obj && !v1Obj.neighborVertexIds.includes(v2)) v1Obj.neighborVertexIds.push(v2);
        if (v2Obj && !v2Obj.neighborVertexIds.includes(v1)) v2Obj.neighborVertexIds.push(v1);
        if (v1Obj && !v1Obj.edgeIds.includes(eObj.id)) v1Obj.edgeIds.push(eObj.id);
        if (v2Obj && !v2Obj.edgeIds.includes(eObj.id)) v2Obj.edgeIds.push(eObj.id);
      }
    }

    // Compute edge neighbor edges
    for (const e of edges) {
      const v1Obj = vertices[e.v1];
      const v2Obj = vertices[e.v2];
      const neighbors = new Set();
      if (v1Obj) v1Obj.edgeIds.forEach(id => { if (id !== e.id) neighbors.add(id); });
      if (v2Obj) v2Obj.edgeIds.forEach(id => { if (id !== e.id) neighbors.add(id); });
      e.neighborEdgeIds = Array.from(neighbors);
    }

    assignPorts(vertices);

    return { hexes, vertices, edges };
  }

  function assignPorts(vertices) {
    // 9 Ports around the island:
    // 4 Generic 3:1 ('generic'), 5 specific 2:1 ('lumber', 'brick', 'wool', 'grain', 'ore')
    const portDefs = [
      { type: 'generic', ratio: 3 },
      { type: RESOURCES.GRAIN, ratio: 2 },
      { type: RESOURCES.ORE, ratio: 2 },
      { type: 'generic', ratio: 3 },
      { type: RESOURCES.WOOL, ratio: 2 },
      { type: 'generic', ratio: 3 },
      { type: RESOURCES.BRICK, ratio: 2 },
      { type: RESOURCES.LUMBER, ratio: 2 },
      { type: 'generic', ratio: 3 }
    ];

    // Find perimeter edges (edges belonging to only 1 hex)
    const perimeterVertices = vertices.filter(v => v.hexIds.length === 1 || v.hexIds.length === 2);
    // Sort perimeter vertices by angle around board center (270, 240)
    perimeterVertices.sort((a, b) => Math.atan2(a.y - 240, a.x - 270) - Math.atan2(b.y - 240, b.x - 270));

    // Assign 9 port pairs spaced evenly around perimeter
    const total = perimeterVertices.length;
    for (let p = 0; p < 9; p++) {
      const idx = Math.floor((p / 9) * total);
      const v1 = perimeterVertices[idx];
      // Neighbor on perimeter
      const v2Id = v1.neighborVertexIds.find(nid => {
        const nv = vertices[nid];
        return nv && (nv.hexIds.length === 1 || nv.hexIds.length === 2) && !nv.port;
      });
      v1.port = portDefs[p];
      if (v2Id !== undefined && vertices[v2Id]) {
        vertices[v2Id].port = portDefs[p];
      }
    }
  }

  // Pre-generated static board geometry
  const BOARD_GRAPH = buildBoardGeometry();

  // =========================================================================
  // 3. INITIAL STATE & BOARD SETUP
  // =========================================================================
  function createDevCardDeck() {
    const deck = [];
    for (let i = 0; i < 14; i++) deck.push(DEV_CARD_TYPES.KNIGHT);
    for (let i = 0; i < 5; i++) deck.push(DEV_CARD_TYPES.VICTORY_POINT);
    for (let i = 0; i < 2; i++) deck.push(DEV_CARD_TYPES.ROAD_BUILDING);
    for (let i = 0; i < 2; i++) deck.push(DEV_CARD_TYPES.YEAR_OF_PLENTY);
    for (let i = 0; i < 2; i++) deck.push(DEV_CARD_TYPES.MONOPOLY);

    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = deck[i];
      deck[i] = deck[j];
      deck[j] = temp;
    }
    return deck;
  }

  function generateHexTiles(randomize = true) {
    const terrainBag = [
      TERRAINS.FOREST, TERRAINS.FOREST, TERRAINS.FOREST, TERRAINS.FOREST,
      TERRAINS.HILLS, TERRAINS.HILLS, TERRAINS.HILLS,
      TERRAINS.PASTURE, TERRAINS.PASTURE, TERRAINS.PASTURE, TERRAINS.PASTURE,
      TERRAINS.FIELDS, TERRAINS.FIELDS, TERRAINS.FIELDS, TERRAINS.FIELDS,
      TERRAINS.MOUNTAINS, TERRAINS.MOUNTAINS, TERRAINS.MOUNTAINS,
      TERRAINS.DESERT
    ];

    const numberTokens = [5, 2, 6, 3, 8, 10, 9, 12, 11, 4, 8, 10, 9, 4, 5, 6, 3, 11];

    if (randomize) {
      // Shuffle terrains
      for (let i = terrainBag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = terrainBag[i];
        terrainBag[i] = terrainBag[j];
        terrainBag[j] = temp;
      }
      // Shuffle numbers
      for (let i = numberTokens.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = numberTokens[i];
        numberTokens[i] = numberTokens[j];
        numberTokens[j] = temp;
      }
    }

    let numIdx = 0;
    const tiles = [];
    let desertHexId = 0;

    for (let i = 0; i < 19; i++) {
      const terrain = terrainBag[i];
      const isDesert = terrain === TERRAINS.DESERT;
      const number = isDesert ? null : numberTokens[numIdx++];
      if (isDesert) desertHexId = i;

      tiles.push({
        id: i,
        terrain,
        resource: TERRAIN_TO_RESOURCE[terrain],
        number,
        pips: number ? NUMBER_PIPS[number] : 0,
        hasRobber: isDesert
      });
    }

    return { tiles, robberHexId: desertHexId };
  }

  function createInitialState(playerCount = 3, playerNames = null) {
    const count = Math.max(2, Math.min(4, parseInt(playerCount, 10) || 3));
    const { tiles, robberHexId } = generateHexTiles(true);

    const players = [];
    for (let i = 0; i < count; i++) {
      const pColor = PLAYER_COLORS[i];
      const pName = (playerNames && playerNames[i]) || `Player ${i + 1}`;
      players.push({
        id: i,
        name: pName,
        color: pColor.id,
        colorHex: pColor.hex,
        colorLight: pColor.light,
        resources: {
          [RESOURCES.LUMBER]: 0,
          [RESOURCES.BRICK]: 0,
          [RESOURCES.WOOL]: 0,
          [RESOURCES.GRAIN]: 0,
          [RESOURCES.ORE]: 0
        },
        devCards: [],
        playedKnights: 0,
        victoryPoints: 0,
        settlementsLeft: 5,
        citiesLeft: 4,
        roadsLeft: 15,
        longestRoadLength: 0,
        hasLongestRoad: false,
        hasLargestArmy: false
      });
    }

    // Vertices and Edges state
    // vertexOwners[vId] = { player: 0..N-1, type: 'settlement'|'city' } or null
    const vertices = Array.from({ length: 54 }, () => null);
    // edgeOwners[eId] = player: 0..N-1 or null
    const edges = Array.from({ length: 72 }, () => null);

    // Setup placement sequence:
    // Round 1: 0, 1, ..., count-1
    // Round 2: count-1, count-2, ..., 0
    const setupOrder = [];
    for (let i = 0; i < count; i++) setupOrder.push(i);
    for (let i = count - 1; i >= 0; i--) setupOrder.push(i);

    return {
      playerCount: count,
      players,
      tiles,
      robberHexId,
      vertices,
      edges,
      devCardDeck: createDevCardDeck(),
      phase: 'SETUP_SETTLEMENT', // 'SETUP_SETTLEMENT', 'SETUP_ROAD', 'ROLL_DICE', 'ROBBER_DISCARD', 'ROBBER_MOVE', 'ROBBER_STEAL', 'PLAYING_TURN', 'FINISHED'
      setupOrder,
      setupIndex: 0,
      activePlayer: 0,
      lastDice: null,
      lastDiceSum: null,
      turnCount: 0,
      discardQueue: [], // Players needing to discard on 7
      stealCandidates: [], // Players adjacent to new robber hex
      devCardPlayedThisTurn: false,
      longestRoadPlayer: null,
      largestArmyPlayer: null,
      winner: null,
      tradeOffer: null, // Active trading offer { fromPlayer, give, receive, acceptedBy: [] }
      log: []
    };
  }

  // =========================================================================
  // 4. VALIDATION & RULES ENGINE
  // =========================================================================

  /**
   * Distance rule: No settlement can be built within 1 edge of another building.
   */
  function isDistanceRuleSatisfied(state, vertexId) {
    if (state.vertices[vertexId] !== null) return false;
    const vObj = BOARD_GRAPH.vertices[vertexId];
    if (!vObj) return false;

    for (const neighborId of vObj.neighborVertexIds) {
      if (state.vertices[neighborId] !== null) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if a player can build a settlement at vertexId.
   */
  function canBuildSettlement(state, playerId, vertexId, isSetup = false) {
    if (!isDistanceRuleSatisfied(state, vertexId)) return false;
    const player = state.players[playerId];
    if (player.settlementsLeft <= 0) return false;

    if (isSetup) {
      return true;
    }

    // Must have resources: 1 Wood, 1 Brick, 1 Sheep, 1 Wheat
    if (!hasResources(player, COSTS.SETTLEMENT)) return false;

    // Must connect to player's road network
    const vObj = BOARD_GRAPH.vertices[vertexId];
    const connectsToRoad = vObj.edgeIds.some(eId => state.edges[eId] === playerId);
    return connectsToRoad;
  }

  /**
   * Check if player can build a road at edgeId.
   */
  function canBuildRoad(state, playerId, edgeId, isSetup = false, setupSettlementVertex = null) {
    if (state.edges[edgeId] !== null) return false;
    const player = state.players[playerId];
    if (player.roadsLeft <= 0) return false;

    const eObj = BOARD_GRAPH.edges[edgeId];
    if (!eObj) return false;

    if (isSetup) {
      // Must connect to the settlement just placed in setup
      if (setupSettlementVertex !== null) {
        return eObj.v1 === setupSettlementVertex || eObj.v2 === setupSettlementVertex;
      }
      return true;
    }

    // Resource check: 1 Wood, 1 Brick
    if (!hasResources(player, COSTS.ROAD)) return false;

    // Connectivity: must touch player's settlement/city or existing road
    const touchesBuilding = (state.vertices[eObj.v1] && state.vertices[eObj.v1].player === playerId) ||
                            (state.vertices[eObj.v2] && state.vertices[eObj.v2].player === playerId);
    if (touchesBuilding) return true;

    // Touches player's road (unless blocked by opponent settlement/city on that vertex)
    const touchesOwnRoad = eObj.neighborEdgeIds.some(nEdgeId => {
      if (state.edges[nEdgeId] !== playerId) return false;
      // Find the vertex between eObj and nEdge
      const nObj = BOARD_GRAPH.edges[nEdgeId];
      const sharedVertex = (eObj.v1 === nObj.v1 || eObj.v1 === nObj.v2) ? eObj.v1 :
                           (eObj.v2 === nObj.v1 || eObj.v2 === nObj.v2) ? eObj.v2 : null;
      if (sharedVertex !== null && state.vertices[sharedVertex] !== null) {
        // If an opponent owns the vertex, road cannot pass through
        if (state.vertices[sharedVertex].player !== playerId) return false;
      }
      return true;
    });

    return touchesOwnRoad;
  }

  /**
   * Check if player can upgrade an existing settlement to city.
   */
  function canBuildCity(state, playerId, vertexId) {
    const spot = state.vertices[vertexId];
    if (!spot || spot.player !== playerId || spot.type !== 'settlement') return false;
    const player = state.players[playerId];
    if (player.citiesLeft <= 0) return false;
    return hasResources(player, COSTS.CITY);
  }

  /**
   * Check if player can buy development card.
   */
  function canBuyDevCard(state, playerId) {
    if (state.devCardDeck.length === 0) return false;
    const player = state.players[playerId];
    return hasResources(player, COSTS.DEV_CARD);
  }

  function hasResources(player, cost) {
    for (const [res, count] of Object.entries(cost)) {
      if ((player.resources[res] || 0) < count) return false;
    }
    return true;
  }

  function deductResources(player, cost) {
    for (const [res, count] of Object.entries(cost)) {
      player.resources[res] -= count;
    }
  }

  function addResources(player, amount) {
    for (const [res, count] of Object.entries(amount)) {
      player.resources[res] = (player.resources[res] || 0) + count;
    }
  }

  function countTotalResources(player) {
    return Object.values(player.resources).reduce((sum, v) => sum + v, 0);
  }

  // =========================================================================
  // 5. GAME ACTIONS & STATE MUTATIONS
  // =========================================================================

  /**
   * Build settlement action.
   */
  function buildSettlement(state, playerId, vertexId) {
    const isSetup = state.phase === 'SETUP_SETTLEMENT';
    if (!canBuildSettlement(state, playerId, vertexId, isSetup)) {
      return { valid: false, message: 'Invalid settlement placement' };
    }

    const player = state.players[playerId];
    if (!isSetup) {
      deductResources(player, COSTS.SETTLEMENT);
    }

    state.vertices[vertexId] = { player: playerId, type: 'settlement' };
    player.settlementsLeft--;
    recalculateVictoryPoints(state);

    if (isSetup) {
      state.lastSetupSettlementVertex = vertexId;
      state.phase = 'SETUP_ROAD';
    }

    checkLongestRoad(state);
    return { valid: true };
  }

  /**
   * Build road action.
   */
  function buildRoad(state, playerId, edgeId, isFree = false) {
    const isSetup = state.phase === 'SETUP_ROAD';
    const setupV = isSetup ? state.lastSetupSettlementVertex : null;

    if (!canBuildRoad(state, playerId, edgeId, isSetup, setupV)) {
      return { valid: false, message: 'Invalid road placement' };
    }

    const player = state.players[playerId];
    if (!isSetup && !isFree) {
      deductResources(player, COSTS.ROAD);
    }

    state.edges[edgeId] = playerId;
    player.roadsLeft--;

    if (isSetup) {
      state.setupIndex++;
      if (state.setupIndex < state.setupOrder.length) {
        state.activePlayer = state.setupOrder[state.setupIndex];
        state.phase = 'SETUP_SETTLEMENT';
      } else {
        // Setup finished! Start regular play round with player 0
        state.activePlayer = 0;
        state.phase = 'ROLL_DICE';
      }
    }

    checkLongestRoad(state);
    return { valid: true };
  }

  /**
   * Upgrade settlement to city.
   */
  function buildCity(state, playerId, vertexId) {
    if (!canBuildCity(state, playerId, vertexId)) {
      return { valid: false, message: 'Cannot build city' };
    }

    const player = state.players[playerId];
    deductResources(player, COSTS.CITY);

    state.vertices[vertexId].type = 'city';
    player.settlementsLeft++;
    player.citiesLeft--;

    recalculateVictoryPoints(state);
    return { valid: true };
  }

  /**
   * Buy development card.
   */
  function buyDevCard(state, playerId) {
    if (!canBuyDevCard(state, playerId)) {
      return { valid: false, message: 'Cannot buy development card' };
    }

    const player = state.players[playerId];
    deductResources(player, COSTS.DEV_CARD);

    const card = state.devCardDeck.pop();
    player.devCards.push({
      type: card,
      turnBought: state.turnCount || 0,
      played: false
    });

    recalculateVictoryPoints(state);
    return { valid: true, card };
  }

  /**
   * Roll Dice (2d6).
   */
  function rollDice(state) {
    if (state.phase !== 'ROLL_DICE') {
      return { valid: false, message: 'Not roll dice phase' };
    }

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const sum = d1 + d2;

    state.lastDice = [d1, d2];
    state.lastDiceSum = sum;

    if (sum === 7) {
      // Robber rolled! Check if players have > 7 resources and need to discard half
      const discardQueue = [];
      for (const p of state.players) {
        const total = countTotalResources(p);
        if (total > 7) {
          const mustDiscard = Math.floor(total / 2);
          discardQueue.push({ playerId: p.id, count: mustDiscard });
        }
      }

      state.discardQueue = discardQueue;
      if (discardQueue.length > 0) {
        state.phase = 'ROBBER_DISCARD';
      } else {
        state.phase = 'ROBBER_MOVE';
      }

      return { valid: true, dice: [d1, d2], sum, isSeven: true };
    }

    // Produce resources
    const production = distributeResourcesForRoll(state, sum);
    state.phase = 'PLAYING_TURN';

    return { valid: true, dice: [d1, d2], sum, production };
  }

  /**
   * Distribute resources when non-7 number is rolled.
   */
  function distributeResourcesForRoll(state, number) {
    const collected = {};
    for (const p of state.players) collected[p.id] = {};

    for (const tile of state.tiles) {
      if (tile.number === number && !tile.hasRobber && tile.resource) {
        const hexObj = BOARD_GRAPH.hexes[tile.id];
        for (const vId of hexObj.vertexIds) {
          const building = state.vertices[vId];
          if (building !== null) {
            const player = state.players[building.player];
            const amount = building.type === 'city' ? 2 : 1;
            player.resources[tile.resource] = (player.resources[tile.resource] || 0) + amount;
            collected[player.id][tile.resource] = (collected[player.id][tile.resource] || 0) + amount;
          }
        }
      }
    }
    return collected;
  }

  /**
   * Move Robber to new hex and identify steal targets.
   */
  function moveRobber(state, playerId, targetHexId) {
    if (state.phase !== 'ROBBER_MOVE') {
      return { valid: false, message: 'Not robber move phase' };
    }
    if (targetHexId < 0 || targetHexId >= 19 || targetHexId === state.robberHexId) {
      return { valid: false, message: 'Must move robber to a different hex' };
    }

    // Update robber position
    state.tiles[state.robberHexId].hasRobber = false;
    state.tiles[targetHexId].hasRobber = true;
    state.robberHexId = targetHexId;

    // Find opponents with settlements/cities touching targetHexId who have at least 1 resource card
    const hexObj = BOARD_GRAPH.hexes[targetHexId];
    const candidateSet = new Set();
    for (const vId of hexObj.vertexIds) {
      const b = state.vertices[vId];
      if (b && b.player !== playerId) {
        if (countTotalResources(state.players[b.player]) > 0) {
          candidateSet.add(b.player);
        }
      }
    }

    const stealCandidates = Array.from(candidateSet);
    if (stealCandidates.length === 0) {
      // Nobody to steal from
      state.phase = 'PLAYING_TURN';
      return { valid: true, targetHexId, canSteal: false };
    }

    state.stealCandidates = stealCandidates;
    state.phase = 'ROBBER_STEAL';
    return { valid: true, targetHexId, canSteal: true, candidates: stealCandidates };
  }

  /**
   * Steal a random resource from target player.
   */
  function stealResource(state, thiefId, victimId) {
    if (state.phase !== 'ROBBER_STEAL') {
      return { valid: false, message: 'Not steal phase' };
    }
    if (!state.stealCandidates.includes(victimId)) {
      return { valid: false, message: 'Invalid steal victim' };
    }

    const victim = state.players[victimId];
    const thief = state.players[thiefId];

    // Pick a random card from victim's hand
    const cardPool = [];
    for (const [res, count] of Object.entries(victim.resources)) {
      for (let i = 0; i < count; i++) cardPool.push(res);
    }

    if (cardPool.length === 0) {
      state.phase = 'PLAYING_TURN';
      return { valid: true, stolen: null };
    }

    const stolen = cardPool[Math.floor(Math.random() * cardPool.length)];
    victim.resources[stolen]--;
    thief.resources[stolen] = (thief.resources[stolen] || 0) + 1;

    state.phase = 'PLAYING_TURN';
    return { valid: true, stolen, victimId };
  }

  /**
   * Discard cards when 7 is rolled.
   */
  function discardCards(state, playerId, discardedResources) {
    if (state.phase !== 'ROBBER_DISCARD') {
      return { valid: false, message: 'Not discard phase' };
    }

    const idx = state.discardQueue.findIndex(d => d.playerId === playerId);
    if (idx === -1) return { valid: false, message: 'Player does not need to discard' };

    const needed = state.discardQueue[idx].count;
    const totalGiven = Object.values(discardedResources).reduce((s, v) => s + (v || 0), 0);
    if (totalGiven !== needed) {
      return { valid: false, message: `Must discard exactly ${needed} cards` };
    }

    const player = state.players[playerId];
    for (const [res, count] of Object.entries(discardedResources)) {
      if ((player.resources[res] || 0) < count) {
        return { valid: false, message: `Not enough ${res} to discard` };
      }
    }

    // Deduct
    for (const [res, count] of Object.entries(discardedResources)) {
      player.resources[res] -= count;
    }

    state.discardQueue.splice(idx, 1);
    if (!state.discardQueue || state.discardQueue.length === 0) {
      state.discardQueue = [];
      state.phase = 'ROBBER_MOVE';
    }

    return { valid: true, remainingQueue: state.discardQueue };
  }

  /**
   * Bank Trade (4:1 default, or 3:1 generic port, or 2:1 resource port).
   */
  function getBestTradeRatio(state, playerId, resourceType) {
    // Check ports owned by player
    let bestRatio = 4; // default
    for (let vId = 0; vId < 54; vId++) {
      const b = state.vertices[vId];
      if (b && b.player === playerId) {
        const vObj = BOARD_GRAPH.vertices[vId];
        if (vObj.port) {
          if (vObj.port.type === 'generic' && bestRatio > 3) {
            bestRatio = 3;
          } else if (vObj.port.type === resourceType) {
            bestRatio = 2;
          }
        }
      }
    }
    return bestRatio;
  }

  function bankTrade(state, playerId, giveResource, getResource) {
    if (state.phase !== 'PLAYING_TURN') return { valid: false, message: 'Must be your main turn' };
    if (giveResource === getResource) return { valid: false, message: 'Cannot trade same resource' };

    const ratio = getBestTradeRatio(state, playerId, giveResource);
    const player = state.players[playerId];

    if ((player.resources[giveResource] || 0) < ratio) {
      return { valid: false, message: `Need ${ratio} of ${giveResource} to trade with bank` };
    }

    player.resources[giveResource] -= ratio;
    player.resources[getResource] = (player.resources[getResource] || 0) + 1;

    return { valid: true, ratio, giveResource, getResource };
  }

  /**
   * End Turn action.
   */
  function endTurn(state, playerId) {
    if (state.phase !== 'PLAYING_TURN' && state.phase !== 'ROLL_DICE') {
      return { valid: false, message: 'Cannot end turn now' };
    }
    if (state.activePlayer !== playerId) {
      return { valid: false, message: 'Not your turn' };
    }

    recalculateVictoryPoints(state);
    if (state.winner !== null) {
      state.phase = 'FINISHED';
      return { valid: true, isGameOver: true, winner: state.winner };
    }

    // Pass turn to next player
    state.activePlayer = (state.activePlayer + 1) % state.playerCount;
    state.phase = 'ROLL_DICE';
    // Note: state.lastDice and state.lastDiceSum persist across turns so players see the last roll
    state.devCardPlayedThisTurn = false;
    state.tradeOffer = null;
    state.turnCount = (state.turnCount || 0) + 1;

    return { valid: true, nextPlayer: state.activePlayer };
  }

  // =========================================================================
  // 6. LONGEST ROAD & LARGEST ARMY CALCULATION
  // =========================================================================

  /**
   * Calculate Longest Continuous Road for a player using DFS.
   */
  function calculatePlayerRoadLength(state, playerId) {
    const playerEdges = [];
    for (let eId = 0; eId < 72; eId++) {
      if (state.edges[eId] === playerId) {
        playerEdges.push(eId);
      }
    }
    if (playerEdges.length === 0) return 0;

    let maxLength = 0;

    // Explore from every vertex touching a player's road
    const touchingVertices = new Set();
    for (const eId of playerEdges) {
      touchingVertices.add(BOARD_GRAPH.edges[eId].v1);
      touchingVertices.add(BOARD_GRAPH.edges[eId].v2);
    }

    for (const startV of touchingVertices) {
      const visitedEdges = new Set();
      const dfs = (v, depth) => {
        if (depth > maxLength) maxLength = depth;
        const vObj = BOARD_GRAPH.vertices[v];
        if (!vObj) return;

        for (const eId of vObj.edgeIds) {
          if (state.edges[eId] === playerId && !visitedEdges.has(eId)) {
            const eObj = BOARD_GRAPH.edges[eId];
            const nextV = eObj.v1 === v ? eObj.v2 : eObj.v1;

            // Opponent settlement/city blocks through-passage
            const b = state.vertices[nextV];
            const blocked = b !== null && b.player !== playerId;

            visitedEdges.add(eId);
            if (!blocked) {
              dfs(nextV, depth + 1);
            } else {
              if (depth + 1 > maxLength) maxLength = depth + 1;
            }
            visitedEdges.delete(eId);
          }
        }
      };
      dfs(startV, 0);
    }

    return maxLength;
  }

  function checkLongestRoad(state) {
    for (const p of state.players) {
      p.longestRoadLength = calculatePlayerRoadLength(state, p.id);
    }

    let candidate = state.longestRoadPlayer;
    let maxLen = candidate !== null ? state.players[candidate].longestRoadLength : 4; // minimum 5

    for (const p of state.players) {
      if (p.longestRoadLength > maxLen) {
        maxLen = p.longestRoadLength;
        candidate = p.id;
      }
    }

    if (candidate !== state.longestRoadPlayer) {
      if (state.longestRoadPlayer !== null) {
        state.players[state.longestRoadPlayer].hasLongestRoad = false;
      }
      if (candidate !== null) {
        state.players[candidate].hasLongestRoad = true;
      }
      state.longestRoadPlayer = candidate;
      recalculateVictoryPoints(state);
    }
  }

  function checkLargestArmy(state, playerId) {
    const player = state.players[playerId];
    let candidate = state.largestArmyPlayer;
    let maxArmy = candidate !== null ? state.players[candidate].playedKnights : 2; // minimum 3

    if (player.playedKnights > maxArmy) {
      if (candidate !== null) {
        state.players[candidate].hasLargestArmy = false;
      }
      player.hasLargestArmy = true;
      state.largestArmyPlayer = playerId;
      recalculateVictoryPoints(state);
    }
  }

  function recalculateVictoryPoints(state) {
    for (const p of state.players) {
      let vp = 0;
      // Settlements (1 VP) and Cities (2 VP)
      for (let vId = 0; vId < 54; vId++) {
        const b = state.vertices[vId];
        if (b && b.player === p.id) {
          vp += (b.type === 'city' ? 2 : 1);
        }
      }
      // Special Achievements
      if (p.hasLongestRoad) vp += 2;
      if (p.hasLargestArmy) vp += 2;

      // Victory Point Dev Cards
      const vpCards = p.devCards.filter(c => c.type === DEV_CARD_TYPES.VICTORY_POINT).length;
      p.victoryPoints = vp + vpCards;

      if (p.victoryPoints >= 10 && state.winner === null) {
        state.winner = p.id;
      }
    }
  }

  // =========================================================================
  // 7. SMART BOT AI ENGINE
  // =========================================================================

  function evaluateVertexValue(state, vertexId) {
    const vObj = BOARD_GRAPH.vertices[vertexId];
    if (!vObj) return -1;

    let score = 0;
    const resources = new Set();

    for (const hId of vObj.hexIds) {
      const tile = state.tiles[hId];
      if (tile && tile.resource) {
        score += tile.pips * 3;
        resources.add(tile.resource);
      }
    }
    // Bonus for resource diversity
    score += resources.size * 4;

    if (vObj.port) {
      score += vObj.port.type === 'generic' ? 3 : 5;
    }
    return score;
  }

  function chooseBotSetupMove(state, botId) {
    if (state.phase === 'SETUP_SETTLEMENT') {
      let bestV = -1;
      let bestScore = -1;

      for (let vId = 0; vId < 54; vId++) {
        if (canBuildSettlement(state, botId, vId, true)) {
          const val = evaluateVertexValue(state, vId);
          if (val > bestScore) {
            bestScore = val;
            bestV = vId;
          }
        }
      }
      return { action: 'BUILD_SETTLEMENT', vertexId: bestV };
    }

    if (state.phase === 'SETUP_ROAD') {
      const v = state.lastSetupSettlementVertex;
      const vObj = BOARD_GRAPH.vertices[v];
      let bestE = -1;
      let bestScore = -1;

      for (const eId of vObj.edgeIds) {
        if (canBuildRoad(state, botId, eId, true, v)) {
          const eObj = BOARD_GRAPH.edges[eId];
          const otherV = eObj.v1 === v ? eObj.v2 : eObj.v1;
          const val = evaluateVertexValue(state, otherV);
          if (val > bestScore) {
            bestScore = val;
            bestE = eId;
          }
        }
      }
      return { action: 'BUILD_ROAD', edgeId: bestE };
    }

    return null;
  }

  function chooseBotTurn(state, botId) {
    const bot = state.players[botId];

    if (state.phase === 'ROLL_DICE') {
      return { action: 'ROLL_DICE' };
    }

    if (state.phase === 'ROBBER_DISCARD') {
      const entry = Array.isArray(state.discardQueue) ? state.discardQueue.find(d => d.playerId === botId) : null;
      if (entry) {
        const discarded = {};
        let need = entry.count;
        // Discard resources with highest quantities
        const sorted = Object.entries(bot.resources).sort((a, b) => b[1] - a[1]);
        for (const [res, count] of sorted) {
          const give = Math.min(count, need);
          if (give > 0) {
            discarded[res] = give;
            need -= give;
            if (need === 0) break;
          }
        }
        return { action: 'DISCARD_CARDS', discarded };
      }
    }

    if (state.phase === 'ROBBER_MOVE') {
      // Find hex belonging to opponent with highest victory points, move robber there
      let bestHex = 0;
      let maxScore = -1;
      const opponents = state.players.filter(p => p.id !== botId);
      const leadingOpponent = opponents.sort((a, b) => b.victoryPoints - a.victoryPoints)[0];

      for (const tile of state.tiles) {
        if (tile.id !== state.robberHexId && tile.terrain !== TERRAINS.DESERT) {
          const hexObj = BOARD_GRAPH.hexes[tile.id];
          const hasLeadOpponent = hexObj.vertexIds.some(vid => state.vertices[vid] && state.vertices[vid].player === leadingOpponent.id);
          const hasBot = hexObj.vertexIds.some(vid => state.vertices[vid] && state.vertices[vid].player === botId);
          let score = tile.pips;
          if (hasLeadOpponent) score += 10;
          if (hasBot) score -= 15; // Avoid blocking own hexes

          if (score > maxScore) {
            maxScore = score;
            bestHex = tile.id;
          }
        }
      }
      return { action: 'MOVE_ROBBER', hexId: bestHex };
    }

    if (state.phase === 'ROBBER_STEAL') {
      const victim = state.stealCandidates[0];
      return { action: 'STEAL_RESOURCE', victimId: victim };
    }

    if (state.phase === 'PLAYING_TURN') {
      // 1. Try to upgrade Settlement to City
      for (let vId = 0; vId < 54; vId++) {
        if (canBuildCity(state, botId, vId)) {
          return { action: 'BUILD_CITY', vertexId: vId };
        }
      }

      // 2. Try to build Settlement
      for (let vId = 0; vId < 54; vId++) {
        if (canBuildSettlement(state, botId, vId, false)) {
          return { action: 'BUILD_SETTLEMENT', vertexId: vId };
        }
      }

      // 3. Try to build Road towards valuable spots
      for (let eId = 0; eId < 72; eId++) {
        if (canBuildRoad(state, botId, eId, false)) {
          return { action: 'BUILD_ROAD', edgeId: eId };
        }
      }

      // 4. Try to buy Dev Card
      if (canBuyDevCard(state, botId)) {
        return { action: 'BUY_DEV_CARD' };
      }

      // 5. Try Smart Bank Trade if missing 1 resource for a build
      const trade = findHelpfulBankTrade(state, botId);
      if (trade) {
        return { action: 'BANK_TRADE', ...trade };
      }

      // End turn
      return { action: 'END_TURN' };
    }

    return { action: 'END_TURN' };
  }

  function findHelpfulBankTrade(state, playerId) {
    const player = state.players[playerId];
    const targets = [COSTS.CITY, COSTS.SETTLEMENT, COSTS.ROAD, COSTS.DEV_CARD];

    for (const target of targets) {
      let missingRes = null;
      let missingCount = 0;

      for (const [res, need] of Object.entries(target)) {
        const have = player.resources[res] || 0;
        if (have < need) {
          missingCount += (need - have);
          missingRes = res;
        }
      }

      // Only attempt if exactly 1 card short
      if (missingCount === 1 && missingRes) {
        for (const [giveRes, haveCount] of Object.entries(player.resources)) {
          if (giveRes !== missingRes) {
            const ratio = getBestTradeRatio(state, playerId, giveRes);
            const neededForTarget = target[giveRes] || 0;
            if (haveCount >= ratio + neededForTarget) {
              return { giveResource: giveRes, getResource: missingRes };
            }
          }
        }
      }
    }
    return null;
  }

  // =========================================================================
  // 8. EXPORTS
  // =========================================================================
  exports.TERRAINS = TERRAINS;
  exports.RESOURCES = RESOURCES;
  exports.COSTS = COSTS;
  exports.DEV_CARD_TYPES = DEV_CARD_TYPES;
  exports.PLAYER_COLORS = PLAYER_COLORS;
  exports.BOARD_GRAPH = BOARD_GRAPH;
  exports.createInitialState = createInitialState;
  exports.canBuildSettlement = canBuildSettlement;
  exports.canBuildRoad = canBuildRoad;
  exports.canBuildCity = canBuildCity;
  exports.canBuyDevCard = canBuyDevCard;
  exports.buildSettlement = buildSettlement;
  exports.buildRoad = buildRoad;
  exports.buildCity = buildCity;
  exports.buyDevCard = buyDevCard;
  exports.rollDice = rollDice;
  exports.moveRobber = moveRobber;
  exports.stealResource = stealResource;
  exports.discardCards = discardCards;
  exports.bankTrade = bankTrade;
  exports.getBestTradeRatio = getBestTradeRatio;
  exports.endTurn = endTurn;
  exports.calculatePlayerRoadLength = calculatePlayerRoadLength;
  exports.recalculateVictoryPoints = recalculateVictoryPoints;
  exports.hasResources = hasResources;
  exports.chooseBotSetupMove = chooseBotSetupMove;
  exports.chooseBotTurn = chooseBotTurn;

  if (typeof window !== 'undefined') {
    window.CatanLogic = exports;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.CatanLogic = exports;
  }
})(typeof exports === 'undefined' ? (typeof window !== 'undefined' ? (window.CatanLogic = {}) : (typeof globalThis !== 'undefined' ? (globalThis.CatanLogic = {}) : (this.CatanLogic = {}))) : exports);
