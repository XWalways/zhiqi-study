import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const readJson = file => JSON.parse(read(file));
const writeOut = (relPath, content) => {
  const full = path.join(dist, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
};

// Map courseRoute/chapterId -> visuals
const visualsMap = {
  'economy/01': [{ type: 'ppf', sectionId: 'ppf' }],
  'economy/02': [
    { type: 'demand-move', sectionId: 'demand-shifts' },
    { type: 'supply-move', sectionId: 'supply-shifts' },
    { type: 'market', sectionId: 'equilibrium' },
    { type: 'price-controls', sectionId: 'price-controls' },
  ],
  'economy/03': [
    { type: 'elasticity', sectionId: 'elasticity-revenue' },
    { type: 'supply-elasticity', sectionId: 'supply-price' },
  ],
  'economy/04': [
    { type: 'tu-mu', sectionId: 'marginal-utility' },
    { type: 'consumer', sectionId: 'consumer-equilibrium' },
  ],
  'economy/05': [
    { type: 'production', sectionId: 'production-stages' },
    { type: 'isoquant', sectionId: 'producer-equilibrium' },
  ],
  'economy/06': [
    { type: 'cost', sectionId: 'cost-curves' },
    { type: 'lac-envelope', sectionId: 'long-run-cost' },
  ],
  'economy/07': [{ type: 'market-structure', sectionId: 'perfect-short' }],
  'economy/08': [{ type: 'prisoners-matrix', sectionId: 'prisoners-dilemma' }],
  'economy/09': [
    { type: 'labour-supply', sectionId: 'labour-supply' },
    { type: 'lorenz-gini', sectionId: 'lorenz-gini' },
  ],
  'economy/10': [{ type: 'externality', sectionId: 'externalities' }],
  'economy/11': [{ type: 'keynes-cross', sectionId: 'expenditure-equilibrium' }],
  'economy/12': [{ type: 'is-lm', sectionId: 'is-lm-equilibrium' }],
  'economy/13': [{ type: 'ad-as', sectionId: 'ad-as-equilibrium' }],
  'economy/14': [{ type: 'phillips', sectionId: 'phillips-curve' }],
  'economy/15': [{ type: 'lm-regions', sectionId: 'fiscal-effects' }],
  'economy/16': [{ type: 'trilemma', sectionId: 'trilemma' }],
  'economy/17': [{ type: 'solow', sectionId: 'solow-growth' }],
  'finance/01': [{ type: 'money-layers', sectionId: 'aggregates' }],
  'finance/02': [
    { type: 'financing-flow', sectionId: 'financing' },
    { type: 'bill-chain', sectionId: 'bills' },
  ],
  'finance/03': [{ type: 'bond', sectionId: 'bond-value' }],
  'finance/04': [{ type: 'bank-balance', sectionId: 'central-balance' }],
  'finance/05': [{ type: 'multiplier', sectionId: 'deposit-multiplier' }],
  'finance/06': [{ type: 'bop-structure', sectionId: 'bop-accounts' }],
  'finance/07': [{ type: 'basel-pillars', sectionId: 'basel-capital' }],
  'finance/08': [{ type: 'repression-gap', sectionId: 'repression-mechanism' }],
  'insurance/01': [{ type: 'risk-matrix', sectionId: 'risk-management' }],
  'insurance/02': [{ type: 'proximate-cause', sectionId: 'proximate-cause' }],
  'insurance/03': [{ type: 'contract-timeline', sectionId: 'contract-formation' }],
  'insurance/04': [{ type: 'pension-pyramid', sectionId: 'pension-pillars' }],
  'insurance/05': [
    { type: 'deductible', sectionId: 'property-compensation' },
    { type: 'liability-timeline', sectionId: 'liability-triggers' },
  ],
  'insurance/06': [{ type: 'life-interest', sectionId: 'interest' }],
  'computer/security/01': [{ type: 'sec-cia-layers', sectionId: 'cia-properties' }],
  'computer/security/02': [
    { type: 'sec-hybrid-crypto', sectionId: 'asymmetric-crypto' },
    { type: 'sec-transmission-crypto', sectionId: 'transmission-crypto' },
  ],
  'computer/security/03': [{ type: 'sec-signature-pki', sectionId: 'digital-signature' }],
  'computer/security/04': [{ type: 'sec-defense-topology', sectionId: 'active-defense' }],
  'computer/security/05': [{ type: 'sec-dmz-policy', sectionId: 'dmz-architecture' }],
  'computer/security/06': [{ type: 'sec-chmod-calc', sectionId: 'linux-security' }],
};

const templateHtml = read('src/template.html');
const diagramTemplates = {
  ppf: read('src/visuals/ppf.html'),
  market: read('src/visuals/market.html'),
};
const scriptBundles = {
  market: 'assets/visuals/market.js',
  micro: 'assets/visuals/micro-visuals.js',
  macroFin: 'assets/visuals/macro-fin-visuals.js',
  static: 'assets/visuals/static-visuals.js',
  extra: 'assets/visuals/extra-visuals.js',
  security: 'assets/visuals/security-visuals.js',
};
const bundleMembership = {
  market: new Set(['market']),
  micro: new Set(['demand-move', 'supply-move', 'price-controls', 'elasticity', 'supply-elasticity', 'consumer', 'production', 'isoquant', 'cost', 'market-structure']),
  macroFin: new Set(['is-lm', 'ad-as', 'phillips', 'trilemma', 'bond', 'multiplier', 'deductible', 'liability-timeline']),
  static: new Set(['money-layers', 'financing-flow', 'bill-chain', 'bank-balance', 'basel-pillars', 'proximate-cause', 'contract-timeline', 'pension-pyramid', 'life-interest']),
  extra: new Set(['tu-mu', 'lac-envelope', 'prisoners-matrix', 'lorenz-gini', 'labour-supply', 'externality', 'keynes-cross', 'lm-regions', 'solow', 'bop-structure', 'repression-gap', 'risk-matrix']),
  security: new Set(['sec-cia-layers', 'sec-hybrid-crypto', 'sec-transmission-crypto', 'sec-signature-pki', 'sec-defense-topology', 'sec-dmz-policy', 'sec-chmod-calc']),
};

const siteConfig = readJson('courses/site.json');
const courses = [];
for (const domain of siteConfig.domains) {
  for (const route of domain.courses) {
    courses.push(readJson(`courses/${route}/course.json`));
  }
}
const siteData = {
  siteTitle: siteConfig.siteTitle,
  siteSubtitle: siteConfig.siteSubtitle,
  repoUrl: siteConfig.repoUrl,
  domains: siteConfig.domains,
  courses,
};

function rootPrefixFor(relHtmlPath) {
  const depth = relHtmlPath.split('/').length - 1;
  return depth === 0 ? './' : '../'.repeat(depth);
}

function renderPage(relHtmlPath, pageType, payload, visuals = []) {
  const rootPrefix = rootPrefixFor(relHtmlPath);
  const inlineTemplates = visuals
    .filter(v => diagramTemplates[v.type])
    .map(v => `<template data-visual-template="${v.type}">${diagramTemplates[v.type]}</template>`)
    .join('');
  const visualScriptTags = [];
  for (const [bundleKey, set] of Object.entries(bundleMembership)) {
    if (visuals.some(v => set.has(v.type))) {
      visualScriptTags.push(`<script src="${rootPrefix}${scriptBundles[bundleKey]}"></script>`);
    }
  }
  const inlineData = JSON.stringify(payload)
    .replaceAll('<', '\\u003c')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029');
  return templateHtml
    .replaceAll('<!--ROOT-->', rootPrefix)
    .replaceAll('<!--REPO_URL-->', siteConfig.repoUrl)
    .replace('<body>', `<body data-page="${pageType}" data-root="${rootPrefix}">`)
    .replace('<!--VISUAL-->', () => inlineTemplates)
    .replace('<!--DATA-->', () => `<script>window.STUDY_CONTENT=${inlineData};</script>`)
    .replace('<!--VISUAL_SCRIPTS-->', () => visualScriptTags.join('\n'));
}

function redirectPage(targetRel) {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${targetRel}"><title>正在跳转…</title><script>location.replace(${JSON.stringify(targetRel)}+location.hash);</script></head><body><p>页面已迁移至 <a href="${targetRel}">${targetRel}</a></p></body></html>\n`;
}

// Clean dist/
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

// 1. Copy shared assets & PWA files
writeOut('assets/styles.css', read('src/styles.css'));
writeOut('assets/quiz.js', read('src/quiz.js'));
writeOut('assets/app.js', read('src/app.js'));
for (const fname of ['market.js', 'micro-visuals.js', 'macro-fin-visuals.js', 'static-visuals.js', 'extra-visuals.js', 'security-visuals.js']) {
  writeOut(`assets/visuals/${fname}`, read(`src/visuals/${fname}`));
}
writeOut('manifest.webmanifest', read('src/manifest.webmanifest'));
writeOut('sw.js', read('src/sw.js'));
writeOut('.nojekyll', '');
writeOut('robots.txt', 'User-agent: *\nDisallow: /\n');

// 2. Build Home page
writeOut('index.html', renderPage('index.html', 'home', { site: siteData }));

// 3. Build Domain overview pages (e.g. computer/index.html)
for (const domain of siteConfig.domains) {
  if (domain.route) {
    writeOut(`${domain.route}/index.html`, renderPage(`${domain.route}/index.html`, 'domain', { site: siteData, domain }));
  }
}

// 4. Build Course pages, Chapter pages, and legacy redirects
let builtChapters = 0;
let totalVisuals = 0;
for (const course of courses) {
  writeOut(`${course.route}/index.html`, renderPage(`${course.route}/index.html`, 'course', { site: siteData, course }));
  for (const ch of course.chapters) {
    if (!ch.ready) continue;
    const lessons = readJson(`courses/${course.route}/chapters/${ch.id}-lessons.json`);
    const questions = readJson(`courses/${course.route}/chapters/${ch.id}-questions.json`);
    const key = `${course.route}/${ch.id}`;
    const visuals = visualsMap[key] || [];
    totalVisuals += visuals.length;
    const rel = `${course.route}/${ch.id}.html`;
    const chapterData = { ...ch, visuals };
    writeOut(rel, renderPage(rel, 'chapter', { site: siteData, course, chapter: chapterData, lessons, questions }, visuals));
    builtChapters++;
    if (ch.legacyId) {
      writeOut(`${ch.legacyId}.html`, redirectPage(`${course.route}/${ch.id}.html`));
    }
  }
}

console.log(`Built ${courses.length} courses, ${builtChapters} chapters, ${totalVisuals} visuals into dist/.`);
