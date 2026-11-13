# Root Board Game Integration Report

## 1. System Architecture & Tech Stack

- **Frontend Framework**: Native Vanilla ES6+ JavaScript, HTML5 semantic structure, CSS3 with design variables, Web Audio API procedural sound synthesizers. Zero heavy frontend build dependencies (Vite/Webpack/Babel are not needed, ensuring instant sub-millisecond load times and high FPS).
- **Asset Pipeline**: Pure resolution-independent SVG vector graphics, eliminating external raster images or third-party image CDNs.
- **Server Framework**: Node.js `http` module with high-performance native routing, mime-type streaming, and `ws` (`WebSocketServer`).
- **Realtime Transport**: Low-latency bidirectional WebSockets with JSON message framing.
- **State Management & Authority**: Server-authoritative state machines. Clients send structured intents; the server validates rules, applies deterministic updates using seeded PRNGs, generates private projections (hiding hidden cards from opposing players), and broadcasts delta/full states.
- **Persistence & Reconnection**: Memory-backed and storage-persisted room states with autosave after every intent, seat-reconnect matching by username/seat index, and action event logs for full determinism and replay.
- **Test Tooling**: Node.js built-in assertion tests (`node test/*.test.js`) executed via `npm test`.

---

2. Hub Registration & Navigation

Existing games are registered in `public/hub.js` under the `GAMES` array with bilingual (English & Persian) metadata:
- `id`, `icon`, `suits`, `status`, `title`, `subtitle`, `players`, `tags`, `desc`, `playUrl`, `onlineUrl`, and rich modal `rules`.
- Static routes are handled in `server.js` matching `/root` or `/root/` to `/games/root/index.html`.
- Room API: `/api/room/<code>` returns `{ exists: boolean, gameType: string }`, allowing hub quick-join bar to route directly to `/games/root/#<code>`.

---

3. User Data & Caching System Extension

To satisfy the user requirement:
> "a caching system to preserve and keep usernames and user data"
- Introduce `public/user-cache.js` as the hub's centralized identity and profile manager (`RubikUserCache`).
- Features:
  1. Preserves player username, avatar, preferences (language, sound, theme), match statistics (games played, wins, favorite faction), and recent rooms.
  2. Unifies all fragmented legacy keys (`rubik_player_name`, `hokm_player_name`, `catan_player_name`, etc.) with seamless backwards migration.
  3. Live broadcast across browser tabs via `storage` events.
  4. Server-side profile persistence endpoint `/api/user/profile` and WebSocket handshake identity synchronization (`AUTH` payload).
  5. Hub UI header integration: Player Profile card with editable username, avatar picker, and statistics viewer.

---

4. Card Visual Identity Extension (Hokm & Shelem)

To satisfy the user requirement:
> "lightweight svg's for the hokm and shlem cards for move visual idenity of the cards, one big simbol for Ace- two small ones for two and its relevant untill 10. then a jack, queen and king svg image for J,Q and K's with relevant styles for the card types"
- Implement `public/cards-svg.js` providing crisp, lightweight SVG rendering:
  - **Ace (A)**: Large dominant center suit symbol with decorative accent lines.
  - **Number Cards (2–10)**: Authentic playing-card pip distributions (2 vertical, 3 column, 4 corners, 5 dice-pip, 6 dual-column, 7 offset-column, 8 balanced, 9 3x3 grid, 10 4-2-4 layout).
  - **Court Cards (J, Q, K)**: Original geometric SVG character illustrations with medieval royal crowns, sceptres, armor, and suit-specific color styling.
  - **Jokers** (for Shelem): Distinct colorful jester SVG badge.
- Seamlessly replaces plain unicode suit characters in Hokm and Shelem card components while maintaining full animation, fan-arc, and trick-sweeping physics.

---

5. Root Digital Board Game Integration

- **Module Directory**: `public/games/root/`
  - `index.html`: Tabletop layout (Desktop, Tablet, Mobile responsive) with map board, clearing inspectors, faction boards, decree, supporters, Vagabond inventory, decks, and log.
  - `style.css`: Storybook woodland aesthetic with parchment warmth, olive greens, faction crests, and color-blind safe highlights.
  - `root-assets.svg`: Original SVG sprites for Woodland map, clearings, paths, ruins, faction warriors, buildings, tokens, cards, and items.
  - `sound.js`: Woodland ambient audio and tactile chimes via Web Audio API.
  - `logic.js`: Pure, deterministic base rules engine covering all 4 base factions (Marquise de Cat, Eyrie Dynasties, Woodland Alliance, Vagabond), legal action generator, combat, crafting, scoring, dominance, and coalition victory. Exported for server, browser, and test runner.
  - `app.js`: Client tabletop controller, zoom/pan board, highlighted legal action overlays, card zones, inventory manager, WebSocket networking.
- **Server Implementation**:
  - `OnlineRootRoom` in `server.js`: Manages 2–4 player matches, human/AI seat assignments, server-authoritative intent execution, hidden info redaction, and turn timers.
  - Faction AI: Server-side AI modules for Marquise, Eyrie, Alliance, and Vagabond across Easy, Normal, and Hard difficulties.
- **Test Suite**:
  - `test/root.test.js`: Core engine, legal actions, combat, crafting, victory.
  - `test/root-factions.test.js`: Marquise, Eyrie (Decree & Turmoil), Alliance (Revolt & Sympathy), Vagabond (Items & Quests).
  - `test/root-multiplayer.test.js`: Room creation, join, reconnect, private state projection, and AI execution.
