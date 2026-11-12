const assert = require('assert');
const catan = require('../public/games/catan/logic.js');

console.log('--- Running Catan Deterministic Map Generation & Validation Tests ---');

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}`);
    throw err;
  }
}

// 1. Seed reproducibility & Versioning
runTest('Same seed produces identical map tiles, tokens, and robber location', () => {
  const seed = 12345;
  const map1 = catan.generateMap({ seed, profile: 'base' });
  const map2 = catan.generateMap({ seed, profile: 'base' });

  assert.strictEqual(map1.seed, map2.seed);
  assert.strictEqual(map1.generatorVersion, catan.MAP_GENERATOR_VERSION);
  assert.strictEqual(map1.robberHexId, map2.robberHexId);
  assert.strictEqual(map1.tiles.length, map2.tiles.length);

  for (let i = 0; i < map1.tiles.length; i++) {
    assert.strictEqual(map1.tiles[i].id, map2.tiles[i].id);
    assert.strictEqual(map1.tiles[i].terrain, map2.tiles[i].terrain);
    assert.strictEqual(map1.tiles[i].number, map2.tiles[i].number);
    assert.strictEqual(map1.tiles[i].hasRobber, map2.tiles[i].hasRobber);
  }
});

runTest('Different seeds produce different board layouts', () => {
  const mapA = catan.generateMap({ seed: 100, profile: 'base' });
  const mapB = catan.generateMap({ seed: 200, profile: 'base' });

  assert.notStrictEqual(mapA.seed, mapB.seed);
  const sameTerrain = mapA.tiles.every((t, i) => t.terrain === mapB.tiles[i].terrain);
  const sameNumbers = mapA.tiles.every((t, i) => t.number === mapB.tiles[i].number);
  assert.ok(!sameTerrain || !sameNumbers, 'Different seeds should vary terrain or number distribution');
});

// 2. Base board validation
runTest('Base map produces valid terrain multiset and token distribution with no adjacent 6 and 8', () => {
  const map = catan.generateMap({ seed: 777, profile: 'base' });
  assert.strictEqual(map.tiles.length, 19);

  const validation = catan.validateCustomMap({ tiles: map.tiles, robberHexId: map.robberHexId }, 'base', 4);
  assert.strictEqual(validation.valid, true, validation.error || 'Expected valid base map');

  // Verify no adjacent red tokens (6 or 8)
  const graph = catan.BOARD_GRAPHS.base;
  for (const hex of graph.hexes) {
    const tile = map.tiles[hex.id];
    if (tile.number === 6 || tile.number === 8) {
      for (const neighborId of hex.neighborHexIds) {
        const neighborTile = map.tiles[neighborId];
        assert.ok(
          neighborTile.number !== 6 && neighborTile.number !== 8,
          `Found adjacent red numbers at hex ${hex.id} (${tile.number}) and hex ${neighborId} (${neighborTile.number})`
        );
      }
    }
  }
});

// 3. Extended 30-hex board generation and validation
runTest('Extended 5-6 player map generates 30 hexes with valid distributions', () => {
  const map = catan.generateMap({ seed: 999, profile: 'extended', boardTemplate: 'extended' });
  assert.strictEqual(map.tiles.length, 30);

  const validation = catan.validateCustomMap({ tiles: map.tiles, robberHexId: map.robberHexId }, 'extended', 6);
  assert.strictEqual(validation.valid, true, validation.error || 'Expected valid extended map');

  // Verify 2 deserts and 28 tokens
  const deserts = map.tiles.filter(t => t.terrain === catan.TERRAINS.DESERT);
  assert.strictEqual(deserts.length, 2);
  const numbered = map.tiles.filter(t => t.number !== null);
  assert.strictEqual(numbered.length, 28);
});

// 4. Map statistics calculation
runTest('Calculates resource pip totals and strongest starting locations', () => {
  const map = catan.generateMap({ seed: 42, profile: 'base' });
  const stats = catan.calculateMapStats(catan.BOARD_GRAPHS.base, map.tiles);

  assert.ok(stats.pips);
  assert.ok(stats.pips.lumber > 0);
  assert.ok(stats.pips.brick > 0);
  assert.ok(stats.pips.wool > 0);
  assert.ok(stats.pips.grain > 0);
  assert.ok(stats.pips.ore > 0);
  assert.strictEqual(stats.totalPips, 58); // Base game: 2+3+3+4+4+5+5+5+5+4+4+3+3+2 = 58 pips on 18 producing hexes

  assert.ok(Array.isArray(stats.topLocations));
  assert.ok(stats.topLocations.length >= 3);
  assert.ok(stats.topLocations[0].totalPips >= stats.topLocations[1].totalPips);
});

// 5. Custom map auto-fix
runTest('Auto-fix corrects adjacent red 6/8 tokens and missing robber', () => {
  const baseMap = catan.generateMap({ seed: 55, profile: 'base' });
  // Intentionally corrupt the map by placing 6 and 8 adjacent
  const corruptedTiles = JSON.parse(JSON.stringify(baseMap.tiles));
  const hex0 = catan.BOARD_GRAPHS.base.hexes[0];
  const neighborId = hex0.neighborHexIds[0];
  corruptedTiles[0].number = 6;
  corruptedTiles[neighborId].number = 8;
  corruptedTiles.forEach(t => { t.hasRobber = false; }); // Remove robber

  const fixed = catan.autoFixMap({ tiles: corruptedTiles, robberHexId: null });
  assert.ok(fixed);
  const validation = catan.validateCustomMap(fixed, 'base', 4);
  assert.strictEqual(validation.valid, true, 'Auto-fixed map should pass validation');

  // Verify robber restored to desert
  const desertTile = fixed.tiles.find(t => t.terrain === catan.TERRAINS.DESERT);
  assert.strictEqual(fixed.robberHexId, desertTile.id);
  assert.strictEqual(desertTile.hasRobber, true);
});

console.log('All Catan Map Generation & Validation Tests Passed!');
