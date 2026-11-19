const assert = require('assert');
const CatanLogic = require('../public/games/catan/logic.js');

console.log('--- Testing Catan Dev Cards Usability, Hand Management & Victory End Conditions ---');

// 1. Create a 3-player game
const state = CatanLogic.createInitialState(3, ['Player 1', 'Player 2', 'Player 3']);
const p0 = state.players[0];
const p1 = state.players[1];
const p2 = state.players[2];

// Fast forward setup phase to regular turn
state.phase = 'PLAYING_TURN';
state.activePlayer = 0;
state.turnCount = 2; // Not turn 0, so cards not locked unless bought this turn

// ==========================================
// TEST 1: Hand filtering & dev card counts
// ==========================================
console.log('1. Testing Dev Cards Hand filtering...');
p0.devCards.push({ type: 'knight', turnBought: 1, played: false });
p0.devCards.push({ type: 'road_building', turnBought: 1, played: false });
p0.devCards.push({ type: 'monopoly', turnBought: 1, played: false });
p0.devCards.push({ type: 'year_of_plenty', turnBought: 1, played: false });
p0.devCards.push({ type: 'victory_point', turnBought: 1, played: false });
p0.devCardCount = p0.devCards.filter(c => !c.played).length;

assert.strictEqual(p0.devCards.length, 5);
assert.strictEqual(p0.devCards.filter(c => !c.played).length, 5);
assert.strictEqual(p0.devCardCount, 5, 'devCardCount reflects 5 unplayed cards in hand');

// ==========================================
// TEST 2: Play Road Building
// ==========================================
console.log('2. Testing Road Building card consumption...');
const rbRes = CatanLogic.playDevCard(state, 0, { cardType: 'road_building' });
assert.strictEqual(rbRes.valid, true);
assert.strictEqual(p0.devCards.find(c => c.type === 'road_building').played, true);
assert.strictEqual(p0.devCards.filter(c => !c.played).length, 4, 'Played road_building is excluded from unplayed hand');
assert.strictEqual(p0.devCardCount, 4, 'devCardCount decrements to 4 after play');
assert.strictEqual(state.devCardPlayedThisTurn, true);

// Reset devCardPlayedThisTurn for testing subsequent cards
state.devCardPlayedThisTurn = false;

// ==========================================
// TEST 3: Play Monopoly
// ==========================================
console.log('3. Testing Monopoly card consumption & resource transfer...');
p1.resources.grain = 3;
p2.resources.grain = 2;
p0.resources.grain = 0;

const monoRes = CatanLogic.playDevCard(state, 0, { cardType: 'monopoly', targetResource: 'grain' });
assert.strictEqual(monoRes.valid, true);
assert.strictEqual(monoRes.totalTaken, 5);
assert.strictEqual(p0.resources.grain, 5);
assert.strictEqual(p1.resources.grain, 0);
assert.strictEqual(p2.resources.grain, 0);
assert.strictEqual(p0.devCards.find(c => c.type === 'monopoly').played, true);
assert.strictEqual(p0.devCards.filter(c => !c.played).length, 3, 'Played monopoly is excluded from unplayed hand');
assert.strictEqual(p0.devCardCount, 3, 'devCardCount decrements to 3 after play');

state.devCardPlayedThisTurn = false;

// ==========================================
// TEST 4: Play Year of Plenty
// ==========================================
console.log('4. Testing Year of Plenty bank withdrawal...');
const bankOreBefore = state.bank.ore;
const bankLumberBefore = state.bank.lumber;
const p0OreBefore = p0.resources.ore || 0;
const p0LumberBefore = p0.resources.lumber || 0;

const yopRes = CatanLogic.playDevCard(state, 0, { cardType: 'year_of_plenty', resources: ['ore', 'lumber'] });
assert.strictEqual(yopRes.valid, true);
assert.strictEqual(state.bank.ore, bankOreBefore - 1);
assert.strictEqual(state.bank.lumber, bankLumberBefore - 1);
assert.strictEqual(p0.resources.ore, p0OreBefore + 1);
assert.strictEqual(p0.resources.lumber, p0LumberBefore + 1);
assert.strictEqual(p0.devCards.find(c => c.type === 'year_of_plenty').played, true);
assert.strictEqual(p0.devCards.filter(c => !c.played).length, 2, 'Played year_of_plenty is excluded from unplayed hand');
assert.strictEqual(p0.devCardCount, 2, 'devCardCount decrements to 2 after play');

state.devCardPlayedThisTurn = false;

// ==========================================
// TEST 5: Play Knight
// ==========================================
console.log('5. Testing Knight play...');
const kRes = CatanLogic.playDevCard(state, 0, { cardType: 'knight' });
assert.strictEqual(kRes.valid, true);
assert.strictEqual(p0.playedKnights, 1);
assert.strictEqual(p0.devCards.find(c => c.type === 'knight').played, true);
assert.strictEqual(p0.devCards.filter(c => !c.played).length, 1, 'Only victory_point remains in unplayed hand');
assert.strictEqual(p0.devCards.filter(c => c.played).length, 4, 'Exactly 4 cards played');
assert.strictEqual(p0.devCardCount, 1, 'devCardCount decrements to 1 after play');

// ==========================================
// TEST 6: Buy Dev Card
// ==========================================
console.log('6. Testing Buying Dev Card updates count...');
p0.resources.wool = 1;
p0.resources.grain = 1;
p0.resources.ore = 1;
const buyRes = CatanLogic.buyDevCard(state, 0);
assert.strictEqual(buyRes.valid, true);
assert.strictEqual(p0.devCardCount, 2, 'devCardCount increments to 2 after buying');
assert.strictEqual(p0.devCards.filter(c => !c.played).length, 2);

// ==========================================
// TEST 7: SVG Asset ID Verification
// ==========================================
console.log('7. Verifying Card SVG Symbols in index.html and catan-assets.svg...');
const fs = require('fs');
const path = require('path');

const indexHtml = fs.readFileSync(path.join(__dirname, '../public/games/catan/index.html'), 'utf8');
const assetsSvg = fs.readFileSync(path.join(__dirname, '../public/games/catan/catan-assets.svg'), 'utf8');

const requiredSymbolIds = [
  'card-knight',
  'card-road-building',
  'card-road_building',
  'card-year-of-plenty',
  'card-year_of_plenty',
  'card-monopoly',
  'card-victory-point',
  'card-victory_point',
  'card-back'
];

for (const symId of requiredSymbolIds) {
  assert(indexHtml.includes(`id="${symId}"`), `Missing symbol ${symId} in index.html`);
  assert(assetsSvg.includes(`id="${symId}"`), `Missing symbol ${symId} in catan-assets.svg`);
}

// ==========================================
// TEST 8: Victory Condition & Game Over Trigger
// ==========================================
console.log('8. Testing Game Over victory condition at 10 Victory Points...');
// Give p0 settlements/cities totaling 9 VP + 1 VP card = 10 VP
// Base graph vertices
const bg = CatanLogic.getBoardGraph(state);
// Place 4 cities (8 VP) + 1 settlement (1 VP) + 1 VP card (1 VP) = 10 VP
state.vertices[0] = { player: 0, type: 'city' };
state.vertices[2] = { player: 0, type: 'city' };
state.vertices[4] = { player: 0, type: 'city' };
state.vertices[6] = { player: 0, type: 'city' };
state.vertices[8] = { player: 0, type: 'settlement' };

CatanLogic.recalculateVictoryPoints(state);

assert.strictEqual(p0.victoryPoints, 10, 'Player 0 reached 10 Victory Points');
assert.strictEqual(state.winner, 0, 'Winner is Player 0');
assert.strictEqual(state.phase, 'FINISHED', 'Game phase is FINISHED');

console.log('====================================================');
console.log('✓ ALL DEV CARD USABILITY & VICTORY TESTS PASSED! ✓');
console.log('====================================================');
