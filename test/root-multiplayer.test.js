const { spawn } = require('child_process');
const assert = require('assert');
const WebSocket = require('ws');

const TEST_PORT = 3892;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function waitForMessage(ws, filterFn, timeoutMs = 6000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      ws.off('message', onMsg);
      reject(new Error(`Timeout waiting for message (${timeoutMs}ms)`));
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

async function runRootMultiplayerTest() {
  console.log('--- Starting Root Multiplayer & Server Authority E2E Test ---');

  const serverProc = spawn('node', ['server.js'], {
    env: { ...process.env, PORT: TEST_PORT },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  serverProc.stderr.on('data', d => console.error('Server err:', d.toString()));

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
    // 1. Connect Alice (Host)
    ws1 = new WebSocket(`ws://127.0.0.1:${TEST_PORT}`);
    await new Promise(r => ws1.on('open', r));

    ws1.send(JSON.stringify({
      type: 'CREATE_ROOM',
      gameType: 'root',
      playerName: 'Alice'
    }));

    const createMsg = await waitForMessage(ws1, m => m.type === 'ROOM_CREATED');
    const roomCode = createMsg.roomCode;
    assert.strictEqual(createMsg.gameType, 'root');
    console.log('✓ Room created with code:', roomCode);

    // 2. Connect Bob
    ws2 = new WebSocket(`ws://127.0.0.1:${TEST_PORT}`);
    await new Promise(r => ws2.on('open', r));

    ws2.send(JSON.stringify({
      type: 'JOIN_ROOM',
      roomCode,
      playerName: 'Bob'
    }));

    const joinMsg = await waitForMessage(ws2, m => m.type === 'ROOM_JOINED');
    assert.strictEqual(joinMsg.seat, 1);
    console.log('✓ Bob joined room at seat 1');

    // 3. Start Match
    ws1.send(JSON.stringify({
      type: 'ROOT_START_MATCH'
    }));

    const startMsgAlice = await waitForMessage(ws1, m => m.type === 'STATE_UPDATE');
    const startMsgBob = await waitForMessage(ws2, m => m.type === 'STATE_UPDATE');
    console.log('✓ Game started and state update broadcast to both players');

    // 4. Verify Private State Projections (Hidden Information Security)
    const aliceState = startMsgAlice.state;
    const bobState = startMsgBob.state;

    // Alice (seat 0) sees her own hand, but Bob's hand is redacted
    assert(aliceState.players[0].hand.length > 0, 'Alice must see her own hand');
    assert.strictEqual(aliceState.players[1].hand.length, 0, 'Alice cannot see Bob hand cards');

    // Bob (seat 1) sees his own hand, but Alice's hand is redacted
    assert(bobState.players[1].hand.length > 0, 'Bob must see his own hand');
    assert.strictEqual(bobState.players[0].hand.length, 0, 'Bob cannot see Alice hand cards');
    console.log('✓ State projections verified: opponent cards strictly hidden over WebSocket wire');

    // 5. Action Intent Execution
    ws1.send(JSON.stringify({
      type: 'ROOT_INTENT',
      roomCode,
      action: { type: 'ADVANCE_PHASE' }
    }));

    const nextStateMsg = await waitForMessage(ws1, m => m.type === 'STATE_UPDATE' && m.state.phase === 'DAYLIGHT');
    assert.strictEqual(nextStateMsg.state.phase, 'DAYLIGHT');
    console.log('✓ Alice executed legal intent (ADVANCE_PHASE to DAYLIGHT) with authoritative server validation');

    // 6. Test Disconnect and Reconnect
    ws2.close();
    await sleep(200);

    const ws2Reconnected = new WebSocket(`ws://127.0.0.1:${TEST_PORT}`);
    await new Promise(r => ws2Reconnected.on('open', r));

    ws2Reconnected.send(JSON.stringify({
      type: 'JOIN_ROOM',
      roomCode,
      playerName: 'Bob'
    }));

    const reconnectedJoin = await waitForMessage(ws2Reconnected, m => m.type === 'ROOM_JOINED');
    assert.strictEqual(reconnectedJoin.seat, 1);
    const reconnectedState = await waitForMessage(ws2Reconnected, m => m.type === 'STATE_UPDATE');
    assert(reconnectedState.state.players[1].hand.length > 0, 'Bob restored his private state on reconnect');
    console.log('✓ Bob reconnected mid-game and restored authoritative private state projection');
    ws2Reconnected.close();

    console.log('==================================================');
    console.log('✓ ALL ROOT MULTIPLAYER & SECURITY CHECKS PASSED! ✓');
    console.log('==================================================');

  } finally {
    if (ws1) ws1.close();
    if (ws2) ws2.close();
    serverProc.kill();
  }
}

runRootMultiplayerTest().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
