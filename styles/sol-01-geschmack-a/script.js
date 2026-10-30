'use strict';

const byId = (id) => document.getElementById(id);
const amount = byId('amount');
const months = byId('months');
const income = byId('income');
const expenses = byId('expenses');
const outlook = document.querySelector('.budget-outlook');
const chf = (value, decimals = 2) => `CHF ${new Intl.NumberFormat('de-CH', {minimumFractionDigits: decimals, maximumFractionDigits: decimals}).format(value).replaceAll('’', "'")}${decimals ? '' : '.–'}`;
const monthlyInterest = Math.pow(1.089, 1 / 12) - 1;

function calculate() {
  const principal = Number(amount.value);
  const duration = Number(months.value);
  const payment = principal * monthlyInterest / (1 - Math.pow(1 + monthlyInterest, -duration));
  const earnings = income.value === '' ? NaN : Number(income.value);
  const costs = expenses.value === '' ? NaN : Number(expenses.value);
  const valid = Number.isFinite(earnings) && Number.isFinite(costs) && income.validity.valid && expenses.validity.valid;
  const remaining = earnings - costs - payment;

  byId('amount-label').textContent = chf(principal, 0);
  byId('months-label').textContent = `${duration} Monate`;
  byId('payment').textContent = chf(payment).replace('CHF ', '');
  for (const slider of [amount, months]) {
    slider.style.setProperty('--progress', `${(slider.value - slider.min) / (slider.max - slider.min) * 100}%`);
  }

  let state, title, copy;
  if (!valid) {
    state = 'invalid'; title = 'Bitte prüfen Sie Ihre Angaben';
    copy = 'Tragen Sie für Einkommen und Ausgaben jeweils einen Betrag zwischen CHF 0 und CHF 1’000’000 ein.';
  } else if (remaining <= 0) {
    state = 'danger'; title = 'Kein ausreichender Spielraum';
    copy = `Ausgaben und Rate ${remaining < 0 ? `übersteigen Ihr Einkommen um ${chf(-remaining)}` : 'brauchen Ihr gesamtes Einkommen auf'}. Ein Kredit ist in diesem Beispiel nicht sinnvoll.`;
  } else if (remaining < Math.max(500, earnings * .1)) {
    state = 'caution'; title = 'Ihr Spielraum ist knapp';
    copy = `Es bleiben rechnerisch ${chf(remaining)} pro Monat. Für Unvorhergesehenes könnte das zu wenig sein. Lassen Sie uns genauer hinschauen.`;
  } else {
    state = 'room'; title = 'Spielraum vorhanden';
    copy = `Nach Ausgaben und Rate bleiben Ihnen rechnerisch ${chf(remaining)} pro Monat. Denken Sie auch an Rücklagen für Unvorhergesehenes.`;
  }
  outlook.dataset.state = state;
  byId('status-title').textContent = title;
  byId('status-copy').textContent = copy;
  const denominator = valid ? Math.max(earnings, costs + payment, 1) : 1;
  const shares = valid ? [costs, payment, Math.max(remaining, 0)] : [0, 0, 0];
  ['bar-expenses', 'bar-payment', 'bar-rest'].forEach((id, index) => { byId(id).style.inlineSize = `${shares[index] / denominator * 100}%`; });
  document.querySelector('.budget-bar').setAttribute('aria-label', valid ? `Monatliches Budget: Ausgaben ${chf(costs)}, Kreditrate ${chf(payment)}, verbleibender Spielraum ${chf(Math.max(remaining, 0))}.` : 'Budgetaufteilung nicht verfügbar. Bitte Angaben prüfen.');
}
for (const field of [amount, months, income, expenses]) field.addEventListener('input', calculate);
byId('budget-form').addEventListener('submit', (event) => event.preventDefault());
calculate();

let conversationNote = '';
byId('contact-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const fields = new FormData(form);
  conversationNote = [
    'Dreiland Finanzen — persönliche Gesprächsnotiz', '',
    `Name: ${fields.get('name')}`, `E-Mail: ${fields.get('email')}`,
    `Thema: ${fields.get('topic')}`, `Gespräch: ${fields.get('meeting')}`, '',
    `Beispiel: ${chf(Number(amount.value), 0)} über ${months.value} Monate.`,
    `Beispielrate: ${chf(Number(byId('payment').textContent.replaceAll("'", '')))} bei 8.9 % effektivem Jahreszins (Platzhalter).`, '',
    'Design-Demo: Diese Notiz wurde nur lokal erstellt. Es wurde keine Anfrage versendet und kein Termin gebucht.',
    'Die Kreditvergabe ist verboten, falls sie zur Überschuldung führt (Art. 3 UWG).'
  ].join('\n');
  byId('contact-result').textContent = 'Ihre Gesprächsnotiz ist bereit. Sie können sie für sich herunterladen. In dieser Design-Demo wurde keine Anfrage versendet und kein Termin gebucht.';
  byId('contact-result').hidden = false;
  byId('download-note').hidden = false;
});
byId('contact-form').addEventListener('input', () => {
  byId('contact-result').hidden = true;
  byId('download-note').hidden = true;
  conversationNote = '';
});
byId('download-note').addEventListener('click', () => {
  if (!conversationNote) return;
  const url = URL.createObjectURL(new Blob([conversationNote], {type: 'text/plain;charset=utf-8'}));
  const link = document.createElement('a');
  link.href = url; link.download = 'dreiland-finanzen-gespraechsnotiz.txt';
  document.body.append(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
});
