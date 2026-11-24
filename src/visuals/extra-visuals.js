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
  const X0 = 66, W = 420, Y0 = 294, H = 252;
  const wrapStatic = (title, desc, svg) => `
    <div class="inline-visual-header">
      <span class="inline-visual-badge">图解示意</span>
      <h4>${title}</h4>
      <p>${desc}</p>
    </div>
    <div class="static-svg-wrap micro-panel">${svg}</div>`;

  // 1. Chapter 04: Total Utility & Marginal Utility
  function mountTUMU(root) {
    root.innerHTML = `
      <div class="inline-visual-header">
        <span class="inline-visual-badge">交互图解</span>
        <h4>总效用（TU）与边际效用（MU）递减联动图</h4>
        <p>拖动消费数量 Q，观察每多消费 1 单位带来的边际效用 MU 递减过程，以及 MU = 0 时总效用 TU 达到最大值。</p>
      </div>
      <div class="ppf-panel micro-panel">
        <div class="ppf-chart">
          <div class="chart-caption">
            <span><i class="chart-line mv-c1-line"></i>总效用 TU</span>
            <span><i class="chart-line mv-c2-line"></i>边际效用 MU</span>
          </div>
          <svg viewBox="0 0 540 390" role="img" aria-label="总效用与边际效用联动图">
            <path class="chart-axis" d="M66 26V170H498" fill="none" stroke-width="1.4"/>
            <text x="14" y="18" class="axis-label">总效用 TU</text>
            <g class="tick-label" text-anchor="end"><text x="56" y="174">0</text><text x="56" y="106">20</text><text x="56" y="40">40</text></g>
            <path class="mv-curve-1" data-role="tu"/>

            <path class="chart-axis" d="M66 206V346H498" fill="none" stroke-width="1.4"/>
            <line class="mv-zero-line" x1="66" x2="498" y1="306" y2="306"/>
            <text x="14" y="198" class="axis-label">边际效用 MU</text>
            <g class="tick-label" text-anchor="end"><text x="56" y="310">0</text><text x="56" y="264">5</text><text x="56" y="218">10</text></g>
            <path class="mv-curve-2" data-role="mu"/>
            <line class="mv-guide" data-role="vline" y1="26" y2="346"/>
            <circle r="5.5" class="mv-dot-1" data-role="pt-tu"/>
            <circle r="5.5" class="mv-dot-2" data-role="pt-mu"/>
            <g class="tick-label" text-anchor="middle"><text x="66" y="364">0</text><text x="171" y="364">2</text><text x="276" y="364">4</text><text x="381" y="364">6</text><text x="486" y="364">8</text></g>
            <text x="276" y="384" text-anchor="middle" class="axis-label">消费数量 Q</text>
          </svg>
        </div>
        <div class="ppf-controls">
          <label class="range-label">消费数量 Q <output data-role="q-out">5</output></label>
          <input type="range" data-role="q" min="0.5" max="8" step="0.5" value="5">
          <div class="ppf-outputs">
            <div><span>总效用 TU</span><strong data-role="tu-val">25.0</strong></div>
            <div><span>边际效用 MU</span><strong data-role="mu-val">0.0</strong></div>
          </div>
          <div class="ppf-explanation" data-role="msg" aria-live="polite"></div>
          <div class="button-row">
            <button type="button" class="button button-secondary" data-jump="2">递增区间</button>
            <button type="button" class="button button-secondary" data-jump="5">饱和点(MU=0)</button>
            <button type="button" class="button button-secondary" data-jump="7">负效用区</button>
          </div>
        </div>
      </div>`;
    // TU = 10Q - Q^2 (max 25 at Q=5); MU = 10 - 2Q
    const tuFn = q => 10 * q - q * q;
    const muFn = q => 10 - 2 * q;
    const x = q => X0 + (q / 8) * W;
    const yTU = v => 170 - (v / 32) * 130;
    const yMU = v => 306 - (v / 10) * 90;
    root.querySelector('[data-role="tu"]').setAttribute('d', samplePath(tuFn, 0, 8, 60, x, yTU));
    root.querySelector('[data-role="mu"]').setAttribute('d', samplePath(muFn, 0, 8, 40, x, yMU));
    const qIn = root.querySelector('[data-role="q"]');
    function draw() {
      const q = qIn.valueAsNumber, tu = tuFn(q), mu = muFn(q), xq = x(q).toFixed(1);
      const vl = root.querySelector('[data-role="vline"]');
      vl.setAttribute('x1', xq); vl.setAttribute('x2', xq);
      root.querySelector('[data-role="pt-tu"]').setAttribute('cx', xq);
      root.querySelector('[data-role="pt-tu"]').setAttribute('cy', yTU(tu).toFixed(1));
      root.querySelector('[data-role="pt-mu"]').setAttribute('cx', xq);
      root.querySelector('[data-role="pt-mu"]').setAttribute('cy', yMU(mu).toFixed(1));
      root.querySelector('[data-role="q-out"]').value = fmt(q, 1);
      root.querySelector('[data-role="tu-val"]').textContent = fmt(tu, 1);
      root.querySelector('[data-role="mu-val"]').textContent = fmt(mu, 1);
      root.querySelector('[data-role="msg"]').textContent = mu > 0
        ? `MU=${fmt(mu, 1)} > 0：每多消费 1 单位仍带来正满足，总效用 TU 持续上升，但增速逐渐放缓。`
        : mu === 0
          ? '饱和点（Q=5, MU=0）：边际效用降为零，此时总效用 TU 达到最大值 25。'
          : `MU=${fmt(mu, 1)} < 0：过度消费产生负效用，总效用 TU 反而开始下降。`;
    }
    qIn.addEventListener('input', draw);
    root.querySelectorAll('[data-jump]').forEach(b => b.addEventListener('click', () => { qIn.value = b.dataset.jump; draw(); }));
    draw();
  }

  // 2. Chapter 06: Long-run Average Cost Envelope (static)
  function mountLACEnvelope(root) {
    root.innerHTML = wrapStatic(
      '长期平均成本（LAC）包络线与规模经济',
      '长期内厂商可自由调整工厂规模，LAC 是无数条短期平均成本曲线（SAC）的下包络线；只有在最低点 E，LAC 才与 SAC 的最低点相切。',
      `<svg viewBox="0 0 660 280" role="img" aria-label="长期平均成本包络线示意图" style="width:100%;height:auto;display:block">
        <path class="chart-axis" d="M62 28V230H618 M57 35l5-7 5 7 M611 225l7 5-7 5" fill="none" stroke-width="1.5"/>
        <text x="14" y="18" class="axis-label">平均成本 AC</text>
        <text x="340" y="268" text-anchor="middle" class="axis-label">产量 Q</text>
        <!-- Vertical split at optimal scale -->
        <line x1="340" y1="36" x2="340" y2="230" stroke="var(--control-line)" stroke-dasharray="4 4"/>
        <text x="200" y="54" text-anchor="middle" fill="var(--accent)" font-size="13" font-weight="650">规模经济（LAC 下降）</text>
        <text x="480" y="54" text-anchor="middle" fill="var(--mv-c2)" font-size="13" font-weight="650">规模不经济（LAC 上升）</text>
        <!-- SAC curves -->
        <path d="M110 72 Q175 186 245 104" fill="none" stroke="var(--control-line)" stroke-width="1.6" stroke-dasharray="4 3"/>
        <text x="128" y="88" class="tick-label">SAC₁</text>
        <path d="M250 112 Q340 226 430 112" fill="none" stroke="var(--control-line)" stroke-width="1.6" stroke-dasharray="4 3"/>
        <text x="340" y="128" text-anchor="middle" class="tick-label">SAC₂（最优规模）</text>
        <path d="M435 104 Q505 186 570 72" fill="none" stroke="var(--control-line)" stroke-width="1.6" stroke-dasharray="4 3"/>
        <text x="546" y="88" class="tick-label">SAC₃</text>
        <!-- LAC envelope -->
        <path d="M96 96 Q340 246 584 96" fill="none" stroke="var(--accent)" stroke-width="3"/>
        <text x="592" y="102" fill="var(--accent)" font-size="13.5" font-weight="700">LAC</text>
        <!-- Tangent point -->
        <circle cx="340" cy="171" r="6" class="mv-dot-eq"/>
        <text x="352" y="190" class="point-label">E（最低点相切）</text>
      </svg>`
    );
  }

  // 3. Chapter 08: Interactive Prisoner's Dilemma Matrix
  function mountPrisonersMatrix(root) {
    root.innerHTML = `
      <div class="inline-visual-header">
        <span class="inline-visual-badge">交互图解</span>
        <h4>囚徒困境 2×2 支付矩阵（点击任意格子体验纳什均衡）</h4>
        <p>括号内为（甲的刑期年数，乙的刑期年数），数字越小越好。点击不同策略组合，看双方有没有单方面改选的动机。</p>
      </div>
      <div class="ppf-panel micro-panel">
        <div class="ppf-chart" style="padding:16px">
          <div class="game-matrix" role="grid" aria-label="囚徒困境支付矩阵">
            <div class="gm-corner">甲 \\ 乙</div>
            <div class="gm-head">乙：坦白</div>
            <div class="gm-head">乙：抵赖</div>
            <div class="gm-head">甲：坦白</div>
            <button type="button" class="gm-cell active" data-cell="cc"><strong>(-8年, -8年)</strong><small>纳什均衡 ★</small></button>
            <button type="button" class="gm-cell" data-cell="cd"><strong>(0年, -10年)</strong><small>甲占便宜</small></button>
            <div class="gm-head">甲：抵赖</div>
            <button type="button" class="gm-cell" data-cell="dc"><strong>(-10年, 0年)</strong><small>乙占便宜</small></button>
            <button type="button" class="gm-cell" data-cell="dd"><strong>(-1年, -1年)</strong><small>帕累托最优</small></button>
          </div>
        </div>
        <div class="ppf-controls">
          <h5>策略稳定性分析</h5>
          <div class="ppf-explanation" data-role="msg" aria-live="polite"></div>
        </div>
      </div>`;
    const notes = {
      cc: '【(坦白, 坦白) → 唯一纳什均衡】无论对方选什么，自己选「坦白」刑期都更短（0>-1 且 -8>-10），因此「坦白」是双方的严格占优策略，任何一方单方面改选抵赖都会从 -8 年恶化到 -10 年。',
      cd: '【(坦白, 抵赖) → 不稳定】此时乙判 10 年；只要乙单方面改成「坦白」，就能把刑期从 10 年减到 8 年，因此乙有强烈动机偏离，最终滑向 (坦白, 坦白)。',
      dc: '【(抵赖, 坦白) → 不稳定】此时甲判 10 年；只要甲单方面改成「坦白」，就能把刑期从 10 年减到 8 年，因此甲会立刻偏离，滑向 (坦白, 坦白)。',
      dd: '【(抵赖, 抵赖) → 帕累托最优但不稳定】虽然两人各判 1 年集体总福利最好，但给定对方抵赖，自己单方面背叛改为坦白可以无罪释放（0 年），所以缺乏约束机制时合作会瓦解。',
    };
    const cells = [...root.querySelectorAll('[data-cell]')];
    function select(key) {
      cells.forEach(c => c.classList.toggle('active', c.dataset.cell === key));
      root.querySelector('[data-role="msg"]').textContent = notes[key];
    }
    cells.forEach(c => c.addEventListener('click', () => select(c.dataset.cell)));
    select('cc');
  }

  // 4. Chapter 09: Lorenz Curve & Gini Coefficient
  function mountLorenzGini(root) {
    root.innerHTML = `
      <div class="inline-visual-header">
        <span class="inline-visual-badge">交互图解</span>
        <h4>洛伦兹曲线与基尼系数（G = A / (A + B)）</h4>
        <p>拖动收入分配不平等程度，观察洛伦兹曲线弯曲幅度与阴影面积 A 的变化，直观理解基尼系数 0.4 警戒线。</p>
      </div>
      <div class="ppf-panel micro-panel">
        <div class="ppf-chart">
          <div class="chart-caption">
            <span><i class="chart-line mv-base-line"></i>绝对平等线（45°）</span>
            <span><i class="chart-line mv-c1-line"></i>洛伦兹曲线</span>
            <span><i class="mv-swatch mv-cs"></i>不平等面积 A</span>
          </div>
          <svg viewBox="0 0 540 360" role="img" aria-label="洛伦兹曲线与基尼系数交互图">
            <rect x="66" y="42" width="420" height="252" class="mv-grid-box"/>
            <path class="chart-axis" d="M66 30V294H498 M61 37l5-7 5 7 M491 289l7 5-7 5" fill="none" stroke-width="1.5"/>
            <text x="14" y="18" class="axis-label">累计收入占比 (%)</text>
            <text x="276" y="346" text-anchor="middle" class="axis-label">累计人口占比（从低收入到高收入 %）</text>
            <g class="tick-label" text-anchor="middle"><text x="66" y="316">0%</text><text x="171" y="316">25%</text><text x="276" y="316">50%</text><text x="381" y="316">75%</text><text x="486" y="316">100%</text></g>
            <g class="tick-label" text-anchor="end"><text x="56" y="235">25%</text><text x="56" y="172">50%</text><text x="56" y="109">75%</text><text x="56" y="46">100%</text></g>
            <path class="mv-fill-cs" data-role="area-a"/>
            <line class="mv-base-curve" x1="66" y1="294" x2="486" y2="42"/>
            <path class="mv-curve-1" data-role="curve"/>
            <text x="248" y="196" class="point-label" data-role="lbl-a">A</text>
            <text x="382" y="246" class="tick-label" style="font-size:14px">B</text>
          </svg>
        </div>
        <div class="ppf-controls">
          <label class="range-label">弯曲指数 k（1=绝对平等，越大越不平等）<output data-role="k-out">2.3</output></label>
          <input type="range" data-role="k" min="1" max="5" step="0.1" value="2.3">
          <div class="ppf-outputs">
            <div><span>基尼系数 G</span><strong data-role="g-val">0.39</strong></div>
            <div><span>后 50% 人口收入占比</span><strong data-role="b50-val">20%</strong></div>
          </div>
          <div class="ppf-explanation" data-role="msg" aria-live="polite"></div>
        </div>
      </div>`;
    // L(p) = p^k => Gini = (k - 1)/(k + 1)
    const x = p => X0 + p * W;
    const y = v => Y0 - v * H;
    const kIn = root.querySelector('[data-role="k"]');
    function draw() {
      const k = kIn.valueAsNumber;
      const gini = (k - 1) / (k + 1);
      const b50 = Math.pow(0.5, k) * 100;
      const curveD = samplePath(p => Math.pow(p, k), 0, 1, 50, x, y);
      root.querySelector('[data-role="curve"]').setAttribute('d', curveD);
      root.querySelector('[data-role="area-a"]').setAttribute('d', curveD + ` L${x(0)} ${y(0)} Z`);
      root.querySelector('[data-role="k-out"]').value = fmt(k, 1);
      root.querySelector('[data-role="g-val"]').textContent = fmt(gini, 2);
      root.querySelector('[data-role="b50-val"]').textContent = fmt(b50, 0) + '%';
      root.querySelector('[data-role="msg"]').textContent = gini < 0.2
        ? 'G < 0.2：收入分配高度平均，洛伦兹曲线紧贴 45° 绝对平等线。'
        : gini < 0.4
          ? `G = ${fmt(gini, 2)}（0.2~0.4）：处于相对合理区间；收入较低的一半人口占总收入的 ${fmt(b50, 0)}%。`
          : `G = ${fmt(gini, 2)} ≥ 0.4：超过国际常用的收入差距警戒线，洛伦兹曲线明显向右下方弯曲。`;
    }
    kIn.addEventListener('input', draw);
    draw();
  }

  // 5. Chapter 09: Backward-bending Labour Supply Curve (static)
  function mountLabourSupply(root) {
    root.innerHTML = wrapStatic(
      '向后弯曲的个人劳动供给曲线',
      '工资上涨同时产生「替代效应（多干活）」与「收入效应（多买闲暇）」；当工资高过拐点 W* 后，收入效应压过替代效应，劳动供给反向减少。',
      `<svg viewBox="0 0 640 270" role="img" aria-label="向后弯曲的劳动供给曲线示意图" style="width:100%;height:auto;display:block">
        <path class="chart-axis" d="M66 28V224H580 M61 35l5-7 5 7 M573 219l7 5-7 5" fill="none" stroke-width="1.5"/>
        <text x="14" y="18" class="axis-label">工资率 W</text>
        <text x="323" y="258" text-anchor="middle" class="axis-label">劳动供给时间 L</text>
        <path d="M130 210 C250 184 320 156 320 124 C320 88 265 64 210 42" fill="none" stroke="var(--accent)" stroke-width="3"/>
        <line x1="66" y1="124" x2="320" y2="124" stroke="var(--control-line)" stroke-dasharray="4 4"/>
        <circle cx="320" cy="124" r="6" class="mv-dot-eq"/>
        <text x="48" y="128" text-anchor="end" class="tick-label">W*</text>
        <text x="336" y="128" class="point-label">拐点（替代效应 = 收入效应）</text>
        <text x="336" y="76" fill="var(--mv-c2)" font-size="13" font-weight="650">W &gt; W*：收入效应 &gt; 替代效应（高薪更愿享受闲暇，曲线后弯）</text>
        <text x="336" y="182" fill="var(--accent)" font-size="13" font-weight="650">W &lt; W*：替代效应 &gt; 收入效应（加薪吸引增加工时，曲线右倾）</text>
      </svg>`
    );
  }

  // 6. Chapter 10: Negative Externality & Pigouvian Tax
  function mountExternality(root) {
    root.innerHTML = `
      <div class="inline-visual-header">
        <span class="inline-visual-badge">交互图解</span>
        <h4>负外部性与庇古税：私人成本（MPC）vs 社会成本（MSC）</h4>
        <p>拖动“庇古税税率 t”，看如何将外部污染成本内部化，使市场产量从过度生产的 Qm 收敛到社会最优产量 Q*。</p>
      </div>
      <div class="ppf-panel micro-panel">
        <div class="ppf-chart">
          <div class="chart-caption">
            <span><i class="chart-line mv-c1-line"></i>需求 D = MSB</span>
            <span><i class="chart-line mv-base-line"></i>私人成本 MPC</span>
            <span><i class="chart-line mv-c2-line"></i>社会成本 MSC</span>
            <span><i class="mv-swatch mv-dwl"></i>剩余无谓损失</span>
          </div>
          <svg viewBox="0 0 540 360" role="img" aria-label="负外部性与庇古税纠正图">
            <rect x="66" y="42" width="420" height="252" class="mv-grid-box"/>
            <path class="chart-axis" d="M66 30V294H498 M61 37l5-7 5 7 M491 289l7 5-7 5" fill="none" stroke-width="1.5"/>
            <text x="14" y="18" class="axis-label">价格 / 成本</text>
            <text x="276" y="346" text-anchor="middle" class="axis-label">产量 Q</text>
            <g class="tick-label" text-anchor="middle"><text x="66" y="316">0</text><text x="171" y="316">20</text><text x="276" y="316">40</text><text x="381" y="316">60</text><text x="486" y="316">80</text></g>
            <g class="tick-label" text-anchor="end"><text x="56" y="248">10</text><text x="56" y="197">20</text><text x="56" y="147">30</text><text x="56" y="96">40</text><text x="56" y="46">50</text></g>
            <polygon class="mv-fill-dwl" data-role="dwl"/>
            <path class="mv-curve-1" data-role="d"/>
            <path class="mv-base-curve" data-role="mpc"/>
            <path class="mv-curve-2" data-role="msc"/>
            <path class="mv-curve-3" data-role="tax-s"/>
            <circle r="5.5" class="mv-dot-2" data-role="opt"/>
            <circle r="6" class="mv-dot-eq" data-role="cur"/>
            <text class="point-label" data-role="lbl-opt">E*</text>
          </svg>
        </div>
        <div class="ppf-controls">
          <label class="range-label">庇古税税率 t（单位外部成本 = 10）<output data-role="t-out">0</output></label>
          <input type="range" data-role="t" min="0" max="14" step="1" value="0">
          <div class="ppf-outputs">
            <div><span>实际产量 Q</span><strong data-role="q-val">40</strong></div>
            <div><span>社会最优 Q*</span><strong>30</strong></div>
          </div>
          <div class="ppf-explanation" data-role="msg" aria-live="polite"></div>
          <div class="button-row"><button type="button" class="button button-primary" data-role="best">设为最优庇古税 (t=10)</button></div>
        </div>
      </div>`;
    // D: P = 50 - 0.5Q; MPC: P = 10 + 0.5Q (Qm=40, Pm=30); MSC: P = 20 + 0.5Q (Q*=30, P*=35)
    const x = q => X0 + (q / 80) * W;
    const y = p => Y0 - (p / 50) * H;
    root.querySelector('[data-role="d"]').setAttribute('d', `M${x(0)} ${y(50)} L${x(80)} ${y(10)}`);
    root.querySelector('[data-role="mpc"]').setAttribute('d', `M${x(0)} ${y(10)} L${x(80)} ${y(50)}`);
    root.querySelector('[data-role="msc"]').setAttribute('d', `M${x(0)} ${y(20)} L${x(60)} ${y(50)}`);
    root.querySelector('[data-role="opt"]').setAttribute('cx', x(30));
    root.querySelector('[data-role="opt"]').setAttribute('cy', y(35));
    root.querySelector('[data-role="lbl-opt"]').setAttribute('x', x(30) - 18);
    root.querySelector('[data-role="lbl-opt"]').setAttribute('y', y(35) - 10);
    const tIn = root.querySelector('[data-role="t"]');
    function draw() {
      const t = tIn.valueAsNumber;
      const q = 40 - t;
      const p = 50 - 0.5 * q;
      const mscAtQ = 20 + 0.5 * q;
      root.querySelector('[data-role="tax-s"]').setAttribute('d', `M${x(0)} ${y(10 + t)} L${x(Math.min(80, 80 - 2 * t))} ${y(Math.min(50, 50 + t - Math.max(0, t)))}`);
      root.querySelector('[data-role="cur"]').setAttribute('cx', x(q).toFixed(1));
      root.querySelector('[data-role="cur"]').setAttribute('cy', y(p).toFixed(1));
      root.querySelector('[data-role="dwl"]').setAttribute('points', Math.abs(q - 30) < 0.1 ? '' : `${x(30).toFixed(1)},${y(35).toFixed(1)} ${x(q).toFixed(1)},${y(p).toFixed(1)} ${x(q).toFixed(1)},${y(mscAtQ).toFixed(1)}`);
      root.querySelector('[data-role="t-out"]').value = String(t);
      root.querySelector('[data-role="q-val"]').textContent = String(q);
      root.querySelector('[data-role="msg"]').textContent = t === 0
        ? '未征税时，厂商只考虑私人成本 MPC，市场过度生产（Q=40 > Q*=30），红色三角为负外部性造成的社会无谓损失。'
        : t === 10
          ? '庇古税 t=10 恰好等于边际外部成本：税后供给曲线与 MSC 重合，市场自动收敛到社会最优产量 Q*=30，无谓损失清零！'
          : t < 10
            ? `税率 t=${t} 偏低：产量降至 ${q}，无谓损失明显缩小，但仍高于社会最优产量 30。`
            : `税率 t=${t} 过高：过度征税导致产量降至 ${q}（低于社会最优 30），反而产生新的效率损失。`;
    }
    tIn.addEventListener('input', draw);
    root.querySelector('[data-role="best"]').addEventListener('click', () => { tIn.value = '10'; draw(); });
    draw();
  }

  // 7. Chapter 11: Keynesian 45-degree Cross & Multiplier
  function mountKeynesCross(root) {
    root.innerHTML = `
      <div class="inline-visual-header">
        <span class="inline-visual-badge">交互图解</span>
        <h4>凯恩斯 45° 交叉图与支出乘数效应（k = 1 / (1 − MPC)）</h4>
        <p>增加自发支出 ΔA 或调高边际消费倾向 MPC，观察计划支出线 AE 上移后均衡产出 Y* 被成倍放大的效果。</p>
      </div>
      <div class="ppf-panel micro-panel">
        <div class="ppf-chart">
          <div class="chart-caption">
            <span><i class="chart-line mv-base-line"></i>45° 均衡线（AE = Y）</span>
            <span><i class="chart-line mv-c1-line"></i>当前计划支出 AE</span>
            <span><i class="chart-line mv-c3-line"></i>初始 AE₀</span>
          </div>
          <svg viewBox="0 0 540 360" role="img" aria-label="凯恩斯45度交叉图">
            <rect x="66" y="42" width="420" height="252" class="mv-grid-box"/>
            <path class="chart-axis" d="M66 30V294H498 M61 37l5-7 5 7 M491 289l7 5-7 5" fill="none" stroke-width="1.5"/>
            <text x="14" y="18" class="axis-label">计划支出 AE</text>
            <text x="276" y="346" text-anchor="middle" class="axis-label">国民产出 Y</text>
            <g class="tick-label" text-anchor="middle"><text x="66" y="316">0</text><text x="171" y="316">100</text><text x="276" y="316">200</text><text x="381" y="316">300</text><text x="486" y="316">400</text></g>
            <g class="tick-label" text-anchor="end"><text x="56" y="235">100</text><text x="56" y="172">200</text><text x="56" y="109">300</text><text x="56" y="46">400</text></g>
            <line class="mv-base-curve" x1="66" y1="294" x2="486" y2="42"/>
            <path class="mv-curve-3" data-role="ae0"/>
            <path class="mv-curve-1" data-role="ae1"/>
            <path class="mv-guide" data-role="guide"/>
            <circle r="6" class="mv-dot-eq" data-role="pt"/>
            <text class="point-label" data-role="lbl">E*</text>
          </svg>
        </div>
        <div class="ppf-controls">
          <label class="range-label">新增自发支出 ΔA（基准 A₀=50）<output data-role="a-out">+0</output></label>
          <input type="range" data-role="da" min="0" max="40" step="5" value="0">
          <label class="range-label">边际消费倾向 MPC <output data-role="c-out">0.75</output></label>
          <input type="range" data-role="mpc" min="0.5" max="0.8" step="0.05" value="0.75">
          <div class="ppf-outputs">
            <div><span>支出乘数 k</span><strong data-role="k-val">4.0×</strong></div>
            <div><span>均衡产出 Y*</span><strong data-role="y-val">200</strong></div>
          </div>
          <div class="ppf-explanation" data-role="msg" aria-live="polite"></div>
        </div>
      </div>`;
    const x = v => X0 + (v / 400) * W;
    const y = v => Y0 - (v / 400) * H;
    const daIn = root.querySelector('[data-role="da"]');
    const cIn = root.querySelector('[data-role="mpc"]');
    function draw() {
      const da = daIn.valueAsNumber, c = cIn.valueAsNumber;
      const k = 1 / (1 - c);
      const y0 = 50 * k;
      const ys = (50 + da) * k;
      const aePath = a => `M${x(0).toFixed(1)} ${y(a).toFixed(1)} L${x(400).toFixed(1)} ${y(Math.min(400, a + c * 400)).toFixed(1)}`;
      root.querySelector('[data-role="ae0"]').setAttribute('d', aePath(50));
      root.querySelector('[data-role="ae1"]').setAttribute('d', aePath(50 + da));
      const yc = Math.min(400, ys);
      root.querySelector('[data-role="guide"]').setAttribute('d', `M${X0} ${y(yc).toFixed(1)} H${x(yc).toFixed(1)} V${Y0}`);
      root.querySelector('[data-role="pt"]').setAttribute('cx', x(yc).toFixed(1));
      root.querySelector('[data-role="pt"]').setAttribute('cy', y(yc).toFixed(1));
      root.querySelector('[data-role="lbl"]').setAttribute('x', (x(yc) + 10).toFixed(1));
      root.querySelector('[data-role="lbl"]').setAttribute('y', (y(yc) - 10).toFixed(1));
      root.querySelector('[data-role="a-out"]').value = '+' + da;
      root.querySelector('[data-role="c-out"]').value = fmt(c, 2);
      root.querySelector('[data-role="k-val"]').textContent = fmt(k, 1) + '×';
      root.querySelector('[data-role="y-val"]').textContent = fmt(ys, 0);
      root.querySelector('[data-role="msg"]').textContent = da === 0
        ? `当前 MPC=${fmt(c, 2)}，支出乘数 k=${fmt(k, 1)}。试着增加自发支出 ΔA，观察产出增量如何等于 ΔA × ${fmt(k, 1)}。`
        : `自发支出仅增加 +${da}，经过乘数 k=${fmt(k, 1)} 放大后，均衡产出从 ${fmt(y0, 0)} 跃升至 ${fmt(ys, 0)}（净增 +${fmt(ys - y0, 0)}）。`;
    }
    daIn.addEventListener('input', draw);
    cIn.addEventListener('input', draw);
    draw();
  }

  // 8. Chapter 15: LM Three Regions Policy Effectiveness
  function mountLMRegions(root) {
    root.innerHTML = `
      <div class="inline-visual-header">
        <span class="inline-visual-badge">交互图解</span>
        <h4>LM 三区间：财政政策与货币政策的有效性对比</h4>
        <p>切换经济所处的 LM 区间（凯恩斯陷阱 / 中间区域 / 古典区域），对比扩张性财政政策（IS 右移）的效果与挤出程度。</p>
      </div>
      <div class="ppf-panel micro-panel">
        <div class="ppf-chart">
          <div class="chart-caption">
            <span><i class="chart-line mv-c2-line"></i>完整 LM 曲线</span>
            <span><i class="chart-line mv-base-line"></i>初始 IS₀</span>
            <span><i class="chart-line mv-c1-line"></i>扩张财政后 IS₁</span>
          </div>
          <svg viewBox="0 0 540 360" role="img" aria-label="LM三区间政策有效性对比图">
            <rect x="66" y="42" width="140" height="252" fill="var(--accent-soft)" opacity=".45"/>
            <rect x="376" y="42" width="110" height="252" fill="var(--warning-soft)" opacity=".45"/>
            <path class="chart-axis" d="M66 30V294H498 M61 37l5-7 5 7 M491 289l7 5-7 5" fill="none" stroke-width="1.5"/>
            <text x="14" y="18" class="axis-label">利率 r</text>
            <text x="276" y="346" text-anchor="middle" class="axis-label">国民产出 Y</text>
            <g class="tick-label" text-anchor="middle">
              <text x="136" y="316">凯恩斯区（水平）</text>
              <text x="291" y="316">中间区（右倾）</text>
              <text x="431" y="316">古典区（垂直）</text>
            </g>
            <!-- Full LM: horizontal [66..206] at y=248, sloped [206..416] to y=110, vertical at x=416 up to y=48 -->
            <path d="M66 248 L206 248 L416 110 L416 48" fill="none" class="mv-curve-2"/>
            <path class="mv-base-curve" data-role="is0"/>
            <path class="mv-curve-1" data-role="is1"/>
            <circle r="5" class="mv-dot-3" data-role="e0"/>
            <circle r="6.5" class="mv-dot-1" data-role="e1"/>
          </svg>
        </div>
        <div class="ppf-controls">
          <fieldset class="ppf-scenarios">
            <legend>选择当前所处 LM 区间</legend>
            <label><input type="radio" name="lmr" value="keynes" checked> 凯恩斯区域（流动性陷阱）</label>
            <label><input type="radio" name="lmr" value="mid"> 中间区域（常态经济）</label>
            <label><input type="radio" name="lmr" value="classic"> 古典区域（充分就业上限）</label>
          </fieldset>
          <div class="ppf-outputs">
            <div><span>财政政策效果</span><strong data-role="f-val">极有效</strong></div>
            <div><span>货币政策效果</span><strong data-role="m-val">完全无效</strong></div>
          </div>
          <div class="ppf-explanation" data-role="msg" aria-live="polite"></div>
        </div>
      </div>`;
    const cfg = {
      keynes: { is0: 'M92 174 L164 276', is1: 'M128 174 L200 276', e0: [144, 248], e1: [180, 248], f: '完全有效', m: '无效', msg: '凯恩斯区域（流动性陷阱）：利率已低至底线，增发货币全被持有为现金（货币政策无效）；扩张财政使 IS 右移不推高利率，无挤出效应，财政政策完全有效。' },
      mid: { is0: 'M216 96 L356 264', is1: 'M260 96 L400 264', e0: [292, 191], e1: [324, 170], f: '部分有效', m: '部分有效', msg: '中间区域：扩张财政使产出上升、利率温和上行，存在「部分挤出效应」；财政政策与货币政策均有效，适合搭配使用。' },
      classic: { is0: 'M348 106 L466 218', is1: 'M366 64 L484 176', e0: [416, 171], e1: [416, 111], f: '完全无效', m: '完全有效', msg: '古典区域（垂直 LM）：产出已达上限，扩张财政只会把利率推高，导致私人投资被「100% 完全挤出」（财政无效）；此时货币政策完全有效。' },
    };
    const radios = [...root.querySelectorAll('input[name="lmr"]')];
    function draw() {
      const c = cfg[radios.find(r => r.checked).value];
      root.querySelector('[data-role="is0"]').setAttribute('d', c.is0);
      root.querySelector('[data-role="is1"]').setAttribute('d', c.is1);
      root.querySelector('[data-role="e0"]').setAttribute('cx', c.e0[0]);
      root.querySelector('[data-role="e0"]').setAttribute('cy', c.e0[1]);
      root.querySelector('[data-role="e1"]').setAttribute('cx', c.e1[0]);
      root.querySelector('[data-role="e1"]').setAttribute('cy', c.e1[1]);
      root.querySelector('[data-role="f-val"]').textContent = c.f;
      root.querySelector('[data-role="m-val"]').textContent = c.m;
      root.querySelector('[data-role="msg"]').textContent = c.msg;
    }
    radios.forEach(r => r.addEventListener('change', draw));
    draw();
  }

  // 9. Chapter 17: Solow Growth Model Steady State
  function mountSolow(root) {
    root.innerHTML = `
      <div class="inline-visual-header">
        <span class="inline-visual-badge">交互图解</span>
        <h4>索罗增长模型：储蓄率、折旧率与人均资本稳态 k*</h4>
        <p>调节储蓄率 s 或折旧率 δ，观察实际投资曲线 s·f(k) 与持平投资线 δ·k 的交点（稳态 k*）如何移动。</p>
      </div>
      <div class="ppf-panel micro-panel">
        <div class="ppf-chart">
          <div class="chart-caption">
            <span><i class="chart-line mv-base-line"></i>人均产出 y = f(k)</span>
            <span><i class="chart-line mv-c1-line"></i>人均投资 s·f(k)</span>
            <span><i class="chart-line mv-c2-line"></i>折旧线 δ·k</span>
          </div>
          <svg viewBox="0 0 540 360" role="img" aria-label="索罗增长模型稳态互动图">
            <rect x="66" y="42" width="420" height="252" class="mv-grid-box"/>
            <path class="chart-axis" d="M66 30V294H498 M61 37l5-7 5 7 M491 289l7 5-7 5" fill="none" stroke-width="1.5"/>
            <text x="14" y="18" class="axis-label">人均产出 / 投资</text>
            <text x="276" y="346" text-anchor="middle" class="axis-label">人均资本存量 k</text>
            <g class="tick-label" text-anchor="middle"><text x="66" y="316">0</text><text x="171" y="316">25</text><text x="276" y="316">50</text><text x="381" y="316">75</text><text x="486" y="316">100</text></g>
            <g class="tick-label" text-anchor="end"><text x="56" y="235">3</text><text x="56" y="172">6</text><text x="56" y="109">9</text><text x="56" y="46">12</text></g>
            <path class="mv-base-curve" data-role="yk"/>
            <path class="mv-curve-1" data-role="sfk"/>
            <path class="mv-curve-2" data-role="dk"/>
            <path class="mv-guide" data-role="guide"/>
            <circle r="6" class="mv-dot-eq" data-role="pt"/>
            <text class="point-label" data-role="lbl">k*</text>
          </svg>
        </div>
        <div class="ppf-controls">
          <label class="range-label">储蓄率 s <output data-role="s-out">35%</output></label>
          <input type="range" data-role="s" min="15" max="60" step="5" value="35">
          <label class="range-label">折旧率 δ <output data-role="d-out">5%</output></label>
          <input type="range" data-role="d" min="3" max="10" step="1" value="5">
          <div class="ppf-outputs">
            <div><span>稳态人均资本 k*</span><strong data-role="k-val">49</strong></div>
            <div><span>稳态人均产出 y*</span><strong data-role="y-val">7.0</strong></div>
          </div>
          <div class="ppf-explanation" data-role="msg" aria-live="polite"></div>
        </div>
      </div>`;
    // y = sqrt(k), s*sqrt(k) = d*k => k* = (s/d)^2, y* = s/d
    const x = k => X0 + (k / 100) * W;
    const y = v => Y0 - (Math.min(12, v) / 12) * H;
    root.querySelector('[data-role="yk"]').setAttribute('d', samplePath(k => Math.sqrt(k), 0, 100, 60, x, y));
    const sIn = root.querySelector('[data-role="s"]');
    const dIn = root.querySelector('[data-role="d"]');
    function draw() {
      const s = sIn.valueAsNumber / 100, d = dIn.valueAsNumber / 100;
      const ks = Math.pow(s / d, 2);
      const ys = s / d;
      const inv = d * ks;
      root.querySelector('[data-role="sfk"]').setAttribute('d', samplePath(k => s * Math.sqrt(k), 0, 100, 60, x, y));
      const kEnd = Math.min(100, 12 / d);
      root.querySelector('[data-role="dk"]').setAttribute('d', `M${x(0)} ${y(0)} L${x(kEnd).toFixed(1)} ${y(d * kEnd).toFixed(1)}`);
      const kc = Math.min(100, ks), ic = Math.min(12, inv);
      root.querySelector('[data-role="guide"]').setAttribute('d', `M${X0} ${y(ic).toFixed(1)} H${x(kc).toFixed(1)} V${Y0}`);
      root.querySelector('[data-role="pt"]').setAttribute('cx', x(kc).toFixed(1));
      root.querySelector('[data-role="pt"]').setAttribute('cy', y(ic).toFixed(1));
      root.querySelector('[data-role="lbl"]').setAttribute('x', (x(kc) + 10).toFixed(1));
      root.querySelector('[data-role="lbl"]').setAttribute('y', (y(ic) - 10).toFixed(1));
      root.querySelector('[data-role="s-out"]').value = sIn.value + '%';
      root.querySelector('[data-role="d-out"]').value = dIn.value + '%';
      root.querySelector('[data-role="k-val"]').textContent = fmt(ks, 0);
      root.querySelector('[data-role="y-val"]').textContent = fmt(ys, 1);
      root.querySelector('[data-role="msg"]').textContent = `稳态 k* = (s/δ)² = ${fmt(ks, 0)}，人均产出 y* = ${fmt(ys, 1)}。提高储蓄率 s 只能提升稳态「水平」，在无技术进步时无法永久提高长期「增长率」。`;
    }
    sIn.addEventListener('input', draw);
    dIn.addEventListener('input', draw);
    draw();
  }

  // 10. Chapter 23: Balance of Payments Account Structure (static)
  function mountBOPStructure(root) {
    root.innerHTML = wrapStatic(
      '国际收支平衡表（BOP）账户结构与恒等关系',
      '按复式记账法编制，账面总额恒等于 0：经常账户 + 资本和金融账户（不含储备） + 储备资产变动 + 净误差与遗漏 = 0。',
      `<svg viewBox="0 0 680 236" role="img" aria-label="国际收支平衡表账户结构图" style="width:100%;height:auto;display:block">
        <g text-anchor="middle">
          <rect x="16" y="16" width="154" height="132" rx="9" fill="var(--accent-soft)" stroke="var(--accent-line)" stroke-width="1.6"/>
          <text x="93" y="42" fill="var(--accent)" font-size="13.5" font-weight="700">经常账户</text>
          <text x="93" y="68" fill="var(--text)" font-size="12">• 货物贸易</text>
          <text x="93" y="90" fill="var(--text)" font-size="12">• 服务贸易</text>
          <text x="93" y="112" fill="var(--text)" font-size="12">• 初次收入(股息/利息)</text>
          <text x="93" y="134" fill="var(--text)" font-size="12">• 二次收入(无偿转移)</text>

          <text x="182" y="88" fill="var(--heading)" font-size="18" font-weight="700">+</text>

          <rect x="194" y="16" width="154" height="132" rx="9" fill="var(--surface)" stroke="var(--line)" stroke-width="1.5"/>
          <text x="271" y="42" fill="var(--heading)" font-size="13.5" font-weight="700">资本与金融账户</text>
          <text x="271" y="68" fill="var(--text)" font-size="12">• 直接投资（FDI）</text>
          <text x="271" y="90" fill="var(--text)" font-size="12">• 证券投资（股/债）</text>
          <text x="271" y="112" fill="var(--text)" font-size="12">• 金融衍生品</text>
          <text x="271" y="134" fill="var(--text)" font-size="12">• 贷款与其他投资</text>

          <text x="360" y="88" fill="var(--heading)" font-size="18" font-weight="700">+</text>

          <rect x="372" y="16" width="144" height="132" rx="9" fill="var(--surface)" stroke="var(--mv-c2)" stroke-width="1.5"/>
          <text x="444" y="42" fill="var(--mv-c2)" font-size="13.5" font-weight="700">储备资产变动</text>
          <text x="444" y="68" fill="var(--text)" font-size="12">• 外汇储备</text>
          <text x="444" y="90" fill="var(--text)" font-size="12">• 货币黄金</text>
          <text x="444" y="112" fill="var(--text)" font-size="12">• 特别提款权 SDR</text>
          <text x="444" y="134" fill="var(--text)" font-size="12">• IMF 储备头寸</text>

          <text x="528" y="88" fill="var(--heading)" font-size="18" font-weight="700">+</text>

          <rect x="540" y="16" width="124" height="132" rx="9" fill="var(--surface-subtle)" stroke="var(--control-line)" stroke-dasharray="4 3"/>
          <text x="602" y="64" fill="var(--heading)" font-size="13" font-weight="680">净误差与遗漏</text>
          <text x="602" y="90" fill="var(--muted)" font-size="11.5">统计口径差异</text>
          <text x="602" y="110" fill="var(--muted)" font-size="11.5">与漏报轧平项</text>
        </g>
        <rect x="16" y="164" width="648" height="54" rx="8" fill="var(--surface)" stroke="var(--line)"/>
        <text x="340" y="187" text-anchor="middle" fill="var(--heading)" font-size="12.5" font-weight="650">高频考点：国际收支「顺差 / 逆差」通常指前两项（自主性交易）之和；</text>
        <text x="340" y="207" text-anchor="middle" fill="var(--muted)" font-size="12">顺差导致外汇储备增加（在储备资产项下记为借方负号），从而使整张平衡表借贷轧平为 0。</text>
      </svg>`
    );
  }

  // 11. Chapter 25: Financial Repression Interest Ceiling Gap (static)
  function mountRepressionGap(root) {
    root.innerHTML = wrapStatic(
      '金融抑制：人为利率上限导致的储蓄萎缩与信贷配给缺口',
      '麦金农—肖模型核心图示：政府将实际利率压低在均衡利率 r* 以下（r₀），导致实际储蓄不足、投资需求过剩，只能依靠非市场信贷配给。',
      `<svg viewBox="0 0 640 276" role="img" aria-label="金融抑制利率上限与资金缺口图" style="width:100%;height:auto;display:block">
        <path class="chart-axis" d="M66 28V226H580 M61 35l5-7 5 7 M573 221l7 5-7 5" fill="none" stroke-width="1.5"/>
        <text x="14" y="18" class="axis-label">实际利率 r</text>
        <text x="323" y="262" text-anchor="middle" class="axis-label">储蓄 S / 投资 I</text>
        <!-- I curve downward, S curve upward -->
        <path d="M126 52 L506 208" fill="none" stroke="var(--accent)" stroke-width="2.6"/>
        <text x="514" y="212" fill="var(--accent)" font-size="13" font-weight="680">投资需求 I(r)</text>
        <path d="M126 208 L506 52" fill="none" stroke="var(--mv-c2)" stroke-width="2.6"/>
        <text x="514" y="56" fill="var(--mv-c2)" font-size="13" font-weight="680">储蓄供给 S(r)</text>
        <!-- Equilibrium -->
        <circle cx="316" cy="130" r="5.5" class="mv-dot-eq"/>
        <line x1="66" y1="130" x2="316" y2="130" stroke="var(--control-line)" stroke-dasharray="4 4"/>
        <text x="56" y="134" text-anchor="end" class="tick-label">r*</text>
        <text x="326" y="122" class="point-label">E*（市场均衡）</text>
        <!-- Ceiling r0 -->
        <line x1="66" y1="176" x2="540" y2="176" stroke="var(--error)" stroke-width="2" stroke-dasharray="6 4"/>
        <text x="56" y="180" text-anchor="end" fill="var(--error)" font-size="12.5" font-weight="680">r₀</text>
        <line x1="204" y1="176" x2="204" y2="226" stroke="var(--control-line)" stroke-dasharray="3 3"/>
        <line x1="428" y1="176" x2="428" y2="226" stroke="var(--control-line)" stroke-dasharray="3 3"/>
        <text x="204" y="242" text-anchor="middle" class="tick-label">实际储蓄 S₀</text>
        <text x="428" y="242" text-anchor="middle" class="tick-label">投资需求 I₀</text>
        <line x1="208" y1="176" x2="424" y2="176" stroke="var(--error)" stroke-width="4.5" opacity=".45"/>
        <text x="316" y="168" text-anchor="middle" fill="var(--error)" font-size="12.5" font-weight="680">资金短缺 / 非价格信贷配给区</text>
      </svg>`
    );
  }

  // 12. Chapter 26: Risk Management 4-Quadrant Matrix (static)
  function mountRiskMatrix(root) {
    root.innerHTML = wrapStatic(
      '风险管理四象限矩阵：按「损失频率 × 损失程度」选工具',
      '保险最适合处理「低频率、高损失」的风险；高频低损靠自留与防损，高频高损则应直接回避。',
      `<svg viewBox="0 0 660 272" role="img" aria-label="风险管理四象限矩阵图" style="width:100%;height:auto;display:block">
        <text x="364" y="20" text-anchor="middle" class="axis-label">损失频率（发生可能性）</text>
        <text x="234" y="42" text-anchor="middle" class="tick-label">低频率</text>
        <text x="494" y="42" text-anchor="middle" class="tick-label">高频率</text>
        <text x="26" y="156" text-anchor="middle" class="axis-label" transform="rotate(-90 26 156)">损失程度</text>
        <text x="80" y="106" text-anchor="end" class="tick-label">高损失</text>
        <text x="80" y="212" text-anchor="end" class="tick-label">低损失</text>

        <!-- Q1: Low freq, High severity -> Insurance -->
        <rect x="94" y="52" width="268" height="100" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.8"/>
        <text x="228" y="84" text-anchor="middle" fill="var(--accent)" font-size="14" font-weight="700">风险转移（商业保险 ★）</text>
        <text x="228" y="108" text-anchor="middle" fill="var(--text)" font-size="12">低频高损：火灾、重疾、重大车祸</text>
        <text x="228" y="128" text-anchor="middle" fill="var(--muted)" font-size="11.5">保险最核心的适用场景（杠杆高）</text>

        <!-- Q2: High freq, High severity -> Avoidance -->
        <rect x="374" y="52" width="268" height="100" rx="9" fill="var(--error-soft)" stroke="var(--error-line)" stroke-width="1.5"/>
        <text x="508" y="84" text-anchor="middle" fill="var(--error)" font-size="14" font-weight="700">风险回避</text>
        <text x="508" y="108" text-anchor="middle" fill="var(--text)" font-size="12">高频高损：危房施工、高危违规作业</text>
        <text x="508" y="128" text-anchor="middle" fill="var(--muted)" font-size="11.5">直接放弃或退出该项活动</text>

        <!-- Q3: Low freq, Low severity -> Retention -->
        <rect x="94" y="162" width="268" height="96" rx="9" fill="var(--surface)" stroke="var(--line)" stroke-width="1.5"/>
        <text x="228" y="194" text-anchor="middle" fill="var(--heading)" font-size="14" font-weight="700">风险自留</text>
        <text x="228" y="218" text-anchor="middle" fill="var(--text)" font-size="12">低频低损：小额日常磕碰、小件遗失</text>
        <text x="228" y="238" text-anchor="middle" fill="var(--muted)" font-size="11.5">自行承担更经济，无需额外投保</text>

        <!-- Q4: High freq, Low severity -> Loss control / Prevention -->
        <rect x="374" y="162" width="268" height="96" rx="9" fill="var(--warning-soft)" stroke="var(--warning)" stroke-width="1.5"/>
        <text x="508" y="194" text-anchor="middle" fill="var(--warning)" font-size="14" font-weight="700">损失控制（预防与抑制）</text>
        <text x="508" y="218" text-anchor="middle" fill="var(--text)" font-size="12">高频低损：装防盗门、定期消防检查</text>
        <text x="508" y="238" text-anchor="middle" fill="var(--muted)" font-size="11.5">降低发生概率 + 控制损失规模</text>
      </svg>`
    );
  }

  const registry = {
    'tu-mu': mountTUMU,
    'lac-envelope': mountLACEnvelope,
    'prisoners-matrix': mountPrisonersMatrix,
    'lorenz-gini': mountLorenzGini,
    'labour-supply': mountLabourSupply,
    externality: mountExternality,
    'keynes-cross': mountKeynesCross,
    'lm-regions': mountLMRegions,
    solow: mountSolow,
    'bop-structure': mountBOPStructure,
    'repression-gap': mountRepressionGap,
    'risk-matrix': mountRiskMatrix,
  };

  document.querySelectorAll('[data-micro-visual]').forEach(container => {
    const fn = registry[container.dataset.microVisual];
    if (fn) fn(container);
  });
})();
