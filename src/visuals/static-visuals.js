(() => {
  'use strict';

  const wrap = (title, desc, svg) => `
    <div class="inline-visual-header">
      <span class="inline-visual-badge">图解示意</span>
      <h4>${title}</h4>
      <p>${desc}</p>
    </div>
    <div class="static-svg-wrap micro-panel">${svg}</div>`;

  const diagrams = {
    'money-layers': () => wrap(
      'M0 / M1 / M2 货币供应量同心圆层次图',
      '由内向外：涵盖范围逐层扩大，货币流动性逐层递减（流动性 M0 > M1 > M2）。',
      `<svg viewBox="0 0 680 300" role="img" aria-label="M0 M1 M2 同心圆层次图" style="width:100%;height:auto;display:block">
        <defs><marker id="arr-m" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1l8 4-8 4z" fill="var(--accent)"/></marker></defs>
        <circle cx="205" cy="152" r="126" fill="var(--accent-soft)" stroke="var(--accent-line)" stroke-width="1.6"/>
        <circle cx="205" cy="176" r="88" fill="var(--surface)" stroke="var(--accent)" stroke-width="1.8"/>
        <circle cx="205" cy="202" r="46" fill="var(--accent)" opacity=".88"/>
        <text x="205" y="58" text-anchor="middle" fill="var(--heading)" font-size="14" font-weight="680">M2（广义货币）</text>
        <text x="205" y="76" text-anchor="middle" fill="var(--muted)" font-size="11.5">M1 + 定期存款 / 居民储蓄 / 其他存款</text>
        <text x="205" y="114" text-anchor="middle" fill="var(--accent)" font-size="14" font-weight="680">M1（狭义货币）</text>
        <text x="205" y="132" text-anchor="middle" fill="var(--muted)" font-size="11.5">M0 + 活期存款等高流动支付资金</text>
        <text x="205" y="198" text-anchor="middle" fill="var(--accent-on)" font-size="15" font-weight="700">M0</text>
        <text x="205" y="216" text-anchor="middle" fill="var(--accent-on)" font-size="11">流通中现金</text>
        <g transform="translate(366,44)">
          <rect x="0" y="0" width="286" height="216" rx="10" fill="var(--surface)" stroke="var(--line)"/>
          <text x="18" y="30" fill="var(--heading)" font-size="14" font-weight="680">核心记忆规律</text>
          <line x1="18" y1="42" x2="268" y2="42" stroke="var(--line)"/>
          <text x="18" y="68" fill="var(--accent)" font-size="13" font-weight="650">1. 流动性：M0 &gt; M1 &gt; M2</text>
          <text x="18" y="88" fill="var(--muted)" font-size="12">越靠近圆心，变现成本越低、支付越直接。</text>
          <text x="18" y="118" fill="var(--heading)" font-size="13" font-weight="650">2. 范围包含：M0 ⊂ M1 ⊂ M2</text>
          <text x="18" y="138" fill="var(--muted)" font-size="12">M2 − M1 称为「准货币」，反映潜在购买力。</text>
          <text x="18" y="168" fill="var(--heading)" font-size="13" font-weight="650">3. 观察指标：M1−M2 剪刀差</text>
          <text x="18" y="188" fill="var(--muted)" font-size="12">M1 增速高通常反映企业与居民资金活化。</text>
        </g>
      </svg>`
    ),

    'financing-flow': () => wrap(
      '直接融资 vs 间接融资资金流向对照图',
      '核心区别在于资金供需双方之间是否存在「承担信用与期限转换功能的金融中介」。',
      `<svg viewBox="0 0 680 270" role="img" aria-label="直接融资与间接融资资金流向图" style="width:100%;height:auto;display:block">
        <defs><marker id="arr-f" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 1l8 4-8 4z" fill="var(--accent)"/></marker>
        <marker id="arr-f2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 1l8 4-8 4z" fill="var(--mv-c2)"/></marker></defs>
        <!-- Direct -->
        <text x="20" y="26" fill="var(--accent)" font-size="13.5" font-weight="680">直接融资（股票、债券、商业信用）</text>
        <rect x="20" y="40" width="136" height="62" rx="9" fill="var(--surface)" stroke="var(--accent-line)" stroke-width="1.5"/>
        <text x="88" y="66" text-anchor="middle" fill="var(--heading)" font-size="13" font-weight="650">资金盈余方</text>
        <text x="88" y="85" text-anchor="middle" fill="var(--muted)" font-size="11.5">投资者 / 居民</text>
        <rect x="262" y="46" width="156" height="50" rx="9" fill="var(--accent-soft)" stroke="var(--accent-line)" stroke-dasharray="4 3"/>
        <text x="340" y="69" text-anchor="middle" fill="var(--accent)" font-size="12.5" font-weight="650">证券市场 / 撮合通道</text>
        <text x="340" y="86" text-anchor="middle" fill="var(--muted)" font-size="11">仅提供交易与承销服务</text>
        <rect x="524" y="40" width="136" height="62" rx="9" fill="var(--surface)" stroke="var(--accent-line)" stroke-width="1.5"/>
        <text x="592" y="66" text-anchor="middle" fill="var(--heading)" font-size="13" font-weight="650">资金短缺方</text>
        <text x="592" y="85" text-anchor="middle" fill="var(--muted)" font-size="11.5">发债/上市企业</text>
        <line x1="156" y1="62" x2="258" y2="62" stroke="var(--accent)" stroke-width="2" marker-end="url(#arr-f)"/>
        <line x1="418" y1="62" x2="520" y2="62" stroke="var(--accent)" stroke-width="2" marker-end="url(#arr-f)"/>
        <text x="340" y="118" text-anchor="middle" fill="var(--muted)" font-size="11.5">盈余方直接持有短缺方发行的原生证券，直接承担违约风险</text>

        <line x1="20" y1="136" x2="660" y2="136" stroke="var(--line)" stroke-dasharray="4 4"/>

        <!-- Indirect -->
        <text x="20" y="160" fill="var(--mv-c2)" font-size="13.5" font-weight="680">间接融资（银行存贷款、信托贷款）</text>
        <rect x="20" y="174" width="136" height="62" rx="9" fill="var(--surface)" stroke="var(--line)" stroke-width="1.5"/>
        <text x="88" y="200" text-anchor="middle" fill="var(--heading)" font-size="13" font-weight="650">存款人</text>
        <text x="88" y="219" text-anchor="middle" fill="var(--muted)" font-size="11.5">资金供给方</text>
        <rect x="252" y="170" width="176" height="70" rx="9" fill="var(--surface)" stroke="var(--mv-c2)" stroke-width="2"/>
        <text x="340" y="198" text-anchor="middle" fill="var(--mv-c2)" font-size="13.5" font-weight="680">商业银行等金融中介</text>
        <text x="340" y="217" text-anchor="middle" fill="var(--muted)" font-size="11">吸收存款 → 发放贷款（承担风险）</text>
        <rect x="524" y="174" width="136" height="62" rx="9" fill="var(--surface)" stroke="var(--line)" stroke-width="1.5"/>
        <text x="592" y="200" text-anchor="middle" fill="var(--heading)" font-size="13" font-weight="650">借款人</text>
        <text x="592" y="219" text-anchor="middle" fill="var(--muted)" font-size="11.5">资金需求方</text>
        <line x1="156" y1="204" x2="248" y2="204" stroke="var(--mv-c2)" stroke-width="2" marker-end="url(#arr-f2)"/>
        <line x1="428" y1="204" x2="520" y2="204" stroke="var(--mv-c2)" stroke-width="2" marker-end="url(#arr-f2)"/>
        <text x="204" y="196" text-anchor="middle" fill="var(--muted)" font-size="11">存款</text>
        <text x="474" y="196" text-anchor="middle" fill="var(--muted)" font-size="11">贷款</text>
        <text x="340" y="258" text-anchor="middle" fill="var(--muted)" font-size="11.5">双方形成两段独立债权债务关系，由金融中介完成信用转换与期限错配管理</text>
      </svg>`
    ),

    'bill-chain': () => wrap(
      '商业汇票生命周期：出票 → 承兑 → 贴现 / 转贴现 / 再贴现',
      '理清票据在不同主体之间流转的顺序与主体身份，快速区分贴现、转贴现与再贴现。',
      `<svg viewBox="0 0 680 210" role="img" aria-label="商业汇票承兑与贴现链条图" style="width:100%;height:auto;display:block">
        <defs><marker id="arr-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 1l8 4-8 4z" fill="var(--accent)"/></marker></defs>
        <g font-size="12" text-anchor="middle">
          <rect x="14" y="34" width="108" height="64" rx="9" fill="var(--surface)" stroke="var(--line)" stroke-width="1.5"/>
          <text x="68" y="61" fill="var(--heading)" font-weight="680">1. 出票 / 承兑</text>
          <text x="68" y="81" fill="var(--muted)" font-size="11">商业承兑 / 银行承兑</text>

          <line x1="122" y1="66" x2="148" y2="66" stroke="var(--accent)" stroke-width="2" marker-end="url(#arr-b)"/>

          <rect x="152" y="34" width="108" height="64" rx="9" fill="var(--surface)" stroke="var(--line)" stroke-width="1.5"/>
          <text x="206" y="61" fill="var(--heading)" font-weight="680">2. 背书转让</text>
          <text x="206" y="81" fill="var(--muted)" font-size="11">企业间流通支付</text>

          <line x1="260" y1="66" x2="286" y2="66" stroke="var(--accent)" stroke-width="2" marker-end="url(#arr-b)"/>

          <rect x="290" y="34" width="112" height="64" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.8"/>
          <text x="346" y="61" fill="var(--accent)" font-weight="680">3. 贴现</text>
          <text x="346" y="81" fill="var(--text)" font-size="11">企业 → 商业银行</text>

          <line x1="402" y1="66" x2="428" y2="66" stroke="var(--accent)" stroke-width="2" marker-end="url(#arr-b)"/>

          <rect x="432" y="34" width="112" height="64" rx="9" fill="var(--surface)" stroke="var(--mv-c3)" stroke-width="1.6"/>
          <text x="488" y="61" fill="var(--heading)" font-weight="680">4. 转贴现</text>
          <text x="488" y="81" fill="var(--muted)" font-size="11">商业银行 → 商业银行</text>

          <line x1="544" y1="66" x2="570" y2="66" stroke="var(--accent)" stroke-width="2" marker-end="url(#arr-b)"/>

          <rect x="574" y="34" width="94" height="64" rx="9" fill="var(--surface)" stroke="var(--mv-c2)" stroke-width="1.8"/>
          <text x="621" y="61" fill="var(--mv-c2)" font-weight="680">5. 再贴现</text>
          <text x="621" y="81" fill="var(--muted)" font-size="11">商行 → 央行</text>
        </g>
        <rect x="14" y="124" width="654" height="66" rx="9" fill="var(--surface)" stroke="var(--line)"/>
        <text x="30" y="150" fill="var(--heading)" font-size="12.5" font-weight="650">实付贴现金额 = 票面金额 × (1 − 年贴现率 × 剩余天数 / 360)</text>
        <text x="30" y="173" fill="var(--muted)" font-size="12">核心区别：贴现（企→银）、转贴现（银→银）、再贴现（银→央行，属于央行三大传统货币政策工具之一）。</text>
      </svg>`
    ),

    'bank-balance': () => wrap(
      '中央银行 vs 商业银行资产负债表对照结构图',
      '左右对比两类银行的核心科目，一眼看清“基础货币在央行负债端，准备金在商行资产端”的镜像关系。',
      `<svg viewBox="0 0 680 265" role="img" aria-label="央行与商业银行资产负债表对照结构图" style="width:100%;height:auto;display:block">
        <!-- Central Bank -->
        <rect x="16" y="14" width="314" height="236" rx="10" fill="var(--surface)" stroke="var(--line)"/>
        <rect x="16" y="14" width="314" height="36" rx="10" fill="var(--accent-soft)"/>
        <text x="173" y="37" text-anchor="middle" fill="var(--accent)" font-size="13.5" font-weight="680">中央银行（发行的银行 / 银行的银行）</text>
        <line x1="173" y1="50" x2="173" y2="250" stroke="var(--line)"/>
        <text x="94" y="72" text-anchor="middle" fill="var(--heading)" font-size="12.5" font-weight="650">资产端（资金运用）</text>
        <text x="252" y="72" text-anchor="middle" fill="var(--heading)" font-size="12.5" font-weight="650">负债端（基础货币）</text>
        <line x1="28" y1="82" x2="318" y2="82" stroke="var(--line)"/>
        <g font-size="12" fill="var(--text)">
          <text x="30" y="108">• 国外资产（外汇占款/黄金）</text>
          <text x="30" y="136">• 对政府债权（国债）</text>
          <text x="30" y="164">• 对商行债权（再贷款/MLF）</text>
          <text x="30" y="192">• 其他金融资产</text>
          <text x="184" y="108" fill="var(--accent)" font-weight="650">• 货币发行（流通中现金）</text>
          <text x="184" y="136" fill="var(--accent)" font-weight="650">• 金融机构准备金存款</text>
          <text x="184" y="164">• 政府存款（财政库款）</text>
          <text x="184" y="192">• 央行票据与自有资本</text>
        </g>
        <text x="173" y="232" text-anchor="middle" fill="var(--muted)" font-size="11">前两项负债合计 = 基础货币 B</text>

        <!-- Commercial Bank -->
        <rect x="350" y="14" width="314" height="236" rx="10" fill="var(--surface)" stroke="var(--line)"/>
        <rect x="350" y="14" width="314" height="36" rx="10" fill="var(--surface-subtle)"/>
        <text x="507" y="37" text-anchor="middle" fill="var(--heading)" font-size="13.5" font-weight="680">商业银行（信用中介与存款创造）</text>
        <line x1="507" y1="50" x2="507" y2="250" stroke="var(--line)"/>
        <text x="428" y="72" text-anchor="middle" fill="var(--heading)" font-size="12.5" font-weight="650">资产端（运用与收益）</text>
        <text x="586" y="72" text-anchor="middle" fill="var(--heading)" font-size="12.5" font-weight="650">负债与权益（资金来源）</text>
        <line x1="362" y1="82" x2="652" y2="82" stroke="var(--line)"/>
        <g font-size="12" fill="var(--text)">
          <text x="364" y="108" fill="var(--accent)" font-weight="650">• 现金资产（库存+准备金）</text>
          <text x="364" y="136">• 各类贷款（核心盈利资产）</text>
          <text x="364" y="164">• 债券与证券投资</text>
          <text x="364" y="192">• 固定资产与其他资产</text>
          <text x="518" y="108">• 各类存款（主要负债）</text>
          <text x="518" y="136">• 同业拆入 / 金融债</text>
          <text x="518" y="164">• 向央行借款</text>
          <text x="518" y="192">• 所有者权益（核心资本）</text>
        </g>
        <text x="507" y="232" text-anchor="middle" fill="var(--muted)" font-size="11">另设中间业务与表外业务（不直接计入表内）</text>
      </svg>`
    ),

    'basel-pillars': () => wrap(
      '巴塞尔协议三大支柱与资本充足率层级结构',
      '记住“三大支柱 + 资本充足率三道红线（核心一级 / 一级 / 总资本）+ 缓冲资本”的完整框架。',
      `<svg viewBox="0 0 680 268" role="img" aria-label="巴塞尔协议三大支柱与资本充足率层级图" style="width:100%;height:auto;display:block">
        <rect x="20" y="14" width="640" height="36" rx="8" fill="var(--accent-soft)" stroke="var(--accent-line)"/>
        <text x="340" y="37" text-anchor="middle" fill="var(--accent)" font-size="14" font-weight="680">巴塞尔协议监管框架（全面风险管理与资本约束）</text>
        <g text-anchor="middle">
          <rect x="20" y="62" width="202" height="82" rx="9" fill="var(--surface)" stroke="var(--accent)" stroke-width="1.6"/>
          <text x="121" y="88" fill="var(--accent)" font-size="13" font-weight="680">第一支柱：最低资本要求</text>
          <text x="121" y="109" fill="var(--muted)" font-size="11.5">覆盖信用、市场、操作风险</text>
          <text x="121" y="128" fill="var(--muted)" font-size="11.5">资本 / 风险加权资产(RWA)</text>

          <rect x="239" y="62" width="202" height="82" rx="9" fill="var(--surface)" stroke="var(--line)" stroke-width="1.5"/>
          <text x="340" y="88" fill="var(--heading)" font-size="13" font-weight="680">第二支柱：监督检查</text>
          <text x="340" y="109" fill="var(--muted)" font-size="11.5">监管评估内部资本充足程序</text>
          <text x="340" y="128" fill="var(--muted)" font-size="11.5">必要时要求更高资本与干预</text>

          <rect x="458" y="62" width="202" height="82" rx="9" fill="var(--surface)" stroke="var(--line)" stroke-width="1.5"/>
          <text x="559" y="88" fill="var(--heading)" font-size="13" font-weight="680">第三支柱：市场纪律</text>
          <text x="559" y="109" fill="var(--muted)" font-size="11.5">强制充分的信息披露</text>
          <text x="559" y="128" fill="var(--muted)" font-size="11.5">借助市场力量约束银行冒险</text>
        </g>

        <rect x="20" y="160" width="640" height="94" rx="9" fill="var(--surface)" stroke="var(--line)"/>
        <text x="36" y="184" fill="var(--heading)" font-size="13" font-weight="680">我国商业银行资本充足率最低底线与储备资本（巴塞尔 III 口径）</text>
        <rect x="36" y="198" width="240" height="32" rx="6" fill="var(--accent)" opacity=".88"/>
        <text x="156" y="219" text-anchor="middle" fill="var(--accent-on)" font-size="12" font-weight="650">核心一级资本 ≥ 5%</text>
        <rect x="282" y="198" width="90" height="32" rx="6" fill="var(--accent-soft)" stroke="var(--accent-line)"/>
        <text x="327" y="219" text-anchor="middle" fill="var(--accent)" font-size="11.5" font-weight="650">一级 ≥ 6%</text>
        <rect x="378" y="198" width="104" height="32" rx="6" fill="var(--surface-subtle)" stroke="var(--control-line)"/>
        <text x="430" y="219" text-anchor="middle" fill="var(--heading)" font-size="11.5" font-weight="650">总资本 ≥ 8%</text>
        <rect x="488" y="198" width="156" height="32" rx="6" fill="var(--warning-soft)" stroke="var(--warning)"/>
        <text x="566" y="219" text-anchor="middle" fill="var(--warning)" font-size="11.5" font-weight="650">+ 储备资本 2.5%（合计10.5%）</text>
      </svg>`
    ),

    'proximate-cause': () => wrap(
      '近因原则：多因致损因果链判定图',
      '考试高频难点：按“单一原因 / 连续发生 / 同时发生”三种情形快速锁定保险人是否赔付。',
      `<svg viewBox="0 0 680 256" role="img" aria-label="近因原则多因因果链判定图" style="width:100%;height:auto;display:block">
        <g font-size="12">
          <!-- Row 1 -->
          <rect x="16" y="14" width="136" height="46" rx="8" fill="var(--accent-soft)" stroke="var(--accent-line)"/>
          <text x="84" y="42" text-anchor="middle" fill="var(--accent)" font-weight="680">1. 单一原因致损</text>
          <rect x="172" y="14" width="492" height="46" rx="8" fill="var(--surface)" stroke="var(--line)"/>
          <text x="190" y="42" fill="var(--text)">该原因即为近因 → 属于承保风险则<tspan fill="var(--accent)" font-weight="680">全赔</tspan>；属于除外责任则<tspan fill="var(--error)" font-weight="680">不赔</tspan>。</text>

          <!-- Row 2 -->
          <rect x="16" y="72" width="136" height="52" rx="8" fill="var(--accent-soft)" stroke="var(--accent-line)"/>
          <text x="84" y="95" text-anchor="middle" fill="var(--accent)" font-weight="680">2. 连续发生</text>
          <text x="84" y="113" text-anchor="middle" fill="var(--muted)" font-size="11">因果链未中断</text>
          <rect x="172" y="72" width="492" height="52" rx="8" fill="var(--surface)" stroke="var(--line)"/>
          <text x="190" y="95" fill="var(--text)"><tspan font-weight="650">最初原因</tspan>是近因（如：撞船进水 → 货物湿损，撞船为近因）。</text>
          <text x="190" y="114" fill="var(--muted)" font-size="11.5">最初原因承保则赔，除外则不赔。</text>

          <!-- Row 3 -->
          <rect x="16" y="136" width="136" height="52" rx="8" fill="var(--warning-soft)" stroke="var(--warning)"/>
          <text x="84" y="159" text-anchor="middle" fill="var(--warning)" font-weight="680">3. 连续发生</text>
          <text x="84" y="177" text-anchor="middle" fill="var(--warning)" font-size="11">新独立原因介入</text>
          <rect x="172" y="136" width="492" height="52" rx="8" fill="var(--surface)" stroke="var(--line)"/>
          <text x="190" y="159" fill="var(--text)">原因果链被切断，<tspan fill="var(--warning)" font-weight="680">新介入的独立原因</tspan>成为近因。</text>
          <text x="190" y="178" fill="var(--muted)" font-size="11.5">依新介入原因是否属于承保风险来决定赔付。</text>

          <!-- Row 4 -->
          <rect x="16" y="200" width="136" height="46" rx="8" fill="var(--surface-subtle)" stroke="var(--control-line)"/>
          <text x="84" y="228" text-anchor="middle" fill="var(--heading)" font-weight="680">4. 多因同时发生</text>
          <rect x="172" y="200" width="492" height="46" rx="8" fill="var(--surface)" stroke="var(--line)"/>
          <text x="190" y="228" fill="var(--text)">损失可划分 → 仅赔承保部分；无法划分 → 含除外责任通常<tspan fill="var(--error)" font-weight="680">不赔</tspan>或按比例协商。</text>
        </g>
      </svg>`
    ),

    'contract-timeline': () => wrap(
      '保险合同时间轴：订立 → 成立 → 生效 → 保险责任开始',
      '四个节点时间上可以重合，也可以分离；切忌把“合同成立”等同于“保险责任开始”。',
      `<svg viewBox="0 0 680 212" role="img" aria-label="保险合同订立成立生效责任开始时间轴" style="width:100%;height:auto;display:block">
        <line x1="68" y1="74" x2="612" y2="74" stroke="var(--accent)" stroke-width="3" opacity=".45"/>
        <g text-anchor="middle">
          <circle cx="88" cy="74" r="13" fill="var(--accent)"/>
          <text x="88" y="79" fill="var(--accent-on)" font-size="12" font-weight="700">1</text>
          <text x="88" y="42" fill="var(--heading)" font-size="13.5" font-weight="680">要约（投保）</text>
          <text x="88" y="108" fill="var(--muted)" font-size="11.5">投保人填写投保单</text>
          <text x="88" y="125" fill="var(--muted)" font-size="11.5">提出订约请求</text>

          <circle cx="256" cy="74" r="13" fill="var(--accent)"/>
          <text x="256" y="79" fill="var(--accent-on)" font-size="12" font-weight="700">2</text>
          <text x="256" y="42" fill="var(--heading)" font-size="13.5" font-weight="680">承诺（合同成立）</text>
          <text x="256" y="108" fill="var(--muted)" font-size="11.5">保险人同意承保</text>
          <text x="256" y="125" fill="var(--muted)" font-size="11.5">意思表示达成一致</text>

          <circle cx="424" cy="74" r="13" fill="var(--accent)"/>
          <text x="424" y="79" fill="var(--accent-on)" font-size="12" font-weight="700">3</text>
          <text x="424" y="42" fill="var(--heading)" font-size="13.5" font-weight="680">合同生效</text>
          <text x="424" y="108" fill="var(--muted)" font-size="11.5">依法成立即生效</text>
          <text x="424" y="125" fill="var(--muted)" font-size="11.5">可约定附条件/期限</text>

          <circle cx="592" cy="74" r="13" fill="var(--mv-c2)"/>
          <text x="592" y="79" fill="var(--surface)" font-size="12" font-weight="700">4</text>
          <text x="592" y="42" fill="var(--mv-c2)" font-size="13.5" font-weight="680">责任开始</text>
          <text x="592" y="108" fill="var(--muted)" font-size="11.5">实际开始承担理赔</text>
          <text x="592" y="125" fill="var(--muted)" font-size="11.5">常采用「零时起保制」</text>
        </g>
        <rect x="20" y="148" width="640" height="48" rx="8" fill="var(--surface)" stroke="var(--line)"/>
        <text x="340" y="177" text-anchor="middle" fill="var(--text)" font-size="12.5">考点提示：我国实行「成立即生效」原则，但可约定以交费为生效条件；签发保单只是证明，不影响合同成立。</text>
      </svg>`
    ),

    'pension-pyramid': () => wrap(
      '我国多支柱养老保障体系金字塔',
      '从底座的强制普惠基本养老，到企业补充，再到个人商业养老，层次清晰。',
      `<svg viewBox="0 0 680 250" role="img" aria-label="多支柱养老保障体系金字塔图" style="width:100%;height:auto;display:block">
        <!-- Pyramid layers -->
        <polygon points="220,24 146,92 294,92" fill="var(--warning-soft)" stroke="var(--warning)" stroke-width="1.6"/>
        <polygon points="140,98 300,98 350,162 90,162" fill="var(--accent-soft)" stroke="var(--accent-line)" stroke-width="1.6"/>
        <polygon points="84,168 356,168 412,232 28,232" fill="var(--accent)" opacity=".88"/>

        <text x="220" y="74" text-anchor="middle" fill="var(--warning)" font-size="12.5" font-weight="700">第三支柱</text>
        <text x="220" y="136" text-anchor="middle" fill="var(--accent)" font-size="13.5" font-weight="700">第二支柱（企业/职业年金）</text>
        <text x="220" y="206" text-anchor="middle" fill="var(--accent-on)" font-size="14" font-weight="700">第一支柱（基本养老保险）</text>

        <g font-size="12" fill="var(--text)">
          <text x="394" y="64" fill="var(--warning)" font-weight="680">个人主导 · 自愿参与</text>
          <text x="394" y="83" fill="var(--muted)">个人养老金账户、商业养老保险（税优支持）</text>

          <text x="394" y="128" fill="var(--accent)" font-weight="680">用人单位主导 · 补充性质</text>
          <text x="394" y="147" fill="var(--muted)">企业年金（自愿）与机关事业单位职业年金</text>

          <text x="424" y="196" fill="var(--heading)" font-weight="680">政府主导 · 强制保基本</text>
          <text x="424" y="215" fill="var(--muted)">城镇职工 + 城乡居民基本养老保险（广覆盖）</text>
        </g>
      </svg>`
    ),

    'life-interest': () => wrap(
      '财产保险 vs 人身保险：保险利益判定时点对比',
      '高频易错对比：两类险种对「何时必须存在保险利益」的要求完全不同。',
      `<svg viewBox="0 0 680 226" role="img" aria-label="财产险与人身险保险利益判定时点对比图" style="width:100%;height:auto;display:block">
        <!-- Property -->
        <rect x="16" y="16" width="314" height="194" rx="10" fill="var(--surface)" stroke="var(--line)"/>
        <rect x="16" y="16" width="314" height="36" rx="10" fill="var(--surface-subtle)"/>
        <text x="173" y="39" text-anchor="middle" fill="var(--heading)" font-size="13.5" font-weight="680">财产保险（损失补偿）</text>
        <text x="34" y="78" fill="var(--muted)" font-size="12">订立合同时：<tspan fill="var(--text)">不强制要求必须存在</tspan></text>
        <text x="34" y="108" fill="var(--mv-c2)" font-size="13" font-weight="680">保险事故发生时：必须具有保险利益</text>
        <line x1="34" y1="126" x2="312" y2="126" stroke="var(--line)"/>
        <text x="34" y="152" fill="var(--muted)" font-size="12">典型例子：房屋卖出过户后失火，原房主</text>
        <text x="34" y="172" fill="var(--muted)" font-size="12">出险时已无所有权（无保险利益）→ 不赔。</text>
        <text x="34" y="196" fill="var(--muted)" font-size="11.5">目的：防止无损失而获利（赌博/道德风险）</text>

        <!-- Life -->
        <rect x="350" y="16" width="314" height="194" rx="10" fill="var(--surface)" stroke="var(--accent-line)" stroke-width="1.6"/>
        <rect x="350" y="16" width="314" height="36" rx="10" fill="var(--accent-soft)"/>
        <text x="507" y="39" text-anchor="middle" fill="var(--accent)" font-size="13.5" font-weight="680">人身保险（定额给付为主）</text>
        <text x="368" y="78" fill="var(--accent)" font-size="13" font-weight="680">订立合同时：必须具有保险利益</text>
        <text x="368" y="108" fill="var(--muted)" font-size="12">保险事故发生时：<tspan fill="var(--text)">不要求依然存在</tspan></text>
        <line x1="368" y1="126" x2="646" y2="126" stroke="var(--line)"/>
        <text x="368" y="152" fill="var(--muted)" font-size="12">典型例子：婚内为配偶投保寿险，后离异</text>
        <text x="368" y="172" fill="var(--muted)" font-size="12">期间被保险人出险，合同依然有效 → 照赔。</text>
        <text x="368" y="196" fill="var(--muted)" font-size="11.5">目的：保护长期寿险合同稳定性与被保险人权益</text>
      </svg>`
    ),
  };

  document.querySelectorAll('[data-micro-visual]').forEach(container => {
    const fn = diagrams[container.dataset.microVisual];
    if (fn) container.innerHTML = fn();
  });
})();
