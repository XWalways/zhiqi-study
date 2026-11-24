(() => {
  'use strict';

  const fmt = (n, d = 1) => Number(n.toFixed(d)).toString();
  const samplePath = (fn, start, end, steps, xMap, yMap) => {
    let d = '';
    for (let i = 0; i <= steps; i++) {
      const t = start + (end - start) * (i / steps);
      const val = fn(t);
      if (!Number.isFinite(val)) continue;
      d += (d ? ' L' : 'M') + xMap(t).toFixed(1) + ' ' + yMap(val).toFixed(1);
    }
    return d;
  };

  // Unified zero-overlap single-plot geometry:
  // viewBox="0 0 540 360", plot box x:[66,486] (420), y:[42,294] (252)
  const X0 = 66, W = 420, Y0 = 294, H = 252;

  function mountISLM(root) {
    root.innerHTML = `
      <div class="inline-visual-header">
        <span class="inline-visual-badge">交互图解</span>
        <h4>IS-LM 共同均衡：财政政策、货币政策与挤出效应</h4>
        <p>调节财政与货币政策力度，观察 IS 与 LM 曲线移动后均衡产出 Y* 与均衡利率 r* 的共同变化。</p>
      </div>
      <div class="ppf-panel micro-panel">
        <div class="ppf-chart">
          <div class="chart-caption">
            <span><i class="chart-line mv-c1-line"></i>IS（产品市场）</span>
            <span><i class="chart-line mv-c2-line"></i>LM（货币市场）</span>
            <span><i class="chart-line mv-base-line"></i>变动前 IS₀ / LM₀</span>
          </div>
          <svg viewBox="0 0 540 360" role="img" aria-label="IS-LM 共同均衡交互图">
            <rect x="66" y="42" width="420" height="252" class="mv-grid-box"/>
            <path class="chart-axis" d="M66 30V294H498 M61 37l5-7 5 7 M491 289l7 5-7 5" fill="none" stroke-width="1.5"/>
            <text x="14" y="18" class="axis-label">利率 r (%)</text>
            <text x="276" y="346" text-anchor="middle" class="axis-label">国民产出 Y</text>
            <g class="tick-label" text-anchor="middle"><text x="66" y="316">40</text><text x="206" y="316">80</text><text x="346" y="316">120</text><text x="486" y="316">160</text></g>
            <g class="tick-label" text-anchor="end"><text x="56" y="248">2</text><text x="56" y="197">4</text><text x="56" y="147">6</text><text x="56" y="96">8</text><text x="56" y="46">10</text></g>
            <path class="mv-base-curve" data-role="is0"/>
            <path class="mv-base-curve" data-role="lm0"/>
            <path class="mv-curve-1" data-role="is"/>
            <path class="mv-curve-2" data-role="lm"/>
            <path class="mv-guide" data-role="guide"/>
            <circle r="4.5" class="mv-dot-3" data-role="e0"/>
            <circle r="6.5" class="mv-dot-eq" data-role="e1"/>
            <text class="point-label" data-role="lbl">E₁</text>
          </svg>
        </div>
        <div class="ppf-controls">
          <label class="range-label">财政政策 ΔIS（增支/减税为正）<output data-role="g-out">0</output></label>
          <input type="range" data-role="g" min="-24" max="24" step="4" value="0">
          <label class="range-label">货币政策 ΔLM（增发货币为正）<output data-role="m-out">0</output></label>
          <input type="range" data-role="m" min="-24" max="24" step="4" value="0">
          <div class="ppf-outputs">
            <div><span>均衡产出 Y*</span><strong data-role="y-val">100</strong></div>
            <div><span>均衡利率 r*</span><strong data-role="r-val">5.0%</strong></div>
          </div>
          <div class="ppf-explanation" data-role="msg" aria-live="polite"></div>
          <div class="button-row">
            <button type="button" class="button button-secondary" data-preset="fiscal">扩张财政</button>
            <button type="button" class="button button-secondary" data-preset="monetary">扩张货币</button>
            <button type="button" class="button button-secondary" data-preset="mix">双松配合</button>
            <button type="button" class="button button-secondary" data-preset="reset">重置</button>
          </div>
        </div>
      </div>`;
    const x = yv => X0 + ((yv - 40) / 120) * W;
    const y = rv => Y0 - (rv / 10) * H;
    const isLine = dg => {
      const y1 = Math.max(40, 50 + dg), y2 = Math.min(160, 150 + dg);
      return `M${x(y1).toFixed(1)} ${y(15 - 0.1 * (y1 - dg)).toFixed(1)} L${x(y2).toFixed(1)} ${y(15 - 0.1 * (y2 - dg)).toFixed(1)}`;
    };
    const lmLine = dm => {
      const y1 = Math.max(40, 50 + dm), y2 = Math.min(160, 150 + dm);
      return `M${x(y1).toFixed(1)} ${y(-5 + 0.1 * (y1 - dm)).toFixed(1)} L${x(y2).toFixed(1)} ${y(-5 + 0.1 * (y2 - dm)).toFixed(1)}`;
    };
    root.querySelector('[data-role="is0"]').setAttribute('d', isLine(0));
    root.querySelector('[data-role="lm0"]').setAttribute('d', lmLine(0));
    root.querySelector('[data-role="e0"]').setAttribute('cx', x(100));
    root.querySelector('[data-role="e0"]').setAttribute('cy', y(5));
    const gIn = root.querySelector('[data-role="g"]');
    const mIn = root.querySelector('[data-role="m"]');

    function draw() {
      const dg = gIn.valueAsNumber, dm = mIn.valueAsNumber;
      const ys = 100 + (dg + dm) / 2;
      const rs = 5 + (dg - dm) / 20;
      root.querySelector('[data-role="is"]').setAttribute('d', isLine(dg));
      root.querySelector('[data-role="lm"]').setAttribute('d', lmLine(dm));
      root.querySelector('[data-role="guide"]').setAttribute('d', `M${X0} ${y(rs).toFixed(1)} H${x(ys).toFixed(1)} V${Y0}`);
      root.querySelector('[data-role="e1"]').setAttribute('cx', x(ys).toFixed(1));
      root.querySelector('[data-role="e1"]').setAttribute('cy', y(rs).toFixed(1));
      root.querySelector('[data-role="lbl"]').setAttribute('x', (x(ys) + 10).toFixed(1));
      root.querySelector('[data-role="lbl"]').setAttribute('y', (y(rs) - 10).toFixed(1));
      root.querySelector('[data-role="g-out"]').value = (dg > 0 ? '+' : '') + dg;
      root.querySelector('[data-role="m-out"]').value = (dm > 0 ? '+' : '') + dm;
      root.querySelector('[data-role="y-val"]').textContent = fmt(ys, 0);
      root.querySelector('[data-role="r-val"]').textContent = fmt(rs, 1) + '%';
      let msg = '初始共同均衡 E₀（Y*=100, r*=5.0%）：产品市场与货币市场同时出清。';
      if (dg > 0 && dm === 0) msg = `扩张财政使 IS 右移 ${dg}：利率被推高至 ${fmt(rs, 1)}%，部分挤出私人投资，最终产出仅增加 +${fmt(ys - 100, 0)}（小于无挤出时的 +${dg}）。`;
      else if (dg === 0 && dm > 0) msg = `扩张货币使 LM 右移 ${dm}：利率降至 ${fmt(rs, 1)}%，刺激投资使产出扩大至 ${fmt(ys, 0)}。`;
      else if (dg > 0 && dm > 0) msg = `「双松」政策配合：财政与货币同步扩张，利率维持在 ${fmt(rs, 1)}%，有效抵消挤出效应，产出大幅增至 ${fmt(ys, 0)}。`;
      else if (dg !== 0 || dm !== 0) msg = `政策组合后新均衡：产出 Y*=${fmt(ys, 0)}（较初始 ${ys >= 100 ? '+' : ''}${fmt(ys - 100, 0)}），利率 r*=${fmt(rs, 1)}%。`;
      root.querySelector('[data-role="msg"]').textContent = msg;
    }
    gIn.addEventListener('input', draw);
    mIn.addEventListener('input', draw);
    root.querySelectorAll('[data-preset]').forEach(b => b.addEventListener('click', () => {
      const p = b.dataset.preset;
      gIn.value = p === 'fiscal' || p === 'mix' ? '20' : '0';
      mIn.value = p === 'monetary' || p === 'mix' ? '20' : '0';
      draw();
    }));
    draw();
  }

  function mountADAS(root) {
    root.innerHTML = `
      <div class="inline-visual-header">
        <span class="inline-visual-badge">交互图解</span>
        <h4>AD-AS 模型：需求拉动通胀 vs 成本推动滞胀</h4>
        <p>调节总需求与短期总供给冲击，对比「经济过热通胀」与「产出下滑 + 物价上涨（滞胀）」的差异。</p>
      </div>
      <div class="ppf-panel micro-panel">
        <div class="ppf-chart">
          <div class="chart-caption">
            <span><i class="chart-line mv-c1-line"></i>总需求 AD</span>
            <span><i class="chart-line mv-c2-line"></i>短期总供给 SRAS</span>
            <span><i class="chart-line mv-c3-line"></i>长期总供给 LRAS（Yf=100）</span>
          </div>
          <svg viewBox="0 0 540 360" role="img" aria-label="AD-AS 总需求总供给模型图">
            <rect x="66" y="42" width="420" height="252" class="mv-grid-box"/>
            <path class="chart-axis" d="M66 30V294H498 M61 37l5-7 5 7 M491 289l7 5-7 5" fill="none" stroke-width="1.5"/>
            <text x="14" y="18" class="axis-label">物价水平 P</text>
            <text x="276" y="346" text-anchor="middle" class="axis-label">实际产出 Y</text>
            <g class="tick-label" text-anchor="middle"><text x="66" y="316">60</text><text x="171" y="316">80</text><text x="276" y="316">100</text><text x="381" y="316">120</text><text x="486" y="316">140</text></g>
            <g class="tick-label" text-anchor="end"><text x="56" y="256">80</text><text x="56" y="172">100</text><text x="56" y="88">120</text></g>
            <line class="mv-curve-3" x1="276" x2="276" y1="42" y2="294"/>
            <path class="mv-base-curve" data-role="ad0"/>
            <path class="mv-base-curve" data-role="as0"/>
            <path class="mv-curve-1" data-role="ad"/>
            <path class="mv-curve-2" data-role="as"/>
            <path class="mv-guide" data-role="guide"/>
            <circle r="6.5" class="mv-dot-eq" data-role="eq"/>
            <text class="point-label" data-role="lbl">E</text>
          </svg>
        </div>
        <div class="ppf-controls">
          <label class="range-label">总需求冲击 ΔAD <output data-role="ad-out">0</output></label>
          <input type="range" data-role="ad-in" min="-20" max="20" step="4" value="0">
          <label class="range-label">供给冲击 ΔSRAS（负值为成本上涨）<output data-role="as-out">0</output></label>
          <input type="range" data-role="as-in" min="-20" max="20" step="4" value="0">
          <div class="ppf-outputs">
            <div><span>实际产出 Y</span><strong data-role="y-val">100</strong></div>
            <div><span>物价水平 P</span><strong data-role="p-val">100</strong></div>
          </div>
          <div class="ppf-explanation" data-role="msg" aria-live="polite"></div>
          <div class="button-row">
            <button type="button" class="button button-secondary" data-preset="demand">需求拉动通胀</button>
            <button type="button" class="button button-secondary" data-preset="stagflation">成本推动滞胀</button>
            <button type="button" class="button button-secondary" data-preset="reset">恢复均衡</button>
          </div>
        </div>
      </div>`;
    const x = yv => X0 + ((yv - 60) / 80) * W;
    const y = pv => Y0 - ((pv - 70) / 60) * H;
    const adLine = dad => {
      const y1 = Math.max(62, 74 + dad), y2 = Math.min(138, 128 + dad);
      return `M${x(y1).toFixed(1)} ${y(200 + dad - y1).toFixed(1)} L${x(y2).toFixed(1)} ${y(200 + dad - y2).toFixed(1)}`;
    };
    const asLine = das => {
      const y1 = Math.max(62, 74 + das), y2 = Math.min(138, 128 + das);
      return `M${x(y1).toFixed(1)} ${y(y1 - das).toFixed(1)} L${x(y2).toFixed(1)} ${y(y2 - das).toFixed(1)}`;
    };
    root.querySelector('[data-role="ad0"]').setAttribute('d', adLine(0));
    root.querySelector('[data-role="as0"]').setAttribute('d', asLine(0));
    const adIn = root.querySelector('[data-role="ad-in"]');
    const asIn = root.querySelector('[data-role="as-in"]');

    function draw() {
      const dad = adIn.valueAsNumber, das = asIn.valueAsNumber;
      const ys = 100 + (dad + das) / 2;
      const ps = 100 + (dad - das) / 2;
      root.querySelector('[data-role="ad"]').setAttribute('d', adLine(dad));
      root.querySelector('[data-role="as"]').setAttribute('d', asLine(das));
      root.querySelector('[data-role="guide"]').setAttribute('d', `M${X0} ${y(ps).toFixed(1)} H${x(ys).toFixed(1)} V${Y0}`);
      root.querySelector('[data-role="eq"]').setAttribute('cx', x(ys).toFixed(1));
      root.querySelector('[data-role="eq"]').setAttribute('cy', y(ps).toFixed(1));
      root.querySelector('[data-role="lbl"]').setAttribute('x', (x(ys) + 10).toFixed(1));
      root.querySelector('[data-role="lbl"]').setAttribute('y', (y(ps) - 10).toFixed(1));
      root.querySelector('[data-role="ad-out"]').value = (dad > 0 ? '+' : '') + dad;
      root.querySelector('[data-role="as-out"]').value = (das > 0 ? '+' : '') + das;
      root.querySelector('[data-role="y-val"]').textContent = fmt(ys, 0);
      root.querySelector('[data-role="p-val"]').textContent = fmt(ps, 0);
      let msg = '处于充分就业长期均衡（Y=Yf=100, P=100）。';
      if (ys > 100 && ps > 100) msg = `需求拉动型通胀（过热）：产出高于潜在水平（Y=${fmt(ys, 0)}），物价升至 ${fmt(ps, 0)}。长期工资上涨将推高 SRAS 回到 Yf。`;
      else if (ys < 100 && ps > 100) msg = `典型「滞胀」（成本推动冲击）：产出萎缩至 ${fmt(ys, 0)}（失业上升），同时物价涨至 ${fmt(ps, 0)}，单纯需求政策面临两难。`;
      else if (ys < 100 && ps <= 100) msg = `需求不足型衰退：产出低于潜在水平（Y=${fmt(ys, 0)}），物价回落至 ${fmt(ps, 0)}，扩张性政策可助经济回归 Yf。`;
      else if (ys > 100 && ps <= 100) msg = `正向供给冲击（如技术进步/成本下降）：产出扩大至 ${fmt(ys, 0)} 且物价降至 ${fmt(ps, 0)}。`;
      root.querySelector('[data-role="msg"]').textContent = msg;
    }
    adIn.addEventListener('input', draw);
    asIn.addEventListener('input', draw);
    root.querySelectorAll('[data-preset]').forEach(b => b.addEventListener('click', () => {
      const p = b.dataset.preset;
      adIn.value = p === 'demand' ? '16' : '0';
      asIn.value = p === 'stagflation' ? '-16' : '0';
      draw();
    }));
    draw();
  }

  function mountPhillips(root) {
    root.innerHTML = `
      <div class="inline-visual-header">
        <span class="inline-visual-badge">交互图解</span>
        <h4>短期 vs 长期菲利普斯曲线（通胀预期移动）</h4>
        <p>拖动通胀预期观察短期曲线 SRPC 整体上移；对比短期失业—通胀权衡与长期垂直于自然失业率（u*=5%）。</p>
      </div>
      <div class="ppf-panel micro-panel">
        <div class="ppf-chart">
          <div class="chart-caption">
            <span><i class="chart-line mv-c1-line"></i>短期 SRPC</span>
            <span><i class="chart-line mv-c3-line"></i>长期 LRPC（u*=5%）</span>
            <span><i class="chart-line mv-base-line"></i>基准 SRPC（πᵉ=2%）</span>
          </div>
          <svg viewBox="0 0 540 360" role="img" aria-label="短期与长期菲利普斯曲线图">
            <rect x="66" y="42" width="420" height="252" class="mv-grid-box"/>
            <path class="chart-axis" d="M66 30V294H498 M61 37l5-7 5 7 M491 289l7 5-7 5" fill="none" stroke-width="1.5"/>
            <text x="14" y="18" class="axis-label">通胀率 π (%)</text>
            <text x="276" y="346" text-anchor="middle" class="axis-label">失业率 u (%)</text>
            <g class="tick-label" text-anchor="middle"><text x="66" y="316">2%</text><text x="171" y="316">4%</text><text x="223.5" y="316">5%</text><text x="276" y="316">6%</text><text x="381" y="316">8%</text></g>
            <g class="tick-label" text-anchor="end"><text x="56" y="274">0</text><text x="56" y="217">3</text><text x="56" y="160">6</text><text x="56" y="103">9</text><text x="56" y="46">12</text></g>
            <line class="mv-curve-3" x1="223.5" x2="223.5" y1="42" y2="294"/>
            <path class="mv-base-curve" data-role="sr0"/>
            <path class="mv-curve-1" data-role="sr"/>
            <path class="mv-guide" data-role="guide"/>
            <circle r="6.5" class="mv-dot-1" data-role="pt"/>
          </svg>
        </div>
        <div class="ppf-controls">
          <label class="range-label">通胀预期 πᵉ <output data-role="pe-out">2%</output></label>
          <input type="range" data-role="pe" min="0" max="8" step="1" value="2">
          <label class="range-label">当前失业率 u <output data-role="u-out">5.0%</output></label>
          <input type="range" data-role="u" min="2.5" max="8" step="0.5" value="5">
          <div class="ppf-outputs">
            <div><span>实际通胀率 π</span><strong data-role="pi-val">2.0%</strong></div>
            <div><span>失业率 u</span><strong data-role="u-val">5.0%</strong></div>
          </div>
          <div class="ppf-explanation" data-role="msg" aria-live="polite"></div>
        </div>
      </div>`;
    const x = u => X0 + ((u - 2) / 8) * W;
    const y = pi => 270 - (pi / 12) * 228;
    const curve = pe => samplePath(u => Math.max(-1, Math.min(12.2, pe - 1.5 * (u - 5))), 2.2, 8.8, 40, x, y);
    root.querySelector('[data-role="sr0"]').setAttribute('d', curve(2));
    const peIn = root.querySelector('[data-role="pe"]');
    const uIn = root.querySelector('[data-role="u"]');

    function draw() {
      const pe = peIn.valueAsNumber, u = uIn.valueAsNumber;
      const pi = pe - 1.5 * (u - 5);
      root.querySelector('[data-role="sr"]').setAttribute('d', curve(pe));
      root.querySelector('[data-role="guide"]').setAttribute('d', `M${X0} ${y(pi).toFixed(1)} H${x(u).toFixed(1)} V${Y0}`);
      root.querySelector('[data-role="pt"]').setAttribute('cx', x(u).toFixed(1));
      root.querySelector('[data-role="pt"]').setAttribute('cy', y(pi).toFixed(1));
      root.querySelector('[data-role="pe-out"]').value = pe + '%';
      root.querySelector('[data-role="u-out"]').value = fmt(u, 1) + '%';
      root.querySelector('[data-role="pi-val"]').textContent = fmt(pi, 1) + '%';
      root.querySelector('[data-role="u-val"]').textContent = fmt(u, 1) + '%';
      root.querySelector('[data-role="msg"]').textContent = u === 5
        ? `失业率等于自然失业率 5%，实际通胀率恰好等于预期通胀率（${pe}%），落在垂直的长期菲利普斯曲线 LRPC 上。`
        : u < 5
          ? `短期内压低失业率至 ${fmt(u, 1)}%（低于自然失业率）会推高通胀至 ${fmt(pi, 1)}%；一旦公众上调通胀预期，SRPC 将上移，最终只留下更高通胀。`
          : `失业率高于自然失业率（${fmt(u, 1)}% > 5%），短期通胀回落至 ${fmt(pi, 1)}%（通缩压力）。`;
    }
    peIn.addEventListener('input', draw);
    uIn.addEventListener('input', draw);
    draw();
  }

  function mountTrilemma(root) {
    root.innerHTML = `
      <div class="inline-visual-header">
        <span class="inline-visual-badge">交互图解</span>
        <h4>蒙代尔不可能三角：任选两项政策目标</h4>
        <p>点击下方任意两个目标组合，观察开放经济体为什么无法同时实现三者，以及对应的典型制度安排。</p>
      </div>
      <div class="ppf-panel micro-panel">
        <div class="ppf-chart">
          <svg viewBox="0 0 480 330" role="img" aria-label="蒙代尔不可能三角交互图">
            <polygon points="240,56 84,268 396,268" fill="none" stroke="var(--line)" stroke-width="2"/>
            <line data-edge="ab" x1="240" y1="56" x2="84" y2="268" stroke-width="5" stroke-linecap="round"/>
            <line data-edge="ac" x1="240" y1="56" x2="396" y2="268" stroke-width="5" stroke-linecap="round"/>
            <line data-edge="bc" x1="84" y1="268" x2="396" y2="268" stroke-width="5" stroke-linecap="round"/>
            <g data-node="a"><circle cx="240" cy="56" r="15"/><text x="240" y="26" text-anchor="middle" class="axis-label">货币政策独立性</text></g>
            <g data-node="b"><circle cx="84" cy="268" r="15"/><text x="84" y="308" text-anchor="middle" class="axis-label">固定汇率稳定</text></g>
            <g data-node="c"><circle cx="396" cy="268" r="15"/><text x="396" y="308" text-anchor="middle" class="axis-label">资本自由流动</text></g>
            <text x="240" y="192" text-anchor="middle" class="point-label" data-role="center"></text>
          </svg>
        </div>
        <div class="ppf-controls">
          <fieldset class="ppf-scenarios">
            <legend>选择想要保留的两个目标</legend>
            <label><input type="radio" name="tri-pair" value="ac" checked> 货币独立 + 资本自由流动（放弃固定汇率）</label>
            <label><input type="radio" name="tri-pair" value="bc"> 固定汇率 + 资本自由流动（放弃货币独立）</label>
            <label><input type="radio" name="tri-pair" value="ab"> 货币独立 + 固定汇率（放弃资本自由流动）</label>
          </fieldset>
          <div class="ppf-explanation" data-role="msg" aria-live="polite"></div>
        </div>
      </div>`;
    const info = {
      ac: { label: '浮动汇率制', keep: ['a', 'c'], msg: '保留「货币政策独立性 + 资本自由流动」，必须放弃固定汇率，实行浮动汇率制（典型代表：美国、日本、欧元区）。' },
      bc: { label: '货币局 / 货币联盟', keep: ['b', 'c'], msg: '保留「固定汇率 + 资本自由流动」，必须放弃独立的货币政策，利率跟随锚定货币变动（典型代表：中国香港联系汇率制）。' },
      ab: { label: '资本管制', keep: ['a', 'b'], msg: '保留「货币政策独立性 + 汇率稳定」，必须对跨境资本流动实施管制（典型代表：布雷顿森林体系时期及部分新兴市场）。' },
    };
    const radios = [...root.querySelectorAll('input[name="tri-pair"]')];
    function draw() {
      const pair = radios.find(r => r.checked).value;
      const cur = info[pair];
      root.querySelectorAll('[data-edge]').forEach(line => {
        const active = line.dataset.edge === pair;
        line.setAttribute('stroke', active ? 'var(--accent)' : 'transparent');
      });
      root.querySelectorAll('[data-node]').forEach(g => {
        const active = cur.keep.includes(g.dataset.node);
        const c = g.querySelector('circle');
        c.setAttribute('fill', active ? 'var(--accent)' : 'var(--surface-subtle)');
        c.setAttribute('stroke', active ? 'var(--accent)' : 'var(--control-line)');
        c.setAttribute('stroke-width', '2.5');
        g.style.opacity = active ? '1' : '0.45';
      });
      root.querySelector('[data-role="center"]').textContent = cur.label;
      root.querySelector('[data-role="msg"]').textContent = cur.msg;
    }
    radios.forEach(r => r.addEventListener('change', draw));
    draw();
  }

  function mountBond(root) {
    root.innerHTML = `
      <div class="inline-visual-header">
        <span class="inline-visual-badge">交互图解</span>
        <h4>债券价格与市场利率（到期收益率）反向联动</h4>
        <p>拖动市场利率 y、票面利率 c 与剩余期限 n，直观感受折价/平价/溢价发行以及“期限越长、利率敏感度越高”。</p>
      </div>
      <div class="ppf-panel micro-panel">
        <div class="ppf-chart">
          <div class="chart-caption">
            <span><i class="chart-line mv-c1-line"></i>债券价格曲线 P(y)</span>
            <span><i class="chart-line mv-base-line"></i>面值平价线（1000 元）</span>
          </div>
          <svg viewBox="0 0 540 360" role="img" aria-label="债券价格与市场利率关系曲线图">
            <rect x="66" y="42" width="420" height="252" class="mv-grid-box"/>
            <path class="chart-axis" d="M66 30V294H498 M61 37l5-7 5 7 M491 289l7 5-7 5" fill="none" stroke-width="1.5"/>
            <text x="14" y="18" class="axis-label">债券价格（元）</text>
            <text x="276" y="346" text-anchor="middle" class="axis-label">市场利率 / 到期收益率 y (%)</text>
            <g class="tick-label" text-anchor="middle"><text x="66" y="316">1%</text><text x="206" y="316">4%</text><text x="346" y="316">7%</text><text x="486" y="316">10%</text></g>
            <g class="tick-label" text-anchor="end"><text x="56" y="266">600</text><text x="56" y="196">1000</text><text x="56" y="125">1400</text><text x="56" y="55">1800</text></g>
            <line class="mv-base-curve" x1="66" x2="486" y1="192" y2="192"/>
            <path class="mv-curve-1" data-role="curve"/>
            <path class="mv-guide" data-role="guide"/>
            <circle r="6.5" class="mv-dot-1" data-role="pt"/>
          </svg>
        </div>
        <div class="ppf-controls">
          <label class="range-label">市场利率（到期收益率 y）<output data-role="y-out">5.0%</output></label>
          <input type="range" data-role="y" min="1" max="10" step="0.5" value="5">
          <label class="range-label">票面利率 c <output data-role="c-out">5.0%</output></label>
          <input type="range" data-role="c" min="2" max="8" step="0.5" value="5">
          <label class="range-label">剩余期限 n（年）<output data-role="n-out">10 年</output></label>
          <input type="range" data-role="n" min="2" max="20" step="2" value="10">
          <div class="ppf-outputs">
            <div><span>债券现价</span><strong data-role="p-val">1000</strong></div>
            <div><span>发行状态</span><strong data-role="st-val">平价</strong></div>
          </div>
          <div class="ppf-explanation" data-role="msg" aria-live="polite"></div>
        </div>
      </div>`;
    const price = (yPct, cPct, n) => {
      const y = yPct / 100, c = cPct / 100;
      const pvC = y === 0 ? c * 1000 * n : c * 1000 * (1 - Math.pow(1 + y, -n)) / y;
      return pvC + 1000 / Math.pow(1 + y, n);
    };
    const x = yv => X0 + ((yv - 1) / 9) * W;
    const y = pv => Y0 - ((Math.max(450, Math.min(1850, pv)) - 420) / 1430) * H;
    const yIn = root.querySelector('[data-role="y"]');
    const cIn = root.querySelector('[data-role="c"]');
    const nIn = root.querySelector('[data-role="n"]');

    function draw() {
      const yv = yIn.valueAsNumber, cv = cIn.valueAsNumber, nv = nIn.valueAsNumber;
      const pv = price(yv, cv, nv);
      root.querySelector('[data-role="curve"]').setAttribute('d', samplePath(t => price(t, cv, nv), 1, 10, 60, x, y));
      root.querySelector('[data-role="guide"]').setAttribute('d', `M${X0} ${y(pv).toFixed(1)} H${x(yv).toFixed(1)} V${Y0}`);
      root.querySelector('[data-role="pt"]').setAttribute('cx', x(yv).toFixed(1));
      root.querySelector('[data-role="pt"]').setAttribute('cy', y(pv).toFixed(1));
      root.querySelector('[data-role="y-out"]').value = fmt(yv, 1) + '%';
      root.querySelector('[data-role="c-out"]').value = fmt(cv, 1) + '%';
      root.querySelector('[data-role="n-out"]').value = nv + ' 年';
      root.querySelector('[data-role="p-val"]').textContent = fmt(pv, 1);
      const st = Math.abs(pv - 1000) < 0.5 ? '平价' : pv > 1000 ? '溢价' : '折价';
      root.querySelector('[data-role="st-val"]').textContent = st;
      root.querySelector('[data-role="msg"]').textContent = st === '平价'
        ? `市场利率（${fmt(yv, 1)}%）等于票面利率（${fmt(cv, 1)}%），债券按面值 1000 元平价交易。`
        : st === '溢价'
          ? `市场利率（${fmt(yv, 1)}%）低于票面利率（${fmt(cv, 1)}%），票息更有吸引力，债券溢价至 ${fmt(pv, 1)} 元。`
          : `市场利率（${fmt(yv, 1)}%）高于票面利率（${fmt(cv, 1)}%），债券折价至 ${fmt(pv, 1)} 元。试着拉长剩余期限，曲线会更陡峭。`;
    }
    [yIn, cIn, nIn].forEach(i => i.addEventListener('input', draw));
    draw();
  }

  function mountMultiplier(root) {
    root.innerHTML = `
      <div class="inline-visual-header">
        <span class="inline-visual-badge">交互图解</span>
        <h4>商业银行派生存款创造与货币乘数（1 / r）</h4>
        <p>调节法定存款准备金率 r，观察原始存款在银行体系中前 6 轮逐级放贷扩张的过程。</p>
      </div>
      <div class="ppf-panel micro-panel">
        <div class="ppf-chart">
          <div class="chart-caption">
            <span><i class="mv-swatch mv-cs"></i>新增贷款/派生存款</span>
            <span><i class="mv-swatch mv-dwl"></i>缴存法定准备金</span>
          </div>
          <svg viewBox="0 0 540 330" role="img" aria-label="派生存款创造阶梯柱状图">
            <path class="chart-axis" d="M56 36V276H506" fill="none" stroke-width="1.5"/>
            <text x="14" y="20" class="axis-label">金额（万元）</text>
            <g data-role="bars"></g>
            <text x="281" y="320" text-anchor="middle" class="axis-label">银行体系信用扩张轮次</text>
          </svg>
        </div>
        <div class="ppf-controls">
          <label class="range-label">法定准备金率 r <output data-role="r-out">10%</output></label>
          <input type="range" data-role="r" min="5" max="25" step="1" value="10">
          <label class="range-label">初始原始存款 D₀（万元）<output data-role="d-out">100</output></label>
          <input type="range" data-role="d" min="100" max="500" step="50" value="100">
          <div class="ppf-outputs">
            <div><span>理论乘数 1/r</span><strong data-role="k-val">10.0×</strong></div>
            <div><span>存款总额</span><strong data-role="tot-val">1000</strong></div>
          </div>
          <div class="ppf-explanation" data-role="msg" aria-live="polite"></div>
        </div>
      </div>`;
    const rIn = root.querySelector('[data-role="r"]');
    const dIn = root.querySelector('[data-role="d"]');

    function draw() {
      const r = rIn.valueAsNumber / 100;
      const d0 = dIn.valueAsNumber;
      const k = 1 / r;
      const total = d0 * k;
      const bars = root.querySelector('[data-role="bars"]');
      let html = '';
      for (let i = 0; i < 6; i++) {
        const dep = d0 * Math.pow(1 - r, i);
        const res = dep * r;
        const bx = 76 + i * 70;
        const hTotal = (dep / d0) * 210;
        const hRes = (res / d0) * 210;
        const hLoan = hTotal - hRes;
        html += `<rect x="${bx}" y="${(276 - hLoan).toFixed(1)}" width="42" height="${hLoan.toFixed(1)}" rx="3" class="mv-fill-cs" stroke="var(--mv-c1)" stroke-width="1.2"/>`;
        html += `<rect x="${bx}" y="${(276 - hTotal).toFixed(1)}" width="42" height="${hRes.toFixed(1)}" rx="3" class="mv-fill-dwl" stroke="var(--error)" stroke-width="1.2"/>`;
        html += `<text x="${bx + 21}" y="${(268 - hTotal).toFixed(1)}" text-anchor="middle" class="tick-label">${fmt(dep, 0)}</text>`;
        html += `<text x="${bx + 21}" y="296" text-anchor="middle" class="tick-label">第${i + 1}轮</text>`;
      }
      bars.innerHTML = html;
      root.querySelector('[data-role="r-out"]').value = rIn.value + '%';
      root.querySelector('[data-role="d-out"]').value = String(d0);
      root.querySelector('[data-role="k-val"]').textContent = fmt(k, 1) + '×';
      root.querySelector('[data-role="tot-val"]').textContent = fmt(total, 0);
      root.querySelector('[data-role="msg"]').textContent = `在无现金漏损和超额准备金假设下，原始存款 ${d0} 万元最终放大为 ${fmt(total, 0)} 万元（其中净派生存款 ${fmt(total - d0, 0)} 万元）。准备金率 r 越低，乘数越大。`;
    }
    rIn.addEventListener('input', draw);
    dIn.addEventListener('input', draw);
    draw();
  }

  function mountDeductible(root) {
    root.innerHTML = `
      <div class="inline-visual-header">
        <span class="inline-visual-badge">交互图解</span>
        <h4>绝对免赔额 vs 相对免赔额赔付对比</h4>
        <p>拖动损失金额与免赔额，直观对比“超过免赔额后是否扣除免赔额”导致的赔付跳变差异。</p>
      </div>
      <div class="ppf-panel micro-panel">
        <div class="ppf-chart">
          <div class="chart-caption">
            <span><i class="chart-line mv-c1-line"></i>绝对免赔额赔付</span>
            <span><i class="chart-line mv-c2-line"></i>相对免赔额赔付</span>
          </div>
          <svg viewBox="0 0 540 360" role="img" aria-label="绝对免赔额与相对免赔额赔付折线图">
            <rect x="66" y="42" width="420" height="252" class="mv-grid-box"/>
            <path class="chart-axis" d="M66 30V294H498 M61 37l5-7 5 7 M491 289l7 5-7 5" fill="none" stroke-width="1.5"/>
            <text x="14" y="18" class="axis-label">赔付金额（元）</text>
            <text x="276" y="346" text-anchor="middle" class="axis-label">实际损失金额（元）</text>
            <g class="tick-label" text-anchor="middle"><text x="66" y="316">0</text><text x="206" y="316">2000</text><text x="346" y="316">4000</text><text x="486" y="316">6000</text></g>
            <g class="tick-label" text-anchor="end"><text x="56" y="214">2000</text><text x="56" y="130">4000</text><text x="56" y="46">6000</text></g>
            <path class="mv-curve-2" data-role="rel"/>
            <path class="mv-curve-1" data-role="abs"/>
            <line class="mv-guide" data-role="vline" y1="42" y2="294"/>
            <circle r="5.5" class="mv-dot-1" data-role="pt-abs"/>
            <circle r="5.5" class="mv-dot-2" data-role="pt-rel"/>
          </svg>
        </div>
        <div class="ppf-controls">
          <label class="range-label">约定免赔额 M（元）<output data-role="m-out">1000</output></label>
          <input type="range" data-role="m" min="500" max="3000" step="500" value="1000">
          <label class="range-label">实际损失金额 L（元）<output data-role="l-out">2000</output></label>
          <input type="range" data-role="l" min="0" max="6000" step="200" value="2000">
          <div class="ppf-outputs">
            <div><span>绝对免赔赔付</span><strong data-role="abs-val">1000</strong></div>
            <div><span>相对免赔赔付</span><strong data-role="rel-val">2000</strong></div>
          </div>
          <div class="ppf-explanation" data-role="msg" aria-live="polite"></div>
        </div>
      </div>`;
    const x = v => X0 + (v / 6000) * W;
    const y = v => Y0 - (v / 6000) * H;
    const mIn = root.querySelector('[data-role="m"]');
    const lIn = root.querySelector('[data-role="l"]');

    function draw() {
      const m = mIn.valueAsNumber, l = lIn.valueAsNumber;
      const absPay = l > m ? l - m : 0;
      const relPay = l > m ? l : 0;
      root.querySelector('[data-role="abs"]').setAttribute('d', `M${x(0)} ${y(0)} L${x(m)} ${y(0)} L${x(6000)} ${y(6000 - m)}`);
      root.querySelector('[data-role="rel"]').setAttribute('d', `M${x(0)} ${y(0)} L${x(m)} ${y(0)} M${x(m)} ${y(m)} L${x(6000)} ${y(6000)}`);
      const xl = x(l).toFixed(1);
      const vl = root.querySelector('[data-role="vline"]');
      vl.setAttribute('x1', xl); vl.setAttribute('x2', xl);
      root.querySelector('[data-role="pt-abs"]').setAttribute('cx', xl);
      root.querySelector('[data-role="pt-abs"]').setAttribute('cy', y(absPay).toFixed(1));
      root.querySelector('[data-role="pt-rel"]').setAttribute('cx', xl);
      root.querySelector('[data-role="pt-rel"]').setAttribute('cy', y(relPay).toFixed(1));
      root.querySelector('[data-role="m-out"]').value = String(m);
      root.querySelector('[data-role="l-out"]').value = String(l);
      root.querySelector('[data-role="abs-val"]').textContent = String(absPay);
      root.querySelector('[data-role="rel-val"]').textContent = String(relPay);
      root.querySelector('[data-role="msg"]').textContent = l <= m
        ? `损失 ${l} 元未超过免赔额 ${m} 元：绝对免赔额与相对免赔额均不赔付（0 元）。`
        : `损失 ${l} 元超过免赔额 ${m} 元：绝对免赔额须先扣除 ${m} 元，仅赔 ${absPay} 元；相对免赔额达到门槛即全额赔付 ${relPay} 元（多赔 ${m} 元）。`;
    }
    mIn.addEventListener('input', draw);
    lIn.addEventListener('input', draw);
    draw();
  }

  function mountLiabilityTimeline(root) {
    root.innerHTML = `
      <div class="inline-visual-header">
        <span class="inline-visual-badge">交互图解</span>
        <h4>责任保险：期内发生式 vs 期内索赔式时间轴判定</h4>
        <p>拖动「事故发生时间」与「提出索赔时间」，秒懂两种承保基础的理赔边界。</p>
      </div>
      <div class="ppf-panel micro-panel">
        <div class="ppf-chart">
          <svg viewBox="0 0 540 230" role="img" aria-label="期内发生式与期内索赔式时间轴对比图">
            <rect x="46" y="42" width="144" height="106" fill="var(--surface)" stroke="var(--line)" stroke-dasharray="4 3"/>
            <rect x="190" y="42" width="160" height="106" class="mv-stage-band" stroke="var(--accent)" stroke-width="1.5"/>
            <rect x="350" y="42" width="144" height="106" fill="var(--surface)" stroke="var(--line)" stroke-dasharray="4 3"/>
            <g class="tick-label" text-anchor="middle">
              <text x="118" y="30">追溯期（2025）</text>
              <text x="270" y="30" fill="var(--accent)" font-weight="650">保单有效期（2026）</text>
              <text x="422" y="30">保单到期后（2027）</text>
              <text x="46" y="170">25.01</text><text x="190" y="170">26.01</text><text x="350" y="170">27.01</text><text x="494" y="170">27.12</text>
            </g>
            <line x1="38" y1="95" x2="504" y2="95" class="chart-axis" stroke-width="1.6"/>
            <line data-role="span" y1="95" y2="95" stroke="var(--accent)" stroke-width="4" opacity=".45"/>
            <circle r="7.5" class="mv-dot-1" data-role="occ-pt" cy="95"/>
            <text class="point-label" data-role="occ-lbl" y="74" text-anchor="middle">事故</text>
            <circle r="7.5" class="mv-dot-2" data-role="clm-pt" cy="95"/>
            <text class="point-label" data-role="clm-lbl" y="128" text-anchor="middle" style="fill:var(--mv-c2)">索赔</text>
          </svg>
        </div>
        <div class="ppf-controls">
          <label class="range-label">事故发生月份（1-12 追溯期，13-24 有效期）<output data-role="occ-out">2026.06</output></label>
          <input type="range" data-role="occ" min="2" max="34" step="1" value="18">
          <label class="range-label">提出索赔月份（须不早于事故）<output data-role="clm-out">2027.04</output></label>
          <input type="range" data-role="clm" min="2" max="36" step="1" value="28">
          <div class="ppf-outputs">
            <div><span>期内发生式</span><strong data-role="occ-res">承保</strong></div>
            <div><span>期内索赔式</span><strong data-role="clm-res">不赔</strong></div>
          </div>
          <div class="ppf-explanation" data-role="msg" aria-live="polite"></div>
          <div class="button-row">
            <button type="button" class="button button-secondary" data-sc="18,28">期内发生+期后索赔</button>
            <button type="button" class="button button-secondary" data-sc="8,19">追溯期发生+期内索赔</button>
          </div>
        </div>
      </div>`;
    const x = m => 46 + ((m - 1) / 35) * 448;
    const mLabel = m => `${2025 + Math.floor((m - 1) / 12)}.${String(((m - 1) % 12) + 1).padStart(2, '0')}`;
    const occIn = root.querySelector('[data-role="occ"]');
    const clmIn = root.querySelector('[data-role="clm"]');

    function draw() {
      let o = occIn.valueAsNumber, c = clmIn.valueAsNumber;
      if (c < o) { c = o; clmIn.value = String(c); }
      const xo = x(o).toFixed(1), xc = x(c).toFixed(1);
      root.querySelector('[data-role="occ-pt"]').setAttribute('cx', xo);
      root.querySelector('[data-role="occ-lbl"]').setAttribute('x', xo);
      root.querySelector('[data-role="clm-pt"]').setAttribute('cx', xc);
      root.querySelector('[data-role="clm-lbl"]').setAttribute('x', xc);
      const span = root.querySelector('[data-role="span"]');
      span.setAttribute('x1', xo); span.setAttribute('x2', xc);
      root.querySelector('[data-role="occ-out"]').value = mLabel(o);
      root.querySelector('[data-role="clm-out"]').value = mLabel(c);
      const occCovered = o >= 13 && o <= 24;
      const clmCovered = o >= 1 && c >= 13 && c <= 24;
      root.querySelector('[data-role="occ-res"]').textContent = occCovered ? '✓ 承保' : '× 不赔';
      root.querySelector('[data-role="clm-res"]').textContent = clmCovered ? '✓ 承保' : '× 不赔';
      root.querySelector('[data-role="msg"]').textContent =
        `期内发生式只看「事故是否落在 2026 保单期内」（当前${occCovered ? '满足' : '不满足'}）；期内索赔式要求「事故在追溯日后且索赔落在 2026 保单期内」（当前${clmCovered ? '满足' : '不满足'}）。`;
    }
    occIn.addEventListener('input', draw);
    clmIn.addEventListener('input', draw);
    root.querySelectorAll('[data-sc]').forEach(b => b.addEventListener('click', () => {
      const [o, c] = b.dataset.sc.split(',');
      occIn.value = o; clmIn.value = c; draw();
    }));
    draw();
  }

  const registry = {
    'is-lm': mountISLM,
    'ad-as': mountADAS,
    phillips: mountPhillips,
    trilemma: mountTrilemma,
    bond: mountBond,
    multiplier: mountMultiplier,
    deductible: mountDeductible,
    'liability-timeline': mountLiabilityTimeline,
  };

  document.querySelectorAll('[data-micro-visual]').forEach(container => {
    const fn = registry[container.dataset.microVisual];
    if (fn) fn(container);
  });
})();
