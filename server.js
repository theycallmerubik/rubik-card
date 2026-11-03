/**
 * Hokm Card Game - Production-ready HTTP & WebSocket Server
 * Lightweight, zero unnecessary dependencies, responsive on PC & mobile.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { WebSocketServer, WebSocket } = require('ws');
const logic = require('./public/logic.js');
const shelemLogic = require('./public/games/shelem/logic.js');
const unoLogic = require('./public/games/uno/logic.js');
const chessLogic = require('./public/games/chess/logic.js');

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

// 1. Create HTTP static server
function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': 'no-cache'
  });

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
}

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  if (reqPath === '/hokm' || reqPath === '/hokm/') reqPath = '/games/hokm/index.html';
  if (reqPath === '/shelem' || reqPath === '/shelem/') reqPath = '/games/shelem/index.html';
  if (reqPath === '/uno' || reqPath === '/uno/') reqPath = '/games/uno/index.html';
  if (reqPath === '/chess' || reqPath === '/chess/') reqPath = '/games/chess/index.html';

  if (reqPath === '/api/server-info') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ localIp: getLocalIpAddress(), port: PORT }));
    return;
  }
  if (reqPath.startsWith('/api/room/')) {
    const code = reqPath.replace('/api/room/', '').toUpperCase().trim();
    const room = rooms.get(code);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ exists: !!room, gameType: room ? room.gameType : null }));
    return;
  }

  const safePath = path.normalize(reqPath).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(PUBLIC_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      const indexPath = path.join(filePath, 'index.html');
      fs.stat(indexPath, (indexErr, indexStats) => {
        if (!indexErr && indexStats.isFile()) {
          serveFile(res, indexPath);
          return;
        }
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
        res.end('404 Not Found');
      });
      return;
    }

    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
      res.end('404 Not Found');
      return;
    }

    serveFile(res, filePath);
  });
});

// 2. WebSocket Server for Online Multiplayer
const wss = new WebSocketServer({ server });

// Room Store: Map<roomCode, Room>
const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return rooms.has(code) ? generateRoomCode() : code;
}

class OnlineRoom {
  constructor(code, hostWs, hostName = 'Host') {
    this.code = code;
    this.gameType = 'hokm';
    this.hostSocketId = hostWs.id;
    this.targetScore = 7;
    this.game = null;
    this.status = 'LOBBY'; // LOBBY, PLAYING, FINISHED
    this.turnTimer = null;

    // 4 seats:
    // Team 0: Seats 0 (South) & 2 (North)
    // Team 1: Seats 1 (West) & 3 (East)
    this.seats = [
      { name: hostName, originalName: hostName, isBot: false, socketId: hostWs.id, connected: true, ready: true, consecutiveAfkTurns: 0, isAfk: false, afkRoundsCount: 0, permanentAi: false },
      { name: 'Bot 1', originalName: 'Bot 1', isBot: true, socketId: null, connected: true, ready: true, consecutiveAfkTurns: 0, isAfk: false, afkRoundsCount: 0, permanentAi: false },
      { name: 'Bot 2', originalName: 'Bot 2', isBot: true, socketId: null, connected: true, ready: true, consecutiveAfkTurns: 0, isAfk: false, afkRoundsCount: 0, permanentAi: false },
      { name: 'Bot 3', originalName: 'Bot 3', isBot: true, socketId: null, connected: true, ready: true, consecutiveAfkTurns: 0, isAfk: false, afkRoundsCount: 0, permanentAi: false }
    ];

    this.clients = new Set();
    this.addClient(hostWs);
  }

  addClient(ws) {
    this.clients.add(ws);
    ws.roomCode = this.code;
  }

  removeClient(ws) {
    this.clients.delete(ws);
    const seatIdx = this.seats.findIndex(s => s.socketId === ws.id);
    if (seatIdx !== -1) {
      const seat = this.seats[seatIdx];
      seat.connected = false;
      if (this.status === 'PLAYING') {
        seat.isAfk = true;
        this.broadcastGameState();
        // If it's currently their turn, trigger auto move
        if (this.game && this.game.turn === seatIdx) {
          this.checkNextTurn();
        }
      } else {
        // In lobby: seat becomes bot or open
        seat.socketId = null;
        seat.isBot = true;
        seat.name = `Bot ${seatIdx + 1}`;
        if (this.hostSocketId === ws.id) {
          const nextHuman = this.seats.find(s => s.socketId && s.connected && !s.isBot);
          if (nextHuman) {
            this.hostSocketId = nextHuman.socketId;
          }
        }
        this.broadcastLobby();
      }
    }

    if (this.clients.size === 0) {
      this.clearTurnTimer();
      rooms.delete(this.code);
    }
  }

  getSeatIndexForSocket(socketId) {
    return this.seats.findIndex(s => s.socketId === socketId);
  }

  broadcast(message) {
    const payload = JSON.stringify(message);
    for (const ws of this.clients) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
  }

  broadcastLobby() {
    for (const ws of this.clients) {
      if (ws.readyState === WebSocket.OPEN) {
        const yourSeat = this.getSeatIndexForSocket(ws.id);
        const isHost = (ws.id === this.hostSocketId);
        ws.send(JSON.stringify({
          type: 'LOBBY_UPDATE',
          roomCode: this.code,
          hostId: this.hostSocketId,
          isHost,
          yourSeat,
          status: this.status,
          seats: this.seats.map((s, idx) => ({
            seat: idx,
            name: s.name,
            isBot: s.isBot,
            isOccupied: s.socketId !== null,
            isOnline: s.isBot ? true : s.connected,
            isHost: s.socketId === this.hostSocketId,
            isMe: s.socketId === ws.id,
            ready: s.ready
          }))
        }));
      }
    }
  }

  broadcastGameState() {
    if (!this.game) return;

    for (const ws of this.clients) {
      if (ws.readyState === ws.OPEN) {
        const seat = this.getSeatIndexForSocket(ws.id);
        const state = this.game.getStateForPlayer(seat === -1 ? null : seat);
        state.players = state.players.map((p, idx) => {
          const s = this.seats[idx];
          return {
            ...p,
            name: s && s.name ? s.name : p.name,
            team: idx % 2,
            isOnline: s ? (s.isBot ? true : s.connected) : true,
            isAfk: s ? !!s.isAfk : false,
            isBot: s ? !!s.isBot : false,
            permanentAi: s ? !!s.permanentAi : false
          };
        });
        state.isHost = (ws.id === this.hostSocketId);
        state.hostSeat = this.getSeatIndexForSocket(this.hostSocketId);
        state.turnDuration = 15;
        state.isControlledByAi = (seat !== -1 && this.seats[seat]) ? (!!this.seats[seat].permanentAi || !!this.seats[seat].isAfk) : false;
        ws.send(JSON.stringify({
          type: 'GAME_STATE',
          state
        }));
      }
    }
  }

  startGame() {
    this.status = 'PLAYING';
    this.clearTurnTimer();

    // 1. When host starts game: only replace seats that do not have an active connected human player!
    this.seats.forEach((s, idx) => {
      const isHumanConnected = Boolean(
        s.socketId &&
        s.connected &&
        !s.isBot &&
        [...this.clients].some(c => c.id === s.socketId && c.readyState === WebSocket.OPEN)
      );

      if (!isHumanConnected) {
        // Disconnected human or empty/bot seat -> convert to active AI bot
        s.isBot = true;
        s.permanentAi = true;
        s.socketId = null;
        s.connected = true;
        if (!s.name.includes('Bot') && !s.name.includes('(AI)')) {
          s.name = `Bot ${idx + 1}`;
        }
      } else {
        // Active connected human player -> keep them as human player!
        s.originalName = s.originalName || s.name;
        s.isBot = false;
        s.permanentAi = false;
        s.connected = true;
        s.consecutiveAfkTurns = 0;
        s.isAfk = false;
        s.afkRoundsCount = 0;
        s.afkRoundsCount = 0;
      }
    });

    const playerConfigs = this.seats.map(s => ({
      name: s.name,
      isBot: s.isBot
    }));

    this.game = new logic.HokmGame({
      targetScore: this.targetScore,
      players: playerConfigs
    });

    this.game.startNewGame();

    // Immediately broadcast fresh state to clear all old cards on every client
    this.broadcastGameState();

    // Determine Hakem step-by-step with broadcast
    this.broadcast({
      type: 'HAKEM_START'
    });

    const hakemInterval = setInterval(() => {
      if (!this.game) {
        clearInterval(hakemInterval);
        return;
      }
      const step = this.game.stepDetermineHakem();
      this.broadcast({
        type: 'HAKEM_STEP',
        step
      });

      if (step.isAce) {
        clearInterval(hakemInterval);
        setTimeout(() => {
          this.game.finishHakemDetermination(step.hakem);
          this.broadcastGameState();
          this.checkHokmSelection();
        }, 2200);
      }
    }, 450);
  }

  checkHokmSelection() {
    this.clearTurnTimer();
    if (!this.game || this.game.phase !== 'SELECT_HOKM') return;
    const hakemSeat = this.game.hakem;
    const seat = this.seats[hakemSeat];

    if (seat.isBot || seat.permanentAi) {
      this.turnTimer = setTimeout(() => {
        if (!this.game || this.game.phase !== 'SELECT_HOKM') return;
        const chosenHokm = logic.chooseBestHokm(this.game.hands[hakemSeat]);
        this.game.selectHokm(chosenHokm);
        this.broadcast({
          type: 'HOKM_SELECTED',
          suit: chosenHokm,
          hakemSeat
        });
        this.broadcastGameState();
        this.checkNextTurn();
      }, 1000);
      return;
    }

    if (!seat.connected || seat.isAfk) {
      this.turnTimer = setTimeout(() => {
        if (!this.game || this.game.phase !== 'SELECT_HOKM') return;
        const chosenHokm = logic.chooseBestHokm(this.game.hands[hakemSeat]);
        this.game.selectHokm(chosenHokm);
        this.broadcast({
          type: 'HOKM_SELECTED',
          suit: chosenHokm,
          hakemSeat
        });
        this.broadcastGameState();
        this.checkNextTurn();
      }, 1500);
      return;
    }

    // Active connected human Hakem gets 15 seconds to choose Hokm
    this.turnTimer = setTimeout(() => {
      if (!this.game || this.game.phase !== 'SELECT_HOKM') return;
      seat.consecutiveAfkTurns = (seat.consecutiveAfkTurns || 0) + 1;
      const chosenHokm = logic.chooseBestHokm(this.game.hands[hakemSeat]);
      this.game.selectHokm(chosenHokm);
      this.broadcast({
        type: 'CHAT',
        sender: 'System',
        text: `${seat.name} timed out choosing Hokm. Auto-selected ${logic.SUIT_NAMES['en'][chosenHokm]}.`
      });
      this.broadcast({
        type: 'HOKM_SELECTED',
        suit: chosenHokm,
        hakemSeat
      });
      this.broadcastGameState();
      this.checkNextTurn();
    }, 15000);
  }

  checkNextTurn() {
    this.clearTurnTimer();
    if (!this.game || this.game.phase !== 'PLAYING') return;

    const currentTurn = this.game.turn;
    const seat = this.seats[currentTurn];

    if (seat.isBot || seat.permanentAi) {
      // AI plays with natural human-like pace
      this.turnTimer = setTimeout(() => {
        if (!this.game || this.game.phase !== 'PLAYING' || this.game.turn !== currentTurn) return;
        const hand = this.game.hands[currentTurn];
        const card = logic.chooseBotMove(hand, this.game.trick, this.game.hokmSuit, currentTurn);
        if (card) {
          this.handleCardPlay(currentTurn, card);
        }
      }, 750);
      return;
    }

    // Human player turn
    if (!seat.connected || seat.isAfk) {
      // Disconnected or already marked AFK -> auto-play quickly (1s) without waiting 10s
      this.turnTimer = setTimeout(() => {
        if (!this.game || this.game.phase !== 'PLAYING' || this.game.turn !== currentTurn) return;
        const hand = this.game.hands[currentTurn];
        const card = logic.chooseBotMove(hand, this.game.trick, this.game.hokmSuit, currentTurn);
        if (card) {
          this.handleCardPlay(currentTurn, card);
        }
      }, 1000);
      return;
    }

    // Connected active human: start 15 second turn timer
    this.turnTimer = setTimeout(() => {
      if (!this.game || this.game.phase !== 'PLAYING' || this.game.turn !== currentTurn) return;
      // 15 seconds expired!
      seat.consecutiveAfkTurns = (seat.consecutiveAfkTurns || 0) + 1;
      if (seat.consecutiveAfkTurns >= 3) {
        seat.isAfk = true;
        this.broadcast({
          type: 'CHAT',
          sender: 'System',
          text: `${seat.name} is AFK (idle for 3 turns). AI taking over until they return.`
        });
      } else {
        this.broadcast({
          type: 'CHAT',
          sender: 'System',
          text: `${seat.name} timed out (${seat.consecutiveAfkTurns}/3 turns). Auto-playing best move.`
        });
      }

      this.broadcastGameState();

      const hand = this.game.hands[currentTurn];
      const card = logic.chooseBotMove(hand, this.game.trick, this.game.hokmSuit, currentTurn);
      if (card) {
        this.handleCardPlay(currentTurn, card);
      }
    }, 15000);
  }

  clearTurnTimer() {
    if (this.turnTimer) {
      clearTimeout(this.turnTimer);
      this.turnTimer = null;
    }
    if (this.unoPenaltyTimers) {
      this.unoPenaltyTimers.forEach((t, i) => {
        if (t) {
          clearTimeout(t);
          this.unoPenaltyTimers[i] = null;
        }
      });
    }
  }

  handleCardPlay(seatIndex, card) {
    this.clearTurnTimer();
    const res = this.game.playCard(seatIndex, card.id);
    if (!res.success) return;

    this.broadcast({
      type: 'CARD_PLAYED',
      seat: seatIndex,
      card,
      moveResult: res
    });

    if (res.trickComplete) {
      if (res.roundComplete) {
        let anyReplaced = false;
        this.seats.forEach((seat, idx) => {
          if (!seat.isBot && !seat.permanentAi) {
            if (seat.isAfk || !seat.connected) {
              seat.afkRoundsCount = (seat.afkRoundsCount || 0) + 1;
              if (seat.afkRoundsCount >= 3) {
                seat.isBot = true;
                seat.permanentAi = true;
                seat.name = `${seat.originalName || seat.name} (AI)`;
                if (this.game && this.game.players && this.game.players[idx]) {
                  this.game.players[idx].name = seat.name;
                  this.game.players[idx].isBot = true;
                }
                anyReplaced = true;
                this.broadcast({
                  type: 'CHAT',
                  sender: 'System',
                  text: `${seat.name} was idle/offline for 3 full rounds and has been replaced by AI. They can click "Take Back Control" anytime to play again.`
                });
              }
            } else {
              seat.afkRoundsCount = 0;
            }
          }
        });
        if (anyReplaced) {
          this.broadcastGameState();
        }
      }

      // Allow 2300ms for clients to view cards and watch gathering and directional sweep
      setTimeout(() => {
        if (res.roundComplete) {
          if (!res.gameOver) {
            setTimeout(() => {
              this.game.startRound();
              this.broadcastGameState();
              this.checkHokmSelection();
            }, 2500);
          } else {
            this.broadcastGameState();
          }
        } else {
          this.broadcastGameState();
          this.checkNextTurn();
        }
      }, 2300);
    } else {
      this.broadcastGameState();
      this.checkNextTurn();
    }
  }
}

class OnlineShelemRoom {
  constructor(code, hostWs, hostName = 'Host', settings = {}) {
    this.code = code;
    this.gameType = 'shelem';
    this.hostSocketId = hostWs.id;
    this.settings = {
      deckMode: settings.deckMode || 'standard',
      targetScore: parseInt(settings.targetScore, 10) || 1165,
      withJokers: settings.deckMode === 'jokers' || settings.withJokers === true
    };
    this.status = 'LOBBY'; // LOBBY, PLAYING, FINISHED
    this.phase = 'IDLE'; // BIDDING, WIDOW_DISCARD, PLAYING, ROUND_RESULT, FINISHED
    this.turnTimer = null;

    this.seats = [
      { name: hostName, originalName: hostName, isBot: false, socketId: hostWs.id, connected: true, ready: true, consecutiveAfkTurns: 0, isAfk: false, afkRoundsCount: 0, permanentAi: false },
      { name: 'Bot 1', originalName: 'Bot 1', isBot: true, socketId: null, connected: true, ready: true, consecutiveAfkTurns: 0, isAfk: false, afkRoundsCount: 0, permanentAi: false },
      { name: 'Bot 2', originalName: 'Bot 2', isBot: true, socketId: null, connected: true, ready: true, consecutiveAfkTurns: 0, isAfk: false, afkRoundsCount: 0, permanentAi: false },
      { name: 'Bot 3', originalName: 'Bot 3', isBot: true, socketId: null, connected: true, ready: true, consecutiveAfkTurns: 0, isAfk: false, afkRoundsCount: 0, permanentAi: false }
    ];

    this.clients = new Set();
    this.addClient(hostWs);

    this.scores = [0, 0];
    this.roundNumber = 0;
    this.roundStarter = 0;
    this.hands = [[], [], [], []];
    this.widow = [];
    this.discardedWidow = [];
    this.highBid = 0;
    this.highBidder = null;
    this.bids = {};
    this.passes = new Set();
    this.biddingTurn = 0;
    this.trumpSuit = null;
    this.hokmRevealed = false;
    this.turn = 0;
    this.currentTrick = [];
    this.tricksWon = [[], []];
    this.roundPoints = [0, 0];
    this.trickCount = 0;
    this.lastCompletedTrick = null;
    this.roundHistory = [];
    this.lastTrickWinner = null;
    this.lastRoundResult = null;
  }

  addClient(ws) {
    this.clients.add(ws);
    ws.roomCode = this.code;
  }

  removeClient(ws) {
    this.clients.delete(ws);
    const seatIdx = this.seats.findIndex(s => s.socketId === ws.id);
    if (seatIdx !== -1) {
      const seat = this.seats[seatIdx];
      seat.connected = false;
      if (this.status === 'PLAYING') {
        seat.isAfk = true;
        this.broadcastGameState();
        if (this.phase === 'BIDDING' && this.biddingTurn === seatIdx) {
          this.checkBiddingTurn();
        } else if (this.phase === 'PLAYING' && this.turn === seatIdx) {
          this.checkPlayTurn();
        } else if (this.phase === 'WIDOW_DISCARD' && this.highBidder === seatIdx) {
          this.checkWidowDiscardTimeout();
        }
      } else {
        seat.socketId = null;
        seat.isBot = true;
        seat.name = `Bot ${seatIdx + 1}`;
        if (this.hostSocketId === ws.id) {
          const nextHuman = this.seats.find(s => s.socketId && s.connected && !s.isBot);
          if (nextHuman) this.hostSocketId = nextHuman.socketId;
        }
        this.broadcastLobby();
      }
    }
  }

  getSeatIndexForSocket(socketId) {
    return this.seats.findIndex(s => s.socketId === socketId);
  }

  clearTurnTimer() {
    if (this.turnTimer) {
      clearTimeout(this.turnTimer);
      this.turnTimer = null;
    }
    if (this.unoPenaltyTimers) {
      this.unoPenaltyTimers.forEach((t, i) => {
        if (t) {
          clearTimeout(t);
          this.unoPenaltyTimers[i] = null;
        }
      });
    }
  }

  broadcast(message) {
    const payload = JSON.stringify(message);
    for (const ws of this.clients) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
  }

  broadcastLobby() {
    for (const ws of this.clients) {
      if (ws.readyState === WebSocket.OPEN) {
        const yourSeat = this.getSeatIndexForSocket(ws.id);
        const isHost = (ws.id === this.hostSocketId);
        ws.send(JSON.stringify({
          type: 'LOBBY_UPDATE',
          roomCode: this.code,
          gameType: 'shelem',
          hostId: this.hostSocketId,
          isHost,
          yourSeat,
          status: this.status,
          settings: this.settings,
          seats: this.seats.map((s, idx) => ({
            seat: idx,
            name: s.name,
            isBot: s.isBot,
            isOccupied: s.socketId !== null,
            isOnline: s.isBot ? true : s.connected,
            isHost: s.socketId === this.hostSocketId,
            isMe: s.socketId === ws.id,
            ready: s.ready
          }))
        }));
      }
    }
  }

  broadcastGameState() {
    for (const ws of this.clients) {
      if (ws.readyState === WebSocket.OPEN) {
        const seat = this.getSeatIndexForSocket(ws.id);
        const isHost = (ws.id === this.hostSocketId);
        ws.send(JSON.stringify({
          type: 'GAME_STATE',
          state: {
            gameType: 'shelem',
            phase: this.phase,
            status: this.status,
            mySeat: seat,
            turn: this.phase === 'BIDDING' ? this.biddingTurn : this.turn,
            biddingTurn: this.biddingTurn,
            highBid: this.highBid,
            highBidder: this.highBidder,
            bids: this.bids,
            passes: Array.from(this.passes),
            trumpSuit: this.trumpSuit,
            hokmRevealed: !!this.hokmRevealed,
            currentTrick: this.currentTrick,
            scores: this.scores,
            tricksWonCounts: [
              Math.floor(this.tricksWon[0].length / 4),
              Math.floor(this.tricksWon[1].length / 4)
            ],
            roundPoints: [...this.roundPoints],
            lastCompletedTrick: this.lastCompletedTrick || null,
            roundNumber: this.roundNumber,
            dealer: this.roundStarter,
            targetScore: this.settings.targetScore,
            deckMode: this.settings.deckMode,
            withJokers: this.settings.withJokers,
            widowCount: this.settings.withJokers ? 6 : 4,
            hand: seat !== -1 && this.hands[seat] ? this.hands[seat] : [],
            cardCounts: this.hands.map(h => h ? h.length : 0),
            lastTrickWinner: this.lastTrickWinner,
            lastRoundResult: this.lastRoundResult,
            roundHistory: this.roundHistory,
            players: this.seats.map((s, idx) => ({
              seat: idx,
              name: s.name,
              team: idx % 2,
              isBot: !!s.isBot,
              isOnline: s.isBot ? true : s.connected,
              isAfk: !!s.isAfk,
              isHost: s.socketId === this.hostSocketId,
              isMe: s.socketId === ws.id
            })),
            isHost,
            turnDuration: 15
          }
        }));
      }
    }
  }

  startGame() {
    this.status = 'PLAYING';
    this.clearTurnTimer();
    this.scores = [0, 0];
    this.roundNumber = 0;
    this.roundHistory = [];

    this.seats.forEach((s, idx) => {
      const isHumanConnected = Boolean(
        s.socketId &&
        s.connected &&
        !s.isBot &&
        [...this.clients].some(c => c.id === s.socketId && c.readyState === WebSocket.OPEN)
      );

      if (!isHumanConnected) {
        s.isBot = true;
        s.permanentAi = true;
        s.socketId = null;
        s.connected = true;
        if (!s.name.includes('Bot') && !s.name.includes('(AI)')) {
          s.name = `Bot ${idx + 1}`;
        }
      } else {
        s.originalName = s.originalName || s.name;
        s.isBot = false;
        s.permanentAi = false;
        s.connected = true;
        s.consecutiveAfkTurns = 0;
        s.isAfk = false;
        s.afkRoundsCount = 0;
      }
    });

    this.startRound();
  }

  startRound() {
    this.clearTurnTimer();
    this.roundNumber++;
    const withJokers = !!this.settings.withJokers;
    const deck = shelemLogic.createDeck(withJokers);
    const shuffled = shelemLogic.shuffleDeck(deck);
    const dealt = shelemLogic.dealShelemCards(shuffled, withJokers);

    this.hands = dealt.hands;
    this.widow = dealt.widow;
    this.discardedWidow = [];
    this.phase = 'BIDDING';
    this.roundStarter = (this.roundNumber - 1) % 4;
    this.biddingTurn = this.roundStarter;
    this.highBid = 0;
    this.highBidder = null;
    this.bids = {};
    this.passes = new Set();
    this.trumpSuit = null;
    this.hokmRevealed = false;
    this.turn = 0;
    this.currentTrick = [];
    this.tricksWon = [[], []];
    this.roundPoints = [0, 0];
    this.trickCount = 0;
    this.lastCompletedTrick = null;
    this.lastTrickWinner = null;

    this.broadcast({
      type: 'CHAT',
      sender: 'System',
      text: `Round ${this.roundNumber} started! Bidding begins with ${this.seats[this.biddingTurn].name}.`
    });

    this.broadcastGameState();
    this.checkBiddingTurn();
  }

  checkBiddingTurn() {
    this.clearTurnTimer();
    if (this.phase !== 'BIDDING') return;

    const currentTurn = this.biddingTurn;
    const seat = this.seats[currentTurn];

    if (seat.isBot || seat.permanentAi) {
      this.turnTimer = setTimeout(() => {
        if (this.phase !== 'BIDDING' || this.biddingTurn !== currentTurn) return;
        const botBid = shelemLogic.getBotBid(currentTurn, this.hands[currentTurn], this.highBid, this.highBidder);
        if (botBid && botBid.action === 'bid' && botBid.amount > this.highBid) {
          this.handleBid(currentTurn, botBid.amount);
        } else {
          this.handlePass(currentTurn);
        }
      }, 850);
      return;
    }

    if (!seat.connected || seat.isAfk) {
      this.turnTimer = setTimeout(() => {
        if (this.phase !== 'BIDDING' || this.biddingTurn !== currentTurn) return;
        const botBid = shelemLogic.getBotBid(currentTurn, this.hands[currentTurn], this.highBid, this.highBidder);
        if (botBid && botBid.action === 'bid' && botBid.amount > this.highBid) {
          this.handleBid(currentTurn, botBid.amount);
        } else {
          this.handlePass(currentTurn);
        }
      }, 1000);
      return;
    }

    this.turnTimer = setTimeout(() => {
      if (this.phase !== 'BIDDING' || this.biddingTurn !== currentTurn) return;
      seat.consecutiveAfkTurns = (seat.consecutiveAfkTurns || 0) + 1;
      if (seat.consecutiveAfkTurns >= 3) {
        seat.isAfk = true;
        seat.permanentAi = true;
        this.broadcast({
          type: 'CHAT',
          sender: 'System',
          text: `${seat.name} is AFK (idle for 3 turns). AI taking over until they return.`
        });
      } else {
        this.broadcast({
          type: 'CHAT',
          sender: 'System',
          text: `${seat.name} timed out (${seat.consecutiveAfkTurns}/3). Auto-playing bid.`
        });
      }
      this.broadcastGameState();
      const botBid = shelemLogic.getBotBid(currentTurn, this.hands[currentTurn], this.highBid, this.highBidder);
      if (botBid && botBid.action === 'bid' && botBid.amount > this.highBid) {
        this.handleBid(currentTurn, botBid.amount);
      } else {
        this.handlePass(currentTurn);
      }
    }, 15000);
  }

  handleBid(seat, amount) {
    if (this.phase !== 'BIDDING' || seat !== this.biddingTurn) return;
    amount = parseInt(amount, 10);
    const shelemAmount = this.settings.withJokers ? 400 : 330;
    const maxNormalBid = this.settings.withJokers ? 200 : 165;
    if (isNaN(amount) || amount < 100 || amount <= this.highBid) return;
    if (amount > maxNormalBid && amount !== shelemAmount) return;

    this.highBid = amount;
    this.highBidder = seat;
    this.bids[seat] = amount;

    this.broadcast({
      type: 'CHAT',
      sender: 'System',
      text: `${this.seats[seat].name} bid ${amount}! 🗣️`
    });

    if (this.passes.size === 3 || amount === shelemAmount) {
      this.startWidowDiscard(this.highBidder);
      return;
    }

    this.advanceBiddingTurn();
  }

  handlePass(seat) {
    if (this.phase !== 'BIDDING' || seat !== this.biddingTurn) return;
    this.passes.add(seat);

    this.broadcast({
      type: 'CHAT',
      sender: 'System',
      text: `${this.seats[seat].name} passed.`
    });

    if (this.passes.size === 3 && this.highBidder !== null) {
      this.startWidowDiscard(this.highBidder);
      return;
    }

    if (this.passes.size >= 4) {
      this.broadcast({
        type: 'CHAT',
        sender: 'System',
        text: `All players passed! Re-dealing round... 🔄`
      });
      setTimeout(() => this.startRound(), 1400);
      return;
    }

    this.advanceBiddingTurn();
  }

  advanceBiddingTurn() {
    let next = (this.biddingTurn + 1) % 4;
    while (this.passes.has(next) && this.passes.size < 4) {
      next = (next + 1) % 4;
    }
    this.biddingTurn = next;
    this.broadcastGameState();
    this.checkBiddingTurn();
  }

  startWidowDiscard(bidder) {
    this.clearTurnTimer();
    this.phase = 'WIDOW_DISCARD';
    this.hands[bidder].push(...this.widow);
    this.widow = [];

    this.broadcast({
      type: 'CHAT',
      sender: 'System',
      text: `👑 ${this.seats[bidder].name} won the contract with ${this.highBid} points and took the widow cards!`
    });

    this.broadcastGameState();

    const hakemSeat = this.seats[bidder];
    const countNeeded = this.settings.withJokers ? 6 : 4;

    if (hakemSeat.isBot || hakemSeat.permanentAi || !hakemSeat.connected || hakemSeat.isAfk) {
      this.turnTimer = setTimeout(() => {
        if (this.phase !== 'WIDOW_DISCARD') return;
        const evalRes = shelemLogic.evaluateHandForBidding(this.hands[bidder]);
        const bestSuit = evalRes.bestSuit || 'S';
        const discards = shelemLogic.getBotWidowDiscards(this.hands[bidder], bestSuit, countNeeded);
        this.handleDiscard(bidder, discards);
      }, 1200);
      return;
    }

    this.turnTimer = setTimeout(() => {
      if (this.phase !== 'WIDOW_DISCARD') return;
      hakemSeat.consecutiveAfkTurns = (hakemSeat.consecutiveAfkTurns || 0) + 1;
      if (hakemSeat.consecutiveAfkTurns >= 3) {
        hakemSeat.isAfk = true;
        hakemSeat.permanentAi = true;
        this.broadcast({
          type: 'CHAT',
          sender: 'System',
          text: `${hakemSeat.name} is AFK (idle for 3 turns). AI taking over until they return.`
        });
      } else {
        this.broadcast({
          type: 'CHAT',
          sender: 'System',
          text: `${hakemSeat.name} timed out discarding widow (${hakemSeat.consecutiveAfkTurns}/3). Auto-discarding.`
        });
      }
      this.broadcastGameState();
      const evalRes = shelemLogic.evaluateHandForBidding(this.hands[bidder]);
      const bestSuit = evalRes.bestSuit || 'S';
      const discards = shelemLogic.getBotWidowDiscards(this.hands[bidder], bestSuit, countNeeded);
      this.handleDiscard(bidder, discards);
    }, 20000);
  }

  checkWidowDiscardTimeout() {
    this.startWidowDiscard(this.highBidder);
  }

  handleDiscard(seat, discards) {
    if (this.phase !== 'WIDOW_DISCARD' || seat !== this.highBidder) return;
    if (!Array.isArray(discards)) return;

    const countNeeded = this.settings.withJokers ? 6 : 4;
    if (discards.length !== countNeeded) return;

    this.clearTurnTimer();

    const discardIds = discards.map(c => typeof c === 'string' ? c : (c.id || `${c.suit}-${c.rank}`));
    this.hands[seat] = this.hands[seat].filter(c => {
      const id = c.id || `${c.suit}-${c.rank}`;
      return !discardIds.includes(id);
    });

    this.discardedWidow = discards;
    this.trumpSuit = null;
    this.hokmRevealed = false;
    this.phase = 'PLAYING';
    this.turn = seat;
    this.currentTrick = [];

    this.broadcast({
      type: 'CHAT',
      sender: 'System',
      text: `👑 Hakem ${this.seats[seat].name} discarded ${countNeeded} cards. Hakem will lead the first card to declare Trump!`
    });

    this.broadcastGameState();
    this.checkPlayTurn();
  }

  checkPlayTurn() {
    this.clearTurnTimer();
    if (this.phase !== 'PLAYING') return;

    const currentTurn = this.turn;
    const seat = this.seats[currentTurn];

    if (seat.isBot || seat.permanentAi) {
      this.turnTimer = setTimeout(() => {
        if (this.phase !== 'PLAYING' || this.turn !== currentTurn) return;
        const card = shelemLogic.getBotPlayCard(currentTurn, this.hands[currentTurn], this.currentTrick, this.trumpSuit, this.roundHistory);
        if (card) this.handleCardPlay(currentTurn, card);
      }, 750);
      return;
    }

    if (!seat.connected || seat.isAfk) {
      this.turnTimer = setTimeout(() => {
        if (this.phase !== 'PLAYING' || this.turn !== currentTurn) return;
        const card = shelemLogic.getBotPlayCard(currentTurn, this.hands[currentTurn], this.currentTrick, this.trumpSuit, this.roundHistory);
        if (card) this.handleCardPlay(currentTurn, card);
      }, 1000);
      return;
    }

    this.turnTimer = setTimeout(() => {
      if (this.phase !== 'PLAYING' || this.turn !== currentTurn) return;
      seat.consecutiveAfkTurns = (seat.consecutiveAfkTurns || 0) + 1;
      if (seat.consecutiveAfkTurns >= 3) {
        seat.isAfk = true;
        seat.permanentAi = true;
        this.broadcast({
          type: 'CHAT',
          sender: 'System',
          text: `${seat.name} is AFK (idle for 3 turns). AI taking over until they return.`
        });
      } else {
        this.broadcast({
          type: 'CHAT',
          sender: 'System',
          text: `${seat.name} timed out (${seat.consecutiveAfkTurns}/3). Auto-playing card.`
        });
      }
      this.broadcastGameState();
      const card = shelemLogic.getBotPlayCard(currentTurn, this.hands[currentTurn], this.currentTrick, this.trumpSuit, this.roundHistory);
      if (card) this.handleCardPlay(currentTurn, card);
    }, 15000);
  }

  handleCardPlay(seat, cardInput) {
    if (this.phase !== 'PLAYING' || seat !== this.turn) return;

    const cardId = typeof cardInput === 'string' ? cardInput : (cardInput.id || `${cardInput.suit}-${cardInput.rank}`);
    const cardIdx = this.hands[seat].findIndex(c => (c.id && c.id === cardId) || (`${c.suit}-${c.rank}` === cardId));
    if (cardIdx === -1) return;

    const card = this.hands[seat][cardIdx];
    if (!shelemLogic.isValidPlay(card, this.hands[seat], this.currentTrick, this.trumpSuit)) {
      return;
    }

    this.clearTurnTimer();

    // Hakem's first card determines Trump!
    let justRevealedHokm = false;
    if (!this.hokmRevealed) {
      this.trumpSuit = card.suit === 'JOKER' ? 'S' : card.suit;
      this.hokmRevealed = true;
      justRevealedHokm = true;
    }

    this.hands[seat].splice(cardIdx, 1);
    this.currentTrick.push({ playerIndex: seat, card });

    if (justRevealedHokm) {
      this.broadcast({
        type: 'HOKM_REVEALED',
        trumpSuit: this.trumpSuit,
        hakemSeat: seat,
        leadingCard: card
      });
      this.broadcast({
        type: 'CHAT',
        sender: 'System',
        text: `🎺 Trump declared: ${shelemLogic.SUIT_SYMBOLS[this.trumpSuit]} ${shelemLogic.SUIT_NAMES['en'][this.trumpSuit]}!`
      });
    }

    this.broadcastGameState();

    if (this.currentTrick.length === 4) {
      const winner = shelemLogic.evaluateTrickWinner(this.currentTrick, this.trumpSuit);
      this.lastTrickWinner = winner;
      const winnerTeam = winner % 2;
      this.tricksWon[winnerTeam].push(...this.currentTrick.map(t => t.card));
      this.trickCount++;

      let trickPts = 5 + shelemLogic.calculateCardsPoints(this.currentTrick.map(t => t.card));
      if (this.trickCount === 12) {
        const widowPts = 5 + shelemLogic.calculateCardsPoints(this.discardedWidow);
        trickPts += widowPts;
      }
      this.roundPoints[winnerTeam] += trickPts;

      const winningPlay = this.currentTrick.find(t => t.playerIndex === winner) || this.currentTrick[0];
      this.lastCompletedTrick = {
        winnerSeat: winner,
        winningCard: winningPlay ? winningPlay.card : null,
        cards: this.currentTrick.map(t => ({
          seat: t.playerIndex,
          card: t.card
        }))
      };

      this.broadcast({
        type: 'TRICK_COMPLETE',
        winner,
        trick: this.currentTrick,
        lastCompletedTrick: this.lastCompletedTrick
      });

      const cardsLeft = this.hands.some(h => h.length > 0) && this.trickCount < 12;
      if (!cardsLeft) {
        setTimeout(() => this.finishRound(winner), 1200);
      } else {
        setTimeout(() => {
          this.currentTrick = [];
          this.turn = winner;
          this.broadcastGameState();
          this.checkPlayTurn();
        }, 1300);
      }
    } else {
      this.turn = (this.turn + 1) % 4;
      this.broadcastGameState();
      this.checkPlayTurn();
    }
  }

  finishRound(lastTrickWinner) {
    this.clearTurnTimer();
    this.phase = 'ROUND_RESULT';

    const team0Pts = this.roundPoints[0];
    const team1Pts = this.roundPoints[1];

    const bidderTeam = this.highBidder % 2;
    const defendingTeam = 1 - bidderTeam;
    const bidderPtsMade = (bidderTeam === 0 ? team0Pts : team1Pts);
    const defenderPtsMade = (bidderTeam === 0 ? team1Pts : team0Pts);
    const shelemAmount = this.settings.withJokers ? 400 : 330;
    const totalMax = this.settings.withJokers ? 200 : 165;
    let outcomeType = 'met';

    if (this.highBid === shelemAmount) {
      if (bidderPtsMade === totalMax) {
        outcomeType = 'shelem';
        this.scores[bidderTeam] += shelemAmount;
      } else {
        outcomeType = 'failed';
        this.scores[bidderTeam] -= shelemAmount;
        this.scores[defendingTeam] += defenderPtsMade;
      }
    } else {
      if (bidderPtsMade >= this.highBid) {
        outcomeType = 'met';
        this.scores[bidderTeam] += bidderPtsMade;
        this.scores[defendingTeam] += defenderPtsMade;
      } else {
        outcomeType = 'failed';
        this.scores[bidderTeam] -= this.highBid;
        this.scores[defendingTeam] += defenderPtsMade;
      }
    }

    this.lastRoundResult = {
      roundNum: this.roundNumber,
      bidder: this.highBidder,
      bid: this.highBid,
      trumpSuit: this.trumpSuit,
      team0Pts,
      team1Pts,
      outcomeType,
      scores: [...this.scores]
    };
    this.roundHistory.push(this.lastRoundResult);

    if (this.scores[0] >= this.settings.targetScore || this.scores[1] >= this.settings.targetScore) {
      this.phase = 'FINISHED';
      this.status = 'FINISHED';
      const winnerTeam = this.scores[0] >= this.settings.targetScore ? 0 : 1;
      this.broadcast({
        type: 'GAME_OVER',
        winnerTeam,
        scores: this.scores
      });
    }

    this.broadcastGameState();
  }

  nextRound() {
    if (this.phase !== 'ROUND_RESULT' && this.phase !== 'FINISHED') return;
    if (this.status === 'FINISHED') {
      this.startGame();
    } else {
      this.startRound();
    }
  }
}

class OnlineUnoRoom {
  constructor(code, hostWs, hostName = 'Host', settings = {}) {
    this.code = code;
    this.gameType = 'uno';
    this.hostSocketId = hostWs.id;
    this.settings = {
      targetScore: parseInt(settings.targetScore, 10) || 250
    };
    this.status = 'LOBBY'; // LOBBY, PLAYING, FINISHED
    this.phase = 'IDLE'; // LOBBY, PLAYING, ROUND_RESULT, FINISHED
    this.turnTimer = null;

    this.seats = [
      { name: hostName, originalName: hostName, isBot: false, socketId: hostWs.id, connected: true, ready: true, consecutiveAfkTurns: 0, isAfk: false, afkRoundsCount: 0, permanentAi: false },
      { name: 'Bot 1', originalName: 'Bot 1', isBot: true, socketId: null, connected: true, ready: true, consecutiveAfkTurns: 0, isAfk: false, afkRoundsCount: 0, permanentAi: false },
      { name: 'Bot 2', originalName: 'Bot 2', isBot: true, socketId: null, connected: true, ready: true, consecutiveAfkTurns: 0, isAfk: false, afkRoundsCount: 0, permanentAi: false },
      { name: 'Bot 3', originalName: 'Bot 3', isBot: true, socketId: null, connected: true, ready: true, consecutiveAfkTurns: 0, isAfk: false, afkRoundsCount: 0, permanentAi: false }
    ];

    this.clients = new Set();
    this.addClient(hostWs);

    this.scores = [0, 0, 0, 0];
    this.roundNumber = 0;
    this.roundStarter = 0;
    this.hands = [[], [], [], []];
    this.drawPile = [];
    this.discardPile = [];
    this.activeColor = 'red';
    this.direction = 1;
    this.turn = 0;
    this.pendingDrawCount = 0;
    this.calledUno = [false, false, false, false];
    this.unoPenaltyTimers = [null, null, null, null];
    this.hasDrawnThisTurn = false;
    this.lastRoundResult = null;
  }

  addClient(ws) {
    this.clients.add(ws);
    ws.roomCode = this.code;
  }

  removeClient(ws) {
    this.clients.delete(ws);
    const seatIdx = this.seats.findIndex(s => s.socketId === ws.id);
    if (seatIdx !== -1) {
      const seat = this.seats[seatIdx];
      seat.connected = false;
      if (this.status === 'PLAYING') {
        seat.isAfk = true;
        this.broadcastGameState();
        if (this.turn === seatIdx) {
          this.checkTurn();
        }
      } else {
        seat.socketId = null;
        seat.isBot = true;
        seat.name = `Bot ${seatIdx + 1}`;
        if (this.hostSocketId === ws.id) {
          const nextHuman = this.seats.find(s => s.socketId && s.connected && !s.isBot);
          if (nextHuman) this.hostSocketId = nextHuman.socketId;
        }
        this.broadcastLobby();
      }
    }
  }

  getSeatIndexForSocket(socketId) {
    return this.seats.findIndex(s => s.socketId === socketId);
  }

  clearTurnTimer() {
    if (this.turnTimer) {
      clearTimeout(this.turnTimer);
      this.turnTimer = null;
    }
    if (this.unoPenaltyTimers) {
      this.unoPenaltyTimers.forEach((t, i) => {
        if (t) {
          clearTimeout(t);
          this.unoPenaltyTimers[i] = null;
        }
      });
    }
  }

  broadcast(message) {
    const payload = JSON.stringify(message);
    for (const ws of this.clients) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
  }

  broadcastLobby() {
    for (const ws of this.clients) {
      if (ws.readyState === WebSocket.OPEN) {
        const yourSeat = this.getSeatIndexForSocket(ws.id);
        const isHost = (ws.id === this.hostSocketId);
        ws.send(JSON.stringify({
          type: 'LOBBY_UPDATE',
          roomCode: this.code,
          gameType: 'uno',
          hostId: this.hostSocketId,
          isHost,
          yourSeat,
          status: this.status,
          settings: this.settings,
          seats: this.seats.map((s, idx) => ({
            seat: idx,
            name: s.name,
            isBot: s.isBot,
            isOccupied: s.socketId !== null,
            isOnline: s.isBot ? true : s.connected,
            isHost: s.socketId === this.hostSocketId,
            isMe: s.socketId === ws.id,
            ready: s.ready
          }))
        }));
      }
    }
  }

  broadcastGameState() {
    for (const ws of this.clients) {
      if (ws.readyState === WebSocket.OPEN) {
        const seat = this.getSeatIndexForSocket(ws.id);
        const isHost = (ws.id === this.hostSocketId);
        ws.send(JSON.stringify({
          type: 'GAME_STATE',
          state: {
            gameType: 'uno',
            phase: this.phase,
            status: this.status,
            mySeat: seat,
            turn: this.turn,
            direction: this.direction,
            activeColor: this.activeColor,
            discardPile: this.discardPile,
            drawPileCount: this.drawPile.length,
            pendingDrawCount: this.pendingDrawCount || 0,
            scores: this.scores,
            hasDrawnThisTurn: this.hasDrawnThisTurn,
            hand: (seat !== -1 && this.hands[seat]) ? this.hands[seat] : [],
            cardCounts: this.hands.map(h => (h ? h.length : 0)),
            lastRoundResult: this.lastRoundResult,
            players: this.seats.map((s, idx) => ({
              seat: idx,
              name: s.name,
              isBot: !!s.isBot,
              isOnline: s.isBot ? true : s.connected,
              isAfk: !!s.isAfk,
              permanentAi: !!s.permanentAi,
              isHost: s.socketId === this.hostSocketId,
              isMe: s.socketId === ws.id,
              calledUno: !!this.calledUno[idx]
            })),
            isHost,
            turnDuration: 15
          }
        }));
      }
    }
  }

  startGame() {
    this.status = 'PLAYING';
    this.clearTurnTimer();
    this.scores = [0, 0, 0, 0];
    this.roundNumber = 0;
    this.roundStarter = 0;
    this.pendingDrawCount = 0;

    this.seats.forEach((s, idx) => {
      const isHumanConnected = Boolean(
        s.socketId &&
        s.connected &&
        !s.isBot &&
        [...this.clients].some(c => c.id === s.socketId && c.readyState === WebSocket.OPEN)
      );

      if (!isHumanConnected) {
        s.isBot = true;
        s.permanentAi = true;
        s.socketId = null;
        s.connected = true;
        if (!s.name.includes('Bot') && !s.name.includes('(AI)')) {
          s.name = `Bot ${idx + 1}`;
        }
      } else {
        s.originalName = s.originalName || s.name;
        s.isBot = false;
        s.permanentAi = false;
        s.connected = true;
        s.consecutiveAfkTurns = 0;
        s.isAfk = false;
        s.afkRoundsCount = 0;
      }
    });

    this.startRound();
  }

  startRound() {
    this.clearTurnTimer();
    this.roundNumber++;
    this.phase = 'PLAYING';
    this.status = 'PLAYING';
    this.direction = 1;
    this.turn = this.roundStarter;
    this.calledUno = [false, false, false, false];
    this.pendingDrawCount = 0;
    this.hasDrawnThisTurn = false;
    this.lastRoundResult = null;

    const deck = unoLogic.createDeck();
    const shuffled = unoLogic.shuffleDeck(deck);
    const dealt = unoLogic.dealUnoCards(shuffled, 4, 7);

    this.hands = dealt.hands;
    this.drawPile = dealt.drawPile;
    this.discardPile = dealt.discardPile;
    this.activeColor = dealt.activeColor;

    this.broadcast({
      type: 'CHAT',
      sender: 'System',
      text: `Round ${this.roundNumber} started! Starting color: ${this.activeColor.toUpperCase()}`
    });

    this.broadcastGameState();
    this.checkTurn();
  }

  reshuffleDiscardIntoDraw() {
    if (this.discardPile.length <= 1) return;
    const topCard = this.discardPile.pop();
    this.drawPile = unoLogic.shuffleDeck(this.discardPile);
    this.discardPile = [topCard];
  }

  drawCardsForPlayer(seat, count) {
    for (let i = 0; i < count; i++) {
      if (this.drawPile.length === 0) {
        this.reshuffleDiscardIntoDraw();
      }
      if (this.drawPile.length > 0) {
        this.hands[seat].push(this.drawPile.pop());
      }
    }
    if (this.hands[seat].length > 1) {
      this.calledUno[seat] = false;
      if (this.unoPenaltyTimers && this.unoPenaltyTimers[seat]) {
        clearTimeout(this.unoPenaltyTimers[seat]);
        this.unoPenaltyTimers[seat] = null;
      }
    }
  }

  checkTurn() {
    this.clearTurnTimer();
    if (this.phase !== 'PLAYING') return;

    const currentTurn = this.turn;
    const seat = this.seats[currentTurn];
    const topCard = this.discardPile[this.discardPile.length - 1];

    if (!seat) return;

    if (seat.isBot || seat.permanentAi) {
      this.turnTimer = setTimeout(() => {
        if (this.phase !== 'PLAYING' || this.turn !== currentTurn) return;
        const nextSeat = (currentTurn + this.direction + 4) % 4;
        const nextCount = this.hands[nextSeat] ? this.hands[nextSeat].length : 7;
        const botAction = unoLogic.getBotAction(this.hands[currentTurn], topCard, this.activeColor, {
          nextPlayerCardCount: nextCount,
          pendingDrawCount: this.pendingDrawCount || 0
        });

        if (botAction.action === 'play') {
          if (this.hands[currentTurn].length === 2 && Math.random() < 0.85) {
            this.calledUno[currentTurn] = true;
          }
          this.handleCardPlay(currentTurn, botAction.card, botAction.chosenColor);
        } else {
          // Bot draws (or takes penalty stack if active)
          const hadStack = (this.pendingDrawCount > 0);
          this.handleDrawCard(currentTurn);
          // Only check playable drawn card if no stack was taken
          if (!hadStack) {
            const newlyDrawn = this.hands[currentTurn][this.hands[currentTurn].length - 1];
            if (newlyDrawn && unoLogic.isValidPlay(newlyDrawn, topCard, this.activeColor)) {
              setTimeout(() => {
                if (this.phase !== 'PLAYING' || this.turn !== currentTurn) return;
                const chosenCol = (newlyDrawn.color === 'wild') ? unoLogic.getBotColorChoice(this.hands[currentTurn]) : newlyDrawn.color;
                this.handleCardPlay(currentTurn, newlyDrawn, chosenCol);
              }, 600);
            }
          }
        }
      }, 1000);
      return;
    }

    if (!seat.connected || seat.isAfk) {
      // Disconnected or AFK: auto-play quickly (1s) without waiting 15s turn timer.
      // Keeps seat human and marked offline so the player can rejoin anytime.
      this.turnTimer = setTimeout(() => {
        if (this.phase !== 'PLAYING' || this.turn !== currentTurn) return;
        const nextSeat = (currentTurn + this.direction + 4) % 4;
        const nextCount = this.hands[nextSeat] ? this.hands[nextSeat].length : 7;
        const botAction = unoLogic.getBotAction(this.hands[currentTurn], topCard, this.activeColor, {
          nextPlayerCardCount: nextCount,
          pendingDrawCount: this.pendingDrawCount || 0
        });

        if (botAction.action === 'play') {
          if (this.hands[currentTurn].length === 2 && Math.random() < 0.85) {
            this.calledUno[currentTurn] = true;
          }
          this.handleCardPlay(currentTurn, botAction.card, botAction.chosenColor);
        } else {
          const hadStack = (this.pendingDrawCount > 0);
          this.handleDrawCard(currentTurn);
          if (!hadStack) {
            const newlyDrawn = this.hands[currentTurn][this.hands[currentTurn].length - 1];
            if (newlyDrawn && unoLogic.isValidPlay(newlyDrawn, topCard, this.activeColor)) {
              setTimeout(() => {
                if (this.phase !== 'PLAYING' || this.turn !== currentTurn) return;
                const chosenCol = (newlyDrawn.color === 'wild') ? unoLogic.getBotColorChoice(this.hands[currentTurn]) : newlyDrawn.color;
                this.handleCardPlay(currentTurn, newlyDrawn, chosenCol);
              }, 600);
            }
          }
        }
      }, 1000);
      return;
    }

    // Human player turn timer (15s AFK countdown)
    this.turnTimer = setTimeout(() => {
      if (this.phase !== 'PLAYING' || this.turn !== currentTurn) return;
      seat.consecutiveAfkTurns = (seat.consecutiveAfkTurns || 0) + 1;
      if (seat.consecutiveAfkTurns >= 3) {
        seat.isAfk = true;
        seat.permanentAi = true;
        this.broadcast({
          type: 'CHAT',
          sender: 'System',
          text: `${seat.name} is AFK (idle for 3 turns). AI taking over until they return.`
        });
      } else {
        this.broadcast({
          type: 'CHAT',
          sender: 'System',
          text: `${seat.name} timed out (${seat.consecutiveAfkTurns}/3). Auto-playing turn.`
        });
      }
      this.broadcastGameState();

      // Bot plays on their behalf
      const nextSeat = (currentTurn + this.direction + 4) % 4;
      const nextCount = this.hands[nextSeat] ? this.hands[nextSeat].length : 7;
      const botAction = unoLogic.getBotAction(this.hands[currentTurn], topCard, this.activeColor, {
        nextPlayerCardCount: nextCount,
        pendingDrawCount: this.pendingDrawCount || 0
      });

      if (botAction.action === 'play') {
        this.handleCardPlay(currentTurn, botAction.card, botAction.chosenColor);
      } else {
        this.handleDrawCard(currentTurn);
      }
    }, 15000);
  }

  handleCardPlay(seat, cardInput, chosenColor) {
    if (this.phase !== 'PLAYING' || seat !== this.turn) return;

    const cardId = typeof cardInput === 'string' ? cardInput : (cardInput.id || '');
    const cardIdx = this.hands[seat].findIndex(c => c.id === cardId);
    if (cardIdx === -1) return;

    const card = this.hands[seat][cardIdx];
    const topCard = this.discardPile[this.discardPile.length - 1];

    if (!unoLogic.isValidPlay(card, topCard, this.activeColor, this.pendingDrawCount || 0)) {
      return;
    }

    this.clearTurnTimer();

    const seatObj = this.seats[seat];

    // Remove card from hand
    this.hands[seat].splice(cardIdx, 1);
    this.discardPile.push(card);
    this.activeColor = (card.color === 'wild') ? (chosenColor || 'red') : card.color;
    this.hasDrawnThisTurn = false;

    // Chat announcement
    this.broadcast({
      type: 'CHAT',
      sender: seatObj ? seatObj.name : `Seat ${seat + 1}`,
      text: `played ${card.color.toUpperCase()} ${card.value.toUpperCase()}`
    });

    // Broadcast CARD_PLAYED event for animation
    this.broadcast({
      type: 'CARD_PLAYED',
      seat,
      card,
      activeColor: this.activeColor
    });

    // UNO Shout check & 2-second penalty timer
    if (this.hands[seat].length === 1) {
      this.calledUno[seat] = false;
      if (this.unoPenaltyTimers[seat]) {
        clearTimeout(this.unoPenaltyTimers[seat]);
      }

      // If it's a bot or permanent AI, chance to declare UNO within 800-1400ms
      if (seatObj && (seatObj.isBot || seatObj.permanentAi)) {
        if (Math.random() < 0.85) {
          setTimeout(() => {
            if (this.phase === 'PLAYING' && this.hands[seat] && this.hands[seat].length === 1 && !this.calledUno[seat]) {
              this.handleUnoCall(seat);
            }
          }, 800 + Math.random() * 400);
        }
      }

      // 2-second timer: player can declare uno! for 2 seconds, after that timer 1 penalty card is added
      this.unoPenaltyTimers[seat] = setTimeout(() => {
        if (this.phase === 'PLAYING' && this.hands[seat] && this.hands[seat].length === 1 && !this.calledUno[seat]) {
          this.drawCardsForPlayer(seat, 1);
          const pName = this.seats[seat] ? this.seats[seat].name : `Seat ${seat + 1}`;
          this.broadcast({
            type: 'CHAT',
            sender: 'System',
            text: `⚠️ ${pName} did not declare UNO in 2s! (+1 penalty card)`
          });
          this.broadcastGameState();
        }
      }, 2000);
    } else {
      this.calledUno[seat] = false;
      if (this.unoPenaltyTimers[seat]) {
        clearTimeout(this.unoPenaltyTimers[seat]);
        this.unoPenaltyTimers[seat] = null;
      }
    }

    // Check round victory
    if (this.hands[seat].length === 0) {
      let roundPoints = 0;
      for (let p = 0; p < 4; p++) {
        if (p !== seat) {
          roundPoints += unoLogic.calculateHandPoints(this.hands[p]);
        }
      }
      this.scores[seat] += roundPoints;
      this.lastRoundResult = {
        winnerSeat: seat,
        winnerName: seatObj.name,
        points: roundPoints,
        scores: [...this.scores]
      };

      this.broadcast({
        type: 'CHAT',
        sender: 'System',
        text: `🏆 ${seatObj.name} emptied their hand and won the round! (+${roundPoints} pts)`
      });

      // Check AFK rounds for players
      this.seats.forEach((s) => {
        if (!s.isBot && !s.permanentAi) {
          if (s.isAfk || !s.connected) {
            s.afkRoundsCount = (s.afkRoundsCount || 0) + 1;
            if (s.afkRoundsCount >= 3) {
              s.isBot = true;
              s.permanentAi = true;
              s.name = `${s.originalName || s.name} (AI)`;
              this.broadcast({
                type: 'CHAT',
                sender: 'System',
                text: `${s.name} was idle/offline for 3 full rounds and has been replaced by AI. They can click "Take Back Control" anytime to play again.`
              });
            }
          } else {
            s.afkRoundsCount = 0;
          }
        }
      });

      if (this.scores[seat] >= this.settings.targetScore) {
        this.status = 'FINISHED';
        this.phase = 'FINISHED';
        this.broadcast({
          type: 'CHAT',
          sender: 'System',
          text: `👑 MATCH OVER! ${seatObj.name} won the entire match with ${this.scores[seat]} points!`
        });
      } else {
        this.phase = 'ROUND_RESULT';
      }

      this.broadcastGameState();
      return;
    }

    // Card Effects: skip, reverse, draw2, wild4
    const val = card.value;
    let nextTurn = (this.turn + this.direction + 4) % 4;

    if (val === 'reverse') {
      this.direction = -this.direction;
      nextTurn = (this.turn + this.direction + 4) % 4;
      this.broadcast({
        type: 'CHAT',
        sender: 'System',
        text: `⇄ Direction reversed!`
      });
    } else if (val === 'skip') {
      const skippedSeat = nextTurn;
      this.broadcast({
        type: 'CHAT',
        sender: 'System',
        text: `⊘ ${this.seats[skippedSeat].name} was skipped!`
      });
      nextTurn = (nextTurn + this.direction + 4) % 4;
    } else if (val === 'draw2') {
      this.pendingDrawCount = (this.pendingDrawCount || 0) + 2;
      this.broadcast({
        type: 'CHAT',
        sender: 'System',
        text: `+2 stacked! Total penalty to next player: +${this.pendingDrawCount}`
      });
      nextTurn = (this.turn + this.direction + 4) % 4;
    } else if (val === 'wild4') {
      this.pendingDrawCount = (this.pendingDrawCount || 0) + 4;
      this.broadcast({
        type: 'CHAT',
        sender: 'System',
        text: `+4 stacked! Total penalty to next player: +${this.pendingDrawCount}`
      });
      nextTurn = (this.turn + this.direction + 4) % 4;
    }

    this.turn = nextTurn;
    this.broadcastGameState();
    this.checkTurn();
  }

  handleDrawCard(seat) {
    if (this.phase !== 'PLAYING' || seat !== this.turn) return;

    if (this.pendingDrawCount && this.pendingDrawCount > 0) {
      this.clearTurnTimer();
      const count = this.pendingDrawCount;
      this.pendingDrawCount = 0;
      this.hasDrawnThisTurn = false;
      this.drawCardsForPlayer(seat, count);
      const seatObj = this.seats[seat];

      this.broadcast({
        type: 'CARD_DRAWN',
        seat,
        count
      });

      this.broadcast({
        type: 'CHAT',
        sender: 'System',
        text: `⚠️ ${seatObj ? seatObj.name : `Seat ${seat + 1}`} took the penalty stack and drew ${count} cards!`
      });

      this.turn = (this.turn + this.direction + 4) % 4;
      this.broadcastGameState();
      this.checkTurn();
      return;
    }

    if (this.hasDrawnThisTurn) return;

    if (this.drawPile.length === 0) {
      this.reshuffleDiscardIntoDraw();
    }
    if (this.drawPile.length === 0) return;

    const drawnCard = this.drawPile.pop();
    this.hands[seat].push(drawnCard);
    this.hasDrawnThisTurn = true;
    if (this.hands[seat].length > 1) {
      this.calledUno[seat] = false;
      if (this.unoPenaltyTimers && this.unoPenaltyTimers[seat]) {
        clearTimeout(this.unoPenaltyTimers[seat]);
        this.unoPenaltyTimers[seat] = null;
      }
    }

    const seatObj = this.seats[seat];

    this.broadcast({
      type: 'CARD_DRAWN',
      seat
    });

    this.broadcast({
      type: 'CHAT',
      sender: 'System',
      text: `${seatObj ? seatObj.name : `Seat ${seat + 1}`} drew a card.`
    });

    const topCard = this.discardPile[this.discardPile.length - 1];
    const canPlayDrawn = unoLogic.isValidPlay(drawnCard, topCard, this.activeColor);

    this.broadcastGameState();

    if (!canPlayDrawn) {
      // Auto skip turn if drawn card is not playable
      setTimeout(() => {
        if (this.phase !== 'PLAYING' || this.turn !== seat) return;
        this.handlePass(seat);
      }, 700);
    }
  }

  handlePass(seat) {
    if (this.phase !== 'PLAYING' || seat !== this.turn) return;
    if (!this.hasDrawnThisTurn) return;

    this.clearTurnTimer();
    this.hasDrawnThisTurn = false;
    const seatObj = this.seats[seat];

    this.broadcast({
      type: 'CHAT',
      sender: 'System',
      text: `${seatObj ? seatObj.name : `Seat ${seat + 1}`} passed.`
    });

    this.turn = (this.turn + this.direction + 4) % 4;
    this.broadcastGameState();
    this.checkTurn();
  }

  handleUnoCall(seat) {
    if (seat < 0 || seat > 3) return;
    if (!this.hands[seat] || this.hands[seat].length !== 1) return;
    this.calledUno[seat] = true;
    if (this.unoPenaltyTimers && this.unoPenaltyTimers[seat]) {
      clearTimeout(this.unoPenaltyTimers[seat]);
      this.unoPenaltyTimers[seat] = null;
    }
    const seatObj = this.seats[seat];
    this.broadcast({
      type: 'UNO_CALLED',
      seat,
      name: seatObj ? seatObj.name : `Seat ${seat + 1}`
    });
    this.broadcast({
      type: 'CHAT',
      sender: seatObj ? seatObj.name : `Seat ${seat + 1}`,
      text: `📢 UNO!`
    });
    this.broadcastGameState();
  }

  handleUnoCatch(catcherSeat, targetSeat) {
    if (catcherSeat < 0 || catcherSeat > 3 || targetSeat < 0 || targetSeat > 3) return;
    if (catcherSeat === targetSeat) return;

    if (this.hands[targetSeat].length === 1 && !this.calledUno[targetSeat]) {
      this.drawCardsForPlayer(targetSeat, 2);
      const catcher = this.seats[catcherSeat].name;
      const target = this.seats[targetSeat].name;
      this.broadcast({
        type: 'CARD_DRAWN',
        seat: targetSeat,
        count: 2
      });
      this.broadcast({
        type: 'CHAT',
        sender: 'System',
        text: `⚡ ${catcher} caught ${target} without shouting UNO! (+2 penalty cards)`
      });
      this.broadcastGameState();
    }
  }

  nextRound() {
    if (this.phase !== 'ROUND_RESULT' && this.phase !== 'FINISHED') return;
    if (this.status === 'FINISHED') {
      this.startGame();
    } else {
      this.roundStarter = (this.roundStarter + 1) % 4;
      this.startRound();
    }
  }
}

class OnlineChessRoom {
  constructor(code, hostWs, hostName = 'Host', settings = {}) {
    this.code = code;
    this.gameType = 'chess';
    this.hostSocketId = hostWs.id;
    this.status = 'LOBBY'; // LOBBY, PLAYING, FINISHED
    this.turnTimer = null;
    this.clockInterval = null;
    this.disconnectTimers = [null, null];

    const requestedTime = settings && settings.timeControl !== undefined ? parseInt(settings.timeControl, 10) : 900;
    this.timeControl = !isNaN(requestedTime) && requestedTime >= 0 ? requestedTime : 900;
    this.whiteTime = this.timeControl;
    this.blackTime = this.timeControl;
    this.lastClockTick = null;

    this.seats = [
      { name: hostName, originalName: hostName, isBot: false, socketId: hostWs.id, connected: true, ready: true, color: 'w', consecutiveAfkTurns: 0, isAfk: false },
      { name: 'Bot 2', originalName: 'Bot 2', isBot: true, socketId: null, connected: true, ready: true, color: 'b', consecutiveAfkTurns: 0, isAfk: false }
    ];

    this.clients = new Set();
    this.addClient(hostWs);

    this.gameState = chessLogic.createInitialState();
    this.history = [];
    this.difficulty = (settings && settings.difficulty) || 'medium';
  }

  addClient(ws) {
    this.clients.add(ws);
    ws.roomCode = this.code;
  }

  removeClient(ws) {
    this.clients.delete(ws);
    const seatIdx = this.seats.findIndex(s => s.socketId === ws.id);
    if (seatIdx !== -1) {
      const seat = this.seats[seatIdx];
      seat.connected = false;
      if (this.status === 'PLAYING') {
        seat.isAfk = true;
        this.broadcastGameState();

        // Start 5-minute forfeit timer if human player disconnects during match
        if (!seat.isBot) {
          if (this.disconnectTimers[seatIdx]) {
            clearTimeout(this.disconnectTimers[seatIdx]);
          }
          this.broadcast({
            type: 'CHAT',
            sender: 'System',
            text: `${seat.name} disconnected. They have 5 minutes to reconnect or forfeit the match.`
          });

          this.disconnectTimers[seatIdx] = setTimeout(() => {
            if (this.status === 'PLAYING' && !seat.connected) {
              const opponentIdx = seatIdx === 0 ? 1 : 0;
              const opponentSeat = this.seats[opponentIdx];
              const winnerColor = opponentIdx === 0 ? 'w' : 'b';
              this.status = 'FINISHED';
              this.stopClock();
              this.clearTurnTimer();
              this.broadcast({
                type: 'CHAT',
                sender: 'System',
                text: `${seat.name} was offline for 5 minutes. ${opponentSeat.name} wins by forfeit!`
              });
              this.broadcast({
                type: 'GAME_OVER',
                gameStatus: {
                  status: 'forfeit',
                  winner: winnerColor,
                  forfeitedSeat: seatIdx,
                  reason: 'offline_5_minutes'
                }
              });
            }
          }, 5 * 60 * 1000); // 5 minutes
        }

        this.checkTurn();
      } else {
        seat.socketId = null;
        seat.isBot = true;
        seat.name = `Bot ${seatIdx + 1}`;
        if (this.hostSocketId === ws.id) {
          const nextHuman = this.seats.find(s => s.socketId && s.connected && !s.isBot);
          if (nextHuman) this.hostSocketId = nextHuman.socketId;
        }
        this.broadcastLobby();
      }
    }
  }

  getSeatIndexForSocket(socketId) {
    return this.seats.findIndex(s => s.socketId === socketId);
  }

  broadcast(msg) {
    const raw = JSON.stringify(msg);
    for (const ws of this.clients) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(raw);
      }
    }
  }

  broadcastLobby() {
    for (const ws of this.clients) {
      if (ws.readyState === WebSocket.OPEN) {
        const yourSeat = this.getSeatIndexForSocket(ws.id);
        const isHost = (ws.id === this.hostSocketId);
        const yourColor = yourSeat === 0 ? 'w' : (yourSeat === 1 ? 'b' : null);
        ws.send(JSON.stringify({
          type: 'LOBBY_UPDATE',
          roomCode: this.code,
          hostId: this.hostSocketId,
          isHost,
          yourSeat,
          yourColor,
          timeControl: this.timeControl,
          status: this.status,
          seats: this.seats.map((s, idx) => ({
            seat: idx,
            name: s.name,
            isBot: s.isBot,
            isOccupied: s.socketId !== null,
            isOnline: s.isBot ? true : s.connected,
            isHost: s.socketId === this.hostSocketId,
            isMe: s.socketId === ws.id,
            ready: s.ready,
            color: s.color
          }))
        }));
      }
    }
  }

  broadcastGameState() {
    const fen = chessLogic.toFen(this.gameState);
    for (const ws of this.clients) {
      if (ws.readyState === WebSocket.OPEN) {
        const yourSeat = this.getSeatIndexForSocket(ws.id);
        const yourColor = yourSeat === 0 ? 'w' : (yourSeat === 1 ? 'b' : null);
        ws.send(JSON.stringify({
          type: 'CHESS_STATE_UPDATE',
          roomCode: this.code,
          status: this.status,
          turn: this.gameState.turn,
          fen,
          yourSeat,
          yourColor,
          timeControl: this.timeControl,
          whiteTime: this.whiteTime,
          blackTime: this.blackTime,
          seats: this.seats.map(s => ({
            name: s.name,
            isBot: s.isBot,
            color: s.color,
            connected: s.connected
          }))
        }));
      }
    }
  }

  clearTurnTimer() {
    if (this.turnTimer) {
      clearTimeout(this.turnTimer);
      this.turnTimer = null;
    }
  }

  startClock() {
    this.stopClock();
    if (this.timeControl <= 0) return; // Unlimited
    this.lastClockTick = Date.now();
    this.clockInterval = setInterval(() => {
      if (this.status !== 'PLAYING') {
        this.stopClock();
        return;
      }
      const now = Date.now();
      const deltaSec = Math.max(1, Math.round((now - this.lastClockTick) / 1000));
      this.lastClockTick = now;

      if (this.gameState.turn === 'w') {
        this.whiteTime = Math.max(0, this.whiteTime - deltaSec);
        if (this.whiteTime <= 0) {
          this.status = 'FINISHED';
          this.stopClock();
          this.clearTurnTimer();
          this.broadcast({
            type: 'CHAT',
            sender: 'System',
            text: 'White ran out of time! Black wins on time.'
          });
          this.broadcast({
            type: 'GAME_OVER',
            gameStatus: {
              status: 'timeout',
              winner: 'b',
              loser: 'w'
            }
          });
        }
      } else {
        this.blackTime = Math.max(0, this.blackTime - deltaSec);
        if (this.blackTime <= 0) {
          this.status = 'FINISHED';
          this.stopClock();
          this.clearTurnTimer();
          this.broadcast({
            type: 'CHAT',
            sender: 'System',
            text: 'Black ran out of time! White wins on time.'
          });
          this.broadcast({
            type: 'GAME_OVER',
            gameStatus: {
              status: 'timeout',
              winner: 'w',
              loser: 'b'
            }
          });
        }
      }
    }, 1000);
  }

  stopClock() {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
      this.clockInterval = null;
    }
  }

  startGame() {
    this.status = 'PLAYING';
    this.gameState = chessLogic.createInitialState();
    this.history = [];
    this.whiteTime = this.timeControl;
    this.blackTime = this.timeControl;
    this.startClock();
    const fen = chessLogic.toFen(this.gameState);

    for (const ws of this.clients) {
      if (ws.readyState === WebSocket.OPEN) {
        const yourSeat = this.getSeatIndexForSocket(ws.id);
        const yourColor = yourSeat === 0 ? 'w' : (yourSeat === 1 ? 'b' : null);
        ws.send(JSON.stringify({
          type: 'GAME_STARTED',
          gameType: 'chess',
          fen,
          turn: 'w',
          yourSeat,
          yourColor,
          timeControl: this.timeControl,
          whiteTime: this.whiteTime,
          blackTime: this.blackTime,
          seats: this.seats.map(s => ({
            name: s.name,
            isBot: s.isBot,
            color: s.color,
            connected: s.connected
          }))
        }));
      }
    }

    this.broadcastGameState();
    this.checkTurn();
  }

  checkTurn() {
    this.clearTurnTimer();
    if (this.status !== 'PLAYING') return;

    const currentTurnColor = this.gameState.turn;
    const seatIdx = (currentTurnColor === 'w') ? 0 : 1;
    const seat = this.seats[seatIdx];

    if (seat.isBot || seat.isAfk || !seat.connected) {
      this.turnTimer = setTimeout(() => {
        if (this.status !== 'PLAYING' || this.gameState.turn !== currentTurnColor) return;
        const botMove = chessLogic.getBestMove(this.gameState, this.difficulty);
        if (botMove) {
          this.executeMove(seatIdx, botMove);
        }
      }, 700);
      return;
    }

    // Active human turn (60s AFK timer)
    this.turnTimer = setTimeout(() => {
      if (this.status !== 'PLAYING' || this.gameState.turn !== currentTurnColor) return;
      seat.consecutiveAfkTurns = (seat.consecutiveAfkTurns || 0) + 1;
      const botMove = chessLogic.getBestMove(this.gameState, 'easy');
      if (botMove) {
        this.broadcast({
          type: 'CHAT',
          sender: 'System',
          text: `${seat.name} timed out. Auto-playing move.`
        });
        this.executeMove(seatIdx, botMove);
      }
    }, 60000);
  }

  handleChessMove(ws, data) {
    if (this.status !== 'PLAYING') return;
    const seatIdx = this.getSeatIndexForSocket(ws.id);
    if (seatIdx === -1) return;

    const expectedColor = (seatIdx === 0) ? 'w' : 'b';
    if (this.gameState.turn !== expectedColor) return;

    const move = data.move;
    if (!move) return;

    const legalMoves = chessLogic.getLegalMoves(this.gameState, expectedColor);
    const isValid = legalMoves.some(m => m.from === move.from && m.to === move.to && (!move.promotion || m.promotion === move.promotion));
    if (!isValid) return;

    this.executeMove(seatIdx, move);
  }

  executeMove(seatIdx, move) {
    this.clearTurnTimer();
    this.lastClockTick = Date.now();
    const san = chessLogic.moveToSan(this.gameState, move);
    chessLogic.makeMove(this.gameState, move);
    this.history.push({ move, san });

    this.broadcast({
      type: 'CHESS_MOVE_BROADCAST',
      seat: seatIdx,
      move,
      san,
      fen: chessLogic.toFen(this.gameState),
      whiteTime: this.whiteTime,
      blackTime: this.blackTime
    });

    const gameStatus = chessLogic.getGameStatus(this.gameState);
    if (gameStatus.status !== 'active' && gameStatus.status !== 'check') {
      this.status = 'FINISHED';
      this.stopClock();
      this.broadcast({
        type: 'GAME_OVER',
        gameStatus,
        history: this.history
      });
      return;
    }

    this.broadcastGameState();
    this.checkTurn();
  }

  handleChessResign(ws) {
    if (this.status !== 'PLAYING') return;
    const seatIdx = this.getSeatIndexForSocket(ws.id);
    if (seatIdx === -1) return;
    const resigningSeat = this.seats[seatIdx];
    const winnerColor = (seatIdx === 0) ? 'b' : 'w';
    this.status = 'FINISHED';
    this.stopClock();
    this.clearTurnTimer();
    this.broadcast({
      type: 'CHAT',
      sender: 'System',
      text: `${resigningSeat.name} resigned.`
    });
    this.broadcast({
      type: 'GAME_OVER',
      gameStatus: {
        status: 'checkmate',
        winner: winnerColor,
        resignedSeat: seatIdx
      }
    });
  }
}

let socketIdCounter = 1;

wss.on('connection', (ws) => {
  ws.id = `user_${socketIdCounter++}`;
  ws.roomCode = null;

  ws.on('message', (raw) => {
    try {
      const data = JSON.parse(raw);
      handleClientMessage(ws, data);
    } catch (err) {
      console.error('Invalid WS payload:', err);
    }
  });

  ws.on('close', () => {
    if (ws.roomCode && rooms.has(ws.roomCode)) {
      const room = rooms.get(ws.roomCode);
      room.removeClient(ws);
    }
  });
});

function handleClientMessage(ws, data) {
  const { type } = data;

  if (type === 'CREATE_ROOM') {
    const code = generateRoomCode();
    const gameType = data.gameType || 'hokm';
    let room;
    if (gameType === 'shelem') {
      room = new OnlineShelemRoom(code, ws, data.playerName || 'Player 1', data.settings);
    } else if (gameType === 'uno') {
      room = new OnlineUnoRoom(code, ws, data.playerName || 'Player 1', data.settings);
    } else if (gameType === 'chess') {
      room = new OnlineChessRoom(code, ws, data.playerName || 'Player 1', data.settings);
    } else {
      room = new OnlineRoom(code, ws, data.playerName || 'Player 1');
    }
    rooms.set(code, room);
    ws.send(JSON.stringify({
      type: 'ROOM_CREATED',
      roomCode: code,
      gameType,
      seat: 0
    }));
    room.broadcastLobby();
    return;
  }

  if (type === 'JOIN_ROOM') {
    const code = (data.roomCode || '').toUpperCase().trim();
    if (!rooms.has(code)) {
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Room not found' }));
      return;
    }
    const room = rooms.get(code);

    if (room.status !== 'LOBBY') {
      // Game already in progress: check if player can rejoin their disconnected seat
      const targetName = (data.playerName || '').trim();
      let rejoinSeatIdx = -1;
      if (targetName) {
        rejoinSeatIdx = room.seats.findIndex(s => !s.connected && (s.name === targetName || s.originalName === targetName || s.name === `${targetName} (AI)`));
      }
      if (rejoinSeatIdx === -1) {
        rejoinSeatIdx = room.seats.findIndex(s => !s.connected && !s.isBot);
      }
      if (rejoinSeatIdx === -1) {
        rejoinSeatIdx = room.seats.findIndex(s => !s.connected && s.permanentAi);
      }
      if (rejoinSeatIdx === -1) {
        rejoinSeatIdx = room.seats.findIndex(s => !s.connected && s.originalName && !s.originalName.startsWith('Bot '));
      }

      if (rejoinSeatIdx !== -1) {
        const seat = room.seats[rejoinSeatIdx];
        seat.connected = true;
        seat.socketId = ws.id;
        seat.isAfk = false;
        seat.consecutiveAfkTurns = 0;
        seat.isBot = false;
        seat.permanentAi = false;
        if (seat.originalName) {
          seat.name = seat.originalName;
        }
        room.addClient(ws);

        if (room.gameType === 'chess' && room.disconnectTimers && room.disconnectTimers[rejoinSeatIdx]) {
          clearTimeout(room.disconnectTimers[rejoinSeatIdx]);
          room.disconnectTimers[rejoinSeatIdx] = null;
        }

        ws.send(JSON.stringify({
          type: 'ROOM_JOINED',
          roomCode: code,
          gameType: room.gameType || 'hokm',
          seat: rejoinSeatIdx
        }));

        room.broadcast({
          type: 'CHAT',
          sender: 'System',
          text: `${seat.name} reconnected to the match!`
        });

        if (room.gameType === 'uno' && room.phase === 'PLAYING' && room.turn === rejoinSeatIdx) {
          room.clearTurnTimer();
          room.checkTurn();
        }

        room.broadcastGameState();
        return;
      }

      ws.send(JSON.stringify({ type: 'ERROR', message: 'Game already in progress' }));
      return;
    }

    // In lobby: find first bot seat to take
    const freeSeatIdx = room.seats.findIndex(s => s.isBot);
    if (freeSeatIdx === -1) {
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Room is full' }));
      return;
    }

    const playerName = data.playerName || `Player ${freeSeatIdx + 1}`;
    room.seats[freeSeatIdx] = {
      name: playerName,
      originalName: playerName,
      isBot: false,
      socketId: ws.id,
      connected: true,
      ready: true,
      consecutiveAfkTurns: 0,
      isAfk: false,
      afkRoundsCount: 0,
      permanentAi: false,
      color: room.gameType === 'chess' ? (freeSeatIdx === 0 ? 'w' : 'b') : undefined
    };

    room.addClient(ws);
    ws.send(JSON.stringify({
      type: 'ROOM_JOINED',
      roomCode: code,
      gameType: room.gameType || 'hokm',
      seat: freeSeatIdx
    }));
    room.broadcastLobby();
    return;
  }

  if (type === 'CHANGE_NAME' || type === 'UPDATE_NAME') {
    if (!ws.roomCode || !rooms.has(ws.roomCode)) return;
    const room = rooms.get(ws.roomCode);
    if (room.status !== 'LOBBY') {
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Can only change name in the lobby' }));
      return;
    }
    const cleanName = (data.name || data.playerName || '').trim().slice(0, 15);
    if (!cleanName) return;
    const seatIdx = room.getSeatIndexForSocket(ws.id);
    if (seatIdx !== -1) {
      const oldName = room.seats[seatIdx].name;
      room.seats[seatIdx].name = cleanName;
      room.seats[seatIdx].originalName = cleanName;
      ws.playerName = cleanName;
      if (oldName !== cleanName) {
        room.broadcast({
          type: 'CHAT',
          sender: 'System',
          text: `${oldName} is now known as ${cleanName}`,
          textFa: `${oldName} نام خود را به ${cleanName} تغییر داد.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
      room.broadcastLobby();
    }
    return;
  }

  if (type === 'CLAIM_SEAT') {
    if (!ws.roomCode || !rooms.has(ws.roomCode)) return;
    const room = rooms.get(ws.roomCode);
    if (room.status !== 'LOBBY') return;
    const targetSeat = Number(data.seat);
    if (isNaN(targetSeat) || targetSeat < 0 || targetSeat >= room.seats.length) return;

    // Can only claim if currently bot
    if (room.seats[targetSeat].isBot) {
      const oldSeatIdx = room.getSeatIndexForSocket(ws.id);
      const playerName = data.playerName || (oldSeatIdx !== -1 ? room.seats[oldSeatIdx].name : `Player ${targetSeat + 1}`);

      if (oldSeatIdx !== -1) {
        room.seats[oldSeatIdx] = {
          name: `Bot ${oldSeatIdx + 1}`,
          originalName: `Bot ${oldSeatIdx + 1}`,
          isBot: true,
          socketId: null,
          connected: true,
          ready: true,
          consecutiveAfkTurns: 0,
          isAfk: false,
          afkRoundsCount: 0,
          permanentAi: false,
          color: room.gameType === 'chess' ? (oldSeatIdx === 0 ? 'w' : 'b') : undefined
        };
      }

      room.seats[targetSeat] = {
        name: playerName,
        originalName: playerName,
        isBot: false,
        socketId: ws.id,
        connected: true,
        ready: true,
        consecutiveAfkTurns: 0,
        isAfk: false,
        afkRoundsCount: 0,
        permanentAi: false,
        color: room.gameType === 'chess' ? (targetSeat === 0 ? 'w' : 'b') : undefined
      };

      room.broadcastLobby();
    }
    return;
  }

  if (type === 'TOGGLE_BOT') {
    if (!ws.roomCode || !rooms.has(ws.roomCode)) return;
    const room = rooms.get(ws.roomCode);
    if (room.hostSocketId !== ws.id) return; // Only host can toggle
    const targetSeat = Number(data.seat);
    if (isNaN(targetSeat) || targetSeat < 0 || targetSeat > 3) return;

    const hostSeat = room.getSeatIndexForSocket(room.hostSocketId);
    if (targetSeat === hostSeat) return; // Host seat cannot be bot
    if (room.seats[targetSeat].socketId !== null) return; // Cannot toggle an active player's seat

    if (room.seats[targetSeat].isBot) {
      // Toggle to open
      room.seats[targetSeat].name = `Open Seat ${targetSeat + 1}`;
    } else {
      // Toggle back to bot
      room.seats[targetSeat].isBot = true;
      room.seats[targetSeat].name = `Bot ${targetSeat + 1}`;
    }
    room.broadcastLobby();
    return;
  }

  if (type === 'SWAP_SEATS') {
    if (!ws.roomCode || !rooms.has(ws.roomCode)) return;
    const room = rooms.get(ws.roomCode);
    if (room.hostSocketId !== ws.id) {
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Only the host can rearrange players' }));
      return;
    }
    if (room.status !== 'LOBBY') {
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Can only rearrange players in the lobby' }));
      return;
    }
    const seatA = Number(data.seatA);
    const seatB = Number(data.seatB);
    if (isNaN(seatA) || isNaN(seatB) || seatA < 0 || seatA > 3 || seatB < 0 || seatB > 3) return;
    if (seatA === seatB) return;

    const temp = room.seats[seatA];
    room.seats[seatA] = room.seats[seatB];
    room.seats[seatB] = temp;

    if (room.gameType === 'chess') {
      if (room.seats[0]) room.seats[0].color = 'w';
      if (room.seats[1]) room.seats[1].color = 'b';
    }

    room.broadcast({
      type: 'CHAT',
      sender: 'System',
      text: `${room.seats[seatA].name} and ${room.seats[seatB].name} swapped positions.`
    });
    room.broadcastLobby();
    return;
  }

  if (type === 'SET_TIME_CONTROL') {
    if (!ws.roomCode || !rooms.has(ws.roomCode)) return;
    const room = rooms.get(ws.roomCode);
    if (room.gameType !== 'chess') return;
    if (room.hostSocketId !== ws.id) {
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Only the host can change time control' }));
      return;
    }
    if (room.status !== 'LOBBY') return;
    const tc = parseInt(data.timeControl, 10);
    if (!isNaN(tc) && tc >= 0) {
      room.timeControl = tc;
      room.whiteTime = tc;
      room.blackTime = tc;
      room.broadcastLobby();
    }
    return;
  }

  if (type === 'START_GAME' || type === 'NEW_GAME') {
    if (!ws.roomCode || !rooms.has(ws.roomCode)) return;
    const room = rooms.get(ws.roomCode);
    if (room.hostSocketId !== ws.id) {
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Only the host can start or restart the game' }));
      return;
    }
    room.startGame();
    return;
  }

  if (type === 'SELECT_HOKM') {
    if (!ws.roomCode || !rooms.has(ws.roomCode)) return;
    const room = rooms.get(ws.roomCode);
    if (!room.game || room.game.phase !== 'SELECT_HOKM') return;
    const seat = room.getSeatIndexForSocket(ws.id);
    if (seat !== room.game.hakem) return;

    room.clearTurnTimer();
    const success = room.game.selectHokm(data.suit);
    if (success) {
      const seatObj = room.seats[seat];
      if (seatObj) {
        seatObj.consecutiveAfkTurns = 0;
        seatObj.isAfk = false;
        seatObj.afkRoundsCount = 0;
        seatObj.permanentAi = false;
        seatObj.isBot = false;
        if (seatObj.originalName) seatObj.name = seatObj.originalName;
        if (room.game && room.game.players && room.game.players[seat]) {
          room.game.players[seat].name = seatObj.name;
          room.game.players[seat].isBot = false;
        }
      }
      room.broadcast({
        type: 'HOKM_SELECTED',
        suit: data.suit,
        hakemSeat: seat
      });
      room.broadcastGameState();
      room.checkNextTurn();
    }
    return;
  }

  if (type === 'SHELEM_BID' || type === 'BID') {
    if (!ws.roomCode || !rooms.has(ws.roomCode)) return;
    const room = rooms.get(ws.roomCode);
    if (room.gameType !== 'shelem') return;
    const seat = room.getSeatIndexForSocket(ws.id);
    if (seat === -1) return;
    const seatObj = room.seats[seat];
    if (seatObj) {
      seatObj.consecutiveAfkTurns = 0;
      seatObj.isAfk = false;
      seatObj.isBot = false;
    }
    room.handleBid(seat, Number(data.amount));
    return;
  }

  if (type === 'SHELEM_PASS' || type === 'PASS') {
    if (!ws.roomCode || !rooms.has(ws.roomCode)) return;
    const room = rooms.get(ws.roomCode);
    if (room.gameType !== 'shelem') return;
    const seat = room.getSeatIndexForSocket(ws.id);
    if (seat === -1) return;
    const seatObj = room.seats[seat];
    if (seatObj) {
      seatObj.consecutiveAfkTurns = 0;
      seatObj.isAfk = false;
      seatObj.isBot = false;
    }
    room.handlePass(seat);
    return;
  }

  if (type === 'SHELEM_DISCARD' || type === 'DISCARD') {
    if (!ws.roomCode || !rooms.has(ws.roomCode)) return;
    const room = rooms.get(ws.roomCode);
    if (room.gameType !== 'shelem') return;
    const seat = room.getSeatIndexForSocket(ws.id);
    if (seat === -1) return;
    const seatObj = room.seats[seat];
    if (seatObj) {
      seatObj.consecutiveAfkTurns = 0;
      seatObj.isAfk = false;
      seatObj.isBot = false;
    }
    room.handleDiscard(seat, data.discards);
    return;
  }

  if (type === 'NEXT_ROUND') {
    if (!ws.roomCode || !rooms.has(ws.roomCode)) return;
    const room = rooms.get(ws.roomCode);
    if (room.gameType === 'shelem' || room.gameType === 'uno') {
      room.nextRound();
    }
    return;
  }

  if (type === 'UNO_PLAY_CARD') {
    if (!ws.roomCode || !rooms.has(ws.roomCode)) return;
    const room = rooms.get(ws.roomCode);
    if (room.gameType !== 'uno') return;
    const seat = room.getSeatIndexForSocket(ws.id);
    if (seat === -1) return;
    const seatObj = room.seats[seat];
    if (seatObj && !seatObj.permanentAi) {
      seatObj.consecutiveAfkTurns = 0;
      seatObj.isAfk = false;
    }
    if (data.calledUno) room.calledUno[seat] = true;
    room.handleCardPlay(seat, data.cardId, data.chosenColor);
    return;
  }

  if (type === 'UNO_DRAW_CARD') {
    if (!ws.roomCode || !rooms.has(ws.roomCode)) return;
    const room = rooms.get(ws.roomCode);
    if (room.gameType !== 'uno') return;
    const seat = room.getSeatIndexForSocket(ws.id);
    if (seat === -1) return;
    const seatObj = room.seats[seat];
    if (seatObj && !seatObj.permanentAi) {
      seatObj.consecutiveAfkTurns = 0;
      seatObj.isAfk = false;
    }
    room.handleDrawCard(seat);
    return;
  }

  if (type === 'UNO_PASS') {
    if (!ws.roomCode || !rooms.has(ws.roomCode)) return;
    const room = rooms.get(ws.roomCode);
    if (room.gameType !== 'uno') return;
    const seat = room.getSeatIndexForSocket(ws.id);
    if (seat === -1) return;
    const seatObj = room.seats[seat];
    if (seatObj && !seatObj.permanentAi) {
      seatObj.consecutiveAfkTurns = 0;
      seatObj.isAfk = false;
    }
    room.handlePass(seat);
    return;
  }

  if (type === 'UNO_CALL') {
    if (!ws.roomCode || !rooms.has(ws.roomCode)) return;
    const room = rooms.get(ws.roomCode);
    if (room.gameType !== 'uno') return;
    const seat = room.getSeatIndexForSocket(ws.id);
    if (seat === -1) return;
    const seatObj = room.seats[seat];
    if (seatObj && !seatObj.permanentAi) {
      seatObj.consecutiveAfkTurns = 0;
      seatObj.isAfk = false;
    }
    room.handleUnoCall(seat);
    return;
  }

  if (type === 'UNO_CATCH') {
    if (!ws.roomCode || !rooms.has(ws.roomCode)) return;
    const room = rooms.get(ws.roomCode);
    if (room.gameType !== 'uno') return;
    const seat = room.getSeatIndexForSocket(ws.id);
    if (seat === -1) return;
    room.handleUnoCatch(seat, Number(data.targetSeat));
    return;
  }

  if (type === 'PLAY_CARD') {
    if (!ws.roomCode || !rooms.has(ws.roomCode)) return;
    const room = rooms.get(ws.roomCode);
    const seat = room.getSeatIndexForSocket(ws.id);
    if (seat === -1) return;

    if (room.gameType === 'shelem') {
      if (room.phase !== 'PLAYING') return;
      if (seat !== room.turn) return;

      const card = room.hands[seat].find(c => (c.id && c.id === data.cardId) || (`${c.suit}-${c.rank}` === data.cardId) || (data.card && c.suit === data.card.suit && c.rank === data.card.rank));
      if (!card) return;

      const seatObj = room.seats[seat];
      if (seatObj) {
        seatObj.consecutiveAfkTurns = 0;
        seatObj.isAfk = false;
        seatObj.isBot = false;
      }

      room.handleCardPlay(seat, card);
      return;
    }

    if (!room.game || room.game.phase !== 'PLAYING') return;
    if (seat !== room.game.turn) return;

    const card = room.game.hands[seat].find(c => c.id === data.cardId);
    if (!card) return;

    // Reset AFK counters because human made an active move
    const seatObj = room.seats[seat];
    if (seatObj) {
      seatObj.consecutiveAfkTurns = 0;
      seatObj.isAfk = false;
      seatObj.afkRoundsCount = 0;
      seatObj.permanentAi = false;
      seatObj.isBot = false;
      if (seatObj.originalName) seatObj.name = seatObj.originalName;
      if (room.game && room.game.players && room.game.players[seat]) {
        room.game.players[seat].name = seatObj.name;
        room.game.players[seat].isBot = false;
      }
    }

    room.handleCardPlay(seat, card);
    return;
  }

  if (type === 'TAKE_CONTROL') {
    if (!ws.roomCode || !rooms.has(ws.roomCode)) return;
    const room = rooms.get(ws.roomCode);
    const seatIdx = room.getSeatIndexForSocket(ws.id);
    if (seatIdx === -1) return;
    const seat = room.seats[seatIdx];
    if (!seat) return;

    seat.isBot = false;
    seat.permanentAi = false;
    seat.isAfk = false;
    seat.consecutiveAfkTurns = 0;
    seat.afkRoundsCount = 0;
    seat.connected = true;

    if (seat.originalName) {
      seat.name = seat.originalName;
    } else {
      seat.name = seat.name.replace(/\s*\(AI\)$/i, '');
    }

    if (room.game && room.game.players && room.game.players[seatIdx]) {
      room.game.players[seatIdx].name = seat.name;
      room.game.players[seatIdx].isBot = false;
    }

    room.broadcast({
      type: 'CHAT',
      sender: 'System',
      text: `${seat.name} has taken back control of their seat! 🎮`
    });

    if (room.game) {
      if (room.game.phase === 'PLAYING' && room.game.turn === seatIdx) {
        room.clearTurnTimer();
        room.checkNextTurn();
      } else if (room.game.phase === 'SELECT_HOKM' && room.game.hakem === seatIdx) {
        room.clearTurnTimer();
        room.checkHokmSelection();
      }
    }

    if (room.gameType === 'shelem') {
      if (room.phase === 'PLAYING' && room.turn === seatIdx) {
        room.clearTurnTimer();
        room.checkPlayTurn();
      } else if (room.phase === 'BIDDING' && room.biddingTurn === seatIdx) {
        room.clearTurnTimer();
        room.checkBiddingTurn();
      } else if (room.phase === 'WIDOW_DISCARD' && room.highBidder === seatIdx) {
        room.clearTurnTimer();
        room.startWidowDiscard(seatIdx);
      }
    }

    if (room.gameType === 'uno') {
      if (room.phase === 'PLAYING' && room.turn === seatIdx) {
        room.clearTurnTimer();
        room.checkTurn();
      }
    }

    if (room.gameType === 'chess') {
      if (room.status === 'PLAYING') {
        room.clearTurnTimer();
        room.checkTurn();
      }
    }

    room.broadcastGameState();
    return;
  }

  if (type === 'CHESS_MOVE') {
    if (!ws.roomCode || !rooms.has(ws.roomCode)) return;
    const room = rooms.get(ws.roomCode);
    if (room.gameType !== 'chess') return;
    room.handleChessMove(ws, data);
    return;
  }

  if (type === 'CHESS_RESIGN') {
    if (!ws.roomCode || !rooms.has(ws.roomCode)) return;
    const room = rooms.get(ws.roomCode);
    if (room.gameType !== 'chess') return;
    room.handleChessResign(ws);
    return;
  }

  if (type === 'CHAT' || type === 'CHAT_MESSAGE') {
    if (!ws.roomCode || !rooms.has(ws.roomCode)) return;
    const room = rooms.get(ws.roomCode);
    const seat = room.getSeatIndexForSocket(ws.id);
    const senderName = seat !== -1 ? room.seats[seat].name : 'Spectator';
    const text = String(data.text || '').substring(0, 100);
    room.broadcast({
      type: 'CHAT_MESSAGE',
      sender: senderName,
      text
    });
    room.broadcast({
      type: 'CHAT',
      sender: senderName,
      text
    });
    return;
  }
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(`♠ ♥ Game Hub Server Running ♦ ♣`);
  console.log(`Web interface:  http://localhost:${PORT}`);
  console.log(`Local Network:  http://0.0.0.0:${PORT}`);
  console.log(`Multiplayer:    Ready (WebSocket support active)`);
  console.log(`===============================================`);
});
