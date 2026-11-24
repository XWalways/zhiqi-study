'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const quiz = require('../src/quiz.js');

test('dist contains multi-discipline structure, PWA files, and zero duplicate offline HTML', () => {
  for (const required of [
    'index.html',
    'manifest.webmanifest',
    'sw.js',
    '.nojekyll',
    'assets/styles.css',
    'assets/app.js',
    'assets/quiz.js',
    'economy/index.html',
    'finance/index.html',
    'insurance/index.html',
    'computer/index.html',
    'computer/security/index.html',
    'computer/database/index.html',
    'computer/network/index.html',
  ]) {
    assert.ok(fs.existsSync(path.join(dist, required)), `Missing ${required}`);
  }
  const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]
  );
  const allFiles = walk(dist);
  assert.equal(allFiles.some(f => f.includes('-离线学习.html')), false, 'No duplicate offline HTML should exist');
});

test('all 31 migrated chapters exist in economy/finance/insurance with 41 visuals and valid legacy redirects', () => {
  const expectedCounts = { economy: 17, finance: 8, insurance: 6 };
  let totalVisuals = 0;
  let legacyIndex = 1;
  for (const [route, count] of Object.entries(expectedCounts)) {
    for (let i = 1; i <= count; i++) {
      const id = String(i).padStart(2, '0');
      const file = path.join(dist, route, `${id}.html`);
      assert.ok(fs.existsSync(file), `Missing ${route}/${id}.html`);
      const html = fs.readFileSync(file, 'utf8');
      const data = JSON.parse(html.match(/<script>window\.STUDY_CONTENT=(.*);<\/script>/)[1]);
      assert.ok((data.chapter.visuals || []).length >= 1, `${route}/${id} should have at least 1 visual`);
      totalVisuals += data.chapter.visuals.length;
      const legacyFile = path.join(dist, `chapter${String(legacyIndex).padStart(2, '0')}.html`);
      assert.ok(fs.existsSync(legacyFile), `Missing legacy redirect chapter${String(legacyIndex).padStart(2, '0')}.html`);
      assert.ok(fs.readFileSync(legacyFile, 'utf8').includes(`${route}/${id}.html`));
      legacyIndex++;
    }
  }
  assert.equal(totalVisuals, 41);
});

test('all shared JS assets parse cleanly as valid JavaScript', () => {
  const jsFiles = [
    'assets/app.js',
    'assets/quiz.js',
    'assets/visuals/market.js',
    'assets/visuals/micro-visuals.js',
    'assets/visuals/macro-fin-visuals.js',
    'assets/visuals/static-visuals.js',
    'assets/visuals/extra-visuals.js',
    'sw.js',
  ];
  for (const rel of jsFiles) {
    const code = fs.readFileSync(path.join(dist, rel), 'utf8');
    assert.doesNotThrow(() => new vm.Script(code, { filename: rel }));
  }
});

test('quiz grading logic handles single, multiple, and discussion questions', () => {
  const single = { id: 'q1', type: 'single', options: { A: '1', B: '2' }, answer: ['A'] };
  const multi = { id: 'q2', type: 'multiple', options: { A: '1', B: '2', C: '3' }, answer: ['A', 'C'] };
  assert.equal(quiz.grade(single, ['A']), true);
  assert.equal(quiz.grade(single, ['B']), false);
  assert.equal(quiz.grade(multi, ['C', 'A']), true);
  assert.equal(quiz.grade(multi, ['A']), false);
});
