(() => {
  'use strict';

  const wrapStatic = (title, desc, svg) => `
    <div class="inline-visual-header">
      <span class="inline-visual-badge">图解示意</span>
      <h4>${title}</h4>
      <p>${desc}</p>
    </div>
    <div class="static-svg-wrap micro-panel">${svg}</div>`;

  // 1. Ch01: CIA 五大属性与四层纵深防护全景图
  const renderCIALayers = () => wrapStatic(
    '信息安全五大属性（CIA 扩展）与四层纵深防护体系',
    '左图记住五大核心安全目标及典型破坏场景，右图对应物理、网络、系统、应用四层纵深防御。',
    `<svg viewBox="0 0 680 286" role="img" aria-label="CIA五大安全属性与四层纵深防护图" style="width:100%;height:auto;display:block">
      <!-- Left: CIA 5 Properties -->
      <rect x="14" y="14" width="320" height="258" rx="10" fill="var(--surface)" stroke="var(--line)"/>
      <rect x="14" y="14" width="320" height="36" rx="10" fill="var(--accent-soft)"/>
      <text x="174" y="37" text-anchor="middle" fill="var(--accent)" font-size="13.5" font-weight="680">信息安全五大基本属性</text>
      <g font-size="12">
        <rect x="28" y="62" width="292" height="36" rx="7" fill="var(--surface-subtle)" stroke="var(--accent-line)"/>
        <text x="40" y="85" fill="var(--accent)" font-weight="680">机密性</text>
        <text x="102" y="85" fill="var(--text)">防偷看泄露（加密 / 访问控制）</text>

        <rect x="28" y="104" width="292" height="36" rx="7" fill="var(--surface-subtle)" stroke="var(--accent-line)"/>
        <text x="40" y="127" fill="var(--accent)" font-weight="680">完整性</text>
        <text x="102" y="127" fill="var(--text)">防篡改破坏（Hash / 数字签名）</text>

        <rect x="28" y="146" width="292" height="36" rx="7" fill="var(--surface-subtle)" stroke="var(--accent-line)"/>
        <text x="40" y="169" fill="var(--accent)" font-weight="680">可用性</text>
        <text x="102" y="169" fill="var(--text)">防瘫痪中断（冗余 / 抗 DDoS）</text>

        <rect x="28" y="188" width="292" height="34" rx="7" fill="var(--surface)" stroke="var(--line)"/>
        <text x="40" y="209" fill="var(--heading)" font-weight="650">可控性</text>
        <text x="102" y="209" fill="var(--muted)">防失控越权（安全审计 / 日志）</text>

        <rect x="28" y="228" width="292" height="34" rx="7" fill="var(--surface)" stroke="var(--line)"/>
        <text x="40" y="249" fill="var(--heading)" font-weight="650">不可否认性</text>
        <text x="116" y="249" fill="var(--muted)">防赖账抵赖（私钥数字签名）</text>
      </g>

      <!-- Right: 4 Defense Layers -->
      <rect x="348" y="14" width="318" height="258" rx="10" fill="var(--surface)" stroke="var(--line)"/>
      <rect x="348" y="14" width="318" height="36" rx="10" fill="var(--surface-subtle)"/>
      <text x="507" y="37" text-anchor="middle" fill="var(--heading)" font-size="13.5" font-weight="680">纵深防御四层面（由外到内）</text>
      <g text-anchor="middle" font-size="12">
        <rect x="366" y="62" width="282" height="42" rx="8" fill="var(--accent-soft)" stroke="var(--accent)"/>
        <text x="507" y="81" fill="var(--accent)" font-weight="680">应用安全层</text>
        <text x="507" y="98" fill="var(--muted)" font-size="11">防 SQL 注入 / XSS / WAF / 业务鉴权</text>

        <rect x="366" y="112" width="282" height="42" rx="8" fill="var(--surface-subtle)" stroke="var(--line)"/>
        <text x="507" y="131" fill="var(--heading)" font-weight="680">系统安全层</text>
        <text x="507" y="148" fill="var(--muted)" font-size="11">OS 补丁 / 最小权限 / NTFS 与 Linux 权限</text>

        <rect x="366" y="162" width="282" height="42" rx="8" fill="var(--surface-subtle)" stroke="var(--line)"/>
        <text x="507" y="181" fill="var(--heading)" font-weight="680">网络安全层</text>
        <text x="507" y="198" fill="var(--muted)" font-size="11">防火墙 DMZ / VPN / IDS·IPS / VLAN 隔离</text>

        <rect x="366" y="212" width="282" height="46" rx="8" fill="var(--surface)" stroke="var(--mv-c2)" stroke-width="1.5"/>
        <text x="507" y="232" fill="var(--mv-c2)" font-weight="680">物理安全层（安全前提）</text>
        <text x="507" y="250" fill="var(--muted)" font-size="11">机房选址 / 七氟丙烷灭火 / 物理隔离与网闸</text>
      </g>
    </svg>`
  );

  // 2. Ch02: 混合加密（数字信封）交互演示
  function mountHybridCrypto(root) {
    root.innerHTML = `
      <div class="inline-visual-header">
        <span class="inline-visual-badge">交互图解</span>
        <h4>混合加密体制（数字信封）：分步演练</h4>
        <p>点击步骤按钮，观察对称加密（高效传正文）与非对称加密（安全传会话密钥）如何无缝协作。</p>
      </div>
      <div class="ppf-panel micro-panel">
        <div class="ppf-chart">
          <svg viewBox="0 0 540 245" role="img" aria-label="混合加密数字信封流程图">
            <defs><marker id="arr-hy" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 1l8 4-8 4z" fill="var(--accent)"/></marker></defs>
            <!-- Sender -->
            <rect x="14" y="20" width="146" height="196" rx="10" fill="var(--surface)" stroke="var(--line)"/>
            <text x="87" y="42" text-anchor="middle" fill="var(--heading)" font-size="13" font-weight="680">发送方 Alice</text>
            <rect x="26" y="56" width="122" height="42" rx="7" data-box="m" fill="var(--surface-subtle)" stroke="var(--line)"/>
            <text x="87" y="75" text-anchor="middle" fill="var(--heading)" font-size="12" font-weight="650">长明文数据 M</text>
            <text x="87" y="91" text-anchor="middle" fill="var(--muted)" font-size="10.5">用随机对称密钥 K 加密</text>
            <rect x="26" y="114" width="122" height="42" rx="7" data-box="k" fill="var(--surface-subtle)" stroke="var(--line)"/>
            <text x="87" y="133" text-anchor="middle" fill="var(--heading)" font-size="12" font-weight="650">临时会话密钥 K</text>
            <text x="87" y="149" text-anchor="middle" fill="var(--muted)" font-size="10.5">用 Bob 公钥封装</text>
            <text x="87" y="188" text-anchor="middle" fill="var(--muted)" font-size="11">兼顾速度与安全</text>

            <!-- Channel -->
            <rect x="192" y="44" width="156" height="148" rx="10" data-box="net" fill="var(--accent-soft)" stroke="var(--accent-line)" stroke-dasharray="4 3"/>
            <text x="270" y="68" text-anchor="middle" fill="var(--accent)" font-size="12.5" font-weight="680">公网传输载荷</text>
            <rect x="206" y="84" width="128" height="36" rx="6" fill="var(--surface)" stroke="var(--accent)"/>
            <text x="270" y="106" text-anchor="middle" fill="var(--text)" font-size="11.5" font-weight="650">AES(M, K) 密文</text>
            <rect x="206" y="132" width="128" height="36" rx="6" fill="var(--surface)" stroke="var(--mv-c2)"/>
            <text x="270" y="154" text-anchor="middle" fill="var(--mv-c2)" font-size="11.5" font-weight="650">RSA(K, KB_pub)</text>

            <!-- Receiver -->
            <rect x="380" y="20" width="146" height="196" rx="10" fill="var(--surface)" stroke="var(--line)"/>
            <text x="453" y="42" text-anchor="middle" fill="var(--heading)" font-size="13" font-weight="680">接收方 Bob</text>
            <rect x="392" y="56" width="122" height="42" rx="7" data-box="dec-k" fill="var(--surface-subtle)" stroke="var(--line)"/>
            <text x="453" y="75" text-anchor="middle" fill="var(--heading)" font-size="12" font-weight="650">1. Bob 私钥解封</text>
            <text x="453" y="91" text-anchor="middle" fill="var(--muted)" font-size="10.5">还原出会话密钥 K</text>
            <rect x="392" y="114" width="122" height="42" rx="7" data-box="dec-m" fill="var(--surface-subtle)" stroke="var(--line)"/>
            <text x="453" y="133" text-anchor="middle" fill="var(--heading)" font-size="12" font-weight="650">2. 用 K 解密正文</text>
            <text x="453" y="149" text-anchor="middle" fill="var(--muted)" font-size="10.5">高效还原明文 M</text>
            <text x="453" y="188" text-anchor="middle" fill="var(--accent)" font-size="11" font-weight="650">私钥仅 Bob 持有</text>

            <line x1="160" y1="118" x2="188" y2="118" stroke="var(--accent)" stroke-width="2" marker-end="url(#arr-hy)"/>
            <line x1="348" y1="118" x2="376" y2="118" stroke="var(--accent)" stroke-width="2" marker-end="url(#arr-hy)"/>
          </svg>
        </div>
        <div class="ppf-controls">
          <div class="button-row">
            <button type="button" class="button button-secondary" data-step="1">① 对称加密正文</button>
            <button type="button" class="button button-secondary" data-step="2">② 公钥封装密钥</button>
            <button type="button" class="button button-secondary" data-step="3">③ 私钥解出密钥</button>
            <button type="button" class="button button-secondary" data-step="4">④ 对称还原明文</button>
          </div>
          <div class="ppf-explanation" data-role="msg" aria-live="polite"></div>
        </div>
      </div>`;
    const steps = {
      1: { box: 'm', msg: '步骤 1（对称加密正文）：Alice 随机生成一次性对称会话密钥 K（如 AES-256），快速加密体积庞大的业务明文 M，解决非对称算法速度慢的瓶颈。' },
      2: { box: 'k', msg: '步骤 2（公钥封装数字信封）：Alice 获取 Bob 的公钥 KB_pub，仅对短小的会话密钥 K 进行非对称加密，解决对称密钥安全分发难题。' },
      3: { box: 'dec-k', msg: '步骤 3（接收方私钥解封）：Bob 收到密文与数字信封后，使用只有自己掌握的私钥 KB_pri 解密数字信封，安全还原出会话密钥 K。' },
      4: { box: 'dec-m', msg: '步骤 4（对称高效解密）：Bob 使用解出的会话密钥 K 对正文密文进行对称解密，完整还原明文 M。HTTPS 和 PGP 均采用此机制。' },
    };
    function show(id) {
      const s = steps[id];
      root.querySelectorAll('[data-box]').forEach(el => {
        const active = el.dataset.box === s.box;
        el.setAttribute('stroke', active ? 'var(--accent)' : 'var(--line)');
        el.setAttribute('stroke-width', active ? '2.4' : '1');
      });
      root.querySelector('[data-role="msg"]').textContent = s.msg;
    }
    root.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => show(b.dataset.step)));
    show(1);
  }

  // 3. Ch02: 三种网络传输加密对照图
  const renderTransmissionCrypto = () => wrapStatic(
    '链路加密 vs 节点加密 vs 端到端加密对照',
    '核心区别：中间路由器是否解密、内存是否暴露明文，以及报文头（源/目的地址）是否被加密。',
    `<svg viewBox="0 0 680 250" role="img" aria-label="链路加密节点加密与端到端加密对照图" style="width:100%;height:auto;display:block">
      <g font-size="12">
        <!-- Row 1: Link -->
        <rect x="14" y="14" width="112" height="62" rx="8" fill="var(--accent-soft)" stroke="var(--accent)"/>
        <text x="70" y="40" text-anchor="middle" fill="var(--accent)" font-weight="680">链路加密</text>
        <text x="70" y="60" text-anchor="middle" fill="var(--muted)" font-size="11">防流量分析 ✓</text>
        <rect x="140" y="14" width="526" height="62" rx="8" fill="var(--surface)" stroke="var(--line)"/>
        <text x="156" y="38" fill="var(--heading)" font-weight="650">源主机 ──[密文含报头]──▶ 路由器(解密成明文再重加密) ──[密文含报头]──▶ 目的主机</text>
        <text x="156" y="60" fill="var(--muted)" font-size="11.5">特点：连同路由报头一起加密（可抗流量分析），但中间节点内存会出现明文。</text>

        <!-- Row 2: Node -->
        <rect x="14" y="92" width="112" height="62" rx="8" fill="var(--surface-subtle)" stroke="var(--mv-c2)" stroke-width="1.5"/>
        <text x="70" y="118" text-anchor="middle" fill="var(--mv-c2)" font-weight="680">节点加密</text>
        <text x="70" y="138" text-anchor="middle" fill="var(--muted)" font-size="11">报头明文</text>
        <rect x="140" y="92" width="526" height="62" rx="8" fill="var(--surface)" stroke="var(--line)"/>
        <text x="156" y="116" fill="var(--heading)" font-weight="650">源主机 ──[报头明文+载荷密文]──▶ 硬件安全模块内换密钥 ──[载荷密文]──▶ 目的主机</text>
        <text x="156" y="138" fill="var(--muted)" font-size="11.5">特点：主机内存不出现明文，但报文头必须保持明文供节点路由转发。</text>

        <!-- Row 3: E2E -->
        <rect x="14" y="170" width="112" height="62" rx="8" fill="var(--surface-subtle)" stroke="var(--accent-line)" stroke-width="1.5"/>
        <text x="70" y="196" text-anchor="middle" fill="var(--heading)" font-weight="680">端到端加密</text>
        <text x="70" y="216" text-anchor="middle" fill="var(--muted)" font-size="11">HTTPS / PGP</text>
        <rect x="140" y="170" width="526" height="62" rx="8" fill="var(--surface)" stroke="var(--line)"/>
        <text x="156" y="194" fill="var(--heading)" font-weight="650">源主机(加密) ═══════[中间路由器全程不解密]═══════▶ 目的主机(解密)</text>
        <text x="156" y="216" fill="var(--muted)" font-size="11.5">特点：无需信任中间网络节点，部署灵活；但报文头明文，无法隐藏通信双方地址。</text>
      </g>
    </svg>`
  );

  // 4. Ch03: 数字签名与 CA 证书验证链交互图
  function mountSignaturePKI(root) {
    root.innerHTML = `
      <div class="inline-visual-header">
        <span class="inline-visual-badge">交互图解</span>
        <h4>数字签名、双重加解密与 CA 证书验证链</h4>
        <p>切换三种高频考题模式，一眼看清每一步究竟使用「谁的公钥」还是「谁的私钥」。</p>
      </div>
      <div class="ppf-panel micro-panel">
        <div class="ppf-chart">
          <svg viewBox="0 0 540 218" role="img" aria-label="数字签名与PKI验证流程图">
            <defs><marker id="arr-sig" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 1l8 4-8 4z" fill="var(--accent)"/></marker></defs>
            <rect x="14" y="24" width="144" height="164" rx="10" fill="var(--surface)" stroke="var(--accent-line)"/>
            <text x="86" y="50" text-anchor="middle" fill="var(--accent)" font-size="13" font-weight="680" data-role="left-t">发送方 B</text>
            <text x="86" y="84" text-anchor="middle" fill="var(--heading)" font-size="12" font-weight="650" data-role="left-1"></text>
            <text x="86" y="112" text-anchor="middle" fill="var(--muted)" font-size="11.5" data-role="left-2"></text>
            <text x="86" y="148" text-anchor="middle" fill="var(--mv-c2)" font-size="11.5" font-weight="650" data-role="left-3"></text>

            <line x1="158" y1="106" x2="196" y2="106" stroke="var(--accent)" stroke-width="2" marker-end="url(#arr-sig)"/>

            <rect x="200" y="50" width="140" height="112" rx="10" fill="var(--accent-soft)" stroke="var(--accent)"/>
            <text x="270" y="82" text-anchor="middle" fill="var(--accent)" font-size="12.5" font-weight="680" data-role="mid-t"></text>
            <text x="270" y="112" text-anchor="middle" fill="var(--heading)" font-size="12" font-weight="650" data-role="mid-1"></text>
            <text x="270" y="138" text-anchor="middle" fill="var(--muted)" font-size="11" data-role="mid-2"></text>

            <line x1="340" y1="106" x2="378" y2="106" stroke="var(--accent)" stroke-width="2" marker-end="url(#arr-sig)"/>

            <rect x="382" y="24" width="144" height="164" rx="10" fill="var(--surface)" stroke="var(--line)"/>
            <text x="454" y="50" text-anchor="middle" fill="var(--heading)" font-size="13" font-weight="680" data-role="right-t">接收方 A</text>
            <text x="454" y="84" text-anchor="middle" fill="var(--heading)" font-size="12" font-weight="650" data-role="right-1"></text>
            <text x="454" y="112" text-anchor="middle" fill="var(--muted)" font-size="11.5" data-role="right-2"></text>
            <text x="454" y="148" text-anchor="middle" fill="var(--accent)" font-size="11.5" font-weight="650" data-role="right-3"></text>
          </svg>
        </div>
        <div class="ppf-controls">
          <fieldset class="ppf-scenarios">
            <legend>选择认证/签名场景</legend>
            <label><input type="radio" name="sig-mode" value="sign" checked> 仅数字签名（完整性 + 不可否认性）</label>
            <label><input type="radio" name="sig-mode" value="both"> 先签名后加密（机密性 + 不可否认性）</label>
            <label><input type="radio" name="sig-mode" value="ca"> CA 签发与验证 X.509 数字证书</label>
          </fieldset>
          <div class="ppf-explanation" data-role="msg" aria-live="polite"></div>
        </div>
      </div>`;
    const modes = {
      sign: {
        lt: '发送方 B', l1: '1. 计算摘要 H(M)', l2: '2. 用 B 私钥签名', l3: '密钥：KB_pri',
        mt: '网络传输', m1: '{ M, Sign(H) }', m2: '明文 + 签名值',
        rt: '接收方 A', r1: '1. 用 B 公钥验签', r2: '2. 重算 H(M) 比对', r3: '密钥：KB_pub',
        msg: '数字签名看「发送方」密钥对：发送方 B 用自己的私钥对摘要签名，接收方 A 用 B 的公钥验证，确保内容未被篡改且 B 无法抵赖。',
      },
      both: {
        lt: '发送方 B', l1: '1. B 私钥签名摘要', l2: '2. A 公钥加密整体', l3: 'KApub(KBpri(M\'))',
        mt: '双重封装', m1: '保密 + 抗抵赖', m2: '外层加密 · 内层签名',
        rt: '接收方 A', r1: '1. A 私钥解密外层', r2: '2. B 公钥验证内层', r3: '先解密，后验签',
        msg: '双重加解密真题公式：发送方 B 先用自己私钥签名，再用接收方 A 的公钥加密；A 收到后先用自己私钥解密，再用 B 的公钥验签。',
      },
      ca: {
        lt: '权威 CA 机构', l1: '核验网站身份与公钥', l2: '用 CA 私钥签署证书', l3: '不含网站私钥！',
        mt: 'X.509 证书', m1: '身份 + 网站公钥', m2: '+ 有效期 + CA签名',
        rt: '浏览器客户端', r1: '用内置 CA 公钥验签', r2: '检查有效期与 CRL', r3: '确认网站公钥可信',
        msg: 'PKI 证书验证链：CA 用「CA 私钥」给证书签名，客户端用系统预置的「CA 公钥」验证签名，并核查证书是否被列入 CRL 吊销列表。',
      },
    };
    const radios = [...root.querySelectorAll('input[name="sig-mode"]')];
    function draw() {
      const m = modes[radios.find(r => r.checked).value];
      root.querySelector('[data-role="left-t"]').textContent = m.lt;
      root.querySelector('[data-role="left-1"]').textContent = m.l1;
      root.querySelector('[data-role="left-2"]').textContent = m.l2;
      root.querySelector('[data-role="left-3"]').textContent = m.l3;
      root.querySelector('[data-role="mid-t"]').textContent = m.mt;
      root.querySelector('[data-role="mid-1"]').textContent = m.m1;
      root.querySelector('[data-role="mid-2"]').textContent = m.m2;
      root.querySelector('[data-role="right-t"]').textContent = m.rt;
      root.querySelector('[data-role="right-1"]').textContent = m.r1;
      root.querySelector('[data-role="right-2"]').textContent = m.r2;
      root.querySelector('[data-role="right-3"]').textContent = m.r3;
      root.querySelector('[data-role="msg"]').textContent = m.msg;
    }
    radios.forEach(r => r.addEventListener('change', draw));
    draw();
  }

  // 5. Ch04: 纵深防御拓扑（串联 IPS vs 旁路 IDS vs 蜜罐 vs 堡垒机）
  const renderDefenseTopology = () => wrapStatic(
    '企业网络纵深防御部署拓扑（串联阻断 vs 旁路监听 vs 主动诱捕）',
    '看清不同安全设备的接入方式：防火墙与 IPS 串联在主干实时拦截，IDS 旁路镜像告警，蜜罐主动诱捕，堡垒机收口运维。',
    `<svg viewBox="0 0 680 258" role="img" aria-label="企业网络纵深防御部署拓扑图" style="width:100%;height:auto;display:block">
      <defs><marker id="arr-def" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 1l8 4-8 4z" fill="var(--accent)"/></marker></defs>
      <!-- Main inline chain -->
      <rect x="16" y="42" width="96" height="58" rx="9" fill="var(--surface-subtle)" stroke="var(--error)" stroke-width="1.5"/>
      <text x="64" y="68" text-anchor="middle" fill="var(--error)" font-size="12.5" font-weight="680">Internet</text>
      <text x="64" y="86" text-anchor="middle" fill="var(--muted)" font-size="11">外部不可信网</text>

      <line x1="112" y1="71" x2="146" y2="71" stroke="var(--accent)" stroke-width="2" marker-end="url(#arr-def)"/>

      <rect x="150" y="42" width="114" height="58" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.8"/>
      <text x="207" y="67" text-anchor="middle" fill="var(--accent)" font-size="12.5" font-weight="680">边界防火墙</text>
      <text x="207" y="86" text-anchor="middle" fill="var(--text)" font-size="11">串联 · 边界过滤</text>

      <line x1="264" y1="71" x2="298" y2="71" stroke="var(--accent)" stroke-width="2" marker-end="url(#arr-def)"/>

      <rect x="302" y="42" width="118" height="58" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.8"/>
      <text x="361" y="67" text-anchor="middle" fill="var(--accent)" font-size="12.5" font-weight="680">IPS 入侵防御</text>
      <text x="361" y="86" text-anchor="middle" fill="var(--text)" font-size="11">串联 · 实时阻断</text>

      <line x1="420" y1="71" x2="454" y2="71" stroke="var(--accent)" stroke-width="2" marker-end="url(#arr-def)"/>

      <rect x="458" y="42" width="96" height="58" rx="9" fill="var(--surface)" stroke="var(--line)" stroke-width="1.5"/>
      <text x="506" y="67" text-anchor="middle" fill="var(--heading)" font-size="12.5" font-weight="680">核心交换机</text>
      <text x="506" y="86" text-anchor="middle" fill="var(--muted)" font-size="11">VLAN + ACL</text>

      <line x1="554" y1="71" x2="584" y2="71" stroke="var(--accent)" stroke-width="2" marker-end="url(#arr-def)"/>

      <rect x="588" y="42" width="78" height="58" rx="9" fill="var(--surface)" stroke="var(--accent-line)" stroke-width="1.5"/>
      <text x="627" y="67" text-anchor="middle" fill="var(--heading)" font-size="12" font-weight="680">内网业务</text>
      <text x="627" y="86" text-anchor="middle" fill="var(--muted)" font-size="10.5">核心资产</text>

      <!-- Branching devices -->
      <line x1="207" y1="100" x2="207" y2="154" stroke="var(--warning)" stroke-width="1.6" stroke-dasharray="4 3"/>
      <rect x="132" y="156" width="150" height="62" rx="9" fill="var(--warning-soft)" stroke="var(--warning)"/>
      <text x="207" y="182" text-anchor="middle" fill="var(--warning)" font-size="12.5" font-weight="680">蜜罐（Honeypot）</text>
      <text x="207" y="202" text-anchor="middle" fill="var(--muted)" font-size="11">主动诱捕 · 收集威胁情报</text>

      <line x1="506" y1="100" x2="386" y2="154" stroke="var(--mv-c2)" stroke-width="1.6" stroke-dasharray="4 3"/>
      <rect x="306" y="156" width="160" height="62" rx="9" fill="var(--surface)" stroke="var(--mv-c2)" stroke-width="1.6"/>
      <text x="386" y="182" text-anchor="middle" fill="var(--mv-c2)" font-size="12.5" font-weight="680">IDS 入侵检测</text>
      <text x="386" y="202" text-anchor="middle" fill="var(--muted)" font-size="11">旁路镜像 · 告警与审计</text>

      <line x1="506" y1="100" x2="578" y2="154" stroke="var(--accent)" stroke-width="1.6"/>
      <rect x="494" y="156" width="168" height="62" rx="9" fill="var(--surface)" stroke="var(--accent-line)" stroke-width="1.6"/>
      <text x="578" y="182" text-anchor="middle" fill="var(--heading)" font-size="12.5" font-weight="680">堡垒主机（运维审计）</text>
      <text x="578" y="202" text-anchor="middle" fill="var(--muted)" font-size="11">运维唯一入口 · 全程录屏</text>

      <text x="340" y="246" text-anchor="middle" fill="var(--muted)" font-size="11.5">口诀：主干串联看防火墙/IPS（能实时拦截），交换机镜像接 IDS（不影响转发），蜜罐诱敌、堡垒机管运维。</text>
    </svg>`
  );

  // 6. Ch05: DMZ 三区访问策略交互模拟器
  function mountDMZPolicy(root) {
    root.innerHTML = `
      <div class="inline-visual-header">
        <span class="inline-visual-badge">交互图解</span>
        <h4>DMZ 非军事区三区访问策略模拟器</h4>
        <p>选择发起访问的「源区域」与目标「目的区域」，即时验证标准防火墙策略是否放行及受保护级别关系。</p>
      </div>
      <div class="ppf-panel micro-panel">
        <div class="ppf-chart">
          <svg viewBox="0 0 540 230" role="img" aria-label="DMZ三区防火墙访问策略示意图">
            <rect x="18" y="34" width="136" height="148" rx="10" data-zone="ext" fill="var(--surface)" stroke="var(--line)" stroke-width="1.5"/>
            <text x="86" y="64" text-anchor="middle" fill="var(--error)" font-size="13.5" font-weight="680">外网 Untrust</text>
            <text x="86" y="90" text-anchor="middle" fill="var(--muted)" font-size="11.5">公共互联网</text>
            <text x="86" y="158" text-anchor="middle" fill="var(--muted)" font-size="11">保护级别：最低</text>

            <rect x="202" y="34" width="136" height="148" rx="10" data-zone="dmz" fill="var(--surface)" stroke="var(--warning)" stroke-width="1.6"/>
            <text x="270" y="64" text-anchor="middle" fill="var(--warning)" font-size="13.5" font-weight="680">隔离区 DMZ</text>
            <text x="270" y="90" text-anchor="middle" fill="var(--muted)" font-size="11.5">官网 Web / 邮件网关</text>
            <text x="270" y="158" text-anchor="middle" fill="var(--warning)" font-size="11">保护级别：中等</text>

            <rect x="386" y="34" width="136" height="148" rx="10" data-zone="int" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.8"/>
            <text x="454" y="64" text-anchor="middle" fill="var(--accent)" font-size="13.5" font-weight="680">内网 Trust</text>
            <text x="454" y="90" text-anchor="middle" fill="var(--muted)" font-size="11.5">办公网 / 核心数据库</text>
            <text x="454" y="158" text-anchor="middle" fill="var(--accent)" font-size="11" font-weight="650">保护级别：最高</text>

            <rect x="158" y="84" width="40" height="48" rx="6" fill="var(--surface-subtle)" stroke="var(--control-line)"/>
            <text x="178" y="112" text-anchor="middle" fill="var(--heading)" font-size="11" font-weight="680">FW1</text>

            <rect x="342" y="84" width="40" height="48" rx="6" fill="var(--surface-subtle)" stroke="var(--control-line)"/>
            <text x="362" y="112" text-anchor="middle" fill="var(--heading)" font-size="11" font-weight="680">FW2</text>

            <text x="270" y="212" text-anchor="middle" fill="var(--heading)" font-size="12.5" font-weight="650" data-role="verdict"></text>
          </svg>
        </div>
        <div class="ppf-controls">
          <fieldset class="ppf-scenarios">
            <legend>测试跨区访问方向</legend>
            <label><input type="radio" name="dmz-dir" value="ext-dmz" checked> 外网 → DMZ（访问公开 443 端口）</label>
            <label><input type="radio" name="dmz-dir" value="ext-int"> 外网 → 内网（直连核心数据库）</label>
            <label><input type="radio" name="dmz-dir" value="dmz-int"> DMZ → 内网（主动发起连接）</label>
            <label><input type="radio" name="dmz-dir" value="int-dmz"> 内网 → DMZ / 外网（按策略访问）</label>
          </fieldset>
          <div class="ppf-explanation" data-role="msg" aria-live="polite"></div>
        </div>
      </div>`;
    const cases = {
      'ext-dmz': { z: ['ext', 'dmz'], v: '✓ 有限放行：外网仅允许访问 DMZ 特定公开端口（如 80/443）', msg: 'DMZ 的职责就是对外发布服务。外网用户可以访问 DMZ 中开放的 Web/邮件公开端口，但其他无关端口一律拦截。' },
      'ext-int': { z: ['ext', 'int'], v: '× 严格禁止：外网绝不允许直接穿透访问内网', msg: '内网受保护程度最高（内网 > DMZ > 外网），任何来自外网的直接入站请求均被防火墙直接丢弃。' },
      'dmz-int': { z: ['dmz', 'int'], v: '× 默认禁止：防止 DMZ 失陷后成为跳板渗透内网', msg: 'DMZ 直接暴露在互联网下风险较高，因此默认严格禁止 DMZ 主动向内网发起连接，以隔离潜在横向渗透。' },
      'int-dmz': { z: ['int', 'dmz'], v: '✓ 受控允许：内网可按策略管理 DMZ 或经代理访问外网', msg: '高信任区可以按最小化策略单向访问低信任区（如运维人员管理 DMZ 服务器，或员工按策略浏览外网）。' },
    };
    const radios = [...root.querySelectorAll('input[name="dmz-dir"]')];
    function draw() {
      const c = cases[radios.find(r => r.checked).value];
      root.querySelectorAll('[data-zone]').forEach(el => {
        const active = c.z.includes(el.dataset.zone);
        el.setAttribute('stroke-width', active ? '2.8' : '1.2');
        el.style.opacity = active ? '1' : '0.45';
      });
      root.querySelector('[data-role="verdict"]').textContent = c.v;
      root.querySelector('[data-role="msg"]').textContent = c.msg;
    }
    radios.forEach(r => r.addEventListener('change', draw));
    draw();
  }

  // 7. Ch06: Linux chmod 权限交互计算器
  function mountChmodCalc(root) {
    root.innerHTML = `
      <div class="inline-visual-header">
        <span class="inline-visual-badge">交互图解</span>
        <h4>Linux 文件权限 chmod（r=4 / w=2 / x=1）实时计算器</h4>
        <p>勾选所有者、所属组与其他用户的读/写/执行权限，即时换算八进制数字与符号权限表示。</p>
      </div>
      <div class="ppf-panel micro-panel">
        <div class="ppf-chart" style="padding:14px">
          <table style="width:100%;margin:0">
            <thead>
              <tr><th>主体类别</th><th>读 r (4)</th><th>写 w (2)</th><th>执行 x (1)</th><th>小计</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>所有者 (u)</strong></td>
                <td><input type="checkbox" data-p="u" value="4" checked></td>
                <td><input type="checkbox" data-p="u" value="2" checked></td>
                <td><input type="checkbox" data-p="u" value="1" checked></td>
                <td><strong data-sum="u">7</strong></td>
              </tr>
              <tr>
                <td><strong>所属组 (g)</strong></td>
                <td><input type="checkbox" data-p="g" value="4" checked></td>
                <td><input type="checkbox" data-p="g" value="2"></td>
                <td><input type="checkbox" data-p="g" value="1" checked></td>
                <td><strong data-sum="g">5</strong></td>
              </tr>
              <tr>
                <td><strong>其他用户 (o)</strong></td>
                <td><input type="checkbox" data-p="o" value="4"></td>
                <td><input type="checkbox" data-p="o" value="2"></td>
                <td><input type="checkbox" data-p="o" value="1"></td>
                <td><strong data-sum="o">0</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="ppf-controls">
          <div class="ppf-outputs">
            <div><span>八进制权限</span><strong data-role="oct">750</strong></div>
            <div><span>符号表示</span><strong data-role="sym">rwxr-x---</strong></div>
          </div>
          <div class="ppf-explanation" data-role="msg" aria-live="polite"></div>
          <div class="button-row">
            <button type="button" class="button button-secondary" data-pre="600">密钥文件 600</button>
            <button type="button" class="button button-secondary" data-pre="644">普通文件 644</button>
            <button type="button" class="button button-secondary" data-pre="750">内部脚本 750</button>
            <button type="button" class="button button-secondary" data-pre="755">公开程序 755</button>
          </div>
        </div>
      </div>`;
    const roles = ['u', 'g', 'o'];
    const bitsToSym = n => ((n & 4) ? 'r' : '-') + ((n & 2) ? 'w' : '-') + ((n & 1) ? 'x' : '-');
    function update() {
      let oct = '', sym = '';
      for (const r of roles) {
        const sum = [...root.querySelectorAll(`input[data-p="${r}"]:checked`)].reduce((a, c) => a + Number(c.value), 0);
        root.querySelector(`[data-sum="${r}"]`).textContent = String(sum);
        oct += String(sum);
        sym += bitsToSym(sum);
      }
      root.querySelector('[data-role="oct"]').textContent = oct;
      root.querySelector('[data-role="sym"]').textContent = sym;
      const warn = Number(oct[2]) & 2 ? '⚠️ 注意：向「其他用户」开放写权限存在严重越权篡改风险，生产环境应禁止！' : `等价命令：chmod ${oct} filename（符号权限 -${sym}）。`;
      root.querySelector('[data-role="msg"]').textContent = warn;
    }
    root.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.addEventListener('change', update));
    root.querySelectorAll('[data-pre]').forEach(btn => btn.addEventListener('click', () => {
      const code = btn.dataset.pre;
      roles.forEach((r, idx) => {
        const val = Number(code[idx]);
        root.querySelectorAll(`input[data-p="${r}"]`).forEach(cb => {
          cb.checked = Boolean(val & Number(cb.value));
        });
      });
      update();
    }));
    update();
  }

  function mountInformationFlow(root) {
    root.innerHTML = wrapStatic(
      'BLP 与 Biba 的读写方向',
      '箭头表示信息流，从信息来源指向接收方。主体和客体在同一级别时仍须满足其他授权规则。',
      `<svg viewBox="0 0 560 228" role="img" aria-label="BLP 允许信息由低密级流向高密级，Biba 严格模型允许信息由高完整性流向低完整性">
        <g fill="var(--surface)" stroke="var(--line)">
          <rect x="12" y="12" width="260" height="204" rx="12"/>
          <rect x="288" y="12" width="260" height="204" rx="12"/>
        </g>
        <g text-anchor="middle" fill="var(--heading)" font-size="17" font-weight="650">
          <text x="142" y="42">BLP · 机密性</text>
          <text x="418" y="42">Biba · 完整性</text>
        </g>
        <g fill="var(--accent-soft)" stroke="var(--accent-line)">
          <rect x="44" y="57" width="196" height="36" rx="7"/><rect x="320" y="57" width="196" height="36" rx="7"/>
          <rect x="44" y="148" width="196" height="36" rx="7"/><rect x="320" y="148" width="196" height="36" rx="7"/>
        </g>
        <g text-anchor="middle" fill="var(--heading)" font-size="15">
          <text x="142" y="80">高密级</text><text x="418" y="80">高完整性</text>
          <text x="142" y="171">低密级</text><text x="418" y="171">低完整性</text>
        </g>
        <g stroke="var(--accent)" stroke-width="2.5" fill="none">
          <path d="M142 142V101m-6 7 6-7 6 7"/><path d="M418 99v41m-6-7 6 7 6-7"/>
        </g>
        <g text-anchor="middle" fill="var(--muted)" font-size="14">
          <text x="142" y="202">不上读 · 不下写</text><text x="418" y="202">不下读 · 不上写</text>
        </g>
      </svg>`
    );
  }

  function mountSequence(root, title, description, steps) {
    const rows = steps.map(([label, detail], index) => {
      const y = 10 + index * 48;
      return `<rect x="16" y="${y}" width="388" height="36" rx="8" fill="var(--surface-subtle)" stroke="var(--line)"/>
        <circle cx="36" cy="${y + 18}" r="11" fill="var(--accent-soft)" stroke="var(--accent-line)"/>
        <text x="36" y="${y + 23}" fill="var(--accent)" text-anchor="middle" font-size="13">${index + 1}</text>
        <text x="56" y="${y + 23}" fill="var(--heading)" font-weight="650" font-size="15">${label}</text>
        <text x="158" y="${y + 23}" fill="var(--muted)" font-size="13">${detail}</text>`;
    }).join('');
    const height = 48 * steps.length + 8;
    root.innerHTML = wrapStatic(title, description,
      `<svg viewBox="0 0 420 ${height}" role="img" aria-label="${steps.map(([label, detail]) => label + '，' + detail).join('；')}">
        ${rows}
      </svg>`);
  }

  const registry = {
    'sec-cia-layers': container => { container.innerHTML = renderCIALayers(); },
    'sec-hybrid-crypto': mountHybridCrypto,
    'sec-transmission-crypto': container => { container.innerHTML = renderTransmissionCrypto(); },
    'sec-signature-pki': mountSignaturePKI,
    'sec-defense-topology': container => { container.innerHTML = renderDefenseTopology(); },
    'sec-dmz-policy': mountDMZPolicy,
    'sec-chmod-calc': mountChmodCalc,
    'sec-information-flow': mountInformationFlow,
    'sec-incident-response': root => mountSequence(root, '事件响应步骤', '以事件的范围与影响决定通知、隔离和恢复顺序。', [
      ['发现与确认', '关联告警，确定事件与范围'],
      ['定级与遏制', '上报负责人，限制波及面'],
      ['清除与恢复', '处置根因，核验后分步恢复'],
      ['事后复盘', '保存证据，更新控制与预案'],
    ]),
    'sec-vulnerability-cycle': root => mountSequence(root, '漏洞管理过程', '对每个受影响资产分别记录修复责任和验证结果。', [
      ['登记与确认', '核对版本、配置和实际暴露'],
      ['排序', '结合利用态势和业务影响'],
      ['修复与缓解', '补丁、配置或临时控制'],
      ['复测与关闭', '验证控制，保留处理记录'],
    ]),
    'sec-data-lifecycle': root => mountSequence(root, '数据生命周期的防护措施', '根据数据用途和敏感等级决定各阶段的控制。', [
      ['采集与传输', '最小采集，保护通道'],
      ['存储与处理', '分级授权，加密，留痕'],
      ['共享与使用', '用途校验，脱敏，审计'],
      ['留存与销毁', '按期限保留，验证删除'],
    ]),
  };

  document.querySelectorAll('[data-micro-visual]').forEach(container => {
    const fn = registry[container.dataset.microVisual];
    if (fn) fn(container);
  });
})();
