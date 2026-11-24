(() => {
  'use strict';
  const byId = name => document.getElementById('market-' + name);
  const priceInput = byId('price');
  const demandInput = byId('demand');
  const supplyInput = byId('supply');
  const controls = [priceInput, demandInput, supplyInput];
  const x = quantity => 54 + 3 * quantity;
  const y = price => 296 - 6.75 * price;
  const demand = (price, shift) => 100 + shift - 2 * price;
  const supply = (price, shift) => 20 + shift + 2 * price;
  const curve = (fn, shift) => `M${x(fn(0, shift))} ${y(0)}L${x(fn(40, shift))} ${y(40)}`;
  const signed = number => number > 0 ? '+' + number : String(number);
  const eqPrice = (demandShift, supplyShift) => (80 + demandShift - supplyShift) / 4;

  function setPoint(element, attributes) {
    for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
  }

  function draw() {
    const [price, demandShift, supplyShift] = controls.map(input => input.valueAsNumber);
    const balancedPrice = eqPrice(demandShift, supplyShift);
    const balancedQuantity = demand(balancedPrice, demandShift);
    const demandQuantity = demand(price, demandShift);
    const supplyQuantity = supply(price, supplyShift);
    const gap = demandQuantity - supplyQuantity;
    byId('demand-curve').setAttribute('d', curve(demand, demandShift));
    byId('supply-curve').setAttribute('d', curve(supply, supplyShift));
    byId('demand-before').classList.toggle('market-inactive', demandShift === 0);
    byId('supply-before').classList.toggle('market-inactive', supplyShift === 0);
    byId('price-guide').setAttribute('d', `M54 ${y(price)}H${x(Math.max(demandQuantity, supplyQuantity))}`);
    byId('equilibrium-guide').setAttribute('d', `M54 ${y(balancedPrice)}H${x(balancedQuantity)}V296`);
    setPoint(byId('equilibrium-point'), { cx: x(balancedQuantity), cy: y(balancedPrice) });
    setPoint(byId('equilibrium-label'), { x: x(balancedQuantity) + 12, y: y(balancedPrice) - 10 });
    setPoint(byId('qd-point'), { cx: x(demandQuantity), cy: y(price) });
    setPoint(byId('qs-point'), { x: x(supplyQuantity) - 5, y: y(price) - 5 });
    byId('qd-point').classList.toggle('market-inactive', gap === 0);
    byId('qs-point').classList.toggle('market-inactive', gap === 0);
    byId('price-value').value = String(price);
    byId('demand-value').value = signed(demandShift);
    byId('supply-value').value = signed(supplyShift);
    byId('qd').textContent = String(demandQuantity);
    byId('qs').textContent = String(supplyQuantity);
    const equilibrium = `均衡价格 ${balancedPrice} · 均衡数量 ${balancedQuantity}`;
    const explanation = gap > 0 ? `当前价格下短缺 ${gap} 单位，需求量大于供给量。` :
      gap < 0 ? `当前价格下过剩 ${-gap} 单位，供给量大于需求量。` :
      '当前价格下供需相等，市场达到均衡。';
    if (byId('equilibrium').textContent !== equilibrium) byId('equilibrium').textContent = equilibrium;
    if (byId('gap').textContent !== explanation) byId('gap').textContent = explanation;
  }

  controls.forEach(input => input.addEventListener('input', draw));
  byId('match').addEventListener('click', () => {
    priceInput.value = eqPrice(demandInput.valueAsNumber, supplyInput.valueAsNumber);
    draw();
  });
  byId('reset').addEventListener('click', () => {
    controls.forEach(input => input.value = input.defaultValue);
    draw();
  });
  byId('demand-before').setAttribute('d', curve(demand, 0));
  byId('supply-before').setAttribute('d', curve(supply, 0));
  draw();
})();
