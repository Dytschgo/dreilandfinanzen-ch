(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const form = $('budget-form');
  const steps = [...document.querySelectorAll('.question-step')];
  const stepItems = [...document.querySelectorAll('.steps li')];
  const controls = ['hero-amount', 'hero-months', 'income', 'costs', 'reserve'].map($);
  let currentStep = 0;
  const currency = (value) => {
    const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
    const formatted = Math.abs(rounded).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replaceAll(',', "'");
    return `${rounded < 0 ? '−' : ''}CHF ${formatted.endsWith('.00') ? formatted.slice(0, -3) + '.–' : formatted}`;
  };
  const write = (id, text) => { $(id).textContent = text; };
  const clearErrors = () => {
    $('form-error').hidden = true;
    controls.forEach((input) => { input.removeAttribute('aria-invalid'); input.removeAttribute('aria-errormessage'); });
  };
  const validate = (step) => {
    const fields = [...steps[step].querySelectorAll('input[type="number"], select')];
    const invalid = fields.find((input) => !input.checkValidity() || !Number.isFinite(Number(input.value)));
    if (!invalid) return true;
    invalid.setAttribute('aria-invalid', 'true');
    invalid.setAttribute('aria-errormessage', 'form-error');
    const label = document.querySelector(`label[for="${invalid.id}"]`).textContent.replace('CHF', '').trim();
    const message = invalid.validity.valueMissing || invalid.validity.badInput ? 'Bitte geben Sie eine gültige Zahl ein.' : `Bitte geben Sie einen Wert zwischen ${currency(Number(invalid.min))} und ${currency(Number(invalid.max))} ein${invalid.id === 'amount' ? ' (in Schritten von CHF 100.–)' : ' (in ganzen Franken)'}.`;
    write('form-error', `${label}: ${message}`);
    $('form-error').hidden = false;
    invalid.focus();
    return false;
  };
  const calculate = () => {
    const invalid = controls.some((input) => !input.checkValidity());
    if (invalid) return null;
    const [amount, months, income, costs, reserve] = controls.map((input) => Number(input.value));
    const monthlyRate = Math.pow(1.089, 1 / 12) - 1;
    const payment = amount * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months));
    const remaining = income - costs - reserve - payment;
    write('hero-monthly', currency(payment));
    write('hero-amount-text', currency(amount));
    const status = remaining <= 0 ? 'red' : remaining < income * .05 ? 'amber' : 'green';
    const labels = { green: 'GRÜN · RECHNERISCHER SPIELRAUM', amber: 'GELB · WENIG SPIELRAUM', red: 'ROT · KEIN SPIELRAUM' };
    const titles = { green: 'Da bleibt noch Luft im Alltag.', amber: 'Das wird ziemlich eng.', red: 'Hier ist ein Nein die bessere Antwort.' };
    const copy = {
      green: `Nach Ausgaben, Rücklage und Rate bleiben ${currency(remaining)} pro Monat. Keine Kreditzusage.`,
      amber: `Es bleiben ${currency(remaining)} pro Monat. Schon kleine Ausgaben können zu viel werden.`,
      red: remaining < 0 ? `Monatlich fehlen ${currency(-remaining)}. Ein zusätzlicher Kredit passt hier nicht.` : 'Es bleibt kein zusätzlicher Spielraum. Prüfen Sie andere Wege.'
    };
    $('assessment').dataset.status = status;
    write('status-label', labels[status]);
    write('result-title', titles[status]);
    write('result-copy', copy[status]);
    const denominator = Math.max(income, costs + reserve + payment);
    [costs, reserve, payment, Math.max(0, remaining)].forEach((value, i) => {
      const segment = document.querySelector('.budget-bar').children[i];
      segment.style.flexBasis = `${value / denominator * 100}%`;
      segment.style.display = value > 0 ? '' : 'none';
    });
    return { payment, remaining, status, labels };
  };
  const showStep = (index, focus = true) => {
    currentStep = index;
    $('no-credit').hidden = true;
    steps.forEach((step, i) => { step.hidden = i !== index; });
    stepItems.forEach((item, i) => { if (i === index) item.setAttribute('aria-current', 'step'); else item.removeAttribute('aria-current'); });
    document.querySelector('.steps').hidden = false;
    const result = calculate();
    if (index === 2 && result) write('calc-status', `${result.labels[result.status]}. Monatliche Beispielrate ${currency(result.payment)}. Verbleibend ${currency(result.remaining)}.`);
    if (focus) steps[index].querySelector('h3').focus({ preventScroll: true });
    if (focus) document.querySelector('.dialogue').scrollIntoView({ block: 'start', behavior: 'instant' });
  };
  document.querySelectorAll('[data-back]').forEach((button) => button.addEventListener('click', () => { clearErrors(); showStep(Number(button.dataset.back)); }));
  document.querySelectorAll('[data-no-credit]').forEach((button) => button.addEventListener('click', () => {
    clearErrors();
    steps.forEach((step) => { step.hidden = true; });
    $('no-credit').hidden = false;
    document.querySelector('.steps').hidden = true;
    $('no-title').focus({ preventScroll: true });
    document.querySelector('.dialogue').scrollIntoView({ block: 'start', behavior: 'instant' });
    write('calc-status', 'Sie haben sich für den Weg ohne Kredit entschieden.');
  }));
  form.addEventListener('input', (event) => {
    event.target.removeAttribute('aria-invalid');
    $('form-error').hidden = true;
    calculate();
  });
  form.addEventListener('change', calculate);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearErrors();
    if (currentStep < 2 && validate(currentStep)) showStep(currentStep + 1);
  });
  $('hero-amount').addEventListener('input', calculate);
  $('hero-months').addEventListener('change', calculate);
  // Real fragment links still work without JavaScript. Enhance them by opening disclosures.
  const openDisclosure = () => {
    const target = document.getElementById(location.hash.slice(1));
    if (target?.tagName === 'DETAILS') target.open = true;
  };
  document.querySelectorAll('a[href="#termin"], a[href="#datenschutz"], a[href="#impressum"]').forEach((link) => link.addEventListener('click', () => {
    const target = document.querySelector(link.getAttribute('href'));
    target.open = true;
    target.querySelector('summary').focus({ preventScroll: true });
  }));
  window.addEventListener('hashchange', openDisclosure);
  document.documentElement.classList.add('enhanced');
  showStep(0, false);
  openDisclosure();
})();
