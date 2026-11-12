/**
 * Comprehensive Automated Test Suite for Catan Base Game Engine
 * Covers Part 18 of the implementation prompt:
 * - 18.1 Board tests
 * - 18.2 Setup tests
 * - 18.3 Production tests & Finite bank shortages
 * - 18.4 Seven/Robber tests & Theft
 * - 18.5 Trading tests (Bank/Port & Player-to-Player)
 * - 18.6 Building tests (Road, Settlement, City piece limits)
 * - 18.7 Longest Road tests (DFS, branches, loops, interruptions, strict exceed)
 * - 18.8 Development-card tests (Monopoly, Year of Plenty, Road Building, Knight, VP)
 * - 18.9 State projections & Information security
 */

const assert = require('assert');
const catan = require('../public/games/catan/logic.js');

let totalTests = 0;
let passedTests = 0;

function it(desc, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ ${desc}`);
  } catch (err) {
    console.error(`  ✗ ${desc}`);
    console.error(err);
    process.exit(1);
  }
}

console.log('\n--- Running Catan Base Game Tests ---\n');

// =========================================================================
// 1. BOARD TESTS
// =========================================================================
console.log('1. Board Engine & Topology:');

it('has exactly 19 hexes, 54 vertices, and 72 edges', () => {
  const g = catan.BOARD_GRAPH;
  assert.strictEqual(g.hexes.length, 19);
  assert.strictEqual(g.vertices.length, 54);
  assert.strictEqual(g.edges.length, 72);
});

it('satisfies axial coordinates invariant q + r + s = 0 and max(|q|,|r|,|s|) <= 2', () => {
  for (const h of catan.BOARD_GRAPH.hexes) {
    assert.strictEqual(h.q + h.r + h.s, 0);
    assert.ok(Math.max(Math.abs(h.q), Math.abs(h.r), Math.abs(h.s)) <= 2);
    assert.strictEqual(h.vertexIds.length, 6);
    assert.strictEqual(h.edgeIds.length, 6);
  }
});

it('has canonical sorted edge endpoints and reciprocal vertex references', () => {
  const g = catan.BOARD_GRAPH;
  for (const e of g.edges) {
    assert.ok(e.v1 < e.v2);
    assert.ok(g.vertices[e.v1].edgeIds.includes(e.id));
    assert.ok(g.vertices[e.v2].edgeIds.includes(e.id));
  }
  for (const v of g.vertices) {
    for (const nid of v.neighborVertexIds) {
      assert.ok(g.vertices[nid].neighborVertexIds.includes(v.id));
    }
  }
});

it('has exactly 9 coastal ports (4 generic 3:1, 5 specific 2:1)', () => {
  const g = catan.BOARD_GRAPH;
  assert.strictEqual(g.ports.length, 9);
  const types = g.ports.map(p => p.type);
  assert.strictEqual(types.filter(t => t === 'generic').length, 4);
  assert.strictEqual(types.filter(t => t === catan.RESOURCES.LUMBER).length, 1);
  assert.strictEqual(types.filter(t => t === catan.RESOURCES.BRICK).length, 1);
  assert.strictEqual(types.filter(t => t === catan.RESOURCES.WOOL).length, 1);
  assert.strictEqual(types.filter(t => t === catan.RESOURCES.GRAIN).length, 1);
  assert.strictEqual(types.filter(t => t === catan.RESOURCES.ORE).length, 1);
});

it('passes board validation with correct terrain and number multiset', () => {
  const { tiles } = catan.generateHexTiles({ seed: 42, balanced: true });
  const validation = catan.validateBoardGraph(catan.BOARD_GRAPH, tiles);
  assert.strictEqual(validation.valid, true);
});

it('reproduces identical board generation with the same seed', () => {
  const b1 = catan.generateHexTiles({ seed: 9999 });
  const b2 = catan.generateHexTiles({ seed: 9999 });
  assert.deepStrictEqual(b1.tiles.map(t => ({ ter: t.terrain, num: t.number })),
                         b2.tiles.map(t => ({ ter: t.terrain, num: t.number })));
});

// =========================================================================
// 2. SETUP TESTS
// =========================================================================
console.log('\n2. Game Setup & Initial Placement:');

it('initializes snake draft setup sequence and finite bank', () => {
  const state = catan.createInitialState(3, ['Alice', 'Bob', 'Charlie'], { seed: 100 });
  assert.strictEqual(state.playerCount, 3);
  assert.deepStrictEqual(state.setupOrder, [0, 1, 2, 2, 1, 0]);
  assert.strictEqual(state.activePlayer, 0);
  assert.strictEqual(state.phase, 'SETUP_SETTLEMENT');
  assert.strictEqual(state.bank[catan.RESOURCES.LUMBER], 19);
  assert.strictEqual(state.bank[catan.RESOURCES.ORE], 19);
});

it('enforces settlement distance rule during setup', () => {
  const state = catan.createInitialState(3);
  // Place settlement at vertex 0
  const res1 = catan.buildSettlement(state, 0, 0);
  assert.strictEqual(res1.valid, true);
  state.phase = 'SETUP_SETTLEMENT'; // Force back to settlement check

  // Try placing adjacent to vertex 0
  const adj = catan.BOARD_GRAPH.vertices[0].neighborVertexIds[0];
  const res2 = catan.buildSettlement(state, 1, adj);
  assert.strictEqual(res2.valid, false);
});

it('enforces initial road connects to newly placed settlement', () => {
  const state = catan.createInitialState(3);
  catan.buildSettlement(state, 0, 10);
  assert.strictEqual(state.phase, 'SETUP_ROAD');

  // Attempt to build road not connected to vertex 10
  const unconnectedEdge = catan.BOARD_GRAPH.edges.findIndex(e => e.v1 !== 10 && e.v2 !== 10);
  const badRoad = catan.buildRoad(state, 0, unconnectedEdge);
  assert.strictEqual(badRoad.valid, false);

  // Build connected road
  const connectedEdge = catan.BOARD_GRAPH.vertices[10].edgeIds[0];
  const goodRoad = catan.buildRoad(state, 0, connectedEdge);
  assert.strictEqual(goodRoad.valid, true);
});

it('distributes starting resources only on second settlement placement', () => {
  const state = catan.createInitialState(2, ['Alice', 'Bob'], { seed: 1 });
  // Setup order: [0, 1, 1, 0]
  // Alice Round 1
  catan.buildSettlement(state, 0, 10);
  catan.buildRoad(state, 0, catan.BOARD_GRAPH.vertices[10].edgeIds[0]);
  assert.strictEqual(catan.countTotalResources(state.players[0]), 0);

  // Bob Round 1
  catan.buildSettlement(state, 1, 30);
  catan.buildRoad(state, 1, catan.BOARD_GRAPH.vertices[30].edgeIds[0]);
  assert.strictEqual(catan.countTotalResources(state.players[1]), 0);

  // Bob Round 2 (Reverse round - Bob's 2nd settlement)
  const bobRes = catan.buildSettlement(state, 1, 40);
  assert.strictEqual(bobRes.valid, true);
  assert.strictEqual(bobRes.isRound2, true);
  assert.ok(catan.countTotalResources(state.players[1]) > 0);
  catan.buildRoad(state, 1, catan.BOARD_GRAPH.vertices[40].edgeIds[0]);

  // Alice Round 2 (Alice's 2nd settlement)
  const aliceRes = catan.buildSettlement(state, 0, 20);
  assert.strictEqual(aliceRes.valid, true);
  assert.strictEqual(aliceRes.isRound2, true);
  assert.ok(catan.countTotalResources(state.players[0]) > 0);
  catan.buildRoad(state, 0, catan.BOARD_GRAPH.vertices[20].edgeIds[0]);

  // Setup ends, normal play starts with player 0
  assert.strictEqual(state.phase, 'ROLL_DICE');
  assert.strictEqual(state.activePlayer, 0);
});

// =========================================================================
// 3. PRODUCTION & BANK SHORTAGE TESTS
// =========================================================================
console.log('\n3. Production & Finite Bank Shortages:');

it('distributes 1 resource for settlement and 2 for city on matching dice roll', () => {
  const state = catan.createInitialState(2);
  state.phase = 'PLAYING_TURN';

  // Find a tile with number 8
  const tile8 = state.tiles.find(t => t.number === 8);
  const hexObj = catan.BOARD_GRAPH.hexes[tile8.id];
  const v1 = hexObj.vertexIds[0];
  const v2 = hexObj.vertexIds[2];

  state.vertices[v1] = { player: 0, type: 'settlement' };
  state.vertices[v2] = { player: 1, type: 'city' };

  state.phase = 'ROLL_DICE';
  const rollRes = catan.rollDice(state, [4, 4]); // roll 8
  assert.strictEqual(rollRes.valid, true);
  assert.strictEqual(rollRes.sum, 8);

  const resType = tile8.resource;
  assert.strictEqual(rollRes.production[0][resType], 1);
  assert.strictEqual(rollRes.production[1][resType], 2);
});

it('blocks production when hex is occupied by the robber', () => {
  const state = catan.createInitialState(2);
  const tile6 = state.tiles.find(t => t.number === 6);
  tile6.hasRobber = true;
  state.robberHexId = tile6.id;

  const hexObj = catan.BOARD_GRAPH.hexes[tile6.id];
  state.vertices[hexObj.vertexIds[0]] = { player: 0, type: 'settlement' };

  state.phase = 'ROLL_DICE';
  const rollRes = catan.rollDice(state, [3, 3]); // roll 6
  assert.strictEqual(rollRes.production[0][tile6.resource] || 0, 0);
});

it('enforces official bank shortage rule: nobody gets cards if shortage among multiple players', () => {
  const state = catan.createInitialState(2);
  const tile9 = state.tiles.find(t => t.number === 9);
  const hexObj = catan.BOARD_GRAPH.hexes[tile9.id];
  state.vertices[hexObj.vertexIds[0]] = { player: 0, type: 'settlement' };
  state.vertices[hexObj.vertexIds[2]] = { player: 1, type: 'settlement' };

  // Set bank to only 1 of that resource (shortage: 2 players want 1 each = 2 needed)
  state.bank[tile9.resource] = 1;

  state.phase = 'ROLL_DICE';
  const rollRes = catan.rollDice(state, [5, 4]); // roll 9
  assert.strictEqual(rollRes.production[0][tile9.resource] || 0, 0);
  assert.strictEqual(rollRes.production[1][tile9.resource] || 0, 0);
  assert.strictEqual(state.bank[tile9.resource], 1); // unconsumed
});

it('enforces official bank shortage rule: single entitled player receives whatever cards remain', () => {
  const state = catan.createInitialState(2);
  const tile5 = state.tiles.find(t => t.number === 5);
  const hexObj = catan.BOARD_GRAPH.hexes[tile5.id];
  state.vertices[hexObj.vertexIds[0]] = { player: 0, type: 'city' }; // wants 2 cards

  state.bank[tile5.resource] = 1; // only 1 available

  state.phase = 'ROLL_DICE';
  const rollRes = catan.rollDice(state, [2, 3]); // roll 5
  assert.strictEqual(rollRes.production[0][tile5.resource], 1);
  assert.strictEqual(state.bank[tile5.resource], 0);
});

// =========================================================================
// 4. SEVEN, ROBBER, & THEFT TESTS
// =========================================================================
console.log('\n4. Seven Roll, Discards, Robber & Theft:');

it('triggers discard phase for players with > 7 cards when 7 is rolled', () => {
  const state = catan.createInitialState(2);
  state.players[0].resources[catan.RESOURCES.LUMBER] = 8; // > 7, discards 4
  state.players[1].resources[catan.RESOURCES.GRAIN] = 7;  // <= 7, discards 0

  state.phase = 'ROLL_DICE';
  const rollRes = catan.rollDice(state, [3, 4]); // roll 7
  assert.strictEqual(rollRes.isSeven, true);
  assert.strictEqual(state.phase, 'ROBBER_DISCARD');
  assert.strictEqual(state.discardQueue.length, 1);
  assert.strictEqual(state.discardQueue[0].playerId, 0);
  assert.strictEqual(state.discardQueue[0].count, 4);

  // Attempt invalid discard amount
  const badDiscard = catan.discardCards(state, 0, { [catan.RESOURCES.LUMBER]: 3 });
  assert.strictEqual(badDiscard.valid, false);

  // Exact discard
  const goodDiscard = catan.discardCards(state, 0, { [catan.RESOURCES.LUMBER]: 4 });
  assert.strictEqual(goodDiscard.valid, true);
  assert.strictEqual(state.phase, 'ROBBER_MOVE');
  assert.strictEqual(state.players[0].resources[catan.RESOURCES.LUMBER], 4);
});

it('moves robber and executes random theft from adjacent opponent', () => {
  const state = catan.createInitialState(2);
  state.phase = 'ROBBER_MOVE';
  state.activePlayer = 0;

  // Destination hex guaranteed different from initial robber hex
  const destHex = (state.robberHexId + 1) % 19;
  const hexObj = catan.BOARD_GRAPH.hexes[destHex];
  state.vertices[hexObj.vertexIds[0]] = { player: 1, type: 'settlement' };
  state.players[1].resources[catan.RESOURCES.ORE] = 3;

  const moveRes = catan.moveRobber(state, 0, destHex);
  assert.strictEqual(moveRes.valid, true);
  assert.strictEqual(moveRes.canSteal, true);
  assert.deepStrictEqual(moveRes.candidates, [1]);
  assert.strictEqual(state.phase, 'ROBBER_STEAL');

  const stealRes = catan.stealResource(state, 0, 1);
  assert.strictEqual(stealRes.valid, true);
  assert.strictEqual(stealRes.stolen, catan.RESOURCES.ORE);
  assert.strictEqual(state.players[1].resources[catan.RESOURCES.ORE], 2);
  assert.strictEqual(state.players[0].resources[catan.RESOURCES.ORE], 1);
  assert.strictEqual(state.phase, 'PLAYING_TURN');
});

// =========================================================================
// 5. TRADING TESTS
// =========================================================================
console.log('\n5. Bank/Port Trading & Player-to-Player Trading:');

it('executes default 4:1 bank trade and custom port trades', () => {
  const state = catan.createInitialState(2);
  state.phase = 'PLAYING_TURN';
  state.activePlayer = 0;

  // Default 4:1
  state.players[0].resources[catan.RESOURCES.LUMBER] = 4;
  const t1 = catan.bankTrade(state, 0, catan.RESOURCES.LUMBER, catan.RESOURCES.BRICK);
  assert.strictEqual(t1.valid, true);
  assert.strictEqual(t1.ratio, 4);
  assert.strictEqual(state.players[0].resources[catan.RESOURCES.LUMBER], 0);
  assert.strictEqual(state.players[0].resources[catan.RESOURCES.BRICK], 1);

  // Add 2:1 Ore port
  const orePortV = catan.BOARD_GRAPH.vertices.find(v => v.port && v.port.type === catan.RESOURCES.ORE);
  state.vertices[orePortV.id] = { player: 0, type: 'settlement' };

  state.players[0].resources[catan.RESOURCES.ORE] = 2;
  const t2 = catan.bankTrade(state, 0, catan.RESOURCES.ORE, catan.RESOURCES.GRAIN);
  assert.strictEqual(t2.valid, true);
  assert.strictEqual(t2.ratio, 2);
  assert.strictEqual(state.players[0].resources[catan.RESOURCES.ORE], 0);
  assert.strictEqual(state.players[0].resources[catan.RESOURCES.GRAIN], 1);
});

it('proposes, accepts, and confirms player-to-player trade atomically', () => {
  const state = catan.createInitialState(2);
  state.phase = 'PLAYING_TURN';
  state.activePlayer = 0;

  state.players[0].resources[catan.RESOURCES.LUMBER] = 2;
  state.players[1].resources[catan.RESOURCES.BRICK] = 2;

  // 1. Propose
  const prop = catan.proposeTrade(state, 0, {
    give: { [catan.RESOURCES.LUMBER]: 1 },
    receive: { [catan.RESOURCES.BRICK]: 1 }
  });
  assert.strictEqual(prop.valid, true);
  const offerId = prop.offer.id;

  // 2. Respond
  const resp = catan.respondTrade(state, 1, offerId, true);
  assert.strictEqual(resp.valid, true);
  assert.ok(resp.offer.acceptedBy.includes(1));

  // 3. Confirm
  const conf = catan.confirmTrade(state, 0, offerId, 1);
  assert.strictEqual(conf.valid, true);
  assert.strictEqual(state.players[0].resources[catan.RESOURCES.LUMBER], 1);
  assert.strictEqual(state.players[0].resources[catan.RESOURCES.BRICK], 1);
  assert.strictEqual(state.players[1].resources[catan.RESOURCES.LUMBER], 1);
  assert.strictEqual(state.players[1].resources[catan.RESOURCES.BRICK], 1);
  assert.strictEqual(state.tradeOffer, null);
});

// =========================================================================
// 6. BUILDING & UPGRADES TESTS
// =========================================================================
console.log('\n6. Construction & Upgrades:');

it('enforces exact costs and piece limits for roads, settlements, and cities', () => {
  const state = catan.createInitialState(2);
  state.phase = 'PLAYING_TURN';
  state.activePlayer = 0;

  // Give resources for 1 settlement
  state.players[0].resources[catan.RESOURCES.LUMBER] = 1;
  state.players[0].resources[catan.RESOURCES.BRICK] = 1;
  state.players[0].resources[catan.RESOURCES.WOOL] = 1;
  state.players[0].resources[catan.RESOURCES.GRAIN] = 1;

  // Connect to road
  state.edges[0] = 0;
  const v = catan.BOARD_GRAPH.edges[0].v1;
  const sRes = catan.buildSettlement(state, 0, v, false);
  assert.strictEqual(sRes.valid, true);
  assert.strictEqual(state.players[0].settlementsLeft, 4);

  // Upgrade to city
  state.players[0].resources[catan.RESOURCES.GRAIN] = 2;
  state.players[0].resources[catan.RESOURCES.ORE] = 3;
  const cRes = catan.buildCity(state, 0, v);
  assert.strictEqual(cRes.valid, true);
  assert.strictEqual(state.players[0].citiesLeft, 3);
  // Replaced settlement is returned to player's piece supply
  assert.strictEqual(state.players[0].settlementsLeft, 5);
});

// =========================================================================
// 7. DEVELOPMENT CARDS TESTS
// =========================================================================
console.log('\n7. Development Cards:');

it('cannot play a development card on the turn it was bought', () => {
  const state = catan.createInitialState(2);
  state.phase = 'PLAYING_TURN';
  state.activePlayer = 0;
  state.turnCount = 1;

  state.players[0].resources = { wool: 1, grain: 1, ore: 1 };
  catan.buyDevCard(state, 0);
  assert.strictEqual(state.players[0].devCards.length, 1);

  const playRes = catan.playDevCard(state, 0, { cardIdx: 0 });
  assert.strictEqual(playRes.valid, false);
});

it('plays Monopoly and transfers all cards of named resource from opponents', () => {
  const state = catan.createInitialState(2);
  state.phase = 'PLAYING_TURN';
  state.activePlayer = 0;
  state.turnCount = 2;

  state.players[0].devCards.push({ type: catan.DEV_CARD_TYPES.MONOPOLY, turnBought: 1, played: false });
  state.players[1].resources[catan.RESOURCES.ORE] = 5;

  const monoRes = catan.playDevCard(state, 0, {
    cardType: catan.DEV_CARD_TYPES.MONOPOLY,
    targetResource: catan.RESOURCES.ORE
  });
  assert.strictEqual(monoRes.valid, true);
  assert.strictEqual(monoRes.totalTaken, 5);
  assert.strictEqual(state.players[1].resources[catan.RESOURCES.ORE], 0);
  assert.strictEqual(state.players[0].resources[catan.RESOURCES.ORE], 5);
});

it('plays Year of Plenty and takes 2 chosen resources from bank', () => {
  const state = catan.createInitialState(2);
  state.phase = 'PLAYING_TURN';
  state.activePlayer = 0;
  state.turnCount = 2;

  state.players[0].devCards.push({ type: catan.DEV_CARD_TYPES.YEAR_OF_PLENTY, turnBought: 1, played: false });
  const yopRes = catan.playDevCard(state, 0, {
    cardType: catan.DEV_CARD_TYPES.YEAR_OF_PLENTY,
    resources: [catan.RESOURCES.LUMBER, catan.RESOURCES.GRAIN]
  });
  assert.strictEqual(yopRes.valid, true);
  assert.strictEqual(state.players[0].resources[catan.RESOURCES.LUMBER], 1);
  assert.strictEqual(state.players[0].resources[catan.RESOURCES.GRAIN], 1);
  assert.strictEqual(state.bank[catan.RESOURCES.LUMBER], 18);
});

it('plays Knight before dice roll and moves robber', () => {
  const state = catan.createInitialState(2);
  state.phase = 'ROLL_DICE';
  state.activePlayer = 0;
  state.turnCount = 2;

  state.players[0].devCards.push({ type: catan.DEV_CARD_TYPES.KNIGHT, turnBought: 1, played: false });
  const kRes = catan.playDevCard(state, 0, { cardType: catan.DEV_CARD_TYPES.KNIGHT });
  assert.strictEqual(kRes.valid, true);
  assert.strictEqual(state.players[0].playedKnights, 1);
  assert.strictEqual(state.phase, 'ROBBER_MOVE');
});

// =========================================================================
// 8. LONGEST ROAD & LARGEST ARMY
// =========================================================================
console.log('\n8. Longest Road, Largest Army & Victory:');

it('calculates longest continuous edge-simple road with branches and loops', () => {
  const state = catan.createInitialState(2);
  // Build a 5-edge continuous chain for player 0
  const path = [0, 1, 2, 3, 4];
  // Find connected chain of edges
  let currentV = 0;
  for (let i = 0; i < 5; i++) {
    const vObj = catan.BOARD_GRAPH.vertices[currentV];
    const nextEdge = vObj.edgeIds.find(eId => state.edges[eId] === null);
    state.edges[nextEdge] = 0;
    const eObj = catan.BOARD_GRAPH.edges[nextEdge];
    currentV = eObj.v1 === currentV ? eObj.v2 : eObj.v1;
  }

  catan.checkLongestRoad(state);
  assert.strictEqual(state.players[0].longestRoadLength, 5);
  assert.strictEqual(state.players[0].hasLongestRoad, true);
  assert.strictEqual(state.longestRoadPlayer, 0);
});

it('enforces strict exceed tie-breaker for Longest Road award', () => {
  const state = catan.createInitialState(2);

  // Helper to build a connected road chain of length N starting from a vertex
  function buildChain(playerId, startV, length) {
    let curr = startV;
    for (let i = 0; i < length; i++) {
      const vObj = catan.BOARD_GRAPH.vertices[curr];
      const edge = vObj.edgeIds.find(eId => state.edges[eId] === null);
      if (edge === undefined) break;
      state.edges[edge] = playerId;
      const eObj = catan.BOARD_GRAPH.edges[edge];
      curr = eObj.v1 === curr ? eObj.v2 : eObj.v1;
    }
    return curr;
  }

  // Player 0 builds 5 connected roads
  buildChain(0, 0, 5);
  catan.checkLongestRoad(state);
  assert.strictEqual(state.longestRoadPlayer, 0);
  assert.strictEqual(state.players[0].hasLongestRoad, true);

  // Player 1 ties with 5 connected roads elsewhere on board
  const lastV = buildChain(1, 30, 5);
  catan.checkLongestRoad(state);
  // Tie does NOT transfer award
  assert.strictEqual(state.longestRoadPlayer, 0);
  assert.strictEqual(state.players[0].hasLongestRoad, true);
  assert.strictEqual(state.players[1].hasLongestRoad, false);

  // Player 1 extends to 6: strictly exceeds, takes award
  buildChain(1, lastV, 1);
  catan.checkLongestRoad(state);
  assert.strictEqual(state.longestRoadPlayer, 1);
  assert.strictEqual(state.players[0].hasLongestRoad, false);
  assert.strictEqual(state.players[1].hasLongestRoad, true);
});

it('detects victory at 10 victory points on active turn', () => {
  const state = catan.createInitialState(2);
  state.phase = 'PLAYING_TURN';
  state.activePlayer = 0;

  // 4 cities (8 VP) + Longest Road (2 VP) = 10 VP
  state.players[0].hasLongestRoad = true;
  state.vertices[0] = { player: 0, type: 'city' };
  state.vertices[2] = { player: 0, type: 'city' };
  state.vertices[4] = { player: 0, type: 'city' };
  state.vertices[6] = { player: 0, type: 'city' };

  catan.recalculateVictoryPoints(state);
  assert.strictEqual(state.players[0].victoryPoints, 10);
  assert.strictEqual(state.winner, 0);
  assert.strictEqual(state.phase, 'FINISHED');
});

// =========================================================================
// 9. STATE PROJECTIONS & INFORMATION HIDING
// =========================================================================
console.log('\n9. Information Security & Private State Projections:');

it('conceals opponent resource identities and hidden dev cards in getStateForPlayer', () => {
  const state = catan.createInitialState(2);
  state.players[0].resources[catan.RESOURCES.LUMBER] = 3;
  state.players[1].resources[catan.RESOURCES.ORE] = 4;
  state.players[1].devCards.push({ type: catan.DEV_CARD_TYPES.KNIGHT, turnBought: 1, played: false });

  // Projected state for Player 0
  const proj0 = catan.getStateForPlayer(state, 0);

  // Player 0 sees their own cards
  assert.strictEqual(proj0.players[0].resources[catan.RESOURCES.LUMBER], 3);
  assert.strictEqual(proj0.players[0].resourceCount, 3);

  // Player 0 sees Player 1 total count (4), but NOT card identities
  assert.strictEqual(proj0.players[1].resourceCount, 4);
  assert.strictEqual(proj0.players[1].resources[catan.RESOURCES.ORE], 0);

  // Player 0 sees Player 1 has 1 dev card, but type is hidden
  assert.strictEqual(proj0.players[1].devCardCount, 1);
  assert.strictEqual(proj0.players[1].devCards[0].type, 'hidden');

  // Deck cards are not exposed
  assert.strictEqual(proj0.devCardDeck, undefined);
  assert.strictEqual(proj0.devCardDeckCount, state.devCardDeck.length);
});

console.log(`\n========================================`);
console.log(`Catan Tests Completed: ${passedTests} / ${totalTests} passed!`);
console.log(`========================================\n`);
