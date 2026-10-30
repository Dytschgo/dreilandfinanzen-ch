(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const fields = ['amount', 'months', 'income', 'expenses'].map($);
  const number = new Intl.NumberFormat('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const integer = new Intl.NumberFormat('de-CH', { maximumFractionDigits: 0 });
  const money = (n) => Number.isInteger(n) ? `${integer.format(n)}.–` : number.format(n);
  const chf = (n) => `CHF ${money(n)}`;
  let announceTimer;

  function calculate() {
    const [principal, months, income, expenses] = fields.map((field) => Number(field.value));
    const valid = fields.every((field) => field.value !== '' && field.validity.valid && Number.isFinite(Number(field.value)));
    $('input-error').hidden = valid;
    fields.slice(2).forEach((field) => field.setAttribute('aria-invalid', String(!field.validity.valid || field.value === '')));
    for (const field of fields.slice(0, 2)) {
      const fill = (Number(field.value) - Number(field.min)) / (Number(field.max) - Number(field.min)) * 100;
      field.style.setProperty('--fill', `${fill}%`);
    }
    $('amount-value').textContent = chf(principal);
    $('months-value').textContent = `${months} Monate`;
    $('amount').setAttribute('aria-valuetext', chf(principal));
    $('months').setAttribute('aria-valuetext', `${months} Monate`);
    if (!valid) {
      ['monthly', 'total', 'interest', 'expenses-result', 'rate-result', 'room-result'].forEach((id) => $(id).textContent = '—');
      $('budget-result').style.setProperty('--expenses', '0%');
      $('budget-result').style.setProperty('--credit', '0%');
      $('budget-result').style.setProperty('--room', '0%');
      $('budget-bar').setAttribute('aria-label', 'Bitte gültige Budgetwerte eingeben.');
      setStatus('yellow', 'Angaben vervollständigen.', 'Mit gültigen Beträgen lässt sich Ihr Beispielbudget berechnen.');
      return;
    }
    // Convert the example effective annual rate into an equivalent monthly rate.
    const rate = Math.pow(1.089, 1 / 12) - 1;
    const payment = principal * rate / (1 - Math.pow(1 + rate, -months));
    const total = payment * months;
    const room = income - expenses - payment;
    const share = income > 0 ? room / income : -1;
    $('monthly').textContent = number.format(payment);
    $('total').textContent = `CHF ${number.format(total)}`;
    $('interest').textContent = `CHF ${number.format(total - principal)}`;
    $('expenses-result').textContent = money(expenses);
    $('rate-result').textContent = number.format(payment);
    $('room-result').textContent = money(Math.round(room * 100) / 100);
    // If spending exceeds income, scale to obligations rather than overflowing the chart.
    const scale = Math.max(income, expenses + payment, 1);
    $('budget-result').style.setProperty('--expenses', `${expenses / scale * 100}%`);
    $('budget-result').style.setProperty('--credit', `${payment / scale * 100}%`);
    $('budget-result').style.setProperty('--room', `${Math.max(0, room) / scale * 100}%`);
    $('budget-bar').setAttribute('aria-label', `Monatliches Einkommen ${chf(income)}. Ausgaben ${chf(expenses)}, Kreditrate CHF ${number.format(payment)}, verbleibend CHF ${number.format(room)}.`);
    const percentage = Math.round(share * 100);
    if (income <= 0 || share < .1 || payment / income > .25) {
      setStatus('red', room < 0 ? 'Die Rechnung geht nicht auf.' : 'Zu wenig Luft im Budget.', room < 0 ? `Im Beispiel fehlen CHF ${number.format(-room)} pro Monat. Ein Kredit würde Ihr Budget zusätzlich belasten.` : `Es bleibt wenig Spielraum oder die Rate ist im Verhältnis zu hoch. Prüfen Sie einen kleineren Betrag oder einen Verzicht.`);
    } else if (share < .2 || payment / income > .15) {
      setStatus('yellow', 'Genauer hinsehen.', `Im Beispiel bleiben ${percentage} % Ihres Einkommens. Prüfen Sie Reserven und unerwartete Ausgaben besonders sorgfältig.`);
    } else {
      setStatus('green', 'Spielraum vorhanden.', `Im Beispiel bleiben ${percentage} % Ihres Einkommens. Das ist eine erste Orientierung, keine Kreditzusage.`);
    }
  }
  function setStatus(state, title, copy) {
    // Debounce live-region changes when a slider is moved continuously.
    clearTimeout(announceTimer);
    announceTimer = setTimeout(() => {
      $('traffic').dataset.state = state;
      $('traffic-title').textContent = title;
      $('traffic-copy').textContent = copy;
    }, 180);
  }
  $('budget-form').addEventListener('input', calculate);
  $('budget-form').addEventListener('submit', (event) => event.preventDefault());
  calculate();

  $('contact-form').addEventListener('submit', (event) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    const status = $('contact-status');
    status.hidden = false;
    status.textContent = `Gesprächsvorschau für ${$('name').value.trim()}: «${$('topic').value}». Ihre E-Mail-Adresse: ${$('email').value.trim()}. Dies ist eine lokale Vorschau. Es wurde keine Anfrage versendet und kein Termin gebucht. Die echten Kontaktangaben werden vor Veröffentlichung ergänzt.`;
  });
})();
