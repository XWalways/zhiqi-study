(function (global) {
  'use strict';
  let activeController = null;
  const unique = (values) => Array.isArray(values) ? [...new Set(values)].sort() : [];
  function grade(question, selected) {
    if (!question || question.type === 'discussion' || !question.options || !Array.isArray(selected) || !Array.isArray(question.answer)) return false;
    const actual = unique(selected);
    const expected = unique(question.answer);
    if (!actual.length || !expected.length || actual.some((v) => typeof v !== 'string' || !Object.hasOwn(question.options, v))) return false;
    if (question.type !== 'multiple' && actual.length !== 1) return false;
    return actual.length === expected.length && actual.every((v, i) => v === expected[i]);
  }
  function recordAttempt(state, question, selected, at) {
    if (question.type === 'discussion' || !Array.isArray(selected) || !selected.length) return false;
    const correct = grade(question, selected);
    const previous = state.answers[question.id] || {};
    state.answers[question.id] = {
      selected: unique(selected), submitted: true, correct,
      attempts: (Number.isInteger(previous.attempts) ? previous.attempts : 0) + 1,
      everWrong: previous.everWrong === true || !correct,
      lastAnsweredAt: at || new Date().toISOString()
    };
    return true;
  }
  function testSummary(questions, drafts) {
    const graded = questions.filter(q => q.type !== 'discussion');
    const summary = { total: graded.length, answered: 0, correct: 0, wrong: 0, unanswered: 0 };
    graded.forEach((q) => {
      const selected = drafts[q.id] || [];
      if (!selected.length) summary.unanswered += 1;
      else { summary.answered += 1; if (grade(q, selected)) summary.correct += 1; else summary.wrong += 1; }
    });
    return summary;
  }
  function submitTest(state, questions, at) {
    if (state.test.submitted) return false;
    questions.forEach((q) => recordAttempt(state, q, state.test.drafts[q.id] || [], at));
    state.test.submitted = true;
    return true;
  }
  function validateImport(input, questions) {
    if (!input || input.version !== 1 || !input.answers || typeof input.answers !== 'object' || Array.isArray(input.answers)) return false;
    const byId = new Map(questions.map((q) => [q.id, q]));
    return Object.entries(input.answers).every(([id, record]) => {
      const q = byId.get(id);
      return q && q.type !== 'discussion' && record && Array.isArray(record.selected) && record.selected.length > 0 && record.selected.every((v) => Object.hasOwn(q.options, v)) &&
        (q.type === 'multiple' || unique(record.selected).length === 1) && record.correct === grade(q, record.selected) && Number.isInteger(record.attempts) && record.attempts > 0;
    });
  }
  function mount(root, config) {
    if (!root) throw new Error('Quiz root is required');
    const { questions, store, onConceptJump } = config;
    const graded = questions.filter(q => q.type !== 'discussion');
    const openDiscussions = new Set();
    let mode = 'practice';
    let currentId = questions[0] && questions[0].id;
    let statusText = '';
    let destroyed = false;
    const el = (tag, cls, text) => {
      const node = document.createElement(tag);
      if (cls) node.className = cls;
      if (text !== undefined && text !== null) node.textContent = text;
      return node;
    };
    const button = (text, action, cls) => {
      const node = el('button', cls || 'button button-secondary', text);
      node.type = 'button'; node.dataset.action = action;
      return node;
    };
    function state() {
      const s = store.get();
      return { ...s, answers: s.answers || {}, drafts: s.drafts || {}, favorites: s.favorites || [], test: s.test || { drafts: {}, submitted: false } };
    }
    function update(mutator) {
      store.update((s) => {
        s.answers ||= {}; s.drafts ||= {}; s.favorites ||= []; s.test ||= { drafts: {}, submitted: false }; s.test.drafts ||= {};
        mutator(s);
      });
    }
    function filtered(s) {
      if (mode === 'test') return graded;
      if (mode === 'wrong') return graded.filter(q => s.answers[q.id]?.everWrong);
      return questions;
    }
    function chosen(q, s) {
      if (mode === 'test') return s.test.drafts[q.id] || [];
      if (Object.hasOwn(s.drafts, q.id)) return s.drafts[q.id];
      return s.answers[q.id] ? s.answers[q.id].selected : [];
    }
    function revealed(q, s) {
      return mode === 'test' ? s.test.submitted === true : !!(s.answers[q.id] && s.answers[q.id].submitted && !Object.hasOwn(s.drafts, q.id));
    }
    function render() {
      if (destroyed) return;
      const s = state();
      const list = filtered(s);
      if (!list.some((q) => q.id === currentId)) currentId = list[0] && list[0].id;
      const q = list.find((item) => item.id === currentId);
      root.replaceChildren();
      const toolbar = el('div', 'quiz-toolbar');
      const tabs = el('div', 'quiz-tabs'); tabs.setAttribute('aria-label', '答题方式');
      [['practice', '逐题练习'], ['test', '本章测试'], ['wrong', '错题复习']].forEach(([key, label]) => {
        const tab = button(label, 'mode', 'quiz-tab' + (mode === key ? ' active' : ''));
        tab.dataset.mode = key; tab.setAttribute('aria-pressed', String(mode === key)); tabs.append(tab);
      });
      toolbar.append(tabs);
      const stats = el('span', 'muted', mode === 'wrong' ? `历史错题 ${list.length} 道 · 答对后保留记录` : mode === 'test' ? `${graded.length} 道计分题` : `${questions.length} 道练习题 · 答题记录保存在当前浏览器`);
      toolbar.append(stats); root.append(toolbar);
      if (mode === 'test') renderTestSummary(s);
      if (!q) {
        root.append(el('div', 'quiz-empty', mode === 'wrong' ? '还没有错题。完成练习后，答错的题目会出现在这里。' : '本章暂无题目。'));
        return;
      }
      const index = el('nav', 'quiz-index');
      index.setAttribute('aria-label', '题号导航');
      let activeGroup;
      let grid;
      list.forEach((item) => {
        if (!grid || item.group !== activeGroup) {
          activeGroup = item.group;
          const section = el('div', 'quiz-question-group');
          if (activeGroup) section.append(el('span', 'quiz-group-label', activeGroup));
          grid = el('div', 'quiz-grid');
          section.append(grid);
          index.append(section);
        }
        const n = button(String(item.number), 'question', 'quiz-number'); n.dataset.qid = item.id;
        const rec = s.answers[item.id];
        let result = 'unanswered';
        if (mode === 'test') {
          if (s.test.submitted) result = (s.test.drafts[item.id] || []).length ? (grade(item, s.test.drafts[item.id]) ? 'correct' : 'wrong') : 'unanswered';
          else if ((s.test.drafts[item.id] || []).length) result = 'draft';
        } else if (Object.hasOwn(s.drafts, item.id) && s.drafts[item.id].length) result = 'draft';
        else if (rec) result = rec.correct ? 'correct' : 'wrong';
        n.dataset.state = result;
        if (result === 'correct' || result === 'wrong') n.classList.add(result);
        if (result === 'draft') n.classList.add('answered');
        if (item.id === q.id) { n.classList.add('active'); n.setAttribute('aria-current', 'true'); }
        n.setAttribute('aria-label', `第 ${item.number} 题${item.type === 'discussion' ? '，讨论题' : result === 'correct' ? '，已答对' : result === 'wrong' ? '，答错' : result === 'draft' ? '，已选择待提交' : '，未作答'}`);
        grid.append(n);
      }); root.append(index);
      const card = el('article', 'quiz-card');
      const head = el('div', 'quiz-card-header');
      const discussion = q.type === 'discussion';
      const types = { multiple: '多项选择题 · 全部选对得分', single: '单项选择题', discussion: '讨论题 · 不计分' };
      const position = mode === 'test' ? `测试第 ${list.indexOf(q) + 1} / ${list.length} 题` : `第 ${q.number} / ${questions.length} 题`;
      head.append(el('span', '', [q.group, position, types[q.type]].filter(Boolean).join(' · ')));
      const favorite = button(s.favorites.includes(q.id) ? '★ 已收藏' : '☆ 收藏此题', 'favorite', 'button button-secondary quiz-favorite');
      favorite.setAttribute('aria-pressed', String(s.favorites.includes(q.id))); head.append(favorite); card.append(head);
      const stem = el('h3', 'quiz-stem', q.stem); stem.id = 'quiz-current-stem'; card.append(stem);
      const field = el('fieldset', 'quiz-options');
      field.setAttribute('aria-labelledby', stem.id);
      field.append(el('legend', '', discussion ? '讨论选项' : q.type === 'multiple' ? '请选择所有符合题意的选项' : '请选择一个选项'));
      const selected = chosen(q, s);
      const show = revealed(q, s);
      Object.entries(q.options).forEach(([key, text]) => {
        if (discussion) {
          field.append(el('div', 'quiz-option', `${key}. ${text}`));
          return;
        }
        const label = el('label', 'quiz-option');
        const input = el('input'); input.type = q.type === 'multiple' ? 'checkbox' : 'radio'; input.name = 'quiz-answer'; input.value = key;
        input.checked = selected.includes(key); input.disabled = show; input.dataset.qid = q.id;
        if (show && q.answer.includes(key)) label.classList.add('correct');
        if (show && selected.includes(key) && !q.answer.includes(key)) label.classList.add('wrong');
        label.append(input, el('span', '', `${key}. ${text}`)); field.append(label);
      }); card.append(field);
      if (mode === 'wrong' && s.answers[q.id] && s.answers[q.id].correct) card.append(el('p', 'quiz-status quiz-correct', '最近一次已答对 · 已掌握，历史错题仍保留'));
      const actions = el('div', 'quiz-actions');
      const nav = el('div', 'quiz-nav');
      const questionIndex = list.findIndex((item) => item.id === q.id);
      const prev = button('上一题', 'previous'); prev.disabled = questionIndex <= 0;
      const next = button('下一题', 'next'); next.disabled = questionIndex >= list.length - 1;
      nav.append(prev, next); actions.append(nav);
      if (discussion) {
        const open = openDiscussions.has(q.id);
        const toggle = button(open ? '收起讨论解析' : '查看讨论解析', 'discussion', 'button button-primary');
        toggle.setAttribute('aria-expanded', String(open));
        actions.append(toggle);
      } else if (mode !== 'test') {
        const submit = button(show ? '重新作答' : '提交答案', show ? 'retry' : 'submit', 'button button-primary');
        submit.disabled = !show && !selected.length; actions.append(submit);
      } else if (!s.test.submitted) actions.append(el('span', 'muted', '本章测试交卷后统一显示解析'));
      card.append(actions);
      const status = el('p', 'quiz-status', statusText); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite'); card.append(status);
      if (show || openDiscussions.has(q.id)) renderExplanation(card, q, selected);
      root.append(card);
      if (mode === 'test' && !s.test.submitted) {
        const foot = el('div', 'quiz-actions');
        foot.append(el('p', 'muted', '未答题交卷后记为未作答，不加入错题本。'), button('交卷并查看解析', 'finish-test', 'button button-primary'));
        root.append(foot);
      }
    }
    function renderTestSummary(s) {
      const summary = testSummary(questions, s.test.drafts);
      const box = el('div', 'quiz-summary');
      if (s.test.submitted) {
        box.setAttribute('role', 'status');
        box.append(el('strong', '', `${summary.correct} / ${summary.total}`), el('span', '', `  答对 · 答错 ${summary.wrong} 道 · 未答 ${summary.unanswered} 道`));
        box.append(el('p', '', `正确率 ${summary.total ? Math.round(summary.correct / summary.total * 100) : 0}% · 点击题号查看各题解析。`), button('重新测试', 'restart-test'));
      } else box.append(el('span', '', `已选择 ${summary.answered} / ${summary.total} 题 · 测试中不显示答案，随时可切换题号。`));
      root.append(box);
    }
    function renderExplanation(card, q, selected) {
      const feedback = el('div', 'quiz-feedback quiz-explanation');
      if (q.type === 'discussion') {
        feedback.append(el('h3', '', '讨论解析'));
      } else {
        const correct = grade(q, selected);
        feedback.append(el('h3', correct ? 'quiz-correct' : 'quiz-incorrect', !selected.length ? '本题未作答' : correct ? '回答正确' : '回答错误'));
        const selectionText = selected.length ? `你选择了 ${selected.join('、')}。` : '你未作答。';
        feedback.append(el('p', '', `${selectionText}正确答案是 ${q.answer.join('、')}。`));
      }
      if (q.type === 'multiple' && selected.length && !grade(q, selected)) {
        const missing = q.answer.filter((key) => !selected.includes(key)); const extra = selected.filter((key) => !q.answer.includes(key));
        const details = [];
        if (missing.length) details.push(`漏选了 ${missing.join('、')}。`);
        if (extra.length) details.push(`错选了 ${extra.join('、')}。`);
        feedback.append(el('p', '', details.join('')));
      }
      feedback.append(el('h4', '', '解题思路'), el('p', '', q.explanationSupplement || '请结合对应知识点复习。'));
      if (q.optionExplanations && Object.keys(q.optionExplanations).length) {
        feedback.append(el('h4', '', '选项辨析'));
        const reasons = el('ul', 'quiz-rationale-list');
        Object.entries(q.optionExplanations).forEach(([key, text]) => reasons.append(el('li', '', `${key}　${text}`))); feedback.append(reasons);
      }
      const links = el('div', 'quiz-actions'); const jump = button('回看对应知识点', 'concept'); jump.dataset.concept = q.conceptId;
      links.append(jump); feedback.append(links); card.append(feedback);
    }
    function handleClick(event) {
      const target = event.target.closest('button[data-action]');
      if (!target || !root.contains(target)) return;
      const action = target.dataset.action;
      const s = state(); const list = filtered(s); const q = list.find((item) => item.id === currentId);
      statusText = '';
      if (action === 'mode') { mode = target.dataset.mode; }
      else if (action === 'question') currentId = target.dataset.qid;
      else if (action === 'discussion' && q?.type === 'discussion') {
        if (openDiscussions.has(q.id)) openDiscussions.delete(q.id);
        else openDiscussions.add(q.id);
      }
      else if (action === 'previous' || action === 'next') {
        const index = list.findIndex((item) => item.id === currentId); const item = list[index + (action === 'next' ? 1 : -1)]; if (item) currentId = item.id;
      } else if (action === 'favorite' && q) update((draft) => { const i = draft.favorites.indexOf(q.id); if (i >= 0) draft.favorites.splice(i, 1); else draft.favorites.push(q.id); });
      else if (action === 'retry' && q) { update((draft) => { draft.drafts[q.id] = []; }); statusText = '已开始重新作答，历史记录保留。'; }
      else if (action === 'submit' && q) {
        const selected = chosen(q, s); if (!selected.length) { statusText = '请先选择答案。'; }
        else { update((draft) => { recordAttempt(draft, q, selected); delete draft.drafts[q.id]; }); statusText = grade(q, selected) ? '答案已保存，回答正确。' : '答案已保存，已加入错题本。'; }
      } else if (action === 'finish-test') { update((draft) => submitTest(draft, questions)); statusText = '测试已交卷，答题记录已保存。'; }
      else if (action === 'restart-test') { update((draft) => { draft.test = { drafts: {}, submitted: false }; }); currentId = questions[0] && questions[0].id; statusText = '新一轮测试已开始，历史答题记录保留。'; }
      else if (action === 'concept') { if (typeof onConceptJump === 'function') onConceptJump(target.dataset.concept); return; }
      render();
      if (action === 'discussion') root.querySelector('[data-action="discussion"]')?.focus();
    }
    function handleChange(event) {
      const input = event.target;
      if (!input.matches('input[name="quiz-answer"]')) return;
      const s = state(); const q = questions.find((item) => item.id === input.dataset.qid); if (!q || revealed(q, s)) return;
      const selected = [...root.querySelectorAll('input[name="quiz-answer"]:checked')].map((node) => node.value);
      update((draft) => { if (mode === 'test') draft.test.drafts[q.id] = selected; else draft.drafts[q.id] = selected; });
      statusText = '选项已暂存，提交后判题。';
      const value = input.value; render();
      const focus = [...root.querySelectorAll('input[name="quiz-answer"]')].find((node) => node.value === value); if (focus) focus.focus({ preventScroll: true });
    }
    const controller = { openQuestion(id) { if (!questions.some((q) => q.id === id)) return false; mode = 'practice'; currentId = id; statusText = ''; render(); return true; } };
    activeController = controller;
    root.addEventListener('click', handleClick); root.addEventListener('change', handleChange); render();
    return function cleanup() { destroyed = true; root.removeEventListener('click', handleClick); root.removeEventListener('change', handleChange); if (activeController === controller) activeController = null; };
  }
  function mountInline(root, config) {
    if (!root) throw new Error('Inline quiz root is required');
    const { sectionId, questions, store } = config;
    const openDiscussions = new Set();
    let currentId = questions[0] && questions[0].id;
    let statusText = '';
    let collapsed = false;
    let destroyed = false;
    const el = (tag, cls, text) => {
      const node = document.createElement(tag);
      if (cls) node.className = cls;
      if (text !== undefined && text !== null) node.textContent = text;
      return node;
    };
    const button = (text, action, cls) => {
      const node = el('button', cls || 'button button-secondary', text);
      node.type = 'button'; node.dataset.action = action;
      return node;
    };
    function state() {
      const s = store.get();
      return { ...s, answers: s.answers || {}, drafts: s.drafts || {}, favorites: s.favorites || [] };
    }
    function update(mutator) {
      store.update((s) => {
        s.answers ||= {}; s.drafts ||= {}; s.favorites ||= [];
        mutator(s);
      });
    }
    function chosen(q, s) {
      if (Object.hasOwn(s.drafts, q.id)) return s.drafts[q.id];
      return s.answers[q.id] ? s.answers[q.id].selected : [];
    }
    function revealed(q, s) {
      return !!(s.answers[q.id] && s.answers[q.id].submitted && !Object.hasOwn(s.drafts, q.id));
    }
    function render() {
      if (destroyed) return;
      const s = state();
      if (!questions.some((q) => q.id === currentId)) currentId = questions[0] && questions[0].id;
      const q = questions.find((item) => item.id === currentId);
      root.replaceChildren();
      if (!q) return;

      const graded = questions.filter((item) => item.type !== 'discussion');
      const doneCount = graded.filter((item) => s.answers[item.id]?.submitted).length;
      const correctCount = graded.filter((item) => s.answers[item.id]?.correct).length;

      const header = el('div', 'inline-practice-head');
      const titleGroup = el('div', 'inline-practice-title');
      titleGroup.append(el('span', 'inline-practice-badge', '即学即练'));
      const summaryText = graded.length
        ? `本知识点 ${questions.length} 道配套题 · 已答 ${doneCount}/${graded.length}${doneCount ? `（答对 ${correctCount}）` : ''}`
        : `本知识点 ${questions.length} 道讨论题`;
      titleGroup.append(el('span', 'muted', summaryText));
      const toggleBtn = button(collapsed ? '展开练习' : '收起练习', 'toggle-collapse', 'text-button');
      toggleBtn.setAttribute('aria-expanded', String(!collapsed));
      header.append(titleGroup, toggleBtn);
      root.append(header);

      if (collapsed) return;

      const body = el('div', 'inline-practice-body');
      if (questions.length > 1) {
        const nav = el('nav', 'quiz-grid inline-quiz-grid');
        nav.setAttribute('aria-label', '本知识点练习题号');
        questions.forEach((item, idx) => {
          const n = button(String(idx + 1), 'question', 'quiz-number');
          n.dataset.qid = item.id;
          const rec = s.answers[item.id];
          let result = 'unanswered';
          if (Object.hasOwn(s.drafts, item.id) && s.drafts[item.id].length) result = 'draft';
          else if (rec) result = rec.correct ? 'correct' : 'wrong';
          n.dataset.state = result;
          if (result === 'correct' || result === 'wrong') n.classList.add(result);
          if (result === 'draft') n.classList.add('answered');
          if (item.id === q.id) { n.classList.add('active'); n.setAttribute('aria-current', 'true'); }
          n.setAttribute('aria-label', `本知识点第 ${idx + 1} 题（全章第 ${item.number} 题）`);
          nav.append(n);
        });
        body.append(nav);
      }

      const card = el('div', 'inline-quiz-card');
      const cardHead = el('div', 'quiz-card-header');
      const discussion = q.type === 'discussion';
      const types = { multiple: '多项选择题 · 全部选对得分', single: '单项选择题', discussion: '讨论题 · 不计分' };
      const qIdx = questions.findIndex((item) => item.id === q.id);
      const posLabel = questions.length > 1 ? `第 ${qIdx + 1}/${questions.length} 题（全章第 ${q.number} 题）` : `全章第 ${q.number} 题`;
      cardHead.append(el('span', '', [posLabel, types[q.type]].join(' · ')));
      const favorite = button(s.favorites.includes(q.id) ? '★ 已收藏' : '☆ 收藏此题', 'favorite', 'button button-secondary quiz-favorite');
      favorite.setAttribute('aria-pressed', String(s.favorites.includes(q.id)));
      cardHead.append(favorite);
      card.append(cardHead);

      const stem = el('h4', 'quiz-stem inline-quiz-stem', q.stem);
      stem.id = `inline-stem-${sectionId}-${q.id}`;
      card.append(stem);

      const field = el('fieldset', 'quiz-options');
      field.setAttribute('aria-labelledby', stem.id);
      field.append(el('legend', '', discussion ? '讨论选项' : q.type === 'multiple' ? '请选择所有符合题意的选项' : '请选择一个选项'));
      const selected = chosen(q, s);
      const show = revealed(q, s);
      const inputName = `inline-quiz-${sectionId}-${q.id}`;
      Object.entries(q.options).forEach(([key, text]) => {
        if (discussion) {
          field.append(el('div', 'quiz-option', `${key}. ${text}`));
          return;
        }
        const label = el('label', 'quiz-option');
        const input = el('input');
        input.type = q.type === 'multiple' ? 'checkbox' : 'radio';
        input.name = inputName;
        input.value = key;
        input.checked = selected.includes(key);
        input.disabled = show;
        input.dataset.qid = q.id;
        if (show && q.answer.includes(key)) label.classList.add('correct');
        if (show && selected.includes(key) && !q.answer.includes(key)) label.classList.add('wrong');
        label.append(input, el('span', '', `${key}. ${text}`));
        field.append(label);
      });
      card.append(field);

      const actions = el('div', 'quiz-actions');
      if (questions.length > 1) {
        const nav = el('div', 'quiz-nav');
        const prev = button('上一题', 'previous'); prev.disabled = qIdx <= 0;
        const next = button('下一题', 'next'); next.disabled = qIdx >= questions.length - 1;
        nav.append(prev, next);
        actions.append(nav);
      }
      if (discussion) {
        const open = openDiscussions.has(q.id);
        const toggle = button(open ? '收起讨论解析' : '查看讨论解析', 'discussion', 'button button-primary');
        toggle.setAttribute('aria-expanded', String(open));
        actions.append(toggle);
      } else {
        const submit = button(show ? '重新作答' : '提交答案', show ? 'retry' : 'submit', 'button button-primary');
        submit.disabled = !show && !selected.length;
        actions.append(submit);
      }
      card.append(actions);

      const status = el('p', 'quiz-status', statusText);
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      card.append(status);

      if (show || openDiscussions.has(q.id)) {
        const feedback = el('div', 'quiz-feedback quiz-explanation');
        if (q.type === 'discussion') {
          feedback.append(el('h4', '', '讨论解析'));
        } else {
          const correct = grade(q, selected);
          feedback.append(el('h4', correct ? 'quiz-correct' : 'quiz-incorrect', correct ? '回答正确' : '回答错误'));
          feedback.append(el('p', '', `你选择了 ${selected.join('、')}。正确答案是 ${q.answer.join('、')}。`));
        }
        if (q.type === 'multiple' && selected.length && !grade(q, selected)) {
          const missing = q.answer.filter((key) => !selected.includes(key));
          const extra = selected.filter((key) => !q.answer.includes(key));
          const details = [];
          if (missing.length) details.push(`漏选了 ${missing.join('、')}。`);
          if (extra.length) details.push(`错选了 ${extra.join('、')}。`);
          feedback.append(el('p', '', details.join('')));
        }
        feedback.append(el('h5', '', '解题思路'), el('p', '', q.explanationSupplement || '请结合上方知识点复习。'));
        if (q.optionExplanations && Object.keys(q.optionExplanations).length) {
          feedback.append(el('h5', '', '选项辨析'));
          const reasons = el('ul', 'quiz-rationale-list');
          Object.entries(q.optionExplanations).forEach(([key, text]) => reasons.append(el('li', '', `${key}　${text}`)));
          feedback.append(reasons);
        }
        card.append(feedback);
      }

      body.append(card);
      root.append(body);
    }
    function handleClick(event) {
      const target = event.target.closest('button[data-action]');
      if (!target || !root.contains(target)) return;
      const action = target.dataset.action;
      const s = state();
      const q = questions.find((item) => item.id === currentId);
      statusText = '';
      if (action === 'toggle-collapse') { collapsed = !collapsed; }
      else if (action === 'question') { currentId = target.dataset.qid; }
      else if (action === 'discussion' && q?.type === 'discussion') {
        if (openDiscussions.has(q.id)) openDiscussions.delete(q.id);
        else openDiscussions.add(q.id);
      } else if (action === 'previous' || action === 'next') {
        const idx = questions.findIndex((item) => item.id === currentId);
        const nextItem = questions[idx + (action === 'next' ? 1 : -1)];
        if (nextItem) currentId = nextItem.id;
      } else if (action === 'favorite' && q) {
        update((draft) => { const i = draft.favorites.indexOf(q.id); if (i >= 0) draft.favorites.splice(i, 1); else draft.favorites.push(q.id); });
      } else if (action === 'retry' && q) {
        update((draft) => { draft.drafts[q.id] = []; });
        statusText = '已开始重新作答，历史记录保留。';
      } else if (action === 'submit' && q) {
        const selected = chosen(q, s);
        if (!selected.length) { statusText = '请先选择答案。'; }
        else {
          update((draft) => { recordAttempt(draft, q, selected); delete draft.drafts[q.id]; });
          statusText = grade(q, selected) ? '答案已保存，回答正确。' : '答案已保存，已加入错题本。';
        }
      }
      render();
    }
    function handleChange(event) {
      const input = event.target;
      if (!input.matches('input[data-qid]')) return;
      const s = state();
      const q = questions.find((item) => item.id === input.dataset.qid);
      if (!q || revealed(q, s)) return;
      const selected = [...root.querySelectorAll(`input[name="${input.name}"]:checked`)].map((node) => node.value);
      update((draft) => { draft.drafts[q.id] = selected; });
      statusText = '选项已暂存，提交后判题。';
      const value = input.value;
      render();
      const focus = [...root.querySelectorAll(`input[name="${input.name}"]`)].find((node) => node.value === value);
      if (focus) focus.focus({ preventScroll: true });
    }
    root.addEventListener('click', handleClick);
    root.addEventListener('change', handleChange);
    render();
    return {
      render,
      cleanup() { destroyed = true; root.removeEventListener('click', handleClick); root.removeEventListener('change', handleChange); },
    };
  }
  const api = { mount, mountInline, grade, recordAttempt, testSummary, submitTest, validateImport, openQuestion(id) { return activeController ? activeController.openQuestion(id) : false; } };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (global) global.StudyQuiz = api;
})(typeof window !== 'undefined' ? window : typeof globalThis !== 'undefined' ? globalThis : this);
