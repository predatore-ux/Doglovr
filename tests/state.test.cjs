const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({ URLSearchParams });
vm.runInContext(fs.readFileSync(path.join(root, 'dist/data.js'), 'utf8') + '\n' + fs.readFileSync(path.join(root, 'dist/state.js'), 'utf8') + '\nthis.model = DoglovrState; this.content = lessons;', context);
const model = context.model;
const plain = value => JSON.parse(JSON.stringify(value));

test('new users start without invented progress', () => {
  const { state, available } = model.load({ getItem: () => null });
  assert.deepEqual(plain(state), { version: 1, dog: '', saved: [], done: [], answers: {}, practice: {} });
  assert.equal(available, true);
});
test('legacy profiles keep valid progress and migrate to version 1', () => {
  const state = model.normalize({ dog: '  Milo  ', done: ['potty'], saved: ['body'] });
  assert.equal(state.version, 1); assert.equal(state.dog, 'Milo');
  assert.deepEqual(plain(state.done), ['potty']); assert.deepEqual(plain(state.answers), {});
});
test('malformed JSON never prevents startup', () => {
  assert.deepEqual(plain(model.load({ getItem: () => '{broken' }).state), plain(model.empty()));
});
test('all malformed field shapes recover safely', () => {
  for (const value of [null, [], 42, 'text', { dog: {}, saved: 'body', done: true, answers: null }]) {
    assert.deepEqual(plain(model.normalize(value)), plain(model.empty()));
  }
});
test('unknown and duplicate lesson IDs cannot inflate progress', () => {
  const state = model.normalize({ done: ['body', 'body', 'removed', 1], saved: ['potty', null, 'removed'] });
  assert.deepEqual(plain(state.done), ['body']); assert.deepEqual(plain(state.saved), ['potty']);
});
test('quiz answers must refer to real answer choices', () => {
  assert.deepEqual(plain(model.normalize({ answers: { body: 1, potty: 99, task: -1, care: '0', recall: 1.5 } }).answers), { body: 1 });
});
test('profile names are trimmed and length bounded', () => {
  assert.equal(model.normalize({ dog: '  Rover  ' }).dog, 'Rover');
  assert.equal(model.normalize({ dog: 'x'.repeat(80) }).dog.length, 40);
});
test('unavailable storage falls back to session state', () => {
  const storage = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('quota'); } };
  assert.equal(model.load(storage).available, false); assert.equal(model.save(storage, model.empty()), false);
});
test('saved profiles round-trip without losing answers or progress', () => {
  let value; const storage = { getItem: () => value, setItem: (key, raw) => { value = raw; } };
  const expected = model.normalize({ dog: 'Pepper', done: ['body'], saved: ['task'], answers: { body: 1 } });
  assert.equal(model.save(storage, expected), true);
  assert.deepEqual(plain(model.load(storage).state), plain(expected));
});
test('saved and completed lessons can be toggled without duplicates', () => {
  const original = [];
  const added = model.toggle(original, 'body');
  assert.deepEqual(original, []); assert.deepEqual(plain(added), ['body']);
  assert.deepEqual(plain(model.toggle(added, 'body')), []);
  assert.deepEqual(plain(model.toggle(added, 'missing')), ['body']);
});
test('practice steps migrate safely and reject duplicates and unknown indices', () => {
  const state = model.normalize({ practice: { body: [0, 0, 2, 8, -1, '1'], potty: true, missing: [0] } });
  assert.deepEqual(plain(state.practice), { body: [0, 2] });
  assert.deepEqual(plain(model.normalize({ done: ['sit'] }).practice), {});
});
test('search trims whitespace, ignores case and searches lesson content', () => {
  assert.deepEqual(plain(model.filterLessons('All lessons', '  RECALL  ')).map(l => l.id), ['recall']);
  assert.deepEqual(plain(model.filterLessons('All lessons', '  pee ')).map(l => l.id), ['potty']);
  assert.equal(model.filterLessons('All lessons', '  ').length, context.content.length);
});
test('topic and text search combine, including an empty result', () => {
  assert.equal(model.filterLessons('Task training', 'mat').length, 1);
  assert.equal(model.filterLessons('Body language', 'recall').length, 0);
  assert.equal(model.filterLessons('All lessons', 'no-such-lesson-xyz').length, 0);
});
test('direct lesson routes and safe return pages are supported', () => {
  assert.deepEqual(plain(model.route('#lesson-body')), { page: 'learn', lesson: 'body' });
  assert.deepEqual(plain(model.route('#lesson-potty?from=plan')), { page: 'plan', lesson: 'potty' });
  assert.equal(model.route('#lesson-body?from=https://evil.test').page, 'learn');
});
test('unknown routes and removed lessons show a recoverable not-found view', () => {
  assert.equal(model.route('#lesson-missing').page, 'missing');
  assert.equal(model.route('#nonsense').page, 'missing');
  assert.equal(model.route('').page, 'home');
});
test('every lesson has a unique ID, valid quiz, usable source and local image', () => {
  const content = plain(context.content);
  assert.equal(new Set(content.map(l => l.id)).size, content.length);
  for (const lesson of content) {
    assert.ok(lesson.steps.length >= 3);
    assert.ok(lesson.answers[lesson.correct]);
    assert.ok(fs.existsSync(path.join(root, 'dist/assets', `${lesson.img}.jpg`)));
  }
});
test('production HTML has no inline scripts or handlers and uses relative local assets', () => {
  const html = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
  assert.doesNotMatch(html, /\son(?:click|input|submit)=/i);
  assert.doesNotMatch(html, /<script(?![^>]*\bsrc=)/i);
  assert.match(html, /Content-Security-Policy/);
  for (const [, target] of html.matchAll(/(?:src|href)="([^"#][^"]*)"/g)) {
    assert.ok(fs.existsSync(path.join(root, 'dist', target)), `Missing asset: ${target}`);
  }
});
