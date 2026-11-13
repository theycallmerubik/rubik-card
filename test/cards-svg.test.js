const assert = require('assert');
const RubikCardsSVG = require('../public/cards-svg.js');

console.log('--- Running Card SVG Visual Identity & Integrity Tests ---');

// 1. Suit Normalization
const suits = ['spades', 'hearts', 'diamonds', 'clubs'];
const suitCodes = { S: 'spades', H: 'hearts', D: 'diamonds', C: 'clubs' };

for (const [code, expected] of Object.entries(suitCodes)) {
  assert.strictEqual(RubikCardsSVG.normalizeSuit({ suit: code }), expected, `Failed for suit code ${code}`);
}
console.log('✓ Suit normalization handles single-letter codes S, H, D, C correctly');

// 2. Ace: One Big Symbol in Center
for (const s of ['S', 'H', 'D', 'C']) {
  const html = RubikCardsSVG.generateCardInnerHtml({ suit: s, rank: 'A' });
  assert.ok(html.includes('card-ace-hero'), `Ace of ${s} must have card-ace-hero`);
  assert.ok(!html.includes('card-pips-grid'), `Ace of ${s} must not have pips grid`);
}
console.log('✓ Ace has 1 dominant hero symbol across all 4 suits');

// 3. Number Cards (2 through 10): Represent Value by Exact Amount of Symbols
for (let val = 2; val <= 10; val++) {
  for (const s of ['S', 'H', 'D', 'C']) {
    const html = RubikCardsSVG.generateCardInnerHtml({ suit: s, rank: String(val) });
    assert.ok(html.includes(`count-${val}`), `Rank ${val} must have count-${val} grid class`);
    const pips = (html.match(/class="pip-cell/g) || []).length;
    assert.strictEqual(pips, val, `Rank ${val} of ${s} must have exactly ${val} pips (got ${pips})`);
  }
}
console.log('✓ Number cards (2 to 10) have exact number of symbols matching card value (2=2 ... 10=10)');

// 4. Court Cards (J, Q, K): 12 Distinct Face Figures with Respective Suit Symbols
const courtRanks = ['J', 'Q', 'K'];
const courtSignatures = new Set();

for (const rank of courtRanks) {
  for (const suit of suits) {
    const html = RubikCardsSVG.getCourtFigureHtml(rank, suit);
    assert.ok(html && html.length > 200, `Court figure for ${rank} of ${suit} must not be empty`);
    assert.ok(html.includes(`suit-${suit}`), `${rank} of ${suit} must contain the suit symbol class suit-${suit}`);
    assert.ok(!courtSignatures.has(html), `Each of the 12 court cards must have a distinct figure (${rank} of ${suit} collided)`);
    courtSignatures.add(html);
  }
}
assert.strictEqual(courtSignatures.size, 12, 'Must have exactly 12 unique court figure SVGs');
console.log('✓ 12 distinct face figures verified for J, Q, K with suit-specific symbols & regalia');

// 5. Joker Illustration
const jokerHtml = RubikCardsSVG.generateCardInnerHtml({ suit: 'JOKER', rank: 'JOKER' });
assert.ok(jokerHtml.includes('JOKER'), 'Joker must contain JOKER text/badge');
assert.ok(jokerHtml.includes('court-figure-svg'), 'Joker must render vector court-figure-svg');
console.log('✓ Shelem Joker colorful jester figure verified');

console.log('========================================================');
console.log('✓ ALL CARD SVG VISUAL IDENTITY & PIP TESTS PASSED 100%! ✓');
console.log('========================================================');
