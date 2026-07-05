import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const match = html.match(/const CARDS=(\[.*?\]);\nconst STANDALONE=/s);

assert(match, 'CARDS array not found');

const cards = JSON.parse(match[1]);
const ids = new Set(cards.map((card) => card.id));

assert.equal(cards.length, 243, 'card count should include the July AI PM and interview update');
assert.equal(ids.size, cards.length, 'card ids must be unique');

for (const id of [
  'kc-0701-career-granularity',
  'kc-0701-claude-modules',
  'kc-0701-agent-product-training',
  'kc-0702-agent-reach-answer',
  'kc-0630-harness-definition',
  'kc-0629-skill-open-source',
]) {
  assert(ids.has(id), `missing expected card ${id}`);
}

const interviewCards = cards.filter((card) => card.cat === '面试');
assert(interviewCards.length >= 60, 'interview deck should have at least 60 cards after update');

for (const card of cards) {
  assert(card.id && typeof card.id === 'string', 'card id is required');
  assert(['choice', 'qa', 'recall'].includes(card.type), `${card.id} has invalid type`);
  assert(card.front && typeof card.front === 'string', `${card.id} front is required`);
  assert(card.cat && typeof card.cat === 'string', `${card.id} cat is required`);
  if (card.type === 'choice') {
    assert(Array.isArray(card.options) && card.options.length >= 2, `${card.id} options are required`);
    assert(Number.isInteger(card.answer), `${card.id} answer is required`);
    assert(card.answer >= 0 && card.answer < card.options.length, `${card.id} answer is out of range`);
  } else {
    assert(card.back && typeof card.back === 'string', `${card.id} back is required`);
  }
}

console.log(`validated ${cards.length} cards (${interviewCards.length} interview cards)`);
