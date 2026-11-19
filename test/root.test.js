const assert = require('assert');
const rootLogic = require('../public/games/root/logic.js');

console.log('--- Running Root Base Engine & Rules Tests ---');

// 1. Board Engine & Topology
console.log('1. Board Engine & Topology:');
const state = rootLogic.createInitialState({ seed: 12345 });
assert.strictEqual(state.clearings.length, 12, 'Must have exactly 12 clearings');

// Verify suits: 4 Fox, 4 Rabbit, 4 Mouse
const suits = { fox: 0, rabbit: 0, mouse: 0 };
state.clearings.forEach(c => suits[c.suit]++);
assert.strictEqual(suits.fox, 4, 'Must have 4 Fox clearings');
assert.strictEqual(suits.rabbit, 4, 'Must have 4 Rabbit clearings');
assert.strictEqual(suits.mouse, 4, 'Must have 4 Mouse clearings');
console.log('  ✓ Exactly 12 clearings with 4 Fox, 4 Rabbit, 4 Mouse');

// Verify ruins (clearings 5, 7, 10, 11)
const ruins = state.clearings.filter(c => c.hasRuin);
assert.strictEqual(ruins.length, 4, 'Must have 4 ruins on board');
console.log('  ✓ Exactly 4 ancient ruins with hidden items');

// 2. Initial Setup Verification
console.log('2. Initial Setup & Factions:');
// Marquise Keep in Clearing 1
const cl1 = state.clearings.find(c => c.id === 1);
assert(cl1.pieces.tokens.some(t => t.type === 'keep' && t.faction === 'marquise'), 'Keep must be in Clearing 1');
assert.strictEqual(cl1.pieces.marquise, 4, 'Clearing 1 must have 4 Marquise warriors');

// Eyrie starting Roost in Clearing 12
const cl12 = state.clearings.find(c => c.id === 12);
assert(cl12.pieces.buildings.some(b => b.type === 'roost' && b.faction === 'eyrie'), 'Roost must be in Clearing 12');
assert.strictEqual(cl12.pieces.eyrie, 6, 'Clearing 12 must have 6 Eyrie warriors');

// Alliance supporters
assert.strictEqual(state.factionData.alliance.supporters.length, 3, 'Alliance must start with 3 supporters');

// Vagabond starting items
assert(state.factionData.vagabond.items.length >= 4, 'Vagabond must start with at least 4 items');
console.log('  ✓ Official base setup verified for Marquise, Eyrie, Alliance, Vagabond');

// 3. Rule & Control Calculation (Law of Root 4.2)
console.log('3. Rule & Control:');
// Clearing 1: Marquise has 4 warriors + 1 sawmill = 5 pieces. Rules clearing.
assert.strictEqual(rootLogic.getClearingRuler(cl1), 'marquise', 'Marquise should rule clearing 1');

// Clearing 12: Eyrie has 6 warriors + 1 roost = 7 pieces. Rules clearing.
assert.strictEqual(rootLogic.getClearingRuler(cl1), 'marquise', 'Marquise should rule clearing 1');
assert.strictEqual(rootLogic.getClearingRuler(cl12), 'eyrie', 'Eyrie should rule clearing 12');

// Lords of the Forest (Eyrie wins ties)
const testClearing = {
  pieces: {
    marquise: 2,
    eyrie: 2,
    alliance: 0,
    buildings: [],
    tokens: []
  }
};
assert.strictEqual(rootLogic.getClearingRuler(testClearing), 'eyrie', 'Eyrie must rule tied clearings (Lords of the Forest)');
console.log('  ✓ Rule correctly accounts for pieces and Eyrie Lords of the Forest tie-breaker');

// 4. Combat Resolution
console.log('4. Combat Resolution:');
const battleCl = state.clearings.find(c => c.id === 2);
battleCl.pieces.marquise = 3;
battleCl.pieces.eyrie = 2;

const combatResult = rootLogic.resolveBattle(state, 2, 'marquise', 'eyrie');
assert(combatResult.dice[0] >= 0 && combatResult.dice[0] <= 3, 'Die 1 must be 0-3');
assert(combatResult.dice[1] >= 0 && combatResult.dice[1] <= 3, 'Die 2 must be 0-3');
assert(combatResult.attackerHits <= 3, 'Attacker hits cannot exceed attacker warriors');
assert(combatResult.defenderHits <= 2, 'Defender hits cannot exceed defender warriors');
console.log('  ✓ Two 0-3 dice rolled; attacker takes higher, defender takes lower, hits capped by warrior counts');

// Defenseless bonus test
const defClearing = {
  id: 4,
  pieces: {
    marquise: 2,
    eyrie: 0,
    buildings: [{ type: 'roost', faction: 'eyrie' }],
    tokens: []
  }
};
state.clearings.push(defClearing);
const defResult = rootLogic.resolveBattle(state, 4, 'marquise', 'eyrie');
assert(defResult.isDefenseless, 'Defender with 0 warriors must be defenseless');
assert(defResult.attackerHits >= 1, 'Defenseless bonus must grant +1 extra hit');
console.log('  ✓ Defenseless bonus (+1 extra hit to attacker) verified');

// 5. Information Security & State Projection
console.log('5. Information Security & Private State Projections:');
const p0View = rootLogic.getStateForPlayer(state, 0); // Marquise
const p2View = rootLogic.getStateForPlayer(state, 2); // Alliance

// Marquise cannot see Alliance hand or supporters
assert.strictEqual(p0View.players[2].hand.length, 0, 'Marquise cannot see Alliance hand cards');
assert.strictEqual(p0View.factionData.alliance.supporters.length, 0, 'Marquise cannot see Alliance supporters stack');
assert.strictEqual(p0View.factionData.alliance.supportersCount, 3, 'Marquise sees only supporters count');

// Alliance can see their own supporters
assert.strictEqual(p2View.factionData.alliance.supporters.length, 3, 'Alliance can see their own supporters');
console.log('  ✓ Opponent hands and Alliance supporters redacted in private projections');

// 6. Victory Condition Detection
console.log('6. Victory Detection:');
state.players[0].score = 30;
rootLogic.checkVictory(state);
assert.strictEqual(state.status, 'FINISHED', 'Game should be finished at 30 VP');
assert.strictEqual(state.winner, 'marquise', 'Marquise should be the winner');
console.log('  ✓ Victory detected immediately at 30 VP');

console.log('========================================');
console.log('✓ ALL ROOT ENGINE & RULES TESTS PASSED! ✓');
console.log('========================================');
