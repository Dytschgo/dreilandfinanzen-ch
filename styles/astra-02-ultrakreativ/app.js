'use strict';

// The map is decorative SVG. Its controls and explanations remain real HTML.
const atlas = document.querySelector('.atlas');
const countryButtons = [...document.querySelectorAll('.country-buttons button')];
const atlasToggle = document.querySelector('.atlas-toggle');
const atlasCaption = document.querySelector('.atlas-caption');
const countryCopy = {
  all: 'Drei Perspektiven. Ein gemeinsamer Mittelpunkt.',
  fr: 'Frankreich. Eine Perspektive unserer gemeinsamen Region.',
  de: 'Deutschland. Eine Perspektive unserer gemeinsamen Region.',
  ch: 'Die Schweiz. Unser Ausgangspunkt in der Region Basel.'
};
document.querySelector('.atlas-controls').hidden = false;
countryButtons.forEach(button => button.addEventListener('click', () => {
  const next = atlas.dataset.country === button.dataset.country ? 'all' : button.dataset.country;
  atlas.dataset.country = next;
  countryButtons.forEach(item => item.setAttribute('aria-pressed', String(item.dataset.country === next)));
  atlasCaption.textContent = countryCopy[next];
}));
atlasToggle.addEventListener('click', () => {
  const apart = atlas.dataset.mode !== 'apart';
  atlas.dataset.mode = apart ? 'apart' : 'together';
  atlasToggle.setAttribute('aria-pressed', String(apart));
  atlasToggle.innerHTML = apart ? '<span aria-hidden="true">⤡</span> Flächen zusammenführen' : '<span aria-hidden="true">⤢</span> Flächen erkunden';
  atlas.dataset.country = 'all';
  countryButtons.forEach(button => button.setAttribute('aria-pressed', 'false'));
  atlasCaption.textContent = apart ? 'Grenzen werden sichtbar. Die Verbindung bleibt.' : countryCopy.all;
});

const currency = value => 'CHF ' + Math.abs(value).toLocaleString('de-CH', {minimumFractionDigits:2, maximumFractionDigits:2}).replaceAll('’', "'");
const amount = document.querySelector('#amount');
const range = document.querySelector('#amount-range');
const months = document.querySelector('#months');
const income = document.querySelector('#income');
const expenses = document.querySelector('#expenses');
const statusBox = document.querySelector('.status-box');
const statusTitle = document.querySelector('#status-title');
const statusCopy = document.querySelector('#status-copy');
const error = document.querySelector('#input-error');
const monthlyOutput = document.querySelector('#monthly');
const amountDisplay = document.querySelector('#amount-display');
const annualRate = .089;
const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;
let announcement;
document.querySelector('#budget-fields').disabled = false;

function calculate(announceImmediately = false) {
  clearTimeout(announcement);
  const valid = [amount, income, expenses].every(input => input.value !== '' && input.validity.valid);
  [amount, income, expenses].forEach(input => input.setAttribute('aria-invalid', String(input.value === '' || !input.validity.valid)));
  error.hidden = valid;
  if (!valid) {
    monthlyOutput.value = '—';
    document.querySelector('#total').textContent = '—';
    document.querySelector('#interest').textContent = '—';
    statusBox.dataset.status = 'amber';
    statusTitle.textContent = 'Bitte Eingaben prüfen';
    statusCopy.textContent = 'Für eine neue Einschätzung brauchen wir gültige Werte in allen Feldern.';
    const riverFill = document.querySelector('.river-fill');
    if (riverFill) riverFill.style.strokeDashoffset = '100';
    return;
  }
  const principal = Number(amount.value);
  amountDisplay.textContent = 'CHF ' + principal.toLocaleString('de-CH').replaceAll('’', "'") + '.–';
  const term = Number(months.value);
  const net = Number(income.value);
  const costs = Number(expenses.value);
  const payment = principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -term));
  const total = payment * term;
  const remaining = net - costs - payment - 600;
  const status = remaining <= 0 ? 'red' : remaining < net * .1 ? 'amber' : 'green';
  const titles = {green: 'Rechnerisch Spielraum', amber: 'Puffer genauer anschauen', red: 'Die Belastung ist zu hoch'};
  monthlyOutput.value = payment.toLocaleString('de-CH', {minimumFractionDigits: 2, maximumFractionDigits: 2}).replaceAll('’', "'");
  document.querySelector('#total').textContent = currency(total);
  document.querySelector('#interest').textContent = currency(total - principal);
  const updateStatus = () => {
    statusBox.dataset.status = status;
    statusTitle.textContent = titles[status];
    statusCopy.textContent = remaining <= 0
      ? `Nach Ausgaben, Rate und CHF 600.– Reserve ${remaining < 0 ? 'fehlen ' + currency(remaining) : 'bleibt kein Spielraum'} pro Monat. Ein kleinerer oder kein Kredit kann der bessere Weg sein.`
      : `Nach Ausgaben, Rate und CHF 600.– Reserve bleiben ${currency(remaining)} pro Monat. ${status === 'green' ? 'Eine persönliche Prüfung bleibt erforderlich.' : 'Schauen wir gemeinsam genauer hin.'}`;
  };
  if (announceImmediately) updateStatus();
  else announcement = setTimeout(updateStatus, 180);
  const fraction = Math.max(0, Math.min(1, remaining / Math.max(net, 1)));
  const riverFill = document.querySelector('.river-fill');
  if (riverFill) riverFill.style.strokeDashoffset = String(100 * (1 - fraction));
}

range.addEventListener('input', () => { amount.value = range.value; calculate(); });
amount.addEventListener('input', () => { if (amount.validity.valid && amount.value !== '') range.value = amount.value; calculate(); });
[months, income, expenses].forEach(input => input.addEventListener('input', () => calculate()));
document.querySelector('#budget-form').addEventListener('submit', event => { event.preventDefault(); calculate(true); });
calculate(true);

// This deliberately prepares a local note. It never pretends to book a meeting.
let noteUrl;
document.querySelector('#contact-fields').disabled = false;
document.querySelector('#contact-form').addEventListener('submit', event => {
  event.preventDefault();
  const topic = document.querySelector('#topic').value;
  const meeting = document.querySelector('input[name=meeting]:checked').value;
  const note = `DREILAND FINANZEN — GESPRÄCHSNOTIZ\n\nMein Thema: ${topic}\nGewünschte Gesprächsform: ${meeting}\n\nMeine Fragen:\n\n\nDiese Notiz wurde lokal in der Designvorschau erstellt.\nEs wurde kein Termin gebucht und nichts übermittelt.\nKontaktangaben werden vor Veröffentlichung ergänzt.\n`;
  if (noteUrl) URL.revokeObjectURL(noteUrl);
  noteUrl = URL.createObjectURL(new Blob(['\uFEFF', note], {type:'text/plain;charset=utf-8'}));
  document.querySelector('#download-note').href = noteUrl;
  document.querySelector('#contact-result').hidden = false;
});
window.addEventListener('pagehide', () => { if (noteUrl) URL.revokeObjectURL(noteUrl); });

document.querySelector('a[href="#rechtliches"]').addEventListener('click', () => {
  document.querySelector('#rechtliches').open = true;
});
