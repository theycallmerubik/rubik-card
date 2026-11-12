const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- Running Catan SVG Asset Budget & Visual Integrity Tests ---');

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}`);
    throw err;
  }
}

const svgPath = path.join(__dirname, '../public/games/catan/catan-assets.svg');
assert.ok(fs.existsSync(svgPath), 'catan-assets.svg must exist');
const svgContent = fs.readFileSync(svgPath, 'utf8');
const fileStats = fs.statSync(svgPath);

// 1. Total sprite budget
runTest('Total SVG sprite size <= 60 KB uncompressed', () => {
  const sizeKb = fileStats.size / 1024;
  console.log(`    Total sprite size: ${sizeKb.toFixed(2)} KB (budget: <= 60 KB)`);
  assert.ok(fileStats.size <= 60 * 1024, `Sprite size ${sizeKb.toFixed(2)} KB exceeds 60 KB budget`);
});

// 2. No raster, canvas, data URIs, or remote URLs
runTest('Zero raster images, zero canvas, zero base64, zero external URLs', () => {
  assert.strictEqual(svgContent.includes('<image'), false, 'Found forbidden <image> tag');
  assert.strictEqual(svgContent.includes('<canvas'), false, 'Found forbidden <canvas> tag');
  assert.strictEqual(svgContent.includes('data:image'), false, 'Found forbidden data:image URI');
  assert.strictEqual(svgContent.includes('http://') && !svgContent.includes('http://www.w3.org/2000/svg'), false, 'Found forbidden external HTTP URL');
  assert.strictEqual(svgContent.includes('https://'), false, 'Found forbidden external HTTPS URL');
});

// 3. Parse symbols and check per-symbol budgets
const symbolRegex = /<symbol\s+id="([^"]+)"[^>]*>([\s\S]*?)<\/symbol>/g;
const symbols = {};
let match;
while ((match = symbolRegex.exec(svgContent)) !== null) {
  const [fullMatch, id, inner] = match;
  symbols[id] = {
    fullSize: Buffer.byteLength(fullMatch, 'utf8'),
    innerSize: Buffer.byteLength(inner, 'utf8')
  };
}

const requiredTerrains = ['tile-forest', 'tile-hills', 'tile-pasture', 'tile-fields', 'tile-mountains', 'tile-desert'];
const requiredResources = ['icon-lumber', 'icon-brick', 'icon-wool', 'icon-grain', 'icon-ore'];
const requiredPieces = ['piece-road', 'piece-settlement', 'piece-city', 'piece-bandit'];
const requiredTokens = ['token-standard', 'token-high-prob'];
const requiredCards = ['card-knight', 'card-road-building', 'card-year-of-plenty', 'card-monopoly', 'card-victory-point', 'card-back'];

runTest('All required symbols exist in SVG sprite', () => {
  const allRequired = [...requiredTerrains, ...requiredResources, ...requiredPieces, ...requiredTokens, ...requiredCards];
  for (const req of allRequired) {
    assert.ok(symbols[req], `Missing required symbol: ${req}`);
  }
});

runTest('Each terrain tile symbol size <= 2 KB', () => {
  for (const terrain of requiredTerrains) {
    const s = symbols[terrain];
    assert.ok(s, `Terrain ${terrain} exists`);
    assert.ok(s.fullSize <= 2 * 1024, `Terrain ${terrain} size ${s.fullSize} B exceeds 2048 B budget`);
  }
});

runTest('Each resource and piece icon size <= 1.5 KB', () => {
  const iconsToCheck = [...requiredResources, ...requiredPieces, ...requiredCards];
  for (const icon of iconsToCheck) {
    const s = symbols[icon];
    assert.ok(s, `Icon ${icon} exists`);
    assert.ok(s.fullSize <= 1.5 * 1024, `Icon ${icon} size ${s.fullSize} B exceeds 1536 B budget`);
  }
});

console.log('All Catan SVG Asset Budget & Integrity Tests Passed!');
