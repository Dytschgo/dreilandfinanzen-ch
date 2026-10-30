(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const money = (value, decimals = 2) => {
    const fixed = Math.abs(value).toFixed(decimals).split('.');
    const whole = fixed[0].replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    return `${value < 0 ? '−' : ''}CHF ${whole}${decimals ? '.' + fixed[1] : '.–'}`;
  };
  const form = $('#budget-form');
  const amount = $('#amount');
  const duration = $('#duration');
  const income = $('#income');
  const expenses = $('#expenses');
  const status = $('.budget-status');
  let announcementTimer;
  let latestBudget;

  function updateBudget(immediate = false) {
    clearTimeout(announcementTimer);
    for (const input of [amount, duration]) {
      const progress = (Number(input.value) - Number(input.min)) / (Number(input.max) - Number(input.min));
      input.style.setProperty('--fill', `${progress * 100}%`);
    }
    $('#amount-label').textContent = money(Number(amount.value), 0);
    $('#duration-label').textContent = `${duration.value} Monate`;
    amount.setAttribute('aria-valuetext', `${money(Number(amount.value), 0)} Schweizer Franken`);
    duration.setAttribute('aria-valuetext', `${duration.value} Monate`);
    const valid = income.validity.valid && expenses.validity.valid && income.value !== '' && expenses.value !== '';
    $('#budget-error').hidden = valid;
    income.setAttribute('aria-invalid', String(!income.validity.valid || income.value === ''));
    expenses.setAttribute('aria-invalid', String(!expenses.validity.valid || expenses.value === ''));
    if (!valid) {
      latestBudget = null;
      for (const key of ['monthly', 'interest', 'total']) $('#' + key).textContent = '—';
      $('#remaining').textContent = 'Bitte Eingaben prüfen';
      status.dataset.state = 'amber';
      $('.status-icon').textContent = '!';
      $('#status-title').textContent = 'Angaben unvollständig';
      $('#status-copy').textContent = 'Eine Einschätzung ist erst mit gültigen Angaben möglich.';
      $('.space-visual').style.visibility = 'hidden';
      return;
    }
    $('.space-visual').style.visibility = 'visible';
    const principal = Number(amount.value);
    const months = Number(duration.value);
    const net = Number(income.value);
    const costs = Number(expenses.value);
    const rate = Math.pow(1.089, 1 / 12) - 1;
    const monthly = principal * rate / (1 - Math.pow(1 + rate, -months));
    const total = monthly * months;
    const remaining = net - costs - monthly;
    const buffer = Math.max(500, net * .1);
    const state = remaining < 0 ? 'red' : remaining < buffer ? 'amber' : 'green';
    $('#monthly').textContent = money(monthly).replace('CHF ', '');
    $('#interest').textContent = money(total - principal);
    $('#total').textContent = money(total);
    $('#remaining').replaceChildren(document.createTextNode(money(remaining) + ' '));
    const unit = document.createElement('small');
    unit.textContent = '/ Monat';
    $('#remaining').append(unit);
    $('.space-fixed').style.flexGrow = String(costs);
    $('.space-loan').style.flexGrow = String(monthly);
    $('.space-free').style.flexGrow = String(Math.max(0, remaining));
    $('.space-free').style.display = remaining <= 0 ? 'none' : 'block';
    const states = {
      green: ['✓', 'Puffer vorhanden', `Im Beispiel bleiben mindestens ${money(buffer, 0)} Reserve. Das ersetzt keine persönliche Prüfung.`],
      amber: ['!', 'Wenig Spielraum', `Der Rest liegt unter der Beispielreserve von ${money(buffer, 0)}. Ein kleinerer oder kein Kredit kann sinnvoller sein.`],
      red: ['×', 'Die Belastung ist zu hoch', 'Die Ausgaben und die Beispielrate übersteigen Ihr Einkommen. So bleibt kein Spielraum. Lassen Sie uns einen Weg ohne zusätzliche Belastung besprechen.']
    };
    const announce = () => {
      status.dataset.state = state;
      $('.status-icon').textContent = states[state][0];
      $('#status-title').textContent = states[state][1];
      $('#status-copy').textContent = `Monatliche Rate ${money(monthly)}. Verbleibend ${money(remaining)}. ${states[state][2]}`;
    };
    if (immediate) announce(); else announcementTimer = setTimeout(announce, 180);
    latestBudget = { principal, months, monthly, total, remaining, state };
  }
  $('#budget-fields').disabled = false;
  form.addEventListener('input', () => updateBudget());
  form.addEventListener('submit', event => event.preventDefault());
  updateBudget(true);

  let note = '';
  $('#prepare-button').disabled = false;
  $('#conversation-form').addEventListener('submit', event => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const text = `Ihr Thema: ${values.get('topic')}. Gewünschte Gesprächsform: ${values.get('meeting')}. Halten Sie für das Gespräch einen Überblick über Ihr Einkommen, Ihre Ausgaben und bestehende Kredite bereit.`;
    $('#conversation-text').textContent = text;
    $('#conversation-result').hidden = false;
    $('#conversation-result').focus({ preventScroll: true });
    note = `DREILAND FINANZEN — GESPRÄCHSVORBEREITUNG\n\n${text}\n\n`;
    if (latestBudget) {
      const b = latestBudget;
      note += `Lokales Rechenbeispiel (keine Kreditanfrage):\nBetrag: ${money(b.principal, 0)}\nLaufzeit: ${b.months} Monate\nBeispielzins: 8.9 % effektiv p. a. (Platzhalter)\nMonatsrate: ${money(b.monthly)}\nGesamtrückzahlung: ${money(b.total)}\nVerbleibend nach angegebenen Ausgaben und Rate: ${money(b.remaining)} / Monat\n\n`;
    }
    note += 'Design-Prototyp. Es wurde kein Termin gebucht und keine Anfrage versendet. Kontaktangaben folgen vor Veröffentlichung.\nDie Kreditvergabe ist verboten, falls sie zur Überschuldung führt (Art. 3 UWG).';
  });
  $('#download-note').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([note], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Dreiland-Finanzen-Gespraechsnotiz.txt';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  });
})();
