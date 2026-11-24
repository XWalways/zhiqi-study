(function(){
 'use strict';
 const C=window.STUDY_CONTENT, $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
 const pageType=document.body.dataset.page||'home';
 const rootPrefix=document.body.dataset.root||'./';
 const site=C.site;
 const course=C.course||null;
 const chapter=C.chapter||null;
 const sectionIds=new Set(C.lessons?.sections.map(s=>s.id));
 const questionIds=new Set(C.questions?.map(q=>q.id));
 const STORAGE_PREFIX='zhiqi-study:v2:';
 const LAST_KEY='zhiqi-study:v2:last-visited';
 const chapterKey=(route,id)=>`${STORAGE_PREFIX}${route}:${id}`;
 const KEY=chapter?chapterKey(course.route,chapter.id):null;
 const empty=()=>({version:1,answers:{},drafts:{},favorites:[],reading:{seen:[],lastConcept:'',scrollY:0},test:{drafts:{},submitted:false}});
 let storageAvailable=true,state=empty(),quizCleanup=null,view='learn',toastTimer,ppfTimer=null;
 let readingTimer, readingTracking=false, readingChanged=false, lessonFilter='all', lessonQuery='';
 const inlineQuizzes=[];
 const clone=o=>JSON.parse(JSON.stringify(o));

 // Register PWA Service Worker for automatic offline caching
 if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
   navigator.serviceWorker.register(rootPrefix + 'sw.js').catch(() => {});
  });
 }

 function cleanSelected(value,q){if(!Array.isArray(value)||!value.every(v=>typeof v==='string'&&Object.hasOwn(q.options,v)))throw Error('备份中的作答选项无效');const out=[...new Set(value)].sort();if(q.type==='single'&&out.length>1)throw Error('单选题备份含多个选项');return out;}
 function validateState(raw){
  if(!raw||raw.version!==1||!raw.answers||typeof raw.answers!=='object'||Array.isArray(raw.answers)||!Array.isArray(raw.favorites))throw Error('文件不是有效的学习记录备份');
  const out=empty();
  (C.questions||[]).filter(q=>q.type!=='discussion').forEach(q=>{
   const rec=Object.hasOwn(raw.answers,q.id)?raw.answers[q.id]:null;
   if(rec){const selected=cleanSelected(rec.selected,q);if(!selected.length||rec.submitted!==true||!Number.isSafeInteger(rec.attempts)||rec.attempts<1)throw Error('答题记录格式不完整');out.answers[q.id]={selected,submitted:true,correct:window.StudyQuiz.grade(q,selected),attempts:rec.attempts,everWrong:rec.everWrong===true||!window.StudyQuiz.grade(q,selected),lastAnsweredAt:typeof rec.lastAnsweredAt==='string'?rec.lastAnsweredAt:''};}
   if(raw.drafts&&Object.hasOwn(raw.drafts,q.id))out.drafts[q.id]=cleanSelected(raw.drafts[q.id],q);
   if(raw.test?.drafts&&Object.hasOwn(raw.test.drafts,q.id))out.test.drafts[q.id]=cleanSelected(raw.test.drafts[q.id],q);
  });
  out.favorites=[...new Set(raw.favorites.filter(id=>typeof id==='string'&&(questionIds.has(id)||(id.startsWith('concept:')&&sectionIds.has(id.slice(8))))))];
  out.reading.seen=Array.isArray(raw.reading?.seen)?[...new Set(raw.reading.seen.filter(id=>sectionIds.has(id)))]:[];
  out.reading.lastConcept=sectionIds.has(raw.reading?.lastConcept)?raw.reading.lastConcept:'';
  out.reading.scrollY=Number.isFinite(raw.reading?.scrollY)?Math.max(0,raw.reading.scrollY):0;
  out.test.submitted=raw.test?.submitted===true;
  return out;
 }
 function notice(){storageAvailable=false;$('#storage-notice').hidden=false;$('#storage-notice').textContent='当前浏览器无法保存学习记录，阅读和答题仍可使用。离开前请导出记录备份。';}

 // Seamless migration from legacy zhiqi-study-v1 keys
 function readLegacyKey(legacyId){
  if(!legacyId)return null;
  try{
   const k=legacyId==='chapter01'?'zhiqi-study-v1':`zhiqi-study-v1:${legacyId}`;
   return localStorage.getItem(k);
  }catch{return null;}
 }

 if (chapter) {
  try {
   let saved=localStorage.getItem(KEY);
   if(!saved && chapter.legacyId) {
    const legacyRaw=readLegacyKey(chapter.legacyId);
    if(legacyRaw){
     state=validateState(JSON.parse(legacyRaw));
     localStorage.setItem(KEY,JSON.stringify(state));
    }
   } else if(saved) {
    state=validateState(JSON.parse(saved));
   }
   localStorage.setItem(LAST_KEY, JSON.stringify({
    route: course.route,
    courseTitle: course.title,
    chapterId: chapter.id,
    chapterTitle: chapter.title,
    href: `${course.route}/${chapter.id}.html`,
    at: new Date().toISOString(),
   }));
   const probe=KEY+'-probe';
   localStorage.setItem(probe,'1');
   localStorage.removeItem(probe);
  } catch { notice(); }
 }

 function updateState(mutator) {
  if (!chapter) return clone(state);
  if (storageAvailable) {
   try {
    const saved=localStorage.getItem(KEY);
    if (saved) state=validateState(JSON.parse(saved));
   } catch { notice(); }
  }
  mutator(state);
  try { localStorage.setItem(KEY,JSON.stringify(state)); } catch { notice(); }
  updateProgress();
  return clone(state);
 }
 const store={get:()=>clone(state),update:updateState};
 window.StudyStore=store;

 function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').hidden=false;toastTimer=setTimeout(()=>$('#toast').hidden=true,3500);}
 function el(tag,className,text){const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e;}
 function button(text,className,onClick){const b=el('button',className,text);b.type='button';if(onClick)b.addEventListener('click',onClick);return b;}
 function openModal(title,content){$('#modal-title').textContent=title;$('#modal-content').replaceChildren();if(typeof content==='string')$('#modal-content').innerHTML=content;else if(content)$('#modal-content').append(content);if(!$('#modal').open)$('#modal').showModal();}
 $('#modal-close').addEventListener('click',()=>$('#modal').close());
 $('#modal').addEventListener('click',e=>{if(e.target===$('#modal')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
 function syncInlineQuizzes(){inlineQuizzes.forEach(item=>item.render());}

 function readChapterRecord(route, chapterId, legacyId){
  try {
   const raw = localStorage.getItem(chapterKey(route, chapterId)) || readLegacyKey(legacyId);
   if (!raw) return null;
   const parsed = JSON.parse(raw);
   const seen = Array.isArray(parsed?.reading?.seen) ? parsed.reading.seen.length : 0;
   const answered = parsed?.answers && typeof parsed.answers === 'object' ? Object.keys(parsed.answers).length : 0;
   if (!seen && !answered) return null;
   return { seen, answered };
  } catch { return null; }
 }

 function readCourseStats(courseEntry){
  let started=0, answered=0;
  for(const ch of courseEntry.chapters||[]){
   const rec=readChapterRecord(courseEntry.route, ch.id, ch.legacyId);
   if(rec){ started++; answered+=rec.answered; }
  }
  return { started, answered, total: (courseEntry.chapters||[]).length };
 }

 function renderSubjectNav(){
  const nav=$('#subject-nav');
  if(!nav)return;
  const items=[
   { label: '总览', href: `${rootPrefix}index.html`, active: pageType==='home' },
   { label: '经济', href: `${rootPrefix}economy/index.html`, active: course?.route==='economy' },
   { label: '金融', href: `${rootPrefix}finance/index.html`, active: course?.route==='finance' },
   { label: '保险', href: `${rootPrefix}insurance/index.html`, active: course?.route==='insurance' },
   { label: '计算机', href: `${rootPrefix}computer/index.html`, active: pageType==='domain'||course?.route?.startsWith('computer/') },
  ];
  for(const item of items){
   const a=el('a', item.active?'active':'', item.label);
   a.href=item.href;
   if(item.active)a.setAttribute('aria-current','page');
   nav.append(a);
  }
 }

 function renderSidebar(){
  const box=$('#sidebar-catalog');
  if(!box)return;
  if(course){
   $('#sidebar-title').textContent=course.title;
   $('#open-chapter-count').textContent=`${course.chapters.length} 章`;
   const back=el('a','sidebar-back','← 返回全部学科');
   back.href=`${rootPrefix}index.html`;
   box.append(back);
   if(course.route.startsWith('computer/')){
    const backCs=el('a','sidebar-back','← 计算机科学总览');
    backCs.href=`${rootPrefix}computer/index.html`;
    box.append(backCs);
   }
   if(!course.chapters.length){
    box.append(el('p','muted','内容筹备中，敬请期待。'));
    return;
   }
   course.chapters.forEach(entry=>{
    const row=el(entry.ready?'a':'div','chapter-link');
    if(entry.ready){
     row.href=`${rootPrefix}${course.route}/${entry.id}.html`;
     if(entry.id===chapter?.id){row.classList.add('active');row.setAttribute('aria-current','page');}
    }else{
     row.setAttribute('aria-disabled','true');
     row.title='筹备中';
    }
    row.append(el('span','chapter-no',entry.id),el('span','',entry.title));
    box.append(row);
   });
   return;
  }
  // Home or Domain view: show domain -> course tree in sidebar
  const totalChapters=site.courses.reduce((sum,c)=>sum+c.chapters.filter(x=>x.ready).length,0);
  $('#sidebar-title').textContent='全部学科';
  $('#open-chapter-count').textContent=`${totalChapters} 章`;
  site.domains.forEach(dom=>{
   const group=el('details','module-group');
   group.open=true;
   const summary=el('summary','',dom.title);
   summary.append(el('small','',`${dom.courses.length} 门`));
   group.append(summary);
   dom.courses.forEach(route=>{
    const c=site.courses.find(x=>x.route===route);
    if(!c)return;
    const row=el('a','chapter-link');
    row.href=`${rootPrefix}${c.route}/index.html`;
    row.append(el('span','chapter-no',c.chapters.length?`${c.chapters.length}章`:'待更'),el('span','',c.title));
    group.append(row);
   });
   box.append(group);
  });
 }

 function renderHome(){
  const root=$('#home-view');
  const hero=el('div','home-hero');
  hero.innerHTML=`<h1>${site.siteTitle} · ${site.siteSubtitle}</h1>
   <p>按学科沉淀知识体系，每章提供思维导图、图文结合精讲、交互图解与即学即练。</p>
   <div class="home-search-row">
     <div class="search-box">
       <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
       <input type="search" id="home-search" placeholder="搜索全站学科或章节标题…" aria-label="搜索全站学科或章节标题">
       <span class="search-kbd" aria-hidden="true">/</span>
     </div>
   </div>`;
  try {
   const last=JSON.parse(localStorage.getItem(LAST_KEY)||'null');
   if(last?.href){
    const banner=el('div','continue-banner');
    banner.innerHTML=`<span>上次学到：<strong>${last.courseTitle} · 第 ${last.chapterId} 章 ${last.chapterTitle}</strong></span>`;
    const go=el('a','button button-primary','继续学习 →');
    go.href=`${rootPrefix}${last.href}`;
    banner.append(go);
    hero.append(banner);
   }
  } catch {}
  root.append(hero);

  const searchResults=el('section','catalog-section');
  searchResults.id='global-search-results';
  searchResults.hidden=true;
  root.append(searchResults);

  const domainsWrap=el('div');
  domainsWrap.id='home-domains';
  site.domains.forEach(dom=>{
   const sec=el('section','domain-section');
   const head=el('div','domain-heading');
   const left=el('div');
   left.append(el('h2','',dom.title), el('p','',dom.subtitle));
   head.append(left);
   if(dom.route){
    const allLink=el('a','text-button','进入专区 →');
    allLink.href=`${rootPrefix}${dom.route}/index.html`;
    head.append(allLink);
   }
   sec.append(head);
   const grid=el('div','course-grid');
   dom.courses.forEach(route=>{
    const c=site.courses.find(x=>x.route===route);
    if(!c)return;
    const stats=readCourseStats(c);
    const card=el('a','course-card');
    card.href=`${rootPrefix}${c.route}/index.html`;
    const top=el('div','course-card-top');
    top.append(el('h3','',c.title));
    top.append(el('span', stats.total?'status-pill is-done':'status-pill', stats.total?`${stats.total} 章`:'筹备中'));
    card.append(top, el('p','',c.subtitle));
    const foot=el('div','course-card-foot');
    if(stats.total){
     const prog=stats.started?`已学 ${stats.started}/${stats.total} 章 · 已答 ${stats.answered} 题`:'尚未开始';
     foot.append(el('span','',prog), el('strong','','进入学习 →'));
    }else{
     foot.append(el('span','',`路由：/${c.route}/`), el('span','','即将开放'));
    }
    card.append(foot);
    grid.append(card);
   });
   sec.append(grid);
   domainsWrap.append(sec);
  });
  root.append(domainsWrap);

  const allChapters=site.courses.flatMap(c=>c.chapters.filter(x=>x.ready).map(ch=>({
   courseTitle:c.title, route:c.route, id:ch.id, title:ch.title,
   searchText:`${c.title} ${ch.id} ${ch.title} ${c.route}`.toLowerCase(),
  })));
  $('#home-search')?.addEventListener('input', event=>{
   const q=event.target.value.trim().toLowerCase();
   if(!q){ searchResults.hidden=true; domainsWrap.hidden=false; return; }
   domainsWrap.hidden=true;
   searchResults.hidden=false;
   searchResults.replaceChildren();
   const matched=allChapters.filter(item=>item.searchText.includes(q));
   const heading=el('div','catalog-heading');
   heading.append(el('h2','','搜索结果'), el('span','',`${matched.length} 条匹配`));
   searchResults.append(heading);
   if(!matched.length){ searchResults.append(el('div','learn-empty','没有找到匹配的章节。')); return; }
   const grid=el('div','catalog-grid');
   matched.forEach(item=>{
    const row=el('a','catalog-card ready');
    row.href=`${rootPrefix}${item.route}/${item.id}.html`;
    row.append(el('span','chapter-no',item.id), el('h3','',`${item.courseTitle} · ${item.title}`), el('span','catalog-status','进入 →'));
    grid.append(row);
   });
   searchResults.append(grid);
  });
 }

 function renderDomain(){
  const root=$('#course-view');
  const dom=C.domain;
  const bc=el('div','breadcrumb');
  bc.innerHTML=`<a href="${rootPrefix}index.html">总览</a><span>/</span><span>${dom.title}</span>`;
  const hero=el('div','home-hero');
  hero.append(bc, el('h1','',dom.title), el('p','',dom.subtitle));
  root.append(hero);
  const grid=el('div','course-grid');
  dom.courses.forEach(route=>{
   const c=site.courses.find(x=>x.route===route);
   if(!c)return;
   const stats=readCourseStats(c);
   const card=el('a','course-card');
   card.href=`${rootPrefix}${c.route}/index.html`;
   const top=el('div','course-card-top');
   top.append(el('h3','',c.title), el('span', stats.total?'status-pill is-done':'status-pill', stats.total?`${stats.total} 章`:'筹备中'));
   card.append(top, el('p','',c.subtitle));
   const foot=el('div','course-card-foot');
   foot.append(el('span','',`/${c.route}/`), el('strong','',stats.total?'进入课程 →':'查看框架 →'));
   card.append(foot);
   grid.append(card);
  });
  root.append(grid);
 }

 function renderCourse(){
  const root=$('#course-view');
  const bc=el('div','breadcrumb');
  if(course.route.startsWith('computer/')){
   bc.innerHTML=`<a href="${rootPrefix}index.html">总览</a><span>/</span><a href="${rootPrefix}computer/index.html">计算机科学</a><span>/</span><span>${course.title}</span>`;
  }else{
   bc.innerHTML=`<a href="${rootPrefix}index.html">总览</a><span>/</span><span>${course.title}</span>`;
  }
  const hero=el('div','home-hero');
  hero.append(bc, el('h1','',course.title), el('p','',course.subtitle));
  if(course.chapters.length){
   const searchRow=el('div','home-search-row');
   searchRow.innerHTML=`<div class="search-box">
     <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
     <input type="search" id="home-search" placeholder="搜索本课程章节…" aria-label="搜索本课程章节">
     <span class="search-kbd" aria-hidden="true">/</span>
   </div>`;
   hero.append(searchRow);
  }
  root.append(hero);

  if(!course.chapters.length){
   const emptyBox=el('div','course-empty-box');
   emptyBox.innerHTML=`<h3>${course.title} · 筹备中</h3>
    <p>该专题目录框架已就绪（路径 <code>/${course.route}/</code>）。后续在 <code>courses/${course.route}/chapters/</code> 中添加章节 JSON 并推送，GitHub Actions 将自动构建发布。</p>`;
   root.append(emptyBox);
   return;
  }

  const sec=el('section','catalog-section');
  const heading=el('div','catalog-heading');
  heading.append(el('h2','','全部章节'), el('span','',`${course.chapters.length} 章`));
  sec.append(heading);
  const grid=el('div','catalog-grid');
  course.chapters.forEach(entry=>{
   const row=el(entry.ready?'a':'div','catalog-card'+(entry.ready?' ready':''));
   row.dataset.searchText=`${entry.id} ${entry.title}`.toLowerCase();
   row.append(el('span','chapter-no',entry.id), el('h3','',entry.title));
   const meta=el('span','catalog-meta');
   if(entry.ready){
    row.href=`${rootPrefix}${course.route}/${entry.id}.html`;
    const prog=readChapterRecord(course.route, entry.id, entry.legacyId);
    if(prog){
     const parts=[];
     if(prog.seen)parts.push(`已读 ${prog.seen}`);
     if(prog.answered)parts.push(`已答 ${prog.answered}`);
     if(parts.length)meta.append(el('span','catalog-progress',parts.join(' · ')));
    }
    meta.append(el('span','catalog-status','开始学习 →'));
   }else{
    meta.append(el('span','catalog-status','待开放'));
   }
   row.append(meta);
   grid.append(row);
  });
  sec.append(grid);
  root.append(sec);

  $('#home-search')?.addEventListener('input', event=>{
   const q=event.target.value.trim().toLowerCase();
   $$('.catalog-card', grid).forEach(card=>{
    card.hidden=Boolean(q && !card.dataset.searchText.includes(q));
   });
  });
 }

 function enhanceCodeBlocks(container){
  $$('pre', container).forEach(pre=>{
   if(pre.parentElement?.classList.contains('code-block-wrap'))return;
   const code=$('code', pre);
   const langMatch=(code?.className||'').match(/language-([\w-]+)/);
   const lang=langMatch?langMatch[1].toUpperCase():'CODE';
   const wrap=el('div','code-block-wrap');
   const head=el('div','code-block-head');
   const copyBtn=button('复制代码','code-copy-btn',()=>{
    const text=(code||pre).textContent||'';
    navigator.clipboard?.writeText(text).then(()=>{
     copyBtn.textContent='已复制 ✓';
     setTimeout(()=>{copyBtn.textContent='复制代码';},1600);
    }).catch(()=>toast('复制失败，请手动选择复制'));
   });
   head.append(el('span','',lang), copyBtn);
   pre.replaceWith(wrap);
   wrap.append(head, pre);
  });
 }

 function jumpConcept(id) {
  if(!sectionIds.has(id))return;
  switchView('learn',false);
  history.replaceState(null,'','#'+id);
  readingTracking=false;
  requestAnimationFrame(()=>{
   const target=document.getElementById(id);
   if(!target)return;
   target.scrollIntoView({behavior:'instant',block:'start'});
   const heading=$('h3',target);
   heading.tabIndex=-1;
   heading.focus({preventScroll:true});
   store.update(record=>{record.reading.lastConcept=id;record.reading.scrollY=window.scrollY;});
   requestAnimationFrame(()=>{readingTracking=true;});
  });
 }

 function mountQuiz(){if(quizCleanup)quizCleanup();quizCleanup=window.StudyQuiz.mount($('#quiz'),{questions:C.questions,store,onConceptJump:jumpConcept});}

 function applyLessonFilter(){
  if(!chapter)return;
  const q=lessonQuery.trim().toLowerCase();
  let visible=0;
  $$('#lessons .lesson-card').forEach(card=>{
   const id=card.id;
   const isSeen=state.reading?.seen?.includes(id);
   const isFav=state.favorites.includes('concept:'+id);
   const matchFilter=lessonFilter==='all'||(lessonFilter==='unread'&&!isSeen)||(lessonFilter==='favorites'&&isFav);
   const matchQuery=!q||card.dataset.searchText.includes(q);
   const show=matchFilter&&matchQuery;
   card.hidden=!show;
   if(show)visible++;
  });
  const emptyBox=$('#learn-empty');
  if(emptyBox)emptyBox.hidden=visible>0;
 }

 function updateProgress(){
  if(!chapter)return;
  const seenSet=new Set(state.reading?.seen||[]);
  $('#reading-label').textContent=`已读 ${seenSet.size} / ${C.lessons.sections.length} 个知识点`;
  $('#continue-reading').hidden=!state.reading?.lastConcept;
  $$('#lesson-jump a').forEach(link=>{if(link.dataset.concept===state.reading.lastConcept)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
  $$('[data-favorite-concept]').forEach(b=>{const yes=state.favorites.includes('concept:'+b.dataset.favoriteConcept);b.classList.toggle('selected',yes);b.textContent=yes?'★':'☆';b.setAttribute('aria-pressed',String(yes));});
  $$('[data-read-badge]').forEach(badge=>{const seen=seenSet.has(badge.dataset.readBadge);badge.textContent=seen?'已读':'未读';badge.classList.toggle('is-done',seen);});
  applyLessonFilter();
 }
 function toggleFavorite(id){store.update(s=>{const i=s.favorites.indexOf(id);if(i===-1)s.favorites.push(id);else s.favorites.splice(i,1);});}

 function renderLessons() {
  const chapterVisuals = chapter.visuals || [];
  let firstVisualAssigned = false;
  C.lessons.sections.forEach((section, index) => {
   const number = String(index + 1).padStart(2, '0');
   const sectionQuestions = C.questions.filter(q => q.conceptId === section.id);
   const sectionVisual = chapterVisuals.find(v => v.sectionId === section.id);
   const hasVisual = Boolean(sectionVisual);

   const jump = el('a');
   jump.href = '#' + section.id;
   jump.dataset.concept = section.id;
   jump.append(el('span', 'topic-number', number), el('span', '', section.title));
   $('#lesson-jump').append(jump);

   const card = el('section', 'lesson-card');
   card.id = section.id;
   card.dataset.searchText = `${number} ${section.title} ${section.summary} ${section.keyTakeaway}`.toLowerCase();
   const head = el('div', 'lesson-head');
   const heading = el('div');
   heading.append(el('h3', '', section.title), el('p', 'lesson-summary', section.summary));
   const badges = el('div', 'lesson-badges');
   const readBadge = el('span', 'status-pill', '未读');
   readBadge.dataset.readBadge = section.id;
   badges.append(readBadge);
   if (sectionQuestions.length) badges.append(el('span', 'status-pill', `配套 ${sectionQuestions.length} 题`));
   if (hasVisual) badges.append(el('span', 'status-pill is-visual', '含交互图解'));
   heading.append(badges);

   const favorite = button('☆', 'icon-button', () => toggleFavorite('concept:' + section.id));
   favorite.dataset.favoriteConcept = section.id;
   favorite.setAttribute('aria-label', '收藏知识点：' + section.title);
   favorite.setAttribute('aria-pressed', 'false');
   head.append(el('span', 'lesson-number', number), heading, favorite);

   const body = el('div', 'lesson-body');
   body.innerHTML = section.bodyHtml;
   $$('table', body).forEach(table => {
    const wrap = el('div', 'table-wrap');
    table.replaceWith(wrap);
    wrap.append(table);
   });
   enhanceCodeBlocks(body);

   if (sectionVisual) {
    const visualBox = el('div', 'inline-visual');
    if (!firstVisualAssigned) { visualBox.id = 'inline-visual'; firstVisualAssigned = true; }
    const tpl = $(`template[data-visual-template="${sectionVisual.type}"]`);
    if (tpl && tpl.content.childNodes.length) visualBox.append(tpl.content.cloneNode(true));
    else visualBox.dataset.microVisual = sectionVisual.type;
    body.append(visualBox);
   }

   const takeaway = el('div', 'concept-takeaway');
   takeaway.append(el('strong', '', '考点'), document.createTextNode(section.keyTakeaway));
   body.append(takeaway);

   const extras = el('div', 'lesson-extras');
   for (const [label, value, className] of [
    ['例子', section.example, 'lesson-extra'],
    ['易错提醒', section.pitfall, 'lesson-extra pitfall']
   ]) {
    const item = el('div', className);
    item.append(el('strong', '', label), el('p', '', value));
    extras.append(item);
   }
   body.append(extras);
   card.append(head, body);

   if (sectionQuestions.length) {
    const practiceBox = el('section', 'inline-practice');
    practiceBox.dataset.conceptPractice = section.id;
    practiceBox.setAttribute('aria-label', section.title + ' · 即学即练');
    card.append(practiceBox);
    inlineQuizzes.push(window.StudyQuiz.mountInline(practiceBox, {
     sectionId: section.id,
     questions: sectionQuestions,
     store,
    }));
   }
   $('#lessons').append(card);
  });
 }

 const observer = new IntersectionObserver(entries => {
  if (!chapter || view !== 'learn') return;
  const visible=entries.filter(entry=>entry.isIntersecting).map(entry=>entry.target.id);
  if(!visible.some(id=>!state.reading.seen.includes(id)))return;
  store.update(record=>{
   record.reading.seen=[...new Set([...record.reading.seen,...visible])];
   if(!record.reading.lastConcept)record.reading.lastConcept=visible[0];
  });
 }, { threshold: 0.12, rootMargin: '-125px 0px -15% 0px' });

 function saveReadingPosition() {
  if(!chapter||!readingChanged||view!=='learn')return;
  readingChanged=false;
  const cards=$$('.lesson-card');
  const current=cards.findLast(card=>card.getBoundingClientRect().top<=155)||cards[0];
  if(!current)return;
  store.update(record=>{record.reading.lastConcept=current.id;record.reading.scrollY=window.scrollY;});
  if(sectionIds.has(location.hash.slice(1)))history.replaceState(null,'','#learn');
 }

 function restoreReadingPosition(saved) {
  requestAnimationFrame(()=>{
   if(saved.lastConcept) {
    if(saved.scrollY>0)window.scrollTo({top:saved.scrollY,behavior:'instant'});
    else document.getElementById(saved.lastConcept)?.scrollIntoView({block:'start',behavior:'instant'});
   }
   requestAnimationFrame(()=>{readingTracking=true;});
  });
 }

 function renderMap() {
  const tree = $('#mindmap'), viewport = $('.map-viewport'), expand = $('#map-expand');
  const zoomIn = $('#map-zoom-in'), zoomOut = $('#map-zoom-out'), size = $('#map-size');
  const collapsePanel = $('#map-collapse-panel'), panelBody = $('#map-panel-body');
  const branches = [];
  const startExpanded = !matchMedia('(max-width: 767px)').matches;
  const readingSize = 14, minScale = 0.25, maxScale = 1.75;
  let scale = 1, hasOpened = false;

  function setExpanded(branch, expanded) {
   branch.children.hidden = !expanded;
   branch.toggle.setAttribute('aria-expanded', String(expanded));
   branch.toggle.setAttribute('aria-label', `${expanded ? '收起' : '展开'}“${branch.label}”的分支`);
   branch.toggle.textContent = expanded ? '−' : '+';
  }
  function updateExpandLabel() { expand.textContent = branches.every(b => !b.children.hidden) ? '收起分支' : '全部展开'; }
  function buildNode(node, depth, parentTarget) {
   const item = el('li', 'map-item');
   const target = node.target || parentTarget;
   const isRoot = depth === 0;
   item.dataset.depth = String(depth);
   const label = el(isRoot ? 'span' : 'a', 'map-label', node.label);
   const face = el('div', isRoot ? 'map-node map-root' : 'map-node');
   if (!isRoot) { label.href = '#' + target; label.dataset.concept = target; }
   face.append(label); item.append(face);
   if (!node.children?.length) return item;
   const children = el('ul', 'map-children');
   if (!isRoot) {
    item.classList.add('map-parent');
    children.id = `map-branch-${branches.length + 1}`;
    const toggle = button('', 'map-toggle');
    toggle.setAttribute('aria-controls', children.id);
    const branch = { toggle, children, label: node.label };
    branches.push(branch);
    setExpanded(branch, startExpanded);
    toggle.addEventListener('click', () => { setExpanded(branch, children.hidden); updateExpandLabel(); });
    face.append(toggle);
   }
   for (const child of node.children) children.append(buildNode(child, depth + 1, target));
   item.append(children);
   return item;
  }
  function setScale(next) {
   scale = Math.min(maxScale, Math.max(minScale, next));
   tree.style.fontSize = `${readingSize * scale}px`;
   size.textContent = `${Math.round(scale * 100)}%`;
   zoomIn.disabled = scale >= maxScale;
   zoomOut.disabled = scale <= minScale;
  }
  function fitWidth() {
   const availableWidth = viewport.clientWidth;
   if (!availableWidth) return;
   setScale(1);
   const readingWidth = tree.getBoundingClientRect().width;
   if (readingWidth > availableWidth) setScale((availableWidth - 8) / readingWidth);
   viewport.scrollLeft = 0;
  }
  tree.append(buildNode({ label: C.lessons.title, children: C.lessons.mindmap }, 0));
  updateExpandLabel();
  expand.addEventListener('click', () => { const next = branches.some(b => b.children.hidden); branches.forEach(b => setExpanded(b, next)); updateExpandLabel(); });
  zoomIn.addEventListener('click', () => setScale(scale * 1.2));
  zoomOut.addEventListener('click', () => setScale(scale / 1.2));
  size.addEventListener('click', () => setScale(1));
  $('#map-fit').addEventListener('click', fitWidth);
  if (collapsePanel && panelBody) {
   collapsePanel.addEventListener('click', () => {
    const nextHidden = !panelBody.hidden;
    panelBody.hidden = nextHidden;
    collapsePanel.setAttribute('aria-expanded', String(!nextHidden));
    collapsePanel.textContent = nextHidden ? '展开导图' : '收起导图';
    if (!nextHidden) requestAnimationFrame(fitWidth);
   });
  }
  return () => { if (hasOpened) return; hasOpened = true; fitWidth(); };
 }

 const chapterViews = ['learn', 'practice'];
 function switchView(next, scroll=true) {
  if(!chapter)return;
  const requested = next;
  if (!chapterViews.includes(next)) next='learn';
  saveReadingPosition();
  pausePPF();
  view=next;
  $$('.content-view').forEach(v=>v.hidden=v.id!=='view-'+next);
  $$('[data-view]').forEach(b=>{
   const matchKey = requested === 'map' ? 'map' : next;
   const active = b.closest('#mobile-bottom-nav') ? b.dataset.view === matchKey : b.dataset.view === next;
   b.classList.toggle('active',active);
   if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
  });
  if(next==='learn') { fitMapOnFirstOpen(); syncInlineQuizzes(); }
  if(next==='practice') mountQuiz();
  if(requested==='map') {
   readingTracking=false;
   requestAnimationFrame(()=>{ $('#chapter-mindmap')?.scrollIntoView({behavior:'instant',block:'start'}); requestAnimationFrame(()=>{readingTracking=true;}); });
  } else if(requested==='visual' && $('#inline-visual')) {
   readingTracking=false;
   requestAnimationFrame(()=>{ $('#inline-visual').scrollIntoView({behavior:'instant',block:'start'}); requestAnimationFrame(()=>{readingTracking=true;}); });
  } else if(scroll) {
   readingTracking=false;
   $('.view-tabs').scrollIntoView({behavior:'instant',block:'start'});
   requestAnimationFrame(()=>requestAnimationFrame(()=>{readingTracking=true;}));
  }
  history.replaceState(null,'','#'+(requested==='map'||requested==='visual'?requested:next));
 }

 function saveBlob(blob,name){const url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}

 function exportAllRecords(){
  const records={};
  try{
   for(let i=0;i<localStorage.length;i++){
    const k=localStorage.key(i);
    if(k && k.startsWith(STORAGE_PREFIX) && k!==LAST_KEY){
     records[k]=JSON.parse(localStorage.getItem(k));
    }
   }
  }catch{}
  const backup={app:'zhiqi-study-all',version:2,exportedAt:new Date().toISOString(),records};
  const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});
  saveBlob(blob,`知其所以-全站学习记录-${backup.exportedAt.slice(0,10)}.json`);
  toast(`已导出全站 ${Object.keys(records).length} 章学习记录`);
 }

 function recordsModal() {
  const wrap=el('div');
  if(chapter){
   wrap.append(el('p','','本章学习记录保存在当前浏览器，也可导出/导入「全站学习记录」跨设备迁移。'));
   const stats=el('div','record-stats'), answered=Object.values(state.answers), correct=answered.filter(x=>x.correct).length;
   const scoredCount=C.questions.filter(q=>q.type!=='discussion').length;
   for(const [value,label] of [[state.reading.seen.length+'/'+C.lessons.sections.length,'本章已读'],[answered.length+'/'+scoredCount,'本章已答'],[correct,'最近答对']]) {
    const item=el('div');
    item.append(el('strong','',value),el('small','',label));
    stats.append(item);
   }
   wrap.append(stats);
  }else{
   wrap.append(el('p','','支持一键导出或恢复你在所有学科下的阅读、收藏与错题记录。'));
  }
  const actions=el('div','record-actions');
  actions.append(button('导出全站记录','button button-primary',exportAllRecords));
  const file=el('input');
  file.type='file';file.accept='.json,application/json';file.hidden=true;
  const status=el('p','muted');
  status.setAttribute('role','status');
  file.addEventListener('change',async()=>{
   try{
    const f=file.files[0];
    if(!f)return;
    if(f.size>5*1024*1024)throw Error('备份文件过大');
    const parsed=JSON.parse(await f.text());
    if(parsed?.app==='zhiqi-study-all' && parsed.records && typeof parsed.records==='object'){
     const entries=Object.entries(parsed.records).filter(([k])=>k.startsWith(STORAGE_PREFIX));
     for(const [k,v] of entries) localStorage.setItem(k, JSON.stringify(v));
     toast(`已恢复全站 ${entries.length} 章学习记录，刷新生效`);
     location.reload();
     return;
    }
    if(chapter){
     const next=validateState(parsed?.app==='zhiqi-study'?parsed.state:parsed);
     store.update(record=>Object.assign(record,next));
     mountQuiz();syncInlineQuizzes();recordsModal();toast('本章学习记录已恢复');
     return;
    }
    throw Error('请选择全站备份文件，或在对应章节中导入单章备份');
   }catch(e){status.textContent='无法导入：'+e.message;}
   finally{file.value='';}
  });
  actions.append(button('导入备份文件','button button-secondary',()=>file.click()),file);
  wrap.append(actions,status,el('p','muted','已启用 PWA 自动离线缓存，访问过的章节断网也可直接打开。'));
  openModal('学习记录与跨设备备份',wrap);
 }

 function favoritesModal(){
  const wrap=el('div');
  if(!chapter){
   wrap.append(el('p','muted','请在具体章节中查看或管理本章收藏的知识点与题目。'));
   openModal('我的收藏',wrap);
   return;
  }
  if(!state.favorites.length)wrap.append(el('p','muted','本章还没有收藏。阅读时点击知识点右侧的 ☆，或在答题时收藏题目。'));
  state.favorites.forEach(id=>{
   const isConcept=id.startsWith('concept:'), item=isConcept?C.lessons.sections.find(s=>s.id===id.slice(8)):C.questions.find(q=>q.id===id);
   if(!item)return;
   const row=el('div','favorite-item');
   const b=button(isConcept?item.title:`第 ${item.number} 题 · ${item.stem}`,'',()=>{
    $('#modal').close();
    if(isConcept)jumpConcept(item.id);
    else{switchView('practice');window.StudyQuiz.openQuestion?.(item.id);}
   });
   b.append(el('small','',isConcept?'知识点':'练习题'));
   row.append(b,button('移除','text-button',()=>{toggleFavorite(id);syncInlineQuizzes();favoritesModal();}));
   wrap.append(row);
  });
  openModal('本章收藏',wrap);
 }

 document.addEventListener('click',e=>{
  const target=e.target.closest('button,a');
  if(!target)return;
  if(target.dataset.concept){e.preventDefault();jumpConcept(target.dataset.concept);return;}
  if(target.dataset.view){switchView(target.dataset.view);return;}
  if(target.dataset.switch){switchView(target.dataset.switch);return;}
  switch(target.dataset.action){
   case'favorites':favoritesModal();break;
   case'records':recordsModal();break;
   case'sidebar':{const open=$('#sidebar').classList.toggle('open');target.setAttribute('aria-expanded',String(open));break;}
  }
 });

 function pausePPF(){if(ppfTimer){clearInterval(ppfTimer);ppfTimer=null;}if($('#ppf-play')){$('#ppf-play').textContent='播放取舍变化';$('#ppf-play').setAttribute('aria-pressed','false');}}
 function initPPF(){
  const range=$('#grain-range'),radios=$$('input[name=scenario]');
  if(!range||!radios.length)return;
  function point(p,f=1){const x=p*470*f,y=Math.sqrt(Math.max(0,1-p*p))*340*f;return[76+x,388-y];}
  function path(f){let d='';for(let i=0;i<=100;i++){const[x,y]=point(i/100,f);d+=(i?' L':'M')+x.toFixed(2)+' '+y.toFixed(2);}return d;}
  $('#ppf-curve').setAttribute('d',path(1));$('#ppf-new-curve').setAttribute('d',path(1.12));
  function draw(){const v=Number(range.value)/100,scenario=radios.find(r=>r.checked).value,f=scenario==='idle'?.7:scenario==='growth'?1.12:1;const[x,y]=point(v,f);$('#ppf-point').setAttribute('cx',x);$('#ppf-point').setAttribute('cy',y);$('#ppf-halo').setAttribute('cx',x);$('#ppf-halo').setAttribute('cy',y);$('#ppf-guides').setAttribute('d',`M76 ${y}H${x}V388`);$('#ppf-point-label').setAttribute('x',x+13);$('#ppf-point-label').setAttribute('y',y-14);$('#grain-output').textContent=Math.round(v*100*f);$('#machine-output').textContent=Math.round(Math.sqrt(1-v*v)*100*f);$('#grain-percent').value=range.value+'%';$('#ppf-new-curve').setAttribute('opacity',scenario==='growth'?'1':'0');const explanation=scenario==='idle'?'点在原有曲线内：存在资源闲置或利用低效。提高利用效率，可让两类产品产量同时增加。':scenario==='growth'?'技术进步使生产边界向外移动：相同资源下可以生产更多。图中按两类产品同比例提高作简化演示。':'点在曲线上：资源充分有效利用。向右移动时粮食增加、机器减少，这就是取舍。';if($('#ppf-explanation').textContent!==explanation)$('#ppf-explanation').textContent=explanation;}
  range.addEventListener('input',draw);radios.forEach(r=>r.addEventListener('change',draw));let direction=1;$('#ppf-play').addEventListener('click',()=>{if(ppfTimer){pausePPF();return;}if(matchMedia('(prefers-reduced-motion: reduce)').matches){toast('已启用减少动态效果，请拖动滑块逐步观察');return;}$('#ppf-play').textContent='暂停变化';$('#ppf-play').setAttribute('aria-pressed','true');ppfTimer=setInterval(()=>{let n=Number(range.value)+direction;if(n>=95||n<=5)direction*=-1;range.value=n;draw();},90);});$('#ppf-reset').addEventListener('click',()=>{pausePPF();range.value=60;radios[0].checked=true;draw();});document.addEventListener('visibilitychange',()=>{if(document.hidden)pausePPF();});matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{if(e.matches)pausePPF();});draw();
 }

 renderSubjectNav();
 renderSidebar();
 let fitMapOnFirstOpen=()=>{};

 if(pageType==='chapter' && chapter){
  $('#chapter-view').hidden=false;
  $('#mobile-bottom-nav').hidden=false;
  document.title=`${chapter.title} · ${course.title} · ${site.siteTitle}`;
  const bc=$('#chapter-breadcrumb');
  bc.innerHTML = course.route.startsWith('computer/')
   ? `<a href="${rootPrefix}index.html">总览</a><span>/</span><a href="${rootPrefix}computer/index.html">计算机科学</a><span>/</span><a href="${rootPrefix}${course.route}/index.html">${course.title}</a><span>/</span><span>第 ${chapter.number} 章</span>`
   : `<a href="${rootPrefix}index.html">总览</a><span>/</span><a href="${rootPrefix}${course.route}/index.html">${course.title}</a><span>/</span><span>第 ${chapter.number} 章</span>`;
  $('#chapter-title').textContent=chapter.title;
  $('#chapter-description').textContent=C.lessons.subtitle;
  $('.chapter-exercise-count').textContent=`${C.questions.length} 道练习`;
  $('#continue-reading').addEventListener('click',()=>jumpConcept(state.reading.lastConcept));
  window.addEventListener('scroll',()=>{if(!readingTracking||view!=='learn')return;readingChanged=true;clearTimeout(readingTimer);readingTimer=setTimeout(saveReadingPosition,160);},{passive:true});
  window.addEventListener('pagehide',saveReadingPosition);
  renderLessons();
  $('#lesson-search')?.addEventListener('input',event=>{lessonQuery=event.target.value;applyLessonFilter();});
  $$('[data-lesson-filter]').forEach(btn=>btn.addEventListener('click',()=>{
   lessonFilter=btn.dataset.lessonFilter;
   $$('[data-lesson-filter]').forEach(node=>{const active=node===btn;node.classList.toggle('active',active);node.setAttribute('aria-pressed',String(active));});
   applyLessonFilter();
  }));
  $$('.lesson-card').forEach(card=>observer.observe(card));
  fitMapOnFirstOpen=renderMap();
  if((chapter.visuals||[]).some(v=>v.type==='ppf'))initPPF();
  mountQuiz();
  updateProgress();
  let hash=location.hash.slice(1);
  try{hash=decodeURIComponent(hash);}catch{hash='';}
  if(sectionIds.has(hash))jumpConcept(hash);
  else{
   switchView(hash,false);
   if(view==='learn'&&hash!=='map'&&hash!=='visual')restoreReadingPosition({...state.reading});
   else readingTracking=true;
  }
 } else if(pageType==='course' && course){
  $('#course-view').hidden=false;
  document.title=`${course.title} · ${site.siteTitle}`;
  renderCourse();
 } else if(pageType==='domain' && C.domain){
  $('#course-view').hidden=false;
  document.title=`${C.domain.title} · ${site.siteTitle}`;
  renderDomain();
 } else {
  $('#home-view').hidden=false;
  document.title=`${site.siteTitle} · ${site.siteSubtitle}`;
  renderHome();
 }

 document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
   $('#sidebar').classList.remove('open');
   $('.mobile-menu').setAttribute('aria-expanded','false');
   if(document.activeElement?.matches('#home-search, #lesson-search')){
    document.activeElement.value='';
    document.activeElement.dispatchEvent(new Event('input'));
    document.activeElement.blur();
   }
  } else if(e.key==='/' && !e.metaKey && !e.ctrlKey && !e.altKey && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName||'')){
   const target = pageType==='chapter' ? (view==='learn' ? $('#lesson-search') : null) : $('#home-search');
   if(target){ e.preventDefault(); target.focus(); target.select(); }
  }
 });
})();
