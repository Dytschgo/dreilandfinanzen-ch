/* Local Chrome regression checks. Setup and scope: README.md. No production requests. */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('../dist/qa/node_modules/playwright');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist', 'qa', 'evidence');
const defaultBudget = { ink: '6000', aus: '3000', pflicht: '200', jahr: '6000', res: '500', mehr: '300', haushalt: '2', stabil: 'stabil' };
const wording = 'Diese Berechnung zeigt Ihren geschätzten monatlichen Spielraum. Ob ein Kredit tragbar ist, prüfen wir gemeinsam anhand Ihrer vollständigen Situation.';

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
    const setBudget = async overrides => {
      await page.locator('.stepper [data-go="1"]').click();
      for (const [id, value] of Object.entries({ ...defaultBudget, ...overrides })) {
        if (id === 'stabil') await page.locator('#' + id).selectOption(value);
        else await page.locator('#' + id).fill(value);
      }
      await go(1, 2);
    };
    const noOverflow = async label => {
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, label + ': page overflow');
      const layout = await page.locator('#rechner').evaluate(el => ({ fits: el.scrollWidth <= el.clientWidth, overflow: [...el.querySelectorAll('*')].filter(child => child.clientWidth && child.scrollWidth > child.clientWidth + 1).map(child => ({ id: child.id, tag: child.tagName, className: child.className, width: child.clientWidth, scroll: child.scrollWidth })) }));
      assert.equal(layout.fits, true, label + ': calculator overflow ' + JSON.stringify(layout.overflow));
    };

    // Preserve selected-term credit pricing and the existing high-amount term cap.
    assert.equal(await text('#rate'), 'CHF 484.77');
    assert.equal(await page.locator('input[name="laufzeit"]').count(), 10);
    await page.locator('#betrag').fill('81000');
    assert.equal(await page.locator('input[name="laufzeit"][value="120"]').isDisabled(), true);
    await page.locator('#betrag').fill('20000');
    assert.equal(await page.locator('input[name="laufzeit"][value="120"]').isDisabled(), false);
    await page.locator('#betrag').fill('4999');
    await go(0, 1);
    await step(0);
    assert.equal(await page.locator('#betrag').getAttribute('aria-invalid'), 'true');
    await page.locator('#betrag').fill('20000');
    checks.push('Selected-term pricing, amount validation and high-amount term cap');

    await go(0, 1);
    await go(1, 2);
    await step(1);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'ink');
    assert.match(await text('#budget-err'), /Jahresrechnungen/);
    assert.equal(await page.locator('#est-frei').textContent(), '–');
    for (const id of Object.keys(defaultBudget)) {
      assert.equal(await page.locator('#' + id).evaluate(el => el.labels.length > 0 && el.getAttribute('aria-describedby').split(' ').every(id => document.getElementById(id))), true);
    }
    checks.push('Missing fields block progression and focus the first labelled invalid field');

    await setBudget({});
    await step(2);
    assert.equal(await text('#b-jahr'), 'CHF 500.00');
    assert.equal(await text('#b-rate'), 'CHF 734.36');
    assert.equal(await text('#b-frei'), "CHF 1'065.64");
    assert.equal(await text('#b-stress'), 'CHF 765.64');
    assert.equal(await page.locator('#estimate').getAttribute('data-state'), 'review');
    assert.equal(await page.locator('#estimate').getAttribute('data-band'), 'go');
    assert.equal(await page.getByText(wording, { exact: true }).isVisible(), true);
    assert.match(await text('#budget-context'), /2 Personen/);
    checks.push('Explicit expense deductions, annual / 12, reserve, 30-payment rate and extra-month buffer');

    await page.locator('#adj-lz').selectOption('120');
    const repaymentCount = await text('#b-payments');
    assert.equal(await text('#adj-rate'), 'CHF 238.74');
    assert.equal(await text('#b-frei'), "CHF 1'065.64");
    await page.locator('#adj-lz').selectOption('12');
    assert.equal(await text('#b-payments'), repaymentCount);
    assert.equal(await text('#b-rate'), "CHF 1'736.33");
    assert.equal(await text('#b-frei'), 'CHF 63.67');
    assert.equal(await page.locator('#estimate').getAttribute('data-state'), 'warn');
    assert.equal(await page.locator('#estimate').getAttribute('data-band'), 'go');
    assert.match(await text('#budget-rate-label'), /12 Zahlungen/);
    await page.locator('#adj-lz').selectOption('48');
    checks.push('Longer selected terms cannot inflate the budget; shorter terms use the higher actual rate');

    await setBudget({ ink: '4984.36', mehr: '100' });
    assert.equal(await text('#b-frei'), 'CHF 50.00');
    assert.equal(await text('#b-stress'), 'CHF −50.00');
    assert.equal(await page.locator('#estimate').getAttribute('data-state'), 'warn');
    await page.locator('#rechner').screenshot({ path: path.join(output, 'pressure-50.png'), style: '.header, .skip { visibility: hidden; }' });
    await page.locator('.step[data-step="2"] [data-consult]').click();
    const summary = await text('#consult-text');
    assert.match(summary, /30 Zahlungen/);
    assert.match(summary, /Spielraum CHF 50.00/);
    assert.match(summary, /CHF −50.00/);
    assert.match(summary, /Haushalt: 2/);
    checks.push('CHF 50 buffer warns under extra-month pressure; consultation summary uses the same signed figures');

    await setBudget({ ink: '4934.36', mehr: '0' });
    assert.equal(await text('#b-frei'), 'CHF 0.00');
    assert.equal(await page.locator('#estimate').getAttribute('data-state'), 'warn');
    await setBudget({ ink: '4900' });
    assert.equal(await text('#b-frei'), 'CHF −34.36');
    assert.equal(await text('#est-unit'), 'fehlen pro Monat');
    assert.equal(await page.locator('#estimate').getAttribute('data-state'), 'warn');
    assert.equal(await page.locator('#estimate').getAttribute('data-band'), 'optimise');
    assert.equal(await text('#b-payments'), '32');
    await page.locator('#rechner').screenshot({ path: path.join(output, 'negative.png'), style: '.header, .skip { visibility: hidden; }' });

    // Whole-payment boundaries, with interest, after all costs and reserve.
    // Required capacity for CHF 20'000: 29 = 757.36; 30 = 734.36;
    // 31 = 712.86; 36 = 623.30; 37 = 608.31 (rounded up to cents).
    for (const [income, payments, band, capacity] of [
      ['4957.36', '29', 'go', 'CHF 757.36'],
      ['4934.36', '30', 'go', 'CHF 734.36'],
      ['4934.35', '31', 'optimise', 'CHF 734.35'],
      ['4912.86', '31', 'optimise', 'CHF 712.86'],
      ['4823.30', '36', 'optimise', 'CHF 623.30'],
      ['4823.29', '37 oder mehr', 'unaffordable', 'CHF 623.29'],
      ['4808.31', '37 oder mehr', 'unaffordable', 'CHF 608.31'],
      ['4300', 'Keine Rückzahlung möglich', 'unaffordable', 'CHF 100.00'],
      ['4200', 'Keine Rückzahlung möglich', 'unaffordable', 'CHF 0.00'],
      ['4100', 'Keine Rückzahlung möglich', 'unaffordable', 'CHF −100.00'],
    ]) {
      await setBudget({ ink: income, mehr: '0' });
      assert.equal(await text('#b-payments'), payments, income + ': payment count');
      assert.equal(await text('#b-capacity'), capacity);
      assert.equal(await page.locator('#estimate').getAttribute('data-band'), band);
      if (band === 'optimise') assert.match(await text('#est-status'), /Optimierung nötig/);
      if (band === 'unaffordable') assert.match(await text('#est-status'), /nicht tragbar/);
      await page.setViewportSize({ width: 320, height: 1000 });
      await noOverflow(income + ': narrow band result');
      await page.setViewportSize({ width: 1440, height: 1000 });
      if (income === '4823.30' || income === '4823.29') {
        await page.locator('#rechner').screenshot({ path: path.join(output, band + '.png'), style: '.header, .skip { visibility: hidden; }' });
        await page.locator('.step[data-step="2"] [data-consult]').click();
        assert.ok((await text('#consult-text')).includes('benötigte Zahlungen: ' + payments));
        assert.ok((await text('#consult-text')).includes(band === 'optimise' ? 'Optimierung nötig' : 'nicht tragbar'));
      }
    }
    await page.locator('.stepper [data-go="0"]').click();
    await page.locator('#betrag').fill('5000');
    await go(0, 1);
    await go(1, 2);
    assert.equal(await page.locator('#estimate').getAttribute('data-band'), 'unaffordable');
    await setBudget({ ink: '4900', mehr: '0' });
    assert.equal(await page.locator('#estimate').getAttribute('data-band'), 'go');
    await page.locator('.stepper [data-go="0"]').click();
    await page.locator('#betrag').fill('20000');
    await go(0, 1);
    await go(1, 2);
    assert.equal(await page.locator('#estimate').getAttribute('data-band'), 'optimise');
    checks.push('29/30/31/36/37 payment bands, one-cent boundaries, interest-only/zero/negative capacity, amount changes and summaries');
    await setBudget({ res: '0' });
    assert.equal(await page.locator('#estimate').getAttribute('data-state'), 'warn');
    await setBudget({ stabil: 'unsicher' });
    assert.equal(await page.locator('#estimate').getAttribute('data-state'), 'warn');
    await setBudget({ mehr: '0' });
    assert.match(await text('#budget-context'), /keine Mehrbelastung/);
    assert.equal(await page.locator('#estimate').getAttribute('data-state'), 'review');
    checks.push('Zero and negative buffers, missing reserve, unstable income and zero stress are distinguished');

    // Live edits must clear old numbers; invalid entries cannot become implicit zeros.
    for (const [id, value] of [['pflicht', ''], ['jahr', '-1'], ['ink', 'Infinity'], ['res', '12.345'], ['mehr', 'abc'], ['haushalt', '0'], ['haushalt', '1.5'], ['stabil', '']]) {
      await setBudget({ [id]: value });
      await step(1);
      assert.equal(await page.locator('#' + id).getAttribute('aria-invalid'), 'true', id + ': invalid value');
      assert.equal(await text('#b-frei'), '–', id + ': stale result');
      assert.equal(await text('#b-payments'), '–', id + ': stale payment count');
      assert.equal(await page.locator('#estimate').getAttribute('data-band'), null);
    }
    await page.locator('[data-consult]').first().click();
    assert.doesNotMatch(await text('#consult-text'), /Spielraum/);
    await setBudget({ ink: "6’000,50", jahr: '1201', res: '500.25' });
    assert.equal(await text('#b-ink'), "CHF 6'000.50");
    assert.equal(await text('#b-jahr'), 'CHF 100.08');
    assert.equal(await text('#b-frei'), "CHF 1'465.81");
    await go(2, 1);
    assert.equal(await page.locator('#ink').inputValue(), "6'000.5");
    assert.equal(await page.locator('#res').inputValue(), '500.25');
    checks.push('Invalid input clears stale results; Swiss grouping, decimal comma and fractional annual shares work');

    // Actual keyboard progression, state retention, responsive layout and captures.
    await setBudget({});
    for (const width of [1440, 900, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await noOverflow(`${width}px result`);
      await page.locator('#rechner').screenshot({ path: path.join(output, `result-${width}.png`), style: '.header, .skip { visibility: hidden; }' });
      await go(2, 1);
      await noOverflow(`${width}px budget`);
      assert.equal(await page.locator('#pflicht').inputValue(), '200');
      await page.locator('#rechner').screenshot({ path: path.join(output, `budget-${width}.png`), style: '.header, .skip { visibility: hidden; }' });
      await page.locator('#stabil').focus();
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.textContent), 'Meinen Spielraum ansehen');
      await page.keyboard.press('Enter');
      await step(2);
      assert.equal(await page.evaluate(() => document.activeElement.id), 's3-title');
      await go(2, 1);
      await go(1, 0);
      await noOverflow(`${width}px credit`);
      await go(0, 1);
      await go(1, 2);
    }
    checks.push('All three steps at 1440/900/390/320px, keyboard progression and back-navigation preserve inputs');

    await page.setViewportSize({ width: 1280, height: 1000 });
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    await noOverflow('200% text');
    assert.equal(await page.locator('.step[data-step="2"] .actions .btn').evaluateAll(elements => elements.every(el => el.scrollHeight <= el.clientHeight)), true, '200% text: clipped action labels');
    await page.locator('#rechner').screenshot({ path: path.join(output, 'result-text-200.png'), style: '.header, .skip { visibility: hidden; }' });
    checks.push('200% text remains within the calculator and page');
    assert.deepEqual(errors, [], 'Browser runtime errors');
    assert.deepEqual(externalRequests, [], 'Calculator must not send data to external services');
    const report = { checks, runtimeErrors: errors, externalRequests, evidence: output };
    await fs.writeFile(path.join(output, 'checks.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
