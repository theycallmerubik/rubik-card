const { spawn } = require('child_process');
const assert = require('assert');
const WebSocket = require('ws');
const catanLogic = require('../public/games/catan/logic.js');

const TEST_PORT = 3891;

function waitForMessage(ws, filterFn, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      ws.off('message', onMsg);
      reject(new Error(`Timeout waiting for message matching criteria (${timeoutMs}ms)`));
    }, timeoutMs);

    function onMsg(data) {
      try {
        const msg = JSON.parse(data.toString());
        if (filterFn(msg)) {
          clearTimeout(timer);
          ws.off('message', onMsg);
          resolve(msg);
        }
      } catch (_) {}
    }

    ws.on('message', onMsg);
  });
}

async function testBotRollsAndPlays() {
  console.log('--- Testing Bot Dice Rolling & Gameplay in Multiplayer ---');

  const serverProc = spawn('node', ['server.js'], {
    env: { ...process.env, PORT: TEST_PORT },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  await new Promise((resolve, reject) => {
    serverProc.stdout.on('data', d => {
      if (d.toString().includes('Game Hub Server Running')) resolve();
    });
    serverProc.on('error', reject);
  });

  const ws = new WebSocket(`ws://127.0.0.1:${TEST_PORT}`);
  await new Promise(r => ws.once('open', r));

  try {
    // 1 Human + 2 Bots
    ws.send(JSON.stringify({
      type: 'CREATE_ROOM',
      gameType: 'catan',
      playerName: 'Human Alice',
      settings: { playerCount: 3, timeControl: 0 }
    }));

    const createMsg = await waitForMessage(ws, m => m.type === 'ROOM_CREATED');
    console.log('✓ Room created:', createMsg.roomCode);

    // Start game
    ws.send(JSON.stringify({ type: 'START_GAME' }));
    await waitForMessage(ws, m => m.type === 'GAME_STARTED');
    console.log('✓ Game started with 1 Human + 2 Bots');

    // Setup: Alice places first settlement & road
    let st = await waitForMessage(ws, m => m.type === 'CATAN_STATE_UPDATE' && m.state.phase === 'SETUP_SETTLEMENT');
    ws.send(JSON.stringify({ type: 'CATAN_BUILD_SETTLEMENT', vertexId: 10, isSetup: true }));
    st = await waitForMessage(ws, m => m.type === 'CATAN_STATE_UPDATE' && m.state.phase === 'SETUP_ROAD');
    ws.send(JSON.stringify({ type: 'CATAN_BUILD_ROAD', edgeId: 11, isSetup: true }));

    // Now wait for Bots to place setup settlements and roads!
    console.log('Waiting for bots to execute setup snake draft...');
    // Setup round 2 will eventually return to Alice
    st = await waitForMessage(ws, m => m.type === 'CATAN_STATE_UPDATE' && m.state.activePlayer === 0 && m.state.setupRound === 2 && m.state.phase === 'SETUP_SETTLEMENT', 15000);
    console.log('✓ Both bots successfully completed Round 1 & Round 2 setup!');

    // Alice places round 2 settlement & road using valid topological choices
    const bg = catanLogic.getBoardGraph(st.state);
    let chosenV = null;
    for (let vid = 0; vid < bg.vertices.length; vid++) {
      if (catanLogic.canBuildSettlement(st.state, 0, vid, true)) {
        chosenV = vid;
        break;
      }
    }
    assert.ok(chosenV !== null, 'Must find a legal settlement vertex for round 2');

    ws.send(JSON.stringify({ type: 'CATAN_BUILD_SETTLEMENT', vertexId: chosenV, isSetup: true }));
    st = await waitForMessage(ws, m => m.type === 'CATAN_STATE_UPDATE' && m.state.phase === 'SETUP_ROAD');

    let chosenE = null;
    for (const eid of bg.vertices[chosenV].edgeIds) {
      if (catanLogic.canBuildRoad(st.state, 0, eid, true, chosenV)) {
        chosenE = eid;
        break;
      }
    }
    assert.ok(chosenE !== null, 'Must find a legal road edge for round 2');
    ws.send(JSON.stringify({ type: 'CATAN_BUILD_ROAD', edgeId: chosenE, isSetup: true }));

    // Regular game begins: Alice's turn to ROLL_DICE
    st = await waitForMessage(ws, m => m.type === 'CATAN_STATE_UPDATE' && m.state.phase === 'ROLL_DICE' && m.state.activePlayer === 0);
    console.log('✓ Entered regular play: Alice rolling dice');

    ws.send(JSON.stringify({ type: 'CATAN_ROLL_DICE' }));
    st = await waitForMessage(ws, m => m.type === 'CATAN_STATE_UPDATE' && (m.state.phase === 'PLAYING_TURN' || m.state.phase === 'ROBBER_MOVE' || m.state.phase === 'ROBBER_DISCARD'));
    if (st.state.phase === 'ROBBER_MOVE') {
      const targetHex = st.state.tiles.find(t => t.id !== st.state.robberHexId).id;
      ws.send(JSON.stringify({ type: 'CATAN_MOVE_ROBBER', hexId: targetHex }));
      st = await waitForMessage(ws, m => m.type === 'CATAN_STATE_UPDATE' && m.state.phase === 'PLAYING_TURN');
    }
    console.log('✓ Alice rolled dice. Now Alice ends turn to pass to Bot 2...');

    ws.send(JSON.stringify({ type: 'CATAN_END_TURN' }));

    // NOW: Bot 2's turn! Bot 2 must roll dice!
    console.log('Waiting for Bot 2 to roll dice...');
    const botRollMsg = await waitForMessage(ws, m => {
      if (m.type === 'CATAN_STATE_UPDATE' && m.state.activePlayer === 1 && m.lastDice) {
        return true;
      }
      return false;
    }, 8000);

    const d1 = botRollMsg.lastDice[0];
    const d2 = botRollMsg.lastDice[1];
    const sum = botRollMsg.state.lastDiceSum;

    console.log(`✓ Bot 2 successfully rolled dice: ${d1} + ${d2} = ${sum}`);
    assert.ok(d1 >= 1 && d1 <= 6, `Die 1 must be 1..6, got ${d1}`);
    assert.ok(d2 >= 1 && d2 <= 6, `Die 2 must be 1..6, got ${d2}`);
    assert.strictEqual(sum, d1 + d2, `Sum must be ${d1 + d2}, got ${sum}`);
    assert.ok(!isNaN(sum), 'Sum must not be NaN');

    // Wait for Bot 2 to finish playing turn and pass to Bot 3
    console.log('Waiting for Bot 2 to finish turn and pass to Bot 3...');
    const bot3Turn = await waitForMessage(ws, m => {
      return m.type === 'CATAN_STATE_UPDATE' && m.state.activePlayer === 2;
    }, 8000);
    console.log('✓ Bot 2 finished actions and passed turn to Bot 3!');

    // Wait for Bot 3 to roll dice
    const bot3Roll = await waitForMessage(ws, m => {
      return m.type === 'CATAN_STATE_UPDATE' && m.state.activePlayer === 2 && m.lastDice;
    }, 8000);
    console.log(`✓ Bot 3 successfully rolled dice: ${bot3Roll.lastDice[0]} + ${bot3Roll.lastDice[1]} = ${bot3Roll.state.lastDiceSum}`);

    console.log('==============================================');
    console.log('✓ ALL BOT DICE ROLLING & PLAY CHECKS PASSED! ✓');
    console.log('==============================================');
  } finally {
    ws.close();
    serverProc.kill('SIGKILL');
  }
}

testBotRollsAndPlays().catch(e => {
  console.error('Test failed:', e);
  process.exit(1);
});
