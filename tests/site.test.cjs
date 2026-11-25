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

test('computer/security builds nine chapters and covers the catalog and previous question bank', () => {
  const coverage = require('../courses/computer/security/source-coverage.json');
  const concepts = new Map();
  const pdfPages = new Map(coverage.pdfs.map(pdf => [pdf.chapter ?? pdf.title, pdf.pages]));
  const ids = new Set();
  const exams = new Set();
  let totalVisuals = 0;
  let choices = 0;
  let cases = 0;
  let casePrompts = 0;
  for (let i = 1; i <= 9; i++) {
    const id = String(i).padStart(2, '0');
    const file = path.join(dist, 'computer/security', `${id}.html`);
    assert.ok(fs.existsSync(file), `Missing computer/security/${id}.html`);
    const html = fs.readFileSync(file, 'utf8');
    const data = JSON.parse(html.match(/<script>window\.STUDY_CONTENT=(.*);<\/script>/)[1]);
    const originalQuestions = require(`../courses/computer/security/chapters/${id}-questions.json`);
    assert.equal(data.questions.length, originalQuestions.length);
    assert.ok((data.chapter.visuals || []).length >= 1, `computer/security/${id} should have at least 1 visual`);
    assert.ok(html.includes('assets/visuals/security-visuals.js'), `computer/security/${id} should load security-visuals.js`);
    totalVisuals += data.chapter.visuals.length;
    const sectionIds = new Set(data.lessons.sections.map(section => section.id));
    concepts.set(id, sectionIds);
    for (const visual of data.chapter.visuals) assert.ok(sectionIds.has(visual.sectionId));
    for (const section of sectionIds) {
      assert.ok(data.questions.some(question => question.conceptId === section), section);
    }
    for (const section of data.lessons.sections) {
      assert.match(section.bodyHtml, /<h4>/, section.id);
      assert.match(section.bodyHtml, /资料索引/, section.id);
      assert.ok(section.keyTakeaway && section.example && section.pitfall, section.id);
    }
    for (const [index, question] of data.questions.entries()) {
      assert.ok(!ids.has(question.id), question.id);
      assert.ok(sectionIds.has(question.conceptId), question.id);
      assert.equal(question.number, index + 1);
      ids.add(question.id);
      if (quiz.isScored(question)) assert.ok(quiz.grade(question, question.answer), question.id);
      if (question.source) {
        exams.add(question.id.split('-')[1]);
        assert.match(question.source.date, /^\d{4}-\d{2}$/);
        assert.match(question.source.number, /^\d+(?:-\d+)?$/);
        const originalSource = originalQuestions[index].source;
        assert.equal(question.id, originalQuestions[index].id);
        assert.match(originalSource.url, /^https:\/\/www\.ruankaoba\.com\/paper\/paperId\/[a-f\d]+\/chiefId\/[a-f\d]+$/);
        assert.equal(question.source.url, undefined);
        if (originalSource.basisUrl && !/ruankaoba\.com/i.test(originalSource.basisUrl)) {
          assert.equal(question.source.basisUrl, originalSource.basisUrl);
        }
        if (question.type === 'case') {
          cases++;
          casePrompts += question.prompts.length;
          assert.ok(question.explanationSupplement, question.id);
        } else {
          choices++;
          assert.ok(quiz.hasChoices(question), question.id);
          assert.ok(Object.values(question.options).every(option => option.trim()), question.id);
          assert.equal(new Set(Object.values(question.options)).size, 4, question.id);
          assert.ok(!question.stem.includes('题干与选项可在原题查看'), question.id);
          assert.ok(quiz.isScored(question), question.id);
          assert.ok(question.explanationSupplement.trim(), question.id);
        }
      }
    }
    if (i <= 6) {
      for (let number = 1; number <= 16; number++) {
        assert.ok(ids.has(`sec-${id}-q${String(number).padStart(2, '0')}`));
      }
    }
  }
  assert.equal(totalVisuals, 11);
  assert.equal(coverage.sections.filter(section => section.flag).length, 203);
  assert.equal(coverage.pdfs.length, 27);
  assert.equal(exams.size, 523);
  assert.deepEqual(exams, new Set(coverage.sections.flatMap(section => section.examIds)));
  assert.equal(choices, 517);
  assert.equal(cases, 34);
  assert.equal(casePrompts, 147);
  for (const section of coverage.sections) {
    assert.ok(concepts.get(section.chapter)?.has(section.conceptId), section.topic);
  }
  const coveredConcepts = new Set();
  const referencedPdfs = new Set();
  for (const ref of coverage.lessonReferences) {
    assert.ok(concepts.get(ref.chapter)?.has(ref.conceptId), ref.conceptId);
    assert.ok(!coveredConcepts.has(ref.conceptId), ref.conceptId);
    coveredConcepts.add(ref.conceptId);
    for (const entry of coverage.sections.filter(section => section.conceptId === ref.conceptId)) {
      assert.ok(ref.textbook.includes(entry.topic), entry.topic);
    }
    assert.ok(ref.pdf.length, ref.conceptId);
    for (const pdf of ref.pdf) {
      const key = pdf.chapter ?? pdf.title;
      const pageCount = pdfPages.get(key);
      assert.ok(pageCount, `Unknown PDF in ${ref.conceptId}: ${key}`);
      referencedPdfs.add(key);
      for (const range of pdf.pages.split(',')) {
        assert.match(range, /^\d+(?:–\d+)?$/);
        const [start, end = start] = range.split('–').map(Number);
        assert.ok(start >= 1 && start <= end && end <= pageCount, `${ref.conceptId}: ${range}`);
      }
    }
  }
  assert.deepEqual(coveredConcepts, new Set([...concepts.values()].flatMap(ids => [...ids])));
  assert.deepEqual(referencedPdfs, new Set(pdfPages.keys()));
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
    'assets/visuals/security-visuals.js',
    'sw.js',
  ];
  for (const rel of jsFiles) {
    const code = fs.readFileSync(path.join(dist, rel), 'utf8');
    assert.doesNotThrow(() => new vm.Script(code, { filename: rel }));
  }
});

test('published pages and assets omit the retired exam wording and source domain', () => {
  const retired = String.fromCodePoint(0x8f6f, 0x8003);
  const files = fs.readdirSync(dist, { recursive: true, withFileTypes: true });
  for (const entry of files) {
    if (!entry.isFile() || !/\.(html|js|css|json|webmanifest)$/.test(entry.name)) continue;
    const file = path.join(entry.parentPath, entry.name);
    const published = fs.readFileSync(file, 'utf8');
    assert.ok(!published.includes(retired), path.relative(dist, file));
    assert.doesNotMatch(published, /ruankaoba\.com/i, path.relative(dist, file));
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

test('test scoring records graded answers while preserving case drafts and pending questions', () => {
  const single = { id: 'graded', type: 'single', options: { A: '1', B: '2' }, answer: ['A'] };
  const caseQuestion = { id: 'case', type: 'case' };
  const pending = { id: 'pending', type: 'pending', options: { A: '1', B: '2' } };
  assert.equal(quiz.hasChoices(pending), true);
  assert.equal(quiz.isScored(pending), false);
  const questions = [single, caseQuestion, pending];
  const state = { answers: {}, test: {
    drafts: { graded: ['B'], case: ['A'], pending: ['A'] },
    caseDrafts: { case: '检查授权与日志' },
    submitted: false
  } };
  assert.deepEqual(quiz.testSummary(questions, state.test.drafts), {
    total: 1, answered: 1, correct: 0, wrong: 1, unanswered: 0
  });
  assert.equal(quiz.submitTest(state, questions), true);
  assert.equal(quiz.submitTest(state, questions), false);
  assert.equal(state.answers.graded.everWrong, true);
  assert.equal(state.answers.graded.attempts, 1);
  assert.deepEqual(Object.keys(state.answers), ['graded']);
  assert.deepEqual(state.test.drafts.pending, ['A']);
  assert.equal(state.test.caseDrafts.case, '检查授权与日志');
});
