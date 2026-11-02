const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');
let child, origin;
before(async () => {
  child = spawn(process.execPath, ['scripts/serve.mjs'], { cwd: path.resolve(__dirname, '..'), env: { ...process.env, PORT: '0' }, stdio: ['ignore', 'pipe', 'pipe'] });
  origin = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Preview server did not start')), 10000);
    child.on('error', reject);
    child.stdout.on('data', chunk => { const match = String(chunk).match(/http:\/\/127\.0\.0\.1:\d+/); if (match) { clearTimeout(timer); resolve(match[0]); } });
    child.on('exit', code => { if (!origin) { clearTimeout(timer); reject(new Error(`Server exited: ${code}`)); } });
  });
});
after(() => { child?.kill(); });
test('home and relative assets serve successfully with correct types', async () => {
  for (const [file, type] of [['/', 'text/html'], ['/app.js', 'text/javascript'], ['/state.js', 'text/javascript'], ['/style.css', 'text/css'], ['/assets/hero.jpg', 'image/jpeg']]) {
    const response = await fetch(origin + file);
    assert.equal(response.status, 200); assert.ok(response.headers.get('content-type').startsWith(type));
    assert.ok((await response.arrayBuffer()).byteLength > 0);
  }
});
test('unknown files return 404 instead of HTML masquerading as scripts', async () => {
  assert.equal((await fetch(origin + '/missing.js')).status, 404);
});
test('nested lesson and breed URLs can be opened directly and refreshed', async () => {
  for (const route of ['/lessons/potty/?from=plan', '/lessons/recall/', '/breeds/golden-retriever/']) {
    const response = await fetch(origin + route);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /<base href="\.\.\/\.\.\/">/);
    assert.match(html, /data-(lesson|breed)=/);
  }
});
test('the preview server cannot expose files above dist', async () => {
  const response = await fetch(origin + '/..%2fpackage.json');
  assert.equal(response.status, 403);
});
test('unsupported methods are rejected and HEAD does not return a body', async () => {
  assert.equal((await fetch(origin, { method: 'POST' })).status, 405);
  const response = await fetch(origin, { method: 'HEAD' });
  assert.equal(response.status, 200); assert.equal(await response.text(), '');
});
