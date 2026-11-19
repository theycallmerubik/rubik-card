const assert = require('assert');
const catan = require('../public/games/catan/logic.js');

console.log('--- Running Catan AI Bots & Heuristics Tests ---');

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}`);
    throw err;
  }
}

// 1. Bot setup placement
runTest('Bot can complete initial snake draft setup placements legally', () => {
  const state = catan.createInitialState(3, ['Alice', 'Bob', 'Bot 1'], { seed: 101 });
  // Players 0 and 1 are humans, Player 2 is a Bot
  assert.strictEqual(state.phase, 'SETUP_SETTLEMENT');
  assert.strictEqual(state.activePlayer, 0);

  // Human 0 placement
  catan.buildSettlement(state, 0, 10);
  catan.buildRoad(state, 0, catan.BOARD_GRAPHS.base.vertices[10].edgeIds[0]);

  // Human 1 placement
  catan.buildSettlement(state, 1, 30);
  catan.buildRoad(state, 1, catan.BOARD_GRAPHS.base.vertices[30].edgeIds[0]);

  // Bot 2 Round 1 Placement
  assert.strictEqual(state.activePlayer, 2);
  assert.strictEqual(state.phase, 'SETUP_SETTLEMENT');
  const botMove1 = catan.chooseBotSetupMove(state, 2, 'normal');
  assert.ok(botMove1 && botMove1.action === 'BUILD_SETTLEMENT');
  const setRes1 = catan.buildSettlement(state, 2, botMove1.vertexId, true);
  assert.strictEqual(setRes1.valid, true);

  assert.strictEqual(state.phase, 'SETUP_ROAD');
  const botMove2 = catan.chooseBotSetupMove(state, 2, 'normal');
  assert.ok(botMove2 && botMove2.action === 'BUILD_ROAD');
  const roadRes1 = catan.buildRoad(state, 2, botMove2.edgeId, true);
  assert.strictEqual(roadRes1.valid, true);

  // Bot 2 Round 2 Placement (Snake draft reverses immediately to Bot 2!)
  assert.strictEqual(state.activePlayer, 2);
  assert.strictEqual(state.phase, 'SETUP_SETTLEMENT');
  const botMove3 = catan.chooseBotSetupMove(state, 2, 'normal');
  assert.ok(botMove3 && botMove3.action === 'BUILD_SETTLEMENT');
  const setRes2 = catan.buildSettlement(state, 2, botMove3.vertexId, true);
  assert.strictEqual(setRes2.valid, true);

  assert.strictEqual(state.phase, 'SETUP_ROAD');
  const botMove4 = catan.chooseBotSetupMove(state, 2, 'normal');
  assert.ok(botMove4 && botMove4.action === 'BUILD_ROAD');
  const roadRes2 = catan.buildRoad(state, 2, botMove4.edgeId, true);
  assert.strictEqual(roadRes2.valid, true);

  // Turn now goes to Human 1
  assert.strictEqual(state.activePlayer, 1);
});

// 2. Bot turn decisions across difficulties
runTest('Bot chooses legal actions on its turn without crashing or deadlocking', () => {
  const state = catan.createInitialState(3, ['Alice', 'Bob', 'Bot 1'], { seed: 202 });
  state.phase = 'ROLL_DICE';
  state.activePlayer = 2;

  const rollDecision = catan.chooseBotTurn(state, 2, 'normal');
  assert.strictEqual(rollDecision.action, 'ROLL_DICE');
  catan.rollDice(state, 2);

  state.phase = 'PLAYING_TURN';
  const turnDecision = catan.chooseBotTurn(state, 2, 'normal');
  assert.ok(turnDecision);
  assert.ok(['BUILD_SETTLEMENT', 'BUILD_CITY', 'BUILD_ROAD', 'BUY_DEV_CARD', 'BANK_TRADE', 'PLAY_DEV_CARD', 'END_TURN'].includes(turnDecision.action));
});

// 3. Bot discard and robber move
runTest('Bot handles robber discard and moves robber away from own tiles', () => {
  const state = catan.createInitialState(3, ['Alice', 'Bob', 'Bot 1'], { seed: 303 });
  const bot = state.players[2];
  // Give bot 8 cards
  bot.resources.lumber = 4;
  bot.resources.brick = 4;
  state.phase = 'ROBBER_DISCARD';
  state.discardQueue = [{ playerId: 2, count: 4 }];

  const discardDecision = catan.chooseBotTurn(state, 2, 'normal');
  assert.strictEqual(discardDecision.action, 'DISCARD_CARDS');
  const sumDiscarded = Object.values(discardDecision.discarded).reduce((a, b) => a + b, 0);
  assert.strictEqual(sumDiscarded, 4);

  // Apply discard
  const discRes = catan.discardCards(state, 2, discardDecision.discarded);
  assert.strictEqual(discRes.valid, true);

  // Robber Move
  state.phase = 'ROBBER_MOVE';
  state.activePlayer = 2;
  // Place bot settlement at vertex 10 (hex 0)
  state.vertices[10] = { player: 2, type: 'settlement' };
  state.vertices[30] = { player: 0, type: 'settlement' };

  const robberDecision = catan.chooseBotTurn(state, 2, 'normal');
  assert.strictEqual(robberDecision.action, 'MOVE_ROBBER');
  assert.notStrictEqual(robberDecision.hexId, state.robberHexId);

  // Bot should not choose hex 0 where its own settlement is
  assert.notStrictEqual(robberDecision.hexId, 0);
});

// 4. Information Security: Bot relies only on public state
runTest('Bot receives only projected public state without opponent hidden cards', () => {
  const state = catan.createInitialState(3, ['Alice', 'Bob', 'Bot 1'], { seed: 404 });
  state.players[0].resources.ore = 5;
  state.players[0].devCards.push({ type: 'monopoly', turnBought: 0, played: false });

  // Projected state for Bot (seat 2)
  const projectedForBot = catan.getStateForPlayer(state, 2);
  assert.strictEqual(projectedForBot.players[0].resources.ore, 0, 'Hidden resource breakdown must not be leaked to Bot');
  assert.strictEqual(projectedForBot.players[0].resourceCount, 5, 'Public count is available');
  assert.strictEqual(projectedForBot.players[0].devCards[0].type, 'hidden', 'Hidden dev cards must be masked as hidden');
  assert.strictEqual(projectedForBot.players[0].devCardCount, 1);
});

// 5. Extended 5-6 player Special Building Phase support
runTest('Bot safely builds or passes during Special Building Phase in 5-6 player match', () => {
  const state = catan.createInitialState(5, ['Alice', 'Bob', 'Charlie', 'Dana', 'Bot 1'], {
    ruleProfile: 'extended',
    boardTemplate: 'extended',
    seed: 505
  });

  state.phase = 'SPECIAL_BUILDING';
  state.specialBuildingTurn = 4; // Bot's special building turn
  const bot = state.players[4];

  // If bot has no resources, it passes
  const passDecision = catan.chooseBotTurn(state, 4, 'normal');
  assert.strictEqual(passDecision.action, 'PASS_SPECIAL_BUILD');

  // If bot has resources for a road, it builds
  bot.resources.lumber = 1;
  bot.resources.brick = 1;
  state.edges[0] = 4; // Existing road to connect to

  const buildDecision = catan.chooseBotTurn(state, 4, 'normal');
  assert.ok(['BUILD_ROAD', 'PASS_SPECIAL_BUILD'].includes(buildDecision.action));
});

console.log('All Catan AI Bots & Heuristics Tests Passed!');
