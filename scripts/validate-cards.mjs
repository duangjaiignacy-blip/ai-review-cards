import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const match = html.match(/const CARDS=(\[.*?\]);\nconst JULY6_CARDS=/s);
const july6Match = html.match(/const JULY6_CARDS=(\[.*?\]);\nCARDS\.push/s);

assert(match, 'CARDS array not found');
assert(july6Match, 'JULY6_CARDS array not found');

const cards = [...JSON.parse(match[1]), ...JSON.parse(july6Match[1])];
const ids = new Set(cards.map((card) => card.id));

assert.equal(ids.size, cards.length, 'card ids must be unique');

const july6Cards = cards.filter((card) => card.id.startsWith('kc-0706-'));
assert.equal(july6Cards.length, 62, 'July 6 import should contain the complete deduplicated card set');
assert.equal(cards.length, 243 + july6Cards.length, 'only the July 6 import may extend the 243-card baseline');

for (const id of [
  'kc-0706-hr-screening-25',
  'kc-0706-project-evidence-chain',
  'kc-0706-model-evaluation-story',
  'kc-0706-online-resume-first',
  'kc-0706-self-intro-mainline',
  'kc-0706-staged-applications',
  'kc-0706-interview-review-loop',
]) {
  assert(ids.has(id), `missing expected card ${id}`);
}

const july6Sources = new Set(july6Cards.map((card) => card.source));
assert(july6Sources.has('7-6上午 AI产品经理求职培训课程'));
assert(july6Sources.has('7-6中午 AI产品经理求职简历与面试准备'));

for (const card of july6Cards) {
  assert(
    ['7-6上午 AI产品经理求职培训课程', '7-6中午 AI产品经理求职简历与面试准备'].includes(card.source),
    `${card.id} has unexpected source`,
  );
  assert(card.srs && card.srs.ease === 2.5 && card.srs.interval === 0, `${card.id} must start with fresh SRS state`);
}

assert.deepEqual(new Set(july6Cards.map((card) => card.type)), new Set(['choice', 'qa', 'recall']));

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
assert(interviewCards.length >= 168, 'interview deck should include the complete July 6 update');

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
