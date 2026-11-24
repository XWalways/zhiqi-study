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
  // viewBox="0 0 540 360"
  // Plot box: x in [66, 486] (width 420), y in [42, 294] (height 252)
  // Y-axis title at (14, 18), Y-ticks right-aligned at x=56 (top tick y=46 -> 28px clear of Y-title)
  // X-ticks centered at y=316, X-axis title centered at (276, 346) (30px clear of X-ticks)
  const X0 = 66, W = 420, Y0 = 294, H = 252;

  function mountDemandMove(root) {
    root.innerHTML = `
      <div class="inline-visual-header">
        <span class="inline-visual-badge">交互图解</span>
        <h4>需求曲线：沿曲线点移 vs 整线平移</h4>
        <p>分别拖动“自身价格”与“非价格因素”，直观区分「需求量变动」与「需求变动」。</p>
      </div>
      <div class="ppf-panel micro-panel">
        <div class="ppf-chart">
          <div class="chart-caption">
            <span><i class="chart-line mv-c1-line"></i>当前需求曲线 D</span>
            <span><i class="chart-line mv-base-line"></i>初始需求曲线 D₀</span>
          </div>
          <svg viewBox="0 0 540 360" role="img" aria-label="需求曲线点移与平移对比图">
            <rect x="66" y="42" width="420" height="252" class="mv-grid-box"/>
            <path class="chart-axis" d="M66 30V294H498 M61 37l5-7 5 7 M491 289l7 5-7 5" fill="none" stroke-width="1.5"/>
            <text x="14" y="18" class="axis-label">价格 P</text>
            <text x="276" y="346" text-anchor="middle" class="axis-label">需求量 Q</text>
            <g class="tick-label" text-anchor="middle"><text x="66" y="316">0</text><text x="206" y="316">40</text><text x="346" y="316">80</text><text x="486" y="316">120</text></g>
            <g class="tick-label" text-anchor="end"><text x="56" y="235">10</text><text x="56" y="172">20</text><text x="56" y="109">30</text><text x="56" y="46">40</text></g>
            <path class="mv-base-curve" data-role="d0"/>
            <path class="mv-curve-1" data-role="d1"/>
            <path class="mv-guide" data-role="guide"/>
            <circle r="6.5" class="mv-dot-1" data-role="pt"/>
            <text class="point-label" data-role="pt-label">A</text>
          </svg>
        </div>
        <div class="ppf-controls">
          <h5>1. 改变商品自身价格（点移）</h5>
          <label class="range-label">自身价格 P <output data-role="p-out">20</output></label>
          <input type="range" data-role="p" min="8" max="38" step="1" value="20">
          <h5>2. 改变收入/偏好等外部条件（线移）</h5>
          <label class="range-label">需求平移 ΔD <output data-role="s-out">0</output></label>
          <input type="range" data-role="s" min="-24" max="24" step="4" value="0">
          <div class="ppf-outputs">
            <div><span>当前价格 P</span><strong data-role="p-val">20</strong></div>
            <div><span>需求量 Q</span><strong data-role="q-val">60</strong></div>
          </div>
          <div class="ppf-explanation" data-role="msg" aria-live="polite"></div>
          <div class="button-row"><button type="button" class="button button-secondary" data-role="reset">重置</button></div>
        </div>
      </div>`;
    const x = q => X0 + (q / 120) * W;
    const y = p => Y0 - (p / 40) * H;
    const pIn = root.querySelector('[data-role="p"]');
    const sIn = root.querySelector('[data-role="s"]');
    const linePath = shift => {
      const pTop = Math.min(40, (100 + shift) / 2);
      const qTop = Math.max(0, 100 + shift - 2 * pTop);
      const pBot = Math.max(0, (100 + shift - 120) / 2);
      const qBot = Math.min(120, 100 + shift - 2 * pBot);
      return `M${x(qTop).toFixed(1)} ${y(pTop).toFixed(1)} L${x(qBot).toFixed(1)} ${y(pBot).toFixed(1)}`;
    };
    root.querySelector('[data-role="d0"]').setAttribute('d', linePath(0));
    function draw() {
      const p = pIn.valueAsNumber, s = sIn.valueAsNumber;
      const q = Math.max(0, Math.min(120, 100 + s - 2 * p));
      root.querySelector('[data-role="d1"]').setAttribute('d', linePath(s));
      root.querySelector('[data-role="guide"]').setAttribute('d', `M${X0} ${y(p).toFixed(1)} H${x(q).toFixed(1)} V${Y0}`);
      const pt = root.querySelector('[data-role="pt"]');
      pt.setAttribute('cx', x(q).toFixed(1));
      pt.setAttribute('cy', y(p).toFixed(1));
      const lbl = root.querySelector('[data-role="pt-label"]');
      lbl.setAttribute('x', (x(q) + 10).toFixed(1));
      lbl.setAttribute('y', (y(p) - 10).toFixed(1));
      root.querySelector('[data-role="p-out"]').value = String(p);
      root.querySelector('[data-role="s-out"]').value = (s > 0 ? '+' : '') + s;
      root.querySelector('[data-role="p-val"]').textContent = String(p);
      root.querySelector('[data-role="q-val"]').textContent = String(q);
      root.querySelector('[data-role="msg"]').textContent = s === 0
        ? '仅改变商品自身价格：点 A 沿着原需求曲线 D₀ 上下滑动，这叫「需求量的变动」，曲线位置不变。'
        : s > 0
          ? `外部有利因素使需求增加：整条需求曲线向右平移至 D（同一价格下需求量增加 ${s} 单位），这叫「需求的变动」。`
          : `外部不利因素使需求减少：整条需求曲线向左平移至 D（同一价格下需求量减少 ${-s} 单位），这叫「需求的变动」。`;
    }
    pIn.addEventListener('input', draw);
    sIn.addEventListener('input', draw);
    root.querySelector('[data-role="reset"]').addEventListener('click', () => { pIn.value = '20'; sIn.value = '0'; draw(); });
    draw();
  }

  function mountSupplyMove(root) {
    root.innerHTML = `
      <div class="inline-visual-header">
        <span class="inline-visual-badge">交互图解</span>
        <h4>供给曲线：沿曲线点移 vs 整线平移</h4>
        <p>分别拖动“商品自身价格”与“生产成本/技术变化”，直观区分「供给量变动」与「供给变动」。</p>
      </div>
      <div class="ppf-panel micro-panel">
        <div class="ppf-chart">
          <div class="chart-caption">
            <span><i class="chart-line mv-c2-line"></i>当前供给曲线 S</span>
            <span><i class="chart-line mv-base-line"></i>初始供给曲线 S₀</span>
          </div>
          <svg viewBox="0 0 540 360" role="img" aria-label="供给曲线点移与平移对比图">
            <rect x="66" y="42" width="420" height="252" class="mv-grid-box"/>
            <path class="chart-axis" d="M66 30V294H498 M61 37l5-7 5 7 M491 289l7 5-7 5" fill="none" stroke-width="1.5"/>
            <text x="14" y="18" class="axis-label">价格 P</text>
            <text x="276" y="346" text-anchor="middle" class="axis-label">供给量 Q</text>
            <g class="tick-label" text-anchor="middle"><text x="66" y="316">0</text><text x="206" y="316">40</text><text x="346" y="316">80</text><text x="486" y="316">120</text></g>
            <g class="tick-label" text-anchor="end"><text x="56" y="235">10</text><text x="56" y="172">20</text><text x="56" y="109">30</text><text x="56" y="46">40</text></g>
            <path class="mv-base-curve" data-role="s0"/>
            <path class="mv-curve-2" data-role="s1"/>
            <path class="mv-guide" data-role="guide"/>
            <circle r="6.5" class="mv-dot-2" data-role="pt"/>
            <text class="point-label" data-role="pt-label" style="fill:var(--mv-c2)">B</text>
          </svg>
        </div>
        <div class="ppf-controls">
          <h5>1. 改变商品自身价格（点移）</h5>
          <label class="range-label">自身价格 P <output data-role="p-out">20</output></label>
          <input type="range" data-role="p" min="6" max="36" step="1" value="20">
          <h5>2. 改变技术/成本等外部条件（线移）</h5>
          <label class="range-label">供给平移 ΔS（技术进步/降本为正）<output data-role="s-out">0</output></label>
          <input type="range" data-role="s" min="-24" max="24" step="4" value="0">
          <div class="ppf-outputs">
            <div><span>当前价格 P</span><strong data-role="p-val">20</strong></div>
            <div><span>供给量 Q</span><strong data-role="q-val">60</strong></div>
          </div>
          <div class="ppf-explanation" data-role="msg" aria-live="polite"></div>
          <div class="button-row"><button type="button" class="button button-secondary" data-role="reset">重置</button></div>
        </div>
      </div>`;
    // Q = 20 + shift + 2P
    const x = q => X0 + (q / 120) * W;
    const y = p => Y0 - (p / 40) * H;
    const pIn = root.querySelector('[data-role="p"]');
    const sIn = root.querySelector('[data-role="s"]');
    const linePath = shift => {
      const pBot = Math.max(0, (-20 - shift) / 2);
      const qBot = Math.max(0, 20 + shift + 2 * pBot);
      const pTop = Math.min(40, (100 - shift) / 2);
      const qTop = Math.min(120, 20 + shift + 2 * pTop);
      return `M${x(qBot).toFixed(1)} ${y(pBot).toFixed(1)} L${x(qTop).toFixed(1)} ${y(pTop).toFixed(1)}`;
    };
    root.querySelector('[data-role="s0"]').setAttribute('d', linePath(0));
    function draw() {
      const p = pIn.valueAsNumber, s = sIn.valueAsNumber;
      const q = Math.max(0, Math.min(120, 20 + s + 2 * p));
      root.querySelector('[data-role="s1"]').setAttribute('d', linePath(s));
      root.querySelector('[data-role="guide"]').setAttribute('d', `M${X0} ${y(p).toFixed(1)} H${x(q).toFixed(1)} V${Y0}`);
      const pt = root.querySelector('[data-role="pt"]');
      pt.setAttribute('cx', x(q).toFixed(1));
      pt.setAttribute('cy', y(p).toFixed(1));
      const lbl = root.querySelector('[data-role="pt-label"]');
      lbl.setAttribute('x', (x(q) + 10).toFixed(1));
      lbl.setAttribute('y', (y(p) - 10).toFixed(1));
      root.querySelector('[data-role="p-out"]').value = String(p);
      root.querySelector('[data-role="s-out"]').value = (s > 0 ? '+' : '') + s;
      root.querySelector('[data-role="p-val"]').textContent = String(p);
      root.querySelector('[data-role="q-val"]').textContent = String(q);
      root.querySelector('[data-role="msg"]').textContent = s === 0
        ? '仅改变商品自身价格：点 B 沿着原供给曲线 S₀ 上下滑动，这叫「供给量的变动」，曲线位置不变。'
        : s > 0
          ? `技术进步或要素成本下降使供给增加：整条供给曲线向右（下方）平移至 S（同价供给量 +${s}），这叫「供给的变动」。`
          : `原材料涨价或增税使供给减少：整条供给曲线向左（上方）平移至 S（同价供给量 ${s}），这叫「供给的变动」。`;
    }
    pIn.addEventListener('input', draw);
    sIn.addEventListener('input', draw);
    root.querySelector('[data-role="reset"]').addEventListener('click', () => { pIn.value = '20'; sIn.value = '0'; draw(); });
    draw();
  }

  function mountPriceControls(root) {
    root.innerHTML = `
      <div class="inline-visual-header">
        <span class="inline-visual-badge">交互图解</span>
        <h4>最高限价、最低限价与交易剩余（CS / PS / DWL）</h4>
        <p>切换限价类型并拖动管制价格线，观察短缺、过剩与社会无谓损失（DWL）的变化。</p>
      </div>
      <div class="ppf-panel micro-panel">
        <div class="ppf-chart">
          <div class="chart-caption">
            <span><i class="mv-swatch mv-cs"></i>消费者剩余 CS</span>
            <span><i class="mv-swatch mv-ps"></i>生产者剩余 PS</span>
            <span><i class="mv-swatch mv-dwl"></i>无谓损失 DWL</span>
          </div>
          <svg viewBox="0 0 540 360" role="img" aria-label="价格管制与交易剩余图">
            <rect x="66" y="42" width="420" height="252" class="mv-grid-box"/>
            <path class="chart-axis" d="M66 30V294H498 M61 37l5-7 5 7 M491 289l7 5-7 5" fill="none" stroke-width="1.5"/>
            <text x="14" y="18" class="axis-label">价格 P</text>
            <text x="276" y="346" text-anchor="middle" class="axis-label">数量 Q</text>
            <g class="tick-label" text-anchor="middle"><text x="66" y="316">0</text><text x="171" y="316">20</text><text x="276" y="316">40</text><text x="381" y="316">60</text><text x="486" y="316">80</text></g>
            <g class="tick-label" text-anchor="end"><text x="56" y="248">10</text><text x="56" y="197">20</text><text x="56" y="147">30</text><text x="56" y="96">40</text><text x="56" y="46">50</text></g>
            <polygon class="mv-fill-cs" data-role="cs"/>
            <polygon class="mv-fill-ps" data-role="ps"/>
            <polygon class="mv-fill-dwl" data-role="dwl"/>
            <path class="mv-curve-1" data-role="d"/>
            <path class="mv-curve-2" data-role="s"/>
            <line class="mv-limit-line" data-role="limit" x1="66" x2="486"/>
            <circle r="5.5" class="mv-dot-eq" data-role="eq"/>
            <text class="point-label" data-role="eq-lbl">E</text>
          </svg>
        </div>
        <div class="ppf-controls">
          <fieldset class="ppf-scenarios">
            <legend>价格管制方式</legend>
            <label><input type="radio" name="pc-mode" value="free" checked> 自由市场均衡（P*=30）</label>
            <label><input type="radio" name="pc-mode" value="ceiling"> 最高限价（限制上限）</label>
            <label><input type="radio" name="pc-mode" value="floor"> 最低限价（支持价格）</label>
          </fieldset>
          <label class="range-label">管制价格 P <output data-role="p-out">30</output></label>
          <input type="range" data-role="p" min="14" max="46" step="2" value="30">
          <div class="ppf-outputs">
            <div><span>实际成交量</span><strong data-role="qt">40</strong></div>
            <div><span>无谓损失 DWL</span><strong data-role="dwl-val">0</strong></div>
          </div>
          <div class="ppf-explanation" data-role="msg" aria-live="polite"></div>
        </div>
      </div>`;
    const x = q => X0 + (q / 80) * W;
    const y = p => Y0 - (p / 50) * H;
    const pIn = root.querySelector('[data-role="p"]');
    const radios = [...root.querySelectorAll('input[name="pc-mode"]')];
    root.querySelector('[data-role="d"]').setAttribute('d', `M${x(0)} ${y(50)} L${x(80)} ${y(10)}`);
    root.querySelector('[data-role="s"]').setAttribute('d', `M${x(0)} ${y(10)} L${x(80)} ${y(50)}`);
    root.querySelector('[data-role="eq"]').setAttribute('cx', x(40));
    root.querySelector('[data-role="eq"]').setAttribute('cy', y(30));
    root.querySelector('[data-role="eq-lbl"]').setAttribute('x', x(40) + 10);
    root.querySelector('[data-role="eq-lbl"]').setAttribute('y', y(30) - 8);
    const pts = list => list.map(([q, p]) => `${x(q).toFixed(1)},${y(p).toFixed(1)}`).join(' ');

    function draw() {
      const mode = radios.find(r => r.checked).value;
      pIn.disabled = mode === 'free';
      const pc = mode === 'free' ? 30 : pIn.valueAsNumber;
      root.querySelector('[data-role="p-out"]').value = String(pc);
      const limit = root.querySelector('[data-role="limit"]');
      limit.style.display = mode === 'free' ? 'none' : '';
      limit.setAttribute('y1', y(pc).toFixed(1));
      limit.setAttribute('y2', y(pc).toFixed(1));

      let effective = false, qt = 40, pEff = 30, msg = '';
      if (mode === 'ceiling' && pc < 30) {
        effective = true;
        pEff = pc;
        qt = Math.max(0, 2 * pc - 20);
        const qd = 100 - 2 * pc;
        msg = `有效最高限价（P=${pc} < 30）：需求量 ${qd} 大于供给量 ${qt}，市场出现 ${qd - qt} 单位短缺，实际仅成交 ${qt} 单位并产生无谓损失。`;
      } else if (mode === 'floor' && pc > 30) {
        effective = true;
        pEff = pc;
        qt = Math.max(0, 100 - 2 * pc);
        const qs = 2 * pc - 20;
        msg = `有效最低限价（P=${pc} > 30）：供给量 ${qs} 大于需求量 ${qt}，市场出现 ${qs - qt} 单位过剩，实际仅成交 ${qt} 单位并产生无谓损失。`;
      } else if (mode === 'free') {
        msg = '自由均衡点 E（P*=30, Q*=40）：消费者剩余 CS 与生产者剩余 PS 之和达到最大，无谓损失 DWL = 0。';
      } else {
        msg = mode === 'ceiling'
          ? `最高限价 P=${pc} 高于或等于均衡价 30，不具有约束力，市场仍停留在均衡点 E。`
          : `最低限价 P=${pc} 低于或等于均衡价 30，不具有约束力，市场仍停留在均衡点 E。`;
      }

      const pdAtQt = 50 - 0.5 * qt;
      const psAtQt = 10 + 0.5 * qt;
      const dwl = effective ? 0.5 * (pdAtQt - psAtQt) * (40 - qt) : 0;
      root.querySelector('[data-role="cs"]').setAttribute('points', pts([[0, 50], [0, pEff], [qt, pEff], [qt, pdAtQt]]));
      root.querySelector('[data-role="ps"]').setAttribute('points', pts([[0, 10], [0, pEff], [qt, pEff], [qt, psAtQt]]));
      root.querySelector('[data-role="dwl"]').setAttribute('points', effective ? pts([[qt, pdAtQt], [40, 30], [qt, psAtQt]]) : '');
      root.querySelector('[data-role="qt"]').textContent = String(qt);
      root.querySelector('[data-role="dwl-val"]').textContent = fmt(dwl, 0);
      root.querySelector('[data-role="msg"]').textContent = msg;
    }
    radios.forEach(r => r.addEventListener('change', () => {
      if (r.value === 'ceiling' && pIn.valueAsNumber >= 30) pIn.value = '22';
      if (r.value === 'floor' && pIn.valueAsNumber <= 30) pIn.value = '38';
      draw();
    }));
    pIn.addEventListener('input', draw);
    draw();
  }

  function mountElasticity(root) {
    root.innerHTML = `
      <div class="inline-visual-header">
        <span class="inline-visual-badge">交互图解</span>
        <h4>需求价格弹性与总销售收入（TR = P × Q）</h4>
        <p>切换弹性类型并拖动价格，观察阴影矩形面积（总销售收入）与初始价格 P₀=20 时的增减对比。</p>
      </div>
      <div class="ppf-panel micro-panel">
        <div class="ppf-chart">
          <div class="chart-caption">
            <span><i class="mv-swatch mv-cs"></i>当前总收入 TR = P × Q</span>
            <span><i class="chart-line mv-base-line"></i>基准总收入（P₀=20, TR₀=1000）</span>
          </div>
          <svg viewBox="0 0 540 360" role="img" aria-label="需求价格弹性与总销售收入面积图">
            <rect x="66" y="42" width="420" height="252" class="mv-grid-box"/>
            <path class="chart-axis" d="M66 30V294H498 M61 37l5-7 5 7 M491 289l7 5-7 5" fill="none" stroke-width="1.5"/>
            <text x="14" y="18" class="axis-label">价格 P</text>
            <text x="276" y="346" text-anchor="middle" class="axis-label">数量 Q</text>
            <g class="tick-label" text-anchor="middle"><text x="66" y="316">0</text><text x="171" y="316">25</text><text x="276" y="316">50</text><text x="381" y="316">75</text><text x="486" y="316">100</text></g>
            <g class="tick-label" text-anchor="end"><text x="56" y="235">10</text><text x="56" y="172">20</text><text x="56" y="109">30</text><text x="56" y="46">40</text></g>
            <rect class="mv-fill-cs" data-role="tr-rect"/>
            <rect class="mv-base-rect" data-role="base-rect"/>
            <path class="mv-curve-1" data-role="curve"/>
            <circle r="6" class="mv-dot-1" data-role="pt"/>
          </svg>
        </div>
        <div class="ppf-controls">
          <fieldset class="ppf-scenarios">
            <legend>选择需求曲线斜率</legend>
            <label><input type="radio" name="el-type" value="elastic" checked> 富有弹性（曲线平缓，|Ed| &gt; 1）</label>
            <label><input type="radio" name="el-type" value="unit"> 单位弹性附近（|Ed| ≈ 1）</label>
            <label><input type="radio" name="el-type" value="inelastic"> 缺乏弹性（曲线陡峭，|Ed| &lt; 1）</label>
          </fieldset>
          <label class="range-label">销售价格 P <output data-role="p-out">20</output></label>
          <input type="range" data-role="p" min="10" max="30" step="1" value="20">
          <div class="ppf-outputs">
            <div><span>点弹性 |Ed|</span><strong data-role="ed">1.60</strong></div>
            <div><span>总收入 TR</span><strong data-role="tr">1000</strong></div>
          </div>
          <div class="ppf-explanation" data-role="msg" aria-live="polite"></div>
        </div>
      </div>`;
    const slopes = { elastic: 4, unit: 2.5, inelastic: 0.8 };
    const x = q => X0 + (q / 100) * W;
    const y = p => Y0 - (p / 40) * H;
    const pIn = root.querySelector('[data-role="p"]');
    const radios = [...root.querySelectorAll('input[name="el-type"]')];
    const baseRect = root.querySelector('[data-role="base-rect"]');
    baseRect.setAttribute('x', x(0));
    baseRect.setAttribute('y', y(20));
    baseRect.setAttribute('width', x(50) - x(0));
    baseRect.setAttribute('height', y(0) - y(20));

    function draw() {
      const type = radios.find(r => r.checked).value;
      const b = slopes[type];
      const p = pIn.valueAsNumber;
      const qOf = price => Math.max(0, Math.min(100, 50 - b * (price - 20)));
      const q = qOf(p);
      const tr = p * q;
      const ed = q > 0 ? (b * p) / q : 99;
      const pMin = Math.max(0, 20 - 50 / b);
      const pMax = Math.min(40, 20 + 50 / b);
      root.querySelector('[data-role="curve"]').setAttribute('d', `M${x(qOf(pMax)).toFixed(1)} ${y(pMax).toFixed(1)} L${x(qOf(pMin)).toFixed(1)} ${y(pMin).toFixed(1)}`);
      const r = root.querySelector('[data-role="tr-rect"]');
      r.setAttribute('x', x(0));
      r.setAttribute('y', y(p).toFixed(1));
      r.setAttribute('width', (x(q) - x(0)).toFixed(1));
      r.setAttribute('height', (y(0) - y(p)).toFixed(1));
      const pt = root.querySelector('[data-role="pt"]');
      pt.setAttribute('cx', x(q).toFixed(1));
      pt.setAttribute('cy', y(p).toFixed(1));
      root.querySelector('[data-role="p-out"]').value = String(p);
      root.querySelector('[data-role="ed"]').textContent = fmt(ed, 2);
      root.querySelector('[data-role="tr"]').textContent = fmt(tr, 0);
      const diff = Math.round(tr - 1000);
      const trend = diff > 0 ? `比基准增加 +${diff}` : diff < 0 ? `比基准减少 ${diff}` : '与基准持平';
      root.querySelector('[data-role="msg"]').textContent = type === 'elastic'
        ? `富有弹性商品（|Ed|=${fmt(ed, 2)}）：降价带来销量大幅增长，总收入 ${trend}，适合「薄利多销」。`
        : type === 'inelastic'
          ? `缺乏弹性商品（|Ed|=${fmt(ed, 2)}）：销量对价格不敏感，提价反而增加总收入（${trend}），即「谷贱伤农」的背面。`
          : `单位弹性附近（|Ed|=${fmt(ed, 2)}）：P=20 处总收入最大（TR=1000），偏离该点总收入略降（${trend}）。`;
    }
    radios.forEach(r => r.addEventListener('change', draw));
    pIn.addEventListener('input', draw);
    draw();
  }

  function mountConsumer(root) {
    root.innerHTML = `
      <div class="inline-visual-header">
        <span class="inline-visual-badge">交互图解</span>
        <h4>无差异曲线与预算线：消费者均衡切点 E</h4>
        <p>调节收入 I（预算线平移）或商品 X 价格 Px（预算线旋转），观察最优消费束切点 E 如何移动。</p>
      </div>
      <div class="ppf-panel micro-panel">
        <div class="ppf-chart">
          <div class="chart-caption">
            <span><i class="chart-line mv-c1-line"></i>预算线（可行边界）</span>
            <span><i class="chart-line mv-c2-line"></i>最优无差异曲线 U*</span>
            <span><i class="chart-line mv-base-line"></i>初始预算线</span>
          </div>
          <svg viewBox="0 0 540 360" role="img" aria-label="消费者均衡无差异曲线与预算线切点图">
            <rect x="66" y="42" width="420" height="252" class="mv-grid-box"/>
            <path class="chart-axis" d="M66 30V294H498 M61 37l5-7 5 7 M491 289l7 5-7 5" fill="none" stroke-width="1.5"/>
            <text x="14" y="18" class="axis-label">商品 Y</text>
            <text x="276" y="346" text-anchor="middle" class="axis-label">商品 X</text>
            <g class="tick-label" text-anchor="middle"><text x="66" y="316">0</text><text x="206" y="316">20</text><text x="346" y="316">40</text><text x="486" y="316">60</text></g>
            <g class="tick-label" text-anchor="end"><text x="56" y="248">10</text><text x="56" y="197">20</text><text x="56" y="147">30</text><text x="56" y="96">40</text><text x="56" y="46">50</text></g>
            <path class="mv-ref-ic" data-role="ic-low"/>
            <path class="mv-ref-ic" data-role="ic-high"/>
            <path class="mv-base-curve" data-role="bl0"/>
            <path class="mv-curve-2" data-role="ic-opt"/>
            <path class="mv-curve-1" data-role="bl"/>
            <path class="mv-guide" data-role="guide"/>
            <circle r="6" class="mv-dot-eq" data-role="pt"/>
            <text class="point-label" data-role="lbl">E</text>
          </svg>
        </div>
        <div class="ppf-controls">
          <label class="range-label">消费者收入 I <output data-role="i-out">60</output></label>
          <input type="range" data-role="inc" min="40" max="100" step="4" value="60">
          <label class="range-label">商品 X 价格 Px（Py 固定为 2）<output data-role="px-out">2</output></label>
          <input type="range" data-role="px" min="1" max="4" step="0.5" value="2">
          <div class="ppf-outputs">
            <div><span>最优 (X*, Y*)</span><strong data-role="xy">15, 15</strong></div>
            <div><span>效用水平 U*</span><strong data-role="u-val">15.0</strong></div>
          </div>
          <div class="ppf-explanation" data-role="msg" aria-live="polite"></div>
          <div class="button-row"><button type="button" class="button button-secondary" data-role="reset">重置</button></div>
        </div>
      </div>`;
    const py = 2;
    const x = v => X0 + (v / 60) * W;
    const y = v => Y0 - (v / 50) * H;
    const incIn = root.querySelector('[data-role="inc"]');
    const pxIn = root.querySelector('[data-role="px"]');
    const icPath = u => {
      const xStart = Math.max(1.2, (u * u) / 48);
      const xEnd = Math.min(58, (u * u) / 1.5);
      if (xStart >= xEnd) return '';
      return samplePath(vx => (u * u) / vx, xStart, xEnd, 60, x, y);
    };
    root.querySelector('[data-role="bl0"]').setAttribute('d', `M${x(0)} ${y(30)} L${x(30)} ${y(0)}`);

    function draw() {
      const I = incIn.valueAsNumber, px = pxIn.valueAsNumber;
      const xMax = I / px, yMax = I / py;
      const xOpt = I / (2 * px), yOpt = I / (2 * py);
      const u = Math.sqrt(xOpt * yOpt);
      const xAtTop = Math.max(0, (I - py * 50) / px);
      const yAtLeft = Math.min(50, yMax);
      const xAtBot = Math.min(60, xMax);
      const yAtRight = Math.max(0, (I - px * 60) / py);
      root.querySelector('[data-role="bl"]').setAttribute('d', `M${x(xAtTop).toFixed(1)} ${y(yAtLeft).toFixed(1)} L${x(xAtBot).toFixed(1)} ${y(yAtRight).toFixed(1)}`);
      root.querySelector('[data-role="ic-opt"]').setAttribute('d', icPath(u));
      root.querySelector('[data-role="ic-low"]').setAttribute('d', icPath(u * 0.72));
      root.querySelector('[data-role="ic-high"]').setAttribute('d', icPath(u * 1.28));
      root.querySelector('[data-role="guide"]').setAttribute('d', `M${X0} ${y(yOpt).toFixed(1)} H${x(xOpt).toFixed(1)} V${Y0}`);
      root.querySelector('[data-role="pt"]').setAttribute('cx', x(xOpt).toFixed(1));
      root.querySelector('[data-role="pt"]').setAttribute('cy', y(yOpt).toFixed(1));
      root.querySelector('[data-role="lbl"]').setAttribute('x', (x(xOpt) + 10).toFixed(1));
      root.querySelector('[data-role="lbl"]').setAttribute('y', (y(yOpt) - 10).toFixed(1));
      root.querySelector('[data-role="i-out"]').value = String(I);
      root.querySelector('[data-role="px-out"]').value = fmt(px, 1);
      root.querySelector('[data-role="xy"]').textContent = `${fmt(xOpt, 1)}, ${fmt(yOpt, 1)}`;
      root.querySelector('[data-role="u-val"]').textContent = fmt(u, 1);
      root.querySelector('[data-role="msg"]').textContent = `切点 E 满足 MRSxy = Px/Py = ${fmt(px / py, 2)}。预算线与最高可达无差异曲线 U*=${fmt(u, 1)} 相切，实现给定预算下的最大效用。`;
    }
    incIn.addEventListener('input', draw);
    pxIn.addEventListener('input', draw);
    root.querySelector('[data-role="reset"]').addEventListener('click', () => { incIn.value = '60'; pxIn.value = '2'; draw(); });
    draw();
  }

  function mountProduction(root) {
    root.innerHTML = `
      <div class="inline-visual-header">
        <span class="inline-visual-badge">交互图解</span>
        <h4>短期生产函数：TP / AP / MP 联动与三个阶段</h4>
        <p>拖动劳动投入 L，同步观察总产量（TP）、平均产量（AP）与边际产量（MP）的关键交点，定位第 II 合理生产阶段。</p>
      </div>
      <div class="ppf-panel micro-panel">
        <div class="ppf-chart">
          <div class="chart-caption">
            <span><i class="chart-line mv-c1-line"></i>TP / AP</span>
            <span><i class="chart-line mv-c2-line"></i>边际产量 MP</span>
            <span><i class="mv-swatch mv-cs"></i>第 II 阶段（合理投入区）</span>
          </div>
          <svg viewBox="0 0 540 415" role="img" aria-label="短期生产三阶段联动图">
            <rect class="mv-stage-band" data-role="band-top"/>
            <rect class="mv-stage-band" data-role="band-bot"/>
            <!-- Top: TP -->
            <path class="chart-axis" d="M66 28V176H498" fill="none" stroke-width="1.4"/>
            <text x="14" y="18" class="axis-label">总产量 TP</text>
            <g class="tick-label" text-anchor="end"><text x="56" y="180">0</text><text x="56" y="110">450</text><text x="56" y="42">900</text></g>
            <path class="mv-curve-1" data-role="tp"/>
            <!-- Bottom: AP & MP -->
            <path class="chart-axis" d="M66 214V364H498" fill="none" stroke-width="1.4"/>
            <line class="mv-zero-line" x1="66" x2="498" y1="330" y2="330"/>
            <text x="14" y="204" class="axis-label">AP / MP</text>
            <g class="tick-label" text-anchor="end"><text x="56" y="334">0</text><text x="56" y="276">60</text><text x="56" y="220">120</text></g>
            <path class="mv-curve-1" data-role="ap"/>
            <path class="mv-curve-2" data-role="mp"/>
            <line class="mv-guide" data-role="vline" y1="28" y2="364"/>
            <circle r="5" class="mv-dot-1" data-role="pt-tp"/>
            <circle r="5" class="mv-dot-1" data-role="pt-ap"/>
            <circle r="5" class="mv-dot-2" data-role="pt-mp"/>
            <g class="tick-label" text-anchor="middle">
              <text x="196" y="384">第 I 阶段</text>
              <text x="381" y="384">第 II 阶段（合理）</text>
              <text x="466" y="384">第 III 阶段</text>
            </g>
            <text x="276" y="406" text-anchor="middle" class="axis-label">劳动投入量 L</text>
          </svg>
        </div>
        <div class="ppf-controls">
          <label class="range-label">劳动投入量 L <output data-role="l-out">9</output></label>
          <input type="range" data-role="l" min="1" max="13.5" step="0.5" value="9">
          <div class="ppf-outputs">
            <div><span>总产量 TP</span><strong data-role="tp-val">729</strong></div>
            <div><span>平均产量 AP</span><strong data-role="ap-val">81</strong></div>
          </div>
          <div class="ppf-outputs">
            <div><span>边际产量 MP</span><strong data-role="mp-val">81</strong></div>
            <div><span>所处阶段</span><strong data-role="stage-val">第 II 阶段</strong></div>
          </div>
          <div class="ppf-explanation" data-role="msg" aria-live="polite"></div>
          <div class="button-row">
            <button type="button" class="button button-secondary" data-jump="6">MP 最高点</button>
            <button type="button" class="button button-secondary" data-jump="9">AP 最高点</button>
            <button type="button" class="button button-secondary" data-jump="12">TP 最高点</button>
          </div>
        </div>
      </div>`;
    const tpFn = l => 18 * l * l - l * l * l;
    const apFn = l => 18 * l - l * l;
    const mpFn = l => 36 * l - 3 * l * l;
    const x = l => X0 + (l / 14) * W;
    const yTP = v => 176 - (v / 950) * 142;
    const yAM = v => 330 - (v / 120) * 114;
    const bandX = x(9), bandW = x(12) - x(9);
    root.querySelector('[data-role="band-top"]').setAttribute('x', bandX);
    root.querySelector('[data-role="band-top"]').setAttribute('y', 28);
    root.querySelector('[data-role="band-top"]').setAttribute('width', bandW);
    root.querySelector('[data-role="band-top"]').setAttribute('height', 148);
    root.querySelector('[data-role="band-bot"]').setAttribute('x', bandX);
    root.querySelector('[data-role="band-bot"]').setAttribute('y', 214);
    root.querySelector('[data-role="band-bot"]').setAttribute('width', bandW);
    root.querySelector('[data-role="band-bot"]').setAttribute('height', 150);
    root.querySelector('[data-role="tp"]').setAttribute('d', samplePath(tpFn, 0, 14, 70, x, yTP));
    root.querySelector('[data-role="ap"]').setAttribute('d', samplePath(apFn, 0.2, 14, 70, x, yAM));
    root.querySelector('[data-role="mp"]').setAttribute('d', samplePath(mpFn, 0, 13.5, 70, x, yAM));

    const lIn = root.querySelector('[data-role="l"]');
    function draw() {
      const l = lIn.valueAsNumber;
      const tp = tpFn(l), ap = apFn(l), mp = mpFn(l);
      const xl = x(l).toFixed(1);
      const vl = root.querySelector('[data-role="vline"]');
      vl.setAttribute('x1', xl); vl.setAttribute('x2', xl);
      root.querySelector('[data-role="pt-tp"]').setAttribute('cx', xl);
      root.querySelector('[data-role="pt-tp"]').setAttribute('cy', yTP(tp).toFixed(1));
      root.querySelector('[data-role="pt-ap"]').setAttribute('cx', xl);
      root.querySelector('[data-role="pt-ap"]').setAttribute('cy', yAM(ap).toFixed(1));
      root.querySelector('[data-role="pt-mp"]').setAttribute('cx', xl);
      root.querySelector('[data-role="pt-mp"]').setAttribute('cy', yAM(mp).toFixed(1));
      root.querySelector('[data-role="l-out"]').value = fmt(l, 1);
      root.querySelector('[data-role="tp-val"]').textContent = fmt(tp, 0);
      root.querySelector('[data-role="ap-val"]').textContent = fmt(ap, 1);
      root.querySelector('[data-role="mp-val"]').textContent = fmt(mp, 1);
      let stage = '第 II 阶段', msg = '';
      if (l < 9) {
        stage = '第 I 阶段';
        msg = '第 I 阶段（MP > AP）：平均产量仍在上升，说明固定要素相对过剩，理性厂商会继续增加劳动投入。';
      } else if (l <= 12) {
        stage = '第 II 阶段';
        msg = l === 9
          ? '分界点 L=9：MP 自上而下穿过 AP 最高点（AP=MP=81），由此进入理性厂商的「第 II 合理生产阶段」。'
          : l === 12
            ? '分界点 L=12：边际产量 MP=0，总产量 TP 达到最大值 864；再增加劳动只会让总产量下降。'
            : '第 II 阶段（0 ≤ MP ≤ AP）：总产量继续增加而平均产量递减，是短期生产的合理投入区间。';
      } else {
        stage = '第 III 阶段';
        msg = '第 III 阶段（MP < 0）：劳动投入过多导致总产量反而下降，理性厂商绝不会在此阶段生产。';
      }
      root.querySelector('[data-role="stage-val"]').textContent = stage;
      root.querySelector('[data-role="msg"]').textContent = msg;
    }
    lIn.addEventListener('input', draw);
    root.querySelectorAll('[data-jump]').forEach(b => b.addEventListener('click', () => { lIn.value = b.dataset.jump; draw(); }));
    draw();
  }

  function mountIsoquant(root) {
    root.innerHTML = `
      <div class="inline-visual-header">
        <span class="inline-visual-badge">交互图解</span>
        <h4>长期生产：等产量曲线与等成本线（生产者均衡）</h4>
        <p>调节总成本预算 C（等成本线平移）或工资率 w（等成本线旋转），观察最优要素投入切点 E（MRTS = w/r）。</p>
      </div>
      <div class="ppf-panel micro-panel">
        <div class="ppf-chart">
          <div class="chart-caption">
            <span><i class="chart-line mv-c1-line"></i>等成本线（总预算 C）</span>
            <span><i class="chart-line mv-c2-line"></i>最优等产量曲线 Q*</span>
            <span><i class="chart-line mv-base-line"></i>初始等成本线</span>
          </div>
          <svg viewBox="0 0 540 360" role="img" aria-label="等产量曲线与等成本线生产者均衡图">
            <rect x="66" y="42" width="420" height="252" class="mv-grid-box"/>
            <path class="chart-axis" d="M66 30V294H498 M61 37l5-7 5 7 M491 289l7 5-7 5" fill="none" stroke-width="1.5"/>
            <text x="14" y="18" class="axis-label">资本投入 K</text>
            <text x="276" y="346" text-anchor="middle" class="axis-label">劳动投入 L</text>
            <g class="tick-label" text-anchor="middle"><text x="66" y="316">0</text><text x="206" y="316">20</text><text x="346" y="316">40</text><text x="486" y="316">60</text></g>
            <g class="tick-label" text-anchor="end"><text x="56" y="248">10</text><text x="56" y="197">20</text><text x="56" y="147">30</text><text x="56" y="96">40</text><text x="56" y="46">50</text></g>
            <path class="mv-ref-ic" data-role="iq-low"/>
            <path class="mv-ref-ic" data-role="iq-high"/>
            <path class="mv-base-curve" data-role="ic0"/>
            <path class="mv-curve-2" data-role="iq-opt"/>
            <path class="mv-curve-1" data-role="ic"/>
            <path class="mv-guide" data-role="guide"/>
            <circle r="6" class="mv-dot-eq" data-role="pt"/>
            <text class="point-label" data-role="lbl">E</text>
          </svg>
        </div>
        <div class="ppf-controls">
          <label class="range-label">总成本预算 C <output data-role="c-out">60</output></label>
          <input type="range" data-role="cost" min="40" max="100" step="4" value="60">
          <label class="range-label">工资率 w（资本租金 r 固定为 2）<output data-role="w-out">2</output></label>
          <input type="range" data-role="w" min="1" max="4" step="0.5" value="2">
          <div class="ppf-outputs">
            <div><span>最优 (L*, K*)</span><strong data-role="lk">15, 15</strong></div>
            <div><span>最大产量 Q*</span><strong data-role="q-val">15.0</strong></div>
          </div>
          <div class="ppf-explanation" data-role="msg" aria-live="polite"></div>
          <div class="button-row"><button type="button" class="button button-secondary" data-role="reset">重置</button></div>
        </div>
      </div>`;
    const rPrice = 2;
    const x = v => X0 + (v / 60) * W;
    const y = v => Y0 - (v / 50) * H;
    const cIn = root.querySelector('[data-role="cost"]');
    const wIn = root.querySelector('[data-role="w"]');
    const iqPath = q => {
      const lStart = Math.max(1.2, (q * q) / 48);
      const lEnd = Math.min(58, (q * q) / 1.5);
      if (lStart >= lEnd) return '';
      return samplePath(vl => (q * q) / vl, lStart, lEnd, 60, x, y);
    };
    root.querySelector('[data-role="ic0"]').setAttribute('d', `M${x(0)} ${y(30)} L${x(30)} ${y(0)}`);

    function draw() {
      const C = cIn.valueAsNumber, w = wIn.valueAsNumber;
      const lMax = C / w, kMax = C / rPrice;
      const lOpt = C / (2 * w), kOpt = C / (2 * rPrice);
      const q = Math.sqrt(lOpt * kOpt);
      const lAtTop = Math.max(0, (C - rPrice * 50) / w);
      const kAtLeft = Math.min(50, kMax);
      const lAtBot = Math.min(60, lMax);
      const kAtRight = Math.max(0, (C - w * 60) / rPrice);
      root.querySelector('[data-role="ic"]').setAttribute('d', `M${x(lAtTop).toFixed(1)} ${y(kAtLeft).toFixed(1)} L${x(lAtBot).toFixed(1)} ${y(kAtRight).toFixed(1)}`);
      root.querySelector('[data-role="iq-opt"]').setAttribute('d', iqPath(q));
      root.querySelector('[data-role="iq-low"]').setAttribute('d', iqPath(q * 0.72));
      root.querySelector('[data-role="iq-high"]').setAttribute('d', iqPath(q * 1.28));
      root.querySelector('[data-role="guide"]').setAttribute('d', `M${X0} ${y(kOpt).toFixed(1)} H${x(lOpt).toFixed(1)} V${Y0}`);
      root.querySelector('[data-role="pt"]').setAttribute('cx', x(lOpt).toFixed(1));
      root.querySelector('[data-role="pt"]').setAttribute('cy', y(kOpt).toFixed(1));
      root.querySelector('[data-role="lbl"]').setAttribute('x', (x(lOpt) + 10).toFixed(1));
      root.querySelector('[data-role="lbl"]').setAttribute('y', (y(kOpt) - 10).toFixed(1));
      root.querySelector('[data-role="c-out"]').value = String(C);
      root.querySelector('[data-role="w-out"]').value = fmt(w, 1);
      root.querySelector('[data-role="lk"]').textContent = `${fmt(lOpt, 1)}, ${fmt(kOpt, 1)}`;
      root.querySelector('[data-role="q-val"]').textContent = fmt(q, 1);
      root.querySelector('[data-role="msg"]').textContent = `切点 E 满足 MRTS_LK = MP_L/MP_K = w/r = ${fmt(w / rPrice, 2)}。给定成本 C=${C} 时达到最大产量 Q*=${fmt(q, 1)}（工资上涨会促使厂商用资本替代劳动）。`;
    }
    cIn.addEventListener('input', draw);
    wIn.addEventListener('input', draw);
    root.querySelector('[data-role="reset"]').addEventListener('click', () => { cIn.value = '60'; wIn.value = '2'; draw(); });
    draw();
  }

  function mountCost(root) {
    root.innerHTML = `
      <div class="inline-visual-header">
        <span class="inline-visual-badge">交互图解</span>
        <h4>短期成本曲线：MC 穿过 AVC 与 AC 最低点</h4>
        <p>拖动产量 Q，观察边际成本（MC）如何拉动平均成本（AC）与平均可变成本（AVC）升降，以及 AFC 持续递减。</p>
      </div>
      <div class="ppf-panel micro-panel">
        <div class="ppf-chart">
          <div class="chart-caption">
            <span><i class="chart-line mv-c2-line"></i>边际成本 MC</span>
            <span><i class="chart-line mv-c1-line"></i>平均总成本 AC</span>
            <span><i class="chart-line mv-c3-line"></i>平均可变成本 AVC</span>
            <span><i class="chart-line mv-base-line"></i>平均固定成本 AFC</span>
          </div>
          <svg viewBox="0 0 540 360" role="img" aria-label="短期成本曲线关系图">
            <rect x="66" y="42" width="420" height="252" class="mv-grid-box"/>
            <path class="chart-axis" d="M66 30V294H498 M61 37l5-7 5 7 M491 289l7 5-7 5" fill="none" stroke-width="1.5"/>
            <text x="14" y="18" class="axis-label">单位成本 C</text>
            <text x="276" y="346" text-anchor="middle" class="axis-label">产量 Q</text>
            <g class="tick-label" text-anchor="middle"><text x="66" y="316">0</text><text x="186" y="316">3</text><text x="306" y="316">6</text><text x="426" y="316">9</text></g>
            <g class="tick-label" text-anchor="end"><text x="56" y="248">10</text><text x="56" y="197">20</text><text x="56" y="147">30</text><text x="56" y="96">40</text><text x="56" y="46">50</text></g>
            <path class="mv-base-curve" data-role="afc"/>
            <path class="mv-curve-3" data-role="avc"/>
            <path class="mv-curve-1" data-role="ac"/>
            <path class="mv-curve-2" data-role="mc"/>
            <line class="mv-guide" data-role="vline" y1="42" y2="294"/>
            <circle r="5" class="mv-dot-2" data-role="pt-mc"/>
            <circle r="5" class="mv-dot-1" data-role="pt-ac"/>
            <circle r="5" class="mv-dot-3" data-role="pt-avc"/>
          </svg>
        </div>
        <div class="ppf-controls">
          <label class="range-label">产量 Q <output data-role="q-out">6</output></label>
          <input type="range" data-role="q" min="2" max="10" step="0.2" value="6">
          <div class="ppf-outputs">
            <div><span>边际成本 MC</span><strong data-role="mc-val">12.0</strong></div>
            <div><span>平均总成本 AC</span><strong data-role="ac-val">28.7</strong></div>
          </div>
          <div class="ppf-outputs">
            <div><span>平均可变 AVC</span><strong data-role="avc-val">12.0</strong></div>
            <div><span>平均固定 AFC</span><strong data-role="afc-val">16.7</strong></div>
          </div>
          <div class="ppf-explanation" data-role="msg" aria-live="polite"></div>
          <div class="button-row">
            <button type="button" class="button button-secondary" data-jump="6">AVC 最低点</button>
            <button type="button" class="button button-secondary" data-jump="7.6">AC 最低点</button>
          </div>
        </div>
      </div>`;
    const mcFn = q => 30 - 12 * q + 1.5 * q * q;
    const avcFn = q => 30 - 6 * q + 0.5 * q * q;
    const afcFn = q => 100 / q;
    const acFn = q => avcFn(q) + afcFn(q);
    const x = q => X0 + (q / 10.5) * W;
    const y = c => Y0 - (Math.min(54, c) / 50) * H;
    root.querySelector('[data-role="mc"]').setAttribute('d', samplePath(mcFn, 0.5, 10, 80, x, y));
    root.querySelector('[data-role="avc"]').setAttribute('d', samplePath(avcFn, 0.5, 10.2, 80, x, y));
    root.querySelector('[data-role="ac"]').setAttribute('d', samplePath(acFn, 2.7, 10.2, 80, x, y));
    root.querySelector('[data-role="afc"]').setAttribute('d', samplePath(afcFn, 2.0, 10.2, 80, x, y));
    const qIn = root.querySelector('[data-role="q"]');

    function draw() {
      const q = qIn.valueAsNumber;
      const mc = mcFn(q), ac = acFn(q), avc = avcFn(q), afc = afcFn(q);
      const xq = x(q).toFixed(1);
      const vl = root.querySelector('[data-role="vline"]');
      vl.setAttribute('x1', xq); vl.setAttribute('x2', xq);
      root.querySelector('[data-role="pt-mc"]').setAttribute('cx', xq);
      root.querySelector('[data-role="pt-mc"]').setAttribute('cy', y(mc).toFixed(1));
      root.querySelector('[data-role="pt-ac"]').setAttribute('cx', xq);
      root.querySelector('[data-role="pt-ac"]').setAttribute('cy', y(ac).toFixed(1));
      root.querySelector('[data-role="pt-avc"]').setAttribute('cx', xq);
      root.querySelector('[data-role="pt-avc"]').setAttribute('cy', y(avc).toFixed(1));
      root.querySelector('[data-role="q-out"]').value = fmt(q, 1);
      root.querySelector('[data-role="mc-val"]').textContent = fmt(mc, 1);
      root.querySelector('[data-role="ac-val"]').textContent = fmt(ac, 1);
      root.querySelector('[data-role="avc-val"]').textContent = fmt(avc, 1);
      root.querySelector('[data-role="afc-val"]').textContent = fmt(afc, 1);
      root.querySelector('[data-role="msg"]').textContent = Math.abs(mc - avc) < 0.6
        ? 'Q=6 是 AVC 最低点（MC = AVC = 12），也是完全竞争厂商的「停止营业点」。'
        : Math.abs(mc - ac) < 1.2
          ? 'Q≈7.6 是 AC 最低点（MC = AC ≈ 26.4），也是「收支相抵点」。注意 AC 最低点总在 AVC 最低点右侧。'
          : mc < ac
            ? `当前 MC (${fmt(mc, 1)}) < AC (${fmt(ac, 1)})，边际成本低于平均成本，会把 AC 继续向下拉。`
            : `当前 MC (${fmt(mc, 1)}) > AC (${fmt(ac, 1)})，边际成本高于平均成本，会把 AC 向上拉升。`;
    }
    qIn.addEventListener('input', draw);
    root.querySelectorAll('[data-jump]').forEach(b => b.addEventListener('click', () => { qIn.value = b.dataset.jump; draw(); }));
    draw();
  }

  function mountMarketStructure(root) {
    root.innerHTML = `
      <div class="inline-visual-header">
        <span class="inline-visual-badge">交互图解</span>
        <h4>完全竞争短期决策 vs 完全垄断无谓损失</h4>
        <p>在「完全竞争」下拖动市场价格，体验盈利、亏损继续生产与停产决策；切换「完全垄断」观察 MR=MC 定价与无谓损失。</p>
      </div>
      <div class="ppf-panel micro-panel">
        <div class="ppf-chart">
          <div class="chart-caption" data-role="caption"></div>
          <svg viewBox="0 0 540 360" role="img" aria-label="完全竞争与完全垄断利润决策图">
            <rect x="66" y="42" width="420" height="252" class="mv-grid-box"/>
            <path class="chart-axis" d="M66 30V294H498 M61 37l5-7 5 7 M491 289l7 5-7 5" fill="none" stroke-width="1.5"/>
            <text x="14" y="18" class="axis-label">价格 / 成本</text>
            <text x="276" y="346" text-anchor="middle" class="axis-label">产量 Q</text>
            <g class="tick-label" text-anchor="end"><text x="56" y="248">10</text><text x="56" y="197">20</text><text x="56" y="147">30</text><text x="56" y="96">40</text><text x="56" y="46">50</text></g>
            <rect data-role="profit-rect"/>
            <polygon class="mv-fill-dwl" data-role="dwl"/>
            <path class="mv-curve-3" data-role="c-avc"/>
            <path class="mv-curve-1" data-role="c-ac"/>
            <path class="mv-curve-2" data-role="c-mc"/>
            <path class="mv-base-curve" data-role="c-mr"/>
            <line class="mv-limit-line" data-role="pline" x1="66" x2="486"/>
            <circle r="6" class="mv-dot-eq" data-role="pt"/>
          </svg>
        </div>
        <div class="ppf-controls">
          <fieldset class="ppf-scenarios">
            <legend>市场结构视角</legend>
            <label><input type="radio" name="ms-mode" value="pc" checked> 完全竞争（短期生产与停产决策）</label>
            <label><input type="radio" name="ms-mode" value="mono"> 完全垄断（MR=MC 定价与 DWL）</label>
          </fieldset>
          <label class="range-label"><span data-role="sl-label">市场价格 P</span> <output data-role="sl-out">32</output></label>
          <input type="range" data-role="sl" min="8" max="42" step="1" value="32">
          <div class="ppf-outputs">
            <div><span>最优产量 Q*</span><strong data-role="q-val">8.1</strong></div>
            <div><span data-role="metric-label">经济利润 π</span><strong data-role="m-val">+44</strong></div>
          </div>
          <div class="ppf-explanation" data-role="msg" aria-live="polite"></div>
        </div>
      </div>`;
    const mcFn = q => 30 - 12 * q + 1.5 * q * q;
    const avcFn = q => 30 - 6 * q + 0.5 * q * q;
    const acFn = q => 100 / q + avcFn(q);
    const radios = [...root.querySelectorAll('input[name="ms-mode"]')];
    const sl = root.querySelector('[data-role="sl"]');

    function draw() {
      const mode = radios.find(r => r.checked).value;
      const rect = root.querySelector('[data-role="profit-rect"]');
      const dwl = root.querySelector('[data-role="dwl"]');
      const pline = root.querySelector('[data-role="pline"]');
      const pt = root.querySelector('[data-role="pt"]');
      const cAvc = root.querySelector('[data-role="c-avc"]');
      const cAc = root.querySelector('[data-role="c-ac"]');
      const cMc = root.querySelector('[data-role="c-mc"]');
      const cMr = root.querySelector('[data-role="c-mr"]');

      if (mode === 'pc') {
        const x = q => X0 + (q / 10.5) * W;
        const y = p => Y0 - (Math.min(52, p) / 50) * H;
        const p = sl.valueAsNumber;
        root.querySelector('[data-role="sl-label"]').textContent = '市场价格 P';
        root.querySelector('[data-role="sl-out"]').value = String(p);
        root.querySelector('[data-role="metric-label"]').textContent = '经济利润 π';
        root.querySelector('[data-role="caption"]').innerHTML = '<span><i class="chart-line mv-c2-line"></i>MC</span><span><i class="chart-line mv-c1-line"></i>AC</span><span><i class="chart-line mv-c3-line"></i>AVC</span><span><i class="mv-swatch mv-cs"></i>盈利 / 亏损面积</span>';
        cMc.setAttribute('d', samplePath(mcFn, 0.5, 10, 70, x, y));
        cAc.setAttribute('d', samplePath(acFn, 2.7, 10.2, 70, x, y));
        cAvc.setAttribute('d', samplePath(avcFn, 0.5, 10.2, 70, x, y));
        cMr.setAttribute('d', '');
        dwl.setAttribute('points', '');
        pline.style.display = '';
        pline.setAttribute('y1', y(p).toFixed(1));
        pline.setAttribute('y2', y(p).toFixed(1));

        if (p < 12) {
          rect.setAttribute('width', '0');
          pt.setAttribute('cx', x(0));
          pt.setAttribute('cy', y(p));
          root.querySelector('[data-role="q-val"]').textContent = '0';
          root.querySelector('[data-role="m-val"]').textContent = '-100';
          root.querySelector('[data-role="msg"]').textContent = `P=${p} 低于 AVC 最低点（12）：价格连可变成本都无法弥补，短期最优决策是「停止营业」（Q*=0），仅承担固定成本 100。`;
        } else {
          const q = 4 + Math.sqrt(Math.max(0, (p - 6) / 1.5));
          const ac = acFn(q);
          const profit = (p - ac) * q;
          const topY = y(Math.max(p, ac));
          const botY = y(Math.min(p, ac));
          rect.setAttribute('class', profit >= 0 ? 'mv-fill-cs' : 'mv-fill-dwl');
          rect.setAttribute('x', x(0));
          rect.setAttribute('y', topY.toFixed(1));
          rect.setAttribute('width', (x(q) - x(0)).toFixed(1));
          rect.setAttribute('height', Math.max(0, botY - topY).toFixed(1));
          pt.setAttribute('cx', x(q).toFixed(1));
          pt.setAttribute('cy', y(p).toFixed(1));
          root.querySelector('[data-role="q-val"]').textContent = fmt(q, 1);
          root.querySelector('[data-role="m-val"]').textContent = (profit >= 0 ? '+' : '') + fmt(profit, 0);
          root.querySelector('[data-role="msg"]').textContent = profit > 2
            ? `P=${p} > AC（${fmt(ac, 1)}）：按 P=MC 生产 Q*=${fmt(q, 1)}，获得超额经济利润 +${fmt(profit, 0)}。`
            : profit >= -2
              ? `P=${p} ≈ AC 最低点：处于「盈亏平衡点」，经济利润接近 0（刚好赚取正常利润）。`
              : `12 ≤ P=${p} < AC（${fmt(ac, 1)}）：虽有亏损（${fmt(profit, 0)}），但收益能弥补全部可变成本并分摊部分固定成本，短期应「继续生产」。`;
        }
      } else {
        const x = q => X0 + (q / 25) * W;
        const y = p => Y0 - (p / 50) * H;
        const c = Math.max(10, Math.min(30, sl.valueAsNumber));
        const qm = (50 - c) / 4;
        const pm = 50 - 2 * qm;
        const qc = (50 - c) / 2;
        const profit = (pm - c) * qm;
        const dwlVal = 0.5 * (pm - c) * (qc - qm);
        root.querySelector('[data-role="sl-label"]').textContent = '边际成本 MC';
        root.querySelector('[data-role="sl-out"]').value = String(c);
        root.querySelector('[data-role="metric-label"]').textContent = '无谓损失 DWL';
        root.querySelector('[data-role="caption"]').innerHTML = '<span><i class="chart-line mv-c1-line"></i>需求 D</span><span><i class="chart-line mv-base-line"></i>边际收益 MR</span><span><i class="mv-swatch mv-cs"></i>垄断利润</span><span><i class="mv-swatch mv-dwl"></i>无谓损失 DWL</span>';
        cAc.setAttribute('d', `M${x(0)} ${y(50)} L${x(25)} ${y(0)}`);
        cMr.setAttribute('d', `M${x(0)} ${y(50)} L${x(12.5)} ${y(0)}`);
        cMc.setAttribute('d', `M${x(0)} ${y(c)} L${x(25)} ${y(c)}`);
        cAvc.setAttribute('d', '');
        pline.style.display = 'none';
        rect.setAttribute('class', 'mv-fill-cs');
        rect.setAttribute('x', x(0));
        rect.setAttribute('y', y(pm).toFixed(1));
        rect.setAttribute('width', (x(qm) - x(0)).toFixed(1));
        rect.setAttribute('height', (y(c) - y(pm)).toFixed(1));
        dwl.setAttribute('points', `${x(qm).toFixed(1)},${y(pm).toFixed(1)} ${x(qc).toFixed(1)},${y(c).toFixed(1)} ${x(qm).toFixed(1)},${y(c).toFixed(1)}`);
        pt.setAttribute('cx', x(qm).toFixed(1));
        pt.setAttribute('cy', y(pm).toFixed(1));
        root.querySelector('[data-role="q-val"]').textContent = fmt(qm, 1);
        root.querySelector('[data-role="m-val"]').textContent = fmt(dwlVal, 0);
        root.querySelector('[data-role="msg"]').textContent = `垄断厂商按 MR=MC 定产 Qm=${fmt(qm, 1)}（低于竞争产量 ${fmt(qc, 1)}），定价 Pm=${fmt(pm, 1)} > MC=${c}，获利润 ${fmt(profit, 0)}，同时造成 ${fmt(dwlVal, 0)} 社会无谓损失。`;
      }
    }

    radios.forEach(r => r.addEventListener('change', () => {
      if (r.value === 'pc') { sl.min = '8'; sl.max = '42'; sl.value = '32'; }
      else { sl.min = '10'; sl.max = '30'; sl.value = '14'; }
      draw();
    }));
    sl.addEventListener('input', draw);
    draw();
  }

  function mountSupplyElasticity(root) {
    root.innerHTML = `
      <div class="inline-visual-header">
        <span class="inline-visual-badge">交互图解</span>
        <h4>供给价格弹性：几何截距法则（交纵轴 &gt;1 · 过原点 =1 · 交横轴 &lt;1）</h4>
        <p>切换供给曲线位置并拖动价格 P，验证线性供给曲线弹性大小只取决于其与坐标轴的交点位置。</p>
      </div>
      <div class="ppf-panel micro-panel">
        <div class="ppf-chart">
          <div class="chart-caption">
            <span><i class="chart-line mv-c2-line"></i>当前供给曲线 S</span>
            <span><i class="chart-line mv-base-line"></i>过原点参考线（Es = 1）</span>
          </div>
          <svg viewBox="0 0 540 360" role="img" aria-label="供给价格弹性几何截距对比图">
            <rect x="66" y="42" width="420" height="252" class="mv-grid-box"/>
            <path class="chart-axis" d="M66 30V294H498 M61 37l5-7 5 7 M491 289l7 5-7 5" fill="none" stroke-width="1.5"/>
            <text x="14" y="18" class="axis-label">价格 P</text>
            <text x="276" y="346" text-anchor="middle" class="axis-label">供给量 Q</text>
            <g class="tick-label" text-anchor="middle"><text x="66" y="316">0</text><text x="171" y="316">25</text><text x="276" y="316">50</text><text x="381" y="316">75</text><text x="486" y="316">100</text></g>
            <g class="tick-label" text-anchor="end"><text x="56" y="235">10</text><text x="56" y="172">20</text><text x="56" y="109">30</text><text x="56" y="46">40</text></g>
            <path class="mv-base-curve" data-role="ref"/>
            <path class="mv-curve-2" data-role="curve"/>
            <path class="mv-guide" data-role="guide"/>
            <circle r="6.5" class="mv-dot-2" data-role="pt"/>
            <circle r="5" class="mv-dot-eq" data-role="intercept"/>
          </svg>
        </div>
        <div class="ppf-controls">
          <fieldset class="ppf-scenarios">
            <legend>选择线性供给曲线形态</legend>
            <label><input type="radio" name="es-type" value="elastic" checked> 与纵轴正半轴相交（富有弹性 Es &gt; 1）</label>
            <label><input type="radio" name="es-type" value="unit"> 经过原点（单位弹性 Es = 1）</label>
            <label><input type="radio" name="es-type" value="inelastic"> 与横轴正半轴相交（缺乏弹性 Es &lt; 1）</label>
            <label><input type="radio" name="es-type" value="vertical"> 垂直于横轴（完全无弹性 Es = 0）</label>
          </fieldset>
          <label class="range-label">市场价格 P <output data-role="p-out">20</output></label>
          <input type="range" data-role="p" min="12" max="36" step="2" value="20">
          <div class="ppf-outputs">
            <div><span>供给量 Qs</span><strong data-role="q-val">40</strong></div>
            <div><span>点弹性 Es</span><strong data-role="es-val">2.00</strong></div>
          </div>
          <div class="ppf-explanation" data-role="msg" aria-live="polite"></div>
        </div>
      </div>`;
    const x = q => X0 + (q / 100) * W;
    const y = p => Y0 - (p / 40) * H;
    root.querySelector('[data-role="ref"]').setAttribute('d', `M${x(0)} ${y(0)} L${x(100)} ${y(40)}`);
    const radios = [...root.querySelectorAll('input[name="es-type"]')];
    const pIn = root.querySelector('[data-role="p"]');

    function draw() {
      const mode = radios.find(r => r.checked).value;
      const p = pIn.valueAsNumber;
      let q = 0, es = 0, path = '', ix = 0, iy = 0, msg = '';
      if (mode === 'elastic') {
        // Q = -40 + 4P => P = 10 + 0.25Q (intersects P-axis at P=10)
        q = Math.max(0, -40 + 4 * p);
        es = q > 0 ? (4 * p) / q : 99;
        path = `M${x(0)} ${y(10)} L${x(100)} ${y(35)}`;
        ix = x(0); iy = y(10);
        msg = `曲线与纵轴正半轴相交（P₀=10）：任意价格下的点弹性均大于 1（当前 Es=${fmt(es, 2)}），供给富有弹性。`;
      } else if (mode === 'unit') {
        // Q = 2.5P (through origin)
        q = 2.5 * p;
        es = 1;
        path = `M${x(0)} ${y(0)} L${x(100)} ${y(40)}`;
        ix = x(0); iy = y(0);
        msg = '曲线经过原点：无论斜率陡峭还是平缓，线上任意一点的供给价格弹性恒等于 1（单位弹性）。';
      } else if (mode === 'inelastic') {
        // Q = 30 + 1.5P (intersects Q-axis at Q=30)
        q = 30 + 1.5 * p;
        es = (1.5 * p) / q;
        path = `M${x(30)} ${y(0)} L${x(90)} ${y(40)}`;
        ix = x(30); iy = y(0);
        msg = `曲线与横轴正半轴相交（Q₀=30）：任意价格下的点弹性均小于 1（当前 Es=${fmt(es, 2)}），供给缺乏弹性。`;
      } else {
        // Vertical at Q=50
        q = 50;
        es = 0;
        path = `M${x(50)} ${y(0)} L${x(50)} ${y(40)}`;
        ix = x(50); iy = y(0);
        msg = '供给曲线垂直于横轴（Es = 0）：如古董、土地或极短期鲜活农产品，价格如何变动，供给量均固定不变。';
      }
      root.querySelector('[data-role="curve"]').setAttribute('d', path);
      root.querySelector('[data-role="guide"]').setAttribute('d', `M${X0} ${y(p).toFixed(1)} H${x(q).toFixed(1)} V${Y0}`);
      root.querySelector('[data-role="pt"]').setAttribute('cx', x(q).toFixed(1));
      root.querySelector('[data-role="pt"]').setAttribute('cy', y(p).toFixed(1));
      root.querySelector('[data-role="intercept"]').setAttribute('cx', ix.toFixed(1));
      root.querySelector('[data-role="intercept"]').setAttribute('cy', iy.toFixed(1));
      root.querySelector('[data-role="p-out"]').value = String(p);
      root.querySelector('[data-role="q-val"]').textContent = fmt(q, 0);
      root.querySelector('[data-role="es-val"]').textContent = fmt(es, 2);
      root.querySelector('[data-role="msg"]').textContent = msg;
    }
    radios.forEach(r => r.addEventListener('change', draw));
    pIn.addEventListener('input', draw);
    draw();
  }

  const registry = {
    'demand-move': mountDemandMove,
    'supply-move': mountSupplyMove,
    'price-controls': mountPriceControls,
    elasticity: mountElasticity,
    'supply-elasticity': mountSupplyElasticity,
    consumer: mountConsumer,
    production: mountProduction,
    isoquant: mountIsoquant,
    cost: mountCost,
    'market-structure': mountMarketStructure,
  };

  document.querySelectorAll('[data-micro-visual]').forEach(container => {
    const fn = registry[container.dataset.microVisual];
    if (fn) fn(container);
  });
})();
