# ♠ ♥ Rubik Casino & Card Club ♦ ♣

A fast, lightweight, and responsive card & board game portal crafted with **pure native web technologies (HTML5, CSS3, and JavaScript)**. Features authentic Persian card classics, global hits, and tournament board games with offline smart AI bots and real-time online/LAN multiplayer rooms.

All playing cards are rendered purely using **UTF-8 character symbols** (`♠`, `♥`, `♦`, `♣`, `A`, `K`, `Q`, `J`, `10`..`2`) and native CSS — requiring **zero heavy frameworks**, **zero external asset downloads**, and providing **ultra-crisp scaling at 60 FPS**.

---

## 🌟 Highlights & Features

- **Classic Casino Aesthetic**: Deep emerald green felt baize, polished gold accents, tactile chip controls, and crisp serif typography.
- **Pure Native Stack**: Zero frontend frameworks (no React, Vue, or Webpack required). Instant load times (< 100KB total bundle size).
- **Offline Solo Play**: Play immediately in any browser against smart AI bots — no internet connection or server required.
- **Real-Time Multiplayer (WebSockets)**:
  - 4-letter shareable room codes (e.g. `ABCD`)
  - Direct 1-click invite links (e.g. `http://<ip>:3000/#ABCD`)
  - Instant seat lobbies with automatic AI bot fill for open seats
  - Disconnect handling and reconnect grace periods
- **Synthesized Web Audio Effects**: Dynamic procedural sounds for card sliding, felt taps, clay chip clacks, and victory fanfares generated via the Web Audio API without audio files.
- **Bilingual Support (EN / FA)**: Full Persian (فارسی) RTL layout and English (EN) with seamless one-click toggling.
- **Mobile & Desktop Responsive**: Tailored card fan layouts, touch-friendly tap targets, and tournament clocks for all screen sizes.

---

## 🎮 Included Games

### 1. 👑 Hokm (بازی پاسور حکم)
- Persian 4-player trick-taking card game (2 vs 2 partnerships).
- Hakem crowning with first Ace, Trump declaration on first 5 cards.
- Automatic scoring for sets, tricks, Kot (+2 sets), and Hakem Kot (+3 sets).

### 2. 🃏 Shelem (بازی پاسور شلم)
- Premier Persian contract & bidding card game.
- Bidding phase (100 to 165 points in increments of 5).
- Widow card exchange from the table, trump selection, and scoring with negative penalties and Grand Slam (+330 points).

### 3. 🎴 UNO (بازی کارتی اونو)
- Worldwide party sensation of color and number matching.
- Action cards: Skip (🚫), Reverse (🔄), Draw Two (+2), Wild (🌈), and Wild Draw Four (+4).
- Interactive "UNO!" shout button with 2-second penalty challenge window.

### 4. ♟️ Chess (شطرنج)
- Full implementation of official FIDE rules: castling, en passant, pawn promotion, and check/checkmate/stalemate detection.
- **Smart AI Bot**: Minimax search engine with Alpha-Beta pruning, Piece-Square Tables (PST), and 3 difficulty levels (Easy, Medium, Hard).
- Tournament clocks (3m to 30m), PGN move history, interactive hints, and board flip.

---

## 🚀 Quick Start

### 1. Instant Offline Play (No Server Needed)
Simply open `public/index.html` directly in any web browser to access the Casino Hub and play against offline bots.

### 2. Run Local / LAN Multiplayer Server
To enable multiplayer room codes and local network play:

```bash
# 1. Install dependencies
npm install

# 2. Run logic tests
npm test

# 3. Start the server
npm start
```

Access the hub:
- **Local browser**: `http://localhost:3000`
- **Other devices on same WiFi/LAN**: `http://<your-lan-ip>:3000` (e.g. `http://192.168.1.50:3000`)

---

## 🐳 Deployment

### Running with Docker

A production-ready `Dockerfile` and `.dockerignore` are included:

```bash
# Build the Docker image
docker build -t rubik-card-club .

# Run the container
docker run -d -p 3000:3000 --name rubik-casino rubik-card-club
```

### Running with PM2 (Background Daemon on VPS)

```bash
npm install -g pm2
pm2 start server.js --name "rubik-casino"
pm2 startup
pm2 save
```

---

## 📁 Project Architecture

```
rubik card/
├── public/
│   ├── index.html            # Main Casino Hub / Portal
│   ├── hub.css               # Classic casino felt styles & responsive layout
│   ├── hub.js                # Hub controller & extensible GAMES registry
│   ├── logic.js              # Hokm rules engine & AI logic
│   ├── app.js                # Hokm frontend controller
│   ├── style.css             # Hokm table stylesheet
│   ├── sound.js              # Web Audio synthesizer
│   └── games/
│       ├── shelem/           # Shelem Game Module (HTML, CSS, JS, Logic)
│       ├── uno/              # UNO Game Module (HTML, CSS, JS, Logic)
│       └── chess/            # Chess Game Module (HTML, CSS, JS, Minimax AI)
├── server.js                 # HTTP static server & WebSocket multiplayer manager
├── package.json              # Project metadata & test scripts
├── Dockerfile                # Production Docker container
├── .dockerignore             # Docker build ignores
├── .gitignore                # Git ignores (node_modules, logs, etc.)
├── LICENSE                   # MIT License
└── README.md                 # Project documentation
```

---

## ➕ Adding New Games

The project uses a plug-and-play modular architecture:

1. **Create the game folder**:
   Add a directory in `public/games/<id>/` containing your game's files (`index.html`, `style.css`, `app.js`, `logic.js`).

2. **Register in the hub**:
   Add an entry in `public/hub.js` under the `GAMES` array:
   ```javascript
   {
     id: 'backgammon',
     icon: '🎲',
     status: 'available',
     title: { en: 'Backgammon', fa: 'تخته نرد' },
     subtitle: { en: 'Classic Board Game', fa: 'بازی کهن تخته نرد' },
     players: { en: '2 Players', fa: '۲ نفره' },
     tags: { en: ['Dice Roll', 'Board Strategy'], fa: ['تاس', 'استراتژی'] },
     desc: { en: 'Traditional Persian backgammon...', fa: 'بازی سنتی تخته نرد...' },
     playUrl: '/games/backgammon/',
     onlineUrl: '/games/backgammon/#online',
     rules: { en: '...', fa: '...' }
   }
   ```
3. The new game card will automatically render on the main menu with bilingual support, sound effects, and rules modal.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
