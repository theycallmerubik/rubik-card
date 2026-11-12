/**
 * Catan (کاتان / مهاجران کاتان) - Core Game Logic & AI Engine
 * Pure JavaScript, works seamlessly in Node.js and Browser environments.
 * Standard Official 3-4 Player Base Game Rules:
 * - 19 Hexagonal Island (Forest, Hills, Pasture, Fields, Mountains, Desert)
 * - Axial Coordinates (q, r, s) with max(abs(q), abs(r), abs(s)) <= 2
 * - Canonical 54 Vertices & 72 Edges with reciprocal graph topology
 * - Official spiral number token sequence (A-R tokens: 5, 2, 6, 3, 8, 10, 9, 12, 11, 4, 8, 10, 9, 4, 5, 6, 3, 11)
 * - Balanced board generation (no adjacent red 6 and 8 numbers)
 * - 9 Coastal Ports (4 Generic 3:1, 5 Specific 2:1 for Wood, Brick, Sheep, Wheat, Ore)
 * - Finite resource bank (19 of each resource = 95 total)
 * - Starting resources granted on second settlement placement in setup
 * - Production with official finite bank shortage resolution
 * - 7 Roll with halving of hands > 7 cards (dev cards excluded)
 * - Robber movement & server-random card theft (identities private)
 * - Full building system: Roads (15), Settlements (5), Cities (4, returns settlement piece)
 * - Bank/Port Trading (4:1, 3:1, 2:1)
 * - Player-to-player trading (atomic swaps, no gifts, server validation)
 * - 25 Development Cards (14 Knight, 5 VP, 2 Road Building, 2 Year of Plenty, 2 Monopoly)
 * - Exact DFS edge-simple trail Longest Road with strict exceed tie-breaker
 * - Largest Army (min 3 knights, strict exceed)
 * - Victory detection at 10 Victory Points on active turn
 * - Secure state projection (getStateForPlayer) concealing hidden opponent hands
 */

(function (exports) {
  'use strict';

  // =========================================================================
  // 1. CONSTANTS & DEFINITIONS
  // =========================================================================
  const TERRAINS = {
    FOREST: 'forest',       // Lumber / Wood (چوب 🪵)
    HILLS: 'hills',         // Brick / Clay (آجر 🧱)
    PASTURE: 'pasture',     // Wool / Sheep (گوسفند 🐑)
    FIELDS: 'fields',       // Grain / Wheat (گندم 🌾)
    MOUNTAINS: 'mountains', // Ore / Rock (سنگ 🪨)
    DESERT: 'desert'        // No resource (بیابان 🏜️)
  };

  const RESOURCES = {
    LUMBER: 'lumber',
    BRICK: 'brick',
    WOOL: 'wool',
    GRAIN: 'grain',
    ORE: 'ore'
  };

  const RESOURCE_NAMES_FA = {
    [RESOURCES.LUMBER]: 'چوب',
    [RESOURCES.BRICK]: 'آجر',
    [RESOURCES.WOOL]: 'گوسفند',
    [RESOURCES.GRAIN]: 'گندم',
    [RESOURCES.ORE]: 'سنگ'
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
    { id: 'red', hex: '#ef4444', light: '#f87171', nameFa: 'قرمز', nameEn: 'Red', marker: 'circle', symbol: '●' },
    { id: 'blue', hex: '#3b82f6', light: '#60a5fa', nameFa: 'آبی', nameEn: 'Blue', marker: 'square', symbol: '■' },
    { id: 'orange', hex: '#f97316', light: '#fb923c', nameFa: 'نارنجی', nameEn: 'Orange', marker: 'triangle', symbol: '▲' },
    { id: 'green', hex: '#22c55e', light: '#4ade80', nameFa: 'سبز', nameEn: 'Green', marker: 'diamond', symbol: '◆' },
    { id: 'brown', hex: '#8d5b4c', light: '#b07d6f', nameFa: 'قهوه‌ای', nameEn: 'Brown', marker: 'star', symbol: '★' },
    { id: 'white', hex: '#e2e8f0', light: '#f8fafc', nameFa: 'سفید', nameEn: 'White', marker: 'cross', symbol: '✕' },
    { id: 'purple', hex: '#a855f7', light: '#c084fc', nameFa: 'بنفش', nameEn: 'Purple', marker: 'hexagon', symbol: '⬡' },
    { id: 'cyan', hex: '#06b6d4', light: '#22d3ee', nameFa: 'فیروزه‌ای', nameEn: 'Cyan', marker: 'plus', symbol: '✚' }
  ];

  const RULE_PROFILES = {
    BASE: 'base',
    EXTENDED: 'extended',
    CUSTOM: 'custom'
  };

  const PROFILE_DESCRIPTIONS = {
    [RULE_PROFILES.BASE]: {
      id: 'base',
      nameEn: 'Official Base Game',
      nameFa: 'بازی اصلی رسمی',
      playerCountMin: 3,
      playerCountMax: 4,
      targetVP: 10,
      boardTemplate: 'base',
      isOfficial: true
    },
    [RULE_PROFILES.EXTENDED]: {
      id: 'extended',
      nameEn: '5-6 Player Extension',
      nameFa: 'توسعه ۵ تا ۶ نفره رسمی',
      playerCountMin: 5,
      playerCountMax: 6,
      targetVP: 11,
      boardTemplate: 'extended',
      isOfficial: true
    },
    [RULE_PROFILES.CUSTOM]: {
      id: 'custom',
      nameEn: 'Custom Variant (Unofficial)',
      nameFa: 'حالت سفارشی (غیررسمی)',
      playerCountMin: 3,
      playerCountMax: 8,
      targetVP: 10,
      boardTemplate: 'custom',
      isOfficial: false
    }
  };

  const DEV_CARD_DECK_COUNTS = {
    [RULE_PROFILES.BASE]: {
      [DEV_CARD_TYPES.KNIGHT]: 14,
      [DEV_CARD_TYPES.VICTORY_POINT]: 5,
      [DEV_CARD_TYPES.ROAD_BUILDING]: 2,
      [DEV_CARD_TYPES.YEAR_OF_PLENTY]: 2,
      [DEV_CARD_TYPES.MONOPOLY]: 2
    },
    [RULE_PROFILES.EXTENDED]: {
      [DEV_CARD_TYPES.KNIGHT]: 20,
      [DEV_CARD_TYPES.VICTORY_POINT]: 5,
      [DEV_CARD_TYPES.ROAD_BUILDING]: 3,
      [DEV_CARD_TYPES.YEAR_OF_PLENTY]: 3,
      [DEV_CARD_TYPES.MONOPOLY]: 3
    },
    [RULE_PROFILES.CUSTOM]: {
      [DEV_CARD_TYPES.KNIGHT]: 26,
      [DEV_CARD_TYPES.VICTORY_POINT]: 6,
      [DEV_CARD_TYPES.ROAD_BUILDING]: 4,
      [DEV_CARD_TYPES.YEAR_OF_PLENTY]: 4,
      [DEV_CARD_TYPES.MONOPOLY]: 4
    }
  };

  const BANK_START_COUNTS = {
    [RULE_PROFILES.BASE]: 19,
    [RULE_PROFILES.EXTENDED]: 24,
    [RULE_PROFILES.CUSTOM]: 30
  };

  const TARGET_VICTORY_POINTS = {
    [RULE_PROFILES.BASE]: 10,
    [RULE_PROFILES.EXTENDED]: 11,
    [RULE_PROFILES.CUSTOM]: 10
  };

  function validateProfilePlayerCount(profile, count) {
    const p = parseInt(count, 10);
    if (isNaN(p) || p < 3 || p > 8) {
      return { valid: false, message: 'Player count must be between 3 and 8' };
    }
    if (profile === RULE_PROFILES.BASE) {
      if (p < 3 || p > 4) {
        return { valid: false, message: 'Official Base Game rules support exactly 3 or 4 players' };
      }
    } else if (profile === RULE_PROFILES.EXTENDED) {
      if (p < 5 || p > 6) {
        return { valid: false, message: 'Official 5-6 Player Extension rules support exactly 5 or 6 players' };
      }
    } else if (profile === RULE_PROFILES.CUSTOM) {
      if (p < 3 || p > 8) {
        return { valid: false, message: 'Custom variant supports between 3 and 8 players' };
      }
    } else {
      return { valid: false, message: `Unknown rule profile: ${profile}` };
    }
    return { valid: true };
  }

  // Number to probability dots (pips)
  const NUMBER_PIPS = {
    2: 1, 3: 2, 4: 3, 5: 4, 6: 5,
    8: 5, 9: 4, 10: 3, 11: 2, 12: 1
  };

  // Official Standard Catan variable setup spiral token values (letters A through R)
  const OFFICIAL_SPIRAL_TOKENS = [5, 2, 6, 3, 8, 10, 9, 12, 11, 4, 8, 10, 9, 4, 5, 6, 3, 11];

  // Outer ring (12) -> Inner ring (6) -> Center (1) traversal order of hex IDs
  const SPIRAL_HEX_ORDER = [0, 1, 2, 6, 11, 15, 18, 17, 16, 12, 7, 3, 4, 5, 10, 14, 13, 8, 9];

  // Bank standard capacity: 19 cards for each of the 5 resources = 95 total
  const BANK_START_COUNT = 19;

  // Maximum piece limits per player
  const MAX_PIECES = {
    ROADS: 15,
    SETTLEMENTS: 5,
    CITIES: 4
  };

  // =========================================================================
  // 2. PSEUDO-RANDOM NUMBER GENERATOR (Deterministic / Seedable)
  // =========================================================================
  function createPrng(seed) {
    if (seed === undefined || seed === null) {
      return Math.random;
    }
    let s = (typeof seed === 'number' ? seed : hashString(String(seed))) >>> 0;
    return function () {
      s |= 0;
      s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
    }
    return hash;
  }

  // =========================================================================
  // 3. GEOMETRY GENERATOR (19 Hexes, 54 Vertices, 72 Edges)
  // =========================================================================
  const HEX_RADIUS = 55;
  const HEX_WIDTH = Math.sqrt(3) * HEX_RADIUS;
  const VERT_DIST = 1.5 * HEX_RADIUS;

  const HEX_ROW_CONFIGS = {
    base: [
      { row: 0, count: 3, offset: 1 },
      { row: 1, count: 4, offset: 0.5 },
      { row: 2, count: 5, offset: 0 },
      { row: 3, count: 4, offset: 0.5 },
      { row: 4, count: 3, offset: 1 }
    ],
    extended: [
      { row: 0, count: 3, offset: 1.5 },
      { row: 1, count: 4, offset: 1 },
      { row: 2, count: 5, offset: 0.5 },
      { row: 3, count: 6, offset: 0 },
      { row: 4, count: 5, offset: 0.5 },
      { row: 5, count: 4, offset: 1 },
      { row: 6, count: 3, offset: 1.5 }
    ]
  };

  const HEX_ROW_CONFIG = HEX_ROW_CONFIGS.base;

  function buildBoardGeometry(template = 'base') {
    const isExtended = template === 'extended';
    const rowConfig = HEX_ROW_CONFIGS[template] || HEX_ROW_CONFIGS.base;
    const centerHexX = isExtended ? 325 : 270;
    const centerHexY = isExtended ? 300 : 240;
    const centerRowIdx = isExtended ? 3 : 2;
    const centerColOffset = isExtended ? 3 : 2.5;

    const hexes = [];
    let hexId = 0;

    for (let rIdx = 0; rIdx < rowConfig.length; rIdx++) {
      const rConf = rowConfig[rIdx];
      const cy = centerHexY + (rConf.row - centerRowIdx) * VERT_DIST;
      const r = rConf.row - centerRowIdx;

      for (let cIdx = 0; cIdx < rConf.count; cIdx++) {
        const cx = centerHexX + (cIdx + rConf.offset - centerColOffset) * HEX_WIDTH;
        let q;
        if (isExtended) {
          if (r === -3) q = cIdx;
          else if (r === -2) q = cIdx - 1;
          else if (r === -1) q = cIdx - 1;
          else if (r === 0) q = cIdx - 2;
          else if (r === 1) q = cIdx - 2;
          else if (r === 2) q = cIdx - 2;
          else q = cIdx - 2;
        } else {
          if (r === -2) q = cIdx;
          else if (r === -1) q = cIdx - 1;
          else if (r === 0) q = cIdx - 2;
          else if (r === 1) q = cIdx - 2;
          else q = cIdx - 2;
        }
        const s = -q - r;

        hexes.push({
          id: hexId++,
          row: rConf.row,
          col: cIdx,
          q,
          r,
          s,
          x: Math.round(cx * 10) / 10,
          y: Math.round(cy * 10) / 10,
          vertexIds: [],
          edgeIds: [],
          neighborHexIds: []
        });
      }
    }

    // Connect neighbor hexes
    for (let i = 0; i < hexes.length; i++) {
      for (let j = i + 1; j < hexes.length; j++) {
        const h1 = hexes[i];
        const h2 = hexes[j];
        const dist = Math.max(Math.abs(h1.q - h2.q), Math.abs(h1.r - h2.r), Math.abs(h1.s - h2.s));
        if (dist === 1) {
          h1.neighborHexIds.push(h2.id);
          h2.neighborHexIds.push(h1.id);
        }
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

    const ports = assignPorts(vertices, isExtended, centerHexX, centerHexY);

    return { template, hexes, vertices, edges, ports };
  }

  function assignPorts(vertices, isExtended = false, cx = 270, cy = 240) {
    const portDefs = isExtended ? [
      { id: 0, type: 'generic', ratio: 3, name: 'Generic 3:1' },
      { id: 1, type: RESOURCES.WOOL, ratio: 2, name: 'Wool 2:1' },
      { id: 2, type: 'generic', ratio: 3, name: 'Generic 3:1' },
      { id: 3, type: RESOURCES.GRAIN, ratio: 2, name: 'Grain 2:1' },
      { id: 4, type: RESOURCES.ORE, ratio: 2, name: 'Ore 2:1' },
      { id: 5, type: 'generic', ratio: 3, name: 'Generic 3:1' },
      { id: 6, type: RESOURCES.WOOL, ratio: 2, name: 'Wool 2:1' },
      { id: 7, type: 'generic', ratio: 3, name: 'Generic 3:1' },
      { id: 8, type: RESOURCES.BRICK, ratio: 2, name: 'Brick 2:1' },
      { id: 9, type: RESOURCES.LUMBER, ratio: 2, name: 'Lumber 2:1' },
      { id: 10, type: 'generic', ratio: 3, name: 'Generic 3:1' }
    ] : [
      { id: 0, type: 'generic', ratio: 3, name: 'Generic 3:1' },
      { id: 1, type: RESOURCES.GRAIN, ratio: 2, name: 'Grain 2:1' },
      { id: 2, type: RESOURCES.ORE, ratio: 2, name: 'Ore 2:1' },
      { id: 3, type: 'generic', ratio: 3, name: 'Generic 3:1' },
      { id: 4, type: RESOURCES.WOOL, ratio: 2, name: 'Wool 2:1' },
      { id: 5, type: 'generic', ratio: 3, name: 'Generic 3:1' },
      { id: 6, type: RESOURCES.BRICK, ratio: 2, name: 'Brick 2:1' },
      { id: 7, type: RESOURCES.LUMBER, ratio: 2, name: 'Lumber 2:1' },
      { id: 8, type: 'generic', ratio: 3, name: 'Generic 3:1' }
    ];

    const perimeterVertices = vertices.filter(v => v.hexIds.length === 1 || v.hexIds.length === 2);
    perimeterVertices.sort((a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx));

    const total = perimeterVertices.length;
    const portCount = portDefs.length;
    const ports = [];

    for (let p = 0; p < portCount; p++) {
      const idx = Math.floor((p / portCount) * total);
      const v1 = perimeterVertices[idx];
      const v2Id = v1.neighborVertexIds.find(nid => {
        const nv = vertices[nid];
        return nv && (nv.hexIds.length === 1 || nv.hexIds.length === 2) && !nv.port;
      });

      const portObj = {
        ...portDefs[p],
        vertexIds: [v1.id]
      };
      v1.port = portObj;

      if (v2Id !== undefined && vertices[v2Id]) {
        vertices[v2Id].port = portObj;
        portObj.vertexIds.push(v2Id);
      }
      ports.push(portObj);
    }

    return ports;
  }

  // Pre-generated static board graph geometries
  const BOARD_GRAPHS = {
    base: buildBoardGeometry('base'),
    extended: buildBoardGeometry('extended')
  };
  const BOARD_GRAPH = BOARD_GRAPHS.base;

  function getBoardGraph(state) {
    if (state && state.boardGraph) return state.boardGraph;
    if (state && state.boardTemplate && BOARD_GRAPHS[state.boardTemplate]) {
      return BOARD_GRAPHS[state.boardTemplate];
    }
    if (state && state.ruleProfile && BOARD_GRAPHS[state.ruleProfile]) {
      return BOARD_GRAPHS[state.ruleProfile];
    }
    return BOARD_GRAPH;
  }

  // =========================================================================
  // 4. BOARD VALIDATOR
  // =========================================================================
  function validateBoardGraph(graph, tiles = null) {
    if (!graph || !Array.isArray(graph.hexes) || graph.hexes.length !== 19) {
      return { valid: false, error: 'Expected exactly 19 hexes' };
    }
    if (!Array.isArray(graph.vertices) || graph.vertices.length !== 54) {
      return { valid: false, error: 'Expected exactly 54 vertices' };
    }
    if (!Array.isArray(graph.edges) || graph.edges.length !== 72) {
      return { valid: false, error: 'Expected exactly 72 edges' };
    }

    // Coordinate verification
    for (const h of graph.hexes) {
      const { q, r, s } = h;
      if (q + r + s !== 0) {
        return { valid: false, error: `Hex ${h.id} axial invariant q+r+s=0 violated` };
      }
      if (Math.max(Math.abs(q), Math.abs(r), Math.abs(s)) > 2) {
        return { valid: false, error: `Hex ${h.id} coordinates exceed radius 2` };
      }
      if (!Array.isArray(h.vertexIds) || h.vertexIds.length !== 6) {
        return { valid: false, error: `Hex ${h.id} does not have exactly 6 corners` };
      }
      if (!Array.isArray(h.edgeIds) || h.edgeIds.length !== 6) {
        return { valid: false, error: `Hex ${h.id} does not have exactly 6 edges` };
      }
    }

    // Reciprocal relationships
    for (const e of graph.edges) {
      if (e.v1 >= e.v2) {
        return { valid: false, error: `Edge ${e.id} endpoints not canonicalized (v1 < v2)` };
      }
      const v1Obj = graph.vertices[e.v1];
      const v2Obj = graph.vertices[e.v2];
      if (!v1Obj || !v2Obj) {
        return { valid: false, error: `Edge ${e.id} references invalid vertex` };
      }
      if (!v1Obj.edgeIds.includes(e.id) || !v2Obj.edgeIds.includes(e.id)) {
        return { valid: false, error: `Edge ${e.id} reciprocal link missing in endpoint` };
      }
    }

    // Ports validation
    const ports = graph.vertices.filter(v => v.port !== null);
    if (ports.length < 9) {
      return { valid: false, error: 'Expected at least 9 port vertices' };
    }

    // Tile multiset validation if tiles provided
    if (tiles) {
      if (!Array.isArray(tiles) || tiles.length !== 19) {
        return { valid: false, error: 'Expected exactly 19 tiles' };
      }
      const terrainCounts = {};
      const numberTokens = [];
      let desertCount = 0;

      for (const t of tiles) {
        terrainCounts[t.terrain] = (terrainCounts[t.terrain] || 0) + 1;
        if (t.terrain === TERRAINS.DESERT) {
          desertCount++;
          if (t.number !== null) return { valid: false, error: 'Desert must have null number' };
          if (!t.hasRobber) return { valid: false, error: 'Desert must initially have robber' };
        } else {
          if (t.number === null) return { valid: false, error: `Tile ${t.id} missing number token` };
          numberTokens.push(t.number);
        }
      }

      if (desertCount !== 1) return { valid: false, error: 'Expected exactly 1 desert' };
      if (terrainCounts[TERRAINS.FOREST] !== 4) return { valid: false, error: 'Expected 4 forest hexes' };
      if (terrainCounts[TERRAINS.HILLS] !== 3) return { valid: false, error: 'Expected 3 hills hexes' };
      if (terrainCounts[TERRAINS.PASTURE] !== 4) return { valid: false, error: 'Expected 4 pasture hexes' };
      if (terrainCounts[TERRAINS.FIELDS] !== 4) return { valid: false, error: 'Expected 4 fields hexes' };
      if (terrainCounts[TERRAINS.MOUNTAINS] !== 3) return { valid: false, error: 'Expected 3 mountains hexes' };

      const numMap = {};
      numberTokens.forEach(n => { numMap[n] = (numMap[n] || 0) + 1; });
      if (numMap[2] !== 1 || numMap[12] !== 1) return { valid: false, error: 'Expected one 2 and one 12' };
      if (numMap[3] !== 2 || numMap[11] !== 2) return { valid: false, error: 'Expected two 3 and two 11' };
      if (numMap[4] !== 2 || numMap[10] !== 2) return { valid: false, error: 'Expected two 4 and two 10' };
      if (numMap[5] !== 2 || numMap[9] !== 2) return { valid: false, error: 'Expected two 5 and two 9' };
      if (numMap[6] !== 2 || numMap[8] !== 2) return { valid: false, error: 'Expected two 6 and two 8' };
    }

    return { valid: true };
  }

  // =========================================================================
  // 5. DECK & TILE GENERATION (Deterministic, Seeded, Versioned)
  // =========================================================================
  const MAP_GENERATOR_VERSION = '1.0.0';

  function createDevCardDeck(ruleProfileOrPrng = RULE_PROFILES.BASE, maybePrng = Math.random) {
    let profile = RULE_PROFILES.BASE;
    let prng = Math.random;

    if (typeof ruleProfileOrPrng === 'function') {
      prng = ruleProfileOrPrng;
      profile = RULE_PROFILES.BASE;
    } else if (typeof ruleProfileOrPrng === 'string') {
      profile = ruleProfileOrPrng;
      if (typeof maybePrng === 'function') prng = maybePrng;
    }

    const counts = DEV_CARD_DECK_COUNTS[profile] || DEV_CARD_DECK_COUNTS[RULE_PROFILES.BASE];
    const deck = [];
    for (const [type, count] of Object.entries(counts)) {
      for (let i = 0; i < count; i++) deck.push(type);
    }

    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(prng() * (i + 1));
      const temp = deck[i];
      deck[i] = deck[j];
      deck[j] = temp;
    }
    return deck;
  }

  function shuffleArray(arr, prng = Math.random) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(prng() * (i + 1));
      const t = arr[i];
      arr[i] = arr[j];
      arr[j] = t;
    }
    return arr;
  }

  // Terrain bags per profile
  const TERRAIN_BAGS = {
    [RULE_PROFILES.BASE]: [
      TERRAINS.FOREST, TERRAINS.FOREST, TERRAINS.FOREST, TERRAINS.FOREST,
      TERRAINS.HILLS, TERRAINS.HILLS, TERRAINS.HILLS,
      TERRAINS.PASTURE, TERRAINS.PASTURE, TERRAINS.PASTURE, TERRAINS.PASTURE,
      TERRAINS.FIELDS, TERRAINS.FIELDS, TERRAINS.FIELDS, TERRAINS.FIELDS,
      TERRAINS.MOUNTAINS, TERRAINS.MOUNTAINS, TERRAINS.MOUNTAINS,
      TERRAINS.DESERT
    ],
    [RULE_PROFILES.EXTENDED]: [
      TERRAINS.FOREST, TERRAINS.FOREST, TERRAINS.FOREST, TERRAINS.FOREST, TERRAINS.FOREST, TERRAINS.FOREST,
      TERRAINS.HILLS, TERRAINS.HILLS, TERRAINS.HILLS, TERRAINS.HILLS, TERRAINS.HILLS,
      TERRAINS.PASTURE, TERRAINS.PASTURE, TERRAINS.PASTURE, TERRAINS.PASTURE, TERRAINS.PASTURE, TERRAINS.PASTURE,
      TERRAINS.FIELDS, TERRAINS.FIELDS, TERRAINS.FIELDS, TERRAINS.FIELDS, TERRAINS.FIELDS, TERRAINS.FIELDS,
      TERRAINS.MOUNTAINS, TERRAINS.MOUNTAINS, TERRAINS.MOUNTAINS, TERRAINS.MOUNTAINS, TERRAINS.MOUNTAINS,
      TERRAINS.DESERT, TERRAINS.DESERT
    ]
  };

  const EXTENDED_TOKENS = [
    2, 2, 12, 12,
    3, 3, 3, 11, 11, 11,
    4, 4, 4, 10, 10, 10,
    5, 5, 5, 9, 9, 9,
    6, 6, 6, 8, 8, 8
  ];

  function calculateMapStats(graph, tiles) {
    const pipCountsByResource = {
      [RESOURCES.LUMBER]: 0,
      [RESOURCES.BRICK]: 0,
      [RESOURCES.WOOL]: 0,
      [RESOURCES.GRAIN]: 0,
      [RESOURCES.ORE]: 0
    };

    tiles.forEach(tile => {
      if (tile.resource && tile.pips) {
        pipCountsByResource[tile.resource] = (pipCountsByResource[tile.resource] || 0) + tile.pips;
      }
    });

    const vertexScores = graph.vertices.map(v => {
      let score = 0;
      const resSet = new Set();
      v.hexIds.forEach(hId => {
        const t = tiles[hId];
        if (t && t.resource && t.pips) {
          score += t.pips;
          resSet.add(t.resource);
        }
      });
      return { vertexId: v.id, score, totalPips: score, diversity: resSet.size, x: v.x, y: v.y, port: v.port ? v.port.type : null };
    });

    vertexScores.sort((a, b) => b.score - a.score || b.diversity - a.diversity);
    const strongestLocations = vertexScores.slice(0, 3);
    const totalPips = Object.values(pipCountsByResource).reduce((sum, val) => sum + val, 0);

    return {
      pipCountsByResource,
      pips: pipCountsByResource,
      totalPips,
      strongestLocations,
      topLocations: strongestLocations
    };
  }

  function generateMap(options = {}) {
    const profile = options.profile || options.ruleProfile || RULE_PROFILES.BASE;
    const isExtended = profile === RULE_PROFILES.EXTENDED;
    const template = options.boardTemplate || (isExtended ? 'extended' : 'base');
    const graph = options.boardGraph || BOARD_GRAPHS[template] || BOARD_GRAPHS.base;
    const seed = options.seed !== undefined && options.seed !== null ? String(options.seed).trim().toUpperCase() : (Date.now().toString(36) + Math.random().toString(36).slice(2, 6)).toUpperCase();
    const prng = createPrng(seed);
    const balanced = options.balanced !== false;
    const randomize = options.randomize !== false;

    const terrainBag = isExtended ? [...TERRAIN_BAGS[RULE_PROFILES.EXTENDED]] : [...TERRAIN_BAGS[RULE_PROFILES.BASE]];
    const maxAttempts = balanced ? 60 : 1;
    let attempts = 0;
    let selectedTiles = null;
    let selectedRobberHex = 0;

    while (attempts < maxAttempts) {
      attempts++;
      const currentTerrains = randomize ? shuffleArray([...terrainBag], prng) : [...terrainBag];
      const rawTiles = [];
      const nonDesertIndices = [];
      let firstDesertHex = 0;

      for (let i = 0; i < graph.hexes.length; i++) {
        const terrain = currentTerrains[i] || TERRAINS.FIELDS;
        const isDesert = terrain === TERRAINS.DESERT;
        if (isDesert && firstDesertHex === 0) firstDesertHex = i;
        rawTiles.push({
          id: i,
          terrain,
          resource: TERRAIN_TO_RESOURCE[terrain],
          number: null,
          pips: 0,
          hasRobber: isDesert && (i === firstDesertHex)
        });
        if (!isDesert) nonDesertIndices.push(i);
      }

      // Assign tokens
      if (isExtended) {
        const shuffledTokens = randomize ? shuffleArray([...EXTENDED_TOKENS], prng) : [...EXTENDED_TOKENS];
        for (let idx = 0; idx < nonDesertIndices.length; idx++) {
          const hId = nonDesertIndices[idx];
          const num = shuffledTokens[idx] || 5;
          rawTiles[hId].number = num;
          rawTiles[hId].pips = NUMBER_PIPS[num] || 0;
        }
      } else {
        let tokenIdx = 0;
        for (const hexId of SPIRAL_HEX_ORDER) {
          const tile = rawTiles[hexId];
          if (tile && tile.terrain !== TERRAINS.DESERT) {
            const num = OFFICIAL_SPIRAL_TOKENS[tokenIdx++];
            tile.number = num;
            tile.pips = NUMBER_PIPS[num] || 0;
          }
        }
      }

      // Check balanced condition: no adjacent 6 and 8
      if (balanced) {
        let hasAdjacentRed = false;
        for (let i = 0; i < graph.hexes.length; i++) {
          const t1 = rawTiles[i];
          if (t1.number === 6 || t1.number === 8) {
            const hObj = graph.hexes[i];
            for (const nId of hObj.neighborHexIds) {
              const t2 = rawTiles[nId];
              if (t2 && (t2.number === 6 || t2.number === 8)) {
                hasAdjacentRed = true;
                break;
              }
            }
          }
          if (hasAdjacentRed) break;
        }

        if (!hasAdjacentRed || attempts === maxAttempts) {
          selectedTiles = rawTiles;
          selectedRobberHex = firstDesertHex;
          break;
        }
      } else {
        selectedTiles = rawTiles;
        selectedRobberHex = firstDesertHex;
        break;
      }
    }

    if (!selectedTiles) {
      throw new Error(`Failed to generate valid map within ${maxAttempts} attempts for seed: ${seed}`);
    }

    const stats = calculateMapStats(graph, selectedTiles);

    return {
      schemaVersion: 1,
      generatorVersion: MAP_GENERATOR_VERSION,
      seed,
      ruleProfile: profile,
      playerCountMin: PROFILE_DESCRIPTIONS[profile].playerCountMin,
      playerCountMax: PROFILE_DESCRIPTIONS[profile].playerCountMax,
      boardTemplate: template,
      boardGraph: graph,
      tiles: selectedTiles,
      robberHexId: selectedRobberHex,
      ports: graph.ports,
      stats
    };
  }

  function generateHexTiles(options = {}) {
    const map = generateMap(options);
    return {
      tiles: map.tiles,
      robberHexId: map.robberHexId,
      seed: map.seed,
      stats: map.stats
    };
  }

  function validateCustomMap(map, ruleProfile = RULE_PROFILES.BASE, playerCount = 4) {
    if (!map) return { valid: false, errors: ['Map data is missing'] };
    const errors = [];
    if (!map.tiles || !Array.isArray(map.tiles) || map.tiles.length === 0) {
      errors.push('Map must contain hex tiles');
      return { valid: false, errors };
    }

    const template = map.boardTemplate || (map.tiles.length >= 30 ? 'extended' : 'base');
    const bg = map.boardGraph || BOARD_GRAPHS[template] || BOARD_GRAPHS.base;

    if (map.tiles.length !== bg.hexes.length) {
      errors.push(`Tile count mismatch: expected ${bg.hexes.length}, got ${map.tiles.length}`);
    }

    const robberTiles = map.tiles.filter(t => t.hasRobber);
    if (robberTiles.length !== 1) {
      errors.push(`Expected exactly 1 tile with robber/bandit, got ${robberTiles.length}`);
    }

    let redAdjacent = false;
    for (const h of bg.hexes) {
      const t1 = map.tiles[h.id];
      if (t1 && (t1.number === 6 || t1.number === 8)) {
        for (const nId of h.neighborHexIds) {
          const t2 = map.tiles[nId];
          if (t2 && (t2.number === 6 || t2.number === 8)) {
            redAdjacent = true;
            break;
          }
        }
      }
    }
    if (redAdjacent) {
      errors.push('High probability tokens (6 and 8) cannot be placed on adjacent hexes');
    }

    for (const t of map.tiles) {
      if (t.terrain !== TERRAINS.DESERT && (!t.number || t.number < 2 || t.number > 12 || t.number === 7)) {
        errors.push(`Tile ${t.id} (${t.terrain}) has invalid or missing number token: ${t.number}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  function autoFixMap(map) {
    const fixed = JSON.parse(JSON.stringify(map));
    const template = fixed.boardTemplate || (fixed.tiles.length >= 30 ? 'extended' : 'base');
    const bg = fixed.boardGraph || BOARD_GRAPHS[template] || BOARD_GRAPHS.base;

    let robberHex = fixed.tiles.find(t => t.hasRobber);
    if (!robberHex) {
      robberHex = fixed.tiles.find(t => t.terrain === TERRAINS.DESERT) || fixed.tiles[0];
      if (robberHex) robberHex.hasRobber = true;
    }
    fixed.robberHexId = robberHex ? robberHex.id : 0;

    for (const t of fixed.tiles) {
      if (t.terrain === TERRAINS.DESERT) {
        t.number = null;
        t.pips = 0;
      } else if (!t.number || t.number === 7) {
        t.number = 5;
        t.pips = 4;
      }
    }

    for (const h of bg.hexes) {
      const t1 = fixed.tiles[h.id];
      if (t1 && (t1.number === 6 || t1.number === 8)) {
        for (const nId of h.neighborHexIds) {
          const t2 = fixed.tiles[nId];
          if (t2 && (t2.number === 6 || t2.number === 8)) {
            const swapTarget = fixed.tiles.find(cand => {
              if (cand.id === t2.id || cand.id === t1.id) return false;
              if (cand.terrain === TERRAINS.DESERT) return false;
              if (cand.number === 6 || cand.number === 8) return false;
              const ch = bg.hexes[cand.id];
              return !ch.neighborHexIds.some(nid => fixed.tiles[nid].number === 6 || fixed.tiles[nid].number === 8);
            });
            if (swapTarget) {
              const tempNum = t2.number;
              const tempPips = t2.pips;
              t2.number = swapTarget.number;
              t2.pips = swapTarget.pips;
              swapTarget.number = tempNum;
              swapTarget.pips = tempPips;
            }
          }
        }
      }
    }

    return fixed;
  }

  // =========================================================================
  // 6. INITIAL STATE CREATION
  // =========================================================================
  function createInitialState(playerCount = 3, playerNames = null, options = {}) {
    const count = Math.max(2, Math.min(8, parseInt(playerCount, 10) || 3));
    const profile = options.ruleProfile || (count > 6 ? RULE_PROFILES.CUSTOM : (count > 4 ? RULE_PROFILES.EXTENDED : RULE_PROFILES.BASE));
    const prng = createPrng(options.seed);
    const template = options.boardTemplate || (profile === RULE_PROFILES.EXTENDED ? 'extended' : 'base');
    const boardGraph = options.boardGraph || BOARD_GRAPHS[template] || BOARD_GRAPHS.base;

    let tiles, robberHexId, seed, generatorVersion, mapStats;
    if (options.customMap && options.customMap.tiles) {
      tiles = JSON.parse(JSON.stringify(options.customMap.tiles));
      robberHexId = options.customMap.robberHexId !== undefined ? options.customMap.robberHexId : (tiles.find(t => t.hasRobber) || { id: 0 }).id;
      seed = options.customMap.seed || 'custom';
      generatorVersion = options.customMap.generatorVersion || MAP_GENERATOR_VERSION;
      mapStats = calculateMapStats(boardGraph, tiles);
    } else {
      const generated = generateMap({
        profile,
        playerCount: count,
        seed: options.seed,
        randomize: options.randomize !== false,
        balanced: options.balanced !== false,
        boardTemplate: template,
        boardGraph
      });
      tiles = generated.tiles;
      robberHexId = generated.robberHexId;
      seed = generated.seed;
      generatorVersion = generated.generatorVersion;
      mapStats = generated.stats;
    }

    const players = [];
    for (let i = 0; i < count; i++) {
      const pColor = PLAYER_COLORS[i] || PLAYER_COLORS[i % PLAYER_COLORS.length];
      const pName = (playerNames && playerNames[i]) || `Player ${i + 1}`;
      players.push({
        id: i,
        name: pName,
        color: pColor.id,
        colorHex: pColor.hex,
        colorLight: pColor.light,
        marker: pColor.marker || 'circle',
        symbol: pColor.symbol || '●',
        resources: {
          [RESOURCES.LUMBER]: 0,
          [RESOURCES.BRICK]: 0,
          [RESOURCES.WOOL]: 0,
          [RESOURCES.GRAIN]: 0,
          [RESOURCES.ORE]: 0
        },
        devCards: [], // { type, turnBought, played }
        playedKnights: 0,
        victoryPoints: 0,
        settlementsLeft: MAX_PIECES.SETTLEMENTS,
        citiesLeft: MAX_PIECES.CITIES,
        roadsLeft: MAX_PIECES.ROADS,
        longestRoadLength: 0,
        hasLongestRoad: false,
        hasLargestArmy: false
      });
    }

    const bankStart = BANK_START_COUNTS[profile] || 19;
    const bank = {
      [RESOURCES.LUMBER]: bankStart,
      [RESOURCES.BRICK]: bankStart,
      [RESOURCES.WOOL]: bankStart,
      [RESOURCES.GRAIN]: bankStart,
      [RESOURCES.ORE]: bankStart
    };

    const vertices = Array.from({ length: boardGraph.vertices.length }, () => null);
    const edges = Array.from({ length: boardGraph.edges.length }, () => null);

    const setupOrder = [];
    for (let i = 0; i < count; i++) setupOrder.push(i);
    for (let i = count - 1; i >= 0; i--) setupOrder.push(i);

    return {
      version: 1,
      ruleProfile: profile,
      boardTemplate: template,
      boardGraph,
      seed,
      generatorVersion,
      mapStats,
      targetVictoryPoints: options.targetVP || TARGET_VICTORY_POINTS[profile] || 10,
      playerCount: count,
      players,
      bank,
      tiles,
      robberHexId,
      vertices,
      edges,
      devCardDeck: createDevCardDeck(profile, prng),
      phase: 'SETUP_SETTLEMENT', // 'SETUP_SETTLEMENT', 'SETUP_ROAD', 'ROLL_DICE', 'ROBBER_DISCARD', 'ROBBER_MOVE', 'ROBBER_STEAL', 'PLAYING_TURN', 'FINISHED'
      setupOrder,
      setupIndex: 0,
      setupRound: 1,
      activePlayer: setupOrder[0],
      specialBuildingTurn: null,
      lastDice: null,
      lastDiceSum: null,
      turnCount: 0,
      discardQueue: [], // [ { playerId, count } ]
      stealCandidates: [], // [ playerId ]
      devCardPlayedThisTurn: false,
      longestRoadPlayer: null,
      largestArmyPlayer: null,
      winner: null,
      tradeOffer: null, // { id, fromPlayer, targetPlayer, give, receive, acceptedBy: [], rejectedBy: [] }
      log: []
    };
  }

  // =========================================================================
  // 7. RULES & VALIDATION ENGINE
  // =========================================================================

  /**
   * Distance rule: No settlement can be built within 1 edge of any existing building.
   */
  function isDistanceRuleSatisfied(state, vertexId) {
    if (state.vertices[vertexId] !== null) return false;
    const bg = getBoardGraph(state);
    const vObj = bg.vertices[vertexId];
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
    if (!player || player.settlementsLeft <= 0) return false;

    if (isSetup) {
      return true;
    }

    if (state.phase === 'SPECIAL_BUILDING' && state.specialBuildingTurn !== playerId) {
      return false;
    }

    if (!hasResources(player, COSTS.SETTLEMENT)) return false;

    // Must connect to player's road network
    const bg = getBoardGraph(state);
    const vObj = bg.vertices[vertexId];
    if (!vObj) return false;
    const connectsToRoad = vObj.edgeIds.some(eId => state.edges[eId] === playerId);
    return connectsToRoad;
  }

  /**
   * Check if player can build a road at edgeId.
   */
  function canBuildRoad(state, playerId, edgeId, isSetup = false, setupSettlementVertex = null, isFree = false) {
    if (state.edges[edgeId] !== null) return false;
    const player = state.players[playerId];
    if (!player || player.roadsLeft <= 0) return false;

    const bg = getBoardGraph(state);
    const eObj = bg.edges[edgeId];
    if (!eObj) return false;

    if (isSetup) {
      if (setupSettlementVertex !== null) {
        return eObj.v1 === setupSettlementVertex || eObj.v2 === setupSettlementVertex;
      }
      return true;
    }

    if (state.phase === 'SPECIAL_BUILDING' && state.specialBuildingTurn !== playerId) {
      return false;
    }

    if (!isFree && !hasResources(player, COSTS.ROAD)) return false;

    // Touches player's settlement or city
    const touchesBuilding = (state.vertices[eObj.v1] && state.vertices[eObj.v1].player === playerId) ||
                            (state.vertices[eObj.v2] && state.vertices[eObj.v2].player === playerId);
    if (touchesBuilding) return true;

    // Touches player's road (unless blocked by opponent settlement/city on that vertex)
    const touchesOwnRoad = eObj.neighborEdgeIds.some(nEdgeId => {
      if (state.edges[nEdgeId] !== playerId) return false;
      const nObj = bg.edges[nEdgeId];
      const sharedVertex = (eObj.v1 === nObj.v1 || eObj.v1 === nObj.v2) ? eObj.v1 :
                           (eObj.v2 === nObj.v1 || eObj.v2 === nObj.v2) ? eObj.v2 : null;
      if (sharedVertex !== null && state.vertices[sharedVertex] !== null) {
        if (state.vertices[sharedVertex].player !== playerId) return false;
      }
      return true;
    });

    return touchesOwnRoad;
  }

  /**
   * Check if player can upgrade an existing settlement to a city.
   */
  function canBuildCity(state, playerId, vertexId) {
    const spot = state.vertices[vertexId];
    if (!spot || spot.player !== playerId || spot.type !== 'settlement') return false;
    const player = state.players[playerId];
    if (!player || player.citiesLeft <= 0) return false;
    return hasResources(player, COSTS.CITY);
  }

  /**
   * Check if player can buy development card.
   */
  function canBuyDevCard(state, playerId) {
    if (!state.devCardDeck || state.devCardDeck.length === 0) return false;
    const player = state.players[playerId];
    if (!player) return false;
    return hasResources(player, COSTS.DEV_CARD);
  }

  function hasResources(player, cost) {
    if (!player || !player.resources) return false;
    for (const [res, count] of Object.entries(cost)) {
      if ((player.resources[res] || 0) < count) return false;
    }
    return true;
  }

  function deductResources(player, cost, bank = null) {
    for (const [res, count] of Object.entries(cost)) {
      player.resources[res] -= count;
      if (bank) {
        bank[res] = (bank[res] || 0) + count;
      }
    }
  }

  function addResources(player, amount, bank = null) {
    for (const [res, count] of Object.entries(amount)) {
      player.resources[res] = (player.resources[res] || 0) + count;
      if (bank && bank[res] !== undefined) {
        bank[res] = Math.max(0, bank[res] - count);
      }
    }
  }

  function countTotalResources(player) {
    if (!player || !player.resources) return 0;
    return Object.values(player.resources).reduce((sum, v) => sum + (v || 0), 0);
  }

  // =========================================================================
  // 8. GAME ACTIONS & MUTATIONS
  // =========================================================================

  /**
   * Build settlement action.
   * In setup round 2 (reverse snake draft), grants starting resources from adjacent productive hexes.
   */
  function buildSettlement(state, playerId, vertexId) {
    const isSetup = state.phase === 'SETUP_SETTLEMENT';
    if (!canBuildSettlement(state, playerId, vertexId, isSetup)) {
      return { valid: false, message: 'Invalid settlement placement' };
    }

    const player = state.players[playerId];
    if (!isSetup) {
      deductResources(player, COSTS.SETTLEMENT, state.bank);
    }

    state.vertices[vertexId] = { player: playerId, type: 'settlement' };
    player.settlementsLeft--;

    // Setup round 2: distribute starting resources
    const isRound2 = isSetup && (player.settlementsLeft === 3); // Placed 2nd settlement
    const startingResources = {};
    if (isRound2) {
      const vObj = getBoardGraph(state).vertices[vertexId];
      for (const hId of vObj.hexIds) {
        const tile = state.tiles[hId];
        if (tile && tile.resource && state.bank[tile.resource] > 0) {
          player.resources[tile.resource] = (player.resources[tile.resource] || 0) + 1;
          state.bank[tile.resource]--;
          startingResources[tile.resource] = (startingResources[tile.resource] || 0) + 1;
        }
      }
    }

    recalculateVictoryPoints(state);

    if (isSetup) {
      state.lastSetupSettlementVertex = vertexId;
      state.phase = 'SETUP_ROAD';
    }

    // Building a settlement may split/interrupt an opponent's road
    checkLongestRoad(state);

    return { valid: true, isSetup, isRound2, startingResources };
  }

  /**
   * Build road action.
   */
  function buildRoad(state, playerId, edgeId, isFree = false) {
    const isSetup = state.phase === 'SETUP_ROAD';
    const setupV = isSetup ? state.lastSetupSettlementVertex : null;

    if (!canBuildRoad(state, playerId, edgeId, isSetup, setupV, isFree)) {
      return { valid: false, message: 'Invalid road placement' };
    }

    const player = state.players[playerId];
    if (!isSetup && !isFree) {
      deductResources(player, COSTS.ROAD, state.bank);
    }

    state.edges[edgeId] = playerId;
    player.roadsLeft--;

    if (isSetup) {
      state.setupIndex++;
      if (state.setupIndex < state.setupOrder.length) {
        state.setupRound = Math.floor(state.setupIndex / state.playerCount) + 1;
        state.activePlayer = state.setupOrder[state.setupIndex];
        state.phase = 'SETUP_SETTLEMENT';
      } else {
        // Setup finished! Round 1 of regular play begins with player 0
        state.setupRound = 0;
        state.activePlayer = 0;
        state.phase = 'ROLL_DICE';
        state.turnCount = 1;
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
    deductResources(player, COSTS.CITY, state.bank);

    state.vertices[vertexId].type = 'city';
    // Replaced settlement is returned to player's piece supply
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
    deductResources(player, COSTS.DEV_CARD, state.bank);

    const card = state.devCardDeck.pop();
    player.devCards.push({
      type: card,
      turnBought: state.turnCount || 0,
      played: false
    });
    player.devCardCount = player.devCards.filter(c => !c.played).length;

    recalculateVictoryPoints(state);
    return { valid: true, card };
  }

  /**
   * Play development card with complete official mechanics.
   */
  function playDevCard(state, playerId, options = {}) {
    if (state.activePlayer !== playerId) {
      return { valid: false, message: 'Can only play development cards on your turn' };
    }

    const player = state.players[playerId];
    let cardIdx = options.cardIdx;
    if (cardIdx === undefined || cardIdx < 0 || cardIdx >= player.devCards.length || player.devCards[cardIdx].played || (options.cardType && player.devCards[cardIdx].type !== options.cardType)) {
      cardIdx = player.devCards.findIndex(c => (!options.cardType || c.type === options.cardType) && !c.played);
    }

    if (cardIdx === -1 || cardIdx >= player.devCards.length) {
      return { valid: false, message: 'Card not found in hand' };
    }

    const card = player.devCards[cardIdx];
    if (card.played) {
      return { valid: false, message: 'Card already played' };
    }

    // Cannot play on turn bought (except VP cards when winning)
    const canWinWithVP = card.type === DEV_CARD_TYPES.VICTORY_POINT && (player.victoryPoints >= (state.targetVictoryPoints || 10));
    if (card.turnBought !== undefined && card.turnBought >= (state.turnCount || 0) && !canWinWithVP) {
      return { valid: false, message: 'Cannot play a card on the turn it was bought' };
    }

    // At most 1 dev card played per turn (except VP cards)
    if (state.devCardPlayedThisTurn && !canWinWithVP) {
      return { valid: false, message: 'Can only play one development card per turn' };
    }

    // 1. KNIGHT: can be played before or after dice roll
    if (card.type === DEV_CARD_TYPES.KNIGHT) {
      card.played = true;
      state.devCardPlayedThisTurn = true;
      player.playedKnights = (player.playedKnights || 0) + 1;
      checkLargestArmy(state, playerId);

      state.phaseBeforeKnight = state.phase;
      state.phase = 'ROBBER_MOVE';
      player.devCardCount = player.devCards.filter(c => !c.played).length;
      return { valid: true, cardType: DEV_CARD_TYPES.KNIGHT };
    }

    // The other dev cards can only be played in PLAYING_TURN phase
    if (state.phase !== 'PLAYING_TURN') {
      return { valid: false, message: 'Action development cards must be played during your action phase' };
    }

    // 2. MONOPOLY: select 1 resource, all other players transfer all cards of that resource
    if (card.type === DEV_CARD_TYPES.MONOPOLY) {
      const targetRes = options.targetResource;
      if (!targetRes || !Object.values(RESOURCES).includes(targetRes)) {
        return { valid: false, message: 'Invalid monopoly resource target' };
      }

      card.played = true;
      state.devCardPlayedThisTurn = true;

      let totalTaken = 0;
      for (const otherP of state.players) {
        if (otherP.id !== playerId) {
          const count = otherP.resources[targetRes] || 0;
          if (count > 0) {
            totalTaken += count;
            otherP.resources[targetRes] = 0;
          }
        }
      }
      player.resources[targetRes] = (player.resources[targetRes] || 0) + totalTaken;
      player.devCardCount = player.devCards.filter(c => !c.played).length;
      return { valid: true, cardType: DEV_CARD_TYPES.MONOPOLY, targetResource: targetRes, totalTaken };
    }

    // 3. YEAR OF PLENTY: choose any 2 resource cards from bank
    if (card.type === DEV_CARD_TYPES.YEAR_OF_PLENTY) {
      const resChoices = options.resources; // e.g. ['lumber', 'ore']
      if (!Array.isArray(resChoices) || resChoices.length === 0 || resChoices.length > 2) {
        return { valid: false, message: 'Year of Plenty requires 1 or 2 resource selections' };
      }

      card.played = true;
      state.devCardPlayedThisTurn = true;

      const taken = [];
      for (const r of resChoices) {
        if (state.bank[r] > 0) {
          state.bank[r]--;
          player.resources[r] = (player.resources[r] || 0) + 1;
          taken.push(r);
        }
      }
      player.devCardCount = player.devCards.filter(c => !c.played).length;
      return { valid: true, cardType: DEV_CARD_TYPES.YEAR_OF_PLENTY, taken };
    }

    // 4. ROAD BUILDING: build up to 2 free roads
    if (card.type === DEV_CARD_TYPES.ROAD_BUILDING) {
      card.played = true;
      state.devCardPlayedThisTurn = true;

      const edge1 = options.edge1;
      const edge2 = options.edge2;
      const builtEdges = [];

      if (edge1 !== undefined && canBuildRoad(state, playerId, edge1, false, null, true)) {
        buildRoad(state, playerId, edge1, true);
        builtEdges.push(edge1);

        if (edge2 !== undefined && canBuildRoad(state, playerId, edge2, false, null, true)) {
          buildRoad(state, playerId, edge2, true);
          builtEdges.push(edge2);
        }
      }
      player.devCardCount = player.devCards.filter(c => !c.played).length;
      return { valid: true, cardType: DEV_CARD_TYPES.ROAD_BUILDING, builtEdges };
    }

    // 5. VICTORY POINT: automatically counted in victory points
    if (card.type === DEV_CARD_TYPES.VICTORY_POINT) {
      if (player.victoryPoints < (state.targetVictoryPoints || 10)) {
        return { valid: false, message: 'Victory point cards are revealed only when winning the game' };
      }
      card.played = true;
      player.devCardCount = player.devCards.filter(c => !c.played).length;
      recalculateVictoryPoints(state);
      return { valid: true, cardType: DEV_CARD_TYPES.VICTORY_POINT };
    }

    return { valid: false, message: 'Unknown development card type' };
  }

  /**
   * Roll Dice (2d6).
   */
  function rollDice(state, forcedRoll = null) {
    if (state.phase !== 'ROLL_DICE') {
      return { valid: false, message: 'Not roll dice phase' };
    }

    const isForced = Array.isArray(forcedRoll) && forcedRoll.length >= 2 && !isNaN(forcedRoll[0]) && !isNaN(forcedRoll[1]);
    const d1 = isForced ? forcedRoll[0] : Math.floor(Math.random() * 6) + 1;
    const d2 = isForced ? forcedRoll[1] : Math.floor(Math.random() * 6) + 1;
    const sum = d1 + d2;

    state.lastDice = [d1, d2];
    state.lastDiceSum = sum;

    if (sum === 7) {
      // Check players holding > 7 resource cards
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

      return { valid: true, dice: [d1, d2], sum, isSeven: true, discardQueue };
    }

    // Produce resources with official finite bank shortage rule
    const production = distributeResourcesForRoll(state, sum);
    state.phase = 'PLAYING_TURN';

    return { valid: true, dice: [d1, d2], sum, production };
  }

  /**
   * Distribute resources for a non-7 roll respecting official bank shortage rules.
   */
  function distributeResourcesForRoll(state, number) {
    const entitlements = {}; // { [resource]: { [playerId]: count } }
    for (const r of Object.values(RESOURCES)) {
      entitlements[r] = {};
    }

    // Calculate entitlements
    const bg = getBoardGraph(state);
    for (const tile of state.tiles) {
      if (tile.number === number && !tile.hasRobber && tile.resource) {
        const hexObj = bg.hexes[tile.id];
        for (const vId of hexObj.vertexIds) {
          const building = state.vertices[vId];
          if (building !== null) {
            const pId = building.player;
            const amount = building.type === 'city' ? 2 : 1;
            entitlements[tile.resource][pId] = (entitlements[tile.resource][pId] || 0) + amount;
          }
        }
      }
    }

    const collected = {};
    for (const p of state.players) collected[p.id] = {};

    // Apply finite bank shortage rules for each resource
    for (const [res, pEntitlements] of Object.entries(entitlements)) {
      const entitledPlayers = Object.keys(pEntitlements);
      if (entitledPlayers.length === 0) continue;

      const totalNeeded = Object.values(pEntitlements).reduce((sum, v) => sum + v, 0);
      const availableInBank = state.bank[res] || 0;

      if (availableInBank >= totalNeeded) {
        // Full distribution
        for (const [pIdStr, count] of Object.entries(pEntitlements)) {
          const pId = parseInt(pIdStr, 10);
          state.players[pId].resources[res] = (state.players[pId].resources[res] || 0) + count;
          state.bank[res] -= count;
          collected[pId][res] = (collected[pId][res] || 0) + count;
        }
      } else {
        // Bank Shortage Rule:
        // If bank doesn't have enough to supply all players, NOBODY gets that resource!
        // If only ONE player is entitled, that single player receives what is available in the bank.
        if (entitledPlayers.length === 1) {
          const pId = parseInt(entitledPlayers[0], 10);
          const give = availableInBank;
          state.players[pId].resources[res] = (state.players[pId].resources[res] || 0) + give;
          state.bank[res] = 0;
          collected[pId][res] = give;
        } else {
          // Shortage: zero cards distributed for this resource
          // state.bank[res] remains unchanged
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
    if (targetHexId < 0 || targetHexId >= state.tiles.length || targetHexId === state.robberHexId) {
      return { valid: false, message: 'Must move robber to a different hex' };
    }

    state.tiles[state.robberHexId].hasRobber = false;
    state.tiles[targetHexId].hasRobber = true;
    state.robberHexId = targetHexId;

    // Find opponents with settlements/cities touching targetHexId who have at least 1 resource card
    const bg = getBoardGraph(state);
    const hexObj = bg.hexes[targetHexId];
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
      resumeAfterRobber(state);
      return { valid: true, targetHexId, canSteal: false };
    }

    state.stealCandidates = stealCandidates;
    state.phase = 'ROBBER_STEAL';
    return { valid: true, targetHexId, canSteal: true, candidates: stealCandidates };
  }

  function resumeAfterRobber(state) {
    if (state.phaseBeforeKnight) {
      state.phase = state.phaseBeforeKnight;
      delete state.phaseBeforeKnight;
    } else {
      state.phase = 'PLAYING_TURN';
    }
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

    const cardPool = [];
    for (const [res, count] of Object.entries(victim.resources)) {
      for (let i = 0; i < count; i++) cardPool.push(res);
    }

    if (cardPool.length === 0) {
      resumeAfterRobber(state);
      return { valid: true, stolen: null };
    }

    const stolen = cardPool[Math.floor(Math.random() * cardPool.length)];
    victim.resources[stolen]--;
    thief.resources[stolen] = (thief.resources[stolen] || 0) + 1;

    resumeAfterRobber(state);
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

    // Deduct from player and return to bank
    for (const [res, count] of Object.entries(discardedResources)) {
      player.resources[res] -= count;
      state.bank[res] = (state.bank[res] || 0) + count;
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
    let bestRatio = 4;
    const bg = getBoardGraph(state);
    const vertCount = state.vertices ? state.vertices.length : (bg.vertices ? bg.vertices.length : 54);
    for (let vId = 0; vId < vertCount; vId++) {
      const b = state.vertices[vId];
      if (b && b.player === playerId) {
        const vObj = bg.vertices[vId];
        if (vObj && vObj.port) {
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
    if (state.phase !== 'PLAYING_TURN') return { valid: false, message: 'Must be your action turn' };
    if (giveResource === getResource) return { valid: false, message: 'Cannot trade same resource' };

    const ratio = getBestTradeRatio(state, playerId, giveResource);
    const player = state.players[playerId];

    if ((player.resources[giveResource] || 0) < ratio) {
      return { valid: false, message: `Need ${ratio} of ${giveResource} to trade with bank` };
    }
    if ((state.bank[getResource] || 0) < 1) {
      return { valid: false, message: `Bank has no ${getResource} left` };
    }

    player.resources[giveResource] -= ratio;
    state.bank[giveResource] = (state.bank[giveResource] || 0) + ratio;

    player.resources[getResource] = (player.resources[getResource] || 0) + 1;
    state.bank[getResource] = Math.max(0, (state.bank[getResource] || 0) - 1);

    return { valid: true, ratio, giveResource, getResource };
  }

  // =========================================================================
  // 9. PLAYER-TO-PLAYER TRADING SYSTEM
  // =========================================================================

  function proposeTrade(state, playerId, tradeDetails) {
    if (state.phase !== 'PLAYING_TURN') return { valid: false, message: 'Must be active player turn' };
    if (state.activePlayer !== playerId) return { valid: false, message: 'Only active player can propose trades' };

    const give = tradeDetails.give || {};
    const receive = tradeDetails.receive || {};

    const totalGive = Object.values(give).reduce((a, b) => a + (b || 0), 0);
    const totalReceive = Object.values(receive).reduce((a, b) => a + (b || 0), 0);

    if (totalGive <= 0 || totalReceive <= 0) {
      return { valid: false, message: 'Trade cannot be one-sided (no gifts allowed)' };
    }

    const player = state.players[playerId];
    for (const [r, count] of Object.entries(give)) {
      if ((player.resources[r] || 0) < count) {
        return { valid: false, message: `Not enough ${r} to offer` };
      }
    }

    const offerId = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    state.tradeOffer = {
      id: offerId,
      fromPlayer: playerId,
      targetPlayer: tradeDetails.targetPlayer !== undefined ? tradeDetails.targetPlayer : null,
      give,
      receive,
      acceptedBy: [],
      rejectedBy: []
    };

    return { valid: true, offer: state.tradeOffer };
  }

  function respondTrade(state, responderId, offerId, accept = true) {
    if (!state.tradeOffer || state.tradeOffer.id !== offerId) {
      return { valid: false, message: 'Trade offer expired or not found' };
    }
    if (state.tradeOffer.fromPlayer === responderId) {
      return { valid: false, message: 'Cannot respond to your own offer' };
    }
    if (state.tradeOffer.targetPlayer !== null && state.tradeOffer.targetPlayer !== responderId) {
      return { valid: false, message: 'Trade was offered to a different player' };
    }

    if (accept) {
      // Verify responder has the requested resources
      const responder = state.players[responderId];
      for (const [r, count] of Object.entries(state.tradeOffer.receive)) {
        if ((responder.resources[r] || 0) < count) {
          return { valid: false, message: `You do not have enough ${r} to accept this trade` };
        }
      }
      if (!state.tradeOffer.acceptedBy.includes(responderId)) {
        state.tradeOffer.acceptedBy.push(responderId);
      }
      state.tradeOffer.rejectedBy = state.tradeOffer.rejectedBy.filter(id => id !== responderId);
    } else {
      if (!state.tradeOffer.rejectedBy.includes(responderId)) {
        state.tradeOffer.rejectedBy.push(responderId);
      }
      state.tradeOffer.acceptedBy = state.tradeOffer.acceptedBy.filter(id => id !== responderId);
    }

    return { valid: true, offer: state.tradeOffer };
  }

  function confirmTrade(state, playerId, offerId, partnerId) {
    if (state.activePlayer !== playerId) return { valid: false, message: 'Only active player can confirm trade' };
    if (!state.tradeOffer || state.tradeOffer.id !== offerId) return { valid: false, message: 'Offer not found' };
    if (!state.tradeOffer.acceptedBy.includes(partnerId)) return { valid: false, message: 'Partner has not accepted offer' };

    const pActive = state.players[playerId];
    const pPartner = state.players[partnerId];

    // Final atomic inventory verification
    for (const [r, count] of Object.entries(state.tradeOffer.give)) {
      if ((pActive.resources[r] || 0) < count) return { valid: false, message: 'Active player no longer has offered resources' };
    }
    for (const [r, count] of Object.entries(state.tradeOffer.receive)) {
      if ((pPartner.resources[r] || 0) < count) return { valid: false, message: 'Partner no longer has requested resources' };
    }

    // Atomic Swap
    for (const [r, count] of Object.entries(state.tradeOffer.give)) {
      pActive.resources[r] -= count;
      pPartner.resources[r] = (pPartner.resources[r] || 0) + count;
    }
    for (const [r, count] of Object.entries(state.tradeOffer.receive)) {
      pPartner.resources[r] -= count;
      pActive.resources[r] = (pActive.resources[r] || 0) + count;
    }

    const executedOffer = state.tradeOffer;
    state.tradeOffer = null;
    return { valid: true, executedOffer, partnerId };
  }

  function cancelTrade(state, playerId) {
    if (!state.tradeOffer) return { valid: true };
    if (state.tradeOffer.fromPlayer !== playerId) return { valid: false, message: 'Only proposer can cancel trade' };
    state.tradeOffer = null;
    return { valid: true };
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

    state.devCardPlayedThisTurn = false;
    state.tradeOffer = null;

    // Special Building Phase for Extended (5-6 player) profile
    if (state.ruleProfile === RULE_PROFILES.EXTENDED && state.phase === 'PLAYING_TURN') {
      state.phase = 'SPECIAL_BUILDING';
      state.specialBuildingTurn = (playerId + 1) % state.playerCount;
      return { valid: true, specialBuilding: true, nextPlayer: state.specialBuildingTurn };
    }

    // Pass turn to next player
    state.activePlayer = (state.activePlayer + 1) % state.playerCount;
    state.phase = 'ROLL_DICE';
    state.turnCount = (state.turnCount || 0) + 1;

    recalculateVictoryPoints(state);
    if (state.winner !== null) {
      state.phase = 'FINISHED';
      return { valid: true, isGameOver: true, winner: state.winner };
    }

    return { valid: true, nextPlayer: state.activePlayer };
  }

  function passSpecialBuilding(state, playerId) {
    if (state.phase !== 'SPECIAL_BUILDING') {
      return { valid: false, message: 'Not in Special Building Phase' };
    }
    if (state.specialBuildingTurn !== playerId) {
      return { valid: false, message: 'Not your turn in Special Building Phase' };
    }

    const nextSeat = (playerId + 1) % state.playerCount;
    if (nextSeat === state.activePlayer) {
      // Completed full circle of special building!
      state.phase = 'ROLL_DICE';
      state.activePlayer = (state.activePlayer + 1) % state.playerCount;
      state.specialBuildingTurn = null;
      state.turnCount = (state.turnCount || 0) + 1;
      return { valid: true, finished: true, nextPlayer: state.activePlayer };
    } else {
      state.specialBuildingTurn = nextSeat;
      return { valid: true, finished: false, nextPlayer: state.specialBuildingTurn };
    }
  }

  // =========================================================================
  // 10. LONGEST ROAD & LARGEST ARMY (Strict Rules)
  // =========================================================================

  /**
   * Calculate Longest Continuous Road for a player using DFS edge-simple trail search.
   * Opponent settlements/cities block trail continuation through that vertex.
   */
  function calculatePlayerRoadLength(state, playerId) {
    const bg = getBoardGraph(state);
    const edgeCount = state.edges ? state.edges.length : (bg.edges ? bg.edges.length : 72);
    const playerEdges = [];
    for (let eId = 0; eId < edgeCount; eId++) {
      if (state.edges[eId] === playerId) {
        playerEdges.push(eId);
      }
    }
    if (playerEdges.length === 0) return 0;

    let maxLength = 0;
    const touchingVertices = new Set();
    for (const eId of playerEdges) {
      if (bg.edges[eId]) {
        touchingVertices.add(bg.edges[eId].v1);
        touchingVertices.add(bg.edges[eId].v2);
      }
    }

    for (const startV of touchingVertices) {
      const visitedEdges = new Set();
      const dfs = (v, depth) => {
        if (depth > maxLength) maxLength = depth;
        const vObj = bg.vertices[v];
        if (!vObj) return;

        for (const eId of vObj.edgeIds) {
          if (state.edges[eId] === playerId && !visitedEdges.has(eId)) {
            const eObj = bg.edges[eId];
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

    const currentHolder = state.longestRoadPlayer;
    let maxLen = currentHolder !== null ? state.players[currentHolder].longestRoadLength : 4; // minimum 5

    // Check if current holder's road dropped below 5 due to an opponent's building
    if (currentHolder !== null && maxLen < 5) {
      state.players[currentHolder].hasLongestRoad = false;
      state.longestRoadPlayer = null;
      currentHolderStateReset();
      return;
    }

    // Challenger must strictly exceed current holder (> maxLen)
    let candidate = currentHolder;
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

    function currentHolderStateReset() {
      // Find eligible leader with >= 5
      let bestP = null;
      let highest = 4;
      let tied = false;
      for (const p of state.players) {
        if (p.longestRoadLength > highest) {
          highest = p.longestRoadLength;
          bestP = p.id;
          tied = false;
        } else if (p.longestRoadLength === highest && highest >= 5) {
          tied = true;
        }
      }
      if (!tied && bestP !== null) {
        state.longestRoadPlayer = bestP;
        state.players[bestP].hasLongestRoad = true;
      } else {
        state.longestRoadPlayer = null;
      }
      recalculateVictoryPoints(state);
    }
  }

  function checkLargestArmy(state, playerId) {
    const player = state.players[playerId];
    const currentHolder = state.largestArmyPlayer;
    const maxArmy = currentHolder !== null ? state.players[currentHolder].playedKnights : 2; // minimum 3

    // Challenger must strictly exceed current holder (> maxArmy)
    if (player.playedKnights > maxArmy) {
      if (currentHolder !== null) {
        state.players[currentHolder].hasLargestArmy = false;
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
      const graph = getBoardGraph(state);
      for (let vId = 0; vId < graph.vertices.length; vId++) {
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

      // Win condition: at least 10 Victory Points on player's own active turn
      if (p.victoryPoints >= 10 && state.winner === null && state.activePlayer === p.id) {
        state.winner = p.id;
        state.phase = 'FINISHED';
      }
    }
  }

  // =========================================================================
  // 11. SECURE CLIENT STATE PROJECTION (Information Hiding)
  // =========================================================================
  function getStateForPlayer(state, viewerSeat) {
    if (!state) return null;

    const projected = {
      version: state.version,
      playerCount: state.playerCount,
      activePlayer: state.activePlayer,
      phase: state.phase,
      setupRound: state.setupRound,
      setupOrder: state.setupOrder ? [...state.setupOrder] : [],
      lastSetupSettlementVertex: state.lastSetupSettlementVertex,
      turnCount: state.turnCount,
      lastDice: state.lastDice,
      lastDiceSum: state.lastDiceSum,
      robberHexId: state.robberHexId,
      discardQueue: state.discardQueue ? state.discardQueue.map(d => ({ playerId: d.playerId, count: d.count })) : [],
      stealCandidates: state.stealCandidates || [],
      longestRoadPlayer: state.longestRoadPlayer,
      largestArmyPlayer: state.largestArmyPlayer,
      winner: state.winner,
      tradeOffer: state.tradeOffer,
      devCardDeckCount: state.devCardDeck ? state.devCardDeck.length : 0,
      bank: { ...state.bank },
      tiles: state.tiles.map(t => ({
        id: t.id,
        terrain: t.terrain,
        resource: t.resource,
        number: t.number,
        pips: t.pips,
        hasRobber: t.hasRobber
      })),
      vertices: [...state.vertices],
      edges: [...state.edges],
      log: state.log ? state.log.slice(-15) : []
    };

    projected.players = state.players.map((p, idx) => {
      const isSelf = viewerSeat !== null && viewerSeat !== undefined && idx === viewerSeat;
      const totalRes = countTotalResources(p);
      const unplayedDevs = p.devCards.filter(c => !c.played);

      // Public VP: settlements (1), cities (2), awards (2 each).
      // VP dev cards are kept hidden until victory.
      let publicVp = 0;
      const graph = getBoardGraph(state);
      for (let vId = 0; vId < graph.vertices.length; vId++) {
        const b = state.vertices[vId];
        if (b && b.player === p.id) publicVp += (b.type === 'city' ? 2 : 1);
      }
      if (p.hasLongestRoad) publicVp += 2;
      if (p.hasLargestArmy) publicVp += 2;

      if (isSelf || state.winner !== null) {
        return {
          id: p.id,
          name: p.name,
          color: p.color,
          colorHex: p.colorHex,
          colorLight: p.colorLight,
          resources: { ...p.resources },
          resourceCount: totalRes,
          devCards: [...p.devCards],
          devCardCount: unplayedDevs.length,
          playedKnights: p.playedKnights,
          victoryPoints: p.victoryPoints,
          settlementsLeft: p.settlementsLeft,
          citiesLeft: p.citiesLeft,
          roadsLeft: p.roadsLeft,
          longestRoadLength: p.longestRoadLength,
          hasLongestRoad: p.hasLongestRoad,
          hasLargestArmy: p.hasLargestArmy
        };
      }

      // Conceal opponents' card identities
      return {
        id: p.id,
        name: p.name,
        color: p.color,
        colorHex: p.colorHex,
        colorLight: p.colorLight,
        resources: {
          [RESOURCES.LUMBER]: 0,
          [RESOURCES.BRICK]: 0,
          [RESOURCES.WOOL]: 0,
          [RESOURCES.GRAIN]: 0,
          [RESOURCES.ORE]: 0
        },
        resourceCount: totalRes,
        devCards: unplayedDevs.map(() => ({ type: 'hidden' })),
        devCardCount: unplayedDevs.length,
        playedKnights: p.playedKnights,
        victoryPoints: publicVp,
        settlementsLeft: p.settlementsLeft,
        citiesLeft: p.citiesLeft,
        roadsLeft: p.roadsLeft,
        longestRoadLength: p.longestRoadLength,
        hasLongestRoad: p.hasLongestRoad,
        hasLargestArmy: p.hasLargestArmy
      };
    });

    return projected;
  }

  // =========================================================================
  // 12. SMART BOT AI DECISION ENGINE
  // =========================================================================

  function evaluateVertexValue(state, vertexId, botId = null, difficulty = 'normal') {
    const graph = getBoardGraph(state);
    const vObj = graph.vertices[vertexId];
    if (!vObj) return -1;

    let score = 0;
    const resources = new Set();

    for (const hId of vObj.hexIds) {
      const tile = state.tiles[hId];
      if (tile && tile.resource) {
        let weight = (tile.pips || 0) * 3;
        // In Hard mode, increase weight of scarce resources based on mapStats
        if (difficulty === 'hard' && state.mapStats && state.mapStats.pips) {
          const totalResourcePips = state.mapStats.pips[tile.resource] || 1;
          if (totalResourcePips <= 6) weight *= 1.4;
        }
        score += weight;
        resources.add(tile.resource);
      }
    }
    // Bonus for resource diversity
    const diversityWeight = difficulty === 'easy' ? 2 : (difficulty === 'hard' ? 6 : 4);
    score += resources.size * diversityWeight;

    if (vObj.port) {
      score += vObj.port.type === 'generic' ? 3 : 5;
    }
    return score;
  }

  function getNeededResources(state, botId) {
    const bot = state.players[botId];
    if (bot.citiesLeft > 0 && bot.settlementsLeft < MAX_PIECES.SETTLEMENTS) {
      const missing = [];
      if ((bot.resources[RESOURCES.ORE] || 0) < 3) missing.push(RESOURCES.ORE);
      if ((bot.resources[RESOURCES.GRAIN] || 0) < 2) missing.push(RESOURCES.GRAIN);
      while (missing.length < 2) missing.push(RESOURCES.ORE);
      return missing.slice(0, 2);
    }
    return [RESOURCES.BRICK, RESOURCES.LUMBER];
  }

  function chooseBotSetupMove(state, botId, difficulty = 'normal') {
    const graph = getBoardGraph(state);

    if (state.phase === 'SETUP_SETTLEMENT') {
      const candidates = [];
      for (let vId = 0; vId < graph.vertices.length; vId++) {
        if (canBuildSettlement(state, botId, vId, true)) {
          const val = evaluateVertexValue(state, vId, botId, difficulty);
          candidates.push({ vertexId: vId, score: val });
        }
      }
      if (candidates.length === 0) return null;
      candidates.sort((a, b) => b.score - a.score);

      if (difficulty === 'easy' && candidates.length > 2) {
        const pick = candidates[Math.floor(Math.random() * Math.min(3, candidates.length))];
        return { action: 'BUILD_SETTLEMENT', vertexId: pick.vertexId };
      }
      return { action: 'BUILD_SETTLEMENT', vertexId: candidates[0].vertexId };
    }

    if (state.phase === 'SETUP_ROAD') {
      const v = state.lastSetupSettlementVertex;
      const vObj = graph.vertices[v];
      if (!vObj) return null;
      const candidates = [];

      for (const eId of vObj.edgeIds) {
        if (canBuildRoad(state, botId, eId, true, v)) {
          const eObj = graph.edges[eId];
          const otherV = eObj.v1 === v ? eObj.v2 : eObj.v1;
          const val = evaluateVertexValue(state, otherV, botId, difficulty);
          candidates.push({ edgeId: eId, score: val });
        }
      }
      if (candidates.length === 0) return null;
      candidates.sort((a, b) => b.score - a.score);

      if (difficulty === 'easy' && candidates.length > 1) {
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        return { action: 'BUILD_ROAD', edgeId: pick.edgeId };
      }
      return { action: 'BUILD_ROAD', edgeId: candidates[0].edgeId };
    }

    return null;
  }

  function chooseBotTurn(state, botId, difficulty = 'normal') {
    const graph = getBoardGraph(state);
    const bot = state.players[botId];
    if (!bot) return { action: 'END_TURN' };

    // 1. ROLL_DICE
    if (state.phase === 'ROLL_DICE') {
      if (!state.devCardPlayedThisTurn && (difficulty === 'normal' || difficulty === 'hard')) {
        const currentRobberHex = graph.hexes[state.robberHexId];
        const isBlockingMe = currentRobberHex && currentRobberHex.vertexIds.some(vid => state.vertices[vid] && state.vertices[vid].player === botId);
        if (isBlockingMe) {
          const knightIdx = bot.devCards.findIndex(c => c.type === DEV_CARD_TYPES.KNIGHT && !c.played && c.turnBought < (state.turnCount || 0));
          if (knightIdx !== -1) {
            return { action: 'PLAY_DEV_CARD', cardType: DEV_CARD_TYPES.KNIGHT, cardIdx: knightIdx };
          }
        }
      }
      return { action: 'ROLL_DICE' };
    }

    // 2. SPECIAL_BUILDING Phase
    if (state.phase === 'SPECIAL_BUILDING') {
      for (let vId = 0; vId < graph.vertices.length; vId++) {
        if (canBuildCity(state, botId, vId)) return { action: 'BUILD_CITY', vertexId: vId };
      }
      for (let vId = 0; vId < graph.vertices.length; vId++) {
        if (canBuildSettlement(state, botId, vId, false)) return { action: 'BUILD_SETTLEMENT', vertexId: vId };
      }
      for (let eId = 0; eId < graph.edges.length; eId++) {
        if (canBuildRoad(state, botId, eId, false)) return { action: 'BUILD_ROAD', edgeId: eId };
      }
      if (canBuyDevCard(state, botId)) return { action: 'BUY_DEV_CARD' };
      return { action: 'PASS_SPECIAL_BUILD' };
    }

    // 3. ROBBER_DISCARD Phase
    if (state.phase === 'ROBBER_DISCARD') {
      const entry = Array.isArray(state.discardQueue) ? state.discardQueue.find(d => d.playerId === botId) : null;
      if (entry && entry.count > 0) {
        const discarded = {};
        let need = entry.count;
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
      return null;
    }

    // 4. ROBBER_MOVE Phase
    if (state.phase === 'ROBBER_MOVE') {
      let bestHex = 0;
      let maxScore = -999;
      const opponents = state.players.filter(p => p.id !== botId);
      const leadingOpponent = opponents.slice().sort((a, b) => b.victoryPoints - a.victoryPoints)[0] || opponents[0];

      for (const tile of state.tiles) {
        if (tile.id !== state.robberHexId && tile.terrain !== TERRAINS.DESERT) {
          const hexObj = graph.hexes[tile.id];
          if (!hexObj) continue;
          const hasLeadOpponent = hexObj.vertexIds.some(vid => state.vertices[vid] && state.vertices[vid].player === (leadingOpponent && leadingOpponent.id));
          const hasAnyOpponent = hexObj.vertexIds.some(vid => state.vertices[vid] && state.vertices[vid].player !== botId && state.vertices[vid].player !== null);
          const hasBot = hexObj.vertexIds.some(vid => state.vertices[vid] && state.vertices[vid].player === botId);

          let score = tile.pips || 0;
          if (hasLeadOpponent) score += (difficulty === 'hard' ? 18 : 10);
          if (hasAnyOpponent) score += 6;
          if (hasBot) score -= (difficulty === 'hard' ? 30 : 15);

          if (difficulty === 'easy') {
            score = hasAnyOpponent ? (hasBot ? 1 : 10) : 0;
          }

          if (score > maxScore) {
            maxScore = score;
            bestHex = tile.id;
          }
        }
      }
      return { action: 'MOVE_ROBBER', hexId: bestHex };
    }

    // 5. ROBBER_STEAL Phase
    if (state.phase === 'ROBBER_STEAL') {
      const candidates = state.stealCandidates || [];
      if (candidates.length === 0) return null;
      if (candidates.length === 1) return { action: 'STEAL_RESOURCE', victimId: candidates[0] };

      let bestVictim = candidates[0];
      let bestScore = -1;
      for (const cId of candidates) {
        const p = state.players[cId];
        const cardCount = countTotalResources(p);
        const score = p.victoryPoints * 10 + cardCount;
        if (score > bestScore) {
          bestScore = score;
          bestVictim = cId;
        }
      }
      return { action: 'STEAL_RESOURCE', victimId: bestVictim };
    }

    // 6. PLAYING_TURN Phase
    if (state.phase === 'PLAYING_TURN') {
      // A. Play unplayed Dev Card if useful
      if (!state.devCardPlayedThisTurn) {
        // Knight
        const knightIdx = bot.devCards.findIndex(c => c.type === DEV_CARD_TYPES.KNIGHT && !c.played && c.turnBought < (state.turnCount || 0));
        if (knightIdx !== -1) {
          const currentRobberHex = graph.hexes[state.robberHexId];
          const isBlockingMe = currentRobberHex && currentRobberHex.vertexIds.some(vid => state.vertices[vid] && state.vertices[vid].player === botId);
          if (isBlockingMe || difficulty === 'hard' || bot.playedKnights >= 2) {
            return { action: 'PLAY_DEV_CARD', cardType: DEV_CARD_TYPES.KNIGHT, cardIdx: knightIdx };
          }
        }

        // Year of Plenty
        const yopIdx = bot.devCards.findIndex(c => c.type === DEV_CARD_TYPES.YEAR_OF_PLENTY && !c.played && c.turnBought < (state.turnCount || 0));
        if (yopIdx !== -1) {
          const needed = getNeededResources(state, botId);
          return { action: 'PLAY_DEV_CARD', cardType: DEV_CARD_TYPES.YEAR_OF_PLENTY, cardIdx: yopIdx, resources: needed };
        }

        // Monopoly
        const monoIdx = bot.devCards.findIndex(c => c.type === DEV_CARD_TYPES.MONOPOLY && !c.played && c.turnBought < (state.turnCount || 0));
        if (monoIdx !== -1) {
          return { action: 'PLAY_DEV_CARD', cardType: DEV_CARD_TYPES.MONOPOLY, cardIdx: monoIdx, resource: RESOURCES.ORE };
        }

        // Road Building
        const rbIdx = bot.devCards.findIndex(c => c.type === DEV_CARD_TYPES.ROAD_BUILDING && !c.played && c.turnBought < (state.turnCount || 0));
        if (rbIdx !== -1 && bot.roadsLeft >= 2) {
          return { action: 'PLAY_DEV_CARD', cardType: DEV_CARD_TYPES.ROAD_BUILDING, cardIdx: rbIdx };
        }
      }

      // B. Build City
      for (let vId = 0; vId < graph.vertices.length; vId++) {
        if (canBuildCity(state, botId, vId)) {
          return { action: 'BUILD_CITY', vertexId: vId };
        }
      }

      // C. Build Settlement
      let bestSettlementV = -1;
      let bestSettlementScore = -1;
      for (let vId = 0; vId < graph.vertices.length; vId++) {
        if (canBuildSettlement(state, botId, vId, false)) {
          const val = evaluateVertexValue(state, vId, botId, difficulty);
          if (val > bestSettlementScore) {
            bestSettlementScore = val;
            bestSettlementV = vId;
          }
        }
      }
      if (bestSettlementV !== -1) {
        return { action: 'BUILD_SETTLEMENT', vertexId: bestSettlementV };
      }

      // D. Build Road towards expansion
      for (let eId = 0; eId < graph.edges.length; eId++) {
        if (canBuildRoad(state, botId, eId, false)) {
          return { action: 'BUILD_ROAD', edgeId: eId };
        }
      }

      // E. Buy Dev Card
      if (canBuyDevCard(state, botId)) {
        return { action: 'BUY_DEV_CARD' };
      }

      // F. Helpful Bank Trade
      const trade = findHelpfulBankTrade(state, botId);
      if (trade) {
        return { action: 'BANK_TRADE', ...trade };
      }

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

      if (missingCount === 1 && missingRes && (state.bank[missingRes] || 0) > 0) {
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
  // 13. EXPORTS
  // =========================================================================
  exports.RULE_PROFILES = RULE_PROFILES;
  exports.PROFILE_DESCRIPTIONS = PROFILE_DESCRIPTIONS;
  exports.DEV_CARD_DECK_COUNTS = DEV_CARD_DECK_COUNTS;
  exports.BANK_START_COUNTS = BANK_START_COUNTS;
  exports.TARGET_VICTORY_POINTS = TARGET_VICTORY_POINTS;
  exports.validateProfilePlayerCount = validateProfilePlayerCount;
  exports.TERRAINS = TERRAINS;
  exports.RESOURCES = RESOURCES;
  exports.RESOURCE_NAMES_FA = RESOURCE_NAMES_FA;
  exports.COSTS = COSTS;
  exports.DEV_CARD_TYPES = DEV_CARD_TYPES;
  exports.PLAYER_COLORS = PLAYER_COLORS;
  exports.NUMBER_PIPS = NUMBER_PIPS;
  exports.OFFICIAL_SPIRAL_TOKENS = OFFICIAL_SPIRAL_TOKENS;
  exports.SPIRAL_HEX_ORDER = SPIRAL_HEX_ORDER;
  exports.BOARD_GRAPH = BOARD_GRAPH;
  exports.BOARD_GRAPHS = BOARD_GRAPHS;
  exports.getBoardGraph = getBoardGraph;
  exports.validateBoardGraph = validateBoardGraph;
  exports.createPrng = createPrng;
  exports.generateHexTiles = generateHexTiles;
  exports.generateMap = generateMap;
  exports.calculateMapStats = calculateMapStats;
  exports.MAP_GENERATOR_VERSION = MAP_GENERATOR_VERSION;
  exports.validateCustomMap = validateCustomMap;
  exports.autoFixMap = autoFixMap;
  exports.createDevCardDeck = createDevCardDeck;
  exports.createInitialState = createInitialState;
  exports.canBuildSettlement = canBuildSettlement;
  exports.canBuildRoad = canBuildRoad;
  exports.canBuildCity = canBuildCity;
  exports.canBuyDevCard = canBuyDevCard;
  exports.buildSettlement = buildSettlement;
  exports.buildRoad = buildRoad;
  exports.buildCity = buildCity;
  exports.buyDevCard = buyDevCard;
  exports.playDevCard = playDevCard;
  exports.rollDice = rollDice;
  exports.moveRobber = moveRobber;
  exports.stealResource = stealResource;
  exports.discardCards = discardCards;
  exports.bankTrade = bankTrade;
  exports.proposeTrade = proposeTrade;
  exports.respondTrade = respondTrade;
  exports.confirmTrade = confirmTrade;
  exports.cancelTrade = cancelTrade;
  exports.getBestTradeRatio = getBestTradeRatio;
  exports.endTurn = endTurn;
  exports.calculatePlayerRoadLength = calculatePlayerRoadLength;
  exports.checkLongestRoad = checkLongestRoad;
  exports.checkLargestArmy = checkLargestArmy;
  exports.recalculateVictoryPoints = recalculateVictoryPoints;
  exports.getStateForPlayer = getStateForPlayer;
  exports.hasResources = hasResources;
  exports.countTotalResources = countTotalResources;
  exports.chooseBotSetupMove = chooseBotSetupMove;
  exports.chooseBotTurn = chooseBotTurn;

  if (typeof window !== 'undefined') {
    window.CatanLogic = exports;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.CatanLogic = exports;
  }
})(typeof exports === 'undefined' ? (typeof window !== 'undefined' ? (window.CatanLogic = {}) : (typeof globalThis !== 'undefined' ? (globalThis.CatanLogic = {}) : (this.CatanLogic = {}))) : exports);
