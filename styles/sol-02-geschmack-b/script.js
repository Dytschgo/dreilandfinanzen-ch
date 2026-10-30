'use strict';
const amount = document.getElementById('amount');
const term = document.getElementById('term');
const income = document.getElementById('income');
const expenses = document.getElementById('expenses');
const chf = (value, decimals = 2) => {
  const parts = Math.abs(value).toFixed(decimals).split('.');
  const whole = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  const fraction = decimals === 0 || parts[1] === '00' ? '.–' : `.${parts[1]}`;
  return `${value < 0 ? '−' : ''}CHF ${whole}${fraction}`;
};
function calculate() {
  const principal = Number(amount.value);
  const months = Number(term.value);
  const monthlyInterest = Math.pow(1.089, 1 / 12) - 1;
  const payment = principal * monthlyInterest / (1 - Math.pow(1 + monthlyInterest, -months));
  const roundedPayment = Math.round(payment * 100) / 100;
  const total = payment * months;
  document.getElementById('amount-label').textContent = chf(principal, 0);
  amount.style.setProperty('--range-fill', `${(principal - 1000) / 79000 * 100}%`);
  document.getElementById('monthly').textContent = roundedPayment.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  document.getElementById('total').textContent = chf(total);
  document.getElementById('interest').textContent = chf(total - principal);
  const status = document.getElementById('affordability');
  const title = document.getElementById('status-title');
  const description = document.getElementById('status-description');
  const validBudget = income.value !== '' && expenses.value !== '' && income.validity.valid && expenses.validity.valid;
  if (!validBudget) {
    document.getElementById('reserve').textContent = 'Noch offen';
    status.dataset.state = 'warning';
    title.textContent = 'Budgetangaben prüfen';
    description.textContent = 'Bitte geben Sie Einkommen und Ausgaben zwischen CHF 0.– und CHF 1\'000\'000.– ein.';
    return;
  }
  const net = Number(income.value);
  const costs = Number(expenses.value);
  const reserve = net * .15;
  const remaining = net - costs - roundedPayment - reserve;
  document.getElementById('reserve').textContent = chf(reserve);
  if (remaining < 0) {
    status.dataset.state = 'danger';
    title.textContent = 'So wird es zu eng';
    description.textContent = `Nach Ausgaben, Beispielrate und Reserve fehlen ${chf(-remaining)} pro Monat. Prüfen Sie einen kleineren Betrag oder verzichten Sie auf den Kredit.`;
  } else if (remaining < net * .05 || net === 0) {
    status.dataset.state = 'warning';
    title.textContent = 'Wenig Spielraum';
    description.textContent = `Nach Ausgaben, Beispielrate und Reserve bleiben ${chf(remaining)} pro Monat. Wir empfehlen, Ihr Budget genauer zu prüfen.`;
  } else {
    status.dataset.state = 'good';
    title.textContent = 'Spielraum vorhanden';
    description.textContent = `Nach Ausgaben, Beispielrate und Reserve bleiben ${chf(remaining)} pro Monat. Das ersetzt keine persönliche Prüfung.`;
  }
}
document.getElementById('calculator-form').addEventListener('input', calculate);
document.getElementById('calculator-form').addEventListener('submit', event => event.preventDefault());
calculate();

const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.getElementById('mobile-nav');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  mobileNav.hidden = true;
  menuButton.querySelector('span').textContent = '+';
}
menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  mobileNav.hidden = isOpen;
  menuButton.querySelector('span').textContent = isOpen ? '+' : '−';
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobileNav.hidden) {
    closeMenu();
    menuButton.focus();
  }
});
window.matchMedia('(min-width: 46.01rem)').addEventListener('change', event => { if (event.matches) closeMenu(); });

document.querySelectorAll('[data-open]').forEach(button => {
  button.addEventListener('click', () => document.getElementById(button.dataset.open).showModal());
});
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) {
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.x || event.clientX > bounds.right || event.clientY < bounds.y || event.clientY > bounds.bottom) dialog.close();
    }
  });
});
document.getElementById('contact-form').addEventListener('submit', event => {
  event.preventDefault();
  const topic = document.getElementById('topic').value;
  const channel = document.getElementById('channel').value;
  const message = document.getElementById('message').value.trim();
  const note = `Dreiland Finanzen — Meine Gesprächsnotiz\n\nThema: ${topic}\nBeratung: ${channel}\n\nMein Anliegen:\n${message || 'Noch offen'}\n\nMeine Beispielrechnung:\nBetrag: ${chf(Number(amount.value), 0)}\nLaufzeit: ${term.value} Monate\nMonatliche Beispielrate: CHF ${document.getElementById('monthly').textContent}\nBeispielzins: 8,9 % effektiv pro Jahr. Kein Angebot oder Kreditzusage.\n\nDiese Notiz wurde lokal erstellt. Es wurde keine Anfrage übermittelt.\nDie Kreditvergabe ist verboten, falls sie zur Überschuldung führt (Art. 3 UWG).\n`;
  const url = URL.createObjectURL(new Blob(['\uFEFF', note], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'dreiland-meine-gespraechsnotiz.txt';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  document.getElementById('contact-status').textContent = 'Ihre Gesprächsnotiz wurde zum Download bereitgestellt. Es wurde keine Anfrage versendet.';
});
document.getElementById('year').textContent = new Date().getFullYear();
