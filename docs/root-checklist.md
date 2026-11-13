# Root Board Game & Hub Enhancements Checklist

## Phase 0: System Architecture & User Profiling
- [x] Inspect existing hub conventions (HTTP, WebSocket, routes, lobbies, UI)
- [x] Create integration report (`/docs/root-integration.md`)
- [x] Create rules decisions document (`/docs/rules-decisions.md`)
- [x] Implement centralized User Data & Caching System (`public/user-cache.js`)
- [x] Add User Profile / Caching UI to Hub header & modal (`public/index.html`, `public/hub.css`, `public/hub.js`)
- [x] Add server-side profile API & caching handlers (`server.js`)

## Phase 1: Lightweight SVG Cards for Hokm & Shelem
- [x] Create `public/cards-svg.js` with lightweight vector suits, authentic pip distributions (Ace big symbol, 2–10 proper pip counts), and distinct court illustrations (J, Q, K)
- [x] Style cards in Hokm (`public/app.js`, `public/games/hokm/app.js`, `public/style.css`, `public/games/hokm/style.css`)
- [x] Style cards in Shelem (`public/games/shelem/app.js`, `public/games/shelem/style.css`)
- [x] Verify animations, fan arcs, and mobile readability for Hokm & Shelem

## Phase 2: Root Base Game Rules Engine (`public/games/root/logic.js`)
- [x] Deterministic PRNG and state model
- [x] Woodland map topology: 12 clearings (Fox, Rabbit, Mouse), building slots, ruins, paths, rivers, forests
- [x] Rule calculation (most pieces, Eyrie ties)
- [x] 54-card Woodland deck & discard pile
- [x] Core mechanics: movement, combat (dice, defenseless, ambushes, hits), crafting, victory conditions (30 VP, Dominance, Coalition)
- [x] Shared legal action generator (movement, battle, placement, crafting, faction actions)

## Phase 3: Faction Implementations
- [x] **Marquise de Cat**: Keep, warriors, wood economy, sawmills, workshops, recruiters, Birdsong wood generation, Daylight action budget, Field Hospital, Evening scoring & draw
- [x] **Eyrie Dynasties**: Leaders, Decree columns (Recruit, Move, Battle, Build), Roosts & roost scoring, Turmoil resolution & score penalties, Lords of the Forest
- [x] **Woodland Alliance**: Supporters stack, Sympathy tokens & tracks, Martial Law, Outrage mechanic, Revolt, Officers & military operations, Guerrilla Warfare
- [x] **Vagabond**: Pawn placement (clearing or forest), characters, items (Ready, Exhausted, Damaged), Satchel & track limits, exploring ruins, quests, aid & relationships (Hostile infamy), slip, repairs

## Phase 4: Server-Authoritative Multiplayer & AI (`server.js`)
- [x] `OnlineRootRoom` class in `server.js`
- [x] Support 2–4 players with any human/AI mix
- [x] Private state projection (`getStateForPlayer`), hiding opponent cards and Alliance supporters
- [x] Reconnect matching by username/seat and action log persistence
- [x] Faction AI for all 4 factions (Easy, Normal, Hard difficulties)

## Phase 5: Tabletop Presentation & SVG Visual Assets (`public/games/root/`)
- [x] `root-assets.svg`: Original SVG sprites for map, clearings, trees, rivers, faction warriors, buildings, tokens, cards, items
- [x] Tabletop interface (`index.html`, `style.css`, `app.js`):
  - Interactive woodland board with zoom/pan
  - Highlighted legal options for movement, battle, placement, crafting
  - Faction panels: Marquise tracks, Eyrie Decree, Alliance Supporters/Sympathy, Vagabond Inventory
  - Visible draw & discard decks with inspectable discard pile
  - Procedural woodland Web Audio (`sound.js`)
  - Desktop, Tablet, and Mobile responsive layouts

## Phase 6: Hub Integration & Verification
- [x] Register Root in `public/hub.js` (metadata, tags, rules modal)
- [x] Register Root card in `public/index.html` and static routes in `server.js`
- [x] Automated tests:
  - `test/root.test.js`: Engine, rules, legal actions, combat
  - `test/root-factions.test.js`: All 4 factions' mechanics
  - `test/root-ai.test.js`: AI games without illegal moves or deadlocks
  - `test/root-multiplayer.test.js`: E2E WebSocket multiplayer & reconnect
  - Verify existing tests (`npm test`) remain 100% green
