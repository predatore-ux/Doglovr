const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root, 'dist/data.js'), 'utf8') + '\n' + fs.readFileSync(path.join(root, 'dist/guides.js'), 'utf8') + '\nthis.catalog = { lessons, breeds, lessonGuides, breedDetails, breedKey };', context);
const { lessons, breeds, lessonGuides, breedDetails, breedKey } = context.catalog;

test('every lesson has a refreshable full-page entry point with the correct app base', () => {
  for (const lesson of lessons) {
    const page = fs.readFileSync(path.join(root, `dist/lessons/${lesson.id}/index.html`), 'utf8');
    assert.ok(page.includes(`data-lesson="${lesson.id}"`));
    assert.match(page, /<base href="\.\.\/\.\.\/">/);
    assert.ok(page.includes(lesson.heading));
    assert.match(page, /src="pages.js"/);
  }
});
test('each detailed step has an individual local illustration and usable practice guidance', () => {
  const files = new Set();
  for (const lesson of lessons) {
    const guide = lessonGuides[lesson.id];
    assert.equal(guide.steps.length, 4);
    assert.ok(guide.goal && guide.kit.length >= 3 && guide.source.startsWith('https://'));
    for (const [index, step] of guide.steps.entries()) {
      assert.ok(step.instructions.length > 100);
      assert.ok(step.practice && step.why && step.fix && step.alt);
      const file = `dist/assets/guides/${lesson.id}-${index + 1}.svg`;
      assert.equal(files.has(file), false); files.add(file);
      const svg = fs.readFileSync(path.join(root, file), 'utf8');
      assert.match(svg, /<svg/); assert.match(svg, /<title>/);
      assert.doesNotMatch(svg, /<script|onload=/);
    }
  }
  assert.equal(files.size, 24);
});
test('every breed has a full-page route, illustration and detailed care sections', () => {
  for (const breed of breeds) {
    const slug = breedKey(breed.name);
    const page = fs.readFileSync(path.join(root, `dist/breeds/${slug}/index.html`), 'utf8');
    assert.ok(page.includes(`data-breed="${slug}"`));
    assert.ok(fs.existsSync(path.join(root, `dist/assets/breeds/${slug}.svg`)));
    const detail = breedDetails[breed.name];
    assert.ok(detail.history && detail.coat && detail.training && detail.fit);
    assert.equal(detail.enrichment.length, 3);
  }
});
test('main learning and breed flows no longer invoke dialog rendering', () => {
  const app = fs.readFileSync(path.join(root, 'dist/app.js'), 'utf8');
  assert.doesNotMatch(app, /showDialog\('lesson'|showDialog\('breed'/);
  assert.match(app, /lessons\/\$\{lesson.id\}/);
  assert.match(app, /href="breeds\//);
});
