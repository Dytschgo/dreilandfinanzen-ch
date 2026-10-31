/* Local Chrome regression checks. Setup and scope: README.md. No production requests. */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('../dist/qa/node_modules/playwright');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist', 'qa', 'evidence', 'simple');

(async () => {
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const errors = [], externalRequests = [], checks = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { if (/^https?:/.test(request.url())) externalRequests.push(request.url()); });
    await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
    await page.evaluate(() => document.fonts.ready);
    const text = selector => page.locator(selector).textContent();
    const step = async n => assert.equal(await page.locator('#rechner').getAttribute('data-step'), String(n));
    const go = async (from, to) => page.locator(`.step[data-step="${from}"] .actions [data-go="${to}"]`).click();
    const slider = async (id, value) => page.locator(id).evaluate((el, value) => {
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, String(value));
    const setBudget = async (income = '6000', rent = '1500') => {
      await page.locator('.stepper [data-go="1"]').click();
      await page.locator('#ink').fill(income);
      await page.locator('#miete').fill(rent);
      await go(1, 2);
    };
    const noOverflow = async label => {
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, label + ': page overflow');
      assert.equal(await page.locator('#rechner').evaluate(el => el.scrollWidth <= el.clientWidth), true, label + ': calculator overflow');
      const clipped = await page.locator('#rechner .btn:visible, #rechner label:visible, #rechner output:visible').evaluateAll(els => els.filter(el => el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1).map(el => el.textContent));
      assert.deepEqual(clipped, [], label + ': clipped controls');
    };
    const capture = name => page.locator('#rechner').screenshot({ path: path.join(output, name + '.png'), style: '.header, .skip { visibility: hidden; }' });

    assert.equal(await text('#rate'), 'CHF 484.77');
    assert.equal(await page.locator('#zweck').count(), 0);
    await page.locator('#laufzeit').focus();
    await page.keyboard.press('End');
    assert.equal(await text('#laufzeit-out'), '120 Monate');
    await page.locator('#betrag').fill('81000');
    assert.equal(await page.locator('#laufzeit').inputValue(), '84');
    assert.equal(await page.locator('#laufzeit').getAttribute('max'), '84');
    assert.equal(await page.locator('#adj-lz').getAttribute('max'), '84');
    assert.equal(await page.locator('#terms-note').isVisible(), true);
    await page.locator('#betrag').fill('80000');
    assert.equal(await page.locator('#laufzeit').getAttribute('max'), '120');
    await page.locator('#betrag').fill('4999');
    await go(0, 1);
    await step(0);
    assert.equal(await page.locator('#betrag').getAttribute('aria-invalid'), 'true');
    await page.locator('#betrag').fill('300001');
    assert.equal(await text('#rate'), '–');
    await page.locator('#betrag').fill('20000');
    await slider('#laufzeit', 48);
    checks.push('Credit pricing, amount limits, keyboard duration slider and term cap above CHF 80,000');

    await go(0, 1);
    assert.equal(await page.locator('.step[data-step="1"] input').count(), 2);
    assert.equal(await page.locator('.step[data-step="1"] select').count(), 0);
    await go(1, 2);
    await step(1);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'ink');
    assert.match(await text('#budget-err'), /Nettoeinkommen, Miete/);
    await page.locator('#ink').fill('6000');
    await go(1, 2);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'miete');
    for (const id of ['ink', 'miete', 'laufzeit', 'adj-lz']) {
      assert.equal(await page.locator('#' + id).evaluate(el => el.labels.length > 0 && (el.getAttribute('aria-describedby') || '').split(' ').filter(Boolean).every(id => document.getElementById(id))), true);
    }
    checks.push('Only income and rent are asked; missing entries block progression with labelled errors and focus');

    await setBudget();
    assert.equal(await text('#est-frei'), "CHF 1'515.23");
    assert.match(await text('#allowance-note'), /CHF 2'500.00/);
    assert.match(await text('#est-unit'), /nach Rate/);
    await page.locator('#adj-lz').focus();
    await page.keyboard.press('End');
    assert.equal(await text('#adj-rate'), 'CHF 238.74');
    assert.equal(await text('#est-frei'), "CHF 1'761.26");
    assert.equal(await page.locator('#laufzeit').inputValue(), '120');
    await page.keyboard.press('Home');
    assert.equal(await text('#adj-rate'), "CHF 1'736.33");
    assert.equal(await text('#est-frei'), 'CHF 263.67');
    await page.keyboard.press('ArrowRight');
    assert.equal(await text('#adj-lz-out'), '24 Monate');
    assert.equal(await page.locator('#adj-lz').getAttribute('aria-valuetext'), '24 Monate');
    await slider('#adj-lz', 48);
    await slider('#adj-betrag', 1000);
    assert.equal(await text('#adj-betrag-out'), "CHF 300'000.–");
    assert.equal(await page.locator('#adj-lz').getAttribute('max'), '84');
    await go(2, 1);
    await go(1, 0);
    await page.locator('#betrag').fill('20000');
    await slider('#laufzeit', 48);
    await setBudget('10000', '1500');
    assert.match(await text('#allowance-note'), /CHF 4'000.00/);
    assert.equal(await text('#est-frei'), "CHF 4'015.23");
    checks.push('Illustrative expense floor and income share; selected-term rate, sliders and estimate stay in sync');

    for (const [income, rent, buffer, unit, status] of [
      ['4484.77', '1500', 'CHF 0.00', 'bleiben pro Monat nach Rate', 'Kein geschätzter Spielraum'],
      ['4484.76', '1500', 'CHF 0.01', 'fehlen pro Monat', 'Geschätzte Budgetlücke'],
      ['0', '0', "CHF 2'984.77", 'fehlen pro Monat', 'Geschätzte Budgetlücke'],
      ["6'000,50", '1500,25', "CHF 1'515.48", 'bleiben pro Monat nach Rate', 'Grobe Budgetschätzung'],
    ]) {
      await setBudget(income, rent);
      assert.equal(await text('#est-frei'), buffer);
      assert.equal(await text('#est-unit'), unit);
      assert.equal(await text('#est-status'), status);
      if (income === '4484.77' || income === '4484.76') await capture(income === '4484.77' ? 'zero' : 'negative');
      await page.locator('.step[data-step="2"] [data-consult]').click();
      assert.match(await text('#consult-text'), /Miete/);
      assert.match(await text('#consult-text'), /pauschal geschätzt/);
      assert.ok((await text('#consult-text')).includes(buffer.replace('CHF ', unit === 'fehlen pro Monat' ? 'CHF −' : 'CHF ')));
      assert.match(await text('#consult-text'), /keine Garantie/);
    }
    checks.push('Positive, zero, negative and one-cent estimates, Swiss decimal input and signed consultation summary');

    for (const [id, value] of [['ink', ''], ['miete', '-1'], ['ink', 'abc'], ['miete', '100.123'], ['ink', 'Infinity'], ['miete', '1e3']]) {
      await setBudget();
      await go(2, 1);
      await page.locator('#' + id).fill(value);
      assert.equal(await text('#est-frei'), '–');
      await go(1, 2);
      await step(1);
      assert.equal(await page.locator('#' + id).getAttribute('aria-invalid'), 'true');
      assert.equal(await page.evaluate(() => document.activeElement.id), id);
      await page.locator('#rechner > .tool__consult [data-consult]').click();
      assert.doesNotMatch(await text('#consult-text'), /Grobe Budgetschätzung:/);
    }
    await setBudget();
    const customerText = await page.locator('#rechner').textContent();
    assert.doesNotMatch(customerText, /Prüfrate|30 Zahlungen|31–36|Dreiland-Budgetregel|Optimierung nötig|Tragbar im Budgetcheck/);
    assert.match(customerText, /keine Garantie für den gewünschten Betrag/);
    assert.match(customerText, /Die Kreditvergabe ist verboten/);
    checks.push('Invalid inputs clear stale figures and summaries; scoring rules removed and estimate/legal notices retained');

    for (const width of [1440, 900, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await noOverflow(width + ': result');
      await capture('result-' + width);
      await go(2, 1);
      assert.equal(await page.locator('#miete').inputValue(), "1'500");
      await noOverflow(width + ': budget');
      await capture('budget-' + width);
      await page.locator('#miete').focus();
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.textContent), 'Meinen Spielraum ansehen');
      await page.keyboard.press('Enter');
      await step(2);
      assert.equal(await page.evaluate(() => document.activeElement.id), 's3-title');
      await go(2, 1);
      await go(1, 0);
      await noOverflow(width + ': credit');
      await capture('credit-' + width);
      await go(0, 1);
      await go(1, 2);
    }
    checks.push('All three steps at 1440/900/390/320px, keyboard progression and back-navigation preserve inputs');
    await page.setViewportSize({ width: 1280, height: 1000 });
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    for (const n of [0, 1, 2]) {
      await page.locator(`.stepper [data-go="${n}"]`).click();
      await noOverflow('200% text step ' + n);
      await capture('text-200-step-' + n);
    }
    checks.push('200% text remains usable without overflow or clipped controls');
    assert.deepEqual(errors, [], 'Browser runtime errors');
    assert.deepEqual(externalRequests, [], 'Calculator must not send data to external services');
    const report = { sourceBase: '5309314 (local working changes)', checks, runtimeErrors: errors, externalRequests, evidence: output };
    await fs.writeFile(path.join(output, 'checks.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
