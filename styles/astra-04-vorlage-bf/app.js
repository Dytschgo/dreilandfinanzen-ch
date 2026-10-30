'use strict';
// Annuity with the monthly equivalent of an effective annual example rate.
const annualRate = 0.089;
const monthlyInterest = Math.pow(1 + annualRate, 1 / 12) - 1;
const amount = document.querySelector('#amount');
const slider = document.querySelector('#amount-slider');
const term = document.querySelector('#term');
const monthlyOutput = document.querySelector('#monthly');
const amountError = document.querySelector('#amount-error');
const income = document.querySelector('#income');
const expenses = document.querySelector('#expenses');
const budgetResult = document.querySelector('#budget-result');
const money = number => 'CHF ' + number.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replaceAll('’', "'");
const integer = number => number.toLocaleString('de-CH').replaceAll('’', "'");
let principal = 15000;
let payment = 0;

function updateBudget() {
  budgetResult.dataset.state = 'neutral';
  if (income.value === '' || expenses.value === '') {
    budgetResult.textContent = 'Einkommen und Ausgaben ergänzen.';
    return;
  }
  if (!income.validity.valid || !expenses.validity.valid) {
    budgetResult.textContent = 'Bitte gültige Beträge ab CHF 0 eingeben.';
    budgetResult.dataset.state = 'danger';
    return;
  }
  const available = Number(income.value) - Number(expenses.value) - payment;
  if (available <= 0) {
    budgetResult.dataset.state = 'danger';
    budgetResult.textContent = 'Kein Spielraum: Die Beispielrate übersteigt oder verbraucht Ihr verfügbares Budget.';
  } else {
    budgetResult.dataset.state = available < payment ? 'warning' : 'neutral';
    budgetResult.textContent = (available < payment ? 'Knapp: ' : 'Rechnerischer Rest: ') + money(available) + ' / Monat nach der Beispielrate. Reserven und Tragbarkeit persönlich prüfen.';
  }
}

function calculate() {
  const months = Number(term.value);
  payment = principal * monthlyInterest / (1 - Math.pow(1 + monthlyInterest, -months));
  const total = payment * months;
  const interest = total - principal;
  monthlyOutput.textContent = money(payment);
  document.querySelector('#principal').textContent = money(principal);
  document.querySelector('#interest').textContent = money(interest);
  document.querySelector('#total').textContent = money(total);
  document.querySelector('#principal-bar').style.width = `${principal / total * 100}%`;
  document.querySelector('#interest-bar').style.width = `${interest / total * 100}%`;
  document.querySelector('.repayment-bar').setAttribute('aria-label', `Rückzahlung: ${money(principal)} Kreditbetrag und ${money(interest)} Zinskosten, insgesamt ${money(total)}.`);
  slider.style.setProperty('--progress', `${(principal - Number(slider.min)) / (Number(slider.max) - Number(slider.min)) * 100}%`);
  slider.setAttribute('aria-valuetext', `CHF ${integer(principal)}`);
  updateBudget();
}

function clearError() {
  amountError.textContent = '';
  amount.removeAttribute('aria-invalid');
}

slider.addEventListener('input', () => {
  principal = Number(slider.value);
  amount.value = integer(principal);
  clearError();
  calculate();
});
amount.addEventListener('input', () => {
  const cleaned = amount.value.replace(/[’'\s]/g, '');
  const next = /^\d+$/.test(cleaned) ? Number(cleaned) : NaN;
  if (!Number.isFinite(next) || next < Number(slider.min) || next > Number(slider.max)) {
    amount.setAttribute('aria-invalid', 'true');
    amountError.textContent = "Bitte CHF 5'000 bis 100'000 eingeben. Die letzte gültige Rate bleibt angezeigt.";
    return;
  }
  principal = next;
  // Both controls retain the exact amount, including values between round hundreds.
  slider.value = String(next);
  clearError();
  calculate();
});
amount.addEventListener('blur', () => { if (!amount.hasAttribute('aria-invalid')) amount.value = integer(principal); });
term.addEventListener('change', calculate);
income.addEventListener('input', updateBudget);
expenses.addEventListener('input', updateBudget);
calculate();

const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu(restoreFocus = false) {
  mobileNav.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Menü öffnen');
  if (restoreFocus) menuToggle.focus();
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Menü schliessen' : 'Menü öffnen');
  mobileNav.hidden = !open;
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  closeMenu();
  const target = document.querySelector(link.getAttribute('href'));
  if (target) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobileNav.hidden) closeMenu(true);
});
document.addEventListener('click', event => {
  if (!event.target.closest('.header') && !mobileNav.hidden) closeMenu();
});
matchMedia('(min-width: 801px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

document.querySelector('#budget-link').addEventListener('click', () => {
  document.querySelector('#kosten').open = true;
  document.querySelector('.budget').open = true;
});
const contactDialog = document.querySelector('#contact-dialog');
document.querySelector('#contact-open').addEventListener('click', () => {
  document.querySelector('#selection-summary').textContent = `Ihr Beispiel: CHF ${integer(principal)}.– über ${term.value} Monate. Monatsrate ${money(payment)}.`;
  contactDialog.showModal();
});
contactDialog.querySelectorAll('.dialog-close, .dialog-done').forEach(button => button.addEventListener('click', () => contactDialog.close()));
contactDialog.addEventListener('click', event => {
  const rect = contactDialog.getBoundingClientRect();
  if (event.target === contactDialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) contactDialog.close();
});
