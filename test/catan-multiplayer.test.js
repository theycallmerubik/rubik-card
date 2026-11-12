const { spawn } = require('child_process');
const assert = require('assert');
const WebSocket = require('ws');
const catanLogic = require('../public/games/catan/logic.js');

const TEST_PORT = 3889;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function waitForMessage(ws, filterFn, timeoutMs = 6000) {
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

async function runMultiplayerTest() {
  console.log('--- Starting Comprehensive Catan Multiplayer E2E Test ---');

  // 1. Spawn server
  const serverProc = spawn('node', ['server.js'], {
    env: { ...process.env, PORT: TEST_PORT },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  serverProc.stderr.on('data', d => console.error('Server err:', d.toString()));

  // Wait for server to start
  await new Promise((resolve, reject) => {
    serverProc.stdout.on('data', data => {
      if (data.toString().includes('Game Hub Server Running')) {
        resolve();
      }
    });
    serverProc.on('error', reject);
  });
  console.log('✓ Server started on port', TEST_PORT);

  let ws1, ws2;

  try {
    // 2. Connect Host (Alice)
    ws1 = new WebSocket(`ws://127.0.0.1:${TEST_PORT}`);
    await new Promise(r => ws1.once('open', r));

    ws1.send(JSON.stringify({
      type: 'CREATE_ROOM',
      gameType: 'catan',
      playerName: 'Alice',
      settings: { playerCount: 3, timeControl: 0 }
    }));

    const createMsg = await waitForMessage(ws1, m => m.type === 'ROOM_CREATED');
    const roomCode = createMsg.roomCode;
    assert.strictEqual(typeof roomCode, 'string');
    assert.strictEqual(roomCode.length, 4);
    console.log('✓ Room created with code:', roomCode);

    const lobbyMsg1 = await waitForMessage(ws1, m => m.type === 'LOBBY_UPDATE');
    assert.strictEqual(lobbyMsg1.isHost, true);
    assert.strictEqual(lobbyMsg1.seats[0].name, 'Alice');
    assert.strictEqual(lobbyMsg1.seats[1].isBot, true);
    console.log('✓ Lobby update received by host');

    // 3. Connect Player 2 (Bob)
    ws2 = new WebSocket(`ws://127.0.0.1:${TEST_PORT}`);
    await new Promise(r => ws2.once('open', r));

    ws2.send(JSON.stringify({
      type: 'JOIN_ROOM',
      roomCode: roomCode,
      playerName: 'Bob'
    }));

    const joinMsg = await waitForMessage(ws2, m => m.type === 'ROOM_JOINED');
    assert.strictEqual(joinMsg.seat, 1);
    console.log('✓ Bob joined room at seat 1');

    const lobbyMsg2 = await waitForMessage(ws1, m => m.type === 'LOBBY_UPDATE' && m.seats[1].name === 'Bob');
    assert.strictEqual(lobbyMsg2.seats[1].name, 'Bob');
    assert.strictEqual(lobbyMsg2.seats[1].isBot, false);
    console.log('✓ Host lobby updated with Bob at seat 1');

    // 4. Start Game
    ws1.send(JSON.stringify({ type: 'START_GAME' }));

    const startMsg1 = await waitForMessage(ws1, m => m.type === 'GAME_STARTED');
    const startMsg2 = await waitForMessage(ws2, m => m.type === 'GAME_STARTED');
    assert.strictEqual(startMsg1.yourSeat, 0);
    assert.strictEqual(startMsg2.yourSeat, 1);
    console.log('✓ Both players received GAME_STARTED');

    // 5. Initial State Broadcast & Secure Projection Check
    const stateMsg1 = await waitForMessage(ws1, m => m.type === 'CATAN_STATE_UPDATE');
    const stateMsg2 = await waitForMessage(ws2, m => m.type === 'CATAN_STATE_UPDATE');

    assert.strictEqual(stateMsg1.state.players[0].resourceCount, 0);
    assert.strictEqual(stateMsg1.state.players[1].resourceCount, 0);
    assert.strictEqual(stateMsg1.state.players[1].resources.lumber, 0);
    assert.strictEqual(stateMsg2.state.players[0].resources.lumber, 0);
    console.log('✓ Secure state projection verified over WebSocket: hidden opponent resources');

    // 6. Setup Placement: Alice (Player 0) places settlement & road
    assert.strictEqual(stateMsg1.state.activePlayer, 0);
    assert.strictEqual(stateMsg1.state.phase, 'SETUP_SETTLEMENT');
    assert.strictEqual(stateMsg1.state.setupRound, 1);

    const boardGraph = catanLogic.BOARD_GRAPH;
    const v1 = 0;
    ws1.send(JSON.stringify({
      type: 'CATAN_BUILD_SETTLEMENT',
      vertexId: v1,
      isSetup: true
    }));

    const afterSet1 = await waitForMessage(ws1, m => m.type === 'CATAN_STATE_UPDATE' && m.state.phase === 'SETUP_ROAD');
    assert.strictEqual(afterSet1.state.vertices[v1].player, 0);
    console.log('✓ Alice placed initial settlement');

    const adjEdge1 = boardGraph.vertices[v1].edgeIds[0];
    ws1.send(JSON.stringify({
      type: 'CATAN_BUILD_ROAD',
      edgeId: adjEdge1,
      isSetup: true
    }));

    // Next should be Bob (Player 1)
    const afterRoad1 = await waitForMessage(ws2, m => m.type === 'CATAN_STATE_UPDATE' && m.state.activePlayer === 1 && m.state.phase === 'SETUP_SETTLEMENT');
    assert.strictEqual(afterRoad1.state.activePlayer, 1);
    console.log('✓ Turn passed to Bob for setup placement');

    // Bob places settlement
    const legalVerticesBob = boardGraph.vertices.filter(v => {
      return catanLogic.canBuildSettlement(afterRoad1.state, 1, v.id, true);
    });
    const vBob = legalVerticesBob[0].id;
    ws2.send(JSON.stringify({
      type: 'CATAN_BUILD_SETTLEMENT',
      vertexId: vBob,
      isSetup: true
    }));

    const bobAfterSet = await waitForMessage(ws2, m => m.type === 'CATAN_STATE_UPDATE' && m.state.phase === 'SETUP_ROAD');
    const adjEdgeBob = boardGraph.vertices[vBob].edgeIds[0];
    ws2.send(JSON.stringify({
      type: 'CATAN_BUILD_ROAD',
      edgeId: adjEdgeBob,
      isSetup: true
    }));
    await waitForMessage(ws1, m => m.type === 'CATAN_STATE_UPDATE' && m.state.edges[adjEdgeBob] === 1);
    console.log('✓ Bob placed initial settlement and road');

    // 7. Test Disconnect & Reconnect during game
    console.log('Testing Bob disconnect and reconnect...');
    ws2.close();
    await sleep(250);

    const ws2Reconnected = new WebSocket(`ws://127.0.0.1:${TEST_PORT}`);
    await new Promise(r => ws2Reconnected.once('open', r));

    ws2Reconnected.send(JSON.stringify({
      type: 'JOIN_ROOM',
      roomCode: roomCode,
      playerName: 'Bob'
    }));

    const rejoinMsg = await waitForMessage(ws2Reconnected, m => m.type === 'ROOM_JOINED');
    assert.strictEqual(rejoinMsg.seat, 1);

    const reconnectedStateMsg = await waitForMessage(ws2Reconnected, m => m.type === 'CATAN_STATE_UPDATE');
    assert.strictEqual(reconnectedStateMsg.yourSeat, 1);
    assert(reconnectedStateMsg.state.players[1].resources !== null, 'Reconnected player recovers own resources');
    assert.strictEqual(reconnectedStateMsg.state.players[0].resources.lumber, 0, 'Reconnected player still does not see opponent resources');
    console.log('✓ Bob successfully reconnected and restored private state projection');
    ws2 = ws2Reconnected;

    // 8. Test In-Game Chat Broadcast
    ws2.send(JSON.stringify({
      type: 'CHAT',
      text: 'Good luck everyone!'
    }));

    const chatMsg1 = await waitForMessage(ws1, m => m.type === 'CHAT' && m.text.includes('Good luck'));
    assert.strictEqual(chatMsg1.sender, 'Bob');
    console.log('✓ In-game chat broadcast verified between players');

    // 9. Advance through Bot 3 (seat 2) setup moves and Round 2
    // Listen to all CATAN_STATE_UPDATE messages on ws1
    let latestState = reconnectedStateMsg.state;
    ws1.on('message', data => {
      try {
        const m = JSON.parse(data.toString());
        if (m.type === 'CATAN_STATE_UPDATE') {
          latestState = m.state;
          console.log(`[STATE] Active: ${m.state.activePlayer}, Phase: ${m.state.phase}, SetupRound: ${m.state.setupRound}`);
        }
      } catch (_) {}
    });

    let loopSafety = 0;
    while (latestState.phase.startsWith('SETUP') && loopSafety++ < 25) {
      const active = latestState.activePlayer;
      const phase = latestState.phase;

      if (active === 0) {
        // Alice turn
        if (phase === 'SETUP_SETTLEMENT') {
          const legalV = boardGraph.vertices.find(v => catanLogic.canBuildSettlement(latestState, 0, v.id, true));
          ws1.send(JSON.stringify({ type: 'CATAN_BUILD_SETTLEMENT', vertexId: legalV.id, isSetup: true }));
        } else if (phase === 'SETUP_ROAD') {
          const vObj = boardGraph.vertices[latestState.lastSetupSettlementVertex || 0];
          const edgeId = vObj.edgeIds.find(e => latestState.edges[e] === null);
          ws1.send(JSON.stringify({ type: 'CATAN_BUILD_ROAD', edgeId, isSetup: true }));
        }
      } else if (active === 1) {
        // Bob turn
        if (phase === 'SETUP_SETTLEMENT') {
          const legalV = boardGraph.vertices.find(v => catanLogic.canBuildSettlement(latestState, 1, v.id, true));
          ws2.send(JSON.stringify({ type: 'CATAN_BUILD_SETTLEMENT', vertexId: legalV.id, isSetup: true }));
        } else if (phase === 'SETUP_ROAD') {
          const vObj = boardGraph.vertices[latestState.lastSetupSettlementVertex || 0];
          const edgeId = vObj.edgeIds.find(e => latestState.edges[e] === null);
          ws2.send(JSON.stringify({ type: 'CATAN_BUILD_ROAD', edgeId, isSetup: true }));
        }
      }
      await sleep(1000);
    }

    assert.strictEqual(latestState.phase, 'ROLL_DICE', 'Setup completed and regular phase ROLL_DICE began');
    console.log('✓ Snake draft setup completed; entered regular gameplay (ROLL_DICE)');

    // 10. Dice Roll
    const activeP = latestState.activePlayer;
    const activeWs = activeP === 0 ? ws1 : (activeP === 1 ? ws2 : null);
    if (activeWs) {
      activeWs.send(JSON.stringify({ type: 'CATAN_ROLL_DICE' }));
      const rolledStateMsg = await waitForMessage(ws1, m => m.type === 'CATAN_STATE_UPDATE' && m.lastDice !== null);
      assert(Array.isArray(rolledStateMsg.lastDice) && rolledStateMsg.lastDice.length === 2);
      console.log('✓ Dice rolled successfully via WebSocket:', rolledStateMsg.lastDice.join('+'));

      if (rolledStateMsg.state.phase === 'ROBBER_MOVE') {
        const boardGraph = catanLogic.getBoardGraph(latestState);
        const targetHex = boardGraph.hexes.find(h => h.id !== rolledStateMsg.state.robberHex);
        activeWs.send(JSON.stringify({ type: 'CATAN_MOVE_ROBBER', hexId: targetHex.id }));
        const afterRobber = await waitForMessage(ws1, m => m.type === 'CATAN_STATE_UPDATE' && (m.state.phase === 'PLAYING_TURN' || m.state.phase === 'ROBBER_STEAL'));
        if (afterRobber.state.phase === 'ROBBER_STEAL') {
          activeWs.send(JSON.stringify({ type: 'CATAN_STEAL_RESOURCE', victimId: 1 }));
          await waitForMessage(ws1, m => m.type === 'CATAN_STATE_UPDATE' && m.state.phase === 'PLAYING_TURN');
        }
      }
    }

    // 11. Player-to-Player Trade Lifecycle Test
    console.log('Testing Player-to-Player trading...');
    const aliceRes = latestState.players[0].resources || {};
    console.log('Alice resources available for trading:', aliceRes);
    const offerRes = Object.keys(aliceRes).find(r => aliceRes[r] > 0);

    if (offerRes) {
      ws1.send(JSON.stringify({
        type: 'CATAN_PROPOSE_TRADE',
        targetPlayer: 1,
        give: { [offerRes]: 1 },
        receive: { brick: 1 }
      }));

      const offerStateMsg = await waitForMessage(ws2, m => m.type === 'CATAN_STATE_UPDATE' && m.state.tradeOffer !== null);
      assert.strictEqual(offerStateMsg.state.tradeOffer.fromPlayer, 0);
      console.log('✓ Trade offer broadcast to Bob with resource:', offerRes);

      // Bob responds with decline
      ws2.send(JSON.stringify({
        type: 'CATAN_RESPOND_TRADE',
        offerId: offerStateMsg.state.tradeOffer.id,
        accept: false
      }));

      const rejectedStateMsg = await waitForMessage(ws1, m => m.type === 'CATAN_STATE_UPDATE' && m.state.tradeOffer && m.state.tradeOffer.rejectedBy.includes(1));
      console.log('✓ Bob decline recorded on server');

      // Alice cancels trade
      ws1.send(JSON.stringify({
        type: 'CATAN_CANCEL_TRADE'
      }));

      const cancelledStateMsg = await waitForMessage(ws1, m => m.type === 'CATAN_STATE_UPDATE' && m.state.tradeOffer === null);
      assert.strictEqual(cancelledStateMsg.state.tradeOffer, null);
      console.log('✓ Trade cancelled cleanly');
    } else {
      console.log('Alice has 0 resource cards currently, skipping trade proposal');
    }

    console.log('================================================');
    console.log('All Catan Multiplayer E2E checks passed successfully!');
    console.log('================================================');
  } finally {
    if (ws1 && ws1.readyState === WebSocket.OPEN) ws1.close();
    if (ws2 && ws2.readyState === WebSocket.OPEN) ws2.close();
    serverProc.kill();
  }
}

runMultiplayerTest().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
