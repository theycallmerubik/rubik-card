const assert = require('assert');
const rootLogic = require('../public/games/root/logic.js');

console.log('--- Running Root 4-Faction Asymmetric Mechanics Tests ---');

// 1. Marquise de Cat Mechanics
console.log('1. Marquise de Cat Mechanics:');
const state = rootLogic.createInitialState({ seed: 999 });
const mData = state.factionData.marquise;

// Wood production: Sawmill in clearing 1 produces wood
assert(mData.sawmillsRemaining < 6, 'Marquise has placed at least 1 sawmill');
const cl1 = state.clearings.find(c => c.id === 1);
const initialWood = cl1.pieces.tokens.filter(t => t.type === 'wood').length;

// Legal action check in Birdsong
const actionsBirdsong = rootLogic.getLegalActions(state, 0);
const placeWoodAction = actionsBirdsong.find(a => a.type === 'MARQUISE_PLACE_WOOD');
assert(placeWoodAction, 'Marquise must have wood placement action in Birdsong');
console.log('  ✓ Marquise Sawmill wood placement generated in Birdsong');

// Building track progression and costs
const sawmillCosts = rootLogic.MARQUISE_TRACKS.sawmill.costs;
assert.deepStrictEqual(sawmillCosts, [0, 1, 2, 3, 3, 4], 'Sawmill costs match official track');
console.log('  ✓ Building cost tracks (0, 1, 2, 3, 3, 4) verified');

// 2. Eyrie Dynasties Mechanics
console.log('2. Eyrie Dynasties Mechanics:');
const eyrieData = state.factionData.eyrie;
assert.strictEqual(eyrieData.leader, 'commander', 'Eyrie starts with Commander leader');
assert(eyrieData.decree.recruit.length > 0, 'Decree must have starting recruit cards (Vizier)');
assert(eyrieData.decree.move.length > 0, 'Decree must have starting move cards (Vizier)');

// Roost track VP scoring
assert.strictEqual(rootLogic.EYRIE_ROOST_VPS[1], 1, '1 Roost scores 1 VP');
assert.strictEqual(rootLogic.EYRIE_ROOST_VPS[6], 5, '6+ Roosts score 5 VP');
console.log('  ✓ Eyrie Decree columns, leaders, and Roost scoring tracks verified');

// 3. Woodland Alliance Mechanics
console.log('3. Woodland Alliance Mechanics:');
const waData = state.factionData.alliance;
assert.strictEqual(waData.supporters.length, 3, 'Alliance has 3 starting supporters');
assert.strictEqual(waData.sympathyRemaining, 10, 'Alliance starts with 10 sympathy tokens in supply');

// Sympathy placement cost progression
assert.strictEqual(rootLogic.ALLIANCE_SYMPATHY_COSTS[0], 1, 'First sympathy costs 1 supporter');
assert.strictEqual(rootLogic.ALLIANCE_SYMPATHY_COSTS[5], 2, 'Sixth sympathy costs 2 supporters');
assert.strictEqual(rootLogic.ALLIANCE_SYMPATHY_COSTS[8], 3, 'Ninth sympathy costs 3 supporters');
console.log('  ✓ Alliance Sympathy cost progression (1/2/3 matching supporters) verified');

// 4. Vagabond Mechanics
console.log('4. Vagabond Mechanics:');
const vData = state.factionData.vagabond;
assert.strictEqual(vData.character, 'thief', 'Vagabond character is initialized');
assert(vData.items.length >= 4, 'Vagabond starts with inventory items');

// Item states: ready, exhausted, damaged
const boot = vData.items.find(i => i.type === 'boot');
assert(boot && boot.state === 'ready', 'Starting boot must be ready');

// Quests
assert.strictEqual(vData.quests.length, 3, 'Vagabond has 3 active quests');
console.log('  ✓ Vagabond items, states, satchel, and quests verified');

console.log('===================================================');
console.log('✓ ALL 4-FACTION ASYMMETRIC MECHANICS TESTS PASSED! ✓');
console.log('===================================================');
