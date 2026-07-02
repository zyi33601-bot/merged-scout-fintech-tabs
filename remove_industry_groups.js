const fs = require('fs');
const vm = require('vm');

const file = 'work/org-deviation-scout-index.html';
const html = fs.readFileSync(file, 'utf8');
const script = html.match(/<script>([\s\S]*)<\/script>/)[1] + '\nglobalThis.__DATA=DATA;';

class El {
  constructor(value = '') {
    this.innerHTML = '';
    this.textContent = '';
    this.value = value;
    this.style = {};
    this.dataset = {};
    this.classList = { add() {}, remove() {} };
  }
  appendChild() {}
  addEventListener() {}
  closest() { return null; }
  querySelectorAll() { return []; }
}

const els = {
  tb: new El(),
  q: new El(''),
  industry: new El('all'),
  clusters: new El(),
  empty: new El(),
  cnt: new El(),
  meta: new El(),
  ov: new El(),
  modal: new El(),
  x: new El(),
  mc: new El(),
};
const document = {
  getElementById: id => els[id] || (els[id] = new El()),
  createElement: () => new El(),
  querySelectorAll: () => [],
  addEventListener() {},
};

const ctx = { document, console };
vm.runInNewContext(script, ctx);

const remove = new Set([
  '工业/能源/制造',
  '汽车/交通/航空',
  '地产/家居/住房',
  '消费/零售/餐饮',
]);

const data = ctx.__DATA;
const removed = data.filter(r => remove.has(r.industry));
const kept = data.filter(r => !remove.has(r.industry));
kept.forEach((r, i) => { r.rank = i + 1; });

const before = 'const DATA=';
const start = html.indexOf(before);
const end = html.indexOf(';\nconst tb=', start);
if (start === -1 || end === -1) throw new Error('Cannot locate DATA block');

const nextHtml = html.slice(0, start + before.length) +
  JSON.stringify(kept) +
  html.slice(end);
fs.writeFileSync(file, nextHtml);

const counts = {};
for (const r of removed) counts[r.industry] = (counts[r.industry] || 0) + 1;
console.log(JSON.stringify({
  before: data.length,
  after: kept.length,
  removed: removed.length,
  removedCounts: counts,
  removedCompanies: removed.map(r => r.company),
}, null, 2));
