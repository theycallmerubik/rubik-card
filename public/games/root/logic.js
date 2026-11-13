/**
 * Root: A Game of Woodland Might and Right
 * Authoritative Base Game Rules Engine
 * Implements: 12-Clearing Map, 54-Card Deck, Marquise de Cat, Eyrie Dynasties,
 * Woodland Alliance, Vagabond, Combat, Crafting, Legal Action Generator, State Projection.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.RootLogic = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // =========================================================================
  // 1. SEEDED PSEUDO-RANDOM NUMBER GENERATOR (Mulberry32)
  // =========================================================================
  function createRng(seed) {
    let s = (typeof seed === 'number' ? seed : Date.now()) >>> 0;
    return function () {
      s |= 0;
      s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // =========================================================================
  // 2. MAP TOPOLOGY & CLEARINGS (Official Base Fall Map)
  // =========================================================================
  const CLEARINGS = [
    { id: 1, suit: 'fox', slots: 1, isCorner: true, name: { en: 'Northwest Pines', fa: 'کاجستان شمال‌غربی' }, adj: [2, 5] },
    { id: 2, suit: 'mouse', slots: 2, isCorner: false, name: { en: 'Echo Glade', fa: 'بیشه پژواک' }, adj: [1, 3, 6] },
    { id: 3, suit: 'rabbit', slots: 1, isCorner: true, name: { en: 'Northeast Ridge', fa: 'ستیغ شمال‌شرقی' }, adj: [2, 4] },
    { id: 4, suit: 'rabbit', slots: 2, isCorner: false, name: { en: 'Whispering Hollow', fa: 'گودی نجوا' }, adj: [3, 7, 8] },
    { id: 5, suit: 'mouse', slots: 2, ruin: true, isCorner: false, name: { en: 'Sunken Ruin', fa: 'خرابه‌های فرورفته' }, adj: [1, 6, 9] },
    { id: 6, suit: 'fox', slots: 2, isCorner: false, name: { en: 'River Bend', fa: 'پیچ رودخانه' }, adj: [2, 5, 7, 10] },
    { id: 7, suit: 'mouse', slots: 2, ruin: true, isCorner: false, name: { en: 'Old Oak Copse', fa: 'بیشه بلوط کهن' }, adj: [4, 6, 8, 11] },
    { id: 8, suit: 'fox', slots: 1, isCorner: false, name: { en: 'Amber Gorge', fa: 'تنگه کهربا' }, adj: [4, 7, 12] },
    { id: 9, suit: 'mouse', slots: 1, isCorner: true, name: { en: 'Southwest Bluff', fa: 'صخره جنوب‌غربی' }, adj: [5, 10] },
    { id: 10, suit: 'rabbit', slots: 2, ruin: true, isCorner: false, name: { en: 'Mossy Vale', fa: 'دره خزه‌پوش' }, adj: [6, 9, 11] },
    { id: 11, suit: 'rabbit', slots: 2, ruin: true, isCorner: false, name: { en: 'Shadowbrook Copse', fa: 'سایه‌جوی' }, adj: [7, 10, 12] },
    { id: 12, suit: 'fox', slots: 1, isCorner: true, name: { en: 'Southeast Thicket', fa: 'بیشه جنوب‌شرقی' }, adj: [8, 11] }
  ];

  // Forests between clearings (for Vagabond slip & repair)
  const FORESTS = [
    { id: 'f1', clearings: [1, 2, 5, 6] },
    { id: 'f2', clearings: [2, 3, 4, 6, 7] },
    { id: 'f3', clearings: [4, 7, 8] },
    { id: 'f4', clearings: [5, 6, 9, 10] },
    { id: 'f5', clearings: [6, 7, 10, 11] },
    { id: 'f6', clearings: [7, 8, 11, 12] },
    { id: 'f7', clearings: [1, 5, 9] } // Riverbank grove
  ];

  // Initial ruin items
  const RUIN_ITEMS = ['hammer', 'sword', 'boot', 'bag'];

  // Base Shared Item Supply (craftable by all factions)
  const BASE_ITEM_SUPPLY = {
    sword: 2,
    boot: 2,
    crossbow: 1,
    hammer: 1,
    tea: 2,
    coins: 2,
    bag: 2
  };

  // =========================================================================
  // 3. COMPLETE 54-CARD WOODLAND DECK
  // =========================================================================
  const CARD_DEFINITIONS = [
    // --- AMBUSH CARDS (4) ---
    { id: 'c_ambush_bird', name: 'Bird Ambush', suit: 'bird', isAmbush: true, desc: 'Spring an ambush on defender/attacker (hits dealt before battle dice).' },
    { id: 'c_ambush_fox', name: 'Fox Ambush', suit: 'fox', isAmbush: true, desc: 'Ambush in Fox clearings.' },
    { id: 'c_ambush_rabbit', name: 'Rabbit Ambush', suit: 'rabbit', isAmbush: true, desc: 'Ambush in Rabbit clearings.' },
    { id: 'c_ambush_mouse', name: 'Mouse Ambush', suit: 'mouse', isAmbush: true, desc: 'Ambush in Mouse clearings.' },

    // --- DOMINANCE CARDS (4) ---
    { id: 'c_dom_bird', name: 'Bird Dominance', suit: 'bird', isDominance: true, desc: 'Rule 2 opposite corner clearings at start of Birdsong to win.' },
    { id: 'c_dom_fox', name: 'Fox Dominance', suit: 'fox', isDominance: true, desc: 'Rule 3 Fox clearings at start of Birdsong to win.' },
    { id: 'c_dom_rabbit', name: 'Rabbit Dominance', suit: 'rabbit', isDominance: true, desc: 'Rule 3 Rabbit clearings at start of Birdsong to win.' },
    { id: 'c_dom_mouse', name: 'Mouse Dominance', suit: 'mouse', isDominance: true, desc: 'Rule 3 Mouse clearings at start of Birdsong to win.' },

    // --- ITEM CRAFTING CARDS (BIRD) ---
    { id: 'c_arms_bird', name: 'Woodland Crossbow', suit: 'bird', craftCost: ['fox'], item: 'crossbow', vp: 1 },
    { id: 'c_boots_bird', name: 'Birdsong Boots', suit: 'bird', craftCost: ['rabbit'], item: 'boot', vp: 1 },
    { id: 'c_sword_bird', name: 'Feathered Blade', suit: 'bird', craftCost: ['mouse'], item: 'sword', vp: 2 },

    // --- ITEM CRAFTING CARDS (FOX) ---
    { id: 'c_fox_sword_1', name: 'Foxfolk Bladesmith', suit: 'fox', craftCost: ['fox'], item: 'sword', vp: 2 },
    { id: 'c_fox_tea_1', name: 'Gilded Tea Kettle', suit: 'fox', craftCost: ['fox'], item: 'tea', vp: 2 },
    { id: 'c_fox_boot_1', name: 'Fox Trotters', suit: 'fox', craftCost: ['fox'], item: 'boot', vp: 1 },
    { id: 'c_fox_coins_1', name: 'Tax Collector', suit: 'fox', craftCost: ['fox', 'fox'], item: 'coins', vp: 3 },
    { id: 'c_fox_bag_1', name: 'Forest Knapsack', suit: 'fox', craftCost: ['fox'], item: 'bag', vp: 1 },
    { id: 'c_fox_hammer_1', name: 'Anvil Smithy', suit: 'fox', craftCost: ['fox'], item: 'hammer', vp: 2 },
    { id: 'c_fox_cross_1', name: 'Heavy Crossbow', suit: 'fox', craftCost: ['fox'], item: 'crossbow', vp: 1 },

    // --- ITEM CRAFTING CARDS (RABBIT) ---
    { id: 'c_rab_tea_1', name: 'Herbal Infusion', suit: 'rabbit', craftCost: ['rabbit'], item: 'tea', vp: 2 },
    { id: 'c_rab_boot_1', name: 'Hare-Spring Boots', suit: 'rabbit', craftCost: ['rabbit'], item: 'boot', vp: 1 },
    { id: 'c_rab_coins_1', name: 'Warren Treasury', suit: 'rabbit', craftCost: ['rabbit', 'rabbit'], item: 'coins', vp: 3 },
    { id: 'c_rab_bag_1', name: 'Smuggler Bag', suit: 'rabbit', craftCost: ['rabbit'], item: 'bag', vp: 1 },
    { id: 'c_rab_sword_1', name: 'Carrot Dagger', suit: 'rabbit', craftCost: ['rabbit'], item: 'sword', vp: 2 },
    { id: 'c_rab_cross_1', name: 'Springbow', suit: 'rabbit', craftCost: ['rabbit'], item: 'crossbow', vp: 1 },

    // --- ITEM CRAFTING CARDS (MOUSE) ---
    { id: 'c_mou_tea_1', name: 'Acorn Steeper', suit: 'mouse', craftCost: ['mouse'], item: 'tea', vp: 2 },
    { id: 'c_mou_boot_1', name: 'Quiet Paws', suit: 'mouse', craftCost: ['mouse'], item: 'boot', vp: 1 },
    { id: 'c_mou_coins_1', name: 'Hoarded Pennies', suit: 'mouse', craftCost: ['mouse', 'mouse'], item: 'coins', vp: 3 },
    { id: 'c_mou_bag_1', name: 'Forager Pouch', suit: 'mouse', craftCost: ['mouse'], item: 'bag', vp: 1 },
    { id: 'c_mou_sword_1', name: 'Needle Rapier', suit: 'mouse', craftCost: ['mouse'], item: 'sword', vp: 2 },
    { id: 'c_mou_cross_1', name: 'Miniature Arbalest', suit: 'mouse', craftCost: ['mouse'], item: 'crossbow', vp: 1 },

    // --- PERSISTENT EFFECT & TACTICAL CARDS (25 more cards filling full 54 deck) ---
    { id: 'c_armorers_1', name: 'Armorers', suit: 'fox', craftCost: ['fox'], effect: 'armorers', desc: 'In battle, may discard to ignore all hits taken.' },
    { id: 'c_armorers_2', name: 'Armorers Guild', suit: 'fox', craftCost: ['fox'], effect: 'armorers', desc: 'In battle, may discard to ignore all hits taken.' },
    { id: 'c_sappers_1', name: 'Sappers', suit: 'mouse', craftCost: ['mouse'], effect: 'sappers', desc: 'In battle as defender, may discard to deal 1 extra hit.' },
    { id: 'c_sappers_2', name: 'Underground Sappers', suit: 'mouse', craftCost: ['mouse'], effect: 'sappers', desc: 'In battle as defender, may discard to deal 1 extra hit.' },
    { id: 'c_cobbler_1', name: 'Cobbler', suit: 'rabbit', craftCost: ['rabbit', 'rabbit'], effect: 'cobbler', desc: 'At start of Evening, may take an extra move.' },
    { id: 'c_cobbler_2', name: 'Master Cobbler', suit: 'rabbit', craftCost: ['rabbit', 'rabbit'], effect: 'cobbler', desc: 'At start of Evening, may take an extra move.' },
    { id: 'c_command_warren_1', name: 'Command Warren', suit: 'rabbit', craftCost: ['rabbit', 'rabbit'], effect: 'command_warren', desc: 'At start of Daylight, may initiate 1 free battle.' },
    { id: 'c_command_warren_2', name: 'Command Warren Council', suit: 'rabbit', craftCost: ['rabbit', 'rabbit'], effect: 'command_warren', desc: 'At start of Daylight, may initiate 1 free battle.' },
    { id: 'c_better_burrow_1', name: 'Better Burrow Bank', suit: 'rabbit', craftCost: ['rabbit', 'rabbit'], effect: 'better_burrow', desc: 'At start of Birdsong, you and another player draw 1 card.' },
    { id: 'c_stand_deliver_1', name: 'Stand and Deliver', suit: 'mouse', craftCost: ['mouse', 'mouse', 'mouse'], effect: 'stand_deliver', desc: 'In Daylight, may take a random card from another player in your clearing.' },
    { id: 'c_stand_deliver_2', name: 'Highway Patrol', suit: 'mouse', craftCost: ['mouse', 'mouse', 'mouse'], effect: 'stand_deliver', desc: 'In Daylight, may take a random card from another player in your clearing.' },
    { id: 'c_scouting_party_1', name: 'Scouting Party', suit: 'mouse', craftCost: ['mouse', 'mouse'], effect: 'scouting_party', desc: 'As attacker in battle, cancel defender ambushes.' },
    { id: 'c_scouting_party_2', name: 'Lookout Post', suit: 'mouse', craftCost: ['mouse', 'mouse'], effect: 'scouting_party', desc: 'As attacker in battle, cancel defender ambushes.' },
    { id: 'c_brutal_tactics_1', name: 'Brutal Tactics', suit: 'bird', craftCost: ['fox', 'fox'], effect: 'brutal_tactics', desc: 'In battle as attacker, deal +1 hit, but give defender 1 VP.' },
    { id: 'c_brutal_tactics_2', name: 'Ruthless Charge', suit: 'bird', craftCost: ['fox', 'fox'], effect: 'brutal_tactics', desc: 'In battle as attacker, deal +1 hit, but give defender 1 VP.' },
    { id: 'c_codebreakers_1', name: 'Codebreakers', suit: 'mouse', craftCost: ['mouse'], effect: 'codebreakers', desc: 'Once per Daylight, look at an opponent’s hand.' },
    { id: 'c_tax_collector_1', name: 'Tax Collector Station', suit: 'fox', craftCost: ['fox'], effect: 'tax_collector', desc: 'Once in Daylight, remove 1 own warrior to draw 1 card.' },
    { id: 'c_royal_appeal_1', name: 'Royal Appeal', suit: 'bird', craftCost: ['bird', 'bird'], vp: 2 },
    { id: 'c_woodland_choir_1', name: 'Woodland Choir', suit: 'bird', craftCost: ['bird'], vp: 1 },
    { id: 'c_fox_feast_1', name: 'Fox Feast', suit: 'fox', craftCost: ['fox', 'fox'], vp: 2 },
    { id: 'c_rabbit_festival_1', name: 'Hare Festival', suit: 'rabbit', craftCost: ['rabbit', 'rabbit'], vp: 2 },
    { id: 'c_mouse_bazaar_1', name: 'Mouse Bazaar', suit: 'mouse', craftCost: ['mouse', 'mouse'], vp: 2 },
    { id: 'c_traveler_tales_1', name: 'Traveler Tales', suit: 'bird', craftCost: ['bird'], vp: 1 },
    { id: 'c_ancient_treaty_1', name: 'Ancient Treaty', suit: 'bird', craftCost: ['bird', 'bird', 'bird'], vp: 3 },
    { id: 'c_covert_scout_1', name: 'Covert Scout', suit: 'bird', craftCost: ['bird'], vp: 1 }
  ];

  // =========================================================================
  // 4. FACTION DEFINITIONS & ASYMMETRIC ATTRIBUTES
  // =========================================================================
  const FACTIONS = {
    marquise: {
      id: 'marquise',
      name: { en: 'Marquise de Cat', fa: 'مارکی دو کت (گربه‌ها)' },
      color: '#e67e22',
      difficulty: 'Easy',
      totalWarriors: 25,
      buildingTypes: ['sawmill', 'workshop', 'recruiter'],
      tokenTypes: ['keep', 'wood']
    },
    eyrie: {
      id: 'eyrie',
      name: { en: 'Eyrie Dynasties', fa: 'سلسله شاهین‌ها (پرندگان)' },
      color: '#2980b9',
      difficulty: 'Normal',
      totalWarriors: 20,
      buildingTypes: ['roost'],
      tokenTypes: []
    },
    alliance: {
      id: 'alliance',
      name: { en: 'Woodland Alliance', fa: 'اتحاد جنگل (موش‌ها و روباه‌ها)' },
      color: '#27ae60',
      difficulty: 'Hard',
      totalWarriors: 10,
      buildingTypes: ['base_fox', 'base_rabbit', 'base_mouse'],
      tokenTypes: ['sympathy']
    },
    vagabond: {
      id: 'vagabond',
      name: { en: 'Vagabond', fa: 'راکون سرگردان (ماجراجو)' },
      color: '#8e44ad',
      difficulty: 'Normal',
      totalWarriors: 0,
      buildingTypes: [],
      tokenTypes: []
    }
  };

  const EYRIE_LEADERS = {
    commander: { id: 'commander', name: 'Commander', ability: 'In battle as attacker, deal +1 extra hit.', viziers: ['battle', 'move'] },
    marshall: { id: 'marshall', name: 'Marshall', ability: 'Recruit double warriors in matching clearings.', viziers: ['recruit', 'battle'] },
    builder: { id: 'builder', name: 'Builder', ability: 'Score +1 VP whenever you craft an item.', viziers: ['recruit', 'build'] },
    despot: { id: 'despot', name: 'Despot', ability: 'Score +1 extra VP whenever you remove enemy buildings or tokens in battle.', viziers: ['move', 'build'] }
  };

  const VAGABOND_CHARACTERS = {
    thief: { id: 'thief', name: 'Thief', items: ['boot', 'torch', 'sword', 'tea'], ability: 'Steal: exhaust torch to take a random card from another player in your clearing.' },
    ranger: { id: 'ranger', name: 'Ranger', items: ['boot', 'torch', 'crossbow', 'sword'], ability: 'Hideout: exhaust torch to repair 3 damaged items.' },
    tinker: { id: 'tinker', name: 'Tinker', items: ['boot', 'torch', 'hammer', 'bag'], ability: 'Scavenge: exhaust torch to take a card from the discard pile into hand.' }
  };

  const VAGABOND_QUESTS = [
    { id: 'q_fox_1', suit: 'fox', name: 'Escort Caravan', requiredItems: ['boot', 'torch'], vp: 2 },
    { id: 'q_fox_2', suit: 'fox', name: 'Fend off Bandits', requiredItems: ['sword', 'sword'], vp: 3 },
    { id: 'q_rab_1', suit: 'rabbit', name: 'Give Aid to Warren', requiredItems: ['tea', 'torch'], vp: 2 },
    { id: 'q_rab_2', suit: 'rabbit', name: 'Deliver Messages', requiredItems: ['boot', 'boot'], vp: 2 },
    { id: 'q_mou_1', suit: 'mouse', name: 'Repair Millwheel', requiredItems: ['hammer', 'torch'], vp: 2 },
    { id: 'q_mou_2', suit: 'mouse', name: 'Expel Intruders', requiredItems: ['crossbow', 'sword'], vp: 3 }
  ];

  // Building track progression for Marquise
  const MARQUISE_TRACKS = {
    sawmill: { costs: [0, 1, 2, 3, 3, 4], vps: [0, 1, 2, 3, 4, 5] },
    workshop: { costs: [0, 1, 2, 3, 3, 4], vps: [0, 2, 2, 3, 4, 5] },
    recruiter: { costs: [0, 1, 2, 3, 3, 4], vps: [0, 1, 1, 2, 3, 4] }
  };

  // Roost track VP scoring for Eyrie at Evening
  const EYRIE_ROOST_VPS = [0, 1, 2, 3, 4, 4, 5];

  // Sympathy placement cost progression for Alliance
  const ALLIANCE_SYMPATHY_COSTS = [1, 1, 1, 2, 2, 2, 3, 3, 3, 3];
  const ALLIANCE_SYMPATHY_VPS = [0, 1, 1, 1, 2, 2, 3, 4, 4, 4];

  // =========================================================================
  // 5. GAME STATE INITIALIZER
  // =========================================================================
  function createInitialState(options = {}) {
    const seed = typeof options.seed === 'number' ? options.seed : (Date.now() & 0xFFFFFFFF);
    const rng = createRng(seed);

    // Shuffle deck
    const deck = [...CARD_DEFINITIONS];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const temp = deck[i];
      deck[i] = deck[j];
      deck[j] = temp;
    }

    // Set up clearings
    const clearings = CLEARINGS.map(c => ({
      id: c.id,
      suit: c.suit,
      adj: [...c.adj],
      maxSlots: c.slots,
      hasRuin: !!c.ruin,
      ruinItem: c.ruin ? RUIN_ITEMS[(c.id % RUIN_ITEMS.length)] : null,
      pieces: {
        // Warriors per faction
        marquise: 0,
        eyrie: 0,
        alliance: 0,
        // Buildings and tokens: array of { type: string, faction: string }
        buildings: [],
        tokens: []
      }
    }));

    // Player seats & faction assignment
    const seatFactions = options.factions || ['marquise', 'eyrie', 'alliance', 'vagabond'];
    const players = seatFactions.map((fId, idx) => {
      const fDef = FACTIONS[fId];
      return {
        seat: idx,
        faction: fId,
        name: (options.playerNames && options.playerNames[idx]) || fDef.name.en,
        isBot: options.bots ? !!options.bots[idx] : false,
        difficulty: (options.difficulties && options.difficulties[idx]) || 'normal',
        score: 0,
        dominanceCard: null,
        coalitionTarget: null,
        hand: [],
        craftedEffects: []
      };
    });

    // Faction-specific state records
    const factionData = {
      marquise: {
        keepClearing: 1, // Default northwest corner
        woodInSupply: 8,
        sawmillsRemaining: 6,
        workshopsRemaining: 6,
        recruitersRemaining: 6,
        actionsRemaining: 3,
        warriorsInSupply: 25
      },
      eyrie: {
        leader: 'commander',
        availableLeaders: ['marshall', 'builder', 'despot'],
        usedLeaders: [],
        decree: {
          recruit: ['c_ambush_bird'], // Vizier 1
          move: ['c_brutal_tactics_1'], // Vizier 2
          battle: [],
          build: []
        },
        roostsRemaining: 7,
        warriorsInSupply: 20
      },
      alliance: {
        supporters: [], // Hidden supporter cards stack
        sympathyRemaining: 10,
        officers: 0,
        basesRemaining: { fox: 1, rabbit: 1, mouse: 1 },
        warriorsInSupply: 10,
        operationsRemaining: 0
      },
      vagabond: {
        character: 'thief',
        locationType: 'clearing', // 'clearing' or 'forest'
        currentLocation: 10, // clearing ID or forest ID
        items: [
          { type: 'boot', state: 'ready' },
          { type: 'torch', state: 'ready' },
          { type: 'sword', state: 'ready' },
          { type: 'tea', state: 'ready' }
        ],
        quests: VAGABOND_QUESTS.slice(0, 3),
        completedQuests: [],
        relationships: {
          marquise: { level: 'indifferent', pointsGiven: 0 },
          eyrie: { level: 'indifferent', pointsGiven: 0 },
          alliance: { level: 'indifferent', pointsGiven: 0 }
        }
      }
    };

    // Deal starting hands (3 cards each)
    players.forEach(p => {
      p.hand = deck.splice(0, 3);
    });

    // Execute Standard Official Setup:
    // 1. Marquise places Keep in clearing 1, Sawmill in 1, Workshop in 2, Recruiter in 5, and 1 warrior in all clearings except corner 12
    const cl1 = clearings.find(c => c.id === 1);
    if (cl1) {
      cl1.pieces.tokens.push({ type: 'keep', faction: 'marquise' });
      cl1.pieces.buildings.push({ type: 'sawmill', faction: 'marquise' });
      factionData.marquise.sawmillsRemaining--;
    }
    const cl2 = clearings.find(c => c.id === 2);
    if (cl2) {
      cl2.pieces.buildings.push({ type: 'workshop', faction: 'marquise' });
      factionData.marquise.workshopsRemaining--;
    }
    const cl5 = clearings.find(c => c.id === 5);
    if (cl5) {
      cl5.pieces.buildings.push({ type: 'recruiter', faction: 'marquise' });
      factionData.marquise.recruitersRemaining--;
    }

    clearings.forEach(c => {
      if (c.id !== 12) {
        c.pieces.marquise = (c.id === 1) ? 4 : 1; // 4 in keep, 1 in others
        factionData.marquise.warriorsInSupply -= c.pieces.marquise;
      }
    });

    // 2. Eyrie sets up in corner opposite Keep (Clearing 12)
    const cl12 = clearings.find(c => c.id === 12);
    if (cl12) {
      cl12.pieces.buildings.push({ type: 'roost', faction: 'eyrie' });
      cl12.pieces.eyrie = 6;
      factionData.eyrie.roostsRemaining--;
      factionData.eyrie.warriorsInSupply -= 6;
    }

    // 3. Woodland Alliance draws 3 cards into supporters stack
    factionData.alliance.supporters = deck.splice(0, 3);

    // 4. Vagabond places pawn in clearing 10 (or central forest)
    factionData.vagabond.currentLocation = 10;

    return {
      version: 1,
      seed,
      rngStep: 0,
      status: 'PLAYING',
      winner: null,
      victoryType: null,
      activePlayerIndex: 0, // Marquise starts
      phase: 'BIRDSONG', // BIRDSONG, DAYLIGHT, EVENING
      subPhase: null, // For multi-step actions (battle dice, ambush window, damage assignment)
      pendingDecision: null,
      deck,
      discardPile: [],
      sharedItemSupply: { ...BASE_ITEM_SUPPLY },
      clearings,
      players,
      factionData,
      actionLog: [
        { type: 'GAME_STARTED', timestamp: Date.now(), text: 'The Woodland conflict begins.' }
      ]
    };
  }

  // =========================================================================
  // 6. RULE / CONTROL CALCULATION (Law of Root 4.2)
  // =========================================================================
  function getClearingRuler(clearing) {
    if (!clearing) return null;
    let counts = { marquise: 0, eyrie: 0, alliance: 0 };

    // Count warriors
    counts.marquise += (clearing.pieces.marquise || 0);
    counts.eyrie += (clearing.pieces.eyrie || 0);
    counts.alliance += (clearing.pieces.alliance || 0);

    // Count buildings (tokens do not count toward rule)
    if (clearing.pieces.buildings) {
      clearing.pieces.buildings.forEach(b => {
        if (counts[b.faction] !== undefined) counts[b.faction]++;
      });
    }

    let maxCount = 0;
    let rulers = [];
    for (const [faction, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        rulers = [faction];
      } else if (count === maxCount && count > 0) {
        rulers.push(faction);
      }
    }

    if (maxCount === 0) return null;
    // Lords of the Forest: Eyrie wins ties!
    if (rulers.includes('eyrie')) {
      return 'eyrie';
    }
    // If tie between non-Eyrie, nobody rules
    return rulers.length === 1 ? rulers[0] : null;
  }

  function factionRulesClearing(clearing, faction) {
    return getClearingRuler(clearing) === faction;
  }

  // =========================================================================
  // 7. SHARED LEGAL ACTION GENERATOR
  // =========================================================================
  function getLegalActions(state, playerIndex) {
    if (state.status !== 'PLAYING') return [];
    if (state.activePlayerIndex !== playerIndex && !state.pendingDecision) return [];

    // If an interrupt / pending decision is waiting for this player
    if (state.pendingDecision) {
      if (state.pendingDecision.targetPlayerIndex === playerIndex) {
        return state.pendingDecision.legalOptions || [];
      }
      return [];
    }

    const player = state.players[playerIndex];
    if (!player) return [];
    const faction = player.faction;
    const actions = [];

    // Phase progression action: Advance Phase
    if (state.phase === 'BIRDSONG') {
      actions.push({ type: 'ADVANCE_PHASE', from: 'BIRDSONG', to: 'DAYLIGHT', text: 'Proceed to Daylight' });
    } else if (state.phase === 'DAYLIGHT') {
      actions.push({ type: 'ADVANCE_PHASE', from: 'DAYLIGHT', to: 'EVENING', text: 'Proceed to Evening' });
    } else if (state.phase === 'EVENING') {
      actions.push({ type: 'ADVANCE_PHASE', from: 'EVENING', to: 'END_TURN', text: 'End Turn' });
    }

    // --- FACTION ACTIONS PER PHASE ---
    if (faction === 'marquise') {
      getMarquiseActions(state, playerIndex, actions);
    } else if (faction === 'eyrie') {
      getEyrieActions(state, playerIndex, actions);
    } else if (faction === 'alliance') {
      getAllianceActions(state, playerIndex, actions);
    } else if (faction === 'vagabond') {
      getVagabondActions(state, playerIndex, actions);
    }

    return actions;
  }

  // --- Marquise Actions ---
  function getMarquiseActions(state, playerIndex, actions) {
    const fData = state.factionData.marquise;

    if (state.phase === 'BIRDSONG') {
      // Wood generation: Sawmills generate 1 wood each at their clearing
      state.clearings.forEach(cl => {
        const sawmills = cl.pieces.buildings.filter(b => b.type === 'sawmill' && b.faction === 'marquise').length;
        if (sawmills > 0 && fData.woodInSupply >= sawmills) {
          actions.push({
            type: 'MARQUISE_PLACE_WOOD',
            clearingId: cl.id,
            count: sawmills,
            text: `Place ${sawmills} Wood at Sawmill in Clearing ${cl.id}`
          });
        }
      });
    }

    if (state.phase === 'DAYLIGHT') {
      // Action Budget: 3 base actions (can spend Bird card for +1 action)
      if (fData.actionsRemaining > 0) {
        // 1. Battle: Any clearing with Marquise warriors and enemy pieces
        state.clearings.forEach(cl => {
          if ((cl.pieces.marquise || 0) > 0) {
            const enemyFactions = getEnemiesInClearing(cl, 'marquise');
            enemyFactions.forEach(target => {
              actions.push({
                type: 'BATTLE',
                clearingId: cl.id,
                attackerFaction: 'marquise',
                defenderFaction: target,
                text: `Battle ${FACTIONS[target].name.en} in Clearing ${cl.id}`
              });
            });
          }
        });

        // 2. March (Move up to 2 times): Any movement respecting rule
        getLegalMoves(state, 'marquise').forEach(m => {
          actions.push({
            type: 'MOVE',
            ...m,
            text: `Move ${m.count} warrior(s) from Clearing ${m.from} to ${m.to}`
          });
        });

        // 3. Recruit: Place 1 warrior at each recruiter (once per turn)
        if (fData.warriorsInSupply > 0) {
          actions.push({
            type: 'MARQUISE_RECRUIT',
            text: 'Recruit warriors at all Recruiters'
          });
        }

        // 4. Build: Sawmill, Workshop, Recruiter in ruled clearings with free slots and connected wood
        ['sawmill', 'workshop', 'recruiter'].forEach(bType => {
          const track = MARQUISE_TRACKS[bType];
          const remaining = fData[`${bType}sRemaining`];
          if (remaining > 0) {
            const cost = track.costs[6 - remaining];
            state.clearings.forEach(cl => {
              if (cl.pieces.buildings.length < cl.maxSlots && !cl.hasRuin && factionRulesClearing(cl, 'marquise')) {
                // Check connected wood
                const woodAvailable = getConnectedWood(state, cl.id, 'marquise');
                if (woodAvailable >= cost) {
                  actions.push({
                    type: 'MARQUISE_BUILD',
                    buildingType: bType,
                    clearingId: cl.id,
                    woodCost: cost,
                    text: `Build ${bType} in Clearing ${cl.id} (Cost: ${cost} Wood)`
                  });
                }
              }
            });
          }
        });

        // 5. Overwork: Spend a card matching clearing to place 1 wood at sawmill
        const hand = state.players[playerIndex].hand;
        hand.forEach((card, cardIdx) => {
          state.clearings.forEach(cl => {
            const hasSawmill = cl.pieces.buildings.some(b => b.type === 'sawmill' && b.faction === 'marquise');
            if (hasSawmill && (card.suit === cl.suit || card.suit === 'bird') && fData.woodInSupply > 0) {
              actions.push({
                type: 'MARQUISE_OVERWORK',
                cardIndex: cardIdx,
                clearingId: cl.id,
                text: `Overwork Sawmill in Clearing ${cl.id} using ${card.name}`
              });
            }
          });
        });
      }

      // Spend Bird card for extra Daylight action
      const hand = state.players[playerIndex].hand;
      hand.forEach((card, cardIdx) => {
        if (card.suit === 'bird' && !card.isAmbush && !card.isDominance) {
          actions.push({
            type: 'MARQUISE_EXTRA_ACTION',
            cardIndex: cardIdx,
            text: `Spend Bird Card (${card.name}) for +1 Daylight Action`
          });
        }
      });

      // Crafting using Workshops
      getCraftableCards(state, playerIndex, 'workshop').forEach(c => actions.push(c));
    }
  }

  // --- Eyrie Actions ---
  function getEyrieActions(state, playerIndex, actions) {
    const player = state.players[playerIndex];
    const fData = state.factionData.eyrie;

    if (state.phase === 'BIRDSONG') {
      // 1. Add 1 or 2 cards from hand to Decree (at most 1 Bird card)
      player.hand.forEach((card, cardIdx) => {
        ['recruit', 'move', 'battle', 'build'].forEach(col => {
          actions.push({
            type: 'EYRIE_ADD_TO_DECREE',
            cardIndex: cardIdx,
            column: col,
            text: `Add ${card.name} (${card.suit}) to Decree: ${col.toUpperCase()}`
          });
        });
      });

      // 2. A New Roost: If Eyrie has 0 roosts on board, place 1 roost and 3 warriors in clearing with fewest pieces
      const totalRoostsOnBoard = 7 - fData.roostsRemaining;
      if (totalRoostsOnBoard === 0) {
        state.clearings.forEach(cl => {
          if (cl.pieces.buildings.length < cl.maxSlots && !cl.hasRuin) {
            actions.push({
              type: 'EYRIE_NEW_ROOST',
              clearingId: cl.id,
              text: `Establish New Roost in Clearing ${cl.id}`
            });
          }
        });
      }
    }

    if (state.phase === 'DAYLIGHT') {
      // Crafting using Roosts
      getCraftableCards(state, playerIndex, 'roost').forEach(c => actions.push(c));

      // Resolve Decree columns in order: Recruit -> Move -> Battle -> Build
      actions.push({
        type: 'EYRIE_RESOLVE_DECREE',
        text: 'Execute programmed actions in the Decree'
      });
    }

    if (state.phase === 'EVENING') {
      // Score VP based on Roosts on map
      const roostCount = 7 - fData.roostsRemaining;
      const vp = EYRIE_ROOST_VPS[Math.min(roostCount, 6)];
      actions.push({
        type: 'EYRIE_EVENING_SCORE',
        vp,
        text: `Score ${vp} VP for ${roostCount} Roost(s) on the board`
      });
    }
  }

  // --- Woodland Alliance Actions ---
  function getAllianceActions(state, playerIndex, actions) {
    const fData = state.factionData.alliance;

    if (state.phase === 'BIRDSONG') {
      // 1. Revolt: Spend 2 matching supporters at sympathetic clearing to remove enemy pieces and establish Base
      ['fox', 'rabbit', 'mouse'].forEach(suit => {
        if (fData.basesRemaining[suit] > 0) {
          const matchingSupporters = fData.supporters.filter(c => c.suit === suit || c.suit === 'bird');
          if (matchingSupporters.length >= 2) {
            state.clearings.forEach(cl => {
              const hasSympathy = cl.pieces.tokens.some(t => t.type === 'sympathy' && t.faction === 'alliance');
              if (cl.suit === suit && hasSympathy && cl.pieces.buildings.length < cl.maxSlots && !cl.hasRuin) {
                actions.push({
                  type: 'ALLIANCE_REVOLT',
                  clearingId: cl.id,
                  suit,
                  text: `Revolt in Clearing ${cl.id} (${suit}) to establish Base`
                });
              }
            });
          }
        }
      });

      // 2. Spread Sympathy: Spend supporters according to sympathy track + martial law
      if (fData.sympathyRemaining > 0) {
        const trackCost = ALLIANCE_SYMPATHY_COSTS[10 - fData.sympathyRemaining];
        state.clearings.forEach(cl => {
          const hasSympathy = cl.pieces.tokens.some(t => t.type === 'sympathy' && t.faction === 'alliance');
          if (!hasSympathy) {
            // Check martial law (+1 supporter if 3+ enemy warriors)
            const enemyWarriors = (cl.pieces.marquise || 0) + (cl.pieces.eyrie || 0);
            const totalCost = trackCost + (enemyWarriors >= 3 ? 1 : 0);
            const matchingSupporters = fData.supporters.filter(c => c.suit === cl.suit || c.suit === 'bird');
            if (matchingSupporters.length >= totalCost) {
              actions.push({
                type: 'ALLIANCE_SPREAD_SYMPATHY',
                clearingId: cl.id,
                cost: totalCost,
                text: `Spread Sympathy to Clearing ${cl.id} (Cost: ${totalCost} supporters)`
              });
            }
          }
        });
      }
    }

    if (state.phase === 'DAYLIGHT') {
      // Crafting using Sympathy tokens
      getCraftableCards(state, playerIndex, 'sympathy').forEach(c => actions.push(c));

      // Mobilize: Move a card from hand to supporters stack
      const hand = state.players[playerIndex].hand;
      hand.forEach((card, cardIdx) => {
        actions.push({
          type: 'ALLIANCE_MOBILIZE',
          cardIndex: cardIdx,
          text: `Mobilize ${card.name} into Supporters stack`
        });
      });

      // Train: Spend card matching an established base to recruit an Officer
      hand.forEach((card, cardIdx) => {
        ['fox', 'rabbit', 'mouse'].forEach(suit => {
          if (fData.basesRemaining[suit] === 0 && (card.suit === suit || card.suit === 'bird')) {
            actions.push({
              type: 'ALLIANCE_TRAIN_OFFICER',
              cardIndex: cardIdx,
              text: `Train Officer using ${card.name} (${suit} base)`
            });
          }
        });
      });
    }

    if (state.phase === 'EVENING') {
      // Military Operations: Each officer grants 1 action (Move, Battle, Recruit, Organize)
      if (fData.operationsRemaining > 0) {
        // Move warriors
        getLegalMoves(state, 'alliance').forEach(m => {
          actions.push({
            type: 'MOVE',
            ...m,
            text: `Officer Move: ${m.count} warrior(s) from Clearing ${m.from} to ${m.to}`
          });
        });

        // Battle
        state.clearings.forEach(cl => {
          if ((cl.pieces.alliance || 0) > 0) {
            const enemies = getEnemiesInClearing(cl, 'alliance');
            enemies.forEach(target => {
              actions.push({
                type: 'BATTLE',
                clearingId: cl.id,
                attackerFaction: 'alliance',
                defenderFaction: target,
                text: `Officer Battle ${FACTIONS[target].name.en} in Clearing ${cl.id}`
              });
            });
          }
        });

        // Organize: Remove 1 warrior to place 1 sympathy token
        state.clearings.forEach(cl => {
          const hasSympathy = cl.pieces.tokens.some(t => t.type === 'sympathy' && t.faction === 'alliance');
          if ((cl.pieces.alliance || 0) > 0 && !hasSympathy && fData.sympathyRemaining > 0) {
            actions.push({
              type: 'ALLIANCE_ORGANIZE',
              clearingId: cl.id,
              text: `Organize in Clearing ${cl.id} (Swap warrior for Sympathy)`
            });
          }
        });
      }
    }
  }

  // --- Vagabond Actions ---
  function getVagabondActions(state, playerIndex, actions) {
    const fData = state.factionData.vagabond;
    const readyBoots = fData.items.filter(i => i.type === 'boot' && i.state === 'ready').length;
    const readyTorches = fData.items.filter(i => i.type === 'torch' && i.state === 'ready').length;
    const readySwords = fData.items.filter(i => i.type === 'sword' && i.state === 'ready').length;
    const readyCrossbows = fData.items.filter(i => i.type === 'crossbow' && i.state === 'ready').length;
    const readyHammers = fData.items.filter(i => i.type === 'hammer' && i.state === 'ready').length;

    if (state.phase === 'BIRDSONG') {
      // 1. Refresh items (up to 3 + 2 per Tea item)
      const teaCount = fData.items.filter(i => i.type === 'tea' && i.state !== 'damaged').length;
      const refreshLimit = 3 + (teaCount * 2);
      actions.push({
        type: 'VAGABOND_REFRESH',
        limit: refreshLimit,
        text: `Refresh up to ${refreshLimit} exhausted items`
      });

      // 2. Slip: Free move to adjacent clearing or forest without exhausting Boots
      if (fData.locationType === 'clearing') {
        const curCl = CLEARINGS.find(c => c.id === fData.currentLocation);
        if (curCl) {
          curCl.adj.forEach(destId => {
            actions.push({
              type: 'VAGABOND_SLIP',
              toType: 'clearing',
              toId: destId,
              text: `Slip into Clearing ${destId}`
            });
          });
          // Slip into adjacent forest
          FORESTS.forEach(f => {
            if (f.clearings.includes(curCl.id)) {
              actions.push({
                type: 'VAGABOND_SLIP',
                toType: 'forest',
                toId: f.id,
                text: `Slip into Deep Forest (${f.id}) to hide and repair`
              });
            }
          });
        }
      } else if (fData.locationType === 'forest') {
        const forest = FORESTS.find(f => f.id === fData.currentLocation);
        if (forest) {
          forest.clearings.forEach(clId => {
            actions.push({
              type: 'VAGABOND_SLIP',
              toType: 'clearing',
              toId: clId,
              text: `Slip from Forest into Clearing ${clId}`
            });
          });
        }
      }
    }

    if (state.phase === 'DAYLIGHT') {
      // If in forest, entire day is spent repairing all damaged items
      if (fData.locationType === 'forest') {
        actions.push({
          type: 'VAGABOND_REPAIR_ALL_IN_FOREST',
          text: 'Rest in deep forest to repair ALL damaged items'
        });
        return;
      }

      const curCl = CLEARINGS.find(c => c.id === fData.currentLocation);
      if (!curCl) return;

      // 1. Move: Exhaust 1 Boot (+1 if clearing has hostile faction pieces)
      if (readyBoots > 0) {
        curCl.adj.forEach(destId => {
          actions.push({
            type: 'VAGABOND_MOVE',
            toId: destId,
            text: `Move to Clearing ${destId} (Exhaust 1 Boot)`
          });
        });
      }

      // 2. Explore Ruin: Exhaust 1 Torch to explore ruin in current clearing
      const clState = state.clearings.find(c => c.id === curCl.id);
      if (clState && clState.hasRuin && readyTorches > 0) {
        actions.push({
          type: 'VAGABOND_EXPLORE_RUIN',
          clearingId: curCl.id,
          text: `Explore Ruin in Clearing ${curCl.id} (Exhaust Torch)`
        });
      }

      // 3. Battle: Exhaust 1 Sword to fight an enemy faction in current clearing
      if (readySwords > 0 && clState) {
        const enemies = getEnemiesInClearing(clState, 'vagabond');
        enemies.forEach(target => {
          actions.push({
            type: 'BATTLE',
            clearingId: curCl.id,
            attackerFaction: 'vagabond',
            defenderFaction: target,
            text: `Battle ${FACTIONS[target].name.en} in Clearing ${curCl.id} (Exhaust Sword)`
          });
        });
      }

      // 4. Strike with Crossbow: Exhaust crossbow to immediately remove 1 enemy piece
      if (readyCrossbows > 0 && clState) {
        const enemies = getEnemiesInClearing(clState, 'vagabond');
        enemies.forEach(target => {
          actions.push({
            type: 'VAGABOND_CROSSBOW_STRIKE',
            targetFaction: target,
            clearingId: curCl.id,
            text: `Strike ${FACTIONS[target].name.en} with Crossbow`
          });
        });
      }

      // 5. Quests: Complete matching quest in current clearing suit
      fData.quests.forEach((q, qIdx) => {
        if (q.suit === curCl.suit) {
          const hasItems = q.requiredItems.every(req => {
            return fData.items.some(i => i.type === req && i.state === 'ready');
          });
          if (hasItems) {
            actions.push({
              type: 'VAGABOND_COMPLETE_QUEST',
              questIndex: qIdx,
              text: `Complete Quest: ${q.name} (+${q.vp} VP)`
            });
          }
        }
      });

      // 6. Aid: Give matching card to faction in current clearing to take item & advance relationship
      const hand = state.players[playerIndex].hand;
      hand.forEach((card, cardIdx) => {
        if (card.suit === curCl.suit || card.suit === 'bird') {
          const presentFactions = getEnemiesInClearing(clState, 'vagabond');
          presentFactions.forEach(targetFaction => {
            actions.push({
              type: 'VAGABOND_AID',
              targetFaction,
              cardIndex: cardIdx,
              text: `Aid ${FACTIONS[targetFaction].name.en} with ${card.name}`
            });
          });
        }
      });

      // 7. Crafting using Hammers matching current clearing suit
      if (readyHammers > 0) {
        hand.forEach((card, cardIdx) => {
          if (card.craftCost && card.craftCost.length <= readyHammers) {
            const matchesSuit = card.craftCost.every(s => s === curCl.suit || s === 'bird');
            if (matchesSuit) {
              actions.push({
                type: 'CRAFT_CARD',
                cardIndex: cardIdx,
                text: `Craft ${card.name} using Hammer(s)`
              });
            }
          }
        });
      }
    }
  }

  // =========================================================================
  // 8. COMBAT RESOLUTION & AMBUSH SYSTEM (Law of Root 4.3)
  // =========================================================================
  function resolveBattle(state, clearingId, attackerFaction, defenderFaction, options = {}) {
    const clearing = state.clearings.find(c => c.id === clearingId);
    if (!clearing) throw new Error('Invalid battle clearing');

    const rng = createRng(state.seed + state.rngStep++);

    // 1. Roll two 0-3 dice (official dice faces: 0, 1, 2, 3)
    const die1 = Math.floor(rng() * 4);
    const die2 = Math.floor(rng() * 4);

    let attackerRoll = Math.max(die1, die2);
    let defenderRoll = Math.min(die1, die2);

    // Guerrilla Warfare (Alliance defense): Alliance takes higher die!
    if (defenderFaction === 'alliance') {
      const temp = attackerRoll;
      attackerRoll = defenderRoll;
      defenderRoll = temp;
    }

    // 2. Hit Caps based on warrior counts
    const attackerWarriors = (clearing.pieces[attackerFaction] || 0);
    const defenderWarriors = (clearing.pieces[defenderFaction] || 0);

    let maxAttackerHits = attackerWarriors;
    let maxDefenderHits = defenderWarriors;

    // Vagabond exception: max hits equal ready swords
    if (attackerFaction === 'vagabond') {
      const vItems = state.factionData.vagabond.items;
      maxAttackerHits = vItems.filter(i => i.type === 'sword' && i.state === 'ready').length;
    }
    if (defenderFaction === 'vagabond') {
      const vItems = state.factionData.vagabond.items;
      maxDefenderHits = vItems.filter(i => i.type === 'sword' && i.state === 'ready').length;
    }

    let attackerHits = Math.min(attackerRoll, maxAttackerHits);
    let defenderHits = Math.min(defenderRoll, maxDefenderHits);

    // 3. Defenseless bonus: +1 hit to attacker if defender has 0 warriors
    const isDefenseless = (defenderWarriors === 0 && defenderFaction !== 'vagabond');
    if (isDefenseless) {
      attackerHits += 1;
    }

    // Eyrie Commander leader bonus: +1 extra hit when attacking
    if (attackerFaction === 'eyrie' && state.factionData.eyrie.leader === 'commander') {
      attackerHits += 1;
    }

    // 4. Apply damage to defender
    const defenderLosses = applyDamage(state, clearing, defenderFaction, attackerHits);
    // 5. Apply damage to attacker
    const attackerLosses = applyDamage(state, clearing, attackerFaction, defenderHits);

    // 6. Score VPs for removing buildings & tokens (+1 VP per piece)
    const attackerPlayer = state.players.find(p => p.faction === attackerFaction);
    const defenderPlayer = state.players.find(p => p.faction === defenderFaction);

    if (attackerPlayer && defenderLosses.buildingsTokensRemoved > 0) {
      attackerPlayer.score += defenderLosses.buildingsTokensRemoved;
      // Vagabond Infamy bonus: +1 extra VP per piece removed from hostile factions
      if (attackerFaction === 'vagabond') {
        const rel = state.factionData.vagabond.relationships[defenderFaction];
        if (rel && rel.level === 'hostile') {
          attackerPlayer.score += defenderLosses.totalRemoved;
        }
      }
    }
    if (defenderPlayer && attackerLosses.buildingsTokensRemoved > 0) {
      defenderPlayer.score += attackerLosses.buildingsTokensRemoved;
    }

    checkVictory(state);

    const result = {
      clearingId,
      attackerFaction,
      defenderFaction,
      dice: [die1, die2],
      attackerRoll,
      defenderRoll,
      attackerHits,
      defenderHits,
      isDefenseless,
      defenderLosses,
      attackerLosses
    };

    state.actionLog.push({
      type: 'BATTLE_RESOLVED',
      timestamp: Date.now(),
      data: result,
      text: `Battle in Clearing ${clearingId}: ${FACTIONS[attackerFaction].name.en} dealt ${attackerHits} hits; ${FACTIONS[defenderFaction].name.en} dealt ${defenderHits} hits.`
    });

    return result;
  }

  function applyDamage(state, clearing, faction, hits) {
    let remainingHits = hits;
    let warriorsRemoved = 0;
    let buildingsTokensRemoved = 0;

    if (faction === 'vagabond') {
      // Vagabond damage damages items in satchel
      const vItems = state.factionData.vagabond.items;
      for (let i = 0; i < remainingHits; i++) {
        const readyItem = vItems.find(it => it.state === 'ready') || vItems.find(it => it.state === 'exhausted');
        if (readyItem) {
          readyItem.state = 'damaged';
          buildingsTokensRemoved++;
        }
      }
      return { totalRemoved: buildingsTokensRemoved, warriorsRemoved: 0, buildingsTokensRemoved };
    }

    // 1. Damage warriors first
    const warriors = clearing.pieces[faction] || 0;
    const removeWarriors = Math.min(warriors, remainingHits);
    clearing.pieces[faction] -= removeWarriors;
    state.factionData[faction].warriorsInSupply += removeWarriors;
    remainingHits -= removeWarriors;
    warriorsRemoved = removeWarriors;

    // 2. Damage buildings and tokens second
    while (remainingHits > 0) {
      const bIdx = clearing.pieces.buildings.findIndex(b => b.faction === faction);
      if (bIdx !== -1) {
        clearing.pieces.buildings.splice(bIdx, 1);
        buildingsTokensRemoved++;
        remainingHits--;
        continue;
      }
      const tIdx = clearing.pieces.tokens.findIndex(t => t.faction === faction);
      if (tIdx !== -1) {
        clearing.pieces.tokens.splice(tIdx, 1);
        buildingsTokensRemoved++;
        remainingHits--;
        continue;
      }
      break;
    }

    return { totalRemoved: warriorsRemoved + buildingsTokensRemoved, warriorsRemoved, buildingsTokensRemoved };
  }

  // =========================================================================
  // 9. HELPER ROUTINES (Pathfinding, Wood Connection, Enemies)
  // =========================================================================
  function getEnemiesInClearing(clearing, myFaction) {
    const enemies = [];
    ['marquise', 'eyrie', 'alliance'].forEach(f => {
      if (f !== myFaction) {
        const hasWarriors = (clearing.pieces[f] || 0) > 0;
        const hasBuildings = clearing.pieces.buildings.some(b => b.faction === f);
        const hasTokens = clearing.pieces.tokens.some(t => t.faction === f);
        if (hasWarriors || hasBuildings || hasTokens) {
          enemies.push(f);
        }
      }
    });
    return enemies;
  }

  function getLegalMoves(state, faction) {
    const moves = [];
    state.clearings.forEach(cl => {
      const warriorCount = cl.pieces[faction] || 0;
      if (warriorCount > 0) {
        const rulesOrigin = factionRulesClearing(cl, faction);
        cl.adj.forEach(destId => {
          const destCl = state.clearings.find(c => c.id === destId);
          if (destCl) {
            const rulesDest = factionRulesClearing(destCl, faction);
            // Law of Root 4.2: Must rule origin, destination, or both
            if (rulesOrigin || rulesDest) {
              for (let count = 1; count <= warriorCount; count++) {
                moves.push({ from: cl.id, to: destId, count });
              }
            }
          }
        });
      }
    });
    return moves;
  }

  function getConnectedWood(state, targetClearingId, faction) {
    // Breadth-first search for connected clearings ruled by Marquise containing wood
    const visited = new Set();
    const queue = [targetClearingId];
    visited.add(targetClearingId);

    let totalWood = 0;

    while (queue.length > 0) {
      const curId = queue.shift();
      const cl = state.clearings.find(c => c.id === curId);
      if (!cl) continue;

      // Count wood tokens in this clearing
      const woodTokens = cl.pieces.tokens.filter(t => t.type === 'wood' && t.faction === faction).length;
      totalWood += woodTokens;

      cl.adj.forEach(neighborId => {
        if (!visited.has(neighborId)) {
          const neighborCl = state.clearings.find(c => c.id === neighborId);
          if (neighborCl && factionRulesClearing(neighborCl, faction)) {
            visited.add(neighborId);
            queue.push(neighborId);
          }
        }
      });
    }

    return totalWood;
  }

  function getCraftableCards(state, playerIndex, craftingPieceType) {
    const player = state.players[playerIndex];
    const faction = player.faction;
    const actions = [];

    // Count available crafting pieces per suit
    const pieceSuits = [];
    state.clearings.forEach(cl => {
      let count = 0;
      if (craftingPieceType === 'workshop') {
        count = cl.pieces.buildings.filter(b => b.type === 'workshop' && b.faction === faction).length;
      } else if (craftingPieceType === 'roost') {
        count = cl.pieces.buildings.filter(b => b.type === 'roost' && b.faction === faction).length;
      } else if (craftingPieceType === 'sympathy') {
        count = cl.pieces.tokens.filter(t => t.type === 'sympathy' && t.faction === faction).length;
      }
      for (let i = 0; i < count; i++) {
        pieceSuits.push(cl.suit);
      }
    });

    player.hand.forEach((card, cardIdx) => {
      if (card.craftCost && card.craftCost.length > 0) {
        // Check if supply has the item if it's an item card
        if (card.item && (state.sharedItemSupply[card.item] || 0) <= 0) {
          return;
        }

        // Verify available piece suits cover the card's cost
        const tempPieces = [...pieceSuits];
        let canCraft = true;
        for (const reqSuit of card.craftCost) {
          const idx = tempPieces.findIndex(s => s === reqSuit || reqSuit === 'bird');
          if (idx !== -1) {
            tempPieces.splice(idx, 1);
          } else {
            canCraft = false;
            break;
          }
        }

        if (canCraft) {
          actions.push({
            type: 'CRAFT_CARD',
            cardIndex: cardIdx,
            item: card.item || null,
            vp: card.vp || 0,
            text: `Craft ${card.name} (${card.item ? 'Item: ' + card.item : '+' + (card.vp || 0) + ' VP'})`
          });
        }
      }
    });

    return actions;
  }

  // =========================================================================
  // 10. VICTORY CHECK (Law of Root 3.1)
  // =========================================================================
  function checkVictory(state) {
    // 1. 30 Victory Points
    for (const player of state.players) {
      if (player.score >= 30) {
        state.status = 'FINISHED';
        state.winner = player.faction;
        state.victoryType = 'POINTS';
        state.actionLog.push({
          type: 'GAME_OVER',
          timestamp: Date.now(),
          winner: player.faction,
          victoryType: 'POINTS',
          text: `${FACTIONS[player.faction].name.en} achieved victory with ${player.score} points!`
        });
        return;
      }
    }
  }

  // =========================================================================
  // 11. REDACTED PER-SEAT STATE PROJECTION (Information Security)
  // =========================================================================
  function getStateForPlayer(state, viewerSeat) {
    if (viewerSeat === null || viewerSeat === undefined || viewerSeat === -1) {
      // Spectator view: hide all hands and Alliance supporters
      return {
        ...state,
        deck: { count: state.deck.length },
        players: state.players.map(p => ({
          ...p,
          handCount: p.hand.length,
          hand: []
        })),
        factionData: {
          ...state.factionData,
          alliance: {
            ...state.factionData.alliance,
            supportersCount: state.factionData.alliance.supporters.length,
            supporters: []
          }
        }
      };
    }

    const viewingPlayer = state.players[viewerSeat];
    const isAlliance = viewingPlayer && viewingPlayer.faction === 'alliance';

    return {
      ...state,
      deck: { count: state.deck.length },
      players: state.players.map(p => {
        const isSelf = p.seat === viewerSeat;
        return {
          ...p,
          handCount: p.hand.length,
          hand: isSelf ? p.hand : [] // Only own cards visible!
        };
      }),
      factionData: {
        ...state.factionData,
        alliance: {
          ...state.factionData.alliance,
          supportersCount: state.factionData.alliance.supporters.length,
          // Supporters stack only visible to Alliance player
          supporters: isAlliance ? state.factionData.alliance.supporters : []
        }
      }
    };
  }

  return {
    CLEARINGS,
    FORESTS,
    FACTIONS,
    EYRIE_LEADERS,
    VAGABOND_CHARACTERS,
    VAGABOND_QUESTS,
    CARD_DEFINITIONS,
    MARQUISE_TRACKS,
    EYRIE_ROOST_VPS,
    ALLIANCE_SYMPATHY_COSTS,
    ALLIANCE_SYMPATHY_VPS,
    createRng,
    createInitialState,
    getClearingRuler,
    factionRulesClearing,
    getLegalActions,
    resolveBattle,
    checkVictory,
    getStateForPlayer
  };
});
