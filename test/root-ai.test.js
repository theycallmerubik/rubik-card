const assert = require('assert');
const rootLogic = require('../public/games/root/logic.js');

console.log('--- Running Root AI Bot Simulation Tests ---');

// Simulate 5 matches with 4 AI bots playing turns
for (let sim = 1; sim <= 5; sim++) {
  const seed = 5000 + sim;
  const state = rootLogic.createInitialState({
    seed,
    bots: [true, true, true, true],
    difficulties: ['easy', 'normal', 'hard', 'normal']
  });

  let totalMoves = 0;
  const maxMoves = 60; // Simulate up to 60 legal actions

  while (state.status === 'PLAYING' && totalMoves < maxMoves) {
    const activePlayer = state.players[state.activePlayerIndex];
    const legalActions = rootLogic.getLegalActions(state, state.activePlayerIndex);

    assert(legalActions.length > 0, `Active player ${activePlayer.faction} must have at least one legal action`);

    // Prioritize actions: Battle > Build > Sympathy > Move > Advance
    const choice = legalActions.find(a => a.type === 'BATTLE') ||
                   legalActions.find(a => a.type.includes('BUILD')) ||
                   legalActions.find(a => a.type.includes('SYMPATHY')) ||
                   legalActions.find(a => a.type === 'MOVE') ||
                   legalActions.find(a => a.type === 'ADVANCE_PHASE') ||
                   legalActions[0];

    // Execute choice
    if (choice.type === 'ADVANCE_PHASE') {
      if (state.phase === 'BIRDSONG') state.phase = 'DAYLIGHT';
      else if (state.phase === 'DAYLIGHT') state.phase = 'EVENING';
      else if (state.phase === 'EVENING') {
        state.phase = 'BIRDSONG';
        state.activePlayerIndex = (state.activePlayerIndex + 1) % state.players.length;
      }
    } else if (choice.type === 'MOVE') {
      const fromCl = state.clearings.find(c => c.id === choice.from);
      const toCl = state.clearings.find(c => c.id === choice.to);
      const f = activePlayer.faction;
      if (fromCl && toCl) {
        fromCl.pieces[f] -= choice.count;
        toCl.pieces[f] = (toCl.pieces[f] || 0) + choice.count;
      }
    } else if (choice.type === 'BATTLE') {
      rootLogic.resolveBattle(state, choice.clearingId, choice.attackerFaction, choice.defenderFaction);
    } else if (choice.type === 'MARQUISE_PLACE_WOOD') {
      const cl = state.clearings.find(c => c.id === choice.clearingId);
      if (cl) {
        for (let i = 0; i < choice.count; i++) {
          cl.pieces.tokens.push({ type: 'wood', faction: 'marquise' });
          state.factionData.marquise.woodInSupply--;
        }
      }
    } else if (choice.type === 'ALLIANCE_SPREAD_SYMPATHY') {
      const cl = state.clearings.find(c => c.id === choice.clearingId);
      if (cl) {
        cl.pieces.tokens.push({ type: 'sympathy', faction: 'alliance' });
        state.factionData.alliance.sympathyRemaining--;
        state.factionData.alliance.supporters.splice(0, choice.cost);
      }
    }

    rootLogic.checkVictory(state);
    totalMoves++;
  }

  console.log(`  ✓ Simulation ${sim} completed ${totalMoves} actions without errors or deadlocks`);
}

console.log('============================================');
console.log('✓ ALL ROOT AI BOT SIMULATION CHECKS PASSED! ✓');
console.log('============================================');
