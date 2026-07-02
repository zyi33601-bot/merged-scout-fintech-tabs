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

const data = ctx.__DATA;
const removed = data.filter(r => r.industry === '其他/待归类');
const kept = data.filter(r => r.industry !== '其他/待归类');
kept.forEach((r, i) => { r.rank = i + 1; });

const before = 'const DATA=';
const start = html.indexOf(before);
const end = html.indexOf(';\nconst tb=', start);
if (start === -1 || end === -1) throw new Error('Cannot locate DATA block');

const nextHtml = html.slice(0, start + before.length) +
  JSON.stringify(kept) +
  html.slice(end);
fs.writeFileSync(file, nextHtml);

console.log(JSON.stringify({
  before: data.length,
  after: kept.length,
  removed: removed.length,
  removedCompanies: removed.map(r => r.company),
}, null, 2));
