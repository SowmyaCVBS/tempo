'use strict';
/*
 * Sync-state tests: boots index.html's inline script in a vm with a stub DOM,
 * localStorage and fetch (no dependencies, Node 20+).
 * Run: node --test tests/sync.test.js
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const HTML = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const SCRIPTS = [...HTML.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter(m => !/\bsrc\s*=/i.test(m[1])).map(m => m[2]);

const TOKEN = 'fake-token-for-tests';
const DAY = 864e5;
const BOARD = { tasks: [{ id: 'a', title: 'one', status: 'progress', domain: 'work' }], parked: [], meta: {}, ui: {} };

function makeEl(id) {
  const classes = new Set(), handlers = {};
  return {
    id, style: {}, dataset: {}, innerHTML: '', textContent: '', value: '', disabled: false, className: '', onclick: null,
    classList: {
      add: (...c) => c.forEach(x => classes.add(x)),
      remove: (...c) => c.forEach(x => classes.delete(x)),
      toggle: (c, f) => ((f === undefined ? !classes.has(c) : f) ? classes.add(c) : classes.delete(c)),
      contains: c => classes.has(c),
    },
    addEventListener(t, fn) { (handlers[t] = handlers[t] || []).push(fn); },
    fire(t, ev) { return Promise.all((handlers[t] || []).map(fn => fn(ev || { preventDefault() {}, target: this }))); },
    querySelectorAll: () => [], querySelector: () => null, closest: () => null, matches: () => false,
    appendChild() {}, remove() {}, focus() {}, select() {}, setAttribute() {}, animate: () => ({}),
    getBoundingClientRect: () => ({ top: 0, left: 0, width: 0, height: 0 }),
  };
}

// route(method, url) -> {status, body} decides every GitHub response; swap it mid-test.
function boot({ store = {}, route }) {
  const els = {}, timers = [], logs = [], ls = new Map(Object.entries(store));
  const el = id => (els[id] = els[id] || makeEl(id));
  const api = { route };
  const fetch = async (url, opts = {}) => {
    const { status, body } = api.route((opts.method || 'GET').toUpperCase(), String(url));
    return { status, ok: status >= 200 && status < 300, headers: { get: () => null }, json: async () => body };
  };
  const document = {
    getElementById: el, createElement: () => makeEl(), addEventListener() {}, querySelectorAll: () => [],
    querySelector: () => null, body: makeEl('body'), hidden: false, activeElement: null, title: '',
  };
  const sandbox = {
    document, fetch, console: { log: (...a) => logs.push(a.join(' ')), warn: (...a) => logs.push(a.join(' ')), error: (...a) => logs.push(a.join(' ')) },
    localStorage: { getItem: k => (ls.has(k) ? ls.get(k) : null), setItem: (k, v) => ls.set(k, String(v)), removeItem: k => ls.delete(k) },
    setTimeout: (fn, ms) => timers.push({ fn, ms, every: false }), clearTimeout() {},
    setInterval: (fn, ms) => timers.push({ fn, ms, every: true }), clearInterval() {},
    confirm: () => true, alert() {}, innerWidth: 1024, innerHeight: 768,
    TextEncoder, TextDecoder, atob, btoa, URL, Blob,
  };
  sandbox.window = sandbox;
  const ctx = vm.createContext(sandbox);
  SCRIPTS.forEach(code => vm.runInContext(code, ctx));
  const settle = async () => { for (let i = 0; i < 30; i++) await new Promise(r => setImmediate(r)); };
  const flushSaves = async () => { // run pending one-shot timers (the debounced commit)
    for (let i = 0; i < 5; i++) {
      const due = timers.filter(t => !t.every && !t.done);
      if (!due.length) break;
      due.forEach(t => { t.done = true; t.fn(); });
      await settle();
    }
  };
  const poll = async () => { const p = timers.find(t => t.every && t.ms === 30000); assert.ok(p, 'poll timer registered'); await p.fn(); await settle(); await flushSaves(); };
  const view = () => ({
    pill: els.syncTxt.textContent,
    pillBad: els.syncPill.classList.contains('bad'),
    banner: els.expBanner.style.display === 'flex' ? els.expBanner.innerHTML : '',
    connectOpen: el('connectOverlay').classList.contains('on'),
    connectErr: el('connectErr').textContent,
  });
  const connect = async (tok, expDate) => {
    el('tokenInput').value = tok;
    if (expDate !== undefined) el('expInput').value = expDate;
    await el('connectBtn').fire('click'); await settle(); await flushSaves();
  };
  return { api, els, el, ls, logs, settle, flushSaves, poll, view, connect, run: c => vm.runInContext(c, ctx) };
}

const ok = () => (method) => method === 'GET'
  ? { status: 200, body: { sha: 's1', content: Buffer.from(JSON.stringify(BOARD)).toString('base64') } }
  : { status: 200, body: { content: { sha: 's2' } } };
const fail = status => () => ({ status, body: { message: 'x' } });
const isoDay = ms => new Date(ms).toISOString().slice(0, 10);
const signedIn = extra => Object.assign({ 'tempo-mode': 'github', 'tempo-gh-token': TOKEN }, extra);

test('working token with a past stored expiry: badge and banner agree, stale date dropped', async () => {
  const app = boot({ store: signedIn({ 'tempo-gh-exp': new Date(Date.now() - 3 * DAY).toISOString() }), route: ok() });
  await app.settle(); await app.flushSaves();
  const v = app.view();
  assert.equal(v.pill, 'Synced');
  assert.equal(v.banner, '', 'no banner while GitHub accepts the token');
  assert.equal(app.ls.has('tempo-gh-exp'), false, 'successful sync clears the stale expiry');
});

test('Reconnect after a rejected token clears the banner, even with the old date stored', async () => {
  const pastExp = new Date(Date.now() - 3 * DAY).toISOString();
  const app = boot({ store: signedIn({ 'tempo-gh-exp': pastExp }), route: fail(401) });
  await app.settle();
  let v = app.view();
  assert.ok(v.connectOpen, 'connect screen shown for a rejected saved token');
  assert.match(v.connectErr, /401/);
  assert.notEqual(app.el('expInput').value, isoDay(Date.parse(pastExp)), 'form does not reuse the old token date');

  app.api.route = ok();
  await app.connect('fresh-' + TOKEN);
  v = app.view();
  assert.equal(v.connectOpen, false);
  assert.equal(v.pill, 'Synced');
  assert.equal(v.banner, '');
});

test('a past date typed into the form is not kept once the token works', async () => {
  const app = boot({ store: { 'tempo-mode': 'github' }, route: ok() });
  await app.settle();
  await app.connect(TOKEN, isoDay(Date.now() - 2 * DAY));
  assert.equal(app.view().banner, '');
  assert.equal(app.ls.has('tempo-gh-exp'), false);
});

for (const [status, re] of [[401, /401.*rejected|rejected.*401/i], [403, /403/], [404, /404/], [500, /500/]]) {
  test(`failed reconnect says why (HTTP ${status})`, async () => {
    const app = boot({ store: { 'tempo-mode': 'github' }, route: fail(status) });
    await app.settle();
    await app.connect(TOKEN);
    const v = app.view();
    assert.ok(v.connectOpen, 'stays on the connect screen');
    assert.match(v.connectErr, re);
    assert.equal(app.ls.has('tempo-gh-token'), false, 'rejected token is not saved');
  });
}

test('poll surfaces a revoked token, and the next good sync clears it from badge and banner', async () => {
  const app = boot({ store: signedIn(), route: ok() });
  await app.settle(); await app.flushSaves();
  assert.equal(app.view().pill, 'Synced');

  app.api.route = fail(401);
  await app.poll();
  let v = app.view();
  assert.equal(v.pill, 'Reconnect');
  assert.ok(v.pillBad);
  assert.match(v.banner, /Sync is down/);
  assert.match(v.banner, /401/);

  app.api.route = ok();
  await app.poll();
  v = app.view();
  assert.equal(v.pill, 'Synced');
  assert.equal(v.banner, '');
});

test('expiry warning still shows inside 7 days; Replace token form defaults past the old date', async () => {
  const soon = Date.now() + 3 * DAY;
  const app = boot({ store: signedIn({ 'tempo-gh-exp': new Date(soon).toISOString() }), route: ok() });
  await app.settle(); await app.flushSaves();
  const v = app.view();
  assert.equal(v.pill, 'Synced');
  assert.match(v.banner, /expires in/);
  assert.doesNotMatch(v.banner, /Sync is down/);
  app.el('ebFix').onclick();
  assert.ok(Date.parse(app.el('expInput').value) > soon, 'new token date is not the old token date');
});

test('token never reaches console or visible text', async () => {
  const app = boot({ store: signedIn(), route: fail(401) });
  await app.settle();
  await app.connect('other-' + TOKEN);
  const visible = Object.values(app.els).map(e => e.textContent + e.innerHTML).join('\n');
  assert.equal(app.logs.join('\n').includes(TOKEN), false);
  assert.equal(visible.includes(TOKEN), false);
});

test('footer shows build v13', () => {
  assert.match(HTML, /build v13</);
});